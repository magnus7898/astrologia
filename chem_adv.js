/* chem_adv.js — „ქიმიის ენციკლოპედია“ for chem.html: 16 topics, each with a live animation,
   controls, calculators and the formulas. Uses chem.html globals (EL, BY, config, cfgText, CATN, esc).
   Everything is drawn on <canvas>; a small 3-D engine (S3) renders molecules, orbitals and crystals.  */
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
function anim(fn){let on=true,last=performance.now();const f=t=>{if(!on)return;const dt=Math.min(0.05,(t-last)/1000);last=t;if(VIS&&!document.hidden)fn(dt,t/1000);requestAnimationFrame(f);};requestAnimationFrame(f);STOPS.push(()=>on=false);}
function canvas(host,w,h){const c=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1);c.width=w*d;c.height=h*d;c.style.width='100%';c.style.maxWidth=w+'px';c.style.aspectRatio=w+' / '+h;c.className='acv';
  host.appendChild(c);const g=c.getContext('2d');g.scale(d,d);g.W=w;g.H=h;c.g=g;c.pt=ev=>{const r=c.getBoundingClientRect();return [(ev.clientX-r.left)*w/r.width,(ev.clientY-r.top)*h/r.height];};return c;}
/* slider: html + binding */
const sl=(id,lab,min,max,step,val,unit)=>`<label class="asl"><span>${lab}: <b id="${id}_v">${val}</b>${unit?' '+unit:''}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
function bindSl(id,fn,fmt){const r=$(id),v=$(id+'_v');const go=()=>{const x=+r.value;v.innerHTML=fmt?fmt(x):x;fn(x);};r.addEventListener('input',go);go();return r;}
const btns=(name,list,on)=>`<div class="abt" data-g="${name}">${list.map(([k,l])=>`<button data-k="${k}" class="${k==on?'on':''}">${l}</button>`).join('')}</div>`;
function bindBtns(root,name,fn){const g=root.querySelector(`.abt[data-g="${name}"]`);g.querySelectorAll('button').forEach(b=>b.onclick=()=>{g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));fn(b.dataset.k,b);});}
const FX=(list)=>`<div class="afx">${list.map(([f,d])=>`<div class="af"><div class="ff">${f}</div>${d?`<div class="fd">${d}</div>`:''}</div>`).join('')}</div>`;
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

/* ═══════════════════ 1. ATOMIC ORBITALS (hydrogen |ψ|² point cloud) ═══════════════════ */
function laguerre(k,a,x){if(k===0)return 1;let L0=1,L1=1+a-x;for(let i=1;i<k;i++){const L2=((2*i+1+a-x)*L1-(i+a)*L0)/(i+1);L0=L1;L1=L2;}return L1;}
const Rnl=(n,l,r)=>{const rho=2*r/n;return Math.exp(-rho/2)*Math.pow(rho,l)*laguerre(n-l-1,2*l+1,rho);};
function legendre(l,m,x){let pmm=1;if(m>0){const s=Math.sqrt((1-x)*(1+x));let f=1;for(let i=1;i<=m;i++){pmm*=-f*s;f+=2;}}if(l===m)return pmm;
  let pmm1=x*(2*m+1)*pmm;if(l===m+1)return pmm1;let pll=0;for(let ll=m+2;ll<=l;ll++){pll=((2*ll-1)*x*pmm1-(ll+m-1)*pmm)/(ll-m);pmm=pmm1;pmm1=pll;}return pll;}
const Ylm=(l,m,th,ph)=>{const P=legendre(l,Math.abs(m),Math.cos(th));return m>0?P*Math.cos(m*ph):m<0?P*Math.sin(-m*ph):P;};
const ONAME={'1,0':'p<sub>x</sub>','1,-1':'p<sub>y</sub>','1,0z':'p<sub>z</sub>','2,0':'d<sub>z²</sub>','2,1':'d<sub>xz</sub>','2,-1':'d<sub>yz</sub>','2,2':'d<sub>x²−y²</sub>','2,-2':'d<sub>xy</sub>',
  '3,0':'f<sub>z³</sub>','3,1':'f<sub>xz²</sub>','3,-1':'f<sub>yz²</sub>','3,2':'f<sub>z(x²−y²)</sub>','3,-2':'f<sub>xyz</sub>','3,3':'f<sub>x(x²−3y²)</sub>','3,-3':'f<sub>y(3x²−y²)</sub>'};
const oname=(l,m)=>l===0?'s':l===1?(m===0?'p<sub>z</sub>':m===1?'p<sub>x</sub>':'p<sub>y</sub>'):ONAME[l+','+m];
function sampleOrbital(n,l,m,N){
  const rmax=n*n*3.2+8,NB=1500,cdf=new Float64Array(NB+1);let acc=0;
  for(let i=1;i<=NB;i++){const r=(i-0.5)/NB*rmax,R=Rnl(n,l,r);acc+=r*r*R*R;cdf[i]=acc;}
  for(let i=0;i<=NB;i++)cdf[i]/=acc;
  let ymax=0;for(let a=0;a<=60;a++)for(let b=0;b<120;b++){const y=Ylm(l,m,a/60*Math.PI,b/120*TAU);ymax=Math.max(ymax,y*y);}ymax*=1.05;
  const pts=[],rs=[];let guard=0;
  while(pts.length<N&&guard++<N*400){
    const u=Math.random();let lo=0,hi=NB;while(lo<hi){const md=(lo+hi)>>1;if(cdf[md]<u)lo=md+1;else hi=md;}
    const r=(lo-Math.random())/NB*rmax;
    const ct=Math.random()*2-1,th=Math.acos(ct),ph=Math.random()*TAU,y=Ylm(l,m,th,ph);
    if(Math.random()*ymax>y*y)continue;
    const sg=Math.sign(Rnl(n,l,r)*y)||1,st=Math.sin(th);
    pts.push([r*st*Math.cos(ph),r*ct,r*st*Math.sin(ph),sg]);rs.push(r);}
  rs.sort((a,b)=>a-b);const r95=rs[Math.floor(rs.length*0.95)]||1;
  return {pts,r95,rmax,cdf};
}
reg({id:'orb',ico:'☁',t:'ატომური ორბიტალები',s:'შრედინგერის განტოლება · |ψ|² ღრუბელი 3D-ში',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="o3"></div><div class="hint">გადაათრიე — მოტრიალება · ბორბალი — მასშტაბი · ორმაგი დაჭერა — ავტო-ბრუნვა. ${'<span style="color:#e8a050">●</span>'} ψ > 0 · <span style="color:#5aa0f0">●</span> ψ < 0 (ტალღური ფუნქციის ფაზა)</div></div>
   <div class="acol"><div class="actl"><div>n (მთავარი): ${btns('n',[[1,1],[2,2],[3,3],[4,4]],2)}</div><div>l (ორბიტალური): <span id="oL"></span></div><div>m (მაგნიტური): <span id="oM"></span></div></div>
   <div id="oInfo" class="ainfo"></div><div id="oR"></div></div></div>
   ${card('ფორმულები',FX([['Ĥψ = Eψ, &nbsp; −(ħ²/2m)∇²ψ + V(r)ψ = Eψ','შრედინგერის სტაციონარული განტოლება'],['ψ<sub>nlm</sub>(r,θ,φ) = R<sub>nl</sub>(r)·Y<sub>l</sub><sup>m</sup>(θ,φ)','რადიალური × კუთხური ნაწილი'],
     ['E<sub>n</sub> = −13.6 eV · Z²/n²','წყალბადისმაგვარი ატომის ენერგია'],['P(r) = r²·R<sub>nl</sub>²(r)','ელექტრონის r მანძილზე პოვნის ალბათობა'],['n−l−1 რადიალური, l კუთხური კვანძი; სულ n−1','კვანძები — ψ = 0 ზედაპირები'],
     ['n = 1,2,3… · l = 0…n−1 · m = −l…+l · m<sub>s</sub> = ±½','ოთხი კვანტური რიცხვი'],['a<sub>0</sub> = 4πε<sub>0</sub>ħ²/(m<sub>e</sub>e²) = 52.9 პმ','ბორის რადიუსი']]))}`;
  const c=canvas($('o3'),460,400),S=S3(c,{scale:120,spin:0.4});
  const rc=canvas($('oR'),380,150);let st={n:2,l:1,m:0},data=null;
  const lBtns=()=>{$('oL').innerHTML=btns('l',Array.from({length:st.n},(_,i)=>[i,'spdf'[i]]),st.l);bindBtns(root,'l',k=>{st.l=+k;st.m=0;mBtns();gen();});};
  const mBtns=()=>{const L=[];for(let m=-st.l;m<=st.l;m++)L.push([m,oname(st.l,m)]);$('oM').innerHTML=btns('m',L,st.m);bindBtns(root,'m',k=>{st.m=+k;gen();});};
  function gen(){
    data=sampleOrbital(st.n,st.l,st.m,st.n>2?9000:7000);const sc=1.6/data.r95;
    S.cloud=data.pts.map(p=>[p[0]*sc,p[1]*sc,p[2]*sc,p[3]>0?'rgba(232,160,80,.55)':'rgba(90,160,240,.55)',1.6]);
    S.atoms=[{p:[0,0,0],r:0.06,c:'#fff'}];S.lines=axes3(2.2);S.scale=110;
    const nm=`${st.n}${oname(st.l,st.m)}`,E=-13.6/(st.n*st.n);
    $('oInfo').innerHTML=`<div class="big">${nm}</div><div class="kv2"><b>ენერგია</b><span>${E.toFixed(3)} eV</span><b>რადიალური კვანძები</b><span>${st.n-st.l-1}</span><b>კუთხური კვანძები</b><span>${st.l}</span>
      <b>ქვედონეში ორბიტალი</b><span>${2*st.l+1} (მაქს. ${2*(2*st.l+1)} e⁻)</span><b>შრეში მაქს.</b><span>2n² = ${2*st.n*st.n} e⁻</span><b>საშუალო რადიუსი</b><span>⟨r⟩ = ${((3*st.n*st.n-st.l*(st.l+1))/2).toFixed(1)} a₀ = ${((3*st.n*st.n-st.l*(st.l+1))/2*52.9).toFixed(0)} პმ</span></div>`;
    /* radial distribution */
    const g=rc.g;g.clearRect(0,0,g.W,g.H);const xm=Math.min(data.rmax,data.r95*1.6);const N=300,ys=[];let ym=0;
    for(let i=0;i<=N;i++){const r=i/N*xm,R=Rnl(st.n,st.l,r),v=r*r*R*R;ys.push(v);ym=Math.max(ym,v);}
    const P=plot(g,{x:[0,xm],y:[0,ym*1.1],xl:'r (a₀)',yl:'P(r)',xt:[0,Math.round(xm/2),Math.round(xm)],m:[10,8,26,24]});
    g.beginPath();ys.forEach((v,i)=>{const x=P.X(i/N*xm),y=P.Y(v);i?g.lineTo(x,y):g.moveTo(x,y);});g.strokeStyle=COL.gold;g.lineWidth=2;g.stroke();
    g.lineTo(P.X(xm),P.Y(0));g.lineTo(P.X(0),P.Y(0));g.fillStyle='rgba(201,168,76,.12)';g.fill();
    let prev=Rnl(st.n,st.l,0.01);for(let i=1;i<=N;i++){const r=i/N*xm,v=Rnl(st.n,st.l,r);if(Math.sign(v)!==Math.sign(prev)&&r>0.05){g.fillStyle=COL.red;g.beginPath();g.arc(P.X(r),P.Y(0),3.5,0,TAU);g.fill();}prev=v;}
    const rmp=ys.indexOf(ym)/N*xm;g.fillStyle=COL.gl;g.textAlign='left';g.fillText(`მაქსიმუმი ≈ ${rmp.toFixed(1)} a₀ · წითელი — კვანძი`,P.x0+6,P.y0+12);
  }
  bindBtns(root,'n',k=>{st.n=+k;if(st.l>=st.n)st.l=st.n-1;if(Math.abs(st.m)>st.l)st.m=0;lBtns();mBtns();gen();});
  lBtns();mBtns();gen();anim(dt=>S.draw(dt));
 }});

