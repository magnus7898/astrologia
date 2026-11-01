/* account.js — MAGNUS ანგარიში: one file for every page (load before </body>).
   • 👤 button (bottom-left): login / register / forgot password, menu with the account page,
     "save this page" and log out.
   • ჩემი ხალხი: next to every birth form (fields PREFIX-day / -month / -year …, or a date input)
     a 👥 picker fills the form from a saved person and 💾 saves the person typed in.
   • Saved page states: every input on the page (by id) is stored on the account and can be
     reopened on any device — account.html links back with  page.html#restore=ID.
   • Tracking: page views, tab switches, button presses (calculations with the form values),
     select / checkbox changes — batched to /api/track; anonymous visits are linked to the
     account on register / login.
   • Pro pages: pages marked in the admin panel show a lock for free accounts.
   window.MAGNUS = {api, user, open, track, savePage, people, can}                            */
(function(){
'use strict';
if(window.MAGNUS&&window.MAGNUS._ready)return;
const API='https://astrology-production-b165.up.railway.app';
const PAGE=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const ADMINPG=/^admin/.test(PAGE),OWNPG=PAGE==='account.html'||ADMINPG;
const LS={get:k=>{try{return localStorage.getItem(k);}catch(e){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}},del:k=>{try{localStorage.removeItem(k);}catch(e){}}};
const rid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
let DEVICE=LS.get('magnus_device');if(!DEVICE){DEVICE=rid();LS.set('magnus_device',DEVICE);}
let SESSION;try{SESSION=sessionStorage.getItem('magnus_session');if(!SESSION){SESSION=rid();sessionStorage.setItem('magnus_session',SESSION);}}catch(e){SESSION=rid();}
let TOKEN=LS.get('magnus_token')||'';
let USER=null;try{USER=JSON.parse(LS.get('magnus_user')||'null');}catch(e){}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id);

async function api(path,opts={}){
  const h={'Content-Type':'application/json'};if(TOKEN)h.Authorization='Bearer '+TOKEN;
  const r=await fetch(API+path,{method:opts.method||'GET',headers:h,body:opts.body!=null?JSON.stringify(opts.body):undefined,keepalive:!!opts.keepalive});
  let d=null;try{d=await r.json();}catch(e){}
  if(r.status===401&&TOKEN&&!opts.noLogout){setSession(null,null);}
  if(!r.ok)throw Object.assign(new Error((d&&d.error)||('შეცდომა '+r.status)),{status:r.status,data:d});
  return d;
}
function setSession(tok,user){
  TOKEN=tok||'';USER=user||null;
  if(TOKEN)LS.set('magnus_token',TOKEN);else LS.del('magnus_token');
  if(USER)LS.set('magnus_user',JSON.stringify(USER));else LS.del('magnus_user');
  peopleCache=null;drawPill();gate();
  document.dispatchEvent(new CustomEvent('magnus:user',{detail:USER}));
}

/* ───────── styles ───────── */
const CSS=`
#mg-pill{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9990;
  display:flex;align-items:center;gap:6px;background:rgba(10,8,28,.92);border:1px solid rgba(201,162,76,.55);color:#F0D48A;border-radius:999px;
  padding:7px 13px;font:500 12.5px/1.2 "Noto Sans Georgian",system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.45);backdrop-filter:blur(4px)}
#mg-pill:hover{border-color:#F0D48A}
#mg-pill .dot{width:7px;height:7px;border-radius:50%;background:#7fd89a}
#mg-pill .pro{font-size:9.5px;letter-spacing:.08em;background:#C9A24C;color:#1d1405;border-radius:4px;padding:1px 5px}
#mg-menu{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(56px + env(safe-area-inset-bottom,0px));z-index:9991;min-width:230px;
  background:#0d0a22;border:1px solid rgba(201,162,76,.45);border-radius:12px;padding:6px;box-shadow:0 10px 30px rgba(0,0,0,.55);font:13px/1.3 "Noto Sans Georgian",system-ui,sans-serif}
#mg-menu .hd{padding:8px 10px;color:#c9b99a;font-size:11.5px;border-bottom:1px solid rgba(201,162,76,.2);margin-bottom:4px}
#mg-menu .hd b{display:block;color:#F0D48A;font-weight:500;font-size:13px}
#mg-menu button,#mg-menu a{all:unset;box-sizing:border-box;display:block;width:100%;padding:8px 10px;border-radius:8px;color:#f3ecdc;cursor:pointer}
#mg-menu button:hover,#mg-menu a:hover{background:rgba(201,162,76,.14)}
#mg-menu .warn{color:#e8c06e;font-size:11.5px;padding:6px 10px}
.mg-ov{position:fixed;inset:0;z-index:9995;background:rgba(4,3,14,.72);display:flex;align-items:center;justify-content:center;
  padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));font-family:"Noto Sans Georgian",system-ui,sans-serif}
.mg-dlg{background:#0d0a22;border:1px solid rgba(201,162,76,.55);border-radius:16px;padding:20px;width:min(400px,100%);max-height:100%;overflow:auto;color:#f3ecdc;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.mg-dlg h3{margin:0 0 4px;font:500 19px "Noto Serif Georgian",Georgia,serif;color:#F0D48A}
.mg-dlg p{margin:0 0 12px;font-size:12.5px;color:#c9b99a;line-height:1.55}
.mg-dlg label{display:block;font-size:11px;letter-spacing:.06em;color:#c9b99a;margin:10px 0 4px}
.mg-dlg input,.mg-dlg select{width:100%;box-sizing:border-box;background:#08061a;border:1px solid rgba(201,162,76,.35);border-radius:8px;padding:9px 10px;color:#f3ecdc;font:inherit;font-size:14px}
.mg-dlg input:focus{outline:none;border-color:#F0D48A}
.mg-row{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.mg-btn{all:unset;box-sizing:border-box;cursor:pointer;padding:9px 16px;border-radius:9px;border:1px solid rgba(201,162,76,.45);color:#F0D48A;font-size:13.5px;text-align:center}
.mg-btn.pri{background:#C9A24C;color:#1d1405;border-color:#C9A24C;font-weight:600;flex:1}
.mg-btn:hover{filter:brightness(1.1)}
.mg-link{all:unset;cursor:pointer;color:#e8c06e;font-size:12px;text-decoration:underline}
.mg-err{color:#ff9a92;font-size:12.5px;margin-top:10px;min-height:16px}
.mg-ok{color:#93d6a2}
.mg-tabs{display:flex;gap:4px;margin:0 0 6px}
.mg-tabs button{all:unset;cursor:pointer;flex:1;text-align:center;padding:7px;border-radius:8px;font-size:13px;color:#c9b99a;border:1px solid transparent}
.mg-tabs button.on{border-color:rgba(201,162,76,.5);color:#F0D48A;background:rgba(201,162,76,.1)}
.mg-ppl{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:0 0 8px;position:relative}
.mg-ppl button{all:unset;cursor:pointer;font:12px "Noto Sans Georgian",system-ui,sans-serif;color:#F0D48A;border:1px solid rgba(201,162,76,.45);border-radius:999px;padding:4px 11px;background:rgba(201,162,76,.06)}
.mg-ppl button:hover{background:rgba(201,162,76,.16)}
.mg-drop{position:absolute;top:100%;left:0;z-index:9989;margin-top:4px;background:#0d0a22;border:1px solid rgba(201,162,76,.45);border-radius:10px;padding:4px;min-width:240px;max-height:300px;overflow:auto;box-shadow:0 10px 30px rgba(0,0,0,.55)}
.mg-drop button{display:block;width:100%;box-sizing:border-box;border:0!important;border-radius:7px!important;padding:8px 10px!important;color:#f3ecdc!important;background:none!important;text-align:left}
.mg-drop button:hover{background:rgba(201,162,76,.14)!important}
.mg-drop small{display:block;color:#c9b99a;font-size:11px}
#mg-toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9999;background:#0d0a22;border:1px solid #C9A24C;color:#F0D48A;
  border-radius:10px;padding:9px 16px;font:13px "Noto Sans Georgian",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.5);max-width:calc(100% - 32px)}
.mg-lock{position:fixed;inset:0;z-index:9994;background:rgba(4,3,14,.9);display:flex;align-items:center;justify-content:center;padding:16px}`;

function toast(t,ms=2600){let el=$('mg-toast');if(!el){el=document.createElement('div');el.id='mg-toast';document.body.appendChild(el);}
  el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>{el.hidden=true;},ms);}

