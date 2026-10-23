/* phys.js — „ფიზიკის ლაბორატორია“ (phys.html): mechanics, waves, light, electricity, heat,
   astrophysics, relativity, quantum, chaos. Each topic: live canvas animation, controls, formulas with
   explanations and worked examples. Shares its small engine (canvas, sliders, 3-D, plots) with chem_adv.js. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
const R_GAS=8.314462618,F_C=96485.33212,NA=6.02214076e23,KB=1.380649e-23,H_PL=6.62607015e-34,C_L=299792458,RH=1.0967758e7,EV=1.602176634e-19;
const fmtN=(x,d=3)=>{if(x==null||!isFinite(x))return '—';const a=Math.abs(x);if(a!==0&&(a>=1e5||a<1e-3)){const e=Math.floor(Math.log10(a)),m=x/10**e;return `${m.toFixed(d-1)}·10<sup>${e}</sup>`;}return (+x.toPrecision(d+1)).toString();};
const COL={gold:'#c9a84c',gl:'#ecd59a',ink:'#efe6d4',mid:'#b3a68f',dim:'#6d6253',bg:'#0b0816',red:'#e8705a',blue:'#5a9ae8',green:'#6fcf8a',violet:'#9a6ae8',cyan:'#5fc8d8'};

/* ═══════════ shell: panel, topic cards, animation loops ═══════════ */
const TOP=[];const reg=t=>TOP.push(t);
let CUR=null,STOPS=[],VIS=true;
function stopAll(){STOPS.forEach(f=>{try{f();}catch(e){}});STOPS=[];}
function anim(fn){let on=true,last=performance.now();const f=t=>{if(!on)return;const dt=Math.max(0,Math.min(0.05,(t-last)/1000));last=t;if(VIS&&!document.hidden)fn(dt,t/1000);requestAnimationFrame(f);};requestAnimationFrame(f);STOPS.push(()=>on=false);}
function canvas(host,w,h){const c=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1);c.width=w*d;c.height=h*d;c.style.width='100%';c.style.maxWidth=w+'px';c.style.aspectRatio=w+' / '+h;c.className='acv';
  host.appendChild(c);const g=c.getContext('2d');g.scale(d,d);g.W=w;g.H=h;c.g=g;c.pt=ev=>{const r=c.getBoundingClientRect();return [(ev.clientX-r.left)*w/r.width,(ev.clientY-r.top)*h/r.height];};return c;}
/* slider: html + binding */
const sl=(id,lab,min,max,step,val,unit)=>`<label class="asl"><span>${lab}: <b id="${id}_v">${val}</b>${unit?' '+unit:''}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
function bindSl(id,fn,fmt){const r=$(id),v=$(id+'_v');const go=()=>{const x=+r.value;v.innerHTML=fmt?fmt(x):x;fn(x);};r.addEventListener('input',go);go();return r;}
const btns=(name,list,on)=>`<div class="abt" data-g="${name}">${list.map(([k,l])=>`<button data-k="${k}" class="${k==on?'on':''}">${l}</button>`).join('')}</div>`;
function bindBtns(root,name,fn){const g=root.querySelector(`.abt[data-g="${name}"]`);g.querySelectorAll('button').forEach(b=>b.onclick=()=>{g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));fn(b.dataset.k,b);});}
const XPS=[];
const FX=(list)=>`<div class="afx">${list.map(([f,d,x])=>{let id='';if(x){XPS.push(x);id=` data-xi="${XPS.length-1}"`;}return `<div class="af"${id}><div class="ff">${f}</div>${d?`<div class="fd">${d}</div>`:''}</div>`;}).join('')}</div>`;
const card=(t,body)=>`<div class="acard"><h4>${t}</h4>${body}</div>`;
/* colour helpers */
function hexRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
function shade(h,f){const c=hexRgb(h);return `rgb(${c.map(v=>Math.round(f<0?v*(1+f):v+(255-v)*f)).join(',')})`;}
function rgba(h,a){const c=hexRgb(h);return `rgba(${c.join(',')},${a})`;}
function elColor(sym){const e=window.BY&&BY[sym];const css=e?getComputedStyle(document.documentElement).getPropertyValue('--c-'+e.cat).trim():'';return css||'#9aa0b0';}
const CPK={H:'#e8e8f0',C:'#5a5a66',N:'#4a6ae8',O:'#e84a4a',F:'#8ae860',Cl:'#4ad860',Br:'#a8402a',I:'#8a3ab0',S:'#e8d040',P:'#e8902a',B:'#e8a8a0',Si:'#c8b090',Xe:'#5ac8d8',Be:'#c8e870',Na:'#9a6ae8',Cs:'#6a3ab0',Fe:'#e0702a',Cu:'#d8884a',Au:'#e8c040',Al:'#b8b8c8',Po:'#a8a080',Zn:'#8a90b0',Ca:'#5ae88a',K:'#8a50d8',Mg:'#8ae84a',Li:'#c87ad8',Ag:'#d0d0d8',Pt:'#d0d0e0',Ni:'#50d050',Br2:'#a8402a'};
const cpk=s=>CPK[s]||elColor(s);
/* wavelength (nm) → colour */
function wlRGB(w){let r=0,g=0,b=0;
  if(w>=380&&w<440){r=-(w-440)/60;b=1;}else if(w<490){g=(w-440)/50;b=1;}else if(w<510){g=1;b=-(w-510)/20;}else if(w<580){r=(w-510)/70;g=1;}else if(w<645){r=1;g=-(w-645)/65;}else if(w<=780){r=1;}
  let f=w<380||w>780?0:w<420?0.3+0.7*(w-380)/40:w>700?0.3+0.7*(780-w)/80:1;return `rgb(${[r,g,b].map(v=>Math.round(255*Math.pow(v*f,0.8))).join(',')})`;}

/* ═══════════ S3 — tiny 3-D renderer (spheres, bonds, lobes, lines, point clouds) ═══════════ */
function S3(c,o){
  o=o||{};const g=c.g,W=g.W,H=g.H;
  const s={yaw:o.yaw??0.7,pitch:o.pitch??0.35,auto:o.auto!==false,spin:o.spin??0.35,scale:o.scale||70,dist:o.dist||9,atoms:[],bonds:[],lobes:[],lines:[],cloud:null,labels:true,drag:null,bg:o.bg||null,extra:null};
  c.style.touchAction='none';c.style.cursor='grab';
  c.addEventListener('pointerdown',e=>{s.drag=c.pt(e);s.auto=false;c.setPointerCapture(e.pointerId);c.style.cursor='grabbing';});
  c.addEventListener('pointermove',e=>{if(!s.drag)return;const p=c.pt(e);s.yaw+=(p[0]-s.drag[0])*0.012;s.pitch=clamp(s.pitch+(p[1]-s.drag[1])*0.012,-1.5,1.5);s.drag=p;});
  const up=()=>{s.drag=null;c.style.cursor='grab';};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
  c.addEventListener('dblclick',()=>{s.auto=!s.auto;});
  c.addEventListener('wheel',e=>{e.preventDefault();s.scale=clamp(s.scale*(e.deltaY<0?1.1:0.9),10,600);},{passive:false});
  s.proj=p=>{const cy=Math.cos(s.yaw),sy=Math.sin(s.yaw),cp=Math.cos(s.pitch),sp=Math.sin(s.pitch);
    const x1=p[0]*cy+p[2]*sy,z1=-p[0]*sy+p[2]*cy,y1=p[1]*cp-z1*sp,z2=p[1]*sp+z1*cp,k=s.dist/(s.dist+z2);
    return [W/2+x1*s.scale*k,H/2-y1*s.scale*k,z2,k];};
  s.draw=(dt)=>{
    if(s.auto&&dt)s.yaw+=dt*s.spin;
    g.clearRect(0,0,W,H);if(s.bg){g.fillStyle=s.bg;g.fillRect(0,0,W,H);}
    for(const L of s.lines){const a=s.proj(L[0]),b=s.proj(L[1]);g.strokeStyle=L[2]||'rgba(201,168,76,.35)';g.lineWidth=L[3]||1;g.setLineDash(L[4]?[4,4]:[]);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
    g.setLineDash([]);
    if(s.cloud){const P=s.cloud;g.globalCompositeOperation='lighter';for(let i=0;i<P.length;i++){const p=P[i],q=s.proj(p);g.fillStyle=p[3];const r=(p[4]||1.3)*q[3];g.fillRect(q[0]-r/2,q[1]-r/2,r,r);}g.globalCompositeOperation='source-over';}
    const items=[];
    s.atoms.forEach((a,i)=>{if(a.hide)return;const q=s.proj(a.p);a._q=q;items.push({z:q[2],t:0,a});});
    for(const b of s.bonds){const A=s.atoms[b[0]],B=s.atoms[b[1]];if(!A||!B||A.hide||B.hide)continue;items.push({z:(A._q[2]+B._q[2])/2+0.01,t:1,b,A,B});}
    for(const L of s.lobes){const q=s.proj(L.p),q0=s.proj(L.o||[0,0,0]);items.push({z:q[2],t:2,L,q,q0});}
    items.sort((x,y)=>y.z-x.z);
    for(const it of items){
      if(it.t===0){const a=it.a,q=a._q,r=Math.max(1.5,a.r*s.scale*q[3]);const gr=g.createRadialGradient(q[0]-r*.35,q[1]-r*.35,r*.1,q[0],q[1],r);
        gr.addColorStop(0,shade(a.c,.55));gr.addColorStop(.55,a.c);gr.addColorStop(1,shade(a.c,-.55));g.globalAlpha=a.alpha??1;g.fillStyle=gr;g.beginPath();g.arc(q[0],q[1],r,0,TAU);g.fill();g.globalAlpha=1;
        if(s.labels&&a.lab&&r>7){g.fillStyle=a.labC||'#fff';g.font=`600 ${Math.round(clamp(r*.8,9,16))}px Cinzel,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(a.lab,q[0],q[1]+1);}}
      else if(it.t===1){const {A,B,b}=it,a=A._q,c2=B._q,k=(a[3]+c2[3])/2,w=Math.max(1.5,(b[3]||0.16)*s.scale*k),dash=b[2]==='d';
        const mx=(a[0]+c2[0])/2,my=(a[1]+c2[1])/2;g.lineCap='round';g.setLineDash(dash?[w*0.8,w*0.9]:[]);
        const ord=b[4]||1,dx=c2[0]-a[0],dy=c2[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,ww=ord>1?w*0.55:w,offs=ord===1?[0]:ord===2?[-0.75,0.75]:[-1.3,0,1.3];
        for(const f of offs){const ox=nx*ww*f*1.1,oy=ny*ww*f*1.1;
          g.lineWidth=ww+2;g.strokeStyle='rgba(0,0,0,.55)';g.beginPath();g.moveTo(a[0]+ox,a[1]+oy);g.lineTo(c2[0]+ox,c2[1]+oy);g.stroke();
          g.lineWidth=ww;g.strokeStyle=shade(A.c,-.15);g.beginPath();g.moveTo(a[0]+ox,a[1]+oy);g.lineTo(mx+ox,my+oy);g.stroke();
          g.strokeStyle=shade(B.c,-.15);g.beginPath();g.moveTo(mx+ox,my+oy);g.lineTo(c2[0]+ox,c2[1]+oy);g.stroke();}
        g.setLineDash([]);}
      else{const {L,q,q0}=it,dx=q[0]-q0[0],dy=q[1]-q0[1],len=Math.hypot(dx,dy),ang=Math.atan2(dy,dx),R=(L.r||0.55)*s.scale*q[3];
        g.save();g.translate((q[0]+q0[0])/2+dx*0.1,(q[1]+q0[1])/2+dy*0.1);g.rotate(ang);const rx=Math.max(R*0.45,len*0.6),ry=R*0.55;
        const gr=g.createRadialGradient(rx*0.3,0,1,0,0,Math.max(rx,ry));gr.addColorStop(0,rgba(L.c||'#9a84e0',.55));gr.addColorStop(1,rgba(L.c||'#9a84e0',.05));
        g.fillStyle=gr;g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(rx*0.35,-ry*0.25,2,0,TAU);g.arc(rx*0.35,ry*0.25,2,0,TAU);g.fill();g.restore();}}
    if(s.extra)s.extra(g,s);
  };
  return s;
}
const axes3=(L)=>[[[-L,0,0],[L,0,0],'rgba(232,112,90,.35)'],[[0,-L,0],[0,L,0],'rgba(111,207,138,.35)'],[[0,0,-L],[0,0,L],'rgba(90,154,232,.35)']];
/* simple 2-D plot */
function plot(g,o){const W=g.W,H=g.H,m=o.m||[30,12,22,34],x0=m[3],y0=m[0],w=W-m[1]-m[3],h=H-m[0]-m[2];
  const X=v=>x0+(v-o.x[0])/(o.x[1]-o.x[0])*w,Y=v=>y0+h-(v-o.y[0])/(o.y[1]-o.y[0])*h;
  g.strokeStyle='rgba(201,168,76,.25)';g.lineWidth=1;g.strokeRect(x0,y0,w,h);g.fillStyle=COL.mid;g.font='10px sans-serif';g.textAlign='center';
  if(o.xl)g.fillText(o.xl,x0+w/2,H-4);g.save();g.translate(10,y0+h/2);g.rotate(-Math.PI/2);if(o.yl)g.fillText(o.yl,0,0);g.restore();
  (o.xt||[]).forEach(v=>{g.fillText(String(v),X(v),y0+h+12);});g.textAlign='right';(o.yt||[]).forEach(v=>{g.fillText(String(v),x0-3,Y(v)+3);g.strokeStyle='rgba(255,255,255,.05)';g.beginPath();g.moveTo(x0,Y(v));g.lineTo(x0+w,Y(v));g.stroke();});
  return {X,Y,x0,y0,w,h};}


const G_N=6.6743e-11,SIGMA=5.670374e-8,WIEN=2.897771955e-3,KE=8.9875517923e9,MSUN=1.98847e30,RSUN=6.957e8,LSUN=3.828e26,AU=1.495978707e11,LY=9.4607e15,PC=3.0857e16,ME_=9.1093837e-31,QE=1.602176634e-19;
const BODIES=[['დედამიწა',9.81],['მთვარე',1.62],['მარსი',3.71],['იუპიტერი',24.79],['მზე',274]];

/* ═══════════════════ 1. PROJECTILE MOTION ═══════════════════ */
reg({id:'proj',ico:'🏹',t:'კინემატიკა: სროლა',s:'ტრაექტორია · ჰაერის წინააღმდეგობა · პლანეტები',
 build(root){
  root.innerHTML=`<div id="pjC"></div><div class="arow"><div class="acol"><div class="actl">${sl('pjV','საწყისი სიჩქარე v₀',5,60,0.5,25,'მ/წმ')}${sl('pjA','კუთხე α',5,85,1,45,'°')}
    <div>პლანეტა: ${btns('pjG',BODIES.map((b,i)=>[i,b[0]]),0)}</div><label class="hint"><input type="checkbox" id="pjD"> ჰაერის წინააღმდეგობა (k ∝ v²)</label>
    <div class="abt"><button id="pjF" class="on">🚀 სროლა</button><button id="pjX">✕ კვალის წაშლა</button></div></div></div><div class="acol"><div id="pjI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['x = v₀·cosα·t','ჰორიზონტალური მოძრაობა თანაბარია',{s:[['v₀','საწყისი სიჩქარე'],['α','სროლის კუთხე'],['t','დრო']],w:'ჰორიზონტალურად ძალა არ მოქმედებს (ჰაერის გარეშე), ამიტომ სიჩქარის ეს მდგენელი არ იცვლება.'}],
     ['y = v₀·sinα·t − g·t²/2','ვერტიკალური — თანაბრად შენელებული',{s:[['g','თავისუფალი ვარდნის აჩქარება']],w:'გრავიტაცია ყოველ წამში ვერტიკალურ სიჩქარეს g-ით ამცირებს. ორი დამოუკიდებელი მოძრაობის ჯამი პარაბოლას იძლევა.'}],
     ['R = v₀²·sin2α / g','სროლის სიშორე',{s:[['R','მანძილი ვარდნამდე']],w:'sin2α მაქსიმალურია α = 45°-ზე. 30° და 60° ერთსა და იმავე მანძილს იძლევა.'}],['H = v₀²·sin²α / 2g','მაქსიმალური სიმაღლე',{s:[['H','ზედა წერტილი']],w:'მაღლა აჭრისას მთელი ვერტიკალური კინეტიკური ენერგია პოტენციურად გადაიქცევა.'}],
     ['T = 2·v₀·sinα / g','ფრენის დრო',{s:[['T','ჰაერში ყოფნის დრო']],w:'ასვლის დრო ჩამოსვლის დროის ტოლია.'}],['v = v₀ + a·t','სიჩქარე თანაბარაჩქარებულ მოძრაობაში',{s:[['a','აჩქარება']],w:'აჩქარება — სიჩქარის ცვლილება წამში.'}],
     ['s = v₀·t + a·t²/2','გავლილი მანძილი',{s:[['s','გადაადგილება']],w:'საშუალო სიჩქარე გამრავლებული დროზე.'}],['v² = v₀² + 2·a·s','დროის გარეშე',{s:[],w:'როცა დრო უცნობია: მაგ. რა სიჩქარით დაეცემა 20 მ სიმაღლიდან ქვა — √(2·9.81·20) ≈ 19.8 მ/წმ.'}]]))}`;
  const c=canvas($('pjC'),900,360),g=c.g;let v0=25,al=45,gi=0,drag=false,shots=[],cur=null;
  bindSl('pjV',v=>v0=v);bindSl('pjA',v=>al=v);bindBtns(root,'pjG',k=>gi=+k);$('pjD').onchange=e=>drag=e.target.checked;
  const fire=()=>{const a=al*Math.PI/180;cur={x:0,y:0,vx:v0*Math.cos(a),vy:v0*Math.sin(a),t:0,pts:[[0,0]],col:`hsl(${(shots.length*67)%360},80%,65%)`,g:BODIES[gi][1],drag,done:false,H:0};shots.push(cur);if(shots.length>8)shots.shift();};
  $('pjF').onclick=fire;$('pjX').onclick=()=>{shots=[];cur=null;};fire();
  anim((dt,T)=>{const gg=BODIES[gi][1],a=al*Math.PI/180;
    for(const s of shots){if(s.done)continue;for(let k=0;k<8;k++){const h=dt*1.2/8;const sp=Math.hypot(s.vx,s.vy),kd=s.drag?0.012:0;s.vx+=-kd*sp*s.vx*h;s.vy+=(-s.g-kd*sp*s.vy)*h;s.x+=s.vx*h;s.y+=s.vy*h;s.t+=h;s.H=Math.max(s.H,s.y);
      if(s.y<0){s.y=0;s.done=true;break;}}s.pts.push([s.x,s.y]);}
    const Rth=v0*v0*Math.sin(2*a)/gg,Hth=v0*v0*Math.sin(a)**2/(2*gg);const mx=Math.max(Rth*1.15,20,...shots.map(s=>s.x*1.05)),my=Math.max(Hth*1.3,10,...shots.map(s=>s.H*1.2));
    const sc=Math.min((g.W-60)/mx,(g.H-50)/my),X=x=>30+x*sc,Y=y=>g.H-26-y*sc;
    g.clearRect(0,0,g.W,g.H);const sky=g.createLinearGradient(0,0,0,g.H);sky.addColorStop(0,'#0c1030');sky.addColorStop(1,'#1a1430');g.fillStyle=sky;g.fillRect(0,0,g.W,g.H);
    g.fillStyle=['#2a4a2a','#555','#7a3a22','#8a6a40','#a05a10'][gi];g.fillRect(0,g.H-26,g.W,26);
    for(let m=0;m<=mx;m+=Math.pow(10,Math.floor(Math.log10(mx)))){g.fillStyle=COL.dim;g.font='10px sans-serif';g.textAlign='center';g.fillText(m.toFixed(0)+' მ',X(m),g.H-10);}
    /* theoretical parabola (no drag) */
    g.setLineDash([4,4]);g.strokeStyle='rgba(201,168,76,.35)';g.beginPath();for(let i=0;i<=80;i++){const x=Rth*i/80,t=x/(v0*Math.cos(a)),y=v0*Math.sin(a)*t-gg*t*t/2;i?g.lineTo(X(x),Y(y)):g.moveTo(X(x),Y(y));}g.stroke();g.setLineDash([]);
    for(const s of shots){g.strokeStyle=s.col;g.lineWidth=2.2;g.beginPath();s.pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.stroke();
      const q=s.pts[s.pts.length-1];g.fillStyle=s.col;g.shadowColor=s.col;g.shadowBlur=12;g.beginPath();g.arc(X(q[0]),Y(q[1]),5,0,TAU);g.fill();g.shadowBlur=0;
      if(!s.done){const vl=0.6;g.strokeStyle='#7fd8ff';g.lineWidth=1.5;g.beginPath();g.moveTo(X(q[0]),Y(q[1]));g.lineTo(X(q[0]+s.vx*vl),Y(q[1]+s.vy*vl));g.stroke();
        g.strokeStyle='#e8705a';g.beginPath();g.moveTo(X(q[0]),Y(q[1]));g.lineTo(X(q[0]+s.vx*vl),Y(q[1]));g.stroke();g.strokeStyle='#6fcf8a';g.beginPath();g.moveTo(X(q[0]),Y(q[1]));g.lineTo(X(q[0]),Y(q[1]+s.vy*vl));g.stroke();}}
    /* cannon */
    g.save();g.translate(X(0),Y(0));g.rotate(-a);g.fillStyle='#c9a84c';g.fillRect(-4,-5,30,10);g.restore();g.fillStyle='#806030';g.beginPath();g.arc(X(0),Y(0),9,0,TAU);g.fill();
    g.fillStyle=COL.mid;g.font='10px sans-serif';g.textAlign='left';g.fillText('ცისფერი — სიჩქარე · წითელი — ჰორიზ. (მუდმივი) · მწვანე — ვერტ. (იცვლება) · წყვეტილი — თეორია ჰაერის გარეშე',10,14);
    const last=shots[shots.length-1];
    $('pjI').innerHTML=`<div class="kv2"><b>თეორიული სიშორე R</b><span>${Rth.toFixed(2)} მ</span><b>მაქს. სიმაღლე H</b><span>${Hth.toFixed(2)} მ</span><b>ფრენის დრო T</b><span>${(2*v0*Math.sin(a)/gg).toFixed(2)} წმ</span>
     ${last?`<b>ბოლო სროლა</b><span>${last.x.toFixed(2)} მ · ${last.t.toFixed(2)} წმ${last.drag?' (ჰაერით — მოკლე და ასიმეტრიული)':''}</span>`:''}<b>g</b><span>${gg} მ/წმ² (${BODIES[gi][0]})</span></div><div class="hint">სცადე 30° და 60° — ერთნაირი სიშორე! მთვარეზე იგივე სროლა ${(9.81/1.62).toFixed(1)}-ჯერ შორს მიდის.</div>`;
  });
 }});

