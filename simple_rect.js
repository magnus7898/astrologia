/* simple_rect.js — "მარტივი რექტიფიკაცია" tab for astro.html
   For a birth date + place and a time window, lists the periods of the window in which
   the Ascendant, the Moon and the MC stay in one sign, with a short description of each,
   plus every combination (ASC · Moon · MC). Pick the one that describes the person and
   it is sent to the natal form.
   Ephemeris: Astronomy Engine 2.1.19 (apparent geocentric, ecliptic of date); angles from GAST.
   Load after rectify_tab.js (the tab sits after it).                                      */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const AE_URL='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
let A=null;
const needAE=()=>A?Promise.resolve(A):new Promise((ok,no)=>{if(window.Astronomy){A=window.Astronomy;return ok(A);}const s=document.createElement('script');s.src=AE_URL;s.onload=()=>{A=window.Astronomy;ok(A);};s.onerror=()=>no(new Error('astronomy-engine'));document.head.appendChild(s);});
const D2R=Math.PI/180,R2D=180/Math.PI,n360=x=>((x%360)+360)%360;
const sd=a=>Math.sin(a*D2R),cd=a=>Math.cos(a*D2R),td=a=>Math.tan(a*D2R);
const SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const GL=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(x=>x+'︎');
const SC=['#e0684f','#8fbf6a','#e8d35a','#8fc7e0','#f0a845','#a8c48a','#e8a8c8','#b0506a','#c88ae0','#9a9a8a','#6ac0e8','#7a9ae8'];

