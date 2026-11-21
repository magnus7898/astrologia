/* hd_silhouette.js — body silhouette of the bodygraph: no fill, only a purple
   outline that breathes, with a light running along it.
   Self-injecting; hd.html only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg.             */
(function(){
'use strict';
const css=document.createElement('style');
css.textContent=`
svg path.st0{fill:none!important;stroke:#8b5cf6!important;stroke-width:1.6px!important;vector-effect:non-scaling-stroke;
  stroke-linejoin:round;animation:hdSilBreath 4.5s ease-in-out infinite}
svg path.st0.hd-sil-run{stroke:#e9d5ff!important;stroke-width:2.2px!important;stroke-linecap:round;
  stroke-dasharray:6 94;animation:hdSilRun 9s linear infinite;pointer-events:none}
@keyframes hdSilBreath{
  0%,100%{stroke:#7c3aed;filter:drop-shadow(0 0 2px rgba(139,92,246,.55));opacity:.75}
  50%{stroke:#c4b5fd;filter:drop-shadow(0 0 7px rgba(167,139,250,.95));opacity:1}}
@keyframes hdSilRun{to{stroke-dashoffset:-100}}
@media (prefers-reduced-motion:reduce){svg path.st0,svg path.st0.hd-sil-run{animation:none}}`;
document.head.appendChild(css);
/* a second copy of the outline carries the running light */
function addRunner(){
  document.querySelectorAll('svg path.st0:not(.hd-sil-run)').forEach(p=>{
    if(p.dataset.silRun)return;p.dataset.silRun='1';
    const r=p.cloneNode(false);r.classList.add('hd-sil-run');r.removeAttribute('data-sil-run');
    r.setAttribute('pathLength','100');p.after(r);});
}
addRunner();
new MutationObserver(addRunner).observe(document.documentElement,{childList:true,subtree:true});
})();
