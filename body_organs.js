/* ── anatomical figure: planets ↔ organs ── */
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
/* organ id → [Georgian name, svg markup (shapes use class "o")] */
const O={
 head:['თავი','<path class="d" d="M160 18c-22 0-37 16-37 40 0 22 8 40 20 48 6 4 11 5 17 5s11-1 17-5c12-8 20-26 20-48 0-24-15-40-37-40z"/>'],
 brain:['ტვინი','<path d="M128 56c-2-22 14-36 32-36s34 14 32 36c-2 8-12 10-32 10s-30-2-32-10z"/><path class="d" d="M140 34c6 4 6 12 0 16M160 26v34M180 34c-6 4-6 12 0 16M134 50c8-2 10 4 18 2M168 52c8 2 10-4 18-2"/>'],
 pituitary:['ჰიპოფიზი','<circle cx="160" cy="68" r="3.2"/>'],
 pineal:['ეპიფიზი','<circle cx="160" cy="58" r="2.6"/>'],
 eyes:['თვალები','<ellipse cx="145" cy="76" rx="7" ry="3.6"/><ellipse cx="175" cy="76" rx="7" ry="3.6"/>'],
 ear_r:['მარჯვენა ყური','<ellipse cx="120" cy="78" rx="5" ry="11"/>'],
 ear_l:['მარცხენა ყური','<ellipse cx="200" cy="78" rx="5" ry="11"/>'],
 nose:['ცხვირი, ყნოსვა','<path d="M160 78l-5 13h10z"/>'],
 teeth:['კბილები','<rect x="151" y="96" width="18" height="4" rx="1.5"/>'],
 tongue:['ენა, მეტყველება','<ellipse cx="160" cy="103" rx="8" ry="3"/>'],
 throat:['ყელი, ხორხი','<rect x="152" y="116" width="16" height="20" rx="7"/>'],
 thyroid:['ფარისებრი ჯირკვალი','<path d="M150 138c4-6 8-6 10 0 2-6 6-6 10 0-2 6-6 7-10 4-4 3-8 2-10-4z"/>'],
 thymus:['თიმუსი','<ellipse cx="160" cy="158" rx="9" ry="11"/>'],
 lungs:['ფილტვები','<path d="M152 152c-14 2-30 20-32 54-1 20 4 30 14 30 10 0 18-6 18-20z"/><path d="M168 152c14 2 30 20 32 54 1 20-4 30-14 30-10 0-18-6-18-20z"/>'],
 breasts:['მკერდი','<circle cx="132" cy="186" r="13"/><circle cx="188" cy="186" r="13"/>'],
 heart:['გული','<path d="M168 214c-14-10-24-18-24-28 0-7 6-12 12-12 5 0 9 3 12 7 3-4 7-7 12-7 6 0 12 5 12 12 0 10-10 18-24 28z"/>'],
 ribs:['ნეკნები','<path class="d" d="M124 172q36-12 72 0M120 186q40-12 80 0M118 200q42-12 84 0M118 214q42-12 84 0M120 228q40-10 80 0M124 242q36-8 72 0"/>'],
 liver:['ღვიძლი','<path d="M114 252c10-10 40-14 66-10 6 2 6 8 0 12-10 8-30 22-48 24-14 2-24-12-18-26z"/>'],
 gallbladder:['ნაღვლის ბუშტი','<ellipse cx="150" cy="276" rx="6" ry="8"/>'],
 stomach:['კუჭი','<path d="M182 246c10-4 22 4 22 18 0 16-12 28-28 28-8 0-12-4-10-10 4-4 12-4 16-12 2-6-6-14 0-24z"/>'],
 spleen:['ელენთა','<ellipse cx="210" cy="258" rx="7" ry="15" transform="rotate(-18 210 258)"/>'],
 pancreas:['პანკრეასი','<path d="M140 292c14-4 38-6 58-2 4 2 2 6-2 6-18 2-38 2-54 2-6 0-6-5-2-6z"/>'],
 adrenals:['თირკმელზედა ჯირკვლები','<path d="M132 292l8-8 8 8z"/><path d="M172 292l8-8 8 8z"/>'],
 kidneys:['თირკმელები','<path d="M136 294c-8 0-12 10-12 18s4 18 12 18c5 0 6-6 3-10-2-4-2-12 0-16 3-4 2-10-3-10z"/><path d="M184 294c8 0 12 10 12 18s-4 18-12 18c-5 0-6-6-3-10 2-4 2-12 0-16-3-4-2-10 3-10z"/>'],
 intestines:['წვრილი ნაწლავი','<path d="M140 322c0-8 40-8 40 0s-40 8-40 16 40 8 40 0-40-6-40 6 40 10 40 2"/>'],
 colon:['მსხვილი ნაწლავი','<path fill="none" d="M130 366v-52q0-8 8-8h44q8 0 8 8v46q0 8-8 8h-24"/>'],
 fat:['ცხიმოვანი ქსოვილი','<ellipse class="ghost" cx="160" cy="336" rx="38" ry="26"/><ellipse class="ghost" cx="124" cy="380" rx="10" ry="18"/><ellipse class="ghost" cx="196" cy="380" rx="10" ry="18"/>'],
 bladder:['შარდის ბუშტი','<ellipse cx="160" cy="388" rx="12" ry="9"/>'],
 uterus:['საშვილოსნო, საკვერცხეები','<path d="M150 398h20l-4 12h-12z"/><circle cx="142" cy="400" r="3.5"/><circle cx="178" cy="400" r="3.5"/>'],
 genitals:['სასქესო ორგანოები','<ellipse cx="160" cy="420" rx="8" ry="7"/>'],
 hips:['თეძოები, ბარძაყები','<path d="M118 372q42-18 84 0l-6 30q-36-12-72 0z"/>'],
 spine:['ზურგი, ხერხემალი','<path class="d" d="M160 140v236" stroke-dasharray="3 3"/>'],
 bones:['ძვლები, ჩონჩხი','<path class="d" d="M160 128v248M104 150L85 262M216 150l19 112M85 266L62 380M235 266l23 114M138 396l2 106M182 396l-2 106M140 516l2 88M180 516l-2 88M120 146q40 8 80 0M122 372q38 20 76 0"/>'],
 muscles:['კუნთები','<ellipse cx="90" cy="212" rx="9" ry="28" transform="rotate(8 90 212)"/><ellipse cx="230" cy="212" rx="9" ry="28" transform="rotate(-8 230 212)"/><path class="d" d="M118 160q20 14 40 6M202 160q-20 14-40 6"/><ellipse cx="138" cy="452" rx="14" ry="38"/><ellipse cx="182" cy="452" rx="14" ry="38"/>'],
 arms:['ხელები, მკლავები, თითები','<ellipse cx="58" cy="400" rx="7" ry="12"/><ellipse cx="262" cy="400" rx="7" ry="12"/><path class="d" d="M90 240L66 372M230 240l24 132"/>'],
 knees:['მუხლები, სახსრები','<circle cx="140" cy="508" r="8"/><circle cx="180" cy="508" r="8"/><circle cx="85" cy="264" r="5"/><circle cx="235" cy="264" r="5"/><circle cx="138" cy="392" r="5"/><circle cx="182" cy="392" r="5"/>'],
 ankles:['კოჭები','<circle cx="142" cy="608" r="5"/><circle cx="178" cy="608" r="5"/>'],
 feet:['ტერფები','<ellipse cx="136" cy="632" rx="13" ry="6"/><ellipse cx="184" cy="632" rx="13" ry="6"/>'],
 arteries:['არტერიები, სისხლი','<path fill="none" d="M166 206v170M166 216c-30 0-56 10-66 44l-30 116M166 216c30 0 56 10 66 44l30 116M166 376l-24 30-2 200M166 376l14 30 6 200M160 136v-30"/>'],
 veins:['ვენები','<path fill="none" d="M154 206v170M154 222c-28 2-50 14-58 44l-28 112M154 222c28 2 50 14 58 44l28 112M154 376l-16 30 0 200M154 376l22 30 4 200"/>'],
 nerves:['ნერვები','<path fill="none" d="M160 96v284M160 150l-46 14-26 100-24 112M160 150l46 14 26 100 24 112M160 380l-22 30 0 200M160 380l22 30 0 200M160 240l-34 10M160 240l34 10M160 300l-28 8M160 300l28 8"/>'],
 lymph:['ლიმფა, სითხეები','<circle cx="146" cy="130" r="2.6"/><circle cx="174" cy="130" r="2.6"/><circle cx="110" cy="160" r="3"/><circle cx="210" cy="160" r="3"/><circle cx="134" cy="384" r="3"/><circle cx="186" cy="384" r="3"/><circle cx="160" cy="300" r="2.4"/><circle cx="146" cy="232" r="2.2"/><circle cx="174" cy="232" r="2.2"/>'],
 skin:['კანი','']};
