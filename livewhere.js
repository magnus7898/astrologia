/* ============================================================
   livewhere.js — „სად ვიცხოვრო“ under the natal chart
   ------------------------------------------------------------
   Rates ~700 world cities (every capital + every city of 1M+,
   Georgian towns too) and every country by your astrocartography
   lines — the same lines the ასტროკარტოგ. map draws (same RA/Dec,
   same sidereal time from the MC), so the two always agree.

   For a city: distance (km, along its parallel) to each planet's
   MC / IC / AC / DC line. Within ~800 km a line is felt, strongest
   on it. Planet tone for living:
     ♀ ♃ +3 · ☉ +2 · ☽ +1.5 · ☿ +1 · ♅ −1 · ♆ −1.5 · ♂ −2 · ♄ ♇ −2.5
   Angle weight for living: IC (home) 1.2 · AC (self, body) 1.0 ·
   MC (career) 0.9 · DC (partners) 0.8.
   A country = the average of its listed cities (its best and
   worst city shown). Any other city: type it in the search box.
   Needs a known birth time (lines move ~1° of longitude per 4 min).

   astro.html needs only:  <script src="livecities.js"></script>
                           <script src="livewhere.js"></script>
   ============================================================ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const RAD=Math.PI/180,DEG=180/Math.PI,EPS=23.4392911*RAD;
const P=[['მზე','☉',2,'ნათელი, აღიარება, ენერგია'],['მთვარე','☽',1.5,'სახლის გრძნობა, ემოციური კომფორტი'],
  ['მერკური','☿',1,'კონტაქტები, სწავლა, ვაჭრობა'],['ვენერა','♀',3,'სიყვარული, სილამაზე, სიამოვნება'],
  ['მარსი','♂',-2,'კონფლიქტი, აჩქარება, ტრავმები'],['იუპიტერი','♃',3,'იღბალი, ზრდა, შესაძლებლობები'],
  ['სატურნი','♄',-2.5,'სიმძიმე, შეზღუდვა, მარტოობა'],['ურანი','♅',-1,'არასტაბილურობა, მოულოდნელობა'],
  ['ნეპტუნი','♆',-1.5,'ბუნდოვანება, ილუზიები, დაბნეულობა'],['პლუტონი','♇',-2.5,'კრიზისი, ძალაუფლების ბრძოლა']];
const ANG={MC:[0.9,'MC','კარიერა'],IC:[1.2,'IC','სახლი'],AC:[1.0,'AC','პიროვნება'],DC:[0.8,'DC','პარტნიორები']};
const ORB=800;
const norm=l=>{const r=((l%360)+360)%360;return r>180?r-360:r;};
function ecl2eq(lon){const l=lon*RAD;
  return{ra:((Math.atan2(Math.sin(l)*Math.cos(EPS),Math.cos(l))*DEG)%360+360)%360,dec:Math.asin(Math.sin(l)*Math.sin(EPS))*DEG};}

/* lines from a chart: {planet → {ra,dec}}, GST (deg) */
function linesOf(data,birthLon){
  const GST=((ecl2eq(data.mc).ra-birthLon)+360)%360,L=[];
  for(const [n,s,v,t] of P){const p=data.planets&&data.planets[n];if(!p||p.degree==null)continue;
    const {ra,dec}=ecl2eq(+p.degree);L.push({n,s,v,t,ra,dec});}
  return{GST,L};
}
/* every line within ORB of (lat,lon) */
function hits(lat,lon,Lx){
  const out=[],kpd=111.32*Math.max(0.05,Math.cos(lat*RAD));
  for(const p of Lx.L){
    const mc=norm(p.ra-Lx.GST);
    const add=(ang,lineLon)=>{const d=Math.abs(norm(lon-lineLon))*kpd;if(d<ORB)out.push({p,ang,d});};
    add('MC',mc);add('IC',mc+180);
    const x=-Math.tan(lat*RAD)*Math.tan(p.dec*RAD);
    if(Math.abs(x)<=1){const H=Math.acos(x)*DEG;add('DC',p.ra+H-Lx.GST);add('AC',p.ra-H-Lx.GST);}
  }
  return out.sort((a,b)=>a.d-b.d);
}
const wOf=d=>Math.pow(1-d/ORB,1.5);
function score(h){return h.reduce((s,x)=>s+x.p.v*ANG[x.ang][0]*wOf(x.d),0);}

