/* Navegacion SyT v2 --------------------------------------------------------
   Dos recorridos claros: descubrir/reservar y clientes que ya coordinan.
   Se comparte entre todas las páginas estáticas para evitar menús divergentes. */
(function(){
  "use strict";

  function currentPage(){
    var name = window.location.pathname.split("/").pop();
    return name || "index.html";
  }

  function hasPage(pages){ return pages.indexOf(currentPage()) !== -1; }
  function path(page){ return window.location.pathname.indexOf("/comunas/") !== -1 ? "../" + page : page; }

  function normalizeBrand(){
    var brand = document.querySelector(".site-header .brand");
    if(!brand) return;
    brand.textContent = "SyT";
    brand.setAttribute("href", path("index.html"));
    document.querySelectorAll('.site-header .nav-actions a[href$="solicitud.html"]').forEach(function(link){
      link.setAttribute("href", path("solicitud.html"));
    });
    brand.setAttribute("aria-label", "SyT — Sol y Tierra, inicio");
  }

  function buildDesktop(){
    var nav = document.querySelector(".nav-links");
    if(!nav) return;
    var clothes = ["catalogo.html","valorizacion.html","guia-visual-traje.html","anatomia-traje-tobas.html"];
    var before = ["condiciones.html","guia-tallaje.html","preguntas-frecuentes.html"];
    var client = ["intranet.html","contacto.html","privacidad.html"];
    nav.setAttribute("aria-label","Navegaci&oacute;n principal");
    nav.innerHTML =
      '<a class="'+(hasPage(["index.html"])?"active":"")+'" href="'+path("index.html")+'">Inicio</a>'+
      '<div class="nav-dropdown '+(hasPage(clothes)?"active":"")+'">'+
        '<span class="nav-dropdown-trigger" tabindex="0">Nuestros trajes <span aria-hidden="true">&#9662;</span></span>'+
        '<div class="nav-dropdown-menu">'+
          '<a href="'+path("catalogo.html")+'">Ver los trajes</a>'+
          '<a href="'+path("guia-visual-traje.html")+'">Piezas del traje</a>'+
          '<a href="'+path("valorizacion.html")+'">Precio, garant&iacute;a y da&ntilde;os</a>'+
        '</div>'+
      '</div>'+
      '<div class="nav-dropdown '+(hasPage(before)?"active":"")+'">'+
        '<span class="nav-dropdown-trigger" tabindex="0">Antes de reservar <span aria-hidden="true">&#9662;</span></span>'+
        '<div class="nav-dropdown-menu">'+
          '<a href="'+path("condiciones.html")+'">C&oacute;mo funciona el arriendo</a>'+
          '<a href="'+path("guia-tallaje.html")+'">Gu&iacute;a de tallas</a>'+
          '<a href="'+path("condiciones.html")+'#faq">Dudas frecuentes</a>'+
        '</div>'+
      '</div>'+
      '<div class="nav-dropdown '+(hasPage(client)?"active":"")+'">'+
        '<span class="nav-dropdown-trigger" tabindex="0">Ya reserv&eacute; <span aria-hidden="true">&#9662;</span></span>'+
        '<div class="nav-dropdown-menu">'+
      '<a href="'+path("intranet.html")+'">Portal del cliente</a>'+
          '<a href="'+path("contacto.html")+'">Contacto y seguimiento</a>'+
        '</div>'+
      '</div>';
  }

  function buildMobile(){
    var menu = document.querySelector(".mobile-menu");
    if(!menu) return;
    menu.setAttribute("aria-label","Navegaci&oacute;n m&oacute;vil");
    menu.innerHTML =
      '<div class="mobile-nav-main" aria-label="P&aacute;ginas principales">'+
        '<a class="mobile-nav-primary" href="'+path("index.html")+'">Inicio</a>'+
        '<a class="mobile-nav-primary" href="'+path("catalogo.html")+'">Trajes y colores</a>'+
        '<a class="mobile-nav-primary" href="'+path("condiciones.html")+'">Condiciones del arriendo</a>'+
        '<a class="mobile-nav-cta" href="'+path("solicitud.html")+'">Reservar trajes</a>'+
      '</div>'+
      '<details class="mobile-nav-guides">'+
        '<summary>Gu&iacute;as para clientes</summary>'+
        '<div class="mobile-nav-guides-list">'+
          '<a href="'+path("guia-visual-traje.html")+'">Piezas del traje</a>'+
          '<a href="'+path("guia-tallaje.html")+'">Prueba de tallas</a>'+
          '<a href="'+path("valorizacion.html")+'">Garant&iacute;a, da&ntilde;os y valores</a>'+
          '<a href="'+path("condiciones.html")+'#faq">Preguntas frecuentes</a>'+
        '</div>'+
      '</details>'+
      '<div class="mobile-nav-client">'+
        '<span>Si ya tienes una reserva</span>'+
        '<a class="mobile-nav-portal" href="'+path("intranet.html")+'">Entrar al portal del cliente</a>'+
        '<a class="mobile-nav-contact" href="'+path("contacto.html")+'">Contacto y seguimiento</a>'+
      '</div>';
  }

  function initAccessibility(){
    var main = document.querySelector("main");
    if(!main) return;
    if(!main.id) main.id = "contenido-principal";
    if(document.querySelector(".syt-skip-link")) return;
    var skip = document.createElement("a");
    skip.className = "syt-skip-link";
    skip.href = "#" + main.id;
    skip.textContent = "Saltar al contenido";
    document.body.insertBefore(skip, document.body.firstChild);
  }

  function markCurrentPage(){
    var target = currentPage();
    document.querySelectorAll(".site-header a[href]").forEach(function(link){
      var href = (link.getAttribute("href") || "").split("#")[0].split("?")[0];
      var file = href.split("/").pop() || "index.html";
      if(file === target) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function initPrivacyNotice(){
    var key = "syt_privacy_notice_v1";
    try{ if(localStorage.getItem(key) === "seen") return; }catch(error){}
    if(document.querySelector(".syt-privacy-notice")) return;
    var notice = document.createElement("aside");
    notice.className = "syt-privacy-notice";
    notice.setAttribute("aria-label", "Información de privacidad");
    notice.innerHTML =
      '<div><strong>Privacidad clara</strong><p>No usamos publicidad ni anal&iacute;tica de terceros. Solo guardamos preferencias t&eacute;cnicas.</p></div>'+
      '<div class="syt-privacy-actions"><a href="'+path("privacidad.html")+'">Leer privacidad</a><button type="button">Entendido</button></div>';
    notice.querySelector("button").addEventListener("click", function(){
      try{ localStorage.setItem(key, "seen"); }catch(error){}
      notice.classList.add("is-closing");
      window.setTimeout(function(){ notice.remove(); }, 220);
    });
    document.body.appendChild(notice);
  }

  function wireDropdowns(){
    var nav = document.querySelector(".nav-links");
    if(!nav) return;
    var dropdowns = nav.querySelectorAll(".nav-dropdown");
    function closeAll(except){
      dropdowns.forEach(function(dropdown){
        if(dropdown !== except){
          dropdown.classList.remove("is-open");
          var trigger = dropdown.querySelector(".nav-dropdown-trigger");
          if(trigger) trigger.setAttribute("aria-expanded", "false");
        }
      });
    }
    dropdowns.forEach(function(dropdown){
      var trigger = dropdown.querySelector(".nav-dropdown-trigger");
      if(!trigger) return;
      trigger.setAttribute("role", "button");
      trigger.setAttribute("aria-haspopup", "true");
      trigger.setAttribute("aria-expanded", "false");
      function toggle(){
        var open = !dropdown.classList.contains("is-open");
        closeAll(dropdown);
        dropdown.classList.toggle("is-open", open);
        trigger.setAttribute("aria-expanded", String(open));
      }
      trigger.addEventListener("click", toggle);
      trigger.addEventListener("keydown", function(event){
        if(event.key === "Enter" || event.key === " "){ event.preventDefault(); toggle(); }
        if(event.key === "Escape"){ closeAll(); trigger.focus(); }
      });
    });
    document.addEventListener("click", function(event){ if(!nav.contains(event.target)) closeAll(); });
  }

  function init(){ normalizeBrand(); buildDesktop(); buildMobile(); markCurrentPage(); wireDropdowns(); initAccessibility(); initPrivacyNotice(); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
