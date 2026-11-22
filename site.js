/* site.js — MAGNUS header, footer, breadcrumbs and privacy notice for every page.
   Load before </body> (next to account.js). Self-injecting; nothing else is needed.
   • Header: MAGNUS → main menu, breadcrumb მთავარი › section › page, section menu (☰ on phones).
   • Footer: about, contact, privacy, terms, refunds, disclaimer, ©.
   • First visit: notice about browser storage and activity statistics, with "essential only"
     (turns activity tracking off — account.js reads localStorage magnus_consent).
   OWNER below holds the details the legal pages show (legal name, ID code, address, contacts).  */
(function(){
'use strict';
if(window.MAGNUS_SITE)return;
const OWNER={
  brand:'MAGNUS',
  legal:'',            /* ინდ. მეწარმე / შპს — სახელი, როგორც რეესტრშია */
  idcode:'',           /* საიდენტიფიკაციო კოდი */
  address:'',          /* იურიდიული მისამართი */
  email:'',            /* საკონტაქტო ელფოსტა */
  phone:'',            /* საკონტაქტო ტელეფონი */
  updated:'2026-11-02' /* legal pages: last update */
};
window.MAGNUS_SITE={OWNER};

const PAGE=(location.pathname.split('/').pop()||'index.html');
const P=PAGE.toLowerCase();
if(/^admin/.test(P))return;

/* sections = the boxes of index.html (GROUPS there); first match wins for a page in several boxes */
const SECTIONS=[
  {key:'astrology',t:'ასტროლოგია',href:'astro.html',pages:['astro.html','compat.html','vedic.html','vedictrop.html','true_sidereal.html','hdastro.html','moon.html','planeta.html','asteroid.html','skycal.html','bazi.html','ziwei.html','tibet.html','tzolkin.html','celtic.html','sky.html','mars.html']},
  {key:'numerology',t:'ნუმეროლოგია',href:'index.html?g=numerology',pages:['matrix.html','pythagoras.html','name.html','tarotborth.html','kabbalah.html','numerology.html']},
  {key:'hd',t:'ადამიანის დიზაინი',href:'hd.html',pages:['hd.html','genekeys.html','iching.html','types.html']},
  {key:'life',t:'ცხოვრების რუქა',href:'life.html',parent:'stats',pages:['life.html','work.html','duty.html','energy.html','body.html']},
  {key:'stats',t:'სტატისტიკა',href:'stats.html',pages:['stats.html']},
  {key:'health',t:'ჯანმრთელობა',href:'index.html?g=health',pages:['daily.html','breath.html','sleep.html','water.html','move.html','eyes.html','meditation.html','cold.html','fasting.html','rhythm.html','recover.html','bio.html']},
  {key:'science',t:'მეცნიერებები',href:'index.html?g=science',pages:['math.html','math_classic.html','phys.html','chem.html','biology.html','sciencegames.html','fourier.html','vector.html','funcgame.html']},
  {key:'games',t:'თამაშები',href:'games.html',parent:'fun',pages:['games.html','intuition.html','memory.html','logic.html','hardest.html','sudoku.html','nonogram.html','pythagames.html']},
  {key:'courses',t:'კურსები',href:'index.html?g=courses',pages:['course_astro.html','course_astro1.html','course_astro2.html','course_astro3.html','course_astro4.html','course_astro5.html','course_astro6.html','course_astro7.html','course_astro8.html','course_astro9.html','course_astro10.html','course_astro11.html','course_astro12.html','course_astro13.html','course_astro14.html','course_astro15.html','course_astro16.html','course_astro17.html','course_astro18.html','course_astro19.html','course_astro20.html','course_astro21.html','course_astro22.html','course_astro23.html','course_astro24.html','course_astro25.html','course_astro26.html','course_astro27.html','course_astro28.html','course_astro29.html','course_astro30.html','course_astro31.html','course_astro32.html','course_astro33.html','course_astro34.html','course_astro35.html','course_astro36.html','course_astro37.html','course_astro38.html','course_astro39.html','course_astro40.html','course_astro41.html','course_astro42.html','course_astro43.html','course_astro44.html','course_astro45.html','course_astro46.html','course_astro47.html','course_astro48.html','course_astro49.html','course_astro50.html','course_astro51.html','course_astro52.html','course_astro53.html','course_astro54.html','course_astro55.html','course_astro56.html','course_astro57.html','course_astro58.html','course_astro59.html','course_astro60.html','course_astro61.html','course_astro62.html','course_astro63.html','course_astro64.html','course_astro65.html','course_astro66.html','course_astro67.html','course_hd.html','course_hd1.html','course_hd2.html','course_hd3.html','course_hd4.html','course_hd5.html','course_hd6.html','course_hd7.html','course_hd8.html','course_hd9.html','course_hd10.html','course_hd11.html','course_hd12.html','course_hd13.html','course_hd14.html','course_hd15.html','course_hd16.html','course_hd17.html','course_hd18.html','course_hd19.html','course_hd20.html','course_hd21.html','course_hd22.html','course_hd23.html','course_hd24.html','course_hd25.html','course_hd26.html','course_hd27.html','course_hd28.html','course_hd29.html','course_hd30.html','course_hd31.html','course_hd32.html','course_hd33.html','course_hd34.html','course_hd35.html','course_hd36.html','course_hd37.html','course_num.html','course_bin.html','course_art.html','course_art1.html','course_art2.html','course_art3.html','course_art4.html','course_art5.html','course_art6.html','course_art7.html','course_art8.html','course_art9.html','course_art10.html','course_art11.html','course_art12.html','course_art13.html','course_art14.html','course_art15.html','course_art16.html','course_art17.html','course_art18.html','course_art19.html','course_art20.html','course_art21.html','course_art22.html','course_art23.html','course_art24.html','course_art25.html','course_art26.html','course_art27.html','course_art28.html','course_art29.html','course_art30.html','course_art31.html','course_art32.html','course_art33.html','course_art34.html','course_art35.html','course_art36.html','course_art37.html','course_matrix1.html','course_matrix2.html','course_matrix3.html','course_matrix4.html','course_matrix5.html','course_matrix6.html','course_matrix7.html','course_matrix8.html','course_matrix9.html','course_matrix10.html','course_matrix11.html','course_matrix12.html','course_matrix13.html','course_matrix14.html','course_matrix15.html','course_pyth1.html','course_pyth2.html','course_pyth3.html','course_pyth4.html','course_pyth5.html','course_pyth6.html','course_pyth7.html','course_pyth8.html','course_pyth9.html','course_pyth10.html','course_pyth11.html','course_pyth12.html','course_pyth13.html','course_pyth14.html','course_pyth15.html','course_tarot1.html','course_tarot2.html','course_tarot3.html','course_tarot4.html','course_tarot5.html','course_tarot6.html','course_tarot7.html']},
  {key:'fun',t:'გასართობი',href:'index.html?g=fun',pages:['*']}
];
const OWN={'account.html':'ჩემი ანგარიში','about.html':'ჩვენ შესახებ','contact.html':'კონტაქტი','privacy.html':'კონფიდენციალურობის პოლიტიკა',
  'terms.html':'წესები და პირობები','refund.html':'თანხის დაბრუნება','article.html':'სტატია','systems.html':'სისტემები'};
const HUBS=new Set(['life.html','stats.html','games.html']);
function sectionOf(p){
  if(p==='index.html'||OWN[p])return null;
  /* came from a section page? keep that one */
  const ref=document.referrer||'';const m=/index\.html\?g=([a-z]+)/.exec(ref);
  if(m){const s=SECTIONS.find(x=>x.key===m[1]);if(s&&(s.pages.includes(p)||s.key==='fun'))return s;}
  return SECTIONS.find(s=>s.pages.includes(p))||SECTIONS[SECTIONS.length-1];
}
const qs=new URLSearchParams(location.search);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pageTitle=()=>{if(OWN[P])return OWN[P];const h=document.querySelector('h1');let t=(h&&h.textContent.trim())||document.title.replace(/^MAGNUS\s*[·|—-]\s*/,'').replace(/\s*[·|—-]\s*MAGNUS$/,'');return t.replace(/[✦✧★☆⟡◆◇•·]/g,' ').replace(/\s+/g,' ').trim().slice(0,60);};

const CSS=`
/* dropdown lists: readable on every page (dark list, light text) */
select option,select optgroup{background:#0e1424!important;color:#F3E6C8!important}
select optgroup{color:#C9A24C!important;font-style:normal}
select{color-scheme:dark}
#mg-head::before,#mg-head::after{content:none!important;display:none!important}
#mg-head{flex-direction:row!important;justify-content:flex-start!important;text-align:left!important;margin-bottom:0!important;box-sizing:border-box;width:100%;align-self:stretch;position:relative;z-index:50;display:flex;align-items:center;gap:10px 16px;flex-wrap:wrap;
  padding:9px max(16px,env(safe-area-inset-right,0px)) 9px max(16px,env(safe-area-inset-left,0px));margin:0 0 6px;
  background:rgba(12,18,34,.92);border-bottom:1px solid rgba(184,137,74,.28);backdrop-filter:blur(6px);
  font:13px/1.3 'Noto Serif Georgian',system-ui,sans-serif;color:#BCC0CA;text-align:left}
#mg-head a{color:inherit;text-decoration:none}
#mg-head .brand{font:600 16px/1 'Marcellus SC','Noto Serif Georgian',Georgia,serif;letter-spacing:.14em;color:#E3BE84;white-space:nowrap}
#mg-head .crumbs{display:flex;align-items:center;gap:6px;min-width:0;flex:1;overflow:hidden;white-space:nowrap}
#mg-head .crumbs a:hover,#mg-head nav a:hover{color:#E3BE84}
#mg-head .crumbs .sep{opacity:.45}
#mg-head .crumbs .cur{color:#EDE6D8;overflow:hidden;text-overflow:ellipsis}
#mg-head nav{display:none;width:100%;flex-wrap:wrap;gap:4px 8px;padding-top:8px;border-top:1px solid rgba(184,137,74,.18)}
#mg-head.open nav{display:flex}
#mg-head nav a{padding:6px 12px;border:1px solid rgba(184,137,74,.22);border-radius:2px;white-space:nowrap}
#mg-head nav a.on{color:#E3BE84;border-color:#B8894A;background:rgba(184,137,74,.12)}
#mg-head .burger{all:unset;cursor:pointer;color:#E3BE84;font-size:13px;line-height:1;padding:7px 12px;border:1px solid rgba(184,137,74,.45);border-radius:2px;white-space:nowrap}
#mg-head .burger:hover{background:rgba(184,137,74,.12)}
#mg-head .burger:focus-visible,#mg-foot a:focus-visible,#mg-head a:focus-visible{outline:2px solid #E3BE84;outline-offset:2px}
@media(max-width:600px){#mg-head .crumbs .home,#mg-head .crumbs .home+.sep{display:none}
  #mg-head nav{flex-direction:column;gap:0}#mg-head nav a{border:0;border-bottom:1px solid rgba(184,137,74,.1);border-radius:0;padding:10px 2px}
  #mg-head .burger .w{display:none}}
#mg-foot{box-sizing:border-box;width:100%;align-self:stretch;clear:both;margin-top:40px;position:relative;z-index:1;
  padding:22px max(16px,env(safe-area-inset-right,0px)) calc(70px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));
  background:rgba(12,18,34,.96);border-top:1px solid rgba(184,137,74,.25);font:12.5px/1.6 'Noto Serif Georgian',system-ui,sans-serif;color:#BCC0CA;text-align:center}
#mg-foot .links{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 18px;margin-bottom:10px}
#mg-foot a{color:#E3BE84;text-decoration:none}#mg-foot a:hover{color:#E3BE84;text-decoration:underline}
#mg-foot .note{max-width:760px;margin:0 auto 8px;font-size:11.5px;opacity:.85}
#mg-foot .copy{font-size:11.5px;opacity:.75}
#mg-consent{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(64px + env(safe-area-inset-bottom,0px));z-index:9993;width:min(560px,calc(100% - 24px));box-sizing:border-box;
  background:#111A2E;border:1px solid rgba(184,137,74,.55);border-radius:2px;padding:14px 16px;color:#EDE6D8;box-shadow:0 12px 40px rgba(0,0,0,.6);
  font:13px/1.55 'Noto Serif Georgian',system-ui,sans-serif}
#mg-consent a{color:#E3BE84}
#mg-consent .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;justify-content:flex-end}
#mg-consent button{all:unset;cursor:pointer;padding:7px 14px;border-radius:2px;border:1px solid rgba(184,137,74,.5);color:#E3BE84;font-size:13px}
#mg-consent button.pri{background:#B8894A;color:#0C1222;border-color:#B8894A;font-weight:600}
#mg-consent button:focus-visible{outline:2px solid #E3BE84;outline-offset:2px}`;

function header(){
  if(P==='index.html'&&!qs.get('g'))return;                 /* the main menu is the home page itself */
  const sec=sectionOf(P);
  const g=qs.get('g'),gs=g&&SECTIONS.find(s=>s.key===g);
  const h=document.createElement('header');h.id='mg-head';h.setAttribute('role','banner');
  let crumbs=`<a class="home" href="index.html">მთავარი</a>`;
  const par=sec&&sec.parent&&SECTIONS.find(x=>x.key===sec.parent);
  if(par&&P!=='index.html')crumbs+=`<span class="sep">›</span><a href="${par.href}">${esc(par.t)}</a>`;
  const gp=gs&&gs.parent&&SECTIONS.find(x=>x.key===gs.parent);
  if(P==='index.html'&&gp)crumbs+=`<span class="sep">›</span><a href="${gp.href}">${esc(gp.t)}</a>`;
  if(P==='index.html'&&gs)crumbs+=`<span class="sep">›</span><span class="cur">${esc(gs.t)}</span>`;
  else if(sec&&HUBS.has(P)&&sec.href===P)crumbs+=`<span class="sep">›</span><span class="cur">${esc(sec.t)}</span>`;
  else{if(sec)crumbs+=`<span class="sep">›</span><a href="${sec.href}">${esc(sec.t)}</a>`;
    const t=pageTitle();if(!sec||t!==sec.t)crumbs+=`<span class="sep">›</span><span class="cur">${esc(t)}</span>`;}
  const active=gs?gs.key:sec&&sec.key;
  h.innerHTML=`<a class="brand" href="index.html" aria-label="MAGNUS — მთავარი მენიუ">MAGNUS</a>
    <div class="crumbs" aria-label="სად ხართ">${sec&&!(P==='index.html')?`<a href="${sec.href}" aria-label="უკან: ${esc(sec.t)}">←</a>`:''}${crumbs}</div>
    <button class="burger" type="button" aria-label="განყოფილებები" aria-expanded="false">☰<span class="w"> განყოფილებები</span></button>
    <nav aria-label="განყოფილებები">${SECTIONS.filter(s=>!s.parent).map(s=>`<a href="${s.href}" class="${s.key===active||(gs&&gs.parent===s.key)||(sec&&sec.parent===s.key&&!gs)?'on':''}">${s.t}</a>`).join('')}</nav>`;
  const b=h.querySelector('.burger');b.onclick=()=>{const o=h.classList.toggle('open');b.setAttribute('aria-expanded',o);};
  document.body.insertBefore(h,document.body.firstChild);
  document.querySelectorAll('a.back,#grp-back').forEach(a=>{const href=a.getAttribute('href')||'';
    if(/^(index|life|games|stats)\.html/.test(href)&&!a.closest('#mg-head'))a.style.display='none';});
}
function footer(){
  const f=document.createElement('footer');f.id='mg-foot';f.setAttribute('role','contentinfo');
  const y=new Date().getFullYear();
  f.innerHTML=`<div class="links"><a href="index.html">მთავარი</a><a href="about.html">ჩვენ შესახებ</a><a href="contact.html">კონტაქტი</a>
      <a href="privacy.html">კონფიდენციალურობის პოლიტიკა</a><a href="terms.html">წესები და პირობები</a><a href="refund.html">თანხის დაბრუნება</a><a href="account.html">ჩემი ანგარიში</a>
      <a href="#" id="mg-cookie-set">ბრაუზერის მეხსიერება და სტატისტიკა</a></div>
    <div class="note">MAGNUS-ის გამოთვლები და ტექსტები განკუთვნილია თვითშემეცნებისა და გართობისთვის. ისინი არ არის სამედიცინო, ფსიქოლოგიური, ფინანსური ან იურიდიული რჩევა — ჯანმრთელობის საკითხებზე მიმართეთ ექიმს.</div>
    <div class="copy">© ${y} ${esc(OWNER.legal||OWNER.brand)}${OWNER.idcode?' · ს/კ '+esc(OWNER.idcode):''}${OWNER.email?' · '+esc(OWNER.email):''}</div>`;
  document.body.appendChild(f);
  f.querySelector('#mg-cookie-set').onclick=e=>{e.preventDefault();consent(true);};
}

/* ── privacy notice: shown once; "essential only" switches activity statistics off ── */
const LS={get:k=>{try{return localStorage.getItem(k);}catch(e){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}}};
function consent(force){
  if(!force&&LS.get('magnus_consent'))return;
  if(document.getElementById('mg-consent'))return;
  const cur=LS.get('magnus_consent');
  const c=document.createElement('div');c.id='mg-consent';c.setAttribute('role','dialog');c.setAttribute('aria-label','კონფიდენციალურობა');
  c.innerHTML=`<b style="color:#E3BE84">ბრაუზერის მეხსიერება და სტატისტიკა</b><br>
    MAGNUS ინახავს ბრაუზერში თქვენს პარამეტრებს და შესვლის მონაცემს (სარეკლამო ქუქიებს არ ვიყენებთ). საიტის გასაუმჯობესებლად ვაგროვებთ სტატისტიკას — რომელ გვერდებს ნახულობთ და რას ითვლით.
    დეტალები: <a href="privacy.html">კონფიდენციალურობის პოლიტიკა</a>.${cur?`<br><span style="opacity:.75">ახლა: ${cur==='all'?'სტატისტიკა ჩართულია':'მხოლოდ აუცილებელი'}</span>`:''}
    <div class="row"><button type="button" data-c="essential">მხოლოდ აუცილებელი</button><button type="button" class="pri" data-c="all">ვეთანხმები</button></div>`;
  c.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;LS.set('magnus_consent',b.dataset.c);c.remove();
    document.dispatchEvent(new CustomEvent('magnus:consent',{detail:b.dataset.c}));});
  document.body.appendChild(c);
}


