const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'ahmedhelal9077/laced-store';

async function getDbSha() {
    const res = await fetch(https://api.github.com/repos/ + REPO + /contents/db.json, {
        headers: {
            'Authorization': 	oken  + GITHUB_TOKEN,
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
    if (GITHUB_TOKEN) {
        try {
            const { content } = await getDbSha();
            if (content[key] !== undefined) return content[key];
        } catch(e) {
            console.error('GitHub DB Get Error:', e);
        }
    }
    
    // Fallback to local file if GitHub is not configured or key not found
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
    if (!GITHUB_TOKEN) return false;
    try {
        const { sha, content } = await getDbSha();
        content[key] = value;
        
        const newContent = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
        const body = {
            message: Update  + key,
            content: newContent
        };
        if (sha) body.sha = sha;
        
        const res = await fetch(https://api.github.com/repos/ + REPO + /contents/db.json, {
            method: 'PUT',
            headers: {
                'Authorization': 	oken  + GITHUB_TOKEN,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-App'
            },
            body: JSON.stringify(body)
        });
        return res.ok;
    } catch (e) {
        console.error('GitHub DB Set Error:', e);
    }
    return false;
}

module.exports = { kvGet, kvSet };
