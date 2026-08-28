/* Sol y Tierra · Zoom de imágenes (click/tap para ampliar)
   Funciona en mobile y desktop. Sin dependencias. */
(function () {
  "use strict";
  var overlay = null, imgEl = null, closeBtn = null, startScale = 1, curScale = 1, startX = 0, startY = 0, curX = 0, curY = 0;

  function create() {
    overlay = document.createElement("div");
    overlay.className = "syt-zoom-overlay";
    overlay.innerHTML = '<button class="syt-zoom-close" aria-label="Cerrar">&times;</button><div class="syt-zoom-wrap"><img alt=""></div>';
    document.body.appendChild(overlay);
    imgEl = overlay.querySelector("img");
    closeBtn = overlay.querySelector(".syt-zoom-close");
    overlay.addEventListener("click", function (e) { if (e.target === overlay || e.target === closeBtn) close(); });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay.classList.contains("on")) close(); });
    // pinch zoom on mobile
    var touches = {};
    overlay.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) { touches.dist = dist(e.touches); touches.scale = curScale; }
      if (e.touches.length === 1) { startX = e.touches[0].clientX - curX; startY = e.touches[0].clientY - curY; }
    }, { passive: true });
    overlay.addEventListener("touchmove", function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        var d = dist(e.touches);
        curScale = Math.max(1, Math.min(4, (d / touches.dist) * touches.scale));
        apply();
      } else if (e.touches.length === 1 && curScale > 1) {
        e.preventDefault();
        curX = e.touches[0].clientX - startX;
        curY = e.touches[0].clientY - startY;
        apply();
      }
    }, { passive: false });
    overlay.addEventListener("touchend", function () { if (curScale === 1) { curX = 0; curY = 0; apply(); } });
  }
  function dist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  function apply() { imgEl.style.transform = "translate(" + curX + "px," + curY + "px) scale(" + curScale + ")"; }
  function open(src, alt) {
    if (!overlay) create();
    curScale = 1; curX = 0; curY = 0;
    imgEl.src = src; imgEl.alt = alt || "";
    imgEl.style.transform = "";
    overlay.classList.add("on");
    document.body.style.overflow = "hidden";
  }
  function close() { overlay.classList.remove("on"); document.body.style.overflow = ""; }

  function init() {
    var imgs = document.querySelectorAll(".traje-stack-item img, .photo img, figure img[loading], .piece-img, .ref-img, .zoomable, .traje-card img");
    imgs.forEach(function (img) {
      if (img.closest(".syt-zoom-overlay")) return;
      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () { open(img.src, img.alt); });
    });
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();