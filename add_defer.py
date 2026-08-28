import glob
import os

files_to_update = [
    'index.html',
    'catalogo.html',
    'preguntas-frecuentes.html',
    'contacto.html',
    'anatomia-traje-tobas.html',
    'comunas/_template.html'
]

replacements = {
    'src="assets/js/comunes.js"': 'src="assets/js/comunes.js" defer',
    'src="./assets/js/comunes.js"': 'src="./assets/js/comunes.js" defer',
    'src="../assets/js/comunes.js"': 'src="../assets/js/comunes.js" defer',
    'src="assets/js/cotizador.js"': 'src="assets/js/cotizador.js" defer',
    'src="./assets/js/cotizador.js"': 'src="./assets/js/cotizador.js" defer'
}

def main():
    print("Adding defer attribute to script tags...")
    for filename in files_to_update:
        if not os.path.exists(filename):
            print(f"Skipping {filename} (not found)")
            continue
            
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original = content
        for search, replace in replacements.items():
            # Avoid adding duplicate defer if it is already there
            if search in content and 'defer' not in content[content.find(search) : content.find(search) + len(search) + 10]:
                content = content.replace(search, replace)
                
        if content != original:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filename}")
        else:
            print(f"No changes needed for {filename}")

if __name__ == '__main__':
    main()
