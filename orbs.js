/* orbs.js — user-controlled orbs, separately for every section
   (natal, synastry, composite, transit, progression, solar, relocation,
   draconic, past life, future life, astrocartography).

   Effective orb for a pair:
       aspect orb  ×  tier factor (optional)  ×  (planet1% + planet2%) / 200
   With the defaults (aspect orbs from ASPECTS_DEF, tiers on, every planet
   100 %) this is exactly the original orbFor(), so nothing changes until
   the user edits a value. Settings persist in localStorage.

   Replaces the global orbFor() — every aspect calculator in astro.html
   (calcAllNatalAspects, calcCrossAspects, calcComposite) already calls it.
   astro.html needs only:   <script src="orbs.js"></script>              */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const KEY='magnus_orbs_v1';

const MODES=[
  ['natal','ნატალური'],['synastry','სინასტრია'],['composite','კომპოზიტი'],
  ['transit','ტრანზიტი'],['progression','პროგრესია'],['solar','სოლარი'],
  ['relocation','რელოკაცია'],['draconic','დრაკონი'],['pastlife','წარსული სიცოცხლე'],
  ['futurelife','მომავალი სიცოცხლე'],['astrocartography','ასტროკარტოგრაფია']
];
const MODE_KA=Object.fromEntries(MODES);

/* ── profiles ─────────────────────────────────────────────── */
function defaults(){
  const asp={},pl={};
  for(const a of ASPECTS_DEF)asp[a.name]={on:true,orb:a.orb};
  for(const n of PORDER)pl[n]={on:true,pct:100};
  return {tiers:true,asp,pl};
}
function normalise(p){
  const d=defaults();
  if(!p||typeof p!=='object')return d;
  const out={tiers:p.tiers!==false,asp:{},pl:{}};
  for(const k in d.asp){const v=(p.asp||{})[k]||{};
    out.asp[k]={on:v.on!==false,orb:isFinite(+v.orb)?+v.orb:d.asp[k].orb};}
  for(const k in d.pl){const v=(p.pl||{})[k]||{};
    out.pl[k]={on:v.on!==false,pct:isFinite(+v.pct)?+v.pct:100};}
  return out;
}
let STORE={};
try{STORE=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){STORE={};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(STORE));}catch(e){}}
function modeNow(){try{return (typeof currentMode!=='undefined'&&currentMode)||'natal';}catch(e){return 'natal';}}
function prof(mode){
  mode=mode||modeNow();
  if(!STORE[mode])STORE[mode]=defaults();
  else STORE[mode]=normalise(STORE[mode]);
  return STORE[mode];
}

/* ── orb engine ───────────────────────────────────────────── */
function tierFactor(n1,n2){
  const t1=ORB_TIER[n1]||'virtual',t2=ORB_TIER[n2]||'virtual';
  const k=[t1,t2].sort().join('|');
  return ORB_PAIR[k]!==undefined?ORB_PAIR[k]:0.5;
}
function userOrbFor(asp,n1,n2){
  const P=prof();
  const a=P.asp[asp.name];
  if(a&&!a.on)return -1;                       /* aspect switched off */
  const q1=P.pl[n1],q2=P.pl[n2];
  if((q1&&!q1.on)||(q2&&!q2.on))return -1;     /* planet switched off */
  const base=a?a.orb:asp.orb;
  const tf=P.tiers?tierFactor(n1,n2):1;
  const pf=((q1?q1.pct:100)+(q2?q2.pct:100))/200;
  return base*tf*pf;
}
window.orbFor=userOrbFor;

/* ── re-run the aspects of the chart on screen ───────────── */
let _rt=null;
function recompute(){
  clearTimeout(_rt);
  _rt=setTimeout(()=>{
    try{
      if(!_d1)return;
      if(_d2&&_origD1&&_origD2){
        _crossAsp=calcCrossAspects({..._origD1.planets,...(_origD1._aspPlanets||{})},
                                   {..._origD2.planets,...(_origD2._aspPlanets||{})});
        const lbl=($('mode-label')||{}).textContent||'';
        if(typeof renderSynastryScore==='function')renderSynastryScore(lbl,_crossAsp);
      }else{
        _d1._allAspects=calcAllNatalAspects(_d1);
      }
      applyAspFilter();
    }catch(e){console.warn('orbs recompute',e);}
  },250);
}

