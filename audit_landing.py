import subprocess, os, json, sys

def run_audit(name, url):
    report_file = f"lighthouse-{name}.json"
    print(f"\nAuditando {name.upper()} ({url})...")
    cmd = [
        "npx", "lighthouse", url,
        '--chrome-flags=--headless --disable-gpu --no-sandbox --disable-dev-shm-usage',
        "--output=json",
        f"--output-path={report_file}"
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        print(f"Exit Code: {result.returncode}")
    except Exception as e:
        print(f"Error: {e}")
        return

    if not os.path.exists(report_file):
        print(f"Error: No se generó {report_file}")
        return

    with open(report_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    categories = data.get('categories', {})
    for cat_id, cat_info in categories.items():
        title = cat_info.get('title')
        score = cat_info.get('score')
        if score is not None:
            score_pct = int(score * 100)
            status = "✅ PASS" if score_pct >= 95 else "❌ FAIL"
            print(f"  {status} {title}: {score_pct}/100")

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

run_audit("landing", "http://localhost:8080/index.html")
