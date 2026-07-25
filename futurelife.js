/* ═══════════════════════════════════════════════════════════════════
   futurelife.js — MAGNUS · მომავალი სიცოცხლე  (v5)
   DEFINITION (no assumed period):
     find every future moment T where
        dragon chart of T  →  ♇(T) − ☊(T)  ==  natal ♇
     T's own node does the rotation (true dragon chart of that moment).
     Then T's ordinary chart = the future natal.
   Spacing between epochs is MEASURED from the ephemeris and displayed.
   Candidates ranked by resonance with the current natal (♇–♇ excluded).
   astro.html needs only: <script src="futurelife.js"></script>
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const MAX_EPOCHS=10;
const norm=x=>((x%360)+360)%360;
const sdiff=(a,b)=>((a-b+540)%360)-180;         // signed −180..180
const fmtL=L=>{L=norm(L);const s=Math.floor(L/30),d=L%30;
  return Math.floor(d)+'°'+String(Math.floor((d%1)*60)).padStart(2,'0')+"' "+SIGN_KA[s];};
const MONTHS=['იანვ','თებ','მარ','აპრ','მაის','ივნ','ივლ','აგვ','სექ','ოქტ','ნოემ','დეკ'];

/* ═══ 1. UI ════════════════════════════════════════════════════ */
function injectTab(){
  const bar=document.querySelector('.tab-bar');
  if(!bar||document.getElementById('fl-tab-btn'))return;
  const btn=document.createElement('button');
  btn.className='tab-btn';btn.id='fl-tab-btn';
  btn.textContent='მომავალი სიცოცხლე';
  btn.onclick=activate;
  const past=[...bar.querySelectorAll('.tab-btn')].find(b=>b.textContent.includes('წარსული'));
  if(past&&past.nextSibling)bar.insertBefore(btn,past.nextSibling);else bar.appendChild(btn);
}
function injectForm(){
  const card=document.querySelector('.form-card');
  if(!card||document.getElementById('form-futurelife'))return;
  const div=document.createElement('div');
  div.id='form-futurelife';div.className='form-section';
  div.innerHTML=`
    <div class="person-label">🐉 მომავალი ინკარნაცია</div>
    <div class="field wide" style="margin-bottom:10px">
      <label>სახელი</label><input id="fl-name" placeholder="სახელი">
    </div>
    <div class="form-grid">
      <div class="field"><label>დღე</label><input type="number" id="fl-day" value="1" min="1" max="31"></div>
      <div class="field"><label>თვე</label><input type="number" id="fl-month" value="1" min="1" max="12"></div>
      <div class="field"><label>წელი</label><input type="number" id="fl-year" value="1990"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>საათი</label><input type="number" id="fl-hour" value="12" min="0" max="23"></div>
      <div class="field"><label>წუთი</label><input type="number" id="fl-minute" value="0" min="0" max="59"></div>
      <div class="field"><label>წამი</label><input type="number" id="fl-second" value="0" min="0" max="59"></div>
    </div>
    <div class="field" style="margin-bottom:8px">
      <label>ქალაქი</label>
      <input id="fl-city" placeholder="ქალაქი" oninput="searchCity('fl')">
      <div class="city-hint" id="fl-city-hint"></div>
    </div>
    <div class="form-grid-2" style="margin-bottom:4px">
      <div class="field"><label>განედი</label><input type="number" id="fl-lat" step="0.0001" readonly></div>
      <div class="field"><label>გრძედი</label><input type="number" id="fl-lon" step="0.0001" readonly></div>
    </div>
    <input type="hidden" id="fl-tz" value="UTC">
    <div class="tz-display" id="fl-tz-display">—</div>
    <div class="form-grid-2" style="margin-bottom:4px">
      <div class="field"><label>სკანირების წლები</label><input type="number" id="fl-span" value="200" min="20" max="2000" step="10"></div>
      <div class="field"><label>მაქს. ეპოქა</label><input type="number" id="fl-max" value="6" min="1" max="10"></div>
    </div>
    <p style="font-size:10px;color:rgba(150,120,220,.6);margin:8px 0;font-style:italic">
      🐉 ეძებს ყველა მომენტს, როცა იმ მომენტის დრაკონული ♇ = ნატალურ ♇ ·
      შუალედი იზომება ეფემერიდიდან, არ არის წინასწარ დაშვებული</p>
    <button class="gen-btn" id="fl-gen-btn" style="margin-top:6px">🐉 მომავალი ინკარნაციების ძებნა</button>`;
  card.appendChild(div);
  document.getElementById('fl-gen-btn').onclick=run;
}
function activate(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('fl-tab-btn').classList.add('active');
  document.querySelectorAll('.form-section').forEach(s=>s.classList.remove('active'));
  document.getElementById('form-futurelife').classList.add('active');
  const ca=document.getElementById('chart-area');if(ca)ca.style.display='none';
  const acg=document.getElementById('acg-section');if(acg)acg.style.display='none';
  try{currentMode='futurelife';}catch(e){}
}

