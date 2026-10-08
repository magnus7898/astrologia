/* chartpanels.js — page layout + side panels of the natal chart (astro.html)
   Self-injecting add-on. In astro.html, after the other add-ons:
       <script src="chartpanels.js"></script>
   Layout (wide screens):
     [ moon day ] [ almuten figuris ] [ doryphory & charioteer ]   ← natal only
     [ orb controller ]
     [ wheel ]                [ aspect filter · aspects ]
     [ planets ] [ houses ] [ fixed stars ]
     [ dominants ] [ big three / portrait ] [ elements / balance ]
     [ Cinderella ] [ hard periods ]
     [ true sky   ] [ sky poster   ]
   Narrower screens fold the same blocks into 2 columns, phones into 1.
   LEFT  — balance: elements, modalities, yang/yin, hemispheres
   RIGHT — portrait: big three, chart ruler, Moon phase, aspect balance,
           retrograde planets, stelliums
   Weights: ☉ ☽ AC = 3 · ☿ ♀ ♂ = 2 · ♃ ♄ = 1.5 · ♅ ♆ ♇ = 1 · MC = 1      */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const EL=[{k:'fire',ka:'ცეცხლი',c:'#e0603a',ic:'🜂'},{k:'earth',ka:'მიწა',c:'#8aab6e',ic:'🜃'},
          {k:'air',ka:'ჰაერი',c:'#d8c070',ic:'🜁'},{k:'water',ka:'წყალი',c:'#5b8ec4',ic:'🜄'}];
const MOD=[{ka:'კარდინალური',c:'#c084fc'},{ka:'ფიქსირებული',c:'#f0c060'},{ka:'მუტაბელური',c:'#60c8d0'}];
const W={'მზე':3,'მთვარე':3,'მერკური':2,'ვენერა':2,'მარსი':2,'იუპიტერი':1.5,'სატურნი':1.5,
         'ურანი':1,'ნეპტუნი':1,'პლუტონი':1,'AC':3,'MC':1};
const REAL=['მზე','მთვარე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი','პლუტონი'];
const RULER=['მარსი','ვენერა','მერკური','მთვარე','მზე','მერკური','ვენერა','პლუტონი','იუპიტერი','სატურნი','ურანი','ნეპტუნი'];
const RULER_TRAD={7:'მარსი',10:'სატურნი',11:'იუპიტერი'};
const HARM=new Set(['ტრინი','სექსტილი']),TENSE=new Set(['კვადრატი','ოპოზიცია','კვინკონსი']);

