const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  async function checkPage(url, viewport, label) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", err => errors.push(err.message));

    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    // Check button colors
    const btnPrimary = await page.evaluate(() => {
      const el = document.querySelector(".btn-primary");
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color, display: s.display, vis: s.visibility };
    });

    // Check tag colors
    const tag = await page.evaluate(() => {
      const el = document.querySelector(".tag");
      if (!el) return null;
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, color: s.color };
    });

    // Check data-fade elements visibility
    const fadeEls = await page.evaluate(() => {
      const els = document.querySelectorAll("[data-fade]");
      return Array.from(els).slice(0, 5).map(el => {
        const s = getComputedStyle(el);
        return { opacity: s.opacity, text: el.textContent.trim().substring(0, 40) };
      });
    });

    // Check carousel images
    const carouselImgs = await page.evaluate(() => {
      const imgs = document.querySelectorAll(".carousel-track img");
      return Array.from(imgs).slice(0, 2).map(img => {
        const r = img.getBoundingClientRect();
        const s = getComputedStyle(img);
        return { w: Math.round(r.width), h: Math.round(r.height), ar: s.aspectRatio, objFit: s.objectFit, naturalW: img.naturalWidth, naturalH: img.naturalHeight };
      });
    });

    // Check section backgrounds
    const sections = await page.evaluate(() => {
      const secs = document.querySelectorAll("section");
      return Array.from(secs).slice(0, 4).map(s => {
        const cs = getComputedStyle(s);
        return { class: s.className.substring(0, 60), bg: cs.backgroundColor, bgImage: cs.backgroundImage !== "none" ? "HAS_IMAGE" : "none" };
      });
    });

    // Check WhatsApp FAB
    const fab = await page.evaluate(() => {
      const el = document.querySelector(".fab");
      if (!el) return null;
      const s = getComputedStyle(el);
      return { display: s.display, vis: s.visibility };
    });

    // Check font family on h1
    const h1Font = await page.evaluate(() => {
      const el = document.querySelector("h1, .hero-title");
      if (!el) return null;
      const s = getComputedStyle(el);
      return { family: s.fontFamily, weight: s.fontWeight };
    });

    // Check CTA visibility on catalog
    const ctaVisible = await page.evaluate(() => {
      const cta = document.querySelector(".traje-stack-item .btn-block, .traje-stack-item .btn-primary");
      if (!cta) return null;
      const r = cta.getBoundingClientRect();
      const s = getComputedStyle(cta);
      return { visible: r.width > 0 && r.height > 0 && s.display !== "none", w: Math.round(r.width), h: Math.round(r.height), bg: s.backgroundColor };
    });

    results.push({ label, errors, btnPrimary, tag, fadeEls, carouselImgs, sections, fab, h1Font, ctaVisible });
    await page.screenshot({ path: `qa-${label}.png`, fullPage: false });
    await page.close();
  }

  const base = "http://127.0.0.1:8120";
  await checkPage(base + "/index.html", { width: 1440, height: 900 }, "home-desktop");
  await checkPage(base + "/index.html", { width: 390, height: 844 }, "home-mobile");
  await checkPage(base + "/catalogo.html", { width: 1440, height: 900 }, "catalog-desktop");
  await checkPage(base + "/catalogo.html", { width: 390, height: 844 }, "catalog-mobile");

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();