const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'ahmedhelal9077/laced-store';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function getDbSha() {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/db.json`, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Vercel-App'
        },
        cache: 'no-store'
    });
    if (!res.ok) {
        if (res.status === 404) return { sha: null, content: { settings: {}, orders: [], products: [] } };
        throw new Error('Failed to fetch db.json');
    }
    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { sha: data.sha, content: JSON.parse(content) };
}

async function kvGet(key, defaultFilePath) {
    // 1. Try Vercel KV (Upstash) first
    if (KV_URL && KV_TOKEN) {
        try {
            const res = await fetch(`${KV_URL}/get/${key}`, {
                headers: { 'Authorization': `Bearer ${KV_TOKEN}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.result !== null) {
                    try {
                        return JSON.parse(data.result);
                    } catch(e) {
                        return data.result;
                    }
                }
            }
        } catch(e) {
            console.error('Vercel KV Get Error:', e);
        }
    }

    // 2. Try GitHub DB
    if (GITHUB_TOKEN) {
        try {
            const { content } = await getDbSha();
            if (content[key] !== undefined) return content[key];
        } catch(e) {
            console.error('GitHub DB Get Error:', e);
        }
    }
    
    // 3. Fallback to local file
    try {
        const p = path.join(process.cwd(), defaultFilePath);
        if (fs.existsSync(p)) {
            const content = fs.readFileSync(p, 'utf8');
            if (defaultFilePath.endsWith('.js')) {
                const match = content.match(/const\s+products\s*=\s*(\[.*\])\s*;/s);
                if (match) return JSON.parse(match[1]);
            }
            return JSON.parse(content);
        }
    } catch(e) {
        console.error('File fallback error', e);
    }
    
    return null;
}

async function kvSet(key, value) {
    let success = false;
    
    // 1. Save to Vercel KV if available
    if (KV_URL && KV_TOKEN) {
        try {
            const val = typeof value === 'object' ? JSON.stringify(value) : value;
            const res = await fetch(`${KV_URL}/set/${key}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${KV_TOKEN}` },
                body: JSON.stringify(val) // Upstash expects JSON stringified body
            });
            if (res.ok) success = true;
        } catch (e) {
            console.error('Vercel KV Set Error:', e);
        }
    }

    // 2. Save to GitHub DB if available
    if (GITHUB_TOKEN) {
        try {
            const { sha, content } = await getDbSha();
            content[key] = value;
            
            const newContent = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
            const body = {
                message: `Update ${key}`,
                content: newContent
            };
            if (sha) body.sha = sha;
            
            const res = await fetch(`https://api.github.com/repos/${REPO}/contents/db.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Vercel-App'
                },
                body: JSON.stringify(body)
            });
            if (res.ok) success = true;
        } catch (e) {
            console.error('GitHub DB Set Error:', e);
        }
    }
    
    return success;
}

module.exports = { kvGet, kvSet };