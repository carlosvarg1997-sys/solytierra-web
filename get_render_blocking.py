import json
import os

report_path = 'lighthouse-report.json'
if os.path.exists(report_path):
    with open(report_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    audits = data.get('audits', {})
    rb = audits.get('render-blocking-resources', {})
    
    print("=" * 60)
    print(" RENDER BLOCKING RESOURCES")
    print("=" * 60)
    
    details = rb.get('details', {})
    items = details.get('items', [])
    for item in items:
        url = item.get('url')
        wasted_ms = item.get('wastedMs')
        total_size = item.get('totalBytes')
        print(f"- URL: {url}")
        print(f"  Wasted: {wasted_ms} ms, Size: {total_size} bytes")
        print("-" * 60)
else:
    print("Report file not found.")