let RN=null;try{RN=new Intl.DisplayNames(['ka'],{type:'region'});}catch(_){}
const cname=cc=>{try{return(RN&&RN.of(cc))||cc;}catch(_){return cc;}};
const flag=cc=>/^[A-Z]{2}$/.test(cc)?String.fromCodePoint(...[...cc].map(c=>0x1F1A5+c.charCodeAt(0))):'';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tag=x=>{const good=x.p.v>0;const strong=x.d<300;
  return `<span class="lw-tag ${good?'g':'b'}${strong?' s':''}" title="${esc(x.p.n+' '+ANG[x.ang][1]+' — '+ANG[x.ang][2]+': '+x.p.t)}">${x.p.s} ${x.ang} <small>${Math.round(x.d)} კმ</small></span>`;};

const CSS=`
#lw-card .lw-note{font-size:11px;color:rgba(196,176,148,.7);line-height:1.6}
#lw-card .lw-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
#lw-card .lw-tabs button{all:unset;cursor:pointer;font-size:12px;padding:6px 12px;border-radius:14px;border:1px solid rgba(217,168,96,.3);color:rgba(239,227,206,.8)}
#lw-card .lw-tabs button.on{background:rgba(217,168,96,.16);border-color:rgba(217,168,96,.7);color:#f0c96b}
#lw-card .lw-cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
#lw-card h4{font-weight:400;font-size:12px;letter-spacing:.12em;margin:4px 0 6px}
#lw-card h4.g{color:#7fd1a8}#lw-card h4.b{color:#ec8f8f}
#lw-card .lw-row{display:grid;grid-template-columns:minmax(0,1fr) 46px;gap:6px;padding:7px 2px;border-bottom:1px solid rgba(122,90,34,.2);font-size:12.5px}
#lw-card .lw-row .nm{color:#EFE3CE}#lw-card .lw-row .nm small{color:rgba(196,176,148,.6)}
#lw-card .lw-row .sc{text-align:right;font-variant-numeric:tabular-nums}
#lw-card .lw-row .why{grid-column:1/3;margin-top:3px}
#lw-card .lw-tag{display:inline-block;font-size:10.5px;padding:1px 6px;border-radius:4px;margin:1px 3px 1px 0;white-space:nowrap}
#lw-card .lw-tag.g{background:rgba(78,163,140,.16);color:#8fd3c4}#lw-card .lw-tag.b{background:rgba(224,107,107,.15);color:#f0a0a0}
#lw-card .lw-tag.s{font-weight:600}
#lw-card .lw-tag small{opacity:.65;font-weight:400}
#lw-card .lw-find{display:flex;gap:8px;margin:10px 0 4px}
#lw-card .lw-find input{flex:1;min-width:0;background:rgba(0,0,0,.3);border:1px solid rgba(217,168,96,.3);border-radius:8px;color:#EFE3CE;font:inherit;font-size:13px;padding:8px 10px;outline:none}
#lw-card #lw-found{font-size:12.5px;margin-top:4px}
#lw-card .lw-pick{all:unset;cursor:pointer;display:block;padding:7px 4px;border-bottom:1px solid rgba(122,90,34,.2);font-size:12.5px;color:#EFE3CE}
@media(max-width:640px){#lw-card .lw-cols{grid-template-columns:1fr}}`;

let L0=null,DATA=null,view='city';

function ensureCard(){
  let c=$('lw-card');if(c)return c;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  c=document.createElement('div');c.id='lw-card';c.className='data-card';c.style.cssText='margin-top:16px;padding:16px';
  const anchor=$('dominants-card')||$('cinderella-card');
  if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(c,anchor.nextSibling);else($('chart-area')||document.body).appendChild(c);
  c.addEventListener('click',e=>{
    const b=e.target.closest('[data-v]');if(b){view=b.dataset.v;render();return;}
    const p=e.target.closest('.lw-pick');if(p){showFound(JSON.parse(p.dataset.c));}
  });
  return c;
}

function cityRows(){
  return window.LIVE_CITIES.map(([n,ka,cc,lat,lon,pop,cap])=>{const h=hits(lat,lon,L0);return{n:ka||n,en:n,cc,lat,lon,pop,cap,h,s:score(h)};});
}
function row(x,sub){
  const sc=x.s,col=sc>0.4?'#7fd1a8':sc<-0.4?'#ec8f8f':'rgba(196,176,148,.7)';
  return `<div class="lw-row"><span class="nm">${flag(x.cc)} ${esc(x.n)} <small>${esc(sub)}</small></span>
    <span class="sc" style="color:${col}">${sc>0?'+':''}${sc.toFixed(1)}</span>
    <span class="why">${x.h.slice(0,4).map(tag).join('')||'<span class="lw-note">ახლოს ხაზი არ გადის — ნეიტრალური</span>'}</span></div>`;
}

