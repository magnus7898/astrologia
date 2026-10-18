/* ============================================================
   people_core.js — shared "ჩემი ადამიანები" form + helpers
   ------------------------------------------------------------
   Used by astropeople.js, hd_people.js, py_people.js.
   PeopleUI.mount(el,{key,time,meDefault,onRun}) draws:
     მე (date [+ time]) · ✕ difficult (≤10) · ✓ good (≤10)
   and calls onRun(me, people) with parsed, validated rows:
     {g:'bad'|'good', name, d, m, y, h, mi, timeKnown}
   Lists persist in localStorage under `key` (this browser only).
   Inherits the page's colours; gold / red / teal accents only.
   ============================================================ */
(function(){
'use strict';
if(window.PeopleUI)return;
const MAX=10;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CSS=`
.pq{font-size:13px;line-height:1.55;color:inherit;text-align:left}
.pq-note{font-size:12px;opacity:.78;line-height:1.65}
.pq-gh{font-size:12px;letter-spacing:.12em;margin:12px 0 7px}
.pq-gh.bad{color:#ec8f8f}.pq-gh.good{color:#7fd1a8}.pq-gh.me{color:#e3be84}
.pq-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.pq-row{display:grid;grid-template-columns:minmax(0,1fr) 40px 40px 58px var(--pq-t,0px) 26px;gap:5px;align-items:center;margin-bottom:6px}
.pq.time .pq-row{--pq-t:58px}
.pq-row input{min-width:0;width:100%;box-sizing:border-box;background:rgba(0,0,0,.28);border:1px solid rgba(201,168,76,.22);border-radius:6px;
  color:inherit;font:inherit;font-size:13px;padding:7px 4px;text-align:center;outline:none}
.pq-row input.nm{text-align:left;padding-left:8px}
.pq-row input:focus{border-color:rgba(201,168,76,.7)}
.pq-row input.bad{border-color:#e06b6b}
.pq-row input:disabled{opacity:.6}
.pq-x{all:unset;cursor:pointer;text-align:center;opacity:.5;font-size:17px;padding:6px 0}
.pq-x:hover{opacity:1;color:#e06b6b}
.pq-add{all:unset;cursor:pointer;font-size:12px;color:#c9a84c;padding:6px 2px}
.pq-add[disabled]{opacity:.35;cursor:default}
.pq-go{all:unset;box-sizing:border-box;display:block;cursor:pointer;margin:16px auto 0;padding:11px 26px;border-radius:8px;
  border:1px solid rgba(201,168,76,.6);color:#ecd59a;letter-spacing:.12em;font-size:13px;text-align:center;background:rgba(201,168,76,.08)}
.pq-go:hover{background:rgba(201,168,76,.16)}
.pq-go[disabled]{opacity:.5;cursor:wait}
.pq-card{border:1px solid rgba(201,168,76,.2);border-radius:10px;background:rgba(0,0,0,.22);padding:14px 14px 12px;margin:14px 0}
.pq-card h3{font-weight:400;color:#e3be84;letter-spacing:.1em;font-size:15px;margin:0 0 10px}
.pq-card p{margin:0 0 8px}
.pq-tbl{width:100%;border-collapse:collapse;font-size:12px}
.pq-tbl th{font-weight:400;opacity:.6;text-align:left;padding:6px;border-bottom:1px solid rgba(201,168,76,.2);white-space:nowrap}
.pq-tbl td{padding:7px 6px;border-bottom:1px solid rgba(201,168,76,.08);vertical-align:top}
.pq-tbl tr.hot td{background:rgba(201,168,76,.07)}
.pq-scroll{overflow-x:auto}
.pq-bar{display:inline-block;height:7px;vertical-align:middle;margin-right:6px;border-radius:2px}
.pq-tag{display:inline-block;font-size:10.5px;padding:1px 6px;border-radius:4px;margin:1px 3px 1px 0;white-space:nowrap}
.pq-tag.trig{background:rgba(224,107,107,.18);color:#f0a0a0}
.pq-tag.res{background:rgba(78,163,140,.22);color:#8fd3c4}
.pq-tag.mir{background:rgba(201,168,76,.18);color:#e3be84}
.pq-tag.neu{background:rgba(150,150,170,.18);opacity:.9}
.pq-pc{border-top:1px solid rgba(201,168,76,.1);padding:10px 0}
.pq-pc:first-child{border-top:0}
.pq-pc .hd{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
.pq-pc .hd b{font-weight:400;color:#e3be84}
.pq-pc .ln{font-size:12px;opacity:.85;margin-top:5px;line-height:1.75}
.pq-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.pq-dim{opacity:.55}
.pq-err{color:#ec8f8f;font-size:12px;margin-top:6px}
@media(max-width:700px){.pq-cols{grid-template-columns:1fr}
  .pq-row{grid-template-columns:minmax(0,1fr) 36px 36px 54px var(--pq-t,0px) 24px;gap:4px}
  .pq.time .pq-row{--pq-t:52px}
  .pq-tbl .opt{display:none}}`;
let cssDone=false;
function css(){if(cssDone)return;cssDone=true;const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);}

function load(key){try{const s=JSON.parse(localStorage.getItem(key)||'null');if(s&&Array.isArray(s.bad)&&Array.isArray(s.good))return s;}catch(_){}
  return{me:null,bad:[],good:[]};}
function store(key,S){try{localStorage.setItem(key,JSON.stringify(S));}catch(_){}}

function validDate(d,m,y){
  if(!(y>=1000&&y<=2100))return false;if(!(m>=1&&m<=12))return false;
  const dim=[31,(y%4===0&&(y%100!==0||y%400===0))?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
  return d>=1&&d<=dim;
}
function parseTime(t){
  t=String(t||'').trim();if(!t)return{ok:true,known:false,h:12,mi:0};
  const m=t.match(/^(\d{1,2})(?::|\.|\s)?(\d{2})?$/);if(!m)return{ok:false};
  const h=+m[1],mi=+(m[2]||0);if(h>23||mi>59)return{ok:false};
  return{ok:true,known:true,h,mi};
}
function parse(p,useTime){
  const d=parseInt(p.d,10),m=parseInt(p.m,10),y=parseInt(p.y,10);
  if(!d&&!m&&!y&&!String(p.t||'').trim())return null;
  if(!validDate(d,m,y))return{err:true};
  const t=useTime?parseTime(p.t):{ok:true,known:false,h:12,mi:0};
  if(!t.ok)return{err:true};
  return{d,m,y,h:t.h,mi:t.mi,timeKnown:t.known};
}

function row(g,i,p,time,me){
  return `<div class="pq-row" data-g="${g}" data-i="${i}">
   ${me?'<input class="nm" value="მე" disabled>':`<input class="nm" placeholder="სახელი" value="${esc(p.n)}" data-f="n">`}
   <input placeholder="DD" maxlength="2" inputmode="numeric" value="${esc(p.d)}" data-f="d">
   <input placeholder="MM" maxlength="2" inputmode="numeric" value="${esc(p.m)}" data-f="m">
   <input placeholder="YYYY" maxlength="4" inputmode="numeric" value="${esc(p.y)}" data-f="y">
   ${time?`<input placeholder="სთ:წთ" maxlength="5" inputmode="numeric" value="${esc(p.t)}" data-f="t" title="დრო — არ ვიცი? დატოვე ცარიელი">`:'<span></span>'}
   ${me?'<span></span>':'<button type="button" class="pq-x" title="წაშლა" data-del="1">×</button>'}</div>`;
}

function mount(el,opt){
  css();
  const S=load(opt.key);
  if(!S.bad.length)S.bad.push({});if(!S.good.length)S.good.push({});
  S.me=S.me||{};
  const time=!!opt.time;
  el.innerHTML=`<div class="pq${time?' time':''}">
    <div class="pq-note">${opt.intro||''}</div>
    <div class="pq-gh me">მე</div><div id="${opt.key}-me"></div>
    <div class="pq-cols">
      <div><div class="pq-gh bad">✕ რთული ადამიანები</div><div class="pq-list" data-g="bad"></div><button type="button" class="pq-add" data-add="bad"></button></div>
      <div><div class="pq-gh good">✓ კარგი ადამიანები</div><div class="pq-list" data-g="good"></div><button type="button" class="pq-add" data-add="good"></button></div>
    </div>
    <button type="button" class="pq-go">⟡ ანალიზი</button>
    <div class="pq-err"></div>
    <div class="pq-out"></div></div>`;
  const root=el.firstElementChild,meBox=el.querySelector('#'+CSS_ESC(opt.key)+'-me'),out=root.querySelector('.pq-out'),err=root.querySelector('.pq-err'),go=root.querySelector('.pq-go');
  function fillMeDefault(){
    if(S.me&&S.me.d)return;
    const d=opt.meDefault&&opt.meDefault();if(d&&d.d){S.me={...d};store(opt.key,S);}
  }
  function render(){
    fillMeDefault();
    meBox.innerHTML=row('me',0,S.me||{},time,true);
    for(const g of ['bad','good']){
      root.querySelector(`.pq-list[data-g=${g}]`).innerHTML=S[g].map((p,i)=>row(g,i,p,time,false)).join('');
      const a=root.querySelector(`[data-add=${g}]`);a.disabled=S[g].length>=MAX;a.textContent=`+ დამატება (${S[g].length}/${MAX})`;
    }
  }
  render();
  root.addEventListener('input',e=>{
    const t=e.target,r=t.closest('.pq-row');if(!r||!t.dataset.f)return;
    const g=r.dataset.g,obj=g==='me'?(S.me=S.me||{}):S[g][+r.dataset.i];if(!obj)return;
    obj[t.dataset.f]=t.value.trim();t.classList.remove('bad');store(opt.key,S);
  });
  root.addEventListener('click',async e=>{
    const t=e.target;
    if(t.dataset.del){const r=t.closest('.pq-row');S[r.dataset.g].splice(+r.dataset.i,1);store(opt.key,S);render();return;}
    if(t.dataset.add){const g=t.dataset.add;if(S[g].length<MAX){S[g].push({});store(opt.key,S);render();
      const rs=root.querySelectorAll(`.pq-list[data-g=${g}] .pq-row`);const l=rs[rs.length-1];if(l)l.querySelector('input').focus();}return;}
    if(t===go)run();
  });
  async function run(){
    err.textContent='';
    const mark=(sel,on)=>{const r=root.querySelector(sel);if(r)r.querySelectorAll('input:not(.nm)').forEach(x=>x.classList.toggle('bad',on));};
    fillMeDefault();
    const me=parse(S.me||{},time);
    mark(`#${CSS_ESC(opt.key)}-me .pq-row`,!me||!!me.err);
    if(!me||me.err){err.textContent='შეიყვანე შენი დაბადების თარიღი.';return;}
    const people=[];let bad=0;
    for(const g of ['bad','good'])S[g].forEach((p,i)=>{
      const r=parse(p,time);mark(`.pq-list[data-g=${g}] .pq-row[data-i="${i}"]`,!!(r&&r.err));
      if(!r)return;if(r.err){bad++;return;}
      people.push({g,name:p.n||((g==='bad'?'რთული ':'კარგი ')+(i+1)),...r});
    });
    if(!people.length){err.textContent='დაამატე ერთი ადამიანი მაინც.';return;}
    if(bad)err.textContent=`${bad} თარიღი არასწორია და გამოტოვებულია (წითლად მონიშნული).`;
    go.disabled=true;const txt=go.textContent;go.textContent='⏳ ითვლება…';
    try{out.innerHTML=await opt.onRun({...me,name:'მე'},people);
      out.scrollIntoView({behavior:'smooth',block:'start'});}
    catch(ex){console.error(ex);err.textContent='შეცდომა: '+ex.message;}
    finally{go.disabled=false;go.textContent=txt;}
  }
  return{root,out,state:S};
}
function CSS_ESC(s){return String(s).replace(/[^a-zA-Z0-9_-]/g,'_');}

/* ── shared output helpers ── */
const bar=(p,c)=>`<span class="pq-bar" style="width:${Math.round(Math.max(0,Math.min(1,p))*40)}px;background:${c}"></span>`;
const pdate=p=>`${String(p.d).padStart(2,'0')}.${String(p.m).padStart(2,'0')}.${p.y}${p.timeKnown?' '+String(p.h).padStart(2,'0')+':'+String(p.mi).padStart(2,'0'):''}`;
/* group counting: items(p) → Set of feature keys. base(k) = usual share (0..1).
   returns rows sorted by bad-lift, plus "recurring" flags. */
function groupStats(people,items,base,keys){
  const B=people.filter(p=>p.g==='bad'),G=people.filter(p=>p.g==='good');
  const sets=new Map(people.map(p=>[p,items(p)]));
  const all=keys||[...new Set(people.flatMap(p=>[...sets.get(p)]))];
  const rows=all.map(k=>{
    const b=B.filter(p=>sets.get(p).has(k)).length,g=G.filter(p=>sets.get(p).has(k)).length;
    const bs=base(k)||1e-9,bp=B.length?b/B.length:0,gp=G.length?g/G.length:0;
    return{k,b,g,bp,gp,bl:bp/bs,gl:gp/bs,base:base(k)};
  });
  const rec=(c,len,l)=>len>=2&&c>=2&&c/len>=(len<=3?0.5:0.3)&&l>=1.4;
  rows.forEach(r=>{r.recB=rec(r.b,B.length,r.bl);r.recG=rec(r.g,G.length,r.gl);});
  return{B,G,rows,
    topBad:rows.filter(r=>r.recB).sort((a,b)=>b.bl-a.bl||b.b-a.b),
    topGood:rows.filter(r=>r.recG).sort((a,b)=>b.gl-a.gl||b.g-a.g)};
}
const fewNote=n=>`<p class="pq-note">${n<2?'კანონზომიერებისთვის ორი ადამიანი მაინც საჭიროა.':'მკაფიოდ განმეორებადი ნიშანი არ ჩანს.'}</p>`;
function groupTable(st,label,where,head){
  const {B,G}=st;
  const shown=st.rows.filter(r=>r.b||r.g).sort((a,b)=>(b.bl-b.gl)-(a.bl-a.gl)||b.b-a.b);
  const cell=(c,len,p,l,col)=>len?bar(p,col)+`${c}/${len}`+(c?` <small class="pq-dim">${l.toFixed(1)}×</small>`:''):'—';
  return `<div class="pq-scroll"><table class="pq-tbl"><thead><tr><th>${head||''}</th><th>რთული</th><th>კარგი</th><th class="opt">ჩვეულებრივ</th><th>${where?'შენთან':''}</th></tr></thead><tbody>${
    shown.map(r=>`<tr class="${r.recB||r.recG?'hot':''}"><td>${label(r.k)}</td>
      <td>${cell(r.b,B.length,r.bp,r.bl,'#e06b6b')}</td><td>${cell(r.g,G.length,r.gp,r.gl,'#4ea38c')}</td>
      <td class="opt pq-dim">${r.base>=0.995?'—':Math.round(r.base*100)+'%'}</td><td>${where?where(r.k):''}</td></tr>`).join('')}</tbody></table></div>`;
}
const card=(title,html)=>`<div class="pq-card"><h3>${title}</h3>${html}</div>`;
const legendTags=()=>`<span class="pq-tag trig">ტრიგერი</span> შენი რთული წერტილი · <span class="pq-tag res">რესურსი</span> შენი ძლიერი მხარე · <span class="pq-tag mir">სარკე</span> ერთნაირი`;

/* local wall time in an IANA zone → JD (UT) */
function tzOffMin(tz,ms){
  try{const o={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'})
    .formatToParts(new Date(ms)).forEach(p=>{if(p.type!=='literal')o[p.type]=+p.value;});
    return(Date.UTC(o.year,o.month-1,o.day,o.hour%24,o.minute,o.second)-ms)/60000;}catch(_){return 0;}
}
function localJD(y,m,d,h,mi,tz){
  const wall=Date.UTC(y,m-1,d,h,mi);let u=wall-tzOffMin(tz||'UTC',wall)*60000;u=wall-tzOffMin(tz||'UTC',u)*60000;
  return u/86400000+2440587.5;
}

window.PeopleUI={mount,groupStats,groupTable,card,bar,pdate,esc,fewNote,legendTags,localJD,MAX};
})();
