/* Sol: asistente contextual. Nunca abre la ventana por cuenta propia. */
(function () {
  "use strict";

  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = window.SYT_API_BASE || (local ? "http://127.0.0.1:8000" : "https://api.arriendostrajestobas.cl");
  var WSP = window.SYT_WSP_NUM || window.WSP_NUM || "";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var token = sessionStorage.getItem("syt_sol_token") || ("syt-" + crypto.getRandomValues(new Uint32Array(2)).join("-"));
  sessionStorage.setItem("syt_sol_token", token);
  var visitorName = sessionStorage.getItem("syt_sol_nombre") || "";
  var mode = "bot";
  var ws = null;
  var started = false;
  var unread = 0;
  var nudgeTimer = null;
  var nudgeCount = 0;
  var lastNudge = 0;

  function esc(value) { return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function format(value) { return esc(value).replace(/\*([^*]+)\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>"); }
  function wa(text) { return WSP ? "https://wa.me/" + WSP + "?text=" + encodeURIComponent(text || "") : "solicitud.html"; }
  function create(tag, cls, html) { var node = document.createElement(tag); if (cls) node.className = cls; if (html != null) node.innerHTML = html; return node; }
  function pageKind() {
    var path = location.pathname.toLowerCase();
    if (/catalogo|traje|anatomia|guia-visual/.test(path)) return "catalogo";
    if (/condiciones|valorizacion|preguntas/.test(path)) return "condiciones";
    if (/solicitud|contacto/.test(path)) return "solicitud";
    if (/intranet|ficha-online/.test(path)) return "intranet";
    return "inicio";
  }

  var icon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 2.4v2.6M12 19v2.6M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2.4 12h2.6M19 12h2.6M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9"/></g></svg>';
  var root = create("div", "sol-root");
  root.dataset.open = "false";
  root.innerHTML = [
    '<div class="sol-nudge" role="status"></div>',
    '<button class="sol-fab" type="button" aria-label="Abrir el asistente Sol" aria-expanded="false">' + icon + '<span class="sol-notify" hidden>0</span></button>',
    '<section class="sol-panel" role="dialog" aria-label="Asistente Sol" aria-modal="false">',
    '<header class="sol-head"><span class="sol-avatar">' + icon + '</span><div class="sol-head-txt"><strong>Sol</strong><span class="sol-sub">Asistente de compra</span></div><button class="sol-x" type="button" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></header>',
    '<div class="sol-body" aria-live="polite"></div><div class="sol-quick"></div>',
    '<form class="sol-input" autocomplete="off"><input type="text" name="q" placeholder="Escribe tu pregunta…" aria-label="Escribe tu mensaje" maxlength="280"><button type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12l16-8-6 16-3-7-7-1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></button></form>',
    '</section>'
  ].join("");
  document.body.appendChild(root);

  var fab = root.querySelector(".sol-fab");
  var panelBody = root.querySelector(".sol-body");
  var quick = root.querySelector(".sol-quick");
  var form = root.querySelector(".sol-input");
  var input = form.querySelector("input");
  var sub = root.querySelector(".sol-sub");
  var nudge = root.querySelector(".sol-nudge");
  var badge = root.querySelector(".sol-notify");
  if (pageKind() === "solicitud") root.classList.add("sol-context-solicitud");

  function addMessage(text, who) {
    var item = create("div", "sol-msg sol-" + (who || "bot"), format(text));
    panelBody.appendChild(item);
    panelBody.scrollTop = panelBody.scrollHeight;
    return item;
  }
  function addSystem(text) { var item = create("div", "sol-sys", esc(text)); panelBody.appendChild(item); panelBody.scrollTop = panelBody.scrollHeight; }
  function typing(on) {
    var item = panelBody.querySelector(".sol-typing");
    if (on && !item) { item = create("div", "sol-msg sol-bot sol-typing", "<span></span><span></span><span></span>"); panelBody.appendChild(item); }
    if (!on && item) item.remove();
    panelBody.scrollTop = panelBody.scrollHeight;
  }
  function setQuick(items) {
    quick.innerHTML = "";
    (items || []).forEach(function (label) {
      var button = create("button", "sol-chip", esc(label));
      button.type = "button";
      button.addEventListener("click", function () { send(label); });
      quick.appendChild(button);
    });
  }
  function addAction(label, href) {
    var a = create("a", "sol-cta", esc(label));
    a.href = href;
    if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
    else a.addEventListener("click", close);
    panelBody.appendChild(a);
  }
  function addButton(label, action) { var button = create("button", "sol-cta", esc(label)); button.type = "button"; button.addEventListener("click", action); panelBody.appendChild(button); }

  function contextWelcome() {
    var map = {
      inicio: ["Te ayudo a entender *precio, garantía y pasos* antes de reservar.", ["Calcular para mi curso", "¿Cómo funciona la garantía?", "Quiero reservar"]],
      catalogo: ["¿Estás comparando trajes? Puedo ayudarte a elegir color y pasar directo a la cotización.", ["Comparar colores", "¿Qué incluye cada traje?", "Cotizar mi curso"]],
      condiciones: ["Te resumo las condiciones importantes en lenguaje simple: garantía, horario, traslado y cuidados.", ["Explícame la garantía", "¿Qué pasa si me atraso?", "¿Cómo es el retiro?"]],
      solicitud: ["Te acompaño bloque por bloque. Si algo no está claro, pregúntame antes de enviar.", ["¿Qué pago al reservar?", "¿Cómo funciona el tallaje?", "¿Qué debo aceptar?"]],
      intranet: ["En la intranet puedes completar tallas, revisar hitos y descargar documentos del arriendo confirmado.", ["No encuentro mi código", "¿Cómo completo las tallas?", "Hablar por WhatsApp"]]
    };
    return map[pageKind()];
  }

  function handleData(data) {
    typing(false);
    if (data.reply) addMessage(data.reply, "bot");
    if (data.cta && data.cta.tipo === "whatsapp") offerHuman(data.cta.url || wa("Hola Sol y Tierra. Quiero ayuda con mi arriendo."));
    if (data.cta && data.cta.tipo === "reservar") addAction("Continuar con la solicitud", "solicitud.html");
    setQuick(data.quick_replies || []);
  }

  function send(value) {
    var message = String(value != null ? value : input.value).trim();
    if (!message) return;
    addMessage(message, "user");
    input.value = "";
    setQuick([]);
    if (mode === "live") {
      if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type: "msg", texto: message }));
      else offerHuman(wa("Hola Sol y Tierra. Quiero continuar la conversación por WhatsApp."));
      return;
    }
    typing(true);
    fetch(API + "/api/asistente", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mensaje: message, contexto: pageKind() }) })
      .then(function (response) { if (!response.ok) throw new Error(String(response.status)); return response.json(); })
      .then(handleData)
      .catch(function () { typing(false); addMessage("Ahora no pude conectarme. Puedes dejar la solicitud guardada para que el equipo la revise.", "bot"); addAction("Completar solicitud", "solicitud.html"); });
  }

  function offerHuman(url) {
    if (!WSP || !/^https:\/\/wa\.me\//.test(url || "")) {
      addMessage("El canal oficial de WhatsApp aún no está configurado en este entorno. Tu solicitud sí puede quedar guardada en el sistema.", "bot");
      addAction("Completar solicitud", "solicitud.html");
      return;
    }
    fetch(API + "/api/live/estado").then(function (response) { return response.json(); }).then(function (state) {
      if (state && state.disponible) { addButton("Hablar en vivo con el equipo", startLive); addAction("O continuar por WhatsApp", url); }
      else addAction("Continuar por WhatsApp", url);
    }).catch(function () { addAction("Continuar por WhatsApp", url); });
  }

  function startLive() {
    if (mode === "live") return;
    var wsBase = API.replace(/^http/, "ws");
    ws = new WebSocket(wsBase + "/api/live/ws/" + encodeURIComponent(token) + "?nombre=" + encodeURIComponent(visitorName));
    mode = "live";
    sub.textContent = "Conectando con el equipo…";
    ws.onmessage = function (event) {
      var data; try { data = JSON.parse(event.data); } catch (_) { return; }
      if (data.type === "msg" && data.from === "operador") addMessage(data.texto, "bot");
      if (data.type === "status" && data.estado === "conectado") { sub.textContent = "Atención en vivo"; addSystem("Ya estás hablando con el equipo."); }
      if (data.type === "status" && data.estado === "cerrado") endLive();
    };
    ws.onerror = function () { endLive(); offerHuman(wa("Hola Sol y Tierra. Quiero hablar con una persona.")); };
    ws.onclose = function () { if (mode === "live") endLive(); };
  }
  function endLive() { mode = "bot"; ws = null; sub.textContent = "Asistente de compra"; }

  function showLeadForm() {
    if (panelBody.querySelector(".sol-lead")) return;
    var lead = create("form", "sol-lead");
    lead.innerHTML = '<label>Nombre<input name="nombre" required maxlength="80" autocomplete="name"></label><label>WhatsApp<span class="sol-phone"><i>+56 9</i><input name="tel" inputmode="numeric" required maxlength="8"></span></label><label>Correo (opcional)<input name="email" type="email" maxlength="120" autocomplete="email"></label><label style="grid-template-columns:20px 1fr;align-items:start"><input name="privacy" type="checkbox" required style="width:18px;height:18px"> <span>Acepto la <a href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</span></label><button type="submit">Guardar y coordinar</button>';
    panelBody.appendChild(lead);
    lead.addEventListener("submit", function (event) {
      event.preventDefault();
      var tel = String(lead.tel.value || "").replace(/\D/g, "").slice(0, 8);
      var name = lead.nombre.value.trim();
      if (!name || tel.length !== 8 || !lead.privacy.checked) return;
      var phone = "+569" + tel;
      lead.querySelector("button").disabled = true;
      fetch(API + "/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: name, telefono: phone, email: lead.email.value.trim() || null, mensaje: "Lead desde Sol · contexto " + pageKind(), acepta_privacidad: true, consentimiento_version: "2026-08-05" }) })
        .then(function (response) { if (!response.ok) throw new Error(String(response.status)); return response.json(); })
        .then(function () { visitorName = name; sessionStorage.setItem("syt_sol_nombre", name); lead.remove(); addMessage("Listo, *guardé tu solicitud*. El siguiente paso es completar fecha, cantidad y color.", "bot"); addAction("Completar solicitud", "solicitud.html"); })
        .catch(function () { lead.remove(); addMessage("No pude guardarla aquí. Completa el formulario principal para no perder tus datos.", "bot"); addAction("Ir al formulario", "solicitud.html"); });
    });
  }

  function open() {
    root.dataset.open = "true";
    fab.setAttribute("aria-expanded", "true");
    nudge.classList.remove("on");
    unread = 0;
    badge.hidden = true;
    if (!started) {
      started = true;
      var welcome = contextWelcome();
      addMessage(welcome[0], "bot");
      setQuick(welcome[1]);
      if (pageKind() === "solicitud") addAction("Ir al formulario", "solicitud.html#blk-1");
    }
    setTimeout(function () { input.focus(); }, reduce ? 0 : 180);
  }
  function close() { root.dataset.open = "false"; fab.setAttribute("aria-expanded", "false"); fab.focus(); }

  function showNudge(message) {
    var now = Date.now();
    if (root.dataset.open === "true" || nudgeCount >= 4 || now - lastNudge < 14000 || document.hidden) return;
    nudge.innerHTML = format(message);
    nudge.classList.add("on");
    lastNudge = now;
    nudgeCount += 1;
    unread += 1;
    badge.textContent = String(unread);
    badge.hidden = false;
    clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(function () { nudge.classList.remove("on"); }, 10000);
  }

  var nudges = {
    inicio: "¿Organizando el baile? Te explico *precio, garantía y pasos* sin hacerte leer todo.",
    catalogo: "¿Comparas colores? Te ayudo a elegir y pasar directo a la *cotización*.",
    condiciones: "Puedo resumirte las *condiciones que más afectan la garantía*.",
    solicitud: "Estoy aquí para guiarte *bloque por bloque* antes de enviar.",
    intranet: "¿Necesitas tu código o completar tallas? Te explico el siguiente paso."
  };
  setTimeout(function () { showNudge(nudges[pageKind()]); }, reduce ? 2500 : 4500);

  document.addEventListener("click", function (event) {
    var step = event.target.closest && event.target.closest("[data-step]");
    if (step && pageKind() === "solicitud") {
      var messages = { "1": "Partimos por el *colegio y responsable*.", "2": "La fecha permite revisar *disponibilidad real*.", "3": "Con la cantidad calculamos arriendo, garantía y reserva.", "4": "La ficha online guarda avances y valida tallas.", "5": "Revisa, acepta las condiciones y envía la solicitud." };
      setTimeout(function () { showNudge(messages[step.dataset.step] || nudges.solicitud); }, 650);
    }
    var quote = event.target.closest && event.target.closest("a[href*='solicitud'],button[onclick*='goTo']");
    if (quote && pageKind() === "catalogo") setTimeout(function () { showNudge("Buen paso. Ahora te ayudo con *cantidad, fecha y color*."); }, 450);
    var colorCard = event.target.closest && event.target.closest(".traje-stack-item,.traje-card");
    if (colorCard && pageKind() === "catalogo") {
      var color = (colorCard.textContent.match(/Rojo|Azul|Fucsia/i) || ["ese color"])[0];
      sessionStorage.setItem("syt_color_interes", color);
      setTimeout(function () { showNudge("Elegiste *" + color + "*. El siguiente paso es confirmar cantidad y fecha para revisar disponibilidad."); }, 350);
    }
    var condition = event.target.closest && event.target.closest("details, .cond-card, .visual-rule, .condition-slide, .care-panel");
    if (condition && pageKind() === "condiciones") setTimeout(function () { showNudge("Si esta regla está clara, puedo explicarte *qué debes hacer antes de la reunión*."); }, 450);
  });

  window.addEventListener("syt:request-step", function (event) {
    if (pageKind() !== "solicitud") return;
    var messages = { 1: "Partimos por el *colegio y responsable*.", 2: "La fecha permite revisar *disponibilidad real*.", 3: "Con la cantidad calculamos arriendo, garantía y reserva.", 4: "La ficha online guarda avances y valida tallas.", 5: "Revisa, acepta las condiciones y envía la solicitud." };
    var step = Number(event.detail && event.detail.step) || 1;
    setTimeout(function () { showNudge(messages[step] || nudges.solicitud); }, 800);
  });

  var unshelveTimer = null;
  document.addEventListener("focusin", function (event) {
    if (pageKind() !== "solicitud" || root.contains(event.target) || !event.target.matches("input,textarea,select")) return;
    clearTimeout(unshelveTimer);
    nudge.classList.remove("on");
    root.classList.add("sol-shelved");
  });
  document.addEventListener("focusout", function (event) {
    if (pageKind() !== "solicitud" || root.contains(event.target) || !event.target.matches("input,textarea,select")) return;
    clearTimeout(unshelveTimer);
    unshelveTimer = setTimeout(function () { root.classList.remove("sol-shelved"); }, 700);
  });

  fab.addEventListener("click", function () { root.dataset.open === "true" ? close() : open(); });
  nudge.addEventListener("click", open);
  root.querySelector(".sol-x").addEventListener("click", close);
  form.addEventListener("submit", function (event) { event.preventDefault(); send(); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape" && root.dataset.open === "true") close(); });
  window.addEventListener("syt:open-chat", open);
  window.addEventListener("syt:lead", function () { open(); showLeadForm(); });

  fetch(API + "/api/asistente/estado").then(function (response) { return response.json(); }).then(function (state) { if (state && state.wsp) WSP = state.wsp; }).catch(function () {});
})();
