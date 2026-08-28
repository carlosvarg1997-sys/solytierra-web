import json
import os

import sys

report_path = sys.argv[1] if len(sys.argv) > 1 else 'lighthouse-report.json'
if os.path.exists(report_path):
    with open(report_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print("=" * 60)
    print(" DETAILED AUDIT FAILURES")
    print("=" * 60)
    
    # Audit details
    audits = data.get('audits', {})
    for audit_id, audit_info in audits.items():
        score = audit_info.get('score')
        # We look for audits that failed (score < 0.95 and score is a number, not None or boolean)
        if score is not None and not isinstance(score, bool) and score < 0.95:
            title = audit_info.get('title')
            description = audit_info.get('description')
            category = ""
            
            # Find which category this audit belongs to
            categories = data.get('categories', {})
            for cat_id, cat_info in categories.items():
                audit_refs = cat_info.get('auditRefs', [])
                for ref in audit_refs:
                    if ref.get('id') == audit_id:
                        category = cat_info.get('title')
                        break
                        
            print(f"[{category}] - {title} (Score: {score})")
            print(f"  Details: {audit_info.get('displayValue', 'No value')}")
            # Clean HTML tags from description
            desc_clean = description.replace('<code>', '').replace('</code>', '').replace('<a>', '').replace('</a>', '')
            print(f"  Description: {desc_clean[:120]}...")
            print("-" * 60)
else:
    print("Report file not found.")
