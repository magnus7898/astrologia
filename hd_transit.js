/* hd_transit.js — Human Design · ტრანზიტი
   Self-injecting tab for hd.html. Needs only, before </body>:
       <script src="hd_transit.js"></script>
   Backend: POST /api/hd_transit (hd_transit.py)

   Shows
     • natal + transit on one bodygraph (transit = blue)
     • channels opened right now: your hanging gate + transit body in the
       partner gate, and purely transit (collective) channels
     • the chart UNDER the transit (centers, type, authority) — conditioning
     • search by CHANNELS, GATES and PLANETS (one or several, mixed):
         – channel / gate  → when it is activated and by which body
         – planet alone    → its full gate-by-gate route in the period
         – planet + gate/channel → only the windows THAT planet makes
       plus a free-text search box ("20", "10-20", "მარსი, 34")
   The 88° rule is natal-only; transits are plain current positions.      */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const TCOL='#3A8DDE';
const BODY_KA={"Sun":"მზე","Earth":"დედამიწა","North Node":"ჩრდ. კვანძი","South Node":"სამხ. კვანძი",
  "Moon":"მთვარე","Mercury":"მერკური","Venus":"ვენერა","Mars":"მარსი","Jupiter":"იუპიტერი",
  "Saturn":"სატურნი","Uranus":"ურანი","Neptune":"ნეპტუნი","Pluto":"პლუტონი"};
const CKA=c=>(typeof CENTER_KA!=='undefined'&&CENTER_KA[c])||c;
const TKA=t=>(typeof TYPE_KA!=='undefined'&&TYPE_KA[t])||t;
let svgT=null,last=null,pkTab='ch';
const SEL=new Set();          /* 'c:10-20' / 'g:20' / 'p:Mars' — survives a recalculation */
const BODIES=["Sun","Earth","North Node","South Node","Moon","Mercury","Venus","Mars",
  "Jupiter","Saturn","Uranus","Neptune","Pluto"];
const BODY_EN={"Sun":"sun","Earth":"earth","North Node":"north node rahu","South Node":"south node ketu",
  "Moon":"moon","Mercury":"mercury","Venus":"venus","Mars":"mars","Jupiter":"jupiter","Saturn":"saturn",
  "Uranus":"uranus","Neptune":"neptune","Pluto":"pluto"};
const GL=b=>(typeof PLANET_GLYPH!=='undefined'&&PLANET_GLYPH[b])||'';
let ONLY_KEY=false;           /* planet route: only gates that matter for you */

