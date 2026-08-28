import json

with open('lighthouse-landing.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

# Check render-blocking
rb = d['audits'].get('render-blocking-insight', {})
items = rb.get('details', {}).get('items', [])
print('=== RENDER BLOCKING ===')
for item in items:
    url = item.get('url', 'N/A')
    kb = item.get('totalBytes', 0) / 1024
    ms = item.get('wastedMs', 0)
    print(f'  {url} | {kb:.1f}KB | {ms:.0f}ms wasted')

# Check image delivery
print('\n=== IMAGE DELIVERY ===')
img = d['audits'].get('image-delivery-insight', {})
items = img.get('details', {}).get('items', [])
for item in items:
    url = item.get('url', 'N/A')
    kb = item.get('totalBytes', 0) / 1024
    print(f'  {url} | {kb:.1f}KB')

# Check LCP element
print('\n=== LCP ELEMENT ===')
lcp = d['audits'].get('largest-contentful-paint-element', {})
items = lcp.get('details', {}).get('items', [])
for item in items:
    node = item.get('node', {})
    print(f'  type: {node.get("type")}')
    print(f'  label: {node.get("nodeLabel")}')
    print(f'  selector: {node.get("selector")}')

# Check render-blocking resources (older audit)
print('\n=== RENDER BLOCKING RESOURCES (legacy) ===')
rb2 = d['audits'].get('render-blocking-resources', {})
items2 = rb2.get('details', {}).get('items', [])
for item in items2:
    url = item.get('url', 'N/A')
    ms = item.get('wastedMs', 0)
    kb = item.get('totalBytes', 0) / 1024
    print(f'  {url} | {kb:.1f}KB | {ms:.0f}ms wasted')
