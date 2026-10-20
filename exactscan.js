/* exactscan.js — exact time windows for planet conditions over any span (3000 BC – 9999 AD).
   Uses search.js's ephemeris (window._search.lon). No sampling: every moment of the span is
   decided. Each condition is a continuous "margin" g(t) (> 0 while it holds), e.g. for
   "Mars in Aries" the arc distance to the nearest edge of Aries, for an aspect orb − |sep − angle|.
   A body moves at most VMAX °/day, so g cannot reach 0 sooner than |g|/L days — the scan jumps
   that far (long jumps far from an edge, short ones near it), so no ingress, aspect or short
   window is ever stepped over. Each crossing is then refined to ~1 second.
   Motion (direct / retrograde) has no such bound — it is stepped like search.js (STEP) inside the
   windows already found for the other conditions, then bisected.
   Several conditions → each is scanned only inside the windows left by the previous ones
   (cheapest first) → their exact intersection.

   EXS.sign(body, signs[, neg])     signs: array of sign indices 0–11 (one sign, an element…)
   EXS.asp(a, b, angle, orb[, neg]) EXS.noAsp(a, b, [[angle,orb],…]) — none of these aspects
   EXS.motion(body, 'rx'|'dir')
   await EXS.scan(conds, jd0, jd1, {prog, cancelled}) → [[start,end],…] (null if cancelled)
   EXS.inter(W1, W2) · EXS.measure(W) · EXS.fromSearch(c)  (search.js / astrostats condition)    */