/* short descriptions — ASC: look and manner · Moon: feelings and needs · MC: calling and public role */
const D={
 ASC:['სწრაფი, პირდაპირი, ენერგიული; მკვეთრი ნაკვთები, აქტიური მოძრაობა, მოუთმენლობა, ლიდერის მანერა.',
  'მშვიდი, მყარი, ნელი ტემპი; სასიამოვნო ხმა და გარეგნობა, სიჯიუტე, კომფორტისა და გემოვნების სიყვარული.',
  'ცოცხალი, ცნობისმოყვარე, ლაპარაკი და ხელები მოძრაობაში; ახალგაზრდული იერი, მრავალი ინტერესი.',
  'რბილი, ფრთხილი, მზრუნველი; მრგვალი სახე, ცვალებადი განწყობა, ჯერ დაკვირვება — მერე გახსნა.',
  'თვალში საცემი, თბილი, ამაყი; დიდი ღიმილი ან თმა, ღირსების გრძნობა, ყურადღების ცენტრში ყოფნა.',
  'მოწესრიგებული, თავშეკავებული, დაკვირვებული; სუფთა იერი, კრიტიკულობა, დეტალებზე ფიქრი, თავმდაბლობა.',
  'მომხიბლავი, თავაზიანი, ჰარმონიული; სიმეტრიული ნაკვთები, კონფლიქტის თავიდან აცილება, პარტნიორზე ორიენტაცია.',
  'ინტენსიური, ჩაკეტილი, გამჭოლი მზერა; ძლიერი ნებისყოფა, საიდუმლოება, ყველაფერი ან არაფერი.',
  'ღია, მხიარული, თავისუფლების მოყვარე; მაღალი ან მოძრავი აღნაგობა, ოპტიმიზმი, პირდაპირობა, მოგზაურობის ჟინი.',
  'სერიოზული, ზრდასრული, თავშეკავებული; მკვეთრი ძვლოვანი ნაკვთები, პასუხისმგებლობა, ასაკთან ერთად „ახალგაზრდავდება“.',
  'განსხვავებული, მეგობრული, მაგრამ დისტანციური; ორიგინალური სტილი, დამოუკიდებლობა, იდეების ადამიანი.',
  'რბილი, ოცნებობის მიდრეკილებით, ემპათიური; „წყლიანი“ თვალები, ადაპტირება გარემოზე, საზღვრების სისუსტე.'],
 Moon:['ემოციები ჩქარა ინთება და ჩქარა ქრება; სჭირდება მოქმედება და დამოუკიდებლობა, მოუთმენელია.',
  'ემოციურად სტაბილური; სჭირდება უსაფრთხოება, კომფორტი, გემრიელი საჭმელი და ცვლილებები უჭირს.',
  'გრძნობებს ლაპარაკით ამუშავებს; სჭირდება საუბარი, ახალი ინფორმაცია, მრავალფეროვნება.',
  'ძალიან მგრძნობიარე, ოჯახზე და სახლზე მიჯაჭვული; ძლიერი მეხსიერება, ზრუნვის მოთხოვნილება.',
  'სჭირდება აღიარება, სითბო და ყურადღება; გულუხვი, დრამატული, ერთგული.',
  'გრძნობებს წესრიგით და საქმით მართავს; ნერვიულობს დეტალებზე, ეხმარება სხვებს პრაქტიკულად.',
  'სჭირდება ჰარმონია და წყვილი; მარტოობა უჭირს, ემოციურად ეყრდნობა ურთიერთობას.',
  'ღრმა, ძლიერი, ფარული გრძნობები; ეჭვიანობა, ნდობის პრობლემა, სრული ერთგულება.',
  'ემოციურად ოპტიმისტი; სჭირდება სივრცე, თავისუფლება, აზრი და თავგადასავალი.',
  'გრძნობებს თავს იკავებს, „ძლიერი“ ჩანს; სჭირდება სტრუქტურა, საქმე და კონტროლი.',
  'ემოციებს გონებით ამუშავებს, დისტანციურია; სჭირდება მეგობრები და საკუთარი სივრცე.',
  'ძალიან ემპათიური, „სპონჯივით“ იღებს სხვის განწყობას; სჭირდება მარტოობა, მუსიკა, ოცნება.'],
 MC:['კარიერა: ლიდერობა, სპორტი, ბიზნესის დაწყება, სამხედრო/სამაშველო; პირველობის სურვილი.',
  'კარიერა: ფინანსები, ხელოვნება, მიწა, საკვები, სილამაზე; სტაბილური, ნელი, მყარი ზრდა.',
  'კარიერა: კომუნიკაცია, მედია, ვაჭრობა, სწავლება, წერა; რამდენიმე პროფესია ერთად.',
  'კარიერა: ზრუნვა, სახლი, საკვები, ოჯახური ბიზნესი, ისტორია; საზოგადოებრივი „დედის“ როლი.',
  'კარიერა: სცენა, ხელმძღვანელობა, შემოქმედება, ბავშვები; ცნობადობის და აღიარების მოთხოვნილება.',
  'კარიერა: ანალიზი, მედიცინა, მომსახურება, ტექნიკური სამუშაო, რედაქტირება; სიზუსტით ცნობილი.',
  'კარიერა: სამართალი, დიზაინი, დიპლომატია, კონსულტაცია, პარტნიორობა; იმიჯი — სასიამოვნო ადამიანი.',
  'კარიერა: ფსიქოლოგია, კვლევა, ფინანსები, მედიცინა, კრიზისის მართვა; ძალაუფლება და ტრანსფორმაცია.',
  'კარიერა: განათლება, მოგზაურობა, სამართალი, გამომცემლობა, რელიგია/ფილოსოფია; მასწავლებლის იმიჯი.',
  'კარიერა: მენეჯმენტი, სახელმწიფო, ინჟინერია, მშენებლობა; ამბიცია, ეტაპობრივი ასვლა სტატუსამდე.',
  'კარიერა: ტექნოლოგია, მეცნიერება, სოციალური პროექტები, ინოვაცია; არასტანდარტული გზა.',
  'კარიერა: ხელოვნება, მუსიკა, კინო, მედიცინა, სულიერება, ქველმოქმედება; ბუნდოვანი ან ცვალებადი გზა.']};
const LANES=[['ASC','ასცენდენტი','ASC'],['Moon','მთვარე','☽'],['MC','MC (ცის შუა)','MC']];

