/* hd_stats.js — Human Design · 📊 სტატისტიკა
   Self-injecting tab (after 🔎 ძებნა; needs hd_find.js, which exposes window.HDE).
   hd.html needs only, after hd_find.js:   <script src="hd_stats.js"></script>

   How often each chart feature occurs among birth moments of a period.
   Birth moments are sampled uniformly in time (stratified: one random moment
   in each of N equal slices, in time order), every sample is a full chart —
   13 personality + 13 design activations, computed in the browser exactly like
   the 🔎 search (same rules as hd_calc.py). It is the share of TIME, not of
   people: real birth rates per season / hour are not modelled.

   Shown: type · authority · strategy-free profile · cross angle · definition ·
   each center defined · number of defined centers · channels (36) · number of
   channels · gates (64) · digestion · environment · motivation · perspective ·
   sense · variable (4 arrows). With natal data filled in, your values are
   marked ◆ and their rarity is given.                                        */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const GOLD='#c9a84c';
let H=null,res=null,run=0,mine=null;

const TYPE_ORD=['Generator','Manifesting Generator','Projector','Manifestor','Reflector'];
const TYPE_KA={"Manifestor":"მანიფესტორი","Generator":"გენერატორი","Manifesting Generator":"მანიფესტირებადი გენერატორი","Projector":"პროექტორი","Reflector":"რეფლექტორი"};
const AUTH_ORD=['ემოციური (მზის წნული)','საკრალური','სპლენური (ელენთა)','ეგო (გული)','თვით-პროექცია (G)','მენტალური / გარემო','მთვარე'];
const DEF_ORD=['ერთი მთლიანი განსაზღვრება','გაყოფილი განსაზღვრება','სამად გაყოფილი განსაზღვრება','ოთხად გაყოფილი განსაზღვრება','განსაზღვრება არ არის'];
const PROF_ORD=['1/3','1/4','2/4','2/5','3/5','3/6','4/6','4/1','5/1','5/2','6/2','6/3'];
const PROF_KA={"1/3":"დამამკვიდრებელი","1/4":"მასწავლებელი","2/4":"ადვილი გენიოსი","2/5":"უნებლიე გმირი","3/5":"ექსპერიმენტატორი",
  "3/6":"ცოცხალი კონტრასტი","4/6":"სამეფო ავტორიტეტი","4/1":"ლაღი ცხოვრება","4/2":"მეგობრობის საფუძველი","5/1":"გამოწვევების გადამჭრელი",
  "5/2":"თვითმოტივირებული გმირი","6/2":"სანიმუშო ადამიანი","6/3":"პასუხისმგებელი მოგზაური"};
const CROSS=p=>p==='4/1'?'იუქსტაპოზიცია (ფიქსირებული)':(p[0]>='5'?'მარცხენა კუთხე (ტრანსპერსონალური)':'მარჯვენა კუთხე (პერსონალური)');
const CEN_KA={"Head":"თავი","Ajna":"აჯნა","Throat":"ყელი","G":"G · მე","Heart":"გული · ეგო","Solar Plexus":"მზის წნული","Spleen":"ელენთა","Sacral":"საკრალი","Root":"ფესვი"};
const CEN_ORD=['Head','Ajna','Throat','G','Heart','Solar Plexus','Spleen','Sacral','Root'];
const T6=a=>a.map(([b,l,r])=>[b+' — '+l,b+' — '+r]).flat();
const DIG=T6([['მადა','თანმიმდევრული','მონაცვლეობითი'],['გემო','ღია','დახურული'],['წყურვილი','ცხელი','ცივი'],['შეხება','მშვიდი','ნერვული'],['ხმა','მაღალი','დაბალი'],['სინათლე','პირდაპირი','ირიბი']]);
const ENV=T6([['მღვიმეები','შერჩევითი','შერწყმული'],['ბაზრები','შიდა','გარე'],['სამზარეულო','ნესტიანი','მშრალი'],['მთები','აქტიური','პასიური'],['ველები','ვიწრო','ფართო'],['სანაპირო','ბუნებრივი','ხელოვნური']]);
const MOT=T6([['შიში','კომუნალისტი','სეპარატისტი'],['იმედი','თეისტი','ანტითეისტი'],['სურვილი','ლიდერი','მიმდევარი'],['საჭიროება','ოსტატი','ახალბედა'],['დანაშაული','კონდიციონერი','კონდიცირებული'],['უდანაშაულობა','დამკვირვებელი','დაკვირვებული']]);
const PER=T6([['გადარჩენა','ფოკუსირებული','პერიფერიული'],['შესაძლებლობა','ფოკუსირებული','პერიფერიული'],['ძალა','ფოკუსირებული','პერიფერიული'],['სურვილი','ფოკუსირებული','პერიფერიული'],['ალბათობა','ფოკუსირებული','პერიფერიული'],['პირადი','ფოკუსირებული','პერიფერიული']]);
const SENSE=['ყნოსვა','გემო','გარეგანი ხედვა','შინაგანი ხედვა','გრძნობა','შეხება'];
const VAR_ORD=[];for(const a of 'LR')for(const b of 'LR')for(const c of 'LR')for(const d of 'LR')VAR_ORD.push(`P${a}${b} D${c}${d}`);

