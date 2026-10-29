/* pointvariants.js — Mean / True Lilith, Mean / True lunar Nodes, Selena on/off for astro.html.
   The backend returns the MEAN Node (swe.MEAN_NODE), MEAN Lilith (swe.MEAN_APOG) and Selena (body 56).
   The TRUE values are the osculating lunar orbit (what Swiss Ephemeris calls TRUE_NODE / OSCU_APOG):
   the Moon's geocentric position and velocity (astronomy-engine, loaded on demand) give the orbit's
   angular-momentum vector (→ node) and eccentricity vector (→ apogee = true Black Moon Lilith).
   Checked against Swiss Ephemeris: node ±0.01°, true Lilith ±0.2°.
   Both checked → the mean point keeps its name and the true one is added as „ჭ. …“.
   Selena (the White Moon) is a purely mean, uniformly moving point — it has no "true" variant.    */
(function(){
'use strict';
const KEY='magnus_pointvariants';
const PV={lm:true,lt:false,nm:true,nt:false,sm:true};
try{Object.assign(PV,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(PV));}catch(e){}};
const TN={lil:'ჭ. ლილიტი',nn:'ჭ. ჩრდ. კვანძი',sn:'ჭ. სამხ. კვანძი'};
if(typeof PI!=='undefined'){PI[TN.lil]={sym:'⚸',color:'#d0508a'};PI[TN.nn]={sym:'☊',color:'#3fd08a'};PI[TN.sn]={sym:'☋',color:'#e07a7a'};}
if(typeof ORB_TIER!=='undefined'){ORB_TIER[TN.lil]='virtual';ORB_TIER[TN.nn]='virtual';ORB_TIER[TN.sn]='virtual';}
if(typeof PORDER!=='undefined'){const i=PORDER.indexOf('სამხ. კვანძი');if(i>=0&&!PORDER.includes(TN.nn))PORDER.splice(i+1,0,TN.nn,TN.sn);const j=PORDER.indexOf('ლილიტი');if(j>=0&&!PORDER.includes(TN.lil))PORDER.splice(j+1,0,TN.lil);}

let AE=null;
function loadAE(){if(window.Astronomy)return Promise.resolve(window.Astronomy);if(AE)return AE;
  AE=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';s.onload=()=>window.Astronomy?res(window.Astronomy):rej(new Error('astronomy-engine'));s.onerror=()=>{AE=null;rej(new Error('astronomy-engine load failed'));};document.head.appendChild(s);});return AE;}
/* local wall-clock time in an IANA zone → UTC Date */
function tzOff(tz,ms){try{const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const p={};f.formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);const u=new Date(0);u.setUTCFullYear(+p.year,+p.month-1,+p.day);u.setUTCHours(+p.hour%24,+p.minute,+p.second,0);return (u.getTime()-ms)/60000;}catch(e){return 0;}}
function toUTC(q){const g=new Date(0);g.setUTCFullYear(+q.year,(+q.month||1)-1,+q.day||1);g.setUTCHours(+q.hour||0,+q.minute||0,+q.second||0,0);const tz=q.tz_name||'UTC',G=g.getTime();
  let t=G-tzOff(tz,G)*60000;const o2=tzOff(tz,t);t=G-o2*60000;return new Date(t);}
const MU=403503.2335*86400*86400/Math.pow(149597870.7,3);   /* G(M⊕+M☾) in AU³/day² */
function osc(A,date){const t=A.MakeTime(date),dt=0.02,rot=A.Rotation_EQJ_ECT(t),R=v=>A.RotateVector(rot,v);
  const r=R(A.GeoMoon(t)),a=R(A.GeoMoon(t.AddDays(-dt))),b=R(A.GeoMoon(t.AddDays(dt))),v={x:(b.x-a.x)/(2*dt),y:(b.y-a.y)/(2*dt),z:(b.z-a.z)/(2*dt)};
  const h={x:r.y*v.z-r.z*v.y,y:r.z*v.x-r.x*v.z,z:r.x*v.y-r.y*v.x},rl=Math.hypot(r.x,r.y,r.z);
  const vh={x:v.y*h.z-v.z*h.y,y:v.z*h.x-v.x*h.z,z:v.x*h.y-v.y*h.x},e={x:vh.x/MU-r.x/rl,y:vh.y/MU-r.y/rl,z:vh.z/MU-r.z/rl};
  const n360=x=>((x%360)+360)%360;return {node:n360(Math.atan2(h.x,-h.y)*180/Math.PI),apo:n360(Math.atan2(-e.y,-e.x)*180/Math.PI)};}
function truePoints(A,date){const c=osc(A,date),p=osc(A,new Date(date.getTime()-43200000)),q=osc(A,new Date(date.getTime()+43200000)),dd=(x,y)=>((y-x+540)%360)-180;
  return {node:c.node,apo:c.apo,nodeRetro:dd(p.node,q.node)<0,apoRetro:dd(p.apo,q.apo)<0};}
const SG=()=>(typeof SIGN_KA!=='undefined'&&SIGN_KA)||['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
function setPt(P,name,deg,retro){const d=((deg%360)+360)%360,sd=Math.floor(d%30);P[name]={degree:Math.round(d*10000)/10000,sign:SG()[Math.floor(d/30)%12],sign_degree:sd,centesimal:Math.round((d%30-sd)*100),retrograde:!!retro,_true:true};}
async function apply(d,req){if(!d||!d.planets||!req)return d;const P=d.planets,draco=typeof currentMode!=='undefined'&&currentMode==='draconic';
  let T=null;if(PV.lt||PV.nt){try{T=truePoints(await loadAE(),toUTC(req));}catch(e){console.warn('true Node/Lilith:',e);}}
  if(P['ლილიტი']){if(T&&PV.lt){if(PV.lm)setPt(P,TN.lil,T.apo,T.apoRetro);else setPt(P,'ლილიტი',T.apo,T.apoRetro);}else if(!PV.lm)delete P['ლილიტი'];}
  if(P['ჩრდ. კვანძი']){if(T&&PV.nt){if(PV.nm||draco){setPt(P,TN.nn,T.node,T.nodeRetro);setPt(P,TN.sn,T.node+180,T.nodeRetro);}else{setPt(P,'ჩრდ. კვანძი',T.node,T.nodeRetro);setPt(P,'სამხ. კვანძი',T.node+180,T.nodeRetro);}}
    else if(!PV.nm&&!draco){delete P['ჩრდ. კვანძი'];delete P['სამხ. კვანძი'];}}
  if(!PV.sm)delete P['თეთრი მთვარე'];
  if(Array.isArray(d.aspects))d.aspects=d.aspects.filter(a=>P[a.p1]&&P[a.p2]&&!P[a.p1]._true&&!P[a.p2]._true);
  d._pv={...PV};return d;}
/* wrap fetchChart: every chart (natal, synastry, transit, progression…) goes through it */
function hook(){const f=window.fetchChart;if(typeof f!=='function'||f.__pv)return false;const w=async function(data){const d=await f.apply(this,arguments);return apply(d,data);};w.__pv=1;window.fetchChart=w;return true;}
hook();window.addEventListener('load',()=>setTimeout(hook,0));

/* UI — a row in the aspect-filter panel; changing it regenerates the current chart */
function ui(){const host=document.getElementById('asp-filters');if(!host||document.getElementById('pv-row'))return;
  const row=document.createElement('div');row.id='pv-row';row.style.cssText='display:flex;gap:18px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid rgba(45,31,110,.5);width:100%';
  const cb=(k,l,tip,dis)=>`<label title="${tip}" style="display:flex;align-items:center;gap:6px;cursor:${dis?'not-allowed':'pointer'};opacity:${dis?0.45:1}"><input type="checkbox" data-pv="${k}"${PV[k]&&!dis?' checked':''}${dis?' disabled':''} style="accent-color:#7c3aed;width:14px;height:14px"><span style="font-size:11px;color:rgba(200,170,255,.9)">${l}</span></label>`;
  row.innerHTML=`<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(167,139,250,.5);width:100%">ფიქტიური წერტილები — საშუალო / ჭეშმარიტი</div>
   <div style="display:flex;gap:10px;align-items:center">⚸ ${cb('lm','საშუალო ლილიტი','Mean Black Moon — მთვარის ორბიტის საშუალო აპოგეუმი (თანაბარი მოძრაობა, ~9 წლიანი ციკლი)')}${cb('lt','ჭეშმარიტი ლილიტი','True / Osculating Lilith — მთვარის ორბიტის მყისიერი (ოსკულაციური) აპოგეუმი; საშუალოს ±30°-ით შორდება')}</div>
   <div style="display:flex;gap:10px;align-items:center">☊ ${cb('nm','საშუალო კვანძები','Mean Node — თანაბრად, ყოველთვის რეტროგრადულად მოძრავი კვანძი (18,6 წლიანი ციკლი)')}${cb('nt','ჭეშმარიტი კვანძები','True Node — მთვარის ორბიტის მყისიერი კვანძი; საშუალოს ±1,7°-ით რხევა, ზოგჯერ პირდაპირი მოძრაობით')}</div>
   <div style="display:flex;gap:10px;align-items:center">⚪ ${cb('sm','სელენა (თეთრი მთვარე)','White Moon Selena — ფიქტიური წერტილი 7 წლიანი თანაბარი ციკლით')}${cb('st','ჭეშმ. სელენა','სელენას „ჭეშმარიტი“ ვარიანტი ასტრონომიულად არ არსებობს: ის მხოლოდ საშუალო, თანაბრად მოძრავი წერტილია',true)}</div>
   <a href="article.html?s=astro&k=about:points&h=${encodeURIComponent('საშუალო და ჭეშმარიტი წერტილები')}&t=${encodeURIComponent('საშუალო და ჭეშმარიტი წერტილები')}" target="_blank" rel="noopener" style="font-size:11px;color:#c9a84c;align-self:center">ⓘ რას ნიშნავს?</a>`;
  host.appendChild(row);
  row.addEventListener('change',e=>{const t=e.target;if(!t.dataset.pv)return;PV[t.dataset.pv]=t.checked;save();
    if(window._lastChartReq&&typeof generate==='function'){try{generate();}catch(err){console.warn(err);}}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui);else ui();
window.POINT_VARIANTS={PV,apply,truePoints,toUTC,loadAE};
})();