/* ═══════════════════ 2. LINE SPECTRUM — Bohr model & Rydberg ═══════════════════ */
const SERIES=[[1,'ლაიმანი','UV'],[2,'ბალმერი','ხილული'],[3,'პაშენი','IR'],[4,'ბრეკეტი','IR'],[5,'პფუნდი','IR']];
const lam=(n1,n2)=>1e9/(RH*(1/(n1*n1)-1/(n2*n2)));
reg({id:'spec',ico:'🌈',t:'ატომური სპექტრი',s:'ბორის მოდელი · რიდბერგის ფორმულა · ფოტონები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="sp1"></div></div><div class="acol"><div class="actl">
    <div>სერია: ${btns('ser',SERIES.map(s=>[s[0],s[1]]),2)}</div>${sl('spN','ზედა დონე n₂',3,8,1,3)}
    <div class="abt"><button id="spE" class="on">⬇ ემისია</button><button id="spA">⬆ შთანთქმა</button><button id="spC">✦ კასკადი n=7-დან</button></div></div><div id="spInfo" class="ainfo"></div></div></div>
    <div id="sp2"></div><div class="hint">ზედა ზოლი — ხილული სპექტრი (380–750 ნმ, ბალმერის ხაზები); ქვედა — ყველა სერია ლოგარითმულ სკალაზე (ნაცრისფერი — უხილავი).</div>
    ${card('ფორმულები',FX([['1/λ = R<sub>H</sub>·(1/n<sub>1</sub>² − 1/n<sub>2</sub>²)','რიდბერგის ფორმულა, R<sub>H</sub> = 1.0968·10⁷ მ⁻¹'],['E<sub>n</sub> = −13.6 eV/n²','ბორის ენერგიის დონეები'],['ΔE = hν = hc/λ','ფოტონის ენერგია; h = 6.626·10⁻³⁴ ჯ·წმ'],
      ['r<sub>n</sub> = n²·a<sub>0</sub>/Z','ბორის ორბიტის რადიუსი'],['mvr = nħ','კუთხური მომენტის კვანტვა'],['λ = h/(mv)','დე ბროილის ტალღის სიგრძე'],['Δx·Δp ≥ ħ/2','ჰაიზენბერგის განუზღვრელობა'],['E = hν − A<sub>გამ.</sub>','ფოტოეფექტი (აინშტაინი)']]))}`;
  const c=canvas($('sp1'),460,320),g=c.g,c2=canvas($('sp2'),900,120),g2=c2.g;
  let n1=2,n2=3,mode='e',ev=null,cur=n2,queue=[];
  const Ey=n=>{const E=-13.6/(n*n);return 30+(E+13.6)/13.6*0+ (1-(E+13.6)/13.6)*260;};
  function info(){const L=lam(n1,n2),E=1239.84/L;const reg=L<380?'ულტრაიისფერი':L<=750?'ხილული':'ინფრაწითელი';
    $('spInfo').innerHTML=`<div class="big" style="color:${L>=380&&L<=750?wlRGB(L):COL.gl}">${L.toFixed(1)} ნმ</div><div class="kv2"><b>გადასვლა</b><span>n=${n2} → n=${n1}</span><b>არე</b><span>${reg}</span><b>ფოტონის ენერგია</b><span>${E.toFixed(3)} eV = ${(E*96.485).toFixed(1)} კჯ/მოლ</span>
      <b>სიხშირე</b><span>${fmtN(C_L/(L*1e-9))} ჰც</span><b>ტალღური რიცხვი</b><span>${(1e7/L).toFixed(0)} სმ⁻¹</span></div>`;}
  function start(a,b,kind){ev={a,b,kind,t:0};}
  bindBtns(root,'ser',k=>{n1=+k;const r=$('spN');r.min=n1+1;if(+r.value<=n1)r.value=n1+1;r.dispatchEvent(new Event('input'));});
  bindSl('spN',v=>{n2=v;info();cur=n2;queue=[];start(n2,n1,'e');});
  $('spE').onclick=()=>{mode='e';$('spE').classList.add('on');$('spA').classList.remove('on');queue=[];start(n2,n1,'e');};
  $('spA').onclick=()=>{mode='a';$('spA').classList.add('on');$('spE').classList.remove('on');queue=[];start(n1,n2,'a');};
  $('spC').onclick=()=>{queue=[];let n=7;while(n>1){const nx=1+Math.floor(Math.random()*(n-1));queue.push([n,nx]);n=nx;}const q=queue.shift();start(q[0],q[1],'e');};
  const lvY=n=>295-(1-1/(n*n))*255;
  anim((dt,T)=>{g.clearRect(0,0,g.W,g.H);
    g.font='11px sans-serif';g.textAlign='left';
    for(let n=1;n<=8;n++){const y=lvY(n);g.strokeStyle=n<=6?'rgba(201,168,76,.55)':'rgba(201,168,76,.25)';g.lineWidth=1;g.beginPath();g.moveTo(150,y);g.lineTo(440,y);g.stroke();if(n<=4){g.fillStyle=COL.mid;g.fillText(`n=${n}  ${(-13.6/n/n).toFixed(2)} eV`,330,y-3);}}
    g.strokeStyle='rgba(255,255,255,.2)';g.setLineDash([3,3]);g.beginPath();g.moveTo(150,lvY(1e9));g.lineTo(440,lvY(1e9));g.stroke();g.setLineDash([]);g.fillStyle=COL.dim;g.fillText('n=∞ 0 eV (იონიზაცია)',330,lvY(1e9)-3);
    /* nucleus + orbits (Bohr picture) */
    const cx=70,cy=170;g.fillStyle='#e8705a';g.beginPath();g.arc(cx,cy,5,0,TAU);g.fill();
    for(let n=1;n<=5;n++){g.strokeStyle='rgba(201,168,76,.18)';g.beginPath();g.arc(cx,cy,Math.min(62,n*n*2.4+4),0,TAU);g.stroke();}
    let en=cur;
    if(ev){ev.t+=dt/1.6;const t=ev.t;
      const y1=lvY(ev.a),y2=lvY(ev.b),L=lam(Math.min(ev.a,ev.b),Math.max(ev.a,ev.b)),col=L>=380&&L<=750?wlRGB(L):L<380?'#b080ff':'#a04040';
      const ey=t<0.45?y1:y2;en=t<0.45?ev.a:ev.b;
      /* electron */
      g.fillStyle='#7fd8ff';g.beginPath();g.arc(200,t>0.4&&t<0.5?lerp(y1,y2,(t-0.4)/0.1):ey,5,0,TAU);g.fill();
      g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.moveTo(200,y1);g.lineTo(200,y2);g.globalAlpha=0.25;g.stroke();g.globalAlpha=1;
      /* photon wave */
      const px=ev.kind==='e'?lerp(200,470,clamp((t-0.45)/0.55,0,1)):lerp(470,200,clamp(t/0.45,0,1)),wl=clamp(L/40,4,30),py=(y1+y2)/2;
      if((ev.kind==='e'&&t>0.45)||(ev.kind==='a'&&t<0.45)){g.strokeStyle=col;g.lineWidth=2.2;g.beginPath();for(let k=-40;k<=0;k+=2){const x=px+(ev.kind==='e'?k:-k),y=py+Math.sin((k/wl)*TAU+T*12)*7;k===-40?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();
        g.fillStyle=col;g.font='600 12px sans-serif';g.fillText(`γ ${L.toFixed(0)} ნმ`,px-20,py-14);}
      if(t>=1){ev=null;cur=en;if(queue.length){const q=queue.shift();start(q[0],q[1],'e');}}}
    else{g.fillStyle='#7fd8ff';g.beginPath();g.arc(200,lvY(cur),5,0,TAU);g.fill();}
    const r=Math.min(62,en*en*2.4+4),a=T*3/Math.max(1,en);g.fillStyle='#7fd8ff';g.beginPath();g.arc(cx+r*Math.cos(a),cy+r*Math.sin(a),3.5,0,TAU);g.fill();
    g.fillStyle=COL.mid;g.textAlign='center';g.fillText(`ბორის ორბიტა n=${en}`,cx,cy+80);
    /* spectrum strips */
    g2.clearRect(0,0,g2.W,g2.H);const vx=w=>20+(w-380)/(750-380)*860;
    for(let w=380;w<=750;w+=1){g2.fillStyle=wlRGB(w);g2.globalAlpha=0.18;g2.fillRect(vx(w),6,860/370+0.5,36);}g2.globalAlpha=1;
    for(let k=3;k<=9;k++){const L=lam(2,k);if(L<380)continue;g2.fillStyle=wlRGB(L);g2.fillRect(vx(L)-1.5,6,3,36);g2.fillStyle=COL.mid;g2.font='9px sans-serif';g2.textAlign='center';if(k<=6)g2.fillText(L.toFixed(0),vx(L),52);}
    const lx=w=>20+(Math.log10(w)-Math.log10(80))/(Math.log10(8000)-Math.log10(80))*860;
    g2.strokeStyle='rgba(201,168,76,.3)';g2.strokeRect(20,62,860,30);
    for(const [s1,nm] of SERIES){for(let k=s1+1;k<=s1+8;k++){const L=lam(s1,k);g2.fillStyle=L>=380&&L<=750?wlRGB(L):'rgba(180,170,150,.5)';g2.fillRect(lx(L)-0.75,62,1.5,30);}g2.fillStyle=COL.gl;g2.font='10px sans-serif';g2.textAlign='center';g2.fillText(nm,lx(lam(s1,s1+1)*0.85),106);}
    const L0=lam(n1,n2);g2.strokeStyle='#fff';g2.lineWidth=2;g2.strokeRect(lx(L0)-3,60,6,34);if(L0>=380&&L0<=750)g2.strokeRect(vx(L0)-4,4,8,40);
    [100,200,500,1000,2000,5000].forEach(w=>{g2.fillStyle=COL.dim;g2.font='9px sans-serif';g2.fillText(w+' ნმ',lx(w),118);});
  });
  info();
 }});

/* ═══════════════════ 3. ELECTRON CONFIGURATION — aufbau, Hund, Pauli ═══════════════════ */
const MAD=['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p','6s','4f','5d','6p','7s','5f','6d','7p'];
reg({id:'aufbau',ico:'⇅',t:'ელექტრონული კონფიგურაცია',s:'აუფბაუ · ჰუნდის წესი · პაულის პრინციპი · კვანტური რიცხვები',
 build(root){
  root.innerHTML=`<div class="actl">${sl('afZ','ელემენტი Z',1,118,1,26)}<div class="abt"><button id="afGo" class="on">▶ შევსება ანიმაციით</button><button id="afAll">⏭ მაშინვე</button></div>${sl('afSp','სიჩქარე',1,30,1,8,'e⁻/წმ')}</div>
   <div id="afHd" class="ainfo"></div><div id="afC"></div><div id="afQ" class="ainfo"></div>
   ${card('წესები და ფორმულები',FX([['n + l → მცირე პირველი; თანაბრისას — მცირე n','მადელუნგის (კლეჩკოვსკის) წესი: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p'],['ორბიტალში ≤ 2 e⁻, საპირისპირო სპინით','პაულის აკრძალვის პრინციპი — ოთხივე კვანტური რიცხვი ერთნაირი არ შეიძლება'],
     ['ჯერ თითო ↑ ყველა ორბიტალში, მერე ↓','ჰუნდის წესი — მაქსიმალური ჯამური სპინი'],['ქვედონე: 2(2l+1) · შრე: 2n²','s 2 · p 6 · d 10 · f 14'],['გამონაკლისები: Cr 3d⁵4s¹, Cu 3d¹⁰4s¹, Pd 4d¹⁰…','ნახევრად ან სრულად შევსებული d-ქვედონე უფრო მდგრადია'],['μ = √(n(n+2)) μ<sub>B</sub>','მაგნიტური მომენტი n გაუწყვილებელი ელექტრონით']]))}`;
  const c=canvas($('afC'),900,330),g=c.g;let Z=26,shown=0,target=0,acc=0,speed=8;
  const lay=()=>{/* subshell rows by energy order, columns by n */const L={};MAD.forEach((s,i)=>{L[s]={i,n:+s[0],l:'spdf'.indexOf(s[1])};});return L;};const LY=lay();
  function fillState(k){/* first k electrons, in Madelung order, capped by the real configuration */
    const cf=config(Z),st={};let left=k;for(const s of MAD){const cap=cf[s]||0;const t=Math.min(cap,left);st[s]=t;left-=t;if(left<=0)break;}return st;}
  function boxes(s,cnt){const l='spdf'.indexOf(s[1]),nb=2*l+1,arr=Array.from({length:nb},()=>[0,0]);for(let e=0;e<cnt;e++){if(e<nb)arr[e][0]=1;else arr[e-nb][1]=1;}return arr;}
  function head(){const e=EL[Z],cf=config(Z);let unp=0;for(const s in cf){const l='spdf'.indexOf(s[1]),nb=2*l+1,k=cf[s];unp+=k<=nb?k:2*nb-k;}
    const exc=MAD.some(s=>{let left=Z,st={};for(const q of MAD){const cap={s:2,p:6,d:10,f:14}[q[1]];st[q]=Math.min(cap,left);left-=st[q];}return (st[s]||0)!==(cf[s]||0);});
    $('afHd').innerHTML=`<span class="big">${e.sym}</span> <b>${esc(e.ka)}</b> · Z = ${Z} · <span class="cf">${cfgText(Z)}</span> · გაუწყვილებელი e⁻: <b>${unp}</b> → ${unp?`პარამაგნიტური, μ ≈ ${Math.sqrt(unp*(unp+2)).toFixed(2)} μ<sub>B</sub>`:'დიამაგნიტური'}${exc?' · <span style="color:#e8a050">⚠ მადელუნგის წესის გამონაკლისი</span>':''}`;}
  function lastQ(k){if(!k){$('afQ').innerHTML='';return;}const st=fillState(k);let last=null;for(const s of MAD)if(st[s])last=s;
    const l='spdf'.indexOf(last[1]),nb=2*l+1,cnt=st[last],idx=cnt<=nb?cnt-1:cnt-1-nb,ml=-l+idx,ms=cnt<=nb?'+½':'−½';
    $('afQ').innerHTML=`ბოლო (${k}-ე) ელექტრონი: <b>${last}</b> · n = ${last[0]} · l = ${l} (${last[1]}) · m<sub>l</sub> = ${ml>0?'+':''}${ml} · m<sub>s</sub> = ${ms}`;}
  function draw(k,T){g.clearRect(0,0,g.W,g.H);const st=fillState(Math.floor(k));
    const used=MAD.filter(s=>(config(Z)[s]||0)>0||MAD.indexOf(s)<=MAD.indexOf(Object.keys(config(Z)).pop()));
    const rows=used.length,rh=Math.min(36,(g.H-20)/Math.max(rows,1));
    used.forEach((s,i)=>{const y=g.H-14-i*rh,l='spdf'.indexOf(s[1]),nb=2*l+1,bw=Math.min(30,rh+2),x0=110+(+s[0]-1)*0;
      g.fillStyle=COL.gl;g.font='600 13px Cinzel,serif';g.textAlign='right';g.fillText(s,60,y-rh/2+5);
      g.fillStyle=COL.dim;g.font='10px sans-serif';g.fillText(`n+l=${+s[0]+l}`,104,y-rh/2+5);
      const bx=[];const arr=boxes(s,st[s]||0);
      const xs=120+ (+s[0]-1)*95;for(let b=0;b<nb;b++){const x=xs+b*bw;bx.push(x);g.strokeStyle='rgba(201,168,76,.6)';g.lineWidth=1;g.strokeRect(x,y-rh+4,bw-2,rh-6);
        const [u,d]=arr[b];g.lineWidth=2;g.strokeStyle='#7fd8ff';const mx=x+(bw-2)/2,top=y-rh+8,bot=y-6;
        if(u){g.beginPath();g.moveTo(mx-4,bot);g.lineTo(mx-4,top);g.moveTo(mx-8,top+5);g.lineTo(mx-4,top);g.lineTo(mx,top+5);g.stroke();}
        if(d){g.strokeStyle='#e8a050';g.beginPath();g.moveTo(mx+4,top);g.lineTo(mx+4,bot);g.moveTo(mx,bot-5);g.lineTo(mx+4,bot);g.lineTo(mx+8,bot-5);g.stroke();}}
      if(st[s]){g.fillStyle=COL.mid;g.textAlign='left';g.font='11px sans-serif';g.fillText(`${st[s]}/${2*nb}`,xs+nb*bw+4,y-rh/2+5);}});
    g.fillStyle=COL.dim;g.textAlign='left';g.font='10px sans-serif';g.fillText('↑ ენერგია (ქვედონეები შევსების რიგით) · სვეტი — მთავარი კვანტური რიცხვი n',120,12);}
  bindSl('afZ',v=>{Z=v;target=Z;shown=Z;head();draw(Z);lastQ(Z);},v=>`${v} ${EL[v].sym}`);
  bindSl('afSp',v=>speed=v);
  $('afGo').onclick=()=>{shown=0;target=Z;};$('afAll').onclick=()=>{shown=Z;target=Z;draw(Z);lastQ(Z);};
  anim(dt=>{if(shown<target){shown=Math.min(target,shown+dt*speed);draw(shown);lastQ(Math.floor(shown));}});
 }});

/* ═══════════════════ 4. MOLECULAR ORBITALS of diatomics ═══════════════════ */
const MOMOL=[['H2',2,74,436],['He2',4,null,0],['Li2',6,267,105],['Be2',8,245,9],['B2',10,159,290],['C2',12,124,602],['N2',14,110,945],['O2',16,121,498],['F2',18,142,159],['Ne2',20,null,0],['O2+',15,112,643],['O2-',17,135,395],['O2 2-',18,149,204],['N2+',13,112,841]];
reg({id:'mo',ico:'⧖',t:'მოლეკულური ორბიტალები',s:'MO-დიაგრამა · ბმის ჯერადობა · მაგნეტიზმი',
 build(root){
  root.innerHTML=`<div class="actl">${btns('mo',MOMOL.map(m=>[m[0],m[0].replace(/(\d)/,'<sub>$1</sub>').replace(' 2-','²⁻').replace(/([+-])$/,'<sup>$1</sup>')]),'O2')}</div>
   <div class="arow"><div class="acol"><div id="moC"></div></div><div class="acol"><div id="moI" class="ainfo"></div><div class="hint">ჟანგბადი O₂ პარამაგნიტურია — თხევადი O₂ მაგნიტს ეწებება. ლუისის სტრუქტურა O=O ამას ვერ ხსნის, MO თეორია კი ორ გაუწყვილებელ π* ელექტრონს აჩვენებს.</div></div></div>
   ${card('ფორმულები',FX([['ბმის ჯერადობა = (N<sub>ბმის</sub> − N<sub>ანტიბმის</sub>)/2','0 → მოლეკულა არ არსებობს (He₂, Ne₂)'],['ψ<sub>MO</sub> = c<sub>1</sub>φ<sub>A</sub> ± c<sub>2</sub>φ<sub>B</sub>','ატომური ორბიტალების წრფივი კომბინაცია (LCAO)'],
     ['B₂, C₂, N₂: π2p < σ2p · O₂, F₂: σ2p < π2p','s–p შერევა ცვლის დონეების რიგს'],['მეტი ჯერადობა → მოკლე და ძლიერი ბმა','N≡N 945 კჯ/მოლ — ყველაზე მტკიცე ორატომიანი ბმებიდან']]))}`;
  const c=canvas($('moC'),460,380),g=c.g;let mol=MOMOL[7],t0=performance.now()/1000;
  function levels(Z2){const light=Z2<=14||mol[0]==='N2+';/* order (bonding?, degeneracy, label) */
    const base=[['σ1s',1,1],['σ*1s',0,1],['σ2s',1,1],['σ*2s',0,1]];
    const p=light?[['π2p',1,2],['σ2p',1,1]]:[['σ2p',1,1],['π2p',1,2]];return [...base,...p,['π*2p',0,2],['σ*2p',0,1]];}
  function fill(N){const L=levels(mol[1]);let left=N;return L.map(l=>{const cap=2*l[2],k=Math.min(cap,left);left-=k;return [...l,k];});}
  function info(){const N=mol[1],L=fill(N);let b=0,a=0,unp=0;L.forEach(([nm,bd,deg,k])=>{bd?b+=k:a+=k;unp+=k<=deg?k:2*deg-k;});const bo=(b-a)/2;
    $('moI').innerHTML=`<div class="big">${mol[0].replace(/(\d)/,'<sub>$1</sub>')}</div><div class="kv2"><b>ელექტრონი</b><span>${N}</span><b>ბმის / ანტიბმის</b><span>${b} / ${a}</span><b>ბმის ჯერადობა</b><span style="color:var(--gold-lt);font-size:16px">${bo}</span>
     <b>მაგნეტიზმი</b><span>${unp?`პარამაგნიტური (${unp} გაუწყვილ.)`:'დიამაგნიტური'}</span><b>ბმის სიგრძე</b><span>${mol[2]?mol[2]+' პმ':'—'}</span><b>ბმის ენერგია</b><span>${mol[3]?mol[3]+' კჯ/მოლ':'მოლეკულა არამდგრადია'}</span></div>
     <div class="hint">${bo<=0?'ბმის ჯერადობა 0 — ბმის და ანტიბმის ელექტრონები ერთმანეთს აბათილებს.':''}</div>`;}
  bindBtns(root,'mo',k=>{mol=MOMOL.find(m=>m[0]===k);t0=performance.now()/1000;info();});info();
  anim((dt,T)=>{g.clearRect(0,0,g.W,g.H);const N=mol[1],L=fill(N),n=L.length,show=Math.floor((T-t0)*6);
    const Y=i=>g.H-30-i*(g.H-72)/(n-1);let shownE=0;
    const at=mol[0].replace(/[\d+\- ]/g,'');g.fillStyle=COL.gl;g.font='600 13px Cinzel,serif';g.textAlign='center';g.fillText(at,50,16);g.fillText(at,g.W-50,16);g.fillText(mol[0].replace(/ /,''),g.W/2,16);
    /* atomic levels left/right */
    const aoY=[[0,1],[2,3],[4,n-1]];const AO=[['1s',Y(0.5)],['2s',Y(2.5)],['2p',Y((n-3)/2+2.6)]];
    const per=(N-(mol[0].includes('+')?-1:mol[0].includes('2-')?2:mol[0].includes('-')?1:0))/2;
    for(const [nm,y] of AO){for(const x of [50,g.W-50]){g.strokeStyle='rgba(201,168,76,.6)';g.lineWidth=2;const w=nm==='2p'?3:1;for(let k=0;k<w;k++){g.beginPath();g.moveTo(x-26+k*18-(w-1)*9,y);g.lineTo(x-14+k*18-(w-1)*9,y);g.stroke();}g.fillStyle=COL.mid;g.font='11px sans-serif';g.fillText(nm,x,y+14);}}
    L.forEach(([nm,bd,deg,k],i)=>{const y=Y(i+(i>=4?0.4:0)),cx=g.W/2;
      for(let d=0;d<deg;d++){const x=cx-(deg-1)*30+d*60;g.strokeStyle=bd?COL.gold:'#9a6ae8';g.lineWidth=2.5;g.beginPath();g.moveTo(x-22,y);g.lineTo(x+22,y);g.stroke();
        const inBox=[];for(let e=0;e<k;e++){const box=e<deg?e:e-deg;if(box===d)inBox.push(e<deg?'u':'d');}
        inBox.forEach((s,j)=>{shownE++;if(shownE>show)return;g.strokeStyle=s==='u'?'#7fd8ff':'#e8a050';g.lineWidth=2;const ax=x-6+j*12;g.beginPath();if(s==='u'){g.moveTo(ax,y+9);g.lineTo(ax,y-11);g.moveTo(ax-4,y-6);g.lineTo(ax,y-11);g.lineTo(ax+4,y-6);}else{g.moveTo(ax,y-11);g.lineTo(ax,y+9);g.moveTo(ax-4,y+4);g.lineTo(ax,y+9);g.lineTo(ax+4,y+4);}g.stroke();});}
      g.fillStyle=bd?COL.gl:'#c0a0f0';g.font='12px sans-serif';g.textAlign='left';g.fillText(nm,cx+(deg>1?62:30),y+4);
      g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;g.setLineDash([3,4]);g.beginPath();g.moveTo(cx-(deg>1?52:24),y);g.lineTo(70,AO[i<2?0:i<4?1:2][1]);g.moveTo(cx+(deg>1?52:24),y);g.lineTo(g.W-70,AO[i<2?0:i<4?1:2][1]);g.stroke();g.setLineDash([]);});
    g.fillStyle=COL.dim;g.font='10px sans-serif';g.textAlign='center';g.fillText('ოქროსფერი — ბმის MO · იისფერი — ანტიბმის MO (*)',g.W/2,g.H-6);
  });
 }});


/* ═══════════════════ particle box helper (2-D elastic discs) ═══════════════════ */
function Box(w,h){return {w,h,p:[],wallX:w,imp:0,
  add(n,o){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=o.v();this.p.push({x:8+Math.random()*(this.wallX-16),y:8+Math.random()*(h-16),vx:v*Math.cos(a),vy:v*Math.sin(a),r:o.r||3.2,k:o.k||0,m:o.m||1});}},
  step(dt,coll,onHit){const P=this.p,W=this.wallX,H=this.h;let imp=0;
    for(const q of P){q.x+=q.vx*dt;q.y+=q.vy*dt;
      if(q.x<q.r){q.x=q.r;imp+=2*q.m*Math.abs(q.vx);q.vx=Math.abs(q.vx);}if(q.x>W-q.r){q.x=W-q.r;imp+=2*q.m*Math.abs(q.vx);q.vx=-Math.abs(q.vx);}
      if(q.y<q.r){q.y=q.r;imp+=2*q.m*Math.abs(q.vy);q.vy=Math.abs(q.vy);}if(q.y>H-q.r){q.y=H-q.r;imp+=2*q.m*Math.abs(q.vy);q.vy=-Math.abs(q.vy);}}
    this.imp+=imp;
    if(coll){const n=P.length;for(let i=0;i<n;i++){const a=P[i];if(a.dead)continue;for(let j=i+1;j<n;j++){const b=P[j];if(b.dead)continue;const dx=b.x-a.x,dy=b.y-a.y,rr=a.r+b.r;if(dx>rr||dx<-rr||dy>rr||dy<-rr)continue;const d2=dx*dx+dy*dy;if(d2>=rr*rr||d2===0)continue;
      const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,rv=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(rv<=0)continue;
      if(onHit&&onHit(a,b,rv,nx,ny))continue;
      const M=a.m+b.m,jx=2*rv/M;a.vx-=jx*b.m*nx;a.vy-=jx*b.m*ny;b.vx+=jx*a.m*nx;b.vy+=jx*a.m*ny;const ov=(rr-d)/2;a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;}}
      if(P.some(q=>q.dead))this.p=P.filter(q=>!q.dead);}},
  ke(){return this.p.reduce((s,q)=>s+0.5*q.m*(q.vx*q.vx+q.vy*q.vy),0)/Math.max(1,this.p.length);},
  scaleT(f){for(const q of this.p){q.vx*=f;q.vy*=f;}},
  draw(g,ox,oy,col){for(const q of this.p){g.fillStyle=col(q);g.beginPath();g.arc(ox+q.x,oy+q.y,q.r,0,TAU);g.fill();}}};}
const rayleigh=s=>s*Math.sqrt(-2*Math.log(1-Math.random()));

/* ═══════════════════ 5. GASES — kinetic theory ═══════════════════ */
const GASES=[['H2',2.016],['He',4.003],['N2',28.014],['O2',31.998],['CO2',44.01],['Xe',131.29],['UF6',352.02]];
reg({id:'gas',ico:'💨',t:'აირები და კინეტიკური თეორია',s:'PV = nRT · მაქსველ-ბოლცმანის განაწილება · დგუში',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="gB"></div><div id="gH"></div></div><div class="acol"><div class="actl">${sl('gT','ტემპერატურა T',50,1500,10,300,'K')}${sl('gV','მოცულობა V (დგუში)',30,100,1,100,'%')}${sl('gN','ნაწილაკები N',10,300,5,120)}
    <label class="hint"><input type="checkbox" id="gC" checked> ნაწილაკთა შეჯახებები (განაწილება მაქსველისკენ მიდის)</label></div><div id="gI" class="ainfo"></div>
    ${card('🧮 PV = nRT — შეავსე სამი, მეოთხეს დაითვლის',`<div class="calc"><label>P, კპა<input id="cP" type="number" value="101.325"></label><label>V, ლ<input id="cV" type="number" value=""></label><label>n, მოლი<input id="cN" type="number" value="1"></label><label>T, K<input id="cT" type="number" value="273.15"></label></div><div id="cO" class="ainfo"></div>`)}
    ${card('⚡ მოლეკულების სიჩქარე',`<div class="calc"><label>აირი<select id="vG">${GASES.map(([n,m])=>`<option value="${m}">${n} (${m})</option>`).join('')}</select></label><label>T, K<input id="vT" type="number" value="298"></label></div><div id="vO" class="ainfo"></div>`)}</div></div>
    ${card('ფორმულები',FX([['pV = nRT','იდეალური აირის მდგომარეობის განტოლება (კლაპეირონ–მენდელეევი), R = 8.314 ჯ/(მოლ·K)'],['p₁V₁ = p₂V₂ (T const)','ბოილ-მარიოტი'],['V/T = const (p const)','შარლი / გეი-ლუსაკი'],['p/T = const (V const)','გეი-ლუსაკი'],
      ['p = Σ p<sub>i</sub>, p<sub>i</sub> = x<sub>i</sub>·p','დალტონის ნაწილობრივი წნევები'],['p = ⅓·(N/V)·m·⟨v²⟩','კინეტიკური თეორიის ძირითადი განტოლება'],['⟨E<sub>k</sub>⟩ = 3/2·k<sub>B</sub>T','საშუალო კინეტიკური ენერგია — ტემპერატურა მოლეკულების მოძრაობის საზომია'],
      ['v<sub>rms</sub> = √(3RT/M) · v̄ = √(8RT/πM) · v<sub>p</sub> = √(2RT/M)','საშუალო კვადრატული, საშუალო და ყველაზე ალბათური სიჩქარე'],['f(v) = 4π(M/2πRT)<sup>3/2</sup> v² e<sup>−Mv²/2RT</sup>','მაქსველ-ბოლცმანის განაწილება'],
      ['r₁/r₂ = √(M₂/M₁)','გრეჰემის დიფუზიის კანონი'],['(p + a·n²/V²)(V − n·b) = nRT','ვან-დერ-ვაალსი — რეალური აირი'],['V<sub>m</sub> = 22.414 ლ/მოლ (0 °C, 1 ატმ)','მოლური მოცულობა ნ.პ.-ზე']]))}`;
  const W=460,H=280,c=canvas($('gB'),W+40,H+20),g=c.g,hc=canvas($('gH'),W+40,150),hg=hc.g;
  const B=Box(W,H);let T=300,Vf=1,Nt=120,coll=true,pAvg=0,tAcc=0,hist=new Array(24).fill(0),hN=0;
  const sig=t=>60*Math.sqrt(t/300);
  const setN=()=>{while(B.p.length<Nt)B.add(1,{v:()=>rayleigh(sig(T))});if(B.p.length>Nt)B.p.length=Nt;};
  bindSl('gT',v=>{if(B.p.length){const f=Math.sqrt(v/T);B.scaleT(f);}T=v;});
  bindSl('gV',v=>{Vf=v/100;});bindSl('gN',v=>{Nt=v;setN();});$('gC').onchange=e=>coll=e.target.checked;
  setN();
  anim(dt=>{const target=W*Vf;B.wallX+= (target-B.wallX)*Math.min(1,dt*3);for(const q of B.p)if(q.x>B.wallX-q.r)q.x=B.wallX-q.r;
    const sub=3;for(let k=0;k<sub;k++)B.step(dt/sub,coll);
    /* thermostat: keep ⟨Ek⟩ ∝ T (2-D: ⟨Ek⟩ = kT → σ²) */
    const ke=B.ke(),want=sig(T)**2;if(ke>0)B.scaleT(Math.sqrt(lerp(1,want/ke,Math.min(1,dt*2))));
    tAcc+=dt;if(tAcc>0.5){const per=2*(B.wallX+H);const p=B.imp/(per*tAcc);pAvg=pAvg?lerp(pAvg,p,0.4):p;B.imp=0;tAcc=0;}
    for(const q of B.p){const v=Math.hypot(q.vx,q.vy),b=Math.floor(v/(sig(1500)*3.2/24));if(b<24)hist[b]+=1;}hN+=B.p.length;
    if(hN>Nt*90){for(let i=0;i<24;i++)hist[i]*=0.5;hN*=0.5;}
    g.clearRect(0,0,g.W,g.H);g.strokeStyle='rgba(201,168,76,.5)';g.lineWidth=2;g.strokeRect(10,10,W,H);
    g.fillStyle='rgba(201,168,76,.25)';g.fillRect(10+B.wallX,10,W-B.wallX+2,H);g.fillStyle=COL.gold;g.fillRect(10+B.wallX-3,10,6,H);g.fillRect(10+B.wallX,10+H/2-4,W-B.wallX+20,8);
    const vmx=sig(T)*2.5;B.draw(g,10,10,q=>{const v=Math.hypot(q.vx,q.vy)/vmx;return `hsl(${220-clamp(v,0,1)*220},85%,60%)`;});
    g.fillStyle=COL.mid;g.font='10px sans-serif';g.textAlign='left';g.fillText('ფერი — სიჩქარე: ლურჯი ნელი → წითელი სწრაფი',14,H+19);
    /* histogram vs Maxwell–Boltzmann (2-D) */
    hg.clearRect(0,0,hg.W,hg.H);const bw=sig(1500)*3.2/24,tot=hist.reduce((a,b)=>a+b,0)||1;const s2=sig(T)**2;
    const P=plot(hg,{x:[0,24*bw],y:[0,0.35],xl:'სიჩქარე v',yl:'წილი',m:[8,8,24,26]});
    hist.forEach((h,i)=>{const fr=h/tot;hg.fillStyle='rgba(95,200,216,.45)';hg.fillRect(P.X(i*bw)+1,P.Y(fr),P.X(bw)-P.X(0)-2,P.Y(0)-P.Y(fr));});
    hg.beginPath();for(let i=0;i<=120;i++){const v=i/120*24*bw,f=v/s2*Math.exp(-v*v/(2*s2))*bw;i?hg.lineTo(P.X(v),P.Y(f)):hg.moveTo(P.X(v),P.Y(f));}hg.strokeStyle=COL.gold;hg.lineWidth=2;hg.stroke();
    hg.fillStyle=COL.gl;hg.textAlign='right';hg.fillText('— თეორია (მაქსველ-ბოლცმანი)',P.x0+P.w-4,P.y0+12);
    const Vrel=B.wallX/W;$('gI').innerHTML=`<div class="kv2"><b>წნევა (სიმულაცია)</b><span>${(pAvg*100).toFixed(1)} პირ. ერთ.</span><b>pV / (N·T)</b><span>${pAvg?(pAvg*Vrel*1e4/(B.p.length*T)).toFixed(3):'…'} ≈ const ✓</span><b>⟨E<sub>k</sub>⟩ ∝ T</b><span>${(B.ke()/1e3).toFixed(2)}</span></div><div class="hint">შეამცირე მოცულობა — წნევა იზრდება (ბოილი); გაზარდე T — ნაწილაკები ჩქარდება და წნევა იზრდება (გეი-ლუსაკი).</div>`;
  });
  const calc=()=>{const ids=['cP','cV','cN','cT'],v=ids.map(i=>$(i).value===''?null:+$(i).value),miss=v.map((x,i)=>x==null?i:-1).filter(i=>i>=0);
    if(miss.length!==1){$('cO').innerHTML='<span class="hint">ზუსტად ერთი ველი დატოვე ცარიელი.</span>';return;}
    let [p,V,n,t]=v;const k=miss[0];/* kPa·L = J */
    if(k===0)p=n*R_GAS*t/V;if(k===1)V=n*R_GAS*t/p;if(k===2)n=p*V/(R_GAS*t);if(k===3)t=p*V/(n*R_GAS);
    const nm=['P','V','n','T'][k],val=[p,V,n,t][k],u=['კპა','ლ','მოლი','K'][k];$('cO').innerHTML=`<b>${nm} = ${(+val.toPrecision(5))} ${u}</b>${k===0?` = ${(p/101.325).toFixed(4)} ატმ = ${(p*7.50062).toFixed(1)} მმ ვწყ.სვ.`:k===3?` = ${(t-273.15).toFixed(2)} °C`:''}`;};
  ['cP','cV','cN','cT'].forEach(i=>$(i).oninput=calc);calc();
  const vc=()=>{const M=+$('vG').value/1000,t=+$('vT').value;$('vO').innerHTML=`<div class="kv2"><b>v<sub>rms</sub></b><span>${Math.sqrt(3*R_GAS*t/M).toFixed(0)} მ/წმ</span><b>v̄ (საშუალო)</b><span>${Math.sqrt(8*R_GAS*t/(Math.PI*M)).toFixed(0)} მ/წმ</span><b>v<sub>p</sub> (ალბათური)</b><span>${Math.sqrt(2*R_GAS*t/M).toFixed(0)} მ/წმ</span><b>⟨E<sub>k</sub>⟩</b><span>${(1.5*KB*t).toExponential(3)} ჯ</span></div>`;};
  $('vG').onchange=vc;$('vT').oninput=vc;vc();
 }});

