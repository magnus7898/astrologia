/* astrostats.js — „სტატისტიკა“: where are the planets when … (3000 BC – 9999 AD)
   Self-injecting add-on for astro.html — load AFTER search.js (uses window._search:
   its ephemeris, scan() and tables).
   Conditions (planet in sign / aspect / direct–retro, optional) → the exact time windows
   where each holds over the WHOLE span (exactscan.js — no sampling) → their exact shares,
   overlaps and lift against chance; the breakdown takes N moments spread evenly
   (golden-ratio sweep, not random) through the windows where all hold together →
   for every moment all 15 bodies are computed. Counted: sign of every body, retrograde share,
   every pair × sign × sign, every pair × aspect, element / modality balance.
   With conditions, the same is computed for the whole span as a baseline, so every
   number also shows how much more (or less) often it happens than usual (×lift). */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
let X=null;      /* window._search */
const ELN=['ცეცხლი','მიწა','ჰაერი','წყალი'],ELC=['#e0703a','#8fa05a','#d8c060','#4a90c8'];
const MON=['კარდინალური','ფიქსირებული','მუტაბელური'];
const PLAN10=['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
const MAJOR=[0,60,90,120,180];
const sfx=(n,x)=>(n.endsWith('ი')?n.slice(0,-1):n)+x;

const CSS=`
#form-astats #as-rows .as-row:first-child{border-left:2px solid #C9A24C;padding-left:8px}
#form-astats .as-row{display:grid;grid-template-columns:1fr 1fr auto auto;gap:8px;align-items:end;margin-bottom:8px}
#form-astats .as-row.as-asp{grid-template-columns:1fr 1fr 1fr 74px auto}
@media(max-width:560px){#form-astats .as-row.as-asp{grid-template-columns:1fr 1fr}}
#form-astats .as-row .rx{display:flex;flex-direction:column;gap:3px;font-size:11px;padding-bottom:4px;white-space:nowrap}
#form-astats .as-row .rx label{display:flex;align-items:center;gap:5px;cursor:pointer;text-transform:none;letter-spacing:0;margin:0}
#form-astats .as-row .rx input:disabled+span{opacity:.35}
.as-x{background:none;border:1px solid rgba(201,162,76,.3);color:#E8C97A;border-radius:50%;width:30px;height:30px;cursor:pointer;margin-bottom:3px}
.as-add{background:rgba(201,162,76,.1);border:1px dashed rgba(201,162,76,.45);color:#E8C97A;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;font-family:inherit}
.as-pre{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.as-pre button,.as-seg button{background:none;border:1px solid rgba(201,162,76,.25);color:rgba(232,201,122,.85);border-radius:12px;padding:3px 10px;font-size:10.5px;cursor:pointer;font-family:inherit}
.as-seg button.on{background:rgba(201,162,76,.2);border-color:#C9A24C;color:#F0D48A}
.as-hint{font-size:10.5px;color:rgba(200,180,140,.6);margin-top:5px;line-height:1.5}
.as-bar{height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-top:8px;display:none}
.as-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#5fc8b0,#C9A24C)}
.as-card{border:1px solid rgba(201,162,76,.2);border-radius:12px;padding:12px 14px;margin-top:12px;background:rgba(10,8,22,.45)}
.as-card h4{margin:0 0 8px;font-family:Cinzel,serif;font-weight:400;font-size:12px;letter-spacing:2px;color:#E8C97A}
.as-sum{font-size:12.5px;color:rgba(196,176,148,.85);line-height:1.7}.as-sum b{color:#F0D48A;font-weight:500}
.as-heat{width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed}
.as-heat th{font-weight:400;color:rgba(232,201,122,.85);padding:4px 2px;font-size:13px}
.as-heat th.b{text-align:left;font-size:11.5px;width:118px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.as-heat td{text-align:center;padding:5px 1px;border:1px solid rgba(10,8,22,.9);color:#f3ecdc;cursor:pointer;font-variant-numeric:tabular-nums}
.as-heat td.rx{cursor:default;color:rgba(196,176,148,.85)}
.as-heat td:hover{outline:1px solid #E8C97A}
.as-heat .sub{display:block;font-size:9px;opacity:.75}
.as-wrap{overflow-x:auto}
.as-list{display:grid;gap:3px}
.as-li{display:grid;grid-template-columns:150px 1fr 120px;gap:8px;align-items:center;font-size:12px}
.as-li .t{position:relative;height:18px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden}
.as-li .t i{position:absolute;left:0;top:0;bottom:0;border-radius:3px}
.as-li .n{text-align:right;font-size:11px;color:rgba(196,176,148,.85);white-space:nowrap}
.as-li .k{white-space:nowrap;color:#f3ecdc}
.as-sel{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;font-size:12px;color:rgba(196,176,148,.85)}
.as-sel select{max-width:170px}
.lift-up{color:#7fd8a8}.lift-dn{color:#e8907a}
@media(max-width:560px){.as-li{grid-template-columns:110px 1fr 92px}.as-heat th.b{width:84px}}`;

/* ── form rows ── */
/* D / ℞ boxes only for bodies that can turn retrograde */
function wireMo(r){const s=r.querySelector('.as-b'),bx=r.querySelectorAll('.as-rx,.as-dir');if(!s||!bx.length)return;
  s.onchange=()=>{const no=!X.CAN_RX.has(s.value);bx.forEach(x=>{x.disabled=no;if(no)x.checked=false;});};s.onchange();}
const optB=v=>X.BODIES.map(x=>`<option value="${x[0]}"${x[0]===v?' selected':''}>${x[2]} ${x[1]}</option>`).join('');
const signRow=(b,s)=>`<div class="as-row"><div class="field"><label>პლანეტა / წერტილი</label><select class="as-b">${optB(b)}</select></div>
  <div class="field"><label>ნიშანი</label><select class="as-s">${X.signOpts(s)}</select></div>
  <div class="rx" title="ორივე ან არცერთი — ნებისმიერი მოძრაობა; მხოლოდ ერთი — მხოლოდ ის"><label><input type="checkbox" class="as-dir" style="accent-color:#5fc8b0"><span>D პირდაპირი</span></label><label><input type="checkbox" class="as-rx" style="accent-color:#C9A24C"><span>℞ რეტრო</span></label></div><button type="button" class="as-x" title="წაშლა">×</button></div>`;
const aspRow=(a,g,b)=>`<div class="as-row as-asp"><div class="field"><label>პირველი</label><select class="as-a">${optB(a)}</select></div>
  <div class="field"><label>ასპექტი</label><select class="as-g">${X.ASPECTS.map(x=>`<option value="${x[0]}"${x[0]===g?' selected':''}>${x[2]} ${x[1]} ${x[0]}°</option>`).join('')}</select></div>
  <div class="field"><label>მეორე</label><select class="as-b2">${optB(b)}</select></div>
  <div class="field"><label>ორბი °</label><input type="number" class="as-o" value="3" min="0.5" max="10" step="0.5"></div><button type="button" class="as-x" title="წაშლა">×</button></div>`;

function inject(){
  X=window._search;
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!X||!X.BODIES||!bar||!card||$('form-astats'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const b=document.createElement('button');b.className='tab-btn';b.textContent='სტატისტიკა';b.setAttribute('onclick',"setMode('astats')");
  const after=document.querySelector(".tab-btn[onclick*=\"'search'\"]");
  if(after&&after.nextSibling)bar.insertBefore(b,after.nextSibling);else bar.appendChild(b);
  const sec=document.createElement('div');sec.id='form-astats';sec.className='form-section';
  sec.innerHTML=`
    <div class="person-label">📊 სტატისტიკა — სად არიან პლანეტები, როცა…</div>
    <div style="font-size:11px;color:rgba(200,180,140,.7);line-height:1.6;margin:-2px 0 12px">
      დაამატე პირობა (მაგ. <b>☉ მზე ლომში</b>) — დავთვლი, ამ დროს რომელ ნიშნებში არიან დანარჩენი პლანეტები, რა ასპექტები ქმნიან, რა კომბინაციები და ელემენტებია ყველაზე ხშირი
      და რამდენად ხშირად <b>ჩვეულებრივზე</b> (×). პირობის გარეშე — მთელი ეპოქის საერთო სტატისტიკა.</div>
    <div id="as-rows">${signRow('sun',4)}</div>
    <div class="as-hint" style="margin:-2px 0 8px">ერთი პირობა — სად არიან დანარჩენი პლანეტები მის დროს. <b>ორი ან მეტი</b> — მხოლოდ მათი სტატისტიკა: თითოეული ცალკე, ერთად, და რამდენად ხშირად ემთხვევა ერთმანეთს შემთხვევითთან შედარებით (ყველაფერი ზუსტად, მთელი დიაპაზონის ყოველ მომენტზე); სრული სურათი — ღილაკით.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="as-add" id="as-add">+ პლანეტა ნიშანში</button><button type="button" class="as-add" id="as-add-asp">+ ასპექტი</button><button type="button" class="as-add" id="as-clear">პირობების გარეშე</button></div>
    <div class="form-grid-2" style="margin-top:12px">
      <div class="field"><label>წლიდან</label><input type="number" id="as-y0" value="-3000" min="-3000" max="9999"></div>
      <div class="field"><label>წლამდე</label><input type="number" id="as-y1" value="9999" min="-3000" max="9999"></div></div>
    <div class="as-hint">ძვ.წ. — მინუსით (−356 = ძვ.წ. 356). ქირონი ითვლება მხოლოდ 700–4650 წლების მომენტებში.</div>
    <div class="as-pre" id="as-pre"><button data-r="-3000,9999">მთელი ეპოქა</button><button data-r="1900,2100">1900 – 2100</button><button data-r="-1000,1">ძვ.წ. 1000 – ახ.წ. 1</button><button data-r="1,2000">1 – 2000</button><button data-r="2000,9999">2000 – 9999</button></div>
    <div class="as-sel">ასპექტის ორბი სტატისტიკაში: <input type="number" id="as-orb" value="5" min="1" max="10" step="1" style="width:64px"> °</div>
    <button type="button" class="gen-btn" id="as-go" style="margin-top:6px">📊 დათვლა ✦</button>
    <div class="as-bar" id="as-bar"><i></i></div>
    <div id="as-out"></div>`;
  card.insertBefore(sec,$('form-relocation')||null);
  const rows=$('as-rows');
  const wire=()=>rows.querySelectorAll('.as-row').forEach(r=>{r.querySelector('.as-x').onclick=()=>{r.remove();};wireMo(r);});
  $('as-add').onclick=()=>{rows.insertAdjacentHTML('beforeend',signRow('moon',0));wire();};
  $('as-add-asp').onclick=()=>{rows.insertAdjacentHTML('beforeend',aspRow('sun',0,'moon'));wire();};
  $('as-clear').onclick=()=>{rows.innerHTML='';};
  sec.querySelectorAll('#as-pre button').forEach(x=>x.onclick=()=>{const [a,c]=x.dataset.r.split(',');$('as-y0').value=a;$('as-y1').value=c;});
  wire();$('as-go').onclick=run;
}

/* ── moments: spread evenly, nothing random ── */
const PHI=0.6180339887498949,NMOM=30000;
function newAcc(){
  const B=X.BODIES.map(b=>b[0]),n=B.length,P=[];
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){if((B[i]==='node'&&B[j]==='snode'))continue;P.push([i,j]);}
  return{B,P,N:0,nb:new Float64Array(n),sign:new Float64Array(n*12),rx:new Float64Array(n),
    pairSign:new Float64Array(P.length*144),asp:new Float64Array(P.length*MAJOR.length),pairN:new Float64Array(P.length),
    el:new Float64Array(5),mo:new Float64Array(4),elCnt:new Float64Array(4*11),jds:[]};
}
function sampleInto(acc,jd,orb){
  const {B,P}=acc,L=new Array(B.length);
  for(let i=0;i<B.length;i++){
    const b=B[i],l=X.lon(b,jd);L[i]=l;if(!isFinite(l))continue;
    const s=Math.floor(l/30);acc.nb[i]++;acc.sign[i*12+s]++;
    if(X.CAN_RX.has(b)){const d=((X.lon(b,jd+0.05)-l+540)%360)-180;if(d<0)acc.rx[i]++;}
  }
  for(let k=0;k<P.length;k++){const a=L[P[k][0]],c=L[P[k][1]];if(!isFinite(a)||!isFinite(c))continue;
    acc.pairN[k]++;acc.pairSign[k*144+Math.floor(a/30)*12+Math.floor(c/30)]++;
    const sep=Math.abs(((a-c+540)%360)-180);
    for(let g=0;g<MAJOR.length;g++)if(Math.abs(sep-MAJOR[g])<=orb){acc.asp[k*MAJOR.length+g]++;break;}}
  const e=[0,0,0,0],m=[0,0,0];
  for(const b of PLAN10){const s=Math.floor(L[B.indexOf(b)]/30);e[s%4]++;m[s%3]++;}
  for(let k=0;k<4;k++)acc.elCnt[k*11+e[k]]++;
  const me=Math.max(...e),ei=e.indexOf(me);acc.el[e.filter(x=>x===me).length>1?4:ei]++;
  const mm=Math.max(...m),mi=m.indexOf(mm);acc.mo[m.filter(x=>x===mm).length>1?3:mi]++;
  acc.N++;acc.jds.push(jd);
}
/* N moments through the windows: the k-th at golden-ratio position k·φ of their total time — every prefix covers all of it evenly */
async function sampleWindows(wins,N,orb,prog,cancelled){
  const next=window.EXS.sweep(wins),acc=newAcc();let t0=performance.now();
  for(let i=0;i<N;i++){sampleInto(acc,next(),orb);
    if(performance.now()-t0>40){prog(i/N);await new Promise(r=>setTimeout(r,0));t0=performance.now();if(cancelled())return null;}}
  return acc;
}
/* ── run ── */
let running=false,cancel=false,BASE={},LAST=null;
const WC=new Map();   /* exact windows per condition + span (this page) */
async function winsOf(c,jd0,jd1,prog){
  const k=JSON.stringify(c)+'|'+jd0+'|'+jd1;if(WC.has(k))return WC.get(k);
  const W=await window.EXS.scan(window.EXS.fromSearch(c),jd0,jd1,{prog,cancelled:()=>cancel});
  if(W){if(WC.size>60)WC.clear();WC.set(k,W);}return W;
}
async function run(){
  if(running){cancel=true;return;}
  if(!window.EXS){$('as-out').innerHTML='<div class="as-sum">exactscan.js ვერ ჩაიტვირთა.</div>';return;}
  const conds=[...document.querySelectorAll('#as-rows .as-row')].map(r=>r.classList.contains('as-asp')
    ?{t:'asp',a:r.querySelector('.as-a').value,b:r.querySelector('.as-b2').value,ang:+r.querySelector('.as-g').value,orb:Math.max(0.5,Math.min(10,parseFloat(r.querySelector('.as-o').value)||3))}
    :{t:'sign',b:r.querySelector('.as-b').value,s:X.parseS(r.querySelector('.as-s').value),mo:X.motionOf(r,'.as-rx','.as-dir')});
  if(conds.some(c=>c.t==='asp'&&(c.a===c.b||[c.a,c.b].sort().join()==='node,snode'))){$('as-out').innerHTML='<div class="as-sum">ასპექტისთვის აირჩიე ორი სხვადასხვა პლანეტა.</div>';return;}
  const cl=v=>Math.max(-3000,Math.min(9999,Math.round(+v)));
  let y0=cl($('as-y0').value),y1=cl($('as-y1').value);if(y1<y0)[y0,y1]=[y1,y0];$('as-y0').value=y0;$('as-y1').value=y1;
  const usesChi=conds.some(c=>c.b==='chiron'||c.a==='chiron');
  if(usesChi){y0=Math.max(y0,X.CH_Y0);y1=Math.min(y1,X.CH_Y1);if(y0>y1){$('as-out').innerHTML='<div class="as-sum">ქირონი მხოლოდ 700–4650 წლებშია.</div>';return;}}
  const ya=y=>y<0?y+1:y,jd0=X.cal2jd(ya(y0),1,1),jd1=X.cal2jd(ya(y1)+1,1,1);
  const orb=Math.max(1,Math.min(10,+$('as-orb').value||5));
  const btn=$('as-go'),bar=$('as-bar'),out=$('as-out');
  running=true;cancel=false;btn.textContent='■ შეჩერება';bar.style.display='block';out.innerHTML='';
  const P=(a,b)=>f=>{bar.firstChild.style.width=((a+(b-a)*f)*100).toFixed(0)+'%';};
  const t0=performance.now(),k=conds.length;
  try{
    /* every condition alone — exact windows over the whole span — then where all hold together */
    const Ws=[];for(let i=0;i<k;i++){const W=await winsOf(conds[i],jd0,jd1,P(i/k*0.6,(i+1)/k*0.6));if(!W)throw 0;Ws.push(W);}
    let joint=k?Ws[0]:[[jd0,jd1]];for(let i=1;i<k;i++)joint=window.EXS.inter(joint,Ws[i]);
    const span=jd1-jd0,sh=W=>window.EXS.measure(W)/span;
    const pairs=[];if(k>2)for(let i=0;i<k;i++)for(let j=i+1;j<k;j++)pairs.push({i,j,p:sh(window.EXS.inter(Ws[i],Ws[j]))});
    LAST={conds,y0,y1,jd0,jd1,orb,N:NMOM,singles:Ws.map(W=>({p:sh(W),n:W.length})),joint,share:k?sh(joint):1,periods:joint.length,pairs,
      res:null,base:null,sec:(performance.now()-t0)/1000,pa:null,pb:null,focus:'',open:k<2};
    const fixed=new Set(conds.filter(c=>c.t==='sign'&&typeof c.s==='number').map(c=>c.b)),free=X.BODIES.map(b=>b[0]).filter(b=>!fixed.has(b));
    LAST.fixed=fixed;LAST.pa=free[0]||'sun';LAST.pb=free[1]||'moon';
    if(LAST.open&&joint.length){if(!await breakdown(P(.6,1)))throw 0;}
  }catch(e){running=false;btn.textContent='📊 დათვლა ✦';bar.style.display='none';if(e===0)out.innerHTML='<div class="as-sum">დათვლა შეჩერდა.</div>';else out.innerHTML='<div class="as-sum">შეცდომა: '+(e&&e.message||e)+'</div>';return;}
  running=false;btn.textContent='📊 დათვლა ✦';bar.style.display='none';
  LAST.sec=(performance.now()-t0)/1000;
  render();
}
/* where the planets are while all conditions hold: NMOM moments evenly through the joint windows (+ the whole span as baseline) */
async function breakdown(prog){
  const S=LAST,bk=[S.y0,S.y1,S.orb].join('|'),cancelled=()=>cancel;
  const res=await sampleWindows(S.joint,S.N,S.orb,f=>prog(S.conds.length?f*0.6:f),cancelled);if(!res)return false;
  let base=null;if(S.conds.length){base=BASE[bk]||await sampleWindows([[S.jd0,S.jd1]],S.N,S.orb,f=>prog(0.6+0.4*f),cancelled);if(!base)return false;BASE[bk]=base;}
  S.res=res;S.base=base;return true;
}

/* ── render ── */
const BI=k=>X.BODIES.findIndex(b=>b[0]===k),BG=k=>X.BODIES[BI(k)];
const pc=(x,dp=1)=>(100*x).toFixed(dp)+'%';
function lift(p,q){if(!q||!isFinite(p/q))return '';const l=p/q;if(l>=1.25)return `<span class="lift-up">×${l.toFixed(l>=10?0:1)}</span>`;if(l<=0.8)return `<span class="lift-dn">×${l.toFixed(2)}</span>`;return '';}
function heatColor(v,l){ /* v: share 0..1, l: lift or null */
  if(l!=null&&isFinite(l)){const t=Math.max(-1,Math.min(1,Math.log2(l)/2.5));
    return t>=0?`rgba(201,162,76,${(0.08+0.75*t).toFixed(2)})`:`rgba(90,120,200,${(0.08+0.55*-t).toFixed(2)})`;}
  return `rgba(201,162,76,${Math.min(0.85,0.05+v*2.2).toFixed(2)})`;}
function label(c){const n=k=>{const b=BG(k);return b[2]+' '+b[1];};
  return c.t==='asp'?`${n(c.a)} ${X.ASPECTS.find(x=>x[0]===c.ang)[2]} ${n(c.b)} (ორბი ${c.orb}°)`:`${n(c.b)} ${X.signLbl(c.s)}${X.moLbl(c)}`;}

function corrCard(S){
  const k=S.conds.length;if(!k)return '';
  const one=p=>p>0?`1 / ${Math.round(1/p).toLocaleString()}`:'არასდროს';
  const mx=Math.max(...S.singles.map(x=>x.p),S.share,1e-9),exp=S.singles.reduce((a,x)=>a*x.p,1);
  const row=(lab,p,n,q,bold)=>`<div class="as-li" style="grid-template-columns:minmax(150px,1.3fr) 1fr 170px"><span class="k">${bold?'<b>'+lab+'</b>':lab}</span>
    <span class="t"><i style="width:${(100*p/mx).toFixed(1)}%;background:rgba(201,162,76,.6)"></i>${q!=null?`<i style="left:${Math.min(100,100*q/mx).toFixed(1)}%;width:2px;background:#8fb8e8"></i>`:''}</span>
    <span class="n"><b style="color:#F0D48A">${pc(p,2)}</b> · ${one(p)}${n!=null?` · ${n.toLocaleString()} პერ.`:''}</span></div>`;
  let h=`<div class="as-card"><h4>${k>1?'პირობები — ცალ-ცალკე და ერთად':'პირობა'}</h4><div class="as-list">`;
  S.conds.forEach((c,i)=>h+=row(label(c),S.singles[i].p,S.singles[i].n));
  if(k>1)h+=row('ყველა ერთად',S.share,S.periods,exp,true);
  h+='</div>';
  if(k>1){const L=exp>0?S.share/exp:0,Lt=L>=10?L.toFixed(0):L.toFixed(2);
    h+=`<div class="as-sum" style="margin-top:8px">${S.share<=0?'ეს პირობები ამ დიაპაზონში <b class="lift-dn">არასდროს</b> ემთხვევა ერთმანეთს.'
      :L>=1.1?`ერთად ხდება <b class="lift-up">${Lt}-ჯერ უფრო ხშირად</b>, ვიდრე შემთხვევით მოხდებოდა`
      :L<=0.9?`ერთად ხდება <b class="lift-dn">უფრო იშვიათად</b> (×${Lt}), ვიდრე შემთხვევით მოხდებოდა`
      :`ერთად ხდება დაახლოებით იმდენად, რამდენადაც შემთხვევით (<b>×${Lt}</b>) — კავშირი არ ჩანს`}${S.share>0?` · დამოუკიდებლობისას იქნებოდა ${pc(exp,3)} (ცისფერი ხაზი).`:''}</div>`;
    if(k===2&&S.singles[0].p>0&&S.singles[1].p>0){const [a,b]=S.conds.map(label);
      h+=`<div class="as-hint" style="font-size:12px">როცა <b>${a}</b> — <b>${b}</b> სრულდება დროის ${pc(S.share/S.singles[0].p)}-ში (საერთოდ ${pc(S.singles[1].p)}).<br>
        როცა <b>${b}</b> — <b>${a}</b> სრულდება დროის ${pc(S.share/S.singles[1].p)}-ში (საერთოდ ${pc(S.singles[0].p)}).</div>`;}
    if(S.pairs.length)h+=`<h4 style="margin-top:12px">წყვილები</h4><div class="as-list">`+S.pairs.map(pr=>{const e=S.singles[pr.i].p*S.singles[pr.j].p;
      return `<div class="as-li" style="grid-template-columns:minmax(150px,1.6fr) 1fr 150px"><span class="k">${label(S.conds[pr.i])} + ${label(S.conds[pr.j])}</span>
        <span class="t"><i style="width:${(100*pr.p/mx).toFixed(1)}%;background:rgba(95,200,176,.55)"></i></span><span class="n">${pc(pr.p,2)} · შემთხვ. ${pc(e,2)} ${lift(pr.p,e)}</span></div>`;}).join('')+'</div>';}
  return h+`<div class="as-hint">ზუსტად — მთელი დიაპაზონის ყოველი მომენტი (დაკვირვება ნიშნის ცვლაზე, ასპექტის ორბზე და სტაციაზე ~1 წამის სიზუსტით), შემთხვევითი შერჩევის გარეშე.</div></div>`;
}
function render(){
  const S=LAST,out=$('as-out');if(!S)return;
  const yS=y=>y<0?`ძვ.წ. ${-y}`:(S.y0<0?`ახ.წ. ${y}`:String(y));
  const head=`<div class="as-card"><div class="as-sum"><b>${S.conds.length?S.conds.map(label).join(' + '):'პირობის გარეშე — საერთო სტატისტიკა'}</b><br>${yS(S.y0)} – ${yS(S.y1)}${S.conds.length?` · ${S.conds.length>1?'ერთად ':''}სრულდება დროის <b>${pc(S.share,3)}</b>-ში — ზუსტად (${S.periods.toLocaleString()} პერიოდი)`:''} · ${S.sec.toFixed(1)} წმ</div></div>`;
  const tog=S.conds.length>1?`<div style="text-align:center;margin-top:12px"><button type="button" class="as-add" id="as-full">${S.res&&S.open?'▴ დამალე სრული სტატისტიკა':'▾ სრული სტატისტიკა — სად არიან დანარჩენი პლანეტები, როცა ყველა პირობა ერთად სრულდება'}</button></div>`:'';
  const wireTog=()=>{const t=$('as-full');if(!t)return;t.onclick=async()=>{
    if(S.open&&S.res){S.open=false;render();return;}
    if(!S.joint.length){t.textContent='ერთად არასდროს სრულდება — სტატისტიკა არ არის';return;}
    if(!S.res){if(running)return;running=true;cancel=false;const bar=$('as-bar');bar.style.display='block';t.disabled=true;t.textContent='⏳ ითვლება…';
      const ok=await breakdown(f=>{bar.firstChild.style.width=(f*100).toFixed(0)+'%';});running=false;bar.style.display='none';if(!ok){render();return;}}
    S.open=true;render();};};
  if(!S.res||!S.open){out.innerHTML=head+corrCard(S)+tog+(!S.joint.length&&S.conds.length===1?'<div class="as-sum" style="margin-top:8px">ამ დიაპაზონში ეს პირობა არცერთხელ არ სრულდება.</div>':'');wireTog();return;}
  const A=S.res,Bs=S.base,B=A.B,yL=y=>y<0?`ძვ.წ. ${-y}`:(S.y0<0?`ახ.წ. ${y}`:String(y));
  const cond=S.conds.length?S.conds.map(label).join(' + '):'პირობის გარეშე — საერთო სტატისტიკა';
  /* heatmap */
  let h=`<div class="as-wrap"><table class="as-heat"><tr><th class="b"></th>${X.ZS.map((z,j)=>`<th title="${X.SIGNS[j]}">${z}︎</th>`).join('')}<th title="რეტროგრადული">℞</th></tr>`;
  for(let i=0;i<B.length;i++){const n=A.nb[i];if(!n)continue;
    h+=`<tr><th class="b">${X.BODIES[i][2]} ${X.BODIES[i][1]}</th>`;
    for(let s=0;s<12;s++){const p=A.sign[i*12+s]/n,q=Bs&&Bs.nb[i]?Bs.sign[i*12+s]/Bs.nb[i]:null,l=q?p/q:null;
      h+=`<td data-b="${B[i]}" data-s="${s}" style="background:${heatColor(p,l)}" title="${X.BODIES[i][1]} ${sfx(X.SIGNS[s],'ში')}: ${pc(p,2)}${q!=null?' · ჩვეულებრივ '+pc(q,2):''} — დააჭირე, პირობად დაემატება">${p>=0.0005?(100*p).toFixed(p<0.1?1:0):'·'}${p>=0.0005&&l!=null&&(l>=1.25||l<=0.8)?`<span class="sub">×${l.toFixed(l>=10?0:1)}</span>`:''}</td>`;}
    const rx=X.CAN_RX.has(B[i])?A.rx[i]/n:null,rq=rx!=null&&Bs?Bs.rx[i]/Bs.nb[i]:null;
    h+=`<td class="rx">${rx!=null?(100*rx).toFixed(0)+'%'+(rq?`<span class="sub">${lift(rx,rq).replace(/<[^>]+>/g,'')}</span>`:''):''}</td></tr>`;}
  h+='</table></div>';
  /* aspects list */
  const asp=[];for(let k=0;k<A.P.length;k++){const n=A.pairN[k];if(!n)continue;for(let g=0;g<MAJOR.length;g++){const v=A.asp[k*MAJOR.length+g];if(!v)continue;
    const p=v/n,bn=Bs?Bs.pairN[k]:0,q=bn?Bs.asp[k*MAJOR.length+g]/bn:null;asp.push({k,g,p,q,l:q?p/q:0});}}
  const focus=S.focus,AF=asp.filter(o=>!focus||A.B[A.P[o.k][0]]===focus||A.B[A.P[o.k][1]]===focus);
  const byP=[...AF].sort((x,y)=>y.p-x.p).slice(0,24),byL=Bs?[...AF].filter(o=>o.q&&o.p>0.01&&o.l>=1.2).sort((x,y)=>y.l-x.l).slice(0,16):[];   /* only real differences */
  const aspRow=o=>{const [i,j]=A.P[o.k],ag=X.ASPECTS.find(x=>x[0]===MAJOR[o.g]);
    return `<div class="as-li"><span class="k">${X.BODIES[i][2]} ${ag[2]} ${X.BODIES[j][2]} <span style="opacity:.6">${ag[1]}</span></span><span class="t"><i style="width:${Math.min(100,o.p*100*2.2).toFixed(1)}%;background:rgba(201,162,76,.55)"></i></span><span class="n">${pc(o.p)} ${o.q!=null?lift(o.p,o.q):''}</span></div>`;};
  /* pair grid */
  const pa=S.pa,pb=S.pb,ia=BI(pa),ib=BI(pb);let kk=A.P.findIndex(p=>p[0]===Math.min(ia,ib)&&p[1]===Math.max(ia,ib));const swap=ia>ib;
  let g=`<div class="as-wrap"><table class="as-heat"><tr><th class="b">${BG(pa)[2]} ↓ · ${BG(pb)[2]} →</th>${X.ZS.map(z=>`<th>${z}︎</th>`).join('')}</tr>`;
  if(kk>=0){const n=A.pairN[kk]||1,bn=Bs?Bs.pairN[kk]:0;const cell=(a,b)=>swap?A.pairSign[kk*144+b*12+a]:A.pairSign[kk*144+a*12+b];
    const bcell=(a,b)=>!Bs?0:swap?Bs.pairSign[kk*144+b*12+a]:Bs.pairSign[kk*144+a*12+b];
    for(let a=0;a<12;a++){g+=`<tr><th class="b">${X.ZS[a]}︎ ${X.SIGNS[a]}</th>`;for(let b=0;b<12;b++){const p=cell(a,b)/n,q=bn?bcell(a,b)/bn:null,l=q?p/q:null;
      g+=`<td style="background:${heatColor(p*4,l)}" title="${BG(pa)[1]} ${sfx(X.SIGNS[a],'ში')} + ${BG(pb)[1]} ${sfx(X.SIGNS[b],'ში')}: ${pc(p,2)}${q!=null?' · ჩვეულებრივ '+pc(q,2):''}">${p>=0.0005?(100*p).toFixed(1):'·'}</td>`;}g+='</tr>';}}
  else g+='<tr><td colspan="13">აირჩიე ორი სხვადასხვა წერტილი</td></tr>';
  g+='</table></div>';
  /* top sign combos across all pairs */
  const combos=[],FX=S.fixed||new Set();for(let k=0;k<A.P.length;k++){const n=A.pairN[k];if(!n||FX.has(B[A.P[k][0]])||FX.has(B[A.P[k][1]]))continue;   /* pairs with a body fixed by the condition are trivial */    for(let c=0;c<144;c++){const v=A.pairSign[k*144+c];if(!v)continue;const p=v/n,bn=Bs?Bs.pairN[k]:0,q=bn?Bs.pairSign[k*144+c]/bn:null;combos.push({k,c,p,q,l:q?p/q:0});}}
  const topC=[...combos].sort((x,y)=>Bs?(y.p*Math.log(y.l||1))-(x.p*Math.log(x.l||1)):y.p-x.p).slice(0,20);
  const comboRow=o=>{const [i,j]=A.P[o.k],a=Math.floor(o.c/12),b=o.c%12;
    return `<div class="as-li"><span class="k">${X.BODIES[i][2]}${X.ZS[a]}︎ + ${X.BODIES[j][2]}${X.ZS[b]}︎</span><span class="t"><i style="width:${Math.min(100,o.p*100*1.5).toFixed(1)}%;background:rgba(95,200,176,.5)"></i></span><span class="n">${pc(o.p)} ${o.q!=null?lift(o.p,o.q):''}</span></div>`;};
  /* elements */
  const elBars=(arr,names,cols,base)=>names.map((nm,i)=>{const p=arr[i]/A.N,q=base?base[i]/Bs.N:null;
    return `<div class="as-li"><span class="k">${nm}</span><span class="t"><i style="width:${(p*100).toFixed(1)}%;background:${cols[i]||'rgba(201,162,76,.5)'}"></i></span><span class="n">${pc(p)} ${q!=null?lift(p,q):''}</span></div>`;}).join('');
  const avgEl=ELN.map((nm,k)=>{let s=0;for(let c=0;c<=10;c++)s+=c*A.elCnt[k*11+c];return s/A.N;});
  out.innerHTML=`
   ${head}${corrCard(S)}${tog}
   <div class="as-card"><div class="as-sum">${S.conds.length?'როცა '+cond+' — ':''}${A.N.toLocaleString()} მომენტი, თანაბრად გადანაწილებული ${S.conds.length?'ამ პირობის მთელ დროზე':'მთელ დიაპაზონზე'} (არა შემთხვევით)${Bs?'<br><span style="font-size:11px">×N — რამდენჯერ უფრო ხშირად (მწვანე) ან იშვიათად (წითელი), ვიდრე მთელ დიაპაზონში ჩვეულებრივ.</span>':''}</div></div>
   <div class="as-card"><h4>ნიშნები — სად არის თითო პლანეტა (%)</h4>${h}
     <div class="as-hint">რიცხვი — დროის % ამ ნიშანში; ოქროსფერი — ხშირი, ლურჯი — იშვიათი${Bs?' ჩვეულებრივთან შედარებით':''}. უჯრაზე დაჭერა მას პირობად დაამატებს.</div></div>
   <div class="as-card"><h4>ორი პლანეტის კომბინაცია (ნიშანი × ნიშანი)</h4>
     <div class="as-sel">რიგები: <select id="as-pa">${optB(pa)}</select> სვეტები: <select id="as-pb">${optB(pb)}</select></div>${g}
     <h4 style="margin-top:14px">${Bs?'ყველაზე გამორჩეული':'ყველაზე ხშირი'} წყვილები ნიშნებში</h4><div class="as-list">${topC.map(comboRow).join('')}</div></div>
   <div class="as-card"><h4>ასპექტები (ორბი ${S.orb}°)</h4>
     <div class="as-sel">მხოლოდ: <select id="as-focus"><option value="">ყველა პლანეტა</option>${X.BODIES.map(x=>`<option value="${x[0]}"${x[0]===focus?' selected':''}>${x[2]} ${x[1]}</option>`).join('')}</select></div>
     <div class="as-list">${byP.map(aspRow).join('')}</div>
     ${byL.length?`<h4 style="margin-top:14px">ჩვეულებრივზე გაცილებით ხშირი ასპექტები</h4><div class="as-list">${byL.map(aspRow).join('')}</div>`:''}</div>
   <div class="as-card"><h4>ელემენტები და მოდალობა (10 პლანეტა ☉–♇)</h4>
     <div class="as-sum" style="margin-bottom:6px">საშუალოდ: ${ELN.map((n,k)=>`${n} <b>${avgEl[k].toFixed(2)}</b>`).join(' · ')}</div>
     <div class="as-list">${elBars(A.el,[...ELN.map(n=>'დომინანტი: '+n),'თანაბარი'],[...ELC,'#555'],Bs?Bs.el:null)}</div>
     <div class="as-list" style="margin-top:8px">${elBars(A.mo,[...MON.map(n=>'დომინანტი: '+n),'თანაბარი'],['#c9a24c','#9a84d8','#5fc8b0','#555'],Bs?Bs.mo:null)}</div></div>`;
  out.querySelectorAll('.as-heat td[data-b]').forEach(td=>td.onclick=()=>{
    $('as-rows').insertAdjacentHTML('beforeend',signRow(td.dataset.b,+td.dataset.s));
    const r=$('as-rows').lastElementChild;r.querySelector('.as-x').onclick=()=>r.remove();
    wireMo(r);
    r.scrollIntoView({block:'center',behavior:'smooth'});});
  wireTog();
  $('as-pa').onchange=e=>{S.pa=e.target.value;render();};
  $('as-pb').onchange=e=>{S.pb=e.target.value;render();};
  $('as-focus').onchange=e=>{S.focus=e.target.value;render();};
}

function boot(){try{inject();}catch(e){console.warn('astrostats.js',e);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
window._astats={run,get last(){return LAST;}};
})();
