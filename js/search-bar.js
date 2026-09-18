/* ============================================================
   Craft: SVG Bridged Search Bar
   Interactive script for search input & right search button
   ============================================================ */

(function () {
  function initSearchBarCraft() {
    const searchBtn = document.getElementById('sbSearchBtn');
    const searchInput = document.getElementById('sbSearchInput');
    const searchClear = document.getElementById('sbSearchClear');

    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', function () {
        searchInput.focus();
        searchBtn.classList.add('active');
        setTimeout(function () {
          searchBtn.classList.remove('active');
        }, 300);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        const val = e.target.value.trim();
        if (searchClear) {
          searchClear.style.display = val.length > 0 ? 'inline-flex' : 'none';
        }
      });

      if (searchClear) {
        searchClear.addEventListener('click', function () {
          searchInput.value = '';
          searchClear.style.display = 'none';
          searchInput.focus();
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchBarCraft);
  } else {
    initSearchBarCraft();
  }
})();
