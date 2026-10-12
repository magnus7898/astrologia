/* techniques.js — „დროის მბრძანებლები“: ელინისტური და ურანული ტექნიკები ნატალური რუკისთვის.
   Self-injecting add-on for astro.html — load after planetnodes.js (needs nothing else).
   Card under every single chart, 6 tabs:
   • პროფექციები — წლიური (ASC + ასაკი, მთელი ნიშნის სახლები) და თვიური; წლის მბრძანებელი
   • ზოდიაქოს გათავისუფლება — სულისა და ბედის წერტილიდან, L1 და L2 (კავშირის გახსნა, პიკები)
   • ფირდარია — დღის/ღამის თანმიმდევრობა, 7 ქვეპერიოდი
   • არაბული წერტილები — ჰერმესის 7 წერტილი + ოჯახის წერტილები, დღის/ღამის ფორმულებით
   • შუა წერტილები — ჰამბურგის სკოლა, 90° (ან 45°) დისკი, პლანეტარული სურათები A = B/C
   • გრადუსები — დეკანი (ქალდეური), ეგვიპტური საზღვრები, დოდეკატემორია, კრიტიკული გრადუსები
   Hellenistic techniques use the traditional rulers (Mars — Aries & Scorpio, Saturn — Aquarius,
   Jupiter — Pisces) by definition; the modern rulers are shown next to them.                  */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const n360=x=>((x%360)+360)%360;
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const P7=['მზე','მთვარე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი'];
const GL={'მზე':'☉','მთვარე':'☽','მერკური':'☿','ვენერა':'♀','მარსი':'♂','იუპიტერი':'♃','სატურნი':'♄','ურანი':'♅','ნეპტუნი':'♆','პლუტონი':'♇','ჩრდ. კვანძი':'☊','სამხ. კვანძი':'☋','ASC':'AC','MC':'MC','ვერძის წერტილი':'♈'};
const g=n=>(n==='ASC'||n==='MC')?'':(GL[n]||'')+'︎';
const RULER=['მარსი','ვენერა','მერკური','მთვარე','მზე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','სატურნი','იუპიტერი'];
/* MAGNUS modern rulership: Pluto — Aries, Mars — Scorpio */
const MODERN=['პლუტონი','ვენერა','მერკური','მთვარე','მზე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი'];
const gen=n=>n.endsWith('ი')?n.slice(0,-1)+'ის':n+'ს';
const fmt=l=>{l=n360(l);const s=Math.floor(l/30),d=l-s*30;return `${Math.floor(d)}°${String(Math.floor((d%1)*60)).padStart(2,'0')}′ <span title="${SG[s]}">${ZS[s]}︎</span>`;};
const fmtD=jd=>{const t=new Date((jd-2440587.5)*864e5);if(isNaN(t))return '—';return `${String(t.getUTCDate()).padStart(2,'0')}.${String(t.getUTCMonth()+1).padStart(2,'0')}.${t.getUTCFullYear()}`;};
const nowJD=()=>Date.now()/864e5+2440587.5;
const CSS=`
#tech-card .tc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
#tech-card .tc-tabs button{background:none;border:1px solid rgba(201,162,76,.3);color:rgba(232,201,122,.85);border-radius:14px;padding:4px 12px;font-size:11px;cursor:pointer;font-family:inherit}
#tech-card .tc-tabs button.on{background:rgba(201,162,76,.2);border-color:#C9A24C;color:#F7E3A8}
#tech-card table{width:100%;border-collapse:collapse;font-size:12.5px}
#tech-card th{font-weight:400;font-size:10.5px;letter-spacing:1px;color:rgba(232,201,122,.85);text-align:left;padding:6px 8px;border-bottom:1px solid rgba(201,162,76,.25)}
#tech-card td{padding:5px 8px;border-bottom:1px solid rgba(201,162,76,.08);color:#f3ecdc;vertical-align:top}
#tech-card tr.now td{background:rgba(201,162,76,.13)}
#tech-card tr.peak td:first-child{border-left:2px solid #F0D48A}
#tech-card .tc-note{font-size:11px;color:rgba(196,176,148,.8);line-height:1.65;margin-top:8px}
#tech-card .tc-big{font-size:14px;color:#f3ecdc;line-height:1.8;margin-bottom:8px}
#tech-card .tc-big b{color:#F0D48A;font-weight:500}
#tech-card .tc-scroll{overflow-x:auto;max-height:430px;overflow-y:auto}
#tech-card .tc-seg{display:inline-flex;gap:4px;margin:0 0 8px}
#tech-card .tc-seg button{background:none;border:1px solid rgba(201,162,76,.25);color:rgba(232,201,122,.75);border-radius:10px;padding:2px 9px;font-size:10.5px;cursor:pointer;font-family:inherit}
#tech-card .tc-seg button.on{background:rgba(201,162,76,.18);color:#F7E3A8}
#tech-card .tc-dial{display:block;margin:6px auto;max-width:360px;width:100%}`;
function reqJD(q){if(!q||!isFinite(+q.year))return null;
  if(window._anc&&window._anc.isHist&&window._anc.isHist(q))return window._anc.utJD(q);
  const y=+q.year,m=+q.month,d=+q.day,h=+(q.hour||0),mi=+(q.minute||0),se=+(q.second||0),tz=q.tz_name||'UTC';
  const gg=Date.UTC(y,m-1,d,h,mi,se);
  const off=ms=>{const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);
    return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-ms;};
  let t=gg-off(gg);t=gg-off(t);return t/864e5+2440587.5;}