/* ═══════════════════ 6. REACTION KINETICS ═══════════════════ */
reg({id:'kin',ico:'⏱',t:'რეაქციის კინეტიკა',s:'აქტივაციის ენერგია · კატალიზატორი · არენიუსი · რიგი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="kE"></div><div class="actl">${sl('kEa','აქტივაციის ენერგია Eₐ',10,200,1,80,'კჯ/მოლ')}${sl('kdH','რეაქციის სითბო ΔH',-150,150,1,-60,'კჯ/მოლ')}<label class="hint"><input type="checkbox" id="kCat"> კატალიზატორი (Eₐ ↓ ~45%)</label></div></div>
    <div class="acol"><div id="kS"></div><div class="actl">${sl('kT','ტემპერატურა',200,900,10,400,'K')}<div class="abt"><button id="kR">↺ თავიდან</button></div></div><div id="kG"></div><div id="kI" class="ainfo"></div></div></div>
    <div class="arow"><div class="acol">${card('რეაქციის რიგი — ინტეგრირებული კანონები',`<div class="actl">${btns('ord',[[0,'0 რიგი'],[1,'1 რიგი'],[2,'2 რიგი']],1)}${sl('kk','სიჩქარის მუდმივა k',0.02,1,0.01,0.2)}</div><div id="kO"></div><div id="kOI" class="ainfo"></div>`)}</div>
    <div class="acol">${card('ფორმულები',FX([['v = k·[A]<sup>m</sup>[B]<sup>n</sup>','სიჩქარის კანონი; რიგი m+n ექსპერიმენტით დგინდება'],['k = A·e<sup>−Eₐ/RT</sup>','არენიუსის განტოლება'],['ln(k₂/k₁) = (Eₐ/R)(1/T₁ − 1/T₂)','ორ ტემპერატურაზე'],
      ['γ = k<sub>T+10</sub>/k<sub>T</sub> ≈ 2…4','ვანტ-ჰოფის წესი'],['0 რიგი: [A] = [A]₀ − kt, t½ = [A]₀/2k',''],['1 რიგი: ln[A] = ln[A]₀ − kt, t½ = ln2/k','t½ არ არის კონცენტრაციაზე დამოკიდებული'],['2 რიგი: 1/[A] = 1/[A]₀ + kt, t½ = 1/(k[A]₀)',''],
      ['კატალიზატორი: Eₐ ↓, ΔH იგივე','ორივე მიმართულებას აჩქარებს, წონასწორობას არ ცვლის'],['ეფექტური შეჯახება: E ≥ Eₐ + სწორი ორიენტაცია','შეჯახების თეორია']]))}</div></div>`;
  const ec=canvas($('kE'),460,260),eg=ec.g,sc=canvas($('kS'),460,250),sg=sc.g,gc=canvas($('kG'),460,120),gg=gc.g,oc=canvas($('kO'),440,170),og=oc.g;
  let Ea=80,dH=-60,cat=false,T=400,B=null,series=[],tt=0,ord=1,kk=0.2;
  const prof=(x,ea)=>{const R=0,Pp=dH,top=Math.max(R,Pp)+ea*(dH>0?1:1)-(dH>0?dH:0)*0;const pts=[[0,R],[0.18,R],[0.5,R+ea],[0.82,Pp],[1,Pp]];let i=0;while(i<pts.length-2&&x>pts[i+1][0])i++;const [x0,y0]=pts[i],[x1,y1]=pts[i+1],t=(x-x0)/(x1-x0);return y0+(y1-y0)*(1-Math.cos(Math.PI*t))/2;};
  bindSl('kEa',v=>Ea=Math.max(v,dH+5));bindSl('kdH',v=>dH=v);$('kCat').onchange=e=>cat=e.target.checked;
  const reset=()=>{B=Box(440,230);B.add(70,{v:()=>rayleigh(55*Math.sqrt(T/300)),k:0,r:4});B.add(70,{v:()=>rayleigh(55*Math.sqrt(T/300)),k:1,r:4});series=[];tt=0;};
  bindSl('kT',v=>{if(B){B.scaleT(Math.sqrt(v/T));}T=v;});$('kR').onclick=reset;reset();
  bindBtns(root,'ord',k=>{ord=+k;drawOrd();});bindSl('kk',v=>{kk=v;drawOrd();});
  function drawOrd(){og.clearRect(0,0,og.W,og.H);const A0=1,tmax=ord===0?A0/kk*1.3:ord===1?5/kk:12/kk;const f=t=>ord===0?Math.max(0,A0-kk*t):ord===1?A0*Math.exp(-kk*t):1/(1/A0+kk*t);
    const P=plot(og,{x:[0,tmax],y:[0,1.05],xl:'დრო t',yl:'[A]/[A]₀',yt:[0,0.5,1],m:[8,8,26,30]});og.beginPath();for(let i=0;i<=200;i++){const t=i/200*tmax;i?og.lineTo(P.X(t),P.Y(f(t))):og.moveTo(P.X(t),P.Y(f(t)));}og.strokeStyle=COL.gold;og.lineWidth=2;og.stroke();
    const th=ord===0?A0/(2*kk):ord===1?Math.LN2/kk:1/(kk*A0);let t=0,lv=1;og.setLineDash([3,3]);og.strokeStyle='rgba(232,112,90,.7)';og.lineWidth=1;
    for(let k=0;k<4&&t<tmax;k++){const tn=ord===1?t+th:ord===0?t+lv/(2*kk):t+1/(kk*lv);if(tn>tmax)break;og.beginPath();og.moveTo(P.X(tn),P.Y(0));og.lineTo(P.X(tn),P.Y(f(tn)));og.lineTo(P.X(0),P.Y(f(tn)));og.stroke();t=tn;lv=f(tn);}og.setLineDash([]);
    $('kOI').innerHTML=ord===1?`ნახევარდაშლის პერიოდი მუდმივია: t½ = ln2/k = <b>${th.toFixed(2)}</b> — ყოველ t½-ში რჩება ნახევარი.`:ord===0?`t½ = [A]₀/2k = <b>${th.toFixed(2)}</b> — ყოველი შემდეგი ნახევარი ორჯერ სწრაფად ილევა (სიჩქარე მუდმივია).`:`t½ = 1/(k[A]₀) = <b>${th.toFixed(2)}</b> — ყოველი შემდეგი ნახევარი ორჯერ გრძელია.`;}
  drawOrd();
  anim((dt,TT)=>{const ea=cat?Ea*0.55:Ea;
    /* energy profile */
    eg.clearRect(0,0,eg.W,eg.H);const lo=Math.min(0,dH)-20,hi=Math.max(Ea,dH+10)+30;const P=plot(eg,{x:[0,1],y:[lo,hi],xl:'რეაქციის კოორდინატა →',yl:'ენერგია (კჯ/მოლ)',yt:[0,Math.round(hi/50)*50],m:[10,10,22,36]});
    const curve=(ea2,col,dash)=>{eg.beginPath();for(let i=0;i<=200;i++){const x=i/200,y=prof(x,ea2);i?eg.lineTo(P.X(x),P.Y(y)):eg.moveTo(P.X(x),P.Y(y));}eg.strokeStyle=col;eg.lineWidth=2.5;eg.setLineDash(dash?[6,5]:[]);eg.stroke();eg.setLineDash([]);};
    curve(Ea,COL.gold,false);if(cat)curve(Ea*0.55,COL.green,true);
    const arrow=(x,y1,y2,col,lab)=>{eg.strokeStyle=col;eg.fillStyle=col;eg.lineWidth=1.5;eg.beginPath();eg.moveTo(P.X(x),P.Y(y1));eg.lineTo(P.X(x),P.Y(y2));eg.stroke();const s=y2>y1?-1:1;eg.beginPath();eg.moveTo(P.X(x),P.Y(y2));eg.lineTo(P.X(x)-4,P.Y(y2)+6*s);eg.lineTo(P.X(x)+4,P.Y(y2)+6*s);eg.fill();eg.font='11px sans-serif';eg.textAlign='left';eg.fillText(lab,P.X(x)+6,P.Y((y1+y2)/2));};
    arrow(0.36,0,Ea,COL.red,`Eₐ = ${Ea}`);if(cat)arrow(0.43,0,Ea*0.55,COL.green,`${(Ea*0.55).toFixed(0)}`);arrow(0.92,0,dH,COL.cyan,`ΔH = ${dH}`);
    eg.fillStyle=COL.gl;eg.textAlign='center';eg.font='13px serif';eg.fillText('‡',P.X(0.5),P.Y(Ea)-8);eg.font='11px sans-serif';eg.fillText('რეაგენტები',P.X(0.09),P.Y(0)-8);eg.fillText('პროდუქტები',P.X(0.91),P.Y(dH)+(dH<0?16:-8));
    eg.fillStyle=COL.mid;eg.fillText(dH<0?'ეგზოთერმული — სითბო გამოიყოფა':'ენდოთერმული — სითბო შთაინთქმება',P.X(0.5),P.y0+P.h-6);
    const bx=((TT*0.25)%1.4)/1.2;if(bx<=1){const y=prof(bx,ea);eg.fillStyle='#7fd8ff';eg.beginPath();eg.arc(P.X(bx),P.Y(y)-6,6,0,TAU);eg.fill();}
    /* collisions: A + B → C only when the relative KE along the line of centres exceeds the barrier */
    const thr=ea*55;let made=0;
    for(let k=0;k<2;k++)B.step(dt/2,true,(a,b,rv)=>{if(a.k+b.k===1&&0.25*rv*rv>thr*(300/400)){const nx=a.m*a.vx+b.m*b.vx,ny=a.m*a.vy+b.m*b.vy;a.k=2;a.m=2;a.r=5.5;a.vx=nx/2;a.vy=ny/2;b.dead=true;made++;return true;}return false;});
    tt+=dt;if(!series.length||tt-series[series.length-1][0]>0.2){const cA=B.p.filter(q=>q.k===0).length,cC=B.p.filter(q=>q.k===2).length;series.push([tt,cA,cC]);if(series.length>400)series.shift();}
    sg.clearRect(0,0,sg.W,sg.H);sg.strokeStyle='rgba(201,168,76,.4)';sg.strokeRect(10,10,440,230);B.draw(sg,10,10,q=>q.k===0?COL.red:q.k===1?COL.blue:'#c070f0');
    sg.fillStyle=COL.mid;sg.font='10px sans-serif';sg.textAlign='left';sg.fillText('● A   ● B   ● C = AB (ეფექტური შეჯახება)',14,248);
    gg.clearRect(0,0,gg.W,gg.H);const t0=series.length?series[0][0]:0,t1=Math.max(t0+5,tt);const Q=plot(gg,{x:[t0,t1],y:[0,72],xl:'დრო',yl:'რაოდენობა',m:[6,8,20,30]});
    [[1,COL.red],[2,'#c070f0']].forEach(([i,col])=>{gg.beginPath();series.forEach((s,j)=>{j?gg.lineTo(Q.X(s[0]),Q.Y(s[i])):gg.moveTo(Q.X(s[0]),Q.Y(s[i]));});gg.strokeStyle=col;gg.lineWidth=2;gg.stroke();});
    const k1=Math.exp(-Ea*1000/(R_GAS*T)),k2=Math.exp(-Ea*1000/(R_GAS*(T+10))),kc=Math.exp(-Ea*0.55*1000/(R_GAS*T));
    $('kI').innerHTML=`<div class="kv2"><b>e<sup>−Eₐ/RT</sup> (ეფექტური შეჯახებების წილი)</b><span>${fmtN(k1)}</span><b>+10 K → სიჩქარე ×</b><span>${(k2/k1).toFixed(2)}</span><b>კატალიზატორით სიჩქარე ×</b><span>${fmtN(kc/k1)}</span></div>`;
  });
 }});

/* ═══════════════════ 7. CHEMICAL EQUILIBRIUM — Le Chatelier ═══════════════════ */
reg({id:'eq',ico:'⇌',t:'ქიმიური წონასწორობა',s:'K და Q · ლე შატელიეს პრინციპი · ΔG° = −RT lnK',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="qB"></div><div class="abt"><button id="qA">+ A დამატება</button><button id="qRB">− B ამოღება</button><button id="qRs">↺ თავიდან</button></div></div>
   <div class="acol"><div class="actl">${sl('qT','ტემპერატურა',250,600,5,350,'K')}<div>პირდაპირი რეაქცია: ${btns('qh',[['exo','ეგზოთერმული (ΔH<0)'],['endo','ენდოთერმული (ΔH>0)']],'exo')}</div></div><div id="qG"></div><div id="qI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['aA + bB ⇌ cC + dD: &nbsp; K = [C]<sup>c</sup>[D]<sup>d</sup> / [A]<sup>a</sup>[B]<sup>b</sup>','მოქმედ მასათა კანონი (წონასწორობისას)'],['Q — იგივე გამოსახულება ნებისმიერ მომენტში','Q < K → წინ · Q > K → უკან · Q = K → წონასწორობა'],
     ['K = k<sub>პირდ.</sub> / k<sub>უკუ</sub>','წონასწორობა დინამიკურია: ორივე რეაქცია მიმდინარეობს ერთნაირი სიჩქარით'],['ΔG° = −RT·lnK','K > 1 ⇔ ΔG° < 0'],['ΔG = ΔG° + RT·lnQ',''],['ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁)','ვანტ-ჰოფის განტოლება'],
     ['K<sub>p</sub> = K<sub>c</sub>(RT)<sup>Δn</sup>','Δn — აირების მოლების ცვლილება'],['N₂ + 3H₂ ⇌ 2NH₃, ΔH = −92 კჯ','ჰაბერის პროცესი: მაღალი წნევა და ზომიერი T — მეტი ამიაკი']]))}`;
  const c=canvas($('qB'),460,270),g=c.g,gc=canvas($('qG'),460,170),gg=gc.g;
  let T=350,exo=true,B,ser=[],tt=0,evts=[];
  const ks=()=>{/* Arrhenius with different barriers; ΔH = Ea_f − Ea_r */const Ef=exo?40:45,Er=exo?45:40;return [5e6*Math.exp(-Ef*1000/(R_GAS*T))*0.12,5e6*Math.exp(-Er*1000/(R_GAS*T))*0.12];};
  const reset=()=>{B=Box(440,250);B.add(160,{v:()=>rayleigh(50),k:0,r:3.5});ser=[];tt=0;evts=[];};reset();
  bindSl('qT',v=>{T=v;if(tt>0)evts.push([tt,'T '+v+'K']);});bindBtns(root,'qh',k=>{exo=k==='exo';});
  $('qA').onclick=()=>{B.add(60,{v:()=>rayleigh(50),k:0,r:3.5});evts.push([tt,'+A']);};
  $('qRB').onclick=()=>{let n=0;B.p=B.p.filter(q=>!(q.k===1&&n++<50));evts.push([tt,'−B']);};$('qRs').onclick=reset;
  anim(dt=>{const [kf,kr]=ks();for(const q of B.p){if(q.k===0&&Math.random()<kf*dt)q.k=1;else if(q.k===1&&Math.random()<kr*dt)q.k=0;}
    B.step(dt,false);tt+=dt;const nA=B.p.filter(q=>q.k===0).length,nB=B.p.length-nA;
    if(!ser.length||tt-ser[ser.length-1][0]>0.15){ser.push([tt,nA,nB]);if(ser.length>500)ser.shift();}
    g.clearRect(0,0,g.W,g.H);g.strokeStyle='rgba(201,168,76,.4)';g.strokeRect(10,10,440,250);B.draw(g,10,10,q=>q.k?COL.blue:COL.red);
    g.fillStyle=COL.mid;g.font='10px sans-serif';g.textAlign='left';g.fillText('● A   ⇌   ● B',14,268);
    gg.clearRect(0,0,gg.W,gg.H);const t0=ser[0][0],t1=Math.max(t0+8,tt),ym=Math.max(...ser.map(s=>Math.max(s[1],s[2])))*1.15;
    const P=plot(gg,{x:[t0,t1],y:[0,ym],xl:'დრო',yl:'რაოდენობა',m:[8,8,20,30]});
    [[1,COL.red],[2,COL.blue]].forEach(([i,col])=>{gg.beginPath();ser.forEach((s,j)=>{j?gg.lineTo(P.X(s[0]),P.Y(s[i])):gg.moveTo(P.X(s[0]),P.Y(s[i]));});gg.strokeStyle=col;gg.lineWidth=2;gg.stroke();});
    evts.filter(e=>e[0]>=t0).forEach(e=>{gg.strokeStyle='rgba(255,255,255,.3)';gg.setLineDash([3,3]);gg.beginPath();gg.moveTo(P.X(e[0]),P.y0);gg.lineTo(P.X(e[0]),P.y0+P.h);gg.stroke();gg.setLineDash([]);gg.fillStyle=COL.gl;gg.font='10px sans-serif';gg.textAlign='left';gg.fillText(e[1],P.X(e[0])+3,P.y0+10);});
    const K=kf/kr,Q=nA?nB/nA:Infinity,dG=-R_GAS*T*Math.log(K)/1000;
    $('qI').innerHTML=`<div class="kv2"><b>K = k<sub>f</sub>/k<sub>r</sub></b><span>${K.toFixed(3)}</span><b>Q = [B]/[A]</b><span>${isFinite(Q)?Q.toFixed(3):'∞'}</span><b>მიმართულება</b><span style="color:var(--gold-lt)">${Math.abs(Q-K)/K<0.12?'⇌ წონასწორობა':Q<K?'→ პირდაპირი (B წარმოიქმნება)':'← უკუ (A წარმოიქმნება)'}</span><b>ΔG° = −RT lnK</b><span>${dG.toFixed(2)} კჯ/მოლ</span></div>
     <div class="hint">ლე შატელიე: სისტემა ეწინააღმდეგება ცვლილებას. A-ს დამატება → წინ; B-ს ამოღება → წინ; გაცხელება → ენდოთერმული მიმართულებით.</div>`;
  });
 }});

