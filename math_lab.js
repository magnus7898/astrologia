/* math_lab.js — „მათემატიკა: ნულიდან გმირამდე“ (math.html). 26 interactive lessons on five levels, from the number
   line to Fourier epicycles and fractals; uses the shared SCIKIT engine and the SCIPATH learning path. */
(function(){
'use strict';
const K=window.SCIKIT;const {$,esc,clamp,lerp,TAU,fmtN,COL,anim,canvas,sl,bindSl,btns,bindBtns,FX,card,rgba,shade,S3,axes3}=K;
const T={};const reg=t=>T[t.id]=t;
const VI='#a585ef',VL='#d6c6ff';
const r3=x=>Math.round(x*1000)/1000,gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a;};
const sup=n=>String(n).replace(/[-0-9]/g,c=>'⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)]);
/* coordinate plane: grid, axes, labels; returns mappers */
function mplot(g,o){const W=g.W,H=g.H,m=o.m||[10,10,10,10],x0=m[3],y0=m[0],w=W-m[1]-m[3],h=H-m[0]-m[2],[a,b]=o.x,[c,d]=o.y;
  const X=v=>x0+(v-a)/(b-a)*w,Y=v=>y0+h-(v-c)/(d-c)*h,ix=p=>a+(p-x0)/w*(b-a),iy=p=>c+(y0+h-p)/h*(d-c);
  g.fillStyle=o.bg||'#0b0816';g.fillRect(0,0,W,H);
  const st=o.step||niceStep((b-a)/10),sy=o.stepY||niceStep((d-c)/8);
  g.lineWidth=1;g.strokeStyle='rgba(165,133,239,.08)';g.beginPath();
  for(let v=Math.ceil(a/st)*st;v<=b+1e-9;v+=st){g.moveTo(X(v),y0);g.lineTo(X(v),y0+h);}
  for(let v=Math.ceil(c/sy)*sy;v<=d+1e-9;v+=sy){g.moveTo(x0,Y(v));g.lineTo(x0+w,Y(v));}g.stroke();
  g.strokeStyle='rgba(214,198,255,.45)';g.beginPath();if(c<=0&&d>=0){g.moveTo(x0,Y(0));g.lineTo(x0+w,Y(0));}if(a<=0&&b>=0){g.moveTo(X(0),y0);g.lineTo(X(0),y0+h);}g.stroke();
  if(o.labels!==false){g.fillStyle='rgba(179,166,143,.75)';g.font='10px sans-serif';g.textAlign='center';const ly=clamp(Y(0)+12,y0+10,y0+h-2),lx=clamp(X(0)-4,x0+18,x0+w);
    for(let v=Math.ceil(a/st)*st;v<=b+1e-9;v+=st)if(Math.abs(v)>1e-9)g.fillText(+v.toFixed(4),X(v),ly);
    g.textAlign='right';for(let v=Math.ceil(c/sy)*sy;v<=d+1e-9;v+=sy)if(Math.abs(v)>1e-9)g.fillText(+v.toFixed(4),lx,Y(v)+3);}
  return {X,Y,ix,iy,x0,y0,w,h};}
function niceStep(r){const p=Math.pow(10,Math.floor(Math.log10(r))),f=r/p;return (f<1.5?1:f<3.5?2:f<7.5?5:10)*p;}
function curve(g,M,f,a,b,col,lw,dash){g.strokeStyle=col;g.lineWidth=lw||2;g.setLineDash(dash||[]);g.beginPath();let pen=false,py=null;const n=600;
  for(let i=0;i<=n;i++){const x=a+(b-a)*i/n,y=f(x);if(!isFinite(y)||(py!=null&&Math.abs(M.Y(y)-M.Y(py))>g.H)){pen=false;py=isFinite(y)?y:null;continue;}
    const px=M.X(x),pyy=M.Y(y);pen?g.lineTo(px,pyy):g.moveTo(px,pyy);pen=true;py=y;}g.stroke();g.setLineDash([]);g.lineWidth=1;}
const dot=(g,x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();};
function arrow(g,x1,y1,x2,y2,c,w){const a=Math.atan2(y2-y1,x2-x1),hl=Math.min(10,Math.hypot(x2-x1,y2-y1)*.4);g.strokeStyle=c;g.fillStyle=c;g.lineWidth=w||2;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-hl*Math.cos(a-.4),y2-hl*Math.sin(a-.4));g.lineTo(x2-hl*Math.cos(a+.4),y2-hl*Math.sin(a+.4));g.closePath();g.fill();g.lineWidth=1;}
const txt=(g,s,x,y,c,f,al)=>{g.fillStyle=c||COL.ink;g.font=f||'12px sans-serif';g.textAlign=al||'center';g.fillText(s,x,y);};
const drag=(c,on)=>{let d=false;c.style.touchAction='none';c.addEventListener('pointerdown',e=>{d=true;c.setPointerCapture(e.pointerId);on(c.pt(e),'down');});
  c.addEventListener('pointermove',e=>{if(d)on(c.pt(e),'move');});const up=()=>{d=false;};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);};

/* ═══════════════════ LEVEL 0 · ნული ═══════════════════ */
reg({id:'num',ico:'➕',t:'რიცხვითი წრფე',s:'დადებითი, უარყოფითი, მოქმედებები',
 build(root){
  root.innerHTML=`<div id="nuC"></div><div class="arow"><div class="acol"><div class="actl">${sl('nuA','a',-9,9,1,3)}${sl('nuB','b',-9,9,1,-5)}
    <div>მოქმედება: ${btns('nuO',[['+','a + b'],['-','a − b'],['*','a × b']],'+')}</div><div class="abt"><button id="nuP" class="on">▶ თავიდან</button></div></div></div>
    <div class="acol"><div id="nuI" class="ainfo"></div></div></div>
   <div class="cards3"><div><b>ℕ ნატურალური</b>1, 2, 3 … — დასათვლელად.</div><div><b>ℤ მთელი</b>… −2, −1, 0, 1, 2 … — ვალი და სიცივეც რიცხვია.</div><div><b>ℚ რაციონალური</b>p/q — ნებისმიერი წილადი: ½, −0.75, 0.(3).</div><div><b>ℝ ნამდვილი</b>წრფის ყველა წერტილი, მათ შორის √2 და π, რომლებიც წილადად არ ჩაიწერება.</div><div><b>ℂ კომპლექსური</b>a + bi — წრფე სიბრტყედ იქცევა (დონე 3).</div></div>
   ${card('წესები',FX([['a − b = a + (−b)','გამოკლება = საპირისპირო რიცხვის მიმატება',{s:[['−b','b-ს საპირისპირო']],w:'ამიტომ 3 − (−5) = 3 + 5 = 8: ორი მინუსი პლიუსი ხდება.'}],
     ['(−a)·(−b) = a·b','მინუსზე მინუსი პლიუსია',{s:[],w:'უარყოფითზე გამრავლება წრფეზე მიმართულების შებრუნებაა — ორჯერ შებრუნებით ისევ წინ ვიყურებით.'}],
     ['|a| = მანძილი 0-მდე','მოდული ყოველთვის ≥ 0',{s:[['|a|','მოდული (აბსოლუტური მნიშვნელობა)']],w:'|−7| = 7, რადგან −7 ნულიდან 7 ერთეულითაა დაშორებული.'}],
     ['a + b = b + a ;  a·b = b·a','გადანაცვლებადობა',{s:[],w:'რიგი არ მოქმედებს შეკრებასა და გამრავლებაზე, მაგრამ მოქმედებს გამოკლებასა და გაყოფაზე.'}],
     ['a·(b + c) = a·b + a·c','განრიგებადობა',{s:[],w:'ფრჩხილების გახსნის საფუძველი — მთელი ალგებრა ამაზე დგას.'}]]))}`;
  const c=canvas($('nuC'),860,200),g=c.g;let A=3,B=-5,op='+',t0=performance.now();
  bindSl('nuA',v=>{A=v;t0=performance.now();});bindSl('nuB',v=>{B=v;t0=performance.now();});bindBtns(root,'nuO',k=>{op=k;t0=performance.now();});$('nuP').onclick=()=>t0=performance.now();
  anim(()=>{const res=op==='+'?A+B:op==='-'?A-B:A*B,R=Math.max(10,Math.abs(res)+1,Math.abs(A)+1),X=v=>40+(v+R)/(2*R)*(g.W-80),Y=120;
    g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);g.strokeStyle='rgba(214,198,255,.5)';g.beginPath();g.moveTo(20,Y);g.lineTo(g.W-20,Y);g.stroke();
    const step=R>30?10:R>15?5:1;for(let v=-R;v<=R;v++){if(v%step)continue;g.strokeStyle=v===0?VL:'rgba(214,198,255,.35)';g.beginPath();g.moveTo(X(v),Y-(v===0?10:5));g.lineTo(X(v),Y+(v===0?10:5));g.stroke();txt(g,v,X(v),Y+24,v<0?'#e8a090':v>0?'#8fd8a8':VL,'11px sans-serif');}
    const t=(performance.now()-t0)/1000;let jumps=[];
    if(op==='*'){const n=Math.abs(B),s=B<0?-A:A;for(let i=0;i<n;i++)jumps.push([i*s,(i+1)*s]);}else{jumps=[[0,A],[A,res]];}
    jumps.forEach(([p,q],i)=>{const k=clamp(t*1.4-i*0.9,0,1);if(k<=0)return;const x1=X(p),x2=X(lerp(p,q,k)),hgt=24+Math.min(60,Math.abs(X(q)-X(p))*.25),col=op!=='*'&&i===1?(op==='-'?'#e8705a':'#6fcf8a'):VI;
      g.strokeStyle=col;g.lineWidth=2.4;g.beginPath();for(let s=0;s<=1.0001;s+=.04){const u=s*k,xx=lerp(x1,X(q),u),yy=Y-Math.sin(Math.PI*u)*hgt;s?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.stroke();g.lineWidth=1;
      if(k>=1){const lab=op==='*'?(B<0?-A:A):i===0?A:(op==='-'?-B:B);txt(g,(lab>0?'+':'')+lab,(x1+X(q))/2,Y-hgt-6,col,'600 12px sans-serif');}});
    const done=t*1.4>jumps.length*0.9+0.2;dot(g,X(0),Y,5,VL);if(done){g.shadowColor=VI;g.shadowBlur=16;dot(g,X(res),Y,8,'#ecd59a');g.shadowBlur=0;txt(g,res,X(res),Y+44,'#ecd59a','600 16px Cinzel,serif');}
    $('nuI').innerHTML=`<div class="big">${A} ${op==='*'?'×':op==='-'?'−':'+'} ${B<0?'('+B+')':B} = ${res}</div><div class="hint">${op==='-'?`გამოკლება = საპირისპიროს მიმატება: ${A} + (${-B})`:op==='*'?`${Math.abs(B)} ნახტომი, თითო ${B<0?-A:A}-ის ზომის${B<0?' (უარყოფითი b ატრიალებს მიმართულებას)':''}`:'ნახტომი მარჯვნივ = დადებითი, მარცხნივ = უარყოფითი'}</div>`;});
 }});

reg({id:'frac',ico:'½',t:'წილადები და პროცენტები',s:'ნაწილი, საერთო მნიშვნელი, %',
 build(root){
  root.innerHTML=`<div id="frC"></div><div class="arow"><div class="acol"><div class="actl">${sl('frA','პირველის მრიცხველი',0,12,1,1)}${sl('frB','პირველის მნიშვნელი',1,12,1,2)}${sl('frC2','მეორის მრიცხველი',0,12,1,1)}${sl('frD','მეორის მნიშვნელი',1,12,1,3)}
    <div>${btns('frO',[['+','შეკრება'],['-','გამოკლება'],['*','გამრავლება'],['/','გაყოფა']],'+')}</div></div></div><div class="acol"><div id="frI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['a/b + c/d = (a·d + c·b) / (b·d)','შეკრება საერთო მნიშვნელით',{s:[['b·d','საერთო მნიშვნელი (ან უმცირესი საერთო ჯერადი)']],w:'ნაჭრები ჯერ ერთნაირ ზომაზე უნდა დავჭრათ — მხოლოდ მაშინ ითვლება.'}],
     ['a/b · c/d = a·c / (b·d)','გამრავლება — „ნაწილის ნაწილი“',{s:[],w:'½-ის ⅓ არის ⅙: ნახევარი ჯერ სამად დავჭერით.'}],['a/b : c/d = a/b · d/c','გაყოფა = შებრუნებულზე გამრავლება',{s:[],w:'რამდენი ⅓ ეტევა ½-ში? ½·3 = 1.5.'}],
     ['p% = p/100','პროცენტი — ასის წილი',{s:[],w:'20%-იანი ფასდაკლება = ფასი × 0.8; 20%-ით ზრდა = × 1.2. ორი 10%-იანი ზრდა 21%-ია და არა 20%.'}],
     ['a/b = (a·k)/(b·k)','ტოლი წილადები',{s:[['k','ნებისმიერი არანულოვანი რიცხვი']],w:'შეკვეცა: მრიცხველიც და მნიშვნელიც გავყოთ მათ უდიდეს საერთო გამყოფზე.'}]]))}`;
  const c=canvas($('frC'),860,250),g=c.g;let a=1,b=2,cc=1,d=3,op='+';
  const pie=(cx,cy,r,n,dd,col)=>{const whole=Math.max(1,Math.ceil(n/dd));for(let w=0;w<whole;w++){const x=cx+w*(r*2.2);g.fillStyle='rgba(255,255,255,.04)';g.beginPath();g.arc(x,cy,r,0,TAU);g.fill();
      const k=clamp(n-w*dd,0,dd);for(let i=0;i<dd;i++){const a0=-Math.PI/2+i*TAU/dd,a1=a0+TAU/dd;g.beginPath();g.moveTo(x,cy);g.arc(x,cy,r,a0,a1);g.closePath();if(i<k){g.fillStyle=col;g.fill();}g.strokeStyle='#0b0816';g.lineWidth=2;g.stroke();}g.lineWidth=1;}};
  const draw=()=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);const res=op==='+'?[a*d+cc*b,b*d]:op==='-'?[a*d-cc*b,b*d]:op==='*'?[a*cc,b*d]:[a*d,b*cc];
    pie(70,80,52,a,b,'#a585ef');txt(g,`${a}/${b}`,70,160,VL,'600 16px Cinzel,serif');pie(300,80,52,cc,d,'#5fc8d8');txt(g,`${cc}/${d}`,300,160,'#9fe6f0','600 16px Cinzel,serif');
    /* common-denominator bars */
    const L=b*d/gcd(b,d),bx=40,bw=g.W-80;[[a*L/b,'#a585ef',190],[cc*L/d,'#5fc8d8',222]].forEach(([n,col,y])=>{for(let i=0;i<L;i++){g.fillStyle=i<n?col:'rgba(255,255,255,.05)';g.fillRect(bx+i*bw/L+1,y,bw/L-2,22);}});
    txt(g,`საერთო მნიშვნელი: ${L} ნაწილი`,g.W-40,184,COL.mid,'11px sans-serif','right');
    const gg=gcd(res[0],res[1])||1,num=res[0]/gg,den=res[1]/gg,val=res[1]?res[0]/res[1]:NaN,sym={'+':'+','-':'−','*':'×','/':':'}[op];
    $('frI').innerHTML=`<div class="big">${a}/${b} ${sym} ${cc}/${d} = ${res[1]?`${res[0]}/${res[1]}${gg>1?` = ${num}/${den}`:''}`:'—'}</div><div class="kv2"><b>ათწილადი</b><span>${isFinite(val)?r3(val):'ნულზე გაყოფა'}</span><b>პროცენტი</b><span>${isFinite(val)?r3(val*100)+'%':'—'}</span>
      <b>პირველი</b><span>${r3(a/b)} = ${r3(a/b*100)}%</span><b>მეორე</b><span>${r3(cc/d)} = ${r3(cc/d*100)}%</span><b>რომელია მეტი</b><span>${a*d>cc*b?`${a}/${b}`:a*d<cc*b?`${cc}/${d}`:'ტოლია'} (ჯვარედინი: ${a}·${d} vs ${cc}·${b})</span></div>`;};
  bindSl('frA',v=>{a=v;draw();});bindSl('frB',v=>{b=v;draw();});bindSl('frC2',v=>{cc=v;draw();});bindSl('frD',v=>{d=v;draw();});bindBtns(root,'frO',k=>{op=k;draw();});draw();
 }});

reg({id:'pow',ico:'xⁿ',t:'ხარისხები, ფესვები, ლოგარითმები',s:'ექსპონენტური ზრდა · ქაღალდი მთვარემდე',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="pwC"></div><div class="actl">${sl('pwB','ფუძე a',1.1,4,0.1,2)}</div></div>
   <div class="acol"><div id="pwF"></div><div class="actl">${sl('pwN','ქაღალდის მოკეცვა n-ჯერ',0,50,1,10)}</div><div id="pwI" class="ainfo"></div></div></div>
   ${card('სამი სახე ერთი კავშირის',FX([['aⁿ = x  ⇔  n = logₐx  ⇔  a = ⁿ√x','ერთი ტოლობის სამი ამოხსნა',{s:[['a','ფუძე'],['n','მაჩვენებელი'],['x','შედეგი']],w:'ხარისხი პასუხობს „რამდენი გამოვა?“, ფესვი — „რა გავამრავლეთ?“, ლოგარითმი — „რამდენჯერ გავამრავლეთ?“.'}],
     ['aᵐ·aⁿ = aᵐ⁺ⁿ ;  (aᵐ)ⁿ = aᵐⁿ','ხარისხის წესები',{s:[],w:'2³·2⁴ = 2⁷ — ვთვლით რამდენი ორიანი გადავამრავლეთ.'}],['a⁰ = 1 ;  a⁻ⁿ = 1/aⁿ','ნული და უარყოფითი მაჩვენებელი',{s:[],w:'ყოველი ნაბიჯი ქვევით a-ზე გაყოფაა: 2² = 4, 2¹ = 2, 2⁰ = 1, 2⁻¹ = ½.'}],
     ['a^(1/n) = ⁿ√a','წილადი მაჩვენებელი = ფესვი',{s:[],w:'9^(1/2) = 3, რადგან (9^(1/2))² = 9¹.'}],['log(x·y) = log x + log y','ლოგარითმი გამრავლებას შეკრებად აქცევს',{s:[],w:'ამიტომ გამოიგონეს სახაზავი-კალკულატორი და დეციბელი — დიდ რიცხვებს „ამოკლებს“.'}],
     ['a·10ⁿ','სამეცნიერო ჩანაწერი',{s:[['1 ≤ a < 10','მანტისა']],w:'სინათლის სიჩქარე 3·10⁸ მ/წმ, ელექტრონის მასა 9.1·10⁻³¹ კგ.'}]]))}`;
  const c=canvas($('pwC'),420,320),g=c.g,c2=canvas($('pwF'),420,200),h=c2.g;let a=2,n=10;
  const draw=()=>{const M=mplot(g,{x:[-3,6],y:[-3,6],step:1,stepY:1});curve(g,M,x=>x,-3,6,'rgba(255,255,255,.25)',1,[4,4]);curve(g,M,x=>a**x,-3,6,VI,2.4);curve(g,M,x=>x>0?Math.log(x)/Math.log(a):NaN,0.001,6,'#5fc8d8',2.4);curve(g,M,x=>x>=0?Math.pow(x,1/2):NaN,0,6,'#e0a030',1.6,[6,4]);
    txt(g,`y = ${a}ˣ`,M.X(1.6),M.Y(Math.min(5.6,a**1.6+.4)),VL,'600 13px sans-serif');txt(g,`y = log${String(a).replace('.',',')} x`,M.X(4.6),M.Y(Math.log(4.6)/Math.log(a))+18,'#9fe6f0','600 12px sans-serif');txt(g,'y = √x',M.X(5.3),M.Y(Math.sqrt(5.3))-8,'#e0a030','11px sans-serif');txt(g,'სარკე y = x',M.X(4.8),M.Y(5.2),COL.dim,'10px sans-serif');};
  const objs=[[1e-4,'ქაღალდი'],[0.2,'წიგნი'],[1.8,'ადამიანი'],[828,'ბურჯ ხალიფა'],[8849,'ევერესტი'],[4e5,'კოსმოსური სადგური'],[3.84e8,'მთვარე'],[1.5e11,'მზე'],[1e18,'ირმის ნახტომამდე ახლოს']];
  const fold=()=>{const th=1e-4*2**n;h.fillStyle='#0b0816';h.fillRect(0,0,h.W,h.H);const L=v=>30+(Math.log10(v)+5)/(23)*(h.W-60);
    h.strokeStyle='rgba(214,198,255,.3)';h.beginPath();h.moveTo(30,150);h.lineTo(h.W-30,150);h.stroke();objs.forEach(([v,nm],i)=>{h.fillStyle=COL.mid;h.beginPath();h.arc(L(v),150,3,0,TAU);h.fill();h.save();h.translate(L(v),158);h.rotate(.6);txt(h,nm,0,8,COL.dim,'10px sans-serif','left');h.restore();});
    for(let e=-4;e<=18;e+=2)txt(h,'10'+sup(e),L(10**e),142,'rgba(179,166,143,.6)','9px sans-serif');
    const x=L(clamp(th,1e-5,1e18));h.shadowColor=VI;h.shadowBlur=14;h.fillStyle=VL;h.fillRect(x-3,40,6,110);h.shadowBlur=0;txt(h,fmtTh(th),x,32,VL,'600 13px sans-serif');
    const nxt=objs.find(o=>o[0]>th);$('pwI').innerHTML=`<div class="kv2"><b>სისქე</b><span>0.1 მმ · 2${sup(n)} = ${fmtTh(th)}</span><b>შრეები</b><span>${(2**n).toLocaleString('en')}</span>${nxt?`<b>შემდეგი ნიშნული</b><span>${nxt[1]} — კიდევ ${Math.ceil(Math.log2(nxt[0]/th))} მოკეცვა</span>`:''}</div><div class="hint">42 მოკეცვა მთვარემდე წვდება — ასე გამოიყურება ექსპონენტური ზრდა. ყოველი ნაბიჯი წინა ყველა ნაბიჯის ჯამზე მეტს ამატებს.</div>`;};
  const fmtTh=v=>v<1e-2?r3(v*1000)+' მმ':v<1?r3(v*100)+' სმ':v<1e3?r3(v)+' მ':v<1e8?Math.round(v/1e3).toLocaleString('en')+' კმ':(v/1e3).toExponential(2)+' კმ';
  bindSl('pwB',v=>{a=v;draw();},v=>v.toFixed(1));bindSl('pwN',v=>{n=v;fold();});
 }});

reg({id:'prime',ico:'⁂',t:'მარტივი რიცხვები',s:'ერატოსთენეს საცერი · ულამის სპირალი · უსგ',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="prC"></div><div class="actl"><div>${btns('prM',[['sieve','საცერი 1–200'],['ulam','ულამის სპირალი']],'sieve')}</div><div class="abt"><button id="prP" class="on">▶ თავიდან</button></div></div></div>
   <div class="acol"><div class="actl"><div class="calc"><label>რიცხვი<input id="prN" type="number" value="360"></label><label>a<input id="prA" type="number" value="84"></label><label>b<input id="prB" type="number" value="36"></label></div></div><div id="prI" class="ainfo"></div></div></div>
   ${card('ფორმულები და ფაქტები',FX([['p მარტივია ⇔ გამყოფები მხოლოდ 1 და p','2, 3, 5, 7, 11, 13 …',{s:[],w:'1 მარტივი არ არის — თორემ დაშლა ერთადერთი აღარ იქნებოდა.'}],['n = p₁^k₁ · p₂^k₂ · …','არითმეტიკის ძირითადი თეორემა',{s:[],w:'ყოველი რიცხვი მარტივ მამრავლებად ერთადერთი სახით იშლება — მარტივი რიცხვები მათემატიკის „ატომებია“.'}],
     ['უსგ(a,b) = უსგ(b, a mod b)','ევკლიდეს ალგორითმი',{s:[['mod','ნაშთი']],w:'2300 წლის ალგორითმი, რომელიც დღესაც ყველა კრიპტოგრაფიულ ბიბლიოთეკაშია.'}],['a·b = უსგ·უსჯ','უმცირესი საერთო ჯერადი',{s:[],w:'84·36 = 12·252.'}],
     ['π(x) ≈ x / ln x','მარტივი რიცხვების თეორემა',{s:[['π(x)','მარტივების რაოდენობა ≤ x']],w:'მარტივები იშვიათდება, მაგრამ არასდროს მთავრდება (ევკლიდეს მტკიცება: ყველას ნამრავლს + 1 ახალ მარტივს გვაძლევს).'}]]))}`;
  const c=canvas($('prC'),440,440),g=c.g;let mode='sieve',t0=performance.now();const N=200,isP=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true;};
  const ps=[2,3,5,7,11,13];const COLS={2:'#e8705a',3:'#e0a030',5:'#6fcf8a',7:'#5fc8d8',11:'#5a9ae8',13:'#c06ad0'};
  anim(()=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);const t=(performance.now()-t0)/1000;
    if(mode==='sieve'){const cs=g.W/15,rows=Math.ceil(N/15);const k=Math.min(ps.length,Math.floor(t/1.1));
      for(let n=1;n<=N;n++){const i=(n-1)%15,j=Math.floor((n-1)/15),x=i*cs,y=j*cs*0.98+4;let col=null;for(let q=0;q<k;q++){const p=ps[q];if(n!==p&&n%p===0){col=COLS[p];break;}}
        const prime=isP(n)&&(n<=ps[Math.max(0,k-1)]||k>=ps.length);g.fillStyle=col?rgba(col,.18):prime?'rgba(165,133,239,.32)':'rgba(255,255,255,.03)';g.fillRect(x+1,y+1,cs-2,cs*0.98-2);
        txt(g,n,x+cs/2,y+cs*0.6,col?rgba(col,.55):prime?'#fff':n===1?COL.dim:COL.mid,(prime?'600 ':'')+'11px sans-serif');}
      txt(g,k<ps.length?`ვშლით ${ps[Math.max(0,k-1)]||2}-ის ჯერადებს…`:`${[...Array(N).keys()].filter(isP).length} მარტივი რიცხვი 200-მდე`,g.W/2,g.H-6,VL,'12px sans-serif');}
    else{const S=g.W,n=Math.min(40000,Math.floor(300+t*6000)),cs=S/201;let x=0,y=0,dx=1,dy=0,len=1,st=0,turn=0;g.fillStyle=VL;
      for(let i=1;i<=n;i++){if(isP(i)){g.fillRect(S/2+x*cs-0.6,S/2-y*cs-0.6,Math.max(1.2,cs),Math.max(1.2,cs));}x+=dx;y+=dy;st++;if(st===len){st=0;[dx,dy]=[-dy,dx];turn++;if(turn%2===0)len++;}}
      txt(g,'დიაგონალები: მარტივები „უყვართ“ ზოგიერთი კვადრატული ფორმულა',S/2,S-6,COL.mid,'11px sans-serif');}});
  bindBtns(root,'prM',k=>{mode=k;t0=performance.now();});$('prP').onclick=()=>t0=performance.now();
  const fac=n=>{const f={};for(let p=2;p*p<=n;p++)while(n%p===0){f[p]=(f[p]||0)+1;n/=p;}if(n>1)f[n]=(f[n]||0)+1;return f;};
  const info=()=>{const n=Math.floor(+$('prN').value),a=Math.floor(+$('prA').value),b=Math.floor(+$('prB').value);let h='';
    if(n>1&&n<1e12){const f=fac(n),divs=Object.values(f).reduce((s,k)=>s*(k+1),1);h+=`<div class="big">${n} = ${Object.entries(f).map(([p,k])=>p+(k>1?sup(k):'')).join(' · ')}</div><div class="kv2"><b>მარტივია?</b><span>${isP(n)?'✓ კი':'✗ არა'}</span><b>გამყოფების რაოდ.</b><span>${divs}</span></div>`;}
    if(a>0&&b>0&&a<1e12&&b<1e12){let x=a,y=b;const steps=[];while(y){steps.push(`${x} = ${Math.floor(x/y)}·${y} + ${x%y}`);[x,y]=[y,x%y];}
      h+=`<div style="margin-top:8px" class="hint">ევკლიდე:</div><div class="seqbox" style="font-size:12.5px;letter-spacing:0">${steps.join('<br>')}</div><div class="kv2" style="margin-top:6px"><b>უსგ(${a}, ${b})</b><span>${x}</span><b>უსჯ</b><span>${a/x*b}</span></div>`;}
    $('prI').innerHTML=h;};['prN','prA','prB'].forEach(i=>$(i).oninput=info);info();
 }});