function card(){let c=$('tech-card');if(c)return c;const anchor=$('dominants-card');if(!anchor)return null;
  c=document.createElement('div');c.className='data-card';c.id='tech-card';c.style.cssText='display:none;margin-top:14px';
  c.innerHTML='<div class="data-card-title">⏳ დროის მბრძანებლები · წერტილები · გრადუსები</div><div id="tech-body" style="padding:12px 14px"></div>';
  anchor.parentNode.insertBefore(c,anchor);return c;}

/* ── chart model ── */
function model(d){
  const P={};for(const [k,v] of Object.entries(d.planets||{})){const L=+v.degree;if(isFinite(L))P[k]=n360(L);}
  const asc=(!d._timeUnknown&&d.asc!=null)?n360(+d.asc):null,mc=(!d._timeUnknown&&d.mc!=null)?n360(+d.mc):null;
  const day=asc!=null&&P['მზე']!=null?n360(P['მზე']-asc)>180:null;
  const jd=reqJD(window._lastChartReq);
  return{P,asc,mc,day,jd};
}
const signOf=l=>Math.floor(n360(l)/30);
const wsHouse=(l,asc)=>(signOf(l)-signOf(asc)+12)%12+1;
function where(M,name){const l=M.P[name];if(l==null)return '—';return `${fmt(l)}${M.asc!=null?` · ${wsHouse(l,M.asc)} სახლი`:''}`;}

/* ── 1. profections ── */
function profections(M){
  if(M.asc==null)return '<div class="tc-note">პროფექციებს სჭირდება ასცენდენტი — დაბადების დრო უცნობია.</div>';
  if(M.jd==null)return '<div class="tc-note">დაბადების თარიღი ვერ წავიკითხე.</div>';
  const age=(nowJD()-M.jd)/365.2425,cur=Math.floor(age),a0=signOf(M.asc);
  const ys=(k)=>(a0+k)%12;
  const lord=RULER[ys(cur)];
  let rows='';for(let k=Math.max(0,cur-6);k<=cur+12;k++){const s=ys(k),L=RULER[s];
    rows+=`<tr class="${k===cur?'now':''}"><td>${k}</td><td>${fmtD(M.jd+k*365.2425).slice(-4)}</td><td>${ZS[s]}︎ ${SG[s]}</td><td>${k%12+1}</td><td>${g(L)} ${L}${MODERN[s]!==L?` <span style="opacity:.55">(${g(MODERN[s])})</span>`:''}</td><td>${where(M,L)}</td></tr>`;}
  /* monthly: each month from the birthday moves one more sign */
  const yStart=M.jd+cur*365.2425,mi=Math.floor((nowJD()-yStart)/(365.2425/12));
  let mrows='';for(let j=0;j<12;j++){const s=(ys(cur)+j)%12;mrows+=`<tr class="${j===mi?'now':''}"><td>${fmtD(yStart+j*365.2425/12)}</td><td>${ZS[s]}︎ ${SG[s]}</td><td>${g(RULER[s])} ${RULER[s]}</td></tr>`;}
  const lordNatal=M.P[lord];
  return `<div class="tc-big">ასაკი <b>${cur}</b> · პროფექციის ნიშანი <b>${ZS[ys(cur)]}︎ ${SG[ys(cur)]}</b> (${cur%12+1} სახლი) · წლის მბრძანებელი <b>${g(lord)} ${lord}</b>${lordNatal!=null?`, ნატალურად ${fmt(lordNatal)}, ${wsHouse(lordNatal,M.asc)} სახლში`:''}</div>
    <div class="tc-scroll"><table><tr><th>ასაკი</th><th>წელი</th><th>ნიშანი</th><th>სახლი</th><th>წლის მბრძანებელი</th><th>ნატალურად</th></tr>${rows}</table></div>
    <div class="tc-note" style="margin-top:12px">თვიური პროფექციები მიმდინარე წლისთვის:</div>
    <div class="tc-scroll"><table><tr><th>დან</th><th>ნიშანი</th><th>თვის მბრძანებელი</th></tr>${mrows}</table></div>
    <div class="tc-note">ყოველ დაბადების დღეზე ASC „გადადის“ ერთი ნიშნით წინ (მთელი ნიშნის სახლები). წლის მბრძანებლის ტრანზიტები და ნატალური მდგომარეობა ამ წლის თემებს განსაზღვრავს. მბრძანებლები ტრადიციულია; ფრჩხილებში — MAGNUS-ის თანამედროვე მმართველი.</div>`;
}