/* ═══════════════════ 8. ACIDS & BASES — titration ═══════════════════ */
const ACIDS={HCl:{n:'HCl (ძლიერი)',Ka:[1e7]},CH3COOH:{n:'CH₃COOH (სუსტი, pKa 4.76)',Ka:[1.75e-5]},HF:{n:'HF (pKa 3.17)',Ka:[6.8e-4]},NH4:{n:'NH₄⁺ (pKa 9.25)',Ka:[5.6e-10]},H2C2O4:{n:'H₂C₂O₄ (ორფუძიანი)',Ka:[5.6e-2,1.5e-4]},H3PO4:{n:'H₃PO₄ (სამფუძიანი)',Ka:[6.9e-3,6.2e-8,4.8e-13]}};
const IND={pp:['ფენოლფტალეინი',8.2,10,[255,255,255,0.05],[230,40,150,0.75]],mo:['მეთილნარინჯი',3.1,4.4,[220,40,40,0.8],[240,200,40,0.8]],bb:['ბრომთიმოლის ლურჯი',6.0,7.6,[230,210,40,0.8],[40,90,220,0.8]],un:['უნივერსალური',0,14,null,null]};
const KW=1e-14;
function phOf(Ca,Na,Ka){/* charge balance: h + Na = Kw/h + Ca·(average negative charge of the acid) */
  const nK=Ka.length,f=lh=>{const h=10**lh;let D=0,num=0,prod=1;const terms=[];for(let i=0;i<=nK;i++){if(i>0)prod*=Ka[i-1];const t=prod*h**(nK-i);terms.push(t);D+=t;num+=i*t;}return h+Na-KW/h-Ca*num/D;};
  let lo=-15,hi=1;for(let k=0;k<80;k++){const m=(lo+hi)/2;if(f(m)>0)hi=m;else lo=m;}return -(lo+hi)/2;}
