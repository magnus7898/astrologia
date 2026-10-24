/* academy.js — „ნულიდან გმირამდე“: the learning path shell shared by math.html, phys.html, chem.html and biology.html.
   A page sets window.ACAD = {subj, title, ico, color, color2, lede, lab:'<selector of the old lab>', levels:[{n,t,d,ls:[lesson]}]}
   lesson = {p:'sci'|'phys'|'chem'|'move', id, ico, t, s, goal, sel:[selectors] (move), tab:'…' (math tab), q:[[question, right, wrong, wrong, wrong], …]}
   Progress lives in localStorage (per browser), so nothing is required from the backend.                                  */
(function(){
'use strict';
const A=window.ACAD;if(!A)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const KEY='magnus_academy_v1';
const SUBJ=[['math','math.html','∑','მათემატიკა'],['phys','phys.html','⚛','ფიზიკა'],['chem','chem.html','⚗','ქიმია'],['bio','biology.html','🧬','ბიოლოგია']];
const RANKS=[['ნული',0],['შეგირდი',.1],['მცოდნე',.3],['ოსტატი',.55],['გმირი',.85]];
const LV=['0','I','II','III','IV'];
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){}}
let DB=load();DB[A.subj]=DB[A.subj]||{done:{},xp:0,last:null};const ME=()=>DB[A.subj];
const ALL=[];A.levels.forEach((L,li)=>L.ls.forEach(l=>{l.li=li;l.ix=ALL.length;ALL.push(l);}));
const isDone=l=>!!ME().done[l.id];
const nextL=()=>ALL.find(l=>!isDone(l))||null;
const frac=()=>ALL.filter(isDone).length/ALL.length;
const rankOf=f=>{let r=0;RANKS.forEach(([n,t],i)=>{if(f>=t)r=i;});if(f>=1)r=4;return r;};

/* ── DOM ── */
const root=document.createElement('div');root.className='ac';root.style.setProperty('--ac',A.color);root.style.setProperty('--ac2',A.color2||A.color);
const labEls=()=>A.lab?[...document.querySelectorAll(A.lab)]:[];
const first=labEls()[0];
if(first)first.parentNode.insertBefore(root,first);else document.body.prepend(root);
root.innerHTML=`<div class="ac-bg"></div>
<div class="ac-top"><a class="ac-back" href="index.html?g=science">← მეცნიერებები</a>
  ${A.lab?`<div class="ac-mode" role="tablist"><button data-m="path" role="tab">🧭 გზა</button><button data-m="lab" role="tab">🔬 ლაბორატორია</button></div>`:''}
  <nav class="ac-subj">${SUBJ.map(([k,h,i,n])=>`<a href="${h}" class="${k===A.subj?'on':''}"><span>${i}</span>${n}</a>`).join('')}</nav></div>
<section class="ac-hero"></section>
<section class="ac-path"><div class="ac-tools"><input class="ac-search" type="search" placeholder="🔍 მოძებნე თემა…" aria-label="ძიება"><span class="ac-stat"></span></div><div class="ac-levels"></div></section>
<section class="ac-lesson"></section><div class="ac-toast"></div>`;
const $q=s=>root.querySelector(s);

function hero(){const f=frac(),r=rankOf(f),me=ME(),n=nextL(),done=ALL.filter(isDone).length,C=2*Math.PI*64;
  const nr=RANKS[Math.min(4,r+1)];const need=r<4?Math.max(0,Math.ceil(nr[1]*ALL.length)-done):0;
  $q('.ac-hero').innerHTML=`<div><div class="ac-eyebrow">${A.ico} ნულიდან გმირამდე</div><div class="ac-h1">${esc(A.title)}</div><div class="ac-lede">${A.lede}</div>
   <div class="ac-cta">${n?`<button class="ac-btn" data-go="${n.id}">▶ ${done?'გაგრძელება':'დაწყება'}: ${esc(n.t)}</button>`:`<button class="ac-btn" disabled>🏆 ყველა გაკვეთილი გავლილია</button>`}
   ${A.lab?`<button class="ac-btn ghost" data-m2="lab">🔬 თავისუფალი ლაბორატორია</button>`:''}</div></div>
   <div class="ac-rank" title="წოდება"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="64" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="9"/>
     <circle cx="75" cy="75" r="64" fill="none" stroke="var(--ac)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-f)}" style="transition:stroke-dashoffset .8s"/></svg>
     <div class="in"><b>${Math.round(f*100)}%</b><i>${RANKS[r][0]}</i><span>${me.xp||0} XP</span>${r<4?`<span style="font-size:9.5px">„${nr[0]}“-მდე: ${need}</span>`:''}</div></div>
   <div class="ac-miles">${A.levels.map((L,i)=>{const k=L.ls.filter(isDone).length;return `<button class="ac-mile${k===L.ls.length?' full':''}" data-lv="${i}"><span>დონე ${LV[i]}</span><b>${esc(L.n)}</b><div class="bar"><i style="width:${k/L.ls.length*100}%"></i></div></button>`;}).join('')}</div>`;
  $q('.ac-hero').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go('l='+b.dataset.go));
  $q('.ac-hero').querySelectorAll('[data-m2]').forEach(b=>b.onclick=()=>go('lab'));
  $q('.ac-hero').querySelectorAll('.ac-mile').forEach(b=>b.onclick=()=>{const el=root.querySelector(`.ac-lvl[data-lv="${b.dataset.lv}"]`);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});});}
