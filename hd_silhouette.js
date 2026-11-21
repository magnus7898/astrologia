/* hd_silhouette.js — body silhouette of the bodygraph: see-through body with a
   dark-purple inner shadow along its edges and a dark violet outline
   that pulses vividly.
   Self-injecting; hd.html only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg.             */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
/* comet layers: [dash length (of 100), width px, colour, opacity] — tail → head */
const LAYERS=[];   /* moving comets removed */
const DUR=14;
const css=document.createElement('style');
let t=`
svg path.st0{fill:#000!important;stroke:none!important;opacity:0}
svg path.st0.hd-edge{fill:none!important;stroke:#6d28d9!important;stroke-width:2px!important;
  vector-effect:non-scaling-stroke;stroke-linejoin:round;animation:hdEdge 3.5s ease-in-out infinite}
svg path.st0.hd-c{fill:none!important;filter:none;stroke-linecap:round;pointer-events:none;vector-effect:non-scaling-stroke;
  animation:hdComet ${DUR}s linear infinite}
@keyframes hdEdge{0%,100%{stroke:#5b21b6;filter:drop-shadow(0 0 1px #5b21b6)}33%{stroke:#7e22ce;filter:drop-shadow(0 0 5px #9333ea)}66%{stroke:#6d28d9;filter:drop-shadow(0 0 3px #7c3aed)}}
@keyframes hdComet{to{stroke-dashoffset:var(--o1)}}
svg .hd-star{animation:hdTw 4s ease-in-out infinite;opacity:.5}\nsvg .hd-star.big{animation-name:hdTwB;transform-box:fill-box;transform-origin:center}\nsvg .hd-spark{animation:hdSp 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 2px currentColor)}\nsvg .hd-neb{animation:hdNeb 22s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center;mix-blend-mode:screen}\nsvg .hd-dust{animation:hdDust 12s linear infinite;opacity:0}\nsvg .hd-shoot{animation:hdShoot 10s ease-in infinite;opacity:0}\n@keyframes hdTw{0%,100%{opacity:.15}50%{opacity:.9}}\n@keyframes hdTwB{0%,100%{opacity:.2;transform:scale(.5)}45%{opacity:1;transform:scale(1.5)}60%{opacity:.7;transform:scale(1)}}\n@keyframes hdSp{0%,100%{opacity:0;transform:scale(.3) rotate(0deg)}40%{opacity:1;transform:scale(1.2) rotate(45deg)}60%{opacity:.8;transform:scale(.9) rotate(70deg)}}\n@keyframes hdNeb{0%{opacity:.6;transform:translate(0,0) scale(1) rotate(0deg)}50%{opacity:1;transform:translate(var(--dx),var(--dy)) scale(var(--sc)) rotate(var(--rot))}100%{opacity:.75;transform:translate(calc(var(--dx)*-.6),calc(var(--dy)*.8)) scale(.92) rotate(calc(var(--rot)*-1))}}\n@keyframes hdDust{0%{opacity:0;transform:translate(0,0)}15%{opacity:.85}50%{transform:translate(var(--sway),calc(var(--rise)*.5))}85%{opacity:.6}100%{opacity:0;transform:translate(calc(var(--sway)*-1),var(--rise))}}\n@keyframes hdShoot{0%,86%{opacity:0;transform:translate(0,0)}88%{opacity:1}97%{opacity:.8}100%{opacity:0;transform:translate(var(--tx),var(--ty))}}\n@media (prefers-reduced-motion:reduce){svg .hd-star,svg .hd-spark,svg .hd-neb,svg .hd-dust,svg .hd-shoot{animation:none}}\n@media (prefers-reduced-motion:reduce){svg path.st0.hd-edge,svg path.st0.hd-c{animation:none}}`;
LAYERS.forEach(([L,w,c,o],i)=>{t+=`svg path.st0.hd-c.l${i}{stroke:${c}!important;stroke-width:${w}px!important;opacity:${o};stroke-dasharray:${L} ${100-L};${i===LAYERS.length-1?'filter:drop-shadow(0 0 3px #e9d5ff)':''}}`;});
css.textContent=t;document.head.appendChild(css);