/* ── lots ── */
function lots(M){
  if(M.asc==null||M.day==null)return null;
  const P=M.P,A=M.asc,D=M.day,f=(x,y)=>n360(A+x-y),r=(a,b)=>D?f(a,b):f(b,a);
  const Fo=r(P['მთვარე'],P['მზე']),Sp=r(P['მზე'],P['მთვარე']);
  const L=[['ბედი (ფორტუნა)','⊗','სხეული, მატერიალური ბედი, ჯანმრთელობა',Fo,'ASC + ☽ − ☉'],
   ['სული (დემონი)','☿︎','გონება, ნება, კარიერა, მიზნები',Sp,'ASC + ☉ − ☽'],
   ['ეროსი','♡','სიყვარული, სურვილი, მეგობრობა',r(P['ვენერა'],Sp),'ASC + ♀ − სული'],
   ['აუცილებლობა','⚖','შეზღუდვები, ბრძოლა, კანონი',r(Fo,P['მერკური']),'ASC + ბედი − ☿'],
   ['სიმამაცე','⚔','გაბედულება, ძალა, ღალატი',r(Fo,P['მარსი']),'ASC + ბედი − ♂'],
   ['გამარჯვება','✪','წარმატება, რწმენა, მეგობრები',r(P['იუპიტერი'],Sp),'ASC + ♃ − სული'],
   ['ნემესისი','☠','ფარული მტრები, დანაკარგი, დასასრული',r(Fo,P['სატურნი']),'ASC + ბედი − ♄'],
   ['მამა','♂︎','მამა, წინაპრები',r(P['სატურნი'],P['მზე']),'ASC + ♄ − ☉'],
   ['დედა','♀︎','დედა',r(P['მთვარე'],P['ვენერა']),'ASC + ☽ − ♀'],
   ['ქორწინება','⚭','პარტნიორობა',f(P['ვენერა'],P['სატურნი']),'ASC + ♀ − ♄ (ორივე სექტი)'],
   ['შვილები','✿','შვილები',r(P['სატურნი'],P['იუპიტერი']),'ASC + ♄ − ♃'],
   ['და-ძმები','⚯','და-ძმები',f(P['იუპიტერი'],P['სატურნი']),'ASC + ♃ − ♄ (ორივე სექტი)']];
  return{Fo,Sp,L};
}
function lotsHTML(M){
  const R=lots(M);if(!R)return '<div class="tc-note">არაბულ წერტილებს სჭირდება ასცენდენტი და სექტი — დაბადების დრო უცნობია.</div>';
  const MAIN=['მზე','მთვარე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი','პლუტონი','ჩრდ. კვანძი','სამხ. კვანძი'];const pts=Object.entries(M.P).filter(([k])=>MAIN.includes(k));if(M.mc!=null)pts.push(['MC',M.mc]);
  const rows=R.L.map(l=>{const hits=pts.filter(([k,v])=>Math.abs(((v-l[3])%360+540)%360-180)<=3).map(([k])=>g(k)+' '+k);const s=signOf(l[3]);
    return `<tr><td><b style="color:#F0D48A">${l[1]}</b> ${l[0]}</td><td>${fmt(l[3])}</td><td>${wsHouse(l[3],M.asc)}</td><td>${g(RULER[s])} ${RULER[s]}</td><td>${hits.join(', ')||''}</td><td style="opacity:.75">${l[2]}<br><span style="font-size:10.5px;opacity:.7">${l[4]}</span></td></tr>`;}).join('');
  return `<div class="tc-big">${M.day?'დღის':'ღამის'} რუკა (მზე ${M.day?'ჰორიზონტს ზემოთ':'ჰორიზონტს ქვემოთ'}) — ღამის რუკაში ფორმულები ბრუნდება.</div>
    <div class="tc-scroll"><table><tr><th>წერტილი</th><th>მდებარეობა</th><th>სახლი</th><th>მბრძანებელი</th><th>☌ 3°</th><th>თემა · ფორმულა</th></tr>${rows}</table></div>
    <div class="tc-note">პირველი შვიდი — პავლე ალექსანდრიელის „ჰერმესის წერტილები“ (IV ს.). სახლები — მთელი ნიშნით ASC-დან.</div>`;
}

