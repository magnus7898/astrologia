/* hd_transit.js — Human Design · ტრანზიტი
   Self-injecting tab for hd.html. Needs only, before </body>:
       <script src="hd_transit.js"></script>
   Backend: POST /api/hd_transit (hd_transit.py)

   Shows
     • natal + transit on one bodygraph (transit = blue)
     • channels opened right now: your hanging gate + transit body in the
       partner gate, and purely transit (collective) channels
     • the chart UNDER the transit (centers, type, authority) — conditioning
     • picker: choose channels / gates (one or several) → when each is
       activated and by which transit body, computed from the ingress table
     • 🔎 NEAREST search (POST /api/hd_transit_search, no period limit):
         planet + gate  → next passes of that planet through that gate
         gate           → next activation by any transit body
         channel        → next opening, with your natal gates or transit only
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
const SEL=new Set();          /* 'c:10-20' / 'g:20' — survives a recalculation */

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
.ns{margin-top:18px;padding-top:14px;border-top:1px solid rgba(58,141,222,.25)}
.ns-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px}
.ns-modes button{background:var(--raised,#1a1424);color:var(--ink-mid);border:1px solid var(--border);border-radius:8px;
  padding:8px 6px;font-size:.72rem;font-family:inherit;cursor:pointer;line-height:1.3}
.ns-modes button.on{border-color:${TCOL};color:#cfe3fa;background:rgba(58,141,222,.14)}
.ns-row{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-bottom:8px}
.ns-row .field{flex:1 1 140px;min-width:120px}
.ns select{width:100%;padding:9px 10px;background:rgba(10,8,30,.7);color:var(--ink);border:1px solid rgba(61,42,138,.6);
  border-radius:8px;font:inherit;font-size:13px}
.ns-opt{display:flex;gap:14px;flex-wrap:wrap;font-size:.72rem;color:var(--ink-mid);margin:2px 0 8px}
.ns-opt label{display:flex;align-items:center;gap:6px;cursor:pointer}
.ns-opt input{accent-color:${TCOL}}
.ns-go{width:100%;background:linear-gradient(135deg,#2a6fb8,#1c4f88);color:#fff;border:1px solid rgba(58,141,222,.5);
  border-radius:10px;padding:11px;font-size:12px;cursor:pointer;letter-spacing:2px;font-family:'Cinzel',serif}
.ns-go:disabled{opacity:.5;cursor:wait}
.ns-res{margin-top:12px}
.ns-card{border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:8px;background:rgba(58,141,222,.05)}
.ns-card.first{border-color:${TCOL};background:rgba(58,141,222,.12)}
.ns-card .d{font-size:.9rem;color:var(--ink)}
.ns-card .d b{color:#cfe3fa;font-weight:500}
.ns-card .m{font-size:.7rem;color:var(--ink-dim);margin-top:3px}
.ns-card .w{font-size:.72rem;color:#9cc8f4;margin-top:3px}
.ns-card .nowb{display:inline-block;background:${TCOL};color:#fff;border-radius:3px;padding:0 6px;font-size:.62rem;margin-left:6px}
.ns-card .lbl{font-family:'Cinzel',serif;font-size:.55rem;letter-spacing:.15em;color:var(--ink-dim);text-transform:uppercase}
.ns-more{background:none;border:1px solid var(--border);color:var(--ink-mid);border-radius:6px;padding:5px 12px;font-size:.7rem;cursor:pointer;font-family:inherit}
.ns-head{font-size:.78rem;color:var(--ink-mid);margin-bottom:8px;line-height:1.5}
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
    <button type="button" class="btn-calc" id="tr-run">✦ ტრანზიტის გამოთვლა ✦</button>

    <div class="ns" id="ns">
      <div class="person-label" style="color:${TCOL}">🔎 უახლოესი აქტივაციის ძებნა
        <span style="text-transform:none;letter-spacing:0;opacity:.75"> — ტრანზიტის მომენტიდან წინ</span></div>
      <div class="ns-modes">
        <button type="button" data-m="planet_gate" class="on">🪐 პლანეტა + კარიბჭე</button>
        <button type="button" data-m="gate">◉ კარიბჭე</button>
        <button type="button" data-m="channel">⚡ არხი</button>
      </div>
      <div class="ns-row">
        <div class="field" id="ns-f-planet"><label>პლანეტა</label><select id="ns-planet"></select></div>
        <div class="field" id="ns-f-gate"><label>კარიბჭე</label><select id="ns-gate"></select></div>
        <div class="field" id="ns-f-chan" style="display:none;flex-basis:240px"><label>არხი</label><select id="ns-chan"></select></div>
      </div>
      <div class="ns-opt" id="ns-opt-natal" style="display:none">
        <label><input type="radio" name="ns-nat" value="1" checked> ჩემი ნატალური რუქით</label>
        <label><input type="radio" name="ns-nat" value="0"> მხოლოდ ტრანზიტი (ნატალის გარეშე)</label>
      </div>
      <div class="ns-opt" id="ns-opt-moon" style="display:none">
        <label><input type="checkbox" id="ns-moon"> მთვარის ჩათვლით</label>
      </div>
      <button type="button" class="ns-go" id="ns-go">🔎 ძებნა</button>
      <div class="ns-res" id="ns-res"></div>
    </div>`;
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
        <span class="sp"></span>
        <button type="button" data-q="hang">ჩამოკიდებული არხები</button>
        <button type="button" data-q="clear">გასუფთავება</button>
      </div>
      <div class="pk-key">
        <span><i style="border:1px solid #c49550"></i>ნატალური</span>
        <span><i style="border-left:3px solid #c49550;background:#1a1424"></i>ჩამოკიდებული (ერთი კარიბჭე შენია)</span>
        <span><i style="background:${TCOL};border-radius:50%"></i>ახლა ღიაა / ტრანზიტშია</span>
      </div>
      <div id="tr-pk"></div>
      <div id="tr-res"><div class="tr-empty">აირჩიე ერთი ან რამდენიმე არხი ან კარიბჭე — აქ გამოჩნდება, როდის აქტიურდება და რომელი პლანეტით.</div></div>
    </div>`;
  const syn=$('results-synastry');
  (syn&&syn.parentNode?syn.parentNode:document.body).insertBefore(sec,syn?syn.nextSibling:null);

  $('tr-run').onclick=run;
  nsInit();
  $('tr-copy').onclick=copyNatal;
  $('tr-now').onclick=()=>{const n=new Date();
    set('tt-day',n.getDate());set('tt-month',n.getMonth()+1);set('tt-year',n.getFullYear());
    set('tt-hour',n.getHours());set('tt-minute',n.getMinutes());};
  sec.querySelectorAll('.tr-ctrl button[data-tab]').forEach(b=>b.onclick=()=>{
    pkTab=b.dataset.tab;sec.querySelectorAll('.tr-ctrl button[data-tab]').forEach(x=>x.classList.toggle('on',x===b));
    if(last)renderPicker(last);});
  sec.querySelectorAll('.tr-ctrl button[data-q]').forEach(b=>b.onclick=()=>{
    if(!last)return;
    if(b.dataset.q==='clear')SEL.clear();
    else last.channels_all.forEach(c=>{if(chState(last,c)==='hang')SEL.add('c:'+c.gate_a+'-'+c.gate_b);});
    renderPicker(last);renderResults(last);});

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
  }else{
    h='<div class="pk-grid gt">';
    for(let g=1;g<=64;g++){const k='g:'+g;
      h+=`<button type="button" class="pk gt${N.has(g)?' nat':''}${T.has(g)?' now':''}${SEL.has(k)?' sel':''}" data-k="${k}"><b>${g}</b></button>`;}
    h+='</div>';
  }
  $('tr-pk').innerHTML=h;
  $('tr-pk').querySelectorAll('.pk').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k;SEL.has(k)?SEL.delete(k):SEL.add(k);
    b.classList.toggle('sel',SEL.has(k));renderResults(d);});
  const P=d.period,yrs=P.days>=365?`${Math.round(P.days/365)} წელი`:`${P.days} დღე`;
  $('tr-pk-period').textContent=`${fmt(P.jd0)} → ${yrs}${P.moon?' · მთვარით':' · მთვარის გარეშე'}`;
}

/* every [start,end] a gate is held by a transit body (one row per pass) */
function gatePasses(d,g){
  const out=[];
  for(const [body,segs] of Object.entries(d.segments))
    for(const [gg,s,e,r] of segs) if(gg===g) out.push({body,s,e,r});
  return out.sort((a,b)=>a.s-b.s);
}
/* gate covered by natal or by any transit body, merged into intervals */
function coverage(d,g){
  const P=d.period;
  if(d.natal_gates.includes(g))return [{s:P.jd0,e:P.jd1,natal:true}];
  const ps=gatePasses(d,g),out=[];
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
function whoIn(d,g,s,e){
  if(d.natal_gates.includes(g))return `${g} — შენი`;
  const bs=[...new Set(gatePasses(d,g).filter(p=>p.s<e-1e-6&&p.e>s+1e-6).map(p=>(PLANET_GLYPH[p.body]||'')+' '+(BODY_KA[p.body]||p.body)+(p.r?' ℞':'')))];
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
  if(!SEL.size){box.innerHTML='<div class="tr-empty">აირჩიე ერთი ან რამდენიმე არხი ან კარიბჭე — აქ გამოჩნდება, როდის აქტიურდება და რომელი პლანეტით.</div>';return;}
  const N=new Set(d.natal_gates),natC=new Set(d.natal_centers);
  const items=[...SEL].sort();
  box.innerHTML=items.map(k=>{
    const x=`<button type="button" class="rb-x" data-k="${k}" title="მოხსნა">✕</button>`;
    if(k[0]==='g'){
      const g=+k.slice(2),ps=gatePasses(d,g);
      const head=`<div class="rb-h"><span>კარიბჭე ${g} <small>· ${CKA(GATE_TO_CENTER[g])}${N.has(g)?' · შენი ნატალური':''}</small></span><span><small>${ps.length} გავლა</small> ${x}</span></div>`;
      return `<div class="rb">${head}${ps.length?ps.map(p=>rowHTML(p.s,p.e,(PLANET_GLYPH[p.body]||'')+' '+(BODY_KA[p.body]||p.body)+(p.r?' ℞':''),'')).join('')
        :'<div class="tr-empty">ამ პერიოდში არცერთი ტრანზიტული პლანეტა არ გადის</div>'}</div>`;
    }
    const [a,b]=k.slice(2).split('-').map(Number),c=d.channels_all.find(z=>z.gate_a===a&&z.gate_b===b);
    const st=chState(d,c);
    const newC=[...new Set([c.center_a,c.center_b])].filter(z=>!natC.has(z));
    const tag=st==='nat'?'შენი ნატალური':st==='hang'?`შენი ${N.has(a)?a:b} · საჭიროა ${N.has(a)?b:a}`:'ორივე კარიბჭე ტრანზიტით';
    let rows;
    if(st==='nat')rows='<div class="tr-empty">ეს არხი ნატალურად მუდმივად ღიაა — ტრანზიტი მას არ ცვლის</div>';
    else{
      const iv=intersect(coverage(d,a),coverage(d,b));
      rows=iv.length?iv.map(v=>rowHTML(v.s,v.e,`${whoIn(d,a,v.s,v.e)} · ${whoIn(d,b,v.s,v.e)}`,
        newC.length?'+'+newC.map(CKA).join(', '):'')).join('')
        :'<div class="tr-empty">ამ პერიოდში არ იხსნება</div>';
      rows=`<div class="tr-empty" style="font-style:normal">${iv.length} ფანჯარა</div>`+rows;
    }
    return `<div class="rb"><div class="rb-h"><span>${a}–${b} ${c.name} <small>· ${tag}</small></span><span>${x}</span></div>${rows}</div>`;
  }).join('');
  box.querySelectorAll('.rb-x').forEach(b=>b.onclick=()=>{SEL.delete(b.dataset.k);renderPicker(d);renderResults(d);});
  box.querySelectorAll('.eye').forEach(b=>b.onclick=()=>{
    const p=jdParts(+b.dataset.jd,TZ());
    set('tt-year',p.y);set('tt-month',p.m);set('tt-day',p.d);set('tt-hour',p.h);set('tt-minute',p.mi);run();});
}
/* ── 🔎 nearest-activation search ─────────────────────────── */
const NS_BODIES=["Sun","Earth","Moon","North Node","South Node","Mercury","Venus","Mars",
  "Jupiter","Saturn","Uranus","Neptune","Pluto"];
let nsMode='planet_gate',nsLast=null;
function nsInit(){
  $('ns-planet').innerHTML=NS_BODIES.map(b=>`<option value="${b}">${GLY(b)} ${BODY_KA[b]||b}</option>`).join('');
  let go='';for(let g=1;g<=64;g++)go+=`<option value="${g}">${g} · ${CKA(GATE_TO_CENTER[g])}</option>`;
  $('ns-gate').innerHTML=go;
  const CH=(typeof CHANNELS!=='undefined'?CHANNELS:[]);
  $('ns-chan').innerHTML=CH.map(c=>`<option value="${c[0]}-${c[1]}">${c[0]}–${c[1]} · ${c[2]}</option>`).join('');
  document.querySelectorAll('#ns .ns-modes button').forEach(b=>b.onclick=()=>{
    nsMode=b.dataset.m;
    document.querySelectorAll('#ns .ns-modes button').forEach(x=>x.classList.toggle('on',x===b));
    $('ns-f-planet').style.display=nsMode==='planet_gate'?'':'none';
    $('ns-f-gate').style.display=nsMode==='channel'?'none':'';
    $('ns-f-chan').style.display=nsMode==='channel'?'':'none';
    $('ns-opt-natal').style.display=nsMode==='planet_gate'?'none':'';
    $('ns-opt-moon').style.display=nsMode==='planet_gate'?'none':'';
    $('ns-res').innerHTML='';});
  $('ns-go').onclick=()=>nsSearch(false);
}
const GLY=b=>(typeof PLANET_GLYPH!=='undefined'&&PLANET_GLYPH[b])||'';
function nsMoment(){
  const g=id=>+$(id).value;
  return {date:`${g('tt-year')}-${pad(g('tt-month'))}-${pad(g('tt-day'))}`,
          time:`${pad(g('tt-hour'))}:${pad(g('tt-minute'))}`,tz_name:TZ()};
}
async function nsSearch(more){
  const btn=$('ns-go'),box=$('ns-res');
  const useNatal=nsMode!=='planet_gate'&&document.querySelector('input[name=ns-nat]:checked').value==='1';
  const body={kind:nsMode,count:3,moon:nsMode!=='planet_gate'&&$('ns-moon').checked,from:nsMoment()};
  if(nsMode==='planet_gate'){body.planet=$('ns-planet').value;body.gate=+$('ns-gate').value;}
  else if(nsMode==='gate')body.gate=+$('ns-gate').value;
  else body.channel=$('ns-chan').value.split('-').map(Number);
  if(useNatal){
    if(!$('tn-lat').value&&$('n-lat')&&$('n-lat').value)copyNatal();
    if(!$('tn-lat').value){box.innerHTML='<div class="tr-empty">ნატალური რუქისთვის ზემოთ შეიყვანე დაბადების მონაცემები და ქალაქი — ან აირჩიე „მხოლოდ ტრანზიტი“.</div>';return;}
    const g=id=>+$(id).value;
    body.natal={date:`${g('tn-year')}-${pad(g('tn-month'))}-${pad(g('tn-day'))}`,time:`${pad(g('tn-hour'))}:${pad(g('tn-minute'))}`,
      lat:+$('tn-lat').value,lon:+$('tn-lon').value,tz_name:$('tn-tz').value||'UTC'};
  }
  if(more&&nsLast&&nsLast.windows.length){
    const w=nsLast.windows[nsLast.windows.length-1];
    if(w.end==null)return;
    const p=jdParts(w.end+1/1440,TZ());body.from={date:`${p.y}-${pad(p.m)}-${pad(p.d)}`,time:`${pad(p.h)}:${pad(p.mi)}`,tz_name:TZ()};
  }
  btn.disabled=true;btn.textContent='⏳ ვეძებ…';
  try{
    const r=await fetch(API_BASE+'/api/hd_transit_search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const raw=await r.text();let d;try{d=JSON.parse(raw);}catch(_){throw new Error('Backend error '+r.status);}
    if(!r.ok||d.error)throw new Error(d.error||('HTTP '+r.status));
    nsRender(d,body,more);
  }catch(e){box.innerHTML=`<div class="tr-empty" style="color:#e06060">შეცდომა: ${e.message}</div>`;}
  finally{btn.disabled=false;btn.textContent='🔎 ძებნა';}
}
function nsWho(d,w){
  return Object.entries(w.who).map(([g,bs])=>bs.includes('natal')?`${g} — შენი ნატალური`:
    `${g} — ${bs.map(b=>GLY(b)+' '+(BODY_KA[b]||b)).join(', ')}`).join(' · ');
}
function nsRender(d,body,more){
  const box=$('ns-res');
  let title;
  if(d.kind==='planet_gate')title=`${GLY(body.planet)} <b>${BODY_KA[body.planet]||body.planet}</b> კარიბჭე <b>${body.gate}</b>-ში`;
  else if(d.kind==='gate')title=`კარიბჭე <b>${d.gates[0]}</b> (${CKA(GATE_TO_CENTER[d.gates[0]])}) — ნებისმიერი ტრანზიტით${d.moon?', მთვარით':''}`;
  else{const c=d.channel;title=`არხი <b>${c.gate_a}–${c.gate_b}</b> ${c.name} — ${d.natal_used?
      (c.natal_gates.length?'შენი '+c.natal_gates.join(', ')+' + ტრანზიტი':'შენი ნატალით (კარიბჭე შენ არ გაქვს)'):'მხოლოდ ტრანზიტი'}${d.moon?', მთვარით':''}`;}
  const cards=d.windows.map((w,i)=>{
    const first=!more&&i===0;
    const when=w.active_now?`<b>ახლა აქტიურია</b><span class="nowb">ახლა</span> · დაიწყო ${w.start_local}`:`<b>${w.start_local}</b>`;
    const till=w.end_local?`დასრულდება ${w.end_local}`:'ძებნის ბოლომდე';
    const dur=w.days!=null?` · ${w.days>=1?w.days.toFixed(w.days<10?1:0)+' დღე':Math.max(1,Math.round(w.days*24))+' სთ'}`:'';
    return `<div class="ns-card${first?' first':''}">${first?'<div class="lbl">უახლოესი</div>':''}
      <div class="d">${when}</div><div class="m">${till}${dur}${w.retro?' · ℞ რეტროგრადული შესვლა':''}</div>
      <div class="w">${nsWho(d,w)}</div></div>`;}).join('');
  const html=(d.note?`<div class="ns-head">ℹ ${d.note}</div>`:'')+(cards||'')+
    (d.windows.length&&d.windows[d.windows.length-1].end!=null?'<button type="button" class="ns-more" id="ns-more">შემდეგი 3 ↓</button>':'');
  if(more){const old=$('ns-more');if(old)old.remove();box.insertAdjacentHTML('beforeend',html);}
  else box.innerHTML=`<div class="ns-head">${title}<br><span style="font-size:.7rem;color:var(--ink-dim)">${d.from_local}-დან</span></div>`+html;
  nsLast=d;
  const m=$('ns-more');if(m)m.onclick=()=>nsSearch(true);
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
