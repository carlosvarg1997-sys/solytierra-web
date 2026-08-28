/* =============================================================================
   motion.js · Sol y Tierra
   -----------------------------------------------------------------------------
   Librería de motion compartida (web + panel). Vanilla JS, sin frameworks.
   Traduce el lenguaje de diseño de "Jack" a Sol y Tierra:
     FadeIn       → reveal on scroll con IntersectionObserver (cubic-bezier spring)
     Magnetic    → efecto magnético sobre el cursor (mouse-follow)
     AnimatedText → reveal carácter por carácter según el scroll (clip-path)
     StickyStack  → cards sticky que escalan al hacer scroll (stacking)
     Marquee     → fila de imágenes con parallax horizontal según scrollY
   NO depende de jQuery ni de Tailwind. Pesos < 4 KB total.
   Uso:
     <script src="assets/js/motion.js" defer></script>
     <div data-fade data-fade-delay="0.15">…</div>
     <div data-magnetic data-magnetic-strength="3">…</div>
     <p data-animated-text>…</p>
     <div data-sticky-stack>…cards…</div>
     <div data-marquee data-marquee-speed="0.3" data-marquee-dir="1">…imgs…</div>
   ============================================================================= */
(function () {
  'use strict';

  // Spring de marca (de SISTEMA_DISENO_SOL_Y_TIERRA.md)
  const SPRING = 'cubic-bezier(0.34, 1.35, 0.64, 1)';

  // Respeta reduce-motion
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─────────────────────────────────────────────────────────────
  //  FadeIn · reveal on scroll
  // ─────────────────────────────────────────────────────────────
  function initFadeIn() {
    const els = document.querySelectorAll('[data-fade]');
    if (!els.length) return;
    if (REDUCE || !('IntersectionObserver' in window)) {
      els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    els.forEach((el) => {
      const delay = parseFloat(el.dataset.fadeDelay || '0') * 1000;
      const dy = parseFloat(el.dataset.fadeY || '30');
      const dx = parseFloat(el.dataset.fadeX || '0');
      const dur = parseFloat(el.dataset.fadeDur || '0.7') * 1000;
      el.style.opacity = '0';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = `opacity ${dur}ms ${SPRING} ${delay}ms, transform ${dur}ms ${SPRING} ${delay}ms`;
      el.style.willChange = 'opacity, transform';
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translate(0,0)';
            e.target.setAttribute('data-fade-shown', '');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    // Safety fallback: show all after 3s (catches stuck elements)
    setTimeout(() => {
      document.querySelectorAll('[data-fade]:not([data-fade-shown])').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'translate(0,0)';
        el.setAttribute('data-fade-shown', '');
      });
    }, 3000);
  }

  // ─────────────────────────────────────────────────────────────
  //  Magnetic · sigue el cursor suavemente
  // ─────────────────────────────────────────────────────────────
  function initMagnetic() {
    if (REDUCE) return;
    const els = document.querySelectorAll('[data-magnetic]');
    els.forEach((el) => {
      const strength = parseFloat(el.dataset.magneticStrength || '3');
      el.style.willChange = 'transform';
      el.style.transition = 'transform 0.6s ease-in-out';

      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / strength;
        const dy = (e.clientY - cy) / strength;
        el.style.transition = 'transform 0.3s ease-out';
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      };
      const onLeave = () => {
        el.style.transition = 'transform 0.6s ease-in-out';
        el.style.transform = 'translate3d(0,0,0)';
      };
      // Activar magnético dentro del padding (ventana amplia alrededor)
      const parent = el.parentElement || el;
      parent.addEventListener('mousemove', onMove);
      parent.addEventListener('mouseleave', onLeave);
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  AnimatedText · reveal carácter por carácter según scroll
  // ─────────────────────────────────────────────────────────────
  function initAnimatedText() {
    const els = document.querySelectorAll('[data-animated-text]');
    if (!els.length) return;
    if (REDUCE || !('IntersectionObserver' in window)) return;

    els.forEach((el) => {
      const text = el.textContent;
      el.innerHTML = '';
      const chars = Array.from(text);
      // Placeholder invisible para mantener el layout
      const ph = document.createElement('span');
      ph.style.visibility = 'hidden';
      ph.style.whiteSpace = 'pre-wrap';
      ph.textContent = text;
      el.appendChild(ph);
      // Wrapper absoluto
      const wrap = document.createElement('span');
      wrap.style.position = 'absolute';
      wrap.style.inset = '0';
      wrap.style.display = 'inline';
      wrap.style.whiteSpace = 'pre-wrap';
      el.style.position = 'relative';
      chars.forEach((ch) => {
        const s = document.createElement('span');
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        s.style.opacity = '0.18';
        s.style.transition = 'opacity 0.2s ease';
        s.style.willChange = 'opacity';
        wrap.appendChild(s);
      });
      el.appendChild(wrap);

      const onScroll = () => {
        const rect = el.getBoundingClientRect();
        const wh = window.innerHeight;
        // progreso: 0 cuando el elemento entra (start 0.8) → 1 cuando sale (end 0.2)
        const start = wh * 0.8;
        const end = wh * 0.2;
        const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
        const spans = wrap.children;
        for (let i = 0; i < spans.length; i++) {
          const cp = i / spans.length;
          const local = Math.max(0, Math.min(1, (p - cp) * 2.5));
          spans[i].style.opacity = (0.18 + 0.82 * local).toFixed(2);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  StickyStack · cards sticky que escalan al hacer scroll
  //  Cada hijo directo del contenedor se vuelve sticky y escala
  // ─────────────────────────────────────────────────────────────
  function initStickyStack() {
    if (REDUCE) return;
    const containers = document.querySelectorAll('[data-sticky-stack]');
    containers.forEach((container) => {
      const cards = Array.from(container.children);
      const n = cards.length;
      if (!n) return;
      cards.forEach((card, i) => {
        card.style.position = 'sticky';
        card.style.top = `${96 + i * 28}px`;
        card.style.willChange = 'transform';
        card.style.transition = 'transform 0.3s ease-out';
      });

      const onScroll = () => {
        const rect = container.getBoundingClientRect();
        for (let i = 0; i < n; i++) {
          const card = cards[i];
          const cardRect = card.getBoundingClientRect();
          // cuánto se ha desplazado esta card fuera de su "punto sticky"
          const past = Math.max(0, 96 + i * 28 - cardRect.top);
          if (past > 0) {
            // escala hacia abajo: targetScale = 1 - (n-1-i) * 0.03
            const target = 1 - (n - 1 - i) * 0.03;
            const k = Math.min(1, past / 120);
            const s = 1 - (1 - target) * k;
            card.style.transform = `scale(${s.toFixed(3)})`;
          } else {
            card.style.transform = 'scale(1)';
          }
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  Marquee · parallax horizontal según scrollY
  //  data-marquee-dir="1" → derecha, "-1" → izquierda
  // ─────────────────────────────────────────────────────────────
  function initMarquee() {
    if (REDUCE) return;
    const rows = document.querySelectorAll('[data-marquee]');
    rows.forEach((row) => {
      const speed = parseFloat(row.dataset.marqueeSpeed || '0.3');
      const dir = parseInt(row.dataset.marqueeDir || '1', 10);
      // triplicar contenido para scroll infinito
      const html = row.innerHTML;
      row.innerHTML = html + html + html;
      row.style.display = 'flex';
      row.style.gap = '12px';
      row.style.willChange = 'transform';

      const onScroll = () => {
        const rect = row.getBoundingClientRect();
        const wh = window.innerHeight;
        const offset = (window.scrollY - (rect.top + window.scrollY) + wh) * speed;
        row.style.transform = `translate3d(${dir * (offset - 200)}px, 0, 0)`;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  Counters · contador animado con easing cúbico
  //  data-counter="37" data-counter-prefix="" data-counter-suffix="%"
  // ─────────────────────────────────────────────────────────────
  function initCounters() {
    const els = document.querySelectorAll('[data-counter], [data-count]');
    if (!els.length) return;
    if (REDUCE || !('IntersectionObserver' in window)) {
      els.forEach((el) => {
        const val = parseInt(el.dataset.counter || el.dataset.count || '0', 10);
        const prefix = el.dataset.counterPrefix || '';
        const suffix = el.dataset.counterSuffix || '';
        el.textContent = prefix + val.toLocaleString('es-CL') + suffix;
      });
      return;
    }

    const animate = (el) => {
      const target = parseInt(el.dataset.counter || el.dataset.count || '0', 10);
      const prefix = el.dataset.counterPrefix || '';
      const suffix = el.dataset.counterSuffix || '';
      const duration = parseInt(el.dataset.counterDuration || '1200', 10);
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const current = Math.round(eased * target);
        el.textContent = prefix + current.toLocaleString('es-CL') + suffix;
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = prefix + target.toLocaleString('es-CL') + suffix;
        }
      }
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });

    els.forEach((el) => io.observe(el));
  }

  // ─────────────────────────────────────────────────────────────
  //  Calculator Feedback · pulso sutil cuando cambian los montos
  // ─────────────────────────────────────────────────────────────
  function initCalculatorFeedback() {
    if (REDUCE) return;
    const moneyNodes = document.querySelectorAll('[data-money]');
    if (!moneyNodes.length) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === 'characterData' || m.type === 'childList') {
          const target = m.target.nodeType === 3 ? m.target.parentElement : m.target;
          if (target && target.classList) {
            target.classList.remove('price-val-updated');
            void target.offsetWidth;
            target.classList.add('price-val-updated');
          }
        }
      });
    });

    moneyNodes.forEach((node) => {
      observer.observe(node, { characterData: true, childList: true, subtree: true });
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  Smooth Accordion · apertura y cierre orgánico de <details>
  // ─────────────────────────────────────────────────────────────
  function initSmoothAccordion() {
    if (REDUCE) return;
    const detailsEls = document.querySelectorAll('details');
    detailsEls.forEach((el) => {
      const summary = el.querySelector('summary');
      if (!summary) return;

      summary.addEventListener('click', () => {
        const isOpen = el.hasAttribute('open');
        if (!isOpen) {
          requestAnimationFrame(() => {
            const body = el.querySelector('div, p, table, .val-body');
            if (body) {
              body.style.animation = 'stepSlideIn 0.24s var(--anim-quick) both';
            }
          });
        }
      });
    });
  }

  // ─────────────────────────────────────────────────────────────
  //  Boot
  // ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initFadeIn();
    initMagnetic();
    initAnimatedText();
    initStickyStack();
    initMarquee();
    initCounters();
    initCalculatorFeedback();
    initSmoothAccordion();
  });

  // Exponer para uso manual desde otros scripts
  window.SyTMotion = {
    fadeIn: initFadeIn,
    magnetic: initMagnetic,
    animatedText: initAnimatedText,
    stickyStack: initStickyStack,
    marquee: initMarquee,
    counters: initCounters,
    calculatorFeedback: initCalculatorFeedback,
    smoothAccordion: initSmoothAccordion,
    SPRING,
  };
})();