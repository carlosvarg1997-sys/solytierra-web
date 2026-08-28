import json

with open('lighthouse-landing.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

audits = d.get('audits', {})

# All metrics with values
print('=== ALL PERFORMANCE METRICS ===')
metric_ids = [
    'first-contentful-paint', 
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
    'interactive',
    'max-potential-fid',
    'server-response-time',
    'first-meaningful-paint',
    'time-to-first-byte'
]
for mid in metric_ids:
    a = audits.get(mid, {})
    dv = a.get('displayValue', 'N/A')
    score = a.get('score')
    score_str = f'{int(score*100)}' if score is not None else 'N/A'
    print(f'  [{score_str}] {mid}: {dv}')

# Check network requests timing
print('\n=== NETWORK REQUEST TIMING ===')
net_req = audits.get('network-requests', {})
items = net_req.get('details', {}).get('items', [])
for item in items[:15]:
    url = item.get('url', '')
    start = item.get('startTime', 0)
    end = item.get('endTime', 0)
    size = item.get('transferSize', 0)
    url_short = url.split('/')[-1] or url
    print(f'  {url_short[:40]:40} | start:{start:.0f}ms end:{end:.0f}ms | {size/1024:.1f}KB')

# Final layout shift / CLS details
print('\n=== OVERALL SCORING ===')
cats = d.get('categories', {})
perf = cats.get('performance', {})
print(f'  Performance score: {int(perf.get("score", 0)*100)}')
