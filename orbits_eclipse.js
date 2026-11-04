/* orbits_eclipse.js — „დაბნელებები“ for the ორბიტები tab (astro.html, after orbits.js)
   • row under the orbit controls: ☀ / 🌙 / both · ◀ previous · next ▶ from the date shown on the map
     (eclipses.js: every eclipse 3000 BC – AD 10000) · ↪ jump the map there · ▶ animation
   • animation (overlay inside the orbit view, works in whole-screen too), computed with
     Astronomy Engine 2.1.19 at each frame:
       lunar — the Moon crossing Earth's penumbra and umbra (Danjon: 1.02 × shadow, 0.99834·π☾),
               copper-red in the umbra; seen from Earth, east to the left
       solar — the Moon over the Sun as seen from the point of greatest eclipse
               (SearchGlobalSolarEclipse lat/lon, topocentric); partial-only eclipses: geocentric
     + a small Sun–Earth–Moon side diagram, the phase name and the local clock time.         */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const AE_URL='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
let A=null,aeP=null,ecP=null;
const loadJS=(src,test)=>new Promise((ok,no)=>{if(test())return ok();const s=document.createElement('script');s.src=src;s.onload=()=>ok();s.onerror=()=>no(new Error(src));document.head.appendChild(s);});
const needAE=()=>A?Promise.resolve(A):(aeP=aeP||loadJS(AE_URL,()=>!!window.Astronomy).then(()=>A=window.Astronomy));
const needEC=()=>ecP=ecP||loadJS('eclipses.js',()=>!!window.ECLIPSES);
const SGN=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const SGG=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(x=>x+'︎');
const KIND={solar:{T:'სრული',A:'რგოლური',P:'ნაწილობრივი',N:'ნაწილობრივი'},lunar:{T:'სრული',P:'ნაწილობრივი',N:'ნახევარჩრდილის',A:'ნაწილობრივი'}};
const D2R=Math.PI/180,R2D=180/Math.PI,AU=149597870.7,RE=6378.14,RS=696000,RM=1737.4;
const pad=n=>String(n).padStart(2,'0');
const TZ=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}catch(e){return 'UTC';}})();
function fmt(ut){/* ut = days from J2000 (UT) → local date-time string; astronomical years before 1 AD */
  const ms=(ut+10957.5)*864e5,d=new Date(ms);
  if(!isFinite(ms))return '—';
  try{const o={};new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',era:'short'}).formatToParts(d).forEach(p=>o[p.type]=p.value);
    const y=o.era&&/B/.test(o.era)?'ძვ.წ. '+o.year:o.year;return `${o.day}.${o.month}.${y} ${o.hour}:${o.minute}`;}
  catch(e){return d.toISOString().slice(0,16).replace('T',' ');}
}
const st={type:'both',cur:null,anim:null};

/* ── list navigation ── */
function lists(){const E=window.ECLIPSES,o=[];if(st.type!=='lunar')o.push(['solar',E.solar]);if(st.type!=='solar')o.push(['lunar',E.lunar]);return o;}
function bsearch(a,x){let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>1;if(a[m]<=x)lo=m+1;else hi=m;}return lo;}  /* first index with a[i] > x */
function step(dir){
  const S=window._orbits&&window._orbits.S,map=st.now?st.now():(S?S.jd-2451545:Date.now()/864e5-10957.5);
  /* keep stepping from the last eclipse found — unless the map was moved since (then from the map date) */
  const moved=st.mapAt==null||Math.abs(map-st.mapAt)>0.01;
  const from=st.cur&&(!moved||Math.abs(map-st.cur.ut)<0.05)?st.cur.ut:map;
  let best=null;
  for(const [t,L] of lists()){const ut=L.ut;let i;
    if(dir>0){i=bsearch(ut,from+1e-6);if(i<ut.length&&(!best||ut[i]<best.ut))best={t,i,ut:ut[i],kind:L.kind[i],sign:L.sign[i]};}
    else{i=bsearch(ut,from-1e-6)-1;while(i>=0&&ut[i]>=from-1e-6)i--;if(i>=0&&(!best||ut[i]>best.ut))best={t,i,ut:ut[i],kind:L.kind[i],sign:L.sign[i]};}}
  if(best){st.cur=best;info();}
  st.mapAt=map;
}
function info(){const c=st.cur,el=$('ecl-info');if(!el)return;if(!c){el.innerHTML='';return;}
  el.innerHTML=`<b>${c.t==='solar'?'☀ მზის':'🌙 მთვარის'} ${KIND[c.t][c.kind]} დაბნელება</b> · ${fmt(c.ut)} <span style="opacity:.75">(${TZ})</span> · ${SGG[c.sign]} ${SGN[c.sign]}`;
  $('ecl-go').disabled=$('ecl-play').disabled=false;}
