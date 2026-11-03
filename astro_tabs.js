/* astro_tabs.js — astro.html add-on
   • couple tabs share ONE form: სინასტრია · კომპოზიტი · დევისონი all use the synastry
     inputs (s1-*, s2-*). After one couple chart is drawn, switching to another couple
     tab redraws it at once — no re-entering.
   • დევისონი (Davison relationship chart): a real chart for the midpoint in TIME
     (mean of the two UTC birth moments) and SPACE (great-circle midpoint of the two
     birthplaces), houses for that place.
   • ფორმულები: its own tab, uses the natal form, shows every formula of formulas.js.
   Load after chartui.js and formulas.js.                                                  */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const COUPLE=new Set(['synastry','composite','davison','compat']);
const BTN_TXT={synastry:'✦ სინასტრიის გენერაცია ✦',composite:'✦ კომპოზიტის გენერაცია ✦',davison:'✦ დევისონის გენერაცია ✦',compat:'✦ თავსებადობის ანალიზი ✦'};
const IDS={davison:'dv-tab-btn',formulas:'fx-tab-btn',compat:'cx-tab-btn'};
let lastCouple=null,natalTxt=null;
const cm=()=>(typeof currentMode!=='undefined'?currentMode:'');
const setCM=m=>{try{currentMode=m;}catch(e){}};

/* ── tabs + sections ── */
function inject(){
  const bar=document.querySelector('.tab-bar');if(!bar)return false;
  if(!$('dv-tab-btn')){
    const comp=bar.querySelector(".tab-btn[onclick*=\"'composite'\"]");
    const b=document.createElement('button');b.className='tab-btn';b.id='dv-tab-btn';b.type='button';b.textContent='დევისონი';
    b.setAttribute('onclick',"setMode('davison')");
    if(comp)comp.after(b);else bar.appendChild(b);
  }
  if(!$('cx-tab-btn')){
    const dv=$('dv-tab-btn');
    const b=document.createElement('button');b.className='tab-btn';b.id='cx-tab-btn';b.type='button';b.textContent='თავსებადობა';
    b.setAttribute('onclick',"setMode('compat')");
    if(dv)dv.after(b);else bar.appendChild(b);
  }
  if(!$('cx-sec')){
    const ca=$('chart-area');const sec=document.createElement('div');sec.id='cx-sec';sec.style.cssText='display:none;margin:18px auto;max-width:1100px;padding:0 12px';
    sec.innerHTML='<div id="cx-host"></div>';
    if(ca&&ca.parentNode)ca.parentNode.insertBefore(sec,ca);else document.body.appendChild(sec);
  }
  if(!$('fx-tab-btn')){
    const b=document.createElement('button');b.className='tab-btn';b.id='fx-tab-btn';b.type='button';b.textContent='ფორმულები';
    b.setAttribute('onclick',"setMode('formulas')");bar.appendChild(b);
  }
  if(!$('fx-sec')){
    const ca=$('chart-area');const sec=document.createElement('div');sec.id='fx-sec';sec.style.cssText='display:none;margin:18px auto;max-width:1100px;padding:0 12px';
    sec.innerHTML='<div id="fx-meta" style="text-align:center;font-family:Cinzel,serif;letter-spacing:3px;font-size:12px;color:rgba(227,190,132,.8);margin-bottom:6px"></div><div id="fx-host"></div>';
    if(ca&&ca.parentNode)ca.parentNode.insertBefore(sec,ca);else document.body.appendChild(sec);
  }
  return true;
}
function markActive(m){
  document.querySelectorAll('.tab-bar .tab-btn').forEach(b=>b.classList.remove('active'));
  const b=IDS[m]?$(IDS[m]):document.querySelector(`.tab-bar .tab-btn[onclick*="'${m}'"]`);
  if(b)b.classList.add('active');
}
function genBtn(sel){return document.querySelector(sel+' .gen-btn');}
function relabel(m){
  const sb=genBtn('#form-synastry');if(sb&&BTN_TXT[m])sb.textContent=BTN_TXT[m];
  const nb=genBtn('#form-natal');if(nb){if(natalTxt==null)natalTxt=nb.textContent;nb.textContent=m==='formulas'?'✦ ფორმულების გამოთვლა ✦':natalTxt;}
}
const showFx=on=>{const s=$('fx-sec');if(s)s.style.display=on?'block':'none';if(!on)showCx(false);};
const showCx=on=>{const s=$('cx-sec');if(s)s.style.display=on?'block':'none';};
const coupleReady=()=>['s1-lat','s1-lon','s2-lat','s2-lon'].every(id=>$(id)&&+$(id).value);

/* the composite branch of generate() reads c1-* / c2-* — fill them from the shared form */
function copySC(){
  for(const [a,b] of [['s1','c1'],['s2','c2']]){
    for(const k of ['day','month','year','hour','minute','second','lat','lon','tz','city']){const x=$(a+'-'+k),y=$(b+'-'+k);if(x&&y)y.value=x.value;}
    const td=$(a+'-tz-display'),tc=$(b+'-tz-display');if(td&&tc)tc.textContent=td.textContent;
  }
}

/* ── Davison ── */
function tzOffMin(tz,ms){try{const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const p={};f.formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);const u=new Date(0);u.setUTCFullYear(+p.year,+p.month-1,+p.day);u.setUTCHours(+p.hour%24,+p.minute,+p.second,0);return (u.getTime()-ms)/60000;}catch(e){return 0;}}
function utcMs(q){const g=new Date(0);g.setUTCFullYear(q.year,q.month-1,q.day);g.setUTCHours(q.hour,q.minute,q.second||0,0);const G=g.getTime(),tz=q.tz_name||'UTC';
  let t=G-tzOffMin(tz,G)*60000;t=G-tzOffMin(tz,t)*60000;return t;}
