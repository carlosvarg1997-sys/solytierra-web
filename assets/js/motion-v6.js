/* SyT motion v6: un solo observer, animación finita y sin duplicar data-fade. */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var selectors = [
    ".section-head",
    ".faq-section details",
    ".care-panel.is-active .care-copy",
    ".personal-choice",
    ".personal-cord",
    ".pin-option"
  ];
  function init(){
    var nodes = Array.prototype.slice.call(document.querySelectorAll(selectors.join(","))).filter(function(el){
      return !el.hasAttribute("data-fade") && !el.closest("[data-fade]");
    });
    if(reduce || !("IntersectionObserver" in window)) return;
    nodes.forEach(function(el){ el.classList.add("syt-motion-item"); });
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:"0px 0px -28px 0px"});
    nodes.forEach(function(el){ observer.observe(el); });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