/* ── CSS: transit colour on the bodygraph + panel bits ── */
function css(){
  let s='';
  for(let g=1;g<=64;g++){
    s+=`svg.tr-t-${g} [data-gate='${g}'].gate-line{fill:${TCOL}!important}`+
       `svg.tr-c-${g}.tr-c-${g} .gate-circle[data-gate='${g}']{fill:${TCOL}!important}`+
       `svg.tr-c-${g}.tr-c-${g} .gate-text[data-gate='${g}']{fill:#fff!important}`;
  }
  for(const c of ['Head','Ajna','Throat','G','Heart','SolarPlexus','Spleen','Sacral','Root']){
    const n=c==='SolarPlexus'?'Solar Plexus':c;
    s+=`svg.tr-nc-${c}.tr-nc-${c} .chakra[data-center='${n}']{stroke:${TCOL}!important;stroke-width:3px!important}`;
  }
  s+=`
#results-transit .tr-layout{display:grid;grid-template-columns:110px 110px 1fr 120px;gap:6px}
@media(max-width:820px){#results-transit .tr-layout{grid-template-columns:1fr 1fr}
  #results-transit #bodygraph-tr{grid-column:1/-1;order:-1}}
#bodygraph-tr{display:flex;align-items:center;justify-content:center}
#bodygraph-tr svg{width:100%;height:auto;max-height:780px;display:block}
.prow.trn .g,.prow.trn .gl .gate{color:${TCOL}}
.prow.trn .nm{color:#8fb8e8}
.ch-item.trc{border-left-color:${TCOL};background:rgba(58,141,222,.06)}
.ch-item.trc .pair{color:#9cc8f4}.ch-item.trc .ctag{color:${TCOL}}
.ch-item.trs{border-left-color:#5b6b7a;opacity:.85}
.tr-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin:14px 0}
.tr-note{font-size:.72rem;color:var(--ink-mid);line-height:1.6;margin:6px 0 2px}
.tr-ctrl{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.tr-ctrl button{background:var(--raised,#1a1424);color:var(--ink-mid);border:1px solid var(--border);
  border-radius:6px;padding:5px 10px;font-size:.7rem;font-family:inherit;cursor:pointer}
.tr-ctrl button.on{border-color:${TCOL};color:#cfe3fa;background:rgba(58,141,222,.12)}
.tr-ctrl .sp{flex:1}
.pk-grid{display:grid;gap:5px;margin-bottom:12px}
.pk-grid.ch{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.pk-grid.gt{grid-template-columns:repeat(auto-fill,minmax(46px,1fr))}
.pk{position:relative;background:var(--raised,#1a1424);border:1px solid var(--border);border-radius:5px;
  padding:5px 7px;cursor:pointer;color:var(--ink-mid);font-size:.68rem;line-height:1.3;text-align:left;font-family:inherit}
.pk b{color:var(--ink);font-weight:500;font-size:.78rem}
.pk.gt{text-align:center;padding:6px 2px}
.pk.nat{border-color:rgba(196,149,80,.55)} .pk.nat b{color:var(--gold-lt,#e8c47a)}
.pk.hang{border-left:3px solid rgba(196,149,80,.7)}
.pk.now::after{content:"";position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:${TCOL}}
.pk.sel{outline:2px solid ${TCOL};outline-offset:-1px;background:rgba(58,141,222,.14);color:#cfe3fa}
.pk-key{display:flex;gap:14px;flex-wrap:wrap;font-size:.64rem;color:var(--ink-dim);margin:-4px 0 12px}
.pk-key i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;vertical-align:-1px}
.rb{border:1px solid var(--border);border-radius:6px;margin-bottom:10px;overflow:hidden}
.rb-h{display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:8px 12px;background:rgba(58,141,222,.07);
  font-family:'Cinzel',serif;font-size:.66rem;letter-spacing:.08em;color:#cfe3fa}
.rb-h small{font-family:inherit;letter-spacing:0;color:var(--ink-dim);font-size:.66rem}
.rb-x{background:none;border:none;color:var(--ink-dim);cursor:pointer;font-size:.9rem}
.tw{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:6px 12px;
  border-top:1px solid rgba(255,255,255,.04);font-size:.74rem}
.tw:hover{background:rgba(58,141,222,.05)}
.tw .when{color:var(--ink)}.tw .sub{color:var(--ink-dim);font-size:.67rem}
.tw .who{color:#9cc8f4}
.tw .nowb{display:inline-block;background:${TCOL};color:#fff;border-radius:3px;padding:0 5px;font-size:.6rem;margin-left:5px}
.tw .eye{background:none;border:1px solid var(--border);color:var(--ink-mid);border-radius:5px;padding:2px 7px;cursor:pointer;font-size:.7rem}
.tr-empty{color:var(--ink-dim);font-style:italic;font-size:.74rem;padding:4px 8px}
.pk-grid.pl{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}
.pk.pl .gn{float:right;color:#9cc8f4;font-size:.7rem}
.pk.pl.off{opacity:.35;cursor:not-allowed}
.tr-q{flex:1 1 220px;min-width:180px;background:var(--raised,#1a1424);color:var(--ink);border:1px solid var(--border);
  border-radius:6px;padding:5px 10px;font-size:.74rem;font-family:inherit}
.tr-q:focus{outline:none;border-color:${TCOL}}
.tr-qmsg{font-size:.66rem;color:#e8a070;min-height:1em;margin:-6px 0 8px}
.tr-flt{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:.7rem;color:#cfe3fa;
  background:rgba(58,141,222,.08);border:1px dashed rgba(58,141,222,.45);border-radius:6px;padding:6px 10px;margin-bottom:10px}
.tr-flt .chip{background:rgba(58,141,222,.18);border-radius:10px;padding:1px 8px;cursor:pointer}
.tw .tag{display:inline-block;border-radius:3px;padding:0 5px;font-size:.6rem;margin-left:4px;border:1px solid rgba(196,149,80,.6);color:var(--gold-lt,#e8c47a)}
.tw .tag.op{border-color:${TCOL};color:#9cc8f4}
.tw .gbig{display:inline-block;min-width:26px;font-family:'Cinzel',serif;color:#cfe3fa}
`;
  const st=document.createElement('style');st.id='hd-transit-css';st.textContent=s;document.head.appendChild(st);
}

