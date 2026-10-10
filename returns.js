/* returns.js — ლუნარი (lunar return), ზუსტი სოლარი, დღიური პროგნოზი.
   Self-injecting add-on for astro.html (load after trutine.js / chartpanels.js).
   • Solar/Lunar return = the exact moment the transiting Sun/Moon comes back to
     its natal longitude. A local formula gives the first guess (Sun ±0.01°,
     Moon ±0.3°); the backend chart then refines it with the secant method
     until the error is < 1″ of arc (seconds of time).
   • Daily prognosis = transits of the day to the natal chart: Moon aspects
     that perfect during the day (00:00–24:00), slower planets within 1–1.5°,
     the Moon's sign, natal house and phase.                                  */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const D2R=Math.PI/180,norm=x=>((x%360)+360)%360,wrap=x=>{x=norm(x);return x>180?x-360:x;};
const pad=n=>String(n).padStart(2,'0');
/* Georgian case endings: ვერძი → ვერძში / ვერძზე, თხის რქა → თხის რქაში */
const sfx=(n,x)=>(n.endsWith('ი')?n.slice(0,-1):n)+x;

/* ── time zones: UTC instant ⇄ local wall time in an IANA zone ── */
function parts(ms,tz){
  const f=new Intl.DateTimeFormat('en-GB',{timeZone:tz||'UTC',hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const o={};f.formatToParts(new Date(ms)).forEach(p=>{if(p.type!=='literal')o[p.type]=+p.value;});
  if(o.hour===24)o.hour=0;return o;
}
function toUTC(y,mo,d,h,mi,s,tz){            /* local wall time → UTC ms */
  let g=Date.UTC(y,mo-1,d,h,mi,s||0);
  for(let i=0;i<3;i++){const p=parts(g,tz);const asUTC=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);g-= (asUTC-Date.UTC(y,mo-1,d,h,mi,s||0));}
  return g;
}
const jdOf=ms=>ms/864e5+2440587.5;
function req(ms,loc){const p=parts(ms,loc.tz_name);
  return{year:p.year,month:p.month,day:p.day,hour:p.hour,minute:p.minute,second:p.second,lat:loc.lat,lon:loc.lon,tz_name:loc.tz_name,time_unknown:false};}
const fmtLocal=(ms,tz)=>{const p=parts(ms,tz);return `${pad(p.day)}.${pad(p.month)}.${p.year} ${pad(p.hour)}:${pad(p.minute)}`;};

/* ── quick ephemeris for first guesses ── */
function sunLon(jd){const T=(jd-2451545)/36525,M=(357.52911+35999.05029*T)*D2R,L0=280.46646+36000.76983*T;
  const C=(1.914602-0.004817*T)*Math.sin(M)+0.019993*Math.sin(2*M)+0.000289*Math.sin(3*M);
  const Om=(125.04-1934.136*T)*D2R;return norm(L0+C-0.00569-0.00478*Math.sin(Om));}
function moonLon(jd){const T=(jd-2451545)/36525;
  const L=218.3164477+481267.88123421*T,D=(297.8501921+445267.1114034*T)*D2R,M=(357.5291092+35999.0502909*T)*D2R,
        Mp=(134.9633964+477198.8675055*T)*D2R,F=(93.2720950+483202.0175233*T)*D2R;
  return norm(L+6.289*Math.sin(Mp)+1.274*Math.sin(2*D-Mp)+0.658*Math.sin(2*D)+0.214*Math.sin(2*Mp)-0.186*Math.sin(M)
    -0.114*Math.sin(2*F)+0.059*Math.sin(2*D-2*Mp)+0.057*Math.sin(2*D-M-Mp)+0.053*Math.sin(2*D+Mp)+0.046*Math.sin(2*D-M)-0.041*Math.sin(M-Mp));}
const QUICK={'მზე':[sunLon,0.9856],'მთვარე':[moonLon,13.18]};
/* next time (after ms0) the body reaches lon — quick formula only */
function quickNext(body,target,ms0){
  const [f,v]=QUICK[body];let t=ms0+norm(target-f(jdOf(ms0)))/v*864e5;
  for(let i=0;i<8;i++){const e=wrap(f(jdOf(t))-target);t-=e/v*864e5;if(Math.abs(e)<1e-4)break;}
  return t;
}
/* refine with the backend (the chart itself) — secant method */
async function exact(body,target,guess,loc,note){
  const lonAt=async t=>{const d=await fetchChart(req(t,loc));return{d,lon:+d.planets[body].degree};};
  const v=QUICK[body][1];
  let t1=guess,r1=await lonAt(t1),e1=wrap(r1.lon-target);
  let t2=t1-e1/v*864e5,r2=await lonAt(t2),e2=wrap(r2.lon-target);
  for(let i=0;i<6&&Math.abs(e2)>0.0003;i++){
    if(note)note(`⏳ დაზუსტება… ${Math.abs(e2*3600).toFixed(0)}″`);
    const t3=(e2!==e1)?t2-e2*(t2-t1)/(e2-e1):t2-e2/v*864e5;
    t1=t2;e1=e2;t2=t3;r2=await lonAt(t2);e2=wrap(r2.lon-target);
  }
  return{ms:t2,chart:r2.d,err:e2};
}

/* ── UI: tabs & forms (appended last, like trutine.js) ── */
const CSS=`
.rt-note{font-size:11px;color:rgba(200,180,140,.7);line-height:1.6;margin:-2px 0 10px}
.rt-ap{background:rgba(201,162,76,.1);border:1px solid rgba(201,162,76,.35);color:#E8C97A;border-radius:6px;padding:3px 9px;font-size:10px;cursor:pointer;font-family:inherit}
#rt-card{max-width:1100px;margin:6px auto 16px;background:rgba(28,20,13,.55);border:1px solid rgba(201,162,76,.28);border-radius:14px;padding:16px 18px}
#rt-card h3{font-family:'Cinzel',serif;font-weight:400;font-size:11px;letter-spacing:3px;color:#C9A24C;margin:0 0 10px}
#rt-card .big{font-family:'Cinzel',serif;font-size:22px;color:#F0D48A}
#rt-card .sm{font-size:11.5px;color:rgba(196,176,148,.7)}
.rt-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin-top:10px}
.rt-list button{background:rgba(255,255,255,.03);border:1px solid rgba(201,162,76,.2);border-radius:8px;color:#EFE3CE;padding:6px 8px;font-size:11.5px;cursor:pointer;font-family:inherit;text-align:left}
.rt-list button:hover{border-color:rgba(201,162,76,.6)}
.rt-list button.on{border-color:#C9A24C;background:rgba(201,162,76,.12)}
.dp-tone{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
.dp-tone .sc{font-family:'Cinzel',serif;font-size:34px}
.dp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
.dp-box{background:rgba(255,255,255,.025);border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.75;color:#E5DCC8}
.dp-box b{color:#F0D48A;font-weight:500}
.dp-asp{border-left:3px solid;padding:8px 12px;margin:6px 0;background:rgba(255,255,255,.02);border-radius:0 8px 8px 0;font-size:13px;line-height:1.7}
.dp-asp .h{font-weight:600}
.dp-asp .t{font-size:11px;color:rgba(196,176,148,.7)}`;

const NAT_FIELDS=['day','month','year','hour','minute','second','city','lat','lon','tz'];
function natalBlock(p,title){return `
    <div class="person-label">👤 ${title}</div>
    <div class="rt-note"><button type="button" class="rt-ap" data-copy="${p}">↧ ნატალურიდან</button></div>
    <div class="form-grid">
      <div class="field"><label>დღე</label><input type="number" id="${p}-day" value="1" min="1" max="31"></div>
      <div class="field"><label>თვე</label><input type="number" id="${p}-month" value="1" min="1" max="12"></div>
      <div class="field"><label>წელი</label><input type="number" id="${p}-year" value="1990"></div></div>
    <div class="form-grid">
      <div class="field"><label>საათი</label><input type="number" id="${p}-hour" value="12" min="0" max="23"></div>
      <div class="field"><label>წუთი</label><input type="number" id="${p}-minute" value="0" min="0" max="59"></div>
      <div class="field"><label>წამი</label><input type="number" id="${p}-second" value="0" min="0" max="59"></div></div>
    <div class="field" style="margin-bottom:8px"><label>დაბადების ქალაქი</label>
      <input id="${p}-city" placeholder="თბილისი, London, Paris..." oninput="searchCity('${p}')"><div class="city-hint" id="${p}-city-hint"></div></div>
    <input type="hidden" id="${p}-lat"><input type="hidden" id="${p}-lon"><input type="hidden" id="${p}-tz" value="UTC">
    <div class="tz-display" id="${p}-tz-display" style="margin-bottom:8px">—</div>`;}
function placeBlock(p,label){return `
      <div class="field"><label>${label}</label>
        <input id="${p}-city" placeholder="ცარიელი = დაბადების ქალაქი" oninput="searchCity('${p}')"><div class="city-hint" id="${p}-city-hint"></div></div>
      <input type="hidden" id="${p}-lat"><input type="hidden" id="${p}-lon"><input type="hidden" id="${p}-tz" value=""><span id="${p}-tz-display" style="display:none"></span>`;}
const todayISO=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};

