/* ============================================================
   Espresso A1 — اپ همراه ایتالیایی A1 (فارسی)
   محتوا هم‌راستا با سرفصل‌های Nuovo Espresso 1؛ مکالمات تألیفی.
   ============================================================ */
(function(){
'use strict';

/* ---------- helpers ---------- */
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=n=>String(n).replace(/[0-9]/g,d=>'۰۱۲۳۴۵۶۷۸۹'[+d]);
const norm=s=>String(s||'').toLowerCase().replace(/[àáâä]/g,'a').replace(/[èéêë]/g,'e').replace(/[ìíîï]/g,'i').replace(/[òóôö]/g,'o').replace(/[ùúûü]/g,'u').replace(/[’'`]/g,"'").replace(/[.,!?;:«»"()\-–—]/g,' ').replace(/\s+/g,' ').trim();
const isFa=s=>/[\u0600-\u06FF]/.test(String(s||''));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const DAY=864e5;
const L=window.ESPRESSO.lessons, R=window.ESPRESSO.reviews, V=window.ESPRESSO.verbs;
L.sort((a,b)=>a.id-b.id);
const lesson=id=>L.find(x=>x.id===+id);
const review=id=>R.find(x=>x.id===id);

/* ---------- storage ---------- */
const KEY='espressoA1.v1';
const APP_VER='1.0.0';
const VER_FA=APP_VER.split('.').slice(0,2).map(n=>fa(n)).join('٫');
const DEF={srs:{},fav:[],seen:{},scores:{},settings:{review:{mode:'due',order:'smart',dir:'it',auto:false},theme:'dark',fs:16,tr:true,rev:false,limit:20,rate:0.9,voice:'',motion:'on',haptics:'on',engine:'auto',nvoice:''},streak:{last:'',n:0},last:null,day:'',v:2,done:{}};
let DB;
try{DB=Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){DB=JSON.parse(JSON.stringify(DEF));}
DB.settings=Object.assign({},DEF.settings,DB.settings||{});
DB.streak=Object.assign({},DEF.streak,DB.streak||{});
DB.done=DB.done||{};
DB.settings.review=Object.assign({mode:'due',order:'smart',dir:'it',auto:false},DB.settings.review||{});
/* One-time migration: v2 shipped light/auto as the default. Move existing
   installs to dark once, then never touch the user's own choice again. */
if((DB.v||1)<2){DB.settings.theme='dark';DB.v=2;try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){}}
function touchDay(){
  const t=new Date().toISOString().slice(0,10);
  if(DB.streak.last===t)return;
  const y=new Date(Date.now()-DAY).toISOString().slice(0,10);
  DB.streak.n=(DB.streak.last===y)?(DB.streak.n||0)+1:1;
  DB.streak.last=t; save();
}

/* ---------- all words ---------- */
const WORDS=[];
L.forEach(l=>l.vocab.forEach((g,gi)=>g.items.forEach(it=>{
  WORDS.push({k:'L'+l.id+'.'+gi+':'+it.w,l:l.id,g:g.gfa,w:it.w,fa:it.fa,t:it.t||'',ex:it.ex||'',exfa:it.exfa||''});
})));
const wByKey=k=>WORDS.find(w=>w.k===k);
const INTERVAL=[0,1,2,4,8,16,32];
function due(){const now=Date.now();return WORDS.filter(w=>DB.srs[w.k]&&DB.srs[w.k].d<=now);}
function learned(){return WORDS.filter(w=>DB.done&&DB.done[w.k]).length;}
function isDone(k){return !!(DB.done&&DB.done[k]);}
function toggleDone(k){
  DB.done=DB.done||{};
  if(DB.done[k])delete DB.done[k];
  else{DB.done[k]=Date.now();
    /* ticking a word also seeds its SRS card so it enters the review cycle */
    if(!DB.srs[k])DB.srs[k]={b:2,d:Date.now()+INTERVAL[2]*DAY,r:1};}
  touchDay();save();
}
function doneBtn(k){
  const on=isDone(k);
  return `<button class="mini tick ${on?'on':''}" data-act="tick" data-k="${esc(k)}" aria-pressed="${on}" aria-label="${on?'برداشتن تیک یادگیری':'تیک یادگیری'}" title="یاد گرفتم">${I('check',{size:17,sw:2.4})}</button>`;
}
function grade(k,g){
  const e=DB.srs[k]||{b:0,d:0,r:0};
  e.r=(e.r||0)+1;
  if(g===0){e.b=0;e.d=Date.now()+6e5;}
  else if(g===1){e.b=Math.max(1,e.b);e.d=Date.now()+Math.max(6e5,INTERVAL[e.b]*DAY/2);}
  else{e.b=Math.min(5,(e.b||0)+1);e.d=Date.now()+INTERVAL[e.b]*DAY;}
  DB.srs[k]=e;touchDay();save();
}
function lessonProgress(l){
  const ws=WORDS.filter(w=>w.l===l.id);
  const lrn=ws.filter(w=>DB.srs[w.k]&&DB.srs[w.k].b>=2).length;
  const dl=l.dialogs.filter(d=>DB.seen[d.id]).length;
  const q=DB.scores['L'+l.id]||0;
  const p=(ws.length?lrn/ws.length:0)*0.5+(l.dialogs.length?dl/l.dialogs.length:0)*0.25+(q/100)*0.25;
  return Math.round(p*100);
}
function overall(){return Math.round(L.reduce((a,l)=>a+lessonProgress(l),0)/L.length);}

/* ---------- speech ---------- */
const TTS={
  ok:(typeof speechSynthesis!=='undefined'),voice:null,voices:[],token:0,warned:false,
  init(){
    if(!this.ok)return;
    const load=()=>{
      this.voices=speechSynthesis.getVoices().filter(v=>/^it/i.test(v.lang));
      const want=DB.settings.voice;
      this.voice=this.voices.find(v=>v.name===want)||this.voices.find(v=>/it[-_]IT/i.test(v.lang))||this.voices[0]||null;
      if($('#voiceSel'))renderVoiceOptions();
    };
    load();
    speechSynthesis.onvoiceschanged=load;
  },
  say(text,opt){
    opt=opt||{};
    const rate=opt.rate||DB.settings.rate||0.9;
    /* Inside the Android app the device engine (Google TTS) is the best
       voice available, so it wins unless the user forced the pack. */
    if(this.useNative()&&window.NativeTTS.speak(text,{rate,onfail:()=>this.sayDevice(text,opt)})){
      $('#stopAudio').hidden=false;return;
    }
    this.sayDevice(text,opt);
  },
  useNative(){
    const e=DB.settings.engine;
    return !!(window.NativeTTS&&window.NativeTTS.available);
  },
  sayDevice(text,opt){
    opt=opt||{};
    if(!this.ok){
      if(window.NativeTTS&&window.NativeTTS.present)toast('موتور گفتار در دسترس نیست. در تنظیمات، صدای ایتالیایی را دانلود کن.');
      else toast('صدای ایتالیایی در این مرورگر در دسترس نیست.');
      return;
    }
    this.stop(true);
    const u=new SpeechSynthesisUtterance(text);
    u.lang='it-IT'; if(this.voice)u.voice=this.voice;
    u.rate=opt.rate||DB.settings.rate||0.9; u.pitch=1;
    const my=++this.token;
    u.onstart=()=>{if(my===this.token)$('#stopAudio').hidden=false;};
    u.onend=u.onerror=()=>{if(my===this.token){$('#stopAudio').hidden=true;} if(opt.onend&&my===this.token)opt.onend();};
    try{speechSynthesis.speak(u);}catch(e){}
    if(!this.voice&&!this.warned){this.warned=true;setTimeout(()=>{if(!speechSynthesis.speaking)toast('صدای ایتالیایی روی دستگاه پیدا نشد؛ از تنظیمات، صدای it-IT را نصب/انتخاب کن.');},900);}
  },
  seq(items,onStep,done,rate){
    let i=0;const my=++this.token;
    const next=()=>{
      if(my!==this.token)return;
      if(i>=items.length){$('#stopAudio').hidden=true;$$('.line.playing').forEach(e=>e.classList.remove('playing'));if(done)done();return;}
      const cur=i++;onStep&&onStep(cur);
      const r=rate||DB.settings.rate||0.9;
      if(my!==this.token)return;
      if(this.useNative()&&window.NativeTTS.speak(items[cur],{rate:r,
        onend:()=>{if(my===this.token)setTimeout(next,260);},
        onfail:()=>{if(my===this.token)speakOne();}}))return;
      speakOne();
    };
    const speakOne=()=>{
      if(!this.ok){if(my===this.token)setTimeout(next,120);return;}
      const u=new SpeechSynthesisUtterance(items[i-1]);
      u.lang='it-IT';if(this.voice)u.voice=this.voice;u.rate=rate||DB.settings.rate||0.9;
      u.onend=()=>{if(my===this.token)setTimeout(next,260);};
      u.onerror=()=>{if(my===this.token)next();};
      try{speechSynthesis.speak(u);}catch(e){next();}
    };
    try{speechSynthesis.cancel();}catch(e){}
    $('#stopAudio').hidden=false;next();
  },
  stop(silent){this.token++;try{if(this.ok)speechSynthesis.cancel();}catch(e){}
    if(window.NativeTTS)window.NativeTTS.stop();
    $('#stopAudio').hidden=true;$$('.line.playing').forEach(e=>e.classList.remove('playing'));}
};
function renderVoiceOptions(){
  const s=$('#voiceSel');if(!s)return;
  s.innerHTML='<option value="">خودکار</option>'+TTS.voices.map(v=>`<option value="${esc(v.name)}"${v.name===DB.settings.voice?' selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('');
}

/* ---------- toast ---------- */
let tT;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),2600);}

/* ---------- icons ---------- */
const I=(n,o)=>window.UI.ico(n,o);
const spk=(text,cls)=>`<button class="mini ${cls||''}" data-act="say" data-say="${esc(text)}" aria-label="شنیدن تلفظ">${I('volume',{size:18})}</button>`;
const starBtn=k=>{const on=DB.fav.indexOf(k)>=0;return `<button class="mini ${on?'on':''}" data-act="fav" data-k="${esc(k)}" aria-label="${on?'حذف از نشان‌شده‌ها':'افزودن به نشان‌شده‌ها'}" aria-pressed="${on}">${I('star',{size:18,fill:on})}</button>`;};

/* ---------- views ---------- */
const app=$('#app');
function topbar(title,sub,back){
  return `<header class="topbar">${back?`<button class="iconbtn" data-go="${back}" aria-label="بازگشت">${I('right')}</button>`:''}
  <h1>${esc(title)}${sub?`<span class="sub">${esc(sub)}</span>`:''}</h1>
  <button class="iconbtn" data-act="theme" aria-label="تغییر حالت روشن/تاریک">${I(isDark()?'sun':'moon',{size:20})}</button></header>`;
}
function setTab(hash){
  let key='#/home';
  if(/^#\/(lessons|lesson|test|quiz|quick|verbs)/.test(hash))key='#/lessons';
  else if(/^#\/search/.test(hash))key='#/search';
  else if(/^#\/settings/.test(hash))key='#/settings';
  else if(/^#\/(review|fc)/.test(hash))key='#/review';
  window.UI.setActive(key);
  window.UI.badge(due().length);
}
function isDark(){return document.documentElement.dataset.theme==='dark';}

/* Why is no ad on screen? Say it plainly instead of leaving the user guessing. */
function adWhy(g){
  if(!g.bridge)return 'این نسخه وب است؛ تبلیغ فقط در اپ اندروید کار می‌کند.';
  if(!g.hasKey)return 'کلید تپسل تنظیم نشده است.';
  if(!g.sdk)return 'کتابخانهٔ تپسل در این بیلد نیست — با «npm run apk» دوباره بساز.';
  if(!g.ready)return 'کتابخانه هنوز آماده نشده؛ چند لحظه صبر کن.';
  if(g.why==='adFree')return 'تبلیغ خاموش است چون جایزهٔ بدون‌تبلیغ فعال است.';
  if(g.why==='grace')return 'تا '+fa(g.graceLeft)+' ثانیهٔ دیگر تبلیغی نشان داده نمی‌شود (دورهٔ آشنایی).';
  if(g.why==='allOff')return 'هر سه نوع تبلیغ را خاموش کرده‌ای.';
  return 'متصل به '+g.provider+' — اگر جای خالی ماند، تپسل برای این ناحیه تبلیغ نفرستاده است.';
}
/* HOME */
function vHome(){
  const p=overall(),d=due().length,ln=learned();
  const last=DB.last?lesson(DB.last):null;
  const cont=last||L[0];
  return topbar('اسپرسو A1','ایتالیایی درس‌به‌درس، با ترجمهٔ فارسی')+`
  ${window.Community?window.Community.inviteCard():''}
  <section class="hero" data-tilt="5">
    <div class="hero-clip" aria-hidden="true">
      <div class="flag"><i></i><i></i><i></i></div>
      <div class="cup">${I('coffee',{size:150,sw:1.1})}</div>
    </div>
    <span class="eyebrow lift-sm">${I('cap',{size:14})} LIVELLO A1</span>
    <h2 class="lift">${last?'ادامهٔ یادگیری':'از درس اول شروع کن'}</h2>
    <p>${last?`درس ${fa(cont.id)} — ${cont.fa}`:'۱۰ درس، بیش از '+fa(WORDS.length)+' واژه و اصطلاح، مکالمه، گرامر و آزمون'}</p>
    <button class="btn lift-sm" data-go="#/lesson/${cont.id}/dialogs">${I('play',{size:16})} ${last?'ادامه بده':'شروع درس ۱'}</button>
  </section>
  <div class="stats">
    <div class="stat" data-reveal>${I('flame',{size:20})}<b>${fa(DB.streak.n||0)}</b><span>روز پیوسته</span></div>
    <div class="stat" data-reveal>${I('cap',{size:20})}<b>${fa(ln)}</b><span>واژهٔ یادگرفته</span></div>
    <div class="stat" data-reveal>${I('layers',{size:20})}<b>${fa(d)}</b><span>کارت امروز</span></div>
  </div>
  <div class="card row" style="gap:16px" data-reveal>
    <div class="ring" style="--p:${p}" role="img" aria-label="پیشرفت کل: ${fa(p)} درصد"><b>${fa(p)}٪</b></div>
    <div class="grow">
      <b style="font-size:.95rem">پیشرفت کل کتاب</b>
      <div class="muted">از ${fa(L.length)} درس و ${fa(WORDS.length)} واژه</div>
      <div class="lbar" style="margin-top:8px"><i style="--p:${p/100}"></i></div>
    </div>
  </div>
  <h2 class="sec-title">میان‌بُرها</h2>
  <div class="grid2">
    <button class="btn ${d?'green':'ghost'} block" data-go="#/review">${I('layers',{size:18})} مرور امروز ${d?'('+fa(d)+')':''}</button>
    <button class="btn ghost block" data-act="quiz" data-q="quick">${I('zap',{size:18})} آزمون سریع</button>
    <button class="btn ghost block" data-go="#/verbs">${I('lang',{size:18})} جدول فعل‌ها</button>
    <button class="btn ghost block" data-go="#/search">${I('search',{size:18})} جست‌وجوی واژه</button>
  </div>
  <h2 class="sec-title">درس‌ها</h2>
  ${L.slice(0,3).map(l=>lessonRow(l)).join('')}
  <button class="btn ghost block" data-go="#/lessons">${I('grid',{size:18})} همهٔ ${fa(L.length)} درس و ${fa(R.length)} آزمون مرور</button>
  <div class="card about" style="margin-top:16px" data-reveal>
    <b>دربارهٔ محتوا</b><br>
    ترتیب درس‌ها، سرفصل‌های گرامری و مجموعهٔ واژگان و اصطلاحات هر درس با کتاب <span class="it">Nuovo Espresso 1 (A1)</span> هم‌راستاست تا بتوانی همراه کتاب پیش بروی.
    مکالمه‌ها، مثال‌ها و توضیح‌های فارسی <b>تألیفی</b> هستند و بازنشر متن کتاب نیستند.
  </div>`;
}
function lessonRow(l){
  const p=lessonProgress(l),w=WORDS.filter(x=>x.l===l.id).length;
  return `<button class="litem" data-go="#/lesson/${l.id}/dialogs" data-reveal>
    <div class="lnum">${fa(l.id)}</div>
    <div class="meta"><b>${esc(l.fa)}</b><span class="it">${esc(l.title)}</span>
      <span class="tags">${fa(w)} واژه · ${fa(l.dialogs.length)} مکالمه · ${fa(l.quiz.length)} تمرین</span>
      <div class="lbar"><i style="--p:${p/100}"></i></div></div>
    <span class="chip ${p>=80?'g':''}">${fa(p)}٪</span>${I('left',{size:18,cls:'chev'})}</button>`;
}
function vLessons(){
  let h=topbar('فهرست درس‌ها','به ترتیب کتاب');
  h+=`<div class="card tight small muted">هر درس: مکالمه ← واژگان ← اصطلاحات ← گرامر ← آزمون ← فرهنگ. بعد از درس‌های ۲، ۵، ۷ و ۱۰ یک آزمون جمع‌بندی هست.</div>`;
  L.forEach((l,li)=>{
    h+=lessonRow(l);
    if(window.Ads&&(li+1)%6===0)h+=window.Ads.nativeSlot('lessons-'+(li+1));
    const r=R.find(x=>x.after===l.id);
    if(r){
      const s=DB.scores[r.id]||0;
      h+=`<button class="litem rev" data-go="#/test/${r.id}" data-reveal>
        <div class="lnum">${I('check',{size:22,sw:2.4})}</div>
        <div class="meta"><b>${esc(r.fa)}</b><span class="it">${esc(r.title)}</span>
        <span class="tags">${esc(r.desc)}</span></div>
        <span class="chip ${s>=70?'g':'y'}">${s?fa(s)+'٪':'شروع'}</span>${I('left',{size:18,cls:'chev'})}</button>`;
    }
  });
  return h;
}

/* LESSON */
const TABS=[['dialogs','chat','مکالمه'],['vocab','book','واژگان'],['spell','keyboard','املا'],['phrases','chat','اصطلاحات'],['grammar','grammar','گرامر'],['cards','layers','فلش‌کارت'],['build','wand','جمله‌سازی'],['quiz','quiz','آزمون'],['culture','coffee','فرهنگ']];
function vLesson(id,tab){
  const l=lesson(id);if(!l)return vHome();
  DB.last=l.id;save();
  tab=tab||'dialogs';
  const w=WORDS.filter(x=>x.l===l.id).length;
  let h=`<header class="topbar"><button class="iconbtn" data-go="#/lessons" aria-label="بازگشت">${I('right')}</button>
    <h1>درس ${fa(l.id)}<span class="sub">${esc(l.fa)}</span></h1>
    <button class="iconbtn" data-act="theme" aria-label="تغییر حالت روشن/تاریک">${I(isDark()?'sun':'moon',{size:20})}</button></header>
  <section class="lhead" data-tilt="4">
    <div class="n">LEZIONE ${l.id} · pagina ${l.page}</div>
    <h2 class="lift-sm">${esc(l.fa)}</h2><div class="it">${esc(l.title)}</div>
    <div class="row"><span class="chip">${fa(w)} واژه</span><span class="chip">${fa(l.dialogs.length)} مکالمه</span><span class="chip">${fa(l.quiz.length)} تمرین</span></div>
  </section>
  <nav class="tabs" aria-label="بخش‌های درس">${TABS.map(t=>`<button data-go="#/lesson/${l.id}/${t[0]}" class="${t[0]===tab?'on':''}"${t[0]===tab?' aria-current="true"':''}>${I(t[1],{size:16})} ${t[2]}</button>`).join('')}</nav>`;
  if(tab==='dialogs')h+=tabDialogs(l);
  if(tab==='vocab')h+=tabVocab(l);
  if(tab==='phrases')h+=tabPhrases(l);
  if(tab==='grammar')h+=tabGrammar(l);
  if(tab==='cards')h+=tabCards(l);
  if(tab==='build')h+=tabBuild(l);
  if(tab==='spell')h+=tabSpell(l);
  if(tab==='quiz')h+=tabQuiz(l);
  if(tab==='culture')h+=tabCulture(l);
  const nx=L.find(x=>x.id===l.id+1);
  h+=`<div class="divider"></div><div class="row">
    ${nx?`<button class="btn grow" data-go="#/lesson/${nx.id}/dialogs">درس بعد: ${esc(nx.fa)} ${I('arrowleft',{size:17})}</button>`:`<button class="btn grow" data-go="#/test/r4">آزمون پایانی ${I('arrowleft',{size:17})}</button>`}
    <button class="btn ghost" data-go="#/review/L${l.id}">${I('layers',{size:17})} فلش‌کارت</button></div>`;
  return h;
}
function tabDialogs(l){
  let h=`<div class="card tight row"><span class="grow small muted">روی هر جمله بزن تا تلفظش را بشنوی. «پخش کل» جمله‌به‌جمله می‌خواند.</span></div>`;
  l.dialogs.forEach(d=>{
    h+=`<div class="dlg" id="dlg-${d.id}">
      <div class="dlg-h"><b>${esc(d.tfa)}</b><span class="it">${esc(d.t)}</span><span class="set">${esc(d.set)}</span></div>
      <div class="dlg-ctrl">
        <button class="btn sm" data-act="play" data-d="${d.id}">${I('play',{size:15})} پخش کل</button>
        <button class="btn sm ghost" data-act="tr" data-d="${d.id}" aria-pressed="true">${I('eye',{size:15})} ترجمه</button>
        <button class="btn sm ghost" data-act="slow" data-d="${d.id}">${I('gauge',{size:15})} آرام</button>
        <span class="chip">${fa(d.lines.length)} جمله</span>
      </div>
      <div class="dlg-body ${DB.settings.tr?'':'hide-tr'}">
      ${d.lines.map((ln,i)=>`<button type="button" class="line" data-s="${esc(ln[0])}" data-act="sayline" data-d="${d.id}" data-i="${i}" aria-label="پخش جمله: ${esc(ln[1])}">
        <span class="av">${esc(ln[0])}</span>
        <span class="txt"><span class="it">${esc(ln[1])}</span><span class="tr">${esc(ln[2])}</span></span>
        <span class="sp" aria-hidden="true">${I('volume',{size:17})}</span></button>`).join('')}
      </div></div>`;
  });
  h+=`<div class="note"><b>نکته:</b> برای دیدن ترجمهٔ جمله‌به‌جمله، اگر ترجمه‌ها پنهان است روی «ترجمه» بزن. برای تمرین گفتار، هر جمله را پخش کن و بلافاصله بلند تکرار کن (سایه‌خوانی).</div>`;
  return h;
}
function tabVocab(l){
  let vi=0;
  let h=`<div class="card tight row">
    <button class="btn sm ghost" data-act="mask">${I('eyeoff',{size:15})} حالت تمرین</button>
    <button class="btn sm" data-go="#/lesson/${l.id}/spell">${I('keyboard',{size:15})} املای این درس</button>
    <button class="btn sm" data-go="#/review/L${l.id}">${I('layers',{size:15})} فلش‌کارت</button>
    <span class="chip">${fa(WORDS.filter(x=>x.l===l.id).length)} مورد</span></div>
  <div class="card tight small muted swipe-hint">${I('arrowleft',{size:14})} هر واژه را <b>به چپ بکش</b> تا همان‌جا املایش را تمرین کنی.</div>
    <div id="vwrap">`;
  l.vocab.forEach((g,gi)=>{
    h+=`<div class="vgroup"><h3>${esc(g.gfa)} <span class="it">${esc(g.g)}</span></h3>`;
    g.items.forEach(it=>{
      const k='L'+l.id+'.'+gi+':'+it.w;
      const canSpell=window.Spelling&&window.Spelling.spellable(it.w);
      h+=`<div class="vrow ${isDone(k)?'is-done':''}${canSpell?' swipeable':''}" data-act="reveal"${canSpell?` data-sw="1" data-k="${esc(k)}" data-w="${esc(it.w)}" data-fa="${esc(it.fa)}"`:''}>
        <div class="main" role="button" tabindex="0" data-act="revealrow" aria-label="نمایش یا پنهان کردن معنی ${esc(it.w)}">
          <div class="w it">${esc(it.w)} ${it.t?`<span class="vtype">${esc(it.t)}</span>`:''}</div>
          <div class="m">${esc(it.fa)}</div>
          ${it.ex?`<div class="ex"><span class="it">${esc(it.ex)}</span><br>${esc(it.exfa||'')}</div>`:''}
        </div>
        <div class="acts">${spk(it.w)}${starBtn(k)}${doneBtn(k)}</div></div>`;
      vi++;
      if(window.Ads&&vi%12===0)h+=window.Ads.nativeSlot('vocab-'+l.id+'-'+vi);
    });
    h+='</div>';
  });
  return h+'</div>';
}
function tabPhrases(l){
  let h=`<div class="card tight small muted">اصطلاح‌های آمادهٔ این درس؛ برای حفظ کردن، دکمهٔ ستاره را بزن تا در فلش‌کارت‌های «نشان‌شده» بیاید.</div>`;
  l.phrases.forEach(p=>{
    const k='P'+l.id+':'+p.w;
    h+=`<div class="prow"><div class="main"><div class="it">${esc(p.w)}</div><div class="m">${esc(p.fa)}</div></div>
      <div class="acts">${spk(p.w)}${starBtn(k)}</div></div>`;
  });
  return h;
}
function tabGrammar(l){
  let h=`<div class="card tight small muted">هدف‌های این درس: ${l.goals.gram.map(g=>esc(g)).join(' · ')}</div>`;
  l.grammar.forEach((g,gi)=>{
    h+=`<div class="gsec"><h3>${esc(g.tfa)} <span class="it">${esc(g.t)}</span></h3>${g.html||''}`;
    if(g.table){
      h+=`<div class="scrollx"><table class="gt"><thead><tr>${g.table.head.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${g.table.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if(g.alphabet)h+=alphabetGrid();
    (g.egs||[]).forEach(e=>{h+=`<div class="eg row"><div class="grow"><div class="it">${esc(e[0])}</div><div class="tr">${esc(e[1])}</div></div>${spk(e[0])}</div>`;});
    if(g.note)h+=`<div class="note"><b>توجه:</b> ${g.note}</div>`;
    h+='</div>';
  });
  return h;
}
const ALPHA=[['A a','a'],['B b','bi'],['C c','ci'],['D d','di'],['E e','e'],['F f','effe'],['G g','gi'],['H h','acca'],['I i','i'],['L l','elle'],['M m','emme'],['N n','enne'],['O o','o'],['P p','pi'],['Q q','cu'],['R r','erre'],['S s','esse'],['T t','ti'],['U u','u'],['V v','vu'],['Z z','zeta'],['J j','i lunga'],['K k','cappa'],['W w','doppia vu'],['X x','ics'],['Y y','ipsilon']];
function alphabetGrid(){
  return `<div class="alphabet">${ALPHA.map(a=>`<button data-act="say" data-say="${esc(a[1])}"><b>${esc(a[0])}</b><span>${esc(a[1])}</span></button>`).join('')}</div>`;
}
function tabQuiz(l){
  const s=DB.scores['L'+l.id];
  return `<div class="card center">
    <div class="result-badge">${I('quiz',{size:34})}</div>
    <b>آزمون درس ${fa(l.id)}</b>
    <p class="muted">${fa(l.quiz.length)} پرسش: چهارگزینه‌ای، جای خالی، مرتب‌سازی و جورکردنی.</p>
    ${s!=null?`<div class="chip g">بهترین نتیجه: ${fa(s)}٪</div>`:''}
    <div style="margin-top:12px"><button class="btn block" data-act="quiz" data-q="L${l.id}">شروع آزمون</button></div>
  </div>
  <div class="card"><b class="small">هدف‌های ارتباطی این درس</b><ul class="small muted" style="padding-inline-start:18px;margin:8px 0">${l.goals.com.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
}
function tabCulture(l){
  const c=l.culture;
  return `<div class="gsec"><h3>${esc(c.fa)}</h3><div class="it small muted" style="margin-bottom:8px">${esc(c.t)}</div>${c.html}</div>
  <div class="note">این متن، توضیح فرهنگی تألیفی و هم‌موضوع با بخش <span class="it">Caffè culturale</span> کتاب است.</div>`;
}

/* TEST (reviews) */
function vTest(id){
  const r=review(id);if(!r)return vLessons();
  const s=DB.scores[r.id];
  return topbar(r.fa,r.title,'#/lessons')+`
  <div class="card center"><div class="result-badge">${I('target',{size:34})}</div><b>${esc(r.title)}</b>
  <p class="muted">${esc(r.desc)}</p>
  ${s!=null?`<div class="chip g">بهترین نتیجه: ${fa(s)}٪</div>`:''}
  <div style="margin-top:12px"><button class="btn block" data-act="quiz" data-q="${r.id}">شروع آزمون (${fa(r.quiz.length)} پرسش)</button></div></div>
  <div class="card small muted">پیشنهاد: اگر نتیجه کمتر از ۷۰٪ شد، اول واژگان و گرامر همان درس‌ها را مرور کن و بعد دوباره آزمون بده.</div>`;
}

/* FLASHCARDS */
let FC=null;
function hashStr(s){let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0;}return Math.abs(h);}
function uniq(a){const seen={},out=[];a.forEach(w=>{const k=w.w+'|'+w.fa;if(!seen[k]){seen[k]=1;out.push(w);}});return out;}
function deckWords(sel){return uniq(deckRaw(sel));}
function deckRaw(sel){
  if(!sel||sel==='all')return WORDS.slice();
  if(sel==='fav')return WORDS.filter(w=>DB.fav.indexOf(w.k)>=0);
  if(sel==='weak')return WORDS.filter(w=>DB.srs[w.k]&&DB.srs[w.k].b<=1);
  if(/^L\d+$/.test(sel))return WORDS.filter(w=>'L'+w.l===sel);
  return WORDS.slice();
}
function advancedQueue(sel){
  const r=DB.settings.review,now=Date.now(),lim=DB.settings.limit||20;
  let pool=deckWords(sel);
  if(r.mode==='due')pool=pool.filter(w=>DB.srs[w.k]&&DB.srs[w.k].d<=now);
  else if(r.mode==='todo')pool=pool.filter(w=>!isDone(w.k));
  else if(r.mode==='weak')pool=pool.filter(w=>DB.srs[w.k]&&(DB.srs[w.k].b||0)<=1);
  if(!pool.length)pool=deckWords(sel);
  if(r.order==='shuffle')pool=shuffle(pool);
  else if(r.order==='seq')pool=pool.slice();
  else{
    const d=shuffle(pool.filter(w=>DB.srs[w.k]&&DB.srs[w.k].d<=now));
    const n=shuffle(pool.filter(w=>!DB.srs[w.k]));
    const rest=shuffle(pool.filter(w=>DB.srs[w.k]&&DB.srs[w.k].d>now));
    pool=d.concat(n).concat(rest);
  }
  return pool.slice(0,Math.max(lim,pool.length>lim?lim:pool.length));
}
function buildQueue(sel){
  const all=deckWords(sel),now=Date.now(),lim=DB.settings.limit||20;
  const d=shuffle(all.filter(w=>DB.srs[w.k]&&DB.srs[w.k].d<=now));
  const n=shuffle(all.filter(w=>!DB.srs[w.k]));
  const later=shuffle(all.filter(w=>DB.srs[w.k]&&DB.srs[w.k].d>now));
  return d.concat(n).concat(later).slice(0,Math.max(lim,d.length));
}
function vReview(sel){
  const name=sel&&/^L\d+$/.test(sel)?('درس '+fa(sel.slice(1))):sel==='fav'?'نشان‌شده‌ها':sel==='weak'?'ضعیف‌ها':'همهٔ درس‌ها';
  const d=due().length;
  let h=topbar('مرور با فلش‌کارت','تکرار فاصله‌دار (لایتنر)');
  h+=`<div class="filters">
    ${[['all','همه','grid'],['fav','نشان‌شده','star'],['weak','ضعیف‌ها','target']].map(x=>`<button data-go="#/review/${x[0]}" class="${(sel||'all')===x[0]?'on':''}">${I(x[2],{size:14})} ${x[1]}</button>`).join('')}
    ${L.map(l=>`<button data-go="#/review/L${l.id}" class="${sel==='L'+l.id?'on':''}">درس ${fa(l.id)}</button>`).join('')}
  </div>
  <div class="card center">
    <b>${esc(name)}</b>
    <p class="muted">${fa(deckWords(sel).length)} کارت در این مجموعه · ${fa(d)} کارت موعددار در کل کتاب</p>
    <button class="btn block" data-act="fcstart" data-deck="${esc(sel||'all')}">${I('play',{size:17})} شروع مرور</button>
    <div class="row" style="margin-top:10px;justify-content:center">
      <span class="chip">یادگرفته: ${fa(learned())}</span>
      <span class="chip">دیده‌شده: ${fa(Object.keys(DB.srs).length)}</span>
    </div>
  </div>
  ${advancedReviewPanel(sel)}
  <div class="card small muted"><b>روش کار:</b> واژه را ببین و معنی‌اش را در ذهن بگو، بعد کارت را برگردان. «بلدم» کارت را به جعبهٔ بعد می‌برد (۱، ۲، ۴، ۸، ۱۶ و ۳۲ روز بعد)، «سخت» همان‌جا نگه می‌دارد و «نمی‌دانم» به جعبهٔ اول برمی‌گرداند.</div>`;
  return h;
}

/* ---------- advanced review ---------- */
function advancedReviewPanel(sel){
  const r=DB.settings.review;
  const all=deckWords(sel);
  const now=Date.now();
  const boxes=[0,0,0,0,0,0];
  all.forEach(w=>{const e=DB.srs[w.k];boxes[e?Math.min(5,e.b||0):0]++;});
  const done=all.filter(w=>isDone(w.k)).length;
  const opt=(g,v,label,cur)=>`<button data-act="rvset" data-g="${g}" data-v="${v}" class="${cur===v?'on':''}" aria-pressed="${cur===v}">${label}</button>`;
  return `<h2 class="sec-title">مرور پیشرفته</h2>
  <div class="card">
    <div class="sb-meters">
      ${boxes.map((n,i)=>`<div class="meter"><b>${fa(n)}</b><span>جعبهٔ ${fa(i)}</span><i style="--h:${Math.round(n/Math.max(all.length,1)*100)}%"></i></div>`).join('')}
    </div>
    <div class="row" style="justify-content:center;margin-top:10px">
      <span class="chip g">${I('check',{size:13})} تیک‌خورده ${fa(done)}</span>
      <span class="chip">${fa(all.length-done)} باقی‌مانده</span>
    </div>
  </div>
  <div class="setrow"><div class="lbl"><b>کدام کارت‌ها</b><span>محدودهٔ جلسهٔ مرور</span></div>
    <div class="seg" role="group" aria-label="محدودهٔ مرور">
      ${opt('mode','due','موعددار',r.mode)}${opt('mode','all','همه',r.mode)}${opt('mode','todo','تیک‌نخورده',r.mode)}${opt('mode','weak','ضعیف',r.mode)}
    </div></div>
  <div class="setrow"><div class="lbl"><b>ترتیب</b><span>چیدمان کارت‌ها</span></div>
    <div class="seg" role="group" aria-label="ترتیب مرور">
      ${opt('order','smart','هوشمند',r.order)}${opt('order','shuffle','تصادفی',r.order)}${opt('order','seq','به ترتیب',r.order)}
    </div></div>
  <div class="setrow"><div class="lbl"><b>جهت کارت</b><span>روی کارت چه زبانی باشد</span></div>
    <div class="seg" role="group" aria-label="جهت کارت">
      ${opt('dir','it','ایتالیایی',r.dir)}${opt('dir','fa','فارسی',r.dir)}${opt('dir','mix','درهم',r.dir)}
    </div></div>
  <div class="setrow"><div class="lbl"><b>پخش خودکار صدا</b><span>تلفظ هر کارت خودکار پخش شود</span></div>
    <button class="sw ${r.auto?'on':''}" data-act="rvauto" role="switch" aria-checked="${!!r.auto}" aria-label="پخش خودکار صدا"></button></div>
  <div class="card tight">
    <button class="btn block" data-act="fcstart" data-deck="${esc(sel||'all')}" data-mode="advanced">${I('play',{size:17})} شروع مرور پیشرفته</button>
  </div>`;
}

/* ---------- audio pack manager ---------- */
/* Device speech engine panel — only meaningful inside the Android app. */
function nativeEngineSection(){
  const N=window.NativeTTS;
  if(!N||!N.present)return '';
  const st=N.status||{}, s=DB.settings;
  const voices=N.voices(), engines=N.engines();
  const state=st.ready
    ? (st.italian?'آماده — صدای ایتالیایی فعال':'موتور پیدا شد، ولی دادهٔ ایتالیایی نصب نیست')
    : 'موتور گفتار پیدا نشد';
  const badge=st.isGoogle?'موتور Google':(st.engine||'—');
  return `
  <div class="card small">
    <b>${state}</b><br>
    <span class="muted">${badge}${st.voice?' · '+st.voice:''}</span>
    ${st.italian?'':`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
      <button class="btn sm" data-act="ttsdata">${I('download',{size:15})} دانلود صدای ایتالیایی</button>
      <button class="btn sm ghost" data-act="ttssettings">${I('sliders',{size:15})} تنظیمات گفتار</button>
      ${st.isGoogle||st.ready?'':`<button class="btn sm ghost" data-act="ttsinstall">${I('install',{size:15})} نصب موتور Google</button>`}
    </div>`}
  </div>
  <div class="setrow"><div class="lbl"><b>منبع صدا</b><span>موتور دستگاه کیفیت طبیعی‌تری دارد</span></div>
    <div class="seg" role="group" aria-label="منبع صدا">
      ${[['auto','خودکار'],['google','موتور دستگاه']].map(x=>`<button data-act="setengine" data-v="${x[0]}" class="${s.engine===x[0]?'on':''}" aria-pressed="${s.engine===x[0]}">${x[1]}</button>`).join('')}
    </div></div>
  ${voices.length?`<div class="setrow"><div class="lbl"><b>صدای ایتالیایی</b><span>${fa(voices.length)} صدا · آفلاین‌ها اولویت دارند</span></div>
    <select class="inp" id="nvoiceSel" data-act="nvoice">
      ${voices.map(v=>`<option value="${v.name}" ${v.current?'selected':''}>${v.name.replace(/^it-it-x-|^it-IT-language$/i,'').slice(0,28)} · ${v.offline?'آفلاین':'آنلاین'} · ${fa(v.quality)}</option>`).join('')}
    </select></div>`:''}
  ${engines.length>1?`<div class="setrow"><div class="lbl"><b>موتور</b><span>اگر موتور پیش‌فرض کار نکرد عوضش کن</span></div>
    <select class="inp" id="nengineSel" data-act="nengine">
      ${engines.map(e=>`<option value="${e.name}" ${e.name===st.engine?'selected':''}>${e.label||e.name}</option>`).join('')}
    </select></div>`:''}
  <div class="card small muted">موتور گفتار گوگل بخشی از خود اندروید است و داخل این اپ بسته‌بندی نمی‌شود؛
  اپ به آن <b>وصل</b> می‌شود. اگر دادهٔ ایتالیایی را یک‌بار دانلود کنی، بدون اینترنت هم کار می‌کند.
  اگر موتور در دسترس نبود، از گفتار خود مرورگر استفاده می‌شود.</div>`;
}

function vFC(){
  if(!FC||!FC.q.length)return `<div class="empty"><span class="em">${I('check',{size:30,sw:2.2})}</span>کارتی برای مرور نیست.<br><button class="btn ghost" data-go="#/review" style="margin-top:12px">بازگشت</button></div>`;
  const w=FC.q[FC.i];
  if(!w)return fcDone();
  const rd=(FC.dir&&FC.dir[w.k])||'';
  const rev=rd?rd==='fa':DB.settings.rev;
  const front=rev?w.fa:w.w, back=rev?w.w:w.fa;
  return topbar('مرور','کارت '+fa(FC.i+1)+' از '+fa(FC.q.length),'#/review')+`
  <div class="qprog"><i style="--p:${FC.i/FC.q.length}"></i></div>
  <div class="fc ${FC.flip?'flip':''}" data-act="flip">
    <div class="fc-shell"></div>
    <div class="fc-in">
      <div class="fc-face fc-front">
        <div class="s">${esc(w.g)} · درس ${fa(w.l)}</div>
        <div class="${rev?'m':'w'}">${esc(front)}</div>
        ${!rev?`<button class="mini" data-act="say" data-say="${esc(w.w)}" aria-label="شنیدن تلفظ">${I('volume',{size:18})}</button>`:''}
        <div class="fc-tap">${I('refresh',{size:13})} لمس = پاسخ · کشیدن به چپ/راست = نمره</div>
      </div>
      <div class="fc-face fc-back">
        <div class="${rev?'w':'m'}">${esc(back)}</div>
        ${w.t?`<div class="s">${esc(w.t)}</div>`:''}
        ${w.ex?`<div class="ex it">${esc(w.ex)}</div><div class="s">${esc(w.exfa)}</div>`:''}
        <button class="mini" data-act="say" data-say="${esc(w.ex||w.w)}" aria-label="شنیدن تلفظ">${I('volume',{size:18})}</button>
      </div>
    </div>
  </div>
  ${FC.flip?`<div class="grade">
    <button class="g0" data-act="fcg" data-g="0">نمی‌دانم<small>از اول</small></button>
    <button class="g1" data-act="fcg" data-g="1">سخت<small>زودتر</small></button>
    <button class="g2" data-act="fcg" data-g="2">بلدم<small>بعداً</small></button>
  </div>`:`<button class="btn block" data-act="flip">نمایش پاسخ</button>`}
  <div class="row" style="margin-top:12px;justify-content:center">
    <span class="chip g">${fa(FC.ok)} بلد</span><span class="chip y">${fa(FC.mid)} سخت</span><span class="chip">${fa(FC.no)} نابلد</span>
  </div>
  <p class="muted center" style="margin-top:10px;font-size:.72rem">صفحه‌کلید: <b>Space</b> پاسخ · <b>۱</b> نمی‌دانم · <b>۲</b> سخت · <b>۳</b> بلدم</p>`;
}
function fcDone(){
  const t=FC.ok+FC.mid+FC.no;
  if(window.Ads)window.Ads.interstitial('review-done');
  return topbar('پایان مرور','','#/review')+`<div class="card center">
    <div class="result-badge">${I(FC.ok>=t*0.7?'trophy':'check',{size:34})}</div>
    <div class="scorebig">${fa(t?Math.round(FC.ok/t*100):0)}٪</div>
    <p class="muted">${fa(t)} کارت مرور شد — ${fa(FC.ok)} بلد، ${fa(FC.mid)} سخت، ${fa(FC.no)} نابلد</p>
    <div class="row" style="justify-content:center"><button class="btn" data-act="fcstart" data-deck="${esc(FC.sel)}">مرور دوباره</button>
    <button class="btn ghost" data-go="#/home">خانه</button></div></div>`;
}

/* QUIZ */
let QZ=null;
function startQuiz(qid){
  let qs,title,back;
  if(qid==='quick'){
    const pool=[];L.forEach(l=>l.quiz.forEach(q=>pool.push(q)));
    qs=shuffle(pool).slice(0,10);title='آزمون سریع';back='#/home';
  }else if(/^L\d+$/.test(qid)){
    const l=lesson(qid.slice(1));qs=shuffle(l.quiz);title='آزمون درس '+fa(l.id);back='#/lesson/'+l.id+'/quiz';
  }else{
    const r=review(qid);qs=shuffle(r.quiz);title=r.fa;back='#/test/'+r.id;
  }
  QZ={id:qid,qs:qs,i:0,ok:0,title:title,back:back,ans:false,cur:null};
  go('#/quiz');
}
function vQuiz(){
  if(!QZ)return vHome();
  if(QZ.i>=QZ.qs.length)return qDone();
  const q=QZ.qs[QZ.i];
  if(!QZ.cur||QZ.cur.q!==q)QZ.cur={q:q,sel:[],tokens:[],used:[],matched:[],pick:null,err:0};
  const C=QZ.cur;
  let h=topbar(QZ.title,'پرسش '+fa(QZ.i+1)+' از '+fa(QZ.qs.length),QZ.back)+
  `<div class="qprog"><i style="--p:${QZ.i/QZ.qs.length}"></i></div><div class="qcard">`;
  h+=`<div class="qtext ${isFa(q.q)?'fa':'it'}">${esc(q.q)}</div>`;
  if(q.hint)h+=`<div class="qhint">راهنما: ${esc(q.hint)}</div>`;
  if(q.type==='mc'){
    h+=q.opts.map((o,i)=>{
      let cls='opt'+(isFa(o)?'':' it');
      if(QZ.ans){if(i===q.a)cls+=' ok';else if(C.pick===i)cls+=' no';}
      return `<button class="${cls}" data-act="mc" data-i="${i}" ${QZ.ans?'disabled':''}>${esc(o)}</button>`;
    }).join('');
  }
  if(q.type==='fill'){
    h+=`<input class="qin" id="qfill" placeholder="پاسخ را به ایتالیایی بنویس" value="${esc(C.val||'')}" ${QZ.ans?'disabled':''} autocomplete="off" autocapitalize="off" spellcheck="false">
    <div class="row" style="margin-top:10px">${QZ.ans?'':`<button class="btn grow" data-act="fillcheck">بررسی</button>`}</div>`;
  }
  if(q.type==='order'){
    if(!C.tokens.length){C.tokens=shuffle(q.tokens);C.used=C.tokens.map(()=>false);}
    h+=`<div class="slot" id="slot">${C.sel.map((ti,si)=>`<button class="tok" data-act="untok" data-i="${si}">${esc(C.tokens[ti])}</button>`).join('')||'<span class="muted small" style="margin:auto">کلمه‌ها را به ترتیب انتخاب کن</span>'}</div>
    <div class="tokens">${C.tokens.map((t,i)=>`<button class="tok ${C.used[i]?'used':''}" data-act="tok" data-i="${i}">${esc(t)}</button>`).join('')}</div>
    ${QZ.ans?'':`<div class="row"><button class="btn grow" data-act="ordercheck">بررسی</button><button class="btn ghost" data-act="orderreset">پاک کردن</button></div>`}`;
  }
  if(q.type==='match'){
    if(!C.left){C.left=shuffle(q.pairs.map((p,i)=>i));C.right=shuffle(q.pairs.map((p,i)=>i));}
    h+=`<div class="mgrid"><div class="mcol">${C.left.map(i=>`<button class="mitem it ${C.matched.indexOf(i)>=0?'done':''} ${C.pick&&C.pick.s==='l'&&C.pick.i===i?'sel':''}" data-act="match" data-s="l" data-i="${i}">${esc(q.pairs[i][0])}</button>`).join('')}</div>
    <div class="mcol">${C.right.map(i=>`<button class="mitem ${isFa(q.pairs[i][1])?'':'it'} ${C.matched.indexOf(i)>=0?'done':''} ${C.pick&&C.pick.s==='r'&&C.pick.i===i?'sel':''}" data-act="match" data-s="r" data-i="${i}">${esc(q.pairs[i][1])}</button>`).join('')}</div></div>`;
  }
  if(QZ.ans){
    const good=C.good;
    h+=`<div class="fb ${good?'ok':'no'}"><b>${good?'درست بود':'پاسخ درست:'}</b> ${good?'':`<span class="${isFa(answerText(q))?'':'it'}" style="display:inline-block">${esc(answerText(q))}</span>`}${q.exp?`<br><span class="small">${esc(q.exp)}</span>`:''}</div>
    <div class="row" style="margin-top:12px"><button class="btn grow" data-act="qnext">${QZ.i+1>=QZ.qs.length?'دیدن نتیجه':'پرسش بعد'} ${I('arrowleft',{size:17})}</button>
    <button class="btn ghost" data-act="say" data-say="${esc(answerText(q))}" aria-label="شنیدن پاسخ درست">${I('volume',{size:18})}</button></div>`;
  }
  return h+'</div>';
}
function answerText(q){
  if(q.type==='mc')return q.opts[q.a];
  if(q.type==='fill')return q.a[0];
  if(q.type==='order')return q.a;
  return q.pairs.map(p=>p[0]).join(' / ');
}
function qDone(){
  const pc=Math.round(QZ.ok/QZ.qs.length*100);
  if(QZ.id!=='quick'){const old=DB.scores[QZ.id]||0;if(pc>old)DB.scores[QZ.id]=pc;save();}
  touchDay();
  if(window.Ads)window.Ads.interstitial('quiz-done');
  return topbar('نتیجهٔ آزمون','',QZ.back)+`<div class="card center">
    <div class="result-badge">${I(pc>=80?'trophy':pc>=50?'check':'refresh',{size:34})}</div>
    <div class="scorebig">${fa(pc)}٪</div>
    <p class="muted">${fa(QZ.ok)} پاسخ درست از ${fa(QZ.qs.length)} پرسش</p>
    <div class="row" style="justify-content:center">
      <button class="btn" data-act="quiz" data-q="${esc(QZ.id)}">آزمون دوباره</button>
      <button class="btn ghost" data-go="${QZ.back}">بازگشت</button></div></div>
    <div class="card small muted">${pc>=80?'عالی! برو درس بعد.':pc>=50?'خوب بود؛ واژگان و گرامر همین درس را یک بار مرور کن و دوباره امتحان کن.':'بهتر است اول مکالمه‌ها و واژگان این درس را کامل مرور کنی.'}</div>`;
}

/* SEARCH */
let SI=null;
function buildIndex(){
  if(SI)return SI;SI=[];
  L.forEach(l=>{
    l.vocab.forEach((g,gi)=>g.items.forEach(it=>SI.push({t:'v',l:l.id,it:it.w,fa:it.fa,x:it.ex||'',k:'L'+l.id+'.'+gi+':'+it.w,g:g.gfa})));
    l.phrases.forEach(p=>SI.push({t:'p',l:l.id,it:p.w,fa:p.fa,x:'',k:'P'+l.id+':'+p.w,g:'اصطلاح'}));
    l.dialogs.forEach(d=>d.lines.forEach(ln=>SI.push({t:'d',l:l.id,it:ln[1],fa:ln[2],x:d.tfa,g:'مکالمه'})));
  });
  return SI;
}
function vSearch(q,type){
  const idx=buildIndex();q=q||'';type=type||'all';
  let res=[];
  const nq=norm(q);
  if(nq.length>=1){
    res=idx.filter(r=>(type==='all'||r.t===type)&&(norm(r.it).includes(nq)||r.fa.indexOf(q)>=0));
    res=res.slice(0,120);
  }
  return topbar('جست‌وجو','در واژه‌ها، اصطلاحات و مکالمه‌ها')+`
  <div class="searchbox">${I('search',{size:19})}<input id="sinput" aria-label="جست‌وجو در واژه‌ها، اصطلاحات و مکالمه‌ها" placeholder="واژه یا عبارت… (ایتالیایی یا فارسی)" value="${esc(q)}" autocomplete="off"><button class="mini" data-act="sclear" aria-label="پاک کردن جست‌وجو">${I('x',{size:17})}</button></div>
  <div class="filters">${[['all','همه'],['v','واژگان'],['p','اصطلاحات'],['d','مکالمه‌ها']].map(x=>`<button data-act="stype" data-t="${x[0]}" class="${type===x[0]?'on':''}">${x[1]}</button>`).join('')}</div>
  ${nq?`<div class="muted small" style="margin-bottom:8px">${fa(res.length)} نتیجه</div>`:''}
  ${nq?res.map(r=>`<div class="srow"><div class="main">
      <div class="w it">${esc(r.it)}</div><div class="m">${esc(r.fa)}</div>
      <div class="muted" style="font-size:.7rem">درس ${fa(r.l)} · ${esc(r.g)}</div></div>
      <div class="acts">${spk(r.it)}${r.k?starBtn(r.k):''}</div></div>`).join('')
    :`<div class="empty"><span class="em">${I('search',{size:30})}</span>یک واژه بنویس؛ مثلاً <span class="it">caffè</span>، <span class="it">andare</span> یا «خانواده».<br><span class="small">جست‌وجو در ${fa(idx.length)} جمله و واژه</span></div>`}`;
}

/* VERBS */
function vVerbs(q){
  q=q||'';const nq=norm(q);
  const list=V.filter(v=>!nq||norm(v.inf).includes(nq)||v.fa.indexOf(q)>=0);
  return topbar('جدول فعل‌ها','حال ساده + اسم مفعول','#/home')+`
  <div class="searchbox">${I('lang',{size:19})}<input id="vinput" aria-label="جست‌وجوی فعل" placeholder="جست‌وجوی فعل…" value="${esc(q)}" autocomplete="off"></div>
  <div class="card tight small muted">${fa(V.length)} فعل سطح A1 به ترتیب ظهور در درس‌ها. روی هر فعل بزن تا صرف کاملش باز شود.</div>
  ${list.map((v,i)=>`<div class="card tight">
    <div class="row" data-act="vopen" data-i="${V.indexOf(v)}" style="cursor:pointer">
      <div class="grow"><b class="it" style="font-size:1.02rem">${esc(v.inf)}</b>
      <div class="small muted">${esc(v.fa)} · درس ${fa(v.les)}${v.ref?' · انعکاسی':''}</div></div>
      ${spk(v.inf)}<span class="chip" aria-hidden="true">${I('down',{size:14})}</span>
    </div>
    <div id="vb-${V.indexOf(v)}" hidden>
      <div class="scrollx" style="margin-top:10px"><table class="vtable"><tbody>
      ${['io','tu','lui/lei','noi','voi','loro'].map((p,j)=>`<tr><td style="color:var(--ink3);font-style:italic">${p}</td><td><b>${esc(v.c[j])}</b></td><td style="text-align:right;direction:rtl"><button class="mini" data-act="say" data-say="${esc(v.c[j])}" aria-label="شنیدن تلفظ">${I('volume',{size:17})}</button></td></tr>`).join('')}
      </tbody></table></div>
      <div class="row" style="margin-top:8px"><span class="chip b">passato prossimo: ${esc(v.aux)} + ${esc(v.pp)}</span></div>
      ${v.note?`<div class="note small">${esc(v.note)}</div>`:''}
    </div></div>`).join('')}`;
}


/* ---------- per-lesson flashcards ---------- */
function tabCards(l){
  const sel='L'+l.id;
  const all=deckWords(sel);
  const now=Date.now();
  const d=all.filter(w=>DB.srs[w.k]&&DB.srs[w.k].d<=now).length;
  const nw=all.filter(w=>!DB.srs[w.k]).length;
  const done=all.filter(w=>isDone(w.k)).length;
  return `<div class="card center">
    <span class="em">${I('layers',{size:30})}</span>
    <b>فلش‌کارت درس ${fa(l.id)}</b>
    <p class="muted">${fa(all.length)} کارت · ${fa(d)} موعددار · ${fa(nw)} تازه</p>
    <div class="row" style="justify-content:center;margin:10px 0">
      <span class="chip g">${I('check',{size:13})} یادگرفته: ${fa(done)}</span>
      <span class="chip">${fa(Math.round(done/Math.max(all.length,1)*100))}٪</span>
    </div>
    <button class="btn block" data-act="fcstart" data-deck="${sel}">${I('play',{size:17})} شروع مرور این درس</button>
    <div class="row" style="margin-top:10px">
      <button class="btn sm ghost grow" data-act="fcstart" data-deck="${sel}" data-mode="new">فقط تازه‌ها</button>
      <button class="btn sm ghost grow" data-act="fcstart" data-deck="${sel}" data-mode="todo">فقط تیک‌نخورده</button>
    </div>
  </div>
  <div class="card small muted"><b>روش کار:</b> واژه را ببین، معنی را در ذهن بگو، بعد کارت را برگردان.
    روی موبایل <b>کشیدن به چپ = بلدم</b> و <b>کشیدن به راست = نمی‌دانم</b>.
    با صفحه‌کلید: <b>Space</b> برای پاسخ و <b>۱/۲/۳</b> برای نمره.</div>`;
}

/* ---------- unlimited sentence builder ---------- */
let SB=null;
function sbStart(id){
  SB={id:id,ses:window.Sentences.session(id),cur:null,built:[],bank:[],state:'ask',ok:0,no:0,streak:0,best:0};
  sbNext();
}
function sbNext(){
  SB.cur=SB.ses.next();
  SB.built=[];
  SB.bank=shuffle(SB.cur.tokens.map((t,i)=>({t:t,i:i,used:false})));
  SB.state='ask';
}
function tabBuild(l){
  if(!SB||SB.id!==l.id)sbStart(l.id);
  const c=SB.cur;
  const variety=window.Sentences.variety(l.id);
  let h=`<div class="card tight row">
    <span class="chip b">${I('wand',{size:13})} بی‌پایان</span>
    <span class="chip">${fa(variety)}+ ترکیب</span>
    <span class="chip g">${fa(SB.ok)} درست</span>
    ${SB.streak>1?`<span class="chip y">${I('flame',{size:13})} ${fa(SB.streak)} پشت‌سرهم</span>`:''}
  </div>
  <div class="qcard">
    <div class="qhead"><span class="chip">جملهٔ ${fa(SB.ses.count())}</span>
      <span class="muted small">${fa(c.words)} واژه</span></div>
    <div class="sb-prompt">${esc(c.fa)}</div>
    <p class="muted small" style="margin:6px 0 0">این جمله را به ایتالیایی بساز.</p>
  </div>
  <div class="sb-slot ${SB.state==='ok'?'ok':SB.state==='no'?'no':''}" id="sbSlot" dir="ltr">
    ${SB.built.length?SB.built.map((b,bi)=>`<button class="tok" data-act="sbun" data-i="${bi}">${esc(b.t)}</button>`).join(''):`<span class="sb-hint">واژه‌ها را به ترتیب لمس کن…</span>`}
  </div>
  <div class="sb-bank" dir="ltr">
    ${SB.bank.map((b,bi)=>`<button class="tok ${b.used?'used':''}" data-act="sbpick" data-i="${bi}"${b.used?' disabled':''}>${esc(b.t)}</button>`).join('')}
  </div>`;
  if(SB.state==='ask'){
    h+=`<div class="row">
      <button class="btn grow" data-act="sbcheck"${SB.built.length!==SB.bank.length?' disabled':''}>${I('check',{size:17})} بررسی</button>
      <button class="btn ghost" data-act="sbclear" aria-label="پاک کردن">${I('refresh',{size:17})}</button>
      <button class="btn ghost" data-act="sbskip" aria-label="جملهٔ دیگر">${I('arrowleft',{size:17})}</button>
    </div>`;
  }else{
    const good=SB.state==='ok';
    h+=`<div class="fb ${good?'ok':'no'}">
      <b>${good?'درست است!':'پاسخ درست:'}</b>
      <div class="it sb-answer">${esc(c.it)}</div>
      ${c.note?`<div class="small" style="margin-top:6px">${esc(c.note)}</div>`:''}
    </div>
    <div class="row">
      <button class="btn grow" data-act="sbnext">${I('wand',{size:17})} جملهٔ بعدی</button>
      <button class="btn ghost" data-act="say" data-say="${esc(c.it)}" aria-label="شنیدن جمله">${I('volume',{size:17})}</button>
    </div>`;
  }
  h+=`<div class="card small muted">هر بار یک جملهٔ تازه از واژگان و ساختارهای همین درس ساخته می‌شود؛
    فعل با شخص، صفت با جنس و شمار، و حرف اضافه با نوع مکان مطابقت داده می‌شود.
    تعداد ترکیب‌های ممکن این درس: <b>${fa(variety)}</b>.</div>`;
  return h;
}

/* SETTINGS */
/* ---------- spelling / املا ---------- */
let SP=null;                       // active session
const SPDEF={filter:'all',count:10,mode:'type',accentStrict:false};

function spCfg(){DB.settings.spell=Object.assign({},SPDEF,DB.settings.spell||{});return DB.settings.spell;}

function spStatsBar(l){
  const st=window.Spelling.stats(l?l.id:null);
  const pct=st.total?Math.round(st.mastered/st.total*100):0;
  return `<div class="sp-stats">
    <div class="stat"><b>${fa(st.mastered)}</b><span>تسلط</span></div>
    <div class="stat"><b>${fa(st.tried)}</b><span>تمرین‌شده</span></div>
    <div class="stat"><b>${fa(st.accuracy)}٪</b><span>دقت</span></div>
    <div class="stat"><b>${fa(st.total)}</b><span>واژه</span></div>
  </div>
  <div class="meter" style="--h:${pct}%"><i style="inline-size:${pct}%"></i></div>
  <div class="small muted" style="margin-top:6px">${fa(pct)}٪ واژه‌های ${l?'این درس':'کتاب'} را سه‌بار پشت‌سرهم درست نوشته‌ای.</div>`;
}

function tabSpell(l){
  if(!window.Spelling)return '<div class="card">ماژول املا بارگذاری نشد.</div>';
  if(SP&&!SP.done&&(!l||SP.lesson===l.id))return spActive();
  if(SP&&SP.done)return spSummary();
  const c=spCfg();
  const avail=window.Spelling.pool(l?l.id:null,c.filter).length;
  return `${spStatsBar(l)}
  <div class="sp-setup">
    <div class="setrow"><div class="lbl"><b>کدام واژه‌ها</b><span>${fa(avail)} واژه در این حالت</span></div>
      <div class="seg" role="group" aria-label="محدودهٔ املا">
        ${[['all','همه'],['new','تازه'],['weak','ضعیف'],['hard','بلند']].map(x=>`<button data-act="spfilter" data-v="${x[0]}" class="${c.filter===x[0]?'on':''}" aria-pressed="${c.filter===x[0]}">${x[1]}</button>`).join('')}
      </div></div>
    <div class="setrow"><div class="lbl"><b>شمار واژه‌ها</b><span>در هر جلسه</span></div>
      <div class="seg" role="group" aria-label="شمار واژه‌ها">
        ${[5,10,20].map(n=>`<button data-act="spcount" data-v="${n}" class="${c.count===n?'on':''}" aria-pressed="${c.count===n}">${fa(n)}</button>`).join('')}
      </div></div>
    <div class="setrow"><div class="lbl"><b>شیوهٔ پاسخ</b><span>تایپ کن یا حرف‌ها را بچین</span></div>
      <div class="seg" role="group" aria-label="شیوهٔ پاسخ">
        ${[['type','تایپی'],['tiles','حرف‌چین']].map(x=>`<button data-act="spmode" data-v="${x[0]}" class="${c.mode===x[0]?'on':''}" aria-pressed="${c.mode===x[0]}">${x[1]}</button>`).join('')}
      </div></div>
    <div class="setrow"><div class="lbl"><b>سخت‌گیری روی اکسان</b><span>${c.accentStrict?'è و e متفاوت شمرده می‌شوند':'تفاوت اکسان بخشیده می‌شود'}</span></div>
      <button class="sw ${c.accentStrict?'on':''}" data-act="spaccent" role="switch" aria-checked="${c.accentStrict}" aria-label="سخت‌گیری روی اکسان"></button></div>
    ${avail?`<button class="btn wide" data-act="spstart" data-l="${l?l.id:''}">${I('keyboard',{size:17})} شروع املا</button>`
      :`<div class="card small muted">در این حالت واژه‌ای نیست. حالت دیگری را انتخاب کن.</div>`}
  </div>
  <div class="card small muted">املای درست با <b>سه پاسخ درست پشت‌سرهم</b> ثبت می‌شود. اگر راهنما بگیری، آن پاسخ تسلط نمی‌سازد.
  این آمار از فلش‌کارت‌ها جداست.</div>`;
}

function spActive(){
  const c=spCfg(),it=SP.cur;
  if(!it){SP.done=true;return spSummary();}
  const n=SP.items.length,pct=Math.round(SP.i/n*100);
  const ans=SP.answer||'';
  return `<div class="sp-head">
      <span class="chip">${fa(SP.i+1)} از ${fa(n)}</span>
      <span class="chip ok">${I('check',{size:13})} ${fa(SP.right)}</span>
      <span class="chip bad">${I('x',{size:13})} ${fa(SP.wrong)}</span>
      <button class="btn sm ghost" data-act="spquit">${I('x',{size:14})} پایان</button>
    </div>
    <div class="meter"><i style="inline-size:${pct}%"></i></div>
    <div class="sp-card">
      <div class="sp-fa">${esc(it.fa)}</div>
      ${it.t?`<div class="sp-type">${esc(it.t)}</div>`:''}
      <div class="sp-listen">
        <button class="btn sm" data-act="spsay" data-say="${esc(it.w)}">${I('volume',{size:16})} بشنو</button>
        <button class="btn sm ghost" data-act="spslow" data-say="${esc(it.w)}">${I('clock',{size:15})} آرام</button>
      </div>
      ${SP.revealed?spResult(it):spInput(it,c,ans)}
    </div>`;
}

function spInput(it,c,ans){
  if(c.mode==='tiles'){
    const bank=SP.tiles||(SP.tiles=window.Spelling.tiles(it.w));
    const used=SP.used||[];
    return `<div class="sp-answer tiles" id="spAns" aria-live="polite">${ans?esc(ans):'<span class="ph">حرف‌ها را به‌ترتیب بزن</span>'}</div>
      <div class="sp-bank">${bank.map((ch,i)=>`<button class="tok${used.indexOf(i)>=0?' used':''}" data-act="sptile" data-i="${i}"${used.indexOf(i)>=0?' disabled':''}>${esc(ch)}</button>`).join('')}</div>
      <div class="sp-actions">
        <button class="btn sm ghost" data-act="spback">${I('arrowleft',{size:15})} حذف آخر</button>
        <button class="btn sm ghost" data-act="spclear">پاک کردن</button>
        <button class="btn sm ghost" data-act="sphint">${I('info',{size:15})} راهنما${SP.hintLevel?' ('+fa(SP.hintLevel)+')':''}</button>
        <button class="btn" data-act="spcheck">${I('check',{size:16})} بررسی</button>
      </div>
      ${SP.hintLevel?`<div class="sp-hintline it">${esc(window.Spelling.hint(it.w,SP.hintLevel))}</div>`:''}`;
  }
  return `<input class="sp-input it" id="spAns" type="text" value="${esc(ans)}" placeholder="به ایتالیایی بنویس…"
      autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" dir="ltr"
      aria-label="املای واژه به ایتالیایی">
    <div class="sp-keys">${window.Spelling.ACCENT_KEYS.map(k=>`<button class="key" data-act="spkey" data-k="${k}">${k}</button>`).join('')}
      <button class="key" data-act="spkey" data-k="'">'</button></div>
    <div class="sp-actions">
      <button class="btn sm ghost" data-act="sphint">${I('info',{size:15})} راهنما${SP.hintLevel?' ('+fa(SP.hintLevel)+')':''}</button>
      <button class="btn sm ghost" data-act="spskip">نمی‌دانم</button>
      <button class="btn" data-act="spcheck">${I('check',{size:16})} بررسی</button>
    </div>
    ${SP.hintLevel?`<div class="sp-hintline it">${esc(window.Spelling.hint(it.w,SP.hintLevel))}</div>`:''}`;
}

function spResult(it){
  const g=SP.grade;
  const cls=g.ok?'ok':(g.near?'near':'bad');
  const msg=g.ok?(g.reason==='accent'?'درست — فقط اکسان را دقت کن':'آفرین، درست بود')
    :(g.reason==='empty'?'چیزی ننوشتی':(g.near?'خیلی نزدیک بود':'درست نبود'));
  return `<div class="sp-verdict ${cls}">
      <b>${msg}</b>
      <div class="sp-diff it" dir="ltr">${(g.diff||[]).map(d=>`<span class="${d.ok?'d-ok':(d.missing?'d-miss':'d-bad')}">${esc(d.ch||'·')}</span>`).join('')}</div>
      <div class="sp-correct it" dir="ltr">${esc(it.w)}</div>
      ${g.reason==='accent'?`<div class="small muted">در ایتالیایی اکسان معنا را عوض می‌کند: <span class="it">è</span> یعنی «هست»، <span class="it">e</span> یعنی «و».</div>`:''}
    </div>
    <div class="sp-actions">
      <button class="btn sm ghost" data-act="spsay" data-say="${esc(it.w)}">${I('volume',{size:15})} دوباره بشنو</button>
      <button class="btn" data-act="spnext">${SP.i+1>=SP.items.length?'دیدن نتیجه':'واژهٔ بعد'} ${I('arrowleft',{size:16})}</button>
    </div>`;
}

function spSummary(){
  if(window.Ads&&!SP.adShown){SP.adShown=true;window.Ads.interstitial('spelling-done');}
  const n=SP.items.length,acc=n?Math.round(SP.right/n*100):0;
  const secs=Math.max(1,Math.round((Date.now()-SP.started)/1000));
  const missed=SP.missed||[];
  return `<div class="sp-done">
    <div class="scorebig">${fa(acc)}٪</div>
    <div class="small muted">${fa(SP.right)} درست · ${fa(SP.wrong)} نادرست · ${fa(secs)} ثانیه${SP.hints?' · '+fa(SP.hints)+' راهنما':''}</div>
    ${missed.length?`<h3 class="sec-title">این‌ها را دوباره تمرین کن</h3>
      ${missed.map(m=>`<div class="prow"><div class="main"><div class="it">${esc(m.w)}</div><div class="m">${esc(m.fa)}</div></div>
        <div class="acts">${spk(m.w)}</div></div>`).join('')}`
      :`<div class="card small">هیچ واژه‌ای را اشتباه ننوشتی. عالی بود.</div>`}
    <div class="sp-actions">
      <button class="btn" data-act="spagain">${I('refresh',{size:16})} جلسهٔ تازه</button>
      ${missed.length?`<button class="btn ghost" data-act="spretry">تمرین اشتباه‌ها</button>`:''}
    </div>
  </div>`;
}

/* inline practice, opened by swiping a vocabulary row to the left */
function spInline(row){
  const w=row.dataset.w,faMean=row.dataset.fa,key=row.dataset.k;
  if(!w||!window.Spelling)return;
  $$('.sp-inline').forEach(e=>e.remove());
  $$('.vrow.sw-open').forEach(e=>e.classList.remove('sw-open'));
  row.classList.add('sw-open');
  const box=document.createElement('div');
  box.className='sp-inline';
  box.innerHTML=`<div class="sp-inline-head"><b>املا</b><span class="muted">${esc(faMean)}</span>
      <button class="btn sm ghost" data-act="spclose" aria-label="بستن">${I('x',{size:14})}</button></div>
    <div class="sp-listen"><button class="btn sm" data-act="spsay" data-say="${esc(w)}">${I('volume',{size:15})} بشنو</button></div>
    <input class="sp-input it" type="text" placeholder="بنویس…" autocomplete="off" autocapitalize="off"
      autocorrect="off" spellcheck="false" dir="ltr" data-k="${esc(key)}" data-w="${esc(w)}" aria-label="املای واژه">
    <div class="sp-keys">${window.Spelling.ACCENT_KEYS.map(k=>`<button class="key" data-act="spikey" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="sp-actions"><button class="btn sm" data-act="spicheck">${I('check',{size:15})} بررسی</button></div>
    <div class="sp-iresult" aria-live="polite"></div>`;
  row.parentNode.insertBefore(box,row.nextSibling);
  const inp=box.querySelector('input');
  setTimeout(()=>{try{inp.focus();}catch(e){}},60);
  TTS.say(w);
}

function spGrade(){
  const it=SP.cur;if(!it)return;
  const c=spCfg();
  const g=window.Spelling.grade(SP.answer,it.w,{accentStrict:c.accentStrict});
  SP.grade=g;SP.revealed=true;
  if(g.ok)SP.right++;else{SP.wrong++;SP.missed.push(it);}
  window.Spelling.record(it.key,g.ok,SP.hintLevel?1:0);
  render();
  if(!g.ok)setTimeout(()=>TTS.say(it.w),200);
}

function spStart(lessonId,retry){
  const c=spCfg();
  SP=window.Spelling.session({lesson:lessonId||null,filter:c.filter,count:c.count});
  if(retry&&retry.length){SP.items=retry;SP.i=0;SP.right=0;SP.wrong=0;SP.hints=0;SP.missed=[];SP.started=Date.now();}
  SP.lesson=lessonId?+lessonId:null;
  SP.answer='';SP.hintLevel=0;SP.revealed=false;SP.grade=null;SP.tiles=null;SP.used=[];
  render();
  setTimeout(()=>{if(SP&&SP.cur)TTS.say(SP.cur.w);},260);
}

/* ---------- settings: grouped, searchable, collapsible ---------- */

/* One row. `keys` feeds the search filter without showing extra text. */
function srow(label,desc,control,keys){
  return `<div class="setrow" data-sk="${esc((label+' '+desc+' '+(keys||'')).toLowerCase())}">
    <div class="lbl"><b>${label}</b>${desc?`<span>${desc}</span>`:''}</div>${control||''}</div>`;
}
function sseg(act,cur,opts,aria){
  return `<div class="seg" role="group" aria-label="${esc(aria||'')}">${opts.map(x=>
    `<button data-act="${act}" data-v="${x[0]}" class="${String(cur)===String(x[0])?'on':''}" aria-pressed="${String(cur)===String(x[0])}">${x[1]}</button>`).join('')}</div>`;
}
function ssw(on,act,aria){
  return `<button class="sw ${on?'on':''}" data-act="${act}" role="switch" aria-checked="${!!on}" aria-label="${esc(aria||'')}"></button>`;
}
function srange(act,val,min,max,step,aria){
  return `<input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-act="${act}" aria-label="${esc(aria||'')}" style="width:120px">`;
}
function sgroup(id,icon,title,sub,body,opts){
  opts=opts||{};
  return `<details class="set-group${opts.danger?' set-danger':''}" id="sg-${id}"${opts.open?' open':''}>
    <summary><span class="gi">${I(icon,{size:17})}</span>
      <span class="gt">${title}${sub?`<small>${sub}</small>`:''}</span>
      ${opts.badge||''}<span class="chev">${I('left',{size:16})}</span></summary>
    <div class="set-body">${body}</div></details>`;
}

function vSettings(){
  const s=DB.settings, N=window.NativeTTS, A=window.Ads;
  const sp=window.Spelling?window.Spelling.stats():null;

  /* --- appearance --- */
  const gAppear=sgroup('appear','sun','ظاهر و حرکت','تم، اندازهٔ قلم، انیمیشن',
    srow('حالت نمایش','روشن، تاریک یا هماهنگ با دستگاه',sseg('settheme',s.theme,[['light','روشن'],['dark','تاریک'],['auto','خودکار']],'حالت نمایش'),'theme dark light')
    +srow('اندازهٔ قلم',fa(s.fs)+' پیکسل',srange('fs',s.fs,14,21,1,'اندازهٔ قلم'),'font size text')
    +srow('حرکت و انیمیشن','عمق سه‌بعدی و گذار صفحه‌ها',ssw(s.motion!=='off','setmotion','حرکت و انیمیشن'),'motion animation')
    +srow('بازخورد لمسی','لرزش کوتاه هنگام انتخاب',ssw(s.haptics!=='off','sethaptics','بازخورد لمسی'),'haptic vibrate')
    ,{open:true});

  /* --- voice --- */
  let voiceBody='';
  if(N&&N.present)voiceBody+=nativeEngineSection();
  voiceBody+=srow('سرعت گفتار',s.rate.toFixed(2)+'×',srange('rate',s.rate,0.5,1.2,0.05,'سرعت گفتار'),'speed rate slow')
    +srow('آزمایش صدا','Ciao! Come stai?',`<button class="btn sm" data-act="say" data-say="Ciao! Come stai? Io studio l’italiano.">${I('play',{size:14})} پخش</button>`,'test audio')
    +(TTS.ok?srow('صدای مرورگر',TTS.voices.length?fa(TTS.voices.length)+' صدا':'صدای it-IT نصب نشده',
        `<select class="inp" id="voiceSel" data-act="voice" aria-label="صدای مرورگر"></select>`,'browser voice'):'');
  const gVoice=sgroup('voice','volume','صدا و تلفظ',
    N&&N.present?(N.available?'موتور دستگاه فعال':'نیاز به دانلود صدای ایتالیایی'):'گفتار مرورگر',
    voiceBody,{open:!!(N&&N.present&&!N.available),
      badge:N&&N.present?(N.available?'<span class="set-badge">آماده</span>':'<span class="set-badge warn">ناقص</span>')
        :'<span class="set-badge off">مرورگر</span>'});

  /* --- spelling --- */
  const sc=spCfg();
  const gSpell=sgroup('spell','keyboard','املا','شیوهٔ تمرین و سخت‌گیری',
    srow('شیوهٔ پاسخ','تایپ کن یا حرف‌ها را بچین',sseg('spmode',sc.mode,[['type','تایپی'],['tiles','حرف‌چین']],'شیوهٔ املا'),'spelling type tiles')
    +srow('سخت‌گیری روی اکسان',sc.accentStrict?'è و e متفاوت شمرده می‌شوند':'تفاوت اکسان بخشیده می‌شود',
        ssw(sc.accentStrict,'spaccent','سخت‌گیری روی اکسان'),'accent strict')
    +srow('شمار واژه در جلسه','پیش‌فرض جلسه‌های املا',sseg('spcount',sc.count,[[5,'۵'],[10,'۱۰'],[20,'۲۰']],'شمار واژه'),'count session')
    +(sp?srow('آمار املا',fa(sp.mastered)+' واژه مسلط · دقت '+fa(sp.accuracy)+'٪',
        `<button class="btn sm red ghost" data-act="spreset">${I('refresh',{size:14})} صفر کردن</button>`,'stats reset'):'')
    ,{badge:sp&&sp.mastered?`<span class="set-badge">${fa(sp.mastered)}</span>`:''});

  /* --- study --- */
  const gStudy=sgroup('study','layers','مطالعه و مرور','فلش‌کارت و نمایش ترجمه',
    srow('کارت‌های هر جلسه',fa(s.limit)+' کارت',srange('limit',s.limit,5,60,5,'شمار کارت'),'flashcard limit')
    +srow('مرور معکوس','اول فارسی، بعد ایتالیایی',ssw(s.rev,'setrev','مرور معکوس'),'reverse')
    +srow('نمایش ترجمهٔ مکالمه‌ها','اگر خاموش باشد ترجمه‌ها پنهان می‌شوند',ssw(s.tr,'settr','نمایش ترجمه'),'translation')
    );

  /* --- ads --- */
  let gAds='';
  if(A){
    const st=A.status(),free=A.isAdFree();
    gAds=sgroup('ads','sparkles','تبلیغات','این اپ با تبلیغ رایگان مانده است',
      `<div class="card small">${free
        ? `<b>تبلیغ تا ${fa(A.adFreeHoursLeft())} ساعت دیگر خاموش است.</b>`
        : 'با دیدن یک ویدیوی کوتاه، <b>۲۴ ساعت بدون تبلیغ</b> مطالعه کن.'}
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn sm" data-act="adfree">${I('play',{size:14})} ${free?'تمدید':'۲۴ ساعت بدون تبلیغ'}</button>
        </div></div>`
      +srow('تبلیغ در فهرست‌ها','تبلیغ هم‌شکل محتوا بین درس‌ها و واژه‌ها',ssw(A.pref('native'),'adnative','تبلیغ بومی'),'native ad')
      +srow('نوار پایین صفحه','بنر کوچک، فقط بیرون از تمرین‌ها',ssw(A.pref('banner'),'adbanner','بنر'),'banner ad')
      +srow('تبلیغ تمام‌صفحه','بین آزمون‌ها، با فاصلهٔ زمانی',ssw(A.pref('interstitial'),'adinter','تبلیغ تمام‌صفحه'),'interstitial')
      +srow('وضعیت و آزمایش',adWhy(A.diag()),
          `<button class="btn sm ghost" data-act="adtest">${I('play',{size:14})} آزمایش تبلیغ</button>`,'ad diagnostics')
      +srow('حریم خصوصی تبلیغات','چه داده‌ای رد و بدل می‌شود',
          `<button class="btn sm ghost" data-act="adprivacy">${I('lock',{size:14})} توضیح</button>`,'privacy data')
      ,{badge:free?'<span class="set-badge">خاموش</span>':(st.ready?'':'<span class="set-badge off">غیرفعال</span>')});
  }

  /* --- data --- */
  const gData=sgroup('data','lock','داده‌ها و پشتیبان','پیشرفت تو فقط روی همین دستگاه است',
    srow('پشتیبان‌گیری','ذخیرهٔ پیشرفت در یک فایل',`<button class="btn sm ghost" data-act="export">${I('download',{size:15})} دانلود</button>`,'backup export')
    +srow('بازیابی','خواندن فایل پشتیبان',`<label class="btn sm ghost">${I('upload',{size:15})} انتخاب فایل<input type="file" accept="application/json" id="impf" hidden></label>`,'restore import')
    );
  const gReset=sgroup('reset','trash','صفر کردن','این کار برگشت‌پذیر نیست',
    srow('صفر کردن پیشرفت','همهٔ کارت‌ها، نمره‌ها و تیک‌ها پاک می‌شوند',
      `<button class="btn sm red" data-act="reset">${I('trash',{size:15})} پاک کردن</button>`,'reset delete')
    ,{danger:true});

  /* iPhone/iPad can install the app but exposes no prompt API: it lives in
     Safari's Share menu. Onboarding people to that is worth a real sheet. */
  const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)
    ||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isStandalone=()=>window.navigator.standalone===true
    ||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  function iosSheet(){
    const st=(n,body)=>`<li><b>${n}</b> ${body}</li>`;
    UI.openSheet(`<div class="sheet-h"><h3>نصب روی آیفون</h3>
      <p class="muted">دو مرحله، بدون استور و بدون حساب اپل.</p></div>
      <ol class="ios-steps">
        ${st('۱.','این صفحه را در <b>Safari</b> باز کن. (کروم روی آیفون نصب نمی‌کند.)')}
        ${st('۲.','دکمهٔ <b>اشتراک‌گذاری</b> <span class="ios-ico">⤴</span> را در نوار پایین بزن.')}
        ${st('۳.','در فهرست، <b>Add to Home Screen</b> (افزودن به صفحهٔ اصلی) را انتخاب کن.')}
        ${st('۴.','بالا سمت راست <b>Add</b> را بزن. آیکون اپ روی صفحهٔ اصلی می‌آید.')}
      </ol>
      <div class="card small muted">بعد از نصب، اپ <b>تمام‌صفحه</b> و <b>بدون اینترنت</b> هم باز می‌شود.
      صدا هم از موتور گفتار خود iOS استفاده می‌کند.</div>`);
  }

  /* --- install (web only) --- */
  const gInstall=(N&&N.present)?'':sgroup('install','install','نصب روی موبایل','مثل یک اپ، با آیکون روی صفحهٔ اصلی',
    srow('نصب اپ','بدون نیاز به استور',`<button class="btn sm" data-act="install">${I('install',{size:15})} ${isIOS()?'افزودن':'نصب'}</button>`,'install pwa')
    +`<div class="card small muted">${isIOS()
      ? 'در <b>Safari</b>: دکمهٔ اشتراک‌گذاری ← <b>Add to Home Screen</b>. راهنمای تصویری با زدن دکمه.'
      : 'منوی مرورگر ← <b>نصب اپ</b>. در آیفون دکمهٔ بالا راهنمای Safari را نشان می‌دهد.'}</div>`);

  /* --- community --- */
  const gComm=window.Community?sgroup('community','chat','گروه تلگرام','پرسش، نکته و ارتباط با بقیه',
    srow('گروه اسپرسو A1','t.me/Termefilter',
      `<button class="btn sm" data-act="tgopen">${I('share',{size:14})} باز کردن</button>`,'telegram group community')
    +srow('پیشنهاد عضویت','یک‌بار هنگام ورود نشان داده می‌شود',
      `<button class="btn sm ghost" data-act="tgreset">${I('refresh',{size:14})} نشان دادن دوباره</button>`,'invite reset')
    ):'';

  /* --- about --- */
  const gAbout=sgroup('about','info','درباره و حق نشر','',
    `<div class="card small about">
      <b>محتوا:</b> ترتیب ۱۰ درس، سرفصل‌های گرامری و مجموعهٔ واژگان هم‌موضوع با
      <span class="it">Nuovo Espresso 1</span> (Alma Edizioni) است. همهٔ <b>مکالمه‌ها، مثال‌ها،
      توضیح‌های فارسی و تمرین‌ها تألیفی</b> هستند و متن کتاب بازنشر نشده است.
      <br><br><b>حریم خصوصی:</b> پیشرفت تو فقط روی همین دستگاه ذخیره می‌شود؛ حساب کاربری وجود ندارد.
      ${A?'برای نمایش تبلیغ، شبکهٔ تبلیغاتی ممکن است شناسهٔ دستگاه را ببیند؛ جزئیات در بخش تبلیغات.':''}
      <br><br><span class="credit">ساخته شده توسط <b>کسری محمدی</b></span>
    </div>`
    +srow('نسخه',VER_FA+' — Liquid Glass','','version')
    +(window.Bazaar?srow('امتیاز در بازار','نظرت به دیگران کمک می‌کند',
        `<button class="btn sm ghost" data-act="rate">${I('star',{size:14})} امتیاز</button>`,'rate review bazaar'):'')
    );

  const groups=[
    ['appear','ظاهر','sun',gAppear],['voice','صدا','volume',gVoice],
    ['spell','املا','keyboard',gSpell],['study','مطالعه','layers',gStudy],
    ...(A?[['ads','تبلیغات','sparkles',gAds]]:[]),
    ['data','داده‌ها','lock',gData],
    ...(gComm?[['community','تلگرام','chat',gComm]]:[]),
    ...(gInstall?[['install','نصب','install',gInstall]]:[]),
    ['about','درباره','info',gAbout],['reset','صفر کردن','trash',gReset]
  ];

  return topbar('تنظیمات','')+`
  <div class="set-hero">
    <span class="ava">${I('coffee',{size:26})}</span>
    <div><b>اسپرسو A1</b><span>نسخهٔ ${VER_FA} · ایتالیایی درس‌به‌درس</span></div>
  </div>
  <div class="set-search">
    <span class="ic">${I('search',{size:17})}</span>
    <input type="search" id="setQ" placeholder="جست‌وجو در تنظیمات…" autocomplete="off" aria-label="جست‌وجو در تنظیمات">
  </div>
  <nav class="set-nav" aria-label="پرش به بخش">
    ${groups.map(g=>`<a href="#sg-${g[0]}" data-jump="${g[0]}">${I(g[2],{size:13})} ${g[1]}</a>`).join('')}
  </nav>
  <div id="setGroups">${groups.map(g=>g[3]).join('')}</div>
  <div class="set-empty" id="setEmpty" hidden>چیزی پیدا نشد.</div>
  <div class="set-foot">ساخته شده توسط <b>کسری محمدی</b></div>`;
}

/* Give every row a search key, including the ones built by the audio
   sections, so the filter can never miss a control. */
function settingsIndex(){
  $$('#setGroups .setrow').forEach(r=>{
    if(!r.dataset.sk)r.dataset.sk=(r.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
  });
}

/* Live filter across every row; groups with no match hide themselves. */
function settingsFilter(q){
  q=(q||'').trim().toLowerCase();
  const groups=$$('#setGroups .set-group');
  let any=false;
  groups.forEach(g=>{
    let hits=0;
    g.querySelectorAll('.setrow').forEach(r=>{
      const ok=!q||(r.dataset.sk||r.textContent.toLowerCase()).indexOf(q)>=0;
      r.style.display=ok?'':'none';
      if(ok)hits++;
    });
    const has=hits>0;
    g.classList.toggle('is-hidden',!has);
    if(has){any=true;if(q)g.open=true;}
  });
  const e=$('#setEmpty');if(e)e.hidden=any;
}

/* ---------- router ---------- */
let CUR={};
function go(h){if(location.hash===h)render();else location.hash=h;}
function render(){
  TTS.stop();
  const h=location.hash||'#/home';
  const p=h.replace(/^#\/?/,'').split('/');
  const v=p[0]||'home';
  let html='';
  CUR={v:v};
  if(v==='home')html=vHome();
  else if(v==='lessons')html=vLessons();
  else if(v==='lesson'){CUR.id=+p[1];CUR.tab=p[2]||'dialogs';html=vLesson(p[1],p[2]);}
  else if(v==='test')html=vTest(p[1]);
  else if(v==='review')html=vReview(p[1]);
  else if(v==='fc')html=vFC();
  else if(v==='quiz')html=vQuiz();
  else if(v==='quick'){startQuiz('quick');return;}
  else if(v==='search'){CUR.q=decodeURIComponent(p[1]||'');CUR.st=p[2]||'all';html=vSearch(CUR.q,CUR.st);}
  else if(v==='verbs'){CUR.q=decodeURIComponent(p[1]||'');html=vVerbs(CUR.q);}
  else if(v==='spell'){const lid=p[1]?+p[1]:null;
    if(SP&&SP.done)html=topbar('املا','')+(lid?tabSpell(lesson(lid)):tabSpell(null));
    else html=topbar('املا','')+(lid?tabSpell(lesson(lid)):tabSpell(null));}
  else if(v==='settings')html=vSettings();
  else html=vHome();
  const commit=()=>{
    app.innerHTML='<div class="fade">'+html+'</div>';
    if(window.Ads){
      window.Ads.banner(['home','lessons','lesson','search','verbs','review'].indexOf(v)>=0);
      if(window.__adsSync)window.__adsSync();
    }
    afterRender(v);
    /* if the launch screen was a lesson, invite once they reach Home */
    if(window.Community&&(v==='home'||v==='lessons'))window.Community.maybeInvite();
  };
  if(document.startViewTransition&&!window.UI.reduced()){
    try{document.startViewTransition(commit);}catch(e){commit();}
  }else commit();
  setTab(h);
}
function announce(){
  const el=document.getElementById('routeStatus');
  const h1=$('#app h1');
  if(el&&h1)el.textContent=h1.textContent.trim();
}
/* partial re-render used by quiz / flashcards / search: no scroll reset, no VT */
function repaint(html){
  app.innerHTML='<div class="fade">'+html+'</div>';
  window.UI.enhance(app);
  if(CUR.v==='fc')bindFC();
}
/* Flashcard gestures: tap flips, horizontal drag grades.
   Buttons and keyboard remain the accessible equivalents. */
function bindFC(){
  const card=$('.fc');if(!card||!FC)return;
  const inner=$('.fc-in',card);
  let sx=0,sy=0,dx=0,drag=false,axis=null,moved=false;
  const reset=()=>{inner.style.transition='';inner.style.transform='';card.classList.remove('dragging');};
  card.addEventListener('pointerdown',e=>{
    if(e.target.closest('button'))return;
    drag=true;axis=null;moved=false;sx=e.clientX;sy=e.clientY;dx=0;
    inner.style.transition='none';
    try{card.setPointerCapture(e.pointerId);}catch(x){}
  });
  card.addEventListener('pointermove',e=>{
    if(!drag)return;
    const mx=e.clientX-sx,my=e.clientY-sy;
    if(!axis){if(Math.abs(mx)>10||Math.abs(my)>10)axis=Math.abs(mx)>Math.abs(my)?'x':'y';else return;}
    if(axis!=='x')return;
    dx=mx;moved=true;card.classList.add('dragging');
    const rot=mx/22, base=FC.flip?180:0;
    inner.style.transform='translateX('+mx+'px) rotateY('+base+'deg) rotateZ('+rot+'deg)';
  });
  const finish=()=>{
    if(!drag)return;drag=false;
    const th=Math.min(110,card.getBoundingClientRect().width*0.28);
    if(axis==='x'&&Math.abs(dx)>th&&FC.flip){
      // RTL: drag toward the inline-start (left) = "بلدم", inline-end (right) = "نمی‌دانم"
      const g=dx<0?2:0;
      reset();
      const w=FC.q[FC.i];if(!w)return;
      grade(w.k,g);window.UI.haptic(g===2?10:20);
      if(g===0)FC.no++;else FC.ok++;
      FC.i++;FC.flip=false;repaint(vFC());return;
    }
    reset();
  };
  card.addEventListener('pointerup',finish);
  card.addEventListener('pointercancel',finish);
  card.addEventListener('click',e=>{
    if(moved){e.stopPropagation();e.preventDefault();moved=false;}
  },true);
}
document.addEventListener('keydown',e=>{
  if(CUR.v!=='fc'||!FC||window.UI.isSheetOpen())return;
  const t=e.target.tagName;
  if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;
  if(e.key===' '||e.key==='Enter'){if(t==='BUTTON')return;e.preventDefault();FC.flip=!FC.flip;repaint(vFC());return;}
  if(!FC.flip)return;
  const map={'1':0,'2':1,'3':2,'\u06f1':0,'\u06f2':1,'\u06f3':2};
  if(map[e.key]!==undefined){
    e.preventDefault();const g=map[e.key],w=FC.q[FC.i];if(!w)return;
    grade(w.k,g);window.UI.haptic(10);
    if(g===0)FC.no++;else if(g===1)FC.mid++;else FC.ok++;
    FC.i++;FC.flip=false;repaint(vFC());
  }
});
function afterRender(v){
  if(v==='settings'){renderVoiceOptions();settingsIndex();}
  if(v==='fc'){bindFC();if(FC&&FC.auto&&!FC.flip&&FC.q[FC.i])setTimeout(()=>TTS.say(FC.q[FC.i].w),260);}
  if(v==='quiz'){const f=$('#qfill');if(f&&!QZ.ans){f.focus();f.onkeydown=e=>{if(e.key==='Enter')checkFill();};f.oninput=e=>{QZ.cur.val=e.target.value;};}}
  if(v==='search')bindSearch();
  if(v==='verbs')bindVerbs();
  const fi=$('#impf');if(fi)fi.onchange=importData;
  window.UI.enhance(app);
  announce();
  window.scrollTo(0,0);
}
function bindSearch(){const i=$('#sinput');if(!i)return;i.oninput=e=>{const val=e.target.value;clearTimeout(i._t);i._t=setTimeout(()=>{repaint(vSearch(val,CUR.st));const ni=$('#sinput');ni.focus();ni.setSelectionRange(val.length,val.length);bindSearch();},220);};}
function bindVerbs(){const i=$('#vinput');if(!i)return;i.oninput=e=>{const val=e.target.value;clearTimeout(i._t);i._t=setTimeout(()=>{repaint(vVerbs(val));const ni=$('#vinput');ni.focus();ni.setSelectionRange(val.length,val.length);bindVerbs();},220);};}

/* ---------- quiz logic ---------- */
function checkFill(){
  const q=QZ.cur.q,f=$('#qfill');if(!f)return;
  QZ.cur.val=f.value;
  const ok=q.a.some(a=>norm(a)===norm(f.value));
  QZ.cur.good=ok;QZ.ans=true;if(ok)QZ.ok++;
  repaint(vQuiz());
}
function checkOrder(){
  const C=QZ.cur,q=C.q;
  const s=C.sel.map(i=>C.tokens[i]).join(' ');
  const ok=norm(s)===norm(q.a);
  C.good=ok;QZ.ans=true;if(ok)QZ.ok++;
  repaint(vQuiz());
}

/* ---------- events ---------- */
/* Keyboard parity: role="button" elements must respond to Enter and Space,
   exactly like a native button. Native buttons already do, so skip them. */
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar')return;
  const t=e.target;
  if(!t||!t.getAttribute)return;
  if(t.tagName==='BUTTON'||t.tagName==='A'||t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA')return;
  if(t.getAttribute('role')!=='button')return;
  const b=t.closest('[data-act]');if(!b)return;
  e.preventDefault();
  b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
});
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');
  if(g){window.UI.closeSheet();if(g.classList.contains('nav-item'))window.UI.haptic(8);go(g.dataset.go);return;}
  const b=e.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act;
  if(a==='say'){e.stopPropagation();TTS.say(b.dataset.say);return;}
  if(a==='theme'){DB.settings.theme=isDark()?'light':'dark';applySettings();save();window.UI.haptic(8);render();return;}
  if(a==='settheme'){DB.settings.theme=b.dataset.v;applySettings();save();render();return;}
  if(a==='setmotion'){DB.settings.motion=DB.settings.motion==='off'?'on':'off';applySettings();save();render();return;}
  if(a==='sethaptics'){DB.settings.haptics=DB.settings.haptics==='off'?'on':'off';applySettings();save();window.UI.haptic(14);render();return;}
  if(a==='sheet'){
    if(window.UI.isSheetOpen()){window.UI.closeSheet();return;}
    const d=due().length;
    window.UI.openSheet(`
      <button class="sheet-item" data-act="sheetgo" data-h="#/review">
        <span class="si-ico">${I('layers',{size:22})}</span>
        <span class="si-txt"><b>مرور با فلش‌کارت</b><span>${d?fa(d)+' کارت موعددار':'انتخاب مجموعهٔ واژه‌ها'}</span></span>
        ${I('left',{size:18})}</button>
      <button class="sheet-item" data-act="fcstart" data-deck="all">
        <span class="si-ico">${I('play',{size:20})}</span>
        <span class="si-txt"><b>شروع سریع مرور</b><span>${fa(DB.settings.limit)} کارت از کل کتاب</span></span>
        ${I('left',{size:18})}</button>
      <button class="sheet-item" data-act="quiz" data-q="quick">
        <span class="si-ico">${I('zap',{size:22})}</span>
        <span class="si-txt"><b>آزمون سریع</b><span>۱۰ پرسش تصادفی از همهٔ درس‌ها</span></span>
        ${I('left',{size:18})}</button>
      <button class="sheet-item" data-act="sheetgo" data-h="#/review/fav">
        <span class="si-ico">${I('star',{size:20})}</span>
        <span class="si-txt"><b>نشان‌شده‌ها</b><span>${fa(DB.fav.length)} مورد نشان‌شده</span></span>
        ${I('left',{size:18})}</button>
      <button class="sheet-item" data-act="sheetgo" data-h="#/verbs">
        <span class="si-ico">${I('lang',{size:22})}</span>
        <span class="si-txt"><b>جدول فعل‌ها</b><span>${fa(V.length)} فعل با صرف کامل</span></span>
        ${I('left',{size:18})}</button>`);
    return;}
  if(a==='sheetgo'){window.UI.closeSheet();go(b.dataset.h);return;}
  if(a==='fav'){e.stopPropagation();const k=b.dataset.k,i=DB.fav.indexOf(k);if(i>=0)DB.fav.splice(i,1);else DB.fav.push(k);save();
    const on=DB.fav.indexOf(k)>=0;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));
    b.setAttribute('aria-label',on?'حذف از نشان‌شده‌ها':'افزودن به نشان‌شده‌ها');
    b.innerHTML=I('star',{size:18,fill:on});window.UI.haptic(8);
    toast(on?'به نشان‌شده‌ها اضافه شد':'از نشان‌شده‌ها حذف شد');return;}
  if(a==='reveal'){if(b.classList.contains('mask'))b.classList.toggle('reveal');return;}
  if(a==='revealrow'){const r=b.closest('.vrow');if(r&&r.classList.contains('mask'))r.classList.toggle('reveal');return;}
  if(a==='tgjoin'){window.Community.close();window.Community.join();render();toast('اگر تلگرام نصب است، گروه باز می‌شود.');return;}
  if(a==='tglater'){window.Community.close();window.Community.later();render();return;}
  if(a==='tgnever'){window.Community.close();window.Community.never();render();return;}
  if(a==='tgopen'){window.Community.open();return;}
  if(a==='tgreset'){window.Community.reset();render();toast('پیشنهاد عضویت دوباره نشان داده می‌شود.');return;}
  if(a==='spreset'){if(!confirm('آمار املا صفر شود؟'))return;window.Spelling.reset();save();render();toast('آمار املا صفر شد.');return;}
  if(a==='adfree'){
    if(!window.Ads.present){toast('تبلیغ در این نسخه فعال نیست.');return;}
    toast('ویدیو در حال آماده‌سازی…');
    window.Ads.rewarded(ok=>{toast(ok?'۲۴ ساعت بدون تبلیغ فعال شد.':'ویدیو کامل دیده نشد.');render();});
    return;}
  if(a==='adnative'){window.Ads.setPref('native',!window.Ads.pref('native'));render();return;}
  if(a==='adbanner'){window.Ads.setPref('banner',!window.Ads.pref('banner'));render();return;}
  if(a==='adinter'){window.Ads.setPref('interstitial',!window.Ads.pref('interstitial'));render();return;}
  if(a==='adtest'){const r=window.Ads.test();const msg={noBridge:'فقط در اپ اندروید',noSdk:'کتابخانهٔ تپسل در این بیلد نیست',requested:'درخواست فرستاده شد؛ اگر تبلیغی نبود، تپسل موجودی ندارد',error:'خطا در درخواست'}[r]||r;toast(msg);setTimeout(()=>{if(location.hash.indexOf('#/settings')===0)render();},1200);return;}
  if(a==='adprivacy'){window.UI.openSheet(`<h3 class="sec-title">حریم خصوصی تبلیغات</h3><div class="card small">
      پیشرفت درسی، واژه‌ها و نمره‌های تو <b>هرگز</b> به شبکهٔ تبلیغاتی فرستاده نمی‌شود؛ فقط روی همین دستگاه می‌ماند.
      <br><br>برای نمایش تبلیغ، شبکهٔ تبلیغاتی (تپسل) ممکن است <b>شناسهٔ تبلیغاتی دستگاه</b>، مدل گوشی و وضعیت اتصال را ببیند
      تا تبلیغ مرتبط‌تری نشان دهد. می‌توانی هر سه نوع تبلیغ را از همین‌جا خاموش کنی،
      یا با دیدن یک ویدیو ۲۴ ساعت کاملاً بدون تبلیغ مطالعه کنی.
      <br><br>در تنظیمات اندروید هم می‌توانی شناسهٔ تبلیغاتی را بازنشانی یا حذف کنی.</div>`);return;}
  if(a==='rate'){window.Bazaar.rate();return;}
  if(a==='spfilter'){spCfg().filter=b.dataset.v;save();render();return;}
  if(a==='spcount'){spCfg().count=+b.dataset.v;save();render();return;}
  if(a==='spmode'){spCfg().mode=b.dataset.v;save();render();return;}
  if(a==='spaccent'){spCfg().accentStrict=!spCfg().accentStrict;save();render();return;}
  if(a==='spstart'){spStart(b.dataset.l);return;}
  if(a==='spquit'){SP=null;render();return;}
  if(a==='spagain'){const lid=SP?SP.lesson:null;SP=null;spStart(lid);return;}
  if(a==='spretry'){const ms=(SP&&SP.missed||[]).slice();const lid=SP?SP.lesson:null;SP=null;spStart(lid,ms);return;}
  if(a==='spslow'){TTS.say(b.dataset.say,{rate:0.6});return;}
  if(a==='spkey'||a==='spikey'){
    const inp=a==='spkey'?$('#spAns'):document.querySelector('.sp-inline input');
    if(inp&&inp.tagName==='INPUT'){const s0=inp.selectionStart||inp.value.length;
      inp.value=inp.value.slice(0,s0)+b.dataset.k+inp.value.slice(s0);
      inp.focus();try{inp.setSelectionRange(s0+1,s0+1);}catch(e){}
      if(a==='spkey'&&SP)SP.answer=inp.value;}
    return;}
  if(a==='sptile'){
    if(!SP)return;const i=+b.dataset.i;SP.used=SP.used||[];
    if(SP.used.indexOf(i)<0){SP.used.push(i);SP.answer=(SP.answer||'')+SP.tiles[i];render();}
    return;}
  if(a==='spback'){if(!SP)return;SP.used=(SP.used||[]).slice(0,-1);SP.answer=(SP.answer||'').slice(0,-1);render();return;}
  if(a==='spclear'){if(!SP)return;SP.used=[];SP.answer='';render();return;}
  if(a==='sphint'){if(!SP||SP.revealed)return;SP.hintLevel=Math.min(3,(SP.hintLevel||0)+1);SP.hints++;render();return;}
  if(a==='spskip'){if(!SP)return;SP.answer='';spGrade();return;}
  if(a==='spcheck'){if(!SP||SP.revealed)return;
    const el=$('#spAns');if(el&&el.tagName==='INPUT')SP.answer=el.value;
    spGrade();return;}
  if(a==='spnext'){if(!SP)return;
    SP.i++;SP.answer='';SP.hintLevel=0;SP.revealed=false;SP.grade=null;SP.tiles=null;SP.used=[];
    if(SP.i>=SP.items.length){SP.done=true;render();return;}
    render();setTimeout(()=>{if(SP&&SP.cur&&!SP.done)TTS.say(SP.cur.w);},220);return;}
  if(a==='spclose'){$$('.sp-inline').forEach(e=>e.remove());$$('.vrow.sw-open').forEach(e=>e.classList.remove('sw-open'));return;}
  if(a==='spicheck'){
    const box=b.closest('.sp-inline');if(!box)return;
    const inp=box.querySelector('input'),out=box.querySelector('.sp-iresult');
    const g=window.Spelling.grade(inp.value,inp.dataset.w,{accentStrict:spCfg().accentStrict});
    window.Spelling.record(inp.dataset.k,g.ok,0);
    out.innerHTML=`<div class="sp-verdict ${g.ok?'ok':(g.near?'near':'bad')}">
      <b>${g.ok?'درست بود':(g.reason==='empty'?'چیزی ننوشتی':(g.near?'نزدیک بود':'درست نبود'))}</b>
      <div class="sp-correct it" dir="ltr">${esc(inp.dataset.w)}</div></div>`;
    inp.classList.toggle('ok',g.ok);inp.classList.toggle('bad',!g.ok);
    if(g.ok)TTS.say(inp.dataset.w);
    return;}
  if(a==='mask'){$$('#vwrap .vrow').forEach(r=>{r.classList.toggle('mask');r.classList.remove('reveal');});toast('حالت تمرین: معنی‌ها تار شد؛ برای دیدن، روی هر واژه بزن.');return;}
  if(a==='sayline'){
    const d=findDlg(b.dataset.d);if(!d)return;
    $$('.line.playing').forEach(x=>x.classList.remove('playing'));b.classList.add('playing');
    TTS.say(d.lines[+b.dataset.i][1],{onend:()=>b.classList.remove('playing')});
    DB.seen[d.id]=1;save();return;
  }
  if(a==='play'||a==='slow'){
    const d=findDlg(b.dataset.d);if(!d)return;
    const box=$('#dlg-'+d.id),lines=$$('.line',box);
    DB.seen[d.id]=1;save();
    const step=i=>{lines.forEach(x=>x.classList.remove('playing'));if(lines[i]){lines[i].classList.add('playing');lines[i].scrollIntoView({block:'nearest',behavior:'smooth'});}};
    TTS.seq(d.lines.map(x=>x[1]),step,null,a==='slow'?0.65:DB.settings.rate);
    return;
  }
  if(a==='tr'){const box=$('#dlg-'+b.dataset.d);$('.dlg-body',box).classList.toggle('hide-tr');return;}
  if(a==='quiz'){window.UI.closeSheet();window.UI.haptic(10);startQuiz(b.dataset.q);return;}
  if(a==='mc'){if(QZ.ans)return;const i=+b.dataset.i;QZ.cur.pick=i;QZ.cur.good=(i===QZ.cur.q.a);QZ.ans=true;if(QZ.cur.good)QZ.ok++;repaint(vQuiz());return;}
  if(a==='fillcheck'){checkFill();return;}
  if(a==='tok'){const C=QZ.cur,i=+b.dataset.i;if(C.used[i])return;C.used[i]=true;C.sel.push(i);repaint(vQuiz());return;}
  if(a==='untok'){const C=QZ.cur,si=+b.dataset.i,ti=C.sel[si];C.sel.splice(si,1);C.used[ti]=false;repaint(vQuiz());return;}
  if(a==='ordercheck'){if(!QZ.cur.sel.length){toast('اول کلمه‌ها را انتخاب کن');return;}checkOrder();return;}
  if(a==='orderreset'){QZ.cur.sel=[];QZ.cur.used=QZ.cur.tokens.map(()=>false);repaint(vQuiz());return;}
  if(a==='match'){
    const C=QZ.cur,s=b.dataset.s,i=+b.dataset.i;
    if(C.matched.indexOf(i)>=0)return;
    if(!C.pick){C.pick={s:s,i:i};}
    else if(C.pick.s===s){C.pick={s:s,i:i};}
    else{
      if(C.pick.i===i){C.matched.push(i);C.pick=null;
        if(C.matched.length===C.q.pairs.length){C.good=C.err===0;QZ.ans=true;if(C.err<=1)QZ.ok++;}
      }else{C.err++;C.pick=null;toast('این دو جور نبودند؛ دوباره امتحان کن');}
    }
    repaint(vQuiz());return;
  }
  if(a==='qnext'){QZ.i++;QZ.ans=false;QZ.cur=null;repaint(vQuiz());window.scrollTo(0,0);return;}
  if(a==='fcstart'){
    window.UI.closeSheet();window.UI.haptic(10);
    const sel=b.dataset.deck||'all';
    const mode=b.dataset.mode||'';
    let q=buildQueue(sel);
    if(mode==='new')q=shuffle(deckWords(sel).filter(w=>!DB.srs[w.k]));
    if(mode==='todo')q=shuffle(deckWords(sel).filter(w=>!isDone(w.k)));
    if(mode==='done')q=shuffle(deckWords(sel).filter(w=>isDone(w.k)));
    if(mode==='advanced')q=advancedQueue(sel);
    if(!q.length){toast('کارتی در این مجموعه نیست.');return;}
    const rd=(DB.settings.review&&DB.settings.review.dir)||'it';
    const dir={};
    if(rd==='mix')q.forEach((w,i)=>{dir[w.k]=(hashStr(w.k)%2===0)?'it':'fa';});
    FC={sel:sel,q:q,i:0,flip:false,ok:0,mid:0,no:0,dir:dir,auto:mode==='advanced'&&DB.settings.review.auto};
    touchDay();go('#/fc');return;
  }
  if(a==='tick'){
    e.stopPropagation();toggleDone(b.dataset.k);window.UI.haptic(8);
    toast(isDone(b.dataset.k)?'تیک یادگیری خورد':'تیک برداشته شد');
    render();return;
  }
  if(a==='sbpick'){
    const i=+b.dataset.i,it=SB.bank[i];
    if(it.used)return;
    it.used=true;SB.built.push({t:it.t,bi:i});window.UI.haptic(5);
    repaint(vLesson(SB.id,'build'));return;
  }
  if(a==='sbun'){
    const i=+b.dataset.i,rm=SB.built.splice(i,1)[0];
    if(rm)SB.bank[rm.bi].used=false;
    repaint(vLesson(SB.id,'build'));return;
  }
  if(a==='sbclear'){SB.built.forEach(x=>SB.bank[x.bi].used=false);SB.built=[];repaint(vLesson(SB.id,'build'));return;}
  if(a==='sbcheck'){
    const got=SB.built.map(x=>x.t).join(' ');
    const want=SB.cur.tokens.join(' ');
    const norm=t=>t.replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
    if(norm(got)===norm(want)){SB.state='ok';SB.ok++;SB.streak++;SB.best=Math.max(SB.best,SB.streak);
      window.UI.haptic(12);TTS.say(SB.cur.it);}
    else{SB.state='no';SB.no++;SB.streak=0;window.UI.haptic(24);}
    touchDay();repaint(vLesson(SB.id,'build'));return;
  }
  if(a==='sbnext'||a==='sbskip'){
    if(a==='sbskip')SB.streak=0;
    sbNext();repaint(vLesson(SB.id,'build'));window.scrollTo(0,0);return;
  }
  if(a==='flip'){FC.flip=!FC.flip;window.UI.haptic(6);repaint(vFC());return;}
  if(a==='fcg'){
    const g=+b.dataset.g,w=FC.q[FC.i];grade(w.k,g);window.UI.haptic(g===2?10:g===1?14:20);
    if(g===0)FC.no++;else if(g===1)FC.mid++;else FC.ok++;
    FC.i++;FC.flip=false;repaint(vFC());return;
  }
  if(a==='rvset'){DB.settings.review[b.dataset.g]=b.dataset.v;save();render();return;}
  if(a==='rvauto'){DB.settings.review.auto=!DB.settings.review.auto;save();render();return;}
  if(a==='setengine'){DB.settings.engine=b.dataset.v;save();render();
    if(b.dataset.v==='google'&&window.NativeTTS&&!window.NativeTTS.available)toast('موتور آماده نیست؛ اول صدای ایتالیایی را دانلود کن.');
    return;}
  if(a==='ttsdata'){if(!window.NativeTTS.installVoiceData())toast('صفحهٔ دانلود باز نشد؛ دستی به تنظیمات گفتار برو.');return;}
  if(a==='ttssettings'){if(!window.NativeTTS.openTtsSettings())toast('تنظیمات گفتار دستگاه را دستی باز کن.');return;}
  if(a==='ttsinstall'){window.NativeTTS.openEngineInstall();return;}
  if(a==='stype'){go('#/search/'+encodeURIComponent(CUR.q||'')+'/'+b.dataset.t);return;}
  if(a==='sclear'){go('#/search');return;}
  if(a==='vopen'){const box=$('#vb-'+b.dataset.i);if(box)box.hidden=!box.hidden;return;}
  if(a==='settr'){DB.settings.tr=!DB.settings.tr;save();render();return;}
  if(a==='setrev'){DB.settings.rev=!DB.settings.rev;save();render();return;}
  if(a==='export'){
    const blob=new Blob([JSON.stringify(DB,null,1)],{type:'application/json'});
    const u=URL.createObjectURL(blob),a2=document.createElement('a');
    a2.href=u;a2.download='espresso-a1-backup.json';a2.click();setTimeout(()=>URL.revokeObjectURL(u),1500);
    toast('فایل پشتیبان دانلود شد');return;
  }
  if(a==='install'){window.EspressoApp.install();return;}
  if(a==='reset'){
    if(confirm('همهٔ پیشرفت، کارت‌ها و نمره‌ها پاک شود؟')){DB=JSON.parse(JSON.stringify(DEF));save();applySettings();go('#/home');toast('پیشرفت صفر شد');}
    return;
  }
});
document.addEventListener('input',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const a=b.dataset.act;
  if(a==='fs'){DB.settings.fs=+b.value;applySettings();save();const l=b.closest('.setrow').querySelector('.lbl span');if(l)l.textContent=fa(b.value)+' پیکسل';}
  if(a==='rate'){DB.settings.rate=+b.value;save();const l=b.closest('.setrow').querySelector('.lbl span');if(l)l.textContent=(+b.value).toFixed(2)+'×';}
  if(a==='limit'){DB.settings.limit=+b.value;save();const l=b.closest('.setrow').querySelector('.lbl span');if(l)l.textContent=fa(b.value)+' کارت';}
});
document.addEventListener('change',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  if(b.dataset.act==='voice'){DB.settings.voice=b.value;save();TTS.init();TTS.say('Buongiorno! Studio italiano.');}
  if(b.dataset.act==='nvoice'){DB.settings.nvoice=b.value;save();window.NativeTTS.setVoice(b.value);TTS.say('Buongiorno! Studio italiano.');}
  if(b.dataset.act==='nengine'){window.NativeTTS.setEngine(b.value);toast('موتور عوض شد؛ چند لحظه صبر کن.');setTimeout(()=>render(),1200);}
});
$('#stopAudio').addEventListener('click',()=>TTS.stop());
function findDlg(id){for(const l of L){const d=l.dialogs.find(x=>x.id===id);if(d)return d;}return null;}
function importData(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{const o=JSON.parse(r.result);if(!o.srs)throw 0;DB=Object.assign({},DEF,o);DB.settings=Object.assign({},DEF.settings,o.settings||{});save();applySettings();render();toast('پیشرفت بازیابی شد');}catch(x){toast('فایل معتبر نبود');}};
  r.readAsText(f);
}
const mqDark=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
function resolveTheme(){
  const t=DB.settings.theme;
  if(t==='auto')return (mqDark&&mqDark.matches)?'dark':'light';
  return t==='dark'?'dark':'light';
}
function applySettings(){
  const th=resolveTheme();
  document.documentElement.dataset.theme=th;
  document.documentElement.dataset.motion=DB.settings.motion==='off'?'off':'on';
  document.documentElement.dataset.haptics=DB.settings.haptics==='off'?'off':'on';
  document.documentElement.style.setProperty('--fs',DB.settings.fs+'px');
  document.documentElement.style.colorScheme=th;
  const m=document.querySelector('meta[name=theme-color]');
  if(m)m.content=th==='dark'?'#150f0c':'#f4ece1';
  if(window.UI)window.UI.measure();
}
if(mqDark&&mqDark.addEventListener)mqDark.addEventListener('change',()=>{if(DB.settings.theme==='auto'){applySettings();render();}});

