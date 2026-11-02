/* hd_silhouette.js — body silhouette as clear blue glass (no stroke, no blur).
   Self-injecting; hd.html only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg. One diagonal
   gradient: bright top-left edge, clear body, a thin light streak across
   (reflection), slightly deeper blue bottom-right — like a pane of glass.   */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
let uid=0;
const STOPS=[[0,'#e8fbff',.34],[.14,'#bff0ff',.2],[.30,'#9fe6ff',.12],[.36,'#ffffff',.2],[.39,'#ffffff',.08],
  [.43,'#9fe6ff',.12],[.75,'#8adcf5',.17],[1,'#6cc8ea',.3]];
function glass(svg){
  const body=svg.querySelector('path.st0');
  if(!body||body.dataset.glass)return;
  body.dataset.glass='1';
  const id='hdglass'+(++uid);
  const defs=document.createElementNS(NS,'defs');svg.insertBefore(defs,svg.firstChild);
  const g=document.createElementNS(NS,'linearGradient');
  for(const [k,v] of Object.entries({id,x1:'.15',y1:'0',x2:'.85',y2:'1'}))g.setAttribute(k,v);
  STOPS.forEach(([o,c,a])=>{const s=document.createElementNS(NS,'stop');s.setAttribute('offset',o);s.setAttribute('stop-color',c);s.setAttribute('stop-opacity',a);g.appendChild(s);});
  defs.appendChild(g);
  body.style.setProperty('fill',`url(#${id})`,'important');
  body.style.setProperty('stroke','none','important');
}
function scan(root){(root.querySelectorAll?root.querySelectorAll('svg'):[]).forEach(glass);if(root.tagName&&root.tagName.toLowerCase()==='svg')glass(root);}
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);}))).observe(document.documentElement,{childList:true,subtree:true});
scan(document);
})();