function mk(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function defsFor(svg){
  if(svg.querySelector('#hdSilInner'))return;
  const d=mk('defs',{},svg);
  /* inner shadow: light purple glowing inward from the edge, body itself stays clear */
  const f=mk('filter',{id:'hdSilInner',x:'-5%',y:'-5%',width:'110%',height:'110%','color-interpolation-filters':'sRGB'},d);
  /* glow shape only — colour comes from the flowing chakra gradient (chakraFlow) */
  mk('feFlood',{'flood-color':'#ffffff','flood-opacity':'1',result:'c'},f);   /* white glow → used as a mask */
  mk('feComposite',{in:'c',in2:'SourceAlpha',operator:'out',result:'outside'},f);
  mk('feGaussianBlur',{in:'outside',stdDeviation:'16',result:'b'},f);
  mk('feComposite',{in:'b',in2:'SourceAlpha',operator:'in',result:'inner'},f);
  mk('feFlood',{'flood-color':'#ffffff','flood-opacity':'.08',result:'t'},f);
  mk('feComposite',{in:'t',in2:'SourceAlpha',operator:'in',result:'tint'},f);
  const m=mk('feMerge',{},f);mk('feMergeNode',{in:'tint'},m);mk('feMergeNode',{in:'inner'},m);
  /* outline gradient: lilac at the head → violet → deep violet at the base */
  const g=mk('linearGradient',{id:'hdSilGrad',x1:'0',y1:'0',x2:'0.35',y2:'1'},d);
  mk('stop',{offset:'0%','stop-color':'#f5d0fe'},g);
  mk('stop',{offset:'45%','stop-color':'#a78bfa'},g);
  mk('stop',{offset:'100%','stop-color':'#7c3aed'},g);
}

/* a few small celestial lights inside the body: twinkling stars, tiny 4-point sparkles, a faint nebula */
function stars(p){
  const svg=p.ownerSVGElement;let bb;try{bb=p.getBBox();}catch(_){return;}
  if(!bb.width){requestAnimationFrame(()=>stars(p));return;}
  const d=svg.querySelector('defs')||mk('defs',{},svg);
  const cp=mk('clipPath',{id:'hdSilClip'},d);const cc=p.cloneNode(false);
  ['class','style','data-hdc'].forEach(a=>cc.removeAttribute(a));cp.appendChild(cc);
  /* nebula colours: violet, rose, teal-blue, gold */
  const NEB=[['nbV','#a855f7',.45],['nbR','#ec4899',.38],['nbB','#22d3ee',.32],['nbG','#f59e0b',.24]];
  NEB.forEach(([id,c,o])=>{const ng=mk('radialGradient',{id,cx:'50%',cy:'50%',r:'50%'},d);
    mk('stop',{offset:'0%','stop-color':c,'stop-opacity':o},ng);mk('stop',{offset:'55%','stop-color':c,'stop-opacity':o*.45},ng);mk('stop',{offset:'100%','stop-color':c,'stop-opacity':'0'},ng);});
  const g=mk('g',{'clip-path':'url(#hdSilClip)','class':'hd-cosmos','pointer-events':'none'});p.after(g);
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const X=()=>bb.x+rnd()*bb.width,Y=()=>bb.y+rnd()*bb.height,u=bb.width/400;
  const RND=(a,b)=>a+rnd()*(b-a),T=(e,o)=>{for(const k in o)e.style.setProperty(k,o[k]);};
  /* nebula clouds in several colours — each drifts, swells and turns on its own slow path */
  [[.48,.40,.22,'nbV'],[.62,.30,.13,'nbR'],[.36,.62,.16,'nbB'],[.60,.74,.17,'nbR'],[.44,.86,.15,'nbV'],[.52,.16,.10,'nbB'],[.30,.40,.10,'nbG'],[.70,.55,.10,'nbG']]
    .forEach(([fx,fy,fr,id],k)=>{const cx=bb.x+fx*bb.width,cy=bb.y+fy*bb.height;
      const w=mk('g',{'class':'hd-neb'},g);
      mk('ellipse',{cx,cy,rx:fr*bb.width,ry:fr*bb.width*RND(.55,.9),fill:'url(#'+id+')',transform:'rotate('+Math.round(rnd()*180)+' '+cx+' '+cy+')'},w);
      T(w,{'--dx':RND(-.09,.09)*bb.width+'px','--dy':RND(-.06,.06)*bb.width+'px','--rot':RND(-25,25)+'deg','--sc':RND(1.12,1.35),
        'animation-duration':RND(16,30).toFixed(1)+'s','animation-delay':(-RND(0,30)).toFixed(1)+'s'});});
  const STARC=['#ffffff','#ffffff','#ffffff','#e9d5ff','#c4b5fd','#a5f3fc','#67e8f9','#f9a8d4','#fde68a','#93c5fd'];
  /* twinkling stars — some only twinkle, some also pulse in size */
  for(let i=0;i<52;i++){const r=(.35+rnd()*rnd()*1.3)*u*1.6;
    const c=mk('circle',{cx:X(),cy:Y(),r,fill:STARC[Math.floor(rnd()*STARC.length)],'class':rnd()<.4?'hd-star big':'hd-star'},g);
    T(c,{'animation-delay':(-rnd()*5).toFixed(2)+'s','animation-duration':RND(2.2,6).toFixed(2)+'s'});}
  /* cosmic dust rising slowly through the body */
  for(let i=0;i<16;i++){const c=mk('circle',{cx:X(),cy:bb.y+RND(.35,1)*bb.height,r:RND(.4,.9)*u*1.4,fill:STARC[Math.floor(rnd()*STARC.length)],'class':'hd-dust'},g);
    T(c,{'--rise':-RND(.12,.3)*bb.height+'px','--sway':RND(-.03,.03)*bb.width+'px','animation-duration':RND(9,18).toFixed(1)+'s','animation-delay':(-RND(0,18)).toFixed(1)+'s'});}
  /* sparkles: grow, turn and fade */
  for(let i=0;i<6;i++){const x=X(),y=Y(),a=(1.6+rnd()*1.6)*u*2,b=a*.18;
    const sp=mk('path',{d:`M${x} ${y-a}Q${x+b} ${y-b} ${x+a} ${y}Q${x+b} ${y+b} ${x} ${y+a}Q${x-b} ${y+b} ${x-a} ${y}Q${x-b} ${y-b} ${x} ${y-a}Z`,fill:['#f5f3ff','#a5f3fc','#f9a8d4','#fde68a','#c4b5fd','#ffffff'][i],'class':'hd-spark'},g);
    T(sp,{'animation-delay':(-rnd()*7).toFixed(2)+'s','animation-duration':RND(5,8).toFixed(1)+'s'});}
  /* shooting stars crossing the body now and then */
  const sg=mk('linearGradient',{id:'hdShoot',x1:'0',y1:'0',x2:'1',y2:'0'},d);
  mk('stop',{offset:'0%','stop-color':'#fff','stop-opacity':'0'},sg);mk('stop',{offset:'80%','stop-color':'#e9d5ff','stop-opacity':'.7'},sg);mk('stop',{offset:'100%','stop-color':'#fff','stop-opacity':'1'},sg);
  [[.15,.25,9,0],[.25,.55,13,-5],[.1,.75,17,-11]].forEach(([fx,fy,dur,del])=>{
    const L=bb.width*.16,x=bb.x+fx*bb.width,y=bb.y+fy*bb.height;
    const w=mk('g',{'class':'hd-shoot'},g);
    mk('rect',{x:x-L,y:y-.6*u,width:L,height:1.2*u*1.4,rx:.6*u,fill:'url(#hdShoot)',transform:'rotate(18 '+x+' '+y+')'},w);
    T(w,{'--tx':bb.width*.75+'px','--ty':bb.width*.75*Math.tan(18*Math.PI/180)+'px','animation-duration':dur+'s','animation-delay':del+'s'});});
}

/* the silhouette is not in the middle of the SVG's viewBox — shift the viewBox so the body is centred in its box */
function centre(p){
  const svg=p.ownerSVGElement;
  const go=()=>{const sr=svg.getBoundingClientRect(),pr=p.getBoundingClientRect(),vb=svg.viewBox&&svg.viewBox.baseVal;
    if(!sr.width||!pr.width||!vb||!vb.width){requestAnimationFrame(go);return;}
    const k=Math.max(vb.width/sr.width,vb.height/sr.height);          /* user units per px (meet) */
    const dx=((pr.left+pr.width/2)-(sr.left+sr.width/2))*k;
    if(Math.abs(dx)>1)svg.setAttribute('viewBox',(vb.x+dx)+' '+vb.y+' '+vb.width+' '+vb.height);};
  requestAnimationFrame(go);
}

/* the chakra colours themselves: a root→crown rainbow (red at the base … violet at the crown) that keeps
   flowing upward through the body, seen only through the inner-shadow glow */
function chakraFlow(p){
  const svg=p.ownerSVGElement;let bb;try{bb=p.getBBox();}catch(_){return;}
  if(!bb.width){requestAnimationFrame(()=>chakraFlow(p));return;}
  const d=svg.querySelector('defs')||mk('defs',{},svg);
  const m=mk('mask',{id:'hdSilMask',maskUnits:'userSpaceOnUse',x:bb.x-20,y:bb.y-20,width:bb.width+40,height:bb.height+40},d);
  const mc=p.cloneNode(false);['class','style','data-hdc'].forEach(a=>mc.removeAttribute(a));
  mc.setAttribute('fill','#fff');mc.setAttribute('filter','url(#hdSilInner)');m.appendChild(mc);
  const H=bb.height,y0=bb.y+H;
  const g=mk('linearGradient',{id:'hdChakra',gradientUnits:'userSpaceOnUse',x1:0,y1:y0,x2:0,y2:bb.y,spreadMethod:'repeat'},d);
  ['#e11d48','#f97316','#facc15','#22c55e','#0ea5e9','#4f46e5','#9333ea','#e11d48'].forEach((c,i,a)=>mk('stop',{offset:(i/(a.length-1)*100).toFixed(2)+'%','stop-color':c},g));
  mk('animateTransform',{attributeName:'gradientTransform',type:'translate',from:'0 0',to:'0 '+(-H),dur:'12s',repeatCount:'indefinite'},g);
  const r=mk('rect',{x:bb.x-20,y:bb.y-20,width:bb.width+40,height:bb.height+40,fill:'url(#hdChakra)',mask:'url(#hdSilMask)','class':'hd-chakra','pointer-events':'none'});
  p.after(r);
}
function build(){
  document.querySelectorAll('svg path.st0:not(.hd-c):not(.hd-edge)').forEach(p=>{
    if(p.dataset.hdc)return;p.dataset.hdc='1';
    defsFor(p.ownerSVGElement);
    let last=p;   /* no outline — only the inner shadow */
    chakraFlow(p);
    stars(p);
    centre(p);
    [0,50].forEach(phase=>{LAYERS.forEach(([L],i)=>{
      const r=p.cloneNode(false);r.removeAttribute('data-hdc');r.classList.add('hd-c','l'+i);r.setAttribute('pathLength','100');
      const s=-phase-(LAYERS[0][0]-L);            /* front edges aligned: tail trails the head */
      r.style.strokeDashoffset=s;r.style.setProperty('--o1',String(s-100));last.after(r);last=r;});});
  });
}
build();
new MutationObserver(build).observe(document.documentElement,{childList:true,subtree:true});
})();