function geoMid(a,b){const r=Math.PI/180,la1=a.lat*r,lo1=a.lon*r,la2=b.lat*r,lo2=b.lon*r;
  const x=(Math.cos(la1)*Math.cos(lo1)+Math.cos(la2)*Math.cos(lo2))/2,y=(Math.cos(la1)*Math.sin(lo1)+Math.cos(la2)*Math.sin(lo2))/2,z=(Math.sin(la1)+Math.sin(la2))/2;
  return {lat:Math.atan2(z,Math.hypot(x,y))/r,lon:Math.atan2(y,x)/r};}
async function runDavison(){
  const p1=getPersonData('s1'),p2=getPersonData('s2');
  if(!p1.lat||!p1.lon||!p2.lat||!p2.lon){showError('შეიყვანეთ ორივე ქალაქი');return;}
  const t=new Date((utcMs(p1)+utcMs(p2))/2),g=geoMid(p1,p2);
  const q={year:t.getUTCFullYear(),month:t.getUTCMonth()+1,day:t.getUTCDate(),hour:t.getUTCHours(),minute:t.getUTCMinutes(),second:t.getUTCSeconds(),
    lat:Math.round(g.lat*10000)/10000,lon:Math.round(g.lon*10000)/10000,tz_name:'UTC',time_unknown:false};
  const d=await fetchChart(q);d._timeUnknown=false;
  const pad=n=>String(n).padStart(2,'0');
  const n1=($('s1-name')&&$('s1-name').value)||'პირველი',n2=($('s2-name')&&$('s2-name').value)||'მეორე';
  showSingleChart(d,`დევისონი · ${n1} & ${n2} · ${q.year}-${pad(q.month)}-${pad(q.day)} ${pad(q.hour)}:${pad(q.minute)} UTC · ${q.lat.toFixed(2)}°, ${q.lon.toFixed(2)}°`,false);
}

/* ── textual compatibility ── */
async function runCompat(){
  const p1=getPersonData('s1'),p2=getPersonData('s2');
  if(!p1.lat||!p1.lon||!p2.lat||!p2.lon){showError('შეიყვანეთ ორივე ქალაქი');return;}
  if(!window._synText){showError('თავსებადობის მოდული ვერ ჩაიტვირთა');return;}
  const [d1,d2]=await Promise.all([fetchChart(p1),fetchChart(p2)]);
  const ca=$('chart-area'),acg=$('acg-section');if(ca)ca.style.display='none';if(acg)acg.style.display='none';
  const fx=$('fx-sec');if(fx)fx.style.display='none';
  const n1=($('s1-name')&&$('s1-name').value)||'პირველი',n2=($('s2-name')&&$('s2-name').value)||'მეორე';
  showCx(true);window._synText.render(d1,d2,n1,n2,$('cx-host'));
  const s=$('cx-sec');if(s)s.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ── Formulas tab ── */
async function runFormulas(){
  const p=getPersonData('n');
  if(!p.lat||!p.lon){showError('შეიყვანეთ ქალაქი');return;}
  if(!window._formulas||!window._formulas.render){showError('ფორმულები ვერ ჩაიტვირთა');return;}
  const d=await fetchChart(p);d._timeUnknown=p.time_unknown;
  const ca=$('chart-area'),acg=$('acg-section');if(ca)ca.style.display='none';if(acg)acg.style.display='none';
  const name=($('n-name')&&$('n-name').value)||'';
  $('fx-meta').textContent='🧭 ასტროლოგიური ფორმულები'+(name?' · '+name:'');
  showFx(true);window._formulas.render(d);
  const s=$('fx-sec');if(s)s.scrollIntoView({behavior:'smooth',block:'start'});
}
async function busy(fn){
  const b=document.querySelector('.form-section.active .gen-btn');const t=b?b.textContent:'';
  if(b){b.disabled=true;b.textContent='⏳ იტვირთება...';}
  try{await Promise.all(Object.values(window._geoPending||{}));await fn();}
  catch(e){showError(e&&e.message||String(e));console.error(e);}
  finally{if(b){b.disabled=false;b.textContent=t;}}
}

/* ── wrap setMode / generate (outermost, after the other add-ons) ── */
function hook(){
  if(typeof window.setMode!=='function'||window.setMode._at)return;
  const oS=window.setMode;
  const S=function(m){
    if(m==='composite'||m==='davison'||m==='compat'){
      oS.call(this,'synastry');setCM(m);markActive(m);relabel(m);showFx(false);
      if(lastCouple&&lastCouple!==m&&coupleReady())setTimeout(()=>window.generate(),0);
      return;
    }
    if(m==='formulas'){oS.call(this,'natal');setCM('formulas');markActive('formulas');relabel('formulas');return;}
    showFx(false);
    const r=oS.apply(this,arguments);relabel(m);
    if(m==='synastry'){markActive('synastry');if(lastCouple&&lastCouple!=='synastry'&&coupleReady())setTimeout(()=>window.generate(),0);}
    return r;
  };
  S._at=true;window.setMode=S;
  const oG=window.generate;
  window.generate=async function(){
    const m=cm();
    if(m==='davison'){lastCouple=m;return busy(runDavison);}
    if(m==='compat'){lastCouple=m;return busy(runCompat);}
    if(m==='formulas')return busy(runFormulas);
    showFx(false);
    if(m==='composite')copySC();
    if(COUPLE.has(m))lastCouple=m;
    try{return await oG.apply(this,arguments);}finally{relabel(cm());}
  };
}
function boot(){try{inject();hook();}catch(e){console.warn('astro_tabs',e);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));else setTimeout(boot,0);
window.addEventListener('load',()=>setTimeout(()=>{inject();hook();},0));
})();
