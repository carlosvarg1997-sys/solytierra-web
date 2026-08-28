import os
import glob
import re
from PIL import Image

files_to_process = [
    'index.html',
    'catalogo.html',
    'preguntas-frecuentes.html',
    'contacto.html',
    'anatomia-traje-tobas.html',
    'comunas/_template.html'
]

def get_image_size(src_path, html_file):
    # Resolve relative path based on the html file location
    if src_path.startswith('.'):
        resolved_path = os.path.normpath(os.path.join(os.path.dirname(html_file), src_path))
    else:
        resolved_path = os.path.normpath(os.path.join('web' if not os.getcwd().endswith('web') else '', src_path))
        
    if not os.path.exists(resolved_path) and os.path.exists(src_path):
        resolved_path = src_path
        
    if os.path.exists(resolved_path):
        try:
            with Image.open(resolved_path) as img:
                return img.size # (width, height)
        except Exception as e:
            print(f"Error opening image {resolved_path}: {e}")
    else:
        print(f"Image not found: {resolved_path} (src: {src_path})")
    return None

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all <img ... > tags
    # This regex matches `<img` followed by any attributes until `>`
    img_pattern = re.compile(r'<img\b[^>]*>', re.IGNORECASE)
    
    def replace_img(match):
        img_tag = match.group(0)
        
        # Extract src attribute
        src_match = re.search(r'src=["\']([^"\']+)["\']', img_tag, re.IGNORECASE)
        if not src_match:
            return img_tag
            
        src = src_match.group(1)
        
        # Only process local images
        if src.startswith(('http://', 'https://', '//')):
            return img_tag
            
        # Get dimensions
        size = get_image_size(src, filepath)
        if not size:
            return img_tag
            
        width, height = size
        
        # Check if width/height already present
        has_width = re.search(r'\bwidth=["\']', img_tag, re.IGNORECASE)
        has_height = re.search(r'\bheight=["\']', img_tag, re.IGNORECASE)
        
        updated_tag = img_tag
        if not has_width:
            # Insert width right before > or />
            if updated_tag.endswith('/>'):
                updated_tag = updated_tag[:-2] + f' width="{width}" />'
            else:
                updated_tag = updated_tag[:-1] + f' width="{width}">'
                
        if not has_height:
            if updated_tag.endswith('/>'):
                updated_tag = updated_tag[:-2] + f' height="{height}" />'
            else:
                updated_tag = updated_tag[:-1] + f' height="{height}">'
                
        return updated_tag

    new_content = img_pattern.sub(replace_img, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated images in {filepath}")
    else:
        print(f"No image changes needed for {filepath}")

def main():
    print("Adding explicit width/height to all local images in HTML files...")
    # Change CWD to script directory if not already
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if base_dir:
        os.chdir(base_dir)
        
    for f in files_to_process:
        process_file(f)

if __name__ == '__main__':
    main()