function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!bar||!card||$('form-lunar'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const tabs=[['lunar','ლუნარი'],['daily','დღიური პროგნოზი']];
  /* place them right after the solar tab */
  const solarBtn=document.querySelector(".tab-btn[onclick*=\"'solar'\"]");
  let after=solarBtn;
  for(const [m,t] of tabs){const b=document.createElement('button');b.className='tab-btn';b.textContent=t;
    b.setAttribute('onclick',`setMode('${m}')`);
    if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);else bar.appendChild(b);after=b;}
  const lu=document.createElement('div');lu.id='form-lunar';lu.className='form-section';
  lu.innerHTML=natalBlock('lu','ნატალური მონაცემები')+`
    <div class="person-sep"></div>
    <div class="person-label person-b-label">🌙 ლუნარი</div>
    <div class="rt-note">ლუნარი — რუკა იმ ზუსტ მომენტზე, როცა მთვარე ბრუნდება თავის ნატალურ გრძედზე (≈ ყოველ 27,3 დღეში). აჩვენებს თვის თემებს: ლუნარის ასცენდენტი, სახლები და ასპექტები.</div>
    <div class="form-grid-2">
      <div class="field"><label>ლუნარი ამ თარიღიდან</label><input type="date" id="lr-from" style="color-scheme:dark"></div>
      ${placeBlock('lr','სად იმყოფებით (ქალაქი)')}
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;margin-bottom:4px"><input type="checkbox" id="lu-compare" style="accent-color:#C9A24C;width:14px;height:14px"><label for="lu-compare" style="font-size:11px;letter-spacing:1px">ნატალურთან შედარება</label></div>
    <button class="gen-btn" onclick="generate()" style="margin-top:4px">✦ ლუნარის გენერაცია ✦</button>`;
  const dp=document.createElement('div');dp.id='form-daily';dp.className='form-section';
  dp.innerHTML=natalBlock('dp','ნატალური მონაცემები')+`
    <div class="person-sep"></div>
    <div class="person-label person-b-label">📅 დღე</div>
    <div class="form-grid-2">
      <div class="field"><label>თარიღი</label><input type="date" id="dp-date" style="color-scheme:dark"></div>
      ${placeBlock('dq','სად იმყოფებით (დროის სარტყელი)')}
    </div>
    <button class="gen-btn" onclick="generate()" style="margin-top:8px">✦ დღის პროგნოზი ✦</button>`;
  const anchor=$('form-relocation')||null;
  card.insertBefore(lu,anchor);card.insertBefore(dp,anchor);
  $('lr-from').value=todayISO();$('dp-date').value=todayISO();
  [lu,dp].forEach(s=>s.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyNatal(b.dataset.copy)));
}
function copyNatal(p){
  for(const k of NAT_FIELDS){const a=$('n-'+k),b=$(p+'-'+k);if(a&&b)b.value=a.value;}
  const a=$('n-tz-display'),b=$(p+'-tz-display');if(a&&b)b.textContent=a.textContent;
  const h=$('n-city-hint'),hh=$(p+'-city-hint');if(h&&hh)hh.textContent=h.textContent;
}
function place(prefix,natal){const lat=+($(prefix+'-lat')||{}).value,lon=+($(prefix+'-lon')||{}).value,tz=($(prefix+'-tz')||{}).value;
  return(lat&&lon)?{lat,lon,tz_name:tz||natal.tz_name}:{lat:natal.lat,lon:natal.lon,tz_name:natal.tz_name};}

