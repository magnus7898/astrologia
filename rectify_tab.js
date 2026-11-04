/* rectify_tab.js — „რექტიფიკაცია“ (birth-time rectification by life events), astro.html, ნატალური group.
   Birth date + place + a time window + dated events → every candidate minute in the window is scored:
     • primary directions — Naibod key (0.98565° of RA per year): directed MC and ASC (from the
       directed RAMC) to the natal planets ☌ □ ☍ (△ ⚹ half weight), orb 1°
     • solar arc — ASC/MC + arc to natal planets, and natal planets + arc to ASC/MC, orb 1°
     • secondary progressed Moon (day-for-a-year) to ASC/MC/DSC/IC, orb 1°
     • transits on the event day: ♃ ♄ ♅ ♆ ♇ (and ♂) over ASC/MC/DSC/IC, orb 1.5° (♃ ♄) / 1° (others)
     • annual profection (whole signs from ASC): the year's house matches the event's houses
   Hits on the event's own planets/angles count more; a tighter orb counts more.
   Ephemeris: Astronomy Engine 2.1.19 (apparent geocentric, ecliptic of date); angles from GAST.  */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const AE_URL='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
let A=null;
const needAE=()=>A?Promise.resolve(A):new Promise((ok,no)=>{if(window.Astronomy){A=window.Astronomy;return ok(A);}const s=document.createElement('script');s.src=AE_URL;s.onload=()=>{A=window.Astronomy;ok(A);};s.onerror=()=>no(new Error('astronomy-engine'));document.head.appendChild(s);});
const D2R=Math.PI/180,R2D=180/Math.PI,n360=x=>((x%360)+360)%360,sep=(a,b)=>{const d=Math.abs(n360(a-b));return d>180?360-d:d;};
const sd=a=>Math.sin(a*D2R),cd=a=>Math.cos(a*D2R),td=a=>Math.tan(a*D2R);
const SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const SGG=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(x=>x+'︎');
const PL=[['Sun','☉','მზე'],['Moon','☽','მთვარე'],['Mercury','☿','მერკური'],['Venus','♀','ვენერა'],['Mars','♂','მარსი'],['Jupiter','♃','იუპიტერი'],['Saturn','♄','სატურნი'],['Uranus','♅','ურანი'],['Neptune','♆','ნეპტუნი'],['Pluto','♇','პლუტონი']];
const PG=Object.fromEntries(PL.map(p=>[p[0],p[1]]));
const ANG={ASC:'ASC',MC:'MC',DSC:'DSC',IC:'IC'};
/* event types: Georgian name, key planets, key angles, profection houses */
const EV={
 marriage:['ქორწინება / სერიოზული კავშირი',['Venus','Jupiter','Sun','Moon'],['DSC','ASC'],[7,5,1]],
 divorce:['განქორწინება / დაშორება',['Uranus','Saturn','Mars','Pluto'],['DSC','ASC'],[7,8,12]],
 child:['შვილის დაბადება',['Jupiter','Moon','Venus','Sun'],['ASC','IC'],[5,11,1]],
 death_f:['მამის გარდაცვალება',['Saturn','Sun','Pluto','Mars'],['IC','MC'],[4,10,8]],
 death_m:['დედის გარდაცვალება',['Saturn','Moon','Pluto','Mars'],['MC','IC'],[10,4,8]],
 move:['გადასვლა / ემიგრაცია',['Uranus','Moon','Jupiter','Mercury'],['IC','ASC'],[4,9,3]],
 career:['კარიერული აღმასვლა / სამსახური',['Sun','Jupiter','Saturn','Mars'],['MC'],[10,6,2]],
 crisis:['ავარია / ოპერაცია / ტრავმა',['Mars','Uranus','Saturn','Pluto'],['ASC','MC'],[1,6,8,12]],
 study:['სწავლის დაწყება / დასრულება',['Mercury','Jupiter','Saturn'],['MC','ASC'],[9,3,10]],
 other:['სხვა მნიშვნელოვანი მოვლენა',['Sun','Moon','Mars','Jupiter','Saturn','Uranus','Pluto'],['ASC','MC','DSC','IC'],[1,4,7,10]]};
