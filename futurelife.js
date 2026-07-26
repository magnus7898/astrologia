/* ═══════════════════════════════════════════════════════════════════
   futurelife.js — MAGNUS · მომავალი სიცოცხლე  (v7)
   RULES:
     1) EPOCH : find T where dragon ♇ of T (♇(T) − ☊(T)) = natal ♇
                → date, refined to day precision, spacing MEASURED
     2) GEO   : current life's birth city = the future natal's IC
                meridian → future birth countries lie along that line
     3) CHART : 📜 shows the FUTURE NATAL only (vs current natal)
     4) RANK  : resonance with current natal (♇–♇ excluded)
   astro.html needs only: <script src="futurelife.js"></script>
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

const MAX_EPOCHS=10;
const norm=x=>((x%360)+360)%360;
const sdiff=(a,b)=>((a-b+540)%360)-180;
const fmtL=L=>{L=norm(L);const s=Math.floor(L/30),d=L%30;
  return Math.floor(d)+'°'+String(Math.floor((d%1)*60)).padStart(2,'0')+"' "+SIGN_KA[s];};
const MONTHS=['იანვ','თებ','მარ','აპრ','მაის','ივნ','ივლ','აგვ','სექ','ოქტ','ნოემ','დეკ'];

let _flNatal=null,_flPerson=null,_flMap=null;

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
      🐉 დრაკონული ♇ = ნატალური ♇ → ეპოქა · დაბადების ქალაქი = მომავალი ნატალის IC მერიდიანი →
      მომავალი ქვეყნები ამ ხაზზე</p>
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

/* ═══ 2. DRAGON PLUTO OF A MOMENT (♇ − ☊, same chart) ══════════ */
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
async function refine(msA,msB,target){
  let a=msA,b=msB;
  let fa=await dracoMs(a),fb=await dracoMs(b);
  if(fa==null||fb==null)return null;
  let ga=sdiff(fa,target),gb=sdiff(fb,target);
  if(!(ga<0&&gb>0))return null;
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
    const ew=p.lon>=0?'აღმ':'დას';
    wrap.innerHTML=`<div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:3px;color:rgba(240,208,128,.8);margin-bottom:8px">🐉 მომავალი ინკარნაციები</div>
      <div style="font-size:12px;color:#c8b8f0;margin-bottom:4px">სამიზნე — ნატალური ♇ <strong style="color:#c050a0">${fmtL(target)}</strong>
        · ვეძებთ T-ს, სადაც ♇(T) − ☊(T) = ამ გრადუსს</div>
      <div style="font-size:11px;color:#d7dde6;margin-bottom:8px">🌍 მომავალი IC მერიდიანი (= დაბადების ქალაქი):
        <b style="color:#f0c96b">${Math.abs(p.lon).toFixed(2)}° ${ew}</b>
        <button id="fl-geo-btn" style="background:none;border:1px solid rgba(240,201,107,.5);color:#f0c96b;border-radius:6px;padding:1px 8px;font-size:10px;cursor:pointer;font-family:inherit;margin-left:6px">🌍 მომავალი ქვეყნები</button>
        <span id="fl-countries" style="font-size:10.5px;color:#7ee3bd;display:block;margin-top:3px"></span></div>
      <div id="fl-result"></div>
      <div id="fl-map" style="height:300px;border-radius:10px;margin-top:10px;border:1px solid rgba(180,140,40,.3)"></div>
      <div style="font-size:9px;color:rgba(155,168,184,.45);margin-top:6px;letter-spacing:1px">ოქროსფერი ხაზი = მომავალი ნატალის IC მერიდიანი · ამ ხაზზე მდებარე ქვეყნები = მომავალი დაბადების ადგილები</div>`;
    ca.scrollIntoView({behavior:'smooth',block:'start'});
    document.getElementById('fl-geo-btn').onclick=e=>flCountries(p.lon,e.target);
    drawMeridianMap(p.lon);
    await scan(target,document.getElementById('fl-result'),p);
    document.getElementById('fl-geo-btn').click();
  }catch(e){showError(e.message);console.error(e);}
  finally{btn.disabled=false;btn.textContent='🐉 მომავალი ინკარნაციების ძებნა';}
}

