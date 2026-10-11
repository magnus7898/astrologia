/* orbits.js — „ორბიტები“: animated heliocentric solar system (3000 BC – 9999 AD)
   Self-injecting add-on for astro.html — load AFTER search.js (uses its ephemeris:
   window._search.helio / chironHelio / lon / deltaT).
   • orbit lines sampled from the real (perturbed) ephemeris, glowing trails
   • time runs forward / backward at a chosen speed, any date can be typed in
   • „დაბადების მომენტი“: positions at the natal-form moment stay on screen as rings,
     with Earth→planet sight-lines to the zodiac ring = the chart's longitudes
   • zodiac ring of the equinox of date; geocentric longitudes marked on it          */
(function(){
'use strict';
const $=id=>document.getElementById(id);
let X=null;
const D2R=Math.PI/180,R2D=180/Math.PI,pad=n=>String(n).padStart(2,'0');
const PL=[ /* key, name, glyph, colour, dot size */
 ['mercury','მერკური','☿','#b8b4ae',3],['venus','ვენერა','♀','#f0d08a',4.5],['earth','დედამიწა','⊕','#58a8f0',4.6],
 ['mars','მარსი','♂','#ec6a48',3.8],['jupiter','იუპიტერი','♃','#e0b07a',7.5],['saturn','სატურნი','♄','#ead79a',6.5],
 ['uranus','ურანი','♅','#86e0e8',5.2],['neptune','ნეპტუნი','♆','#5f84f0',5.2],['pluto','პლუტონი','♇','#c49a88',3],['chiron','ქირონი','⚷','#a6e09a',2.8]];
const GEO={mercury:'mercury',venus:'venus',mars:'mars',jupiter:'jupiter',saturn:'saturn',uranus:'uranus',neptune:'neptune',pluto:'pluto',chiron:'chiron'};
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'],ZC=['#e0703a','#8fa05a','#d8c060','#4a90c8'];
const SPEEDS=[[1/24,'1 სთ/წმ'],[1,'1 დღე/წმ'],[7,'1 კვირა/წმ'],[30.44,'1 თვე/წმ'],[365.25,'1 წელი/წმ'],[3652.5,'10 წელი/წმ'],[36525,'100 წელი/წმ']];

const CSS=`
#form-orbits .ob-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0}
#form-orbits .ob-btn{background:rgba(201,162,76,.08);border:1px solid rgba(201,162,76,.35);color:#E8C97A;border-radius:14px;padding:5px 12px;font-size:11.5px;cursor:pointer;font-family:inherit}
#form-orbits .ob-btn.on{background:rgba(201,162,76,.25);border-color:#C9A24C;color:#F7E3A8}
#form-orbits .ob-date{display:grid;grid-template-columns:60px 60px 84px 54px 54px auto;gap:6px;align-items:end}
#form-orbits .ob-date input{text-align:center}
@media(max-width:560px){#form-orbits .ob-date{grid-template-columns:1fr 1fr 1.3fr 1fr 1fr}}
#ob-wrap{position:relative;width:100%;margin-top:8px;border-radius:14px;overflow:hidden;border:1px solid rgba(201,162,76,.22);background:#04030b}
#ob-cv{display:block;width:100%;touch-action:none;cursor:grab}
#ob-hud{position:absolute;left:12px;top:10px;font-family:Cinzel,serif;color:#F0D48A;font-size:15px;letter-spacing:1px;text-shadow:0 0 6px #000;pointer-events:none}
#ob-hud small{display:block;font-family:inherit;font-size:10.5px;color:rgba(200,180,140,.75);letter-spacing:.5px}
#ob-tip{position:absolute;pointer-events:none;background:rgba(10,8,22,.92);border:1px solid rgba(201,162,76,.4);border-radius:8px;padding:6px 9px;font-size:11.5px;color:#f3ecdc;display:none;white-space:nowrap}
#ob-legend{position:absolute;right:10px;bottom:8px;font-size:10px;color:rgba(200,180,140,.7);text-align:right;pointer-events:none;line-height:1.5}
.ob-birth{font-size:11.5px;color:rgba(200,180,140,.85);line-height:1.7;margin-top:6px}
.ob-birth b{color:#F0D48A;font-weight:500}`;

/* ── state ── */
const S={jd:0,speed:30.44,dir:1,play:true,scale:'pow',zoom:1,panX:0,panY:0,trails:true,sight:true,
  birth:null,orbits:null,orbT:null,trail:{},last:0,W:800,H:800,dpr:1,stars:null,hover:null};

/* helio J2000 vector of a body at UT jd (TT inside) */
function hv(k,jdUT){const jd=jdUT+X.deltaT(jdUT)/86400,T=(jd-2451545)/36525;
  if(k==='chiron'){const p=X.chironHelio(jd);return p;}
  return X.helio(k,T);}
const precDeg=jd=>{const t=(jd-2451545)/36525;return (5029.0966*t+1.11113*t*t)/3600;};   /* J2000 → equinox of date */
const PER={mercury:0.2408,venus:0.6152,earth:1,mars:1.8809,jupiter:11.862,saturn:29.457,uranus:84.01,neptune:164.8,pluto:247.9,chiron:50.4};

/* orbit polylines around the current epoch (re-sampled when time moves far) */
function buildOrbits(jd){
  const o={};
  for(const [k] of PL){const P=PER[k]*365.25,n=k==='pluto'||k==='neptune'?420:300,pts=[];
    for(let i=0;i<=n;i++){const v=hv(k,jd-P/2+P*i/n);if(v)pts.push(v);}
    o[k]=pts;}
  S.orbits=o;S.orbT=jd;
}

/* screen mapping */
function radial(r){const R=Math.min(S.W,S.H)*0.43*S.zoom;
  if(S.scale==='lin')return R*r/40;
  if(S.scale==='inner')return R*r/5.6;
  return R*Math.pow(r/42,0.42);}                         /* compressed: all planets visible */
function toXY(v){const r=Math.hypot(v[0],v[1]),f=r?radial(r)/r:0;
  return [S.W/2+S.panX+v[0]*f,S.H/2+S.panY-v[1]*f];}

function stars(){const a=[];let s=7;const R=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  for(let i=0;i<420;i++)a.push([R(),R(),R()*1.2+0.2,R()]);S.stars=a;}

/* ── draw ── */
function draw(){
  const cv=$('ob-cv');if(!cv)return;const g=cv.getContext('2d');
  g.setTransform(S.dpr,0,0,S.dpr,0,0);
  const W=S.W,H=S.H,cx=W/2+S.panX,cy=H/2+S.panY;
  g.fillStyle='#04030b';g.fillRect(0,0,W,H);
  for(const [x,y,r,t] of S.stars){g.fillStyle=`rgba(230,225,255,${0.25+0.5*Math.abs(Math.sin(t*20+performance.now()/2400))})`;g.fillRect(x*W,y*H,r,r);}
  /* zodiac ring — equinox of date */
  const Rz=Math.min(W,H)*0.47*Math.max(1,Math.min(S.zoom,1.6)),pr=precDeg(S.jd);
  g.save();g.translate(cx,cy);
  g.strokeStyle='rgba(201,162,76,.28)';g.lineWidth=1;g.beginPath();g.arc(0,0,Rz,0,7);g.stroke();
  g.beginPath();g.arc(0,0,Rz-20,0,7);g.stroke();
  for(let s=0;s<12;s++){const a=(s*30-pr)*D2R;
    g.strokeStyle='rgba(201,162,76,.25)';g.beginPath();g.moveTo(Math.cos(a)*(Rz-20),-Math.sin(a)*(Rz-20));g.lineTo(Math.cos(a)*Rz,-Math.sin(a)*Rz);g.stroke();
    const m=(s*30+15-pr)*D2R;g.fillStyle=ZC[s%4];g.font='14px serif';g.textAlign='center';g.textBaseline='middle';
    g.fillText(ZS[s]+'︎',Math.cos(m)*(Rz-10),-Math.sin(m)*(Rz-10));}
  g.restore();
  /* orbits */
  if(!S.orbits||Math.abs(S.jd-S.orbT)>365.25*40)buildOrbits(S.jd);
  for(const [k,,,col] of PL){const pts=S.orbits[k];if(!pts||pts.length<2)continue;
    g.beginPath();pts.forEach((v,i)=>{const [x,y]=toXY(v);i?g.lineTo(x,y):g.moveTo(x,y);});
    g.strokeStyle=col+'5a';g.lineWidth=1.1;g.shadowColor=col;g.shadowBlur=8;g.stroke();g.shadowBlur=0;}
  /* sun */
  const sg=g.createRadialGradient(cx,cy,0,cx,cy,26);sg.addColorStop(0,'#fff6d0');sg.addColorStop(.25,'#ffd257');sg.addColorStop(1,'rgba(255,160,40,0)');
  g.fillStyle=sg;g.beginPath();g.arc(cx,cy,26,0,7);g.fill();
  /* current positions */
  const now={};
  for(const [k] of PL){const v=hv(k,S.jd);if(v)now[k]=v;}
  /* trails */
  if(S.trails){for(const [k,,,col] of PL){const t=S.trail[k]||(S.trail[k]=[]);if(now[k])t.push(now[k]);if(t.length>160)t.shift();
      for(let i=1;i<t.length;i++){const [x1,y1]=toXY(t[i-1]),[x2,y2]=toXY(t[i]);g.strokeStyle=col;g.globalAlpha=(i/t.length)*0.85;g.lineWidth=2;
        g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}g.globalAlpha=1;}}
  /* birth markers + sight lines */
  if(S.birth){const B=S.birth,E=B.pos.earth&&toXY(B.pos.earth);
    for(const [k,name,gl,col] of PL){const v=B.pos[k];if(!v)continue;const [x,y]=toXY(v);
      if(S.sight&&E&&k!=='earth'&&B.geo[k]!=null){const a=(B.geo[k]-pr)*D2R,zx=cx+Math.cos(a)*(Rz-20),zy=cy-Math.sin(a)*(Rz-20);
        g.setLineDash([3,4]);g.strokeStyle=col+'90';g.lineWidth=1;g.beginPath();g.moveTo(E[0],E[1]);g.lineTo(x,y);g.lineTo(zx,zy);g.stroke();g.setLineDash([]);
        g.fillStyle=col;g.beginPath();g.arc(zx,zy,3.2,0,7);g.fill();}
      g.strokeStyle=col;g.lineWidth=1.6;g.beginPath();g.arc(x,y,9,0,7);g.stroke();
      g.fillStyle=col;g.font='11px serif';g.textAlign='center';g.fillText(gl+'︎',x,y-14);}
    /* sun & moon sight-lines from Earth(birth) */
    if(S.sight&&E){for(const [k,col,gl] of [['sun','#ffd257','☉'],['moon','#dfe6ff','☽']]){if(B.geo[k]==null)continue;
      const a=(B.geo[k]-pr)*D2R,zx=cx+Math.cos(a)*(Rz-20),zy=cy-Math.sin(a)*(Rz-20);
      g.setLineDash([2,5]);g.strokeStyle=col+'a0';g.beginPath();g.moveTo(E[0],E[1]);g.lineTo(zx,zy);g.stroke();g.setLineDash([]);
      g.fillStyle=col;g.beginPath();g.arc(zx,zy,3.6,0,7);g.fill();g.font='12px serif';g.textAlign='center';g.fillText(gl+'︎',zx+(zx-cx)*0.06,zy+(zy-cy)*0.06);}}}
  /* planets now */
  const scr={};
  for(const [k,name,gl,col,sz] of PL){const v=now[k];if(!v)continue;const [x,y]=toXY(v);scr[k]=[x,y];
    const gr=g.createRadialGradient(x,y,0,x,y,sz*3);gr.addColorStop(0,col);gr.addColorStop(.35,col+'aa');gr.addColorStop(1,col+'00');
    g.fillStyle=gr;g.beginPath();g.arc(x,y,sz*3,0,7);g.fill();
    g.fillStyle=col;g.beginPath();g.arc(x,y,sz,0,7);g.fill();
    if(k==='saturn'){g.strokeStyle='#ead79acc';g.lineWidth=1.2;g.beginPath();g.ellipse(x,y,sz*2.1,sz*0.8,-0.4,0,7);g.stroke();}
    if(k==='earth'){const ml=X.lon('moon',S.jd),pm=precDeg(S.jd),a=(ml-pm)*D2R;g.fillStyle='#dfe6ff';g.beginPath();g.arc(x+Math.cos(a)*11,y-Math.sin(a)*11,1.8,0,7);g.fill();}
    g.fillStyle='rgba(243,236,220,.9)';g.font='10.5px sans-serif';g.textAlign='left';g.fillText(gl+'︎ '+name,x+sz+4,y+3);}
  /* geocentric longitudes now — ticks on the ring */
  for(const [k,,,col] of PL){if(k==='earth')continue;const l=X.lon(GEO[k],S.jd);if(!isFinite(l))continue;const a=(l-pr)*D2R;
    g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.moveTo(cx+Math.cos(a)*(Rz+2),cy-Math.sin(a)*(Rz+2));g.lineTo(cx+Math.cos(a)*(Rz+9),cy-Math.sin(a)*(Rz+9));g.stroke();}
  {const l=X.lon('sun',S.jd),a=(l-pr)*D2R;g.fillStyle='#ffd257';g.beginPath();g.arc(cx+Math.cos(a)*(Rz+6),cy-Math.sin(a)*(Rz+6),3.5,0,7);g.fill();}
  S.scr=scr;S.now=now;
  hud();
}
function fmtJD(jd){const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
  const L=window._anc?window._anc.jdToLocal(jd,tz):(()=>{const d=new Date((jd-2440587.5)*864e5);return{year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate(),hour:d.getHours(),minute:d.getMinutes()};})();
  return `${pad(L.day)}.${pad(L.month)}.${L.year<0?(-L.year)+' ძვ.წ.':L.year} ${pad(L.hour)}:${pad(L.minute)}`;}
function hud(){const h=$('ob-hud');if(!h)return;
  h.innerHTML=`${fmtJD(S.jd)}<small>${S.play?(S.dir>0?'▶ ':'◀ ')+SPEEDS.find(s=>s[0]===S.speed)[1]:'⏸ პაუზა'}${S.birth?' · ◯ — დაბადების მომენტი':''}</small>`;}

/* ── loop ── */
function frame(t){
  if(!$('ob-cv')||!document.getElementById('form-orbits').classList.contains('active')){S.last=t;requestAnimationFrame(frame);return;}
  const dt=S.last?Math.min(0.1,(t-S.last)/1000):0;S.last=t;
  if(S.play){S.jd+=S.dir*S.speed*dt;const lo=X.cal2jd(-2999,1,1),hi=X.cal2jd(10000,1,1);if(S.jd<lo||S.jd>hi){S.jd=Math.max(lo,Math.min(hi,S.jd));S.play=false;syncBtns();}}
  draw();requestAnimationFrame(frame);
}
function resize(){const cv=$('ob-cv');if(!cv)return;const w=cv.parentNode.clientWidth||800,h=Math.round(Math.min(w,Math.max(420,window.innerHeight*0.8)));
  S.W=w;S.H=h;S.dpr=window.devicePixelRatio||1;cv.width=w*S.dpr;cv.height=h*S.dpr;cv.style.height=h+'px';}

/* ── birth moment from the natal form ── */
function natalJD(){
  const v=id=>+(($(id)||{}).value);const y=v('n-year'),m=v('n-month'),d=v('n-day');if(!y||!m||!d)return null;
  const h=v('n-hour')||0,mi=v('n-minute')||0,s=v('n-second')||0,tz=(($('n-tz')||{}).value)||'UTC';
  if(window._anc)return window._anc.localToJD(y,m,d,h,mi,s,tz);
  return Date.UTC(y,m-1,d,h,mi,s)/864e5+2440587.5;}
function setBirth(jd){
  const pos={},geo={};for(const [k] of PL){const v=hv(k,jd);if(v)pos[k]=v;if(GEO[k]){const l=X.lon(GEO[k],jd);if(isFinite(l))geo[k]=l;}}
  geo.sun=X.lon('sun',jd);geo.moon=X.lon('moon',jd);S.birth={jd,pos,geo};
  const sg=l=>{const s=Math.floor(l/30);return `${Math.floor(l%30)}°${pad(Math.floor((l%1)*60))}′ ${ZS[s]}︎`;};
  const items=[['☉','sun'],['☽','moon'],...PL.filter(p=>GEO[p[0]]).map(p=>[p[2],p[0]])].filter(([,k])=>geo[k]!=null);
  $('ob-binfo').innerHTML=`<b>დაბადება: ${fmtJD(jd)}</b> — ${items.map(([gl,k])=>`${gl}︎ ${sg(geo[k])}`).join(' · ')}
    <br><span style="font-size:10.5px">◯ — პლანეტა დაბადების მომენტში · წყვეტილი ხაზი — დედამიწიდან პლანეტის მიმართულება, რომელიც ზოდიაქოს წრეზე ასტროლოგიურ გრძედს აჩვენებს.</span>`;
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
   <div style="font-size:11px;color:rgba(200,180,140,.7);line-height:1.6;margin:-2px 0 8px">ყველა პლანეტის ნამდვილი ორბიტა და მოძრაობა (ძვ.წ. 3000 – 9999). „დაბადების მომენტი“ ნატალური ფორმის თარიღს აჩვენებს — სად იყო თითო პლანეტა და რომელ ნიშანში ჩანდა დედამიწიდან.</div>
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
     <select id="ob-speed" style="max-width:140px">${SPEEDS.map(s=>`<option value="${s[0]}"${s[0]===30.44?' selected':''}>${s[1]}</option>`).join('')}</select>
   </div>
   <div class="ob-bar">
     <span style="font-size:11px;color:rgba(200,180,140,.75)">მასშტაბი:</span>
     <button type="button" class="ob-btn on" data-sc="pow">ყველა პლანეტა</button><button type="button" class="ob-btn" data-sc="inner">შიდა პლანეტები</button><button type="button" class="ob-btn" data-sc="lin">რეალური</button>
     <button type="button" class="ob-btn on" id="ob-tr">კვალი</button><button type="button" class="ob-btn on" id="ob-sl">ზოდიაქოს ხაზები</button>
   </div>
   <div id="ob-wrap"><canvas id="ob-cv"></canvas><div id="ob-hud"></div><div id="ob-tip"></div>
     <div id="ob-legend">ბორბალი / თითები — ზუმი · გადათრევა — გადაადგილება · ორჯერ დაჭერა — ცენტრი</div></div>
   <div class="ob-birth" id="ob-binfo"></div>`;
  card.insertBefore(sec,$('form-relocation')||null);
  stars();S.jd=Date.now()/864e5+2440587.5;
  /* controls */
  $('ob-play').onclick=()=>{S.play=!S.play;syncBtns();};
  $('ob-rev').onclick=()=>{S.dir=-S.dir;S.play=true;S.trail={};syncBtns();};
  $('ob-now').onclick=()=>{S.jd=Date.now()/864e5+2440587.5;S.trail={};};
  $('ob-speed').onchange=e=>{S.speed=+e.target.value;S.trail={};};
  $('ob-goto').onclick=()=>{const v=id=>+$(id).value;const y=v('ob-y');if(!y)return;
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
    const jd=window._anc?window._anc.localToJD(y,v('ob-m')||1,v('ob-d')||1,v('ob-h')||0,v('ob-mi')||0,0,tz):Date.UTC(y,(v('ob-m')||1)-1,v('ob-d')||1,v('ob-h')||0,v('ob-mi')||0)/864e5+2440587.5;
    S.jd=Math.max(X.cal2jd(-2999,1,1),Math.min(X.cal2jd(10000,1,1),jd));S.trail={};S.play=false;syncBtns();};
  $('ob-birth').onclick=()=>{const jd=natalJD();if(jd==null){$('ob-binfo').textContent='ნატალურ ფორმაში შეიყვანე დაბადების თარიღი.';return;}
    setBirth(jd);S.jd=jd;S.trail={};S.play=false;syncBtns();};
  sec.querySelectorAll('[data-sc]').forEach(x=>x.onclick=()=>{S.scale=x.dataset.sc;S.zoom=1;S.panX=S.panY=0;sec.querySelectorAll('[data-sc]').forEach(y=>y.classList.toggle('on',y===x));});
  $('ob-tr').onclick=e=>{S.trails=!S.trails;S.trail={};e.target.classList.toggle('on',S.trails);};
  $('ob-sl').onclick=e=>{S.sight=!S.sight;e.target.classList.toggle('on',S.sight);};
  /* zoom / pan / hover */
  const cv=$('ob-cv');let drag=null,pinch=null;
  cv.addEventListener('wheel',e=>{e.preventDefault();S.zoom=Math.max(0.4,Math.min(30,S.zoom*(e.deltaY<0?1.15:1/1.15)));},{passive:false});
  cv.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY,S.panX,S.panY];cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';});
  cv.addEventListener('pointerup',()=>{drag=null;cv.style.cursor='grab';});
  cv.addEventListener('pointermove',e=>{
    if(drag){S.panX=drag[2]+e.clientX-drag[0];S.panY=drag[3]+e.clientY-drag[1];return;}
    const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let best=null,bd=14;
    for(const k in (S.scr||{})){const [x,y]=S.scr[k],d=Math.hypot(x-mx,y-my);if(d<bd){bd=d;best=k;}}
    const tip=$('ob-tip');if(!best){tip.style.display='none';return;}
    const p=PL.find(z=>z[0]===best),v=S.now[best],rr=Math.hypot(v[0],v[1],v[2]);
    let txt=`<b style="color:${p[3]}">${p[2]}︎ ${p[1]}</b> · მზიდან ${rr.toFixed(2)} AU`;
    if(GEO[best]){const l=X.lon(GEO[best],S.jd);const s=Math.floor(l/30);txt+=`<br>დედამიწიდან: ${Math.floor(l%30)}°${pad(Math.floor((l%1)*60))}′ ${X.SIGNS[s]}`;}
    if(S.birth&&S.birth.geo[best]!=null){const l=S.birth.geo[best],s=Math.floor(l/30);txt+=`<br>დაბადებისას: ${Math.floor(l%30)}°${pad(Math.floor((l%1)*60))}′ ${X.SIGNS[s]}`;}
    tip.innerHTML=txt;tip.style.display='block';tip.style.left=Math.min(mx+14,r.width-200)+'px';tip.style.top=(my+12)+'px';});
  cv.addEventListener('pointerleave',()=>{$('ob-tip').style.display='none';});
  cv.addEventListener('dblclick',()=>{S.panX=S.panY=0;S.zoom=1;});
  cv.addEventListener('touchmove',e=>{if(e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    if(pinch)S.zoom=Math.max(0.4,Math.min(30,S.zoom*d/pinch));pinch=d;drag=null;}},{passive:false});
  cv.addEventListener('touchend',()=>{pinch=null;});
  window.addEventListener('resize',resize);
  /* (re)size whenever the tab is opened */
  new MutationObserver(()=>{if(sec.classList.contains('active'))resize();}).observe(sec,{attributes:true,attributeFilter:['class']});
  resize();requestAnimationFrame(frame);
}
function syncBtns(){const p=$('ob-play');if(p){p.textContent=S.play?'⏸ პაუზა':'▶ გაშვება';p.classList.toggle('on',S.play);}
  const r=$('ob-rev');if(r)r.textContent=S.dir>0?'◀ უკან':'▶ წინ';}
function boot(){try{inject();}catch(e){console.warn('orbits.js',e);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
window._orbits={S,setBirth,buildOrbits};
})();
