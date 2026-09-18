/* ── macOS Dock-style Magnification Craft ──
   Self-contained: expects #dockRow containing .dock-item buttons
   and #dockMagTrack for the custom minimal magnification slider. */
(function () {
  const row = document.getElementById('dockRow');
  if (!row) return;
  const items = Array.prototype.slice.call(row.querySelectorAll('.dock-item'));
  if (!items.length) return;

  let MAX_SCALE = 1.75;

  let rafId = null;
  let pendingX = null;
  let pendingY = null;

  function apply(clientX, clientY) {
    const visibleItems = items.filter(el => el.offsetWidth > 0);
    const rects = items.map(el => el.getBoundingClientRect());
    const visibleRects = visibleItems.map(el => el.getBoundingClientRect());
    const pitch = visibleRects.length > 1 ? (visibleRects[1].left - visibleRects[0].left) : (visibleRects[0] ? visibleRects[0].width : 40);
    const sigma = pitch * 0.9;

    items.forEach((el, i) => {
      if (el.offsetWidth === 0) return;
      const rect = rects[i];
      const base = el.offsetWidth;
      const center = rect.left + rect.width / 2;
      const dist = clientX === null ? Infinity : Math.abs(clientX - center);
      const scale = 1 + (MAX_SCALE - 1) * Math.exp(-(dist * dist) / (2 * sigma * sigma));
      const extra = base * (scale - 1);

      el.style.transform = 'scale(' + scale.toFixed(3) + ')';
      el.style.marginLeft = (extra / 2).toFixed(2) + 'px';
      el.style.marginRight = (extra / 2).toFixed(2) + 'px';
      el.style.zIndex = String(100 + Math.round(scale * 10));
    });

    updateTooltip(clientX, clientY);
  }

  function schedule(clientX, clientY) {
    pendingX = clientX;
    pendingY = clientY;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      apply(pendingX, pendingY);
    });
  }

  /* ── hover tooltip ── */
  let tooltipEl = null, hoveredItem = null;

  function ensureTooltipEl() {
    if (tooltipEl) return;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'dock-tooltip';
    document.body.appendChild(tooltipEl);
  }

  function positionTooltip(item) {
    const rect = item.getBoundingClientRect();
    tooltipEl.style.left = (rect.left + rect.width / 2) + 'px';
    tooltipEl.style.top = (rect.top - (window.innerWidth <= 768 ? 24 : 10)) + 'px';
  }

  function showTooltipFor(item) {
    ensureTooltipEl();
    tooltipEl.textContent = item.dataset.label || item.getAttribute('aria-label') || '';
    positionTooltip(item);
    tooltipEl.classList.add('visible');
  }

  function hideTooltip() {
    hoveredItem = null;
    if (tooltipEl) tooltipEl.classList.remove('visible');
  }

  function closestItem(clientX) {
    let minDist = Infinity, closest = null;
    items.forEach(el => {
      if (el.offsetWidth === 0) return;
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const d = Math.abs(clientX - center);
      if (d < minDist) { minDist = d; closest = el; }
    });
    return closest;
  }

  function updateTooltip(clientX, clientY) {
    if (clientX === null || clientY === null) { hideTooltip(); return; }
    const item = closestItem(clientX);
    if (!item) { hideTooltip(); return; }

    if (item === hoveredItem) {
      if (tooltipEl && tooltipEl.classList.contains('visible')) positionTooltip(item);
      return;
    }

    hoveredItem = item;
    showTooltipFor(item);
  }

  row.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') schedule(e.clientX, e.clientY);
  });

  row.addEventListener('pointerleave', () => {
    schedule(null, null);
  });

  items.forEach(el => {
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const rect = el.getBoundingClientRect();
      schedule(rect.left + rect.width / 2, rect.top);
      setTimeout(() => schedule(null, null), 260);
    });
  });

  window.addEventListener('resize', () => schedule(null, null));

  /* ── Custom Minimal Dock Magnification Slider Logic ── */
  const magTrack = document.getElementById('dockMagTrack');
  const magFill = document.getElementById('dockMagFill');
  const magThumb = document.getElementById('dockMagThumb');
  const magValEl = document.getElementById('dockMagVal');

  if (magTrack && magFill && magThumb && magValEl) {
    const minScale = 1.0, maxScale = 2.2, step = 0.05;
    let currentVal = 1.8;
    let active = false;

    function pct(v) { return ((v - minScale) / (maxScale - minScale)) * 100; }
    function clp(v) { return Math.max(minScale, Math.min(maxScale, v)); }
    function rnd(v) { return parseFloat((Math.round(v / step) * step).toFixed(2)); }

    function updateMagUI(v) {
      const p = pct(v);
      magFill.style.width = p + '%';
      magThumb.style.left = p + '%';
      magValEl.textContent = v.toFixed(2) + '×';
      MAX_SCALE = v;
      apply(pendingX, pendingY);
    }

    function setMagVal(v) {
      currentVal = clp(rnd(v));
      magTrack.setAttribute('aria-valuenow', currentVal);
      magTrack.setAttribute('aria-valuetext', currentVal.toFixed(2) + '×');
      updateMagUI(currentVal);
    }

    updateMagUI(currentVal);

    function posToVal(clientX) {
      const rect = magTrack.getBoundingClientRect();
      if (!rect.width) return minScale;
      const pctX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      return clp(minScale + (pctX / 100) * (maxScale - minScale));
    }

    function onDown(e) {
      e.preventDefault();
      magTrack.setPointerCapture(e.pointerId);
      active = true;
      magTrack.classList.add('active');
      const val = posToVal(e.clientX);
      setMagVal(val);
    }

    function onMove(e) {
      if (!active) return;
      const val = posToVal(e.clientX);
      setMagVal(val);
    }

    function onUp(e) {
      if (!active) return;
      active = false;
      magTrack.classList.remove('active');
    }

    magTrack.addEventListener('pointerdown', onDown);
    magTrack.addEventListener('pointermove', onMove);
    magTrack.addEventListener('pointerup', onUp);
    magTrack.addEventListener('pointercancel', onUp);

    magTrack.addEventListener('keydown', (e) => {
      const s = e.shiftKey ? 0.2 : 0.05;
      let n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') n = currentVal + s;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') n = currentVal - s;
      else if (e.key === 'Home') n = minScale;
      else if (e.key === 'End') n = maxScale;
      if (n !== null) {
        e.preventDefault();
        setMagVal(clp(rnd(n)));
      }
    });
  }
})();
