/* art.js — guided symbol tour of paintings for „ხელოვნების ეზოთერული სიმბოლიკა",
   built like the tarot symbol tour (course_tarot6): the picture zooms to each detail, a ring pulses
   on it and the text explains it; first step = the whole painting (overview), last = synthesis.
   ART.tour(host, works)   work = {title, short, author, year, place, file, ar, i, e, spots:[{x,y,z?,k,t,d}]}
   x,y in % of the image, z = zoom (default 2.6), k = key (color|gesture|number|lr|light|sym).
   Images: public-domain files hot-linked from Wikimedia Commons (Special:FilePath), credited.
   Edit mode (?edit in the URL): on the overview every stop is a draggable dot; a click on the
   picture adds a stop; the JSON below the picture is ready to paste back into the lesson. */
(function(){
const FP='https://commons.wikimedia.org/wiki/Special:FilePath/',CP='https://commons.wikimedia.org/wiki/File:';
const KEYS={color:['ფერი','#E0B450'],gesture:['ჟესტი','#ff8a8a'],number:['რიცხვი','#8fd19a'],lr:['მარცხენა / მარჯვენა','#7fb8ff'],light:['სინათლე','#fff2b3'],sym:['სიმბოლო','#c9a0ff']};
const EDIT=/[?&]edit\b/.test(location.search);
const src=(f,w)=>FP+encodeURIComponent(f).replace(/%2C/g,',')+'?width='+w;
let css=false;
function style(){if(css)return;css=true;const s=document.createElement('style');s.textContent=`
.at-pk{display:flex;gap:8px;overflow-x:auto;padding:6px 2px 10px;scrollbar-width:thin}
.at-pk button{flex:0 0 112px;border:1px solid rgba(184,137,74,.35);border-radius:10px;padding:4px;background:none;cursor:pointer;color:#d6cbb2;font:12px 'Noto Serif Georgian',serif;line-height:1.3;text-align:center}
.at-pk button img{width:100%;height:70px;object-fit:cover;border-radius:7px;display:block;margin-bottom:4px;background:#141b2c}
.at-pk button.on{border-color:#FFD36A;box-shadow:0 0 0 2px rgba(255,211,106,.35);color:#FFF0C8}
.at-tour{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:22px;margin-top:6px;align-items:start}
@media(max-width:820px){.at-tour{grid-template-columns:1fr}}
.at-vw{position:sticky;top:12px}@media(max-width:820px){.at-vw{position:static}}
.at-vp{position:relative;width:100%;overflow:hidden;border-radius:12px;border:1px solid rgba(184,137,74,.45);background:#0e1424}
.at-vp img{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:0 0;transition:transform 1.5s cubic-bezier(.65,.05,.25,1);will-change:transform}
.at-ring{position:absolute;width:22%;aspect-ratio:1;border:2px solid #FFD36A;border-radius:50%;transform:translate(-50%,-50%) scale(.6);opacity:0;pointer-events:none;box-shadow:0 0 18px rgba(255,211,106,.55);transition:opacity .4s}
.at-ring.on{opacity:1;animation:atp 1.8s ease-in-out infinite}
@keyframes atp{0%,100%{transform:translate(-50%,-50%) scale(.85)}50%{transform:translate(-50%,-50%) scale(1.05)}}
.at-miss{position:absolute;inset:0;display:none;align-items:center;justify-content:center;text-align:center;padding:20px;color:#9aa3b6;font-size:13px;white-space:normal}
.at-ctl{display:flex;justify-content:center;gap:10px;margin-top:10px}
.at-ctl button{background:rgba(201,162,76,.12);border:1px solid rgba(201,162,76,.55);color:#F3DDA4;border-radius:999px;padding:7px 16px;font-size:14px;cursor:pointer;font-family:inherit;min-width:56px}
.at-bar{height:3px;background:rgba(255,255,255,.08);border-radius:3px;margin-top:8px;overflow:hidden}.at-bar i{display:block;height:100%;width:0;background:#C9A24C;transition:width .4s}
.at-cap{font-size:12px;color:#9aa3b6;margin-top:8px;line-height:1.5;text-align:center}.at-cap a{color:#C9A24C}
.at-txt h2{font-family:'Marcellus SC','Noto Serif Georgian',serif;font-weight:400;font-size:24px;color:#E3BE84;margin:0}
.at-txt .st{font-size:13px;color:#B8894A;margin-top:4px;letter-spacing:.05em}
.at-txt .tx{margin-top:10px;font-size:15px;line-height:1.9;color:#eef0f4;min-height:120px;animation:atf .6s ease}
.at-txt .tx b{color:#F3DDA4}
@keyframes atf{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.at-ch{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
.at-ch button{background:none;border:1px solid rgba(184,137,74,.4);color:#d6cbb2;border-radius:999px;padding:4px 11px 4px 9px;font-size:12.5px;cursor:pointer;font-family:inherit}
.at-ch button i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;vertical-align:1px}
.at-ch button.on{background:rgba(201,162,76,.25);border-color:#FFD36A;color:#FFF0C8}.at-ch button.done{color:#F3DDA4}
.at-keys{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;font-size:12px;color:#9aa3b6}.at-keys span i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
.at-dot{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:2px solid #0b1020;color:#0b1020;font:700 11px sans-serif;display:flex;align-items:center;justify-content:center;cursor:grab;z-index:3;box-shadow:0 0 0 2px #fff}
.at-edit{width:100%;height:150px;margin-top:8px;background:#0e1424;color:#9fe;border:1px dashed #7fe3ff;font:11px monospace;padding:6px}
`;document.head.appendChild(s);}

function tour(host,works){style();let wi=0,st=0,timer=null,play=false,nat=null;
  host.innerHTML=`<div class="at-pk"></div><div class="at-tour"><div class="at-vw"><div class="at-vp"><img alt=""><div class="at-ring"></div><div class="at-miss"></div></div>
   <div class="at-ctl"><button type="button" data-a="pv" aria-label="წინა">◀</button><button type="button" data-a="pl" aria-label="დაკვრა">▶</button><button type="button" data-a="nx" aria-label="შემდეგი">▶▶</button></div>
   <div class="at-bar"><i></i></div><div class="at-cap"></div>${EDIT?'<textarea class="at-edit" readonly></textarea>':''}</div>
   <div class="at-txt"><h2></h2><div class="st"></div><div class="tx"></div><div class="at-ch"></div><div class="at-keys"></div></div></div>`;
  const q=s=>host.querySelector(s),vp=q('.at-vp'),img=q('.at-vp img'),ring=q('.at-ring'),miss=q('.at-miss');
  const W=()=>works[wi];
  const steps=()=>{const w=W(),sp=w.spots||[];return [{x:50,y:50,z:1,t:'ნახატი მთლიანად',d:w.i,o:1}].concat(sp).concat(w.e?[{x:50,y:50,z:1,t:'ყველაფერი ერთად',d:w.e,o:2}]:[]);};
  function picker(){q('.at-pk').innerHTML=works.map((w,i)=>`<button type="button" data-w="${i}" class="${i===wi?'on':''}"><img loading="lazy" src="${src(w.file,240)}" alt="">${w.short||w.title}</button>`).join('');}
  function ratio(){const w=W();vp.style.aspectRatio=nat?`${nat[0]}/${nat[1]}`:(w.ar||'1.3');}
  function view(){const s=steps()[st],z=s.z||2.6,Wd=vp.clientWidth,H=vp.clientHeight,x=s.x/100,y=s.y/100;
    let tx=Wd/2-x*Wd*z,ty=H/2-y*H*z;tx=Math.min(0,Math.max(Wd-Wd*z,tx));ty=Math.min(0,Math.max(H-H*z,ty));
    img.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;
    if(z>1.01){ring.style.left=(x*Wd*z+tx)+'px';ring.style.top=(y*H*z+ty)+'px';ring.style.borderColor=KEYS[s.k]?KEYS[s.k][1]:'#FFD36A';ring.classList.remove('on');const k=st;setTimeout(()=>{if(st===k)ring.classList.add('on');},1300);}else ring.classList.remove('on');
    dots();}
  function text(){const S=steps(),s=S[st],L=S.length,w=W(),n=(w.spots||[]).length;
    q('.at-txt h2').textContent=w.title;
    q('.st').textContent=st===0?`${w.author} · ${w.year}${n?` · ${n} სიმბოლო`:''}`:st===L-1?'შეჯამება':`${st} / ${n} · ${KEYS[s.k][0]}`;
    const tx=q('.tx');tx.innerHTML=(s.o?'':`<b>${s.t}.</b> `)+s.d;tx.style.animation='none';void tx.offsetWidth;tx.style.animation='';
    q('.at-ch').innerHTML=S.map((p,i)=>`<button type="button" data-s="${i}" class="${i===st?'on':i<st?'done':''}">${p.o?'':`<i style="background:${KEYS[p.k][1]}"></i>`}${p.o===1?'ნახატი':p.o===2?'შეჯამება':p.t}</button>`).join('');
    const used=[...new Set((w.spots||[]).map(p=>p.k))];q('.at-ch').style.display=L>1?'':'none';q('.at-ctl').style.visibility=L>1?'':'hidden';q('.at-bar').style.visibility=L>1?'':'hidden';q('.at-keys').innerHTML=used.map(k=>`<span><i style="background:${KEYS[k][1]}"></i>${KEYS[k][0]}</span>`).join('');
    q('.at-bar i').style.width=(L>1?st/(L-1)*100:0)+'%';}
  function dots(){vp.querySelectorAll('.at-dot').forEach(d=>d.remove());if(!EDIT||st!==0||!W().spots)return;W().spots.forEach((s,i)=>{const d=document.createElement('div');d.className='at-dot';d.style.left=s.x+'%';d.style.top=s.y+'%';d.style.background=KEYS[s.k][1];d.textContent=i+1;d.dataset.i=i;vp.appendChild(d);});
    q('.at-edit').value='spots x,y:\n'+W().spots.map((s,i)=>`${i+1}. {x:${s.x.toFixed(1)},y:${s.y.toFixed(1)}} ${s.t}`).join('\n');}
  function go(i){const L=steps().length;st=Math.max(0,Math.min(L-1,i));view();text();}
  function load(i){wi=i;st=0;nat=null;stop();miss.style.display='none';const w=W();ratio();img.style.transition='none';img.src=src(w.file,w.px||1600);img.alt=`${w.title} — ${w.author}`;
    q('.at-cap').innerHTML=`${w.author}, „${w.title}“, ${w.year}${w.place?' · '+w.place:''} · <a href="${CP+encodeURIComponent(w.file)}" target="_blank" rel="noopener">Wikimedia Commons</a> (საჯარო საკუთრება)`;
    view();void img.offsetWidth;img.style.transition='';text();picker();}
  function tick(){if(!play)return;const L=steps().length;if(st<L-1){go(st+1);timer=setTimeout(tick,Math.max(6500,(steps()[st].d||'').length*55));}else stop();}
  function start(){play=true;q('[data-a="pl"]').textContent='❚❚';if(st>=steps().length-1)go(0);timer=setTimeout(tick,st===0?Math.max(6000,(steps()[0].d||'').length*50):800);}
  function stop(){play=false;clearTimeout(timer);const b=q('[data-a="pl"]');if(b)b.textContent='▶';}
  img.addEventListener('load',()=>{nat=[img.naturalWidth,img.naturalHeight];ratio();view();});
  img.addEventListener('error',()=>{miss.style.display='flex';miss.textContent='სურათი ვერ ჩაიტვირთა (Wikimedia Commons). ტექსტი და ნაბიჯები მაინც მუშაობს.';});
  host.addEventListener('click',e=>{const b=e.target.closest('button');
    if(b&&b.dataset.w!=null){load(+b.dataset.w);return;}
    if(b&&b.dataset.s!=null){stop();go(+b.dataset.s);return;}
    if(b&&b.dataset.a){const a=b.dataset.a;if(a==='pl')play?stop():start();else{stop();go(st+(a==='nx'?1:-1));}return;}
    if(EDIT&&st===0&&(e.target===img||e.target===vp)){const r=vp.getBoundingClientRect();W().spots.push({x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100,k:'sym',t:'ახალი',d:''});text();dots();}});
  if(EDIT){let drag=null;vp.addEventListener('pointerdown',e=>{const d=e.target.closest('.at-dot');if(!d)return;drag=d;d.setPointerCapture(e.pointerId);});
    vp.addEventListener('pointermove',e=>{if(!drag)return;const r=vp.getBoundingClientRect(),s=W().spots[+drag.dataset.i];s.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));s.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));drag.style.left=s.x+'%';drag.style.top=s.y+'%';q('.at-edit').value='spots x,y:\n'+W().spots.map((s,i)=>`${i+1}. {x:${s.x.toFixed(1)},y:${s.y.toFixed(1)}} ${s.t}`).join('\n');});
    vp.addEventListener('pointerup',()=>{drag=null;});}
  document.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;const r=host.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;if(e.key==='ArrowRight'){stop();go(st+1);}else if(e.key==='ArrowLeft'){stop();go(st-1);}});
  window.addEventListener('resize',view);
  load(0);
  return {go(w,s){load(w);if(s)go(s);},state:()=>({wi,st,L:steps().length,ok:img.complete&&img.naturalWidth>0})};}
window.ART={tour,reader:tour,KEYS};
})();
