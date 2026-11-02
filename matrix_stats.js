/* ============================================================
   matrix_stats.js — „სტატისტიკა“ (მეთოდი 1)
   ------------------------------------------------------------
   For every birth date in a span of years (0 … 9999) computes the
   method-1 matrix exactly as calculate() does, and counts every
   aspect: karmic tail, all program zones, chakras (energy·emotion·
   physics combos and the emotion values), the central energies,
   the purposes and every single point.

   Computed on the server (/api/matrix/stats — numcalc.py): the year
   enters the matrix only through R3 = r22(year) and the leap day, so
   the 22 × 2 possible "year types" are tabulated once and the span is
   their weighted sum. This file keeps only the aspect list and drawing.

   Self-injecting: adds a „სტატისტიკა“ button to the method bar.
   Load AFTER matrix_combos.js and matrix_boxes_addon.js.
   Never calls lookup() (that one logs combos to the backend).
   ============================================================ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const R=n=>{while(n>22)n=String(n).split('').reduce((a,d)=>a+ +d,0);return n;};
const DB=()=>(typeof MATRIX_DB!=='undefined')?MATRIX_DB:(window.MATRIX_DB||{});
const EXACT=new Set(['karmic_tail','ch_sahasrara','ch_ajna','ch_vishudha','ch_anahata','ch_manipura','ch_svadhistana','ch_muladhara','ch_total']);
const isLeap=y=>(y%4===0&&(y%100!==0||y%400===0));
const DIM=[31,28,31,30,31,30,31,31,30,31,30,31];
const Y_MIN=0,Y_MAX=9999;

/* ── aspects ── [id, title, keys, zone-for-names, group] ── */
const CHN={sahasrara:'საჰასრარა',ajna:'აჯნა',vishudha:'ვიშუდჰა',anahata:'ანაჰატა',manipura:'მანიპურა',svadhistana:'სვადჰისტანა',muladhara:'მულადჰარა',total:'ჩაკრების ჯამი'};
const A=[];
const add=(id,title,keys,zone,group)=>A.push({id,title,keys,zone,group});
add('karmic_tail','კარმული კუდი',['B3','B2','B1'],'karmic_tail','tail');
[['persona','პერსონა',['L3','L2','L1']],['talent_zone','ტალანტების ზონა',['T3','T2','T1']],['material_karma','მატერიალური კარმა',['R3','R2','R1']],
 ['sex','სექსუალურობა',['Cv','RC1','RC2']],['love','პირადი ურთიერთობების ხაზი',['B1','W1','W2']],['money','ფულის ხაზი',['R1','W3','S6']],
 ['tl','ნიჭები — კაცი წინაპრების ხაზით',['TL3','TL2','TL1']],['tr','ნიჭები — ქალი წინაპრების ხაზით',['TR3','TR2','TR1']],
 ['br','კაცი წინაპრების კარმა',['BR3','BR2','BR1']],['bl','ქალი წინაპრების კარმა',['BL3','BL2','BL1']]]
 .forEach(([id,t,k])=>add(id,t,k,id,'prog'));
for(const c of ['sahasrara','ajna','vishudha','anahata','manipura','svadhistana','muladhara','total'])
  add('ch_'+c,CHN[c]+' — ენერგია·ემოცია·ფიზიკა',['CHE_'+c,'CHS_'+c,'CHP_'+c],'ch_'+c,'chakra');
for(const c of ['sahasrara','ajna','vishudha','anahata','manipura','svadhistana','muladhara','total'])
  add('emo_'+c,CHN[c]+' — ემოცია',['CHS_'+c],null,'chakra');
[['Cv','ცენტრი — კომფორტის ზონა'],['RC1','ცენტრის მე-2 წრე (RC1)'],['RC2','ცენტრის მე-3 წრე (RC2)'],['G1','ფიზიკური სურვილები (G1)'],['G2','სოციალური სურვილები (G2)'],
 ['SOUL','პირადი დანიშნულება'],['SOC','სოციალური დანიშნულება'],['MISSION','სულიერი დანიშნულება (მისია)'],['MALE','მამაკაცის ხაზი (ჯამი)'],['FEM','ქალის ხაზი (ჯამი)']]
 .forEach(([k,t])=>add('c_'+k,t,[k],null,'center'));