/* ── 2. zodiacal releasing ── */
const ZR_Y=[15,8,20,25,19,20,8,15,12,27,30,12];
let ZR_LOT='sp',ZR_YEAR=360;
function zrL1(start,jd0,yl,until){const out=[];let s=start,t=jd0;while(t<until){const len=ZR_Y[s]*yl;out.push({s,a:t,b:t+len});t+=len;s=(s+1)%12;}return out;}
function zrL2(L1,yl){const m=yl/12,out=[];let s=L1.s,t=L1.a,cnt=0,loosed=false;
  while(t<L1.b-1e-6){let len=ZR_Y[s]*m;if(t+len>L1.b)len=L1.b-t;out.push({s,a:t,b:t+len,lb:loosed&&cnt===0});t+=len;cnt++;
    s=(s+1)%12;if(cnt===12&&!loosed){s=(L1.s+6)%12;loosed=true;cnt=0;}}
  return out;}
function zrHTML(M){
  const R=lots(M);if(!R)return '<div class="tc-note">ზოდიაქოს გათავისუფლებას სჭირდება ბედისა და სულის წერტილი — დაბადების დრო უცნობია.</div>';
  if(M.jd==null)return '<div class="tc-note">დაბადების თარიღი ვერ წავიკითხე.</div>';
  const lot=ZR_LOT==='sp'?R.Sp:R.Fo,fs=signOf(R.Fo),yl=ZR_YEAR;
  const now=nowJD(),L1=zrL1(signOf(lot),M.jd,yl,M.jd+110*365.2425);
  const ang=s=>[0,3,6,9].includes((s-fs+12)%12);
  const peak=s=>{const k=(s-fs+12)%12;return k===9?'★ პიკი (მე-10 ბედიდან)':k===0?'პიკი (ბედის ნიშანი)':k===6?'პიკი (მე-7)':k===3?'მე-4 (შიდა)':'';};
  const cur=L1.find(p=>now>=p.a&&now<p.b);
  let r1=L1.map(p=>`<tr class="${p===cur?'now':''}${ang(p.s)?' peak':''}"><td>${ZS[p.s]}︎ ${SG[p.s]}</td><td>${g(RULER[p.s])} ${RULER[p.s]}</td><td>${((p.a-M.jd)/365.2425).toFixed(1)}</td><td>${fmtD(p.a)}</td><td>${fmtD(p.b)}</td><td>${peak(p.s)}</td></tr>`).join('');
  let r2='';if(cur){const L2=zrL2(cur,yl);r2=L2.map(p=>`<tr class="${now>=p.a&&now<p.b?'now':''}${ang(p.s)?' peak':''}"><td>${ZS[p.s]}︎ ${SG[p.s]}${p.lb?' <span style="color:#e8a0a0">⟲ კავშირის გახსნა</span>':''}</td><td>${g(RULER[p.s])} ${RULER[p.s]}</td><td>${fmtD(p.a)}</td><td>${fmtD(p.b)}</td><td>${peak(p.s)}</td></tr>`).join('');}
  return `<div class="tc-seg"><button data-zl="sp" class="${ZR_LOT==='sp'?'on':''}">სულიდან (კარიერა)</button><button data-zl="fo" class="${ZR_LOT==='fo'?'on':''}">ბედიდან (სხეული)</button></div>
    <div class="tc-seg"><button data-zy="360" class="${yl===360?'on':''}">360-დღიანი წელი</button><button data-zy="365.2425" class="${yl!==360?'on':''}">365.24</button></div>
    <div class="tc-big">${ZR_LOT==='sp'?'სულის':'ბედის'} წერტილი: <b>${fmt(lot)}</b>${cur?` · ახლა L1: <b>${ZS[cur.s]}︎ ${SG[cur.s]}</b> (${fmtD(cur.a)} – ${fmtD(cur.b)})`:''}</div>
    <div class="tc-scroll"><table><tr><th>L1 ნიშანი</th><th>მბრძანებელი</th><th>ასაკი</th><th>დან</th><th>მდე</th><th>პიკი</th></tr>${r1}</table></div>
    ${cur?`<div class="tc-note" style="margin-top:12px">მიმდინარე L1-ის ქვეპერიოდები (L2):</div><div class="tc-scroll"><table><tr><th>L2 ნიშანი</th><th>მბრძანებელი</th><th>დან</th><th>მდე</th><th>პიკი</th></tr>${r2}</table></div>`:''}
    <div class="tc-note">ვეტიუს ვალენსის მეთოდი: ნიშნის წლები — მისი მბრძანებლის „მცირე წლები“ (♄ 30/27, ♃ 12, ♂ 15, ☉ 19, ♀ 8, ☿ 20, ☽ 25). L2 = იგივე რიცხვი თვეებში; როცა L2 12 ნიშანს შემოივლის, ხდება <b>„კავშირის გახსნა“</b> — გადახტომა L1-ის საპირისპირო ნიშანზე (დიდი შემობრუნება). <b>პიკები</b> — ნიშნები ბედის წერტილიდან კარდინალურ (1/4/7/10) პოზიციაზე, მე-10 — ყველაზე ძლიერი. ჩარჩო მარცხნივ — პიკის პერიოდი.</div>`;
}

