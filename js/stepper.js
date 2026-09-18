/* ── Stepper / Counter Craft ──
   Self-contained: expects #stpDec, #stpInc buttons and #stpValue (text
   node) inside #stpValueWrap. The digit swaps with a small blur+slide
   transition — smooth, no spring/bounce overshoot. */
(function () {
  const dec = document.getElementById('stpDec');
  const inc = document.getElementById('stpInc');
  const wrap = document.getElementById('stpValueWrap');
  const valueEl = document.getElementById('stpValue');
  if (!dec || !inc || !wrap || !valueEl) return;

  const MIN = 0, MAX = 99;
  let value = parseInt(valueEl.textContent, 10) || 0;
  let animating = false;

  /* smooth, no-overshoot easing — matches the pill-menubar slider fix */
  const EASE_IN = 'ease-in';
  const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

  function outKF(dir) {
    return [
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      { opacity: 0, transform: `translateY(${dir * -12}px)`, filter: 'blur(3px)' }
    ];
  }
  function inKF(dir) {
    return [
      { opacity: 0, transform: `translateY(${dir * 12}px)`, filter: 'blur(3px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }
    ];
  }

  function syncButtons() {
    dec.disabled = value <= MIN;
    inc.disabled = value >= MAX;
  }

  function setValue(next, dir) {
    if (animating || next === value || next < MIN || next > MAX) return;
    animating = true;
    value = next;

    const outAnim = valueEl.animate(outKF(dir), { duration: 120, easing: EASE_IN, fill: 'forwards' });

    outAnim.finished.then(() => {
      /* drop the forward-filled "hidden" state now that we're about to
         swap the text — otherwise it lingers underneath the next
         animation and the number never reappears once it finishes. */
      outAnim.cancel();
      valueEl.textContent = String(value);
      syncButtons();

      const inAnim = valueEl.animate(inKF(dir), { duration: 220, easing: EASE_OUT, fill: 'none' });
      inAnim.finished
        .then(() => { inAnim.cancel(); animating = false; })
        .catch(() => { animating = false; });
    }).catch(() => { animating = false; });
  }

  dec.addEventListener('click', () => setValue(value - 1, -1));
  inc.addEventListener('click', () => setValue(value + 1, 1));

  syncButtons();
})();
