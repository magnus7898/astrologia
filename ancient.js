/* ancient.js — historical dates in every astrology tab (MAGNUS astro.html).
   Convention for all year fields: negative = BC (−356 = 356 BC, there is no year 0);
   dates before 15.10.1582 are Julian-calendar dates; the clock before 1850 is the
   local mean time of the selected time zone (the same rule the backend already
   applies through pytz for 1583–1850).
   Every POST to the backend is intercepted: a date before 15.10.1582 is converted
   to UT, proleptic Gregorian, astronomical year (what Swiss Ephemeris expects)
   and sent with tz_name 'UTC'. Payloads carrying _raw:true are passed unchanged.
   Exposes window._anc for chartpanels.js / returns.js / progressions.            */
(function(){
'use strict';
const GREG0=15821015;
const isHistYMD=(y,m,d)=>(+y)*10000+(+m)*100+(+d)<GREG0;
const yAstro=y=>y<0?y+1:y;                 /* −356 → −355 */
const yHist=y=>y<=0?y-1:y;                 /* −355 → −356 */
function cal2jd(y,m,d,greg){if(m<=2){y--;m+=12;}const A=Math.floor(y/100),B=greg?2-A+Math.floor(A/4):0;
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;}
function jd2cal(jd,forceGreg){const Z=Math.floor(jd+0.5),F=jd+0.5-Z;let A=Z;
  if(forceGreg||Z>=2299161){const al=Math.floor((Z-1867216.25)/36524.25);A=Z+1+al-Math.floor(al/4);}
  const B=A+1524,C=Math.floor((B-122.1)/365.25),D=Math.floor(365.25*C),E=Math.floor((B-D)/30.6001);
  const m=E<14?E-1:E-13,y=m>2?C-4716:C-4715;let sec=Math.round((B-D-Math.floor(30.6001*E)+F)*86400);
  const d=Math.floor(sec/86400);sec-=d*86400;
  return{y,m,d,h:Math.floor(sec/3600),mi:Math.floor(sec%3600/60),s:sec%60};}
const offCache={};
function zoneOff(tz){        /* minutes; local mean time of the zone (Intl, 1850) */
  tz=tz||'UTC';if(tz in offCache)return offCache[tz];let o=0;
  try{const ms=Date.UTC(1850,0,1),p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'})
    .formatToParts(new Date(ms)).forEach(x=>{if(x.type!=='literal')p[x.type]=+x.value;});
    o=(Date.UTC(p.year,p.month-1,p.day,p.hour%24,p.minute,p.second)-ms)/60000;}catch(e){}
  return offCache[tz]=o;}
/* historical local wall time → UT Julian day */
function localToJD(y,m,d,h,mi,s,tz){
  return cal2jd(yAstro(+y),+m,+d,!isHistYMD(y,m,d))+((+h||0)+(+mi||0)/60+(+s||0)/3600)/24-zoneOff(tz)/1440;}
/* UT Julian day → historical local wall time (Julian calendar before 1582) */
function jdToLocal(jd,tz){const c=jd2cal(jd+zoneOff(tz)/1440);
  return{year:yHist(c.y),month:c.m,day:c.d,hour:c.h,minute:c.mi,second:c.s};}
const isHist=q=>q&&isFinite(+q.year)&&isFinite(+q.month)&&isFinite(+q.day)&&isHistYMD(q.year,q.month,q.day);
const utJD=q=>localToJD(q.year,q.month,q.day,q.hour??12,q.minute??0,q.second??0,q.tz_name);
/* one request object → backend form */
function toBackend(q){
  if(q.hasOwnProperty('hour')||q.hasOwnProperty('tz_name')){
    const g=jd2cal(utJD(q),true);
    return Object.assign({},q,{year:g.y,month:g.m,day:g.d,hour:g.h,minute:g.mi,second:g.s,tz_name:'UTC'});}
  const g=jd2cal(cal2jd(yAstro(+q.year),+q.month,+q.day,false),true);   /* date only */
  return Object.assign({},q,{year:g.y,month:g.m,day:g.d});}
function walk(o){
  if(Array.isArray(o))return o.map(walk);
  if(!o||typeof o!=='object')return o;
  if('year' in o&&'month' in o&&'day' in o&&isHist(o))o=toBackend(o);
  const r={};for(const k in o)r[k]=(o[k]&&typeof o[k]==='object')?walk(o[k]):o[k];return r;}
/* backend → page: astronomical years (0 = 1 BC) → historical (−1 = 1 BC) */
function fixAstroYears(o){
  if(Array.isArray(o))return o.map(fixAstroYears);
  if(!o||typeof o!=='object')return o;
  const r={};for(const k in o)r[k]=fixAstroYears(o[k]);
  if(typeof r.year==='number'&&'month' in r&&'day' in r&&r.year<=0){
    const h=r.year-1;if(typeof r.label==='string')r.label=r.label.replace(new RegExp(String(r.year)+'$'),(-h)+' ძვ.წ.');r.year=h;}
  return r;}
/* trutine candidates come back in UT / Gregorian → local historical time of the form's zone */
function fixTrutine(d,tz){
  const p2=n=>String(n).padStart(2,'0');
  (d.candidates||[]).forEach(c=>{if(!isFinite(+c.year))return;
    const L=jdToLocal(cal2jd(+c.year,+c.month,+c.day,true)+((+c.hour||0)+(+c.minute||0)/60+(+c.second||0)/3600)/24,tz);
    Object.assign(c,L);c.time=`${p2(L.hour)}:${p2(L.minute)}:${p2(L.second)}`;c.date=`${p2(L.day)}.${p2(L.month)}.${L.year<0?(-L.year)+' ძვ.წ.':L.year}`;
    const e=c.epoch,m=e&&String(e.date||'').match(/^(\d+)\.(\d+)\.(-?\d+)$/),t=e&&String(e.time||'').match(/^(\d+):(\d+)/);
    if(m&&t){const E=jdToLocal(cal2jd(+m[3],+m[2],+m[1],true)+(+t[1]+t[2]/60)/24,tz);
      e.date=`${p2(E.day)}.${p2(E.month)}.${E.year<0?(-E.year)+' ძვ.წ.':E.year}`;e.time=`${p2(E.hour)}:${p2(E.minute)}`;}});
  return d;}
/* fetch interceptor */
const F=window.fetch.bind(window);
window.fetch=function(url,opt){
  try{
    const u=typeof url==='string'?url:(url&&url.url)||'';
    const back=typeof BACKEND!=='undefined'&&u.indexOf(BACKEND)===0;
    /* trutine (rectification): the server cannot handle years ≤ 0 */
    if(back&&u.indexOf('/api/trutine')>0&&opt&&typeof opt.body==='string'){try{const b=JSON.parse(opt.body);
      if(isHist(b)&&yAstro(+b.year)<=0)return Promise.resolve(new Response(JSON.stringify({error:'რექტიფიკაცია (ტრუტინა) ძვ.წ. თარიღებზე სერვერზე ვერ მუშაობს — ახ.წ. 1 წლიდან მუშაობს.'}),{status:200,headers:{'Content-Type':'application/json'}}));}catch(e){}}
    /* /api/moon (tithi badge) — historical dates answered locally from the search ephemeris */
    const mm=back&&u.indexOf('/api/moon?')>0&&decodeURIComponent(u).match(/date=(-?\d+)-(\d+)-(\d+)&time=(\d+):(\d+)&timezone=([^&]*)/);
    if(mm&&isHistYMD(+mm[1],+mm[2],+mm[3])&&window._search){
      const jd=localToJD(+mm[1],+mm[2],+mm[3],+mm[4],+mm[5],0,mm[6]),L=window._search.lon;
      const el=((L('moon',jd)-L('sun',jd))%360+360)%360;
      const body={tithi:Math.floor(el/12)+1,tithi_pct:Math.round((el%12)/12*1000)/10,elongation:Math.round(el*100)/100,local:true};
      return Promise.resolve(new Response(JSON.stringify(body),{status:200,headers:{'Content-Type':'application/json'}}));
    }
    if(back&&opt&&typeof opt.body==='string'&&(opt.method||'').toUpperCase()==='POST'){
      const b=JSON.parse(opt.body);
      if(b&&typeof b==='object'){
        let nb;if(b._raw){nb=Object.assign({},b);delete nb._raw;}else nb=walk(b);
        opt=Object.assign({},opt,{body:JSON.stringify(nb)});
        /* responses that carry dates back into the forms */
        const fix=u.indexOf('/api/pastlife')>0?fixAstroYears:(u.indexOf('/api/trutine')>0&&!b._raw&&isHist(b))?(d=>fixTrutine(d,b.tz_name)):null;
        if(fix)return F(url,opt).then(r=>r.clone().json().then(d=>new Response(JSON.stringify(fix(d)),{status:r.status,headers:{'Content-Type':'application/json'}})).catch(()=>r));}
    }
  }catch(e){}
  return F(url,opt);
};
/* hint on every year field */
function hint(){document.querySelectorAll('input[id$="-year"]').forEach(i=>{
  if(!i.title)i.title='ძვ.წ. — მინუსით: −356 = ძვ.წ. 356 · 1582 წლამდე — იულიუსის კალენდარი';
  i.removeAttribute('min');});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hint);else hint();
window._anc={isHist,isHistYMD,cal2jd,jd2cal,localToJD,jdToLocal,utJD,toBackend,zoneOff,yAstro,yHist};
})();
