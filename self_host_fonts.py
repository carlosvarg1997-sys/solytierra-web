"""
self_host_fonts.py — baja las fuentes de Google y genera assets/css/fonts.css
con @font-face APUNTANDO A LOCAL (self-host). Mata el render-blocking de
fonts.googleapis.com (mismo aprendizaje que Ensutex con Readex).

Familias/pesos = los que usa styt.css (--font-display / --font-body / --font-mono)
y que cargan las páginas. Solo subsets latin + latin-ext (español con acentos/ñ).

Uso:  cd web && python self_host_fonts.py
Deja: assets/fonts/*.woff2  +  assets/css/fonts.css
"""
import re
import urllib.request
import pathlib

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"}

FONTS = {
    "Plus Jakarta Sans": [500, 700, 800],
    "Manrope": [300, 400, 500, 600, 700],
    "JetBrains Mono": [500, 700],
}
KEEP = ("latin", "latin-ext")

OUT_FONTS = pathlib.Path("assets/fonts")
OUT_CSS = pathlib.Path("assets/css/fonts.css")
OUT_FONTS.mkdir(parents=True, exist_ok=True)


def fetch(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()


def main() -> None:
    faces = []
    for fam, weights in FONTS.items():
        q = fam.replace(" ", "+")
        url = f"https://fonts.googleapis.com/css2?family={q}:wght@" + ";".join(map(str, weights)) + "&display=swap"
        css = fetch(url).decode("utf-8")
        parts = re.split(r"/\*\s*([\w-]+)\s*\*/", css)  # ['', subset, block, subset, block, ...]
        for i in range(1, len(parts) - 1, 2):
            subset, block = parts[i], parts[i + 1]
            if subset not in KEEP:
                continue
            u = re.search(r"url\((https://[^)]+\.woff2)\)", block)
            w = re.search(r"font-weight:\s*(\d+)", block)
            if not u:
                continue
            wurl, weight = u.group(1), (w.group(1) if w else "400")
            slug = fam.lower().replace(" ", "-")
            fname = f"{slug}-{weight}-{subset}.woff2"
            (OUT_FONTS / fname).write_bytes(fetch(wurl))
            faces.append(block.strip().replace(wurl, f"../fonts/{fname}"))
            print(f"  ok {fname}")
    header = "/* Sol y Tierra · fuentes self-host (generado por self_host_fonts.py). NO editar a mano. */\n"
    OUT_CSS.write_text(header + "\n".join(faces) + "\n", encoding="utf-8")
    print(f"OK - {len(faces)} @font-face -> {OUT_CSS}")


if __name__ == "__main__":
    main()