[['L3','სავიზიტო ბარათი (L3)'],['L2','ბავშვობის ტრამვები (L2)'],['L1','მშობელი-შვილი (L1)'],['T3','შთაგონება (T3)'],['T2','მენტალური უნარები (T2)'],['T1','ნიჭები, კომუნიკაცია (T1)'],
 ['R3','მატერიალური გაკვეთილი (R3)'],['R2','R2'],['R1','სამუშაო თვისებები (R1)'],['B3','მთავარი გაკვეთილი (B3)'],['B2','B2'],['B1','ურთიერთობებში შესვლა (B1)'],
 ['W1','პარტნიორი (♥ W1)'],['W2','W2'],['W3','სამსახური (₾ W3)'],
 ['TL3','TL3'],['TL2','TL2'],['TL1','TL1'],['TR3','TR3'],['TR2','TR2'],['TR1','TR1'],['BR3','BR3'],['BR2','BR2'],['BR1','BR1'],['BL3','BL3'],['BL2','BL2'],['BL1','BL1']]
 .forEach(([k,t])=>add('p_'+k,t,[k],null,'point'));
const GROUPS=[['tail','კარმული კუდი'],['prog','პროგრამები / ზონები'],['chakra','ჩაკრები'],['center','ცენტრალური ენერგიები'],['point','ყველა წერტილი']];

const TIE='=';
const yearR3=y=>y===0?22:R(y);           /* year 0 → 22 (the Fool, = 0) */
/* year-type summary from the server: {_n, _dom:{aspect:[code,count,ties]}, top:[[code,count]…] of the shown aspect} */
const yt=y=>{const t=S.res&&S.res.types[yearR3(y)+'_'+(isLeap(y)?1:0)];return t?{_n:t.n,_dom:t.dom,top:t.top}:{_n:0,_dom:{},top:[]};};

/* ── names ── */
const ENE=n=>(typeof getE==='function')?getE(+n):{name:'',color:'#666'};
function nameOf(a,code){
  if(code===TIE)return 'თანაბარი — ერთი დომინანტი არ არის';
  if(a.keys.length===1)return ENE(code).name||'';
  const D=DB(),z=D[a.zone]&&D[a.zone].combos||{},rev=code.split('-').reverse().join('-');
  const t=x=>x&&String(x.title||'').trim();
  let s=t(z[code])||(!EXACT.has(a.zone)&&t(z[rev]));
  if(!s&&a.group==='chakra'){const cn=(D.ch_names||{}).combos||{};s=t(cn[code])||t(cn[rev]);}
  if(!s&&a.zone!=='karmic_tail'&&typeof comboName==='function')s=comboName(code.split('-').map(Number));
  return s||'';
}
const colorOf=(a,code)=>{if(code===TIE)return '#3a4a50';if(a.keys.length===1)return ENE(code).color||'#666';
  let h=0;for(const ch of code)h=(h*31+ch.charCodeAt(0))>>>0;return `hsl(${h%360},45%,48%)`;};

