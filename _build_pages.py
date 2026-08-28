# -*- coding: utf-8 -*-
"""Genera las páginas internas del sitio con el estilo compartido (styt.css)."""
import os, unicodedata
BASE = os.path.dirname(os.path.abspath(__file__))
WSP = "56900000000"  # numero real de Sol y Tierra

def head(title, desc, depth):
    up = "../" * depth
    return ('<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      '<title>' + title + '</title><meta name="description" content="' + desc + '">'
      '<link rel="preconnect" href="https://fonts.googleapis.com">'
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
      '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Manrope:wght@400;500;600&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">'
      '<link rel="stylesheet" href="' + up + 'assets/css/styt.css"></head><body>')

def header(depth):
    up = "../" * depth; logo = "../" * (depth + 1) + "logo%20sol%20y%20tierra.png"
    return ('<header id="hd"><div class="wrap nav">'
      '<a class="brand" href="' + up + 'index.html"><img src="' + logo + '" alt="Sol y Tierra" onerror="this.style.display=\'none\'"> Sol y Tierra</a>'
      '<nav class="nav-links"><a href="' + up + 'index.html#como">Cómo funciona</a><a href="' + up + 'catalogo.html">Trajes</a>'
      '<a href="' + up + 'index.html#precio">Precio</a><a href="' + up + 'preguntas-frecuentes.html">Preguntas</a></nav>'
      '<a class="btn btn-dark" href="#" onclick="wsp(\'Hola! Quiero cotizar trajes de Tobas para mi curso.\');return false;">Cotizar</a>'
      '</div></header>')

def footer(depth):
    up = "../" * depth; logo = "../" * (depth + 1) + "logo%20sol%20y%20tierra.png"
    return ('<footer><div class="wrap"><div class="foot">'
      '<div><a class="brand" href="' + up + 'index.html"><img src="' + logo + '" alt="" style="height:36px" onerror="this.style.display=\'none\'"> Sol y Tierra</a>'
      '<p style="color:var(--soft);margin-top:12px;max-width:34ch;font-size:.92rem">Arriendo de vestuario folclórico para colegios. Trajes de Tobas completos para Fiestas Patrias.</p></div>'
      '<div><h4>Enlaces</h4><a href="' + up + 'index.html#como">Cómo funciona</a><a href="' + up + 'catalogo.html">Trajes</a><a href="' + up + 'preguntas-frecuentes.html">Preguntas</a><a href="' + up + 'contacto.html">Contacto</a></div>'
      '<div><h4>Contacto</h4><a href="' + up + 'contacto.html">Santa Bárbara 4049, Recoleta</a><a href="#" onclick="wsp(\'Hola!\');return false;">WhatsApp</a><a href="#">Instagram</a></div>'
      '</div><div class="foot-b"><span>© 2026 Sol y Tierra SpA</span><span>Único lugar de retiro y devolución: Recoleta</span></div></div></footer>')

FAB = ('<a class="fab" href="#" onclick="wsp(\'Hola! Quiero cotizar trajes de Tobas.\');return false;" aria-label="WhatsApp">'
  '<svg width="29" height="29" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/></svg></a>')

SCRIPT = ('<script>var WSP="' + WSP + '";function wsp(t){window.open("https://wa.me/"+WSP+"?text="+encodeURIComponent(t),"_blank");}'
  'function f(n){return "$"+Math.round(n).toLocaleString("es-CL");}'
  'function calc(){var e=document.getElementById("n");if(!e)return;var n=Math.max(1,Math.min(60,parseInt(e.value||0)));'
  'document.getElementById("arr").textContent=f(n*35000);document.getElementById("gar").textContent=f(n*10000);document.getElementById("res").textContent=f(n*35000/2+n*10000);}'
  'function step(d){var i=document.getElementById("n");i.value=Math.max(1,Math.min(60,(parseInt(i.value)||0)+d));calc();}'
  'function cotizar(){var x=document.getElementById("n");var n=x?x.value:1;wsp("Hola! Quiero cotizar "+n+" trajes de Tobas para mi curso (arriendo aprox "+f(n*35000)+"). ¿Tienen disponibilidad?");}'
  'function tg(b){b.parentElement.classList.toggle("on");}'
  'function enviarLead(e){e.preventDefault();function g(id){var x=document.getElementById(id);return x?x.value:"";}'
  'wsp("Hola! Soy "+g("ln")+" del "+g("lcol")+" ("+g("lcom")+"). Necesito "+g("lt")+" trajes para el "+g("lf")+". ¿Cotizamos?");return false;}'
  'addEventListener("scroll",function(){var h=document.getElementById("hd");if(h)h.classList.toggle("sc",scrollY>8);});'
  'var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{threshold:.12});'
  'document.querySelectorAll(".reveal").forEach(function(el){io.observe(el);});calc();</script>')

