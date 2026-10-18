/* ============================================================
   py_people.js — პითაგორას კვადრატი · „ჩემი ადამიანები“
   ------------------------------------------------------------
   Your square + up to 10 difficult and 10 good people (the mode
   chosen on the page: კლასიკური / კორექტირებული / კრიზისული,
   computed by the page's own computeModes()).

   What repeats in each group, against EVERY date of the same years
   (exact, not sampled):
     • empty cells (no such digit) and strong cells (3+)
     • lines (ამბიცია, ფული, ნიჭი … სულიერება) — weak / strong
     • against you: they HAVE a digit you lack (they fill you),
       you both lack a digit (shared gap), you are both strong in
       one (rivalry / resonance)
   pythagoras.html needs, after pythagoras_plus.js:
       <script src="people_core.js"></script><script src="py_people.js"></script>
   ============================================================ */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const LAB={1:"პიროვნება",2:"ენერგია",3:"ინტერესი",4:"ჯანმრთელობა",5:"ლოგიკა",6:"შრომა",7:"იღბალი",8:"პასუხისმგებლობა",9:"მეხსიერება"};
const LINES=(typeof COMPOUND!=='undefined')?COMPOUND:{};
const MODE_KA={classic:'კლასიკური',corrected:'კორექტირებული',crisis:'კრიზისული'};
const mode=()=>(typeof activeMode!=='undefined'&&activeMode)||'classic';
const p2=n=>String(n).padStart(2,'0');
function square(d,m,y){return computeModes(p2(d),p2(m),String(y))[mode()].count;}

function own(c){
  const f=new Set();
  for(let n=1;n<=9;n++){if(!c[n])f.add('zero|'+n);else if(c[n]>=3)f.add('strong|'+n);}
  for(const k in LINES){const t=LINES[k].keys.reduce((s,n)=>s+(c[n]||0),0);if(t<=2)f.add('lw|'+k);else if(t>=6)f.add('ls|'+k);}
  return f;
}
function rel(M,c){
  const f=own(c);
  for(let n=1;n<=9;n++){
    if(!M[n]&&c[n])f.add('fill|'+n);
    if(!M[n]&&!c[n])f.add('gap|'+n);
    if(M[n]>=3&&c[n]>=3)f.add('both|'+n);
    if(M[n]&&!c[n])f.add('give|'+n);
  }
  return f;
}
const KIND={zero:['ცარიელი','neu'],strong:['ძლიერი 3+','neu'],lw:['სუსტი ხაზი','neu'],ls:['ძლიერი ხაზი','neu'],
  fill:['გივსებს','res'],gap:['საერთო სიცარიელე','trig'],both:['ორივე ძლიერი','mir'],give:['შენ ავსებ','neu']};
const label=k=>{const [t,v]=k.split('|');const K=KIND[t];
  const val=(t==='lw'||t==='ls')?`${LINES[v].name} <span class="pq-dim">${LINES[v].label}</span>`:`${v} · ${LAB[v]}`;
  return `<span class="pq-tag ${K[1]}">${K[0]}</span> ${val}`;};
const MEAN={fill:'მათ აქვთ ის, რაც შენ გაკლია — შენ ამ თვისებას მათში ეძებ (ან მათზე დამოკიდებული ხდები)',
  gap:'ორივეს ერთი და იგივე აკლია — ერთად ეს თემა არავინ „დაიჭირა“',
  both:'ორივე ძლიერი ხართ ერთ ციფრში — ან რეზონანსი, ან კონკურენცია',
  give:'შენ გაქვს, მათ აკლიათ — ამ თემაში შენ „ავსებ“ მათ',
  zero:'ამ ჯგუფის ადამიანებს ხშირად აკლიათ ეს ციფრი',strong:'ამ ჯგუფის ადამიანებში ეს ციფრი ხშირად ძლიერია',
  lw:'ხაზი ხშირად სუსტია',ls:'ხაზი ხშირად ძლიერია'};

