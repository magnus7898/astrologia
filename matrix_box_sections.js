/* MAGNUS — matrix boxes in the author's reading order, with section explanations.
   Order: karmic tail & mission → personal relationships → central energy → material karma → money line → sexuality →
   desires (green) → parents/talents/communication (light blue) → childhood/vision (blue) → birthday & month →
   calling-card & talent-zone combos → ancestral karmas & gifts → chakra system → sky/earth/man/woman/spiritual → year energies */
(function(){
/* position titles as the author reads them */
const RETITLE={
  l1:'მშობლები, ტრამვები და ფიზიკური კომუნიკაცია',
  t1:'ნიჭები და ენერგეტიკული კომუნიკაცია',
  l2:'ბავშვობის ტრამვა და ფიზიკური ხედვა',
  t2:'ენერგეტიკული ხედვა — „კედლებს მიღმა ხედვის“ ნიჭი',
  l3:'დაბადების დღე — შთაგონება ფიზიკურ სამყაროში, ნამდვილი მე',
  t3:'თვის ენერგია — მთავარი ნიჭი, რითაც დეპრესიას ვერიდებით'};
try{if(typeof BOXES!=='undefined')BOXES.forEach(b=>{if(RETITLE[b.id])b.title=RETITLE[b.id];});}catch(e){}

const SEC=[
 {id:'karma',t:'კარმული კუდი და მისია',c:'#8e44ad',
  d:'აქედან ვიწყებთ. კარმული კუდი გვიჩვენებს, რა მოიტანა სულმა წარსულიდან: დაუსრულებელ ამოცანებს და განმეორებად სცენარებს. ქვედა რიცხვი წარსულის თემაა, შუა არის ის, როგორ ვლინდება ახლა, ზედა კი (ცენტრთან ყველაზე ახლოს) მისიაა, ამ ცხოვრების მთავარი გაკვეთილი. კარმული კუდის დამუშავებაში მთავარი დამხმარე ცენტრალური ენერგიაა.',
  ids:['karmic_tail','b3']},
 {id:'love',t:'პირადი ურთიერთობების ხაზი',c:'#e05b8b',
  d:'როგორ შევდივართ ურთიერთობაში, როგორი პარტნიორი გვიხდება და რა თემას ატარებს სიყვარულის ხაზი. ხაზი ერთად იკითხება, მერე თითოეული წერტილი ცალ-ცალკე.',
  ids:['love','heart','b1']},
 {id:'center',t:'ცენტრალური ენერგია',c:'#ffd700',
  d:'ცენტრი მატრიცის ღერძია: ის, რაც ადამიანს ბუნებრივად ეხერხება და სადაც ძალას იღებს. სწორედ ცენტრალური ენერგია არის მთავარი დამხმარე კარმულ კუდთან სამუშაოდ: როცა ცენტრს პლიუსში ატარებ, კუდის გაკვეთილი უფრო ადვილად გადის.',
  ids:['comfort']},
 {id:'mkarma',t:'მატერიალური კარმა',c:'#d35400',
  d:'ფულთან და მატერიასთან დაკავშირებული კარმა: რა არ გამოვიდა წარსულში ფინანსებში და რა გაკვეთილი ელის ამ ცხოვრებაში. ჯერ კომბინაცია იკითხება, მერე მთავარი მატერიალური გაკვეთილი.',
  ids:['material_karma','r3']},
 {id:'money',t:'ფულის ხაზი',c:'#7ec850',
  d:'როგორ მოდის ფული: რა სამსახური გვიხდება, რა თვისებები გვჭირდება სამუშაოში და რას გვეუბნება ფულის ხაზი მთლიანად.',
  ids:['money','gel','r1']},
 {id:'sex',t:'სექსუალურობა',c:'#d4a017',
  d:'სექსუალური ენერგია და მიმზიდველობა: როგორ ვლინდება და როგორ იხარჯება.',
  ids:['sex']},
 {id:'desire',t:'სურვილები — მწვანე წრეები',c:'#639922',
  d:'მწვანე წრეები გვიჩვენებს, რა გვინდა: ფიზიკური სურვილები (სხეული, კომფორტი, მატერია) და სოციალური სურვილები (რა გვინდა საზოგადოებაში).',
  ids:['g1','g2']},
 {id:'lblue',t:'მშობლები, ნიჭები, კომუნიკაცია — ღია ცისფერი წრეები',c:'#7fc6e8',
  d:'მარცხენა ღია ცისფერი ენერგია მშობლებთან ურთიერთობას და მშობლებისგან მიღებულ ტრამვებს აჩვენებს, ასევე ჩვენს ფიზიკურ კომუნიკაციას: როგორ ვურთიერთობთ საქმით და სხეულით. ზედა ღია ცისფერი ჩვენი ნიჭებია და ენერგეტიკული კომუნიკაცია: როგორ ვურთიერთობთ ენერგიით, შეგრძნებით, სიტყვის მიღმა.',
  ids:['l1','t1']},
 {id:'blue',t:'ბავშვობა და ხედვა — ლურჯი წრეები',c:'#2060a8',
  d:'მარცხენა ლურჯი ენერგია ბავშვობის ტრამვაა და სამყაროს ფიზიკური ხედვა: როგორ აღვიქვამთ რეალობას. ზედა ლურჯი ენერგეტიკული ხედვაა, ნიჭი, რომ „კედლებს მიღმა“ დაინახო: ინტუიცია და ფარულის შეგრძნება.',
  ids:['l2','t2']},
 {id:'birth',t:'დაბადების დღე და თვე',c:'#a78bfa',
  d:'დაბადების დღის ენერგია შთაგონებაა ფიზიკურ სამყაროში, ჩვენი ნამდვილი მე. თვის ენერგია მთავარი ნიჭია: ის, რასაც ვაკეთებთ, რომ დეპრესიას ავარიდოთ თავი. როცა ამ ნიჭს არ ვიყენებთ, ჩნდება სევდა და აპათია.',
  ids:['l3','t3']},
 {id:'zones',t:'სავიზიტო ბარათი და ტალანტების ზონა',c:'#2471a3',
  d:'აქ წერტილები უკვე კომბინაციად იკითხება: მარცხენა ხაზი პირადი სავიზიტო ბარათია (როგორ გვხედავენ), ზედა ხაზი კი ტალანტების ზონა (რისთვის მოვედით).',
  ids:['persona','talent_zone']},
 {id:'anc',t:'წინაპრების კარმა და საჩუქრები',c:'#b07acc',
  d:'მამის და დედის ხაზიდან მიღებული: ქვედა კუთხეები გვარის კარმაა (რა უნდა გამოასწორო), ზედა კუთხეები გვარის საჩუქრებია (რა ნიჭი გადმოგეცა). ჯერ კარმა, მერე საჩუქრები.',
  ids:['br','bl','tl','tr']},
 {id:'health',t:'ჩაკრების სისტემა — ჯანმრთელობის რუკა',c:'#5cb85c',fig:true,
  d:'შვიდი ჩაკრა, გვირგვინიდან ფუძემდე. თითოეულს სამი რიცხვი აქვს: <b style="color:#b9a8ff">ენერგია</b> (რა ძალა მოდის), <b style="color:#8fd36a">ფიზიკა</b> (როგორ ვლინდება სხეულში) და <b style="color:#f2a65a">ემოცია</b> (მათი ჯამი, როგორ განიცდი). დააჭირე ჩაკრას ფიგურაზე და გაიხსნება მისი ბოქსი.',
  sub:[{t:'ჩაკრების კომბინაციები',d:'რას მართავს ჩაკრა, ჰარმონია და დისბალანსი, როგორ დააბალანსო და რას ნიშნავს შენი სამი რიცხვი. „სულ“ რიგი ზოგადი ენერგიაა.',
        ids:['ch_sahasrara','ch_ajna','ch_vishudha','ch_anahata','ch_manipura','ch_svadhistana','ch_muladhara','ch_lelia','ch_lada','ch_total']},
       {t:'ჩაკრების ემოციები',d:'ემოცია ენერგიისა და ფიზიკის ჯამია. როცა ემოცია მინუსშია, ეს პირველი სიგნალია, რომ ჩაკრას ყურადღება სჭირდება.',
        ids:['emo_crown','emo_thirdeye','emo_throat','emo_heart','emo_solar','emo_sacral','emo_root']}]}
];
const ORD=['karmic_tail','b3','love','heart','b1','comfort','material_karma','r3','money','gel','r1','sex','g1','g2','l1','t1','l2','t2','l3','t3','persona','talent_zone','br','bl','tl','tr'];

const css=`.mxsec{margin:14px 0 0;border:1px solid var(--rule,rgba(227,190,132,.25));background:rgba(10,8,30,.25)}
.mxsec>.mxsec-h{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 16px;cursor:pointer;border-left:6px solid var(--c);font-family:'Noto Sans Georgian',sans-serif;font-weight:600;font-size:18px;line-height:1.35;color:#F3E6C8;background:rgba(227,190,132,.07)}
.mxsec>.mxsec-h .no{display:inline-block;min-width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:var(--c);color:#110b24;font-size:12px;margin-right:8px;font-family:sans-serif;font-weight:700}
.mxsec>.mxsec-h small{font-family:inherit;font-weight:400;font-size:13px;color:#c9c2d8;white-space:nowrap}
.mxsec .mxsec-d{padding:12px 20px 16px;color:#EDE6D8;line-height:1.75;font-size:16px;font-family:'Noto Sans Georgian',sans-serif}
.mxsec .mxsub-h{padding:14px 20px 4px;font-weight:600;font-size:17px;color:#F0CF94;font-family:'Noto Sans Georgian',sans-serif;border-top:1px dashed rgba(227,190,132,.25)}
.mxsec .mxsub-d{padding:2px 20px 14px;color:#EDE6D8;line-height:1.7;font-size:15.5px;font-family:'Noto Sans Georgian',sans-serif}
.mxsec.closed .mxsec-b{display:none}.mxsec .mxsec-h .ar{display:inline-block;transition:transform .2s}.mxsec.closed .mxsec-h .ar{transform:rotate(-90deg)}
.mxfig{display:flex;justify-content:center;padding:4px 10px 14px}.mxfig svg{width:100%;max-width:460px;height:auto}
.mxfig .cg{cursor:pointer}.mxfig .cg:hover .core{stroke:#fff;stroke-width:2}
.mxfig .halo{animation:mxp 3s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes mxp{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:.65;transform:scale(1.3)}}
.mxfig .lot{transform-box:fill-box;transform-origin:center;animation:mxr 40s linear infinite}@keyframes mxr{to{transform:rotate(360deg)}}
.mxfig .flow{stroke-dasharray:5 7;animation:mxf 2.2s linear infinite}@keyframes mxf{to{stroke-dashoffset:-24}}
.mxyr{width:100%;border-collapse:collapse;font-size:16px;font-family:'Noto Sans Georgian',sans-serif;color:#EDE6D8}.mxyr td{padding:10px 14px;border-top:1px solid rgba(227,190,132,.12);vertical-align:top}
.mxyr tr.rw{cursor:pointer}.mxyr tr.rw:hover{background:rgba(227,190,132,.06)}.mxyr tr.now td{background:rgba(255,215,0,.12)}
.mxyr tr.rw:nth-of-type(4n+1){background:rgba(255,255,255,.025)}.mxyr .ag{color:#F0CF94;white-space:nowrap;width:110px}.mxyr .nm{width:46px;text-align:center;font-weight:700;font-size:18px}.mxyr tr.dsc td{color:#EDE6D8;line-height:1.7;display:none;padding:4px 14px 14px 30px;border-top:none}.mxyr tr.dsc.op td{display:table-cell}`;
const $=id=>document.getElementById(id);
const E=n=>{try{return (typeof ENERGIES!=='undefined'&&ENERGIES[String(n)])||{};}catch(e){return {};}};
function shell(id,t,c,d,no){
  const w=document.createElement('div');w.className='mxsec';w.id='mxsec-'+id;w.style.setProperty('--c',c);
  const h=document.createElement('div');h.className='mxsec-h';const b=document.createElement('div');b.className='mxsec-b';
  h.innerHTML='<span><span class="no">'+no+'</span>'+t+'</span><small><span class="cnt"></span> <span class="ar">▼</span></small>';
  h.onclick=()=>w.classList.toggle('closed');
  if(d)b.innerHTML='<div class="mxsec-d">'+d+'</div>';
  w.appendChild(h);w.appendChild(b);return {w,b,h};
}
function grp(panel,s,no){
  const {w,b,h}=shell(s.id,s.t,s.c,s.d,no);
  let n=0;const take=ids=>ids.forEach(id=>{const el=$('mxbox-'+id);if(el&&el.parentNode===panel){b.appendChild(el);n++;}});
  if(s.fig){const f=document.createElement('div');f.className='mxfig';f.id='mxfig';b.appendChild(f);}
  if(s.sub)s.sub.forEach(u=>{const sh=document.createElement('div');sh.className='mxsub-h';sh.textContent=u.t;const sd=document.createElement('div');sd.className='mxsub-d';sd.innerHTML=u.d;b.appendChild(sh);b.appendChild(sd);take(u.ids);});
  else take(s.ids);
  if(!n)return null;
  h.querySelector('.cnt').textContent=n+' ბოქსი';return w;
}
/* animated chakra column — numbers read from the chakra boxes' headers */
const CK=[['sahasrara','საჰასრარა','#9b6bd6',32],['ajna','აჯნა','#5c7fd6',2],['vishudha','ვიშუდჰა','#5cb8d6',16],['anahata','ანაჰატა','#5cb85c',12],['manipura','მანიპურა','#e8c02e',10],['svadhistana','სვადჰისტანა','#ef8a27',6],['muladhara','მულადჰარა','#d64545',4]];
function figure(){
  const host=$('mxfig');if(!host)return;
  const Y=CK.map((_,i)=>46+i*62);let s=`<svg viewBox="0 0 440 470"><defs><radialGradient id="mxk"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff6a3d" stop-opacity="0"/></radialGradient></defs>
  <line x1="200" y1="${Y[0]}" x2="200" y2="${Y[6]}" stroke="#E3BE84" stroke-opacity=".45" stroke-width="2"/>`;
  let a='M200 '+Y[6],b='M200 '+Y[6];for(let i=6;i>0;i--){const m=(Y[i]+Y[i-1])/2,dx=(i%2?1:-1)*34;a+=` Q${200+dx} ${m} 200 ${Y[i-1]}`;b+=` Q${200-dx} ${m} 200 ${Y[i-1]}`;}
  s+=`<path class="flow" d="${a}" fill="none" stroke="#9fc3ff" stroke-width="2"/><path class="flow" d="${b}" fill="none" stroke="#ff9a6a" stroke-width="2" style="animation-direction:reverse"/>`;
  CK.forEach(([k,nm,c,pet],i)=>{const y=Y[i],key=document.querySelector('#mxbox-ch_'+k+' .mx-key'),nums=key?(key.textContent.match(/\d+/g)||[]):[];
    let p='';const n=Math.min(pet,24);for(let j=0;j<n;j++)p+=`<ellipse cx="200" cy="${y-9}" rx="${Math.max(2,Math.min(5,22/n))}" ry="8" fill="${c}" fill-opacity=".5" transform="rotate(${j*360/n} 200 ${y})"/>`;
    s+=`<g class="cg" data-k="${k}"><circle class="halo" cx="200" cy="${y}" r="17" fill="${c}" style="animation-delay:${i*.3}s"/><g class="lot" style="animation-duration:${28+i*5}s">${p}</g><circle class="core" cx="200" cy="${y}" r="7" fill="${c}"/>
      <text x="168" y="${y+6}" fill="#F3E6C8" font-size="18" font-weight="600" text-anchor="end">${nm}</text>`;
    if(nums.length===3)s+=`<text x="232" y="${y+6}" font-size="19"><tspan fill="#b9a8ff" font-weight="700">${nums[0]}</tspan><tspan fill="#c9c2d8"> · </tspan><tspan fill="#8fd36a" font-weight="700">${nums[2]}</tspan><tspan fill="#c9c2d8"> → </tspan><tspan fill="#f2a65a" font-weight="700">${nums[1]}</tspan></text>`;
    s+='</g>';});
  s+=`<text x="232" y="20" font-size="14" fill="#c9c2d8">ენერგია · ფიზიკა → ემოცია</text><circle r="8" fill="url(#mxk)"><animateMotion dur="7s" repeatCount="indefinite" path="M200 ${Y[6]} L200 ${Y[0]}"/></circle></svg>`;
  host.innerHTML=s;host.querySelectorAll('.cg').forEach(g=>g.onclick=()=>window.openBoxById('ch_'+g.dataset.k));
}
function sectionize(method){
  if(method===4)return;
  const panel=$('matrix-boxes');if(!panel)return;
  if(!$('mxsec-css')){const st=document.createElement('style');st.id='mxsec-css';st.textContent=css;document.head.appendChild(st);}
  const made=[];let no=0;SEC.forEach(s=>{const w=grp(panel,s,no+1);if(w){made.push(w);no++;}});
  const rest=[...panel.children].filter(el=>el.classList.contains('mx-box'));
  made.forEach(w=>panel.appendChild(w));
  if(rest.length){const o=grp(panel,{id:'other',t:'სხვა',c:'#9aa3b6',d:'',ids:rest.map(el=>el.id.replace('mxbox-',''))},no+1);if(o)panel.appendChild(o);}
  figure();
}
/* ── sky / earth / man / woman / spiritual knowledge ── */
const PUR=[
 ['ep-soul-top','ცა','#b9a8ff','ცის ხაზი (ზედა + ქვედა წერტილი) პირადი დანიშნულების სულიერი ნაწილია: რას ითხოვს სული, რა სულიერი ამოცანა აქვს ადამიანს. ის ზედა ჩაკრებს (4–6) ეხება: სიყვარულს, სიტყვას, ხედვას.'],
 ['ep-soul-bot','მიწა','#8fd36a','მიწის ხაზი (მარცხენა + მარჯვენა წერტილი) პირადი დანიშნულების მატერიალური ნაწილია: ყოფა, ფული, ოჯახი, სხეული. ის ქვედა ჩაკრებს (1–3) ეხება.'],
 ['ep-soul-mid','სულის ძიება — პირადი დანიშნულება','#E3BE84','ცისა და მიწის ჯამი. დაახლოებით 40 წლამდე მთავარი ამოცანაა „გახდე საკუთარი თავი“: იპოვო საკუთარი გზა, ისწავლო სულიერისა და მატერიალურის გაერთიანება.'],
 ['ep-male-sum','მამაკაცის ხაზი','#d282ff','მამის ხაზის წინაპრების მოთხოვნა: რას ელიან ჩვენგან მამის გვარის წინაპრები, რა ამოცანა გადმოგვცეს.'],
 ['ep-fem-sum','ქალის ხაზი','#ff8c8c','დედის ხაზის წინაპრების მოთხოვნა: რას ელიან ჩვენგან დედის გვარის წინაპრები, რა ამოცანა გადმოგვცეს.'],
 ['ep-soc-mid','სოციალიზაცია — სოციალური დანიშნულება','#E3BE84','კაცისა და ქალის ხაზის ჯამი. დაახლოებით 40–60 წლის ამოცანა: რა მივცეთ სამყაროს და ადამიანებს, დაგროვილ გამოცდილებაზე დაყრდნობით.'],
 ['ep-misia','სულიერი ცოდნა — საერთო დანიშნულება','#ffd700','პირადი და სოციალური დანიშნულების ჯამი: მთავარი გზა მთელი ცხოვრებისთვის, განსაკუთრებით 60 წლის შემდეგ, როცა სულიერი ცოდნა სხვებს გადაეცემა.']];
function box(id,title,color,num,html){
  const w=document.createElement('div');w.className='mx-box';w.id='mxbox-'+id;
  const h=document.createElement('div');h.className='mx-box-head';
  h.innerHTML='<span><span class="mx-dot" style="background:'+color+'"></span>'+title+'</span><span class="mx-key">'+num+'<span class="mx-arrow">▼</span></span>';
  const b=document.createElement('div');b.className='mx-box-body';b.style.display='none';b.innerHTML=html;
  h.onclick=()=>{b.style.display=b.style.display==='block'?'none':'block';};w.appendChild(h);w.appendChild(b);return w;
}
function energyHtml(n,lead){const e=E(n),o=window.MX_ORIG&&window.MX_ORIG[n-1];
  return '<p style="margin:4px 0">'+lead+'</p><div style="margin:10px 0 4px;font-weight:600;color:#E3BE84">'+n+' — '+(e.name||'')+'</div>'+(e.desc?'<p style="margin:4px 0">'+e.desc+'</p>':'')+
    (o?'<div style="margin:10px 0 4px;font-weight:600;color:#b9a8ff">ენერგიის არსი</div><p style="margin:4px 0;color:#E4DCF5">'+o+'</p>':'');}
function purposes(){
  const panel=$('matrix-boxes');if(!panel||!$('mxsec-karma'))return;
  const old=$('mxsec-purpose');if(old)old.remove();
  const no=panel.querySelectorAll('.mxsec').length+1;
  const {w,b,h}=shell('purpose','ცა, მიწა, კაცი, ქალი და სულიერი ცოდნა','#E3BE84','დანიშნულებები ასაკის მიხედვით: ცა და მიწა ქმნის პირად დანიშნულებას (≈40 წლამდე), კაცისა და ქალის ხაზი სოციალურს (≈40–60), მათი ჯამი კი სულიერ ცოდნას, საერთო გზას მთელი ცხოვრებისთვის.',no);
  let n=0;PUR.forEach(([eid,t,c,lead])=>{const v=parseInt(($(eid)||{}).textContent);if(!v)return;b.appendChild(box('pur_'+eid,t,c,v,energyHtml(v,lead)));n++;});
  if(!n)return;h.querySelector('.cnt').textContent=n+' ბოქსი';
  const yr=$('mxsec-years');panel.insertBefore(w,yr||null);renumber();
}
/* ── year energies ── */
let AGES=null,NOW=null,ANCH=null;
function years(){
  const panel=$('matrix-boxes');if(!panel||!AGES||!AGES.length||!$('mxsec-karma'))return;
  const old=$('mxsec-years');if(old)old.remove();
  const no=panel.querySelectorAll('.mxsec').length+1;
  const {w,b,h}=shell('years','წლების ენერგიები','#7fc6e8','მატრიცის წრეზე ყოველ ასაკს თავისი ენერგია აქვს. ის მოქმედებს ამ ასაკიდან შემდეგ წერტილამდე და აჩვენებს წლის მთავარ თემას: რა იხსნება, რა გამოცდა მოდის. ★ მთავარი წერტილებია (ყოველ 10 წელიწადში), რომლებიც მთელ ათწლეულს აძლევს ტონს. შენი ახლანდელი პერიოდი ყვითლადაა მონიშნული. დააჭირე სტრიქონს ახსნისთვის.',no);
  let rows='';const ag=s=>parseFloat(String(s).replace(',','.'))||0;
  const L=AGES.map(p=>({...p})).concat((ANCH||[]).map(a=>({label:a.label,energy:a.energy,anchor:1}))).sort((x,y)=>ag(x.label)-ag(y.label)||(y.anchor?1:0)-(x.anchor?1:0));
  L.forEach((p,i)=>{const AG=L;const e=E(p.energy),a=ag(p.label),nx=AG[i+1]?ag(AG[i+1].label):a+1.25,now=NOW!=null&&NOW>=a&&NOW<nx;
    rows+=`<tr class="rw${now?' now':''}" data-i="${i}"${p.anchor?' style="font-weight:700;background:rgba(227,190,132,.08)"':''}><td class="ag">${p.anchor?'★ ':''}${p.label} წ.</td><td class="nm" style="color:${e.color||'#E3BE84'}">${p.energy}</td><td>${e.name||''}</td></tr><tr class="dsc" data-d="${i}"><td colspan="3">${e.desc||''}</td></tr>`;});
  b.insertAdjacentHTML('beforeend','<table class="mxyr">'+rows+'</table>');
  b.querySelectorAll('tr.rw').forEach(r=>r.onclick=()=>b.querySelector('tr.dsc[data-d="'+r.dataset.i+'"]').classList.toggle('op'));
  h.querySelector('.cnt').textContent=L.length+' წერტილი';panel.appendChild(w);renumber();
}
function renumber(){document.querySelectorAll('#matrix-boxes .mxsec').forEach((s,i)=>{const n=s.querySelector('.mxsec-h .no');if(n)n.textContent=i+1;});}
/* hooks */
function wrap(name,after,before){const o=window[name];if(typeof o!=='function'||o['_s_'+name])return;
  const f=function(){if(before)try{before.apply(this,arguments);}catch(e){}const r=o.apply(this,arguments);try{after.apply(this,arguments);}catch(e){console.warn(name,e);}return r;};f['_s_'+name]=true;window[name]=f;}
wrap('buildMatrixBoxes',function(v,method){sectionize(method);if(method!==4){years();}});
wrap('draw',function(){},function(v){if(v&&!v.compat){AGES=v.ages||null;NOW=(v.age!=null&&!isNaN(+v.age))?+v.age:null;}else AGES=null;});
(function(){const o=window.mxApi;if(typeof o!=='function'||o._anc)return;const f=async function(path){const r=await o.apply(this,arguments);try{if(path==='/api/matrix')ANCH=r&&r.anchors||null;}catch(e){}return r;};f._anc=true;window.mxApi=f;})();
wrap('renderChakra',function(){purposes();figure();});
const ob=window.openBoxById;if(typeof ob==='function')window.openBoxById=function(id){const el=$('mxbox-'+id);const s=el&&el.closest('.mxsec');if(s)s.classList.remove('closed');return ob.apply(this,arguments);};
})();
