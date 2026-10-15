/* hd_find.js — Human Design · 🔎 ძებნა წარსულში / მომავალში
   Self-injecting tab of its own (🔎 ძებნა, after ტრანზიტი; needs hd_transit.js first).
   hd.html needs only, after hd_transit.js:   <script src="hd_find.js"></script>
   Runs entirely in the browser (Astronomy Engine from jsDelivr) — no server,
   any moment from year −3000 to 9999.

   One search bar for:
     • ტიპი (5)                     — when a person is / was born with it
     • პროფილი 1/3 … 6/3            — same
     • საკვები (დიზაინის მზის ფერი)   — digestion, with or without the arrow
     • გარემო (დიზაინის კვანძის ფერი) — environment
     • მოტივაცია / პერსპექტივა        — personality Sun / Node color
     • ცენტრი (ჩაკრა)                 — when transit defines it in YOUR chart
                                        (or in the sky alone)
   ◀ წარსული / მომავალი ▶ from the chosen moment (default: now); centers use
   the ნატალური tab's data; "↧ ნატალში" opens the chart of a found moment.                                                   */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const TCOL='#3A8DDE';
const pad=n=>String(n).padStart(2,'0');
const TZ=()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';

/* ── catalogue (labels = hd_calc.py tables) ── */
const PROF={"1/3":"ცოდნისა და სიმართლის დამამკვიდრებელი","1/4":"ყოვლისმცოდნე მასწავლებელი","2/4":"ადვილი გენიოსი",
  "2/5":"უნებლიე გმირი","3/5":"ცხოვრების დიდი ექსპერიმენტატორი","3/6":"ცოცხალი კონტრასტი","4/1":"ლაღი ცხოვრება",
  "4/2":"მეგობრობის საფუძველი","4/6":"სამეფო ავტორიტეტი","5/1":"გამოწვევების გადამჭრელი","5/2":"თვითმოტივირებული გმირი",
  "6/2":"სანიმუშო ადამიანი","6/3":"პასუხისმგებელი მოგზაური"};
const T6=(a)=>a.map(([b,l,r])=>({base:b,left:l,right:r}));
const VARS={
  digestion:{g:'საკვები',sub:'დიზაინის ☉ ფერი · Digestion',keys:'food diet digestion კვება საკვები დიეტა',
    t:T6([['მადა','თანმიმდევრული','მონაცვლეობითი'],['გემო','ღია','დახურული'],['წყურვილი','ცხელი','ცივი'],
          ['შეხება','მშვიდი','ნერვული'],['ხმა','მაღალი','დაბალი'],['სინათლე','პირდაპირი','ირიბი']])},
  environment:{g:'გარემო',sub:'დიზაინის ☊ ფერი · Environment',keys:'environment გარემო ადგილი',
    t:T6([['მღვიმეები','შერჩევითი','შერწყმული'],['ბაზრები','შიდა','გარე'],['სამზარეულო','ნესტიანი','მშრალი'],
          ['მთები','აქტიური','პასიური'],['ველები','ვიწრო','ფართო'],['სანაპირო','ბუნებრივი','ხელოვნური']])},
  motivation:{g:'მოტივაცია',sub:'პიროვნების ☉ ფერი · Motivation',keys:'motivation მოტივაცია',
    t:T6([['შიში','კომუნალისტი','სეპარატისტი'],['იმედი','თეისტი','ანტითეისტი'],['სურვილი','ლიდერი','მიმდევარი'],
          ['საჭიროება','ოსტატი','ახალბედა'],['დანაშაული','კონდიციონერი','კონდიცირებული'],['უდანაშაულობა','დამკვირვებელი','დაკვირვებული']])},
  perspective:{g:'პერსპექტივა',sub:'პიროვნების ☊ ფერი · Perspective / View',keys:'perspective view ხედვა პერსპექტივა',
    t:T6([['გადარჩენა','ფოკუსირებული','პერიფერიული'],['შესაძლებლობა','ფოკუსირებული','პერიფერიული'],['ძალა','ფოკუსირებული','პერიფერიული'],
          ['სურვილი','ფოკუსირებული','პერიფერიული'],['ალბათობა','ფოკუსირებული','პერიფერიული'],['პირადი','ფოკუსირებული','პერიფერიული']])},
};
const CEN=[['Head','თავი','head crown თხემის'],['Ajna','აჯნა','ajna mind გონება მესამე თვალი'],['Throat','ყელი','throat'],
  ['G','G · მე','g self identity იდენტობა გული ცენტრი'],['Heart','გული · ეგო','heart ego will ნება'],
  ['Solar Plexus','მზის წნული','solar plexus emotions ემოცია'],['Spleen','ელენთა','spleen სპლენი ინტუიცია'],
  ['Sacral','საკრალი','sacral სიცოცხლე'],['Root','ფესვი','root ფუძე']];
const ITEMS=[];
[['Manifestor','მანიფესტორი','manifestor მანიფესტორი'],['Generator','გენერატორი','generator გენერატორი'],
 ['Manifesting Generator','მანიფესტირებადი გენერატორი','manifesting generator mg მანიფესტირებადი'],
 ['Projector','პროექტორი','projector პროექტორი'],['Reflector','რეფლექტორი','reflector რეფლექტორი']]
 .forEach(([en,ka,k])=>ITEMS.push({kind:'type',value:en,side:null,grp:'ტიპი',label:`${ka} (${en})`,keys:`type ტიპი ${k}`}));
