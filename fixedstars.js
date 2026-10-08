/* fixedstars.js — ფიქსირებული ვარსკვლავები ასტროლოგიის გვერდზე (astro.html)
   Self-injecting add-on. In astro.html, after the other add-ons:
       <script src="fixedstars.js"></script>
   Adds
     • the planet table: a "★ ფიქსირებული ვარსკვლავები" section — stars in
       conjunction with your planets/angles (or all 54 with one click),
       with degree, sign, house, Ptolemaic nature and meaning
     • the aspect list: planet ☌ star conjunctions, with their own filter
   Positions: Swiss Ephemeris sefstars.txt (Hipparcos, proper motion included),
   fitted as lon(T)=a+bT+cT² for 1750–2250, + nutation and aberration:
   matches Swiss Ephemeris apparent positions to ±2″ (1900–2100).
   Orbs (conjunction only, classical): magnitude ≤1 → 2°, ≤2 → 1.5°, fainter → 1°. */
(function(){
'use strict';
const FS=[{"n": "Alpheratz", "ka": "ალფერაცი", "nat": "♃♀", "m": "თავისუფლება, მოძრაობა, პატივი და დამოუკიდებლობა", "mag": 2.06, "L": [14.30846, 1.392549, 0.0003208], "B": [25.68055, -0.001415]}, {"n": "Algenib", "ka": "ალგენიბი", "nat": "♂☿", "m": "მოქმედების ძალა, ხმა, შეუპოვრობა", "mag": 2.84, "L": [9.15604, 1.394004, 0.0003117], "B": [12.60004, 0.002962]}, {"n": "Mirach", "ka": "მირახი", "nat": "♀", "m": "სილამაზე, სიყვარული, ხელოვნება და მიმზიდველობა", "mag": 2.05, "L": [30.40523, 1.395183, 0.0003263], "B": [25.94345, 0.002699]}, {"n": "Hamal", "ka": "ჰამალი", "nat": "♂♄", "m": "დამოუკიდებლობა, სიმამაცე, სიჯიუტე", "mag": 2.01, "L": [37.66247, 1.398766, 0.0003152], "B": [9.96519, 0.003207]}, {"n": "Menkar", "ka": "მენქარი", "nat": "♄", "m": "კოლექტიური ბედი და ტვირთი; ზრუნვა სხეულზე", "mag": 2.53, "L": [44.32014, 1.397875, 0.0002958], "B": [-12.58551, 0.007955]}, {"n": "Algol", "ka": "ალგოლი", "nat": "♄♃", "m": "უზარმაზარი ვნება და ძალა; ბრაზის მართვა — „მედუზას თავი“", "mag": 2.12, "L": [56.16758, 1.394371, 0.0003278], "B": [22.42858, 0.011382]}, {"n": "Alcyone", "ka": "ალციონე (პლეადები)", "nat": "☽♂", "m": "ხედვა, ინტუიცია, მისტიკა; ცრემლი და თანაგრძნობა", "mag": 2.87, "L": [59.99239, 1.39676, 0.0003103], "B": [4.05099, 0.010542]}, {"n": "Aldebaran", "ka": "ალდებარანი", "nat": "♂", "m": "👑 სამეფო ვარსკვლავი (აღმოსავლეთის მცველი): წარმატება მთლიანობითა და პატიოსნებით", "mag": 0.86, "L": [69.78918, 1.39821, 0.0003013], "B": [-5.46731, 0.007158]}, {"n": "Rigel", "ka": "რიგელი", "nat": "♃♄", "m": "ცოდნა, სწავლება, ტექნიკური და გამომგონებლური ნიჭი", "mag": 0.13, "L": [76.82959, 1.398035, 0.000273], "B": [-31.12276, 0.012937]}, {"n": "Capella", "ka": "კაპელა", "nat": "♂☿", "m": "ცნობისმოყვარეობა, სწავლა, თავისუფლების წყურვილი", "mag": 0.08, "L": [81.85791, 1.397816, 0.0003301], "B": [22.86427, 0.001048]}, {"n": "Bellatrix", "ka": "ბელატრიქსი", "nat": "♂☿", "m": "მეომარი ქალი: სწრაფი წარმატება, გაბედულება", "mag": 1.64, "L": [80.94647, 1.3969, 0.0002901], "B": [-16.81605, 0.012681]}, {"n": "El Nath", "ka": "ელნატი", "nat": "♂", "m": "ბრძოლისუნარიანობა, წარმატება წინააღმდეგობით", "mag": 1.65, "L": [82.57494, 1.397189, 0.0003122], "B": [5.3851, 0.008194]}, {"n": "Alnilam", "ka": "ალნილამი", "nat": "♃♄", "m": "სიმტკიცე, ხანმოკლე დიდება, ძლიერი ნება", "mag": 1.69, "L": [83.46365, 1.397077, 0.0002818], "B": [-24.50639, 0.013027]}, {"n": "Betelgeuse", "ka": "ბეტელგეიზე", "nat": "♂☿", "m": "წარმატება, აღიარება, დიდება", "mag": 0.42, "L": [88.7546, 1.397433, 0.0002915], "B": [-16.02703, 0.013332]}, {"n": "Polaris", "ka": "პოლარისი", "nat": "♄♀", "m": "მიმართულება, ორიენტირი, სულიერი გზა", "mag": 2.02, "L": [88.56758, 1.400087, 0.0004309], "B": [66.10144, 0.011863]}, {"n": "Sirius", "ka": "სირიუსი", "nat": "♃♂", "m": "„ღვთიური ცეცხლი“: დიდება, ერთგულება, მისია", "mag": -1.46, "L": [104.08168, 1.378207, 0.0002549], "B": [-39.60538, -0.023005]}, {"n": "Canopus", "ka": "კანოპუსი", "nat": "♄♃", "m": "მოგზაური და წინამძღოლი, გზის გაკვლევა", "mag": -0.74, "L": [104.96055, 1.380921, 0.0001301], "B": [-75.82394, 0.012991]}, {"n": "Castor", "ka": "კასტორი", "nat": "☿", "m": "ინტელექტი, მწერლობა, მოულოდნელი ცვლილებები", "mag": 1.58, "L": [110.24021, 1.393218, 0.0003153], "B": [10.0957, 0.006954]}, {"n": "Pollux", "ka": "პოლუქსი", "nat": "♂", "m": "სიმამაცე, ბრძოლის ნიჭი, ენერგიული ხასიათი", "mag": 1.14, "L": [113.21565, 1.380597, 0.0003126], "B": [6.68413, 0.007146]}, {"n": "Procyon", "ka": "პროციონი", "nat": "☿♂", "m": "სწრაფი აღმასვლა — წარმატების შენარჩუნებას სიფრთხილე სჭირდება", "mag": 0.37, "L": [115.78556, 1.379832, 0.0002885], "B": [-16.01971, -0.02061]}, {"n": "Praesepe Cluster", "ka": "პრესეპე (სკა)", "nat": "♂☽", "m": "სიმრავლე, ბურუსი, ხედვის გამძაფრება", "mag": 3.7, "L": [127.20192, 1.397128, 0.0003086], "B": [1.56329, 0.009651]}, {"n": "Acubens", "ka": "აკუბენსი", "nat": "♄☿", "m": "თავშესაფარი, დაცვა, მოთმინება", "mag": 4.25, "L": [133.64165, 1.397404, 0.000305], "B": [-5.08054, 0.008151]}, {"n": "Alphard", "ka": "ალფარდი", "nat": "♄♀", "m": "სიბრძნე და ვნება; მარტოობის გამოცდილება", "mag": 1.97, "L": [147.27921, 1.391344, 0.0003009], "B": [-22.3825, 0.006802]}, {"n": "Regulus", "ka": "რეგული", "nat": "♂♃", "m": "👑 სამეფო ვარსკვლავი (ჩრდილოეთის მცველი): დიდება და ძალაუფლება — თუ შურისძიებას ერიდები", "mag": 1.4, "L": [149.82914, 1.390461, 0.0003073], "B": [0.46473, 0.003243]}, {"n": "Zosma", "ka": "ზოსმა", "nat": "♄♀", "m": "მსხვერპლი და ქველმოქმედება, მსხვერპლის როლის გაცნობიერება", "mag": 2.53, "L": [161.3166, 1.405393, 0.0003086], "B": [14.33346, 0.00136]}, {"n": "Denebola", "ka": "დენებოლა", "nat": "♄♀", "m": "დამოუკიდებელი, „დინების საწინააღმდეგო“ აზრი, კეთილშობილება", "mag": 2.13, "L": [171.61756, 1.388122, 0.000304], "B": [12.26676, -0.007789]}, {"n": "Vindemiatrix", "ka": "ვინდემიატრიქსი", "nat": "♄☿", "m": "„მოსავლის ამკრეფი“: სიფხიზლე, დანაკარგის გაკვეთილი", "mag": 2.79, "L": [189.94026, 1.393059, 0.0002991], "B": [16.20486, -0.00592]}, {"n": "Algorab", "ka": "ალგორაბი", "nat": "♂♄", "m": "თეატრალურობა, ეშმაკობა — პატიოსნების გამოცდა", "mag": 2.94, "L": [193.45174, 1.390331, 0.0003109], "B": [-12.1964, -0.010044]}, {"n": "Spica", "ka": "სპიკა", "nat": "♀♂", "m": "ნიჭი და საჩუქარი, დაცვა, ბრწყინვალება", "mag": 0.97, "L": [203.84136, 1.395701, 0.0003073], "B": [-2.05459, -0.00755]}, {"n": "Arcturus", "ka": "არქტური", "nat": "♂♃", "m": "ახალი გზის გამკვლევი, წინამძღოლობა, სიუხვე", "mag": -0.05, "L": [204.23365, 1.395851, 0.0002734], "B": [30.73613, -0.069361]}, {"n": "Zuben Elgenubi", "ka": "ზუბენ ელგენუბი", "nat": "♄♂", "m": "სამართლიანობის მოთხოვნა, სოციალური რეფორმა", "mag": 2.75, "L": [225.08267, 1.394684, 0.0003055], "B": [0.33301, -0.012706]}, {"n": "Zuben Eschamali", "ka": "ზუბენ ეშამალი", "nat": "♃☿", "m": "კეთილი ბედი, ამბიცია, სოციალური წარმატება", "mag": 2.62, "L": [229.37169, 1.395507, 0.0002985], "B": [8.49588, -0.01187]}, {"n": "Unukalhai", "ka": "უნუკალჰაი", "nat": "♄♂", "m": "ფიზიკური ძალა, სიმკაცრე — ენერგიის შეკავება", "mag": 2.63, "L": [232.07516, 1.403916, 0.0002816], "B": [25.50795, -0.008852]}, {"n": "Alphecca", "ka": "ალფეკა", "nat": "♀☿", "m": "ნიჭი, ღირსება, პოეზია და სილამაზე", "mag": 2.24, "L": [222.29581, 1.41107, 0.0002578], "B": [44.32346, -0.010862]}, {"n": "Antares", "ka": "ანტარესი", "nat": "♂♃", "m": "👑 სამეფო ვარსკვლავი (დასავლეთის მცველი): ვნება, ბრძოლა, თამამი გადაწყვეტილება", "mag": 0.91, "L": [249.76229, 1.396382, 0.000311], "B": [-4.56996, -0.013294]}, {"n": "Rasalhague", "ka": "რას ალჰაგე", "nat": "♄♀", "m": "მკურნალობა, „გველის სიბრძნე“, ცოდნის გაზიარება", "mag": 2.07, "L": [262.44863, 1.401391, 0.0002655], "B": [35.83521, -0.019028]}, {"n": "Rasalgethi", "ka": "რას ალგეთი", "nat": "♂♀", "m": "ძალა და უფლება, წესრიგის დამყარება", "mag": 3.06, "L": [256.15196, 1.398017, 0.0002642], "B": [37.28615, -0.011926]}, {"n": "Sabik", "ka": "საბიკი", "nat": "♄♀", "m": "ზნეობრივი არჩევანი, სიმართლე", "mag": 2.42, "L": [257.96958, 1.397966, 0.0002998], "B": [7.1978, -0.010119]}, {"n": "Galactic Center", "ka": "გალაქტიკის ცენტრი", "nat": "—", "m": "კოსმიური ცნობიერება, მისია, დიდი სურათი", "mag": null, "L": [266.85171, 1.396859, 0.0003124], "B": [-5.60767, -0.013203]}, {"n": "Facies", "ka": "ფაციესი", "nat": "☉♂", "m": "„სახე“: უზარმაზარი ფოკუსი, სიმკაცრე", "mag": 6.17, "L": [278.314, 1.39704, 0.0003079], "B": [-0.7277, -0.012825]}, {"n": "Nunki", "ka": "ნუნკი", "nat": "♃☿", "m": "ჭეშმარიტება, მოგზაურობა, სიტყვის ძალა", "mag": 2.07, "L": [282.38535, 1.397406, 0.0003097], "B": [-3.4495, -0.013963]}, {"n": "Vega", "ka": "ვეგა", "nat": "♀☿", "m": "ხელოვნება, მაგია, ქარიზმა, მუსიკა", "mag": 0.03, "L": [285.31639, 1.402349, 0.0002201], "B": [61.73289, -0.005107]}, {"n": "Altair", "ka": "ალტაირი", "nat": "♂♃", "m": "სითამამე, მოქმედება, ამბიცია", "mag": 0.76, "L": [301.7764, 1.411783, 0.0002949], "B": [29.30353, -0.003138]}, {"n": "Deneb Algedi", "ka": "დენებ ალგედი", "nat": "♄♃", "m": "სამართალი, კანონი, მოვალეობა", "mag": 2.83, "L": [323.54254, 1.401508, 0.0003107], "B": [-2.60156, -0.016981]}, {"n": "Sadalsuud", "ka": "სადალსუუდი", "nat": "♄☿", "m": "„იღბალთა იღბალი“: მოულოდნელი წყალობა", "mag": 2.89, "L": [323.39507, 1.395627, 0.0003046], "B": [8.61512, -0.0072]}, {"n": "Sadalmelik", "ka": "სადალმელიქი", "nat": "♄☿", "m": "„მეფის იღბალი“: მაღალი თანამდებობა, პასუხისმგებლობა", "mag": 2.94, "L": [333.35247, 1.394989, 0.0003054], "B": [10.66169, -0.005213]}, {"n": "Fomalhaut", "ka": "ფომალჰაუტი", "nat": "♀☿", "m": "👑 სამეფო ვარსკვლავი (სამხრეთის მცველი): იდეალიზმი, ხედვა, ოცნების განხორციელება", "mag": 1.16, "L": [333.86023, 1.408516, 0.0003138], "B": [-21.13549, -0.012605]}, {"n": "Deneb Adige", "ka": "დენები", "nat": "♀☿", "m": "ინტელექტი, ხელოვნება, მაღალი მიზნები", "mag": 1.25, "L": [335.32922, 1.375808, 0.0002935], "B": [59.90626, -0.004352]}, {"n": "Achernar", "ka": "აქერნარი", "nat": "♃", "m": "წარმატება, რელიგიური და საზოგადოებრივი ღირსებები", "mag": 0.46, "L": [345.31128, 1.42049, 0.000311], "B": [-59.37802, -0.004634]}, {"n": "Markab", "ka": "მარკაბი", "nat": "♂☿", "m": "მიზანდასახულობა, განსჯის უნარი", "mag": 2.48, "L": [353.4856, 1.393415, 0.0003102], "B": [19.40615, -0.00205]}, {"n": "Scheat", "ka": "შეატი", "nat": "♂☿", "m": "ინტელექტუალური თავისუფლება — სიფრთხილე რისკებში", "mag": 2.42, "L": [359.37417, 1.396464, 0.0003147], "B": [31.14063, 0.002069]}, {"n": "Acrux", "ka": "აკრუქსი", "nat": "♃", "m": "რიტუალი, მაგია, რელიგიური გრძნობა", "mag": 0.81, "L": [221.86991, 1.384325, 0.0003644], "B": [-52.87893, -0.01051]}, {"n": "Rigil Kentaurus", "ka": "რიგილ კენტაური", "nat": "♀♃", "m": "მეგობრობა, მკურნალობა, მასწავლებლობა", "mag": -0.1, "L": [239.47968, 1.257111, 4.48e-05], "B": [-42.59588, -0.035996]}, {"n": "Agena", "ka": "აგენა", "nat": "♀♃", "m": "პატივი, ზნეობა, თანადგომა", "mag": 0.6, "L": [233.79224, 1.389641, 0.000355], "B": [-44.13771, -0.012186]}];
const COL='#f0d070',ON_KEY='magnus_fs_all';
const NAME=s=>'★ '+s.ka;
const orbOf=s=>s.mag==null?1:s.mag<=1?2:s.mag<=2?1.5:1;
const DATAOF=new WeakMap();                 /* planets object -> chart data */
let showAll=false;try{showAll=localStorage.getItem(ON_KEY)==='1';}catch(e){}

/* register the star names for the aspect table glyphs */
try{FS.forEach(s=>{PI[NAME(s)]={sym:'★',color:COL};});}catch(e){}

function T(req){        /* Julian centuries from J2000 — date is enough (50″/yr) */
  const y=+req.year,m=+(req.month||1),d=+(req.day||1);
  if(!isFinite(y))return null;
  return (y-2000+(m-1)/12+(d-1)/365.25)/100;
}
/* mean position of date + nutation (from the chart's own Moon node) and
   annual aberration (from its Sun) → apparent, like the planets (±2″) */
const D2R=Math.PI/180;
function starPos(s,t,sun,node){
  let lon=s.L[0]+s.L[1]*t+s.L[2]*t*t;const lat=s.B[0]+s.B[1]*t;
  if(sun!=null){
    const dpsi=node!=null?-17.20*Math.sin(node*D2R)-1.32*Math.sin(2*sun*D2R):0;
    const ab=-20.4955*Math.cos((sun-lon)*D2R)/Math.cos(lat*D2R);
    lon+=(dpsi+ab)/3600;
  }
  return{lon:(lon%360+360)%360,lat};
}
function houseOf(deg,c){
  if(!c||c.length<12)return null;
  for(let i=0;i<12;i++){const a=c[i],b=c[(i+1)%12];
    if(a<=b?(deg>=a&&deg<b):(deg>=a||deg<b))return i+1;}
  return 1;
}
const sep=(a,b)=>{const d=Math.abs(((a-b)%360+540)%360-180);return d;};
/* stars + their contacts for one chart (cached on the data object) */
function starsFor(data){
  if(!data||!data._fsReq)return null;
  if(typeof currentMode!=='undefined'&&currentMode==='draconic')return null;  /* draconic: no */
  if(data._fs)return data._fs;
  const t=T(data._fsReq);if(t==null)return null;
  const bodies={};
  for(const [n,p] of Object.entries(data.planets||{}))if(p&&p.degree!=null)bodies[n]=+p.degree;
  if(!data._timeUnknown){if(data.asc!=null)bodies.AC=+data.asc;if(data.mc!=null)bodies.MC=+data.mc;}
  const P=data.planets||{},sun=P['მზე']?+P['მზე'].degree:null,node=P['ჩრდ. კვანძი']?+P['ჩრდ. კვანძი'].degree:null;
  const out=FS.map(s=>{
    const p=starPos(s,t,sun,node),orb=orbOf(s);
    const hits=Object.entries(bodies).map(([n,d])=>({n,orb:sep(d,p.lon)})).filter(h=>h.orb<=orb)
      .sort((a,b)=>a.orb-b.orb);
    return Object.assign({},s,p,{orb,hits,house:data._timeUnknown?null:houseOf(p.lon,data.houses)});
  }).sort((a,b)=>a.lon-b.lon);
  data._fs=out;return out;
}

/* 1 ── remember which request produced which chart ── */
if(typeof fetchChart==='function'){
  const orig=fetchChart;
  window.fetchChart=async function(req){
    const d=await orig.apply(this,arguments);
    try{if(d&&typeof d==='object'){d._fsReq=req;if(d.planets)DATAOF.set(d.planets,d);}}catch(e){}
    return d;
  };
}
const dataFor=planets=>{
  const D=DATAOF.get(planets);if(D)return D;
  try{for(const x of [_d1,_d2])if(x&&x.planets===planets)return x;}catch(e){}
  return null;
};

/* 2 ── planet table: the star section ── */
if(typeof drawPlanetTable==='function'){
  const orig=drawPlanetTable;
  window.drawPlanetTable=function(planets,isB,tbodyId){
    orig.apply(this,arguments);
    try{if(!isB)addStarRows(planets,tbodyId);}catch(e){console.warn('fixedstars',e);}
  };
}
function addStarRows(planets,tbodyId){
  const tb=document.getElementById(tbodyId),data=dataFor(planets);
  if(!tb||!data)return;
  const st=starsFor(data);if(!st)return;
  const hit=st.filter(s=>s.hits.length),list=showAll?st:hit;
  const head=document.createElement('tr');head.className='fs-head';
  head.innerHTML=`<td colspan="6" style="padding:10px 6px 6px;border-top:1px solid rgba(240,208,112,.25)">
    <span style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;color:${COL}">★ ფიქსირებული ვარსკვლავები</span>
    <span style="font-size:10px;color:rgba(200,190,150,.6)"> · ${hit.length} შეერთება</span>
    <button type="button" class="fs-tog" style="float:right;background:none;border:1px solid rgba(240,208,112,.35);color:${COL};
      border-radius:5px;padding:1px 8px;font-size:10px;cursor:pointer;font-family:inherit">${showAll?'მხოლოდ შეერთებები':'ყველა '+st.length}</button></td>`;
  tb.appendChild(head);
  head.querySelector('.fs-tog').onclick=()=>{showAll=!showAll;try{localStorage.setItem(ON_KEY,showAll?'1':'0');}catch(e){}
    tb.querySelectorAll('tr.fs-row,tr.fs-head,tr.fs-mean').forEach(r=>r.remove());addStarRows(planets,tbodyId);};
  if(!list.length){
    const r=document.createElement('tr');r.className='fs-row';
    r.innerHTML='<td colspan="6" style="font-size:10px;color:rgba(200,190,150,.5);text-align:center;padding:6px">შეერთება არცერთ ვარსკვლავთან არ არის — „ყველა“ აჩვენებს მთელ სიას</td>';
    tb.appendChild(r);return;
  }
  for(const s of list){
    const si=Math.floor(s.lon/30)%12,on=s.hits.length>0;
    const sc=typeof signClass==='function'?signClass(si):'';
    const hits=s.hits.map(h=>{const i=(typeof PI!=='undefined'&&PI[h.n])||{sym:h.n,color:'#ccc'};
      const sym=(h.n==='AC'||h.n==='MC')?h.n:h.n==='მზე'?(typeof sunSVG==='function'?sunSVG(12):'☉'):i.sym;
      return `<span title="${h.n} — ორბი ${h.orb.toFixed(2)}°" style="color:${i.color};white-space:nowrap">☌${sym}<small style="opacity:.6"> ${h.orb.toFixed(1)}°</small></span>`;}).join(' ');
    const tip=`${s.n} · ${s.nat} · სიკაშკაშე ${s.mag==null?'—':s.mag} · ეკლ. განედი ${s.lat.toFixed(1)}° · ორბი ${s.orb}°\n${s.m}`;
    const r=document.createElement('tr');r.className='fs-row';r.title=tip;
    r.innerHTML=`<td><span style="color:${on?COL:'rgba(240,208,112,.45)'};font-size:${s.mag!=null&&s.mag<=1?15:12}px">★</span></td>
      <td style="color:${on?COL:'rgba(220,210,170,.7)'};font-size:11px;white-space:nowrap">${s.ka}
        <span style="font-size:9px;color:rgba(200,190,150,.55);margin-left:3px">${s.nat}</span></td>
      <td class="deg-val">${typeof fmtDeg==='function'?fmtDeg(s.lon):s.lon.toFixed(2)+'°'}</td>
      <td><span class="${sc}" style="font-size:13px;font-family:serif">${ZSYM[si]}</span> <span style="font-size:10px;color:${ZCOL[si]}">${SIGN_KA[si]}</span></td>
      <td>${s.house?`<span class="house-badge">H${s.house}</span>`:''}</td>
      <td style="font-size:11px">${hits}</td>`;
    tb.appendChild(r);
    if(on){const m=document.createElement('tr');m.className='fs-mean';
      m.innerHTML=`<td></td><td colspan="5" style="font-size:10px;color:rgba(220,210,170,.65);padding:0 6px 7px;line-height:1.5">${s.m}</td>`;
      tb.appendChild(m);}
  }
}

/* 3 ── aspect list: planet ☌ star ── */
if(typeof calcAllNatalAspects==='function'){
  const orig=calcAllNatalAspects;
  window.calcAllNatalAspects=function(data){
    const res=orig.apply(this,arguments)||[];
    try{
      const st=starsFor(data);
      if(st)st.forEach(s=>s.hits.forEach(h=>res.push({p1:h.n,p2:NAME(s),type:'შეერთება',sym:'☌',color:COL,
        orb:Math.round(h.orb*100)/100,angle:0,star:true})));
    }catch(e){}
    return res;
  };
}
if(typeof isAspectVisible==='function'){
  const orig=isAspectVisible;
  window.isAspectVisible=function(asp){
    if(asp&&asp.star){const f=document.getElementById('f-stars');if(f&&!f.checked)return false;}
    return orig.apply(this,arguments);
  };
}
/* the filter checkbox, next to "ასტეროიდები" */
function addFilter(){
  const box=document.querySelector('#asp-filters > div:last-child');
  if(!box||document.getElementById('f-stars'))return;
  const l=document.createElement('label');
  l.style.cssText='display:flex;align-items:center;gap:8px;cursor:pointer;';
  l.innerHTML=`<input type="checkbox" id="f-stars" checked style="accent-color:#c9a84c;width:14px;height:14px;cursor:pointer">
    <span style="font-size:11px;color:${COL}">★ ფიქსირებული ვარსკვლავები</span>
    <span style="font-size:10px;color:rgba(200,190,150,.5)">მხოლოდ ☌ · ორბი 1–2°</span>`;
  box.appendChild(l);
  const f=l.querySelector('input');
  f.addEventListener('change',()=>{try{applyAspFilter();}catch(e){}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addFilter);else addFilter();
window._fixedStars={FS,starPos,starsFor};
})();
