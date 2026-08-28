import os
import re

root_files = [
    'index.html',
    'catalogo.html',
    'preguntas-frecuentes.html',
    'contacto.html'
]

geo_and_template = [
    'anatomia-traje-tobas.html',
    'comunas/_template.html'
]

font_block_root = """  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap" media="print" onload="this.media='all'">
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap">
  </noscript>"""

font_block_geo = """  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;700;800&family=Sora:wght@600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" media="print" onload="this.media='all'">
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;700;800&family=Sora:wght@600;700;800&family=JetBrains+Mono:wght@400;700&display=swap">
  </noscript>"""

def clean_file(filepath, new_block):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match from <link rel="preconnect" href="https://fonts.googleapis.com">
    # through all nested noscripts or preloads, up to (but not including) style.css link
    # We look for a pattern starting with preconnect googleapis and ending before style.css
    pattern = r'<!--\s*Fonts\s*&\s*Icons\s*-->\s*<link\s+rel="preconnect"\s+href="https://fonts\.googleapis\.com">.*?(\n\s*<!--\s*Tailwind|\n\s*<link\s+rel="stylesheet"\s+href=".*?style\.css")'
    
    # Let's try matching with re.DOTALL
    match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
    if match:
        original_block = match.group(0)
        # Find if it ends with style.css link
        ending = match.group(1)
        
        replacement = f"<!-- Fonts & Icons -->\n{new_block}\n  {ending.strip()}"
        new_content = content.replace(original_block, replacement)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned font imports in {filepath}")
    else:
        # Fallback: simpler regex
        pattern_fallback = r'<link\s+rel="preconnect"\s+href="https://fonts\.googleapis\.com">.*?</noscript>\s*</noscript>'
        match_fb = re.search(pattern_fallback, content, re.DOTALL | re.IGNORECASE)
        if match_fb:
            original_fb = match_fb.group(0)
            new_content = content.replace(original_fb, new_block)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Cleaned font imports (fallback) in {filepath}")
        else:
            print(f"Could not find font block in {filepath}")

def main():
    print("Starting Font Import Cleanup...")
    # Change CWD to script directory if not already
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if base_dir:
        os.chdir(base_dir)
        
    for filepath in root_files:
        clean_file(filepath, font_block_root)
        
    for filepath in geo_and_template:
        clean_file(filepath, font_block_geo)

if __name__ == '__main__':
    main()
