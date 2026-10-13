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
 y365:{t:'365 დღე',n:'365',d:'სრული წელი ხუთ ფენად: წლის არკანი, 4 სეზონის, 12 თვის, 52 კვირის და 365 დღის არკანი (ნაკიან წელს — 366). კალენდარი დაყოფილია სეზონებად, თვეებად და კვირებად.'},
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
.fc-sec{font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:2px;color:var(--gold);margin:6px 0 8px;opacity:.9}
.fc-layers{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 6px}
.fc-seg{margin-bottom:20px}
.fc-seg-h{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding:8px 2px;border-bottom:1px solid var(--border);margin-bottom:10px}
.fc-seg-h>b{font-family:'Cinzel',serif;font-weight:400;font-size:15px;letter-spacing:2px;color:var(--gold-lt)}
.fc-seg-h>span{font-size:11.5px;color:var(--ink-dim)}
.fc-mo h5 .t{font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:var(--gold)}
.fc-mo h5{align-items:center;gap:6px;flex-wrap:wrap}
.fc-chip{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 8px;border-radius:11px;cursor:pointer;border:1px solid rgba(255,255,255,.12);letter-spacing:0;font-family:'Noto Serif Georgian',serif;color:var(--ink)}
.fc-chip b{font-family:'Cinzel',serif;font-weight:400;display:inline-flex;align-items:center;gap:1px}
.fc-chip b svg{width:10px;height:10px;stroke:currentColor;fill:none;stroke-width:1.8}
.fc-chip.now{border-color:var(--gold)}
.fc-chip.el-fire{background:rgba(226,104,60,.18)}.fc-chip.el-water{background:rgba(74,144,217,.18)}.fc-chip.el-air{background:rgba(201,194,160,.14)}
.fc-chip.el-earth{background:rgba(95,174,110,.17)}.fc-chip.el-major{background:rgba(167,123,219,.24)}
.fc-wk8{display:grid;grid-template-columns:repeat(8,1fr);gap:3px}
.fc-wk8 .h{font-size:9px;color:var(--ink-dim);text-align:center}
.fc-d.fc-w{border:1px solid rgba(201,168,76,.55)}
.fc-d.fc-w i{color:var(--gold)}
.fc-zl{margin-top:10px;font-size:11.5px;color:var(--ink-dim);display:flex;flex-wrap:wrap;gap:5px;align-items:center}
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
const FC={kind:null,start:null,deck:'full',rev:true,ctx:null,cards:null,Y:null,P:[],zi:-1,zl:'x'};
const KEY=()=>`magnus_tarot_fc_${FC.kind}_${iso(FC.start)}_${FC.deck}`;
const LAYERS=['y','s','m','w','d'];
const LN={y:'წლის არკანი',s:'სეზონის არკანი',m:'თვის არკანი',w:'კვირის არკანი',d:'დღის არკანი'};
const toCards=a=>{const cs=(a||[]).map(x=>({c:DECK.find(c=>c.id===x.id),rev:!!x.rev}));return cs.every(x=>x.c)?cs:null;};
const fromCards=a=>a.map(x=>({id:x.c.id,rev:x.rev}));
/* the year is cut four ways; each day belongs to one season, one month and one week */
function yearMap(){
  const S=seasonStarts(FC.start.getFullYear()),M=periods('m12',FC.start),W=periods('w52',FC.start);
  const sOf=d=>{let t=3;for(const [b,i] of S){if(dn(b)<=dn(d))t=i;else break;}return t;};
  const map=FC.P.map((p,i)=>({s:sOf(p.a),m:M.findIndex(q=>dn(q.a)<=dn(p.a)&&dn(p.a)<=dn(q.b)),w:Math.min(51,Math.floor(i/7)),row:Math.floor(i/7)}));
  const segs=[];map.forEach((x,i)=>{const g=segs[segs.length-1];if(g&&g.s===x.s)g.b=i;else segs.push({s:x.s,a:i,b:i});});
  const order=[...new Set(segs.map(g=>g.s))];
  FC.YM={map,segs,order,M,W,
    sRange:t=>segs.filter(g=>g.s===t).map(g=>`${fmt(FC.P[g.a].a)} – ${fmt(FC.P[g.b].a)}`).join(' და ')};
}
function load(){try{const v=JSON.parse(localStorage.getItem(KEY())||'null');if(!v)return null;
  if(FC.kind==='y365'){if(!v.layers)return null;const L={};for(const k of LAYERS){L[k]=toCards(v.layers[k]);if(!L[k])return null;}
    if(L.d.length!==FC.P.length||L.s.length!==FC.YM.order.length)return null;FC.Y=L;return L.d;}
  if(!Array.isArray(v.cards))return null;const cs=toCards(v.cards);return cs&&cs.length===FC.P.length?cs:null;}catch(e){return null;}}