/* ── form ── */
const num=(id,lbl,v,min,max)=>`<div class="field"><label>${lbl}</label><input type="number" id="${id}" value="${v}" min="${min}" max="${max}"></div>`;
function inject(){
  if($('tr-tab-btn'))return;
  const bar=document.querySelector('.tab-bar'),shell=document.querySelector('.form-shell');
  if(!bar||!shell)return;
  css();
  const b=document.createElement('button');
  b.className='tab-btn';b.id='tr-tab-btn';b.textContent='ტრანზიტი';b.onclick=activate;
  bar.appendChild(b);

  const now=new Date();
  const f=document.createElement('div');f.id='form-transit';f.className='form-section';
  f.innerHTML=`
    <div class="person-label">👤 ნატალური მონაცემები
      <button type="button" id="tr-copy" style="margin-left:8px;background:none;border:1px solid var(--border);color:var(--gold);border-radius:5px;padding:1px 8px;cursor:pointer;font-size:.62rem">↧ ნატალურიდან</button></div>
    <div class="form-row">${num('tn-day','დღე',1,1,31)}${num('tn-month','თვე',1,1,12)}${num('tn-year','წელი',1990,1,3000)}</div>
    <div class="form-row">${num('tn-hour','საათი',12,0,23)}${num('tn-minute','წუთი',0,0,59)}</div>
    <div class="field"><label>ქალაქი</label>
      <input id="tn-city" type="text" placeholder="თბილისი, London, Paris…" oninput="searchCity('tn')">
      <div class="city-hint" id="tn-city-hint"></div></div>
    <div class="tz-row" id="tn-tz-row"></div>
    <input type="hidden" id="tn-lat"><input type="hidden" id="tn-lon"><input type="hidden" id="tn-tz" value="UTC">

    <div class="person-label" style="margin-top:14px;color:${TCOL}">🪐 ტრანზიტის მომენტი
      <button type="button" id="tr-now" style="margin-left:8px;background:none;border:1px solid var(--border);color:${TCOL};border-radius:5px;padding:1px 8px;cursor:pointer;font-size:.62rem">ახლა</button></div>
    <div class="form-row">${num('tt-day','დღე',now.getDate(),1,31)}${num('tt-month','თვე',now.getMonth()+1,1,12)}${num('tt-year','წელი',now.getFullYear(),1,3000)}</div>
    <div class="form-row">${num('tt-hour','საათი',now.getHours(),0,23)}${num('tt-minute','წუთი',now.getMinutes(),0,59)}
      <div class="field"><label>პერიოდი წინ</label>
        <select id="tr-days" style="width:100%">
          <option value="30">30 დღე</option><option value="90">3 თვე</option>
          <option value="365" selected>1 წელი</option><option value="1095">3 წელი</option>
          <option value="3650">10 წელი</option></select></div></div>
    <label style="display:flex;align-items:center;gap:8px;font-size:.72rem;color:var(--ink-mid);margin:6px 0 10px;cursor:pointer">
      <input type="checkbox" id="tr-moon" style="accent-color:${TCOL}"> მთვარის ტრანზიტებიც (სწრაფი, ~1 დღე · მაქს. 400 დღე)</label>
    <div class="tz-row" id="tt-tz-row">🕐 ${Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'}</div>
    <button type="button" class="btn-calc" id="tr-run">✦ ტრანზიტის გამოთვლა ✦</button>`;
  shell.appendChild(f);

  const sec=document.createElement('section');sec.id='results-transit';sec.className='hidden';
  sec.innerHTML=`
    <div class="legend">
      <div class="leg-item"><div class="leg-dot" style="background:#2C363F;border:1px solid #888"></div>პიროვნება (ნატ.)</div>
      <div class="leg-item"><div class="leg-dot" style="background:#E75A7C"></div>დიზაინი (ნატ.)</div>
      <div class="leg-item"><div class="leg-dot" style="background:${TCOL}"></div><span style="color:#9cc8f4">ტრანზიტი</span></div>
      <div class="leg-item"><div class="leg-dot" style="background:#c49550;border:2px solid ${TCOL}"></div>ტრანზიტით განსაზღვრული ცენტრი (ლურჯი კონტური)</div>
    </div>
    <div class="sec-head"><span>სხეულის გრაფიკა · ნატალი + ტრანზიტი</span></div>
    <div class="chart-area tr-layout">
      <div class="planet-col design" id="tr-col-d"><h3>დიზაინი</h3></div>
      <div class="planet-col personality" id="tr-col-p"><h3>პიროვნება</h3></div>
      <div id="bodygraph-tr"><div class="loading">იტვირთება…</div></div>
      <div class="planet-col" id="tr-col-t"><h3 style="color:${TCOL}">ტრანზიტი</h3></div>
    </div>
    <div class="tr-cards" id="tr-cards"></div>
    <div class="panel" style="margin-bottom:14px">
      <h2>არხები ახლა <small id="tr-now-count"></small></h2>
      <div class="channel-list" id="tr-now-list"></div>
    </div>
    <div class="panel" style="margin-bottom:20px">
      <h2>როდის აქტიურდება <small id="tr-pk-period"></small></h2>
      <div class="tr-ctrl">
        <button type="button" data-tab="ch" class="on">არხები (36)</button>
        <button type="button" data-tab="gt">კარიბჭეები (64)</button>
        <button type="button" data-tab="pl">პლანეტები (13)</button>
        <input class="tr-q" id="tr-q" placeholder="ძიება: 20 · 10-20 · მარსი · 34, იუპიტერი ↵">
        <span class="sp"></span>
        <button type="button" data-q="hang">ჩამოკიდებული არხები</button>
        <button type="button" data-q="clear">გასუფთავება</button>
      </div>
      <div class="pk-key">
        <span><i style="border:1px solid #c49550"></i>ნატალური</span>
        <span><i style="border-left:3px solid #c49550;background:#1a1424"></i>ჩამოკიდებული (ერთი კარიბჭე შენია)</span>
        <span><i style="background:${TCOL};border-radius:50%"></i>ახლა ღიაა / ტრანზიტშია</span>
      </div>
      <div class="tr-qmsg" id="tr-qmsg"></div>
      <div id="tr-pk"></div>
      <div id="tr-res"><div class="tr-empty">აირჩიე არხი, კარიბჭე ან პლანეტა (ან რამდენიმე ერთად) — აქ გამოჩნდება, როდის აქტიურდება და რომელი პლანეტით.</div></div>
    </div>`;
  const syn=$('results-synastry');
  (syn&&syn.parentNode?syn.parentNode:document.body).insertBefore(sec,syn?syn.nextSibling:null);

  $('tr-run').onclick=run;
  $('tr-copy').onclick=copyNatal;
  $('tr-now').onclick=()=>{const n=new Date();
    set('tt-day',n.getDate());set('tt-month',n.getMonth()+1);set('tt-year',n.getFullYear());
    set('tt-hour',n.getHours());set('tt-minute',n.getMinutes());};
  sec.querySelectorAll('.tr-ctrl button[data-tab]').forEach(b=>b.onclick=()=>{
    pkTab=b.dataset.tab;sec.querySelectorAll('.tr-ctrl button[data-tab]').forEach(x=>x.classList.toggle('on',x===b));
    if(last)renderPicker(last);});
  sec.querySelectorAll('.tr-ctrl button[data-q]').forEach(b=>b.onclick=()=>{
    if(!last)return;
    if(b.dataset.q==='clear'){SEL.clear();$('tr-qmsg').textContent='';}
    else last.channels_all.forEach(c=>{if(chState(last,c)==='hang')SEL.add('c:'+c.gate_a+'-'+c.gate_b);});
    renderPicker(last);renderResults(last);});
  $('tr-q').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();doSearch();}});

  /* the page's setMode() highlights tabs by index: keep ours in sync */
  if(typeof setMode==='function'&&!setMode._tr){
    const o=setMode;
    const w=function(m){o(m);$('tr-tab-btn').classList.remove('active');
      $('results-transit').classList.add('hidden');$('form-transit').classList.remove('active');};
    w._tr=true;window.setMode=w;
  }
}
const set=(id,v)=>{const e=$(id);if(e)e.value=v;};

