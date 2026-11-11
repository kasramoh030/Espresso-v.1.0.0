/* ============================================================
   Espresso A1 — sentence generator data
   Combinatorial frames + typed pools. Every combination is
   grammatical in both Italian and Persian because agreement
   (person, gender, number, preposition) is resolved from the
   pool metadata, never guessed.
   ============================================================ */
window.ESPRESSO.sentences = {

  /* subjects: p = verb person index, gn = gender/number index (0 ms, 1 fs, 2 mp, 3 fp) */
  subj: [
    { it: 'Io',   fa: 'من',        p: 0, gn: [0, 1] },
    { it: 'Tu',   fa: 'تو',        p: 1, gn: [0, 1] },
    { it: 'Lui',  fa: 'او',        p: 2, gn: [0] },
    { it: 'Lei',  fa: 'او',        p: 2, gn: [1] },
    { it: 'Noi',  fa: 'ما',        p: 3, gn: [2] },
    { it: 'Voi',  fa: 'شما',       p: 4, gn: [2] },
    { it: 'Loro', fa: 'آن‌ها',     p: 5, gn: [2] }
  ],

  /* verbs: it/fa arrays are the six present-tense persons */
  verbs: {
    mangiare:  { inf: 'mangiare',  faInf: 'خوردن',
      it: ['mangio','mangi','mangia','mangiamo','mangiate','mangiano'],
      fa: ['می‌خورم','می‌خوری','می‌خورد','می‌خوریم','می‌خورید','می‌خورند'] },
    bere:      { inf: 'bere',      faInf: 'نوشیدن',
      it: ['bevo','bevi','beve','beviamo','bevete','bevono'],
      fa: ['می‌نوشم','می‌نوشی','می‌نوشد','می‌نوشیم','می‌نوشید','می‌نوشند'] },
    prendere:  { inf: 'prendere',  faInf: 'گرفتن',
      it: ['prendo','prendi','prende','prendiamo','prendete','prendono'],
      fa: ['می‌گیرم','می‌گیری','می‌گیرد','می‌گیریم','می‌گیرید','می‌گیرند'] },
    preferire: { inf: 'preferire', faInf: 'ترجیح دادن',
      it: ['preferisco','preferisci','preferisce','preferiamo','preferite','preferiscono'],
      fa: ['ترجیح می‌دهم','ترجیح می‌دهی','ترجیح می‌دهد','ترجیح می‌دهیم','ترجیح می‌دهید','ترجیح می‌دهند'] },
    comprare:  { inf: 'comprare',  faInf: 'خریدن',
      it: ['compro','compri','compra','compriamo','comprate','comprano'],
      fa: ['می‌خرم','می‌خری','می‌خرد','می‌خریم','می‌خرید','می‌خرند'] },
    leggere:   { inf: 'leggere',   faInf: 'خواندن',
      it: ['leggo','leggi','legge','leggiamo','leggete','leggono'],
      fa: ['می‌خوانم','می‌خوانی','می‌خواند','می‌خوانیم','می‌خوانید','می‌خوانند'] },
    guardare:  { inf: 'guardare',  faInf: 'تماشا کردن',
      it: ['guardo','guardi','guarda','guardiamo','guardate','guardano'],
      fa: ['تماشا می‌کنم','تماشا می‌کنی','تماشا می‌کند','تماشا می‌کنیم','تماشا می‌کنید','تماشا می‌کنند'] },
    ascoltare: { inf: 'ascoltare', faInf: 'گوش دادن به',
      it: ['ascolto','ascolti','ascolta','ascoltiamo','ascoltate','ascoltano'],
      fa: ['گوش می‌دهم','گوش می‌دهی','گوش می‌دهد','گوش می‌دهیم','گوش می‌دهید','گوش می‌دهند'] },
    studiare:  { inf: 'studiare',  faInf: 'مطالعه کردن',
      it: ['studio','studi','studia','studiamo','studiate','studiano'],
      fa: ['مطالعه می‌کنم','مطالعه می‌کنی','مطالعه می‌کند','مطالعه می‌کنیم','مطالعه می‌کنید','مطالعه می‌کنند'] },
    parlare:   { inf: 'parlare',   faInf: 'صحبت کردن',
      it: ['parlo','parli','parla','parliamo','parlate','parlano'],
      fa: ['صحبت می‌کنم','صحبت می‌کنی','صحبت می‌کند','صحبت می‌کنیم','صحبت می‌کنید','صحبت می‌کنند'] },
    abitare:   { inf: 'abitare',   faInf: 'زندگی کردن',
      it: ['abito','abiti','abita','abitiamo','abitate','abitano'],
      fa: ['زندگی می‌کنم','زندگی می‌کنی','زندگی می‌کند','زندگی می‌کنیم','زندگی می‌کنید','زندگی می‌کنند'] },
    lavorare:  { inf: 'lavorare',  faInf: 'کار کردن',
      it: ['lavoro','lavori','lavora','lavoriamo','lavorate','lavorano'],
      fa: ['کار می‌کنم','کار می‌کنی','کار می‌کند','کار می‌کنیم','کار می‌کنید','کار می‌کنند'] },
    visitare:  { inf: 'visitare',  faInf: 'بازدید کردن',
      it: ['visito','visiti','visita','visitiamo','visitate','visitano'],
      fa: ['بازدید می‌کنم','بازدید می‌کنی','بازدید می‌کند','بازدید می‌کنیم','بازدید می‌کنید','بازدید می‌کنند'] },
    prenotare: { inf: 'prenotare', faInf: 'رزرو کردن',
      it: ['prenoto','prenoti','prenota','prenotiamo','prenotate','prenotano'],
      fa: ['رزرو می‌کنم','رزرو می‌کنی','رزرو می‌کند','رزرو می‌کنیم','رزرو می‌کنید','رزرو می‌کنند'] },
    ordinare:  { inf: 'ordinare',  faInf: 'سفارش دادن',
      it: ['ordino','ordini','ordina','ordiniamo','ordinate','ordinano'],
      fa: ['سفارش می‌دهم','سفارش می‌دهی','سفارش می‌دهد','سفارش می‌دهیم','سفارش می‌دهید','سفارش می‌دهند'] },
    cucinare:  { inf: 'cucinare',  faInf: 'پختن',
      it: ['cucino','cucini','cucina','cuciniamo','cucinate','cucinano'],
      fa: ['می‌پزم','می‌پزی','می‌پزد','می‌پزیم','می‌پزید','می‌پزند'] },
    pagare:    { inf: 'pagare',    faInf: 'پرداختن',
      it: ['pago','paghi','paga','paghiamo','pagate','pagano'],
      fa: ['پرداخت می‌کنم','پرداخت می‌کنی','پرداخت می‌کند','پرداخت می‌کنیم','پرداخت می‌کنید','پرداخت می‌کنند'] },
    vedere:    { inf: 'vedere',    faInf: 'دیدن',
      it: ['vedo','vedi','vede','vediamo','vedete','vedono'],
      fa: ['می‌بینم','می‌بینی','می‌بیند','می‌بینیم','می‌بینید','می‌بینند'] },
    scrivere:  { inf: 'scrivere',  faInf: 'نوشتن',
      it: ['scrivo','scrivi','scrive','scriviamo','scrivete','scrivono'],
      fa: ['می‌نویسم','می‌نویسی','می‌نویسد','می‌نویسیم','می‌نویسید','می‌نویسند'] },
    aprire:    { inf: 'aprire',    faInf: 'باز کردن',
      it: ['apro','apri','apre','apriamo','aprite','aprono'],
      fa: ['باز می‌کنم','باز می‌کنی','باز می‌کند','باز می‌کنیم','باز می‌کنید','باز می‌کنند'] }
  },

  /* object pools — the Italian article is stored with the noun so it can never disagree */
  pools: {
    food: [
      { it: 'una pizza',        fa: 'یک پیتزا' },
      { it: 'un panino',        fa: 'یک ساندویچ' },
      { it: 'un gelato',        fa: 'یک بستنی' },
      { it: 'una bistecca',     fa: 'یک استیک' },
      { it: 'un’insalata',      fa: 'یک سالاد' },
      { it: 'una torta',        fa: 'یک کیک' },
      { it: 'un piatto di pasta', fa: 'یک بشقاب پاستا' },
      { it: 'una margherita',   fa: 'یک پیتزای مارگاریتا' },
      { it: 'un piatto di riso', fa: 'یک بشقاب برنج' },
      { it: 'una zuppa',        fa: 'یک سوپ' }
    ],
    drink: [
      { it: 'un caffè',           fa: 'یک قهوه' },
      { it: 'un cappuccino',      fa: 'یک کاپوچینو' },
      { it: 'un bicchiere d’acqua', fa: 'یک لیوان آب' },
      { it: 'una birra',          fa: 'یک آبجو' },
      { it: 'un bicchiere di vino', fa: 'یک لیوان شراب' },
      { it: 'un tè',              fa: 'یک چای' },
      { it: 'un succo di frutta', fa: 'یک آب‌میوه' }
    ],
    thing: [
      { it: 'un libro',      fa: 'یک کتاب' },
      { it: 'una penna',     fa: 'یک خودکار' },
      { it: 'un quaderno',   fa: 'یک دفتر' },
      { it: 'una borsa',     fa: 'یک کیف' },
      { it: 'un biglietto',  fa: 'یک بلیت' },
      { it: 'una mappa',     fa: 'یک نقشه' },
      { it: 'un regalo',     fa: 'یک هدیه' },
      { it: 'una rivista',   fa: 'یک مجله' }
    ],
    reading: [
      { it: 'un libro',     fa: 'یک کتاب' },
      { it: 'un giornale',  fa: 'یک روزنامه' },
      { it: 'una rivista',  fa: 'یک مجله' },
      { it: 'una lettera',  fa: 'یک نامه' },
      { it: 'un messaggio', fa: 'یک پیام' },
      { it: 'una storia',   fa: 'یک داستان' }
    ],
    watch: [
      { it: 'la televisione', fa: 'تلویزیون' },
      { it: 'un film',        fa: 'یک فیلم' },
      { it: 'una partita',    fa: 'یک مسابقه' },
      { it: 'una serie',      fa: 'یک سریال' },
      { it: 'un documentario', fa: 'یک مستند' }
    ],
    listen: [
      { it: 'la musica',   fa: 'موسیقی' },
      { it: 'la radio',    fa: 'رادیو' },
      { it: 'una canzone', fa: 'یک ترانه' },
      { it: 'un podcast',  fa: 'یک پادکست' }
    ],
    study: [
      { it: 'l’italiano',    fa: 'ایتالیایی' },
      { it: 'la grammatica', fa: 'گرامر' },
      { it: 'la storia',     fa: 'تاریخ' },
      { it: 'l’inglese',     fa: 'انگلیسی' },
      { it: 'la geografia',  fa: 'جغرافیا' }
    ],
    language: [
      { it: 'italiano',  fa: 'ایتالیایی' },
      { it: 'inglese',   fa: 'انگلیسی' },
      { it: 'spagnolo',  fa: 'اسپانیایی' },
      { it: 'francese',  fa: 'فرانسه‌ای' },
      { it: 'tedesco',   fa: 'آلمانی' },
      { it: 'persiano',  fa: 'فارسی' }
    ],
    city: [
      { it: 'Roma',     fa: 'رم' },
      { it: 'Milano',   fa: 'میلان' },
      { it: 'Napoli',   fa: 'ناپل' },
      { it: 'Firenze',  fa: 'فلورانس' },
      { it: 'Torino',   fa: 'تورین' },
      { it: 'Bologna',  fa: 'بولونیا' },
      { it: 'Venezia',  fa: 'ونیز' },
      { it: 'Palermo',  fa: 'پالرمو' }
    ],
    country: [
      { it: 'Italia',   fa: 'ایتالیا' },
      { it: 'Germania', fa: 'آلمان' },
      { it: 'Francia',  fa: 'فرانسه' },
      { it: 'Spagna',   fa: 'اسپانیا' },
      { it: 'Iran',     fa: 'ایران' }
    ],
    venue: [
      { it: 'un ristorante', fa: 'یک رستوران' },
      { it: 'un bar',        fa: 'یک کافه' },
      { it: 'un albergo',    fa: 'یک هتل' },
      { it: 'un museo',      fa: 'یک موزه' },
      { it: 'un negozio',    fa: 'یک فروشگاه' },
      { it: 'un ufficio',    fa: 'یک دفتر کار' },
      { it: 'una scuola',    fa: 'یک مدرسه' }
    ],
    room: [
      { it: 'una camera singola', fa: 'یک اتاق یک‌نفره' },
      { it: 'una camera doppia',  fa: 'یک اتاق دونفره' },
      { it: 'una camera matrimoniale', fa: 'یک اتاق دونفره با تخت بزرگ' },
      { it: 'una suite',          fa: 'یک سوئیت' }
    ],
    sight: [
      { it: 'il Colosseo',      fa: 'کولوسئوم' },
      { it: 'il Duomo',         fa: 'گنبد بزرگ شهر' },
      { it: 'il centro storico', fa: 'بافت تاریخی شهر' },
      { it: 'il museo',         fa: 'موزه' },
      { it: 'la piazza',        fa: 'میدان' },
      { it: 'il castello',      fa: 'قلعه' }
    ],
    activity: [
      { it: 'viaggiare',      fa: 'سفر کردن' },
      { it: 'cucinare',       fa: 'آشپزی کردن' },
      { it: 'leggere',        fa: 'کتاب خواندن' },
      { it: 'ballare',        fa: 'رقصیدن' },
      { it: 'cantare',        fa: 'آواز خواندن' },
      { it: 'nuotare',        fa: 'شنا کردن' },
      { it: 'camminare',      fa: 'پیاده‌روی کردن' },
      { it: 'studiare le lingue', fa: 'یادگیری زبان' }
    ],
    family: [
      { it: 'mio padre',       fa: 'پدرم',                  p: 2, gn: 0 },
      { it: 'mia madre',       fa: 'مادرم',                 p: 2, gn: 1 },
      { it: 'mio fratello',    fa: 'برادرم',                p: 2, gn: 0 },
      { it: 'mia sorella',     fa: 'خواهرم',                p: 2, gn: 1 },
      { it: 'mio marito',      fa: 'شوهرم',                 p: 2, gn: 0 },
      { it: 'mia moglie',      fa: 'همسرم',                 p: 2, gn: 1 },
      { it: 'mio figlio',      fa: 'پسرم',                  p: 2, gn: 0 },
      { it: 'mia figlia',      fa: 'دخترم',                 p: 2, gn: 1 },
      { it: 'mio nonno',       fa: 'پدربزرگم',              p: 2, gn: 0 },
      { it: 'mia nonna',       fa: 'مادربزرگم',             p: 2, gn: 1 },
      { it: 'mio zio',         fa: 'عموی من',               p: 2, gn: 0 },
      { it: 'mia zia',         fa: 'عمهٔ من',               p: 2, gn: 1 },
      { it: 'mio cugino',      fa: 'پسرعموی من',            p: 2, gn: 0 },
      { it: 'mia cugina',      fa: 'دخترعموی من',           p: 2, gn: 1 },
      { it: 'i miei genitori', fa: 'پدر و مادرم',           p: 5, gn: 2 },
      { it: 'i miei nonni',    fa: 'پدربزرگ و مادربزرگم',   p: 5, gn: 2 },
      { it: 'i miei figli',    fa: 'فرزندانم',              p: 5, gn: 2 },
      { it: 'i miei fratelli', fa: 'برادرانم',              p: 5, gn: 2 },
      { it: 'le mie sorelle',  fa: 'خواهرانم',              p: 5, gn: 3 }
    ],
    time: [
      { it: 'la mattina',    fa: 'صبح‌ها' },
      { it: 'il pomeriggio', fa: 'بعدازظهرها' },
      { it: 'la sera',       fa: 'عصرها' },
      { it: 'il weekend',    fa: 'آخر هفته‌ها' },
      { it: 'il lunedì',     fa: 'دوشنبه‌ها' },
      { it: 'd’estate',      fa: 'در تابستان' },
      { it: 'd’inverno',     fa: 'در زمستان' }
    ]
  },

  /* adjectives carry all four agreement forms */
  adj: [
    { forms: ['italiano','italiana','italiani','italiane'], fa: 'ایتالیایی' },
    { forms: ['stanco','stanca','stanchi','stanche'],       fa: 'خسته' },
    { forms: ['felice','felice','felici','felici'],         fa: 'خوشحال' },
    { forms: ['pronto','pronta','pronti','pronte'],         fa: 'آماده' },
    { forms: ['occupato','occupata','occupati','occupate'], fa: 'مشغول' },
    { forms: ['libero','libera','liberi','libere'],         fa: 'آزاد' },
    { forms: ['bravo','brava','bravi','brave'],             fa: 'ماهر' },
    { forms: ['contento','contenta','contenti','contente'], fa: 'راضی' },
    { forms: ['straniero','straniera','stranieri','straniere'], fa: 'خارجی' },
    { forms: ['giovane','giovane','giovani','giovani'],     fa: 'جوان' }
  ],

  essere: {
    it: ['sono','sei','è','siamo','siete','sono'],
    fa: ['هستم','هستی','است','هستیم','هستید','هستند']
  },

  /* frames per lesson.
     it/fa are templates; {S}=subject {V}=verb {O}=object {A}=adjective
     {P}=pool value. Literal words (a, in, di…) stay in the template so the
     preposition is always the one that pool requires. */
  lessons: {
    1: [
      { it: '{S} {ESS} {NAT}.', fa: '{S_FA} {NAT_FA} {ESS_FA}.', fixed: 'intro',
        note: 'فعل essere برای گفتن ملیت: io sono، tu sei، lui/lei è.' },
      { it: '{S} {V} {LANG}.', fa: '{S_FA} به {LANG_FA} {V_FA}.', v: 'parlare', o: 'language',
        note: 'بعد از parlare نام زبان بدون حرف تعریف می‌آید: parlo italiano.' },
      { it: '{S} {V} a {CITY}.', fa: '{S_FA} در {CITY_FA} {V_FA}.', v: 'abitare', o: 'city',
        note: 'برای شهرها از حرف اضافهٔ a استفاده می‌شود: abito a Roma.' },
      { it: '{S} {V} in {COUNTRY}.', fa: '{S_FA} در {COUNTRY_FA} {V_FA}.', v: 'abitare', o: 'country',
        note: 'برای کشورها از in استفاده می‌شود: abito in Italia.' },
      { it: '{S} {ESS} {A}.', fa: '{S_FA} {A_FA} {ESS_FA}.', adj: true,
        note: 'صفت با جنس و شمار فاعل مطابقت می‌کند: italiano / italiana / italiani.' },
      { it: '{S} {V} {LANG} e {LANG2}.', fa: '{S_FA} به {LANG_FA} و {LANG2_FA} {V_FA}.',
        v: 'parlare', o: 'language', o2: 'language',
        note: 'با e می‌توانی دو زبان را به هم وصل کنی.' }
    ],
    2: [
      { it: '{S} {ESS} {A}.', fa: '{S_FA} {A_FA} {ESS_FA}.', adj: true,
        note: 'صفت باید با فاعل هم‌جنس و هم‌شمار باشد.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'avere_obj', o: 'thing',
        note: 'فعل avere برای مالکیت: ho un libro.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'comprare', o: 'thing',
        note: 'فعل‌های گروه are- در حال ساده: compro, compri, compra.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'vedere', o: 'thing',
        note: 'vedere بی‌قاعده است: vedo, vedi, vede, vediamo, vedete, vedono.' },
      { it: '{S} {V} in {VENUE}.', fa: '{S_FA} در {VENUE_FA} {V_FA}.', v: 'lavorare', o: 'venue',
        note: 'lavorare in + مکان سرپوشیده.' }
    ],
    3: [
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'mangiare', o: 'food',
        note: 'mangiare + غذا، بدون حرف اضافه.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'bere', o: 'drink',
        note: 'bere بی‌قاعده است: bevo, bevi, beve, beviamo, bevete, bevono.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'prendere', o: 'drink',
        note: 'در کافه prendere خیلی رایج است: prendo un caffè.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'preferire', o: 'food',
        note: 'preferire از گروه ire- با isc- است: preferisco, preferisci, preferisce.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'ordinare', o: 'food',
        note: 'ordinare = سفارش دادن در رستوران.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'cucinare', o: 'food',
        note: 'cucinare = پختن. حرف تعریف با جنس اسم می‌آید.' },
      { it: 'Vorrei {O}, per favore.', fa: '{O_FA} می‌خواهم، لطفاً.', polite: 'food',
        note: 'Vorrei شکل مؤدبانهٔ voglio است؛ در رستوران از همین استفاده کن.' }
    ],
    4: [
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'guardare', o: 'watch',
        note: 'guardare = تماشا کردن، بدون حرف اضافه.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} به {O_FA} {V_FA}.', v: 'ascoltare', o: 'listen',
        note: 'ascoltare خودش «گوش دادن به» است؛ حرف اضافه نمی‌خواهد.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'leggere', o: 'reading',
        note: 'leggere: leggo, leggi, legge, leggiamo, leggete, leggono.' },
      { it: 'Mi piace {ACT}.', fa: '{ACT_FA} را دوست دارم.', like: 'activity',
        note: 'بعد از mi piace فعل به صورت مصدر می‌آید: mi piace viaggiare.' },
      { it: '{S} {V} {O} {TIME}.', fa: '{S_FA} {TIME_FA} {O_FA} {V_FA}.',
        v: 'guardare', o: 'watch', t: 'time',
        note: 'قید زمان معمولاً آخر جملهٔ ایتالیایی می‌آید.' },
      { it: '{TIME}, {S} {V} {O}.', fa: '{S_FA} {TIME_FA} {O_FA} {V_FA}.',
        v: 'leggere', o: 'reading', t: 'time',
        note: 'برای تأکید می‌توانی قید زمان را اول جمله بیاوری.' }
    ],
    5: [
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'prenotare', o: 'room',
        note: 'prenotare una camera = رزرو اتاق.' },
      { it: 'Vorrei prenotare {O}.', fa: 'می‌خواهم {O_FA} رزرو کنم.', polite: 'room',
        note: 'Vorrei + مصدر، ساختار مؤدبانهٔ درخواست.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'pagare', o: 'thing',
        note: 'pagare: pago, paghi, paga — قبل از e/i یک h می‌گیرد.' },
      { it: '{S} {V} a {CITY}.', fa: '{S_FA} در {CITY_FA} {V_FA}.', v: 'abitare', o: 'city',
        note: 'شهر با a می‌آید.' },
      { it: 'La camera è {ADJ_F}.', fa: 'اتاق {A_FA} است.', roomadj: true,
        note: 'camera مؤنث است، پس صفت هم مؤنث می‌آید: libera, occupata.' },
      { it: '{S} {V} {O} per due notti.', fa: '{S_FA} {O_FA} برای دو شب {V_FA}.',
        v: 'prenotare', o: 'room',
        note: 'per + مدت زمان: per due notti.' }
    ],
    6: [
      { it: '{S} {V} {O}.', fa: '{S_FA} از {O_FA} {V_FA}.', v: 'visitare', o: 'sight',
        note: 'visitare + مکان دیدنی، بدون حرف اضافه.' },
      { it: '{S} {V} a {CITY}.', fa: '{S_FA} به {CITY_FA} {V_FA}.', v: 'andare_city', o: 'city',
        note: 'andare a + شهر: vado a Roma.' },
      { it: '{S} {V} in {COUNTRY}.', fa: '{S_FA} به {COUNTRY_FA} {V_FA}.', v: 'andare_country', o: 'country',
        note: 'andare in + کشور: vado in Italia.' },
      { it: 'A {CITY} c’è {SIGHT}.', fa: 'در {CITY_FA} {SIGHT_FA} هست.', there: true,
        note: 'c’è = وجود دارد (مفرد). برای جمع می‌شود ci sono.' },
      { it: '{S} {V} {O} {TIME}.', fa: '{S_FA} {TIME_FA} از {O_FA} {V_FA}.',
        v: 'visitare', o: 'sight', t: 'time',
        note: 'ترتیب معمول: فاعل + فعل + مفعول + زمان.' }
    ],
    7: [
      { it: '{S} {V} in {COUNTRY} {TIME}.', fa: '{S_FA} {TIME_FA} به {COUNTRY_FA} {V_FA}.',
        v: 'andare_country', o: 'country', t: 'time',
        note: 'زمان سفر را می‌توانی آخر جمله اضافه کنی.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'prenotare', o: 'room',
        note: 'برای رزرو اقامتگاه از prenotare استفاده کن.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'comprare', o: 'thing',
        note: 'خرید سوغاتی: comprare un regalo.' },
      { it: 'Mi piace {ACT}.', fa: '{ACT_FA} را دوست دارم.', like: 'activity',
        note: 'mi piace + مصدر.' },
      { it: '{S} {ESS} {A}.', fa: '{S_FA} {A_FA} {ESS_FA}.', adj: true,
        note: 'صفت با فاعل مطابقت می‌کند.' }
    ],
    8: [
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'cucinare', o: 'food',
        note: 'دستور پخت: cucinare + غذا.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'comprare', o: 'food',
        note: 'خرید مواد غذایی.' },
      { it: 'Vorrei {O}, per favore.', fa: '{O_FA} می‌خواهم، لطفاً.', polite: 'food',
        note: 'درخواست مؤدبانه در فروشگاه.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'preferire', o: 'drink',
        note: 'preferire برای بیان ترجیح.' },
      { it: '{S} {V} {O} al mercato.', fa: '{S_FA} {O_FA} از بازار {V_FA}.',
        v: 'comprare', o: 'food',
        note: 'al = a + il. al mercato یعنی «از/در بازار».' },
      { it: 'Quanto costa {O}?', fa: '{O_FA} چقدر است?', cost: 'food',
        note: 'Quanto costa…? برای پرسیدن قیمت یک چیز.' }
    ],
    9: [
      { it: '{S} {V} {O} {TIME}.', fa: '{S_FA} {TIME_FA} {O_FA} {V_FA}.',
        v: 'leggere', o: 'reading', t: 'time',
        note: 'برای عادت‌های روزانه از حال ساده استفاده می‌شود.' },
      { it: '{TIME}, {S} {V} {O}.', fa: '{S_FA} {TIME_FA} {O_FA} {V_FA}.',
        v: 'bere', o: 'drink', t: 'time',
        note: 'قید زمان می‌تواند اول جمله بیاید.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'aprire', o: 'thing',
        note: 'aprire از گروه ire- است: apro, apri, apre.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'scrivere', o: 'reading',
        note: 'scrivere: scrivo, scrivi, scrive, scriviamo, scrivete, scrivono.' },
      { it: '{S} {V} in {VENUE} {TIME}.', fa: '{S_FA} {TIME_FA} در {VENUE_FA} {V_FA}.',
        v: 'lavorare', o: 'venue', t: 'time',
        note: 'کار روزانه: lavorare in + مکان.' },
      { it: '{S} {V} {O}.', fa: '{S_FA} {O_FA} {V_FA}.', v: 'studiare', o: 'study',
        note: 'studiare + موضوع درسی.' }
    ],
    10: [
      { it: '{FAM} {VF} {O}.', fa: '{FAM_FA} {O_FA} {VF_FA}.', fam: true, v: 'guardare', o: 'watch',
        note: 'فعل با شخصِ عضو خانواده مطابقت می‌کند: mio fratello guarda، i miei genitori guardano.' },
      { it: '{FAM} {VF} {O}.', fa: '{FAM_FA} {O_FA} {VF_FA}.', fam: true, v: 'leggere', o: 'reading',
        note: 'صفت ملکی با جنسِ عضو خانواده می‌آید: mio fratello، mia sorella.' },
      { it: '{FAM} {VF} {O}.', fa: '{FAM_FA} {O_FA} {VF_FA}.', fam: true, v: 'cucinare', o: 'food',
        note: 'برای جمع از i miei / le mie استفاده می‌شود.' },
      { it: '{FAM} {VF} in {VENUE}.', fa: '{FAM_FA} در {VENUE_FA} {VF_FA}.', fam: true, v: 'lavorare', o: 'venue',
        note: 'lavorare in + مکان کار.' },
      { it: '{FAM} {VF} a {CITY}.', fa: '{FAM_FA} در {CITY_FA} {VF_FA}.', fam: true, v: 'abitare', o: 'city',
        note: 'abitare a + شهر.' },
      { it: '{FAM} {VF} {LANG}.', fa: '{FAM_FA} به {LANG_FA} {VF_FA}.', fam: true, v: 'parlare', o: 'language',
        note: 'نام زبان بعد از parlare بدون حرف تعریف می‌آید.' },
      { it: '{FAM} {VF} {O}.', fa: '{FAM_FA} {O_FA} {VF_FA}.', fam: true, v: 'preferire', o: 'drink',
        note: 'preferisco / preferisce / preferiscono.' },
      { it: '{FAM} {FESS} {FA}.', fa: '{FAM_FA} {FA_FA} {FESS_FA}.', fam: true, famadj: true,
        note: 'صفت با جنس و شمارِ عضو خانواده مطابقت می‌کند: mio padre è stanco، le mie sorelle sono stanche.' },
      { it: '{FAM} {VF} {O} {TIME}.', fa: '{FAM_FA} {TIME_FA} {O_FA} {VF_FA}.',
        fam: true, v: 'guardare', o: 'watch', t: 'time',
        note: 'قید زمان آخر جمله می‌آید.' },
      { it: 'In famiglia ci piace {ACT}.', fa: 'در خانواده {ACT_FA} را دوست داریم.', familylike: 'activity',
        note: 'ci piace + مصدر یعنی «ما دوست داریم».' },
    ]
  },

  nazionalita: [
    { it: 'italiano',  fa: 'ایتالیایی', forms: ['italiano','italiana','italiani','italiane'] },
    { it: 'iraniano',  fa: 'ایرانی',    forms: ['iraniano','iraniana','iraniani','iraniane'] },
    { it: 'tedesco',   fa: 'آلمانی',    forms: ['tedesco','tedesca','tedeschi','tedesche'] },
    { it: 'francese',  fa: 'فرانسوی',   forms: ['francese','francese','francesi','francesi'] },
    { it: 'spagnolo',  fa: 'اسپانیایی', forms: ['spagnolo','spagnola','spagnoli','spagnole'] },
    { it: 'inglese',   fa: 'انگلیسی',   forms: ['inglese','inglese','inglesi','inglesi'] }
  ],

  avere: {
    it: ['ho','hai','ha','abbiamo','avete','hanno'],
    fa: ['دارم','داری','دارد','داریم','دارید','دارند']
  },
  andare: {
    it: ['vado','vai','va','andiamo','andate','vanno'],
    fa: ['می‌روم','می‌روی','می‌رود','می‌رویم','می‌روید','می‌روند']
  }
};
