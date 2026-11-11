/* ============================================================
   Ads — تبلیغات
   ------------------------------------------------------------
   Provider: Tapsell (Iran). The classic SDK is bundled into the APK
   by tools/android/build-apk.py; Gradle builds may use mediation
   instead. Either way the native side exposes one small bridge
   (window.EspressoAds) and this module owns ALL policy:
   placement, frequency capping, opt-outs and the rewarded
   ad-free window. When the bridge is absent every call is a
   no-op, so the app is identical to the ad-free build.

   Policy (aggressive but survivable):
     · banner        bottom of browse screens only, never mid-exercise
     · native        every 6th lesson row, every 12th vocabulary row
     · interstitial  after a finished quiz/session, >=90s apart, <=6/session
     · rewarded      opt-in, grants 24h with no ads at all
   Nothing is shown during the first session's first 3 minutes, and
   never while a spelling/flashcard/quiz question is on screen.
   ============================================================ */
(function () {
  'use strict';

  /* Two backends, one policy: the APK's native Tapsell bridge, or the
     browser engine in js/ads-web.js (iOS/PWA has no native bridge). */
  var B = window.EspressoAds || (window.AdsWeb && window.AdsWeb.present ? window.AdsWeb : null);
  var KEY = 'espressoA1.ads.v1';
  var st = { ready: false, provider: 'tapsell', hasKey: false, sdk: false };
  var prefs = null, state = null;
  var sessionCount = 0, lastInter = 0;
  var bootAt = Date.now();
  var rewardCb = {};
  var rid = 0;

  var DEF_PREFS = { native: true, banner: true, interstitial: true };
  var DEF_STATE = { adFreeUntil: 0, firstRun: 0, interTotal: 0, rewarded: 0 };

  var MIN_GAP = 90000;      // interstitials at least 90s apart
  var MAX_PER_SESSION = 6;
  var GRACE = 15000;        // short settling window on a fresh install
  /* Nothing competes with the first paint for this long. Overridable only for
     automated tests (tools/ads-web-test.js) — never set by the app. */
  var SETTLE = window.ESP_ADS_SETTLE == null ? 3000 : +window.ESP_ADS_SETTLE;
  var AD_FREE_HOURS = 24;

  function read(k, def) {
    try { return Object.assign({}, def, JSON.parse(localStorage.getItem(k) || '{}')); }
    catch (e) { return Object.assign({}, def); }
  }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function load() {
    prefs = read(KEY + '.prefs', DEF_PREFS);
    state = read(KEY, DEF_STATE);
    if (!state.firstRun) { state.firstRun = Date.now(); write(KEY, state); }
  }
  load();

  function refresh() {
    if (!B) return st;
    try { st = JSON.parse(B.status()) || st; } catch (e) {}
    return st;
  }

  /* Re-offer the placements on the current screen. Called when the SDK
     finishes initialising, which happens after the first render. */
  function reapply() {
    if (!B) return;
    var h = location.hash || '#/home';
    var v = h.replace(/^#\/?/, '').split('/')[0] || 'home';
    banner(['home', 'lessons', 'lesson', 'search', 'verbs', 'review'].indexOf(v) >= 0);
    if (typeof window.__adsSync === 'function') {
      try { window.__adsSync(); } catch (e) {}
    }
  }

  /* Native callbacks land here. */
  window.__adsEvent = function (kind, payload) {
    if (kind === 'ready') {
      refresh();
      reapply();
      return;
    }
    if (kind === 'rewarded') {
      var cb = rewardCb[payload && payload.id];
      delete rewardCb[payload && payload.id];
      if (payload && payload.ok) {
        grantAdFree(AD_FREE_HOURS);
        state.rewarded++; write(KEY, state);
      }
      if (cb) cb(!!(payload && payload.ok));
    } else if (kind === 'closed') {
      if (typeof window.__adsClosed === 'function') window.__adsClosed();
    } else if (kind === 'native') {
      var el = document.querySelector('[data-ad-slot="' + (payload && payload.slot) + '"]');
      if (el && payload && payload.html) el.innerHTML = payload.html;
    }
  };

  function grantAdFree(hours) {
    state.adFreeUntil = Math.max(state.adFreeUntil, Date.now()) + hours * 3600000;
    write(KEY, state);
    banner(false);
  }

  function isAdFree() { return Date.now() < state.adFreeUntil; }

  /* Screens where an ad would break concentration. */
  function inExercise() {
    var h = location.hash || '';
    if (/\/(quiz|cards|build|spell)(\/|$)/.test(h)) return true;
    if (/^#\/(fc|test|quick)/.test(h)) return true;
    return false;
  }

  function allowed() {
    if (!B || !st.ready || !st.hasKey) return false;
    if (isAdFree()) return false;
    if (Date.now() - bootAt < SETTLE) return false;            // let the app settle
    if (Date.now() - state.firstRun < GRACE) return false;    // first-run grace
    return true;
  }

  var Ads = {
    present: !!B,

    init: function () {
      if (!B) return false;
      refresh();
      try { B.setPrefs(JSON.stringify(prefs)); } catch (e) {}
      var tries = 0, wasReady = false;
      var t = setInterval(function () {
        refresh();
        if (st.ready && !wasReady) { wasReady = true; reapply(); }
        // keep nudging for the first minute: fill can arrive late
        if (++tries > 200) clearInterval(t);
        else if (st.ready && tries % 16 === 0) reapply();
      }, 300);
      return true;
    },

    status: function () { return st; },

    /* Plain-language explanation of why an ad may not be on screen.
       Surfaced in Settings so a fill problem is never a mystery. */
    diag: function () {
      refresh();
      var why = null;
      if (!B) why = 'noBridge';
      else if (!st.hasKey) why = 'noKey';
      else if (!st.sdk) why = 'noSdk';
      else if (!st.ready) why = 'notReady';
      else if (isAdFree()) why = 'adFree';
      else if (Date.now() - state.firstRun < GRACE) why = 'grace';
      else if (!prefs.banner && !prefs.native && !prefs.interstitial) why = 'allOff';
      return {
        bridge: !!B, sdk: !!st.sdk, ready: !!st.ready, hasKey: !!st.hasKey,
        provider: st.provider || 'tapsell', why: why,
        graceLeft: Math.max(0, Math.ceil((GRACE - (Date.now() - state.firstRun)) / 1000)),
        prefs: Object.assign({}, prefs),
        shown: state.interTotal, rewarded: state.rewarded
      };
    },

    /* Settings "try an ad now" — bypasses frequency policy on purpose,
       but still needs a real SDK and a filled cache. */
    test: function () {
      if (!B) return 'noBridge';
      refresh();
      if (!st.sdk) return 'noSdk';
      try { return B.showInterstitial('manual-test') ? 'requested' : 'noSdk'; }
      catch (e) { return 'error'; }
    },
    testBanner: function () {
      if (!B) return 'noBridge';
      try { return B.showBanner(true) ? 'requested' : 'noSdk'; } catch (e) { return 'error'; }
    },
    isAdFree: isAdFree,
    adFreeHoursLeft: function () {
      return Math.max(0, Math.ceil((state.adFreeUntil - Date.now()) / 3600000));
    },

    pref: function (name) { return !!prefs[name]; },
    setPref: function (name, on) {
      prefs[name] = !!on;
      write(KEY + '.prefs', prefs);
      if (B) { try { B.setPrefs(JSON.stringify(prefs)); } catch (e) {} }
      if (name === 'banner' && !on) banner(false);
    },

    /* Bottom banner. The native side owns the view; we only say when. */
    banner: function (show) { return banner(show); },

    /* A native slot inside a list. The real ad is a native view positioned over
       this box, so the box reserves height and reports its rect as we scroll.
       Without the SDK the box collapses and nothing is reserved. */
    nativeSlot: function (slot) {
      if (!allowed() || !prefs.native || inExercise()) return '';
      try { if (!B.requestNative(slot)) return ''; } catch (e) { return ''; }
      return '<div class="ad-native" data-ad-slot="' + slot + '" aria-label="تبلیغ"></div>';
    },

    /* Report every visible slot rect to the native layer. Throttled to one
       animation frame so scrolling stays smooth. */
    syncSlots: function () {
      if (!B || typeof B.nativeRect !== 'function') return;
      var els = document.querySelectorAll('[data-ad-slot]');
      if (!els.length) return;
      var wh = window.innerHeight || 0;
      for (var i = 0; i < els.length; i++) {
        var el = els[i], r = el.getBoundingClientRect();
        // only the part actually on screen; the native view is clipped to it
        var top = Math.max(0, r.top), bottom = Math.min(wh, r.bottom);
        var h = bottom - top;
        var vis = h > 24 && r.width > 40;
        try {
          B.nativeRect(el.getAttribute('data-ad-slot'),
                       vis ? r.left : 0, vis ? top : 0,
                       vis ? r.width : 0, vis ? h : 0, vis);
        } catch (e) {}
      }
    },

    /* Call at a natural break: quiz finished, session summary, lesson exit. */
    interstitial: function (reason) {
      if (!allowed() || !prefs.interstitial) return false;
      var now = Date.now();
      if (now - lastInter < MIN_GAP) return false;
      if (sessionCount >= MAX_PER_SESSION) return false;
      lastInter = now; sessionCount++;
      state.interTotal++; write(KEY, state);
      try { return !!B.showInterstitial(reason || 'break'); } catch (e) { return false; }
    },

    /* Opt-in video. Resolves true when the reward was earned. */
    rewarded: function (cb) {
      if (!B || !st.ready || !st.hasKey) { if (cb) cb(false); return false; }
      var id = 'r' + (++rid);
      rewardCb[id] = cb;
      var ok = false;
      try { ok = !!B.showRewarded(id); } catch (e) {}
      if (!ok) { delete rewardCb[id]; if (cb) cb(false); }
      return ok;
    },

    grantAdFree: grantAdFree,
    resetSession: function () { sessionCount = 0; },
    stats: function () { return { interTotal: state.interTotal, rewarded: state.rewarded }; }
  };

  function banner(show) {
    if (!B) return false;
    var want = !!show && allowed() && prefs.banner && !inExercise();
    try { return !!B.showBanner(want); } catch (e) { return false; }
  }

  window.Ads = Ads;
})();