function jump(){const c=st.cur;if(!c)return;
  if(st.onJump){st.onJump(c);return;}
  const d=new Date((c.ut+10957.5)*864e5);const v=(id,x)=>{const e=$(id);if(e)e.value=x;};
  try{const o={};new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23',era:'short'}).formatToParts(d).forEach(p=>o[p.type]=p.value);
    const y=o.era&&/B/.test(o.era)?1-(+o.year):+o.year;v('ob-d',+o.day);v('ob-m',+o.month);v('ob-y',y);v('ob-h',+o.hour);v('ob-mi',+o.minute);}
  catch(e){v('ob-d',d.getUTCDate());v('ob-m',d.getUTCMonth()+1);v('ob-y',d.getUTCFullYear());v('ob-h',d.getUTCHours());v('ob-mi',d.getUTCMinutes());}
  const g=$('ob-goto');if(g)g.click();
  const S=window._orbits&&window._orbits.S;if(S)st.mapAt=S.jd-2451545;
}

/* ── geometry at one moment ── */
function lunarAt(t){
  const m=A.GeoVector('Moon',t,true),s=A.GeoVector('Sun',t,true),em=A.Ecliptic(m),es=A.Ecliptic(s);
  const dM=m.Length()*AU,dS=s.Length()*AU;
  const piM=Math.asin(RE/dM)*R2D,sS=Math.asin(RS/dS)*R2D,piS=Math.asin(RE/dS)*R2D;
  const shLon=es.elon+180,shLat=-es.elat;
  let dx=((em.elon-shLon)%360+540)%360-180;dx*=Math.cos(shLat*D2R);
  return {x:-dx,y:-(em.elat-shLat),rM:Math.asin(RM/dM)*R2D,um:1.02*(0.99834*piM-sS+piS),pen:1.02*(0.99834*piM+sS+piS)};
}
function solarAt(t,obs){
  let m,s,dM,dS;
  if(obs){const qm=A.Equator('Moon',t,obs,true,true),qs=A.Equator('Sun',t,obs,true,true);m=qm;s=qs;dM=qm.dist*AU;dS=qs.dist*AU;
    let dra=((qm.ra-qs.ra)*15%360+540)%360-180;return {x:-dra*Math.cos(qs.dec*D2R),y:-(qm.dec-qs.dec),rM:Math.asin(RM/dM)*R2D,rS:Math.asin(RS/dS)*R2D};}
  const vm=A.GeoVector('Moon',t,true),vs=A.GeoVector('Sun',t,true),em=A.Ecliptic(vm),es=A.Ecliptic(vs);dM=vm.Length()*AU;dS=vs.Length()*AU;
  let dx=((em.elon-es.elon)%360+540)%360-180;return {x:-dx*Math.cos(es.elat*D2R),y:-(em.elat-es.elat),rM:Math.asin(RM/dM)*R2D,rS:Math.asin(RS/dS)*R2D};
}
/* partial-only solar eclipse: the sunlit place where the Moon covers most of the Sun at peak (10° grid, then 2°) */
function bestObserver(t){
  let best=null;
  const test=(la,lo)=>{const o=new A.Observer(la,lo,0),qs=A.Equator('Sun',t,o,true,true);
    if(A.Horizon(t,o,qs.ra,qs.dec,'normal').altitude<1)return;
    const q=solarAt(t,o),f=overlap(Math.hypot(q.x,q.y),q.rS,q.rM);if(!best||f>best.f)best={f,la,lo};};
  for(let la=-80;la<=80;la+=10)for(let lo=-180;lo<180;lo+=10)test(la,lo);
  if(!best)return null;const c=best;
  for(let la=c.la-8;la<=c.la+8;la+=2)for(let lo=c.lo-8;lo<=c.lo+8;lo+=2)if(Math.abs(la)<=89)test(la,((lo+540)%360)-180);
  return new A.Observer(best.la,best.lo,0);
}
function overlap(d,r1,r2){/* area of circle r1 covered by circle r2 at centre distance d, as a fraction of circle r1 */
  if(d>=r1+r2)return 0;if(d<=Math.abs(r2-r1))return r2>=r1?1:(r2*r2)/(r1*r1);
  const a=r1*r1*Math.acos((d*d+r1*r1-r2*r2)/(2*d*r1)),b=r2*r2*Math.acos((d*d+r2*r2-r1*r1)/(2*d*r2)),c=0.5*Math.sqrt((-d+r1+r2)*(d+r1-r2)*(d-r1+r2)*(d+r1+r2));
  return (a+b-c)/(Math.PI*r1*r1);
}

