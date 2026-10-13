/* formulas.js — „ასტროლოგიური ფორმულები“: პროფესიებისა და ცხოვრების თემების ფორმულები სახლების კავშირით.
   Self-injecting add-on for astro.html — load after techniques.js.
   House A is connected to house B when (weights):
     1 · A's ruler stands in B (or B's ruler in A) ............ 3
     2 · rulers of A and B in major aspect (☌ 3, others 2) .... 2–3
     3 · ruler of A aspects the cusp of B (orb 3°) ............ 1
     4 · rulers of A and B in mutual reception ................ 2
     5 · a planet in A rules B (or in B rules A) .............. 1
   Rulership (MAGNUS): Aries — ♇ (+♂), Scorpio — ♂, Aquarius — ♅ (+♄), Pisces — ♆ (+♃).    */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const n360=x=>((x%360)+360)%360;
const SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const GL={'მზე':'☉','მთვარე':'☽','მერკური':'☿','ვენერა':'♀','მარსი':'♂','იუპიტერი':'♃','სატურნი':'♄','ურანი':'♅','ნეპტუნი':'♆','პლუტონი':'♇','ქირონი':'⚷'};
const g=n=>(GL[n]||'')+'︎';
const RUL=[['პლუტონი','მარსი'],['ვენერა'],['მერკური'],['მთვარე'],['მზე'],['მერკური'],['ვენერა'],['მარსი'],['იუპიტერი'],['სატურნი'],['ურანი','სატურნი'],['ნეპტუნი','იუპიტერი']];
const PL=['მზე','მთვარე','მერკური','ვენერა','მარსი','იუპიტერი','სატურნი','ურანი','ნეპტუნი','პლუტონი'];
const DOM={'მზე':[4],'მთვარე':[3],'მერკური':[2,5],'ვენერა':[1,6],'მარსი':[7],'იუპიტერი':[8],'სატურნი':[9],'ურანი':[10],'ნეპტუნი':[11],'პლუტონი':[0]};
const EXA={'მზე':0,'მთვარე':1,'მერკური':5,'ვენერა':11,'მარსი':9,'იუპიტერი':3,'სატურნი':6};
const ASP=[[0,8,3,'☌'],[180,7,2,'☍'],[120,6,2,'△'],[90,6,2,'□'],[60,4,2,'⚹']];
const ROM=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
/* [name, group, house pairs, key planets, description] */
const FORMULAS=[
 ['რეჟისორი','პროფესია',[[5,10],[5,11],[1,5]],['მზე','იუპიტერი'],'შემოქმედების (5) გატანა სოციალურ სტატუსში (10) და კოლექტივში (11).'],
 ['მსახიობი','პროფესია',[[5,1],[5,12],[5,10]],['ნეპტუნი','ვენერა'],'თვითგამოხატვა (5), როლი/ნიღაბი (12) და საჯაროობა (10).'],
 ['ბიზნესმენი','პროფესია',[[2,10],[2,8],[2,11],[7,10]],['იუპიტერი','პლუტონი'],'ფული (2, 8) კარიერასთან (10), მოგებასთან (11) და პარტნიორებთან (7).'],
 ['პოლიტიკოსი','პროფესია',[[10,11],[1,10],[9,10]],['მზე','პლუტონი','იუპიტერი'],'ძალაუფლება (10), მასები (11) და იდეოლოგია (9).'],
 ['ექიმი','პროფესია',[[6,12],[6,8]],['მარსი','ქირონი'],'მომსახურება და ჯანმრთელობა (6), საავადმყოფო (12), სიცოცხლე-სიკვდილი (8).'],
 ['ქირურგი','პროფესია',[[8,6],[1,8]],['მარსი'],'ჭრა, რისკი, სიცოცხლე-სიკვდილი (8) და სამედიცინო შრომა (6).'],
 ['იურისტი','პროფესია',[[9,7],[7,10]],['იუპიტერი','სატურნი'],'კანონი (9), სასამართლო და ხელშეკრულებები (7), სტატუსი (10).'],
 ['მასწავლებელი','პროფესია',[[3,9],[3,5]],['მერკური','იუპიტერი'],'ცოდნის გადაცემა (3, 9) და ბავშვები (5).'],
 ['მწერალი','პროფესია',[[3,5],[3,9],[3,12]],['მერკური'],'სიტყვა (3), შემოქმედება (5), იდეები (9) და შინაგანი სამყარო (12).'],
 ['ჟურნალისტი','პროფესია',[[3,9],[9,11],[3,11]],['მერკური','ურანი'],'ინფორმაცია (3), შორეული (9) და საზოგადოება (11).'],
 ['ფსიქოლოგი','პროფესია',[[8,12],[6,8]],['პლუტონი','ნეპტუნი'],'ფსიქიკის სიღრმე (8), ქვეცნობიერი (12) და დახმარება (6).'],
 ['ასტროლოგი','პროფესია',[[8,11],[11,12],[8,12]],['ურანი'],'ოკულტური (8, 12) და ასტროლოგია (11).'],
 ['ფინანსისტი / ბანკირი','პროფესია',[[2,8],[8,11],[2,11]],['იუპიტერი','სატურნი'],'საკუთარი (2) და სხვისი ფული (8), შემოსავალი (11).'],
 ['სამხედრო','პროფესია',[[6,8],[8,10],[6,10]],['მარსი'],'სამსახური (6), რისკი (8) და იერარქია (10).'],
 ['მუსიკოსი','პროფესია',[[2,5],[5,12]],['ვენერა','ნეპტუნი'],'ხმა, სმენა (2), შემოქმედება (5) და შთაგონება (12).'],
 ['პილოტი / მოგზაური','პროფესია',[[9,3],[9,12]],['ურანი'],'შორეული (9), ახლო (3) მოგზაურობა და უცხოეთი (12).'],
 ['ქორწინება','ცხოვრების თემა',[[1,7],[5,7]],['ვენერა','მთვარე'],'პიროვნება (1) და სიყვარული (5) პარტნიორობასთან (7).'],
 ['ემიგრაცია','ცხოვრების თემა',[[4,9],[4,12]],['ურანი','იუპიტერი'],'სახლი (4) შორეულ (9) და უცხო (12) ადგილას.'],
 ['მემკვიდრეობა','ცხოვრების თემა',[[2,8],[4,8]],['პლუტონი','სატურნი'],'სხვისი ფული (8), ოჯახი (4) და საკუთრება (2).'],
 ['დიდება','ცხოვრების თემა',[[10,11],[5,10]],['მზე','იუპიტერი'],'სტატუსი (10), საზოგადოება (11) და თვითგამოხატვა (5).']];
