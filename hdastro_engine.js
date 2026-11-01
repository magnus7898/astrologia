/* hdastro_engine.js — ასტროლოგია + ადამიანის დიზაინი (in-browser engine)
   Used by hdastro.html. Needs Astronomy Engine (window.Astronomy) — loaded
   on demand by HDA.load(). No server needed for the chart itself.

   Conventions (same as hd_calc.py / hd_find.js):
     • tropical, apparent geocentric longitudes of date, true (osculating) node
     • design = moment the Sun stood 88° of arc before the birth Sun
     • gate wheel: Gate 41 starts at 302° (2° Aquarius), 5.625° per gate
     • houses: Placidus (default), Koch, Porphyry, Equal, Whole Sign
   Calendar: Julian before 1582-10-15, Gregorian after.                     */
(function(root){
'use strict';
const AE_URL='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
let A=null,aeP=null;
function load(){
  if(A)return Promise.resolve(A);
  if(root.Astronomy){A=root.Astronomy;return Promise.resolve(A);}
  if(!aeP)aeP=new Promise((ok,no)=>{const s=document.createElement('script');s.src=AE_URL;
    s.onload=()=>{A=root.Astronomy;ok(A);};s.onerror=()=>{aeP=null;no(new Error('ასტრონომიული ბიბლიოთეკა ვერ ჩაიტვირთა'));};
    document.head.appendChild(s);});
  return aeP;
}
function use(lib){A=lib;}

const D2R=Math.PI/180,R2D=180/Math.PI;
const norm=x=>((x%360)+360)%360;
const sd=a=>Math.sin(a*D2R),cd=a=>Math.cos(a*D2R),td=a=>Math.tan(a*D2R);

/* ── HD wheel ── */
const GATE_ORDER=[41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
  31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
const GW=360/64,GATE_START=302;
const GATE_IDX={};GATE_ORDER.forEach((g,i)=>GATE_IDX[g]=i);
/* gate → [start longitude, end longitude] */
function gateRange(g){const s=norm(GATE_START+GATE_IDX[g]*GW);return [s,s+GW];}
function decomp(lon){
  const off=norm(lon-GATE_START),gi=Math.floor(off/GW);let r=off-gi*GW;
  const lw=GW/6,line=Math.min(6,Math.floor(r/lw)+1);r-=(line-1)*lw;
  const cw=lw/6,color=Math.min(6,Math.floor(r/cw)+1);r-=(color-1)*cw;
  const tone=Math.min(6,Math.floor(r/(cw/6))+1);
  return {gate:GATE_ORDER[gi],line,color,tone};
}
const CENTER_GATES={"Head":[64,61,63],"Ajna":[47,24,4,17,11,43],"Throat":[62,23,56,16,35,12,45,33,8,31,20],
  "G":[1,2,7,10,13,15,25,46],"Heart":[21,26,40,51],"Solar Plexus":[6,22,30,36,37,49,55],
  "Spleen":[18,28,32,44,48,50,57],"Sacral":[3,5,9,14,27,29,34,42,59],"Root":[19,38,39,41,52,53,54,58,60]};
const G2C={};for(const c in CENTER_GATES)CENTER_GATES[c].forEach(g=>G2C[g]=c);
const CHANNELS=[
  [1,8,"შთაგონება"],[2,14,"განმეორებითი რიტმი"],[3,60,"მუტაცია"],[4,63,"ლოგიკა"],
  [5,15,"რიტმი"],[6,59,"შეწყვილება"],[7,31,"ალფა"],[9,52,"კონცენტრაცია"],
  [10,20,"გამოღვიძება"],[10,34,"შესწავლა"],[10,57,"სრულყოფილი ფორმა"],
  [11,56,"ცნობისმოყვარეობა"],[12,22,"გახსნილობა"],[13,33,"უძღები"],
  [16,48,"ტალღა"],[17,62,"მიმღებლობა"],[18,58,"განსჯა"],[19,49,"სინთეზი"],
  [20,34,"ქარიზმა"],[20,57,"ნეიროტალღები"],[21,45,"ფული"],[23,43,"სტრუქტურირება"],
  [24,61,"გაცნობიერება"],[25,51,"ინიციაცია"],[26,44,"დანებება"],[27,50,"შენარჩუნება"],
  [28,38,"ბრძოლა"],[29,46,"აღმოჩენა"],[30,41,"ცნობადობა"],[32,54,"ტრანსფორმაცია"],
  [34,57,"ძალაუფლება"],[35,36,"გარდამავლობა"],[37,40,"კავშირი"],[39,55,"ემოციურობა"],
  [42,53,"ჩამოყალიბება"],[47,64,"აბსტრაქცია"]];
const MOTORS=new Set(['Heart','Sacral','Solar Plexus','Root']);

/* ── time ── */
const aT=jd=>A.MakeTime(jd-2451545.0);
function calJD(y,m,d,h){
  if(m<=2){y-=1;m+=12;}
  const greg=(y>1582)||(y===1582&&(m>10||(m===10&&d>=15)));
  const B=greg?2-Math.floor(y/100)+Math.floor(Math.floor(y/100)/4):0;
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
function jdCal(jd){
  const z=Math.floor(jd+0.5),f=jd+0.5-z;let a=z;
  if(z>=2299161){const al=Math.floor((z-1867216.25)/36524.25);a=z+1+al-Math.floor(al/4);}
  const b=a+1524,c=Math.floor((b-122.1)/365.25),d=Math.floor(365.25*c),e=Math.floor((b-d)/30.6001);
  const day=b-d-Math.floor(30.6001*e),m=e<14?e-1:e-13,y=m>2?c-4716:c-4715;
  const mins=Math.round(f*1440);return {y,m,d:day,h:Math.floor(mins/60)%24,mi:mins%60,carry:mins>=1440};
}
function tzOff(tz,jd){/* minutes east of UTC */
  const ms=(jd-2440587.5)*86400000,yr=new Date(ms).getUTCFullYear();
  const use=(yr>=1850&&yr<=2150)?ms:Date.UTC(2001,0,15);
  try{const o={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'})
    .formatToParts(new Date(use)).forEach(p=>o[p.type]=p.value);
    return Math.round((Date.UTC(+o.year,+o.month-1,+o.day,+o.hour,+o.minute)-Math.floor(use/60000)*60000)/60000);}catch(e){return 0;}
}
function localToJD(y,m,d,h,mi,tz){const jd=calJD(y,m,d,h+mi/60);const o1=tzOff(tz,jd);const u=jd-o1/1440;const o2=tzOff(tz,u);return jd-o2/1440;}
function localParts(jd,tz){let p=jdCal(jd+tzOff(tz,jd)/1440);if(p.carry)p=jdCal(jd+tzOff(tz,jd)/1440+1e-6);return p;}

/* ── positions ── */
const plC=new Map();
function plutoFar(t){/* Pluto outside 0–4000 AD: smooth helio path, 4-pt Lagrange (as hd_find.js) */
  const k0=Math.floor(t.ut/100),f=t.ut/100-k0,S=[];
  for(let k=k0-1;k<=k0+2;k++){let v=plC.get(k);if(!v){const h=A.HelioVector('Pluto',A.MakeTime(k*100));v=[h.x,h.y,h.z];if(plC.size>400)plC.clear();plC.set(k,v);}S.push(v);}
  const w=[-f*(f-1)*(f-2)/6,(f+1)*(f-1)*(f-2)/2,-(f+1)*f*(f-2)/2,(f+1)*f*(f-1)/6];
  const P=[0,1,2].map(i=>w[0]*S[0][i]+w[1]*S[1][i]+w[2]*S[2][i]+w[3]*S[3][i]);
  const E=A.HelioVector('Earth',t);
  return A.Ecliptic(new A.Vector(P[0]-E.x,P[1]-E.y,P[2]-E.z,t)).elon;
}
function rawL(b,jd){const t=aT(jd);
  if(b==='Pluto'&&Math.abs(t.ut)>730000)return plutoFar(t);
  return A.Ecliptic(A.GeoVector(b,t,true)).elon;}
function nodeL(jd){const t=aT(jd),s=A.GeoMoonState(t),R=A.Rotation_EQJ_ECT(t);
  const r=A.RotateVector(R,new A.Vector(s.x,s.y,s.z,t)),v=A.RotateVector(R,new A.Vector(s.vx,s.vy,s.vz,t));
  const hx=r.y*v.z-r.z*v.y,hy=r.z*v.x-r.x*v.z;return norm(Math.atan2(hx,-hy)*R2D);}
const sunL=jd=>rawL('Sun',jd);
function designJD(jd){
  const tgt=sunL(jd)-88;let j=jd-89.5;
  for(let i=0;i<30;i++){const d=((sunL(j)-tgt)%360+540)%360-180;if(Math.abs(d)<1e-8)break;j-=d/0.9856;}
  return j;
}
const BODIES=['Sun','Earth','Moon','North Node','South Node','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
function bodyLon(b,jd){
  if(b==='Earth')return norm(sunL(jd)+180);
  if(b==='North Node')return nodeL(jd);
  if(b==='South Node')return norm(nodeL(jd)+180);
  return norm(rawL(b,jd));
}
function activations(jd){
  const o={};
  for(const b of BODIES){
    const lon=bodyLon(b,jd);
    const d=((bodyLon(b,jd+0.02)-bodyLon(b,jd-0.02))%360+540)%360-180;
    o[b]=Object.assign({lon,speed:d/0.04,retro:d<0},decomp(lon));
  }
  return o;
}

/* ── houses ── */
function angles(jd,lat,lon){
  const t=aT(jd),eps=A.e_tilt(t).tobl;
  const ramc=norm(A.SiderealTime(t)*15+lon);
  const mc=norm(Math.atan2(sd(ramc),cd(ramc)*cd(eps))*R2D);
  const asc=norm(Math.atan2(cd(ramc),-(sd(ramc)*cd(eps)+td(lat)*sd(eps)))*R2D);
  return {ramc,eps,mc,asc};
}
const raToLon=(ra,eps)=>norm(Math.atan2(sd(ra),cd(ra)*cd(eps))*R2D);
function placidus(ramc,eps,lat){
  /* cusp k of the semi-arc: 11 → DSA/3, 12 → 2DSA/3, 2 → IC−2NSA/3, 3 → IC−NSA/3 */
  const cusp=(f,above)=>{
    let ra=above?ramc+f*90:ramc+180-f*90,lam=raToLon(ra,eps);
    for(let i=0;i<60;i++){
      const dec=Math.asin(sd(eps)*sd(lam))*R2D,x=td(lat)*td(dec);
      if(Math.abs(x)>=1)return null;
      const ad=Math.asin(x)*R2D;
      ra=above?ramc+f*(90+ad):ramc+180-f*(90-ad);
      const nl=raToLon(ra,eps);if(Math.abs(((nl-lam+540)%360)-180)<1e-9){lam=nl;break;}lam=nl;
    }
    return lam;
  };
  const c11=cusp(1/3,true),c12=cusp(2/3,true),c2=cusp(2/3,false),c3=cusp(1/3,false);
  if([c11,c12,c2,c3].some(v=>v===null))return null;
  return {c11,c12,c2,c3};
}
function kochCusps(ramc,eps,lat,mc){
  const decMC=Math.asin(sd(eps)*sd(mc))*R2D,x=td(lat)*td(decMC);
  if(Math.abs(x)>=1)return null;
  const ad=Math.asin(x)*R2D,dsa=90+ad;
  const ascAt=r=>norm(Math.atan2(cd(r),-(sd(r)*cd(eps)+td(lat)*sd(eps)))*R2D);
  /* MC's oblique ascension OA=RAMC−AD, trisected by the MC's DSA;
     each cusp = ascendant for the shifted RAMC'=OA+k·DSA/3−90 */
  const o=ramc-ad-90;
  return {c11:ascAt(o+dsa/3),c12:ascAt(o+2*dsa/3),c2:ascAt(o+4*dsa/3),c3:ascAt(o+5*dsa/3)};
}
function houses(jd,lat,lon,sys){
  const {ramc,eps,mc,asc}=angles(jd,lat,lon);
  const cusps=new Array(12);
  const fromQuad=q=>{cusps[0]=asc;cusps[9]=mc;cusps[10]=q.c11;cusps[11]=q.c12;cusps[1]=q.c2;cusps[2]=q.c3;
    cusps[3]=norm(mc+180);cusps[6]=norm(asc+180);cusps[4]=norm(q.c11+180);cusps[5]=norm(q.c12+180);
    cusps[7]=norm(q.c2+180);cusps[8]=norm(q.c3+180);};
  const porph=()=>{const ic=norm(mc+180),a1=norm(ic-asc),a2=norm(asc-mc);/* asc→ic, mc→asc */
    fromQuad({c2:norm(asc+a1/3),c3:norm(asc+2*a1/3),c11:norm(mc+a2/3),c12:norm(mc+2*a2/3)});};
  let used=sys;
  if(sys==='E'){for(let i=0;i<12;i++)cusps[i]=norm(asc+30*i);}
  else if(sys==='W'){const s=Math.floor(asc/30)*30;for(let i=0;i<12;i++)cusps[i]=norm(s+30*i);}
  else if(sys==='O'){porph();}
  else if(sys==='K'){const q=kochCusps(ramc,eps,lat,mc);if(q)fromQuad(q);else{porph();used='O';}}
  else{const q=placidus(ramc,eps,lat);if(q)fromQuad(q);else{porph();used='O';}}
  return {asc,mc,ramc,eps,cusps,sys:used};
}
function houseOf(lon,cusps){
  for(let i=0;i<12;i++){const a=cusps[i],b=cusps[(i+1)%12];const span=norm(b-a),off=norm(lon-a);if(off<span)return i+1;}
  return 1;
}

/* ── HD derived ── */
function hdDerive(pers,des){
  const src={};
  const add=(o,k)=>{for(const b in o){const g=o[b].gate;(src[g]=src[g]||{p:false,d:false})[k]=true;}};
  add(pers,'p');add(des,'d');
  const G=new Set(Object.keys(src).map(Number));
  const chans=[];
  CHANNELS.forEach(([a,b,name],idx)=>{if(G.has(a)&&G.has(b))chans.push({idx,a,b,name,ca:G2C[a],cb:G2C[b]});});
  const defC=new Set(),adj={};for(const c in CENTER_GATES)adj[c]=new Set();
  chans.forEach(ch=>{defC.add(ch.ca);defC.add(ch.cb);if(ch.ca!==ch.cb){adj[ch.ca].add(ch.cb);adj[ch.cb].add(ch.ca);}});
  const reach=s=>{const seen=new Set([s]),st=[s];while(st.length){const n=st.pop();adj[n].forEach(m=>{if(defC.has(m)&&!seen.has(m)){seen.add(m);st.push(m);}});}return seen;};
  const sacral=defC.has('Sacral');let tm=false;
  if(defC.has('Throat')){const r=reach('Throat');tm=[...MOTORS].some(m=>r.has(m));}
  const type=!defC.size?'Reflector':sacral&&tm?'Manifesting Generator':sacral?'Generator':tm?'Manifestor':'Projector';
  const authority=defC.has('Solar Plexus')?'ემოციური (მზის წნული)':sacral?'საკრალური':defC.has('Spleen')?'სპლენური (ელენთა)'
    :defC.has('Heart')?'ეგო (გული)':defC.has('G')?'თვით-პროექცია (G)':(type==='Reflector'?'მთვარე':'მენტალური / გარემო');
  const un=new Set(defC);let groups=0;
  while(un.size){const st=[[...un][0]];groups++;while(st.length){const n=st.pop();if(un.has(n)){un.delete(n);adj[n].forEach(m=>{if(un.has(m))st.push(m);});}}}
  const definition={0:'განსაზღვრება არ არის',1:'ერთი მთლიანი',2:'გაყოფილი',3:'სამად გაყოფილი',4:'ოთხად გაყოფილი'}[groups]||groups+'-ჯერადი';
  const profile=pers.Sun.line+'/'+des.Sun.line;
  return {src,gates:G,channels:chans,centers:defC,type,authority,definition,profile};
}

/* ── full chart ── */
function chart(o){/* {jd, lat, lon, hsys, timeKnown} */
  const pers=activations(o.jd),dj=designJD(o.jd),des=activations(dj);
  const H=o.timeKnown?houses(o.jd,o.lat,o.lon,o.hsys||'P'):null;
  if(H){for(const b in pers)pers[b].house=houseOf(pers[b].lon,H.cusps);for(const b in des)des[b].house=houseOf(des[b].lon,H.cusps);}
  return Object.assign({jd:o.jd,designJD:dj,pers,des,houses:H},hdDerive(pers,des));
}

root.HDA={load,use,chart,houses,angles,activations,designJD,decomp,gateRange,localToJD,localParts,calJD,jdCal,tzOff,
  GATE_ORDER,GATE_START,GW,CHANNELS,CENTER_GATES,G2C,BODIES,norm};
})(typeof window!=='undefined'?window:globalThis);
