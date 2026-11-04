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
.mg-shrink{position:relative}
.mg-shrink.mg-tall:not(.open){max-height:var(--mg-sh,150px)!important;overflow:hidden!important;cursor:pointer}
.mg-shrink.mg-tall:not(.open)::after{content:'▾ სრულად';position:absolute;left:0;right:0;bottom:0;height:52px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:7px;
  background:linear-gradient(rgba(10,8,22,0),rgba(10,8,22,.97) 70%);color:#E3BE84;font:400 11.5px 'Noto Sans Georgian',sans-serif;letter-spacing:1px;pointer-events:none}
.mg-shrink:not(.open):hover::after{color:#FFF0C8}
.mg-fold{display:none;position:absolute;top:6px;right:8px;z-index:2;background:rgba(10,8,22,.85);border:1px solid rgba(184,137,74,.5);color:#E3BE84;border-radius:6px;padding:1px 8px;font-size:12px;cursor:pointer;line-height:1.6}
.mg-shrink.mg-tall.open>.mg-fold{display:block}`;
/* boxes that show a preview instead of only their title */
const SHRINK=['cp-right','cp-left','nx-alm','lunar-badge','dominants-card'];
function shrink(){
  for(const id of SHRINK){const c=document.getElementById(id);if(!c)continue;
    if(!c.classList.contains('mg-shrink')){
      c.classList.remove('mg-col');const ot=c.querySelector(':scope>.mg-col-t');if(ot)ot.classList.remove('mg-col-t');
      c.classList.add('mg-shrink');c.style.setProperty('--mg-sh',id==='dominants-card'?'190px':'150px');
      c.addEventListener('click',e=>{if(e.target.closest('.mg-fold'))return;if(!c.classList.contains('open')&&c.classList.contains('mg-tall')){c.classList.add('open');e.stopPropagation();}},true);
    }
    if(!c.querySelector(':scope>.mg-fold')){const b=document.createElement('button');b.type='button';b.className='mg-fold';b.title='შეკეცვა';b.textContent='▴';
      b.addEventListener('click',e=>{e.stopPropagation();c.classList.remove('open');});c.appendChild(b);}
    const lim=parseFloat(getComputedStyle(c).getPropertyValue('--mg-sh'))||150;
    const was=c.classList.contains('open');c.classList.add('open');const full=c.scrollHeight;if(!was)c.classList.remove('open');
    c.classList.toggle('mg-tall',full>lim+24);
  }
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