/* ── 3. firdaria ── */
const FD_DAY=[['მზე',10],['ვენერა',8],['მერკური',13],['მთვარე',9],['სატურნი',11],['იუპიტერი',12],['მარსი',7],['ჩრდ. კვანძი',3],['სამხ. კვანძი',2]];
const FD_NIGHT=[['მთვარე',9],['სატურნი',11],['იუპიტერი',12],['მარსი',7],['მზე',10],['ვენერა',8],['მერკური',13],['ჩრდ. კვანძი',3],['სამხ. კვანძი',2]];
const SUBORD=['მზე','ვენერა','მერკური','მთვარე','სატურნი','იუპიტერი','მარსი'];
function firdaria(M){
  if(M.day==null)return '<div class="tc-note">ფირდარიას სჭირდება სექტი (დღის/ღამის რუკა) — დაბადების დრო უცნობია.</div>';
  if(M.jd==null)return '<div class="tc-note">დაბადების თარიღი ვერ წავიკითხე.</div>';
  const seq=M.day?FD_DAY:FD_NIGHT,Y=365.2425,now=nowJD();let t=M.jd,rows='',curTxt='';
  for(let cycle=0;cycle<2;cycle++)for(const [p,n] of seq){const a=t,b=t+n*Y;const isNow=now>=a&&now<b;
    rows+=`<tr class="${isNow?'now':''}"><td><b>${g(p)} ${p}</b></td><td>${((a-M.jd)/Y).toFixed(0)}–${((b-M.jd)/Y).toFixed(0)}</td><td>${fmtD(a)}</td><td>${fmtD(b)}</td><td>${where(M,p)}</td></tr>`;
    if(P7.includes(p)){const st=SUBORD.indexOf(p),sl=n*Y/7;for(let k=0;k<7;k++){const sp=SUBORD[(st+k)%7],sa=a+k*sl,sb=sa+sl,sn=now>=sa&&now<sb;
      if(isNow)rows+=`<tr class="${sn?'now':''}"><td style="padding-left:22px;opacity:.85">↳ ${g(sp)} ${sp}</td><td></td><td>${fmtD(sa)}</td><td>${fmtD(sb)}</td><td style="opacity:.75">${where(M,sp)}</td></tr>`;
      if(sn)curTxt=`<b>${g(p)} ${p}</b> / <b>${g(sp)} ${sp}</b> (${fmtD(sa)} – ${fmtD(sb)})`;}}
    else if(isNow)curTxt=`<b>${g(p)} ${p}</b>`;
    t=b;}
  return `<div class="tc-big">${M.day?'დღის':'ღამის'} რუკა · მიმდინარე პერიოდი: ${curTxt||'—'}</div>
    <div class="tc-scroll"><table><tr><th>მბრძანებელი</th><th>ასაკი</th><th>დან</th><th>მდე</th><th>ნატალურად</th></tr>${rows}</table></div>
    <div class="tc-note">სპარსული ფირდარია (75-წლიანი ციკლი): ${M.day?'დღის რუკა იწყება მზით':'ღამის რუკა იწყება მთვარით'}, ბოლოს — კვანძები (3 და 2 წელი). პლანეტის პერიოდი იყოფა 7 თანაბარ ქვეპერიოდად, დაწყებული თავად მბრძანებლით. მიმდინარე პერიოდის ქვეპერიოდები ჩანს ცხრილში.</div>`;
}

