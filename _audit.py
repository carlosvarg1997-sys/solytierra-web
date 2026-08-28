
import asyncio, os, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await ctx.new_page()

        pages = [
            ("http://127.0.0.1:8020/index.html", "index"),
            ("http://127.0.0.1:8020/condiciones.html", "condiciones"),
            ("http://127.0.0.1:8020/catalogo.html", "catalogo"),
            ("http://127.0.0.1:8020/contacto.html", "contacto"),
        ]

        results = []
        for url, name in pages:
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(800)

            shot = os.path.join(r"C:\Users\HP\AppData\Local\hermes\cache\screenshots", f"audit_{name}.png")
            await page.screenshot(path=shot, full_page=True)

            issues = await page.evaluate("""() => {
              const out = {};
              out.title = document.title;
              out.h1Text = document.querySelector('h1')?.innerText;
              out.navLinks = document.querySelectorAll('.nav-links a').length;
              out.footerCols = document.querySelectorAll('.footer-col').length;
              out.totalImgs = document.querySelectorAll('img').length;
              out.hasCrema = document.documentElement.outerHTML.toLowerCase().includes('#f5ede3');
              out.hasGray = document.documentElement.outerHTML.toLowerCase().includes('#f6f6f7');
              out.hasSantaBarbara = document.body.innerText.includes('Santa Bárbara') || document.body.innerText.includes('Santa Barbara');
              out.hasLoreto = document.body.innerText.includes('Loreto');
              out.hasTurquesa = document.body.innerText.toLowerCase().includes('turquesa');
              out.hasRecoleta = document.body.innerText.includes('Recoleta');
              out.hasFaq = document.body.innerText.includes('FAQ') || document.body.innerText.includes('faqs');
              out.condCards = document.querySelectorAll('.cond-card').length;
              out.trajeCards = document.querySelectorAll('.traje-card-light, .traje-card').length;

              // Detectar texto blanco sobre fondo blanco
              const invisibles = [];
              document.querySelectorAll('h1,h2,h3,h4,p,span,li,strong,a').forEach(el => {
                const cs = getComputedStyle(el);
                if (cs.color.match(/255,\s*255,\s*255/) || cs.color === 'white') {
                  let parent = el;
                  let bgWhite = false;
                  while (parent && parent !== document.body) {
                    const pbg = getComputedStyle(parent).backgroundColor;
                    if (pbg.match(/255,\s*255,\s*255/) || pbg === 'white') {
                      bgWhite = true;
                      break;
                    }
                    parent = parent.parentElement;
                  }
                  if (bgWhite && el.innerText && el.innerText.trim().length > 0) {
                    invisibles.push(el.tagName + ': ' + el.innerText.substring(0, 50));
                  }
                }
              });
              out.invisibles = invisibles.slice(0, 5);
              out.invisibleCount = invisibles.length;
              return out;
            }""")
            issues['errors'] = errors
            results.append({"name": name, "url": url, **issues})

        await browser.close()
        print(json.dumps(results, indent=2, ensure_ascii=False))

asyncio.run(main())
