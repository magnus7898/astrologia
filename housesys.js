/* housesys.js — „სახლების სისტემა“ for astro.html.
   A selector under the tab bar (remembered in this browser). Every chart request to the
   backend (/chart, /api/dominants, /true_sidereal) gets `hsys` — the Swiss Ephemeris house
   code — so all tabs (natal, synastry, transit, famous…) draw cusps and house numbers in
   that system. Changing it redraws the chart on screen. Default: Placidus.
   Inside the polar circles Placidus / Koch have no solution → the backend uses Porphyry
   and says so (hsys_fallback).                                                            */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const HS=[
 ['P','პლაციდუსი','Placidus — ნაგულისხმევი'],
 ['K','კოხი','Koch — დაბადების ადგილის სახლები'],
 ['W','მთლიანი ნიშნები','Whole Sign — ASC-ის ნიშანი = I სახლი (ელინისტური, ვედური)'],
 ['E','თანაბარი (ASC-დან)','Equal — 30° ასცენდენტიდან'],
 ['D','თანაბარი (MC-დან)','Equal MC — 30°, X სახლი MC-დან'],
 ['V','ფელოვი','Vehlow — თანაბარი, ASC I სახლის შუაში'],
 ['O','პორფირიუსი','Porphyry — კვადრანტების სამად გაყოფა'],
 ['R','რეგიომონტანუსი','Regiomontanus — ჰორარული ტრადიცია'],
 ['C','კამპანუსი','Campanus — პირველი ვერტიკალი'],
 ['B','ალკაბიციუსი','Alcabitius — შუა საუკუნეები'],
 ['T','ტოპოცენტრული','Topocentric (Polich-Page)'],
 ['M','მორინუსი','Morinus — ეკვატორი'],
 ['X','მერიდიანული','Meridian / Axial rotation'],
 ['H','ჰორიზონტული','Horizon / Azimuth'],
 ['U','კრუშინსკი-პიზა','Krusinski-Pisa-Goelzer'],
 ['Y','APC','APC houses'],
 ['L','პალენი (დელტა)','Pullen Sinusoidal Delta'],
 ['Q','პალენი (ფარდობა)','Pullen Sinusoidal Ratio'],
 ['S','შრიპატი','Sripati — ინდური'],
 ['I','სანშაინი','Sunshine (Makransky)'],
 ['J','სავარდი-A','Savard-A'],
 ['N','0° ვერძიდან','Equal — I სახლი = ვერძი (ნატურალური)'],
];
const KEY='astro_hsys';
let cur='P';try{const v=localStorage.getItem(KEY);if(v&&HS.some(h=>h[0]===v))cur=v;}catch(e){}
window.getHouseSystem=()=>cur;
/* add hsys to every chart request */
const PATHS=['/chart','/api/dominants','/true_sidereal'];
const of=window.fetch;
window.fetch=function(u,init){
  try{const url=typeof u==='string'?u:(u&&u.url)||'';
    if(init&&typeof init.body==='string'&&(init.method||'').toUpperCase()==='POST'&&PATHS.some(p=>url.split('?')[0].endsWith(p))){
      const b=JSON.parse(init.body);if(b&&typeof b==='object'&&!Array.isArray(b)&&b.hsys==null){b.hsys=cur;init=Object.assign({},init,{body:JSON.stringify(b)});}}
  }catch(e){}
  return of.call(this,u,init);
};
const CSS=`
#hs-bar{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:10px auto 14px;font-size:11.5px;color:rgba(200,180,140,.8)}
#hs-bar select{width:auto!important;min-width:170px;background:rgba(10,8,22,.7);border:1px solid rgba(201,162,76,.35);color:#ecd59a;border-radius:8px;padding:5px 8px;font:inherit;font-size:12px;max-width:100%}
#hs-bar small{color:rgba(200,180,140,.6);font-size:10.5px;flex-basis:100%;text-align:center}
#hs-bar .fb{color:#e8907a}`;
function inject(){
  const bar=document.querySelector('.tab-bar');if(!bar)return false;if($('hs-bar'))return true;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const d=document.createElement('div');d.id='hs-bar';
  d.innerHTML=`<span>🏠 სახლების სისტემა</span><select id="hs-sel" aria-label="სახლების სისტემა">${HS.map(h=>`<option value="${h[0]}" title="${h[2]}"${h[0]===cur?' selected':''}>${h[1]}</option>`).join('')}</select><small id="hs-info"></small>`;
  bar.insertAdjacentElement('afterend',d);
  /* the page subtitle names the house system */
  const sub=[...document.querySelectorAll('header *, .header *, body *')].find(e=>e.children.length===0&&/Placidus Houses/.test(e.textContent));
  const EN={P:'Placidus',K:'Koch',W:'Whole Sign',E:'Equal',D:'Equal MC',V:'Vehlow',O:'Porphyry',R:'Regiomontanus',C:'Campanus',B:'Alcabitius',T:'Topocentric',M:'Morinus',X:'Meridian',H:'Horizon',U:'Krusinski',Y:'APC',L:'Pullen SD',Q:'Pullen SR',S:'Sripati',I:'Sunshine',J:'Savard-A',N:'Aries Equal'};
  const sub0=sub?sub.textContent:'';
  const info=()=>{const h=HS.find(x=>x[0]===cur);$('hs-info').textContent=h?h[2]:'';if(sub)sub.textContent=sub0.replace('Placidus Houses',EN[cur]+' Houses');};info();
  $('hs-sel').onchange=()=>{cur=$('hs-sel').value;try{localStorage.setItem(KEY,cur);}catch(e){}info();
    const ca=$('chart-area');if(ca&&ca.style.display!=='none'&&typeof window.generate==='function'){
      /* redraw what is on screen (the famous tab draws through the natal form) */
      const fam=$('form-famous')&&$('form-famous').classList.contains('active');
      if(fam){const on=document.querySelector('#form-famous .fm-p.on');if(on)on.click();}else window.generate();}};
  return true;
}
/* tell when the backend had to fall back (polar latitudes) */
const ofc=window.fetch;
window.fetch=function(u,init){const p=ofc.call(this,u,init);
  try{const url=typeof u==='string'?u:(u&&u.url)||'';if(url.split('?')[0].endsWith('/chart'))p.then(r=>r.clone().json()).then(j=>{const el=$('hs-info');if(!el||!j||!j.hsys)return;
    if(j.hsys_fallback){el.innerHTML=`<span class="fb">⚠ ამ განედზე (პოლარული წრე) ${HS.find(x=>x[0]===cur)[1]} არ ითვლება — გამოყენებულია პორფირიუსი</span>`;}
    else{const h=HS.find(x=>x[0]===cur);el.textContent=h?h[2]:'';}}).catch(()=>{});}catch(e){}
  return p;};
let tries=0;(function wait(){if(inject()||++tries>100)return;setTimeout(wait,100);})();
})();
