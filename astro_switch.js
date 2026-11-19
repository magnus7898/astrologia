/* MAGNUS — "which astrology" list on the chart forms.
   One drop-down at the top of the birth-data form switches between the astrology systems;
   the data already typed in travels to the chosen page and is filled in there. */
(function(){
const SYS=[
  ['astro.html','დასავლური ასტროლოგია (ტროპიკული)'],
  ['vedic.html','ვედური ასტროლოგია (სიდერიული)'],
  ['vedictrop.html','ვედური და ტროპიკული'],
  ['true_sidereal.html','ნამდვილი სიდერიული'],
  ['hdastro.html','ასტრო-დიზაინი (ასტროლოგია × HD)'],
  ['moon.html','მთვარის ფაზები'],
  ['asteroid.html','ასტეროიდები'],
  ['planeta.html','პლანეტარული ასტროლოგია'],
  ['skycal.html','ცის კალენდარი'],
  ['bazi.html','ბაძი · საჯუ (ჩინური)'],
  ['ziwei.html','ძი ვეი დოუ შუ (ჩინური)'],
  ['tibet.html','ტიბეტური ასტროლოგია'],
  ['tzolkin.html','მაიას ცოლკინი'],
  ['celtic.html','კელტური ხეები']];
const PAGE=(location.pathname.split('/').pop()||'').toLowerCase();
if(!SYS.some(s=>s[0]===PAGE))return;
const HREF={'tzolkin.html':'Tzolkin.html'};
const KEY='mg_astro_carry';
const $=id=>document.getElementById(id);
/* the birth-data fields of this page (astro.html uses the natal tab's n-* fields) */
const P=$('n-day')?'n-':$('i-day')?'i-':'';
const F={name:$(P+'name'),day:$(P+'day'),month:$(P+'month'),year:$(P+'year'),hour:$(P+'hour'),minute:$(P+'minute')||$(P+'min'),city:$(P+'city')||$('bcity'),
  date:$('bdate')||$('d0'),time:$('btime'),dmy:$('d1'),hm:$('t1'),lat:$('lat')||$('i-elat'),lon:$('lon')||$('i-elon'),tz:$('tz_name')};
const anchor=F.day||F.date||F.year||F.dmy;
if(!anchor)return;
const pad=n=>String(n).padStart(2,'0');
function collect(){const v=x=>x&&x.value!==undefined?String(x.value).trim():'';
  const o={name:v(F.name),city:v(F.city),lat:v(F.lat),lon:v(F.lon),tz:v(F.tz)};
  if(F.dmy&&v(F.dmy)){const [d,m,y]=v(F.dmy).split('/');Object.assign(o,{year:y,month:+m,day:+d});}
  else if(F.date&&v(F.date)){const [y,m,d]=v(F.date).split('-');Object.assign(o,{year:y,month:+m,day:+d});}
  else Object.assign(o,{day:v(F.day),month:v(F.month),year:v(F.year)});
  if(F.hm&&v(F.hm)){const [h,mi]=v(F.hm).split(':');Object.assign(o,{hour:+h,minute:+mi});}
  else if(F.time&&v(F.time)){const [h,mi]=v(F.time).split(':');Object.assign(o,{hour:+h,minute:+mi});}
  else Object.assign(o,{hour:v(F.hour),minute:v(F.minute)});
  return o;}
function put(el,val){if(!el||val===''||val===undefined||val===null)return;
  if(el.tagName==='SELECT'){const opt=[...el.options].find(o=>o.value==String(val)||o.value==pad(val)||+o.value===+val);if(opt)el.value=opt.value;else return;}
  else el.value=val;
  el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
function restore(){let o=null;try{o=JSON.parse(sessionStorage.getItem(KEY)||'null');sessionStorage.removeItem(KEY);}catch(e){}
  if(!o)return;
  put(F.name,o.name);
  if(F.dmy){if(o.year&&o.month&&o.day)put(F.dmy,pad(o.day)+'/'+pad(o.month)+'/'+o.year);}
  else if(F.date){if(o.year&&o.month&&o.day)put(F.date,o.year+'-'+pad(o.month)+'-'+pad(o.day));}
  else{put(F.year,o.year);put(F.month,o.month);put(F.day,o.day);}
  if(F.hm){if(o.hour!==''&&o.hour!==undefined)put(F.hm,pad(o.hour)+':'+pad(o.minute||0));}
  else if(F.time){if(o.hour!==''&&o.hour!==undefined)put(F.time,pad(o.hour)+':'+pad(o.minute||0));}
  else{put(F.hour,o.hour);put(F.minute,o.minute);}
  put(F.lat,o.lat);put(F.lon,o.lon);put(F.tz,o.tz);
  if(F.city&&o.city&&!(o.lat&&F.lat)){F.city.value=o.city;F.city.dispatchEvent(new Event('input',{bubbles:true}));F.city.focus();}
}
/* the list itself, at the top of the form */
const box=anchor.closest('.form-card,.input-panel,.form-shell,.panel,form,.card')||anchor.parentElement;
const w=document.createElement('div');w.className='mg-sys';
w.innerHTML='<label for="mg-sys-sel">ასტროლოგიის სისტემა</label><select id="mg-sys-sel">'+
  SYS.map(([h,t])=>`<option value="${h}"${h===PAGE?' selected':''}>${t}</option>`).join('')+'</select>';
const st=document.createElement('style');
st.textContent=`.mg-sys{display:flex;flex-direction:column;gap:6px;margin:0 0 16px}
.mg-sys label{font-size:12px;letter-spacing:1.5px;color:#C9A24C;text-transform:uppercase}
.mg-sys select{width:100%;padding:10px 12px;font-size:15px;background:rgba(12,18,34,.85);color:#F3E6C8;border:1px solid rgba(201,162,76,.5);border-radius:10px;cursor:pointer;font-family:inherit}
.mg-sys select:focus{outline:none;border-color:#E3BE84;box-shadow:0 0 0 3px rgba(227,190,132,.15)}`;
document.head.appendChild(st);
box.insertBefore(w,box.firstChild);
w.querySelector('select').addEventListener('change',e=>{const to=e.target.value;if(to===PAGE)return;
  try{sessionStorage.setItem(KEY,JSON.stringify(collect()));}catch(_){}
  location.href=HREF[to]||to;});
if(document.readyState==='complete')setTimeout(restore,50);else addEventListener('load',()=>setTimeout(restore,50));
})();
/* charts on these pages: no backdrop square behind the wheel — the chart sits on the page texture like the Western one */
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