/* ═══════════════════ LEVEL 1 · ალგებრა და გეომეტრია ═══════════════════ */
reg({id:'lin',ico:'╱',t:'წრფივი ფუნქცია და სისტემები',s:'y = kx + b · დახრა · გადაკვეთა',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="liC"></div></div><div class="acol"><div class="actl">${sl('liK','k₁ (დახრა)',-4,4,0.25,1)}${sl('liB','b₁',-5,5,0.5,1)}
    <label class="hint"><input type="checkbox" id="liT" checked> მეორე წრფე (სისტემა)</label>${sl('liK2','k₂',-4,4,0.25,-0.5)}${sl('liB2','b₂',-5,5,0.5,3)}</div><div id="liI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['y = k·x + b','წრფის განტოლება',{s:[['k','დახრა: x-ის 1-ით ზრდაზე y რამდენით იზრდება'],['b','y-ღერძთან გადაკვეთა']],w:'ტაქსის ფასი: b — ჩაჯდომა, k — თითო კილომეტრი.'}],
     ['k = (y₂ − y₁)/(x₂ − x₁)','დახრა ორი წერტილით',{s:[],w:'„ასვლა გაყოფილი გასვლაზე“ — სამკუთხედი ნახაზზე.'}],['k₁ = k₂ ⇒ პარალელური','ერთნაირი დახრა',{s:[],w:'სისტემას ამონახსნი არ აქვს (ან უსასრულოდ ბევრი, თუ b-ც ტოლია).'}],
     ['k₁·k₂ = −1 ⇒ მართობული','90°-იანი კუთხე',{s:[],w:'დახრა 2-ის მართობულს აქვს −½.'}],['x = (b₂ − b₁)/(k₁ − k₂)','გადაკვეთის წერტილი',{s:[],w:'ორი უცნობის სისტემის ამოხსნა გეომეტრიულად — ორი წრფის შეხვედრაა.'}]]))}`;
  const c=canvas($('liC'),440,400),g=c.g;let k=1,b=1,k2=-.5,b2=3,two=true;
  const draw=()=>{const M=mplot(g,{x:[-8,8],y:[-7,7],step:1,stepY:1});curve(g,M,x=>k*x+b,-8,8,VI,2.6);
    const x1=-b/k;dot(g,M.X(0),M.Y(b),5,VL);if(k){dot(g,M.X(x1),M.Y(0),4,'#e0a030');}
    const px=1,py=k*px+b;g.strokeStyle='#6fcf8a';g.setLineDash([4,3]);g.beginPath();g.moveTo(M.X(px),M.Y(py));g.lineTo(M.X(px+1),M.Y(py));g.lineTo(M.X(px+1),M.Y(py+k));g.stroke();g.setLineDash([]);txt(g,'1',M.X(px+.5),M.Y(py)+(k>=0?14:-6),'#6fcf8a','11px sans-serif');txt(g,'k = '+k,M.X(px+1)+20,M.Y(py+k/2)+4,'#6fcf8a','11px sans-serif','left');
    let h=`<div class="big">y = ${k}x ${b<0?'− '+(-b):'+ '+b}</div><div class="kv2"><b>y-ღერძთან</b><span>(0; ${b})</span><b>x-ღერძთან</b><span>${k?`(${r3(x1)}; 0)`:'არ კვეთს'}</span><b>კუთხე</b><span>${r3(Math.atan(k)*180/Math.PI)}°</span></div>`;
    if(two){curve(g,M,x=>k2*x+b2,-8,8,'#5fc8d8',2.2);if(k!==k2){const xi=(b2-b)/(k-k2),yi=k*xi+b;g.shadowColor='#ecd59a';g.shadowBlur=14;dot(g,M.X(xi),M.Y(yi),6,'#ecd59a');g.shadowBlur=0;
        h+=`<div style="margin-top:8px">სისტემა: <b>y = ${k}x + ${b}</b>, <b>y = ${k2}x + ${b2}</b><br>ამონახსნი: <b style="color:#ecd59a">x = ${r3(xi)}, y = ${r3(yi)}</b>${Math.abs(k*k2+1)<1e-9?' · წრფეები მართობულია ⟂':''}</div>`;}
      else h+=`<div style="margin-top:8px" class="bad">k₁ = k₂ — წრფეები პარალელურია, ${b===b2?'ემთხვევა (უსასრულო ამონახსნი)':'ამონახსნი არ არსებობს'}.</div>`;}
    $('liI').innerHTML=h;};
  bindSl('liK',v=>{k=v;draw();});bindSl('liB',v=>{b=v;draw();});bindSl('liK2',v=>{k2=v;draw();});bindSl('liB2',v=>{b2=v;draw();});$('liT').onchange=e=>{two=e.target.checked;draw();};draw();
 }});

reg({id:'quad',ico:'∪',t:'კვადრატული განტოლება',s:'პარაბოლა · დისკრიმინანტი · ფესვები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="quC"></div></div><div class="acol"><div class="actl">${sl('quA','a',-3,3,0.1,1)}${sl('quB','b',-8,8,0.5,-2)}${sl('quc','c',-8,8,0.5,-3)}</div><div id="quI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['ax² + bx + c = 0','კვადრატული განტოლება',{s:[['a ≠ 0','უფროსი კოეფიციენტი']],w:'a-ს ნიშანი წყვეტს, პარაბოლა ზევით იხსნება (a>0) თუ ქვევით.'}],['D = b² − 4ac','დისკრიმინანტი',{s:[['D','გვეუბნება, რამდენი ფესვია']],w:'D>0 — ორი ფესვი, D=0 — ერთი (წვერო ღერძზეა), D<0 — ნამდვილი ფესვი არაა (კომპლექსურია).'}],
     ['x = (−b ± √D) / 2a','ფესვების ფორმულა',{s:[],w:'გამოიყვანება სრული კვადრატის გამოყოფით.'}],['x₀ = −b/2a ;  y₀ = −D/4a','წვერო',{s:[],w:'სიმეტრიის ღერძი x = x₀ — ფესვები მისგან თანაბრადაა დაშორებული.'}],
     ['x₁ + x₂ = −b/a ;  x₁·x₂ = c/a','ვიეტის თეორემა',{s:[],w:'ფესვების ჯამი და ნამრავლი ამოხსნის გარეშეც ცნობილია.'}],['a(x − x₀)² + y₀','სრული კვადრატის ფორმა',{s:[],w:'ცხადად ჩანს წვერო და პარაბოლის გადაადგილება.'}]]))}`;
  const c=canvas($('quC'),440,400),g=c.g;let a=1,b=-2,cc=-3;
  const draw=()=>{const M=mplot(g,{x:[-8,8],y:[-10,10],step:1,stepY:2});const f=x=>a*x*x+b*x+cc;
    if(Math.abs(a)<1e-9){curve(g,M,f,-8,8,VI,2.6);$('quI').innerHTML='<div class="bad">a = 0 — ეს უკვე წრფივი განტოლებაა.</div>';return;}
    const D=b*b-4*a*cc,x0=-b/(2*a),y0=-D/(4*a);g.strokeStyle='rgba(224,160,48,.5)';g.setLineDash([5,4]);g.beginPath();g.moveTo(M.X(x0),0);g.lineTo(M.X(x0),g.H);g.stroke();g.setLineDash([]);
    if(D>0){const s=Math.sqrt(D);g.fillStyle='rgba(165,133,239,.12)';g.beginPath();const r1=(-b-s)/(2*a),r2=(-b+s)/(2*a),lo=Math.min(r1,r2),hi=Math.max(r1,r2);for(let i=0;i<=60;i++){const x=lo+(hi-lo)*i/60;i?g.lineTo(M.X(x),M.Y(f(x))):g.moveTo(M.X(x),M.Y(f(x)));}g.closePath();g.fill();}
    curve(g,M,f,-8,8,VI,2.6);dot(g,M.X(x0),M.Y(y0),5,'#e0a030');dot(g,M.X(0),M.Y(cc),4,'#5fc8d8');
    let roots='';if(D>1e-12){const s=Math.sqrt(D),r1=(-b-s)/(2*a),r2=(-b+s)/(2*a);[r1,r2].forEach(r=>{g.shadowColor='#ecd59a';g.shadowBlur=12;dot(g,M.X(r),M.Y(0),6,'#ecd59a');g.shadowBlur=0;});roots=`x₁ = ${r3(Math.min(r1,r2))}, x₂ = ${r3(Math.max(r1,r2))}`;}
    else if(Math.abs(D)<=1e-12){dot(g,M.X(x0),M.Y(0),6,'#ecd59a');roots=`x = ${r3(x0)} (ორმაგი)`;}
    else{const re=x0,im=Math.sqrt(-D)/(2*Math.abs(a));roots=`ნამდვილი ფესვი არ არის · კომპლექსური: ${r3(re)} ± ${r3(im)}i`;}
    $('quI').innerHTML=`<div class="big">${a}x² ${b<0?'− '+(-b):'+ '+b}x ${cc<0?'− '+(-cc):'+ '+cc} = 0</div><div class="kv2"><b>D = b² − 4ac</b><span class="${D>0?'ok':D<0?'bad':''}">${r3(b*b)} − ${r3(4*a*cc)} = ${r3(D)}</span><b>ფესვები</b><span>${roots}</span><b>წვერო</b><span>(${r3(x0)}; ${r3(y0)})</span><b>ვიეტი</b><span>ჯამი ${r3(-b/a)}, ნამრავლი ${r3(cc/a)}</span><b>სრული კვადრატი</b><span>${a}(x ${x0>0?'− '+r3(x0):'+ '+r3(-x0)})² ${y0<0?'− '+r3(-y0):'+ '+r3(y0)}</span></div>`;};
  bindSl('quA',v=>{a=v;draw();},v=>v.toFixed(1));bindSl('quB',v=>{b=v;draw();});bindSl('quc',v=>{cc=v;draw();});
 }});

reg({id:'geo',ico:'△',t:'პითაგორა და სამკუთხედები',s:'ანიმირებული მტკიცება · ფართობები',
 build(root){
  root.innerHTML=`<div id="geC"></div><div class="arow"><div class="acol"><div class="actl">${sl('geA','კათეტი a',1,6,0.1,3)}${sl('geB','კათეტი b',1,6,0.1,4)}<div class="abt"><button id="geP" class="on">▶ მტკიცების ანიმაცია</button></div></div></div><div class="acol"><div id="geI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['a² + b² = c²','პითაგორას თეორემა',{s:[['a, b','კათეტები'],['c','ჰიპოტენუზა']],w:'ანიმაციაში ოთხი ერთნაირი სამკუთხედი დიდ კვადრატში გადაადგილდება: დარჩენილი ფართობი ჯერ c²-ია, მერე a² + b². ფართობი არ შეცვლილა — ესე იგი ტოლია.'}],
     ['S = a·h / 2','სამკუთხედის ფართობი',{s:[['h','სიმაღლე a-ზე']],w:'სამკუთხედი მართკუთხედის ნახევარია.'}],['α + β + γ = 180°','კუთხეების ჯამი',{s:[],w:'ბრტყელ სიბრტყეზე. სფეროზე ჯამი 180°-ზე მეტია!'}],['S = √(p(p−a)(p−b)(p−c))','ჰერონის ფორმულა',{s:[['p','ნახევარპერიმეტრი']],w:'ფართობი მხოლოდ გვერდებით, სიმაღლის გარეშე.'}],
     ['c² = a² + b² − 2ab·cos γ','კოსინუსების თეორემა',{s:[],w:'პითაგორას განზოგადება ნებისმიერ სამკუთხედზე: γ = 90° ⇒ cos γ = 0.'}],['a/sin α = b/sin β = c/sin γ = 2R','სინუსების თეორემა',{s:[['R','შემოხაზული წრის რადიუსი']],w:'გეოდეზია და ნავიგაცია ამაზეა აგებული.'}]]))}`;
  const c=canvas($('geC'),860,360),g=c.g;let a=3,b=4,t0=performance.now();
  bindSl('geA',v=>a=v,v=>v.toFixed(1));bindSl('geB',v=>b=v,v=>v.toFixed(1));$('geP').onclick=()=>t0=performance.now();
  anim(()=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);const s=a+b,S=300/s,ox=60,oy=30,cc=Math.hypot(a,b);
    let k=clamp(((performance.now()-t0)/1000-1)/2.4,0,1);k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    const P=(x,y)=>[ox+x*S,oy+y*S];g.strokeStyle='rgba(214,198,255,.6)';g.strokeRect(ox,oy,s*S,s*S);
    /* configuration A: tilted square c² in the middle; B: a² and b² squares */
    const triA=[[[0,0],[a,0],[0,b]],[[s,0],[a,0],[s,a]],[[s,s],[s,a],[b,s]],[[0,s],[0,b],[b,s]]];
    const triB=[[[0,0],[a,0],[0,b]],[[a,b],[a,0],[0,b]],[[a,b],[s,b],[a,s]],[[s,s],[s,b],[a,s]]];
    const cols=['#a585ef','#7f6ad0','#5fc8d8','#4aa0b0'];
    /* fill hole first */
    if(k<.5){g.fillStyle=rgba('#ecd59a',.25*(1-2*k));g.beginPath();[[a,0],[s,a],[b,s],[0,b]].forEach((p,i)=>{const q=P(...p);i?g.lineTo(...q):g.moveTo(...q);});g.closePath();g.fill();}
    else{g.fillStyle=rgba('#ecd59a',.25*(2*k-1));g.fillRect(...P(0,b),a*S,a*S);g.fillRect(...P(a,0),b*S,b*S);}
    for(let i=0;i<4;i++){g.fillStyle=rgba(cols[i],.85);g.strokeStyle='#0b0816';g.beginPath();for(let j=0;j<3;j++){const x=lerp(triA[i][j][0],triB[i][j][0],k),y=lerp(triA[i][j][1],triB[i][j][1],k);const q=P(x,y);j?g.lineTo(...q):g.moveTo(...q);}g.closePath();g.fill();g.stroke();}
    if(k<.05)txt(g,'c²',...P(s/2,s/2+.2),'#ecd59a','600 22px Cinzel,serif');if(k>.95){txt(g,'a²',...P(a/2,b+a/2+.2),'#ecd59a','600 20px Cinzel,serif');txt(g,'b²',...P(a+b/2,b/2+.2),'#ecd59a','600 20px Cinzel,serif');}
    /* right side: the triangle itself with squares on sides */
    const bx=520,by=290,u=Math.min(26,200/Math.max(a,b,cc));g.save();g.translate(bx,by);
    const A=[0,0],B=[b*u,0],C=[0,-a*u];g.fillStyle='rgba(165,133,239,.35)';g.beginPath();g.moveTo(...A);g.lineTo(...B);g.lineTo(...C);g.closePath();g.fill();g.strokeStyle=VL;g.stroke();
    g.strokeStyle='rgba(236,213,154,.6)';g.strokeRect(-a*u,-a*u,a*u,a*u);g.strokeRect(0,0,b*u,b*u);
    g.beginPath();g.moveTo(...C);g.lineTo(C[0]+a*u,C[1]-b*u);g.lineTo(B[0]+a*u,B[1]-b*u);g.lineTo(...B);g.stroke();
    txt(g,'a = '+a.toFixed(1),-a*u/2,-a*u/2+4,'#ecd59a','12px sans-serif');txt(g,'b = '+b.toFixed(1),b*u/2,b*u/2+4,'#ecd59a','12px sans-serif');txt(g,'c = '+cc.toFixed(2),b*u/2+a*u/2+12,-a*u/2-b*u/2,'#ecd59a','12px sans-serif');g.restore();
    $('geI').innerHTML=`<div class="big">${a.toFixed(1)}² + ${b.toFixed(1)}² = ${cc.toFixed(2)}²</div><div class="kv2"><b>a² + b²</b><span>${r3(a*a)} + ${r3(b*b)} = ${r3(a*a+b*b)}</span><b>ჰიპოტენუზა c</b><span>${r3(cc)}</span><b>ფართობი</b><span>${r3(a*b/2)}</span><b>კუთხეები</b><span>90°, ${r3(Math.atan(a/b)*180/Math.PI)}°, ${r3(Math.atan(b/a)*180/Math.PI)}°</span></div><div class="hint">სცადე 3–4–5, 5–12–13: მთელი რიცხვების „პითაგორას სამეულები“.</div>`;});
 }});

