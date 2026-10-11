/* ============================================================
   matrix_stats.js — „სტატისტიკა“ (მეთოდი 1)
   ------------------------------------------------------------
   For every birth date in a span of years (0 … 9999) computes the
   method-1 matrix exactly as calculate() does, and counts every
   aspect: karmic tail, all program zones, chakras (energy·emotion·
   physics combos and the emotion values), the central energies,
   the purposes and every single point.

   The year enters the matrix only through R3 = r22(year) and the
   leap day, so the 22 × 2 possible "year types" are computed once
   (365/366 dates each) and the span is the weighted sum of them —
   0 … 9999 is instant.

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

/* ── method-1 matrix of one date (mirrors calculate() with CUR===1) ── */
function m1(dd,mm,R3){
  const L3=R(dd),T3=R(mm);
  const B3=R(L3+T3+R3),Cv=R(L3+T3+R3+B3);
  const TL3=R(L3+T3),TR3=R(T3+R3),BR3=R(R3+B3),BL3=R(B3+L3);
  const RC1=R(TL3+TR3+BR3+BL3),RC2=R(RC1+Cv);
  const B1=R(Cv+B3),B2=R(B1+B3),R1=R(Cv+R3),R2=R(R1+R3),L1=R(Cv+L3),L2=R(L1+L3),T1=R(Cv+T3),T2=R(T1+T3),G1=R(L1+Cv),G2=R(T1+Cv);
  const dCv=RC1;
  const TL1=R(TL3+dCv),TL2=R(TL1+TL3),TR1=R(TR3+dCv),TR2=R(TR1+TR3),BR1=R(BR3+dCv),BR2=R(BR1+BR3),BL1=R(BL3+dCv),BL2=R(BL1+BL3);
  const W2=R(B1+R1),W1=R(B1+W2),W3=R(R1+W2);
  const v={L3,T3,R3,B3,Cv,B1,B2,R1,R2,L1,L2,T1,T2,G1,G2,TL3,TR3,BR3,BL3,RC1,RC2,TL1,TL2,TR1,TR2,BR1,BR2,BL1,BL2,W1,W2,W3};
  /* chakra rows exactly as renderChakra()/chakraRows() for method 1 */
  const CH=[['sahasrara',T3,L3],['ajna',T2,L2],['vishudha',T1,L1],['anahata',G2,G1],['manipura',Cv,Cv],['svadhistana',B1,R1],['muladhara',B3,R3]];
  let se=0,sp=0,ss=0;
  for(const [k,e,p] of CH){const s=R(e+p);v['CHE_'+k]=e;v['CHP_'+k]=p;v['CHS_'+k]=s;se+=e;sp+=p;ss+=s;}
  v.CHE_total=R(se);v.CHP_total=R(sp);v.CHS_total=R(ss);
  v.S6=v.CHS_svadhistana;
  /* purposes (extra panels) */
  v.MALE=R(TL3+BR3);v.FEM=R(TR3+BL3);
  const sT=R(T3+B3),sB=R(R3+L3);v.SOUL=R(sT+sB);
  const oT=R(TL3+BR3),oB=R(TR3+BL3);v.SOC=R(oT+oB);v.MISSION=R(v.SOUL+v.SOC);
  return v;
}

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

/* code of an aspect for one matrix (reverse-equivalent zones merged) */
function codeOf(a,v){
  const n=a.keys.map(k=>v[k]);
  if(n.length===1)return String(n[0]);
  const f=n.join('-');if(EXACT.has(a.zone))return f;
  const r=[...n].reverse().join('-');return f<=r?f:r;
}

