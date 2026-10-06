/* trutine.js — ჰერმესის ტრუტინა (Trutine of Hermes) birth-time rectification.
   Self-injecting: adds its own tab (ტრუტინა) at the end of the tab bar, calls /api/trutine,
   and "გამოყენება" carries the rectified date/time to the natal tab and
   draws the chart there. astro.html needs only:
       <script src="trutine.js"></script>                                  */
(function(){
'use strict';
const $=id=>document.getElementById(id);

const CSS=`
.tru-note{font-size:10px;color:rgba(196,176,148,.6);line-height:1.6;margin-bottom:8px}
.tru-c{border-top:1px solid rgba(122,90,34,.35);padding:7px 0}
.tru-c.best{background:rgba(201,162,76,.07);border-radius:6px;padding:7px 6px}
.tru-h{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;font-size:12px}
.tru-t{font-family:Cinzel,serif;font-size:15px;color:#F0D48A;min-width:84px}
.tru-d{font-size:11px;color:rgba(196,176,148,.75)}
.tru-ac{color:#e8c06e}
.tru-x{font-size:10px;color:rgba(196,176,148,.6);padding:3px 0 0 2px;line-height:1.6}
.tru-ap{margin-left:auto;background:none;border:1px solid rgba(240,212,138,.55);color:#F0D48A;border-radius:6px;padding:2px 10px;font-size:10px;cursor:pointer;font-family:inherit}
.tru-ap:hover{background:rgba(201,162,76,.18)}
`;

const F=id=>'tru-'+id;
function field(lbl,id,val,min,max){return `<div class="field"><label>${lbl}</label><input type="number" id="tru-${id}" value="${val}" min="${min}" max="${max}"></div>`;}

function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!bar||!card||$('tru-tab-btn'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  /* tab — appended LAST so the original buttons keep their positions */
  const btn=document.createElement('button');
  btn.className='tab-btn';btn.id='tru-tab-btn';btn.textContent='ტრუტინა';
  btn.onclick=activate;
  bar.appendChild(btn);
  /* own form section */
  const sec=document.createElement('div');
  sec.id='form-trutine';sec.className='form-section';
  sec.innerHTML=`
    <div class="person-label">⚖ ჰერმესის ტრუტინა — დროის რექტიფიკაცია</div>
    <div class="tru-note">ჩასახვის მომენტის ☽ = დაბადების AC, ჩასახვის AC = დაბადების ☽.
      პოულობს დაბადების ზუსტ წამს და ასცენდენტს, რომელზეც ორივე პირობა სრულდება.
      <button type="button" class="tru-ap" id="tru-copy" style="margin-left:6px">↧ ნატალურიდან</button></div>
    <div class="field wide" style="margin-bottom:10px"><label>სახელი</label><input id="tru-name" placeholder="სახელი"></div>
    <div class="form-grid">${field('დღე','day',1,1,31)}${field('თვე','month',1,1,12)}${field('წელი','year',1990,1,3000)}</div>
    <div class="form-grid" id="tru-time-fields">${field('საათი (სავარაუდო)','hour',12,0,23)}${field('წუთი','minute',0,0,59)}${field('წამი','second',0,0,59)}</div>
    <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px">
      <input type="checkbox" id="tru-time-unknown" onchange="toggleTU('tru')" style="width:15px;height:15px;accent-color:#C9A24C;cursor:pointer">
      <label for="tru-time-unknown" style="font-size:11px;letter-spacing:1px;text-transform:none;cursor:pointer">დრო უცნობია — სკანირება მთელი დღე</label>
    </div>
    <div class="field" style="margin-bottom:8px"><label>ქალაქი</label>
      <input id="tru-city" placeholder="თბილისი, London, Paris..." oninput="searchCity('tru')">
      <div class="city-hint" id="tru-city-hint"></div></div>
    <div class="form-grid-2" style="margin-bottom:8px">
      <div class="field"><label>განედი</label><input type="number" id="tru-lat" step="0.0001" readonly></div>
      <div class="field"><label>გრძედი</label><input type="number" id="tru-lon" step="0.0001" readonly></div>
    </div>
    <input type="hidden" id="tru-tz" value="UTC">
    <div class="tz-display" id="tru-tz-display">⏳ ქალაქის შეყვანის შემდეგ სარტყელი განისაზღვრება</div>
    <div class="form-grid-2" style="margin-bottom:8px">
      <div class="field"><label>მეთოდი</label>
        <select id="tru-mode">
          <option value="bailey">ბეილი — პრენატალური ეპოქა (AC/DC)</option>
          <option value="classic">კლასიკური ჰერმესი (მხოლოდ AC)</option>
        </select></div>
      <div class="field"><label>ძიების დიაპაზონი</label>
        <select id="tru-win">
          <option value="30">± 30 წთ</option><option value="60">± 1 სთ</option>
          <option value="120" selected>± 2 სთ</option><option value="240">± 4 სთ</option>
          <option value="720">± 12 სთ</option>
        </select></div>
    </div>
    <button type="button" class="gen-btn" id="tru-run">⚖ რექტიფიკაცია ✦</button>
    <div id="tru-out" style="margin-top:12px"></div>`;
  card.insertBefore(sec,$('orb-panel')||null);
  $('tru-run').addEventListener('click',run);
  $('tru-copy').addEventListener('click',copyFromNatal);
  fixSetMode();
}

/* setMode() highlights tabs by POSITION; inserted tabs (futurelife, this
   one) shift that. Re-highlight by each button's own onclick target. */
function fixSetMode(){
  if(typeof setMode!=='function'||setMode._truFixed)return;
  const orig=setMode;
  const wrapped=function(mode){
    orig(mode);
    document.querySelectorAll('.tab-btn').forEach(b=>{
      const oc=b.getAttribute('onclick')||'';
      b.classList.toggle('active',oc.indexOf("'"+mode+"'")>=0);
    });
  };
  wrapped._truFixed=true;
  window.setMode=wrapped;
}

function activate(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  $('tru-tab-btn').classList.add('active');
  document.querySelectorAll('.form-section').forEach(s=>s.classList.remove('active'));
  $('form-trutine').classList.add('active');
  const ca=$('chart-area');if(ca)ca.style.display='none';
  const acg=$('acg-section');if(acg)acg.style.display='none';
  try{currentMode='trutine';}catch(e){}
}

const PAIRS=['name','day','month','year','hour','minute','second','city','lat','lon','tz'];
function copyFromNatal(){
  for(const k of PAIRS){const a=$('n-'+k),b=$('tru-'+k);if(a&&b)b.value=a.value;}
  const tz=$('n-tz-display'),tt=$('tru-tz-display');if(tz&&tt)tt.textContent=tz.textContent;
  const h=$('n-city-hint'),th=$('tru-city-hint');if(h&&th)th.textContent=h.textContent;
}

const fmtOff=m=>{
  const s=m<0?'−':'+',a=Math.abs(m),h=Math.floor(a/60),mm=a-h*60;
  return s+(h?h+' სთ ':'')+mm.toFixed(1)+' წთ';
};

async function run(){
  const out=$('tru-out'),btn=$('tru-run');
  const p=getPersonData('tru');
  if(!p.lat||!p.lon){out.innerHTML='<div style="color:#f87171;font-size:11px">❌ ჯერ შეიყვანეთ ქალაქი</div>';return;}
  btn.disabled=true;btn.textContent='⏳ სკანირება...';
  out.innerHTML='';
  try{
    const r=await fetch(`${BACKEND}/api/trutine`,{method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...p,window:+$('tru-win').value,mode:$('tru-mode').value})});
    const d=await r.json();
    if(d.error)throw new Error(d.error);
    window._truCands=d.candidates||[];
    render(d,p);
  }catch(e){
    out.innerHTML='<div style="color:#f87171;font-size:11px">❌ '+e.message+'</div>';
  }finally{
    btn.disabled=false;btn.textContent='⚖ რექტიფიკაცია ✦';
  }
}