/* ── one full chart → features (rules = hd_calc.analyze) ── */
function acts(jd){
  const o={};for(const b of H.PLAN)o[b]=H.decomp(H.rawL(b,jd));
  o.Earth=H.decomp(H.rawL('Sun',jd)+180);const n=H.nodeL(jd);o['North Node']=H.decomp(n);o['South Node']=H.decomp(n+180);
  return o;
}
function features(jd){
  const P=acts(jd),D=acts(H.designJD(jd));
  const G=new Set([...Object.values(P),...Object.values(D)].map(a=>a.gate));
  const {C,adj}=H.centersOf(G),type=H.typeOf(G);
  const chans=H.CH.filter(([a,b])=>G.has(a)&&G.has(b)).map(c=>c.join('-'));
  let auth;
  if(C.has('Solar Plexus'))auth=AUTH_ORD[0];else if(C.has('Sacral'))auth=AUTH_ORD[1];else if(C.has('Spleen'))auth=AUTH_ORD[2];
  else if(C.has('Heart'))auth=AUTH_ORD[3];else if(C.has('G'))auth=AUTH_ORD[4];else if(type==='Reflector')auth=AUTH_ORD[6];else auth=AUTH_ORD[5];
  let groups=0;const un=new Set(C);while(un.size){groups++;const st=[un.values().next().value];while(st.length){const x=st.pop();if(!un.has(x))continue;un.delete(x);for(const m of adj[x])if(un.has(m))st.push(m);}}
  const def=groups===0?DEF_ORD[4]:groups<=4?DEF_ORD[groups-1]:groups+'-ჯერადი გაყოფა';
  const prof=P.Sun.line+'/'+D.Sun.line,ar=t=>t<=3?'L':'R',side=t=>t<=3?0:1;
  return {type,auth,def,prof,cross:CROSS(prof),centers:[...C],ncent:C.size,chans,nch:chans.length,gates:[...G],
    dig:DIG[(D.Sun.color-1)*2+side(D.Sun.tone)],env:ENV[(D['North Node'].color-1)*2+side(D['North Node'].tone)],
    mot:MOT[(P.Sun.color-1)*2+side(P.Sun.tone)],per:PER[(P['North Node'].color-1)*2+side(P['North Node'].tone)],
    sense:SENSE[D.Sun.tone-1],vari:`P${ar(P.Sun.tone)}${ar(P['North Node'].tone)} D${ar(D.Sun.tone)}${ar(D['North Node'].tone)}`};
}

