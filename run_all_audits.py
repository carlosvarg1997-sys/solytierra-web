import subprocess
import os
import sys
import json

pages = {
    "landing": "http://localhost:8080/index.html",
    "catalogo": "http://localhost:8080/catalogo.html",
    "faq": "http://localhost:8080/preguntas-frecuentes.html",
    "contacto": "http://localhost:8080/contacto.html",
    "anatomia": "http://localhost:8080/anatomia-traje-tobas.html"
}

def run_audit(name, url):
    report_file = f"lighthouse-{name}.json"
    print(f"\nRunning Lighthouse audit for {name.upper()} ({url})...")
    
    cmd = [
        "npx", "lighthouse", url,
        '--chrome-flags="--headless --disable-gpu --no-sandbox --disable-dev-shm-usage --disable-software-rasterizer"',
        "--output=json",
        f"--output-path={report_file}"
    ]
    
    try:
        # Run lighthouse command without checking exit code
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        print(f"Lighthouse executed for {name} (Exit Code: {result.returncode}).")
        if result.returncode != 0:
            print(f"Note: Command output contained warnings or cleanup errors, checking for report file...")
    except Exception as e:
        print(f"Error calling Lighthouse subprocess for {name}: {e}")
        
    # Check results
    if not os.path.exists(report_file):
        print(f"Error: Report file {report_file} was not generated.")
        return False
        
    with open(report_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    categories = data.get('categories', {})
    print(f"Scores for {name.upper()}:")
    passed = True
    for cat_id, cat_info in categories.items():
        title = cat_info.get('title')
        score = cat_info.get('score')
        if score is not None:
            score_pct = int(score * 100)
            status = "PASS" if score_pct >= 95 else "FAIL"
            print(f"  - {title}: {score_pct}/100 [{status}]")
            if score_pct < 95:
                passed = False
        else:
            print(f"  - {title}: N/A")
            
    return passed

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass # Fallback for older python versions
    print("Starting Sol y Tierra Website Audit...")
    all_passed = True
    
    for name, url in pages.items():
        success = run_audit(name, url)
        if not success:
            all_passed = False
            
    if all_passed:
        print("\nSUCCESS: ALL PAGES PASSED LIGHTHOUSE >= 95 AUDIT!")
        sys.exit(0)
    else:
        print("\nFAILURE: SOME PAGES FAILED LIGHTHOUSE >= 95 AUDIT.")
        sys.exit(1)

if __name__ == '__main__':
    main()
