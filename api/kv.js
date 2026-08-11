const fs = require('fs');
const path = require('path');

async function kvGet(key, defaultFilePath) {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
            const res = await fetch(${process.env.KV_REST_API_URL}/get/, {
                headers: { Authorization: Bearer  }
            });
            const data = await res.json();
            if (data.result !== null) {
                try { return JSON.parse(data.result); } catch(e) { return data.result; }
            }
        } catch (e) {
            console.error('KV Get Error', e);
        }
    }
    
    // Fallback to local file if KV is not configured or key not found
    try {
        const p = path.join(process.cwd(), defaultFilePath);
        if (fs.existsSync(p)) {
            const content = fs.readFileSync(p, 'utf8');
            if (defaultFilePath.endsWith('.js')) {
                // Extract from const products = [...]
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
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
            const valStr = typeof value === 'string' ? value : JSON.stringify(value);
            await fetch(${process.env.KV_REST_API_URL}/set/, {
                method: 'POST',
                headers: { Authorization: Bearer  },
                body: valStr
            });
            return true;
        } catch (e) {
            console.error('KV Set Error', e);
        }
    }
    return false;
}

module.exports = { kvGet, kvSet };
