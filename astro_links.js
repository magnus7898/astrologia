/* astro_links.js — clicking a planet, aspect or house in astro.html (wheel and tables) opens the
   matching text from the article editor (admin_articles.html, system "astro") in a new tab.
   Keys: sign:<Body>:<0-11> · house:<Body>:<1-12> · asp:<A>:<B>:<angle> · cusp:<house>:<sign>   */
(function(){
'use strict';
const EN={'მზე':'Sun','მთვარე':'Moon','მერკური':'Mercury','ვენერა':'Venus','მარსი':'Mars','იუპიტერი':'Jupiter','სატურნი':'Saturn','ურანი':'Uranus','ნეპტუნი':'Neptune','პლუტონი':'Pluto','ჩრდ. კვანძი':'Node','ქირონი':'Chiron','ლილიტი':'Lilith','AC':'ASC','MC':'MC'};
const ORDER=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Node','Chiron','Lilith','ASC','MC'];
const ANG={'შეერთება':0,'სექსტილი':60,'კვადრატი':90,'ტრინი':120,'ოპოზიცია':180,'კვინკონსი':150};
const SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const ROM=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const ZG=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const loc=s=>s.endsWith('ი')?s.slice(0,-1)+'ში':s+'ში';          /* ვერძი → ვერძში, თხის რქა → თხის რქაში */
const sym=n=>{const p=((typeof PI!=='undefined'&&PI)||{})[n]||{};return p.sym==='sun'?'☉':p.sym==='SEL'?'⚪':(p.sym||'');};
const signOf=deg=>Math.floor((((deg%360)+360)%360)/30)%12;
function openArt(keys,heads,title,ctx){
  const u=`article.html?s=astro&k=${encodeURIComponent(keys.join(','))}&h=${encodeURIComponent(heads.join('|'))}&t=${encodeURIComponent(title)}${ctx?'&c='+encodeURIComponent(ctx):''}`;
  window.open(u,'_blank','noopener');
}
function ctxName(isB){const n=document.getElementById(isB?'planet-b-title':'planet-table-title');return n?n.textContent.replace(/^🪐\s*/,'').replace(/\s*—\s*პლანეტები$/,'').replace(/^პლანეტები$/,''):'';}
function openPlanet(name,pd,isB){
  if(!pd)return;const en=EN[name],si=signOf(pd.degree),h=+pd.house||0,g=sym(name);
  const keys=[],heads=[];
  if(en){keys.push(`sign:${en}:${si}`);heads.push(`${g} ${name} ${loc(SG[si])}`);
    if(h&&en!=='ASC'&&en!=='MC'){keys.push(`house:${en}:${h}`);heads.push(`${g} ${name} ${ROM[h]} სახლში`);}}
  if(!keys.length){keys.push(`sign:${name}:${si}`);heads.push(`${g} ${name} ${loc(SG[si])}`);}
  openArt(keys,heads,`${name} ${loc(SG[si])}${h&&en!=='ASC'&&en!=='MC'?` · ${ROM[h]} სახლში`:''}`,ctxName(isB));
}
function openAspect(p1,p2,type,ctx){
  let a=EN[p1]||p1,b=EN[p2]||p2,ang=ANG[type];if(ang==null)return;
  if(ORDER.indexOf(a)>ORDER.indexOf(b)&&ORDER.indexOf(b)>=0)[a,b]=[b,a];
  const n1=Object.keys(EN).find(k=>EN[k]===a)||p1,n2=Object.keys(EN).find(k=>EN[k]===b)||p2;
  openArt([`asp:${a}:${b}:${ang}`],[`${sym(n1)} ${n1} ${type} ${sym(n2)} ${n2}`],`${n1} ${type} ${n2}`,ctx);
}
function openHouse(h,deg,ctx){const si=signOf(deg);openArt([`cusp:${h}:${si}`],[`${ZG[si]} ${ROM[h]} სახლი ${loc(SG[si])}`],`${ROM[h]} სახლი ${loc(SG[si])}`,ctx);}
const mark=el=>{el.style.cursor='pointer';el.title='დააჭირე — აღწერა ახალ ჩანართში';};

/* ── tables ── */
let lastP={},lastHouses=null;
function wrap(name,after){const f=window[name];if(typeof f!=='function'||f.__links)return;const w=function(){const r=f.apply(this,arguments);try{after.apply(this,arguments);}catch(e){console.warn(e);}return r;};w.__links=1;window[name]=w;}
wrap('drawPlanetTable',function(planets,isB,tbodyId){
  lastP[tbodyId]=planets;const tb=document.getElementById(tbodyId);if(!tb)return;
  const order=[...PORDER,...Object.keys(planets).filter(k=>!PORDER.includes(k))],seen=new Set(),names=[];
  for(const n of order){if(!planets[n]||seen.has(n))continue;seen.add(n);names.push(n);}
  [...tb.rows].forEach((tr,i)=>{const n=names[i];if(!n)return;mark(tr);tr.classList.add('art-row');tr.onclick=()=>openPlanet(n,planets[n],!!isB);});
});
wrap('drawHouseTable',function(data){
  lastHouses=data&&data.houses;const tb=document.getElementById('house-tbody');if(!tb||!lastHouses)return;
  [...tb.rows].forEach((tr,i)=>{if(i>11)return;mark(tr);tr.classList.add('art-row');tr.onclick=()=>openHouse(i+1,lastHouses[i],ctxName(false));});
});
wrap('drawAspectTable',function(aspects,tbodyId){
  const tb=document.getElementById(tbodyId||'aspect-tbody');if(!tb)return;
  [...tb.rows].forEach(tr=>{if(tr.cells.length<4)return;const n1=(tr.cells[0].querySelector('span:last-child')||{}).textContent,n2=(tr.cells[2].querySelector('span:last-child')||{}).textContent,ty=(tr.cells[3].textContent||'').trim();
    if(!n1||!n2||ANG[ty]==null)return;mark(tr);tr.classList.add('art-row');tr.onclick=()=>openAspect(n1.trim(),n2.trim(),ty,ctxName(false));});
});

/* ── wheel: planet glyphs and aspect lines ── */
function hookWheel(){const f=window.drawWheel;if(typeof f!=='function'||f.__links)return;
  const w=function(d1,d2){const r=f.apply(this,arguments);try{
    const svg=document.getElementById('wheel');if(!svg)return r;
    svg.querySelectorAll('circle[data-planet]:not([data-lk])').forEach(c=>{c.dataset.lk='1';const n=c.dataset.planet,inner=c.dataset.inner==='1',d=inner?d2:d1;if(!d||!d.planets||!d.planets[n])return;
      mark(c);c.addEventListener('click',ev=>{ev.stopPropagation();openPlanet(n,d.planets[n],inner);});});
    const all=[...((d1&&d1.aspects)||[]),...((d2&&d2.aspects)||[])];
    svg.querySelectorAll('line.asp-line:not([data-lk])').forEach(l=>{l.dataset.lk='1';const p1=l.dataset.p1,p2=l.dataset.p2;const a=all.find(x=>(x.p1===p1&&x.p2===p2)||(x.p1===p2&&x.p2===p1));
      let type=a&&a.type;if(!type&&d1&&d1.planets&&d1.planets[p1]&&(d2||d1).planets[p2]){const dd=Math.abs((((d1.planets[p1].degree-((d2||d1).planets[p2].degree))%360)+540)%360-180);type=Object.keys(ANG).reduce((b,k)=>Math.abs(ANG[k]-dd)<Math.abs(ANG[b]-dd)?k:b,'შეერთება');}
      if(!type||ANG[type]==null)return;
      const hit=l.cloneNode();hit.removeAttribute('class');hit.setAttribute('stroke','transparent');hit.setAttribute('stroke-width','9');hit.setAttribute('opacity','1');hit.style.pointerEvents='stroke';mark(hit);
      hit.addEventListener('mouseenter',()=>l.setAttribute('stroke-width','2.6'));hit.addEventListener('mouseleave',()=>l.setAttribute('stroke-width','1'));
      hit.addEventListener('click',()=>openAspect(p1,p2,type,ctxName(false)));l.after(hit);});
  }catch(e){console.warn(e);}return r;};
  w.__links=1;window.drawWheel=w;}
hookWheel();
/* chartpanels.js and others may wrap drawWheel later — re-hook once the page has finished loading */
window.addEventListener('load',()=>setTimeout(hookWheel,0));
const st=document.createElement('style');st.textContent='tr.art-row:hover td{background:rgba(201,168,76,.08)}';document.head.appendChild(st);
window.ASTRO_LINKS={openPlanet,openAspect,openHouse};
})();
