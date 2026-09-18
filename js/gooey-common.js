/* ── Gooey flood-color sync with theme ──
   Shared helper used by both the dropdown and tooltip craft demos.
   Keeps the SVG <feFlood> fill in sync with --gooey-surface whenever
   the theme (light/dark) changes. */
function syncGooeyColors() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--gooey-surface').trim();
  ['gooeyFloodDD', 'gooeyFloodTT'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('flood-color', bg);
  });
}
syncGooeyColors();

/* re-sync flood color when theme changes */
new MutationObserver(syncGooeyColors).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
