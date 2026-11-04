/* precession_tab.js — „პრეცესია“ tab (astro.html, ◎ ორბიტები group)
   One clock (−13 000 … +13 000) drives three linked views:
     1 რატომ — the Earth as a spinning top: equatorial bulge (exaggerated), Sun and Moon pull it
       towards the ecliptic, the axis answers by turning around the ecliptic pole (cone)
     2 პოლუსი — sky map around the ecliptic north pole; the celestial pole runs along its 23.44°
       circle past Thuban, Polaris, Errai, Alderamin, Deneb, Vega …
     3 ეპოქები — the ecliptic with the IAU constellation borders (constellations.js, Roman 1987);
       the vernal point ♈ slides backwards → the astrological age, the ayanamsa
   Precession: mean rate 50.29″/yr (one turn ≈ 25 772 years), J2000 ecliptic as the fixed frame;
   obliquity kept at 23.44° (its own 41 000-year swing 22.1°–24.5° is a separate cycle).        */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const D2R=Math.PI/180,R2D=180/Math.PI,EPS=23.4393,PER=25772,RATE=360/PER;     /* °/year */
const p=y=>(y-2000)*RATE;                                                       /* general precession since J2000, ° */
/* ayanamsas at J2000 (Swiss Ephemeris get_ayanamsa_ut, 2000-01-01 12h UT) */
const AYAN={lahiri:['ლაჰირი (ვედური)',23.8571],fagan:['ფეგან-ბრედლი (დასავლური სიდერიული)',24.7403],kp:['კრიშნამურტი',23.7602],raman:['რამანი',22.4108],citra:['ჭეშმარიტი ჩიტრა',23.84],yuk:['იუქტეშვარი',22.4788],deluce:['დელუსი',27.8158]};
const n360=x=>((x%360)+360)%360;
const SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const SGG=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(x=>x+'︎');
/* bright stars near the north ecliptic pole: name, RA°, Dec° (J2000), magnitude */
const STARS=[['პოლარისი',37.95,89.264,2.0],['კოხაბი',222.676,74.155,2.1],['ტუბანი',211.097,64.376,3.7],['ვეგა',279.234,38.784,0.0],['დენები',310.358,45.280,1.3],
 ['ალდერამინი',319.645,62.586,2.5],['ერაი',354.837,77.632,3.2],['ι ჰერკულესი',264.866,46.006,3.8],['დუბჰე',165.932,61.751,1.8],['კაფი',2.294,59.150,2.3],
 ['შედარი',10.127,56.537,2.2],['ელტანინი',269.152,51.489,2.2],['რასტაბანი',262.608,52.301,2.8],['ალტაისი',288.139,67.661,3.1],['ედასიხი',231.232,58.966,3.3],
 ['სადრი',305.557,40.257,2.2],['δ გედი',296.244,45.131,2.9],['მიცარი',200.981,54.925,2.2],['ალიოთი',193.507,55.960,1.8],['ალკაიდი',206.885,49.313,1.9],
 ['ფეკდა',178.458,53.695,2.4],['მეგრეცი',183.857,57.033,3.3],['მერაკი',165.460,56.382,2.4],['ალფერაცი',2.097,29.090,2.1],['მირფაკი',51.081,49.861,1.8],['კაპელა',79.172,45.998,0.1]];
const ecl=(ra,de)=>{const a=ra*D2R,d=de*D2R,e=EPS*D2R;const sb=Math.sin(d)*Math.cos(e)-Math.cos(d)*Math.sin(e)*Math.sin(a);
  const l=Math.atan2(Math.sin(a)*Math.cos(e)+Math.tan(d)*Math.sin(e),Math.cos(a));return [n360(l*R2D),Math.asin(sb)*R2D];};
const SE=STARS.map(([n,ra,de,m])=>{const [l,b]=ecl(ra,de);return {n,l,b,m};});
const T={y:new Date().getFullYear(),play:false,speed:500,last:0,spin:0,segs:null,ay:'lahiri'};
const fy=y=>{y=Math.round(y);return y<=0?`ძვ.წ. ${1-y}`:`${y}`;};
const angd=(l1,b1,l2,b2)=>{const a=Math.sin(b1*D2R)*Math.sin(b2*D2R)+Math.cos(b1*D2R)*Math.cos(b2*D2R)*Math.cos((l1-l2)*D2R);return Math.acos(Math.max(-1,Math.min(1,a)))*R2D;};
const pole=y=>[n360(90-p(y)),90-EPS];                                    /* celestial north pole in J2000 ecliptic coords */

/* IAU constellation segments along the ecliptic (J2000), once */
function segments(){
  if(T.segs||typeof iauFromEcliptic!=='function')return T.segs;
  const out=[];let cur=null,start=0;
  for(let l=0;l<=360.0001;l+=0.05){const c=iauFromEcliptic(l%360,0).abbr;if(c!==cur){if(cur!==null)out.push([start,l,cur]);cur=c;start=l;}}
  out.push([start,360,cur]);
  if(out.length>1&&out[0][2]===out[out.length-1][2]){const f=out.shift();out[out.length-1][1]=360+f[1];}
  T.segs=out;return out;
}
const conKA=c=>(typeof IAU_KA!=='undefined'&&IAU_KA[c])||c;

/* ── view 1: the spinning top — Earth, bulge, Sun and Moon, gyroscope, nutation ──
   Scene clock is schematic (Moon ≈ 8 s per orbit, its nodes ≈ 48 s per turn backwards, Earth spins
   fast); the axis direction itself follows the year slider. Nutation shown hugely exaggerated.     */