function css(){
  if($('cp-css'))return;
  const s=document.createElement('style');s.id='cp-css';s.textContent=`
#side-panels{display:none}
#chart-area>.sec-title.lay-hide,#chart-area>.tables-wrap{display:none!important}
.lay{display:grid;gap:16px;margin:16px 0 18px;width:100%}
.lay .data-card,.lay .cp{margin:0!important;overflow-x:auto}
@media(min-width:1000px){#chart-area .lay{width:min(1640px,calc(100vw - 40px));position:relative;left:50%;transform:translateX(-50%)}}
/* 0 — top strip */
#lay-strip{grid-template-columns:1fr;align-items:stretch;margin-bottom:10px}
@media(min-width:900px){#lay-strip.nat{grid-template-columns:1fr 1fr}#lay-strip.nat>#lunar-badge{grid-column:1/-1}}
@media(min-width:1200px){#lay-strip.nat{grid-template-columns:.55fr 1.3fr 1fr}#lay-strip.nat>#lunar-badge{grid-column:auto;flex-direction:column}}
#lay-strip>#lunar-badge{margin:0!important;display:flex!important;align-items:center;justify-content:center;flex-wrap:wrap;gap:4px}
#lay-strip>#lunar-badge[style*="display: none"],#lay-strip>#lunar-badge[style*="display:none"]{display:none!important}
#lay-orb{margin:0 0 14px}
@media(min-width:1000px){#chart-area #lay-orb{width:min(1640px,calc(100vw - 40px));position:relative;left:50%;transform:translateX(-50%)}}
#lay-orb #orb-panel{margin:0}
.nx-win{font-size:13px;color:#e8e0ff;margin:-2px 0 8px}
.nx-win b{color:#f0d080;font-weight:500;font-size:15px}
.nx-win span{font-size:11px;color:rgba(200,190,230,.65);margin-left:6px}
.nx-t{width:100%;border-collapse:collapse;font-size:10.5px;text-align:center}
.nx-t th{font-weight:400;color:rgba(200,190,230,.6);font-size:10px;padding:2px 3px;line-height:1.25}
.nx-t td{padding:2px 3px;border-top:1px solid rgba(45,31,110,.35);color:#c8c0e8}
.nx-t tr.top td{color:#f0d080;background:rgba(201,168,76,.08)}
.nx-sb{padding:6px 0 8px;border-bottom:1px solid rgba(45,31,110,.35)}
.nx-sb:last-child{border-bottom:none}
.nx-sb .l{font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;color:rgba(201,168,76,.85);text-transform:uppercase}
.nx-sb .l small{font-family:'Noto Sans Georgian',sans-serif;letter-spacing:0;text-transform:none;color:rgba(200,190,230,.5);margin-left:6px;font-size:9.5px}
.nx-sb .p{font-size:13px;color:#e8e0ff;margin-top:3px}
.nx-sb .p b{color:#f0d080;font-weight:500}
.nx-sb .p span{font-size:10.5px;color:rgba(200,190,230,.6);margin-left:6px}
/* 1 — wheel left · aspect controls + aspect list right */
#lay-top{grid-template-columns:1fr;align-items:start;margin-top:0}
#lay-top>#wheel-wrap{max-width:820px;width:100%;justify-self:center}
#lay-asp{display:flex;flex-direction:column;gap:12px;min-width:0}
#lay-asp>#asp-filters,#lay-asp>#lunar-badge{margin:0!important}
#lay-asp #orb-panel{margin:0}
@media(min-width:1200px){
  #lay-top{grid-template-columns:minmax(560px,1.12fr) minmax(440px,1fr)}
  #lay-top>#wheel-wrap{justify-self:stretch;max-width:none}
}
/* 2 — planets · houses · fixed stars */
#lay-mid{grid-template-columns:1fr;align-items:start}
@media(min-width:800px){#lay-mid{grid-template-columns:1fr 1fr}#lay-mid.has-fs>#fs-card{grid-column:1/-1}}
@media(min-width:1300px){#lay-mid.has-fs{grid-template-columns:1.1fr .8fr 1.2fr}#lay-mid.has-fs>#fs-card{grid-column:auto}}
/* 3 — dominants · big three/portrait · elements/balance */
#lay-info{grid-template-columns:1fr;align-items:start}
@media(min-width:800px){#lay-info{grid-template-columns:1fr 1fr}#lay-info>#dominants-card{grid-column:1/-1}}
@media(min-width:1300px){#lay-info{grid-template-columns:1.25fr 1fr 1fr}#lay-info>#dominants-card{grid-column:auto}}
@media(min-width:1300px) and (max-width:1599px){#lay-info .domx-grid{grid-template-columns:1fr!important;gap:6px!important}}
/* 4 — the four analysis cards as a 2 × 2 grid of boxes */
#lay-bot{grid-template-columns:1fr}
@media(min-width:900px){#lay-bot{grid-template-columns:1fr 1fr}}
#lay-bot>.data-card{min-height:190px;display:flex!important;flex-direction:column;border-radius:16px;
  background:linear-gradient(160deg,rgba(30,20,70,.55),rgba(8,6,20,.85));border:1px solid rgba(124,58,237,.35);
  box-shadow:0 10px 30px rgba(0,0,0,.4)}
#lay-bot>.data-card[style*="display: none"],#lay-bot>.data-card[style*="display:none"]{display:none!important}
#lay-bot>.data-card>.data-card-title{font-size:11px;letter-spacing:3px;padding:12px 16px}
#lay-bot>.data-card>div:last-child{flex:1;display:flex;flex-direction:column;justify-content:center;gap:8px;padding:18px!important}
#lay-bot>.data-card>div:last-child>button{align-self:center;font-size:13px!important;padding:12px 22px!important}
#lay-bot>.data-card>div:last-child>div{text-align:center}
.cp{background:rgba(8,6,20,.72);border:1px solid rgba(45,31,110,.55);border-radius:14px;padding:14px 16px 12px;
  backdrop-filter:blur(8px);box-shadow:0 8px 30px rgba(0,0,0,.35);font-family:'Noto Sans Georgian',sans-serif}
.cp h3{font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(201,168,76,.85);
  font-weight:400;margin:12px 0 8px;display:flex;align-items:center;gap:8px}
.cp h3:first-child{margin-top:0}
.cp h3::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(201,168,76,.25),transparent)}
.cp-bar{display:grid;grid-template-columns:86px 1fr 38px;gap:8px;align-items:center;font-size:11px;margin:5px 0;color:#c8c0e8}
.cp-bar .tr{height:7px;border-radius:4px;background:rgba(255,255,255,.05);overflow:hidden}
.cp-bar .tr i{display:block;height:100%;border-radius:4px}
.cp-bar .pc{text-align:right;font-family:'Cinzel',serif;font-size:11px}
.cp-gl{font-size:10px;color:rgba(200,190,230,.55);margin:-2px 0 4px 94px;font-family:serif;letter-spacing:1px}
.cp-split{display:flex;height:9px;border-radius:5px;overflow:hidden;margin:6px 0 3px}
.cp-split i{display:block;height:100%}
.cp-row{display:flex;justify-content:space-between;font-size:10px;color:rgba(200,190,230,.6)}
.cp-hint{font-size:10.5px;color:#d8d0f0;line-height:1.6;margin-top:6px}
.cp-hint b{color:#f0d080;font-weight:500}
.cp-hemi{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px}
.cp-hemi div{background:rgba(45,31,110,.25);border-radius:7px;padding:6px 8px;font-size:10px;color:rgba(200,190,230,.7);display:flex;justify-content:space-between}
.cp-hemi b{font-family:'Cinzel',serif;font-size:13px;color:#e8e0ff;font-weight:400}
.cp-big{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.cp-big>div{background:rgba(45,31,110,.25);border-radius:9px;padding:8px 4px;text-align:center}
.cp-big .g{font-size:18px;line-height:1.2;font-family:serif}
.cp-big .s{font-size:20px;line-height:1.3;font-family:serif}
.cp-big .n{font-size:10px;color:rgba(200,190,230,.75)}
.cp-big .l{font-family:'Cinzel',serif;font-size:8px;letter-spacing:2px;color:rgba(201,168,76,.7)}
.cp-kv{display:flex;justify-content:space-between;gap:10px;font-size:11px;padding:4px 0;border-bottom:1px solid rgba(45,31,110,.35);color:#c8c0e8}
.cp-kv:last-child{border-bottom:none}
.cp-kv span:first-child{color:rgba(200,190,230,.55);font-size:10px}
.cp-asp{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
.cp-asp span{background:rgba(45,31,110,.3);border-radius:10px;padding:2px 9px;font-size:11px;color:#d8d0f0}
.cp-asp span i{font-style:normal;font-family:serif;margin-right:4px}
`;
  document.head.appendChild(s);
}
/* ── LAYOUT: move the existing cards into three grids (once) ── */
function layout(){
  if($('lay-top'))return true;
  const ww=$('wheel-wrap'),ca=$('chart-area');if(!ww||!ca)return false;
  const pc=$('planet-tbody')&&$('planet-tbody').closest('.data-card'),hc=$('house-card'),
        ac=$('aspect-tbody')&&$('aspect-tbody').closest('.data-card'),dom=$('dominants-card');
  if(!pc||!hc||!ac)return false;
  pc.id=pc.id||'lay-planets';ac.classList.add('asp-card');
  const mk=(id,cls)=>{const e=document.createElement('div');e.id=id;if(cls)e.className=cls;return e;};
  /* 0 — top strip: moon day · almuten figuris · doryphory & charioteer,
         then the orb controller; 1 — wheel + (aspect filter, aspect list) */
  const strip=mk('lay-strip','lay'),orb=mk('lay-orb'),top=mk('lay-top','lay'),A=mk('lay-asp');
  ww.parentNode.insertBefore(strip,ww);
  ww.parentNode.insertBefore(orb,ww);
  ww.parentNode.insertBefore(top,ww);
  const lb=$('lunar-badge');if(lb)strip.appendChild(lb);
  const xa=document.createElement('aside');xa.className='cp nx';xa.id='nx-alm';xa.style.display='none';
  const xb=document.createElement('aside');xb.className='cp nx';xb.id='nx-aur';xb.style.display='none';
  strip.appendChild(xa);strip.appendChild(xb);
  top.appendChild(ww);top.appendChild(A);
  const af=$('asp-filters');if(af)A.appendChild(af);
  A.appendChild(ac);
  /* 2 — planets · houses · fixed stars, where the tables were */
  const tw=document.querySelector('#chart-area .tables-wrap');
  const mid=mk('lay-mid','lay');
  (tw||top).parentNode.insertBefore(mid,tw?tw:top.nextSibling);
  mid.appendChild(pc);mid.appendChild(hc);
  /* 3 — dominants · portrait (big three) · balance (elements) */
  const info=mk('lay-info','lay');
  mid.parentNode.insertBefore(info,mid.nextSibling);
  const cl=document.createElement('aside');cl.className='cp';cl.id='cp-left';cl.style.display='none';
  const cr=document.createElement('aside');cr.className='cp';cr.id='cp-right';cr.style.display='none';
  if(dom)info.appendChild(dom);info.appendChild(cr);info.appendChild(cl);
  ca.querySelectorAll(':scope>.sec-title').forEach(t=>{const x=t.textContent.trim();
    if(x==='პლანეტები'||x==='ასპექტები')t.classList.add('lay-hide');});
  /* 4 — the four analysis cards */
  const four=['cinderella-card','hardperiods-card','skymap-card','skychart-card'].map($).filter(Boolean);
  if(four.length){const bot=mk('lay-bot','lay');four[0].parentNode.insertBefore(bot,four[0]);four.forEach(c=>bot.appendChild(c));}
  return true;
}
/* the orb controller lives in the form until a chart exists; then it
   moves next to the aspect list it controls */
