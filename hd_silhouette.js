/* hd_silhouette.js — body silhouette of the bodygraph: no fill, no hard line —
   only a soft blurred violet aura along the outline that slowly breathes, and two
   comets of light (glowing head + fading tail) gliding around the body.
   Self-injecting; hd.html only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg.             */
(function(){
'use strict';
/* comet layers: [dash length (of 100), width px, colour, opacity, blur px] — tail → head */
const LAYERS=[[22,7,'#7c3aed',.22,6],[12,5,'#a78bfa',.45,4],[5,4,'#ddd6fe',.75,2.5],[1.5,4,'#ffffff',.95,1.2]];
const DUR=14; /* seconds per loop */
const css=document.createElement('style');
let t=`
svg path.st0{fill:none!important;stroke:#8b5cf6!important;stroke-width:7px!important;vector-effect:non-scaling-stroke;
  stroke-linejoin:round;filter:blur(5px);animation:hdAura 6s ease-in-out infinite}
svg path.st0.hd-c{animation-name:hdComet;animation-timing-function:linear;animation-iteration-count:infinite;
  stroke-linecap:round;pointer-events:none;vector-effect:non-scaling-stroke}
@keyframes hdAura{0%,100%{opacity:.28;stroke:#6d28d9}50%{opacity:.6;stroke:#a78bfa}}
@keyframes hdComet{to{stroke-dashoffset:var(--o1)}}
@media (prefers-reduced-motion:reduce){svg path.st0,svg path.st0.hd-c{animation:none}}`;
LAYERS.forEach(([L,w,c,o,b],i)=>{
  /* every layer's front edge sits on the same point, so the tail trails behind the head */
  t+=`svg path.st0.hd-c.l${i}{stroke:${c}!important;stroke-width:${w}px!important;opacity:${o};filter:blur(${b}px) drop-shadow(0 0 ${b+2}px ${c});
    stroke-dasharray:${L} ${100-L};animation-duration:${DUR}s}`;
});
css.textContent=t;document.head.appendChild(css);

function addComets(){
  document.querySelectorAll('svg path.st0:not(.hd-c)').forEach(p=>{
    if(p.dataset.hdc)return;p.dataset.hdc='1';
    let last=p;
    [0,50].forEach(phase=>{               /* two comets, half a loop apart */
      LAYERS.forEach(([L],i)=>{
        const r=p.cloneNode(false);r.removeAttribute('data-hdc');r.classList.add('hd-c','l'+i);
        r.setAttribute('pathLength','100');
        const start=-(phase)+(LAYERS[0][0]-L)*-1;   /* align front edges */
        r.style.strokeDashoffset=start;r.style.setProperty('--o1',(start-100)+'');
        last.after(r);last=r;});
    });
  });
}
addComets();
new MutationObserver(addComets).observe(document.documentElement,{childList:true,subtree:true});
})();
