/* MAGNUS — the natal wheel of the western (tropical) chart, shared so Vedic and
   True-Sidereal draw the very same wheel: zodiac band with 1°/5°/10° ticks and
   10 · 20 numbers, house band, house numbers, aspect lines filling the centre,
   planets spread in their own columns with degree + sign glyph, AC line, MC badge,
   hover → that planet's aspects.

   MGWheel.draw(svg, D)
   D = { asc, mc, houses:[12 longitudes] | null, timeUnknown,
         signs:[{start,end,sym,color,fill}]  (default: 12 equal signs, 0° = Aries),
         planets:{ key:{ deg, sym, color, retro, name, heavy } },
         aspects:[{p1,p2,color}],
         degLabel(key) → "22°18'" , signOf(deg) → {sym,color} }
   All longitudes are in the chart's own frame (sidereal for Vedic, tropical for IAU). */
(function(){
const NS='http://www.w3.org/2000/svg';
const CX=350,CY=350,R1=270,R2=202,R3=135,R4=135;
const ZSYM=['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎'];
const ZCOL=['#e8875a','#8fc46a','#c9d3e6','#5aa8e8','#e8875a','#8fc46a','#c9d3e6','#5aa8e8','#e8875a','#8fc46a','#c9d3e6','#5aa8e8'];
const EFILL=['#2b222a','#1e2b2c','#262d3d','#17273e','#2b222a','#1e2b2c','#262d3d','#17273e','#2b222a','#1e2b2c','#262d3d','#17273e'];
const N360=x=>((x%360)+360)%360;
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function txt(parent,s,x,y,attrs){const t=el('text',Object.assign({'text-anchor':'middle','dominant-baseline':'central',x,y},attrs||{}),parent);t.textContent=s;return t;}
const toRad=d=>d*Math.PI/180;
function fmtDeg(x){const s=N360(x)%30,d=Math.floor(s),m=Math.floor((s-d)*60);return d+'°'+String(m).padStart(2,'0')+"'";}
const EQUAL=ZSYM.map((s,i)=>({start:i*30,end:(i+1)*30,sym:s,color:ZCOL[i],fill:EFILL[i]}));

function draw(svg,D){
  svg.innerHTML='';
  const asc=D.timeUnknown?(D.signs?D.signs[0].start:0):D.asc;
  const e2s=d=>toRad(-(d-asc))+Math.PI;
  const pxy=(a,r)=>({x:CX+Math.cos(a)*r,y:CY+Math.sin(a)*r});
  const P=(d,r)=>{const a=e2s(d);return (CX+Math.cos(a)*r)+','+(CY+Math.sin(a)*r);};
  const signs=D.signs||EQUAL;
  const id='w'+Math.random().toString(36).slice(2,7);
  const defs=el('defs',{},svg);
  const sf=el('filter',{id:id+'s',x:'-60%',y:'-60%',width:'220%',height:'220%'},defs);
  el('feGaussianBlur',{stdDeviation:'3',result:'blur'},sf);
  let fm=el('feMerge',{},sf);el('feMergeNode',{in:'blur'},fm);el('feMergeNode',{in:'SourceGraphic'},fm);
  const mf=el('filter',{id:id+'m',x:'-60%',y:'-60%',width:'220%',height:'220%'},defs);
  el('feGaussianBlur',{stdDeviation:'3',result:'blur'},mf);
  el('feFlood',{'flood-color':'#4090ff','flood-opacity':'0.5',result:'color'},mf);
  el('feComposite',{in:'color',in2:'blur',operator:'in',result:'cb'},mf);
  fm=el('feMerge',{},mf);el('feMergeNode',{in:'cb'},fm);el('feMergeNode',{in:'SourceGraphic'},fm);
  const bg=el('radialGradient',{id:id+'g',cx:'50%',cy:'50%',r:'50%'},defs);
  el('stop',{offset:'0%','stop-color':'rgba(17,26,46,0.55)'},bg);el('stop',{offset:'70%','stop-color':'rgba(12,18,34,0.35)'},bg);el('stop',{offset:'100%','stop-color':'rgba(12,18,34,0)'},bg);
  el('circle',{cx:CX,cy:CY,r:R1+6,fill:'url(#'+id+'g)'},svg);

  /* zodiac band */
  for(const s of signs){const span=N360(s.end-s.start)||360,la=span>180?1:0;
    el('path',{d:`M${P(s.start,R1)} A${R1},${R1} 0 ${la},0 ${P(s.start+span,R1)} L${P(s.start+span,R2)} A${R2},${R2} 0 ${la},1 ${P(s.start,R2)} Z`,fill:s.fill||'#1e2b2c'},svg);
    el('line',Object.assign((()=>{const a=e2s(s.start);return{x1:CX+Math.cos(a)*R1,y1:CY+Math.sin(a)*R1,x2:CX+Math.cos(a)*R2,y2:CY+Math.sin(a)*R2};})(),{stroke:'rgba(227,190,132,.45)','stroke-width':1.2}),svg);}
  /* house band */
  const H=!D.timeUnknown&&Array.isArray(D.houses)&&D.houses.length>=12?D.houses:null;
  if(H)for(let i=0;i<12;i++){const h1=H[i],h2=H[(i+1)%12],span=N360(h2-h1),la=span>180?1:0;
    el('path',{d:`M${P(h1,R2)} A${R2},${R2} 0 ${la},0 ${P(h2,R2)} L${P(h2,R3)} A${R3},${R3} 0 ${la},1 ${P(h1,R3)} Z`,fill:i%2?'rgba(12,18,34,1)':'rgba(16,23,42,1)'},svg);}
  el('circle',{cx:CX,cy:CY,r:R4,fill:'rgba(8,12,24,1)'},svg);
  /* degree ticks: 1° · 5° · 10° · sign start, counted from each sign's own start */
  for(const s of signs){const span=Math.round(N360(s.end-s.start)||360);
    for(let k=0;k<span;k++){const a=e2s(s.start+k),c=Math.cos(a),si=Math.sin(a);
      const is30=k===0,is10=k%10===0,is5=k%5===0,len=is30?20:is10?13:is5?8:5;
      el('line',{x1:CX+c*R1,y1:CY+si*R1,x2:CX+c*(R1-len),y2:CY+si*(R1-len),stroke:is30?'rgba(243,221,164,.95)':is10?'rgba(227,190,132,.75)':is5?'rgba(227,190,132,.5)':'rgba(227,190,132,.28)','stroke-width':is30?2:is10?1.4:is5?.9:.5},svg);
      if(is10&&!is30&&span-k>3&&Math.abs(k-span/2)>4){const q=pxy(a,R1-33);txt(svg,String(k),q.x,q.y,{fill:'rgba(227,190,132,.75)','font-size':7.5,'font-family':'serif'});}}}
  el('circle',{cx:CX,cy:CY,r:R1,fill:'none',stroke:'rgba(227,190,132,.6)','stroke-width':1.6},svg);
  el('circle',{cx:CX,cy:CY,r:R2,fill:'none',stroke:'rgba(227,190,132,.45)','stroke-width':1.3},svg);
  el('circle',{cx:CX,cy:CY,r:R3,fill:'none',stroke:'rgba(227,190,132,.3)','stroke-width':1.1},svg);
  /* sign glyphs */
  for(const s of signs){const span=N360(s.end-s.start)||360,a=e2s(s.start+span/2),q=pxy(a,(R1+R2)/2);
    txt(svg,s.sym,q.x,q.y,{fill:s.color,'font-size':span<20?15:20,'font-family':'serif','font-weight':'bold'});}
  /* house lines + numbers */
  if(H)for(let i=0;i<12;i++){const a=e2s(H[i]),ang=[0,3,6,9].includes(i);
    el('line',{x1:CX+Math.cos(a)*R2,y1:CY+Math.sin(a)*R2,x2:CX+Math.cos(a)*R3,y2:CY+Math.sin(a)*R3,stroke:ang?'#e8c06e':'rgba(123,147,189,.6)','stroke-width':ang?2:.8},svg);
    const mid=H[i]+N360(H[(i+1)%12]-H[i])/2,q=pxy(e2s(mid),(R2+R3)/2);
    txt(svg,String(i+1),q.x,q.y,{fill:'rgba(227,190,132,0.85)','font-size':11,'font-family':'Cinzel,serif','font-weight':'bold'});}
  /* aspect lines */
  const pl=D.planets||{};
  const degOf=n=>pl[n]?pl[n].deg:n==='AC'&&!D.timeUnknown?D.asc:n==='MC'&&!D.timeUnknown&&D.mc!=null?D.mc:null;
  for(const asp of (D.aspects||[])){const d1=degOf(asp.p1),d2=degOf(asp.p2);if(d1==null||d2==null)continue;
    const p1=pxy(e2s(d1),R4),p2=pxy(e2s(d2),R4);
    const ln=el('line',{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,stroke:asp.color||'#888','stroke-width':1.5,opacity:.95,'stroke-linecap':'round','class':'asp-line'},svg);
    ln.dataset.p1=asp.p1;ln.dataset.p2=asp.p2;}

  /* planets: one radial column each — glyph, degree, sign (same layout as the western wheel) */
  const present=Object.keys(pl),Rg=R1+30,trueA={};
  for(const n of present)trueA[n]=e2s(pl[n].deg);
  const w0=window.innerWidth||1200,narrow=w0<560,b0=Math.min(narrow?2.1:1.6,Math.max(1,780/Math.max(320,w0-24)));
  const fs=7*b0,gR=9.5;
  const degTxt=n=>narrow?Math.floor(N360(pl[n].deg)%30)+'°':(D.degLabel?D.degLabel(n):fmtDeg(pl[n].deg));
  const boxes=n=>{const s=pl[n].sym||'?';const gw=(s==='sun'||s==='SEL'||s.length<2)?gR*2:gR*2*(0.62+0.55*(s.length-1));
    return [[gw+(pl[n].retro?8:2),gR*2],[degTxt(n).length*fs*0.56+2,fs*1.15],[fs*1.3,fs*1.3]];};
  const ext=(b,a)=>{const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return {rad:c*b[0]+s*b[1],tan:s*b[0]+c*b[1]};};
  const items=present.map(n=>{const ex=boxes(n).map(b=>ext(b,trueA[n]));return {n,t:trueA[n],w:(Math.max(...ex.map(e=>e.tan))+1)/Rg,wt:pl[n].heavy==null?40:pl[n].heavy};});
  if(!D.timeUnknown){items.push({n:'#AC',t:e2s(D.asc),w:34/Rg,wt:1e6});if(D.mc!=null)items.push({n:'#MC',t:e2s(D.mc),w:42/Rg,wt:1e6});}
  (function spread(L0){const n=L0.length;if(!n)return;L0.forEach(i=>{i.a=i.t;});if(n<2)return;
    const S=[...L0].sort((x,y)=>x.t-y.t);let gi=0,gm=-1;
    for(let i=0;i<n;i++){const nx=i===n-1?S[0].t+2*Math.PI:S[i+1].t,g=nx-S[i].t;if(g>gm){gm=g;gi=i;}}
    const L=[];for(let k=1;k<=n;k++)L.push(S[(gi+k)%n]);
    let prev=-Infinity;for(const it of L){let u=it.t;while(u<prev)u+=2*Math.PI;it.u=u;prev=u;}
    const place=c=>{let off=0,sw=0,sx=0;const offs=c.map((it,k)=>{if(k)off+=(c[k-1].w+it.w)/2;return off;});
      c.forEach((it,k)=>{sw+=it.wt;sx+=it.wt*(it.u-offs[k]);});const a0=sx/sw;c.forEach((it,k)=>{it.a=a0+offs[k];});};
    let C=L.map(it=>[it]);C.forEach(place);
    for(let g=0;g<400;g++){let m=false;
      for(let k=0;k+1<C.length;k++){const x=C[k][C[k].length-1],y=C[k+1][0];
        if(y.a-x.a<(x.w+y.w)/2-1e-9){C.splice(k,2,[...C[k],...C[k+1]]);place(C[k]);m=true;break;}}
      if(m)continue;
      if(C.length>1){const A=C[C.length-1],B=C[0],x=A[A.length-1],y=B[0];
        if(y.a+2*Math.PI-x.a<(x.w+y.w)/2-1e-9){B.forEach(it=>{it.u+=2*Math.PI;});C.shift();C[C.length-1]=[...C[C.length-1],...B];place(C[C.length-1]);continue;}}
      break;}})(items);
  const dispA={};for(const it of items)if(it.n[0]!=='#')dispA[it.n]=it.a;
  for(const n of present){
    const info=pl[n],tA=trueA[n],a=dispA[n],col=info.color||'#fff';
    let diff=a-tA;while(diff>Math.PI)diff-=2*Math.PI;while(diff<-Math.PI)diff+=2*Math.PI;
    const g=pxy(a,Rg);
    el('line',{x1:CX+Math.cos(tA)*(R1+1),y1:CY+Math.sin(tA)*(R1+1),x2:CX+Math.cos(tA)*(R1+9),y2:CY+Math.sin(tA)*(R1+9),stroke:col,'stroke-width':1.5},svg);
    el('circle',{cx:CX+Math.cos(tA)*(R1+1),cy:CY+Math.sin(tA)*(R1+1),r:1.8,fill:col},svg);
    if(Math.abs(diff)*Rg>3.5){const q1=pxy(tA,R1+10),q2=pxy(a,Rg-gR-1);el('line',{x1:q1.x,y1:q1.y,x2:q2.x,y2:q2.y,stroke:col,'stroke-width':.9,opacity:.7},svg);}
    if(info.sym==='sun'){const sg=el('g',{},svg);el('circle',{cx:g.x,cy:g.y,r:10,fill:'rgba(249,198,70,0.12)'},sg);
      el('circle',{cx:g.x,cy:g.y,r:8,fill:'none',stroke:'#f9c646','stroke-width':2,filter:'url(#'+id+'s)'},sg);el('circle',{cx:g.x,cy:g.y,r:2,fill:'#f9c646'},sg);}
    else if(info.sym==='☽'||info.sym==='☽'){const mg=el('g',{filter:'url(#'+id+'m)'},svg);txt(mg,'☽',g.x,g.y,{fill:'#b8d8ff','font-size':20,'font-family':'serif'});}
    else if(info.sym==='SEL'||/^⯝/.test(info.sym)){const sg=el('g',{},svg),rr=6;el('circle',{cx:g.x,cy:g.y,r:rr,fill:'none',stroke:col,'stroke-width':1.4},sg);
      el('path',{d:'M '+(g.x-rr)+' '+g.y+' a '+rr+' '+rr+' 0 0 1 '+(rr*2)+' 0',fill:col,opacity:.9},sg);}
    else txt(svg,info.sym,g.x,g.y,{fill:col,'font-size':18,'font-family':'serif'});
    /* degree and sign stacked outward */
    const B=boxes(n),ex=B.map(b=>ext(b,a));let r=Rg;const rs=[Rg];
    for(let k=1;k<B.length;k++){r+=ex[k-1].rad/2+(k===1?2:1)+ex[k].rad/2;rs.push(r);}
    txt(svg,degTxt(n),CX+Math.cos(a)*rs[1],CY+Math.sin(a)*rs[1],{fill:col,'font-size':fs,'font-family':'Cinzel,serif',opacity:.92});
    const sg=D.signOf?D.signOf(info.deg):{sym:ZSYM[Math.floor(N360(info.deg)/30)],color:ZCOL[Math.floor(N360(info.deg)/30)]};
    txt(svg,sg.sym,CX+Math.cos(a)*rs[2],CY+Math.sin(a)*rs[2],{fill:sg.color,'font-size':fs*1.15,'font-family':'serif',opacity:.95});
    if(info.retro)txt(svg,'℞',g.x+10,g.y-8,{fill:'#f87171','font-size':7,'font-family':'serif'});
    const hit=el('circle',{cx:g.x,cy:g.y,r:14,fill:'transparent','stroke-width':0},svg);
    hit.dataset.planet=n;hit.style.cursor='crosshair';hit.style.pointerEvents='all';
    hit.addEventListener('mouseenter',()=>hl(svg,n,D));hit.addEventListener('mouseleave',()=>clr(svg,D));
  }
  /* AC / MC */
  if(!D.timeUnknown){const col='#e8c06e',aa=e2s(D.asc);
    el('line',{x1:CX+Math.cos(aa)*R1,y1:CY+Math.sin(aa)*R1,x2:CX+Math.cos(aa)*(R1+28),y2:CY+Math.sin(aa)*(R1+28),stroke:col,'stroke-width':2.5},svg);
    txt(svg,D.ascLabel||'AC',CX+Math.cos(aa)*(R1+42),CY+Math.sin(aa)*(R1+42),{fill:col,'font-size':12,'font-weight':'bold','font-family':'Cinzel,serif'});
    if(D.mc!=null){const ma=e2s(D.mc),md=R1+50,mr=17,mx=CX+Math.cos(ma)*md,my=CY+Math.sin(ma)*md;
      el('line',{x1:CX+Math.cos(ma)*R1,y1:CY+Math.sin(ma)*R1,x2:CX+Math.cos(ma)*(md-mr-2),y2:CY+Math.sin(ma)*(md-mr-2),stroke:col,'stroke-width':2.5},svg);
      el('circle',{cx:mx,cy:my,r:mr,fill:'rgba(10,8,20,.95)',stroke:col,'stroke-width':2},svg);
      txt(svg,'MC',mx,my,{fill:col,'font-size':11,'font-weight':'bold','font-family':'Cinzel,serif'});}}
}
function hl(svg,n,D){svg.querySelectorAll('.asp-line').forEach(l=>{const on=l.dataset.p1===n||l.dataset.p2===n;l.style.opacity=on?'0.95':'0.04';l.style.strokeWidth=on?'2.2':'0.5';});
  if(D.onHover)D.onHover(n);}
function clr(svg,D){svg.querySelectorAll('.asp-line').forEach(l=>{l.style.opacity='';l.style.strokeWidth='';});if(D.onHover)D.onHover(null);}
window.MGWheel={draw,fmtDeg,ZSYM,ZCOL,EFILL};
})();