/* ── tab ── */
function css(){const s=document.createElement('style');s.textContent=`
#form-stats .st-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
#form-stats .st-row button,#form-stats .st-row select{background:var(--raised,#1a1424);color:var(--ink-mid);border:1px solid var(--border);border-radius:14px;padding:4px 11px;font:inherit;font-size:.7rem;cursor:pointer}
#form-stats .st-row button.on{border-color:${GOLD};color:var(--gold-lt,#ecd59a);background:rgba(201,168,76,.1)}
#form-stats input[type=number]{width:90px;background:var(--raised,#1a1424);color:var(--ink,#eee);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font:inherit;font-size:.78rem}
#st-prog{height:6px;border-radius:3px;background:rgba(255,255,255,.06);overflow:hidden;margin:10px 0 4px}
#st-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#9a7028,${GOLD});transition:width .15s}
#st-msg{font-size:.72rem;color:var(--ink-mid);min-height:18px}
#results-stats{max-width:1180px;margin:0 auto 40px;padding:0 12px}
#results-stats .st-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:12px}
#results-stats .panel{padding:16px 18px}
#results-stats .st-head{font-size:.74rem;color:var(--ink-mid);margin:0 0 14px;line-height:1.7;text-align:center}
#results-stats .st-head b{color:var(--gold-lt,#ecd59a);font-weight:400}
.st-bars{display:flex;flex-direction:column;gap:5px}
.st-bar{display:grid;grid-template-columns:minmax(120px,42%) 1fr 52px;align-items:center;gap:8px;font-size:.72rem;color:var(--ink-mid);padding:1px 4px;border-radius:4px}
.st-bar:hover{background:rgba(255,255,255,.03)}
.st-bar .lb{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-bar .tr{height:9px;background:rgba(255,255,255,.04);border-radius:2px;position:relative}
.st-bar .tr i{position:absolute;left:0;top:0;bottom:0;background:${GOLD};opacity:.75;border-radius:0 4px 4px 0;min-width:1px}
.st-bar .pc{text-align:right;color:var(--ink,#eee);font-variant-numeric:tabular-nums}
.st-bar.me{box-shadow:inset 0 0 0 1px ${GOLD}}
.st-bar.me .lb{color:var(--gold-lt,#ecd59a)}
.st-bar.me .lb::before{content:'◆ ';color:${GOLD}}
.st-gates{display:grid;grid-template-columns:repeat(8,1fr);gap:3px}
.st-gates div{border-radius:3px;padding:4px 2px;text-align:center;font-size:.62rem;color:var(--ink);border:1px solid transparent;font-variant-numeric:tabular-nums}
.st-gates div b{display:block;font-size:.72rem;font-weight:500}
.st-gates div.me{border-color:${GOLD}}
.st-mine{font-size:.74rem;color:var(--ink-mid);line-height:1.8}
.st-mine b{color:var(--gold-lt,#ecd59a);font-weight:400}
.st-note{font-size:.66rem;color:var(--ink-dim);margin-top:8px;line-height:1.6}`;document.head.appendChild(s);}

