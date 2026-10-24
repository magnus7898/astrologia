/* bio_lab.js — „ბიოლოგია: ნულიდან გმირამდე“ (biology.html). 20 interactive lessons: the cell, DNA and the genetic
   code, genetics, neurons, the heart, enzymes, photosynthesis, epidemics, evolution, ecology, PCR/CRISPR and
   artificial life. Built on SCIKIT + SCIPATH. */
(function(){
'use strict';
const K=window.SCIKIT;const {$,esc,clamp,lerp,TAU,fmtN,COL,anim,canvas,sl,bindSl,btns,bindBtns,FX,card,rgba,shade,S3,axes3,mplot,curve,dot,arrow,txt,drag,r3,sup}=K;
const T={};const reg=t=>T[t.id]=t;
const GR='#6fcf8a',GL='#bff0cf',GC='rgba(111,207,138,.08)';
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ═══════════════════ LEVEL 0 · სიცოცხლის საფუძვლები ═══════════════════ */
const ORG=[['nuc','ბირთვი','დნმ-ის „ბიბლიოთეკა“: აქ ინახება გენები და იწყება ტრანსკრიფცია. ბირთვაკში რიბოსომები აიწყობა.','#a585ef'],
 ['mito','მიტოქონდრია','„ელექტროსადგური“: გლუკოზისა და ჟანგბადისგან ATP-ს აწარმოებს. საკუთარი დნმ აქვს — ოდესღაც თავისუფალი ბაქტერია იყო (ენდოსიმბიოზი).','#e0a030'],
 ['er','ენდოპლაზმური ბადე','მემბრანების ლაბირინთი: უხეში (რიბოსომებით) ცილებს აწარმოებს, გლუვი — ლიპიდებს.','#5fc8d8'],
 ['golgi','გოლჯის აპარატი','„ფოსტა“: ცილებს ახარისხებს, ფუთავს ვეზიკულებში და აგზავნის დანიშნულებისამებრ.','#e07ab0'],
 ['ribo','რიბოსომები','ცილების „ქარხანა“: mRNA-ს კოდს ამინომჟავების ჯაჭვად თარგმნის.','#ecd59a'],
 ['lyso','ლიზოსომა','„სანაგვე“: ფერმენტებით შლის ძველ ორგანელებს და შემოსულ ნაწილაკებს.','#e8705a'],
 ['mem','უჯრედის მემბრანა','ორმაგი ლიპიდური შრე ცილებით: წყვეტს, რა შევიდეს და რა გავიდეს.','#6fcf8a'],
 ['chl','ქლოროპლასტი (მცენარე)','ფოტოსინთეზი: მზის სინათლე + CO₂ + H₂O → გლუკოზა + O₂.','#4ad860'],
 ['wall','უჯრედის კედელი (მცენარე)','ცელულოზის მყარი ჩარჩო — მცენარეს ფორმას აძლევს.','#8a9a40'],
 ['vac','ვაკუოლი','წყლისა და მარილების რეზერვუარი; მცენარეში უჯრედის მოცულობის 90%-მდე იკავებს.','#5a9ae8']];
reg({id:'cell',ico:'🦠',t:'უჯრედი',s:'ორგანელები · ცხოველური vs მცენარეული',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="ceC"></div><div class="hint">შეეხე ორგანელას</div></div><div class="acol"><div class="actl"><div>${btns('ceT',[['a','ცხოველური'],['p','მცენარეული'],['b','ბაქტერია']],'a')}</div></div><div id="ceI" class="ainfo"></div></div></div>
   ${card('ფაქტები',FX([['~37 ტრილიონი','უჯრედი ადამიანის სხეულში',{s:[],w:'და დაახლოებით იმდენივე ბაქტერია მიკრობიომში.'}],['10–100 μm','ტიპური ეუკარიოტული უჯრედი',{s:[['μm','მიკრომეტრი = 0.001 მმ']],w:'ბაქტერია ~10-ჯერ პატარაა (1–5 μm) და ბირთვი არ აქვს (პროკარიოტი).'}],
     ['S/V ∝ 1/r','ზედაპირი / მოცულობა',{s:[['r','რადიუსი']],w:'უჯრედი დიდი ვერ იქნება: მოცულობა r³-ით იზრდება, მემბრანა (საიდანაც საკვები შემოდის) — მხოლოდ r²-ით.'}],
     ['ATP → ADP + Pᵢ + ~30 კჯ/მოლ','ენერგიის ვალუტა',{s:[],w:'ადამიანი დღეში საკუთარი წონის ტოლ ATP-ს ხარჯავს და აღადგენს.'}]]))}`;
  const c=canvas($('ceC'),440,400),g=c.g;let type='a',sel='nuc',t=0;const blobs=[];
  const layout=()=>{blobs.length=0;const add=(k,x,y,r,extra)=>blobs.push({k,x,y,r,...extra});
    if(type==='b'){add('mem',220,200,150,{rx:180,ry:95});add('ribo',0,0,0);return;}
    add('mem',220,200,175,{rx:type==='p'?170:180,ry:type==='p'?170:150});if(type==='p'){add('wall',220,200,180);add('vac',250,215,70,{rx:85,ry:62});}
    add('nuc',type==='p'?150:200,type==='p'?150:190,46);add('mito',310,120,22,{rx:34,ry:15,a:.5});add('mito',110,270,22,{rx:32,ry:14,a:-.7});add('mito',300,300,20,{rx:30,ry:13,a:.2});
    add('er',145,205,40);add('golgi',290,210,30);add('lyso',120,110,13);add('lyso',345,255,11);add('ribo',0,0,0);if(type==='p'){add('chl',320,130,24,{rx:36,ry:18,a:-.4});add('chl',110,300,24,{rx:34,ry:17,a:.6});add('chl',330,300,22,{rx:30,ry:16,a:.1});}};
  layout();const ribos=[...Array(70)].map(()=>[rnd(0,1),rnd(0,1)]);
  c.addEventListener('click',e=>{const p=c.pt(e);let best=null,bd=1e9;for(const b of blobs){if(b.k==='mem'||b.k==='wall'||b.k==='ribo')continue;const d=Math.hypot(p[0]-b.x,p[1]-b.y)-(b.rx||b.r);if(d<bd){bd=d;best=b;}}
    if(best&&bd<14)sel=best.k;else{const m=blobs.find(b=>b.k==='mem');const d=Math.hypot((p[0]-m.x)/m.rx,(p[1]-m.y)/m.ry);sel=Math.abs(d-1)<.08?(type==='p'?'wall':'mem'):'ribo';}info();});
  bindBtns(root,'ceT',k=>{type=k;sel=k==='b'?'mem':'nuc';layout();info();});
  const col=k=>ORG.find(o=>o[0]===k)[3];
  const info=()=>{const o=ORG.find(x=>x[0]===sel);$('ceI').innerHTML=`<div class="big" style="font-size:20px;color:${o[3]}">${o[1]}</div><div class="lx">${o[2]}</div>${type==='b'?'<div class="hint">ბაქტერიას ბირთვი და მემბრანული ორგანელები არ აქვს: დნმ (ნუკლეოიდი) პირდაპირ ციტოპლაზმაშია. აქვს რიბოსომები, კედელი და შოლტი.</div>':''}`;};info();
  anim(dt=>{t+=dt;g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);
    for(const b of blobs){const on=b.k===sel,cc=col(b.k);g.save();g.translate(b.x,b.y);g.rotate(b.a||0);
      if(b.k==='wall'){g.strokeStyle=rgba(cc,on?.95:.6);g.lineWidth=on?7:5;g.strokeRect(-b.r,-b.r,b.r*2,b.r*2);}
      else if(b.k==='mem'){g.beginPath();for(let i=0;i<=80;i++){const a=i/80*TAU,w=1+.025*Math.sin(a*7+t*1.5);const x=Math.cos(a)*b.rx*w,y=Math.sin(a)*b.ry*w;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fillStyle='rgba(111,207,138,.07)';g.fill();g.strokeStyle=rgba(cc,on?1:.65);g.lineWidth=on?4:3;g.stroke();
        if(type==='b'){g.strokeStyle='rgba(191,240,207,.4)';g.lineWidth=1.5;g.beginPath();g.moveTo(b.rx,0);for(let x=0;x<70;x+=2)g.lineTo(b.rx+x,Math.sin(x*.2+t*6)*8);g.stroke();
          g.strokeStyle='rgba(165,133,239,.6)';g.beginPath();for(let i=0;i<120;i++){const a=i*.37,r=30+12*Math.sin(i*.7);g.lineTo(Math.cos(a)*r*1.4,Math.sin(a)*r*.7);}g.stroke();}}
      else if(b.k==='nuc'){g.fillStyle=rgba(cc,.22);g.beginPath();g.arc(0,0,b.r,0,TAU);g.fill();g.strokeStyle=rgba(cc,on?1:.6);g.lineWidth=on?3:2;g.stroke();g.fillStyle=rgba(cc,.55);g.beginPath();g.arc(8,-6,14,0,TAU);g.fill();
        g.strokeStyle=rgba('#d6c6ff',.35);g.lineWidth=1;g.beginPath();for(let i=0;i<60;i++){const a=i*.9+t*.2,r=8+((i*13)%30);g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.stroke();}
      else if(b.k==='mito'){g.fillStyle=rgba(cc,.3);g.beginPath();g.ellipse(0,0,b.rx,b.ry,0,0,TAU);g.fill();g.strokeStyle=rgba(cc,on?1:.7);g.lineWidth=on?2.5:1.6;g.stroke();g.beginPath();for(let x=-b.rx+6;x<b.rx-4;x+=7){g.moveTo(x,-b.ry+3);g.lineTo(x+3,b.ry-3);}g.lineWidth=1;g.stroke();}
      else if(b.k==='chl'){g.fillStyle=rgba(cc,.35);g.beginPath();g.ellipse(0,0,b.rx,b.ry,0,0,TAU);g.fill();g.strokeStyle=rgba(cc,on?1:.7);g.lineWidth=on?2.5:1.5;g.stroke();for(let x=-b.rx+10;x<b.rx-6;x+=12){g.fillStyle=rgba(cc,.7);g.fillRect(x,-6,8,12);}}
      else if(b.k==='er'){g.strokeStyle=rgba(cc,on?.95:.55);g.lineWidth=on?3:2;for(let k=0;k<4;k++){g.beginPath();for(let a=-1.2;a<=1.2;a+=.1){const r=b.r+k*8;g.lineTo(Math.cos(a+Math.PI)*r*.8+40,Math.sin(a+Math.PI)*r);}g.stroke();}}
      else if(b.k==='golgi'){g.strokeStyle=rgba(cc,on?.95:.6);g.lineWidth=on?4:3;for(let k=0;k<4;k++){g.beginPath();g.arc(0,30+k*7,30-k*2,-2.3,-.85);g.stroke();}g.fillStyle=rgba(cc,.6);dot(g,32+Math.sin(t)*6,-12,4,rgba(cc,.7));}
      else if(b.k==='lyso'){g.fillStyle=rgba(cc,.35);g.beginPath();g.arc(0,0,b.r,0,TAU);g.fill();g.strokeStyle=rgba(cc,on?1:.6);g.lineWidth=on?2.5:1.5;g.stroke();}
      else if(b.k==='vac'){g.fillStyle=rgba(cc,.16);g.beginPath();g.ellipse(0,0,b.rx,b.ry,0,0,TAU);g.fill();g.strokeStyle=rgba(cc,on?1:.5);g.lineWidth=on?2.5:1.5;g.stroke();}
      else if(b.k==='ribo'){const m=blobs.find(q=>q.k==='mem');g.restore();g.save();ribos.forEach(([u,v],i)=>{const a=u*TAU,r=Math.sqrt(v)*.85;const x=m.x+Math.cos(a)*m.rx*r+Math.sin(t+i)*1.5,y=m.y+Math.sin(a)*m.ry*r;dot(g,x,y,on?2.6:1.7,rgba('#ecd59a',on?1:.6));});}
      g.restore();g.lineWidth=1;}});
 }});

reg({id:'mol',ico:'💧',t:'სიცოცხლის მოლეკულები',s:'წყალი · ნახშირწყლები · ლიპიდები · ცილები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="moC"></div><div class="hint">გადაატრიალე</div></div><div class="acol"><div class="actl"><div>${btns('moM',[['w','წყალი (H-ბმები)'],['g','გლუკოზა'],['aa','ამინომჟავა'],['lip','ფოსფოლიპიდი'],['atp','ATP']],'w')}</div></div><div id="moI" class="ainfo"></div></div></div>
   <div class="cards3"><div><b>🍞 ნახშირწყლები</b>ენერგია (გლუკოზა, სახამებელი) და სტრუქტურა (ცელულოზა). C₆H₁₂O₆.</div><div><b>🧈 ლიპიდები</b>მემბრანები და გრძელვადიანი ენერგიის მარაგი. წყალს „ერიდება“.</div><div><b>🥩 ცილები</b>20 ამინომჟავის ჯაჭვი — ფერმენტები, კუნთები, ანტისხეულები, ჰორმონები.</div><div><b>🧬 ნუკლეინის მჟავები</b>დნმ და რნმ — ინფორმაციის შენახვა და გადაცემა.</div></div>
   ${card('ფორმულები',FX([['C₆H₁₂O₆','გლუკოზა',{s:[],w:'ტვინის მთავარი საწვავი — დღეში ~120 გ.'}],['H₂N–CHR–COOH','ამინომჟავა',{s:[['R','გვერდითი ჯაჭვი — ყველას განსხვავებული']],w:'ორი ამინომჟავა წყლის გამოყოფით პეპტიდურ ბმას ქმნის.'}],
     ['104.5°','წყლის მოლეკულის კუთხე',{s:[],w:'პოლარული მოლეკულა: O ოდნავ უარყოფითია, H — დადებითი. ამიტომ წყალბადური ბმები: მაღალი დუღილის ტემპერატურა, ზედაპირული დაჭიმულობა, ყინული ტივტივებს.'}],['ATP + H₂O → ADP + Pᵢ','ენერგიის გამოთავისუფლება',{s:[],w:'ფოსფატური ჯგუფების უარყოფითი მუხტები ერთმანეთს განიზიდავს — ბმის გაწყვეტა ენერგიას გამოყოფს.'}]]))}`;
  const c=canvas($('moC'),440,380),s=S3(c,{scale:42,spin:.35});let m='w';
  const A=(p,el,lab)=>({p,r:el==='H'?.3:.5,c:{H:'#e8e8f0',C:'#5a5a66',O:'#e84a4a',N:'#4a6ae8',P:'#e8902a'}[el],lab:lab||el});
  const build=()=>{s.atoms=[];s.bonds=[];s.lines=[];let info='';
    if(m==='w'){for(let i=0;i<7;i++){const a=i/7*TAU,R=i?2.6:0,cx=Math.cos(a)*R,cz=Math.sin(a)*R,cy=(i%3-1)*.6,rot=a+Math.PI;const o=s.atoms.length;s.atoms.push(A([cx,cy,cz],'O'));
        s.atoms.push(A([cx+Math.cos(rot+.91)*.96,cy+.3,cz+Math.sin(rot+.91)*.96],'H'),A([cx+Math.cos(rot-.91)*.96,cy-.3,cz+Math.sin(rot-.91)*.96],'H'));s.bonds.push([o,o+1],[o,o+2]);}
      for(let i=0;i<s.atoms.length;i++)for(let j=0;j<s.atoms.length;j++){const a=s.atoms[i],b=s.atoms[j];if(a.lab==='H'&&b.lab==='O'){const d=Math.hypot(a.p[0]-b.p[0],a.p[1]-b.p[1],a.p[2]-b.p[2]);if(d>1.3&&d<2.3)s.lines.push([a.p,b.p,'rgba(127,216,255,.6)',1.5,1]);}}
      info='<b>წყალბადური ბმები</b> (ცისფერი წყვეტილი) — სუსტი მიზიდულობა ერთი მოლეკულის H-სა და მეორის O-ს შორის. ყოველი მოლეკულა ≤ 4 ასეთ ბმას ქმნის. ამიტომ წყალი 100 °C-ზე დუღს და არა −80-ზე.';}
    else if(m==='g'){const ring=[[1.2,0,0],[.6,.3,1.04],[-.6,-.3,1.04],[-1.2,0,0],[-.6,.3,-1.04],[.6,-.3,-1.04]];const el=['C','C','C','C','C','O'];ring.forEach((p,i)=>s.atoms.push(A(p,el[i])));for(let i=0;i<6;i++)s.bonds.push([i,(i+1)%6]);
      [[0,[2.1,.5,0],'O'],[1,[1.1,1.3,1.9],'O'],[2,[-1.1,-1.3,1.9],'O'],[3,[-2.1,.6,0],'O'],[4,[-1.1,1.3,-1.9],'C']].forEach(([k,p,e])=>{const i=s.atoms.length;s.atoms.push(A(p,e));s.bonds.push([k,i]);const h=s.atoms.length;s.atoms.push(A([p[0]*1.3,p[1]+.6,p[2]*1.2],'H'));s.bonds.push([i,h]);});
      info='გლუკოზა (C₆H₁₂O₆) — ხუთი C და ერთი O რგოლში. ბევრი OH ჯგუფი წყალში ხსნადს ხდის. ათასობით გლუკოზა — სახამებელი ან ცელულოზა.';}
    else if(m==='aa'){const P=[[-1.6,0,0,'N'],[0,0,0,'C'],[1.5,0,0,'C'],[2.2,1,0,'O'],[2.2,-1,0,'O'],[0,1.5,0,'C']];P.forEach(p=>s.atoms.push(A(p.slice(0,3),p[3])));[[0,1],[1,2],[2,3,0,0,2],[2,4],[1,5]].forEach(b=>s.bonds.push(b));
      [[0,[-2.2,.8,.3]],[0,[-2.2,-.8,.3]],[4,[3.1,-1,0]],[1,[0,-.6,1]]].forEach(([k,p])=>{const i=s.atoms.length;s.atoms.push(A(p,'H'));s.bonds.push([k,i]);});s.atoms[5].lab='R';s.atoms[5].c='#c06ad0';
      info='ამინომჟავა: ამინოჯგუფი (N, ლურჯი) + კარბოქსილი (COOH) + <b>R</b> — გვერდითი ჯაჭვი. 20 სხვადასხვა R = 20 ამინომჟავა, ცილების ანბანი.';}
    else if(m==='lip'){const heads=[];for(let i=-2;i<=2;i++)for(let j=-1;j<=1;j++)for(const side of [1,-1]){const x=i*1.1,z=j*1.1,h=s.atoms.length;s.atoms.push({p:[x,side*2.3,z],r:.45,c:'#e8902a',lab:''});
        let prev=h;for(let k=1;k<=4;k++){const a=s.atoms.length;s.atoms.push({p:[x+(k%2)*.15,side*(2.3-k*.5),z],r:.16,c:'#c8c8a0',lab:''});s.bonds.push([prev,a,'s',.08]);prev=a;}}
      info='ფოსფოლიპიდები: „თავი“ (ნარინჯისფერი) წყალს უყვარს, „კუდები“ — ერიდება. ამიტომ თავისთავად ორმაგ შრედ ეწყობა — უჯრედის მემბრანა.';}
    else{const ad=[[-3,0,0,'N'],[-2.3,1,0,'C'],[-1.3,.6,0,'N'],[-1.5,-.7,0,'C'],[-2.6,-1,0,'C']];ad.forEach(p=>s.atoms.push(A(p.slice(0,3),p[3])));[[0,1],[1,2],[2,3],[3,4],[4,0]].forEach(b=>s.bonds.push(b));
      const r=s.atoms.length;s.atoms.push(A([0,0,0],'C'),A([.6,1,0],'O'),A([1.3,.2,0],'C'));s.bonds.push([2,r],[r,r+1],[r+1,r+2]);let prev=r+2;
      for(let k=0;k<3;k++){const o=s.atoms.length,px=2.3+k*1.6;s.atoms.push(A([px,0,0],'O'),A([px+.8,0,0],'P'),A([px+.8,1,0],'O'),A([px+.8,-1,0],'O'));s.bonds.push([prev,o],[o,o+1],[o+1,o+2,0,0,2],[o+1,o+3]);prev=o+1;}
      info='ATP: ადენინი + რიბოზა + <b>სამი ფოსფატი</b>. ბოლო ფოსფატის მოწყვეტა ~30 კჯ/მოლ ენერგიას იძლევა — ყოველი კუნთის შეკუმშვა, ყოველი ნერვული იმპულსი.';}
    $('moI').innerHTML=`<div class="lx">${info}</div>`;};
  bindBtns(root,'moM',k=>{m=k;build();});build();anim(dt=>s.draw(dt));
 }});

reg({id:'scale',ico:'🔍',t:'სიცოცხლის მასშტაბები',s:'ადამიანიდან ატომამდე — 10 რიგი',
 build(root){
  root.innerHTML=`<div id="scC"></div><div class="actl">${sl('scZ','მასშტაბი',0,100,0.1,0)}</div><div id="scI" class="ainfo"></div>
   ${card('ფორმულები',FX([['1 მ = 10⁶ μm = 10⁹ ნმ','ერთეულები',{s:[['μm','მიკრომეტრი'],['ნმ','ნანომეტრი']],w:'სინათლის მიკროსკოპი ~200 ნმ-მდე ხედავს (სინათლის ტალღის ნახევარი). ვირუსებისთვის ელექტრონული მიკროსკოპია საჭირო.'}],['d = λ / (2·NA)','აბეს გარჩევისუნარიანობა',{s:[['λ','ტალღის სიგრძე'],['NA','ობიექტივის აპერტურა']],w:'რატომ ვერ დავინახავთ ატომს ჩვეულებრივი მიკროსკოპით.'}]]))}`;
  const L=[[1.7,'ადამიანი','🧍','1.7 მ'],[1e-3,'ქვიშის მარცვალი / ტილის კვერცხი','🫘','1 მმ'],[1e-4,'კვერცხუჯრედი','⚪','100 μm'],[2e-5,'კანის უჯრედი','🦠','20 μm'],[7e-6,'ერითროციტი','🔴','7 μm'],[2e-6,'ბაქტერია E. coli','💊','2 μm'],[1e-7,'კორონავირუსი','🦠','100 ნმ'],[2e-8,'რიბოსომა','⚙','20 ნმ'],[2e-9,'დნმ-ის სიგანე','🧬','2 ნმ'],[1e-10,'წყალბადის ატომი','⚛','0.1 ნმ']];
  const c=canvas($('scC'),900,320),g=c.g;let z=0;bindSl('scZ',v=>z=v,v=>'');
  anim((dt,T)=>{const logS=Math.log10(1.7)-z/100*(Math.log10(1.7)-Math.log10(1e-10)),view=10**logS;g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);
    L.forEach(([size,nm,ic,lab])=>{const px=size/view*240;if(px<2||px>4000)return;const a=clamp(Math.min(px/12,(4000-px)/1200),0,1);g.globalAlpha=a;g.strokeStyle=GR;g.lineWidth=1.5;g.beginPath();g.arc(g.W/2,g.H/2,px/2,0,TAU);g.stroke();
      if(px>40&&px<900){txt(g,`${ic} ${nm} · ${lab}`,g.W/2,g.H/2-px/2-8,GL,'13px sans-serif');}g.globalAlpha=1;});
    g.lineWidth=1;const bar=240;g.strokeStyle=GL;g.beginPath();g.moveTo(20,g.H-20);g.lineTo(20+bar,g.H-20);g.stroke();const v=view;txt(g,v>=1e-2?r3(v*100)+' სმ':v>=1e-5?r3(v*1e6)+' μm':r3(v*1e9)+' ნმ',20+bar/2,g.H-26,GL,'11px sans-serif');
    const near=L.reduce((b,x)=>Math.abs(Math.log10(x[0]/view))<Math.abs(Math.log10(b[0]/view))?x:b);$('scI').innerHTML=`<div class="kv2"><b>ხედვის არე</b><span>~${v>=1e-2?r3(v*100)+' სმ':v>=1e-5?r3(v*1e6)+' μm':r3(v*1e9)+' ნმ'}</span><b>ახლოს</b><span>${near[2]} ${near[1]} (${near[3]})</span><b>გადიდება</b><span>×${(1.7/v).toExponential(1)}</span></div>`;});
 }});

