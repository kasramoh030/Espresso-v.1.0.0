/* ============================================================
   Espresso A1 — UI layer
   Liquid-Glass design system: SVG icon set, Center-FAB floating
   navigation (Material 3 NavigationBar semantics), 3D tilt,
   ripple feedback, action sheet, scroll reveals.
   Zero dependencies. Progressive enhancement everywhere.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- motion / capability gates ---------------- */
  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener: null };
  var mqFine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };
  var reduced = function () { return mqReduce.matches || document.documentElement.dataset.motion === 'off'; };
  var fine = function () { return mqFine.matches; };

  /* ---------------- icon set (Lucide-compatible, 24x24, stroke 1.75) ---------------- */
  var P = {
    home: 'M3 10.6 12 3.2l9 7.4V20a1 1 0 0 1-1 1h-4.6v-6.2H9.6V21H5a1 1 0 0 1-1-1z',
    book: 'M12 7.2v13.3M12 7.2A3.2 3.2 0 0 0 8.8 4H4a1 1 0 0 0-1 1v12.6a1 1 0 0 0 1 1h5.2A2.8 2.8 0 0 1 12 20.5M12 7.2A3.2 3.2 0 0 1 15.2 4H20a1 1 0 0 1 1 1v12.6a1 1 0 0 1-1 1h-5.2A2.8 2.8 0 0 0 12 20.5',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20.5 20.5l-4.2-4.2',
    sliders: 'M4 7h6M14 7h6M4 17h10M18 17h2M12 4.6v4.8M16 14.6v4.8',
    layers: 'm12 3 8.5 4.6L12 12.2 3.5 7.6zM3.5 12.2 12 16.8l8.5-4.6M3.5 16.6 12 21.2l8.5-4.6',
    play: 'M7.5 4.9a.8.8 0 0 1 1.2-.7l10 6.4a.8.8 0 0 1 0 1.4l-10 6.4a.8.8 0 0 1-1.2-.7z',
    pause: 'M8.5 4.5h2.2v15H8.5zM13.3 4.5h2.2v15h-2.2z',
    stop: 'M6.5 6.5h11v11h-11z',
    volume: 'M11.5 4.8 6.8 8.7H3.6v6.6h3.2l4.7 3.9zM15.4 9.2a4 4 0 0 1 0 5.6M18.2 6.4a8 8 0 0 1 0 11.2',
    star: 'm12 3.4 2.65 5.5 5.95.87-4.3 4.28 1.02 6.05L12 17.2l-5.32 2.9 1.02-6.05-4.3-4.28 5.95-.87z',
    eye: 'M2.5 12S6.2 5.6 12 5.6 21.5 12 21.5 12 17.8 18.4 12 18.4 2.5 12 2.5 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    eyeoff: 'M4 4l16 16M9.9 5.9A9.6 9.6 0 0 1 12 5.6c5.8 0 9.5 6.4 9.5 6.4a17 17 0 0 1-3.3 4M6.4 8.2A16.6 16.6 0 0 0 2.5 12S6.2 18.4 12 18.4c1.2 0 2.3-.2 3.3-.6M10 10a2.8 2.8 0 0 0 4 4',
    left: 'm14.5 5-7 7 7 7',
    right: 'm9.5 5 7 7-7 7',
    down: 'm5.5 9 6.5 6.5L18.5 9',
    up: 'm5.5 15 6.5-6.5L18.5 15',
    arrowleft: 'M20 12H4M10 6l-6 6 6 6',
    arrowright: 'M4 12h16M14 6l6 6-6 6',
    check: 'm4.5 12.5 5 5 10-11',
    wand: 'M4 20 15 9M13.5 3.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9zM19 11l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6zM6.5 3l.5 1.2 1.2.5-1.2.5L6.5 6.4 6 5.2 4.8 4.7 6 4.2z',
    x: 'M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8',
    sparkles: 'm12 3 1.85 4.65L18.5 9.5l-4.65 1.85L12 16l-1.85-4.65L5.5 9.5l4.65-1.85zM18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z',
    trophy: 'M8 4h8v4.6a4 4 0 0 1-8 0zM8 5.2H5.2v1.6a3.2 3.2 0 0 0 3 3.2M16 5.2h2.8v1.6a3.2 3.2 0 0 1-3 3.2M12 12.8v3.4M9 20.2h6M9.8 16.2h4.4l.8 4h-6z',
    flame: 'M12 21.2a6.6 6.6 0 0 0 6.6-6.6c0-4.8-3.8-5.8-3.8-9.8 0 0-2.9 1.5-2.9 5 0 1.9-.9 2.9-1.9 2.9s-1.9-1-1.9-2.9c-1.8 1.9-2.7 3.8-2.7 4.8a6.6 6.6 0 0 0 6.6 6.6z',
    zap: 'M13.2 2.5 4.8 13.6h6.2l-1 7.9 8.9-11.4h-6.4z',
    moon: 'M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.6 8.6 0 1 0 11 11z',
    sun: 'M12 7.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8zM12 1.8v2.4M12 19.8v2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7',
    coffee: 'M4 8.2h13v5.6a5.2 5.2 0 0 1-5.2 5.2H9.2A5.2 5.2 0 0 1 4 13.8zM17 9.6h2.3a2.6 2.6 0 0 1 0 5.2H17M6.6 2.4v2.4M10.5 2.4v2.4M14.4 2.4v2.4M3 21.4h15',
    cap: 'm2.5 8.2 9.5-4.7 9.5 4.7-9.5 4.7zM6.6 10.4v5.2c0 1.7 2.4 3 5.4 3s5.4-1.3 5.4-3v-5.2M20.6 8.6v6',
    chat: 'M20.8 11.6a8.4 8.4 0 0 1-12.1 7.5L3.2 20.8l1.7-5.4A8.4 8.4 0 1 1 20.8 11.6z',
    grammar: 'M4.5 5.2A2.7 2.7 0 0 1 7.2 2.5H20v16.2H7.2a2.7 2.7 0 0 0-2.7 2.7zM4.5 5.2v16.2M8.6 7.4h7.6M8.6 11.2h5.4',
    quiz: 'm3 6.4 1.9 1.9L8.4 4.8M3 15.4l1.9 1.9 3.5-3.5M12.2 7.2h8.6M12.2 15.8h8.6',
    refresh: 'M20.4 12a8.4 8.4 0 1 1-2.5-6M20.6 3.6v5.2h-5.2',
    download: 'M12 3.4v11.8M7.4 10.6 12 15.2l4.6-4.6M4 20.4h16',
    upload: 'M12 20.6V8.8M7.4 13.4 12 8.8l4.6 4.6M4 3.6h16',
    trash: 'M4.2 6.8h15.6M9.2 6.8V3.9h5.6v2.9M6.4 6.8l.95 13.3h9.3l.95-13.3M10.2 10.4v6M13.8 10.4v6',
    plus: 'M12 5v14M5 12h14',
    gauge: 'M4.1 18.4a9 9 0 1 1 15.8 0M12 13.6l4.2-4.8M12 15.4a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z',
    clock: 'M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2zM12 7.2v5.2l3.3 2',
    info: 'M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2zM12 11.2v5M12 7.9h.01',
    share: 'M12 3.4v12.2M8 7.4l4-4 4 4M5.2 12.4v7a1.2 1.2 0 0 0 1.2 1.2h11.2a1.2 1.2 0 0 0 1.2-1.2v-7',
    users: 'M9.2 11.4a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM2.6 20.2v-1.6a4.6 4.6 0 0 1 4.6-4.6h4a4.6 4.6 0 0 1 4.6 4.6v1.6M16.4 4.6a3.6 3.6 0 0 1 0 6.9M18 14.2h.6a4.6 4.6 0 0 1 4.6 4.6v1.4',
    lang: 'M3.4 5.4h9.2M8 3.2v2.2M11.2 5.4c0 4.2-3.2 7.4-7.8 8.8M6 9.4c1.4 2.6 3.6 4.3 6.2 5.4M12.8 21.2l4.6-10.4 4.6 10.4M14.7 17.2h5.4',
    grid: 'M4 4.6h6v6H4zM14 4.6h6v6h-6zM4 13.4h6v6H4zM14 13.4h6v6h-6z',
    target: 'M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2zM12 7.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
    compass: 'M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2zM15.4 8.6l-2 4.8-4.8 2 2-4.8z',
    shuffle: 'M16.4 3.6 20.8 8l-4.4 4.4M16.4 11.6 20.8 16l-4.4 4.4M3.2 8h3.4c1.4 0 2.6.7 3.4 1.8l4 5.4c.8 1.1 2 1.8 3.4 1.8h3.4M3.2 16h3.4c1.4 0 2.6-.7 3.4-1.8l.9-1.2M14.6 9.6l.4-.6c.8-1.1 2-1.8 3.4-1.8h2.4',
    bookmark: 'M6.4 3.8h11.2v17l-5.6-4-5.6 4z',
    chart: 'M4 20.2V11M10 20.2V4.4M16 20.2v-6.6M2.6 20.2h18.8',
    keyboard: 'M3.4 6.4h17.2v11.2H3.4zM7 9.8h.01M10.5 9.8h.01M14 9.8h.01M17.5 9.8h.01M7 13.2h.01M17.5 13.2h.01M9.8 14.2h4.4',
    filter: 'M3.4 5.2h17.2l-6.8 8v5.6l-3.6 1.8v-7.4z',
    mic: 'M12 3.2a2.8 2.8 0 0 1 2.8 2.8v5.2a2.8 2.8 0 0 1-5.6 0V6A2.8 2.8 0 0 1 12 3.2zM5.6 11.2a6.4 6.4 0 0 0 12.8 0M12 17.6v3.2M8.8 20.8h6.4',
    warn: 'M12 3.6 21.4 20H2.6zM12 9.6v4.4M12 16.8h.01',
    dot: 'M12 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z',
    more: 'M5.6 10.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM12 10.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM18.4 10.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z',
    install: 'M12 3.4v10.4M8.2 10 12 13.8 15.8 10M4.6 15.4v3.4a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-3.4',
    lock: 'M6.4 10.4h11.2v9.8H6.4zM8.8 10.4V7.6a3.2 3.2 0 0 1 6.4 0v2.8',
    heart: 'M12 20.4S3.6 15.2 3.6 9.4a4.6 4.6 0 0 1 8.4-2.6 4.6 4.6 0 0 1 8.4 2.6c0 5.8-8.4 11-8.4 11z'
  };
  var FILLED = { play: 1, pause: 1, stop: 1, star: 1, flame: 1, zap: 1, dot: 1, more: 1, bookmark: 1, heart: 1 };

  function ico(name, o) {
    o = o || {};
    var d = P[name] || P.dot;
    var size = o.size || 24;
    var fill = (o.fill || FILLED[name]) ? 'currentColor' : 'none';
    var stroke = fill === 'currentColor' ? 'none' : 'currentColor';
    return '<svg class="ico' + (o.cls ? ' ' + o.cls : '') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (o.sw || 1.75) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  }

  /* ---------------- haptics ---------------- */
  function haptic(ms) {
    if (document.documentElement.dataset.haptics === 'off') return;
    try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) { }
  }

  /* ---------------- ripple (pointer feedback, 80–150ms) ---------------- */
  var RIPPLE_SEL = '.btn,.nav-item,.fab,.opt,.tok,.mitem,.litem,.mini,.iconbtn,.chip-btn,.sheet-item,.tabpill';
  document.addEventListener('pointerdown', function (e) {
    if (reduced()) return;
    var t = e.target.closest ? e.target.closest(RIPPLE_SEL) : null;
    if (!t || t.disabled) return;
    var r = t.getBoundingClientRect();
    if (!r.width) return;
    var s = document.createElement('span');
    s.className = 'ripple';
    var d = Math.max(r.width, r.height) * 2.1;
    s.style.width = s.style.height = d + 'px';
    s.style.left = (e.clientX - r.left - d / 2) + 'px';
    s.style.top = (e.clientY - r.top - d / 2) + 'px';
    t.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 560);
  }, { passive: true });

  /* ---------------- 3D tilt + specular highlight ---------------- */
  var tiltRaf = 0, tiltEl = null, tiltX = 0, tiltY = 0;
  function tiltApply() {
    tiltRaf = 0;
    if (!tiltEl) return;
    tiltEl.style.setProperty('--rx', tiltX.toFixed(2) + 'deg');
    tiltEl.style.setProperty('--ry', tiltY.toFixed(2) + 'deg');
  }
  document.addEventListener('pointermove', function (e) {
    if (!fine() || reduced() || e.pointerType === 'touch') return;
    var t = e.target.closest ? e.target.closest('[data-tilt]') : null;
    if (t !== tiltEl) {
      if (tiltEl) { tiltEl.style.setProperty('--rx', '0deg'); tiltEl.style.setProperty('--ry', '0deg'); tiltEl.classList.remove('tilting'); }
      tiltEl = t;
      if (t) t.classList.add('tilting');
    }
    if (!t) return;
    var r = t.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    var max = +(t.dataset.tilt || 6);
    tiltX = (0.5 - py) * max * 2;
    tiltY = (px - 0.5) * max * 2;
    t.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    t.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltApply);
  }, { passive: true });
  document.addEventListener('pointerleave', function () {
    if (tiltEl) { tiltEl.style.setProperty('--rx', '0deg'); tiltEl.style.setProperty('--ry', '0deg'); tiltEl.classList.remove('tilting'); tiltEl = null; }
  }, { passive: true });

  /* Touch 3D: on phones there is no hover, so the tilt is driven by the press
     itself. Release springs the surface back flat. */
  var pressEl = null;
  function pressTilt(e) {
    if (reduced() || e.pointerType !== 'touch') return;
    var t = e.target.closest ? e.target.closest('[data-tilt]') : null;
    if (!t) return;
    pressEl = t;
    var r = t.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    var max = +(t.dataset.tilt || 6);
    t.classList.add('pressing');
    t.style.setProperty('--rx', ((0.5 - py) * max * 1.6).toFixed(2) + 'deg');
    t.style.setProperty('--ry', ((px - 0.5) * max * 1.6).toFixed(2) + 'deg');
    t.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    t.style.setProperty('--my', (py * 100).toFixed(1) + '%');
  }
  function pressRelease() {
    if (!pressEl) return;
    pressEl.classList.remove('pressing');
    pressEl.style.setProperty('--rx', '0deg');
    pressEl.style.setProperty('--ry', '0deg');
    pressEl = null;
  }
  document.addEventListener('pointerdown', pressTilt, { passive: true });
  document.addEventListener('pointerup', pressRelease, { passive: true });
  document.addEventListener('pointercancel', pressRelease, { passive: true });

  /* ---------------- floating liquid navigation ---------------- */
  var nav, ind, ghost, items = [], fab, curKey = '', curBadge = 0, ready = false;

  function navMeasure() {
    if (!nav || !ind) return;
    var target = null;
    for (var i = 0; i < items.length; i++) if (items[i].classList.contains('on')) target = items[i];
    if (!target) { ind.style.opacity = '0'; if (ghost) ghost.style.opacity = '0'; return; }
    var nr = nav.getBoundingClientRect(), tr = target.getBoundingClientRect();
    var w = parseFloat(getComputedStyle(ind).width) || 56;
    var x = tr.left - nr.left + (tr.width - w) / 2;
    var prev = parseFloat(ind.dataset.x || 'NaN');
    ind.style.opacity = '1';
    if (ghost) ghost.style.opacity = '1';
    ind.dataset.x = String(x);
    if (!isNaN(prev) && Math.abs(prev - x) > 1 && !reduced() && ind.animate) {
      var dx = x - prev;
      try {
        ind.animate([
          { transform: 'translateX(' + prev + 'px) scaleX(1)' },
          { transform: 'translateX(' + (prev + dx * 0.42) + 'px) scaleX(1.38)', offset: 0.42 },
          { transform: 'translateX(' + x + 'px) scaleX(0.94)', offset: 0.78 },
          { transform: 'translateX(' + x + 'px) scaleX(1)' }
        ], { duration: 430, easing: 'cubic-bezier(.22,1,.36,1)' });
      } catch (e) { }
    }
    ind.style.transform = 'translateX(' + x + 'px)';
    if (ghost) ghost.style.transform = 'translateX(' + x + 'px)';
  }

  function setActive(key) {
    curKey = key;
    items.forEach(function (b) {
      var on = key === b.dataset.go;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (fab) fab.classList.toggle('engaged', key === '#/review' || key === '#/fc');
    navMeasure();
  }

  function badge(n) {
    curBadge = n;
    var b = document.getElementById('dueBadge');
    if (!b) return;
    b.hidden = !n;
    b.textContent = String(n);
    if (fab) fab.setAttribute('data-due', String(n));
  }

  /* ---------------- action sheet (FAB destination) ---------------- */
  var sheetEl, scrimEl, lastFocus = null, sheetOpen = false;

  function buildSheet() {
    if (document.getElementById('sheet')) {
      sheetEl = document.getElementById('sheet');
      scrimEl = document.getElementById('scrim');
      return;
    }
    scrimEl = document.createElement('div');
    scrimEl.className = 'scrim';
    scrimEl.id = 'scrim';
    scrimEl.hidden = true;
    scrimEl.addEventListener('click', closeSheet);

    sheetEl = document.createElement('div');
    sheetEl.className = 'sheet';
    sheetEl.id = 'sheet';
    sheetEl.setAttribute('role', 'dialog');
    sheetEl.setAttribute('aria-modal', 'true');
    sheetEl.setAttribute('aria-labelledby', 'sheetTitle');
    sheetEl.hidden = true;
    sheetEl.innerHTML = '<div class="sheet-grip" aria-hidden="true"></div><h2 class="sheet-title" id="sheetTitle">مرور و تمرین</h2><div class="sheet-body" id="sheetBody"></div>';
    document.body.appendChild(scrimEl);
    document.body.appendChild(sheetEl);

    /* drag-to-dismiss */
    var sy = 0, dy = 0, dragging = false;
    sheetEl.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      dragging = true; sy = e.clientY; dy = 0;
      sheetEl.style.transition = 'none';
      try { sheetEl.setPointerCapture(e.pointerId); } catch (x) { }
    });
    sheetEl.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - sy);
      sheetEl.style.transform = 'translateY(' + dy + 'px)';
    });
    var end = function () {
      if (!dragging) return;
      dragging = false;
      sheetEl.style.transition = '';
      sheetEl.style.transform = '';
      if (dy > 90) closeSheet();
    };
    sheetEl.addEventListener('pointerup', end);
    sheetEl.addEventListener('pointercancel', end);
  }

  function openSheet(html) {
    if (!sheetEl) buildSheet();
    document.getElementById('sheetBody').innerHTML = html;
    lastFocus = document.activeElement;
    scrimEl.hidden = false;
    sheetEl.hidden = false;
    sheetOpen = true;
    if (fab) { fab.setAttribute('aria-expanded', 'true'); fab.classList.add('open'); }
    document.body.classList.add('sheet-open');
    haptic(12);
    requestAnimationFrame(function () {
      var f = sheetEl.querySelector('button');
      if (f) f.focus();
    });
  }
  function closeSheet() {
    if (!sheetOpen) return;
    sheetOpen = false;
    scrimEl.hidden = true;
    sheetEl.hidden = true;
    if (fab) { fab.setAttribute('aria-expanded', 'false'); fab.classList.remove('open'); }
    document.body.classList.remove('sheet-open');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { }
  }
  document.addEventListener('keydown', function (e) {
    if (!sheetOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(sheetEl.querySelectorAll('button,[href],input,select,textarea'), function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------------- scroll reveal (progressive, content visible by default) ---------------- */
  var io = null;
  function reveal(root) {
    if (reduced() || !('IntersectionObserver' in window)) return;
    if (!io) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    }
    var nodes = (root || document).querySelectorAll('[data-reveal]:not(.in)');
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96) nodes[i].classList.add('in');
      else io.observe(nodes[i]);
    }
  }

  /* ---------------- app bar scroll state ---------------- */
  var scrollRaf = 0;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(function () {
      scrollRaf = 0;
      document.body.classList.toggle('scrolled', window.scrollY > 6);
      if (nav) nav.classList.toggle('lifted', window.scrollY > 6);
    });
  }

  /* ---------------- enhance after every render ---------------- */
  function enhance(root) {
    reveal(root);
    navMeasure();
  }

  /* ---------------- init ---------------- */
  function init() {
    if (ready) return;            /* idempotent: DOMContentLoaded must never double-build */
    nav = document.getElementById('navbar');
    ind = document.getElementById('navIndicator');
    ghost = document.getElementById('navGhost');
    fab = document.getElementById('fab');
    items = Array.prototype.slice.call(document.querySelectorAll('#navbar .nav-item'));
    buildSheet();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { navMeasure(); }, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { navMeasure(); });
    if (mqReduce.addEventListener) mqReduce.addEventListener('change', function () { navMeasure(); });
    document.addEventListener('visibilitychange', function () {
      document.body.classList.toggle('paused', document.hidden);
    });
    /* re-measure once fonts settle */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { navMeasure(); });
    ready = true;
    /* The app renders before DOMContentLoaded, so replay the last known state. */
    if (curKey) setActive(curKey); else navMeasure();
    badge(curBadge);
    setTimeout(navMeasure, 60);
    onScroll();

    /* observe app re-renders so every partial update is enhanced */
    var app = document.getElementById('app');
    if (app && 'MutationObserver' in window) {
      var pend = 0;
      new MutationObserver(function () {
        if (pend) return;
        pend = requestAnimationFrame(function () { pend = 0; enhance(app); });
      }).observe(app, { childList: true });
    }
  }

  window.UI = {
    ico: ico, haptic: haptic, reduced: reduced, fine: fine,
    setActive: setActive, badge: badge, measure: navMeasure,
    openSheet: openSheet, closeSheet: closeSheet, isSheetOpen: function () { return sheetOpen; },
    enhance: enhance, init: init
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
