/**
 * conditions-v2.js - Controlador interactivo para el carrusel de 10 condiciones
 * Cumple con WCAG 2.1 AA (teclado, ARIA, accesibilidad) y resortes de motion.js
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    // 1. Carrusel Diapositiva a Diapositiva (10 Condiciones)
    var deck = document.querySelector('[data-condition-deck]');
    var tabs = Array.from(document.querySelectorAll('.condition-tab[data-condition-index]'));
    var slides = Array.from(document.querySelectorAll('[data-condition-slide]'));
    var prevBtn = document.querySelector('[data-condition-prev]');
    var nextBtn = document.querySelector('[data-condition-next]');
    var countEl = document.querySelector('[data-condition-count]');

    if (deck && tabs.length && slides.length) {
      deck.setAttribute('data-ready', 'true');
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

        // Actualizar slides (solo la activa se muestra en pantalla)
        slides.forEach(function(slide, i) {
          var isActive = (i === currentIndex);
          slide.classList.toggle('is-active', isActive);
        });

        // Actualizar contador visual (01 / 10)
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

      // Inicializar en la lámina 1
      goToSlide(0, false);
    }

    // 2. Tabs de Guía de Cuidado (Asiento, Maletero, Daños)
    var careStory = document.querySelector('[data-care-story]');
    var careTabs = Array.from(document.querySelectorAll('.care-tab[data-care-index]'));
    var carePanels = Array.from(document.querySelectorAll('[data-care-panel]'));

    if (careStory && careTabs.length && carePanels.length) {
      careStory.setAttribute('data-ready', 'true');
      var careCurrent = 0;

      function goToCare(idx) {
        if (idx < 0) idx = 0;
        if (idx >= carePanels.length) idx = carePanels.length - 1;
        careCurrent = idx;

        careTabs.forEach(function(tab, i) {
          var active = (i === careCurrent);
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        carePanels.forEach(function(panel, i) {
          panel.classList.toggle('is-active', i === careCurrent);
        });
      }

      careTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          var idx = parseInt(tab.getAttribute('data-care-index'), 10);
          if (!isNaN(idx)) goToCare(idx);
        });
      });

      goToCare(0);
    }
  });
})();
