/* matrix_combo_lesson.js — shared engine for the matrix combination lessons.
   The page sets window.CL = {zones:[{set,db,title,keys,pos:[..3 labels],color,about}], calc?:fn} before loading this file.
   For every zone it lists every combination that really occurs (MX_SETS), with the same title and article the matrix page shows
   (matrix_combos.js + admin articles from articles.js, auto text from matrix_autotext.js as the last resort). */
(function(){
'use strict';
const $=id=>document.getElementById(id),A=window.MX_ARCANA||[],CL=window.CL||{zones:[]};
const r22=n=>{while(n>22)n=String(n).split('').reduce((a,d)=>a+ +d,0);return n;};
const EXACT=new Set(['karmic_tail','cp_karmic_tail']);
const NAMEZ=['persona','talent_zone','tl','tr','br','bl','material_karma','love','money'];
function calc(d,m,y){const v={};
  v.L3=r22(d);v.T3=r22(m);v.R3=r22(y);v.B3=r22(v.L3+v.T3+v.R3);v.Cv=r22(v.L3+v.T3+v.R3+v.B3);
  v.TL3=r22(v.L3+v.T3);v.TR3=r22(v.T3+v.R3);v.BR3=r22(v.R3+v.B3);v.BL3=r22(v.B3+v.L3);
  v.RC1=r22(v.TL3+v.TR3+v.BR3+v.BL3);v.RC2=r22(v.RC1+v.Cv);
  for(const k of ['L','T','R','B']){v[k+'1']=r22(v.Cv+v[k+'3']);v[k+'2']=r22(v[k+'1']+v[k+'3']);}
  for(const k of ['TL','TR','BR','BL']){v[k+'1']=r22(v[k+'3']+v.RC1);v[k+'2']=r22(v[k+'1']+v[k+'3']);}
  v.G1=r22(v.L1+v.Cv);v.G2=r22(v.T1+v.Cv);v.W2=r22(v.B1+v.R1);v.W1=r22(v.B1+v.W2);v.W3=r22(v.R1+v.W2);return v;}
const empty=t=>!String(t||'').replace(/<[^>]+>|&nbsp;|\s/g,'');
function entry(db,code){const D=window.MATRIX_DB||{},c=(D[db]||{}).combos||{};const e=c[code];if(e)return e;
  if(!EXACT.has(db)){const r=c[code.split('-').reverse().join('-')];if(r)return r;}return null;}
function shared(code){const c=((window.MATRIX_DB||{}).ch_names||{}).combos||{};return c[code]||c[code.split('-').reverse().join('-')]||null;}
function anyName(code){const D=window.MATRIX_DB||{},r=code.split('-').reverse().join('-');
  for(const n in D){if(n==='ch_names')continue;const c=(D[n]||{}).combos||{},x=c[code]||c[r];if(x&&String(x.title||'').trim()&&!x._c)return x.title;}return '';}
function title(z,code){const e=entry(z.db,code);if(e&&String(e.title||'').trim())return e.title;
  if(z.chakra){const sh=shared(code);if(sh&&String(sh.title||'').trim())return sh.title;}
  const D=window.MATRIX_DB||{},r=code.split('-').reverse().join('-');
  for(const n of NAMEZ){const c=(D[n]||{}).combos||{},x=c[code]||c[r];if(x&&String(x.title||'').trim())return x.title;}return z.chakra?anyName(code):'';}
function article(z,code){const e=entry(z.db,code);if(e&&!empty(e.text))return e.text;
  if(z.chakra){const sh=shared(code);if(sh&&!empty(sh.text))return sh.text;}
  try{return typeof window.autoCombo==='function'?(window.autoCombo(z.db,code.split('-').map(Number))||''):'';}catch(_){return '';}}
let zi=0,cur=null,flt=0,q='',MY={};
function zone(){return CL.zones[zi];}
function codes(){return Object.keys((window.MX_SETS||{})[zone().set]||{});}
function freq(c){return ((window.MX_SETS||{})[zone().set]||{})[c];}
function tabs(){$('cl-tabs').innerHTML=CL.zones.length>1?CL.zones.map((z,i)=>`<button type="button" data-i="${i}" class="${i===zi?'on':''}" style="--c:${z.color}">${z.title}</button>`).join(''):'';}
function about(){const z=zone();$('cl-about').innerHTML=`<h2 style="color:${z.color}">${z.title}</h2><p>${z.about}</p>
  <div class="cl-pos">${z.keys.map((k,i)=>`<div><b style="border-color:${z.color}">${k}</b><span>${z.pos[i]}</span></div>`).join('')}</div>
  <p class="cl-n">ამ ზონაში სულ <b>${codes().length}</b> კომბინაცია გვხვდება (ყველა დღე 1900–2029, მეთოდი 1).${MY[zi]?` შენი: <a href="#" id="cl-my">${MY[zi]}</a>`:''}</p>`;
  const m=$('cl-my');if(m)m.onclick=e=>{e.preventDefault();flt=0;q='';$('cl-q').value='';show(MY[zi],true);};}
function filt(){const firsts=[...new Set(codes().map(c=>+c.split('-')[0]))].sort((a,b)=>a-b);
  $('cl-f').innerHTML=`<button type="button" data-f="0" class="${flt===0?'on':''}">ყველა</button>`+firsts.map(n=>`<button type="button" data-f="${n}" class="${flt===n?'on':''}">${n}</button>`).join('');}
function grid(){const z=zone(),qq=q.trim().toLowerCase();
  const L=codes().filter(c=>(!flt||+c.split('-')[0]===flt)&&(!qq||c.includes(qq)||title(z,c).toLowerCase().includes(qq)));
  $('cl-grid').innerHTML=L.map(c=>`<button type="button" class="cl-c${c===cur?' on':''}${c===MY[zi]?' my':''}" data-c="${c}"><div class="no">${c.split('-').map((n,i)=>`<i title="${z.keys[i]}">${n}</i>`).join('')}</div><div class="nm">${title(z,c)||'—'}</div><div class="fr">${freq(c)}%</div></button>`).join('')||'<p class="cl-none">ვერაფერი მოიძებნა</p>';}
function show(code,scroll){const z=zone();if(!code||freq(code)==null)return;cur=code;const ns=code.split('-').map(Number),t=article(z,code),pt=window.CL_POSTEXT&&window.CL_POSTEXT(z,ns);
  $('cl-det').innerHTML=`<div class="hd"><div class="code" style="color:${z.color}">${code}</div><div><h2>${title(z,code)||code}</h2><div class="sub2">${z.title} · ${freq(code)}% ადამიანებს${code===MY[zi]?' · <b style="color:#FFD36A">შენი კომბინაცია</b>':''}</div></div></div>
   <div class="cl-three">${ns.map((n,i)=>{const a=A[n-1]||{};return `<a href="course_matrix4.html#${n}" style="border-color:${z.color}55"><div class="t"><span style="background:${z.color}">${n}</span>${z.keys[i]} · ${z.pos[i]}</div><div class="n">${a.t||''}</div><div class="k">${a.k||''}</div>${pt&&pt[i]?`<div class="r">${pt[i]}</div>`:''}</a>`;}).join('')}</div>
   ${window.CL_EXTRA?(window.CL_EXTRA(z,ns)||''):''}
   ${t?`<div class="cl-art"><h3>${title(z,code)||'აღწერა'}</h3><div>${t}</div></div>`:''}
   <div class="nav"><button type="button" id="cl-pv">←</button><button type="button" id="cl-nx">→</button></div>`;
  const L=codes(),i=L.indexOf(code);$('cl-pv').onclick=()=>show(L[(i+L.length-1)%L.length],true);$('cl-nx').onclick=()=>show(L[(i+1)%L.length],true);
  grid();if(scroll)$('cl-det').scrollIntoView({behavior:'smooth',block:'start'});}
function all(){tabs();about();filt();grid();show(cur&&freq(cur)!=null?cur:(MY[zi]||codes()[0]),false);}
$('cl-tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;zi=+b.dataset.i;flt=0;cur=null;all();});
$('cl-f').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;flt=+b.dataset.f;filt();grid();});
$('cl-q').addEventListener('input',e=>{q=e.target.value;grid();});
$('cl-grid').addEventListener('click',e=>{const b=e.target.closest('.cl-c');if(b)show(b.dataset.c,true);});
function upd(){const d=+$('dd').value,m=+$('mm').value,y=+$('yy').value;
  const dim=[31,(y%4===0&&(y%100!==0||y%400===0))?29:28,31,30,31,30,31,31,30,31,30,31];
  if(!(m>=1&&m<=12&&d>=1&&d<=dim[m-1]&&y>=1000&&y<=2100)){MY={};all();return;}
  const v=calc(d,m,y);const R={sahasrara:['T3','L3'],ajna:['T2','L2'],vishudha:['T1','L1'],anahata:['G2','G1'],manipura:['Cv','Cv'],svadhistana:['B1','R1'],muladhara:['B3','R3']};
  let se=0,sp=0,ss=0;for(const k in R){const E=v[R[k][0]],P=v[R[k][1]],S=r22(E+P);v['ch_'+k]=`${E}-${S}-${P}`;se+=E;sp+=P;ss+=S;}v.ch_total=`${r22(se)}-${r22(ss)}-${r22(sp)}`;
  MY={};CL.zones.forEach((z,i)=>MY[i]=z.myKey?v[z.myKey]:z.keys.map(k=>v[k]).join('-'));cur=MY[zi];all();}
['dd','mm','yy'].forEach(id=>$(id).addEventListener('input',upd));
upd();
try{if(window.ART)window.ART.load('matrix').then(()=>{window.ART._apply('matrix');all();}).catch(()=>{});}catch(e){}
})();
