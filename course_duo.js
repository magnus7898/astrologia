/* course_duo.js — in every lesson: the date's matrix (method 1, matrix page geometry and colours) and its Pythagorean square side by side.
   Reads the lesson's own #dd #mm #yy inputs and redraws on input. Needs pyth_course.js (loads it itself if missing). */
(function(){
'use strict';
function start(){
const $=id=>document.getElementById(id),PY=window.PY;if(!PY||!$('dd'))return;
const r22=n=>{while(n>22)n=String(n).split('').reduce((a,d)=>a+ +d,0);return n;};
function calc(d,m,y){const v={};
  v.L3=r22(d);v.T3=r22(m);v.R3=r22(y);v.B3=r22(v.L3+v.T3+v.R3);v.Cv=r22(v.L3+v.T3+v.R3+v.B3);
  v.TL3=r22(v.L3+v.T3);v.TR3=r22(v.T3+v.R3);v.BR3=r22(v.R3+v.B3);v.BL3=r22(v.B3+v.L3);
  v.RC1=r22(v.TL3+v.TR3+v.BR3+v.BL3);v.RC2=r22(v.RC1+v.Cv);
  for(const k of ['L','T','R','B']){v[k+'1']=r22(v.Cv+v[k+'3']);v[k+'2']=r22(v[k+'1']+v[k+'3']);}
  for(const k of ['TL','TR','BR','BL']){v[k+'1']=r22(v[k+'3']+v.RC1);v[k+'2']=r22(v[k+'1']+v[k+'3']);}
  v.G1=r22(v.L1+v.Cv);v.G2=r22(v.T1+v.Cv);v.W2=r22(v.B1+v.R1);v.W1=r22(v.B1+v.W2);v.W3=r22(v.R1+v.W2);return v;}
/* geometry exactly as matrix.html */
const cx=600,cy=600,rc=60,r1=25,r2=40,r3=64,gap=180,d1=rc+gap+r1,d2=d1+r1+r2,d3=d2+r2+r3,sq=Math.SQRT1_2;
const e1=Math.round(d1*sq),e2=Math.round((d1+r1+r2)*sq),e3=Math.round((d1+r1+r2+r2+r3)*sq),oR=d3+r3;
const dk=['rgba(20,14,50,0.92)','rgba(180,160,255,0.75)'],C1=['#4a8cc8','#1a5090'],C2=['#2060a8','#0a3878'],VI=['#7F77DD','#534AB7'],RD=['#E24B4A','#A32D2D'],OR=['#EF9F27','#BA7517'],GR=['#639922','#3B6D11'];
const W=t=>[Math.round(cx+t*d1),Math.round(cy+d1-t*d1)];
const PT={Cv:[cx,cy,rc,'#FFD700','#BA7517'],G1:[cx-rc-gap/2,cy,r1,...GR],G2:[cx,cy-rc-gap/2,r1,...GR],
 T1:[cx,cy-d1,r1,...C1],T2:[cx,cy-d2,r2,...C2],T3:[cx,cy-d3,r3,...VI],L1:[cx-d1,cy,r1,...C1],L2:[cx-d2,cy,r2,...C2],L3:[cx-d3,cy,r3,...VI],
 B1:[cx,cy+d1,r1,...OR],B2:[cx,cy+d2,r2,...dk],B3:[cx,cy+d3,r3,...RD],R1:[cx+d1,cy,r1,...OR],R2:[cx+d2,cy,r2,...dk],R3:[cx+d3,cy,r3,...RD],
 RC1:[cx+rc+r2,cy,r2,...dk],RC2:[cx+rc+r2*2+r1,cy,r1,...dk],
 TL1:[cx-e1,cy-e1,r1,...dk],TL2:[cx-e2,cy-e2,r2,...dk],TL3:[cx-e3,cy-e3,r3,...dk],TR1:[cx+e1,cy-e1,r1,...dk],TR2:[cx+e2,cy-e2,r2,...dk],TR3:[cx+e3,cy-e3,r3,...dk],
 BL1:[cx-e1,cy+e1,r1,...dk],BL2:[cx-e2,cy+e2,r2,...dk],BL3:[cx-e3,cy+e3,r3,...dk],BR1:[cx+e1,cy+e1,r1,...dk],BR2:[cx+e2,cy+e2,r2,...dk],BR3:[cx+e3,cy+e3,r3,...dk],
 W1:[...W(.25),r1,...dk],W2:[...W(.5),r1,...dk],W3:[...W(.75),r1,...dk]};
function svg(v){let h='';const ln=(a,b,c,d,s,w)=>{h+=`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${s}" stroke-width="${w}"/>`;};
  h+=`<polygon points="${cx},${cy-2*e1} ${cx+2*e1},${cy} ${cx},${cy+2*e1} ${cx-2*e1},${cy}" fill="none" stroke="rgba(127,119,221,0.9)" stroke-width="1.5"/>`;
  h+=`<rect x="${cx-d1}" y="${cy-d1}" width="${d1*2}" height="${d1*2}" fill="none" stroke="rgba(220,200,255,0.9)" stroke-width="1.5"/>`;
  const lc='rgba(220,200,255,0.75)',x=d3+r3;ln(cx-x,cy,cx+x,cy,lc,.8);ln(cx,cy-x,cx,cy+x,lc,.8);ln(cx,cy+d1,cx+d1,cy,lc,.8);
  ln(cx+e1,cy-e1,cx-e1,cy+e1,'rgba(255,120,120,1)',1.5);ln(cx-e1,cy-e1,cx+e1,cy+e1,'rgba(210,110,255,1)',1.5);
  h+=`<circle cx="${cx}" cy="${cy}" r="${oR}" fill="none" stroke="rgba(180,160,255,0.95)" stroke-width="2.5"/>`;
  for(const k in PT){const [px,py,r,f,s]=PT[k];h+=`<circle cx="${px}" cy="${py}" r="${r}" fill="${f}" stroke="${s}" stroke-width="1.5"/><text x="${px}" y="${py}" font-size="${Math.max(20,Math.round(r*1.3))}" font-weight="700" fill="#fff" font-family="Cinzel,serif" text-anchor="middle" dominant-baseline="central">${v[k]}</text>`;}
  return `<svg viewBox="${cx-oR-14} ${cy-oR-14} ${2*oR+28} ${2*oR+28}" role="img" aria-label="მატრიცა">${h}</svg>`;}
document.head.insertAdjacentHTML('beforeend',`<style>${PY.CSS}
.duo{margin-top:16px;border:1px solid rgba(184,137,74,.35);border-radius:14px;padding:12px 14px}
.duo>summary{cursor:pointer;list-style:none;font-family:'Marcellus SC','Noto Serif Georgian',serif;font-size:14px;letter-spacing:.06em;color:#E3BE84;display:flex;justify-content:space-between;align-items:center}
.duo>summary::-webkit-details-marker{display:none}.duo>summary::after{content:'＋';color:#C9A24C}.duo[open]>summary::after{content:'－'}
.duo-g{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:10px;align-items:center}
@media(max-width:700px){.duo-g{grid-template-columns:1fr}}
.duo-c{text-align:center}.duo-c h4{font-weight:400;font-size:12px;letter-spacing:.12em;color:#B8894A;margin-bottom:6px}
.duo-c a{display:block;color:inherit;text-decoration:none}.duo-c svg{width:100%;max-width:360px;height:auto}
.duo-c .pq{margin:0 auto}.duo-n{font-size:12px;color:#9aa3b6;margin-top:6px}
</style>`);
const box=document.createElement('details');box.className='duo';box.open=true;
box.innerHTML='<summary>მატრიცა და პითაგორას კვადრატი — შენს თარიღზე</summary><div class="duo-g"><div class="duo-c"><h4>ბედისწერის მატრიცა</h4><a href="course_matrix8.html" id="duo-m"></a></div><div class="duo-c"><h4>პითაგორას კვადრატი</h4><div id="duo-p"></div><div class="duo-n" id="duo-w"></div></div></div>';
const panel=$('dd').closest('.panel')||$('dd').parentNode;panel.insertAdjacentElement('afterend',box);
function upd(){const d=+$('dd').value,m=+$('mm').value,y=+$('yy').value;
  const dim=[31,(y%4===0&&(y%100!==0||y%400===0))?29:28,31,30,31,30,31,31,30,31,30,31];
  if(!(m>=1&&m<=12&&d>=1&&d<=dim[m-1]&&y>=1000&&y<=2100)){$('duo-m').innerHTML='<div class="duo-n" style="padding:30px 0">ჩაწერე დაბადების თარიღი ზემოთ</div>';$('duo-p').innerHTML='';$('duo-w').textContent='';return;}
  $('duo-m').innerHTML=svg(calc(d,m,y));
  const r=PY.calc(String(d).padStart(2,'0'),String(m).padStart(2,'0'),String(y));
  $('duo-p').innerHTML=PY.square(r.count);$('duo-w').textContent=`სამუშაო რიცხვები: ${r.I} · ${r.II} · ${r.III} · ${r.IV}`;}
['dd','mm','yy'].forEach(id=>$(id).addEventListener('input',upd));
$('duo-p').addEventListener('click',e=>{const c=e.target.closest('.pq-c');if(c)location.href='course_pyth'+(+c.dataset.n+2)+'.html';});
upd();}
if(window.PY)start();else{const s=document.createElement('script');s.src='pyth_course.js';s.onload=start;document.head.appendChild(s);}
})();