function moveOrbPanel(){const op=$('orb-panel'),O=$('lay-orb');
  if(op&&O&&op.parentNode!==O)O.appendChild(op);}
function host(){return layout()?$('lay-top'):null;}
const showCp=on=>{['cp-left','cp-right'].concat(on?[]:['nx-alm','nx-aur']).forEach(id=>{const e=$(id);if(e)e.style.display=on?'':'none';});
  if(!on){const st=$('lay-strip');if(st)st.classList.remove('nat');}};
const si=d=>Math.floor((((+d)%360)+360)%360/30);
const glyph=n=>{const i=(typeof PI!=='undefined'&&PI[n])||null;
  if(n==='მზე')return '☉';if(n==='AC'||n==='MC')return n;return i?i.sym:n;};
const pct=(v,t)=>t?Math.round(v/t*100):0;
const bar=(lbl,v,tot,col,ic)=>`<div class="cp-bar"><span>${ic?ic+' ':''}${lbl}</span><span class="tr"><i style="width:${pct(v,tot)}%;background:${col}"></i></span><span class="pc" style="color:${col}">${pct(v,tot)}%</span></div>`;

function points(d){
  const P=[];
  for(const n of REAL){const p=d.planets&&d.planets[n];if(p&&p.degree!=null)P.push({n,deg:+p.degree,h:p.house,r:!!p.retrograde});}
  if(!d._timeUnknown){if(d.asc!=null)P.push({n:'AC',deg:+d.asc,h:1});if(d.mc!=null)P.push({n:'MC',deg:+d.mc,h:10});}
  return P;
}