reg({id:'trig',ico:'∿',t:'ტრიგონომეტრია',s:'ერთეულოვანი წრე · სინუსოიდა · tan',
 build(root){
  root.innerHTML=`<div id="trC"></div><div class="arow"><div class="acol"><div class="actl">${sl('trS','ბრუნვის სიჩქარე',0,2,0.05,0.5)}<div class="hint">ან გადაათრიე წერტილი წრეზე</div><div>${btns('trU',[['deg','გრადუსი'],['rad','რადიანი']],'deg')}</div></div></div><div class="acol"><div id="trI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['sin α = მოპირდ./ჰიპ. ; cos α = მიმდ./ჰიპ.','მართკუთხა სამკუთხედში',{s:[],w:'ერთეულოვან წრეზე ჰიპოტენუზა 1-ია, ამიტომ წერტილის კოორდინატები უბრალოდ (cos α; sin α).'}],
     ['sin²α + cos²α = 1','ძირითადი იგივეობა',{s:[],w:'პითაგორა ერთეულოვან წრეზე.'}],['tg α = sin α / cos α','ტანგენსი',{s:[],w:'წრფის დახრა, რომელიც α კუთხით ადის. 90°-ზე უსასრულობაში მიდის.'}],['π რად = 180°','რადიანი',{s:[],w:'1 რადიანი — კუთხე, რომლის რკალი რადიუსის ტოლია. 2π რადიანი = სრული წრე.'}],
     ['sin(α + β) = sin α·cos β + cos α·sin β','შეკრების ფორმულა',{s:[],w:'აქედან მიიღება ყველა ორმაგი კუთხის ფორმულა.'}],['y = A·sin(ωt + φ)','ჰარმონიული რხევა',{s:[['A','ამპლიტუდა'],['ω','კუთხური სიხშირე'],['φ','ფაზა']],w:'ბგერა, სინათლე, ცვლადი დენი — ყველაფერი სინუსოიდებად იშლება (დონე 4: ფურიე).'}]]))}`;
  const c=canvas($('trC'),860,330),g=c.g;let sp=.5,ang=.6,unit='deg';const hist=[];
  drag(c,p=>{const cx=160,cy=165;ang=Math.atan2(cy-p[1],p[0]-cx);if(ang<0)ang+=TAU;sp=0;$('trS').value=0;$('trS_v').textContent='0';});
  bindSl('trS',v=>sp=v);bindBtns(root,'trU',k=>unit=k);
  anim(dt=>{ang=(ang+dt*sp)%TAU;const cx=160,cy=165,R=120,x=Math.cos(ang),y=Math.sin(ang);g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);
    g.strokeStyle='rgba(214,198,255,.25)';g.beginPath();g.moveTo(cx-R-20,cy);g.lineTo(cx+R+20,cy);g.moveTo(cx,cy-R-20);g.lineTo(cx,cy+R+20);g.stroke();g.strokeStyle='rgba(214,198,255,.6)';g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();
    g.fillStyle='rgba(165,133,239,.18)';g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,30,0,-ang,true);g.closePath();g.fill();
    const px=cx+R*x,py=cy-R*y;g.strokeStyle='#e8705a';g.lineWidth=3;g.beginPath();g.moveTo(px,cy);g.lineTo(px,py);g.stroke();g.strokeStyle='#5fc8d8';g.beginPath();g.moveTo(cx,cy);g.lineTo(px,cy);g.stroke();g.lineWidth=1.5;g.strokeStyle=VL;g.beginPath();g.moveTo(cx,cy);g.lineTo(px,py);g.stroke();
    if(Math.abs(x)>.05){const ty=cy-R*Math.tan(ang);if(Math.abs(Math.tan(ang))<2.5){g.strokeStyle='#e0a030';g.setLineDash([4,3]);g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+R*Math.sign(x),cy-R*Math.tan(ang)*Math.sign(x));g.stroke();g.setLineDash([]);dot(g,cx+R*Math.sign(x),cy-R*Math.tan(ang)*Math.sign(x),3,'#e0a030');}}
    g.shadowColor=VI;g.shadowBlur=12;dot(g,px,py,7,'#ecd59a');g.shadowBlur=0;
    /* waves */
    const wx=330,ww=g.W-wx-20,sc=ww/TAU;g.strokeStyle='rgba(214,198,255,.25)';g.beginPath();g.moveTo(wx,cy);g.lineTo(wx+ww,cy);g.stroke();
    [['π/2',Math.PI/2],['π',Math.PI],['3π/2',3*Math.PI/2],['2π',TAU]].forEach(([l,v])=>txt(g,l,wx+v*sc,cy+16,COL.dim,'10px sans-serif'));
    curve(g,{X:v=>wx+v*sc,Y:v=>cy-R*v},Math.sin,0,TAU,'rgba(232,112,90,.45)',1.5);curve(g,{X:v=>wx+v*sc,Y:v=>cy-R*v},Math.cos,0,TAU,'rgba(95,200,216,.45)',1.5);
    g.strokeStyle='rgba(232,112,90,.35)';g.setLineDash([3,4]);g.beginPath();g.moveTo(px,py);g.lineTo(wx+ang*sc,py);g.stroke();g.setLineDash([]);dot(g,wx+ang*sc,cy-R*y,6,'#e8705a');dot(g,wx+ang*sc,cy-R*x,5,'#5fc8d8');
    txt(g,'sin',g.W-30,40,'#e8705a','600 13px sans-serif');txt(g,'cos',g.W-30,58,'#5fc8d8','600 13px sans-serif');
    const deg=ang*180/Math.PI;$('trI').innerHTML=`<div class="big">α = ${unit==='deg'?deg.toFixed(1)+'°':(ang/Math.PI).toFixed(3)+'π'}</div><div class="kv2"><b style="color:#e8705a">sin α</b><span>${y.toFixed(4)}</span><b style="color:#5fc8d8">cos α</b><span>${x.toFixed(4)}</span><b style="color:#e0a030">tg α</b><span>${Math.abs(x)<1e-3?'∞':(y/x).toFixed(4)}</span><b>sin² + cos²</b><span>${(x*x+y*y).toFixed(4)}</span></div>
      <div class="hint">მეოთხედი: ${['I (+,+)','II (sin+, cos−)','III (−,−)','IV (sin−, cos+)'][Math.floor(ang/(Math.PI/2))%4]}</div>`;});
 }});

reg({id:'pi',ico:'π',t:'რიცხვი π',s:'არქიმედეს მრავალკუთხედები · მონტე-კარლო',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="piC"></div><div class="actl">${sl('piN','მრავალკუთხედის გვერდები n',3,96,1,6)}</div><div id="piI" class="ainfo"></div></div>
    <div class="acol"><div id="piM"></div><div class="actl"><div class="abt"><button id="piG" class="on">▶ ისარი</button><button id="piR">↻ თავიდან</button></div></div><div id="piJ" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['π = C / d ≈ 3.14159265…','წრეწირის სიგრძე / დიამეტრი',{s:[['C','წრეწირი'],['d','დიამეტრი']],w:'ყველა წრეს ერთნაირი შეფარდება აქვს — უსასრულო, არაპერიოდული ათწილადი.'}],['C = 2πr ;  S = πr²','წრეწირი და ფართობი',{s:[['r','რადიუსი']],w:'წრე გავჭრათ ნაჭრებად და „ზიგზაგად“ დავალაგოთ: გამოვა მართკუთხედი r × πr.'}],
     ['n·sin(π/n) < π < n·tan(π/n)','არქიმედეს ჩარჩო',{s:[['n','მრავალკუთხედის გვერდები']],w:'არქიმედემ 96-კუთხედით მიიღო 3.1408 < π < 3.1429.'}],['π/4 = 1 − 1/3 + 1/5 − 1/7 + …','ლაიბნიცის მწკრივი',{s:[],w:'ძალიან ნელა იკრიბება — მაგრამ ლამაზია.'}],['e^(iπ) + 1 = 0','ეილერის იგივეობა',{s:[],w:'ხუთი ყველაზე მნიშვნელოვანი რიცხვი ერთ ტოლობაში (დონე 3).'}]]))}`;
  const c=canvas($('piC'),420,330),g=c.g,c2=canvas($('piM'),420,330),h=c2.g;let n=6,pts=[],inside=0,run=true;
  const draw=()=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);const cx=210,cy=165,R=130;
    const poly=(r,col,fill)=>{g.beginPath();for(let i=0;i<=n;i++){const a=i*TAU/n-Math.PI/2;const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();if(fill){g.fillStyle=fill;g.fill();}g.strokeStyle=col;g.lineWidth=1.6;g.stroke();g.lineWidth=1;};
    poly(R/Math.cos(Math.PI/n),'#e8705a','rgba(232,112,90,.06)');g.fillStyle='rgba(165,133,239,.12)';g.beginPath();g.arc(cx,cy,R,0,TAU);g.fill();g.strokeStyle=VL;g.lineWidth=2;g.stroke();g.lineWidth=1;poly(R,'#6fcf8a','rgba(111,207,138,.08)');
    const lo=n*Math.sin(Math.PI/n),hi=n*Math.tan(Math.PI/n);$('piI').innerHTML=`<div class="kv2"><b style="color:#6fcf8a">შიდა ${n}-კუთხედი</b><span>${lo.toFixed(6)}</span><b>π</b><span>3.141593</span><b style="color:#e8705a">გარე ${n}-კუთხედი</b><span>${hi.toFixed(6)}</span><b>ცდომილება</b><span>${(hi-lo).toExponential(2)}</span></div>`;};
  bindSl('piN',v=>{n=v;draw();});
  const reset=()=>{pts=[];inside=0;h.fillStyle='#0b0816';h.fillRect(0,0,h.W,h.H);};reset();$('piR').onclick=reset;$('piG').onclick=e=>{run=!run;e.target.textContent=run?'⏸ პაუზა':'▶ ისარი';};$('piG').textContent='⏸ პაუზა';
  anim(()=>{if(!run||pts.length>=40000)return;const S=300,ox=60,oy=15;h.strokeStyle='rgba(214,198,255,.4)';h.strokeRect(ox,oy,S,S);
    for(let i=0;i<60;i++){const x=Math.random(),y=Math.random(),inn=x*x+y*y<=1;if(inn)inside++;pts.push(1);h.fillStyle=inn?'rgba(165,133,239,.8)':'rgba(224,160,48,.6)';h.fillRect(ox+x*S,oy+S-y*S,1.6,1.6);}
    h.strokeStyle=VL;h.beginPath();h.arc(ox,oy+S,S,-Math.PI/2,0);h.stroke();const est=4*inside/pts.length;
    $('piJ').innerHTML=`<div class="kv2"><b>ისრები</b><span>${pts.length.toLocaleString('en')}</span><b>წრის შიგნით</b><span>${inside.toLocaleString('en')}</span><b>π ≈ 4·შიგნით/სულ</b><span class="big" style="font-size:18px">${est.toFixed(5)}</span><b>ცდომილება</b><span>${Math.abs(est-Math.PI).toFixed(5)}</span></div><div class="hint">ალბათობით π-ის ძებნა — „მონტე-კარლოს მეთოდი“. ცდომილება ~1/√N-ით მცირდება.</div>`;});
 }});

/* ═══════════════════ LEVEL 2 · ანალიზი ═══════════════════ */
const FNS={sq:['x²',x=>x*x,x=>2*x,x=>x**3/3],cub:['x³ − 3x',x=>x**3-3*x,x=>3*x*x-3,x=>x**4/4-1.5*x*x],sin:['sin x',Math.sin,Math.cos,x=>-Math.cos(x)],exp:['eˣ',Math.exp,Math.exp,Math.exp],
  ln:['ln x',x=>x>0?Math.log(x):NaN,x=>x>0?1/x:NaN,x=>x>0?x*Math.log(x)-x:NaN],gau:['e^(−x²)',x=>Math.exp(-x*x),x=>-2*x*Math.exp(-x*x),null]};
const fnBtns=(name,keys,on)=>btns(name,keys.map(k=>[k,FNS[k][0]]),on);

reg({id:'seq',ico:'…',t:'მიმდევრობები და ზღვრები',s:'ზენონი · ჰარმონიული მწკრივი · e',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="sqC"></div></div><div class="acol"><div class="actl"><div>${btns('sqS',[['geo','½ + ¼ + ⅛ …'],['harm','1 + ½ + ⅓ …'],['e','(1 + 1/n)ⁿ'],['leib','4(1 − ⅓ + ⅕ …)'],['bas','1 + ¼ + ⅑ … (ბაზელი)']],'geo')}</div>${sl('sqN','წევრების რაოდ. n',1,200,1,20)}</div><div id="sqI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['lim aₙ = L','ზღვარი',{s:[['L','რიცხვი, რომელსაც მიმდევრობა უახლოვდება']],w:'რაგინდ პატარა ε-სთვის მოიძებნება წევრი, რომლის შემდეგაც ყველა L-იდან ε-ზე ნაკლებითაა დაშორებული.'}],
     ['a + aq + aq² + … = a/(1 − q), |q| < 1','გეომეტრიული პროგრესიის ჯამი',{s:[['q','მნიშვნელი']],w:'ზენონის პარადოქსი: უსასრულოდ ბევრი ნაბიჯი, სასრული მანძილი — ½ + ¼ + … = 1.'}],
     ['1 + ½ + ⅓ + … = ∞','ჰარმონიული მწკრივი განშლადია',{s:[],w:'წევრები ნულისკენ მიდის, ჯამი მაინც უსასრულოა — ოღონდ ლოგარითმულად ნელა (~ln n).'}],
     ['e = lim (1 + 1/n)ⁿ ≈ 2.71828','ეილერის რიცხვი',{s:[],w:'რთული პროცენტი, რომელიც უსასრულოდ ხშირად ერიცხება: 100% წელიწადში → ×e.'}],['1 + 1/4 + 1/9 + … = π²/6','ბაზელის ამოცანა (ეილერი)',{s:[],w:'კვადრატების შებრუნებულების ჯამში π ჩნდება — წრე, რომელიც არსად ჩანს.'}]]))}`;
  const c=canvas($('sqC'),440,360),g=c.g;let S='geo',n=20;
  const D={geo:[k=>1/2**k,1,'1'],harm:[k=>1/k,null,'∞'],e:[null,Math.E,'e'],leib:[k=>4*(k%2?1:-1)/(2*k-1),Math.PI,'π'],bas:[k=>1/(k*k),Math.PI**2/6,'π²/6']};
  const draw=()=>{const d=D[S],ps=[];let s=0;for(let k=1;k<=n;k++){if(S==='e')s=(1+1/k)**k;else s+=d[0](k);ps.push(s);}
    const lo=Math.min(0,...ps),hi=Math.max(d[1]||0,...ps)*1.1;const M=mplot(g,{x:[0,n+1],y:[lo,hi],m:[12,10,22,34]});
    if(d[1]!=null){g.strokeStyle='#ecd59a';g.setLineDash([6,4]);g.beginPath();g.moveTo(M.x0,M.Y(d[1]));g.lineTo(M.x0+M.w,M.Y(d[1]));g.stroke();g.setLineDash([]);txt(g,d[2]+' = '+r3(d[1]),M.x0+M.w-4,M.Y(d[1])-5,'#ecd59a','11px sans-serif','right');}
    g.strokeStyle='rgba(165,133,239,.6)';g.beginPath();ps.forEach((v,i)=>i?g.lineTo(M.X(i+1),M.Y(v)):g.moveTo(M.X(i+1),M.Y(v)));g.stroke();ps.forEach((v,i)=>dot(g,M.X(i+1),M.Y(v),n>80?1.5:3,VL));
    const last=ps[ps.length-1];$('sqI').innerHTML=`<div class="big">S${String(n).replace(/\d/g,c=>'₀₁₂₃₄₅₆₇₈₉'[c])} = ${last.toFixed(6)}</div><div class="kv2"><b>ზღვარი</b><span>${d[2]}${d[1]!=null?' = '+d[1].toFixed(6):''}</span>${d[1]!=null?`<b>დარჩენილი</b><span>${Math.abs(d[1]-last).toExponential(2)}</span>`:`<b>~ ln n + 0.5772</b><span>${(Math.log(n)+0.5772156649).toFixed(4)}</span>`}</div>
      <div class="hint">${S==='harm'?'ჯამი 10-ს გადასცდება მხოლოდ 12 367-ე წევრზე, 100-ს — 1.5·10⁴³-ზე. მაინც უსასრულოა.':S==='leib'?'ეს მწკრივი რხევით და ძალიან ნელა უახლოვდება π-ს: 1000 წევრი მხოლოდ 3 ზუსტ ციფრს იძლევა.':S==='e'?'ბანკი 100%-ს თვეში ერთხელ თუ დაგირიცხავს — 2.613-ჯერ; წამში ერთხელ — 2.71828-ჯერ.':'წევრების გრაფიკი — ნაწილობრივი ჯამები Sₙ.'}</div>`;};
  bindBtns(root,'sqS',k=>{S=k;draw();});bindSl('sqN',v=>{n=v;draw();});
 }});

reg({id:'deriv',ico:'∂',t:'წარმოებული',s:'მკვეთიდან მხებამდე · ცვლილების სიჩქარე',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="dvC"></div></div><div class="acol"><div class="actl"><div>${fnBtns('dvF',['sq','cub','sin','exp','ln','gau'],'cub')}</div>${sl('dvX','წერტილი x₀',-3,3,0.01,0.5)}${sl('dvH','ნაზრდი h',0.001,2,0.001,1.2)}
    <label class="hint"><input type="checkbox" id="dvD" checked> f′(x)-ის გრაფიკი</label><div class="abt"><button id="dvA">▶ h → 0</button></div></div><div id="dvI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['f′(x) = lim (f(x+h) − f(x)) / h','წარმოებულის განსაზღვრება (h → 0)',{s:[['h','პატარა ნაბიჯი']],w:'მკვეთი წრფის დახრა, როცა მეორე წერტილი პირველს „ეწებება“ — მხების დახრა. ნახე როგორ ტრიალებს ნარინჯისფერი წრფე.'}],
     ['(xⁿ)′ = n·xⁿ⁻¹','ხარისხის წესი',{s:[],w:'(x³)′ = 3x². ხარისხი წინ გადმოდის და ერთით მცირდება.'}],['(sin x)′ = cos x ; (eˣ)′ = eˣ ; (ln x)′ = 1/x','ძირითადი წარმოებულები',{s:[],w:'eˣ ერთადერთი ფუნქციაა (მამრავლის სიზუსტით), რომელიც საკუთარი წარმოებულია.'}],
     ['(f·g)′ = f′g + fg′','ნამრავლის წესი',{s:[],w:'ლაიბნიცი: მართკუთხედის ფართობის ზრდა ორივე გვერდის ზრდაზეა დამოკიდებული.'}],['(f(g(x)))′ = f′(g)·g′','ჯაჭვის წესი',{s:[],w:'ნეირონული ქსელების სწავლება (backpropagation) სწორედ ჯაჭვის წესია.'}],
     ['f′(x₀) = 0','ექსტრემუმის პირობა',{s:[],w:'მაქსიმუმსა და მინიმუმში მხები ჰორიზონტალურია — ოპტიმიზაციის საფუძველი.'}]]))}`;
  const c=canvas($('dvC'),440,400),g=c.g;let F='cub',x0=.5,h=1.2,showD=true,animH=0;
  const draw=()=>{const [nm,f,df]=FNS[F];const M=mplot(g,{x:[-3.5,3.5],y:[-4,4],step:1,stepY:1});
    if(showD)curve(g,M,df,-3.5,3.5,'rgba(95,200,216,.6)',1.6,[5,4]);curve(g,M,f,-3.5,3.5,VI,2.6);
    const y0=f(x0),y1=f(x0+h),ks=(y1-y0)/h,kt=df(x0);
    if(isFinite(y0)){if(isFinite(y1)){curve(g,M,x=>y0+ks*(x-x0),-3.5,3.5,'#e0a030',1.6);dot(g,M.X(x0+h),M.Y(y1),5,'#e0a030');
        g.strokeStyle='rgba(224,160,48,.5)';g.setLineDash([3,3]);g.beginPath();g.moveTo(M.X(x0),M.Y(y0));g.lineTo(M.X(x0+h),M.Y(y0));g.lineTo(M.X(x0+h),M.Y(y1));g.stroke();g.setLineDash([]);
        txt(g,'h',M.X(x0+h/2),M.Y(y0)+13,'#e0a030','11px sans-serif');}
      if(isFinite(kt))curve(g,M,x=>y0+kt*(x-x0),-3.5,3.5,'#6fcf8a',1.6,[2,3]);g.shadowColor='#ecd59a';g.shadowBlur=12;dot(g,M.X(x0),M.Y(y0),6,'#ecd59a');g.shadowBlur=0;}
    txt(g,'f(x) = '+nm,M.x0+8,M.y0+16,VL,'600 13px sans-serif','left');if(showD)txt(g,"f′(x)",M.x0+8,M.y0+32,'#5fc8d8','12px sans-serif','left');
    $('dvI').innerHTML=`<div class="kv2"><b style="color:#e0a030">მკვეთის დახრა</b><span>(f(x₀+h) − f(x₀))/h = ${isFinite(ks)?ks.toFixed(5):'—'}</span><b style="color:#6fcf8a">მხების დახრა f′(x₀)</b><span>${isFinite(kt)?kt.toFixed(5):'—'}</span><b>სხვაობა</b><span>${isFinite(ks-kt)?Math.abs(ks-kt).toExponential(2):'—'}</span></div><div class="hint">შეამცირე h — მკვეთი მხებად იქცევა. ${Math.abs(kt)<0.05?'<b>f′ ≈ 0: აქ ექსტრემუმია ან გადაღუნვა!</b>':''}</div>`;};
  bindBtns(root,'dvF',k=>{F=k;draw();});bindSl('dvX',v=>{x0=v;draw();},v=>v.toFixed(2));const hs=bindSl('dvH',v=>{h=v;draw();},v=>v.toFixed(3));$('dvD').onchange=e=>{showD=e.target.checked;draw();};
  $('dvA').onclick=()=>{animH=1;};anim(dt=>{if(!animH)return;h=Math.max(0.001,h*Math.pow(0.25,dt));hs.value=h;$('dvH_v').textContent=h.toFixed(3);draw();if(h<=0.0011)animH=0;});
 }});

reg({id:'integ',ico:'∫',t:'ინტეგრალი',s:'რიმანის ჯამები · ფართობი მრუდის ქვეშ',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="inC"></div></div><div class="acol"><div class="actl"><div>${fnBtns('inF',['sq','cub','sin','exp','gau'],'sin')}</div>${sl('inA','a',-3,3,0.1,0)}${sl('inB','b',-3,3,0.1,3)}${sl('inN','მართკუთხედები n',1,200,1,8)}
    <div>${btns('inM',[['L','მარცხ.'],['M','შუა'],['R','მარჯვ.'],['T','ტრაპეცია']],'L')}</div></div><div id="inI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['∫ₐᵇ f(x)dx = lim Σ f(xᵢ)·Δx','განსაზღვრული ინტეგრალი',{s:[['Δx','ზოლის სიგანე (b−a)/n']],w:'ფართობი ვიწრო ზოლების ჯამად. ∫ თვითონ არის გაწელილი S — Summa.'}],
     ['∫ₐᵇ f(x)dx = F(b) − F(a)','ნიუტონ–ლაიბნიცის ფორმულა',{s:[['F','პირველადი: F′ = f']],w:'ანალიზის ძირითადი თეორემა: ინტეგრება და გაწარმოება ურთიერთშებრუნებულია.'}],
     ['∫xⁿdx = xⁿ⁺¹/(n+1) + C','ხარისხის ინტეგრალი',{s:[['C','ნებისმიერი მუდმივა']],w:'ფართობი x²-ის ქვეშ 0-დან 1-მდე = ⅓.'}],['ტრაპეცია: Δx·(f₀/2 + f₁ + … + fₙ/2)','რიცხვითი ინტეგრება',{s:[],w:'ცდომილება ~1/n²; შუა წერტილის მეთოდიც ~1/n², მარცხენა/მარჯვენა მხოლოდ ~1/n.'}],
     ['∫₋∞^∞ e^(−x²)dx = √π','გაუსის ინტეგრალი',{s:[],w:'ზარისებრი მრუდის ფართობი — ალბათობის თეორიის საფუძველი (დონე 3).'}]]))}`;
  const c=canvas($('inC'),440,400),g=c.g;let F='sin',a=0,b=3,n=8,m='L';
  const exactOf=(f,A,B)=>{if(FNS[F][3])return FNS[F][3](B)-FNS[F][3](A);let s=0;const N=4000,dx=(B-A)/N;for(let i=0;i<N;i++){const x=A+(i+.5)*dx;s+=f(x)*dx;}return s;};
  const draw=()=>{const [nm,f]=FNS[F];const M=mplot(g,{x:[-3.5,3.5],y:[-3,4],step:1,stepY:1});const A=Math.min(a,b),B=Math.max(a,b),dx=(B-A)/n;let s=0;
    for(let i=0;i<n;i++){const xl=A+i*dx,xr=xl+dx;let y;if(m==='T'){const y1=f(xl),y2=f(xr);s+=(y1+y2)/2*dx;g.fillStyle=(y1+y2)>=0?'rgba(165,133,239,.35)':'rgba(232,112,90,.35)';g.beginPath();g.moveTo(M.X(xl),M.Y(0));g.lineTo(M.X(xl),M.Y(y1));g.lineTo(M.X(xr),M.Y(y2));g.lineTo(M.X(xr),M.Y(0));g.closePath();g.fill();if(n<=60){g.strokeStyle='rgba(214,198,255,.5)';g.stroke();}continue;}
      y=f(m==='L'?xl:m==='R'?xr:(xl+xr)/2);s+=y*dx;g.fillStyle=y>=0?'rgba(165,133,239,.35)':'rgba(232,112,90,.35)';g.fillRect(M.X(xl),Math.min(M.Y(y),M.Y(0)),M.X(xr)-M.X(xl),Math.abs(M.Y(y)-M.Y(0)));if(n<=60){g.strokeStyle='rgba(214,198,255,.5)';g.strokeRect(M.X(xl),Math.min(M.Y(y),M.Y(0)),M.X(xr)-M.X(xl),Math.abs(M.Y(y)-M.Y(0)));}}
    curve(g,M,f,-3.5,3.5,VI,2.6);const ex=exactOf(f,A,B);txt(g,'f(x) = '+nm,M.x0+8,M.y0+16,VL,'600 13px sans-serif','left');
    $('inI').innerHTML=`<div class="big">∫ ${r3(A)}…${r3(B)} ${nm} dx</div><div class="kv2"><b>ჯამი (${n} ზოლი)</b><span>${s.toFixed(6)}</span><b>ზუსტი</b><span>${ex.toFixed(6)}</span><b>ცდომილება</b><span>${Math.abs(s-ex).toExponential(2)}</span></div><div class="hint">წითელი ზოლები — ფართობი ღერძის ქვემოთ, ითვლება უარყოფითად. გაზარდე n და შეადარე მეთოდები.</div>`;};
  bindBtns(root,'inF',k=>{F=k;draw();});bindSl('inA',v=>{a=v;draw();},v=>v.toFixed(1));bindSl('inB',v=>{b=v;draw();},v=>v.toFixed(1));bindSl('inN',v=>{n=v;draw();});bindBtns(root,'inM',k=>{m=k;draw();});
 }});