/* ── result card above the wheel ── */
function card(html){
  let c=$('rt-card');
  if(!c){c=document.createElement('div');c.id='rt-card';const ml=$('mode-label');ml.parentNode.insertBefore(c,ml.nextSibling.nextSibling||null);}
  /* keep it right under the title / legend */
  const lg=$('legend-wrap');if(lg&&lg.nextSibling!==c)lg.parentNode.insertBefore(c,lg.nextSibling);
  c.innerHTML=html;c.style.display='';return c;
}
const hideCard=()=>{const c=$('rt-card');if(c)c.style.display='none';};
function btnBusy(on,txt){const b=document.querySelector('.form-section.active .gen-btn:last-child');
  if(!b)return;if(on){b._t=b._t||b.textContent;b.disabled=true;b.textContent=txt||'⏳ იტვირთება...';}else{b.disabled=false;if(b._t)b.textContent=b._t;}}

/* ═════ SOLAR (exact) ═════ */
async function runSolar(){
  const natal=getPersonData('so');
  if(!natal.lat||!natal.lon){showError('შეიყვანეთ დაბადების ქალაქი');return;}
  const srYear=+$('sr-year').value;
  const loc={lat:+$('sr-lat').value||natal.lat,lon:+$('sr-lon').value||natal.lon,tz_name:$('sr-tz').value&&$('sr-tz').value!=='UTC'?$('sr-tz').value:natal.tz_name};
  const dN=await fetchChart(natal);
  const target=+dN.planets['მზე'].degree;
  const birthday=toUTC(srYear,natal.month,natal.day,natal.hour,natal.minute,natal.second,natal.tz_name);
  const guess=quickNext('მზე',target,birthday-3*864e5);
  const r=await exact('მზე',target,guess,loc,t=>btnBusy(true,t));
  const dS=r.chart;dS._timeUnknown=false;
  const lbl=`სოლარი ${srYear}`;
  if($('so-compare')&&$('so-compare').checked)
    showDoubleChart(dN,dS,'ნატალური',lbl,lbl,calcCrossAspects({...dN.planets,...(dN._aspPlanets||{})},{...dS.planets,...(dS._aspPlanets||{})}));
  else showSingleChart(dS,lbl,false);
  card(`<h3>☀ სოლარი ${srYear} — ზუსტი მომენტი</h3>
    <div class="big">${fmtLocal(r.ms,loc.tz_name)}</div>
    <div class="sm">${loc.tz_name} · მზე ბრუნდება ნატალურ ${fmtDeg(target)} ${sfx(SIGN_KA[Math.floor(target/30)],'ზე')} (სიზუსტე ${Math.abs(r.err*3600).toFixed(1)}″) · UTC ${fmtLocal(r.ms,'UTC')}</div>
    <div class="sm" style="margin-top:6px">სოლარი იხსნება ზუსტად იმ მომენტზე, როცა მზე ნატალურ გრძედს უბრუნდება — ეს დაბადების დღეს ± 1 დღით შეიძლება იყოს და საათიც სხვაა.</div>`);
}

