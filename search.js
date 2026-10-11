/* search.js — „ძებნა“: when were / will be planets in given signs.
   Self-injecting add-on for astro.html (load after returns.js).
   Positions are computed in the browser: JPL Keplerian elements (planets,
   Sun), Meeus ch.47 (Moon), mean lunar node — all converted to the
   ecliptic of date (precession), i.e. the same tropical zodiac as the chart.
   Accuracy vs Swiss Ephemeris (1600–2400): Sun/Mercury/Venus ≤1′, Mars ≤3′,
   Jupiter/Saturn ≤3′, Uranus ≤10′, Neptune ≤8′, Pluto ≤13′,
   ~0.3° for the Moon — ingress times to within minutes (Moon ±1 h).        */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const D2R=Math.PI/180,R2D=180/Math.PI,norm=x=>((x%360)+360)%360,pad=n=>String(n).padStart(2,'0');
const KEP={
 mercury:[0.38709927,0.20563593,7.00497902,252.25032350,77.45779628,48.33076593,0.00000037,0.00001906,-0.00594749,149472.67411175,0.16047689,-0.12534081],
 venus:[0.72333566,0.00677672,3.39467605,181.97909950,131.60246718,76.67984255,0.00000390,-0.00004107,-0.00078890,58517.81538729,0.00268329,-0.27769418],
 earth:[1.00000261,0.01671123,-0.00001531,100.46457166,102.93768193,0.0,0.00000562,-0.00004392,-0.01294668,35999.37244981,0.32327364,0.0],
 mars:[1.52371034,0.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891,0.00001847,0.00007882,-0.00813131,19140.30268499,0.44441088,-0.29257343],
 jupiter:[5.20288700,0.04838624,1.30439695,34.39644051,14.72847983,100.47390909,-0.00011607,-0.00013253,-0.00183714,3034.74612775,0.21252668,0.20469106],
 saturn:[9.53667594,0.05386179,2.48599187,49.95424423,92.59887831,113.66242448,-0.00125060,-0.00050991,0.00193609,1222.49362201,-0.41897216,-0.28867794],
 uranus:[19.18916464,0.04725744,0.77263783,313.23810451,170.95427630,74.01692503,-0.00196176,-0.00004397,-0.00242939,428.48202785,0.40805281,0.04240589],
 neptune:[30.06992276,0.00859048,1.77004347,-55.12002969,44.96476227,131.78422574,0.00026291,0.00005105,0.00035372,218.45945325,-0.32241464,-0.00508664],
 pluto:[39.48211675,0.24882730,17.14001206,238.92903833,224.06891629,110.30393684,-0.00031596,0.00005170,0.00004818,145.20780515,-0.04062942,-0.01183482]};
function helio(k,T){
  const e=KEP[k],a=e[0]+e[6]*T,ec=e[1]+e[7]*T,I=(e[2]+e[8]*T)*D2R,L=e[3]+e[9]*T,vp=e[4]+e[10]*T,Om=(e[5]+e[11]*T)*D2R;
  let M=norm(L-vp)*D2R;if(M>Math.PI)M-=2*Math.PI;
  let E=M;for(let i=0;i<8;i++)E-=(E-ec*Math.sin(E)-M)/(1-ec*Math.cos(E));
  const xp=a*(Math.cos(E)-ec),yp=a*Math.sqrt(1-ec*ec)*Math.sin(E),w=vp*D2R-Om,cw=Math.cos(w),sw=Math.sin(w),cO=Math.cos(Om),sO=Math.sin(Om),ci=Math.cos(I),si=Math.sin(I);
  return[(cw*cO-sw*sO*ci)*xp+(-sw*cO-cw*sO*ci)*yp,(cw*sO+sw*cO*ci)*xp+(-sw*sO+cw*cO*ci)*yp,(sw*si)*xp+(cw*si)*yp];
}
const prec=T=>(5029.0966*T+1.11113*T*T)/3600;          /* J2000 → equinox of date */
function moonLon(T){
  const L=218.3164477+481267.88123421*T,D=(297.8501921+445267.1114034*T)*D2R,M=(357.5291092+35999.0502909*T)*D2R,
        Mp=(134.9633964+477198.8675055*T)*D2R,F=(93.2720950+483202.0175233*T)*D2R,E=1-0.002516*T;
  return norm(L+6.288774*Math.sin(Mp)+1.274027*Math.sin(2*D-Mp)+0.658314*Math.sin(2*D)+0.213618*Math.sin(2*Mp)
    -0.185116*E*Math.sin(M)-0.114332*Math.sin(2*F)+0.058793*Math.sin(2*D-2*Mp)+0.057066*E*Math.sin(2*D-M-Mp)
    +0.053322*Math.sin(2*D+Mp)+0.045758*E*Math.sin(2*D-M)-0.040923*E*Math.sin(M-Mp)-0.034720*Math.sin(D)
    -0.030383*E*Math.sin(M+Mp)+0.015327*Math.sin(2*D-2*F)-0.012528*Math.sin(Mp+2*F)+0.010980*Math.sin(Mp-2*F)
    +0.010675*Math.sin(4*D-Mp)+0.010034*Math.sin(3*Mp)+0.008548*Math.sin(4*D-2*Mp)-0.007888*E*Math.sin(2*D+M-Mp)
    -0.006766*E*Math.sin(2*D+M)-0.005163*Math.sin(D-Mp)+0.004987*E*Math.sin(D+M)+0.004036*E*Math.sin(2*D-M+Mp));
}
/* Jupiter/Saturn/Uranus: Schlyter elements of date + great-inequality perturbations (±2–3′ over 1600–2400) */
const SCH={jupiter:[100.4542,2.76854E-5,1.3030,-1.557E-7,273.8777,1.64505E-5,5.20256,0,0.048498,4.469E-9,19.8950,0.0830853001],
 saturn:[113.6634,2.38980E-5,2.4886,-1.081E-7,339.3939,2.97661E-5,9.55475,0,0.055546,-9.499E-9,316.9670,0.0334442282],
 uranus:[74.0005,1.3978E-5,0.7733,1.9E-8,96.6612,3.0565E-5,19.18171,-1.55E-8,0.047318,7.45E-9,142.5905,0.011725806]};