Object.entries(PROF).forEach(([k,n])=>ITEMS.push({kind:'profile',value:k,side:null,grp:'პროფილი',
  label:`${k} — ${n}`,keys:`profile პროფილი ${k} ${k.replace('/','')}`}));
Object.entries(VARS).forEach(([kind,V])=>V.t.forEach((x,i)=>{
  const c=i+1,kk=`${V.keys} ${V.g} ფერი color ${c}`;
  ITEMS.push({kind,value:c,side:null,grp:V.g,label:`${x.base} · ფერი ${c} (ორივე ისარი)`,keys:kk});
  ITEMS.push({kind,value:c,side:'left',grp:V.g,label:`${x.base} — ${x.left} · ←`,keys:kk+' left მარცხენა'});
  ITEMS.push({kind,value:c,side:'right',grp:V.g,label:`${x.base} — ${x.right} · →`,keys:kk+' right მარჯვენა'});
}));
CEN.forEach(([en,ka,k])=>ITEMS.push({kind:'center',value:en,side:null,grp:'ცენტრი',label:`${ka} (${en})`,
  keys:`center ცენტრი ჩაკრა chakra ${en} ${k} განსაზღვრა აქტივაცია`}));
const GROUPS=['ტიპი','პროფილი','საკვები','გარემო','მოტივაცია','პერსპექტივა','ცენტრი'];
const GHELP={'ტიპი':'როდის იბადება / დაიბადა ადამიანი ამ ტიპით (რეფლექტორი იშვიათია — ძებნა ~10 წმ)','პროფილი':'როდის იბადება / დაიბადა ადამიანი ამ პროფილით',
  'საკვები':'დიზაინის მზის ფერი · ← / → ისარი ტონიდან (1-3 / 4-6)','გარემო':'დიზაინის ჩრდ. კვანძის ფერი',
  'მოტივაცია':'პიროვნების მზის ფერი','პერსპექტივა':'პიროვნების ჩრდ. კვანძის ფერი',
  'ცენტრი':'როდის განსაზღვრავს ტრანზიტი ამ ცენტრს შენს რუქაში (ან თვითონ ცაში)'};
const BODY_KA={"Sun":"☉ მზე","Earth":"⊕ დედამიწა","North Node":"☊ ჩრდ. კვანძი","South Node":"☋ სამხ. კვანძი",
  "Moon":"☽ მთვარე","Mercury":"☿ მერკური","Venus":"♀ ვენერა","Mars":"♂ მარსი","Jupiter":"♃ იუპიტერი",
  "Saturn":"♄ სატურნი","Uranus":"♅ ურანი","Neptune":"♆ ნეპტუნი","Pluto":"♇ პლუტონი"};

let sel=null,dir='next',last=null,lastBody=null,hi=-1,grpF=null;

function css(){
  const s=document.createElement('style');s.textContent=`
#hf{margin-top:18px;padding-top:14px;border-top:1px dashed var(--border)}
#hf .hf-box{position:relative}
#hf-q{width:100%;background:var(--raised,#1a1424);border:1px solid ${TCOL};border-radius:8px;color:var(--ink,#eee);
  padding:10px 12px 10px 34px;font:inherit;font-size:.86rem;outline:none}
#hf .hf-ic{position:absolute;left:11px;top:9px;opacity:.7;pointer-events:none}
#hf-dd{position:absolute;left:0;right:0;top:100%;margin-top:4px;z-index:30;max-height:300px;overflow:auto;background:#140f22;
  border:1px solid var(--border);border-radius:8px;box-shadow:0 14px 34px rgba(0,0,0,.55)}
#hf-dd[hidden]{display:none}
#hf-dd .g{font-size:.6rem;letter-spacing:2px;color:${TCOL};padding:8px 10px 3px;text-transform:uppercase}
#hf-dd .it{padding:6px 12px;font-size:.78rem;color:var(--ink-mid);cursor:pointer}
#hf-dd .it.on,#hf-dd .it:hover{background:rgba(58,141,222,.14);color:#cfe3fa}
#hf .hf-chips{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}
#hf .hf-chips button,#hf .hf-dir button{background:none;border:1px solid var(--border);color:var(--ink-mid);border-radius:14px;
  padding:3px 10px;font:inherit;font-size:.68rem;cursor:pointer}
#hf .hf-chips button.on,#hf .hf-dir button.on{border-color:${TCOL};color:#cfe3fa;background:rgba(58,141,222,.12)}
#hf .hf-sel{font-size:.76rem;color:#cfe3fa;margin:6px 0 2px;min-height:18px}
#hf .hf-sel small{color:var(--ink-dim)}
#hf .hf-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
#hf .hf-row select{background:var(--raised,#1a1424);color:var(--ink-mid);border:1px solid var(--border);border-radius:6px;padding:4px 6px;font:inherit;font-size:.72rem}
#hf .hf-opt{font-size:.7rem;color:var(--ink-mid);display:flex;flex-wrap:wrap;gap:12px;margin:4px 0}
#hf .hf-opt[hidden]{display:none}
#hf .hf-card .act{margin-top:6px}
#hf .hf-card .act button{background:none;border:1px solid var(--border);color:var(--gold,#c9a84c);border-radius:5px;padding:2px 9px;font:inherit;font-size:.66rem;cursor:pointer}`;
  document.head.appendChild(s);
}