/* ═══ 2. DRAGON PLUTO AT A MOMENT  (♇ − ☊, both from same chart) ═ */
const _dcache={};
async function dracoPluto(y,m,d){
  const k=y+'-'+m+'-'+(d||15);
  if(_dcache[k]!==undefined)return _dcache[k];
  try{
    const r=await fetch(`${BACKEND}/chart`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({year:y,month:m,day:d||15,hour:12,minute:0,second:0,lat:0,lon:0,tz_name:'UTC'})});
    const j=await r.json();
    const pl=j.planets?.['პლუტონი']?.degree, nd=j.planets?.['ჩრდ. კვანძი']?.degree;
    const v=(pl==null||nd==null)?null:norm(pl-nd);
    _dcache[k]=v;return v;
  }catch(e){_dcache[k]=null;return null;}
}
const msToYMD=ms=>{const t=new Date(ms);return[t.getUTCFullYear(),t.getUTCMonth()+1,t.getUTCDate()];};
async function dracoMs(ms){const[y,m,d]=msToYMD(ms);return dracoPluto(y,m,d);}

/* false-position refine to day precision */
async function refine(msA,msB,target){
  let a=msA,b=msB;
  let fa=await dracoMs(a),fb=await dracoMs(b);
  if(fa==null||fb==null)return null;
  let ga=sdiff(fa,target),gb=sdiff(fb,target);
  if(!(ga<0&&gb>0))return null;                  // not a clean crossing
  for(let i=0;i<7&&(b-a)>86400000;i++){
    const t=Math.round(a+(b-a)*(-ga)/(gb-ga));
    if(t<=a||t>=b)break;
    const f=await dracoMs(t);if(f==null)break;
    const g=sdiff(f,target);
    if(g<0){a=t;ga=g;}else{b=t;gb=g;}
  }
  const mid=Math.round((a+b)/2);
  const f=await dracoMs(mid);
  return{ms:mid,orb:f==null?null:Math.abs(sdiff(f,target))};
}

/* ═══ 3. RESONANCE ═════════════════════════════════════════════ */
const FL_LUM=new Set(['მზე','მთვარე','AC','MC']);
const FL_PERS=new Set(['მზე','მთვარე','მერკური','ვენერა','მარსი']);
const FL_KARMIC=new Set(['ჩრდ. კვანძი','სამხ. კვანძი','პლუტონი','სატურნი']);
function scoreResonance(cross){
  let score=0,tight=0,karmic=0,lum=0;
  for(const a of cross){
    if(a.p1==='პლუტონი'&&a.p2==='პლუტონი')continue;   // guaranteed by method
    const maxo=(a.type==='შეერთება'||a.type==='ოპოზიცია')?12:(a.type==='კვინკონსი'?6:10);
    const t=Math.max(0,1-a.orb/maxo);
    let w=0.5;
    if(FL_LUM.has(a.p1)&&FL_LUM.has(a.p2))w=3;
    else if(FL_LUM.has(a.p1)||FL_LUM.has(a.p2))w=2;
    else if(FL_PERS.has(a.p1)&&FL_PERS.has(a.p2))w=1.5;
    if(FL_KARMIC.has(a.p1)||FL_KARMIC.has(a.p2))w+=1;
    if(a.type==='შეერთება')w*=1.3;
    else if(a.type==='ოპოზიცია'||a.type==='ტრინი')w*=1.1;
    score+=w*t*t;
    if(a.orb<=2){tight++;
      if(FL_KARMIC.has(a.p1)||FL_KARMIC.has(a.p2))karmic++;
      if(FL_LUM.has(a.p1)||FL_LUM.has(a.p2))lum++;}
  }
  return{score:Math.round(score*10)/10,tight,karmic,lum};
}