/* ═══════════════════ 2. ENERGY — roller coaster ═══════════════════ */
reg({id:'energy',ico:'🎢',t:'ენერგია და ნიუტონის კანონები',s:'ამერიკული მთები · ენერგიის შენახვა · ხახუნი',
 build(root){
  root.innerHTML=`<div id="enC"></div><div class="arow"><div class="acol"><div class="actl">${sl('enM','მასა m',0.5,10,0.5,2,'კგ')}${sl('enMu','ხახუნი μ',0,0.15,0.005,0.02)}${sl('enH','საწყისი სიმაღლე',2,10,0.1,8,'მ')}<div class="abt"><button id="enR">↺ თავიდან</button></div></div></div><div class="acol"><div id="enI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['F = m·a','ნიუტონის II კანონი',{s:[['F','ძალა, ნიუტონი'],['m','მასა, კგ'],['a','აჩქარება, მ/წმ²']],w:'რაც მძიმეა სხეული, მით მეტი ძალაა საჭირო მის ასაჩქარებლად. I კანონი: ძალის გარეშე სხეული ინარჩუნებს მოძრაობას; III: ქმედება = უკუქმედება.'}],
     ['E<sub>k</sub> = m·v²/2','კინეტიკური ენერგია',{s:[['v','სიჩქარე']],w:'სიჩქარის გაორმაგება ენერგიას ოთხჯერ ზრდის — ამიტომაა ჩქაროსნული ავარია ასე საშიში.'}],['E<sub>p</sub> = m·g·h','პოტენციური ენერგია',{s:[['h','სიმაღლე']],w:'სიმაღლეზე აწეული სხეული ენერგიას „ინახავს“ — ვარდნისას ის კინეტიკურად იქცევა.'}],
     ['E<sub>k</sub> + E<sub>p</sub> + Q = const','ენერგიის შენახვა',{s:[['Q','ხახუნით გამოყოფილი სითბო']],w:'ენერგია არ ქრება — ხახუნი მას სითბოდ აქცევს. ამიტომ ვაგონი ვერასდროს ავა საწყის სიმაღლეზე მაღლა.'}],
     ['F<sub>ხახ.</sub> = μ·N','ხახუნის ძალა',{s:[['μ','ხახუნის კოეფიციენტი'],['N','საყრდენის რეაქცია']],w:'ხახუნი ზედაპირების უსწორმასწორობიდან მოდის. ყინულზე μ ≈ 0.03, რეზინა ასფალტზე ≈ 0.8.'}],
     ['W = F·s·cosα','მუშაობა',{s:[['W','მუშაობა, ჯოული'],['s','გადაადგილება'],['α','კუთხე ძალასა და მოძრაობას შორის']],w:'მუშაობა მხოლოდ მოძრაობის მიმართულებით მოქმედი ძალის ნაწილია.'}],['P = W/t = F·v','სიმძლავრე',{s:[['P','ვატი'],['t','დრო']],w:'რამდენად სწრაფად სრულდება მუშაობა. 1 ცხენის ძალა ≈ 746 ვტ.'}],
     ['v = √(2·g·h)','ვარდნის სიჩქარე',{s:[],w:'ენერგიის შენახვიდან: m·g·h = m·v²/2 — მასა იკვეცება! მძიმე და მსუბუქი ერთნაირი სიჩქარით ვარდება (ჰაერის გარეშე).'}]]))}`;
  const c=canvas($('enC'),900,330),g=c.g;let m=2,mu=0.02,h0=8,s=0,v=0,Q=0;
  const H=x=>{const a=h0*(1+Math.cos(Math.min(x,0.35)/0.35*Math.PI))/2;if(x<0.35)return a;const u=(x-0.35)/0.65;return 0.15+(h0*0.62)*(0.5-0.5*Math.cos(u*Math.PI*2*1.5))*(1-u*0.45);};
  const L=900;const reset=()=>{s=0.25;v=0;Q=0;};bindSl('enM',x=>m=x);bindSl('enMu',x=>mu=x);bindSl('enH',x=>{h0=x;reset();});$('enR').onclick=reset;reset();
  anim((dt)=>{const gg=9.81,SC=40;/* track length in metres = L/SC horizontally */
    for(let k=0;k<20;k++){const h=dt/20,x=s/(L/SC),e=1e-4,sl2=(H(Math.min(1,x+e))-H(Math.max(0,x-e)))/(2*e)/(L/SC),cos=1/Math.sqrt(1+sl2*sl2),sin=sl2*cos;
      const a=-gg*sin-Math.sign(v)*mu*gg*cos;v+=a*h;const ds=v*h*cos;s+=ds;Q+=Math.abs(mu*m*gg*cos*v*h);
      if(s<0){s=0;v=Math.abs(v)*0.3;}if(s>L/SC){s=L/SC;v=-Math.abs(v)*0.3;}}
    const x=s/(L/SC),hh=H(x),Ek=m*v*v/2,Ep=m*gg*hh,E0=m*gg*h0;
    g.clearRect(0,0,g.W,g.H);const sky=g.createLinearGradient(0,0,0,g.H);sky.addColorStop(0,'#101436');sky.addColorStop(1,'#20162e');g.fillStyle=sky;g.fillRect(0,0,g.W,g.H);
    const Y=hh2=>g.H-30-hh2*26;g.beginPath();for(let i=0;i<=300;i++){const xx=i/300;i?g.lineTo(xx*(g.W-120)+20,Y(H(xx))):g.moveTo(20,Y(H(0)));}
    g.lineTo(g.W-100,g.H);g.lineTo(20,g.H);g.closePath();g.fillStyle='rgba(201,168,76,.08)';g.fill();
    g.beginPath();for(let i=0;i<=300;i++){const xx=i/300;i?g.lineTo(xx*(g.W-120)+20,Y(H(xx))):g.moveTo(20,Y(H(0)));}g.strokeStyle=COL.gold;g.lineWidth=3;g.stroke();
    for(let i=0;i<=30;i++){const xx=i/30;g.strokeStyle='rgba(201,168,76,.18)';g.lineWidth=1;g.beginPath();g.moveTo(xx*(g.W-120)+20,Y(H(xx)));g.lineTo(xx*(g.W-120)+20,g.H);g.stroke();}
    const cx=x*(g.W-120)+20,cy=Y(hh);g.fillStyle='#e8705a';g.shadowColor='#e8705a';g.shadowBlur=14;g.beginPath();g.arc(cx,cy-8,8,0,TAU);g.fill();g.shadowBlur=0;
    g.setLineDash([3,4]);g.strokeStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(20,Y(h0));g.lineTo(g.W-100,Y(h0));g.stroke();g.setLineDash([]);g.fillStyle=COL.dim;g.font='10px sans-serif';g.textAlign='left';g.fillText('საწყისი სიმაღლე',24,Y(h0)-4);
    /* energy bars */
    const bx=g.W-86,bh=g.H-60,bars=[['Eₖ',Ek,'#7fd8ff'],['Eₚ',Ep,'#6fcf8a'],['Q',Q,'#e8705a']];
    bars.forEach(([l,val,col],i)=>{const hgt=bh*val/E0;g.fillStyle=col;g.fillRect(bx+i*26,g.H-30-hgt,20,hgt);g.fillStyle=COL.ink;g.textAlign='center';g.fillText(l,bx+i*26+10,g.H-16);});
    g.strokeStyle='rgba(255,255,255,.4)';g.beginPath();g.moveTo(bx-4,g.H-30-bh);g.lineTo(bx+78,g.H-30-bh);g.stroke();g.fillStyle=COL.mid;g.fillText('E₀',bx-12,g.H-30-bh+3);
    $('enI').innerHTML=`<div class="kv2"><b>სიჩქარე</b><span>${Math.abs(v).toFixed(2)} მ/წმ (${(Math.abs(v)*3.6).toFixed(1)} კმ/სთ)</span><b>სიმაღლე</b><span>${hh.toFixed(2)} მ</span><b>Eₖ</b><span>${Ek.toFixed(1)} ჯ</span><b>Eₚ</b><span>${Ep.toFixed(1)} ჯ</span><b>სითბო Q</b><span>${Q.toFixed(1)} ჯ</span><b>ჯამი</b><span>${(Ek+Ep+Q).toFixed(1)} ჯ ≈ E₀ = ${E0.toFixed(1)} ჯ ✓</span></div><div class="hint">ხახუნის გარეშე (μ = 0) ვაგონი სამუდამოდ იქანავებს. სიჩქარე მასაზე არ არის დამოკიდებული!</div>`;
  });
 }});

/* ═══════════════════ 3. COLLISIONS — momentum ═══════════════════ */
reg({id:'coll',ico:'💥',t:'შეჯახება და იმპულსი',s:'დრეკადი · არადრეკადი · იმპულსის შენახვა',
 build(root){
  root.innerHTML=`<div id="clC"></div><div class="arow"><div class="acol"><div class="actl">${sl('clM1','m₁',0.5,10,0.5,2,'კგ')}${sl('clM2','m₂',0.5,10,0.5,5,'კგ')}${sl('clV1','v₁',-5,8,0.5,4,'მ/წმ')}${sl('clV2','v₂',-8,5,0.5,-1,'მ/წმ')}${sl('clE','დრეკადობა e',0,1,0.05,1)}
    <div class="abt"><button id="clR" class="on">↺ თავიდან</button></div></div></div><div class="acol"><div id="clI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['p = m·v','იმპულსი',{s:[['p','იმპულსი, კგ·მ/წმ']],w:'„მოძრაობის რაოდენობა“: მძიმე ნელი და მსუბუქი სწრაფი სხეული შეიძლება ერთნაირად „ძლიერი“ იყოს.'}],
     ['m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′','იმპულსის შენახვა',{s:[['′','შეჯახების შემდეგ']],w:'ჩაკეტილ სისტემაში ჯამური იმპულსი არ იცვლება — ნებისმიერი შეჯახებისას, დრეკადისაც და არადრეკადისაც. ასე მუშაობს რაკეტა.'}],
     ['e = (v₂′ − v₁′)/(v₁ − v₂)','აღდგენის კოეფიციენტი',{s:[['e','1 — დრეკადი, 0 — სრულიად არადრეკადი (ერთად მიდიან)']],w:'რამდენად „ხტება“ სხეული. ბილიარდის ბურთი ≈ 0.95, პლასტილინი ≈ 0.'}],
     ['F·Δt = Δp','ძალის იმპულსი',{s:[['Δt','შეჯახების ხანგრძლივობა']],w:'ერთი და იგივე Δp-ს დიდ დროში გაშლა ძალას ამცირებს — ამიტომ აქვს მანქანას აირბალიში და ამიტომ ეშვება მოხრილ მუხლებზე მხტუნავი.'}],
     ['v′ = (m₁v₁ + m₂v₂)/(m₁ + m₂)','სრულიად არადრეკადი',{s:[],w:'ორი სხეული ერთად მიდის; კინეტიკური ენერგიის ნაწილი სითბოდ და დეფორმაციად იქცევა.'}]]))}`;
  const c=canvas($('clC'),900,230),g=c.g;let P={},st=null,hist=[];
  const reset=()=>{st={x1:200,x2:600,v1:P.v1,v2:P.v2,hit:false,pre:null,post:null};hist=[];};
  ['clM1','clM2','clV1','clV2','clE'].forEach(id=>bindSl(id,v=>{P[{clM1:'m1',clM2:'m2',clV1:'v1',clV2:'v2',clE:'e'}[id]]=v;if(st&&!st.hit)reset();}));$('clR').onclick=reset;reset();
  anim(dt=>{const sc=40,w1=22+P.m1*5,w2=22+P.m2*5;st.x1+=st.v1*sc*dt*0.5;st.x2+=st.v2*sc*dt*0.5;
    if(!st.hit&&st.x2-st.x1<=(w1+w2)/2){const {m1,m2,e}=P,u1=st.v1,u2=st.v2;st.pre={p:m1*u1+m2*u2,k:m1*u1*u1/2+m2*u2*u2/2};
      st.v1=(m1*u1+m2*u2+m2*e*(u2-u1))/(m1+m2);st.v2=(m1*u1+m2*u2+m1*e*(u1-u2))/(m1+m2);st.hit=true;st.post={p:m1*st.v1+m2*st.v2,k:m1*st.v1*st.v1/2+m2*st.v2*st.v2/2};st.flash=1;}
    if(st.x1<-100||st.x2>1000||st.x1>1000||st.x2<-100)reset();
    g.clearRect(0,0,g.W,g.H);g.fillStyle='#151026';g.fillRect(0,0,g.W,g.H);g.fillStyle='#2a2140';g.fillRect(0,170,g.W,6);
    const cart=(x,w,col,m,v,lab)=>{g.fillStyle=col;g.fillRect(x-w/2,170-w,w,w);g.fillStyle='#000';g.beginPath();g.arc(x-w/3,172,5,0,TAU);g.arc(x+w/3,172,5,0,TAU);g.fill();
      g.fillStyle='#fff';g.font='600 12px sans-serif';g.textAlign='center';g.fillText(`${lab} ${m} კგ`,x,170-w-24);
      g.strokeStyle='#7fd8ff';g.lineWidth=3;g.beginPath();g.moveTo(x,170-w-12);g.lineTo(x+v*14,170-w-12);g.stroke();if(Math.abs(v)>0.05){g.fillStyle='#7fd8ff';g.beginPath();const ex=x+v*14,dd=Math.sign(v);g.moveTo(ex,170-w-12);g.lineTo(ex-7*dd,170-w-17);g.lineTo(ex-7*dd,170-w-7);g.fill();}
      g.fillStyle=COL.mid;g.font='11px sans-serif';g.fillText(`${v.toFixed(2)} მ/წმ`,x,195);};
    cart(st.x1,w1,'#e8705a',P.m1,st.v1,'①');cart(st.x2,w2,'#5a9ae8',P.m2,st.v2,'②');
    if(st.flash>0){st.flash-=dt*2;g.fillStyle=`rgba(255,240,150,${st.flash})`;g.beginPath();g.arc((st.x1+st.x2)/2,150,30*(1.5-st.flash),0,TAU);g.fill();}
    const p=P.m1*st.v1+P.m2*st.v2,k=P.m1*st.v1**2/2+P.m2*st.v2**2/2;
    $('clI').innerHTML=`<div class="kv2"><b>ჯამური იმპულსი p</b><span>${p.toFixed(2)} კგ·მ/წმ ${st.hit?'(შეჯახებამდეც '+st.pre.p.toFixed(2)+') ✓':''}</span><b>კინეტიკური ენერგია</b><span>${k.toFixed(2)} ჯ ${st.hit?`(იყო ${st.pre.k.toFixed(2)} — სითბოდ იქცა ${(st.pre.k-st.post.k).toFixed(2)} ჯ)`:''}</span></div><div class="hint">იმპულსი ყოველთვის ინახება; ენერგია — მხოლოდ დრეკად (e = 1) შეჯახებაში. სცადე: m₁ = m₂, e = 1 — ბურთები სიჩქარეებს „გაცვლიან“ (ნიუტონის საქანელა).</div>`;
  });
 }});

