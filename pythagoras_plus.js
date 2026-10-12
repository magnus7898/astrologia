/* pythagoras_plus.js — სტატისტიკა · შეთავსება · დამატებითი ანალიზი პითაგორას კვადრატისთვის
   ჩართვა: <script src="pythagoras_plus.js"></script> </body>-ის წინ (მთავარი სკრიპტის შემდეგ).
   იყენებს გვერდის გლობალებს: computeModes, LABELS, COLORS, GRID_ORDER, COMPOUND, MODES, activeMode, setMode. */
(function(){
'use strict';
if(window._pyPlus)return;window._pyPlus=1;
const $=id=>document.getElementById(id);
const DIG=[1,2,3,4,5,6,7,8,9];
const MODE_NAMES={classic:'კლასიკური',corrected:'კორექტირებული',crisis:'კრიზისული'};
const LINE_KEYS=['ambition','money','talent','purpose','family','stability','temperament','spirit'];
const LINE_DIG=LINE_KEYS.map(k=>COMPOUND[k].keys);
const Y_MIN=1,Y_MAX=9999;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pct=(a,b)=>b?a/b*100:0;
const fp=p=>p>=10?p.toFixed(1):p>=1?p.toFixed(2):p>=0.01?p.toFixed(3):p>0?'<0.01':'0';
const root=n=>{n=Math.abs(n);while(n>9){let s=0;while(n){s+=n%10;n=(n/10)|0;}n=s;}return n;};
const rootStr=s=>root([...s].reduce((a,c)=>a+ +c,0));

/* ═══════════ CSS ═══════════ */
const css=`
#pp-nav{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:-28px 0 34px}
#pp-nav .mode-pill{font-size:10.5px}
.pp-panel{display:none}
.pp-panel.on{display:block}
body.pp-alt .page>*:not(.page-header):not(#pp-nav):not(.pp-panel){display:none!important}
.pp-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 18px;margin-bottom:18px}
.pp-h{font-family:'Cinzel',serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);opacity:.85;margin-bottom:12px}
.pp-note{font-size:11.5px;color:var(--muted);line-height:1.75}
.pp-note b{color:rgba(200,169,110,.85);font-weight:500}
.pp-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:center}
.pp-in,.pp-sel{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;color:var(--text);
  font-family:'Noto Sans Georgian',sans-serif;font-size:13px;padding:8px 10px;outline:none}
.pp-sel option{background:#14121f}
.pp-in.date{font-family:'Cinzel',serif;letter-spacing:2px;width:150px;text-align:center}
.pp-in.yr{width:84px;text-align:center}
.pp-in.k{width:58px;text-align:center}
.pp-btn{padding:9px 20px;background:linear-gradient(135deg,rgba(155,127,232,.2),rgba(120,100,200,.1));border:1px solid rgba(155,127,232,.3);
  border-radius:8px;color:var(--text);font-family:'Cinzel',serif;font-size:10.5px;letter-spacing:2px;text-transform:uppercase;cursor:pointer}
.pp-btn:hover{border-color:rgba(155,127,232,.6)}
.pp-btn.sm{padding:6px 12px;font-size:9.5px}
.pp-x{cursor:pointer;color:var(--muted);padding:0 6px;font-size:16px}
.pp-x:hover{color:#e87f7f}
.pp-tbl{width:100%;border-collapse:collapse;font-size:12px}
.pp-tbl th{font-family:'Cinzel',serif;font-weight:400;font-size:9px;letter-spacing:1.5px;color:var(--muted);padding:6px 4px;text-align:center;border-bottom:1px solid var(--border)}
.pp-tbl td{padding:6px 4px;text-align:center;border-bottom:1px solid rgba(255,255,255,.035)}
.pp-tbl td.l{text-align:left;white-space:nowrap}
.pp-tbl tr.sel td{background:rgba(155,127,232,.08)}
.pp-tbl tr.click{cursor:pointer}
.pp-tbl tr.click:hover td{background:rgba(255,255,255,.03)}
.pp-scroll{overflow-x:auto}
.pp-lift{display:block;font-size:9.5px;margin-top:1px}
.pp-up{color:#7fcf7f}.pp-dn{color:#e87f7f}
.pp-mini{display:inline-grid;grid-template-columns:repeat(3,1fr);gap:3px;width:132px}
.pp-mini div{border:1px solid var(--border);border-radius:5px;min-height:30px;display:flex;align-items:center;justify-content:center;
  font-family:'Cormorant Garamond',serif;font-size:14px;letter-spacing:1px;background:rgba(255,255,255,.02)}
.pp-mini.big{width:210px}.pp-mini.big div{min-height:46px;font-size:18px}
.pp-mini .e{color:rgba(232,226,213,.18)}
.pp-sq{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.pp-sqi{text-align:center;font-size:11px;color:var(--muted)}
.pp-sqi b{display:block;color:var(--gold);font-weight:400;font-family:'Cormorant Garamond',serif;font-size:17px;margin-top:4px}
.pp-bar{height:7px;border-radius:4px;background:rgba(255,255,255,.06);overflow:hidden;margin-top:6px}
.pp-bar i{display:block;height:100%;border-radius:4px}
.pp-kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}
.pp-kv>div{background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center}
.pp-kv .k{font-size:9.5px;letter-spacing:1.5px;color:var(--muted);font-family:'Cinzel',serif;text-transform:uppercase}
.pp-kv .v{font-family:'Cormorant Garamond',serif;font-size:30px;color:var(--gold);line-height:1.2}
.pp-kv .t{font-size:11px;color:rgba(232,226,213,.6);line-height:1.5}
.pp-cyc{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:12px}
.pp-cyc div{width:62px;border:1px solid var(--border);border-radius:8px;padding:6px 0;text-align:center;font-size:10px;color:var(--muted)}
.pp-cyc div b{display:block;font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--text);font-weight:400}
.pp-cyc div.now{border-color:rgba(200,169,110,.6);background:rgba(200,169,110,.08)}
.pp-cyc div.now b{color:var(--gold)}
.pp-asp{padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.pp-asp:last-child{border-bottom:0}
.pp-asp .top{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.pp-asp .nm{font-size:13px;color:var(--text)}
.pp-asp .sc{font-family:'Cormorant Garamond',serif;font-size:20px}
.pp-asp .tx{font-size:12px;color:rgba(232,226,213,.62);line-height:1.65;margin-top:4px}
.pp-big{font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:300;text-align:center;line-height:1}
.pp-prog{height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-top:12px;display:none}
.pp-prog i{display:block;height:100%;background:var(--gold);width:0}
.pp-chart svg{width:100%;height:auto;display:block;min-width:520px}
.pp-cond{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:8px}
.pp-cond .tag{font-size:10px;color:var(--muted);font-family:'Cinzel',serif;letter-spacing:1px;width:70px;text-align:right}
@media(max-width:600px){.pp-mini.big{width:170px}.pp-in.date{width:130px}.pp-cond .tag{width:auto}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ═══════════ TEXTS ═══════════ */
const LINE_TXT={
 ambition:["ამბიცია თითქმის არ ჩანს — სხვისი აზრი ხშირად საკუთარზე მნიშვნელოვანია.","თვითშეფასება მერყევია; წარმატებას გარე მხარდაჭერა სჭირდება.","ჯანსაღი ამბიცია — იცის, რისი ღირსია, და ამას არ აზვიადებს.","მაღალი თვითშეფასება და მიზნის მიღწევის ნება; ლიდერობის სურვილი.","ძალიან მაღალი ამბიცია — მთავარია, ამპარტავნებაში არ გადაიზარდოს."],
 money:["მატერიალური სფერო მეორეხარისხოვანია; ფული ძნელად „ჩერდება“.","ფულს შრომით შოულობს, მაგრამ ფინანსური დაგეგმვა სუსტია.","სტაბილური შემოსავლის უნარი; პრაქტიკული, გონივრული ხარჯვა.","კარგი ფინანსური ალღო — შეუძლია ფულის მოზიდვაც და შენარჩუნებაც.","მატერიალური წარმატება ბუნებრივია; საფრთხე — მხოლოდ ფულზე ორიენტაცია."],
 talent:["ნიჭი ჯერ არ გამოვლენილა — მას სწავლა და შრომა აღვიძებს.","ნიჭი არსებობს, მაგრამ გამოვლენას განვითარება სჭირდება.","კარგი ბუნებრივი შესაძლებლობები — მთავარია სწორი სფეროს არჩევა.","გამოკვეთილი ნიჭი; ინტუიცია, მოვალეობა და მეხსიერება ერთად მუშაობს.","იშვიათი ნიჭიერება — მისი რეალიზება ცხოვრების ამოცანაა."],
 purpose:["მიზანი ხშირად იცვლება; გადაწყვეტილებას გარემოება იღებს.","მიზნები არის, მაგრამ ბოლომდე მიყვანას ძალისხმევა სჭირდება.","მიზანდასახული — იცის, რა უნდა, და ნაბიჯ-ნაბიჯ მიდის.","ძალიან მიზანდასახული; დაბრკოლება მხოლოდ ამძაფრებს ნებას.","ჯიუტი მიზანსწრაფვა — მიზანს ყველაფერს უქვემდებარებს."],
 family:["ოჯახის შექმნის მოთხოვნილება სუსტია ან გვიან ჩნდება.","ოჯახი მნიშვნელოვანია, მაგრამ პირველ ადგილზე სხვა რამ დგას.","ოჯახზე ორიენტირებული; ოჯახური ტრადიციები ღირებულია.","ოჯახი ცხოვრების ცენტრია — ზრუნვა ბუნებრივი მდგომარეობაა.","ოჯახისთვის თავგანწირული; საჭიროა საკუთარ თავზე ფიქრიც."],
 stability:["ცვლილებები უყვარს; რუტინა და მუდმივობა უჭირს.","მოქნილი — ადვილად ეგუება ახალს, ჩვევებს სწრაფად იცვლის.","ბალანსი სტაბილურობასა და ცვლილებას შორის.","ერთგულია ჩვევების, ადამიანებისა და პრინციპების; სტაბილურობა მთავარია.","კონსერვატიული — ცვლილება სტრესია, სიმყარე კი ძალა."],
 temperament:["ტემპერამენტი დაბალია — ვნებები იშვიათად იფეთქებს.","მშვიდი ტემპერამენტი; ემოციები ზომიერია.","ზომიერი, ჰარმონიული ტემპერამენტი.","მგზნებარე, ვნებიანი და აქტიური ტემპერამენტი.","ძალიან მაღალი ტემპერამენტი — პარტნიორიც მსგავსი სჭირდება."],
 spirit:["სულიერი ძიება ჯერ არ არის აქტუალური; ცხოვრება პრაქტიკულ სფეროშია.","სულიერი ინტერესი ეპიზოდურია.","სულიერი და მატერიალური ბალანსშია.","გამოხატული სულიერი მოთხოვნილება, ფილოსოფიური აზროვნება.","სულიერება ცხოვრების წამყვანი ძალაა."]
};
const lvl=t=>t===0?0:t<=2?1:t<=4?2:t<=6?3:4;
const LVL_NAME=['არ არის','სუსტი','საშუალო','ძლიერი','ძალიან ძლიერი'];
const TASK={1:"საკუთარი „მე“-ს გაძლიერება: აზრის ხმამაღლა თქმა, საზღვრების დაცვა.",2:"ენერგიის დაზოგვა და შევსება: ძილი, ბუნება, ნაკლები კონფლიქტი.",3:"ცნობისმოყვარეობის გაღვიძება: ზუსტი მეცნიერებები, წესრიგი, ახალი ჰობი.",4:"სხეულზე ზრუნვა: რეჟიმი, მოძრაობა, პრევენცია.",5:"ლოგიკის ვარჯიში: დაგეგმვა, ანალიზი, კითხვა „რატომ?“.",6:"შრომის სიყვარული: ხელით კეთება, დაწყებულის დასრულება.",7:"რწმენა და მადლიერება: იღბალი შრომით და ნდობით იხსნება.",8:"პასუხისმგებლობის აღება: დაპირების შესრულება, სხვაზე ზრუნვა.",9:"მეხსიერების წვრთნა: კითხვა, სწავლა, ჩანაწერები."};
const PYEAR={1:"ახალი დასაწყისი — ინიციატივა, თესვა, ახალი პროექტები.",2:"თანამშრომლობა და მოთმინება — ურთიერთობების წელი.",3:"შემოქმედება და კომუნიკაცია — სოციალური გაფართოება.",4:"შრომა და საფუძველი — დისციპლინა, მშენებლობა.",5:"ცვლილებები — მოგზაურობა, თავისუფლება, მოულოდნელობა.",6:"ოჯახი და სახლი — პასუხისმგებლობა, ზრუნვა.",7:"ანალიზი და სიმშვიდე — სწავლა, შინაგანი ძიება.",8:"მატერიალური შედეგი — ფინანსები, კარიერა, ძალაუფლება.",9:"დასრულება — ძველის გაშვება, ციკლის შეჯამება."};
const NUMTXT={1:"ლიდერი, დამოუკიდებელი",2:"დიპლომატი, მგრძნობიარე",3:"შემოქმედი, კომუნიკაბელური",4:"მშენებელი, საიმედო",5:"თავისუფალი, ცვალებადი",6:"მზრუნველი, ოჯახური",7:"მოაზროვნე, მისტიკოსი",8:"ორგანიზატორი, მატერიალური",9:"ჰუმანისტი, ბრძენი"};

/* ═══════════ FAST ENGINE ═══════════
   იმეორებს computeModes-ის ლოგიკას რიცხვებით (გადამოწმებულია ტესტით). */
const sdn=n=>{n=Math.abs(n);let s=0;while(n){s+=n%10;n=(n/10)|0;}return s;};
function addD(e,n){n=Math.abs(n);while(n){e[n%10]++;n=(n/10)|0;}}
const EX={};
function exTable(mode){
  if(EX[mode])return EX[mode];
  const T=new Int8Array(80*10*2*10);
  for(let A=0;A<80;A++)for(let fd=0;fd<10;fd++)for(let x=0;x<2;x++){
    const o=((A*10+fd)*2+x)*10, e=new Int8Array(10);
    if(mode==='classic'){const C=Math.abs(A-2*fd);addD(e,A);addD(e,sdn(A));addD(e,C);addD(e,sdn(C));}
    else if(mode==='corrected'){
      if(x){const C=A+19;addD(e,A);e[1]++;e[9]++;addD(e,C);addD(e,sdn(C));}
      else{const C=A-2;addD(e,A);e[2]++;addD(e,C);addD(e,sdn(C));}
    }else{const kA=Math.abs(A-9),kC=Math.abs(kA-2*fd);addD(e,kA);addD(e,sdn(kA));addD(e,kC);addD(e,sdn(kC));}
    for(let d=0;d<10;d++)T[o+d]=e[d];
  }
  return EX[mode]=T;
}
/* day-month combinations */
const DM=(function(){
  const dim=[31,29,31,30,31,30,31,31,30,31,30,31];
  const C=[],S=[],F=[],L=[];
  for(let m=1;m<=12;m++)for(let d=1;d<=dim[m-1];d++){
    const e=new Int8Array(10);addD(e,d);addD(e,m);
    C.push(e);S.push(sdn(d)+sdn(m));F.push(d<10?d:((d/10)|0));L.push(m===2&&d===29?1:0);
  }
  const n=C.length,CC=new Int8Array(n*10);C.forEach((e,i)=>CC.set(e,i*10));
  return{n,CC,S:Int16Array.from(S),F:Int8Array.from(F),L:Int8Array.from(L)};
})();
const isLeap=y=>(y%4===0&&y%100!==0)||y%400===0;
/* scan years [y0,y1], calling fn(c,y) with c = Int16Array(10) counts per digit */
function scanYears(y0,y1,mode,fn){
  const T=exTable(mode),c=new Int16Array(10),yc=new Int8Array(10);
  for(let y=y0;y<=y1;y++){
    yc.fill(0);addD(yc,y);const ys=sdn(y),lp=isLeap(y),x=y>=2000?1:0;
    for(let i=0;i<DM.n;i++){
      if(DM.L[i]&&!lp)continue;
      const A=DM.S[i]+ys,o=((A*10+DM.F[i])*2+x)*10,co=i*10;
      for(let d=1;d<10;d++)c[d]=DM.CC[co+d]+yc[d]+T[o+d];
      fn(c,y);
    }
  }
}
const sqKey=c=>{let k=0,m=1;for(let d=1;d<10;d++){k+=Math.min(c[d],15)*m;m*=16;}return k;};
const keyToC=k=>{const c=[0];for(let d=1;d<10;d++){c.push(k%16);k=Math.floor(k/16);}return c;};

/* ═══════════ helpers ═══════════ */
function parseDate(v){
  v=(v||'').trim();
  const m=v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{1,4})$/);if(!m)return null;
  const d=+m[1],mo=+m[2],y=+m[3];
  if(y<Y_MIN||y>Y_MAX||mo<1||mo>12||d<1)return null;
  const dim=[31,isLeap(y)?29:28,31,30,31,30,31,31,30,31,30,31][mo-1];if(d>dim)return null;
  return{dd:String(d).padStart(2,'0'),mm:String(mo).padStart(2,'0'),yyyy:String(y).padStart(4,'0'),d,mo,y};
}
function maskDate(inp){
  inp.addEventListener('input',e=>{let v=e.target.value.replace(/\D/g,'');if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2);if(v.length>5)v=v.slice(0,5)+'/'+v.slice(5,9);e.target.value=v;});
}
function countsFor(p,mode){return computeModes(p.dd,p.mm,p.yyyy)[mode].count;}
function mini(c,big){
  return `<div class="pp-mini${big?' big':''}">`+GRID_ORDER.map(n=>{
    const k=c[n]||0;return k?`<div style="color:${COLORS[n]}">${String(n).repeat(Math.min(k,6))}${k>6?'+':''}</div>`:`<div class="e">—</div>`;
  }).join('')+`</div>`;
}
const lineSum=(c,i)=>LINE_DIG[i].reduce((s,d)=>s+(c[d]||0),0);
const modeSel=(id,val)=>`<select class="pp-sel" id="${id}">`+Object.keys(MODE_NAMES).map(m=>`<option value="${m}"${m===val?' selected':''}>${MODE_NAMES[m]}</option>`).join('')+`</select>`;
const curMode=()=>(typeof activeMode!=='undefined'&&activeMode)||'classic';

/* ═══════════ NAV & PANELS ═══════════ */
const page=document.querySelector('.page'),header=document.querySelector('.page-header');
const nav=document.createElement('div');nav.id='pp-nav';
nav.innerHTML=[['main','კვადრატი'],['stats','სტატისტიკა'],['compat','შეთავსება']].map(([k,n])=>`<div class="mode-pill${k==='main'?' active':''}" data-v="${k}">${n}</div>`).join('');
header.after(nav);
const pStats=document.createElement('div');pStats.className='pp-panel';pStats.id='pp-stats';
const pComp=document.createElement('div');pComp.className='pp-panel';pComp.id='pp-compat';
page.appendChild(pStats);page.appendChild(pComp);
let view='main';
function setView(v){
  view=v;
  nav.querySelectorAll('.mode-pill').forEach(e=>e.classList.toggle('active',e.dataset.v===v));
  document.body.classList.toggle('pp-alt',v!=='main');
  pStats.classList.toggle('on',v==='stats');pComp.classList.toggle('on',v==='compat');
  if(v==='stats')initStats();
  if(v==='compat')initCompat();
}
nav.addEventListener('click',e=>{const t=e.target.closest('.mode-pill');if(t)setView(t.dataset.v);});

/* ═══════════ MAIN VIEW ENRICHMENT ═══════════ */
const extra=document.createElement('div');extra.id='pp-extra';extra.style.display='none';
const resultsEl=$('results');
/* after the energy curves / vedic / element blocks */
page.insertBefore(extra,pStats);
const RAR={};
function rarityTable(mode){
  if(RAR[mode])return RAR[mode];
  const H=new Int32Array(10*16),M=new Map();let N=0;
  scanYears(1900,2099,mode,c=>{N++;for(let d=1;d<10;d++)H[d*16+Math.min(c[d],15)]++;const k=sqKey(c);M.set(k,(M.get(k)||0)+1);});
  return RAR[mode]={H,M,N};
}
function enrich(){
  const p=parseDate($('birth').value);
  if(!p||typeof MODES==='undefined'||!MODES){extra.style.display='none';return;}
  const mode=curMode(),c=MODES[mode].count;
  /* compound card texts */
  LINE_KEYS.forEach((k,i)=>{const el=$('cp-'+k);if(!el)return;const t=lineSum(c,i);
    el.innerHTML=`<span style="color:rgba(200,169,110,.8);font-size:10px;letter-spacing:1px">${LVL_NAME[lvl(t)]}</span><br>${LINE_TXT[k][lvl(t)]}`;});
  /* personal numbers */
  const now=new Date(),Y=now.getFullYear(),M=now.getMonth()+1;
  const psych=rootStr(p.dd),dest=rootStr(p.dd+p.mm+p.yyyy);
  const py=y=>rootStr(p.dd+p.mm+String(y));
  /* personal year starts on the birthday */
  const bdPassed=(M>p.mo)||(M===p.mo&&now.getDate()>=p.d);
  const pyNow=py(bdPassed?Y:Y-1),pm=root(pyNow+M);
  let cyc='';for(let y=Y-4;y<=Y+4;y++)cyc+=`<div class="${y===(bdPassed?Y:Y-1)?'now':''}"><b>${py(y)}</b>${y}</div>`;
  /* modes compare */
  const modesTbl=`<table class="pp-tbl"><tr><th></th>${DIG.map(d=>`<th style="color:${COLORS[d]}">${d}</th>`).join('')}<th>ცარ.</th></tr>`+
    Object.keys(MODE_NAMES).map(m=>{const cc=MODES[m].count;return `<tr${m===mode?' class="sel"':''}><td class="l">${MODE_NAMES[m]}</td>${DIG.map(d=>`<td>${cc[d]||'<span style="opacity:.25">0</span>'}</td>`).join('')}<td>${DIG.filter(d=>!cc[d]).length}</td></tr>`;}).join('')+`</table>`;
  /* empty cells */
  const empt=DIG.filter(d=>!c[d]);
  const over=DIG.filter(d=>c[d]>=4);
  /* rarity among 1900–2099 */
  const R=rarityTable(mode);
  const same=R.M.get(sqKey(c))||0;
  let rows='';DIG.forEach(d=>{const k=Math.min(c[d],15);const pp=pct(R.H[d*16+k],R.N);
    rows+=`<tr><td class="l" style="color:${COLORS[d]}">${d} · ${LABELS[d]}</td><td>${c[d]}</td><td>${fp(pp)}%</td><td style="width:40%"><div class="pp-bar"><i style="width:${Math.min(100,pp)}%;background:${COLORS[d]}"></i></div></td></tr>`;});
  extra.innerHTML=`
  <div class="group-separator"><div class="group-line"></div><div class="group-label">დამატებითი ანალიზი</div><div class="group-line"></div></div>
  <div class="pp-card"><div class="pp-h">პირადი რიცხვები</div>
    <div class="pp-kv">
      <div><div class="k">დღის რიცხვი</div><div class="v">${psych}</div><div class="t">${NUMTXT[psych]}</div></div>
      <div><div class="k">ბედისწერის რიცხვი</div><div class="v">${dest}</div><div class="t">${NUMTXT[dest]}</div></div>
      <div><div class="k">პირადი წელი</div><div class="v">${pyNow}</div><div class="t">${PYEAR[pyNow]}</div></div>
      <div><div class="k">პირადი თვე</div><div class="v">${pm}</div><div class="t">${PYEAR[pm].split(' — ')[0]}</div></div>
    </div>
    <div class="pp-cyc">${cyc}</div>
    <div class="pp-note" style="text-align:center;margin-top:10px">პირადი წელი = დღე + თვე + კალენდარული წელი → ციფრულ ფესვამდე. ახალი პირადი წელი იწყება დაბადების დღიდან. 9-წლიანი ციკლი: 1 — თესვა … 9 — მოსავალი და დასრულება.</div>
  </div>
  <div class="pp-card"><div class="pp-h">ცარიელი უჯრები · განვითარების ამოცანები</div>
    ${empt.length?empt.map(d=>`<div class="pp-asp"><div class="top"><span class="nm" style="color:${COLORS[d]}">${d} · ${LABELS[d]}</span></div><div class="tx">${TASK[d]}</div></div>`).join(''):'<div class="pp-note">ცარიელი უჯრა არ არის — ყველა ენერგია წარმოდგენილია.</div>'}
    ${over.length?`<div class="pp-note" style="margin-top:10px"><b>ჭარბი ენერგია (4+):</b> ${over.map(d=>`${d} · ${LABELS[d]}`).join(', ')} — ძლიერი მხარეა, მაგრამ ზედმეტი სიმძაფრე ზოგჯერ დისბალანსს ქმნის.</div>`:''}
  </div>
  <div class="pp-card"><div class="pp-h">სამი რეჟიმის შედარება</div><div class="pp-scroll">${modesTbl}</div>
    <div class="pp-note" style="margin-top:8px">ერთი თარიღი, სამი გამოთვლა — რომელი ენერგია მყარია (ყველა რეჟიმში ერთნაირი) და რომელი იცვლება კრიზისში.</div></div>
  <div class="pp-card"><div class="pp-h">რამდენად იშვიათია შენი კვადრატი</div>
    <div class="pp-note" style="margin-bottom:10px">შედარება ყველა თარიღთან <b>1900–2099</b> (${R.N.toLocaleString('en-US')} დღე, რეჟიმი: ${MODE_NAMES[mode]}). ზუსტად იგივე კვადრატი აქვს <b>${fp(pct(same,R.N))}%</b>-ს (${same.toLocaleString('en-US')} დღე), სულ ${R.M.size.toLocaleString('en-US')} განსხვავებული კვადრატიდან.</div>
    <div class="pp-scroll"><table class="pp-tbl"><tr><th style="text-align:left">უჯრა</th><th>შენ</th><th>ასეთი რაოდენობა აქვს</th><th></th></tr>${rows}</table></div></div>`;
  extra.style.display='block';
}
const _setMode=window.setMode;
window.setMode=function(){const r=_setMode.apply(this,arguments);try{enrich();}catch(e){console.error(e);}return r;};

/* ═══════════ STATISTICS ═══════════ */
let statsInit=false,conds=[],running=null,lastStats=null,chartDigit=2,chartKind='empty';
function initStats(){
  if(statsInit)return;statsInit=true;
  pStats.innerHTML=`
  <div class="pp-card">
    <div class="pp-h" style="text-align:center">ენერგიების სტატისტიკა</div>
    <div class="pp-row" style="margin-bottom:12px">
      <span class="pp-note">წლები</span><input class="pp-in yr" id="ps-y0" value="1"><span class="pp-note">—</span><input class="pp-in yr" id="ps-y1" value="9999">
      <select class="pp-sel" id="ps-pre"><option value="">შაბლონი…</option><option value="1-9999">1 – 9999 (სრული)</option><option value="1900-2099">1900 – 2099 (XX–XXI)</option><option value="1900-1999">1900 – 1999</option><option value="2000-2099">2000 – 2099</option><option value="1-1999">1 – 1999</option><option value="2000-9999">2000 – 9999</option></select>
      ${modeSel('ps-mode',curMode())}
    </div>
    <div id="ps-conds"></div>
    <div class="pp-row"><span class="pp-btn sm" id="ps-add">+ პირობა</span><span class="pp-btn" id="ps-run">გამოთვლა</span></div>
    <div class="pp-prog" id="ps-prog"><i></i></div>
    <div class="pp-note" style="text-align:center;margin-top:12px">პირველი პირობა მთავარია, დანარჩენი — დამატებითი (ყველა ერთად, „და“). პირობის გარეშე ჩანს მთელი დიაპაზონი; პირობით — მხოლოდ ის დღეები, სადაც ის სრულდება, და ↑↓ ისრები აჩვენებს, რამდენჯერ იცვლება ალბათობა საერთოსთან შედარებით.</div>
  </div>
  <div id="ps-out"></div>`;
  const pre=$('ps-pre');pre.onchange=()=>{if(!pre.value)return;const[a,b]=pre.value.split('-');$('ps-y0').value=a;$('ps-y1').value=b;pre.value='';};
  $('ps-add').onclick=()=>{if(conds.length>=4)return;conds.push({t:'d',d:2,op:'=',k:0});drawConds();};
  $('ps-run').onclick=runStats;
  drawConds();
}
function drawConds(){
  const box=$('ps-conds');
  box.innerHTML=conds.map((c,i)=>{
    const tsel=`<select class="pp-sel" data-i="${i}" data-f="t">`+
      DIG.map(d=>`<option value="d${d}"${c.t==='d'&&c.d===d?' selected':''}>${d} · ${LABELS[d]}</option>`).join('')+
      LINE_KEYS.map((k,j)=>`<option value="l${j}"${c.t==='l'&&c.d===j?' selected':''}>ხაზი ${COMPOUND[k].label} · ${COMPOUND[k].name}</option>`).join('')+
      `<option value="e"${c.t==='e'?' selected':''}>ცარიელი უჯრების რაოდენობა</option></select>`;
    const osel=`<select class="pp-sel" data-i="${i}" data-f="op">`+['=','≥','≤'].map(o=>`<option${o===c.op?' selected':''}>${o}</option>`).join('')+`</select>`;
    return `<div class="pp-cond"><span class="tag">${i?'და':'მთავარი'}</span>${tsel}${osel}<input class="pp-in k" type="number" min="0" max="15" value="${c.k}" data-i="${i}" data-f="k"><span class="pp-x" data-x="${i}">×</span></div>`;
  }).join('');
  box.querySelectorAll('[data-f]').forEach(el=>el.onchange=()=>{
    const c=conds[+el.dataset.i],f=el.dataset.f;
    if(f==='t'){const v=el.value;if(v==='e'){c.t='e';c.d=0;}else{c.t=v[0];c.d=+v.slice(1);}}
    else if(f==='op')c.op=el.value;else c.k=Math.max(0,Math.min(15,+el.value||0));
  });
  box.querySelectorAll('[data-x]').forEach(el=>el.onclick=()=>{conds.splice(+el.dataset.x,1);drawConds();});
}
const condName=c=>(c.t==='d'?`${c.d} · ${LABELS[c.d]}`:c.t==='l'?`ხაზი ${COMPOUND[LINE_KEYS[c.d]].label}`:'ცარიელი უჯრები')+` ${c.op} ${c.k}`;
function runStats(){
  if(running){running.stop=true;}
  let y0=Math.round(+$('ps-y0').value),y1=Math.round(+$('ps-y1').value);
  if(!(y0>=Y_MIN))y0=Y_MIN;if(!(y1<=Y_MAX))y1=Y_MAX;if(y0>y1)[y0,y1]=[y1,y0];
  $('ps-y0').value=y0;$('ps-y1').value=y1;
  const mode=$('ps-mode').value;
  const CS=conds.map(c=>({...c}));const has=CS.length>0;
  const KM=16,LM=28;
  const S={y0,y1,mode,conds:CS,has,N:0,NC:0,
    HB:new Float64Array(10*KM),HC:new Float64Array(10*KM),SB:new Float64Array(10),SC:new Float64Array(10),
    LB:new Float64Array(8*LM),LC:new Float64Array(8*LM),EB:new Float64Array(10),EC:new Float64Array(10),
    YN:new Float64Array(y1-y0+1),YE:new Float64Array((y1-y0+1)*10),YS:new Float64Array((y1-y0+1)*10),SQ:new Map(),KM,LM};
  const lt=new Int16Array(8);
  const test=(c,empt)=>{for(const q of CS){const v=q.t==='d'?c[q.d]:q.t==='l'?lt[q.d]:empt;
    if(q.op==='='?v!==q.k:q.op==='≥'?v<q.k:v>q.k)return false;}return true;};
  const fn=(c,y)=>{
    S.N++;let empt=0;
    for(let d=1;d<10;d++){const k=c[d];S.HB[d*KM+(k<KM?k:KM-1)]++;S.SB[d]+=k;if(!k)empt++;}
    S.EB[empt]++;
    for(let l=0;l<8;l++){const g=LINE_DIG[l];const t=c[g[0]]+c[g[1]]+c[g[2]];lt[l]=t;S.LB[l*LM+(t<LM?t:LM-1)]++;}
    if(has&&!test(c,empt))return;
    S.NC++;const yi=y-y0;S.YN[yi]++;
    for(let d=1;d<10;d++){const k=c[d];if(has){S.HC[d*KM+(k<KM?k:KM-1)]++;S.SC[d]+=k;}if(!k)S.YE[yi*10+d]++;S.YS[yi*10+d]+=k;}
    if(has){S.EC[empt]++;for(let l=0;l<8;l++){const t=lt[l];S.LC[l*LM+(t<LM?t:LM-1)]++;}}
    const key=sqKey(c);S.SQ.set(key,(S.SQ.get(key)||0)+1);
  };
  const job={stop:false};running=job;
  const prog=$('ps-prog');prog.style.display='block';const bar=prog.firstChild;
  $('ps-out').innerHTML='';
  let y=y0;const CH=120,t0=performance.now();
  (function step(){
    if(job.stop)return;
    const e=Math.min(y1,y+CH-1);scanYears(y,e,mode,fn);y=e+1;
    bar.style.width=(pct(y-y0,y1-y0+1)).toFixed(1)+'%';
    if(y<=y1){setTimeout(step,0);return;}
    prog.style.display='none';running=null;S.ms=performance.now()-t0;
    if(!has){S.HC=S.HB;S.SC=S.SB;S.EC=S.EB;S.LC=S.LB;}
    lastStats=S;renderStats();
  })();
}
function liftTag(c,b){
  if(!lastStats.has)return '';
  if(b===0)return c>0?'<span class="pp-lift pp-up">ახალი</span>':'';
  const r=c/b;if(Math.abs(r-1)<0.1)return '<span class="pp-lift" style="opacity:.4">≈</span>';
  return r>1?`<span class="pp-lift pp-up">↑${r>=10?r.toFixed(0):r.toFixed(1)}×</span>`:`<span class="pp-lift pp-dn">↓${r<0.01?'0':r.toFixed(2)}×</span>`;
}
function heat(p,max,col){const a=max?Math.min(.55,p/max*.55):0;return `background:${col.replace(/[\d.]+\)$/,a.toFixed(3)+')')}`;}
function renderStats(){
  const S=lastStats,out=$('ps-out'),N=S.N,NC=S.NC,KM=S.KM,LM=S.LM;
  const P=parseDate($('birth').value);let mine=null;
  if(P&&P.y>=S.y0&&P.y<=S.y1){const c=countsFor(P,S.mode);mine={c,n:S.SQ.get(sqKey(c))||0};}
  if(!NC){out.innerHTML=`<div class="pp-card pp-note" style="text-align:center">ამ პირობებით ${S.y0}–${S.y1} წლებში არცერთი თარიღი არ მოიძებნა.</div>`;return;}
  /* summary */
  let h=`<div class="pp-card"><div class="pp-kv">
    <div><div class="k">დიაპაზონი</div><div class="v" style="font-size:22px">${S.y0} – ${S.y1}</div><div class="t">${MODE_NAMES[S.mode]} · ${(S.ms/1000).toFixed(1)} წმ</div></div>
    <div><div class="k">სულ დღე</div><div class="v" style="font-size:24px">${N.toLocaleString('en-US')}</div></div>
    ${S.has?`<div><div class="k">პირობას აკმაყოფილებს</div><div class="v" style="font-size:24px">${fp(pct(NC,N))}%</div><div class="t">${NC.toLocaleString('en-US')} დღე</div></div>`:''}
    <div><div class="k">განსხვავებული კვადრატი</div><div class="v" style="font-size:24px">${S.SQ.size.toLocaleString('en-US')}</div></div>
  </div>${S.has?`<div class="pp-note" style="text-align:center;margin-top:10px">პირობა: <b>${S.conds.map(condName).join(' · და · ')}</b></div>`:''}</div>`;
  /* digit count table */
  const KS=8;let maxP=0;
  for(let d=1;d<10;d++)for(let k=0;k<KS;k++){let v=0;if(k<KS-1)v=S.HC[d*KM+k];else for(let j=k;j<KM;j++)v+=S.HC[d*KM+j];maxP=Math.max(maxP,pct(v,NC));}
  h+=`<div class="pp-card"><div class="pp-h">ენერგიების რაოდენობა უჯრებში</div>
    <div class="pp-note" style="margin-bottom:10px">რამდენ % დღეს აქვს მოცემული ციფრი 0, 1, 2 … ჯერ. <b>0</b> — ცარიელი უჯრა. დააჭირე სტრიქონს — ქვემოთ გრაფიკი შეიცვლება.</div>
    <div class="pp-scroll"><table class="pp-tbl"><tr><th style="text-align:left">უჯრა</th>${[...Array(KS)].map((_,k)=>`<th>${k===0?'0 · ცარ.':k===KS-1?k+'+':k}</th>`).join('')}<th>საშ.</th>${mine?'<th>შენ</th>':''}</tr>`;
  for(let d=1;d<10;d++){
    h+=`<tr class="click${d===chartDigit?' sel':''}" data-d="${d}"><td class="l" style="color:${COLORS[d]}">${d} · ${LABELS[d]}</td>`;
    for(let k=0;k<KS;k++){
      let c=0,b=0;if(k<KS-1){c=S.HC[d*KM+k];b=S.HB[d*KM+k];}else for(let j=k;j<KM;j++){c+=S.HC[d*KM+j];b+=S.HB[d*KM+j];}
      const pc=pct(c,NC),pb=pct(b,N);
      const isMine=mine&&(k<KS-1?mine.c[d]===k:mine.c[d]>=k);
      h+=`<td style="${heat(pc,maxP,COLORS[d])}${isMine?';outline:1px solid rgba(155,127,232,.9);outline-offset:-2px':''}">${c?fp(pc):'<span style="opacity:.25">0</span>'}${liftTag(pc,pb)}</td>`;
    }
    const mc=S.SC[d]/NC,mb=S.SB[d]/N;
    h+=`<td>${mc.toFixed(2)}${liftTag(mc,mb)}</td>${mine?`<td style="color:rgba(155,127,232,.95)">${mine.c[d]}</td>`:''}</tr>`;
  }
  h+=`</table></div>${mine?'<div class="pp-note" style="margin-top:8px">ვიოლეტისფერი ჩარჩო — შენი რაოდენობა.</div>':''}</div>`;
  /* per-year chart */
  h+=`<div class="pp-card"><div class="pp-row" style="justify-content:space-between;margin-bottom:8px">
     <div class="pp-h" style="margin:0">დინამიკა წლების მიხედვით</div>
     <div class="pp-row"><select class="pp-sel" id="ps-cd">${DIG.map(d=>`<option value="${d}"${d===chartDigit?' selected':''}>${d} · ${LABELS[d]}</option>`).join('')}</select>
     <select class="pp-sel" id="ps-ck"><option value="empty"${chartKind==='empty'?' selected':''}>ცარიელი უჯრის %</option><option value="mean"${chartKind==='mean'?' selected':''}>საშუალო რაოდენობა</option></select></div></div>
     <div class="pp-scroll pp-chart" id="ps-chart"></div>
     <div class="pp-note" id="ps-chn" style="margin-top:6px"></div></div>`;
  /* lines */
  const LS=13;let maxL=0;
  for(let l=0;l<8;l++)for(let t=0;t<LS;t++){let v=0;if(t<LS-1)v=S.LC[l*LM+t];else for(let j=t;j<LM;j++)v+=S.LC[l*LM+j];maxL=Math.max(maxL,pct(v,NC));}
  h+=`<div class="pp-card"><div class="pp-h">ხაზები (სტრიქონები, სვეტები, დიაგონალები)</div>
    <div class="pp-note" style="margin-bottom:10px">ხაზის ჯამი = მისი სამი უჯრის ციფრების რაოდენობა. რამდენ % დღეს რა ჯამი აქვს.</div>
    <div class="pp-scroll"><table class="pp-tbl"><tr><th style="text-align:left">ხაზი</th>${[...Array(LS)].map((_,t)=>`<th>${t===LS-1?t+'+':t}</th>`).join('')}<th>საშ.</th></tr>`;
  for(let l=0;l<8;l++){
    const k=LINE_KEYS[l];let sc=0,sb=0;
    for(let t=0;t<LM;t++){sc+=t*S.LC[l*LM+t];sb+=t*S.LB[l*LM+t];}
    h+=`<tr><td class="l">${COMPOUND[k].name} <span style="opacity:.45;font-size:10px">${COMPOUND[k].label}</span></td>`;
    for(let t=0;t<LS;t++){let c=0,b=0;if(t<LS-1){c=S.LC[l*LM+t];b=S.LB[l*LM+t];}else for(let j=t;j<LM;j++){c+=S.LC[l*LM+j];b+=S.LB[l*LM+j];}
      const pc=pct(c,NC);h+=`<td style="${heat(pc,maxL,'rgba(200,169,110,.9)')}">${c?fp(pc):'<span style="opacity:.2">·</span>'}${liftTag(pc,pct(b,N))}</td>`;}
    h+=`<td>${(sc/NC).toFixed(2)}${liftTag(sc/NC,sb/N)}</td></tr>`;
  }
  h+=`</table></div></div>`;
  /* empty cells count */
  let maxE=0;for(let e=0;e<10;e++)maxE=Math.max(maxE,pct(S.EC[e],NC));
  const myE=mine?DIG.filter(d=>!mine.c[d]).length:-1;
  h+=`<div class="pp-card"><div class="pp-h">ცარიელი უჯრების რაოდენობა კვადრატში</div>`+
    [...Array(10)].map((_,e)=>{const pc=pct(S.EC[e],NC);if(!S.EC[e]&&!S.EB[e])return '';
      return `<div class="pp-row" style="justify-content:flex-start;flex-wrap:nowrap;margin:4px 0"><span style="width:118px;font-size:12px;${e===myE?'color:rgba(155,127,232,.95)':''}">${e} ცარიელი${e===myE?' ← შენ':''}</span>
      <div class="pp-bar" style="flex:1;margin:0"><i style="width:${maxE?pc/maxE*100:0}%;background:rgba(200,169,110,.7)"></i></div><span style="width:86px;text-align:right;font-size:12px">${fp(pc)}%${liftTag(pc,pct(S.EB[e],N)).replace('pp-lift','pp-lift" style="display:inline;margin-left:4px')}</span></div>`;}).join('')+`</div>`;
  /* top squares */
  const arr=[...S.SQ.entries()].sort((a,b)=>b[1]-a[1]);
  const once=arr.filter(e=>e[1]===1).length;
  h+=`<div class="pp-card"><div class="pp-h">ყველაზე ხშირი კვადრატები</div><div class="pp-sq">`+
    arr.slice(0,8).map(([k,n],i)=>`<div class="pp-sqi">${mini(keyToC(k))}<b>${fp(pct(n,NC))}%</b>#${i+1}</div>`).join('')+`</div>
    <div class="pp-note" style="text-align:center;margin-top:12px">ყველაზე იშვიათი — ${once.toLocaleString('en-US')} კვადრატი, რომელიც დიაპაზონში მხოლოდ ერთ დღეს გვხვდება.</div>`+
    (mine?`<div class="pp-note" style="text-align:center;margin-top:6px">შენი კვადრატი: <b>${mine.n?fp(pct(mine.n,NC))+'%':'პირობას არ აკმაყოფილებს'}</b>${mine.n?` · ადგილი ${arr.findIndex(e=>e[1]===mine.n)+1} / ${arr.length}`:''}</div>`:'')+`</div>`;
  h+=`<div class="pp-card pp-note"><div class="pp-h">როგორ ითვლება</div>
    • ყოველი კალენდარული დღე ითვლება ერთხელ (თანაბარი წონით) — ეს თარიღების სტატისტიკაა, არა რეალური მოსახლეობის.<br>
    • <b>რატომ 1–9999:</b> კვადრატი ითვლის თარიღის ჩაწერილ ციფრებს (DD/MM/YYYY, გრიგორიანული კალენდარი). ძვ.წ. წლებს ასეთი ჩანაწერი არ აქვს — მინუსი და „ძვ.წ.“ ციფრი არ არის, 0 წელი კი კალენდარში არ არსებობს. 1000-მდე წლები იწერება წინა ნულებით (0325) — ნული კვადრატში არ ითვლება.<br>
    • კორექტირებული რეჟიმი შექმნილია XX–XXI საუკუნეებისთვის; სხვა წლებზე იგივე წესია (2000-მდე → −2, 2000-დან → +19).<br>
    • ↑2.0× — პირობის დროს ეს შედეგი 2-ჯერ ხშირია, ვიდრე მთელ დიაპაზონში; ↓0.50× — 2-ჯერ იშვიათი.</div>`;
  out.innerHTML=h;
  out.querySelectorAll('tr.click').forEach(tr=>tr.onclick=()=>{chartDigit=+tr.dataset.d;$('ps-cd').value=chartDigit;
    out.querySelectorAll('tr.click').forEach(t=>t.classList.toggle('sel',t===tr));drawChart();});
  $('ps-cd').onchange=e=>{chartDigit=+e.target.value;out.querySelectorAll('tr.click').forEach(t=>t.classList.toggle('sel',+t.dataset.d===chartDigit));drawChart();};
  $('ps-ck').onchange=e=>{chartKind=e.target.value;drawChart();};
  drawChart();
}
function drawChart(){
  const S=lastStats,d=chartDigit,span=S.y1-S.y0+1;
  const B=Math.max(1,Math.ceil(span/500)),nb=Math.ceil(span/B);
  const pts=[];
  for(let b=0;b<nb;b++){let n=0,v=0;for(let i=b*B;i<Math.min(span,(b+1)*B);i++){n+=S.YN[i];v+=chartKind==='empty'?S.YE[i*10+d]:S.YS[i*10+d];}
    pts.push(n?(chartKind==='empty'?v/n*100:v/n):null);}
  const vals=pts.filter(v=>v!==null);
  const W=720,H=240,L=44,R=12,T=14,Bm=30,iw=W-L-R,ih=H-T-Bm;
  let lo=Math.min(...vals),hi=Math.max(...vals);
  if(chartKind==='empty'){lo=Math.max(0,Math.floor(lo/5)*5);hi=Math.min(100,Math.ceil(hi/5)*5);}
  else{lo=Math.floor(lo*2)/2;hi=Math.ceil(hi*2)/2;}
  if(hi-lo<1e-9){hi=lo+1;}
  const x=i=>L+(nb>1?iw*i/(nb-1):iw/2),y=v=>T+ih*(1-(v-lo)/(hi-lo));
  let s='';
  for(let g=0;g<=4;g++){const v=lo+(hi-lo)*g/4;s+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,.05)"/><text x="${L-6}" y="${y(v)+3}" text-anchor="end" font-size="9" fill="rgba(232,226,213,.4)">${chartKind==='empty'?v.toFixed(0)+'%':v.toFixed(1)}</text>`;}
  const nt=Math.min(8,nb);for(let t=0;t<nt;t++){const i=Math.round(t*(nb-1)/Math.max(1,nt-1));const yr=S.y0+i*B;
    s+=`<text x="${x(i)}" y="${H-10}" text-anchor="middle" font-size="9" fill="rgba(232,226,213,.45)">${yr}</text>`;}
  /* XX/XXI boundary */
  if(S.y0<2000&&S.y1>=2000){const i=(2000-S.y0)/B;if(i<=nb-1)s+=`<line x1="${x(i)}" x2="${x(i)}" y1="${T}" y2="${T+ih}" stroke="rgba(155,127,232,.35)" stroke-dasharray="3 4"/><text x="${x(i)+4}" y="${T+9}" font-size="8.5" fill="rgba(155,127,232,.7)">2000</text>`;}
  let path='',pen=false;pts.forEach((v,i)=>{if(v===null){pen=false;return;}path+=(pen?'L':'M')+x(i).toFixed(1)+','+y(v).toFixed(1);pen=true;});
  const col=COLORS[d];
  s+=`<path d="${path}" fill="none" stroke="${col}" stroke-width="${nb>200?1.2:1.8}" stroke-linejoin="round"/>`;
  if(nb<=60)pts.forEach((v,i)=>{if(v!==null)s+=`<circle cx="${x(i)}" cy="${y(v)}" r="2.4" fill="#06050f" stroke="${col}"/>`;});
  $('ps-chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}">${s}</svg>`;
  $('ps-chn').innerHTML=`${d} · ${LABELS[d]} — ${chartKind==='empty'?'რამდენ % დღეს არის ეს უჯრა ცარიელი':'ციფრის საშუალო რაოდენობა'}${B>1?` · ყოველი წერტილი = ${B} წელი`:' · ყოველი წერტილი = 1 წელი'}${lastStats.has?' · მხოლოდ პირობის დღეები':''}.`;
}

