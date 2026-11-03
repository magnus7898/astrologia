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
const ID_KEY={'tru-tab-btn':'trutine','dr-tab-btn':'directions','fl-tab-btn':'futurelife','dv-tab-btn':'davison','fx-tab-btn':'formulas',
  'pp-tab-btn':'people','tr-tab-btn':'transit','hf-tab-btn':'search','st-tab-btn':'stats',
  'btn-m1':'m1','btn-m2':'m2','btn-m3':'m3','btn-mc':'mc','btn-mp':'mp','btn-ms':'ms'};
const CONF={
  'astro.html':{bar:'.tab-bar',groups:[
    ['ნატალური',['natal','trutine','orbits']],
    ['ადამიანები',['famous','people']],
    ['სინასტრია · კომპოზიტი',['synastry','composite','davison']],
    ['პროგნოზი',['transit','progression','directions','solar','lunar','daily']],
    ['რელოკაცია · ასტროკარტოგრაფია',['relocation','astrocartography']],
    ['წარსული · მომავალი · დრაკონი',['pastlife','futurelife','draconic']],
    ['სტატისტიკა · ძებნა',['astats','search']],
    ['ფორმულები',['formulas']]]},
  'hd.html':{bar:'.tab-bar',groups:[
    ['ნატალური',['natal']],
    ['სინასტრია',['synastry']],
    ['ჩემი ადამიანები',['people']],
    ['ტრანზიტი',['transit']],
    ['სტატისტიკა · ძებნა',['stats','search']]]},
  'matrix.html':{bar:'.method-bar',groups:[
    ['მეთოდები',['m1','m2','m3']],
    ['შეთავსება',['mc']],
    ['ჩემი ადამიანები',['mp']],
    ['სტატისტიკა',['ms']]]}
};
const C=CONF[P];if(!C)return;
document.documentElement.setAttribute('data-tabmenu','1');

const CSS=`
html[data-tabmenu] .tm-hide{display:none!important}
.tm-menu{position:relative;z-index:3;width:100%;max-width:1100px;margin:6px auto 18px;padding:0 12px;box-sizing:border-box}
.tm-row{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
.tm-g{font:500 13px/1.25 'Noto Serif Georgian',Georgia,serif;letter-spacing:.02em;color:#BCC0CA;cursor:pointer;
  background:rgba(8,6,18,.72);border:1px solid rgba(184,137,74,.3);border-radius:3px;padding:10px 16px;transition:border-color .2s,color .2s,background .2s}
.tm-g:hover{border-color:#B8894A;color:#EDE6D8}
.tm-g.on{color:#E3BE84;border-color:#E3BE84;background:rgba(24,20,44,.92);box-shadow:inset 0 0 0 1px rgba(227,190,132,.3),0 0 16px rgba(184,137,74,.2)}
.tm-sub{margin-top:8px;padding-top:8px;border-top:1px solid rgba(184,137,74,.18);gap:2px 4px}
.tm-sub:empty{display:none}
.tm-s{font:400 12.5px/1.25 'Noto Serif Georgian',Georgia,serif;color:rgba(188,192,202,.85);cursor:pointer;background:none;border:none;
  border-bottom:2px solid transparent;padding:7px 12px}
.tm-s:hover{color:#EDE6D8}
.tm-s.on{color:#E3BE84;border-bottom-color:#B8894A}
.tm-g:focus-visible,.tm-s:focus-visible{outline:1px solid #E3BE84;outline-offset:2px}
@media(max-width:640px){.tm-g{padding:8px 10px;font-size:12px}.tm-s{padding:6px 8px;font-size:12px}}`;

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
  C.groups.forEach(([t,keys])=>{const items=keys.filter(k=>by[k]).map(k=>{used.add(k);return {k,b:by[k]};});if(items.length)groups.push({t,items});});
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
    const x=document.createElement('button');x.type='button';x.className='tm-g'+(g.t===openG?' on':'');x.textContent=g.t;x.dataset.id='g:'+g.t;
    x.setAttribute('aria-pressed',g.t===openG?'true':'false');
    x.addEventListener('click',()=>openGroup(g));rowG.appendChild(x);
    if(g.t===openG&&g.items.length>1)g.items.forEach(it=>{
      const s=document.createElement('button');s.type='button';s.className='tm-s'+(isOn(it.b)?' on':'');s.textContent=it.b.textContent.trim();s.dataset.id='s:'+it.k;
      s.addEventListener('click',()=>{lastSub[g.t]=it.k;it.b.click();setTimeout(render,0);});rowS.appendChild(s);});
  });
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
  rowG=document.createElement('div');rowG.className='tm-row';rowS=document.createElement('div');rowS.className='tm-row tm-sub';
  menu.appendChild(rowG);menu.appendChild(rowS);
  bar.parentNode.insertBefore(menu,bar);bar.classList.add('tm-hide');
  new MutationObserver(()=>render()).observe(bar,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-selected']});
  document.addEventListener('click',()=>setTimeout(render,30),true);
  render();return true;
}
function boot(){if(!start()){let n=0;const t=setInterval(()=>{if(start()||++n>40)clearInterval(t);},150);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
