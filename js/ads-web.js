/* ============================================================
   Ads (web) — تبلیغات در مرورگر و iOS
   ------------------------------------------------------------
   The APK ships a native Tapsell bridge (window.EspressoAds). A browser
   has no such bridge and Tapsell publishes no JavaScript publisher SDK,
   so this module implements the SAME interface the policy layer expects:

     status · setPrefs · showBanner · requestNative · nativeRect
     showInterstitial · showRewarded

   js/ads.js owns every rule (frequency caps, opt-outs, ad-free window,
   never during an exercise). This file only knows HOW to draw an ad:

     adsense   Google AdSense (client + slot in ads-web-config.js)
     custom    whatever snippet another network's panel gave you
     house     built-in creative: Telegram group + Android app
     auto      first configured one, else house

   If the native bridge exists this module stays dormant, so the APK can
   never show two ads for the same placement.
   ============================================================ */
(function () {
  'use strict';

  if (window.EspressoAds) {          // native Tapsell bridge wins
    window.AdsWeb = { present: false, provider: 'native' };
    return;
  }

  var CFG = window.ESP_ADWEB || {};
  var HOUSE_FALLBACK = { banner: '', native: '', interstitial: '' };

  /* ---------- provider resolution ---------- */
  var A = CFG.adsense || {}, C = CFG.custom || {};
  var hasAdsense = !!(A.client && A.slots && (A.slots.banner || A.slots.native || A.slots.interstitial));
  var hasCustom = !!(C.banner || C.native || C.interstitial);

  var provider = CFG.provider || 'auto';
  if (provider === 'auto') {
    provider = hasAdsense ? 'adsense' : (hasCustom ? 'custom' : 'house');
  }
  if (provider === 'adsense' && !hasAdsense) provider = hasCustom ? 'custom' : 'house';
  if (provider === 'custom' && !hasCustom) provider = 'house';

  var ONLINE = function () { return navigator.onLine !== false; };

  /* A remote creative needs the network; offline we degrade to our own. */
  function snippetFor(kind) {
    if (!ONLINE()) return '';
    if (provider === 'custom') return (C[kind] || '');
    return '';
  }

  /* ---------- house creative (always available, works offline) ---------- */
  var TG = (CFG.house && CFG.house.telegram) || 'https://t.me/Termefilter';

  function houseCreative(kind, slot) {
    if (CFG.house && CFG.house.enabled === false) return '';
    if (kind === 'banner') {
      return '<a class="adw-h adw-h-banner" href="' + TG + '" rel="noopener" data-adw-link>' +
        '<span class="adw-tag">تبلیغ</span>' +
        '<span class="adw-mark" aria-hidden="true">✈</span>' +
        '<span class="adw-copy"><b>گروه تلگرام اسپرسو A1</b>' +
        '<i>لغت روز، تلفظ و پرسش و پاسخ</i></span>' +
        '<span class="adw-cta">عضویت</span></a>';
    }
    if (kind === 'native') {
      return '<div class="adw-h adw-h-native">' +
        '<span class="adw-tag">تبلیغ</span>' +
        '<div class="adw-hero" aria-hidden="true">☕</div>' +
        '<div class="adw-body">' +
        '<b>هر روز یک لغت ایتالیایی در تلگرام</b>' +
        '<p>تلفظ صوتی، مثال و آزمون کوتاه روزانه — رایگان.</p>' +
        '<a class="btn sm adw-btn" href="' + TG + '" rel="noopener" data-adw-link>عضویت در گروه</a>' +
        '</div></div>';
    }
    /* interstitial / rewarded body */
    return '<div class="adw-big">' +
      '<div class="adw-big-art" aria-hidden="true"><span>☕</span></div>' +
      '<h3>با هم ایتالیایی یاد بگیریم</h3>' +
      '<p>در گروه تلگرام اسپرسو A1 هر روز یک لغت، تلفظ و تمرین کوتاه می‌گذرایم — ' +
      'به‌علاوهٔ فایل‌ها و پاسخ پرسش‌ها.</p>' +
      '<a class="btn adw-btn" href="' + TG + '" rel="noopener" data-adw-link>عضویت در گروه تلگرام</a>' +
      '<div class="adw-fine">با عضویت، اپ رایگان می‌ماند.</div></div>';
  }

  /* ---------- snippet injection ---------- */
  /* innerHTML silently drops <script>, so pull each one out and re-create it. */
  function inject(html, into) {
    into.innerHTML = html;
    var scripts = into.querySelectorAll('script');
    for (var i = 0; i < scripts.length; i++) {
      var old = scripts[i], s = document.createElement('script');
      for (var j = 0; j < old.attributes.length; j++) {
        s.setAttribute(old.attributes[j].name, old.attributes[j].value);
      }
      s.text = old.text || '';
      old.parentNode.replaceChild(s, old);
    }
    // some networks render into a placeholder lazily
    var ins = into.querySelectorAll('ins.adsbygoogle');
    for (var k = 0; k < ins.length; k++) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    }
  }

  function adsenseTag(kind) {
    var slot = A.slots && A.slots[kind];
    if (!slot) return '';
    return '<ins class="adsbygoogle" style="display:block;width:100%" ' +
      'data-ad-client="' + esc(A.client) + '" data-ad-slot="' + esc(slot) + '"></ins>';
  }

  var adsenseLibLoaded = false;
  function loadAdsenseLib() {
    if (adsenseLibLoaded || !hasAdsense || !ONLINE()) return;
    adsenseLibLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(A.client);
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* ---------- element helpers ---------- */
  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }

  function mount(node) { (document.body || document.documentElement).appendChild(node); }

  function openExternal(url) {
    if (window.EspressoShell && typeof window.EspressoShell.openUrl === 'function') {
      try { if (window.EspressoShell.openUrl(url)) return; } catch (e) {}
    }
    try { window.open(url, '_blank', 'noopener'); } catch (e) { location.href = url; }
  }

  /* every house CTA opens through one allow-listed path */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-adw-link]') : null;
    if (!a) return;
    e.preventDefault();
    openExternal(a.getAttribute('href'));
  }, true);

  /* ---------- banner ---------- */
  var bannerEl = null, bannerOn = false;

  function showBanner(show) {
    show = !!show;
    if (!show) {
      if (bannerEl) { bannerEl.remove(); bannerEl = null; }
      if (bannerOn) { bannerOn = false; document.body.classList.remove('has-banner', 'has-adbanner'); }
      return false;
    }
    if (!bannerEl) {
      bannerEl = el('div', 'ad-web-banner', '');
      bannerEl.setAttribute('role', 'complementary');
      bannerEl.setAttribute('aria-label', 'تبلیغ');
      mount(bannerEl);
    }
    bannerOn = true;
    document.body.classList.add('has-banner', 'has-adbanner');

    var custom = snippetFor('banner');
    var html = custom ? '<div class="adw-tag">تبلیغ</div><div class="adw-slot"></div>'
                      : (adsenseTag('banner') || houseCreative('banner'));
    if (custom) {
      bannerEl.innerHTML = html;
      inject(custom, bannerEl.querySelector('.adw-slot'));
    } else if (provider === 'adsense' && adsenseTag('banner')) {
      bannerEl.innerHTML = '<div class="adw-tag">تبلیغ</div><div class="adw-slot">' + adsenseTag('banner') + '</div>';
      loadAdsenseLib();
      inject('', bannerEl.querySelector('.adw-slot'));
    } else {
      bannerEl.innerHTML = houseCreative('banner');
    }
    return true;
  }

  /* ---------- native slots ---------- */
  var filled = {};

  function requestNative(slot) {
    delete filled[slot];
    return true;          // nothing to pre-fetch: we render inline
  }

  function renderNative(slot, box) {
    if (!box || filled[slot]) return;
    filled[slot] = true;
    var custom = snippetFor('native');
    if (custom) {
      box.innerHTML = '<div class="adw-tag">تبلیغ</div><div class="adw-slot"></div>';
      inject(custom, box.querySelector('.adw-slot'));
      return;
    }
    if (provider === 'adsense' && adsenseTag('native')) {
      box.innerHTML = '<div class="adw-tag">تبلیغ</div><div class="adw-slot">' + adsenseTag('native') + '</div>';
      loadAdsenseLib();
      inject('', box.querySelector('.adw-slot'));
      return;
    }
    box.innerHTML = houseCreative('native');
  }

  /* ads.js already drives this on every animation frame; the browser has no
     overlay view to position, so we use the same call to fill the slot the
     first time it becomes visible. */
  function nativeRect(slot, left, top, w, h, vis) {
    if (!vis) return;
    renderNative(slot, document.querySelector('[data-ad-slot="' + slot + '"]'));
  }

  /* ---------- overlay (interstitial + rewarded) ---------- */
  var overlay = null;

  function closeOverlay() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.body.style.removeProperty('overflow');
  }

  function buildOverlay(html, opts) {
    closeOverlay();
    overlay = el('div', 'adw-scrim', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'تبلیغ');

    var card = el('div', 'adw-card' + (opts.wide ? ' wide' : ''),
      '<div class="adw-top"><span class="adw-tag">تبلیغ</span>' +
      '<button class="adw-x" type="button" aria-label="بستن تبلیغ" disabled>✕</button></div>' +
      '<div class="adw-body-slot"></div>');
    overlay.appendChild(card);
    mount(overlay);
    document.body.style.overflow = 'hidden';

    var body = card.querySelector('.adw-body-slot');
    body.innerHTML = html;

    var x = card.querySelector('.adw-x');
    x.addEventListener('click', function () {
      if (x.disabled) return;
      closeOverlay();
      if (opts.onClose) opts.onClose();
    });
    return { card: card, body: body, close: x };
  }

  function countdown(btn, seconds, label, done) {
    var left = seconds;
    btn.disabled = true;
    btn.textContent = label.replace('{n}', fa(left));
    var t = setInterval(function () {
      left--;
      if (left > 0) { btn.textContent = label.replace('{n}', fa(left)); return; }
      clearInterval(t);
      btn.disabled = false;
      btn.textContent = done;
      if (done === '✕') btn.setAttribute('aria-label', 'بستن تبلیغ');
    }, 1000);
    return t;
  }

  function fa(n) {
    return String(n).replace(/\d/g, function (d) { return String.fromCharCode(0x06F0 + (+d)); });
  }

  var pendingRewards = {};

  function showInterstitial(reason) {
    var delay = Math.max(0, (CFG.interstitialDelay == null ? 5 : CFG.interstitialDelay));
    var custom = snippetFor('interstitial');
    var html = custom ? '<div class="adw-slot"></div>'
                      : (provider === 'adsense' && adsenseTag('interstitial') ? adsenseTag('interstitial')
                                                                             : houseCreative('interstitial'));
    var ui = buildOverlay(html, {
      wide: true,
      onClose: function () { if (window.__adsClosed) window.__adsClosed(); }
    });
    if (custom) { inject(custom, ui.body.querySelector('.adw-slot')); }
    if (provider === 'adsense' && !custom) { loadAdsenseLib(); inject('', ui.body); }

    countdown(ui.close, delay, 'بستن تا {n}', '✕');
    return true;
  }

  function showRewarded(id) {
    var secs = Math.max(1, CFG.rewardedSeconds == null ? 15 : CFG.rewardedSeconds);
    var custom = snippetFor('interstitial');
    var html = custom ? '<div class="adw-slot"></div>' : houseCreative('rewarded');
    var ui = buildOverlay(html, {
      wide: true,
      onClose: function () {
        var cb = pendingRewards[id]; delete pendingRewards[id];
        if (cb) cb(false);
      }
    });
    if (custom) inject(custom, ui.body.querySelector('.adw-slot'));

    /* The "video": a progress bar that must finish before the reward lands. */
    var bar = el('div', 'adw-progress', '<i></i>');
    ui.card.appendChild(bar);
    var fillEl = bar.querySelector('i');
    fillEl.style.transition = 'width ' + secs + 's linear';
    // force a frame so the transition actually runs
    requestAnimationFrame(function () { fillEl.style.width = '100%'; });

    ui.body.insertAdjacentHTML('beforeend',
      '<div class="adw-reward" hidden><b>جایزه آماده است</b>' +
      '<span>۲۴ ساعت بدون هیچ تبلیغی</span>' +
      '<button class="btn adw-claim" type="button">دریافت جایزه</button></div>');

    var rewardBox = ui.body.querySelector('.adw-reward');
    var claim = ui.body.querySelector('.adw-claim');

    var finish = function () {
      rewardBox.hidden = false;
      claim.addEventListener('click', function () {
        closeOverlay();
        var cb = pendingRewards[id]; delete pendingRewards[id];
        if (cb) cb(true);
        if (window.__adsEvent) window.__adsEvent('rewarded', { id: id, ok: true });
      });
    };

    setTimeout(finish, secs * 1000);

    pendingRewards[id] = function (ok) {
      if (!ok && window.__adsEvent) window.__adsEvent('rewarded', { id: id, ok: false });
    };

    // escape hatch if the claim button is never pressed
    overlay.timer = setTimeout(function () {
      if (!overlay) return;
      var pending = pendingRewards[id];
      if (pending) { delete pendingRewards[id]; pending(false); }
    }, (secs + 90) * 1000);
    return true;
  }

  /* ---------- bridge surface used by js/ads.js ---------- */
  var prefs = { native: true, banner: true, interstitial: true };

  window.AdsWeb = {
    present: true,
    provider: provider,

    status: function () {
      return JSON.stringify({
        ready: true,
        provider: provider,
        hasKey: provider === 'house' ? true : (provider === 'adsense' ? hasAdsense : hasCustom),
        sdk: true,
        web: true,
        online: ONLINE()
      });
    },

    setPrefs: function (json) {
      try { prefs = Object.assign(prefs, JSON.parse(json)); } catch (e) {}
      if (!prefs.banner) showBanner(false);
      return true;
    },

    showBanner: showBanner,

    /* A banner that is already on screen must survive a re-render. */
    requestNative: requestNative,
    nativeRect: nativeRect,

    showInterstitial: showInterstitial,
    showRewarded: showRewarded,

    /* Settings helpers */
    hasCustomCode: hasCustom || hasAdsense,
    houseEnabled: !(CFG.house && CFG.house.enabled === false)
  };

  /* A PWA can be closed for days; the service worker keeps the shell, and this
     asks the browser not to evict the progress we store. */
  if (navigator.storage && navigator.storage.persist) {
    try { navigator.storage.persist().catch(function () {}); } catch (e) {}
  }
})();