/* ═══════════════════ LEVEL 1 · მემკვიდრეობა ═══════════════════ */
const BC={A:'#e8705a',T:'#e0a030',G:'#6fcf8a',C:'#5a9ae8',U:'#c06ad0'},PAIR={A:'T',T:'A',G:'C',C:'G'};
reg({id:'dna',ico:'🧬',t:'დნმ: ორმაგი სპირალი',s:'ფუძეთა წყვილები · რეპლიკაცია',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="dnC"></div><div class="hint">გადაატრიალე</div></div><div class="acol"><div class="actl"><label class="hint">შენი თანმიმდევრობა (A, T, G, C):</label><input class="tin2" id="dnS" value="ATGCGTACGTTAGC" maxlength="40"><div class="abt"><button id="dnR">✂ რეპლიკაცია</button><button id="dnX">🎲 შემთხვევითი</button></div></div><div id="dnI" class="ainfo"></div></div></div>
   ${card('ფორმულები და ფაქტები',FX([['A = T ,  G ≡ C','კომპლემენტარობა (ჩარგაფის წესი)',{s:[],w:'A-T ორი წყალბადური ბმით, G-C სამით. ამიტომ ერთი ძაფი მეორეს ცალსახად განსაზღვრავს.'}],['10.5 წყვილი / ხვია ; 3.4 ნმ','სპირალის გეომეტრია',{s:[],w:'B-ფორმა, მარჯვენა სპირალი, დიამეტრი 2 ნმ.'}],
     ['3.2 მილიარდი წყვილი','ადამიანის გენომი',{s:[],w:'ერთი უჯრედის დნმ გაშლილი ~2 მ-ია. სხეულის მთელი დნმ — მზემდე და უკან ~100-ჯერ.'}],['5′ → 3′','ძაფების მიმართულება',{s:[],w:'ძაფები ანტიპარალელურია; დნმ-პოლიმერაზა მხოლოდ 5′→3′ მიმართულებით აშენებს.'}],
     ['GC% = (G + C) / N','GC-შემცველობა',{s:[],w:'რაც მეტია GC, მით მყარია დნმ (მეტი წყალბადური ბმა) — თერმოფილ ბაქტერიებს მაღალი GC აქვთ.'}]]))}`;
  const c=canvas($('dnC'),440,420),s=S3(c,{scale:34,spin:.4,pitch:.15,yaw:.2});let seq='',split=0,splitT=0;
  const set=()=>{seq=($('dnS').value.toUpperCase().replace(/[^ATGC]/g,'')||'ATGC').slice(0,40);const comp=seq.split('').map(b=>PAIR[b]).join(''),gc=(seq.match(/[GC]/g)||[]).length;
    $('dnI').innerHTML=`<div class="seqbox">5′ ${seq.split('').map(b=>`<span style="color:${BC[b]}">${b}</span>`).join('')} 3′<br>3′ ${comp.split('').map(b=>`<span style="color:${BC[b]}">${b}</span>`).join('')} 5′</div><div class="kv2" style="margin-top:6px"><b>სიგრძე</b><span>${seq.length} წყვილი · ${r3(seq.length*.34)} ნმ</span><b>GC%</b><span>${r3(gc/seq.length*100)}%</span><b>წყალბადური ბმები</b><span>${gc*3+(seq.length-gc)*2}</span></div>`;};
  $('dnS').oninput=set;$('dnX').onclick=()=>{$('dnS').value=[...Array(20)].map(()=>'ATGC'[Math.floor(Math.random()*4)]).join('');set();};$('dnR').onclick=()=>{split=1;splitT=0;};set();
  anim(dt=>{if(split){splitT+=dt*.5;if(splitT>3){split=0;splitT=0;}}const n=seq.length,h=.34*3,R=1.6;s.atoms=[];s.bonds=[];s.lines=[];
    const open=split?clamp(splitT,0,1.5):0;for(let i=0;i<n;i++){const y=(i-n/2)*h*.55,a=i*TAU/10.5,b=seq[i],pb=PAIR[b];const unz=split?clamp((splitT*n*.6-i)/3,0,1):0,sep=unz*1.6;
      const p1=[R*Math.cos(a)+Math.cos(a)*sep,y,R*Math.sin(a)+Math.sin(a)*sep],p2=[R*Math.cos(a+Math.PI*.75)+Math.cos(a+Math.PI*.75)*sep,y,R*Math.sin(a+Math.PI*.75)+Math.sin(a+Math.PI*.75)*sep];
      const k=s.atoms.length;s.atoms.push({p:p1,r:.26,c:'#bfa6ff'},{p:p2,r:.26,c:'#bfa6ff'});const m1=[p1[0]*.55+p2[0]*.45,y,p1[2]*.55+p2[2]*.45],m2=[p1[0]*.45+p2[0]*.55,y,p1[2]*.45+p2[2]*.55];
      s.atoms.push({p:[lerp(p1[0],m1[0],.9-.4*unz),y,lerp(p1[2],m1[2],.9-.4*unz)],r:.2,c:BC[b],lab:''},{p:[lerp(p2[0],m2[0],.9-.4*unz),y,lerp(p2[2],m2[2],.9-.4*unz)],r:.2,c:BC[pb],lab:''});
      s.lines.push([p1,s.atoms[k+2].p,BC[b],3],[p2,s.atoms[k+3].p,BC[pb],3]);if(unz<.3)s.lines.push([s.atoms[k+2].p,s.atoms[k+3].p,'rgba(255,255,255,.35)',1,1]);
      if(i){s.bonds.push([k-4,k,'s',.1],[k-3,k+1,'s',.1]);}
      if(unz>.6){const nb=(unz-.6)/.4;[[p1,pb],[p2,b]].forEach(([p,base],q)=>{const np=[p[0]*(1-.3*nb),y,p[2]*(1-.3*nb)];s.atoms.push({p:np,r:.16,c:BC[base],alpha:nb});});}}
    s.draw(dt);});
 }});

const CODON={};(()=>{const b='UCAG',aa='FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';let i=0;for(const x of b)for(const y of b)for(const z of b)CODON[x+y+z]=aa[i++];})();
const AAN={F:'ფენილალანინი',L:'ლეიცინი',S:'სერინი',Y:'ტიროზინი',C:'ცისტეინი',W:'ტრიპტოფანი',P:'პროლინი',H:'ჰისტიდინი',Q:'გლუტამინი',R:'არგინინი',I:'იზოლეიცინი',M:'მეთიონინი (START)',T:'ტრეონინი',N:'ასპარაგინი',K:'ლიზინი',V:'ვალინი',A:'ალანინი',D:'ასპარაგინის მჟ.',E:'გლუტამინის მჟ.',G:'გლიცინი','*':'STOP'};
reg({id:'central',ico:'⚙',t:'გენეტიკური კოდი',s:'დნმ → რნმ → ცილა · რიბოსომა',
 build(root){
  root.innerHTML=`<div id="ctC"></div><div class="arow"><div class="acol"><div class="actl"><label class="hint">დნმ (კოდირებადი ძაფი):</label><input class="tin2" id="ctS" value="ATGGCCATTGTAATGGGCCGCTGAAAG" maxlength="90"><div class="abt"><button id="ctP" class="on">▶ ტრანსლაცია</button><button id="ctM">🎲 მუტაცია</button></div></div></div><div class="acol"><div id="ctI" class="ainfo"></div></div></div>
   ${card('ცენტრალური დოგმა',FX([['დნმ → რნმ → ცილა','ტრანსკრიფცია და ტრანსლაცია',{s:[],w:'ბირთვში დნმ-იდან იწერება mRNA (T → U), რიბოსომაზე ის ითარგმნება ამინომჟავების ჯაჭვად.'}],['3 ნუკლეოტიდი = 1 კოდონი','ტრიპლეტური კოდი',{s:[],w:'4³ = 64 კოდონი 20 ამინომჟავისთვის + STOP — კოდი „ზედმეტია“: ერთ ამინომჟავას რამდენიმე კოდონი შეესაბამება.'}],
     ['AUG = START (მეთიონინი) ; UAA, UAG, UGA = STOP','წაკითხვის ჩარჩო',{s:[],w:'ერთი ნუკლეოტიდის ჩამატება/წაშლა მთელ ჩარჩოს ცვლის (frameshift) — ცილა სრულიად იცვლება.'}],
     ['წერტილოვანი მუტაცია','სინონიმური / მისენს / ნონსენს',{s:[],w:'ნამგლისებრუჯრედოვანი ანემია — ერთი ასო: GAG → GTG (გლუტამინის მჟ. → ვალინი) ჰემოგლობინში.'}]]))}`;
  const c=canvas($('ctC'),900,260),g=c.g;let t0=performance.now(),dna='',mut=-1;
  const parse=()=>{dna=$('ctS').value.toUpperCase().replace(/[^ATGC]/g,'');const rna=dna.replace(/T/g,'U');const st=rna.indexOf('AUG');const prot=[];if(st>=0)for(let i=st;i+3<=rna.length;i+=3){const a=CODON[rna.slice(i,i+3)];prot.push(a);if(a==='*')break;}
    $('ctI').innerHTML=`<div class="seqbox"><span style="color:#b3a68f">mRNA:</span> ${rna.split('').map((b,i)=>`<span style="color:${BC[b]};${i===mut?'text-decoration:underline;font-weight:700':''}">${b}</span>`).join('')}</div><div class="seqbox" style="margin-top:6px"><span style="color:#b3a68f">ცილა:</span> ${prot.map(a=>`<b title="${AAN[a]}" style="color:${a==='*'?'#e8705a':a==='M'?'#6fcf8a':'#ecd59a'}">${a==='*'?'■':a}</b>`).join('-')||'START (AUG) ვერ მოიძებნა'}</div>
      <div class="hint">${prot.map(a=>AAN[a]).join(' → ')}</div>`;return {rna,st,prot};};
  $('ctS').oninput=()=>{mut=-1;parse();t0=performance.now();};$('ctP').onclick=()=>t0=performance.now();
  $('ctM').onclick=()=>{const s=$('ctS').value.toUpperCase().replace(/[^ATGC]/g,'').split('');const i=3+Math.floor(Math.random()*(s.length-3));const old=s[i];s[i]='ATGC'.replace(old,'')[Math.floor(Math.random()*3)];$('ctS').value=s.join('');mut=i;parse();t0=performance.now();};
  let P=parse();$('ctS').addEventListener('input',()=>P=parse());$('ctM').addEventListener('click',()=>P=parse());
  anim(()=>{const {rna,st,prot}=P,t=(performance.now()-t0)/1000,w=22,ox=20;g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);const shift=Math.max(0,Math.min(rna.length*w-(g.W-60),(Math.floor(t/0.9)*3+st)*w-g.W/2));
    g.save();g.translate(-shift,0);for(let i=0;i<rna.length;i++){const b=rna[i],x=ox+i*w;g.fillStyle=rgba(BC[b],.85);g.fillRect(x,170,w-3,14);txt(g,b,x+w/2-1,200,BC[b],'600 12px monospace');if(i===mut){g.strokeStyle='#fff';g.strokeRect(x-1,168,w-1,18);}}
    g.strokeStyle='rgba(191,240,207,.5)';g.beginPath();g.moveTo(ox,177);g.lineTo(ox+rna.length*w,177);g.stroke();
    if(st>=0){const k=Math.min(prot.length,Math.floor(t/0.9)+1),rx=ox+(st+(k-1)*3)*w;g.fillStyle='rgba(111,207,138,.25)';g.strokeStyle=GR;g.beginPath();g.ellipse(rx+w*1.5,150,w*2.2,26,0,0,TAU);g.fill();g.stroke();g.beginPath();g.ellipse(rx+w*1.5,192,w*2.6,20,0,0,TAU);g.fill();g.stroke();
      txt(g,'რიბოსომა',rx+w*1.5,118,GL,'11px sans-serif');
      for(let j=0;j<k;j++){const a=prot[j],px=rx+w*1.5-(k-1-j)*0+(j-(k-1))*0,py=150-(k-1-j)*0;const cx=rx+w*1.5+Math.sin(j*.8)*0-(k-1-j)*26,cy=100-(k-1-j)*0+Math.sin(j*1.3+t)*6;g.strokeStyle='rgba(236,213,154,.5)';if(j<k-1){g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+26,100+Math.sin((j+1)*1.3+t)*6);g.stroke();}
        dot(g,cx,cy,11,a==='*'?'#e8705a':a==='M'?'#6fcf8a':'#a585ef');txt(g,a==='*'?'■':a,cx,cy+4,'#fff','600 11px sans-serif');}
      if(k<=prot.length){const cod=rna.slice(st+(k-1)*3,st+k*3);txt(g,`${cod} → ${AAN[prot[k-1]]||''}`,rx+w*1.5,236,'#ecd59a','12px sans-serif');}}
    g.restore();});
 }});

reg({id:'mitosis',ico:'⧉',t:'უჯრედის დაყოფა',s:'მიტოზის ფაზები · მეიოზი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="miC"></div><div class="actl">${sl('miT','ფაზა',0,5,0.01,0)}<div class="abt"><button id="miP" class="on">▶ ავტომატურად</button></div><div>${btns('miM',[['mit','მიტოზი (2n → 2n + 2n)'],['mei','მეიოზი (2n → 4 × n)']],'mit')}</div></div></div><div class="acol"><div id="miI" class="ainfo"></div></div></div>
   ${card('ფაქტები',FX([['2n = 46','ადამიანის ქრომოსომები',{s:[['n','ჰაპლოიდური ნაკრები (23)']],w:'23 წყვილი: ერთი დედისგან, ერთი მამისგან.'}],['მიტოზი: 2n → 2 × 2n','სხეულის უჯრედები',{s:[],w:'ზრდა, ჭრილობის შეხორცება. ორი იდენტური ასლი.'}],['მეიოზი: 2n → 4 × n','სასქესო უჯრედები',{s:[],w:'ორი დაყოფა + გადაჯვარედინება (crossing-over): ყოველი კვერცხუჯრედი და სპერმატოზოიდი გენეტიკურად უნიკალურია. 2²³ ≈ 8 მილიონი კომბინაცია მხოლოდ ქრომოსომების დალაგებით.'}],
     ['G1 → S → G2 → M','უჯრედული ციკლი',{s:[['S','დნმ-ის რეპლიკაცია']],w:'კიბო — ციკლის „მუხრუჭების“ დარღვევა: უჯრედი გაჩერების გარეშე იყოფა.'}]]))}`;
  const c=canvas($('miC'),440,380),g=c.g;let ph=0,play=true,mode='mit';
  const NM={mit:['ინტერფაზა','პროფაზა','მეტაფაზა','ანაფაზა','ტელოფაზა','ციტოკინეზი'],mei:['ინტერფაზა','პროფაზა I + გადაჯვარედინება','მეტაფაზა I','ანაფაზა I','მეიოზი II','4 ჰაპლოიდური უჯრედი']};
  const D={mit:['დნმ კოპირდება (S ფაზა). ქრომატინი ჯერ არ არის შეკუმშული.','ქრომოსომები იკუმშება და ხილული ხდება — თითო ორი იდენტური ქრომატიდით. ბირთვის გარსი იშლება.','ქრომოსომები ეკვატორზე ლაგდება; თითისტარის ძაფები ორივე პოლუსიდან ებმის.','დისტერ ქრომატიდები ერთმანეთს შორდება საპირისპირო პოლუსებისკენ.','პოლუსებზე ახალი ბირთვები ყალიბდება.','ციტოპლაზმა იყოფა — ორი იდენტური უჯრედი.'],
    mei:['დნმ კოპირდება.','ჰომოლოგიური ქრომოსომები წყვილდება და ნაწილებს ცვლის (crossing-over).','წყვილები ეკვატორზე ლაგდება — დედისეული/მამისეული შემთხვევითი მხარეს.','ჰომოლოგები შორდება (ქრომატიდები ჯერ ერთადაა).','მეორე დაყოფა: ახლა ქრომატიდები შორდება.','ოთხი ჰაპლოიდური (n) უჯრედი, ყველა განსხვავებული.']};
  const ps=bindSl('miT',v=>{ph=v;play=false;$('miP').textContent='▶ ავტომატურად';},v=>NM[mode][Math.min(5,Math.floor(v))]);$('miP').onclick=e=>{play=!play;e.target.textContent=play?'⏸ პაუზა':'▶ ავტომატურად';};bindBtns(root,'miM',k=>{mode=k;ph=0;});
  const chrom=(x,y,len,ang,col,twin,sep)=>{g.save();g.translate(x,y);g.rotate(ang);g.lineCap='round';g.lineWidth=7;for(const d of twin?[-1,1]:[0]){g.strokeStyle=col;g.beginPath();g.moveTo(d*(4+sep),-len/2);g.lineTo(d*(4+sep),len/2);g.stroke();}g.lineWidth=1;dot(g,0,0,3,'#fff');g.restore();};
  anim(dt=>{if(play){ph+=dt*.35;if(ph>=5.99)ph=0;ps.value=ph;$('miT_v').textContent=NM[mode][Math.floor(ph)];}const st=Math.floor(ph),f=ph-st;g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);const cx=220,cy=190;
    const cols=['#e8705a','#5a9ae8','#e0a030','#a585ef'],pairs=[[0,1],[2,3]];
    if(mode==='mei'&&st>=4){const q=st===4?f:1;[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sy],i)=>{const x=cx+sx*95,y=cy+sy*(st===5?85:60*q+20);g.strokeStyle=GR;g.fillStyle='rgba(111,207,138,.07)';g.beginPath();g.arc(x,y,st===5?72:60,0,TAU);g.fill();g.stroke();
        [0,1].forEach(k=>chrom(x+(k-.5)*24,y,34,0,cols[(i+k)%4],st<5&&q<.5,0));});}
    else{const split=st>=5?1:0,w=split?1:0;const R=150;if(st<5){g.strokeStyle=GR;g.lineWidth=2;g.fillStyle='rgba(111,207,138,.07)';g.beginPath();g.ellipse(cx,cy,R+(st>=3?(st-3+f)*30:0),R*.85-(st>=4?f*20:0),0,0,TAU);g.fill();g.stroke();g.lineWidth=1;}
      else{[-1,1].forEach(s=>{g.strokeStyle=GR;g.lineWidth=2;g.fillStyle='rgba(111,207,138,.07)';g.beginPath();g.arc(cx+s*(95),cy,90,0,TAU);g.fill();g.stroke();g.lineWidth=1;});}
      if(st===0){g.strokeStyle='rgba(165,133,239,.6)';g.beginPath();g.arc(cx,cy,60,0,TAU);g.stroke();for(let i=0;i<4;i++){g.strokeStyle=rgba(cols[i],.5);g.beginPath();for(let k=0;k<40;k++){const a=k*.5+i,r=10+((k*7+i*13)%40);g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.stroke();}}
      else{if(st>=2&&st<=3){g.strokeStyle='rgba(191,240,207,.2)';for(let i=0;i<4;i++)for(const s of [-1,1]){g.beginPath();g.moveTo(cx+s*(140+(st-2)*20),cy);g.lineTo(cx,cy-60+i*40);g.stroke();}}
        for(let i=0;i<4;i++){const yy=cy-60+i*40;let x,ang,twin=true,sep=0;
          if(st===1){x=cx+Math.cos(i*1.7)*50;ang=i;const yy2=cy+Math.sin(i*2.1)*40;if(mode==='mei'&&f>.5){x=cx-40+Math.floor(i/2)*80+(i%2)*14;ang=0;}chrom(x,mode==='mei'&&f>.5?cy:yy2,36,ang,cols[i],true,0);continue;}
          if(st===2){x=mode==='mei'?cx+((i%2)?14:-14):cx;chrom(x,yy,36,Math.PI/2,cols[i],true,0);continue;}
          if(mode==='mit'){const d=st===3?f*110:st===4?110+f*10:120;for(const s of [-1,1])chrom(cx+s*d,yy,36,Math.PI/2,cols[i],false,0);}
          else{const s=i%2?1:-1,d=st===3?f*100:110;chrom(cx+s*(14+d),yy,36,Math.PI/2,cols[i],true,0);}}}}
    $('miI').innerHTML=`<div class="big" style="font-size:20px">${NM[mode][st]}</div><div class="lx">${D[mode][st]}</div>`;});
 }});