function activate(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  $('tr-tab-btn').classList.add('active');
  document.querySelectorAll('.form-section').forEach(s=>s.classList.remove('active'));
  $('form-transit').classList.add('active');
  ['results-natal','results-synastry'].forEach(id=>{const e=$(id);if(e)e.classList.add('hidden');});
  if(last)$('results-transit').classList.remove('hidden');
  if(!$('tn-lat').value&&$('n-lat')&&$('n-lat').value)copyNatal();
  try{currentMode='transit';}catch(e){}
  const st=$('status');if(st)st.textContent='';
}
function copyNatal(){
  for(const k of ['day','month','year','hour','minute','city','lat','lon','tz']){
    const a=$('n-'+k);if(a)set('tn-'+k,a.value);}
  const h=$('n-city-hint'),th=$('tn-city-hint');if(h&&th)th.textContent=h.textContent;
  const r=$('n-tz-row'),tr=$('tn-tz-row');if(r&&tr)tr.textContent=r.textContent;
}

/* ── SVG (own instance; same file and processing as loadSVG) ── */
async function loadSvg(){
  const txt=await fetch(API_BASE+'/static/human_prepared.svg').then(r=>r.text());
  const wrap=$('bodygraph-tr');
  const el=document.importNode(new DOMParser().parseFromString(txt,'image/svg+xml').documentElement,true);
  wrap.innerHTML='';wrap.appendChild(el);
  const sv=wrap.querySelector('svg');
  sv.setAttribute('preserveAspectRatio','xMidYMid meet');
  sv.removeAttribute('width');sv.removeAttribute('height');
  sv.setAttribute('viewBox','420 40 580 780');
  const ss=sv.querySelector('#hd-activation');
  if(ss){
    if(!document.querySelector('style[id^="hd-act-"]')){
      const d=document.createElement('style');d.id='hd-act-transit';d.textContent=ss.textContent;document.head.appendChild(d);}
    ss.remove();
  }
  sv.querySelectorAll('.detail-part').forEach(e=>e.style.setProperty('display','none','important'));
  svgT=sv;
}

