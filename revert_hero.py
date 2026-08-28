"""Revierte la imagen hero de base64 a src normal"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace data URI back to file path
old = r'src="data:image/webp;base64,[A-Za-z0-9+/=]+"'
new = 'src="assets/images/hero.webp"'

count = len(re.findall(old, html))
print(f"Found {count} base64 image(s)")

html_fixed = re.sub(old, new, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_fixed)

print("Reverted to file src.")
print(f"File size: {len(html_fixed)/1024:.1f}KB")