const num=(id,l,v,a,b)=>`<div class="field"><label>${l}</label><input type="number" id="${id}" value="${v}" min="${a}" max="${b}"></div>`;
function inject(){
  if($('hf'))return true;
  const bar=document.querySelector('.tab-bar'),shell=document.querySelector('.form-shell');
  if(!bar||!shell||!$('tr-tab-btn'))return false;
  css();
  const tb=document.createElement('button');tb.className='tab-btn';tb.id='hf-tab-btn';tb.textContent='🔎 ძებნა';tb.onclick=activate;
  bar.appendChild(tb);
  const now=new Date();
  const sec=document.createElement('div');sec.id='form-find';sec.className='form-section';
  sec.innerHTML=`
    <div class="person-label" style="color:${TCOL}">🕐 საიდან ვეძებთ
      <button type="button" id="hf-now" style="margin-left:8px;background:none;border:1px solid var(--border);color:${TCOL};border-radius:5px;padding:1px 8px;cursor:pointer;font-size:.62rem">ახლა</button></div>
    <div class="form-row">${num('ff-day','დღე',now.getDate(),1,31)}${num('ff-month','თვე',now.getMonth()+1,1,12)}${num('ff-year','წელი (−3000…9999)',now.getFullYear(),-3000,9999)}</div>
    <div class="form-row">${num('ff-hour','საათი',now.getHours(),0,23)}${num('ff-minute','წუთი',now.getMinutes(),0,59)}</div>
    <div class="tz-row">🕐 ${TZ()} · ძვ.წ. წლები მინუსით (0 = ძვ.წ. 1, −500 = ძვ.წ. 501) · 1582-მდე იულიუსის კალენდარი · ცენტრები იყენებს „ნატალური“ ჩანართს</div>`;
  shell.appendChild(sec);
  const d=document.createElement('div');d.id='hf';d.style.borderTop='none';d.style.marginTop='6px';
  d.innerHTML=`
    <div class="person-label" style="color:${TCOL}">🔎 ძებნა წარსულში და მომავალში
      <span style="text-transform:none;letter-spacing:0;opacity:.75"> — ტიპი · პროფილი · საკვები · გარემო · ცენტრები</span></div>
    <div class="hf-box"><span class="hf-ic">🔎</span>
      <input id="hf-q" autocomplete="off" placeholder="მაგ. პროექტორი, 4/6, მადა, მთები, ყელი, ელენთა, sacral…">
      <div id="hf-dd" hidden></div></div>
    <div class="hf-chips" id="hf-chips">${GROUPS.map(g=>`<button type="button" data-g="${g}">${g}</button>`).join('')}</div>
    <div class="hf-sel" id="hf-sel"><small>აირჩიე, რას ეძებ — ჩაწერე ან დააჭირე ჯგუფს.</small></div>
    <div class="hf-row">
      <div class="hf-dir" id="hf-dir"><button type="button" data-d="prev">◀ წარსული</button> <button type="button" data-d="next" class="on">მომავალი ▶</button></div>
      <select id="hf-n"><option value="3">3</option><option value="5" selected>5</option><option value="10">10</option></select>
      <span style="font-size:.66rem;color:var(--ink-dim)">ზემოთ მითითებული მომენტიდან</span></div>
    <div class="hf-opt" id="hf-copt" hidden>
      <label><input type="radio" name="hf-nat" value="1" checked> ჩემს რუქაში (ნატალი + ტრანზიტი)</label>
      <label><input type="radio" name="hf-nat" value="0"> მხოლოდ ცაში</label>
      <label><input type="checkbox" id="hf-moon"> მთვარის ჩათვლით</label></div>
    <button type="button" class="ns-go" id="hf-go">🔎 ძებნა</button>
    <div class="ns-res" id="hf-res"></div>`;
  sec.appendChild(d);
  $('hf-now').onclick=()=>{const n=new Date(),st=(i,v)=>{$(i).value=v;};
    st('ff-day',n.getDate());st('ff-month',n.getMonth()+1);st('ff-year',n.getFullYear());st('ff-hour',n.getHours());st('ff-minute',n.getMinutes());};
  /* keep the page's setMode() and the transit tab from leaving this tab lit */
  if(typeof setMode==='function'&&!setMode._hf){
    const o=window.setMode||setMode;
    const w=function(m){o(m);tb.classList.remove('active');sec.classList.remove('active');};
    w._hf=true;w._tr=o._tr;window.setMode=w;
  }
  const trb=$('tr-tab-btn');if(trb)trb.addEventListener('click',()=>{tb.classList.remove('active');sec.classList.remove('active');});

  const q=$('hf-q'),dd=$('hf-dd');
  q.addEventListener('focus',()=>drop());
  q.addEventListener('input',()=>{grpF=null;chips();drop();});
  q.addEventListener('keydown',e=>{
    const its=[...dd.querySelectorAll('.it')];
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(dd.hidden)drop();
      hi=Math.max(0,Math.min(its.length-1,hi+(e.key==='ArrowDown'?1:-1)));its.forEach((x,i)=>x.classList.toggle('on',i===hi));
      its[hi]&&its[hi].scrollIntoView({block:'nearest'});}
    else if(e.key==='Enter'){e.preventDefault();
      if(!dd.hidden&&its.length)pick(+its[Math.max(0,hi)].dataset.i);else if(sel)search(false);}
    else if(e.key==='Escape')dd.hidden=true;});
  document.addEventListener('pointerdown',e=>{if(!$('hf').contains(e.target))dd.hidden=true;});
  $('hf-chips').querySelectorAll('button').forEach(b=>b.onclick=()=>{grpF=grpF===b.dataset.g?null:b.dataset.g;q.value='';chips();drop();q.focus();});
  $('hf-dir').querySelectorAll('button').forEach(b=>b.onclick=()=>{dir=b.dataset.d;
    $('hf-dir').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(sel)search(false);});
  $('hf-go').onclick=()=>search(false);
  return true;
}
function activate(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  $('hf-tab-btn').classList.add('active');
  document.querySelectorAll('.form-section').forEach(s=>s.classList.remove('active'));
  $('form-find').classList.add('active');
  ['results-natal','results-synastry','results-transit'].forEach(id=>{const e=$(id);if(e)e.classList.add('hidden');});
  try{currentMode='find';}catch(e){}
  const st=$('status');if(st)st.textContent='';
}
function chips(){$('hf-chips').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.g===grpF));}
function match(it,qs){const h=(it.label+' '+it.keys+' '+it.grp).toLowerCase();return qs.every(t=>h.includes(t));}
function drop(){
  const dd=$('hf-dd'),qs=$('hf-q').value.toLowerCase().split(/\s+/).filter(Boolean);
  let list=ITEMS.map((it,i)=>[it,i]).filter(([it])=>(!grpF||it.grp===grpF)&&match(it,qs));
  if(!qs.length&&!grpF){dd.hidden=true;return;}
  list=list.slice(0,60);hi=-1;
  if(!list.length){dd.innerHTML='<div class="it" style="cursor:default">ვერაფერი მოიძებნა</div>';dd.hidden=false;return;}
  let html='',g='';
  for(const [it,i] of list){if(it.grp!==g){g=it.grp;html+=`<div class="g">${g} · <span style="text-transform:none;letter-spacing:0;color:var(--ink-dim)">${GHELP[g]}</span></div>`;}
    html+=`<div class="it" data-i="${i}">${it.label}</div>`;}
  dd.innerHTML=html;dd.hidden=false;
  dd.querySelectorAll('.it[data-i]').forEach(x=>x.onclick=()=>pick(+x.dataset.i));
}
function pick(i){
  sel=ITEMS[i];$('hf-dd').hidden=true;$('hf-q').value=sel.label;
  $('hf-sel').innerHTML=`<b>${sel.grp}</b> · ${sel.label}<br><small>${GHELP[sel.grp]}</small>`;
  $('hf-copt').hidden=sel.kind!=='center';
  search(false);
}

