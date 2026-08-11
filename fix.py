import re
with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

def replacer(match):
    inner = match.group(1).replace('\"', '\'')
    return f'name: \"{inner}\", brand:'

text = re.sub(r'name:\s*\"(.*?)\",\s*brand:', replacer, text)

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(text)