/* ═════ LUNAR ═════ */
async function runLunar(pickMs){
  const natal=getPersonData('lu');
  if(!natal.lat||!natal.lon){showError('შეიყვანეთ დაბადების ქალაქი');return;}
  const loc=place('lr',natal);
  const dN=await fetchChart(natal);
  const target=+dN.planets['მთვარე'].degree;
  const [y,m,d]=($('lr-from').value||todayISO()).split('-').map(Number);
  const from=toUTC(y,m,d,0,0,0,loc.tz_name);
  const g0=pickMs||quickNext('მთვარე',target,from);
  const r=await exact('მთვარე',target,g0,loc,t=>btnBusy(true,t));
  const dL=r.chart;dL._timeUnknown=false;
  const lbl='ლუნარი · '+fmtLocal(r.ms,loc.tz_name);
  if($('lu-compare')&&$('lu-compare').checked)
    showDoubleChart(dN,dL,'ნატალური','ლუნარი',lbl,calcCrossAspects({...dN.planets,...(dN._aspPlanets||{})},{...dL.planets,...(dL._aspPlanets||{})}));
  else showSingleChart(dL,lbl,false);
  /* the next 13 returns (≈ one year), quick formula, ±30 min */
  const list=[];let t=quickNext('მთვარე',target,from);
  for(let i=0;i<13;i++){list.push(t);t=quickNext('მთვარე',target,t+20*864e5);}
  const asc=dL.asc!=null?`${fmtDeg(dL.asc)} ${SIGN_KA[Math.floor(dL.asc/30)]}`:'—';
  const mh=dL.planets['მთვარე']&&dL.planets['მთვარე'].house;
  const c=card(`<h3>🌙 ლუნარი — ზუსტი მომენტი</h3>
    <div class="big">${fmtLocal(r.ms,loc.tz_name)}</div>
    <div class="sm">${loc.tz_name} · მთვარე ბრუნდება ნატალურ ${fmtDeg(target)} ${sfx(SIGN_KA[Math.floor(target/30)],'ზე')} (სიზუსტე ${Math.abs(r.err*3600).toFixed(1)}″)</div>
    <div class="dp-grid" style="margin-top:12px">
      <div class="dp-box"><b>ლუნარის ასცენდენტი:</b> ${asc}<br>${ASC_TXT[Math.floor((dL.asc||0)/30)]||''}</div>
      <div class="dp-box"><b>მთვარე ${mh||'?'}-ე სახლში:</b> ${HOUSE_TXT[mh]||''}</div>
    </div>
    <div class="sm" style="margin-top:12px">შემდეგი ლუნარები (≈ ±30 წთ — დააჭირე ზუსტისთვის):</div>
    <div class="rt-list">${list.map(ms=>`<button data-ms="${ms}" class="${Math.abs(ms-r.ms)<2*864e5?'on':''}">${fmtLocal(ms,loc.tz_name)}</button>`).join('')}</div>`);
  c.querySelectorAll('.rt-list button').forEach(b=>b.onclick=async()=>{try{btnBusy(true);await runLunar(+b.dataset.ms);}catch(e){showError(e.message);}finally{btnBusy(false);}});
}
const ASC_TXT=['თვე აქტიური, ინიციატივიანი — ახალი დასაწყისები და პირადი პროექტები.','მშვიდი, პრაქტიკული თვე — ფული, კომფორტი, სხეული.',
 'ბევრი კონტაქტი, საუბარი და მოძრაობა; სწავლა და ინფორმაცია.','ემოციური, საოჯახო თვე — სახლი, ახლობლები, მოგონებები.',
 'შემოქმედება, ყურადღების ცენტრში ყოფნა, სიყვარული და თამაში.','შრომა, წესრიგი, ჯანმრთელობა და დეტალები.',
 'ურთიერთობები და პარტნიორობა წინა პლანზეა; ბალანსის ძიება.','ინტენსიური, ღრმა თვე — ტრანსფორმაცია, საიდუმლოებები, საერთო ფინანსები.',
 'გაფართოება — მოგზაურობა, სწავლა, ახალი ჰორიზონტები.','მიზნები, კარიერა და პასუხისმგებლობა; სერიოზული ტონი.',
 'მეგობრები, ჯგუფები, სიახლე და მოულოდნელობები.','ინტუიციური, მშვიდი თვე — დასვენება, სულიერება, შინაგანი სამუშაო.'];