/* ---------- boot ---------- */
applySettings();TTS.init();
window.addEventListener('hashchange',render);
render();
if(window.Ads)window.Ads.init();
if(window.Community)window.Community.schedule(()=>{
  const h=location.hash;
  if(!h||h==='#/home'||h==='#/'||h==='#/lessons')render();
});
/* inside the Android app, bind the device speech engine (Google TTS) */
if(window.NativeTTS&&window.NativeTTS.present){
  window.NativeTTS.init();
  window.NativeTTS.onChange(()=>{if(location.hash.indexOf('#/settings')===0)render();});
}
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}
/* Keep native ad views aligned with their in-page slots while scrolling. */
(function(){
  var queued=false;
  function sync(){queued=false;if(window.Ads)window.Ads.syncSlots();}
  function schedule(){if(queued)return;queued=true;
    (window.requestAnimationFrame||function(f){setTimeout(f,16);})(sync);}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.__adsSync=schedule;
})();

/* settings: live search + smooth anchor jumps */
document.addEventListener('input',e=>{
  if(e.target&&e.target.id==='setQ')settingsFilter(e.target.value);
});
document.addEventListener('click',e=>{
  const a=e.target.closest&&e.target.closest('[data-jump]');
  if(!a)return;
  e.preventDefault();
  const g=document.getElementById('sg-'+a.dataset.jump);
  if(g){g.open=true;g.scrollIntoView({behavior:'smooth',block:'start'});}
});

