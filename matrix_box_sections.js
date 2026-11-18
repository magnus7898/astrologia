/* MAGNUS — matrix boxes as the author reads them.
   Every coloured combo box = combo explanation + each of its three energies explained for its own point.
   Order: karmic tail → material karma → love line → money line → sexuality + comfort zone → calling card →
   talent zone → ancestral karmas → ancestral gifts → chakras (combo + energy / emotion / physics) → purposes.
   Single-position boxes are folded into their combos; clicking a circle opens the combo that holds it. */
(function(){
const UP=n=>(window.MX_UP&&window.MX_UP[n])||{};
const CHE=n=>(window.MX_CHE&&window.MX_CHE[n])||null;
const EN=n=>{try{return (typeof ENERGIES!=='undefined'&&ENERGIES[String(n)])||{};}catch(e){return {};}};
const ORIG=n=>(window.MX_ORIG&&window.MX_ORIG[n-1])||'';
const t=(o,k)=>o&&o[k]?(typeof o[k]==='string'?o[k]:o[k].t):'';
const part=(o,k,f)=>o&&o[k]&&typeof o[k]==='object'?o[k][f]||'':'';
const SVA=5;   /* svadhistana row in MX_CHE */
/* every point of a coloured combo: [key, what this point is, text for energy n] */
const ROLES={
 karmic_tail:[
   ['B3','მთავარი კარმული გაკვეთილი',n=>t(UP(n),'b3')],
   ['B2','წარსულის შეცდომები',n=>part(UP(n),'b3','m')||part(UP(n),'l2','m')],
   ['B1','სვადჰისტანას ენერგია',n=>{const c=CHE(n);return c?c[SVA][0]:'';}]],
 material_karma:[
   ['R3','მთავარი მატერიალური გაკვეთილი',n=>t(UP(n),'r3')],
   ['R2','წარსულის შეცდომები ფულში',n=>part(UP(n),'r3','m')],
   ['R1','რა თვისებები გვჭირდება სამუშაოში',n=>t(UP(n),'r1')]],
 love:[
   ['B1','როგორ შევდივართ ურთიერთობებში',n=>t(UP(n),'b1')],
   ['W1','როგორი პარტნიორი შეგვეფერება',n=>t(UP(n),'heart')],
   ['W2','სიყვარულისა და ფულის კვეთა',n=>EN(n).desc||'']],
 money:[
   ['R1','რა თვისებები გვჭირდება სამუშაოში',n=>t(UP(n),'r1')],
   ['W3','როგორი სამსახური შეგვეფერება',n=>t(UP(n),'gel')],
   ['S6','სვადჰისტანას ემოცია — ფული როგორც სიამოვნება',n=>{const c=CHE(n);return c?c[SVA][2]:'';}]],
 sex:[
   ['Cv','კომფორტის ზონა',n=>t(UP(n),'comfort')],
   ['RC1','სექსუალური ენერგია',n=>{const c=CHE(n);return c?c[SVA][0]:'';}],
   ['RC2','როგორ ვლინდება მიმზიდველობა',n=>{const c=CHE(n);return c?c[SVA][2]:'';}]],
 persona:[
   ['L3','დაბადების დღე — შთაგონება ფიზიკურ სამყაროში, ნამდვილი მე',n=>t(UP(n),'l3')],
   ['L2','ბავშვობის ტრამვა და ფიზიკური ხედვა',n=>t(UP(n),'l2')],
   ['L1','მშობლები და ფიზიკური კომუნიკაცია',n=>t(UP(n),'l1')]],
 talent_zone:[
   ['T3','თვის ენერგია — მთავარი ნიჭი, რითაც დეპრესიას ვერიდებით',n=>t(UP(n),'t3')],
   ['T2','ენერგეტიკული ხედვა — „კედლებს მიღმა ხედვა“',n=>t(UP(n),'t2')],
   ['T1','ნიჭები და ენერგეტიკული კომუნიკაცია',n=>t(UP(n),'t1')]],
 br:[['BR3','მამის ხაზის კარმა',n=>EN(n).desc||''],['BR2','როგორ გადმოდის ჩვენამდე',n=>part(UP(n),'b3','m')],['BR1','რა უნდა გამოვასწოროთ',n=>part(UP(n),'b3','a')]],
 bl:[['BL3','დედის ხაზის კარმა',n=>EN(n).desc||''],['BL2','როგორ გადმოდის ჩვენამდე',n=>part(UP(n),'b3','m')],['BL1','რა უნდა გამოვასწოროთ',n=>part(UP(n),'b3','a')]],
 tl:[['TL3','მამის ხაზის საჩუქარი',n=>EN(n).desc||''],['TL2','როგორ ვლინდება ჩვენში',n=>part(UP(n),'t3','p')],['TL1','როგორ გამოვიყენოთ',n=>part(UP(n),'t1','a')]],
 tr:[['TR3','დედის ხაზის საჩუქარი',n=>EN(n).desc||''],['TR2','როგორ ვლინდება ჩვენში',n=>part(UP(n),'t3','p')],['TR1','როგორ გამოვიყენოთ',n=>part(UP(n),'t1','a')]]
};
const ORDER=['karmic_tail','material_karma','love','money','sex','comfort','wish','persona','talent_zone','br','bl','tl','tr',
  'ch_sahasrara','ch_ajna','ch_vishudha','ch_lelia','ch_lada','ch_anahata','ch_manipura','ch_svadhistana','ch_muladhara','ch_total'];
/* single boxes → the combo that holds them */
const HOME={b3:'karmic_tail',r3:'material_karma',r1:'material_karma',b1:'love',heart:'love',gel:'money',comfort:'sex',
  l3:'persona',l2:'persona',l1:'persona',t3:'talent_zone',t2:'talent_zone',t1:'talent_zone',g1:'wish',g2:'wish',
  emo_crown:'ch_sahasrara',emo_thirdeye:'ch_ajna',emo_throat:'ch_vishudha',emo_heart:'ch_anahata',emo_solar:'ch_manipura',emo_sacral:'ch_svadhistana',emo_root:'ch_muladhara'};
const KEY={g1:'G1',g2:'G2',b3:'B3',r3:'R3',r1:'R1',b1:'B1',heart:'W1',gel:'W3',comfort:'Cv',l3:'L3',l2:'L2',l1:'L1',t3:'T3',t2:'T2',t1:'T1'};

const css=`#matrix-boxes .mx-box{background:#16302b!important;border:1px solid rgba(184,137,74,.55)!important;margin-top:6px}
#matrix-boxes .mx-box-head{background:#1b3933;color:#f1f2f5;font-size:14px}
#matrix-boxes .mx-box-head:hover{background:#214640}
#matrix-boxes .mx-box-body{background:#16302b;color:#e9eaee;font-size:14.5px;line-height:1.75;font-weight:400;border-top:1px solid rgba(184,137,74,.55)}
.mxen{margin-top:14px;border-top:1px solid rgba(184,137,74,.35)}
.mxen-r{padding:12px 0;border-bottom:1px solid rgba(184,137,74,.2)}.mxen-r:last-child{border-bottom:none}
.mxen-h{font-weight:600;color:#f6f0e2;margin-bottom:4px}
.mxen-n{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;margin-right:8px;border-radius:50%;background:rgba(20,14,50,0.92);border:2px solid rgba(180,160,255,0.75);color:#fff;font-weight:700;font-size:14px;font-family:'Cinzel',serif;vertical-align:middle}
.mxen-l{font-weight:400;color:#b9bcc6}.mxen-t{color:#e9eaee}
.mx-grp-body{padding:8px 10px 12px!important}.mx-grp-body .mx-box{margin-top:6px;background:#1c3b35!important}.mx-grp-body .mx-box-head{background:#21443d}
.mxen-more{margin-top:6px}.mxen-more summary{cursor:pointer;color:#c9a96a;font-size:13px}.mxen-more p{margin:4px 0;color:#d9dbe2}`;
const $=id=>document.getElementById(id);
/* circle colours exactly as the matrix diagram draws them (draw() in matrix.html) */
const DK=['rgba(20,14,50,0.92)','rgba(180,160,255,0.75)','#fff'];
let METHOD=1;
function posCol(k){const m3=METHOD===3;
  const P={L3:['#7F77DD','#534AB7'],T3:['#7F77DD','#534AB7'],L2:['#2060a8','#0a3878'],T2:['#2060a8','#0a3878'],L1:['#4a8cc8','#1a5090'],T1:['#4a8cc8','#1a5090'],
    Cv:['#FFD700','#BA7517','#2a1d00'],G1:['#639922','#3B6D11'],G2:['#639922','#3B6D11'],
    B1:m3?['#F2C230','#B08A10','#2a1d00']:['#EF9F27','#BA7517'],R1:m3?['#F2C230','#B08A10','#2a1d00']:['#EF9F27','#BA7517'],
    B2:m3?['#EF9F27','#BA7517']:null,R2:m3?['#EF9F27','#BA7517']:null,B3:['#E24B4A','#A32D2D'],R3:['#E24B4A','#A32D2D'],
    TL3:m3?['#1F6E5C','#0F4437']:null,BR3:m3?['#1F6E5C','#0F4437']:null,TR3:m3?['#3A6EA5','#22466B']:null,BL3:m3?['#3A6EA5','#22466B']:null};
  if(k==='EP')return ['#18223A','rgba(184,137,74,.22)','#EDE6D8'];if(k==='EPG')return ['#18223A','#B8894A','#E3BE84'];
  const c=P[k];return c?[c[0],c[1],c[2]||'#fff']:DK;}
function paint(el,k){const [f,st,fg]=posCol(k);el.style.background=f;el.style.border='2px solid '+st;el.style.color=fg;}
function energyRow(key,label,n,txt){
  const e=EN(n),o=ORIG(n);
  return `<div class="mxen-r" data-k="${key}"><div class="mxen-h"><span class="mxen-n" data-pk="${key}">${n}</span>${e.name||''} <span class="mxen-l">· ${label}</span></div>
    <div class="mxen-t">${txt||e.desc||''}</div>${o?`<details class="mxen-more"><summary>ენერგიის არსი</summary><p>${o}</p></details>`:''}</div>`;
}
function organize(v,method){
  if(method===4)return;
  const panel=$('matrix-boxes');if(!panel)return;
  if(!$('mxbox-css')){const st=document.createElement('style');st.id='mxbox-css';st.textContent=css;document.head.appendChild(st);}
  for(const id in ROLES){const bod=document.querySelector('#mxbox-'+id+' .mx-box-body');if(!bod||bod.querySelector('.mxen'))continue;
    const rows=ROLES[id].map(([k,lab,fn])=>{const n=v[k];return n?energyRow(k,lab,n,fn(n)):'';}).join('');
    if(rows){const d=document.createElement('div');d.className='mxen';d.innerHTML=rows;bod.appendChild(d);}}
  METHOD=method;
  /* our wishes — the green circles: physical (G1) and energetic (G2) */
  if(method!==3&&v.G1&&v.G2&&!$('mxbox-wish')){const R=typeof r22==='function'?r22:(n=>n),S=R(v.G1+v.G2),c=CHE(S);
    const w=document.createElement('div');w.className='mx-box';w.id='mxbox-wish';
    const h=document.createElement('div');h.className='mx-box-head';
    h.innerHTML='<span><span class="mx-dot" style="background:#639922"></span>ჩვენი სურვილები — მწვანე წრეები</span><span class="mx-key">'+v.G1+'-'+v.G2+'-'+S+'<span class="mx-arrow">▼</span></span>';
    const b=document.createElement('div');b.className='mx-box-body';b.style.display='none';
    b.innerHTML='<p style="margin:0 0 6px">მწვანე წრეები გვიჩვენებს, რა გვინდა. მარცხენა მწვანე წრე ფიზიკური სურვილებია: სხეული, კომფორტი, მატერია, ის, რისი შეხებაც შეიძლება. ზედა მწვანე წრე ენერგეტიკული სურვილებია: რა გვინდა ადამიანებისგან და სამყაროსგან, რა გვკვებავს შიგნიდან. მათი ჯამი გულის (ანაჰატას) ემოციაა: როგორ განიცდის გული ამ სურვილებს.</p>'+
      '<div class="mxen">'+energyRow('G1','ფიზიკური სურვილები',v.G1,t(UP(v.G1),'g1'))+energyRow('G2','ენერგეტიკული სურვილები',v.G2,t(UP(v.G2),'g2'))+energyRow('','სურვილების ჯამი — გულის ემოცია',S,c?c[3][2]:'')+'</div>';
    h.onclick=()=>{b.style.display=b.style.display==='block'?'none':'block';};w.appendChild(h);w.appendChild(b);panel.appendChild(w);}
  panel.querySelectorAll('.mxen-n[data-pk]').forEach(b=>paint(b,b.dataset.pk));
  /* chakra rows: energy / emotion / physics take the colours of the circles they come from */
  const CKEY=method===3?{sahasrara:['T3','L3'],ajna:['T2','L2'],vishudha:['T1','L1'],lelia:['TR3','BL3'],lada:['TL3','BR3'],anahata:['Cv','Cv'],manipura:['B1','R1'],svadhistana:['B2','R2'],muladhara:['B3','R3']}
    :{sahasrara:['T3','L3'],ajna:['T2','L2'],vishudha:['T1','L1'],anahata:['G2','G1'],manipura:['Cv','Cv'],svadhistana:['B1','R1'],muladhara:['B3','R3']};
  for(const ck in CKEY){const r=document.querySelectorAll('#mxbox-ch_'+ck+' .mxen-r .mxen-n');if(r.length===3){paint(r[0],CKEY[ck][0]);paint(r[1],'');paint(r[2],CKEY[ck][1]);}}
  const hasSex=!!$('mxbox-sex');   /* method 1 only — otherwise comfort stays a box of its own */
  [...panel.querySelectorAll('.mx-box')].forEach(b=>{const id=b.id.replace('mxbox-','');
    b.style.display=(HOME[id]&&!(id==='comfort'&&!hasSex))?'none':'';});
  ORDER.forEach(id=>{const el=$('mxbox-'+id);if(el)panel.appendChild(el);});
  [...panel.querySelectorAll('.mx-box')].forEach(b=>{const id=b.id.replace('mxbox-','');if(!ORDER.includes(id)&&!HOME[id])panel.appendChild(b);});
  group(panel,'grp_anc','წინაპრები — კარმა და საჩუქრები','#b07acc',['br','bl','tl','tr']);
  group(panel,'grp_ch','ჩაკრები','#5cb85c',['ch_sahasrara','ch_ajna','ch_vishudha','ch_lelia','ch_lada','ch_anahata','ch_manipura','ch_svadhistana','ch_muladhara','ch_total']);
}
/* several boxes inside one box */
function group(panel,gid,title,color,ids){
  const els=ids.map(id=>$('mxbox-'+id)).filter(Boolean);if(!els.length)return;
  const w=document.createElement('div');w.className='mx-box mx-grp';w.id='mxbox-'+gid;
  const h=document.createElement('div');h.className='mx-box-head';
  h.innerHTML='<span><span class="mx-dot" style="background:'+color+'"></span>'+title+'</span><span class="mx-key">'+els.length+'<span class="mx-arrow">▼</span></span>';
  const b=document.createElement('div');b.className='mx-box-body mx-grp-body';b.style.display='none';
  h.onclick=()=>{b.style.display=b.style.display==='block'?'none':'block';};
  panel.insertBefore(w,els[0]);els.forEach(e=>b.appendChild(e));w.appendChild(h);w.appendChild(b);
}
/* sky / earth / man / woman / spiritual knowledge — at the end */
const PUR=[
 ['ep-soul-top','ცა','ცის ხაზი (ზედა + ქვედა წერტილი) პირადი დანიშნულების სულიერი ნაწილია: რას ითხოვს სული.'],
 ['ep-soul-bot','მიწა','მიწის ხაზი (მარცხენა + მარჯვენა წერტილი) პირადი დანიშნულების მატერიალური ნაწილია: ყოფა, ფული, ოჯახი.'],
 ['ep-soul-mid','პირადი დანიშნულება','ცისა და მიწის ჯამი. დაახლოებით 40 წლამდე მთავარი ამოცანაა „გახდე საკუთარი თავი“.'],
 ['ep-male-sum','მამაკაცის ხაზი','რას ელიან ჩვენგან მამის გვარის წინაპრები.'],
 ['ep-fem-sum','ქალის ხაზი','რას ელიან ჩვენგან დედის გვარის წინაპრები.'],
 ['ep-soc-mid','სოციალური დანიშნულება','კაცისა და ქალის ხაზის ჯამი: დაახლოებით 40–60 წლის ამოცანა, რა მივცეთ სამყაროს.'],
 ['ep-misia','სულიერი ცოდნა','პირადი და სოციალური დანიშნულების ჯამი: მთავარი გზა მთელი ცხოვრებისთვის.']];
function purposes(){
  const panel=$('matrix-boxes');if(!panel||!$('mxbox-css'))return;
  panel.querySelectorAll('.mx-pur').forEach(e=>e.remove());const og=$('mxbox-grp_pur');if(og)og.remove();
  PUR.forEach(([eid,title,lead])=>{const n=parseInt(($(eid)||{}).textContent);if(!n)return;
    const w=document.createElement('div');w.className='mx-box mx-pur';w.id='mxbox-pur_'+eid;
    const h=document.createElement('div');h.className='mx-box-head';
    h.innerHTML='<span><span class="mx-dot" style="background:#c9a96a"></span>'+title+'</span><span class="mx-key">'+n+'<span class="mx-arrow">▼</span></span>';
    const b=document.createElement('div');b.className='mx-box-body';b.style.display='none';
    b.innerHTML='<p style="margin:0 0 6px">'+lead+'</p><div class="mxen">'+energyRow(/mid|misia/.test(eid)?'EPG':'EP',title,n,EN(n).desc)+'</div>';b.querySelectorAll('.mxen-n[data-pk]').forEach(x=>paint(x,x.dataset.pk));
    h.onclick=()=>{b.style.display=b.style.display==='block'?'none':'block';};w.appendChild(h);w.appendChild(b);panel.appendChild(w);});
  group(panel,'grp_pur','დანიშნულებები — ცა, მიწა, კაცი, ქალი, სულიერი ცოდნა','#c9a96a',PUR.map(p=>'pur_'+p[0]));
}
function wrap(name,after){const o=window[name];if(typeof o!=='function'||o['_o_'+name])return;
  const f=function(){const r=o.apply(this,arguments);try{after.apply(this,arguments);}catch(e){console.warn(name,e);}return r;};f['_o_'+name]=true;window[name]=f;}
wrap('buildMatrixBoxes',function(v,method){v=Object.assign({},v||{});
  try{const R=typeof r22==='function'?r22:(n=>n),rows=window.chakraRows?window.chakraRows(v,method,R):[];const sv=rows.find(r=>r[0]==='svadhistana');if(sv&&!v.S6)v.S6=R(sv[1]+sv[2]);}catch(e){}
  organize(v,method);});
wrap('renderChakra',function(){purposes();});
/* clicking a folded single opens its combo and highlights its row */
const ob=window.openBoxById;
if(typeof ob==='function')window.openBoxById=function(id){
  const el=$('mxbox-'+id);
  if(HOME[id]&&el&&el.style.display==='none'){const host=HOME[id];const hg=$('mxbox-'+host);const g=hg&&hg.closest('.mx-grp');if(g){const gb=g.querySelector(':scope>.mx-box-body');if(gb)gb.style.display='block';}const r=ob.call(this,host);
    const row=KEY[id]&&document.querySelector('#mxbox-'+host+' .mxen-r[data-k="'+KEY[id]+'"]');
    if(row){row.style.transition='background .6s';row.style.background='rgba(255,217,138,.15)';setTimeout(()=>row.style.background='',1600);}
    return r;}
  const g=el&&el.closest('.mx-grp');if(g){const gb=g.querySelector(':scope>.mx-box-body');if(gb)gb.style.display='block';}
  return ob.apply(this,arguments);};
})();