const HOUSE_TXT=[null,'ფოკუსი შენზეა — სხეული, იმიჯი, ახალი დასაწყისები.','ფული, შემოსავალი, ღირებულებები და კომფორტი.',
 'კომუნიკაცია, მოკლე მგზავრობები, ძმები/დები, სწავლა.','სახლი, ოჯახი, შინაგანი უსაფრთხოება.','სიყვარული, შემოქმედება, ბავშვები, სიამოვნება.',
 'სამუშაო რუტინა, ჯანმრთელობა, ყოველდღიური საქმეები.','პარტნიორობა, ქორწინება, კონტრაქტები.','ღრმა ემოციები, საერთო ფული, ტრანსფორმაცია.',
 'მოგზაურობა, უმაღლესი სწავლა, ფილოსოფია.','კარიერა, რეპუტაცია, საჯარო როლი.','მეგობრები, ჯგუფები, იმედები და მომავლის გეგმები.',
 'დასვენება, განმარტოება, ქვეცნობიერი, დასრულებები.'];

/* ═════ DAILY PROGNOSIS ═════ */
const TP={'მზე':'ყურადღება და ენერგია','მთვარე':'განწყობა და გრძნობები','მერკური':'ფიქრი, საუბრები და საბუთები','ვენერა':'სიყვარული, სილამაზე და ფული',
 'მარსი':'მოქმედება, ვნება და კონფლიქტი','იუპიტერი':'ზრდა, იღბალი და შესაძლებლობები','სატურნი':'პასუხისმგებლობა, შეზღუდვა და სიმყარე',
 'ურანი':'მოულოდნელობა, ცვლილება და თავისუფლება','ნეპტუნი':'ინტუიცია, ოცნება და გაურკვევლობა','პლუტონი':'ტრანსფორმაცია, ძალაუფლება და სიღრმე'};
