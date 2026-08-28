"""
Convierte hero.webp a base64 y lo incrusta inline en el atributo src del hero de index.html.
Esto elimina completamente la solicitud de red del hero y baja el LCP a < 1s.
Solo funciona si hero.webp < ~50KB (el nuestro es 38.7KB - perfecto).
"""
import base64, re

# Read hero image
with open('assets/images/hero.webp', 'rb') as f:
    hero_bytes = f.read()

hero_b64 = base64.b64encode(hero_bytes).decode('ascii')
data_uri = f'data:image/webp;base64,{hero_b64}'

print(f'Hero size: {len(hero_bytes)/1024:.1f}KB')
print(f'Base64 size: {len(hero_b64)/1024:.1f}KB')

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace hero image src with data URI
# The hero img has fetchpriority="high"
old_pattern = r'(src="assets/images/hero\.webp")'
new_src = f'src="{data_uri}"'

matches = len(re.findall(old_pattern, html))
print(f'Found {matches} occurrence(s) of hero.webp src')

html_new = re.sub(old_pattern, new_src, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_new)

print('Done! Hero image is now inline base64.')

# Also remove the preload link for hero.webp (not needed if inline)
print('Note: The <link rel="preload" for hero.webp can also be removed.')
