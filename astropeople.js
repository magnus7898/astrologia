/* ============================================================
   astropeople.js — „ჩემი ადამიანები“ (astro.html)
   ------------------------------------------------------------
   Your chart + up to 10 difficult and 10 good people.
   Positions are computed in the browser (search.js → _search.lon),
   your houses / ASC / MC come from the backend when the natal form
   has a city. Without a birth time a person's Moon is left out
   (it moves ~13° a day).

   Looks for what repeats inside each group, against the chance
   level of that contact:
     • their planet → aspect family → your point
       (☌ შეერთება · □☍ დაძაბული · △⚹ ჰარმონიული)
     • their Sun / Moon / Venus / Mars signs
     • which of YOUR houses their planets fall in
   Generational pairs (their Uranus/Neptune/Pluto ↔ yours) are
   skipped — everyone of an age shares them.

   Needs people_core.js and search.js. Adds a tab: setMode('people').
   ============================================================ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const BODIES=[['sun','მზე','☉'],['moon','მთვარე','☽'],['mercury','მერკური','☿'],['venus','ვენერა','♀'],['mars','მარსი','♂'],
  ['jupiter','იუპიტერი','♃'],['saturn','სატურნი','♄'],['uranus','ურანი','♅'],['neptune','ნეპტუნი','♆'],['pluto','პლუტონი','♇'],
  ['node','ჩრდ. კვანძი','☊'],['chiron','ქირონი','⚷']];
const NAME={},GL={};BODIES.forEach(([k,n,g])=>{NAME[k]=n;GL[k]=g;});
NAME.asc='ASC (ასცენდენტი)';GL.asc='AC';NAME.mc='MC (ზენიტი)';GL.mc='MC';
const THEME={sun:'ნება, ეგო',moon:'ემოციები, უსაფრთხოება',mercury:'აზრი, საუბარი',venus:'სიყვარული, ღირებულებები',mars:'მოქმედება, ბრაზი',
  jupiter:'ზრდა, რწმენა',saturn:'შეზღუდვა, კონტროლი, მოვალეობა',uranus:'მოულოდნელობა, თავისუფლება',neptune:'ილუზია, ბუნდოვანება, იდეალი',
  pluto:'ძალაუფლება, ტრანსფორმაცია',node:'კარმული კავშირი',chiron:'ჭრილობა და განკურნება',asc:'როგორ ჩანხარ, სხეული',mc:'კარიერა, სტატუსი'};
const OUTER=new Set(['uranus','neptune','pluto']);
const PERSONAL=new Set(['sun','moon','mercury','venus','mars','asc','mc']);
const SIGNS=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
/* aspect families with synastry orbs; base = chance a random pair is in it */
const ASP=[{a:0,orb:6,f:'conj'},{a:180,orb:6,f:'hard'},{a:90,orb:5,f:'hard'},{a:270,orb:5,f:'hard'},
  {a:120,orb:5,f:'soft'},{a:240,orb:5,f:'soft'},{a:60,orb:4,f:'soft'},{a:300,orb:4,f:'soft'}];
const FAM={conj:{t:'შეერთება',s:'☌',tag:'mir',base:12/360},hard:{t:'დაძაბული',s:'□☍',tag:'trig',base:(12+20)/360},soft:{t:'ჰარმონიული',s:'△⚹',tag:'res',base:(20+16)/360}};
const ASPSYM={0:'☌',180:'☍',90:'□',270:'□',120:'△',240:'△',60:'⚹',300:'⚹'};