/* ── time / angles ── */
function tzOffMin(tz,ms){try{const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const p={};f.formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);const u=new Date(0);u.setUTCFullYear(+p.year,+p.month-1,+p.day);u.setUTCHours(+p.hour%24,+p.minute,+p.second,0);return (u.getTime()-ms)/60000;}catch(e){return 0;}}
function localUT(y,m,d,h,mi,tz){const g=new Date(0);g.setUTCFullYear(y,m-1,d);g.setUTCHours(h,mi,0,0);const G=g.getTime();let t=G-tzOffMin(tz,G)*60000;t=G-tzOffMin(tz,t)*60000;return t/864e5-10957.5;}
const ascOf=(ramc,eps,lat)=>n360(Math.atan2(cd(ramc),-(sd(ramc)*cd(eps)+td(lat)*sd(eps)))*R2D);
const mcOf=(ramc,eps)=>n360(Math.atan2(sd(ramc),cd(ramc)*cd(eps))*R2D);
function point(ut,lat,lon){const t=A.MakeTime(ut),eps=A.e_tilt(t).tobl,ramc=n360(A.SiderealTime(t)*15+lon);
  return {ASC:ascOf(ramc,eps,lat),MC:mcOf(ramc,eps),Moon:n360(A.Ecliptic(A.GeoVector('Moon',t,true)).elon)};}
function localHM(ut,tz){const ms=(ut+10957.5)*864e5;try{return new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(ms));}catch(e){return new Date(ms).toISOString().slice(11,16);}}
const dg=x=>{const s=Math.floor(x/30),d=x-s*30;return `${Math.floor(d)}°${String(Math.floor((d%1)*60)).padStart(2,'0')}′ ${GL[s]}`;};

