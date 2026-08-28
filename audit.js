
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', e => errors.push('JS ERROR: ' + e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
  });

  const pages = [
    { url: 'http://127.0.0.1:8020/index.html', name: 'index' },
    { url: 'http://127.0.0.1:8020/condiciones.html', name: 'condiciones' },
    { url: 'http://127.0.0.1:8020/catalogo.html', name: 'catalogo' },
    { url: 'http://127.0.0.1:8020/contacto.html', name: 'contacto' }
  ];

  const results = [];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const screenshot = p.name + '.png';
    await page.screenshot({ path: 'C:/Users/HP/AppData/Local/hermes/cache/' + screenshot, fullPage: true });

    // Verificar problemas visuales
    const issues = await page.evaluate(() => {
      const issues = [];

      // 1. Texto blanco sobre fondo blanco
      const all = document.querySelectorAll('h1,h2,h3,h4,p,span,li,strong,a');
      let invisible = 0;
      all.forEach(el => {
        const cs = getComputedStyle(el);
        const c = cs.color;
        const bg = cs.backgroundColor;
        if (c.match(/255,\s*255,\s*255/) || c === 'white') {
          // esta en fondo blanco?
          let parent = el;
          let foundWhite = false;
          while (parent && parent !== document.body) {
            const pbg = getComputedStyle(parent).backgroundColor;
            if (pbg.match(/255,\s*255,\s*255/) || pbg === 'white') {
              foundWhite = true;
              break;
            }
            parent = parent.parentElement;
          }
          if (foundWhite) invisible++;
        }
      });

      // 2. Imagenes con object-position que cortan cabezas
      const photos = document.querySelectorAll('img');
      const totalImgs = photos.length;

      // 3. Nav tiene 4 links?
      const navLinks = document.querySelectorAll('.nav-links a').length;

      // 4. Footer tiene 4 columnas?
      const footerCols = document.querySelectorAll('.footer-col').length;

      // 5. Hay crema? (#F5EDE3)
      const hasCrema = document.documentElement.outerHTML.includes('#F5EDE3') ||
                       document.documentElement.outerHTML.includes('#f5ede3');

      // 6. Hay gris claro?
      const hasGray = document.documentElement.outerHTML.includes('#F6F6F7') ||
                      document.documentElement.outerHTML.includes('#f6f6f7');

      // 7. Hay Loreto?
      const hasLoreto = document.body.innerText.includes('Loreto');

      // 8. Hay Santa Barbara?
      const hasAddress = document.body.innerText.includes('Santa Bárbara');

      // 9. H1 y H2 existen y son visibles
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h1Visible = h1 ? (h1.offsetHeight > 0) : false;

      return {
        invisibleTextCount: invisible,
        totalImages: totalImgs,
        navLinks,
        footerCols,
        hasCrema,
        hasGray,
        hasLoreto,
        hasAddress,
        h1Visible,
        pageHeight: document.body.scrollHeight
      };
    });

    results.push({ name: p.name, url: p.url, issues, errors });
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
