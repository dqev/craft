/* ── Stacking Toast Notification Craft ── */
(function () {
  const toastStack = document.getElementById("tstStack");
  const showBtn = document.getElementById("tstShowBtn");

  if (!toastStack || !showBtn) return;

  const MAX_TOASTS = 4;
  const TOAST_DURATION = 2200;

  let toastIdCounter = 0;
  let toasts = [];

  const TOAST_MESSAGE = "Copied to clipboard!";

  function renderStack() {
    const total = toasts.length;

    toasts.forEach((toast, index) => {
      const depth = total - 1 - index;
      const scale = 1 - depth * 0.05;
      const yOffset = depth * -6;
      const opacity = 1 - depth * 0.18;
      const zIndex = total - depth;

      toast.element.style.zIndex = zIndex;
      toast.element.style.opacity = opacity;
      toast.element.style.transform = `translateX(-50%) translateY(${yOffset}px) scale(${scale})`;
    });
  }

  function createToast(text) {
    const id = ++toastIdCounter;

    const el = document.createElement("div");
    el.className = "tst-item";
    el.innerHTML = `
      <svg class="tst-check-icon" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.60416 8.80469L5.24999 11.8125L12.3958 2.1875" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="tst-text">${text}</span>
    `;

    el.style.transform = `translateX(-50%) translateY(16px) scale(0.9)`;
    el.style.opacity = `0`;

    toastStack.appendChild(el);

    const toastObj = { id, text, element: el };
    toasts.push(toastObj);

    if (toasts.length > MAX_TOASTS) {
      const removed = toasts.shift();
      dismissToast(removed);
    }

    requestAnimationFrame(() => {
      renderStack();
    });

    setTimeout(() => {
      dismissToast(toastObj);
    }, TOAST_DURATION);
  }

  function dismissToast(toastObj) {
    const idx = toasts.indexOf(toastObj);
    if (idx !== -1) {
      toasts.splice(idx, 1);
    }

    toastObj.element.style.opacity = `0`;
    toastObj.element.style.transform = `translateX(-50%) translateY(-12px) scale(0.95)`;

    setTimeout(() => {
      if (toastObj.element && toastObj.element.parentNode) {
        toastObj.element.parentNode.removeChild(toastObj.element);
      }
    }, 250);

    renderStack();
  }

  showBtn.addEventListener("click", () => {
    createToast(TOAST_MESSAGE);
  });
})();
