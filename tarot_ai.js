/* tarot_ai.js — "✦ AI ინტერპრეტაცია" under a fully turned spread in tarot.html (load after tarot_spreads.js).
   The browser sends only the spread, the question and the card names to the MAGNUS backend
   (/api/tarot/ai). The backend holds the Anthropic API key and enforces the limits
   (one reading per spread per device/IP every 10 minutes, daily caps). No key or account data here.
   The button appears only when the backend reports the feature as switched on.            */
(function(){
'use strict';
const BACKEND='https://astrology-production-b165.up.railway.app';
const MAXC=26;
let ON=false,WAIT=600;
const store={get(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
function device(){let d=null;try{d=localStorage.getItem('magnus_dev');}catch(e){}
  if(!d||!/^[A-Za-z0-9_-]{8,64}$/.test(d)){d=Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(16).padStart(2,'0')).join('');try{localStorage.setItem('magnus_dev',d);}catch(e){}}
  return d;}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=t=>t.trim().split(/\n{2,}/).map(p=>`<p>${esc(p).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>')}</p>`).join('');
const sid=()=>String(cur.id||'spread').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,64);
const sig=()=>sid()+'|'+drawn.map(d=>d.c.id+(d.rev?'r':'')).join(',')+'|'+(question||'');
const CACHE='magnus_tarot_ai',LAST='magnus_tarot_ai_last';
const cached=()=>{const c=store.get(CACHE)||{};return c[sig()];};
function remember(text){const c=store.get(CACHE)||{};c[sig()]={text,at:Date.now()};
  const ks=Object.keys(c).sort((a,b)=>c[b].at-c[a].at);ks.slice(20).forEach(k=>delete c[k]);store.set(CACHE,c);}
function leftFor(s){const l=(store.get(LAST)||{})[s];return l?Math.max(0,Math.ceil((l-Date.now())/1000)):0;}
function setLeft(s,sec){const l=store.get(LAST)||{};l[s]=Date.now()+sec*1000;store.set(LAST,l);}
const mm=s=>{const m=Math.floor(s/60),x=s%60;return m?`${m} წთ ${String(x).padStart(2,'0')} წმ`:`${x} წმ`;};

const st=document.createElement('style');
st.textContent=`.ai-box{margin-top:16px;border:1px solid rgba(201,168,76,.35);border-radius:12px;padding:14px 16px;background:rgba(201,168,76,.05)}
.ai-box h4{margin:0 0 8px;font-family:'Cinzel',serif;font-weight:400;font-size:13px;letter-spacing:2px;color:var(--gold-lt,#ecd59a)}
.ai-box .ai-btn{font:inherit;font-size:14px;color:#1a1408;background:var(--gold,#c9a84c);border:0;border-radius:18px;padding:8px 18px;cursor:pointer}
.ai-box .ai-btn[disabled]{opacity:.55;cursor:default}
.ai-box .ai-msg{font-size:13px;color:var(--ink-mid,#b3a68f);margin-top:8px}
.ai-box .ai-txt p{margin:0 0 10px;line-height:1.7}
.ai-box .ai-foot{font-size:11px;color:var(--ink-dim,#6d6253);margin-top:4px}`;
document.head.appendChild(st);

let timer=null;
function box(){
  const R=document.getElementById('reading');if(!R||!ON||!drawn.length||drawn.length>MAXC||!drawn.every(d=>d.up))return;
  let B=R.querySelector('.ai-box');if(!B){B=document.createElement('div');B.className='ai-box';R.appendChild(B);}
  const c=cached();
  if(c){B.innerHTML=`<h4>✦ AI ინტერპრეტაცია</h4><div class="ai-txt">${fmt(c.text)}</div><div class="ai-foot">შექმნილია ხელოვნური ინტელექტით (Claude) — მიიღე როგორც ფიქრის მასალა.</div>`;return;}
  const left=leftFor(sid());
  B.innerHTML=`<h4>✦ AI ინტერპრეტაცია</h4><button class="ai-btn" type="button"${left?' disabled':''}>✦ მთლიანი გაშლის წაკითხვა</button>
    <div class="ai-msg">${left?`ამ გაშლაზე შემდეგი AI წაკითხვა — ${mm(left)}-ში.`:'ხელოვნური ინტელექტი ბარათებს ერთმანეთთან დააკავშირებს. ერთ გაშლაზე — 10 წუთში ერთხელ.'}</div>`;
  B.querySelector('.ai-btn').onclick=()=>ask(B);
  clearInterval(timer);if(left)timer=setInterval(()=>{if(!document.body.contains(B)||!leftFor(sid())){clearInterval(timer);if(document.body.contains(B))box();return;}
    const m=B.querySelector('.ai-msg');if(m)m.textContent=`ამ გაშლაზე შემდეგი AI წაკითხვა — ${mm(leftFor(sid()))}-ში.`;},1000);
}
async function ask(B){
  const btn=B.querySelector('.ai-btn'),msg=B.querySelector('.ai-msg'),s=sid(),k=sig();
  btn.disabled=true;msg.textContent='⏳ ბარათები იკითხება… (10–30 წამი)';
  const cards=drawn.map((d,i)=>({name:(d.c.major&&typeof ROMAN!=='undefined'?ROMAN[d.c.n]+' ':'')+d.c.name,pos:posLabel(i),desc:(cur.p[i]&&cur.p[i][1])||'',rev:!!d.rev}));
  try{
    const r=await fetch(BACKEND+'/api/tarot/ai',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({spread:s,device:device(),title:cur.t||'',question:question||'',cards})});
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.text){if(sig()===k){remember(j.text);}else{const c=store.get(CACHE)||{};c[k]={text:j.text,at:Date.now()};store.set(CACHE,c);}
      setLeft(s,j.wait||WAIT);box();return;}
    if(r.status===429&&j.retry_after){setLeft(s,j.retry_after);box();return;}
    btn.disabled=false;
    msg.textContent=r.status===429?'დღის ლიმიტი ამოიწურა — სცადე ხვალ.':r.status===503?'AI ინტერპრეტაცია ახლა გამორთულია.':'ვერ მოხერხდა — სცადე ცოტა ხანში.';
  }catch(e){btn.disabled=false;msg.textContent='კავშირი ვერ დამყარდა — შეამოწმე ინტერნეტი და სცადე თავიდან.';}
}
const orig=window.renderReading;
if(typeof orig==='function'){window.renderReading=function(){const r=orig.apply(this,arguments);try{box();}catch(e){console.warn(e);}return r;};}
fetch(BACKEND+'/api/tarot/ai/status').then(r=>r.ok?r.json():null).then(j=>{if(j&&j.enabled){ON=true;WAIT=j.wait||WAIT;box();}}).catch(()=>{});
})();