/* ───────── pill + menu ───────── */
function drawPill(){
  let p=$('mg-pill');if(!p){p=document.createElement('button');p.type='button';p.id='mg-pill';p.onclick=e=>{e.stopPropagation();toggleMenu();};document.body.appendChild(p);}
  p.innerHTML=USER?`<span class="dot"></span>${esc(USER.name||USER.email.split('@')[0])}${USER.plan==='pro'?'<span class="pro">PRO</span>':''}`:'👤 შესვლა';
  p.setAttribute('aria-label',USER?'ანგარიში':'შესვლა / რეგისტრაცია');
  closeMenu();
}
function closeMenu(){const m=$('mg-menu');if(m)m.remove();}
function toggleMenu(){
  if($('mg-menu'))return closeMenu();
  if(!USER)return openAuth('login');
  const m=document.createElement('div');m.id='mg-menu';
  m.innerHTML=`<div class="hd"><b>${esc(USER.name||'ანგარიში')}</b>${esc(USER.email)} · ${USER.plan==='pro'?'Pro':'უფასო'}</div>
    ${USER.smtp&&!USER.verified?'<div class="warn">✉ ელფოსტა დასადასტურებელია</div>':''}
    <a href="account.html">👤 ჩემი ანგარიში</a>
    <a href="account.html#people">👥 ჩემი ხალხი</a>
    <a href="account.html#saved">📁 შენახული</a>
    ${PAGE!=='account.html'?'<button type="button" data-a="save">💾 ამ გვერდის შენახვა</button>':''}
    ${USER.role==='admin'?'<a href="admin_users.html">⚙ მომხმარებლები (ადმინი)</a>':''}
    <button type="button" data-a="out">↩ გასვლა</button>`;
  m.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;closeMenu();
    if(b.dataset.a==='out'){track('logout');flush();setSession(null,null);toast('გამოხვედით ანგარიშიდან');}
    if(b.dataset.a==='save')savePage();});
  document.body.appendChild(m);
}
document.addEventListener('click',e=>{const m=$('mg-menu');if(m&&!m.contains(e.target))closeMenu();});