const NP={'მზე':'შენს „მე“-ს, ნებასა და ცხოველმყოფელობას','მთვარე':'ემოციებს, სახლსა და ოჯახს','მერკური':'გონებასა და კომუნიკაციას',
 'ვენერა':'ურთიერთობებს, სიყვარულსა და ფინანსებს','მარსი':'ენერგიასა და ინიციატივას','იუპიტერი':'რწმენასა და ზრდას','სატურნი':'მოვალეობებსა და სტრუქტურას',
 'ურანი':'თავისუფლებასა და სიახლეს','ნეპტუნი':'ოცნებებსა და სულიერებას','პლუტონი':'ღრმა ცვლილებებსა და შინაგან ძალას','AC':'სხეულსა და იმიჯს','MC':'კარიერასა და რეპუტაციას'};
const ASP=[[0,'შეერთება','☌','აძლიერებს და ააქტიურებს',0],[60,'სექსტილი','⚹','შესაძლებლობას აძლევს',1],[90,'კვადრატი','□','ძაბვასა და გამოწვევას ქმნის',-1],
 [120,'ტრინი','△','ჰარმონიულად ეხმარება',1],[180,'ოპოზიცია','☍','დაპირისპირებას და ბალანსის ძიებას იწვევს',-1]];
const ADV={'1':'გამოიყენე — დღე ამ სფეროში შენს მხარესაა.','-1':'ნუ აჩქარებ: ძაბვა ზრდის შესაძლებლობაა, თუ მშვიდად მოქმედებ.','0':'ენერგია ძლიერია — მიმართე შეგნებულად.'};
const BENEF=new Set(['ვენერა','იუპიტერი']),MALEF=new Set(['მარსი','სატურნი','პლუტონი','ურანი','ნეპტუნი']);
const TRANSIT=['მთვარე','მზე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი','პლუტონი'];
const ORB={'მზე':1.5,'მერკური':1.5,'ვენერა':1.5,'მარსი':1.5,'იუპიტერი':1.2,'სატურნი':1.2,'ურანი':1,'ნეპტუნი':1,'პლუტონი':1};
const W={'მთვარე':.6,'მზე':1,'მერკური':.8,'ვენერა':.9,'მარსი':1,'იუპიტერი':1.1,'სატურნი':1.2,'ურანი':1.2,'ნეპტუნი':1.1,'პლუტონი':1.3};
const MOON_SIGN=['ენერგიული, იმპულსური დღე — დაიწყე ახალი საქმე, ოღონდ მოთმინება ნუ დაკარგო.','მშვიდი, გრძნობიერი დღე — კომფორტი, კარგი საკვები, ფინანსები.',
 'ცნობისმოყვარე, მოძრავი დღე — საუბრები, შეხვედრები, ინფორმაცია.','ემოციური, საოჯახო დღე — სახლი, ზრუნვა, ახლობლები.',
 'თბილი, შემოქმედებითი დღე — ყურადღება, სიყვარული, თამაში.','პრაქტიკული დღე — წესრიგი, ჯანმრთელობა, დეტალები.',
 'სოციალური, ჰარმონიული დღე — ურთიერთობები, შეთანხმებები, სილამაზე.','ინტენსიური, ღრმა დღე — ვნება, ფარული საკითხები, გადაწყვეტილებები.',
 'ოპტიმისტური დღე — სწავლა, მოგზაურობა, დიდი გეგმები.','სერიოზული, მიზანმიმართული დღე — სამუშაო და პასუხისმგებლობა.',
 'თავისუფალი, უჩვეულო დღე — მეგობრები, იდეები, სიახლე.','ინტუიციური, ნაზი დღე — დასვენება, შემოქმედება, სიჩუმე.'];