reg({id:'taylor',ico:'Σ',t:'ტეილორის მწკრივი',s:'ფუნქცია პოლინომად',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="tyC"></div></div><div class="acol"><div class="actl"><div>${btns('tyF',[['sin','sin x'],['cos','cos x'],['exp','eˣ'],['ln','ln(1+x)'],['geo','1/(1−x)'],['atan','arctg x']],'sin')}</div>${sl('tyN','წევრები N',1,25,1,3)}<div class="abt"><button id="tyP">▶ ანიმაცია</button></div></div><div id="tyI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['f(x) = Σ f⁽ⁿ⁾(0)/n! · xⁿ','მაკლორენის მწკრივი',{s:[['f⁽ⁿ⁾','n-ური წარმოებული'],['n!','ფაქტორიალი']],w:'პოლინომი, რომელიც 0-ში ფუნქციას ემთხვევა მნიშვნელობით, დახრით, სიმრუდით … — ყველა წარმოებულით.'}],
     ['sin x = x − x³/3! + x⁵/5! − …','სინუსი',{s:[],w:'კალკულატორები ზუსტად ასე ითვლიან სინუსს.'}],['eˣ = 1 + x + x²/2! + x³/3! + …','ექსპონენტა',{s:[],w:'ყველა x-ისთვის იკრიბება.'}],['ln(1+x) = x − x²/2 + x³/3 − …','ლოგარითმი',{s:[],w:'მხოლოდ −1 < x ≤ 1-ზე! მის გარეთ წევრების დამატება აუარესებს — „კრებადობის რადიუსი“.'}],
     ['e^(ix) = cos x + i·sin x','ეილერის ფორმულა',{s:[],w:'eˣ-ის მწკრივში ix ჩასვით და ლუწ/კენტ წევრებად დაყავით.'}]]))}`;
  const c=canvas($('tyC'),440,400),g=c.g;let F='sin',N=3,play=0,acc=0;
  const fact=n=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r;};
  const DEF={sin:[Math.sin,k=>k%2?((k-1)/2%2?-1:1)/fact(k):0,'sin x'],cos:[Math.cos,k=>k%2?0:(k/2%2?-1:1)/fact(k),'cos x'],exp:[Math.exp,k=>1/fact(k),'eˣ'],ln:[x=>x>-1?Math.log(1+x):NaN,k=>k?(k%2?1:-1)/k:0,'ln(1+x)'],geo:[x=>x!==1?1/(1-x):NaN,k=>1,'1/(1−x)'],atan:[Math.atan,k=>k%2?(((k-1)/2)%2?-1:1)/k:0,'arctg x']};
  const draw=()=>{const [f,co,nm]=DEF[F];const cs=[];let cnt=0,deg=0;for(let k=0;cnt<N&&k<80;k++){const v=co(k);if(v){cs.push([k,v]);cnt++;deg=k;}}
    const P=x=>cs.reduce((s,[k,v])=>s+v*x**k,0);const M=mplot(g,{x:[-6,6],y:[-4,4],step:1,stepY:1});
    if(F==='ln'||F==='geo'||F==='atan'){g.fillStyle='rgba(111,207,138,.06)';g.fillRect(M.X(-1),M.y0,M.X(1)-M.X(-1),M.h);txt(g,'კრებადობის არე',M.X(0),M.y0+M.h-6,'#6fcf8a','10px sans-serif');}
    curve(g,M,f,-6,6,VI,3);curve(g,M,P,-6,6,'#e0a030',2);txt(g,nm,M.x0+8,M.y0+16,VL,'600 13px sans-serif','left');txt(g,'პოლინომი, ხარისხი '+deg,M.x0+8,M.y0+32,'#e0a030','12px sans-serif','left');
    const terms=cs.map(([k,v])=>{const fr=Math.abs(1/v)>1.5&&Math.abs(Math.round(1/v)-1/v)<1e-9?`x${k>1?sup(k):''}/${Math.round(Math.abs(1/v))}`:(Math.abs(v)===1?'':r3(Math.abs(v)))+(k?'x'+(k>1?sup(k):''):'');return (v<0?'− ':'+ ')+(k===0?'1':fr);}).join(' ').replace(/^\+ /,'');
    $('tyI').innerHTML=`<div class="seqbox" style="font-family:'Times New Roman',serif;font-size:15px;letter-spacing:0">${terms}</div><div class="kv2" style="margin-top:6px"><b>x = 1-ზე</b><span>${P(1).toFixed(6)} vs ${f(1).toFixed(6)}</span><b>x = 3-ზე</b><span>${isFinite(P(3))?P(3).toFixed(4):'—'} vs ${isFinite(f(3))?f(3).toFixed(4):'—'}</span></div>`;};
  const ns=bindSl('tyN',v=>{N=v;draw();});bindBtns(root,'tyF',k=>{F=k;draw();});$('tyP').onclick=()=>{play=1;N=1;acc=0;};
  anim(dt=>{if(!play)return;acc+=dt;if(acc>.6){acc=0;N++;ns.value=N;$('tyN_v').textContent=N;draw();if(N>=14)play=0;}});
 }});

reg({id:'ode',ico:'ẏ',t:'დიფერენციალური განტოლებები',s:'მიმართულებათა ველი · ეილერი vs რუნგე–კუტა',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="odC"></div><div class="hint">დააწკაპუნე ველზე — იქიდან დაიწყება ამონახსნი</div></div><div class="acol"><div class="actl"><div>${btns('odE',[['grow',"y′ = 0.5y (ზრდა)"],['log',"y′ = y(1 − y/3) (ლოგისტიკური)"],['lin',"y′ = x − y"],['osc',"y′ = −x/y (წრეები)"],['sin',"y′ = sin(x)·y"]],'log')}</div>${sl('odH','ბიჯი h',0.05,1,0.05,0.4)}</div><div id="odI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['dy/dx = f(x, y)','პირველი რიგის განტოლება',{s:[],w:'ვიცით არა ფუნქცია, არამედ მისი ცვლილების წესი ყოველ წერტილში — ისრები ველზე.'}],
     ['yₙ₊₁ = yₙ + h·f(xₙ, yₙ)','ეილერის მეთოდი',{s:[['h','ნაბიჯი']],w:'„ისრის მიმართულებით ნაბიჯი“. მარტივია, მაგრამ ცდომილება გროვდება (წითელი მრუდი გადაუხვევს).'}],
     ['RK4: k₁…k₄-ის შეწონილი საშუალო','რუნგე–კუტა',{s:[],w:'ოთხი „დაზვერვა“ ერთ ნაბიჯზე — ცდომილება ~h⁴. თითქმის ყველა სიმულაცია (ორბიტები, ამინდი) ამას იყენებს.'}],
     ['y = y₀·e^(kx)','ექსპონენტური ზრდა/დაშლა',{s:[],w:'ბაქტერიები, რადიოაქტიურობა, ანაბარი.'}],['y = K / (1 + C·e^(−rx))','ლოგისტიკური მრუდი',{s:[['K','ტევადობა']],w:'პოპულაციის ზრდა რესურსის ზღვრამდე — ბიოლოგიაშიც შეხვდები.'}]]))}`;
  const c=canvas($('odC'),440,400),g=c.g;let E='log',h=.4,start=[-3,.3];
  const EQ={log:(x,y)=>y*(1-y/3),grow:(x,y)=>.5*y,lin:(x,y)=>x-y,osc:(x,y)=>Math.abs(y)<1e-6?NaN:-x/y,sin:(x,y)=>Math.sin(x)*y};
  const draw=()=>{const f=EQ[E],M=mplot(g,{x:[-4,4],y:[-4,4],step:1,stepY:1});
    for(let i=-4;i<=4;i+=.5)for(let j=-4;j<=4;j+=.5){const s=f(i,j);if(!isFinite(s))continue;const a=Math.atan(s),L=8;g.strokeStyle=`hsla(${260-clamp(Math.abs(s),0,3)*30},60%,70%,.55)`;g.beginPath();g.moveTo(M.X(i)-L*Math.cos(a),M.Y(j)+L*Math.sin(a));g.lineTo(M.X(i)+L*Math.cos(a),M.Y(j)-L*Math.sin(a));g.stroke();}
    const run=(rk)=>{const pts=[[...start]];let [x,y]=start;for(let k=0;k<400&&x<4.2&&Math.abs(y)<20;k++){let dy;if(rk){const k1=f(x,y),k2=f(x+h/2,y+h*k1/2),k3=f(x+h/2,y+h*k2/2),k4=f(x+h,y+h*k3);dy=(k1+2*k2+2*k3+k4)/6;}else dy=f(x,y);if(!isFinite(dy))break;y+=h*dy;x+=h;pts.push([x,y]);}return pts;};
    const exact=[[...start]];{let [x,y]=start;const hh=.002;for(let k=0;k<5000&&x<4.2&&Math.abs(y)<20;k++){const k1=f(x,y),k2=f(x+hh/2,y+hh*k1/2),k3=f(x+hh/2,y+hh*k2/2),k4=f(x+hh,y+hh*k3);const dy=(k1+2*k2+2*k3+k4)/6;if(!isFinite(dy))break;y+=hh*dy;x+=hh;if(k%10===0)exact.push([x,y]);}}
    const line=(P,col,w,pts)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();P.forEach((p,i)=>i?g.lineTo(M.X(p[0]),M.Y(p[1])):g.moveTo(M.X(p[0]),M.Y(p[1])));g.stroke();g.lineWidth=1;if(pts)P.forEach(p=>dot(g,M.X(p[0]),M.Y(p[1]),2.5,col));};
    line(exact,'rgba(255,255,255,.75)',3);const eu=run(false),rk=run(true);line(eu,'#e8705a',1.8,true);line(rk,'#6fcf8a',1.8,true);g.shadowColor='#ecd59a';g.shadowBlur=12;dot(g,M.X(start[0]),M.Y(start[1]),6,'#ecd59a');g.shadowBlur=0;
    const end=(P)=>P[P.length-1],ee=end(exact);$('odI').innerHTML=`<div class="kv2"><b style="color:#fff">ზუსტი (თეთრი)</b><span>y(${r3(ee[0])}) ≈ ${r3(ee[1])}</span><b style="color:#e8705a">ეილერი</b><span>${r3(end(eu)[1])}</span><b style="color:#6fcf8a">RK4</b><span>${r3(end(rk)[1])}</span></div><div class="hint">გაზარდე h — ეილერი გადაუხვევს, RK4 თითქმის ზუსტი რჩება. ${E==='osc'?'ამონახსნები წრეებია: x² + y² = const.':''}</div>`;};
  c.addEventListener('click',e=>{const p=c.pt(e),M={ix:v=>-4+(v-10)/(g.W-20)*8,iy:v=>-4+(g.H-10-v)/(g.H-20)*8};start=[M.ix(p[0]),M.iy(p[1])];draw();});
  bindBtns(root,'odE',k=>{E=k;start=k==='osc'?[-2.5,.5]:k==='grow'?[-4,.2]:[-3,.3];draw();});bindSl('odH',v=>{h=v;draw();},v=>v.toFixed(2));
 }});

/* ═══════════════════ LEVEL 3 · უმაღლესი ალგებრა და ალბათობა ═══════════════════ */
reg({id:'complex',ico:'𝑖',t:'კომპლექსური რიცხვები',s:'გამრავლება = ბრუნვა · ერთის ფესვები · e^(iπ)',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="cxC"></div><div class="hint">გადაათრიე z₁ და z₂</div></div><div class="acol"><div class="actl"><div>${btns('cxM',[['add','z₁ + z₂'],['mul','z₁ · z₂'],['pow','zⁿ'],['root','ⁿ√1'],['euler','e^(iθ)']],'mul')}</div>${sl('cxN','n',2,12,1,5)}</div><div id="cxI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['i² = −1','წარმოსახვითი ერთეული',{s:[],w:'რიცხვი, რომლის კვადრატიც უარყოფითია. სიბრტყეზე i — 90°-იანი მობრუნებაა: ორჯერ მობრუნება = 180° = −1.'}],
     ['z = a + bi = r·(cos φ + i·sin φ) = r·e^(iφ)','ალგებრული და ტრიგონომეტრიული ფორმა',{s:[['r = |z|','მოდული'],['φ = arg z','არგუმენტი']],w:'ერთი და იგივე წერტილი — დეკარტული ან პოლარული კოორდინატებით.'}],
     ['z₁·z₂: r₁r₂ ·  e^(i(φ₁+φ₂))','გამრავლება',{s:[],w:'სიგრძეები მრავლდება, კუთხეები იკრიბება. ამიტომ კომპლექსური რიცხვები ბრუნვის ენაა — ელექტროტექნიკა, კვანტური მექანიკა.'}],
     ['zⁿ = rⁿ·e^(inφ)','მუავრის ფორმულა',{s:[],w:'სპირალი: |z|>1 — გარეთ, |z|<1 — შიგნით.'}],['ⁿ√1 = e^(2πik/n)','ერთის ფესვები',{s:[],w:'n წესიერი მრავალკუთხედის წვერო ერთეულოვან წრეზე — ყოველი n-ური ხარისხის განტოლებას ზუსტად n ფესვი აქვს (ალგებრის ძირითადი თეორემა).'}],
     ['e^(iπ) + 1 = 0','ეილერის იგივეობა',{s:[],w:'π რადიანით ბრუნვა 1-ს −1-ში გადაიყვანს.'}]]))}`;
  const c=canvas($('cxC'),440,440),g=c.g;let z1=[1.2,.8],z2=[.6,1.1],mode='mul',n=5,th=0,dragI=-1;
  const S=70,O=[220,220],P=z=>[O[0]+z[0]*S,O[1]-z[1]*S],U=p=>[(p[0]-O[0])/S,(O[1]-p[1])/S];
  drag(c,(p,ev)=>{if(ev==='down'){const d1=Math.hypot(...[P(z1)[0]-p[0],P(z1)[1]-p[1]]),d2=Math.hypot(...[P(z2)[0]-p[0],P(z2)[1]-p[1]]);dragI=d1<d2?1:2;}const u=U(p);if(dragI===1)z1=u;else z2=u;});
  bindBtns(root,'cxM',k=>mode=k);bindSl('cxN',v=>n=v);
  const mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],ab=z=>Math.hypot(...z),ar=z=>Math.atan2(z[1],z[0]),fz=z=>`${r3(z[0])} ${z[1]<0?'−':'+'} ${r3(Math.abs(z[1]))}i`;
  anim(dt=>{th+=dt*.8;g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);
    g.strokeStyle='rgba(165,133,239,.1)';for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(...P([k,-3.2]));g.lineTo(...P([k,3.2]));g.moveTo(...P([-3.2,k]));g.lineTo(...P([3.2,k]));g.stroke();}
    g.strokeStyle='rgba(214,198,255,.5)';g.beginPath();g.moveTo(0,O[1]);g.lineTo(g.W,O[1]);g.moveTo(O[0],0);g.lineTo(O[0],g.H);g.stroke();txt(g,'Re',g.W-14,O[1]-6,COL.mid,'11px sans-serif');txt(g,'Im',O[0]+14,12,COL.mid,'11px sans-serif');
    g.strokeStyle='rgba(214,198,255,.3)';g.beginPath();g.arc(O[0],O[1],S,0,TAU);g.stroke();
    const vec=(z,col,lab)=>{arrow(g,O[0],O[1],...P(z),col,2.2);dot(g,...P(z),5,col);txt(g,lab,P(z)[0]+10,P(z)[1]-8,col,'600 12px sans-serif','left');};
    let info='';
    if(mode==='add'){const s=[z1[0]+z2[0],z1[1]+z2[1]];g.strokeStyle='rgba(255,255,255,.2)';g.setLineDash([4,4]);g.beginPath();g.moveTo(...P(z1));g.lineTo(...P(s));g.lineTo(...P(z2));g.stroke();g.setLineDash([]);vec(z1,'#a585ef','z₁');vec(z2,'#5fc8d8','z₂');vec(s,'#ecd59a','z₁+z₂');
      info=`<div class="big">${fz(s)}</div><div class="hint">შეკრება — ვექტორების შეკრებაა (პარალელოგრამის წესი).</div>`;}
    else if(mode==='mul'){const p=mul(z1,z2);[[z1,'#a585ef'],[z2,'#5fc8d8'],[p,'#ecd59a']].forEach(([z,col],i)=>{g.strokeStyle=rgba(col,.5);g.beginPath();g.arc(O[0],O[1],18+i*12,0,-ar(z),ar(z)>0);g.stroke();});
      vec(z1,'#a585ef','z₁');vec(z2,'#5fc8d8','z₂');vec(p,'#ecd59a','z₁·z₂');info=`<div class="big">${fz(p)}</div><div class="kv2"><b>|z₁|·|z₂|</b><span>${r3(ab(z1))} · ${r3(ab(z2))} = ${r3(ab(p))}</span><b>φ₁ + φ₂</b><span>${r3(ar(z1)*180/Math.PI)}° + ${r3(ar(z2)*180/Math.PI)}° = ${r3((ar(z1)+ar(z2))*180/Math.PI)}°</span></div>`;}
    else if(mode==='pow'){let z=[1,0];const pts=[z];for(let k=1;k<=n;k++){z=mul(z,z1);pts.push(z);}g.strokeStyle='rgba(236,213,154,.6)';g.beginPath();pts.forEach((q,i)=>i?g.lineTo(...P(q)):g.moveTo(...P(q)));g.stroke();pts.forEach((q,i)=>{dot(g,...P(q),4,i===n?'#ecd59a':VL);if(i)txt(g,'z'+sup(i),P(q)[0]+8,P(q)[1]-6,COL.mid,'10px sans-serif','left');});vec(z1,'#a585ef','z');
      info=`<div class="big">z${sup(n)} = ${fz(z)}</div><div class="hint">${ab(z1)>1.02?'|z| > 1 — სპირალი გარეთ':ab(z1)<.98?'|z| < 1 — სპირალი შიგნით':'|z| ≈ 1 — წრეზე ბრუნვა'}</div>`;}
    else if(mode==='root'){const pts=[...Array(n).keys()].map(k=>[Math.cos(TAU*k/n),Math.sin(TAU*k/n)]);g.fillStyle='rgba(165,133,239,.15)';g.beginPath();pts.forEach((q,i)=>i?g.lineTo(...P(q)):g.moveTo(...P(q)));g.closePath();g.fill();g.strokeStyle=VL;g.stroke();
      pts.forEach((q,k)=>{const a=th*(k%2?1:-1)*0;dot(g,...P(q),6,k?'#a585ef':'#ecd59a');txt(g,`e^(2πi·${k}/${n})`,P(q)[0]+(q[0]>=0?8:-8),P(q)[1]-8,COL.mid,'10px sans-serif',q[0]>=0?'left':'right');});
      info=`<div class="big">z${sup(n)} = 1</div><div class="hint">${n} ფესვი, ერთმანეთისგან ${r3(360/n)}°-ით დაშორებული. მათი ჯამი ყოველთვის 0-ია.</div>`;}
    else{const t=th%(TAU),z=[Math.cos(t),Math.sin(t)];g.strokeStyle='#ecd59a';g.lineWidth=2;g.beginPath();g.arc(O[0],O[1],S,0,-t,true);g.stroke();g.lineWidth=1;vec(z,'#ecd59a','e^(iθ)');
      g.strokeStyle='#e8705a';g.beginPath();g.moveTo(P(z)[0],O[1]);g.lineTo(...P(z));g.stroke();g.strokeStyle='#5fc8d8';g.beginPath();g.moveTo(...O);g.lineTo(P(z)[0],O[1]);g.stroke();
      info=`<div class="big">θ = ${(t/Math.PI).toFixed(2)}π</div><div class="kv2"><b style="color:#5fc8d8">cos θ</b><span>${z[0].toFixed(3)}</span><b style="color:#e8705a">sin θ</b><span>${z[1].toFixed(3)}</span></div><div class="hint">${Math.abs(t-Math.PI)<.1?'<b>θ = π: e^(iπ) = −1 !</b>':'e^(iθ) = cos θ + i·sin θ — წერტილი ერთეულოვან წრეზე.'}</div>`;}
    if(mode!=='add'&&mode!=='mul')0;
    $('cxI').innerHTML=info+`<div class="kv2" style="margin-top:6px"><b style="color:#a585ef">z₁</b><span>${fz(z1)} · |z₁| = ${r3(ab(z1))}</span><b style="color:#5fc8d8">z₂</b><span>${fz(z2)}</span></div>`;});
 }});

reg({id:'linalg',ico:'⊞',t:'მატრიცები როგორც გარდაქმნები',s:'ბადის დეფორმაცია · დეტერმინანტი · საკუთრივი ვექტორები',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="laC"></div></div><div class="acol"><div class="actl"><div>${btns('laP',[['rot','ბრუნვა'],['shear','წანაცვლება'],['scale','გაჭიმვა'],['refl','არეკვლა'],['proj','პროექცია'],['sym','სიმეტრიული']],'shear')}</div>
    ${sl('laA','a',-2,2,0.05,1)}${sl('laB','b',-2,2,0.05,1)}${sl('laC2','c',-2,2,0.05,0)}${sl('laD','d',-2,2,0.05,1)}</div><div id="laI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['[a b; c d]·(x, y) = (ax + by, cx + dy)','მატრიცა ვექტორზე',{s:[],w:'სვეტები გვეუბნება, სად წავა ბაზისური ვექტორები: î → (a, c), ĵ → (b, d). დანარჩენი ბადე მათ მიჰყვება.'}],
     ['det = ad − bc','დეტერმინანტი',{s:[],w:'ფართობის მასშტაბი: ერთეულოვანი კვადრატი det-ჯერ იზრდება. det < 0 — სიბრტყე „ამობრუნდა“; det = 0 — სიბრტყე წრფედ გაბრტყელდა.'}],
     ['A·v = λ·v','საკუთრივი ვექტორი და რიცხვი',{s:[['λ','საკუთრივი რიცხვი']],w:'ვექტორები, რომლებიც გარდაქმნის შემდეგაც იმავე წრფეზე რჩებიან — მხოლოდ იჭიმებიან. Google PageRank, კვანტური მექანიკა, PCA.'}],
     ['λ² − (a+d)λ + det = 0','მახასიათებელი განტოლება',{s:[['a+d','კვალი']],w:'თუ დისკრიმინანტი უარყოფითია, ნამდვილი საკუთრივი ვექტორი არ არსებობს — ბრუნვაა.'}],['(AB)v = A(Bv)','კომპოზიცია',{s:[],w:'მატრიცების გამრავლება — გარდაქმნების თანმიმდევრობაა, ამიტომ AB ≠ BA.'}]]))}`;
  const c=canvas($('laC'),440,440),g=c.g;let A=[1,1,0,1],t0=performance.now();
  const set=m=>{A=m;['laA','laB','laC2','laD'].forEach((id,i)=>{$(id).value=m[i];$(id+'_v').textContent=r3(m[i]);});t0=performance.now();};
  const PR={rot:[Math.cos(.6),-Math.sin(.6),Math.sin(.6),Math.cos(.6)],shear:[1,1,0,1],scale:[1.6,0,0,.6],refl:[1,0,0,-1],proj:[1,0,0,0],sym:[1.2,.6,.6,.4]};
  bindBtns(root,'laP',k=>set(PR[k].map(v=>Math.round(v*100)/100)));['laA','laB','laC2','laD'].forEach((id,i)=>bindSl(id,v=>{A[i]=v;t0=performance.now()-2000;},v=>v.toFixed(2)));
  anim(()=>{let k=clamp((performance.now()-t0)/1400,0,1);k=1-Math.pow(1-k,3);const M=[lerp(1,A[0],k),lerp(0,A[1],k),lerp(0,A[2],k),lerp(1,A[3],k)],S=48,O=[220,220];
    const T=(x,y)=>[O[0]+(M[0]*x+M[1]*y)*S,O[1]-(M[2]*x+M[3]*y)*S];g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);
    g.strokeStyle='rgba(255,255,255,.06)';for(let i=-5;i<=5;i++){g.beginPath();g.moveTo(O[0]+i*S,0);g.lineTo(O[0]+i*S,g.H);g.moveTo(0,O[1]+i*S);g.lineTo(g.W,O[1]+i*S);g.stroke();}
    g.strokeStyle='rgba(165,133,239,.4)';for(let i=-8;i<=8;i++){g.beginPath();g.moveTo(...T(i,-8));g.lineTo(...T(i,8));g.moveTo(...T(-8,i));g.lineTo(...T(8,i));g.stroke();}
    const det=M[0]*M[3]-M[1]*M[2];g.fillStyle=det>=0?'rgba(236,213,154,.25)':'rgba(232,112,90,.3)';g.beginPath();[[0,0],[1,0],[1,1],[0,1]].forEach((p,i)=>i?g.lineTo(...T(...p)):g.moveTo(...T(...p)));g.closePath();g.fill();
    arrow(g,...O,...T(1,0),'#6fcf8a',3);arrow(g,...O,...T(0,1),'#e8705a',3);txt(g,'î',T(1,0)[0]+8,T(1,0)[1]-4,'#6fcf8a','600 14px serif');txt(g,'ĵ',T(0,1)[0]+8,T(0,1)[1]-4,'#e8705a','600 14px serif');
    /* eigen-directions for the final matrix */
    const tr=A[0]+A[3],dt=A[0]*A[3]-A[1]*A[2],disc=tr*tr-4*dt;let ev='ნამდვილი საკუთრივი ვექტორი არ არის — ბრუნვის კომპონენტი';
    if(disc>=-1e-9){const ls=[(tr+Math.sqrt(Math.max(0,disc)))/2,(tr-Math.sqrt(Math.max(0,disc)))/2];const vs=ls.map(l=>{let v=Math.abs(A[1])>1e-9?[A[1],l-A[0]]:Math.abs(A[2])>1e-9?[l-A[3],A[2]]:(Math.abs(l-A[0])<1e-9?[1,0]:[0,1]);const L=Math.hypot(...v);return [v[0]/L,v[1]/L];});
      vs.forEach((v,i)=>{g.strokeStyle=i?'rgba(95,200,216,.7)':'rgba(236,213,154,.7)';g.setLineDash([6,5]);g.beginPath();g.moveTo(O[0]-v[0]*300,O[1]+v[1]*300);g.lineTo(O[0]+v[0]*300,O[1]-v[1]*300);g.stroke();g.setLineDash([]);});
      ev=`λ₁ = ${r3(ls[0])} (ოქროსფერი), λ₂ = ${r3(ls[1])} (ცისფერი)`;}
    $('laI').innerHTML=`<div class="big" style="font-size:20px">[ ${r3(A[0])}  ${r3(A[1])} ; ${r3(A[2])}  ${r3(A[3])} ]</div><div class="kv2"><b>det</b><span class="${dt<0?'bad':''}">${r3(dt)} ${Math.abs(dt)<1e-9?'— სიბრტყე წრფედ გაბრტყელდა':dt<0?'— ორიენტაცია შებრუნდა':''}</span><b>კვალი</b><span>${r3(tr)}</span><b>საკუთრივი</b><span>${ev}</span></div>`;});
 }});

