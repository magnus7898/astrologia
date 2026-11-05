/* tarot_cmp.js — comparison viewer for the hidden connections (TL from tarot_links.js): 2–6 cards side by side, each zoomed to the shared detail. Needs tarot_course.js. MAGNUS. */
(function(){
'use strict';
const TC=window.TC;
function parse(id){if(/^M\d+$/.test(id))return {maj:true,n:+id.slice(1)};const m=/^([a-z]+)(\d+)$/.exec(id);return {maj:false,s:m[1],r:+m[2]};}
function img(id){const p=parse(id);return p.maj?TC.majImg(p.n):TC.minImg(p.s,p.r);}
function name(id){const p=parse(id);return p.maj?TC.ROM[p.n]+' · '+TC.MAJ[p.n][0]:TC.SUITS[p.s].gen+' '+TC.RANK[p.r];}
function short(id){const p=parse(id);return p.maj?TC.MAJ[p.n][0]:TC.SUITS[p.s].gen+' '+TC.RANK[p.r];}
function hash(id){const p=parse(id);return p.maj?String(p.n):id;}
const SU=['wands','cups','swords','pentacles'];
/* the same zoom maths as the symbol tour: point (x,y) of the card, magnification z */
function zoom(vp,z3){const im=vp.querySelector('img'),r=vp.querySelector('.ring'),W=vp.clientWidth,H=vp.clientHeight,[x,y,z]=z3;
  let tx=W/2-x*W*z,ty=H/2-y*H*z;tx=Math.min(0,Math.max(W-W*z,tx));ty=Math.min(0,Math.max(H-H*z,ty));
  im.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;
  if(r){if(z>1.01){r.style.left=(x*W*z+tx)+'px';r.style.top=(y*H*z+ty)+'px';r.classList.remove('on');clearTimeout(vp._t);vp._t=setTimeout(()=>r.classList.add('on'),1300);}else{clearTimeout(vp._t);r.classList.remove('on');}}}
/* every connection a card takes part in; a minor 1–10 also belongs to the numerological family of its number */
function links(id){const L=window.TL||[],o=[],p=parse(id);
  L.forEach((l,i)=>{const k=l.c.findIndex(x=>x[0]===id);
    if(k>=0)o.push({i,l,others:l.c.filter((x,j)=>j!==k)});
    else if(l.mn&&!p.maj&&l.mn.includes(p.r))o.push({i,l,others:l.c,num:true});});
  return o;}
const CSS=`.cmp{border:1px solid rgba(184,137,74,.45);border-radius:16px;padding:16px 18px;scroll-margin-top:12px;animation:cfi .5s ease}
@keyframes cfi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.cmp .cg{font-size:11.5px;letter-spacing:.08em}.cmp h3{font-family:'Marcellus SC','Noto Serif Georgian',serif;font-weight:400;font-size:21px;color:#E3BE84;margin-top:3px}
.cmp-v{display:grid;gap:10px;align-items:start;margin:12px auto 0}
.cmp-v.n2{grid-template-columns:1fr auto 1fr;max-width:620px}
.cmp-v.n3{grid-template-columns:repeat(3,minmax(0,1fr));max-width:680px}
.cmp-v.n4{grid-template-columns:repeat(4,minmax(0,1fr));max-width:820px}
.cmp-v.n5{grid-template-columns:repeat(5,minmax(0,1fr));max-width:960px}
.cmp-v.n6{grid-template-columns:repeat(6,minmax(0,1fr))}
@media(max-width:900px){.cmp-v.n5,.cmp-v.n6{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:640px){.cmp-v.n4{grid-template-columns:repeat(2,minmax(0,1fr));max-width:420px}}
.cmp-v figure{margin:0;min-width:0}.cmp-v figcaption{text-align:center;font-size:12.5px;margin-top:6px;line-height:1.35}.cmp-v figcaption a{color:#F3DDA4;text-decoration:none}
.cmp-v figcaption .nt{display:block;font-size:11.5px;color:#aab2c4;margin-top:2px}
.cmp-v .mid{font-size:22px;color:#C9A24C;align-self:center;margin-bottom:28px}
.cmp .vp{position:relative;width:100%;aspect-ratio:1200/1976;overflow:hidden;border-radius:12px;border:1px solid rgba(184,137,74,.45);background:#0e1424;cursor:zoom-out}
.cmp .vp.full{cursor:zoom-in}
.cmp .vp img{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:0 0;transition:transform 1.5s cubic-bezier(.65,.05,.25,1);will-change:transform}
.cmp .ring{position:absolute;width:30%;aspect-ratio:1;border:2px solid #FFD36A;border-radius:50%;transform:translate(-50%,-50%) scale(.6);opacity:0;pointer-events:none;box-shadow:0 0 16px rgba(255,211,106,.55);transition:opacity .4s}
.cmp .ring.on{opacity:1;animation:crp 1.8s ease-in-out infinite}
@keyframes crp{0%,100%{transform:translate(-50%,-50%) scale(.85)}50%{transform:translate(-50%,-50%) scale(1.05)}}
.cmp p.cd{font-size:14.5px;line-height:1.9;color:#eef0f4;margin-top:14px}
.cmp .hint{font-size:11.5px;color:#7f889b;text-align:center;margin-top:6px}
.cmp .pips{margin-top:12px;border-top:1px solid rgba(184,137,74,.2);padding-top:10px}
.cmp .pips b{display:block;font-weight:400;font-size:12.5px;color:#B8894A;margin-bottom:6px}
.cmp .pips div{display:flex;flex-wrap:wrap;gap:5px}.cmp .pips a{width:44px;text-align:center;text-decoration:none;color:#aab2c4;font-size:10px}
.cmp .pips img{width:100%;aspect-ratio:7/11.5;object-fit:cover;border-radius:4px;display:block;border:1px solid rgba(184,137,74,.3)}
.cmp .pips a.me img{border-color:#FFD36A;box-shadow:0 0 0 2px rgba(255,211,106,.35)}
.lkl{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:8px;margin-top:10px}
.lk{display:flex;gap:8px;align-items:center;border:1px solid rgba(184,137,74,.35);border-radius:12px;padding:6px 8px;background:none;color:inherit;font-family:inherit;cursor:pointer;text-align:left;transition:border-color .15s;min-width:0}
.lk:hover{border-color:#E3BE84}.lk.on{border-color:#FFD36A;box-shadow:0 0 0 2px rgba(255,211,106,.3)}
.lk .th{display:flex;gap:2px;flex:0 0 auto;align-items:center}.lk .th img{width:26px;aspect-ratio:7/11.5;object-fit:cover;border-radius:4px;display:block}
.lk .th em{font-style:normal;font-size:10px;color:#B8894A;margin-left:2px}
.lk b{display:block;font-weight:400;font-size:13px;color:#F3DDA4;line-height:1.35}.lk small{display:block;font-size:11px;color:#9aa3b6;margin-top:2px;line-height:1.35}`;
let cssDone=false;
function css(){if(cssDone)return;cssDone=true;document.head.insertAdjacentHTML('beforeend','<style>'+CSS+'</style>');}
/* draw connection i into el; opt.first = the card to put first; opt.href(id) = link for a card name */
function render(el,i,opt){css();opt=opt||{};const l=window.TL[i];if(!l){el.innerHTML='';return;}
  const C=l.c.map(x=>x.slice());
  if(opt.first){const k=C.findIndex(x=>x[0]===opt.first);if(k>0)C.unshift(C.splice(k,1)[0]);else if(k<0&&l.mn)C.unshift([opt.first,[.5,.5,1],'ეს ბარათი']);}
  const n=Math.min(6,C.length),g=(window.TLG||{})[l.g]||['',''],hr=opt.href||(id=>'course_tarot6.html#'+hash(id));
  const fig=(c)=>`<figure><div class="vp"><img alt="${short(c[0])}" src="${img(c[0])}"><div class="ring"></div></div><figcaption><a href="${hr(c[0])}">${name(c[0])}</a>${c[2]?`<span class="nt">${c[2]}</span>`:''}</figcaption></figure>`;
  const figs=n===2?fig(C[0])+'<div class="mid">⟷</div>'+fig(C[1]):C.slice(0,6).map(fig).join('');
  let pips='';
  if(l.mn){const me=opt.first;pips=`<div class="pips"><b>მცირე არკანი ამ ოჯახში:</b><div>${l.mn.map(r=>SU.map(s=>{const id=s+r;return `<a class="${id===me?'me':''}" href="${hr(id)}" title="${short(id)}"><img loading="lazy" src="${img(id)}" alt="">${r===1?'ტუზი':r}</a>`;}).join('')).join('')}</div></div>`;}
  el.innerHTML=`<div class="cmp"><div class="cg" style="color:${g[1]}">✦ ${g[0]}${n>2?` · ${n} ბარათი`:''}</div><h3>${l.t}</h3>
   <div class="cmp-v n${n}">${figs}</div><div class="hint">დააჭირე ბარათს — მთლიანი ხედი / დეტალი</div><p class="cd">${l.d}</p>${pips}${opt.foot||''}</div>`;
  el.querySelectorAll('.vp').forEach((vp,k)=>{const im=vp.querySelector('img'),P=C[k][1];vp._p=P;
    im.style.transition='none';zoom(vp,[.5,.5,1]);vp.classList.add('full');void im.offsetWidth;im.style.transition='';
    if(P[2]>1.01){const go=()=>setTimeout(()=>{if(!vp.isConnected)return;vp.classList.remove('full');zoom(vp,P);},450+k*300);
      if(im.complete)go();else im.addEventListener('load',go,{once:true});}
    vp.addEventListener('click',()=>{const f=vp.classList.toggle('full');zoom(vp,f?[.5,.5,1]:P);});});
  if(!render._rs){render._rs=true;window.addEventListener('resize',()=>document.querySelectorAll('.cmp .vp').forEach(v=>zoom(v,v.classList.contains('full')?[.5,.5,1]:v._p)));}}
function thumbs(ids,max){const s=ids.slice(0,max).map(id=>`<img loading="lazy" src="${img(id)}" alt="">`).join('');return s+(ids.length>max?`<em>+${ids.length-max}</em>`:'');}
/* list item for a card's own connection list (shows the other cards) */
function item(o,on){css();const l=o.l,g=(window.TLG||{})[l.g]||['',''],ids=o.others.map(x=>x[0]);
  const nm=ids.slice(0,2).map(short).join(', ')+(ids.length>2?` +${ids.length-2}`:'');
  return `<button type="button" class="lk${on?' on':''}" data-l="${o.i}"><span class="th">${thumbs(ids,3)}</span><span><b>${l.t}</b><small><span style="color:${g[1]}">●</span> ${nm}</small></span></button>`;}
/* list item for the full catalogue (shows all cards) */
function pair(i,on){css();const l=window.TL[i],g=(window.TLG||{})[l.g]||['',''],ids=l.c.map(x=>x[0]);
  const nm=ids.length===2?`${short(ids[0])} ⟷ ${short(ids[1])}`:`${g[0]} · ${ids.length} ბარათი`;
  return `<button type="button" class="lk${on?' on':''}" data-l="${i}"><span class="th">${thumbs(ids,4)}</span><span><b>${l.t}</b><small><span style="color:${g[1]}">●</span> ${nm}</small></span></button>`;}
window.TCMP={parse,img,name,short,hash,zoom,links,render,item,pair,css,SU};
})();