/* ── panel ────────────────────────────────────────────────── */
const CSS=`
#orb-panel{margin-top:14px;border:1px solid rgba(201,162,76,.35);border-radius:10px;background:rgba(20,14,9,.55)}
#orb-panel>summary{cursor:pointer;list-style:none;padding:9px 12px;font-family:Cinzel,serif;font-size:10px;letter-spacing:2px;color:#F0D48A}
#orb-panel>summary::-webkit-details-marker{display:none}
#orb-panel .ob-in{padding:0 12px 12px}
#orb-panel .ob-note{font-size:10px;color:rgba(196,176,148,.6);line-height:1.6;margin-bottom:8px}
#orb-panel .ob-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
#orb-panel .ob-btn{background:none;border:1px solid rgba(240,212,138,.5);color:#F0D48A;border-radius:6px;padding:3px 10px;font-size:10px;cursor:pointer;font-family:inherit}
#orb-panel .ob-btn:hover{background:rgba(201,162,76,.15)}
#orb-panel h4{font-family:Cinzel,serif;font-size:9px;letter-spacing:3px;color:rgba(217,168,96,.75);font-weight:400;margin:10px 0 6px;text-transform:uppercase}
#orb-panel .ob-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 14px}
@media(max-width:600px){#orb-panel .ob-grid{grid-template-columns:1fr}}
#orb-panel .ob-r{display:flex;align-items:center;gap:7px;font-size:11px;padding:2px 0}
#orb-panel .ob-r input[type=checkbox]{width:14px;height:14px;accent-color:#C9A24C;flex:none}
#orb-panel .ob-g{width:22px;text-align:center;font-family:serif;font-size:15px;flex:none}
#orb-panel .ob-n{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#orb-panel .ob-r input[type=number]{width:62px;padding:4px 6px;font-size:12px;flex:none}
#orb-panel .ob-u{width:14px;font-size:10px;color:rgba(196,176,148,.6);flex:none}
#orb-panel .ob-e{width:58px;text-align:right;font-size:10px;color:rgba(196,176,148,.55);flex:none}
#orb-panel .ob-r.off .ob-n,#orb-panel .ob-r.off .ob-g{opacity:.35}
#ob-open{background:none;border:1px solid rgba(240,212,138,.5);color:#F0D48A;border-radius:6px;padding:3px 10px;font-size:10px;cursor:pointer;font-family:inherit;margin-left:auto}
`;
const glyph=n=>{
  const s=((typeof PI!=='undefined'&&PI[n])||{}).sym||'•';
  return s==='sun'?'☉':s==='SEL'?'◐':s;
};
const col=n=>((typeof PI!=='undefined'&&PI[n])||{}).color||'#ccc';
const CONJ=()=>ASPECTS_DEF[0];