/* ═══ 5. IC MERIDIAN MAP + COUNTRIES ═══════════════════════════ */
function drawMeridianMap(lon){
  const el=document.getElementById('fl-map');
  if(!el||typeof L==='undefined')return;
  if(_flMap){_flMap.remove();_flMap=null;}
  const map=L.map('fl-map',{zoomControl:true,attributionControl:false,worldCopyJump:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  map.setView([25,lon],2);
  [-360,0,360].forEach(o=>{
    L.polyline([[-85,lon+o],[85,lon+o]],{color:'#f0c96b',weight:3,opacity:.95,dashArray:'8 6'})
      .addTo(map).bindTooltip('მომავალი IC მერიდიანი',{permanent:false});
  });
  L.marker([72,lon],{icon:L.divIcon({className:'',
    html:'<div style="color:#f0c96b;font-size:10px;font-weight:700;text-shadow:0 0 4px #000;white-space:nowrap">IC</div>'})}).addTo(map);
  _flMap=map;
  setTimeout(()=>map.invalidateSize(),80);
}
async function flCountries(lon,btn){
  const out=document.getElementById('fl-countries');
  btn.disabled=true;btn.textContent='⏳';
  const lats=[62,55,48,42,36,30,22,14,6,-2,-10,-20,-30,-40];
  const found=[];
  for(const lat of lats){
    try{
      const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=3&format=json&accept-language=ka`);
      const d=await r.json();
      const nm=d.address?.country||null;
      if(nm&&!found.includes(nm))found.push(nm);
    }catch(e){}
    await new Promise(s=>setTimeout(s,350));
  }
  out.textContent=found.length?('🌍 '+found.join(' · ')):'ოკეანე / ვერ მოიძებნა';
  btn.textContent='🌍 მომავალი ქვეყნები';btn.disabled=false;
}

/* ═══ 6. SCAN ══════════════════════════════════════════════════ */
async function scan(target,resultEl,p){
  const span=Math.max(20,+document.getElementById('fl-span').value||200);
  const maxE=Math.min(MAX_EPOCHS,+document.getElementById('fl-max').value||6);
  const startY=new Date().getFullYear()+1,endY=startY+span;

  const years=[];for(let y=startY;y<=endY;y++)years.push(y);
  const vals=[];
  for(let i=0;i<years.length;i+=20){
    const chunk=years.slice(i,i+20);
    vals.push(...await Promise.all(chunk.map(y=>dracoPluto(y,6,15))));
    resultEl.innerHTML='<span style="color:#a78bfa">🔍 სკანირება '+startY+'–'+endY+'... '+
      Math.min(i+20,years.length)+'/'+years.length+' წელი</span>';
  }
  const brackets=[];
  for(let i=0;i<vals.length-1;i++){
    if(vals[i]==null||vals[i+1]==null)continue;
    const g1=sdiff(vals[i],target),g2=sdiff(vals[i+1],target);
    if(g1<0&&g2>0)brackets.push([Date.UTC(years[i],5,15),Date.UTC(years[i+1],5,15)]);
    if(brackets.length>=maxE)break;
  }
  if(!brackets.length){resultEl.textContent='⚠️ '+endY+' წლამდე გადაკვეთა ვერ მოიძებნა';return;}

  const found=[];
  for(const br of brackets){
    resultEl.innerHTML='<span style="color:#a78bfa">🎯 თარიღის დაზუსტება... ('+(found.length+1)+'/'+brackets.length+')</span>';
    const r=await refine(br[0],br[1],target);
    if(!r)continue;
    const[y,m,d]=msToYMD(r.ms);
    found.push({ms:r.ms,year:y,month:m,day:d,orb:r.orb});
  }
  if(!found.length){resultEl.textContent='⚠️ გადაკვეთა ვერ დაზუსტდა';return;}

  found.sort((a,b)=>a.ms-b.ms);
  for(let i=0;i<found.length;i++)
    found[i].gap=i?((found[i].ms-found[i-1].ms)/(365.2425*86400000)):null;
  const gaps=found.filter(f=>f.gap!=null).map(f=>f.gap);
  const meanGap=gaps.length?(gaps.reduce((a,b)=>a+b,0)/gaps.length):null;

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
      📏 <b style="color:#f0c96b">${chrono.length}</b> გადაკვეთა ${span} წელიწადში ·
      გაზომილი შუალედი <b style="color:#f0c96b">${meanGap?meanGap.toFixed(1)+' წელი':'—'}</b>
      ${gaps.length>1?'<span style="color:rgba(155,168,184,.6);font-size:10px"> (მინ '+Math.min(...gaps).toFixed(1)+' · მაქს '+Math.max(...gaps).toFixed(1)+')</span>':''}
    </div>`+
    found.map((f,i)=>{
      const[gc,gl,pre]=GRADE(f.score);
      const strong=f.score>=best*0.8;
      return `<div style="padding:8px;margin-bottom:6px;background:rgba(120,80,20,${strong?'.28':'.12'});border-radius:8px;border-left:3px solid ${gc};font-size:11px;color:#e8dcc0;line-height:1.8;${strong?'':'opacity:.7'}">
        ${pre}<strong>ინკარნაცია ${i+1}</strong>
        <span style="color:${gc};font-size:10.5px;margin-left:6px">${gl}</span><br>
        <span style="font-size:14px;color:#f9c646;font-family:Cinzel,serif">${f.day} ${MONTHS[f.month-1]}. ${f.year}</span>
        <span style="font-size:10px;color:rgba(200,180,140,.6)"> · ♇±${f.orb!=null?f.orb.toFixed(3):'?'}° · ${f.year-nowY} წელიწადში${f.gap?' · +'+f.gap.toFixed(1)+' წ':''}</span>
        <button data-k="${f.year}-${f.month}-${f.day}" class="fl-chart-btn"
          style="background:none;border:1px solid rgba(240,201,107,.5);color:#f0c96b;border-radius:6px;padding:1px 9px;font-size:10px;cursor:pointer;font-family:inherit;margin-left:8px">📜 ნატალური რუქა</button>
        <div style="font-size:10px;color:#c8b8f0;padding-top:3px">
          🔗 ქულა <b style="color:${gc}">${f.score}</b> · ${f.tight} მჭიდრო (≤2°) ·
          ${f.lum} მნათობი/კუთხე · ${f.karmic} კარმული · სულ ${f.n} ასპექტი</div>
      </div>`;}).join('')+
    `<div style="font-size:9px;color:rgba(155,168,184,.45);margin-top:4px;letter-spacing:1px">
      დრაკონული ♇ = ♇(T) − ☊(T) · ♇–♇ არ ითვლება ქულაში · მეტი კავშირი = უფრო სავარაუდო შემდეგი სიცოცხლე</div>`;

  resultEl.querySelectorAll('.fl-chart-btn').forEach(b=>{b.onclick=()=>showFuture(b.dataset.k);});
}


/* ═══ 7. FUTURE NATAL — Sun-IC line through current birthplace ═ */
const FL_LATS=[60,52,45,40,35,28,20,10,0,-15,-30];
const SID=15.0410686;                       // GST degrees per UT hour
const normLon=l=>{const r=norm(l);return r>180?r-360:r;};

/* solve UT hour where the Sun's IC line falls on lon0 */
async function solveSunIC(y,m,d,lon0){
  const at=async(h,mi)=>{
    const r=await fetch(`${BACKEND}/chart`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({year:y,month:m,day:d,hour:h,minute:mi||0,second:0,lat:0,lon:0,tz_name:'UTC'})});
    const j=await r.json();
    if(j.mc==null||!j.planets?.['მზე'])return null;
    return{gst:norm(ecl2eq(j.mc).ra),sunRA:norm(ecl2eq(j.planets['მზე'].degree).ra)};
  };
  let s=await at(0,0);if(!s)return null;
  let hours=norm(norm(s.sunRA+180-lon0)-s.gst)/SID;
  for(let i=0;i<2;i++){
    const H=Math.floor(hours),M=Math.round((hours-H)*60);
    const s2=await at(H%24,M>=60?59:M);
    if(!s2)break;
    const icNow=normLon(s2.sunRA-s2.gst+180);
    const err=sdiff(lon0,icNow);            // degrees of longitude to correct
    if(Math.abs(err)<0.05)break;
    hours=norm(hours*SID+err)/SID;
  }
  const H=Math.floor(hours),M=Math.round((hours-H)*60);
  const hh=(M>=60?H+1:H)%24, mm=M>=60?0:M;
  const chk=await at(hh,mm);
  const orb=chk?Math.abs(sdiff(lon0,normLon(chk.sunRA-chk.gst+180))):null;
  return{hour:hh,minute:mm,orb};
}

async function showFuture(key){
  try{
    const[y,m,d]=key.split('-').map(Number);
    const ca=document.getElementById('chart-area');
    document.getElementById('mode-label').textContent='🕐 დაბადების დროის ამოხსნა (☉-IC ხაზი)...';
    const t=await solveSunIC(y,m,d,_flPerson.lon);
    const hh=t?t.hour:12,mm=t?t.minute:0;
    const fut=await fetchChart({year:y,month:m,day:d,hour:hh,minute:mm,second:0,
      lat:_flPerson.lat,lon:_flPerson.lon,tz_name:'UTC'});
    fut._timeUnknown=false;
    _flCur={y,m,d,hh,mm,fut,icOrb:t?t.orb:null};
    drawFutureWheel(fut,null);
    await buildRisingTable();
  }catch(e){showError(e.message);}
}

function drawFutureWheel(chart,place){
  const{y,m,d,hh,mm,icOrb}=_flCur;
  const name=document.getElementById('fl-name').value||'';
  const pad=n=>String(n).padStart(2,'0');
  const loc=place?' · '+place.country+' '+Math.abs(place.lat)+'°'+(place.lat>=0?'N':'S'):'';
  const orb=icOrb!=null?' · ☉IC±'+icOrb.toFixed(2)+'°':'';
  showSingleChart(chart,'🐉 '+name+' — მომავალი ნატალი '+d+'.'+m+'.'+y+' '+pad(hh)+':'+pad(mm)+' UT'+loc+orb,false);
  const ml=document.getElementById('mode-label');
  const old=document.getElementById('fl-cmp-btn');if(old)old.remove();
  if(ml){
    const b=document.createElement('button');
    b.id='fl-cmp-btn';b.textContent='⇄ ნატალთან შედარება';
    b.style.cssText='display:block;margin:8px auto;background:linear-gradient(90deg,#8a6a20,#c9a84c);border:none;color:#0a0810;padding:7px 18px;border-radius:8px;cursor:pointer;font-family:Cinzel,serif;font-size:11px;letter-spacing:2px';
    ml.after(b);
    b.onclick=()=>{
      const cross=calcCrossAspects(_flNatal.planets,chart.planets);
      showDoubleChart(_flNatal,chart,'ნატალი',''+y,'🐉 ნატალი × მომავალი '+d+'.'+m+'.'+y,cross);
      const ca=document.getElementById('chart-area');
      ['fl-rising-wrap','future-life-wrap'].forEach(id=>{const w=document.getElementById(id);if(w&&ca)ca.appendChild(w);});
    };
  }
  const ca=document.getElementById('chart-area');
  ['fl-rising-wrap','future-life-wrap'].forEach(id=>{const w=document.getElementById(id);if(w&&ca)ca.appendChild(w);});
  if(_flMap)setTimeout(()=>_flMap.invalidateSize(),60);
}

async function buildRisingTable(){
  const{y,m,d,hh,mm}=_flCur;
  const ca=document.getElementById('chart-area');
  let wrap=document.getElementById('fl-rising-wrap');
  if(!wrap){
    wrap=document.createElement('div');wrap.id='fl-rising-wrap';
    wrap.style.cssText='margin:12px 0;padding:14px 18px;background:rgba(8,6,20,.8);border:1px solid rgba(180,140,40,.4);border-radius:12px;';
  }
  ca.appendChild(wrap);
  const lon=_flPerson.lon;
  wrap.innerHTML='<div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:3px;color:rgba(240,208,128,.8);margin-bottom:8px">🌍 მომავალი ქვეყნები — ასცენდენტი</div><div style="color:#a78bfa;font-size:12px">⏳ ☉-IC მერიდიანზე...</div>';
  const rows=[];
  for(const lat of FL_LATS){
    let country=null;
    try{
      const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=3&format=json&accept-language=ka`);
      const j=await r.json();country=j.address?.country||null;
    }catch(e){}
    if(!country)continue;
    try{
      const ch=await fetchChart({year:y,month:m,day:d,hour:hh,minute:mm,second:0,lat,lon,tz_name:'UTC'});
      if(ch.asc==null)continue;
      ch._timeUnknown=false;
      rows.push({country,lat,asc:ch.asc,mc:ch.mc,chart:ch});
    }catch(e){}
    const ld=wrap.querySelector('div:last-child');if(ld)ld.textContent='⏳ '+rows.length+' ქვეყანა...';
    await new Promise(s=>setTimeout(s,320));
  }
  if(!rows.length){wrap.innerHTML+='<div style="color:#9ba8b8;font-size:11px">ოკეანე — ქვეყნები ვერ მოიძებნა</div>';return;}
  window._flRows=rows;
  wrap.innerHTML=`<div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:3px;color:rgba(240,208,128,.8);margin-bottom:6px">🌍 მომავალი ქვეყნები — ასცენდენტი</div>
    <div style="font-size:11px;color:#9ba8b8;margin-bottom:8px">მომავალი ☉-IC ხაზი გადის ამჟამინდელ დაბადების ადგილზე
      <b style="color:#f0c96b">${Math.abs(lon).toFixed(2)}° ${lon>=0?'აღმ':'დას'}</b> — ეს განსაზღვრავს დროს ·
      MC ყველგან: <b style="color:#e8c06e">${fmtL(rows[0].mc)}</b> · განედი ცვლის მხოლოდ ასცენდენტს</div>
    <table style="width:100%"><thead><tr><th>ქვეყანა</th><th>განედი</th><th>ასცენდენტი</th><th></th></tr></thead><tbody>
    ${rows.map((r,i)=>{const si=Math.floor(r.asc/30)%12;
      return `<tr>
        <td style="color:#e9d5ff;font-size:11px">${r.country}</td>
        <td style="color:#9ba8b8;font-size:10px">${Math.abs(r.lat)}°${r.lat>=0?'N':'S'}</td>
        <td><span class="${signClass(si)}" style="font-size:14px;font-family:serif">${ZSYM[si]}</span>
          <span style="font-size:11px;color:${ZCOL[si]}">${fmtL(r.asc)}</span></td>
        <td><button data-i="${i}" class="fl-loc-btn" style="background:none;border:1px solid rgba(240,201,107,.5);color:#f0c96b;border-radius:6px;padding:1px 9px;font-size:10px;cursor:pointer;font-family:inherit">📜 რუქა</button></td>
      </tr>`;}).join('')}
    </tbody></table>
    <div style="font-size:9px;color:rgba(155,168,184,.45);margin-top:8px;letter-spacing:1px">ერთი მომენტი, სხვადასხვა განედი — თითო ქვეყანა თავისი ამომავალი ნიშნით</div>`;
  wrap.querySelectorAll('.fl-loc-btn').forEach(b=>{
    b.onclick=()=>{const r=window._flRows[+b.dataset.i];drawFutureWheel(r.chart,r);};
  });
}

/* ═══ INIT ═════════════════════════════════════════════════════ */
function init(){injectTab();injectForm();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