/* ═══ 4. MAIN ══════════════════════════════════════════════════ */
let _flNatal=null,_flPerson=null;
async function run(){
  const btn=document.getElementById('fl-gen-btn');
  btn.disabled=true;btn.textContent='⏳ იტვირთება...';
  try{
    const p=getPersonData('fl');
    if(!p.lat||!p.lon){showError('შეიყვანეთ ქალაქი');return;}
    _flPerson=p;
    const natal=await fetchChart(p);natal._timeUnknown=false;
    _flNatal=natal;window._plNatal=natal;
    const target=natal.planets['პლუტონი']?.degree;
    if(target==null){showError('ნატალური პლუტო ვერ მოიძებნა');return;}

    const ca=document.getElementById('chart-area');
    ca.style.display='block';
    const af=document.getElementById('asp-filters');if(af)af.style.display='none';
    document.getElementById('mode-label').textContent='🐉 მომავალი ინკარნაციები...';
    document.getElementById('legend-wrap').style.display='none';
    document.getElementById('planet-b-wrap').style.display='none';
    document.getElementById('wheel-wrap').style.display='none';
    const acg=document.getElementById('acg-section');if(acg)acg.style.display='none';

    let wrap=document.getElementById('future-life-wrap');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='future-life-wrap';
      wrap.style.cssText='margin:12px 0;padding:14px 18px;background:rgba(8,6,20,.8);border:1px solid rgba(180,140,40,.4);border-radius:12px;';
      ca.appendChild(wrap);
    }
    wrap.innerHTML=`<div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:3px;color:rgba(240,208,128,.8);margin-bottom:8px">🐉 მომავალი ინკარნაციები</div>
      <div style="font-size:12px;color:#c8b8f0;margin-bottom:4px">სამიზნე — ნატალური ♇ <strong style="color:#c050a0">${fmtL(target)}</strong></div>
      <div style="font-size:10px;color:rgba(155,168,184,.55);margin-bottom:10px">ვეძებთ T-ს, სადაც ♇(T) − ☊(T) = ამ გრადუსს</div>
      <div id="fl-result"></div>`;
    ca.scrollIntoView({behavior:'smooth',block:'start'});
    await scan(target,document.getElementById('fl-result'),p);
  }catch(e){showError(e.message);console.error(e);}
  finally{btn.disabled=false;btn.textContent='🐉 მომავალი ინკარნაციების ძებნა';}
}