/* ═══════════════════ 4. OSCILLATIONS — pendulum & spring ═══════════════════ */
reg({id:'osc',ico:'🕰',t:'რხევები',s:'ქანქარა · ზამბარა · ფაზური სივრცე · რეზონანსი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="osP"></div><div class="actl">${sl('osL','ძაფის სიგრძე L',0.2,3,0.05,1,'მ')}${sl('osA','საწყისი გადახრა',5,175,1,40,'°')}${sl('osD','მილევა',0,0.5,0.01,0.03)}<div class="abt"><button id="osR">↺</button></div></div></div>
   <div class="acol"><div id="osF"></div><div id="osI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['T = 2π·√(L/g)','ქანქარის პერიოდი (მცირე კუთხეები)',{s:[['T','ერთი სრული რხევის დრო'],['L','ძაფის სიგრძე'],['g','9.81 მ/წმ²']],w:'პერიოდი არ არის დამოკიდებული არც მასაზე, არც (მცირე) ამპლიტუდაზე — გალილეიმ ეკლესიის ჭაღზე შენიშნა. ამიტომ ითვლიდა დროს ქანქარიანი საათი.'}],
     ['T = 2π·√(m/k)','ზამბარის პერიოდი',{s:[['m','მასა'],['k','ზამბარის სიხისტე, ნ/მ']],w:'მძიმე ტვირთი ნელა რხევა, ხისტი ზამბარა — სწრაფად.'}],['F = −k·x','ჰუკის კანონი',{s:[['x','გაჭიმვა']],w:'აღმდგენი ძალა გადახრის პროპორციულია და მის საწინააღმდეგოდაა მიმართული — ეს იძლევა ჰარმონიულ რხევას.'}],
     ['x(t) = A·cos(ωt + φ)','ჰარმონიული რხევა',{s:[['A','ამპლიტუდა'],['ω','კუთხური სიხშირე = 2π/T'],['φ','საწყისი ფაზა']],w:'სინუსოიდა — ბუნების ყველაზე გავრცელებული მოძრაობა: ბგერა, სინათლე, ატომები კრისტალში.'}],
     ['f = 1/T','სიხშირე, ჰერცი',{s:[['f','რხევა წამში']],w:'ადამიანის ყური 20–20000 ჰც-ს ისმენს.'}],['E = k·A²/2','რხევის ენერგია',{s:[],w:'ენერგია ამპლიტუდის კვადრატის პროპორციულია; მილევა მას თანდათან სითბოდ აქცევს.'}]]))}`;
  const c=canvas($('osP'),440,360),g=c.g,fc=canvas($('osF'),440,260),fg=fc.g;let L=1,th=0.7,w=0,damp=0.03,trail=[],tt=0,per=[];let last=null;
  const reset=()=>{th=+$('osA').value*Math.PI/180;w=0;trail=[];tt=0;per=[];last=null;};
  bindSl('osL',v=>L=v);bindSl('osA',()=>reset());bindSl('osD',v=>damp=v);$('osR').onclick=reset;reset();
  anim(dt=>{for(let k=0;k<20;k++){const h=dt/20;const a=-9.81/L*Math.sin(th)-damp*w;w+=a*h;th+=w*h;tt+=h;if(last!=null&&last<0&&w>=0){per.push(tt);}last=w;}
    trail.push([th,w]);if(trail.length>1500)trail.shift();
    g.clearRect(0,0,g.W,g.H);const ox=220,oy=40,len=Math.min(280,L*100),bx=ox+len*Math.sin(th),by=oy+len*Math.cos(th);
    g.fillStyle='#2a2140';g.fillRect(150,30,140,10);g.strokeStyle='#d8cfb8';g.lineWidth=1.5;g.beginPath();g.moveTo(ox,oy);g.lineTo(bx,by);g.stroke();
    const gr=g.createRadialGradient(bx-5,by-5,2,bx,by,16);gr.addColorStop(0,'#ffe8a8');gr.addColorStop(1,'#a07020');g.fillStyle=gr;g.beginPath();g.arc(bx,by,15,0,TAU);g.fill();
    g.strokeStyle='rgba(201,168,76,.25)';g.setLineDash([3,4]);g.beginPath();g.arc(ox,oy,len,Math.PI/2-1.4,Math.PI/2+1.4);g.stroke();g.setLineDash([]);
    const Ek=w*w*L*L/2,Ep=9.81*L*(1-Math.cos(th)),E=Ek+Ep||1;g.fillStyle='#7fd8ff';g.fillRect(20,g.H-30,Ek/E*120,10);g.fillStyle='#6fcf8a';g.fillRect(20,g.H-16,Ep/E*120,10);g.fillStyle=COL.mid;g.font='10px sans-serif';g.textAlign='left';g.fillText('Eₖ',145,g.H-21);g.fillText('Eₚ',145,g.H-7);
    /* phase portrait */
    fg.clearRect(0,0,fg.W,fg.H);const P=plot(fg,{x:[-3.3,3.3],y:[-8,8],xl:'კუთხე θ (რად.)',yl:'კუთხური სიჩქარე ω',m:[8,8,24,30]});
    fg.beginPath();trail.forEach((q,i)=>{const x=P.X(clamp(q[0],-3.3,3.3)),y=P.Y(clamp(q[1],-8,8));i?fg.lineTo(x,y):fg.moveTo(x,y);});fg.strokeStyle='rgba(201,168,76,.7)';fg.lineWidth=1.3;fg.stroke();
    fg.fillStyle='#fff';fg.beginPath();fg.arc(P.X(clamp(th,-3.3,3.3)),P.Y(clamp(w,-8,8)),4,0,TAU);fg.fill();
    const Tm=per.length>1?(per[per.length-1]-per[per.length-2]):null,T0=2*Math.PI*Math.sqrt(L/9.81);
    $('osI').innerHTML=`<div class="kv2"><b>T (მცირე კუთხის ფორმულა)</b><span>${T0.toFixed(3)} წმ</span><b>T (გაზომილი სიმულაციაში)</b><span>${Tm?Tm.toFixed(3)+' წმ':'…'}</span></div><div class="hint">ფაზურ სივრცეში რხევა ელიფსს ხაზავს, მილევისას — სპირალს. დიდ კუთხეებზე (> 40°) პერიოდი იზრდება — ფორმულა მხოლოდ მიახლოებაა. 180°-თან ახლოს ქანქარა თითქმის „ჩერდება“ თავზე.</div>`;
  });
 }});

/* ═══════════════════ 5. WAVES — interference & Doppler ═══════════════════ */
reg({id:'waves',ico:'🌊',t:'ტალღები',s:'ინტერფერენცია · მდგარი ტალღა · დოპლერი',
 build(root){
  root.innerHTML=`<div class="actl">${btns('wvM',[['int','ორი წყაროს ინტერფერენცია'],['std','მდგარი ტალღა'],['dop','დოპლერის ეფექტი']],'int')}</div><div id="wvC"></div><div class="actl" id="wvCtl"></div><div id="wvI" class="ainfo"></div>
   ${card('ფორმულები',FX([['v = λ·f','ტალღის სიჩქარე',{s:[['v','სიჩქარე'],['λ','ტალღის სიგრძე'],['f','სიხშირე']],w:'ერთ რხევაში ტალღა ერთი ტალღის სიგრძით წინ მიიწევს. ბგერა ჰაერში ≈ 343 მ/წმ, სინათლე — 300 000 კმ/წმ.'}],
     ['Δd = k·λ → მაქსიმუმი; Δd = (k+½)·λ → მინიმუმი','ინტერფერენცია',{s:[['Δd','გზათა სხვაობა ორი წყაროდან']],w:'თუ ორი ტალღის ქედი ერთად მოდის — ძლიერდება; თუ ქედი ღრმულს ხვდება — ქრება. ასე მუშაობს ხმაურის ჩამხშობი ყურსასმენი.'}],
     ['L = n·λ/2','მდგარი ტალღა სიმზე',{s:[['L','სიმის სიგრძე'],['n','ჰარმონიკის ნომერი']],w:'სიმზე მხოლოდ ის ტალღები „ცოცხლობს“, რომელთა ნახევრების მთელი რიცხვიც ეტევა — ამიტომ აქვს ყველა საკრავს თავისი ტემბრი (ობერტონები).'}],
     ['f′ = f·(v ± v<sub>მ</sub>)/(v ∓ v<sub>წ</sub>)','დოპლერის ეფექტი',{s:[['v<sub>წ</sub>','წყაროს სიჩქარე'],['v<sub>მ</sub>','მსმენელის სიჩქარე']],w:'მოახლოებული სირენის ტალღები „იკუმშება“ — ბგერა მაღალია, დაშორებისას დაბალი. ვარსკვლავების წითელი წანაცვლებით ვიგებთ, რომ სამყარო ფართოვდება.'}],
     ['sinθ = v/v<sub>წ</sub>','მახის კონუსი',{s:[],w:'როცა წყარო ტალღაზე სწრაფია, ტალღები ერთად გროვდება — დარტყმითი ტალღა (ზებგერითი თვითმფრინავის „აფეთქება“).'}]]))}`;
  const c=canvas($('wvC'),900,380),g=c.g;let mode='int',P={d:120,lam:28,v:0.5,n:3},tt=0,img=null,src=[],srcT=0;
  const ctl=()=>{$('wvCtl').innerHTML=mode==='int'?sl('wvD','წყაროებს შორის მანძილი',20,300,2,P.d,'პქ')+sl('wvL','ტალღის სიგრძე λ',10,60,1,P.lam,'პქ'):mode==='std'?sl('wvN','ჰარმონიკა n',1,8,1,P.n):sl('wvV','წყაროს სიჩქარე (ბგერის სიჩქარის წილი)',0,1.6,0.02,P.v);
    if(mode==='int'){bindSl('wvD',v=>P.d=v);bindSl('wvL',v=>P.lam=v);}else if(mode==='std')bindSl('wvN',v=>P.n=v);else bindSl('wvV',v=>{P.v=v;src=[];});};
  bindBtns(root,'wvM',k=>{mode=k;ctl();src=[];});ctl();
  const RW=300,RH=127;const off=document.createElement('canvas');off.width=RW;off.height=RH;const og=off.getContext('2d');const id=og.createImageData(RW,RH);
  anim(dt=>{tt+=dt;g.clearRect(0,0,g.W,g.H);
    if(mode==='int'){const k=TAU/(P.lam/3),w=4,s1=[RW/2-P.d/6,RH*0.12],s2=[RW/2+P.d/6,RH*0.12];
      for(let y=0;y<RH;y++)for(let x=0;x<RW;x++){const r1=Math.hypot(x-s1[0],y-s1[1]),r2=Math.hypot(x-s2[0],y-s2[1]);const a=(Math.sin(k*r1-w*tt)/Math.sqrt(1+r1*0.05)+Math.sin(k*r2-w*tt)/Math.sqrt(1+r2*0.05));
        const v=clamp((a+2)/4,0,1),i=(y*RW+x)*4;id.data[i]=20+v*60;id.data[i+1]=40+v*150;id.data[i+2]=90+v*165;id.data[i+3]=255;}
      og.putImageData(id,0,0);g.imageSmoothingEnabled=true;g.drawImage(off,0,0,g.W,g.H);
      [s1,s2].forEach(s=>{g.fillStyle='#ffe8a8';g.beginPath();g.arc(s[0]*3,s[1]*3,6,0,TAU);g.fill();});
      $('wvI').innerHTML=`ნათელი და მუქი „სხივები“ — მაქსიმუმები და მინიმუმები. მანძილის გაზრდით ან λ-ს შემცირებით სხივები მრავლდება: მაქსიმუმების რაოდენობა ≈ 2·d/λ + 1 = <b>${Math.floor(2*P.d/P.lam)+1}</b>. ასე დაამტკიცა იუნგმა 1801-ში, რომ სინათლე ტალღაა.`;}
    else if(mode==='std'){const y0=g.H/2,Lx=g.W-80,n=P.n,A=110;g.strokeStyle='rgba(201,168,76,.25)';g.beginPath();g.moveTo(40,y0);g.lineTo(40+Lx,y0);g.stroke();
      for(let ghost=0;ghost<8;ghost++){const ph=ghost/8*TAU;g.strokeStyle=`rgba(95,200,216,${0.08})`;g.beginPath();for(let i=0;i<=400;i++){const x=i/400;const y=A*Math.sin(n*Math.PI*x)*Math.cos(ph);i?g.lineTo(40+x*Lx,y0+y):g.moveTo(40,y0+y);}g.stroke();}
      g.strokeStyle='#5fc8d8';g.lineWidth=3;g.shadowColor='#5fc8d8';g.shadowBlur=10;g.beginPath();for(let i=0;i<=400;i++){const x=i/400;const y=A*Math.sin(n*Math.PI*x)*Math.cos(tt*4);i?g.lineTo(40+x*Lx,y0+y):g.moveTo(40,y0+y);}g.stroke();g.shadowBlur=0;g.lineWidth=1;
      for(let k=0;k<=n;k++){g.fillStyle='#e8705a';g.beginPath();g.arc(40+k/n*Lx,y0,5,0,TAU);g.fill();}
      for(let k=0;k<n;k++){g.fillStyle='#6fcf8a';g.beginPath();g.arc(40+(k+0.5)/n*Lx,y0,4,0,TAU);g.fill();}
      g.fillStyle='#d8cfb8';g.fillRect(34,y0-30,6,60);g.fillRect(40+Lx,y0-30,6,60);
      $('wvI').innerHTML=`ჰარმონიკა n = ${n}: ${n+1} კვანძი (წითელი — არ მოძრაობს), ${n} პუჭური (მწვანე). სიხშირე f<sub>n</sub> = n·f₁ — გიტარის სიმის ${n===1?'ძირითადი ტონი':n+'-ე ობერტონი'}. თუ სიმის შუაზე თითს მსუბუქად შეახებ, ${n%2?'ეს ჰარმონიკა ჩაქრება':'ეს ჰარმონიკა დარჩება (შუაში კვანძია)'}.`;}
    else{srcT+=dt;const cs=110,sx=((tt*P.v*cs)%(g.W+200))-100,sy=g.H/2;if(srcT>0.18){src.push({x:sx,y:sy,t:tt});srcT=0;}src=src.filter(s=>(tt-s.t)*cs<900);
      for(const s of src){const r=(tt-s.t)*cs;g.strokeStyle=`rgba(95,200,216,${clamp(1-r/700,0,1)})`;g.lineWidth=1.5;g.beginPath();g.arc(s.x,s.y,r,0,TAU);g.stroke();}
      g.fillStyle='#e8705a';g.shadowColor='#e8705a';g.shadowBlur=15;g.beginPath();g.arc(sx,sy,8,0,TAU);g.fill();g.shadowBlur=0;
      const fr=1/(1-Math.min(P.v,0.999)),bk=1/(1+P.v);
      $('wvI').innerHTML=P.v<1?`წინ ტალღები მჭიდროა → სიხშირე <b>×${fr.toFixed(2)}</b> (მაღალი ტონი), უკან — იშვიათი → <b>×${bk.toFixed(2)}</b> (დაბალი). ${P.v===0?'წყარო უძრავია — წრეები კონცენტრულია.':''}`:`<b>ზებგერითი!</b> წყარო ტალღებს უსწრებს და მახის კონუსს ქმნის: sinθ = ${(1/P.v).toFixed(2)} → θ = ${(Math.asin(1/P.v)*180/Math.PI).toFixed(1)}°. ეს არის „ბგერითი ბარიერის“ გარღვევის ხმა.`;}
  });
 }});

/* ═══════════════════ 6. OPTICS — refraction, prism, lens ═══════════════════ */
reg({id:'optics',ico:'🔦',t:'ოპტიკა',s:'გარდატეხა · პრიზმა და ცისარტყელა · ლინზა',
 build(root){
  root.innerHTML=`<div class="actl">${btns('opM',[['snell','გარდატეხა და სრული არეკვლა'],['prism','პრიზმა — დისპერსია'],['lens','შემკრები ლინზა']],'snell')}</div><div id="opC"></div><div class="actl" id="opCtl"></div><div id="opI" class="ainfo"></div>
   ${card('ფორმულები',FX([['n = c / v','გარდატეხის მაჩვენებელი',{s:[['n','გარდატეხის მაჩვენებელი'],['c','სინათლის სიჩქარე ვაკუუმში'],['v','სიჩქარე გარემოში']],w:'სინათლე წყალში 1.33-ჯერ, ალმასში 2.42-ჯერ ნელა მოძრაობს. ალმასის „ბზინვარება“ ამ დიდი n-ის შედეგია.'}],
     ['n₁·sinα = n₂·sinβ','სნელიუსის კანონი',{s:[['α','დაცემის კუთხე'],['β','გარდატეხის კუთხე']],w:'ნელ გარემოში შესვლისას სხივი პერპენდიკულარისკენ იხრება — როგორც მანქანა, რომლის ერთი ბორბალი ქვიშაში ჩავარდა. ამიტომ ჩანს წყალში ჩაყოფილი კოვზი „გატეხილად“.'}],
     ['sinα<sub>კრ</sub> = n₂ / n₁','სრული შინაგანი არეკვლა',{s:[['α<sub>კრ</sub>','კრიტიკული კუთხე']],w:'მკვრივიდან ნაკლებად მკვრივ გარემოში გასვლისას, დიდ კუთხეზე სინათლე საერთოდ ვერ გადის და მთლიანად აირეკლება. ამაზე მუშაობს ოპტიკური ბოჭკო — ინტერნეტი!'}],
     ['n(λ) — დისპერსია','მაჩვენებელი ფერზეა დამოკიდებული',{s:[],w:'იისფერი უფრო ძლიერად გარდატყდება, ვიდრე წითელი, ამიტომ პრიზმა და წვიმის წვეთი თეთრ სინათლეს ფერებად შლის — ცისარტყელა.'}],
     ['1/f = 1/d + 1/d′','თხელი ლინზის ფორმულა',{s:[['f','ფოკუსური მანძილი'],['d','საგნამდე მანძილი'],['d′','გამოსახულებამდე']],w:'ფოკუსზე შორს მდგარი საგანი რეალურ, ამოტრიალებულ გამოსახულებას იძლევა (კამერა, თვალი); ფოკუსზე ახლოს — წარმოსახვით, გადიდებულს (გამადიდებელი შუშა).'}],
     ['Γ = d′/d','გადიდება',{s:[],w:'რამდენჯერ დიდია გამოსახულება საგანზე.'}],['D = 1/f','ოპტიკური ძალა, დიოპტრია',{s:[['D','დიოპტრია (f მეტრებში)']],w:'სათვალის „+2“ ნიშნავს შემკრებ ლინზას f = 0.5 მ.'}]]))}`;
  const c=canvas($('opC'),900,400),g=c.g;let mode='snell',P={a:40,n2:1.5,inv:false,pa:50,d:220,f:110};
  const ctl=()=>{$('opCtl').innerHTML=mode==='snell'?sl('opA','დაცემის კუთხე α',0,89,0.5,P.a,'°')+sl('opN','მეორე გარემოს n',1,2.5,0.01,P.n2)+'<label class="hint"><input type="checkbox" id="opV"'+(P.inv?' checked':'')+'> სინათლე მკვრივიდან ჰაერში (სრული არეკვლა)</label>':mode==='prism'?sl('opPA','დაცემის კუთხე',20,80,0.5,P.pa,'°'):sl('opD','საგნის მანძილი d',30,400,1,P.d,'პქ')+sl('opF','ფოკუსი f',40,200,1,P.f,'პქ');
    if(mode==='snell'){bindSl('opA',v=>P.a=v);bindSl('opN',v=>P.n2=v);$('opV').onchange=e=>P.inv=e.target.checked;}else if(mode==='prism')bindSl('opPA',v=>P.pa=v);else{bindSl('opD',v=>P.d=v);bindSl('opF',v=>P.f=v);}};
  bindBtns(root,'opM',k=>{mode=k;ctl();});ctl();
  const beam=(x1,y1,x2,y2,col,w)=>{g.strokeStyle=col;g.lineWidth=w||2.5;g.shadowColor=col;g.shadowBlur=12;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.shadowBlur=0;};
  anim((dt,T)=>{g.clearRect(0,0,g.W,g.H);g.fillStyle='#07060f';g.fillRect(0,0,g.W,g.H);
    if(mode==='snell'){const cx=450,cy=200,n1=P.inv?P.n2:1,n2=P.inv?1:P.n2,a=P.a*Math.PI/180;
      g.fillStyle=P.inv?'rgba(90,154,232,.22)':'rgba(0,0,0,0)';g.fillRect(0,0,g.W,cy);g.fillStyle=P.inv?'rgba(0,0,0,0)':'rgba(90,154,232,.22)';g.fillRect(0,cy,g.W,g.H-cy);
      g.setLineDash([4,4]);g.strokeStyle='rgba(255,255,255,.3)';g.beginPath();g.moveTo(cx,10);g.lineTo(cx,g.H-10);g.stroke();g.setLineDash([]);g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(0,cy);g.lineTo(g.W,cy);g.stroke();
      const L=260,sx=cx-L*Math.sin(a),sy=cy-L*Math.cos(a);beam(sx,sy,cx,cy,'#ff3040');
      const sb=n1*Math.sin(a)/n2;const R=Math.pow((n1-n2)/(n1+n2),2)+(sb>=1?1:0.0);const Rf=sb>=1?1:Math.min(1,Math.pow((n1*Math.cos(a)-n2*Math.sqrt(1-sb*sb))/(n1*Math.cos(a)+n2*Math.sqrt(1-sb*sb)),2)*0.5+Math.pow((n1*Math.sqrt(1-sb*sb)-n2*Math.cos(a))/(n1*Math.sqrt(1-sb*sb)+n2*Math.cos(a)),2)*0.5);
      beam(cx,cy,cx+L*Math.sin(a),cy-L*Math.cos(a),`rgba(255,48,64,${0.15+0.85*Rf})`,1+2*Rf);
      if(sb<1){const b=Math.asin(sb);beam(cx,cy,cx+L*Math.sin(b),cy+L*Math.cos(b),`rgba(255,48,64,${0.25+0.75*(1-Rf)})`,1+2*(1-Rf));
        g.strokeStyle='#ecd59a';g.lineWidth=1;g.beginPath();g.arc(cx,cy,50,Math.PI/2,Math.PI/2-b,true);g.stroke();g.fillStyle='#ecd59a';g.font='12px sans-serif';g.fillText('β = '+(b*180/Math.PI).toFixed(1)+'°',cx+30,cy+70);}
      g.strokeStyle='#ecd59a';g.lineWidth=1;g.beginPath();g.arc(cx,cy,50,-Math.PI/2-a,-Math.PI/2);g.stroke();g.fillStyle='#ecd59a';g.font='12px sans-serif';g.fillText('α = '+P.a+'°',cx-95,cy-60);
      g.fillStyle=COL.mid;g.fillText(`n₁ = ${n1}`,20,24);g.fillText(`n₂ = ${n2}`,20,cy+24);
      const crit=n1>n2?Math.asin(n2/n1)*180/Math.PI:null;
      $('opI').innerHTML=`${sb<1?`გარდატეხის კუთხე β = <b>${(Math.asin(sb)*180/Math.PI).toFixed(2)}°</b>`:'<b style="color:#ff6070">სრული შინაგანი არეკვლა!</b> სინათლე ვერ გადის'} · არეკლილი წილი ≈ ${(Rf*100).toFixed(1)}%${crit?` · კრიტიკული კუთხე ${crit.toFixed(1)}°`:''}`;}
    else if(mode==='prism'){const A=[450,70],B=[330,300],C=[570,300];g.fillStyle='rgba(180,210,255,.13)';g.strokeStyle='rgba(200,220,255,.6)';g.lineWidth=1.5;g.beginPath();g.moveTo(...A);g.lineTo(...B);g.lineTo(...C);g.closePath();g.fill();g.stroke();
      /* entry point on left face, incident angle to its normal */
      const t=0.55,E=[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t],fa=Math.atan2(B[1]-A[1],B[0]-A[0]),nrm=fa-Math.PI/2,inc=P.pa*Math.PI/180;
      const ind=[Math.cos(nrm+inc),Math.sin(nrm+inc)];/* direction pointing into prism */
      const start=[E[0]-ind[0]*320,E[1]-ind[1]*320];beam(start[0],start[1],E[0],E[1],'#ffffff',3.5);
      const cols=[[400,'#8a2be2'],[440,'#4060ff'],[480,'#00a8ff'],[520,'#30e060'],[570,'#f0f030'],[600,'#ffa020'],[650,'#ff3030']];
      for(const [wl,col] of cols){const n=1.45+30000/(wl*wl);/* Cauchy-ish, exaggerated */
        const ni=[-Math.cos(nrm),-Math.sin(nrm)],cosi=-(ind[0]*ni[0]+ind[1]*ni[1]),eta=1/n,k=1-eta*eta*(1-cosi*cosi);
        const d1=[eta*ind[0]+(eta*cosi-Math.sqrt(k))*ni[0],eta*ind[1]+(eta*cosi-Math.sqrt(k))*ni[1]];
        /* intersect with right face A–C */
        const ex=(()=>{const p=E,r=d1,q=A,s=[C[0]-A[0],C[1]-A[1]],rxs=r[0]*s[1]-r[1]*s[0];const tt2=((q[0]-p[0])*s[1]-(q[1]-p[1])*s[0])/rxs;return [p[0]+r[0]*tt2,p[1]+r[1]*tt2];})();
        beam(E[0],E[1],ex[0],ex[1],col,1.5);
        const fb=Math.atan2(C[1]-A[1],C[0]-A[0]),n2v=[Math.cos(fb-Math.PI/2),Math.sin(fb-Math.PI/2)];let nn=n2v;if(d1[0]*nn[0]+d1[1]*nn[1]<0)nn=[-nn[0],-nn[1]];
        const c2=(d1[0]*nn[0]+d1[1]*nn[1]),e2=n,k2=1-e2*e2*(1-c2*c2);if(k2<0){continue;}
        const d2=[e2*d1[0]+(Math.sqrt(k2)-e2*c2)*nn[0],e2*d1[1]+(Math.sqrt(k2)-e2*c2)*nn[1]];beam(ex[0],ex[1],ex[0]+d2[0]*500,ex[1]+d2[1]*500,col,2.5);}
      $('opI').innerHTML='თეთრი სინათლე ყველა ფერის ნარევია. მინაში იისფერი უფრო ნელა მოძრაობს (დიდი n), ამიტომ უფრო ძლიერად იხრება. ასე გაშალა ნიუტონმა 1666-ში სინათლე სპექტრად. (დისპერსია აქ თვალსაჩინოებისთვის გაძლიერებულია.)';}
    else{const cx=450,cy=200,f=P.f,d=P.d,h=60;g.strokeStyle='rgba(255,255,255,.3)';g.beginPath();g.moveTo(0,cy);g.lineTo(g.W,cy);g.stroke();
      g.strokeStyle='rgba(150,200,255,.8)';g.fillStyle='rgba(150,200,255,.15)';g.beginPath();g.ellipse(cx,cy,12,150,0,0,TAU);g.fill();g.stroke();
      [cx-f,cx+f].forEach(x=>{g.fillStyle='#e8705a';g.beginPath();g.arc(x,cy,4,0,TAU);g.fill();g.fillStyle=COL.mid;g.font='11px sans-serif';g.fillText('F',x-3,cy+18);});
      const ox=cx-d;g.strokeStyle='#6fcf8a';g.lineWidth=4;g.beginPath();g.moveTo(ox,cy);g.lineTo(ox,cy-h);g.stroke();g.fillStyle='#6fcf8a';g.beginPath();g.moveTo(ox,cy-h-10);g.lineTo(ox-7,cy-h+2);g.lineTo(ox+7,cy-h+2);g.fill();
      const di=1/(1/f-1/d),M=-di/d,ix=cx+di,ih=h*M;
      /* ray 1: parallel → through F′ ; ray 2: through centre */
      beam(ox,cy-h,cx,cy-h,'#ffd27f',1.6);const sl1=h/f;beam(cx,cy-h,g.W,cy-h+sl1*(g.W-cx),'#ffd27f',1.6);
      beam(ox,cy-h,g.W,cy-h+(h/d)*(g.W-ox),'#7fd8ff',1.6);
      if(di<0){g.setLineDash([4,4]);beam(cx,cy-h,ix,cy-ih,'rgba(255,210,127,.5)',1);beam(ox,cy-h,ix,cy-ih,'rgba(127,216,255,.5)',1);g.setLineDash([]);}
      if(isFinite(di)&&Math.abs(di)<2000){g.strokeStyle=di>0?'#e8a050':'rgba(232,160,80,.5)';g.lineWidth=4;g.setLineDash(di>0?[]:[5,4]);g.beginPath();g.moveTo(ix,cy);g.lineTo(ix,cy-ih);g.stroke();g.setLineDash([]);}
      $('opI').innerHTML=Math.abs(d-f)<1?'საგანი ფოკუსშია — სხივები პარალელურად გადის, გამოსახულება უსასრულობაშია (პროჟექტორი).':di>0?`<b>რეალური, ამოტრიალებული</b> გამოსახულება: d′ = ${di.toFixed(0)} · გადიდება ${(-M).toFixed(2)}× ${-M>1?'(პროექტორი)':'(ფოტოაპარატი, თვალი)'}`:`<b>წარმოსახვითი, პირდაპირი, გადიდებული</b> ${M.toFixed(2)}× — საგანი ფოკუსს შიგნითაა: გამადიდებელი შუშა`;}
  });
 }});

/* ═══════════════════ 7. ELECTRIC FIELD — draggable charges ═══════════════════ */
reg({id:'efield',ico:'⚡',t:'ელექტრული ველი',s:'კულონი · ველის ხაზები · პოტენციალი — გადაათრიე მუხტები',
 build(root){
  root.innerHTML=`<div id="efC"></div><div class="abt"><button id="efP">+ დადებითი</button><button id="efN">− უარყოფითი</button><button id="efD">⚡ დიპოლი</button><button id="efK">▭ კონდენსატორი</button><button id="efX">✕ გასუფთავება</button></div>
   <div class="hint">გადაათრიე მუხტები · ორჯერ დააჭირე მუხტს — ნიშანი შეიცვლება. ფერი — პოტენციალი (წითელი +, ლურჯი −), ხაზები — ველის მიმართულება, ღია რკალები — ექვიპოტენციალები.</div><div id="efI" class="ainfo"></div>
   ${card('🧮 ომის კანონი და წრედები',`<div class="calc"><label>U, ვ<input id="ohU" type="number" value="12"></label><label>R, ომი<input id="ohR" type="number" value="4"></label></div><div id="ohO" class="ainfo"></div>`)}
   ${card('ფორმულები',FX([['F = k·|q₁·q₂| / r²','კულონის კანონი',{s:[['k','8.99·10⁹ ნ·მ²/კ²'],['q','მუხტები, კულონი'],['r','მანძილი']],w:'ერთნაირი მუხტები განიზიდება, სხვადასხვა — მიიზიდება. მანძილის გაორმაგება ძალას ოთხჯერ ამცირებს — ზუსტად როგორც გრავიტაციაში.'}],
     ['E = F/q = k·q/r²','ელექტრული ველის დაძაბულობა',{s:[['E','ნ/კ ან ვ/მ']],w:'ველი — სივრცის თვისება, რომელიც ყოველ მუხტს „ეუბნება“, საით იმოძრაოს. ველის ხაზები + მუხტიდან − მუხტისკენ მიდის.'}],
     ['φ = k·q/r','პოტენციალი',{s:[['φ','ვოლტი']],w:'ძაბვა = პოტენციალების სხვაობა. ხაზები ყოველთვის ექვიპოტენციალების პერპენდიკულარულია.'}],
     ['U = I·R','ომის კანონი',{s:[['U','ძაბვა, ვ'],['I','დენი, ა'],['R','წინაღობა, ომი']],w:'ძაბვა „უბიძგებს“ ელექტრონებს, წინაღობა აფერხებს. წყლის ანალოგია: წნევა, ნაკადი და მილის სივიწროვე.'}],
     ['P = U·I = I²·R','სიმძლავრე',{s:[['P','ვატი']],w:'წინაღობაში ენერგია სითბოდ იქცევა — ასე ანათებს ნათურა და ცხელდება ჩაიდანი.'}],['R = R₁ + R₂ · 1/R = 1/R₁ + 1/R₂','მიმდევრობითი · პარალელური',{s:[],w:'პარალელური შეერთება წინაღობას ამცირებს — სახლის ყველა ხელსაწყო პარალელურადაა ჩართული.'}],
     ['C = q/U = ε·S/d','ტევადობა',{s:[['C','ფარადი'],['S','ფირფიტის ფართობი'],['d','მანძილი']],w:'კონდენსატორი მუხტს ინახავს. ფოტოაპარატის ციმციმა კონდენსატორის სწრაფი განმუხტვაა.'}]]))}`;
  const c=canvas($('efC'),900,440),g=c.g;let Q=[{x:330,y:220,q:1},{x:570,y:220,q:-1}],drag=null,dirty=true;
  const RW=225,RH=110;const off=document.createElement('canvas');off.width=RW;off.height=RH;const og=off.getContext('2d');const id=og.createImageData(RW,RH);
  const pot=(x,y)=>Q.reduce((s,c2)=>s+c2.q/Math.max(8,Math.hypot(x-c2.x,y-c2.y)),0);
  const fld=(x,y)=>{let ex=0,ey=0;for(const c2 of Q){const dx=x-c2.x,dy=y-c2.y,r2=dx*dx+dy*dy+1,r=Math.sqrt(r2);ex+=c2.q*dx/(r2*r);ey+=c2.q*dy/(r2*r);}return [ex,ey];};
  c.style.touchAction='none';
  c.addEventListener('pointerdown',e=>{const [x,y]=c.pt(e);drag=Q.find(q=>Math.hypot(q.x-x,q.y-y)<20)||null;if(drag)c.setPointerCapture(e.pointerId);});
  c.addEventListener('pointermove',e=>{if(!drag)return;const [x,y]=c.pt(e);drag.x=clamp(x,10,890);drag.y=clamp(y,10,430);dirty=true;});
  c.addEventListener('pointerup',()=>drag=null);c.addEventListener('dblclick',e=>{const [x,y]=c.pt(e);const q=Q.find(q=>Math.hypot(q.x-x,q.y-y)<20);if(q){q.q=-q.q;dirty=true;}});
  $('efP').onclick=()=>{Q.push({x:200+Math.random()*500,y:100+Math.random()*240,q:1});dirty=true;};$('efN').onclick=()=>{Q.push({x:200+Math.random()*500,y:100+Math.random()*240,q:-1});dirty=true;};
  $('efD').onclick=()=>{Q=[{x:360,y:220,q:1},{x:540,y:220,q:-1}];dirty=true;};$('efK').onclick=()=>{Q=[];for(let i=0;i<9;i++){Q.push({x:350,y:100+i*30,q:0.5});Q.push({x:550,y:100+i*30,q:-0.5});}dirty=true;};$('efX').onclick=()=>{Q=[];dirty=true;};
  const oh=()=>{const U=+$('ohU').value,R=+$('ohR').value;$('ohO').innerHTML=R>0?`I = U/R = <b>${(U/R).toFixed(3)} ა</b> · P = U·I = <b>${(U*U/R).toFixed(2)} ვტ</b> · საათში ${(U*U/R/1000).toFixed(4)} კვტ·სთ`:'';};['ohU','ohR'].forEach(i=>$(i).oninput=oh);oh();
  let tt=0;
  anim(dt=>{tt+=dt;if(dirty){for(let y=0;y<RH;y++)for(let x=0;x<RW;x++){const p=pot(x*4,y*4)*60,i=(y*RW+x)*4,v=Math.tanh(p);const eq=Math.abs(((p*3)%1+1)%1-0.5)<0.06?40:0;
        id.data[i]=v>0?30+v*200+eq:30+eq;id.data[i+1]=30+eq+Math.abs(v)*20;id.data[i+2]=v<0?40-v*200+eq:50+eq;id.data[i+3]=255;}og.putImageData(id,0,0);dirty=false;}
    g.imageSmoothingEnabled=true;g.drawImage(off,0,0,g.W,g.H);
    /* field lines from positive charges (or from negatives if no positives) */
    const pos=Q.filter(q=>q.q>0),srcs=pos.length?pos:Q.filter(q=>q.q<0),sgn=pos.length?1:-1;g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.1;
    for(const s of srcs){const nL=Math.round(16*Math.abs(s.q));for(let k=0;k<nL;k++){let x=s.x+Math.cos(k/nL*TAU)*10,y=s.y+Math.sin(k/nL*TAU)*10;g.beginPath();g.moveTo(x,y);
      for(let st=0;st<600;st++){const [ex,ey]=fld(x,y),m=Math.hypot(ex,ey)||1;x+=sgn*ex/m*3;y+=sgn*ey/m*3;g.lineTo(x,y);if(x<0||x>900||y<0||y>440)break;if(Q.some(q=>q.q*sgn<0&&Math.hypot(q.x-x,q.y-y)<8))break;}g.stroke();
      /* arrowhead moving along the line */}}
    for(const q of Q){const col=q.q>0?'#ff6050':'#5090ff';const gr=g.createRadialGradient(q.x,q.y,2,q.x,q.y,16);gr.addColorStop(0,'#fff');gr.addColorStop(0.4,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,16,0,TAU);g.fill();
      g.fillStyle='#fff';g.font='bold 16px sans-serif';g.textAlign='center';g.fillText(q.q>0?'+':'−',q.x,q.y+5);}
    $('efI').innerHTML=`მუხტები: ${Q.length} · ჯამური მუხტი ${Q.reduce((s,q)=>s+q.q,0).toFixed(1)}. კონდენსატორში ფირფიტებს შორის ველი თითქმის ერთგვაროვანია — ხაზები პარალელურია.`;
  });
 }});

/* ═══════════════════ 8. MAGNETISM — Lorentz force ═══════════════════ */
reg({id:'magnet',ico:'🧲',t:'მაგნეტიზმი',s:'ლორენცის ძალა · ციკლოტრონი · პოლარული ციალი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="mgC"></div></div><div class="acol"><div class="actl">${sl('mgB','მაგნიტური ველი B',0.1,2,0.05,0.8,'ტ')}${sl('mgV','სიჩქარე v',0.2,3,0.05,1.2)}${sl('mgZ','სიჩქარე ველის გასწვრივ',0,1,0.05,0.25)}
    <div>ნაწილაკი: ${btns('mgP',[['e','ელექტრონი'],['p','პროტონი'],['a','α-ნაწილაკი']],'p')}</div></div><div id="mgI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['F = q·v·B·sinα','ლორენცის ძალა',{s:[['q','მუხტი'],['v','სიჩქარე'],['B','მაგნიტური ინდუქცია, ტესლა'],['α','კუთხე v-სა და B-ს შორის']],w:'მაგნიტური ძალა ყოველთვის სიჩქარის პერპენდიკულარულია — ის ნაწილაკს ატრიალებს, მაგრამ არ აჩქარებს. ველის გასწვრივ მოძრაობაზე არ მოქმედებს — ამიტომ მოძრაობა სპირალურია.'}],
     ['r = m·v / (|q|·B)','წრეწირის რადიუსი',{s:[['m','მასა']],w:'მძიმე ნაწილაკი უფრო დიდ წრეს ხაზავს. ამით იყოფა იზოტოპები მას-სპექტრომეტრში.'}],['T = 2π·m / (|q|·B)','ბრუნვის პერიოდი',{s:[],w:'პერიოდი სიჩქარეზე არ არის დამოკიდებული! ამაზე მუშაობს ციკლოტრონი — ნაწილაკთა ამაჩქარებელი.'}],
     ['ε = −ΔΦ/Δt','ფარადეის ინდუქციის კანონი',{s:[['ε','ინდუცირებული ემძ'],['Φ','მაგნიტური ნაკადი']],w:'ცვალებადი მაგნიტური ველი დენს ბადებს — ასე გამოიმუშავებს ელექტროენერგიას ყველა ელექტროსადგური და ასე მუშაობს ინდუქციური ქურა.'}],
     ['B = μ₀·I / (2π·r)','სადენის ველი',{s:[['μ₀','4π·10⁻⁷'],['I','დენი']],w:'დენი მაგნიტურ ველს ქმნის (ორსტედი, 1820) — ელექტრომაგნიტის, ძრავის და დინამიკის საფუძველი.'}]]))}`;
  const c=canvas($('mgC'),440,420),S=S3(c,{scale:42,spin:0.25,pitch:0.3});let B=0.8,v=1.2,vz=0.25,pt='p',st=null,trail=[];
  const PT={e:[-1,1/1836,'#7fd8ff','ელექტრონი'],p:[1,1,'#ff7060','პროტონი'],a:[2,4,'#ffd060','α (He²⁺)']};
  const reset=()=>{const [q,m]=PT[pt];st={x:0,y:0,z:-3,vx:v,vy:0,vz:vz*v*1.5};trail=[];};
  bindSl('mgB',x=>{B=x;reset();});bindSl('mgV',x=>{v=x;reset();});bindSl('mgZ',x=>{vz=x;reset();});bindBtns(root,'mgP',k=>{pt=k;reset();});reset();
  S.lines=[];for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)S.lines.push([[i*1.2,-3.4,j*1.2],[i*1.2,3.4,j*1.2],'rgba(120,180,255,.18)',1]);
  anim(dt=>{const [q,m,col]=PT[pt],k=q*B/(m*(pt==='e'?40:1));/* scaled for display */
    for(let i=0;i<10;i++){const h=dt/10*2;/* B along y: F = q v × B → (vz·B, 0, −vx·B) */const ax=k*(-st.vz)*1,az=k*(st.vx);st.vx+=ax*h;st.vz+=az*h;st.x+=st.vx*h;st.z+=st.vz*h;st.y+=vz*v*h*0.8;}
    if(st.y>3.3)reset();trail.push([st.x,st.y,st.z]);if(trail.length>900)trail.shift();
    S.cloud=trail.map((p,i)=>[p[0],p[1],p[2],col,1.6+i/trail.length*1.5]);S.atoms=[{p:[st.x,st.y,st.z],r:0.14,c:col}];S.draw(dt);
    const r=m*v/(Math.abs(q)*B);$('mgI').innerHTML=`<div class="kv2"><b>${PT[pt][3]}</b><span>q = ${q>0?'+':''}${q}e, m = ${pt==='e'?'1/1836':m} (პროტონის მასებში)</span><b>რადიუსი r ∝ m·v/(qB)</b><span>${pt==='e'?'ძალიან პატარა (ეკრანზე გადიდებულია ×40)':r.toFixed(2)+' ერთ.'}</span><b>ბრუნვის მიმართულება</b><span>${q>0?'საათის ისრის საწინააღმდეგოდ':'საათის ისრის მიმართულებით'} (ზემოდან)</span></div>
     <div class="hint">ლურჯი ხაზები — მაგნიტური ველი (ზემოთ). ველის გასწვრივ სიჩქარის დამატებით წრე სპირალად იქცევა — ასე „ეშვება“ მზის ქარის ნაწილაკები დედამიწის ველის ხაზებით პოლუსებისკენ და პოლარულ ციალს ქმნის.</div>`;});
 }});

