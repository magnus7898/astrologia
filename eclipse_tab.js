/* eclipse_tab.js — „დაბნელებები“ tab (astro.html, ◎ ორბიტები group). Load after orbits_eclipse.js.
   Only the Sun, the Earth and the Moon, with the Moon's nodes:
     • Sun in the middle, the Earth on its orbit (zodiac ring = heliocentric signs), the Moon's
       orbit around the Earth (enlarged): north half solid, south half dashed, ☊ / ☋ and the
       line of nodes; when that line points at the Sun → „დაბნელების სეზონი“ (±18.5°)
     • time runs: real time (1 s/s) up to 1 month/s; ● now; any date
     • live eclipse: while an eclipse is under way (eclipses.js + Astronomy Engine) the right
       panel shows it as it happens — the Moon in Earth's shadow / over the Sun; with
       „შენელება“ on, time slows down so the whole eclipse plays in ~20 s
   Positions: Astronomy Engine 2.1.19 — apparent geocentric Sun and Moon, true (osculating) node. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const L=()=>window._orbEclipse;
const D2R=Math.PI/180,INC=5.145;
const SPEEDS=[[1/86400,'რეალური დრო'],[1/1440,'1 წთ/წმ'],[1/24,'1 სთ/წმ'],[0.25,'6 სთ/წმ'],[1,'1 დღე/წმ'],[7,'1 კვირა/წმ'],[30.44,'1 თვე/წმ']];
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(x=>x+'︎'),ZC=['#e8875a','#8fc46a','#c9d3e6','#5aa8e8'],ZF=['rgba(232,135,90,.14)','rgba(143,196,106,.14)','rgba(201,211,230,.14)','rgba(90,168,232,.14)'];
const SGN=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const T={ut:Date.now()/864e5-10957.5,speed:1,play:true,slow:true,saved:null,live:null,liveP:null,last:0,W:800,H:600,iW:400,iH:400,nextEv:null,nextAt:null};
let A=null;

const n360=x=>((x%360)+360)%360,sd=(a,b)=>((a-b)%360+540)%360-180;
function geo(ut){const t=A.MakeTime(ut),s=A.Ecliptic(A.GeoVector('Sun',t,true)),m=A.Ecliptic(A.GeoVector('Moon',t,true));
  const st=A.GeoMoonState(t),R=A.Rotation_EQJ_ECT(t),r=A.RotateVector(R,new A.Vector(st.x,st.y,st.z,t)),v=A.RotateVector(R,new A.Vector(st.vx,st.vy,st.vz,t));
  const hx=r.y*v.z-r.z*v.y,hy=r.z*v.x-r.x*v.z,node=n360(Math.atan2(hx,-hy)*180/Math.PI);
  return {sun:s.elon,moon:m.elon,mlat:m.elat,node};}
const PHN=['ახალმთვარე','მზარდი ნამგალი','პირველი მეოთხედი','მზარდი მთვარე','სავსემთვარე','კლებადი მთვარე','ბოლო მეოთხედი','კლებადი ნამგალი'];
const phaseName=e=>PHN[Math.floor(n360(e+22.5)/45)%8];

/* ── eclipse bookkeeping (eclipses.js) ── */
function nextEclipse(ut){const E=window.ECLIPSES;if(!E)return null;let best=null;
  for(const [t,Lx] of [['solar',E.solar],['lunar',E.lunar]]){const a=Lx.ut;let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>1;if(a[m]<=ut)lo=m+1;else hi=m;}
    for(const i of [lo-1,lo]){if(i<0||i>=a.length)continue;if(a[i]<ut-0.2)continue;if(!best||a[i]<best.ut)best={t,i,ut:a[i],kind:Lx.kind[i],sign:Lx.sign[i]};}}
  return best;}