/* ── request ── */
const pad=n=>String(n).padStart(2,'0');
async function run(){
  const btn=$('tr-run'),st=$('status');
  const g=id=>+$(id).value;
  if(!$('tn-lat').value||!$('tn-lon').value){st.className='status error';st.textContent='⚠ შეიყვანეთ ნატალური ქალაქი';return;}
  btn.disabled=true;btn.textContent='⏳ გამოთვლა…';st.className='status';st.textContent='იტვირთება…';
  try{
    if(!svgT)await loadSvg();
    const body={
      natal:{date:`${g('tn-year')}-${pad(g('tn-month'))}-${pad(g('tn-day'))}`,time:`${pad(g('tn-hour'))}:${pad(g('tn-minute'))}`,
             lat:+$('tn-lat').value,lon:+$('tn-lon').value,tz_name:$('tn-tz').value||'UTC'},
      transit:{date:`${g('tt-year')}-${pad(g('tt-month'))}-${pad(g('tt-day'))}`,time:`${pad(g('tt-hour'))}:${pad(g('tt-minute'))}`,
               tz_name:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'},
      days:+$('tr-days').value,moon:$('tr-moon').checked};
    const r=await fetch(API_BASE+'/api/hd_transit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const raw=await r.text();let d;try{d=JSON.parse(raw);}catch(_){throw new Error('Backend error '+r.status);}
    if(!r.ok||d.error)throw new Error(d.error||('HTTP '+r.status));
    last=d;render(d);st.textContent='';
  }catch(e){st.className='status error';st.textContent='შეცდომა: '+e.message;}
  finally{btn.disabled=false;btn.textContent='✦ ტრანზიტის გამოთვლა ✦';}
}

/* ── render ── */
function clear(sv){
  const rm=[];sv.classList.forEach(c=>{if(/^(active-|center-active-|detail-on-|tr-)/.test(c))rm.push(c);});
  rm.forEach(c=>sv.classList.remove(c));
  sv.querySelectorAll('.detail-part').forEach(e=>e.style.setProperty('display','none','important'));
}
const row=(a,cls)=>`<div class="prow ${cls||''}"><span class="g">${a.glyph||(typeof PLANET_GLYPH!=='undefined'?PLANET_GLYPH[a.planet]:'')||''}</span>
  <span class="nm">${(typeof PLANET_KA!=='undefined'&&PLANET_KA[a.planet])||a.planet}</span>
  <span class="gl"><span class="gate">${a.gate}</span>.<span class="line">${a.line}</span></span></div>`;
const ord=list=>(typeof PLANET_ORDER!=='undefined'?PLANET_ORDER.map(p=>list.find(x=>x.planet===p)).filter(Boolean):list);

function render(d){
  const n=d.natal,sv=svgT;clear(sv);
  const natal=new Set(d.natal_gates),tG=new Set(d.activations.map(a=>a.gate));
  Object.entries(n.gate_sources).forEach(([g,s])=>{
    sv.classList.add((s.p&&s.d?'active-b-':s.p?'active-p-':'active-d-')+g);});
  tG.forEach(g=>{sv.classList.add('tr-c-'+g);if(!natal.has(g))sv.classList.add('tr-t-'+g);});
  d.combined.centers.forEach(c=>sv.classList.add('center-active-'+c.replace(/ /g,'')));
  d.combined.new_centers.forEach(c=>sv.classList.add('tr-nc-'+c.replace(/ /g,'')));
  if(n.integration&&n.integration.n){
    sv.classList.add('detail-on-'+n.integration.n);
    const el=sv.querySelector(`.detail-part[data-detail="${n.integration.n}"]`);
    if(el)el.style.setProperty('display','block','important');
  }
  $('tr-col-d').innerHTML='<h3>დიზაინი</h3>'+ord(n.design).map(a=>row(a,'red2')).join('');
  $('tr-col-p').innerHTML='<h3>პიროვნება</h3>'+ord(n.personality).map(a=>row(a)).join('');
  $('tr-col-t').innerHTML=`<h3 style="color:${TCOL}">ტრანზიტი</h3>`+ord(d.activations).map(a=>row(a,'trn')).join('');

  const C=d.combined,chg=(a,b)=>a!==b?` <span style="color:${TCOL}">→ ${b}</span>`:'';
  const cards=[
    ['ტიპი',TKA(n.type)+chg(TKA(n.type),TKA(C.type))],
    ['ავტორიტეტი',n.authority+chg(n.authority,C.authority)],
    ['განსაზღვრება',n.definition+chg(n.definition,C.definition)],
    ['ტრანზიტით განსაზღვრული ცენტრები',C.new_centers.length?C.new_centers.map(CKA).join(', '):'—'],
    ['ტრანზიტის მომენტი',`${d.moment.date} ${d.moment.time}<br><span style="font-size:.7rem;color:var(--ink-dim)">${d.moment.tz} · UTC ${d.moment.utc}</span>`],
  ];
  $('tr-cards').innerHTML=cards.map(([k,v])=>`<div class="card"><div class="k">${k}</div><div class="v xs">${v}</div></div>`).join('')+
    `<div class="tr-note" style="grid-column:1/-1">ისარი (→) აჩვენებს, როგორ „მოქმედებს“ ტრანზიტი — ეს დროებითი კონდიციონირებაა, შენი ტიპი და ავტორიტეტი ნატალურით რჩება. ${d.note}</div>`;

  /* channels right now */
  const comp=d.channels.filter(c=>c.kind==='completed'),coll=d.channels.filter(c=>c.kind==='transit'),nat=d.channels.filter(c=>c.kind==='natal');
  /* for a completed channel show only the bodies on the MISSING gate —
     a transit on a gate you already have changes nothing there */
  const who=(c,onlyMissing)=>Object.entries(c.transit)
    .filter(([g])=>!onlyMissing||!c.natal_gates.includes(+g))
    .map(([g,ps])=>ps.map(p=>`${BODY_KA[p]||p} ${g}`).join(', ')).join(' · ');
  let h='';
  h+=`<div class="ch-divider" style="color:${TCOL};opacity:.9">⚡ ტრანზიტით გახსნილი — ${comp.length}</div>`;
  h+=comp.length?comp.map(c=>`<div class="ch-item trc"><span class="pair">${c.gate_a}–${c.gate_b}</span>
      <span class="cname">${c.name} <span style="font-style:normal;color:var(--ink-dim)">· შენი ${c.natal_gates.join(', ')} + ${who(c,true)}</span>
      ${c.new_centers.length?`<span style="font-style:normal;color:#9cc8f4"> · +${c.new_centers.map(CKA).join(', ')}</span>`:''}</span>
      <span class="ctag">ტრანზიტი</span></div>`).join(''):'<div class="tr-empty">ამ მომენტში ტრანზიტი შენს არხს არ ასრულებს</div>';
  h+=`<div class="ch-divider" style="opacity:.7">ტრანზიტის საკუთარი (კოლექტიური) — ${coll.length}</div>`;
  h+=coll.length?coll.map(c=>`<div class="ch-item trs"><span class="pair">${c.gate_a}–${c.gate_b}</span>
      <span class="cname">${c.name} <span style="font-style:normal;color:var(--ink-dim)">· ${who(c)}</span></span><span class="ctag">ცა</span></div>`).join(''):'<div class="tr-empty">—</div>';
  h+=`<div class="ch-divider" style="opacity:.6">შენი ნატალური — ${nat.length}</div>`;
  h+=nat.map(c=>`<div class="ch-item mixed"><span class="pair">${c.gate_a}–${c.gate_b}</span><span class="cname">${c.name}</span><span class="ctag">ნატ.</span></div>`).join('');
  $('tr-now-list').innerHTML=h;
  $('tr-now-count').textContent=`⚡${comp.length} ტრანზიტით · ${coll.length} კოლექტ.`;

  renderPicker(d);renderResults(d);

  $('results-transit').classList.remove('hidden');
  ['results-natal','results-synastry'].forEach(id=>{const e=$(id);if(e)e.classList.add('hidden');});
  $('results-transit').scrollIntoView({behavior:'smooth',block:'start'});
}

/* ── picker ─────────────────────────────────────────────── */
const TZ=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
const fmt=jd=>{const p=jdParts(jd,TZ());return `${p.y}-${pad(p.m)}-${pad(p.d)} ${pad(p.h)}:${pad(p.mi)}`;};
const dur=d=>d>=1?`${d.toFixed(d<10?1:0)} დღე`:`${Math.max(1,Math.round(d*24))} სთ`;
function nowGates(d){return new Set(d.activations.map(a=>a.gate));}
function chState(d,c){
  const N=new Set(d.natal_gates),na=N.has(c.gate_a),nb=N.has(c.gate_b);
  if(na&&nb)return 'nat';
  return (na||nb)?'hang':'';
}
function renderPicker(d){
  const N=new Set(d.natal_gates),T=nowGates(d);
  const openNow=new Set(d.channels.filter(c=>c.kind!=='natal').map(c=>c.gate_a+'-'+c.gate_b));
  let h='';
  if(pkTab==='ch'){
    h='<div class="pk-grid ch">'+d.channels_all.map(c=>{
      const k='c:'+c.gate_a+'-'+c.gate_b,st=chState(d,c);
      return `<button type="button" class="pk ${st}${openNow.has(c.gate_a+'-'+c.gate_b)?' now':''}${SEL.has(k)?' sel':''}" data-k="${k}">
        <b>${c.gate_a}–${c.gate_b}</b> ${c.name}</button>`;}).join('')+'</div>';
  }else if(pkTab==='pl'){
    const cur={};d.activations.forEach(a=>{cur[a.planet]=a.gate;});
    h='<div class="pk-grid pl">'+BODIES.map(b=>{
      const k='p:'+b,has=!!d.segments[b];
      return `<button type="button" class="pk pl${has?'':' off'}${SEL.has(k)?' sel':''}" data-k="${k}"${has?'':' disabled title="მთვარე: ჩართე „მთვარის ტრანზიტებიც“"'}>
        <b>${GL(b)} ${BODY_KA[b]||b}</b>${cur[b]!=null?`<span class="gn">${cur[b]}</span>`:''}</button>`;}).join('')+'</div>';
  }else{
    h='<div class="pk-grid gt">';
    for(let g=1;g<=64;g++){const k='g:'+g;
      h+=`<button type="button" class="pk gt${N.has(g)?' nat':''}${T.has(g)?' now':''}${SEL.has(k)?' sel':''}" data-k="${k}"><b>${g}</b></button>`;}
    h+='</div>';
  }
  $('tr-pk').innerHTML=h;
  $('tr-pk').querySelectorAll('.pk:not([disabled])').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k;SEL.has(k)?SEL.delete(k):SEL.add(k);
    b.classList.toggle('sel',SEL.has(k));renderResults(d);});
  const P=d.period,yrs=P.days>=365?`${Math.round(P.days/365)} წელი`:`${P.days} დღე`;
  $('tr-pk-period').textContent=`${fmt(P.jd0)} → ${yrs}${P.moon?' · მთვარით':' · მთვარის გარეშე'}`;
}