function save(){try{const o=FC.kind==='y365'?{layers:Object.fromEntries(LAYERS.map(k=>[k,fromCards(FC.Y[k])]))}:{cards:fromCards(FC.cards)};
  o.t=Date.now();localStorage.setItem(KEY(),JSON.stringify(o));}catch(e){}}
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
const WD=['კვირა','ორშაბათი','სამშაბათი','ოთხშაბათი','ხუთშაბათი','პარასკევი','შაბათი'],WDS=['კვ','ორ','სა','ოთ','ხუ','პა','შა'];
const rng=(a,b)=>Array.from({length:b-a+1},(_,k)=>a+k);
function item(l,i){
  if(l==='x'){const p=FC.P[i];return{...FC.cards[i],t:p.lab+(p.sub?' · '+p.sub:'')+(p.mean?' — '+p.mean:''),n:FC.cards.length};}
  const Y=FC.Y,YM=FC.YM,N=FC.P.length;
  if(l==='y')return{...Y.y[0],t:`წლის არკანი · ${fmtY(FC.P[0].a)} – ${fmtY(FC.P[N-1].a)}`,n:1};
  if(l==='s'){const t=YM.order[i];return{...Y.s[i],t:`${SEAS[t]} · ${YM.sRange(t)} — ${SEAS_M[t]}`,n:YM.order.length};}
  if(l==='m'){const p=YM.M[i];return{...Y.m[i],t:'თვე · '+p.lab+(p.sub?' · '+p.sub:''),n:12};}
  if(l==='w'){const p=YM.W[i];return{...Y.w[i],t:`${p.lab} · ${p.sub}`,n:52};}
  const p=FC.P[i];return{...Y.d[i],t:fmtY(p.a)+' · '+WD[p.a.getDay()],n:N};
}
const rvTag=rev=>rev?' <span style="color:#e58c8c;font-size:12px">შებრუნებული</span>':'';
function cell(l,i,lab,w,now){const it=item(l,i);
  return `<div class="fc-cell${now?' now':''}" data-zl="${l}" data-z="${i}"><div class="pl">${lab}</div>${face(it.c,it.rev,w)}<div class="cn">${cname(it.c)}${it.rev?' ↓':''}</div></div>`;}