function left(d){
  const P=points(d),E=[0,0,0,0],M=[0,0,0],EG=[[],[],[],[]],MG=[[],[],[]];
  let tot=0;
  for(const p of P){const s=si(p.deg),w=W[p.n]||1;tot+=w;E[s%4]+=w;M[s%3]+=w;EG[s%4].push(glyph(p.n));MG[s%3].push(glyph(p.n));}
  let h='<h3>🜂 ელემენტები</h3>';
  EL.forEach((e,i)=>{h+=bar(e.ka,E[i],tot,e.c,e.ic)+(EG[i].length?`<div class="cp-gl">${EG[i].join(' ')}</div>`:'');});
  h+='<h3>⟳ მოდალობა</h3>';
  MOD.forEach((m,i)=>{h+=bar(m.ka,M[i],tot,m.c)+(MG[i].length?`<div class="cp-gl">${MG[i].join(' ')}</div>`:'');});
  const yang=E[0]+E[2],yin=E[1]+E[3];
  h+=`<h3>☯ პოლარობა</h3><div class="cp-split"><i style="width:${pct(yang,tot)}%;background:linear-gradient(90deg,#e0603a,#d8c070)"></i><i style="width:${pct(yin,tot)}%;background:linear-gradient(90deg,#8aab6e,#5b8ec4)"></i></div>
    <div class="cp-row"><span>იანი (აქტიური) ${pct(yang,tot)}%</span><span>ინი (რეცეპტიული) ${pct(yin,tot)}%</span></div>`;
  const eMax=E.indexOf(Math.max(...E)),mMax=M.indexOf(Math.max(...M));
  const lack=EL.filter((e,i)=>E[i]===0).map(e=>e.ka);
  h+=`<div class="cp-hint">დომინანტი: <b>${EL[eMax].ka}</b> · <b>${MOD[mMax].ka}</b>`+
     (lack.length?`<br>ნაკლული ელემენტი: <b style="color:#e88">${lack.join(', ')}</b> — მისი თვისებები შეგნებულად უნდა განვითარდეს`:'')+'</div>';
  if(!d._timeUnknown){
    const R=P.filter(p=>REAL.includes(p.n)&&p.h);
    const up=R.filter(p=>p.h>=7).length,dn=R.length-up,east=R.filter(p=>p.h>=10||p.h<=3).length,west=R.length-east;
    h+=`<h3>◐ ჰემისფეროები</h3><div class="cp-hemi">
      <div><span>⬆ ზედა</span><b>${up}</b></div><div><span>⬇ ქვედა</span><b>${dn}</b></div>
      <div><span>⬅ აღმოსავლეთი</span><b>${east}</b></div><div><span>➡ დასავლეთი</span><b>${west}</b></div></div>
      <div class="cp-hint" style="font-size:10px;opacity:.8">${up>dn?'ზედა: გარე სამყარო, საზოგადოება':'ქვედა: შინაგანი სამყარო, პირადი ცხოვრება'} · ${east>west?'აღმოსავლეთი: საკუთარი ინიციატივა':'დასავლეთი: ურთიერთობებით მოქმედება'}</div>`;
  }
  h+=`<div class="cp-hint" style="font-size:9px;opacity:.5;margin-top:10px">წონები: ☉☽AC 3 · ☿♀♂ 2 · ♃♄ 1.5 · ♅♆♇ 1 · MC 1</div>`;
  return h;
}

const PHASES=[[0,'ახალი მთვარე','🌑'],[45,'მზარდი ნამგალი','🌒'],[90,'პირველი მეოთხედი','🌓'],[135,'მზარდი გიბოსი','🌔'],
  [180,'სავსე მთვარე','🌕'],[225,'კლებადი (გამავრცელებელი)','🌖'],[270,'ბოლო მეოთხედი','🌗'],[315,'ბალზამური','🌘']];
