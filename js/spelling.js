/* ============================================================
   Spelling / Dettatura — املای واژه‌های ایتالیایی
   ------------------------------------------------------------
   Two ways in:
     · swipe a vocabulary row to the left  -> inline practice
     · the «املا» tab                      -> a scored session
   Grading is character-aware: it reports exactly which letters
   are wrong, tolerates accents when asked, and never punishes
   capitalisation. Mastery is tracked per word, separately from
   the flashcard Leitner boxes.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- text helpers ---------- */

  var ACCENTS = { 'à': 'a', 'á': 'a', 'â': 'a', 'è': 'e', 'é': 'e', 'ê': 'e',
                  'ì': 'i', 'í': 'i', 'î': 'i', 'ò': 'o', 'ó': 'o', 'ô': 'o',
                  'ù': 'u', 'ú': 'u', 'û': 'u', 'ç': 'c', '’': "'" };

  function stripAccents(s) {
    return String(s).replace(/[àáâèéêìíîòóôùúûç’]/g, function (c) { return ACCENTS[c] || c; });
  }

  /* Collapse whitespace, normalise apostrophes, trim. Keeps case for display. */
  function norm(s) {
    return String(s == null ? '' : s)
      .replace(/[’‘`]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function fold(s) { return norm(s).toLowerCase(); }

  /* Words that are too short or are pure symbols make poor dictation items. */
  function spellable(w) {
    var t = norm(w);
    if (t.length < 3) return false;
    if (!/[a-zA-Zàáâèéêìíîòóôùúûç]/.test(t)) return false;
    if (/[.!?;:]/.test(t)) return false;      // sentences belong to the builder
    if (t.split(' ').length > 3) return false;
    return true;
  }

  /* ---------- grading ---------- */

  /* Levenshtein, capped for speed; used only for the "so close" tier. */
  function dist(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = new Array(n + 1), cur = new Array(n + 1), i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
                          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      var t = prev; prev = cur; cur = t;
    }
    return prev[n];
  }

  /* Per-character alignment so the UI can colour the exact mistakes. */
  function diff(answer, target) {
    var a = norm(answer), b = norm(target);
    var out = [], n = Math.max(a.length, b.length);
    for (var i = 0; i < n; i++) {
      var ca = a[i] || '', cb = b[i] || '';
      out.push({
        ch: ca, want: cb,
        ok: ca.toLowerCase() === cb.toLowerCase(),
        missing: !ca && !!cb,
        extra: !!ca && !cb
      });
    }
    return out;
  }

  /**
   * grade(answer, target, {accentStrict})
   * -> { ok, near, score 0..1, reason, diff, distance }
   * reason: 'exact' | 'accent' | 'case' | 'near' | 'empty' | 'wrong'
   */
  function grade(answer, target, opt) {
    opt = opt || {};
    var a = norm(answer), b = norm(target);
    if (!a) return { ok: false, near: false, score: 0, reason: 'empty', diff: diff(a, b), distance: b.length };

    if (a === b) return { ok: true, near: false, score: 1, reason: 'exact', diff: diff(a, b), distance: 0 };

    var fa = fold(a), fb = fold(b);
    if (fa === fb) return { ok: true, near: false, score: 1, reason: 'case', diff: diff(a, b), distance: 0 };

    var sa = stripAccents(fa), sb = stripAccents(fb);
    if (sa === sb) {
      // accent-only difference: correct unless the user asked to be strict
      return { ok: !opt.accentStrict, near: !!opt.accentStrict, score: opt.accentStrict ? 0.75 : 1,
               reason: 'accent', diff: diff(a, b), distance: 0 };
    }

    var d = dist(sa, sb);
    var near = d <= Math.max(1, Math.floor(sb.length * 0.2));
    return { ok: false, near: near, score: Math.max(0, 1 - d / Math.max(1, sb.length)),
             reason: near ? 'near' : 'wrong', diff: diff(a, b), distance: d };
  }

  /* ---------- hints ---------- */

  /* level 1 -> first letter, 2 -> first third, 3 -> all but last two */
  function hint(target, level) {
    var t = norm(target);
    if (!level) return '';
    var keep = level === 1 ? 1 : level === 2 ? Math.ceil(t.length / 3) : Math.max(1, t.length - 2);
    var out = '';
    for (var i = 0; i < t.length; i++) {
      var c = t[i];
      out += (i < keep || c === ' ' || c === "'") ? c : '·';
    }
    return out;
  }

  /* Scrambled letter tiles, for the tap-to-build mode. */
  function tiles(target, rnd) {
    var t = norm(target).replace(/\s/g, '');
    var arr = t.split('');
    var r = rnd || Math.random;
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    // add two plausible distractors so it is not a pure anagram
    var pool = 'aeiourstnclm'.split('');
    if (t.length <= 9) {
      arr.push(pool[Math.floor(r() * pool.length)]);
      arr.push(pool[Math.floor(r() * pool.length)]);
      for (var k = arr.length - 1; k > 0; k--) {
        var j2 = Math.floor(r() * (k + 1));
        var t2 = arr[k]; arr[k] = arr[j2]; arr[j2] = t2;
      }
    }
    return arr;
  }

  /* ---------- word pool ---------- */

  function allWords() {
    var E = window.ESPRESSO;
    if (!E || !E.lessons) return [];
    var out = [];
    E.lessons.forEach(function (l) {
      (l.vocab || []).forEach(function (g, gi) {
        (g.items || []).forEach(function (it) {
          if (spellable(it.w)) {
            out.push({ key: 'L' + l.id + '.' + gi + ':' + it.w, w: norm(it.w),
                       fa: it.fa, l: l.id, t: it.t || '' });
          }
        });
      });
    });
    return out;
  }

  function pool(lessonId, filter) {
    var ws = allWords();
    if (lessonId) ws = ws.filter(function (x) { return x.l === +lessonId; });
    var mastery = load();
    if (filter === 'new') ws = ws.filter(function (x) { return !mastery[x.key]; });
    else if (filter === 'weak') ws = ws.filter(function (x) {
      var m = mastery[x.key]; return m && m.wrong > 0 && m.streak < 3;
    });
    else if (filter === 'hard') ws = ws.filter(function (x) { return x.w.length >= 7; });
    return ws;
  }

  /* ---------- mastery store ---------- */

  var SKEY = 'espressoA1.spelling.v1';
  var mem = null;

  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(SKEY) || '{}') || {}; }
    catch (e) { mem = {}; }
    return mem;
  }

  function persist() {
    try { localStorage.setItem(SKEY, JSON.stringify(mem || {})); } catch (e) {}
  }

  /* Three correct in a row = mastered. A miss resets the streak. */
  function record(key, ok, hintsUsed) {
    var m = load();
    var r = m[key] || { right: 0, wrong: 0, streak: 0, hints: 0, last: 0 };
    if (ok) {
      r.right++;
      r.streak = hintsUsed ? 0 : r.streak + 1;   // a hinted answer does not build mastery
    } else {
      r.wrong++;
      r.streak = 0;
    }
    r.hints += hintsUsed || 0;
    r.last = Date.now();
    r.mastered = r.streak >= 3;
    m[key] = r;
    persist();
    return r;
  }

  function stats(lessonId) {
    var m = load(), ws = allWords();
    if (lessonId) ws = ws.filter(function (x) { return x.l === +lessonId; });
    var tried = 0, mastered = 0, right = 0, wrong = 0;
    ws.forEach(function (x) {
      var r = m[x.key];
      if (!r) return;
      tried++;
      if (r.mastered) mastered++;
      right += r.right; wrong += r.wrong;
    });
    return { total: ws.length, tried: tried, mastered: mastered,
             right: right, wrong: wrong,
             accuracy: right + wrong ? Math.round(right / (right + wrong) * 100) : 0 };
  }

  function reset() { mem = {}; persist(); }

  /* ---------- session ---------- */

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /**
   * session({lesson, filter, count, seed})
   * -> { items, i, right, wrong, hints, started, done }
   */
  function session(opt) {
    opt = opt || {};
    var rnd = mulberry32(opt.seed || (Date.now() & 0x7fffffff));
    var ws = pool(opt.lesson, opt.filter).slice();
    // prioritise un-mastered and previously-missed words
    var m = load();
    ws.sort(function (a, b) {
      var ra = m[a.key], rb = m[b.key];
      var pa = ra ? (ra.mastered ? 2 : (ra.wrong > 0 ? 0 : 1)) : 1;
      var pb = rb ? (rb.mastered ? 2 : (rb.wrong > 0 ? 0 : 1)) : 1;
      if (pa !== pb) return pa - pb;
      return rnd() - 0.5;
    });
    var n = Math.min(opt.count || 10, ws.length);
    return { items: ws.slice(0, n), i: 0, right: 0, wrong: 0, hints: 0,
             missed: [], started: Date.now(), done: false,
             get cur() { return this.items[this.i] || null; } };
  }

  window.Spelling = {
    norm: norm, fold: fold, stripAccents: stripAccents,
    spellable: spellable, grade: grade, diff: diff, hint: hint, tiles: tiles,
    pool: pool, allWords: allWords, session: session,
    record: record, stats: stats, reset: reset,
    ACCENT_KEYS: ['à', 'è', 'é', 'ì', 'ò', 'ù']
  };
})();