/* ════ in-browser engine (Astronomy Engine) — no server, years −3000 … 9999 ════
   Same conventions as hd_calc.py: tropical apparent geocentric longitudes of
   date, true (osculating) North Node, design = Sun 88° earlier, arrow = tone
   1-3 left / 4-6 right. Checked against Swiss Ephemeris 1900-2100: planets
   within 18″, Moon within 53″ (a color is 562″ wide) → edges within ~1-2 min.
   Calendar: Julian before 1582-10-15, Gregorian after; astronomical years
   (0 = 1 BC, −500 = 501 BC). Before 1850 / after 2150 the zone's standard
   offset is used (no LMT / DST guesses).                                     */
const AE_URL='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
let aeP=null;
function needAE(){
  if(window.Astronomy)return Promise.resolve(window.Astronomy);
  if(!aeP)aeP=new Promise((ok,no)=>{const s=document.createElement('script');s.src=AE_URL;
    s.onload=()=>ok(window.Astronomy);s.onerror=()=>{aeP=null;no(new Error('ასტრონომიული ბიბლიოთეკა ვერ ჩაიტვირთა'));};document.head.appendChild(s);});
  return aeP;
}
const GATE_ORDER=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
  31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
const CG={"Head":[64,61,63],"Ajna":[47,24,4,17,11,43],"Throat":[62,23,56,16,35,12,45,33,8,31,20],"G":[1,2,7,10,13,15,25,46],
  "Heart":[21,26,40,51],"Solar Plexus":[6,22,30,36,37,49,55],"Spleen":[18,28,32,44,48,50,57],"Sacral":[3,5,9,14,27,29,34,42,59],
  "Root":[19,38,39,41,52,53,54,58,60]};
const G2C={};for(const c in CG)CG[c].forEach(g=>G2C[g]=c);
const CH=[[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],
  [18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],
  [37,40],[39,55],[42,53],[47,64]];