const PHASE=[[0,'🌑 ახალი მთვარე','დათესე განზრახვები — ახალი დასაწყისის დრო.'],[45,'🌒 მზარდი ნამგალი','პირველი ნაბიჯები, გადაწყვეტილების განმტკიცება.'],
 [90,'🌓 პირველი მეოთხედი','მოქმედება და დაბრკოლებების გადალახვა.'],[135,'🌔 მზარდი მთვარე','დახვეწა, მომზადება შედეგისთვის.'],
 [180,'🌕 სავსე მთვარე','კულმინაცია, ემოციების პიკი, შედეგები ჩანს.'],[225,'🌖 კლებადი მთვარე','გაზიარება, მადლიერება, ანალიზი.'],
 [270,'🌗 ბოლო მეოთხედი','გაწმენდა, ზედმეტის მოშორება.'],[315,'🌘 ბოლო ნამგალი','დასვენება, დასრულება, ახალი ციკლისთვის მზადება.']];
function houseOf(lon,H){for(let i=0;i<12;i++){const a=+H[i],b=+H[(i+1)%12];if(norm(lon-a)<norm(b-a))return i+1;}return null;}
function aspOf(sep){for(const a of ASP){const o=Math.abs(sep-a[0]);if(o<=3)return{a,o};}return null;}