reg({id:'mendel',ico:'🫛',t:'მენდელის გენეტიკა',s:'პანეტის კვადრატი · დომინანტური/რეცესიული · სისხლის ჯგუფები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="meG"></div></div><div class="acol"><div class="actl"><div>${btns('meM',[['mono','მონოჰიბრიდული'],['di','დიჰიბრიდული'],['abo','სისხლის ჯგუფი AB0']],'mono')}</div><div id="meP"></div></div><div id="meI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['Aa × Aa → 1 AA : 2 Aa : 1 aa','გენოტიპის თანაფარდობა',{s:[['A','დომინანტური ალელი'],['a','რეცესიული']],w:'ფენოტიპი 3 : 1 — რეცესიული ნიშანი ყოველ მეოთხე შთამომავალში ჩნდება.'}],['AaBb × AaBb → 9 : 3 : 3 : 1','დამოუკიდებელი დათიშვა',{s:[],w:'მენდელი ბარდის 28 000 მცენარეზე დაითვალა (1865).'}],
     ['IᴬIᴮ = AB ; Iᴬi = A ; ii = 0','კოდომინანტობა',{s:[],w:'A და B ერთმანეთზე დომინირებს თანაბრად, ორივე — 0-ზე.'}],['P = ½ⁿ','ალბათობა',{s:[],w:'ყოველი შვილი დამოუკიდებელი „ცდაა“ — 3:1 ნიშნავს ალბათობას და არა გარანტიას.'}]]))}`;
  let mode='mono',P1='Aa',P2='Aa';
  const opts={mono:['AA','Aa','aa'],di:['AABB','AaBb','aabb','AaBB','Aabb'],abo:['IᴬIᴬ','Iᴬi','IᴮIᴮ','Iᴮi','IᴬIᴮ','ii']};
  const gam=gt=>{if(mode==='abo'){const m=gt.match(/Iᴬ|Iᴮ|i/g);return [...new Set(m)].length===1?[m[0]]:m;}if(mode==='mono')return [...new Set([gt[0],gt[1]])];const a=[gt[0],gt[1]],b=[gt[2],gt[3]];const out=[];for(const x of a)for(const y of b)out.push(x+y);return [...new Set(out)];};
  const phen=gt=>{if(mode==='abo'){const A=gt.includes('Iᴬ'),B=gt.includes('Iᴮ');return A&&B?'AB (IV)':A?'A (II)':B?'B (III)':'0 (I)';}if(mode==='mono')return /A/.test(gt)?'ყვითელი (დომ.)':'მწვანე (რეც.)';return (/A/.test(gt)?'ყვითელი':'მწვანე')+', '+(/B/.test(gt)?'გლუვი':'დანაოჭებული');};
  const norm=(a,b)=>{if(mode==='abo'){const o=['Iᴬ','Iᴮ','i'];return [a,b].sort((x,y)=>o.indexOf(x)-o.indexOf(y)).join('');}if(mode==='mono')return [a,b].sort().join('');return [a[0],b[0]].sort().join('')+[a[1],b[1]].sort().join('');};
  const draw=()=>{$('meP').innerHTML=`<div class="calc"><label>მშობელი 1<select id="me1">${opts[mode].map(o=>`<option ${o===P1?'selected':''}>${o}</option>`).join('')}</select></label><label>მშობელი 2<select id="me2">${opts[mode].map(o=>`<option ${o===P2?'selected':''}>${o}</option>`).join('')}</select></label></div>`;
    $('me1').onchange=e=>{P1=e.target.value;draw();};$('me2').onchange=e=>{P2=e.target.value;draw();};
    const g1=gam(P1),g2=gam(P2),cnt={},pc={};let tot=0;const cell=(a,b)=>{const gt=norm(a,b),ph=phen(gt);cnt[gt]=(cnt[gt]||0)+1;pc[ph]=(pc[ph]||0)+1;tot++;return gt;};
    const PCOL=ph=>ph.startsWith('ყვითელი')?'rgba(224,200,48,.25)':ph.startsWith('მწვანე')?'rgba(111,207,138,.25)':ph.startsWith('AB')?'rgba(165,133,239,.3)':ph.startsWith('A')?'rgba(232,112,90,.3)':ph.startsWith('B')?'rgba(90,154,232,.3)':'rgba(255,255,255,.06)';
    $('meG').innerHTML=`<table class="stq" style="text-align:center;font-family:'Cinzel',serif;font-size:15px"><tr><th></th>${g2.map(x=>`<th style="text-align:center;color:#5fc8d8">${x}</th>`).join('')}</tr>${g1.map(a=>`<tr><th style="color:#e07ab0">${a}</th>${g2.map(b=>{const gt=cell(a,b);return `<td style="background:${PCOL(phen(gt))};padding:12px 6px">${gt}</td>`;}).join('')}</tr>`).join('')}</table>`;
    $('meI').innerHTML=`<div class="kv2"><b>გამეტები</b><span>${g1.join(', ')} × ${g2.join(', ')}</span><b>გენოტიპები</b><span>${Object.entries(cnt).map(([k,v])=>`${k} ${v}/${tot}`).join(' · ')}</span><b>ფენოტიპები</b><span>${Object.entries(pc).map(([k,v])=>`<b style="color:#bff0cf">${k}</b> ${r3(v/tot*100)}%`).join('<br>')}</span></div>`;};
  bindBtns(root,'meM',k=>{mode=k;P1=k==='mono'?'Aa':k==='di'?'AaBb':'Iᴬi';P2=k==='mono'?'Aa':k==='di'?'AaBb':'Iᴮi';draw();});draw();
 }});

/* ═══════════════════ LEVEL 2 · ორგანიზმი ═══════════════════ */
reg({id:'neuro',ico:'⚡',t:'ნეირონი და ნერვული იმპულსი',s:'მოქმედების პოტენციალი · აქსონი · სინაფსი',
 build(root){
  root.innerHTML=`<div id="neC"></div><div class="arow"><div class="acol"><div class="actl">${sl('neI','სტიმულის ძალა',0,1.5,0.01,0.6)}${sl('neM','მიელინი (სიჩქარე)',0,1,0.01,0.6)}<div class="abt"><button id="neS" class="on">⚡ სტიმული</button><button id="neT">🔁 უწყვეტი</button></div></div></div><div class="acol"><div id="neX" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['V_rest ≈ −70 მვ','მოსვენების პოტენციალი',{s:[],w:'Na⁺/K⁺ ტუმბო გარეთ 3 Na⁺-ს გზავნის, შიგნით 2 K⁺-ს — შიგნით უარყოფითი მუხტი რჩება.'}],
     ['„ყველაფერი ან არაფერი“','ზღურბლი ≈ −55 მვ',{s:[],w:'სუსტი სტიმული (ზღურბლის ქვემოთ) იმპულსს არ იძლევა; ძლიერი — ზუსტად იმავე სიმაღლის იმპულსს, უბრალოდ უფრო ხშირად.'}],
     ['E = (RT/zF)·ln([X]ₒᵤₜ/[X]ᵢₙ)','ნერნსტის განტოლება',{s:[['z','იონის მუხტი'],['F','ფარადეის მუდმივა']],w:'K⁺-ისთვის ≈ −90 მვ, Na⁺-ისთვის ≈ +60 მვ — იმპულსი ამ ორ ზღვარს შორის მოძრაობს.'}],
     ['v: 1 → 120 მ/წმ','გამტარობის სიჩქარე',{s:[],w:'მიელინის გარსი იმპულსს რანვიეს კვანძიდან კვანძამდე „ახტუნებს“ (სალტატორული გამტარობა). გაფანტული სკლეროზი — მიელინის დაზიანება.'}],
     ['dv/dt = v − v³/3 − w + I','ფიცჰიუ–ნაგუმოს მოდელი',{s:[['v','პოტენციალი'],['w','აღდგენის ცვლადი'],['I','სტიმული']],w:'ჰოჯკინ–ჰაქსლის (ნობელი 1963) გამარტივებული ვერსია — ზემოთ გრაფიკი ამით ითვლება.'}]]))}`;
  const c=canvas($('neC'),900,380),g=c.g;let I0=.6,my=.6,pulse=0,tonic=false;let v=-1.2,w=-.62;const trace=[];const spikes=[];
  bindSl('neI',x=>I0=x,x=>x.toFixed(2));bindSl('neM',x=>my=x,x=>x.toFixed(2));$('neS').onclick=()=>pulse=.25;$('neT').onclick=e=>{tonic=!tonic;e.target.classList.toggle('on',tonic);};
  let lastSpike=false,acc=0;
  anim(dt=>{acc+=dt;const steps=Math.round(dt*400);for(let k=0;k<steps;k++){const I=(pulse>0||tonic)?I0:0;const h=.025;const dv=v-v*v*v/3-w+I,dw=.08*(v+.7-.8*w);v+=h*dv;w+=h*dw;if(pulse>0)pulse-=1/400;
      if(k%4===0){trace.push(v);if(trace.length>420)trace.shift();}if(v>1&&!lastSpike){lastSpike=true;spikes.push(0);}if(v<0)lastSpike=false;}
    const sp=60+my*540;for(let i=0;i<spikes.length;i++)spikes[i]+=dt*sp;while(spikes.length&&spikes[0]>900)spikes.shift();
    g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);
    /* neuron drawing */
    const ay=95;g.fillStyle='rgba(165,133,239,.3)';g.strokeStyle='#a585ef';g.beginPath();g.arc(70,ay,30,0,TAU);g.fill();g.stroke();for(let i=0;i<6;i++){const a=i*1.05+2;g.beginPath();g.moveTo(70+Math.cos(a)*30,ay+Math.sin(a)*30);g.quadraticCurveTo(70+Math.cos(a)*55,ay+Math.sin(a)*40,70+Math.cos(a+.3)*70,ay+Math.sin(a+.3)*62);g.stroke();}
    g.strokeStyle='rgba(214,198,255,.6)';g.lineWidth=4;g.beginPath();g.moveTo(100,ay);g.lineTo(820,ay);g.stroke();g.lineWidth=1;
    if(my>.05){for(let x=130;x<800;x+=60){g.fillStyle=`rgba(236,213,154,${.25+my*.5})`;g.beginPath();g.ellipse(x+25,ay,24,7+my*4,0,0,TAU);g.fill();}}
    for(const s of spikes){const x=100+s;if(x<820){g.shadowColor='#ecd59a';g.shadowBlur=18;dot(g,x,ay,7,'#fff6c8');g.shadowBlur=0;g.fillStyle='rgba(232,112,90,.6)';txt(g,'Na⁺',x,ay-14,'#e8705a','10px sans-serif');}}
    g.strokeStyle='#6fcf8a';g.beginPath();for(let i=0;i<4;i++){g.moveTo(820,ay);g.lineTo(850,ay-30+i*20);}g.stroke();txt(g,'სინაფსი →',860,ay+4,GL,'10px sans-serif','left');
    for(const s of spikes){const x=100+s;if(x>=820&&x<900)for(let k=0;k<6;k++)dot(g,850+(x-820)*.4+k*3,ay-25+k*10,2,'#ecd59a');}
    /* membrane potential trace */
    const M={X:i=>20+i*(g.W-40)/420,Y:val=>340-((val+2.2)/4.4)*170};g.strokeStyle='rgba(255,255,255,.08)';[-70,-55,0,30].forEach(mv=>{const val=(mv+70)/100*3-1.2;g.beginPath();g.moveTo(20,M.Y(val));g.lineTo(g.W-20,M.Y(val));g.stroke();txt(g,mv+' მვ',g.W-22,M.Y(val)-3,COL.dim,'10px sans-serif','right');});
    g.strokeStyle='#ecd59a';g.lineWidth=2;g.beginPath();trace.forEach((val,i)=>i?g.lineTo(M.X(i),M.Y(val)):g.moveTo(M.X(i),M.Y(val)));g.stroke();g.lineWidth=1;
    const mv=Math.round((v+1.2)/3*100-70);$('neX').innerHTML=`<div class="kv2"><b>პოტენციალი</b><span>${mv} მვ</span><b>სიჩქარე</b><span>~${Math.round(1+my*119)} მ/წმ</span><b>იმპულსები</b><span>${spikes.length} გზაში</span></div><div class="hint">${I0<.34?'სტიმული ზღურბლზე სუსტია — იმპულსი არ წარმოიქმნება.':'„უწყვეტი“ რეჟიმში გაზარდე ძალა — იმპულსები ხშირდება, სიმაღლე კი იგივე რჩება.'}</div>`;});
 }});

reg({id:'heart',ico:'❤',t:'გული და სისხლის მიმოქცევა',s:'ეკგ · პულსი · ორი წრე',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="heC"></div></div><div class="acol"><div class="actl">${sl('heR','პულსი',40,180,1,72,'დ/წთ')}${sl('heV','დარტყმითი მოცულობა',40,120,1,70,'მლ')}</div><div id="heI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['CO = HR × SV','წუთმოცულობა',{s:[['HR','პულსი'],['SV','დარტყმითი მოცულობა']],w:'მოსვენებისას ~5 ლ/წთ — თითქმის მთელი სისხლი წუთში ერთხელ ბრუნავს. სპორტსმენის გული 25–35 ლ/წთ-საც აძლევს.'}],
     ['P-QRS-T','ეკგ-ის კბილები',{s:[['P','წინაგულების აგზნება'],['QRS','პარკუჭების აგზნება'],['T','პარკუჭების აღდგენა']],w:'გულის ელექტრული აქტივობა კანზე ~1 მვ-იან სიგნალს იძლევა.'}],
     ['MAP ≈ DBP + (SBP − DBP)/3','საშუალო არტერიული წნევა',{s:[],w:'120/80 → ~93 მმ ვწყ. სვ.'}],['HRmax ≈ 220 − ასაკი','მაქსიმალური პულსი',{s:[],w:'უხეში შეფასებაა; ინდივიდუალური სხვაობა ±10–15 დ/წთ.'}],['~100 000 დარტყმა / დღე','ცხოვრებაში ~3 მილიარდი',{s:[],w:'და ~200 მილიონი ლიტრი სისხლი.'}]]))}`;
  const c=canvas($('heC'),440,420),g=c.g;let hr=72,sv=70,ph=0;const ecg=[];bindSl('heR',v=>hr=v);bindSl('heV',v=>sv=v);
  const E=p=>{const gs=(m,s,a)=>a*Math.exp(-((p-m)**2)/(2*s*s));return gs(.12,.025,.15)-gs(.235,.008,.1)+gs(.25,.012,1)-gs(.27,.01,.25)+gs(.48,.045,.3);};
  const parts=[];for(let i=0;i<60;i++)parts.push({u:Math.random(),loop:i%2});
  anim(dt=>{ph=(ph+dt*hr/60)%1;ecg.push(E(ph));if(ecg.length>400)ecg.shift();g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);
    const beat=Math.exp(-((ph-.27)**2)/.004),sc=1-beat*.08,cx=220,cy=140;
    /* circulation loops */
    const loop=(k,u)=>k?[cx+Math.cos(u*TAU)*170,cy+30+Math.sin(u*TAU)*40-60]:[cx+Math.cos(u*TAU)*150,cy+55+Math.sin(u*TAU)*70];
    g.strokeStyle='rgba(90,154,232,.3)';g.lineWidth=10;g.beginPath();g.ellipse(cx,cy-30,170,40,0,0,TAU);g.stroke();g.strokeStyle='rgba(232,112,90,.25)';g.beginPath();g.ellipse(cx,cy+55,150,70,0,0,TAU);g.stroke();g.lineWidth=1;
    txt(g,'ფილტვები (მცირე წრე)',cx,cy-78,'#9fc6ff','11px sans-serif');txt(g,'სხეული (დიდი წრე)',cx,cy+142,'#f0a090','11px sans-serif');
    for(const p of parts){p.u=(p.u+dt*hr/60*.12*(1+beat*2))%1;const [x,y]=loop(p.loop,p.u);const oxy=p.loop?(p.u<.5?0:1):(p.u<.5?1:0);dot(g,x,y,3,oxy?'#e8705a':'#5a9ae8');}
    g.save();g.translate(cx,cy+10);g.scale(sc,sc);const gr=g.createRadialGradient(-10,-10,5,0,0,60);gr.addColorStop(0,'#ff8a7a');gr.addColorStop(1,'#8a1a2a');g.fillStyle=gr;g.beginPath();g.moveTo(0,40);g.bezierCurveTo(-70,0,-45,-55,0,-25);g.bezierCurveTo(45,-55,70,0,0,40);g.fill();g.restore();
    g.strokeStyle='rgba(111,207,138,.15)';for(let x=0;x<g.W;x+=20){g.beginPath();g.moveTo(x,300);g.lineTo(x,410);g.stroke();}
    g.strokeStyle='#6fcf8a';g.lineWidth=2;g.beginPath();ecg.forEach((v,i)=>{const x=i*g.W/400,y=380-v*70;i?g.lineTo(x,y):g.moveTo(x,y);});g.stroke();g.lineWidth=1;
    const co=hr*sv/1000;$('heI').innerHTML=`<div class="big">${co.toFixed(1)} ლ/წთ</div><div class="kv2"><b>წუთმოცულობა</b><span>${hr} × ${sv} მლ</span><b>ციკლი</b><span>${(60/hr).toFixed(2)} წმ</span><b>დღეში</b><span>${(hr*1440).toLocaleString('en')} დარტყმა · ${Math.round(co*1440).toLocaleString('en')} ლ</span></div><div class="hint">${hr<60?'ბრადიკარდია (სპორტსმენებთან ნორმაა)':hr>100?'ტაქიკარდია — ვარჯიში, სტრესი ან სიცხე':'ნორმა მოსვენებისას: 60–100'}. წითელი — ჟანგბადით მდიდარი სისხლი, ლურჯი — ღარიბი.</div>`;});
 }});

