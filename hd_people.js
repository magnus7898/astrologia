/* ============================================================
   hd_people.js — Human Design · „ჩემი ადამიანები“
   ------------------------------------------------------------
   Your chart + up to 10 difficult and 10 good people, computed in
   the browser with the 🔎 engine (window.HDE from hd_find.js, same
   rules as hd_calc.py). Without a time a person is taken at 12:00
   (Moon and some gates may differ — marked ≈).

   What repeats in each group, against random birth moments from
   the same years:
     • their type / authority / profile
     • conditioning — they define a center that is OPEN in you
     • electromagnetic — you hold one gate of a channel, they the
       other (attraction and friction)
     • compromise — they have the whole channel, you one gate of it
       (you tend to give in there)
     • dominance — they have a channel you have no gate of
   hd.html needs, after hd_find.js:
       <script src="people_core.js"></script><script src="hd_people.js"></script>
   ============================================================ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
let H=null;
const TYPE_KA={"Manifestor":"მანიფესტორი","Generator":"გენერატორი","Manifesting Generator":"მანიფესტირებადი გენერატორი","Projector":"პროექტორი","Reflector":"რეფლექტორი"};
const CEN_KA={"Head":"თავი","Ajna":"აჯნა","Throat":"ყელი","G":"G · მე","Heart":"გული · ეგო","Solar Plexus":"მზის წნული","Spleen":"ელენთა","Sacral":"საკრალი","Root":"ფესვი"};
const CEN_OPEN={"Head":"ზეწოლა იფიქრო მათ კითხვებზე","Ajna":"მათი აზრის/დარწმუნებულობის მიღება","Throat":"ლაპარაკის, ყურადღების მოთხოვნილება",
  "G":"მიმართულება და იდენტობა მათგან","Heart":"დამტკიცების სურვილი, დაპირებები","Solar Plexus":"მათი ემოციების გაძლიერება შენში",
  "Spleen":"მათზე მიჯაჭვულობა უსაფრთხოებისთვის","Sacral":"ზედმეტად მუშაობა, „არ“-ის თქმის უუნარობა","Root":"აჩქარება, სტრესი"};
const AUTH=['ემოციური (მზის წნული)','საკრალური','სპლენური (ელენთა)','ეგო (გული)','თვით-პროექცია (G)','მენტალური / გარემო','მთვარე'];

/* ── one chart (rules = hd_stats.features / hd_calc.analyze) ── */
function acts(jd){
  const o={};for(const b of H.PLAN)o[b]=H.decomp(H.rawL(b,jd));
  o.Earth=H.decomp(H.rawL('Sun',jd)+180);const n=H.nodeL(jd);o['North Node']=H.decomp(n);o['South Node']=H.decomp(n+180);
  return o;
}
function chart(jd){
  const P=acts(jd),D=acts(H.designJD(jd));
  const G=new Set([...Object.values(P),...Object.values(D)].map(a=>a.gate));
  const {C}=H.centersOf(G),type=H.typeOf(G);
  const chans=H.CH.filter(([a,b])=>G.has(a)&&G.has(b)).map(c=>c.join('-'));
  let auth;
  if(C.has('Solar Plexus'))auth=AUTH[0];else if(C.has('Sacral'))auth=AUTH[1];else if(C.has('Spleen'))auth=AUTH[2];
  else if(C.has('Heart'))auth=AUTH[3];else if(C.has('G'))auth=AUTH[4];else if(type==='Reflector')auth=AUTH[6];else auth=AUTH[5];
  return{type,auth,prof:P.Sun.line+'/'+D.Sun.line,C,G,chans:new Set(chans)};
}
const chLbl=k=>{const [a,b]=k.split('-').map(Number);
  const nm=(typeof CHANNELS!=='undefined'?CHANNELS:[]).find(c=>(c[0]===a&&c[1]===b)||(c[0]===b&&c[1]===a));
  return `${a}–${b}${nm&&nm[2]?' '+nm[2]:''} <span class="pq-dim">(${CEN_KA[H.G2C[a]]}–${CEN_KA[H.G2C[b]]})</span>`;};

/* features between me (M) and a person (X) */
function relation(M,X){
  const f=new Set();
  f.add('type|'+X.type);f.add('auth|'+X.auth);f.add('prof|'+X.prof);
  for(const c of X.C)if(!M.C.has(c))f.add('cond|'+c);
  for(const [a,b] of H.CH){
    const k=a+'-'+b,mA=M.G.has(a),mB=M.G.has(b),xA=X.G.has(a),xB=X.G.has(b);
    const mFull=mA&&mB,xFull=xA&&xB;
    if(!mFull&&!xFull&&((mA&&xB&&!mB&&!xA)||(mB&&xA&&!mA&&!xB)))f.add('em|'+k);
    else if(xFull&&!mFull&&(mA||mB))f.add('cmp|'+k);
    else if(xFull&&!mA&&!mB)f.add('dom|'+k);
    else if(xFull&&mFull)f.add('fr|'+k);
  }
  return f;
}
const KIND={type:['ტიპი','neu'],auth:['ავტორიტეტი','neu'],prof:['პროფილი','neu'],cond:['განსაზღვრავს შენს ღია ცენტრს','trig'],
  em:['ელექტრომაგნიტი','mir'],cmp:['კომპრომისი','trig'],dom:['დომინირება','neu'],fr:['მეგობრობა','res']};
