/* directions.js — „დირექციები“: ცალკე ჩანართი astro.html-ში.
   Self-injecting: adds its own tab (დირექციები) at the end of the tab bar with its own birth form
   (↧ copies from the natal tab), asks the backend /chart for the natal positions and lists:
   • სოლარული რკალი — ნამდვილი: რკალი = პროგრესირებული მზე − ნატალური მზე (1 დღე = 1 წელი)
   • ნაიბოდი — 0°59′08″ წელიწადში (მზის საშუალო დღიური სვლა)
   • 1° = 1 წელი — პტოლემეოსის სიმბოლური გასაღები
   • პრიმარული — პლაციდუსის ნახევარრკალი (ზოდიაქოს წერტილები, განედი 0), გასაღები პტოლემეოსი / ნაიბოდი
   Every directed point (planets, ASC, MC) is checked against every natal point with the 5 major
   aspects; the exact age and date are listed for the whole life, the current year highlighted.
   Direct / converse toggle. astro.html needs only:  <script src="directions.js"></script>        */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const D2R=Math.PI/180,R2D=180/Math.PI;
const n360=x=>((x%360)+360)%360,s180=x=>{x=n360(x);return x>180?x-360:x;};
const ZS=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const KEYS=['მზე','მთვარე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი','პლუტონი'];
const GL={'მზე':'☉','მთვარე':'☽','მერკური':'☿','ვენერა':'♀','მარსი':'♂','იუპიტერი':'♃','სატურნი':'♄','ურანი':'♅','ნეპტუნი':'♆','პლუტონი':'♇','ჩრდ. კვანძი':'☊','ASC':'AC','MC':'MC'};
const g=n=>(n==='ASC'||n==='MC')?'<b>'+n+'</b>':(GL[n]||'')+'︎ '+n;
const ASP=[[0,'☌','შეერთება','#F0D48A'],[60,'⚹','სექსტილი','#7fc8e8'],[90,'□','კვადრატი','#e87f7f'],[120,'△','ტრიგონი','#7fd89a'],[180,'☍','ოპოზიცია','#e8a07f']];
const YEAR=365.2425,NAIBOD=0.98564733;
const fmt=l=>{l=n360(l);const s=Math.floor(l/30),d=l-s*30;return `${Math.floor(d)}°${String(Math.floor((d%1)*60)).padStart(2,'0')}′ <span title="${SG[s]}">${ZS[s]}︎</span>`;};
const fmtD=jd=>{const t=new Date((jd-2440587.5)*864e5);if(isNaN(t))return '—';return `${String(t.getUTCDate()).padStart(2,'0')}.${String(t.getUTCMonth()+1).padStart(2,'0')}.${t.getUTCFullYear()}`;};
const nowJD=()=>Date.now()/864e5+2440587.5;
const CSS=`
#dr-out{margin-top:14px}
#dr-out .dc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
#dr-out .dc-tabs button,#dr-out .dc-seg button{background:none;border:1px solid rgba(201,162,76,.3);color:rgba(232,201,122,.85);border-radius:14px;padding:4px 12px;font-size:11px;cursor:pointer;font-family:inherit}
#dr-out .dc-seg{display:inline-flex;gap:4px;flex-wrap:wrap;margin:0 10px 8px 0}
#dr-out .dc-seg button{border-radius:10px;padding:2px 9px;font-size:10.5px}
#dr-out .dc-tabs button.on,#dr-out .dc-seg button.on{background:rgba(201,162,76,.2);border-color:#C9A24C;color:#F7E3A8}
#dr-out table{width:100%;border-collapse:collapse;font-size:12.5px}
#dr-out th{font-weight:400;font-size:10.5px;letter-spacing:1px;color:rgba(232,201,122,.85);text-align:left;padding:6px 8px;border-bottom:1px solid rgba(201,162,76,.25);position:sticky;top:0;background:#0d0a1e}
#dr-out td{padding:5px 8px;border-bottom:1px solid rgba(201,162,76,.08);color:#f3ecdc;vertical-align:top;white-space:nowrap}
#dr-out tr.now td{background:rgba(201,162,76,.15)}
#dr-out tr.past td{opacity:.55}
#dr-out .dc-scroll{overflow-x:auto;max-height:440px;overflow-y:auto}
#dr-out .dc-note{font-size:11px;color:rgba(196,176,148,.8);line-height:1.65;margin-top:8px}
#dr-out .dc-big{font-size:13.5px;color:#f3ecdc;line-height:1.8;margin-bottom:8px}
#dr-out .dc-big b{color:#F0D48A;font-weight:500}
#dr-out h4{font-weight:400;font-size:11px;letter-spacing:1px;color:rgba(232,201,122,.85);margin:12px 0 6px}`;