reg({id:'enzyme',ico:'🔑',t:'ფერმენტები',s:'კლიტე და გასაღები · მიქაელის–მენტენი · ინჰიბიტორები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="enA"></div></div><div class="acol"><div id="enB"></div><div class="actl">${sl('enV','Vmax',0.5,2,0.05,1)}${sl('enK','Km',0.1,3,0.05,0.8)}${sl('enT','ტემპერატურა',0,80,1,37,'°C')}<div>${btns('enI',[['0','ინჰიბიტორი არაა'],['c','კონკურენტული'],['n','არაკონკურენტული']],'0')}</div></div><div id="enX" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['v = Vmax·[S] / (Km + [S])','მიქაელის–მენტენის განტოლება',{s:[['[S]','სუბსტრატის კონცენტრაცია'],['Km','[S], როცა v = Vmax/2']],w:'ცოტა სუბსტრატზე სიჩქარე წრფივად იზრდება, ბევრზე — ფერმენტები „გადატვირთულია“ და v → Vmax.'}],
     ['კონკურენტული: Km ↑, Vmax იგივე','ინჰიბიტორი აქტიურ ცენტრს იკავებს',{s:[],w:'სუბსტრატის მომატებით შეიძლება „გადაჯობნა“. ბევრი წამალი ასე მუშაობს (მაგ. სტატინები).'}],['არაკონკურენტული: Vmax ↓','ინჰიბიტორი სხვა ადგილას ჯდება',{s:[],w:'ფერმენტის ფორმა იცვლება — სუბსტრატის მომატება არ შველის.'}],
     ['10⁶–10¹⁷×','აჩქარება',{s:[],w:'ფერმენტი აქტივაციის ენერგიას ამცირებს. ოროტიდინ-დეკარბოქსილაზა რეაქციას 10¹⁷-ჯერ აჩქარებს: 78 მლნ წელი → 18 მილიწამი.'}],['ოპტიმუმი ≈ 37 °C, pH ≈ 7','დენატურაცია',{s:[],w:'მაღალ ტემპერატურაზე ცილა იშლება — ამიტომაა 42 °C-იანი სიცხე სახიფათო.'}]]))}`;
  const c=canvas($('enA'),420,380),g=c.g,c2=canvas($('enB'),420,240),h=c2.g;let Vm=1,Km=.8,Tc=37,inh='0';const subs=[];for(let i=0;i<14;i++)subs.push({x:rnd(20,400),y:rnd(20,360),vx:rnd(-40,40),vy:rnd(-40,40),st:0,t:0});let made=0;
  const act=()=>{const tf=Tc<=40?Math.pow(2,(Tc-37)/10):Math.max(0,Math.pow(2,.3)*(1-(Tc-40)/20));return tf;};
  const draw2=()=>{const VmE=Vm*(inh==='n'?.5:1)*act(),KmE=Km*(inh==='c'?2.5:1);const M=mplot(h,{x:[0,10],y:[0,2.2],step:1,stepY:.5,m:[10,10,20,30],gc:GC});
    curve(h,M,s=>Vm*s/(Km+s),0,10,'rgba(255,255,255,.3)',1.5,[4,4]);curve(h,M,s=>VmE*s/(KmE+s),0,10,GR,2.6);h.strokeStyle='rgba(236,213,154,.6)';h.setLineDash([3,3]);h.beginPath();h.moveTo(M.X(0),M.Y(VmE));h.lineTo(M.X(10),M.Y(VmE));h.moveTo(M.X(KmE),M.Y(0));h.lineTo(M.X(KmE),M.Y(VmE/2));h.lineTo(M.X(0),M.Y(VmE/2));h.stroke();h.setLineDash([]);
    txt(h,'[S]',M.X(9.6),M.Y(0)-5,COL.mid,'10px sans-serif');txt(h,'v',M.X(0)+10,M.Y(2.1),COL.mid,'10px sans-serif');
    $('enX').innerHTML=`<div class="kv2"><b>ეფექტური Vmax</b><span>${r3(VmE)}</span><b>ეფექტური Km</b><span>${r3(KmE)}</span><b>აქტიურობა</b><span>${r3(act()*100)}% ${Tc>45?'— <span class="bad">დენატურაცია!</span>':''}</span><b>პროდუქტი</b><span>${made}</span></div>`;};
  bindSl('enV',v=>{Vm=v;draw2();});bindSl('enK',v=>{Km=v;draw2();});bindSl('enT',v=>{Tc=v;draw2();});bindBtns(root,'enI',k=>{inh=k;draw2();});
  const enz={x:210,y:200};
  anim((dt,T)=>{g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);const den=clamp((Tc-45)/20,0,1),wob=Math.sin(T*3)*(2+den*12);
    g.save();g.translate(enz.x,enz.y);g.fillStyle=`rgba(165,133,239,${.55-den*.3})`;g.strokeStyle='#a585ef';g.beginPath();g.moveTo(-70,-40);g.quadraticCurveTo(-90+wob,40,0,60);g.quadraticCurveTo(90-wob,40,70,-40);g.lineTo(22+den*20,-40);g.lineTo(22+den*10,-10);g.lineTo(-22-den*10,-10);g.lineTo(-22-den*20,-40);g.closePath();g.fill();g.stroke();
    txt(g,'ფერმენტი',0,30,'#fff','12px sans-serif');if(inh==='n'){g.fillStyle='#e8705a';g.fillRect(55,20,20,20);}if(inh==='c'){g.fillStyle='#e8705a';g.beginPath();g.moveTo(-18,-38);g.lineTo(18,-38);g.lineTo(18,-12);g.lineTo(-18,-12);g.fill();}g.restore();
    const speed=.6+act();for(const s of subs){if(s.st===0){s.x+=s.vx*dt*speed;s.y+=s.vy*dt*speed;if(s.x<10||s.x>410)s.vx*=-1;if(s.y<10||s.y>370)s.vy*=-1;
        if(inh!=='c'&&den<.7&&Math.hypot(s.x-enz.x,s.y-(enz.y-26))<20&&!subs.some(q=>q.st===1)){s.st=1;s.t=0;}g.fillStyle='#e0a030';g.fillRect(s.x-15,s.y-11,30,22);}
      else if(s.st===1){s.t+=dt*act()*(inh==='n'?.5:1);s.x=enz.x;s.y=enz.y-26;g.fillStyle='#ecd59a';g.fillRect(s.x-15,s.y-12,30,24);if(s.t>.8){s.st=2;s.t=0;made++;draw2();}}
      else{s.t+=dt;const off=s.t*60;g.fillStyle='#6fcf8a';g.beginPath();g.arc(s.x-off,s.y-off*.8,9,0,TAU);g.arc(s.x+off,s.y-off*.8,9,0,TAU);g.fill();if(s.t>1.6){Object.assign(s,{x:rnd(20,400),y:rnd(250,370),vx:rnd(-40,40),vy:rnd(-40,40),st:0,t:0});}}}
    txt(g,'ნარინჯისფერი — სუბსტრატი · მწვანე — პროდუქტები'+(inh!=='0'?' · წითელი — ინჰიბიტორი':''),210,372,COL.mid,'10px sans-serif');});
  draw2();
 }});

reg({id:'photo',ico:'🌿',t:'ფოტოსინთეზი და სუნთქვა',s:'სინათლე → შაქარი → ATP',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="phC"></div></div><div class="acol"><div class="actl">${sl('phL','სინათლის ინტენსივობა',0,100,1,60,'%')}${sl('phC2','CO₂',0,100,1,50,'%')}${sl('phW','ტალღის სიგრძე',400,700,5,680,'ნმ')}</div><div id="phI" class="ainfo"></div><div id="phG"></div></div></div>
   ${card('ფორმულები',FX([['6CO₂ + 6H₂O + სინათლე → C₆H₁₂O₆ + 6O₂','ფოტოსინთეზი',{s:[],w:'ყოველი ჟანგბადის მოლეკულა, რომელსაც სუნთქავ, ოდესღაც წყლიდან გამოთავისუფლდა ფოთოლში.'}],
     ['C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~30 ATP','უჯრედული სუნთქვა',{s:[],w:'ფოტოსინთეზის შებრუნებული — მიტოქონდრიაში. ენერგია ATP-ში „იფუთება“.'}],
     ['ქლოროფილი: 430 და 660 ნმ','შთანთქმის პიკები',{s:[],w:'ლურჯს და წითელს შთანთქავს, მწვანეს ირეკლავს — ამიტომაა ფოთოლი მწვანე.'}],['ლიმიტირებადი ფაქტორი','ბლეკმანის პრინციპი',{s:[],w:'სიჩქარეს ყველაზე „ნაკლული“ რესურსი განსაზღვრავს: დიდი სინათლე არაფერს შველის, თუ CO₂ ცოტაა.'}],
     ['~1–2%','ეფექტურობა',{s:[],w:'მცენარე მზის ენერგიის მხოლოდ 1–2%-ს ინახავს; მზის პანელი — 20%-ს. მაგრამ მცენარე თავს თავად აშენებს.'}]]))}`;
  const c=canvas($('phC'),420,400),g=c.g,c2=canvas($('phG'),420,170),h=c2.g;let L=60,C=50,wl=680;const bub=[];
  const absb=w=>Math.exp(-((w-430)**2)/(2*22*22))*.95+Math.exp(-((w-662)**2)/(2*18*18))*.8+Math.exp(-((w-470)**2)/(2*25*25))*.35+.04;
  const rate=()=>{const Le=L/100*absb(wl)/0.95;return Math.min(Le*1.4,C/100)*100;};
  const draw2=()=>{h.fillStyle='#07100b';h.fillRect(0,0,h.W,h.H);for(let w=400;w<=700;w+=2){const x=20+(w-400)/300*(h.W-40);h.fillStyle=K.wlRGB(w);h.globalAlpha=.35;h.fillRect(x,20,4,h.H-50);h.globalAlpha=1;}
    h.strokeStyle='#6fcf8a';h.lineWidth=2;h.beginPath();for(let w=400;w<=700;w+=2){const x=20+(w-400)/300*(h.W-40),y=h.H-30-absb(w)*(h.H-55);w>400?h.lineTo(x,y):h.moveTo(x,y);}h.stroke();h.lineWidth=1;
    const x=20+(wl-400)/300*(h.W-40);h.strokeStyle='#fff';h.beginPath();h.moveTo(x,15);h.lineTo(x,h.H-28);h.stroke();txt(h,'ქლოროფილის შთანთქმის სპექტრი',h.W/2,14,GL,'11px sans-serif');[400,500,600,700].forEach(w=>txt(h,w,20+(w-400)/300*(h.W-40),h.H-14,COL.dim,'10px sans-serif'));
    const r=rate();$('phI').innerHTML=`<div class="big">${r.toFixed(0)}%</div><div class="kv2"><b>ფოტოსინთეზის სიჩქარე</b><span>${r.toFixed(0)} / 100</span><b>შთანთქმა ${wl} ნმ-ზე</b><span>${r3(absb(wl)*100)}%</span><b>ლიმიტირებს</b><span>${L/100*absb(wl)/0.95*1.4<C/100?'სინათლე':'CO₂'}</span></div>`;};
  bindSl('phL',v=>{L=v;draw2();});bindSl('phC2',v=>{C=v;draw2();});bindSl('phW',v=>{wl=v;draw2();});draw2();
  anim((dt,T)=>{g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);const r=rate()/100;
    g.globalAlpha=L/100;for(let i=0;i<10;i++){const y=((T*120+i*40)%220);g.strokeStyle=K.wlRGB(wl);g.lineWidth=2;g.beginPath();g.moveTo(40+i*35-y*.3,y);g.lineTo(40+i*35-y*.3-8,y+16);g.stroke();}g.globalAlpha=1;g.lineWidth=1;
    g.fillStyle='rgba(111,207,138,.75)';g.beginPath();g.moveTo(60,300);g.quadraticCurveTo(200,160,370,230);g.quadraticCurveTo(220,330,60,300);g.fill();g.strokeStyle='#2a6a3a';g.beginPath();g.moveTo(60,300);g.quadraticCurveTo(210,250,370,230);g.stroke();g.strokeStyle='#4a7a3a';g.lineWidth=5;g.beginPath();g.moveTo(60,300);g.lineTo(30,390);g.stroke();g.lineWidth=1;
    if(Math.random()<r*dt*12)bub.push({x:rnd(120,330),y:rnd(230,280),t:0});for(const b of bub){b.t+=dt;b.y-=dt*40;b.x+=Math.sin(b.t*4)*.4;g.strokeStyle='rgba(191,240,207,.8)';g.beginPath();g.arc(b.x,b.y,4,0,TAU);g.stroke();txt(g,'O₂',b.x+7,b.y+3,'rgba(191,240,207,.6)','9px sans-serif','left');}
    while(bub.length&&bub[0].t>5)bub.shift();for(let i=0;i<Math.round(C/12);i++){const x=(i*53+T*15)%400+10,y=330+Math.sin(T+i)*18;txt(g,'CO₂',x,y,'rgba(179,166,143,.7)','10px sans-serif');}
    txt(g,`ფოთლის ფერი: მწვანე, რადგან ~${Math.round((1-absb(540))*100)}% მწვანე სინათლე აირეკლება`,210,20,COL.mid,'10px sans-serif');});
 }});