const W0={pd:3,sa:2.5,pm:1.6,tr:2,pf:1};let W={...W0};

/* ── time / angles ── */
function tzOffMin(tz,ms){try{const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const p={};f.formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);const u=new Date(0);u.setUTCFullYear(+p.year,+p.month-1,+p.day);u.setUTCHours(+p.hour%24,+p.minute,+p.second,0);return (u.getTime()-ms)/60000;}catch(e){return 0;}}
function localUT(y,m,d,h,mi,tz){const g=new Date(0);g.setUTCFullYear(y,m-1,d);g.setUTCHours(h,mi,0,0);const G=g.getTime();let t=G-tzOffMin(tz,G)*60000;t=G-tzOffMin(tz,t)*60000;return t/864e5-10957.5;}  /* days from J2000 */
const ascOf=(ramc,eps,lat)=>n360(Math.atan2(cd(ramc),-(sd(ramc)*cd(eps)+td(lat)*sd(eps)))*R2D);
const mcOf=(ramc,eps)=>n360(Math.atan2(sd(ramc),cd(ramc)*cd(eps))*R2D);
function angles(ut,lat,lon){const t=A.MakeTime(ut),eps=A.e_tilt(t).tobl,ramc=n360(A.SiderealTime(t)*15+lon);return {ramc,eps,asc:ascOf(ramc,eps,lat),mc:mcOf(ramc,eps)};}
const plon=(b,ut)=>n360(A.Ecliptic(A.GeoVector(b,A.MakeTime(ut),true)).elon);
const fourAng=(asc,mc)=>({ASC:asc,MC:mc,DSC:n360(asc+180),IC:n360(mc+180)});

/* ── scoring one candidate time ── */
const ASP=[[0,1,'☌'],[90,1,'□'],[180,1,'☍'],[120,.5,'△'],[60,.5,'⚹']];
function aspHit(a,b,orb){const d=sep(a,b);for(const [ang,w,sym] of ASP){const o=Math.abs(d-ang);if(o<=orb)return {o,w,sym};}return null;}
function scoreCandidate(C,ctx){
  const {lat,events,natal,arcs,trans,moonAt}=ctx;
  const ang=angles(C,lat,ctx.lon),A4=fourAng(ang.asc,ang.mc);
  const N={...natal};N.Moon=moonAt(C);                                   /* the Moon moves ~0.5°/h inside the window */
  let total=0;const per=[];
  events.forEach((ev,i)=>{
    const T=EV[ev.type],key=new Set(T[1]),keyA=new Set(T[2]);const hits=[];
    /* relevance: the event's own planets / angles count fully, the rest a little */
    const rel=(p,a)=>(key.has(p)?1:0.35)*(keyA.has(a)?1:0.6);
    const age=(ev.ut-C)/365.2422;if(age<0)return per.push({s:0,hits:['მოვლენა დაბადებამდეა']});
    const best={};const put=(tech,v,txt)=>{(best[tech]=best[tech]||[]).push([v,txt]);};
    const HARD=[[0,'☌'],[90,'□'],[180,'☍']];
    const hard=(a,b,orb)=>{const d=sep(a,b);for(const [g,sym] of HARD){const o=Math.abs(d-g);if(o<=orb)return {o,sym};}return null;};
    /* primary directions (Naibod) — directed ASC/MC to natal planets */
    const rD=n360(ang.ramc+age*0.98565),dA={ASC:ascOf(rD,ang.eps,lat),MC:mcOf(rD,ang.eps)};
    for(const a of ['ASC','MC'])for(const [p] of PL){const h=hard(dA[a],N[p],1);if(h)put('pd',W.pd*(1-h.o)*rel(p,a==='ASC'?(keyA.has('DSC')?'DSC':'ASC'):(keyA.has('IC')?'IC':'MC')),`პრიმ. დირექცია ${a} ${h.sym} ${PG[p]}︎ (${h.o.toFixed(2)}°)`);}
    /* solar arc — ASC/MC directed to planets, planets directed to the four angles */
    const arc=arcs[i];
    for(const a of ['ASC','MC'])for(const [p] of PL){const h=hard(n360(A4[a]+arc),N[p],1);if(h)put('sa',W.sa*(1-h.o)*rel(p,a==='ASC'?(keyA.has('DSC')?'DSC':'ASC'):(keyA.has('IC')?'IC':'MC')),`სოლარ-არკი ${a} ${h.sym} ${PG[p]}︎ (${h.o.toFixed(2)}°)`);}
    for(const [p] of PL)for(const a of ['ASC','MC','DSC','IC']){const o=sep(n360(N[p]+arc),A4[a]);if(o<=1)put('sa',W.sa*(1-o)*rel(p,a),`სოლარ-არკი ${PG[p]}︎ ☌ ${a} (${o.toFixed(2)}°)`);}
    /* progressed Moon to the angles (conjunction) */
    const pm=moonAt(C+age);for(const a of ['ASC','MC','DSC','IC']){const o=sep(pm,A4[a]);if(o<=1)put('pm',W.pm*(1-o)*(keyA.has(a)?1:0.6),`პროგრ. მთვარე ☌ ${a} (${o.toFixed(2)}°)`);}
    /* transits over the angles on the day */
    for(const [p,orb] of [['Jupiter',1.5],['Saturn',1.5],['Uranus',1],['Neptune',1],['Pluto',1],['Mars',0.7]])for(const a of ['ASC','MC','DSC','IC']){
      const o=sep(trans[i][p],A4[a]);if(o<=orb)put('tr',W.tr*(1-o/orb)*rel(p,a)*(p==='Mars'?0.6:1),`ტრანზიტი ${PG[p]}︎ ☌ ${a} (${o.toFixed(2)}°)`);}
    /* annual profection (whole signs) */
    const house=(Math.floor(age)%12)+1;if(T[3].includes(house))put('pf',W.pf*(T[3][0]===house?1:0.5),`პროფექცია: ${Math.floor(age)} წ. → ${house} სახლი (${SG[(Math.floor(ang.asc/30)+house-1)%12]})`);
    /* per technique only its best hit (plus a little for a second one) — no piling up of loose contacts */
    let s=0;for(const k in best){const L=best[k].sort((x,y)=>y[0]-x[0]);s+=L[0][0]+(L[1]?0.25*L[1][0]:0);hits.push(...L.slice(0,2));}
    const sc=s*ev.w;total+=sc;per.push({s:sc,hits:hits.sort((x,y)=>y[0]-x[0]).map(x=>x[1])});
  });
  return {C,total,per,asc:ang.asc,mc:ang.mc};
}