function right(d,asps){
  const P=d.planets||{},S=n=>P[n]&&P[n].degree!=null?si(P[n].degree):null;
  const cell=(lbl,g,s)=>s==null?'':`<div><div class="l">${lbl}</div><div class="g">${g}</div>
    <div class="s" style="color:${ZCOL[s]}">${ZSYM[s]}</div><div class="n">${SIGN_KA[s]}</div></div>`;
  let h='<h3>✦ დიდი სამეული</h3><div class="cp-big">'+cell('მზე','☉',S('მზე'))+cell('მთვარე','☽',S('მთვარე'))+
    (d._timeUnknown?'<div><div class="l">AC</div><div class="n" style="margin-top:18px">დრო უცნობია</div></div>':cell('ასცენდენტი','AC',si(d.asc)))+'</div>';
  h+='<h3>♛ რუქის მმართველი</h3>';
  if(!d._timeUnknown){
    const a=si(d.asc),r=RULER[a],rp=P[r],tr=RULER_TRAD[a];
    h+=`<div class="cp-kv"><span>${SIGN_KA[a]}-ის მმართველი</span><span>${glyph(r)} ${r}${tr?` <small style="opacity:.55">(ტრად. ${tr})</small>`:''}</span></div>`;
    if(rp)h+=`<div class="cp-kv"><span>მდებარეობა</span><span style="color:${ZCOL[si(rp.degree)]}">${ZSYM[si(rp.degree)]} ${SIGN_KA[si(rp.degree)]} · H${rp.house||'?'}${rp.retrograde?' ℞':''}</span></div>`;
  }else h+='<div class="cp-hint">დაბადების დრო საჭიროა</div>';
  if(S('მზე')!=null&&S('მთვარე')!=null){
    const ang=((P['მთვარე'].degree-P['მზე'].degree)%360+360)%360;
    let ph=PHASES[0];for(const x of PHASES)if(ang>=x[0])ph=x;
    h+=`<div class="cp-kv"><span>მთვარის ფაზა დაბადებისას</span><span>${ph[2]} ${ph[1]} <small style="opacity:.55">${Math.round(ang)}°</small></span></div>`;
  }
  const A=(asps||[]).filter(a=>!a.star),cnt={};let hm=0,te=0;
  A.forEach(a=>{cnt[a.type]=(cnt[a.type]||0)+1;if(HARM.has(a.type))hm++;else if(TENSE.has(a.type))te++;});
  const sym={},col={};A.forEach(a=>{sym[a.type]=a.sym;col[a.type]=a.color;});
  h+=`<h3>⚡ ასპექტები · ${A.length}</h3><div class="cp-asp">${Object.keys(cnt).sort((x,y)=>cnt[y]-cnt[x])
    .map(t=>`<span><i style="color:${col[t]}">${sym[t]}</i>${t} ${cnt[t]}</span>`).join('')}</div>`;
  if(hm+te){h+=`<div class="cp-split" style="margin-top:9px"><i style="width:${pct(hm,hm+te)}%;background:#4a90e2"></i><i style="width:${pct(te,hm+te)}%;background:#e04040"></i></div>
    <div class="cp-row"><span>ჰარმონიული ${hm}</span><span>დაძაბული ${te}</span></div>`;}
  const ret=REAL.filter(n=>P[n]&&P[n].retrograde&&n!=='მზე'&&n!=='მთვარე');
  h+=`<h3>℞ რეტროგრადული</h3><div class="cp-hint">${ret.length?ret.map(n=>`${glyph(n)} ${n}`).join(' · '):'არცერთი'}</div>`;
  const bySign={},byHouse={};
  REAL.forEach(n=>{const p=P[n];if(!p||p.degree==null)return;const s=si(p.degree);
    (bySign[s]=bySign[s]||[]).push(n);if(!d._timeUnknown&&p.house)(byHouse[p.house]=byHouse[p.house]||[]).push(n);});
  const st=[...Object.entries(bySign).filter(([,v])=>v.length>=3).map(([s,v])=>`<b style="color:${ZCOL[s]}">${ZSYM[s]} ${SIGN_KA[s]}</b>: ${v.map(glyph).join(' ')}`),
            ...Object.entries(byHouse).filter(([,v])=>v.length>=3).map(([hh,v])=>`<b>H${hh}</b>: ${v.map(glyph).join(' ')}`)];
  h+=`<h3>✺ სტელიუმი</h3><div class="cp-hint">${st.length?st.join('<br>'):'არ არის (3+ პლანეტა ერთ ნიშანში ან სახლში)'}</div>`;
  return h;
}

/* ═══ NATAL EXTRAS: Almuten Figuris · Doryphory · Charioteer (Auriga) ═══
   Natal mode only. Traditional seven planets.
   Almuten Figuris (Ibn Ezra / Bonatti, as used by Zoller and in ZET):
     5 hylegiacal points — Sun, Moon, Ascendant, Part of Fortune (by sect),
     prenatal syzygy (last New/Full Moon before birth);
     each scored by essential dignity: domicile 5 · exaltation 4 ·
     triplicity 3 (Dorothean, ruler of the sect) · term 2 (Egyptian) ·
     face 1 (Chaldean); + ruler of the planetary day 7 + of the hour 6.
   Doryphory  — the planet rising just BEFORE the Sun (behind it in longitude).
   Charioteer — the planet rising just AFTER the Sun (Возничий, Auriga).   */
