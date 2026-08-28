/**
 * conditions-v2.js - Controlador interactivo para el carrusel de 10 condiciones
 * Cumple con WCAG 2.1 AA (teclado, ARIA, accesibilidad) y resortes de motion.js
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var tabs = Array.from(document.querySelectorAll('.condition-tab[data-condition-index]'));
    var slides = Array.from(document.querySelectorAll('[data-condition-slide]'));
    var prevBtn = document.querySelector('[data-condition-prev]');
    var nextBtn = document.querySelector('[data-condition-next]');
    var countEl = document.querySelector('[data-condition-count]');

    if (!tabs.length || !slides.length) return;

    var currentIndex = 0;
    var total = slides.length;

    function goToSlide(index, focusTab) {
      if (index < 0) index = 0;
      if (index >= total) index = total - 1;
      currentIndex = index;

      // Actualizar tabs
      tabs.forEach(function(tab, i) {
        var isActive = (i === currentIndex);
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive && focusTab) {
          tab.focus();
        }
      });

      // Actualizar slides
      slides.forEach(function(slide, i) {
        var isActive = (i === currentIndex);
        slide.classList.toggle('is-active', isActive);
      });

      // Actualizar contador visual
      if (countEl) {
        var padCur = (currentIndex + 1 < 10 ? '0' : '') + (currentIndex + 1);
        var padTot = (total < 10 ? '0' : '') + total;
        countEl.textContent = padCur + ' / ' + padTot;
      }

      // Estados de botones ant/sig
      if (prevBtn) prevBtn.disabled = (currentIndex === 0);
      if (nextBtn) nextBtn.disabled = (currentIndex === total - 1);
    }

    // Listeners de tabs
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var idx = parseInt(tab.getAttribute('data-condition-index'), 10);
        if (!isNaN(idx)) goToSlide(idx, false);
      });

      tab.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          goToSlide(currentIndex + 1, true);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          goToSlide(currentIndex - 1, true);
        } else if (e.key === 'Home') {
          e.preventDefault();
          goToSlide(0, true);
        } else if (e.key === 'End') {
          e.preventDefault();
          goToSlide(total - 1, true);
        }
      });
    });

    // Botones de navegación
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        goToSlide(currentIndex - 1, false);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        goToSlide(currentIndex + 1, false);
      });
    }

    // Inicializar primer slide
    goToSlide(0, false);
  });
})();
