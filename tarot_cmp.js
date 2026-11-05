/* tarot_cmp.js — two-card comparison viewer for the hidden connections (TL from tarot_links.js). Needs tarot_course.js. MAGNUS. */
(function(){
'use strict';
const TC=window.TC;
function parse(id){if(/^M\d+$/.test(id))return {maj:true,n:+id.slice(1)};const m=/^([a-z]+)(\d+)$/.exec(id);return {maj:false,s:m[1],r:+m[2]};}
function img(id){const p=parse(id);return p.maj?TC.majImg(p.n):TC.minImg(p.s,p.r);}
function name(id){const p=parse(id);return p.maj?TC.ROM[p.n]+' · '+TC.MAJ[p.n][0]:TC.SUITS[p.s].gen+' '+TC.RANK[p.r];}
function short(id){const p=parse(id);return p.maj?TC.MAJ[p.n][0]:TC.SUITS[p.s].gen+' '+TC.RANK[p.r];}
function hash(id){const p=parse(id);return p.maj?String(p.n):id;}
/* the same zoom maths as the symbol tour: point (x,y) of the card, magnification z */
function zoom(vp,z3){const im=vp.querySelector('img'),r=vp.querySelector('.ring'),W=vp.clientWidth,H=vp.clientHeight,[x,y,z]=z3;
  let tx=W/2-x*W*z,ty=H/2-y*H*z;tx=Math.min(0,Math.max(W-W*z,tx));ty=Math.min(0,Math.max(H-H*z,ty));
  im.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;
  if(r){if(z>1.01){r.style.left=(x*W*z+tx)+'px';r.style.top=(y*H*z+ty)+'px';r.classList.remove('on');clearTimeout(vp._t);vp._t=setTimeout(()=>r.classList.add('on'),1300);}else{clearTimeout(vp._t);r.classList.remove('on');}}}
function links(id){const L=window.TL||[],o=[];L.forEach((l,i)=>{if(l.a===id)o.push({i,l,me:l.pa,other:l.b,po:l.pb});else if(l.b===id)o.push({i,l,me:l.pb,other:l.a,po:l.pa});});return o;}
const CSS=`.cmp{border:1px solid rgba(184,137,74,.45);border-radius:16px;padding:16px 18px;scroll-margin-top:12px;animation:cfi .5s ease}
@keyframes cfi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.cmp .cg{font-size:11.5px;letter-spacing:.08em}.cmp h3{font-family:'Marcellus SC','Noto Serif Georgian',serif;font-weight:400;font-size:21px;color:#E3BE84;margin-top:3px}
.cmp-v{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:start;margin-top:12px;max-width:620px;margin-left:auto;margin-right:auto}
.cmp-v figure{margin:0;min-width:0}.cmp-v figcaption{text-align:center;font-size:12.5px;margin-top:6px;line-height:1.35}.cmp-v figcaption a{color:#F3DDA4;text-decoration:none}
.cmp-v .mid{font-size:22px;color:#C9A24C;align-self:center;margin-bottom:28px}
.cmp .vp{position:relative;width:100%;aspect-ratio:1200/1976;overflow:hidden;border-radius:12px;border:1px solid rgba(184,137,74,.45);background:#0e1424;cursor:zoom-out}
.cmp .vp.full{cursor:zoom-in}
.cmp .vp img{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:0 0;transition:transform 1.5s cubic-bezier(.65,.05,.25,1);will-change:transform}
.cmp .ring{position:absolute;width:30%;aspect-ratio:1;border:2px solid #FFD36A;border-radius:50%;transform:translate(-50%,-50%) scale(.6);opacity:0;pointer-events:none;box-shadow:0 0 16px rgba(255,211,106,.55);transition:opacity .4s}
.cmp .ring.on{opacity:1;animation:crp 1.8s ease-in-out infinite}
@keyframes crp{0%,100%{transform:translate(-50%,-50%) scale(.85)}50%{transform:translate(-50%,-50%) scale(1.05)}}
.cmp p.cd{font-size:14.5px;line-height:1.9;color:#eef0f4;margin-top:14px}
.cmp .hint{font-size:11.5px;color:#7f889b;text-align:center;margin-top:6px}
.lkl{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;margin-top:10px}
.lk{display:flex;gap:8px;align-items:center;border:1px solid rgba(184,137,74,.35);border-radius:12px;padding:6px 8px;background:none;color:inherit;font-family:inherit;cursor:pointer;text-align:left;transition:border-color .15s}
.lk:hover{border-color:#E3BE84}.lk.on{border-color:#FFD36A;box-shadow:0 0 0 2px rgba(255,211,106,.3)}
.lk .th{display:flex;gap:2px;flex:0 0 auto}.lk .th img{width:30px;aspect-ratio:7/11.5;object-fit:cover;border-radius:4px;display:block}
.lk b{display:block;font-weight:400;font-size:13px;color:#F3DDA4;line-height:1.35}.lk small{display:block;font-size:11px;color:#9aa3b6;margin-top:2px;line-height:1.35}`;
let cssDone=false;
function css(){if(cssDone)return;cssDone=true;document.head.insertAdjacentHTML('beforeend','<style>'+CSS+'</style>');}
/* draw link i into el; first = the card id to put on the left; href(id) = link for a card name */
function render(el,i,opt){css();opt=opt||{};const l=window.TL[i];if(!l){el.innerHTML='';return;}
  let A=l.a,pa=l.pa,B=l.b,pb=l.pb;if(opt.first&&opt.first===l.b){A=l.b;pa=l.pb;B=l.a;pb=l.pa;}
  const g=(window.TLG||{})[l.g]||['',''],hr=opt.href||(id=>'course_tarot6.html#'+hash(id));
  const fig=(id)=>`<figure><div class="vp"><img alt="${short(id)}" src="${img(id)}"><div class="ring"></div></div><figcaption><a href="${hr(id)}">${name(id)}</a></figcaption></figure>`;
  el.innerHTML=`<div class="cmp"><div class="cg" style="color:${g[1]}">✦ ${g[0]}</div><h3>${l.t}</h3>
   <div class="cmp-v">${fig(A)}<div class="mid">⟷</div>${fig(B)}</div><div class="hint">დააჭირე ბარათს — მთლიანი ხედი / დეტალი</div><p class="cd">${l.d}</p>${opt.foot||''}</div>`;
  const vps=el.querySelectorAll('.vp'),P=[pa,pb];
  vps.forEach((vp,k)=>{const im=vp.querySelector('img');im.style.transition='none';zoom(vp,[.5,.5,1]);vp.classList.add('full');void im.offsetWidth;im.style.transition='';
    const go=()=>setTimeout(()=>{vp.classList.remove('full');zoom(vp,P[k]);},450+k*250);
    if(im.complete)go();else im.addEventListener('load',go,{once:true});
    vp.addEventListener('click',()=>{const f=vp.classList.toggle('full');zoom(vp,f?[.5,.5,1]:P[k]);});
    vp._p=P[k];});
  if(!render._rs){render._rs=true;window.addEventListener('resize',()=>document.querySelectorAll('.cmp .vp').forEach(v=>zoom(v,v.classList.contains('full')?[.5,.5,1]:v._p)));}}
function item(o,on){css();const l=o.l,g=(window.TLG||{})[l.g]||['',''];
  return `<button type="button" class="lk${on?' on':''}" data-l="${o.i}"><span class="th"><img loading="lazy" src="${img(o.other)}" alt=""></span><span><b>${l.t}</b><small style="color:${g[1]}">${short(o.other)}</small></span></button>`;}
function pair(i,on){css();const l=window.TL[i],g=(window.TLG||{})[l.g]||['',''];
  return `<button type="button" class="lk${on?' on':''}" data-l="${i}"><span class="th"><img loading="lazy" src="${img(l.a)}" alt=""><img loading="lazy" src="${img(l.b)}" alt=""></span><span><b>${l.t}</b><small><span style="color:${g[1]}">●</span> ${short(l.a)} ⟷ ${short(l.b)}</small></span></button>`;}
window.TCMP={parse,img,name,short,hash,zoom,links,render,item,pair,css};
})();