/* Enter checks the answer instead of submitting a form */
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  const t=e.target;
  if(t&&t.id==='spAns'){e.preventDefault();
    if(SP&&SP.revealed){const b=document.querySelector('[data-act="spnext"]');if(b)b.click();}
    else{if(SP&&t.tagName==='INPUT')SP.answer=t.value;const b=document.querySelector('[data-act="spcheck"]');if(b)b.click();}}
  else if(t&&t.closest&&t.closest('.sp-inline')){e.preventDefault();
    const b=t.closest('.sp-inline').querySelector('[data-act="spicheck"]');if(b)b.click();}
});

/* swipe a vocabulary row to the left -> inline spelling practice.
   Pointer events cover touch, pen and mouse; a horizontal intent guard keeps
   vertical scrolling untouched, and RTL means "left" is the forward direction. */
(function(){
  let sx=0,sy=0,row=null,armed=false,decided=false;
  const THRESH=56;
  document.addEventListener('pointerdown',e=>{
    const r=e.target.closest&&e.target.closest('.vrow.swipeable');
    if(!r||e.target.closest('button,input,a')){row=null;return;}
    row=r;sx=e.clientX;sy=e.clientY;armed=true;decided=false;
  },{passive:true});
  document.addEventListener('pointermove',e=>{
    if(!armed||!row)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!decided){
      if(Math.abs(dx)<10&&Math.abs(dy)<10)return;
      decided=true;
      if(Math.abs(dy)>Math.abs(dx)){armed=false;row.classList.remove('sw-peek');return;}
    }
    if(dx<0){row.classList.add('sw-peek');
      row.style.setProperty('--sw',Math.min(1,-dx/THRESH).toFixed(2));}
  },{passive:true});
  const finish=e=>{
    if(!armed||!row){row=null;return;}
    const dx=(e.clientX!=null?e.clientX:sx)-sx;
    const r=row;row=null;armed=false;
    r.classList.remove('sw-peek');r.style.removeProperty('--sw');
    if(dx<-THRESH){if(window.UI)window.UI.haptic(8);spInline(r);}
  };
  document.addEventListener('pointerup',finish,{passive:true});
  document.addEventListener('pointercancel',()=>{if(row){row.classList.remove('sw-peek');row.style.removeProperty('--sw');}row=null;armed=false;},{passive:true});
})();

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._ip=e;});
window.EspressoApp={sb:()=>SB?{it:SB.cur.it,tokens:SB.cur.tokens.slice(),ok:SB.ok,no:SB.no}:null,say:t=>TTS.say(t),install:()=>{if(isStandalone()){toast('اپ از قبل نصب شده است');return;}if(window._ip){window._ip.prompt();return;}if(isIOS()){iosSheet();return;}toast('از منوی مرورگر گزینهٔ «افزودن به صفحهٔ اصلی» را بزن.');},db:()=>DB};
})();
