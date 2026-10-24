/* interp_bridge.js — plugs the built-in planet/point × sign/house texts (magnus-interp.js) into the
   article system. Texts written in admin_articles.html always win; these are the defaults.
   Keys: sign:<Body>:<0-11> · house:<Body>:<1-12>   (Body = Sun…Lilith, Selena, Fortune, Vertex
   or the Georgian planet name used in astro.html). Load after articles.js and magnus-interp.js. */
(function(){
'use strict';
const D=window.MAGNUS_INTERP;if(!D)return;
const MAP={Sun:'sun',Moon:'moon',Mercury:'mercury',Venus:'venus',Mars:'mars',Jupiter:'jupiter',Saturn:'saturn',Uranus:'uranus',
  Neptune:'neptune',Pluto:'pluto',Chiron:'chiron',Node:'node',Lilith:'lilith',Selena:'selena',Fortune:'fortune',Vertex:'vertex',
  'მზე':'sun','მთვარე':'moon','მერკური':'mercury','ვენერა':'venus','მარსი':'mars','იუპიტერი':'jupiter','სატურნი':'saturn',
  'ურანი':'uranus','ნეპტუნი':'neptune','პლუტონი':'pluto','ქირონი':'chiron','ჩრდ. კვანძი':'node','ლილიტი':'lilith',
  'თეთრი მთვარე':'selena','სელენა':'selena','ბედის ვარსკვლავი':'fortune','ბედის წერტილი':'fortune','ვერტექსი':'vertex'};
const LBL={strength:'ძლიერი მხარე',shadow:'ჩრდილი',task:'ამოცანა',south_habit:'სამხრეთის ჩვევა',growth:'ზრდის გზა',
  trial:'გამოცდა',gift:'სინათლის ძღვენი',healing:'განკურნების ნიჭი'};
const ORDER=['south_habit','growth','strength','shadow','trial','gift','healing','task'];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function html(e){
  let h=e.tag?`<p><em>${esc(e.tag)}</em></p>`:'';
  h+=String(e.text||'').split(/\n\n+/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('');
  for(const f of ORDER)if(e[f])h+=`<p><strong>${LBL[f]}:</strong> ${esc(e[f])}</p>`;
  return h;
}
function forKey(k){
  const m=/^(sign|house):(.+):(\d+)$/.exec(k||'');if(!m)return null;
  const p=MAP[m[2]];if(!p)return null;
  const e=D.get(p,m[1],+m[3]);return e?{t:e.title||'',h:html(e)}:null;
}
D.forKey=forKey;D.toHtml=html;
const A=window.ART;
if(A&&!A.__interp){const g=A.get.bind(A);A.get=function(s,k){const a=g(s,k);if(a&&(a.h||a.t))return a;return s==='astro'?(forKey(k)||a):a;};A.__interp=1;}
})();