/* every [start,end] a gate is held by a transit body (one row per pass) */
/* planets chosen as a filter (empty = every transit body) */
const pFilter=()=>new Set([...SEL].filter(k=>k[0]==='p').map(k=>k.slice(2)));
function gatePasses(d,g,P){
  const out=[];
  for(const [body,segs] of Object.entries(d.segments)){
    if(P&&P.size&&!P.has(body))continue;
    for(const [gg,s,e,r] of segs) if(gg===g) out.push({body,s,e,r});
  }
  return out.sort((a,b)=>a.s-b.s);
}
/* gate covered by natal or by any transit body, merged into intervals */
function coverage(d,g,F){
  const P=d.period;
  if(d.natal_gates.includes(g))return [{s:P.jd0,e:P.jd1,natal:true}];
  const ps=gatePasses(d,g,F),out=[];
  for(const p of ps){
    const l=out[out.length-1];
    if(l&&p.s<=l.e+1e-6)l.e=Math.max(l.e,p.e);else out.push({s:p.s,e:p.e});
  }
  return out;
}
function intersect(A,B){
  const out=[];let i=0,j=0;
  while(i<A.length&&j<B.length){
    const s=Math.max(A[i].s,B[j].s),e=Math.min(A[i].e,B[j].e);
    if(e>s+1e-6)out.push({s,e});
    A[i].e<B[j].e?i++:j++;
  }
  return out;
}
function whoIn(d,g,s,e,F){
  if(d.natal_gates.includes(g))return `${g} — შენი`;
  const bs=[...new Set(gatePasses(d,g,F).filter(p=>p.s<e-1e-6&&p.e>s+1e-6).map(p=>(PLANET_GLYPH[p.body]||'')+' '+(BODY_KA[p.body]||p.body)+(p.r?' ℞':'')))];
  return `${g} — ${bs.join(', ')}`;
}
function rowHTML(s,e,main,sub){
  const P=last.period,open0=s<=P.jd0+1e-5,open1=e>=P.jd1-1e-5;
  return `<div class="tw"><span><span class="when">${open0?'უკვე აქტიურია':fmt(s)} → ${open1?'პერიოდის ბოლომდე':fmt(e)}</span>${open0?'<span class="nowb">ახლა</span>':''}
    <br><span class="who">${main}</span> <span class="sub">· ${dur(e-s)}${sub?' · '+sub:''}</span></span>
    <button type="button" class="eye" data-jd="${(s+e)/2}" title="ამ მომენტის გრაფიკი">👁</button></div>`;
}
function renderResults(d){
  const box=$('tr-res');
  if(!SEL.size){box.innerHTML='<div class="tr-empty">აირჩიე არხი, კარიბჭე ან პლანეტა (ან რამდენიმე ერთად) — აქ გამოჩნდება, როდის აქტიურდება და რომელი პლანეტით.</div>';return;}
  const N=new Set(d.natal_gates),natC=new Set(d.natal_centers);
  const F=pFilter();
  const items=[...SEL].filter(k=>k[0]!=='p').sort((x,y)=>x[0]===y[0]?
    (+x.slice(2).split('-')[0])-(+y.slice(2).split('-')[0]):x<y?-1:1);
  const fname=[...F].map(b=>GL(b)+' '+(BODY_KA[b]||b));
  let pre='';
  if(F.size&&items.length){
    pre=`<div class="tr-flt">🔎 მხოლოდ: ${[...F].map(b=>`<span class="chip" data-k="p:${b}" title="მოხსნა">${GL(b)} ${BODY_KA[b]||b} ✕</span>`).join('')}
      <span style="color:var(--ink-dim)">— არხები და კარიბჭეები ნაჩვენებია მხოლოდ ამ პლანეტ(ებ)ის გავლით</span></div>`;
  }
  /* planets with nothing else selected → each planet's gate route */
  const routes=(!items.length&&F.size)?[...F].filter(b=>d.segments[b]).sort((a,b)=>BODIES.indexOf(a)-BODIES.indexOf(b))
    .map(b=>planetRoute(d,b)).join(''):'';
  box.innerHTML=pre+routes+items.map(k=>{
    const x=`<button type="button" class="rb-x" data-k="${k}" title="მოხსნა">✕</button>`;
    if(k[0]==='g'){
      const g=+k.slice(2),ps=gatePasses(d,g,F);
      const head=`<div class="rb-h"><span>კარიბჭე ${g} <small>· ${CKA(GATE_TO_CENTER[g])}${N.has(g)?' · შენი ნატალური':''}</small></span><span><small>${ps.length} გავლა</small> ${x}</span></div>`;
      return `<div class="rb">${head}${ps.length?ps.map(p=>rowHTML(p.s,p.e,(PLANET_GLYPH[p.body]||'')+' '+(BODY_KA[p.body]||p.body)+(p.r?' ℞':''),'')).join('')
        :`<div class="tr-empty">ამ პერიოდში ${F.size?fname.join(', ')+' ამ კარიბჭეში არ შედის':'არცერთი ტრანზიტული პლანეტა არ გადის'}</div>`}</div>`;
    }
    const [a,b]=k.slice(2).split('-').map(Number),c=d.channels_all.find(z=>z.gate_a===a&&z.gate_b===b);
    const st=chState(d,c);
    const newC=[...new Set([c.center_a,c.center_b])].filter(z=>!natC.has(z));
    const tag=st==='nat'?'შენი ნატალური':st==='hang'?`შენი ${N.has(a)?a:b} · საჭიროა ${N.has(a)?b:a}`:'ორივე კარიბჭე ტრანზიტით';
    let rows;
    if(st==='nat')rows='<div class="tr-empty">ეს არხი ნატალურად მუდმივად ღიაა — ტრანზიტი მას არ ცვლის</div>';
    else{
      const iv=intersect(coverage(d,a,F),coverage(d,b,F));
      rows=iv.length?iv.map(v=>rowHTML(v.s,v.e,`${whoIn(d,a,v.s,v.e,F)} · ${whoIn(d,b,v.s,v.e,F)}`,
        newC.length?'+'+newC.map(CKA).join(', '):'')).join('')
        :`<div class="tr-empty">ამ პერიოდში არ იხსნება${F.size?' (ფილტრი: '+fname.join(', ')+')':''}</div>`;
      rows=`<div class="tr-empty" style="font-style:normal">${iv.length} ფანჯარა</div>`+rows;
    }
    return `<div class="rb"><div class="rb-h"><span>${a}–${b} ${c.name} <small>· ${tag}</small></span><span>${x}</span></div>${rows}</div>`;
  }).join('');
  box.querySelectorAll('.rb-x,.tr-flt .chip').forEach(b=>b.onclick=()=>{SEL.delete(b.dataset.k);renderPicker(d);renderResults(d);});
  const ok=box.querySelectorAll('.rb-only');
  ok.forEach(c=>c.onchange=()=>{ONLY_KEY=c.checked;renderResults(d);});
  box.querySelectorAll('.eye').forEach(b=>b.onclick=()=>{
    const p=jdParts(+b.dataset.jd,TZ());
    set('tt-year',p.y);set('tt-month',p.m);set('tt-day',p.d);set('tt-hour',p.h);set('tt-minute',p.mi);run();});
}
/* one planet: every gate it occupies in the period, with what it does for you */
function planetRoute(d,b){
  const N=new Set(d.natal_gates),segs=d.segments[b]||[];
  const opens={};          /* missing partner gate -> channels it would complete */
  d.channels_all.forEach(c=>{
    if(N.has(c.gate_a)&&!N.has(c.gate_b))(opens[c.gate_b]=opens[c.gate_b]||[]).push(c);
    if(N.has(c.gate_b)&&!N.has(c.gate_a))(opens[c.gate_a]=opens[c.gate_a]||[]).push(c);
  });
  const rows=segs.filter(([g])=>!ONLY_KEY||N.has(g)||opens[g]).map(([g,s,e,r])=>{
    const tags=(N.has(g)?'<span class="tag">შენი კარიბჭე</span>':'')+
      (opens[g]||[]).map(c=>`<span class="tag op">⚡ ხსნის ${c.gate_a}–${c.gate_b}</span>`).join('');
    return rowHTML(s,e,`<span class="gbig">${g}</span> ${CKA(GATE_TO_CENTER[g])}${r?' ℞':''}${tags}`,'');
  }).join('');
  const nKey=segs.filter(([g])=>N.has(g)||opens[g]).length;
  return `<div class="rb"><div class="rb-h"><span>${GL(b)} ${BODY_KA[b]||b} <small>· ${segs.length} კარიბჭე · ${nKey} შენთვის მნიშვნელოვანი</small></span>
    <span><label style="font-family:inherit;letter-spacing:0;font-size:.64rem;color:var(--ink-dim);cursor:pointer">
      <input type="checkbox" class="rb-only" ${ONLY_KEY?'checked':''} style="accent-color:${TCOL};vertical-align:-2px"> მხოლოდ მნიშვნელოვანი</label>
      <button type="button" class="rb-x" data-k="p:${b}" title="მოხსნა">✕</button></span></div>
    ${rows||'<div class="tr-empty">—</div>'}</div>`;
}