const MOTORS=new Set(['Heart','Sacral','Solar Plexus','Root']);
const PLAN=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const GW=360/64;
function decomp(lon){
  const off=(((lon-302)%360)+360)%360,gi=Math.floor(off/GW);let r=off-gi*GW;
  const lw=GW/6,line=Math.min(6,Math.floor(r/lw)+1);r-=(line-1)*lw;
  const cw=lw/6,color=Math.min(6,Math.floor(r/cw)+1);r-=(color-1)*cw;
  const tone=Math.min(6,Math.floor(r/(cw/6))+1);
  return {gate:GATE_ORDER[gi],line,color,tone};
}
const arrow=t=>t<=3?'left':'right';
let A=null;
const aT=jd=>A.MakeTime(jd-2451545.0);
function sunL(jd){return A.Ecliptic(A.GeoVector('Sun',aT(jd),true)).elon;}
const SLOW=new Set(['Jupiter','Saturn','Uranus','Neptune','Pluto']),slowC=new Map();
/* Pluto outside years 0–4000: Astronomy Engine re-integrates the orbit on
   every call (~0.5 s). Its heliocentric path is smooth, so it is sampled every
   100 days and interpolated (4-point Lagrange); Earth stays exact. */
const plC=new Map();
function plutoFar(t){
  const k0=Math.floor(t.ut/100),f=t.ut/100-k0,S=[];
  for(let k=k0-1;k<=k0+2;k++){let v=plC.get(k);if(!v){const h=A.HelioVector('Pluto',A.MakeTime(k*100));v=[h.x,h.y,h.z];if(plC.size>400)plC.clear();plC.set(k,v);}S.push(v);}
  const w=[-f*(f-1)*(f-2)/6,(f+1)*(f-1)*(f-2)/2,-(f+1)*f*(f-2)/2,(f+1)*f*(f-1)/6];
  const P=[0,1,2].map(i=>w[0]*S[0][i]+w[1]*S[1][i]+w[2]*S[2][i]+w[3]*S[3][i]);
  const E=A.HelioVector('Earth',t);
  return A.Ecliptic(new A.Vector(P[0]-E.x,P[1]-E.y,P[2]-E.z,t)).elon;
}
function rawL(b,t){
  if(b==='Pluto'&&Math.abs(t.ut)>730000)return plutoFar(t);
  return A.Ecliptic(A.GeoVector(b,t,true)).elon;}
function bodyL(b,t){
  if(!SLOW.has(b))return rawL(b,t);
  /* slow bodies: daily samples, linear in between — < 1″ off, ~3× faster */
  const x=t.ut,d0=Math.floor(x),f=x-d0,get=d=>{const k=b+d;let v=slowC.get(k);
    if(v===undefined){v=rawL(b,A.MakeTime(d));if(slowC.size>20000)slowC.clear();slowC.set(k,v);}return v;};
  const a=get(d0),c=get(d0+1),dl=((c-a+540)%360)-180;return (a+dl*f+360)%360;
}
function nodeL(jd){const t=aT(jd),s=A.GeoMoonState(t),R=A.Rotation_EQJ_ECT(t);
  const r=A.RotateVector(R,new A.Vector(s.x,s.y,s.z,t)),v=A.RotateVector(R,new A.Vector(s.vx,s.vy,s.vz,t));
  const hx=r.y*v.z-r.z*v.y,hy=r.z*v.x-r.x*v.z;return ((Math.atan2(hx,-hy)*180/Math.PI)%360+360)%360;}
let dOff=-89.5;
function designJD(jd){
  const tgt=sunL(jd)-88;let j=jd+dOff;
  for(let i=0;i<20;i++){const d=((sunL(j)-tgt)%360+540)%360-180;if(Math.abs(d)<1e-7)break;j-=d/0.9856;}
  dOff=j-jd;return j;
}
/* 13 activations → gate set (Moon optional for transit-only checks) */
function gatesAt(jd,moon=true){
  const t=aT(jd),S=new Set();
  for(const b of PLAN){if(b==='Moon'&&!moon)continue;S.add(decomp(bodyL(b,t)).gate);}
  const sl=bodyL('Sun',t);S.add(decomp(sl+180).gate);
  const n=nodeL(jd);S.add(decomp(n).gate);S.add(decomp(n+180).gate);
  return S;
}
function bodiesAt(jd,moon){
  const t=aT(jd),o={};
  for(const b of PLAN){if(b==='Moon'&&!moon)continue;o[b]=decomp(bodyL(b,t)).gate;}
  o['Earth']=decomp(bodyL('Sun',t)+180).gate;const n=nodeL(jd);o['North Node']=decomp(n).gate;o['South Node']=decomp(n+180).gate;
  return o;
}
function centersOf(G){const C=new Set(),adj={};for(const c in CG)adj[c]=new Set();
  for(const [a,b] of CH)if(G.has(a)&&G.has(b)){const x=G2C[a],y=G2C[b];C.add(x);C.add(y);if(x!==y){adj[x].add(y);adj[y].add(x);}}
  return {C,adj};}