const LP=[[160,14],[140,18],[126,32],[121,52],[122,74],[128,92],[138,104],[146,110],[147,124],[132,132],[110,140],[96,148],[88,162],[84,186],[80,222],[74,262],[68,300],[62,340],[58,368],[52,384],[50,400],[56,414],[64,410],[68,396],[72,374],[80,336],[88,296],[96,262],[102,226],[108,200],[112,232],[118,270],[122,300],[118,330],[114,360],[116,400],[122,448],[126,500],[124,540],[128,580],[134,610],[128,624],[118,636],[132,642],[150,640],[154,620],[152,600],[152,560],[154,510],[156,460],[158,432],[160,424]];
const PTS=LP.concat(LP.slice(1,-1).reverse().map(([x,y])=>[320-x,y]));
function smooth(P){const n=P.length;let d=`M${P[0][0]} ${P[0][1]}`;for(let i=0;i<n;i++){const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];d+=`C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;}return d+'Z';}
const SIL=`<path d="${smooth(PTS)}"/>`;
/* planet index (as in PL) → [traditional ids, modern ids] */
const PO=[[['heart','arteries','spine','eyes','brain'],['thymus','pituitary']],
 [['brain','stomach','breasts','uterus','bladder','lymph','eyes'],['pancreas']],
 [['brain','nerves','tongue','lungs','arms','ear_r','ear_l'],['thyroid']],
 [['kidneys','throat','uterus','veins','skin','nose'],['thyroid']],
 [['gallbladder','muscles','arteries','genitals','head','ear_l','nose'],['adrenals']],
 [['liver','lungs','arteries','ribs','hips','fat'],['pituitary']],
 [['spleen','bones','teeth','knees','skin','ear_r','bladder'],['pituitary']],
 [[],['nerves','ankles','arteries','pineal']],
 [[],['lymph','feet','pineal','brain']],
 [[],['genitals','colon']]];
const LABEL={brain:[230,40],head:[230,22],pituitary:[232,64],pineal:[90,52],eyes:[86,76],ear_r:[60,92],ear_l:[262,92],nose:[86,92],teeth:[230,100],tongue:[86,108],throat:[232,124],thyroid:[86,140],thymus:[232,156],lungs:[44,200],breasts:[276,182],heart:[276,212],ribs:[44,232],liver:[44,262],gallbladder:[40,284],stomach:[276,250],spleen:[280,276],pancreas:[276,298],adrenals:[40,300],kidneys:[40,318],intestines:[276,330],colon:[276,352],fat:[40,346],bladder:[276,384],uterus:[40,400],genitals:[276,420],hips:[40,380],spine:[280,140],bones:[280,470],muscles:[40,452],arms:[44,424],knees:[280,512],ankles:[280,600],feet:[40,640],arteries:[280,232],veins:[40,232],nerves:[280,172],lymph:[40,160],skin:[280,560]};
const ANCH={brain:[160,40],head:[196,40],pituitary:[160,68],pineal:[160,58],eyes:[140,76],ear_r:[120,86],ear_l:[200,86],nose:[158,86],teeth:[168,98],tongue:[154,103],throat:[168,124],thyroid:[152,138],thymus:[168,158],lungs:[124,200],breasts:[200,186],heart:[184,200],ribs:[120,228],liver:[120,262],gallbladder:[146,280],stomach:[202,256],spleen:[214,270],pancreas:[196,292],adrenals:[134,288],kidneys:[126,312],intestines:[180,330],colon:[190,350],fat:[112,346],bladder:[172,388],uterus:[144,400],genitals:[168,420],hips:[122,384],spine:[160,180],bones:[180,470],muscles:[128,452],arms:[58,410],knees:[186,508],ankles:[180,608],feet:[122,630],arteries:[236,290],veins:[84,290],nerves:[196,184],lymph:[110,160],skin:[236,560]};
const ORD=Object.keys(O);
function fit(host){const svg=host.querySelector('svg');if(!svg)return;const nar=host.clientWidth<440;svg.setAttribute('viewBox',nar?'30 0 260 660':'-120 0 560 660');svg.style.maxWidth=nar?'300px':'560px';const l=svg.querySelector('#blab');if(l)l.style.display=nar?'none':'';}
function build(host){
  let s=`<svg viewBox="-120 0 560 660" xmlns="${NS}" role="img" aria-label="ადამიანის სხეული — პლანეტები და ორგანოები" style="width:100%;max-width:560px;display:block;margin:0 auto;font-family:'Noto Sans Georgian',sans-serif">
  <defs><radialGradient id="bgB" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#2a2550" stop-opacity=".55"/><stop offset="1" stop-color="#0b1024" stop-opacity="0"/></radialGradient>
  <linearGradient id="silG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3170" stop-opacity=".55"/><stop offset=".55" stop-color="#1d2a55" stop-opacity=".5"/><stop offset="1" stop-color="#13304a" stop-opacity=".45"/></linearGradient>
  <filter id="glw" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="silBlur"><feGaussianBlur stdDeviation="6"/></filter></defs>
  <rect x="-120" width="560" height="660" fill="url(#bgB)"/>
  <g filter="url(#silBlur)" opacity=".6" fill="#6c5bd0">${SIL}</g>
  <g id="bsil" fill="url(#silG)" stroke="rgba(227,190,132,.55)" stroke-width="1.2">${SIL}</g>`;
  ORD.forEach(k=>{if(!O[k][1])return;s+=`<g class="org" data-o="${k}" tabindex="0" role="button" aria-label="${O[k][0]}">${O[k][1]}</g>`;});
  s+=`<g id="blab"></g></svg>`;
  host.innerHTML=s;fit(host);addEventListener('resize',()=>fit(host));
  const st=document.createElement('style');st.textContent=`.org{cursor:pointer;transition:opacity .25s}.org>*{fill:rgba(227,190,132,.13);stroke:rgba(227,190,132,.45);stroke-width:1;transition:fill .3s,stroke .3s}.org .d{fill:none}.org .ghost{opacity:0}.org.on .ghost{opacity:1}.org[data-o=arteries]>*,.org[data-o=veins]>*,.org[data-o=nerves]>*,.org[data-o=bones]>*{opacity:.35}.org.on[data-o=arteries]>*,.org.on[data-o=veins]>*,.org.on[data-o=nerves]>*,.org.on[data-o=bones]>*{opacity:1}.org path[fill="none"],.org .d{fill:none!important}.org:hover>*{stroke:#FFE7A0}.org.on>*{filter:url(#glw);stroke-width:1.6}.org.mod>*{stroke-dasharray:3 2}.org.on.pulse>*{animation:orgP 2.4s ease-in-out infinite}@keyframes orgP{50%{opacity:.6}}@media (prefers-reduced-motion:reduce){.org.on.pulse>*{animation:none}}`;
  document.head.appendChild(st);
}
function paint(host,pi,col,focus){const [tr,md]=PO[pi]||[[],[]];paintSet(host,tr,md,col,focus);}
function paintSet(host,tr,md,col,focus){const svg=host.querySelector('svg');if(!svg)return;const lab=svg.querySelector('#blab');let L='';
  svg.querySelectorAll('.org').forEach(g=>{const k=g.dataset.o,t=tr.includes(k),m=!t&&md.includes(k),on=t||m||k===focus;g.classList.toggle('on',on);g.classList.toggle('mod',m);g.classList.toggle('pulse',on);
    g.querySelectorAll('*').forEach(e=>{if(e.classList.contains('d')||e.getAttribute('fill')==='none'){e.style.fill='none';e.style.stroke=on?col:'';}else{e.style.fill=on?col+(m?'40':'88'):'';e.style.stroke=on?col:'';}});});
  const skinOn=tr.includes('skin')||md.includes('skin');const sil=svg.querySelector('#bsil');sil.setAttribute('stroke',skinOn?col:'rgba(227,190,132,.55)');sil.setAttribute('stroke-width',skinOn?'2.6':'1.2');
  [...new Set([...tr,...md,...(focus?[focus]:[])])].forEach(k=>{const a=ANCH[k],p=LABEL[k];if(!a||!p)return;const m=!tr.includes(k)&&md.includes(k)&&k!==focus,right=p[0]>160;
    L+=`<path d="M${a[0]} ${a[1]}L${p[0]+(right?-4:4)} ${p[1]}" stroke="${col}" stroke-width=".8" fill="none" opacity=".8"${m?' stroke-dasharray="2 2"':''}/><circle cx="${a[0]}" cy="${a[1]}" r="1.8" fill="${col}"/><text x="${p[0]}" y="${p[1]+3}" font-size="11.5" fill="${m?'#cfd5e2':'#F3E6C8'}" text-anchor="${right?'start':'end'}"${m?' font-style="italic"':''}>${O[k][0]}</text>`;});
  lab.innerHTML=L;}
window.MGBODY={fit,build,paint,paintSet,ANCH,O,PO};
})();