const T7=['სატურნი','იუპიტერი','მარსი','მზე','ვენერა','მერკური','მთვარე'];      /* Chaldean order */
const DOM=['მარსი','ვენერა','მერკური','მთვარე','მზე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','სატურნი','იუპიტერი'];
const EXA={0:'მზე',1:'მთვარე',5:'მერკური',11:'ვენერა',9:'მარსი',3:'იუპიტერი',6:'სატურნი'};
const TRIP=[['მზე','იუპიტერი'],['ვენერა','მთვარე'],['სატურნი','მერკური'],['ვენერა','მარსი']]; /* fire earth air water: [day,night] */
const S_='სატურნი',J_='იუპიტერი',M_='მარსი',V_='ვენერა',R_='მერკური';
const TERMS=[[[6,J_],[12,V_],[20,R_],[25,M_],[30,S_]],[[8,V_],[14,R_],[22,J_],[27,S_],[30,M_]],
 [[6,R_],[12,J_],[17,V_],[24,M_],[30,S_]],[[7,M_],[13,V_],[19,R_],[26,J_],[30,S_]],
 [[6,J_],[11,V_],[18,S_],[24,R_],[30,M_]],[[7,R_],[17,V_],[21,J_],[28,M_],[30,S_]],
 [[6,S_],[14,R_],[21,J_],[28,V_],[30,M_]],[[7,M_],[11,V_],[19,R_],[24,J_],[30,S_]],
 [[12,J_],[17,V_],[21,R_],[26,S_],[30,M_]],[[7,R_],[14,J_],[22,V_],[26,S_],[30,M_]],
 [[7,R_],[13,V_],[20,J_],[25,M_],[30,S_]],[[12,V_],[16,J_],[19,R_],[28,M_],[30,S_]]];
const FACE=['მარსი','მზე','ვენერა','მერკური','მთვარე','სატურნი','იუპიტერი'];
const n360=x=>((x%360)+360)%360;
function dignities(lon,day){
  const s=Math.floor(n360(lon)/30),d=n360(lon)-s*30,o={};
  const add=(p,v,why)=>{o[p]=o[p]||{v:0,w:[]};o[p].v+=v;o[p].w.push(why);};
  add(DOM[s],5,'სახლი');
  if(EXA[s])add(EXA[s],4,'ამაღლება');
  add(TRIP[s%4][day?0:1],3,'ტრიპლიციტეტი');
  add(TERMS[s].find(t=>d<t[0])[1],2,'ტერმი');
  add(FACE[Math.floor(n360(lon)/10)%7],1,'დეკანი');
  return o;
}
/* Sun longitude (Meeus low precision, ±0.01°) */
function sunL(jd){
  const T=(jd-2451545)/36525,R=Math.PI/180,M=(357.52911+35999.05029*T)*R;
  const C=(1.914602-0.004817*T)*Math.sin(M)+0.019993*Math.sin(2*M)+0.000289*Math.sin(3*M);
  return n360(280.46646+36000.76983*T+C-0.00569-0.00478*Math.sin((125.04-1934.136*T)*R));
}
/* true New/Full Moon (Meeus ch. 49), JDE */
function phaseJD(k){
  const R=Math.PI/180,T=k/1236.85,full=Math.abs(k%1)>0.25;
  let jd=2451550.09766+29.530588861*k+0.00015437*T*T;
  const E=1-0.002516*T,M=(2.5534+29.1053567*k)*R,Mp=(201.5643+385.81693528*k+0.0107582*T*T)*R,
        F=(160.7108+390.67050284*k-0.0016118*T*T)*R,O=(124.7746-1.56375588*k)*R,sin=Math.sin;
  jd+=full?
    -0.40614*sin(Mp)+0.17302*E*sin(M)+0.01614*sin(2*Mp)+0.01043*sin(2*F)+0.00734*E*sin(Mp-M)-0.00515*E*sin(Mp+M)
    +0.00209*E*E*sin(2*M)-0.00111*sin(Mp-2*F)-0.00057*sin(Mp+2*F)+0.00056*E*sin(2*Mp+M)-0.00042*sin(3*Mp)
    +0.00042*E*sin(M+2*F)+0.00038*E*sin(M-2*F)-0.00024*E*sin(2*Mp-M)-0.00017*sin(O)
   :-0.40720*sin(Mp)+0.17241*E*sin(M)+0.01608*sin(2*Mp)+0.01039*sin(2*F)+0.00739*E*sin(Mp-M)-0.00514*E*sin(Mp+M)
    +0.00208*E*E*sin(2*M)-0.00111*sin(Mp-2*F)-0.00057*sin(Mp+2*F)+0.00056*E*sin(2*Mp+M)-0.00042*sin(3*Mp)
    +0.00042*E*sin(M+2*F)+0.00038*E*sin(M-2*F)-0.00024*E*sin(2*Mp-M)-0.00017*sin(O);
  return jd;
}
function prenatalSyzygy(jd){
  let k=Math.floor((jd-2451550.09766)/29.530588861*2)/2+1,best=null;
  for(let i=0;i<6;i++,k-=0.5){const t=phaseJD(k);if(t<=jd){best={jd:t,full:Math.abs(k%1)>0.25};break;}}
  if(!best)return null;
  const s=sunL(best.jd);return{jd:best.jd,full:best.full,lon:best.full?n360(s+180):s};
}
/* local wall time in a zone → UT Julian day */
function utJD(q){
  const y=+q.year,m=+q.month,d=+q.day,h=+(q.hour||0),mi=+(q.minute||0),se=+(q.second||0),tz=q.tz_name||'UTC';
  const g=Date.UTC(y,m-1,d,h,mi,se);
  const off=ms=>{const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',
    day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(new Date(ms)).forEach(x=>p[x.type]=x.value);
    return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-ms;};
  let t=g-off(g);t=g-off(t);
  return t/86400000+2440587.5;
}
/* sunrise / sunset (UT JD) of the local day that starts at UT `mid` (local
   mean midnight), apparent upper limb with refraction (-0.833°) */