/* ═══════════════════ 9. HEAT ENGINE — Carnot cycle ═══════════════════ */
reg({id:'heat',ico:'🔥',t:'სითბური ძრავა',s:'კარნოს ციკლი · pV დიაგრამა · მარგი ქმედების კოეფიციენტი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="htE"></div></div><div class="acol"><div id="htP"></div></div></div><div class="actl">${sl('htH','გამაცხელებელი T<sub>ც</sub>',350,1200,10,600,'K')}${sl('htC','მაცივარი T<sub>ც</sub>′',200,400,5,300,'K')}</div><div id="htI" class="ainfo"></div>
   ${card('ფორმულები',FX([['η = 1 − T<sub>მაცივ.</sub>/T<sub>გამაცხ.</sub>','კარნოს მქკ — მაქსიმუმი',{s:[['η','მარგი ქმედების კოეფიციენტი'],['T','აბსოლუტური ტემპერატურები']],w:'არცერთი სითბური ძრავა არ შეიძლება იყოს კარნოზე ეფექტური. სითბოს სრულად მუშაობად გადაქცევა შეუძლებელია — ნაწილი ყოველთვის მაცივარს უნდა მიეცეს (II კანონი).'}],
     ['A = Q₁ − Q₂','სასარგებლო მუშაობა',{s:[['Q₁','გამაცხელებლიდან მიღებული სითბო'],['Q₂','მაცივრისთვის გადაცემული']],w:'მუშაობა = pV დიაგრამაზე ციკლის მიერ შემოსაზღვრული ფართობი.'}],
     ['pV = const (იზოთერმა) · pV<sup>γ</sup> = const (ადიაბატა)','კარნოს ციკლის 4 საფეხური',{s:[['γ','Cp/Cv, ჰაერისთვის 1.4']],w:'ორი იზოთერმა (სითბოს გაცვლა მუდმივ T-ზე) და ორი ადიაბატა (სითბოს გაცვლის გარეშე, მხოლოდ გაფართოება/შეკუმშვა).'}],
     ['ΔU = Q − A','თერმოდინამიკის I კანონი',{s:[['ΔU','შინაგანი ენერგია']],w:'მიღებული სითბო ხმარდება შინაგანი ენერგიის ზრდას და მუშაობის შესრულებას.'}],
     ['η<sub>მანქანა</sub> ≈ 25–35% · დიზელი ≈ 40% · ელძრავა ≈ 90%','რეალური ძრავები',{s:[],w:'ბენზინის ენერგიის დიდი ნაწილი რადიატორით და გამონაბოლქვით სითბოდ იკარგება. ამიტომაა ელექტრომობილი უფრო ეფექტური.'}]]))}`;
  const ec=canvas($('htE'),440,320),eg=ec.g,pc=canvas($('htP'),440,320),pg=pc.g;let Th=600,Tc=300,ph=0;
  bindSl('htH',v=>Th=v);bindSl('htC',v=>Tc=v);
  anim(dt=>{ph=(ph+dt*0.18)%1;const gm=1.4,V1=1,V2=2.2,V3=V2*Math.pow(Th/Tc,1/(gm-1)),V4=V1*Math.pow(Th/Tc,1/(gm-1)),n=1,R=1;
    const leg=Math.floor(ph*4),u=ph*4-leg;let V,T;
    if(leg===0){V=V1*Math.pow(V2/V1,u);T=Th;}else if(leg===1){V=V2*Math.pow(V3/V2,u);T=Th*Math.pow(V2/V,gm-1);}else if(leg===2){V=V3*Math.pow(V4/V3,u);T=Tc;}else{V=V4*Math.pow(V1/V4,u);T=Tc*Math.pow(V4/V,gm-1);}
    const p=n*R*T/V;
    /* pV diagram */
    pg.clearRect(0,0,pg.W,pg.H);const pmax=n*R*Th/V1*1.1,P=plot(pg,{x:[0,V3*1.1],y:[0,pmax],xl:'V',yl:'p',m:[10,10,24,30]});
    const seg=(a,b,f,col)=>{pg.beginPath();for(let i=0;i<=60;i++){const v2=a*Math.pow(b/a,i/60),pp=f(v2);i?pg.lineTo(P.X(v2),P.Y(pp)):pg.moveTo(P.X(v2),P.Y(pp));}pg.strokeStyle=col;pg.lineWidth=2.5;pg.stroke();};
    pg.beginPath();const pts=[];for(let i=0;i<=60;i++){const v2=V1*Math.pow(V2/V1,i/60);pts.push([v2,R*Th/v2]);}for(let i=0;i<=60;i++){const v2=V2*Math.pow(V3/V2,i/60);pts.push([v2,R*Th*Math.pow(V2/v2,gm-1)/v2]);}for(let i=0;i<=60;i++){const v2=V3*Math.pow(V4/V3,i/60);pts.push([v2,R*Tc/v2]);}for(let i=0;i<=60;i++){const v2=V4*Math.pow(V1/V4,i/60);pts.push([v2,R*Tc*Math.pow(V4/v2,gm-1)/v2]);}
    pts.forEach((q,i)=>i?pg.lineTo(P.X(q[0]),P.Y(q[1])):pg.moveTo(P.X(q[0]),P.Y(q[1])));pg.closePath();pg.fillStyle='rgba(201,168,76,.15)';pg.fill();
    seg(V1,V2,v2=>R*Th/v2,'#e8705a');seg(V2,V3,v2=>R*Th*Math.pow(V2/v2,gm-1)/v2,'#c9a84c');seg(V3,V4,v2=>R*Tc/v2,'#5a9ae8');seg(V4,V1,v2=>R*Tc*Math.pow(V4/v2,gm-1)/v2,'#9a6ae8');
    pg.fillStyle='#fff';pg.beginPath();pg.arc(P.X(V),P.Y(p),5,0,TAU);pg.fill();pg.fillStyle=COL.gl;pg.font='10px sans-serif';pg.textAlign='left';pg.fillText('შიგნით — მუშაობა A',P.X(V1*1.3),P.Y(p*0+R*Th/V2*0.8));
    /* engine picture */
    eg.clearRect(0,0,eg.W,eg.H);const cx=220,top=60,wl=120,cyl=200,pist=top+cyl*(1-V/V3*0.85);
    eg.fillStyle=leg===0?'rgba(232,112,90,.85)':leg===2?'rgba(90,154,232,.85)':'rgba(80,80,90,.6)';eg.fillRect(cx-90,top+cyl+10,180,22);eg.fillStyle='#fff';eg.font='11px sans-serif';eg.textAlign='center';eg.fillText(leg===0?'🔥 გამაცხელებელი — სითბო შედის':leg===2?'❄ მაცივარი — სითბო გამოდის':'იზოლირებული (ადიაბატა)',cx,top+cyl+25);
    eg.strokeStyle='#d8cfb8';eg.lineWidth=3;eg.beginPath();eg.moveTo(cx-wl/2,top);eg.lineTo(cx-wl/2,top+cyl);eg.lineTo(cx+wl/2,top+cyl);eg.lineTo(cx+wl/2,top);eg.stroke();
    const tf=(T-Tc)/(Th-Tc);eg.fillStyle=`rgba(${Math.round(90+150*tf)},${Math.round(120-40*tf)},${Math.round(230-170*tf)},.55)`;eg.fillRect(cx-wl/2+2,pist,wl-4,top+cyl-pist);
    for(let i=0;i<24;i++){const px=cx-wl/2+8+((i*37+ph*800*(0.5+tf))%(wl-16)),py=pist+6+((i*53+ph*600*(0.5+tf))%Math.max(4,top+cyl-pist-12));eg.fillStyle='rgba(255,255,255,.7)';eg.beginPath();eg.arc(px,py,2,0,TAU);eg.fill();}
    eg.fillStyle='#8a8a9a';eg.fillRect(cx-wl/2+2,pist-14,wl-4,14);eg.fillRect(cx-6,pist-60,12,46);
    eg.fillStyle=COL.gl;eg.textAlign='left';eg.fillText(['1→2 იზოთერმული გაფართოება','2→3 ადიაბატური გაფართოება','3→4 იზოთერმული შეკუმშვა','4→1 ადიაბატური შეკუმშვა'][leg],10,20);eg.fillText(`T = ${T.toFixed(0)} K`,10,36);
    const eta=1-Tc/Th;$('htI').innerHTML=`კარნოს მქკ: <b>η = 1 − ${Tc}/${Th} = ${(eta*100).toFixed(1)}%</b>. ${Tc>=Th?'მაცივარი გამაცხელებელზე ცივი უნდა იყოს!':'გამაცხელებლის გაცხელება ან მაცივრის გაცივება მქკ-ს ზრდის — მაგრამ 100%-ს ვერასდროს მიაღწევს (მაცივარი 0 K უნდა იყოს).'}`;});
 }});

/* starfield helper */
function stars(n,W,H,seed){let s=seed||7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};return Array.from({length:n},()=>[r()*W,r()*H,r()*1.4+0.3,r()]);}
function drawStars(g,S,T){for(const [x,y,r,t] of S){g.fillStyle=`rgba(255,255,255,${0.35+0.5*Math.abs(Math.sin(T*0.8+t*20))})`;g.fillRect(x,y,r,r);}}

/* ═══════════════════ 10. GRAVITY & ORBITS ═══════════════════ */
reg({id:'orbit',ico:'🪐',t:'გრავიტაცია და ორბიტები',s:'კეპლერის კანონები · გაქცევის სიჩქარე · სამი სხეული',
 build(root){
  root.innerHTML=`<div id="obC"></div><div class="actl"><div>${btns('obM',[['circ','წრიული ორბიტა'],['ell','ელიფსური (კეპლერი)'],['esc','გაქცევის სიჩქარე'],['bin','ორმაგი ვარსკვლავი'],['fig8','სამი სხეული: „რვიანი“'],['solar','მზის სისტემა']],'ell')}</div>
    <div class="hint">ტილოზე გადაათრიე: ახალი პლანეტა გაისვრება შენ მიერ მიცემული სიჩქარით.</div></div><div id="obI" class="ainfo"></div>
   ${card('ფორმულები',FX([['F = G·M·m / r²','ნიუტონის მსოფლიო მიზიდულობის კანონი',{s:[['G','6.674·10⁻¹¹ ნ·მ²/კგ²'],['M, m','მასები'],['r','მანძილი ცენტრებს შორის']],w:'ყველა სხეული ყველას იზიდავს. ვაშლი და მთვარე ერთი და იგივე კანონით მოძრაობს — მთვარეც „ვარდება“, უბრალოდ გვერდით ისე სწრაფად მიდის, რომ ვერ ეცემა.'}],
     ['v₁ = √(G·M / r)','პირველი კოსმოსური (წრიული) სიჩქარე',{s:[['v₁','დედამიწასთან ≈ 7.9 კმ/წმ']],w:'ამ სიჩქარით სხეული ვარდნისას ზუსტად იმდენად „აცდება“ დედამიწას, რამდენადაც ზედაპირი იხრება — ორბიტაზე რჩება.'}],
     ['v₂ = √(2·G·M / r) = √2·v₁','მეორე კოსმოსური (გაქცევის) სიჩქარე',{s:[['v₂','დედამიწიდან ≈ 11.2 კმ/წმ']],w:'კინეტიკური ენერგია გრავიტაციის მთელ „ორმოს“ ფარავს — სხეული აღარასდროს დაბრუნდება.'}],
     ['T² / a³ = 4π² / (G·M)','კეპლერის III კანონი',{s:[['T','ბრუნვის პერიოდი'],['a','ორბიტის დიდი ნახევარღერძი']],w:'შორეული პლანეტები უფრო ნელა და გრძელ გზას გადის. მზის სისტემაში: T (წლები)² = a (აუ)³ — იუპიტერი 5.2 აუ-ზე 11.9 წელიწადში შემოივლის.'}],
     ['ΔS/Δt = const','კეპლერის II კანონი — თანაბარი ფართობები',{s:[],w:'პლანეტა მზესთან ახლოს ჩქარდება, შორს — ნელდება, ისე, რომ რადიუს-ვექტორი თანაბარ დროში თანაბარ ფართობს „გლავს“ (ფერადი სექტორები ანიმაციაში).'}],
     ['g = G·M / R²','თავისუფალი ვარდნის აჩქარება',{s:[['R','პლანეტის რადიუსი']],w:'დედამიწაზე 9.81, მთვარეზე 1.62, იუპიტერზე 24.8 მ/წმ².'}],['E = −G·M·m / 2a','ორბიტის სრული ენერგია',{s:[],w:'უარყოფითი ენერგია = ბმული ორბიტა (ელიფსი). ნული — პარაბოლა, დადებითი — ჰიპერბოლა: სხეული მიდის.'}]]))}`;
  const c=canvas($('obC'),900,460),g=c.g,SKY=stars(260,900,460,11);let B=[],trails=[],mode='ell',wedges=[],wT=0,aim=null,tt=0;
  const Gs=4000;/* display units */
  const set=m=>{mode=m;B=[];wedges=[];tt=0;const cx=450,cy=230;
    if(m==='circ'||m==='ell'||m==='esc'){B.push({x:cx,y:cy,vx:0,vy:0,m:1,r:16,c:'#ffd060',fix:1});const r=150,v=Math.sqrt(Gs/r);B.push({x:cx+r,y:cy,vx:0,vy:-(m==='circ'?v:m==='ell'?v*0.72:v*Math.SQRT2*1.0),m:0.001,r:6,c:'#5fc8d8'});}
    if(m==='bin'){B.push({x:cx-70,y:cy,vx:0,vy:-2.8,m:1,r:12,c:'#ffd060'});B.push({x:cx+70,y:cy,vx:0,vy:2.8,m:1,r:10,c:'#ff8060'});B.push({x:cx+250,y:cy,vx:0,vy:-5.2,m:0.001,r:5,c:'#5fc8d8'});}
    if(m==='fig8'){const s=170,v=4.4;[[0.97000436,-0.24308753,0.466203685,0.43236573],[-0.97000436,0.24308753,0.466203685,0.43236573],[0,0,-0.93240737,-0.86473146]].forEach((q,i)=>B.push({x:cx+q[0]*s,y:cy+q[1]*s,vx:q[2]*v,vy:q[3]*v,m:1,r:8,c:['#ff7060','#60c0ff','#ffe060'][i]}));}
    if(m==='solar'){B.push({x:cx,y:cy,vx:0,vy:0,m:1,r:14,c:'#ffd060',fix:1});[[40,'#a0a0a0',3],[62,'#e8c070',4],[88,'#5fa0ff',4.5],[120,'#e86040',3.5],[185,'#e8a860',9],[240,'#e8d090',8]].forEach(([r,col,sz],i)=>{const a=i*1.3,v=Math.sqrt(Gs/r);B.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a),vx:-v*Math.sin(a),vy:v*Math.cos(a),m:0.0001,r:sz,c:col});});}
    trails=B.map(()=>[]);};
  bindBtns(root,'obM',k=>set(k));set('ell');
  c.style.touchAction='none';c.addEventListener('pointerdown',e=>{aim={a:c.pt(e),b:c.pt(e)};c.setPointerCapture(e.pointerId);});c.addEventListener('pointermove',e=>{if(aim)aim.b=c.pt(e);});
  c.addEventListener('pointerup',()=>{if(!aim)return;const [x,y]=aim.a,[x2,y2]=aim.b;B.push({x,y,vx:(x2-x)*0.05,vy:(y2-y)*0.05,m:0.001,r:5,c:`hsl(${Math.random()*360},80%,65%)`});trails.push([]);aim=null;});
  anim((dt,T)=>{tt+=dt;const sub=60,h=dt*16/sub;
    for(let s=0;s<sub;s++){for(const b of B){if(b.fix)continue;let ax=0,ay=0;for(const o of B){if(o===b)continue;const dx=o.x-b.x,dy=o.y-b.y,r2=dx*dx+dy*dy+25,r=Math.sqrt(r2);ax+=Gs*o.m*dx/(r2*r);ay+=Gs*o.m*dy/(r2*r);}b.vx+=ax*h;b.vy+=ay*h;}for(const b of B)if(!b.fix){b.x+=b.vx*h;b.y+=b.vy*h;}}
    B.forEach((b,i)=>{trails[i].push([b.x,b.y]);if(trails[i].length>(mode==='fig8'?500:900))trails[i].shift();});
    /* Kepler wedges for the planet in ell mode */
    if(mode==='ell'||mode==='circ'){wT+=dt;if(wT>0.35){wT=0;const p=B[1];wedges.push({pts:[],col:`hsla(${(wedges.length*40)%360},80%,60%,.28)`});if(wedges.length>8)wedges.shift();}const w=wedges[wedges.length-1];if(w)w.pts.push([B[1].x,B[1].y]);}
    g.fillStyle='#04030c';g.fillRect(0,0,g.W,g.H);drawStars(g,SKY,T);
    for(const w of wedges){if(w.pts.length<2)continue;g.fillStyle=w.col;g.beginPath();g.moveTo(B[0].x,B[0].y);w.pts.forEach(p=>g.lineTo(p[0],p[1]));g.closePath();g.fill();}
    B.forEach((b,i)=>{const tr=trails[i];g.lineWidth=1.5;for(let k=1;k<tr.length;k++){g.strokeStyle=b.c;g.globalAlpha=k/tr.length*0.8;g.beginPath();g.moveTo(tr[k-1][0],tr[k-1][1]);g.lineTo(tr[k][0],tr[k][1]);g.stroke();}g.globalAlpha=1;
      const gr=g.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*(b.m>=0.5?2.6:1.6));gr.addColorStop(0,'#fff');gr.addColorStop(0.3,b.c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(b.x,b.y,b.r*(b.m>=0.5?2.6:1.6),0,TAU);g.fill();});
    if(aim){g.strokeStyle='#fff';g.setLineDash([4,4]);g.beginPath();g.moveTo(...aim.a);g.lineTo(...aim.b);g.stroke();g.setLineDash([]);}
    const p=B[1];if(p&&(mode==='circ'||mode==='ell'||mode==='esc')){const r=Math.hypot(p.x-B[0].x,p.y-B[0].y),v=Math.hypot(p.vx,p.vy),E=v*v/2-Gs/r;
      $('obI').innerHTML=`<div class="kv2"><b>მანძილი r</b><span>${r.toFixed(0)}</span><b>სიჩქარე v</b><span>${v.toFixed(2)} (წრიული ${Math.sqrt(Gs/r).toFixed(2)}, გაქცევის ${Math.sqrt(2*Gs/r).toFixed(2)})</span><b>სრული ენერგია</b><span>${E.toFixed(1)} → ${E<-0.5?'ბმული ორბიტა (ელიფსი)':E>0.5?'ჰიპერბოლა — მიფრინავს':'ზღვარზე (პარაბოლა)'}</span></div><div class="hint">${mode==='ell'?'ფერადი სექტორები თანაბარ დროშია „გალეული“ — ფართობი ერთნაირია (კეპლერის II კანონი). ახლოს ის ჩქარდება.':mode==='esc'?'v = √2·v₁ — პლანეტა აღარ ბრუნდება.':''}</div>`;}
    else $('obI').innerHTML=mode==='fig8'?'სამი თანაბარი მასის ვარსკვლავი ერთ „რვიანზე“ მისდევს ერთმანეთს — სამი სხეულის ამოცანის იშვიათი მდგრადი ამონახსნი (შენსინერი და მონტგომერი, 2000). მცირე შეშფოთებით მოძრაობა ქაოტური ხდება.':mode==='bin'?'ორი ვარსკვლავი საერთო მასათა ცენტრის გარშემო ბრუნავს; მესამე სხეული (პლანეტა) ორივეს გარშემო — როგორც „ტატუინი“ ვარსკვლავურ ომებში (რეალური მაგალითი: Kepler-16b).':'მზის სისტემა: შიდა პლანეტები სწრაფად ბრუნავს, გარე — ნელა (კეპლერის III კანონი).';
  });
 }});

/* ═══════════════════ 11. STARS — blackbody & HR diagram ═══════════════════ */
const STARS=[['მზე',5772,1,1,'G2 V'],['სირიუსი A',9940,25.4,1.71,'A1 V'],['ვეგა',9602,40,2.36,'A0 V'],['რიგელი',12100,1.2e5,78.9,'B8 Ia'],['ბეთელგეიზე',3600,1.26e5,887,'M1 Ia'],['ანტარესი',3660,7.5e4,680,'M1 Ib'],
 ['პროქსიმა კენტავრი',3042,0.0017,0.154,'M5.5 V'],['არკტური',4286,170,25.4,'K1.5 III'],['სირიუსი B',25000,0.056,0.0084,'თეთრი ჯუჯა'],['სპიკა',22400,2e4,7.5,'B1 V'],['პოლარისი',6015,1260,37.5,'F7 Ib'],['ალდებარანი',3910,439,44,'K5 III'],['ბარნარდის ვ.',3134,0.0035,0.196,'M4 V'],['ალფა კენტავრი A',5790,1.52,1.22,'G2 V']];
const planck=(lam,T)=>{const l=lam*1e-9;return 2*H_PL*C_L*C_L/Math.pow(l,5)/(Math.exp(H_PL*C_L/(l*KB*T))-1);};
function bbColor(T){/* integrate Planck × rough CIE-ish RGB response */let r=0,g2=0,b=0;for(let l=380;l<=750;l+=5){const p=planck(l,T),c=wlRGB(l).match(/\d+/g).map(Number);r+=p*c[0];g2+=p*c[1];b+=p*c[2];}const m=Math.max(r,g2,b);return [r/m,g2/m,b/m].map(v=>Math.round(255*Math.pow(v,0.6)));}
reg({id:'stars',ico:'⭐',t:'ვარსკვლავები და სინათლე',s:'შავი სხეულის გამოსხივება · ფერი და ტემპერატურა · ჰ-რ დიაგრამა',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="stB"></div>${sl('stT','ზედაპირის ტემპერატურა T',1500,40000,50,5772,'K')}</div><div class="acol"><div id="stS"></div></div></div><div id="stH"></div><div class="hint">ჰერცშპრუნგ–რასელის დიაგრამა: დააჭირე ვარსკვლავს.</div><div id="stI" class="ainfo"></div>
   ${card('ფორმულები',FX([['λ<sub>max</sub> = b / T','ვინის წანაცვლების კანონი',{s:[['λ<sub>max</sub>','მაქსიმალური გამოსხივების ტალღის სიგრძე'],['b','2.898·10⁻³ მ·K'],['T','ზედაპირის ტემპერატურა']],w:'რაც უფრო ცხელია სხეული, მით მოკლეა მისი „საყვარელი“ ტალღა: ელექტროქურის სპირალი წითლად ანათებს, მზე — ყვითლად-თეთრად, ცხელი ვარსკვლავები — ლურჯად. ადამიანი (310 K) ინფრაწითელში ანათებს — ამაზე მუშაობს თერმოკამერა.'}],
     ['L = 4π·R²·σ·T⁴','სტეფან-ბოლცმანის კანონი',{s:[['L','ნათება (სიმძლავრე)'],['R','რადიუსი'],['σ','5.67·10⁻⁸ ვტ/(მ²·K⁴)']],w:'T⁴ უზარმაზარ ეფექტს იძლევა: ორჯერ ცხელი ვარსკვლავი 16-ჯერ მეტს ასხივებს. ბეთელგეიზე ცივია, მაგრამ ისეთი დიდია (R ≈ 900 R☉), რომ მზეზე 100 000-ჯერ კაშკაშაა.'}],
     ['B(λ,T) = (2hc²/λ⁵) · 1/(e<sup>hc/λkT</sup> − 1)','პლანკის კანონი',{s:[['h','პლანკის მუდმივა'],['k','ბოლცმანის მუდმივა']],w:'პლანკმა 1900-ში ამ მრუდის ასახსნელად დაუშვა, რომ ენერგია ულუფებად გამოიყოფა — ასე დაიბადა კვანტური ფიზიკა.'}],
     ['m = −2.5·lg(F) + const','ვარსკვლავიერი სიდიდე',{s:[['m','სიდიდე — რაც ნაკლებია, მით კაშკაშაა'],['F','ნაკადი']],w:'5 სიდიდის სხვაობა = 100-ჯერ სიკაშკაშე. სირიუსი −1.46, შიშველი თვალით ჩანს ~6-მდე.'}],
     ['F = L / (4π·d²)','ნაკადი მანძილზე',{s:[['d','მანძილი']],w:'სინათლე სფეროზე ნაწილდება — ორჯერ შორს 4-ჯერ მკრთალია.'}]]))}`;
  const bc=canvas($('stB'),440,300),bg=bc.g,sc=canvas($('stS'),440,300),sg=sc.g,hc=canvas($('stH'),900,330),hg=hc.g;let T=5772,sel=0,SK=stars(120,440,300,3);
  const HR={x:t=>60+(Math.log10(40000)-Math.log10(t))/(Math.log10(40000)-Math.log10(2400))*800,y:l=>300-(Math.log10(l)+3.5)/(5.8+3.5)*270};
  hc.addEventListener('click',e=>{const [x,y]=hc.pt(e);let best=-1,bd=1e9;STARS.forEach((s,i)=>{const d=Math.hypot(HR.x(s[1])-x,HR.y(s[2])-y);if(d<bd){bd=d;best=i;}});if(bd<30){sel=best;$('stT').value=STARS[best][1];$('stT').dispatchEvent(new Event('input'));}});
  bindSl('stT',v=>T=v);
  anim((dt,TT)=>{const col=bbColor(T),cs=`rgb(${col.join(',')})`;
    bg.fillStyle='#03020a';bg.fillRect(0,0,bg.W,bg.H);drawStars(bg,SK,TT);const R=60+20*Math.sin(TT*0.7)*0.05;
    for(let k=6;k>=1;k--){bg.fillStyle=`rgba(${col.join(',')},${0.05*k/6})`;bg.beginPath();bg.arc(220,150,R*(1+k*0.35),0,TAU);bg.fill();}
    const gr=bg.createRadialGradient(205,135,5,220,150,R);gr.addColorStop(0,'#fff');gr.addColorStop(0.5,cs);gr.addColorStop(1,`rgba(${col.map(v=>v*0.6|0).join(',')},1)`);bg.fillStyle=gr;bg.beginPath();bg.arc(220,150,R,0,TAU);bg.fill();
    for(let i=0;i<40;i++){const a=i/40*TAU+TT*0.05,x=220+Math.cos(a)*R*0.7,y=150+Math.sin(a)*R*0.7*Math.abs(Math.cos(i*1.7+TT*0.3));bg.fillStyle='rgba(255,255,255,.05)';bg.beginPath();bg.arc(x,y,6,0,TAU);bg.fill();}
    bg.fillStyle='#fff';bg.font='600 14px sans-serif';bg.textAlign='center';bg.fillText(`${T} K`,220,275);
    /* Planck spectrum */
    sg.clearRect(0,0,sg.W,sg.H);const lmax=WIEN/T*1e9,xmx=3000;let ym=planck(Math.min(lmax,xmx),T);const P=plot(sg,{x:[0,xmx],y:[0,ym*1.1],xl:'ტალღის სიგრძე, ნმ',yl:'ინტენსივობა',xt:[0,500,1000,2000,3000],m:[10,10,24,24]});
    for(let l=380;l<=750;l+=2){sg.fillStyle=wlRGB(l);sg.globalAlpha=0.35;sg.fillRect(P.X(l),P.y0,P.X(2)-P.X(0)+0.5,P.h);}sg.globalAlpha=1;
    sg.beginPath();for(let i=1;i<=300;i++){const l=i/300*xmx;const y=planck(l,T);i>1?sg.lineTo(P.X(l),P.Y(y)):sg.moveTo(P.X(l),P.Y(y));}sg.strokeStyle='#fff';sg.lineWidth=2.2;sg.stroke();
    if(lmax<xmx){sg.strokeStyle='#e8705a';sg.setLineDash([3,3]);sg.beginPath();sg.moveTo(P.X(lmax),P.y0);sg.lineTo(P.X(lmax),P.y0+P.h);sg.stroke();sg.setLineDash([]);sg.fillStyle='#e8705a';sg.font='11px sans-serif';sg.textAlign='left';sg.fillText(`λmax = ${lmax.toFixed(0)} ნმ`,P.X(lmax)+4,P.y0+14);}
    /* HR */
    hg.fillStyle='#05040c';hg.fillRect(0,0,hg.W,hg.H);for(let t=40000;t>=2400;t/=1.05){const x=HR.x(t),c2=bbColor(t);hg.fillStyle=`rgba(${c2.join(',')},.12)`;hg.fillRect(x,10,7,290);}
    hg.strokeStyle='rgba(255,255,255,.12)';hg.lineWidth=40;hg.beginPath();for(let t=35000;t>=2600;t/=1.1){const L=Math.pow(t/5772,6.5);hg.lineTo(HR.x(t),HR.y(L));}hg.stroke();hg.lineWidth=1;
    hg.fillStyle=COL.dim;hg.font='10px sans-serif';hg.textAlign='center';[30000,10000,6000,4000,3000].forEach(t=>hg.fillText(t+' K',HR.x(t),318));hg.textAlign='left';[-2,0,2,4].forEach(e=>hg.fillText('10'+(e<0?'⁻':'')+String(Math.abs(e)).replace(/\d/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d])+' L☉',4,HR.y(Math.pow(10,e))+3));
    hg.fillStyle='rgba(255,255,255,.4)';hg.fillText('მთავარი მიმდევრობა',HR.x(9000),HR.y(60)-18);hg.fillText('გიგანტები',HR.x(4200),HR.y(300)-20);hg.fillText('ზეგიგანტები',HR.x(5000),HR.y(8e4)-22);hg.fillText('თეთრი ჯუჯები',HR.x(20000),HR.y(0.005)+24);
    STARS.forEach(([n,t,L,R],i)=>{const x=HR.x(t),y=HR.y(L),c2=bbColor(t),r=clamp(3+Math.log10(R+1)*3,3,12);const gr2=hg.createRadialGradient(x,y,0,x,y,r*2);gr2.addColorStop(0,'#fff');gr2.addColorStop(0.4,`rgb(${c2.join(',')})`);gr2.addColorStop(1,'rgba(0,0,0,0)');hg.fillStyle=gr2;hg.beginPath();hg.arc(x,y,r*2,0,TAU);hg.fill();
      hg.fillStyle=i===sel?'#ecd59a':'rgba(220,210,190,.75)';hg.font=(i===sel?'600 ':'')+'11px sans-serif';hg.fillText(n,x+r+4,y+4);});
    const s=STARS[sel],Lc=Math.pow(s[3],2)*Math.pow(s[1]/5772,4);
    $('stI').innerHTML=`<div class="kv2"><b>${s[0]}</b><span>${s[4]} · T = ${s[1]} K · R = ${s[3]} R☉ · L = ${fmtN(s[2])} L☉</span><b>შემოწმება L = R²·(T/T☉)⁴</b><span>${fmtN(Lc)} L☉ ✓</span><b>ფერი</b><span>λmax = ${(WIEN/s[1]*1e9).toFixed(0)} ნმ — ${s[1]>9000?'მოლურჯო-თეთრი':s[1]>6500?'თეთრი':s[1]>5200?'ყვითელი':s[1]>3800?'ნარინჯისფერი':'წითელი'}</span></div><div class="hint">ვარსკვლავის ფერი მისი ტემპერატურის თერმომეტრია. მზეს მწვანეში აქვს მაქსიმუმი, მაგრამ ჩვენთვის თეთრია — ყველა ფერი ერთად.</div>`;
  });
 }});

