/* chartui.js — astro.html chart view tidy-up.
   · boxes around the wheel: square corners like the other boxes
   · after placements (planets · houses · fixed stars) every box shows only its title;
     a click on the title opens / closes it                                            */
(function(){
'use strict';
const CSS=`
#chart-area .cp,#chart-area .nx,#lunar-badge,#chart-area .data-card{border-radius:3px!important}
.mg-col>.mg-col-t{cursor:pointer;user-select:none;position:relative;padding-right:34px!important}
.mg-col>.mg-col-t::after{content:'▾';position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#B8894A;font-size:12px;transition:transform .2s}
.mg-col:not(.open)>.mg-col-t::after{transform:translateY(-50%) rotate(-90deg)}
.mg-col:not(.open){padding:0!important;min-height:0!important;height:auto!important}
.mg-col:not(.open)>.mg-col-t{margin:0!important;border-bottom:0!important}
.mg-col:not(.open)>:not(.mg-col-t){display:none!important}
#lay-info.lay,#lay-bot.lay{align-items:start}
/* natal top boxes: a short preview; a click shows the whole box, ▴ folds it again */
#lay-strip{align-items:start!important}
/* all preview boxes share one height when folded and one height when open; one click opens/folds all */
.mg-shrink{position:relative;box-sizing:border-box}
.mg-shrink:not(.open){height:var(--mg-sh,170px)!important;max-height:var(--mg-sh,170px)!important;overflow:hidden!important;cursor:pointer}
.mg-shrink.open{height:var(--mg-open,auto)!important;max-height:none!important}
.mg-shrink.mg-measure{height:auto!important;max-height:none!important}
.mg-shrink.mg-tall:not(.open)::after{content:'▾ სრულად';position:absolute;left:0;right:0;bottom:0;height:52px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:7px;
  background:linear-gradient(rgba(50,40,30,0),rgba(50,40,30,.98) 70%);color:#E3BE84;font:400 11.5px 'Noto Sans Georgian',sans-serif;letter-spacing:1px;pointer-events:none}
.mg-shrink:not(.open):hover::after{color:#FFF0C8}
.mg-fold{display:none;position:absolute;top:6px;right:8px;z-index:2;background:rgba(10,8,22,.85);border:1px solid rgba(184,137,74,.5);color:#E3BE84;border-radius:6px;padding:1px 8px;font-size:12px;cursor:pointer;line-height:1.6}
.mg-shrink.open>.mg-fold{display:block}`;
/* boxes that show a preview instead of only their title */
const SHRINK=['cp-right','cp-left','nx-alm','lunar-badge','dominants-card'];
const FOLD_H=170;           /* the one folded height (px) */
let OPEN=false;
const boxes=()=>SHRINK.map(id=>document.getElementById(id)).filter(Boolean);
function setAll(o){OPEN=o;shrink();}
function shrink(){
  const all=boxes();
  for(const c of all){
    if(!c.classList.contains('mg-shrink')){
      c.classList.remove('mg-col');const ot=c.querySelector(':scope>.mg-col-t');if(ot)ot.classList.remove('mg-col-t');
      c.classList.add('mg-shrink');c.style.setProperty('--mg-sh',FOLD_H+'px');
      c.addEventListener('click',e=>{if(e.target.closest('.mg-fold'))return;if(!OPEN){e.stopPropagation();e.preventDefault();setAll(true);}},true);
    }
    if(!c.querySelector(':scope>.mg-fold')){const b=document.createElement('button');b.type='button';b.className='mg-fold';b.title='შეკეცვა';b.textContent='▴';
      b.addEventListener('click',e=>{e.stopPropagation();setAll(false);});c.appendChild(b);}
  }
  /* measure every visible box at its natural height */
  const vis=all.filter(c=>c.offsetParent!==null);
  vis.forEach(c=>c.classList.add('mg-measure'));
  const full=vis.map(c=>c.scrollHeight);
  vis.forEach(c=>c.classList.remove('mg-measure'));
  const H=Math.max(FOLD_H,...full);
  all.forEach((c,i)=>{c.style.setProperty('--mg-open',H+'px');c.classList.toggle('open',OPEN);});
  vis.forEach((c,i)=>c.classList.toggle('mg-tall',full[i]>FOLD_H+4));
}
function tag(){
  document.querySelectorAll('#lay-info>.data-card,#lay-bot>.data-card').forEach(c=>{
    if(c.classList.contains('mg-col')||SHRINK.includes(c.id))return;
    const t=[...c.children].find(x=>x.classList.contains('data-card-title'))||c.firstElementChild;
    if(!t)return;
    c.classList.add('mg-col');t.classList.add('mg-col-t');
    t.setAttribute('role','button');t.tabIndex=0;t.setAttribute('aria-expanded','false');
    const tog=e=>{if(e.target.closest('button,a,input,select')&&e.target.closest('button,a,input,select')!==t)return;
      const o=c.classList.toggle('open');t.setAttribute('aria-expanded',o);};
    t.addEventListener('click',tog);
    t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog(e);}});
  });
}
function start(){
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const ca=document.getElementById('chart-area');if(!ca)return;
  let q=0;const run=()=>{q=0;tag();shrink();};
  new MutationObserver(()=>{if(!q)q=requestAnimationFrame(run);}).observe(ca,{childList:true,subtree:true});run();
  addEventListener('resize',()=>{if(!q)q=requestAnimationFrame(run);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
