/* MAGNUS — groups the matrix boxes into thematic sections (karmic tail · combos · health/chakras · positions) */
(function(){
const SEC=[
 {id:'karma',t:'კარმული კუდი და წარსული',c:'#8e44ad',
  d:'მატრიცის ქვედა ნაწილი გვიჩვენებს, რა მოიტანა სულმა წარსული ცხოვრებიდან: დაუსრულებელ ამოცანებს, გვარის კარმას (კაცი და ქალი წინაპრების ხაზით) და ფულთან დაკავშირებულ კარმას. კარმული კუდი ქვემოდან ზემოთ იკითხება: ქვედა რიცხვი წარსულის მთავარი თემაა, შუა არის ის, როგორ ვლინდება ახლა, ხოლო ზედა, რომელიც ცენტრთან ყველაზე ახლოსაა, გაკვეთილია, რომელიც ამ ცხოვრებაში უნდა გაიარო. ეს ენერგიები ყველაზე ძლიერად 40 წლამდე მუშაობს: თუ გაკვეთილს არ გაივლი, სიტუაციები მეორდება.',
  ids:['karmic_tail','b3','material_karma','r3','br','bl']},
 {id:'combo',t:'ხაზები და კომბინაციები',c:'#2471a3',
  d:'აქ სამი რიცხვი ერთად იკითხება, როგორც ერთი თემა: პერსონა (როგორ გხედავენ), ტალანტების ზონა (რისთვის მოხვედი), წინაპრების ნიჭები, სიყვარულის ხაზი, ფულის ხაზი და სექსუალურობა. კომბინაციის აზრი ცალკეულ რიცხვებზე მეტია: ენერგიები ერთმანეთს აძლიერებს ან აწონასწორებს. ჯერ წაიკითხე კომბინაცია, მერე ქვემოთ, პოზიციებში, თითოეული რიცხვი ცალ-ცალკე.',
  ids:['persona','talent_zone','tl','tr','love','money','sex']},
 {id:'health',t:'ჯანმრთელობის რუკა — ჩაკრები',c:'#5cb85c',
  d:'ჯანმრთელობის რუკა შვიდი ჩაკრით იკითხება, გვირგვინიდან ფუძემდე. თითოეულ ჩაკრას სამი რიცხვი აქვს: <b>ენერგია</b> (რა ძალა მოდის ამ ცენტრში), <b>ფიზიკა</b> (როგორ ვლინდება სხეულსა და ქმედებაში) და <b>ემოცია</b> (მათი ჯამი, როგორ განიცდი ამ სფეროს). როცა ენერგია ბევრად მეტია ფიზიკაზე, ძალა ვერ ეტევა და ჩნდება გადაძაბვა; როცა ფიზიკა მეტია, ადამიანი იცლება. მატრიცა დიაგნოზი არ არის: ის აჩვენებს, სად არის ძალა და სად სჭირდება ყურადღება.',
  sub:[{t:'ჩაკრების კომბინაციები',d:'თითოეულ ბოქსში წერია, რას მართავს ჩაკრა, როგორ ვლინდება ჰარმონიასა და დისბალანსში, როგორ დააბალანსო და რას ნიშნავს შენი სამი რიცხვი ამ ჩაკრაში. ჯამის რიგი („სულ“) გვიჩვენებს ზოგად ენერგიას, სხეულის „კონსტიტუციას“ და ცხოვრების ემოციურ ფონს.',
        ids:['ch_sahasrara','ch_ajna','ch_vishudha','ch_anahata','ch_manipura','ch_svadhistana','ch_muladhara','ch_lelia','ch_lada','ch_total']},
       {t:'ჩაკრების ემოციები',d:'ემოცია არის ენერგიისა და ფიზიკის ჯამი: ის, როგორ განიცდი თითოეულ სფეროს შიგნით. გვირგვინი სულიერ განცდას აჩვენებს, აჯნა გონებისას, ყელი თვითგამოხატვისას, გული სიყვარულისას, მზის წნული ნებისა და თავდაჯერებულობისას, საკრალური სიამოვნებისა და სურვილებისას, ფუძე უსაფრთხოებისა და სხეულისას. როცა ემოცია მინუსშია, ის პირველი სიგნალია, რომ ამ ჩაკრას ყურადღება სჭირდება.',
        ids:['emo_crown','emo_thirdeye','emo_throat','emo_heart','emo_solar','emo_sacral','emo_root']}]},
 {id:'pos',t:'პოზიციები — ცალკეული წერტილები',c:'#E3BE84',
  d:'მატრიცის თითოეული წერტილი ცალკე სფეროს აღწერს: კომფორტის ზონა (ცენტრი), სავიზიტო ბარათი, შთაგონება, ბავშვობა, გონება, მშობელ-შვილის ურთიერთობა, ნიჭები, სურვილები, პარტნიორი, სამსახური, ურთიერთობებში შესვლა და სამუშაო თვისებები. თითოეულ ბოქსში არის ახსნა, პლიუსი, მინუსი, რჩევა და ენერგიის არსი.',
  ids:['comfort','l3','t3','l2','t2','l1','t1','g1','g2','heart','gel','b1','r1']}
];
const css=`.mxsec{margin:18px 0 0;border:1px solid var(--rule,rgba(227,190,132,.25));background:rgba(10,8,30,.25)}
.mxsec>.mxsec-h{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;border-left:5px solid var(--c);font-family:'Marcellus SC',serif;font-size:18px;color:var(--c)}
.mxsec>.mxsec-h small{font-family:inherit;font-size:12px;color:#9aa3b6}
.mxsec .mxsec-d{padding:2px 16px 12px 19px;color:#d9d0ef;line-height:1.65;font-size:14px}
.mxsec .mxsub-h{padding:10px 16px 2px;font-weight:600;color:#E3BE84;border-top:1px dashed rgba(227,190,132,.25)}
.mxsec .mxsub-d{padding:2px 16px 10px;color:#cfc6e8;line-height:1.6;font-size:13.5px}
.mxsec.closed .mxsec-b{display:none}.mxsec .mxsec-h .ar{transition:transform .2s}.mxsec.closed .mxsec-h .ar{transform:rotate(-90deg)}`;
function grp(panel,s){
  const w=document.createElement('div');w.className='mxsec';w.id='mxsec-'+s.id;w.style.setProperty('--c',s.c);
  const h=document.createElement('div');h.className='mxsec-h';
  const b=document.createElement('div');b.className='mxsec-b';
  b.innerHTML='<div class="mxsec-d">'+s.d+'</div>';
  let n=0;const take=ids=>{ids.forEach(id=>{const el=document.getElementById('mxbox-'+id);if(el&&el.parentNode===panel){b.appendChild(el);n++;}});};
  if(s.sub)s.sub.forEach(u=>{const sh=document.createElement('div');sh.className='mxsub-h';sh.textContent=u.t;const sd=document.createElement('div');sd.className='mxsub-d';sd.innerHTML=u.d;b.appendChild(sh);b.appendChild(sd);take(u.ids);});
  else take(s.ids);
  if(!n)return null;
  h.innerHTML='<span>'+s.t+'</span><small>'+n+' ბოქსი <span class="ar">▼</span></small>';
  h.onclick=()=>w.classList.toggle('closed');
  w.appendChild(h);w.appendChild(b);return w;
}
function sectionize(method){
  if(method===4)return;
  const panel=document.getElementById('matrix-boxes');if(!panel)return;
  if(!document.getElementById('mxsec-css')){const st=document.createElement('style');st.id='mxsec-css';st.textContent=css;document.head.appendChild(st);}
  const made=SEC.map(s=>grp(panel,s)).filter(Boolean);
  const rest=[...panel.children].filter(el=>el.classList.contains('mx-box'));
  made.forEach(w=>panel.appendChild(w));
  if(rest.length){const o=grp(panel,{id:'other',t:'სხვა',c:'#9aa3b6',d:'დამატებითი ბოქსები.',ids:rest.map(el=>el.id.replace('mxbox-',''))});if(o)panel.appendChild(o);}
}
function hook(){const o=window.buildMatrixBoxes;if(typeof o!=='function'||o._sec)return;
  const w=function(v,method){const r=o.apply(this,arguments);try{sectionize(method);}catch(e){console.warn('sections',e);}return r;};w._sec=true;window.buildMatrixBoxes=w;}
hook();
/* opening a box inside a closed section opens the section */
const ob=window.openBoxById;if(typeof ob==='function')window.openBoxById=function(id){const el=document.getElementById('mxbox-'+id);const s=el&&el.closest('.mxsec');if(s)s.classList.remove('closed');return ob.apply(this,arguments);};
})();