const uni=pH=>{const s=[[0,[200,20,30]],[3,[240,100,30]],[5,[240,200,40]],[7,[60,180,60]],[9,[40,120,200]],[11,[60,50,170]],[14,[110,30,130]]];let i=0;while(i<s.length-2&&pH>s[i+1][0])i++;const [a,ca]=s[i],[b,cb]=s[i+1],t=clamp((pH-a)/(b-a),0,1);return ca.map((v,j)=>Math.round(v+(cb[j]-v)*t));};
const PHS=[[0,'აკუმულატორის მჟავა'],[1.5,'კუჭის წვენი'],[2.4,'ლიმონი'],[2.5,'კოლა'],[2.9,'ძმარი'],[4,'ღვინო'],[5,'შავი ყავა'],[5.6,'წვიმა'],[6.6,'რძე'],[7,'სუფთა წყალი'],[7.4,'სისხლი'],[8.1,'ზღვის წყალი'],[8.3,'სოდის ხსნარი'],[10.5,'მაგნეზიის რძე'],[11.6,'ამიაკი'],[12.5,'სათეთრებელი'],[14,'1M NaOH']];
reg({id:'acid',ico:'🧪',t:'მჟავები, ფუძეები, pH',s:'ტიტრაცია ანიმაციით · ინდიკატორები · ბუფერი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="tF"></div></div><div class="acol"><div class="actl"><label>მჟავა <select id="tA">${Object.entries(ACIDS).map(([k,a])=>`<option value="${k}"${k==='CH3COOH'?' selected':''}>${a.n}</option>`).join('')}</select></label>
     <label>ინდიკატორი <select id="tI">${Object.entries(IND).map(([k,a])=>`<option value="${k}">${a[0]}</option>`).join('')}</select></label>${sl('tC','მჟავის C',0.01,0.5,0.01,0.1,'M')}${sl('tSp','სიჩქარე',0.5,10,0.5,3,'მლ/წმ')}
     <div class="abt"><button id="tGo" class="on">▶ ტიტრაცია</button><button id="tP">⏸</button><button id="tR">↺</button></div></div><div id="tG"></div><div id="tInfo" class="ainfo"></div></div></div>
   <div id="tS"></div>
   <div class="arow"><div class="acol">${card('🧮 pH კალკულატორი',`<div class="calc"><label>C, მოლ/ლ<input id="pC" type="number" value="0.1"></label><label>Ka (ცარიელი = ძლიერი)<input id="pK" type="number" value="1.75e-5"></label><label>ტიპი<select id="pT"><option value="a">მჟავა</option><option value="b">ფუძე (Kb)</option></select></label></div><div id="pO" class="ainfo"></div>`)}
    ${card('🧮 ბუფერი (ჰენდერსონ-ჰასელბალხი)',`<div class="calc"><label>pKa<input id="bK" type="number" value="4.76"></label><label>[A⁻], M<input id="bA" type="number" value="0.1"></label><label>[HA], M<input id="bH" type="number" value="0.1"></label></div><div id="bO" class="ainfo"></div>`)}</div>
   <div class="acol">${card('ფორმულები',FX([['pH = −lg[H⁺] · pOH = −lg[OH⁻] · pH + pOH = 14','25 °C-ზე'],['K<sub>w</sub> = [H⁺][OH⁻] = 10⁻¹⁴','წყლის იონური ნამრავლი'],['HA ⇌ H⁺ + A⁻: K<sub>a</sub> = [H⁺][A⁻]/[HA]','pKa = −lgKa — რაც ნაკლებია, მით ძლიერია მჟავა'],
     ['[H⁺] ≈ √(K<sub>a</sub>·C)','სუსტი მჟავა (α ≪ 1)'],['pH = pK<sub>a</sub> + lg([A⁻]/[HA])','ჰენდერსონ-ჰასელბალხი — ბუფერი; ნახევარ-ეკვივალენტზე pH = pKa'],['K<sub>a</sub>·K<sub>b</sub> = K<sub>w</sub>','შეუღლებული წყვილი'],['n(H⁺) = n(OH⁻) — ეკვივალენტის წერტილი','C₁V₁ = C₂V₂'],
     ['α = √(K<sub>a</sub>/C)','ოსტვალდის განზავების კანონი'],['არენიუსი: მჟავა → H⁺ · ბრენსტედ-ლოური: პროტონის დონორი · ლუისი: e⁻-წყვილის აქცეპტორი','მჟავის სამი განმარტება']]))}</div></div>`;
  const fc=canvas($('tF'),300,400),fg=fc.g,gc=canvas($('tG'),460,220),gg=gc.g,sc=canvas($('tS'),900,90),sg=sc.g;
  let acid='CH3COOH',ind='pp',Ca0=0.1,V0=25,Cb=0.1,vB=0,run=false,speed=3,drops=[],pts=[];
  const nEq=()=>ACIDS[acid].Ka.filter(k=>k>1e-11).length,vEq=()=>Ca0*V0/Cb;
  const ph=v=>phOf(Ca0*V0/(V0+v),Cb*v/(V0+v),ACIDS[acid].Ka);
  const reset=()=>{vB=0;pts=[];drops=[];run=false;};
  $('tA').onchange=e=>{acid=e.target.value;reset();};$('tI').onchange=e=>ind=e.target.value;bindSl('tC',v=>{Ca0=v;reset();});bindSl('tSp',v=>speed=v);
  $('tGo').onclick=()=>run=true;$('tP').onclick=()=>run=false;$('tR').onclick=reset;
  const flaskCol=p=>{const I=IND[ind];if(ind==='un'){const c=uni(p);return `rgba(${c.join(',')},0.75)`;}const t=clamp((p-I[1])/(I[2]-I[1]),0,1),a=I[3],b=I[4];return `rgba(${[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*t)).join(',')},${a[3]+(b[3]-a[3])*t})`;};
  anim((dt,T)=>{const vmax=vEq()*(nEq()+0.6);
    if(run&&vB<vmax){vB=Math.min(vmax,vB+speed*dt);if(Math.random()<speed*dt*3)drops.push({y:118,v:0});pts.push([vB,ph(vB)]);}
    const p=ph(vB);
    /* burette + flask */
    fg.clearRect(0,0,fg.W,fg.H);const bx=150;fg.fillStyle='rgba(200,220,255,.08)';fg.strokeStyle='rgba(201,168,76,.6)';fg.lineWidth=1.5;fg.fillRect(bx-9,10,18,100);fg.strokeRect(bx-9,10,18,100);
    const lev=clamp(vB/vmax,0,1);fg.fillStyle='rgba(120,170,255,.35)';fg.fillRect(bx-8,12+lev*96,16,96-lev*96);
    for(let k=0;k<=10;k++){fg.strokeStyle='rgba(255,255,255,.3)';fg.beginPath();fg.moveTo(bx-9,12+k*9.6);fg.lineTo(bx-4,12+k*9.6);fg.stroke();}
    fg.fillStyle='rgba(201,168,76,.7)';fg.fillRect(bx-3,110,6,8);fg.fillRect(bx-12,112,24,3);fg.fillStyle=COL.mid;fg.font='10px sans-serif';fg.textAlign='left';fg.fillText(`NaOH ${Cb} M`,bx+14,30);fg.fillText(`${vB.toFixed(2)} მლ`,bx+14,46);
    drops.forEach(d=>{d.v+=600*dt;d.y+=d.v*dt;fg.fillStyle='rgba(140,190,255,.8)';fg.beginPath();fg.ellipse(bx,d.y,2.5,3.5,0,0,TAU);fg.fill();});drops=drops.filter(d=>d.y<250);
    /* erlenmeyer */
    const fx=bx,top=150,neck=22,body=95,base=360,fp=()=>{fg.beginPath();fg.moveTo(fx-neck/2,top);fg.lineTo(fx-neck/2,top+70);fg.lineTo(fx-body,base);fg.lineTo(fx+body,base);fg.lineTo(fx+neck/2,top+70);fg.lineTo(fx+neck/2,top);};fp();
    const liq=270-Math.min(40,vB*0.5);fg.save();fg.clip();fg.fillStyle=flaskCol(p);fg.fillRect(0,liq,fg.W,fg.H);
    fg.strokeStyle='rgba(255,255,255,.25)';fg.beginPath();for(let x=fx-body;x<fx+body;x+=4)fg.lineTo(x,liq+Math.sin(x*0.15+T*4)*1.5);fg.stroke();
    for(let k=0;k<12;k++){const a=T*1.3+k*0.52;fg.fillStyle='rgba(255,255,255,.12)';fg.beginPath();fg.arc(fx+Math.cos(a)*60*(k%3+1)/3,liq+30+((k*37+T*20)%60),2,0,TAU);fg.fill();}fg.restore();
    fp();fg.strokeStyle='rgba(220,230,255,.6)';fg.lineWidth=2;fg.stroke();
    fg.fillStyle='#333';fg.fillRect(fx-40,base+8,80,10);fg.fillStyle='rgba(201,168,76,.5)';fg.beginPath();fg.ellipse(fx,base+4,30,4,0,0,TAU);fg.fill();
    fg.fillStyle=COL.gl;fg.font='600 22px Cinzel,serif';fg.textAlign='center';fg.fillText('pH '+p.toFixed(2),fx,395);
    /* curve */
    gg.clearRect(0,0,gg.W,gg.H);const P=plot(gg,{x:[0,vmax],y:[0,14],xl:'დამატებული NaOH, მლ',yl:'pH',yt:[0,7,14],xt:[0,Math.round(vEq()),Math.round(vmax)],m:[8,8,24,30]});
    const I=IND[ind];if(ind!=='un'){gg.fillStyle='rgba(230,40,150,.08)';gg.fillRect(P.x0,P.Y(I[2]),P.w,P.Y(I[1])-P.Y(I[2]));}
    gg.beginPath();for(let i=0;i<=200;i++){const v=i/200*vmax;i?gg.lineTo(P.X(v),P.Y(ph(v))):gg.moveTo(P.X(v),P.Y(ph(v)));}gg.strokeStyle='rgba(201,168,76,.25)';gg.lineWidth=1;gg.stroke();
    gg.beginPath();pts.forEach((q,i)=>{i?gg.lineTo(P.X(q[0]),P.Y(q[1])):gg.moveTo(P.X(q[0]),P.Y(q[1]));});gg.strokeStyle=COL.gold;gg.lineWidth=2.5;gg.stroke();
    for(let k=1;k<=nEq();k++){const v=vEq()*k;gg.strokeStyle='rgba(232,112,90,.6)';gg.setLineDash([3,3]);gg.beginPath();gg.moveTo(P.X(v),P.y0);gg.lineTo(P.X(v),P.y0+P.h);gg.stroke();gg.setLineDash([]);gg.fillStyle=COL.red;gg.font='10px sans-serif';gg.textAlign='center';gg.fillText(`ეკვ.${nEq()>1?k:''} pH ${ph(v).toFixed(2)}`,P.X(v),P.y0+10+k*11);
      if(ACIDS[acid].Ka[k-1]<1){const vh=v-vEq()/2;gg.fillStyle=COL.cyan;gg.beginPath();gg.arc(P.X(vh),P.Y(ph(vh)),3.5,0,TAU);gg.fill();}}
    gg.fillStyle='#fff';gg.beginPath();gg.arc(P.X(vB),P.Y(p),4,0,TAU);gg.fill();
    const Ka=ACIDS[acid].Ka[0];$('tInfo').innerHTML=`<div class="kv2"><b>ეკვივალენტის წერტილი</b><span>${vEq().toFixed(2)} მლ NaOH</span><b>pH ეკვ.-ში</b><span>${ph(vEq()).toFixed(2)} ${Ka<1?'(> 7: A⁻ ჰიდროლიზდება)':'(= 7)'}</span>${Ka<1?`<b>ნახევარ-ეკვ. (ცისფერი)</b><span>pH = pKa = ${(-Math.log10(Ka)).toFixed(2)}</span>`:''}<b>ინდიკატორის ზონა</b><span>${ind==='un'?'0–14':I[1]+'–'+I[2]}</span></div>`;
    /* pH scale */
    sg.clearRect(0,0,sg.W,sg.H);for(let x=0;x<=860;x++){const c=uni(x/860*14);sg.fillStyle=`rgb(${c.join(',')})`;sg.fillRect(20+x,8,1.5,22);}
    sg.fillStyle='#fff';sg.font='10px sans-serif';sg.textAlign='center';for(let k=0;k<=14;k++)sg.fillText(k,20+k/14*860,42);
    PHS.forEach(([v,n],i)=>{const x=20+v/14*860;sg.fillStyle=COL.mid;sg.save();sg.translate(x,52+(i%2)*14);sg.fillText(n,0,6);sg.restore();});
    sg.strokeStyle='#fff';sg.lineWidth=2;sg.beginPath();sg.moveTo(20+p/14*860,4);sg.lineTo(20+p/14*860,34);sg.stroke();
  });
  const pcalc=()=>{const C=+$('pC').value,Kv=$('pK').value,typ=$('pT').value;if(!(C>0)){$('pO').innerHTML='';return;}let x;
    if(Kv===''){x=C;}else{const K=+Kv;x=(-K+Math.sqrt(K*K+4*K*C))/2;}const pX=-Math.log10(x+ (Kv===''?0:0)),pH=typ==='a'?pX:14-pX;
    $('pO').innerHTML=`<div class="kv2"><b>pH</b><span style="font-size:16px;color:var(--gold-lt)">${pH.toFixed(2)}</span><b>[${typ==='a'?'H⁺':'OH⁻'}]</b><span>${fmtN(x)} M</span><b>დისოციაციის ხარისხი α</b><span>${(x/C*100).toFixed(2)}%</span></div><div class="hint">სუსტისთვის ზუსტი ამოხსნა: x²/(C−x) = K.</div>`;};
  ['pC','pK'].forEach(i=>$(i).oninput=pcalc);$('pT').onchange=pcalc;pcalc();
  const bcalc=()=>{const pK=+$('bK').value,a=+$('bA').value,h=+$('bH').value;if(!(a>0&&h>0))return;const pH=pK+Math.log10(a/h);const add=0.01;const pH2=pK+Math.log10((a-add)/(h+add));
    $('bO').innerHTML=`pH = <b>${pH.toFixed(2)}</b> · 0.01 მოლი HCl-ის დამატებისას: pH ${pH2.toFixed(2)} (ცვლილება ${(pH2-pH).toFixed(3)}; სუფთა წყალში იქნებოდა 7 → 2)`;};
  ['bK','bA','bH'].forEach(i=>$(i).oninput=bcalc);bcalc();
 }});

/* ═══════════════════ 9. ELECTROCHEMISTRY — galvanic cell, Nernst, Faraday ═══════════════════ */
const EMF=[['Li',1,-3.04,'#c87ad8'],['K',1,-2.93,'#8a50d8'],['Ca',2,-2.87,'#5ae88a'],['Na',1,-2.71,'#9a6ae8'],['Mg',2,-2.37,'#8ae84a'],['Al',3,-1.66,'#b8b8c8'],['Mn',2,-1.18,'#c87aa8'],['Zn',2,-0.76,'#8a90b0'],['Cr',3,-0.74,'#70b0a0'],['Fe',2,-0.44,'#e0702a'],['Cd',2,-0.40,'#c0b070'],['Co',2,-0.28,'#e05080'],['Ni',2,-0.25,'#50d050'],['Sn',2,-0.14,'#a0a0b0'],['Pb',2,-0.13,'#707090'],['H',1,0,'#ffffff'],['Cu',2,0.34,'#d8884a'],['Ag',1,0.80,'#d0d0d8'],['Hg',2,0.85,'#c0c0d0'],['Pt',2,1.18,'#d0d0e0'],['Au',3,1.50,'#e8c040']];
const OXI=[['F₂/F⁻',2.87],['H₂O₂/H₂O',1.78],['MnO₄⁻/Mn²⁺',1.51],['Cl₂/Cl⁻',1.36],['Cr₂O₇²⁻/Cr³⁺',1.33],['O₂/H₂O',1.23],['Br₂/Br⁻',1.07],['Ag⁺/Ag',0.80],['Fe³⁺/Fe²⁺',0.77],['I₂/I⁻',0.54],['Cu²⁺/Cu',0.34],['2H⁺/H₂',0.00],['Fe²⁺/Fe',-0.44],['Zn²⁺/Zn',-0.76],['Al³⁺/Al',-1.66],['Na⁺/Na',-2.71],['Li⁺/Li',-3.04]];
reg({id:'echem',ico:'🔋',t:'ელექტროქიმია',s:'გალვანური ელემენტი · ნერნსტი · ელექტროლიზი',
 build(root){
  const opt=sel=>EMF.filter(e=>e[0]!=='H').map(e=>`<option value="${e[0]}"${e[0]===sel?' selected':''}>${e[0]} (${e[2]>0?'+':''}${e[2]} ვ)</option>`).join('');
  root.innerHTML=`<div class="arow"><div class="acol"><div id="eC"></div></div><div class="acol"><div class="actl"><label>ელექტროდი 1 <select id="eA">${opt('Zn')}</select></label><label>ელექტროდი 2 <select id="eB">${opt('Cu')}</select></label>
     ${sl('eCa','[ანოდის იონი]',0.001,2,0.001,1,'M')}${sl('eCc','[კათოდის იონი]',0.001,2,0.001,1,'M')}</div><div id="eI" class="ainfo"></div>
     ${card('🧮 ელექტროლიზი — ფარადეის კანონი',`<div class="calc"><label>ლითონი<select id="fM">${EMF.filter(e=>e[0]!=='H').map(e=>`<option value="${e[0]}"${e[0]==='Cu'?' selected':''}>${e[0]}${['','⁺','²⁺','³⁺'][e[1]]}</option>`).join('')}</select></label><label>დენი, ა<input id="fI" type="number" value="2"></label><label>დრო, წთ<input id="fT" type="number" value="30"></label></div><div id="fO" class="ainfo"></div>`)}</div></div>
   <div class="arow"><div class="acol">${card('სტანდარტული ელექტროდული პოტენციალები E° (ვ, 25 °C)',`<div class="emf">${OXI.map(([n,v])=>`<div><span>${n}</span><em class="bw"><i style="width:${Math.abs(v)/3.1*50}%;${v>=0?'left:50%':'right:50%'};background:${v>=0?'#5a9ae8':'#e8705a'}"></i></em><b>${v>0?'+':''}${v.toFixed(2)}</b></div>`).join('')}</div><div class="hint">ზემოთ — ძლიერი მჟანგავები (იღებენ e⁻), ქვემოთ — ძლიერი აღმდგენელები (გასცემენ e⁻).</div>`)}</div>
   <div class="acol">${card('ფორმულები',FX([['E°<sub>უჯრ.</sub> = E°<sub>კათოდი</sub> − E°<sub>ანოდი</sub>','ანოდზე ჟანგვა (−), კათოდზე აღდგენა (+)'],['E = E° − (RT/nF)·lnQ = E° − (0.0592/n)·lgQ','ნერნსტის განტოლება (25 °C)'],['ΔG° = −nFE°','E° > 0 ⇔ რეაქცია თავისთავად მიმდინარეობს'],
     ['lgK = nE°/0.0592','წონასწორობის მუდმივა პოტენციალიდან'],['m = (I·t·M)/(n·F)','ფარადეის კანონი; F = 96485 კ/მოლ'],['Q = I·t','მუხტი (კულონი)'],['„AN OX, RED CAT“','ანოდი — ჟანგვა, კათოდი — აღდგენა']]))}</div></div>`;
  const c=canvas($('eC'),460,360),g=c.g;let A='Zn',Bm='Cu',ca=1,cc=1,el=[],ions=[],dep=0,diss=0;
  const get=s=>EMF.find(e=>e[0]===s);
  function cell(){let a=get(A),b=get(Bm);if(a[2]>b[2])[a,b]=[b,a];const n=a[1]*b[1]/gcdI(a[1],b[1]),E0=b[2]-a[2];
    const [cA,cC]=get(A)[2]<=get(Bm)[2]?[ca,cc]:[cc,ca];const Q=Math.pow(cA,n/a[1])/Math.pow(cC,n/b[1]),E=E0-0.05916/n*Math.log10(Q);return {an:a,ca:b,n,E0,E,Q};}
  function gcdI(x,y){return y?gcdI(y,x%y):x;}
  function info(){const C=cell(),an=C.an,ct=C.ca,ka=C.n/an[1],kc=C.n/ct[1];const sp=(k,s)=>(k>1?k:'')+s;
    const q=x=>x>1?x+'+':'+';
    $('eI').innerHTML=A===Bm?'<span class="hint">აირჩიე ორი განსხვავებული ლითონი.</span>':`<div class="eqn">${sp(ka,an[0])} + ${sp(kc,ct[0]+'<sup>'+q(ct[1])+'</sup>')} → ${sp(ka,an[0]+'<sup>'+q(an[1])+'</sup>')} + ${sp(kc,ct[0])}</div>
     <div class="kv2"><b>ანოდი (−) ჟანგვა</b><span>${an[0]} → ${an[0]}<sup>${q(an[1])}</sup> + ${an[1]}e⁻</span><b>კათოდი (+) აღდგენა</b><span>${ct[0]}<sup>${q(ct[1])}</sup> + ${ct[1]}e⁻ → ${ct[0]}</span><b>n (გადატანილი e⁻)</b><span>${C.n}</span>
     <b>E°</b><span>${C.E0.toFixed(3)} ვ</span><b>E (ნერნსტი)</b><span style="color:var(--gold-lt);font-size:16px">${C.E.toFixed(3)} ვ</span><b>ΔG°</b><span>${(-C.n*F_C*C.E0/1000).toFixed(1)} კჯ/მოლ</span><b>K</b><span>${fmtN(Math.pow(10,C.n*C.E0/0.05916))}</span></div>
     <div class="hint">${an[2]<-2?'⚠ ასეთი აქტიური ლითონი წყალხსნარში წყალთან რეაგირებს — რეალურ ელემენტში არაწყლიანი ელექტროლიტი სჭირდება (როგორც ლითიუმის ბატარეაში).':'დანიელ-იაკობის ელემენტი (Zn–Cu) — 1.10 ვ.'}</div>`;}
  $('eA').onchange=e=>{A=e.target.value;info();};$('eB').onchange=e=>{Bm=e.target.value;info();};
  bindSl('eCa',v=>{ca=v;info();},v=>v.toFixed(3));bindSl('eCc',v=>{cc=v;info();},v=>v.toFixed(3));
  const fcalc=()=>{const m=get($('fM').value),I=+$('fI').value,t=+$('fT').value*60,M=BY[m[0]].m,Q=I*t,mass=Q*M/(m[1]*F_C);
    $('fO').innerHTML=`Q = ${Q.toFixed(0)} კ · n(e⁻) = ${(Q/F_C).toFixed(4)} მოლი · კათოდზე გამოიყოფა <b>${mass.toFixed(3)} გ ${m[0]}</b>`;};
  ['fI','fT'].forEach(i=>$(i).oninput=fcalc);$('fM').onchange=fcalc;fcalc();info();
  anim((dt,T)=>{g.clearRect(0,0,g.W,g.H);if(A===Bm)return;const C=cell(),an=C.an,ct=C.ca,run=C.E>0;
    const bk=(x,lab,col)=>{g.strokeStyle='rgba(220,230,255,.5)';g.lineWidth=2;g.beginPath();g.moveTo(x-75,170);g.lineTo(x-75,330);g.lineTo(x+75,330);g.lineTo(x+75,170);g.stroke();g.fillStyle=rgba(col,0.18);g.fillRect(x-73,200,146,128);};
    bk(110,an[0],an[3]);bk(350,ct[0],ct[3]);
    /* electrodes */
    const aw=Math.max(8,22-diss*0.02),cw=22+Math.min(14,dep*0.02);
    g.fillStyle=an[3];g.fillRect(110-aw/2,120,aw,170);g.fillStyle=ct[3];g.fillRect(350-cw/2,120,cw,170);
    g.fillStyle='#fff';g.font='600 15px Cinzel,serif';g.textAlign='center';g.fillText(an[0],110,112);g.fillText(ct[0],350,112);
    g.font='11px sans-serif';g.fillStyle=COL.red;g.fillText('ანოდი (−)',110,350);g.fillStyle=COL.blue;g.fillText('კათოდი (+)',350,350);
    /* wire + voltmeter */
    g.strokeStyle=COL.gold;g.lineWidth=2.5;g.beginPath();g.moveTo(110,120);g.lineTo(110,40);g.lineTo(350,40);g.lineTo(350,120);g.stroke();
    g.fillStyle='#141022';g.beginPath();g.arc(230,40,26,0,TAU);g.fill();g.strokeStyle=COL.gold;g.stroke();g.fillStyle=COL.gl;g.font='600 13px sans-serif';g.fillText(C.E.toFixed(2)+' V',230,45);
    /* salt bridge */
    g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=14;g.beginPath();g.moveTo(150,240);g.lineTo(150,160);g.lineTo(310,160);g.lineTo(310,240);g.stroke();g.lineWidth=10;g.strokeStyle='rgba(30,25,50,1)';g.stroke();
    g.fillStyle=COL.dim;g.font='10px sans-serif';g.fillText('მარილის ხიდი KNO₃',230,152);
    if(run){/* electrons along wire */const path=[[110,120],[110,40],[350,40],[350,120]],len=80+240+80;
      for(let k=0;k<10;k++){let d=((T*90+k*len/10)%len);let p;if(d<80)p=[110,120-d];else if(d<320)p=[110+d-80,40];else p=[350,40+d-320];g.fillStyle='#ffd27f';g.beginPath();g.arc(p[0],p[1],3,0,TAU);g.fill();}
      g.fillStyle='#ffd27f';g.fillText('e⁻ →',200,30);
      const rate=clamp(C.E,0,3)*2;if(Math.random()<dt*rate*3)ions.push({x:110+aw/2,y:200+Math.random()*90,vx:20+Math.random()*20,k:'an',life:0});
      if(Math.random()<dt*rate*3)ions.push({x:250+Math.random()*60,y:200+Math.random()*100,vx:-15,k:'ct',life:0});
      if(Math.random()<dt*rate*2)ions.push({t:0,k:'K'});if(Math.random()<dt*rate*2)ions.push({t:0,k:'N'});}
    ions.forEach(o=>{o.life=(o.life||0)+dt;
      if(o.k==='an'){o.x+=o.vx*dt;o.vx*=0.98;g.fillStyle=an[3];g.beginPath();g.arc(o.x,o.y,3.5,0,TAU);g.fill();g.fillStyle='#fff';g.font='8px sans-serif';g.fillText('+',o.x+5,o.y-3);if(o.life>3)o.dead=1;diss+=dt*0.5;}
      else if(o.k==='ct'){o.x+=(350+cw/2-o.x)*dt*0.9;g.fillStyle=ct[3];g.beginPath();g.arc(o.x,o.y,3.5,0,TAU);g.fill();if(Math.abs(o.x-350-cw/2)<4){o.dead=1;dep+=1;}}
      else{o.t+=dt*0.25;const t=o.t,ptsK=o.k==='K'?[[150,240],[150,160],[310,160],[310,240]]:[[310,240],[310,160],[150,160],[150,240]],seg=Math.min(2,Math.floor(t*3)),f=t*3-seg,a=ptsK[seg],b=ptsK[seg+1];
        if(t>=1){o.dead=1;}else{g.fillStyle=o.k==='K'?'#c0a0ff':'#80e0a0';g.beginPath();g.arc(lerp(a[0],b[0],f),lerp(a[1],b[1],f),2.5,0,TAU);g.fill();}}});
    ions=ions.filter(o=>!o.dead);
    g.fillStyle=COL.mid;g.font='10px sans-serif';g.textAlign='left';g.fillText(`${an[0]}${an[1]>1?an[1]:''}⁺ ხსნარში გადადის`,40,195);g.textAlign='right';g.fillText(`${ct[0]}${ct[1]>1?ct[1]:''}⁺ ილექება`,425,195);
    g.textAlign='center';g.fillStyle='#c0a0ff';g.fillText('K⁺ → კათოდისკენ',230,180);g.fillStyle='#80e0a0';g.fillText('NO₃⁻ → ანოდისკენ',230,195);
  });
 }});

/* ═══════════════════ 10. THERMODYNAMICS ═══════════════════ */
const TPRE=[['წყლის აორთქლება H₂O(ს) → H₂O(ა)',44.0,118.9],['CaCO₃ → CaO + CO₂',178.3,160.5],['N₂ + 3H₂ → 2NH₃',-92.2,-198.7],['CH₄ + 2O₂ → CO₂ + 2H₂O(ს)',-890.4,-242.8],['ყინულის დნობა',6.01,22.0],['2H₂O → 2H₂ + O₂',571.6,326.7]];
const HF=[['H₂O(ს)',-285.8],['H₂O(ა)',-241.8],['CO₂',-393.5],['CO',-110.5],['CH₄',-74.8],['C₂H₅OH(ს)',-277.7],['C₆H₁₂O₆',-1273],['NH₃',-46.1],['NO',90.3],['NO₂',33.2],['SO₂',-296.8],['SO₃',-395.7],['HCl',-92.3],['NaCl',-411.2],['CaO',-635.1],['CaCO₃',-1206.9],['Fe₂O₃',-824.2],['Al₂O₃',-1675.7],['O₂, N₂, H₂, C(გრაფიტი), Fe…',0]];
reg({id:'thermo',ico:'🔥',t:'თერმოდინამიკა',s:'ΔG = ΔH − TΔS · ენტროპია · ჰესის კანონი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="hG"></div><div class="actl"><div class="abt" id="hPre">${TPRE.map((p,i)=>`<button data-i="${i}">${p[0]}</button>`).join('')}</div>${sl('hH','ΔH',-1000,1000,1,44,'კჯ/მოლ')}${sl('hS','ΔS',-500,500,0.1,118.9,'ჯ/(მოლ·K)')}${sl('hT','T',0,2000,1,298,'K')}</div><div id="hI" class="ainfo"></div></div>
   <div class="acol"><div id="hE"></div><div class="abt"><button id="hX">⇥ ტიხრის მოხსნა</button><button id="hXr">↺</button></div><div id="hEI" class="ainfo"></div>
   ${card('🧮 კალორიმეტრია q = m·c·ΔT',`<div class="calc"><label>მასა, გ<input id="qm" type="number" value="200"></label><label>c, ჯ/(გ·K)<select id="qc"><option value="4.184">წყალი 4.184</option><option value="2.09">ყინული 2.09</option><option value="0.897">ალუმინი 0.897</option><option value="0.449">რკინა 0.449</option><option value="0.385">სპილენძი 0.385</option><option value="2.44">ეთანოლი 2.44</option></select></label><label>ΔT, K<input id="qt" type="number" value="80"></label></div><div id="qo" class="ainfo"></div>`)}</div></div>
   <div class="arow"><div class="acol">${card('წარმოქმნის სტანდარტული ენთალპიები ΔH°<sub>f</sub> (კჯ/მოლ)',`<div class="hf">${HF.map(([n,v])=>`<span>${n}</span><b>${v}</b>`).join('')}</div><div class="hint">ჰესის კანონი: CH₄ + 2O₂ → CO₂ + 2H₂O: ΔH = (−393.5 + 2·(−285.8)) − (−74.8) = −890.3 კჯ/მოლ.</div>`)}</div>
   <div class="acol">${card('ფორმულები',FX([['ΔG = ΔH − T·ΔS','გიბსის თავისუფალი ენერგია; ΔG < 0 → თავისთავადი'],['T<sub>გადასვლის</sub> = ΔH/ΔS','როცა ΔH და ΔS ერთნიშნიანია'],['ΔH°<sub>რ</sub> = ΣΔH°<sub>f</sub>(პროდ.) − ΣΔH°<sub>f</sub>(რეაგ.)','ჰესის კანონი'],['ΔU = q + w','თერმოდინამიკის I კანონი'],
     ['ΔS<sub>სამყარო</sub> ≥ 0','II კანონი'],['S = k<sub>B</sub>·lnW','ბოლცმანის ენტროპია; W — მიკრომდგომარეობები'],['ΔS = q<sub>შექც.</sub>/T','კლაუზიუსი'],['S(0 K) = 0 იდეალური კრისტალისთვის','III კანონი'],['q = m·c·ΔT · q = n·ΔH<sub>ფაზ.</sub>','სითბო'],['ΔG° = −RT·lnK','კავშირი წონასწორობასთან']]))}</div></div>`;
  const c=canvas($('hG'),460,260),g=c.g,ec=canvas($('hE'),440,200),eg=ec.g;let dH=44,dS=118.9,T=298;
  root.querySelectorAll('#hPre button').forEach(b=>b.onclick=()=>{const p=TPRE[+b.dataset.i];$('hH').value=p[1];$('hS').value=p[2];$('hH').dispatchEvent(new Event('input'));$('hS').dispatchEvent(new Event('input'));});
  const draw=()=>{g.clearRect(0,0,g.W,g.H);const f=t=>dH-t*dS/1000;const ys=[f(0),f(2000)],lo=Math.min(...ys,-50),hi=Math.max(...ys,50);
    const P=plot(g,{x:[0,2000],y:[lo,hi],xl:'T, K',yl:'ΔG, კჯ/მოლ',xt:[0,500,1000,1500,2000],m:[10,10,24,40]});
    g.fillStyle='rgba(111,207,138,.08)';g.fillRect(P.x0,P.Y(0),P.w,P.y0+P.h-P.Y(0));g.fillStyle='rgba(232,112,90,.06)';g.fillRect(P.x0,P.y0,P.w,P.Y(0)-P.y0);
    g.strokeStyle='rgba(255,255,255,.4)';g.beginPath();g.moveTo(P.x0,P.Y(0));g.lineTo(P.x0+P.w,P.Y(0));g.stroke();
    g.fillStyle=COL.green;g.font='10px sans-serif';g.textAlign='right';g.fillText('ΔG < 0 თავისთავადი',P.x0+P.w-4,P.y0+P.h-6);g.fillStyle=COL.red;g.fillText('ΔG > 0 არათავისთავადი',P.x0+P.w-4,P.y0+12);
    g.beginPath();g.moveTo(P.X(0),P.Y(f(0)));g.lineTo(P.X(2000),P.Y(f(2000)));g.strokeStyle=COL.gold;g.lineWidth=2.5;g.stroke();
    const tc=dS!==0?dH*1000/dS:null;if(tc>0&&tc<2000){g.fillStyle='#fff';g.beginPath();g.arc(P.X(tc),P.Y(0),4,0,TAU);g.fill();g.textAlign='center';g.fillText(`${tc.toFixed(0)} K (${(tc-273.15).toFixed(0)} °C)`,P.X(tc),P.Y(0)-8);}
    g.fillStyle='#7fd8ff';g.beginPath();g.arc(P.X(T),P.Y(f(T)),5,0,TAU);g.fill();
    const G=f(T),K=Math.exp(-G*1000/(R_GAS*Math.max(T,1)));const cs=dH<0&&dS>0?'ყოველთვის თავისთავადი':dH>0&&dS<0?'არასდროს თავისთავადი':dH<0?'დაბალ T-ზე თავისთავადი':'მაღალ T-ზე თავისთავადი';
    $('hI').innerHTML=`<div class="kv2"><b>ΔG(${T} K)</b><span style="color:${G<0?'#6fcf8a':'#e8705a'};font-size:16px">${G.toFixed(1)} კჯ/მოლ</span><b>K = e<sup>−ΔG/RT</sup></b><span>${fmtN(K)}</span><b>ტიპი</b><span>${cs}</span>${tc>0?`<b>გადასვლის T</b><span>${tc.toFixed(0)} K</span>`:''}</div>`;};
  bindSl('hH',v=>{dH=v;draw();});bindSl('hS',v=>{dS=v;draw();});bindSl('hT',v=>{T=v;draw();},v=>`${v} (${(v-273.15).toFixed(0)} °C)`);
  /* entropy: free expansion */
  let BX,open=false,t0=0;const reset=()=>{BX=Box(420,180);BX.wallX=210;BX.add(60,{v:()=>rayleigh(60),r:3.5});open=false;};reset();
  $('hX').onclick=()=>{open=true;BX.wallX=420;};$('hXr').onclick=reset;
  anim(dt=>{BX.step(dt,true);eg.clearRect(0,0,eg.W,eg.H);eg.strokeStyle='rgba(201,168,76,.5)';eg.strokeRect(10,10,420,180);if(!open){eg.fillStyle=COL.gold;eg.fillRect(10+210-2,10,4,180);}
    BX.draw(eg,10,10,()=>'#5fc8d8');const nL=BX.p.filter(q=>q.x<210).length,N=BX.p.length;
    const lnW=(()=>{let s=0;for(let i=1;i<=N;i++)s+=Math.log(i);for(let i=1;i<=nL;i++)s-=Math.log(i);for(let i=1;i<=N-nL;i++)s-=Math.log(i);return s;})();
    $('hEI').innerHTML=`მარცხნივ <b>${nL}</b> · მარჯვნივ <b>${N-nL}</b> · ln W = ln(N!/(N<sub>L</sub>!N<sub>R</sub>!)) = <b>${lnW.toFixed(1)}</b>${open?'':' — ტიხარი ჯერ ჩაკეტილია'}<div class="hint">ტიხრის მოხსნისას აირი თავისით ავსებს მთელ ჭურჭელს და უკან არასდროს „იკრიბება“ — ეს ენტროპიის ზრდაა: ΔS = nR·ln(V₂/V₁) = R·ln2 ერთ მოლზე ≈ 5.76 ჯ/K.</div>`;});
  const qc=()=>{const q=+$('qm').value*+$('qc').value*+$('qt').value;$('qo').innerHTML=`q = <b>${(q/1000).toFixed(2)} კჯ</b> = ${(q/4184).toFixed(2)} კკალ`;};['qm','qt'].forEach(i=>$(i).oninput=qc);$('qc').onchange=qc;qc();
 }});

