/* MAGNUS · ჩაკრები ↔ ენდოკრინული ჯირკვლები (+ HD ცენტრები). საჭიროებს body_organs.js-ს (MGBODY). */
(function(){
const CH=[
 {k:'crown',n:'საჰასრარა',e:'გვირგვინის ჩაკრა',c:'#9b6bd6',y:16,loc:'თხემი, თავის ზემოთ',
  gl:'ეპიფიზი (ფიჭვისებრი ჯირკვალი)',tr:['pineal'],md:['pituitary'],
  h:'მელატონინი',fn:'სინათლე-სიბნელეს „კითხულობს“ და აწესრიგებს ძილს, სეზონურ და ცირკადულ რიტმებს.',
  th:'ერთიანობა, ცნობიერება, კავშირი უმაღლესთან, ცხოვრების აზრი.',
  why:'ეპიფიზი სინათლეზე რეაგირებს, ჩაკრა კი „განათებაზე“: ორივე ორგანიზმს ზემოთ, დიდ რიტმთან აკავშირებს.',
  alt:'ზოგ ავტორთან აქ ჰიპოფიზია, ეპიფიზი კი აჯნაშია (პუნქტირი).',hd:'თავი'},
 {k:'ajna',n:'აჯნა',e:'მესამე თვალი',c:'#5c7fd6',y:70,loc:'წარბებს შორის',
  gl:'ჰიპოფიზი',tr:['pituitary'],md:['pineal'],
  h:'ზრდის ჰორმონი, TSH, ACTH, FSH/LH, პროლაქტინი, ოქსიტოცინი',fn:'„მთავარი ჯირკვალი“: სხვა ჯირკვლებს უგზავნის ბრძანებებს — ფარისებრს, თირკმელზედას, სასქესოს.',
  th:'ხედვა, ინტუიცია, გონება, მიმართულების არჩევა.',
  why:'აჯნა სანსკრიტზე „ბრძანებაა“ — ჰიპოფიზიც მთელ ენდოკრინულ სისტემას ბრძანებს.',
  alt:'ბევრ თანამედროვე წყაროში მესამე თვალი = ეპიფიზი (პუნქტირი), ჰიპოფიზი კი გვირგვინზე გადადის.',hd:'აჯნა'},
 {k:'throat',n:'ვიშუდჰა',e:'ყელის ჩაკრა',c:'#5cb8d6',y:134,loc:'ყელი',
  gl:'ფარისებრი და ფარისებრახლო ჯირკვლები',tr:['thyroid'],md:[],
  h:'თიროქსინი (T4/T3), კალციტონინი, პარათჰორმონი',fn:'ნივთიერებათა ცვლის სიჩქარე — რამდენად სწრაფად „იწვის“ ენერგია; კალციუმის ბალანსი.',
  th:'თვითგამოხატვა, სიტყვა, კომუნიკაცია, საკუთარი ტემპი.',
  why:'ფარისებრი ორგანიზმის ტემპს აყენებს, ყელის ჩაკრა — გამოხატვის ტემპს: რასაც შიგნით ვამუშავებთ, აქ გამოდის გარეთ.',
  alt:'სქემებში თითქმის ერთხმადაა.',hd:'ყელი'},
 {k:'heart',n:'ანაჰატა',e:'გულის ჩაკრა',c:'#5cb85c',y:182,loc:'მკერდის ცენტრი',
  gl:'თიმუსი (მკერდუკანა ჯირკვალი)',tr:['thymus'],md:['heart'],
  h:'თიმოზინი, თიმოპოეტინი',fn:'T-ლიმფოციტებს „ასწავლის“, რა არის „ჩემი“ და რა „უცხო“ — იმუნიტეტის სკოლა. ბავშვობაში დიდია, ასაკთან ერთად პატარავდება.',
  th:'სიყვარული, მიღება, თანაგრძნობა, საზღვრები „მე“ და „სხვას“ შორის.',
  why:'თიმუსი „მე“-ს და „არა-მე“-ს ასხვავებს; გულის ჩაკრა იმას, ვისაც ვუშვებთ და ვისგანაც ვიცავთ თავს.',
  alt:'ზოგჯერ თავად გულს და ფილტვებსაც უკავშირებენ.',hd:'G და გული (ეგო)'},
 {k:'solar',n:'მანიპურა',e:'მზის წნულის ჩაკრა',c:'#e8c93a',y:266,loc:'ჭიპის ზემოთ',
  gl:'პანკრეასი (ლანგერჰანსის კუნძულები)',tr:['pancreas'],md:['adrenals'],
  h:'ინსულინი, გლუკაგონი',fn:'საკვებს „საწვავად“ აქცევს: სისხლში შაქრის დონეს არეგულირებს.',
  th:'ნება, პირადი ძალა, თავდაჯერება, „შიდა ცეცხლი“.',
  why:'მანიპურა ცეცხლის ჩაკრაა — პანკრეასი საკვებს ენერგიად „წვავს“.',
  alt:'ზოგ სისტემაში აქ თირკმელზედა ჯირკვლებია (პუნქტირი).',hd:'მზის წნული და ელენთა'},
 {k:'sacral',n:'სვადჰისტჰანა',e:'საკრალური ჩაკრა',c:'#ef8a27',y:366,loc:'მუცლის ქვედა ნაწილი',
  gl:'სასქესო ჯირკვლები (საკვერცხეები / სათესლეები)',tr:['genitals','uterus'],md:['adrenals'],
  h:'ესტროგენი, პროგესტერონი, ტესტოსტერონი',fn:'რეპროდუქცია, ლიბიდო, მეორადი სასქესო ნიშნები.',
  th:'სიამოვნება, სექსუალობა, შემოქმედება, ემოციების დინება.',
  why:'სასქესო ჯირკვლები ფიზიკურ სიცოცხლეს ქმნის — საკრალური ჩაკრა შემოქმედებით სიცოცხლეს.',
  alt:'ზოგიერთთან ფუძეა სასქესო, ეს კი — თირკმელზედა (პუნქტირი).',hd:'საკრალური'},
 {k:'root',n:'მულადჰარა',e:'ფუძის ჩაკრა',c:'#d64545',y:432,loc:'ხერხემლის ძირი, შორისი',
  gl:'თირკმელზედა ჯირკვლები',tr:['adrenals'],md:['genitals'],
  h:'ადრენალინი, ნორადრენალინი, კორტიზოლი',fn:'„იბრძოლე ან გაიქეცი“: საფრთხისას გული აჩქარდება, კუნთებს სისხლი მიაწვება.',
  th:'გადარჩენა, უსაფრთხოება, დამიწება, სხეულის ნდობა.',
  why:'გადარჩენის ჩაკრა = გადარჩენის ჯირკვალი: ორივე პირველი რეაგირებს საფრთხეზე.',
  alt:'ზოგ სისტემაში აქ სასქესო ჯირკვლებია (პუნქტირი).',hd:'ფუძე'}
];
const HD=[
 {k:'Head',n:'თავი',c:'#9b6bd6',x:160,y:16,sh:'tu',gl:'ეპიფიზი',tr:['pineal'],md:[],ch:'საჰასრარა',fn:'შთაგონება, კითხვები, გონებრივი წნეხი.'},
 {k:'Ajna',n:'აჯნა',c:'#5c7fd6',x:160,y:70,sh:'td',gl:'ჰიპოფიზი',tr:['pituitary'],md:[],ch:'აჯნა',fn:'კონცეპტუალიზაცია, აზრების დამუშავება.'},
 {k:'Throat',n:'ყელი',c:'#5cb8d6',x:160,y:134,sh:'sq',gl:'ფარისებრი და ფარისებრახლო',tr:['thyroid'],md:[],ch:'ვიშუდჰა',fn:'გამოვლინება: სიტყვა და ქმედება, მეტაბოლიზმი.'},
 {k:'G',n:'G (იდენტობა)',c:'#5cb85c',x:160,y:208,sh:'di',gl:'ღვიძლი, სისხლი',tr:['liver'],md:['arteries','veins'],ch:'ანაჰატა — ნაწილი',fn:'მე, სიყვარული, მიმართულება.'},
 {k:'Heart',n:'გული (ეგო)',c:'#5cb85c',x:198,y:226,sh:'tr',gl:'გული, კუჭი, ნაღვლის ბუშტი, თიმუსი',tr:['heart','stomach','gallbladder','thymus'],md:[],ch:'ანაჰატა — ნაწილი',fn:'ნება, ეგო, მატერიალური სამყარო.'},
 {k:'Spleen',n:'ელენთა',c:'#e8c93a',x:116,y:300,sh:'tr',gl:'ელენთა, ლიმფა, T-უჯრედები',tr:['spleen','lymph'],md:[],ch:'მანიპურა — ნაწილი',fn:'სხეულის ცნობიერება, ინსტინქტი, იმუნიტეტი.'},
 {k:'SP',n:'მზის წნული',c:'#e8c93a',x:204,y:300,sh:'tl',gl:'თირკმელები, პანკრეასი, ფილტვები, ნერვები',tr:['kidneys','pancreas','lungs'],md:['nerves'],ch:'მანიპურა — ნაწილი',fn:'ემოციური ტალღა, სურვილი, ვნება.'},
 {k:'Sacral',n:'საკრალური',c:'#ef8a27',x:160,y:366,sh:'sq',gl:'საკვერცხეები / სათესლეები',tr:['genitals','uterus'],md:[],ch:'სვადჰისტჰანა',fn:'სიცოცხლის ძალა, შრომა, სექსუალობა.'},
 {k:'Root',n:'ფუძე',c:'#d64545',x:160,y:432,sh:'sq',gl:'თირკმელზედა ჯირკვლები',tr:['adrenals'],md:[],ch:'მულადჰარა',fn:'სტრესი, ადრენალინი, ბიძგი მოქმედებისკენ.'}
];
const css=`.cg{margin:14px 0}.cg-tabs{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}.cg-tabs button{background:rgba(227,190,132,.08);border:1px solid rgba(227,190,132,.35);color:#E3BE84;border-radius:20px;padding:6px 16px;cursor:pointer;font:inherit}.cg-tabs button.on{background:rgba(227,190,132,.22);color:#fff3da}
.cg-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:16px;align-items:start}@media(max-width:780px){.cg-grid{grid-template-columns:1fr}}
.cg-fig{border:1px solid rgba(227,190,132,.18);border-radius:16px;overflow:hidden;background:rgba(10,14,32,.35)}
.cg-lad{display:flex;flex-direction:column;gap:5px}.cg-lad button{display:grid;grid-template-columns:14px 1fr;gap:4px 10px;align-items:center;text-align:left;background:rgba(255,255,255,.03);border:1px solid rgba(227,190,132,.16);border-radius:10px;padding:7px 10px;color:#e8e3d6;cursor:pointer;font:inherit;transition:background .2s,border-color .2s}
.cg-lad button:hover{background:rgba(255,255,255,.06)}.cg-lad button.on{border-color:var(--c);background:color-mix(in srgb,var(--c) 16%,transparent)}.cg-lad i{width:12px;height:12px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);grid-row:span 2}.cg-lad b{font-weight:600}.cg-lad small{color:#aab2c4;font-size:12.5px}
.cg-card{margin-top:12px;border:1px solid rgba(227,190,132,.22);border-radius:14px;padding:14px 16px;line-height:1.65;background:rgba(255,255,255,.025)}.cg-card h3{margin:0 0 4px;font-family:'Marcellus SC','Noto Serif Georgian',serif;font-weight:400}.cg-card .r{margin:6px 0}.cg-card .r b{color:#E3BE84}.cg-card .why{margin-top:10px;padding:9px 12px;border-left:3px solid var(--c);background:rgba(255,255,255,.03);border-radius:0 8px 8px 0}.cg-card .alt{margin-top:8px;color:#aab2c4;font-size:13px}
.cg-leg{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;font-size:12.5px;color:#aab2c4;padding:8px 10px 10px}.cg-leg span{display:flex;align-items:center;gap:6px}.cg-leg i{width:18px;height:9px;border-radius:3px;display:inline-block}
.cg .orb{cursor:pointer}.cg .orb .hl{transform-box:fill-box;transform-origin:center;animation:cgp 2.6s ease-in-out infinite;opacity:0}.cg .orb.on .hl{opacity:1}
.cg-ana{margin:10px 0;padding:10px 14px;border:1px dashed rgba(227,190,132,.35);border-radius:12px;background:rgba(227,190,132,.05);line-height:1.65}
.cg-note{margin-top:14px;line-height:1.7}.cg-note summary{cursor:pointer;color:#E3BE84;font-weight:600}.cg-note ul{margin:8px 0;padding-left:20px}
@keyframes cgp{0%,100%{transform:scale(.8);opacity:.25}50%{transform:scale(1.35);opacity:.75}}`;
function poly(sh,x,y,r){const P={tu:[[0,-1],[.95,.7],[-.95,.7]],td:[[0,1],[.95,-.7],[-.95,-.7]],sq:[[-.8,-.8],[.8,-.8],[.8,.8],[-.8,.8]],di:[[0,-1.1],[1.1,0],[0,1.1],[-1.1,0]],tr:[[1,0],[-.7,-.9],[-.7,.9]],tl:[[-1,0],[.7,-.9],[.7,.9]]}[sh];return P.map(([a,b])=>`${(x+a*r).toFixed(1)},${(y+b*r).toFixed(1)}`).join(' ');}
function mount(host,opt){opt=opt||{};if(!window.MGBODY){host.textContent='';return;}
  if(!document.getElementById('cg-css')){const st=document.createElement('style');st.id='cg-css';st.textContent=css;document.head.appendChild(st);}
  let mode=opt.start||'ch',sel=0;
  host.classList.add('cg');
  host.innerHTML=(opt.hd?`<div class="cg-tabs"><button data-m="ch">7 ჩაკრა</button><button data-m="hd">9 ცენტრი (HD)</button></div>`:'')+
   `<div class="cg-grid"><div class="cg-fig"><div class="cg-b"></div><div class="cg-leg"><span><i style="background:#e3be84aa"></i>ძირითადი შესაბამისობა</span><span><i style="border:1px dashed #e3be84"></i>ალტერნატიული ვერსია</span><span>დააჭირე ჩაკრას ან ორგანოს</span></div></div><div><div class="cg-lad"></div><div class="cg-card"></div></div></div>`;
  const fig=host.querySelector('.cg-b'),lad=host.querySelector('.cg-lad'),card=host.querySelector('.cg-card');
  MGBODY.build(fig);
  const svg=fig.querySelector('svg'),NS='http://www.w3.org/2000/svg';
  const og=document.createElementNS(NS,'g');og.setAttribute('id','cgo');svg.insertBefore(og,svg.querySelector('#blab'));
  const L=()=>mode==='ch'?CH:HD;
  function orbs(){const A=L();og.innerHTML=A.map((d,i)=>{const x=d.x||160,y=d.y;
    const shape=mode==='ch'?`<circle cx="${x}" cy="${y}" r="7" fill="${d.c}" fill-opacity=".55" stroke="${d.c}" stroke-width="1.4"/>`:`<polygon points="${poly(d.sh,x,y,8)}" fill="${d.c}" fill-opacity=".5" stroke="${d.c}" stroke-width="1.3"/>`;
    return `<g class="orb" data-i="${i}" tabindex="0" role="button" aria-label="${d.n}"><circle class="hl" cx="${x}" cy="${y}" r="14" fill="${d.c}" fill-opacity=".35"/>${shape}</g>`;}).join('');}
  function show(i){sel=i;const A=L(),d=A[i];
    og.querySelectorAll('.orb').forEach(g=>g.classList.toggle('on',+g.dataset.i===i));
    lad.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));
    MGBODY.paintSet(fig,d.tr,d.md,d.c,null);
    card.style.setProperty('--c',d.c);
    card.innerHTML=mode==='ch'?`<h3 style="color:${d.c}">${d.n} <small style="color:#aab2c4;font-size:14px">· ${d.e}</small></h3>
      <div class="r"><b>მდებარეობა:</b> ${d.loc}</div><div class="r"><b>ჯირკვალი:</b> ${d.gl}</div><div class="r"><b>ჰორმონები:</b> ${d.h}</div>
      <div class="r"><b>რას აკეთებს ჯირკვალი:</b> ${d.fn}</div><div class="r"><b>ჩაკრის თემა:</b> ${d.th}</div>
      <div class="why">🔗 ${d.why}</div><div class="alt">${d.alt} · HD ცენტრი: <b style="color:#E3BE84">${d.hd}</b></div>`
     :`<h3 style="color:${d.c}">${d.n}</h3><div class="r"><b>ბიოლოგია:</b> ${d.gl}</div><div class="r"><b>ფუნქცია:</b> ${d.fn}</div><div class="r"><b>საიდან მოდის:</b> ${d.ch}</div>
      <div class="why">${d.k==='G'||d.k==='Heart'?'🔗 ანაჰატა ორად გაიყო: G (იდენტობა, სიყვარული) და გული (ნება, ეგო) — ამიტომ ორივეს ჰქონდა „გულის“ ორგანოები.':d.k==='Spleen'||d.k==='SP'?'🔗 მანიპურა ორად გაიყო: ელენთა (სხეულის ცნობიერება, იმუნიტეტი) და მზის წნული (ემოციური ცნობიერება).':'🔗 ეს ცენტრი ერთ ჩაკრას შეესაბამება და მისივე ჯირკვალი აქვს.'}</div>`;}
  function ladder(){const A=L();lad.innerHTML=A.map((d,i)=>`<button type="button" data-i="${i}" style="--c:${d.c}"><i></i><b>${d.n}</b><small>${mode==='ch'?d.gl:d.gl}</small></button>`).join('');}
  function setMode(m){mode=m;host.querySelectorAll('.cg-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));orbs();ladder();show(m==='ch'?0:0);}
  host.addEventListener('click',e=>{const t=e.target.closest('.cg-tabs button');if(t){setMode(t.dataset.m);return;}
    const b=e.target.closest('.cg-lad button');if(b){show(+b.dataset.i);return;}
    const o=e.target.closest('.orb');if(o){show(+o.dataset.i);return;}
    const g=e.target.closest('.org');if(g){const k=g.dataset.o,A=L();let i=A.findIndex(d=>d.tr.includes(k));if(i<0)i=A.findIndex(d=>d.md.includes(k));if(i>=0)show(i);}});
  host.addEventListener('keydown',e=>{if(e.key==='Enter'){const o=e.target.closest('.orb,.org');if(o)o.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
  setMode(mode);
}
window.MGCHG={mount,CH,HD};
})();