/* ── run ── */
async function run(){
  const out=$('rc-out'),btn=$('rc-go');
  const v=id=>+$(id).value;const y=v('rc-year'),m=v('rc-month'),d=v('rc-day');
  const lat=parseFloat($('rc-lat').value),lon=parseFloat($('rc-lon').value),tz=$('rc-tz').value||'UTC';
  if(!y||!m||!d){out.innerHTML='<div class="rc-err">შეიყვანეთ დაბადების თარიღი</div>';return;}
  if(!isFinite(lat)||!isFinite(lon)||(!lat&&!lon)){out.innerHTML='<div class="rc-err">შეიყვანეთ დაბადების ქალაქი</div>';return;}
  const events=[...document.querySelectorAll('#rc-evs .rc-ev')].map(r=>{const q=s=>r.querySelector(s).value;const ed=+q('.d'),em=+q('.m'),ey=+q('.y');
    return ey&&em&&ed?{type:q('.t'),w:+q('.w'),ut:localUT(ey,em,ed,12,0,tz),label:`${String(ed).padStart(2,'0')}.${String(em).padStart(2,'0')}.${ey}`}:null;}).filter(Boolean);
  if(events.length<3){out.innerHTML='<div class="rc-err">საჭიროა მინიმუმ 3 მოვლენა (უკეთესია 5–10)</div>';return;}
  W={};for(const k in W0){const c=document.querySelector(`#rc-tech [data-k=${k}]`);W[k]=c&&!c.checked?0:W0[k];}
  if(!Object.values(W).some(Boolean)){out.innerHTML='<div class="rc-err">ჩართეთ ერთი ტექნიკა მაინც</div>';return;}
  btn.disabled=true;btn.textContent='⏳ ვითვლი…';out.innerHTML='';
  try{
    await needAE();
    const [h1,m1]=$('rc-from').value.split(':').map(Number),[h2,m2]=$('rc-to').value.split(':').map(Number),step=v('rc-step')||4;
    let t0=localUT(y,m,d,h1||0,m1||0,tz),t1=localUT(y,m,d,h2||0,m2||0,tz);if(t1<=t0)t1+=1;
    const mid=(t0+t1)/2,natal={};for(const [p] of PL)natal[p]=plon(p,mid);
    const mc=new Map();const moonAt=ut=>{const k=Math.round(ut*1440/2);let x=mc.get(k);if(x==null){x=plon('Moon',k*2/1440);mc.set(k,x);}return x;};
    const arcs=events.map(ev=>{const age=(ev.ut-mid)/365.2422;return n360(plon('Sun',mid+age)-natal.Sun);});
    const trans=events.map(ev=>{const o={};for(const p of ['Jupiter','Saturn','Uranus','Neptune','Pluto','Mars'])o[p]=plon(p,ev.ut);return o;});
    const ctx={lat,lon,events,natal,arcs,trans,moonAt};
    const res=[];const n=Math.floor((t1-t0)*1440/step);
    for(let k=0;k<=n;k++){res.push(scoreCandidate(t0+k*step/1440,ctx));if(k%40===0)await new Promise(r=>setTimeout(r,0));}
    window._rectify.last=res;render(res,events,tz,{y,m,d,lat,lon,step});
  }catch(e){out.innerHTML=`<div class="rc-err">შეცდომა: ${e.message}</div>`;console.error(e);}
  finally{btn.disabled=false;btn.textContent='✦ რექტიფიკაცია ✦';}
}
function localHM(ut,tz){const ms=(ut+10957.5)*864e5;try{return new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(ms));}catch(e){return new Date(ms).toISOString().slice(11,16);}}
const dg=l=>`${SGG[Math.floor(l/30)]} ${Math.floor(l%30)}°${String(Math.floor((l%1)*60)).padStart(2,'0')}′`;
function render(res,events,tz,B){
  const out=$('rc-out');const max=Math.max(...res.map(r=>r.total),0.001);
  /* local maxima, best first, at least 12 min apart */
  const peaks=res.map((r,i)=>({...r,i})).filter((r,i,a)=>(i===0||r.total>=a[i-1].total)&&(i===a.length-1||r.total>=a[i+1].total)).sort((a,b)=>b.total-a.total);
  const top=[];for(const p of peaks){if(top.every(t=>Math.abs(t.C-p.C)*1440>=12))top.push(p);if(top.length>=6)break;}
  out.innerHTML=`<div class="rc-card"><div class="rc-h">ქულა დროის მიხედვით</div><canvas id="rc-cv"></canvas><div class="rc-sub">ჩრდილოვანი ზოლი — ASC ნიშნის საზღვარი · ყვითელი წერტილები — საუკეთესო დროები</div></div>
   <div class="rc-card"><div class="rc-h">საუკეთესო დროები</div>${top.map((t,k)=>`<div class="rc-top${k===0?' best':''}">
     <div class="rc-row"><b class="rc-t">${localHM(t.C,tz)}</b><span>ASC ${dg(t.asc)} · MC ${dg(t.mc)}</span><span class="rc-sc">${(100*t.total/max).toFixed(0)}%</span>
       <button type="button" class="ob-btn rc-use" data-k="${k}">↪ ნატალურში</button></div>
     <div class="rc-det">${events.map((ev,i)=>`<div><b>${ev.label} · ${EV[ev.type][0]}</b> — ${t.per[i].hits.length?t.per[i].hits.slice(0,4).join(' · '):'<span style="opacity:.55">დამთხვევა არ არის</span>'}</div>`).join('')}</div></div>`).join('')}
   <div class="rc-sub" style="margin-top:8px">⚠ ეს კანდიდატებია და არა პასუხი: ავტომატური ძებნა პოულობს წუთებს, სადაც მოვლენებს ბევრი ზუსტი კონტაქტი ემთხვევა — მაგრამ რამდენიმესაათიან შუალედში ასეთი დამთხვევები შემთხვევითაც ჩნდება. რაც მეტი (8–15) და ზუსტად დათარიღებული მოვლენაა და რაც ვიწროა შუალედი, მით სანდოა შედეგი. თითო კანდიდატი შეამოწმე ხელით — ტრუტინით, ტრანზიტებით და პიროვნების აღწერით.</div></div>`;
  out.querySelectorAll('.rc-row').forEach(r=>r.addEventListener('click',e=>{if(e.target.closest('button'))return;r.parentNode.classList.toggle('open');}));
  out.querySelectorAll('.rc-use').forEach(b=>b.onclick=()=>{const t=top[+b.dataset.k];const hm=localHM(t.C,tz).split(':');
    const s=(id,val)=>{const e=$(id);if(e)e.value=val;};s('n-day',B.d);s('n-month',B.m);s('n-year',B.y);s('n-hour',+hm[0]);s('n-minute',+hm[1]);
    s('n-lat',B.lat);s('n-lon',B.lon);s('n-tz',tz);const c=$('n-city'),rc=$('rc-city');if(c&&rc)c.value=rc.value;
    const tu=$('n-time-unknown');if(tu&&tu.checked){tu.checked=false;if(typeof toggleTU==='function')toggleTU('n');}
    if(typeof setMode==='function'){const nb=document.querySelector(".tab-bar .tab-btn[onclick*=\"'natal'\"]");if(nb)nb.click();else setMode('natal');}
    setTimeout(()=>{if(typeof generate==='function')generate();},80);});
  /* plot */
  const cv=$('rc-cv'),r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);cv.width=r.width*dpr;cv.height=r.height*dpr;const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const Wd=r.width,H=r.height,pl=34,pr=10,pt=10,pb=24,X=i=>pl+(Wd-pl-pr)*i/Math.max(1,res.length-1),Y=v=>pt+(H-pt-pb)*(1-v/max);
  g.fillStyle='#05040d';g.fillRect(0,0,Wd,H);
  for(let i=1;i<res.length;i++){if(Math.floor(res[i].asc/30)!==Math.floor(res[i-1].asc/30)){g.fillStyle='rgba(120,140,220,.18)';g.fillRect(X(i)-1,pt,2,H-pt-pb);
    g.fillStyle='rgba(180,195,240,.8)';g.font='12px serif';g.textAlign='left';g.fillText(SGG[Math.floor(res[i].asc/30)],X(i)+3,pt+12);}}
  g.strokeStyle='rgba(201,162,76,.25)';g.beginPath();g.moveTo(pl,H-pb);g.lineTo(Wd-pr,H-pb);g.stroke();
  g.fillStyle='rgba(232,214,174,.7)';g.font="11px 'Noto Sans Georgian',sans-serif";g.textAlign='center';
  const every=Math.max(1,Math.round(res.length/8));for(let i=0;i<res.length;i+=every)g.fillText(localHM(res[i].C,tz),X(i),H-7);
  const gr=g.createLinearGradient(0,pt,0,H-pb);gr.addColorStop(0,'rgba(240,206,120,.45)');gr.addColorStop(1,'rgba(240,206,120,0)');
  g.beginPath();res.forEach((q,i)=>{i?g.lineTo(X(i),Y(q.total)):g.moveTo(X(i),Y(q.total));});g.lineTo(X(res.length-1),H-pb);g.lineTo(X(0),H-pb);g.closePath();g.fillStyle=gr;g.fill();
  g.beginPath();res.forEach((q,i)=>{i?g.lineTo(X(i),Y(q.total)):g.moveTo(X(i),Y(q.total));});g.strokeStyle='#F0CE78';g.lineWidth=1.5;g.stroke();
  top.forEach((t,k)=>{g.fillStyle=k?'#ffd28a':'#fff3c4';g.beginPath();g.arc(X(t.i),Y(t.total),k?3.5:5,0,7);g.fill();});
}