/* ── year-type tables: TAB[R3][leap] = per aspect {code:count} ── */
const TAB={};
function table(R3,leap){
  const k=R3+'_'+leap;if(TAB[k])return TAB[k];
  const t={};for(const a of A)t[a.id]=Object.create(null);
  for(let m=1;m<=12;m++){const dm=m===2&&leap?29:DIM[m-1];
    for(let d=1;d<=dm;d++){const v=m1(d,m,R3);for(const a of A){const c=codeOf(a,v),o=t[a.id];o[c]=(o[c]||0)+1;}}}
  /* dominant code of this year type, per aspect */
  t._dom={};for(const a of A){let best=null,bc=-1,tie=0;for(const c in t[a.id]){const n=t[a.id][c];if(n>bc){bc=n;best=c;tie=1;}else if(n===bc)tie++;}
    t._dom[a.id]=tie>1?[TIE,bc,tie]:[best,bc,1];}   /* several codes share the maximum → no single dominant */
  t._n=leap?366:365;
  return TAB[k]=t;
}
const TIE='=';
const yearR3=y=>y===0?22:R(y);           /* year 0 → 22 (the Fool, = 0) */
const yt=y=>table(yearR3(y),isLeap(y)?1:0);

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
#stats-panel .st-card{background:var(--ink-2,#101E24);border:1px solid var(--rule,rgba(184,137,74,.22));padding:16px 18px;margin-bottom:12px;position:relative}
#stats-panel .st-card::before{content:'';position:absolute;top:0;left:0;width:14px;height:1px;background:var(--brass,#B8894A)}
#stats-panel h3{font-family:'Marcellus SC',serif;font-weight:400;font-size:13px;letter-spacing:.14em;color:var(--brass-lt,#E3BE84);margin:0 0 10px}
#stats-panel .st-note{font-size:11.5px;line-height:1.7;color:var(--enamel-2,#B9BFBC)}
#stats-panel .st-note b{color:var(--enamel,#EDE6D8);font-weight:600}
.st-range{display:flex;gap:18px;align-items:flex-end;flex-wrap:wrap;justify-content:center}
.st-range label{display:block;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.24em;color:var(--dim,#6E8087);text-transform:uppercase;margin-bottom:4px}
.st-range input{width:90px;padding:4px 2px 6px;background:none;border:none;border-bottom:1px solid var(--rule,rgba(184,137,74,.22));color:var(--enamel,#EDE6D8);font-family:'Cinzel',serif;font-size:20px;text-align:center;outline:none}
.st-range input:focus{border-bottom-color:var(--brass,#B8894A)}
.st-pre{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:10px}
.st-chip{background:none;border:1px solid var(--rule,rgba(184,137,74,.22));color:var(--enamel-2,#B9BFBC);font-family:inherit;font-size:11px;padding:4px 10px;cursor:pointer}
.st-chip:hover{border-color:var(--brass,#B8894A);color:var(--brass-lt,#E3BE84)}
.st-chip.on{border-color:var(--brass,#B8894A);color:var(--ink,#0B1418);background:var(--brass,#B8894A)}
.st-groups{display:flex;gap:0;flex-wrap:wrap;border-bottom:1px solid var(--rule,rgba(184,137,74,.22));margin-bottom:10px}
.st-groups button{background:none;border:none;border-bottom:2px solid transparent;color:var(--dim,#6E8087);font-family:'Marcellus SC',serif;font-size:12px;letter-spacing:.08em;padding:8px 14px;cursor:pointer}
.st-groups button.on{color:var(--brass-lt,#E3BE84);border-bottom-color:var(--brass,#B8894A)}
.st-asp{display:flex;gap:6px;flex-wrap:wrap}
.st-bars{display:grid;gap:3px;margin-top:6px}
.st-bar{display:grid;grid-template-columns:88px 1fr 132px;gap:10px;align-items:center;font-size:12px;cursor:default}
.st-bar .c{font-family:'Cinzel',serif;color:var(--enamel,#EDE6D8);white-space:nowrap}
.st-bar .t{position:relative;height:20px;background:rgba(255,255,255,.03)}
.st-bar .t i{position:absolute;left:0;top:0;bottom:0}
.st-bar .t span{position:absolute;left:8px;top:2px;font-size:11px;color:var(--enamel,#EDE6D8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 12px);text-shadow:0 0 3px #000}
.st-bar .n{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--enamel-2,#B9BFBC);text-align:right;white-space:nowrap}
.st-more{margin-top:8px}
#st-strip{width:100%;height:46px;display:block;border:1px solid var(--rule,rgba(184,137,74,.22));cursor:crosshair}
.st-axis{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--dim,#6E8087);margin-top:3px}
.st-tbl{width:100%;border-collapse:collapse;font-size:12px}
.st-tbl th{font-family:'Marcellus SC',serif;font-weight:400;font-size:11px;letter-spacing:.08em;color:var(--brass-lt,#E3BE84);text-align:left;padding:6px 8px;border-bottom:1px solid var(--rule,rgba(184,137,74,.22))}
.st-tbl td{padding:5px 8px;border-bottom:1px solid var(--rule-2,rgba(184,137,74,.10));color:var(--enamel-2,#B9BFBC);vertical-align:top}
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

/* ── aggregate the span ── */
function aggregate(y0,y1){
  const cnt={},yt0={},domYears={};       /* per aspect: code→dates, code→years dominant */
  for(const a of A){cnt[a.id]=Object.create(null);domYears[a.id]=Object.create(null);}
  /* how many years of each type */
  const types=Object.create(null);let days=0;
  for(let y=y0;y<=y1;y++){const k=yearR3(y)+'_'+(isLeap(y)?1:0);types[k]=(types[k]||0)+1;}
  for(const k in types){const [r3,l]=k.split('_').map(Number),t=table(r3,l),w=types[k];days+=t._n*w;
    for(const a of A){const o=cnt[a.id],s=t[a.id];for(const c in s)o[c]=(o[c]||0)+s[c]*w;
      const d=t._dom[a.id][0];domYears[a.id][d]=(domYears[a.id][d]||0)+w;}}
  return{y0,y1,years:y1-y0+1,days,cnt,domYears};
}
function yearFree(a){const t1=table(1,0),t2=table(13,0);return JSON.stringify(sorted(t1[a.id]))===JSON.stringify(sorted(t2[a.id]));}
function sorted(o){return Object.entries(o).sort((p,q)=>q[1]-p[1]);}

function run(){
  const cl=v=>Math.max(Y_MIN,Math.min(Y_MAX,Math.round(+v)));
  let y0=cl($('st-y0').value||0),y1=cl($('st-y1').value||9999);if(y1<y0)[y0,y1]=[y1,y0];
  $('st-y0').value=y0;$('st-y1').value=y1;
  S.y0=y0;S.y1=y1;S.all=false;
  const t0=performance.now();S.res=aggregate(y0,y1);S.ms=performance.now()-t0;
  render();
}

function render(){
  const r=S.res,out=$('st-out');if(!r){out.innerHTML='';return;}
  const a=A.find(x=>x.id===S.asp)||A[0];
  const list=sorted(r.cnt[a.id]),shown=S.all?list:list.slice(0,a.keys.length===1?22:30),max=list.length?list[0][1]:1;
  const dl=sorted(r.domYears[a.id]);
  out.innerHTML=`
  <div class="st-card">
    <div class="st-note"><b>${r.y0} – ${r.y1}</b> · ${fmtN(r.years)} წელი · <b>${fmtN(r.days)}</b> დაბადების თარიღი · დათვლა ${Math.max(1,Math.round(S.ms))} მწმ</div>
    <div class="st-groups" style="margin-top:10px">${GROUPS.map(g=>`<button data-g="${g[0]}" class="${g[0]===S.group?'on':''}">${g[1]}</button>`).join('')}</div>
    <div class="st-asp">${A.filter(x=>x.group===S.group).map(x=>`<button class="st-chip ${x.id===a.id?'on':''}" data-a="${x.id}">${x.title}</button>`).join('')}</div>
  </div>
  <div class="st-card">
    <h3>${a.title} — განაწილება</h3>
    <div class="st-note">${a.keys.length===1?'ენერგია (1–22)':'კოდი '+(a.group==='chakra'?'ენერგია·ემოცია·ფიზიკა':a.keys.join('·'))}${yearFree(a)?' · <b>წელზე არ არის დამოკიდებული</b> (მხოლოდ დღე და თვე) — ყველა წელს ერთნაირია':''} · სულ ${fmtN(list.length)} სხვადასხვა ${a.keys.length===1?'ენერგია':'კომბინაცია'}${a.zone&&!EXACT.has(a.zone)?' · შებრუნებული კოდი (8-8-18 = 18-8-8) ერთად ითვლება':''}</div>
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
      ${A.map(x=>{const l=sorted(r.cnt[x.id]);if(!l.length)return '';const [c,n]=l[0],[c2,n2]=l[l.length-1],ties=l.filter(e=>e[1]===n).length;
        return `<tr class="click" data-a="${x.id}"><td>${x.title}</td><td class="k"><span class="st-dot" style="background:${colorOf(x,c)}"></span>${c}</td><td>${ties>1?`<i style="opacity:.75">თანაბარი — ${ties} კოდი</i>`:nameOf(x,c)}</td><td>${pct(n,r.days)}</td><td class="k" style="opacity:.7">${c2} · ${pct(n2,r.days)}</td></tr>`;}).join('')}</table></div>
  </div>`;
  out.querySelectorAll('.st-groups button').forEach(b=>b.onclick=()=>{S.group=b.dataset.g;S.asp=A.find(x=>x.group===S.group).id;S.all=false;render();});
  out.querySelectorAll('.st-asp .st-chip').forEach(b=>b.onclick=()=>{S.asp=b.dataset.a;S.all=false;render();});
  out.querySelectorAll('tr.click').forEach(tr=>tr.onclick=()=>{const x=A.find(z=>z.id===tr.dataset.a);S.group=x.group;S.asp=x.id;S.all=false;render();window.scrollTo({top:$('stats-panel').offsetTop,behavior:'smooth'});});
  const all=$('st-all');if(all)all.onclick=()=>{S.all=true;render();};
  drawStrip(a);
  const yi=$('st-year');const showY=()=>{const y=Math.max(r.y0,Math.min(r.y1,Math.round(+yi.value)));const t=yt(y),top=sorted(t[a.id]).slice(0,5);
    $('st-year-out').innerHTML=`${y} (${isLeap(y)?'ნაკიანი, ':''}R3 = ${yearR3(y)}): `+top.map(([c,n])=>`<b>${c}</b>${nameOf(a,c)?' '+nameOf(a,c):''} ${pct(n,t._n)}`).join(' · ');};
  yi.oninput=showY;showY();
}

function drawStrip(a){
  const cv=$('st-strip'),r=S.res;if(!cv)return;
  const W=cv.clientWidth||800,H=46,dpr=window.devicePixelRatio||1;cv.width=W*dpr;cv.height=H*dpr;
  const g=cv.getContext('2d');g.scale(dpr,dpr);g.fillStyle='#0B1418';g.fillRect(0,0,W,H);
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
window._mxStats={m1,table,aggregate,A};
})();
