/* wheel_classic.js — the "classic" natal wheel (zodiac outside, planets inside it),
   drawn into the same #wheel SVG as astro.html's modern wheel and using its helpers
   (CX, CY, el, txt, e2s, pxy, ZSYM, ZCOL, PI, isAspectVisible, highlightAspects, clearHighlight).
   Layout, from the outside in:
     zodiac ring (sign glyphs, degree ticks on its inner edge)
     planet ring — each body is a radial column: glyph · degree · sign · minutes (+ ℞),
                   spread just enough not to overlap; a leader line joins a moved glyph
                   to the tick that marks its true degree
     house ring (numbers), cusp lines, AC/DC/MC/IC axes with degrees outside the wheel
     aspect circle
   Single charts only; synastry/transit keeps the modern wheel. */
(function(){
const RZo=298,RZi=264,RG=237,RHo=156,RHi=134,RA=134;
const GOLD='rgba(227,190,132,',AX='#e8c06e';
const MAIN=['მზე','მთვარე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი','პლუტონი'];
const wt=n=>n==='მზე'||n==='მთვარე'?60:MAIN.includes(n)?40:(n==='ჩრდ. კვანძი'||n==='სამხ. კვანძი'||n==='ქირონი')?6:1;

/* weighted cluster spreading on the circle: heavy bodies keep their true longitude,
   light ones (virtual points, asteroids) give way; columns touch but never overlap */
function spread(items){
  const n=items.length;items.forEach(i=>{i.a=i.t;});if(n<2)return;
  const S=[...items].sort((x,y)=>x.t-y.t);
  let gi=0,gm=-1;for(let i=0;i<n;i++){const nx=i===n-1?S[0].t+2*Math.PI:S[i+1].t,g=nx-S[i].t;if(g>gm){gm=g;gi=i;}}
  const L=[];for(let k=1;k<=n;k++)L.push(S[(gi+k)%n]);
  let prev=-Infinity;for(const it of L){let u=it.t;while(u<prev)u+=2*Math.PI;it.u=u;prev=u;}
  const place=c=>{let off=0,sw=0,sx=0;const offs=c.map((it,k)=>{if(k)off+=(c[k-1].w+it.w)/2;return off;});
    c.forEach((it,k)=>{sw+=it.wt;sx+=it.wt*(it.u-offs[k]);});const a0=sx/sw;c.forEach((it,k)=>{it.a=a0+offs[k];});};
  let C=L.map(it=>[it]);C.forEach(place);
  for(let guard=0;guard<500;guard++){
    let merged=false;
    for(let k=0;k+1<C.length;k++){const x=C[k][C[k].length-1],y=C[k+1][0];
      if(y.a-x.a<(x.w+y.w)/2-1e-9){C.splice(k,2,[...C[k],...C[k+1]]);place(C[k]);merged=true;break;}}
    if(merged)continue;
    if(C.length>1){const A=C[C.length-1],B=C[0],x=A[A.length-1],y=B[0];
      if(y.a+2*Math.PI-x.a<(x.w+y.w)/2-1e-9){B.forEach(it=>{it.u+=2*Math.PI;});C.shift();C[C.length-1]=[...C[C.length-1],...B];place(C[C.length-1]);continue;}}
    break;
  }
}
/* keep every body inside its own house: each house is packed on its own and its
   cusps act as walls (wider margin at the AC / MC axes). If a house is too crowded,
   the free spread is kept for the whole chart. */
function houseWalls(items,data,asc){
  if(data._timeUnknown||!Array.isArray(data.houses)||data.houses.length<12)return;
  const T=2*Math.PI,N=x=>((x%T)+T)%T,X=data.houses.slice(0,12).map(h=>N((h-asc)*Math.PI/180));X[0]=0;
  for(let i=1;i<12;i++)if(X[i]<X[i-1])return;X.push(T);
  const mcx=data.mc!=null?N((data.mc-asc)*Math.PI/180):null;
  const mg=i=>{const ax=i%12===0||i%12===6||(mcx!=null&&(Math.abs(X[i]-mcx)<1e-4||Math.abs(X[i]-N(mcx+Math.PI))<1e-4));return (ax?7:2)/RG;};
  const G=Array.from({length:12},()=>[]);
  for(const it of items){const x=N(Math.PI-it.t);let h=11;for(let i=0;i<12;i++)if(x>=X[i]&&x<X[i+1]){h=i;break;}G[h].push({it,x,w:it.w,wt:it.wt});}
  const out=[];
  for(let h=0;h<12;h++){const L=G[h].sort((p,q)=>p.x-q.x);if(!L.length)continue;
    const A=X[h]+mg(h),B=X[h+1]-mg(h+1);if(L.reduce((s,e)=>s+e.w,0)>B-A+1e-9)return;
    const place=c=>{let off=0,sw=0,sx=0;const offs=c.map((e,k)=>{if(k)off+=(c[k-1].w+e.w)/2;return off;});
      c.forEach((e,k)=>{sw+=e.wt;sx+=e.wt*(e.x-offs[k]);});let a0=sx/sw;
      const l=a0-c[0].w/2,r=a0+offs[offs.length-1]+c[c.length-1].w/2;
      if(l<A)a0+=A-l;else if(r>B)a0-=r-B;c.forEach((e,k)=>{e.p=a0+offs[k];});};
    let C=L.map(e=>[e]);C.forEach(place);
    for(let g=0;g<200;g++){let m=false;
      for(let k=0;k+1<C.length;k++){const x=C[k][C[k].length-1],y=C[k+1][0];
        if(y.p-x.p<(x.w+y.w)/2-1e-9){C.splice(k,2,[...C[k],...C[k+1]]);place(C[k]);m=true;break;}}
      if(!m)break;}
    L.forEach(e=>out.push(e));}
  out.forEach(e=>{e.it.a=Math.PI-e.p;});
}
const dm=deg=>{const s=((deg%30)+30)%30;let d=Math.floor(s),m=Math.round((s-d)*60);if(m===60){m=0;d+=1;}return [d,m];};
const xy=(a,r)=>({x:CX+Math.cos(a)*r,y:CY+Math.sin(a)*r});
const line=(svg,a1,r1,a2,r2,attrs)=>{const p=xy(a1,r1),q=xy(a2,r2);return el('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,...attrs},svg);};

window.drawWheelClassic=function(data1,dualAsp){
  const svg=document.getElementById('wheel');svg.innerHTML='';
  const unk=!!data1._timeUnknown,asc=unk?0:data1.asc;
  const defs=el('defs',{},svg);
  const sf=el('filter',{id:'sunF',x:'-60%',y:'-60%',width:'220%',height:'220%'},defs);
  el('feGaussianBlur',{stdDeviation:'2.5',result:'blur'},sf);const fm=el('feMerge',{},sf);el('feMergeNode',{in:'blur'},fm);el('feMergeNode',{in:'SourceGraphic'},fm);
  el('circle',{cx:CX,cy:CY,r:RZo,fill:'rgba(10,15,30,.92)'},svg);

  /* zodiac ring */
  const EF=['#2b222a','#1e2b2c','#262d3d','#17273e'];
  for(let i=0;i<12;i++){
    const a1=e2s(i*30,asc),a2=e2s((i+1)*30,asc),p=(a,r)=>{const q=xy(a,r);return q.x+','+q.y;};
    el('path',{d:`M${p(a1,RZo)} A${RZo},${RZo} 0 0,0 ${p(a2,RZo)} L${p(a2,RZi)} A${RZi},${RZi} 0 0,1 ${p(a1,RZi)} Z`,fill:EF[i%4]},svg);
    line(svg,a1,RZo,a1,RZi,{stroke:GOLD+'.55)','stroke-width':1.2});
    const m=xy(e2s(i*30+15,asc),(RZo+RZi)/2);
    txt(svg,ZSYM[i],m.x,m.y,{fill:ZCOL[i],'font-size':20,'font-family':'serif','font-weight':'bold'});
  }
  /* classic: every degree line the same */
  for(let d=0;d<360;d++){const a=e2s(d,asc);line(svg,a,RZi,a,RZi+5,{stroke:GOLD+'.5)','stroke-width':.7});}
  el('circle',{cx:CX,cy:CY,r:RZo,fill:'none',stroke:GOLD+'.6)','stroke-width':1.5},svg);
  el('circle',{cx:CX,cy:CY,r:RZi,fill:'none',stroke:GOLD+'.55)','stroke-width':1.2},svg);

  /* house ring + cusps */
  el('circle',{cx:CX,cy:CY,r:RHo,fill:'rgba(14,20,38,1)',stroke:GOLD+'.45)','stroke-width':1.1},svg);
  el('circle',{cx:CX,cy:CY,r:RHi,fill:'rgba(8,12,24,1)',stroke:GOLD+'.45)','stroke-width':1.1},svg);
  if(!unk&&data1.houses){
    for(let i=0;i<12;i++){
      const h=data1.houses[i],a=e2s(h,asc),ang=[0,3,6,9].includes(i);
      /* classic: only the 1 · 4 · 7 · 10 cusps (the axes) are drawn as lines */
      const nx=data1.houses[(i+1)%12];let mid=h+((nx-h+360)%360)/2;
      const q=xy(e2s(mid%360,asc),(RHo+RHi)/2);
      txt(svg,String(i+1),q.x,q.y,{fill:GOLD+'.85)','font-size':11,'font-family':'Cinzel,serif','font-weight':'bold'});
    }
  }

  /* aspects */
  const P=data1.planets||{};
  const asps=dualAsp!=null?dualAsp:(data1._allAspects?data1._allAspects.filter(isAspectVisible):(data1.aspects||[]));
  const degOf=n=>P[n]?.degree??(n==='AC'?data1.asc:n==='MC'?data1.mc:(data1._aspPlanets?.[n]?.degree));
  for(const asp of asps){
    const d1=degOf(asp.p1),d2=degOf(asp.p2);if(d1==null||d2==null)continue;
    const ln=line(svg,e2s(d1,asc),RA,e2s(d2,asc),RA,{stroke:asp.color,'stroke-width':1.4,opacity:.95,'stroke-linecap':'round','class':'asp-line'});
    ln.dataset.p1=asp.p1;ln.dataset.p2=asp.p2;
  }

  /* axes: AC–DC and MC–IC across the chart, degrees outside the wheel */
  if(!unk){
    const ax=[[data1.asc,'ASC',true],[(data1.asc+180)%360,'DSC',false],[data1.mc,'MC',true],[(data1.mc+180)%360,'IC',false]];
    for(const [deg,lab,main] of ax){
      const a=e2s(deg,asc);
      line(svg,a,RHi,a,RZo+(main?14:8),{stroke:AX,'stroke-width':main?3:2});
      const [d,m]=dm(deg),si=Math.floor(((deg%360)+360)%360/30);
      const o=xy(a,RZo+(main?30:24));
      const t=el('text',{'text-anchor':'middle','dominant-baseline':'central',x:o.x,y:o.y,fill:AX,'font-family':'Cinzel,serif','font-weight':'bold','font-size':main?14:11},svg);
      t.textContent=`${d}°`;const ts=el('tspan',{'font-size':main?9:8,dy:-4},t);ts.textContent=`${String(m).padStart(2,'0')}'`;
      const li=xy(a,RHi-14);
      const lt=txt(svg,lab,li.x,li.y,{fill:AX,'font-size':9.5,'font-family':'Cinzel,serif','font-weight':'bold'});
      const hit=el('circle',{cx:o.x,cy:o.y,r:16,fill:'rgba(0,0,0,.01)'},svg);hit.style.cursor='crosshair';
      const key=lab==='ASC'?'AC':lab==='MC'?'MC':null;
      if(key){hit.addEventListener('mouseenter',()=>highlightAspects(key,false));hit.addEventListener('mouseleave',()=>clearHighlight());}
      if(lab==='ASC'||lab==='MC')void lt;
    }
  }

  /* planets: radial columns inside the zodiac */
  const names=Object.keys(P).filter(n=>n!=='AC'&&n!=='MC'&&P[n]&&P[n].degree!=null);
  const _w0=window.innerWidth||1200,sc=Math.min(1.5,Math.max(1,700/Math.max(320,_w0-24)));
  const gR=10.5*Math.min(sc,1.2),fs=8.5*Math.min(sc,1.35);
  const gw=n=>{const s=(PI[n]||{}).sym||'?';return (s.length>1&&s!=='sun'&&s!=='SEL')?gR*2*(0.62+0.5*(s.length-1)):gR*2;};
  const R_DEG=RG-gR-fs*0.85,R_SIG=R_DEG-fs*1.25,R_MIN=R_SIG-fs*1.25;
  /* angular width: the glyph at its radius, the text column at the innermost radius (columns converge inward) */
  const items=names.map(n=>({n,t:e2s(P[n].degree,asc),w:Math.max((gw(n)+1.5)/RG,(fs*2+1.5)/R_MIN),wt:wt(n)}));
  spread(items);houseWalls(items,data1,asc);
  for(const it of items){
    const n=it.n,info=PI[n]||{sym:'?',color:'#fff'},col=info.color,pd=P[n];
    const tA=it.t,dA=it.a;
    /* true-degree tick on the zodiac's inner edge, and a dot on the aspect circle */
    line(svg,tA,RZi,tA,RZi-7,{stroke:col,'stroke-width':1.6});
    const dot=xy(tA,RA);el('circle',{cx:dot.x,cy:dot.y,r:2,fill:col},svg);
    /* leader line when the glyph had to move off its true degree */
    let diff=dA-tA;while(diff>Math.PI)diff-=2*Math.PI;while(diff<-Math.PI)diff+=2*Math.PI;
    if(Math.abs(diff)*RG>3.5)line(svg,tA,RZi-7,dA,RG+gR+1,{stroke:col,'stroke-width':.9,opacity:.75});
    const g=xy(dA,RG);
    if(n==='მზე'){
      el('circle',{cx:g.x,cy:g.y,r:gR*.78,fill:'none',stroke:'#f9c646','stroke-width':2,filter:'url(#sunF)'},svg);
      el('circle',{cx:g.x,cy:g.y,r:1.8,fill:'#f9c646'},svg);
    }else if(info.sym==='SEL'){
      const rr=gR*.6;el('circle',{cx:g.x,cy:g.y,r:rr,fill:'none',stroke:col,'stroke-width':1.4},svg);
      el('path',{d:`M ${g.x-rr} ${g.y} a ${rr} ${rr} 0 0 1 ${rr*2} 0`,fill:col,opacity:.9},svg);
    }else txt(svg,info.sym,g.x,g.y,{fill:col,'font-size':gR*1.75,'font-family':'serif'});
    const [d,m]=dm(pd.degree),si=Math.floor(((pd.degree%360)+360)%360/30)%12;
    const p1=xy(dA,R_DEG),p2=xy(dA,R_SIG),p3=xy(dA,R_MIN);
    txt(svg,`${d}°`,p1.x,p1.y,{fill:'#EDE6D8','font-size':fs,'font-family':'Cinzel,serif','font-weight':'bold'});
    txt(svg,ZSYM[si],p2.x,p2.y,{fill:ZCOL[si],'font-size':fs*1.15,'font-family':'serif'});
    txt(svg,`${String(m).padStart(2,'0')}'`+(pd.stationary?'St':pd.retrograde?'℞':''),p3.x,p3.y,{fill:pd.stationary?'#FFD36A':pd.retrograde?'#f87171':'#cfd5e2','font-size':fs*.92,'font-family':'Cinzel,serif'});
    const hit=el('circle',{cx:g.x,cy:g.y,r:gR+3,fill:'transparent'},svg);
    hit.dataset.planet=n;hit.dataset.inner='0';hit.style.cursor='crosshair';hit.style.pointerEvents='all';
    hit.addEventListener('mouseenter',()=>highlightAspects(n,false));hit.addEventListener('mouseleave',()=>clearHighlight());
  }
  window._classicLayout=items.map(i=>({n:i.n,t:i.t,a:i.a,w:i.w}));
};

/* style switch: modern (planets outside) / classic (planets inside the zodiac) */
const KEY='magnus_wheel_style';
let st='modern';try{st=localStorage.getItem(KEY)||'modern';}catch(e){}
window.WHEEL_STYLE=st;
function ui(){
  const wrap=document.getElementById('wheel-wrap');if(!wrap||document.getElementById('wheel-style'))return;
  const d=document.createElement('div');d.id='wheel-style';
  d.style.cssText='display:flex;justify-content:center;gap:6px;margin:0 0 8px';
  d.innerHTML=['modern','classic'].map(k=>`<button type="button" data-ws="${k}" style="background:${k===window.WHEEL_STYLE?'#C9A24C':'#0e1424'};color:${k===window.WHEEL_STYLE?'#0b1020':'#E3BE84'};border:1px solid rgba(201,162,76,.6);border-radius:999px;padding:5px 14px;font:13px 'Noto Serif Georgian',serif;cursor:pointer">${k==='modern'?'თანამედროვე რკალი':'კლასიკური რკალი'}</button>`).join('');
  wrap.insertBefore(d,wrap.firstChild);
  d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;window.WHEEL_STYLE=b.dataset.ws;try{localStorage.setItem(KEY,b.dataset.ws);}catch(e){}
    d.querySelectorAll('button').forEach(x=>{const on=x===b;x.style.background=on?'#C9A24C':'#0e1424';x.style.color=on?'#0b1020':'#E3BE84';});
    if(typeof redrawCurrent==='function')redrawCurrent();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ui);else ui();
})();
