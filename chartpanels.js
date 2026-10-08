/* chartpanels.js — page layout + side panels of the natal chart (astro.html)
   Self-injecting add-on. In astro.html, after the other add-ons:
       <script src="chartpanels.js"></script>
   Layout (≥1400px):
     [ dominants + balance ]  [ wheel ]  [ planets + portrait ]
     [ houses ] [ fixed stars ] [ aspects ]
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
.lay{display:grid;gap:14px;margin:14px 0 16px;width:100%}
.lay .data-card{margin:0!important;overflow-x:auto}
@media(min-width:1000px){#chart-area .lay{width:min(1720px,calc(100vw - 32px));position:relative;left:50%;transform:translateX(-50%)}}
/* top row: wheel + planets + dominants + the two panels */
#lay-top{grid-template-columns:1fr 1fr;align-items:start;margin-top:0}
#lay-top>#wheel-wrap{grid-column:1/-1;order:0;max-width:820px;width:100%;justify-self:center}
#lay-col-l,#lay-col-r{display:contents}
#dominants-card{order:2}#lay-planets{order:1}#cp-left{order:3}#cp-right{order:4}
@media(max-width:700px){#lay-top{grid-template-columns:1fr}}
@media(min-width:1400px){
  #lay-top{grid-template-columns:minmax(370px,1fr) minmax(560px,820px) minmax(370px,1fr)}
  #lay-col-l,#lay-col-r{display:flex;flex-direction:column;gap:14px;min-width:0}
  #lay-top>#wheel-wrap{grid-column:auto}
  #lay-col-r td,#lay-col-l td,#lay-col-r th{padding-left:6px;padding-right:6px}
  #lay-planets td{white-space:normal}
  #lay-col-l .domx-grid{grid-template-columns:1fr!important;gap:6px!important}
  #lay-planets td:nth-child(2){white-space:nowrap}
}
/* middle row: houses · fixed stars · aspects */
#lay-mid{grid-template-columns:1fr;align-items:start}
@media(min-width:800px){
  #lay-mid{grid-template-columns:1fr 1fr}
  #lay-mid.has-fs>.asp-card{grid-column:1/-1}
}
@media(min-width:1300px){
  #lay-mid.has-fs{grid-template-columns:.8fr 1.15fr 1.15fr}
  #lay-mid.has-fs>.asp-card{grid-column:auto}
  #lay-mid:not(.has-fs){grid-template-columns:.8fr 1.2fr}
}
/* bottom: the four analysis cards, 2 × 2 */
#lay-bot{grid-template-columns:1fr;align-items:start}
@media(min-width:900px){#lay-bot{grid-template-columns:1fr 1fr}}
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
  const top=mk('lay-top','lay'),L=mk('lay-col-l'),Rc=mk('lay-col-r');
  ww.parentNode.insertBefore(top,ww);
  const cl=document.createElement('aside');cl.className='cp';cl.id='cp-left';cl.style.display='none';
  const cr=document.createElement('aside');cr.className='cp';cr.id='cp-right';cr.style.display='none';
  if(dom)L.appendChild(dom);L.appendChild(cl);      /* dominants first, then balance */
  Rc.appendChild(pc);Rc.appendChild(cr);             /* planets first, then portrait  */
  top.appendChild(L);top.appendChild(ww);top.appendChild(Rc);
  /* middle: houses · stars · aspects, where the tables were */
  const tw=document.querySelector('#chart-area .tables-wrap');
  const mid=mk('lay-mid','lay');
  (tw||ac).parentNode.insertBefore(mid,tw||ac);
  mid.appendChild(hc);mid.appendChild(ac);
  /* the two section titles that no longer describe what follows */
  ca.querySelectorAll(':scope>.sec-title').forEach(t=>{const x=t.textContent.trim();
    if(x==='პლანეტები'||x==='ასპექტები')t.classList.add('lay-hide');});
  /* bottom: the four analysis cards */
  const four=['cinderella-card','hardperiods-card','skymap-card','skychart-card'].map($).filter(Boolean);
  if(four.length){const bot=mk('lay-bot','lay');four[0].parentNode.insertBefore(bot,four[0]);four.forEach(c=>bot.appendChild(c));}
  return true;
}
function host(){return layout()?$('lay-top'):null;}
const showCp=on=>['cp-left','cp-right'].forEach(id=>{const e=$(id);if(e)e.style.display=on?'':'none';});
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

function render(d){
  if(!host())return;
  try{
    $('cp-left').innerHTML=left(d);
    let asps=d._allAspects||[];
    try{asps=asps.filter(isAspectVisible);}catch(e){}
    $('cp-right').innerHTML=right(d,asps);
    showCp(true);
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
window._chartPanels={render};
})();
