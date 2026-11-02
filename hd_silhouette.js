/* hd_silhouette.js — the body silhouette as a light-blue transparent bubble
   for every bodygraph (natal, synastry, transit …). Self-injecting; hd.html
   only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg (its own colour
   #D9FFFC is kept). No blur, no glow:
     • fill  — almost clear in the middle, denser toward the edge (bubble skin)
     • rim   — thin light-blue band just inside the outline
     • gloss — soft white highlight upper-left, like light on a bubble       */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const BLUE='#D9FFFC',TINT='#9FE6FF';
const BOX={x:498.9,y:109.6,w:473.3,h:641.8};   /* path.st0 bbox — fallback when hidden */
let uid=0;
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}

function bubble(svg){
  const body=svg.querySelector('path.st0');
  if(!body||body.dataset.bubble)return;
  body.dataset.bubble='1';
  const id='hdb'+(++uid),d=body.getAttribute('d'),tr=body.getAttribute('transform');
  let b=BOX;try{const r=body.getBBox();if(r.width>50)b={x:r.x,y:r.y,w:r.width,h:r.height};}catch(e){}
  const defs=el('defs',{});svg.insertBefore(defs,svg.firstChild);
  /* bubble skin: clear centre, more colour at the edge */
  const rg=el('radialGradient',{id:id+'f',cx:'50%',cy:'42%',r:'65%'},defs);
  el('stop',{offset:'0','stop-color':BLUE,'stop-opacity':'.05'},rg);
  el('stop',{offset:'.6','stop-color':TINT,'stop-opacity':'.10'},rg);
  el('stop',{offset:'1','stop-color':TINT,'stop-opacity':'.30'},rg);
  /* gloss highlight */
  const hg=el('radialGradient',{id:id+'h'},defs);
  el('stop',{offset:'0','stop-color':'#ffffff','stop-opacity':'.32'},hg);
  el('stop',{offset:'1','stop-color':'#ffffff','stop-opacity':'0'},hg);
  const cp=el('clipPath',{id:id+'c'},defs);el('path',Object.assign({d},tr?{transform:tr}:{}),cp);

  body.style.setProperty('fill',`url(#${id}f)`,'important');
  body.style.setProperty('stroke','none','important');
  const g=el('g',{'clip-path':`url(#${id}c)`,'pointer-events':'none'});
  /* rim: a stroke clipped to the inside = thin band along the outline */
  el('path',Object.assign({d},tr?{transform:tr}:{},{fill:'none',stroke:TINT,'stroke-width':'7','stroke-opacity':'.42'}),g);
  el('path',Object.assign({d},tr?{transform:tr}:{},{fill:'none',stroke:'#ffffff','stroke-width':'1.6','stroke-opacity':'.45'}),g);
  /* gloss on the head and the left shoulder */
  el('ellipse',{cx:b.x+b.w*.43,cy:b.y+b.h*.09,rx:b.w*.07,ry:b.h*.05,fill:`url(#${id}h)`},g);
  el('ellipse',{cx:b.x+b.w*.22,cy:b.y+b.h*.42,rx:b.w*.12,ry:b.h*.09,fill:`url(#${id}h)`,opacity:'.7'},g);
  body.after(g);
}

function scan(root){(root.querySelectorAll?root.querySelectorAll('svg'):[]).forEach(bubble);if(root.tagName&&root.tagName.toLowerCase()==='svg')bubble(root);}
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);}))).observe(document.documentElement,{childList:true,subtree:true});
scan(document);
})();