const OPT={moon:true,forces:true,nut:true};let sceneT=0;
function drawTop(g,W,H,dt){
  sceneT+=dt||0;
  g.fillStyle='#04030b';g.fillRect(0,0,W,H);
  const cx=W*0.55,cy=H*0.57,r=Math.min(W,H)*0.16,el=17*D2R;
  const pr=(x,y,z)=>[cx+x,cy-(z*Math.cos(el)+y*Math.sin(el)),y*Math.cos(el)-z*Math.sin(el)];  /* dz<0 → in front */
  const add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k],mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a);return mul(a,1/l);};
  const line3=(A,B,col,w,dash)=>{const [x1,y1]=pr(...A),[x2,y2]=pr(...B);g.strokeStyle=col;g.lineWidth=w||1;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);};
  const arrow2=(x1,y1,x2,y2,col,w)=>{g.strokeStyle=col;g.fillStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1),k=6+w*2;
    g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-k*Math.cos(a-0.4),y2-k*Math.sin(a-0.4));g.lineTo(x2-k*Math.cos(a+0.4),y2-k*Math.sin(a+0.4));g.closePath();g.fill();g.lineWidth=1;};
  const lbl=(t,x,y,c,al)=>{g.font="600 12px 'Noto Sans Georgian',sans-serif";g.textAlign=al||'left';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=3;g.strokeStyle='rgba(4,3,11,.9)';g.strokeText(t,x,y);g.fillStyle=c;g.fillText(t,x,y);g.lineWidth=1;};
  /* stars */
  if(!T.st1)T.st1=[...Array(120)].map(()=>[Math.random(),Math.random(),Math.random()]);T.st1.forEach(([x,y,b])=>{g.fillStyle=`rgba(255,255,255,${.12+b*.3})`;g.fillRect(x*W,y*H,1,1);});
  /* ecliptic plane */
  g.strokeStyle='rgba(201,162,76,.3)';g.setLineDash([5,6]);g.beginPath();for(let t=0;t<=360;t+=4){const [x,y]=pr(r*3.1*Math.cos(t*D2R),r*3.1*Math.sin(t*D2R),0);t?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.setLineDash([]);
  lbl('ეკლიპტიკის სიბრტყე',cx+r*2.3,cy+r*0.95,'rgba(201,162,76,.85)');
  line3([0,0,r*1.15],[0,0,r*2.55],'rgba(201,162,76,.45)',1,[2,3]);{const [x,y]=pr(0,0,r*2.6);lbl('ეკლიპტიკის პოლუსი',x+6,y,'rgba(232,214,174,.85)');}
  /* the Moon's node regresses (schematic), Moon runs around */
  const OM=(-sceneT*2*Math.PI/48)%(2*Math.PI),MI=5.145*D2R*2.2;                  /* orbit tilt drawn ×2.2 so it shows */
  const mN=[Math.sin(MI)*Math.sin(OM),-Math.sin(MI)*Math.cos(OM),Math.cos(MI)];   /* Moon orbit normal */
  const mU=[Math.cos(OM),Math.sin(OM),0],mV=cross(mN,mU);                        /* mU → ascending node */
  const th=sceneT*2*Math.PI/8,Rm=r*2.35,moonP=add(mul(mU,Rm*Math.cos(th)),mV,Rm*Math.sin(th));
  /* axis: precession (year slider) + nutation (schematic, follows the node: Δψ ∝ −sin Ω, Δε ∝ cos Ω) */
  const nutK=OPT.nut?1:0;
  const dPsi=-nutK*5.5*Math.sin(OM)*D2R,dEps=nutK*3.0*Math.cos(OM)*D2R;          /* ≈ 17″ / 9″ shown as degrees */
  const phi=(-p(T.y)-90)*D2R+dPsi,e=EPS*D2R+dEps;
  const ax=[Math.sin(e)*Math.cos(phi),Math.sin(e)*Math.sin(phi),Math.cos(e)];
  /* Sun on the left */
  const sunW=[-r*3.35,0,r*0.15],[sx,sy]=pr(...sunW);
  const sg=g.createRadialGradient(sx,sy,0,sx,sy,r*0.62);sg.addColorStop(0,'#fff6d0');sg.addColorStop(.35,'#ffd257');sg.addColorStop(1,'rgba(255,190,60,0)');g.fillStyle=sg;g.beginPath();g.arc(sx,sy,r*0.62,0,7);g.fill();
  lbl('მზე',sx,sy+r*0.62,'#ffe9a8','center');
  /* cone of the axis, with the nutation wave */
  g.strokeStyle='rgba(255,210,120,.35)';g.setLineDash([3,5]);g.beginPath();
  for(let t=0;t<=360;t+=3){const v=[Math.sin(EPS*D2R)*Math.cos(t*D2R),Math.sin(EPS*D2R)*Math.sin(t*D2R),Math.cos(EPS*D2R)];const [x,y]=pr(...mul(v,r*1.95));t?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.setLineDash([]);
  if(OPT.nut){g.strokeStyle='rgba(255,170,120,.55)';g.beginPath();for(let k=0;k<=240;k++){const o=OM+k*0.09,ph=(-p(T.y)-90)*D2R-k*0.0035-5.5*Math.sin(o)*D2R,ee=EPS*D2R+3*Math.cos(o)*D2R;
      const v=[Math.sin(ee)*Math.cos(ph),Math.sin(ee)*Math.sin(ph),Math.cos(ee)];const [x,y]=pr(...mul(v,r*1.95));k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
  /* Moon orbit: back half */
  const orbit=(front)=>{g.lineWidth=1.4;g.beginPath();let first=true;for(let t=0;t<=360;t+=3){const P=add(mul(mU,Rm*Math.cos(t*D2R)),mV,Rm*Math.sin(t*D2R));const [x,y,dz]=pr(...P);
    if((dz<0)!==front){first=true;continue;}first?g.moveTo(x,y):g.lineTo(x,y);first=false;}g.strokeStyle=front?'rgba(210,214,240,.7)':'rgba(210,214,240,.28)';g.stroke();g.lineWidth=1;};
  const moonBehind=pr(...moonP)[2]>0;
  if(OPT.moon){orbit(false);line3(mul(mU,-Rm*1.12),mul(mU,Rm*1.12),'rgba(190,150,255,.55)',1.2,[6,4]);}
  const drawMoon=()=>{if(!OPT.moon)return;const [x,y]=pr(...moonP);const mg=g.createRadialGradient(x-3,y-3,1,x,y,r*0.16);mg.addColorStop(0,'#fbf8f0');mg.addColorStop(1,'#9d988e');g.fillStyle=mg;g.beginPath();g.arc(x,y,r*0.15,0,7);g.fill();lbl('მთვარე',x+r*0.2,y-r*0.12,'#ece8df');};
  if(moonBehind)drawMoon();
  /* Earth basis */
  const k0=Math.hypot(ax[0],ax[1]);const u=[-ax[1]/k0,ax[0]/k0,0],v=cross(ax,u);
  /* back part of the bulge ring */
  const ring=(front,col,w)=>{g.lineWidth=w;g.strokeStyle=col;g.beginPath();let first=true;for(let t=0;t<=360;t+=3){const c=Math.cos(t*D2R),s2=Math.sin(t*D2R);const P=mul(add(mul(u,c),v,s2),r*1.17);const [x,y,dz]=pr(...P);
      if((dz<0)!==front){first=true;continue;}first?g.moveTo(x,y):g.lineTo(x,y);first=false;}g.stroke();g.lineWidth=1;};
  ring(false,'rgba(120,200,140,.35)',6);
  line3(mul(ax,-r*1.95),mul(ax,-r*1.02),'#F3DDA4',2);
  /* Earth: body, day/night, spinning meridians */
  const eg=g.createRadialGradient(cx-r*.35,cy-r*.3,r*.1,cx,cy,r*1.05);eg.addColorStop(0,'#86c8ff');eg.addColorStop(.7,'#2c66b8');eg.addColorStop(1,'#14325f');
  g.fillStyle=eg;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
  {const [sxp,syp]=pr(...norm(sunW));const ang=Math.atan2(syp-cy,sxp-cx);const ng=g.createLinearGradient(cx+Math.cos(ang)*r,cy+Math.sin(ang)*r,cx-Math.cos(ang)*r,cy-Math.sin(ang)*r);
    ng.addColorStop(0,'rgba(0,0,0,0)');ng.addColorStop(.55,'rgba(0,0,0,.05)');ng.addColorStop(1,'rgba(2,4,14,.72)');g.fillStyle=ng;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();}
  T.spin+=(dt||0)*1.6;
  for(let m=0;m<8;m++){const a0=T.spin+m*Math.PI/8;const w=add(mul(u,Math.cos(a0)),v,Math.sin(a0));
    g.beginPath();let first=true;for(let t=-90;t<=90;t+=6){const P=mul(add(mul(w,Math.cos(t*D2R)),ax,Math.sin(t*D2R)),r);const [x,y,dz]=pr(...P);
      if(dz>0){first=true;continue;}first?g.moveTo(x,y):g.lineTo(x,y);first=false;}g.strokeStyle='rgba(205,232,255,.22)';g.stroke();}
  for(const la of [-60,-30,30,60]){g.beginPath();let first=true;for(let t=0;t<=360;t+=6){const c=Math.cos(la*D2R);const P=mul(add(add(mul(u,c*Math.cos(t*D2R)),v,c*Math.sin(t*D2R)),ax,Math.sin(la*D2R)),r);const [x,y,dz]=pr(...P);
      if(dz>0){first=true;continue;}first?g.moveTo(x,y):g.lineTo(x,y);first=false;}g.strokeStyle='rgba(205,232,255,.14)';g.stroke();}
  /* front: bulge ring, axis, L */
  ring(true,'rgba(140,230,160,.75)',6);
  line3(mul(ax,r*1.02),mul(ax,r*1.95),'#F3DDA4',2);
  {const [x2,y2]=pr(...mul(ax,r*1.95));g.fillStyle='#F3DDA4';g.beginPath();g.arc(x2,y2,4,0,7);g.fill();}
  if(OPT.forces){
    /* spin angular momentum L along the axis */
    {const [x1,y1]=pr(...mul(ax,r*1.95)),[x2,y2]=pr(...mul(ax,r*2.55));arrow2(x1,y1,x2,y2,'#9fe0ff',2.4);lbl('L — ბრუნვის იმპულსი',x2+8,y2-4,'#bfeaff');}
    /* torque τ: perpendicular to the axis and to the ecliptic pole → moves the tip along the cone (westwards) */
    const zt=[0,0,1],tau=norm(cross(zt,ax));const tip=mul(ax,r*1.95);
    {const [x1,y1]=pr(...tip),[x2,y2]=pr(...add(tip,tau,-r*0.75));arrow2(x1,y1,x2,y2,'#ff9d7a',2.4);lbl('τ — ძალის მომენტი → ღერძი აქეთ მიდის',x2+(x2<x1?-8:8),y2+14,'#ffb89e',x2<x1?'right':'left');}
    /* pulls on the bulge: Sun (left) and Moon — the Moon's arrow ≈ 2.2× (≈ 68 % of the effect) */
    const pull=(srcW,k,col)=>{let best=null;for(let t=0;t<360;t+=3){const c=Math.cos(t*D2R),s2=Math.sin(t*D2R);const P=mul(add(mul(u,c),v,s2),r*1.17);const d=Math.hypot(P[0]-srcW[0],P[1]-srcW[1],P[2]-srcW[2]);if(!best||d<best.d)best={P,d};}
      const [x1,y1]=pr(...best.P);const dir=norm([srcW[0]-best.P[0],srcW[1]-best.P[1],srcW[2]-best.P[2]]);const [x2,y2]=pr(...add(best.P,dir,r*0.5*k));arrow2(x1,y1,x2,y2,col,1.2+k);};
    pull(sunW,1,'rgba(255,205,90,.95)');if(OPT.moon)pull(moonP,2.2,'rgba(225,225,245,.95)');
  }
  if(!moonBehind)drawMoon();
  if(OPT.moon){orbit(true);
    const nodeM=(sgn,lab,fill)=>{const P=mul(mU,sgn*Rm);const [x,y]=pr(...P);g.strokeStyle='#c8a8ff';g.fillStyle=fill?'#c8a8ff':'#04030b';g.lineWidth=1.6;g.beginPath();g.arc(x,y,4.5,0,7);g.fill();g.stroke();g.lineWidth=1;
      g.font='15px serif';g.fillStyle='#e2d4ff';g.textAlign='center';g.fillText(lab,x,y-12);};
    nodeM(1,'☊︎',true);nodeM(-1,'☋︎',false);}
  lbl('N',...(()=>{const [x,y]=pr(...mul(ax,r*1.95));return [x-14,y+2];})(),'#F3DDA4');
  $('pr-h1').innerHTML=`<div class="t">1 · რატომ ხდება</div><div style="font-size:12px">სარტყელს (მწვანე) ექაჩებიან მზე და მთვარე → τ ⟂ L → ღერძი კონუსზე მიდის</div>
    <div style="opacity:.7;font-size:11px">მთვარე, კვანძები, ბრუნვა — სქემატური დრო${OPT.nut?' · ნუტაცია გაზვიადებული':''}</div>`;
}

/* ── panel: what the Moon does — share bar, nutation ellipse (real, for the slider's year) ── */
function drawMoonPanel(g,W,H){
  g.fillStyle='#04030b';g.fillRect(0,0,W,H);
  const pad=16,bw=W-pad*2;
  g.font="600 12.5px 'Noto Sans Georgian',sans-serif";g.textBaseline='middle';g.textAlign='left';g.fillStyle='#EDE6D8';
  g.fillText('ვინ ატრიალებს ღერძს (ლუნი-სოლარული პრეცესია ≈ 50,4″ / წელი)',pad,18);
  const mx=pad+bw*0.684;g.fillStyle='rgba(220,222,240,.85)';g.fillRect(pad,32,mx-pad,22);g.fillStyle='rgba(255,205,90,.9)';g.fillRect(mx,32,pad+bw-mx,22);
  g.font="600 12px 'Noto Sans Georgian',sans-serif";g.fillStyle='#111';g.fillText('🌙 მთვარე ≈ 68 % · 34,4″',pad+8,43);g.textAlign='right';g.fillText('☀ მზე ≈ 32 % · 16,0″',pad+bw-8,43);
  /* nutation: main terms, Ω = Moon's mean node, L = Sun's mean longitude (IAU 1980, leading terms) */
  const ox=pad+bw*0.25,oy=H*0.62,sc=Math.min(bw*0.4/20,(H-110)/2/12);
  g.strokeStyle='rgba(201,162,76,.25)';g.beginPath();g.moveTo(ox-20*sc,oy);g.lineTo(ox+20*sc,oy);g.moveTo(ox,oy-11*sc);g.lineTo(ox,oy+11*sc);g.stroke();
  g.textAlign='center';g.font="11px 'Noto Sans Georgian',sans-serif";g.fillStyle='rgba(232,214,174,.75)';
  g.fillText('Δψ — გრძედში (″)',ox,oy+11*sc+14);g.save();g.translate(ox-20*sc-12,oy);g.rotate(-Math.PI/2);g.fillText('Δε — დახრაში (″)',0,0);g.restore();
  const nut=jdc=>{const Tc=jdc/36525,Om=(125.04452-1934.136261*Tc)*D2R,Ls=(280.4665+36000.7698*Tc)*D2R,Lm=(218.3165+481267.8813*Tc)*D2R;
    return [-17.20*Math.sin(Om)-1.32*Math.sin(2*Ls)-0.23*Math.sin(2*Lm)+0.21*Math.sin(2*Om),9.20*Math.cos(Om)+0.57*Math.cos(2*Ls)+0.10*Math.cos(2*Lm)-0.09*Math.cos(2*Om)];};
  const j0=(T.y-2000)*365.25;
  g.strokeStyle='rgba(255,170,120,.75)';g.lineWidth=1.2;g.beginPath();for(let k=0;k<=6794;k+=1){const [a,b]=nut(j0-18.6*365.25+k);const x=ox+a*sc,y=oy-b*sc;k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.lineWidth=1;
  const [a0,b0]=nut(j0);g.fillStyle='#ffd28a';g.beginPath();g.arc(ox+a0*sc,oy-b0*sc,4.5,0,7);g.fill();
  g.textAlign='left';g.font="12px 'Noto Sans Georgian',sans-serif";g.fillStyle='#EDE6D8';
  const tx=pad+bw*0.52;let ty=78;const line=(t,c)=>{g.fillStyle=c||'#EDE6D8';g.fillText(t,tx,ty);ty+=19;};
  line('ნუტაცია — ღერძის „თავის ქნევა“','#F3DDA4');
  line('მთვარის ორბიტა ეკლიპტიკისადმი 5,1°-ითაა დახრილი');
  line('და მისი კვანძები უკან ბრუნავს 18,6 წელიწადში —');
  line('მთვარის „წევა“ ხან ძლიერდება, ხან სუსტდება.');
  line(`ამის გამო ღერძი კონუსზე ტალღისებურად მიდის:`);
  line(`±17,2″ გრძედში, ±9,2″ დახრაში (18,6 წ.)`);
  line(`${fy(T.y)}: Δψ ${a0>=0?'+':''}${a0.toFixed(1)}″ · Δε ${b0>=0?'+':''}${b0.toFixed(1)}″`,'#ffd28a');
}

/* ── view 2: the pole among the stars ── */
function drawPole(g,W,H){
  g.fillStyle='#04030b';g.fillRect(0,0,W,H);
  const cx=W/2,cy=H/2+8,Rm=Math.min(W,H)*0.44,scale=Rm/40;               /* 40° around the ecliptic pole */
  const P=(l,b)=>{const rr=(90-b)*scale,a=l*D2R;return [cx+rr*Math.cos(a),cy-rr*Math.sin(a)];};   /* as seen overhead: λ counter-clockwise, 90° up */
  g.strokeStyle='rgba(201,162,76,.18)';for(const b of [80,70,60,50]){g.beginPath();g.arc(cx,cy,(90-b)*scale,0,7);g.stroke();}
  /* precession circle and year marks */
  g.strokeStyle='rgba(255,210,120,.5)';g.setLineDash([4,5]);g.beginPath();g.arc(cx,cy,EPS*scale,0,7);g.stroke();g.setLineDash([]);
  g.font="11px 'Noto Sans Georgian',sans-serif";g.textAlign='center';g.textBaseline='middle';
  for(const yy of [-11000,-8000,-5000,-2700,0,2000,4000,7500,10000,13700]){const [l,b]=pole(yy),[x,y]=P(l,b);g.fillStyle='rgba(255,210,120,.65)';g.beginPath();g.arc(x,y,2.2,0,7);g.fill();
    const [lx,ly]=P(l,b-3.6);g.fillText(fy(yy),lx,ly);}
  /* stars */
  for(const s of SE){if(s.b<48)continue;const [x,y]=P(s.l,s.b),rr=Math.max(1.2,3.6-s.m*0.75);g.fillStyle='#fff';g.beginPath();g.arc(x,y,rr,0,7);g.fill();
    g.fillStyle='rgba(220,226,255,.8)';g.textAlign='left';g.fillText(s.n,x+rr+3,y);}
  /* ecliptic pole */
  g.strokeStyle='rgba(201,162,76,.6)';g.beginPath();g.moveTo(cx-6,cy);g.lineTo(cx+6,cy);g.moveTo(cx,cy-6);g.lineTo(cx,cy+6);g.stroke();
  /* the celestial pole now */
  const [pl,pb]=pole(T.y),[px,py]=P(pl,pb);
  g.strokeStyle='#F3DDA4';g.lineWidth=2;g.beginPath();g.arc(px,py,8,0,7);g.stroke();g.beginPath();g.moveTo(px-13,py);g.lineTo(px+13,py);g.moveTo(px,py-13);g.lineTo(px,py+13);g.stroke();g.lineWidth=1;
  let near=null;for(const s of SE){const d=angd(pl,pb,s.l,s.b);if(!near||d<near.d)near={...s,d};}
  $('pr-h2').innerHTML=`<div class="t">2 · ჩრდილოეთის პოლუსი</div><div>${fy(T.y)}: პოლუსთან ყველაზე ახლოს — <b>${near.n}</b> (${near.d.toFixed(1)}°)${near.d<3?' — ეს არის „პოლარული ვარსკვლავი“':''}</div>`;
}

/* ── view 3: the vernal point among the constellations ── */
function drawBand(g,W,H){
  g.fillStyle='#04030b';g.fillRect(0,0,W,H);
  /* frame: the TROPICAL zodiac is fixed (tied to the equinox) — the stars and the sidereal signs drift past it */
  const segs=segments();const vp=n360(-p(T.y));                         /* vernal point, J2000 ecliptic longitude */
  const pxd=W/120,cx=W/2;                                               /* a 120° window on 0° tropical Aries */
  const yT=40,hT=28,yI=yT+hT+20,hI=58,yS=yI+hI+6,hS=28;                 /* rows: tropical · IAU · sidereal */
  const X=l=>{let d=((l-vp)%360+540)%360-180;return cx-d*pxd;};          /* east (higher longitude) to the left, as in the sky */
  const band=(a,b,y,h,fill,line,label,font,col,ly)=>{for(const off of [-360,0,360]){const x1=X(a+off),x2=X(b+off);const L=Math.min(x1,x2),R=Math.max(x1,x2);if(R<0||L>W||R-L>W)continue;
    g.fillStyle=fill;g.fillRect(L,y,R-L,h);g.strokeStyle=line;g.beginPath();g.moveTo(L,y);g.lineTo(L,y+h);g.stroke();
    const mid=(L+R)/2;if(label&&R-L>36&&mid>10&&mid<W-10){g.fillStyle=col;g.font=font;g.textAlign='center';g.textBaseline='middle';g.fillText(label,mid,y+(ly==null?h/2:ly));}}};
  /* 1 tropical signs — fixed */
  for(let s=0;s<12;s++)band(vp+s*30,vp+s*30+30,yT,hT,s%2?'rgba(243,221,164,.10)':'rgba(243,221,164,.18)','rgba(243,221,164,.45)',SGG[s]+' '+SG[s],"600 12px 'Noto Sans Georgian',sans-serif",'#F7E7BE');
  /* 2 IAU constellations (unequal) — move with the stars */
  if(segs)segs.forEach(([a,b,c],i)=>band(a,b,yI,hI,i%2?'rgba(120,140,220,.14)':'rgba(201,162,76,.12)','rgba(201,162,76,.35)',conKA(c),"600 12.5px 'Noto Sans Georgian',sans-serif",'#EDE6D8',15));
  /* 3 sidereal equal signs — move with the stars */
  const ay=AYAN[T.ay][1]+p(T.y);
  for(let s=0;s<12;s++){const a=vp+s*30+ay;band(a,a+30,yS,hS,s%2?'rgba(255,255,255,.04)':'rgba(255,255,255,.08)','rgba(255,255,255,.18)',SGG[s]+' '+SG[s],"12px 'Noto Sans Georgian',sans-serif",'rgba(232,226,213,.8)');}
  g.textAlign='left';g.textBaseline='middle';g.font="11px 'Noto Sans Georgian',sans-serif";
  g.fillStyle='rgba(247,231,190,.85)';g.fillText('ტროპიკული ნიშნები — უძრავი (ბუნიობაზე მიბმული)',8,yT-10);
  g.fillStyle='rgba(232,214,174,.7)';g.fillText('IAU თანავარსკვლავედები (არათანაბარი) — ვარსკვლავებთან ერთად',8,yI-9);
  g.fillText(`სიდერიული ნიშნები (${AYAN[T.ay][0]}, 30°) — ვარსკვლავებთან ერთად`,8,yS+hS+12);
  /* the gaps, measured: 0° tropical Aries → sidereal 0° Aries (ayanamsa) and → the IAU border of Aries (true sidereal) */
  const brk=(x1,x2,y,txt,col,below)=>{if(Math.abs(x2-x1)<4)return;g.strokeStyle=col;g.fillStyle=col;g.lineWidth=1.6;g.beginPath();g.moveTo(x1,y);g.lineTo(x2,y);g.stroke();
    for(const [x,dir] of [[x1,Math.sign(x2-x1)],[x2,Math.sign(x1-x2)]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+dir*8,y-4);g.lineTo(x+dir*8,y+4);g.closePath();g.fill();g.beginPath();g.moveTo(x,y-7);g.lineTo(x,y+7);g.stroke();}
    g.font="600 12.5px 'Noto Sans Georgian',sans-serif";g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='rgba(4,3,11,.9)';const ty=below?y+15:y-10;g.strokeText(txt,(x1+x2)/2,ty);g.fillText(txt,(x1+x2)/2,ty);g.lineWidth=1;};
  const dms=d=>{const a=Math.abs(d),D=Math.floor(a),M=Math.round((a-D)*60);return (d<0?'−':'')+D+'°'+String(M===60?0:M).padStart(2,'0')+'′';};
  const sx=X(vp+ay);if(sx>-50&&sx<W+50)brk(cx,Math.max(2,Math.min(W-2,sx)),yS+hS+26,'აიანამშა '+dms(((ay+180)%360+360)%360-180),'#9fe0ff',true);
  if(segs){const ar=segs.find(x=>x[2]==='Ari');if(ar){let d=((ar[0]-vp)%360+540)%360-180;T.iauGap=d;const ax2=X(vp+d);if(ax2>-50&&ax2<W+50)brk(cx,Math.max(2,Math.min(W-2,ax2)),yI+hI-11,'IAU ვერძამდე '+dms(d),'#ffd28a');}}
  /* 0° tropical Aries = the vernal point (fixed in this frame) */
  g.strokeStyle='#F3DDA4';g.lineWidth=2;g.beginPath();g.moveTo(cx,yT-4);g.lineTo(cx,yS+hS+6);g.stroke();g.lineWidth=1;
  g.fillStyle='#F3DDA4';g.font='18px serif';g.textAlign='center';g.fillText(SGG[0],cx,yT-20);
  const yt=yS+hS+62;g.font="12px 'Noto Sans Georgian',sans-serif";g.fillText('ტროპიკული 0° ვერძი = გაზაფხულის ბუნიობის წერტილი — უძრავია',cx,yt);
  g.fillStyle='rgba(255,210,120,.8)';g.fillText('ვარსკვლავები და სიდერიული ნიშნები მის მიმართ ნელა იწევს წინ (აქ — მარცხნივ ←) · ~1° ყოველ 71,6 წელიწადში',cx,yt+18);
  g.fillText('ამიტომ აიანამშა (ტროპიკულსა და სიდერიულს შორის სხვაობა) წლიდან წლამდე იზრდება',cx,yt+36);
  const con=typeof iauFromEcliptic==='function'?iauFromEcliptic(vp,0).abbr:null;
  const sid=n360(-ay),ss=Math.floor(sid/30);
  $('pr-h3').innerHTML=`<div class="t">3 · ეპოქები</div><div>${fy(T.y)}: ტროპიკული 0° ვერძი — <b>${con?conKA(con):'—'}</b> თანავარსკვლავედში (ასტრონომიული ეპოქა) · სიდერიულად ${SGG[ss]} ${SG[ss]} ${(sid%30).toFixed(1)}° · აიანამშა (${AYAN[T.ay][0]}) <b>${(((ay+180)%360+360)%360-180).toFixed(2)}°</b>${T.iauGap!=null?` · ნამდვილი (IAU) ვერძის საზღვრამდე <b>${T.iauGap.toFixed(1)}°</b>`:''}</div>`;
}

/* ── loop ── */
function frame(ts){
  requestAnimationFrame(frame);
  const sec=$('form-precession');if(!sec||!sec.classList.contains('active')){T.last=0;return;}
  const dt=T.last?Math.min(0.1,(ts-T.last)/1000):0;T.last=ts;
  if(T.play){T.y+=dt*T.speed;if(T.y>13000)T.y=-13000;if(T.y<-13000)T.y=13000;}
  const sl=$('pr-slider');if(sl&&document.activeElement!==sl)sl.value=Math.round(T.y);
  $('pr-year').textContent=fy(T.y);
  for(const [id,f] of [['pr-c1',drawTop],['pr-c2',drawPole],['pr-c3',drawBand],['pr-c4',drawMoonPanel]]){const c=$(id),r=c.getBoundingClientRect();if(!r.width)continue;const dpr=Math.min(2,devicePixelRatio||1);
    if(c.width!==Math.round(r.width*dpr)||c.height!==Math.round(r.height*dpr)){c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);}
    const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);f(g,r.width,r.height,dt);}
}

/* ── UI ── */
const CSS=`
.form-card:has(#form-precession.active){max-width:min(1300px,calc(100vw - 32px))!important}
#form-precession .ob-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}
#form-precession .ob-btn{background:rgba(201,162,76,.1);border:1px solid rgba(201,162,76,.45);color:#F0D48A;border-radius:16px;padding:7px 14px;font-size:13px;cursor:pointer;font-family:inherit}
#form-precession .ob-btn.on{background:rgba(201,162,76,.3);border-color:#E3BE84;color:#FFF3D0}
#form-precession select{width:auto!important;background:#0e0b1e;border:1px solid rgba(201,162,76,.5);color:#F3ECDC;border-radius:10px;padding:7px 9px;font-size:13px;font-family:inherit}
#form-precession input[type=number]{width:96px!important;text-align:center;background:#0e0b1e;border:1px solid rgba(201,162,76,.5);color:#F3ECDC;border-radius:10px;padding:7px 6px;font-size:13px}
#pr-slider{flex:1 1 260px;accent-color:#C9A24C}
#pr-year{font-family:Cinzel,serif;font-size:20px;color:#F7DE9A;min-width:120px}
#pr-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:12px}
@media(max-width:900px){#pr-grid{grid-template-columns:1fr}}
.pr-pane{position:relative;border:1px solid rgba(201,162,76,.22);border-radius:14px;overflow:hidden;background:#04030b}
.pr-pane canvas{display:block;width:100%}
#pr-c1,#pr-c2{height:min(64vh,560px)}#pr-c4{height:260px}#pr-c3{height:375px}
.pr-h{position:absolute;left:14px;right:14px;top:10px;color:#F3ECDC;font-size:13px;line-height:1.55;text-shadow:0 0 6px #000;pointer-events:none}
.pr-h .t{font-family:Cinzel,'Noto Serif Georgian',serif;font-size:15px;color:#F7DE9A}.pr-h b{color:#F3DDA4}
#pr-c3h{bottom:auto}
.pr-ck{display:flex;align-items:center;gap:6px;font-size:13px!important;color:#EDE6D8!important;cursor:pointer;letter-spacing:0!important;text-transform:none!important;font-family:'Noto Sans Georgian',sans-serif!important}
.pr-ck input{width:15px!important;height:15px!important;accent-color:#C9A24C}
.pr-txt{margin-top:14px;font-size:14px;line-height:1.8;color:rgba(236,228,210,.9)}
.pr-txt h4{font-family:Cinzel,'Noto Serif Georgian',serif;font-weight:400;letter-spacing:2px;color:#E3BE84;font-size:13px;margin:14px 0 4px}
.pr-txt p{margin:0 0 8px}.pr-txt b{color:#F3DDA4;font-weight:600}
.pr-txt table{border-collapse:collapse;font-size:13px;margin:4px 0 8px}.pr-txt td{padding:3px 12px 3px 0;border-bottom:1px solid rgba(255,255,255,.05)}`;
const TEXT=`<h4>რატომ ხდება პრეცესია</h4>
<p>დედამიწა იდეალური ბურთი არ არის: ბრუნვის გამო ეკვატორთან ოდნავ <b>გაბერილია</b> — ეკვატორული რადიუსი პოლარულზე ~21 კმ-ით მეტია. ეს „სარტყელი“ ეკლიპტიკის სიბრტყისადმი 23,4°-ით არის დახრილი.</p>
<p><b>მზე და მთვარე</b> გრავიტაციით ექაჩებიან ამ სარტყელს და ცდილობენ, ეკვატორი ეკლიპტიკის სიბრტყეში „ჩააწვინონ“. მაგრამ დედამიწა სწრაფად ბრუნავს, და მბრუნავი სხეული ასეთ ძალას არ ემორჩილება პირდაპირ — ის <b>გიროსკოპივით</b> პასუხობს: ღერძი არ ეცემა, არამედ ნელა შემოუვლის კონუსს ეკლიპტიკის პოლუსის გარშემო. ზუსტად ასე ტრიალებს დახრილი ბზრიალა.</p>
<p>ეფექტის ≈ 2/3 მთვარისგანაა (ახლოა), ≈ 1/3 — მზისგან. ერთი სრული შემობრუნება გრძელდება <b>≈ 25 772 წელს</b> — წელიწადში 50,3″, ანუ 1° ყოველ 71,6 წელიწადში. მცირე „რხევა“ ზედ (<b>ნუტაცია</b>, ±9″) მთვარის კვანძების 18,6-წლიანი ციკლიდან მოდის — იგივე კვანძები, რომლებიც დაბნელებებს განსაზღვრავს.</p>
<h4>რას აკეთებს მთვარე</h4>
<p><b>1. პრეცესიის ძირითადი მიზეზია.</b> მზე ბევრად მასიურია, მაგრამ მოქცევითი ძალა მანძილის კუბით სუსტდება, ამიტომ ახლო მთვარე ეკვატორის სარტყელს ≈ 2,2-ჯერ ძლიერად „წევს“: ლუნი-სოლარული პრეცესიის ≈ 68 % (34″/წ) მთვარისაა, ≈ 32 % (16″/წ) — მზის.</p>
<p><b>2. ნუტაციას ქმნის.</b> მთვარის ორბიტა 5,1°-ითაა დახრილი და მისი კვანძები 18,6 წელიწადში უკან შემობრუნდება (ის კვანძები, რომლებიც დაბნელებებს განსაზღვრავს). მთვარის წევის მიმართულება ამიტომ პერიოდულად იცვლება და ღერძი პრეცესიის კონუსზე პატარა ტალღებს ხაზავს: ±17,2″ გრძედში, ±9,2″ დახრაში. ნუტაცია ჯეიმს ბრედლიმ აღმოაჩინა 1748 წელს.</p>
<p><b>3. დახრას აწყნარებს.</b> მთვარის გარეშე დედამიწის ღერძის დახრა ქაოსურად იცვლებოდა (ათეულობით გრადუსით) და კლიმატი მკვეთრად ირყეოდა. მთვარე მას 22,1°–24,5°-ის ვიწრო ფარგლებში ინარჩუნებს.</p>
<p><b>4. დღეს ახანგრძლივებს.</b> მოქცევის ხახუნი დედამიწის ბრუნვას ანელებს — დღე საუკუნეში ~2,3 მილიწამით გრძელდება — და მთვარე ყოველწლიურად ~3,8 სმ-ით შორდება.</p>
<h4>რას ცვლის</h4>
<p><b>1. ტროპიკული ზოდიაქო უძრავია</b> — ის ბუნიობებსა და მზებუდობებზეა მიბმული: 0° ვერძი ყოველთვის გაზაფხულის ბუნიობაა, 0° კირჩხიბი — ზაფხულის მზებუდობა. მოძრაობს <b>ვარსკვლავების ფონი</b>: თანავარსკვლავედები და მათზე მიბმული სიდერიული ნიშნები ტროპიკულის მიმართ ნელა იწევს წინ (ვარსკვლავის ტროპიკული გრძედი ყოველ წელს 50″-ით იზრდება; თუ ვარსკვლავებიდან ვუყურებთ, პირიქით — ბუნიობის წერტილი მიდის უკან). ამიტომ <b>ტროპიკული</b> (სეზონებზე მიბმული) და <b>სიდერიული</b> (ვარსკვლავებზე მიბმული) ზოდიაქო სულ უფრო შორდება ერთმანეთს — ეს სხვაობაა <b>აიანამშა</b>. რამდენია, სკოლაზეა დამოკიდებული (2026 წ.): ლაჰირი 24°13′, კრიშნამურტი 24°07′, <b>ფეგან-ბრედლი 25°06′</b>, რამანი 22°46′, დელუსი 28°11′. „ჭეშმარიტ სიდერიულში“ (IAU არათანაბარი თანავარსკვლავედები) ბუნიობის წერტილიდან ვერძის საზღვრამდე კიდევ მეტია — ~29°. სკოლების მიხედვით ორივე ზოდიაქო ახ.წ. ~220–500 წლებში ემთხვეოდა.</p>
<p><b>2. ასტროლოგიური ეპოქები.</b> ბუნიობის წერტილი ერთ ნიშანს ~2150 წელიწადში გადის. ახლა ის თევზების თანავარსკვლავედშია და IAU საზღვრებით მერწყულში ~2600 წელს შევა (თანაბარი 30°-იანი ნიშნებით — სკოლის მიხედვით სხვადასხვა თარიღი).</p>
<p><b>3. პოლარული ვარსკვლავი იცვლება.</b> ცის ჩრდილოეთის პოლუსი 23,4°-იან წრეს შემოუვლის:</p>
<table><tr><td>ძვ.წ. ~2800</td><td><b>ტუბანი</b> (დრაკონი) — ეგვიპტის პირამიდების ეპოქა</td></tr><tr><td>~2100 წ.</td><td><b>პოლარისი</b> ყველაზე ახლოს (0,45°)</td></tr><tr><td>~4000</td><td><b>ერაი</b> (γ ცეფევსი)</td></tr><tr><td>~7500</td><td><b>ალდერამინი</b></td></tr><tr><td>~10 000</td><td><b>დენები</b> (გედი)</td></tr><tr><td>~13 700</td><td><b>ვეგა</b> — ყველაზე კაშკაშა პოლარული ვარსკვლავი</td></tr></table>
<p><b>4. სეზონები და კლიმატი.</b> პრეცესია ცვლის, წლის რომელ დროს არის დედამიწა მზესთან ყველაზე ახლოს (პერიჰელიუმი ახლა იანვარშია). ეს მილანკოვიჩის ციკლების ნაწილია, რომლებიც გამყინვარებებს უკავშირდება.</p>
<p style="opacity:.7;font-size:12.5px">ანიმაციაში: საშუალო სიჩქარე 50,29″/წ, ფიქსირებული J2000 ეკლიპტიკა, დახრა 23,44° (დახრის საკუთარი 41 000-წლიანი რხევა 22,1°–24,5° ცალკე ციკლია). სარტყელი გაზვიადებულია.</p>`;
function inject(){
  const bar=document.querySelector('.tab-bar'),card=document.querySelector('.form-card');
  if(!bar||!card)return false;if($('form-precession'))return true;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const after=$('ec-tab-btn')||bar.querySelector(".tab-btn[onclick*=\"'orbits'\"]");
  const b=document.createElement('button');b.type='button';b.className='tab-btn';b.id='pr-tab-btn';b.textContent='პრეცესია';b.setAttribute('onclick',"setMode('precession')");
  if(after)after.after(b);else bar.appendChild(b);
  const sec=document.createElement('div');sec.id='form-precession';sec.className='form-section';
  sec.innerHTML=`<div class="person-label">🌀 ბუნიობათა პრეცესია — დედამიწის ღერძის ნელი ტრიალი</div>
   <div class="ob-bar"><button type="button" class="ob-btn" id="pr-play">▶ გაშვება</button>
     <select id="pr-speed"><option value="100">100 წელი/წმ</option><option value="500" selected>500 წელი/წმ</option><option value="1000">1000 წელი/წმ</option><option value="3000">3000 წელი/წმ</option></select>
     <button type="button" class="ob-btn" id="pr-now">● ახლა</button><input type="number" id="pr-yin" value="${T.y}" title="ძვ.წ. — მინუსით (0 = ძვ.წ. 1)"><button type="button" class="ob-btn" id="pr-go">↪ წელი</button>
     <select id="pr-ay" title="აიანამშა — ტროპიკულ და სიდერიულ ზოდიაქოს შორის სხვაობა">${Object.entries(AYAN).map(([k,v])=>`<option value="${k}"${k==='lahiri'?' selected':''}>${v[0]}</option>`).join('')}</select>
     <span id="pr-year"></span><input type="range" id="pr-slider" min="-13000" max="13000" step="1" value="${T.y}"></div>
   <div id="pr-grid"><div class="pr-pane"><canvas id="pr-c1"></canvas><div class="pr-h" id="pr-h1"></div></div>
     <div class="pr-pane"><canvas id="pr-c2"></canvas><div class="pr-h" id="pr-h2"></div></div></div>
   <div class="ob-bar" style="margin:8px 0 0"><span class="ob-lab" style="font-size:13px;color:#E8D6AE">ჩვენება:</span>
     <label class="pr-ck"><input type="checkbox" data-o="moon" checked> 🌙 მთვარე და მისი ორბიტა</label>
     <label class="pr-ck"><input type="checkbox" data-o="forces" checked> ↗ ძალები (L, τ, მიზიდულობა)</label>
     <label class="pr-ck"><input type="checkbox" data-o="nut" checked> 〰 ნუტაცია (გაზვიადებული)</label></div>
   <div class="pr-pane" style="margin-top:12px"><canvas id="pr-c4"></canvas></div>
   <div class="pr-pane" style="margin-top:12px"><canvas id="pr-c3"></canvas><div class="pr-h" id="pr-h3" style="top:auto;bottom:8px"></div></div>
   <div class="pr-txt">${TEXT}</div>`;
  card.insertBefore(sec,$('form-relocation')||null);
  $('pr-play').onclick=()=>{T.play=!T.play;$('pr-play').textContent=T.play?'⏸ პაუზა':'▶ გაშვება';$('pr-play').classList.toggle('on',T.play);};
  $('pr-speed').onchange=e=>{T.speed=+e.target.value;};
  $('pr-ay').onchange=e=>{T.ay=e.target.value;};
  $('pr-now').onclick=()=>{T.y=new Date().getFullYear();};
  $('pr-go').onclick=()=>{const v=+$('pr-yin').value;if(isFinite(v))T.y=Math.max(-13000,Math.min(13000,v));};
  $('pr-slider').oninput=e=>{T.y=+e.target.value;};
  sec.querySelectorAll('[data-o]').forEach(c=>c.onchange=()=>{OPT[c.dataset.o]=c.checked;});
  /* the IAU borders (Roman 1987) — loaded when the tab first opens */
  if(typeof iauFromEcliptic!=='function'){const s=document.createElement('script');s.src='constellations.js';document.head.appendChild(s);}
  requestAnimationFrame(frame);
  return true;
}
function hook(){
  if(typeof window.setMode!=='function'||window.setMode._pr)return;
  const o=window.setMode;const w=function(m){const r=o.apply(this,arguments);
    if(m==='precession')document.querySelectorAll('.tab-bar .tab-btn').forEach(b=>b.classList.toggle('active',b.id==='pr-tab-btn'));
    return r;};w._pr=true;for(const k in o)w[k]=o[k];window.setMode=w;
}
function boot(){if(!inject()){let n=0;const t=setInterval(()=>{if(inject()||++n>60)clearInterval(t);},250);}
  setTimeout(hook,0);window.addEventListener('load',()=>setTimeout(hook,60));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window._precession={T,p,pole};
})();
