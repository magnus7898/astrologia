/* stats_engine.js — one birth moment → every feature of every system
   (zodiac · numerology · Pythagorean square · Destiny Matrix · Chinese · Human Design)
   Used by stats.html (browser, Astronomy Engine from jsDelivr) and by the node
   tests (pass the astronomy-engine module to SE.init).

   Rules mirror the site's own pages:
     • Pythagoras — pythagoras.html computeModes(), classic variant
     • Matrix     — matrix_stats.js m1() (method 1)
     • HD         — hd_find.js / hd_stats.js features() (= hd_calc.py)
     • numerology — numerology.html (moolank, Nine Star Ki); life path keeps 11/22/33
     • astrology  — tropical, geocentric apparent longitudes, true node, Placidus  */
(function(root){
'use strict';
const SE={};
let A=null;
const AE_URL='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
SE.init=function(lib){
  if(lib){A=lib;return Promise.resolve(A);}
  if(A)return Promise.resolve(A);
  if(root.Astronomy){A=root.Astronomy;return Promise.resolve(A);}
  return new Promise((ok,no)=>{const s=document.createElement('script');s.src=AE_URL;
    s.onload=()=>{A=root.Astronomy;ok(A);};s.onerror=()=>no(new Error('ასტრონომიული ბიბლიოთეკა ვერ ჩაიტვირთა'));document.head.appendChild(s);});
};
const D2R=Math.PI/180,R2D=180/Math.PI,nrm=x=>((x%360)+360)%360;
const aT=jd=>A.MakeTime(jd-2451545.0);

/* ── calendar (Julian before 1582-10-15, astronomical years) ── */
function calJD(y,m,d,h){
  if(m<=2){y-=1;m+=12;}
  const greg=(y>1582)||(y===1582&&(m>10||(m===10&&d>=15)));
  const B=greg?2-Math.floor(y/100)+Math.floor(Math.floor(y/100)/4):0;
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+(h||0)/24+B-1524.5;
}
function jdDay(jd){            /* calendar day containing jd */
  const z=Math.floor(jd+0.5);let a=z;
  if(z>=2299161){const al=Math.floor((z-1867216.25)/36524.25);a=z+1+al-Math.floor(al/4);}
  const b=a+1524,c=Math.floor((b-122.1)/365.25),d=Math.floor(365.25*c),e=Math.floor((b-d)/30.6001);
  const day=b-d-Math.floor(30.6001*e),m=e<14?e-1:e-13,y=m>2?c-4716:c-4715;
  return {y,m,d:day,wd:((z+1)%7+7)%7};   /* wd: 0 = Sunday */
}
SE.calJD=calJD;SE.jdDay=jdDay;

/* ── ephemeris ── */
const PLAN=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const RXP=['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
const plC=new Map();
/* Pluto outside 0–4000: Astronomy Engine re-integrates the orbit on every call
   (0.1–0.4 s), far too slow for thousands of random moments. pluto_far.js holds
   its heliocentric path pre-computed every 2000 days (same engine); 4-point
   Lagrange between them (< 1″ — the orbit takes 90 000 days); Earth stays exact. */
const PF=(typeof root.PLUTO_FAR!=='undefined')?root.PLUTO_FAR:(typeof require==='function'?(()=>{try{return require('./pluto_far.js');}catch(e){return null;}})():null);
function plutoTab(t){
  const seg=t.ut<0?PF.lo:PF.hi,st=PF.step,x=t.ut/st,k0=Math.floor(x),f=x-k0,S=[];
  for(let k=k0-1;k<=k0+2;k++){const i=(k-seg.k0)*3;if(i<0||i+2>=seg.v.length)return null;S.push([seg.v[i],seg.v[i+1],seg.v[i+2]]);}
  const w=[-f*(f-1)*(f-2)/6,(f+1)*(f-1)*(f-2)/2,-(f+1)*f*(f-2)/2,(f+1)*f*(f-1)/6];
  const P=[0,1,2].map(i=>w[0]*S[0][i]+w[1]*S[1][i]+w[2]*S[2][i]+w[3]*S[3][i]);
  const E=A.HelioVector('Earth',t);
  return A.Ecliptic(new A.Vector(P[0]-E.x,P[1]-E.y,P[2]-E.z,t)).elon;
}
function plutoFar(t){   /* fallback (as hd_find.js): 100-day helio samples, Lagrange */
  if(PF){const v=plutoTab(t);if(v!==null)return v;}
  const k0=Math.floor(t.ut/100),f=t.ut/100-k0,S=[];
  for(let k=k0-1;k<=k0+2;k++){let v=plC.get(k);if(!v){const h=A.HelioVector('Pluto',A.MakeTime(k*100));v=[h.x,h.y,h.z];if(plC.size>4000)plC.clear();plC.set(k,v);}S.push(v);}
  const w=[-f*(f-1)*(f-2)/6,(f+1)*(f-1)*(f-2)/2,-(f+1)*f*(f-2)/2,(f+1)*f*(f-1)/6];
  const P=[0,1,2].map(i=>w[0]*S[0][i]+w[1]*S[1][i]+w[2]*S[2][i]+w[3]*S[3][i]);
  const E=A.HelioVector('Earth',t);
  return A.Ecliptic(new A.Vector(P[0]-E.x,P[1]-E.y,P[2]-E.z,t)).elon;
}
function rawL(b,t){if(b==='Pluto'&&Math.abs(t.ut)>730000)return plutoFar(t);return A.Ecliptic(A.GeoVector(b,t,true)).elon;}
function sunL(jd){return A.Ecliptic(A.GeoVector('Sun',aT(jd),true)).elon;}
function nodeL(jd){const t=aT(jd),s=A.GeoMoonState(t),R=A.Rotation_EQJ_ECT(t);
  const r=A.RotateVector(R,new A.Vector(s.x,s.y,s.z,t)),v=A.RotateVector(R,new A.Vector(s.vx,s.vy,s.vz,t));
  const hx=r.y*v.z-r.z*v.y,hy=r.z*v.x-r.x*v.z;return nrm(Math.atan2(hx,-hy)*R2D);}
function designJD(jd,sl){
  const tgt=sl-88;let j=jd-89.4;
  for(let i=0;i<25;i++){const d=((sunL(j)-tgt)%360+540)%360-180;if(Math.abs(d)<1e-7)break;j-=d/0.9856;}
  return j;
}
/* mean obliquity, Laskar (valid ±10 000 y) */
function obliq(jd){const u=(jd-2451545)/3652500;
  const s=21.448+u*(-4680.93+u*(-1.55+u*(1999.25+u*(-51.38+u*(-249.67+u*(-39.05+u*(7.12+u*(27.87+u*(5.79+u*2.45)))))))));
  return 23+26/60+s/3600;}
/* ── house systems from RAMC, latitude, obliquity (all degrees) — formulas as in Swiss Ephemeris swehouse.c ── */
function cuspsArmc(th,lat,eps,code){
  const D2R=Math.PI/180,R2D=180/Math.PI,nrm=x=>((x%360)+360)%360;
  const sn=x=>Math.sin(x*D2R),cs=x=>Math.cos(x*D2R),tn=x=>Math.tan(x*D2R),e=eps;
  const lamOf=ra=>nrm(Math.atan2(sn(ra),cs(ra)*cs(e))*R2D);                 /* ecliptic point of right ascension ra */
  const ascAt=(x,f)=>nrm(Math.atan2(cs(x),-(sn(x)*cs(e)+tn(f)*sn(e)))*R2D);   /* rising point, RAMC x, pole height f */
  const A1=(x,f)=>ascAt(x-90,f);                                             /* swisseph Asc1(x, f) */
  const mc=lamOf(th),asc=ascAt(th,lat),c=new Array(12);let fb=false;
  const fill=(c11,c12,c2,c3)=>{c[0]=asc;c[9]=mc;c[10]=c11;c[11]=c12;c[1]=c2;c[2]=c3;};
  const porph=()=>{const q1=nrm(asc-mc),q2=nrm(mc+180-asc);fill(nrm(mc+q1/3),nrm(mc+2*q1/3),nrm(asc+q2/3),nrm(asc+2*q2/3));};
  const eq=(start)=>{for(let i=0;i<12;i++)c[i]=nrm(start+30*i);};
  switch(code){
    case 'P':{let ok=Math.abs(lat)<90-e;
      const cusp=(frac,above)=>{let ra=above?th+frac*90:th+180-frac*90;
        for(let i=0;i<60;i++){const dec=Math.asin(sn(e)*sn(lamOf(ra)))*R2D,x=-tn(lat)*tn(dec);if(x<-1||x>1){ok=false;break;}
          const sda=Math.acos(x)*R2D,nra=above?th+frac*sda:th+180-frac*(180-sda);
          if(Math.abs(((nra-ra)%360+540)%360-180)<1e-9){ra=nra;break;}ra=nra;}
        return lamOf(ra);};
      if(ok){const a=cusp(1/3,true),b=cusp(2/3,true),d=cusp(2/3,false),f=cusp(1/3,false);if(ok)fill(a,b,d,f);}
      if(!ok){porph();fb=true;}break;}
    case 'K':{const sina=sn(mc)*sn(e)/cs(lat);
      if(Math.abs(sina)>1||Math.abs(lat)>=90-e){porph();fb=true;break;}
      const cosa=Math.sqrt(1-sina*sina),cc=Math.atan(tn(lat)/cosa)*R2D,ad3=Math.asin(sn(cc)*sina)*R2D/3;
      fill(A1(th+30-2*ad3,lat),A1(th+60-ad3,lat),A1(th+120+ad3,lat),A1(th+150+2*ad3,lat));break;}
    case 'O':porph();break;
    case 'R':{const f1=Math.atan(tn(lat)*0.5)*R2D,f2=Math.atan(tn(lat)*cs(30))*R2D;
      fill(A1(th+30,f1),A1(th+60,f2),A1(th+120,f2),A1(th+150,f1));break;}
    case 'C':{const f1=Math.asin(sn(lat)/2)*R2D,f2=Math.asin(Math.sqrt(3)/2*sn(lat))*R2D,cf=cs(lat);
      const x1=Math.atan(Math.sqrt(3)/cf)*R2D,x2=Math.atan(1/Math.sqrt(3)/cf)*R2D;
      fill(A1(th+90-x1,f1),A1(th+90-x2,f2),A1(th+90+x2,f2),A1(th+90+x1,f1));break;}
    case 'T':{const f1=Math.atan(tn(lat)/3)*R2D,f2=Math.atan(tn(lat)*2/3)*R2D;
      fill(A1(th+30,f1),A1(th+60,f2),A1(th+120,f2),A1(th+150,f1));break;}
    case 'B':{const dek=Math.asin(sn(asc)*sn(e))*R2D,r=-tn(lat)*tn(dek);
      if(Math.abs(r)>1){porph();fb=true;break;}
      const sda=Math.acos(r)*R2D,sna=180-sda,sd3=sda/3,sn3=sna/3;
      fill(lamOf(th+sd3),lamOf(th+2*sd3),lamOf(th+180-2*sn3),lamOf(th+180-sn3));break;}
    case 'M':{for(let i=0;i<12;i++){const a=th+90+30*i;c[i]=nrm(Math.atan2(sn(a)*cs(e),cs(a))*R2D);}break;}
    case 'X':{for(let i=0;i<12;i++)c[i]=lamOf(th+90+30*i);break;}
    case 'E':eq(asc);break;
    case 'D':eq(nrm(mc+90));break;
    case 'W':eq(Math.floor(asc/30)*30);break;
    case 'V':eq(nrm(asc-15));break;
    case 'N':eq(0);break;
    case 'S':{porph();const p=c.slice();for(let i=0;i<12;i++){const a=p[(i+11)%12],b=p[i];c[i]=nrm(a+nrm(b-a)/2);}break;}
    default:return cuspsArmc(th,lat,eps,'P');
  }
  return {c,asc,mc,fb};
}
/* cusps (1..12 → index 0..11) in house system `code` (default SE.HSYS = Placidus);
   Placidus / Koch / Alcabitius beyond the polar circle → Porphyry */
SE.HSYS='P';
SE.HOUSE_CODES='PKORCEDWVNBMTXS';
function houses(jd,lat,lon,code){
  const t=aT(jd),ramc=nrm(A.SiderealTime(t)*15+lon);
  const h=cuspsArmc(ramc,lat,obliq(jd),code||SE.HSYS);
  return {c:h.c,asc:h.asc,mc:h.mc,placidus:!h.fb,fallback:h.fb};
}
SE.cuspsArmc=cuspsArmc;
function houseOf(c,L){for(let i=0;i<12;i++){const s=c[i],span=nrm(c[(i+1)%12]-s);if(nrm(L-s)<span)return i+1;}return 12;}
SE.houses=houses;SE.houseOf=houseOf;

/* ── HD tables (hd_find.js) ── */
const GATE_ORDER=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
  31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
const CG={"Head":[64,61,63],"Ajna":[47,24,4,17,11,43],"Throat":[62,23,56,16,35,12,45,33,8,31,20],"G":[1,2,7,10,13,15,25,46],
  "Heart":[21,26,40,51],"Solar Plexus":[6,22,30,36,37,49,55],"Spleen":[18,28,32,44,48,50,57],"Sacral":[3,5,9,14,27,29,34,42,59],
  "Root":[19,38,39,41,52,53,54,58,60]};
const G2C={};for(const c in CG)CG[c].forEach(g=>G2C[g]=c);
const CH=[[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],
  [18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],
  [37,40],[39,55],[42,53],[47,64]];
const MOTORS=new Set(['Heart','Sacral','Solar Plexus','Root']);
const GW=360/64;
function decomp(lon){
  const off=nrm(lon-302),gi=Math.floor(off/GW);let r=off-gi*GW;
  const lw=GW/6,line=Math.min(6,Math.floor(r/lw)+1);r-=(line-1)*lw;
  const cw=lw/6,color=Math.min(6,Math.floor(r/cw)+1);r-=(color-1)*cw;
  const tone=Math.min(6,Math.floor(r/(cw/6))+1);
  return {gate:GATE_ORDER[Math.min(63,gi)],line,color,tone};
}
function hdChart(Lp,jd){
  const actsOf=L=>{const o={};for(const b of PLAN)o[b]=decomp(L[b]);o.Earth=decomp(L.Sun+180);o['North Node']=decomp(L.Node);o['South Node']=decomp(L.Node+180);return o;};
  const dj=designJD(jd,Lp.Sun),t=aT(dj),Ld={};for(const b of PLAN)Ld[b]=rawL(b,t);Ld.Node=nodeL(dj);
  const P=actsOf(Lp),D=actsOf(Ld);
  const G=new Set([...Object.values(P),...Object.values(D)].map(a=>a.gate));
  const C=new Set(),adj={};for(const c in CG)adj[c]=new Set();
  const chans=[];
  for(const [a,b] of CH)if(G.has(a)&&G.has(b)){chans.push(a+'-'+b);const x=G2C[a],y=G2C[b];C.add(x);C.add(y);if(x!==y){adj[x].add(y);adj[y].add(x);}}
  let type;
  if(!C.size)type='Reflector';
  else{let tm=false;if(C.has('Throat')){const seen=new Set(['Throat']),st=['Throat'];
      while(st.length){const n=st.pop();for(const m of adj[n])if(C.has(m)&&!seen.has(m)){seen.add(m);st.push(m);}}
      tm=[...seen].some(m=>MOTORS.has(m));}
    const sac=C.has('Sacral');type=sac&&tm?'Manifesting Generator':sac?'Generator':tm?'Manifestor':'Projector';}
  let auth;
  if(C.has('Solar Plexus'))auth='emo';else if(C.has('Sacral'))auth='sac';else if(C.has('Spleen'))auth='spl';
  else if(C.has('Heart'))auth='ego';else if(C.has('G'))auth='self';else if(type==='Reflector')auth='moon';else auth='ment';
  let groups=0;const un=new Set(C);while(un.size){groups++;const st=[un.values().next().value];while(st.length){const x=st.pop();if(!un.has(x))continue;un.delete(x);for(const m of adj[x])if(un.has(m))st.push(m);}}
  const prof=P.Sun.line+'/'+D.Sun.line,side=t=>t<=3?0:1,ar=t=>t<=3?'L':'R';
  return {type,auth,def:Math.min(groups,4),prof,cross:prof==='4/1'?'jx':(+prof[0]>=5?'left':'right'),
    centers:[...C],ncent:C.size,chans,nch:chans.length,gates:[...G],psun:P.Sun.gate,dsun:D.Sun.gate,
    dig:(D.Sun.color-1)*2+side(D.Sun.tone),env:(D['North Node'].color-1)*2+side(D['North Node'].tone),
    mot:(P.Sun.color-1)*2+side(P.Sun.tone),per:(P['North Node'].color-1)*2+side(P['North Node'].tone),
    sense:D.Sun.tone,vari:`P${ar(P.Sun.tone)}${ar(P['North Node'].tone)} D${ar(D.Sun.tone)}${ar(D['North Node'].tone)}`};
}

/* ── numbers ── */
const dsum=n=>String(Math.abs(n)).split('').reduce((a,c)=>a+ +c,0);
const red9=n=>{n=Math.abs(Math.trunc(n));while(n>9)n=dsum(n);return n;};
const redM=n=>{n=Math.abs(Math.trunc(n));while(n>9&&n!==11&&n!==22&&n!==33)n=dsum(n);return n;};
const R22=n=>{while(n>22)n=dsum(n);return n;};
function pyth(d,m,y){   /* pythagoras.html classic */
  const day=String(d).padStart(2,'0'),mon=String(m).padStart(2,'0'),yr=String(Math.abs(y)).padStart(4,'0');
  const bd=(day+mon+yr).split('').map(Number);
  const A1=bd.reduce((a,b)=>a+b,0),fd=day[0]!=='0'?+day[0]:+day[1];
  const B1=dsum(A1),C1=Math.abs(A1-2*fd),D1=dsum(C1);
  const cnt=[0,0,0,0,0,0,0,0,0,0];
  [...bd,...[A1,B1,C1,D1].flatMap(x=>String(x).split('').map(Number))].forEach(x=>{if(x>0)cnt[x]++;});
  return {cnt,w:[A1,B1,C1,D1]};
}
/* matrix_stats.js m1() — verbatim (method 1) */
function m1(dd,mm,R3){const R=R22;
  const L3=R(dd),T3=R(mm);
  const B3=R(L3+T3+R3),Cv=R(L3+T3+R3+B3);
  const TL3=R(L3+T3),TR3=R(T3+R3),BR3=R(R3+B3),BL3=R(B3+L3);
  const RC1=R(TL3+TR3+BR3+BL3),RC2=R(RC1+Cv);
  const B1=R(Cv+B3),B2=R(B1+B3),R1=R(Cv+R3),R2=R(R1+R3),L1=R(Cv+L3),L2=R(L1+L3),T1=R(Cv+T3),T2=R(T1+T3),G1=R(L1+Cv),G2=R(T1+Cv);
  const dCv=RC1;
  const TL1=R(TL3+dCv),TL2=R(TL1+TL3),TR1=R(TR3+dCv),TR2=R(TR1+TR3),BR1=R(BR3+dCv),BR2=R(BR1+BR3),BL1=R(BL3+dCv),BL2=R(BL1+BL3);
  const W2=R(B1+R1),W1=R(B1+W2),W3=R(R1+W2);
  const v={L3,T3,R3,B3,Cv,B1,B2,R1,R2,L1,L2,T1,T2,G1,G2,TL3,TR3,BR3,BL3,RC1,RC2,TL1,TL2,TR1,TR2,BR1,BR2,BL1,BL2,W1,W2,W3};
  /* chakra rows exactly as renderChakra()/chakraRows() for method 1 */
  const CH=[['sahasrara',T3,L3],['ajna',T2,L2],['vishudha',T1,L1],['anahata',G2,G1],['manipura',Cv,Cv],['svadhistana',B1,R1],['muladhara',B3,R3]];
  let se=0,sp=0,ss=0;
  for(const [k,e,p] of CH){const s=R(e+p);v['CHE_'+k]=e;v['CHP_'+k]=p;v['CHS_'+k]=s;se+=e;sp+=p;ss+=s;}
  v.CHE_total=R(se);v.CHP_total=R(sp);v.CHS_total=R(ss);
  v.S6=v.CHS_svadhistana;
  /* purposes (extra panels) */
  v.MALE=R(TL3+BR3);v.FEM=R(TR3+BL3);
  const sT=R(T3+B3),sB=R(R3+L3);v.SOUL=R(sT+sB);
  const oT=R(TL3+BR3),oB=R(TR3+BL3);v.SOC=R(oT+oB);v.MISSION=R(v.SOUL+v.SOC);
  return v;
}
function matrix(d,m,y){const v=m1(d,m,y===0?22:R22(Math.abs(y)));v.tail=v.B3+'-'+v.B2+'-'+v.B1;return v;}

/* ── one sample ──
   stage 0: date systems (free)  ·  stage 1: sky at birth  ·  stage 2: Human Design */
const ASPS=[[0,8],[60,5],[90,7],[120,7],[180,8]];
SE.ASPS=ASPS;SE.PLAN=PLAN;SE.RXP=RXP;SE.CH=CH;SE.CG=CG;
SE.stage0=function(jd,off){
  const {y,m,d,wd}=jdDay(jd+off/24);
  const all=String(d)+String(m)+String(Math.abs(y));
  const sy=(m<2||(m===2&&d<4))?y-1:y;          /* solar year from ~4 Feb */
  const ki=(()=>{let s=red9(dsum(sy));let st=11-s;return st===10?1:st;})();
  return {jd,y,m,d,wd:(wd+6)%7,life:redM(dsum(all)),bday:red9(d),py:pyth(d,m,y),mx:matrix(d,m,y),
    animal:(((sy-4)%12)+12)%12,elem:Math.floor(((((sy-4)%10)+10)%10)/2),yy:(((sy-4)%2)+2)%2,ki,stage:0};
};
SE.stage1=function(S,lat,lon){
  const t=aT(S.jd),t2=aT(S.jd+0.05),L={};
  for(const b of PLAN)L[b]=rawL(b,t);
  L.Node=nodeL(S.jd);
  const rx={};for(const b of RXP){rx[b]=((rawL(b,t2)-L[b]+540)%360-180)<0;}
  const H=houses(S.jd,lat,lon);
  L.Asc=H.asc;L.MC=H.mc;
  S.L=L;S.rx=rx;S.cusps=H.c;S.stage=1;return S;
};
SE.stage2=function(S){S.hd=hdChart(S.L,S.jd);S.stage=2;return S;};
SE.aspect=function(a,b){const s=Math.abs(((a-b)%360+540)%360-180);for(const [ang,orb] of ASPS)if(Math.abs(s-ang)<=orb)return ang;return -1;};
SE.decomp=decomp;SE.hdChart=hdChart;SE.pyth=pyth;SE.matrix=matrix;SE.rawL=(b,jd)=>rawL(b,aT(jd));SE.nodeL=nodeL;
root.SE=SE;
if(typeof module!=='undefined')module.exports=SE;
})(typeof window!=='undefined'?window:globalThis);
