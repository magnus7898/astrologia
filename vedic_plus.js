/* vedic_plus.js — extra Jyotish tools for vedic.html (self-injecting)
   Load AFTER the page script, together with search.js (ephemeris) and ancient.js (BC dates):
     <script src="ancient.js"></script><script src="search.js"></script><script src="vedic_plus.js"></script>
   Tabs: ნატალი · დაშა (Vimshottari, 3 levels) · პანჩანგა · გოჩარა (transits + Sade Sati)
         · ვარშაფალი (Tajika annual chart, exact via backend) · შეთავსება (Ashtakoota, 36 guna)
         · ძებნა (graha in rashi / nakshatra, 3000 BC – 9999 AD)
   Sidereal = Lahiri, same as the backend (ayanamsa fitted to Swiss Ephemeris, ≤11″).        */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0'),n360=x=>((x%360)+360)%360,NAK=40/3,YR=365.2425;
let X=null;
/* ── names ── */
const RASHI=['მეშა','ვრიშაბჰა','მითჰუნა','კარკა','სიმჰა','კანია','ტულა','ვრიშჩიკა','დჰანუ','მაკარა','კუმბჰა','მინა'];
const RASHI_KA=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const NAKS=['აშვინი','ბჰარანი','კრიტიკა','როჰინი','მრიგაშირა','არდრა','პუნარვასუ','პუშია','აშლეშა','მაგჰა','პურვა ფალგუნი','უტარა ფალგუნი','ჰასტა','ჩიტრა','სვატი','ვიშაკჰა','ანურადჰა','ჯიეშთჰა','მულა','პურვა აშადჰა','უტარა აშადჰა','შრავანა','დჰანიშთა','შატაბჰიშა','პურვა ბჰადრაპადა','უტარა ბჰადრაპადა','რევატი'];
const G={sun:['მზე','სურია','☉','#f9c646'],moon:['მთვარე','ჩანდრა','☽','#c8d8f0'],mars:['მარსი','მანგალა','♂','#e84040'],mercury:['მერკური','ბუდჰა','☿','#50d890'],
  jupiter:['იუპიტერი','გურუ','♃','#e89040'],venus:['ვენერა','შუკრა','♀','#e878a8'],saturn:['სატურნი','შანი','♄','#90a8c8'],rahu:['რაჰუ','რაჰუ','☊','#9060d0'],
  ketu:['კეტუ','კეტუ','☋','#c06060'],uranus:['ურანი','ურანი','♅','#7ec8c8'],neptune:['ნეპტუნი','ნეპტუნი','♆','#6080e0'],pluto:['პლუტონი','პლუტონი','♇','#c9a08e']};
const GORD=['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu','uranus','neptune','pluto'];
const ENG={Sun:'sun',Moon:'moon',Mars:'mars',Mercury:'mercury',Jupiter:'jupiter',Venus:'venus',Saturn:'saturn',Rahu:'rahu',Ketu:'ketu',Uranus:'uranus',Neptune:'neptune'};
const gname=k=>`<span style="color:${G[k][3]}">${G[k][2]}︎</span> ${G[k][0]}`;
const fmtSid=l=>{l=n360(l);const s=Math.floor(l/30),d=l-s*30;return `${Math.floor(d)}°${pad(Math.floor((d%1)*60))}′ ${ZS[s]}︎ ${RASHI[s]}`;};
const nakOf=l=>{l=n360(l);const i=Math.floor(l/NAK);return{i,name:NAKS[i],pada:Math.floor((l-i*NAK)/(NAK/4))+1};};

/* ── ayanamsa (Lahiri) and sidereal longitudes ── */
const AYC=23.857094709196645;
function ayan(jdUT){const jd=jdUT+X.deltaT(jdUT)/86400,T=(jd-2451545)/36525;let l=X.precVec([1,0,0],T);const g=(5029.0966*T+1.11113*T*T)/3600;l+=Math.round((g-l)/360)*360;return AYC+l;}
function sid(k,jd){const key=k==='rahu'||k==='ketu'?'node':k,l=X.lon(key,jd);if(!isFinite(l))return NaN;return n360(l-ayan(jd)+(k==='ketu'?180:0));}
function retro(k,jd){if(k==='sun'||k==='moon')return false;if(k==='rahu'||k==='ketu')return true;const key=k;return n360(X.lon(key,jd+0.05)-X.lon(key,jd-0.05)+180)-180<0;}

/* ── dates ── */
const formTZ=()=>(($('tz_name')||{}).value)||'UTC';
function intlOff(ms,tz){const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);
  return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-ms;}
function localJD(y,m,d,h,mi,s,tz){
  if(window._anc&&window._anc.isHistYMD(y,m,d))return window._anc.localToJD(y,m,d,h,mi,s,tz);
  const g=Date.UTC(y,m-1,d,h,mi,s);let t=g-intlOff(g,tz);t=g-intlOff(t,tz);return t/864e5+2440587.5;}
function jdLocal(jd,tz){
  if(jd<2299160.5&&window._anc)return window._anc.jdToLocal(jd,tz);
  const ms=(jd-2440587.5)*864e5,p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date(ms)).forEach(x=>p[x.type]=+x.value);
  return{year:p.year,month:p.month,day:p.day,hour:p.hour%24,minute:p.minute,second:p.second};}
const yr=y=>y<0?`${-y} ძვ.წ.`:y;
const fD=(jd,tz)=>{const L=jdLocal(jd,tz||formTZ());return `${pad(L.day)}.${pad(L.month)}.${yr(L.year)}`;};
const fDT=(jd,tz)=>{const L=jdLocal(jd,tz||formTZ());return `${pad(L.day)}.${pad(L.month)}.${yr(L.year)} ${pad(L.hour)}:${pad(L.minute)}`;};
const nowJD=()=>Date.now()/864e5+2440587.5;
function birthJD(){const v=id=>+(($(id)||{}).value);const tu=($('time-unknown')||{}).checked;
  return localJD(v('year'),v('month'),v('day'),tu?12:v('hour')||0,tu?0:v('minute')||0,tu?0:v('second')||0,formTZ());}