function path(){const n=nextL();
  $q('.ac-levels').innerHTML=A.levels.map((L,i)=>{const k=L.ls.filter(isDone).length;
    return `<div class="ac-lvl${k===L.ls.length?' full':''}" data-lv="${i}"><div class="ac-lnum"><b>${LV[i]}</b><small>დონე</small></div><div>
     <div class="ac-lhead"><h2>${esc(L.n)} · ${esc(L.t)}</h2><span>${k} / ${L.ls.length}</span></div><div class="ac-ldesc">${L.d}</div>
     <div class="ac-grid">${L.ls.map(l=>`<button class="ac-node${isDone(l)?' done':''}${n===l?' next':''}" data-id="${l.id}"><span class="ico">${l.ico}</span><b>${esc(l.t)}</b><small>${esc(l.s||'')}</small>
       <span class="st">${isDone(l)?'✓ ნასწავლია · '+ME().done[l.id].s+'/'+l.q.length:n===l?'▶ შემდეგი':'○ '+l.q.length+' კითხვა'}</span></button>`).join('')}</div></div></div>`;}).join('');
  $q('.ac-levels').querySelectorAll('.ac-node').forEach(b=>b.onclick=()=>go('l='+b.dataset.id));
  $q('.ac-stat').innerHTML=`<b>${ALL.filter(isDone).length}</b> / ${ALL.length} გაკვეთილი`;
  filter();}
function filter(){const q=$q('.ac-search').value.trim().toLowerCase();
  root.querySelectorAll('.ac-node').forEach(b=>{const l=ALL.find(x=>x.id===b.dataset.id);b.classList.toggle('hide',!!q&&!(l.t+' '+(l.s||'')+' '+(l.goal||'')).toLowerCase().includes(q));});
  root.querySelectorAll('.ac-lvl').forEach(v=>v.style.display=q&&!v.querySelector('.ac-node:not(.hide)')?'none':'');}
$q('.ac-search').addEventListener('input',filter);

/* ── lesson ── */
let MOVED=[],CUR=null;
function stopLesson(){try{window.SCI&&SCI.stop();}catch(e){}try{window.PHYS&&PHYS.stop&&PHYS.stop();}catch(e){}try{window.CHEMADV&&CHEMADV.stop&&CHEMADV.stop();}catch(e){}
  MOVED.forEach(([el,ph])=>{ph.parentNode.insertBefore(el,ph);ph.remove();});MOVED=[];CUR=null;}
function lesson(l){stopLesson();CUR=l;ME().last=l.id;save(DB);const L=A.levels[l.li],i=l.ix,pv=ALL[i-1],nx=ALL[i+1];
  const box=$q('.ac-lesson');
  box.innerHTML=`<div class="ac-lbar"><button class="ac-sbtn" data-back>← გზა</button><span class="ac-chip">დონე ${LV[l.li]} · ${esc(L.n)}</span>
     <span class="t"><i>${l.ico}</i>${esc(l.t)}</span><span class="ac-stat">${i+1} / ${ALL.length}</span>
     <button class="ac-sbtn" data-pv ${pv?'':'disabled'}>‹</button><button class="ac-sbtn" data-nx ${nx?'':'disabled'}>›</button>
     <div class="ac-prog"><i style="width:${(i+1)/ALL.length*100}%"></i></div></div>
   <div class="ac-goal"><span class="gi">${l.ico}</span><div><b>${esc(l.t)}</b><p>🎯 ${l.goal||esc(l.s||'')}</p></div></div>
   <div class="ac-body"></div><div class="ac-check"></div>
   <div class="ac-nav"><button data-pv ${pv?'':'disabled'}><small>‹ წინა</small><b>${pv?esc(pv.t):''}</b></button><button data-nx ${nx?'':'disabled'}><small>შემდეგი ›</small><b>${nx?esc(nx.t):''}</b></button></div>`;
  box.querySelector('[data-back]').onclick=()=>go('');
  box.querySelectorAll('[data-pv]').forEach(b=>b.onclick=()=>pv&&go('l='+pv.id));
  box.querySelectorAll('[data-nx]').forEach(b=>b.onclick=()=>nx&&go('l='+nx.id));
  const body=box.querySelector('.ac-body');
  try{
    if(l.p==='sci')SCI.render(l.id,body);
    else if(l.p==='phys')PHYS.render(l.id,body);
    else if(l.p==='chem')CHEMADV.render(l.id,body);
    else if(l.p==='move'){(l.sel||[]).forEach(s=>{const el=document.querySelector(s);if(!el)return;const ph=document.createComment('ac');el.parentNode.insertBefore(ph,el);body.appendChild(el);el.hidden=false;MOVED.push([el,ph]);});
      if(l.tab&&window.openTab)window.openTab(l.tab);if(l.after)l.after(body);}
  }catch(e){body.innerHTML='<div class="ac-empty">ამ გაკვეთილის ჩატვირთვა ვერ მოხერხდა: '+esc(e.message)+'</div>';console.error(e);}
  quiz(l);window.scrollTo({top:0,behavior:'instant'in window?'instant':'auto'});}
