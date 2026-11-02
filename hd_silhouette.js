/* hd_silhouette.js — golden, transparent body silhouette for every bodygraph
   (natal, synastry, transit …). Self-injecting; hd.html only needs
       <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg (fill #D9FFFC).
   Layers, back to front, all in place of that path:
     1. outer shine — two blurred gold strokes, wide and soft (pulses slowly)
     2. body       — gold radial fill fading to transparent
     3. inner shine — blurred gold stroke clipped to the body, gold → transparent inward
     4. edge       — thin crisp gold stroke                                       */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
let uid=0;
const css=document.createElement('style');
css.textContent=`
@keyframes hdGoldPulse{0%,100%{opacity:.55}50%{opacity:.95}}
svg .hd-gold-outer{animation:hdGoldPulse 4.5s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){svg .hd-gold-outer{animation:none;opacity:.8}}`;
document.head.appendChild(css);

function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}

function gild(svg){
  const body=svg.querySelector('path.st0');
  if(!body||body.dataset.gold)return;
  body.dataset.gold='1';
  const id='hdg'+(++uid),d=body.getAttribute('d'),tr=body.getAttribute('transform');
  const defs=el('defs',{});svg.insertBefore(defs,svg.firstChild);
  /* body fill: warm gold in the chest, fading to clear at the outline */
  const rg=el('radialGradient',{id:id+'f',cx:'50%',cy:'45%',r:'62%'},defs);
  el('stop',{offset:'0','stop-color':'#f6dc8c','stop-opacity':'.20'},rg);
  el('stop',{offset:'.55','stop-color':'#d9b25a','stop-opacity':'.08'},rg);
  el('stop',{offset:'1','stop-color':'#c9a84c','stop-opacity':'0'},rg);
  const bl=(n,s)=>{const f=el('filter',{id:id+n,x:'-30%',y:'-30%',width:'160%',height:'160%'},defs);el('feGaussianBlur',{stdDeviation:s},f);};
  bl('o1',14);bl('o2',5);bl('i',7);
  const cp=el('clipPath',{id:id+'c'},defs);el('path',Object.assign({d},tr?{transform:tr}:{}),cp);

  const P=a=>{const p=el('path',Object.assign({d},tr?{transform:tr}:{},a));p.style.pointerEvents='none';return p;};
  /* 1. outer shine */
  const outer=el('g',{class:'hd-gold-outer'});
  outer.appendChild(P({fill:'none',stroke:'#f0c860','stroke-width':'16','stroke-opacity':'.55',filter:`url(#${id}o1)`}));
  outer.appendChild(P({fill:'none',stroke:'#ffe39a','stroke-width':'5','stroke-opacity':'.75',filter:`url(#${id}o2)`}));
  body.parentNode.insertBefore(outer,body);
  /* 2. body */
  body.style.setProperty('fill',`url(#${id}f)`,'important');
  /* 3. inner shine + 4. edge, right above the body */
  const inner=el('g',{'clip-path':`url(#${id}c)`});
  inner.appendChild(P({fill:'none',stroke:'#f3d27a','stroke-width':'22','stroke-opacity':'.45',filter:`url(#${id}i)`}));
  const edge=P({fill:'none',stroke:'#e2bd62','stroke-width':'1.6','stroke-opacity':'.95'});
  body.after(inner);inner.after(edge);
}

function scan(root){(root.querySelectorAll?root.querySelectorAll('svg'):[]).forEach(gild);if(root.tagName&&root.tagName.toLowerCase()==='svg')gild(root);}
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);}))).observe(document.documentElement,{childList:true,subtree:true});
scan(document);
})();