function typeOf(G){
  const {C,adj}=centersOf(G);
  if(!C.size)return 'Reflector';
  let tm=false;if(C.has('Throat')){const seen=new Set(['Throat']),st=['Throat'];
    while(st.length){const n=st.pop();for(const m of adj[n])if(C.has(m)&&!seen.has(m)){seen.add(m);st.push(m);}}
    tm=[...seen].some(m=>MOTORS.has(m));}
  const sac=C.has('Sacral');
  return sac&&tm?'Manifesting Generator':sac?'Generator':tm?'Manifestor':'Projector';
}
function valueAt(kind,jd){
  if(kind==='type'){const G=gatesAt(jd);for(const g of gatesAt(designJD(jd)))G.add(g);return typeOf(G);}
  if(kind==='profile'){const s=sunL(jd);return decomp(s).line+'/'+decomp(s-88).line;}
  if(kind==='digestion'){const x=decomp(sunL(jd)-88);return [x.color,arrow(x.tone)];}
  if(kind==='motivation'){const x=decomp(sunL(jd));return [x.color,arrow(x.tone)];}
  if(kind==='environment'){const x=decomp(nodeL(designJD(jd)));return [x.color,arrow(x.tone)];}
  if(kind==='perspective'){const x=decomp(nodeL(jd));return [x.color,arrow(x.tone)];}
}
/* ── calendar (JD ↔ Julian/Gregorian, astronomical years) ── */
function calJD(y,m,d,h){
  if(m<=2){y-=1;m+=12;}
  const greg=(y>1582)||(y===1582&&(m>10||(m===10&&d>=15)));
  const B=greg?2-Math.floor(y/100)+Math.floor(Math.floor(y/100)/4):0;
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
function jdCal(jd){
  const z=Math.floor(jd+0.5),f=jd+0.5-z;let a=z;
  if(z>=2299161){const al=Math.floor((z-1867216.25)/36524.25);a=z+1+al-Math.floor(al/4);}
  const b=a+1524,c=Math.floor((b-122.1)/365.25),d=Math.floor(365.25*c),e=Math.floor((b-d)/30.6001);
  const day=b-d-Math.floor(30.6001*e),m=e<14?e-1:e-13,y=m>2?c-4716:c-4715;
  let mins=Math.round(f*1440);return {y,m,d:day,h:Math.floor(mins/60),mi:mins%60,carry:mins>=1440};
}
function tzOff(tz,jd){/* minutes east of UTC */
  const ms=(jd-2440587.5)*86400000,yr=new Date(ms).getUTCFullYear();
  const use=(yr>=1850&&yr<=2150)?ms:Date.UTC(2001,0,15);
  try{const o={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'})
    .formatToParts(new Date(use)).forEach(p=>o[p.type]=p.value);
    return Math.round((Date.UTC(+o.year,+o.month-1,+o.day,+o.hour,+o.minute)-Math.floor(use/60000)*60000)/60000);}catch(e){return 0;}
}
function localToJD(y,m,d,h,mi,tz){let jd=calJD(y,m,d,h+mi/60);const o1=tzOff(tz,jd);let u=jd-o1/1440;const o2=tzOff(tz,u);return jd-o2/1440;}
function parts(jd,tz){let p=jdCal(jd+tzOff(tz,jd)/1440);if(p.carry)p=jdCal(jd+tzOff(tz,jd)/1440+1e-6);return p;}
const yr=y=>y<0?'−'+String(-y).padStart(4,'0'):String(y).padStart(4,'0');
function fmt(jd,tz){const p=parts(jd,tz);return `${yr(p.y)}-${pad(p.m)}-${pad(p.d)} ${pad(p.h)}:${pad(p.mi)}`;}
const JMIN=calJD(-3000,1,1,0),JMAX=calJD(9999,12,31,24);

/* ── generic scanner: windows where ok(jd) is true ── */
const tick=()=>new Promise(r=>setTimeout(r,0));
let cancel=0;
function edge(ok,a,b){const fa=ok(a);for(let i=0;i<40&&Math.abs(b-a)>=1/1440;i++){const m=(a+b)/2;if(ok(m)===fa)a=m;else b=m;}return b;}
async function scan(ok,jd0,dirn,count,step,horizon,prog,my){
  const sg=dirn==='next'?1:-1,st=step*sg;
  const lo=Math.max(JMIN,jd0-horizon),hi=Math.min(JMAX,jd0+horizon),out=[];
  let t0=performance.now(),j=jd0;
  const breath=async(x)=>{if(performance.now()-t0>40){prog&&prog(x);await tick();t0=performance.now();if(my!==cancel)throw new Error('cancel');}};
  if(ok(jd0)){
    let s=jd0;while(s-step>lo&&ok(s-step)){s-=step;await breath(s);}
    s=s-step>lo?edge(ok,s,s-step):lo;
    let e=jd0;while(e+step<hi&&ok(e+step)){e+=step;await breath(e);}
    e=e+step<hi?edge(ok,e,e+step):hi;
    out.push([s,e,true,s<=lo+1e-9,e>=hi-1e-9]);j=sg>0?e:s;
  }
  let cur=ok(j);
  while(out.length<count){
    const jn=j+st;if(jn<lo||jn>hi)break;
    const nx=ok(jn);
    if(nx!==cur){
      const t=edge(ok,j,jn);
      if(nx){let k=t;while(k+st>lo&&k+st<hi&&ok(k+st)){k+=st;await breath(k);}
        const open=!(k+st>lo&&k+st<hi),b=open?(sg>0?hi:lo):edge(ok,k,k+st);
        out.push(sg>0?[t,b,false,false,open]:[b,t,false,open,false]);j=b;cur=false;continue;}
      j=t;cur=nx;continue;
    }
    j=jn;await breath(j);
  }
  return {wins:out,edge:j};
}

/* ── request ── */
function moment(){
  const g=id=>+(($(id)||{}).value||0);
  return localToJD(g('ff-year'),g('ff-month'),g('ff-day'),g('ff-hour'),g('ff-minute'),TZ());
}
function natalGates(){
  const P=$('n-lat')&&$('n-lat').value?'n':($('tn-lat')&&$('tn-lat').value?'tn':null);
  if(!P)return null;
  const g=id=>+$(P+'-'+id).value;
  const jd=localToJD(g('year'),g('month'),g('day'),g('hour'),g('minute'),$(P+'-tz').value||'UTC');
  const G=gatesAt(jd);for(const x of gatesAt(designJD(jd)))G.add(x);
  return G;
}
const STEP={type:1/48,profile:1/72,digestion:1/72,motivation:1/72,environment:1/24,perspective:1/24};
const HOR={type:800,profile:800,digestion:120,motivation:120,environment:1100,perspective:1100};
const TYPE_KA2={"Manifestor":"მანიფესტორი","Generator":"გენერატორი","Manifesting Generator":"მანიფესტირებადი გენერატორი","Projector":"პროექტორი","Reflector":"რეფლექტორი"};
async function search(more){
  if(!sel){$('hf-q').focus();drop();return;}
  const box=$('hf-res'),btn=$('hf-go'),tz=TZ(),tok=++cancel;
  let jd0=moment();
  if(more&&last&&last.windows.length){
    const w=last.windows[last.windows.length-1];
    jd0=dir==='next'?w.end+1/1440:w.start-1/1440;
  }
  if(!(jd0>=JMIN&&jd0<=JMAX)){box.innerHTML='<div class="tr-empty" style="color:#e06060">თარიღი უნდა იყოს −3000 … 9999 წლებში.</div>';return;}
  btn.disabled=true;btn.textContent='⏳ ვეძებ…';
  const prog=jd=>{btn.textContent='⏳ '+fmt(jd,tz).slice(0,10);};
  try{
    A=await needAE();
    const d={kind:sel.kind,direction:dir,from_local:fmt(jd0,tz),windows:[]};
    const n=+$('hf-n').value;
    if(sel.kind==='center'){
      const moon=$('hf-moon').checked,mine=document.querySelector('input[name=hf-nat]:checked').value==='1';
      let N=new Set();
      if(mine){N=natalGates();
        if(!N){box.innerHTML='<div class="tr-empty">შენი რუქისთვის „ნატალური“ ჩანართში შეიყვანე დაბადების მონაცემები და აირჩიე ქალაქი — ან აქ აირჩიე „მხოლოდ ცაში“.</div>';return;}}
      const cen=sel.value,ka=sel.label.split(' (')[0];
      d.label=ka+' ცენტრის განსაზღვრა';d.natal_used=mine;
      if(mine&&centersOf(N).C.has(cen)){d.note='ეს ცენტრი შენს ნატალურ რუქაში უკვე განსაზღვრულია — ტრანზიტი მას არ „ააქტიურებს“, ის მუდამ შენია.';}
      else{
        const ok=jd=>{const G=gatesAt(jd,moon);for(const g of N)G.add(g);return centersOf(G).C.has(cen);};
        const r=await scan(ok,jd0,dir,n,moon?1/48:1/8,moon?400:20*365.25,prog,tok);
        d.windows=r.wins.map(([s,e,now,os,oe])=>{
          const mid=(s+e)/2,B=bodiesAt(mid,moon),G=new Set(Object.values(B));for(const g of N)G.add(g);
          const chs=CH.filter(([a,b])=>G.has(a)&&G.has(b)&&(G2C[a]===cen||G2C[b]===cen));
          const gs=new Set(chs.flat());
          return {start:s,end:e,start_local:os?null:fmt(s,tz),end_local:oe?null:fmt(e,tz),days:(os||oe)?null:e-s,active_now:now,
            channels:chs.map(c=>c.join('-')),bodies:Object.keys(B).filter(b=>gs.has(B[b])&&!N.has(B[b]))};});
        if(!d.windows.length)d.note='ამ ჰორიზონტზე ვერ მოიძებნა.';
      }
    }else{
      const k=sel.kind,v=sel.value,sd=sel.side;
      const ok=k==='type'?(jd=>valueAt(k,jd)===v):k==='profile'?(jd=>valueAt(k,jd)===v)
        :(jd=>{const x=valueAt(k,jd);return x[0]===v&&(!sd||x[1]===sd);});
      d.label=k==='type'?'ტიპი · '+TYPE_KA2[v]:k==='profile'?sel.label:sel.label.replace(' · ←','').replace(' · →','');
      const r=await scan(ok,jd0,dir,n,STEP[k],HOR[k],prog,tok);
      d.windows=r.wins.map(([s,e,now])=>({start:s,end:e,start_local:fmt(s,tz),end_local:fmt(e,tz),mid_local:fmt((s+e)/2,tz),hours:(e-s)*24,active_now:now}));
      if(!d.windows.length)d.note='ვერ მოიძებნა '+fmt(r.edge,tz).slice(0,5).replace(/-$/,'')+'-მდე.';
    }
    render(d,more);
  }catch(e){if(e.message!=='cancel')box.innerHTML=`<div class="tr-empty" style="color:#e06060">შეცდომა: ${e.message}</div>`;}
  finally{if(tok===cancel){btn.disabled=false;btn.textContent='🔎 ძებნა';}}
}

/* ── results ── */
function dur(w){
  if(w.hours!=null){const h=w.hours;return h>=48?(h/24).toFixed(1)+' დღე':h>=1?Math.floor(h)+' სთ '+pad(Math.round((h%1)*60))+' წთ':Math.round(h*60)+' წთ';}
  if(w.days!=null)return w.days>=1?w.days.toFixed(w.days<10?1:0)+' დღე':Math.max(1,Math.round(w.days*24))+' სთ';
  return '';
}
function chName(k){const [a,b]=k.split('-').map(Number);const C=(typeof CHANNELS!=='undefined'?CHANNELS:[]).find(c=>c[0]===a&&c[1]===b);
  return `${a}–${b}${C?' '+C[2]:''}`;}
function render(d,more){
  const box=$('hf-res');
  const cards=d.windows.map((w,i)=>{
    const first=!more&&i===0&&!w.active_now;
    const s=w.start_local||'ძებნის საწყისამდე',e=w.end_local||'ძებნის ბოლომდე';
    const when=w.active_now?`<b>ახლა მიმდინარეობს</b><span class="nowb">ახლა</span>`:`<b>${s}</b>`;
    const D=dur(w);
    let extra='';
    if(d.kind==='center')extra=`<div class="w">არხი: ${w.channels.map(chName).join(' · ')}<br>ტრანზიტი: ${w.bodies.map(b=>BODY_KA[b]||b).join(', ')||'—'}</div>`;
    else extra=`<div class="act"><button type="button" data-mid="${(w.start+w.end)/2}">↧ ნატალში — ${w.mid_local}</button></div>`;
    return `<div class="ns-card hf-card${first?' first':''}">${first?`<div class="lbl">${d.direction==='next'?'უახლოესი':'ბოლო'}</div>`:''}
      <div class="d">${when}</div><div class="m">${s} → ${e}${D?' · '+D:''}</div>${extra}</div>`;}).join('');
  const lw=d.windows[d.windows.length-1];
  const canMore=lw&&(d.direction==='next'?lw.end_local:lw.start_local);
  const html=(d.note?`<div class="ns-head">ℹ ${d.note}</div>`:'')+cards+
    (canMore?`<button type="button" class="ns-more" id="hf-more">${d.direction==='next'?'შემდეგი ↓':'უფრო ადრე ↓'}</button>`:'');
  if(more){const o=$('hf-more');if(o)o.remove();box.insertAdjacentHTML('beforeend',html);}
  else{
    const who=d.kind==='center'?(d.natal_used?' — შენს რუქაში':' — მხოლოდ ცაში'):' — ამ დროს დაბადებულს';
    box.innerHTML=`<div class="ns-head"><b>${d.label}</b>${who}<br><span style="font-size:.7rem;color:var(--ink-dim)">${d.from_local}-დან ${d.direction==='next'?'მომავალში':'წარსულში'} · ${TZ()}</span></div>`+html;}
  last=d;
  const m=$('hf-more');if(m)m.onclick=()=>search(true);
  box.querySelectorAll('button[data-mid]').forEach(b=>b.onclick=()=>toNatal(+b.dataset.mid));
}
/* open the chart of a found moment in the natal tab (city from the transit form, else the natal one) */
function toNatal(jd){
  const set=(id,v)=>{const e=$(id);if(e)e.value=v;};
  if(!$('n-lat').value&&$('tn-lat')&&$('tn-lat').value){for(const k of ['city','lat','lon','tz'])set('n-'+k,$('tn-'+k).value);
    const h=$('tn-city-hint'),nh=$('n-city-hint');if(h&&nh)nh.textContent=h.textContent;
    const r=$('tn-tz-row'),nr=$('n-tz-row');if(r&&nr)nr.textContent=r.textContent;}
  const tz=($('n-lat').value&&$('n-tz').value)||TZ(),p=parts(jd,tz);
  set('n-day',p.d);set('n-month',p.m);set('n-year',p.y);set('n-hour',p.h);set('n-minute',p.mi);set('n-second',0);
  if(typeof setMode==='function')setMode('natal');
  if($('n-lat').value&&typeof generate==='function')generate();
  window.scrollTo({top:0,behavior:'smooth'});
}

let tries=0;(function wait(){if(inject()||++tries>100)return;setTimeout(wait,100);})();
})();
