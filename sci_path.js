/* sci_path.js — „ნულიდან გმირამდე“: the learning path shared by the math, physics, chemistry and biology labs.
   SCIPATH.mount({host,key,accent,accent2,title,levels:[{t,n,d,ids}],meta:id=>({ico,t,s}),intro:{id:html},
                  quiz:{id:[[question,[options],correctIndex,explanation],…]},build(id,el),stop(),decorate(el)})
   Progress (finished lessons, XP, best quiz scores) is kept per subject in localStorage.            */
(function(){
'use strict';
const RANKS=[['ნული','○'],['ახალბედა','☽'],['მოსწავლე','✦'],['მკვლევარი','✧'],['ოსტატი','✪'],['გმირი','☀']];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

function mount(o){
  const host=o.host,KEY='sci_'+o.key;
  const load=()=>{try{return Object.assign({done:{},xp:0,best:{},last:null},JSON.parse(localStorage.getItem(KEY))||{});}catch(e){return {done:{},xp:0,best:{},last:null};}};
  let P=load();const save=()=>{try{const o=load();/* merge with what another tab may have written */
    P.done=Object.assign({},o.done,P.done);for(const k in o.best)P.best[k]=Math.max(P.best[k]||0,o.best[k]);P.xp=Math.max(P.xp,o.xp);localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}};
  const ORDER=o.levels.flatMap(l=>l.ids),LV={};o.levels.forEach((l,i)=>l.ids.forEach(id=>LV[id]=i));
  const M=id=>o.meta(id)||{ico:'•',t:id,s:''};
  const total=ORDER.length,nDone=()=>ORDER.filter(id=>P.done[id]).length;
  const rank=()=>{const f=nDone()/total;return f>=1?5:f>=.75?4:f>=.5?3:f>=.25?2:f>0?1:0;};
  const nextId=()=>ORDER.find(id=>!P.done[id])||ORDER[0];
  host.classList.add('sp');host.style.setProperty('--acc',o.accent||'#c9a84c');host.style.setProperty('--acc2',o.accent2||'#ecd59a');
  host.innerHTML=`<section class="sp-map"></section><section class="sp-lesson" hidden>
    <div class="sp-bar"><button data-a="map">✦ <span class="lbl">რუკა</span></button><div class="sp-crumb"></div><div class="sp-dots"></div>
      <button data-a="prev" title="წინა">◀</button><button data-a="next" title="შემდეგი">▶</button></div>
    <div class="sp-lhead"></div><div class="sp-intro" hidden></div><div class="sp-body"></div><div class="sp-quiz"></div><div class="sp-nextc"></div></section>`;
  const mapEl=host.querySelector('.sp-map'),lesEl=host.querySelector('.sp-lesson'),body=host.querySelector('.sp-body');
  const toastEl=document.createElement('div');toastEl.className='sp-toast';document.body.appendChild(toastEl);let tT=0;
  const toast=h=>{toastEl.innerHTML=h;toastEl.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>toastEl.classList.remove('on'),2600);};
  const burst=(x,y)=>{for(let i=0;i<26;i++){const d=document.createElement('i');d.className='sp-burst';const a=Math.random()*Math.PI*2,r=60+Math.random()*90;
    d.style.cssText=`left:${x}px;top:${y}px;background:${i%2?'var(--acc)':'var(--acc2)'};--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px`;host.appendChild(d);setTimeout(()=>d.remove(),1200);}};
  if(o.decorate)new MutationObserver(()=>o.decorate(body)).observe(body,{childList:true,subtree:true});
  const stop=()=>{try{o.stop&&o.stop();}catch(e){}try{window.SCIKIT&&SCIKIT.stopAll();}catch(e){}};

  /* ───────── map ───────── */
  function drawMap(){
    const r=rank(),nd=nDone(),pct=nd/total,C=2*Math.PI*42,nx=nextId();
    mapEl.innerHTML=`<div class="sp-hero"><div class="sp-ring"><svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/>
       <circle cx="48" cy="48" r="42" fill="none" stroke="url(#spg${o.key})" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C*pct} ${C}"/>
       <defs><linearGradient id="spg${o.key}"><stop offset="0" stop-color="var(--acc)"/><stop offset="1" stop-color="var(--acc2)"/></linearGradient></defs></svg>
       <div class="rk"><i>${RANKS[r][1]}</i><b>${Math.round(pct*100)}%</b></div></div>
     <div class="sp-who"><div class="t">${esc(o.title||'')} · ნულიდან გმირამდე</div><div class="r">${RANKS[r][0]}</div>
       <div class="st"><span><b>${nd}</b> / ${total} გაკვეთილი</span><span><b>${P.xp}</b> XP</span><span><b>${o.levels.filter(l=>l.ids.every(id=>P.done[id])).length}</b> / ${o.levels.length} დონე</span></div>
       <div class="sp-ladder">${RANKS.slice(1).map((_,i)=>`<span class="${r>i?'on':''}" title="${RANKS[i+1][0]}"></span>`).join('')}</div></div>
     <button class="sp-go" data-id="${nx}"><small>${nd?(nd===total?'გაიმეორე':'გააგრძელე'):'დაიწყე აქედან'}</small>${M(nx).ico} ${esc(M(nx).t)}</button></div>`+
     o.levels.map((L,li)=>{const dn=L.ids.filter(id=>P.done[id]).length;
       return `<div class="sp-lvl${dn===L.ids.length?' full':''}"><div class="sp-lh"><span class="sp-ln">${li}</span><div><b>${esc(L.t)}${L.n?' · '+esc(L.n):''}</b><small>${esc(L.d||'')}</small></div><span class="sp-lp">${dn} / ${L.ids.length}</span></div>
       <div class="sp-nodes"><svg class="sp-lines"></svg>${L.ids.map(id=>{const m=M(id),q=P.best[id];
         return `<button class="sp-node${P.done[id]?' done':''}${id===nx&&nd<total?' next':''}" data-id="${id}"><span class="sp-star">${m.ico}</span><b>${esc(m.t)}</b><small>${esc(m.s||'')}</small>${q!=null?`<span class="qs">ტესტი ${q}%</span>`:''}</button>`;}).join('')}</div></div>`;}).join('')+
     `<div class="sp-foot">პროგრესი ინახება ამ მოწყობილობაზე. <button data-a="reset">განულება</button></div>`;
    mapEl.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>go(b.dataset.id));
    mapEl.querySelector('[data-a="reset"]').onclick=()=>{if(confirmReset()){P={done:{},xp:0,best:{},last:null};try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}drawMap();}};
    requestAnimationFrame(lines);}
  let resetArm=0;function confirmReset(){if(Date.now()-resetArm<4000)return true;resetArm=Date.now();toast('დააჭირე კიდევ ერთხელ განულებისთვის');return false;}
  function lines(){mapEl.querySelectorAll('.sp-nodes').forEach(box=>{const svg=box.querySelector('svg'),R=box.getBoundingClientRect();
    const pts=[...box.querySelectorAll('.sp-node')].map(n=>{const s=n.querySelector('.sp-star').getBoundingClientRect();return [s.left+s.width/2-R.left,s.top+s.height/2-R.top,n.classList.contains('done')];});
    let h='';for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],on=a[2]&&b[2],mx=(a[0]+b[0])/2;
      const d=Math.abs(a[1]-b[1])>40?`M${a[0]},${a[1]} C${a[0]},${(a[1]+b[1])/2} ${b[0]},${(a[1]+b[1])/2} ${b[0]},${b[1]}`:`M${a[0]},${a[1]} Q${mx},${Math.min(a[1],b[1])-14} ${b[0]},${b[1]}`;
      h+=`<path d="${d}" fill="none" stroke="${on?'var(--acc)':'rgba(255,255,255,.13)'}" stroke-width="${on?2:1.2}" ${on?'':'stroke-dasharray="3 5"'} ${on?'style="filter:drop-shadow(0 0 4px var(--acc))"':''}/>`;}
    svg.innerHTML=h;});}
  window.addEventListener('resize',()=>{if(!mapEl.hidden)lines();});

  /* ───────── lesson ───────── */
  let cur=null;
  function openLesson(id){
    stop();cur=id;P.last=id;save();const m=M(id),li=LV[id],L=o.levels[li],i=ORDER.indexOf(id);
    mapEl.hidden=true;lesEl.hidden=false;
    lesEl.querySelector('.sp-crumb').innerHTML=`დონე ${li} · ${esc(L.t)} › <b>${esc(m.t)}</b>`;
    lesEl.querySelector('.sp-dots').innerHTML=L.ids.map(x=>`<i class="${P.done[x]?'d':''} ${x===id?'c':''}" title="${esc(M(x).t)}"></i>`).join('');
    lesEl.querySelector('[data-a="prev"]').disabled=i<=0;lesEl.querySelector('[data-a="next"]').disabled=i>=ORDER.length-1;
    lesEl.querySelector('.sp-lhead').innerHTML=`<span class="sp-star">${m.ico}</span><div><div class="k">დონე ${li} · ${esc(L.t)}${L.n?' · '+esc(L.n):''}</div><h2>${esc(m.t)}</h2><p>${esc(m.s||'')}</p></div>`;
    const it=lesEl.querySelector('.sp-intro'),ix=o.intro&&o.intro[id];it.hidden=!ix;it.innerHTML=ix?`<div>${ix}</div>`:'';
    body.innerHTML='';try{o.build(id,body);}catch(e){body.innerHTML='<div class="terr">შეცდომა: '+esc(e.message)+'</div>';console.error(e);}
    drawQuiz(id);drawNext(id);}
  function drawNext(id){const i=ORDER.indexOf(id),pv=ORDER[i-1],nx=ORDER[i+1];
    lesEl.querySelector('.sp-nextc').innerHTML=(pv?`<button class="sp-btn ghost" data-id="${pv}">◀ ${esc(M(pv).t)}</button>`:'<span></span>')+(nx?`<button class="sp-btn" data-id="${nx}">${esc(M(nx).t)} ▶</button>`:`<button class="sp-btn" data-a="map">✦ რუკაზე დაბრუნება</button>`);
    lesEl.querySelectorAll('.sp-nextc [data-id]').forEach(b=>b.onclick=()=>go(b.dataset.id));const mb=lesEl.querySelector('.sp-nextc [data-a="map"]');if(mb)mb.onclick=()=>go('map');}
  function finish(id,ev){if(P.done[id])return;P.done[id]=1;P.xp+=50;save();
    const L=o.levels[LV[id]],full=L.ids.every(x=>P.done[x]);
    toast(full?`☀ დონე „${esc(L.t)}“ დასრულდა! · <b>+50 XP</b>`:`✦ გაკვეთილი დასრულდა · <b>+50 XP</b> · რანგი: <b>${RANKS[rank()][0]}</b>`);
    if(ev)burst(ev.clientX,ev.clientY);
    lesEl.querySelectorAll('.sp-dots i').forEach((d,k)=>d.classList.toggle('d',!!P.done[L.ids[k]]));}
  function drawQuiz(id){const box=lesEl.querySelector('.sp-quiz'),Q=(o.quiz&&o.quiz[id])||[];
    if(!Q.length){box.innerHTML=`<h3>✦ გაკვეთილის დასრულება</h3><div class="qh">ამ გაკვეთილს ტესტი არ აქვს — ექსპერიმენტების შემდეგ მონიშნე როგორც ნასწავლი.</div>
      <button class="sp-btn" ${P.done[id]?'disabled':''}>${P.done[id]?'✓ ნასწავლია':'✓ ვისწავლე'}</button>`;
      box.querySelector('button').onclick=e=>{finish(id,e);e.target.disabled=true;e.target.textContent='✓ ნასწავლია';};return;}
    const qs=shuf(Q).slice(0,Math.min(4,Q.length)).map(q=>{const ord=shuf(q[1].map((_,k)=>k));return {q:q[0],o:ord.map(k=>q[1][k]),a:ord.indexOf(q[2]),x:q[3]};});
    let ans=0,ok=0;const need=Math.ceil(qs.length*2/3);
    box.innerHTML=`<h3>✦ შეამოწმე თავი</h3><div class="qh">${qs.length} კითხვა · დასასრულებლად საჭიროა ${need} სწორი${P.done[id]?' · <span class="ok">✓ უკვე ნასწავლია</span>':''}</div>`+
      qs.map((q,k)=>`<div class="sp-q" data-k="${k}"><div class="qq"><i>${k+1}</i>${q.q}</div><div class="qo">${q.o.map((t,j)=>`<button data-j="${j}">${t}</button>`).join('')}</div></div>`).join('')+'<div class="sp-res" hidden></div>';
    box.querySelectorAll('.sp-q').forEach(el=>{const q=qs[+el.dataset.k];el.querySelectorAll('.qo button').forEach(b=>b.onclick=ev=>{
      const j=+b.dataset.j,good=j===q.a;el.querySelectorAll('.qo button').forEach(x=>{x.disabled=true;if(+x.dataset.j===q.a)x.classList.add('ok');});if(!good)b.classList.add('bad');
      if(q.x){const d=document.createElement('div');d.className='qx';d.innerHTML=(good?'✓ ':'✗ ')+q.x;el.appendChild(d);}
      ans++;if(good){ok++;P.xp+=10;save();}
      if(ans===qs.length){const pct=Math.round(ok/qs.length*100);P.best[id]=Math.max(P.best[id]||0,pct);save();const pass=ok>=need,res=box.querySelector('.sp-res');res.hidden=false;
        res.innerHTML=`<div><span class="sc">${ok} / ${qs.length}</span> <span style="color:var(--ink-mid);font-size:13px">${pass?'შესანიშნავია!':'კიდევ სცადე — კითხვები შეიცვლება'}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="sp-btn ghost" data-a="retry">↻ ხელახლა</button>${pass&&ORDER.indexOf(id)<ORDER.length-1?`<button class="sp-btn" data-a="nx">შემდეგი ▶</button>`:''}</div>`;
        res.querySelector('[data-a="retry"]').onclick=()=>drawQuiz(id);const n=res.querySelector('[data-a="nx"]');if(n)n.onclick=()=>go(ORDER[ORDER.indexOf(id)+1]);
        if(pass)finish(id,ev);}});});}

  /* ───────── routing ───────── */
  function go(id){if(id==='map'){if(location.hash&&location.hash!=='#map')location.hash='map';else route();return;}if(location.hash==='#'+id)route();else location.hash=id;}
  function route(){const h=decodeURIComponent((location.hash||'').slice(1));
    if(h&&ORDER.includes(h)){openLesson(h);host.scrollIntoView({block:'start'});}
    else{stop();cur=null;lesEl.hidden=true;mapEl.hidden=false;const o=load();P.done=Object.assign({},o.done,P.done);P.xp=Math.max(P.xp,o.xp);drawMap();}}
  lesEl.querySelector('[data-a="map"]').onclick=()=>go('map');
  lesEl.querySelector('[data-a="prev"]').onclick=()=>{const i=ORDER.indexOf(cur);if(i>0)go(ORDER[i-1]);};
  lesEl.querySelector('[data-a="next"]').onclick=()=>{const i=ORDER.indexOf(cur);if(i<ORDER.length-1)go(ORDER[i+1]);};
  window.addEventListener('hashchange',route);
  route();
  return {go,progress:()=>({done:nDone(),total,xp:P.xp,rank:RANKS[rank()][0]})};
}
window.SCIPATH={mount,RANKS,progress:key=>{try{const p=JSON.parse(localStorage.getItem('sci_'+key))||{};return {done:Object.keys(p.done||{}).length,xp:p.xp||0};}catch(e){return {done:0,xp:0};}}};
})();
