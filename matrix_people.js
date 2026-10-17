/* ============================================================
   matrix_people.js — „ჩემი ადამიანები“ (მეთოდი 1)
   ------------------------------------------------------------
   Your date + up to 10 difficult people + up to 10 good people.
   For every person the method-1 matrix is computed (same formulas
   as calculate()), then:
     • which energies recur in each group, against a baseline of
       every date 1930–2010 (×N = how much more often than usual)
     • where each recurring energy sits in YOUR matrix
       (karmic tail, material karma, talents, comfort zone…)
     • per person: same position + same energy (სარკე), their
       energies on your karmic points (ტრიგერი) and on your
       resource points (რესურსი), the couple centre and the
       couple karmic tail (as in შეთავსება).
   Lists are kept in this browser (localStorage) only.

   Self-injecting: adds a „ჩემი ადამიანები“ button to the method
   bar (setMethod(6)). Load AFTER matrix_stats.js.
   ============================================================ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const R=n=>{while(n>22)n=String(n).split('').reduce((a,d)=>a+ +d,0);return n;};
const MAX=10, STORE='mx_people_v1';
const E=n=>(typeof getE==='function')?getE(n):{name:'ენ.'+n,color:'#444'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ── method-1 matrix (mirrors calculate() with CUR===1) ── */
function m1(dd,mm,yy){
  const L3=R(dd),T3=R(mm),R3=R(yy);
  const B3=R(L3+T3+R3),Cv=R(L3+T3+R3+B3);
  const TL3=R(L3+T3),TR3=R(T3+R3),BR3=R(R3+B3),BL3=R(B3+L3);
  const B1=R(Cv+B3),B2=R(B1+B3),R1=R(Cv+R3),R2=R(R1+R3),L1=R(Cv+L3),L2=R(L1+L3),T1=R(Cv+T3),T2=R(T1+T3);
  const W2=R(B1+R1),W1=R(B1+W2),W3=R(R1+W2);
  const sT=R(T3+B3),sB=R(R3+L3),SOUL=R(sT+sB),SOC=R(R(TL3+BR3)+R(TR3+BL3)),MISSION=R(SOUL+SOC);
  return{L3,T3,R3,B3,Cv,TL3,TR3,BR3,BL3,B1,B2,R1,R2,L1,L2,T1,T2,W1,W2,W3,MISSION};
}

/* the 9 points that make a person's "profile" */
const POS=[['L3','სავიზიტო ბარათი'],['T3','შთაგონება'],['R3','მატერიალური გაკვეთილი'],
  ['B3','მთავარი გაკვეთილი'],['Cv','კომფორტის ზონა'],['B2','კარმული კუდი'],
  ['B1','ურთიერთობებში შესვლა'],['W2','ემოციური კმაყოფილება'],['MISSION','მისია']];
const profile=v=>new Set(POS.map(([k])=>v[k]));

/* zones of MY matrix an energy can fall into */
const ZONES=[
  {t:'კარმული კუდი',k:['B3','B2','B1'],kind:'trig'},
  {t:'მატერიალური კარმა',k:['R3','R2','R1'],kind:'trig'},
  {t:'წინაპრების კარმა',k:['BR3','BL3'],kind:'trig'},
  {t:'ტალანტები',k:['T3','T2','T1'],kind:'res'},
  {t:'კომფორტის ზონა',k:['Cv'],kind:'res'},
  {t:'წინაპრების ნიჭი',k:['TL3','TR3'],kind:'res'},
  {t:'პერსონა',k:['L3','L2','L1'],kind:''},
  {t:'ურთიერთობების ხაზი',k:['W1','W2'],kind:''},
  {t:'ფულის ხაზი',k:['W3'],kind:''},
  {t:'მისია',k:['MISSION'],kind:''}];
function myZones(me,n){return ZONES.filter(z=>z.k.some(k=>me[k]===n));}