const label=k=>{const [t,v]=k.split('|');const K=KIND[t];
  const val=t==='type'?TYPE_KA[v]||v:t==='cond'?CEN_KA[v]:t==='prof'?v:t==='auth'?v:chLbl(v);
  return `<span class="pq-tag ${K[1]}">${K[0]}</span> ${val}`;};
const MEAN={cond:'ისინი შენს ღია ცენტრს „ავსებენ“ — ის, რასაც მათთან განიცდი, მათი ენერგიაა, შენ კი გაძლიერებულად გრძნობ',
  em:'შენ ერთი კარიბჭე გაქვს, მათ მეორე — ერთად არხი იხურება: ძლიერი მიზიდულობა და ხახუნი',
  cmp:'მათ მთელი არხი აქვთ, შენ ერთი კარიბჭე — ამ თემაში მათ ემორჩილები',
  dom:'მათ აქვთ არხი, რომლის კარიბჭეც შენ არ გაქვს — ამ თემაში ისინი გიძღვებიან',
  fr:'ორივეს ერთი და იგივე არხი გაქვთ — ამ თემაში ერთმანეთს ეთანხმებით'};

function zoneTz(){const v=$('n-tz')&&$('n-tz').value;return v&&v!=='UTC'?v:H.TZ();}

async function onRun(me,people){
  if(!window.HDE)throw new Error('hd_find.js ვერ ჩაიტვირთა');
  H=window.HDE;await H.init();
  const tz=zoneTz();
  const M=chart(H.localToJD(me.y,me.m,me.d,me.h,me.mi,tz));
  for(const p of people){p.X=chart(H.localToJD(p.y,p.m,p.d,p.h,p.mi,tz));p.F=relation(M,p.X);}

  /* chance level: random moments from the same years */
  const ys=people.map(p=>p.y),y0=Math.min(...ys)-1,y1=Math.max(...ys)+1;
  const j0=H.calJD(y0,1,1,0),j1=H.calJD(y1,12,31,24);
  let seed=(y0*7919+y1)>>>0;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const cnt=new Map(),N=600;
  for(let i=0;i<N;i++){for(const k of relation(M,chart(j0+rnd()*(j1-j0))))cnt.set(k,(cnt.get(k)||0)+1);
    if(i%100===99)await new Promise(r=>setTimeout(r,0));}
  const base=k=>Math.max(cnt.get(k)||0,0.5)/N;
  const st=PeopleUI.groupStats(people,p=>p.F,base);
  const only=(s,pre)=>({...s,rows:s.rows.filter(r=>pre.some(x=>r.k.startsWith(x+'|')))});

  /* summary */
  const sent=(r,w)=>{const t=r.k.split('|')[0],c=w==='bad'?r.b:r.g,n=w==='bad'?st.B.length:st.G.length,l=w==='bad'?r.bl:r.gl;
    let extra='';if(t==='cond')extra=` შენთვის: ${CEN_OPEN[r.k.split('|')[1]]}.`;
    return `<p>${label(r.k)} — <b>${c}/${n}</b>, ჩვეულებრივზე ${l.toFixed(1)}×.${MEAN[t]?`<br><span class="pq-note">${MEAN[t]}.${extra}</span>`:''}</p>`;};
  let sum=`<p class="pq-note">შენ: ${TYPE_KA[M.type]||M.type} · ${M.auth} · ${M.prof}<br>
    განსაზღვრული ცენტრები: ${[...M.C].map(c=>CEN_KA[c]).join(', ')||'—'} · ღია: ${Object.keys(CEN_KA).filter(c=>!M.C.has(c)).map(c=>CEN_KA[c]).join(', ')||'—'}
    ${me.timeKnown?'':'<br>⚠ შენი დრო უცნობია — 12:00 აღებულია, შედეგი მიახლოებითია.'}</p>`;
  for(const w of ['bad','good']){
    const n=w==='bad'?st.B.length:st.G.length;if(!n)continue;
    const t=(w==='bad'?st.topBad:st.topGood).slice(0,6);
    sum+=`<div class="pq-gh ${w}">${w==='bad'?'✕ რთული':'✓ კარგი'} ადამიანები (${n}) — მეორდება</div>`+(t.length?t.map(r=>sent(r,w)).join(''):PeopleUI.fewNote(n));
  }

  /* per person */
  const pcard=p=>{
    const F=[...p.F],pick=t=>F.filter(k=>k.startsWith(t+'|')).map(k=>k.split('|')[1]);
    const cond=pick('cond'),em=pick('em'),cmp=pick('cmp'),fr=pick('fr');
    return `<div class="pq-pc"><div class="hd"><span><span class="pq-dot" style="background:${p.g==='bad'?'#e06b6b':'#4ea38c'}"></span><b>${PeopleUI.esc(p.name)}</b>
      <span class="pq-dim"> ${PeopleUI.pdate(p)}${p.timeKnown?'':' ≈'}</span></span>
      <span style="font-size:12px">${TYPE_KA[p.X.type]||p.X.type} · ${p.X.prof}</span></div>
      <div class="ln"><span class="pq-dim">${p.X.auth}</span><br>
      ${cond.length?`<span class="pq-tag trig">ავსებს შენს ღია</span> ${cond.map(c=>CEN_KA[c]).join(', ')}<br>`:''}
      ${em.length?`<span class="pq-tag mir">ელექტრომაგნიტი</span> ${em.join(', ')}<br>`:''}
      ${cmp.length?`<span class="pq-tag trig">კომპრომისი</span> ${cmp.join(', ')}<br>`:''}
      ${fr.length?`<span class="pq-tag res">მეგობრობა</span> ${fr.join(', ')}`:''}</div></div>`;
  };
  const C=PeopleUI.card;
  return C('რას აჩვენებს',sum)+
    C('ღია ცენტრები, რომლებსაც ავსებენ',PeopleUI.groupTable(only(st,['cond']),label,null,'ცენტრი'))+
    C('არხები შენსა და მათ შორის',PeopleUI.groupTable(only(st,['em','cmp','fr']),label,null,'არხი')+
      `<p class="pq-note" style="margin-top:8px"><span class="pq-tag mir">ელექტრომაგნიტი</span> მიზიდულობა + ხახუნი · <span class="pq-tag trig">კომპრომისი</span> შენ თმობ · <span class="pq-tag res">მეგობრობა</span> ერთნაირი არხი.
       „ჩვეულებრივ“ — იმავე წლებში დაბადებულ ${N} შემთხვევით რუქასთან.</p>`)+
    C('ტიპი, ავტორიტეტი, პროფილი',PeopleUI.groupTable(only(st,['type','auth','prof']),label,null,''))+
    C('თითოეული ადამიანი',[...st.B,...st.G].map(pcard).join(''));
}

