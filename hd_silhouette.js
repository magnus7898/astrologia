/* hd_silhouette.js — glass body image behind the bodygraph.
   Replaces the flat path.st0 silhouette of human_prepared.svg with
   hd_glass_body.webp, stretched over the silhouette's own box.
   OPACITY = how strong the glass body shows (0…1).
   Self-injecting; hd.html only needs   <script src="hd_silhouette.js"></script> */
(function(){
'use strict';
const OPACITY=.9;
const SRC='hd_glass_body.webp';
const BOX={x:498.75,y:109.5,w:473.5,h:642};   // bbox of path.st0 in SVG units
const NS='http://www.w3.org/2000/svg';

const css=document.createElement('style');
css.textContent='svg path.st0{fill:none!important;stroke:none!important}';
document.head.appendChild(css);

function apply(root){
  (root.querySelectorAll?root:document).querySelectorAll('svg path.st0').forEach(p=>{
    const prev=p.previousElementSibling;
    if(prev&&prev.classList&&prev.classList.contains('hd-glass-body'))return;
    const im=document.createElementNS(NS,'image');
    im.setAttribute('class','hd-glass-body');
    im.setAttribute('href',SRC);
    im.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',SRC);
    im.setAttribute('x',BOX.x);im.setAttribute('y',BOX.y);
    im.setAttribute('width',BOX.w);im.setAttribute('height',BOX.h);
    im.setAttribute('preserveAspectRatio','none');
    im.setAttribute('opacity',OPACITY);
    im.style.pointerEvents='none';
    p.parentNode.insertBefore(im,p);
  });
}
new MutationObserver(ms=>{
  for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)apply(n);
}).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(document));
else apply(document);
})();