function req(jd,lat,lon,tz){const L=jdLocal(jd,tz);return{year:L.year,month:L.month,day:L.day,hour:L.hour,minute:L.minute,second:L.second||0,lat,lon,tz_name:tz};}
async function vedicAt(body){const r=await fetch(`${BACKEND}/vedic`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json();if(d.error)throw new Error(d.error);return d;}
const natal=()=>{try{return _chartData;}catch(e){return null;}};

/* ── styles ── */
const CSS=`
#vp-tabs{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 auto 14px;max-width:760px}
#vp-tabs button{background:rgba(10,8,30,.7);border:1px solid rgba(61,42,138,.6);border-radius:18px;color:var(--dim,#8a80b0);padding:6px 14px;font-size:11.5px;font-family:'Cinzel',serif;letter-spacing:1px;cursor:pointer}
#vp-tabs button.on{color:var(--gold-l,#f0d48a);border-color:rgba(201,168,76,.6);background:rgba(45,31,110,.35)}
#vp-out{max-width:980px;margin:0 auto 30px;display:none}
.vp-card{background:rgba(10,8,30,.55);border:1px solid rgba(61,42,138,.45);border-radius:14px;padding:14px 16px;margin-bottom:12px}
.vp-card h3{font-family:'Cinzel',serif;font-weight:400;font-size:12px;letter-spacing:2px;color:var(--gold,#c9a84c);margin:0 0 10px}
.vp-card table{width:100%;border-collapse:collapse;font-size:12.5px}
.vp-card th{font-weight:400;font-size:10.5px;color:rgba(201,168,76,.8);text-align:left;padding:6px 8px;border-bottom:1px solid rgba(61,42,138,.5)}
.vp-card td{padding:6px 8px;border-bottom:1px solid rgba(61,42,138,.2);color:var(--txt,#e8e0ff);vertical-align:top}
.vp-card tr.cur td{background:rgba(201,168,76,.12)}
.vp-card tr.click{cursor:pointer}.vp-card tr.click:hover td{background:rgba(109,40,217,.15)}
.vp-sum{font-size:13px;line-height:1.8;color:var(--txt,#e8e0ff)}.vp-sum b{color:var(--gold-l,#f0d48a);font-weight:500}
.vp-note{font-size:11px;color:var(--dim,#8a80b0);line-height:1.6;margin-top:8px}
.vp-row{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end;margin-bottom:10px}
.vp-row .field{min-width:70px;flex:0 0 auto}.vp-row input,.vp-row select{max-width:150px}
.vp-btn{background:rgba(109,40,217,.25);border:1px solid rgba(201,168,76,.5);color:var(--gold-l,#f0d48a);border-radius:10px;padding:8px 16px;font-size:12px;cursor:pointer;font-family:inherit}
.vp-big{font-family:'Cinzel',serif;font-size:30px;color:var(--gold-l,#f0d48a);text-align:center}
.vp-bar{height:8px;border-radius:4px;background:rgba(255,255,255,.06);overflow:hidden}.vp-bar i{display:block;height:100%;background:linear-gradient(90deg,#7c3aed,#c9a84c)}
.vp-tag{font-size:10px;padding:1px 7px;border-radius:9px;border:1px solid}
.vp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:640px){.vp-grid2{grid-template-columns:1fr}}
#vp-out .chart-svg{width:min(520px,92vw);height:min(520px,92vw);display:block;margin:0 auto}`;

/* ═══════════ DASHA ═══════════ */
const DL=['ketu','venus','sun','moon','mars','rahu','jupiter','saturn','mercury'],DY=[7,20,6,10,7,18,16,19,17];
function dashas(moonSid,bjd){
  const ni=Math.floor(n360(moonSid)/NAK),li=ni%9,frac=(n360(moonSid)-ni*NAK)/NAK;
  const start=bjd-frac*DY[li]*YR,out=[];let t=start;
  for(let c=0;c<18;c++){const L=(li+c)%9,len=DY[L]*YR,ants=[];let ta=t;
    for(let a=0;a<9;a++){const A=(L+a)%9,al=DY[L]*DY[A]/120*YR,prs=[];let tp=ta;
      for(let p=0;p<9;p++){const P=(A+p)%9,pl=al*DY[P]/120;prs.push({l:DL[P],s:tp,e:tp+pl});tp+=pl;}
      ants.push({l:DL[A],s:ta,e:ta+al,prs});ta+=al;}
    out.push({l:DL[L],s:t,e:t+len,ants});t+=len;if(t>bjd+125*YR)break;}
  return{list:out,balance:(1-frac)*DY[li],lord:DL[li],nak:ni};
}
let OPEN=null;
function renderDasha(){
  const d=natal(),o=$('vp-out');if(!d)return needNatal();
  const bjd=birthJD(),D=dashas(d.planets.Moon.sidereal,bjd),now=nowJD(),tz=formTZ();
  const cur=D.list.find(m=>m.s<=now&&now<m.e),ca=cur&&cur.ants.find(a=>a.s<=now&&now<a.e),cp=ca&&ca.prs.find(p=>p.s<=now&&now<p.e);
  const nk=nakOf(d.planets.Moon.sidereal);
  o.innerHTML=`<div class="vp-card"><h3>ვიმშოტარი დაშა</h3><div class="vp-sum">
    დაბადებისას მთვარე: <b>${nk.name}</b> (პადა ${nk.pada}) → პირველი დაშა <b>${G[D.lord][0]}</b>, დარჩენილი <b>${D.balance.toFixed(2)}</b> წელი.<br>
    ${cur?`ახლა: მაჰადაშა <b>${gname(cur.l)}</b> (${fD(cur.s,tz)} – ${fD(cur.e,tz)})${ca?` · ანტარდაშა <b>${gname(ca.l)}</b> (${fD(ca.s,tz)} – ${fD(ca.e,tz)})`:''}${cp?` · პრატიანტარა <b>${gname(cp.l)}</b> (მდე ${fD(cp.e,tz)})`:''}`:'ახლა — დაშების 120-წლიანი ციკლის გარეთ.'}</div>
    <div class="vp-note">მაჰადაშაზე დაჭერა ანტარდაშებს გახსნის, ანტარდაშაზე — პრატიანტარებს. წელი = 365.2425 დღე.</div></div>
   <div class="vp-card"><table><tr><th>მაჰადაშა</th><th>დასაწყისი</th><th>დასასრული</th><th>წლები</th></tr>
   ${D.list.map((m,i)=>{const isC=m===cur;let h=`<tr class="click ${isC?'cur':''}" data-m="${i}"><td>${gname(m.l)}</td><td>${fD(m.s,tz)}</td><td>${fD(m.e,tz)}</td><td>${((m.e-m.s)/YR).toFixed(1)}</td></tr>`;
     if(OPEN&&OPEN.m===i)h+=m.ants.map((a,j)=>{const aC=a.s<=now&&now<a.e;let r=`<tr class="click ${aC?'cur':''}" data-m="${i}" data-a="${j}"><td style="padding-left:26px">↳ ${gname(a.l)}</td><td>${fD(a.s,tz)}</td><td>${fD(a.e,tz)}</td><td>${((a.e-a.s)/30.44).toFixed(1)} თვე</td></tr>`;
       if(OPEN.a===j)r+=a.prs.map(p=>`<tr class="${p.s<=now&&now<p.e?'cur':''}"><td style="padding-left:50px;font-size:11.5px">· ${gname(p.l)}</td><td style="font-size:11.5px">${fD(p.s,tz)}</td><td style="font-size:11.5px">${fD(p.e,tz)}</td><td style="font-size:11.5px">${Math.round(p.e-p.s)} დღე</td></tr>`).join('');return r;}).join('');
     return h;}).join('')}</table></div>`;
  o.querySelectorAll('tr.click').forEach(tr=>tr.onclick=()=>{const m=+tr.dataset.m,a=tr.dataset.a!=null?+tr.dataset.a:null;
    if(a==null)OPEN=OPEN&&OPEN.m===m&&OPEN.a==null?null:{m,a:null};else OPEN=OPEN&&OPEN.a===a?{m,a:null}:{m,a};renderDasha();});
  if(!OPEN&&cur)OPEN={m:D.list.indexOf(cur),a:null};
}

/* ═══════════ PANCHANGA ═══════════ */
const TITHI=['პრატიპადა','დვიტია','ტრიტია','ჩატურთი','პანჩამი','შაშთი','საპტამი','აშტამი','ნავამი','დაშამი','ეკადაში','დვადაში','ტრაიოდაში','ჩატურდაში'];
const YOGA=['ვიშკუმბჰა','პრიტი','აიუშმან','საუბჰაგია','შობჰანა','ატიგანდა','სუკარმა','დჰრიტი','შულა','განდა','ვრიდჰი','დჰრუვა','ვიაგჰატა','ჰარშანა','ვაჯრა','სიდდჰი','ვიატიპატა','ვარიიანა','პარიგჰა','შივა','სიდდჰა','სადჰია','შუბჰა','შუკლა','ბრაჰმა','ინდრა','ვაიდჰრიტი'];
const KAR=['ბავა','ბალავა','კაულავა','ტაიტილა','გარაჯა','ვანიჯა','ვიშტი'];
const VARA=[['რავივარა','კვირა','sun'],['სომავარა','ორშაბათი','moon'],['მანგალავარა','სამშაბათი','mars'],['ბუდჰავარა','ოთხშაბათი','mercury'],['გურუვარა','ხუთშაბათი','jupiter'],['შუკრავარა','პარასკევი','venus'],['შანივარა','შაბათი','saturn']];
function panch(sunS,moonS,jd,tz){
  const el=n360(moonS-sunS),ti=Math.floor(el/12),k=Math.floor(el/6),yi=Math.floor(n360(sunS+moonS)/NAK);
  const tname=ti===14?'პურნიმა (სავსე მთვარე)':ti===29?'ამავასია (ახალი მთვარე)':TITHI[ti%15];
  const kar=k===0?'კიმსტუღნა':k>=57?['შაკუნი','ჩატუშპადა','ნაგა'][k-57]:KAR[(k-1)%7];
  const L=jdLocal(jd,tz),off=(localJD(L.year,L.month,L.day,12,0,0,tz)),wd=Math.floor(off+1.5)%7;
  const nk=nakOf(moonS);
  return{tithi:`${ti<15?'შუკლა':'კრიშნა'} ${ti%15+1} · ${tname}`,tpct:((el%12)/12*100).toFixed(0),paksha:ti<15?'მზარდი':'კლებადი',
    vara:VARA[(wd+7)%7],nak:nk,yoga:YOGA[yi],karana:kar,sunR:Math.floor(n360(sunS)/30),moonR:Math.floor(n360(moonS)/30),el};
}
function panchCard(title,P,dt){return `<div class="vp-card"><h3>${title}</h3><table>
  <tr><td>📅 თარიღი</td><td><b>${dt}</b></td></tr>
  <tr><td>🌗 ტითჰი</td><td>${P.tithi} <span class="vp-note">(${P.tpct}% გასული · ${P.paksha})</span></td></tr>
  <tr><td>☀ ვარა (დღე)</td><td>${P.vara[0]} — ${P.vara[1]} · მმართველი ${gname(P.vara[2])}</td></tr>
  <tr><td>⭐ ნაქშატრა</td><td>${P.nak.name}, პადა ${P.nak.pada} · მმართველი ${gname(DL[P.nak.i%9])}</td></tr>
  <tr><td>🧘 იოგა</td><td>${P.yoga}</td></tr>
  <tr><td>½ კარანა</td><td>${P.karana}</td></tr>
  <tr><td>☉ მზე / ☽ მთვარე</td><td>${ZS[P.sunR]}︎ ${RASHI[P.sunR]} · ${ZS[P.moonR]}︎ ${RASHI[P.moonR]}</td></tr></table></div>`;}
function renderPanch(){
  const o=$('vp-out'),d=natal(),tz=formTZ();
  const t=jdLocal(nowJD(),tz);
  o.innerHTML=`<div class="vp-card"><h3>პანჩანგა — ხუთი ელემენტი</h3><div class="vp-row">
    <div class="field"><label>დღე</label><input type="number" id="pc-d" value="${t.day}"></div><div class="field"><label>თვე</label><input type="number" id="pc-m" value="${t.month}"></div>
    <div class="field"><label>წელი</label><input type="number" id="pc-y" value="${t.year}"></div><div class="field"><label>სთ</label><input type="number" id="pc-h" value="${t.hour}"></div>
    <div class="field"><label>წთ</label><input type="number" id="pc-mi" value="${t.minute}"></div><button class="vp-btn" id="pc-go">გამოთვლა</button></div>
    <div class="vp-note">ტითჰი — მთვარის დღე (მთვარე–მზის 12° ნაბიჯი) · ვარა — კვირის დღე · ნაქშატრა — მთვარის ვარსკვლავეთი · იოგა — მზისა და მთვარის ჯამი · კარანა — ნახევარი ტითჰი. დრო — ფორმის სარტყლით (${tz}).</div></div>
    <div class="vp-grid2"><div id="pc-a"></div><div id="pc-b"></div></div>`;
  if(d){const P=panch(d.planets.Sun.sidereal,d.planets.Moon.sidereal,birthJD(),tz);$('pc-a').innerHTML=panchCard('დაბადებისას',P,fDT(birthJD(),tz));}
  else $('pc-a').innerHTML='<div class="vp-card vp-note">დაბადების პანჩანგისთვის ჯერ ნატალური რუკა შექმენი.</div>';
  const go=()=>{const v=id=>+$(id).value;const jd=localJD(v('pc-y'),v('pc-m'),v('pc-d'),v('pc-h'),v('pc-mi'),0,tz);
    $('pc-b').innerHTML=panchCard('არჩეული მომენტი',panch(sid('sun',jd),sid('moon',jd),jd,tz),fDT(jd,tz));};
  $('pc-go').onclick=go;go();
}

/* ═══════════ GOCHARA (transits) + SADE SATI ═══════════ */
function renderGochara(){
  const d=natal(),o=$('vp-out');if(!d)return needNatal();
  const tz=formTZ(),t=jdLocal(nowJD(),tz);
  o.innerHTML=`<div class="vp-card"><h3>გოჩარა — ტრანზიტები ნატალურ რუკაზე</h3><div class="vp-row">
    <div class="field"><label>დღე</label><input type="number" id="gc-d" value="${t.day}"></div><div class="field"><label>თვე</label><input type="number" id="gc-m" value="${t.month}"></div>
    <div class="field"><label>წელი</label><input type="number" id="gc-y" value="${t.year}"></div><button class="vp-btn" id="gc-go">გამოთვლა</button></div>
    <div id="gc-t"></div></div><div class="vp-card"><h3>საადე სატი · აშტამა შანი</h3><div id="gc-s"></div></div>`;
  const lag=d.asc_sign_idx,ms=d.planets.Moon.sign_idx;
  const go=()=>{const v=id=>+$(id).value;const jd=localJD(v('gc-y'),v('gc-m'),v('gc-d'),12,0,0,tz);
    const rows=GORD.map(k=>{const L=sid(k,jd);if(!isFinite(L))return '';const s=Math.floor(L/30),nk=nakOf(L),hL=(s-lag+12)%12+1,hM=(s-ms+12)%12+1;
      const nat=d.planets[Object.keys(ENG).find(e=>ENG[e]===k)],ns=nat?Math.floor(nat.sidereal/30):null;
      return `<tr><td>${gname(k)}${retro(k,jd)&&k!=='rahu'&&k!=='ketu'?' ℞':''}</td><td>${fmtSid(L)}</td><td>${nk.name} ${nk.pada}</td><td>${hL}</td><td>${hM}</td><td style="opacity:.7">${ns!=null?ZS[ns]+'︎ '+RASHI[ns]:''}</td></tr>`;}).join('');
    $('gc-t').innerHTML=`<table><tr><th>გრჰა</th><th>ტრანზიტი</th><th>ნაქშატრა</th><th>ბჰავა ლაგნიდან</th><th>მთვარიდან</th><th>ნატალურად</th></tr>${rows}</table>
      <div class="vp-note">ბჰავა — მთელი ნიშნის სისტემით: ლაგნიდან (${RASHI[lag]}) და მთვარიდან — ჩანდრა ლაგნა (${RASHI[ms]}). რაჰუ/კეტუ — საშუალო კვანძი.</div>`;};
  $('gc-go').onclick=go;go();
  /* Sade Sati over a lifetime: Saturn in 12th, 1st, 2nd from natal Moon; Ashtama: 8th */
  const bjd=birthJD(),end=bjd+100*YR,per=[];let cur=null;
  const phase=s=>{const r=(s-ms+12)%12;return r===11?1:r===0?2:r===1?3:r===7?8:0;};
  for(let jd=bjd;jd<=end;jd+=4){const p=phase(Math.floor(sid('saturn',jd)/30)),grp=p===8?'a':p?'s':null;
    if(!cur||cur.g!==grp){if(cur&&cur.g)per.push(cur);cur={g:grp,s:jd,e:jd,ph:new Set()};}
    cur.e=jd;if(p&&p!==8)cur.ph.add(p);}
  if(cur&&cur.g)per.push(cur);
  /* merge short retrograde gaps (< 1 year) */
  const M=[];for(const p of per){const last=M[M.length-1];if(last&&last.g===p.g&&p.s-last.e<365){last.e=p.e;p.ph.forEach(x=>last.ph.add(x));}else M.push(p);}
  const now=nowJD(),nowP=phase(Math.floor(sid('saturn',now)/30));
  $('gc-s').innerHTML=`<div class="vp-sum">ნატალური მთვარე: <b>${RASHI[ms]}</b>. ახლა: ${nowP===8?'<b>აშტამა შანი</b> (სატურნი მე-8-ში მთვარიდან)':nowP?`<b>საადე სატი, ${['','I ფაზა (აღმავალი)','II ფაზა (პიკი)','III ფაზა (დაღმავალი)'][nowP]}</b>`:'საადე სატი არ არის'}.</div>
    <table style="margin-top:8px"><tr><th>პერიოდი</th><th>დასაწყისი</th><th>დასასრული</th><th>ხანგრძლ.</th></tr>
    ${M.map(p=>`<tr class="${p.s<=now&&now<=p.e?'cur':''}"><td>${p.g==='s'?'🪐 საადე სატი':'⚠ აშტამა შანი'}</td><td>${fD(p.s,tz)}</td><td>${fD(p.e,tz)}</td><td>${((p.e-p.s)/YR).toFixed(1)} წ.</td></tr>`).join('')}</table>
    <div class="vp-note">საადე სატი — სატურნი ნატალური მთვარის წინა, იმავე და მომდევნო რაშიში (~7.5 წელი). აშტამა შანი — სატურნი მე-8 რაშიში მთვარიდან (~2.5 წელი). 100 წელი დაბადებიდან.</div>`;
}

/* ═══════════ VARSHAPHAL (Tajika annual chart) ═══════════ */
async function renderVarsha(){
  const d=natal(),o=$('vp-out');if(!d)return needNatal();
  const tz=formTZ(),by=+$('year').value,cy=jdLocal(nowJD(),tz).year;
  o.innerHTML=`<div class="vp-card"><h3>ვარშაფალი — წლიური რუკა (ტაჯიკა)</h3><div class="vp-row">
    <div class="field"><label>წელი</label><input type="number" id="vs-y" value="${cy}"></div><button class="vp-btn" id="vs-go">გამოთვლა</button></div>
    <div id="vs-out" class="vp-sum">⏳</div></div>`;
  const go=async()=>{const Y=+$('vs-y').value,out=$('vs-out');out.innerHTML='⏳ ზუსტი მომენტის ძებნა…';
    try{
      const S0=d.planets.Sun.sidereal,bjd=birthJD(),lat=d.lat,lon=d.lon;
      let t=bjd+(Y-by)*365.25636;
      for(let i=0;i<4;i++){const f=n360(sid('sun',t)-S0+180)-180;t-=f/0.98561;}
      let D=null;
      for(let i=0;i<3;i++){D=await vedicAt(req(t,lat,lon,tz));const f=n360(D.planets.Sun.sidereal-S0+180)-180;if(Math.abs(f)<2e-5)break;t-=f/0.98561;}
      const age=Y-by,mu=(d.asc_sign_idx+age)%12,muH=(mu-D.asc_sign_idx+12)%12+1;
      out.innerHTML=`<div class="vp-big">${fDT(t,tz)}</div>
        <div style="text-align:center;margin-bottom:8px">მზე ბრუნდება ნატალურ გრძედზე — ${fmtSid(S0)} · ${age} წლის · ${tz}</div>
        ვარშა ლაგნა: <b>${RASHI[D.asc_sign_idx]}</b> ${fmtSid(D.asc)} · მუნტჰა: <b>${RASHI[mu]}</b> (${muH}-ე ბჰავა)
        <svg id="vp-wheel" class="chart-svg" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg"></svg>
        <table><tr><th>გრჰა</th><th>პოზიცია</th><th>ბჰავა</th><th>ნაქშატრა</th></tr>
        ${Object.entries(D.planets).sort((a,b)=>GORD.indexOf(ENG[a[0]])-GORD.indexOf(ENG[b[0]])).map(([n,p])=>ENG[n]?`<tr><td>${gname(ENG[n])}${p.retrograde&&n!=='Rahu'&&n!=='Ketu'?' ℞':''}</td><td>${fmtSid(p.sidereal)}</td><td>${p.house}</td><td>${p.nakshatra?p.nakshatra.nakshatra_ka||p.nakshatra.nakshatra:''} ${p.nakshatra?p.nakshatra.pada:''}</td></tr>`:'').join('')}</table>
        <div class="vp-note">ვარშაფალი — რუკა იმ მომენტზე, როცა მზე (სიდერალურად) ნატალურ გრძედს უბრუნდება. მუნტჰა — ნატალური ლაგნა + გასული წლები. ადგილი — დაბადების ადგილი.</div>`;
      try{drawWheel(D,'vp-wheel');}catch(e){}
    }catch(e){out.textContent='შეცდომა: '+e.message;}};
  $('vs-go').onclick=go;go();
}

/* ═══════════ COMPATIBILITY — Ashtakoota (36 guna) ═══════════ */
const VARNA=s=>[2,1,0,3,2,1,0,3,2,1,0,3][s];   /* 3 Brahmin (water) 2 Kshatriya (fire) 1 Vaishya (earth) 0 Shudra (air) */
const VARNA_N=['შუდრა','ვაიშია','კშატრია','ბრაჰმანი'];
function vashya(L){const s=Math.floor(L/30),d=L%30;
  if(s===0||s===1)return 0;if(s===8)return d<15?1:0;if(s===9)return d<15?0:2;
  if(s===2||s===5||s===6||s===10)return 1;if(s===3||s===11)return 2;if(s===4)return 3;return 4;}
const VASHYA_N=['ჩატუშპადა (ოთხფეხა)','მანავა (ადამიანი)','ჯალაჩარა (წყლის)','ვანაჩარა (ველური)','კიტა (მწერი)'];
const VASHYA_T=[[2,1,1,0.5,1],[1,2,0.5,0,1],[1,0.5,2,1,1],[0.5,0,1,2,0],[1,1,1,0,2]];
const YONI_OF=[0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1];
const YONI_N=['ცხენი','სპილო','ცხვარი','გველი','ძაღლი','კატა','ვირთხა','ძროხა','კამეჩი','ვეფხვი','ირემი','მაიმუნი','მანგუსტი','ლომი'];
const YONI_T=[[4,2,2,3,2,2,2,1,0,1,3,3,2,1],[2,4,3,3,2,2,2,2,3,1,2,3,2,0],[2,3,4,2,1,2,1,3,3,1,2,0,3,1],[3,3,2,4,2,1,1,1,1,2,2,2,0,2],
  [2,2,1,2,4,2,1,2,2,1,0,2,1,1],[2,2,2,1,2,4,0,2,2,1,3,3,2,1],[2,2,1,1,1,0,4,2,2,2,2,2,1,2],[1,2,3,1,2,2,2,4,3,0,3,2,2,1],
  [0,3,3,1,2,2,2,3,4,1,2,2,2,1],[1,1,1,2,1,1,2,0,1,4,1,1,2,1],[3,2,2,2,0,3,2,3,2,1,4,2,2,1],[3,3,0,2,2,3,2,2,2,1,2,4,3,2],
  [2,2,3,0,1,2,1,2,2,2,2,3,4,2],[1,0,1,2,1,1,2,1,1,1,1,2,2,4]];
const LORD=['mars','venus','mercury','moon','sun','mercury','venus','mars','jupiter','saturn','saturn','jupiter'];
const FR={sun:{f:['moon','mars','jupiter'],e:['venus','saturn']},moon:{f:['sun','mercury'],e:[]},mars:{f:['sun','moon','jupiter'],e:['mercury']},
  mercury:{f:['sun','venus'],e:['moon']},jupiter:{f:['sun','moon','mars'],e:['mercury','venus']},venus:{f:['mercury','saturn'],e:['sun','moon']},saturn:{f:['mercury','venus'],e:['sun','moon','mars']}};
const rel=(a,b)=>a===b?'f':FR[a].f.includes(b)?'f':FR[a].e.includes(b)?'e':'n';
const GANA_OF=[0,1,2,1,0,1,0,0,2,2,1,1,0,2,0,2,0,2,2,1,1,0,2,2,1,1,0];   /* 0 Deva 1 Manushya 2 Rakshasa */
const GANA_N=['დევა (ღვთაებრივი)','მანუშია (ადამიანური)','რაკშასა (დემონური)'];
const GANA_T=[[6,6,0],[5,6,0],[1,0,6]];
const NADI_OF=i=>[0,1,2,2,1,0][i%6];const NADI_N=['ადი (ვატა)','მადჰია (პიტა)','ანტია (კაფა)'];
function guna(M,F){  /* M = groom moon sidereal, F = bride */
  const ms=Math.floor(M/30),fs=Math.floor(F/30),mn=Math.floor(M/NAK),fn=Math.floor(F/NAK),R=[];
  R.push(['ვარნა',1,VARNA(ms)>=VARNA(fs)?1:0,`${VARNA_N[VARNA(ms)]} / ${VARNA_N[VARNA(fs)]}`,'სულიერი დონე, პატივისცემა']);
  R.push(['ვაშია',2,VASHYA_T[vashya(M)][vashya(F)],`${VASHYA_N[vashya(M)]} / ${VASHYA_N[vashya(F)]}`,'ურთიერთმიზიდულობა, გავლენა']);
  const t1=((fn-mn+27)%27)%9,t2=((mn-fn+27)%27)%9,bad=x=>x===2||x===4||x===6;
  R.push(['ტარა',3,(bad(t1)?0:1.5)+(bad(t2)?0:1.5),`${t1+1} / ${t2+1}`,'ბედი, ჯანმრთელობა ერთად']);
  R.push(['იონი',4,YONI_T[YONI_OF[mn]][YONI_OF[fn]],`${YONI_N[YONI_OF[mn]]} / ${YONI_N[YONI_OF[fn]]}`,'ფიზიკური, სექსუალური თავსებადობა']);
  const a=LORD[ms],b=LORD[fs],r1=rel(a,b),r2=rel(b,a),k=[r1,r2].sort().join('');
  R.push(['გრაჰა მაიტრი',5,a===b?5:{ff:5,fn:4,nn:3,ef:1,en:0.5,ee:0}[k],`${G[a][0]} / ${G[b][0]}`,'გონებრივი თანხმობა, მეგობრობა']);
  R.push(['განა',6,GANA_T[GANA_OF[mn]][GANA_OF[fn]],`${GANA_N[GANA_OF[mn]]} / ${GANA_N[GANA_OF[fn]]}`,'ტემპერამენტი']);
  const dd=(fs-ms+12)%12+1,dr=(ms-fs+12)%12+1,bk=[[2,12],[12,2],[5,9],[9,5],[6,8],[8,6]].some(([x,y])=>x===dd&&y===dr);
  R.push(['ბჰაკუტი',7,bk?0:7,`${dd}/${dr}`,'ოჯახი, კეთილდღეობა, შვილები']);
  R.push(['ნადი',8,NADI_OF(mn)!==NADI_OF(fn)?8:0,`${NADI_N[NADI_OF(mn)]} / ${NADI_N[NADI_OF(fn)]}`,'ჯანმრთელობა, მემკვიდრეობა']);
  return R;
}
const mangal=d=>{const h=d.planets.Mars.house,hm=(d.planets.Mars.sign_idx-d.planets.Moon.sign_idx+12)%12+1,B=[1,2,4,7,8,12];return{lag:B.includes(h),moon:B.includes(hm),h,hm};};
/* one person's input block (p = 'a' | 'b') */
function personHTML(p,title,v){return `<div class="vp-card" style="margin:0"><h3>${title}</h3>
  <div class="vp-row"><div class="field" style="flex:1 1 140px"><label>სახელი</label><input id="cp${p}-name" value="${v.name||''}" style="max-width:none"></div>
    <div class="field"><label>სქესი</label><select id="cp${p}-sex"><option value="m"${v.sex==='m'?' selected':''}>კაცი</option><option value="f"${v.sex==='f'?' selected':''}>ქალი</option></select></div></div>
  <div class="vp-row"><div class="field"><label>დღე</label><input type="number" id="cp${p}-d" value="${v.d}" style="width:62px"></div><div class="field"><label>თვე</label><input type="number" id="cp${p}-m" value="${v.m}" style="width:62px"></div>
    <div class="field"><label>წელი</label><input type="number" id="cp${p}-y" value="${v.y}" style="width:84px"></div><div class="field"><label>სთ</label><input type="number" id="cp${p}-h" value="${v.h}" style="width:58px"></div>
    <div class="field"><label>წთ</label><input type="number" id="cp${p}-mi" value="${v.mi}" style="width:58px"></div></div>
  <div class="vp-row"><div class="field" style="flex:1 1 100%"><label>ქალაქი</label><input id="cp${p}-city" value="${v.city||''}" placeholder="თბილისი, Delhi…" style="max-width:none"></div></div>
  <div class="vp-row"><div class="field"><label>განედი</label><input type="number" id="cp${p}-lat" value="${v.lat}" style="width:90px"></div><div class="field"><label>გრძედი</label><input type="number" id="cp${p}-lon" value="${v.lon}" style="width:90px"></div>
    <div class="field"><label>სარტყელი</label><input id="cp${p}-tz" value="${v.tz}" style="width:130px"></div></div>
  <div id="cp${p}-hint" class="vp-note"></div></div>`;}
function wireCity(p){let tmr=null;$(`cp${p}-city`).oninput=()=>{clearTimeout(tmr);tmr=setTimeout(async()=>{const c=$(`cp${p}-city`).value.trim();if(c.length<2)return;
  try{const r=await fetch(`${BACKEND}/geocode`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({city:c})});const g=await r.json();
    if(g.lat!=null){$(`cp${p}-lat`).value=g.lat;$(`cp${p}-lon`).value=g.lon;$(`cp${p}-tz`).value=g.tz_name;$(`cp${p}-hint`).textContent='📍 '+(g.display||c)+' · '+g.tz_name;}}catch(e){}},600);};}