/* ── UI ── */
const CSS=`
#form-rectify .rc-note{font-size:13px;line-height:1.6;color:rgba(240,232,214,.86);margin-bottom:10px}
#form-rectify .rc-row2{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin:8px 0}
#form-rectify .rc-row2 .field{margin:0}
#form-rectify .rc-row2 input{width:auto}
.rc-ev{display:grid;grid-template-columns:54px 54px 74px minmax(150px,1fr) 92px 30px;gap:6px;align-items:center;margin:5px 0}
.rc-ev input,.rc-ev select{width:100%!important;min-width:0}
.rc-ev .x{background:none;border:1px solid rgba(201,162,76,.35);color:#E3BE84;border-radius:6px;cursor:pointer;height:32px}
@media(max-width:620px){.rc-ev{grid-template-columns:48px 48px 64px 1fr 30px}.rc-ev .w{display:none}}
#form-rectify .ob-btn{background:rgba(201,162,76,.1);border:1px solid rgba(201,162,76,.45);color:#F0D48A;border-radius:16px;padding:7px 14px;font-size:13px;cursor:pointer;font-family:inherit}
.rc-out{margin-top:14px;display:grid;gap:12px}
.rc-ck{display:flex;align-items:center;gap:6px;font-size:12.5px!important;color:#EDE6D8!important;cursor:pointer;letter-spacing:0!important;text-transform:none!important;font-family:'Noto Sans Georgian',sans-serif!important}
.rc-ck input{width:15px!important;height:15px!important;accent-color:#C9A24C}
.rc-card{border:1px solid rgba(201,162,76,.25);border-radius:10px;padding:12px 14px;background:rgba(8,6,18,.5)}
.rc-h{font-family:Cinzel,'Noto Serif Georgian',serif;letter-spacing:2px;color:#E3BE84;font-size:12px;margin-bottom:8px}
#rc-cv{display:block;width:100%;height:190px;border-radius:6px}
.rc-sub{font-size:11.5px;color:rgba(188,192,202,.75);margin-top:6px;line-height:1.5}
.rc-err{color:#ff9a8a;font-size:13px;margin-top:10px}
.rc-top{border-bottom:1px solid rgba(255,255,255,.06);padding:7px 0}
.rc-top.best .rc-t{color:#FFF0C0}
.rc-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center;cursor:pointer;font-size:13px;color:#e2dccf}
.rc-t{font-family:Cinzel,serif;font-size:18px;color:#F3DDA4;min-width:62px}
.rc-sc{margin-left:auto;color:#F0CE78;font-weight:600}
.rc-det{display:none;font-size:12.5px;line-height:1.65;color:rgba(226,220,207,.85);margin-top:6px;padding-left:8px;border-left:2px solid rgba(201,162,76,.3)}
.rc-top.open .rc-det,.rc-top.best .rc-det{display:block}
.rc-det b{color:#F0E2BC;font-weight:600}`;
function evRow(){const r=document.createElement('div');r.className='rc-ev';
  r.innerHTML=`<input class="d" type="number" min="1" max="31" placeholder="დღე"><input class="m" type="number" min="1" max="12" placeholder="თვე"><input class="y" type="number" placeholder="წელი">
   <select class="t">${Object.entries(EV).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('')}</select>
   <select class="w" title="რამდენად ზუსტად გახსოვთ / რამდენად მნიშვნელოვანია"><option value="1.3">ძალიან მნიშვნ.</option><option value="1" selected>ჩვეულებრივი</option><option value="0.6">მიახლოებითი</option></select>
   <button type="button" class="x" title="წაშლა">✕</button>`;
  r.querySelector('.x').onclick=()=>r.remove();return r;}
