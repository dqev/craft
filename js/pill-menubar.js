/* ── Pill Menubar Slider Craft ──
   Self-contained: expects #pmsNav / #pmsSlider with .pms-item children. */
(function () {
  var nav = document.getElementById('pmsNav');
  var slider = document.getElementById('pmsSlider');
  if (!nav || !slider) return;
  var items = Array.prototype.slice.call(nav.querySelectorAll('.pms-item'));

  function moveSliderTo(el, animate) {
    var x = Math.round(el.offsetLeft);
    var w = Math.round(el.offsetWidth);
    if (animate === false) slider.style.transition = 'none';
    slider.style.width = w + 'px';
    slider.style.transform = 'translateX(' + x + 'px)';
    if (animate === false) {
      slider.getBoundingClientRect();
      slider.style.transition = '';
    }
  }

  function setActive(el) {
    items.forEach(function (i) {
      var isActive = i === el;
      i.classList.toggle('active', isActive);
      i.setAttribute('aria-selected', String(isActive));
    });
    moveSliderTo(el, true);
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      if (item.classList.contains('active')) return;
      setActive(item);
    });
  });

  function getActiveItem() {
    return nav.querySelector('.pms-item.active') || items[0];
  }

  requestAnimationFrame(function () {
    moveSliderTo(getActiveItem(), false);
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      moveSliderTo(getActiveItem(), false);
    }, 100);
  });
})();