function quiz(l){const box=$q('.ac-check');const prev=ME().done[l.id];
  const Q=l.q.map(q=>({q:q[0],a:q[1],o:shuf(q.slice(1)),sel:null}));
  box.innerHTML=`<h3>✦ საკონტროლო — ${prev?'უკვე გავლილია ('+prev.s+'/'+l.q.length+'), შეგიძლია გაიმეორო':'გაიარე, რომ გაკვეთილი ჩაითვალოს'}</h3><p>სწორი პასუხი = 10 XP. ჩასათვლელად საჭიროა ${Math.ceil(l.q.length*2/3)} / ${l.q.length}.</p>
   ${Q.map((q,i)=>`<div class="ac-q" data-i="${i}"><div class="qt"><b>${i+1}.</b>${q.q}</div><div class="ac-opts">${q.o.map((o,j)=>`<button class="ac-opt" data-j="${j}">${o}</button>`).join('')}</div></div>`).join('')}
   <div class="ac-cta"><button class="ac-btn" data-chk>შემოწმება</button></div><div class="ac-res"></div>`;
  box.querySelectorAll('.ac-q').forEach(qd=>{const q=Q[+qd.dataset.i];qd.querySelectorAll('.ac-opt').forEach(b=>b.onclick=()=>{if(box.dataset.done)return;q.sel=+b.dataset.j;qd.querySelectorAll('.ac-opt').forEach(x=>x.classList.toggle('sel',x===b));});});
  box.querySelector('[data-chk]').onclick=()=>{
    if(box.dataset.done){delete box.dataset.done;quiz(l);return;}
    if(Q.some(q=>q.sel==null)){box.querySelector('.ac-res').innerHTML='<span class="bad">უპასუხე ყველა კითხვას.</span>';return;}
    box.dataset.done='1';let s=0;
    box.querySelectorAll('.ac-q').forEach(qd=>{const q=Q[+qd.dataset.i],bs=qd.querySelectorAll('.ac-opt');const ok=q.o[q.sel]===q.a;if(ok)s++;
      bs.forEach((b,j)=>{if(q.o[j]===q.a)b.classList.add('ok');else if(j===q.sel)b.classList.add('bad');});});
    const need=Math.ceil(l.q.length*2/3),pass=s>=need,me=ME(),old=me.done[l.id];
    if(pass){const gain=Math.max(0,s-(old?old.s:0))*10;me.xp=(me.xp||0)+gain;if(!old||s>old.s)me.done[l.id]={s,t:Date.now()};save(DB);toast(gain?`+${gain} XP · ${esc(l.t)} ✓`:'✓ ჩათვლილია');}
    const nx=ALL[l.ix+1];
    box.querySelector('.ac-res').innerHTML=pass?`<span class="ok">✓ ${s} / ${l.q.length} — გაკვეთილი ჩათვლილია!</span>${nx?' შემდეგი: <b>'+esc(nx.t)+'</b>':' 🏆 ეს ბოლო გაკვეთილი იყო!'}`
      :`<span class="bad">${s} / ${l.q.length}</span> — გადახედე თემას და სცადე ხელახლა.`;
    box.querySelector('[data-chk]').textContent=pass&&nx?'↻ ხელახლა':'↻ ხელახლა ცდა';
    if(pass&&nx){const b=document.createElement('button');b.className='ac-btn';b.textContent='შემდეგი გაკვეთილი ›';b.onclick=()=>go('l='+nx.id);box.querySelector('.ac-cta').appendChild(b);}};}
function toast(t){const el=$q('.ac-toast');el.innerHTML=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2200);}

/* ── routing: #l=<id> lesson · #lab lab · '' path ── */
function go(h){if(('#'+h)===location.hash||(h===''&&!location.hash))route();else location.hash=h;}
function setMode(m){root.dataset.mode=m;labEls().forEach(el=>el.style.display=m==='lab'?'':'none');
  root.querySelectorAll('.ac-mode button').forEach(b=>b.classList.toggle('on',b.dataset.m===(m==='lab'?'lab':'path')));}
function route(){const h=decodeURIComponent(location.hash.slice(1));
  if(h.startsWith('l=')){const l=ALL.find(x=>x.id===h.slice(2));if(l){setMode('lesson');lesson(l);return;}}
  stopLesson();
  if(h==='lab'&&A.lab){setMode('lab');if(A.onLab)A.onLab();return;}
  if(A.lab&&h&&!h.startsWith('l=')&&A.labHash&&A.labHash(h)){setMode('lab');return;}
  setMode('path');hero();path();}
root.querySelectorAll('.ac-mode button').forEach(b=>b.onclick=()=>go(b.dataset.m==='lab'?'lab':''));
window.addEventListener('hashchange',route);
window.ACADEMY={go,lessons:ALL,reset:()=>{DB[A.subj]={done:{},xp:0};save(DB);route();}};
route();
})();
