/* hd_silhouette.js — golden, transparent body silhouette with rays of light
   for every bodygraph (natal, synastry, transit …). Self-injecting; hd.html
   only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg (fill #D9FFFC).
   Layers, back to front, in place of that path (no outline stroke):
     1. rays       — gold light rays from the chest, fading out, slowly turning
                     and breathing
     2. outer shine — three blurred gold glows around the body (pulse)
     3. body       — almost clear, faint gold in the chest
     4. inner shine — gold glow inside the edge, fading to transparent inward  */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const BOX={x:498.9,y:109.6,w:473.3,h:641.8};   /* path.st0 bbox — fallback when hidden */
let uid=0;
const css=document.createElement('style');
css.textContent=`
@keyframes hdGoldPulse{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes hdRayBreath{0%,100%{opacity:.55}50%{opacity:1}}
svg .hd-gold-outer{animation:hdGoldPulse 4s ease-in-out infinite}
svg .hd-rays-a{animation:hdRayBreath 5s ease-in-out infinite}
svg .hd-rays-b{animation:hdRayBreath 5s ease-in-out -2.5s infinite}
@media (prefers-reduced-motion:reduce){svg .hd-gold-outer,svg .hd-rays-a,svg .hd-rays-b{animation:none}}`;
document.head.appendChild(css);

function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
/* deterministic pseudo-random so every chart gets the same rays */
const rnd=(i,k)=>{const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x);};

function gild(svg){
  const body=svg.querySelector('path.st0');
  if(!body||body.dataset.gold)return;
  body.dataset.gold='1';
  const id='hdg'+(++uid),d=body.getAttribute('d'),tr=body.getAttribute('transform');
  let b=BOX;try{const r=body.getBBox();if(r.width>50)b={x:r.x,y:r.y,w:r.width,h:r.height};}catch(e){}
  const cx=b.x+b.w/2,cy=b.y+b.h*.38,R=b.h*.6;

  const defs=el('defs',{});svg.insertBefore(defs,svg.firstChild);
  const rg=el('radialGradient',{id:id+'f',cx:'50%',cy:'40%',r:'60%'},defs);
  el('stop',{offset:'0','stop-color':'#ffe08a','stop-opacity':'.10'},rg);
  el('stop',{offset:'.6','stop-color':'#f2c35a','stop-opacity':'.03'},rg);
  el('stop',{offset:'1','stop-color':'#e0b040','stop-opacity':'0'},rg);
  /* ray light: bright at the source, gone at the tip */
  const rl=el('radialGradient',{id:id+'r',gradientUnits:'userSpaceOnUse',cx,cy,r:R},defs);
  el('stop',{offset:'0','stop-color':'#fff4c4','stop-opacity':'.9'},rl);
  el('stop',{offset:'.2','stop-color':'#ffd760','stop-opacity':'.5'},rl);
  el('stop',{offset:'.5','stop-color':'#ffbe38','stop-opacity':'.16'},rl);
  el('stop',{offset:'.78','stop-color':'#ffa820','stop-opacity':'0'},rl);
  const bl=(n,s)=>{const f=el('filter',{id:id+n,x:'-40%',y:'-40%',width:'180%',height:'180%'},defs);el('feGaussianBlur',{stdDeviation:s},f);};
  bl('o1',26);bl('o2',11);bl('o3',4);bl('i',8);bl('r',1.4);
  const cp=el('clipPath',{id:id+'c'},defs);el('path',Object.assign({d},tr?{transform:tr}:{}),cp);
  const P=a=>{const p=el('path',Object.assign({d},tr?{transform:tr}:{},a));p.style.pointerEvents='none';return p;};

  /* 1. rays — two interleaved sets breathing out of phase, the whole fan turning slowly */
  const fan=el('g',{'pointer-events':'none',filter:`url(#${id}r)`});
  const spin=el('g',{},fan);
  el('animateTransform',{attributeName:'transform',type:'rotate',from:`0 ${cx} ${cy}`,to:`360 ${cx} ${cy}`,dur:'180s',repeatCount:'indefinite'},spin);
  const N=72;
  for(const [cls,off] of [['hd-rays-a',0],['hd-rays-b',.5]]){
    const g=el('g',{class:cls,fill:`url(#${id}r)`},spin);
    for(let i=0;i<N/2;i++){
      const k=i*2+off*2,a=(k/N)*Math.PI*2+(rnd(k,1)-.5)*.06;
      const len=R*(.55+rnd(k,2)*.45),wd=(.0025+rnd(k,3)*.009)*Math.PI;   /* half-angle of the beam */
      const x1=cx+Math.cos(a-wd)*len,y1=cy+Math.sin(a-wd)*len,x2=cx+Math.cos(a+wd)*len,y2=cy+Math.sin(a+wd)*len;
      el('path',{d:`M${cx.toFixed(1)} ${cy.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}Z`,'fill-opacity':(.3+rnd(k,4)*.55).toFixed(2)},g);
    }
  }
  svg.insertBefore(fan,defs.nextSibling);

  /* 2. outer shine */
  const outer=el('g',{class:'hd-gold-outer'});
  outer.appendChild(P({fill:'none',stroke:'#ffc94a','stroke-width':'30','stroke-opacity':'.55',filter:`url(#${id}o1)`}));
  outer.appendChild(P({fill:'none',stroke:'#ffd86b','stroke-width':'12','stroke-opacity':'.7',filter:`url(#${id}o2)`}));
  outer.appendChild(P({fill:'none',stroke:'#fff0b0','stroke-width':'4','stroke-opacity':'.6',filter:`url(#${id}o3)`}));
  body.parentNode.insertBefore(outer,body);
  /* 3. body — nearly clear */
  body.style.setProperty('fill',`url(#${id}f)`,'important');
  body.style.setProperty('stroke','none','important');
  /* 4. inner shine (no outline stroke) */
  const inner=el('g',{'clip-path':`url(#${id}c)`,'pointer-events':'none'});
  inner.appendChild(P({fill:'none',stroke:'#ffd46a','stroke-width':'26','stroke-opacity':'.5',filter:`url(#${id}i)`}));
  body.after(inner);
}

function scan(root){(root.querySelectorAll?root.querySelectorAll('svg'):[]).forEach(gild);if(root.tagName&&root.tagName.toLowerCase()==='svg')gild(root);}
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n);}))).observe(document.documentElement,{childList:true,subtree:true});
scan(document);
})();