reg({id:'immune',ico:'🛡',t:'ეპიდემიები და იმუნიტეტი',s:'SIR მოდელი · R₀ · ვაქცინაცია',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="imA"></div></div><div class="acol"><div id="imB"></div><div class="actl">${sl('imR','R₀ (გადამდებლობა)',0.5,8,0.1,3)}${sl('imV','ვაქცინირებული',0,95,1,0,'%')}${sl('imD','ავადმყოფობის ხანგრძლ.',3,21,1,10,'დღე')}<div class="abt"><button id="imP" class="on">↻ ეპიდემიის დაწყება</button></div></div><div id="imI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['dS/dt = −βSI ; dI/dt = βSI − γI ; dR/dt = γI','SIR მოდელი',{s:[['S','მიმღები'],['I','ინფიცირებული'],['R','გამოჯანმრთელებული'],['β','გადაცემის სიჩქარე'],['γ','1/ავადმყოფობის ხანგრძლივობა']],w:'კერმაკი და მაკკენდრიკი, 1927.'}],
     ['R₀ = β / γ','საბაზისო რეპროდუქციის რიცხვი',{s:[],w:'რამდენს აავადებს ერთი ავადმყოფი სრულიად მიმღებ პოპულაციაში. წითელა ~15, გრიპი ~1.5.'}],
     ['H = 1 − 1/R₀','კოლექტიური იმუნიტეტის ზღვარი',{s:[],w:'R₀ = 3 → საჭიროა 67%-ის იმუნიტეტი; წითელა → 93%.'}],['Rₜ < 1','ეპიდემია ქრება',{s:[],w:'ეფექტური რეპროდუქციის რიცხვი = R₀ × მიმღებთა წილი.'}]]))}`;
  const c=canvas($('imA'),420,420),g=c.g,c2=canvas($('imB'),420,220),h=c2.g;let R0=3,vac=0,D=10,agents=[],hist=[],t=0;
  const start=()=>{agents=[];hist=[];t=0;for(let i=0;i<260;i++){const v=Math.random()*100<vac;agents.push({x:rnd(10,410),y:rnd(10,410),vx:rnd(-30,30),vy:rnd(-30,30),s:v?'V':'S',it:0});}let k=0;for(const a of agents)if(a.s==='S'&&k<3){a.s='I';k++;}};
  const ode=()=>{const N=1,g0=1/D,b=R0*g0;let S=(1-vac/100)-.01,I=.01,R=0,out=[];for(let d=0;d<200;d++){out.push([S,I,R]);for(let k=0;k<10;k++){const dS=-b*S*I,dI=b*S*I-g0*I;S+=dS*.1;I+=dI*.1;R+=g0*I*.1;}}return out;};
  const draw2=()=>{const O=ode(),M=mplot(h,{x:[0,200],y:[0,1],step:25,stepY:.25,m:[10,10,20,30],gc:GC});[[0,'#5a9ae8'],[1,'#e8705a'],[2,'#6fcf8a']].forEach(([k,col])=>curve(h,M,d=>O[Math.min(199,Math.round(d))][k],0,199,col,2));
    const peak=Math.max(...O.map(o=>o[1])),Hh=1-1/R0,tot=1-O[199][0]-vac/100;txt(h,'S',M.X(190),M.Y(O[190][0])-5,'#5a9ae8','11px sans-serif');txt(h,'I',M.X(O.findIndex(o=>o[1]===peak)),M.Y(peak)-5,'#e8705a','11px sans-serif');txt(h,'დღე',M.X(195),M.Y(0)-4,COL.dim,'10px sans-serif');
    $('imI').innerHTML=`<div class="kv2"><b>ეფექტური R</b><span class="${R0*(1-vac/100)<1?'ok':'bad'}">${r3(R0*(1-vac/100))}</span><b>კოლექტ. იმუნიტეტი</b><span>${R0>1?Math.round(Hh*100)+'% საჭირო':'არ არის საჭირო'}</span><b>პიკი</b><span>${Math.round(peak*100)}% ერთდროულად ავად</span><b>სულ გადაიტანს</b><span>${Math.max(0,Math.round(tot*100))}%</span></div>`;};
  bindSl('imR',v=>{R0=v;draw2();},v=>v.toFixed(1));bindSl('imV',v=>{vac=v;draw2();});bindSl('imD',v=>{D=v;draw2();});$('imP').onclick=start;start();draw2();
  anim(dt=>{t+=dt;const rad=12,beta=R0/D;g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);
    for(const a of agents){a.x+=a.vx*dt;a.y+=a.vy*dt;if(a.x<5||a.x>415)a.vx*=-1;if(a.y<5||a.y>415)a.vy*=-1;if(a.s==='I'){a.it+=dt;if(a.it>D*.4)a.s='R';}}
    const inf=agents.filter(a=>a.s==='I');for(const a of agents)if(a.s==='S')for(const b of inf)if(Math.abs(a.x-b.x)<rad&&Math.abs(a.y-b.y)<rad&&Math.random()<beta*dt*1.6){a.s='I';a.it=0;break;}
    for(const a of agents){const col={S:'#5a9ae8',I:'#e8705a',R:'#6fcf8a',V:'#ecd59a'}[a.s];if(a.s==='I'){g.fillStyle='rgba(232,112,90,.12)';g.beginPath();g.arc(a.x,a.y,rad,0,TAU);g.fill();}dot(g,a.x,a.y,3.5,col);}
    const cnt=s=>agents.filter(a=>a.s===s).length;txt(g,`🔵 მიმღები ${cnt('S')}  🔴 ავად ${cnt('I')}  🟢 გამოჯანმრთ. ${cnt('R')}  🟡 ვაქცინ. ${cnt('V')}`,210,412,COL.mid,'10.5px sans-serif');});
 }});

/* ═══════════════════ LEVEL 3 · ევოლუცია და ეკოლოგია ═══════════════════ */
reg({id:'evo',ico:'🦋',t:'ბუნებრივი გადარჩევა',s:'არყის ფარვანა · მტაცებელი ირჩევს',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="evC"></div><div class="hint">შენ ხარ ჩიტი: 15 წამში დაიჭირე რაც შეიძლება მეტი ფარვანა</div></div><div class="acol"><div class="actl"><div>${btns('evB',[['light','ღია ქერქი (1800)'],['dark','ჭვარტლიანი ქერქი (1900)']],'dark')}</div><div class="abt"><button id="evG" class="on">▶ თაობა (ჩიტის რეჟიმი)</button><button id="evA">⏩ 20 თაობა ავტომატურად</button><button id="evX">↻ თავიდან</button></div></div><div id="evI" class="ainfo"></div><div id="evH"></div></div></div>
   ${card('ფორმულები',FX([['ვარიაცია + მემკვიდრეობა + გადარჩევა = ევოლუცია','დარვინის ალგორითმი',{s:[],w:'არცერთ ფარვანას არ „უნდა“ შეიცვალოს — უბრალოდ ფონზე შესამჩნევები უფრო ხშირად იჭმება.'}],
     ['p′ = p·w₁ / (p·w₁ + q·w₂)','ალელის სიხშირის ცვლილება',{s:[['w','შეგუებულობა (გადარჩენის შანსი)']],w:'ინდუსტრიული მელანიზმი: მანჩესტერში შავი ფარვანა 1848-ში იშვიათი იყო, 1895-ში — 98%.'}],
     ['s = 1 − w₁/w₂','გადარჩევის კოეფიციენტი',{s:[],w:'s = 0.1 ნიშნავს 10%-ით ნაკლებ შთამომავლობას — საკმარისია ასეულ თაობაში სრული ჩანაცვლებისთვის.'}]]))}`;
  const c=canvas($('evC'),420,420),g=c.g,c2=canvas($('evH'),420,150),h=c2.g;let bg='dark',pop=[],gen=0,hist=[],phase='idle',tl=0,caught=0,auto=0;
  const mk=(d)=>({x:rnd(20,400),y:rnd(20,400),d:clamp(d,0,1),a:rnd(0,TAU),alive:true});
  const reset=()=>{pop=[...Array(40)].map(()=>mk(Math.random()<.9?rnd(.75,1):rnd(0,.25)));gen=0;hist=[mean()];draw2();};
  const mean=()=>pop.reduce((s,p)=>s+(1-p.d),0)/pop.length;
  const breed=()=>{const al=pop.filter(p=>p.alive);if(!al.length){reset();return;}pop=[...Array(40)].map(()=>{const p=al[Math.floor(Math.random()*al.length)];return mk(p.d+rnd(-.08,.08));});gen++;hist.push(mean());draw2();};
  const draw2=()=>{h.fillStyle='#07100b';h.fillRect(0,0,h.W,h.H);const M=mplot(h,{x:[0,Math.max(10,hist.length-1)],y:[0,1],step:5,stepY:.5,m:[8,8,18,28],gc:GC});h.strokeStyle='#e0a030';h.lineWidth=2;h.beginPath();hist.forEach((v,i)=>i?h.lineTo(M.X(i),M.Y(v)):h.moveTo(M.X(i),M.Y(v)));h.stroke();h.lineWidth=1;txt(h,'მუქი ფარვანების წილი',M.x0+6,M.y0+12,'#e0a030','10px sans-serif','left');
    $('evI').innerHTML=`<div class="kv2"><b>თაობა</b><span>${gen}</span><b>მუქი</b><span>${Math.round(mean()*100)}%</span>${phase==='hunt'?`<b>დაჭერილი</b><span>${caught} · ${Math.ceil(tl)} წმ</span>`:''}</div>`;};
  const hunt=()=>{phase='hunt';tl=15;caught=0;pop.forEach(p=>p.alive=true);};
  c.addEventListener('pointerdown',e=>{if(phase!=='hunt')return;const p=c.pt(e);const m=pop.find(q=>q.alive&&Math.hypot(q.x-p[0],q.y-p[1])<14);if(m){m.alive=false;caught++;draw2();}});
  $('evG').onclick=hunt;$('evA').onclick=()=>{auto=20;phase='idle';};$('evX').onclick=reset;bindBtns(root,'evB',k=>{bg=k;});reset();
  anim((dt,T)=>{const B=bg==='dark'?.18:.85;if(auto>0){for(const p of pop){const contrast=Math.abs((1-p.d)-B);p.alive=Math.random()>contrast*.85;}breed();auto--;}
    if(phase==='hunt'){tl-=dt;if(tl<=0||pop.filter(p=>p.alive).length<=12){phase='idle';breed();}else draw2();}
    g.fillStyle=`rgb(${Math.round(B*200+20)},${Math.round(B*190+20)},${Math.round(B*170+20)})`;g.fillRect(0,0,g.W,g.H);for(let i=0;i<70;i++){g.strokeStyle=`rgba(${B>.5?'60,50,40':'200,190,170'},.25)`;g.lineWidth=1+(i%3);g.beginPath();g.moveTo((i*67)%420,(i*31)%420);g.lineTo((i*67)%420+40,(i*31)%420+6);g.stroke();}g.lineWidth=1;
    for(const p of pop){if(!p.alive)continue;const v=Math.round((1-p.d)*210+25);g.save();g.translate(p.x,p.y);g.rotate(p.a+Math.sin(T*2+p.x)*.05);g.fillStyle=`rgb(${v},${v-5},${v-15})`;g.beginPath();g.ellipse(-7,0,8,5,.4,0,TAU);g.ellipse(7,0,8,5,-.4,0,TAU);g.fill();g.fillStyle=`rgb(${v-30},${v-35},${v-40})`;g.fillRect(-1.5,-5,3,10);g.restore();}
    if(phase==='hunt')txt(g,`🐦 ${Math.ceil(tl)} წმ · დაჭერილი ${caught}`,210,20,B>.5?'#222':'#fff','600 13px sans-serif');});
 }});