function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');if(!bar||!card)return false;if($('form-rectify'))return true;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const after=$('tru-tab-btn')||bar.querySelector(".tab-btn[onclick*=\"'natal'\"]");
  const b=document.createElement('button');b.type='button';b.className='tab-btn';b.id='rc-tab-btn';b.textContent='რექტიფიკაცია';b.setAttribute('onclick',"setMode('rectify')");
  if(after)after.after(b);else bar.appendChild(b);
  const sec=document.createElement('div');sec.id='form-rectify';sec.className='form-section';
  sec.innerHTML=`<div class="person-label">🕰 დაბადების დროის რექტიფიკაცია ცხოვრების მოვლენებით</div>
   <div class="rc-note">შეიყვანეთ დაბადების თარიღი, ქალაქი, რაც შეიძლება ვიწრო დროის შუალედი და 8–15 ზუსტად დათარიღებული მოვლენა. თითოეული წუთი შუალედში მოწმდება პრიმარული დირექციებით (ნაიბოდი), სოლარ-არკით, პროგრესირებული მთვარით, ტრანზიტებით კუთხეებზე და პროფექციით.</div>
   <div class="form-grid"><div class="field"><label>დღე</label><input type="number" id="rc-day" min="1" max="31"></div><div class="field"><label>თვე</label><input type="number" id="rc-month" min="1" max="12"></div><div class="field"><label>წელი</label><input type="number" id="rc-year"></div></div>
   <div class="field" style="margin-bottom:8px"><label>ქალაქი</label><input id="rc-city" placeholder="თბილისი, London, Paris..." oninput="searchCity('rc')"><div class="city-hint" id="rc-city-hint"></div></div>
   <div class="form-grid-2" style="margin-bottom:4px"><div class="field"><label>განედი</label><input type="number" id="rc-lat" step="0.0001"></div><div class="field"><label>გრძედი</label><input type="number" id="rc-lon" step="0.0001"></div></div>
   <input type="hidden" id="rc-tz" value="UTC"><div class="tz-display" id="rc-tz-display" style="margin-bottom:8px">—</div>
   <div class="rc-row2"><div class="field"><label>შუალედი: დან</label><input type="time" id="rc-from" value="00:00"></div><div class="field"><label>მდე</label><input type="time" id="rc-to" value="23:59"></div>
     <div class="field"><label>ბიჯი</label><select id="rc-step"><option value="2">2 წთ</option><option value="4" selected>4 წთ</option><option value="10">10 წთ</option></select></div>
     <button type="button" class="ob-btn" id="rc-copy">⇩ ნატალური ფორმიდან</button></div>
   <div class="rc-row2" id="rc-tech" style="gap:14px">
     <label class="rc-ck"><input type="checkbox" data-k="pd" checked> პრიმარული დირექციები (ნაიბოდი)</label>
     <label class="rc-ck"><input type="checkbox" data-k="sa" checked> სოლარ-არკი</label>
     <label class="rc-ck"><input type="checkbox" data-k="pm" checked> პროგრესირებული მთვარე</label>
     <label class="rc-ck"><input type="checkbox" data-k="tr" checked> ტრანზიტები კუთხეებზე</label>
     <label class="rc-ck"><input type="checkbox" data-k="pf" checked> პროფექცია</label></div>
   <div class="person-sep"></div><div class="person-label person-b-label">📅 მოვლენები</div>
   <div id="rc-evs"></div><button type="button" class="ob-btn" id="rc-add" style="margin:6px 0 10px">+ მოვლენის დამატება</button>
   <button class="gen-btn" id="rc-go" type="button">✦ რექტიფიკაცია ✦</button>
   <div class="rc-out" id="rc-out"></div>`;
  card.insertBefore(sec,$('form-synastry')||null);
  const evs=$('rc-evs');for(let i=0;i<5;i++)evs.appendChild(evRow());
  $('rc-add').onclick=()=>evs.appendChild(evRow());
  $('rc-go').onclick=run;
  $('rc-copy').onclick=()=>{const c=(a,b)=>{const x=$(a),y=$(b);if(x&&y&&x.value!=='')y.value=x.value;};
    c('n-day','rc-day');c('n-month','rc-month');c('n-year','rc-year');c('n-city','rc-city');c('n-lat','rc-lat');c('n-lon','rc-lon');c('n-tz','rc-tz');
    const td=$('n-tz-display'),rd=$('rc-tz-display');if(td&&rd)rd.textContent=td.textContent;};
  return true;
}
function hook(){
  if(typeof window.setMode!=='function'||window.setMode._rc)return;
  const o=window.setMode;const w=function(m){const r=o.apply(this,arguments);
    if(m==='rectify')document.querySelectorAll('.tab-bar .tab-btn').forEach(b=>b.classList.toggle('active',b.id==='rc-tab-btn'));
    return r;};w._rc=true;for(const k in o)w[k]=o[k];window.setMode=w;
}
function boot(){if(!inject()){let n=0;const t=setInterval(()=>{if(inject()||++n>60)clearInterval(t);},250);}
  setTimeout(hook,0);window.addEventListener('load',()=>setTimeout(hook,70));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window._rectify={scoreCandidate,EV,run};
})();