function chip(l,i,now){const it=item(l,i);return `<span class="fc-chip el-${it.c.el}${now?' now':''}" data-zl="${l}" data-z="${i}"><b>${short(it.c)}</b>${it.rev?'↓':''} ${cname(it.c)}</span>`;}
function yearView(ni){
  const YM=FC.YM,N=FC.P.length,x=ni>=0?YM.map[ni]:null,sNow=x?YM.order.indexOf(x.s):-1;
  let h='';
  if(x){const L=[['y',0],['s',sNow],['m',x.m],['w',x.w],['d',ni]],dc=FC.Y.d[ni];
    h+=`<div class="fc-now" style="grid-template-columns:1fr"><div class="lb">ახლა · დღეს, ${fmtY(FC.P[ni].a)} — დროის ხუთი ფენა</div>
      <div class="fc-layers">${L.map(([l,i])=>cell(l,i,`<b>${LN[l]}</b>`,NARROW?56:80,false)).join('')}</div>
      <div><div class="nm">დღის არკანი: ${cname(dc.c)}${rvTag(dc.rev)}</div><div class="tags" style="font-size:11px;color:var(--ink-dim);margin-bottom:6px">${cardTags(dc.c)}</div>${richText(dc.c,dc.rev,spCtx())}</div></div>`;}
  const gw=w=>`grid-template-columns:repeat(auto-fill,minmax(${w+14}px,1fr))`;
  h+=`<div class="fc-sec">წელი და 4 სეზონი</div><div class="fc-grid" style="${gw(NARROW?78:108)}">`+
    cell('y',0,`<b>წელი</b>${fmt(FC.P[0].a)} – ${fmt(FC.P[N-1].a)}`,NARROW?78:108,false)+
    YM.order.map((t,k)=>cell('s',k,`<b>${SEAS[t]}</b>${YM.sRange(t)}`,NARROW?78:108,k===sNow)).join('')+'</div>';
  h+=`<div class="fc-sec">12 თვე</div><div class="fc-grid" style="${gw(NARROW?62:84)}">`+
    YM.M.map((p,i)=>cell('m',i,`<b>${p.lab}</b>${p.sub||''}`,NARROW?62:84,x&&x.m===i)).join('')+'</div>';
  h+=`<div class="fc-sec">კალენდარი — სეზონი → თვე → კვირა → დღე</div>
    <div class="fc-legend">${['fire','water','air','earth','major'].map(k=>`<span style="--c:${ELC[k]}">${ELN[k]}</span>`).join('')}<span style="--c:transparent"><b style="color:#e58c8c;font-weight:400">↓</b> შებრუნებული</span><span style="--c:transparent"><b style="color:var(--gold);font-weight:400">კ</b> — კვირის არკანი (რიგის დასაწყისში)</span></div>`;
  const head='<div class="h"></div>'+rng(0,6).map(k=>`<div class="h">${WDS[(FC.start.getDay()+k)%7]}</div>`).join('');
  for(const g of YM.segs){const k=YM.order.indexOf(g.s),days=rng(g.a,g.b);
    h+=`<div class="fc-seg"><div class="fc-seg-h"><b>${SEAS[g.s]}</b><span>${fmt(FC.P[g.a].a)} – ${fmt(FC.P[g.b].a)}</span>${chip('s',k,k===sNow)}</div><div class="fc-cal">`;
    for(const mi of [...new Set(days.map(i=>YM.map[i].m))]){
      const md=days.filter(i=>YM.map[i].m===mi),d0=FC.P[md[0]].a;
      h+=`<div class="fc-mo"><h5><span class="t">${MON[d0.getMonth()]} ${d0.getFullYear()}</span>${chip('m',mi,x&&x.m===mi)}</h5><div class="fc-wk8">${head}`;
      for(const r of [...new Set(md.map(i=>YM.map[i].row))]){const w=Math.min(51,r),it=FC.Y.w[w];
        h+=`<div class="fc-d fc-w el-${it.c.el}${it.rev?' rv':''}${x&&x.w===w?' now':''}" data-zl="w" data-z="${w}" title="კვირა ${w+1} — ${cname(it.c).replace(/"/g,'')}"><i>კ${w+1}</i><b>${short(it.c)}</b></div>`;
        for(let c=0;c<7;c++){const i=md.find(j=>YM.map[j].row===r&&j%7===c);
          if(i==null){h+='<div></div>';continue;}const {c:cd,rev}=FC.Y.d[i];
          h+=`<div class="fc-d el-${cd.el}${rev?' rv':''}${i===ni?' now':''}" data-zl="d" data-z="${i}" title="${fmtY(FC.P[i].a)} — ${cname(cd).replace(/"/g,'')}${rev?' (შებრ.)':''}"><i>${FC.P[i].a.getDate()}</i><b>${short(cd)}</b></div>`;}
      }
      h+='</div></div>';}
    h+='</div></div>';}
  return h;
}
function listL(l){const n=item(l,0).n;
  return rng(0,n-1).map(i=>{const it=item(l,i);return `<div class="ri" data-zl="${l}" data-z="${i}"><div class="no">${l==='y'?'✦':i+1}</div><div><div class="pos">${it.t}</div>
    <div class="nm">${cname(it.c)}${it.rev?'<span class="rv">შებრუნებული</span>':''}</div><div class="tags">${cardTags(it.c)}</div>${richText(it.c,it.rev,spCtx())}</div></div>`;}).join('');}
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
    <div class="fc-info">პერიოდი: ${fmtY(FC.start)} – ${fmtY(end)} · ${FC.kind==='y365'?`${1+FC.YM.order.length+12+52+N} არკანი: წელი 1, სეზონი ${FC.YM.order.length}, თვე 12, კვირა 52, დღე ${N}`:N+' არკანი'}${cards?' · შენახულია ამ ბრაუზერში — გადატვირთვისას იგივე დარჩება':''}</div></div>`;
  if(!cards){H.innerHTML=h+`<div class="reading"><div class="note" style="margin:0">აირჩიე ათვლის დღე და დააჭირე „აურიე და გაშალე“. ${N>(FC.deck==='major'?22:78)?`ბარათები ${Math.ceil(N/(FC.deck==='major'?22:78))} არეული კოლოდიდან მოდის — ყოველ ${FC.deck==='major'?22:78}-ში გამეორება არ არის.`:''}</div></div>`;bind();return;}
  const ni=nowIdx();
  if(FC.kind==='y365'){$('fb-n').innerHTML=`${1+FC.YM.order.length+12+52+N}<small>არკანი</small>`;h+=yearView(ni);}
  else if(ni>=0){const {c,rev}=cards[ni],p=FC.P[ni];
    h+=`<div class="fc-now"><div style="cursor:pointer" data-zl="x" data-z="${ni}">${face(c,rev,NARROW?150:130)}</div><div>
      <div class="lb">ახლა · ${FC.kind==='y365'?'დღეს, '+fmtY(p.a):p.lab+(p.sub?' · '+p.sub:'')}</div>
      <div class="nm">${cname(c)}${rev?' <span style="color:#e58c8c;font-size:12px">შებრუნებული</span>':''}</div>
      <div class="tags" style="font-size:11px;color:var(--ink-dim);margin-bottom:6px">${cardTags(c)}</div>${richText(c,rev,spCtx())}</div></div>`;}
  if(FC.kind!=='y365'){
    const w=FC.kind==='s4'?(NARROW?140:170):FC.kind==='m12'?(NARROW?92:120):(NARROW?62:78);
    const cols=FC.kind==='s4'?(NARROW?2:4):FC.kind==='m12'?(NARROW?3:6):(NARROW?4:'auto-fill');
    h+=`<div class="fc-grid" style="grid-template-columns:${cols==='auto-fill'?`repeat(auto-fill,minmax(${w+14}px,1fr))`:`repeat(${cols},${w+14}px)`}">${cards.map(({c,rev},i)=>{const p=FC.P[i];
      return `<div class="fc-cell${i===ni?' now':''}" data-zl="x" data-z="${i}"><div class="pl"><b>${p.lab}</b>${p.sub||''}</div>${face(c,rev,w)}<div class="cn">${cname(c)}${rev?' ↓':''}</div></div>`;}).join('')}</div>`;
  }
  h+=`<div class="reading">${summary()}${FC.kind==='s4'||FC.kind==='m12'?list():FC.kind==='w52'?`<details style="margin-top:12px"><summary style="cursor:pointer;color:var(--gold);font-size:12.5px">ყველა კვირის განმარტება</summary>${list()}</details>`:FC.kind==='y365'?[['y','წლის არკანი'],['s','სეზონების არკანები'],['m','თვეების არკანები'],['w','კვირების არკანები']].map(([l,t],k)=>`<details style="margin-top:12px"${k<2?' open':''}><summary style="cursor:pointer;color:var(--gold);font-size:12.5px">${t}</summary>${listL(l)}</details>`).join(''):''}</div>`;
  H.innerHTML=h;bind();
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
    return `<div class="ri" data-zl="x" data-z="${i}"><div class="no">${i+1}</div><div><div class="pos">${p.lab}${p.sub?' · '+p.sub:''}${p.mean?' — '+p.mean:''}</div>
      <div class="nm">${cname(c)}${rev?'<span class="rv">შებრუნებული</span>':''}</div><div class="tags">${cardTags(c)}</div>${richText(c,rev,spCtx())}</div></div>`;}).join('');
}
function zoom(i,l){
  const Z=$('zoom');if(!Z)return;l=l||'x';FC.zi=i;FC.zl=l;const it=item(l,i),{c,rev}=it;
  let ctx='';
  if(l==='d'&&FC.YM){const x=FC.YM.map[i];ctx=`<div class="fc-zl">ამ დღის ფენები: ${chip('y',0)}${chip('s',FC.YM.order.indexOf(x.s))}${chip('m',x.m)}${chip('w',x.w)}</div>`;}
  $('zoom-in').innerHTML=`<button class="zoom-x" type="button" aria-label="დახურვა">✕</button>
    <div class="zoom-card">${faceHTML(c,rev)}</div>
    <div><div class="pos">${l!=='x'&&FC.kind==='y365'?LN[l]+' · ':''}${it.t}</div>
      <div class="nm">${cname(c)}${rvTag(rev)}</div>
      <div class="tags" style="font-size:11px;color:var(--ink-dim);margin-bottom:6px">${cardTags(c)}</div>
      ${richText(c,rev,spCtx())}${ctx}
      <div class="zoom-nav"><button type="button" data-d="-1">← წინა</button><button type="button" data-d="1">შემდეგი →</button></div></div>`;
  Z.hidden=false;
  Z.querySelector('.zoom-x').onclick=()=>{closeZoom();FC.zi=-1;};
  Z.querySelectorAll('.zoom-nav button').forEach(b=>b.onclick=()=>zoom((FC.zi+ +b.dataset.d+it.n)%it.n,l));
  Z.querySelectorAll('.fc-zl [data-z]').forEach(b=>b.onclick=()=>zoom(+b.dataset.z,b.dataset.zl));
}
document.addEventListener('keydown',e=>{if(FC.zi<0||!document.body.classList.contains('fc-on')||$('zoom').hidden)return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.stopImmediatePropagation();const n=item(FC.zl,0).n;zoom((FC.zi+(e.key==='ArrowRight'?1:-1)+n)%n,FC.zl);}},true);
function bind(){
  const H=$('fc');
  H.querySelectorAll('[data-z]').forEach(el=>el.onclick=e=>{e.stopPropagation();zoom(+el.dataset.z,el.dataset.zl);});
  const restart=()=>{FC.P=periods(FC.kind,FC.start);if(FC.kind==='y365')yearMap();FC.Y=null;FC.cards=load();saveOpts();render();};
  $('fc-start').onchange=e=>{if(!e.target.value)return;FC.start=new Date(e.target.value+'T12:00');restart();};
  H.querySelectorAll('.fc-q').forEach(b=>b.onclick=()=>{const t=new Date();FC.start=b.dataset.q==='jan'?day(t.getFullYear(),0,1):day(t.getFullYear(),t.getMonth(),t.getDate());restart();});
  $('fc-deck').onchange=e=>{FC.deck=e.target.value;restart();};
  $('fc-ctx').onchange=e=>{FC.ctx=e.target.value||null;saveOpts();render();};
  $('fc-rev').onchange=e=>{FC.rev=e.target.checked;saveOpts();};
  $('fc-draw').onclick=()=>{
    if(FC.cards&&!confirm('ახალი გაშლა შეცვლის შენახულ პროგნოზს ამ პერიოდზე. გავაგრძელო?'))return;
    const pool=FC.deck==='major'?DECK.filter(c=>c.major):DECK;
    if(FC.kind==='y365'){FC.Y={y:deal(1,pool,FC.rev),s:deal(FC.YM.order.length,pool,FC.rev),m:deal(12,pool,FC.rev),w:deal(52,pool,FC.rev),d:deal(FC.P.length,pool,FC.rev)};FC.cards=FC.Y.d;}
    else FC.cards=deal(FC.P.length,pool,FC.rev);save();render();
    setTimeout(()=>{const n=$('fc').querySelector('.fc-now,.fc-sec,.fc-grid');n&&n.scrollIntoView({behavior:'smooth',block:'start'});},60);};
}
function openFC(sp){
  FC.kind=sp.fc;if(!FC.start){const t=new Date();FC.start=day(t.getFullYear(),0,1);}
  FC.P=periods(FC.kind,FC.start);FC.Y=null;if(FC.kind==='y365')yearMap();FC.cards=load();FC.zi=-1;
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
