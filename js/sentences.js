/* ============================================================
   Espresso A1 — unlimited sentence builder
   Generates a fresh, grammatical sentence every time by combining
   a lesson frame with typed pools. Agreement is resolved from the
   data (person / gender / number / preposition), never guessed.
   ============================================================ */
(function () {
  'use strict';

  function pick(a, rnd) { return a[Math.floor(rnd() * a.length)]; }

  /* mulberry32 — deterministic per seed so a sentence can be reproduced/shared */
  function rng(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  var VERB_ALIAS = {
    avere_obj: 'avere',
    andare_city: 'andare',
    andare_country: 'andare'
  };

  function verbTable(S, name) {
    if (VERB_ALIAS[name]) name = VERB_ALIAS[name];
    if (name === 'essere') return S.essere;
    if (name === 'avere') return S.avere;
    if (name === 'andare') return S.andare;
    return S.verbs[name];
  }

  /* Build one sentence. Returns {it, fa, tokens, note, frame, seed}. */
  function generate(lessonId, seed) {
    var S = window.ESPRESSO.sentences;
    var frames = S.lessons[lessonId] || S.lessons[1];
    var rnd = rng(seed);
    var f = pick(frames, rnd);
    var subj = pick(S.subj, rnd);
    var p = subj.p;
    var gn = pick(subj.gn, rnd);

    var map = { S: subj.it, S_FA: subj.fa };
    var ess = S.essere;
    map.ESS = ess.it[p];
    map.ESS_FA = ess.fa[p];

    /* family frames: the member itself carries person + gender */
    var fam = null;
    if (f.fam) {
      fam = pick(S.pools.family, rnd);
      p = fam.p;
      gn = fam.gn;
      map.FAM = fam.it; map.FAM_FA = fam.fa;
      map.FESS = S.essere.it[p]; map.FESS_FA = S.essere.fa[p];
    }
    if (f.third) { p = 2; }
    if (f.sixth) { p = 5; }

    if (f.v) {
      var vt = verbTable(S, f.v);
      map.V = vt.it[p];
      map.V_FA = vt.fa[p];
      map.VF = vt.it[p]; map.VF_FA = vt.fa[p];
      map.V3 = vt.it[2]; map.V3_FA = vt.fa[2];
      map.V6 = vt.it[5]; map.V6_FA = vt.fa[5];
    }
    if (f.famadj) {
      var fadj = pick(S.adj, rnd);
      map.FA = fadj.forms[gn];
      map.FA_FA = fadj.fa;
    }

    /* adjective agreement */
    if (f.adj) {
      var a = pick(S.adj, rnd);
      map.A = a.forms[gn];
      map.A_FA = a.fa;
    }
    if (f.roomadj) {
      var ra = pick(S.adj, rnd);
      map.ADJ_F = ra.forms[1];   /* camera is feminine singular */
      map.A_FA = ra.fa;
    }
    if (f.fixed === 'intro') {
      var n = pick(S.nazionalita, rnd);
      map.NAT = n.forms[gn];
      map.NAT_FA = n.fa;
    }

    /* object pools */
    function put(poolName, token) {
      var pool = S.pools[poolName];
      if (!pool) return null;
      var v = pick(pool, rnd);
      map[token] = v.it;
      map[token + '_FA'] = v.fa;
      return v;
    }
    var POOL_TOKEN = {
      food: 'O', drink: 'O', thing: 'O', reading: 'O', watch: 'O', listen: 'O',
      study: 'O', language: 'LANG', city: 'CITY', country: 'COUNTRY',
      venue: 'VENUE', room: 'O', sight: 'O'
    };
    if (f.o) {
      var tok = POOL_TOKEN[f.o] || 'O';
      put(f.o, tok);
      /* frames that name the object slot explicitly */
      if (f.polite) put(f.polite, 'O');
    }
    if (f.o2) {
      var pool2 = S.pools[f.o2];
      var v2 = pick(pool2, rnd);
      /* avoid "parlo italiano e italiano" */
      var guard = 0;
      while (v2.it === map.LANG && guard++ < 8) v2 = pick(pool2, rnd);
      map.LANG2 = v2.it; map.LANG2_FA = v2.fa;
    }
    if (f.t) put(f.t, 'TIME');
    if (f.polite && !f.o) put(f.polite, 'O');
    if (f.like) put(f.like, 'ACT');
    if (f.familylike) { put(f.familylike, 'ACT'); map.LIKE = 'ci piace'; }
    if (f.cost) put(f.cost, 'O');
    if (f.there) { put('city', 'CITY'); put('sight', 'SIGHT'); }

    function fill(tpl) {
      return tpl.replace(/\{([A-Z0-9_]+)\}/g, function (_, k) {
        return map[k] !== undefined ? map[k] : '';
      }).replace(/\s+/g, ' ').replace(/\s+([,.?!])/g, '$1').trim();
    }

    var it = fill(f.it);
    var fa = fill(f.fa);
    /* Italian subject pronouns are capitalised only at the sentence start.
       Templates like "{TIME}, {S} {V} {O}" put the subject mid-sentence. */
    it = it.replace(/\b(Io|Tu|Lui|Lei|Noi|Voi|Loro)\b/g, function (m, _g, off) {
      return off === 0 ? m : m.toLowerCase();
    });
    /* family frames start mid-template, so capitalise the sentence start */
    it = it.charAt(0).toUpperCase() + it.slice(1);

    /* tokenise on spaces but keep elisions (un’amica, c’è, d’acqua) intact */
    var tokens = it.replace(/([,.?!])$/, '').split(/\s+/).filter(Boolean);

    return {
      it: it, fa: fa, tokens: tokens, note: f.note || '',
      seed: seed, lesson: lessonId,
      words: tokens.length
    };
  }

  /* A cheap uniqueness guard so "unlimited" does not immediately repeat. */
  function makeSession(lessonId) {
    var seen = {};
    var n = 0;
    return {
      lesson: lessonId,
      next: function () {
        var s, tries = 0;
        do {
          s = generate(lessonId, (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
          tries++;
        } while (seen[s.it] && tries < 40);
        seen[s.it] = 1;
        n++;
        /* bound memory on very long sessions */
        if (n % 300 === 0) seen = {};
        return s;
      },
      count: function () { return n; }
    };
  }

  /* how many distinct sentences a lesson can produce (for the UI) */
  function variety(lessonId) {
    var S = window.ESPRESSO.sentences;
    var frames = S.lessons[lessonId] || [];
    var total = 0;
    frames.forEach(function (f) {
      var n = 1;
      if (f.fam) n *= S.pools.family.length;
      else if (!f.third && !f.sixth && !f.polite && !f.like && !f.familylike && !f.cost && !f.there && !f.roomadj) n *= S.subj.length;
      if (f.famadj) n *= S.adj.length;
      if (f.o && S.pools[f.o]) n *= S.pools[f.o].length;
      if (f.o2 && S.pools[f.o2]) n *= Math.max(1, S.pools[f.o2].length - 1);
      if (f.t && S.pools[f.t]) n *= S.pools[f.t].length;
      if (f.polite && S.pools[f.polite]) n *= S.pools[f.polite].length;
      if (f.like && S.pools[f.like]) n *= S.pools[f.like].length;
      if (f.familylike && S.pools[f.familylike]) n *= S.pools[f.familylike].length;
      if (f.cost && S.pools[f.cost]) n *= S.pools[f.cost].length;
      if (f.adj) n *= S.adj.length;
      if (f.roomadj) n *= S.adj.length;
      if (f.fixed === 'intro') n *= S.nazionalita.length;
      if (f.there) n *= S.pools.city.length * S.pools.sight.length;
      total += n;
    });
    return total;
  }

  window.Sentences = { generate: generate, session: makeSession, variety: variety };
})();
