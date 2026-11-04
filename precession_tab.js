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

/* ── view 1: the spinning top ── */
function drawTop(g,W,H){
  g.fillStyle='#04030b';g.fillRect(0,0,W,H);
  const cx=W*0.56,cy=H*0.52,r=Math.min(W,H)*0.22,el=16*D2R;
  /* projection: ecliptic frame (x right, y away, z up) seen from slightly above */
  const pr=(x,y,z)=>[cx+x,cy-(z*Math.cos(el)+y*Math.sin(el)),y*Math.cos(el)-z*Math.sin(el)];
  /* ecliptic plane */
  g.strokeStyle='rgba(201,162,76,.35)';g.setLineDash([5,5]);g.beginPath();for(let t=0;t<=360;t+=4){const [x,y]=pr(r*2.4*Math.cos(t*D2R),r*2.4*Math.sin(t*D2R),0);t?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.setLineDash([]);
  g.fillStyle='rgba(201,162,76,.75)';g.font="12px 'Noto Sans Georgian',sans-serif";g.textAlign='left';g.fillText('ეკლიპტიკის სიბრტყე',cx+r*1.55,cy+r*0.62);
  /* ecliptic pole */
  {const [x1,y1]=pr(0,0,r*1.25),[x2,y2]=pr(0,0,r*2.05);g.strokeStyle='rgba(201,162,76,.5)';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.fillStyle='rgba(232,214,174,.85)';g.fillText('ეკლიპტიკის პოლუსი',x2+6,y2);}
  /* axis direction: tilt EPS, azimuth follows precession (the equinox moves → axis turns westwards) */
  const phi=(-p(T.y)-90)*D2R,e=EPS*D2R;
  const ax=[Math.sin(e)*Math.cos(phi),Math.sin(e)*Math.sin(phi),Math.cos(e)];
  /* cone traced by the axis */
  g.strokeStyle='rgba(255,210,120,.45)';g.setLineDash([3,5]);
  for(const s of [1,-1]){g.beginPath();for(let t=0;t<=360;t+=4){const v=[Math.sin(e)*Math.cos(t*D2R),Math.sin(e)*Math.sin(t*D2R),Math.cos(e)];const [x,y]=pr(s*v[0]*r*1.9,s*v[1]*r*1.9,s*v[2]*r*1.9);t?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}
  g.setLineDash([]);
  /* basis on the equator */
  const k=Math.hypot(ax[0],ax[1]);const u=[-ax[1]/k,ax[0]/k,0];const v=[ax[1]*u[2]-ax[2]*u[1],ax[2]*u[0]-ax[0]*u[2],ax[0]*u[1]-ax[1]*u[0]];
  /* Sun and Moon on the left, their pull */
  const sx=cx-r*2.55,sy=cy-r*0.05;const sg=g.createRadialGradient(sx,sy,0,sx,sy,r*0.42);sg.addColorStop(0,'#fff6d0');sg.addColorStop(.4,'#ffd257');sg.addColorStop(1,'rgba(255,190,60,0)');g.fillStyle=sg;g.beginPath();g.arc(sx,sy,r*0.42,0,7);g.fill();
  g.fillStyle='#ffe9a8';g.textAlign='center';g.fillText('მზე',sx,sy+r*0.48);
  const mxp=cx-r*1.55,myp=cy+r*0.95;g.fillStyle='#d9d6cf';g.beginPath();g.arc(mxp,myp,r*0.11,0,7);g.fill();g.fillStyle='#e8e4dc';g.fillText('მთვარე',mxp,myp+r*0.25);
  /* earth body (back) */
  const eg=g.createRadialGradient(cx-r*.3,cy-r*.3,r*.1,cx,cy,r*1.05);eg.addColorStop(0,'#7cc0ff');eg.addColorStop(.7,'#2c66b8');eg.addColorStop(1,'#163a72');
  g.fillStyle=eg;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
  /* meridians spinning */
  T.spin+=0.04;
  for(let m=0;m<6;m++){const a0=T.spin+m*Math.PI/6;const w=[u[0]*Math.cos(a0)+v[0]*Math.sin(a0),u[1]*Math.cos(a0)+v[1]*Math.sin(a0),u[2]*Math.cos(a0)+v[2]*Math.sin(a0)];
    g.beginPath();let first=true;for(let t=-90;t<=90;t+=6){const c=Math.cos(t*D2R),s=Math.sin(t*D2R);const P=[r*(w[0]*c+ax[0]*s),r*(w[1]*c+ax[1]*s),r*(w[2]*c+ax[2]*s)];const [x,y,dz]=pr(...P);
      if(dz>0){first=true;continue;}first?g.moveTo(x,y):g.lineTo(x,y);first=false;}g.strokeStyle='rgba(200,230,255,.28)';g.lineWidth=1;g.stroke();}
  /* equatorial bulge (exaggerated): a ring around the equator */
  const ring=(front)=>{g.beginPath();let first=true;for(let t=0;t<=360;t+=3){const c=Math.cos(t*D2R),s=Math.sin(t*D2R);const P=[r*1.16*(u[0]*c+v[0]*s),r*1.16*(u[1]*c+v[1]*s),r*1.16*(u[2]*c+v[2]*s)];const [x,y,dz]=pr(...P);
      if((dz<0)!==front){first=true;continue;}first?g.moveTo(x,y):g.lineTo(x,y);first=false;}g.stroke();};
  g.lineWidth=5;g.strokeStyle='rgba(120,200,140,.35)';ring(false);
  /* axis */
  {const [x1,y1]=pr(-ax[0]*r*1.9,-ax[1]*r*1.9,-ax[2]*r*1.9),[x2,y2]=pr(ax[0]*r*1.9,ax[1]*r*1.9,ax[2]*r*1.9);g.strokeStyle='#F3DDA4';g.lineWidth=2;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
    g.fillStyle='#F3DDA4';g.beginPath();g.arc(x2,y2,4,0,7);g.fill();g.font="600 13px 'Noto Sans Georgian',sans-serif";g.textAlign='left';g.fillText('N — ღერძი',x2+8,y2);}
  g.lineWidth=5;g.strokeStyle='rgba(140,230,160,.7)';ring(true);g.lineWidth=1;
  /* pull arrows: Sun/Moon on the near and far bulge — the net turn (torque) tries to stand the equator up into the ecliptic */
  const arrow=(x1,y1,x2,y2,c)=>{g.strokeStyle=c;g.fillStyle=c;g.lineWidth=2;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();const a=Math.atan2(y2-y1,x2-x1);g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-9*Math.cos(a-0.4),y2-9*Math.sin(a-0.4));g.lineTo(x2-9*Math.cos(a+0.4),y2-9*Math.sin(a+0.4));g.closePath();g.fill();};
  /* the bulge points nearest/farthest from the Sun (on the equator ring, toward −x and +x) */
  let best=null,worst=null;for(let t=0;t<360;t+=2){const c=Math.cos(t*D2R),s=Math.sin(t*D2R);const P=[r*1.16*(u[0]*c+v[0]*s),r*1.16*(u[1]*c+v[1]*s),r*1.16*(u[2]*c+v[2]*s)];if(!best||P[0]<best[0])best=P;if(!worst||P[0]>worst[0])worst=P;}
  {const [x,y]=pr(...best);arrow(x,y,x-r*0.45,y+(best[2]>0?r*0.18:-r*0.18),'rgba(255,200,90,.9)');const [x2,y2]=pr(...worst);arrow(x2,y2,x2-r*0.22,y2+(worst[2]>0?r*0.1:-r*0.1),'rgba(255,200,90,.55)');}
  g.font="12px 'Noto Sans Georgian',sans-serif";g.fillStyle='rgba(255,220,150,.9)';g.textAlign='left';
  g.fillText('მზე და მთვარე ექაჩებიან ეკვატორის „სარტყელს“ →',14,H-34);g.fillText('ღერძი არ ეცემა, არამედ ნელა ტრიალებს (როგორც ბზრიალა)',14,H-16);
  $('pr-h1').innerHTML=`<div class="t">1 · რატომ ხდება</div><div>ღერძის დახრა ${EPS.toFixed(2)}° · ერთი შემობრუნება ≈ ${PER.toLocaleString('en-US').replace(/,/g,' ')} წელი</div>`;
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
  const segs=segments();const vp=n360(-p(T.y));                         /* vernal point, J2000 ecliptic longitude */
  const top=44,h1=46,h2=30,pxd=W/120,cx=W/2;                            /* a 120° window centred on the vernal point */
  const X=l=>{let d=((l-vp)%360+540)%360-180;return cx-d*pxd;};          /* east to the left, as in the sky */
  if(segs){g.font="600 12.5px 'Noto Sans Georgian',sans-serif";g.textBaseline='middle';g.textAlign='center';
    segs.forEach(([a,b,c],i)=>{for(const off of [-360,0,360]){const x1=X(a+off),x2=X(b+off);const L=Math.min(x1,x2),R=Math.max(x1,x2);if(R<0||L>W||R-L>W)continue;
      g.fillStyle=i%2?'rgba(120,140,220,.14)':'rgba(201,162,76,.12)';g.fillRect(L,top,R-L,h1);g.strokeStyle='rgba(201,162,76,.35)';g.beginPath();g.moveTo(L,top);g.lineTo(L,top+h1);g.stroke();
      const mid=(L+R)/2;if(R-L>36&&mid>10&&mid<W-10){g.fillStyle='#EDE6D8';g.fillText(conKA(c),mid,top+h1/2);}}});}
  /* sidereal (Lahiri) equal signs */
  const ay=AYAN[T.ay][1]+p(T.y);
  for(let s=0;s<12;s++){/* sidereal sign s starts at tropical longitude s·30+ay → J2000 longitude vp+(s·30+ay) */
    const a=vp+s*30+ay,b=a+30;for(const off of [-360,0,360]){const x1=X(a+off),x2=X(b+off);const L=Math.min(x1,x2),R=Math.max(x1,x2);if(R<0||L>W||R-L>W)continue;
      g.fillStyle=s%2?'rgba(255,255,255,.04)':'rgba(255,255,255,.08)';g.fillRect(L,top+h1+6,R-L,h2);g.strokeStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(L,top+h1+6);g.lineTo(L,top+h1+6+h2);g.stroke();
      const mid=(L+R)/2;if(mid>10&&mid<W-10){g.fillStyle='rgba(232,226,213,.8)';g.font="12px 'Noto Sans Georgian',sans-serif";g.fillText(SGG[s]+' '+SG[s],mid,top+h1+6+h2/2);}}}
  g.textAlign='left';g.font="11px 'Noto Sans Georgian',sans-serif";g.fillStyle='rgba(232,214,174,.7)';
  g.fillText('IAU თანავარსკვლავედები (არათანაბარი)',8,top-10);g.fillText(`სიდერიული ნიშნები (${AYAN[T.ay][0]}, 30°)`,8,top+h1+6+h2+14);
  /* the gaps, measured: vernal point → sidereal 0° Aries (ayanamsa) and → the IAU border of Aries (true sidereal) */
  const brk=(x1,x2,y,txt,col,below)=>{if(Math.abs(x2-x1)<4)return;g.strokeStyle=col;g.fillStyle=col;g.lineWidth=1.6;g.beginPath();g.moveTo(x1,y);g.lineTo(x2,y);g.stroke();
    for(const [x,dir] of [[x1,Math.sign(x2-x1)],[x2,Math.sign(x1-x2)]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+dir*8,y-4);g.lineTo(x+dir*8,y+4);g.closePath();g.fill();g.beginPath();g.moveTo(x,y-7);g.lineTo(x,y+7);g.stroke();}
    g.font="600 12.5px 'Noto Sans Georgian',sans-serif";g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(4,3,11,.9)';const ty=below?y+16:y-9;g.strokeText(txt,(x1+x2)/2,ty);g.fillText(txt,(x1+x2)/2,ty);g.lineWidth=1;};
  const dms=d=>{const a=Math.abs(d),D=Math.floor(a),M=Math.round((a-D)*60);return (d<0?'−':'')+D+'°'+String(M===60?0:M).padStart(2,'0')+'′';};
  const sx=X(vp+ay);if(sx>-50&&sx<W+50)brk(cx,Math.max(2,Math.min(W-2,sx)),top+h1+6+h2+12,'აიანამშა '+dms(((ay+180)%360+360)%360-180),'#9fe0ff',true);
  if(segs){const ar=segs.find(x=>x[2]==='Ari');if(ar){let d=((ar[0]-vp)%360+540)%360-180;T.iauGap=d;const ax2=X(vp+d);if(ax2>-50&&ax2<W+50)brk(cx,Math.max(2,Math.min(W-2,ax2)),top+h1/2-12,'IAU ვერძამდე '+dms(d),'#ffd28a');}}
  /* vernal point */
  g.strokeStyle='#F3DDA4';g.lineWidth=2;g.beginPath();g.moveTo(cx,top-6);g.lineTo(cx,top+h1+h2+12);g.stroke();g.lineWidth=1;
  g.fillStyle='#F3DDA4';g.font='18px serif';g.textAlign='center';g.fillText(SGG[0],cx,top-20);
  g.font="12px 'Noto Sans Georgian',sans-serif";g.fillText('გაზაფხულის ბუნიობის წერტილი = ტროპიკული 0° ვერძი',cx,top+h1+h2+50);
  g.fillStyle='rgba(255,210,120,.75)';g.fillText('ზოდიაქოს საწინააღმდეგოდ მიდის (აქ — მარჯვნივ →) · ~1° ყოველ 71,6 წელიწადში',cx,top+h1+h2+68);
  g.fillText('თანავარსკვლავედები მის ფონზე მარცხნივ იწევს',cx,top+h1+h2+86);
  const con=typeof iauFromEcliptic==='function'?iauFromEcliptic(vp,0).abbr:null;
  const sid=n360(-ay),ss=Math.floor(sid/30);
  $('pr-h3').innerHTML=`<div class="t">3 · ეპოქები</div><div>${fy(T.y)}: ბუნიობის წერტილი — <b>${con?conKA(con):'—'}</b> თანავარსკვლავედში (ასტრონომიული ეპოქა) · სიდერიულად ${SGG[ss]} ${SG[ss]} ${(sid%30).toFixed(1)}° · აიანამშა (${AYAN[T.ay][0]}) <b>${(((ay+180)%360+360)%360-180).toFixed(2)}°</b>${T.iauGap!=null?` · ნამდვილი (IAU) ვერძის საზღვრამდე <b>${T.iauGap.toFixed(1)}°</b>`:''}</div>`;
}

/* ── loop ── */
function frame(ts){
  requestAnimationFrame(frame);
  const sec=$('form-precession');if(!sec||!sec.classList.contains('active')){T.last=0;return;}
  const dt=T.last?Math.min(0.1,(ts-T.last)/1000):0;T.last=ts;
  if(T.play){T.y+=dt*T.speed;if(T.y>13000)T.y=-13000;if(T.y<-13000)T.y=13000;}
  const sl=$('pr-slider');if(sl&&document.activeElement!==sl)sl.value=Math.round(T.y);
  $('pr-year').textContent=fy(T.y);
  for(const [id,f] of [['pr-c1',drawTop],['pr-c2',drawPole],['pr-c3',drawBand]]){const c=$(id),r=c.getBoundingClientRect();if(!r.width)continue;const dpr=Math.min(2,devicePixelRatio||1);
    if(c.width!==Math.round(r.width*dpr)||c.height!==Math.round(r.height*dpr)){c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);}
    const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);f(g,r.width,r.height);}
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
#pr-c1,#pr-c2{height:min(60vh,520px)}#pr-c3{height:300px}
.pr-h{position:absolute;left:14px;right:14px;top:10px;color:#F3ECDC;font-size:13px;line-height:1.55;text-shadow:0 0 6px #000;pointer-events:none}
.pr-h .t{font-family:Cinzel,'Noto Serif Georgian',serif;font-size:15px;color:#F7DE9A}.pr-h b{color:#F3DDA4}
#pr-c3h{bottom:auto}
.pr-txt{margin-top:14px;font-size:14px;line-height:1.8;color:rgba(236,228,210,.9)}
.pr-txt h4{font-family:Cinzel,'Noto Serif Georgian',serif;font-weight:400;letter-spacing:2px;color:#E3BE84;font-size:13px;margin:14px 0 4px}
.pr-txt p{margin:0 0 8px}.pr-txt b{color:#F3DDA4;font-weight:600}
.pr-txt table{border-collapse:collapse;font-size:13px;margin:4px 0 8px}.pr-txt td{padding:3px 12px 3px 0;border-bottom:1px solid rgba(255,255,255,.05)}`;
const TEXT=`<h4>რატომ ხდება პრეცესია</h4>
<p>დედამიწა იდეალური ბურთი არ არის: ბრუნვის გამო ეკვატორთან ოდნავ <b>გაბერილია</b> — ეკვატორული რადიუსი პოლარულზე ~21 კმ-ით მეტია. ეს „სარტყელი“ ეკლიპტიკის სიბრტყისადმი 23,4°-ით არის დახრილი.</p>
<p><b>მზე და მთვარე</b> გრავიტაციით ექაჩებიან ამ სარტყელს და ცდილობენ, ეკვატორი ეკლიპტიკის სიბრტყეში „ჩააწვინონ“. მაგრამ დედამიწა სწრაფად ბრუნავს, და მბრუნავი სხეული ასეთ ძალას არ ემორჩილება პირდაპირ — ის <b>გიროსკოპივით</b> პასუხობს: ღერძი არ ეცემა, არამედ ნელა შემოუვლის კონუსს ეკლიპტიკის პოლუსის გარშემო. ზუსტად ასე ტრიალებს დახრილი ბზრიალა.</p>
<p>ეფექტის ≈ 2/3 მთვარისგანაა (ახლოა), ≈ 1/3 — მზისგან. ერთი სრული შემობრუნება გრძელდება <b>≈ 25 772 წელს</b> — წელიწადში 50,3″, ანუ 1° ყოველ 71,6 წელიწადში. მცირე „რხევა“ ზედ (<b>ნუტაცია</b>, ±9″) მთვარის კვანძების 18,6-წლიანი ციკლიდან მოდის — იგივე კვანძები, რომლებიც დაბნელებებს განსაზღვრავს.</p>
<h4>რას ცვლის</h4>
<p><b>1. გაზაფხულის ბუნიობის წერტილი</b> (ტროპიკული 0° ვერძი) ნელა მოძრაობს თანავარსკვლავედების ფონზე ზოდიაქოს საწინააღმდეგოდ. ამიტომ <b>ტროპიკული</b> (სეზონებზე მიბმული) და <b>სიდერიული</b> (ვარსკვლავებზე მიბმული) ზოდიაქო სულ უფრო შორდება ერთმანეთს — ეს სხვაობაა <b>აიანამშა</b>. რამდენია, სკოლაზეა დამოკიდებული (2026 წ.): ლაჰირი 24°13′, კრიშნამურტი 24°07′, <b>ფეგან-ბრედლი 25°06′</b>, რამანი 22°46′, დელუსი 28°11′. „ჭეშმარიტ სიდერიულში“ (IAU არათანაბარი თანავარსკვლავედები) ბუნიობის წერტილიდან ვერძის საზღვრამდე კიდევ მეტია — ~29°. სკოლების მიხედვით ორივე ზოდიაქო ახ.წ. ~220–500 წლებში ემთხვეოდა.</p>
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
   <div class="pr-pane" style="margin-top:12px"><canvas id="pr-c3"></canvas><div class="pr-h" id="pr-h3" style="top:auto;bottom:8px"></div></div>
   <div class="pr-txt">${TEXT}</div>`;
  card.insertBefore(sec,$('form-relocation')||null);
  $('pr-play').onclick=()=>{T.play=!T.play;$('pr-play').textContent=T.play?'⏸ პაუზა':'▶ გაშვება';$('pr-play').classList.toggle('on',T.play);};
  $('pr-speed').onchange=e=>{T.speed=+e.target.value;};
  $('pr-ay').onchange=e=>{T.ay=e.target.value;};
  $('pr-now').onclick=()=>{T.y=new Date().getFullYear();};
  $('pr-go').onclick=()=>{const v=+$('pr-yin').value;if(isFinite(v))T.y=Math.max(-13000,Math.min(13000,v));};
  $('pr-slider').oninput=e=>{T.y=+e.target.value;};
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