async function onRun(me,people){
  if(typeof computeModes!=='function')throw new Error('pythagoras.html ფუნქციები ვერ მოიძებნა');
  const M=square(me.d,me.m,me.y);
  for(const p of people){p.c=square(p.d,p.m,p.y);p.F=rel(M,p.c);}
  /* chance level: every date of the same years */
  const ys=people.map(p=>p.y),y0=Math.max(1000,Math.min(...ys)-1),y1=Math.min(2100,Math.max(...ys)+1);
  const cnt=new Map();let N=0;
  for(let y=y0;y<=y1;y++)for(let m=1;m<=12;m++){const dim=[31,(y%4===0&&(y%100!==0||y%400===0))?29:28,31,30,31,30,31,31,30,31,30,31][m-1];
    for(let d=1;d<=dim;d++){for(const k of rel(M,square(d,m,y)))cnt.set(k,(cnt.get(k)||0)+1);N++;}}
  const base=k=>Math.max(cnt.get(k)||0,0.5)/N;
  const st=PeopleUI.groupStats(people,p=>p.F,base);
  const only=pre=>({...st,rows:st.rows.filter(r=>pre.some(x=>r.k.startsWith(x+'|')))});

  const sent=(r,w)=>{const t=r.k.split('|')[0],c=w==='bad'?r.b:r.g,n=w==='bad'?st.B.length:st.G.length,l=w==='bad'?r.bl:r.gl;
    return `<p>${label(r.k)} — <b>${c}/${n}</b>, ჩვეულებრივზე ${l.toFixed(1)}×.<br><span class="pq-note">${MEAN[t]}.</span></p>`;};
  const grid=c=>`<span style="font-family:monospace;letter-spacing:.02em">${[1,4,7,2,5,8,3,6,9].map((n,i)=>(c[n]?String(n).repeat(Math.min(c[n],4)):'—')+(i%3===2&&i<8?' | ':' ')).join('')}</span>`;
  let sum=`<p class="pq-note">რეჟიმი: <b>${MODE_KA[mode()]}</b> (გვერდზე არჩეული) · შენი კვადრატი: ${grid(M)}<br>
    შენ გაკლია: ${[1,2,3,4,5,6,7,8,9].filter(n=>!M[n]).map(n=>`${n} ${LAB[n]}`).join(', ')||'—'} · ძლიერი: ${[1,2,3,4,5,6,7,8,9].filter(n=>M[n]>=3).map(n=>`${n} ${LAB[n]}`).join(', ')||'—'}</p>`;
  for(const w of ['bad','good']){
    const n=w==='bad'?st.B.length:st.G.length;if(!n)continue;
    /* same fact twice: 'they lack 2' + 'you fill their 2' → keep the relation only */
    const all=w==='bad'?st.topBad:st.topGood,ks=new Set(all.map(r=>r.k));
    const t=all.filter(r=>{const [a,v]=r.k.split('|');return !(a==='zero'&&ks.has('give|'+v))&&!(a==='strong'&&ks.has('both|'+v));}).slice(0,6);
    sum+=`<div class="pq-gh ${w}">${w==='bad'?'✕ რთული':'✓ კარგი'} ადამიანები (${n}) — მეორდება</div>`+(t.length?t.map(r=>sent(r,w)).join(''):PeopleUI.fewNote(n));
  }
  const pcard=p=>{
    const F=[...p.F],pick=t=>F.filter(k=>k.startsWith(t+'|')).map(k=>k.split('|')[1]);
    const fill=pick('fill'),gap=pick('gap'),both=pick('both');
    return `<div class="pq-pc"><div class="hd"><span><span class="pq-dot" style="background:${p.g==='bad'?'#e06b6b':'#4ea38c'}"></span><b>${PeopleUI.esc(p.name)}</b>
      <span class="pq-dim"> ${PeopleUI.pdate(p)}</span></span><span style="font-size:12px">${grid(p.c)}</span></div>
      <div class="ln">${fill.length?`<span class="pq-tag res">გივსებს</span> ${fill.map(n=>n+' '+LAB[n]).join(', ')}<br>`:''}
      ${gap.length?`<span class="pq-tag trig">საერთო სიცარიელე</span> ${gap.map(n=>n+' '+LAB[n]).join(', ')}<br>`:''}
      ${both.length?`<span class="pq-tag mir">ორივე ძლიერი</span> ${both.map(n=>n+' '+LAB[n]).join(', ')}`:''}
      ${!fill.length&&!gap.length&&!both.length?'<span class="pq-dim">განსაკუთრებული კავშირი შენს კვადრატთან არ ჩანს</span>':''}</div></div>`;
  };
  const C=PeopleUI.card;
  return C('რას აჩვენებს',sum)+
    C('შენთან მიმართებაში',PeopleUI.groupTable(only(['fill','gap','both','give']),label,null,'')+
      `<p class="pq-note" style="margin-top:8px">„ჩვეულებრივ“ — ${y0}–${y1} წლების ყველა თარიღიდან რა წილს აქვს ეს კავშირი შენთან (${N.toLocaleString('en-US').replace(/,/g,' ')} თარიღი).</p>`)+
    C('მათი კვადრატები',PeopleUI.groupTable(only(['zero','strong','lw','ls']),label,null,''))+
    C('თითოეული ადამიანი',[...st.B,...st.G].map(pcard).join(''));
}

/* ── nav pill + panel ── */
function inject(){
  const nav=$('pp-nav'),page=document.querySelector('.page');
  if(!nav||!page||!window.PeopleUI||$('pp-people'))return !!$('pp-people');
  const pill=document.createElement('div');pill.className='mode-pill';pill.dataset.v='people';pill.textContent='ჩემი ადამიანები';nav.appendChild(pill);
  const panel=document.createElement('div');panel.className='pp-panel';panel.id='pp-people';page.appendChild(panel);
  nav.style.flexWrap='wrap';
  nav.addEventListener('click',e=>{const t=e.target.closest('.mode-pill');if(!t)return;
    const on=t.dataset.v==='people';panel.classList.toggle('on',on);pill.classList.toggle('active',on);});
  PeopleUI.mount(panel,{key:'py_people_v1',time:false,onRun,
    intro:`შეიყვანე ადამიანები, ვისთანაც გიჭირს, და ვისთანაც კარგად ხარ (თითოეულში მაქს. ${PeopleUI.MAX}).
      ჩანს, <b>რას გივსებენ</b> (ციფრი, რომელიც შენ გაკლია), <b>რა გაკლიათ ორივეს</b>, სად ხართ <b>ორივე ძლიერი</b>, და რომელი ხაზები მეორდება — ჩვეულებრივთან შედარებით.
      რეჟიმი — ის, რაც კვადრატის გვერდზეა არჩეული. სია მხოლოდ ამ ბრაუზერში ინახება.`,
    meDefault:()=>{const v=($('birth')&&$('birth').value)||'';const m=v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?{d:m[1],m:m[2],y:m[3]}:null;}});
  return true;
}
let tries=0;(function wait(){if(inject()||++tries>100)return;setTimeout(wait,100);})();
})();