/* ── tab ── */
function inject(){
  if($('pp-tab-btn'))return true;
  const bar=document.querySelector('.tab-bar'),shell=document.querySelector('.form-shell');
  if(!bar||!shell||!window.HDE||!window.PeopleUI)return false;
  /* the tab bar was one centred row: on a phone the first tabs were pushed off-screen to the left */
  const fx=document.createElement('style');fx.textContent='.tab-bar{flex-wrap:wrap}';document.head.appendChild(fx);
  const tb=document.createElement('button');tb.className='tab-btn';tb.id='pp-tab-btn';tb.textContent='ჩემი ადამიანები';tb.onclick=activate;
  const syn=[...bar.querySelectorAll('.tab-btn')].find(b=>(b.getAttribute('onclick')||'').includes("'synastry'"));
  if(syn&&syn.nextSibling)bar.insertBefore(tb,syn.nextSibling);else bar.appendChild(tb);
  const f=document.createElement('div');f.id='form-people';f.className='form-section';shell.appendChild(f);
  PeopleUI.mount(f,{key:'hd_people_v1',time:true,onRun,
    intro:`შეიყვანე ადამიანები, ვისთანაც გიჭირს, და ვისთანაც კარგად ხარ (თითოეულში მაქს. ${PeopleUI.MAX}). დრო თუ არ იცი — დატოვე ცარიელი (12:00, მიახლოებით).
      ჩანს, <b>რომელ ღია ცენტრს გივსებენ</b>, რომელი <b>არხები</b> იკვრება შენსა და მათ შორის, და რა <b>ტიპი/პროფილი</b> მეორდება — ჩვეულებრივთან შედარებით.
      დროის სარტყელი — ნატალური ჩანართის ქალაქიდან. სია მხოლოდ ამ ბრაუზერში ინახება.`,
    meDefault:()=>{const v=id=>$(id)&&$(id).value;if(!v('n-day'))return null;
      return{d:v('n-day'),m:v('n-month'),y:v('n-year'),t:`${String(v('n-hour')||12).padStart(2,'0')}:${String(v('n-minute')||0).padStart(2,'0')}`};}});
  return true;
}
function activate(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));$('pp-tab-btn').classList.add('active');
  document.querySelectorAll('.form-section').forEach(s=>s.classList.remove('active'));$('form-people').classList.add('active');
  ['results-natal','results-synastry','results-transit','results-stats'].forEach(id=>{const e=$(id);if(e)e.classList.add('hidden');});
  try{currentMode='people';}catch(e){}
  const st=$('status');if(st)st.textContent='';
}
let tries=0;(function wait(){if(inject()||++tries>100)return;setTimeout(wait,100);})();
})();