/* baseline: share of all dates 1930–2010 whose profile holds each energy */
let BASE=null;
function baseline(){
  if(BASE)return BASE;
  const c=new Array(23).fill(0);let N=0;
  const dim=y=>[31,(y%4===0&&(y%100!==0||y%400===0))?29:28,31,30,31,30,31,31,30,31,30,31];
  for(let y=1930;y<=2010;y++){const d=dim(y);for(let m=1;m<=12;m++)for(let dd=1;dd<=d[m-1];dd++){
    for(const n of profile(m1(dd,m,y)))c[n]++;N++;}}
  BASE=c.map(x=>x/N);return BASE;
}

/* ── storage ── */
function load(){try{const s=JSON.parse(localStorage.getItem(STORE)||'null');if(s&&s.bad&&s.good)return s;}catch(_){}
  return{me:null,bad:[],good:[]};}
function save(){try{localStorage.setItem(STORE,JSON.stringify(S));}catch(_){}}
let S=load();

const CSS=`
#people-panel{display:none;width:100%;max-width:920px;margin:0 auto;font-family:'JetBrains Mono',monospace}
.pp-card{border:1px solid var(--rule,rgba(184,137,74,.22));background:rgba(16,30,36,.45);padding:16px 16px 14px;margin-bottom:14px}
.pp-card h3{font-family:'Marcellus SC','Cinzel',serif;font-weight:400;color:var(--brass-lt,#E3BE84);letter-spacing:.12em;font-size:15px;margin:0 0 10px}
.pp-note{font-size:12px;color:var(--enamel-2,#B9BFBC);line-height:1.6}
.pp-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pp-row{display:grid;grid-template-columns:1fr 44px 44px 64px 30px;gap:6px;align-items:center;margin-bottom:6px}
.pp-row input{min-width:0;background:rgba(11,20,24,.6);border:none;border-bottom:1px solid var(--rule,rgba(184,137,74,.22));color:var(--enamel,#EDE6D8);font:inherit;font-size:13px;padding:7px 4px;text-align:center;outline:none}
.pp-row input.nm{text-align:left}
.pp-row input:focus{border-bottom-color:var(--brass,#B8894A)}
.pp-row input.bad{border-bottom-color:#e06b6b}
.pp-x{all:unset;cursor:pointer;text-align:center;color:var(--dim,#6E8087);font-size:16px;padding:6px 0}
.pp-x:hover{color:#e06b6b}
.pp-add{all:unset;cursor:pointer;font-size:12px;color:var(--brass,#B8894A);padding:6px 2px}
.pp-add[disabled]{opacity:.35;cursor:default}
.pp-gh{font-size:12px;letter-spacing:.15em;margin:2px 0 8px}
.pp-gh.bad{color:#e88a8a}.pp-gh.good{color:#7fd1a8}
.pp-go{display:block;margin:14px auto 0}
.pp-tbl{width:100%;border-collapse:collapse;font-size:12px}
.pp-tbl th{font-weight:400;color:var(--dim,#6E8087);text-align:left;padding:6px;border-bottom:1px solid var(--rule,rgba(184,137,74,.22));white-space:nowrap}
.pp-tbl td{padding:7px 6px;border-bottom:1px solid var(--rule-2,rgba(184,137,74,.10));vertical-align:top;color:var(--enamel,#EDE6D8)}
.pp-tbl tr.hot td{background:rgba(184,137,74,.07)}
.pp-scroll{overflow-x:auto}
.pp-en{display:inline-block;padding:2px 7px;border-radius:3px;color:#fff;font-size:11px;white-space:nowrap}
.pp-bar{display:inline-block;height:7px;vertical-align:middle;margin-right:6px}
.pp-tag{display:inline-block;font-size:10.5px;padding:1px 6px;border-radius:3px;margin:1px 3px 1px 0;white-space:nowrap}
.pp-tag.trig{background:rgba(224,107,107,.18);color:#f0a0a0}
.pp-tag.res{background:rgba(78,143,130,.22);color:#8fd3c4}
.pp-tag.mir{background:rgba(184,137,74,.18);color:var(--brass-lt,#E3BE84)}
.pp-tag.neu{background:rgba(110,128,135,.2);color:var(--enamel-2,#B9BFBC)}
.pp-sum p{font-size:13px;line-height:1.7;margin:0 0 8px;color:var(--enamel,#EDE6D8)}
.pp-pc{border-top:1px solid var(--rule-2,rgba(184,137,74,.10));padding:10px 0}
.pp-pc:first-child{border-top:0}
.pp-pc .hd{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:13px}
.pp-pc .hd b{font-weight:400;color:var(--brass-lt,#E3BE84)}
.pp-pc .ln{font-size:12px;color:var(--enamel-2,#B9BFBC);margin-top:5px;line-height:1.7}
.pp-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
@media(max-width:700px){.pp-cols{grid-template-columns:1fr}
 .pp-row{grid-template-columns:1fr 38px 38px 56px 26px;gap:4px}
 .pp-tbl .opt{display:none}}`;

