/* ─────────────────────────────────────────────────────────────
   Sol y Tierra · JS compartido (comunes)
   Carga: defer en TODAS las páginas (header, hero, footer, popups).
   Single source of truth: WSP_NUM y LEADS_ENDPOINT (n8n-ready).
   ───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ── 1. Constantes globales (configurables) ──────────────────
  // Número real de WhatsApp de Sol y Tierra. Cambiar en un solo lugar.
  const WSP_NUM = window.SYT_WSP_NUM || '';

  // Endpoint de leads. HOY: opcional (si vacío → solo WhatsApp).
  // MAÑANA: n8n → "Hermot-SyT" crea el documento y responde.
  // Ejemplo: 'https://n8n.arriendostrajestobas.cl/webhook/syt-leads'
  const IS_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const API_BASE = window.SYT_API_BASE || (IS_LOCAL ? 'http://127.0.0.1:8000' : 'https://api.arriendostrajestobas.cl');
  const LEADS_ENDPOINT = API_BASE + '/api/leads';

  // Exponer para que cualquier página (index, contacto, comuna…) las use.
  window.WSP_NUM        = WSP_NUM;
  window.LEADS_ENDPOINT = LEADS_ENDPOINT;

  // ── 2. Helper: link de WhatsApp con texto pre-armado ────────
  window.getWhatsAppLink = function (text) {
    if (!WSP_NUM) return `${window.location.pathname.includes('/comunas/') ? '../' : ''}solicitud.html`;
    return `https://wa.me/${WSP_NUM}?text=${encodeURIComponent(text || '')}`;
  };

  // ── 2b. Auto-rewrite: cualquier <a href="https://wa.me/..."> que use el
  // El canal de WhatsApp se habilita solo cuando existe un número oficial configurado.
  // WSP_NUM arriba actualiza TODA la web (header, hero, footer, popup…).
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href*="wa.me/"]').forEach((link) => {
      try {
        const url = new URL(link.href);
        const phoneInHref = url.pathname.replace(/\//g, '');
        if (!WSP_NUM) {
          link.href = `${window.location.pathname.includes('/comunas/') ? '../' : ''}solicitud.html`;
          link.removeAttribute('target');
          link.setAttribute('aria-label', 'Completar solicitud de arriendo');
        } else if (phoneInHref && phoneInHref !== WSP_NUM) {
          url.pathname = '/' + WSP_NUM;
          link.href = url.toString();
        }
      } catch (_) { /* href mal formado, ignorar */ }
    });
  });

  // ── 3. Helper: enviar lead al endpoint (con fallback) ───────
  // payload: objeto con los datos del formulario.
  // Devuelve una Promise<{ok: boolean, source: 'api'|'fallback'|'no-endpoint', data?: any}>.
  window.submitLead = async function (payload) {
    if (!LEADS_ENDPOINT) {
      // Sin endpoint configurado → el front sigue funcionando vía WhatsApp.
      return { ok: true, source: 'no-endpoint' };
    }
    try {
      const res = await fetch(LEADS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source: 'web-solytierra',
          ts: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      return { ok: true, source: 'api', data };
    } catch (err) {
      console.warn('[SyT] submitLead falló, fallback a WhatsApp:', err);
      return { ok: false, source: 'fallback', error: String(err) };
    }
  };

  // ── 4. Mobile menu, header scroll, smooth scroll, reveal ────
  document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu
    const menuBtn   = document.getElementById('menu-toggle-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
      const icon = menuBtn.querySelector('.material-symbols-outlined, [data-icon]');
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const isHidden = mobileMenu.classList.contains('hidden');
        if (icon) icon.textContent = isHidden ? 'menu' : 'close';
      });
      mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          if (icon) icon.textContent = 'menu';
        });
      });
    }

    // Header scroll
    const header = document.querySelector('header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          header.classList.add('shadow-md', 'bg-white/95', 'backdrop-blur-sm');
          header.classList.remove('bg-crema', 'bg-arena');
        } else {
          header.classList.remove('shadow-md', 'bg-white/95', 'backdrop-blur-sm');
          header.classList.add('bg-crema', 'bg-arena');
        }
      });
    }

    // Smooth scroll para anclas internas
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Reveal on scroll
    const revealElements = document.querySelectorAll('.spring-reveal');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
      );
      revealElements.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'none';
        revealObserver.observe(el);
      });
    } else {
      revealElements.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }

    // Exit-intent popup (CRO)
    initExitIntentPopup();

    // Lead form (WhatsApp HOY / n8n MAÑANA)
    initLeadForm();
  });

  // ── 5. Lead form (WhatsApp HOY / n8n MAÑANA) ───────────────
  // Acepta DOS modos:
  //  (a) <form id="lead-form"> inline en la página (típico en index.html)
  //  (b) <div id="lead-form-slot" data-comuna="…"> → monta el form aquí
  function initLeadForm() {
    const slot = document.getElementById('lead-form-slot');
    if (slot) {
      // Modo (b): inyectar el form en el slot
      const defaults = {
        comuna: slot.dataset.comuna || '',
        colegio: slot.dataset.colegio || '',
        cant_trajes: slot.dataset.cantTrajes || '30',
      };
      slot.innerHTML = getLeadFormHTML(defaults);
    }

    const form = document.getElementById('lead-form');
    if (!form) return;
    const alertBox = document.getElementById('lead-form-alert');

    const showAlert = (msg, type) => {
      if (!alertBox) return;
      alertBox.className = 'mt-4 p-3 rounded-xl text-sm font-semibold ';
      if (type === 'ok') {
        alertBox.classList.add('bg-whatsapp/15', 'text-whatsapp-dark', 'border', 'border-whatsapp/30');
      } else if (type === 'err') {
        alertBox.classList.add('bg-tierra/10', 'text-tierra', 'border', 'border-tierra/30');
      } else {
        alertBox.classList.add('bg-arena', 'text-carbon-light', 'border', 'border-linea');
      }
      alertBox.textContent = msg;
      alertBox.classList.remove('hidden');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 1. Validación HTML5 nativa
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // 2. Recolectar datos del form
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      // 3. Construir el mensaje de WhatsApp
      const fmtDate = (s) => {
        const p = (s || '').split('-');
        return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : (s || '(sin fecha)');
      };
      const msg = [
        `Hola Sol y Tierra! Vengo del formulario web.`,
        ``,
        `👤 Nombre: ${data.nombre || '-'}`,
        `📞 Teléfono: ${data.telefono || '-'}`,
        `🏫 Colegio: ${data.colegio || '-'}`,
        `📍 Comuna: ${data.comuna || '-'}`,
        `👥 N° de trajes: ${data.cant_trajes || '-'}`,
        `📅 Fecha presentación: ${fmtDate(data.fecha_presentacion)}`,
        data.mensaje ? `💬 Mensaje: ${data.mensaje}` : null,
      ].filter(Boolean).join('\n');

      // 4. HOY: abrir WhatsApp con el mensaje pre-armado
      const wspUrl = window.getWhatsAppLink(msg);
      if (WSP_NUM) window.open(wspUrl, '_blank', 'noopener');

      // 5. MAÑANA: enviar a LEADS_ENDPOINT (no bloquea el flujo de WhatsApp)
      showAlert('Enviando a nuestro sistema…', 'info');
      try {
        const result = await window.submitLead({
          ...data,
          n_trajes: Number(data.cant_trajes || 0),
          acepta_privacidad: data.acepta_privacidad === 'true',
          consentimiento_version: '2026-08-05'
        });
        if (result.source === 'api') {
          showAlert('✅ Solicitud guardada. Te confirmamos por WhatsApp al tiro.', 'ok');
        } else if (result.source === 'no-endpoint') {
          showAlert('✅ Listo. Te confirmamos por WhatsApp en breve.', 'ok');
        } else {
          showAlert('⚠️ Te contactaremos por WhatsApp. (No pudimos guardar la solicitud, pero tu mensaje está en camino.)', 'err');
        }
      } catch (_) {
        showAlert('⚠️ Te contactaremos por WhatsApp.', 'err');
      }
    });
  }

  // HTML del formulario (idéntico al de index.html, parametrizable)
  function getLeadFormHTML(d = {}) {
    const comuna = d.comuna || '';
    const colegio = d.colegio || '';
    const cantTrajes = d.cant_trajes || '30';
    return `
      <form id="lead-form" class="bg-white rounded-3xl p-6 md:p-8 shadow-warm-lg border border-linea/40" novalidate>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-bold text-carbon-light uppercase tracking-wide">Nombre del encargado *</span>
            <input name="nombre" type="text" required autocomplete="name"
                   class="rounded-xl border-linea bg-arena px-4 py-3 text-carbon focus:border-tierra focus:ring-tierra"
                   placeholder="Nombre y apellido">
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-bold text-carbon-light uppercase tracking-wide">Teléfono (WhatsApp) *</span>
            <input name="telefono" type="tel" required autocomplete="tel"
                   class="rounded-xl border-linea bg-arena px-4 py-3 text-carbon font-mono focus:border-tierra focus:ring-tierra"
                   placeholder="+56 9 1234 5678">
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-bold text-carbon-light uppercase tracking-wide">Colegio *</span>
            <input name="colegio" type="text" required
                   class="rounded-xl border-linea bg-arena px-4 py-3 text-carbon focus:border-tierra focus:ring-tierra"
                   placeholder="Colegio Santa María" value="${colegio.replace(/"/g, '&quot;')}">
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-bold text-carbon-light uppercase tracking-wide">Comuna *</span>
            <input name="comuna" type="text" required list="comunas-list"
                   class="rounded-xl border-linea bg-arena px-4 py-3 text-carbon focus:border-tierra focus:ring-tierra"
                   placeholder="Recoleta" value="${comuna.replace(/"/g, '&quot;')}">
            <datalist id="comunas-list">
              <option value="Santiago"><option value="Puente Alto"><option value="Maipú">
              <option value="La Florida"><option value="Peñalolén"><option value="Recoleta">
              <option value="Renca"><option value="Lampa"><option value="Quilicura">
              <option value="Huechuraba"><option value="Ñuñoa"><option value="La Pintana">
              <option value="San Bernardo">
            </datalist>
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-bold text-carbon-light uppercase tracking-wide">N° de trajes *</span>
            <input name="cant_trajes" type="number" required min="5" max="60" value="${cantTrajes}"
                   class="rounded-xl border-linea bg-arena px-4 py-3 text-carbon font-mono focus:border-tierra focus:ring-tierra">
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-bold text-carbon-light uppercase tracking-wide">Fecha de presentación *</span>
            <input name="fecha_presentacion" type="date" required
                   class="rounded-xl border-linea bg-arena px-4 py-3 text-carbon font-mono focus:border-tierra focus:ring-tierra">
          </label>
        </div>
        <label class="flex flex-col gap-1.5 mb-5">
          <span class="text-xs font-bold text-carbon-light uppercase tracking-wide">Mensaje o color preferido (opcional)</span>
          <textarea name="mensaje" rows="2"
                    class="rounded-xl border-linea bg-arena px-4 py-3 text-carbon focus:border-tierra focus:ring-tierra"
                    placeholder="¿Algún color, duda sobre tallas, o requisito especial?"></textarea>
        </label>
        <label class="flex items-start gap-3 mb-5 text-sm text-carbon-light">
          <input name="acepta_privacidad" value="true" type="checkbox" required
                 class="mt-1 h-5 w-5 rounded border-linea text-tierra focus:ring-tierra">
          <span>Acepto el uso de mis datos para gestionar esta solicitud y leí la
            <a href="${window.location.pathname.includes('/comunas/') ? '../' : ''}privacidad.html" class="underline font-bold" target="_blank" rel="noopener">política de privacidad</a>.
          </span>
        </label>
        <button type="submit"
                class="whatsapp-pulse w-full inline-flex items-center justify-center gap-3 bg-whatsapp hover:bg-whatsapp-dark text-white font-extrabold py-4 px-6 rounded-full text-base shadow-md hover:shadow-lg transition-all">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.015 14.114.993 11.98.993c-5.44 0-9.866 4.372-9.87 9.802 0 1.725.463 3.411 1.341 4.9l-.989 3.612 3.714-.963zm12.355-6.49c-.329-.165-1.947-.961-2.246-1.07-.299-.109-.517-.165-.736.165-.219.329-.848 1.07-1.04 1.29-.19.219-.382.247-.711.082-.329-.165-1.389-.511-2.646-1.632-.977-.872-1.637-1.95-1.829-2.28-.192-.329-.02-.507.145-.671.148-.148.329-.384.493-.576.165-.192.219-.329.329-.548.11-.219.055-.411-.027-.575-.082-.165-.736-1.771-1.009-2.428-.266-.641-.539-.553-.736-.563-.19-.01-.41-.01-.629-.01-.219 0-.576.082-.876.411-.3.329-1.147 1.122-1.147 2.735 0 1.614 1.174 3.179 1.338 3.399.164.22 2.313 3.532 5.602 4.954.783.338 1.393.54 1.867.69.786.25 1.5.215 2.066.13.63-.095 1.947-.796 2.22-1.528.273-.733.273-1.36.192-1.492-.08-.135-.298-.218-.627-.383z"/></svg>
          Enviar y abrir WhatsApp
        </button>
        <p class="text-[11px] text-carbon-light text-center mt-3">Guardamos solo los datos necesarios para cotizar y coordinar el arriendo.</p>
        <div id="lead-form-alert" class="hidden mt-4 p-3 rounded-xl text-sm font-semibold"></div>
      </form>
    `;
  }

  // ── 6. Exit-intent popup ────────────────────────────────────
  function initExitIntentPopup() {
    const popup = document.getElementById('exit-intent-popup');
    if (!popup) return;
    const closeBtn = document.getElementById('close-exit-popup');
    const triggerMobileScroll = 0.7;
    let popupShown = localStorage.getItem('syt_exit_popup_shown') === 'true';

    const showPopup = () => {
      if (popupShown) return;
      popup.classList.remove('hidden');
      popup.classList.add('flex');
      popupShown = true;
      localStorage.setItem('syt_exit_popup_shown', 'true');
    };

    document.addEventListener('mouseleave', (e) => {
      if (e.clientY < 20) showPopup();
    });
    window.addEventListener('scroll', () => {
      if (popupShown) return;
      const scrollPos = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      if (scrollPos / totalHeight > triggerMobileScroll) showPopup();
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
      });
    }
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
      }
    });
  }
})();
