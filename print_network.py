import json
import sys

def main():
    filepath = sys.argv[1] if len(sys.argv) > 1 else 'lighthouse-landing.json'
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    reqs = data['audits']['network-requests']['details']['items']
    print(f"Network Requests for {filepath}:")
    print("-" * 80)
    for r in reqs:
        url = r['url']
        size = r.get('transferSize', 0)
        res_type = r.get('resourceType', 'unknown')
        start = r.get('startTime', 0)
        end = r.get('endTime', 0)
        duration = (end - start) * 1000 if start and end else 0
        print(f"- {url[:60]}")
        print(f"  Type: {res_type}, Size: {size/1024:.2f} KB, Duration: {duration:.0f}ms, Start: {start*1000:.0f}ms")
    print("-" * 80)

if __name__ == '__main__':
    main()
