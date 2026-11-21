/* hd_seal.js — every bodygraph on the site: channels are drawn as separate pieces, which leaves hairline gaps
   between pieces of the same colour. Each piece gets a thin stroke in its own current fill colour
   (white when off, red / black when activated). The integration channels (gates 10 · 20 · 34 · 57) are left as drawn. */
(function(){
'use strict';
const OK=new Set(['rgb(255, 255, 255)','rgb(231, 90, 124)','rgb(44, 54, 63)','rgb(195, 153, 108)','rgb(196, 154, 108)']);
const SKIP=new Set(['10','20','34','57']);
/* a copy of each piece, with a thin stroke in its own colour, laid under all the original pieces */
function under(e,f){
  let u=e._under;
  if(!u){u=e.cloneNode(false);u.dataset.under='1';u.removeAttribute('id');u.style.pointerEvents='none';u.style.strokeLinejoin='round';u.style.strokeWidth='1.4';
    e.parentNode.insertBefore(u,e.parentNode.firstChild);e._under=u;}
  if(u.style.stroke!==f){u.style.stroke=f;u.style.fill=f;}
}
function run(svg){
  svg.querySelectorAll('path,rect,polygon').forEach(e=>{
    if(e.dataset.under||e.classList.contains('st0')||e.classList.contains('chakra')||e.closest('.hd-arrows,.hd-cosmos,mask,clipPath,defs,.detail-part'))return;
    if(SKIP.has(e.getAttribute('data-gate')||''))return;
    const cs=getComputedStyle(e),f=cs.fill;
    if(e.classList.contains('gate-line')||(OK.has(f)&&(cs.stroke==='none'||e.dataset.sealed))){
      under(e,f);return;   /* filler always UNDER the pieces, so it never steps over a neighbour */
      if(f&&f!=='none'&&e.style.stroke!==f){e.style.stroke=f;e.style.strokeWidth='0.9';e.style.strokeLinejoin='round';e.dataset.sealed='1';}}});
}
function hook(svg){
  if(svg._seal)return;svg._seal=1;
  run(svg);
  new MutationObserver(()=>requestAnimationFrame(()=>run(svg))).observe(svg,{attributes:true,attributeFilter:['class'],subtree:true});
}
function scan(){document.querySelectorAll('svg').forEach(s=>{if(s.querySelector('.gate-line'))hook(s);});}
let t=null;
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(scan,60);}).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
})();