function render(){
  const c=ensureCard();
  if(!DATA){c.style.display='none';return;}
  c.style.display='block';
  const head=`<div class="data-card-title" style="margin-bottom:6px">🌍 სად ვიცხოვრო — ქვეყნები და ქალაქები</div>
    <div class="lw-note">შენი პლანეტების ხაზები (იგივე, რაც ასტროკარტოგრაფიის რუქაზე). ხაზი იგრძნობა ~800 კმ-ის მანძილზე, ყველაზე ძლიერად — 300 კმ-მდე.
      <span class="lw-tag g">♀ ♃ ☉ ☽ ☿</span> ხელსაყრელი · <span class="lw-tag b">♄ ♇ ♂ ♆ ♅</span> რთული ·
      IC — სახლი (ცხოვრებისთვის ყველაზე მნიშვნელოვანი), AC — პიროვნება, MC — კარიერა, DC — პარტნიორები.</div>`;
  if(DATA.noTime){c.innerHTML=head+`<p class="lw-note" style="margin-top:10px">⚠ დაბადების დრო უცნობია — ხაზები ყოველ 4 წუთში 1°-ით იძვრება, ამიტომ ქალაქების შეფასება შეუძლებელია. შეიყვანე ზუსტი დრო.</p>`;return;}
  /* tiny territories (Grytviken, Avarua…) only clutter the world lists */
  const rows=DATA.rows.filter(x=>x.pop>=100000||x.cc==='GE');
  let body='';
  if(view==='city'){
    const s=[...rows].sort((a,b)=>b.s-a.s);
    const good=s.filter(x=>x.s>0.3).slice(0,15),bad=s.filter(x=>x.s<-0.3).slice(-15).reverse();
    body=`<div class="lw-cols"><div><h4 class="g">✓ საუკეთესო ქალაქები</h4>${good.map(x=>row(x,cname(x.cc))).join('')||'<p class="lw-note">—</p>'}</div>
      <div><h4 class="b">✕ რთული ქალაქები</h4>${bad.map(x=>row(x,cname(x.cc))).join('')||'<p class="lw-note">—</p>'}</div></div>`;
  }else if(view==='country'){
    const by={};for(const x of rows)(by[x.cc]=by[x.cc]||[]).push(x);
    const cs=Object.entries(by).map(([cc,a])=>{const s=a.reduce((t,x)=>t+x.s,0)/a.length;const srt=[...a].sort((p,q)=>q.s-p.s);
      return{cc,n:cname(cc),s,best:srt[0],worst:srt[srt.length-1],h:(s>=0?srt[0]:srt[srt.length-1]).h,k:a.length};}).sort((a,b)=>b.s-a.s);
    const sub=x=>x.k>1?`${x.k} ქალაქი · საუკეთესო: ${x.best.n}`:x.best.n;
    const good=cs.filter(x=>x.s>0.3).slice(0,15),bad=cs.filter(x=>x.s<-0.3).slice(-15).reverse();
    body=`<div class="lw-cols"><div><h4 class="g">✓ საუკეთესო ქვეყნები</h4>${good.map(x=>row(x,sub(x))).join('')||'<p class="lw-note">—</p>'}</div>
      <div><h4 class="b">✕ რთული ქვეყნები</h4>${bad.map(x=>row(x,x.k>1?`${x.k} ქალაქი · ყველაზე რთული: ${x.worst.n}`:x.worst.n)).join('')||'<p class="lw-note">—</p>'}</div></div>
      <p class="lw-note" style="margin-top:8px">ქვეყნის ქულა — მისი დედაქალაქისა და მილიონიანი ქალაქების საშუალო. დიდ ქვეყნებში (რუსეთი, აშშ, ჩინეთი…) სხვადასხვა რეგიონი სხვადასხვანაირია — ნახე ქალაქები ან მოძებნე კონკრეტული.</p>`;
  }else{
    const ge=DATA.rows.filter(x=>x.cc==='GE').sort((a,b)=>b.s-a.s);
    body=ge.map(x=>row(x,x.cap?'დედაქალაქი':'')).join('');
  }
  c.innerHTML=head+`<div class="lw-find"><input id="lw-q" placeholder="შეამოწმე ნებისმიერი ქალაქი — Toronto, ბათუმი…" autocomplete="off"></div><div id="lw-found"></div>
    <div class="lw-tabs"><button data-v="city" class="${view==='city'?'on':''}">ქალაქები</button><button data-v="country" class="${view==='country'?'on':''}">ქვეყნები</button><button data-v="ge" class="${view==='ge'?'on':''}">საქართველო</button></div>`+body;
  wireFind();
}