/* ── animation ── */
/* one eclipse → everything the drawing needs (peak, half-span, observer, fixed scale, texts) */
const PREP=new Map();
async function prepare(c){
  await needAE();
  const key=c.t+c.ut;if(PREP.has(key))return PREP.get(key);
  let peak=c.ut,half,obs=null,kindTxt=KIND[c.t][c.kind],extra='';
  if(c.t==='lunar'){const r=A.SearchLunarEclipse(A.MakeTime(c.ut-1));peak=r.peak.ut;half=(Math.max(r.sd_penum,60)+25)/1440;
    if(r.sd_total)extra=`სრული ფაზა ${Math.round(r.sd_total*2)} წთ`;else if(r.sd_partial)extra=`ჩრდილის ფაზა ${Math.round(r.sd_partial*2)} წთ`;}
  else{const r=A.SearchGlobalSolarEclipse(A.MakeTime(c.ut-1));peak=r.peak.ut;
    if(r.latitude!=null&&isFinite(r.latitude)){obs=new A.Observer(r.latitude,r.longitude,0);extra=`ხედი უდიდესი დაბნელების წერტილიდან: ${r.latitude.toFixed(1)}°, ${r.longitude.toFixed(1)}°`;}
    else{obs=bestObserver(r.peak);extra=obs?`ხედი მაქსიმალური ფაზის ადგილიდან: ${obs.latitude.toFixed(0)}°, ${obs.longitude.toFixed(0)}° (ცენტრალური ზოლი არ აქვს)`:'ხედი დედამიწის ცენტრიდან';}
    half=1.7/24;}
  const P={c,peak,half,obs,kindTxt,extra};
  if(c.t==='lunar'){const q=lunarAt(A.MakeTime(peak));P.scaleDeg=Math.max(q.pen+q.rM*2.2,1.6);}
  else{const q=solarAt(A.MakeTime(peak),obs);P.scaleDeg=q.rS*4.2;}
  PREP.set(key,P);return P;
}
async function play(){
  const c=st.cur;if(!c)return;
  const btn=$('ecl-play');btn.disabled=true;btn.textContent='⏳ …';
  let P;try{P=await prepare(c);}catch(e){btn.textContent='▶ ანიმაცია';btn.disabled=false;alert('ასტრონომიული ბიბლიოთეკა ვერ ჩაიტვირთა');return;}
  btn.textContent='▶ ანიმაცია';btn.disabled=false;
  close();
  const wrap=st.host?st.host():$('ob-wrap');if(!wrap)return;
  const box=document.createElement('div');box.id='ecl-ov';
  box.innerHTML=`<canvas id="ecl-cv"></canvas><div id="ecl-hud"></div>
    <div id="ecl-ctl"><button type="button" data-e="pp">⏸</button><input type="range" id="ecl-t" min="0" max="1000" value="0"><button type="button" data-e="x">✕ დახურვა</button></div>`;
  wrap.appendChild(box);
  const cv=$('ecl-cv'),g=cv.getContext('2d');
  const A0={...P,run:true,u:0,last:0};st.anim=A0;
  const size=()=>{const r=box.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);cv.width=r.width*dpr;cv.height=r.height*dpr;g.setTransform(dpr,0,0,dpr,0,0);A0.W=r.width;A0.H=r.height;};
  size();A0.rs=new ResizeObserver(size);A0.rs.observe(box);
  box.querySelector('[data-e=pp]').onclick=e=>{A0.run=!A0.run;e.target.textContent=A0.run?'⏸':'▶';};
  box.querySelector('[data-e=x]').onclick=close;
  $('ecl-t').oninput=e=>{A0.u=+e.target.value/1000;A0.run=false;box.querySelector('[data-e=pp]').textContent='▶';};
  const frame=ts=>{if(st.anim!==A0)return;
    const dt=A0.last?Math.min(0.1,(ts-A0.last)/1000):0;A0.last=ts;
    if(A0.run){A0.u+=dt/14;if(A0.u>1)A0.u=0;$('ecl-t').value=Math.round(A0.u*1000);}
    draw(g,A0);requestAnimationFrame(frame);};
  requestAnimationFrame(frame);
}
function close(){const o=$('ecl-ov');if(o){if(st.anim&&st.anim.rs)st.anim.rs.disconnect();o.remove();}st.anim=null;}
function moonDisc(g,x,y,r){const gr=g.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);gr.addColorStop(0,'#f4f1ea');gr.addColorStop(1,'#a9a49a');
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  g.fillStyle='rgba(120,114,104,.35)';[[-.3,-.2,.18],[.25,.1,.22],[-.05,.35,.14],[.35,-.35,.1]].forEach(([a,b,c])=>{g.beginPath();g.arc(x+a*r,y+b*r,c*r,0,7);g.fill();});}
function draw(g,S){
  const {W,H,c}=S,ut=S.peak-S.half+2*S.half*S.u,t=A.MakeTime(ut),cx=W/2,cy=H*0.44,k=Math.min(W,H*0.78)*0.46/S.scaleDeg;
  g.clearRect(0,0,W,H);
  let phase='',frac=0;
  if(c.t==='lunar'){
    const q=lunarAt(t);
    g.fillStyle='#03030a';g.fillRect(0,0,W,H);
    const P=k*q.pen,U=k*q.um,mx=cx+q.x*k,my=cy+q.y*k,mr=q.rM*k;
    /* shadow outlines */
    g.setLineDash([4,6]);g.strokeStyle='rgba(200,190,170,.35)';g.lineWidth=1;g.beginPath();g.arc(cx,cy,P,0,7);g.stroke();
    g.strokeStyle='rgba(220,110,70,.55)';g.beginPath();g.arc(cx,cy,U,0,7);g.stroke();g.setLineDash([]);
    moonDisc(g,mx,my,mr);
    g.save();g.beginPath();g.arc(mx,my,mr,0,7);g.clip();
    const pg=g.createRadialGradient(cx,cy,U,cx,cy,P);pg.addColorStop(0,'rgba(0,0,0,.55)');pg.addColorStop(1,'rgba(0,0,0,.05)');
    g.fillStyle=pg;g.beginPath();g.arc(cx,cy,P,0,7);g.fill();
    const ug=g.createRadialGradient(cx,cy,0,cx,cy,U);ug.addColorStop(0,'rgba(90,18,6,.93)');ug.addColorStop(.8,'rgba(150,45,15,.88)');ug.addColorStop(1,'rgba(185,80,30,.8)');
    g.fillStyle=ug;g.beginPath();g.arc(cx,cy,U,0,7);g.fill();g.restore();
    const d=Math.hypot(q.x,q.y);frac=overlap(d,q.rM,q.um);const inPen=overlap(d,q.rM,q.pen);
    phase=frac>=0.999?'სრული ფაზა — მთვარე მთლიანად დედამიწის ჩრდილშია':frac>0?`ჩრდილის ფაზა · ${Math.round(frac*100)}%`:inPen>0?'ნახევარჩრდილი — მთვარე ოდნავ მუქდება':'დაბნელებამდე / მის შემდეგ';
    g.font="12px 'Noto Sans Georgian',sans-serif";g.fillStyle='rgba(220,200,170,.7)';g.textAlign='center';
    g.fillText('ნახევარჩრდილი',cx,cy-P-8);g.fillStyle='rgba(235,140,100,.85)';g.fillText('ჩრდილი',cx,cy-U+16);
  }else{
    const q=solarAt(t,S.obs);const d=Math.hypot(q.x,q.y);frac=overlap(d,q.rS,q.rM);
    const total=d<=q.rM-q.rS,annular=d<=q.rS-q.rM;
    const sky=Math.max(0,1-frac*1.05);g.fillStyle=`rgb(${Math.round(8+40*sky)},${Math.round(12+70*sky)},${Math.round(30+110*sky)})`;g.fillRect(0,0,W,H);
    const sr=q.rS*k,mx=cx+q.x*k,my=cy+q.y*k,mr=q.rM*k;
    if(total){const cg=g.createRadialGradient(cx,cy,sr,cx,cy,sr*3.2);cg.addColorStop(0,'rgba(255,250,235,.85)');cg.addColorStop(.25,'rgba(230,225,255,.35)');cg.addColorStop(1,'rgba(200,210,255,0)');
      g.fillStyle=cg;g.beginPath();g.arc(cx,cy,sr*3.2,0,7);g.fill();}
    else{const hg=g.createRadialGradient(cx,cy,sr,cx,cy,sr*2.2);hg.addColorStop(0,'rgba(255,220,120,.55)');hg.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=hg;g.beginPath();g.arc(cx,cy,sr*2.2,0,7);g.fill();}
    const sg=g.createRadialGradient(cx,cy,0,cx,cy,sr);sg.addColorStop(0,'#fffbe6');sg.addColorStop(.8,'#ffd75a');sg.addColorStop(1,'#f5a623');
    g.fillStyle=sg;g.beginPath();g.arc(cx,cy,sr,0,7);g.fill();
    g.fillStyle='#07070c';g.beginPath();g.arc(mx,my,mr,0,7);g.fill();
    phase=total?'სრული ფაზა — მზის გვირგვინი ჩანს':annular?'„ცეცხლის რგოლი“ — მთვარე მზეზე პატარაა':frac>0?`დაფარულია ${Math.round(frac*100)}%`:'დაბნელებამდე / მის შემდეგ';
  }
  /* side diagram */
  const y0=H*0.88,x0=W/2-150;g.save();g.globalAlpha=.9;
  const sun=(x,y)=>{g.fillStyle='#ffd257';g.beginPath();g.arc(x,y,9,0,7);g.fill();};
  const ear=(x,y)=>{g.fillStyle='#58a8f0';g.beginPath();g.arc(x,y,6,0,7);g.fill();};
  const mon=(x,y,col)=>{g.fillStyle=col;g.beginPath();g.arc(x,y,3.4,0,7);g.fill();};
  const ofs=(S.u-0.5)*16;
  sun(x0,y0);g.strokeStyle='rgba(255,210,90,.25)';g.lineWidth=1;
  if(c.t==='lunar'){ear(x0+190,y0);g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.moveTo(x0+190,y0-6);g.lineTo(x0+300,y0-2);g.lineTo(x0+300,y0+2);g.lineTo(x0+190,y0+6);g.fill();
    g.beginPath();g.moveTo(x0,y0-9);g.lineTo(x0+300,y0-2);g.moveTo(x0,y0+9);g.lineTo(x0+300,y0+2);g.stroke();mon(x0+262,y0+ofs,frac>0?'#c0603a':'#ddd');}
  else{ear(x0+290,y0);mon(x0+205,y0+ofs*.6,'#bbb');g.beginPath();g.moveTo(x0,y0-9);g.lineTo(x0+290,y0);g.moveTo(x0,y0+9);g.lineTo(x0+290,y0);g.stroke();}
  g.font="11px 'Noto Sans Georgian',sans-serif";g.fillStyle='rgba(232,220,192,.75)';g.textAlign='center';
  g.fillText('მზე',x0,y0+22);g.fillText('დედამიწა',c.t==='lunar'?x0+190:x0+290,y0+22);g.fillText('მთვარე',c.t==='lunar'?x0+262:x0+205,y0+22);g.restore();
  const hudEl=S.hud||$('ecl-hud');if(hudEl)hudEl.innerHTML=`<div class="t">${c.t==='solar'?'☀ მზის':'🌙 მთვარის'} ${S.kindTxt} დაბნელება</div><div>${fmt(ut)} · <span style="opacity:.8">${TZ}</span></div><div class="p">${phase}</div><div class="x">${S.extra}</div>`;
}

