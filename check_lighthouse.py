import json
import sys
import os

def check_report(report_path):
    if not os.path.exists(report_path):
        print(f"Error: Report file {report_path} not found.")
        sys.exit(1)

    with open(report_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    categories = data.get('categories', {})
    failed = False
    
    print("=" * 40)
    print(" LIGHTHOUSE AUDIT RESULTS")
    print("=" * 40)
    
    for cat_id, cat_info in categories.items():
        name = cat_info.get('title')
        score = cat_info.get('score')
        
        if score is not None:
            score_pct = int(score * 100)
            status = "PASS" if score_pct >= 95 else "FAIL"
            print(f"- {name}: {score_pct}/100 [{status}]")
            
            if score_pct < 95:
                failed = True
                print(f"  Warning: {name} is below 95!")
        else:
            print(f"- {name}: N/A")
            
    print("=" * 40)
    
    if failed:
        print("Lighthouse audit failed: One or more categories are below 95.")
        sys.exit(1)
    else:
        print("Lighthouse audit passed: All categories are 95 or above!")
        sys.exit(0)

if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'lighthouse-report.json'
    check_report(path)