/* ═══════════════════ 11. RADIOACTIVITY ═══════════════════ */
const ISO=[['¹⁴C',5730,'წ','β⁻','¹⁴C → ¹⁴N + e⁻ + ν̄','რადიონახშირბადული დათარიღება'],['¹³¹I',8.02,'დღე','β⁻','¹³¹I → ¹³¹Xe + e⁻ + ν̄','ფარისებრი ჯირკვლის მკურნალობა; ჩერნობილის გამონაბოლქვი'],['²²²Rn',3.82,'დღე','α','²²²Rn → ²¹⁸Po + ⁴He','სარდაფებში გროვდება'],
 ['⁶⁰Co',5.27,'წ','β⁻, γ','⁶⁰Co → ⁶⁰Ni + e⁻ + γ','რადიოთერაპია, სტერილიზაცია'],['²³⁸U',4.468e9,'წ','α','²³⁸U → ²³⁴Th + ⁴He','დედამიწის ასაკის განსაზღვრა'],['⁹⁹ᵐTc',6.01,'სთ','γ','⁹⁹ᵐTc → ⁹⁹Tc + γ','სამედიცინო დიაგნოსტიკა'],['²¹⁰Po',138.4,'დღე','α','²¹⁰Po → ²⁰⁶Pb + ⁴He','უკიდურესად ტოქსიკური α-გამომსხივებელი'],['¹⁸F',109.8,'წთ','β⁺','¹⁸F → ¹⁸O + e⁺ + ν','PET-ტომოგრაფია']];
