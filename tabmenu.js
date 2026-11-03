/* tabmenu.js — grouped tab menu above the input box (astro.html, hd.html, matrix.html)
   The page's own tab bar stays in the DOM (hidden) with all its buttons and handlers —
   other add-ons keep injecting into it and site.js keeps its #hash routing. This script
   draws a two-row menu in its place:
       row 1 — groups          row 2 — the tabs of the open group
   Clicking a tab clicks the original button. Keyboard: Tab to move, Enter to open.
   Load BEFORE site.js (sets html[data-tabmenu] so site.js does not turn the bar into tiles). */
(function(){
'use strict';
const P=(location.pathname.split('/').pop()||'index.html').toLowerCase();
/* key of an original button: setMode('x') / setMethod(n) / known ids / text */
const ID_KEY={'tru-tab-btn':'trutine','dr-tab-btn':'directions','fl-tab-btn':'futurelife','dv-tab-btn':'davison','cx-tab-btn':'compat','fx-tab-btn':'formulas',
  'pp-tab-btn':'people','tr-tab-btn':'transit','hf-tab-btn':'search','st-tab-btn':'stats',
  'btn-m1':'m1','btn-m2':'m2','btn-m3':'m3','btn-mc':'mc','btn-mp':'mp','btn-ms':'ms'};
const V='\uFE0E';
const CONF={
  'astro.html':{bar:'.tab-bar',groups:[
    ['ნატალური',['natal','trutine'],'☉'+V],
    ['ორბიტები',['orbits'],'◎'],
    ['ადამიანები',['famous','people'],'✧'],
    ['წყვილი',['synastry','composite','davison','compat'],'⚭'+V],
    ['პროგნოზი',['transit','progression','directions','solar','lunar','daily'],'⟳'],
    ['ადგილი',['relocation','astrocartography'],'⌖'],
    ['ინკარნაცია',['pastlife','futurelife','draconic'],'∞'],
    ['კვლევა',['astats','search'],'∑'],
    ['ფორმულები',['formulas'],'ƒ']]},
  'hd.html':{bar:'.tab-bar',groups:[
    ['ნატალური',['natal'],'☉'+V],
    ['სინასტრია',['synastry'],'⚭'+V],
    ['ჩემი ადამიანები',['people'],'✧'],
    ['ტრანზიტი',['transit'],'⟳'],
    ['კვლევა',['stats','search'],'∑']]},
  'matrix.html':{bar:'.method-bar',groups:[
    ['მეთოდები',['m1','m2','m3'],'◇'],
    ['შეთავსება',['mc'],'⚭'+V],
    ['ჩემი ადამიანები',['mp'],'✧'],
    ['სტატისტიკა',['ms'],'∑']]}
};
const C=CONF[P];if(!C)return;
document.documentElement.setAttribute('data-tabmenu','1');

const CSS=`
html[data-tabmenu] .tm-hide{display:none!important}
.tm-menu{position:relative;z-index:3;width:100%;max-width:100%;margin:4px auto 16px;padding:0 12px;box-sizing:border-box;text-align:center}
.tm-row{display:inline-flex;align-items:center;gap:2px;max-width:100%;box-sizing:border-box}
.tm-main{padding:4px;border-radius:999px;background:linear-gradient(180deg,rgba(20,16,40,.82),rgba(10,8,24,.82));
  border:1px solid rgba(201,162,76,.28);box-shadow:inset 0 1px 0 rgba(255,235,190,.05),0 6px 22px rgba(0,0,0,.35);
  overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.tm-main::-webkit-scrollbar{display:none}
.tm-g{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;font:400 12.5px/1 'Noto Serif Georgian',Georgia,serif;letter-spacing:.02em;
  color:rgba(200,196,210,.82);cursor:pointer;background:none;border:1px solid transparent;border-radius:999px;padding:8px 14px;
  white-space:nowrap;transition:color .18s,background .18s,border-color .18s}
.tm-g i{font-style:normal;font-family:'Segoe UI Symbol','Noto Sans Symbols 2','DejaVu Sans',serif;font-size:13px;color:rgba(201,162,76,.7);line-height:1}
.tm-g:hover{color:#EDE6D8;background:rgba(201,162,76,.07)}
.tm-g.on{color:#F3DDA4;background:linear-gradient(180deg,rgba(201,162,76,.22),rgba(201,162,76,.1));border-color:rgba(227,190,132,.55);
  box-shadow:0 0 14px rgba(201,162,76,.18)}
.tm-g.on i{color:#F3DDA4}
.tm-subwrap{margin-top:8px}
.tm-sub{gap:0;flex-wrap:wrap;justify-content:center}
.tm-sub:empty{display:none}
.tm-s{font:400 12px/1 'Noto Serif Georgian',Georgia,serif;color:rgba(188,192,202,.7);cursor:pointer;background:none;border:none;
  padding:6px 11px;position:relative;white-space:nowrap}
.tm-s+.tm-s::before{content:'';position:absolute;left:0;top:50%;width:3px;height:3px;margin-top:-1.5px;border-radius:50%;background:rgba(201,162,76,.35)}
.tm-s:hover{color:#EDE6D8}
.tm-s.on{color:#F3DDA4}
.tm-s.on::after{content:'';position:absolute;left:11px;right:11px;bottom:0;height:1.5px;border-radius:2px;background:linear-gradient(90deg,transparent,#C9A24C,transparent)}
.tm-g:focus-visible,.tm-s:focus-visible{outline:1px solid #E3BE84;outline-offset:2px}
@media(max-width:640px){.tm-g{padding:7px 11px;font-size:12px}.tm-s{padding:6px 8px;font-size:11.5px}}`;

let bar=null,menu=null,rowG=null,rowS=null,openG=null;const lastSub={};
const isOn=b=>b.classList.contains('active')||b.classList.contains('on')||b.getAttribute('aria-selected')==='true';
function keyOf(b){
  if(b.id&&ID_KEY[b.id])return ID_KEY[b.id];
  const oc=b.getAttribute('onclick')||'';let m=/setMode\(\s*['"]([^'"]+)/.exec(oc);if(m)return m[1];
  m=/setMethod\(\s*(\d+)/.exec(oc);if(m)return ['','m1','m2','m3','mc'][+m[1]]||('m'+m[1]);
  return 'txt:'+b.textContent.trim();
}
function model(){
  const btns=[...bar.children].filter(b=>b.tagName==='BUTTON'||b.tagName==='A');
  const by={};btns.forEach(b=>by[keyOf(b)]=b);
  const used=new Set();const groups=[];
  C.groups.forEach(([t,keys,ic])=>{const items=keys.filter(k=>by[k]).map(k=>{used.add(k);return {k,b:by[k]};});if(items.length)groups.push({t,ic,items});});
  /* anything new that no group names gets its own group, so nothing is lost */
  btns.forEach(b=>{const k=keyOf(b);if(!used.has(k))groups.push({t:b.textContent.trim(),items:[{k,b}]});});
  return groups;
}
function render(){
  if(!bar||!menu)return;
  const G=model();
  const act=G.find(g=>g.items.some(it=>isOn(it.b)));
  if(act){openG=act.t;const it=act.items.find(it=>isOn(it.b));if(it)lastSub[act.t]=it.k;}
  if(!openG&&G.length)openG=G[0].t;
  const sig=JSON.stringify(G.map(g=>[g.t,g.items.map(i=>[i.k,i.b.textContent.trim(),isOn(i.b)])]))+'|'+openG;
  if(menu._sig===sig)return;menu._sig=sig;
  const foc=document.activeElement&&menu.contains(document.activeElement)?document.activeElement.dataset.id:null;
  rowG.innerHTML='';rowS.innerHTML='';
  G.forEach(g=>{
    const x=document.createElement('button');x.type='button';x.className='tm-g'+(g.t===openG?' on':'');x.dataset.id='g:'+g.t;
    if(g.ic){const i=document.createElement('i');i.textContent=g.ic;i.setAttribute('aria-hidden','true');x.appendChild(i);}
    x.appendChild(document.createTextNode(g.t));if(g.items.length>1)x.title=g.items.map(it=>it.b.textContent.trim()).join(' · ');
    x.setAttribute('aria-pressed',g.t===openG?'true':'false');
    x.addEventListener('click',()=>openGroup(g));rowG.appendChild(x);
    if(g.t===openG&&g.items.length>1)g.items.forEach(it=>{
      const s=document.createElement('button');s.type='button';s.className='tm-s'+(isOn(it.b)?' on':'');s.textContent=it.b.textContent.trim();s.dataset.id='s:'+it.k;
      s.addEventListener('click',()=>{lastSub[g.t]=it.k;it.b.click();setTimeout(render,0);});rowS.appendChild(s);});
  });
  {const on=rowG.querySelector('.tm-g.on');if(on&&rowG.scrollWidth>rowG.clientWidth){const l=on.offsetLeft-rowG.offsetLeft,r=l+on.offsetWidth;if(l<rowG.scrollLeft)rowG.scrollLeft=l-12;else if(r>rowG.scrollLeft+rowG.clientWidth)rowG.scrollLeft=r-rowG.clientWidth+12;}}
  if(foc){const f=menu.querySelector(`[data-id="${CSS_ESC(foc)}"]`);if(f)f.focus();}
}
const CSS_ESC=s=>(window.CSS&&CSS.escape)?CSS.escape(s):s.replace(/"/g,'\\"');
function openGroup(g){
  openG=g.t;
  if(!g.items.some(it=>isOn(it.b))){const k=lastSub[g.t];const it=g.items.find(i=>i.k===k)||g.items[0];it.b.click();}
  menu._sig=null;setTimeout(render,0);
}
function start(){
  bar=document.querySelector(C.bar);if(!bar||menu)return!!menu;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  menu=document.createElement('nav');menu.className='tm-menu';menu.setAttribute('aria-label','განყოფილებები');
  rowG=document.createElement('div');rowG.className='tm-row tm-main';rowS=document.createElement('div');rowS.className='tm-row tm-sub';
  const sw=document.createElement('div');sw.className='tm-subwrap';sw.appendChild(rowS);
  menu.appendChild(rowG);menu.appendChild(sw);
  bar.parentNode.insertBefore(menu,bar);bar.classList.add('tm-hide');
  new MutationObserver(()=>render()).observe(bar,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-selected']});
  document.addEventListener('click',()=>setTimeout(render,30),true);
  render();return true;
}
function boot(){if(!start()){let n=0;const t=setInterval(()=>{if(start()||++n>40)clearInterval(t);},150);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
