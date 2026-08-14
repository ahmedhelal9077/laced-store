import os
import re

# Read index.html to extract the correct header
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Extract header
header_match = re.search(r'(<header>.*?</header>)', index_content, re.DOTALL)
if not header_match:
    print("Could not find <header> in index.html")
    exit(1)

header_html = header_match.group(1)

# Fix checkout.html
with open('checkout.html', 'r', encoding='utf-8') as f:
    checkout_content = f.read()

checkout_content = re.sub(r'<header>.*?</header>', header_html, checkout_content, flags=re.DOTALL)
with open('checkout.html', 'w', encoding='utf-8') as f:
    f.write(checkout_content)

# Fix contact.html
with open('contact.html', 'r', encoding='utf-8') as f:
    contact_content = f.read()

# contact.html has <nav class="navbar"> instead of <header>
contact_content = re.sub(r'<nav class="navbar">.*?</nav>', header_html, contact_content, flags=re.DOTALL)

# Add font-awesome to contact.html if missing
if 'font-awesome' not in contact_content:
    contact_content = contact_content.replace('<link rel="stylesheet" href="css/styles.css">', '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n  <link rel="stylesheet" href="css/styles.css">')

with open('contact.html', 'w', encoding='utf-8') as f:
    f.write(contact_content)

print("Headers fixed!")
