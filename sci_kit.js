/* sci_kit.js — shared engine for the MAGNUS science labs (math, biology and the extra chemistry/physics
   lessons): canvases, sliders, button groups, formula cards with explanations, 2-D plots, a tiny 3-D renderer
   and animation loops that stop when a lesson closes. Exposed as window.SCIKIT. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
const R_GAS=8.314462618,F_C=96485.33212,NA=6.02214076e23,KB=1.380649e-23,H_PL=6.62607015e-34,C_L=299792458,RH=1.0967758e7,EV=1.602176634e-19;
const fmtN=(x,d=3)=>{if(x==null||!isFinite(x))return '—';const a=Math.abs(x);if(a!==0&&(a>=1e5||a<1e-3)){const e=Math.floor(Math.log10(a)),m=x/10**e;return `${m.toFixed(d-1)}·10<sup>${e}</sup>`;}return (+x.toPrecision(d+1)).toString();};
const COL={gold:'#c9a84c',gl:'#ecd59a',ink:'#efe6d4',mid:'#b3a68f',dim:'#6d6253',bg:'#0b0816',red:'#e8705a',blue:'#5a9ae8',green:'#6fcf8a',violet:'#9a6ae8',cyan:'#5fc8d8'};

/* ═══════════ shell: panel, topic cards, animation loops ═══════════ */
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


function attachXp(root){root.querySelectorAll('.af[data-xi]:not([data-xb])').forEach(af=>{af.dataset.xb='1';const x=XPS[+af.dataset.xi];if(!x)return;
  const b=document.createElement('button');b.className='exbtn xpbtn';b.innerHTML='ℹ განმარტება';
  b.onclick=()=>{let d=af.querySelector('.fexp');if(d){d.remove();b.classList.remove('on');return;}d=document.createElement('div');d.className='fexp';
    d.innerHTML=(x.s&&x.s.length?`<div class="fsym">${x.s.map(([a,c2])=>`<span><b>${a}</b> — ${c2}</span>`).join('')}</div>`:'')+`<div class="fwhy">💡 ${x.w}</div>`;af.insertBefore(d,b);b.classList.add('on');};
  af.appendChild(b);});}
/* plotting helpers shared with math_lab.js */
const r3=x=>Math.round(x*1000)/1000,gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;};
const sup=n=>String(n).replace(/[-0-9]/g,c=>'⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)]);
/* coordinate plane: grid, axes, labels; returns mappers */
function mplot(g,o){const W=g.W,H=g.H,m=o.m||[10,10,10,10],x0=m[3],y0=m[0],w=W-m[1]-m[3],h=H-m[0]-m[2],[a,b]=o.x,[c,d]=o.y;
  const X=v=>x0+(v-a)/(b-a)*w,Y=v=>y0+h-(v-c)/(d-c)*h,ix=p=>a+(p-x0)/w*(b-a),iy=p=>c+(y0+h-p)/h*(d-c);
  g.fillStyle=o.bg||'#0b0816';g.fillRect(0,0,W,H);
  const st=o.step||niceStep((b-a)/10),sy=o.stepY||niceStep((d-c)/8);
  g.lineWidth=1;g.strokeStyle=o.gc||'rgba(165,133,239,.08)';g.beginPath();
  for(let v=Math.ceil(a/st)*st;v<=b+1e-9;v+=st){g.moveTo(X(v),y0);g.lineTo(X(v),y0+h);}
  for(let v=Math.ceil(c/sy)*sy;v<=d+1e-9;v+=sy){g.moveTo(x0,Y(v));g.lineTo(x0+w,Y(v));}g.stroke();
  g.strokeStyle='rgba(214,198,255,.45)';g.beginPath();if(c<=0&&d>=0){g.moveTo(x0,Y(0));g.lineTo(x0+w,Y(0));}if(a<=0&&b>=0){g.moveTo(X(0),y0);g.lineTo(X(0),y0+h);}g.stroke();
  if(o.labels!==false){g.fillStyle='rgba(179,166,143,.75)';g.font='10px sans-serif';g.textAlign='center';const ly=clamp(Y(0)+12,y0+10,y0+h-2),lx=clamp(X(0)-4,x0+18,x0+w);
    for(let v=Math.ceil(a/st)*st;v<=b+1e-9;v+=st)if(Math.abs(v)>1e-9)g.fillText(+v.toFixed(4),X(v),ly);
    g.textAlign='right';for(let v=Math.ceil(c/sy)*sy;v<=d+1e-9;v+=sy)if(Math.abs(v)>1e-9)g.fillText(+v.toFixed(4),lx,Y(v)+3);}
  return {X,Y,ix,iy,x0,y0,w,h};}
function niceStep(r){const p=Math.pow(10,Math.floor(Math.log10(r))),f=r/p;return (f<1.5?1:f<3.5?2:f<7.5?5:10)*p;}
function curve(g,M,f,a,b,col,lw,dash){g.strokeStyle=col;g.lineWidth=lw||2;g.setLineDash(dash||[]);g.beginPath();let pen=false,py=null;const n=600;
  for(let i=0;i<=n;i++){const x=a+(b-a)*i/n,y=f(x);if(!isFinite(y)||(py!=null&&Math.abs(M.Y(y)-M.Y(py))>g.H)){pen=false;py=isFinite(y)?y:null;continue;}
    const px=M.X(x),pyy=M.Y(y);pen?g.lineTo(px,pyy):g.moveTo(px,pyy);pen=true;py=y;}g.stroke();g.setLineDash([]);g.lineWidth=1;}
const dot=(g,x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();};
function arrow(g,x1,y1,x2,y2,c,w){const a=Math.atan2(y2-y1,x2-x1),hl=Math.min(10,Math.hypot(x2-x1,y2-y1)*.4);g.strokeStyle=c;g.fillStyle=c;g.lineWidth=w||2;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-hl*Math.cos(a-.4),y2-hl*Math.sin(a-.4));g.lineTo(x2-hl*Math.cos(a+.4),y2-hl*Math.sin(a+.4));g.closePath();g.fill();g.lineWidth=1;}
const txt=(g,s,x,y,c,f,al)=>{g.fillStyle=c||COL.ink;g.font=f||'12px sans-serif';g.textAlign=al||'center';g.fillText(s,x,y);};
const drag=(c,on)=>{let d=false;c.style.touchAction='none';c.addEventListener('pointerdown',e=>{d=true;c.setPointerCapture(e.pointerId);on(c.pt(e),'down');});
  c.addEventListener('pointermove',e=>{if(d)on(c.pt(e),'move');});const up=()=>{d=false;};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);};


window.SCIKIT={mplot,curve,dot,arrow,txt,drag,niceStep,r3,gcd,sup,$,esc,cpk,clamp,lerp,TAU,fmtN,COL,anim,canvas,sl,bindSl,btns,bindBtns,FX,card,hexRgb,shade,rgba,wlRGB,S3,axes3,plot,stopAll,attachXp,XPS,
  setVis:v=>{VIS=v;},stops:()=>STOPS.length,onStop:f=>STOPS.push(f)};
})();