async function runDaily(){
  const natal=getPersonData('dp');
  if(!natal.lat||!natal.lon){showError('შეიყვანეთ დაბადების ქალაქი');return;}
  const loc=place('dq',natal);
  const [y,m,d]=($('dp-date').value||todayISO()).split('-').map(Number);
  const t0=toUTC(y,m,d,0,0,0,loc.tz_name),t1=t0+864e5,tm=t0+432e5;
  const [dN,a0,aM,a1]=await Promise.all([fetchChart(natal),fetchChart(req(t0,loc)),fetchChart(req(tm,loc)),fetchChart(req(t1,loc))]);
  const N={};for(const k of Object.keys(TP))if(dN.planets[k])N[k]=+dN.planets[k].degree;
  if(dN.asc!=null){N.AC=+dN.asc;N.MC=+dN.mc;}
  const hits=[];
  for(const tp of TRANSIT){
    const L0=+a0.planets[tp].degree,LM=+aM.planets[tp].degree,L1=+a1.planets[tp].degree;
    for(const [np,nl] of Object.entries(N)){
      if(tp==='მთვარე'){
        /* aspects that become exact during this day */
        for(const a of ASP){for(const sgn of a[0]===0||a[0]===180?[1]:[1,-1]){
          const tgt=norm(nl+sgn*a[0]),e0=wrap(L0-tgt),e1=wrap(L1-tgt);
          if(e0<=0&&e1>0&&e1-e0<30){const f=-e0/(e1-e0);hits.push({tp,np,a,orb:0,exact:t0+f*864e5});}}}
      }else{
        const sep=Math.abs(wrap(LM-nl)),r=aspOf(sep);
        if(r&&r.o<=(ORB[tp]||1)){const s0=Math.abs(Math.abs(wrap(L0-nl))-r.a[0]),s1=Math.abs(Math.abs(wrap(L1-nl))-r.a[0]);
          hits.push({tp,np,a:r.a,orb:r.o,applying:s1<s0});}
      }
    }
  }
  /* score */
  let score=0;
  for(const h of hits){let s=h.a[4];if(s===0)s=BENEF.has(h.tp)?1:MALEF.has(h.tp)?-.6:.3;
    const w=W[h.tp]*(h.tp==='მთვარე'?1:Math.max(.3,1-h.orb/(ORB[h.tp]||1)*.6))*(h.np==='მზე'||h.np==='მთვარე'||h.np==='AC'?1.2:1);score+=s*w;}
  const tone=score>1.5?['☀ ჰარმონიული დღე','#7fd09a']:score>0.3?['✦ კარგი დღე','#c9d070']:score>-0.3?['◐ ნეიტრალური დღე','#C9A24C']:score>-1.5?['⚡ აქტიური, დაძაბული დღე','#f0a060']:['⚠ რთული დღე — სიფრთხილე','#f07070'];
  const pct=Math.round(50+Math.max(-45,Math.min(45,score*15)));
  /* moon */
  const ml=+aM.planets['მთვარე'].degree,ms0=Math.floor(+a0.planets['მთვარე'].degree/30),ms1=Math.floor(+a1.planets['მთვარე'].degree/30);
  const msi=Math.floor(ml/30),mh=dN.houses?houseOf(ml,dN.houses):null;
  let ingress='';if(ms0!==ms1){const L0=+a0.planets['მთვარე'].degree,tgt=ms1*30,f=norm(tgt-L0)/norm(+a1.planets['მთვარე'].degree-L0);
    ingress=`<br><span class="sm">მთვარე ${sfx(SIGN_KA[ms1],'ში')} გადადის ≈ ${fmtLocal(t0+f*864e5,loc.tz_name).slice(11)}</span>`;}
  const el=norm(ml-(+aM.planets['მზე'].degree));const ph=[...PHASE].reverse().find(p=>el>=p[0]-22.5)||PHASE[0];
  const phase=el>=337.5?PHASE[0]:ph;
  /* wheel: natal inside, transits outside */
  const lbl=`დღიური პროგნოზი · ${pad(d)}.${pad(m)}.${y}`;
  showDoubleChart(dN,aM,'ნატალური','ტრანზიტი '+pad(d)+'.'+pad(m),lbl,calcCrossAspects({...dN.planets,...(dN._aspPlanets||{})},{...aM.planets,...(aM._aspPlanets||{})}));
  const ord=hits.sort((x,y)=>(x.exact||9e15)-(y.exact||9e15)||(W[y.tp]-W[x.tp]));
  const aspHTML=ord.length?ord.map(h=>{const col=h.a[4]>0?'#7fb2f0':h.a[4]<0?'#f07a7a':'#f0c060';
    const when=h.exact?`ზუსტი ≈ ${fmtLocal(h.exact,loc.tz_name).slice(11)}`:`ორბი ${h.orb.toFixed(1)}° · ${h.applying?'მოახლოებადი':'დაშორებადი'}`;
    return `<div class="dp-asp" style="border-color:${col}"><div class="h">${h.tp} ${h.a[2]} ${h.np==='AC'||h.np==='MC'?h.np:'ნატ. '+h.np} <span class="t">· ${h.a[1]} · ${when}</span></div>
      ${TP[h.tp]} ${h.a[3]} — ეხება ${NP[h.np]}. <span class="t">${ADV[String(h.a[4])]}</span></div>`;}).join('')
    :'<div class="sm">დღეს მნიშვნელოვანი ზუსტი ტრანზიტი არ არის — მშვიდი, „ჩვეულებრივი“ დღეა.</div>';
  card(`<h3>📅 ${lbl}</h3>
    <div class="dp-tone"><div class="sc" style="color:${tone[1]}">${pct}%</div><div><div style="font-size:17px;color:${tone[1]}">${tone[0]}</div>
      <div class="sm">${hits.length} აქტიური ტრანზიტი · ${loc.tz_name}</div></div></div>
    <div class="dp-grid">
      <div class="dp-box"><b>☽ მთვარე ${sfx(SIGN_KA[msi],'ში')}</b> — ${MOON_SIGN[msi]}${ingress}</div>
      <div class="dp-box"><b>☽ შენს ${mh||'?'}-ე სახლში</b> — ${HOUSE_TXT[mh]||''}</div>
      <div class="dp-box"><b>${phase[1]}</b> — ${phase[2]}</div>
    </div>
    <h3 style="margin-top:14px">⚡ დღის ტრანზიტები</h3>${aspHTML}
    <div class="sm" style="margin-top:10px">მთვარის ასპექტები ნაჩვენებია მხოლოდ ის, რომლებიც ამ დღეს ზუსტდება; ნელი პლანეტები — 1–1,5° ორბით. გარე წრე — ტრანზიტი შუადღისას.</div>`);
}

/* ── wire into the page ── */
function hook(){
  if(typeof generate!=='function')return;
  const orig=generate;
  window.generate=async function(){
    const m=(typeof currentMode!=='undefined')?currentMode:'';
    if(m!=='lunar'&&m!=='daily'&&m!=='solar'){hideCard();return orig.apply(this,arguments);}
    btnBusy(true);
    try{if(m==='solar')await runSolar();else if(m==='lunar')await runLunar();else await runDaily();}
    catch(e){showError('შეცდომა: '+(e&&e.message||e));}
    finally{btnBusy(false);}
  };
  if(typeof setMode==='function'){const o=setMode;window.setMode=function(m){hideCard();return o.apply(this,arguments);};}
}
function boot(){try{inject();hook();}catch(e){console.warn('returns.js',e);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window._returns={quickNext,exact,sunLon,moonLon,toUTC,parts};
})();