def cta_block():
    return ('<div class="wrap"><div class="cta reveal"><h2>¿Listos para el 18 de septiembre?</h2>'
      '<p>Las fechas de septiembre se llenan rápido. Asegura el vestuario de tu curso hoy.</p>'
      '<a class="btn btn-white" href="#" onclick="wsp(\'Hola! Quiero reservar trajes de Tobas para mi curso.\');return false;">Escríbenos por WhatsApp</a></div></div>')

def page(path, depth, body, title, desc):
    html = head(title, desc, depth) + header(depth) + body + footer(depth) + FAB + SCRIPT + "</body></html>"
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(html)
    print("OK", path)

def slug(s):
    s = s.lower().replace(" ", "-")
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")

# ---------- CATÁLOGO ----------
catalogo = ('<section class="hero"><div class="wrap"><span class="eyebrow"><span class="dot"></span>Catálogo</span>'
  '<h1>Trajes de Tobas completos, <span class="muted">en los colores que tu curso quiera.</span></h1>'
  '<p class="lead" style="max-width:60ch">Cada traje incluye todas las piezas y accesorios. Tallas S a 2XL, para curso completo (5 a 45 trajes).</p></div></section>'
  '<section class="block"><div class="wrap"><div class="trajes">'
  '<div class="tj reveal"><div class="top t-rojo"></div><div class="b">Rojo<small>Peto, falda, chaqueta, faldón, penacho</small></div></div>'
  '<div class="tj reveal"><div class="top t-azul"></div><div class="b">Azul<small>Tallas S a 2XL · curso completo</small></div></div>'
  '<div class="tj reveal"><div class="top t-turq"></div><div class="b">Turquesa<small>Incluye accesorios</small></div></div>'
  '<div class="tj reveal"><div class="top t-fuc"></div><div class="b">Fucsia<small>Combinaciones a pedido</small></div></div>'
  '</div></div></section>'
  '<section class="block"><div class="wrap"><div class="sec-head"><span class="eyebrow"><span class="dot"></span>Qué incluye</span>'
  '<h2>Un traje completo, <span class="muted">listo para el escenario.</span></h2></div>'
  '<div class="cols"><div class="col hl"><h3>Mujer</h3><p>Peto + falda.</p></div>'
  '<div class="col"><h3>Hombre</h3><p>Chaqueta + faldón.</p></div>'
  '<div class="col"><h3>Para todos</h3><p>Penacho de plumas + set de accesorios.</p></div>'
  '<div class="col"><h3>Tallas</h3><p>S a 2XL. Cubrimos a todo el curso.</p></div></div></div></section>'
  + cta_block())

# ---------- PREGUNTAS ----------
faqs = [
  ("¿Cuánto cuesta?", "$35.000 por traje + $10.000 de garantía reembolsable. Ej: 1 traje = $35.000 + $10.000 de garantía que se devuelve."),
  ("¿Cómo reservo?", "Pagas el 50% del arriendo más la garantía para asegurar la fecha. El saldo, hasta 24 horas antes del retiro."),
  ("¿Dónde se retira y devuelve?", "En La coordinación de retiro y devolución se entrega al confirmar la reserva."),
  ("¿Qué incluye el traje?", "Mujer: peto + falda. Hombre: chaqueta + faldón. Para todos: penacho y accesorios. Tallas S a 2XL."),
  ("¿Qué pasa si lo devuelvo tarde?", "Como el traje lo usa otro curso el mismo día, hay multas por atraso informadas en el compromiso: tolerancia 10 min, luego 30%, 80% o 100% según el retraso."),
  ("¿Y si llueve o se suspende?", "Se evalúa reprogramar si hay disponibilidad. En caso de fuerza mayor, se devuelve el 70% del arriendo y la garantía completa."),
  ("¿Puedo modificar el traje?", "No se puede coser, cortar ni ajustar. El lavado y mantención los hacemos nosotros tras la devolución."),
  ("¿Necesito firmar algo?", "Sí: un Compromiso de Arriendo con todas las condiciones. Te lo enviamos ya rellenado, listo para imprimir y firmar."),
]
qa = "".join('<div class="qa"><button onclick="tg(this)">' + q + ' <span class="pl">+</span></button><div class="a"><p>' + a + '</p></div></div>' for q, a in faqs)
preguntas = ('<section class="hero"><div class="wrap"><span class="eyebrow"><span class="dot"></span>Preguntas frecuentes</span>'
  '<h1>Todo lo que necesitas saber, <span class="muted">claro y por escrito.</span></h1></div></section>'
  '<section class="block"><div class="wrap"><div class="faq">' + qa + '</div></div></section>' + cta_block())