/* ── birth moment (same reading as techniques.js) ── */
function reqJD(q){if(!q||!isFinite(+q.year))return null;
  if(window._anc&&window._anc.isHist&&window._anc.isHist(q))return window._anc.utJD(q);
  const y=+q.year,m=+q.month,d=+q.day,h=+(q.hour||0),mi=+(q.minute||0),se=+(q.second||0),tz=q.tz_name||'UTC';
  const gg=Date.UTC(y,m-1,d,h,mi,se);
  const off=ms=>{const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);
    return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-ms;};
  let t=gg-off(gg);t=gg-off(t);return t/864e5+2440587.5;}

/* ── Sun longitude (Meeus, low precision ±0.01°) — only differences are used for the solar arc ── */
function sunLon(jd){const T=(jd-2451545)/36525,M=(357.52911+35999.05029*T)*D2R,L0=280.46646+36000.76983*T;
  const C=(1.914602-0.004817*T)*Math.sin(M)+0.019993*Math.sin(2*M)+0.000289*Math.sin(3*M);
  const Om=(125.04-1934.136*T)*D2R;return n360(L0+C-0.00569-0.00478*Math.sin(Om));}
const obliq=jd=>23.4392911-0.0130042*(jd-2451545)/36525;

/* ── chart model ── */
function model(d,q){
  const P={};for(const k of KEYS){const v=d.planets&&d.planets[k];if(v&&isFinite(+v.degree))P[k]=n360(+v.degree);}
  const known=!q.time_unknown&&d.asc!=null&&d.mc!=null;
  if(known){P.ASC=n360(+d.asc);P.MC=n360(+d.mc);}
  return{P,known,jd:reqJD(q),lat:isFinite(+q.lat)?+q.lat:null,name:q.name||''};
}

/* ── keys: arc ⇄ age ── */
function solarArcAt(M,age){return n360(sunLon(M.jd+age)-sunLon(M.jd));}      /* 1 day after birth = 1 year of life */
function ageForSolarArc(M,arc){let a=0,b=130;if(solarArcAt(M,b)<arc)return null;
  for(let i=0;i<50;i++){const m=(a+b)/2;if(solarArcAt(M,m)<arc)a=m;else b=m;}return (a+b)/2;}
const KEY={
  sa:{name:'სოლარული რკალი',arc:(M,age)=>solarArcAt(M,age),age:(M,arc)=>ageForSolarArc(M,arc)},
  nb:{name:'ნაიბოდი',arc:(M,age)=>age*NAIBOD,age:(M,arc)=>arc/NAIBOD},
  pt:{name:'1° = 1 წელი',arc:(M,age)=>age,age:(M,arc)=>arc}
};

/* ── symbolic directions: every point moves by the same arc ── */
function symbolic(M,key,conv,maxAge){
  const pts=Object.keys(M.P),out=[];const maxArc=KEY[key].arc(M,maxAge);
  for(const a of pts)for(const b of pts){if(a===b)continue;
    for(const [ang,gl,nm,col] of ASP){for(const sg of (ang===0||ang===180?[1]:[1,-1])){
      const target=n360(M.P[b]+sg*ang);
      const arc=conv?n360(M.P[a]-target):n360(target-M.P[a]);
      if(arc<0.05||arc>maxArc)continue;
      const age=KEY[key].age(M,arc);if(age==null||age>maxAge)continue;
      out.push({a,b,ang,gl,nm,col,arc,age});}}}
  return out.sort((x,y)=>x.age-y.age);
}