reg({id:'vec3',ico:'⇗',t:'ვექტორები სივრცეში',s:'სკალარული და ვექტორული ნამრავლი 3D-ში',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="v3C"></div><div class="hint">გადაატრიალე თითით/მაუსით</div></div><div class="acol"><div class="actl">${['ax','ay','az','bx','by','bz'].map((k,i)=>sl('v3'+k,(i<3?'a':'b')+['ₓ','ᵧ','𝓏'][i%3],-2,2,0.1,[1.5,0,0,0.5,1.5,0.5][i])).join('')}</div><div id="v3I" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['a·b = aₓbₓ + aᵧbᵧ + a𝓏b𝓏 = |a||b|cos θ','სკალარული ნამრავლი',{s:[['θ','კუთხე ვექტორებს შორის']],w:'რამდენად „ერთი მიმართულებით“ იყურებიან. a·b = 0 ⇒ მართობულია. ფიზიკაში — მუშაობა A = F·s.'}],
     ['a × b = (aᵧb𝓏 − a𝓏bᵧ, a𝓏bₓ − aₓb𝓏, aₓbᵧ − aᵧbₓ)','ვექტორული ნამრავლი',{s:[],w:'ახალი ვექტორი, ორივეს მართობული (მარჯვენა ხელის წესი). სიგრძე = პარალელოგრამის ფართობი. ფიზიკაში — ბრუნვის მომენტი, ლორენცის ძალა.'}],
     ['|a × b| = |a||b| sin θ','ფართობი',{s:[],w:'ოქროსფერი პარალელოგრამის ფართობი.'}],['|a| = √(aₓ² + aᵧ² + a𝓏²)','სიგრძე',{s:[],w:'პითაგორა სამ განზომილებაში.'}]]))}`;
  const c=canvas($('v3C'),440,400),s=S3(c,{scale:70,spin:.25,yaw:.6,pitch:.35});const v={ax:1.5,ay:0,az:0,bx:.5,by:1.5,bz:.5};
  ['ax','ay','az','bx','by','bz'].forEach(k=>bindSl('v3'+k,x=>v[k]=x,x=>x.toFixed(1)));
  anim(dt=>{const a=[v.ax,v.az,v.ay],b=[v.bx,v.bz,v.by];/* display y-up: swap */const A=[v.ax,v.ay,v.az],B=[v.bx,v.by,v.bz];
    const cr=[A[1]*B[2]-A[2]*B[1],A[2]*B[0]-A[0]*B[2],A[0]*B[1]-A[1]*B[0]],crD=[cr[0],cr[2],cr[1]],dotp=A[0]*B[0]+A[1]*B[1]+A[2]*B[2],la=Math.hypot(...A),lb=Math.hypot(...B),lc=Math.hypot(...cr);
    s.lines=[...axes3(2.5),[[0,0,0],a,'#a585ef',3],[[0,0,0],b,'#5fc8d8',3],[[0,0,0],crD,'#ecd59a',3],[a,[a[0]+b[0],a[1]+b[1],a[2]+b[2]],'rgba(236,213,154,.4)',1,1],[b,[a[0]+b[0],a[1]+b[1],a[2]+b[2]],'rgba(236,213,154,.4)',1,1]];
    s.atoms=[{p:a,r:.09,c:'#a585ef',lab:''},{p:b,r:.09,c:'#5fc8d8'},{p:crD,r:.09,c:'#ecd59a'}];
    s.extra=(g)=>{const q=[[0,0,0],a,[a[0]+b[0],a[1]+b[1],a[2]+b[2]],b].map(p=>s.proj(p));g.fillStyle='rgba(236,213,154,.14)';g.beginPath();q.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
      [['a',a,'#a585ef'],['b',b,'#5fc8d8'],['a×b',crD,'#ecd59a']].forEach(([l,p,col])=>{const r=s.proj(p);txt(g,l,r[0]+10,r[1]-6,col,'600 13px sans-serif','left');});};
    s.draw(dt);const th=la&&lb?Math.acos(clamp(dotp/(la*lb),-1,1))*180/Math.PI:0;
    $('v3I').innerHTML=`<div class="kv2"><b>a · b</b><span>${r3(dotp)} ${Math.abs(dotp)<1e-9?'— მართობულია ⟂':''}</span><b>კუთხე θ</b><span>${r3(th)}°</span><b style="color:#ecd59a">a × b</b><span>(${cr.map(r3).join(', ')})</span><b>ფართობი |a×b|</b><span>${r3(lc)}</span><b>|a|, |b|</b><span>${r3(la)}, ${r3(lb)}</span></div>`;});
 }});

reg({id:'prob',ico:'⚄',t:'ალბათობა',s:'გალტონის დაფა · ცენტრალური ზღვრული თეორემა',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="pbC"></div><div class="actl">${sl('pbR','ფრჩხილების რიგები',4,16,1,12)}${sl('pbP','მარჯვნივ გადახრის ალბათობა p',0.1,0.9,0.05,0.5)}<div class="abt"><button id="pbX">↻ თავიდან</button></div></div></div>
    <div class="acol"><div id="pbD"></div><div class="actl">${sl('pbN','კამათლების რაოდენობა',1,10,1,3)}<div class="abt"><button id="pbG" class="on">🎲 გაგორება ×1000</button></div></div><div id="pbI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['P(A) = ხელსაყრელი / ყველა','კლასიკური ალბათობა',{s:[],w:'კამათელზე 6-ის ალბათობა 1/6. ორ კამათელზე ჯამი 7 — 6/36, ყველაზე ხშირი.'}],
     ['P(A და B) = P(A)·P(B)','დამოუკიდებელი ხდომილებები',{s:[],w:'ორჯერ ზედიზედ „გერბი“ — ¼. მონეტას მეხსიერება არ აქვს (მოთამაშის შეცდომა).'}],
     ['P(k) = C(n,k)·pᵏ(1−p)ⁿ⁻ᵏ','ბინომიალური განაწილება',{s:[['C(n,k)','n-დან k-ს არჩევის რაოდენობა']],w:'ყოველ ფრჩხილზე ბურთი მარცხნივ ან მარჯვნივ ვარდება — უჯრა k = მარჯვნივ გადახრების რაოდენობა.'}],
     ['f(x) = e^(−(x−μ)²/2σ²) / (σ√(2π))','ნორმალური (გაუსის) განაწილება',{s:[['μ','საშუალო'],['σ','სტანდარტული გადახრა']],w:'ცენტრალური ზღვრული თეორემა: ბევრი დამოუკიდებელი შემთხვევითი სიდიდის ჯამი ყოველთვის ზარისებრ მრუდს იძლევა — ამიტომაა ის ყველგან.'}],
     ['P(A|B) = P(B|A)·P(A) / P(B)','ბაიესის თეორემა',{s:[],w:'ტესტი 99% ზუსტია, დაავადება 1000-დან 1-ს აქვს: დადებითი პასუხისას ავადმყოფობის ალბათობა მხოლოდ ~9%-ია!'}]]))}`;
  const c=canvas($('pbC'),420,440),g=c.g,c2=canvas($('pbD'),420,260),h=c2.g;let R=12,p=.5,balls=[],bins=[],N=3,rolls=[];
  const reset=()=>{balls=[];bins=Array(R+1).fill(0);};bindSl('pbR',v=>{R=v;reset();});bindSl('pbP',v=>{p=v;},v=>v.toFixed(2));$('pbX').onclick=reset;reset();
  let acc=0;anim(dt=>{acc+=dt;const top=30,gap=Math.min(22,300/R),w=g.W,cx=w/2,binTop=top+R*gap+12;if(acc>.05&&balls.length<60){acc=0;balls.push({r:0,k:0,t:0});}
    g.fillStyle='#0b0816';g.fillRect(0,0,w,g.H);for(let r=0;r<R;r++)for(let k=0;k<=r;k++)dot(g,cx+(k-r/2)*gap*1.1,top+r*gap,2.2,'rgba(214,198,255,.6)');
    const bw=gap*1.1,mx=Math.max(1,...bins),tot=bins.reduce((a,b)=>a+b,0);
    for(let k=0;k<=R;k++){const x=cx+(k-R/2)*bw,hh=bins[k]/mx*(g.H-binTop-24);g.fillStyle='rgba(165,133,239,.55)';g.fillRect(x-bw/2+1,g.H-20-hh,bw-2,hh);}
    if(tot>20){const mu=R*p,sg=Math.sqrt(R*p*(1-p));g.strokeStyle='#ecd59a';g.lineWidth=2;g.beginPath();for(let i=0;i<=200;i++){const kk=-0.5+i/200*(R+1),y=Math.exp(-((kk-mu)**2)/(2*sg*sg))/(sg*Math.sqrt(TAU))*tot;const x=cx+(kk-R/2)*bw,yy=g.H-20-y/mx*(g.H-binTop-24);i?g.lineTo(x,yy):g.moveTo(x,yy);}g.stroke();g.lineWidth=1;}
    for(const b of balls){b.t+=dt*7;while(b.t>=1&&b.r<R){b.t-=1;b.r++;if(Math.random()<p)b.k++;}
      if(b.r>=R&&b.t>=1){bins[b.k]++;b.done=true;continue;}const r=b.r,x0=cx+(b.k-r/2)*gap*1.1,y0=top+r*gap-6;dot(g,x0+(b.t*(gap*0.55))*(0),y0+b.t*gap,4,'#ecd59a');}
    balls=balls.filter(b=>!b.done);txt(g,`ბურთები: ${tot}`,10,16,COL.mid,'11px sans-serif','left');});
  const roll=()=>{for(let i=0;i<1000;i++){let s=0;for(let k=0;k<N;k++)s+=1+Math.floor(Math.random()*6);rolls.push(s);}draw2();};
  const draw2=()=>{h.fillStyle='#0b0816';h.fillRect(0,0,h.W,h.H);const lo=N,hi=6*N,cnt=Array(hi+1).fill(0);rolls.forEach(s=>cnt[s]++);const mx=Math.max(1,...cnt),bw=(h.W-40)/(hi-lo+1);
    for(let s=lo;s<=hi;s++){const hh=cnt[s]/mx*(h.H-50);h.fillStyle='rgba(95,200,216,.6)';h.fillRect(20+(s-lo)*bw+1,h.H-30-hh,bw-2,hh);if(hi-lo<25||s%5===0)txt(h,s,20+(s-lo+.5)*bw,h.H-16,COL.dim,'10px sans-serif');}
    const mu=3.5*N,sg=Math.sqrt(N*35/12);if(rolls.length){h.strokeStyle='#ecd59a';h.lineWidth=2;h.beginPath();for(let i=0;i<=200;i++){const x=lo-.5+i/200*(hi-lo+1),y=Math.exp(-((x-mu)**2)/(2*sg*sg))/(sg*Math.sqrt(TAU))*rolls.length;const yy=h.H-30-y/mx*(h.H-50);i?h.lineTo(20+(x-lo+.5-.5+.5)*bw,yy):h.moveTo(20+(x-lo+.5)*bw,yy);}h.stroke();h.lineWidth=1;}
    const m=rolls.length?rolls.reduce((a,b)=>a+b,0)/rolls.length:0;$('pbI').innerHTML=`<div class="kv2"><b>გაგორებები</b><span>${rolls.length.toLocaleString('en')}</span><b>საშუალო</b><span>${r3(m)} (თეორია ${mu})</span><b>σ</b><span>${r3(sg)}</span></div><div class="hint">${N===1?'ერთი კამათელი — თანაბარი განაწილება. დაამატე კამათლები და ნახე, როგორ ჩნდება ზარი.':'ჯამების განაწილება ზარისებრ მრუდს უახლოვდება — ცენტრალური ზღვრული თეორემა.'}</div>`;};
  bindSl('pbN',v=>{N=v;rolls=[];draw2();});$('pbG').onclick=roll;roll();
 }});

