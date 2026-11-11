/* ============================================================
   Community — گروه تلگرام
   ------------------------------------------------------------
   A real, visible invitation on entry:
     · a centred dialog appears shortly after the app opens
     · a card also sits at the top of Home until you answer
     · "later" snoozes both for a week
     · "don't show again" is permanent
     · joining marks it done for good
     · always reachable from Settings, so dismissing loses nothing

   IMPORTANT: merely *showing* the invite must NOT snooze it.
   An earlier version set `until` before re-rendering, which made
   the card erase itself the instant it appeared.
   ============================================================ */
(function () {
  'use strict';

  var URL = 'https://t.me/Termefilter';
  var KEY = 'espressoA1.community.v1';
  var SNOOZE = 7 * 24 * 3600000;   // a week
  var DELAY = 1200;                // after the first screen paints

  var st = null;
  var armed = false;               // becomes true once DELAY has elapsed
  var askedThisSession = false;    // at most one dialog per app launch
  var dlg = null, scrim = null;
  var onChange = null;

  function load() {
    try { st = Object.assign({ joined: false, never: false, until: 0, shown: 0 },
                             JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { st = { joined: false, never: false, until: 0, shown: 0 }; }
    return st;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  load();

  function open() {
    // Inside the APK the native shell opens it in Telegram (or the browser).
    if (window.EspressoShell && typeof window.EspressoShell.openUrl === 'function') {
      try { if (window.EspressoShell.openUrl(URL)) return true; } catch (e) {}
    }
    try {
      var w = window.open(URL, '_blank', 'noopener');
      if (w) return true;
    } catch (e) {}
    try { window.location.href = URL; return true; } catch (e) { return false; }
  }

  /* Is the invitation still wanted at all? (independent of the current screen) */
  function eligible() {
    return !st.joined && !st.never && Date.now() >= (st.until || 0);
  }
  function onEntryScreen() {
    var h = location.hash || '';
    return !h || h === '#/home' || h === '#/' || h === '#/lessons';
  }
  function busy() {
    return !!(window.UI && window.UI.isSheetOpen && window.UI.isSheetOpen());
  }

  var PLANE = '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">'
    + '<path d="M21.9 4.3 18.9 19c-.2 1-.8 1.2-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-.9.5l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L7.2 13.1 2.7 11.7c-1-.3-1-1 .2-1.4l17.6-6.8c.8-.3 1.6.2 1.4 1z"/></svg>';

  function card() {
    return '<div class="tg-card">'
      + '<div class="tg-ico" aria-hidden="true">' + PLANE + '</div>'
      + '<div class="tg-txt"><b>به گروه تلگرام بپیوند</b>'
      + '<span>پرسش‌هایت را بپرس، نکته‌های تازه بگیر و با بقیهٔ زبان‌آموزها در ارتباط باش.</span></div>'
      + '<div class="tg-acts">'
      + '<button class="btn" data-act="tgjoin">عضویت در گروه</button>'
      + '<button class="btn sm ghost" data-act="tglater">بعداً</button>'
      + '<button class="btn sm ghost" data-act="tgnever">دیگر نشان نده</button>'
      + '</div></div>';
  }

  function closeDialog() {
    if (scrim && scrim.parentNode) scrim.parentNode.removeChild(scrim);
    if (dlg && dlg.parentNode) dlg.parentNode.removeChild(dlg);
    dlg = scrim = null;
  }

  function dialogHTML() {
    return '<div class="tg-dlg-ico" aria-hidden="true">' + PLANE + '</div>'
      + '<h2 class="tg-dlg-h">به گروه تلگرام اسپرسو بپیوند</h2>'
      + '<p class="tg-dlg-p">هر روز یک نکتهٔ کوتاه ایتالیایی، رفع اشکال درس‌ها و پاسخ به پرسش‌هایت. '
      + 'عضویت رایگان است و هر وقت بخواهی می‌توانی خارج شوی.</p>'
      + '<div class="tg-dlg-acts">'
      + '<button class="btn wide" data-tg="join">عضویت در گروه</button>'
      + '<button class="btn ghost" data-tg="later">بعداً یادآوری کن</button>'
      + '<button class="btn sm ghost" data-tg="never">دیگر نشان نده</button>'
      + '</div>';
  }

  function showDialog() {
    closeDialog();
    scrim = document.createElement('div');
    scrim.className = 'tg-scrim';
    scrim.addEventListener('click', function () { Community.later(); refresh(); });

    dlg = document.createElement('div');
    dlg.className = 'tg-dlg';
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.innerHTML = dialogHTML();
    dlg.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-tg]') : null;
      if (!b) return;
      var a = b.getAttribute('data-tg');
      if (a === 'join') Community.join();
      else if (a === 'later') Community.later();
      else Community.never();
      refresh();
    });

    document.body.appendChild(scrim);
    document.body.appendChild(dlg);
    var first = dlg.querySelector('[data-tg="join"]');
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) {} }
  }

  function refresh() {
    closeDialog();
    if (onChange) { try { onChange(); } catch (e) {} }
  }

  var Community = {
    url: URL,

    /* A dismissible card at the top of the home screen. */
    inviteCard: function () { return eligible() ? card() : ''; },

    /* Called on entry and whenever Home is rendered. Shows the dialog once
       per launch. Showing it does NOT snooze it — only an answer does. */
    maybeInvite: function (renderNow) {
      if (renderNow) onChange = renderNow;
      if (!armed || askedThisSession) return false;
      if (!eligible() || !onEntryScreen() || busy()) return false;
      if (dlg) return false;
      askedThisSession = true;
      st.shown++;
      save();
      showDialog();
      return true;
    },

    join: function () { st.joined = true; save(); return open(); },
    later: function () { st.until = Date.now() + SNOOZE; save(); },
    never: function () { st.never = true; save(); },
    reset: function () {
      st = { joined: false, never: false, until: 0, shown: 0 };
      save();
      askedThisSession = false;
    },
    close: closeDialog,

    /* Settings row is always available, even after "never". */
    settingsRow: function () { return { joined: st.joined, open: open }; },
    open: open,

    schedule: function (renderNow) {
      onChange = renderNow || null;
      setTimeout(function () {
        armed = true;
        Community.maybeInvite(onChange);
      }, DELAY);
    },

    /* test/diagnostic helper */
    _state: function () { return Object.assign({}, st, { armed: armed, asked: askedThisSession }); }
  };

  window.Community = Community;
})();