/* ── primary directions: Placidus semi-arc, zodiacal (ecliptic latitude 0) ── */
function eq(lon,eps){const l=lon*D2R,e=eps*D2R;
  return{ra:n360(Math.atan2(Math.sin(l)*Math.cos(e),Math.cos(l))*R2D),dec:Math.asin(Math.sin(e)*Math.sin(l))*R2D};}
function mundane(lon,ramc,phi,eps){const{ra,dec}=eq(lon,eps);
  const x=Math.tan(phi*D2R)*Math.tan(dec*D2R);if(Math.abs(x)>=1)return null;      /* circumpolar — no semi-arc */
  const ad=Math.asin(x)*R2D,dsa=90+ad,nsa=90-ad,md=s180(ramc-ra);            /* md: west of MC positive */
  return{ra,dec,dsa,nsa,md};}
/* position of S as a fraction of its semi-arc: upper hemisphere f∈[-1,1] of DSA from MC, lower from IC */
function frac(m){if(Math.abs(m.md)<=m.dsa)return{up:true,f:m.md/m.dsa};return{up:false,f:s180(m.md-180)/m.nsa};}
function primary(M,keyName,conv,maxAge){
  if(!M.known||M.lat==null)return null;
  const eps=obliq(M.jd),ramc=eq(M.P.MC,eps).ra,phi=M.lat;
  const sig=['ASC','MC','მზე','მთვარე'].filter(k=>M.P[k]!=null);
  const prom=Object.keys(M.P),out=[],rate=keyName==='nb'?NAIBOD:1;
  for(const s of sig)for(const p of prom){if(s===p)continue;
    for(const [ang,gl,nm,col] of ASP){for(const sg of (ang===0||ang===180?[1]:[1,-1])){
      /* the promissor point is the aspect point of P on the ecliptic; S stays put (direct) or the roles swap (converse) */
      const P_lon=n360(M.P[p]+sg*ang);
      let mover,fix;
      if(!conv){mover=mundane(P_lon,ramc,phi,eps);fix=s==='ASC'?{up:true,f:-1}:s==='MC'?{up:true,f:0}:(()=>{const m=mundane(M.P[s],ramc,phi,eps);return m&&frac(m);})();}
      else{if(s==='ASC'||s==='MC')continue;mover=mundane(M.P[s],ramc,phi,eps);const m=mundane(P_lon,ramc,phi,eps);fix=m&&frac(m);}
      if(!mover||!fix)continue;
      const tgt=fix.up?fix.f*mover.dsa:180+fix.f*mover.nsa;
      const arc=n360(tgt-mover.md);                    /* diurnal rotation carries the mover west by `arc` of RA */
      if(arc<0.05)continue;const age=arc/rate;if(age>maxAge)continue;
      out.push({a:conv?s:p,b:conv?p:s,ang,gl,nm,col,arc,age,prom:p,sig:s});}}}
  return out.sort((x,y)=>x.age-y.age);
}

