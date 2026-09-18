/* ── Gooey Tooltip Craft ──
   Requires gooey.js + gooey-common.js loaded first, and the
   tooltip markup/SVG defs (ttTrigger, ttContent, ttItemList,
   gooeyBlobPathTT, etc.) present in the page. */
(function () {
  const ttTrigger = document.getElementById('ttTrigger');
  if (!ttTrigger) return;

  let ttDir = 'top'; // 'top' = opens above trigger, 'bottom' = opens below

  const ttInst = createGooeyInstance({
    triggerEl: ttTrigger,
    contentEl: document.getElementById('ttContent'),
    itemListEl: document.getElementById('ttItemList'),
    blobPathEl: document.getElementById('gooeyBlobPathTT'),
    blobSvgEl: document.getElementById('gooeyBlobSvgTT'),
    blurFilterEl: document.getElementById('gooeyBlurTT'),
    maskSvgEl: document.getElementById('gooeyMaskSvgTooltip'),
    maskPathEl: document.getElementById('gooeyMaskPathTooltip'),
    position: 'tooltip-top',
    onOpen: () => { syncGooeyColors(); },
    onClose: () => { }
  });

  /* Use pointer events — work on both mouse (hover) and touch (tap) */
  let ttHoverTimer = null;

  ttTrigger.addEventListener('pointerenter', (e) => {
    /* mouse only — touch fires click instead */
    if (e.pointerType === 'mouse') {
      clearTimeout(ttHoverTimer);
      ttInst.open();
      syncGooeyColors();
    }
  });

  ttTrigger.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') {
      /* small delay so tooltip doesn't flicker if cursor briefly leaves */
      ttHoverTimer = setTimeout(() => ttInst.close(), 80);
    }
  });

  /* touch / click: toggle */
  ttTrigger.addEventListener('click', () => {
    ttInst.getOpen() ? ttInst.close() : (ttInst.open(), syncGooeyColors());
  });

  /* close on outside tap */
  document.addEventListener('pointerdown', (e) => {
    if (ttInst.getOpen() && !document.getElementById('ttTriggerOuter').contains(e.target)) {
      ttInst.close();
    }
  });

  /* up/down toggle */
  const dirToggle = document.getElementById('ttDirToggle');
  if (dirToggle) {
    dirToggle.addEventListener('click', () => {
      ttDir = ttDir === 'top' ? 'bottom' : 'top';
      document.getElementById('ttDirLabel').textContent = ttDir;
      const preview = document.querySelector('.gooey-preview-tooltip');
      if (ttDir === 'bottom') {
        preview.classList.add('tt-dir-bottom');
      } else {
        preview.classList.remove('tt-dir-bottom');
      }
      ttInst.setPosition(ttDir === 'top' ? 'tooltip-top' : 'tooltip-bottom');
      if (ttInst.getOpen()) ttInst.close();
    });
  }
})();