const PRESETS=[[1900,2100],[1950,2050],[1800,2200],[1000,3000],[0,4000]];
let yA=1900,yB=2100;
function inject(){
  if($('st-tab-btn'))return true;
  const bar=document.querySelector('.tab-bar'),shell=document.querySelector('.form-shell');
  if(!bar||!shell||!$('hf-tab-btn')||!window.HDE)return false;
  H=window.HDE;css();
  const tb=document.createElement('button');tb.className='tab-btn';tb.id='st-tab-btn';tb.textContent='📊 სტატისტიკა';tb.onclick=activate;bar.appendChild(tb);
  const f=document.createElement('div');f.id='form-stats';f.className='form-section';
  f.innerHTML=`
    <div class="person-label" style="color:${GOLD}">📊 რა სიხშირით გვხვდება — ტიპი, ავტორიტეტი, პროფილი, ცენტრები, არხები, კარიბჭეები, ცვლადები</div>
    <div class="st-row" id="st-pre">${PRESETS.map(([a,b],i)=>`<button type="button" data-i="${i}" class="${i?'':'on'}">${a}–${b}</button>`).join('')}</div>
    <div class="st-row"><label style="font-size:.7rem;color:var(--ink-mid)">წლიდან</label><input type="number" id="st-a" value="1900" min="0" max="4000">
      <label style="font-size:.7rem;color:var(--ink-mid)">წლამდე</label><input type="number" id="st-b" value="2100" min="0" max="4000">
      <label style="font-size:.7rem;color:var(--ink-mid)">რუქების რაოდენობა</label>
      <select id="st-n"><option value="2000">2 000 · სწრაფი</option><option value="5000" selected>5 000</option><option value="20000">20 000 · ზუსტი</option><option value="50000">50 000</option></select></div>
    <button type="button" class="btn-calc" id="st-go">📊 სტატისტიკის გამოთვლა</button>
    <div id="st-prog"><i></i></div><div id="st-msg"></div>
    <div class="st-note">თითოეული შემთხვევითი დაბადების მომენტისთვის ითვლება სრული რუქა (13 + 13 აქტივაცია) — იგივე წესებით, რაც ნატალურ რუქაში.
      ეს არის <b>დროის</b> წილი და არა ადამიანების: შობადობა სეზონებისა და საათების მიხედვით არ ითვალისწინება. წლები 0–4000 (პლუტონის ზუსტი მოდელი).
      თუ „ნატალური“ ჩანართი შევსებულია, შენი მნიშვნელობები ◆-ით მოინიშნება.</div>`;
  shell.appendChild(f);
  const sec=document.createElement('section');sec.id='results-stats';sec.className='hidden';
  const anchor=$('results-transit')||$('results-synastry');(anchor&&anchor.parentNode?anchor.parentNode:document.body).insertBefore(sec,anchor?anchor.nextSibling:null);
  $('st-pre').querySelectorAll('button').forEach(b=>b.onclick=()=>{const [a,c]=PRESETS[+b.dataset.i];$('st-a').value=a;$('st-b').value=c;
    $('st-pre').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));});
  ['st-a','st-b'].forEach(id=>$(id).addEventListener('input',()=>$('st-pre').querySelectorAll('button').forEach(x=>x.classList.remove('on'))));
  $('st-go').onclick=compute;
  /* leave this tab cleanly when another one is chosen */
  const off=()=>{tb.classList.remove('active');f.classList.remove('active');sec.classList.add('hidden');};
  if(typeof setMode==='function'&&!setMode._st){const o=window.setMode||setMode;const w=function(m){o(m);off();};w._st=true;w._hf=o._hf;w._tr=o._tr;window.setMode=w;}
  ['tr-tab-btn','hf-tab-btn'].forEach(id=>{const b=$(id);if(b)b.addEventListener('click',off);});
  return true;
}
function activate(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));$('st-tab-btn').classList.add('active');
  document.querySelectorAll('.form-section').forEach(s=>s.classList.remove('active'));$('form-stats').classList.add('active');
  ['results-natal','results-synastry','results-transit'].forEach(id=>{const e=$(id);if(e)e.classList.add('hidden');});
  if(res)$('results-stats').classList.remove('hidden');
  try{currentMode='stats';}catch(e){}
  const st=$('status');if(st)st.textContent='';
}

/* ── run ── */
const tick=()=>new Promise(r=>setTimeout(r,0));
function myChart(){
  if(!($('n-lat')&&$('n-lat').value))return null;
  const g=id=>+$('n-'+id).value;
  try{return features(H.localToJD(g('year'),g('month'),g('day'),g('hour'),g('minute'),$('n-tz').value||'UTC'));}catch(e){return null;}
}
async function compute(){
  const btn=$('st-go'),msg=$('st-msg'),bar=$('st-prog').firstElementChild,tok=++run;
  let a=Math.round(+$('st-a').value),b=Math.round(+$('st-b').value);if(a>b)[a,b]=[b,a];
  if(!(a>=0&&b<=4000)){msg.textContent='წლები უნდა იყოს 0–4000 შუალედში.';return;}
  const N=+$('st-n').value;
  btn.disabled=true;btn.textContent='⏳ ითვლება…';
  try{
    await H.init();
    const j0=H.calJD(a,1,1,0),j1=H.calJD(b,12,31,24),w=(j1-j0)/N;
    const R={combo:{},n:0,type:{},auth:{},def:{},prof:{},cross:{},cent:{},ncent:{},chan:{},nch:{},gate:{},dig:{},env:{},mot:{},per:{},sense:{},vari:{}};
    const inc=(o,k)=>{o[k]=(o[k]||0)+1;};
    let t0=performance.now();
    for(let i=0;i<N;i++){
      const F=features(j0+(i+Math.random())*w);
      R.n++;inc(R.type,F.type);inc(R.auth,F.auth);inc(R.def,F.def);inc(R.prof,F.prof);inc(R.cross,F.cross);
      F.centers.forEach(c=>inc(R.cent,c));inc(R.ncent,F.ncent);F.chans.forEach(c=>inc(R.chan,c));inc(R.nch,F.nch);
      F.gates.forEach(g=>inc(R.gate,g));inc(R.dig,F.dig);inc(R.env,F.env);inc(R.mot,F.mot);inc(R.per,F.per);inc(R.sense,F.sense);inc(R.vari,F.vari);inc(R.combo,F.type+'|'+F.auth+'|'+F.prof);
      if(performance.now()-t0>60){bar.style.width=(100*i/N)+'%';msg.textContent=`${i.toLocaleString()} / ${N.toLocaleString()} რუქა`;
        await tick();t0=performance.now();if(tok!==run)return;}
    }
    bar.style.width='100%';msg.textContent=`${N.toLocaleString()} რუქა · ${a}–${b}`;
    res=R;res.a=a;res.b=b;mine=myChart();render();
    $('results-stats').classList.remove('hidden');$('results-stats').scrollIntoView({behavior:'smooth',block:'start'});
  }catch(e){msg.textContent='შეცდომა: '+e.message;}
  finally{if(tok===run){btn.disabled=false;btn.textContent='📊 სტატისტიკის გამოთვლა';}}
}

