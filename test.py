import json
import re

try:
    with open('js/data.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Strip the javascript assignment 'const products = ' and trailing ';'
    content = content.strip()
    if content.startswith('const products = '):
        content = content[len('const products = '):]
    if content.endswith(';'):
        content = content[:-1]

    # Convert JS object keys to JSON keys
    content = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', content)
    # Convert single quotes to double quotes for strings
    # This is rough but good enough to see if it parses
    json.loads(content)
    print("VALID!")
except Exception as e:
    print(f"INVALID: {e}")
