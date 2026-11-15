/* now_widgets.js — „ახლა“: four live mini-charts of the current moment on the home page.
   Left: astrology transit wheel + Human Design transit bodygraph. Right: Pythagorean square and
   Destiny Matrix of today's date. Wide screens: in the empty margins beside the main grid (two left,
   two right); narrower screens: one row under the grid. Click a card → the chart opens full screen.
   Astro/HD come from the MAGNUS backend (/chart, /api/hd_chart, painted human_prepared.svg);
   the square and the matrix are computed here from the date.                                     */
(function(){
'use strict';
const API='https://astrology-production-b165.up.railway.app';
const LAT=41.7151,LON=44.8271; // houses / ASC for Tbilisi
const TZ=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Tbilisi';}catch(e){return 'Asia/Tbilisi';}})();
const SG=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(s=>s+'︎');
const SN=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const SCOL=['#e0715a','#8fbf6a','#e6c65a','#6aa8d8'];// fire earth air water
const PG={'მზე':'☉','მთვარე':'☽','მერკური':'☿','ვენერა':'♀','მარსი':'♂','იუპიტერი':'♃','სატურნი':'♄','ურანი':'♅','ნეპტუნი':'♆','პლუტონი':'♇','ჩრდ. კვანძი':'☊','ქირონი':'⚷','ლილიტი':'⚸'};
const PCOL={'მზე':'#FFD36A','მთვარე':'#dfe6f2','მერკური':'#b9d98a','ვენერა':'#f2a7c3','მარსი':'#ff7a6a','იუპიტერი':'#f0b46a','სატურნი':'#c8b48a','ურანი':'#7fd6e8','ნეპტუნი':'#8aa8ff','პლუტონი':'#c58aff','ჩრდ. კვანძი':'#cfcfcf','ქირონი':'#9fd6a8','ლილიტი':'#b090c0'};
const HDC={Head:[64,61,63],Ajna:[47,24,4,17,11,43],Throat:[62,23,56,16,35,12,45,33,8,31,20],G:[1,2,7,10,13,15,25,46],Heart:[21,26,40,51],'Solar Plexus':[6,22,30,36,37,49,55],Spleen:[18,28,32,44,48,50,57],Sacral:[3,5,9,14,27,29,34,42,59],Root:[19,38,39,41,52,53,54,58,60]};
const HDC_KA={Head:'თავი',Ajna:'აჯნა',Throat:'ყელი',G:'G (მე)',Heart:'გული / ეგო','Solar Plexus':'მზის წნული',Spleen:'ელენთა',Sacral:'საკრალი',Root:'ფესვი'};
const CH=[[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],[37,40],[39,55],[42,53],[47,64]];
const P_KA={Sun:'მზე',Earth:'დედამიწა','North Node':'ჩრდ. კვანძი','South Node':'სამხ. კვანძი',Moon:'მთვარე',Mercury:'მერკური',Venus:'ვენერა',Mars:'მარსი',Jupiter:'იუპიტერი',Saturn:'სატურნი',Uranus:'ურანი',Neptune:'ნეპტუნი',Pluto:'პლუტონი'};
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const ds=n=>String(n).split('').reduce((a,d)=>a+(+d||0),0);
const r22=n=>{while(n>22)n=ds(n);return n;};
const fmtDeg=d=>{const s=Math.floor(d/30),x=d-s*30;return Math.floor(x)+'°'+pad(Math.floor((x%1)*60))+'′';};
const S={astro:null,hd:null,svg:null,err:{}};

/* ───────────── styles ───────────── */
function css(){if($('#nw-css'))return;const s=document.createElement('style');s.id='nw-css';s.textContent=`
.nw-moon{display:none;align-items:center;gap:14px;margin:0 auto 22px;padding:9px 18px 9px 12px;max-width:560px;width:max-content;
  background:linear-gradient(160deg,rgba(18,16,34,.92),rgba(8,8,18,.92));border:1px solid rgba(201,168,76,.28);border-radius:40px;
  cursor:pointer;text-decoration:none;color:#e8d5a0;transition:border-color .3s,box-shadow .3s}
.nw-moon:hover,.nw-moon:focus-visible{border-color:rgba(201,168,76,.6);box-shadow:0 0 22px rgba(201,168,76,.15);outline:none}
.nw-moon .em{font-size:30px;line-height:1;filter:drop-shadow(0 0 8px rgba(220,225,255,.35))}
.nw-moon .no{font-family:Cinzel,serif;font-size:26px;color:#FFD36A;min-width:30px;text-align:center}
.nw-moon .tx{display:flex;flex-direction:column;gap:2px;min-width:0}
.nw-moon .l1{font-family:Cinzel,'Noto Serif Georgian',serif;font-size:9.5px;letter-spacing:2.5px;color:#9ba8b8;text-transform:uppercase}
.nw-moon .l2{font-size:15px;color:#e8d5a0;white-space:nowrap}
.nw-moon .l3{font-size:11px;color:#9ba8b8;white-space:nowrap}
.nw-moon .bar{height:3px;border-radius:2px;background:rgba(255,255,255,.07);overflow:hidden;margin-top:3px;width:100%}
.nw-moon .bar i{display:block;height:100%;background:linear-gradient(90deg,#8a7cff,#FFD36A)}
@media(max-width:480px){.nw-moon{gap:10px;padding:8px 14px 8px 10px}.nw-moon .l2{font-size:13.5px}.nw-moon .l3{white-space:normal}}
.nw-side{position:absolute;z-index:3;display:flex;flex-direction:column;gap:16px;width:212px}
.nw-row{display:none;flex-wrap:wrap;justify-content:center;gap:14px;width:100%;max-width:1000px;margin:34px auto 0}
.nw-row .nw-card{flex:0 0 212px}
@media(max-width:940px){.nw-row{max-width:440px}}
@media(max-width:470px){.nw-row{max-width:230px}}
.nw-card{position:relative;background:linear-gradient(160deg,rgba(18,16,34,.92),rgba(8,8,18,.92));border:1px solid rgba(201,168,76,.28);border-radius:4px;padding:12px 12px 10px;cursor:pointer;transition:border-color .3s,transform .3s,box-shadow .3s;width:212px}
.nw-card:hover{border-color:rgba(201,168,76,.7);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.45),0 0 18px rgba(201,168,76,.12)}
.nw-card::before{content:'';position:absolute;top:7px;left:7px;width:9px;height:9px;border-top:1px solid rgba(201,168,76,.45);border-left:1px solid rgba(201,168,76,.45)}
.nw-card::after{content:'';position:absolute;bottom:7px;right:7px;width:9px;height:9px;border-bottom:1px solid rgba(201,168,76,.45);border-right:1px solid rgba(201,168,76,.45)}
.nw-h{font:600 10px 'Cinzel',serif;letter-spacing:2.5px;color:#c9a84c;text-transform:uppercase;text-align:center}
.nw-t{font:11px 'Noto Serif Georgian',serif;color:#e8d5a0;text-align:center;margin-top:3px;letter-spacing:.3px}
.nw-v{height:178px;margin-top:8px;display:flex;align-items:center;justify-content:center}
.nw-v svg{width:100%;height:100%}
.nw-s{font:11px 'Noto Serif Georgian',serif;color:#9ba8b8;text-align:center;margin-top:6px;min-height:15px;line-height:1.45}
.nw-live{display:inline-block;width:6px;height:6px;border-radius:50%;background:#7fe39a;margin-right:5px;vertical-align:1px;animation:nwp 2s infinite}
@keyframes nwp{0%,100%{opacity:1}50%{opacity:.25}}
.nw-load{font:11px 'Noto Serif Georgian',serif;color:#6f7890}
.nw-sq{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:168px}
.nw-sq div{aspect-ratio:1;border:1px solid rgba(201,168,76,.22);border-radius:3px;display:flex;align-items:center;justify-content:center;font:600 14px 'Cinzel',serif;color:#e8d5a0;background:rgba(255,255,255,.02);letter-spacing:1px;overflow:hidden}
.nw-sq div.e{color:rgba(232,213,160,.22);font-weight:400}
.nw-ov{position:fixed;inset:0;z-index:9999;background:rgba(3,3,9,.94);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;animation:nwf .3s ease}
@keyframes nwf{from{opacity:0}to{opacity:1}}
.nw-box{width:min(1180px,100%);max-height:100%;overflow:auto;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:28px;align-items:center}
@media(max-width:820px){.nw-box{grid-template-columns:1fr}}
.nw-big{display:flex;align-items:center;justify-content:center;height:min(80vh,720px)}
.nw-big svg{width:100%;height:100%}
.nw-info h2{font:400 24px 'Cinzel Decorative','Cinzel',serif;color:#e8d5a0;margin-bottom:4px}
.nw-info .sub{font:12px 'Noto Serif Georgian',serif;color:#9ba8b8;margin-bottom:14px}
.nw-info table{width:100%;border-collapse:collapse;font:13px 'Noto Serif Georgian',serif;color:#e8e2d5}
.nw-info td{padding:5px 6px;border-bottom:1px solid rgba(201,168,76,.12)}
.nw-info td.g{font-size:17px;width:28px;text-align:center}
.nw-info .tag{display:inline-block;margin:3px 4px 0 0;padding:3px 9px;border:1px solid rgba(201,168,76,.35);border-radius:999px;font:12px 'Noto Serif Georgian',serif;color:#e8d5a0}
.nw-info p{font:13.5px/1.75 'Noto Serif Georgian',serif;color:#d6cfbf;margin:8px 0}
.nw-go{display:inline-block;margin-top:16px;padding:9px 18px;border:1px solid #c9a84c;border-radius:999px;color:#f3dda4;text-decoration:none;font:13px 'Noto Serif Georgian',serif;background:rgba(201,168,76,.1)}
.nw-go:hover{background:rgba(201,168,76,.25)}
.nw-x{position:fixed;top:14px;right:18px;font-size:30px;line-height:1;color:#c9a84c;background:none;border:none;cursor:pointer;z-index:10000}
.nw-big .nw-sq{width:min(420px,80vw);gap:8px}.nw-big .nw-sq div{font-size:24px;flex-direction:column}
.nw-big .nw-sq div small{font:11px 'Noto Serif Georgian',serif;color:#9ba8b8;letter-spacing:0;margin-top:4px;font-weight:400}
`;document.head.appendChild(s);}

/* ───────────── astrology wheel ───────────── */
function wheel(d,big){
  const C=100,R1=97,R2=83,R3=big?60:58,asc=d.asc||0;
  const ang=deg=>(180+(deg-asc))*Math.PI/180;
  const P=(deg,r)=>[C+r*Math.cos(ang(deg)),C-r*Math.sin(ang(deg))];
  let s=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" font-family="'Noto Sans Symbols 2','Segoe UI Symbol','DejaVu Sans',sans-serif">`;
  s+=`<circle cx="${C}" cy="${C}" r="${R1}" fill="rgba(10,10,24,.6)" stroke="rgba(201,168,76,.55)" stroke-width=".7"/>`;
  for(let i=0;i<12;i++){const a0=i*30,a1=a0+30,[x0,y0]=P(a0,R1),[x1,y1]=P(a1,R1),[x2,y2]=P(a1,R2),[x3,y3]=P(a0,R2);
    s+=`<path d="M${x0},${y0} A${R1},${R1} 0 0 0 ${x1},${y1} L${x2},${y2} A${R2},${R2} 0 0 1 ${x3},${y3}Z" fill="${SCOL[i%4]}" fill-opacity=".13" stroke="rgba(201,168,76,.35)" stroke-width=".4"/>`;
    const [gx,gy]=P(a0+15,(R1+R2)/2);s+=`<text x="${gx}" y="${gy}" text-anchor="middle" dominant-baseline="central" font-size="8.5" fill="${SCOL[i%4]}">${SG[i]}</text>`;}
  s+=`<circle cx="${C}" cy="${C}" r="${R2}" fill="none" stroke="rgba(201,168,76,.4)" stroke-width=".5"/><circle cx="${C}" cy="${C}" r="${big?40:44}" fill="none" stroke="rgba(201,168,76,.18)" stroke-width=".4"/>`;
  if(Array.isArray(d.houses)&&d.houses.length>=12)d.houses.slice(0,12).forEach((h,i)=>{const [a,b]=P(h,big?40:44),[c2,e]=P(h,R2);s+=`<line x1="${a}" y1="${b}" x2="${c2}" y2="${e}" stroke="rgba(201,168,76,${i%3===0?.55:.16})" stroke-width="${i%3===0?.8:.4}"/>`;});
  // aspects (big view)
  const pl=Object.entries(d.planets||{}).filter(([n])=>PG[n]);
  if(big){const AS=[[0,'#FFD36A'],[60,'#7fb8ff'],[90,'#ff7a6a'],[120,'#7fe39a'],[180,'#ff7a6a']];
    for(let i=0;i<pl.length;i++)for(let j=i+1;j<pl.length;j++){if(['ჩრდ. კვანძი','ლილიტი','ქირონი'].includes(pl[i][0])||['ჩრდ. კვანძი','ლილიტი','ქირონი'].includes(pl[j][0]))continue;
      let df=Math.abs(pl[i][1].degree-pl[j][1].degree)%360;if(df>180)df=360-df;
      for(const [a,c] of AS){if(a&&Math.abs(df-a)<=(a===60?4:6)){const [x1,y1]=P(pl[i][1].degree,38),[x2,y2]=P(pl[j][1].degree,38);s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width=".55" opacity=".65"/>`;}}}}
  // spread glyphs
  const it=pl.map(([n,p])=>({n,deg:p.degree,a:p.degree})).sort((x,y)=>x.deg-y.deg),MIN=big?7.5:9;
  for(let k=0;k<40;k++){let mv=false;for(let i=0;i<it.length;i++){const a=it[i],b=it[(i+1)%it.length];let g=((b.a-a.a)+360)%360;if(it.length>1&&g<MIN){const sh=(MIN-g)/2;a.a-=sh;b.a+=sh;mv=true;}}if(!mv)break;}
  it.forEach(o=>{const p=d.planets[o.n],[tx,ty]=P(o.deg,R2),[tx2,ty2]=P(o.deg,R2-4),[gx,gy]=P(o.a,R3+ (big?8:6));
    s+=`<line x1="${tx}" y1="${ty}" x2="${tx2}" y2="${ty2}" stroke="${PCOL[o.n]}" stroke-width=".9"/>`;
    s+=`<text x="${gx}" y="${gy}" text-anchor="middle" dominant-baseline="central" font-size="${big?8.5:9.5}" fill="${PCOL[o.n]}">${PG[o.n]}</text>`;
    if(big){const [lx,ly]=P(o.a,R3-4);s+=`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-size="3.6" fill="#c8c2b2" font-family="Cinzel,serif">${Math.floor(p.degree%30)}°${p.retrograde?'℞':''}</text>`;}});
  // ASC / MC
  const [ax,ay]=P(asc,R1+1);s+=`<line x1="${C}" y1="${C}" x2="${ax}" y2="${ay}" stroke="rgba(255,211,106,.35)" stroke-width=".5"/>`;
  if(big){s+=`<text x="${ax-2}" y="${ay-3}" font-size="4.5" fill="#FFD36A" text-anchor="end" font-family="Cinzel,serif">ASC</text>`;
    if(d.mc!=null){const [mx,my]=P(d.mc,R1+1);s+=`<line x1="${C}" y1="${C}" x2="${mx}" y2="${my}" stroke="rgba(255,211,106,.25)" stroke-width=".5"/><text x="${mx}" y="${my-2}" font-size="4.5" fill="#FFD36A" text-anchor="middle" font-family="Cinzel,serif">MC</text>`;}}
  return s+'</svg>';}

/* ───────────── HD ───────────── */
function hdTransit(acts){
  const gates=new Set(acts.map(a=>a.gate)),chans=CH.filter(([a,b])=>gates.has(a)&&gates.has(b));
  const cen=new Set();chans.forEach(([a,b])=>{for(const [c,gs] of Object.entries(HDC)){if(gs.includes(a)||gs.includes(b))cen.add(c);}});
  return {gates,chans,cen};}
async function hdSvg(){
  if(!S.svg){const t=await fetch(API+'/static/human_prepared.svg').then(r=>{if(!r.ok)throw new Error('svg');return r.text();});S.svg=t;}
  const sv=document.importNode(new DOMParser().parseFromString(S.svg,'image/svg+xml').documentElement,true);
  sv.setAttribute('preserveAspectRatio','xMidYMid meet');sv.removeAttribute('width');sv.removeAttribute('height');sv.setAttribute('viewBox','420 40 580 780');
  const ss=sv.querySelector('#hd-activation');if(ss){if(!$('#hd-act-nw')){const st=document.createElement('style');st.id='hd-act-nw';st.textContent=ss.textContent;document.head.appendChild(st);}ss.remove();}
  sv.querySelectorAll('.detail-part').forEach(e=>e.style.setProperty('display','none','important'));
  return sv;}
async function hdDraw(host){
  const T=hdTransit(S.hd.personality||[]),sv=await hdSvg();
  T.gates.forEach(g=>sv.classList.add('active-p-'+g));T.cen.forEach(c=>sv.classList.add('center-active-'+c.replace(/ /g,'')));
  // integration channels (10-20, 10-34, 10-57, 20-34, 20-57, 34-57) are drawn by one of 256 .detail-part
  // variants in the SVG: n = s10*64 + s57*16 + s34*4 + s20 + 1 (1 = personality); transit = personality only
  const st=g=>T.gates.has(g)?1:0,n=st(10)*64+st(57)*16+st(34)*4+st(20)+1;
  sv.classList.add('detail-on-'+n);const dp=sv.querySelector(`.detail-part[data-detail="${n}"]`);if(dp)dp.style.setProperty('display','block','important');
  host.innerHTML='';host.appendChild(sv);return T;}

/* ───────────── numerology ───────────── */
function today(){const t=new Date();return {d:t.getDate(),m:t.getMonth()+1,y:t.getFullYear()};}
function pyth(){const {d,m,y}=today(),str=pad(d)+pad(m)+y,s1=ds(str),s2=ds(s1),d0=+(pad(d)[0]==='0'?pad(d)[1]:pad(d)[0]),s3=Math.abs(s1-2*d0),s4=ds(s3);
  const all=str+s1+s2+s3+s4,cnt={};for(let i=1;i<=9;i++)cnt[i]=0;for(const ch of all)if(ch>'0')cnt[ch]++;return {cnt,work:[s1,s2,s3,s4],str:`${pad(d)}.${pad(m)}.${y}`};}
const PY_ORD=[1,4,7,2,5,8,3,6,9],PY_LAB={1:'ხასიათი',2:'ენერგია',3:'ინტერესი',4:'ჯანმრთელობა',5:'ლოგიკა',6:'შრომა',7:'იღბალი',8:'მოვალეობა',9:'მეხსიერება'};
function pyGrid(big){const {cnt}=pyth();return `<div class="nw-sq">${PY_ORD.map(n=>`<div class="${cnt[n]?'':'e'}">${cnt[n]?String(n).repeat(cnt[n]):'—'}${big?`<small>${PY_LAB[n]}</small>`:''}</div>`).join('')}</div>`;}
function mx(){const {d,m,y}=today(),A=r22(d),B=m,C=r22(ds(y)),D=r22(A+B+C),E=r22(A+B+C+D);return {A,B,C,D,E,F:r22(A+B),G:r22(B+C),H:r22(C+D),I:r22(D+A)};}
function mxSvg(big){const v=mx(),c=100,r=74,rd=r*0.74;
  const pt={A:[c-r,c],B:[c,c-r],C:[c+r,c],D:[c,c+r],F:[c-rd,c-rd],G:[c+rd,c-rd],H:[c+rd,c+rd],I:[c-rd,c+rd],E:[c,c]};
  const col={A:'#b48aff',B:'#7fb8ff',C:'#ff8a8a',D:'#ff8a8a',E:'#FFD36A',F:'#c9a84c',G:'#c9a84c',H:'#c9a84c',I:'#c9a84c'};
  let s=`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">`;
  s+=`<polygon points="${['A','B','C','D'].map(k=>pt[k].join(',')).join(' ')}" fill="none" stroke="rgba(201,168,76,.5)" stroke-width=".8"/>`;
  s+=`<polygon points="${['F','G','H','I'].map(k=>pt[k].join(',')).join(' ')}" fill="none" stroke="rgba(201,168,76,.32)" stroke-width=".8"/>`;
  s+=`<line x1="${pt.A[0]}" y1="${c}" x2="${pt.C[0]}" y2="${c}" stroke="rgba(201,168,76,.18)" stroke-width=".5"/><line x1="${c}" y1="${pt.B[1]}" x2="${c}" y2="${pt.D[1]}" stroke="rgba(201,168,76,.18)" stroke-width=".5"/>`;
  for(const k of Object.keys(pt)){const [x,y]=pt[k],rr=k==='E'?15:11;s+=`<circle cx="${x}" cy="${y}" r="${rr}" fill="#0b0b18" stroke="${col[k]}" stroke-width="${k==='E'?1.4:1}"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Cinzel,serif" font-size="${k==='E'?12:9.5}" fill="${col[k]}" font-weight="600">${v[k]}</text>`;}
  if(big)[['A','დღე',-1],['B','თვე',0],['C','წელი',1],['D','კარმა',0]].forEach(([k,t,dx])=>{const [x,y]=pt[k];s+=`<text x="${x+dx*0}" y="${y+(k==='B'?-15:k==='D'?17:-14)}" text-anchor="middle" font-size="4.6" fill="#9ba8b8" font-family="'Noto Serif Georgian',serif">${t}</text>`;});
  return s+'</svg>';}

/* ───────────── cards ───────────── */
const CARDS=[
 {id:'astro',h:'ასტროლოგია',t:'ცა ახლა · ტრანზიტი',href:'astro.html'},
 {id:'hd',h:'ადამიანის დიზაინი',t:'ტრანზიტი ახლა',href:'hd.html'},
 {id:'py',h:'პითაგორა',t:'დღევანდელი კვადრატი',href:'pythagoras.html'},
 {id:'mx',h:'მატრიცა',t:'დღის მატრიცა',href:'matrix.html'}];
function cardHTML(c){return `<div class="nw-card" data-nw="${c.id}" role="button" tabindex="0" aria-label="${esc(c.h)} — ${esc(c.t)}"><div class="nw-h">${c.h}</div><div class="nw-t"><span class="nw-live"></span>${c.t}</div><div class="nw-v"><span class="nw-load">იტვირთება…</span></div><div class="nw-s"></div></div>`;}
function sunLine(){const d=S.astro;if(!d)return'';const s=d.planets['მზე'],m=d.planets['მთვარე'];return `☉ ${SG[Math.floor(s.degree/30)]} ${fmtDeg(s.degree)} · ☽ ${SG[Math.floor(m.degree/30)]} ${fmtDeg(m.degree)}`;}
async function fill(el){const id=el.dataset.nw,v=$('.nw-v',el),sub=$('.nw-s',el);
  try{
    if(id==='astro'){if(!S.astro)throw 0;v.innerHTML=wheel(S.astro,false);sub.textContent=sunLine();}
    else if(id==='hd'){if(!S.hd)throw 0;const T=await hdDraw(v);const sun=(S.hd.personality||[]).find(a=>a.planet==='Sun');sub.textContent=(sun?`☉ კარიბჭე ${sun.gate}.${sun.line}`:'')+(T.chans.length?` · ${T.chans.length} არხი`:'');}
    else if(id==='py'){const p=pyth();v.innerHTML=pyGrid(false);sub.textContent=`${p.str} · ${p.work.join('·')}`;}
    else if(id==='mx'){const m=mx();v.innerHTML=mxSvg(false);sub.textContent=`ცენტრი ${m.E} · დღე ${m.A} · თვე ${m.B}`;}
  }catch(e){v.innerHTML=`<span class="nw-load">${S.err[id]?'სერვერი არ პასუხობს':'იტვირთება…'}</span>`;}}
function fillAll(){document.querySelectorAll('.nw-card').forEach(fill);}

/* ───────────── full screen ───────────── */
async function open(id){const c=CARDS.find(x=>x.id===id);if(!c)return;
  const ov=document.createElement('div');ov.className='nw-ov';ov.innerHTML=`<button class="nw-x" aria-label="დახურვა">×</button><div class="nw-box"><div class="nw-big"></div><div class="nw-info"></div></div>`;
  document.body.appendChild(ov);document.body.style.overflow='hidden';
  const close=()=>{ov.remove();document.body.style.overflow='';document.removeEventListener('keydown',k);};
  const k=e=>{if(e.key==='Escape')close();};document.addEventListener('keydown',k);
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.classList.contains('nw-x'))close();});
  const big=$('.nw-big',ov),info=$('.nw-info',ov),now=new Date(),stamp=`${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  try{
  if(id==='astro'){const d=S.astro;if(!d)throw new Error();big.innerHTML=wheel(d,true);
    const rows=Object.entries(d.planets).filter(([n])=>PG[n]).map(([n,p])=>`<tr><td class="g" style="color:${PCOL[n]}">${PG[n]}</td><td>${n}</td><td>${SG[Math.floor(p.degree/30)]} ${SN[Math.floor(p.degree/30)]}</td><td>${fmtDeg(p.degree)}${p.retrograde&&!/კვანძი/.test(n)?' ℞':''}</td><td style="color:#9ba8b8">${p.house?p.house+' სახლი':''}</td></tr>`).join('');
    info.innerHTML=`<h2>ცა ახლა</h2><div class="sub">${stamp} · ასცენდენტი თბილისისთვის: ${SG[Math.floor(d.asc/30)]} ${fmtDeg(d.asc)}${d.lunar&&d.lunar.day?` · მთვარის ${d.lunar.day}-ე დღე`:''}</div><table>${rows}</table><a class="nw-go" href="${c.href}">გახსენი ასტროლოგიაში →</a>`;}
  else if(id==='hd'){if(!S.hd)throw new Error();const T=await hdDraw(big),acts=S.hd.personality||[];
    info.innerHTML=`<h2>HD ტრანზიტი</h2><div class="sub">${stamp} · პლანეტების ამჟამინდელი კარიბჭეები</div><table>${acts.map(a=>`<tr><td class="g">${esc(a.glyph||'')}</td><td>${P_KA[a.planet]||esc(a.planet)}</td><td><b style="color:#e8d5a0">${a.gate}.${a.line}</b></td></tr>`).join('')}</table>
    <p><b style="color:#e8d5a0">ღია არხები:</b> ${T.chans.length?T.chans.map(([a,b])=>`<span class="tag">${a}–${b}</span>`).join(''):'— (არცერთი)'}</p>
    <p><b style="color:#e8d5a0">განსაზღვრული ცენტრები:</b> ${T.cen.size?[...T.cen].map(x=>`<span class="tag">${HDC_KA[x]}</span>`).join(''):'—'}</p><a class="nw-go" href="hd.html">შენი გრაფიკი + ტრანზიტი →</a>`;}
  else if(id==='py'){const p=pyth();big.innerHTML=pyGrid(true);
    info.innerHTML=`<h2>დღის კვადრატი</h2><div class="sub">${p.str} · სამუშაო რიცხვები: ${p.work.join(' · ')}</div><p>პითაგორას (ფსიქომატრიცის) კვადრატი დღევანდელი თარიღისთვის — დღის „ხასიათი“: რომელი თვისებებია ძლიერი (ბევრი ციფრი) და რომელი სუსტი (ცარიელი უჯრა).</p>
    <table>${PY_ORD.map(n=>`<tr><td class="g" style="color:#e8d5a0">${n}</td><td>${PY_LAB[n]}</td><td>${p.cnt[n]?String(n).repeat(p.cnt[n]):'—'}</td></tr>`).join('')}</table><a class="nw-go" href="${c.href}">გამოთვალე შენი კვადრატი →</a>`;}
  else if(id==='mx'){const m=mx();big.innerHTML=mxSvg(true);
    if(!window.MX_ARCANA)await new Promise(r=>{const s=document.createElement('script');s.src='matrix_arcana.js';s.onload=s.onerror=r;document.head.appendChild(s);});
    const nm=n=>{const a=window.MX_ARCANA&&window.MX_ARCANA.find(x=>x.n===n);return a?a.t:'';},kw=n=>{const a=window.MX_ARCANA&&window.MX_ARCANA.find(x=>x.n===n);return a?a.k:'';};
    info.innerHTML=`<h2>დღის მატრიცა</h2><div class="sub">${pyth().str}</div>
    <table>${[['E','ცენტრი — დღის მთავარი ენერგია'],['A','დღე'],['B','თვე'],['C','წელი'],['D','ქვედა წერტილი']].map(([k,t])=>`<tr><td class="g" style="color:#FFD36A">${m[k]}</td><td>${t}</td><td><b style="color:#e8d5a0">${nm(m[k])}</b><br><span style="color:#9ba8b8;font-size:12px">${kw(m[k])}</span></td></tr>`).join('')}</table><a class="nw-go" href="${c.href}">გამოთვალე შენი მატრიცა →</a>`;}
  }catch(e){info.innerHTML=`<h2>${c.h}</h2><p>მონაცემები ჯერ არ ჩაიტვირთა — სცადე რამდენიმე წამში.</p>`;}}

/* ───────────── moon day (same convention as moon.html: tithi = elongation/12°) ───────────── */
const MD=['','ლამპარი','უხვობის რქა','ლეოპარდი','შემეცნების ხე','ერთრქა','წერო','ქარის ვარდი','ფენიქსი','ღამურა','შადრევანი','გვირგვინი','გული','ბორბალი','საყვირი','გველი','პეპელა','ზარი','სარკე','ობობა','არწივი','ცხენი','სპილო','ნიანგი','დათვი','კუ','გომბეშო','სამკაპი','ლოტოსი','რვაფეხა','ოქროს გედი'];
const PH={'New Moon':'ახალმთვარე','Waxing Crescent':'მზარდი ნამგალა','First Quarter':'პირველი მეოთხედი','Waxing Gibbous':'მზარდი მთვარე','Full Moon':'სავსემთვარე','Waning Gibbous':'კლებადი მთვარე','Last Quarter':'ბოლო მეოთხედი','Waning Crescent':'კლებადი ნამგალა'};
async function moonLoad(){const el=$('#nw-moon');if(!el)return;const t=new Date();
  try{const d=await fetch(`${API}/api/moon?date=${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}&time=${pad(t.getHours())}:${pad(t.getMinutes())}&timezone=${encodeURIComponent(TZ)}`).then(r=>r.json());
    if(!d||d.error)throw 0;S.moon=d;const n=d.tithi!=null?d.tithi:d.lunar_day,pc=d.tithi_pct!=null?d.tithi_pct:null;
    let nxt='';if(pc!=null){const h=(100-pc)/100*12/(360/29.53059)*24;nxt=` · ${n<30?(n+1)+'-ე':'1-ლი'} დღე ≈ ${h<1?Math.round(h*60)+' წთ-ში':Math.round(h)+' სთ-ში'}`;}
    el.innerHTML=`<span class="em">${d.emoji||'☽'}</span><span class="no">${n}</span><span class="tx"><span class="l1">მთვარის დღე · ახლა</span>
      <span class="l2">${n}-ე მთვარის დღე${MD[n]?' — <b style="color:#FFD36A;font-weight:500">'+esc(MD[n])+'</b>':''}</span>
      <span class="l3">${esc(PH[d.phase]||d.phase||'')} · განათება ${Math.round(d.illumination)}%${nxt}</span>
      ${pc!=null?`<span class="bar"><i style="width:${Math.max(2,Math.min(100,pc))}%"></i></span>`:''}</span>`;
    el.title=`მთვარის ${n}-ე დღე${pc!=null?' · '+pc.toFixed(1)+'% გავლილია':''}`;el.style.display='flex';
  }catch(e){el.style.display='none';}}

/* ───────────── layout ───────────── */
function mount(){
  // home page only — not on the group pages (index.html?g=astrology, ?g=courses …)
  if(new URLSearchParams(location.search).has('g'))return;
  const grid=document.querySelector('.grid.main4')||document.querySelector('.grid');if(!grid||$('#nw-left'))return;
  const page=grid.closest('.page')||document.body;
  const L=document.createElement('div');L.id='nw-left';L.className='nw-side';L.innerHTML=cardHTML(CARDS[0])+cardHTML(CARDS[1]);
  const R=document.createElement('div');R.id='nw-right';R.className='nw-side';R.innerHTML=cardHTML(CARDS[2])+cardHTML(CARDS[3]);
  const row=document.createElement('div');row.id='nw-row';row.className='nw-row';
  const mo=document.createElement('a');mo.id='nw-moon';mo.className='nw-moon';mo.href='moon.html?now=1';grid.parentNode.insertBefore(mo,grid);
  page.appendChild(L);page.appendChild(R);grid.parentNode.insertBefore(row,grid.nextSibling);
  if(getComputedStyle(page).position==='static')page.style.position='relative';
  const place=()=>{const gr=grid.getBoundingClientRect(),pr=page.getBoundingClientRect(),W=212,G=26;
    const room=Math.min(gr.left-pr.left,pr.right-gr.right);
    if(room>=W+G+8&&gr.width>0){[L,R].forEach(x=>{x.style.display='flex';if(x.parentNode!==page){page.appendChild(x);}});
      row.style.display='none';
      const top=gr.top-pr.top+Math.max(0,(gr.height-(178+92)*2-16)/2);
      L.style.top=R.style.top=top+'px';L.style.left=(gr.left-pr.left-W-G)+'px';R.style.left=(gr.right-pr.left+G)+'px';
      [...row.children].forEach(c=>(c.dataset.nw==='astro'||c.dataset.nw==='hd'?L:R).appendChild(c));}
    else{row.style.display='flex';[L,R].forEach(x=>x.style.display='none');
      ['astro','hd','py','mx'].forEach(id=>{const c=document.querySelector(`.nw-card[data-nw="${id}"]`);if(c&&c.parentNode!==row)row.appendChild(c);});}};
  place();addEventListener('resize',place);setTimeout(place,600);setTimeout(place,2000);
  const go=id=>{const c=CARDS.find(x=>x.id===id);if(c)location.href=c.href+'?now=1';};
  document.addEventListener('click',e=>{const c=e.target.closest('.nw-card');if(c)go(c.dataset.nw);});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('nw-card')){e.preventDefault();go(e.target.dataset.nw);}});
  fillAll();load();moonLoad();setInterval(load,10*60*1000);setInterval(moonLoad,10*60*1000);setInterval(()=>{['py','mx'].forEach(id=>{const c=document.querySelector(`.nw-card[data-nw="${id}"]`);if(c)fill(c);});},30*60*1000);}

async function load(){const t=new Date(),Y=t.getFullYear(),M=t.getMonth()+1,D=t.getDate(),h=t.getHours(),mi=t.getMinutes();
  const a=fetch(API+'/chart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({year:Y,month:M,day:D,hour:h,minute:mi,second:0,lat:LAT,lon:LON,tz_name:TZ,time_unknown:false})})
    .then(r=>r.json()).then(d=>{if(d&&d.planets){S.astro=d;S.err.astro=0;}else S.err.astro=1;}).catch(()=>{S.err.astro=1;});
  const b=fetch(API+'/api/hd_chart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date:`${Y}-${pad(M)}-${pad(D)}`,time:`${pad(h)}:${pad(mi)}`,lat:LAT,lon:LON,tz_name:TZ,place:''})})
    .then(r=>r.json()).then(d=>{if(d&&d.personality){S.hd=d;S.err.hd=0;}else S.err.hd=1;}).catch(()=>{S.err.hd=1;});
  await Promise.all([a,b]);['astro','hd'].forEach(id=>{const c=document.querySelector(`.nw-card[data-nw="${id}"]`);if(c)fill(c);});}

css();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.MAGNUS_NOW={state:()=>S,pyth,mx};
})();