/* ── UI ── */
const CSS=`
#stats-panel{display:none;width:100%;max-width:1100px;margin:6px auto 0;position:relative;z-index:1}
#stats-panel .st-card{background:var(--ink-2,#111A2E);border:1px solid var(--rule,rgba(184,137,74,.22));padding:16px 18px;margin-bottom:12px;position:relative}
#stats-panel .st-card::before{content:'';position:absolute;top:0;left:0;width:14px;height:1px;background:var(--brass,#B8894A)}
#stats-panel h3{font-family:'Marcellus SC',serif;font-weight:400;font-size:13px;letter-spacing:.14em;color:var(--brass-lt,#E3BE84);margin:0 0 10px}
#stats-panel .st-note{font-size:11.5px;line-height:1.7;color:var(--enamel-2,#BCC0CA)}
#stats-panel .st-note b{color:var(--enamel,#EDE6D8);font-weight:600}
.st-range{display:flex;gap:18px;align-items:flex-end;flex-wrap:wrap;justify-content:center}
.st-range label{display:block;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.24em;color:var(--dim,#7A8499);text-transform:uppercase;margin-bottom:4px}
.st-range input{width:90px;padding:4px 2px 6px;background:none;border:none;border-bottom:1px solid var(--rule,rgba(184,137,74,.22));color:var(--enamel,#EDE6D8);font-family:'Cinzel',serif;font-size:20px;text-align:center;outline:none}
.st-range input:focus{border-bottom-color:var(--brass,#B8894A)}
.st-pre{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px}
.st-chip{background:none;border:1px solid var(--rule,rgba(184,137,74,.22));color:var(--enamel-2,#BCC0CA);font-family:inherit;font-size:11px;padding:4px 10px;cursor:pointer}
.st-chip:hover{border-color:var(--brass,#B8894A);color:var(--brass-lt,#E3BE84)}
.st-chip.on{border-color:var(--brass,#B8894A);color:var(--ink,#0C1222);background:var(--brass,#B8894A)}
.st-groups{display:flex;gap:0;flex-wrap:wrap;border-bottom:1px solid var(--rule,rgba(184,137,74,.22));margin-bottom:10px}
.st-groups button{background:none;border:none;border-bottom:2px solid transparent;color:var(--dim,#7A8499);font-family:'Marcellus SC',serif;font-size:12px;letter-spacing:.08em;padding:8px 14px;cursor:pointer}
.st-groups button.on{color:var(--brass-lt,#E3BE84);border-bottom-color:var(--brass,#B8894A)}
.st-asp{display:flex;gap:6px;flex-wrap:wrap}
.st-bars{display:grid;gap:3px;margin-top:6px}
.st-bar{display:grid;grid-template-columns:88px 1fr 132px;gap:10px;align-items:center;font-size:12px;cursor:default}
.st-bar .c{font-family:'Cinzel',serif;color:var(--enamel,#EDE6D8);white-space:nowrap}
.st-bar .t{position:relative;height:20px;background:rgba(255,255,255,.03)}
.st-bar .t i{position:absolute;left:0;top:0;bottom:0}
.st-bar .t span{position:absolute;left:8px;top:2px;font-size:11px;color:var(--enamel,#EDE6D8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 12px);text-shadow:0 0 3px #000}
.st-bar .n{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--enamel-2,#BCC0CA);text-align:right;white-space:nowrap}
.st-more{margin-top:8px}
#st-strip{width:100%;height:46px;display:block;border:1px solid var(--rule,rgba(184,137,74,.22));cursor:crosshair}
.st-axis{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--dim,#7A8499);margin-top:3px}
.st-tbl{width:100%;border-collapse:collapse;font-size:12px}
.st-tbl th{font-family:'Marcellus SC',serif;font-weight:400;font-size:11px;letter-spacing:.08em;color:var(--brass-lt,#E3BE84);text-align:left;padding:6px 8px;border-bottom:1px solid var(--rule,rgba(184,137,74,.22))}
.st-tbl td{padding:5px 8px;border-bottom:1px solid var(--rule-2,rgba(184,137,74,.10));color:var(--enamel-2,#BCC0CA);vertical-align:top}
.st-tbl td.k{font-family:'Cinzel',serif;color:var(--enamel,#EDE6D8);white-space:nowrap}
.st-tbl tr.click{cursor:pointer}.st-tbl tr.click:hover td{background:rgba(184,137,74,.06)}
.st-scroll{max-height:420px;overflow:auto}
.st-dot{display:inline-block;width:9px;height:9px;margin-right:6px;vertical-align:middle}
.st-yr{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0 6px}
.st-yr input{width:90px;background:none;border:none;border-bottom:1px solid var(--rule,rgba(184,137,74,.22));color:var(--enamel,#EDE6D8);font-family:'Cinzel',serif;font-size:16px;text-align:center;outline:none}
@media(max-width:640px){.st-bar{grid-template-columns:64px 1fr 96px}.st-groups button{padding:7px 9px;font-size:11px}}`;

let S={y0:0,y1:9999,group:'tail',asp:'karmic_tail',all:false,res:null};
const fmtN=n=>n.toLocaleString('en-US').replace(/,/g,' ');
const pct=(a,b)=>(b?100*a/b:0).toFixed(2)+'%';