/* ── render ── */
const pc=(k,n)=>n?100*k/n:0;
const fp=x=>x>=10?x.toFixed(1):x>=1?x.toFixed(2):x>0?x.toFixed(3):'0';
function bars(obj,order,label,isMine,sort){
  const n=res.n;let keys=order||Object.keys(obj);
  if(sort)keys=[...keys].sort((x,y)=>(obj[y]||0)-(obj[x]||0));
  const mx=Math.max(1,...keys.map(k=>obj[k]||0));
  return `<div class="st-bars">${keys.map(k=>{const c=obj[k]||0,p=pc(c,n),me=isMine&&isMine(k);
    return `<div class="st-bar${me?' me':''}" title="${(label?label(k):k).replace(/"/g,'')} — ${c.toLocaleString()} / ${n.toLocaleString()} = ${fp(p)}%">
      <span class="lb">${label?label(k):k}</span><span class="tr"><i style="width:${100*c/mx}%"></i></span><span class="pc">${fp(p)}%</span></div>`;}).join('')}</div>`;
}
const panel=(t,sub,body)=>`<div class="panel"><h2>${t}${sub?` <small>${sub}</small>`:''}</h2>${body}</div>`;
function rarity(label,val,count){const p=pc(count||0,res.n);
  return `${label}: <b>${val}</b> — ${fp(p)}%${p<2?' · ძალიან იშვიათი':p<8?' · იშვიათი':p>35?' · ძალიან ხშირი':''}`;}
