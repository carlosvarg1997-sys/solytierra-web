import json

with open('lighthouse-landing.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

# LCP element
print('=== LCP ELEMENT ===')
phases = d['audits'].get('largest-contentful-paint-element', {})
items = phases.get('details', {}).get('items', [])
for item in items:
    node = item.get('node', {})
    label = node.get('nodeLabel', 'N/A')
    sel = node.get('selector', 'N/A')
    print(f'  Label: {label[:80]}')
    print(f'  Selector: {sel}')

# LCP lazy loaded warning
lcp_lazy = d['audits'].get('lcp-lazy-loaded', {})
print(f'\n=== LCP LAZY LOADED ===')
print(f'  Score: {lcp_lazy.get("score")}')
print(f'  Display: {lcp_lazy.get("displayValue")}')

# Render blocking detail
rb = d['audits'].get('render-blocking-insight', {})
items_rb = rb.get('details', {}).get('items', [])
print(f'\n=== RENDER BLOCKING NOW ===')
if items_rb:
    for item in items_rb:
        url = item.get('url', 'N/A')
        ms = item.get('wastedMs', 0)
        print(f'  {url} | {ms:.0f}ms wasted')
else:
    print('  None!')

# All low-scoring audits with weight
print('\n=== LOW SCORE AUDITS (weight>0, score<90) ===')
perf_refs = d.get('categories', {}).get('performance', {}).get('auditRefs', [])
for ref in perf_refs:
    audit_id = ref.get('id')
    weight = ref.get('weight', 0)
    if weight > 0:
        audit = d['audits'].get(audit_id, {})
        score = audit.get('score', 1)
        if score is not None and score < 0.9:
            dv = audit.get('displayValue', '')
            print(f'  [{int(score*100)}] {audit_id} (weight={weight}) = {dv}')