function inject(){
  const bar=document.querySelector('.method-bar');if(!bar||$('btn-ms'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const b=document.createElement('button');b.className='method-btn';b.id='btn-ms';b.textContent='სტატისტიკა';
  b.setAttribute('onclick','setMethod(5)');bar.appendChild(b);
  const p=document.createElement('div');p.id='stats-panel';
  p.innerHTML=`
   <div class="st-card">
     <h3>სტატისტიკა · მეთოდი 1</h3>
     <div class="st-note" style="margin-bottom:12px">ყველა დაბადების თარიღი არჩეულ წლებში — ყოველი თარიღის მატრიცა ითვლება პირველი მეთოდით.
       ჩანს, რომელი <b>კარმული კუდი</b>, <b>პროგრამა</b>, <b>ჩაკრის კომბინაცია</b> და <b>ცენტრალური ენერგია</b> რამდენად ხშირია, და რომელი იყო <b>დომინანტი</b> ყოველ წელს.</div>
     <div class="st-range">
       <div><label>წლიდან</label><input id="st-y0" type="number" min="${Y_MIN}" max="${Y_MAX}" value="0"></div>
       <div><label>წლამდე</label><input id="st-y1" type="number" min="${Y_MIN}" max="${Y_MAX}" value="9999"></div>
       <div><button class="calc-btn" id="st-go">⟡ დათვლა</button></div>
     </div>
     <div class="st-pre" id="st-pre">
       <button class="st-chip" data-r="0,9999">0 – 9999</button><button class="st-chip" data-r="1900,2025">1900 – 2025</button>
       <button class="st-chip" data-r="1950,2010">1950 – 2010</button><button class="st-chip" data-r="2000,2099">XXI საუკუნე</button>
       <button class="st-chip" data-r="1000,1999">1000 – 1999</button><button class="st-chip" data-r="${new Date().getFullYear()},${new Date().getFullYear()}">მიმდინარე წელი</button>
     </div>
   </div>
   <div id="st-out"></div>`;
  const ml=$('main-layout');(ml&&ml.parentNode?ml.parentNode:document.body).insertBefore(p,ml||null);
  p.querySelectorAll('#st-pre .st-chip').forEach(c=>c.onclick=()=>{const [a,z]=c.dataset.r.split(',');$('st-y0').value=a;$('st-y1').value=z;run();});
  $('st-go').onclick=run;
  ['st-y0','st-y1'].forEach(id=>$(id).addEventListener('keydown',e=>{if(e.key==='Enter')run();}));
}

/* ── the span — counted on the server ── */
const ASPECTS=A.map(a=>({id:a.id,keys:a.keys,exact:EXACT.has(a.zone)}));
async function fetchStats(y0,y1,sel){
  const h={'Content-Type':'application/json'},tok=window.MAGNUS&&window.MAGNUS.token;if(tok)h.Authorization='Bearer '+tok;
  const r=await fetch('https://astrology-production-b165.up.railway.app/api/matrix/stats',{method:'POST',headers:h,body:JSON.stringify({y0,y1,sel,aspects:ASPECTS})});
  let d=null;try{d=await r.json();}catch(e){}
  if(r.status===402&&window.MAGNUS){window.MAGNUS.toast((d&&d.error)||'Pro',5000);if(!window.MAGNUS.user)window.MAGNUS.open('login');}
  if(!r.ok)throw new Error((d&&d.error)||('სერვერის შეცდომა '+r.status));
  return d;
}
function sorted(o){return Object.entries(o).sort((p,q)=>q[1]-p[1]);}
let seq=0;
async function load(sel){
  const my=++seq,out=$('st-out');
  if(out&&!S.res)out.innerHTML='<div class="st-card st-note">⏳ ვითვლი…</div>';
  const t0=performance.now();
  let d;try{d=await fetchStats(S.y0,S.y1,sel);}catch(e){if(my===seq&&out)out.innerHTML=`<div class="st-card st-note" style="color:#e88a8a">${e.message}</div>`;return false;}
  if(my!==seq)return false;
  S.res={y0:d.y0,y1:d.y1,years:d.years,days:d.days,sel:d.sel,cnt:d.cnt,domYears:d.domYears,summary:d.summary,free:d.free,types:d.types};
  S.ms=performance.now()-t0;return true;
}
async function run(){
  const cl=v=>Math.max(Y_MIN,Math.min(Y_MAX,Math.round(+v)));
  let y0=cl($('st-y0').value||0),y1=cl($('st-y1').value||9999);if(y1<y0)[y0,y1]=[y1,y0];
  $('st-y0').value=y0;$('st-y1').value=y1;
  S.y0=y0;S.y1=y1;S.all=false;S.res=null;
  if(await load(S.asp))render();
}
/* another aspect: its distribution comes from the server */
async function show(id){S.asp=id;S.all=false;if(S.res&&S.res.sel!==id){if(!await load(id))return;}render();}

function render(){
  const r=S.res,out=$('st-out');if(!r){out.innerHTML='';return;}
  const a=A.find(x=>x.id===S.asp)||A[0];
  const list=r.cnt,shown=S.all?list:list.slice(0,a.keys.length===1?22:30),max=list.length?list[0][1]:1;
  const dl=r.domYears;
  out.innerHTML=`
  <div class="st-card">
    <div class="st-note"><b>${r.y0} – ${r.y1}</b> · ${fmtN(r.years)} წელი · <b>${fmtN(r.days)}</b> დაბადების თარიღი · დათვლა ${Math.max(1,Math.round(S.ms))} მწმ</div>
    <div class="st-groups" style="margin-top:10px">${GROUPS.map(g=>`<button data-g="${g[0]}" class="${g[0]===S.group?'on':''}">${g[1]}</button>`).join('')}</div>
    <div class="st-asp">${A.filter(x=>x.group===S.group).map(x=>`<button class="st-chip ${x.id===a.id?'on':''}" data-a="${x.id}">${x.title}</button>`).join('')}</div>
  </div>
  <div class="st-card">
    <h3>${a.title} — განაწილება</h3>
    <div class="st-note">${a.keys.length===1?'ენერგია (1–22)':'კოდი '+(a.group==='chakra'?'ენერგია·ემოცია·ფიზიკა':a.keys.join('·'))}${r.free[a.id]?' · <b>წელზე არ არის დამოკიდებული</b> (მხოლოდ დღე და თვე) — ყველა წელს ერთნაირია':''} · სულ ${fmtN(list.length)} სხვადასხვა ${a.keys.length===1?'ენერგია':'კომბინაცია'}${a.zone&&!EXACT.has(a.zone)?' · შებრუნებული კოდი (8-8-18 = 18-8-8) ერთად ითვლება':''}</div>
    <div class="st-bars">${shown.map(([c,n])=>{const nm=nameOf(a,c);
      return `<div class="st-bar" title="${nm.replace(/"/g,'&quot;')}"><span class="c">${c}</span><span class="t"><i style="width:${(100*n/max).toFixed(1)}%;background:${colorOf(a,c)}"></i><span>${nm}</span></span><span class="n">${pct(n,r.days)} · ${fmtN(n)}</span></div>`;}).join('')}</div>
    ${list.length>shown.length?`<button class="st-chip st-more" id="st-all">ყველას ჩვენება (${list.length})</button>`:''}
  </div>
  <div class="st-card">
    <h3>${a.title} — დომინანტი წლების მიხედვით</h3>
    <div class="st-note">ყოველ წელს იმ წელს დაბადებულებში ყველაზე ხშირი ${a.keys.length===1?'ენერგია':'კომბინაცია'}. მიიტანე/დააჭირე ზოლს — წლის დეტალები.</div>
    <canvas id="st-strip" height="46"></canvas><div class="st-axis"><span>${r.y0}</span><span>${Math.round((r.y0+r.y1)/2)}</span><span>${r.y1}</span></div>
    <div class="st-yr"><span class="st-note">წელი:</span><input id="st-year" type="number" min="${r.y0}" max="${r.y1}" value="${Math.min(r.y1,Math.max(r.y0,new Date().getFullYear()))}"><span id="st-year-out" class="st-note"></span></div>
    <div class="st-scroll"><table class="st-tbl"><tr><th>კოდი</th><th>სახელი</th><th>დომინანტი წლები</th><th>წილი</th></tr>
      ${dl.map(([c,n])=>`<tr><td class="k"><span class="st-dot" style="background:${colorOf(a,c)}"></span>${c===TIE?'თანაბარი':c}</td><td>${nameOf(a,c)}</td><td>${fmtN(n)}</td><td>${pct(n,r.years)}</td></tr>`).join('')}</table></div>
    ${r.years<=400?`<h3 style="margin-top:14px">წლები</h3><div class="st-scroll"><table class="st-tbl"><tr><th>წელი</th><th>დომინანტი</th><th>სახელი</th><th>წილი წელს</th></tr>
      ${Array.from({length:r.years},(_,i)=>{const y=r.y0+i,t=yt(y),[c,n,k]=t._dom[a.id];return `<tr><td class="k">${y}</td><td class="k"><span class="st-dot" style="background:${colorOf(a,c)}"></span>${c===TIE?'თანაბარი ('+k+')':c}</td><td>${nameOf(a,c)}</td><td>${pct(n,t._n)}</td></tr>`;}).join('')}</table></div>`
     :`<div class="st-note" style="margin-top:8px">წლების სრული სია ჩანს 400 წლამდე დიაპაზონზე — კონკრეტული წელი ზემოთ ჩაწერე.</div>`}
  </div>
  <div class="st-card">
    <h3>ყველაფრის მიმოხილვა — ყველაზე ხშირი თითო ასპექტში</h3>
    <div class="st-scroll" style="max-height:560px"><table class="st-tbl"><tr><th>ასპექტი</th><th>ყველაზე ხშირი</th><th>სახელი</th><th>წილი</th><th>ყველაზე იშვიათი</th></tr>
      ${A.map(x=>{const sm=r.summary[x.id];if(!sm)return '';const [c,n]=sm.top,[c2,n2]=sm.bot,ties=sm.ties;
        return `<tr class="click" data-a="${x.id}"><td>${x.title}</td><td class="k"><span class="st-dot" style="background:${colorOf(x,c)}"></span>${c}</td><td>${ties>1?`<i style="opacity:.75">თანაბარი — ${ties} კოდი</i>`:nameOf(x,c)}</td><td>${pct(n,r.days)}</td><td class="k" style="opacity:.7">${c2} · ${pct(n2,r.days)}</td></tr>`;}).join('')}</table></div>
  </div>`;
  out.querySelectorAll('.st-groups button').forEach(b=>b.onclick=()=>{S.group=b.dataset.g;show(A.find(x=>x.group===S.group).id);});
  out.querySelectorAll('.st-asp .st-chip').forEach(b=>b.onclick=()=>show(b.dataset.a));
  out.querySelectorAll('tr.click').forEach(tr=>tr.onclick=()=>{const x=A.find(z=>z.id===tr.dataset.a);S.group=x.group;show(x.id);window.scrollTo({top:$('stats-panel').offsetTop,behavior:'smooth'});});
  const all=$('st-all');if(all)all.onclick=()=>{S.all=true;render();};
  drawStrip(a);
  const yi=$('st-year');const showY=()=>{const y=Math.max(r.y0,Math.min(r.y1,Math.round(+yi.value)));const t=yt(y),top=t.top;
    $('st-year-out').innerHTML=`${y} (${isLeap(y)?'ნაკიანი, ':''}R3 = ${yearR3(y)}): `+top.map(([c,n])=>`<b>${c}</b>${nameOf(a,c)?' '+nameOf(a,c):''} ${pct(n,t._n)}`).join(' · ');};
  yi.oninput=showY;showY();
}

function drawStrip(a){
  const cv=$('st-strip'),r=S.res;if(!cv)return;
  const W=cv.clientWidth||800,H=46,dpr=window.devicePixelRatio||1;cv.width=W*dpr;cv.height=H*dpr;
  const g=cv.getContext('2d');g.scale(dpr,dpr);g.fillStyle='#0C1222';g.fillRect(0,0,W,H);
  const n=r.years;
  for(let x=0;x<W;x++){
    const ya=r.y0+Math.floor(x*n/W),yb=Math.max(ya,r.y0+Math.floor((x+1)*n/W)-1);
    /* most frequent dominant inside this pixel's years */
    const c={};let best=null,bc=-1;for(let y=ya;y<=yb;y+=Math.max(1,Math.floor((yb-ya+1)/40))){const d=yt(y)._dom[a.id][0];c[d]=(c[d]||0)+1;if(c[d]>bc){bc=c[d];best=d;}}
    g.fillStyle=colorOf(a,best);g.fillRect(x,0,1,H);
  }
  const yi=$('st-year');
  const pick=e=>{const b=cv.getBoundingClientRect(),y=r.y0+Math.floor((e.clientX-b.left)/b.width*n);if(yi){yi.value=Math.min(r.y1,y);yi.oninput();}};
  cv.onmousemove=pick;cv.onclick=pick;
}

/* ── method switch ── */
function hook(){
  if(typeof window.setMethod!=='function'||window.setMethod._st)return;
  const o=window.setMethod;
  const w=function(m){
    const r=o.apply(this,arguments);
    const on=m===5,p=$('stats-panel'),ml=$('main-layout'),b=$('btn-ms');
    if(p)p.style.display=on?'block':'none';
    if(ml)ml.style.display=on?'none':'';
    if(b)b.classList.toggle('active',on);
    if(on){document.querySelectorAll('.method-bar .method-btn').forEach(x=>{if(x!==b)x.classList.remove('active');});
      const pp=$('pyth-panel');if(pp)pp.style.display='none';
      if(!S.res)run();}
    return r;
  };
  w._st=true;window.setMethod=w;
}
function init(){inject();hook();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window._mxStats={A,run,show};
})();