/* ═══════════════════ 12. BLACK HOLES — gravitational lensing ═══════════════════ */
reg({id:'bh',ico:'🕳',t:'შავი ხვრელები',s:'გრავიტაციული ლინზა · აინშტაინის რგოლი · მოვლენათა ჰორიზონტი',
 build(root){
  root.innerHTML=`<div id="bhC"></div><div class="actl">${sl('bhM','მასა (აინშტაინის რადიუსი)',20,140,1,70,'პქ')}<div class="hint">გადაათრიე მაუსი/თითი — შავი ხვრელი გაყვება. ცენტრთან ახლოს ფონური გალაქტიკა რგოლად იქცევა.</div></div><div id="bhI" class="ainfo"></div>
   ${card('🧮 შვარცშილდის რადიუსი',`<div class="calc"><label>მასა (მზის მასებში)<input id="rsM" type="number" value="1"></label></div><div id="rsO" class="ainfo"></div>`)}
   ${card('ფორმულები',FX([['r<sub>s</sub> = 2·G·M / c²','შვარცშილდის რადიუსი (მოვლენათა ჰორიზონტი)',{s:[['r<sub>s</sub>','ჰორიზონტის რადიუსი'],['M','მასა'],['c','სინათლის სიჩქარე']],w:'თუ მასას ამ რადიუსამდე შევკუმშავთ, გაქცევის სიჩქარე სინათლის სიჩქარეს გადააჭარბებს — სინათლეც ვეღარ გამოვა. მზისთვის 3 კმ, დედამიწისთვის 9 მმ!'}],
     ['θ<sub>E</sub> = √(4GM/c² · D<sub>ls</sub>/(D<sub>l</sub>·D<sub>s</sub>))','აინშტაინის რგოლის კუთხე',{s:[['D','მანძილები: დამკვირვებელი–ლინზა–წყარო']],w:'მასა სივრცე-დროს ღუნავს, სინათლე ამ მრუდ სივრცეში „სწორად“ მოძრაობს და იღუნება. სრული თანხვედრისას წყარო რგოლად ჩანს.'}],
     ['Δt′ = Δt·√(1 − r<sub>s</sub>/r)','გრავიტაციული დროის შენელება',{s:[['r','მანძილი ცენტრიდან']],w:'ძლიერ გრავიტაციაში დრო ნელა მიდის. GPS თანამგზავრების საათები ამ ეფექტის გამო ყოველდღე ~38 მიკროწამით წინ მიდის — შესწორების გარეშე ნავიგაცია კილომეტრებით აცდებოდა.'}],
     ['T<sub>H</sub> = ħc³ / (8π·G·M·k<sub>B</sub>)','ჰოკინგის ტემპერატურა',{s:[['k<sub>B</sub>','ბოლცმანის მუდმივა']],w:'კვანტური ეფექტებით შავი ხვრელი ოდნავ ასხივებს და ძალიან ნელა „ორთქლდება“. რაც მცირეა, მით ცხელია.'}],
     ['α = 4GM / (c²·b)','სინათლის გადახრის კუთხე',{s:[['b','დაშორება მასიდან']],w:'1919 წლის მზის დაბნელებისას ედინგტონმა ვარსკვლავების წანაცვლება გაზომა — აინშტაინის თეორია დადასტურდა და ის მსოფლიო ვარსკვლავად იქცა.'}]]))}`;
  const W=900,Hh=440,c=canvas($('bhC'),W,Hh),g=c.g;let RE=70,lens=[450,220];
  /* background: procedural galaxy + stars rendered once */
  const bgc=document.createElement('canvas');bgc.width=W;bgc.height=Hh;const b=bgc.getContext('2d');b.fillStyle='#02010a';b.fillRect(0,0,W,Hh);
  stars(900,W,Hh,5).forEach(([x,y,r,t])=>{b.fillStyle=`hsla(${200+t*60},70%,${70+t*25}%,${0.4+t*0.6})`;b.fillRect(x,y,r*1.2,r*1.2);});
  for(let i=0;i<2600;i++){const a=Math.random()*TAU*3,rr=Math.pow(Math.random(),0.6)*120,arm=Math.floor(Math.random()*2)*Math.PI,ang=a*0.5+arm+rr*0.035;const x=520+Math.cos(ang)*rr*1.4+(Math.random()-0.5)*14,y=200+Math.sin(ang)*rr*0.55+(Math.random()-0.5)*10;b.fillStyle=`hsla(${20+Math.random()*30+rr},80%,${60+Math.random()*30}%,.55)`;b.fillRect(x,y,1.6,1.6);}
  const gl=b.createRadialGradient(520,200,0,520,200,40);gl.addColorStop(0,'rgba(255,240,200,.9)');gl.addColorStop(1,'rgba(255,200,120,0)');b.fillStyle=gl;b.fillRect(460,160,120,80);
  const src=b.getImageData(0,0,W,Hh).data;const out=g.createImageData(W,Hh);
  const STEP=2;c.style.touchAction='none';c.addEventListener('pointermove',e=>{lens=c.pt(e);});c.addEventListener('pointerdown',e=>{lens=c.pt(e);});
  bindSl('bhM',v=>RE=v);
  const rs=()=>{const M=+$('rsM').value*MSUN,r=2*G_N*M/(C_L*C_L),TH=1.0546e-34*C_L**3/(8*Math.PI*G_N*M*KB);$('rsO').innerHTML=`r<sub>s</sub> = <b>${r<1?(r*1000).toPrecision(3)+' მმ':r<1e4?r.toPrecision(4)+' მ':(r/1000).toPrecision(4)+' კმ'}</b> · ჰოკინგის T = ${fmtN(TH)} K · მაგალითები: დედამიწა (3·10⁻⁶ M☉) → 9 მმ; Sgr A* (4·10⁶ M☉) → 12 მლნ კმ`;};$('rsM').oninput=rs;rs();
  let lastKey='';
  anim((dt,T)=>{const d=out.data,[lx,ly]=lens,RE2=RE*RE,key=lx+','+ly+','+RE;if(key!==lastKey){lastKey=key;
    for(let y=0;y<Hh;y+=STEP)for(let x=0;x<W;x+=STEP){const dx=x-lx,dy=y-ly,r2=dx*dx+dy*dy;let sx,sy,dark=false;
      if(r2<RE2*0.06){dark=true;}else{const f=1-RE2/r2;sx=lx+dx*f;sy=ly+dy*f;}
      let R=0,Gc=0,Bc=0;if(!dark){const ix=sx|0,iy=sy|0;if(ix>=0&&iy>=0&&ix<W&&iy<Hh){const k=(iy*W+ix)*4;R=src[k];Gc=src[k+1];Bc=src[k+2];}const mag=Math.min(3,1/Math.abs(1-RE2*RE2/(r2*r2)));R=Math.min(255,R*Math.sqrt(mag));Gc=Math.min(255,Gc*Math.sqrt(mag));Bc=Math.min(255,Bc*Math.sqrt(mag));}
      for(let yy=0;yy<STEP;yy++)for(let xx=0;xx<STEP;xx++){const k=((y+yy)*W+x+xx)*4;d[k]=R;d[k+1]=Gc;d[k+2]=Bc;d[k+3]=255;}}
    }
    g.putImageData(out,0,0);
    /* photon ring + accretion glow */
    const rh=RE*0.245;g.strokeStyle=`rgba(255,200,120,${0.6+0.2*Math.sin(T*3)})`;g.lineWidth=2;g.beginPath();g.arc(lx,ly,rh*1.15,0,TAU);g.stroke();
    g.strokeStyle='rgba(255,255,255,.18)';g.setLineDash([4,6]);g.beginPath();g.arc(lx,ly,RE,0,TAU);g.stroke();g.setLineDash([]);g.fillStyle='rgba(255,255,255,.5)';g.font='10px sans-serif';g.fillText('აინშტაინის რადიუსი',lx+RE*0.72,ly-RE*0.72);
    $('bhI').innerHTML='ფონური გალაქტიკის სინათლე შავი ხვრელის გარშემო იღუნება: ჩნდება ორმაგი გამოსახულებები, რკალები და, ზუსტი თანხვედრისას, აინშტაინის რგოლი. ცენტრში — ჩრდილი, საიდანაც სინათლე არ გამოდის (2019 წლის M87* ფოტო ზუსტად ეს არის).';
  });
 }});