/* ═══ 5. SCAN ══════════════════════════════════════════════════ */
async function scan(target,resultEl,p){
  const span=Math.max(20,+document.getElementById('fl-span').value||200);
  const maxE=Math.min(MAX_EPOCHS,+document.getElementById('fl-max').value||6);
  const startY=new Date().getFullYear()+1,endY=startY+span;

  // coarse: yearly samples of dragon Pluto
  const years=[];for(let y=startY;y<=endY;y++)years.push(y);
  const vals=[];
  for(let i=0;i<years.length;i+=20){
    const chunk=years.slice(i,i+20);
    vals.push(...await Promise.all(chunk.map(y=>dracoPluto(y,6,15))));
    resultEl.innerHTML='<span style="color:#a78bfa">🔍 სკანირება '+startY+'–'+endY+'... '+
      Math.min(i+20,years.length)+'/'+years.length+' წელი</span>';
  }

  // brackets: signed diff flips − → +
  const brackets=[];
  for(let i=0;i<vals.length-1;i++){
    if(vals[i]==null||vals[i+1]==null)continue;
    const g1=sdiff(vals[i],target),g2=sdiff(vals[i+1],target);
    if(g1<0&&g2>0)brackets.push([Date.UTC(years[i],5,15),Date.UTC(years[i+1],5,15)]);
    if(brackets.length>=maxE)break;
  }
  if(!brackets.length){resultEl.textContent='⚠️ '+endY+' წლამდე გადაკვეთა ვერ მოიძებნა';return;}

  // refine each to day precision
  const found=[];
  for(const br of brackets){
    resultEl.innerHTML='<span style="color:#a78bfa">🎯 დაზუსტება... ('+(found.length+1)+'/'+brackets.length+')</span>';
    const r=await refine(br[0],br[1],target);
    if(!r)continue;
    const[y,m,d]=msToYMD(r.ms);
    found.push({ms:r.ms,year:y,month:m,day:d,orb:r.orb});
  }
  if(!found.length){resultEl.textContent='⚠️ გადაკვეთა ვერ დაზუსტდა';return;}

  // MEASURED gaps between consecutive crossings
  found.sort((a,b)=>a.ms-b.ms);
  for(let i=0;i<found.length;i++)
    found[i].gap=i?((found[i].ms-found[i-1].ms)/(365.2425*86400000)):null;
  const gaps=found.filter(f=>f.gap!=null).map(f=>f.gap);
  const meanGap=gaps.length?(gaps.reduce((a,b)=>a+b,0)/gaps.length):null;

  // resonance pass
  window._flCharts={};
  for(let i=0;i<found.length;i++){
    const f=found[i];
    resultEl.innerHTML='<span style="color:#a78bfa">🔗 რეზონანსის ანალიზი... ('+(i+1)+'/'+found.length+')</span>';
    try{
      const fut=await fetchChart({year:f.year,month:f.month,day:f.day,hour:12,minute:0,second:0,
        lat:p.lat,lon:p.lon,tz_name:p.tz_name});
      fut._timeUnknown=false;
      window._flCharts[f.year+'-'+f.month+'-'+f.day]=fut;
      const cross=calcCrossAspects(_flNatal.planets,fut.planets);
      Object.assign(f,scoreResonance(cross),{n:cross.length});
    }catch(e){Object.assign(f,{score:0,tight:0,karmic:0,lum:0,n:0});}
  }

  const chrono=[...found];
  found.sort((a,b)=>b.score-a.score);
  const best=found[0]?.score||1;
  const nowY=new Date().getFullYear();
  const GRADE=s=>s>=best*0.8?['#f0c96b','★★★ ძლიერი რეზონანსი','🔮 ']
              :s>=best*0.5?['#a78bfa','★★ საშუალო','']
              :['#5a6472','★ სუსტი — მხოლოდ პლუტო',''];

  resultEl.innerHTML=
    `<div style="font-size:11px;color:#d7dde6;margin-bottom:8px;padding:6px 10px;background:rgba(45,31,110,.25);border-radius:8px">
      📏 ნაპოვნია <b style="color:#f0c96b">${chrono.length}</b> გადაკვეთა ${span} წელიწადში ·
      გაზომილი შუალედი: <b style="color:#f0c96b">${meanGap?meanGap.toFixed(1)+' წელი':'—'}</b>
      ${gaps.length>1?'<span style="color:rgba(155,168,184,.6);font-size:10px"> (მინ '+Math.min(...gaps).toFixed(1)+' · მაქს '+Math.max(...gaps).toFixed(1)+')</span>':''}
    </div>`+
    found.map((f,i)=>{
      const[gc,gl,pre]=GRADE(f.score);
      const strong=f.score>=best*0.8;
      return `<div style="padding:8px;margin-bottom:6px;background:rgba(120,80,20,${strong?'.28':'.12'});border-radius:8px;border-left:3px solid ${gc};font-size:11px;color:#e8dcc0;line-height:1.8;${strong?'':'opacity:.7'}">
        ${pre}<strong>ინკარნაცია ${i+1}</strong>
        <span style="color:${gc};font-size:10.5px;margin-left:6px">${gl}</span><br>
        <span style="font-size:14px;color:#f9c646;font-family:Cinzel,serif">${f.day} ${MONTHS[f.month-1]}. ${f.year}</span>
        <span style="font-size:10px;color:rgba(200,180,140,.6)"> · ±${f.orb!=null?f.orb.toFixed(3):'?'}° · ${f.year-nowY} წელიწადში${f.gap?' · წინადან +'+f.gap.toFixed(1)+' წ':''}</span>
        <button data-k="${f.year}-${f.month}-${f.day}" class="fl-chart-btn"
          style="background:none;border:1px solid rgba(240,201,107,.5);color:#f0c96b;border-radius:6px;padding:1px 9px;font-size:10px;cursor:pointer;font-family:inherit;margin-left:8px">📜 რუქა</button>
        <div style="font-size:10px;color:#c8b8f0;padding-top:3px">
          🔗 ქულა <b style="color:${gc}">${f.score}</b> · ${f.tight} მჭიდრო (≤2°) ·
          ${f.lum} მნათობი/კუთხე · ${f.karmic} კარმული · სულ ${f.n} ასპექტი</div>
      </div>`;}).join('')+
    `<div style="font-size:9px;color:rgba(155,168,184,.45);margin-top:4px;letter-spacing:1px">
      დრაკონული ♇ = ♇(T) − ☊(T) · ♇–♇ არ ითვლება ქულაში · მეტი კავშირი = უფრო სავარაუდო შემდეგი სიცოცხლე</div>`;

  resultEl.querySelectorAll('.fl-chart-btn').forEach(b=>{
    b.onclick=()=>showFuture(b.dataset.k);
  });
}