/* ── 4. midpoints (Hamburg / Uranian) ── */
let MP_MOD=90,MP_ORB=1.5;
function midpoints(M){
  const keys=['მზე','მთვარე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი','პლუტონი','ჩრდ. კვანძი'];
  const pts=keys.filter(k=>M.P[k]!=null).map(k=>[k,M.P[k]]);
  if(M.asc!=null)pts.push(['ASC',M.asc]);if(M.mc!=null)pts.push(['MC',M.mc]);pts.push(['ვერძის წერტილი',0]);
  const mod=MP_MOD,dd=(a,b)=>{const x=((a-b)%mod+mod)%mod;return Math.min(x,mod-x);};
  const trees={};
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const [bn,b]=pts[i],[cn,c]=pts[j];
    let mpt=n360(b+n360(c-b)/2);if(n360(c-b)>180)mpt=n360(mpt+180);
    for(const [an,a] of pts){if(an===bn||an===cn)continue;const o=dd(a,mpt);if(o<=MP_ORB)(trees[an]=trees[an]||[]).push([bn,cn,o]);}}
  const order=pts.map(p=>p[0]).filter(k=>trees[k]);
  const rows=order.map(a=>`<tr><td><b>${g(a)} ${a}</b></td><td>${trees[a].sort((x,y)=>x[2]-y[2]).map(t=>`${g(t[0])||t[0]}/${g(t[1])||t[1]} <span style="opacity:.55">${t[2].toFixed(1)}°</span>`).join(' · ')}</td></tr>`).join('');
  /* dial */
  const R=150,cx=170,cy=170;let svg=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(201,162,76,.35)"/>`;
  for(let k=0;k<mod;k+=mod/18){const an=(-90+k/mod*360)*Math.PI/180;svg+=`<line x1="${cx+(R-6)*Math.cos(an)}" y1="${cy+(R-6)*Math.sin(an)}" x2="${cx+R*Math.cos(an)}" y2="${cy+R*Math.sin(an)}" stroke="rgba(201,162,76,.4)"/>`;}
  const lab=[];pts.forEach(([n,l])=>{const v=((l%mod)+mod)%mod,an=(-90+v/mod*360)*Math.PI/180;lab.push([n,an,v]);});
  lab.sort((a,b)=>a[2]-b[2]);let last=-99,lvl=0;
  lab.forEach(([n,an,v])=>{lvl=(v-last<mod/40)?lvl+1:0;last=v;const rr=R-20-lvl*16;
    svg+=`<line x1="${cx+(R-6)*Math.cos(an)}" y1="${cy+(R-6)*Math.sin(an)}" x2="${cx+(rr+8)*Math.cos(an)}" y2="${cy+(rr+8)*Math.sin(an)}" stroke="rgba(240,212,138,.5)"/><text x="${cx+rr*Math.cos(an)}" y="${cy+rr*Math.sin(an)+4}" text-anchor="middle" font-size="12" fill="#F0D48A">${(GL[n]||n)+'︎'}</text>`;});
  svg+=`<text x="${cx}" y="${cy-R-6}" text-anchor="middle" font-size="9" fill="rgba(232,201,122,.7)">0° ♈︎ ♋︎ ♎︎ ♑︎</text>`;
  return `<div class="tc-seg"><button data-mm="90" class="${mod===90?'on':''}">90° დისკი</button><button data-mm="45" class="${mod===45?'on':''}">45° (მე-8 ჰარმონიკა)</button></div>
    <div class="tc-seg"><button data-mo="1" class="${MP_ORB===1?'on':''}">ორბი 1°</button><button data-mo="1.5" class="${MP_ORB===1.5?'on':''}">1.5°</button><button data-mo="2" class="${MP_ORB===2?'on':''}">2°</button></div>
    <svg class="tc-dial" viewBox="0 0 340 340">${svg}</svg>
    <div class="tc-scroll"><table><tr><th>წერტილი</th><th>პლანეტარული სურათები A = B/C</th></tr>${rows||'<tr><td colspan="2">ამ ორბით სურათები არ არის.</td></tr>'}</table></div>
    <div class="tc-note">ჰამბურგის (ურანული) სკოლა, ალფრედ ვიტე: „A = B/C“ ნიშნავს, რომ A ზის B-სა და C-ს შუა წერტილზე (ან მის ${mod===90?'კვადრატზე/ოპოზიციაზე':'45°-ის ჯერადზე'}) — სამი პრინციპი ერთ „სურათად“ ერთიანდება. ვერძის წერტილი (0° ♈︎) — სამყაროსთან კავშირი. ჰიპოთეტური ტრანსნეპტუნური პლანეტები (კუპიდონი, ჰადესი…) არ ითვლება.</div>`;
}