/* ── every tab has its own address: page.html#tab (tabs inside tabs: #tab/sub) ──
   Finds the page's tab bars (astro .tab-btn + setMode, matrix .method-btn + setMethod,
   pythagoras .mode-pill, pills, .tabs …, including tabs other scripts add later), names each
   tab (its own key — natal, synastry, trutine … — or the Georgian label in Latin letters),
   writes the address on every switch (Back steps through tabs) and opens the tab from the
   address on load. The breadcrumb shows the open tab.                                      */
const PILL_PAGES=new Set(['iching.html']);
const NO_TABS=new Set(['index.html','account.html','about.html','contact.html','privacy.html','terms.html','refund.html','article.html']);
const TAB_SEL='.tab-bar .tab-btn,.tab-btn,.method-bar .method-btn,.method-btn,#pp-nav .mode-pill,.mode-pill,[role=tab],.tabs>.tab,.tabs>button,.pills>.pill,.pill';
const KA={'ა':'a','ბ':'b','გ':'g','დ':'d','ე':'e','ვ':'v','ზ':'z','თ':'t','ი':'i','კ':'k','ლ':'l','მ':'m','ნ':'n','ო':'o','პ':'p','ჟ':'zh','რ':'r','ს':'s','ტ':'t','უ':'u','ფ':'p','ქ':'k','ღ':'gh','ყ':'q','შ':'sh','ჩ':'ch','ც':'ts','ძ':'dz','წ':'ts','ჭ':'ch','ხ':'kh','ჯ':'j','ჰ':'h'};
const ALIAS={tru:'trutine',dr:'directions',m1:'method-1',m2:'method-2',m3:'method-3',mc:'compatibility',ms:'statistics',mp:'people'};
const slugify=t=>[...String(t).toLowerCase()].map(c=>KA[c]!==undefined?KA[c]:c).join('').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);
const tabLabel=b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/[✦✧★☆⟡◆◇•]/g,' ').replace(/\s+/g,' ').trim();
function tabKey(b){
  const oc=b.getAttribute('onclick')||'';
  let m=/(?:setMode|setTab|setView|showTab|switchTab|openTab|selectTab)\(\s*['"]([\w-]+)['"]/.exec(oc);if(m)return slugify(m[1]);
  for(const a of ['data-v','data-t','data-tab','data-mode','data-view','data-key'])if(b.getAttribute(a))return slugify(b.getAttribute(a));
  if(b.id){const id=b.id.replace(/^(btn|tab)-/,'').replace(/-(tab-btn|tab|btn)$/,'');if(id&&!/^\d+$/.test(id))return ALIAS[id]||slugify(id);}
  m=/setMethod\(\s*(\d+)/.exec(oc);if(m)return 'method-'+m[1];
  return slugify(tabLabel(b))||null;
}
const isOn=b=>b.classList.contains('active')||b.classList.contains('on')||b.classList.contains('sel')||b.getAttribute('aria-selected')==='true';
let GROUPS=[];
function scanTabs(){
  const by=new Map();
  document.querySelectorAll(TAB_SEL).forEach(b=>{
    if(b.closest('#mg-head,#mg-foot,#mg-consent,.mg-ov,.mg-dlg,#mg-menu,[role=dialog],.overlay,.modal,#modal'))return;
    const p=b.parentElement;if(!p)return;if(!by.has(p))by.set(p,[]);if(!by.get(p).includes(b))by.get(p).push(b);});
  const old=new Map(GROUPS.map(g=>[g.el,g]));
  GROUPS=[...by.entries()].filter(([el,bs])=>bs.length>=2).map(([el,bs])=>{
    const g=old.get(el)||{el,def:null};g.btns=bs;
    const seen={};g.keys=bs.map(b=>{let k=tabKey(b)||'tab';if(seen[k])k+='-'+(++seen[k]);else seen[k]=1;return k;});
    if(g.def==null){const i=bs.findIndex(isOn);g.def=i<0?0:i;}
    return g;});
  return GROUPS;
}
const activeIdx=g=>{const i=g.btns.findIndex(isOn);return i<0?(g.cur!=null?g.cur:g.def):i;};
function tabState(){return GROUPS.map(g=>{const i=g.cur!=null?g.cur:activeIdx(g);return i!==g.def?{k:g.keys[i],t:tabLabel(g.btns[i])}:null;}).filter(Boolean);}
function tabCrumb(){
  const h=document.getElementById('mg-head');if(!h)return;const c=h.querySelector('.crumbs');if(!c)return;
  c.querySelectorAll('.tabc').forEach(e=>e.remove());
  for(const t of tabState()){const sp=document.createElement('span');sp.className='sep tabc';sp.textContent='›';
    const x=document.createElement('span');x.className='cur tabc';x.textContent=t.t.slice(0,40);c.appendChild(sp);c.appendChild(x);}
}
let applying=false;
function writeHash(push){
  if(applying)return;
  const st=tabState(),h=st.length?'#'+st.map(t=>t.k).join('/'):'';
  if(h===(location.hash||''))return tabCrumb();
  if(/=/.test(location.hash))return tabCrumb();                  /* #restore=… etc. belong to other scripts */
  const url=location.pathname+location.search+h;
  try{push?history.pushState({mgTabs:1},'',url):history.replaceState(history.state,'',url);}catch(e){}
  tabCrumb();
}
function applyHash(){
  const raw=decodeURIComponent((location.hash||'').slice(1));
  scanTabs();
  if(!raw||/=/.test(raw)){
    if(!raw)GROUPS.forEach(g=>{const b=g.btns[g.def];if(b&&activeIdx(g)!==g.def&&history.state&&history.state.mgTabs){applying=true;try{b.click();}finally{applying=false;}}});
    return tabCrumb();}
  const want=raw.split('/');let hit=0;
  for(const k of want){scanTabs();
    for(const g of GROUPS){const i=g.keys.indexOf(k);
      if(i>=0){g.cur=i;if(activeIdx(g)!==i||!isOn(g.btns[i])){applying=true;try{g.btns[i].click();}finally{applying=false;}}hit++;break;}}}
  tabCrumb();return hit===want.length;
}
function tabs(){
  if(NO_TABS.has(P))return;
  document.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest(TAB_SEL);if(!b||applying)return;
    scanTabs();const g=GROUPS.find(x=>x.btns.includes(b));if(!g)return;
    g.cur=g.btns.indexOf(b);
    setTimeout(()=>{scanTabs();writeHash(true);},0);
  },true);
  addEventListener('popstate',()=>{GROUPS.forEach(g=>g.cur=null);applyHash();});
  /* open the tab from the address once the page's own scripts have built their tabs */
  let n=0;const tryOpen=()=>{const ok=applyHash();if(!ok&&location.hash&&++n<12)setTimeout(tryOpen,350);};
  setTimeout(tryOpen,location.hash?250:600);
}

/* ── the page's main tab bar becomes a block of square tiles ──
   Same buttons and handlers; only the look changes. On wide screens (≥ 1000px), when the bar
   sits right before the page's data box, the tiles stand to the left of that box; otherwise
   they stay where the page put them, as a centred block.                                   */
const TILE_CSS=`
/* the page's mode tabs: one centred pill bar above the input form, like the Western astrology page */
html body :is(.mg-tiles,#vp-tabs,.pills){display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:4px!important;
  width:max-content!important;max-width:calc(100% - 24px)!important;margin:18px auto 22px!important;padding:5px!important;box-sizing:border-box!important;
  background:rgba(12,18,34,.55)!important;border:1px solid rgba(201,162,76,.35)!important;border-radius:999px!important;box-shadow:none!important;
  overflow:visible!important;flex-direction:row!important;position:relative!important;z-index:2;height:auto!important}
html body :is(.mg-tiles,#vp-tabs,.pills)>*{flex:0 0 auto!important;width:auto!important;height:auto!important;min-width:0!important;margin:0!important;box-sizing:border-box!important;
  display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;padding:7px 15px!important;
  white-space:nowrap!important;background:transparent!important;border:1px solid transparent!important;border-radius:999px!important;
  color:#CFC6B0!important;font:400 13px/1.3 'Noto Serif Georgian',Georgia,serif!important;letter-spacing:.3px!important;text-transform:none!important;text-decoration:none!important;
  box-shadow:none!important;transform:none!important;cursor:pointer;transition:border-color .2s,color .2s,background .2s!important}
html body :is(.mg-tiles,#vp-tabs,.pills)>* i{font-style:normal;display:inline;font-size:14px;margin:0 5px 0 0}
html body :is(.mg-tiles,#vp-tabs,.pills)>*:hover{color:#EDE6D8!important;border-color:rgba(184,137,74,.5)!important}
html body :is(.mg-tiles,#vp-tabs,.pills)>.active,html body :is(.mg-tiles,#vp-tabs,.pills)>.on,html body :is(.mg-tiles,#vp-tabs,.pills)>.sel,html body :is(.mg-tiles,#vp-tabs,.pills)>[aria-selected=true]{color:#E3BE84!important;border-color:#E3BE84!important;background:rgba(227,190,132,.08)!important}
@media(max-width:700px){html body :is(.mg-tiles,#vp-tabs,.pills){border-radius:18px!important;width:auto!important}html body :is(.mg-tiles,#vp-tabs,.pills)>*{white-space:normal!important;padding:6px 11px!important;font-size:12.5px!important}}
`;
let sideEl=null;
function tileLayout(n,bench){
  const gap=8,vw=Math.min(innerWidth,document.documentElement.clientWidth||innerWidth);
  let tile=bench?100:96,cols;
  if(bench){let best=null;for(let c=2;c<=5;c++){const r=Math.ceil(n/c),k=[r*c-n,Math.abs(r-c),c<r?1:0];if(!best||k[0]<best.k[0]||(k[0]===best.k[0]&&(k[2]<best.k[2]||(k[2]===best.k[2]&&k[1]<best.k[1]))))best={c,k};}cols=best.c;}
  else{cols=Math.min(n,n<=6?n:Math.ceil(n/Math.ceil(n/8)));
    const room=vw-32;while(cols>1&&cols*tile+(cols-1)*gap>room){if(tile>80)tile-=4;else cols--;}
    /* balanced rows: e.g. 7 → 4+3, not 6+1 */
    const rows=Math.ceil(n/cols);cols=Math.ceil(n/rows);}
  return{tile,cols,gap,w:cols*tile+(cols-1)*gap};
}
function findBox(g){
  let x=g.nextElementSibling;
  while(x){const r=x.getBoundingClientRect();
    if(getComputedStyle(x).display!=='none'&&r.height>=120&&r.width>=280&&!/^(SCRIPT|STYLE)$/.test(x.tagName))
      return (x.querySelector('input:not([type=hidden]),select,textarea')&&r.height<1100&&r.top-g.getBoundingClientRect().bottom<160)?x:null;
    if(r.height>=120)return null;x=x.nextElementSibling;}
  return null;
}
function sideNav(){
  if(NO_TABS.has(P))return;
  if(document.documentElement.hasAttribute('data-tabmenu'))return;   /* tabmenu.js draws a grouped menu instead */
  scanTabs();
  const vis=GROUPS.filter(g=>g.el.offsetParent!==null||g.el.classList.contains('mg-tiles'));
  const sn=document.getElementById('subnav');
  if(!vis.length&&sn&&sn.children.length>1)vis.push({el:sn,btns:[...sn.children]});
  if(!vis.length)return;
  const main=vis.reduce((a,g)=>g.btns.length>a.btns.length?g:a,vis[0]);
  const el=main.el;
  if(sideEl!==el){
    if(sideEl)sideEl.classList.remove('mg-tiles');
    sideEl=el;el.classList.add('mg-tiles');
    {const box=findBox(el);if(box&&(box.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING))box.parentNode.insertBefore(el,box);}   /* bar always above the form */
  }
  layoutTiles();
}
function layoutTiles(){
  if(!sideEl)return;const el=sideEl,n=el.children.length,bench=el.closest('.mg-bench'),wide=innerWidth>=1000;
  const L=tileLayout(n,!!bench&&wide);const S=el.style;
  S.setProperty('--mg-tile',L.tile+'px');S.setProperty('--mg-gap',L.gap+'px');S.setProperty('--mg-tiles-w',L.w+'px');
  if(bench){const bw=+bench.dataset.boxW||900;bench.style.setProperty('--mg-box-w',bw+'px');bench.style.setProperty('--mg-bench-w',(L.w+22+bw)+'px');}
}

/* ── Destiny Matrix ground (background only — each page keeps its own boxes) ── */
const BG_SKIP=new Set([]);  /* dark purple background on every page */
/* every box in the colour of the home-page cards */
const CARD_SKIP=new Set(['cards.html','tarot.html','tarotborth.html','fool_journey.html','vector.html','index.html','matrix.html']);
const BOX_SEL='.panel,.form-card,.form-shell,.data-card,.input-panel,.stat,.box,#orb-panel,#asp-filters,.mg-tiles>*'+(CARD_SKIP.has(P)?'':',.card');
/* box colours — to go back to the old dark boxes set BOX_GREEN=false */
const BOX_GREEN=true;
const BOX_BG=BOX_GREEN?'transparent':'rgba(8,6,18,.72)';   /* boxes share the textured page background */
const BOX_BG_HI=BOX_GREEN?'rgba(227,190,132,.07)':'rgba(14,11,28,.88)';
const BOX_LINE=BOX_GREEN?'rgba(201,162,76,.5)':'rgba(201,168,76,.16)';
const BOX_TEXT='#FFFFFF';
const BOX_SEL2=BOX_SEL+(BOX_GREEN?',.cp,.nx,#lunar-badge,.result-box,.info-box,.section-card,.chart-box,.panel-box':'');
const BOX_R='14px';   /* corner radius of every box */
const BOX_CSS=`${BOX_SEL2}{background:${BOX_BG}!important;border-color:${BOX_LINE}!important;border-radius:${BOX_R}!important}
.data-card-title:first-child{border-top-left-radius:${BOX_R};border-top-right-radius:${BOX_R}}
${BOX_GREEN?BOX_SEL2+'{border-style:solid;border-width:1px}':''}
html body{color:${BOX_TEXT}}
label,input,select,textarea,p,.field label,.rc-note,.tz-display{color:${BOX_TEXT}!important}
input::placeholder,textarea::placeholder{color:rgba(255,255,255,.45)!important}
${BOX_GREEN?BOX_SEL2+'{color:'+BOX_TEXT+'}':''}
.mg-tiles>*:hover{background:${BOX_BG_HI}!important;border-color:#E3BE84!important}
.mg-tiles>.active,.mg-tiles>.on,.mg-tiles>.sel,.mg-tiles>[aria-selected=true]{background:${BOX_BG_HI}!important;border-color:#E3BE84!important}`;
/* page background — the original dark blue */
const BG_C='#0C1222';
const BG_CSS=`html{background:${BG_C}!important}
body{color:#FFFFFF}
body{background:${BG_C}!important}
body::before,body::after{background:none!important;background-image:none!important}`;
function start(){
  if(!document.querySelector('link[href*="Marcellus"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Marcellus+SC&family=Cinzel:wght@400;600&family=Noto+Serif+Georgian:wght@300;400;600&family=JetBrains+Mono:wght@300;400&display=swap';document.head.appendChild(l);}
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  if(!BG_SKIP.has(P)){const sb=document.createElement('style');sb.textContent=BG_CSS;document.head.appendChild(sb);}
  header();footer();consent(false);tabs();
  if(!NO_TABS.has(P)){const st2=document.createElement('style');st2.textContent=TILE_CSS;document.head.appendChild(st2);
    [0,500,1500,3500].forEach(t=>setTimeout(sideNav,t));
    document.addEventListener("click",()=>{if(!sideEl)[300,1200].forEach(t=>setTimeout(sideNav,t));},true);
    addEventListener('resize',layoutTiles);}
  if(!(P==='index.html'||P==='matrix.html')){const sx=document.createElement('style');sx.textContent=BOX_CSS;document.head.appendChild(sx);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

/* ── textured background everywhere; dark boxes take the same background (transparent) with a soft gold edge ── */
(function(){
  const BD='rgba(184,137,74,.38)';
  const NOISE="url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .86 0 0 0 0 .78 0 0 0 0 .6 0 0 0 .075 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
  const STARS="url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><g fill='%23E3BE84'><circle cx='23' cy='41' r='.9' opacity='.55'/><circle cx='131' cy='17' r='.6' opacity='.4'/><circle cx='287' cy='66' r='1.1' opacity='.5'/><circle cx='371' cy='133' r='.7' opacity='.45'/><circle cx='59' cy='207' r='.8' opacity='.35'/><circle cx='199' cy='171' r='.5' opacity='.5'/><circle cx='333' cy='251' r='.9' opacity='.4'/><circle cx='97' cy='313' r='.6' opacity='.5'/><circle cx='241' cy='349' r='1' opacity='.35'/><circle cx='397' cy='389' r='.6' opacity='.45'/><circle cx='163' cy='403' r='.7' opacity='.3'/><circle cx='11' cy='377' r='.5' opacity='.4'/></g><g fill='%23ffffff'><circle cx='211' cy='97' r='.5' opacity='.35'/><circle cx='77' cy='121' r='.4' opacity='.3'/><circle cx='309' cy='191' r='.5' opacity='.3'/><circle cx='143' cy='271' r='.4' opacity='.35'/><circle cx='381' cy='311' r='.5' opacity='.25'/></g></svg>\")";
  const TEX=[NOISE,STARS,
    'radial-gradient(ellipse 70% 55% at 12% 8%,rgba(112,84,196,.22),transparent 60%)',
    'radial-gradient(ellipse 60% 50% at 88% 92%,rgba(28,124,132,.17),transparent 60%)',
    'radial-gradient(ellipse 50% 40% at 50% 45%,rgba(201,162,76,.07),transparent 70%)',
    'linear-gradient(160deg,#0b1024 0%,#0e0b22 45%,#081619 100%)'].join(',');
  const SKIP=/^(HTML|BODY|INPUT|SELECT|TEXTAREA|BUTTON|OPTION|CANVAS|SVG|IMG|VIDEO|IFRAME)$/;
  function rgb(c){const m=c&&c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null;}
  function dark(c){const v=rgb(c);if(!v||v[3]<.2)return false;const L=(.2126*v[0]+.7152*v[1]+.0722*v[2])/255;return L<.16&&Math.max(v[0],v[1],v[2])-Math.min(v[0],v[1],v[2])<70;}
  function gradDark(img){if(!img||img==='none'||!/gradient/.test(img)||/url\(/.test(img))return false;
    const cs=img.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi)||[];if(!cs.length)return false;
    return cs.every(c=>{if(c[0]==='#'){let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return (.2126*r+.7152*g+.0722*b)/255<.16;}
      const v=rgb(c);if(v&&v[3]<.2)return true;return dark(c);});}
  function texture(){
    const b=document.body;if(!b)return false;const cs=getComputedStyle(b),hs=getComputedStyle(document.documentElement);
    const pageDark=dark(cs.backgroundColor)||gradDark(cs.backgroundImage)||dark(hs.backgroundColor)||(rgb(cs.backgroundColor)||[0,0,0,0])[3]===0;
    if(!pageDark)return false;
    if(!document.getElementById('mg-tex')){const st=document.createElement('style');st.id='mg-tex';
      st.textContent='html{background:#0b1024!important}html body{background:'+TEX+'!important;background-attachment:fixed!important;background-size:240px 240px,420px 420px,100% 100%,100% 100%,100% 100%,100% 100%!important}';
      document.head.appendChild(st);}
    return true;
  }
  function fix(el){
    if(el.nodeType!==1||el.dataset.mgTex||SKIP.test(el.tagName.toUpperCase()))return;
    if(el.closest('#mg-head,#mg-foot,#mg-consent,svg'))return;
    const cs=getComputedStyle(el);if(!(dark(cs.backgroundColor)||gradDark(cs.backgroundImage)))return;
    if(cs.position==='fixed'||cs.position==='absolute'||cs.position==='sticky')return;   /* menus, pop-ups, tooltips keep their fill */
    const w=el.offsetWidth,h=el.offsetHeight,rad=cs.borderTopLeftRadius;
    if(w||h){if(w<30||h<20)return;if(parseFloat(rad)>=Math.min(w,h)/2-1)return;}          /* small badges and circles stay */
    else if(/%$/.test(rad)?parseFloat(rad)>=50:parseFloat(rad)>=100)return;                 /* hidden right now: decide by radius */
    el.style.setProperty('background','transparent','important');
    if(parseFloat(cs.borderTopWidth)>0)el.style.setProperty('border-color',BD,'important');
    el.style.setProperty('box-shadow','none','important');
    el.dataset.mgTex='1';rec(el,parseFloat(cs.borderTopWidth)>0);
  }
  let ON=false;
  function pass(){
    if(!document.body||document.body.dataset.nogrey!==undefined)return;
    if(!texture())return;ON=true;
    const all=document.body.getElementsByTagName('*');for(let i=0;i<all.length;i++)fix(all[i]);
    save();
  }
  /* new content is fixed in the same frame it is added (mutation callbacks run before paint) */
  function onMut(ms){if(!ON)return;let n=0;
    for(const m of ms)for(const nd of m.addedNodes){if(nd.nodeType!==1)continue;fix(nd);const d=nd.getElementsByTagName('*');for(let i=0;i<d.length;i++)fix(d[i]);n++;}
    if(n)save();}
  /* remember converted boxes per page so the next load paints them right from the first frame (boot snippet in <head>) */
  const SB=new Set(),SN=new Set();
  const esc=x=>(window.CSS&&window.CSS.escape)?window.CSS.escape(x):String(x).replace(/[^\w-]/g,'\\$&');
  function selOf(el){if(el.id&&!/\d{3,}/.test(el.id))return '#'+esc(el.id);
    const c=[...el.classList].filter(x=>!/^(on|open|active|show|closed|hidden)$/.test(x));return c.length?el.tagName.toLowerCase()+'.'+c.map(esc).join('.'):null;}
  function rec(el,b){const q=selOf(el);if(q&&SB.size+SN.size<300)(b?SB:SN).add(q);}
  let sv=null;function save(){clearTimeout(sv);sv=setTimeout(()=>{try{
    let css=document.getElementById('mg-tex')?document.getElementById('mg-tex').textContent:'';
    if(SN.size)css+=[...SN].join(',')+'{background:transparent!important;box-shadow:none!important}';
    if(SB.size)css+=[...SB].join(',')+'{background:transparent!important;box-shadow:none!important;border-color:'+BD+'!important}';
    localStorage.setItem('mg_tex:'+location.pathname,css);}catch(e){}},400);}
  function reveal(){requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('mg-pre')));}
  function start(){try{pass();}catch(e){}reveal();new MutationObserver(onMut).observe(document.body,{childList:true,subtree:true});}
  function go(){start();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(go,0));else setTimeout(go,0);
  window.MAGNUS_TEX=pass;
})();
})();