reg({id:'stat',ico:'⋰',t:'სტატისტიკა და რეგრესია',s:'უმცირეს კვადრატთა წრფე · კორელაცია',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="stC"></div><div class="hint">დააწკაპუნე — წერტილის დამატება; გადაათრიე — გადაადგილება; ორჯერ — წაშლა</div></div><div class="acol"><div class="actl"><div class="abt"><button id="stR">🎲 შემთხვევითი</button><button id="stO">+ გამოვარდნილი წერტილი</button><button id="stX">✕ გასუფთავება</button></div><label class="hint"><input type="checkbox" id="stE" checked> ნარჩენები</label></div><div id="stI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['x̄ = Σxᵢ / n','საშუალო',{s:[],w:'ერთი „გამოვარდნილი“ წერტილი საშუალოს ძლიერ ცვლის — მედიანა უფრო მდგრადია.'}],['σ = √(Σ(xᵢ − x̄)² / n)','სტანდარტული გადახრა',{s:[],w:'რამდენად „იფანტება“ მონაცემები საშუალოს გარშემო.'}],
     ['ŷ = k·x + b, k = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²','უმცირეს კვადრატთა მეთოდი',{s:[],w:'წრფე, რომლისთვისაც ნარჩენების (წყვეტილი ხაზები) კვადრატების ჯამი მინიმალურია. გაუსმა ამით იპოვა ასტეროიდი ცერერა.'}],
     ['r = cov(x,y) / (σₓσᵧ)','კორელაციის კოეფიციენტი',{s:[['r','−1 … 1']],w:'კორელაცია ≠ მიზეზობრიობა: ნაყინის გაყიდვა და დახრჩობები ერთად იზრდება — ორივეს მიზეზი ზაფხულია.'}],['R² = r²','დეტერმინაციის კოეფიციენტი',{s:[],w:'y-ის ცვალებადობის რა წილს ხსნის წრფე.'}]]))}`;
  const c=canvas($('stC'),440,400),g=c.g;let pts=[],res=true,di=-1;const X=v=>30+v*(g.W-50),Y=v=>g.H-30-v*(g.H-50),IX=p=>(p-30)/(g.W-50),IY=p=>(g.H-30-p)/(g.H-50);
  const rnd=()=>{pts=[];const k=Math.random()*1.2-.2,b=.5-k/2;for(let i=0;i<25;i++){const x=Math.random();pts.push([x,clamp(k*x+b+(Math.random()-.5)*.35,0.02,.98)]);}draw();};
  const draw=()=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);g.strokeStyle='rgba(214,198,255,.4)';g.beginPath();g.moveTo(X(0),Y(0));g.lineTo(X(1),Y(0));g.moveTo(X(0),Y(0));g.lineTo(X(0),Y(1));g.stroke();
    const n=pts.length;let info='<div class="hint">დაამატე მინიმუმ 2 წერტილი.</div>';
    if(n>=2){const mx=pts.reduce((s,p)=>s+p[0],0)/n,my=pts.reduce((s,p)=>s+p[1],0)/n;let sxy=0,sxx=0,syy=0;pts.forEach(([x,y])=>{sxy+=(x-mx)*(y-my);sxx+=(x-mx)**2;syy+=(y-my)**2;});
      const k=sxx?sxy/sxx:0,b=my-k*mx,r=sxx&&syy?sxy/Math.sqrt(sxx*syy):0;let sse=0;
      if(res)pts.forEach(([x,y])=>{const yh=k*x+b;sse+=(y-yh)**2;g.strokeStyle='rgba(232,112,90,.6)';g.setLineDash([3,3]);g.beginPath();g.moveTo(X(x),Y(y));g.lineTo(X(x),Y(yh));g.stroke();g.setLineDash([]);});
      g.strokeStyle='#ecd59a';g.lineWidth=2.4;g.beginPath();g.moveTo(X(0),Y(b));g.lineTo(X(1),Y(k+b));g.stroke();g.lineWidth=1;dot(g,X(mx),Y(my),6,'rgba(236,213,154,.5)');txt(g,'(x̄, ȳ)',X(mx)+8,Y(my)-8,'#ecd59a','10px sans-serif','left');
      info=`<div class="big" style="font-size:20px">ŷ = ${r3(k)}x ${b<0?'−':'+'} ${r3(Math.abs(b))}</div><div class="kv2"><b>n</b><span>${n}</span><b>r</b><span>${r3(r)} — ${Math.abs(r)>.8?'ძლიერი':Math.abs(r)>.5?'საშუალო':Math.abs(r)>.2?'სუსტი':'თითქმის არ არის'} ${r>0?'დადებითი':'უარყოფითი'} კავშირი</span><b>R²</b><span>${r3(r*r)}</span><b>x̄, ȳ</b><span>${r3(mx)}, ${r3(my)}</span><b>σᵧ</b><span>${r3(Math.sqrt(syy/n))}</span></div>`;}
    pts.forEach(p=>dot(g,X(p[0]),Y(p[1]),5,VI));$('stI').innerHTML=info;};
  c.style.touchAction='none';c.addEventListener('pointerdown',e=>{const p=c.pt(e);di=pts.findIndex(q=>Math.hypot(X(q[0])-p[0],Y(q[1])-p[1])<10);if(di<0){pts.push([clamp(IX(p[0]),0,1),clamp(IY(p[1]),0,1)]);di=pts.length-1;}c.setPointerCapture(e.pointerId);draw();});
  c.addEventListener('pointermove',e=>{if(di<0)return;const p=c.pt(e);pts[di]=[clamp(IX(p[0]),0,1),clamp(IY(p[1]),0,1)];draw();});c.addEventListener('pointerup',()=>di=-1);
  c.addEventListener('dblclick',e=>{const p=c.pt(e);const i=pts.findIndex(q=>Math.hypot(X(q[0])-p[0],Y(q[1])-p[1])<12);if(i>=0){pts.splice(i,1);draw();}});
  $('stR').onclick=rnd;$('stO').onclick=()=>{pts.push([.95,.05]);draw();};$('stX').onclick=()=>{pts=[];draw();};$('stE').onchange=e=>{res=e.target.checked;draw();};rnd();
 }});

/* ═══════════════════ LEVEL 4 · გმირი ═══════════════════ */
reg({id:'fourier',ico:'◎',t:'ფურიე და ეპიციკლები',s:'ნებისმიერი ფორმა — ბრუნვადი წრეებით',
 build(root){
  root.innerHTML=`<div id="fuC"></div><div class="arow"><div class="acol"><div class="actl"><div>${btns('fuM',[['sq','მართკუთხა ტალღა'],['saw','ხერხი'],['tri','სამკუთხა'],['draw','✎ დახატე შენ']],'sq')}</div><a href="fourier.html" target="_blank" style="display:inline-block;margin:6px 0 2px;color:#ecd59a;font-size:13px;text-decoration:none;border:1px solid rgba(201,168,76,.4);border-radius:14px;padding:4px 12px">◎ ორი ჯაჭვი · განტოლება · სურათიდან ↗</a>${sl('fuN','წრეები (ჰარმონიკები)',1,80,1,5)}${sl('fuS','სიჩქარე',0.1,2,0.1,0.6)}</div></div><div class="acol"><div id="fuI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['f(t) = a₀/2 + Σ (aₙcos nωt + bₙsin nωt)','ფურიეს მწკრივი',{s:[['n','ჰარმონიკის ნომერი']],w:'ნებისმიერი პერიოდული სიგნალი — სხვადასხვა სიხშირის სინუსოიდების ჯამი. ყური სწორედ ასე „იშლის“ ბგერას ნოტებად.'}],
     ['მართკუთხა = (4/π)(sin t + sin 3t/3 + sin 5t/5 + …)','მხოლოდ კენტი ჰარმონიკები',{s:[],w:'კუთხეებთან ყოველთვის რჩება ~9%-იანი „ნახტომი“ — გიბსის ფენომენი.'}],
     ['cₖ = (1/N) Σ xₙ·e^(−2πikn/N)','დისკრეტული ფურიე გარდაქმნა (DFT)',{s:[['cₖ','k-ური წრის რადიუსი და საწყისი კუთხე']],w:'შენი ნახატი იქცევა N წრედ: თითოეული თავისი სიჩქარით ბრუნავს, ჯაჭვის ბოლო კი ნახატს იმეორებს.'}],
     ['JPEG, MP3, MRI, 5G','სადაა ფურიე',{s:[],w:'სურათები და ხმა იკუმშება, რადგან მაღალი სიხშირეების უმეტესობა შეიძლება გადავყაროთ.'}]]))}`;
  const c=canvas($('fuC'),900,380),g=c.g;let mode='sq',N=5,sp=.6,t=0,trace=[],user=[],coef=[],drawing=false;
  const dft=pts=>{const n=pts.length,out=[];for(let k=0;k<n;k++){let re=0,im=0;for(let j=0;j<n;j++){const a=TAU*k*j/n;re+=pts[j][0]*Math.cos(a)+pts[j][1]*Math.sin(a);im+=-pts[j][0]*Math.sin(a)+pts[j][1]*Math.cos(a);}
    re/=n;im/=n;const f=k<=n/2?k:k-n;out.push({f,amp:Math.hypot(re,im),ph:Math.atan2(im,re)});}return out.sort((a,b)=>b.amp-a.amp);};
  const demo=()=>{const P=[];for(let i=0;i<200;i++){const a=i/200*TAU;const r=16*Math.sin(a)**3,s=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a);P.push([r*6,-s*6]);}return P;};
  const setUser=P=>{user=P;const step=Math.max(1,Math.floor(P.length/300)),S=P.filter((_,i)=>i%step===0);coef=dft(S);t=0;trace=[];};
  bindBtns(root,'fuM',k=>{mode=k;t=0;trace=[];if(k==='draw'&&!user.length)setUser(demo());$('fuN').max=k==='draw'?Math.max(10,coef.length||200):80;});bindSl('fuN',v=>{N=v;trace=[];});bindSl('fuS',v=>sp=v,v=>v.toFixed(1));
  c.style.touchAction='none';c.addEventListener('pointerdown',e=>{if(mode!=='draw')return;drawing=true;user=[];const p=c.pt(e);user.push([p[0]-g.W/2-120,p[1]-g.H/2]);c.setPointerCapture(e.pointerId);});
  c.addEventListener('pointermove',e=>{if(!drawing)return;const p=c.pt(e);user.push([p[0]-g.W/2-120,p[1]-g.H/2]);});c.addEventListener('pointerup',()=>{if(!drawing)return;drawing=false;if(user.length>10){setUser(user);N=Math.min(coef.length,Math.max(N,60));$('fuN').max=coef.length;$('fuN').value=N;$('fuN_v').textContent=N;}});
  anim(dt=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);
    if(mode==='draw'){const cx=g.W/2+120,cy=g.H/2;if(drawing){g.strokeStyle='#ecd59a';g.lineWidth=2;g.beginPath();user.forEach((p,i)=>i?g.lineTo(p[0]+cx,p[1]+cy):g.moveTo(p[0]+cx,p[1]+cy));g.stroke();g.lineWidth=1;txt(g,'ხატავ… აუშვი თითი',20,24,COL.mid,'12px sans-serif','left');return;}
      if(!coef.length)return;const L=coef.length;t+=dt*sp*0.5;let x=cx-120-60,y=cy;const ox=x;x=g.W/2-240;y=cy;let px=x,py=y;
      const nn=Math.min(N,L);for(let i=0;i<nn;i++){const C=coef[i],a=C.f*t*TAU/ (1)+C.ph;g.strokeStyle='rgba(165,133,239,.28)';g.beginPath();g.arc(px,py,C.amp,0,TAU);g.stroke();const nx=px+C.amp*Math.cos(C.f*t*TAU+C.ph),ny=py+C.amp*Math.sin(C.f*t*TAU+C.ph);g.strokeStyle='rgba(214,198,255,.7)';g.beginPath();g.moveTo(px,py);g.lineTo(nx,ny);g.stroke();px=nx;py=ny;}
      trace.push([px,py]);if(trace.length>Math.max(200,user.length*1.2))trace.shift();if(t>=1){t=0;}
      g.strokeStyle='rgba(255,255,255,.12)';g.beginPath();user.forEach((p,i)=>{const X=p[0]+x+0,Y=p[1]+y;i?g.lineTo(X,Y):g.moveTo(X,Y);});g.stroke();
      g.strokeStyle='#ecd59a';g.lineWidth=2;g.beginPath();trace.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.lineWidth=1;dot(g,px,py,4,'#fff');
      $('fuI').innerHTML=`<div class="kv2"><b>წერტილები</b><span>${user.length}</span><b>წრეები</b><span>${nn} / ${L}</span></div><div class="hint">დახატე ნებისმიერი ჩაკეტილი ფორმა კანვასზე (დაიწყე გულით). შეამცირე წრეების რაოდენობა — ნახატი „დარბილდება“.</div>`;return;}
    t+=dt*sp;const cx=170,cy=g.H/2,A=70;let x=cx,y=cy;const terms=[];
    for(let i=0;i<N;i++){let n,amp;if(mode==='sq'){n=2*i+1;amp=4/(n*Math.PI);}else if(mode==='saw'){n=i+1;amp=2/(n*Math.PI)*(i%2?-1:1);}else{n=2*i+1;amp=8/(Math.PI*Math.PI*n*n)*(i%2?-1:1);}terms.push([n,amp]);}
    for(const [n,amp] of terms){const r=Math.abs(amp)*A,ph=(mode==='tri'?Math.PI/2:0);g.strokeStyle='rgba(165,133,239,.3)';g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();
      const nx=x+amp*A*Math.cos(n*t+ph),ny=y-amp*A*Math.sin(n*t+ph);g.strokeStyle='rgba(214,198,255,.75)';g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();x=nx;y=ny;}
    trace.unshift(y);if(trace.length>560)trace.pop();const wx=360;g.strokeStyle='rgba(236,213,154,.35)';g.setLineDash([3,4]);g.beginPath();g.moveTo(x,y);g.lineTo(wx,y);g.stroke();g.setLineDash([]);
    g.strokeStyle='#ecd59a';g.lineWidth=2;g.beginPath();trace.forEach((v,i)=>i?g.lineTo(wx+i,v):g.moveTo(wx,v));g.stroke();g.lineWidth=1;dot(g,x,y,4,'#fff');
    $('fuI').innerHTML=`<div class="kv2"><b>ჰარმონიკები</b><span>${terms.map(t=>t[0]).slice(0,8).join(', ')}${N>8?' …':''}</span><b>რადიუსები</b><span>${terms.slice(0,4).map(t=>r3(Math.abs(t[1]))).join(', ')} …</span></div><div class="hint">${mode==='sq'?'მხოლოდ კენტი ჰარმონიკები, რადიუსი 1/n. ნახე „ყურები“ კუთხეებთან — გიბსის ფენომენი.':mode==='saw'?'ყველა ჰარმონიკა, ნიშნის მონაცვლეობით.':'რადიუსები 1/n²-ით მცირდება — ამიტომ სამკუთხა ტალღა სწრაფად „ეწყობა“.'}</div>`;});
 }});

reg({id:'fractal',ico:'❄',t:'ფრაქტალები',s:'მანდელბროტი · ჟულია · სერპინსკი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="frcC"></div><div class="hint" id="frcH">დააწკაპუნე — გადიდება ×3 · მარჯვენა ღილაკი/ორჯერ შეხება — დაპატარავება</div></div><div class="acol"><div class="actl"><div>${btns('frcM',[['m','მანდელბროტი'],['j','ჟულია'],['s','სერპინსკის თამაში'],['t','პითაგორას ხე']],'m')}</div>${sl('frcI','იტერაციები',20,600,10,120)}${sl('frcA','ხის კუთხე',10,80,1,45)}<div class="abt"><button id="frcR">⟲ საწყისი ხედი</button></div></div><div id="frcInfo" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['zₙ₊₁ = zₙ² + c','მანდელბროტის სიმრავლე',{s:[['c','წერტილი სიბრტყეზე'],['z₀ = 0','საწყისი']],w:'c ეკუთვნის სიმრავლეს, თუ მიმდევრობა არ „გაიქცევა“ უსასრულობაში. საზღვარი უსასრულოდ რთულია: გადიდებისას ახალ-ახალი ასლები ჩნდება.'}],
     ['ჟულია: z₀ = წერტილი, c = მუდმივა','ჟულიას სიმრავლე',{s:[],w:'ყოველ c-ს თავისი ჟულია აქვს; ის ბმულია მხოლოდ მაშინ, როცა c მანდელბროტშია.'}],
     ['D = log N / log s','ფრაქტალური განზომილება',{s:[['N','ასლების რაოდენობა'],['s','მასშტაბი']],w:'სერპინსკის სამკუთხედი: 3 ასლი, ½ ზომის — D = log3/log2 ≈ 1.585. ნაკლები ფართობზე, მეტი წრფეზე.'}],
     ['ქაოსის თამაში','შემთხვევითობიდან წესრიგი',{s:[],w:'შემთხვევითი წვერო → გადადი ნახევარი მანძილით → ასე ათასჯერ. გამოდის ზუსტი ფრაქტალი!'}]]))}`;
  const c=canvas($('frcC'),440,440),g=c.g;let mode='m',it=120,ang=45,view=[-0.6,0,1.6],jc=[-0.8,0.156],chaos=null;
  const render=()=>{const W=440,H=440,img=g.createImageData(W,H),d=img.data,[cx,cy,sc]=view;
    for(let py=0;py<H;py++)for(let px=0;px<W;px++){const x0=cx+(px-W/2)/(W/2)*sc,y0=cy-(py-H/2)/(H/2)*sc;let x=mode==='m'?0:x0,y=mode==='m'?0:y0,cr=mode==='m'?x0:jc[0],ci=mode==='m'?y0:jc[1],n=0,x2=x*x,y2=y*y;
      while(x2+y2<=16&&n<it){y=2*x*y+ci;x=x2-y2+cr;x2=x*x;y2=y*y;n++;}const i=(py*W+px)*4;
      if(n>=it){d[i]=6;d[i+1]=4;d[i+2]=14;}else{const sm=Math.max(0,n+1-Math.log(Math.log(Math.sqrt(x2+y2)))/Math.LN2),u=Math.min(1,Math.pow(sm/42,0.75)),u4=u*u*u*u;d[i]=8+157*u+71*u4;d[i+1]=5+128*u+80*u4;d[i+2]=18+221*u-85*u4;}d[i+3]=255;}
    const dpr=c.width/440;if(dpr===1)g.putImageData(img,0,0);else{const off=document.createElement('canvas');off.width=W;off.height=H;off.getContext('2d').putImageData(img,0,0);g.drawImage(off,0,0,W,H);}
    if(mode==='m'){const px=W/2+(jc[0]-cx)/sc*(W/2),py=H/2-(jc[1]-cy)/sc*(H/2);g.strokeStyle='#ecd59a';g.beginPath();g.arc(px,py,5,0,TAU);g.stroke();}
    $('frcInfo').innerHTML=`<div class="kv2"><b>ცენტრი</b><span>${cx.toFixed(6)} ${cy<0?'−':'+'} ${Math.abs(cy).toFixed(6)}i</span><b>გადიდება</b><span>×${(1.6/sc).toExponential(2)}</span>${mode==='j'?`<b>c</b><span>${r3(jc[0])} ${jc[1]<0?'−':'+'} ${r3(Math.abs(jc[1]))}i</span>`:''}</div><div class="hint">${mode==='m'?'Shift+დაწკაპუნება (ან ღილაკი „ჟულია“) — აირჩიე c ჟულიასთვის. ოქროსფერი წრე — მიმდინარე c.':'ჟულიას ფორმა c-ზეა დამოკიდებული. მანდელბროტის რეჟიმში აირჩიე სხვა c.'}</div>`;};
  const tree=()=>{g.fillStyle='#0b0816';g.fillRect(0,0,440,440);const br=(x,y,len,a,d)=>{if(d>11||len<2)return;const x2=x+len*Math.cos(a),y2=y-len*Math.sin(a);g.strokeStyle=`hsl(${280-d*16},60%,${45+d*3}%)`;g.lineWidth=Math.max(.6,(12-d)*.7);g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();
      const r=ang*Math.PI/180;br(x2,y2,len*Math.cos(r)*.98,a+r,d+1);br(x2,y2,len*Math.sin(r)*.98+len*.05,a-(Math.PI/2-r),d+1);};br(220,430,95,Math.PI/2,0);g.lineWidth=1;
    $('frcInfo').innerHTML=`<div class="hint">ყოველი ტოტი ორ პატარა ტოტად იყოფა — კუთხე ${ang}°. 11 თაობა = 4095 ტოტი. ასე იზრდება ხეები, ფილტვის ბრონქები და მდინარის დელტები.</div>`;};
  const draw=()=>{chaos=null;if(mode==='m'||mode==='j')render();else if(mode==='t')tree();else{g.fillStyle='#0b0816';g.fillRect(0,0,440,440);chaos={p:[220,220],n:0};}};
  c.addEventListener('click',e=>{if(mode!=='m'&&mode!=='j')return;const p=c.pt(e),[cx,cy,sc]=view,x=cx+(p[0]-220)/220*sc,y=cy-(p[1]-220)/220*sc;if(mode==='m'&&e.shiftKey){jc=[x,y];mode='j';view=[0,0,1.6];root.querySelectorAll('[data-g="frcM"] button').forEach(b=>b.classList.toggle('on',b.dataset.k==='j'));draw();return;}view=[x,y,sc/3];draw();});
  c.addEventListener('contextmenu',e=>{e.preventDefault();if(mode!=='m'&&mode!=='j')return;view[2]=Math.min(2,view[2]*3);draw();});c.addEventListener('dblclick',e=>{e.preventDefault();view[2]=Math.min(2,view[2]*9);draw();});
  bindBtns(root,'frcM',k=>{mode=k;view=k==='m'?[-0.6,0,1.6]:[0,0,1.6];draw();});bindSl('frcI',v=>{it=v;if(mode==='m'||mode==='j')draw();});bindSl('frcA',v=>{ang=v;if(mode==='t')tree();});$('frcR').onclick=()=>{view=mode==='m'?[-0.6,0,1.6]:[0,0,1.6];draw();};
  const V=[[220,20],[20,420],[420,420]];anim(()=>{if(!chaos)return;for(let i=0;i<300;i++){const v=V[Math.floor(Math.random()*3)];chaos.p=[(chaos.p[0]+v[0])/2,(chaos.p[1]+v[1])/2];chaos.n++;if(chaos.n>20){g.fillStyle=['#a585ef','#5fc8d8','#ecd59a'][V.indexOf(v)];g.fillRect(chaos.p[0],chaos.p[1],1,1);}}
    if(chaos.n%3000<300)$('frcInfo').innerHTML=`<div class="kv2"><b>წერტილები</b><span>${chaos.n.toLocaleString('en')}</span><b>განზომილება</b><span>log 3 / log 2 ≈ 1.585</span></div><div class="hint">ყოველ ნაბიჯზე: აირჩიე შემთხვევითი წვერო და გადადი შუა გზაზე.</div>`;});
  draw();
 }});