function sunEvent(mid,lat,lon,rise){
  const R=Math.PI/180;let t=mid+(rise?0.25:0.75);
  for(let i=0;i<4;i++){
    const T=(t-2451545)/36525,L=sunL(t)*R,eps=(23.439-0.013*T)*R;
    const dec=Math.asin(Math.sin(eps)*Math.sin(L)),ra=Math.atan2(Math.cos(eps)*Math.sin(L),Math.cos(L))/R;
    const cosH=(Math.sin(-0.833*R)-Math.sin(lat*R)*Math.sin(dec))/(Math.cos(lat*R)*Math.cos(dec));
    if(cosH<-1||cosH>1)return null;                          /* polar day / night */
    const H=Math.acos(cosH)/R*(rise?-1:1);
    const lst=n360(280.46061837+360.98564736629*(t-2451545)+lon);
    const ha=((lst-ra)%360+540)%360-180;
    t+=(H-ha)/360.9856;
  }
  return t;
}
/* ruler of the planetary day (from sunrise) and of the planetary hour */
function planetaryRulers(jd,lat,lon){
  let day=Math.floor(jd+lon/360+0.5);                        /* local date, as the JD at its noon */
  const mid=dd=>dd-0.5-lon/360;
  let rise=sunEvent(mid(day),lat,lon,true);
  if(rise==null)return null;
  if(jd<rise){day--;rise=sunEvent(mid(day),lat,lon,true);}
  const set=sunEvent(mid(day),lat,lon,false),next=sunEvent(mid(day+1),lat,lon,true);
  if(rise==null||set==null||next==null)return null;
  const WD=['მზე','მთვარე','მარსი','მერკური','იუპიტერი','ვენერა','სატურნი'];  /* Sunday … Saturday */
  const dayRuler=WD[(day+1)%7];
  let n=jd<set?Math.floor((jd-rise)/((set-rise)/12)):12+Math.floor((jd-set)/((next-set)/12));
  n=Math.max(0,Math.min(23,n));
  return{dayRuler,hourRuler:T7[(T7.indexOf(dayRuler)+n)%7],hour:n+1,rise,set};
}
function almuten(d){
  const P=d.planets||{},q=d._fsReq;if(!q||d._timeUnknown||d.asc==null)return null;
  const sun=+P['მზე'].degree,moon=+P['მთვარე'].degree,asc=+d.asc;
  const sh=P['მზე'].house,day=sh?sh>=7:true;
  const fort=n360(day?asc+moon-sun:asc+sun-moon);
  const jd=utJD(q),syz=prenatalSyzygy(jd);
  const pts=[['☉','მზე',sun],['☽','მთვარე',moon],['AC','ასცენდენტი',asc],['⊗','ფორტუნა',fort]];
  if(syz)pts.push([syz.full?'○':'●',(syz.full?'სავსე':'ახალი')+' მთვარე (სიზიგია)',syz.lon]);
  const score={};T7.forEach(p=>score[p]={pts:[],tot:0,bonus:0});
  pts.forEach(([g,,lon],i)=>{const dg=dignities(lon,day);
    T7.forEach(p=>{const v=dg[p]?dg[p].v:0;score[p].pts[i]=v;score[p].tot+=v;});});
  const lat=+d.lat,lon=+d.lon;let pr=null;
  if(isFinite(lat)&&isFinite(lon))pr=planetaryRulers(jd,lat,lon);
  if(pr){score[pr.dayRuler].bonus+=7;score[pr.hourRuler].bonus+=6;}
  const rank=T7.map(p=>({...score[p],p,base:score[p].tot,tot:score[p].tot+score[p].bonus})).sort((a,b)=>b.tot-a.tot||b.base-a.base);
  return{rank,pts,day,pr,syz,fort};
}
function spearBearers(d){
  const P=d.planets||{};if(!P['მზე'])return null;
  const sun=+P['მზე'].degree,list=REAL.filter(n=>n!=='მზე'&&P[n]&&P[n].degree!=null);
  let dor=null,aur=null;
  for(const n of list){const x=+P[n].degree,before=n360(sun-x),after=n360(x-sun);
    if(!dor||before<dor.arc)dor={n,arc:before};if(!aur||after<aur.arc)aur={n,arc:after};}
  return{dor,aur};
}
function extraHTML(d){
  const A=almuten(d),B=spearBearers(d),g=n=>`<span style="font-family:serif;font-size:15px">${glyph(n)}</span>`;
  const sg=lon=>{const s=si(lon);return `<span style="color:${ZCOL[s]}">${ZSYM[s]}</span>`;};
  let a;
  if(!A)a='<div class="cp-hint">ალმუტენისთვის დაბადების ზუსტი დრო საჭიროა.</div>';
  else{
    const w=A.rank[0],tie=A.rank[1]&&A.rank[1].tot===w.tot;
    a=`<div class="nx-win">${g(w.p)} <b>${w.p}</b> <span>${w.tot} ქულა</span>${tie?` <small>(თანაბარი: ${A.rank[1].p})</small>`:''}</div>
     <table class="nx-t"><tr><th></th>${A.pts.map(p=>`<th title="${p[1]} ${fmtDeg?fmtDeg(p[2]):''}">${p[0]}<br>${sg(p[2])}</th>`).join('')}<th title="დღის (+7) და საათის (+6) მმართველი">დ/ს</th><th>Σ</th></tr>
     ${A.rank.map((r,i)=>`<tr class="${i===0?'top':''}"><td>${g(r.p)}</td>${r.pts.map(v=>`<td>${v||'·'}</td>`).join('')}<td>${r.bonus||'·'}</td><td><b>${r.tot}</b></td></tr>`).join('')}</table>
     <div class="cp-hint" style="font-size:9.5px;opacity:.7">${A.day?'დღის':'ღამის'} რუქა · ⊗ ${A.day?'AC+☽−☉':'AC+☉−☽'}${A.syz?` · ${A.syz.full?'სავსე':'ახალი'} მთვარე ${fmtDeg?fmtDeg(A.syz.lon):''} ${SIGN_KA[si(A.syz.lon)]}`:''}${A.pr?` · დღის მმართველი ${A.pr.dayRuler} (+7), ${A.pr.hour}-ე საათი — ${A.pr.hourRuler} (+6)`:''}<br>
       სახლი 5 · ამაღლება 4 · ტრიპლიციტეტი 3 · ტერმი 2 · დეკანი 1 (იბნ ეზრა)</div>`;
  }
  let b='';
  if(B){
    const it=(lbl,sub,x,txt)=>x?`<div class="nx-sb"><div class="l">${lbl}<small>${sub}</small></div><div class="p">${g(x.n)} <b>${x.n}</b>
      <span>${x.arc.toFixed(1)}° ${lbl.startsWith('დორ')?'მზის წინ':'მზის შემდეგ'}</span></div><div class="cp-hint" style="margin:2px 0 0">${txt}</div></div>`:'';
    b=it('დორიფორი','შუბოსანი · Дорифорий',B.dor,'ამოდის მზემდე — „სავიზიტო ბარათი“: რითაც პირველად გამჩნევენ.')+
      it('მეეტლე','Auriga · Возничий',B.aur,'ამოდის მზის შემდეგ — რითაც გიმახსოვრებენ; თვისება, რომელიც დროთა განმავლობაში ვლინდება.');
  }
  return{a,b};
}