/* ═══════════════════ 13. COSMOLOGY — Hubble expansion & scale ═══════════════════ */
const SCALE=[[-35,'პლანკის სიგრძე','სივრცის უმცირესი აზრიანი ზომა'],[-15,'პროტონი','1 ფემტომეტრი'],[-10,'ატომი','0.1 ნმ'],[-8,'ვირუსი','100 ნმ'],[-5,'უჯრედი','10 მკმ'],[-3,'ჭიანჭველა','1 მმ'],[0,'ადამიანი','~1.7 მ'],[3,'მთა','~1 კმ — ყაზბეგი 5 კმ'],[7,'დედამიწა','12 742 კმ'],[9,'მზე','1.4 მლნ კმ'],[11,'მზე–დედამიწა','150 მლნ კმ (1 აუ)'],[13,'მზის სისტემა','~ნეპტუნამდე'],[16,'სინათლის წელი','9.46 ტრლნ კმ'],[17,'უახლოესი ვარსკვლავი','4.24 სინ. წელი'],[21,'ირმის ნახტომი','100 000 სინ. წელი'],[22.4,'ანდრომედა','2.5 მლნ სინ. წლის მანძილზე'],[24,'გალაქტიკების გროვა','ათობით მლნ სინ. წელი'],[26.9,'დაკვირვებადი სამყარო','93 მლრდ სინ. წელი']];
reg({id:'cosmo',ico:'🌌',t:'კოსმოლოგია',s:'სამყაროს გაფართოება · ჰაბლის კანონი · მასშტაბები',
 build(root){
  root.innerHTML=`<div id="csC"></div><div class="actl">${sl('csH','ჰაბლის მუდმივა H₀',50,90,1,70,'კმ/წმ/მპკ')}<div class="abt"><button id="csR">↺ თავიდან</button></div><div class="hint">დააჭირე ნებისმიერ გალაქტიკას — დაინახავ, რომ ყველა მისგან შორდება: ცენტრი არ არსებობს.</div></div><div id="csI" class="ainfo"></div>
   ${card('🔭 სამყაროს მასშტაბები',`<div id="scC"></div>${sl('scZ','ზომა 10^x მეტრი',-35,27,0.1,0)}<div id="scI" class="ainfo"></div>`)}
   ${card('ფორმულები',FX([['v = H₀·d','ჰაბლის კანონი',{s:[['v','დაშორების სიჩქარე'],['H₀','≈ 70 კმ/წმ ყოველ მეგაპარსეკზე'],['d','მანძილი']],w:'რაც უფრო შორსაა გალაქტიკა, მით სწრაფად შორდება. გალაქტიკები სივრცეში არ „მიფრინავენ“ — თვითონ სივრცე იჭიმება, როგორც საცხობ ცომში ქიშმიში.'}],
     ['t ≈ 1/H₀','სამყაროს ასაკი (მიახლოებით)',{s:[],w:'თუ გაფართოებას უკან „დავატრიალებთ“, ყველაფერი ერთ წერტილს უბრუნდება. 1/H₀ ≈ 14 მლრდ წელი; ზუსტი მნიშვნელობა — 13.8 მლრდ.'}],
     ['z = (λ<sub>დაკ.</sub> − λ₀) / λ₀','წითელი წანაცვლება',{s:[['z','წანაცვლება'],['λ₀','გამოსხივებული ტალღა']],w:'სივრცის გაჭიმვა სინათლის ტალღასაც ჭიმავს — შორეული გალაქტიკები უფრო წითელია. ყველაზე შორეულისთვის z > 13.'}],
     ['1 პკ = 3.26 სინ. წელი = 3.086·10¹⁶ მ','პარსეკი',{s:[],w:'მანძილი, საიდანაც დედამიწის ორბიტა 1 რკალურ წამად ჩანს.'}],
     ['T<sub>CMB</sub> = 2.725 K','რელიქტური გამოსხივება',{s:[],w:'დიდი აფეთქების „ექო“ — სამყარო 380 000 წლისა რომ გახდა გამჭვირვალე, მაშინდელი სინათლე. დღეს გაფართოებით მიკროტალღებად გაიჭიმა. ძველი ტელევიზორის „ხმაურის“ ~1% სწორედ ესაა.'}]]))}`;
  const c=canvas($('csC'),900,380),g=c.g;let H0=70,gal=[],t=0,ref=null;const zc=canvas($('scC'),860,160),zg=zc.g;let Z=0;
  const reset=()=>{gal=[];for(let i=0;i<70;i++)gal.push({x:(Math.random()-0.5)*1.4,y:(Math.random()-0.5)*0.9,h:Math.random()*360,s:0.6+Math.random()*1.2,rot:Math.random()*TAU});t=0;ref=gal[0];};
  bindSl('csH',v=>H0=v);$('csR').onclick=reset;reset();bindSl('scZ',v=>Z=v);
  c.addEventListener('click',e=>{const [x,y]=c.pt(e),a=1+t*H0/70*0.08;let best=null,bd=1e9;for(const q of gal){const X=450+(q.x-ref.x)*a*600,Y=190+(q.y-ref.y)*a*600;const d=Math.hypot(X-x,Y-y);if(d<bd){bd=d;best=q;}}if(best&&bd<30)ref=best;});
  anim((dt,T)=>{t+=dt;const a=1+t*H0/70*0.08;if(a>3.2)reset();
    g.fillStyle='#03020a';g.fillRect(0,0,g.W,g.H);
    for(const q of gal){const X=450+(q.x-ref.x)*a*600,Y=190+(q.y-ref.y)*a*600;if(X<-30||X>930||Y<-30||Y>410)continue;const dist=Math.hypot(q.x-ref.x,q.y-ref.y),z=dist*(a-1)*1.2;const hue=q===ref?50:clamp(200-z*260,0,220);
      if(q!==ref&&dist>0.02){g.strokeStyle=`hsla(${hue},80%,60%,.25)`;g.beginPath();g.moveTo(X,Y);g.lineTo(X+(q.x-ref.x)*20*H0/70,Y+(q.y-ref.y)*20*H0/70);g.stroke();}
      g.save();g.translate(X,Y);g.rotate(q.rot+T*0.05);for(let k=0;k<26;k++){const r=k*0.6*q.s,ang=k*0.5;g.fillStyle=`hsla(${hue},80%,${75-k}%,.6)`;g.fillRect(Math.cos(ang)*r,Math.sin(ang)*r*0.5,1.6,1.6);g.fillRect(-Math.cos(ang)*r,-Math.sin(ang)*r*0.5,1.6,1.6);}
      g.fillStyle=q===ref?'#ffe080':`hsl(${hue},80%,80%)`;g.beginPath();g.arc(0,0,q===ref?5:2.5,0,TAU);g.fill();g.restore();}
    g.fillStyle=COL.gl;g.font='12px sans-serif';g.textAlign='left';g.fillText(`მასშტაბის ფაქტორი a = ${a.toFixed(2)} · ყვითელი — „ჩვენი“ გალაქტიკა · ფერი: ლურჯი ახლოს → წითელი შორს (წითელი წანაცვლება)`,10,18);
    $('csI').innerHTML=`H₀ = ${H0} კმ/წმ/მპკ → სამყაროს ასაკი ≈ 1/H₀ = <b>${(977.8/H0).toFixed(1)} მლრდ წელი</b>. 100 მპკ-ზე (326 მლნ სინ. წელი) გალაქტიკა შორდება ${H0*100} კმ/წმ-ით.`;
    /* scale zoom */
    zg.fillStyle='#05040c';zg.fillRect(0,0,zg.W,zg.H);for(const [e,n,d] of SCALE){const x=430+(e-Z)*55;if(x<-80||x>940)continue;const near=Math.abs(e-Z)<0.6;const r=clamp(70*Math.pow(10,(e-Z)*0.35),2,60);
      const gr=zg.createRadialGradient(x,70,0,x,70,r);gr.addColorStop(0,near?'#ffe8a8':'#a0b8ff');gr.addColorStop(1,'rgba(0,0,0,0)');zg.fillStyle=gr;zg.beginPath();zg.arc(x,70,r,0,TAU);zg.fill();
      zg.fillStyle=near?'#ecd59a':'rgba(220,210,190,.6)';zg.font=(near?'600 13px':'11px')+' sans-serif';zg.textAlign='center';zg.fillText(n,x,130);zg.fillStyle=COL.dim;zg.font='10px sans-serif';zg.fillText('10'+(e<0?'⁻':'')+String(Math.round(Math.abs(e))).replace(/\d/g,d2=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d2])+' მ',x,146);}
    zg.strokeStyle='rgba(201,168,76,.4)';zg.beginPath();zg.moveTo(430,8);zg.lineTo(430,150);zg.stroke();
    const nr=SCALE.reduce((b2,s)=>Math.abs(s[0]-Z)<Math.abs(b2[0]-Z)?s:b2);$('scI').innerHTML=`<b>${nr[1]}</b> — ${nr[2]}. სულ 62 რიგი: პლანკის სიგრძიდან დაკვირვებად სამყარომდე. ადამიანი დაახლოებით შუაშია — ატომსა და ვარსკვლავს შორის.`;
  });
 }});

