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
  ['asteroid.html','ასტეროიდები']];
const PAGE=(location.pathname.split('/').pop()||'').toLowerCase();
if(!SYS.some(s=>s[0]===PAGE))return;
const KEY='mg_astro_carry';
const $=id=>document.getElementById(id);
/* the birth-data fields of this page (astro.html uses the natal tab's n-* fields) */
const P=$('n-day')?'n-':'';
const F={name:$(P+'name'),day:$(P+'day'),month:$(P+'month'),year:$(P+'year'),hour:$(P+'hour'),minute:$(P+'minute'),city:$(P+'city')||$('bcity'),
  date:$('bdate'),time:$('btime'),lat:$('lat'),lon:$('lon'),tz:$('tz_name')};
const anchor=F.day||F.date||F.year;
if(!anchor)return;
const pad=n=>String(n).padStart(2,'0');
function collect(){const v=x=>x&&x.value!==undefined?String(x.value).trim():'';
  const o={name:v(F.name),city:v(F.city),lat:v(F.lat),lon:v(F.lon),tz:v(F.tz)};
  if(F.date&&v(F.date)){const [y,m,d]=v(F.date).split('-');Object.assign(o,{year:y,month:+m,day:+d});}
  else Object.assign(o,{day:v(F.day),month:v(F.month),year:v(F.year)});
  if(F.time&&v(F.time)){const [h,mi]=v(F.time).split(':');Object.assign(o,{hour:+h,minute:+mi});}
  else Object.assign(o,{hour:v(F.hour),minute:v(F.minute)});
  return o;}
function put(el,val){if(!el||val===''||val===undefined||val===null)return;
  if(el.tagName==='SELECT'){const opt=[...el.options].find(o=>o.value==String(val)||o.value==pad(val)||+o.value===+val);if(opt)el.value=opt.value;else return;}
  else el.value=val;
  el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
function restore(){let o=null;try{o=JSON.parse(sessionStorage.getItem(KEY)||'null');sessionStorage.removeItem(KEY);}catch(e){}
  if(!o)return;
  put(F.name,o.name);
  if(F.date){if(o.year&&o.month&&o.day)put(F.date,o.year+'-'+pad(o.month)+'-'+pad(o.day));}
  else{put(F.year,o.year);put(F.month,o.month);put(F.day,o.day);}
  if(F.time){if(o.hour!==''&&o.hour!==undefined)put(F.time,pad(o.hour)+':'+pad(o.minute||0));}
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
  location.href=to;});
if(document.readyState==='complete')setTimeout(restore,50);else addEventListener('load',()=>setTimeout(restore,50));
})();