/* ── 5. degrees ── */
const TERMS=[[['იუპიტერი',6],['ვენერა',12],['მერკური',20],['მარსი',25],['სატურნი',30]],[['ვენერა',8],['მერკური',14],['იუპიტერი',22],['სატურნი',27],['მარსი',30]],
 [['მერკური',6],['იუპიტერი',12],['ვენერა',17],['მარსი',24],['სატურნი',30]],[['მარსი',7],['ვენერა',13],['მერკური',19],['იუპიტერი',26],['სატურნი',30]],
 [['იუპიტერი',6],['ვენერა',11],['სატურნი',18],['მერკური',24],['მარსი',30]],[['მერკური',7],['ვენერა',17],['იუპიტერი',21],['მარსი',28],['სატურნი',30]],
 [['სატურნი',6],['მერკური',14],['იუპიტერი',21],['ვენერა',28],['მარსი',30]],[['მარსი',7],['ვენერა',11],['მერკური',19],['იუპიტერი',24],['სატურნი',30]],
 [['იუპიტერი',12],['ვენერა',17],['მერკური',21],['სატურნი',26],['მარსი',30]],[['მერკური',7],['იუპიტერი',14],['ვენერა',22],['სატურნი',26],['მარსი',30]],
 [['მერკური',7],['ვენერა',13],['იუპიტერი',20],['მარსი',25],['სატურნი',30]],[['ვენერა',12],['იუპიტერი',16],['მერკური',19],['მარსი',28],['სატურნი',30]]];
