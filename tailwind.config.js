/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────
//  Sol y Tierra · v3 "Atardecer" — tokens de marca
//  Fuente única: SISTEMA_DISENO_SOL_Y_TIERRA.md
//  Wordmark, hero glow, franja CTA, números de pasos → grad.
// ─────────────────────────────────────────────────────────────
module.exports = {
  content: [
    "./*.html",
    "./comunas/**/*.html",
    "./anatomia-traje-tobas.html",
    "./assets/js/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Atardecer (marca, del logo) ──────────────────────
        lima: {       // verde-lima (inicio del degradado)
          DEFAULT: '#B8D827',
          light:   '#C8E445',
          dark:    '#9CB820',
        },
        verde: {      // verde (letra "Sol" del logo)
          DEFAULT: '#6CB52E',
          light:   '#8BCB4F',
          dark:    '#54921F',
        },
        oro: {        // amarillo-oro (estrellas, realces)
          DEFAULT: '#F8C20C',
          light:   '#FFD43F',
          dark:    '#D9A400',
        },
        naranja: {    // naranja (continente, sol cálido)
          DEFAULT: '#F5871E',
          light:   '#FBB04A',
          dark:    '#D66F10',
        },
        tierra: {     // coral (acento primario, botones)
          DEFAULT: '#F0452E',
          light:   '#F56B57',
          dark:    '#C53620',
        },
        frambuesa: {  // magenta-rosa (final del degradado, alertas)
          DEFAULT: '#E62864',
          light:   '#FF4F86',
          dark:    '#C21551',
        },
        fucsia: {     // alias semántico de frambuesa
          DEFAULT: '#E62864',
          light:   '#FF4F86',
          dark:    '#C21551',
        },
        // alias "sol" mantenido para retro-compatibilidad de clases existentes
        sol: {
          DEFAULT: '#F5871E',
          light:   '#FBB04A',
          dark:    '#D66F10',
        },
        // ── Tinta / texto cálido ───────────────────────────
        ink: {        // para texto/links sobre blanco (WCAG AA)
          DEFAULT: '#D62149',
          light:   '#E04A6E',
          dark:    '#A8193A',
        },
        // ── Neutros (fondo BLANCO manda) ────────────────────
        carbon: {     // texto principal
          DEFAULT: '#241C17',
          light:   '#75695E',
          dark:    '#140F0B',
        },
        arena: {      // secciones suaves (blanco cálido casi imperceptible)
          DEFAULT: '#FFFBF5',
          light:   '#FFFFFF',
          dark:    '#FBF8F3',
        },
        crema: {      // alias de arena (compatibilidad con código previo)
          DEFAULT: '#FFFFFF',
          light:   '#FFFFFF',
          dark:    '#FFFBF5',
        },
        linea: {      // bordes cálidos
          DEFAULT: '#EFE6DC',
          light:   '#FFFFFF',
          dark:    '#E5DACB',
        },
        // ── Color de producto (trajes: solo en chips/fotos) ──
        turquesa: {   // traje turquesa Tobas
          DEFAULT: '#16B5A6',
          light:   '#33C9BB',
          dark:    '#0E8F84',
        },
        // ── Semánticos ─────────────────────────────────────
        ok:     { DEFAULT: '#15924E' }, // pagado / completo
        alerta: { DEFAULT: '#E62864' }, // vencidos
        // ── WhatsApp (brand color) ─────────────────────────
        whatsapp: {
          DEFAULT: '#25D366',
          dark:    '#1DA851',
        },
      },
      fontFamily: {
        sora:    ['Sora', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      // El sello de marca: el degradado del logo.
      backgroundImage: {
        'grad':  'linear-gradient(125deg,#B8D827 0%,#6CB52E 15%,#F8C20C 43%,#F5871E 63%,#F0452E 82%,#E62864 100%)',
        'grad-x': 'linear-gradient(90deg,#B8D827 0%,#6CB52E 15%,#F8C20C 43%,#F5871E 63%,#F0452E 82%,#E62864 100%)',
        'grad-soft': 'linear-gradient(125deg,rgba(184,216,39,.10),rgba(240,69,46,.10))',
      },
      borderRadius: {
        'default': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px',
      },
      maxWidth: {
        'container-max': '1280px',
      },
      boxShadow: {
        'warm':   '0 4px 20px -2px rgba(240, 69, 46, 0.10), 0 2px 8px -1px rgba(245, 135, 30, 0.06)',
        'warm-lg':'0 10px 30px -5px rgba(240, 69, 46, 0.14), 0 4px 12px -2px rgba(245, 135, 30, 0.08)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