/* baseline: 21 quantiles (0,5,…,100%) of the score over 600 random charts (1930–2020, lat 30–60°) */
const QUANT={"რეჟისორი": [0, 9, 18, 27, 27, 28, 37, 37, 44, 46, 47, 53, 54, 56, 62, 63, 64, 72, 80, 81, 100], "მსახიობი": [0, 10, 19, 27, 27, 28, 37, 37, 44, 46, 46, 53, 53, 54, 62, 63, 64, 72, 80, 90, 100], "ბიზნესმენი": [0, 13, 20, 27, 30, 33, 33, 40, 40, 43, 47, 50, 53, 57, 60, 63, 63, 70, 73, 80, 100], "პოლიტიკოსი": [0, 9, 18, 24, 27, 33, 33, 40, 42, 44, 49, 51, 53, 58, 60, 60, 67, 69, 78, 84, 100], "ექიმი": [0, 0, 10, 13, 23, 27, 37, 40, 40, 40, 50, 50, 53, 53, 63, 67, 77, 80, 80, 90, 100], "ქირურგი": [0, 0, 13, 20, 27, 33, 40, 40, 40, 47, 53, 53, 60, 60, 67, 73, 80, 80, 87, 100, 100], "იურისტი": [0, 0, 10, 20, 23, 33, 37, 40, 47, 50, 50, 53, 60, 63, 67, 77, 77, 80, 90, 90, 100], "მასწავლებელი": [0, 10, 10, 20, 23, 27, 37, 40, 40, 40, 50, 50, 53, 60, 63, 63, 73, 77, 87, 90, 100], "მწერალი": [0, 9, 20, 27, 27, 29, 36, 38, 44, 47, 47, 53, 53, 56, 62, 64, 71, 73, 80, 82, 100], "ჟურნალისტი": [0, 10, 18, 27, 27, 29, 36, 37, 37, 44, 46, 47, 53, 54, 62, 63, 64, 72, 80, 82, 100], "ფსიქოლოგი": [0, 0, 10, 13, 27, 27, 37, 40, 40, 40, 50, 50, 53, 63, 63, 67, 77, 80, 80, 90, 100], "ასტროლოგი": [0, 9, 18, 27, 27, 27, 36, 36, 38, 44, 47, 47, 53, 53, 62, 64, 71, 73, 80, 82, 100], "ფინანსისტი / ბანკირი": [0, 10, 27, 27, 28, 36, 37, 37, 38, 44, 47, 53, 53, 54, 62, 63, 71, 72, 80, 82, 100], "სამხედრო": [0, 18, 18, 27, 27, 36, 36, 38, 44, 47, 47, 53, 53, 56, 62, 71, 73, 80, 82, 91, 100], "მუსიკოსი": [0, 10, 10, 13, 23, 27, 37, 40, 40, 47, 50, 50, 50, 53, 60, 63, 67, 77, 80, 90, 100], "პილოტი / მოგზაური": [0, 0, 0, 13, 20, 27, 33, 40, 40, 40, 40, 47, 53, 53, 60, 67, 67, 80, 80, 87, 100], "ქორწინება": [0, 0, 10, 13, 23, 27, 37, 40, 40, 50, 50, 50, 50, 60, 63, 67, 77, 80, 87, 90, 100], "ემიგრაცია": [0, 10, 10, 13, 27, 33, 37, 40, 40, 47, 50, 50, 50, 53, 63, 67, 73, 77, 80, 90, 100], "მემკვიდრეობა": [0, 0, 10, 20, 23, 27, 37, 40, 40, 40, 50, 50, 53, 53, 63, 63, 67, 77, 80, 90, 100], "დიდება": [0, 0, 10, 20, 27, 27, 37, 40, 40, 47, 50, 50, 53, 60, 63, 67, 77, 77, 87, 90, 100]};
function pctile(name,v){const Q=QUANT[name];if(!Q)return null;let k=0;while(k<20&&Q[k+1]<=v)k++;return Math.min(99,Math.round(k*5+(k<20&&Q[k+1]>Q[k]?5*(v-Q[k])/(Q[k+1]-Q[k]):0)));}
const CSS=`
#form-card .fm-sec{font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;color:rgba(232,201,122,.85);margin:12px 0 6px}
#form-card .fm-row{padding:9px 0;border-bottom:1px solid rgba(201,162,76,.08)}
#form-card .fm-top{display:flex;align-items:center;gap:10px}
#form-card .fm-nm{width:170px;font-size:13px;color:#f3ecdc}
#form-card .fm-bar{flex:1;height:9px;border-radius:5px;background:rgba(255,255,255,.06);overflow:hidden}
#form-card .fm-bar i{display:block;height:100%;border-radius:5px}
#form-card .fm-pc{width:110px;text-align:right;font-size:12px}
#form-card .fm-det{font-size:11.5px;color:rgba(196,176,148,.85);line-height:1.6;margin-top:4px;display:none}
#form-card .fm-row.open .fm-det{display:block}
#form-card .fm-row{cursor:pointer}
#form-card .fm-note{font-size:11px;color:rgba(196,176,148,.75);line-height:1.6;margin-top:10px}
#form-card table{border-collapse:collapse;font-size:11px;margin-top:6px}
#form-card td,#form-card th{border:1px solid rgba(201,162,76,.12);width:28px;height:24px;text-align:center;color:#f3ecdc}
#form-card th{color:rgba(232,201,122,.85);font-weight:400}
#form-card .fm-tabs button{background:none;border:1px solid rgba(201,162,76,.3);color:rgba(232,201,122,.85);border-radius:14px;padding:3px 11px;font-size:11px;cursor:pointer;font-family:inherit;margin-right:5px}
#form-card .fm-tabs button.on{background:rgba(201,162,76,.2);color:#F7E3A8}
@media(max-width:600px){#form-card .fm-nm{width:110px;font-size:12px}#form-card .fm-pc{width:80px}}`;
function card(){let c=$('form-card');if(c)return c;const anchor=$('dominants-card');if(!anchor)return null;
  c=document.createElement('div');c.className='data-card';c.id='form-card';c.style.cssText='display:none;margin-top:14px';
  c.innerHTML='<div class="data-card-title">🧭 ასტროლოგიური ფორმულები · პროფესია და ცხოვრების თემები</div><div id="form-body" style="padding:12px 14px"></div>';
  anchor.parentNode.insertBefore(c,anchor);return c;}