reg({id:'drift',ico:'🎲',t:'გენეტიკური დრიფტი',s:'შემთხვევითობა პატარა პოპულაციაში · ჰარდი–ვაინბერგი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="drC"></div></div><div class="acol"><div class="actl">${sl('drN','პოპულაციის ზომა N',4,1000,1,20)}${sl('drP','საწყისი სიხშირე p',0.05,0.95,0.01,0.5)}${sl('drS','გადარჩევა s',-0.1,0.1,0.005,0)}<div class="abt"><button id="drG" class="on">🎲 ხელახლა</button></div></div><div id="drI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['p² + 2pq + q² = 1','ჰარდი–ვაინბერგის წონასწორობა',{s:[['p, q','ორი ალელის სიხშირე']],w:'დიდ, შემთხვევით შეჯვარებად პოპულაციაში გადარჩევის გარეშე სიხშირეები არ იცვლება.'}],
     ['Var(Δp) = pq / 2N','დრიფტის სიძლიერე',{s:[['N','პოპულაციის ზომა']],w:'პატარა N-ზე სიხშირე „ტივტივებს“ და ალელი შეიძლება სრულად გაქრეს ან ფიქსირდეს — სარგებლის გარეშეც.'}],
     ['P(ფიქსაცია) = p₀','ნეიტრალური ალელი',{s:[],w:'ნებისმიერი ახალი მუტაცია ფიქსირდება ალბათობით 1/2N.'}],['დამფუძნებლის ეფექტი','ბოსტნის ეფექტი',{s:[],w:'პატარა ჯგუფი ახალ კუნძულზე იშვიათ ალელებს ატარებს — ამიშებში პოლიდაქტილია ხშირი.'}]]))}`;
  const c=canvas($('drC'),440,400),g=c.g;let N=20,p0=.5,s=0;
  const run=()=>{const M=mplot(g,{x:[0,150],y:[0,1],step:25,stepY:.25,m:[10,10,20,30],gc:GC});let fixed=0,lost=0;
    for(let r=0;r<16;r++){let p=p0;g.strokeStyle=`hsla(${120+r*14},60%,65%,.75)`;g.lineWidth=1.4;g.beginPath();g.moveTo(M.X(0),M.Y(p));
      for(let t=1;t<=150;t++){const pe=p*(1+s)/(p*(1+s)+(1-p));let k=0;if(N<=200){for(let i=0;i<2*N;i++)if(Math.random()<pe)k++;p=k/(2*N);}else{const sd=Math.sqrt(pe*(1-pe)/(2*N));let u=0;for(let j=0;j<6;j++)u+=Math.random();p=clamp(pe+(u-3)*Math.SQRT2*sd,0,1);}g.lineTo(M.X(t),M.Y(p));if(p<=0||p>=1){break;}}g.stroke();if(p>=1)fixed++;if(p<=0)lost++;}
    g.lineWidth=1;txt(g,'თაობა',M.X(140),M.Y(0)-5,COL.dim,'10px sans-serif');
    $('drI').innerHTML=`<div class="kv2"><b>16 პოპულაციიდან</b><span>ფიქსირდა ${fixed} · გაქრა ${lost} · ჯერ შერეულია ${16-fixed-lost}</span><b>Hardy–W. (თაობა 0)</b><span>AA ${r3(p0*p0)} · Aa ${r3(2*p0*(1-p0))} · aa ${r3((1-p0)**2)}</span></div><div class="hint">${N<50?'პატარა პოპულაცია — ალელები შემთხვევით ქრება ან ფიქსირდება.':'დიდ პოპულაციაში დრიფტი სუსტია'+(s?' — გადარჩევა იმარჯვებს.':'.')}</div>`;};
  bindSl('drN',v=>{N=v;run();});bindSl('drP',v=>{p0=v;run();},v=>v.toFixed(2));bindSl('drS',v=>{s=v;run();},v=>v.toFixed(3));$('drG').onclick=run;
 }});

reg({id:'eco',ico:'🦊',t:'მტაცებელი და მსხვერპლი',s:'ლოტკა–ვოლტერას ციკლები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="ecA"></div></div><div class="acol"><div id="ecB"></div><div class="actl">${sl('ecA2','კურდღლების გამრავლება α',0.2,2,0.05,1)}${sl('ecB2','ნადირობის წარმატება β',0.1,1,0.05,0.4)}${sl('ecG','მელიების კვდომა γ',0.1,2,0.05,0.8)}${sl('ecD','ნადავლის გადამუშავება δ',0.05,1,0.05,0.3)}<div class="abt"><button id="ecR">↻ თავიდან</button></div></div></div></div>
   ${card('ფორმულები',FX([['dx/dt = αx − βxy','მსხვერპლი (კურდღელი)',{s:[['x','კურდღლები'],['y','მელიები']],w:'კურდღლები მრავლდებიან და ჭამენ მათ.'}],['dy/dt = δxy − γy','მტაცებელი (მელია)',{s:[],w:'მელიები მრავლდებიან, როცა საჭმელი ბევრია, და კვდებიან, როცა ცოტაა.'}],
     ['x* = γ/δ ; y* = α/β','წონასწორობის წერტილი',{s:[],w:'ციკლები ამ წერტილის გარშემო ბრუნავს — მელიების პიკი ყოველთვის კურდღლების პიკს ჩამორჩება.'}],['ჰადსონის ყურის კომპანია','რეალური მონაცემები (1845–1935)',{s:[],w:'ფოცხვერისა და თეთრი კურდღლის ტყავების ჩანაწერები ~10-წლიან ციკლებს აჩვენებს.'}]]))}`;
  const c=canvas($('ecA'),420,300),g=c.g,c2=canvas($('ecB'),420,220),h=c2.g;let a=1,b=.4,gm=.8,d=.3,x=4,y=2,hist=[];
  const reset=()=>{x=gm/d*1.6;y=a/b*.6;hist=[];};$('ecR').onclick=reset;[['ecA2',v=>a=v],['ecB2',v=>b=v],['ecG',v=>gm=v],['ecD',v=>d=v]].forEach(([id,f])=>bindSl(id,f,v=>v.toFixed(2)));reset();
  const rab=[],fox=[];for(let i=0;i<60;i++)rab.push([rnd(0,420),rnd(0,140),rnd(0,TAU)]);for(let i=0;i<30;i++)fox.push([rnd(0,420),rnd(150,290),rnd(0,TAU)]);
  anim((dt,T)=>{for(let k=0;k<20;k++){const h0=dt*1.5/20;const f=(X,Y)=>[a*X-b*X*Y,d*X*Y-gm*Y];const k1=f(x,y),k2=f(x+h0/2*k1[0],y+h0/2*k1[1]),k3=f(x+h0/2*k2[0],y+h0/2*k2[1]),k4=f(x+h0*k3[0],y+h0*k3[1]);
      x+=h0/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]);y+=h0/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1]);x=Math.max(x,1e-3);y=Math.max(y,1e-3);}hist.push([x,y]);if(hist.length>360)hist.shift();
    const mx=Math.max(...hist.map(p=>Math.max(p[0],p[1])),1)*1.1;g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);
    const nr=Math.min(60,Math.round(x/mx*60)),nf=Math.min(30,Math.round(y/mx*30));g.fillStyle='rgba(111,207,138,.08)';g.fillRect(0,0,420,145);
    rab.slice(0,nr).forEach(r=>{r[0]=(r[0]+Math.cos(r[2]+T)*0.6+420)%420;txt(g,'🐇',r[0],r[1]+14,'#fff','14px sans-serif');});fox.slice(0,nf).forEach(f=>{f[0]=(f[0]+Math.cos(f[2]+T*.7)*0.8+420)%420;txt(g,'🦊',f[0],f[1]+14,'#fff','15px sans-serif');});
    h.fillStyle='#07100b';h.fillRect(0,0,h.W,h.H);const M={X:i=>10+i*(h.W*.58-20)/360,Y:v=>h.H-14-v/mx*(h.H-28)};
    [[0,'#bff0cf'],[1,'#e0a030']].forEach(([k,col])=>{h.strokeStyle=col;h.lineWidth=2;h.beginPath();hist.forEach((p,i)=>i?h.lineTo(M.X(i),M.Y(p[k])):h.moveTo(M.X(i),M.Y(p[k])));h.stroke();});
    const P={X:v=>h.W*.62+v/mx*(h.W*.36),Y:v=>h.H-14-v/mx*(h.H-28)};h.strokeStyle='rgba(165,133,239,.8)';h.beginPath();hist.forEach((p,i)=>i?h.lineTo(P.X(p[0]),P.Y(p[1])):h.moveTo(P.X(p[0]),P.Y(p[1])));h.stroke();h.lineWidth=1;dot(h,P.X(gm/d),P.Y(a/b),3,'#fff');
    txt(h,'🐇 დრო 🦊',h.W*.29,12,COL.mid,'10px sans-serif');txt(h,'ფაზური სივრცე',h.W*.8,12,COL.mid,'10px sans-serif');txt(g,`🐇 ${x.toFixed(1)}   🦊 ${y.toFixed(1)}`,210,296,GL,'12px sans-serif');});
 }});