const CHALD=['მარსი','მზე','ვენერა','მერკური','მთვარე','სატურნი','იუპიტერი'];
const MINOR=[['კვერთხები',2],['მონეტები',5],['ხმლები',8],['თასები',2],['კვერთხები',5],['მონეტები',8],['ხმლები',2],['თასები',5],['კვერთხები',8],['მონეტები',2],['ხმლები',5],['თასები',8]];
function degreeInfo(l){
  const s=signOf(l),d=n360(l)-s*30,di=Math.floor(d),dec=Math.floor(d/10);
  const decRuler=CHALD[(s*3+dec)%7];const term=TERMS[s].find(t=>d<t[1])[0];
  const dode=(s+Math.floor(d/2.5))%12;
  const mod=s%3;const crit=(mod===0&&[0,13,26].includes(di))||(mod===1&&[8,9,21,22].includes(di))||(mod===2&&[4,17].includes(di));
  const tags=[];if(di===29)tags.push('ანარეტული (29°)');if(di===0)tags.push('0° — ნიშნის დასაწყისი');if(crit)tags.push('კრიტიკული');
  /* minor arcana of the decan: card number 2-4 / 5-7 / 8-10 by modality, decan adds 0/1/2 */
  const mm=MINOR[s],card=mm[1]+dec;
  return{s,di,deg:d,dec:dec+1,decRuler,term,dode,tags,card:`${card} ${mm[0]}`};
}
function degreesHTML(M){
  const keys=['მზე','მთვარე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი','პლუტონი','ჩრდ. კვანძი'];
  const pts=keys.filter(k=>M.P[k]!=null).map(k=>[k,M.P[k]]);if(M.asc!=null)pts.push(['ASC',M.asc]);if(M.mc!=null)pts.push(['MC',M.mc]);
  const rows=pts.map(([n,l])=>{const I=degreeInfo(l);
    return `<tr><td><b>${g(n)} ${n}</b></td><td>${fmt(l)}</td><td>${I.dec} · ${g(I.decRuler)} ${I.decRuler}</td><td>${g(I.term)} ${I.term}</td><td>${ZS[I.dode]}︎ ${SG[I.dode]}</td><td>${I.card}</td><td style="color:#e8a0a0">${I.tags.join(', ')}</td></tr>`;}).join('');
  return `<div class="tc-scroll"><table><tr><th>წერტილი</th><th>გრადუსი</th><th>დეკანი (ქალდ.)</th><th>საზღვარი (ეგვ.)</th><th>დოდეკატემორია</th><th>დეკანის კარტა</th><th>ნიშნები</th></tr>${rows}</table></div>
    <div class="tc-note"><b>დეკანი</b> — ნიშნის 10°-იანი მესამედი, მბრძანებლები ქალდეური რიგით (♂ ☉ ♀ ☿ ☽ ♄ ♃). <b>საზღვრები</b> — ეგვიპტური ტერმინები (პტოლემეოსის მიხედვით). <b>დოდეკატემორია</b> — ნიშნის 2.5°-იანი მეთორმეტედი, „ნიშანი ნიშანში“. <b>დეკანის კარტა</b> — ტაროს მცირე არკანი (ოქროს განთიადი). <b>კრიტიკული</b> — კარდინალური 0/13/26°, ფიქსირებული 8–9/21–22°, მუტაბელური 4/17°; <b>ანარეტული</b> — 29°.
    საბიანის სიმბოლოები (მ. ე. ჯონსი, 1953) საავტორო უფლებითაა დაცული, ამიტომ აქ არ არის — სურვილის შემთხვევაში შეიძლება დაემატოს MAGNUS-ის საკუთარი ქართული ტექსტები 360 გრადუსისთვის.</div>`;
}

/* ── render ── */
let TAB='prof',LAST=null;
const TABS=[['prof','პროფექციები',profections],['zr','ზოდიაქოს გათავისუფლება',zrHTML],['fd','ფირდარია',firdaria],['lots','არაბული წერტილები',lotsHTML],['mp','შუა წერტილები',midpoints],['deg','გრადუსები',degreesHTML]];
function render(d){
  const c=card();if(!c)return;if(!d||!d.planets){c.style.display='none';return;}
  LAST=d;const M=model(d);
  const t=TABS.find(x=>x[0]===TAB);
  $('tech-body').innerHTML=`<div class="tc-tabs">${TABS.map(x=>`<button data-t="${x[0]}" class="${x[0]===TAB?'on':''}">${x[1]}</button>`).join('')}</div>${t[2](M)}`;
  c.style.display='block';
  c.querySelectorAll('.tc-tabs button').forEach(b=>b.onclick=()=>{TAB=b.dataset.t;render(LAST);});
  c.querySelectorAll('[data-zl]').forEach(b=>b.onclick=()=>{ZR_LOT=b.dataset.zl;render(LAST);});
  c.querySelectorAll('[data-zy]').forEach(b=>b.onclick=()=>{ZR_YEAR=+b.dataset.zy;render(LAST);});
  c.querySelectorAll('[data-mm]').forEach(b=>b.onclick=()=>{MP_MOD=+b.dataset.mm;render(LAST);});
  c.querySelectorAll('[data-mo]').forEach(b=>b.onclick=()=>{MP_ORB=+b.dataset.mo;render(LAST);});
}
function hook(){
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  if(typeof window.showSingleChart==='function'&&!window.showSingleChart._tc){const o=window.showSingleChart;
    const w=function(d){const r=o.apply(this,arguments);try{render(d);}catch(e){console.warn('techniques',e);}return r;};w._tc=true;for(const k in o)w[k]=o[k];window.showSingleChart=w;}
  if(typeof window.showDoubleChart==='function'&&!window.showDoubleChart._tc){const o=window.showDoubleChart;
    const w=function(){const r=o.apply(this,arguments);const c=$('tech-card');if(c)c.style.display='none';return r;};w._tc=true;for(const k in o)w[k]=o[k];window.showDoubleChart=w;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else setTimeout(hook,0);
window._techniques={model,lots,zrL1,zrL2,degreeInfo};
})();