/* ───────── auth dialog ───────── */
function dialog(html){const ov=document.createElement('div');ov.className='mg-ov';ov.innerHTML=`<div class="mg-dlg" role="dialog" aria-modal="true">${html}</div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});document.addEventListener('keydown',function k(e){if(e.key==='Escape'){ov.remove();document.removeEventListener('keydown',k);}});
  document.body.appendChild(ov);return ov;}
function openAuth(mode='login'){
  const ov=dialog('');const box=ov.firstElementChild;
  const draw=()=>{
    box.innerHTML=mode==='forgot'?`<h3>პაროლის აღდგენა</h3><p>შეიყვანეთ ელფოსტა — გამოგიგზავნით ბმულს ახალი პაროლისთვის.</p>
        <form id="mg-f"><label for="mg-em">ელფოსტა</label><input id="mg-em" type="email" autocomplete="email" required>
        <div class="mg-err" id="mg-er"></div><div class="mg-row"><button class="mg-btn pri" type="submit">ბმულის გაგზავნა</button></div></form>
        <p style="margin-top:12px"><button class="mg-link" type="button" data-m="login">← შესვლა</button></p>`
      :`<div class="mg-tabs"><button type="button" data-m="login" class="${mode==='login'?'on':''}">შესვლა</button><button type="button" data-m="register" class="${mode==='register'?'on':''}">რეგისტრაცია</button></div>
        <p>${mode==='login'?'შედით, რომ თქვენი ხალხი და შენახული რუკები ყველა მოწყობილობაზე გქონდეთ.':'ანგარიში ინახავს თქვენს ხალხს, რუკებს და გამოთვლებს.'}</p>
        <form id="mg-f">${mode==='register'?'<label for="mg-nm">სახელი</label><input id="mg-nm" autocomplete="name" maxlength="80">':''}
        <label for="mg-em">ელფოსტა</label><input id="mg-em" type="email" autocomplete="email" required>
        <label for="mg-pw">პაროლი${mode==='register'?' (მინ. 8 სიმბოლო)':''}</label><input id="mg-pw" type="password" autocomplete="${mode==='login'?'current-password':'new-password'}" required minlength="${mode==='register'?8:1}">
        ${mode==='register'?'<label style="display:flex;gap:8px;align-items:flex-start;letter-spacing:0;font-size:12.5px;margin-top:14px;cursor:pointer"><input id="mg-ok" type="checkbox" required style="width:auto;margin-top:2px"> <span>ვეთანხმები <a href="terms.html" target="_blank" style="color:#F0D48A">წესებსა და პირობებს</a> და <a href="privacy.html" target="_blank" style="color:#F0D48A">კონფიდენციალურობის პოლიტიკას</a></span></label>':''}
        <div class="mg-err" id="mg-er"></div>
        <div class="mg-row"><button class="mg-btn pri" type="submit">${mode==='login'?'შესვლა':'ანგარიშის შექმნა'}</button></div></form>
        ${mode==='login'?'<p style="margin-top:12px"><button class="mg-link" type="button" data-m="forgot">დაგავიწყდათ პაროლი?</button></p>':''}`;
    box.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=b.dataset.m;draw();});
    const em=$('mg-em');if(em)setTimeout(()=>em.focus(),30);
    $('mg-f').onsubmit=async e=>{e.preventDefault();const er=$('mg-er'),btn=box.querySelector('button[type=submit]');er.textContent='';btn.disabled=true;
      try{
        if(mode==='forgot'){const d=await api('/api/account/password/forgot',{method:'POST',body:{email:$('mg-em').value}});
          er.className='mg-err mg-ok';er.textContent=d.smtp?'თუ ეს ელფოსტა რეგისტრირებულია, ბმული გამოგზავნილია.':'ელფოსტის გაგზავნა ჯერ არ არის ჩართული — მიმართეთ ადმინს.';return;}
        const body={email:$('mg-em').value,password:$('mg-pw').value,device:DEVICE};if(mode==='register'){if(!$('mg-ok').checked){er.className='mg-err';er.textContent='დაეთანხმეთ წესებსა და კონფიდენციალურობის პოლიტიკას';return;}body.name=$('mg-nm').value;body.accepted_terms=true;}
        const d=await api(mode==='login'?'/api/account/login':'/api/account/register',{method:'POST',body,noLogout:true});
        setSession(d.token,d.user);ov.remove();track(mode==='login'?'login':'register');
        toast(mode==='login'?`მოგესალმებით, ${d.user.name||d.user.email}!`:(d.user.smtp&&!d.user.verified?'ანგარიში შეიქმნა — დაადასტურეთ ელფოსტა':'ანგარიში შეიქმნა'));
      }catch(x){er.className='mg-err';er.textContent=x.message;}finally{btn.disabled=false;}};
  };draw();
}
async function refreshMe(){if(!TOKEN)return;try{const u=await api('/api/account/me');USER=u;LS.set('magnus_user',JSON.stringify(u));drawPill();gate();}catch(e){}}

/* ───────── tracking ───────── */
let Q=[];
let MUTE=false;
/* visitors who chose "essential only" in the privacy notice (site.js) are not tracked */
const trackOff=()=>{try{return localStorage.getItem('magnus_consent')==='essential';}catch(e){return false;}};
function track(action,target,detail){if(ADMINPG||MUTE||trackOff())return;Q.push({page:PAGE,action,target:target||'',detail:detail||null,t:Date.now()});if(Q.length>=40)flush();}
function flush(keep){if(!Q.length)return;const events=Q.splice(0,60);
  api('/api/track',{method:'POST',body:{device:DEVICE,session:SESSION,events},keepalive:true,noLogout:true}).catch(()=>{});}
setInterval(flush,5000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush(true);});
addEventListener('pagehide',()=>flush(true));
const label=el=>(el.getAttribute('aria-label')||el.textContent||el.value||el.id||'').replace(/\s+/g,' ').trim().slice(0,90);
function formSnapshot(el){
  const box=el.closest('.form-section.active,.form-section,form,.form-card,.panel,section')||document.body;
  const o={};let n=0;
  box.querySelectorAll('input[id],select[id],textarea[id]').forEach(i=>{if(n>=45||i.type==='password'||i.type==='file'||i.closest('#mg-menu,.mg-ov'))return;
    const v=i.type==='checkbox'||i.type==='radio'?i.checked:i.value;if(v===''||v==null)return;o[i.id]=typeof v==='string'?v.slice(0,120):v;n++;});
  return o;
}
const isCalc=el=>el.classList.contains('gen-btn')||/✦|გამოთვ|გენერ|ანალიზ|ძიება|გაშვება|დათვლა|calculate/i.test(el.textContent||'');
document.addEventListener('click',e=>{
  const el=e.target.closest('button,a,[role=button],[onclick],.tab-btn,summary');if(!el||el.closest('#mg-pill,#mg-menu,.mg-ov,.mg-ppl'))return;
  if(el.classList.contains('tab-btn'))return track('tab',label(el));
  if(el.tagName==='A'&&el.getAttribute('href'))return track('nav',label(el),{href:el.getAttribute('href').slice(0,200)});
  if(isCalc(el))return track('calc',label(el),formSnapshot(el));
  track('click',label(el)+(el.id?' #'+el.id:''));
},true);
document.addEventListener('change',e=>{const i=e.target;if(!i.id||i.closest('.mg-ov'))return;
  if(i.tagName==='SELECT')track('change',i.id,{value:String(i.value).slice(0,120)});
  else if(i.type==='checkbox'||i.type==='radio')track('change',i.id,{value:i.checked});},true);

/* ───────── my people ───────── */
let peopleCache=null;
async function people(force){if(!USER)return[];if(peopleCache&&!force)return peopleCache;try{peopleCache=await api('/api/people');}catch(e){peopleCache=[];}return peopleCache;}
const pad=n=>String(n).padStart(2,'0');
const pDate=p=>`${pad(p.day)}.${pad(p.month)}.${p.year}${p.time_unknown?'':' '+pad(p.hour)+':'+pad(p.minute)}`;
function setVal(el,v){if(!el||v==null)return;if(el.type==='checkbox')el.checked=!!v;else el.value=v;}
function fillPrefix(P,p){
  const g=k=>$(P+'-'+k);
  setVal(g('name'),p.name);setVal(g('day'),p.day);setVal(g('month'),p.month);setVal(g('year'),p.year);
  setVal(g('hour'),p.time_unknown?12:p.hour);setVal(g('minute'),p.time_unknown?0:p.minute);setVal(g('second'),p.time_unknown?0:p.second);
  if(g('city'))g('city').value=p.city||'';
  if(p.lat!=null){setVal(g('lat'),(+p.lat).toFixed(4));setVal(g('lon'),(+p.lon).toFixed(4));}
  setVal(g('tz'),p.tz||'UTC');
  if(g('tz-display'))g('tz-display').textContent=`🕐 ${p.tz||'UTC'}${p.city?' · 📍 '+p.city:''}`;
  if(g('city-hint'))g('city-hint').textContent=p.city?'📍 '+p.city:'';
  const tu=g('time-unknown');if(tu){tu.checked=!!p.time_unknown;try{window.toggleTU&&window.toggleTU(P);}catch(e){}}
  ['day','month','year','hour','minute'].forEach(k=>{const el=g(k);if(el)el.dispatchEvent(new Event('change',{bubbles:true}));});
}
function readPrefix(P){const g=k=>$(P+'-'+k),n=k=>g(k)&&g(k).value!==''?+g(k).value:null;
  return{name:(g('name')&&g('name').value)||'',year:n('year'),month:n('month'),day:n('day'),hour:n('hour')??12,minute:n('minute')??0,second:n('second')??0,
    time_unknown:!!(g('time-unknown')&&g('time-unknown').checked),city:(g('city')&&g('city').value)||'',lat:n('lat'),lon:n('lon'),tz:(g('tz')&&g('tz').value)||'UTC'};}
function fillDate(inp,p){inp.value=`${String(p.year).padStart(4,'0')}-${pad(p.month)}-${pad(p.day)}`;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}));}
function readDate(inp){const m=/^(-?\d+)-(\d\d)-(\d\d)$/.exec(inp.value||'');return m?{year:+m[1],month:+m[2],day:+m[3],hour:12,minute:0,second:0,time_unknown:true,city:'',tz:'UTC',name:''}:null;}
function personBar(fill,read,where){
  if(!where||where.previousElementSibling&&where.previousElementSibling.classList.contains('mg-ppl'))return;
  const bar=document.createElement('div');bar.className='mg-ppl';
  bar.innerHTML='<button type="button" data-p="pick">👥 ჩემი ხალხი</button><button type="button" data-p="save">💾 შენახვა</button>';
  where.parentNode.insertBefore(bar,where);
  bar.addEventListener('click',async e=>{const b=e.target.closest('[data-p]');if(!b)return;e.stopPropagation();
    const old=bar.querySelector('.mg-drop');if(old){old.remove();if(b.dataset.p==='pick'&&!b.dataset.id)return;}
    if(!USER)return openAuth('login');
    if(b.dataset.p==='save'){const p=read();if(!p||p.year==null||p.month==null||p.day==null)return toast('ჯერ შეიყვანეთ დაბადების თარიღი');
      return askName(p.name,async nm=>{try{await api('/api/people',{method:'POST',body:{...p,name:nm}});peopleCache=null;track('person_save',nm);toast(`„${nm}“ შენახულია`);}catch(x){toast(x.message,4000);}});}
    if(b.dataset.id){const p=(await people()).find(x=>String(x.id)===b.dataset.id);if(p){fill(p);track('person_use',p.name);toast(`შევსებულია: ${p.name}`);}bar.querySelector('.mg-drop')?.remove();return;}
    const list=await people(true);const d=document.createElement('div');d.className='mg-drop';
    d.innerHTML=list.length?list.map(p=>`<button type="button" data-p="use" data-id="${p.id}">${p.is_self?'⭐ ':''}${esc(p.name||'—')}<small>${pDate(p)}${p.city?' · '+esc(p.city):''}</small></button>`).join('')
      :'<div style="padding:10px;font-size:12px;color:#c9b99a">ჯერ არავინ არის შენახული — შეავსეთ ფორმა და დააჭირეთ 💾</div>';
    bar.appendChild(d);});
}
function askName(def,cb){const ov=dialog(`<h3>შენახვა</h3><form id="mg-nf"><label for="mg-nn">სახელი</label><input id="mg-nn" maxlength="80" value="${esc(def||'')}" required><div class="mg-row"><button class="mg-btn" type="button" data-x>გაუქმება</button><button class="mg-btn pri" type="submit">შენახვა</button></div></form>`);
  ov.querySelector('[data-x]').onclick=()=>ov.remove();setTimeout(()=>$('mg-nn').select(),30);
  $('mg-nf').onsubmit=e=>{e.preventDefault();const v=$('mg-nn').value.trim();if(!v)return;ov.remove();cb(v);};}
function scanForms(){
  if(OWNPG)return;
  const seen=new Set();
  document.querySelectorAll('input[id$="-day"]').forEach(d=>{const P=d.id.slice(0,-4);if(seen.has(P)||!$(P+'-month')||!$(P+'-year'))return;seen.add(P);
    const grid=d.closest('.form-grid,.field-row,.grid,.row')||d.closest('.field')||d;
    personBar(p=>fillPrefix(P,p),()=>readPrefix(P),grid);});
  document.querySelectorAll('input[type=date]').forEach(inp=>{if(inp.closest('.mg-ov'))return;const f=inp.closest('.field')||inp;
    personBar(p=>fillDate(inp,p),()=>readDate(inp),f);});
}

/* ───────── saved page states ───────── */
function pageState(){const o={};
  document.querySelectorAll('input[id],select[id],textarea[id]').forEach(i=>{if(i.type==='password'||i.type==='file'||i.closest('#mg-menu,.mg-ov,.mg-ppl'))return;
    o[i.id]=i.type==='checkbox'||i.type==='radio'?i.checked:i.value;});
  /* readonly coordinates are written by the city lookup — keep the visible labels too */
  document.querySelectorAll('[id$="-tz-display"],[id$="-city-hint"]').forEach(el=>{o['@'+el.id]=el.textContent;});
  return o;}
function currentTab(){try{if(typeof currentMode==='string')return currentMode;}catch(e){}const a=document.querySelector('.tab-btn.active');return a?a.textContent.trim().slice(0,80):'';}
function savePage(){if(!USER)return openAuth('login');
  const st=pageState(),tab=currentTab();
  const nmGuess=(Object.entries(st).find(([k,v])=>/-name$/.test(k)&&v)||[])[1]||document.title;
  askName(`${nmGuess}${tab&&tab!==nmGuess?' · '+tab:''}`,async title=>{
    try{const r=await api('/api/saved',{method:'POST',body:{page:PAGE,tab,title,state:st}});track('save',title,{id:r.id});toast('შენახულია — ჩემი ანგარიში → შენახული');}
    catch(x){toast(x.message,4000);}});}
async function restore(id){
  try{const s=await api('/api/saved/'+id);
    if(s.tab){try{if(typeof window.setMode==='function'&&$('form-'+s.tab))window.setMode(s.tab);else{const b=[...document.querySelectorAll('.tab-btn')].find(b=>b.textContent.trim()===s.tab);if(b)b.click();}}catch(e){}}
    const st=s.state||{};MUTE=true;
    for(const [k,v] of Object.entries(st)){if(k[0]==='@'){const el=$(k.slice(1));if(el)el.textContent=v;continue;}
      const el=$(k);if(!el)continue;if(el.type==='checkbox'||el.type==='radio')el.checked=!!v;else el.value=v;
      if(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='radio')el.dispatchEvent(new Event('change',{bubbles:true}));}
    document.querySelectorAll('[id$="-time-unknown"]').forEach(c=>{try{window.toggleTU&&window.toggleTU(c.id.replace(/-time-unknown$/,''));}catch(e){}});
    MUTE=false;
    track('restore',s.title,{id:s.id});toast(`აღდგა: „${s.title}“ — დააჭირეთ გამოთვლას`,4500);
  }catch(x){MUTE=false;toast(x.message,4000);}
}

/* ───────── Pro pages ───────── */
let FEAT=null;
async function features(){if(FEAT)return FEAT;try{const c=JSON.parse(sessionStorage.getItem('magnus_feat')||'null');if(c&&Date.now()-c.t<600000){FEAT=c.f;return FEAT;}}catch(e){}
  try{const d=await api('/api/plans',{noLogout:true});FEAT=d.features||[];try{sessionStorage.setItem('magnus_feat',JSON.stringify({t:Date.now(),f:FEAT}));}catch(e){}}catch(e){FEAT=[];}return FEAT;}
const isPro=()=>!!USER&&(USER.plan==='pro'||USER.role==='admin');
function can(key){if(isPro())return true;return !(FEAT||[]).some(f=>f.pro_only&&f.key.toLowerCase()===String(key).toLowerCase());}
async function gate(){
  if(OWNPG)return;
  await features();const lock=$('mg-lock');
  const need=(FEAT||[]).find(f=>f.pro_only&&f.key.toLowerCase()===PAGE);
  if(!need||isPro()){if(lock)lock.remove();return;}
  if(lock)return;const l=document.createElement('div');l.id='mg-lock';l.className='mg-lock';
  l.innerHTML=`<div class="mg-dlg" style="text-align:center"><h3>🔒 ${esc(need.title||'ეს გვერდი')} — Pro</h3>
    <p>ეს გვერდი ხელმისაწვდომია Pro ანგარიშით.${USER?'':' შედით ან დარეგისტრირდით.'}</p>
    <div class="mg-row" style="justify-content:center">${USER?'':'<button class="mg-btn pri" type="button" data-l>შესვლა</button>'}<a class="mg-btn" href="index.html">მთავარი</a><a class="mg-btn" href="account.html">ანგარიში</a></div></div>`;
  const b=l.querySelector('[data-l]');if(b)b.onclick=()=>openAuth('login');document.body.appendChild(l);track('locked',PAGE);}

/* ───────── start ───────── */
function start(){
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  drawPill();refreshMe();gate();
  track('view',document.title.slice(0,120),{ref:(document.referrer||'').split('/').pop().slice(0,80)||null,w:innerWidth});
  scanForms();setTimeout(scanForms,1500);setTimeout(scanForms,4000);      /* forms injected later by add-on scripts */
  const m=/[#&]restore=(\d+)/.exec(location.hash);if(m&&USER)setTimeout(()=>restore(m[1]),1200);
}
window.MAGNUS={_ready:true,api,get user(){return USER;},get token(){return TOKEN;},open:openAuth,track,flush,savePage,restore,people,can,toast,setSession,refreshMe,DEVICE};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
