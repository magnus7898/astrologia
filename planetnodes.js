/* planetnodes.js — „პლანეტების კვანძები“: ☊/☋ of every planet (Mercury … Pluto)
   Self-injecting add-on for astro.html — load AFTER search.js and orbits.js.
   • card under every single chart: heliocentric nodes (where the planet's orbit crosses
     the ecliptic, seen from the Sun) and their geocentric projections (as Swiss Ephemeris
     swe_nod_aps, mean), plus natal planets in conjunction with any node (orb 2°)
   • exposes window._pnodes.planetNodes for the orbit view (node lines on the orbits)
   Checked against Swiss Ephemeris (NODBIT_MEAN), 3000 BC – 3000 AD: ≤0.5°.              */
(function(){
'use strict';
const $=id=>document.getElementById(id);
/* planetary nodes (mean orbit): heliocentric ☊/☋ on the ecliptic of date, and the geocentric
   direction of the node points of the orbit (as Swiss Ephemeris swe_nod_aps, NODBIT_MEAN) */
function planetNodes(X,jdUT){
  const jd=jdUT+X.deltaT(jdUT)/86400,T=(jd-2451545)/36525,E=X.helio('earth',T),out={},D=Math.PI/180;
  const n360=x=>((x%360)+360)%360,cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
        nrm=a=>{const l=Math.hypot(a[0],a[1],a[2]);return [a[0]/l,a[1]/l,a[2]/l];};
  const z=X.poleOfDate(T);
  for(const k of ['mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']){
    const e=X.KEP[k],a=e[0]+e[6]*T,ec=e[1]+e[7]*T,I=(e[2]+e[8]*T)*D,vp=(e[4]+e[10]*T)*D,Om=(e[5]+e[11]*T)*D,w=vp-Om;
    const n=[Math.sin(I)*Math.sin(Om),-Math.sin(I)*Math.cos(Om),Math.cos(I)];                 /* orbit pole, J2000 */
    const Pv=[Math.cos(w)*Math.cos(Om)-Math.sin(w)*Math.sin(Om)*Math.cos(I),Math.cos(w)*Math.sin(Om)+Math.sin(w)*Math.cos(Om)*Math.cos(I),Math.sin(w)*Math.sin(I)]; /* perihelion */
    const u=nrm(cross(z,n));                                                                   /* ascending node on the ecliptic of date */
    const Q=cross(n,Pv),nuA=Math.atan2(dot(u,Q),dot(u,Pv));
    const pt=(nu,dir)=>{const r=a*(1-ec*ec)/(1+ec*Math.cos(nu));return [dir*r*u[0],dir*r*u[1],dir*r*u[2]];};
    const N=pt(nuA,1),S=pt(nuA+Math.PI,-1);
    const hN=X.precVec(u,T),hS=n360(hN+180);
    const gN=X.precVec([N[0]-E[0],N[1]-E[1],N[2]-E[2]],T),gS=X.precVec([S[0]-E[0],S[1]-E[1],S[2]-E[2]],T);
    out[k]={hN,hS,gN,gS,N,S};
  }
  return out;
}

const NM={mercury:['მერკური','☿','#c4c0ba'],venus:['ვენერა','♀','#f0d08a'],mars:['მარსი','♂','#ef6c4a'],jupiter:['იუპიტერი','♃','#e3b27c'],
  saturn:['სატურნი','♄','#ecd99c'],uranus:['ურანი','♅','#86e0e8'],neptune:['ნეპტუნი','♆','#6a8cf4'],pluto:['პლუტონი','♇','#c9a08e']};
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'],SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const gen=n=>n.endsWith('ი')?n.slice(0,-1)+'ის':n+'ს';   /* Georgian genitive */
const fmt=l=>{l=((l%360)+360)%360;const s=Math.floor(l/30),d=l-s*30;return `${Math.floor(d)}°${String(Math.floor((d%1)*60)).padStart(2,'0')}′ <span title="${SG[s]}">${ZS[s]}\uFE0E</span>`;};
const CSS=`
#pnodes-card table{width:100%;border-collapse:collapse;font-size:12.5px}
#pnodes-card th{font-weight:400;font-size:10.5px;letter-spacing:1px;color:rgba(232,201,122,.85);text-align:left;padding:6px 8px;border-bottom:1px solid rgba(201,162,76,.25)}
#pnodes-card td{padding:6px 8px;border-bottom:1px solid rgba(201,162,76,.08);color:#f3ecdc;white-space:nowrap}
#pnodes-card td.g{color:#F0D48A}
#pnodes-card .pn-note{font-size:11px;color:rgba(196,176,148,.75);line-height:1.6;margin-top:8px}
#pnodes-card .pn-hit{margin-top:8px;font-size:12px;color:#f3ecdc;line-height:1.8}
#pnodes-card .pn-hit b{color:#F0D48A;font-weight:500}
#pnodes-card .pn-seg button{background:none;border:1px solid rgba(201,162,76,.3);color:rgba(232,201,122,.85);border-radius:12px;padding:2px 10px;font-size:10.5px;cursor:pointer;font-family:inherit;margin-right:4px}
#pnodes-card .pn-seg button.on{background:rgba(201,162,76,.2);border-color:#C9A24C;color:#F7E3A8}`;
let MODE='geo';
/* UT Julian day of the last chart request (BC / Julian dates via ancient.js) */
function reqJD(q){if(!q||!isFinite(+q.year))return null;
  if(window._anc&&window._anc.isHist(q))return window._anc.utJD(q);
  const y=+q.year,m=+q.month,d=+q.day,h=+(q.hour||0),mi=+(q.minute||0),se=+(q.second||0),tz=q.tz_name||'UTC';
  const g=Date.UTC(y,m-1,d,h,mi,se);
  const off=ms=>{const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);
    return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-ms;};
  let t=g-off(g);t=g-off(t);return t/864e5+2440587.5;}
function card(){let c=$('pnodes-card');if(c)return c;const anchor=$('dominants-card');if(!anchor)return null;
  c=document.createElement('div');c.className='data-card';c.id='pnodes-card';c.style.cssText='display:none;margin-top:14px';
  c.innerHTML='<div class="data-card-title">☊ პლანეტების კვანძები</div><div id="pnodes-body" style="padding:12px 14px"></div>';
  anchor.parentNode.insertBefore(c,anchor);return c;}
let LAST=null;
function render(d){
  const X=window._search,c=card();if(!X||!c)return;
  const jd=reqJD(window._lastChartReq);if(jd==null){c.style.display='none';return;}
  const N=planetNodes(X,jd);LAST={d,N};
  const col=MODE==='geo'?['gN','gS']:['hN','hS'];
  /* natal points in conjunction with a node (orb 2°) */
  const hits=[];const P=(d&&d.planets)||{};
  for(const [pn,pv] of Object.entries(P)){const L=+pv.degree;if(!isFinite(L))continue;
    for(const k in N)for(const [key,gl] of [[col[0],'☊'],[col[1],'☋']]){const o=Math.abs(((L-N[k][key])%360+540)%360-180);
      if(o<=2)hits.push(`<b>${pn}</b> ☌ ${NM[k][1]}\uFE0E${gl} ${gen(NM[k][0])} ${gl==='☊'?'ჩრდ.':'სამხ.'} კვანძი (${o.toFixed(1)}°)`);}}
  $('pnodes-body').innerHTML=`
    <div class="pn-seg" style="margin-bottom:8px"><button data-m="geo" class="${MODE==='geo'?'on':''}">გეოცენტრული</button><button data-m="helio" class="${MODE==='helio'?'on':''}">ჰელიოცენტრული</button></div>
    <table><tr><th>პლანეტა</th><th>☊ ჩრდილოეთის კვანძი</th><th>☋ სამხრეთის კვანძი</th></tr>
    ${Object.keys(N).map(k=>`<tr><td><span style="color:${NM[k][2]}">${NM[k][1]}\uFE0E</span> ${NM[k][0]}</td><td class="g">${fmt(N[k][col[0]])}</td><td>${fmt(N[k][col[1]])}</td></tr>`).join('')}</table>
    ${hits.length?`<div class="pn-hit">✦ ნატალური შეერთებები კვანძებთან (2°): <br>${hits.join('<br>')}</div>`:''}
    <div class="pn-note">${MODE==='geo'
      ?'გეოცენტრული — ორბიტის კვანძის წერტილი, დანახული დედამიწიდან (როგორც Swiss Ephemeris, საშუალო კვანძები). შიდა პლანეტებისთვის ☊ და ☋ ერთმანეთის საპირისპირო არ არის, რადგან ორბიტა დედამიწასთან ახლოსაა.'
      :'ჰელიოცენტრული — სადაც პლანეტის ორბიტა ეკლიპტიკას კვეთს, დანახული მზიდან. ეს წერტილები ძალიან ნელა მოძრაობს (საუკუნეში ~1°), ამიტომ თაობის მარკერებია. ☋ ყოველთვის ☊-ის საპირისპიროა.'}</div>`;
  c.style.display='block';
  c.querySelectorAll('.pn-seg button').forEach(b=>b.onclick=()=>{MODE=b.dataset.m;render(LAST&&LAST.d);});
}
function hook(){
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  if(typeof window.showSingleChart==='function'&&!window.showSingleChart._pn){const o=window.showSingleChart;
    const w=function(d){const r=o.apply(this,arguments);try{render(d);}catch(e){console.warn('planetnodes',e);}return r;};w._pn=true;window.showSingleChart=w;}
  if(typeof window.showDoubleChart==='function'&&!window.showDoubleChart._pn){const o=window.showDoubleChart;
    const w=function(){const r=o.apply(this,arguments);const c=$('pnodes-card');if(c)c.style.display='none';return r;};w._pn=true;window.showDoubleChart=w;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else setTimeout(hook,0);
window._pnodes={planetNodes:(jd)=>planetNodes(window._search,jd)};
})();