/* ═══ 6. DRAGON CHART OF T → FUTURE NATAL ══════════════════════ */
async function showFuture(key){
  try{
    const[y,m,d]=key.split('-').map(Number);
    let fut=window._flCharts&&window._flCharts[key];
    if(!fut){
      fut=await fetchChart({year:y,month:m,day:d,hour:12,minute:0,second:0,
        lat:_flPerson.lat,lon:_flPerson.lon,tz_name:_flPerson.tz_name});
      fut._timeUnknown=false;
    }
    const name=document.getElementById('fl-name').value||'';
    // TRUE dragon chart of T — rotated by T's OWN node
    const drago=calcDraconicChart(fut);
    if(!drago){showError('დრაკონული რუქა ვერ აიგო');return;}
    drago._timeUnknown=false;
    const dpl=drago.planets['პლუტონი']?.degree;
    const npl=_flNatal.planets['პლუტონი']?.degree;
    let verify='';
    if(dpl!=null&&npl!=null){
      const orb=Math.abs(sdiff(dpl,npl));
      verify=' · 🐉♇ '+fmtL(dpl)+' = ნატ.♇ '+fmtL(npl)+' (±'+orb.toFixed(3)+'°)';
    }
    showSingleChart(drago,'🐉 '+name+' — დრაკონული '+d+'.'+m+'.'+y+verify,false);

    const ml=document.getElementById('mode-label');
    const old=document.getElementById('fl-flip-btn');if(old)old.remove();
    if(ml){
      const b=document.createElement('button');
      b.id='fl-flip-btn';b.textContent='→ მომავალი ნატალური რუქა';
      b.style.cssText='display:block;margin:8px auto;background:linear-gradient(90deg,#8a6a20,#c9a84c);border:none;color:#0a0810;padding:7px 18px;border-radius:8px;cursor:pointer;font-family:Cinzel,serif;font-size:11px;letter-spacing:2px';
      ml.after(b);
      b.onclick=()=>{
        b.remove();
        const cross=calcCrossAspects(_flNatal.planets,fut.planets);
        showDoubleChart(_flNatal,fut,'ნატალი',''+y,'🐉 '+name+' — მომავალი ნატალი '+d+'.'+m+'.'+y,cross);
        const wrap=document.getElementById('future-life-wrap');
        const ca=document.getElementById('chart-area');
        if(wrap&&ca)ca.appendChild(wrap);
      };
    }
    const wrap=document.getElementById('future-life-wrap');
    const ca=document.getElementById('chart-area');
    if(wrap&&ca&&wrap.parentNode===ca)ca.appendChild(wrap);
  }catch(e){showError(e.message);}
}

/* ═══ INIT ═════════════════════════════════════════════════════ */
function init(){injectTab();injectForm();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