# ---------- CONTACTO ----------
contacto = ('<section class="hero"><div class="wrap"><span class="eyebrow"><span class="dot"></span>Contacto</span>'
  '<h1>Cuéntanos de tu curso <span class="muted">y te cotizamos al tiro.</span></h1></div></section>'
  '<section class="block"><div class="wrap" style="display:grid;grid-template-columns:1.3fr .7fr;gap:40px">'
  '<form class="form" onsubmit="return enviarLead(event)">'
  '<div><label>Nombre</label><input id="ln" required></div>'
  '<div><label>Teléfono</label><input id="ltel" placeholder="+569…"></div>'
  '<div><label>Colegio</label><input id="lcol" required></div>'
  '<div><label>Comuna</label><input id="lcom"></div>'
  '<div><label>N° de trajes</label><input id="lt" type="number" value="30" min="1"></div>'
  '<div><label>Fecha de presentación</label><input id="lf" type="date" value="2026-09-11"></div>'
  '<div class="full"><button class="btn btn-dark" type="submit" style="width:100%;justify-content:center">Enviar y seguir por WhatsApp</button></div>'
  '</form>'
  '<div><h3 style="margin-bottom:10px">Datos directos</h3>'
  '<p class="lead" style="font-size:1rem">📍 Santa Bárbara 4049, Recoleta<br>Único lugar de retiro y devolución.</p>'
  '<a class="btn btn-dark" style="margin-top:16px" href="#" onclick="wsp(\'Hola!\');return false;">Escríbenos por WhatsApp</a></div>'
  '</div></section>')

# ---------- COMUNAS (SEO) ----------
COMUNAS = ["Puente Alto","Maipú","La Florida","Peñalolén","Recoleta","Renca","Lampa","Quilicura","Huechuraba","Santiago"]
def comuna_body(c):
    return ('<section class="hero"><div class="wrap"><span class="eyebrow"><span class="dot"></span>' + c + '</span>'
      '<h1>Arriendo de trajes de Tobas en ' + c + '. <span class="muted">Vestuario folclórico para tu colegio.</span></h1>'
      '<p class="lead">Arrendamos trajes de Tobas completos por curso para colegios de ' + c + ' y todo Santiago. Retiro en Recoleta, a pasos de ' + c + '.</p>'
      '<div class="hero-cta"><a class="btn btn-dark" href="#" onclick="wsp(\'Hola! Quiero cotizar trajes de Tobas para un colegio de ' + c + '.\');return false;">Cotizar por WhatsApp</a></div></div></section>'
      '<section class="block"><div class="wrap"><div class="sec-head"><span class="eyebrow"><span class="dot"></span>Cómo funciona</span>'
      '<h2>Simple para tu curso de ' + c + '. <span class="muted">Nosotros el resto.</span></h2></div>'
      '<div class="step"><div class="no">01</div><div><h3>Cotiza</h3><p>$35.000 por traje, todo incluido.</p></div></div>'
      '<div class="step"><div class="no">02</div><div><h3>Reserva y firma</h3><p>Abono + garantía y te enviamos el Compromiso listo para firmar.</p></div></div>'
      '<div class="step"><div class="no">03</div><div><h3>Retira y devuelve</h3><p>Retiro en Recoleta; al devolver, te reembolsamos la garantía.</p></div></div></div></section>'
      + cta_block())

# ---------- GENERAR ----------
page("catalogo.html", 0, catalogo, "Catálogo de trajes de Tobas | Sol y Tierra", "Trajes de Tobas completos por curso: peto, falda, chaqueta, faldón, penacho y accesorios. Tallas S a 2XL.")
page("preguntas-frecuentes.html", 0, preguntas, "Preguntas frecuentes | Arriendo trajes de Tobas | Sol y Tierra", "Precio, reserva, retiro, garantía y condiciones del arriendo de trajes de Tobas para colegios.")
page("contacto.html", 0, contacto, "Contacto | Sol y Tierra", "Cotiza el arriendo de trajes de Tobas para tu curso. Santa Bárbara 4049, Recoleta.")
for c in COMUNAS:
    page("comunas/" + slug(c) + ".html", 1, comuna_body(c),
         "Arriendo de trajes de Tobas en " + c + " | Sol y Tierra",
         "Arriendo de trajes de Tobas para colegios en " + c + ". Vestuario completo, garantía reembolsable. Cotiza por WhatsApp.")
print("LISTO")