const readP=p=>{const v=id=>$(`cp${p}-${id}`).value;return{name:v('name')||(p==='a'?'პირველი':'მეორე'),sex:v('sex'),
  body:{year:+v('y'),month:+v('m'),day:+v('d'),hour:+v('h')||0,minute:+v('mi')||0,second:0,lat:+v('lat'),lon:+v('lon'),tz_name:v('tz')||'UTC'}};};
function renderCompat(){
  const o=$('vp-out'),f=id=>(($(id)||{}).value);
  /* person 1 pre-filled from the main form (if filled), person 2 empty */
  const A={name:f('name')||'',sex:'m',d:f('day')||1,m:f('month')||1,y:f('year')||1990,h:f('hour')||12,mi:f('minute')||0,city:f('city')||'',lat:f('lat')||41.7151,lon:f('lon')||44.8271,tz:f('tz_name')||'Asia/Tbilisi'};
  const B={name:'',sex:'f',d:1,m:1,y:1992,h:12,mi:0,city:'',lat:A.lat,lon:A.lon,tz:A.tz};
  o.innerHTML=`<div class="vp-card"><h3>შეთავსება — აშტაკუტა (36 გუნა)</h3>
    <div class="vp-note" style="margin:0 0 10px">შეიყვანე ორივე ადამიანის დაბადების მონაცემები. პირველი ავტომატურად ივსება ზედა ფორმიდან. სქესი საჭიროა — ვარნა, ტარა და განა მამაკაცისა და ქალის მიხედვით ითვლება.</div>
    <div class="vp-grid2">${personHTML('a','👤 პირველი',A)}${personHTML('b','👤 მეორე',B)}</div>
    <div style="text-align:center;margin-top:12px"><button class="vp-btn" id="cp-go" style="padding:10px 28px;font-size:13px">✦ შეთავსების გამოთვლა ✦</button></div></div><div id="cp-out"></div>`;
  wireCity('a');wireCity('b');
  $('cp-go').onclick=async()=>{const out=$('cp-out');out.innerHTML='<div class="vp-card">⏳</div>';
    try{const pa=readP('a'),pb=readP('b');
      if(pa.sex===pb.sex){out.innerHTML='<div class="vp-card vp-sum">აშტაკუტა კაცისა და ქალისთვის ითვლება — აირჩიე სხვადასხვა სქესი.</div>';return;}
      const [da,db]=await Promise.all([vedicAt(pa.body),vedicAt(pb.body)]);
      const firstM=pa.sex==='m',M=firstM?da:db,F=firstM?db:da,nm1=pa.name,nm2=pb.name,man=firstM?nm1:nm2;
      const R=guna(M.planets.Moon.sidereal,F.planets.Moon.sidereal),tot=R.reduce((a,r)=>a+r[2],0);
      const verdict=tot<18?['არარეკომენდებული (18-ზე ნაკლები)','#e8907a']:tot<25?['საშუალო','#e8c97a']:tot<33?['კარგი','#7fd8a8']:['შესანიშნავი','#7fd8a8'];
      const md=[[nm1,mangal(da)],[nm2,mangal(db)]],nkA=nakOf(da.planets.Moon.sidereal),nkB=nakOf(db.planets.Moon.sidereal);
      out.innerHTML=`<div class="vp-card"><div class="vp-big">${tot.toFixed(1).replace('.0','')} / 36</div>
        <div class="vp-bar" style="margin:8px 0"><i style="width:${(tot/36*100).toFixed(0)}%"></i></div>
        <div style="text-align:center;color:${verdict[1]}">${verdict[0]}</div>
        <div class="vp-note" style="text-align:center">მთვარე: ${nm1} — ${nkA.name}, ${RASHI[Math.floor(da.planets.Moon.sidereal/30)]} · ${nm2} — ${nkB.name}, ${RASHI[Math.floor(db.planets.Moon.sidereal/30)]}</div></div>
        <div class="vp-card"><table><tr><th>კუტა</th><th>ქულა</th><th>${man} (კ) / ${firstM?nm2:nm1} (ქ)</th><th>რას ზომავს</th></tr>
        ${R.map(r=>`<tr><td>${r[0]}</td><td><b style="color:${r[2]>=r[1]*0.75?'#7fd8a8':r[2]===0?'#e8907a':'#e8c97a'}">${r[2]}</b> / ${r[1]}</td><td>${r[3]}</td><td class="vp-note" style="margin:0">${r[4]}</td></tr>`).join('')}</table>
        ${R[7][2]===0?'<div class="vp-note" style="color:#e8907a">⚠ ნადი დოშა — ერთი ნადი (ტრადიციით ყველაზე მძიმე).</div>':''}
        ${R[6][2]===0?'<div class="vp-note" style="color:#e8907a">⚠ ბჰაკუტ დოშა.</div>':''}</div>
        <div class="vp-card"><h3>მანგალა დოშა (კუჯა დოშა)</h3>${md.map(([n,m])=>`<div class="vp-sum">${n}: მარსი ლაგნიდან ${m.h}-ე, მთვარიდან ${m.hm}-ე ბჰავაში — ${m.lag||m.moon?'<b style="color:#e8907a">მანგლიკი</b>'+(m.lag&&m.moon?' (ორივედან)':m.lag?' (ლაგნიდან)':' (მთვარიდან)'):'არ არის'}</div>`).join('')}
        <div class="vp-note">მანგალა დოშა — მარსი 1, 2, 4, 7, 8, 12 ბჰავაში. ტრადიციით ორივე მანგლიკი ერთმანეთს „აბალანსებს“.</div></div>`;
      out.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(e){out.innerHTML='<div class="vp-card">შეცდომა: '+e.message+'</div>';}};
}

/* ═══════════ SIDEREAL SEARCH ═══════════ */
const SSTEP={moon:0.25,sun:1,mercury:0.5,venus:0.5,mars:1,jupiter:2,saturn:3,rahu:3,ketu:3,uranus:4,neptune:6,pluto:6};
const SORD=['pluto','neptune','uranus','rahu','ketu','saturn','jupiter','mars','sun','venus','mercury','moon'];
const condOK=(c,jd)=>{const L=sid(c.k,jd);if(!isFinite(L))return false;const v=c.t==='r'?Math.floor(L/30):Math.floor(L/NAK);if(v!==c.i)return false;
  if(c.rx&&!retro(c.k,jd))return false;return true;};
async function sscan(conds,jd0,jd1,prog,stop){
  const cs=[...conds].sort((a,b)=>SORD.indexOf(a.k)-SORD.indexOf(b.k));let wins=[[jd0,jd1]],tick=performance.now();
  for(let ci=0;ci<cs.length;ci++){const c=cs[ci],step=Math.min(SSTEP[c.k],c.t==='n'&&c.k==='moon'?0.25:SSTEP[c.k]),next=[],tot=wins.reduce((a,w)=>a+w[1]-w[0],0)||1;let done=0;
    for(const [a,b] of wins){let t=a,prev=condOK(c,a),st=prev?a:null;
      while(t<b){const t2=Math.min(b,t+step),cur=condOK(c,t2);
        if(cur!==prev){let lo=t,hi=t2;while(hi-lo>3e-4){const m=(lo+hi)/2;(condOK(c,m)===cur)?hi=m:lo=m;}if(cur)st=hi;else{next.push([st,hi]);st=null;}}
        prev=cur;done+=t2-t;t=t2;
        if(performance.now()-tick>40){prog((ci+done/tot)/cs.length);await new Promise(r=>setTimeout(r,0));tick=performance.now();if(stop())return null;}}
      if(st!=null)next.push([st,b]);}
    wins=next;if(!wins.length)break;}
  return wins;
}
const sopt=k=>GORD.map(g=>`<option value="${g}"${g===k?' selected':''}>${G[g][2]}︎ ${G[g][0]}</option>`).join('');
const topt=()=>`<optgroup label="რაში">${RASHI.map((r,i)=>`<option value="r${i}">${ZS[i]}︎ ${r} (${RASHI_KA[i]})</option>`).join('')}</optgroup><optgroup label="ნაქშატრა">${NAKS.map((n,i)=>`<option value="n${i}">${i+1}. ${n}</option>`).join('')}</optgroup>`;
const srow=k=>`<div class="vp-row sr"><div class="field"><label>გრჰა</label><select class="s-k">${sopt(k)}</select></div><div class="field"><label>რაში / ნაქშატრა</label><select class="s-t">${topt()}</select></div>
  <label style="font-size:11px;padding-bottom:8px"><input type="checkbox" class="s-rx"> ℞</label><button class="vp-btn s-x" style="padding:4px 10px">×</button></div>`;
let SRUN=false,SSTOP=false;
function renderSearch(){
  const o=$('vp-out'),y=jdLocal(nowJD(),formTZ()).year;
  o.innerHTML=`<div class="vp-card"><h3>ძებნა — როდის იყო / იქნება (სიდერალურად)</h3>
    <div id="ss-rows">${srow('jupiter')}</div><button class="vp-btn" id="ss-add" style="margin-bottom:10px">+ პირობა</button>
    <div class="vp-row"><div class="field"><label>წლიდან</label><input type="number" id="ss-y0" value="${y-100}"></div><div class="field"><label>წლამდე</label><input type="number" id="ss-y1" value="${y+100}"></div>
      <button class="vp-btn" id="ss-go">🔎 ძებნა</button></div>
    <div class="vp-note">ყველა პირობა ერთად. ძვ.წ. — მინუსით (−356). დიაპაზონი ძვ.წ. 3000 – 9999. ლაჰირი აიანამსა. დრო — ფორმის სარტყლით.</div>
    <div class="vp-bar" id="ss-bar" style="display:none;margin-top:8px"><i style="width:0"></i></div></div><div id="ss-out"></div>`;
  const wire=()=>o.querySelectorAll('.sr').forEach(r=>r.querySelector('.s-x').onclick=()=>{if(o.querySelectorAll('.sr').length>1)r.remove();});
  $('ss-add').onclick=()=>{$('ss-rows').insertAdjacentHTML('beforeend',srow('saturn'));wire();};wire();
  $('ss-go').onclick=async()=>{if(SRUN){SSTOP=true;return;}
    const conds=[...o.querySelectorAll('.sr')].map(r=>{const t=r.querySelector('.s-t').value;return{k:r.querySelector('.s-k').value,t:t[0],i:+t.slice(1),rx:r.querySelector('.s-rx').checked};});
    const cl=v=>Math.max(-3000,Math.min(9999,Math.round(+v)));let y0=cl($('ss-y0').value),y1=cl($('ss-y1').value);if(y1<y0)[y0,y1]=[y1,y0];
    const tz=formTZ(),ya=v=>v<0?v+1:v,jd0=X.cal2jd(ya(y0),1,1),jd1=X.cal2jd(ya(y1)+1,1,1);
    const btn=$('ss-go'),bar=$('ss-bar');SRUN=true;SSTOP=false;btn.textContent='■ შეჩერება';bar.style.display='block';
    const res=await sscan(conds,jd0,jd1,f=>{bar.firstChild.style.width=(f*100).toFixed(0)+'%';},()=>SSTOP);
    SRUN=false;btn.textContent='🔎 ძებნა';bar.style.display='none';
    if(!res){$('ss-out').innerHTML='<div class="vp-card">შეჩერდა.</div>';return;}
    const now=nowJD(),lab=conds.map(c=>`${G[c.k][2]}︎ ${G[c.k][0]} — ${c.t==='r'?RASHI[c.i]:NAKS[c.i]}${c.rx?' ℞':''}`).join(' + ');
    const dur=x=>x<2?Math.round(x*24)+' სთ':x<60?Math.round(x)+' დღე':x<730?(x/30.44).toFixed(1)+' თვე':(x/365.25).toFixed(1)+' წელი';
    const shown=res.slice(0,3000);
    $('ss-out').innerHTML=`<div class="vp-card"><div class="vp-sum"><b>${lab}</b><br>${y0} – ${y1}: <b>${res.length}</b> პერიოდი${res.length>shown.length?' (ნაჩვენებია 3000)':''}</div>
      <table style="margin-top:8px"><tr><th></th><th>დასაწყისი</th><th>დასასრული</th><th>ხანგრძლ.</th></tr>
      ${shown.map(w=>{const tag=w[0]<=now&&now<=w[1]?['ახლა','#5fc8b0']:w[1]<now?['წარსული','#8a80b0']:['მომავალი','#c9a84c'];
        return `<tr class="${tag[0]==='ახლა'?'cur':''}"><td><span class="vp-tag" style="color:${tag[1]};border-color:${tag[1]}">${tag[0]}</span></td><td>${fDT(w[0],tz)}</td><td>${fDT(w[1],tz)}</td><td>${dur(w[1]-w[0])}</td></tr>`;}).join('')}</table></div>`;
    const c=$('ss-out').querySelector('tr.cur')||[...$('ss-out').querySelectorAll('tr')].find(tr=>tr.textContent.includes('მომავალი'));if(c)c.scrollIntoView({block:'nearest'});};
}

/* ═══════════ tabs ═══════════ */
const TABS=[['natal','ნატალი'],['dasha','დაშა'],['panch','პანჩანგა'],['gochara','გოჩარა'],['varsha','ვარშაფალი'],['compat','შეთავსება'],['search','ძებნა']];
const RENDER={dasha:renderDasha,panch:renderPanch,gochara:renderGochara,varsha:renderVarsha,compat:renderCompat,search:renderSearch};
let TAB='natal';
function needNatal(){$('vp-out').innerHTML=`<div class="vp-card vp-sum">ამისთვის საჭიროა ნატალური რუკა — შეავსე ფორმა და დააჭირე <b>„ვედური რუქის გენერაცია“</b>.</div>`;}
function setTab(t){TAB=t;document.querySelectorAll('#vp-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  const ca=$('chart-area'),o=$('vp-out');
  if(t==='natal'){o.style.display='none';if(ca&&natal())ca.style.display='block';return;}
  if(ca)ca.style.display='none';o.style.display='block';try{RENDER[t]();}catch(e){o.innerHTML='<div class="vp-card">შეცდომა: '+e.message+'</div>';console.warn(e);}
  o.scrollIntoView({behavior:'smooth',block:'start'});}
function inject(){
  X=window._search;const fc=document.querySelector('.form-card');if(!X||!fc||$('vp-tabs'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const tb=document.createElement('div');tb.id='vp-tabs';tb.innerHTML=TABS.map(([k,n])=>`<button data-t="${k}" class="${k==='natal'?'on':''}">${n}</button>`).join('');
  fc.parentNode.insertBefore(tb,fc);
  const o=document.createElement('div');o.id='vp-out';const ca=$('chart-area');(ca&&ca.parentNode||document.body).insertBefore(o,ca?ca.nextSibling:null);
  tb.querySelectorAll('button').forEach(b=>b.onclick=()=>setTab(b.dataset.t));
  /* after a new natal chart: stay on the chosen tab and refresh it */
  if(typeof window.generate==='function'&&!window.generate._vp){const g=window.generate;
    const w=async function(){const r=await g.apply(this,arguments);OPEN=null;if(TAB!=='natal')setTab(TAB);return r;};w._vp=true;window.generate=w;}
  const yi=$('year');if(yi)yi.title='ძვ.წ. — მინუსით: −356 = ძვ.წ. 356';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else setTimeout(inject,0);
window._vedicPlus={ayan,sid,dashas,guna,panch,setTab};
})();