/* ── drawing: the Sun–Earth–Moon system ── */
function drawSystem(g,G){
  const W=T.W,H=T.H,cx=W/2,cy=H/2,R=Math.min(W,H)*0.33,rm=R*0.3;
  g.fillStyle='#04030b';g.fillRect(0,0,W,H);
  /* faint stars */
  if(!T.stars){T.stars=[...Array(160)].map(()=>[Math.random(),Math.random(),Math.random()]);}
  T.stars.forEach(([x,y,b])=>{g.fillStyle=`rgba(255,255,255,${0.15+b*0.35})`;g.fillRect(x*W,y*H,1,1);});
  const P=(r,l,ox=cx,oy=cy)=>[ox+r*Math.cos(l*D2R),oy-r*Math.sin(l*D2R)];
  /* zodiac ring (heliocentric longitudes) */
  const Rz=Math.min(W,H)*0.47;g.strokeStyle='rgba(201,162,76,.28)';g.lineWidth=1;g.beginPath();g.arc(cx,cy,Rz,0,7);g.stroke();g.beginPath();g.arc(cx,cy,Rz-22,0,7);g.stroke();
  for(let s=0;s<12;s++){g.beginPath();g.arc(cx,cy,Rz,-s*30*D2R,-(s+1)*30*D2R,true);g.arc(cx,cy,Rz-22,-(s+1)*30*D2R,-s*30*D2R,false);g.closePath();g.fillStyle=ZF[s%4];g.fill();}
  g.strokeStyle='rgba(227,190,132,.35)';
  for(let s=0;s<12;s++){const [x1,y1]=P(Rz-22,s*30),[x2,y2]=P(Rz,s*30);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
    const [x,y]=P(Rz-11,s*30+15);g.fillStyle=ZC[s%4];g.font='16px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ZS[s],x,y);}
  /* Earth orbit + Sun */
  g.strokeStyle='rgba(88,168,240,.35)';g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();
  const sg=g.createRadialGradient(cx,cy,0,cx,cy,34);sg.addColorStop(0,'#fff6d0');sg.addColorStop(.35,'#ffd257');sg.addColorStop(1,'rgba(255,190,60,0)');g.fillStyle=sg;g.beginPath();g.arc(cx,cy,34,0,7);g.fill();
  const le=G.sun+180,[ex,ey]=P(R,le);
  /* eclipse season: line of nodes within 18.5° of the Sun–Earth line */
  const dn=Math.min(Math.abs(sd(G.sun,G.node)),Math.abs(sd(G.sun,G.node+180)));const season=dn<18.5;
  if(season){g.fillStyle='rgba(255,120,90,.08)';g.beginPath();g.moveTo(ex,ey);g.arc(ex,ey,rm*1.9,(-(G.sun+18.5))*D2R,(-(G.sun-18.5))*D2R);g.closePath();g.fill();
    g.beginPath();g.moveTo(ex,ey);g.arc(ex,ey,rm*1.9,(-(G.sun+180+18.5))*D2R,(-(G.sun+180-18.5))*D2R);g.closePath();g.fill();}
  /* Sun → Earth line and Earth's shadow */
  g.strokeStyle='rgba(255,210,90,.22)';g.setLineDash([3,5]);g.beginPath();g.moveTo(cx,cy);g.lineTo(ex,ey);g.stroke();g.setLineDash([]);
  {const [sx,sy]=P(rm*1.5,le,ex,ey),[ax,ay]=P(7,le+90,ex,ey),[bx,by]=P(7,le-90,ex,ey);g.fillStyle='rgba(0,0,0,.65)';g.beginPath();g.moveTo(ax,ay);g.lineTo(sx,sy);g.lineTo(bx,by);g.closePath();g.fill();}
  /* Moon orbit: north half solid, south half dashed; line of nodes */
  const seg=(a0,a1,dash,col)=>{g.setLineDash(dash);g.strokeStyle=col;g.lineWidth=1.6;g.beginPath();for(let a=a0;a<=a1;a+=3){const [x,y]=P(rm,a,ex,ey);a===a0?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();g.setLineDash([]);};
  seg(G.node,G.node+180,[],'rgba(220,226,255,.75)');seg(G.node+180,G.node+360,[4,4],'rgba(220,226,255,.35)');
  {const [x1,y1]=P(rm*1.75,G.node,ex,ey),[x2,y2]=P(rm*1.75,G.node+180,ex,ey);g.strokeStyle=season?'rgba(255,150,110,.85)':'rgba(190,150,255,.55)';g.lineWidth=1.2;g.setLineDash([6,4]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);}
  const nodeMark=(l,fill,lab)=>{const [x,y]=P(rm,l,ex,ey);g.strokeStyle='#c8a8ff';g.fillStyle=fill?'#c8a8ff':'#04030b';g.lineWidth=1.6;g.beginPath();g.arc(x,y,5,0,7);g.fill();g.stroke();
    const [tx,ty]=P(rm+16,l,ex,ey);g.fillStyle='#e2d4ff';g.font='15px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(lab,tx,ty);};
  nodeMark(G.node,true,'☊︎');nodeMark(G.node+180,false,'☋︎');
  /* Earth */
  const eg=g.createRadialGradient(ex-3,ey-3,1,ex,ey,9);eg.addColorStop(0,'#bfe3ff');eg.addColorStop(1,'#2f74c6');g.fillStyle=eg;g.beginPath();g.arc(ex,ey,9,0,7);g.fill();
  /* Moon with its phase (lit towards the Sun) */
  const [mx,my]=P(rm,G.moon,ex,ey),mr=6;
  g.fillStyle='#2a2a33';g.beginPath();g.arc(mx,my,mr,0,7);g.fill();
  const toSun=Math.atan2(cy-my,cx-mx);g.fillStyle='#f2efe6';g.beginPath();g.arc(mx,my,mr,toSun-Math.PI/2,toSun+Math.PI/2);g.closePath();g.fill();
  if(G.live){g.strokeStyle=G.live.t==='lunar'?'#ff8a5a':'#ffd257';g.lineWidth=2;g.beginPath();g.arc(mx,my,mr+5,0,7);g.stroke();}
  /* labels */
  g.font="600 12.5px 'Noto Sans Georgian',sans-serif";g.textAlign='left';g.lineJoin='round';
  const lab=(t,x,y,c)=>{g.lineWidth=3;g.strokeStyle='rgba(4,3,11,.9)';g.strokeText(t,x,y);g.fillStyle=c;g.fillText(t,x,y);};
  {const [lx,ly]=P(rm*0.55,G.moon+180,ex,ey);g.textAlign='center';lab('დედამიწა',lx,ly+4,'#cfe6ff');g.textAlign='left';}lab('მთვარე',mx+9,my-9,'#f2efe6');
  if(season)lab('დაბნელების სეზონი',ex-60,ey-rm*1.9-8,'#ffb39a');
}

/* ── right panel: the live eclipse, or what is coming ── */
function drawInset(g,G){
  const W=T.iW,H=T.iH;const ev=T.liveP;
  if(ev){const u=(T.ut-(ev.peak-ev.half))/(2*ev.half);ev.u=Math.max(0,Math.min(1,u));ev.W=W;ev.H=H;ev.hud=$('ecx-ihud');L().draw(g,ev);return;}
  g.fillStyle='#05040d';g.fillRect(0,0,W,H);
  /* the Moon's phase as seen from Earth */
  const e=n360(G.moon-G.sun),cx=W/2,cy=H*0.38,r=Math.min(W,H)*0.17;
  g.fillStyle='#24242c';g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
  const k=Math.cos(e*D2R),waxing=e<180;g.fillStyle='#f0ece2';g.beginPath();
  g.arc(cx,cy,r,-Math.PI/2,Math.PI/2,!waxing);g.ellipse(cx,cy,Math.abs(k)*r,r,0,Math.PI/2,-Math.PI/2,(k>0)===waxing?!waxing:waxing);g.fill();
  const nx=T.nextEv,dn=Math.min(Math.abs(sd(G.sun,G.node)),Math.abs(sd(G.sun,G.node+180)));
  $('ecx-ihud').innerHTML=`<div class="t">${phaseName(e)}</div><div>მზე–მთვარე: ${Math.round(e)}°</div>
    <div>მთვარე: ${G.mlat>=0?'ეკლიპტიკის ჩრდილოეთით':'ეკლიპტიკის სამხრეთით'} ${Math.abs(G.mlat).toFixed(2)}°</div>
    <div>☊ ${ZS[Math.floor(G.node/30)]} ${SGN[Math.floor(G.node/30)]} ${(G.node%30).toFixed(1)}° · მზე კვანძიდან ${dn.toFixed(1)}°${dn<18.5?' — <b style="color:#ffb39a">სეზონი</b>':''}</div>
    ${nx?`<div class="nx">შემდეგი: <b>${nx.t==='solar'?'☀ მზის':'🌙 მთვარის'} ${L().KIND[nx.t][nx.kind]}</b><br>${L().fmt(nx.ut)} · ${nx.ut-T.ut<1?Math.max(0,Math.round((nx.ut-T.ut)*24))+' სთ':Math.round(nx.ut-T.ut)+' დღე'}</div>`:''}`;
}

/* ── time loop ── */
async function liveCheck(){
  if(!window.ECLIPSES)return;
  if(T.nextAt==null||T.ut>T.nextAt+0.3||T.ut<T.nextAt-400){const n=nextEclipse(T.ut);T.nextEv=n;T.nextAt=n?n.ut:null;}
  const n=T.nextEv;if(!n){T.liveP=null;return;}
  const P=T.liveKey===n.t+n.ut?T.liveP0:null;
  const span=n.t==='lunar'?0.17:0.075;
  if(Math.abs(T.ut-n.ut)<span){
    if(!P&&!T.loading){T.loading=true;try{T.liveP0=await L().prepare(n);T.liveKey=n.t+n.ut;}finally{T.loading=false;}}
    const Q=T.liveKey===n.t+n.ut?T.liveP0:null;
    if(Q&&Math.abs(T.ut-Q.peak)<=Q.half){
      if(!T.liveP&&T.slow&&T.play&&T.speed>(2*Q.half/20)){T.saved=T.speed;T.speed=2*Q.half/20;syncSpeed();}
      T.liveP=Q;return;}
  }
  if(T.liveP&&T.saved!=null){T.speed=T.saved;T.saved=null;syncSpeed();}
  T.liveP=null;
}
function syncSpeed(){const s=$('ecx-speed');if(!s)return;const o=[...s.options].find(o=>Math.abs(+o.value-T.speed)<1e-9);
  if(o)s.value=o.value;else{let x=s.querySelector('option[data-tmp]');if(!x){x=document.createElement('option');x.dataset.tmp='1';s.appendChild(x);}x.value=T.speed;x.textContent='⏬ დაბნელება (შენელებული)';s.value=String(T.speed);}}
function frame(ts){
  const sec=$('form-eclipses');requestAnimationFrame(frame);
  if(!sec||!sec.classList.contains('active')||!A){T.last=0;return;}
  const dt=T.last?Math.min(0.1,(ts-T.last)/1000):0;T.last=ts;
  if(T.play)T.ut+=dt*T.speed;
  liveCheck();
  const G=geo(T.ut);G.live=T.liveP&&T.liveP.c;
  drawSystem(T.g,G);drawInset(T.gi,G);
  $('ecx-hud').innerHTML=`${L().fmt(T.ut)}<small>${T.play?'▶':'⏸'} ${(SPEEDS.find(s=>Math.abs(s[0]-T.speed)<1e-9)||[0,'შენელებული'])[1]}</small>`;
}

/* ── UI ── */
const CSS=`
.form-card:has(#form-eclipses.active){max-width:min(1300px,calc(100vw - 32px))!important}
#form-eclipses .ob-bar{display:flex;flex-wrap:wrap;gap:7px;align-items:center;margin:10px 0}
#form-eclipses .ob-btn{background:rgba(201,162,76,.1);border:1px solid rgba(201,162,76,.45);color:#F0D48A;border-radius:16px;padding:7px 14px;font-size:13px;cursor:pointer;font-family:inherit}
#form-eclipses .ob-btn:hover{border-color:#F0D48A;color:#FFF0C8}
#form-eclipses .ob-btn.on{background:rgba(201,162,76,.3);border-color:#E3BE84;color:#FFF3D0}
#form-eclipses .ob-btn:disabled{opacity:.45;cursor:default}
#form-eclipses select,#form-eclipses input[type=number]{background:#0e0b1e;border:1px solid rgba(201,162,76,.5);color:#F3ECDC;border-radius:10px;padding:7px 9px;font-size:13px;font-family:inherit}
#form-eclipses input[type=number]{width:62px;text-align:center}#form-eclipses input.yr{width:82px}
#form-eclipses .ob-lab{font-size:13px;color:#E8D6AE;letter-spacing:0!important;text-transform:none!important;font-family:'Noto Sans Georgian',sans-serif!important}
#form-eclipses select{width:auto!important;max-width:220px;flex:0 0 auto}
#form-eclipses input[type=number]{width:62px!important;flex:0 0 auto;padding:7px 4px!important}#form-eclipses input.yr{width:82px!important}
#form-eclipses input[type=checkbox]{width:15px!important;height:15px!important;flex:0 0 auto}
#form-eclipses .ecx-intro{font-size:13px;line-height:1.6;color:rgba(240,232,214,.88)}
#ecx-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:12px;margin-top:8px}
@media(max-width:900px){#ecx-grid{grid-template-columns:1fr}}
.ecx-pane{position:relative;border:1px solid rgba(201,162,76,.22);border-radius:14px;overflow:hidden;background:#04030b}
#ecx-cv{display:block;width:100%;height:min(74vh,720px)}
#ecx-in{display:block;width:100%;height:min(74vh,720px)}
@media(max-width:900px){#ecx-cv{height:min(92vw,560px)}#ecx-in{height:min(80vw,420px)}}
#ecx-hud{position:absolute;left:14px;top:12px;font-family:Cinzel,serif;color:#F7DE9A;font-size:17px;text-shadow:0 0 6px #000;pointer-events:none}
#ecx-hud small{display:block;font-family:'Noto Sans Georgian',sans-serif;font-size:12.5px;color:rgba(240,226,196,.9)}
#ecx-ihud{position:absolute;left:14px;right:14px;top:12px;color:#F3ECDC;font-size:13px;line-height:1.65;text-shadow:0 0 6px #000;pointer-events:none}
#ecx-ihud .t{font-family:Cinzel,'Noto Serif Georgian',serif;font-size:17px;color:#F7DE9A}
#ecx-ihud .p{color:#FFD9A8;font-weight:600}#ecx-ihud .x{font-size:11.5px;opacity:.75}
#ecx-ihud .nx{margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,162,76,.25)}
#ecx-ihud b{color:#F3DDA4}
#ecx-wrapA #ecl-ov{border-radius:0}`;
function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!bar||!card||!L())return false;if($('form-eclipses'))return true;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const ob=bar.querySelector(".tab-btn[onclick*=\"'orbits'\"]");
  const b=document.createElement('button');b.type='button';b.className='tab-btn';b.id='ec-tab-btn';b.textContent='დაბნელებები';b.setAttribute('onclick',"setMode('eclipses')");
  if(ob)ob.after(b);else bar.appendChild(b);
  const sec=document.createElement('div');sec.id='form-eclipses';sec.className='form-section';
  const now=new Date();
  sec.innerHTML=`<div class="person-label">🌘 მზე · დედამიწა · მთვარე — დაბნელებები</div>
   <div class="ecx-intro">დაბნელება ხდება მაშინ, როცა ახალმთვარე ან სავსემთვარე მთვარის <b>კვანძებთან</b> (☊ ☋) ახლოს მოდის — მზე, დედამიწა და მთვარე ერთ ხაზზე დგება. კვანძების ხაზი მზისკენ რომ მიიმართება, ეს არის „დაბნელების სეზონი“. მარჯვნივ — დაბნელება ცოცხლად, როცა ხდება.</div>
   <div class="ob-bar"><button type="button" class="ob-btn on" id="ecx-play">⏸ პაუზა</button><button type="button" class="ob-btn" id="ecx-now">● ახლა</button>
     <select id="ecx-speed">${SPEEDS.map(s=>`<option value="${s[0]}"${s[0]===1?' selected':''}>${s[1]}</option>`).join('')}</select>
     <label class="ob-lab" style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="ecx-slow" checked style="accent-color:#C9A24C;width:15px;height:15px"> დაბნელებაზე შენელება</label>
     <span style="width:8px"></span>
     <input type="number" id="ecx-d" min="1" max="31" value="${now.getDate()}"><input type="number" id="ecx-m" min="1" max="12" value="${now.getMonth()+1}"><input type="number" id="ecx-y" class="yr" value="${now.getFullYear()}" title="ძვ.წ. — მინუსით">
     <button type="button" class="ob-btn" id="ecx-go">↪ გადასვლა</button></div>
   <div id="ecx-ctl"></div>
   <div id="ecx-grid"><div class="ecx-pane" id="ecx-wrapS"><canvas id="ecx-cv"></canvas><div id="ecx-hud"></div></div>
     <div class="ecx-pane" id="ecx-wrapA"><canvas id="ecx-in"></canvas><div id="ecx-ihud"></div></div></div>`;
  card.insertBefore(sec,$('form-relocation')||null);
  T.g=$('ecx-cv').getContext('2d');T.gi=$('ecx-in').getContext('2d');
  const size=()=>{const dpr=Math.min(2,devicePixelRatio||1);for(const [id,kw,kh,ctx] of [['ecx-cv','W','H',T.g],['ecx-in','iW','iH',T.gi]]){const c=$(id),r=c.getBoundingClientRect();if(!r.width)continue;c.width=r.width*dpr;c.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);T[kw]=r.width;T[kh]=r.height;}};
  new ResizeObserver(size).observe(sec);
  $('ecx-play').onclick=()=>{T.play=!T.play;$('ecx-play').textContent=T.play?'⏸ პაუზა':'▶ გაშვება';$('ecx-play').classList.toggle('on',T.play);};
  $('ecx-now').onclick=()=>{T.ut=Date.now()/864e5-10957.5;T.speed=1/86400;T.saved=null;syncSpeed();T.nextAt=null;};
  $('ecx-speed').onchange=e=>{T.speed=+e.target.value;T.saved=null;};
  $('ecx-slow').onchange=e=>{T.slow=e.target.checked;};
  $('ecx-go').onclick=()=>{const v=id=>+$(id).value;const g=new Date(0);g.setUTCFullYear(v('ecx-y'),(v('ecx-m')||1)-1,v('ecx-d')||1);g.setUTCHours(12,0,0,0);T.ut=g.getTime()/864e5-10957.5;T.nextAt=null;};
  /* the eclipse library: controls here, ↪ moves this view's clock to 6 h (lunar) / 2 h (solar) before the peak */
  const lib=L();lib.st.now=()=>T.ut;
  lib.st.onJump=c=>{T.ut=c.ut-(c.t==='lunar'?0.25:0.09);T.nextAt=null;T.play=true;$('ecx-play').textContent='⏸ პაუზა';$('ecx-play').classList.add('on');
    if(T.speed>1/24){T.speed=1/24;syncSpeed();}};
  lib.st.host=()=>$('ecx-wrapA');
  /* the library injects its row into #ecx-ctl when it sees it */
  setTimeout(()=>{const go=$('ecl-go');if(go)go.textContent='↪ აქ ნახვა';},600);
  Promise.all([lib.needAE(),lib.needEC()]).then(()=>{A=lib.A;size();}).catch(()=>{$('ecx-ihud').textContent='ასტრონომიული ბიბლიოთეკა ვერ ჩაიტვირთა';});
  requestAnimationFrame(frame);
  return true;
}
function hook(){
  if(typeof window.setMode!=='function'||window.setMode._ec)return;
  const o=window.setMode;const w=function(m){const r=o.apply(this,arguments);
    if(m==='eclipses'){document.querySelectorAll('.tab-bar .tab-btn').forEach(b=>b.classList.toggle('active',b.id==='ec-tab-btn'));
      const lib=L();if(lib)lib.close();}
    return r;};w._ec=true;for(const k in o)w[k]=o[k];window.setMode=w;
}
function boot(){if(!inject()){let n=0;const t=setInterval(()=>{if(inject()||++n>60)clearInterval(t);},250);}
  setTimeout(hook,0);window.addEventListener('load',()=>setTimeout(hook,50));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window._eclipseTab={T,geo,nextEclipse};
})();