function render(){
  const R=res,n=R.n,M=mine,err=(196*Math.sqrt(.25/n)).toFixed(1);
  const chName=k=>{const [a,b]=k.split('-').map(Number);const C=(typeof CHANNELS!=='undefined'?CHANNELS:[]).find(c=>c[0]===a&&c[1]===b);return `${a}–${b}${C?' '+C[2]:''}`;};
  const maxG=Math.max(...Object.values(R.gate)),minG=Math.min(...Array.from({length:64},(_,i)=>R.gate[i+1]||0));
  const gates=Array.from({length:64},(_,i)=>i+1).map(g=>{const c=R.gate[g]||0,t=c/Math.max(1,maxG);
    return `<div class="${M&&M.gates.includes(g)?'me':''}" style="background:rgba(201,168,76,${(.08+.55*t).toFixed(2)})" title="კარიბჭე ${g} — ${fp(pc(c,n))}% რუქაში">
      <b>${g}</b>${fp(pc(c,n))}%</div>`;}).join('');
  const nums=(o,max)=>Array.from({length:max+1},(_,i)=>String(i)).filter(k=>o[k]||+k<=max);
  const maxCh=Math.max(...Object.keys(R.nch).map(Number));
  let mineHtml='';
  if(M){
    const cmb=R.combo[M.type+'|'+M.auth+'|'+M.prof]||0;
    mineHtml=panel('◆ შენი რუქა','რამდენად იშვიათია',`<div class="st-mine">
      ${rarity('ტიპი',TYPE_KA[M.type],R.type[M.type])}<br>${rarity('ავტორიტეტი',M.auth,R.auth[M.auth])}<br>${rarity('პროფილი',M.prof,R.prof[M.prof])}<br>
      ${rarity('განსაზღვრება',M.def,R.def[M.def])}<br>${rarity('საკვები',M.dig,R.dig[M.dig])}<br>${rarity('გარემო',M.env,R.env[M.env])}<br>
      ${rarity('ცვლადი',M.vari,R.vari[M.vari])}<br>
      განსაზღვრული ცენტრები: <b>${M.ncent}</b> (${fp(pc(R.ncent[M.ncent]||0,n))}%) · არხები: <b>${M.nch}</b> (${fp(pc(R.nch[M.nch]||0,n))}%)<br>
      ტიპი + ავტორიტეტი + პროფილი ერთად: <b>${fp(pc(cmb,n))}%</b> ${cmb?`(${cmb.toLocaleString()} რუქა ${n.toLocaleString()}-დან)`:'— ამ შერჩევაში არცერთი, ანუ < '+fp(100/n)+'%'}</div>`);
  }
  $('results-stats').innerHTML=`
    <div class="st-head">📊 <b>${n.toLocaleString()}</b> შემთხვევითი დაბადების მომენტი · <b>${R.a}–${R.b}</b> · სტატისტიკური ცდომილება ≤ ±${err}%</div>
    <div class="st-grid">
      ${mineHtml}
      ${panel('ტიპი','',bars(R.type,TYPE_ORD,k=>TYPE_KA[k],M&&(k=>k===M.type)))}
      ${panel('ავტორიტეტი','',bars(R.auth,AUTH_ORD,null,M&&(k=>k===M.auth)))}
      ${panel('პროფილი','',bars(R.prof,PROF_ORD,k=>k+' · '+PROF_KA[k],M&&(k=>k===M.prof)))}
      ${panel('ინკარნაციის ჯვრის კუთხე','',bars(R.cross,null,null,M&&(k=>k===M.cross),true))}
      ${panel('განსაზღვრება','',bars(R.def,null,null,M&&(k=>k===M.def),true))}
      ${panel('განსაზღვრული ცენტრი','% რუქებში',bars(R.cent,CEN_ORD,k=>CEN_KA[k],M&&(k=>M.centers.includes(k))))}
      ${panel('განსაზღვრული ცენტრების რაოდენობა','',bars(R.ncent,nums(R.ncent,9),k=>k+' ცენტრი',M&&(k=>+k===M.ncent)))}
      ${panel('არხების რაოდენობა','',bars(R.nch,nums(R.nch,maxCh),k=>k+' არხი',M&&(k=>+k===M.nch)))}
      ${panel('არხები (36)','% რუქებში · კლებადობით',bars(R.chan,H.CH.map(c=>c.join('-')),chName,M&&(k=>M.chans.includes(k)),true))}
      ${panel('საკვები (დაიჯესტია)','დიზაინის ☉ ფერი + ისარი',bars(R.dig,DIG,null,M&&(k=>k===M.dig)))}
      ${panel('გარემო','დიზაინის ☊ ფერი + ისარი',bars(R.env,ENV,null,M&&(k=>k===M.env)))}
      ${panel('მოტივაცია','პიროვნების ☉ ფერი + ისარი',bars(R.mot,MOT,null,M&&(k=>k===M.mot)))}
      ${panel('პერსპექტივა','პიროვნების ☊ ფერი + ისარი',bars(R.per,PER,null,M&&(k=>k===M.per)))}
      ${panel('გრძნობა (Sense)','დიზაინის ☉ ტონი',bars(R.sense,SENSE,null,M&&(k=>k===M.sense)))}
      ${panel('ცვლადი (4 ისარი)','P ☉☊ · D ☉☊ · L მარცხ. / R მარჯვ.',bars(R.vari,VAR_ORD,null,M&&(k=>k===M.vari),true))}
    </div>
    <div class="panel" style="margin-top:12px">${`<h2>კარიბჭეები (64) <small>რა წილ რუქაშია ჩართული · სიკაშკაშე ∝ სიხშირე${M?' · ოქროს ჩარჩო — შენი კარიბჭე':''}</small></h2>`}<div class="st-gates">${gates}</div></div>`;
}

let tries=0;(function wait(){if(inject()||++tries>150)return;setTimeout(wait,100);})();
})();
