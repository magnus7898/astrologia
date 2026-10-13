/* tarot_spreads.js — extra spreads for tarot.html (load after the main script).
   · სიყვარული: გული (8, heart-shaped), სარკე, დაბრუნდება?, კარმული კავშირი, სამკუთხედი
   · სიღრმე:    სიცოცხლის ხე (10 სეფირა), ზოდიაქოს წრე (12 სახლი + ცენტრი)
   · პროგნოზი:  კვირა (7 დღე, პლანეტარული), 4 სეზონი, 12 თვე, 52 კვირა, 365 დღე
   The four year forecasts are drawn from as many shuffled decks as needed (each run of
   78 / 22 cards has no repeats), are tied to real dates and are kept per start date in
   localStorage, so the forecast does not change on reload.                              */
(function(){
'use strict';
if(typeof SPREADS==='undefined'||typeof THEMES==='undefined'||typeof DECK==='undefined')return;
const $=id=>document.getElementById(id);
const NARROW=window.innerWidth<640;
const VS='︎';

/* ═════════════ standard spreads (rendered by tarot.html itself) ═════════════ */
const NEW=[
 {id:'heart',g:'სიყვარული',t:'გული — ორი ადამიანი',shape:'heart',
  d:'რვა ბარათი გულის ფორმით: საერთო ენერგია, მისი და შენი აზრები, გრძნობები და ქმედებები, და კავშირის მომავალი.',
  p:[['საერთო ენერგია','რა ენერგია ქმნის თქვენს კავშირს ახლა',3,2],
     ['ჩემი აზრები','რას ფიქრობ შენ მასზე და ურთიერთობაზე',2,1],
     ['მისი აზრები','რას ფიქრობს ის შენზე',4,1],
     ['ჩემი გრძნობები','რას გრძნობ სინამდვილეში',1,2],
     ['მისი გრძნობები','რას გრძნობს ის შენ მიმართ',5,2],
     ['ჩემი ქმედებები','როგორ იქცევი, რას აკეთებ ურთიერთობისთვის',2,3],
     ['მისი ქმედებები','როგორ იქცევა და რას აპირებს',4,3],
     ['კავშირის მომავალი','საით მიდის ურთიერთობა',3,4]]},
 {id:'mirror',g:'სიყვარული',t:'სარკე — შენ და ის',
  d:'ცხრა ბარათი: ერთი და იგივე კითხვები ორივე მხრიდან და საერთო რჩევა.',
  p:[['როგორ ვხედავ მას','შენი შთაბეჭდილება მასზე',1,1],['როგორ მხედავს','მისი შთაბეჭდილება შენზე',3,1],
     ['რა მინდა მისგან','შენი მოლოდინი',1,2],['რა სურს ჩემგან','მისი მოლოდინი',3,2],
     ['რას ვაძლევ','შენი წვლილი ურთიერთობაში',1,3],['რას მაძლევს','მისი წვლილი ურთიერთობაში',3,3],
     ['ჩემი შიში','რა გაშინებს ამ ურთიერთობაში',1,4],['მისი შიში','რისი ეშინია მას',3,4],
     ['რჩევა ორივესთვის','რა გააძლიერებს კავშირს',2,5]]},
 {id:'ex',g:'სიყვარული',t:'დაბრუნდება?',
  d:'ექვსი ბარათი დასრულებულ ურთიერთობაზე: მიზეზი, მისი ახლანდელი მდგომარეობა და შანსი.',
  p:[['რატომ დასრულდა','ნამდვილი მიზეზი',1,1],['რას გრძნობს ახლა','მისი გრძნობები დღეს',2,1],['რას ფიქრობს დაბრუნებაზე','მისი განზრახვა',3,1],
     ['ჩემი მზადყოფნა','მზად ხარ თუ არა',1,2],['რა აბრკოლებს','რა დგას თქვენ შორის',2,2],['შედეგი','სავარაუდო განვითარება',3,2]]},
 {id:'karmic',g:'სიყვარული',t:'კარმული კავშირი',
  d:'ხუთი ბარათი იმაზე, რატომ შეხვდით და რას ასწავლით ერთმანეთს.',
  p:[['კავშირის ფესვი','რა მოგყვებათ წარსულიდან',2,1],['რისთვის შევხვდით','შეხვედრის აზრი',2,2],
     ['ჩემი გაკვეთილი','რას მასწავლის ის',1,3],['მისი გაკვეთილი','რას ასწავლი შენ მას',3,3],['ერთობლივი გზა','რისი გაკეთება შეგიძლიათ ერთად',2,4]]},
 {id:'triangle',g:'სიყვარული',t:'სამკუთხედი',
  d:'შვიდი ბარათი ვითარებისთვის, სადაც სამი ადამიანია ჩართული.',
  p:[['მე','შენი პოზიცია',1,3],['ის','მისი პოზიცია',3,1],['მესამე','მესამე ადამიანის როლი',5,3],
     ['მე და ის','რა გაკავშირებთ',2,2],['ის და მესამე','რა აკავშირებს მათ',4,2],['მე და მესამე','როგორ მოქმედებს ის ჩემზე',3,3],['შედეგი','როგორ გადაწყდება ვითარება',3,4]]},

 {id:'tree',g:'სიღრმე',t:'სიცოცხლის ხე',
  d:'ათი ბარათი კაბალის ათ სეფირაზე — სულის მიზნიდან მატერიალურ შედეგამდე.',
  p:[['1 · კეთერი — გვირგვინი','სულის მიზანი, უმაღლესი იდეა',2,1],['2 · ხოხმა — სიბრძნე','შემოქმედებითი იმპულსი, ხედვა',3,2],
     ['3 · ბინა — გაგება','ფორმა, საზღვრები, სიღრმისეული გააზრება',1,2],['4 · ხესედი — წყალობა','ზრდა, გულუხვობა, მხარდაჭერა',3,3],
     ['5 · გებურა — ძალა','ბრძოლა, დისციპლინა, რისი მოკვეთა მჭირდება',1,3],['6 · ტიფერეთი — სილამაზე','გული, ჰარმონია, შენი ცენტრი',2,4],
     ['7 · ნეცახი — გამარჯვება','გრძნობები, სიყვარული, შემოქმედება',3,5],['8 · ჰოდი — დიდება','გონება, სიტყვა, სწავლა',1,5],
     ['9 · იესოდი — საფუძველი','ქვეცნობიერი, სიზმრები, ინსტინქტები',2,6],['10 · მალხუთი — სამეფო','სხეული, მატერია, შედეგი',2,7]]},
 {id:'zodiac',g:'სიღრმე',t:'ზოდიაქოს წრე',
  d:'ცამეტი ბარათი: თითო ასტროლოგიურ სახლზე (ASC მარცხნივ, საათის ისრის საწინააღმდეგოდ) და ცენტრში — მთავარი თემა.',
  p:[['I · პიროვნება','შენ, შენი იმიჯი და ენერგია',1,3],['II · ფული','შემოსავალი, ღირებულებები, რესურსი',1,4],
     ['III · კომუნიკაცია','ახლო გარემო, სწავლა, მგზავრობა',2,5],['IV · სახლი','ოჯახი, ფესვები, საცხოვრებელი',3,5],
     ['V · სიყვარული','რომანი, შემოქმედება, ბავშვები',4,5],['VI · სამსახური','ყოველდღიური შრომა, ჯანმრთელობა',5,4],
     ['VII · პარტნიორობა','ქორწინება, ხელშეკრულებები, ღია მოწინააღმდეგე',5,3],['VIII · ტრანსფორმაცია','კრიზისი, სხვისი ფული, სიღრმე',5,2],
     ['IX · ჰორიზონტი','შორეული მოგზაურობა, რწმენა, უმაღლესი ცოდნა',4,1],['X · კარიერა','სტატუსი, მიზანი, საზოგადოებრივი როლი',3,1],
     ['XI · მეგობრები','გუნდი, იმედები, მხარდამჭერები',2,1],['XII · ფარული','ქვეცნობიერი, განმარტოება, სულიერება',1,2],
     ['მთავარი თემა','რა აერთიანებს მთელ წრეს',3,3]]},
];
/* the coming week: day names with their planetary rulers, starting today */
(()=>{
  const DAY=['კვირა ☉','ორშაბათი ☽','სამშაბათი ♂','ოთხშაბათი ☿','ხუთშაბათი ♃','პარასკევი ♀','შაბათი ♄'];
  const MEAN=['მზე — ნება, სიხარული, თვითგამოხატვა','მთვარე — ემოციები, სახლი, ინტუიცია','მარსი — მოქმედება, ენერგია, კონფლიქტი',
    'მერკური — კომუნიკაცია, საქმეები, მგზავრობა','იუპიტერი — ზრდა, იღბალი, სწავლა','ვენერა — სიყვარული, სილამაზე, სიამოვნება','სატურნი — პასუხისმგებლობა, შრომა, საზღვრები'];
  const sp={id:'week7',g:'პროგნოზი',t:'კვირა — 7 დღე',d:'კვირის თემა და თითო ბარათი მომდევნო შვიდი დღიდან თითოეულზე, დღის პლანეტის მითითებით.',p:[]};
  sp.p.push(['კვირის თემა','მთავარი ენერგია მთელი კვირისთვის',NARROW?2:4,1]);
  const t=new Date();
  for(let i=0;i<7;i++){const d=new Date(t.getFullYear(),t.getMonth(),t.getDate()+i,12),w=d.getDay();
    const lab=`${DAY[w].replace(/ (.)$/,' $1'+VS)} · ${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;
    sp.p.push([lab,MEAN[w],NARROW?1+(i%4):1+i,NARROW?2+Math.floor(i/4):2]);}
  NEW.push(sp);
})();

/* ═════════════ the four year forecasts (own renderer) ═════════════ */
const FCK={
 s4:{t:'4 სეზონი',n:'4',d:'ოთხი არკანი ოთხ ასტრონომიულ სეზონზე (ბუნიობიდან მზებუდობამდე), დაწყებული იმ სეზონიდან, რომელშიც ათვლის დღე ხვდება.'},
 m12:{t:'12 თვე',n:'12',d:'თორმეტი არკანი — თითო თვეზე. 1 იანვრიდან ათვლისას კალენდარული თვეებია, სხვა დღიდან — იმ დღიდან ერთ თვემდე.'},
 w52:{t:'52 კვირა',n:'52',d:'ორმოცდათორმეტი არკანი — თითო კვირაზე, ათვლის დღიდან. ბოლო კვირა წლის დარჩენილ დღეებსაც მოიცავს.'},
 y365:{t:'365 დღე',n:'365',d:'სრული წლის პროგნოზი: თითო არკანი წლის ყოველ დღეზე (ნაკიან წელს — 366), კალენდრის სახით.'},
};
for(const k in FCK)NEW.push({id:k,g:'პროგნოზი',t:'წლის პროგნოზი · '+FCK[k].t,d:FCK[k].d,fc:k,
  p:Array.from({length:+FCK[k].n},()=>['','',1,1])});
NEW.forEach(s=>{if(!SPREADS.some(x=>x.id===s.id))SPREADS.push(s);});

/* theme tile */
if(typeof ICO!=='undefined')ICO.time='<rect x="5" y="7" width="22" height="20" rx="2"/><path d="M5 12.5h22M11 4.5v5M21 4.5v5"/><path d="M10 17h2M15 17h2M20 17h2M10 21.5h2M15 21.5h2" opacity=".6"/><circle cx="21" cy="21.5" r="1.4" fill="currentColor"/>';
if(!THEMES.some(t=>t.key==='time'))THEMES.push({g:'პროგნოზი',key:'time',sub:'Forecast · Year',c:'#e8c95a',ctx:null});

/* ═════════════ CSS ═════════════ */
const heartSVG=encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 92"><path d="M50 88C22 66 4 50 4 28 4 14 15 4 28 4c9 0 17 5 22 13C55 9 63 4 72 4c13 0 24 10 24 24 0 22-18 38-46 60z" fill="rgba(224,85,133,.07)" stroke="rgba(224,85,133,.45)" stroke-width=".7"/></svg>');
const css=document.createElement('style');css.textContent=`
.table.shape-heart{background:url("data:image/svg+xml,${heartSVG}") center 46%/100% 100% no-repeat;padding:18px 26px 34px}
#fc{display:none}
body.fc-on #fc{display:block}
body.fc-on .ask,body.fc-on .table-wrap,body.fc-on #reading{display:none!important}
#fc .fc-ctl{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px 16px;margin-bottom:16px;display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center}
#fc .fc-ctl label{font-size:12px;color:var(--ink-mid);display:flex;align-items:center;gap:6px}
#fc input[type=date],#fc select{background:rgba(10,8,24,.8);border:1px solid rgba(201,168,76,.25);border-radius:6px;color:var(--ink);padding:6px 9px;font:inherit;font-size:12.5px;color-scheme:dark}
#fc .fc-q{background:none;border:1px solid var(--border);color:var(--ink-mid);border-radius:12px;padding:3px 10px;font:inherit;font-size:11px;cursor:pointer}
#fc .fc-q:hover{border-color:var(--border-h);color:var(--ink)}
#fc .fc-ctl .btn{margin-left:auto}
#fc .fc-info{font-size:11.5px;color:var(--ink-dim);width:100%}
.fc-f{position:relative;overflow:hidden;border-radius:6px;flex:none;box-shadow:0 4px 14px rgba(0,0,0,.35)}
.fc-f .fc-fi{position:absolute;left:0;top:0;width:120px;height:206px;transform-origin:0 0}
.fc-f .fc-fi .cf{border-radius:7px}
.fc-now{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start;background:var(--surface);border:1px solid var(--border-h);border-radius:8px;padding:16px 18px;margin-bottom:16px}
.fc-now .lb{font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;color:var(--gold)}
.fc-now .nm{font-size:17px;color:var(--gold-lt);margin:2px 0 3px}
.fc-now .mn{font-size:13px;color:var(--ink-mid);line-height:1.7}
.fc-grid{display:grid;gap:14px 12px;justify-content:center;margin:4px 0 18px}
.fc-cell{display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;padding:6px;border-radius:8px;border:1px solid transparent;transition:border-color .2s,background .2s}
.fc-cell:hover{border-color:var(--border-h);background:rgba(201,168,76,.05)}
.fc-cell.now{border-color:var(--gold);background:rgba(201,168,76,.09)}
.fc-cell .pl{font-size:11px;color:var(--ink-mid);text-align:center;line-height:1.3}
.fc-cell .pl b{display:block;color:var(--gold-lt);font-weight:400;font-size:12px}
.fc-cell .cn{font-size:10px;color:var(--ink-dim);text-align:center;line-height:1.25;max-width:130px}
.fc-cal{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin:4px 0 18px}
.fc-mo{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 10px 12px}
.fc-mo h5{font-family:'Cinzel',serif;font-weight:400;font-size:11px;letter-spacing:2px;color:var(--gold);margin-bottom:6px;display:flex;justify-content:space-between}
.fc-mo h5 span{font-family:inherit;letter-spacing:0;color:var(--ink-dim);font-size:10px}
.fc-wk{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.fc-wk .h{font-size:9px;color:var(--ink-dim);text-align:center}
.fc-d{position:relative;aspect-ratio:1/1.15;border-radius:4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);font-size:10.5px;color:var(--ink);line-height:1.05;overflow:hidden}
.fc-d i{position:absolute;left:3px;top:1px;font-style:normal;font-size:8.5px;color:var(--ink-dim)}
.fc-d b{font-weight:400;font-family:'Cinzel',serif;font-size:11px;display:flex;align-items:center;gap:1px}
.fc-d b svg{width:10px;height:10px;stroke:currentColor;fill:none;stroke-width:1.8}
.fc-d.rv::after{content:'↓';position:absolute;right:3px;top:0;font-size:9px;color:#e58c8c}
.fc-d:hover{border-color:var(--border-h)}
.fc-d.now{outline:2px solid var(--gold);outline-offset:-1px}
.fc-d.el-fire{background:rgba(226,104,60,.16);color:#f3b49a}.fc-d.el-water{background:rgba(74,144,217,.16);color:#a9cdf2}
.fc-d.el-air{background:rgba(201,194,160,.12);color:#e4dfc6}.fc-d.el-earth{background:rgba(95,174,110,.15);color:#a8dcb2}
.fc-d.el-major{background:rgba(167,123,219,.22);color:#dcc6f7}
.fc-legend{font-size:11px;color:var(--ink-dim);display:flex;flex-wrap:wrap;gap:12px;margin:-6px 0 14px}
.fc-legend span::before{content:'';display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px;background:var(--c)}
.fc-top{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.fc-top span{font-size:11.5px;border:1px solid var(--border);border-radius:12px;padding:2px 9px;color:var(--ink-mid)}
#fc .reading{display:block}
@media(max-width:640px){.fc-now{grid-template-columns:1fr;justify-items:center}#fc .fc-ctl .btn{margin-left:0;width:100%}}
`;document.head.appendChild(css);

/* ═════════════ dates ═════════════ */
const MON=['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
const SEAS=['გაზაფხული','ზაფხული','შემოდგომა','ზამთარი'];
const SEAS_M=['დასაწყისი, თესვა, ახალი იმპულსი','აყვავება, აქტივობა, სისრულე','მოსავალი, შეფასება, გაშვება','შინაგანი მუშაობა, დასვენება, მომზადება'];
const day=(y,m,d)=>new Date(y,m,d,12);
const addD=(d,n)=>day(d.getFullYear(),d.getMonth(),d.getDate()+n);
const dn=d=>Math.round(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);
const p2=n=>String(n).padStart(2,'0');
const fmt=d=>`${p2(d.getDate())}.${p2(d.getMonth()+1)}`;
const fmtY=d=>`${fmt(d)}.${d.getFullYear()}`;
const iso=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
function addM(d,n){const y=d.getFullYear(),m=d.getMonth()+n,last=new Date(y,m+1,0).getDate();return day(y,m,Math.min(d.getDate(),last));}
/* equinoxes & solstices — Meeus, Astronomical Algorithms ch. 27 (mean terms, ±1 day) */
function seasonStarts(y){
  const T=[[2451623.80984,365242.37404,0.05169,-0.00411,-0.00057],[2451716.56767,365241.62603,0.00325,0.00888,-0.00030],
           [2451810.21715,365242.01767,-0.11575,0.00337,0.00078],[2451900.05952,365242.74049,-0.06223,-0.00823,0.00032]];
  const out=[];for(let yy=y-1;yy<=y+2;yy++){const Y=(yy-2000)/1000;
    T.forEach((t,i)=>{const jd=t[0]+t[1]*Y+t[2]*Y*Y+t[3]*Y**3+t[4]*Y**4,u=new Date((jd-2440587.5)*864e5);out.push([day(u.getFullYear(),u.getMonth(),u.getDate()),i]);});}
  return out.sort((a,b)=>a[0]-b[0]);
}
function periods(kind,start){
  const end=addD(addM(start,12),-1),P=[];
  if(kind==='y365'){for(let d=start;dn(d)<=dn(end);d=addD(d,1))P.push({a:d,b:d,lab:fmt(d)});}
  else if(kind==='w52'){for(let i=0;i<52;i++){const a=addD(start,7*i),b=i===51?end:addD(a,6);P.push({a,b,lab:`კვირა ${i+1}`,sub:`${fmt(a)} – ${fmt(b)}`});}}
  else if(kind==='m12'){const cal=start.getDate()===1;
    for(let i=0;i<12;i++){const a=addM(start,i),b=addD(addM(start,i+1),-1);
      P.push({a,b,lab:cal?`${MON[a.getMonth()]} ${a.getFullYear()}`:`${fmt(a)} – ${fmt(b)}`,sub:cal?'':`${MON[a.getMonth()]} ${a.getFullYear()}`});}}
  else{const S=seasonStarts(start.getFullYear());let k=0;while(k+1<S.length&&dn(S[k+1][0])<=dn(start))k++;
    for(let i=0;i<4;i++){const a=i?S[k+i][0]:start,b=addD(S[k+i+1][0],-1),s=S[k+i][1];
      P.push({a,b,lab:SEAS[s],sub:`${fmtY(a)} – ${fmtY(b)}`,mean:SEAS_M[s],s});}}
  return P;
}

/* ═════════════ draw & storage ═════════════ */
const R=n=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;};
function deal(n,pool,useRev){const out=[];while(out.length<n){const d=pool.slice();for(let i=d.length-1;i>0;i--){const j=R(i+1);[d[i],d[j]]=[d[j],d[i]];}
  for(const c of d){if(out.length>=n)break;out.push({c,rev:useRev&&R(2)===1});}}return out;}
const FC={kind:null,start:null,deck:'full',rev:true,ctx:null,cards:null,P:[],zi:-1};
const KEY=()=>`magnus_tarot_fc_${FC.kind}_${iso(FC.start)}_${FC.deck}`;
function load(){try{const v=JSON.parse(localStorage.getItem(KEY())||'null');if(!v||!Array.isArray(v.cards))return null;
  const cs=v.cards.map(x=>({c:DECK.find(c=>c.id===x.id),rev:!!x.rev}));return cs.every(x=>x.c)&&cs.length===FC.P.length?cs:null;}catch(e){return null;}}
function save(){try{localStorage.setItem(KEY(),JSON.stringify({cards:FC.cards.map(x=>({id:x.c.id,rev:x.rev})),t:Date.now()}));}catch(e){}}
try{const s=JSON.parse(localStorage.getItem('magnus_tarot_fc_opts')||'null');if(s){FC.deck=s.deck||'full';FC.rev=s.rev!==false;FC.ctx=s.ctx||null;if(s.start)FC.start=new Date(s.start+'T12:00');}}catch(e){}
const saveOpts=()=>{try{localStorage.setItem('magnus_tarot_fc_opts',JSON.stringify({deck:FC.deck,rev:FC.rev,ctx:FC.ctx,start:iso(FC.start)}));}catch(e){}};

/* ═════════════ rendering ═════════════ */
const ELC={fire:'var(--fire)',water:'var(--water)',air:'var(--air)',earth:'var(--earth)',major:'var(--major)'};
const ELN={fire:'ცეცხლი',water:'წყალი',air:'ჰაერი',earth:'მიწა',major:'დიდი არკანი'};
const face=(c,rev,w)=>`<div class="fc-f" style="width:${w}px;height:${Math.round(w*1.72)}px"><div class="fc-fi" style="transform:scale(${w/120})">${faceHTML(c,rev)}</div></div>`;
const cname=c=>(c.major?ROMAN[c.n]+' ':'')+c.name;
const spCtx=()=>({g:'პროგნოზი',ctx:FC.ctx});
const short=c=>c.major?ROMAN[c.n]:`${RANK_SHORT[c.rank]}${svgIcon(c.suit)}`;
function host(){let h=$('fc');if(h)return h;h=document.createElement('div');h.id='fc';
  const tw=document.querySelector('.table-wrap');tw.parentNode.insertBefore(h,tw);return h;}
function nowIdx(){const t=dn(new Date());return FC.P.findIndex(p=>dn(p.a)<=t&&t<=dn(p.b));}
function render(){
  const H=host(),K=FCK[FC.kind],cards=FC.cards,N=FC.P.length;
  const end=FC.P[N-1].b;
  let h=`<div class="fc-ctl">
    <label>ათვლა <input type="date" id="fc-start" value="${iso(FC.start)}"></label>
    <button class="fc-q" data-q="jan">1 იანვარი</button><button class="fc-q" data-q="today">დღეიდან</button>
    <label>კოლოდა <select id="fc-deck"><option value="full"${FC.deck==='full'?' selected':''}>სრული — 78</option><option value="major"${FC.deck==='major'?' selected':''}>დიდი არკანი — 22</option></select></label>
    <label>წაკითხვა <select id="fc-ctx">${[['','ზოგადი'],['l','სიყვარული'],['w','საქმე და ფინანსები'],['h','ენერგია და ჯანმრთელობა'],['s','სულიერი გზა']].map(([v,t])=>`<option value="${v}"${(FC.ctx||'')===v?' selected':''}>${t}</option>`).join('')}</select></label>
    <label><input type="checkbox" id="fc-rev"${FC.rev?' checked':''}> შებრუნებული</label>
    <button class="btn" id="fc-draw">${cards?'↻ ახლიდან გაშლა':'✦ აურიე და გაშალე'}</button>
    <div class="fc-info">პერიოდი: ${fmtY(FC.start)} – ${fmtY(end)} · ${N} ${FC.kind==='y365'?'დღე':'არკანი'}${cards?' · შენახულია ამ ბრაუზერში — გადატვირთვისას იგივე დარჩება':''}</div></div>`;
  if(!cards){H.innerHTML=h+`<div class="reading"><div class="note" style="margin:0">აირჩიე ათვლის დღე და დააჭირე „აურიე და გაშალე“. ${N>(FC.deck==='major'?22:78)?`ბარათები ${Math.ceil(N/(FC.deck==='major'?22:78))} არეული კოლოდიდან მოდის — ყოველ ${FC.deck==='major'?22:78}-ში გამეორება არ არის.`:''}</div></div>`;bind();return;}
  const ni=nowIdx();
  if(ni>=0){const {c,rev}=cards[ni],p=FC.P[ni];
    h+=`<div class="fc-now"><div style="cursor:pointer" data-z="${ni}">${face(c,rev,NARROW?150:130)}</div><div>
      <div class="lb">ახლა · ${FC.kind==='y365'?'დღეს, '+fmtY(p.a):p.lab+(p.sub?' · '+p.sub:'')}</div>
      <div class="nm">${cname(c)}${rev?' <span style="color:#e58c8c;font-size:12px">შებრუნებული</span>':''}</div>
      <div class="tags" style="font-size:11px;color:var(--ink-dim);margin-bottom:6px">${cardTags(c)}</div>${richText(c,rev,spCtx())}</div></div>`;}
  if(FC.kind==='y365')h+=calendar(ni);
  else{
    const w=FC.kind==='s4'?(NARROW?140:170):FC.kind==='m12'?(NARROW?92:120):(NARROW?62:78);
    const cols=FC.kind==='s4'?(NARROW?2:4):FC.kind==='m12'?(NARROW?3:6):(NARROW?4:'auto-fill');
    h+=`<div class="fc-grid" style="grid-template-columns:${cols==='auto-fill'?`repeat(auto-fill,minmax(${w+14}px,1fr))`:`repeat(${cols},${w+14}px)`}">${cards.map(({c,rev},i)=>{const p=FC.P[i];
      return `<div class="fc-cell${i===ni?' now':''}" data-z="${i}"><div class="pl"><b>${p.lab}</b>${p.sub||''}</div>${face(c,rev,w)}<div class="cn">${cname(c)}${rev?' ↓':''}</div></div>`;}).join('')}</div>`;
  }
  h+=`<div class="reading">${summary()}${FC.kind==='s4'||FC.kind==='m12'?list():FC.kind==='w52'?`<details style="margin-top:12px"><summary style="cursor:pointer;color:var(--gold);font-size:12.5px">ყველა კვირის განმარტება</summary>${list()}</details>`:''}</div>`;
  H.innerHTML=h;bind();
}
function calendar(ni){
  const by=new Map();FC.P.forEach((p,i)=>{const k=p.a.getFullYear()*12+p.a.getMonth();if(!by.has(k))by.set(k,[]);by.get(k).push(i);});
  let h=`<div class="fc-legend">${['fire','water','air','earth','major'].map(k=>`<span style="--c:${ELC[k]}">${ELN[k]}</span>`).join('')}<span style="--c:transparent"><b style="color:#e58c8c;font-weight:400">↓</b> შებრუნებული</span></div><div class="fc-cal">`;
  for(const [k,idx] of by){const y=Math.floor(k/12),m=k%12,first=FC.P[idx[0]].a,lead=(first.getDay()+6)%7;
    const maj=idx.filter(i=>FC.cards[i].c.major).length;
    h+=`<div class="fc-mo"><h5>${MON[m]} ${y}<span>დიდი არკანი: ${maj}</span></h5><div class="fc-wk">${['ორ','სა','ოთ','ხუ','პა','შა','კვ'].map(x=>`<div class="h">${x}</div>`).join('')}${'<div></div>'.repeat(lead)}`+
      idx.map(i=>{const {c,rev}=FC.cards[i];return `<div class="fc-d el-${c.el}${rev?' rv':''}${i===ni?' now':''}" data-z="${i}" title="${fmtY(FC.P[i].a)} — ${cname(c).replace(/"/g,'')}${rev?' (შებრ.)':''}"><i>${FC.P[i].a.getDate()}</i><b>${short(c)}</b></div>`;}).join('')+`</div></div>`;}
  return h+'</div>';
}
function summary(){
  const cards=FC.cards,N=cards.length;
  if(N<=12)return analyse({},cards);
  const cnt={fire:0,water:0,air:0,earth:0,major:0};let rv=0;const f={};
  cards.forEach(({c,rev})=>{cnt[c.el]++;if(rev)rv++;f[c.id]=(f[c.id]||0)+1;});
  let h='<div class="summary" style="margin-top:0;padding-top:0;border-top:0"><h4>წლის ენერგიების ბალანსი</h4><div class="bars">'+
    Object.keys(cnt).map(k=>`<div class="bar">${ELN[k]} — ${cnt[k]} (${Math.round(cnt[k]/N*100)}%)<div class="tr"><i style="width:${cnt[k]/N*100}%;background:${ELC[k]}"></i></div></div>`).join('')+'</div>';
  const exp=FC.deck==='major'?null:{major:22/78,fire:14/78,water:14/78,air:14/78,earth:14/78};
  if(exp){const dev=Object.keys(cnt).map(k=>[k,cnt[k]/N-exp[k]]).sort((a,b)=>b[1]-a[1]);
    if(dev[0][1]>0.03)h+=`<div class="insight">ჭარბობს <b>${ELN[dev[0][0]]}</b> — ${dev[0][0]==='major'?'წელი ბედისწერის მოვლენებითაა დატვირთული':EL[dev[0][0]][1]} (მოსალოდნელზე +${Math.round(dev[0][1]*100)}%).</div>`;
    const lo=dev[dev.length-1];if(lo[1]<-0.03)h+=`<div class="insight">ნაკლებადაა <b>${ELN[lo[0]]}</b> (${Math.round(lo[1]*100)}%) — ${lo[0]==='major'?'წელი უფრო ყოველდღიურ, შენს ხელში მყოფ საქმეებზეა':'ამ სფეროს შეგნებული გაძლიერება სჭირდება'}.</div>`;}
  if(FC.rev)h+=`<div class="insight">შებრუნებული: ${rv} / ${N} (${Math.round(rv/N*100)}%).</div>`;
  const top=Object.entries(f).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>=2).slice(0,6);
  if(top.length)h+=`<div class="insight">ყველაზე ხშირი არკანები — წლის ლაიტმოტივები:<div class="fc-top">${top.map(([id,n])=>`<span>${cname(DECK.find(c=>c.id===id))} × ${n}</span>`).join('')}</div></div>`;
  const q=quintessence(cards);if(q)h+=`<div class="quint">კვინტესენცია (${N} ბარათის ჯამი ${q.sum}) → <b>${ROMAN[q.n]} ${MAJORS[q.n][0]}</b> — ${MAJORS[q.n][4]} <span style="color:var(--ink-dim)">(მთელი პერიოდის ფარული რჩევა)</span></div>`;
  return h+'</div>';
}
function list(){
  return FC.cards.map(({c,rev},i)=>{const p=FC.P[i];
    return `<div class="ri" data-z="${i}"><div class="no">${i+1}</div><div><div class="pos">${p.lab}${p.sub?' · '+p.sub:''}${p.mean?' — '+p.mean:''}</div>
      <div class="nm">${cname(c)}${rev?'<span class="rv">შებრუნებული</span>':''}</div><div class="tags">${cardTags(c)}</div>${richText(c,rev,spCtx())}</div></div>`;}).join('');
}
function zoom(i){
  const Z=$('zoom');if(!Z)return;FC.zi=i;const {c,rev}=FC.cards[i],p=FC.P[i];
  $('zoom-in').innerHTML=`<button class="zoom-x" type="button" aria-label="დახურვა">✕</button>
    <div class="zoom-card">${faceHTML(c,rev)}</div>
    <div><div class="pos">${FC.kind==='y365'?fmtY(p.a)+' · '+['კვირა','ორშაბათი','სამშაბათი','ოთხშაბათი','ხუთშაბათი','პარასკევი','შაბათი'][p.a.getDay()]:p.lab+(p.sub?' · '+p.sub:'')}</div>
      <div class="nm">${cname(c)}${rev?' <span style="color:#e58c8c;font-size:12px">შებრუნებული</span>':''}</div>
      <div class="tags" style="font-size:11px;color:var(--ink-dim);margin-bottom:6px">${cardTags(c)}</div>
      ${richText(c,rev,spCtx())}
      <div class="zoom-nav"><button type="button" data-d="-1">← წინა</button><button type="button" data-d="1">შემდეგი →</button></div></div>`;
  Z.hidden=false;
  Z.querySelector('.zoom-x').onclick=()=>{closeZoom();FC.zi=-1;};
  Z.querySelectorAll('.zoom-nav button').forEach(b=>b.onclick=()=>zoom((FC.zi+ +b.dataset.d+FC.cards.length)%FC.cards.length));
}
document.addEventListener('keydown',e=>{if(FC.zi<0||!document.body.classList.contains('fc-on')||$('zoom').hidden)return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.stopImmediatePropagation();zoom((FC.zi+(e.key==='ArrowRight'?1:-1)+FC.cards.length)%FC.cards.length);}},true);
function bind(){
  const H=$('fc');
  H.querySelectorAll('[data-z]').forEach(el=>el.onclick=()=>zoom(+el.dataset.z));
  const restart=()=>{FC.P=periods(FC.kind,FC.start);FC.cards=load();saveOpts();render();};
  $('fc-start').onchange=e=>{if(!e.target.value)return;FC.start=new Date(e.target.value+'T12:00');restart();};
  H.querySelectorAll('.fc-q').forEach(b=>b.onclick=()=>{const t=new Date();FC.start=b.dataset.q==='jan'?day(t.getFullYear(),0,1):day(t.getFullYear(),t.getMonth(),t.getDate());restart();});
  $('fc-deck').onchange=e=>{FC.deck=e.target.value;restart();};
  $('fc-ctx').onchange=e=>{FC.ctx=e.target.value||null;saveOpts();render();};
  $('fc-rev').onchange=e=>{FC.rev=e.target.checked;saveOpts();};
  $('fc-draw').onclick=()=>{
    if(FC.cards&&!confirm('ახალი გაშლა შეცვლის შენახულ პროგნოზს ამ პერიოდზე. გავაგრძელო?'))return;
    const pool=FC.deck==='major'?DECK.filter(c=>c.major):DECK;
    FC.cards=deal(FC.P.length,pool,FC.rev);save();render();
    setTimeout(()=>{const n=$('fc').querySelector('.fc-now,.fc-grid,.fc-cal');n&&n.scrollIntoView({behavior:'smooth',block:'start'});},60);};
}
function openFC(sp){
  FC.kind=sp.fc;if(!FC.start){const t=new Date();FC.start=day(t.getFullYear(),0,1);}
  FC.P=periods(FC.kind,FC.start);FC.cards=load();FC.zi=-1;
  document.body.classList.add('fc-on');render();
}

/* ═════════════ hooks into tarot.html ═════════════ */
const _select=select,_gallery=showGallery;
select=function(id){
  const sp=SPREADS.find(s=>s.id===id);
  if(sp&&sp.fc){
    cur=sp;drawn=[];closeZoom();
    document.body.classList.add('focus');document.title=sp.t+' · ტარო';
    const th=themeOf(sp);
    $('fb-grp').innerHTML=`<span style="color:${th.c}">●</span> ${sp.g}`;$('fb-title').textContent=sp.t;$('fb-desc').textContent=sp.d;
    $('fb-back').textContent='← '+sp.g;$('fb-n').innerHTML=`${sp.p.length}<small>${sp.fc==='y365'?'დღე':'არკანი'}</small>`;
    $('table').classList.remove('shape-heart');window.scrollTo({top:0});
    openFC(sp);return;
  }
  document.body.classList.remove('fc-on');
  const r=_select.apply(this,arguments);
  $('table').classList.toggle('shape-heart',!!(cur&&cur.shape==='heart'));
  return r;
};
showGallery=function(){document.body.classList.remove('fc-on');FC.zi=-1;return _gallery.apply(this,arguments);};
route();
window._tarotSpreads={FC,periods,seasonStarts,deal};
})();
