import json
import sys

def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze_perf.py <lighthouse_json_file>")
        return

    filepath = sys.argv[1]
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    perf = data['categories']['performance']
    print(f"Performance Score: {perf['score'] * 100:.0f}/100")
    print("=" * 80)
    
    audits = data['audits']
    for ref in perf['auditRefs']:
        audit_id = ref['id']
        audit = audits.get(audit_id)
        if not audit:
            continue
        
        score = audit.get('score')
        # Print if score is less than 0.95 or if it's a metric (like FCP, LCP, etc.)
        is_metric = ref.get('group') == 'metrics'
        if is_metric or (score is not None and not isinstance(score, bool) and score < 0.95):
            title = audit.get('title')
            display_value = audit.get('displayValue', '')
            score_str = f"{score * 100:.0f}/100" if score is not None else "N/A"
            print(f"[{score_str}] {title} ({audit_id})")
            if display_value:
                print(f"  Value: {display_value}")
            desc = audit.get('description', '').replace('<code>', '').replace('</code>', '')
            print(f"  Description: {desc[:150]}")
            
            # Print opportunities or details if any
            details = audit.get('details', {})
            if details.get('type') == 'opportunity' and 'items' in details:
                print("  Opportunities/Details:")
                for item in details['items'][:3]:
                    url = item.get('url', '')
                    wasted_ms = item.get('wastedMs')
                    total_bytes = item.get('totalBytes')
                    url_short = url.split('/')[-1] if url else ''
                    bytes_str = f", Size: {total_bytes/1024:.1f} KB" if total_bytes else ''
                    wasted_str = f"Wasted: {wasted_ms:.0f} ms" if wasted_ms else ''
                    if url_short or wasted_str:
                        print(f"    - {url_short} {wasted_str}{bytes_str}")
            print("-" * 80)

if __name__ == '__main__':
    main()
