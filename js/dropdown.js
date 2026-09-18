/* ── Gooey Dropdown Craft ──
   Requires gooey.js + gooey-common.js loaded first, and the
   dropdown markup/SVG defs (ddTrigger, ddContent, ddItemList,
   gooeyBlobPathDD, etc.) present in the page. */
(function () {
  const triggerEl = document.getElementById('ddTrigger');
  if (!triggerEl) return;

  let ddSide = 'right';
  const ddInst = createGooeyInstance({
    triggerEl,
    contentEl: document.getElementById('ddContent'),
    itemListEl: document.getElementById('ddItemList'),
    blobPathEl: document.getElementById('gooeyBlobPathDD'),
    blobSvgEl: document.getElementById('gooeyBlobSvgDD'),
    blurFilterEl: document.getElementById('gooeyBlurDD'),
    maskSvgEl: document.getElementById('gooeyMaskSvg'),
    maskPathEl: document.getElementById('gooeyMaskPath'),
    position: 'dropdown-right'
  });

  triggerEl.addEventListener('click', e => {
    e.stopPropagation();
    ddInst.toggle();
    syncGooeyColors();
  });
  document.addEventListener('click', e => {
    if (ddInst.getOpen() && !document.getElementById('ddTriggerOuter').contains(e.target)) ddInst.close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ddInst.getOpen()) ddInst.close(); });
  document.querySelectorAll('#ddItemList .lq-menu-item').forEach(item => {
    item.addEventListener('click', () => { if (ddInst.getOpen()) ddInst.close(); });
  });

  /* mobile: hide Users item in dropdown */
  function syncDDMobileItems() {
    document.querySelectorAll('.dd-mobile-hide').forEach(el => {
      el.style.display = window.innerWidth <= 480 ? 'none' : '';
    });
  }
  syncDDMobileItems();
  window.addEventListener('resize', syncDDMobileItems);

  /* side toggle */
  const sideToggle = document.getElementById('ddSideToggle');
  if (sideToggle) {
    sideToggle.addEventListener('click', () => {
      ddSide = ddSide === 'right' ? 'left' : 'right';
      document.getElementById('ddSideLabel').textContent = ddSide;
      ddInst.setPosition(ddSide === 'right' ? 'dropdown-right' : 'dropdown-left');
      /* apply immediately to the content element */
      const el = document.getElementById('ddContent');
      if (ddSide === 'left') { el.style.left = '0'; el.style.right = ''; }
      else { el.style.right = '0'; el.style.left = ''; }
      if (ddInst.getOpen()) ddInst.close();
    });
  }
})();
