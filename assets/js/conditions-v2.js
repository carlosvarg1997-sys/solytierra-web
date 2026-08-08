(function () {
  'use strict';

  function initTabs(root, tabSelector, panelSelector, indexAttribute, options) {
    if (!root) return;
    const tabs = Array.from(root.querySelectorAll(tabSelector));
    const panels = Array.from(root.querySelectorAll(panelSelector));
    if (!tabs.length || tabs.length !== panels.length) return;

    let activeIndex = 0;
    const show = function (nextIndex, moveFocus) {
      activeIndex = Math.max(0, Math.min(panels.length - 1, nextIndex));
      tabs.forEach(function (tab, index) {
        const active = index === activeIndex;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.setAttribute('tabindex', active ? '0' : '-1');
      });
      panels.forEach(function (panel, index) {
        const active = index === activeIndex;
        panel.classList.toggle('is-active', active);
        panel.setAttribute('aria-hidden', String(!active));
      });
      if (options && options.counter) {
        options.counter.textContent = String(activeIndex + 1).padStart(2, '0') + ' / ' + String(panels.length).padStart(2, '0');
      }
      if (options && options.previous) options.previous.disabled = activeIndex === 0;
      if (options && options.next) options.next.disabled = activeIndex === panels.length - 1;
      if (moveFocus) {
        tabs[activeIndex].focus();
        tabs[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    };

    tabs.forEach(function (tab, index) {
      tab.setAttribute('id', root.dataset.tabPrefix + '-tab-' + index);
      panels[index].setAttribute('id', root.dataset.tabPrefix + '-panel-' + index);
      tab.setAttribute('aria-controls', panels[index].id);
      panels[index].setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', function () { show(Number(tab.dataset[indexAttribute]), false); });
      tab.addEventListener('keydown', function (event) {
        let target = null;
        if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = tabs.length - 1;
        if (target !== null) {
          event.preventDefault();
          show(target, true);
        }
      });
    });
    if (options && options.previous) options.previous.addEventListener('click', function () { show(activeIndex - 1, false); });
    if (options && options.next) options.next.addEventListener('click', function () { show(activeIndex + 1, false); });
    root.dataset.ready = 'true';
    show(0, false);
  }

  const conditionDeck = document.querySelector('[data-condition-deck]');
  if (conditionDeck) {
    conditionDeck.dataset.tabPrefix = 'condition';
    initTabs(conditionDeck, '[data-condition-index]', '[data-condition-slide]', 'conditionIndex', {
      counter: conditionDeck.querySelector('[data-condition-count]'),
      previous: conditionDeck.querySelector('[data-condition-prev]'),
      next: conditionDeck.querySelector('[data-condition-next]')
    });
  }

  const careStory = document.querySelector('[data-care-story]');
  if (careStory) {
    careStory.dataset.tabPrefix = 'care';
    initTabs(careStory, '[data-care-index]', '[data-care-panel]', 'careIndex');
  }
})();