reg({id:'growth',ico:'📈',t:'პოპულაციის ზრდა',s:'ექსპონენტა vs ლოგისტიკა · გაორმაგების დრო',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="grC"></div></div><div class="acol"><div class="actl">${sl('grR','ზრდის ტემპი r (საათში)',0.1,2,0.05,0.7)}${sl('grK','ტევადობა K',100,5000,50,1000)}${sl('grT','დრო',0,30,0.1,10,'სთ')}</div><div id="grI" class="ainfo"></div><div id="grD"></div></div></div>
   ${card('ფორმულები',FX([['N(t) = N₀·e^(rt)','ექსპონენტური ზრდა',{s:[['r','ზრდის ტემპი']],w:'ბაქტერია ყოველ 20 წუთში იყოფა: 48 საათში ერთი უჯრედის შთამომავლობა დედამიწაზე მძიმე იქნებოდა — რესურსი რომ არ ილეოდეს.'}],
     ['N(t) = K / (1 + ((K−N₀)/N₀)·e^(−rt))','ლოგისტიკური ზრდა',{s:[['K','გარემოს ტევადობა']],w:'S-მრუდი: ზრდა ნელდება, როცა რესურსი მცირდება.'}],['T₂ = ln 2 / r ≈ 0.693 / r','გაორმაგების დრო',{s:[],w:'„70-ის წესი“: 7%-იანი ზრდა ~10 წელიწადში აორმაგებს.'}],['dN/dt = rN(1 − N/K)','ლოგისტიკური განტოლება',{s:[],w:'ზრდის მაქსიმუმი N = K/2-ზეა — თევზჭერის „მაქსიმალური მდგრადი მოსავალი“.'}]]))}`;
  const c=canvas($('grC'),440,380),g=c.g,c2=canvas($('grD'),420,130),h=c2.g;let r=.7,Kc=1000,tt=10;
  const draw=()=>{const exp=t=>Math.exp(r*t),lg=t=>Kc/(1+(Kc-1)*Math.exp(-r*t));const M=mplot(g,{x:[0,30],y:[0,Kc*1.5],step:5,stepY:Kc/2,m:[10,10,20,40],gc:GC});
    g.strokeStyle='rgba(236,213,154,.5)';g.setLineDash([5,4]);g.beginPath();g.moveTo(M.X(0),M.Y(Kc));g.lineTo(M.X(30),M.Y(Kc));g.stroke();g.setLineDash([]);txt(g,'K',M.X(29),M.Y(Kc)-5,'#ecd59a','11px sans-serif');
    curve(g,M,exp,0,30,'#e8705a',2.4);curve(g,M,lg,0,30,GR,2.8);g.strokeStyle='rgba(255,255,255,.4)';g.beginPath();g.moveTo(M.X(tt),M.y0);g.lineTo(M.X(tt),M.y0+M.h);g.stroke();dot(g,M.X(tt),M.Y(Math.min(Kc*1.5,exp(tt))),5,'#e8705a');dot(g,M.X(tt),M.Y(lg(tt)),5,GR);
    txt(g,'ექსპონენტა',M.X(Math.log(Kc*1.3)/r)+8,M.y0+30,'#e8705a','11px sans-serif','left');txt(g,'ლოგისტიკა',M.X(25),M.Y(lg(25))+16,GR,'11px sans-serif');
    const n=lg(tt);h.fillStyle='#07100b';h.fillRect(0,0,h.W,h.H);const shown=Math.min(800,Math.round(n/Kc*800));for(let i=0;i<shown;i++){const x=(i*37)%h.W,y=(i*53)%h.H;h.fillStyle='rgba(111,207,138,.7)';h.beginPath();h.ellipse(x,y,3,1.6,i,0,TAU);h.fill();}
    $('grI').innerHTML=`<div class="kv2"><b>t = ${tt} სთ</b><span></span><b style="color:#e8705a">ექსპონენტა</b><span>${exp(tt)<1e12?Math.round(exp(tt)).toLocaleString('en'):exp(tt).toExponential(2)}</span><b style="color:#6fcf8a">ლოგისტიკა</b><span>${Math.round(n)} (${Math.round(n/Kc*100)}% K)</span><b>გაორმაგება</b><span>${r3(Math.log(2)/r)} სთ</span></div>`;};
  bindSl('grR',v=>{r=v;draw();},v=>v.toFixed(2));bindSl('grK',v=>{Kc=v;draw();});bindSl('grT',v=>{tt=v;draw();},v=>v.toFixed(1));
 }});

const EPOCHS=[[4.6,'დედამიწის წარმოქმნა','🌍'],[4.5,'მთვარე (თეია)','🌙'],[3.8,'პირველი სიცოცხლე (LUCA)','🦠'],[2.4,'დიდი ჟანგვითი მოვლენა (O₂)','💨'],[2.0,'ეუკარიოტები','🔬'],[1.2,'სქესობრივი გამრავლება','⚤'],[0.6,'მრავალუჯრედიანები (ედიაკარა)','🪼'],[0.54,'კემბრიული აფეთქება','🦐'],[0.47,'მცენარეები ხმელეთზე','🌱'],[0.375,'თევზები ხმელეთზე','🐸'],[0.252,'პერმული გადაშენება (96%)','☠'],[0.23,'დინოზავრები','🦕'],[0.2,'ძუძუმწოვრები','🐁'],[0.13,'ყვავილოვანი მცენარეები','🌸'],[0.066,'ასტეროიდი — დინოზავრების დასასრული','☄'],[0.006,'პირველი ჰომინინები','🦍'],[0.0003,'Homo sapiens','🧍'],[0.00001,'მიწათმოქმედება','🌾']];
reg({id:'tree',ico:'🌳',t:'სიცოცხლის ისტორია',s:'4.6 მილიარდი წელი 24 საათში',
 build(root){
  root.innerHTML=`<div id="trC"></div><div class="actl">${sl('trZ','დრო (მილიარდი წლის წინ)',0,4.6,0.001,0)}</div><div id="trI" class="ainfo"></div>
   <div class="cards3"><div><b>🦠 ბაქტერიები და არქეები</b>სიცოცხლის ისტორიის 80% მხოლოდ ერთუჯრედიანები.</div><div><b>🔬 ეუკარიოტები</b>ერთი არქეა + ერთი ბაქტერია (მიტოქონდრია) = ჩვენი წინაპარი.</div><div><b>🌳 სამი დომენი</b>ბაქტერიები · არქეები · ეუკარიოტები. ცხოველები და სოკოები ერთმანეთის უფრო ახლო ნათესავებია, ვიდრე მცენარეებისა.</div></div>
   ${card('ფაქტები',FX([['24 სთ = 4.6 მლრდ წელი','დედამიწის საათი',{s:[],w:'1 წამი ≈ 53 000 წელი. ადამიანი ჩნდება 23:59:54-ზე.'}],['5 დიდი გადაშენება','ორდოვიკური · დევონური · პერმული · ტრიასული · ცარცული',{s:[],w:'ყოველი გადაშენების შემდეგ ახალი ჯგუფები ავსებენ ცარიელ ნიშებს.'}],['~8.7 მილიონი სახეობა','დღეს ეკოსისტემებში',{s:[],w:'აღწერილია მხოლოდ ~1.2 მილიონი.'}]]))}`;
  const c=canvas($('trC'),900,240),g=c.g;let z=0;bindSl('trZ',v=>{z=v;},v=>v.toFixed(3));
  anim((dt,T)=>{g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);const cx=130,cy=120,R=95;
    for(let i=0;i<24;i++){const a=i/24*TAU-Math.PI/2;txt(g,i,cx+Math.cos(a)*(R+12),cy+Math.sin(a)*(R+12)+4,COL.dim,'9px sans-serif');}g.strokeStyle='rgba(191,240,207,.4)';g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();
    EPOCHS.forEach(([ago,nm,ic])=>{const a=(1-ago/4.6)*TAU-Math.PI/2;dot(g,cx+Math.cos(a)*R,cy+Math.sin(a)*R,2.5,ago>=z?GR:'rgba(255,255,255,.2)');});
    const ah=(1-z/4.6)*TAU-Math.PI/2;g.strokeStyle='#ecd59a';g.lineWidth=2.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(ah)*(R-10),cy+Math.sin(ah)*(R-10));g.stroke();g.lineWidth=1;
    const hrs=(1-z/4.6)*24,hh=Math.floor(hrs),mm=Math.floor((hrs-hh)*60),ss=Math.floor(((hrs-hh)*60-mm)*60);txt(g,`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`,cx,cy+5,'#ecd59a','600 16px Cinzel,serif');
    const L=v=>270+(1-Math.log10(v*1e9+1)/Math.log10(4.6e9))*0+(4.6-v)/4.6*600;g.strokeStyle='rgba(191,240,207,.3)';g.beginPath();g.moveTo(270,200);g.lineTo(870,200);g.stroke();
    EPOCHS.forEach(([ago,nm,ic],i)=>{const x=L(ago),past=ago>=z;g.globalAlpha=past?1:.25;txt(g,ic,x,192-(i%4)*40,'#fff','15px sans-serif');g.strokeStyle='rgba(191,240,207,.25)';g.beginPath();g.moveTo(x,196-(i%4)*40);g.lineTo(x,200);g.stroke();g.globalAlpha=1;});
    g.fillStyle='#ecd59a';g.fillRect(L(z)-1,30,2,180);txt(g,'4.6 მლრდ',270,220,COL.dim,'10px sans-serif');txt(g,'დღეს',870,220,COL.dim,'10px sans-serif');
    const last=EPOCHS.filter(e=>e[0]>=z).pop();$('trI').innerHTML=last?`<div class="big" style="font-size:20px">${last[2]} ${last[1]}</div><div class="kv2"><b>რამდენი ხნის წინ</b><span>${last[0]>=1?last[0]+' მილიარდი':last[0]>=.001?Math.round(last[0]*1000)+' მილიონი':Math.round(last[0]*1e6)+' ათასი'} წელი</span><b>დედამიწის საათზე</b><span>${String(Math.floor((1-last[0]/4.6)*24)).padStart(2,'0')}:${String(Math.floor(((1-last[0]/4.6)*24%1)*60)).padStart(2,'0')}</span></div>`:'';});
 }});

/* ═══════════════════ LEVEL 4 · გმირი ═══════════════════ */
reg({id:'pcr',ico:'🧪',t:'ბიოტექნოლოგია: PCR და CRISPR',s:'დნმ-ის ასლები · გენის რედაქტირება',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="pcC"></div><div class="actl">${sl('pcN','ციკლები',0,35,1,0)}<div class="abt"><button id="pcP">▶ ციკლების გაშვება</button></div></div><div id="pcI" class="ainfo"></div></div>
    <div class="acol"><div class="lx"><p><b>CRISPR-Cas9</b> — ბაქტერიების იმუნური სისტემა, რომელიც ზუსტ „მაკრატლად“ იქცა. გიდ-რნმ (20 ასო) პოულობს შესაბამის ადგილს გენომში, Cas9 ჭრის.</p></div>
      <label class="hint">გიდ-რნმ (20 ასო):</label><input class="tin2" id="crG" value="GACGTTAGCCATGGATCCAA" maxlength="20"><div id="crS" class="seqbox" style="margin-top:6px;font-size:12px"></div><div class="abt" style="margin-top:6px"><button id="crX">✂ გაჭრა და შეკეთება</button></div><div id="crI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['N = N₀ · 2ⁿ','PCR — ჯაჭვური პოლიმერაზული რეაქცია',{s:[['n','ციკლების რაოდენობა']],w:'30 ციკლი = მილიარდი ასლი 2 საათში. ყოველი ციკლი: 95 °C (დნმ იშლება) → 55 °C (პრაიმერები ებმის) → 72 °C (პოლიმერაზა აშენებს).'}],
     ['Ct','ზღურბლის ციკლი (qPCR)',{s:[],w:'რაც ნაკლებია Ct, მით მეტი დნმ იყო ნიმუშში. COVID-ტესტები ამით ზომავდა ვირუსის რაოდენობას.'}],['NGG (PAM)','Cas9-ის „სამისამართო ნიშანი“',{s:[],w:'Cas9 ჭრის მხოლოდ იქ, სადაც სამიზნის შემდეგ NGG თანმიმდევრობაა — 3 ნუკლეოტიდით ადრე.'}],
     ['ნობელი 2020','შარპანტიე და დაუდნა',{s:[],w:'2023 წელს დამტკიცდა პირველი CRISPR-თერაპია (ნამგლისებრუჯრედოვანი ანემია).'}]]))}`;
  const c=canvas($('pcC'),420,320),g=c.g;let n=0,play=false,acc=0;const temp=[];
  let ns;$('pcP').onclick=()=>{play=true;n=0;acc=0;};
  const draw=()=>{g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);const cnt=2**n,cells=Math.min(cnt,512),sz=Math.min(26,Math.max(3,Math.floor(Math.sqrt(300*240/cells))-1));let i=0;for(let y=10;y<250&&i<cells;y+=sz+1)for(let x=10;x<410&&i<cells;x+=sz+1,i++){g.fillStyle=i<cells/2?'#a585ef':'#6fcf8a';g.fillRect(x,y,sz,sz);}
    const M={X:k=>20+k*(380/35),Y:v=>310-Math.log10(v)/12*50};g.strokeStyle='#ecd59a';g.beginPath();for(let k=0;k<=n;k++)k?g.lineTo(M.X(k),M.Y(2**k)):g.moveTo(M.X(k),M.Y(1));g.stroke();txt(g,'log(ასლები) →',20,262,COL.dim,'10px sans-serif','left');
    $('pcI').innerHTML=`<div class="kv2"><b>ციკლი</b><span>${n}</span><b>ასლები</b><span>${cnt<1e7?cnt.toLocaleString('en'):cnt.toExponential(2)}</span><b>დრო</b><span>~${Math.round(n*3.5)} წთ</span><b>ტემპერატურა</b><span>95 → 55 → 72 °C</span></div>${cnt>512?'<div class="hint">ნახატზე მხოლოდ 512 ჩანს.</div>':''}`;};
  anim(dt=>{if(!play)return;acc+=dt;if(acc>.35){acc=0;n++;ns.value=n;$('pcN_v').textContent=n;draw();if(n>=35)play=false;}});ns=bindSl('pcN',v=>{n=v;draw();});
  const GEN='TTACGATCGGACGTTAGCCATGGATCCAAAGGTCATGCTAGCATTGACCGTA';let cut=false;
  const cr=()=>{const gd=$('crG').value.toUpperCase().replace(/[^ATGC]/g,'');let best=-1,bm=0;for(let i=0;i+gd.length<=GEN.length;i++){let m=0;for(let j=0;j<gd.length;j++)if(GEN[i+j]===gd[j])m++;if(m>bm){bm=m;best=i;}}
    const pamOK=best>=0&&/^.GG/.test(GEN.slice(best+gd.length,best+gd.length+3)),hit=bm===gd.length&&gd.length>=15;
    $('crS').innerHTML=GEN.split('').map((b,i)=>{const inT=i>=best&&i<best+gd.length,inP=i>=best+gd.length&&i<best+gd.length+3;const cutHere=cut&&hit&&pamOK&&i===best+gd.length-3;
      return (cutHere?'<b style="color:#e8705a"> ✂ </b>':'')+`<span style="color:${inP?'#ecd59a':inT?(GEN[i]===gd[i-best]?'#6fcf8a':'#e8705a'):'#6d6253'};${inP?'text-decoration:underline':''}">${b}</span>`;}).join('');
    $('crI').innerHTML=`<div class="kv2"><b>დამთხვევა</b><span>${bm} / ${gd.length}</span><b>PAM (NGG)</b><span class="${pamOK?'ok':'bad'}">${best>=0?GEN.slice(best+gd.length,best+gd.length+3):'—'} ${pamOK?'✓':'✗'}</span><b>შედეგი</b><span>${!hit?'გიდი ზუსტად არ ემთხვევა — Cas9 არ ჭრის':!pamOK?'PAM არ არის — არ ჭრის':cut?'<span class="ok">გაიჭრა! უჯრედი შეაკეთებს — გენი გამოირთვება ან ახალი ჩაჯდება შაბლონით</span>':'მზადაა გასაჭრელად'}</span></div>`;};
  $('crG').oninput=()=>{cut=false;cr();};$('crX').onclick=()=>{cut=true;cr();};cr();
 }});