function render(d,p){
  const out=$('tru-out');
  const C=d.candidates||[];
  if(!C.length){
    out.innerHTML='<div class="tru-note">ამ დიაპაზონში ამონახსნი ვერ მოიძებნა — გაზარდეთ დიაპაზონი.</div>';return;
  }
  const head=p.time_unknown
    ?'დრო უცნობია — სკანირებულია მთელი დღე (12:00 ± 12 სთ).'
    :`ნაპოვნია ${d.count} ამონახსნი, დალაგებული შეყვანილ დროსთან სიახლოვით. პირველი ყველაზე ახლოსაა.`;
  out.innerHTML=`<div class="tru-note">${head}</div>`+C.map((c,i)=>`
    <div class="tru-c${i===0?' best':''}">
      <div class="tru-h">
        <span class="tru-t">${c.time}</span>
        <span class="tru-d">${c.date} · ${fmtOff(c.offset_min)}</span>
        <span>AC <b class="tru-ac">${c.asc.text}</b></span>
        <span class="tru-d">MC ${c.mc.text}</span>
        <button type="button" class="tru-ap" data-i="${i}">✔ გამოყენება</button>
      </div>
      <div class="tru-x">
        ☽ დაბადებისას ${c.moon.text} (${c.moon_waxing?'მზარდი':'კლებადი'}, ${c.moon_above?'ჰორიზონტს ზემოთ':'ჰორიზონტს ქვემოთ'})
        · ეპოქა ${c.epoch.date} ${c.epoch.time} · ☽ ${c.epoch.moon.text} · AC ${c.epoch.asc.text}<br>
        ${c.rule} · ${c.reciprocal} · ორსულობა ${c.gestation_days} დღე (მოსალოდნელი ${c.expected_days})
        · ცდომილება ${c.residual_arcmin}′
      </div>
    </div>`).join('');
  out.querySelectorAll('.tru-ap').forEach(b=>b.addEventListener('click',()=>apply(+b.dataset.i)));
}

function apply(i){
  const c=(window._truCands||[])[i];if(!c)return;
  const set=(id,v)=>{const e=$(id);if(e)e.value=v;};
  for(const k of ['name','city','lat','lon','tz'])set('n-'+k,($('tru-'+k)||{}).value||'');
  const tz=$('tru-tz-display'),nz=$('n-tz-display');if(tz&&nz)nz.textContent=tz.textContent;
  set('n-year',c.year);set('n-month',c.month);set('n-day',c.day);
  set('n-hour',c.hour);set('n-minute',c.minute);set('n-second',c.second);
  const tu=$('n-time-unknown');
  if(tu&&tu.checked){tu.checked=false;if(typeof toggleTU==='function')toggleTU('n');}
  /* click the real tab so every listener (orb panel etc.) follows */
  const nb=document.querySelector(".tab-btn[onclick*=\"'natal'\"]");
  if(nb)nb.click();else setMode('natal');
  if(typeof generate==='function')generate();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);
else inject();
})();
