import json
import os

report_path = 'lighthouse-report.json'
if os.path.exists(report_path):
    with open(report_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    audits = data.get('audits', {})
    nr = audits.get('network-requests', {})
    
    print("=" * 60)
    print(" NETWORK REQUEST SIZES")
    print("=" * 60)
    
    details = nr.get('details', {})
    items = details.get('items', [])
    for item in items:
        url = item.get('url')
        transfer_size = item.get('transferSize', 0)
        resource_size = item.get('resourceSize', 0)
        print(f"- URL: {url}")
        print(f"  Transfer size: {transfer_size / 1024:.2f} KB, Resource size: {resource_size / 1024:.2f} KB")
        print("-" * 60)
else:
    print("Report file not found.")
