/* skycal_engine.js — „ცის კალენდარი“ calculations (skycal.html; node tests pass the
   astronomy-engine module to SKY.init).
   Geocentric, tropical, apparent ecliptic longitude of date (Astronomy Engine 2.1.19 — the
   engine stats.html uses; arc-second accuracy), times in UT Julian days.
     • voc(jd0, days, {outer})      — void-of-course Moon: from the Moon's last exact Ptolemaic
                                       aspect (☌ ⚹ □ △ ☍) in a sign until it enters the next sign
     • planetVoc(jd0, days, {outer}) — the same for ☉ ☿ ♀ ♂ ♃ ♄ (aspects to the other planets)
     • retro(jd0, years)            — every retrograde of ☿–♇ starting before jd0+years and still
                                       running after jd0: stations, degrees, shadow, sky events      */
(function(root){
'use strict';
const SKY={};
let A=null;
const AE_URL='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
SKY.init=function(lib){
  if(lib){A=lib;return Promise.resolve(A);}
  if(A)return Promise.resolve(A);
  if(root.Astronomy){A=root.Astronomy;return Promise.resolve(A);}
  return new Promise((ok,no)=>{const s=document.createElement('script');s.src=AE_URL;
    s.onload=()=>{A=root.Astronomy;ok(A);};s.onerror=()=>no(new Error('ასტრონომიული ბიბლიოთეკა ვერ ჩაიტვირთა'));document.head.appendChild(s);});
};
const J2000=2451545;
const nrm=x=>((x%360)+360)%360,w180=x=>((x%360)+540)%360-180;
const aT=jd=>A.MakeTime(jd-J2000);
const PL=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
SKY.PL=PL;
const cache=new Map();
function lon(b,jd){
  const k=b+jd;let v=cache.get(k);if(v!==undefined)return v;
  v=A.Ecliptic(A.GeoVector(b,aT(jd),true)).elon;
  if(cache.size>400000)cache.clear();cache.set(k,v);return v;
}
SKY.lon=lon;
const speed=(b,jd)=>w180(lon(b,jd+0.01)-lon(b,jd-0.01))/0.02;   /* °/day */
SKY.speed=speed;
/* bisection on a boolean that flips once inside [a,b] */
function flip(f,a,b,fa,tol){tol=tol||1e-5;while(b-a>tol){const m=(a+b)/2;if(f(m)===fa)a=m;else b=m;}return (a+b)/2;}
/* root of a continuous f with f(a)<0<f(b) (or reverse) */
function zero(f,a,b,tol){tol=tol||1e-5;let fa=f(a);for(let i=0;i<80&&b-a>tol;i++){const m=(a+b)/2,fm=f(m);if((fm<0)===(fa<0)){a=m;fa=fm;}else b=m;}return (a+b)/2;}
const ASP=[[0,'☌','შეერთება'],[60,'⚹','სექსტილი'],[90,'□','კვადრატი'],[120,'△','ტრინი'],[180,'☍','ოპოზიცია']];
const ANG=[0,60,-60,90,-90,120,-120,180];
SKY.ASP=ASP;
/* exact aspects between bodies a and b inside [t0,t1]: sampled every `step` days, each crossing refined */
function aspects(a,b,t0,t1,step){
  const out=[],d=t=>w180(lon(a,t)-lon(b,t));
  let tp=t0,dp=d(t0);
  for(let t=t0+step;tp<t1;t+=step){
    t=Math.min(t,t1);const dc=d(t);
    for(const g of ANG){const f0=w180(dp-g),f1=w180(dc-g);
      if(Math.abs(f0-f1)<90&&((f0<0&&f1>=0)||(f0>0&&f1<=0)||f0===0)){
        const r=f0===0?tp:zero(x=>w180(d(x)-g),tp,t);out.push({jd:r,a,b,ang:Math.abs(g)});}}
    tp=t;dp=dc;if(t>=t1)break;
  }
  return out;
}
SKY.aspects=aspects;
/* sign changes of body b in [t0,t1] */
function ingresses(b,t0,t1,step){
  const out=[];let tp=t0,sp=Math.floor(lon(b,t0)/30);
  for(let t=t0+step;tp<t1;t+=step){t=Math.min(t,t1);const s=Math.floor(lon(b,t)/30);
    if(s!==sp){const r=flip(x=>Math.floor(lon(b,x)/30)===sp,tp,t,true);out.push({jd:r,b,from:sp,to:s});}
    tp=t;sp=s;if(t>=t1)break;}
  return out;
}
SKY.ingresses=ingresses;

/* ── void of course Moon ── */
SKY.voc=function(jd0,days,o){
  o=o||{};const PLS=o.outer===false?['Sun','Mercury','Venus','Mars','Jupiter','Saturn']:['Sun','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const ing=ingresses('Moon',jd0-3.5,jd0+days+3.5,0.25),out=[];
  for(let k=1;k<ing.length;k++){
    const a=ing[k-1].jd,b=ing[k].jd;let last=null;
    for(const p of PLS)for(const x of aspects('Moon',p,a,b,0.125))if(x.jd<b&&(!last||x.jd>last.jd))last=x;
    const s=last?last.jd:a;
    if(b<jd0||s>jd0+days)continue;
    out.push({start:s,end:b,last,sign:ing[k].from,next:ing[k].to,ing:a});
  }
  return out;
};
/* ── void of course planets (☉–♄): last exact aspect to another planet before leaving the sign ── */
SKY.planetVoc=function(jd0,days,o){
  o=o||{};const ALL=o.outer===false?['Sun','Mercury','Venus','Mars','Jupiter','Saturn']:['Sun','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const out=[];
  for(const P of ['Sun','Mercury','Venus','Mars','Jupiter','Saturn']){
    const step=P==='Sun'?2:1,ahead=ingresses(P,jd0,jd0+days+1100,step).slice(0,3);
    const back=ingresses(P,jd0-1100,jd0,step);let prev=back.length?back[back.length-1].jd:jd0-1100;
    for(const ig of ahead){
      let last=null;
      for(const Q of ALL)if(Q!==P)for(const x of aspects(P,Q,prev,ig.jd,1))if(x.jd<ig.jd&&(!last||x.jd>last.jd))last=x;
      const s=last?last.jd:prev;
      if(s<=jd0+days&&ig.jd>=jd0)out.push({P,start:s,end:ig.jd,last,sign:ig.from,next:ig.to,rx:speed(P,ig.jd)<0});
      prev=ig.jd;if(ig.jd>jd0+days)break;
    }
  }
  return out.sort((x,y)=>x.start-y.start);
};

/* ── retrogrades ── */
const RXB=['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
SKY.RXB=RXB;
function stations(b,t0,t1){
  const out=[];let tp=t0,vp=speed(b,t0)<0;
  for(let t=t0+1;tp<t1;t+=1){t=Math.min(t,t1);const v=speed(b,t)<0;
    if(v!==vp){const r=flip(x=>speed(b,x)<0,tp,t,vp,1e-4);out.push({jd:r,b,rx:v,lon:lon(b,r)});}
    tp=t;vp=v;if(t>=t1)break;}
  return out;
}
SKY.stations=stations;
/* when (before t / after t) the body is at longitude L while moving direct */
function reach(b,L,t,dir){
  let tp=t,fp=w180(lon(b,t)-L);
  for(let k=0;k<1200;k++){const tn=tp+dir,fn=w180(lon(b,tn)-L);
    if((fp<0)!==(fn<0)&&Math.abs(fp-fn)<90)return zero(x=>w180(lon(b,x)-L),Math.min(tp,tn),Math.max(tp,tn),1e-4);
    tp=tn;fp=fn;}
  return null;
}
SKY.retro=function(jd0,years,prog){
  const jd1=jd0+years*365.25,S={},periods=[];
  /* stations of every planet from a year before (to catch running retrogrades) */
  for(const b of RXB){S[b]=stations(b,jd0-400,jd1+30);if(prog)prog(b);}
  for(const b of RXB){const st=S[b];
    for(let i=0;i<st.length;i++){if(!st[i].rx)continue;const sr=st[i],sd=st.slice(i+1).find(x=>!x.rx);if(!sd)continue;
      if(sd.jd<jd0||sr.jd>jd1)continue;
      const pre=reach(b,sd.lon,sr.jd,-1),post=reach(b,sr.lon,sd.jd,1);
      periods.push({b,sr:sr.jd,sd:sd.jd,lsr:sr.lon,lsd:sd.lon,pre,post});}}
  periods.sort((x,y)=>x.sr-y.sr);
  SKY._st=S;return periods;
};
/* sky events while one retrograde runs — computed when its row is opened */
SKY.events=function(p,all){
  const ev=[],a=p.sr,b=p.sd,slow=['Jupiter','Saturn','Uranus','Neptune','Pluto'];
  /* other retrogrades at the same time */
  for(const q of all)if(q!==p&&q.sr<b&&q.sd>a)ev.push({jd:Math.max(q.sr,a),k:'overlap',q});
  /* stations of the others inside */
  for(const k in SKY._st)if(k!==p.b)for(const s of SKY._st[k])if(s.jd>a&&s.jd<b)ev.push({jd:s.jd,k:'station',s});
  /* the retrograde planet's exact aspects */
  for(const Q of PL)if(Q!==p.b&&Q!=='Moon')for(const x of aspects(p.b,Q,a,b,Q==='Sun'||Q==='Mercury'||Q==='Venus'?0.5:1))ev.push({jd:x.jd,k:'asp',x});
  /* exact aspects between slow planets */
  for(let i=0;i<slow.length;i++)for(let j=i+1;j<slow.length;j++){const P=slow[i],Q=slow[j];if(P===p.b||Q===p.b)continue;
    for(const x of aspects(P,Q,a,b,2))ev.push({jd:x.jd,k:'asp',x});}
  /* its own sign changes and the slow planets' */
  for(const B of [p.b,...slow.filter(x=>x!==p.b)])for(const x of ingresses(B,a,b,B==='Mercury'||B==='Venus'?0.5:1))ev.push({jd:x.jd,k:'ing',x});
  /* eclipses */
  let t=aT(a-1);
  for(let k=0;k<6;k++){const e=A.SearchGlobalSolarEclipse(t);const j=e.peak.ut+J2000;if(j>b)break;if(j>=a)ev.push({jd:j,k:'ecl',solar:1,kind:e.kind,lon:lon('Sun',j)});t=A.MakeTime(e.peak.ut+20);}
  t=aT(a-1);
  for(let k=0;k<6;k++){const e=A.SearchLunarEclipse(t);const j=e.peak.ut+J2000;if(j>b)break;if(j>=a)ev.push({jd:j,k:'ecl',solar:0,kind:e.kind,lon:lon('Moon',j)});t=A.MakeTime(e.peak.ut+20);}
  /* new and full Moons (for the inner planets' short retrogrades) */
  if(b-a<100)for(const ph of [0,180]){let s=aT(a);for(let k=0;k<6;k++){const r=A.SearchMoonPhase(ph,s,40);if(!r)break;const j=r.ut+J2000;if(j>b)break;
    ev.push({jd:j,k:'lun',full:ph===180,lon:lon('Moon',j)});s=A.MakeTime(r.ut+1);}}
  return ev.sort((x,y)=>x.jd-y.jd);
};
root.SKY=SKY;
if(typeof module!=='undefined')module.exports=SKY;
})(typeof window!=='undefined'?window:globalThis);