(function(G){
'use strict';
const norm=x=>((x%360)+360)%360;
let X=null;const XS=()=>X||(X=G._search);
/* EXS.provide(body, lonFn, maxSpeed) — use another ephemeris for one body (stats.html: the true node) */
const PROV={};
const LON=(b,jd)=>PROV[b]?PROV[b][0](jd):XS().lon(b,jd);
const VM=b=>PROV[b]?PROV[b][1]:(XS().VMAX[b]||1)*1.05;              /* 5 % safety on the fastest daily motion */
/* signed distance (°) of longitude x to the edges of [A, A+30): + inside, − outside */
function arcMargin(x,A){const d=norm(x-A);return d<30?Math.min(d,30-d):-Math.min(d-30,360-d);}
const EXS={};
EXS.provide=(b,fn,v)=>{if(fn)PROV[b]=[fn,v];else delete PROV[b];};
/* ── monotone quantities: always move one way within measured speed limits (°/day, 3000 BC–9999 AD + margin) ──
   so every edge crossing is bracketed directly: [edge distance / fastest, edge distance / slowest]. */
const MONO={sun:[1,0.94,1.035],moon:[1,11.6,15.55],node:[-1,0.0515,0.0545],snode:[-1,0.0515,0.0545],lilith:[1,0.109,0.114],selena:[1,0.139,0.142]};
const ELONG={sun:[10.6,14.55],mercury:[9.4,16.95],venus:[10.35,16.2],mars:[10.8,15.95]};   /* Moon − body; others [11.4, 15.75] */
const w180=x=>((x%360)+540)%360-180;
/* arcs [[lo,hi],…] (°, any range) → merged, sorted, inside [0,360] */
function arcsNorm(list){
  const a=[];for(let [lo,hi] of list){if(hi-lo>=360)return [[0,360]];const w=hi-lo;lo=norm(lo);hi=lo+w;
    if(hi>360){a.push([lo,360]);a.push([0,hi-360]);}else a.push([lo,hi]);}
  a.sort((x,y)=>x[0]-y[0]);const m=[];for(const r of a){if(m.length&&r[0]<=m[m.length-1][1])m[m.length-1][1]=Math.max(m[m.length-1][1],r[1]);else m.push([...r]);}
  return m;}
function arcsNeg(list){const m=arcsNorm(list),o=[];let t=0;for(const [lo,hi] of m){if(lo>t)o.push([t,lo]);t=Math.max(t,hi);}if(t<360)o.push([t,360]);return o;}
function edgesOf(arcs){   /* [{x, enter}] ascending; the 0/360 seam is not an edge */
  const m=arcsNorm(arcs);if(!m.length)return 'never';if(m.length===1&&m[0][0]<=0&&m[0][1]>=360)return 'always';
  const e=[];const wrap=m[0][0]===0&&m[m.length-1][1]===360;
  m.forEach(([lo,hi],i)=>{if(!(wrap&&i===0&&lo===0))e.push({x:lo,enter:true});if(!(wrap&&i===m.length-1&&hi===360))e.push({x:hi%360,enter:false});});
  return e.sort((p,q)=>p.x-q.x);}
function arcCond(q,arcs,rmin,rmax,bodies){
  const E=edgesOf(arcs);
  return {k:'arc',q,E,rmin,rmax,L:rmax,bodies,g:jd=>{   /* + inside, − outside (sign only) */
    if(E==='always')return 1;if(E==='never')return -1;const v=norm(q(jd));let k=E.findIndex(e=>e.x>v);if(k<0)k=0;return E[k].enter?-1:1;}};}
EXS.sign=(b,signs,neg)=>{const S=[...new Set(signs)];
  if(MONO[b]&&!PROV[b]){const [dir,lo,hi]=MONO[b],arcs=S.map(s=>dir>0?[30*s,30*s+30]:[-30*s-30,-30*s]);
    return arcCond(jd=>dir*LON(b,jd),neg?arcsNeg(arcs):arcs,lo,hi,[b]);}
  return {k:'sign',b,S,neg:!!neg,L:VM(b),bodies:[b],g:jd=>{const x=LON(b,jd);let m=-1e9;for(const s of S){const v=arcMargin(x,30*s);if(v>m)m=v;}return neg?-m:m;}};};
const sepOf=(a,b,jd)=>Math.abs(norm(LON(a,jd)-LON(b,jd)+180)-180);
function moonArcs(a,b,list,neg){   /* aspects with the Moon: its elongation from the other body only grows */
  const o=a==='moon'?b:a,[lo,hi]=ELONG[o]||[11.4,15.75],arcs=[];
  for(const [ang,orb] of list){arcs.push([ang-orb,ang+orb]);arcs.push([360-ang-orb,360-ang+orb]);}
  return arcCond(jd=>LON('moon',jd)-LON(o,jd),neg?arcsNeg(arcs):arcs,lo,hi,[a,b]);}
/* aspect a–b inside one of [[angle,orb],…] (neg: none of them) */
EXS.anyAsp=(a,b,list,neg)=>(a==='moon')!==(b==='moon')&&!PROV[a==='moon'?b:a]?moonArcs(a,b,list,neg):({k:'asp',a,b,list,neg:!!neg,L:VM(a)+VM(b),bodies:[a,b],
  g:jd=>{const s=sepOf(a,b,jd);let m=-1e9;for(const [ang,orb] of list){const v=orb-Math.abs(s-ang);if(v>m)m=v;}return neg?-m:m;}});
EXS.asp=(a,b,ang,orb,neg)=>EXS.anyAsp(a,b,[[ang,orb]],neg);
EXS.noAsp=(a,b,list)=>EXS.anyAsp(a,b,list,true);
EXS.motion=(b,mo)=>({k:'mo',b,mo,bodies:[b],step:Math.max(0.25,(XS().STEP[b]||1)),
  test:jd=>{const d=norm(LON(b,jd+0.05)-LON(b,jd-0.05)+180)-180;return mo==='rx'?d<0:d>=0;}});
/* search.js / astrostats.js condition → EXS conditions */
EXS.fromSearch=c=>{
  if(c.t==='asp')return [EXS.asp(c.a,c.b,c.ang,c.orb)];
  let S;if(typeof c.s==='string'){const k=+c.s.slice(1);S=[...Array(12).keys()].filter(i=>c.s[0]==='e'?i%4===k:i%3===k);}else S=[c.s];
  const o=[EXS.sign(c.b,S)],mo=c.mo||(c.rx?'rx':'');if(mo)o.push(EXS.motion(c.b,mo));return o;};

const HMIN=1e-4;                                  /* ≈ 9 s */
/* root of g between t0 (g0) and t1 (g1) with opposite signs — Illinois regula falsi */
function root(g,t0,g0,t1,g1){
  let side=0;
  for(let i=0;i<60&&t1-t0>2e-5;i++){
    let t=(t0*g1-t1*g0)/(g1-g0);if(!(t>t0&&t<t1))t=(t0+t1)/2;
    const v=g(t);
    if((v>0)===(g1>0)){t1=t;g1=v;if(side===-1)g0/=2;side=-1;}
    else{t0=t;g0=v;if(side===1)g1/=2;side=1;}
  }
  return (t0+t1)/2;
}
/* one margin condition inside window [a,b] → sub-windows where g > 0 */
function* marginWin(c,a,b,out){
  const g=c.g,L=c.L;let t=a,v=g(a),start=v>0?a:null;
  while(t<b){
    const t2=Math.min(b,t+Math.max(HMIN,Math.abs(v)/L)),v2=g(t2);   /* g cannot reach 0 sooner */
    if((v2>0)!==(v>0)){const r=root(g,t,v,t2,v2);if(v>0){out.push([start,r]);start=null;}else start=r;}
    t=t2;v=v2;yield 1;
  }
  if(start!==null)out.push([start,b]);
}
function* arcWin(c,a,b,out){
  const E=c.E;if(E==='always'){out.push([a,b]);return;}if(E==='never')return;
  const n=E.length,q=c.q,rmin=c.rmin,rmax=c.rmax;
  let t=a,qc=norm(q(a)),k=E.findIndex(e=>e.x>qc);if(k<0)k=0;
  let start=E[k].enter?null:a;
  for(;;){
    const x=E[k].x;let d=norm(x-qc);if(d===0)d=1e-9;
    while(d>60){const tj=t+(d-30)/rmax;if(tj>=b){d=-1;break;}t=tj;qc=norm(q(t));d=norm(x-qc);yield 1;}
    if(d<0)break;
    let lo=t+d/rmax,hi=t+d/rmin;if(lo>=b)break;
    const f=s=>w180(q(s)-x);
    if(hi>b){if(f(b)<0)break;hi=b;}
    let flo=f(lo),fhi=f(hi);
    if(flo>0){hi=lo;fhi=flo;lo=t;flo=f(t);}               /* speed bound overshot — the crossing is in [t, lo] */
    let g=0;while(fhi<0&&g++<40&&hi<b){lo=hi;flo=fhi;hi=Math.min(b,hi+Math.max(0.01,(hi-t)*0.25));fhi=f(hi);}
    if(fhi<0)break;
    const r=root(f,lo,flo,hi,fhi);
    if(E[k].enter)start=r;else{out.push([start===null?a:start,r]);start=null;}
    t=r;qc=x;k=(k+1)%n;yield 1;
    if(t>=b)break;
  }
  if(start!==null)out.push([start,b]);
}
function* stepWin(c,a,b,out){
  const T=c.test;let t=a,p=T(a),start=p?a:null;
  while(t<b){const t2=Math.min(b,t+c.step),q=T(t2);
    if(q!==p){let lo=t,hi=t2;while(hi-lo>2e-5){const m=(lo+hi)/2;(T(m)===q)?hi=m:lo=m;}if(q)start=hi;else{out.push([start,hi]);start=null;}}
    p=q;t=t2;yield 1;}
  if(start!==null)out.push([start,b]);
}
const cost=c=>c.k==='mo'?1e3+c.step:c.k==='arc'?c.rmax*0.3:(c.L||1);
EXS.scan=async function(conds,jd0,jd1,o){
  o=o||{};const prog=o.prog||(()=>{}),cancelled=o.cancelled||(()=>false);
  const cs=[...conds].sort((x,y)=>cost(x)-cost(y));
  let wins=[[jd0,jd1]],tick=performance.now();
  for(let ci=0;ci<cs.length&&wins.length;ci++){
    const c=cs[ci],next=[],tot=EXS.measure(wins)||1;let done=0;
    for(const [a,b] of wins){
      const it=c.k==='mo'?stepWin(c,a,b,next):c.k==='arc'?arcWin(c,a,b,next):marginWin(c,a,b,next);
      let n=0;for(const _ of it){if(++n%512===0&&performance.now()-tick>40){
        prog((ci+Math.min(1,(done+(next.length?next[next.length-1][1]-a:0))/tot))/cs.length);
        await new Promise(r=>setTimeout(r,0));tick=performance.now();if(cancelled())return null;}}
      done+=b-a;
    }
    wins=next.filter(w=>w[1]-w[0]>1e-6);
  }
  prog(1);return wins;
};
EXS.measure=W=>{let s=0;for(const w of W)s+=w[1]-w[0];return s;};
EXS.inter=(A,B)=>{const o=[];let i=0,j=0;
  while(i<A.length&&j<B.length){const a=Math.max(A[i][0],B[j][0]),b=Math.min(A[i][1],B[j][1]);if(b>a)o.push([a,b]);if(A[i][1]<B[j][1])i++;else j++;}
  return o;};
EXS.complement=(W,jd0,jd1)=>{const o=[];let t=jd0;for(const [a,b] of W){if(a>t)o.push([t,a]);t=Math.max(t,b);}if(t<jd1)o.push([t,jd1]);return o;};
/* evenly spread moments through windows: k-th of an endless low-discrepancy (golden-ratio) sequence —
   every prefix covers the whole time of W evenly, nothing is random */
EXS.sweep=W=>{const cum=[];let c=0;for(const w of W){c+=w[1]-w[0];cum.push(c);}
  const PHI=0.6180339887498949;let k=0;
  return ()=>{if(!c)return null;k++;const u=((k*PHI)%1)*c;let lo=0,hi=cum.length-1;
    while(lo<hi){const m=(lo+hi)>>1;if(cum[m]<u)lo=m+1;else hi=m;}const w=W[lo];return w[1]-(cum[lo]-u);};};
G.EXS=EXS;
})(typeof window!=='undefined'?window:self);
