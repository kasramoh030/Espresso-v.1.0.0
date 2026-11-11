/* ============================================================
   Bazaar — کافه‌بازار
   ------------------------------------------------------------
   Store integration for the Iranian market: rate/comment deep
   link, update check and the developer page. All of it goes
   through the native bridge (window.EspressoBazaar); in a browser
   the module reports present=false and the UI hides itself.
   ============================================================ */
(function () {
  'use strict';

  var B = window.EspressoBazaar || null;
  var PKG = 'com.kasra.espressoa1';

  function call(name, arg) {
    if (!B || typeof B[name] !== 'function') return false;
    try { return !!B[name](arg); } catch (e) { return false; }
  }

  window.Bazaar = {
    present: !!B,
    package: PKG,

    /* Opens the app's Bazaar page on the comment tab. */
    rate: function () {
      if (call('rate')) return true;
      try { window.location.href = 'bazaar://details?id=' + PKG; } catch (e) {}
      return false;
    },

    details: function () { return call('details'); },

    /* Asks Bazaar whether a newer release exists; shows its own update UI. */
    checkUpdate: function () { return call('checkUpdate'); },

    developer: function () { return call('developer'); },

    /* Whether the app was installed from Bazaar (affects update prompts). */
    installedFromStore: function () {
      if (!B || typeof B.installer !== 'function') return false;
      try {
        var i = B.installer();
        return i === 'com.farsitel.bazaar';
      } catch (e) { return false; }
    }
  };
})();