let last=null;
async function run(){
  const out=$('srq-out');const v=id=>+$(id).value;const y=v('srq-year'),m=v('srq-month'),d=v('srq-day');
  const lat=parseFloat($('srq-lat').value),lon=parseFloat($('srq-lon').value),tz=$('srq-tz').value||'UTC';
  if(!y||!m||!d){out.innerHTML='<div class="rc-err">შეიყვანეთ დაბადების თარიღი</div>';return;}
  if(!isFinite(lat)||!isFinite(lon)||(!lat&&!lon)){out.innerHTML='<div class="rc-err">შეიყვანეთ დაბადების ქალაქი</div>';return;}
  const btn=$('srq-go');btn.disabled=true;btn.textContent='⏳ ვითვლი…';
  try{
    await needAE();
    const [h1,m1]=($('srq-from').value||'00:00').split(':').map(Number),[h2,m2]=($('srq-to').value||'23:59').split(':').map(Number);
    const t0=localUT(y,m,d,h1,m1,tz);let t1=localUT(y,m,d,h2,m2,tz);if(t1<=t0)t1+=1;      /* window past midnight */
    const N=Math.max(1,Math.round((t1-t0)*1440));const step=(t1-t0)/N;
    const S=[];for(let i=0;i<=N;i++){const ut=t0+i*step,p=point(ut,lat,lon);S.push({ut,p,s:{ASC:Math.floor(p.ASC/30),MC:Math.floor(p.MC/30),Moon:Math.floor(p.Moon/30)}});}
    const seg=k=>{const r=[];let a=0;for(let i=1;i<=N+1;i++){if(i===N+1||S[i].s[k]!==S[a].s[k]){r.push({k,sg:S[a].s[k],a:S[a].ut,b:S[i-1].ut,deg0:S[a].p[k],deg1:S[i-1].p[k]});a=i;}}return r;};
    const segs={ASC:seg('ASC'),Moon:seg('Moon'),MC:seg('MC')};
    /* combinations */
    const combo=[];let a=0;const key=i=>`${S[i].s.ASC}|${S[i].s.Moon}|${S[i].s.MC}`;
    for(let i=1;i<=N+1;i++){if(i===N+1||key(i)!==key(a)){combo.push({a:S[a].ut,b:S[i-1].ut,s:S[a].s});a=i;}}
    last={t0,t1,tz,segs,combo,B:{y,m,d,lat,lon}};render();
  }catch(e){out.innerHTML=`<div class="rc-err">შეცდომა: ${e.message}</div>`;}
  finally{btn.disabled=false;btn.textContent='✦ ვარიანტების ჩვენება ✦';}
}
const mins=(a,b)=>Math.round((b-a)*1440)+1;
const dur=n=>n>=60?`${Math.floor(n/60)} სთ ${n%60?n%60+' წთ':''}`:`${n} წთ`;
function render(){
  const {t0,t1,tz,segs,combo}=last;const out=$('srq-out');const W=t1-t0;
  const pct=x=>(100*(x-t0)/W).toFixed(3)+'%';
  const lanes=LANES.map(([k,n,ab])=>`<div class="srq-lane"><div class="srq-ln">${n}</div><div class="srq-bar">${segs[k].map((g,i)=>
    `<button type="button" class="srq-seg" data-k="${k}" data-i="${i}" style="left:${pct(g.a)};width:calc(${(100*(g.b-g.a+1/1440)/W).toFixed(3)}% - 1px);background:${SC[g.sg]}" title="${SG[g.sg]} · ${localHM(g.a,tz)}–${localHM(g.b,tz)}">${GL[g.sg]}</button>`).join('')}</div></div>`).join('');
  const ticks=[];for(let i=0;i<=6;i++){const u=t0+W*i/6;ticks.push(`<span style="left:${(100*i/6)}%">${localHM(u,tz)}</span>`);}
  const lists=LANES.map(([k,n])=>`<div class="rc-card"><div class="rc-h">${n} — ${segs[k].length} ვარიანტი</div>${segs[k].map((g,i)=>
    `<div class="srq-it" data-k="${k}" data-i="${i}"><div class="srq-row"><b class="srq-sg" style="color:${SC[g.sg]}">${GL[g.sg]} ${SG[g.sg]}</b><span class="srq-tm">${localHM(g.a,tz)} – ${localHM(g.b,tz)}</span><span class="srq-du">${dur(mins(g.a,g.b))}</span>
     <button type="button" class="ob-btn srq-use" data-k="${k}" data-i="${i}">↪ ნატალურში</button></div><div class="srq-tx">${D[k][g.sg]}</div></div>`).join('')}</div>`).join('');
  const cmb=`<div class="rc-card"><div class="rc-h">ყველა კომბინაცია — ASC · მთვარე · MC (${combo.length})</div>
    <div class="srq-cmb">${combo.map((c,i)=>`<div class="srq-ci"><span class="srq-tm">${localHM(c.a,tz)} – ${localHM(c.b,tz)}</span>
      <span>ASC <b style="color:${SC[c.s.ASC]}">${GL[c.s.ASC]} ${SG[c.s.ASC]}</b></span><span>☽ <b style="color:${SC[c.s.Moon]}">${GL[c.s.Moon]} ${SG[c.s.Moon]}</b></span><span>MC <b style="color:${SC[c.s.MC]}">${GL[c.s.MC]} ${SG[c.s.MC]}</b></span>
      <span class="srq-du">${dur(mins(c.a,c.b))}</span><button type="button" class="ob-btn srq-usec" data-i="${i}">↪ ნატალურში</button></div>`).join('')}</div></div>`;
  out.innerHTML=`<div class="rc-card"><div class="rc-h">დროის ზოლი</div>${lanes}<div class="srq-ticks">${ticks.join('')}</div>
     <div class="rc-sub">დააჭირე ფერად მონაკვეთს — ქვემოთ გამოჩნდება მისი აღწერა. წაიკითხე ASC, მთვარე და MC აღწერები და აირჩიე ის, რომელიც ადამიანს ყველაზე კარგად ახასიათებს — ნატალურში გადაიგზავნება ამ პერიოდის შუა დრო.</div></div>
   ${cmb}<div class="srq-lists">${lists}</div>
   <div class="rc-sub">⚠ ეს უხეში, ნიშნის დონის რექტიფიკაციაა: ის ავიწროებს შუალედს, მაგრამ წუთს ვერ გეტყვის. ზუსტი დროისთვის გამოიყენე „რექტიფიკაცია“ (მოვლენებით) ან „ტრუტინა“.</div>`;
  const pick=(a,b)=>send((a+b)/2);
  out.querySelectorAll('.srq-seg').forEach(x=>x.onclick=()=>{const it=out.querySelector(`.srq-it[data-k="${x.dataset.k}"][data-i="${x.dataset.i}"]`);if(it){out.querySelectorAll('.srq-it.on').forEach(e=>e.classList.remove('on'));it.classList.add('on');it.scrollIntoView({behavior:'smooth',block:'center'});}});
  out.querySelectorAll('.srq-use').forEach(x=>x.onclick=()=>{const g=segs[x.dataset.k][+x.dataset.i];pick(g.a,g.b);});
  out.querySelectorAll('.srq-usec').forEach(x=>x.onclick=()=>{const c=combo[+x.dataset.i];pick(c.a,c.b);});
}
function send(ut){
  const {tz,B}=last;const hm=localHM(ut,tz).split(':');
  const s=(id,val)=>{const e=$(id);if(e)e.value=val;};
  /* local date can move past midnight when the window wraps */
  const ms=(ut+10957.5)*864e5;let dd=B.d,mm=B.m,yy=B.y;
  try{const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);dd=+p.day;mm=+p.month;yy=+p.year;}catch(e){}
  s('n-day',dd);s('n-month',mm);s('n-year',yy);s('n-hour',+hm[0]);s('n-minute',+hm[1]);s('n-lat',B.lat);s('n-lon',B.lon);s('n-tz',tz);
  const c=$('n-city'),sc=$('srq-city');if(c&&sc&&sc.value)c.value=sc.value;
  const td=$('n-tz-display'),sd2=$('srq-tz-display');if(td&&sd2)td.textContent=sd2.textContent;
  const tu=$('n-time-unknown');if(tu&&tu.checked){tu.checked=false;if(typeof toggleTU==='function')toggleTU('n');}
  if(typeof setMode==='function'){const nb=document.querySelector(".tab-bar .tab-btn[onclick*=\"'natal'\"]");if(nb)nb.click();else setMode('natal');}
  setTimeout(()=>{if(typeof generate==='function')generate();},80);
}