/* ═══════════════════ 14. SPECIAL RELATIVITY ═══════════════════ */
reg({id:'rel',ico:'⏱',t:'ფარდობითობის თეორია',s:'სინათლის საათი · დროის შენელება · სიგრძის შემოკლება · ტყუპები',
 build(root){
  root.innerHTML=`<div id="rlC"></div><div class="actl">${sl('rlV','სიჩქარე v (სინათლის წილი)',0,0.995,0.005,0.6,'c')}</div><div id="rlI" class="ainfo"></div><div id="rlG"></div>
   ${card('🧮 ტყუპების პარადოქსი',`<div class="calc"><label>ფრენის სიჩქარე, c<input id="twV" type="number" value="0.9" step="0.01"></label><label>დედამიწაზე გასული დრო, წ<input id="twT" type="number" value="20"></label></div><div id="twO" class="ainfo"></div>`)}
   ${card('ფორმულები',FX([['γ = 1 / √(1 − v²/c²)','ლორენცის ფაქტორი',{s:[['v','სიჩქარე'],['c','სინათლის სიჩქარე, 299 792 458 მ/წმ']],w:'ყოველდღიურ სიჩქარეებზე γ ≈ 1, ამიტომ ეფექტები შეუმჩნეველია. სინათლის სიჩქარესთან γ უსასრულობისკენ მიდის.'}],
     ['Δt = γ·Δt₀','დროის შენელება',{s:[['Δt₀','საკუთარი დრო (მოძრავი საათით)'],['Δt','დრო უძრავი დამკვირვებლისთვის']],w:'მოძრავი საათი ნელა მიდის. ეს არა ილუზია, არამედ რეალობაა: კოსმოსური სხივებით დაბადებული მიუონები ატმოსფეროში ამიტომ აღწევენ ზედაპირამდე — მათი დრო ნელა „მიდის“.'}],
     ['L = L₀ / γ','სიგრძის შემოკლება',{s:[['L₀','საკუთარი სიგრძე']],w:'მოძრავი საგანი მოძრაობის მიმართულებით შემოკლებულია — მხოლოდ სხვა დამკვირვებლისთვის.'}],
     ['E = m·c²','მასისა და ენერგიის ეკვივალენტობა',{s:[['E','ენერგია'],['m','მასა']],w:'მასა — „შეკუმშული“ ენერგიაა. 1 გრამი მასა = 9·10¹³ ჯ, ჰიროსიმის ბომბზე მეტი. მზე ყოველ წამში 4 მლნ ტონას აქცევს სინათლედ.'}],
     ['E² = (pc)² + (mc²)²','სრული ენერგია',{s:[['p','იმპულსი']],w:'ფოტონს მასა არ აქვს, მაგრამ იმპულსი აქვს — E = pc. ამიტომ შეიძლება „მზის იალქანი“.'}],
     ['u = (v₁ + v₂)/(1 + v₁v₂/c²)','სიჩქარეთა შეკრება',{s:[],w:'0.9c + 0.9c = 0.994c, არა 1.8c. სინათლის სიჩქარე ყველა დამკვირვებლისთვის ერთნაირია — ეს არის თეორიის საფუძველი.'}]]))}`;
  const c=canvas($('rlC'),900,330),g=c.g,gc=canvas($('rlG'),900,150),gg=gc.g;let v=0.6,t0=0,tr=0,ship=0;
  bindSl('rlV',x=>{v=x;});
  const tw=()=>{const V=+$('twV').value,T=+$('twT').value;if(!(V>0&&V<1)){$('twO').innerHTML='0 < v < 1';return;}const gm=1/Math.sqrt(1-V*V);$('twO').innerHTML=`γ = ${gm.toFixed(3)} · მოგზაური ტყუპი დაბერდება <b>${(T/gm).toFixed(2)} წლით</b>, დედამიწაზე დარჩენილი — <b>${T} წლით</b>. სხვაობა ${(T-T/gm).toFixed(2)} წელი. (ის ამ დროში გაფრინდა ${(V*T/2).toFixed(1)} სინ. წლის მანძილზე და უკან.)`;};
  ['twV','twT'].forEach(i=>$(i).oninput=tw);tw();
  anim(dt=>{const gm=1/Math.sqrt(1-v*v);t0+=dt;tr+=dt/gm;ship=(ship+v*dt*120)%1100;
    g.fillStyle='#04030c';g.fillRect(0,0,g.W,g.H);
    /* stationary light clock */
    const clock=(cx,base,H,ph,lab,col,squeeze)=>{g.fillStyle='#8a8a9a';g.fillRect(cx-30*squeeze,base,60*squeeze,5);g.fillRect(cx-30*squeeze,base-H,60*squeeze,5);
      const up=ph%2<1,y=up?base-(ph%1)*H:base-H+(ph%1)*H;return y;};
    const P=1.2;/* seconds per tick for rest clock */
    const ph0=(t0/P)*2,phm=(t0/(P*gm))*2;
    const y0=clock(150,280,200,ph0,'',0,1);g.fillStyle='#ffe060';g.shadowColor='#ffe060';g.shadowBlur=14;g.beginPath();g.arc(150,y0,6,0,TAU);g.fill();g.shadowBlur=0;
    g.fillStyle=COL.gl;g.font='12px sans-serif';g.textAlign='center';g.fillText('უძრავი საათი',150,310);g.fillText(`ტიკი: ${Math.floor(t0/P)}`,150,325);
    /* moving clock: light zig-zags */
    const sx=200+ship*0.6,len=1/gm;g.save();const mcx=sx;g.fillStyle='#8a8a9a';g.fillRect(mcx-30*len,275,60*len,5);g.fillRect(mcx-30*len,75,60*len,5);
    const k=Math.floor(phm),f=phm-k,yy=k%2===0?275-f*200:75+f*200;g.strokeStyle='rgba(255,224,96,.35)';g.beginPath();const hist=[];for(let j=0;j<40;j++){const pj=phm-j*0.05;if(pj<0)break;const kj=Math.floor(pj),fj=pj-kj,yj=kj%2===0?275-fj*200:75+fj*200;hist.push([mcx-j*0.05*P*gm/2*v*120*0.6,yj]);}
    hist.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();g.fillStyle='#ffe060';g.shadowColor='#ffe060';g.shadowBlur=14;g.beginPath();g.arc(mcx,yy,6,0,TAU);g.fill();g.shadowBlur=0;g.restore();
    g.fillStyle=COL.gl;g.fillText(`მოძრავი საათი (${v.toFixed(3)}c)`,mcx,310);g.fillText(`ტიკი: ${Math.floor(t0/(P*gm))}`,mcx,325);
    $('rlI').innerHTML=`<div class="kv2"><b>γ</b><span style="font-size:16px;color:var(--gold-lt)">${gm.toFixed(4)}</span><b>დრო</b><span>უძრავი დამკვირვებლის 1 წამში მოძრავ საათზე გადის ${(1/gm).toFixed(4)} წმ</span><b>სიგრძე</b><span>1 მ ჯოხი → ${(1/gm).toFixed(4)} მ (შეხედე, როგორ ვიწროვდება საათი)</span><b>კინეტიკური ენერგია 1 კგ-ზე</b><span>${fmtN((gm-1)*C_L*C_L)} ჯ</span></div><div class="hint">სინათლე ორივე საათში ერთი და იგივე სიჩქარით მოძრაობს, მაგრამ მოძრავში ირიბ, გრძელ გზას გადის — ამიტომ მისი „ტიკი“ ნელია. ეს არის დროის შენელების მთელი საიდუმლო.</div>`;
    gg.clearRect(0,0,gg.W,gg.H);const Pl=plot(gg,{x:[0,1],y:[1,8],xl:'v / c',yl:'γ',xt:[0,0.5,0.9,1],yt:[1,2,4,8],m:[8,10,24,30]});gg.beginPath();for(let i=0;i<=300;i++){const x=i/300*0.992;const y=1/Math.sqrt(1-x*x);i?gg.lineTo(Pl.X(x),Pl.Y(Math.min(8,y))):gg.moveTo(Pl.X(x),Pl.Y(y));}gg.strokeStyle=COL.gold;gg.lineWidth=2;gg.stroke();
    gg.fillStyle='#7fd8ff';gg.beginPath();gg.arc(Pl.X(v),Pl.Y(Math.min(8,gm)),5,0,TAU);gg.fill();
  });
 }});

