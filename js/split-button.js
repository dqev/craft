/* ── Split Button Craft ──
   Self-contained: expects a container with id="sbContainer" in the page. */
(function () {
  const c = document.getElementById('sbContainer');
  if (!c) return;

  const TAGS = [
    {
      label: 'Home',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z" fill="currentColor" opacity="0.5"/><path d="M9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25H9Z" fill="currentColor"/></svg>`
    },
    {
      label: 'Users',
      mobileHidden: true,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="17" rx="7" ry="4" fill="currentColor" opacity="0.5"/><circle cx="12" cy="6" r="4" fill="currentColor"/></svg>`
    },
    {
      label: 'Shop',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4.0828 10.8943C4.52171 8.55339 4.74117 7.38295 5.57434 6.69147C6.40752 6 7.59835 6 9.98003 6H14.0209C16.4026 6 17.5934 6 18.4266 6.69147C19.2598 7.38295 19.4792 8.55339 19.9181 10.8943L20.6681 14.8943C21.2853 18.186 21.5939 19.8318 20.6942 20.9159C19.7945 22 18.12 22 14.7709 22H9.23003C5.88097 22 4.20644 22 3.30672 20.9159C2.40701 19.8318 2.7156 18.186 3.3328 14.8943L4.0828 10.8943Z" fill="currentColor" opacity="0.5"/><path d="M9.75 5C9.75 3.75736 10.7574 2.75 12 2.75C13.2426 2.75 14.25 3.75736 14.25 5V6C14.816 6.00018 15.3119 6.00174 15.7499 6.01488C15.75 6.00993 15.75 6.00497 15.75 6V5C15.75 2.92893 14.0711 1.25 12 1.25C9.92893 1.25 8.25 2.92893 8.25 5V6C8.25 6.00498 8.25005 6.00995 8.25015 6.01491C8.68814 6.00175 9.18397 6.00021 9.75 6.00002V5Z" fill="currentColor"/></svg>`
    }
  ];

  /* mobile (≤480px): hide Users, show Home + Shop; desktop: all three */
  const activeTags = () => window.innerWidth <= 480
    ? TAGS.filter(t => !t.mobileHidden)
    : TAGS;

  const SPRING = 'linear(0 0%,.2688 9.91%,.386 15%,.492 20.19%,.586 25.5%,' +
    '.671 30.93%,.744 36.51%,.808 42.26%,.859 47.98%,.902 53.93%,' +
    '.937 60.13%,.963 66.67%,.981 73.4%,.993 80.76%,.999 88.89%,1 100%)';
  const DUR_IN = 320, DUR_OUT = 200, STAGGER = 45;
  let sbAnimating = false;

  const IN_KF = [{ opacity: 0, transform: 'scale(0.75)', filter: 'blur(8px)' },
  { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }];
  const OUT_KF = [{ opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
  { opacity: 0, transform: 'scale(0.75)', filter: 'blur(8px)' }];

  function makePill(type, tag, onClick) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'sb-pill' + (type === 'back' ? ' sb-back' : '');
    if (type === 'back') {
      el.setAttribute('aria-label', 'Back');
      el.innerHTML = `<svg class="sb-close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    } else if (typeof tag === 'string') {
      /* plain trigger button — just a text label */
      el.textContent = tag;
    } else {
      /* tag object with svg + label */
      el.innerHTML = `${tag.svg}<span>${tag.label}</span>`;
    }
    el.addEventListener('click', onClick);
    return el;
  }

  const sbAnimIn = (el, delay = 0) => {
    el.classList.add('sb-animating');
    const a = el.animate(IN_KF, { duration: DUR_IN, delay, easing: SPRING, fill: 'backwards' });
    a.finished.then(() => el.classList.remove('sb-animating'));
    return a.finished;
  };
  const sbAnimOut = (el) =>
    el.animate(OUT_KF, { duration: DUR_OUT, easing: 'ease-in', fill: 'forwards' }).finished;

  async function sbOpen(container, btn) {
    if (sbAnimating) return;
    sbAnimating = true;
    await sbAnimOut(btn);
    btn.remove();
    const back = makePill('back', '', () => sbClose(container));
    const tags = activeTags().map(t => makePill('tag', t, () => sbClose(container)));
    const items = [back, ...tags];
    items.forEach(el => container.appendChild(el));
    await Promise.all(items.map((el, i) => sbAnimIn(el, i * STAGGER)));
    sbAnimating = false;
  }

  async function sbClose(container) {
    if (sbAnimating) return;
    sbAnimating = true;
    const items = [...container.children];
    await Promise.all(items.map(el => sbAnimOut(el)));
    items.forEach(el => el.remove());
    const btn = makePill('button', 'Click!', () => sbOpen(container, btn));
    container.appendChild(btn);
    await sbAnimIn(btn);
    sbAnimating = false;
  }

  const btn = makePill('button', 'Click!', () => sbOpen(c, btn));
  c.appendChild(btn);
  sbAnimIn(btn, 120);
})();