/* free-text search: "20", "10-20", "მარსი", "34, jupiter" */
function doSearch(){
  const d=last,q=$('tr-q').value.trim(),msg=$('tr-qmsg');
  if(!d||!q)return;
  const bad=[];let added=0,tab=null;
  q.split(/[,;]+/).map(t=>t.trim().toLowerCase()).filter(Boolean).forEach(t=>{
    let m=t.match(/^(\d{1,2})\s*[-–—/ ]\s*(\d{1,2})$/);
    if(m){
      const a=+m[1],b=+m[2],c=d.channels_all.find(z=>(z.gate_a===a&&z.gate_b===b)||(z.gate_a===b&&z.gate_b===a));
      if(c){SEL.add('c:'+c.gate_a+'-'+c.gate_b);added++;tab=tab||'ch';}else bad.push(t+' (ასეთი არხი არ არსებობს)');
      return;
    }
    if(/^\d{1,2}$/.test(t)){
      const g=+t; if(g>=1&&g<=64){SEL.add('g:'+g);added++;tab=tab||'gt';}else bad.push(t);
      return;
    }
    const hit=BODIES.find(b=>(BODY_KA[b]||'').toLowerCase().startsWith(t)||
      BODY_EN[b].split(' ').some(w=>w.startsWith(t))||BODY_EN[b].startsWith(t));
    if(hit){
      if(!d.segments[hit]){bad.push((BODY_KA[hit]||hit)+' — ჩართე „მთვარის ტრანზიტებიც“');return;}
      SEL.add('p:'+hit);added++;tab=tab||'pl';return;
    }
    const byName=d.channels_all.filter(c=>c.name.toLowerCase().includes(t));
    if(byName.length){byName.forEach(c=>SEL.add('c:'+c.gate_a+'-'+c.gate_b));added+=byName.length;tab=tab||'ch';return;}
    bad.push(t);
  });
  msg.textContent=bad.length?'ვერ მოიძებნა: '+bad.join(', '):'';
  if(added){$('tr-q').value='';
    if(tab&&tab!==pkTab){pkTab=tab;document.querySelectorAll('#results-transit .tr-ctrl button[data-tab]')
      .forEach(x=>x.classList.toggle('on',x.dataset.tab===tab));}
    renderPicker(d);renderResults(d);}
}

function jdParts(jd,tz){
  const dt=new Date((jd-2440587.5)*86400000);
  const o={};new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23'})
    .formatToParts(dt).forEach(p=>{o[p.type]=p.value;});
  return {y:+o.year,m:+o.month,d:+o.day,h:+o.hour,mi:+o.minute};
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
window._hdTransit={render,jdParts};
})();
