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
svg path.st0{fill:#000!important;stroke:none!important;filter:url(#hdSilInner)}
svg path.st0.hd-edge{fill:none!important;stroke:#6d28d9!important;stroke-width:2px!important;
  vector-effect:non-scaling-stroke;stroke-linejoin:round;animation:hdEdge 3.5s ease-in-out infinite}
svg path.st0.hd-c{fill:none!important;filter:none;stroke-linecap:round;pointer-events:none;vector-effect:non-scaling-stroke;
  animation:hdComet ${DUR}s linear infinite}
@keyframes hdEdge{0%,100%{stroke:#5b21b6;filter:drop-shadow(0 0 1px #5b21b6)}33%{stroke:#7e22ce;filter:drop-shadow(0 0 5px #9333ea)}66%{stroke:#6d28d9;filter:drop-shadow(0 0 3px #7c3aed)}}
@keyframes hdComet{to{stroke-dashoffset:var(--o1)}}
svg .hd-star{animation:hdTw 4s ease-in-out infinite;opacity:.5}\nsvg .hd-spark{animation:hdSp 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 2px #d8b4fe)}\n@keyframes hdTw{0%,100%{opacity:.15}50%{opacity:.9}}\n@keyframes hdSp{0%,100%{opacity:.2;transform:scale(.6)}50%{opacity:1;transform:scale(1.1)}}\n@media (prefers-reduced-motion:reduce){svg .hd-star,svg .hd-spark{animation:none}}\n@media (prefers-reduced-motion:reduce){svg path.st0.hd-edge,svg path.st0.hd-c{animation:none}}`;
LAYERS.forEach(([L,w,c,o],i)=>{t+=`svg path.st0.hd-c.l${i}{stroke:${c}!important;stroke-width:${w}px!important;opacity:${o};stroke-dasharray:${L} ${100-L};${i===LAYERS.length-1?'filter:drop-shadow(0 0 3px #e9d5ff)':''}}`;});
css.textContent=t;document.head.appendChild(css);

function mk(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function defsFor(svg){
  if(svg.querySelector('#hdSilInner'))return;
  const d=mk('defs',{},svg);
  /* inner shadow: light purple glowing inward from the edge, body itself stays clear */
  const f=mk('filter',{id:'hdSilInner',x:'-5%',y:'-5%',width:'110%',height:'110%','color-interpolation-filters':'sRGB'},d);
  mk('feFlood',{'flood-color':'#6d28d9','flood-opacity':'1',result:'c'},f);
  mk('feComposite',{in:'c',in2:'SourceAlpha',operator:'out',result:'outside'},f);
  mk('feGaussianBlur',{in:'outside',stdDeviation:'16',result:'b'},f);
  mk('feComposite',{in:'b',in2:'SourceAlpha',operator:'in',result:'inner'},f);
  mk('feFlood',{'flood-color':'#4c1d95','flood-opacity':'.06',result:'t'},f);
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
  const ng=mk('radialGradient',{id:'hdNeb',cx:'50%',cy:'50%',r:'50%'},d);
  mk('stop',{offset:'0%','stop-color':'#a855f7','stop-opacity':'.16'},ng);mk('stop',{offset:'100%','stop-color':'#a855f7','stop-opacity':'0'},ng);
  const g=mk('g',{'clip-path':'url(#hdSilClip)','class':'hd-cosmos','pointer-events':'none'});p.after(g);
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const X=()=>bb.x+rnd()*bb.width,Y=()=>bb.y+rnd()*bb.height,u=bb.width/400;
  /* two faint nebula clouds */
  [[.5,.42,.22],[.35,.78,.18]].forEach(([fx,fy,fr])=>mk('ellipse',{cx:bb.x+fx*bb.width,cy:bb.y+fy*bb.height,rx:fr*bb.width,ry:fr*bb.width*.7,fill:'url(#hdNeb)'},g));
  for(let i=0;i<46;i++){const r=(.35+rnd()*rnd()*1.3)*u*1.6;
    const c=mk('circle',{cx:X(),cy:Y(),r,fill:rnd()<.25?'#e9d5ff':'#ffffff','class':'hd-star'},g);
    c.style.animationDelay=(-rnd()*5).toFixed(2)+'s';c.style.animationDuration=(2.5+rnd()*3.5).toFixed(2)+'s';}
  for(let i=0;i<6;i++){const x=X(),y=Y(),a=(1.6+rnd()*1.6)*u*2,b=a*.18;
    const s=mk('path',{d:`M${x} ${y-a}Q${x+b} ${y-b} ${x+a} ${y}Q${x+b} ${y+b} ${x} ${y+a}Q${x-b} ${y+b} ${x-a} ${y}Q${x-b} ${y-b} ${x} ${y-a}Z`,fill:'#f5f3ff','class':'hd-spark'},g);
    s.style.transformOrigin=x+'px '+y+'px';s.style.animationDelay=(-rnd()*6).toFixed(2)+'s';}
}
function build(){
  document.querySelectorAll('svg path.st0:not(.hd-c):not(.hd-edge)').forEach(p=>{
    if(p.dataset.hdc)return;p.dataset.hdc='1';
    defsFor(p.ownerSVGElement);
    let last=p;   /* no outline — only the inner shadow */
    stars(p);
    [0,50].forEach(phase=>{LAYERS.forEach(([L],i)=>{
      const r=p.cloneNode(false);r.removeAttribute('data-hdc');r.classList.add('hd-c','l'+i);r.setAttribute('pathLength','100');
      const s=-phase-(LAYERS[0][0]-L);            /* front edges aligned: tail trails the head */
      r.style.strokeDashoffset=s;r.style.setProperty('--o1',String(s-100));last.after(r);last=r;});});
  });
}
build();
new MutationObserver(build).observe(document.documentElement,{childList:true,subtree:true});
})();