/* ── render ── */
let TAB='sa',CONV=false,PKEY='nb',SPAN=90,LAST=null;
function table(M,rows,primaryMode){
  if(!rows.length)return '<div class="dc-note">ამ პარამეტრებით დირექციები ვერ მოიძებნა.</div>';
  const now=(nowJD()-M.jd)/YEAR;
  let next=rows.findIndex(r=>r.age>=now);
  const tr=rows.map((r,i)=>{const cls=Math.abs(r.age-now)<=1?'now':r.age<now?'past':'';
    const ln=primaryMode?`${g(r.a)} <span style="color:${r.col}">${r.gl}︎</span> ${g(r.b)}`:`${g(r.a)} <span style="opacity:.6">dir.</span> <span style="color:${r.col}">${r.gl}︎</span> ${g(r.b)} <span style="opacity:.6">nat.</span>`;
    return `<tr class="${cls}" ${i===next?'id="dc-next"':''}><td>${r.age.toFixed(2)}</td><td>${fmtD(M.jd+r.age*YEAR)}</td><td>${ln}</td><td style="color:${r.col}">${r.nm}</td><td>${r.arc.toFixed(2)}°</td></tr>`;}).join('');
  return `<div class="dc-scroll"><table><tr><th>ასაკი</th><th>თარიღი</th><th>დირექცია</th><th>ასპექტი</th><th>რკალი</th></tr>${tr}</table></div>`;
}
function nowPositions(M,key){
  const age=(nowJD()-M.jd)/YEAR;if(age<0)return '';const arc=KEY[key].arc(M,age)*(CONV?-1:1);
  const rows=Object.keys(M.P).map(k=>`<tr><td>${g(k)}</td><td>${fmt(M.P[k])}</td><td>${fmt(M.P[k]+arc)}</td></tr>`).join('');
  return `<h4>დირექციული პოზიციები დღეს · ასაკი ${age.toFixed(2)} · რკალი ${Math.abs(arc).toFixed(2)}°</h4><div class="dc-scroll" style="max-height:none"><table><tr><th>წერტილი</th><th>ნატალური</th><th>დირექციული</th></tr>${rows}</table></div>`;
}
function body(M){
  if(M.jd==null)return '<div class="dc-note">დაბადების თარიღი ვერ წავიკითხე.</div>';
  const seg=`<div class="dc-seg"><button data-cv="0" class="${!CONV?'on':''}">პირდაპირი</button><button data-cv="1" class="${CONV?'on':''}">კონვერსიული</button></div>
    <div class="dc-seg">${[60,90,120].map(v=>`<button data-sp="${v}" class="${SPAN===v?'on':''}">0–${v} წ.</button>`).join('')}</div>`;
  if(TAB==='pd'){
    if(!M.known)return seg+'<div class="dc-note">პრიმარულ დირექციებს სჭირდება ზუსტი დაბადების დრო (ASC/MC).</div>';
    if(M.lat==null)return seg+'<div class="dc-note">დაბადების ადგილის განედი ვერ წავიკითხე.</div>';
    const rows=primary(M,PKEY,CONV,SPAN);
    return seg+`<div class="dc-seg"><button data-pk="pt" class="${PKEY==='pt'?'on':''}">გასაღები: პტოლემეოსი 1°</button><button data-pk="nb" class="${PKEY==='nb'?'on':''}">ნაიბოდი 0°59′08″</button></div>`
      +(rows===null?'<div class="dc-note">გამოთვლა ვერ მოხერხდა.</div>':table(M,rows,true))
      +`<div class="dc-note"><b>პრიმარული დირექციები</b> — დღეღამური ბრუნვა: დაბადების შემდეგ ცის სფეროს ყოველი გრადუსი (სწორი აღმავლობით) უდრის ცხოვრების ერთ წელს. ${CONV?'<b>კონვერსიული:</b> სიგნიფიკატორი (☉ ☽) მიდის პრომისორის ასპექტის წერტილისკენ.':'<b>პირდაპირი:</b> პრომისორის ასპექტის წერტილი მიდის სიგნიფიკატორის მუნდანურ პოზიციამდე.'} სიგნიფიკატორები: ASC, MC, ☉, ☽. მეთოდი — პლაციდუსის ნახევარრკალი (პროპორციული მუნდანური პოზიცია), ზოდიაქოს ასპექტები ეკლიპტიკის განედის გარეშე. ეს მეთოდი არ არის დამოკიდებული არჩეულ სახლების სისტემაზე; პოლარულ განედებზე წერტილები, რომლებიც არ ამოდის/ჩადის, გამოტოვებულია.</div>`;
  }
  const rows=symbolic(M,TAB,CONV,SPAN);
  const note={sa:'<b>სოლარული რკალი</b> — ყველა წერტილი იძრავს იმდენით, რამდენიც პროგრესირებულმა მზემ გაიარა (დაბადებიდან 1 დღე = ცხოვრების 1 წელი). რკალი წლიდან წლამდე იცვლება 57′-დან 61′-მდე, წლის დროის მიხედვით.',
    nb:'<b>ნაიბოდის გასაღები</b> — მზის საშუალო დღიური სვლა, 0°59′08″ ყოველ წელს, ყველასთვის ერთნაირი.',
    pt:'<b>1° = 1 წელი</b> — პტოლემეოსის სიმბოლური გასაღები: ყველა წერტილი იძრავს ზუსტად 1°-ით ყოველ წელს.'}[TAB];
  return seg+table(M,rows,false)+nowPositions(M,TAB)
    +`<div class="dc-note">${note} ${CONV?'<b>კონვერსიული</b> — რკალი აკლდება (წერტილები უკან მიდის).':'<b>პირდაპირი</b> — რკალი ემატება.'} ცხრილში „dir.“ — დირექციული წერტილი, „nat.“ — ნატალური. ოქროსფრად მონიშნულია ±1 წლის ფარგლებში მიმდინარე დირექციები, ნაცრისფრად — გავლილი.${M.known?'':' ASC/MC არ ითვლება — დაბადების დრო უცნობია.'}</div>`;
}
const TABS=[['sa','სოლარული რკალი'],['nb','ნაიბოდი'],['pt','1° = 1 წელი'],['pd','პრიმარული']];
let M_LAST=null;
function draw(){
  const o=$('dr-out');if(!o||!M_LAST)return;const M=M_LAST;
  const who=M.name?`<b>${M.name.replace(/[<>&]/g,'')}</b> · `:'';
  const sun=M.P['მზე']!=null?` · ☉ ${fmt(M.P['მზე'])}`:'';
  o.innerHTML=`<div class="dc-big">${who}${fmtD(M.jd)}${sun}${M.known?` · AC ${fmt(M.P.ASC)} · MC ${fmt(M.P.MC)}`:''}</div>
    <div class="dc-tabs">${TABS.map(x=>`<button type="button" data-t="${x[0]}" class="${x[0]===TAB?'on':''}">${x[1]}</button>`).join('')}</div>${body(M)}`;
  o.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{TAB=b.dataset.t;draw();});
  o.querySelectorAll('[data-cv]').forEach(b=>b.onclick=()=>{CONV=b.dataset.cv==='1';draw();});
  o.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{SPAN=+b.dataset.sp;draw();});
  o.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{PKEY=b.dataset.pk;draw();});
  const nx=$('dc-next'),sc=o.querySelector('.dc-scroll');if(nx&&sc)sc.scrollTop=Math.max(0,nx.offsetTop-sc.clientHeight/3);
}