const norm=x=>((x%360)+360)%360;
function aspect(a,b){
  const d=norm(b-a);let best=null;
  for(const x of ASP){let e=Math.abs(d-x.a);if(e>180)e=360-e;if(e<=x.orb&&(!best||e<best.orb))best={f:x.f,orb:e,sym:ASPSYM[x.a]};}
  return best;
}
function tz(){const v=$('n-tz')&&$('n-tz').value;return v&&v!=='UTC'?v:(Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC');}
function positions(p,zone){
  const S=window._search,jd=PeopleUI.localJD(p.y,p.m,p.d,p.h,p.mi,zone);
  const o={};for(const [k] of BODIES){if(k==='moon'&&!p.timeKnown)continue;const v=S.lon(k,jd);if(isFinite(v))o[k]=v;}
  return o;
}
function houseOf(deg,cusps){
  for(let i=0;i<12;i++){const s=cusps[i],e=cusps[(i+1)%12],span=norm(e-s),dist=norm(deg-s);if(dist<span)return i+1;}
  return 1;
}

async function myChart(me){
  const pos=positions(me,tz());
  let cusps=null;
  const lat=+($('n-lat')&&$('n-lat').value),lon=+($('n-lon')&&$('n-lon').value);
  if(me.timeKnown&&lat&&lon&&typeof fetchChart==='function'){
    try{const d=await fetchChart({year:me.y,month:me.m,day:me.d,hour:me.h,minute:me.mi,second:0,lat,lon,tz_name:$('n-tz').value||'UTC',time_unknown:false});
      if(Array.isArray(d.houses)&&d.houses.length===12)cusps=d.houses.map(Number);
      if(d.asc!=null)pos.asc=+d.asc;if(d.mc!=null)pos.mc=+d.mc;}catch(e){console.warn('people: my houses',e);}
  }
  return{pos,cusps};
}

function contacts(their,mine){
  const out=[];
  for(const a in their)for(const b in mine){
    if(OUTER.has(a)&&OUTER.has(b))continue;
    if(a==='node'&&b==='node')continue;
    const x=aspect(their[a],mine[b]);if(x)out.push({a,b,...x});
  }
  return out.sort((p,q)=>p.orb-q.orb);
}
const lbl=k=>`${GL[k]} ${NAME[k]}`;

async function onRun(me,people){
  if(!window._search||!window._search.lon)throw new Error('search.js ვერ ჩაიტვირთა');
  const M=await myChart(me);
  const zone=tz();
  for(const p of people){p.pos=positions(p,zone);p.cx=contacts(p.pos,M.pos);}

  /* chance level = random birth moments from the SAME years as your people
     (slow planets cluster by generation, so a fixed 1/12 or orb/360 would
     overstate them). 1200 samples, seeded → same result every run. */
  const ys=people.map(p=>p.y),y0=Math.min(...ys)-1,y1=Math.max(...ys)+1;
  let seed=(y0*7919+y1)>>>0;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const SAMP=[];
  for(let i=0;i<1200;i++){
    const jd=PeopleUI.localJD(y0,1,1,0,0,'UTC')+rnd()*(PeopleUI.localJD(y1+1,1,1,0,0,'UTC')-PeopleUI.localJD(y0,1,1,0,0,'UTC'));
    const pos={};for(const [k] of BODIES){const v=window._search.lon(k,jd);if(isFinite(v))pos[k]=v;}
    SAMP.push({pos,cx:contacts(pos,M.pos)});
  }
  const sampBase=fn=>{const c=new Map();for(const q of SAMP)for(const k of fn(q))c.set(k,(c.get(k)||0)+1);
    return k=>Math.max(c.get(k)||0,0.5)/SAMP.length;};

  /* ── 1. contacts that repeat ── */
  const items=p=>new Set(p.cx.map(c=>`${c.a}|${c.f}|${c.b}`));
  const st=PeopleUI.groupStats(people,items,sampBase(items));
  const cLabel=k=>{const [a,f,b]=k.split('|');return `მათი ${lbl(a)} <span class="pq-tag ${FAM[f].tag}">${FAM[f].s} ${FAM[f].t}</span> შენს ${lbl(b)}`;};
  const sent=(r,which)=>{
    const [a,f,b]=r.k.split('|'),c=which==='bad'?r.b:r.g,n=which==='bad'?st.B.length:st.G.length,l=which==='bad'?r.bl:r.gl;
    const mean=f==='hard'?'დაძაბულობა':f==='soft'?'ჰარმონია':'შერწყმა, ძლიერი გავლენა';
    return `<p>${cLabel(r.k)} — <b>${c}/${n}</b>, შემთხვევითზე ${l.toFixed(1)}×.<br><span class="pq-note">${mean}: მათი „${THEME[a]}“ ↔ შენი „${THEME[b]}“.</span></p>`;
  };

  /* ── 2. signs ── */
  const SIGNP=['sun','moon','venus','mars'];
  const sItems=p=>new Set(SIGNP.filter(k=>p.pos[k]!=null).map(k=>`${k}|${Math.floor(p.pos[k]/30)}`));
  const sst=PeopleUI.groupStats(people,sItems,sampBase(q=>new Set(SIGNP.filter(k=>q.pos[k]!=null).map(k=>`${k}|${Math.floor(q.pos[k]/30)}`))));
  const sLabel=k=>{const [b,s]=k.split('|');return `${GL[b]} ${NAME[b]} — ${ZS[+s]} ${SIGNS[+s]}`;};
  const mySign=k=>{const [b,s]=k.split('|');const hits=Object.keys(M.pos).filter(x=>Math.floor(M.pos[x]/30)===+s);
    return hits.length?hits.map(x=>`<span class="pq-tag neu">${GL[x]} ${NAME[x]}</span>`).join(''):'<span class="pq-dim">—</span>';};

  /* ── 3. your houses ── */
  let hst=null;
  const HP=['sun','moon','venus','mars','jupiter','saturn'];
  if(M.cusps){
    const hItems=p=>new Set(HP.filter(k=>p.pos[k]!=null).map(k=>`${k}|${houseOf(p.pos[k],M.cusps)}`));
    hst=PeopleUI.groupStats(people,hItems,sampBase(hItems));
  }
  const HOUSE=['','I · მე, სხეული','II · ფული, ღირებულებები','III · საუბარი, ახლობლები','IV · სახლი, ოჯახი','V · სიყვარული, შემოქმედება','VI · სამუშაო, ჯანმრთელობა',
    'VII · პარტნიორი','VIII · კრიზისი, სხვისი რესურსი','IX · მსოფლმხედველობა','X · კარიერა','XI · მეგობრები','XII · ფარული, დანაკარგი'];
  const hLabel=k=>{const [b,h]=k.split('|');return `${GL[b]} მათი ${NAME[b]} → შენი ${HOUSE[+h]}`;};

  /* ── summary ── */
  const top=(s,w,lab,fn)=>{
    const t=w==='bad'?s.topBad:s.topGood,n=w==='bad'?s.B.length:s.G.length;
    return t.length?t.slice(0,5).map(r=>fn?fn(r,w):`<p>${lab(r.k)} — <b>${w==='bad'?r.b:r.g}/${n}</b>, ჩვეულებრივზე ${(w==='bad'?r.bl:r.gl).toFixed(1)}×</p>`).join(''):PeopleUI.fewNote(n);
  };
  let sum='';
  for(const w of ['bad','good']){
    const n=w==='bad'?st.B.length:st.G.length;if(!n)continue;
    sum+=`<div class="pq-gh ${w}">${w==='bad'?'✕ რთული':'✓ კარგი'} ადამიანები (${n}) — მეორდება</div>`+top(st,w,cLabel,sent);
    const ss=(w==='bad'?sst.topBad:sst.topGood).slice(0,3),hs=hst?(w==='bad'?hst.topBad:hst.topGood).slice(0,3):[];
    if(ss.length)sum+=`<p class="pq-note">ნიშნები: ${ss.map(r=>sLabel(r.k)+` (${w==='bad'?r.b:r.g})`).join(' · ')}</p>`;
    if(hs.length)sum+=`<p class="pq-note">შენს სახლებში: ${hs.map(r=>hLabel(r.k)+` (${w==='bad'?r.b:r.g})`).join(' · ')}</p>`;
  }
  const meNote=`<p class="pq-note">შენი რუქა: ${Object.keys(M.pos).map(k=>`${GL[k]} ${Math.floor(norm(M.pos[k])%30)}° ${ZS[Math.floor(norm(M.pos[k])/30)]}`).join(' · ')}
    ${M.cusps?'':'<br>⚠ სახლები და ASC/MC არ ჩანს — ჩაწერე შენი დრო და ნატალურ ფორმაში შენი ქალაქი.'}${me.timeKnown?'':'<br>⚠ შენი დრო უცნობია — მთვარე გამოტოვებულია.'}</p>`;

  /* ── per person ── */
  const personal=c=>PERSONAL.has(c.b);
  const pcard=p=>{
    const cx=p.cx.filter(personal),w=c=>(c.b==='sun'||c.b==='moon'||c.b==='asc'?2:1);
    const soft=cx.filter(c=>c.f==='soft').reduce((s,c)=>s+w(c),0),hard=cx.filter(c=>c.f==='hard').reduce((s,c)=>s+w(c),0);
    const line=c=>`<span class="pq-tag ${FAM[c.f].tag}">${GL[c.a]} ${c.sym} ${GL[c.b]}</span>`;
    return `<div class="pq-pc"><div class="hd"><span><span class="pq-dot" style="background:${p.g==='bad'?'#e06b6b':'#4ea38c'}"></span><b>${PeopleUI.esc(p.name)}</b>
      <span class="pq-dim"> ${PeopleUI.pdate(p)}</span></span>
      <span style="font-size:12px"><span class="pq-tag res">△ ${soft}</span><span class="pq-tag trig">□ ${hard}</span></span></div>
      <div class="ln">${cx.slice(0,10).map(c=>line(c)+`<span class="pq-dim">${c.orb.toFixed(1)}° </span>`).join(' ')||'<span class="pq-dim">შენს პირად წერტილებთან მჭიდრო ასპექტი არ არის</span>'}
      <br><span class="pq-dim">☉ ${ZS[Math.floor(p.pos.sun/30)]} ${SIGNS[Math.floor(p.pos.sun/30)]}${p.pos.moon!=null?` · ☽ ${ZS[Math.floor(p.pos.moon/30)]} ${SIGNS[Math.floor(p.pos.moon/30)]}`:' · ☽ ? (დრო უცნობია)'}
      · ♀ ${ZS[Math.floor(p.pos.venus/30)]} · ♂ ${ZS[Math.floor(p.pos.mars/30)]}</span></div></div>`;
  };
  const C=PeopleUI.card;
  return C('რას აჩვენებს',meNote+sum)+
    C('ასპექტები შენს რუქასთან',PeopleUI.groupTable(st,cLabel,null,'მათი პლანეტა → შენი წერტილი')+
      `<p class="pq-note" style="margin-top:8px">ორბი: ☌☍ 6° · □△ 5° · ⚹ 4°. „ჩვეულებრივ“ — რა წილს აქვს ეს ასპექტი შენთან იმავე წლებში დაბადებულ 1200 შემთხვევით რუქაში (თაობის ეფექტი გათვალისწინებულია). თაობის ასპექტები (♅♆♇ ↔ ♅♆♇) გამოტოვებულია.</p>`)+
    C('ნიშნები',PeopleUI.groupTable(sst,sLabel,mySign,'მათი პლანეტა ნიშანში'))+
    (hst?C('შენი სახლები',PeopleUI.groupTable(hst,hLabel,null,'მათი პლანეტა შენს სახლში')):'')+
    C('თითოეული ადამიანი',`<p class="pq-note">${PeopleUI.legendTags()} · ასპექტები შენს ☉☽☿♀♂ AC MC-სთან, მჭიდროდან; △ / □ — ჰარმონიული / დაძაბული (☉☽AC ორმაგად).</p>`+
      [...st.B,...st.G].map(pcard).join(''));
}

/* ── tab ── */
function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!bar||!card||!window.PeopleUI||!window._search||$('form-people'))return !!$('form-people');
  const b=document.createElement('button');b.className='tab-btn';b.id='pp-tab-btn';b.textContent='ჩემი ადამიანები';b.setAttribute('onclick',"setMode('people')");
  const after=document.querySelector(".tab-btn[onclick*=\"'synastry'\"]");
  if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);else bar.appendChild(b);
  const sec=document.createElement('div');sec.id='form-people';sec.className='form-section';
  card.appendChild(sec);
  PeopleUI.mount(sec,{key:'astro_people_v1',time:true,onRun,
    intro:`შეიყვანე ადამიანები, ვისთანაც გიჭირს, და ვისთანაც კარგად ხარ (თითოეულში მაქს. ${PeopleUI.MAX}). დრო თუ არ იცი — დატოვე ცარიელი.
      ჩანს, რომელი <b>ასპექტები შენს რუქასთან</b>, <b>ნიშნები</b> და <b>შენი სახლები</b> მეორდება თითო ჯგუფში და რამდენად ხშირად ჩვეულებრივზე.
      სია მხოლოდ ამ ბრაუზერში ინახება.`,
    meDefault:()=>{const v=id=>$(id)&&$(id).value;if(!v('n-day'))return null;
      return{d:v('n-day'),m:v('n-month'),y:v('n-year'),t:`${String(v('n-hour')||12).padStart(2,'0')}:${String(v('n-minute')||0).padStart(2,'0')}`};}});
  if(typeof window.setMode==='function'&&!window.setMode._pp){
    const o=window.setMode;
    const w=function(m){const r=o.apply(this,arguments);const on=m==='people';b.classList.toggle('active',on);
      if(on)document.querySelectorAll('.tab-btn').forEach(x=>{if(x!==b)x.classList.remove('active');});return r;};
    w._pp=true;window.setMode=w;
  }
  return true;
}
let tries=0;(function wait(){if(inject()||++tries>100)return;setTimeout(wait,100);})();
})();