const signOf=l=>Math.floor(n360(l)/30);
const angd=(a,b)=>{const d=Math.abs(n360(a-b));return d>180?360-d:d;};
function houseOf(l,cusps){for(let i=0;i<12;i++){const a=cusps[i],b=cusps[(i+1)%12],w=n360(b-a);if(n360(l-a)<w)return i+1;}return 1;}
function model(d){
  const P={};for(const n of [...PL,'ქირონი']){const v=d.planets&&d.planets[n];if(v&&isFinite(+v.degree))P[n]=n360(+v.degree);}
  const cusps=(d.houses||[]).map(x=>n360(+(x&&x.degree!=null?x.degree:x)));
  if(cusps.length!==12||d._timeUnknown)return null;
  const H={};for(const n in P)H[n]=houseOf(P[n],cusps);
  const rulers=cusps.map(c=>RUL[signOf(c)]);
  return{P,H,cusps,rulers,asc:cusps[0],mc:cusps[9]};
}
function aspect(a,b){for(const [ang,orb,w,sym] of ASP){if(Math.abs(angd(a,b)-ang)<=orb)return{w,sym};}return null;}
/* all links between house A and B */
function links(M,A,B){
  const out=[];const rA=M.rulers[A-1].filter(r=>M.P[r]!=null),rB=M.rulers[B-1].filter(r=>M.P[r]!=null);
  const hn=h=>ROM[h];
  rA.forEach(r=>{if(M.H[r]===B)out.push([3,`${hn(A)} სახლის მმართველი ${g(r)} ${r} დგას ${hn(B)} სახლში`]);});
  rB.forEach(r=>{if(M.H[r]===A)out.push([3,`${hn(B)} სახლის მმართველი ${g(r)} ${r} დგას ${hn(A)} სახლში`]);});
  rA.forEach(a=>rB.forEach(b=>{if(a===b){out.push([2,`${g(a)} ${a} მართავს ორივე სახლს (${hn(A)} და ${hn(B)})`]);return;}
    const x=aspect(M.P[a],M.P[b]);if(x)out.push([x.w+(x.sym==='☌'?1:0),`მმართველები ${g(a)} ${x.sym} ${g(b)} (${hn(A)}–${hn(B)})`]);
    const sa=signOf(M.P[a]),sb=signOf(M.P[b]);if(RUL[sa].includes(b)&&RUL[sb].includes(a))out.push([2,`ურთიერთმიღება ${g(a)} ↔ ${g(b)}`]);}));
  rA.forEach(r=>{const x=aspect(M.P[r],M.cusps[B-1]);if(x&&Math.abs(angd(M.P[r],M.cusps[B-1])-[0,180,120,90,60][ASP.findIndex(q=>q[3]===x.sym)])<=3)out.push([1,`${hn(A)} სახლის მმართველი ${g(r)} ${x.sym} ${hn(B)} სახლის წვერო`]);});
  rB.forEach(r=>{const x=aspect(M.P[r],M.cusps[A-1]);if(x&&Math.abs(angd(M.P[r],M.cusps[A-1])-[0,180,120,90,60][ASP.findIndex(q=>q[3]===x.sym)])<=3)out.push([1,`${hn(B)} სახლის მმართველი ${g(r)} ${x.sym} ${hn(A)} სახლის წვერო`]);});
  for(const n in M.H){if(M.H[n]===A&&M.rulers[B-1].includes(n))out.push([1,`${g(n)} ${n} ${hn(A)} სახლში მართავს ${hn(B)} სახლს`]);
    if(M.H[n]===B&&M.rulers[A-1].includes(n))out.push([1,`${g(n)} ${n} ${hn(B)} სახლში მართავს ${hn(A)} სახლს`]);}
  return out;
}
function strongPlanet(M,n){
  if(M.P[n]==null)return null;const r=[];
  if([1,10].includes(M.H[n]))r.push(`${ROM[M.H[n]]} სახლში`);
  if(DOM[n]&&DOM[n].includes(signOf(M.P[n])))r.push('საკუთარ ნიშანში');
  if(EXA[n]!=null&&EXA[n]===signOf(M.P[n]))r.push('ამაღლებაში');
  if(angd(M.P[n],M.asc)<=6)r.push('ASC-თან');if(angd(M.P[n],M.mc)<=6)r.push('MC-თან');
  if(n!=='მზე'&&M.P['მზე']!=null&&angd(M.P[n],M.P['მზე'])<=6)r.push('მზესთან');
  return r.length?r:null;
}
function evalFormula(M,f){
  let pairScore=0;const det=[];
  f[2].forEach(([a,b])=>{const L=links(M,a,b);const s=Math.min(3,L.reduce((x,y)=>x+y[0],0));pairScore+=s/3;
    det.push(`<b>${ROM[a]}–${ROM[b]}</b>: ${L.length?L.map(x=>x[1]).join('; '):'<span style="opacity:.6">კავშირი არ არის</span>'}`);});
  const pr=pairScore/f[2].length;
  const pl=f[3].map(n=>[n,strongPlanet(M,n)]);const plS=pl.filter(x=>x[1]).length/pl.length;
  pl.forEach(([n,r])=>det.push(`${g(n)} ${n}: ${r?'<span style="color:#9fd8a8">ძლიერი — '+r.join(', ')+'</span>':'<span style="opacity:.6">განსაკუთრებით ძლიერი არ არის</span>'}`));
  const pct=Math.round((pr*0.8+plS*0.2)*100);
  return{pct,det,pairsOn:f[2].filter(([a,b])=>links(M,a,b).length).length};
}
let VIEW='list',LAST=null;
function render(d){
  const c=card();if(!c)return;LAST=d;
  const M=d?model(d):null;
  if(!M){c.style.display=d&&d.planets?'block':'none';$('form-body').innerHTML='<div class="fm-note">ფორმულებს სჭირდება სახლები — დაბადების დრო უცნობია.</div>';return;}
  const R=FORMULAS.map(f=>[f,evalFormula(M,f)]);
  let h=`<div class="fm-tabs" style="margin-bottom:8px"><button data-v="list" class="${VIEW==='list'?'on':''}">ფორმულები</button><button data-v="grid" class="${VIEW==='grid'?'on':''}">სახლების კავშირები 12×12</button></div>`;
  if(VIEW==='list'){
    for(const grp of ['პროფესია','ცხოვრების თემა']){
      const rows=R.filter(x=>x[0][1]===grp).map(x=>{x[1].pr=pctile(x[0][0],x[1].pct);return x;}).sort((a,b)=>b[1].pr-a[1].pr||b[1].pct-a[1].pct);
      h+=`<div class="fm-sec">${grp==='პროფესია'?'პროფესიები':'ცხოვრების თემები'}</div>`+rows.map(([f,e])=>{const pr=e.pr;const col=pr>=85?'#7fcf8f':pr>=60?'#e8c95a':'rgba(232,226,213,.35)';
        const lab=pr>=85?'აქვს':pr>=60?'ნაწილობრივ':'სუსტად';
        return `<div class="fm-row"><div class="fm-top"><span class="fm-nm">${f[0]}</span><div class="fm-bar"><i style="width:${pr}%;background:${col}"></i></div><span class="fm-pc" style="color:${col}">${lab} · ${pr}%</span></div>
          <div class="fm-det">${f[4]}<br>ქულა ${e.pct} — ძლიერია ადამიანების ${pr}%-ზე მეტად.<br>${e.det.join('<br>')}</div></div>`;}).join('');}
    h+=`<div class="fm-note">დააჭირე სტრიქონს დეტალებისთვის. % — პერცენტილი: რამდენ ადამიანზე ძლიერია ფორმულა შენს რუკაში (შედარება 600 შემთხვევით რუკასთან). <b>აქვს</b> — ზედა 15%, <b>ნაწილობრივ</b> — ზედა 40%. ქულა = სახლების კავშირები (80%) + მთავარი პლანეტების ძალა (20%). კავშირის წესები: მმართველი მეორე სახლში (3), მმართველების ასპექტი (2–3), ურთიერთმიღება (2), მმართველი წვეროსთან ±3° (1), სახლში მდგომი პლანეტა მართავს მეორეს (1). მმართველები MAGNUS-ის სისტემით: ♇ — ვერძი (+♂), ♂ — მორიელი, ♅ — მერწყული (+♄), ♆ — თევზები (+♃).</div>`;
  }else{
    let t='<div style="overflow-x:auto"><table><tr><th></th>'+[...Array(12)].map((_,i)=>`<th>${ROM[i+1]}</th>`).join('')+'</tr>';
    for(let a=1;a<=12;a++){t+=`<tr><th>${ROM[a]}</th>`;for(let b=1;b<=12;b++){if(a===b){t+='<td style="background:rgba(255,255,255,.04)"></td>';continue;}
      const L=links(M,a,b),s=L.reduce((x,y)=>x+y[0],0);t+=`<td title="${L.map(x=>x[1].replace(/<[^>]+>/g,'')).join('\n')}" style="background:rgba(201,162,76,${Math.min(.75,s*0.12)})">${s||''}</td>`;}t+='</tr>';}
    h+=t+'</table></div><div class="fm-note">უჯრაში — კავშირის ჯამური წონა (მიიტანე მაუსი დეტალებისთვის). რაც მუქია, მით ძლიერად არის ორი სახლის თემა ცხოვრებაში შერწყმული.</div>';
  }
  $('form-body').innerHTML=h;c.style.display='block';
  c.querySelectorAll('.fm-row').forEach(r=>r.onclick=()=>r.classList.toggle('open'));
  c.querySelectorAll('.fm-tabs button').forEach(b=>b.onclick=()=>{VIEW=b.dataset.v;render(LAST);});
}
function hook(){
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  if(typeof window.showSingleChart==='function'&&!window.showSingleChart._fm){const o=window.showSingleChart;
    const w=function(d){const r=o.apply(this,arguments);try{render(d);}catch(e){console.warn('formulas',e);}return r;};for(const k in o)w[k]=o[k];w._fm=true;window.showSingleChart=w;}
  if(typeof window.showDoubleChart==='function'&&!window.showDoubleChart._fm){const o=window.showDoubleChart;
    const w=function(){const r=o.apply(this,arguments);const c=$('form-card');if(c)c.style.display='none';return r;};for(const k in o)w[k]=o[k];w._fm=true;window.showDoubleChart=w;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else setTimeout(hook,0);
window._formulas={FORMULAS,model,links,evalFormula};
})();
