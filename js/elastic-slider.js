(function () {
  var track = document.getElementById('elsTrack');
  var fill = document.getElementById('elsFill');
  var valueEl = document.getElementById('elsValue');
  var hashMarks = document.getElementById('elsHashMarks');
  if (!track || !fill || !valueEl) return;

  var min = 0, max = 1, step = 0.01;
  var val = 0.5;
  var dragging = false, active = false, click = true;

  function decs(v) {
    var s = String(v), d = s.indexOf('.');
    return d === -1 ? 0 : s.length - d - 1;
  }
  var D = decs(step);

  function rnd(v) { return parseFloat((Math.round(v / step) * step).toFixed(D)); }
  function clp(v) { return Math.max(min, Math.min(max, v)); }
  function pct(v) { return ((v - min) / (max - min)) * 100; }

  function snap(v) {
    var n = (v - min) / (max - min), near = Math.round(n * 10) / 10;
    return Math.abs(n - near) <= 0.03125 ? min + near * (max - min) : v;
  }

  function buildHashes() {
    var ds = (max - min) / step, cnt = ds <= 10 ? ds - 1 : 9;
    hashMarks.innerHTML = '';
    for (var i = 0; i < cnt; i++) {
      var p = ds <= 10 ? ((i + 1) * step) / (max - min) * 100 : (i + 1) * 10;
      var el = document.createElement('div');
      el.className = 'els-hash';
      el.style.left = p + '%';
      hashMarks.appendChild(el);
    }
  }
  buildHashes();

  var EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  function ui(v, instant) {
    var p = pct(v);
    if (instant) {
      fill.style.width = p + '%';
    } else {
      fill.style.transition = 'width 0.35s ' + EASE;
      fill.style.width = p + '%';
      setTimeout(function () { fill.style.transition = ''; }, 400);
    }
    valueEl.textContent = v.toFixed(D);
  }

  function set(v, inst) {
    val = clp(rnd(v));
    track.setAttribute('aria-valuenow', val);
    track.setAttribute('aria-valuetext', val.toFixed(D));
    ui(val, inst);
  }

  ui(val, true);

  var rect0 = null, startX = 0, stretch = 0;

  function computeStretch(cx) {
    if (!rect0) return 0;
    if (cx < rect0.left) {
      var o = Math.max(0, rect0.left - cx - 48);
      return -3 * Math.sqrt(Math.min(o / 300, 1));
    }
    if (cx > rect0.right) {
      var o2 = Math.max(0, cx - rect0.right - 48);
      return 3 * Math.sqrt(Math.min(o2 / 300, 1));
    }
    return 0;
  }

  function applyStretch(s) {
    stretch = s;
    var a = Math.abs(s);
    track.style.width = 'calc(100% + ' + a + 'px)';
    track.style.marginLeft = s < 0 ? s + 'px' : '';
    track.style.marginRight = s > 0 ? s + 'px' : '';
  }

  function resetStretch() {
    if (stretch !== 0) {
      track.style.width = '';
      track.style.marginLeft = '';
      track.style.marginRight = '';
      stretch = 0;
    }
  }

  function posToVal(cx) {
    if (!rect0) return min;
    var pctX = ((cx - rect0.left) / rect0.width) * 100;
    return clp(min + (pctX / 100) * (max - min));
  }

  function onDown(e) {
    e.preventDefault();
    track.setPointerCapture(e.pointerId);
    rect0 = track.getBoundingClientRect();
    startX = e.clientX;
    click = false;
    dragging = true;
    active = true;
    track.classList.add('els-active', 'els-dragging');
    track.focus({ preventScroll: true });
    onMove(e);
  }

  function onMove(e) {
    if (!active) return;
    if (click && Math.abs(e.clientX - startX) > 3) {
      click = false;
      dragging = true;
      track.classList.add('els-dragging');
    }
    if (click) return;

    var s = computeStretch(e.clientX);
    if (s !== 0) applyStretch(s);
    else resetStretch();

    rect0 = track.getBoundingClientRect();

    var raw = posToVal(e.clientX);
    var rp = pct(raw);
    if (s < 0) rp = 0;
    else if (s > 0) rp = 100;
    fill.style.transition = 'none';
    fill.style.width = rp + '%';
    valueEl.textContent = raw.toFixed(D);
    track.setAttribute('aria-valuenow', raw);
    track.setAttribute('aria-valuetext', raw.toFixed(D));
    val = raw;
  }

  function onUp(e) {
    if (!active) return;
    active = false;
    dragging = false;
    track.classList.remove('els-active', 'els-dragging');
    fill.style.transition = '';

    var raw = posToVal(e.clientX);
    var ds = (max - min) / step;
    var snapped = ds <= 10
      ? clp(min + Math.round((raw - min) / step) * step)
      : snap(raw);
    set(rnd(snapped), false);

    resetStretch();
    rect0 = null;
  }

  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointermove', onMove);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);

  track.addEventListener('keydown', function (e) {
    var s = e.shiftKey ? step * 10 : step;
    var n = null;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowUp': n = val + s; break;
      case 'ArrowLeft': case 'ArrowDown': n = val - s; break;
      case 'Home': n = min; break;
      case 'End': n = max; break;
      default: return;
    }
    e.preventDefault();
    active = true;
    track.classList.add('els-active');
    set(clp(rnd(n)), false);
    setTimeout(function () { active = false; track.classList.remove('els-active'); }, 800);
  });

  track.addEventListener('mouseenter', function () { if (!active) track.classList.add('els-active'); });
  track.addEventListener('mouseleave', function () { if (!active && !dragging) track.classList.remove('els-active'); });
  track.addEventListener('focus', function () { if (!dragging) track.classList.add('els-active'); });
  track.addEventListener('blur', function () { if (!dragging) track.classList.remove('els-active'); });
})();
