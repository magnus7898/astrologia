/* art.js — painting reader for the course „ხელოვნების ეზოთერული სიმბოლიკა".
   ART.reader(host, works, opts) renders tabs of works; each work is shown with numbered pins
   (x,y in % of the image) that open a symbol card. Images are public-domain files hot-linked
   from Wikimedia Commons (Special:FilePath), credited under each picture.
   Edit mode: add ?edit to the URL → pins can be dragged, a click on the picture adds a pin,
   and the JSON of the current work's pins is shown for copying back into the lesson. */
(function(){
const FP='https://commons.wikimedia.org/wiki/Special:FilePath/',CP='https://commons.wikimedia.org/wiki/File:';
const KEYS={color:['ფერი','#E0B450'],gesture:['ჟესტი','#ff8a8a'],number:['რიცხვი','#8fd19a'],lr:['მარცხენა / მარჯვენა','#7fb8ff'],light:['სინათლე','#fff2b3'],sym:['სიმბოლო','#c9a0ff']};
const EDIT=/[?&]edit\b/.test(location.search);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let css=false;
function style(){if(css)return;css=true;const s=document.createElement('style');s.textContent=`
.ar-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 12px}
.ar-tabs button{background:#0e1424;border:1px solid rgba(184,137,74,.45);color:#d8dbe2;border-radius:999px;padding:7px 14px;font:13.5px 'Noto Serif Georgian',serif;cursor:pointer}
.ar-tabs button.on{background:#C9A24C;color:#0b1020;border-color:#C9A24C}
.ar-keys{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}
.ar-keys button{background:none;border:1px solid var(--k);color:#EDE6D8;border-radius:999px;padding:4px 11px;font:12.5px 'Noto Serif Georgian',serif;cursor:pointer;opacity:.55}
.ar-keys button.on{opacity:1;background:color-mix(in srgb,var(--k) 22%,transparent)}
.ar-wrap{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:16px;align-items:start}
@media(max-width:820px){.ar-wrap{grid-template-columns:1fr}}
.ar-fig{position:relative;margin:0;border:1px solid rgba(184,137,74,.35);border-radius:10px;overflow:hidden;background:#141b2c}
.ar-stage{position:relative;transform-origin:0 0;transition:transform .45s ease}
.ar-stage img{display:block;width:100%;height:auto;min-height:120px}
.ar-pin{position:absolute;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;border:2px solid #0b1020;background:var(--k);color:#0b1020;font:700 13px Cinzel,serif;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 0 0 2px rgba(255,255,255,.55),0 2px 8px rgba(0,0,0,.6);transition:transform .2s,opacity .2s;padding:0}
.ar-pin:hover,.ar-pin.on{transform:scale(1.25)}.ar-pin.on{box-shadow:0 0 0 3px #fff,0 0 18px var(--k)}
.ar-pin.dim{opacity:.18;pointer-events:none}
.ar-zoomed .ar-pin{width:20px;height:20px;margin:-10px 0 0 -10px;font-size:10px}
.ar-cap{font-size:12px;color:#9aa3b6;padding:8px 10px;line-height:1.5;border-top:1px solid rgba(184,137,74,.25)}
.ar-cap a{color:#C9A24C}
.ar-ctl{position:absolute;right:8px;top:8px;display:flex;gap:6px;z-index:2}
.ar-ctl button{background:rgba(11,16,32,.8);border:1px solid rgba(201,162,76,.6);color:#F3DDA4;border-radius:8px;padding:4px 9px;font:12.5px 'Noto Serif Georgian',serif;cursor:pointer}
.ar-miss{position:absolute;inset:0;display:none;white-space:normal;align-items:center;justify-content:center;text-align:center;padding:20px;color:#9aa3b6;font-size:13px}
.ar-card{border:1px solid rgba(184,137,74,.35);border-left:4px solid var(--k);border-radius:10px;padding:14px 16px;background:rgba(17,26,46,.6);font-size:14px;line-height:1.8}
.ar-card .k{font:600 11px Cinzel,serif;letter-spacing:.14em;text-transform:uppercase;color:var(--k)}
.ar-card h3{font:600 17px 'Noto Serif Georgian',serif;color:#F3DDA4;margin:4px 0 6px}
.ar-card .lk{margin-top:8px;font-size:12.5px;color:#9aa3b6}
.ar-nav{display:flex;justify-content:space-between;gap:8px;margin-top:10px}
.ar-nav button{background:#0e1424;border:1px solid rgba(184,137,74,.45);color:#E3BE84;border-radius:8px;padding:6px 12px;cursor:pointer;font:13px 'Noto Serif Georgian',serif}
.ar-about{font-size:13px;color:#BCC0CA;line-height:1.75;margin-top:10px}
.ar-edit{width:100%;height:160px;margin-top:8px;background:#0e1424;color:#9fe;border:1px dashed #7fe3ff;font:11px monospace;padding:6px}
`;document.head.appendChild(s);}

function reader(host,works,opts){style();opts=opts||{};let wi=0,si=0,on=new Set(Object.keys(KEYS)),zoom=false;
  host.innerHTML=`<div class="ar-tabs"></div><div class="ar-keys"></div><div class="ar-wrap"><div><figure class="ar-fig"><div class="ar-ctl"><button type="button" data-z>🔍 დეტალი</button></div><div class="ar-stage"><img alt=""><div class="ar-miss"></div></div><figcaption class="ar-cap"></figcaption></figure>${EDIT?'<textarea class="ar-edit" readonly></textarea>':''}</div><div><div class="ar-card"></div><div class="ar-nav"><button type="button" data-p>← წინა</button><button type="button" data-n>შემდეგი →</button></div><div class="ar-about"></div></div></div>`;
  const q=s=>host.querySelector(s),stage=q('.ar-stage'),img=q('img'),miss=q('.ar-miss');
  function W(){return works[wi];}
  function vis(){return W().spots.map((s,i)=>i).filter(i=>on.has(W().spots[i].k));}
  function tabs(){q('.ar-tabs').innerHTML=works.map((w,i)=>`<button type="button" aria-pressed="${i===wi}" class="${i===wi?'on':''}" data-w="${i}">${esc(w.short||w.title)}</button>`).join('');}
  function keys(){const used=new Set(W().spots.map(s=>s.k));q('.ar-keys').innerHTML=Object.keys(KEYS).filter(k=>used.has(k)).map(k=>`<button type="button" data-k="${k}" class="${on.has(k)?'on':''}" style="--k:${KEYS[k][1]}">${KEYS[k][0]}</button>`).join('');}
  function pins(){stage.querySelectorAll('.ar-pin').forEach(p=>p.remove());W().spots.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='ar-pin'+(i===si?' on':'')+(on.has(s.k)?'':' dim');b.style.left=s.x+'%';b.style.top=s.y+'%';b.style.setProperty('--k',KEYS[s.k][1]);b.textContent=i+1;b.dataset.i=i;b.setAttribute('aria-label',`${i+1}. ${s.t}`);stage.appendChild(b);});}
  function card(){const s=W().spots[si],K=KEYS[s.k];const c=q('.ar-card');c.style.setProperty('--k',K[1]);
    c.innerHTML=`<div class="k">${si+1} / ${W().spots.length} · ${K[0]}</div><h3>${s.t}</h3><div>${s.d}</div>${s.l?`<div class="lk">${s.l}</div>`:''}`;
    stage.querySelectorAll('.ar-pin').forEach(p=>p.classList.toggle('on',+p.dataset.i===si));applyZoom();if(opts.onSpot)opts.onSpot(W(),s);}
  function applyZoom(){const s=W().spots[si];if(!zoom){stage.style.transform='';q('.ar-fig').classList.remove('ar-zoomed');return;}
    const z=2.4,f=q('.ar-fig').getBoundingClientRect(),w=f.width,h=stage.offsetHeight,tx=Math.min(0,Math.max(w-w*z,w/2-s.x/100*w*z)),ty=Math.min(0,Math.max(h-h*z,h/2-s.y/100*h*z));
    stage.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;q('.ar-fig').classList.add('ar-zoomed');}
  function edit(){if(!EDIT)return;q('.ar-edit').value=JSON.stringify(W().spots.map(s=>({x:+s.x.toFixed(1),y:+s.y.toFixed(1),t:s.t.replace(/<[^>]+>/g,'')})),null,0).replace(/},{/g,'},\n{');}
  function load(){const w=W();miss.style.display='none';img.alt=`${w.title} — ${w.author}`;
    img.style.aspectRatio=w.ar||'';img.src=FP+encodeURIComponent(w.file).replace(/%2C/g,',')+'?width='+(w.px||1600);
    q('.ar-cap').innerHTML=`<b style="color:#E3BE84">${w.title}</b> — ${w.author}, ${w.year}. ${w.place||''} · <a href="${CP+encodeURIComponent(w.file)}" target="_blank" rel="noopener">Wikimedia Commons</a> (საჯარო საკუთრება)`;
    q('.ar-about').innerHTML=w.about||'';si=Math.max(0,vis()[0]??0);tabs();keys();pins();card();edit();}
  img.addEventListener('load',()=>{img.style.aspectRatio='';});
  img.addEventListener('error',()=>{miss.style.display='flex';miss.innerHTML='სურათი ვერ ჩაიტვირთა (Wikimedia). ნიშნები მაინც მუშაობს — დააჭირე ნომრებს.';});
  host.addEventListener('click',e=>{const t=e.target.closest('button');
    if(t&&t.dataset.w!=null){wi=+t.dataset.w;zoom=false;q('[data-z]').textContent='🔍 დეტალი';load();return;}
    if(t&&t.dataset.k){const k=t.dataset.k;if(on.has(k)&&on.size>1)on.delete(k);else on.add(k);keys();pins();if(!on.has(W().spots[si].k)){si=vis()[0]??0;}card();return;}
    if(t&&t.classList.contains('ar-pin')){if(EDIT&&t.dataset.moved){delete t.dataset.moved;return;}si=+t.dataset.i;card();return;}
    if(t&&t.hasAttribute('data-z')){zoom=!zoom;t.textContent=zoom?'↩ მთლიანი':'🔍 დეტალი';applyZoom();return;}
    if(t&&(t.hasAttribute('data-n')||t.hasAttribute('data-p'))){const v=vis(),k=v.indexOf(si),d=t.hasAttribute('data-n')?1:-1;si=v[(k+d+v.length)%v.length];card();return;}
    if(EDIT&&e.target===img){const r=img.getBoundingClientRect();W().spots.push({x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100,k:'sym',t:'ახალი',d:''});si=W().spots.length-1;pins();card();edit();}});
  if(EDIT){let drag=null;stage.addEventListener('pointerdown',e=>{const p=e.target.closest('.ar-pin');if(!p)return;drag=p;p.setPointerCapture(e.pointerId);});
    stage.addEventListener('pointermove',e=>{if(!drag)return;const r=img.getBoundingClientRect(),s=W().spots[+drag.dataset.i];s.x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));s.y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));drag.style.left=s.x+'%';drag.style.top=s.y+'%';drag.dataset.moved=1;edit();});
    stage.addEventListener('pointerup',()=>{drag=null;});}
  window.addEventListener('resize',()=>{if(zoom)applyZoom();});
  load();
  return {go(w,s){wi=w;zoom=false;q('[data-z]').textContent='🔍 დეტალი';load();if(s){si=s;card();}},state:()=>({wi,si,n:W().spots.length,zoom,ok:img.complete&&img.naturalWidth>0})};}
window.ART={reader,KEYS};
})();