/* ═══════════════════ 15. QUANTUM — double slit ═══════════════════ */
reg({id:'quant',ico:'🎲',t:'კვანტური საოცრებები',s:'ორი ჭრილი · დამკვირვებლის ეფექტი · ყუთში ჩაკეტილი ნაწილაკი · გვირაბი',
 build(root){
  root.innerHTML=`<div id="qsC"></div><div class="actl"><label class="hint"><input type="checkbox" id="qsO"> 👁 ვაკვირდებით, რომელ ჭრილში გაიარა</label>${sl('qsR','სიჩქარე (ნაწილაკი/წმ)',5,400,5,80)}${sl('qsD','ჭრილებს შორის მანძილი',2,12,0.5,5)}<div class="abt"><button id="qsX">↺ ეკრანის გასუფთავება</button></div></div><div id="qsI" class="ainfo"></div>
   <div class="arow"><div class="acol">${card('ყუთში ჩაკეტილი ნაწილაკი',`<div id="pbC"></div>${sl('pbN','კვანტური რიცხვი n',1,6,1,2)}<div id="pbI" class="hint"></div>`)}</div><div class="acol">${card('კვანტური გვირაბი',`<div id="tnC"></div>${sl('tnW','ბარიერის სისქე',0.2,3,0.05,1)}${sl('tnE','ენერგია / ბარიერის სიმაღლე',0.1,0.99,0.01,0.6)}<div id="tnI" class="hint"></div>`)}</div></div>
   ${card('ფორმულები',FX([['λ = h / p','დე ბროილის ტალღა',{s:[['p','იმპულსი']],w:'ელექტრონებიც ტალღებივით ინტერფერირებს. ცალ-ცალკე გაშვებული ელექტრონებიც კი ზოლებს ქმნის — თითოეული „ორივე ჭრილში“ გადის.'}],
     ['d·sinθ = k·λ','ზოლების მდებარეობა',{s:[['d','ჭრილებს შორის მანძილი'],['θ','კუთხე'],['k','მთელი რიცხვი']],w:'ჭრილები ერთმანეთს რაც უფრო ახლოსაა, ზოლები მით უფრო ფართოა.'}],
     ['|ψ|² — ალბათობა','ბორნის წესი',{s:[['ψ','ტალღური ფუნქცია']],w:'თითოეული ნაწილაკის ადგილი შემთხვევითია, მაგრამ ბევრი ნაწილაკი ზუსტად |ψ|²-ის სურათს ხატავს. როცა „ვუყურებთ“, რომელ ჭრილში გაიარა, ინტერფერენცია ქრება — გაზომვა სისტემას ცვლის.'}],
     ['E<sub>n</sub> = n²·h² / (8·m·L²)','ყუთში ჩაკეტილი ნაწილაკი',{s:[['n','1, 2, 3…'],['L','ყუთის სიგრძე']],w:'ნაწილაკს ნულოვანი ენერგია ვერ ექნება — ყველაზე დაბალ მდგომარეობაშიც „ფართხალებს“. რაც პატარაა ყუთი, მით მაღალია ენერგია — ამიტომ აქვს ქვანტურ წერტილებს (QLED ეკრანები) სხვადასხვა ფერი.'}],
     ['T ≈ e<sup>−2κa</sup>, κ = √(2m(V−E))/ħ','გვირაბული ეფექტი',{s:[['T','გავლის ალბათობა'],['a','ბარიერის სისქე'],['V','ბარიერის სიმაღლე'],['E','ენერგია']],w:'ნაწილაკი კედელში „გაჟონავს“, თუმცა ენერგია არ ჰყოფნის. ამით ანათებს მზე (პროტონები ვერ შეერწყმოდნენ), მუშაობს ფლეშ-მეხსიერება და გვირაბული მიკროსკოპი.'}],
     ['ΔE·Δt ≥ ħ/2','ენერგია–დრო',{s:[],w:'ძალიან მოკლე დროით „ვაკუუმიდანაც“ შეიძლება ნაწილაკ-ანტინაწილაკის წყვილი წარმოიშვას — ვირტუალური ნაწილაკები.'}]]))}`;
  const c=canvas($('qsC'),900,380),g=c.g;let obs=false,rate=80,dsl=5,hits=new Float32Array(300),pts=[],acc=0,N=0;
  const pc=canvas($('pbC'),420,200),pg=pc.g,tc=canvas($('tnC'),420,200),tg=tc.g;let pn=2,tw2=1,te=0.6;
  const prob=x=>{/* x in [-1,1] on screen: single-slit envelope × two-slit fringes */const th=x*0.5,beta=7*Math.sin(th),env=Math.pow(beta===0?1:Math.sin(beta)/beta,2);if(obs)return env;return env*Math.pow(Math.cos(Math.PI*dsl*1.7*Math.sin(th)),2);};
  const sample=()=>{for(let k=0;k<200;k++){const x=Math.random()*2-1;if(Math.random()<prob(x))return x;}return 0;};
  $('qsO').onchange=e=>{obs=e.target.checked;hits.fill(0);pts=[];N=0;};bindSl('qsR',v=>rate=v);bindSl('qsD',v=>{dsl=v;hits.fill(0);pts=[];N=0;});$('qsX').onclick=()=>{hits.fill(0);pts=[];N=0;};
  bindSl('pbN',v=>pn=v);bindSl('tnW',v=>tw2=v);bindSl('tnE',v=>te=v);
  let flying=[];
  anim((dt,T)=>{acc+=rate*dt;while(acc>=1){acc--;const x=sample(),sl2=Math.random()<0.5?-1:1;flying.push({t:0,x,sl:sl2});}
    flying.forEach(f=>{f.t+=dt*2.5;if(f.t>=1&&!f.done){f.done=1;const b=Math.floor((f.x+1)/2*299);hits[b]++;pts.push([780+Math.random()*60,190+f.x*170]);if(pts.length>6000)pts.shift();N++;}});flying=flying.filter(f=>!f.done);
    g.fillStyle='#03020a';g.fillRect(0,0,g.W,g.H);
    g.fillStyle='#7fd8ff';g.beginPath();g.arc(60,190,10,0,TAU);g.fill();g.fillStyle=COL.mid;g.font='11px sans-serif';g.textAlign='center';g.fillText('წყარო',60,220);
    const sx=380,gap=dsl*7;g.fillStyle='#5a5a6a';g.fillRect(sx-4,20,8,190-gap-10);g.fillRect(sx-4,190-gap+10,8,2*gap-20);g.fillRect(sx-4,190+gap+10,8,360-190-gap);
    if(obs){g.fillStyle='rgba(255,200,80,.85)';g.font='18px sans-serif';g.fillText('👁',sx+26,190-gap+5);g.fillText('👁',sx+26,190+gap+5);}
    flying.forEach(f=>{const t=f.t;let x,y;if(t<0.45){x=60+(sx-60)*t/0.45;y=190+(f.sl*gap)*(t/0.45);}else{const u=(t-0.45)/0.55;x=sx+(780-sx)*u;y=190+f.sl*gap*(1-u)+f.x*170*u;}
      if(!obs&&t>0.45){g.strokeStyle='rgba(127,216,255,.06)';g.beginPath();g.arc(sx,190-gap,(t-0.45)*700,-0.9,0.9);g.stroke();g.beginPath();g.arc(sx,190+gap,(t-0.45)*700,-0.9,0.9);g.stroke();}
      g.fillStyle='#bfe6ff';g.beginPath();g.arc(x,y,2.2,0,TAU);g.fill();});
    g.fillStyle='#111';g.fillRect(780,20,60,340);for(const p of pts){g.fillStyle='rgba(140,230,255,.55)';g.fillRect(p[0],p[1],1.6,1.6);}
    const mx=Math.max(1,...hits);g.strokeStyle=COL.gold;g.lineWidth=1.5;g.beginPath();for(let i=0;i<300;i++){const y=190+(i/299*2-1)*170,x=848+hits[i]/mx*45;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
    $('qsI').innerHTML=`დაეცა <b>${N}</b> ნაწილაკი. ${obs?'<b>ვაკვირდებით</b> — ნაწილაკი ერთ კონკრეტულ ჭრილში გადის და ზოლები <b>ქრება</b>: მხოლოდ ორი ლაქა რჩება.':'არავინ უყურებს — თითოეული ნაწილაკი ტალღასავით ორივე ჭრილში გადის და საკუთარ თავთან ინტერფერირებს. ცალ-ცალკე წერტილებიდან ზოლები თანდათან „ამოიზრდება“.'} ეს ფეინმანის სიტყვებით „კვანტური მექანიკის ერთადერთი საიდუმლოა“.`;
    /* particle in a box */
    pg.clearRect(0,0,pg.W,pg.H);const P=plot(pg,{x:[0,1],y:[-1.3,1.3],xl:'x / L',m:[8,8,22,14]});pg.fillStyle='rgba(201,168,76,.4)';pg.fillRect(P.x0-4,P.y0,4,P.h);pg.fillRect(P.x0+P.w,P.y0,4,P.h);
    pg.beginPath();for(let i=0;i<=200;i++){const x=i/200,y=Math.sin(pn*Math.PI*x)*Math.cos(T*pn*pn*0.8);i?pg.lineTo(P.X(x),P.Y(y)):pg.moveTo(P.X(x),P.Y(y));}pg.strokeStyle='#7fd8ff';pg.lineWidth=2;pg.stroke();
    pg.beginPath();for(let i=0;i<=200;i++){const x=i/200,y=Math.pow(Math.sin(pn*Math.PI*x),2);i?pg.lineTo(P.X(x),P.Y(y)):pg.moveTo(P.X(x),P.Y(y));}pg.lineTo(P.X(1),P.Y(0));pg.lineTo(P.X(0),P.Y(0));pg.fillStyle='rgba(232,160,80,.3)';pg.fill();
    $('pbI').innerHTML=`n = ${pn}: ენერგია ∝ n² = <b>${pn*pn}</b>·E₁ · კვანძები: ${pn-1} — იქ ნაწილაკი არასდროს იქნება. ცისფერი — ψ (ირხევა), ნარინჯისფერი — |ψ|² (ალბათობა, უძრავი).`;
    /* tunnelling */
    tg.clearRect(0,0,tg.W,tg.H);const bx0=200,bw=tw2*40,kap=Math.sqrt(1-te)*2.2,Tp=Math.exp(-2*kap*tw2);tg.fillStyle='rgba(232,112,90,.25)';tg.fillRect(bx0,30,bw,150);tg.fillStyle=COL.mid;tg.font='10px sans-serif';tg.fillText('ბარიერი V',bx0+2,24);
    tg.strokeStyle='rgba(255,255,255,.3)';tg.beginPath();tg.moveTo(0,180-te*150);tg.lineTo(420,180-te*150);tg.stroke();tg.fillText('ნაწილაკის E',4,175-te*150);
    tg.beginPath();for(let x=0;x<=420;x+=2){let y;if(x<bx0)y=Math.sin(x*0.12-T*5)*35;else if(x<bx0+bw)y=35*Math.exp(-kap*(x-bx0)/40)*Math.sin(bx0*0.12-T*5);else y=Math.sin(x*0.12-T*5)*35*Math.sqrt(Tp);tg.lineTo(x,105-y);}tg.strokeStyle='#7fd8ff';tg.lineWidth=2;tg.stroke();
    $('tnI').innerHTML=`გავლის ალბათობა ≈ <b>${(Tp*100).toFixed(Tp<0.01?4:2)}%</b> — ბარიერის ორჯერ გასქელება ალბათობას კვადრატში ამცირებს. კლასიკურად ეს 0% იქნებოდა.`;
  });
 }});

/* ═══════════════════ 16. CHAOS — double pendulum & Lorenz attractor ═══════════════════ */
reg({id:'chaos',ico:'🦋',t:'ქაოსი და მეტაფიზიკა',s:'ორმაგი ქანქარა · ლორენცის ატრაქტორი · პეპლის ეფექტი · დიდი კითხვები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="dpC"></div><div class="abt"><button id="dpR">↺ ახალი დასაწყისი</button></div><div class="hint">10 ქანქარა, რომელთა საწყისი კუთხე მხოლოდ 0.001°-ით განსხვავდება. რამდენიმე წამში სრულიად სხვადასხვა გზით მიდიან.</div></div>
   <div class="acol"><div id="lzC"></div>${sl('lzR','ρ (რეილის რიცხვი)',10,60,0.5,28)}<div class="hint">ლორენცის ატრაქტორი — ამინდის მოდელი, რომლითაც ედვარდ ლორენცმა 1963-ში ქაოსი აღმოაჩინა. გადაათრიე — მოატრიალე.</div></div></div>
   ${card('🌀 დიდი კითხვები — ფიზიკის საზღვარზე',`<div class="meta">
     <div><b>⏳ რატომ მიდის დრო მხოლოდ წინ?</b>ფიზიკის თითქმის ყველა კანონი დროში შექცევადია — ფილმი უკუღმაც „ფიზიკური“ იქნებოდა. ისარს მხოლოდ ენტროპიის ზრდა იძლევა: სამყარო დაიწყო უაღრესად მოწესრიგებულ მდგომარეობაში და მას შემდეგ „იშლება“.</div>
     <div><b>🦋 დეტერმინიზმი თუ თავისუფლება?</b>ნიუტონის სამყაროში ყველაფერი წინასწარ განსაზღვრულია. ქაოსი აჩვენებს, რომ მცირე განუზღვრელობაც ექსპონენციალურად იზრდება — მომავლის ზუსტი პროგნოზი პრაქტიკულად შეუძლებელია. კვანტურ სამყაროში კი შემთხვევითობა თავად ბუნების თვისებაა.</div>
     <div><b>👁 რას ნიშნავს „გაზომვა“?</b>კვანტურ მექანიკაში დაკვირვება შედეგს ცვლის (იხ. ორი ჭრილი). რამდენიმე ინტერპრეტაცია არსებობს: კოპენჰაგენის (ტალღური ფუნქციის „კოლაფსი“), მრავალი სამყაროს (ყველა შედეგი ხდება, სხვადასხვა შტოში) და სხვა. ექსპერიმენტულად ისინი ჯერ ვერ განვასხვავეთ.</div>
     <div><b>🌌 რატომ არის სამყარო გასაგები?</b>აინშტაინი: „სამყაროს ყველაზე გაუგებარი ის არის, რომ ის გასაგებია“. მათემატიკა, ადამიანის აზროვნების ნაყოფი, ზუსტად აღწერს ელექტრონს და გალაქტიკას — ვიგნერმა ამას „მათემატიკის უგონო ეფექტურობა“ უწოდა.</div>
     <div><b>🎛 რატომ არის მუდმივები „სწორად“ შერჩეული?</b>გრავიტაცია ოდნავ ძლიერი რომ ყოფილიყო, ვარსკვლავები სწრაფად ჩაქრებოდა; ბირთვული ძალა ოდნავ სუსტი — ნახშირბადი არ იარსებებდა. ეს „ზუსტი მორგება“ ღია კითხვაა: დამთხვევა, მრავალი სამყარო თუ უფრო ღრმა კანონი?</div>
     <div><b>👽 ფერმის პარადოქსი</b>გალაქტიკაში მილიარდობით პლანეტაა, ასაკი — 13 მლრდ წელი. „სად არიან ყველა?“ — იკითხა ფერმიმ. პასუხი არ ვიცით: სიცოცხლე იშვიათია, ცივილიზაციები ხანმოკლეა, ან უბრალოდ ვერ ვამჩნევთ.</div>
     <div><b>🌑 რისგან შედგება სამყარო?</b>ჩვეულებრივი მატერია — მხოლოდ ~5%. ~27% — ბნელი მატერია (გალაქტიკებს აკავებს, მაგრამ არ ანათებს), ~68% — ბნელი ენერგია (გაფართოებას აჩქარებს). ორივეს ბუნება უცნობია.</div></div>`)}
   ${card('ფორმულები',FX([['δ(t) ≈ δ₀·e<sup>λt</sup>','ლიაპუნოვის ექსპონენტა',{s:[['δ₀','საწყისი მცირე სხვაობა'],['λ','ლიაპუნოვის ექსპონენტა']],w:'ქაოსურ სისტემაში მცირე სხვაობა ექსპონენციალურად იზრდება. ამინდის პროგნოზი ამიტომ ~10 დღეზე შორს ვერ ხერხდება — „პეპლის ფრთის ფრთხიალი ბრაზილიაში ტეხასში ტორნადოს იწვევს“.'}],
     ['dx/dt = σ(y − x), dy/dt = x(ρ − z) − y, dz/dt = xy − βz','ლორენცის სისტემა',{s:[['σ = 10, β = 8/3','სტანდარტული პარამეტრები'],['ρ','ქაოსი იწყება ρ ≈ 24.7-დან']],w:'სამი მარტივი განტოლება — და მაინც ტრაექტორია არასდროს მეორდება და არასდროს კვეთს თავის თავს. „უცნაური ატრაქტორი“ ფრაქტალური სტრუქტურისაა.'}],
     ['S = k·lnW','ენტროპია და დროის ისარი',{s:[],w:'მოწესრიგებულ მდგომარეობას ცოტა ვარიანტი აქვს, მოუწესრიგებელს — ასტრონომიული. ამიტომ სისტემა თითქმის აუცილებლად მოუწესრიგებლობისკენ მიდის.'}],
     ['N = R*·f<sub>p</sub>·n<sub>e</sub>·f<sub>l</sub>·f<sub>i</sub>·f<sub>c</sub>·L','დრეიკის განტოლება',{s:[['N','კომუნიკაბელური ცივილიზაციები გალაქტიკაში'],['L','ცივილიზაციის სიცოცხლის ხანგრძლივობა']],w:'არა გამოთვლა, არამედ ჩვენი უცოდინრობის სია: თითოეული მამრავლი სხვადასხვა მეცნიერებას ეკუთვნის, ბოლოები კი სრულიად უცნობია.'}]]))}`;
  const dc=canvas($('dpC'),440,420),dg=dc.g;let P=[];
  const resetDP=()=>{P=[];const a=2.6+Math.random()*0.4;for(let i=0;i<10;i++)P.push({a1:a+i*0.001*Math.PI/180,a2:a,w1:0,w2:0,tr:[],col:`hsl(${i*36},90%,62%)`});};resetDP();$('dpR').onclick=resetDP;
  const lc=canvas($('lzC'),440,420),S=S3(lc,{scale:11,spin:0.18,pitch:0.15});let L={x:1,y:1,z:20},trail=[],rho=28;bindSl('lzR',v=>{rho=v;trail=[];});
  anim((dt,T)=>{const g1=9.81,l1=1,l2=1,m1=1,m2=1;
    for(const p of P){for(let k=0;k<30;k++){const h=dt/30*1.4,{a1,a2,w1,w2}=p,d=a1-a2,den=2*m1+m2-m2*Math.cos(2*d);
      const al1=(-g1*(2*m1+m2)*Math.sin(a1)-m2*g1*Math.sin(a1-2*a2)-2*Math.sin(d)*m2*(w2*w2*l2+w1*w1*l1*Math.cos(d)))/(l1*den);
      const al2=(2*Math.sin(d)*(w1*w1*l1*(m1+m2)+g1*(m1+m2)*Math.cos(a1)+w2*w2*l2*m2*Math.cos(d)))/(l2*den);p.w1+=al1*h;p.w2+=al2*h;p.a1+=p.w1*h;p.a2+=p.w2*h;}
      const x1=220+Math.sin(p.a1)*95,y1=170+Math.cos(p.a1)*95,x2=x1+Math.sin(p.a2)*95,y2=y1+Math.cos(p.a2)*95;p.x1=x1;p.y1=y1;p.x2=x2;p.y2=y2;p.tr.push([x2,y2]);if(p.tr.length>160)p.tr.shift();}
    dg.fillStyle='rgba(4,3,12,1)';dg.fillRect(0,0,dg.W,dg.H);
    for(const p of P){dg.lineWidth=1.5;for(let k=1;k<p.tr.length;k++){dg.strokeStyle=p.col;dg.globalAlpha=k/p.tr.length*0.85;dg.beginPath();dg.moveTo(...p.tr[k-1]);dg.lineTo(...p.tr[k]);dg.stroke();}dg.globalAlpha=1;
      dg.strokeStyle='rgba(255,255,255,.35)';dg.lineWidth=1.2;dg.beginPath();dg.moveTo(220,170);dg.lineTo(p.x1,p.y1);dg.lineTo(p.x2,p.y2);dg.stroke();dg.fillStyle=p.col;dg.beginPath();dg.arc(p.x2,p.y2,5,0,TAU);dg.fill();}
    dg.fillStyle='#fff';dg.beginPath();dg.arc(220,170,4,0,TAU);dg.fill();
    /* Lorenz */
    for(let k=0;k<12;k++){const h=0.005,{x,y,z}=L;L={x:x+10*(y-x)*h,y:y+(x*(rho-z)-y)*h,z:z+(x*y-8/3*z)*h};trail.push([L.x/3,(L.z-25)/3,L.y/3]);}if(trail.length>5000)trail.splice(0,trail.length-5000);
    S.cloud=trail.map((p,i)=>[p[0],p[1],p[2],`hsla(${(i/trail.length*300+T*20)%360},90%,62%,.75)`,1.4]);S.atoms=[{p:trail[trail.length-1],r:0.35,c:'#ffffff'}];S.draw(dt);
  });
 }});

/* ═══════════════════ 17. CONSTANTS & ALL FORMULAS ═══════════════════ */
const PCONST=[['c','299 792 458 მ/წმ','სინათლის სიჩქარე'],['G','6.674·10⁻¹¹ ნ·მ²/კგ²','გრავიტაციული მუდმივა'],['h','6.626·10⁻³⁴ ჯ·წმ','პლანკის მუდმივა'],['ħ','1.055·10⁻³⁴ ჯ·წმ','h/2π'],['k<sub>B</sub>','1.381·10⁻²³ ჯ/K','ბოლცმანის მუდმივა'],
 ['e','1.602·10⁻¹⁹ კ','ელემენტარული მუხტი'],['m<sub>e</sub>','9.109·10⁻³¹ კგ','ელექტრონის მასა'],['m<sub>p</sub>','1.673·10⁻²⁷ კგ','პროტონის მასა'],['k','8.988·10⁹ ნ·მ²/კ²','კულონის მუდმივა'],['ε₀','8.854·10⁻¹² ფ/მ','ვაკუუმის შეღწევადობა'],['μ₀','1.257·10⁻⁶ ჰ/მ','მაგნიტური მუდმივა'],
 ['σ','5.670·10⁻⁸ ვტ/(მ²·K⁴)','სტეფან-ბოლცმანი'],['g','9.81 მ/წმ²','დედამიწაზე'],['M☉','1.989·10³⁰ კგ','მზის მასა'],['R☉','696 000 კმ','მზის რადიუსი'],['L☉','3.83·10²⁶ ვტ','მზის ნათება'],['M⊕','5.972·10²⁴ კგ','დედამიწის მასა'],['R⊕','6371 კმ','დედამიწის რადიუსი'],
 ['1 აუ','1.496·10¹¹ მ','დედამიწა–მზე'],['1 სინ. წელი','9.461·10¹⁵ მ',''],['1 პკ','3.26 სინ. წელი',''],['H₀','≈ 70 კმ/წმ/მპკ','ჰაბლის მუდმივა'],['t₀','13.8 მლრდ წელი','სამყაროს ასაკი']];
reg({id:'pref',ico:'∑',t:'ყველა ფორმულა და მუდმივა',s:'საძიებო ცნობარი',
 build(root){
  const all=[];TOP.forEach(t=>{if(t.fx)t.fx.forEach(f=>all.push([t.t,...f]));});
  root.innerHTML=`<input id="prQ" class="tin" placeholder="ძებნა: ენერგია, ტალღა, ორბიტა, γ…" style="width:100%;margin-bottom:10px">${card('ფიზიკური მუდმივები',`<table class="stq">${PCONST.map(c2=>`<tr><td><b>${c2[0]}</b></td><td>${c2[1]}</td><td class="hint">${c2[2]}</td></tr>`).join('')}</table>`)}<div id="prL"></div>`;
  const draw=()=>{const q=$('prQ').value.trim().toLowerCase(),groups={};all.filter(r=>!q||(r[0]+' '+r[1]+' '+r[2]).toLowerCase().replace(/<[^>]+>/g,'').includes(q)).forEach(r=>{(groups[r[0]]=groups[r[0]]||[]).push([r[1],r[2],r[3]]);});
    $('prL').innerHTML=Object.entries(groups).map(([k,v])=>card(k,FX(v))).join('')||'<div class="hint">ვერაფერი მოიძებნა.</div>';};$('prQ').oninput=draw;draw();
 }});

/* ═══════════════════ explanations (ℹ) on cards ═══════════════════ */
function attachXpP(root){root.querySelectorAll('.af[data-xi]:not([data-xb])').forEach(af=>{af.dataset.xb='1';const x=XPS[+af.dataset.xi];if(!x)return;
  const b=document.createElement('button');b.className='exbtn xpbtn';b.innerHTML='ℹ განმარტება';
  b.onclick=()=>{let d=af.querySelector('.fexp');if(d){d.remove();b.classList.remove('on');return;}d=document.createElement('div');d.className='fexp';
    d.innerHTML=(x.s&&x.s.length?`<div class="fsym">${x.s.map(([a,c2])=>`<span><b>${a}</b> — ${c2}</span>`).join('')}</div>`:'')+`<div class="fwhy">💡 ${x.w}</div>`;af.insertBefore(d,b);b.classList.add('on');};
  af.appendChild(b);});}

/* ═══════════════════ mount ═══════════════════ */
function harvest(){const tmp=document.createElement('div');tmp.style.display='none';document.body.appendChild(tmp);
  for(const t of TOP){if(t.id==='pref'||t.fx)continue;const save=STOPS;STOPS=[];const n0=XPS.length;try{t.build(tmp);}catch(e){}STOPS.forEach(f=>f());STOPS=save;
    const last=[...tmp.querySelectorAll('.acard')].pop();t.fx=last?[...last.querySelectorAll('.af')].map(a=>[a.querySelector('.ff').innerHTML,(a.querySelector('.fd')||{}).innerHTML||'',a.dataset.xi!=null?XPS[+a.dataset.xi]:null]):[];tmp.innerHTML='';}
  tmp.remove();}
function mount(){
  const host=$('phys');if(!host)return;
  new IntersectionObserver(es=>{VIS=es[0].isIntersecting;}).observe(host);
  const GR=[['მექანიკა და ტალღები',['proj','energy','coll','osc','waves']],['სინათლე, ელექტრობა, სითბო',['optics','efield','magnet','heat']],['ასტროფიზიკა',['orbit','stars','bh','cosmo']],['თანამედროვე ფიზიკა და „მეტა“',['rel','quant','chaos','pref']]];
  host.innerHTML=GR.map(([gn,ids])=>`<div class="tgrp">${gn}</div><div class="atop">${ids.map(id=>{const i=TOP.findIndex(t=>t.id===id),t=TOP[i];return `<button data-i="${i}"><i>${t.ico}</i><b>${t.t}</b><small>${t.s}</small></button>`;}).join('')}</div>`).join('')+'<div id="advBody"></div>';
  const body=$('advBody');new MutationObserver(()=>{attachXpP(body);if(window.__physEx)window.__physEx(body);}).observe(body,{childList:true,subtree:true});
  const open=i=>{stopAll();body.innerHTML='';host.querySelectorAll('.atop button').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));const t=TOP[i];
    if(t.id==='pref'&&!TOP.every(x=>x.id==='pref'||x.fx))harvest();
    body.innerHTML=`<div class="ahead"><span>${t.ico}</span> ${t.t}</div><div class="abody"></div>`;try{t.build(body.querySelector('.abody'));}catch(e){body.querySelector('.abody').innerHTML='<div class="terr">შეცდომა: '+esc(e.message)+'</div>';console.error(e);}
    try{localStorage.setItem('phys_topic',t.id);}catch(e){}};
  host.querySelectorAll('.atop button').forEach(b=>b.onclick=()=>{open(+b.dataset.i);body.scrollIntoView({behavior:'smooth',block:'start'});});
  let first=0;try{const k=localStorage.getItem('phys_topic');const i=TOP.findIndex(t=>t.id===k);if(i>=0)first=i;}catch(e){}
  open(first);
}
window.PHYS={TOP,open:id=>{const i=TOP.findIndex(t=>t.id===id);if(i>=0)document.querySelector(`#phys .atop button[data-i="${i}"]`).click();},stops:()=>STOPS.length};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
