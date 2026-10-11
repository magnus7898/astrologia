/* orbits.js — „ორბიტები“: animated solar system (3000 BC – 9999 AD)
   Self-injecting add-on for astro.html — load AFTER search.js (uses its ephemeris:
   window._search.helio / chironHelio / lon / deltaT).
   • two views: heliocentric (Sun in the middle) and geocentric (Earth in the middle —
     the planets draw their retrograde loops and the classic patterns, e.g. Venus' rose)
   • all planets or ONE planet in focus (auto-zoom on its orbit / loops)
   • smooth: the static layer (stars, zodiac, orbits) is cached off-screen; trails are
     kept in time and pre-filled from the ephemeris, so patterns appear immediately
   • „დაბადების მომენტი“: natal-form positions stay as rings, with sight-lines to the
     zodiac ring = the chart's longitudes                                              */
(function(){
'use strict';
const $=id=>document.getElementById(id);
let X=null;
const D2R=Math.PI/180,pad=n=>String(n).padStart(2,'0');
const PL=[ /* key, name, glyph, colour, dot size */
 ['mercury','მერკური','☿','#c4c0ba',3],['venus','ვენერა','♀','#f0d08a',4.5],['earth','დედამიწა','⊕','#58a8f0',4.6],
 ['mars','მარსი','♂','#ef6c4a',3.8],['jupiter','იუპიტერი','♃','#e3b27c',7.5],['saturn','სატურნი','♄','#ecd99c',6.5],
 ['uranus','ურანი','♅','#86e0e8',5.2],['neptune','ნეპტუნი','♆','#6a8cf4',5.2],['pluto','პლუტონი','♇','#c9a08e',3],['chiron','ქირონი','⚷','#a6e09a',2.8]];
const PK=Object.fromEntries(PL.map(p=>[p[0],p]));
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'],ZC=['#e0703a','#8fa05a','#d8c060','#4a90c8'];
const SPEEDS=[[1/24,'1 სთ/წმ'],[1,'1 დღე/წმ'],[7,'1 კვირა/წმ'],[30.44,'1 თვე/წმ'],[182.6,'½ წელი/წმ'],[365.25,'1 წელი/წმ'],[3652.5,'10 წელი/წმ'],[36525,'100 წელი/წმ']];
const PER={mercury:0.2408,venus:0.6152,earth:1,mars:1.8809,jupiter:11.862,saturn:29.457,uranus:84.01,neptune:164.8,pluto:247.9,chiron:50.4};
const SYN={mercury:0.317,venus:1.599,mars:2.135,jupiter:1.092,saturn:1.035,uranus:1.012,neptune:1.006,pluto:1.004,chiron:1.02};

const CSS=`
#form-orbits .ob-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0}
#form-orbits .ob-btn{background:rgba(201,162,76,.08);border:1px solid rgba(201,162,76,.35);color:#E8C97A;border-radius:14px;padding:5px 12px;font-size:11.5px;cursor:pointer;font-family:inherit}
#form-orbits .ob-btn.on{background:rgba(201,162,76,.25);border-color:#C9A24C;color:#F7E3A8}
#form-orbits .ob-pl{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 2px}
#form-orbits .ob-pl button{background:rgba(255,255,255,.03);border:1px solid rgba(201,162,76,.22);color:#e8dcc0;border-radius:12px;padding:4px 10px;font-size:11.5px;cursor:pointer;font-family:inherit}
#form-orbits .ob-pl button.on{border-color:#C9A24C;background:rgba(201,162,76,.22);color:#F7E3A8}
#form-orbits .ob-date{display:grid;grid-template-columns:60px 60px 84px 54px 54px auto;gap:6px;align-items:end}
#form-orbits .ob-date input{text-align:center}
@media(max-width:560px){#form-orbits .ob-date{grid-template-columns:1fr 1fr 1.3fr 1fr 1fr}}
#ob-wrap{position:relative;width:100%;margin-top:8px;border-radius:14px;overflow:hidden;border:1px solid rgba(201,162,76,.22);background:#04030b}
#ob-cv{display:block;width:100%;touch-action:none;cursor:grab}
#ob-hud{position:absolute;left:12px;top:10px;font-family:Cinzel,serif;color:#F0D48A;font-size:15px;letter-spacing:1px;text-shadow:0 0 6px #000;pointer-events:none}
#ob-hud small{display:block;font-family:inherit;font-size:10.5px;color:rgba(200,180,140,.8);letter-spacing:.5px}
#ob-tip{position:absolute;pointer-events:none;background:rgba(10,8,22,.92);border:1px solid rgba(201,162,76,.4);border-radius:8px;padding:6px 9px;font-size:11.5px;color:#f3ecdc;display:none;white-space:nowrap}
#ob-legend{position:absolute;right:10px;bottom:8px;font-size:10px;color:rgba(200,180,140,.65);text-align:right;pointer-events:none;line-height:1.5}
.ob-birth{font-size:11.5px;color:rgba(200,180,140,.85);line-height:1.7;margin-top:6px}
.ob-birth b{color:#F0D48A;font-weight:500}`;

/* ── state ── */
const S={jd:0,speed:30.44,dir:1,play:true,view:'helio',focus:'all',scale:'pow',zoom:1,panX:0,panY:0,trails:true,sight:true,
  birth:null,orbits:null,orbT:null,hist:{},dl:[],dT:null,acc:null,accKey:'',keep:true,nodes:false,dance:{on:false,a:'earth',b:'venus'},last:0,W:800,H:800,dpr:1,stars:null,bg:null,bgKey:'',fit:null};

/* ── ephemeris helpers ── */
function hv(k,jdUT){const jd=jdUT+X.deltaT(jdUT)/86400,T=(jd-2451545)/36525;
  return k==='chiron'?X.chironHelio(jd):X.helio(k,T);}
/* vector of body k in the current view frame (helio, or geo = minus Earth) */
function vv(k,jd,E){if(S.view==='helio')return hv(k,jd);
  if(k==='earth')return [0,0,0];
  if(k==='sun'){const e=E||hv('earth',jd);return [-e[0],-e[1],-e[2]];}
  const p=hv(k,jd),e=E||hv('earth',jd);return p?[p[0]-e[0],p[1]-e[1],p[2]-e[2]]:null;}
const precDeg=jd=>{const t=(jd-2451545)/36525;return (5029.0966*t+1.11113*t*t)/3600;};
const visible=k=>(S.focus==='all'&&!(S.dance&&S.dance.on))||k===S.focus||k==='earth'||(S.view==='geo'&&k==='sun')||(S.dance&&S.dance.on&&(k===S.dance.a||k===S.dance.b));

/* ── screen mapping ── */
function aph(k){if(k==='sun'||k==='earth'&&S.view==='geo')return 1;const a=(X.KEP[k]||[PER[k]**(2/3)])[0]||1,e=k==='chiron'?0.38:(X.KEP[k]||[0,0.05])[1];return a*(1+e);}
function maxR(){ /* outer radius (AU) that should fit the ring */
  if(S.dance.on&&S.focus==='all'){const m=Math.max(aph(S.dance.a),aph(S.dance.b));return S.view==='helio'?m*1.08:(m+1)*1.06;}
  if(S.focus!=='all'){const a=(X.KEP[S.focus]||[PER[S.focus]**(2/3)])[0]||1,e=S.focus==='chiron'?0.38:(X.KEP[S.focus]||[0,0.05])[1];
    return S.view==='helio'?a*(1+e)*1.08:(a*(1+e)+1)*1.06;}
  if(S.scale==='inner')return S.view==='helio'?5.6:6.6;
  return 42;}
function radial(r){const R=Math.min(S.W,S.H)*0.43*S.zoom,M=maxR();
  if(S.focus!=='all'||S.dance.on||S.scale==='lin'||S.scale==='inner')return R*r/M;
  return R*Math.pow(r/M,0.42);}
function toXY(v){const r=Math.hypot(v[0],v[1]),f=r?radial(r)/r:0;return [S.W/2+S.panX+v[0]*f,S.H/2+S.panY-v[1]*f];}
const ringR=()=>Math.min(S.W,S.H)*0.47;

/* ── orbit polylines (heliocentric view) ── */
function buildOrbits(jd){const o={};
  for(const [k] of PL){const P=PER[k]*365.25,n=k==='pluto'||k==='neptune'?420:300,pts=[];
    for(let i=0;i<=n;i++){const v=hv(k,jd-P/2+P*i/n);if(v)pts.push(v);}o[k]=pts;}
  S.orbits=o;S.orbT=jd;S.bgKey='';}

/* ── static layer: stars, zodiac ring, orbits — cached ── */
function stars(){const a=[];let s=7;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};for(let i=0;i<460;i++)a.push([R(),R(),R()*1.3+0.2,0.25+0.6*R()]);S.stars=a;}
function bgLayer(){
  const pr=precDeg(S.jd),key=[S.W,S.H,S.dpr,S.zoom.toFixed(3),S.panX|0,S.panY|0,S.scale,S.view,S.focus,S.dance.on,S.dance.a,S.dance.b,S.nodes,Math.round(pr*4),S.orbT].join('|');
  if(S.bg&&S.bgKey===key)return S.bg;
  const c=S.bg||document.createElement('canvas');c.width=S.W*S.dpr;c.height=S.H*S.dpr;
  const g=c.getContext('2d');g.setTransform(S.dpr,0,0,S.dpr,0,0);const W=S.W,H=S.H,cx=W/2+S.panX,cy=H/2+S.panY,Rz=ringR();
  g.fillStyle='#04030b';g.fillRect(0,0,W,H);
  for(const [x,y,r,a] of S.stars){g.fillStyle=`rgba(230,225,255,${a})`;g.fillRect(x*W,y*H,r,r);}
  const neb=g.createRadialGradient(cx,cy,0,cx,cy,Rz);neb.addColorStop(0,'rgba(90,60,160,.10)');neb.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=neb;g.fillRect(0,0,W,H);
  /* zodiac ring (equinox of date) */
  g.save();g.translate(cx,cy);g.strokeStyle='rgba(201,162,76,.3)';g.lineWidth=1;
  g.beginPath();g.arc(0,0,Rz,0,7);g.stroke();g.beginPath();g.arc(0,0,Rz-20,0,7);g.stroke();
  for(let s=0;s<12;s++){const a=(s*30-pr)*D2R;g.strokeStyle='rgba(201,162,76,.25)';g.beginPath();g.moveTo(Math.cos(a)*(Rz-20),-Math.sin(a)*(Rz-20));g.lineTo(Math.cos(a)*Rz,-Math.sin(a)*Rz);g.stroke();
    for(let d=5;d<30;d+=5){const b=(s*30+d-pr)*D2R;g.beginPath();g.moveTo(Math.cos(b)*Rz,-Math.sin(b)*Rz);g.lineTo(Math.cos(b)*(Rz-(d%10?3:5)),-Math.sin(b)*(Rz-(d%10?3:5)));g.stroke();}
    const m=(s*30+15-pr)*D2R;g.fillStyle=ZC[s%4];g.font='14px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ZS[s]+'︎',Math.cos(m)*(Rz-10),-Math.sin(m)*(Rz-10));}
  g.restore();
  /* orbits */
  if(S.view==='helio'&&S.orbits){for(const [k,,,col] of PL){if(!visible(k))continue;const pts=S.orbits[k];if(!pts||pts.length<2)continue;
    g.beginPath();pts.forEach((v,i)=>{const [x,y]=toXY(v);i?g.lineTo(x,y):g.moveTo(x,y);});
    g.strokeStyle=col+(S.focus==='all'?'60':'90');g.lineWidth=S.focus==='all'?1.1:1.6;g.shadowColor=col;g.shadowBlur=8;g.stroke();g.shadowBlur=0;}}
  /* planetary nodes: line of nodes, ☊ filled / ☋ hollow, where each orbit crosses the ecliptic */
  if(S.nodes&&S.view==='helio'&&window._pnodes){const NN=window._pnodes.planetNodes(S.orbT||S.jd);
    for(const k in NN){if(!visible(k))continue;const col=PK[k][3],[x1,y1]=toXY(NN[k].N),[x2,y2]=toXY(NN[k].S);
      g.setLineDash([2,5]);g.strokeStyle=col+'70';g.lineWidth=1;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);
      g.fillStyle=col;g.beginPath();g.arc(x1,y1,4,0,7);g.fill();
      g.strokeStyle=col;g.lineWidth=1.4;g.beginPath();g.arc(x2,y2,4,0,7);g.stroke();
      g.font='11px serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle=col;
      g.fillText('☊\uFE0E',x1+(x1-cx)*0.04+0.1,y1+(y1-cy)*0.04-9);g.fillText('☋\uFE0E',x2+(x2-cx)*0.04,y2+(y2-cy)*0.04-9);}}
  S.bg=c;S.bgKey=key;return c;
}

/* ── trails ──────────────────────────────────────────────────────────────
   Points are generated in TIME (not per frame) between the last point and now,
   so fast speeds still give smooth curves. Fast Kepler positions are used for
   the trail (visually identical); the planets themselves use the full ephemeris.
   „რჩება“ mode: every new piece is painted once onto an accumulation layer
   (additive glow) — nothing is erased, patterns build up. */
function fv(k,jd){return k==='chiron'?X.chironHelio(jd):X.helio0(k,(jd-2451545)/36525);}
function fvv(k,jd){if(S.view==='helio')return k==='sun'?[0,0,0]:fv(k,jd);
  if(k==='earth')return [0,0,0];const e=fv('earth',jd);if(k==='sun')return [-e[0],-e[1],0];
  const p=fv(k,jd);return p?[p[0]-e[0],p[1]-e[1],0]:null;}
function baseStep(k){const P=(k==='sun'?1:PER[k])*365.25;return S.view==='helio'?P/540:Math.min(P,365.25)/720;}
const TCOL=k=>k==='sun'?'#ffd257':PK[k][3];
function trailKeys(){const ks=[];for(const [k] of PL){if(!visible(k))continue;if(S.view==='geo'&&k==='earth')continue;ks.push(k);}if(S.view==='geo')ks.push('sun');return ks;}
function trailSpan(k){
  if(S.view==='helio')return Math.max(25,Math.min(PER[k]*365.25*(S.focus==='all'?0.18:0.9),3650*3));
  if(S.focus!=='all')return k===S.focus?(k==='venus'?8*365.25:k==='mercury'?365.25*1.2:Math.max(2.2*365.25,SYN[k]*365.25*(k==='mars'?3.2:4))):365.25;
  return k==='mercury'||k==='venus'||k==='mars'?400:365.25;}
function resetTrails(){S.hist={};S.dl=[];S.dT=null;S.accKey='';}
function prefill(k){const h={t:[],x:[],y:[]},span=trailSpan(k),st=Math.max(baseStep(k),span/6000),n=Math.ceil(span/st);
  for(let i=n;i>=0;i--){const t=S.jd-S.dir*span*i/n,v=fvv(k,t);if(v){h.t.push(t);h.x.push(v[0]);h.y.push(v[1]);}}
  return h;}
/* accumulation layer */
function accLayer(){
  const key=[S.W,S.H,S.dpr,S.zoom.toFixed(3),S.panX|0,S.panY|0,S.scale,S.view,S.focus,S.dance.on,S.dance.a,S.dance.b].join('|');
  if(!S.acc){S.acc=document.createElement('canvas');}
  if(S.accKey!==key){const c=S.acc;c.width=S.W*S.dpr;c.height=S.H*S.dpr;S.accKey=key;
    const g=c.getContext('2d');g.setTransform(S.dpr,0,0,S.dpr,0,0);
    if(S.keep)for(const k in S.hist)strokeHist(g,k,S.hist[k],0);
    drawDance(g,0);}
  return S.acc;}
function strokeHist(g,k,h,from){const n=h.t.length;if(n-from<2)return;
  /* normal blending: overlapping laps converge to the planet's colour instead of burning to white;
     butt caps — no bright beads where the per-frame pieces meet */
  g.globalCompositeOperation='source-over';g.lineCap='butt';g.lineJoin='round';
  g.strokeStyle=TCOL(k);g.globalAlpha=S.focus===k?0.6:0.45;g.lineWidth=S.focus===k?1.4:1.1;
  g.beginPath();for(let i=from;i<n;i++){const [x,y]=toXY([h.x[i],h.y[i]]);i===from?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();
  g.globalAlpha=1;g.globalCompositeOperation='source-over';}
function drawDance(g,from){const L=S.dl||[];if(L.length<=from)return;
  g.globalCompositeOperation='lighter';g.strokeStyle='rgba(232,201,122,.13)';g.lineWidth=0.8;g.beginPath();
  for(let i=from;i<L.length;i+=4){const [x1,y1]=toXY([L[i],L[i+1]]),[x2,y2]=toXY([L[i+2],L[i+3]]);g.moveTo(x1,y1);g.lineTo(x2,y2);}
  g.stroke();g.globalCompositeOperation='source-over';}
/* advance every trail to the current moment */
function advance(){
  if(!S.trails&&!S.dance.on)return;
  const ks=S.trails?trailKeys():[],budget=Math.max(120,Math.floor(6000/Math.max(1,ks.length)));
  const ga=accLayer().getContext('2d');ga.setTransform(S.dpr,0,0,S.dpr,0,0);
  for(const k of ks){
    let h=S.hist[k];if(!h){h=S.hist[k]=prefill(k);if(S.keep)strokeHist(ga,k,h,0);continue;}
    const t0=h.t[h.t.length-1],d=S.jd-t0,st=baseStep(k);let n=Math.floor(Math.abs(d)/st);if(!n)continue;
    if(n>budget)n=budget;const step=d/n,from=h.t.length-1;
    for(let i=1;i<=n;i++){const t=t0+step*i,v=fvv(k,t);if(!v)continue;h.t.push(t);h.x.push(v[0]);h.y.push(v[1]);}
    if(S.keep){strokeHist(ga,k,h,from);
      if(h.t.length>240000){h.t.splice(0,40000);h.x.splice(0,40000);h.y.splice(0,40000);}}
    else{const span=trailSpan(k);let cut=0;while(cut<h.t.length-2&&Math.abs(S.jd-h.t[cut])>span)cut++;if(cut>200||cut>h.t.length/4){h.t.splice(0,cut);h.x.splice(0,cut);h.y.splice(0,cut);}}
  }
  /* geometry: lines between two bodies at a regular time step */
  if(S.dance.on){const A=S.dance.a,B=S.dance.b;if(A!==B){
    const every=Math.min(A==='sun'?365.25:PER[A]*365.25,B==='sun'?365.25:PER[B]*365.25)/40;
    if(S.dT==null)S.dT=S.jd;const d=S.jd-S.dT;let n=Math.floor(Math.abs(d)/every);
    if(n){n=Math.min(n,800);const step=Math.sign(d)*every,from=S.dl.length;
      for(let i=1;i<=n;i++){const t=S.dT+step*i,p=fvv(A,t),q=fvv(B,t);if(p&&q)S.dl.push(p[0],p[1],q[0],q[1]);}
      S.dT+=step*n;drawDance(ga,from);}}}
}
/* fading tail (when „რჩება“ is off) */
function drawFade(g,k,cur){const h=S.hist[k];if(!h||h.t.length<2)return;
  const span=trailSpan(k);let a0=0;while(a0<h.t.length-2&&Math.abs(S.jd-h.t[a0])>span)a0++;
  const n=h.t.length-a0,CH=8;g.lineCap='round';g.lineJoin='round';
  for(let c=0;c<CH;c++){const a=a0+Math.floor(c*(n-1)/CH),b=a0+Math.floor((c+1)*(n-1)/CH);if(b<=a)continue;
    g.beginPath();for(let i=a;i<=b;i++){const [x,y]=toXY([h.x[i],h.y[i]]);i===a?g.moveTo(x,y):g.lineTo(x,y);}
    if(c===CH-1&&cur){const [x,y]=toXY(cur);g.lineTo(x,y);}
    g.strokeStyle=TCOL(k);g.globalAlpha=0.08+0.8*((c+1)/CH)**1.6;g.lineWidth=S.focus===k?2:1.6;g.stroke();}
  g.globalAlpha=1;}
function drawHead(g,k,cur){const h=S.hist[k];if(!h||!h.t.length||!cur)return;const i=h.t.length-1,[x1,y1]=toXY([h.x[i],h.y[i]]),[x2,y2]=toXY(cur);
  g.strokeStyle=TCOL(k);g.globalAlpha=0.7;g.lineWidth=1.3;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.globalAlpha=1;}

/* ── frame ── */
function draw(){
  const cv=$('ob-cv');if(!cv)return;const g=cv.getContext('2d');
  if(S.view==='helio'&&(!S.orbits||Math.abs(S.jd-S.orbT)>365.25*40))buildOrbits(S.jd);
  g.setTransform(1,0,0,1,0,0);g.drawImage(bgLayer(),0,0);
  g.setTransform(S.dpr,0,0,S.dpr,0,0);
  const W=S.W,H=S.H,cx=W/2+S.panX,cy=H/2+S.panY,Rz=ringR(),pr=precDeg(S.jd);
  const E=hv('earth',S.jd),now={};
  const keys=[...PL.map(p=>p[0]),...(S.view==='geo'?['sun']:[])];
  for(const k of keys){if(!visible(k))continue;const v=vv(k,S.jd,E);if(v)now[k]=v;}
  advance();
  if(S.keep||S.dance.on){g.setTransform(1,0,0,1,0,0);g.drawImage(accLayer(),0,0);g.setTransform(S.dpr,0,0,S.dpr,0,0);}
  if(S.trails){for(const k of trailKeys()){if(!now[k])continue;S.keep?drawHead(g,k,now[k]):drawFade(g,k,now[k]);}}
  /* centre body */
  const cg=(r,c0,c1)=>{const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,c0);gr.addColorStop(.3,c1);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();};
  if(S.view==='helio')cg(26,'#fff6d0','#ffd257');else cg(16,'#e4f2ff','#58a8f0');
  /* birth markers */
  if(S.birth){const B=S.birth,Eb=B.e,E0=S.view==='helio'?toXY(Eb):[cx,cy];
    for(const [k,,gl,col] of PL){if(!visible(k)||!B.pos[k])continue;const v=S.view==='helio'?B.pos[k]:k==='earth'?null:[B.pos[k][0]-Eb[0],B.pos[k][1]-Eb[1],B.pos[k][2]-Eb[2]];if(!v)continue;
      const [x,y]=toXY(v);
      if(S.sight&&k!=='earth'&&B.geo[k]!=null){const a=(B.geo[k]-pr)*D2R,zx=cx+Math.cos(a)*(Rz-20),zy=cy-Math.sin(a)*(Rz-20);
        g.setLineDash([3,4]);g.strokeStyle=col+'99';g.lineWidth=1;g.beginPath();g.moveTo(E0[0],E0[1]);g.lineTo(x,y);g.lineTo(zx,zy);g.stroke();g.setLineDash([]);
        g.fillStyle=col;g.beginPath();g.arc(zx,zy,3.2,0,7);g.fill();}
      g.strokeStyle=col;g.lineWidth=1.6;g.beginPath();g.arc(x,y,9,0,7);g.stroke();}
    if(S.sight){for(const [k,col,gl] of [['sun','#ffd257','☉'],['moon','#dfe6ff','☽']]){if(B.geo[k]==null)continue;
      const a=(B.geo[k]-pr)*D2R,zx=cx+Math.cos(a)*(Rz-20),zy=cy-Math.sin(a)*(Rz-20);
      g.setLineDash([2,5]);g.strokeStyle=col+'a0';g.beginPath();g.moveTo(E0[0],E0[1]);g.lineTo(zx,zy);g.stroke();g.setLineDash([]);
      g.fillStyle=col;g.beginPath();g.arc(zx,zy,3.6,0,7);g.fill();}}}
  /* bodies */
  const scr={};
  for(const k in now){if(S.view==='geo'&&k==='earth')continue;
    const p=k==='sun'?['sun','მზე','☉','#ffd257',9]:PK[k],[,name,gl,col,sz]=p,[x,y]=toXY(now[k]);scr[k]=[x,y];
    const gr=g.createRadialGradient(x,y,0,x,y,sz*3);gr.addColorStop(0,col);gr.addColorStop(.35,col+'aa');gr.addColorStop(1,col+'00');
    g.fillStyle=gr;g.beginPath();g.arc(x,y,sz*3,0,7);g.fill();g.fillStyle=col;g.beginPath();g.arc(x,y,sz,0,7);g.fill();
    if(k==='saturn'){g.strokeStyle='#ecd99ccc';g.lineWidth=1.2;g.beginPath();g.ellipse(x,y,sz*2.1,sz*0.8,-0.4,0,7);g.stroke();}
    if(k==='earth'){const a=(X.lon('moon',S.jd)-pr)*D2R;g.fillStyle='#dfe6ff';g.beginPath();g.arc(x+Math.cos(a)*11,y-Math.sin(a)*11,1.8,0,7);g.fill();}
    g.fillStyle='rgba(243,236,220,.92)';g.font='10.5px sans-serif';g.textAlign='left';g.textBaseline='middle';g.fillText(gl+'︎ '+name,x+sz+4,y);}
  if(S.view==='geo'){const a=(X.lon('moon',S.jd)-pr)*D2R,r=24;g.fillStyle='#dfe6ff';g.beginPath();g.arc(cx+Math.cos(a)*r,cy-Math.sin(a)*r,2.4,0,7);g.fill();}
  /* geocentric longitudes now — ticks on the ring */
  for(const [k,,,col] of PL){if(k==='earth'||!visible(k))continue;const l=X.lon(k,S.jd);if(!isFinite(l))continue;const a=(l-pr)*D2R;
    g.strokeStyle=col;g.lineWidth=2.2;g.beginPath();g.moveTo(cx+Math.cos(a)*(Rz+2),cy-Math.sin(a)*(Rz+2));g.lineTo(cx+Math.cos(a)*(Rz+10),cy-Math.sin(a)*(Rz+10));g.stroke();}
  {const a=(X.lon('sun',S.jd)-pr)*D2R;g.fillStyle='#ffd257';g.beginPath();g.arc(cx+Math.cos(a)*(Rz+6),cy-Math.sin(a)*(Rz+6),3.6,0,7);g.fill();}
  S.scr=scr;S.now=now;hud();
}
function fmtJD(jd){const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
  const L=window._anc?window._anc.jdToLocal(jd,tz):(()=>{const d=new Date((jd-2440587.5)*864e5);return{year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate(),hour:d.getHours(),minute:d.getMinutes()};})();
  return `${pad(L.day)}.${pad(L.month)}.${L.year<0?(-L.year)+' ძვ.წ.':L.year} ${pad(L.hour)}:${pad(L.minute)}`;}
let _hudTxt='';
function hud(){const h=$('ob-hud');if(!h)return;
  let rx='';if(S.focus!=='all'&&S.focus!=='earth'&&X.CAN_RX.has(S.focus)){const d=((X.lon(S.focus,S.jd+0.05)-X.lon(S.focus,S.jd-0.05)+540)%360)-180;if(d<0)rx=' · '+PK[S.focus][2]+'︎ ℞ რეტროგრადული';}
  const t=`${fmtJD(S.jd)}<small>${S.view==='helio'?'ჰელიოცენტრული':'გეოცენტრული'} · ${S.play?(S.dir>0?'▶ ':'◀ ')+SPEEDS.find(s=>s[0]===S.speed)[1]:'⏸ პაუზა'}${rx}${S.birth?' · ◯ დაბადება':''}</small>`;
  if(t!==_hudTxt){h.innerHTML=t;_hudTxt=t;}}

/* ── loop ── */
function frame(t){
  requestAnimationFrame(frame);
  const sec=document.getElementById('form-orbits');if(!sec||!sec.classList.contains('active')){S.last=0;return;}
  const dt=S.last?Math.min(0.05,(t-S.last)/1000):0;S.last=t;
  if(S.play&&dt){S.jd+=S.dir*S.speed*dt;const lo=X.cal2jd(-2999,1,1),hi=X.cal2jd(10000,1,1);if(S.jd<lo||S.jd>hi){S.jd=Math.max(lo,Math.min(hi,S.jd));S.play=false;syncBtns();}}
  draw();
}
function resize(){const cv=$('ob-cv');if(!cv)return;const w=cv.parentNode.clientWidth||800,h=Math.round(Math.min(w,Math.max(420,window.innerHeight*0.8)));
  S.W=w;S.H=h;S.dpr=Math.min(2,window.devicePixelRatio||1);cv.width=w*S.dpr;cv.height=h*S.dpr;cv.style.height=h+'px';S.bgKey='';}

/* ── birth moment from the natal form ── */
function natalJD(){
  const v=id=>+(($(id)||{}).value);const y=v('n-year'),m=v('n-month'),d=v('n-day');if(!y||!m||!d)return null;
  const h=v('n-hour')||0,mi=v('n-minute')||0,s=v('n-second')||0,tz=(($('n-tz')||{}).value)||'UTC';
  if(window._anc)return window._anc.localToJD(y,m,d,h,mi,s,tz);
  return Date.UTC(y,m-1,d,h,mi,s)/864e5+2440587.5;}
function setBirth(jd){
  const pos={},geo={};for(const [k] of PL){const v=hv(k,jd);if(v)pos[k]=v;if(k!=='earth'){const l=X.lon(k,jd);if(isFinite(l))geo[k]=l;}}
  geo.sun=X.lon('sun',jd);geo.moon=X.lon('moon',jd);S.birth={jd,pos,geo,e:pos.earth};
  const sg=l=>{const s=Math.floor(l/30);return `${Math.floor(l%30)}°${pad(Math.floor((l%1)*60))}′ ${ZS[s]}︎`;};
  const items=[['☉','sun'],['☽','moon'],...PL.filter(p=>p[0]!=='earth').map(p=>[p[2],p[0]])].filter(([,k])=>geo[k]!=null);
  $('ob-binfo').innerHTML=`<b>დაბადება: ${fmtJD(jd)}</b> — ${items.map(([gl,k])=>`${gl}︎ ${sg(geo[k])}`).join(' · ')}
    <br><span style="font-size:10.5px">◯ — პლანეტა დაბადების მომენტში · წყვეტილი ხაზი — დედამიწიდან პლანეტის მიმართულება ზოდიაქოს წრემდე (ასტროლოგიური გრძედი).</span>`;
}

/* ── UI ── */
function inject(){
  X=window._search;const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!X||!X.helio||!bar||!card||$('form-orbits'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const b=document.createElement('button');b.className='tab-btn';b.textContent='ორბიტები';b.setAttribute('onclick',"setMode('orbits')");
  const after=document.querySelector(".tab-btn[onclick*=\"'astats'\"]")||document.querySelector(".tab-btn[onclick*=\"'search'\"]");
  if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);else bar.appendChild(b);
  const sec=document.createElement('div');sec.id='form-orbits';sec.className='form-section';
  const t=new Date();
  sec.innerHTML=`
   <div class="person-label">🪐 ორბიტები — მზის სისტემა მოძრაობაში</div>
   <div style="font-size:11px;color:rgba(200,180,140,.7);line-height:1.6;margin:-2px 0 8px">პლანეტების ნამდვილი მოძრაობა (ძვ.წ. 3000 – 9999). <b>ჰელიოცენტრული</b> — მზე შუაშია, ორბიტები; <b>გეოცენტრული</b> — დედამიწა შუაშია, და ჩანს როგორ „ხატავენ“ პლანეტები რეტროგრადულ მარყუჟებს. აირჩიე ერთი პლანეტა — ხედი მასზე გადავა.</div>
   <div class="ob-date">
     <div class="field"><label>დღე</label><input type="number" id="ob-d" min="1" max="31" value="${t.getDate()}"></div>
     <div class="field"><label>თვე</label><input type="number" id="ob-m" min="1" max="12" value="${t.getMonth()+1}"></div>
     <div class="field"><label>წელი</label><input type="number" id="ob-y" value="${t.getFullYear()}" title="ძვ.წ. — მინუსით"></div>
     <div class="field"><label>სთ</label><input type="number" id="ob-h" min="0" max="23" value="${t.getHours()}"></div>
     <div class="field"><label>წთ</label><input type="number" id="ob-mi" min="0" max="59" value="${t.getMinutes()}"></div>
     <div class="field"><label>&nbsp;</label><button type="button" class="ob-btn" id="ob-goto">↪ გადასვლა</button></div>
   </div>
   <div class="ob-bar">
     <button type="button" class="ob-btn on" id="ob-play">⏸ პაუზა</button>
     <button type="button" class="ob-btn" id="ob-rev">◀ უკან</button>
     <button type="button" class="ob-btn" id="ob-now">● ახლა</button>
     <button type="button" class="ob-btn" id="ob-birth">✦ დაბადების მომენტი</button>
     <select id="ob-speed" style="max-width:150px">${SPEEDS.map(s=>`<option value="${s[0]}"${s[0]===30.44?' selected':''}>${s[1]}</option>`).join('')}</select>
   </div>
   <div class="ob-bar">
     <button type="button" class="ob-btn on" data-vw="helio">☉ ჰელიოცენტრული</button><button type="button" class="ob-btn" data-vw="geo">⊕ გეოცენტრული</button>
     <span style="width:10px"></span>
     <span style="font-size:11px;color:rgba(200,180,140,.75)">მასშტაბი:</span>
     <button type="button" class="ob-btn on" data-sc="pow">ყველა</button><button type="button" class="ob-btn" data-sc="inner">შიდა</button><button type="button" class="ob-btn" data-sc="lin">რეალური</button>
     <button type="button" class="ob-btn on" id="ob-sl">ზოდიაქოს ხაზები</button><button type="button" class="ob-btn" id="ob-nd" title="სად კვეთს თითო პლანეტის ორბიტა ეკლიპტიკას">☊ კვანძები</button>
   </div>
   <div class="ob-bar">
     <span style="font-size:11px;color:rgba(200,180,140,.75)">კვალი:</span>
     <button type="button" class="ob-btn on" data-tm="keep">რჩება (გეომეტრია)</button><button type="button" class="ob-btn" data-tm="fade">ქრება</button><button type="button" class="ob-btn" data-tm="off">გამორთ.</button>
     <button type="button" class="ob-btn" id="ob-clr">🧹 გასუფთავება</button>
     <span style="width:10px"></span>
     <button type="button" class="ob-btn" id="ob-dance">✦ ორი პლანეტის ხაზები</button>
     <select id="ob-da" style="max-width:130px">${[['sun','☉ მზე'],...PL.map(p=>[p[0],p[2]+'\uFE0E '+p[1]])].map(([k,n])=>`<option value="${k}"${k==='earth'?' selected':''}>${n}</option>`).join('')}</select>
     <select id="ob-db" style="max-width:130px">${[['sun','☉ მზე'],...PL.map(p=>[p[0],p[2]+'\uFE0E '+p[1]])].map(([k,n])=>`<option value="${k}"${k==='venus'?' selected':''}>${n}</option>`).join('')}</select>
   </div>
   <div class="ob-pl" id="ob-pl"><button data-f="all" class="on">✦ ყველა პლანეტა</button>${PL.filter(p=>p[0]!=='earth').map(p=>`<button data-f="${p[0]}" style="color:${p[3]}">${p[2]}︎ ${p[1]}</button>`).join('')}</div>
   <div id="ob-wrap"><canvas id="ob-cv"></canvas><div id="ob-hud"></div><div id="ob-tip"></div>
     <div id="ob-legend">ბორბალი / თითები — ზუმი · გადათრევა — გადაადგილება · ორჯერ დაჭერა — ცენტრი</div></div>
   <div class="ob-birth" id="ob-binfo"></div>`;
  card.insertBefore(sec,$('form-relocation')||null);
  stars();S.jd=Date.now()/864e5+2440587.5;
  const view0=()=>{S.zoom=1;S.panX=S.panY=0;resetTrails();S.bgKey='';};
  $('ob-play').onclick=()=>{S.play=!S.play;syncBtns();};
  $('ob-rev').onclick=()=>{S.dir=-S.dir;S.play=true;syncBtns();};
  $('ob-now').onclick=()=>{S.jd=Date.now()/864e5+2440587.5;resetTrails();};
  $('ob-speed').onchange=e=>{S.speed=+e.target.value;};
  $('ob-goto').onclick=()=>{const v=id=>+$(id).value;const y=v('ob-y');if(!y)return;
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
    const jd=window._anc?window._anc.localToJD(y,v('ob-m')||1,v('ob-d')||1,v('ob-h')||0,v('ob-mi')||0,0,tz):Date.UTC(y,(v('ob-m')||1)-1,v('ob-d')||1,v('ob-h')||0,v('ob-mi')||0)/864e5+2440587.5;
    S.jd=Math.max(X.cal2jd(-2999,1,1),Math.min(X.cal2jd(10000,1,1),jd));resetTrails();S.play=false;syncBtns();};
  $('ob-birth').onclick=()=>{const jd=natalJD();if(jd==null){$('ob-binfo').textContent='ნატალურ ფორმაში შეიყვანე დაბადების თარიღი.';return;}
    setBirth(jd);S.jd=jd;resetTrails();S.play=false;syncBtns();};
  sec.querySelectorAll('[data-sc]').forEach(x=>x.onclick=()=>{S.scale=x.dataset.sc;S.zoom=1;S.panX=S.panY=0;S.bgKey='';S.accKey='';sec.querySelectorAll('[data-sc]').forEach(y=>y.classList.toggle('on',y===x));});
  sec.querySelectorAll('[data-vw]').forEach(x=>x.onclick=()=>{S.view=x.dataset.vw;view0();sec.querySelectorAll('[data-vw]').forEach(y=>y.classList.toggle('on',y===x));
    /* geocentric loops look best a little faster */
    if(S.view==='geo'&&S.speed<7){S.speed=7;$('ob-speed').value='7';}});
  sec.querySelectorAll('#ob-pl button').forEach(x=>x.onclick=()=>{S.focus=x.dataset.f;view0();sec.querySelectorAll('#ob-pl button').forEach(y=>y.classList.toggle('on',y===x));
    /* a speed that suits the planet */
    if(S.focus!=='all'){const sp=S.view==='geo'?(S.focus==='mercury'?7:S.focus==='venus'?30.44:30.44):(PER[S.focus]<1?7:PER[S.focus]<3?30.44:PER[S.focus]<40?365.25:3652.5);
      S.speed=sp;$('ob-speed').value=String(sp);}});
  sec.querySelectorAll('[data-tm]').forEach(x=>x.onclick=()=>{const m=x.dataset.tm;S.trails=m!=='off';S.keep=m==='keep';resetTrails();
    sec.querySelectorAll('[data-tm]').forEach(y=>y.classList.toggle('on',y===x));});
  $('ob-clr').onclick=()=>{resetTrails();};
  $('ob-dance').onclick=e=>{S.dance.on=!S.dance.on;resetTrails();S.bgKey='';e.target.classList.toggle('on',S.dance.on);
    if(S.dance.on&&S.speed<7){S.speed=7;$('ob-speed').value='7';}};
  $('ob-da').onchange=e=>{S.dance.a=e.target.value;resetTrails();S.bgKey='';};
  $('ob-db').onchange=e=>{S.dance.b=e.target.value;resetTrails();S.bgKey='';};
  $('ob-sl').onclick=e=>{S.sight=!S.sight;e.target.classList.toggle('on',S.sight);};
  $('ob-nd').onclick=e=>{S.nodes=!S.nodes;e.target.classList.toggle('on',S.nodes);
    if(S.nodes&&S.view!=='helio'){const h=sec.querySelector('[data-vw=helio]');if(h)h.click();}};
  /* zoom / pan / hover */
  const cv=$('ob-cv');let drag=null,pinch=null;
  cv.addEventListener('wheel',e=>{e.preventDefault();S.zoom=Math.max(0.4,Math.min(40,S.zoom*(e.deltaY<0?1.15:1/1.15)));},{passive:false});
  cv.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,S.panX,S.panY];cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';});
  cv.addEventListener('pointerup',()=>{drag=null;cv.style.cursor='grab';});
  cv.addEventListener('pointermove',e=>{
    if(drag){S.panX=drag[2]+e.clientX-drag[0];S.panY=drag[3]+e.clientY-drag[1];return;}
    const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let best=null,bd=14;
    for(const k in (S.scr||{})){const [x,y]=S.scr[k],d=Math.hypot(x-mx,y-my);if(d<bd){bd=d;best=k;}}
    const tip=$('ob-tip');if(!best){tip.style.display='none';return;}
    const p=best==='sun'?['sun','მზე','☉','#ffd257']:PK[best],v=S.now[best],rr=Math.hypot(v[0],v[1],v[2]);
    let txt=`<b style="color:${p[3]}">${p[2]}︎ ${p[1]}</b> · ${S.view==='helio'?'მზიდან':'დედამიწიდან'} ${rr.toFixed(2)} AU`;
    if(best!=='earth'){const l=X.lon(best,S.jd);if(isFinite(l)){const s=Math.floor(l/30);txt+=`<br>დედამიწიდან: ${Math.floor(l%30)}°${pad(Math.floor((l%1)*60))}′ ${X.SIGNS[s]}`;}}
    if(S.birth&&S.birth.geo[best]!=null){const l=S.birth.geo[best],s=Math.floor(l/30);txt+=`<br>დაბადებისას: ${Math.floor(l%30)}°${pad(Math.floor((l%1)*60))}′ ${X.SIGNS[s]}`;}
    tip.innerHTML=txt;tip.style.display='block';tip.style.left=Math.min(mx+14,r.width-210)+'px';tip.style.top=(my+12)+'px';});
  cv.addEventListener('pointerleave',()=>{$('ob-tip').style.display='none';});
  cv.addEventListener('dblclick',()=>{S.panX=S.panY=0;S.zoom=1;});
  cv.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    if(pinch)S.zoom=Math.max(0.4,Math.min(40,S.zoom*d/pinch));pinch=d;drag=null;}},{passive:false});
  cv.addEventListener('touchend',()=>{pinch=null;});
  window.addEventListener('resize',resize);
  new MutationObserver(()=>{if(sec.classList.contains('active'))resize();}).observe(sec,{attributes:true,attributeFilter:['class']});
  resize();requestAnimationFrame(frame);
}
function syncBtns(){const p=$('ob-play');if(p){p.textContent=S.play?'⏸ პაუზა':'▶ გაშვება';p.classList.toggle('on',S.play);}
  const r=$('ob-rev');if(r)r.textContent=S.dir>0?'◀ უკან':'▶ წინ';}
function boot(){try{inject();}catch(e){console.warn('orbits.js',e);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
window._orbits={S,setBirth,buildOrbits,draw};
})();
