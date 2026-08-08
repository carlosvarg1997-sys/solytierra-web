(function(){
  "use strict";

  document.documentElement.classList.add("js");

  var WSP = window.SYT_WSP_NUM || window.WSP_NUM || "56982982495";
  window.WSP_NUM = WSP;
  var IS_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  var API = window.SYT_API_BASE || (IS_LOCAL ? "http://127.0.0.1:8000" : "https://api.arriendostrajestobas.cl");
  var ARRIENDO = 35000;
  var GARANTIA = 10000;

  function $(sel, root){ return (root || document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function money(n){ return "$" + Math.round(n || 0).toLocaleString("es-CL"); }
  function wa(text){ return WSP ? "https://wa.me/" + WSP + "?text=" + encodeURIComponent(text || "") : "solicitud.html"; }

  window.sytMoney = money;
  window.sytWhatsApp = wa;

  function initHeader(){
    var header = $(".site-header");
    var menuBtn = $("[data-menu-toggle]");
    var mobile = $(".mobile-menu");
    if(header){
      var onScroll = function(){ header.classList.toggle("scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, {passive:true});
      onScroll();
    }
    if(menuBtn && mobile){
      menuBtn.setAttribute("aria-expanded", mobile.classList.contains("open") ? "true" : "false");
      menuBtn.addEventListener("click", function(){
        var open = mobile.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      });
      $all("a", mobile).forEach(function(a){
        a.addEventListener("click", function(){
          mobile.classList.remove("open");
          menuBtn.setAttribute("aria-expanded","false");
          menuBtn.setAttribute("aria-label","Abrir menú");
        });
      });
      document.addEventListener("keydown", function(event){
        if(event.key === "Escape" && mobile.classList.contains("open")){
          mobile.classList.remove("open");
          menuBtn.setAttribute("aria-expanded","false");
          menuBtn.setAttribute("aria-label","Abrir menú");
          menuBtn.focus();
        }
      });
    }
  }

  function initReveal(){
    var items = $all(".reveal,[data-fade]");
    function reveal(el){
      if(el.matches("[data-fade]")) el.classList.add("visible");
      if(el.matches(".reveal")) el.classList.add("in");
    }
    if(!("IntersectionObserver" in window)){
      items.forEach(reveal);
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:"0px 0px -40px 0px"});
    items.forEach(function(el){ io.observe(el); });
  }

  function updateCalc(root){
    var input = $("[data-qty]", root);
    if(!input) return;
    var n = Math.max(1, Math.min(80, parseInt(input.value || "0", 10) || 1));
    input.value = n;
    var arriendo = n * ARRIENDO;
    var garantia = n * GARANTIA;
    var reserva = arriendo / 2 + garantia;
    var saldo = arriendo / 2;
    var map = {qty:n, arriendo:arriendo, garantia:garantia, reserva:reserva, saldo:saldo};
    Object.keys(map).forEach(function(key){
      $all("[data-out='" + key + "']", root).forEach(function(el){
        el.textContent = key === "qty" ? String(map[key]) : money(map[key]);
      });
    });
    $all("[data-calc-link]", root).forEach(function(a){
      a.href = "solicitud.html?n=" + encodeURIComponent(n);
    });
  }

  function initCalculators(){
    $all("[data-calc]").forEach(function(root){
      var input = $("[data-qty]", root);
      if(!input) return;
      $all("[data-step]", root).forEach(function(btn){
        btn.addEventListener("click", function(){
          input.value = (parseInt(input.value || "0", 10) || 0) + parseInt(btn.dataset.step || "0", 10);
          updateCalc(root);
        });
      });
      input.addEventListener("input", function(){ updateCalc(root); });
      updateCalc(root);
    });
  }

  function initWhatsApp(){
    $all("[data-wa]").forEach(function(a){
      var text = a.getAttribute("data-wa");
      a.href = wa(text);
      if(!WSP){
        if(a.classList.contains("fab")){ a.hidden = true; return; }
        if(/whatsapp/i.test(a.textContent || "")) a.textContent = "Completar solicitud";
        a.removeAttribute("target");
      }
    });
  }

  function initImageZoom(){
    var images = $all(".photo img,.traje-card>img,.carousel-track img,.visual-rule-img img,.care-media img,.part-media img,.personal-kit img,.pin-option img");
    if(!images.length || !("HTMLDialogElement" in window)) return;
    var dialog = document.createElement("dialog");
    dialog.className = "zoom-dialog";
    dialog.innerHTML = '<button type="button" aria-label="Cerrar imagen">×</button><img alt="">';
    document.body.appendChild(dialog);
    var target = $("img", dialog);
    function close(){ dialog.close(); }
    $("button", dialog).addEventListener("click", close);
    dialog.addEventListener("click", function(event){ if(event.target === dialog) close(); });
    images.forEach(function(img){
      img.classList.add("image-zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", "Ampliar: " + (img.alt || "imagen"));
      function open(){ target.src = img.currentSrc || img.src; target.alt = img.alt || "Imagen ampliada"; dialog.showModal(); }
      img.addEventListener("click", open);
      img.addEventListener("keydown", function(event){ if(event.key === "Enter" || event.key === " "){ event.preventDefault(); open(); } });
    });
  }

  function initLeadForm(){
    var form = $("#lead-form");
    if(!form) return;

    var qs = new URLSearchParams(window.location.search);
    var n = parseInt(qs.get("n") || "0", 10);
    if(n > 0){
      var mujeres = Math.ceil(n / 2);
      var hombres = n - mujeres;
      var h = $("#cant_hombres");
      var m = $("#cant_mujeres");
      if(h) h.value = hombres;
      if(m) m.value = mujeres;
    }

    function get(id){ var el = $("#" + id); return el ? el.value.trim() : ""; }
    function totals(){
      var n = (parseInt(get("cant_hombres"),10) || 0) + (parseInt(get("cant_mujeres"),10) || 0);
      var arriendo = n * ARRIENDO;
      var garantia = n * GARANTIA;
      var reserva = arriendo / 2 + garantia;
      var saldo = arriendo / 2;
      $all("[data-form-out='qty']").forEach(function(el){ el.textContent = String(n); });
      $all("[data-form-out='arriendo']").forEach(function(el){ el.textContent = money(arriendo); });
      $all("[data-form-out='garantia']").forEach(function(el){ el.textContent = money(garantia); });
      $all("[data-form-out='reserva']").forEach(function(el){ el.textContent = money(reserva); });
      $all("[data-form-out='saldo']").forEach(function(el){ el.textContent = money(saldo); });
      return {n:n, arriendo:arriendo, garantia:garantia, reserva:reserva, saldo:saldo};
    }

    ["cant_hombres","cant_mujeres"].forEach(function(id){
      var el = $("#" + id);
      if(el) el.addEventListener("input", totals);
    });
    totals();

    form.addEventListener("submit", function(e){
      e.preventDefault();
      if(!form.checkValidity()){
        form.reportValidity();
        return;
      }
      var t = totals();
      var payload = {
        nombre:get("nombre"),
        telefono:get("telefono"),
        colegio:get("colegio"),
        curso:get("curso"),
        comuna:get("comuna"),
        n_trajes:t.n,
        acepta_privacidad:true,
        consentimiento_version:"2026-08-05",
        mensaje:"Color: " + get("color") + ". Fecha: " + get("fecha_presentacion") + ". Horario baile: " + (get("horario") || "por confirmar") + ". " + get("mensaje")
      };
      var msg = [
        "Hola Sol y Tierra. Vengo del formulario web.",
        "",
        "Nombre: " + payload.nombre,
        "Telefono: " + payload.telefono,
        "Colegio: " + payload.colegio + " - " + (payload.curso || "curso por confirmar"),
        "Comuna: " + (payload.comuna || "por confirmar"),
        "Fecha presentacion: " + (get("fecha_presentacion") || "por confirmar"),
        "Horario baile: " + (get("horario") || "por confirmar"),
        "Cantidad: " + t.n + " trajes (" + get("cant_hombres") + " hombres / " + get("cant_mujeres") + " mujeres)",
        "Color: " + get("color"),
        "",
        "Arriendo: " + money(t.arriendo),
        "Garantia reembolsable: " + money(t.garantia),
        "A pagar para reservar: " + money(t.reserva) + " (abono 50% + garantia)",
        "Saldo 24 h antes del retiro: " + money(t.saldo)
      ].join("\n");

      fetch(API + "/api/leads", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      }).then(function(res){
        if(!res.ok) throw new Error("HTTP " + res.status);
        var ok = $("#lead-success");
        if(ok) ok.classList.add("on");
      }).catch(function(){
        if(WSP) window.open(wa(msg), "_blank", "noopener");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    initHeader();
    initReveal();
    initCalculators();
    initWhatsApp();
    initImageZoom();
    initLeadForm();
  });
})();
