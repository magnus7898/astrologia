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
#lay-info.lay,#lay-bot.lay{align-items:start}`;
function tag(){
  document.querySelectorAll('#lay-info>.data-card,#lay-bot>.data-card').forEach(c=>{
    if(c.classList.contains('mg-col'))return;
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
  new MutationObserver(()=>tag()).observe(ca,{childList:true,subtree:true});tag();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
