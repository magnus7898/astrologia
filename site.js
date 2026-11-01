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
  {key:'astrology',t:'ასტროლოგია',href:'index.html?g=astrology',pages:['astro.html','vedic.html','vedictrop.html','true_sidereal.html','hdastro.html','moon.html','planeta.html','asteroid.html','skycal.html','bazi.html','ziwei.html','tibet.html','tzolkin.html','celtic.html','sky.html','mars.html']},
  {key:'numerology',t:'ნუმეროლოგია',href:'index.html?g=numerology',pages:['matrix.html','pythagoras.html','name.html','tarotborth.html','kabbalah.html','numerology.html']},
  {key:'hd',t:'ადამიანის დიზაინი',href:'index.html?g=hd',pages:['hd.html','genekeys.html','iching.html','types.html']},
  {key:'life',t:'ცხოვრების რუქა',href:'life.html',pages:['life.html','work.html','duty.html','energy.html','body.html']},
  {key:'compat',t:'შეთავსება',href:'compat.html',pages:['compat.html']},
  {key:'stats',t:'სტატისტიკა',href:'stats.html',pages:['stats.html']},
  {key:'health',t:'ჯანმრთელობა',href:'index.html?g=health',pages:['daily.html','breath.html','sleep.html','water.html','move.html','eyes.html','meditation.html','cold.html','fasting.html','rhythm.html','recover.html','bio.html']},
  {key:'science',t:'მეცნიერებები',href:'index.html?g=science',pages:['math.html','math_classic.html','phys.html','chem.html','biology.html','sciencegames.html','fourier.html','vector.html','funcgame.html']},
  {key:'games',t:'თამაშები',href:'games.html',pages:['games.html','intuition.html','memory.html','logic.html','hardest.html','sudoku.html','nonogram.html','pythagames.html']},
  {key:'fun',t:'გასართობი',href:'index.html?g=fun',pages:['*']}
];
const OWN={'account.html':'ჩემი ანგარიში','about.html':'ჩვენ შესახებ','contact.html':'კონტაქტი','privacy.html':'კონფიდენციალურობის პოლიტიკა',
  'terms.html':'წესები და პირობები','refund.html':'თანხის დაბრუნება','article.html':'სტატია','systems.html':'სისტემები'};
const HUBS=new Set(['life.html','stats.html','games.html','compat.html']);
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
#mg-head{box-sizing:border-box;width:100%;align-self:stretch;position:relative;z-index:50;display:flex;align-items:center;gap:10px 16px;flex-wrap:wrap;
  padding:9px max(16px,env(safe-area-inset-right,0px)) 9px max(16px,env(safe-area-inset-left,0px));margin:0 0 6px;
  background:rgba(11,20,24,.92);border-bottom:1px solid rgba(184,137,74,.28);backdrop-filter:blur(6px);
  font:13px/1.3 'Noto Serif Georgian',system-ui,sans-serif;color:#B9BFBC;text-align:left}
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
  background:rgba(11,20,24,.96);border-top:1px solid rgba(184,137,74,.25);font:12.5px/1.6 'Noto Serif Georgian',system-ui,sans-serif;color:#B9BFBC;text-align:center}
#mg-foot .links{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 18px;margin-bottom:10px}
#mg-foot a{color:#E3BE84;text-decoration:none}#mg-foot a:hover{color:#E3BE84;text-decoration:underline}
#mg-foot .note{max-width:760px;margin:0 auto 8px;font-size:11.5px;opacity:.85}
#mg-foot .copy{font-size:11.5px;opacity:.75}
#mg-consent{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(64px + env(safe-area-inset-bottom,0px));z-index:9993;width:min(560px,calc(100% - 24px));box-sizing:border-box;
  background:#101E24;border:1px solid rgba(184,137,74,.55);border-radius:2px;padding:14px 16px;color:#EDE6D8;box-shadow:0 12px 40px rgba(0,0,0,.6);
  font:13px/1.55 'Noto Serif Georgian',system-ui,sans-serif}
#mg-consent a{color:#E3BE84}
#mg-consent .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;justify-content:flex-end}
#mg-consent button{all:unset;cursor:pointer;padding:7px 14px;border-radius:2px;border:1px solid rgba(184,137,74,.5);color:#E3BE84;font-size:13px}
#mg-consent button.pri{background:#B8894A;color:#0B1418;border-color:#B8894A;font-weight:600}
#mg-consent button:focus-visible{outline:2px solid #E3BE84;outline-offset:2px}`;

function header(){
  if(P==='index.html'&&!qs.get('g'))return;                 /* the main menu is the home page itself */
  const sec=sectionOf(P);
  const g=qs.get('g'),gs=g&&SECTIONS.find(s=>s.key===g);
  const h=document.createElement('header');h.id='mg-head';h.setAttribute('role','banner');
  let crumbs=`<a class="home" href="index.html">მთავარი</a>`;
  if(P==='index.html'&&gs)crumbs+=`<span class="sep">›</span><span class="cur">${esc(gs.t)}</span>`;
  else if(sec&&HUBS.has(P)&&sec.href===P)crumbs+=`<span class="sep">›</span><span class="cur">${esc(sec.t)}</span>`;
  else{if(sec)crumbs+=`<span class="sep">›</span><a href="${sec.href}">${esc(sec.t)}</a>`;
    const t=pageTitle();if(!sec||t!==sec.t)crumbs+=`<span class="sep">›</span><span class="cur">${esc(t)}</span>`;}
  const active=gs?gs.key:sec&&sec.key;
  h.innerHTML=`<a class="brand" href="index.html" aria-label="MAGNUS — მთავარი მენიუ">MAGNUS</a>
    <div class="crumbs" aria-label="სად ხართ">${sec&&!(P==='index.html')?`<a href="${sec.href}" aria-label="უკან: ${esc(sec.t)}">←</a>`:''}${crumbs}</div>
    <button class="burger" type="button" aria-label="განყოფილებები" aria-expanded="false">☰<span class="w"> განყოფილებები</span></button>
    <nav aria-label="განყოფილებები">${SECTIONS.map(s=>`<a href="${s.href}" class="${s.key===active?'on':''}">${s.t}</a>`).join('')}</nav>`;
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

function start(){
  if(!document.querySelector('link[href*="Marcellus"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Marcellus+SC&family=Cinzel:wght@400;600&family=Noto+Serif+Georgian:wght@300;400;600&family=JetBrains+Mono:wght@300;400&display=swap';document.head.appendChild(l);}
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  header();footer();consent(false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