/* ── UI ── */
const CSS=`
#form-eclipses .ob-ecl-row{padding:10px 12px;border:1px solid rgba(201,162,76,.25);border-radius:12px;background:rgba(120,140,220,.05)}
#ecl-info{flex-basis:100%;font-size:13px;color:#EDE6D8;line-height:1.6;min-height:20px}
#ecl-info b{color:#F3DDA4;font-weight:600}
#ecl-ov{position:absolute;inset:0;z-index:5;background:#03030a}
#ecl-cv{position:absolute;inset:0;width:100%;height:100%}
#ecl-hud{position:absolute;left:14px;top:12px;color:#F3ECDC;font-size:13px;line-height:1.6;text-shadow:0 0 6px #000;pointer-events:none;max-width:70%}
#ecl-hud .t{font-family:Cinzel,'Noto Serif Georgian',serif;font-size:17px;color:#F7DE9A}
#ecl-hud .p{color:#FFD9A8;font-weight:600}#ecl-hud .x{font-size:11.5px;opacity:.75}
#ecl-ctl{position:absolute;left:50%;transform:translateX(-50%);bottom:8px;display:flex;gap:8px;align-items:center;width:min(560px,92%)}
#ecl-ctl input{flex:1;accent-color:#C9A24C}
#ecl-ctl button{background:rgba(10,8,22,.86);border:1px solid rgba(201,162,76,.55);color:#F3DDA4;border-radius:14px;padding:6px 12px;font-size:13px;cursor:pointer;font-family:inherit}`;
function inject(){
  const host=$('ecx-ctl'),sec=$('form-eclipses');if(!host||!sec||$('ecl-row'))return!!$('ecl-row');
  const st2=document.createElement('style');st2.textContent=CSS;document.head.appendChild(st2);
  const row=document.createElement('div');row.className='ob-bar ob-ecl-row';row.id='ecl-row';
  row.innerHTML=`<span class="ob-lab">🌘 დაბნელებები:</span>
    <select id="ecl-type"><option value="both">☀ + 🌙 ორივე</option><option value="solar">☀ მზის</option><option value="lunar">🌙 მთვარის</option></select>
    <button type="button" class="ob-btn" id="ecl-prev">◀ წინა</button><button type="button" class="ob-btn" id="ecl-next">შემდეგი ▶</button>
    <button type="button" class="ob-btn" id="ecl-go" disabled>↪ რუკაზე</button><button type="button" class="ob-btn on" id="ecl-play" disabled>▶ ანიმაცია</button>
    <div id="ecl-info"><span style="opacity:.7">„შემდეგი ▶“ — უახლოესი დაბნელება ნაჩვენები დროიდან.</span></div>`;
  host.appendChild(row);
  const nav=async d=>{try{await needEC();}catch(e){$('ecl-info').textContent='დაბნელებების ცხრილი ვერ ჩაიტვირთა';return;}step(d);};
  $('ecl-next').onclick=()=>nav(1);$('ecl-prev').onclick=()=>nav(-1);
  $('ecl-type').onchange=e=>{st.type=e.target.value;if(st.cur){const u=st.cur.ut;st.cur={ut:u-1e-6,t:'',kind:'',sign:0};nav(1);}};
  $('ecl-go').onclick=jump;$('ecl-play').onclick=()=>{jump();play();};
  /* leaving the tab closes the animation */
  new MutationObserver(()=>{if(!sec.classList.contains('active'))close();}).observe(sec,{attributes:true,attributeFilter:['class']});
  return true;
}
function boot(){if(!inject()){let n=0;const t=setInterval(()=>{if(inject()||++n>60)clearInterval(t);},250);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window._orbEclipse={st,step,play,close,prepare,draw,lunarAt,solarAt,needAE,needEC,fmt,KIND,info,
  get A(){return A;}};
})();