/* ── UI ── */
function rowHTML(g,i,p){
  return `<div class="pp-row" data-g="${g}" data-i="${i}">
   <input class="nm" placeholder="სახელი" value="${esc(p.n||'')}" data-f="n">
   <input placeholder="DD" maxlength="2" inputmode="numeric" value="${p.d||''}" data-f="d">
   <input placeholder="MM" maxlength="2" inputmode="numeric" value="${p.m||''}" data-f="m">
   <input placeholder="YYYY" maxlength="4" inputmode="numeric" value="${p.y||''}" data-f="y">
   <button class="pp-x" title="წაშლა" data-del="1">×</button></div>`;
}
function renderLists(){
  for(const g of ['bad','good']){
    const box=$('pp-'+g);if(!box)continue;
    box.innerHTML=S[g].map((p,i)=>rowHTML(g,i,p)).join('');
    const add=$('pp-add-'+g);
    add.disabled=S[g].length>=MAX;
    add.textContent=`+ დამატება (${S[g].length}/${MAX})`;
  }
}
function inject(){
  const bar=document.querySelector('.method-bar');if(!bar||$('btn-mp'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const b=document.createElement('button');b.className='method-btn';b.id='btn-mp';b.textContent='ჩემი ადამიანები';
  b.setAttribute('onclick','setMethod(6)');bar.appendChild(b);
  const p=document.createElement('div');p.id='people-panel';
  const me=S.me||{};
  p.innerHTML=`
   <div class="pp-card">
     <h3>ჩემი ადამიანები</h3>
     <div class="pp-note">შეიყვანე შენი თარიღი, ადამიანები, ვისთანაც გიჭირს, და ადამიანები, ვისთანაც კარგად ხარ (თითოეულში მაქს. ${MAX}).
       ჩანს, რომელი <b>ენერგიები მეორდება</b> თითო ჯგუფში, რამდენჯერ უფრო ხშირად, ვიდრე ჩვეულებრივ, და <b>სად დგას ეს ენერგია შენს მატრიცაში</b>.
       სია მხოლოდ ამ ბრაუზერში ინახება.</div>
     <div class="pp-gh" style="margin-top:14px;color:var(--brass-lt,#E3BE84)">მე</div>
     <div class="pp-row" data-g="me"><input class="nm" value="მე" disabled>
       <input id="pp-me-d" placeholder="DD" maxlength="2" inputmode="numeric" value="${me.d||''}">
       <input id="pp-me-m" placeholder="MM" maxlength="2" inputmode="numeric" value="${me.m||''}">
       <input id="pp-me-y" placeholder="YYYY" maxlength="4" inputmode="numeric" value="${me.y||''}"><span></span></div>
     <div class="pp-cols" style="margin-top:12px">
       <div><div class="pp-gh bad">✕ რთული ადამიანები</div><div id="pp-bad"></div><button class="pp-add" id="pp-add-bad"></button></div>
       <div><div class="pp-gh good">✓ კარგი ადამიანები</div><div id="pp-good"></div><button class="pp-add" id="pp-add-good"></button></div>
     </div>
     <button class="calc-btn pp-go" id="pp-go">⟡ ანალიზი</button>
   </div>
   <div id="pp-out"></div>`;
  const ml=$('main-layout');if(ml&&ml.parentNode)ml.parentNode.insertBefore(p,ml);else document.body.appendChild(p);
  if(!S.bad.length)S.bad.push({});if(!S.good.length)S.good.push({});
  renderLists();
  p.addEventListener('input',e=>{
    const t=e.target;
    if(t.id&&t.id.startsWith('pp-me-')){S.me=S.me||{};S.me[t.id.slice(6)]=t.value.trim();save();return;}
    const row=t.closest('.pp-row');if(!row||!t.dataset.f)return;
    const g=row.dataset.g,i=+row.dataset.i;if(!S[g]||!S[g][i])return;
    S[g][i][t.dataset.f]=t.value.trim();t.classList.remove('bad');save();
  });
  p.addEventListener('click',e=>{
    const t=e.target;
    if(t.dataset.del){const row=t.closest('.pp-row');S[row.dataset.g].splice(+row.dataset.i,1);save();renderLists();return;}
    if(t.id==='pp-add-bad'||t.id==='pp-add-good'){const g=t.id.slice(7);if(S[g].length<MAX){S[g].push({});save();renderLists();
      const rows=$('pp-'+g).querySelectorAll('.pp-row');const last=rows[rows.length-1];if(last)last.querySelector('input').focus();}return;}
    if(t.id==='pp-go')run();
  });
}

/* ── read + validate ── */
function parse(p){
  const d=parseInt(p.d,10),m=parseInt(p.m,10),y=parseInt(p.y,10);
  if(!d&&!m&&!y)return null;
  const err=(typeof validateDate==='function')?validateDate(d,m,y):(!(d>=1&&d<=31&&m>=1&&m<=12&&y>=1000)?'x':null);
  return err?{err}:{d,m,y};
}
function mark(g,i,on){const row=document.querySelector(`#pp-${g} .pp-row[data-i="${i}"]`);
  if(row)row.querySelectorAll('input:not(.nm)').forEach(x=>x.classList.toggle('bad',on));}

function run(){
  const out=$('pp-out');
  if(!S.me||!S.me.d){ /* take the main form's date when "me" is empty */
    const q=n=>document.querySelector(`[name=${n}]`);
    if(q('dd')&&q('dd').value){S.me={d:q('dd').value,m:q('mm').value,y:q('yyyy').value};
      $('pp-me-d').value=S.me.d;$('pp-me-m').value=S.me.m;$('pp-me-y').value=S.me.y;save();}
  }
  const meD=parse(S.me||{});
  ['pp-me-d','pp-me-m','pp-me-y'].forEach(id=>$(id).classList.toggle('bad',!meD||!!meD.err));
  if(!meD||meD.err){out.innerHTML=`<div class="pp-card pp-note">შეიყვანე შენი დაბადების თარიღი.</div>`;return;}
  const me=m1(meD.d,meD.m,meD.y);
  const people=[];let bad=0;
  for(const g of ['bad','good'])S[g].forEach((p,i)=>{
    const r=parse(p);mark(g,i,!!(r&&r.err));
    if(!r)return;if(r.err){bad++;return;}
    people.push({g,name:p.n||(g==='bad'?'რთული ':'კარგი ')+(i+1),...r,v:m1(r.d,r.m,r.y)});
  });
  if(!people.length){out.innerHTML=`<div class="pp-card pp-note">დაამატე ერთი ადამიანი მაინც.</div>`;return;}
  out.innerHTML=analysis(me,people)+(bad?`<div class="pp-note" style="color:#e88a8a;margin:-4px 0 12px">${bad} თარიღი არასწორია და გამოტოვებულია (წითლად მონიშნული).</div>`:'');
  out.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ── analysis ── */
const enBadge=n=>{const e=E(n);return `<span class="pp-en" style="background:${e.color}">${n} · ${e.name}</span>`;};
const zoneTags=(me,n)=>myZones(me,n).map(z=>`<span class="pp-tag ${z.kind==='trig'?'trig':z.kind==='res'?'res':'neu'}">${z.t}</span>`).join('')||'<span style="color:var(--dim,#6E8087)">—</span>';

function person(me,p){
  const pr=profile(p.v);
  const trig=new Set(),res=new Set();
  for(const n of pr)for(const z of myZones(me,n)){if(z.kind==='trig')trig.add(n);if(z.kind==='res')res.add(n);}
  const mirror=POS.filter(([k])=>p.v[k]===me[k]);
  const cCv=R(me.Cv+p.v.Cv),cB3=R(me.B3+p.v.B3),cB1=R(cCv+cB3),cB2=R(cB1+cB3);
  return{trig:[...trig],res:[...res],mirror,cCv,tail:[cB3,cB2,cB1]};
}

function analysis(me,people){
  const base=baseline();
  const grp=g=>people.filter(p=>p.g===g);
  const B=grp('bad'),G=grp('good');
  const cnt=(arr,n)=>arr.filter(p=>profile(p.v).has(n)).length;
  const rows=[];
  for(let n=1;n<=22;n++){
    const b=cnt(B,n),g=cnt(G,n);
    const bp=B.length?b/B.length:0,gp=G.length?g/G.length:0;
    rows.push({n,b,g,bp,gp,bl:bp/base[n],gl:gp/base[n],base:base[n]});
  }
  /* "recurring" = in ≥2 people of the group (≥50% when the group has 2–3) and ≥1.4× the usual rate */
  const rec=(c,len,l)=>len>=2&&c>=2&&c/len>=(len<=3?0.5:0.3)&&l>=1.4;
  const topBad=rows.filter(r=>rec(r.b,B.length,r.bl)).sort((a,b)=>b.bl-a.bl||b.b-a.b);
  const topGood=rows.filter(r=>rec(r.g,G.length,r.gl)).sort((a,b)=>b.gl-a.gl||b.g-a.g);

  /* ── summary sentences ── */
  const line=(r,which)=>{
    const z=myZones(me,r.n),c=which==='bad'?r.b:r.g,len=which==='bad'?B.length:G.length,l=which==='bad'?r.bl:r.gl;
    let s=`${enBadge(r.n)} — ${c}/${len} ადამიანთან, ჩვეულებრივზე <b>${l.toFixed(1)}×</b> ხშირად. `;
    if(!z.length)s+='შენს მატრიცაში ეს ენერგია არ დგას — ეს ადამიანები შენთვის უცხო ენერგიას მოიტანენ.';
    else{
      s+='შენთან: '+z.map(x=>`<b>${x.t}</b>`).join(', ')+'. ';
      if(which==='bad'&&z.some(x=>x.kind==='trig'))s+='ისინი შენს კარმულ თემას ააქტიურებენ — სარკეა, რომელიც გაკვეთილზე მიგითითებს.';
      else if(which==='bad')s+='ისინი შენი ამ ენერგიის ჩრდილოვან მხარეს ასახავენ.';
      else if(z.some(x=>x.kind==='res'))s+='ისინი შენს რესურსს აძლიერებენ.';
      else s+='ამ თემაში ისინი შენ გეხმარებიან.';
    }
    return `<p>${s}</p>`;
  };
  let sum='';
  if(B.length){sum+=`<div class="pp-gh bad">✕ რთული ადამიანები (${B.length})</div>`;
    sum+=topBad.length?topBad.slice(0,4).map(r=>line(r,'bad')).join(''):`<p class="pp-note">${B.length<2?'კანონზომიერებისთვის ორი ადამიანი მაინც საჭიროა.':'მკაფიოდ განმეორებადი ენერგია არ ჩანს.'}</p>`;}
  if(G.length){sum+=`<div class="pp-gh good" style="margin-top:10px">✓ კარგი ადამიანები (${G.length})</div>`;
    sum+=topGood.length?topGood.slice(0,4).map(r=>line(r,'good')).join(''):`<p class="pp-note">${G.length<2?'კანონზომიერებისთვის ორი ადამიანი მაინც საჭიროა.':'მკაფიოდ განმეორებადი ენერგია არ ჩანს.'}</p>`;}

  /* couple centres per group */
  const P=new Map(people.map(p=>[p,person(me,p)]));
  const centres=g=>{const m={};for(const p of grp(g)){const c=P.get(p).cCv;m[c]=(m[c]||0)+1;}
    return Object.entries(m).filter(([,c])=>c>=2).sort((a,b)=>b[1]-a[1]);};
  const cb=centres('bad'),cg=centres('good');
  if(cb.length||cg.length){
    sum+=`<p class="pp-note" style="margin-top:6px">წყვილის ცენტრი (როგორც შეთავსებაში) მეორდება: `+
      [...cb.map(([n,c])=>`<span class="pp-tag trig">რთული: ${n} ${E(n).name} ×${c}</span>`),
       ...cg.map(([n,c])=>`<span class="pp-tag res">კარგი: ${n} ${E(n).name} ×${c}</span>`)].join('')+`</p>`;
  }

  /* ── energy table ── */
  const shown=rows.filter(r=>r.b||r.g).sort((a,b)=>(b.bl-b.gl)-(a.bl-a.gl));
  const hot=new Set([...topBad,...topGood].map(r=>r.n));
  const bar=(p,c)=>`<span class="pp-bar" style="width:${Math.round(p*40)}px;background:${c}"></span>`;
  const tbl=`<div class="pp-scroll"><table class="pp-tbl"><thead><tr>
     <th>ენერგია</th><th>რთული</th><th>კარგი</th><th class="opt">ჩვეულებრივ</th><th>შენს მატრიცაში</th></tr></thead><tbody>${
     shown.map(r=>`<tr class="${hot.has(r.n)?'hot':''}"><td>${enBadge(r.n)}</td>
       <td>${B.length?bar(r.bp,'#e06b6b')+`${r.b}/${B.length}`+(r.b?` <small style="color:var(--dim,#6E8087)">${r.bl.toFixed(1)}×</small>`:''):'—'}</td>
       <td>${G.length?bar(r.gp,'#4E8F82')+`${r.g}/${G.length}`+(r.g?` <small style="color:var(--dim,#6E8087)">${r.gl.toFixed(1)}×</small>`:''):'—'}</td>
       <td class="opt" style="color:var(--dim,#6E8087)">${Math.round(r.base*100)}%</td>
       <td>${zoneTags(me,r.n)}</td></tr>`).join('')}</tbody></table></div>
     <div class="pp-note" style="margin-top:8px">თითო ადამიანის 9 წერტილი: ${POS.map(p=>p[1]).join(' · ')}.
       „ჩვეულებრივ“ — 1930–2010 წლების ყველა თარიღიდან რა წილს აქვს ეს ენერგია; ×N — ჯგუფში რამდენჯერ უფრო ხშირია.
       <span class="pp-tag trig">წითელი</span> შენი კარმული წერტილები, <span class="pp-tag res">მწვანე</span> შენი რესურსი.</div>`;

  /* ── per person ── */
  const card=p=>{const x=P.get(p);
    return `<div class="pp-pc"><div class="hd"><span><span class="pp-dot" style="background:${p.g==='bad'?'#e06b6b':'#4E8F82'}"></span><b>${esc(p.name)}</b>
       <span style="color:var(--dim,#6E8087)"> ${String(p.d).padStart(2,'0')}.${String(p.m).padStart(2,'0')}.${p.y}</span></span>
       <span style="font-size:12px">წყვილის ცენტრი ${enBadge(x.cCv)}</span></div>
     <div class="ln">${
       x.mirror.length?`<span class="pp-tag mir">სარკე</span> ${x.mirror.map(([k,t])=>`${t} = ${p.v[k]}`).join(', ')}<br>`:''}${
       x.trig.length?`<span class="pp-tag trig">ტრიგერი</span> ${x.trig.map(n=>`${n} ${E(n).name} → ${myZones(me,n).filter(z=>z.kind==='trig').map(z=>z.t).join(', ')}`).join(' · ')}<br>`:''}${
       x.res.length?`<span class="pp-tag res">რესურსი</span> ${x.res.map(n=>`${n} ${E(n).name} → ${myZones(me,n).filter(z=>z.kind==='res').map(z=>z.t).join(', ')}`).join(' · ')}<br>`:''}
       წყვილის კარმული კუდი: <b style="font-weight:400;color:var(--enamel,#EDE6D8)">${x.tail.join('-')}</b>
       · მისი წერტილები: ${POS.map(([k,t])=>`<span title="${t}">${p.v[k]}</span>`).join(' ')}</div></div>`;};

  const meLine=`<div class="pp-note" style="margin-bottom:10px">შენი წერტილები: ${POS.map(([k,t])=>`${t} <b style="color:var(--enamel,#EDE6D8);font-weight:400">${me[k]}</b>`).join(' · ')}<br>
     კარმული კუდი <b style="color:#f0a0a0;font-weight:400">${me.B3}-${me.B2}-${me.B1}</b> · ტალანტები <b style="color:#8fd3c4;font-weight:400">${me.T3}-${me.T2}-${me.T1}</b></div>`;

  return `<div class="pp-card pp-sum"><h3>რას აჩვენებს</h3>${meLine}${sum}</div>
    <div class="pp-card"><h3>ენერგიები ჯგუფებში</h3>${tbl}</div>
    <div class="pp-card"><h3>თითოეული ადამიანი</h3>
      <div class="pp-note" style="margin-bottom:6px"><span class="pp-tag mir">სარკე</span> იგივე წერტილში იგივე ენერგია ·
        <span class="pp-tag trig">ტრიგერი</span> მისი ენერგია შენს კარმულ წერტილზე ·
        <span class="pp-tag res">რესურსი</span> მისი ენერგია შენს ნიჭზე / კომფორტის ზონაზე</div>
      ${[...B,...G].map(card).join('')}</div>`;
}

/* ── method switch ── */
function hook(){
  if(typeof window.setMethod!=='function'||window.setMethod._pp)return;
  const o=window.setMethod;
  const w=function(m){
    const r=o.apply(this,arguments);
    const on=m===6,p=$('people-panel'),ml=$('main-layout'),b=$('btn-mp');
    if(p)p.style.display=on?'block':'none';
    if(b)b.classList.toggle('active',on);
    if(on){
      if(ml)ml.style.display='none';
      ['stats-panel','pyth-panel'].forEach(id=>{const x=$(id);if(x)x.style.display='none';});
      document.querySelectorAll('.method-bar .method-btn').forEach(x=>{if(x!==b)x.classList.remove('active');});
      if(!(S.me&&S.me.d)){const q=n=>document.querySelector(`[name=${n}]`);
        if(q('dd')){$('pp-me-d').value=q('dd').value;$('pp-me-m').value=q('mm').value;$('pp-me-y').value=q('yyyy').value;}}
    }else if(ml&&m!==5)ml.style.display='';
    return r;
  };
  w._pp=true;w._st=o._st;window.setMethod=w;
}
function init(){inject();hook();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window._mxPeople={m1,profile,baseline};
})();