const CSS=`
#form-srect .rc-note{font-size:13px;line-height:1.6;color:rgba(240,232,214,.86);margin-bottom:10px}
#form-srect .rc-row2{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin:8px 0}
#form-srect .rc-row2 .field{margin:0}#form-srect .rc-row2 input{width:auto}
#form-srect .ob-btn{background:rgba(201,162,76,.1);border:1px solid rgba(201,162,76,.45);color:#F0D48A;border-radius:16px;padding:6px 12px;font-size:12.5px;cursor:pointer;font-family:inherit}
#srq-out{margin-top:14px;display:grid;gap:12px}
#srq-out .rc-card{border:1px solid rgba(201,162,76,.45);border-radius:10px;padding:12px 14px;background:rgba(4,26,18,.6)}
#srq-out .rc-h{font-family:Cinzel,'Noto Serif Georgian',serif;letter-spacing:2px;color:#E3BE84;font-size:12px;margin-bottom:8px}
#srq-out .rc-sub{font-size:11.5px;color:rgba(200,204,212,.8);margin-top:8px;line-height:1.55}
#form-srect .rc-err{color:#ff9a8a;font-size:13px;margin-top:10px}
.srq-lane{display:grid;grid-template-columns:110px 1fr;gap:8px;align-items:center;margin:5px 0}
.srq-ln{font-size:12px;color:#EDE6D8;text-align:right}
.srq-bar{position:relative;height:30px;border-radius:6px;background:rgba(0,0,0,.25);overflow:hidden}
.srq-seg{position:absolute;top:0;bottom:0;border:none;border-radius:3px;cursor:pointer;color:#14100a;font:600 14px 'Segoe UI Symbol','DejaVu Sans',serif;overflow:hidden;padding:0;opacity:.85;transition:opacity .15s}
.srq-seg:hover{opacity:1;outline:1px solid #FFF0C8}
.srq-ticks{position:relative;height:16px;margin-left:118px;font-size:10.5px;color:rgba(232,214,174,.7)}
.srq-ticks span{position:absolute;transform:translateX(-50%)}.srq-ticks span:first-child{transform:none}.srq-ticks span:last-child{transform:translateX(-100%)}
.srq-lists{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.srq-it{padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.06);border-radius:6px;transition:background .2s}
.srq-it.on{background:rgba(201,162,76,.14)}
.srq-row,.srq-ci{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:13px;color:#e2dccf}
.srq-ci{padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.srq-sg{font-size:14px}.srq-tm{font-family:Cinzel,serif;color:#F3DDA4;font-size:13.5px}
.srq-du{color:rgba(200,204,212,.65);font-size:12px}
.srq-row .ob-btn,.srq-ci .ob-btn{margin-left:auto}
.srq-tx{font-size:12.5px;line-height:1.6;color:rgba(226,220,207,.86);margin-top:5px}
.srq-cmb{max-height:340px;overflow:auto}
@media(max-width:620px){.srq-lane{grid-template-columns:70px 1fr}.srq-ticks{margin-left:78px}}`;
function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');if(!bar||!card)return false;if($('form-srect'))return true;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const after=$('rc-tab-btn')||$('tru-tab-btn')||bar.querySelector(".tab-btn[onclick*=\"'natal'\"]");
  const b=document.createElement('button');b.type='button';b.className='tab-btn';b.id='srq-tab-btn';b.textContent='მარტივი რექტიფიკაცია';b.setAttribute('onclick',"setMode('srect')");
  if(after)after.after(b);else bar.appendChild(b);
  const sec=document.createElement('div');sec.id='form-srect';sec.className='form-section';
  sec.innerHTML=`<div class="person-label">🕰 მარტივი რექტიფიკაცია — ASC, მთვარე, MC</div>
   <div class="rc-note">თუ დაბადების დრო არ იცი ან მიახლოებით იცი, შეიყვანე თარიღი, ქალაქი და შესაძლო შუალედი. გამოჩნდება, რომელი ასცენდენტი, მთვარის ნიშანი და MC შეიძლება იყოს ამ შუალედში, თითოეულის მოკლე აღწერით. აირჩიე ის, რაც ადამიანს ემთხვევა.</div>
   <div class="form-grid"><div class="field"><label>დღე</label><input type="number" id="srq-day" min="1" max="31"></div><div class="field"><label>თვე</label><input type="number" id="srq-month" min="1" max="12"></div><div class="field"><label>წელი</label><input type="number" id="srq-year"></div></div>
   <div class="field" style="margin-bottom:8px"><label>ქალაქი</label><input id="srq-city" placeholder="თბილისი, London, Paris..." oninput="searchCity('srq')"><div class="city-hint" id="srq-city-hint"></div></div>
   <div class="form-grid-2" style="margin-bottom:4px"><div class="field"><label>განედი</label><input type="number" id="srq-lat" step="0.0001"></div><div class="field"><label>გრძედი</label><input type="number" id="srq-lon" step="0.0001"></div></div>
   <input type="hidden" id="srq-tz" value="UTC"><div class="tz-display" id="srq-tz-display" style="margin-bottom:8px">—</div>
   <div class="rc-row2"><div class="field"><label>შუალედი: დან</label><input type="time" id="srq-from" value="00:00"></div><div class="field"><label>მდე</label><input type="time" id="srq-to" value="23:59"></div>
     <button type="button" class="ob-btn" id="srq-copy">⇩ ნატალური ფორმიდან</button></div>
   <button class="gen-btn" id="srq-go" type="button">✦ ვარიანტების ჩვენება ✦</button>
   <div id="srq-out"></div>`;
  card.insertBefore(sec,$('form-synastry')||null);
  $('srq-go').onclick=run;
  $('srq-copy').onclick=()=>{const c=(a,b)=>{const x=$(a),y=$(b);if(x&&y&&x.value!=='')y.value=x.value;};
    c('n-day','srq-day');c('n-month','srq-month');c('n-year','srq-year');c('n-city','srq-city');c('n-lat','srq-lat');c('n-lon','srq-lon');c('n-tz','srq-tz');
    const td=$('n-tz-display'),rd=$('srq-tz-display');if(td&&rd)rd.textContent=td.textContent;};
  return true;
}
function hook(){
  if(typeof window.setMode!=='function'||window.setMode._sr)return;
  const o=window.setMode;const w=function(m){const r=o.apply(this,arguments);
    if(m==='srect')document.querySelectorAll('.tab-bar .tab-btn').forEach(b=>b.classList.toggle('active',b.id==='srq-tab-btn'));
    return r;};w._sr=true;for(const k in o)w[k]=o[k];window.setMode=w;
}
function boot(){if(!inject()){let n=0;const t=setInterval(()=>{if(inject()||++n>60)clearInterval(t);},250);}
  setTimeout(hook,0);window.addEventListener('load',()=>setTimeout(hook,90));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window._srect={run,get last(){return last;}};
})();