function build(){
  const P=prof(),m=modeNow();
  const panel=$('orb-panel');if(!panel)return;
  panel.style.display=MODE_KA[m]?'':'none';   /* e.g. ტრუტინა: no aspects */
  panel.querySelector('summary').textContent='⚙ ორბისები · '+(MODE_KA[m]||m);
  const aspRows=ASPECTS_DEF.map(a=>{const v=P.asp[a.name];return `
    <div class="ob-r${v.on?'':' off'}" data-k="a" data-n="${a.name}">
      <input type="checkbox" ${v.on?'checked':''}>
      <span class="ob-g" style="color:${a.color}">${a.sym}</span>
      <span class="ob-n">${a.name} <span style="opacity:.45;font-size:9px">${a.angles[0]}°</span></span>
      <input type="number" min="0" max="30" step="0.5" value="${v.orb}"><span class="ob-u">°</span>
    </div>`;}).join('');
  const plRows=PORDER.map(n=>{const v=P.pl[n];return `
    <div class="ob-r${v.on?'':' off'}" data-k="p" data-n="${n}">
      <input type="checkbox" ${v.on?'checked':''}>
      <span class="ob-g" style="color:${col(n)}">${glyph(n)}</span>
      <span class="ob-n">${n}</span>
      <input type="number" min="0" max="300" step="5" value="${v.pct}"><span class="ob-u">%</span>
      <span class="ob-e" data-e="${n}"></span>
    </div>`;}).join('');
  panel.querySelector('.ob-in').innerHTML=`
    <div class="ob-note">ეფექტური ორბი = ასპექტის ორბი × წყვილის კოეფიციენტი × (პლანეტა₁% + პლანეტა₂%) / 200.
      ყოველ სექციას საკუთარი პარამეტრები აქვს და ისინი ინახება ბრაუზერში. მონიშვნის მოხსნა ასპექტს ან პლანეტას ასპექტებიდან გამორიცხავს.</div>
    <div class="ob-bar">
      <label style="display:flex;align-items:center;gap:6px;font-size:11px;letter-spacing:0;text-transform:none;opacity:1;color:#EFE3CE;cursor:pointer">
        <input type="checkbox" id="ob-tiers" ${P.tiers?'checked':''} style="width:14px;height:14px;accent-color:#C9A24C">
        წყვილის კოეფიციენტები (შიდა · სოციალური · გარე · ვირტუალური)</label>
      <button type="button" class="ob-btn" id="ob-reset">↺ ნაგულისხმევი</button>
      <button type="button" class="ob-btn" id="ob-all">⇉ ყველა სექციაზე</button>
    </div>
    <h4>ასპექტები — ორბი მნათობების წყვილისთვის</h4>
    <div class="ob-grid">${aspRows}</div>
    <h4>პლანეტები — ორბის % · მარჯვნივ: ☌ მზესთან</h4>
    <div class="ob-grid">${plRows}</div>`;
  showEff();
}
function showEff(){
  const panel=$('orb-panel');if(!panel)return;
  panel.querySelectorAll('[data-e]').forEach(s=>{
    /* width of this planet's orb, shown even if conjunction is switched off */
    const P=prof(),n=s.dataset.e,q=P.pl[n],sq=P.pl['მზე'];
    if(!q||!q.on||(sq&&!sq.on)){s.textContent='—';return;}
    const o=P.asp[CONJ().name].orb*(P.tiers?tierFactor(n,'მზე'):1)*((q.pct)+(sq?sq.pct:100))/200;
    s.textContent='☌ '+o.toFixed(1)+'°';
  });
}
function onEdit(e){
  const row=e.target.closest('.ob-r');
  const P=prof();
  if(e.target.id==='ob-tiers'){P.tiers=e.target.checked;}
  else if(row){
    const n=row.dataset.n,obj=row.dataset.k==='a'?P.asp[n]:P.pl[n];
    if(!obj)return;
    if(e.target.type==='checkbox'){obj.on=e.target.checked;row.classList.toggle('off',!obj.on);}
    else if(e.target.type==='number'){
      const v=parseFloat(e.target.value);if(!isFinite(v))return;
      const max=row.dataset.k==='a'?30:300;
      if(row.dataset.k==='a')obj.orb=Math.max(0,Math.min(max,v));
      else obj.pct=Math.max(0,Math.min(max,v));
    }else return;
  }else return;
  save();showEff();recompute();
}
function inject(){
  if($('orb-panel'))return;
  const card=document.querySelector('.form-card');if(!card)return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const panel=document.createElement('details');
  panel.id='orb-panel';
  panel.innerHTML='<summary></summary><div class="ob-in"></div>';
  card.appendChild(panel);
  panel.addEventListener('input',onEdit);
  panel.addEventListener('change',onEdit);
  panel.addEventListener('click',e=>{
    if(e.target.id==='ob-reset'){STORE[modeNow()]=defaults();save();build();recompute();}
    else if(e.target.id==='ob-all'){
      const src=JSON.stringify(prof());
      for(const [m] of MODES)STORE[m]=JSON.parse(src);
      save();e.target.textContent='✔ გავრცელდა';
      setTimeout(()=>{const b=$('ob-all');if(b)b.textContent='⇉ ყველა სექციაზე';},1500);
    }
  });
  /* shortcut from the aspect filter bar under the chart */
  const af=$('asp-filters');
  if(af&&!$('ob-open')){
    const b=document.createElement('button');
    b.type='button';b.id='ob-open';b.textContent='⚙ ორბისები';
    b.addEventListener('click',()=>{panel.open=true;panel.scrollIntoView({behavior:'smooth',block:'start'});});
    (af.querySelector('div[style*="flex"]')||af).appendChild(b);
  }
  build();
  /* follow tab changes (setMode and the futurelife tab alike) */
  document.addEventListener('click',e=>{
    if(e.target.closest&&e.target.closest('.tab-btn'))setTimeout(build,0);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);
else inject();
})();
