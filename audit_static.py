#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sol y Tierra · Validación estática profunda del sitio web.
Cubre: HTML/SEO meta, links (rotos, anclas, tel/wa.me), imágenes,
       JSON-LD (parse + validación), accesibilidad básica,
       performance quick-wins, contenido (H1/H2/CTAs/logo).
Salida: imprime reporte + escribe var/validation_report.json.
"""
import os
import re
import json
import sys
import html
from pathlib import Path
from urllib.parse import urlparse, unquote

# Forzar UTF-8 en stdout/stderr (Windows cp1252 no soporta emojis)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE = Path(__file__).resolve().parent  # web/  (el script vive en web/)
SERVER = "http://127.0.0.1:8080"

# ── Páginas a auditar ─────────────────────────────────────────
PAGES = [
    "index.html",
    "catalogo.html",
    "preguntas-frecuentes.html",
    "contacto.html",
    "anatomia-traje-tobas.html",
    "comunas/puente-alto.html",
    "comunas/maipu.html",
    "comunas/la-florida.html",
    "comunas/penalolen.html",
    "comunas/recoleta.html",
    "comunas/renca.html",
    "comunas/lampa.html",
    "comunas/quilicura.html",
    "comunas/huechuraba.html",
    "comunas/santiago.html",
]

ISSUES = {"errors": [], "warnings": [], "info": []}
STATS = {"pages": 0, "links": 0, "images": 0, "schemas": 0, "forms": 0,
         "h1": 0, "h2": 0, "ctas": 0, "alts_missing": 0}


def add(severity, page, msg):
    ISSUES[severity].append({"page": page, "msg": msg})


def read(p):
    try:
        return Path(p).read_text(encoding="utf-8")
    except Exception as e:
        return ""


def audit_page(rel):
    page_path = BASE / rel
    if not page_path.exists():
        add("errors", rel, f"❌ Página no existe")
        return
    content = read(page_path)
    if not content:
        add("errors", rel, f"❌ No se pudo leer")
        return
    STATS["pages"] += 1

    # ── 1. SEO Meta Tags ──────────────────────────────────────
    title = re.search(r"<title>(.*?)</title>", content, re.S)
    if not title or not title.group(1).strip():
        add("errors", rel, "Falta <title>")
    else:
        if len(title.group(1)) > 70:
            add("warnings", rel, f"<title> largo ({len(title.group(1))} chars): {title.group(1)[:50]}…")

    desc = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.S)
    if not desc or not desc.group(1).strip():
        add("errors", rel, "Falta <meta name='description'>")
    else:
        d = desc.group(1)
        if len(d) < 70:
            add("warnings", rel, f"Meta description muy corta ({len(d)} chars)")
        elif len(d) > 170:
            add("warnings", rel, f"Meta description muy larga ({len(d)} chars)")

    # OG
    for og in ["og:title", "og:description", "og:image", "og:url"]:
        if not re.search(rf'<meta\s+property=["\']{og}["\']', content):
            add("warnings", rel, f"Falta OG tag: {og}")

    # Canonical
    if not re.search(r'<link\s+rel=["\']canonical["\']', content):
        add("info", rel, "Sin <link rel='canonical'>")

    # ── 2. Estructura de headings ────────────────────────────
    h1 = re.findall(r"<h1[^>]*>(.*?)</h1>", content, re.S)
    h2 = re.findall(r"<h2[^>]*>(.*?)</h2>", content, re.S)
    STATS["h1"] += len(h1)
    STATS["h2"] += len(h2)
    if len(h1) == 0:
        add("errors", rel, "Sin <h1>")
    elif len(h1) > 1:
        add("warnings", rel, f"Múltiples <h1> ({len(h1)})")
    if len(h2) == 0 and rel not in ("comunas/_template.html",):
        add("info", rel, "Sin <h2>")

    # ── 3. Links ──────────────────────────────────────────────
    for href in re.findall(r'href=["\']([^"\']+)["\']', content):
        STATS["links"] += 1
        # Ignorar anchors vacíos, mailto, tel, javascript, data URIs
        if not href or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:") or href.startswith("javascript:") or href.startswith("data:"):
            continue
        # wa.me siempre OK (número placeholder será reescrito)
        if href.startswith("https://wa.me/") or href.startswith("http://wa.me/"):
            continue
        # http(s):// externos (no auditamos)
        if href.startswith("http://") or href.startswith("https://"):
            continue
        # Interno: relativo a la página actual
        base_dir = (BASE / rel).parent
        target = (base_dir / unquote(href.split("#")[0])).resolve()
        # Normalizar para quitar ../../
        try:
            target = target.resolve()
        except Exception:
            pass
        # Buscar también index.html si apunta a directorio
        if not target.exists() and target.is_dir() == False:
            if not str(target).endswith(".html"):
                idx = target.with_name(target.name + ".html")
                if idx.exists():
                    target = idx
        if not target.exists():
            add("errors", rel, f"Link roto: {href}")

    # ── 4. Imágenes ───────────────────────────────────────────
    for src in re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content):
        STATS["images"] += 1
        if src.startswith("data:") or src.startswith("http://") or src.startswith("https://"):
            continue
        base_dir = (BASE / rel).parent
        target = (base_dir / unquote(src.split("#")[0])).resolve()
        if not target.exists():
            add("errors", rel, f"Imagen rota: {src}")
    # ALT en img
    for img in re.findall(r'<img[^>]*>', content):
        if "alt=" not in img:
            STATS["alts_missing"] += 1
            add("warnings", rel, f"Imagen sin alt: {img[:80]}…")

    # ── 5. JSON-LD ────────────────────────────────────────────
    schemas = re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>',
                         content, re.S)
    STATS["schemas"] += len(schemas)
    for s in schemas:
        try:
            data = json.loads(s)
            if not isinstance(data, dict) and not isinstance(data, list):
                add("errors", rel, "JSON-LD no es objeto ni array")
        except json.JSONDecodeError as e:
            add("errors", rel, f"JSON-LD inválido: {e}")

    # ── 6. Accesibilidad: <label> en inputs ─────────────────
    inputs = re.findall(r'<input[^>]*type=["\'](?!hidden)[^"\']*["\'][^>]*>', content)
    textareas = re.findall(r'<textarea[^>]*>', content)
    selects = re.findall(r'<select[^>]*>', content)
    forms = re.findall(r'<form[^>]*>', content)
    STATS["forms"] += len(forms)
    # Chequear aria-label en inputs sin label asociado
    for inp in inputs + textareas:
        m = re.search(r'(?:id|name)=["\']([^"\']+)["\']', inp)
        if not m:
            continue
        field_id = m.group(1)
        if f'for="{field_id}"' in content or f'aria-label=' in inp or f'aria-labelledby=' in inp:
            continue
        # Si está dentro de un <label>...</label> también OK
        # Simplificado: avisar si no tiene label visible
        add("info", rel, f"Input sin label visible: {field_id}")

    # ── 7. Performance quick-wins ─────────────────────────────
    # CSS: una hoja principal OK
    css_links = re.findall(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']', content)
    render_blocking_css = [c for c in css_links if c.endswith(".css") and "print" not in c]
    if len(render_blocking_css) > 1:
        add("info", rel, f"{len(render_blocking_css)} stylesheets (revisar critical CSS)")

    # JS en <head> sin defer
    for js in re.findall(r'<script\s+src=["\']([^"\']+)["\']\s*>', content):
        if "defer" not in js and "async" not in js:
            add("warnings", rel, f"JS sin defer: {js}")

    # ── 8. Identidad de marca ────────────────────────────────
    if "🌞" in content:
        add("info", rel, "🌞 emoji presente (considerar logo)")
    if "logo%20sol%20y%20tierra" in content:
        STATS["ctas"] += content.count("logo%20sol%20y%20tierra")
    if "grad-text" in content:
        pass  # OK
    if "wa.me/56930000000" in content:
        add("info", rel, "WSP placeholder (será reescrito por comunes.js)")

    # ── 9. Anclas internas: validar que existan en destino ──
    for href in re.findall(r'href=["\']#([^"\']+)["\']', content):
        if not re.search(rf'id=["\']{re.escape(href)}["\']', content):
            add("warnings", rel, f"Ancla interna # {href} no encontrada en la página")


def main():
    print(f"🔍 Auditando {len(PAGES)} páginas en {BASE}\n")
    for p in PAGES:
        audit_page(p)

    # ── Reporte ───────────────────────────────────────────────
    print("=" * 60)
    print(f"📊 ESTADÍSTICAS")
    print("=" * 60)
    for k, v in STATS.items():
        print(f"  {k:18s} {v}")

    print("\n" + "=" * 60)
    print(f"❌ ERRORES ({len(ISSUES['errors'])})")
    print("=" * 60)
    for i in ISSUES["errors"][:30]:
        print(f"  [{i['page']}] {i['msg']}")
    if len(ISSUES["errors"]) > 30:
        print(f"  … y {len(ISSUES['errors']) - 30} más")

    print("\n" + "=" * 60)
    print(f"⚠️  ADVERTENCIAS ({len(ISSUES['warnings'])})")
    print("=" * 60)
    for i in ISSUES["warnings"][:30]:
        print(f"  [{i['page']}] {i['msg']}")
    if len(ISSUES["warnings"]) > 30:
        print(f"  … y {len(ISSUES['warnings']) - 30} más")

    # Guardar JSON
    out_dir = BASE / "var"
    out_dir.mkdir(exist_ok=True)
    (out_dir / "validation_report.json").write_text(
        json.dumps({"stats": STATS, "issues": ISSUES}, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    print(f"\n📄 Reporte JSON → var/validation_report.json")

    # Exit code: 1 si hay errores
    sys.exit(1 if ISSUES["errors"] else 0)


if __name__ == "__main__":
    main()