/* ═══════════ COMPATIBILITY ═══════════ */
let compInit=false;
function initCompat(){
  if(!compInit){
    compInit=true;
    const person=(k,t)=>`<div style="text-align:center"><div class="pp-note" style="margin-bottom:6px">${t}</div>
      <input class="pp-in" id="pc-n${k}" placeholder="სახელი" style="width:150px;display:block;margin:0 auto 8px;text-align:center">
      <input class="pp-in date" id="pc-d${k}" placeholder="DD/MM/YYYY" maxlength="10"></div>`;
    pComp.innerHTML=`<div class="pp-card"><div class="pp-h" style="text-align:center">შეთავსება პითაგორას კვადრატით</div>
      <div class="pp-row" style="gap:26px;margin-bottom:14px">${person('a','პირველი')}${person('b','მეორე')}</div>
      <div class="pp-row">${modeSel('pc-mode',curMode())}<span class="pp-btn" id="pc-run">შედარება</span></div>
      <div class="pp-note" style="text-align:center;margin-top:10px">პირველი ივსება მთავარი გვერდის თარიღიდან, თუ უკვე შეიყვანე.</div></div>
      <div id="pc-out"></div>`;
    ['a','b'].forEach(k=>{maskDate($('pc-d'+k));$('pc-d'+k).addEventListener('keydown',e=>{if(e.key==='Enter')runCompat();});});
    $('pc-run').onclick=runCompat;
  }
  if(!$('pc-da').value&&parseDate($('birth').value))$('pc-da').value=$('birth').value;
}
const CONCORD=[[1,5,7],[2,4,8],[3,6,9]];
function runCompat(){
  const A=parseDate($('pc-da').value),B=parseDate($('pc-db').value),out=$('pc-out');
  if(!A||!B){out.innerHTML=`<div class="pp-card pp-note" style="text-align:center">შეიყვანე ორივე თარიღი ფორმატით DD/MM/YYYY (წელი 1–9999).</div>`;return;}
  const mode=$('pc-mode').value,na=esc($('pc-na').value.trim()||'პირველი პარტნიორი'),nb=esc($('pc-nb').value.trim()||'მეორე პარტნიორი');
  const a=countsFor(A,mode),b=countsFor(B,mode);
  const L=(c,k)=>COMPOUND[k].keys.reduce((s,d)=>s+c[d],0);
  const items=[];const add=(name,w,s,t)=>items.push({name,w,s,t});
  /* 1 · character */
  {const x=a[1],y=b[1],lead=x>y?na:nb;let s,t;
   if(x>=4&&y>=4){s=35;t='ორივე ძალიან ძლიერი ხასიათისაა — ლიდერობისთვის ბრძოლის რისკი. საჭიროა სფეროების გაყოფა: ვინ რას წყვეტს.';}
   else if(x>=3&&y>=3){s=50;t='ორი ძლიერი ხასიათი — ვნებიანი, მაგრამ კონფლიქტური წყვილი; დათმობა ორივემ უნდა ისწავლოს.';}
   else if(Math.abs(x-y)>=2){s=82;t=`${lead} ხასიათით წამყვანია, ${x>y?nb:na} — უფრო მოქნილი. ასეთი წყვილი სტაბილურია, თუ ეს როლები ორივეს მოსწონს.`;}
   else if(x+y<=2){s=55;t='ორივე რბილი ხასიათისაა — ჰარმონიულია, მაგრამ გადაწყვეტილებები შეიძლება გაჭიანურდეს.';}
   else{s=75;t='ხასიათით დაახლოებით თანაბარნი არიან — თანასწორი პარტნიორობა.';}
   add(`ხასიათი (1) · ${x} / ${y}`,1.2,s,t);}
  /* 2 · energy */
  {const x=a[2],y=b[2];let s,t;
   if(!x&&!y){s=30;t='ორივეს ენერგია აკლია — დაღლილობა და გაღიზიანება ადვილად ჩნდება; საჭიროა დასვენება და ენერგიის გარე წყარო (ბუნება, სპორტი).';}
   else if(x+y>=4){s=90;t='ენერგია ორივესთვის საკმარისია — წყვილს აქტიური ცხოვრება შეუძლია.';}
   else{s=68;t='ენერგია ზომიერია — მისი ხარჯვა გონივრულად უნდა გადანაწილდეს.';}
   if(Math.abs(x-y)>=2)t+=` ${x>y?na:nb} ენერგიის დონორია — ${x>y?nb:na} მისგან „იკვებება“; დონორს დასვენება სჭირდება.`;
   add(`ენერგია (2) · ${x} / ${y}`,1.2,s,t);}
  /* temperament line */
  {const x=L(a,'temperament'),y=L(b,'temperament'),df=Math.abs(x-y);
   const s=df<=1?95:df===2?65:30;
   add(`ტემპერამენტი (3-5-7) · ${x} / ${y}`,1.5,s,df<=1?'ტემპერამენტი ემთხვევა — ინტიმური და ემოციური ჰარმონია.':df===2?'მცირე სხვაობა — საჭიროა ერთმანეთის რიტმთან შეგუება.':`დიდი სხვაობა — ${x>y?na:nb} უფრო მგზნებარეა; შეუსაბამობა შეიძლება გაუგებრობად იქცეს.`);}
  /* family line */
  {const x=L(a,'family'),y=L(b,'family');let s,t;
   if(x>=3&&y>=3){s=92;t='ორივესთვის ოჯახი პრიორიტეტია — ძლიერი საფუძველი.';}
   else if((x>=3&&y<=1)||(y>=3&&x<=1)){s=48;t=`${x>y?na:nb} ოჯახზეა ორიენტირებული, ${x>y?nb:na} — ნაკლებად; მოლოდინები უნდა შეთანხმდეს.`;}
   else{s=68;t='ოჯახზე ორიენტაცია ზომიერია ორივესთან.';}
   add(`ოჯახი (2-5-8) · ${x} / ${y}`,1.2,s,t);}
  /* habits / stability */
  {const x=L(a,'stability'),y=L(b,'stability'),df=Math.abs(x-y);
   add(`ჩვევები · სტაბილურობა (3-6-9) · ${x} / ${y}`,1.0,df<=1?90:df===2?65:40,df<=1?'ჩვევები და ცხოვრების წესი მსგავსია — ერთად ცხოვრება ადვილია.':df===2?'ჩვევებში მცირე სხვაობაა — კომპრომისით გადაილახება.':`${x>y?na:nb} სტაბილურობას ეძებს, ${x>y?nb:na} — ცვლილებებს; ყოფაში ხახუნის წყარო.`);}
  /* purpose */
  {const x=L(a,'purpose'),y=L(b,'purpose'),df=Math.abs(x-y);
   add(`მიზანდასახულობა (1-4-7) · ${x} / ${y}`,0.8,df<=1?85:df===2?65:45,df<=1?'ერთნაირი სიმტკიცე მიზნისკენ — საერთო გეგმები ადვილად ხორციელდება.':`${x>y?na:nb} უფრო მიზანდასახულია — ის განსაზღვრავს წყვილის მიმართულებას.`);}
  /* complement */
  {const ea=DIG.filter(d=>!a[d]),eb=DIG.filter(d=>!b[d]),both=ea.filter(d=>!b[d]);
   const tot=ea.length+eb.length,filled=ea.filter(d=>b[d]).length+eb.filter(d=>a[d]).length;
   const s=tot?Math.round(40+60*filled/tot):85;
   let t=tot?`ცარიელი უჯრებიდან ${filled} / ${tot} ავსებს პარტნიორი — ერთმანეთს აძლევთ იმას, რაც აკლიათ.`:'ცარიელი უჯრა არცერთს არ აქვს.';
   if(both.length)t+=` ორივეს აკლია: <b>${both.map(d=>`${d} · ${LABELS[d]}`).join(', ')}</b> — საერთო განვითარების ამოცანა.`;
   add('ურთიერთშევსება',0.8,s,t);}
  /* destiny numbers */
  {const da=rootStr(A.dd+A.mm+A.yyyy),db=rootStr(B.dd+B.mm+B.yyyy);
   const g=n=>CONCORD.findIndex(x=>x.includes(n));
   let s,t;if(da===db){s=80;t='ერთი და იგივე ბედისწერის რიცხვი — ერთმანეთს კარგად ესმით, მაგრამ ნაკლოვანებებიც მსგავსია.';}
   else if(g(da)===g(db)){s=95;t=`${da} და ${db} ერთ ჰარმონიულ ჯგუფშია (${CONCORD[g(da)].join('-')}) — ბუნებრივი თანხმობა.`;}
   else{s=55;t=`${da} და ${db} სხვადასხვა ჯგუფიდანაა — განსხვავებული ხედვა, რომელიც შეიძლება ავსებდეს კიდეც.`;}
   add(`ბედისწერის რიცხვები · ${da} / ${db}`,1.0,s,t);}
  const W=items.reduce((s,i)=>s+i.w,0),score=Math.round(items.reduce((s,i)=>s+i.w*i.s,0)/W);
  const col=s=>s>=80?'#7fcf7f':s>=60?'#c8a96e':'#e87f7f';
  const verdict=score>=80?'ძალიან კარგი შეთავსება':score>=65?'კარგი შეთავსება':score>=50?'საშუალო — მუშაობა სჭირდება':'რთული წყვილი';
  /* per-cell */
  const cellRows=DIG.map(d=>{const x=a[d],y=b[d];let v,c='';
    if(!x&&!y){v='ორივეს აკლია';c='pp-dn';}else if(!x||!y){v=`ავსებს ${!x?nb:na}`;c='pp-up';}else if(x===y)v='ემთხვევა';else v=`ჭარბობს ${x>y?na:nb}`;
    return `<tr><td class="l" style="color:${COLORS[d]}">${d} · ${LABELS[d]}</td><td>${x}</td><td>${y}</td><td class="${c}">${v}</td></tr>`;}).join('');
  out.innerHTML=`<div class="pp-card"><div class="pp-sq" style="gap:30px">
      <div class="pp-sqi">${mini(a,1)}<b>${na}</b>${A.dd}/${A.mm}/${A.yyyy}</div>
      <div style="align-self:center;text-align:center"><div class="pp-big" style="color:${col(score)}">${score}%</div><div class="pp-note">${verdict}</div><div class="pp-note" style="font-size:10px">${MODE_NAMES[mode]}</div></div>
      <div class="pp-sqi">${mini(b,1)}<b>${nb}</b>${B.dd}/${B.mm}/${B.yyyy}</div></div></div>
    <div class="pp-card"><div class="pp-h">ასპექტები</div>${items.map(i=>`<div class="pp-asp"><div class="top"><span class="nm">${i.name}</span><span class="sc" style="color:${col(i.s)}">${i.s}%</span></div>
      <div class="pp-bar"><i style="width:${i.s}%;background:${col(i.s)}"></i></div><div class="tx">${i.t}</div></div>`).join('')}</div>
    <div class="pp-card"><div class="pp-h">უჯრა-უჯრა</div><div class="pp-scroll"><table class="pp-tbl"><tr><th style="text-align:left">უჯრა</th><th>${na}</th><th>${nb}</th><th></th></tr>${cellRows}</table></div></div>
    <div class="pp-card pp-note"><div class="pp-h">როგორ ითვლება</div>
      ყველაზე მძიმე წონა აქვს ტემპერამენტს (3-5-7), ხასიათს (1) და ენერგიას (2) — ესენია კლასიკური კვადრატის შეთავსების ძირითადი ნიშნები. შემდეგ — ოჯახის ხაზი, ჩვევები, მიზანდასახულობა, ურთიერთშევსება და ბედისწერის რიცხვები (ჰარმონიული ჯგუფები 1-5-7 · 2-4-8 · 3-6-9). ეს ორიენტირია და არა განაჩენი.</div>`;
}

window._pyPlus={scanYears,exTable,sqKey,enrich,setView,parseDate};
})();