reg({id:'logmap',ico:'⑂',t:'ქაოსი: ლოგისტიკური ასახვა',s:'ბიფურკაცია · ობობას ქსელი · ფეიგენბაუმი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="lmB"></div><div class="hint">დააწკაპუნე დიაგრამაზე r-ის ასარჩევად</div></div><div class="acol"><div id="lmW"></div><div class="actl">${sl('lmR','ზრდის პარამეტრი r',1,4,0.001,3.2)}${sl('lmX','საწყისი x₀',0.01,0.99,0.01,0.2)}</div><div id="lmI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['xₙ₊₁ = r·xₙ(1 − xₙ)','ლოგისტიკური ასახვა',{s:[['x','პოპულაცია (0…1)'],['r','ზრდის ტემპი']],w:'უმარტივესი არაწრფივი წესი — და მაინც შეიცავს ქაოსს. r < 3: ერთი წონასწორობა; 3–3.57: ორმაგდება 2, 4, 8 …; > 3.57: ქაოსი წესრიგის „ფანჯრებით“.'}],
     ['δ = 4.6692016…','ფეიგენბაუმის მუდმივა',{s:[],w:'ორმაგების ინტერვალები ყოველ ჯერზე δ-ჯერ მცირდება — ყველა ასეთ სისტემაში ერთნაირად (უნივერსალობა).'}],
     ['λ = lim (1/n)Σ ln|r(1 − 2xᵢ)|','ლიაპუნოვის მაჩვენებელი',{s:[],w:'λ > 0 — ქაოსი: ორი თითქმის ტოლი საწყისი პირობა ექსპონენტურად შორდება („პეპლის ეფექტი“).'}],['r = 1 + √8 ≈ 3.828','პერიოდი 3',{s:[],w:'„პერიოდი 3 ქაოსს ნიშნავს“ (ლი–იორკი, 1975).'}]]))}`;
  const c=canvas($('lmB'),440,380),g=c.g,c2=canvas($('lmW'),440,300),h=c2.g;let r=3.2,x0=.2;
  const R0=2.5,R1=4,bif=()=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);g.fillStyle='rgba(214,198,255,.28)';for(let px=0;px<g.W;px++){const rr=R0+(R1-R0)*px/g.W;let x=.5;for(let i=0;i<300;i++)x=rr*x*(1-x);for(let i=0;i<150;i++){x=rr*x*(1-x);g.fillRect(px,(1-x)*(g.H-20)+5,1,1);}}
    [3,3.449,3.544,3.5699,3.8284].forEach(v=>{const px=(v-R0)/(R1-R0)*g.W;txt(g,v,px,g.H-3,COL.dim,'9px sans-serif');});};
  let bg=null;const draw=()=>{if(!bg){bif();bg=g.getImageData(0,0,c.width,c.height);}else g.putImageData(bg,0,0);const px=(r-R0)/(R1-R0)*g.W;g.strokeStyle='#ecd59a';g.beginPath();g.moveTo(px,0);g.lineTo(px,g.H);g.stroke();
    const M=mplot(h,{x:[0,1],y:[0,1],step:.2,stepY:.2,m:[8,8,18,26]});curve(h,M,x=>x,0,1,'rgba(255,255,255,.3)',1,[4,4]);curve(h,M,x=>r*x*(1-x),0,1,VI,2.2);
    let x=x0;h.strokeStyle='rgba(236,213,154,.75)';h.beginPath();h.moveTo(M.X(x),M.Y(0));const seq=[x];for(let i=0;i<120;i++){const y=r*x*(1-x);h.lineTo(M.X(x),M.Y(y));h.lineTo(M.X(y),M.Y(y));x=y;seq.push(x);}h.stroke();
    let lam=0,xx=x0;for(let i=0;i<2000;i++){xx=r*xx*(1-xx);if(i>200)lam+=Math.log(Math.abs(r*(1-2*xx))+1e-12);}lam/=1800;
    const tail=seq.slice(-32),uniq=[...new Set(tail.map(v=>v.toFixed(4)))];
    $('lmI').innerHTML=`<div class="kv2"><b>r</b><span>${r.toFixed(3)}</span><b>ბოლო მნიშვნელობები</b><span>${uniq.length<=8?uniq.join(', '):'არ მეორდება'}</span><b>პერიოდი</b><span>${uniq.length<=16?uniq.length:'∞ (ქაოსი)'}</span><b>ლიაპუნოვი λ</b><span class="${lam>0?'bad':'ok'}">${lam.toFixed(3)} ${lam>0?'— ქაოსი':'— მდგრადი'}</span></div>`;};
  c.addEventListener('click',e=>{const p=c.pt(e);r=R0+(R1-R0)*p[0]/g.W;$('lmR').value=r;$('lmR_v').textContent=r.toFixed(3);draw();});
  bindSl('lmR',v=>{r=v;draw();},v=>v.toFixed(3));bindSl('lmX',v=>{x0=v;draw();},v=>v.toFixed(2));
 }});

reg({id:'graphs',ico:'⬡',t:'გრაფთა თეორია',s:'კენიგსბერგის ხიდები · დეიქსტრა',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="gtC"></div><div class="hint">დააწკაპუნე ორ წვეროზე: საწყისი და საბოლოო</div></div><div class="acol"><div class="actl"><div class="abt"><button id="gtN" class="on">🎲 ახალი გრაფი</button><button id="gtK">🌉 კენიგსბერგი</button></div>${sl('gtV','წვეროები',5,22,1,12)}</div><div id="gtI" class="ainfo"></div></div></div>
   ${card('ფორმულები და ფაქტები',FX([['G = (V, E)','გრაფი: წვეროები და წიბოები',{s:[],w:'ქალაქები და გზები, ადამიანები და მეგობრობა, ნეირონები და სინაფსები, ვებგვერდები და ბმულები.'}],
     ['Σ deg(v) = 2|E|','ხარისხების ლემა',{s:[['deg','წვეროს ხარისხი']],w:'ყოველი წიბო ორ წვეროს ეხება — ამიტომ კენტი ხარისხის წვეროები ყოველთვის ლუწი რაოდენობითაა.'}],
     ['ეილერის გზა ⇔ 0 ან 2 კენტი წვერო','კენიგსბერგი (1736)',{s:[],w:'შვიდივე ხიდზე ერთხელ გავლა შეუძლებელია: ოთხივე ნაწილს კენტი რაოდენობის ხიდი აქვს. ეს იყო გრაფთა თეორიის დაბადება.'}],
     ['დეიქსტრა: d(v) = min(d(v), d(u) + w(u,v))','უმოკლესი გზა',{s:[['w','წიბოს წონა (მანძილი)']],w:'ნავიგატორები, ინტერნეტის მარშრუტიზაცია. ყოველ ნაბიჯზე „ვხსნით“ ყველაზე ახლო ჯერ არნახულ წვეროს.'}],
     ['V − E + F = 2','ეილერის ფორმულა',{s:[['F','წახნაგები']],w:'ნებისმიერი ამოზნექილი მრავალწახნაგასთვის: კუბი 8 − 12 + 6 = 2.'}]]))}`;
  const c=canvas($('gtC'),440,420),g=c.g;let V=[],E=[],sel=[],path=null,steps=[],nV=12,kon=false,anT=0;
  const gen=()=>{kon=false;V=[];E=[];for(let i=0;i<nV;i++){let p,ok=false,tries=0;while(!ok&&tries++<200){p=[40+Math.random()*360,40+Math.random()*340];ok=V.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>55);}V.push(p);}
    const has=(a,b)=>E.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));for(let i=0;i<nV;i++){const near=V.map((q,j)=>[Math.hypot(q[0]-V[i][0],q[1]-V[i][1]),j]).filter(x=>x[1]!==i).sort((a,b)=>a[0]-b[0]).slice(0,3);near.forEach(([d,j],k)=>{if(k<2||Math.random()<.4)if(!has(i,j))E.push([i,j,Math.round(d/10)]);});}
    sel=[0,nV-1];run();};
  const konig=()=>{kon=true;V=[[220,60],[90,210],[350,210],[220,360]];E=[[0,1,1],[0,1,1],[0,2,1],[1,2,1],[3,1,1],[3,1,1],[3,2,1]];sel=[];path=null;draw();};
  const run=()=>{if(kon||sel.length<2){path=null;draw();return;}const n=V.length,d=Array(n).fill(Infinity),pr=Array(n).fill(-1),done=Array(n).fill(false);d[sel[0]]=0;steps=[];
    for(let it=0;it<n;it++){let u=-1;for(let i=0;i<n;i++)if(!done[i]&&(u<0||d[i]<d[u]))u=i;if(u<0||d[u]===Infinity)break;done[u]=true;steps.push(u);E.forEach(([a,b,w])=>{const v=a===u?b:b===u?a:-1;if(v>=0&&d[u]+w<d[v]){d[v]=d[u]+w;pr[v]=u;}});}
    path=[];let k=sel[1];while(k>=0){path.unshift(k);k=pr[k];}if(path[0]!==sel[0])path=[];path.d=d[sel[1]];anT=0;};
  const draw=()=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);const deg=V.map(()=>0);E.forEach(([a,b])=>{deg[a]++;deg[b]++;});const shown=Math.min(steps.length,Math.floor(anT*4));const vis=new Set(steps.slice(0,shown));
    const pairCount={};E.forEach(([a,b,w],i)=>{const key=Math.min(a,b)+'-'+Math.max(a,b);pairCount[key]=(pairCount[key]||0)+1;const k=pairCount[key];const onP=path&&path.length&&anT*4>steps.length&&path.some((p,j)=>j&&((path[j-1]===a&&p===b)||(path[j-1]===b&&p===a)));
      const [x1,y1]=V[a],[x2,y2]=V[b],mx=(x1+x2)/2,my=(y1+y2)/2,nx=-(y2-y1),ny=x2-x1,L=Math.hypot(nx,ny)||1,off=kon?(k===1?(pairCount[key]>1?-30:0):30)*(1):0;
      g.strokeStyle=onP?'#ecd59a':kon?'#5fc8d8':'rgba(214,198,255,.3)';g.lineWidth=onP?3.5:kon?3:1.4;g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(mx+nx/L*off,my+ny/L*off,x2,y2);g.stroke();g.lineWidth=1;if(!kon)txt(g,w,mx+nx/L*8,my+ny/L*8+3,COL.dim,'10px sans-serif');});
    V.forEach((p,i)=>{const isS=sel[0]===i,isT=sel[1]===i;g.fillStyle=isS?'#6fcf8a':isT?'#e8705a':vis.has(i)?'#a585ef':'#2a2142';g.strokeStyle=deg[i]%2&&kon?'#e8705a':VL;g.beginPath();g.arc(p[0],p[1],kon?22:13,0,TAU);g.fill();g.stroke();txt(g,kon?['ჩრდ.','დას.','აღმ.','სამხ.'][i]:i,p[0],p[1]+4,'#fff','600 11px sans-serif');if(kon)txt(g,'deg '+deg[i],p[0],p[1]+38,'#e8705a','11px sans-serif');});
    const odd=deg.filter(x=>x%2).length;$('gtI').innerHTML=kon?`<div class="kv2"><b>წვეროები / ხიდები</b><span>4 / 7</span><b>კენტი ხარისხი</b><span class="bad">${odd} წვერო</span></div><div class="hint">ეილერის გზისთვის საჭიროა 0 ან 2 კენტი წვერო. აქ ოთხივეა კენტი — ყველა ხიდზე ერთხელ გავლა შეუძლებელია.</div>`:
      `<div class="kv2"><b>წვეროები / წიბოები</b><span>${V.length} / ${E.length}</span><b>კენტი ხარისხის</b><span>${odd} ${odd===0?'— ეილერის ციკლი შესაძლებელია':odd===2?'— ეილერის გზა შესაძლებელია':''}</span><b>უმოკლესი გზა</b><span>${path&&path.length?path.join(' → ')+' (სიგრძე '+path.d+')':'—'}</span></div><div class="hint">იისფერი წვეროები — დეიქსტრამ უკვე „გახსნა“ (თანმიმდევრობით).</div>`;};
  c.addEventListener('click',e=>{if(kon)return;const p=c.pt(e);const i=V.findIndex(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<16);if(i<0)return;sel=sel.length>=2?[i]:[...sel,i];run();draw();});
  $('gtN').onclick=gen;$('gtK').onclick=konig;bindSl('gtV',v=>{nV=v;gen();});anim(dt=>{if(!kon&&path&&anT*4<=steps.length+2){anT+=dt;draw();}});
 }});

reg({id:'numth',ico:'⊛',t:'მოდულური არითმეტიკა და კრიპტოგრაფია',s:'გამრავლების ტაბულა წრეზე · RSA',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="ntC"></div><div class="actl">${sl('ntN','წერტილები წრეზე n',10,400,1,200)}${sl('ntK','მამრავლი k',2,60,0.01,2)}<div class="abt"><button id="ntP">▶ k-ს ანიმაცია</button></div></div></div>
    <div class="acol"><div class="calc"><label>p (მარტივი)<input id="ntp" type="number" value="61"></label><label>q (მარტივი)<input id="ntq" type="number" value="53"></label><label>e<input id="nte" type="number" value="17"></label><label>შეტყობინება m<input id="ntm" type="number" value="65"></label></div><div id="ntI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['a ≡ b (mod n)','შედარება მოდულით',{s:[['n','მოდული']],w:'საათის არითმეტიკა: 10 + 5 ≡ 3 (mod 12). წრეზე i → k·i mod n შეერთებით ჩნდება კარდიოიდა (k=2), ნეფროიდა (k=3)…'}],
     ['aᵖ⁻¹ ≡ 1 (mod p)','ფერმას მცირე თეორემა',{s:[['p','მარტივი, a არ იყოფა p-ზე']],w:'RSA-ს გული. მარტივობის სწრაფი ტესტებიც ამას იყენებს.'}],
     ['n = p·q ;  φ = (p−1)(q−1)','RSA გასაღები',{s:[['φ','ეილერის ფუნქცია']],w:'n საჯაროა, მაგრამ p და q-ს პოვნა (დაშლა) ძალიან დიდი n-ისთვის პრაქტიკულად შეუძლებელია.'}],
     ['c = mᵉ mod n ;  m = cᵈ mod n','დაშიფვრა/გაშიფვრა',{s:[['d','e-ს შებრუნებული mod φ']],w:'ყოველ HTTPS კავშირში (ან მის თანამედროვე მემკვიდრეებში) მსგავსი მათემატიკა მუშაობს.'}]]))}`;
  const c=canvas($('ntC'),420,420),g=c.g;let n=200,k=2,play=false;
  const draw=()=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);const cx=210,cy=210,R=190,P=i=>[cx+R*Math.cos(TAU*i/n-Math.PI/2),cy+R*Math.sin(TAU*i/n-Math.PI/2)];
    g.strokeStyle='rgba(214,198,255,.25)';g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();g.globalCompositeOperation='lighter';
    for(let i=0;i<n;i++){const a=P(i),b=P((i*k)%n);g.strokeStyle=`hsla(${260+i/n*120},70%,65%,.45)`;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();}g.globalCompositeOperation='source-over';
    txt(g,`i → ${k.toFixed(2)}·i mod ${n}`,cx,g.H-4,COL.mid,'11px sans-serif');};
  bindSl('ntN',v=>{n=v;draw();});const ks=bindSl('ntK',v=>{k=v;draw();},v=>v.toFixed(2));$('ntP').onclick=e=>{play=!play;e.target.textContent=play?'⏸ პაუზა':'▶ k-ს ანიმაცია';};
  anim(dt=>{if(!play)return;k+=dt*.15;if(k>60)k=2;ks.value=k;$('ntK_v').textContent=k.toFixed(2);draw();});
  const isP=x=>{if(x<2)return false;for(let i=2;i*i<=x;i++)if(x%i===0)return false;return true;};
  const pw=(b,e,m)=>{let r=1n;b=BigInt(b)%BigInt(m);e=BigInt(e);const M=BigInt(m);while(e>0n){if(e&1n)r=r*b%M;b=b*b%M;e>>=1n;}return r;};
  const inv=(a,m)=>{let [o,r]=[a,m],[s,t]=[1,0];while(r){const q=Math.floor(o/r);[o,r]=[r,o-q*r];[s,t]=[t,s-q*t];}return o===1?((s%m)+m)%m:null;};
  const rsa=()=>{const p=+$('ntp').value,q=+$('ntq').value,e=+$('nte').value,m=+$('ntm').value;let h='';
    if(!isP(p)||!isP(q)){$('ntI').innerHTML='<div class="bad">p და q მარტივი უნდა იყოს.</div>';return;}const N=p*q,phi=(p-1)*(q-1),d=inv(e,phi);
    if(!d){$('ntI').innerHTML=`<div class="bad">e = ${e} და φ = ${phi} ურთიერთმარტივი არ არის — აირჩიე სხვა e.</div>`;return;}if(m>=N){$('ntI').innerHTML=`<div class="bad">m < n = ${N} უნდა იყოს.</div>`;return;}
    const cph=pw(m,e,N),back=pw(cph,d,N);
    $('ntI').innerHTML=`<div class="kv2"><b>n = p·q</b><span>${N}</span><b>φ(n)</b><span>${phi}</span><b>საჯარო გასაღები</b><span>(e = ${e}, n = ${N})</span><b>საიდუმლო d</b><span>${d} (e·d ≡ 1 mod φ)</span><b>დაშიფრული c</b><span class="big" style="font-size:18px">${cph}</span><b>გაშიფრული</b><span class="${Number(back)===m?'ok':'bad'}">${back}</span></div><div class="hint">რეალურ RSA-ში p და q ~300-ნიშნა რიცხვებია.</div>`;};
  ['ntp','ntq','nte','ntm'].forEach(i=>$(i).oninput=rsa);rsa();draw();
 }});

reg({id:'inf',ico:'∞',t:'უსასრულობა',s:'ჰილბერტის სასტუმრო · კანტორის დიაგონალი · სივრცის შემვსები მრუდი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div id="ifC"></div><div class="actl"><div>${btns('ifM',[['hotel','ჰილბერტის სასტუმრო'],['curve','ჰილბერტის მრუდი']],'hotel')}</div>${sl('ifO','მრუდის რიგი',1,7,1,4)}<div class="abt"><button id="ifG">🚌 ახალი სტუმარი</button><button id="ifB">🚍 უსასრულო ავტობუსი</button></div></div></div>
    <div class="acol"><div class="lx"><p><b>კანტორის დიაგონალი.</b> დავუშვათ, 0-სა და 1-ს შორის ყველა რიცხვი ჩამოვწერეთ სიაში. ავაგოთ ახალი: მისი n-ური ციფრი n-ური რიცხვის n-ური ციფრისგან განსხვავდება. ის სიაში არ არის — ესე იგი ნამდვილი რიცხვები „დათვლადზე მეტია“.</p></div><div id="ifD"></div><div class="abt"><button id="ifR">🎲 ახალი სია</button></div></div></div>
   ${card('ფაქტები',FX([['|ℕ| = |ℤ| = |ℚ| = ℵ₀','დათვლადი უსასრულობა',{s:[['ℵ₀','ალეფ-ნული']],w:'ლუწი რიცხვები „იმდენივეა“, რამდენიც ყველა ნატურალური: n ↔ 2n. ნაწილი შეიძლება მთელის ტოლი იყოს!'}],
     ['|ℝ| = 2^ℵ₀ > ℵ₀','კონტინუუმი',{s:[],w:'დიაგონალური არგუმენტი (კანტორი, 1891). უსასრულობები სხვადასხვა ზომისაა.'}],['|P(A)| > |A|','კანტორის თეორემა',{s:[['P(A)','A-ს ყველა ქვესიმრავლე']],w:'ყველაზე დიდი უსასრულობა არ არსებობს.'}],
     ['ჰილბერტის მრუდი → კვადრატი','სივრცის შემვსები მრუდი',{s:[],w:'ერთგანზომილებიანი ხაზი, რომელიც ზღვარში მთელ კვადრატს ავსებს. გამოიყენება მონაცემთა ბაზებში და სურათების დამუშავებაში.'}]]))}`;
  const c=canvas($('ifC'),440,400),g=c.g;let mode='hotel',ord=4,shift=0,anT=0,kind=0;
  const hil=(n)=>{const N=1<<n,pts=[];for(let d=0;d<N*N;d++){let x=0,y=0,t=d;for(let s=1;s<N;s*=2){const rx=1&(t/2),ry=1&(t^rx);if(ry===0){if(rx===1){x=s-1-x;y=s-1-y;}[x,y]=[y,x];}x+=s*rx;y+=s*ry;t=Math.floor(t/4);}pts.push([x,y]);}return {pts,N};};
  let H=hil(ord);
  anim(dt=>{g.fillStyle='#0b0816';g.fillRect(0,0,g.W,g.H);
    if(mode==='curve'){anT+=dt;const {pts,N}=H,s=(g.W-40)/N,shown=Math.min(pts.length,Math.floor(anT*pts.length/3)+2);g.lineWidth=Math.max(1,6-ord);g.beginPath();
      for(let i=0;i<shown;i++){const x=20+(pts[i][0]+.5)*s,y=20+(pts[i][1]+.5)*s*(g.H-40)/(g.W-40);i?g.lineTo(x,y):g.moveTo(x,y);}g.strokeStyle=VI;g.stroke();g.lineWidth=1;txt(g,`რიგი ${ord}: ${pts.length} წერტილი`,g.W/2,g.H-4,COL.mid,'11px sans-serif');return;}
    anT=Math.min(1,anT+dt*.7);const rooms=12,w=(g.W-20)/6;for(let i=0;i<rooms;i++){const x=10+(i%6)*w,y=40+Math.floor(i/6)*150;g.strokeStyle='rgba(214,198,255,.35)';g.strokeRect(x+3,y,w-6,110);txt(g,'ოთახი '+(i+1),x+w/2,y+128,COL.dim,'10px sans-serif');
      const src=kind===0?i-shift:kind===1?(i%2===1?(i-1)/2:-1):-1;const from=kind===1?Math.floor(i/2):src;
      if(kind===0){const occupied=i>=shift;if(occupied){const fromI=i-shift*anT;const fx=10+(fromI%6)*w;dot(g,lerp(10+((i-shift)%6)*w,x,anT)+w/2,y+60,13,'#a585ef');txt(g,i-shift+1,lerp(10+((i-shift)%6)*w,x,anT)+w/2,y+64,'#fff','600 11px sans-serif');}else{dot(g,x+w/2,y+60,13,'#ecd59a');txt(g,'ახ',x+w/2,y+64,'#0b0816','600 10px sans-serif');}}
      else{if(i%2===1){dot(g,x+w/2,y+60,13,'#a585ef');txt(g,(i+1)/2,x+w/2,y+64,'#fff','600 11px sans-serif');}else{dot(g,x+w/2,y+60,13,'#5fc8d8');txt(g,'ა'+(i/2+1),x+w/2,y+64,'#0b0816','600 10px sans-serif');}}}
    txt(g,kind===0?`ყველა სტუმარი n → n + ${shift}: ${shift} ოთახი გათავისუფლდა`:'n → 2n: კენტი ოთახები ავტობუსის უსასრულო სტუმრებს',g.W/2,22,VL,'12px sans-serif');txt(g,'… და ასე უსასრულოდ →',g.W-10,g.H-8,COL.dim,'11px sans-serif','right');});
  $('ifG').onclick=()=>{mode='hotel';kind=0;shift=Math.min(shift+1,5);anT=0;};$('ifB').onclick=()=>{mode='hotel';kind=1;anT=0;};
  bindBtns(root,'ifM',k=>{mode=k;anT=0;});bindSl('ifO',v=>{ord=v;H=hil(v);anT=0;});
  const cant=()=>{const rows=[...Array(8)].map(()=>[...Array(10)].map(()=>Math.floor(Math.random()*10)));const nd=rows.map((r,i)=>(r[i]+1+Math.floor(Math.random()*8))%10===r[i]?(r[i]+1)%10:(r[i]+5)%10);
    $('ifD').innerHTML=`<div class="seqbox" style="font-size:13px">${rows.map((r,i)=>`${i+1}. 0.${r.map((d,j)=>j===i?`<b style="color:#e8705a">${d}</b>`:d).join('')}…`).join('<br>')}<br><span style="color:#ecd59a">ახალი: 0.${nd.join('')}… — არცერთს არ ემთხვევა!</span></div>`;};
  $('ifR').onclick=cant;cant();
 }});

reg({id:'mref',ico:'∑',t:'ყველა ფორმულა',s:'საძიებო ცნობარი',
 build(root){root.innerHTML=`<input class="tin" id="mrQ" placeholder="ძიება: მაგ. „ინტეგრალი“, „sin“, „დეტერმინანტი“" style="width:100%;margin-bottom:10px"><div id="mrL"></div>`;
  const all=harvest();const show=()=>{const q=$('mrQ').value.trim().toLowerCase();$('mrL').innerHTML=all.map(([t,ico,list])=>{const L=list.filter(([f,d])=>!q||(f+' '+d+' '+t).toLowerCase().includes(q));
    return L.length?card(`${ico} ${t}`,FX(L.map(x=>[x[0],x[1],x[2]]))):'';}).join('')||'<div class="hint">ვერაფერი მოიძებნა.</div>';K.attachXp($('mrL'));};$('mrQ').oninput=show;show();}});
function harvest(){const out=[],tmp=document.createElement('div');tmp.style.cssText='position:absolute;left:-9999px;width:800px';document.body.appendChild(tmp);
  for(const id of ORDER){if(id==='mref')continue;const t=T[id];try{t.build(tmp);}catch(e){}K.stopAll();const list=[...tmp.querySelectorAll('.acard .af')].map(a=>[a.querySelector('.ff').innerHTML,(a.querySelector('.fd')||{}).innerHTML||'',a.dataset.xi!=null?K.XPS[+a.dataset.xi]:null]);out.push([t.t,t.ico,list]);tmp.innerHTML='';}
  tmp.remove();return out;}

/* ═══════════════════ path: levels, intros, quizzes ═══════════════════ */
const LEVELS=[
 {t:'ნული',n:'რიცხვები',d:'რიცხვითი წრფე, წილადები, ხარისხები და მარტივი რიცხვები — ყველაფრის საძირკველი.',ids:['num','frac','pow','prime']},
 {t:'ალგებრა და გეომეტრია',n:'',d:'ფუნქციები, განტოლებები, სამკუთხედები და წრე.',ids:['lin','quad','geo','trig','pi']},
 {t:'ანალიზი',n:'ცვლილების მათემატიკა',d:'ზღვრები, წარმოებული, ინტეგრალი, მწკრივები, დიფერენციალური განტოლებები.',ids:['seq','deriv','integ','taylor','ode']},
 {t:'უმაღლესი',n:'სივრცე და შემთხვევა',d:'კომპლექსური რიცხვები, წრფივი ალგებრა, ვექტორები, ალბათობა და სტატისტიკა.',ids:['complex','linalg','vec3','prob','stat']},
 {t:'გმირი',n:'თანამედროვე მათემატიკა',d:'ფურიე, ფრაქტალები, ქაოსი, გრაფები, კრიპტოგრაფია, უსასრულობა.',ids:['fourier','fractal','logmap','graphs','numth','inf','mref']}];
