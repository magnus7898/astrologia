/* hd_find.js — Human Design · 🔎 ძებნა წარსულში / მომავალში
   Self-injecting tab of its own (🔎 ძებნა, after ტრანზიტი; needs hd_transit.js first).
   hd.html needs only, after hd_transit.js:   <script src="hd_find.js"></script>
   Backend: POST /api/hd_find (hd_find.py)

   One search bar for:
     • პროფილი 1/3 … 6/3            — when a person is / was born with it
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
const GROUPS=['პროფილი','საკვები','გარემო','მოტივაცია','პერსპექტივა','ცენტრი'];
const GHELP={'პროფილი':'როდის იბადება / დაიბადა ადამიანი ამ პროფილით',
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
    <div class="form-row">${num('ff-day','დღე',now.getDate(),1,31)}${num('ff-month','თვე',now.getMonth()+1,1,12)}${num('ff-year','წელი',now.getFullYear(),1,3000)}</div>
    <div class="form-row">${num('ff-hour','საათი',now.getHours(),0,23)}${num('ff-minute','წუთი',now.getMinutes(),0,59)}</div>
    <div class="tz-row">🕐 ${TZ()} · ცენტრების ძებნა იყენებს „ნატალური“ ჩანართის მონაცემებს</div>`;
  shell.appendChild(sec);
  const d=document.createElement('div');d.id='hf';d.style.borderTop='none';d.style.marginTop='6px';
  d.innerHTML=`
    <div class="person-label" style="color:${TCOL}">🔎 ძებნა წარსულში და მომავალში
      <span style="text-transform:none;letter-spacing:0;opacity:.75"> — პროფილი · საკვები · გარემო · ცენტრები</span></div>
    <div class="hf-box"><span class="hf-ic">🔎</span>
      <input id="hf-q" autocomplete="off" placeholder="მაგ. 4/6, მადა, მთები, ყელი, ელენთა, sacral…">
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

/* ── request ── */
function moment(){
  const g=id=>+(($(id)||{}).value||0);
  return {date:`${g('ff-year')}-${pad(g('ff-month'))}-${pad(g('ff-day'))}`,time:`${pad(g('ff-hour'))}:${pad(g('ff-minute'))}`,tz_name:TZ()};
}
function natal(){
  const P=$('n-lat')&&$('n-lat').value?'n':($('tn-lat')&&$('tn-lat').value?'tn':null);
  if(!P)return null;
  const g=id=>+$(P+'-'+id).value;
  return {date:`${g('year')}-${pad(g('month'))}-${pad(g('day'))}`,time:`${pad(g('hour'))}:${pad(g('minute'))}`,
    lat:+$(P+'-lat').value,lon:+$(P+'-lon').value,tz_name:$(P+'-tz').value||'UTC'};
}
function jdParts(jd,tz){
  const o={};new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23'})
    .formatToParts(new Date((jd-2440587.5)*86400000)).forEach(p=>o[p.type]=p.value);
  return {y:+o.year,m:+o.month,d:+o.day,h:+o.hour,mi:+o.minute};
}
async function search(more){
  if(!sel){$('hf-q').focus();drop();return;}
  const box=$('hf-res'),btn=$('hf-go');
  const body={kind:sel.kind,value:sel.value,side:sel.side,direction:dir,count:+$('hf-n').value,from:moment()};
  if(sel.kind==='center'){
    body.moon=$('hf-moon').checked;
    if(document.querySelector('input[name=hf-nat]:checked').value==='1'){
      const n=natal();
      if(!n){box.innerHTML='<div class="tr-empty">შენი რუქისთვის „ნატალური“ ჩანართში შეიყვანე დაბადების მონაცემები და აირჩიე ქალაქი — ან აქ აირჩიე „მხოლოდ ცაში“.</div>';return;}
      body.natal=n;}
  }
  if(more&&last&&last.windows.length){
    const w=last.windows[last.windows.length-1];
    const jd=dir==='next'?(w.end_local===null?null:w.end+1/1440):(w.start_local===null?null:w.start-1/1440);
    if(jd==null)return;
    const p=jdParts(jd,TZ());body.from={date:`${p.y}-${pad(p.m)}-${pad(p.d)}`,time:`${pad(p.h)}:${pad(p.mi)}`,tz_name:TZ()};
  }
  btn.disabled=true;btn.textContent='⏳ ვეძებ…';
  try{
    const r=await fetch(API_BASE+'/api/hd_find',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const raw=await r.text();let d;try{d=JSON.parse(raw);}catch(_){throw new Error('Backend error '+r.status);}
    if(!r.ok||d.error)throw new Error(d.error||('HTTP '+r.status));
    render(d,more);lastBody=body;
  }catch(e){box.innerHTML=`<div class="tr-empty" style="color:#e06060">შეცდომა: ${e.message}</div>`;}
  finally{btn.disabled=false;btn.textContent='🔎 ძებნა';}
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
  const tz=($('n-lat').value&&$('n-tz').value)||TZ(),p=jdParts(jd,tz);
  set('n-day',p.d);set('n-month',p.m);set('n-year',p.y);set('n-hour',p.h);set('n-minute',p.mi);set('n-second',0);
  if(typeof setMode==='function')setMode('natal');
  if($('n-lat').value&&typeof generate==='function')generate();
  window.scrollTo({top:0,behavior:'smooth'});
}

let tries=0;(function wait(){if(inject()||++tries>100)return;setTimeout(wait,100);})();
})();
