/* ============================================================
   Native TTS — the device speech engine, inside the Android app
   ------------------------------------------------------------
   Android WebView has no speechSynthesis. The native shell binds the
   platform TextToSpeech service (Google's engine when installed) and
   exposes it as window.EspressoTTS. This module wraps that bridge.

   In a normal browser window.EspressoTTS is absent, so `available` is
   false and every call is a no-op — the PWA keeps using the audio pack
   and the Web Speech API exactly as before.
   ============================================================ */
(function () {
  'use strict';

  var B = window.EspressoTTS || null;
  var pending = {};          // utterance id -> {onend, onfail}
  var seq = 0;
  var st = { ready: false, engine: '', italian: false, needsData: false, voice: '' };
  var listeners = [];

  function parse(s, fallback) {
    try { return JSON.parse(s); } catch (e) { return fallback; }
  }

  function refresh() {
    if (!B) return st;
    st = parse(B.status(), st) || st;
    return st;
  }

  function notify() {
    listeners.forEach(function (f) { try { f(st); } catch (e) {} });
  }

  /* Java calls this for start / end / error / ready */
  window.__ttsEvent = function (kind, payload) {
    if (kind === 'ready') {
      st = payload || st;
      notify();
      return;
    }
    var id = payload && payload.id;
    var cb = id && pending[id];
    if (!cb) return;
    if (kind === 'end') {
      delete pending[id];
      if (cb.onend) cb.onend();
    } else if (kind === 'error') {
      delete pending[id];
      if (cb.onfail) cb.onfail();
    }
  };

  var NativeTTS = {
    /* the bridge exists at all (i.e. we are inside the APK) */
    present: !!B,

    get available() {
      return !!(B && st.ready && st.italian);
    },

    get status() { return st; },

    init: function () {
      if (!B) return false;
      refresh();
      // the engine binds asynchronously; poll briefly until it reports in
      var tries = 0;
      var t = setInterval(function () {
        refresh();
        notify();
        if (st.ready || ++tries > 40) clearInterval(t);
      }, 250);
      return true;
    },

    onChange: function (f) { if (typeof f === 'function') listeners.push(f); },

    /* Speak. Returns true when the engine took the utterance. */
    speak: function (text, opt) {
      opt = opt || {};
      if (!this.available || !text) return false;
      var id = 'n' + (++seq);
      pending[id] = { onend: opt.onend, onfail: opt.onfail };
      var ok = false;
      try {
        ok = B.speak(String(text), opt.rate || 0.9, opt.pitch || 1, id);
      } catch (e) { ok = false; }
      if (!ok) {
        delete pending[id];
        if (opt.onfail) opt.onfail();
        return false;
      }
      // safety net: some engines never fire onDone for very short clips
      if (opt.timeout !== 0) {
        setTimeout(function () {
          if (pending[id]) {
            delete pending[id];
            if (opt.onend) opt.onend();
          }
        }, opt.timeout || Math.max(4000, String(text).length * 140));
      }
      return true;
    },

    stop: function () {
      pending = {};
      if (B) { try { B.stop(); } catch (e) {} }
    },

    engines: function () { return B ? parse(B.engines(), []) : []; },
    voices: function () { return B ? parse(B.voices(), []) : []; },

    setVoice: function (name) {
      if (!B) return false;
      var ok = false;
      try { ok = B.setVoice(name); } catch (e) {}
      refresh();
      notify();
      return ok;
    },

    setEngine: function (pkg) {
      if (!B) return false;
      try { B.setEngine(pkg); } catch (e) { return false; }
      return true;
    },

    /* Helpers that hand the user over to the system UI. The engine and its
       voice data are Google's property and cannot be shipped inside the APK;
       these are the supported ways to get them onto the device. */
    openTtsSettings: function () { return call('openTtsSettings'); },
    installVoiceData: function () { return call('installVoiceData'); },
    openEngineInstall: function () { return call('openEngineInstall'); }
  };

  function call(name) {
    if (!B || typeof B[name] !== 'function') return false;
    try { return !!B[name](); } catch (e) { return false; }
  }

  window.NativeTTS = NativeTTS;
})();