let fT=null,fSeq=0;
function wireFind(){
  const q=$('lw-q');if(!q)return;
  q.addEventListener('input',()=>{clearTimeout(fT);const v=q.value.trim(),my=++fSeq,out=$('lw-found');
    if(v.length<2){out.innerHTML='';return;}
    out.innerHTML='<span class="lw-note">⏳ ძიება…</span>';
    fT=setTimeout(async()=>{
      let list=[];
      try{const r=await fetch(`${BACKEND}/geocode/search`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:v})});
        if(r.ok)list=(await r.json()).results||[];}catch(_){}
      if(!list.length){ /* offline fallback: the built-in list */
        const f=v.toLowerCase();list=window.LIVE_CITIES.filter(c=>c[0].toLowerCase().startsWith(f)||c[1].startsWith(v)).slice(0,6)
          .map(c=>({display:(c[1]||c[0])+', '+cname(c[2]),lat:c[3],lon:c[4]}));}
      if(my!==fSeq)return;
      if(!list.length){out.innerHTML='<span class="lw-note">ვერ მოიძებნა</span>';return;}
      if(list.length===1)return showFound(list[0]);
      out.innerHTML=list.slice(0,6).map(d=>`<button type="button" class="lw-pick" data-c='${esc(JSON.stringify({display:d.display,lat:d.lat,lon:d.lon}))}'>${esc(d.display)}</button>`).join('');
    },350);
  });
}
function showFound(d){
  const h=hits(+d.lat,+d.lon,L0),s=score(h),out=$('lw-found');
  const verdict=s>1.5?'ძალიან ხელსაყრელი':s>0.4?'ხელსაყრელი':s<-1.5?'ძალიან რთული':s<-0.4?'რთული':'ნეიტრალური';
  out.innerHTML=`<div class="lw-row" style="border:1px solid rgba(217,168,96,.3);border-radius:8px;padding:9px 10px">
    <span class="nm">📍 ${esc(d.display)} — <b style="font-weight:400;color:${s>0.4?'#7fd1a8':s<-0.4?'#ec8f8f':'#EFE3CE'}">${verdict}</b></span>
    <span class="sc">${s>0?'+':''}${s.toFixed(1)}</span>
    <span class="why">${h.map(x=>tag(x)+`<span class="lw-note">${x.p.n} ${ANG[x.ang][1]} (${ANG[x.ang][2]}) — ${x.p.t}</span><br>`).join('')||'<span class="lw-note">800 კმ-ში არცერთი ხაზი არ გადის — ადგილი ნეიტრალურია, მთავარ როლს ნატალური რუქა თამაშობს.</span>'}</span></div>`;
}

function update(data){
  if(!window.LIVE_CITIES)return;
  const req=window._cindReq;
  if(typeof currentMode==='undefined'||currentMode!=='natal'||!req||data.mc==null){DATA=null;const c=$('lw-card');if(c)c.style.display='none';return;}
  if(data._timeUnknown||req.time_unknown){DATA={noTime:true};render();return;}
  L0=linesOf(data,+req.lon);
  DATA={rows:cityRows()};
  render();
}

function hook(){
  if(typeof window.showSingleChart!=='function'||window.showSingleChart._lw)return false;
  const o=window.showSingleChart;
  const w=function(data){const r=o.apply(this,arguments);try{update(data);}catch(e){console.warn('livewhere',e);}return r;};
  w._lw=true;window.showSingleChart=w;
  if(typeof window.showDoubleChart==='function'&&!window.showDoubleChart._lw){
    const d=window.showDoubleChart;const w2=function(){const c=$('lw-card');if(c)c.style.display='none';return d.apply(this,arguments);};w2._lw=true;window.showDoubleChart=w2;}
  return true;
}
let tries=0;(function wait(){if(hook()||++tries>100)return;setTimeout(wait,100);})();
window._liveWhere={hits,score,linesOf};
})();