function render(d){
  if(!host())return;
  try{
    $('cp-left').innerHTML=left(d);
    let asps=d._allAspects||[];
    try{asps=asps.filter(isAspectVisible);}catch(e){}
    $('cp-right').innerHTML=right(d,asps);
    showCp(true);
    moveOrbPanel();
    const natal=(typeof currentMode==='undefined')||currentMode==='natal';
    const ca=$('nx-alm'),cb=$('nx-aur');
    if(ca&&cb){
      if(natal){const x=extraHTML(d);
        ca.innerHTML='<h3>♛ ალმუტენ ფიგურის · Almuten Figuris</h3>'+x.a;cb.innerHTML='<h3>⚔ დორიფორი და მეეტლე</h3>'+x.b;
        ca.style.display=cb.style.display='';}
      else ca.style.display=cb.style.display='none';
      const st=$('lay-strip');if(st)st.classList.toggle('nat',natal);
    }
  }catch(e){console.warn('chartpanels',e);showCp(false);}
}
if(typeof drawWheel==='function'){
  const orig=drawWheel;
  window.drawWheel=function(d1,d2){
    const r=orig.apply(this,arguments);
    try{if(d1&&!d2&&d1.planets)render(d1);else showCp(false);}catch(e){}
    return r;
  };
}
css();
/* hide when the wheel itself is hidden (astrocartography, etc.) */
const ww=$('wheel-wrap');
if(ww&&typeof MutationObserver!=='undefined')new MutationObserver(()=>{
  if(ww.style.display==='none')showCp(false);}).observe(ww,{attributes:true,attributeFilter:['style']});
/* Selena: the wheel draws its symbol; the tables showed the text "SEL" */
const SEL_SVG='<svg width="14" height="14" viewBox="0 0 14 14" style="vertical-align:-2px"><circle cx="7" cy="7" r="5.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M1.8 7a5.2 5.2 0 0 1 10.4 0z" fill="currentColor"/></svg>';
function fixSel(root){if(!root)return;root.querySelectorAll('span').forEach(sp=>{
  if(!sp.children.length&&sp.textContent.trim()==='SEL')sp.innerHTML=SEL_SVG;});}
for(const fn of ['drawPlanetTable','drawAspectTable']){
  if(typeof window[fn]!=='function')continue;
  const orig=window[fn];
  window[fn]=function(){const r=orig.apply(this,arguments);
    try{fixSel($(arguments[fn==='drawPlanetTable'?2:1]||'aspect-tbody'));fixSel($('fs-tbody'));}catch(e){}return r;};
}
window._SEL_SVG=SEL_SVG;
layout();
window._chartPanels={render,almuten,spearBearers,prenatalSyzygy,planetaryRulers,sunEvent,utJD,dignities};
})();
