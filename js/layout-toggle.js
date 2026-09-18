/* ── Craft Layout View Switcher (Grid / Row List with Fluid Pill Slider) ── */
(function () {
  const STORAGE_KEY = 'craft_layout_mode';
  const gridEl = document.querySelector('.craft-grid');
  const navEl = document.getElementById('layoutNav');
  const sliderEl = document.getElementById('layoutSlider');
  const btnListView = document.getElementById('btnListView');
  const btnGridView = document.getElementById('btnGridView');

  if (!gridEl || !navEl || !sliderEl || !btnListView || !btnGridView) return;

  function moveSliderTo(el, animate) {
    if (!el) return;
    const x = Math.round(el.offsetLeft);
    const w = Math.round(el.offsetWidth);
    if (animate === false) {
      sliderEl.style.transition = 'none';
    }
    sliderEl.style.width = w + 'px';
    sliderEl.style.transform = 'translateX(' + x + 'px)';
    if (animate === false) {
      // Force reflow
      sliderEl.getBoundingClientRect();
      sliderEl.style.transition = '';
    }
  }

  function setViewMode(mode, animate) {
    const isAnimate = animate !== false;
    const targetBtn = mode === 'list' ? btnListView : btnGridView;

    if (mode === 'list') {
      gridEl.classList.add('list-view');
      btnListView.classList.add('active');
      btnListView.setAttribute('aria-selected', 'true');
      btnGridView.classList.remove('active');
      btnGridView.setAttribute('aria-selected', 'false');
    } else {
      gridEl.classList.remove('list-view');
      btnGridView.classList.add('active');
      btnGridView.setAttribute('aria-selected', 'true');
      btnListView.classList.remove('active');
      btnListView.setAttribute('aria-selected', 'false');
    }

    moveSliderTo(targetBtn, isAnimate);

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}

    // Trigger window resize so squircle clip paths re-evaluate seamlessly
    window.dispatchEvent(new Event('resize'));
  }

  btnListView.addEventListener('click', function () {
    setViewMode('list', true);
  });

  btnGridView.addEventListener('click', function () {
    setViewMode('grid', true);
  });

  // Restore initial mode
  const initialMode = (function () {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'list' ? 'list' : 'grid';
    } catch (e) {
      return 'grid';
    }
  })();

  requestAnimationFrame(function () {
    setViewMode(initialMode, false);
  });

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const activeBtn = navEl.querySelector('.layout-btn.active') || btnGridView;
      moveSliderTo(activeBtn, false);
    }, 50);
  });
})();