/* ── own tab + form ── */
const field=(lbl,id,val,min,max)=>`<div class="field"><label>${lbl}</label><input type="number" id="dr-${id}" value="${val}" min="${min}" max="${max}"></div>`;
const PAIRS=['name','day','month','year','hour','minute','second','city','lat','lon','tz'];
function copyFromNatal(){
  for(const k of PAIRS){const a=$('n-'+k),b=$('dr-'+k);if(a&&b&&a.value!=='')b.value=a.value;}
  const tz=$('n-tz-display'),tt=$('dr-tz-display');if(tz&&tt)tt.textContent=tz.textContent;
  const tu=$('n-time-unknown'),dt=$('dr-time-unknown');if(tu&&dt){dt.checked=tu.checked;try{toggleTU('dr');}catch(e){}}
}
function readForm(){
  const v=id=>$('dr-'+id),tu=v('time-unknown').checked;
  return{name:v('name').value.trim(),year:+v('year').value,month:+v('month').value,day:+v('day').value,
    hour:tu?12:+v('hour').value,minute:tu?0:+v('minute').value,second:tu?0:+v('second').value,
    lat:+v('lat').value,lon:+v('lon').value,tz_name:v('tz').value||'UTC',time_unknown:tu};
}
async function run(){
  const o=$('dr-out');
  /* wait for a city lookup still in flight; a city typed or copied without coordinates is looked up now */
  if((!$('dr-lat').value||!$('dr-lon').value)&&$('dr-city').value.trim().length>=2&&!(window._geoPending||{}).dr&&typeof searchCity==='function'){
    o.innerHTML='<div class="dc-note">⏳ ქალაქს ვეძებ…</div>';searchCity('dr');}
  try{await Promise.all(Object.values(window._geoPending||{}));}catch(e){}
  const q=readForm();
  if(!$('dr-lat').value||!$('dr-lon').value){o.innerHTML='<div class="dc-note" style="color:#e8a0a0">შეიყვანეთ დაბადების ქალაქი.</div>';return;}
  o.innerHTML='<div class="dc-note">⏳ ვითვლი…</div>';
  try{
    const {name,...body}=q;
    const r=await fetch(`${BACKEND}/chart`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=JSON.parse(await r.text());if(d.error)throw new Error(d.error);
    M_LAST=model(d,q);draw();
  }catch(e){o.innerHTML=`<div class="dc-note" style="color:#e8a0a0">შეცდომა: ${String(e.message||e).slice(0,200)}</div>`;}
}
function activate(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  $('dr-tab-btn').classList.add('active');
  document.querySelectorAll('.form-section').forEach(s=>s.classList.remove('active'));
  $('form-directions').classList.add('active');
  const ca=$('chart-area');if(ca)ca.style.display='none';
  const acg=$('acg-section');if(acg)acg.style.display='none';
  try{currentMode='directions';}catch(e){}
  if(!$('dr-lat').value&&$('n-lat')&&$('n-lat').value)copyFromNatal();
}
function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!bar||!card||$('dr-tab-btn'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const btn=document.createElement('button');btn.type='button';btn.className='tab-btn';btn.id='dr-tab-btn';btn.textContent='დირექციები';
  btn.onclick=activate;bar.appendChild(btn);
  const sec=document.createElement('div');sec.id='form-directions';sec.className='form-section';
  sec.innerHTML=`
    <div class="person-label">↗ დირექციები</div>
    <div class="dc-note" style="margin:0 0 8px">სოლარული რკალი, ნაიბოდი, 1° = 1 წელი და პრიმარული დირექციები (პლაციდუსი) — ზუსტი ასაკი და თარიღი მთელი ცხოვრებისთვის.
      <button type="button" class="tru-ap" id="dr-copy" style="margin-left:6px;background:none;border:1px solid rgba(240,212,138,.55);color:#F0D48A;border-radius:6px;padding:2px 10px;font-size:10px;cursor:pointer;font-family:inherit">↧ ნატალურიდან</button></div>
    <div class="field wide" style="margin-bottom:10px"><label>სახელი</label><input id="dr-name" placeholder="სახელი"></div>
    <div class="form-grid">${field('დღე','day',1,1,31)}${field('თვე','month',1,1,12)}${field('წელი','year',1990,-3000,3000)}</div>
    <div class="form-grid" id="dr-time-fields">${field('საათი','hour',12,0,23)}${field('წუთი','minute',0,0,59)}${field('წამი','second',0,0,59)}</div>
    <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px">
      <input type="checkbox" id="dr-time-unknown" onchange="toggleTU('dr')" style="width:15px;height:15px;accent-color:#C9A24C;cursor:pointer">
      <label for="dr-time-unknown" style="font-size:11px;letter-spacing:1px;text-transform:none;cursor:pointer">დრო უცნობია (ASC/MC და პრიმარული არ ითვლება)</label>
    </div>
    <div class="field" style="margin-bottom:8px"><label>დაბადების ქალაქი</label>
      <input id="dr-city" placeholder="თბილისი, London, Paris..." oninput="searchCity('dr')">
      <div class="city-hint" id="dr-city-hint"></div></div>
    <div class="form-grid-2" style="margin-bottom:8px">
      <div class="field"><label>განედი</label><input type="number" id="dr-lat" step="0.0001" readonly></div>
      <div class="field"><label>გრძედი</label><input type="number" id="dr-lon" step="0.0001" readonly></div>
    </div>
    <input type="hidden" id="dr-tz" value="UTC">
    <div class="tz-display" id="dr-tz-display">⏳ ქალაქის შეყვანის შემდეგ სარტყელი განისაზღვრება</div>
    <button type="button" class="gen-btn" id="dr-run">↗ დირექციების გამოთვლა ✦</button>
    <div id="dr-out"></div>`;
  card.insertBefore(sec,[...card.children].find(x=>x.id==='hs-bar')||null);
  $('dr-run').addEventListener('click',run);
  $('dr-copy').addEventListener('click',copyFromNatal);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else setTimeout(inject,0);
window._directions={model,symbolic,primary,mundane,eq,solarArcAt,KEY};
})();