let ORDER=LEVELS.flatMap(l=>l.ids);
const CL=(h,l)=>` <a href="math_classic.html#${h}" style="color:var(--acc2)">${l} →</a>`;
const INTRO={
 num:'მათემატიკა იწყება წრფით: ყოველი რიცხვი — წერტილია, ყოველი მოქმედება — ნახტომი. <ul><li>რატომ ხდება „მინუსი მინუსზე“ პლიუსი</li><li>რიცხვების ოჯახები ℕ → ℂ</li></ul>',
 frac:'წილადი — მთელის ნაწილია. ნახე, რატომ გვჭირდება საერთო მნიშვნელი და რას ნიშნავს პროცენტი.'+CL('frac','კლასიკური წილადების კალკულატორი ნაბიჯებით'),
 pow:'ხარისხი — განმეორებითი გამრავლება, ლოგარითმი — მისი შებრუნება. მოკეცე ქაღალდი 42-ჯერ და მთვარეს მიაღწევ.',
 prime:'მარტივი რიცხვები — მათემატიკის ატომები. ნახე, როგორ „ცრის“ მათ ერატოსთენე და რა უცნაურ ნიმუშს ქმნის ულამის სპირალი.',
 lin:'წრფივი ფუნქცია — მუდმივი ცვლილება. ორი წრფის გადაკვეთა — ორუცნობიანი სისტემის ამოხსნაა.'+CL('eq','განტოლებების ამომხსნელი'),
 quad:'პარაბოლა — სროლის, ხიდის თაღისა და ანტენის ფორმა. დისკრიმინანტი გეტყვის ფესვების რაოდენობას ამოხსნამდე.',
 geo:'2500 წლის თეორემა, რომელსაც 300-ზე მეტი მტკიცება აქვს. აქ — ყველაზე ვიზუალური.'+CL('geo','სამკუთხედის კალკულატორი'),
 trig:'სინუსი და კოსინუსი — წრეზე მბრუნავი წერტილის ჩრდილები. აქედან იბადება ყველა ტალღა.'+CL('trig','კუთხეების ინსტრუმენტი'),
 pi:'π — ყველაზე ცნობილი რიცხვი. არქიმედეს მეთოდით და შემთხვევითი ისრებით ვიპოვით.',
 seq:'უსასრულოდ ბევრი რიცხვის ჯამი შეიძლება სასრული იყოს — და შეიძლება არა. ზღვრის ცნება ანალიზის საწყისია.',
 deriv:'წარმოებული — მყისიერი ცვლილების სიჩქარე: სპიდომეტრი, ზრდის ტემპი, მრუდის დახრა წერტილში.',
 integ:'ინტეგრალი — უსასრულოდ ბევრი უსასრულოდ ვიწრო ზოლის ჯამი. გავლილი მანძილი, ფართობი, მოცულობა.',
 taylor:'ნებისმიერი „გლუვი“ ფუნქცია შეიძლება პოლინომით მივუახლოვოთ — ასე ითვლის კალკულატორი sin-ს.',
 ode:'ბუნების კანონები ხშირად ცვლილების წესებია: dy/dx = f(x, y). ვხატავთ ველს და მივყვებით ისრებს.',
 complex:'i — რიცხვი, რომლის კვადრატი −1-ია. რიცხვითი წრფე სიბრტყედ იქცევა, გამრავლება — ბრუნვად.',
 linalg:'მატრიცა — სივრცის გარდაქმნა. ნახე როგორ იღუნება ბადე, რას ზომავს დეტერმინანტი და რომელი ვექტორები არ იცვლის მიმართულებას.'+CL('mat','მატრიცების კალკულატორი'),
 vec3:'სამგანზომილებიანი ვექტორები — ფიზიკისა და კომპიუტერული გრაფიკის ენა.',
 prob:'შემთხვევითობაშიც არის კანონზომიერება: ათასობით ბურთი ზარისებრ მრუდს ქმნის.',
 stat:'როგორ ვიპოვოთ კანონზომიერება ხმაურიან მონაცემებში — და როდის არ უნდა ვენდოთ მას.',
 fourier:'ნებისმიერი ფორმა — მბრუნავი წრეების ჯაჭვი. დახატე რაიმე და ნახე, როგორ აღადგენს მას ფურიე.',
 fractal:'მარტივი წესი zₙ₊₁ = zₙ² + c — და უსასრულოდ რთული სამყარო. გაადიდე და იმოგზაურე.',
 logmap:'დეტერმინისტული, მაგრამ არაპროგნოზირებადი: ქაოსი უმარტივეს განტოლებაში.',
 graphs:'წერტილები და ხაზები — ქსელები ყველგან: გზები, მეგობრები, ინტერნეტი, ნეირონები.',
 numth:'საათის არითმეტიკა — ლამაზი ნიმუშები და ინტერნეტის უსაფრთხოება.',
 inf:'უსასრულობა ერთი არ არის. ჰილბერტის სასტუმრო ყოველთვის იპოვის ოთახს.',
 mref:'ყველა გაკვეთილის ფორმულა ერთ ადგილას, ძიებით.'};
const QUIZ={
 num:[['რას უდრის −3 − (−5)?',['2','−8','8','−2'],0,'გამოკლება = საპირისპიროს მიმატება: −3 + 5 = 2.'],['(−4)·(−3) = ?',['12','−12','−7','7'],0,'მინუსზე მინუსი პლიუსია.'],['რომელი არ არის რაციონალური?',['√2','0.75','−3','1/7'],0,'√2 წილადად ვერ ჩაიწერება.'],['|−9| = ?',['9','−9','0','81'],0,'მოდული — მანძილი ნულამდე.'],['რომელი სიმრავლე შეიცავს −5-ს, მაგრამ არა ½-ს?',['ℤ','ℕ','ℚ','ℝ'],0,'მთელი რიცხვები.']],
 frac:[['½ + ⅓ = ?',['5/6','2/5','1/6','2/6'],0,'საერთო მნიშვნელი 6: 3/6 + 2/6.'],['ფასი 20%-ით გაიზარდა, მერე 20%-ით შემცირდა. საბოლოოდ?',['4%-ით ნაკლებია','იგივეა','4%-ით მეტია','20%-ით ნაკლებია'],0,'1.2 · 0.8 = 0.96.'],['¾ : ½ = ?',['3/2','3/8','1/4','2/3'],0,'¾ · 2 = 3/2.'],['რომელია მეტი: 5/8 თუ 3/5?',['5/8','3/5','ტოლია','შეუძლებელია'],0,'ჯვარედინი: 25 > 24.']],
 pow:[['2⁻³ = ?',['1/8','−8','−6','8'],0,'უარყოფითი მაჩვენებელი — შებრუნებული.'],['log₂ 32 = ?',['5','16','6','4'],0,'2⁵ = 32.'],['a⁰ = ? (a ≠ 0)',['1','0','a','განუსაზღვრელი'],0,'aⁿ/aⁿ = a⁰ = 1.'],['9^(1/2) = ?',['3','4.5','81','1/9'],0,'წილადი მაჩვენებელი ფესვია.'],['3·10⁵ · 2·10³ = ?',['6·10⁸','6·10¹⁵','5·10⁸','6·10²'],0,'მაჩვენებლები იკრიბება.']],
 prime:[['რომელია მარტივი?',['97','91','51','1'],0,'91 = 7·13, 51 = 3·17, 1 მარტივი არ არის.'],['უსგ(84, 36) = ?',['12','6','4','36'],0,'84 = 2·36 + 12, 36 = 3·12.'],['360 მარტივ მამრავლებად?',['2³·3²·5','2²·3³·5','2³·3·15','6²·10'],0,'8·9·5 = 360.'],['რამდენი მარტივი რიცხვია სულ?',['უსასრულოდ ბევრი','100 მილიონი','უცნობია','ზუსტად 1000'],0,'ევკლიდეს მტკიცება.']],
 lin:[['y = 2x − 4 კვეთს x-ღერძს წერტილში:',['x = 2','x = −4','x = 4','x = −2'],0,'2x − 4 = 0.'],['რომელი წრფეა y = 3x + 1-ის პარალელური?',['y = 3x − 5','y = −3x + 1','y = x/3','y = −x/3'],0,'ერთნაირი დახრა.'],['y = 2x + 1-ის მართობულის დახრა:',['−½','2','−2','½'],0,'k₁·k₂ = −1.'],['k = 0 ნიშნავს:',['ჰორიზონტალურ წრფეს','ვერტიკალურ წრფეს','45°-ს','წრფე არ არსებობს'],0,'y არ იცვლება.']],
 quad:[['x² − 5x + 6 = 0-ის ფესვები:',['2 და 3','−2 და −3','1 და 6','−1 და 6'],0,'ვიეტი: ჯამი 5, ნამრავლი 6.'],['D < 0 ნიშნავს:',['ნამდვილი ფესვი არ არის','ორ ფესვს','ერთ ფესვს','a < 0'],0,'პარაბოლა x-ღერძს არ კვეთს.'],['y = x² − 4x + 1-ის წვეროს x:',['2','−2','4','1'],0,'x₀ = −b/2a = 4/2.'],['a < 0-ზე პარაბოლა:',['ქვევით იხსნება','ზევით იხსნება','წრფეა','წრეა'],0,'']],
 geo:[['კათეტები 6 და 8. ჰიპოტენუზა?',['10','14','12','√14'],0,'36 + 64 = 100.'],['სამკუთხედის კუთხეების ჯამი სიბრტყეზე:',['180°','360°','90°','დამოკიდებულია'],0,''],['კოსინუსების თეორემა γ = 90°-ზე იქცევა:',['პითაგორას თეორემად','სინუსების თეორემად','ჰერონად','არაფრად'],0,'cos 90° = 0.'],['3–4–5 სამკუთხედის ფართობი:',['6','12','7.5','10'],0,'3·4/2.']],
 trig:[['sin 30° = ?',['½','√3/2','1','√2/2'],0,''],['sin²α + cos²α = ?',['1','0','2','tg α'],0,'პითაგორა ერთეულოვან წრეზე.'],['π რადიანი = ?',['180°','90°','360°','57.3°'],0,''],['რომელ მეოთხედში sin > 0, cos < 0?',['II','I','III','IV'],0,''],['tg 90° = ?',['არ არსებობს (∞)','0','1','−1'],0,'cos 90° = 0.']],
 pi:[['π = ?',['წრეწირი / დიამეტრი','ფართობი / რადიუსი','წრეწირი / რადიუსი','22/7 ზუსტად'],0,'22/7 მხოლოდ მიახლოებაა.'],['r = 2 წრის ფართობი:',['4π','2π','π','8π'],0,'πr².'],['არქიმედემ π-ის შესაფასებლად გამოიყენა:',['96-კუთხედი','ისრები','მწკრივები','კომპიუტერი'],0,''],['მონტე-კარლოს მეთოდის ცდომილება მცირდება როგორც:',['1/√N','1/N','1/N²','არ მცირდება'],0,'']],
 seq:[['½ + ¼ + ⅛ + … = ?',['1','∞','2','½'],0,'a/(1 − q) = ½ / ½.'],['ჰარმონიული მწკრივი 1 + ½ + ⅓ + …',['განშლადია','უდრის 2-ს','უდრის e-ს','უდრის π²/6'],0,''],['lim (1 + 1/n)ⁿ = ?',['e','1','∞','2'],0,''],['1 + 1/4 + 1/9 + … = ?',['π²/6','2','e','∞'],0,'ბაზელის ამოცანა.']],
 deriv:[['(x³)′ = ?',['3x²','x²','3x³','x⁴/4'],0,''],['(sin x)′ = ?',['cos x','−cos x','−sin x','tg x'],0,''],['f′(x₀) = 0 ხშირად ნიშნავს:',['ექსტრემუმს','ფესვს','წყვეტას','ასიმპტოტას'],0,'მხები ჰორიზონტალურია.'],['რომელი ფუნქციაა საკუთარი წარმოებული?',['eˣ','ln x','x²','sin x'],0,''],['(sin 2x)′ = ?',['2cos 2x','cos 2x','−2cos 2x','2sin x'],0,'ჯაჭვის წესი.']],
 integ:[['∫₀¹ x² dx = ?',['⅓','½','1','2'],0,'x³/3 0-დან 1-მდე.'],['ნიუტონ–ლაიბნიცი: ∫ₐᵇ f = ?',['F(b) − F(a)','F(a) − F(b)','f(b) − f(a)','F(b)·F(a)'],0,''],['ღერძის ქვემოთ ფართობი ინტეგრალში ითვლება:',['უარყოფითად','დადებითად','არ ითვლება','ორმაგად'],0,''],['რომელი მეთოდია ზუსტი უფრო სწრაფად?',['ტრაპეცია/შუა წერტილი','მარცხენა','მარჯვენა','ყველა ერთნაირი'],0,'~1/n² vs ~1/n.']],
 taylor:[['eˣ-ის მწკრივის მესამე წევრი:',['x²/2','x²','x³/6','2x'],0,'1 + x + x²/2! + …'],['sin x ≈ ? (პატარა x)',['x','1','x²','0'],0,''],['ln(1+x)-ის მწკრივი იკრიბება:',['−1 < x ≤ 1','ყველა x-ზე','x > 0','არსად'],0,''],['e^(ix) = ?',['cos x + i·sin x','sin x + i·cos x','eˣ·i','1'],0,'ეილერის ფორმულა.']],
 ode:[["y′ = ky-ის ამონახსნი:",['y₀e^(kx)','kx + c','sin kx','y₀/(1+kx)'],0,''],['ეილერის მეთოდის ნაბიჯი:',['yₙ₊₁ = yₙ + h·f(xₙ, yₙ)','yₙ₊₁ = yₙ·h','yₙ₊₁ = f(yₙ)','yₙ₊₁ = yₙ − h'],0,''],['RK4-ის ცდომილება ნაბიჯზე h:',['~h⁴','~h','~h²','არ არის'],0,''],['ლოგისტიკური მრუდი მიისწრაფვის:',['ტევადობისკენ K','უსასრულობისკენ','ნულისკენ','რხევისკენ'],0,'']],
 complex:[['i² = ?',['−1','1','i','0'],0,''],['კომპლექსურ რიცხვთა გამრავლებისას კუთხეები:',['იკრიბება','მრავლდება','აკლდება','არ იცვლება'],0,''],['|3 + 4i| = ?',['5','7','1','25'],0,'√(9 + 16).'],['z⁵ = 1-ს რამდენი კომპლექსური ფესვი აქვს?',['5','1','2','უსასრულოდ ბევრი'],0,''],['e^(iπ) = ?',['−1','1','i','0'],0,'']],
 linalg:[['[2 0; 0 3]-ის დეტერმინანტი:',['6','5','0','1'],0,''],['det = 0 ნიშნავს, რომ გარდაქმნა:',['სიბრტყეს წრფედ ან წერტილად აბრტყელებს','ბრუნავს','არეკლავს','არაფერს ცვლის'],0,''],['ბრუნვის მატრიცას ნამდვილი საკუთრივი ვექტორი (0°/180°-ის გარდა):',['არ აქვს','ორი აქვს','ერთი აქვს','უსასრულოდ ბევრი'],0,''],['det < 0 ნიშნავს:',['ორიენტაცია შებრუნდა','ფართობი გაიზარდა','გარდაქმნა შებრუნებადი არ არის','ბრუნვაა'],0,''],['AB = BA ყოველთვის?',['არა','კი','მხოლოდ 2×2-ზე','მხოლოდ det>0-ზე'],0,'']],
 vec3:[['a·b = 0 ნიშნავს:',['მართობულს','პარალელურს','ტოლს','ნულოვანს'],0,''],['a × b მიმართულია:',['ორივეს მართობულად','a-ს გასწვრივ','b-ს გასწვრივ','შემთხვევით'],0,'მარჯვენა ხელის წესი.'],['|a × b| = ?',['პარალელოგრამის ფართობი','|a| + |b|','a·b','კუთხე'],0,''],['(1,0,0) × (0,1,0) = ?',['(0,0,1)','(0,0,−1)','(1,1,0)','0'],0,'î × ĵ = k̂.']],
 prob:[['ორი კამათლის ყველაზე სავარაუდო ჯამი:',['7','12','6','2'],0,'6 კომბინაცია 36-დან.'],['მონეტა 5-ჯერ გერბზე დაეცა. მე-6-ზე გერბის ალბათობა:',['½','მცირეა','დიდია','1/64'],0,'დამოუკიდებელია.'],['ცენტრალური ზღვრული თეორემა ამბობს, რომ ბევრი შემთხვევითი სიდიდის ჯამი:',['ნორმალურ განაწილებას უახლოვდება','თანაბარია','ნულისკენ მიდის','ქაოსურია'],0,''],['ბაიესი: იშვიათი დაავადების ზუსტი ტესტის დადებითი პასუხი:',['შეიძლება მაინც სავარაუდოდ ცრუ იყოს','ყოველთვის ნიშნავს დაავადებას','99%-ია','0%-ია'],0,'საბაზისო სიხშირე მნიშვნელოვანია.']],
 stat:[['კორელაცია r = −0.9 ნიშნავს:',['ძლიერ უარყოფით კავშირს','კავშირი არ არის','სუსტ კავშირს','მიზეზობრიობას'],0,''],['ერთი „გამოვარდნილი“ წერტილი ძლიერ ცვლის:',['საშუალოს','მედიანას','მოდას','არაფერს'],0,''],['უმცირესი კვადრატების წრფე მინიმუმს ხდის:',['ნარჩენების კვადრატების ჯამს','წერტილების რაოდენობას','კორელაციას','დახრას'],0,''],['კორელაცია ადასტურებს მიზეზობრიობას?',['არა','კი','r > 0.5-ზე კი','მხოლოდ R²-ით'],0,'']],
 fourier:[['მართკუთხა ტალღა შედგება:',['კენტი ჰარმონიკებისგან','ლუწი ჰარმონიკებისგან','ერთი სინუსისგან','ხმაურისგან'],0,''],['გიბსის ფენომენი — ესაა:',['გადახტომა წყვეტის ახლოს','ხმის ექო','ფრაქტალი','ქაოსი'],0,''],['სად გამოიყენება ფურიე?',['JPEG, MP3, MRI','მხოლოდ თეორიაში','სამზარეულოში','არსად'],0,''],['DFT-ის ყოველი კოეფიციენტი ეპიციკლში არის:',['წრე თავისი რადიუსით და სიჩქარით','წერტილი','წრფე','კვადრატი'],0,'']],
 fractal:[['მანდელბროტის ფორმულა:',['z → z² + c','z → 2z','z → c/z','z → sin z'],0,''],['სერპინსკის სამკუთხედის განზომილება:',['≈ 1.585','2','1','3'],0,'log3/log2.'],['ქაოსის თამაშში ყოველ ნაბიჯზე:',['შემთხვევითი წვეროსკენ ნახევარ გზას გადიხარ','წრეს ხატავ','ხაზს აორმაგებ','არაფერი'],0,''],['ფრაქტალის მთავარი თვისება:',['თვითმსგავსება','სიმეტრია','სიგლუვე','სასრულობა'],0,'']],
 logmap:[['r < 3-ზე ლოგისტიკური ასახვა:',['ერთ წერტილს უახლოვდება','ქაოსურია','ორ წერტილს შორის რხევაა','ნულია'],0,''],['ფეიგენბაუმის მუდმივა ≈',['4.669','3.14','2.718','1.618'],0,''],['ლიაპუნოვის მაჩვენებელი λ > 0 ნიშნავს:',['ქაოსს','მდგრადობას','ციკლს','ნულს'],0,''],['ქაოსური სისტემა დეტერმინისტულია?',['კი, მაგრამ არაპროგნოზირებადი','არა','მხოლოდ r=4-ზე','მხოლოდ კომპიუტერში'],0,'']],
 graphs:[['ეილერის გზა არსებობს, თუ კენტი ხარისხის წვეროები:',['0 ან 2','ყველა','ზუსტად 1','4'],0,''],['ხარისხების ჯამი = ?',['2 × წიბოები','წიბოები','წვეროები','0'],0,''],['დეიქსტრა პოულობს:',['უმოკლეს გზას','ეილერის ციკლს','ფერადობას','ყველა გზას'],0,''],['კუბისთვის V − E + F = ?',['2','0','6','8'],0,'8 − 12 + 6.']],
 numth:[['17 mod 5 = ?',['2','3','12','1'],0,''],['RSA-ს უსაფრთხოება ეყრდნობა:',['დიდი რიცხვის დაშლის სირთულეს','π-ს','ფრაქტალებს','შემთხვევითობას'],0,''],['ფერმას მცირე თეორემა: aᵖ⁻¹ mod p = ?',['1','0','a','p'],0,'p მარტივია, a არ იყოფა p-ზე.'],['წრეზე k = 2-ით შეერთება ქმნის:',['კარდიოიდას','წრეს','კვადრატს','ვარსკვლავს'],0,'']],
 inf:[['ლუწი რიცხვები ნატურალურზე:',['ტოლი რაოდენობისაა','ნახევარია','ნაკლებია','მეტია'],0,'n ↔ 2n.'],['ნამდვილი რიცხვები:',['დათვლადზე მეტია','დათვლადია','სასრულია','ℕ-ის ტოლია'],0,'კანტორის დიაგონალი.'],['ყველაზე დიდი უსასრულობა:',['არ არსებობს','ℵ₀','|ℝ|','∞'],0,'კანტორის თეორემა.'],['ჰილბერტის სასტუმრო სავსეა. ახალ სტუმარს:',['ყველა n → n+1 გადაიწევს','ვერ მიიღებენ','გარეთ დატოვებენ','ბოლოს მიიღებენ'],0,'']]};

/* extensions (math_lab2.js …): window.MATHLAB_EXT = [kit => ({level, at, mods, intro, quiz})] — loaded before this file */
for(const ext of (window.MATHLAB_EXT||[])){try{const e=ext({K,reg,T})||{};(e.mods||[]).forEach(reg);
  if(e.level)LEVELS.splice(e.at!=null?e.at:LEVELS.length-1,0,e.level);Object.assign(INTRO,e.intro||{});Object.assign(QUIZ,e.quiz||{});}catch(err){console.warn('math ext',err);}}
ORDER=LEVELS.flatMap(l=>l.ids);
const host=$('mathp');if(!host)return;
window.MATHLAB=SCIPATH.mount({host,key:'math',title:'მათემატიკა',accent:'#a585ef',accent2:'#e4d8ff',levels:LEVELS,meta:id=>T[id],intro:INTRO,quiz:QUIZ,
  build:(id,el)=>T[id].build(el),decorate:el=>K.attachXp(el)});
})();