function sch(k,d){const q=SCH[k],N=(q[0]+q[1]*d)*D2R,i=(q[2]+q[3]*d)*D2R,w=(q[4]+q[5]*d)*D2R,a=q[6]+q[7]*d,e=q[8]+q[9]*d,M=norm(q[10]+q[11]*d)*D2R;
 let E=M;for(let j=0;j<10;j++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
 const xv=a*(Math.cos(E)-e),yv=a*Math.sqrt(1-e*e)*Math.sin(E),v=Math.atan2(yv,xv),r=Math.hypot(xv,yv);
 const x=r*(Math.cos(N)*Math.cos(v+w)-Math.sin(N)*Math.sin(v+w)*Math.cos(i)),y=r*(Math.sin(N)*Math.cos(v+w)+Math.cos(N)*Math.sin(v+w)*Math.cos(i)),z=r*Math.sin(v+w)*Math.sin(i);
 let L=Math.atan2(y,x)*R2D,B=Math.asin(z/r);
 const Mj=(19.8950+0.0830853001*d)*D2R,Ms=(316.9670+0.0334442282*d)*D2R,Mu=(142.5905+0.011725806*d)*D2R,S=Math.sin,C=Math.cos,g=D2R;
 if(k==='jupiter')L+=-0.332*S(2*Mj-5*Ms-67.6*g)-0.056*S(2*Mj-2*Ms+21*g)+0.042*S(3*Mj-5*Ms+21*g)-0.036*S(Mj-2*Ms)+0.022*C(Mj-Ms)+0.023*S(2*Mj-3*Ms+52*g)-0.016*S(Mj-5*Ms-69*g);
 if(k==='saturn'){L+=0.812*S(2*Mj-5*Ms-67.6*g)-0.229*C(2*Mj-4*Ms-2*g)+0.119*S(Mj-2*Ms-3*g)+0.046*S(2*Mj-6*Ms-69*g)+0.014*S(Mj-3*Ms+32*g);B+=(-0.020*C(2*Mj-4*Ms-2*g)+0.018*S(2*Mj-6*Ms-49*g))*g;}
 if(k==='uranus')L+=0.040*S(Ms-2*Mu+6*g)+0.035*S(Ms-3*Mu+33*g)-0.015*S(Mj-Mu+20*g);
 L*=D2R;return[r*Math.cos(B)*Math.cos(L),r*Math.cos(B)*Math.sin(L),r*Math.sin(B)];}
function lonSch(k,jd){const T=(jd-2451545)/36525,d=jd-2451543.5,p0=prec(T)*D2R;
 const e0=helio('earth',T),c=Math.cos(p0),s=Math.sin(p0),e=[e0[0]*c-e0[1]*s,e0[0]*s+e0[1]*c,e0[2]];
 let p=sch(k,d);const lt=Math.hypot(p[0]-e[0],p[1]-e[1],p[2]-e[2])*0.0057755;p=sch(k,d-lt);
 return norm(Math.atan2(p[1]-e[1],p[0]-e[0])*R2D);}
/* geocentric ecliptic longitude of date, degrees */
function lon(body,jd){
  const T=(jd-2451545)/36525;
  if(body==='moon')return moonLon(T);
  if(body==='node')return norm(125.0445479-1934.1362891*T+0.0020754*T*T);
  if(SCH[body])return lonSch(body,jd);
  const e=helio('earth',T);
  let v;
  if(body==='sun')v=[-e[0],-e[1],-e[2]];
  else{const p=helio(body,T),r=Math.hypot(p[0]-e[0],p[1]-e[1],p[2]-e[2]),lt=r*0.0057755;      /* light time, days */
    const p2=helio(body,T-lt/36525);v=[p2[0]-e[0],p2[1]-e[1],p2[2]-e[2]];}
  return norm(Math.atan2(v[1],v[0])*R2D+prec(T)-(body==='sun'?0.0057:0));
}
const BODIES=[['sun','მზე','☉'],['moon','მთვარე','☽'],['mercury','მერკური','☿'],['venus','ვენერა','♀'],['mars','მარსი','♂'],
  ['jupiter','იუპიტერი','♃'],['saturn','სატურნი','♄'],['uranus','ურანი','♅'],['neptune','ნეპტუნი','♆'],['pluto','პლუტონი','♇'],['node','ჩრდ. კვანძი','☊']];
const SIGNS=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const CAN_RX=new Set(['mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']);
const sfx=(n,x)=>(n.endsWith('ი')?n.slice(0,-1):n)+x;

/* condition test at jd */
function ok(conds,jd){
  for(const c of conds){
    const L=lon(c.b,jd);
    if(Math.floor(L/30)!==c.s)return false;
    if(c.rx){const d=norm(lon(c.b,jd+0.5)-L+180)-180;if(d>=0)return false;}
  }
  return true;
}
const jdOfMs=ms=>ms/864e5+2440587.5,msOfJd=jd=>(jd-2440587.5)*864e5;
/* scan [jd0,jd1] → intervals where every condition holds */
function scan(conds,jd0,jd1,progress){
  const fast=conds.some(c=>c.b==='moon');
  const step=fast?0.25:(conds.some(c=>c.b==='sun'||c.b==='mercury'||c.b==='venus')?1:2);
  const out=[];let prev=ok(conds,jd0),start=prev?jd0:null,n=0;
  const refine=(a,b,want)=>{for(let i=0;i<22;i++){const m=(a+b)/2;(ok(conds,m)===want)?b=m:a=m;}return b;};
  for(let jd=jd0+step;jd<=jd1+1e-9;jd+=step){
    const cur=ok(conds,jd);
    if(cur!==prev){const t=refine(jd-step,jd,cur);
      if(cur)start=t;else{out.push([start,t]);start=null;}}
    prev=cur;
    if(++n%20000===0&&progress)progress((jd-jd0)/(jd1-jd0));
  }
  if(start!=null)out.push([start,jd1,true]);
  return out;
}

/* ── UI ── */
const CSS=`
.sr-row{display:grid;grid-template-columns:1fr 1fr auto auto;gap:8px;align-items:end;margin-bottom:8px}
.sr-row .rx{display:flex;align-items:center;gap:5px;font-size:11px;padding-bottom:9px;white-space:nowrap}
.sr-x{background:none;border:1px solid rgba(201,162,76,.3);color:#E8C97A;border-radius:50%;width:30px;height:30px;cursor:pointer;margin-bottom:3px}
.sr-add{background:rgba(201,162,76,.1);border:1px dashed rgba(201,162,76,.45);color:#E8C97A;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;font-family:inherit}
.sr-sum{font-size:12.5px;color:rgba(196,176,148,.8);margin:10px 0 8px;line-height:1.7}
.sr-sum b{color:#F0D48A;font-weight:500}
.sr-list{max-height:480px;overflow:auto;border:1px solid rgba(201,162,76,.18);border-radius:10px}
.sr-it{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:8px 12px;border-bottom:1px solid rgba(201,162,76,.1);font-size:12.5px}
.sr-it:last-child{border-bottom:none}
.sr-it.now{background:rgba(95,200,176,.1)}
.sr-it.next{background:rgba(201,162,76,.08)}
.sr-tag{font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid;white-space:nowrap}
.sr-it .d{color:rgba(196,176,148,.7);font-size:11px}
.sr-go{background:none;border:1px solid rgba(201,162,76,.35);color:#E8C97A;border-radius:12px;padding:3px 9px;font-size:10.5px;cursor:pointer;font-family:inherit;white-space:nowrap}
.sr-bar{height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-top:8px;display:none}
.sr-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#5fc8b0,#C9A24C)}`;
function rowHTML(i){
  return `<div class="sr-row" data-i="${i}">
    <div class="field"><label>პლანეტა</label><select class="sr-b">${BODIES.map(b=>`<option value="${b[0]}">${b[2]} ${b[1]}</option>`).join('')}</select></div>
    <div class="field"><label>ნიშანი</label><select class="sr-s">${SIGNS.map((s,j)=>`<option value="${j}">${ZS[j]}︎ ${s}</option>`).join('')}</select></div>
    <label class="rx"><input type="checkbox" class="sr-rx" style="accent-color:#C9A24C"> ℞</label>
    <button type="button" class="sr-x" title="წაშლა">×</button></div>`;
}
function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!bar||!card||$('form-search'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const b=document.createElement('button');b.className='tab-btn';b.textContent='ძებნა';b.setAttribute('onclick',"setMode('search')");
  const after=document.querySelector(".tab-btn[onclick*=\"'daily'\"]")||document.querySelector(".tab-btn[onclick*=\"'solar'\"]");
  if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);else bar.appendChild(b);
  const sec=document.createElement('div');sec.id='form-search';sec.className='form-section';
  const y=new Date().getFullYear();
  sec.innerHTML=`
    <div class="person-label">🔎 ძებნა — როდის იყო / იქნება</div>
    <div style="font-size:11px;color:rgba(200,180,140,.7);line-height:1.6;margin:-2px 0 12px">
      აირჩიე ერთი ან რამდენიმე პლანეტა ნიშანში — ვიპოვი ყველა პერიოდს, როცა <b>ყველა პირობა ერთად</b> სრულდება. ℞ — მხოლოდ რეტროგრადულ მოძრაობაში.</div>
    <div id="sr-rows">${rowHTML(0)}</div>
    <button type="button" class="sr-add" id="sr-add">+ პირობის დამატება</button>
    <div class="form-grid-2" style="margin-top:12px">
      <div class="field"><label>წლიდან</label><input type="number" id="sr-y0" value="${y-100}" min="1600" max="2400"></div>
      <div class="field"><label>წლამდე</label><input type="number" id="sr-y1" value="${y+100}" min="1600" max="2400"></div>
    </div>
    <button type="button" class="gen-btn" id="sr-go" style="margin-top:10px">🔎 ძებნა ✦</button>
    <div class="sr-bar" id="sr-bar"><i></i></div>
    <div id="sr-out"></div>`;
  card.insertBefore(sec,$('form-relocation')||null);
  const rows=$('sr-rows');
  const wire=()=>rows.querySelectorAll('.sr-row').forEach(r=>{
    r.querySelector('.sr-x').onclick=()=>{if(rows.children.length>1)r.remove();};
    const sel=r.querySelector('.sr-b'),rx=r.querySelector('.sr-rx');
    sel.onchange=()=>{rx.disabled=!CAN_RX.has(sel.value);if(rx.disabled)rx.checked=false;};sel.onchange();});
  $('sr-add').onclick=()=>{if(rows.children.length>=6)return;rows.insertAdjacentHTML('beforeend',rowHTML(rows.children.length));
    const ls=rows.lastElementChild.querySelector('.sr-b');ls.value=['mars','jupiter','saturn','venus','mercury'][rows.children.length%5];wire();};
  wire();
  $('sr-go').onclick=run;
}
const tz=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';}catch(e){return 'UTC';}})();
function fmt(jd,withTime){const p={};new Intl.DateTimeFormat('en-GB',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})
  .formatToParts(new Date(msOfJd(jd))).forEach(x=>{if(x.type!=='literal')p[x.type]=x.value;});
  return `${p.day}.${p.month}.${p.year}`+(withTime?` ${p.hour}:${p.minute}`:'');}
