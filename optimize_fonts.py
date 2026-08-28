import os
import re

def optimize_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to match any google fonts stylesheet link
    pattern = r'<link\s+href="https://fonts\.googleapis\.com/css2\?([^"]+)"\s+rel="stylesheet">'
    
    def replacer(match):
        query = match.group(1)
        original = match.group(0)
        # Convert to async preload pattern
        new_link = (
            f'<link rel="preload" href="https://fonts.googleapis.com/css2?{query}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n'
            f'  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?{query}"></noscript>'
        )
        return new_link

    new_content, count = re.subn(pattern, replacer, content)
    
    # Also handle alternate tag formats (rel before href or single quotes)
    pattern_alt = r'<link\s+rel="stylesheet"\s+href="https://fonts\.googleapis\.com/css2\?([^"]+)">'
    new_content, count_alt = re.subn(pattern_alt, replacer, new_content)
    
    if count > 0 or count_alt > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Optimized fonts in {file_path} ({count + count_alt} replacements)")

def main():
    # Process root HTML files
    for file in os.listdir('.'):
        if file.endswith('.html'):
            optimize_html_file(file)
            
    # Process comunas HTML files
    comunas_dir = 'comunas'
    if os.path.exists(comunas_dir):
        for file in os.listdir(comunas_dir):
            if file.endswith('.html'):
                optimize_html_file(os.path.join(comunas_dir, file))

if __name__ == '__main__':
    main()
