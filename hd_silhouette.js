/* hd_silhouette.js — body silhouette of the bodygraph: see-through body with a
   light-purple inner shadow along its edges, a crisp gradient outline, and two
   comets of light gliding around it.
   Self-injecting; hd.html only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg.             */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
/* comet layers: [dash length (of 100), width px, colour, opacity] — tail → head */
const LAYERS=[[18,3,'#8b5cf6',.3],[9,3,'#c4b5fd',.6],[3,3,'#ede9fe',.9],[1,3.5,'#ffffff',1]];
const DUR=14;
const css=document.createElement('style');
let t=`
svg path.st0{fill:#000!important;stroke:none!important;filter:url(#hdSilInner)}
svg path.st0.hd-edge{fill:none!important;stroke:url(#hdSilGrad)!important;stroke-width:1.8px!important;filter:none;
  vector-effect:non-scaling-stroke;stroke-linejoin:round;animation:hdEdge 6s ease-in-out infinite}
svg path.st0.hd-c{fill:none!important;filter:none;stroke-linecap:round;pointer-events:none;vector-effect:non-scaling-stroke;
  animation:hdComet ${DUR}s linear infinite}
@keyframes hdEdge{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes hdComet{to{stroke-dashoffset:var(--o1)}}
@media (prefers-reduced-motion:reduce){svg path.st0.hd-edge,svg path.st0.hd-c{animation:none}}`;
LAYERS.forEach(([L,w,c,o],i)=>{t+=`svg path.st0.hd-c.l${i}{stroke:${c}!important;stroke-width:${w}px!important;opacity:${o};stroke-dasharray:${L} ${100-L};${i===LAYERS.length-1?'filter:drop-shadow(0 0 3px #e9d5ff)':''}}`;});
css.textContent=t;document.head.appendChild(css);

function mk(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function defsFor(svg){
  if(svg.querySelector('#hdSilInner'))return;
  const d=mk('defs',{},svg);
  /* inner shadow: light purple glowing inward from the edge, body itself stays clear */
  const f=mk('filter',{id:'hdSilInner',x:'-5%',y:'-5%',width:'110%',height:'110%','color-interpolation-filters':'sRGB'},d);
  mk('feFlood',{'flood-color':'#d8b4fe','flood-opacity':'1',result:'c'},f);
  mk('feComposite',{in:'c',in2:'SourceAlpha',operator:'out',result:'outside'},f);
  mk('feGaussianBlur',{in:'outside',stdDeviation:'16',result:'b'},f);
  mk('feComposite',{in:'b',in2:'SourceAlpha',operator:'in',result:'inner'},f);
  mk('feFlood',{'flood-color':'#a78bfa','flood-opacity':'.05',result:'t'},f);
  mk('feComposite',{in:'t',in2:'SourceAlpha',operator:'in',result:'tint'},f);
  const m=mk('feMerge',{},f);mk('feMergeNode',{in:'tint'},m);mk('feMergeNode',{in:'inner'},m);
  /* outline gradient: lilac at the head → violet → deep violet at the base */
  const g=mk('linearGradient',{id:'hdSilGrad',x1:'0',y1:'0',x2:'0.35',y2:'1'},d);
  mk('stop',{offset:'0%','stop-color':'#f5d0fe'},g);
  mk('stop',{offset:'45%','stop-color':'#a78bfa'},g);
  mk('stop',{offset:'100%','stop-color':'#7c3aed'},g);
}
function build(){
  document.querySelectorAll('svg path.st0:not(.hd-c):not(.hd-edge)').forEach(p=>{
    if(p.dataset.hdc)return;p.dataset.hdc='1';
    defsFor(p.ownerSVGElement);
    const e=p.cloneNode(false);e.removeAttribute('data-hdc');e.classList.add('hd-edge');p.after(e);
    let last=e;
    [0,50].forEach(phase=>{LAYERS.forEach(([L],i)=>{
      const r=p.cloneNode(false);r.removeAttribute('data-hdc');r.classList.add('hd-c','l'+i);r.setAttribute('pathLength','100');
      const s=-phase-(LAYERS[0][0]-L);            /* front edges aligned: tail trails the head */
      r.style.strokeDashoffset=s;r.style.setProperty('--o1',String(s-100));last.after(r);last=r;});});
  });
}
build();
new MutationObserver(build).observe(document.documentElement,{childList:true,subtree:true});
})();