const CHAIN=[['²³⁸U','α','4.47 მლრდ წ'],['²³⁴Th','β⁻','24.1 დღე'],['²³⁴ᵐPa','β⁻','1.17 წთ'],['²³⁴U','α','245 ათ. წ'],['²³⁰Th','α','75 ათ. წ'],['²²⁶Ra','α','1600 წ'],['²²²Rn','α','3.82 დღე'],['²¹⁸Po','α','3.1 წთ'],['²¹⁴Pb','β⁻','26.8 წთ'],['²¹⁴Bi','β⁻','19.9 წთ'],['²¹⁴Po','α','164 მკწმ'],['²¹⁰Pb','β⁻','22.2 წ'],['²¹⁰Bi','β⁻','5.0 დღე'],['²¹⁰Po','α','138 დღე'],['²⁰⁶Pb','—','სტაბილური']];
reg({id:'nuc',ico:'☢',t:'რადიოაქტიურობა',s:'დაშლა ანიმაციით · ნახევარდაშლა · დათარიღება · ჯაჭვი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="nG"></div><div class="actl">${btns('iso',ISO.map((x,i)=>[i,x[0]]),0)}<div class="abt"><button id="nR">↺ თავიდან (400 ბირთვი)</button></div></div></div>
   <div class="acol"><div id="nP"></div><div id="nI" class="ainfo"></div>${card('🧮 რადიონახშირბადული დათარიღება',`<div class="calc"><label>დარჩენილი ¹⁴C, %<input id="dP" type="number" value="25"></label><label>ან ასაკი, წ<input id="dY" type="number" value=""></label></div><div id="dO" class="ainfo"></div>`)}</div></div>
   <div class="arow"><div class="acol">${card('²³⁸U-ის დაშლის ჯაჭვი → ²⁰⁶Pb (8α + 6β⁻)',`<div class="chain2">${CHAIN.map(([n,t,h])=>`<span><b>${n}</b><small>${h}</small></span>${t!=='—'?`<i>${t}</i>`:''}`).join('')}</div>`)}
     ${card('გამოსხივების შეღწევადობა',`<div id="nPen"></div>`)}</div>
   <div class="acol">${card('ფორმულები',FX([['N = N₀·e<sup>−λt</sup> = N₀·(½)<sup>t/t½</sup>','რადიოაქტიური დაშლის კანონი'],['λ = ln2 / t½','დაშლის მუდმივა'],['A = λ·N','აქტივობა, ბეკერელი (1 Bq = 1 დაშლა/წმ)'],['t = (t½/ln2)·ln(N₀/N)','ასაკი'],
     ['α: <sup>A</sup><sub>Z</sub>X → <sup>A−4</sup><sub>Z−2</sub>Y + ⁴He','ჰელიუმის ბირთვი'],['β⁻: n → p + e⁻ + ν̄ (Z+1)','β⁺: p → n + e⁺ + ν (Z−1)'],['γ: X* → X + γ','აღგზნებული ბირთვის ფოტონი'],['E = Δm·c² · 1 u = 931.5 მევ','მასის დეფექტი — ბმის ენერგია'],['²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n + 200 მევ','გაყოფა'],['²H + ³H → ⁴He + n + 17.6 მევ','სინთეზი (მზე, თერმობირთვული)']]))}</div></div>`;
  const c=canvas($('nG'),420,300),g=c.g,pc=canvas($('nP'),440,180),pg=pc.g,qc=canvas($('nPen'),440,120),qg=qc.g;
  let iso=ISO[0],N0=400,nuc=[],t=0,ser=[],fx=[];const TH=3;/* one half-life = 3 s on screen */
  const reset=()=>{nuc=[];for(let i=0;i<N0;i++)nuc.push({x:20+(i%20)*19.5,y:18+Math.floor(i/20)*13.5,d:0});t=0;ser=[[0,N0]];fx=[];};reset();
  bindBtns(root,'iso',k=>{iso=ISO[+k];reset();});$('nR').onclick=reset;
  anim(dt=>{t+=dt;const p=1-Math.pow(0.5,dt/TH);let left=0;
    for(const n of nuc){if(!n.d&&Math.random()<p){n.d=1;n.f=0;fx.push({x:n.x,y:n.y,a:Math.random()*TAU,t:0,k:iso[3]});}if(!n.d)left++;}
    if(t-ser[ser.length-1][0]>0.1)ser.push([t,left]);
    g.clearRect(0,0,g.W,g.H);for(const n of nuc){g.fillStyle=n.d?'rgba(120,120,140,.35)':'#7fe05a';g.beginPath();g.arc(n.x,n.y,n.d?3:4.2,0,TAU);g.fill();if(n.d&&n.f<1){n.f+=dt*2;g.strokeStyle=`rgba(255,240,150,${1-n.f})`;g.beginPath();g.arc(n.x,n.y,4+n.f*10,0,TAU);g.stroke();}}
    fx.forEach(f=>{f.t+=dt;const r=f.t*220,x=f.x+Math.cos(f.a)*r,y=f.y+Math.sin(f.a)*r;if(f.k.startsWith('α')){g.fillStyle='#e8705a';g.beginPath();g.arc(x,y,3,0,TAU);g.arc(x+4,y,3,0,TAU);g.fill();}else if(f.k.startsWith('β')){g.fillStyle=f.k.includes('+')?'#ff80c0':'#7fd8ff';g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill();}
      if(f.k.includes('γ')){g.strokeStyle='rgba(255,255,160,.8)';g.beginPath();for(let k=0;k<6;k++){const rr=r*0.9+k*3;g.lineTo(f.x+Math.cos(f.a+0.3)*rr+Math.sin(k*2)*2,f.y+Math.sin(f.a+0.3)*rr);}g.stroke();}});fx=fx.filter(f=>f.t<1);
    g.fillStyle=COL.gl;g.font='600 13px sans-serif';g.textAlign='left';g.fillText(`${iso[0]} · დარჩა ${left}/${N0} · ${(t/TH).toFixed(2)} t½ = ${fmtN(t/TH*iso[1])} ${iso[2]}`.replace(/<[^>]+>/g,''),10,292);
    pg.clearRect(0,0,pg.W,pg.H);const tm=Math.max(5*TH,t);const P=plot(pg,{x:[0,tm/TH],y:[0,N0],xl:'დრო (t½-ის ერთეულებში)',yl:'N',yt:[0,N0/4,N0/2,N0],xt:[0,1,2,3,4,5].filter(x=>x<=tm/TH),m:[8,8,24,34]});
    pg.beginPath();for(let i=0;i<=200;i++){const x=i/200*tm/TH;i?pg.lineTo(P.X(x),P.Y(N0*Math.pow(0.5,x))):pg.moveTo(P.X(x),P.Y(N0));}pg.strokeStyle='rgba(201,168,76,.6)';pg.setLineDash([4,3]);pg.stroke();pg.setLineDash([]);
    pg.beginPath();ser.forEach((s,i)=>{i?pg.lineTo(P.X(s[0]/TH),P.Y(s[1])):pg.moveTo(P.X(0),P.Y(s[1]));});pg.strokeStyle='#7fe05a';pg.lineWidth=2;pg.stroke();
    $('nI').innerHTML=`<div class="kv2"><b>იზოტოპი</b><span>${iso[0]} — ${iso[5]}</span><b>t½</b><span>${fmtN(iso[1])} ${iso[2]}</span><b>დაშლის ტიპი</b><span>${iso[3]}</span><b>რეაქცია</b><span>${iso[4]}</span><b>λ = ln2/t½</b><span>${fmtN(Math.LN2/iso[1])} ${iso[2]}⁻¹</span></div><div class="hint">მწვანე — ექსპერიმენტი (შემთხვევითი დაშლა), წყვეტილი — N₀·(½)<sup>t/t½</sup>. თითოეული ბირთვის დაშლა შემთხვევითია, ბევრის ერთად — კანონზომიერი.</div>`;
    /* penetration */
    qg.clearRect(0,0,qg.W,qg.H);[[130,'ქაღალდი','rgba(240,240,220,.6)',6],[250,'ალუმინი 5 მმ','rgba(180,190,210,.7)',10],[370,'ტყვია / ბეტონი','rgba(110,110,130,.9)',22]].forEach(([x,n,cl,w])=>{qg.fillStyle=cl;qg.fillRect(x,10,w,90);qg.fillStyle=COL.mid;qg.font='10px sans-serif';qg.textAlign='center';qg.fillText(n,x+w/2,112);});
    const ph=(t*120)%420;[[25,'α','#e8705a',130],[55,'β','#7fd8ff',250],[85,'γ','#ffff90',370]].forEach(([y,l,cl,stop])=>{const x=Math.min(10+ph,stop+(l==='γ'?60:0));qg.strokeStyle=cl;qg.lineWidth=2;qg.beginPath();qg.moveTo(10,y);for(let xx=10;xx<x;xx+=3)qg.lineTo(xx,y+(l==='γ'?Math.sin(xx*0.4)*4:0));qg.stroke();qg.fillStyle=cl;qg.font='600 12px sans-serif';qg.textAlign='left';qg.fillText(l,0,y+4);});
  });
  const dc=e=>{const H=5730;if(e&&e.target.id==='dY'&&$('dY').value!==''){const y=+$('dY').value;$('dP').value=(100*Math.pow(0.5,y/H)).toFixed(3);}const p=+$('dP').value;if(!(p>0&&p<=100)){$('dO').innerHTML='';return;}const age=H/Math.LN2*Math.log(100/p);
    $('dO').innerHTML=`ასაკი ≈ <b>${Math.round(age).toLocaleString('en').replace(/,/g,' ')} წელი</b> (${(age/H).toFixed(2)} ნახევარდაშლა)${age>50000?' · ⚠ 50 000 წელზე მეტი — ¹⁴C-ის მეთოდი უკვე არაზუსტია':''}`;};
  $('dP').oninput=()=>{$('dY').value='';dc();};$('dY').oninput=dc;dc();
 }});

/* ═══════════════════ 12. VSEPR — molecular geometry in 3-D ═══════════════════ */
const T4=[[0,1,0],...[0,120,240].map(a=>[0.9428*Math.cos(a*Math.PI/180),-1/3,0.9428*Math.sin(a*Math.PI/180)])];
const DOM={2:[[1,0,0],[-1,0,0]],3:[[0,1,0],[-0.866,-0.5,0],[0.866,-0.5,0]],4:T4,5:[[0,1,0],[0,-1,0],[1,0,0],[-0.5,0,0.866],[-0.5,0,-0.866]],6:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]};
const VS=[['AX₂','CO2','C','O',2,[],'წრფივი','წრფივი','180°','sp','არაპოლარული','CO₂, BeCl₂, HCN',2],
 ['AX₃','BF3','B','F',3,[],'ბრტყელი სამკუთხა','ბრტყელი სამკუთხა','120°','sp²','არაპოლარული','BF₃, SO₃, CO₃²⁻'],
 ['AX₂E','SO2','S','O',3,[0],'კუთხური','ბრტყელი სამკუთხა','≈119°','sp²','პოლარული','SO₂, O₃, NO₂⁻'],
 ['AX₄','CH4','C','H',4,[],'ტეტრაედრი','ტეტრაედრი','109.5°','sp³','არაპოლარული','CH₄, CCl₄, NH₄⁺, SO₄²⁻'],
 ['AX₃E','NH3','N','H',4,[0],'სამკუთხა პირამიდა','ტეტრაედრი','107°','sp³','პოლარული','NH₃, PCl₃, H₃O⁺'],
 ['AX₂E₂','H2O','O','H',4,[0,1],'კუთხური','ტეტრაედრი','104.5°','sp³','პოლარული','H₂O, H₂S, OF₂'],
 ['AX₅','PCl5','P','Cl',5,[],'ტრიგონალური ბიპირამიდა','ტრიგონ. ბიპირამიდა','90°, 120°','sp³d','არაპოლარული','PCl₅, PF₅'],
 ['AX₄E','SF4','S','F',5,[2],'„საქანელა“','ტრიგონ. ბიპირამიდა','≈102°, 173°','sp³d','პოლარული','SF₄, IF₄⁺'],
 ['AX₃E₂','ClF3','Cl','F',5,[2,3],'T-ფორმა','ტრიგონ. ბიპირამიდა','≈87.5°','sp³d','პოლარული','ClF₃, BrF₃'],
 ['AX₂E₃','XeF2','Xe','F',5,[2,3,4],'წრფივი','ტრიგონ. ბიპირამიდა','180°','sp³d','არაპოლარული','XeF₂, I₃⁻'],
 ['AX₆','SF6','S','F',6,[],'ოქტაედრი','ოქტაედრი','90°','sp³d²','არაპოლარული','SF₆, [Fe(CN)₆]³⁻'],
 ['AX₅E','BrF5','Br','F',6,[2],'კვადრატული პირამიდა','ოქტაედრი','≈85°','sp³d²','პოლარული','BrF₅, IF₅'],
 ['AX₄E₂','XeF4','Xe','F',6,[2,3],'ბრტყელი კვადრატი','ოქტაედრი','90°','sp³d²','არაპოლარული','XeF₄, [PtCl₄]²⁻']];
reg({id:'vsepr',ico:'⬡',t:'მოლეკულის გეომეტრია (VSEPR)',s:'13 ფორმა 3D-ში · ჰიბრიდიზაცია · პოლარობა',
 build(root){
  root.innerHTML=`<div class="actl">${btns('vs',VS.map((v,i)=>[i,v[0]]),3)}</div><div class="arow"><div class="acol"><div id="vC"></div><div class="hint">გადაათრიე — მოტრიალება · ბორბალი — მასშტაბი. იისფერი ღრუბლები — თავისუფალი ელექტრონული წყვილები (E).</div></div><div class="acol"><div id="vI" class="ainfo"></div>
   ${card('ფორმულები და წესები',FX([['AX<sub>n</sub>E<sub>m</sub>: n+m = სტერიკული რიცხვი','ელექტრონული წყვილები ერთმანეთს განიზიდავს და მაქსიმალურად შორდება'],['თავისუფალი წყვილი > ბმის წყვილი','განზიდვის ძალა: E–E > E–X > X–X → კუთხე მცირდება (H₂O 104.5° < 109.5°)'],
     ['sp 180° · sp² 120° · sp³ 109.5° · sp³d 90/120° · sp³d² 90°','ჰიბრიდიზაცია'],['μ = q·d (დებაი)','დიპოლური მომენტი; სიმეტრიულ მოლეკულაში ვექტორები ბათილდება'],['cos θ = −1/3 → θ = 109.47°','ტეტრაედრული კუთხე']]))}</div></div>`;
  const c=canvas($('vC'),460,400),S=S3(c,{scale:95,spin:0.5});
  function set(i){const v=VS[i],dirs=DOM[v[4]],lp=v[5];S.atoms=[{p:[0,0,0],r:0.42,c:cpk(v[2]),lab:v[2]}];S.bonds=[];S.lobes=[];
    const BL=1.55;dirs.forEach((d,k)=>{if(lp.includes(k)){S.lobes.push({p:d.map(x=>x*0.95),o:[0,0,0],r:0.75,c:'#9a84e0'});return;}S.atoms.push({p:d.map(x=>x*BL),r:v[3]==='H'?0.24:0.34,c:cpk(v[3]),lab:v[3]});S.bonds.push([0,S.atoms.length-1,'',0.12,v[1]==='CO2'||(v[1]==='SO2')?2:1]);});
    $('vI').innerHTML=`<div class="big">${v[1].replace(/(\d)/g,'<sub>$1</sub>')}</div><div class="kv2"><b>ტიპი</b><span>${v[0]}</span><b>მოლეკულის ფორმა</b><span style="color:var(--gold-lt)">${v[6]}</span><b>ელექტრონული გეომეტრია</b><span>${v[7]}</span><b>ვალენტური კუთხე</b><span>${v[8]}</span>
      <b>ჰიბრიდიზაცია</b><span>${v[9]}</span><b>პოლარობა</b><span>${v[10]}</span><b>მაგალითები</b><span>${v[11]}</span></div>`;}
  bindBtns(root,'vs',k=>set(+k));set(3);anim(dt=>S.draw(dt));
 }});

/* ═══════════════════ 13. CRYSTAL LATTICES ═══════════════════ */
const CELLS={
 sc:{n:'მარტივი კუბური',Z:1,CN:6,pf:'52.4%',ar:'a = 2r',ex:'პოლონიუმი',m:[['Po',335.9,208.98,1]]},
 bcc:{n:'მოცულობაცენტრირებული (BCC)',Z:2,CN:8,pf:'68.0%',ar:'a = 4r/√3',ex:'Fe(α), Na, K, Cr, W',m:[['Fe',286.65,55.845,2],['Na',429.06,22.99,2],['W',316.5,183.84,2]]},
 fcc:{n:'წახნაგცენტრირებული (FCC)',Z:4,CN:12,pf:'74.0% (მაქსიმუმი)',ar:'a = 2√2·r',ex:'Cu, Al, Au, Ag, Ni, Pb',m:[['Cu',361.49,63.546,4],['Al',404.95,26.98,4],['Au',407.82,196.97,4]]},
 nacl:{n:'NaCl (ქვამარილი)',Z:4,CN:'6:6',pf:'—',ar:'a = 2(r⁺ + r⁻)',ex:'NaCl, KCl, MgO, AgCl',m:[['NaCl',564.02,58.44,4]]},
 cscl:{n:'CsCl',Z:1,CN:'8:8',pf:'—',ar:'a√3 = 2(r⁺ + r⁻)',ex:'CsCl, CsBr, NH₄Cl',m:[['CsCl',412.3,168.36,1]]},
 dia:{n:'ალმასი',Z:8,CN:4,pf:'34.0%',ar:'a√3/4 = 2r',ex:'C (ალმასი), Si, Ge, α-Sn',m:[['C',356.7,12.011,8],['Si',543.1,28.085,8]]},
 caf2:{n:'ფლუორიტი CaF₂',Z:4,CN:'8:4',pf:'—',ar:'—',ex:'CaF₂, UO₂, ZrO₂',m:[['CaF2',546.3,78.07,4]]}};
function cellAtoms(k,rep){const A=[];const add=(x,y,z,s,r)=>{A.push({p:[x,y,z],s,r});};
  const corners=[],faces=[];for(const x of [0,1])for(const y of [0,1])for(const z of [0,1])corners.push([x,y,z]);
  [[.5,.5,0],[.5,.5,1],[.5,0,.5],[.5,1,.5],[0,.5,.5],[1,.5,.5]].forEach(f=>faces.push(f));
  const fccSites=[...corners,...faces];
  if(k==='sc')corners.forEach(p=>add(...p,'Po',0.5));
  if(k==='bcc'){corners.forEach(p=>add(...p,'Fe',0.43));add(.5,.5,.5,'Fe',0.43);}
  if(k==='fcc')fccSites.forEach(p=>add(...p,'Cu',0.35));
  if(k==='nacl'){fccSites.forEach(p=>add(...p,'Cl',0.3));[[.5,0,0],[0,.5,0],[0,0,.5],[.5,1,0],[1,.5,0],[.5,0,1],[0,.5,1],[1,0,.5],[0,1,.5],[.5,1,1],[1,.5,1],[1,1,.5],[.5,.5,.5]].forEach(p=>add(...p,'Na',0.17));}
  if(k==='cscl'){corners.forEach(p=>add(...p,'Cl',0.3));add(.5,.5,.5,'Cs',0.28);}
  if(k==='dia'){fccSites.forEach(p=>add(...p,'C',0.15));[[.25,.25,.25],[.75,.75,.25],[.75,.25,.75],[.25,.75,.75]].forEach(p=>add(...p,'C',0.15));}
  if(k==='caf2'){fccSites.forEach(p=>add(...p,'Ca',0.22));for(const x of [.25,.75])for(const y of [.25,.75])for(const z of [.25,.75])add(x,y,z,'F',0.17);}
  if(rep){const B=[];for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let l=0;l<2;l++)A.forEach(a=>B.push({...a,p:[a.p[0]+i,a.p[1]+j,a.p[2]+l]}));const seen=new Set();return B.filter(a=>{const key=a.p.map(v=>v.toFixed(3)).join(',')+a.s;if(seen.has(key))return false;seen.add(key);return true;});}
  return A;}
reg({id:'cryst',ico:'◈',t:'კრისტალური მესერი',s:'ელემენტარული უჯრედი 3D · შეფუთვა · სიმკვრივე',
 build(root){
  root.innerHTML=`<div class="actl">${btns('cr',Object.entries(CELLS).map(([k,v])=>[k,v.n]),'fcc')}<label class="hint"><input type="checkbox" id="crR"> 2×2×2 უჯრედი</label><label class="hint"><input type="checkbox" id="crB" checked> ბმები/ხაზები</label><label class="hint"><input type="checkbox" id="crF"> ატომების რეალური ზომა (ეხებიან ერთმანეთს)</label></div>
   <div class="arow"><div class="acol"><div id="crC"></div></div><div class="acol"><div id="crI" class="ainfo"></div>${card('🧮 სიმკვრივე მესრის პარამეტრიდან',`<div id="crD"></div>`)}
   ${card('ფორმულები',FX([['ρ = Z·M / (N<sub>A</sub>·a³)','Z — ატომი/ფორმულური ერთეული უჯრედში'],['კუთხე ⅛ · წიბო ¼ · წახნაგი ½ · ცენტრი 1','უჯრედზე მოსული ნაწილი'],['SC: 8·⅛ = 1 · BCC: 1+1 = 2 · FCC: 1+3 = 4','ატომების რაოდენობა'],['η = Z·(4/3)πr³ / a³','შეფუთვის სიმკვრივე'],['nλ = 2d·sinθ','ბრეგის კანონი — რენტგენოსტრუქტურული ანალიზი']]))}</div></div>`;
  const c=canvas($('crC'),460,420),S=S3(c,{scale:140,spin:0.35,pitch:0.45});let k='fcc',rep=false,bonds=true,full=false;
  function set(){const at=cellAtoms(k,rep),L=rep?2:1,o=L/2;S.atoms=at.map(a=>({p:[a.p[0]-o,a.p[1]-o,a.p[2]-o],r:a.r*(rep?0.75:1)*(full?1:0.5),c:cpk(a.s),lab:rep?'':a.s}));S.scale=rep?95:150;S.bonds=[];
    S.lines=[];const E=[];for(const x of [0,1])for(const y of [0,1])for(const z of [0,1]){if(!x)E.push([[x,y,z],[1,y,z]]);if(!y)E.push([[x,y,z],[x,1,z]]);if(!z)E.push([[x,y,z],[x,y,1]]);}
    for(let i=0;i<L;i++)for(let j=0;j<L;j++)for(let l=0;l<L;l++)E.forEach(([a,b])=>S.lines.push([[a[0]+i-o,a[1]+j-o,a[2]+l-o],[b[0]+i-o,b[1]+j-o,b[2]+l-o],'rgba(201,168,76,.45)',1.2]));
    if(bonds){const nn={dia:Math.sqrt(3)/4,nacl:0.5,cscl:Math.sqrt(3)/2,caf2:Math.sqrt(3)/4}[k];if(nn)for(let i=0;i<S.atoms.length;i++)for(let j=i+1;j<S.atoms.length;j++){const a=S.atoms[i],b=S.atoms[j];if(k!=='dia'&&a.c===b.c)continue;const d=Math.hypot(a.p[0]-b.p[0],a.p[1]-b.p[1],a.p[2]-b.p[2]);if(Math.abs(d-nn)<0.02)S.bonds.push([i,j,'',0.05]);}}
    const C=CELLS[k];$('crI').innerHTML=`<div class="big">${C.n}</div><div class="kv2"><b>ერთეული უჯრედში (Z)</b><span>${C.Z}</span><b>საკოორდინაციო რიცხვი</b><span>${C.CN}</span><b>შეფუთვის სიმკვრივე</b><span>${C.pf}</span><b>a და r</b><span>${C.ar}</span><b>მაგალითები</b><span>${C.ex}</span></div>`;
    $('crD').innerHTML=C.m.map(([s,a,M,Z])=>{const rho=Z*M/(NA*Math.pow(a*1e-10,3));const real={NaCl:2.165,CsCl:3.988,CaF2:3.18,C:3.515}[s]||(BY[s]&&EXT[BY[s].z-1]?EXT[BY[s].z-1][2]:null);return `<div class="kv2" style="margin-bottom:6px"><b>${s}</b><span>a = ${a} პმ, M = ${M}, Z = ${Z} → <b style="color:var(--gold-lt)">ρ = ${rho.toFixed(3)} გ/სმ³</b>${real?` · ცნობარი ${real}`:''}</span></div>`;}).join('');}
  bindBtns(root,'cr',v=>{k=v;set();});$('crR').onchange=e=>{rep=e.target.checked;set();};$('crB').onchange=e=>{bonds=e.target.checked;set();};$('crF').onchange=e=>{full=e.target.checked;set();};set();anim(dt=>S.draw(dt));
 }});

/* ═══════════════════ 14. ORGANIC — SN2 mechanism in 3-D + reference ═══════════════════ */
const FGT=[['ალკანი','CₙH₂ₙ₊₂','C–C','მეთანი CH₄','-ანი'],['ალკენი','CₙH₂ₙ','C=C','ეთილენი C₂H₄','-ენი'],['ალკინი','CₙH₂ₙ₋₂','C≡C','აცეტილენი C₂H₂','-ინი'],['არენი','—','ბენზოლის რგოლი','ბენზოლი C₆H₆','—'],['ჰალოგენალკანი','R–X','–F, –Cl, –Br, –I','ქლორმეთანი','ჰალოგენ-'],
 ['სპირტი','R–OH','–OH ჰიდროქსილი','ეთანოლი','-ოლი'],['ფენოლი','Ar–OH','–OH რგოლზე','ფენოლი','—'],['ეთერი','R–O–R′','–O–','დიეთილეთერი','ეთერი'],['ალდეჰიდი','R–CHO','–CHO','ეთანალი','-ალი'],['კეტონი','R–CO–R′','>C=O','აცეტონი','-ონი'],
 ['კარბონმჟავა','R–COOH','–COOH კარბოქსილი','ძმარმჟავა','-მჟავა'],['რთული ეთერი','R–COO–R′','–COO–','ეთილაცეტატი','-ატი'],['ამინი','R–NH₂','–NH₂','მეთილამინი','-ამინი'],['ამიდი','R–CONH₂','–CONH₂','შარდოვანა','-ამიდი'],['ნიტრილი','R–C≡N','–C≡N','აცეტონიტრილი','-ნიტრილი'],['თიოლი','R–SH','–SH','მეთანთიოლი','-თიოლი']];
reg({id:'org',ico:'⌬',t:'ორგანული ქიმია',s:'SN2 მექანიზმი 3D · ვალდენის ინვერსია · ფუნქციური ჯგუფები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="snC"></div><div class="actl">${sl('snS','სიჩქარე',0.1,1.5,0.05,0.4)}<div class="abt"><button id="snP">⏸ პაუზა</button></div></div></div><div class="acol"><div id="snE"></div><div id="snI" class="ainfo"></div></div></div>
   <div class="arow"><div class="acol">${card('ფუნქციური ჯგუფები',`<table class="stq"><tr><th>კლასი</th><th>ზოგადი</th><th>ჯგუფი</th><th>მაგალითი</th><th>სუფიქსი</th></tr>${FGT.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table>`)}</div>
   <div class="acol">${card('მექანიზმები და ფორმულები',FX([['S<sub>N</sub>2: v = k[RX][Nu⁻]','ერთსაფეხურიანი; ნუკლეოფილი უკნიდან უტევს → კონფიგურაციის ინვერსია (ქოლგა გადაბრუნდება)'],['S<sub>N</sub>1: v = k[RX]','ორსაფეხურიანი: კარბკატიონი → რაცემიზაცია; მესამეული RX'],['E2: v = k[RX][B⁻]','ელიმინირება — ალკენი; ზაიცევის წესი'],
     ['მარკოვნიკოვის წესი','HX-ის მიერთებისას H უერთდება მეტ-წყალბადიან ნახშირბადს'],['იზომერია: სტრუქტურული · ცის/ტრანს · ოპტიკური (R/S)','ქირალური ნახშირბადი — 4 სხვადასხვა შემცვლელი'],['CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → nCO₂ + (n+1)H₂O','ალკანის სრული წვა'],['DBE = (2C + 2 + N − H − X)/2','უჯერობის ხარისხი (რგოლები + π-ბმები)']]))}</div></div>`;
  const c=canvas($('snC'),460,340),S=S3(c,{scale:62,spin:0.15,yaw:0.4,pitch:0.25,auto:true}),ec=canvas($('snE'),440,170),eg=ec.g;let t=0,sp=0.4,pause=false;
  bindSl('snS',v=>sp=v);$('snP').onclick=()=>{pause=!pause;$('snP').textContent=pause?'▶ გაგრძელება':'⏸ პაუზა';};
  const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
  anim(dt=>{if(!pause)t=(t+dt*sp*0.25)%1.15;const u=Math.min(1,t);
    const ox=lerp(-4.2,-1.43,ease(u/0.5)),brx=lerp(1.94,1.94,0)+ease((u-0.5)/0.5)*3,hx=lerp(-0.36,0.36,ease((u-0.25)/0.5));
    const H=[0,120,240].map(a=>[hx,Math.cos(a*Math.PI/180)*1.03,Math.sin(a*Math.PI/180)*1.03]);
    S.atoms=[{p:[0,0,0],r:0.38,c:cpk('C'),lab:'C'},{p:[ox,0,0],r:0.36,c:cpk('O'),lab:'O'},{p:[ox-0.55,0.75,0],r:0.22,c:cpk('H'),lab:'H'},{p:[brx,0,0],r:0.5,c:'#a8402a',lab:'Br'},...H.map(p=>({p,r:0.24,c:cpk('H'),lab:'H'}))];
    const fo=ease((u-0.2)/0.4),fb=1-ease((u-0.45)/0.35);S.bonds=[[1,2,'',0.12],[0,4,'',0.12],[0,5,'',0.12],[0,6,'',0.12]];
    if(fo>0.05)S.bonds.push([0,1,fo<0.95?'d':'',0.12]);if(fb>0.05)S.bonds.push([0,3,fb<0.95?'d':'',0.12]);
    S.extra=(g,s)=>{const q=s.proj([ox,0,0]);g.fillStyle='#8ab8ff';g.font='600 14px sans-serif';g.fillText(fo<0.5?'⁻':'',q[0]+12,q[1]-12);const b=s.proj([brx,0,0]);if(fb<0.5){g.fillStyle='#8ab8ff';g.fillText('⁻',b[0]+16,b[1]-14);}
      g.fillStyle=COL.gl;g.font='12px sans-serif';g.textAlign='left';g.fillText(u<0.35?'1. HO⁻ უტევს უკნიდან (Br-ის საპირისპიროდ)':u<0.65?'2. გარდამავალი მდგომარეობა ‡: C ხუთ-კოორდინაციული, H-ები ერთ სიბრტყეში':'3. Br⁻ წავიდა — კონფიგურაცია შებრუნდა (ვალდენის ინვერსია)',10,g.H-10);};
    S.draw(dt);
    eg.clearRect(0,0,eg.W,eg.H);const P=plot(eg,{x:[0,1],y:[-30,110],xl:'რეაქციის კოორდინატა',yl:'E',m:[8,8,22,26]});const y=x=>x<0.5?lerp(0,95,(1-Math.cos(Math.PI*x/0.5))/2):lerp(95,-20,(1-Math.cos(Math.PI*(x-0.5)/0.5))/2);
    eg.beginPath();for(let i=0;i<=100;i++){const x=i/100;i?eg.lineTo(P.X(x),P.Y(y(x))):eg.moveTo(P.X(x),P.Y(y(x)));}eg.strokeStyle=COL.gold;eg.lineWidth=2;eg.stroke();
    eg.fillStyle='#7fd8ff';eg.beginPath();eg.arc(P.X(u),P.Y(y(u))-5,5,0,TAU);eg.fill();eg.fillStyle=COL.gl;eg.textAlign='center';eg.fillText('‡',P.X(0.5),P.Y(95)-8);eg.fillStyle=COL.mid;eg.font='10px sans-serif';eg.fillText('HO⁻ + CH₃Br',P.X(0.1),P.Y(0)-8);eg.fillText('CH₃OH + Br⁻',P.X(0.9),P.Y(-20)-8);
    $('snI').innerHTML=`<div class="eqn">HO⁻ + CH₃–Br → [HO···CH₃···Br]⁻‡ → HO–CH₃ + Br⁻</div><div class="hint">ერთი საფეხური, ერთი გარდამავალი მდგომარეობა. თუ ნახშირბადი ქირალურია, R იქცევა S-ად — როგორც ქარში გადაბრუნებული ქოლგა.</div>`;});
 }});