function dur(d){if(d<2)return Math.round(d*24)+' სთ';if(d<60)return Math.round(d)+' დღე';if(d<730)return (d/30.44).toFixed(1).replace('.0','')+' თვე';return (d/365.25).toFixed(1).replace('.0','')+' წელი';}
function run(){
  const conds=[...document.querySelectorAll('#sr-rows .sr-row')].map(r=>({b:r.querySelector('.sr-b').value,s:+r.querySelector('.sr-s').value,rx:r.querySelector('.sr-rx').checked}));
  let y0=Math.max(1600,+$('sr-y0').value||1900),y1=Math.min(2400,+$('sr-y1').value||2100);if(y1<y0)[y0,y1]=[y1,y0];
  const jd0=jdOfMs(Date.UTC(y0,0,1)),jd1=jdOfMs(Date.UTC(y1,11,31,23,59));
  const out=$('sr-out'),btn=$('sr-go'),bar=$('sr-bar');btn.disabled=true;btn.textContent='⏳ ვეძებ…';bar.style.display='block';
  setTimeout(()=>{
    let res;try{res=scan(conds,jd0,jd1,f=>{bar.firstChild.style.width=(f*100).toFixed(0)+'%';});}
    catch(e){out.innerHTML='<div class="sr-sum">შეცდომა: '+e.message+'</div>';}
    finally{btn.disabled=false;btn.textContent='🔎 ძებნა ✦';bar.style.display='none';}
    if(!res)return;
    const now=jdOfMs(Date.now());
    const label=conds.map(c=>{const B=BODIES.find(x=>x[0]===c.b);return `${B[2]} ${B[1]} ${sfx(SIGNS[c.s],'ში')}${c.rx?' ℞':''}`;}).join(' + ');
    if(!res.length){out.innerHTML=`<div class="sr-sum"><b>${label}</b><br>${y0}–${y1} წლებში ასეთი კომბინაცია არ ყოფილა და არ იქნება.</div>`;return;}
    const nextI=res.findIndex(r=>r[0]>now);
    const total=res.reduce((a,r)=>a+(r[1]-r[0]),0),fast=conds.some(c=>c.b==='moon');
    out.innerHTML=`<div class="sr-sum"><b>${label}</b><br>${y0}–${y1}: <b>${res.length}</b> პერიოდი · სულ ${dur(total)}
      ${nextI>=0?` · შემდეგი: <b>${fmt(res[nextI][0])}</b>`:''}<br><span style="font-size:11px">დრო — ${tz}. დრო მიახლოებითია: ჩვეულებრივ ± წუთები–საათები; ნელ პლანეტებზე (ურანი–პლუტონი) და შორეულ საუკუნეებში — ± რამდენიმე დღემდე. ზუსტი მომენტისთვის გახსენი „რუკა →“.</span></div>
      <div class="sr-list">${res.map((r,i)=>{const isNow=r[0]<=now&&now<=r[1],past=r[1]<now;
        const tag=isNow?['ახლა','#5fc8b0']:past?['წარსული','rgba(196,176,148,.6)']:['მომავალი','#C9A24C'];
        return `<div class="sr-it ${isNow?'now':i===nextI?'next':''}" data-i="${i}"><span class="sr-tag" style="color:${tag[1]};border-color:${tag[1]}">${tag[0]}</span>
          <div>${fmt(r[0],true)} — ${r[2]?'…':fmt(r[1],true)}<div class="d">${dur(r[1]-r[0])}</div></div>
          <button type="button" class="sr-go" data-jd="${(r[0]+r[1])/2}">რუკა →</button></div>`;}).join('')}</div>`;
    out.querySelectorAll('.sr-go').forEach(b=>b.onclick=()=>openChart(+b.dataset.jd));
    const ne=out.querySelector('.sr-it.now')||out.querySelector('.sr-it.next');if(ne)ne.scrollIntoView({block:'nearest'});
  },30);
}
/* open a transit chart for that moment (natal form keeps the user's own data) */
function openChart(jd){
  const p={};new Intl.DateTimeFormat('en-GB',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})
    .formatToParts(new Date(msOfJd(jd))).forEach(x=>{if(x.type!=='literal')p[x.type]=+x.value;});
  const lat=+(($('n-lat')||{}).value)||41.7151,lon=+(($('n-lon')||{}).value)||44.8271;
  (async()=>{try{
    const d=await fetchChart({year:p.year,month:p.month,day:p.day,hour:p.hour,minute:p.minute,second:0,lat,lon,tz_name:tz,time_unknown:false});
    d._timeUnknown=false;showSingleChart(d,`🔎 ${pad(p.day)}.${pad(p.month)}.${p.year} ${pad(p.hour)}:${pad(p.minute)}`,false);
  }catch(e){showError(e.message);}})();
}
function boot(){try{inject();}catch(e){console.warn('search.js',e);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window._search={lon,scan,ok};
})();
