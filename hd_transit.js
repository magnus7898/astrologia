/* hd_transit.js — Human Design · ტრანზიტი
   Self-injecting tab for hd.html. Needs only, before </body>:
       <script src="hd_transit.js"></script>
   Backend: POST /api/hd_transit (hd_transit.py)

   Shows
     • natal + transit on one bodygraph (transit = blue)
     • channels opened right now: your hanging gate + transit body in the
       partner gate, and purely transit (collective) channels
     • the chart UNDER the transit (centers, type, authority) — conditioning
     • timeline: when each hanging channel opens, by which body, how long
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
let svgT=null,last=null,view='channel';

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
    s+=`svg.tr-nc-${c}.tr-nc-${c} .chakra[data-center='${n}']{fill-opacity:.5!important;stroke:${TCOL}!important;stroke-width:3px!important;stroke-dasharray:6 3!important}`;
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
.tr-ctrl{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.tr-ctrl select,.tr-ctrl button{background:var(--raised,#1a1424);color:var(--ink);border:1px solid var(--border);
  border-radius:6px;padding:5px 9px;font-size:.72rem;font-family:inherit;cursor:pointer}
.tr-ctrl button.on{border-color:${TCOL};color:#9cc8f4}
.tw{display:grid;grid-template-columns:120px 1fr auto;gap:8px;align-items:center;padding:6px 8px;
  border-bottom:1px solid rgba(255,255,255,.04);font-size:.74rem}
.tw:hover{background:rgba(58,141,222,.05)}
.tw .who{color:#9cc8f4;white-space:nowrap}.tw .when{color:var(--ink)}.tw .sub{color:var(--ink-dim);font-size:.66rem}
.tw .nowb{display:inline-block;background:${TCOL};color:#fff;border-radius:3px;padding:0 5px;font-size:.6rem;margin-left:5px}
.tw .nc{display:inline-block;border:1px dashed ${TCOL};color:#9cc8f4;border-radius:3px;padding:0 5px;font-size:.6rem;margin-left:4px}
.tw .eye{background:none;border:1px solid var(--border);color:var(--ink-mid);border-radius:5px;padding:2px 7px;cursor:pointer;font-size:.7rem}
.tg-h{font-family:'Cinzel',serif;font-size:.62rem;letter-spacing:.12em;color:var(--gold);margin:14px 0 4px;
  padding-bottom:4px;border-bottom:1px solid var(--border)}
.tg-h small{color:var(--ink-dim);letter-spacing:0;font-family:inherit;margin-left:6px}
.tr-empty{color:var(--ink-dim);font-style:italic;font-size:.74rem;padding:4px 8px}
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
      <div class="leg-item"><div class="leg-dot" style="background:transparent;border:2px dashed ${TCOL}"></div>ტრანზიტით განსაზღვრული ცენტრი</div>
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
      <h2>როდის გაიხსნება არხები <small id="tr-tl-count"></small></h2>
      <div class="tr-note">შენი „ჩამოკიდებული“ კარიბჭე + ტრანზიტული პლანეტა მეწყვილე კარიბჭეში = არხი ღიაა, სანამ პლანეტა იქ დგას.
        ℞ — რეტროგრადული გავლა (იგივე კარიბჭე შეიძლება რამდენჯერმე გაიაროს).</div>
      <div class="tr-ctrl">
        <button type="button" data-v="channel" class="on">არხების მიხედვით</button>
        <button type="button" data-v="time">ქრონოლოგიით</button>
        <select id="tr-fplanet"><option value="">ყველა პლანეტა</option></select>
      </div>
      <div id="tr-tl"></div>
    </div>`;
  const syn=$('results-synastry');
  (syn&&syn.parentNode?syn.parentNode:document.body).insertBefore(sec,syn?syn.nextSibling:null);

  $('tr-run').onclick=run;
  $('tr-copy').onclick=copyNatal;
  $('tr-now').onclick=()=>{const n=new Date();
    set('tt-day',n.getDate());set('tt-month',n.getMonth()+1);set('tt-year',n.getFullYear());
    set('tt-hour',n.getHours());set('tt-minute',n.getMinutes());};
  sec.querySelectorAll('.tr-ctrl button').forEach(b=>b.onclick=()=>{
    view=b.dataset.v;sec.querySelectorAll('.tr-ctrl button').forEach(x=>x.classList.toggle('on',x===b));
    if(last)renderTimeline(last);});
  $('tr-fplanet').onchange=()=>{if(last)renderTimeline(last);};

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

  const fp=$('tr-fplanet'),keep=fp.value;
  const ps=[...new Set(d.timeline.windows.map(w=>w.planet))];
  fp.innerHTML='<option value="">ყველა პლანეტა</option>'+(typeof PLANET_ORDER!=='undefined'?PLANET_ORDER:ps).filter(p=>ps.includes(p))
    .map(p=>`<option value="${p}"${p===keep?' selected':''}>${BODY_KA[p]||p}</option>`).join('');
  renderTimeline(d);

  $('results-transit').classList.remove('hidden');
  ['results-natal','results-synastry'].forEach(id=>{const e=$(id);if(e)e.classList.add('hidden');});
  $('results-transit').scrollIntoView({behavior:'smooth',block:'start'});
}

function winRow(w,showCh){
  const dur=w.days>=1?`${w.days.toFixed(w.days<10?1:0)} დღე`:`${Math.round(w.days*24)} სთ`;
  return `<div class="tw">
    <span class="who">${w.glyph} ${BODY_KA[w.planet]||w.planet}${w.retrograde?' ℞':''}<br><span class="sub">კარიბჭე ${w.gate}</span></span>
    <span><span class="when">${w.open_start?'უკვე ღიაა':w.start} → ${w.open_end?'პერიოდის ბოლომდე':w.end}</span>${w.open_start?'<span class="nowb">ახლა</span>':''}
      <br><span class="sub">${showCh?`${w.gate_a}–${w.gate_b} ${w.name} · `:''}${dur}</span>${w.new_centers.map(c=>`<span class="nc">+${CKA(c)}</span>`).join('')}</span>
    <button type="button" class="eye" data-jd="${(w.start_jd+w.end_jd)/2}" title="ამ მომენტის გრაფიკი">👁</button>
  </div>`;
}
function renderTimeline(d){
  const T=d.timeline,f=$('tr-fplanet').value;
  const W=T.windows.filter(w=>!f||w.planet===f);
  const per=T.days>=365?`${Math.round(T.days/365)} წელი`:`${T.days} დღე`;
  $('tr-tl-count').textContent=`${W.length} ფანჯარა · ${per}${T.moon?' · მთვარით':''}`;
  let h='';
  if(view==='time'){
    h=W.length?W.map(w=>winRow(w,true)).join(''):'<div class="tr-empty">ამ პერიოდში აქტივაცია არ არის</div>';
  }else{
    /* every hanging channel, even those that never open in the period */
    const seen=new Set(),chans=[];
    Object.values(T.targets).flat().forEach(c=>{const k=c.gate_a+'-'+c.gate_b;if(!seen.has(k)){seen.add(k);chans.push(c);}});
    chans.sort((a,b)=>a.gate_a-b.gate_a||a.gate_b-b.gate_b);
    for(const c of chans){
      const ws=W.filter(w=>w.gate_a===c.gate_a&&w.gate_b===c.gate_b);
      const miss=c.natal_gate===c.gate_a?c.gate_b:c.gate_a;
      h+=`<div class="tg-h">${c.gate_a}–${c.gate_b} ${c.name}<small>შენი ${c.natal_gate} · საჭიროა ${miss} · ${ws.length} ფანჯარა</small></div>`;
      h+=ws.length?ws.map(w=>winRow(w,false)).join(''):'<div class="tr-empty">ამ პერიოდში არ იხსნება</div>';
    }
    if(!chans.length)h='<div class="tr-empty">ჩამოკიდებული კარიბჭე არ არის</div>';
  }
  $('tr-tl').innerHTML=h;
  $('tr-tl').querySelectorAll('.eye').forEach(b=>b.onclick=()=>{
    const p=jdParts(+b.dataset.jd,Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC');
    set('tt-year',p.y);set('tt-month',p.m);set('tt-day',p.d);set('tt-hour',p.h);set('tt-minute',p.mi);run();});
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
