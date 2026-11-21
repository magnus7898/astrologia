/* MAGNUS — one birth-data form for every astrology system and Human Design technique.
   The same panel (system · name · date · time · city) replaces each page's own birth fields;
   values are written into the page's native fields, so every page keeps its own calculation.
   Choosing another system carries the data and builds that chart straight away. */
(function(){
const BACKEND='https://astrology-production-b165.up.railway.app';
const ASTRO=[
  ['astro.html','დასავლური ასტროლოგია (ტროპიკული)'],['vedic.html','ვედური ასტროლოგია (სიდერიული)'],['vedictrop.html','ვედური და ტროპიკული'],
  ['true_sidereal.html','ნამდვილი სიდერიული'],['moon.html','მთვარის ფაზები'],['asteroid.html','ასტეროიდები'],['planeta.html','პლანეტარული ასტროლოგია'],
  ['skycal.html','ცის კალენდარი'],['bazi.html','ბაძი · საჯუ (ჩინური)'],['ziwei.html','ძი ვეი დოუ შუ (ჩინური)'],['tibet.html','ტიბეტური ასტროლოგია'],
  ['tzolkin.html','მაიას ცოლკინი'],['celtic.html','კელტური ხეები']];
const HD=[['hd.html','ადამიანის დიზაინი — ბოდიგრაფი'],['genekeys.html','გენის გასაღებები'],['hdastro.html','ასტრო-დიზაინი (ასტროლოგია × HD)'],['iching.html','ი-ძინი — დაბადების ჰექსაგრამა']];
const ALL=ASTRO.concat(HD);
const HREF={'tzolkin.html':'Tzolkin.html'};
const PAGE=(location.pathname.split('/').pop()||'').toLowerCase();
if(!ALL.some(s=>s[0]===PAGE))return;
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const MONTHS=['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];

/* ── the page's own fields ── */
const P=$('n-day')?'n-':$('i-day')?'i-':'';
const N={name:$(P+'name')||$('bname'),day:$(P+'day'),month:$(P+'month'),year:$(P+'year'),hour:$(P+'hour'),minute:$(P+'minute')||$(P+'min'),
  second:$(P+'second'),tu:$(P+'time-unknown')||(PAGE==='hdastro.html'?$('tunk'):null),city:$(P+'city')||$('bcity'),lat:$(P+'lat')||$('lat')||$('i-elat'),lon:$(P+'lon')||$('lon')||$('i-elon'),
  tz:$(P+'tz')||$('tz_name')||(PAGE==='hdastro.html'?$('tz'):null)||$('i-tz'),date:$('bdate'),time:$('btime'),dmy:$('d1'),hm:$('t1'),
  off:$('tz1'),lon1:$('lon1'),d0:$('d0')};
const anchor=N.day||N.date||N.dmy||N.d0;
if(!anchor)return;
const FULL=PAGE!=='skycal.html';          /* the sky calendar is not a birth chart: only the system list there */

/* ── generate on this page ── */
const GEN={'astro.html':()=>window.generate&&window.generate(),'vedic.html':()=>window.generate&&window.generate(),'vedictrop.html':()=>window.generate&&window.generate(),
  'hd.html':()=>window.generate&&window.generate(),'true_sidereal.html':()=>window.generateChart&&window.generateChart(),'moon.html':()=>window.calculate&&window.calculate(),
  'asteroid.html':()=>window.calc&&window.calc(),'hdastro.html':()=>$('go')&&$('go').click(),'planeta.html':()=>$('btn-gen')&&$('btn-gen').click()};
let nativeBtn=null;
function findNativeBtn(){
  if(PAGE==='hdastro.html')return $('go');if(PAGE==='planeta.html')return $('btn-gen');if(PAGE==='asteroid.html'||PAGE==='moon.html')return $('calcBtn');
  const sec=anchor.closest('.form-section')||document;
  if(PAGE==='true_sidereal.html')return sec.querySelector('[onclick^="generateChart"]');
  if(GEN[PAGE])return sec.querySelector('[onclick^="generate("]');
  const box=(typeof target!=='undefined'&&target)||anchor.closest('.form2,.card,.panel')||document;
  const pick=root=>[...root.querySelectorAll('button')].find(x=>!x.closest('.mgb')&&/გამოთვლა/.test(x.textContent));
  return pick(box)||pick(document)||null;
}
function generate(){try{if(GEN[PAGE])return GEN[PAGE]();nativeBtn=nativeBtn||findNativeBtn();if(nativeBtn)nativeBtn.click();}catch(e){console.warn('generate',e);}}

/* ── offset (hours) of an IANA zone at a moment, for the pages that take UTC± ── */
function offsetOf(tz,y,m,d,h,mi){try{const t=Date.UTC(y,m-1,d,h||12,mi||0);
  const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
  const p={};f.formatToParts(new Date(t)).forEach(x=>p[x.type]=x.value);
  return Math.round((Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute)-t)/36e5*4)/4;}catch(e){return null;}}

/* ── panel ── */
const css=`.mgb{margin:0 0 18px;padding:0 0 16px;border-bottom:1px solid rgba(201,162,76,.25)}
.mgb .r{display:grid;gap:10px;margin-bottom:10px}.mgb .r.c1{grid-template-columns:1fr}.mgb .r.c3{grid-template-columns:1fr 1.3fr 1fr}.mgb .r.c2{grid-template-columns:1fr 1fr}
.mgb label,html body .mgb label{display:block;font-size:11px;letter-spacing:1.5px;color:#C9A24C;margin:0 0 5px}
html body .mgb input:not([type=checkbox]),html body .mgb select{width:100%;box-sizing:border-box;padding:10px 12px;font-size:15px;text-align:left;background:rgba(12,18,34,.85);color:#F3E6C8;border:1px solid rgba(201,162,76,.45);border-radius:10px;font-family:inherit;height:auto}
.mgb input:focus,.mgb select:focus{outline:none;border-color:#E3BE84;box-shadow:0 0 0 3px rgba(227,190,132,.15)}
.mgb .sys select{font-size:15.5px}.mgb .tu{display:flex;align-items:center;gap:8px;font-size:13px;color:#d8cfbd;margin:-2px 0 10px}.mgb .tu input{width:auto}
.mgb .city{position:relative}.mgb .hint{font-size:12.5px;color:#cfc6e8;margin-top:6px;min-height:16px}
.mgb .list{position:absolute;left:0;right:0;top:100%;z-index:50;background:#141a2c;border:1px solid rgba(201,162,76,.5);border-radius:10px;margin-top:4px;max-height:260px;overflow:auto}
.mgb .list div{padding:9px 12px;cursor:pointer;font-size:14px;color:#ece4d2}.mgb .list div:hover{background:rgba(227,190,132,.12)}
.mgb .go{width:100%;margin-top:6px;padding:12px;border:none;border-radius:10px;cursor:pointer;font-size:15px;letter-spacing:1.5px;color:#fff;background:linear-gradient(135deg,#6d28d9,#4c1d95)}
.mgb .go:hover{filter:brightness(1.12)}
@media(max-width:560px){.mgb .r.c3{grid-template-columns:1fr 1fr 1fr}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const w=document.createElement('div');w.className='mgb';
const opt=list=>list.map(([h,t])=>`<option value="${h}"${h===PAGE?' selected':''}>${t}</option>`).join('');
w.innerHTML=`<div class="r c1 sys"><div><label for="mgb-sys">სისტემა</label><select id="mgb-sys"><optgroup label="ასტროლოგია">${opt(ASTRO)}</optgroup><optgroup label="ადამიანის დიზაინი">${opt(HD)}</optgroup></select></div></div>`+
 (FULL?`<div class="r c1"><div><label>სახელი</label><input id="mgb-name" placeholder="სახელი"></div></div>
  <div class="r c3"><div><label>დღე</label><input id="mgb-day" type="number" min="1" max="31" placeholder="დდ"></div>
   <div><label>თვე</label><select id="mgb-month">${MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('')}</select></div>
   <div><label>წელი</label><input id="mgb-year" type="number" min="1" max="3000" placeholder="წწწწ"></div></div>
  <div class="r c2"><div><label>საათი</label><input id="mgb-hour" type="number" min="0" max="23" placeholder="სს"></div><div><label>წუთი</label><input id="mgb-minute" type="number" min="0" max="59" placeholder="წწ"></div></div>
  <div class="tu"><input type="checkbox" id="mgb-time-unknown"><label for="mgb-time-unknown" style="margin:0;letter-spacing:0;font-size:13px;color:#d8cfbd">დრო უცნობია</label></div>
  <div class="r c1"><div class="city"><label>დაბადების ადგილი</label><input id="mgb-city" placeholder="თბილისი, Batumi, London…" autocomplete="off"><input type="hidden" id="mgb-lat"><input type="hidden" id="mgb-lon"><input type="hidden" id="mgb-tz"><div class="hint" id="mgb-hint"></div></div></div>
  <button type="button" class="go" id="mgb-go">✦ გამოთვლა ✦</button>`:'');
const host=anchor.closest('.form-section')||anchor.closest('.form-card,.input-panel,.form-shell,.panel,form,.card,.form2,.ctl')||anchor.parentElement;
const target=host.classList.contains('form-section')?host:(host.closest('.form-card,.input-panel,.panel,.card')||host);
target.insertBefore(w,target.firstChild);

/* hide the page's own birth fields (other options stay) */
function hideOwn(el){if(!el)return;const f=el.closest('.field,.f');
  if(f&&f!==target&&!f.contains(w)){f.style.display='none';return;}
  const p=el.parentElement;if(p&&p!==target&&!p.contains(w)&&p.querySelectorAll('input,select').length===1&&!p.querySelector('button')){p.style.display='none';return;}
  el.style.display='none';const lb=el.previousElementSibling;if(lb&&lb.tagName==='LABEL')lb.style.display='none';}
if(FULL){[N.name,N.day,N.month,N.year,N.hour,N.minute,N.second,N.city,N.lat,N.lon,N.date,N.time,N.dmy,N.hm,N.off,N.lon1].forEach(hideOwn);
  if(N.tz&&N.tz.type!=='hidden')hideOwn(N.tz);
  ['n-tz-display','tz-display','n-time-fields','n-tz-row','city-hint','n-city-hint','i-cityhint'].forEach(id=>{const e=$(id);if(e&&!w.contains(e))e.style.display='none';});
  if(N.tu)hideOwn(N.tu);
  nativeBtn=findNativeBtn();if(nativeBtn)nativeBtn.style.display='none';}

/* ── values ── */
const U=id=>$('mgb-'+(id==='tu'?'time-unknown':id));
function keepGeo(){if(!FULL)return;if(GEO){U('lat').value=GEO.lat;U('lon').value=GEO.lon;U('tz').value=GEO.tz;}else if(!U('lat').value){U('tz').value='';}}
function geoFromHidden(){if(FULL&&!GEO&&U('lat').value&&U('lon').value){GEO={lat:+U('lat').value,lon:+U('lon').value,tz:U('tz').value||'UTC',display:U('city').value};U('hint').textContent='📍 '+GEO.display+' · 🕐 '+GEO.tz;}}
let GEO=null;   /* {lat,lon,tz,display} */
function read(){if(!FULL)return null;geoFromHidden();const tu=U('tu').checked;
  return {name:U('name').value.trim(),day:+U('day').value||'',month:+U('month').value,year:+U('year').value||'',
    hour:tu?12:(U('hour').value===''?'':+U('hour').value),minute:tu?0:(U('minute').value===''?0:+U('minute').value),tu,
    city:U('city').value.trim(),lat:GEO?GEO.lat:'',lon:GEO?GEO.lon:'',tz:GEO?GEO.tz:'',display:GEO?GEO.display:''};}
function set(el,v){if(!el||v===''||v===undefined||v===null)return;
  if(el.tagName==='SELECT'){const o=[...el.options].find(x=>x.value==String(v)||x.value==pad(v)||+x.value===+v);if(!o)return;el.value=o.value;}else el.value=v;
  el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
function quiet(el,v){if(el&&v!==''&&v!==undefined&&v!==null)el.value=v;}
function push(){const o=read();if(!o)return;
  set(N.name,o.name);set(N.year,o.year);set(N.month,o.month);set(N.day,o.day);set(N.hour,o.hour);set(N.minute,o.minute);if(N.second)quiet(N.second,0);
  if(N.tu&&N.tu.checked!==o.tu){N.tu.checked=o.tu;N.tu.dispatchEvent(new Event('change',{bubbles:true}));}
  if(N.date&&o.year&&o.day)set(N.date,o.year+'-'+pad(o.month)+'-'+pad(o.day));
  if(N.time&&o.hour!=='')set(N.time,pad(o.hour)+':'+pad(o.minute));
  if(N.dmy&&o.year&&o.day)set(N.dmy,pad(o.day)+'/'+pad(o.month)+'/'+o.year);
  if(N.hm&&o.hour!==''&&!o.tu)set(N.hm,pad(o.hour)+':'+pad(o.minute));
  if(N.city)quiet(N.city,o.city);
  if(o.lat!==''){quiet(N.lat,(+o.lat).toFixed(4));quiet(N.lon,(+o.lon).toFixed(4));if(N.tz&&N.tz.tagName!=='SELECT')quiet(N.tz,o.tz);
    if(N.lon1)set(N.lon1,(+o.lon).toFixed(2));
    if(N.off&&o.year){const off=offsetOf(o.tz,o.year,o.month,o.day,o.hour===''?12:o.hour,o.minute);if(off!==null)set(N.off,off);}
    const td=$(P+'tz-display')||$('tz-display');if(td)td.textContent='🕐 '+o.tz+' · 📍 '+(o.display||o.city);}
  keepGeo();try{localStorage.setItem('mg_birth',JSON.stringify(o));}catch(e){}
}
function fill(o){if(!FULL||!o)return;U('lat').value=o.lat||'';U('lon').value=o.lon||'';U('tz').value=o.tz||'';U('name').value=o.name||'';U('day').value=o.day||'';U('month').value=o.month||1;U('year').value=o.year||'';
  U('tu').checked=!!o.tu;U('hour').value=o.tu?'':(o.hour===''||o.hour===undefined?'':o.hour);U('minute').value=o.tu?'':(o.minute===undefined?'':o.minute);U('city').value=o.city||'';
  U('hour').disabled=U('minute').disabled=!!o.tu;
  GEO=o.lat!==''&&o.lat!==undefined&&o.lat!==null?{lat:o.lat,lon:o.lon,tz:o.tz,display:o.display||o.city}:null;
  U('hint').textContent=GEO?'📍 '+GEO.display+' · 🕐 '+GEO.tz:'';}
function fromNative(){/* a page that already has data (saved person, own defaults) */
  const v=x=>x&&x.value!==undefined?String(x.value).trim():'';const o={name:v(N.name),city:v(N.city),lat:v(N.lat),lon:v(N.lon),tz:v(N.tz)};
  if(N.dmy&&v(N.dmy)){const [d,m,y]=v(N.dmy).split('/');Object.assign(o,{day:+d,month:+m,year:+y});}
  else if(N.date&&v(N.date)){const [y,m,d]=v(N.date).split('-');Object.assign(o,{day:+d,month:+m,year:+y});}
  else Object.assign(o,{day:+v(N.day)||'',month:+v(N.month)||1,year:+v(N.year)||''});
  if(N.hm&&v(N.hm)){const [h,mi]=v(N.hm).split(':');Object.assign(o,{hour:+h,minute:+mi});}
  else if(N.time&&v(N.time)){const [h,mi]=v(N.time).split(':');Object.assign(o,{hour:+h,minute:+mi});}
  else Object.assign(o,{hour:v(N.hour)===''?'':+v(N.hour),minute:v(N.minute)===''?0:+v(N.minute)});
  if(!o.city)o.lat='';
  return o;}

/* ── city search ── */
if(FULL){let tm=null,seq=0;const inp=U('city'),hint=U('hint');
  const close=()=>{const l=w.querySelector('.list');if(l)l.remove();};
  inp.addEventListener('input',()=>{GEO=null;U('lat').value='';U('lon').value='';push();clearTimeout(tm);close();const q=inp.value.trim();if(q.length<2){hint.textContent='';return;}
    hint.textContent='⏳ ძიება…';const my=++seq;
    tm=setTimeout(async()=>{let list=null;
      try{const r=await fetch(BACKEND+'/geocode/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q})});if(r.ok){const j=await r.json();if(Array.isArray(j.results))list=j.results;}}catch(_){}
      if(list===null){try{const r=await fetch(BACKEND+'/geocode',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({city:q})});const d=await r.json();list=d.error?[]:[d];}catch(e){if(my===seq)hint.textContent='❌ სერვერთან კავშირი ვერ მოხერხდა';return;}}
      if(my!==seq)return;if(!list.length){hint.textContent='❌ ვერ მოიძებნა — სცადეთ ლათინურად';return;}
      const pick=d=>{GEO={lat:+d.lat,lon:+d.lon,tz:d.tz_name||'UTC',display:d.display||q};hint.textContent='📍 '+GEO.display+' · 🕐 '+GEO.tz;close();push();};
      pick(list[0]);
      if(list.length>1){const l=document.createElement('div');l.className='list';list.forEach(d=>{const x=document.createElement('div');x.textContent=d.display;x.onclick=()=>pick(d);l.appendChild(x);});inp.parentElement.appendChild(l);}
    },350);});
  document.addEventListener('click',e=>{if(!e.target.closest('.mgb .city'))close();});
  ['name','day','month','year','hour','minute'].forEach(id=>{U(id).addEventListener('input',push);U(id).addEventListener('change',()=>{geoFromHidden();push();});});
  /* saved-people bar (account.js) belongs at the top of the panel; the page's own bars go */
  let keep=null;
  const tidy=()=>{document.querySelectorAll('.mg-ppl').forEach(b=>{
    if(!w.contains(b)||(keep&&b!==keep)){if(b.style.display!=='none')b.style.display='none';return;}
    if(!keep){keep=b;w.querySelector('.sys').after(b);b.style.margin='0 0 10px';}});};
  new MutationObserver(tidy).observe(target,{childList:true,subtree:true});setTimeout(tidy,600);setTimeout(tidy,2000);
  U('month').addEventListener('change',push);
  U('tu').addEventListener('change',()=>{U('hour').disabled=U('minute').disabled=U('tu').checked;push();});
  U('go').addEventListener('click',()=>run(false));
  w.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run(false);}}));
}


/* one step: a typed city that was not picked from the list is looked up here (first match) */
async function lookup(q){let list=null;
  try{const r=await fetch(BACKEND+'/geocode/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q})});if(r.ok){const j=await r.json();if(Array.isArray(j.results))list=j.results;}}catch(_){}
  if(list===null){try{const r=await fetch(BACKEND+'/geocode',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({city:q})});const d=await r.json();list=d.error?[]:[d];}catch(_){list=[];}}
  return list[0]||null;}
async function run(quietly){if(!FULL){generate();return;}const o=read();
  if(!o.day||!o.year){if(!quietly)U('hint').textContent='⚠ შეიყვანე თარიღი';return;}
  if(N.lat&&o.lat===''){
    if(!o.city){if(!quietly)U('hint').textContent='⚠ შეიყვანე დაბადების ადგილი';return;}
    U('hint').textContent='⏳ ძიება…';const d=await lookup(o.city);
    if(!d){U('hint').textContent='❌ ქალაქი ვერ მოიძებნა — სცადეთ ლათინურად';return;}
    GEO={lat:+d.lat,lon:+d.lon,tz:d.tz_name||'UTC',display:d.display||o.city};U('hint').textContent='📍 '+GEO.display+' · 🕐 '+GEO.tz;}
  push();setTimeout(generate,30);}

/* ── switching systems ── */
const KEY='mg_astro_carry';
U('sys').addEventListener('change',e=>{const to=e.target.value;if(to===PAGE)return;
  try{const o=read()||JSON.parse(localStorage.getItem('mg_birth')||'null');if(o)sessionStorage.setItem(KEY,JSON.stringify(o));}catch(_){}
  location.href=HREF[to]||to;});

function start(){if(!FULL)return;let o=null,auto=false;
  try{o=JSON.parse(sessionStorage.getItem(KEY)||'null');if(o){auto=true;sessionStorage.removeItem(KEY);}}catch(e){}
  if(!o){try{o=JSON.parse(localStorage.getItem('mg_birth')||'null');}catch(e){}}
  if(!o){const n=fromNative();if(n.day&&n.year)o=n;}
  if(!o)return;
  fill(o);push();
  if(auto&&o.day&&o.year)setTimeout(()=>run(true),350);
}
if(document.readyState==='complete')setTimeout(start,50);else addEventListener('load',()=>setTimeout(start,50));
})();

/* charts on these pages: no backdrop square behind the wheel — the chart sits on the page texture */
(function(){
const PAGE=(location.pathname.split('/').pop()||'').toLowerCase();
if(!/^(astro|vedic|vedictrop|true_sidereal|hdastro|moon|asteroid|planeta|skycal|bazi|ziwei|tibet|tzolkin|celtic|compat)\.html$/.test(PAGE))return;
function dark(c){const m=c&&c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);if(!m)return false;return (m[4]===undefined||+m[4]>.15)&&(.2126*m[1]+.7152*m[2]+.0722*m[3])/255<.18;}
function clean(svg){
  const vb=svg.viewBox&&svg.viewBox.baseVal;const W=vb&&vb.width||svg.clientWidth,H=vb&&vb.height||svg.clientHeight;
  if(!W||!H||svg.getBoundingClientRect().width<160)return;
  svg.querySelectorAll(':scope > rect, :scope > g > rect').forEach(r=>{
    const w=r.width.baseVal,h=r.height.baseVal;const rw=w.unitType===2?W*w.valueInSpecifiedUnits/100:w.value,rh=h.unitType===2?H*h.valueInSpecifiedUnits/100:h.value;
    if(rw<W*.8||rh<H*.8)return;
    const f=getComputedStyle(r).fill;if(/^url\(/.test(f)||dark(f))r.style.setProperty('fill','none','important');});
  const cs=getComputedStyle(svg);if(dark(cs.backgroundColor)||/gradient/.test(cs.backgroundImage))svg.style.setProperty('background','transparent','important');
}
function run(){document.querySelectorAll('svg').forEach(clean);
  document.querySelectorAll('canvas').forEach(c=>{const cs=getComputedStyle(c);if(dark(cs.backgroundColor))c.style.setProperty('background','transparent','important');});}
let t=null;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,60);}).observe(document.documentElement,{childList:true,subtree:true});
addEventListener('load',run);run();
})();

/* ── Pluto ⯓ drawn as a picture: many phone fonts have no ⯓ (it shows as an empty box),
      so every ⯓ / ♇ on the astrology pages — in charts and in tables — is replaced by the same drawn glyph ── */
(function(){
const NS='http://www.w3.org/2000/svg',RE=/[⯓♇]︎?/;
/* 20×20: small circle, the cup under it, the cross below */
const SHAPE='<circle cx="10" cy="5.2" r="2.6"/><path d="M4.2 3.6a5.8 5.8 0 0 0 11.6 0"/><path d="M10 9.4V19M6.4 15.2h7.2"/>';
function svgText(t){
  if(t.dataset.pl||!RE.test(t.textContent)||t.textContent.replace(RE,'').trim())return;
  const x=+t.getAttribute('x')||0,y=+t.getAttribute('y')||0,fs=parseFloat(t.getAttribute('font-size')||getComputedStyle(t).fontSize)||16;
  const col=t.getAttribute('fill')||getComputedStyle(t).fill||'#c050a0',s=fs*0.95,anc=t.getAttribute('text-anchor')||'start';
  const dx=anc==='middle'?-s/2:anc==='end'?-s:0,db=t.getAttribute('dominant-baseline');
  const dy=db==='central'||db==='middle'?-s/2:-s*0.85;
  const g=document.createElementNS(NS,'g');g.dataset.pl='1';
  g.setAttribute('transform',`translate(${x+dx},${y+dy}) scale(${s/20})`);
  g.setAttribute('fill','none');g.setAttribute('stroke',col);g.setAttribute('stroke-width','1.9');g.setAttribute('stroke-linecap','round');
  g.innerHTML=SHAPE;if(t.getAttribute('class'))g.setAttribute('class',t.getAttribute('class'));
  if(t.getAttribute('opacity'))g.setAttribute('opacity',t.getAttribute('opacity'));
  t.replaceWith(g);
}
const ICON=`<svg viewBox="0 0 20 20" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" style="vertical-align:-0.12em;display:inline-block">${SHAPE}</svg>`;
function htmlText(n){
  const p=n.parentElement;if(!p||p.closest('svg,script,style,textarea,option,select,.mg-pl'))return;
  const parts=n.nodeValue.split(/[⯓♇]︎?/);if(parts.length<2)return;
  const f=document.createDocumentFragment();
  parts.forEach((s,i)=>{if(i){const sp=document.createElement('span');sp.className='mg-pl';sp.innerHTML=ICON;f.appendChild(sp);}if(s)f.appendChild(document.createTextNode(s));});
  n.replaceWith(f);
}
function run(){
  document.querySelectorAll('svg text').forEach(svgText);
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>RE.test(n.nodeValue)?1:3});
  const L=[];while(w.nextNode())L.push(w.currentNode);L.forEach(htmlText);
  document.querySelectorAll('option').forEach(o=>{if(RE.test(o.textContent))o.textContent=o.textContent.replace(/[⯓♇]︎?/g,'Pl');});
}
let t=null;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,40);}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
if(document.body)run();else addEventListener('DOMContentLoaded',run);
})();
