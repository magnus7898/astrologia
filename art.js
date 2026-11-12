/* art.js — animated symbol tour of a painting for the course „ხელოვნების ეზოთერული სიმბოლიკა",
   built like the tarot symbol tour (course_tarot6): the painting zooms and pans to each detail,
   a pulsing ring marks it, and the text explains it step by step — overview → symbols → synthesis.
   ART.reader(host, works) · work = {short,title,author,year,place,file,ar,about,end,spots:[{x,y,z?,k,t,d}]}
   x,y in % of the picture, z = zoom (default 2.6), k = key (colour, gesture, number, left/right, light, symbol).
   Images: public-domain files hot-linked from Wikimedia Commons (Special:FilePath), credited under the picture.
   Edit mode (?edit in the URL): pins are shown on the full picture and can be dragged; a click adds one;
   the JSON of the current work's pins appears below for copying back into the lesson. */
(function(){
const FP='https://commons.wikimedia.org/wiki/Special:FilePath/',CP='https://commons.wikimedia.org/wiki/File:';
const KEYS={color:['ფერი','#E0B450'],gesture:['ჟესტი','#ff8a8a'],number:['რიცხვი','#8fd19a'],lr:['მარცხენა / მარჯვენა','#7fb8ff'],light:['სინათლე','#fff2b3'],sym:['სიმბოლო','#c9a0ff']};
const EDIT=/[?&]edit\b/.test(location.search);
let css=false;
function style(){if(css)return;css=true;const s=document.createElement('style');s.textContent=`
.ar-tabs{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 10px;scrollbar-width:thin}
.ar-tabs button{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:4px;width:118px;border:1px solid rgba(184,137,74,.35);border-radius:10px;padding:4px;background:none;cursor:pointer;color:#d6cbb2;font:12px/1.3 'Noto Serif Georgian',serif;text-align:center}
.ar-tabs button img{width:100%;height:64px;object-fit:cover;border-radius:6px;display:block;background:#141b2c}
.ar-tabs button.on{border-color:#FFD36A;box-shadow:0 0 0 2px rgba(255,211,106,.35);color:#FFF0C8}
.ar-tour{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:22px;align-items:start;margin-top:6px}
@media(max-width:820px){.ar-tour{grid-template-columns:1fr}}
.ar-vw{position:sticky;top:12px}@media(max-width:820px){.ar-vw{position:static}}
.ar-vp{position:relative;width:100%;overflow:hidden;border-radius:14px;border:1px solid rgba(184,137,74,.45);background:#0e1424}
.ar-vp img{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:0 0;transition:transform 1.5s cubic-bezier(.65,.05,.25,1);will-change:transform}
.ar-ring{position:absolute;width:18%;aspect-ratio:1;border:2px solid #FFD36A;border-radius:50%;transform:translate(-50%,-50%) scale(.6);opacity:0;pointer-events:none;box-shadow:0 0 18px rgba(255,211,106,.55);transition:opacity .4s}
.ar-ring.on{opacity:1;animation:arp 1.8s ease-in-out infinite}
@keyframes arp{0%,100%{transform:translate(-50%,-50%) scale(.85)}50%{transform:translate(-50%,-50%) scale(1.05)}}
.ar-miss{position:absolute;inset:0;display:none;align-items:center;justify-content:center;text-align:center;padding:20px;color:#9aa3b6;font-size:13px}
.ar-cap{font-size:12px;color:#9aa3b6;margin-top:6px;line-height:1.5;text-align:center}.ar-cap a{color:#C9A24C}
.ar-ctl{display:flex;justify-content:center;gap:10px;margin-top:10px}
.ar-ctl button{background:rgba(201,162,76,.12);border:1px solid rgba(201,162,76,.55);color:#F3DDA4;border-radius:999px;padding:7px 16px;font-size:14px;cursor:pointer;font-family:inherit;min-width:56px}
.ar-bar{height:3px;background:rgba(255,255,255,.08);border-radius:3px;margin-top:8px;overflow:hidden}.ar-bar i{display:block;height:100%;width:0;background:#C9A24C;transition:width .4s}
.ar-txt h3{font-family:'Marcellus SC','Noto Serif Georgian',serif;font-weight:400;font-size:24px;color:#E3BE84}
.ar-txt .st{font-size:13px;color:#B8894A;margin-top:4px;letter-spacing:.05em}
.ar-txt .tx{margin-top:10px;font-size:15px;line-height:1.9;color:#eef0f4;min-height:120px;animation:arfi .6s ease}
.ar-txt .tx b{color:#F3DDA4}
@keyframes arfi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.ar-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
.ar-chips button{background:none;border:1px solid rgba(184,137,74,.4);border-left:3px solid var(--k,rgba(184,137,74,.4));color:#d6cbb2;border-radius:999px;padding:4px 11px;font-size:12.5px;cursor:pointer;font-family:inherit}
.ar-chips button.on{background:rgba(201,162,76,.25);border-color:#FFD36A;color:#FFF0C8}.ar-chips button.done{color:#F3DDA4}
.ar-keys{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;font-size:12px;color:#9aa3b6}.ar-keys i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:middle}
.ar-pin{position:absolute;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;border:2px solid #0b1020;background:var(--k);color:#0b1020;font:700 12px Cinzel,serif;display:flex;align-items:center;justify-content:center;cursor:grab;box-shadow:0 0 0 2px #fff;z-index:3;touch-action:none}
.ar-edit{width:100%;height:170px;margin-top:8px;background:#0e1424;color:#9fe;border:1px dashed #7fe3ff;font:11px monospace;padding:6px}
`;document.head.appendChild(s);}

function reader(host,works){style();let wi=0,st=0,timer=null,play=false;
  host.innerHTML=`<div class="ar-tabs"></div><div class="ar-tour"><div class="ar-vw"><div class="ar-vp"><img alt=""><div class="ar-ring"></div><div class="ar-miss"></div></div>
   <div class="ar-ctl"><button type="button" data-a="pv" aria-label="წინა">◀</button><button type="button" data-a="pl" aria-label="დაკვრა">▶</button><button type="button" data-a="nx" aria-label="შემდეგი">▶▶</button></div>
   <div class="ar-bar"><i></i></div><div class="ar-cap"></div>${EDIT?'<textarea class="ar-edit" readonly></textarea>':''}</div>
   <div class="ar-txt"><h3></h3><div class="st"></div><div class="tx"></div><div class="ar-chips"></div><div class="ar-keys"></div></div></div>`;
  const q=s=>host.querySelector(s),vp=q('.ar-vp'),img=q('.ar-vp img'),ring=q('.ar-ring'),miss=q('.ar-miss');
  const W=()=>works[wi];
  const steps=()=>{const w=W();return [{x:50,y:50,z:1,t:'ნახატი მთლიანად',d:w.about,o:1}].concat(w.spots.map(s=>Object.assign({z:2.6},s)),[{x:50,y:50,z:1,t:'ყველაფერი ერთად',d:w.end||'',o:2}]);};
  const src=(w,px)=>FP+encodeURIComponent(w.file).replace(/%2C/g,',')+'?width='+px;
  function tabs(){q('.ar-tabs').innerHTML=works.map((w,i)=>`<button type="button" data-w="${i}" class="${i===wi?'on':''}"><img loading="lazy" src="${src(w,240)}" alt="">${w.short||w.title}</button>`).join('');}
  function view(){const s=steps()[st],z=EDIT?1:s.z,Wd=vp.clientWidth,H=vp.clientHeight,x=s.x/100,y=s.y/100;
    let tx=Wd/2-x*Wd*z,ty=H/2-y*H*z;tx=Math.min(0,Math.max(Wd-Wd*z,tx));ty=Math.min(0,Math.max(H-H*z,ty));
    img.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;
    if(z>1.01){ring.style.left=(x*Wd*z+tx)+'px';ring.style.top=(y*H*z+ty)+'px';ring.classList.remove('on');const k=st;setTimeout(()=>{if(st===k&&steps()[st].z>1.01)ring.classList.add('on');},1300);}else ring.classList.remove('on');}
  function text(){const S=steps(),s=S[st],L=S.length,w=W(),K=KEYS[s.k];
    q('.ar-txt h3').textContent=w.title;
    q('.st').innerHTML=s.o===1?`${w.author}, ${w.year} · ${L-2} სიმბოლო`:s.o===2?'შეჯამება':`${st} / ${L-2} · <span style="color:${K[1]}">${K[0]}</span> · ${s.t}`;
    const tx=q('.tx');tx.innerHTML=(s.o?'':`<b>${s.t}.</b> `)+s.d;tx.style.animation='none';void tx.offsetWidth;tx.style.animation='';
    q('.ar-chips').innerHTML=S.map((p,i)=>`<button type="button" data-s="${i}" class="${i===st?'on':i<st?'done':''}" ${p.k?`style="--k:${KEYS[p.k][1]}"`:''}>${i===0?'ნახატი':i===L-1?'შეჯამება':p.t}</button>`).join('');
    const used=[...new Set(w.spots.map(p=>p.k))];q('.ar-keys').innerHTML=used.map(k=>`<span><i style="background:${KEYS[k][1]}"></i>${KEYS[k][0]}</span>`).join('');
    q('.ar-bar i').style.width=(st/(L-1)*100)+'%';}
  function pins(){vp.querySelectorAll('.ar-pin').forEach(p=>p.remove());if(!EDIT)return;W().spots.forEach((s,i)=>{const b=document.createElement('div');b.className='ar-pin';b.style.left=s.x+'%';b.style.top=s.y+'%';b.style.setProperty('--k',KEYS[s.k][1]);b.textContent=i+1;b.dataset.i=i;b.title=s.t;vp.appendChild(b);});
    q('.ar-edit').value=W().spots.map((s,i)=>`${i+1}. {x:${s.x.toFixed(1)},y:${s.y.toFixed(1)}} ${s.t}`).join('\n');}
  function go(i){const L=steps().length;st=Math.max(0,Math.min(L-1,i));view();text();}
  function load(i){stop();wi=i;st=0;const w=W();miss.style.display='none';vp.style.aspectRatio=w.ar||'4/3';img.style.transition='none';img.alt=`${w.title} — ${w.author}`;img.src=src(w,2000);
    q('.ar-cap').innerHTML=`${w.author}, „${w.title}“, ${w.year}. ${w.place||''} · <a href="${CP+encodeURIComponent(w.file)}" target="_blank" rel="noopener">Wikimedia Commons</a> (საჯარო საკუთრება)`;
    view();void img.offsetWidth;img.style.transition='';tabs();text();pins();}
  function tick(){if(!play)return;const L=steps().length;if(st<L-1){go(st+1);timer=setTimeout(tick,Math.max(6500,steps()[st].d.replace(/<[^>]+>/g,'').length*55));}else stop();}
  function start(){play=true;q('[data-a="pl"]').textContent='❚❚';if(st>=steps().length-1)go(0);timer=setTimeout(tick,st===0?Math.max(6000,steps()[0].d.length*45):800);}
  function stop(){play=false;clearTimeout(timer);const b=q('[data-a="pl"]');if(b)b.textContent='▶';}
  img.addEventListener('load',()=>{if(img.naturalWidth)vp.style.aspectRatio=img.naturalWidth+'/'+img.naturalHeight;view();});
  img.addEventListener('error',()=>{miss.style.display='flex';miss.textContent='სურათი ვერ ჩაიტვირთა (Wikimedia) — ტექსტი და ნაბიჯები მაინც მუშაობს.';});
  host.addEventListener('click',e=>{const b=e.target.closest('button');
    if(b&&b.dataset.w!=null){load(+b.dataset.w);return;}
    if(b&&b.dataset.s!=null){stop();go(+b.dataset.s);return;}
    if(b&&b.dataset.a){const a=b.dataset.a;if(a==='pl')play?stop():start();else{stop();go(st+(a==='nx'?1:-1));}return;}
    if(EDIT&&e.target===img){const r=vp.getBoundingClientRect();W().spots.push({x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100,k:'sym',t:'ახალი',d:''});pins();text();}});
  if(EDIT){let drag=null;vp.addEventListener('pointerdown',e=>{const p=e.target.closest('.ar-pin');if(!p)return;drag=p;p.setPointerCapture(e.pointerId);});
    vp.addEventListener('pointermove',e=>{if(!drag)return;const r=vp.getBoundingClientRect(),s=W().spots[+drag.dataset.i];s.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));s.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));drag.style.left=s.x+'%';drag.style.top=s.y+'%';q('.ar-edit').value=W().spots.map((s,i)=>`${i+1}. {x:${s.x.toFixed(1)},y:${s.y.toFixed(1)}} ${s.t}`).join('\n');});
    vp.addEventListener('pointerup',()=>{drag=null;});}
  document.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;const r=host.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;if(e.key==='ArrowRight'){stop();go(st+1);}else if(e.key==='ArrowLeft'){stop();go(st-1);}});
  window.addEventListener('resize',view);
  load(0);
  return {go(w,s){if(w!==wi)load(w);go(s||0);},state:()=>({wi,st,n:steps().length,play,ok:img.complete&&img.naturalWidth>0})};}
window.ART={reader,KEYS};
})();