/* ═══════════════════ 15. SOLUTIONS — osmosis, colligative properties ═══════════════════ */
const SOLV=[['წყალი',0.512,1.86,100,0],['ბენზოლი',2.53,5.12,80.1,5.5],['ეთანოლი',1.22,1.99,78.4,-114.1],['ძმარმჟავა',3.07,3.90,118,16.6],['ქაფური',5.95,37.7,204,179]];
reg({id:'sol',ico:'💧',t:'ხსნარები და ოსმოსი',s:'ნახევრადშეღწევადი მემბრანა · კოლიგატიური თვისებები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="osC"></div><div class="actl">${sl('osN','ნივთიერება მარჯვნივ',0,60,1,25,'ნაწილაკი')}<div class="abt"><button id="osR">↺ თავიდან</button></div></div><div id="osI" class="ainfo"></div></div>
   <div class="acol">${card('🧮 კოლიგატიური თვისებები',`<div class="calc"><label>გამხსნელი<select id="cS">${SOLV.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join('')}</select></label><label>გამხსნელი, გ<input id="cMs" type="number" value="1000"></label><label>ნივთიერება, გ<input id="cm" type="number" value="58.44"></label><label>M, გ/მოლ<input id="cM" type="number" value="58.44"></label><label>i (ვანტ-ჰოფი)<input id="ci" type="number" value="2"></label></div><div id="cO" class="ainfo"></div>`)}
    ${card('🧮 განზავება C₁V₁ = C₂V₂',`<div class="calc"><label>C₁<input id="d1" type="number" value="12"></label><label>V₁<input id="d2" type="number" value=""></label><label>C₂<input id="d3" type="number" value="1"></label><label>V₂<input id="d4" type="number" value="500"></label></div><div id="dO" class="ainfo"></div>`)}</div></div>
   ${card('ფორმულები',FX([['C = n/V (მოლ/ლ) · b = n/m<sub>გამხს.</sub> (მოლ/კგ)','მოლარობა · მოლალობა'],['ω = m<sub>ნივთ.</sub>/m<sub>ხსნ.</sub> · 100%','მასური წილი'],['C₁V₁ = C₂V₂','განზავება'],['ΔT<sub>დუღ.</sub> = i·K<sub>b</sub>·b','დუღილის ტემპერატურის მომატება (ებულიოსკოპია)'],
     ['ΔT<sub>გაყ.</sub> = i·K<sub>f</sub>·b','გაყინვის ტემპერატურის დაწევა — ამიტომ აყრიან გზებს მარილს'],['π = i·C·R·T','ოსმოსური წნევა (ვანტ-ჰოფი); სისხლი ≈ 7.7 ატმ'],['p = x<sub>გამხს.</sub>·p°','რაულის კანონი — ორთქლის წნევის დაწევა'],['C = k<sub>H</sub>·p','ჰენრის კანონი — აირის ხსნადობა (გაზიანი სასმელი)'],
     ['i: NaCl ≈ 2, CaCl₂ ≈ 3, შაქარი = 1','იონების რაოდენობა ფორმულურ ერთეულზე']]))}`;
  const c=canvas($('osC'),460,300),g=c.g;let P=[],Ns=25,lv=[0,0];
  const reset=()=>{P=[];for(let i=0;i<140;i++)P.push({x:Math.random()*440+10,y:120+Math.random()*170,vx:(Math.random()-.5)*120,vy:(Math.random()-.5)*120,k:0});for(let i=0;i<Ns;i++)P.push({x:240+Math.random()*200,y:120+Math.random()*170,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60,k:1});};
  bindSl('osN',v=>{Ns=v;reset();});$('osR').onclick=reset;reset();
  anim(dt=>{const nL=P.filter(p=>p.k===0&&p.x<230).length,nR=P.filter(p=>p.k===0&&p.x>=230).length;
    /* liquid levels follow the water count on each side */const tl=[290-nL*1.6,290-nR*1.6-Ns*0.6];lv=lv.map((v,i)=>v?lerp(v,tl[i],dt*0.8):tl[i]);
    for(const p of P){p.x+=p.vx*dt;p.y+=p.vy*dt;const side=p.x<230?0:1,top=lv[side]+4,x0=side?236:12,x1=side?448:224;
      if(p.y<top){p.y=top;p.vy=Math.abs(p.vy);}if(p.y>288){p.y=288;p.vy=-Math.abs(p.vy);}if(p.x<12){p.x=12;p.vx=Math.abs(p.vx);}if(p.x>448){p.x=448;p.vx=-Math.abs(p.vx);}
      /* membrane at x = 230: water passes (pores), the big solute does not; water near solute is "bound" a little */
      if(Math.abs(p.x-230)<4){if(p.k===1){p.vx=-p.vx;p.x+=p.vx>0?4:-4;}else{const opposite=p.x<230?1:0;if(p.y<lv[opposite]+4){p.vx=-p.vx;p.x+=p.vx>0?4:-4;}}}}
    g.clearRect(0,0,g.W,g.H);g.strokeStyle='rgba(220,230,255,.5)';g.lineWidth=2;g.strokeRect(10,40,440,250);
    g.fillStyle='rgba(90,154,232,.18)';g.fillRect(11,lv[0],218,290-lv[0]);g.fillRect(232,lv[1],217,290-lv[1]);
    g.strokeStyle=COL.gold;g.setLineDash([4,3]);g.beginPath();g.moveTo(230,40);g.lineTo(230,290);g.stroke();g.setLineDash([]);
    for(const p of P){g.fillStyle=p.k?'#e8c040':'#7fc8ff';g.beginPath();g.arc(p.x,p.y,p.k?5:2.2,0,TAU);g.fill();}
    g.fillStyle=COL.mid;g.font='11px sans-serif';g.textAlign='center';g.fillText('სუფთა წყალი',120,30);g.fillText('ხსნარი',340,30);g.fillText('მემბრანა',230,300);
    if(Math.abs(lv[0]-lv[1])>4){g.strokeStyle=COL.red;g.beginPath();g.moveTo(455,lv[1]);g.lineTo(455,lv[0]);g.stroke();g.fillStyle=COL.red;g.textAlign='left';g.fillText('Δh',440,(lv[0]+lv[1])/2-4);}
    $('osI').innerHTML=`წყალი: მარცხნივ <b>${nL}</b> · მარჯვნივ <b>${nR}</b> · სიმაღლეთა სხვაობა <b>${(lv[0]-lv[1]).toFixed(0)}</b> პქ<div class="hint">წყალი მემბრანაში ორივე მიმართულებით გადის, დიდი ნაწილაკი — ვერა. წყალი მეტად გადადის იქ, სადაც ნივთიერებაა: ხსნარის დონე მატულობს, სანამ ჰიდროსტატიკური წნევა ოსმოსურს არ გაუტოლდება. ასე სვამს მცენარე წყალს; ზღვის წყალს კი წყურვილი არ მოაქვს — უჯრედებს წყალს ართმევს.</div>`;});
  const cc=()=>{const s=SOLV[+$('cS').value],ms=+$('cMs').value/1000,n=+$('cm').value/+$('cM').value,i=+$('ci').value,b=n/ms;const dTb=i*s[1]*b,dTf=i*s[2]*b;
    $('cO').innerHTML=`<div class="kv2"><b>მოლალობა b</b><span>${b.toFixed(3)} მოლ/კგ</span><b>დუღილი</b><span>+${dTb.toFixed(2)} °C → ${(s[3]+dTb).toFixed(2)} °C</span><b>გაყინვა</b><span>−${dTf.toFixed(2)} °C → ${(s[4]-dTf).toFixed(2)} °C</span>${s[0]==='წყალი'?`<b>π (25 °C, განზ. ხსნარი)</b><span>${(i*b*0.08206*298.15).toFixed(1)} ატმ</span>`:''}</div>`;};
  ['cMs','cm','cM','ci'].forEach(x=>$(x).oninput=cc);$('cS').onchange=cc;cc();
  const dc=()=>{const v=['d1','d2','d3','d4'].map(x=>$(x).value===''?null:+$(x).value),m=v.map((x,i)=>x==null?i:-1).filter(i=>i>=0);if(m.length!==1){$('dO').innerHTML='<span class="hint">ერთი ველი დატოვე ცარიელი.</span>';return;}
    const [a,b,c2,d]=v,k=m[0],r=k===0?c2*d/b:k===1?c2*d/a:k===2?a*b/d:a*b/c2;$('dO').innerHTML=`<b>${['C₁','V₁','C₂','V₂'][k]} = ${+r.toPrecision(5)}</b>${k===1?` — ე.ი. ${+r.toPrecision(4)} ერთეული საწყისი ხსნარი + ${+(d-r).toPrecision(4)} წყალი`:''}`;};
  ['d1','d2','d3','d4'].forEach(x=>$(x).oninput=dc);dc();
 }});

/* ═══════════════════ 16. CONSTANTS & ALL FORMULAS ═══════════════════ */
const CONST=[['N<sub>A</sub>','6.02214076·10²³ მოლ⁻¹','ავოგადროს რიცხვი'],['R','8.314462618 ჯ/(მოლ·K) = 0.08206 ლ·ატმ/(მოლ·K)','აირის უნივერსალური მუდმივა'],['k<sub>B</sub>','1.380649·10⁻²³ ჯ/K','ბოლცმანის მუდმივა'],['F','96485.332 კ/მოლ','ფარადეის მუდმივა'],
 ['h','6.62607015·10⁻³⁴ ჯ·წმ','პლანკის მუდმივა'],['c','299 792 458 მ/წმ','სინათლის სიჩქარე'],['e','1.602176634·10⁻¹⁹ კ','ელემენტარული მუხტი'],['m<sub>e</sub>','9.109·10⁻³¹ კგ','ელექტრონის მასა'],['m<sub>p</sub>','1.6726·10⁻²⁷ კგ = 1.00728 u','პროტონის მასა'],
 ['u','1.66054·10⁻²⁷ კგ = 931.494 მევ/c²','ატომური მასის ერთეული'],['a<sub>0</sub>','52.918 პმ','ბორის რადიუსი'],['R<sub>∞</sub>','1.0973731·10⁷ მ⁻¹','რიდბერგის მუდმივა'],['V<sub>m</sub>','22.414 ლ/მოლ (0 °C, 101.325 კპა)','მოლური მოცულობა'],['K<sub>w</sub>','1.0·10⁻¹⁴ (25 °C)','წყლის იონური ნამრავლი'],
 ['1 ატმ','101 325 პა = 760 მმ ვწყ.სვ.','წნევა'],['1 eV','1.602·10⁻¹⁹ ჯ = 96.485 კჯ/მოლ','ენერგია'],['1 კალ','4.184 ჯ','ენერგია'],['0 °C','273.15 K','ტემპერატურა']];
const BASIC=[['n = m/M = N/N<sub>A</sub> = V/V<sub>m</sub>','ნივთიერების რაოდენობა (მოლი)'],['M = Σ A<sub>r</sub>·n<sub>i</sub>','მოლური მასა'],['ω(E) = n·A<sub>r</sub>(E)/M · 100%','ელემენტის მასური წილი'],['η = m<sub>პრაქტ.</sub>/m<sub>თეორ.</sub> · 100%','გამოსავლიანობა'],
 ['D = M₁/M₂','აირის ფარდობითი სიმკვრივე (ჰაერი M = 29)'],['ρ = m/V','სიმკვრივე'],['ΔEN ≥ 1.7 იონური · 0.4–1.7 პოლარული · < 0.4 არაპოლარული','ბმის ტიპი პოლინგით'],['Z = p⁺ · A = p⁺ + n⁰','რიგითი ნომერი, მასური რიცხვი']];
reg({id:'ref',ico:'∑',t:'ყველა ფორმულა და მუდმივა',s:'საძიებო ცნობარი',
 build(root){
  const all=[];TOP.forEach(t=>{if(t.fx)t.fx.forEach(f=>all.push([t.t,...f]));});
  root.innerHTML=`<input id="rfQ" class="tin" placeholder="ძებნა: pH, აირი, ნერნსტი, ენტროპია…" style="width:100%;margin-bottom:10px">
   ${card('ფიზიკური მუდმივები',`<table class="stq">${CONST.map(c=>`<tr><td><b>${c[0]}</b></td><td>${c[1]}</td><td class="hint">${c[2]}</td></tr>`).join('')}</table>`)}
   <div id="rfL"></div>`;
  const draw=()=>{const q=$('rfQ').value.trim().toLowerCase();const groups={};
const items=[...BASIC.map(f=>['საბაზისო სტექიომეტრია',...f]),...all];
    items.filter(r=>!q||(r[0]+' '+r[1]+' '+(r[2]||'')).toLowerCase().replace(/<[^>]+>/g,'').includes(q)).forEach(r=>{(groups[r[0]]=groups[r[0]]||[]).push([r[1],r[2]]);});
    $('rfL').innerHTML=Object.entries(groups).map(([k,v])=>card(k,FX(v))).join('')||'<div class="hint">ვერაფერი მოიძებნა.</div>';};
  $('rfQ').oninput=draw;draw();
 }});

/* ═══════════════════ mount ═══════════════════ */
/* collect each topic's formulas for the reference (read from its own built HTML once) */
function harvest(){const tmp=document.createElement('div');tmp.style.display='none';document.body.appendChild(tmp);
  for(const t of TOP){if(t.id==='ref'||t.fx)continue;const save=STOPS;STOPS=[];try{t.build(tmp);}catch(e){}STOPS.forEach(f=>f());STOPS=save;
    const last=[...tmp.querySelectorAll('.acard')].pop();t.fx=last?[...last.querySelectorAll('.af')].map(a=>[a.querySelector('.ff').innerHTML,(a.querySelector('.fd')||{}).innerHTML||'']):[];tmp.innerHTML='';}
  tmp.remove();}
function mount(){
  const tools=$('tools');if(!tools)return;const host=document.createElement('div');host.className='panel';host.id='adv';tools.after(host);
  new IntersectionObserver(es=>{VIS=es[0].isIntersecting;}).observe(host);
  host.innerHTML=`<h3>📘 ქიმიის ენციკლოპედია — თეორია, ანიმაციები, ფორმულები</h3><div class="atop">${TOP.map((t,i)=>`<button data-i="${i}"><i>${t.ico}</i><b>${t.t}</b><small>${t.s}</small></button>`).join('')}</div><div id="advBody"></div>`;
  const body=$('advBody');
  const open=i=>{stopAll();body.innerHTML='';host.querySelectorAll('.atop button').forEach((b,j)=>b.classList.toggle('on',j===i));const t=TOP[i];
    if(t.id==='ref'&&!TOP.every(x=>x.id==='ref'||x.fx))harvest();
    body.innerHTML=`<div class="ahead"><span>${t.ico}</span> ${t.t}</div><div class="abody"></div>`;try{t.build(body.querySelector('.abody'));}catch(e){body.querySelector('.abody').innerHTML='<div class="terr">შეცდომა: '+esc(e.message)+'</div>';console.error(e);}
    try{localStorage.setItem('chem_adv_topic',t.id);}catch(e){}};
  host.querySelectorAll('.atop button').forEach(b=>b.onclick=()=>{open(+b.dataset.i);body.scrollIntoView({behavior:'smooth',block:'start'});});
  let first=0;try{const k=localStorage.getItem('chem_adv_topic');const i=TOP.findIndex(t=>t.id===k);if(i>=0)first=i;}catch(e){}
  open(first);
}
window.CHEMADV={TOP,open:id=>{const i=TOP.findIndex(t=>t.id===id);if(i>=0)document.querySelectorAll('#adv .atop button')[i].click();},balanceStops:()=>STOPS.length,phOf,sampleOrbital,cellAtoms};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
