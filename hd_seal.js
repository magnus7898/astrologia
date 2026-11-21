/* hd_seal.js — every bodygraph on the site: channels are drawn as separate pieces, which leaves hairline gaps
   between them. Under each piece sits a copy of it with a thicker stroke in the piece's own current colour
   (white when off, red / black when activated). The copies all lie UNDER the original pieces, so they only
   fill the gaps and never spill over a neighbouring piece. Integration channels (10 · 20 · 34 · 57) are left as drawn. */
(function(){
'use strict';
const W='2.4';
const OK=new Set(['rgb(255, 255, 255)','rgb(231, 90, 124)','rgb(44, 54, 63)','rgb(195, 153, 108)','rgb(196, 154, 108)']);
const SKIP=new Set(['10','20','34','57']);
function eligible(e){
  if(e.dataset.under||e.classList.contains('st0')||e.classList.contains('chakra')||e.closest('.hd-arrows,.hd-cosmos,mask,clipPath,defs,.detail-part'))return false;
  if(SKIP.has(e.getAttribute('data-gate')||''))return false;
  if(e.classList.contains('gate-line'))return true;
  const cs=getComputedStyle(e);return OK.has(cs.fill)&&cs.stroke==='none';
}
function build(svg){
  svg.querySelectorAll('path').forEach(e=>{
    if(e._under||!eligible(e))return;
    const u=e.cloneNode(false);u.dataset.under='1';u.removeAttribute('id');u.setAttribute('aria-hidden','true');
    u.style.pointerEvents='none';u.style.strokeLinejoin='round';u.style.strokeWidth=W;
    const par=e.parentNode;par.insertBefore(u,par.firstChild);          /* below every original piece of this group */
    e._under=u;});
}
function sync(svg){
  svg.querySelectorAll('path').forEach(e=>{const u=e._under;if(!u)return;
    const f=getComputedStyle(e).fill,d=getComputedStyle(e).display;
    if(u.style.stroke!==f){u.style.stroke=f;u.style.fill=f;}
    if(u.style.display!==d)u.style.display=d==='none'?'none':'';});
}
function hook(svg){
  if(svg._seal)return;svg._seal=1;
  build(svg);sync(svg);
  new MutationObserver(()=>requestAnimationFrame(()=>sync(svg))).observe(svg,{attributes:true,attributeFilter:['class','style'],subtree:true});
}
function scan(){document.querySelectorAll('svg').forEach(s=>{if(s.querySelector('.gate-line'))hook(s);});}
let t=null;
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(scan,60);}).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
})();
