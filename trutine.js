/* trutine.js — ჰერმესის ტრუტინა (Trutine of Hermes) birth-time rectification.
   Self-injecting: adds a panel to the natal form, calls /api/trutine,
   and "გამოყენება" writes the rectified date/time into the form and
   regenerates the chart. astro.html needs only:
       <script src="trutine.js"></script>                                  */
(function(){
'use strict';
const $=id=>document.getElementById(id);

const CSS=`
#tru-box{margin:6px 0 4px;border:1px solid rgba(201,162,76,.35);border-radius:10px;background:rgba(20,14,9,.55)}
#tru-box>summary{cursor:pointer;list-style:none;padding:9px 12px;font-family:Cinzel,serif;font-size:10px;letter-spacing:2px;color:var(--gold-l,#F0D48A)}
#tru-box>summary::-webkit-details-marker{display:none}
#tru-box .tru-in{padding:0 12px 12px}
#tru-box .tru-row{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-bottom:8px}
#tru-box .tru-row .field{flex:1;min-width:140px}
#tru-run{background:linear-gradient(135deg,#C9A24C,#7A5A22);color:#140E09;border:none;border-radius:8px;padding:9px 16px;font-family:Cinzel,serif;font-size:11px;letter-spacing:1px;cursor:pointer;font-weight:600}
#tru-run:disabled{opacity:.5;cursor:wait}
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

function inject(){
  const sec=$('form-natal');
  if(!sec||$('tru-box'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const box=document.createElement('details');
  box.id='tru-box';
  box.innerHTML=`
    <summary>⚖ ჰერმესის ტრუტინა — დროის რექტიფიკაცია</summary>
    <div class="tru-in">
      <div class="tru-note">ჩასახვის მომენტის ☽ = დაბადების AC, ჩასახვის AC = დაბადების ☽.
        პოულობს დაბადების ზუსტ წუთს და ასცენდენტს, რომელზეც ორივე პირობა სრულდება.</div>
      <div class="tru-row">
        <div class="field"><label>მეთოდი</label>
          <select id="tru-mode">
            <option value="bailey">ბეილი — პრენატალური ეპოქა (AC/DC)</option>
            <option value="classic">კლასიკური ჰერმესი (მხოლოდ AC)</option>
          </select></div>
        <div class="field"><label>ძიების დიაპაზონი</label>
          <select id="tru-win">
            <option value="30">± 30 წთ</option>
            <option value="60">± 1 სთ</option>
            <option value="120" selected>± 2 სთ</option>
            <option value="240">± 4 სთ</option>
            <option value="720">± 12 სთ</option>
          </select></div>
        <button type="button" id="tru-run">⚖ გამოთვლა</button>
      </div>
      <div id="tru-out"></div>
    </div>`;
  /* insert BEFORE the generate button: generate() finds it via
     ".gen-btn:last-child", so it must stay the section's last child */
  const gen=sec.querySelector('.gen-btn');
  if(gen)sec.insertBefore(box,gen);else sec.appendChild(box);
  $('tru-run').addEventListener('click',run);
}

const fmtOff=m=>{
  const s=m<0?'−':'+',a=Math.abs(m),h=Math.floor(a/60),mm=a-h*60;
  return s+(h?h+' სთ ':'')+mm.toFixed(1)+' წთ';
};

async function run(){
  const out=$('tru-out'),btn=$('tru-run');
  const p=getPersonData('n');
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
    btn.disabled=false;btn.textContent='⚖ გამოთვლა';
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
  set('n-year',c.year);set('n-month',c.month);set('n-day',c.day);
  set('n-hour',c.hour);set('n-minute',c.minute);set('n-second',c.second);
  const tu=$('n-time-unknown');
  if(tu&&tu.checked){tu.checked=false;if(typeof toggleTU==='function')toggleTU('n');}
  if(typeof generate==='function')generate();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);
else inject();
})();
