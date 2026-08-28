import os

files_with_relative_css = [
    ('index.html', 'assets/css/style.css'),
    ('catalogo.html', 'assets/css/style.css'),
    ('preguntas-frecuentes.html', 'assets/css/style.css'),
    ('contacto.html', 'assets/css/style.css'),
    ('anatomia-traje-tobas.html', 'assets/css/style.css'),
    ('comunas/_template.html', '../assets/css/style.css')
]

preload_fonts = """  <link rel="preload" href="https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSvfedN4.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="https://fonts.gstatic.com/s/sora/v17/xMQ9uFFYT72X5wkB_18qmnndmSdSnh2BAfO5mnuyOo1lfiQwV6-xo6eeIw.woff2" as="font" type="font/woff2" crossorigin>"""

def process_file(filepath, css_path):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add Font Preloads under <!-- Fonts & Icons -->
    fonts_comment = '<!-- Fonts & Icons -->'
    if 'xn7gYHE41ni1AdIRggex' not in content:
        if fonts_comment in content:
            idx = content.find(fonts_comment) + len(fonts_comment)
            content = content[:idx] + "\n" + preload_fonts + content[idx:]
            print(f"Added font preloads to {filepath}")
        else:
            preconnect_str = '<link rel="preconnect" href="https://fonts.googleapis.com">'
            if preconnect_str in content:
                idx = content.find(preconnect_str)
                content = content[:idx] + preload_fonts + "\n  " + content[idx:]
                print(f"Added font preloads (preconnect fallback) to {filepath}")

    # 2. Add Style Preload before the stylesheet link
    style_link = f'href="{css_path}"'
    preload_link = f'<link rel="preload" href="{css_path}" as="style">'
    if style_link in content and preload_link not in content:
        idx = content.find(style_link)
        # Find the start of the link tag
        start_idx = content.rfind('<link', 0, idx)
        if start_idx != -1:
            content = content[:start_idx] + preload_link + "\n  " + content[start_idx:]
            print(f"Added CSS preload to {filepath}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    print("Injecting CSS & Font preloads in HTML files...")
    # Change CWD to script directory if not already
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if base_dir:
        os.chdir(base_dir)
        
    for f, css in files_with_relative_css:
        process_file(f, css)

if __name__ == '__main__':
    main()