reg({id:'life',ico:'▦',t:'ხელოვნური სიცოცხლე',s:'კონვეის „სიცოცხლე“ · ფრინველთა გუნდი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="liC"></div><div class="hint">კონვეი: დააწკაპუნე/გადაატარე უჯრედების დასახატად</div></div><div class="acol"><div class="actl"><div>${btns('liM',[['gol','კონვეის „სიცოცხლე“'],['boids','გუნდი (boids)']],'gol')}</div><div>${btns('liP',[['rnd','შემთხვევითი'],['glider','პლანერი'],['gun','გოსპერის ქვემეხი'],['puls','პულსარი']],'rnd')}</div>${sl('liS','სიჩქარე',1,30,1,10)}<div class="abt"><button id="liG" class="on">⏸ პაუზა</button><button id="liX">✕ გასუფთავება</button></div></div><div id="liI" class="ainfo"></div></div></div>
   ${card('წესები',FX([['B3/S23','კონვეის წესი (1970)',{s:[['B3','იბადება 3 მეზობლით'],['S23','გადარჩება 2 ან 3 მეზობლით']],w:'სამი მარტივი წესი — და ჩნდება მოძრავი „არსებები“, ქარხნები და უნივერსალური კომპიუტერიც კი (ტიურინგ-სრულია).'}],
     ['გამოყოფა · გასწორება · შეკავშირება','რეინოლდსის boids (1986)',{s:[],w:'თითოეულ ჩიტს მხოლოდ მეზობლები აინტერესებს — მაგრამ ერთად ქმნიან გუნდს ლიდერის გარეშე. ასე მოძრაობენ შაშვები, თევზები, ჭიანჭველები.'}],
     ['ემერჯენტულობა','მთელი > ნაწილების ჯამი',{s:[],w:'სიცოცხლე თვითონაც ემერჯენტულია: მოლეკულები არ არიან ცოცხალი, უჯრედი — ცოცხალია.'}]]))}`;
  const c=canvas($('liC'),440,440),g=c.g;const W=88,H=88,cs=5;let A=new Uint8Array(W*H),mode='gol',run=true,spd=10,acc=0,gen=0;const boids=[];
  const put=(pat,ox,oy)=>pat.forEach(([x,y])=>{A[((oy+y+H)%H)*W+(ox+x+W)%W]=1;});
  const PAT={glider:[[1,0],[2,1],[0,2],[1,2],[2,2]],gun:[[0,4],[0,5],[1,4],[1,5],[10,4],[10,5],[10,6],[11,3],[11,7],[12,2],[12,8],[13,2],[13,8],[14,5],[15,3],[15,7],[16,4],[16,5],[16,6],[17,5],[20,2],[20,3],[20,4],[21,2],[21,3],[21,4],[22,1],[22,5],[24,0],[24,1],[24,5],[24,6],[34,2],[34,3],[35,2],[35,3]],
    puls:(()=>{const p=[];const q=[[2,0],[3,0],[4,0],[0,2],[0,3],[0,4],[5,2],[5,3],[5,4],[2,5],[3,5],[4,5]];for(const [sx,sy] of [[1,1],[-1,1],[1,-1],[-1,-1]])q.forEach(([x,y])=>p.push([sx*(x+1),sy*(y+1)]));return p;})()};
  const preset=k=>{A=new Uint8Array(W*H);gen=0;if(k==='rnd')for(let i=0;i<A.length;i++)A[i]=Math.random()<.28?1:0;else if(k==='glider')for(let i=0;i<6;i++)put(PAT.glider,10+i*12,10+i*8);else if(k==='gun')put(PAT.gun,8,10);else put(PAT.puls,44,44);};
  const step=()=>{const B=new Uint8Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)n+=A[((y+dy+H)%H)*W+(x+dx+W)%W];const a=A[y*W+x];B[y*W+x]=(n===3||(a&&n===2))?1:0;}A=B;gen++;};
  for(let i=0;i<90;i++)boids.push({x:rnd(0,440),y:rnd(0,440),vx:rnd(-1,1),vy:rnd(-1,1)});
  let painting=false;c.style.touchAction='none';const paint=e=>{const p=c.pt(e);const x=Math.floor(p[0]/cs),y=Math.floor(p[1]/cs);if(x>=0&&y>=0&&x<W&&y<H)A[y*W+x]=1;};
  c.addEventListener('pointerdown',e=>{if(mode!=='gol')return;painting=true;c.setPointerCapture(e.pointerId);paint(e);});c.addEventListener('pointermove',e=>{if(painting)paint(e);});c.addEventListener('pointerup',()=>painting=false);
  bindBtns(root,'liM',k=>mode=k);bindBtns(root,'liP',k=>preset(k));bindSl('liS',v=>spd=v);$('liG').onclick=e=>{run=!run;e.target.textContent=run?'⏸ პაუზა':'▶ გაშვება';};$('liX').onclick=()=>{A=new Uint8Array(W*H);gen=0;};preset('rnd');
  anim(dt=>{g.fillStyle='#07100b';g.fillRect(0,0,g.W,g.H);
    if(mode==='gol'){acc+=dt*spd;if(run)while(acc>1){acc--;step();}if(!run)acc=0;let alive=0;g.fillStyle=GR;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(A[y*W+x]){alive++;g.fillRect(x*cs,y*cs,cs-1,cs-1);}
      $('liI').innerHTML=`<div class="kv2"><b>თაობა</b><span>${gen}</span><b>ცოცხალი უჯრედი</b><span>${alive}</span></div>`;return;}
    for(const b of boids){let cx=0,cy=0,ax=0,ay=0,sx=0,sy=0,n=0;for(const o of boids){if(o===b)continue;const dx=o.x-b.x,dy=o.y-b.y,d=Math.hypot(dx,dy);if(d<50){n++;cx+=o.x;cy+=o.y;ax+=o.vx;ay+=o.vy;if(d<14){sx-=dx/d;sy-=dy/d;}}}
      if(n){b.vx+=((cx/n-b.x)*.0015+(ax/n-b.vx)*.05)*spd/10;b.vy+=((cy/n-b.y)*.0015+(ay/n-b.vy)*.05)*spd/10;}b.vx+=sx*.06;b.vy+=sy*.06;const sp=Math.hypot(b.vx,b.vy)||1,mx=2.2;if(sp>mx){b.vx*=mx/sp;b.vy*=mx/sp;}
      if(run){b.x=(b.x+b.vx*dt*60+440)%440;b.y=(b.y+b.vy*dt*60+440)%440;}const a=Math.atan2(b.vy,b.vx);g.save();g.translate(b.x,b.y);g.rotate(a);g.fillStyle=GL;g.beginPath();g.moveTo(7,0);g.lineTo(-5,4);g.lineTo(-3,0);g.lineTo(-5,-4);g.closePath();g.fill();g.restore();}
    $('liI').innerHTML=`<div class="hint">90 „ჩიტი“, თითოეული მხოლოდ 3 წესით: არ დაეჯახო მეზობელს · იფრინე მათი მიმართულებით · მიუახლოვდი ჯგუფის ცენტრს.</div>`;});
 }});

reg({id:'bref',ico:'∑',t:'ყველა ფორმულა და ფაქტი',s:'საძიებო ცნობარი',
 build(root){root.innerHTML=`<input class="tin" id="brQ" placeholder="ძიება: მაგ. „დნმ“, „ATP“, „R₀“" style="width:100%;margin-bottom:10px"><div id="brL"></div>`;
  const all=harvest();const show=()=>{const q=$('brQ').value.trim().toLowerCase();$('brL').innerHTML=all.map(([t,ico,list])=>{const L=list.filter(([f,d])=>!q||(f+' '+d+' '+t).toLowerCase().includes(q));return L.length?card(`${ico} ${t}`,FX(L)):'';}).join('')||'<div class="hint">ვერაფერი მოიძებნა.</div>';K.attachXp($('brL'));};$('brQ').oninput=show;show();}});
function harvest(){const out=[],tmp=document.createElement('div');tmp.style.cssText='position:absolute;left:-9999px;width:800px';document.body.appendChild(tmp);
  for(const id of ORDER){if(id==='bref')continue;const t=T[id];try{t.build(tmp);}catch(e){}K.stopAll();const list=[...tmp.querySelectorAll('.acard .af')].map(a=>[a.querySelector('.ff').innerHTML,(a.querySelector('.fd')||{}).innerHTML||'',a.dataset.xi!=null?K.XPS[+a.dataset.xi]:null]);out.push([t.t,t.ico,list]);tmp.innerHTML='';}
  tmp.remove();return out;}

/* ═══════════════════ path ═══════════════════ */
const LEVELS=[
 {t:'ნული',n:'სიცოცხლის აგური',d:'უჯრედი, მოლეკულები და მასშტაბები — რისგან ვართ აწყობილი.',ids:['cell','mol','scale']},
 {t:'მემკვიდრეობა',n:'',d:'დნმ, გენეტიკური კოდი, უჯრედის დაყოფა და მენდელის კანონები.',ids:['dna','central','mitosis','mendel']},
 {t:'ორგანიზმი',n:'როგორ მუშაობს სხეული',d:'ნეირონები, გული, ფერმენტები, ფოტოსინთეზი და იმუნიტეტი.',ids:['neuro','heart','enzyme','photo','immune']},
 {t:'ევოლუცია და ეკოლოგია',n:'',d:'გადარჩევა, დრიფტი, მტაცებელი და მსხვერპლი, ზრდა და სიცოცხლის ისტორია.',ids:['evo','drift','eco','growth','tree']},
 {t:'გმირი',n:'თანამედროვე ბიოლოგია',d:'PCR, CRISPR და ემერჯენტული ხელოვნური სიცოცხლე.',ids:['pcr','life','bref']}];
const ORDER=LEVELS.flatMap(l=>l.ids);
const INTRO={cell:'ყოველი ცოცხალი არსება უჯრედებისგანაა. შეეხე ორგანელებს და შეადარე ცხოველური, მცენარეული და ბაქტერიული უჯრედი.',mol:'სიცოცხლე ოთხი სახის მოლეკულაზე დგას — და წყალზე, რომლის უცნაური თვისებები ყველაფერს შესაძლებელს ხდის.',scale:'ადამიანიდან ატომამდე — 10 ათობითი რიგი. გაასრიალე და ჩაყვინთე.',
 dna:'ორი ძაფი, ოთხი ასო, 3 მილიარდი წყვილი. ჩაწერე საკუთარი თანმიმდევრობა და დააკოპირე.',central:'როგორ ხდება ასოების თანმიმდევრობა ცილად: ტრანსკრიფცია და ტრანსლაცია. სცადე მუტაცია!',mitosis:'ერთი უჯრედი → ორი (ან ოთხი). ნაბიჯ-ნაბიჯ.',mendel:'ბარდიდან სისხლის ჯგუფამდე: როგორ გადაეცემა ნიშნები.',
 neuro:'ფიქრი — ელექტრული იმპულსია. გაუგზავნე ნეირონს სტიმული.',heart:'ტუმბო, რომელიც 3 მილიარდჯერ ძგერს. შეცვალე პულსი და ნახე ეკგ.',enzyme:'ცილოვანი კატალიზატორები, რომელთა გარეშე სიცოცხლე მილიონობით წლით „ნელი“ იქნებოდა.',photo:'სინათლე → შაქარი → ATP. რატომაა ფოთოლი მწვანე?',immune:'როგორ ვრცელდება დაავადება და რამდენი ვაქცინაციაა საკმარისი.',
 evo:'გახდი მტაცებელი და თვითონ შეცვალე პოპულაცია.',drift:'პატარა პოპულაციაში ევოლუციას შემთხვევითობა წარმართავს.',eco:'კურდღლები და მელიები — ბუნების უსასრულო ციკლი.',growth:'რატომ არ ავსებს ბაქტერია დედამიწას.',tree:'4.6 მილიარდი წელი ერთ დღე-ღამეში.',
 pcr:'მილიარდი ასლი ორ საათში და გენომის „რედაქტორი“.',life:'სამი წესი → სიცოცხლის მსგავსი ქცევა.',bref:'ყველა ფორმულა ერთ ადგილას, ძიებით.'};
const QUIZ={
 cell:[['რომელი ორგანელა აწარმოებს ATP-ს?',['მიტოქონდრია','ლიზოსომა','გოლჯი','ვაკუოლი'],0,''],['რა არ აქვს ბაქტერიას?',['ბირთვი','რიბოსომა','მემბრანა','დნმ'],0,'პროკარიოტია.'],['ფოტოსინთეზი ხდება:',['ქლოროპლასტში','მიტოქონდრიაში','ბირთვში','ER-ში'],0,''],['რატომ არის უჯრედები პატარა?',['ზედაპირი/მოცულობა მცირდება ზომასთან ერთად','დნმ არ ეტევა','ასეა მოდაში','გრავიტაცია'],0,'']],
 mol:[['წყლის მოლეკულის კუთხე:',['104.5°','180°','90°','120°'],0,''],['ცილები აგებულია:',['ამინომჟავებისგან','ნუკლეოტიდებისგან','ცხიმოვანი მჟავებისგან','გლუკოზისგან'],0,''],['მემბრანა შედგება:',['ფოსფოლიპიდების ორმაგი შრისგან','ცელულოზისგან','დნმ-ისგან','წყლისგან'],0,''],['ენერგიის უჯრედული „ვალუტა“:',['ATP','DNA','NaCl','O₂'],0,'']],
 scale:[['ერითროციტის ზომა დაახლოებით:',['7 μm','7 მმ','7 ნმ','70 μm'],0,''],['ვირუსი ბაქტერიაზე:',['~10–20-ჯერ პატარაა','დიდია','ტოლია','1000-ჯერ დიდია'],0,''],['1 μm = ?',['1000 ნმ','1 მმ','100 ნმ','10 ნმ'],0,'']],
 dna:[['A წყვილდება:',['T-სთან','G-სთან','C-სთან','U-სთან'],0,''],['G-C წყვილს აქვს:',['3 წყალბადური ბმა','2','1','4'],0,''],['ადამიანის გენომი ≈',['3.2 მილიარდი წყვილი','46 წყვილი','20 000 წყვილი','1 ტრილიონი'],0,''],['დნმ-პოლიმერაზა აშენებს:',['5′ → 3′','3′ → 5′','ორივე მხრივ','შემთხვევით'],0,'']],
 central:[['რნმ-ში T-ს ნაცვლად არის:',['U','A','G','C'],0,''],['კოდონი შედგება:',['3 ნუკლეოტიდისგან','1','2','4'],0,''],['START კოდონი:',['AUG','UAA','UGA','GGG'],0,''],['ერთი ნუკლეოტიდის ჩამატება იწვევს:',['წაკითხვის ჩარჩოს წანაცვლებას','არაფერს','ერთი ამინომჟავის ცვლას','დნმ-ის გაორმაგებას'],0,'']],
 mitosis:[['მიტოზის შედეგი:',['2 იდენტური დიპლოიდური უჯრედი','4 ჰაპლოიდური','1 უჯრედი','8 უჯრედი'],0,''],['ქრომოსომები ეკვატორზე ლაგდება:',['მეტაფაზაში','პროფაზაში','ანაფაზაში','ტელოფაზაში'],0,''],['გადაჯვარედინება ხდება:',['მეიოზში','მიტოზში','ინტერფაზაში','არასდროს'],0,''],['ადამიანის ქრომოსომები:',['46','23','48','92'],0,'']],
 mendel:[['Aa × Aa-ს ფენოტიპური თანაფარდობა:',['3 : 1','1 : 1','9 : 3 : 3 : 1','1 : 2 : 1'],0,'გენოტიპი 1:2:1.'],['IᴬIᴮ — სისხლის ჯგუფი:',['AB','A','B','0'],0,''],['ორი 0 ჯგუფის მშობლის შვილი:',['მხოლოდ 0','შეიძლება A','შეიძლება AB','ნებისმიერი'],0,''],['AaBb × AaBb:',['9 : 3 : 3 : 1','3 : 1','1 : 1 : 1 : 1','1 : 2 : 1'],0,'']],
 neuro:[['მოსვენების პოტენციალი ≈',['−70 მვ','+70 მვ','0 მვ','−5 მვ'],0,''],['მიელინი:',['აჩქარებს იმპულსს','ანელებს','აჩერებს','არაფერს შვრება'],0,''],['ძლიერი სტიმული იძლევა:',['უფრო ხშირ, იმავე სიმაღლის იმპულსებს','უფრო მაღალ იმპულსს','უფრო ნელს','არაფერს'],0,'„ყველაფერი ან არაფერი“.'],['იმპულსის დროს შიგნით შედის:',['Na⁺','Cl⁻','K⁺','Ca²⁺ მხოლოდ'],0,'']],
 heart:[['წუთმოცულობა = ?',['პულსი × დარტყმითი მოცულობა','პულსი + წნევა','წნევა / პულსი','მხოლოდ პულსი'],0,''],['QRS კომპლექსი ასახავს:',['პარკუჭების აგზნებას','წინაგულებს','აღდგენას','სუნთქვას'],0,''],['მცირე წრე მიდის:',['ფილტვებში','ტვინში','ღვიძლში','ფეხებში'],0,''],['მოსვენების ნორმალური პულსი:',['60–100','20–40','150–200','100–150'],0,'']],
 enzyme:[['Km არის [S], როცა:',['v = Vmax/2','v = Vmax','v = 0','v = 2Vmax'],0,''],['კონკურენტული ინჰიბიტორი ზრდის:',['Km-ს','Vmax-ს','ტემპერატურას','pH-ს'],0,''],['მაღალ ტემპერატურაზე ფერმენტი:',['დენატურირდება','ძლიერდება უსასრულოდ','იყოფა','უცვლელია'],0,''],['ფერმენტი ამცირებს:',['აქტივაციის ენერგიას','რეაქციის სითბოს','წონასწორობის მუდმივას','პროდუქტის რაოდენობას'],0,'']],
 photo:[['ფოტოსინთეზის პროდუქტები:',['გლუკოზა და O₂','CO₂ და H₂O','ATP მხოლოდ','N₂'],0,''],['ქლოროფილი ყველაზე ნაკლებად შთანთქავს:',['მწვანეს','წითელს','ლურჯს','იისფერს'],0,''],['ლიმიტირებადი ფაქტორი:',['ყველაზე ნაკლული რესურსი','ყველაზე უხვი','ტემპერატურა ყოველთვის','წყალი ყოველთვის'],0,''],['უჯრედული სუნთქვა ხდება:',['მიტოქონდრიაში','ქლოროპლასტში','ბირთვში','კედელში'],0,'']],
 immune:[['R₀ = 4. კოლექტიური იმუნიტეტის ზღვარი:',['75%','25%','40%','100%'],0,'1 − 1/4.'],['ეპიდემია ქრება, როცა:',['ეფექტური R < 1','R₀ > 1','ყველა ავადაა','ზამთარია'],0,''],['SIR-ში R ნიშნავს:',['გამოჯანმრთელებულს','რისკს','რეპროდუქციას','ვირუსს'],0,''],['წითელას R₀ ≈',['12–18','1.5','3','0.5'],0,'']],
 evo:[['ბუნებრივი გადარჩევის პირობებია:',['ვარიაცია, მემკვიდრეობა, განსხვავებული გადარჩენა','მხოლოდ მუტაცია','სურვილი','შემთხვევითობა'],0,''],['ჭვარტლიან ქერქზე გადარჩება:',['მუქი ფარვანა','ღია','ორივე თანაბრად','არცერთი'],0,''],['ორგანიზმი ეგუება „მიზანმიმართულად“?',['არა — გადარჩევა ფილტრავს არსებულ ვარიაციას','კი','მხოლოდ ცხოველები','მხოლოდ მცენარეები'],0,'']],
 drift:[['დრიფტი უფრო ძლიერია:',['პატარა პოპულაციაში','დიდში','ყოველთვის ერთნაირი','მხოლოდ ბაქტერიებში'],0,''],['p = 0.3-ზე ჰეტეროზიგოტების წილი (ჰ–ვ):',['0.42','0.09','0.49','0.3'],0,'2pq.'],['ნეიტრალური ალელის ფიქსაციის ალბათობა:',['მისი საწყისი სიხშირე','0','1','½'],0,'']],
 eco:[['მელიების პიკი კურდღლების პიკს:',['ჩამორჩება','უსწრებს','ემთხვევა','არ აქვს კავშირი'],0,''],['ლოტკა–ვოლტერას ამონახსნები ფაზურ სივრცეში:',['ჩაკეტილი ციკლებია','წრფეები','სპირალი ნულისკენ','ქაოსი'],0,''],['თუ მელიები გადაშენდა, კურდღლები (მოდელში):',['ექსპონენტურად იზრდება','ქრება','უცვლელია','ირხევა'],0,'']],
 growth:[['ექსპონენტური ზრდისას გაორმაგების დრო:',['ln2 / r','r / 2','2r','1/r²'],0,''],['ლოგისტიკური მრუდის ფორმა:',['S','U','წრფე','ზარი'],0,''],['ზრდის მაქსიმუმი ლოგისტიკურ მოდელში:',['N = K/2','N = K','N = 0','N = 2K'],0,'']],
 tree:[['სიცოცხლე გაჩნდა დაახლოებით:',['3.8 მლრდ წლის წინ','600 მლნ','4.6 მლრდ','10 000'],0,''],['დინოზავრები გადაშენდა:',['66 მლნ წლის წინ','6 მლნ','250 მლნ','1 მლრდ'],0,''],['ყველაზე დიდი გადაშენება:',['პერმული','ცარცული','ორდოვიკული','ჰოლოცენი'],0,''],['ადამიანი დედამიწის 24-საათიან საათზე ჩნდება:',['ბოლო წამებში','შუადღეს','საღამოს 6-ზე','დილით'],0,'']],
 pcr:[['30 PCR ციკლი ≈',['მილიარდი ასლი','30 ასლი','900 ასლი','მილიონი ასლი'],0,'2³⁰.'],['PCR-ის პირველი საფეხური (95 °C):',['დნმ-ის ძაფების გაყოფა','პრაიმერების მიმაგრება','აშენება','გაციება'],0,''],['Cas9-ს სჭირდება სამიზნის შემდეგ:',['PAM (NGG)','AUG','TATA','პოლი-A'],0,''],['CRISPR თავდაპირველად იყო:',['ბაქტერიების იმუნური სისტემა','ადამიანის ფერმენტი','ვირუსი','ხელოვნური მოლეკულა'],0,'']],
 life:[['კონვეის წესით მკვდარი უჯრედი იბადება, თუ მეზობლები:',['ზუსტად 3','2','4+','1'],0,''],['boids-ის წესებში არ შედის:',['ლიდერის მიყოლა','გამოყოფა','გასწორება','შეკავშირება'],0,'ლიდერი არ არის.'],['„ემერჯენტულობა“ ნიშნავს:',['მარტივი წესებიდან რთული ქცევის აღმოცენებას','გადაშენებას','მუტაციას','სიჩქარეს'],0,'']]};

const host=$('biop');if(!host)return;
window.BIOLAB=SCIPATH.mount({host,key:'bio',title:'ბიოლოგია',accent:'#6fcf8a',accent2:'#d2f5dd',levels:LEVELS,meta:id=>T[id],intro:INTRO,quiz:QUIZ,build:(id,el)=>T[id].build(el),decorate:el=>K.attachXp(el)});
})();
