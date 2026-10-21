/* hd_life.js — Human Design → professions and everyday life (shared by hd.html and life.html).
   HDLIFE.analyze(x) with x = {type, prof:'1/3', centers:[…], chans:['34-57',…],
     sense:1–6 (design Sun tone), dig/env/mot/per: (color−1)·2 + (tone≤3 ? 0 : 1)}
   → {tags:{tag:[weight, reason…]}, items:[[title, text], …]} — tags use the life.html profession areas.
   HDLIFE.fromBackend(chart) converts the hd.html backend chart to that input.
   HDLIFE.mountHD() hooks hd.html: a „პროფესიები და ცხოვრება“ card after every natal chart.        */
(function(){
'use strict';
const TYPE={'Generator':['გენერატორი',['build','sport','biz','food'],'შენი ძალა — სამუშაო, რომელიც გიყვარს: საკრალური ენერგია უშრეტია, როცა საქმეს გამოეხმაურები და არ აიძულებ თავს.'],
  'Manifesting Generator':['მანიფესტირებადი გენერატორი',['biz','it','sport','comm'],'მრავალი საქმე ერთდროულად და სწრაფად; გამოტოვებული ნაბიჯები ნორმაა — ნუ ჩაიკეტები ერთ პროფესიაში.'],
  'Projector':['პროექტორი',['mgmt','psy','edu','law'],'შენ ხედავ სხვებს და სისტემებს — მენეჯერი, მრჩეველი, ხელმძღვანელი. მუშაობ ნაკლები საათით, მაგრამ მოწვევით და აღიარებით.'],
  'Manifestor':['მანიფესტორი',['biz','mgmt','art','secur'],'ინიციატორი: იწყებ, ხსნი გზას, ტოვებ სხვებს გასაგრძელებლად. თავისუფლება და დამოუკიდებლობა აუცილებელია.'],
  'Reflector':['რეფლექტორი',['psy','care','spirit','law'],'საზოგადოების სარკე: შეფასება, ექსპერტიზა, ჯგუფის ჯანმრთელობის დანახვა. გარემო და ხალხი ყველაფერს წყვეტს.']};
const LINE={1:['მკვლევარი',['sci','law'],'საფუძვლიანი ცოდნა — სანამ არ შეისწავლი, არ ენდობი'],2:['ბუნებრივი ნიჭი',['art','sport'],'ნიჭი, რომელსაც თავად ვერ ხედავ — სხვები გეძახიან'],
  3:['ექსპერიმენტატორი',['build','it','sci'],'ცდა და შეცდომა — რა არ მუშაობს, ამის აღმოჩენა შენი ექსპერტიზაა'],4:['ქსელის ადამიანი',['comm','trade','edu'],'შესაძლებლობები მეგობრებისა და ნაცნობების წრიდან მოდის'],
  5:['პრობლემის გადამჭრელი',['mgmt','law','psy'],'სხვები შენში მხსნელს ხედავენ — პრაქტიკული, უნივერსალური გადაწყვეტა'],6:['მაგალითი',['edu','psy','mgmt'],'სამი ეტაპი: ცდა (30-მდე), დაკვირვება (30–50), სანიმუშო ცხოვრება (50-დან)']};
const SENSE={1:['ყნოსვა',['food','med','design'],'სიმართლეს „ყნოსავ“ — ადამიანი, ადგილი, სიტუაცია; ენდე სუნსა და პირველ შთაბეჭდილებას. ნიჭი: კვება, პარფიუმერია, ღვინო, მედიცინა.'],
  2:['გემო',['food','design','art'],'გემოვნების ადამიანი — ხარისხს და „სწორს“ გემოთი არჩევ. ნიჭი: კულინარია, დეგუსტაცია, დიზაინი, სტილი.'],
  3:['გარეგანი ხედვა',['design','art','sci'],'ხედავ იმას, რაც თვალწინაა და სხვები ვერ ამჩნევენ: დეტალი, ფორმა, ფერი. ნიჭი: ვიზუალური ხელოვნება, ფოტო, დაკვირვება, ანალიზი.'],
  4:['შინაგანი ხედვა',['spirit','art','psy'],'ხედვა შიგნიდან — წარმოსახვა, მომავლის სურათი, ხილვები. ნიჭი: სტრატეგია, ვიზიონერობა, შემოქმედება, ფსიქოლოგია.'],
  5:['გრძნობა',['psy','care','art'],'გრძნობ ატმოსფეროს და ადამიანის მდგომარეობას. ნიჭი: ფსიქოლოგია, ზრუნვა, მუსიკა, ხალხთან მუშაობა.'],
  6:['შეხება',['med','build','sport'],'სამყაროს შეხებით შეიცნობ — ხელები შენი ინსტრუმენტია. ნიჭი: მასაჟი, ხელოსნობა, ქირურგია, სპორტი, ქანდაკება.']};
const DIG=[['მადა','თანმიმდევრული — ერთი სახეობის საკვები ერთ ჯერზე','მონაცვლეობითი — სხვადასხვა საკვები სხვადასხვა დროს'],['გემო','ღია — ახალი, მრავალფეროვანი გემოები','დახურული — ერთი და იგივე, ნაცნობი საკვები'],
  ['წყურვილი','ცხელი — თბილი საკვები და სასმელი','ცივი — გრილი საკვები და სასმელი'],['შეხება','მშვიდი — ჭამა სიმშვიდეში, მარტო ან წყნარად','ნერვული — ჭამა მოძრაობაში, ხმაურში, საუბრისას'],
  ['ხმა','მაღალი — ჭამა ხმაურში, მუსიკასთან','დაბალი — ჭამა სიჩუმეში'],['სინათლე','პირდაპირი — დღისით, მზის შუქზე','არაპირდაპირი — საღამოს, ბინდში']];
const ENV=[['მღვიმეები','დაცული, მყუდრო სივრცე; ზურგი კედელთან, ხედი წინ','შერჩევითი — ცოტა, შერჩეული ხალხი','შერწყმული — ახლო, თბილი წრე'],
  ['ბაზრები','ხალხმრავალი, აქტიური ადგილი — დიდი ქალაქი, ბიზნესცენტრი','შიდა — ერთ ადგილას დამკვიდრებული','გარე — მუდმივი მოძრაობა, ბევრი ადგილი'],
  ['სამზარეულოები','აქტიური, მრავალფეროვანი, შემოქმედებითი გარემო','ნესტიანი — წყალთან ახლოს','მშრალი — მშრალი კლიმატი'],
  ['მთები','მაღალი ადგილი, ხედით — მთა, ზედა სართული','აქტიური — მოძრაობა, სიახლე','პასიური — მშვიდი დაკვირვება'],
  ['ველები','ხეობა, დაბლობი, ველი — ფართო, ღია სივრცე','ვიწრო — ერთ საქმეზე ფოკუსი','ფართო — მრავალფეროვნება'],
  ['სანაპიროები','წყლის პირი — ზღვა, ტბა, მდინარე; ორი სამყაროს საზღვარი','ბუნებრივი — ბუნება','ხელოვნური — ქალაქის სანაპირო, ნავსადგური']];
const MOT=[['შიში','მოქმედებ მაშინ, როცა ხედავ საფრთხეს ან რისკს — შიში შენი სიფრთხილის მოტორია'],['იმედი','გამოძრავებს იმედი, რომ შესაძლებელია უკეთესი'],
  ['სურვილი','გამოძრავებს სურვილი — როცა რაღაც ნამდვილად გინდა'],['მოთხოვნილება','გამოძრავებს აუცილებლობა — რა არის რეალურად საჭირო'],
  ['დანაშაული','გამოძრავებს მოვალეობის გრძნობა — სწორად გაკეთება'],['უმანკოება','მოქმედებ უბრალოდ, ფარული მიზნის გარეშე']];
const PER=[['გადარჩენა','ხედავ, რა არის აუცილებელი სიცოცხლისა და უსაფრთხოებისთვის'],['შესაძლებლობა','ხედავ ყველა შესაძლო გზას'],['ძალა','ხედავ ძალას და მის განაწილებას'],
  ['სურვილი','ხედავ, რა სურთ ადამიანებს'],['ალბათობა','ხედავ, რა მოხდება სავარაუდოდ'],['პირადული','ხედავ ყველაფერს საკუთარი გამოცდილებით']];
const CEN={Head:'თავი',Ajna:'აჯნა',Throat:'ყელი',G:'G · მე',Heart:'გული · ეგო','Solar Plexus':'მზის წნული',Spleen:'ელენთა',Sacral:'საკრალი',Root:'ფესვი'};
const CENJ={Throat:['comm','mgmt'],Heart:['biz','trade','fin'],'Solar Plexus':['art','psy'],Spleen:['med','care'],Sacral:['build','sport'],Root:['secur','sport'],G:['mgmt','spirit'],Ajna:['sci','edu'],Head:['sci','spirit']};
/* channels: Georgian name + profession areas */
const CH={'1-8':['შთაგონება',['art','design']],'2-14':['განმეორებითი რიტმი (მიმართულება და სიმდიდრე)',['fin','biz']],'3-60':['მუტაცია',['it','art']],'4-63':['ლოგიკა',['sci','it']],
  '5-15':['რიტმი',['care','food']],'6-59':['შეწყვილება',['psy','care']],'7-31':['ალფა (ლიდერობა)',['mgmt','law']],'9-52':['კონცენტრაცია',['sci','it']],
  '10-20':['გამოღვიძება',['spirit','comm']],'10-34':['შესწავლა',['biz','sport']],'10-57':['სრულყოფილი ფორმა',['design','sport']],'11-56':['ცნობისმოყვარეობა',['comm','edu']],
  '12-22':['გახსნილობა',['art','comm']],'13-33':['უძღები (მოწმე, ისტორია)',['edu','comm']],'16-48':['ტალღა (ნიჭი და სიღრმე)',['art','sport']],'17-62':['მიმღებლობა (ორგანიზება)',['sci','mgmt']],
  '18-58':['განსჯა (გაუმჯობესება)',['law','med']],'19-49':['სინთეზი (რესურსები, საჭიროებები)',['care','food']],'20-34':['ქარიზმა',['sport','biz']],'20-57':['ნეიროტალღები',['it','psy']],
  '21-45':['ფული',['biz','fin','mgmt']],'23-43':['სტრუქტურირება (გენიოსობა)',['it','sci']],'24-61':['გაცნობიერება',['spirit','sci']],'25-51':['ინიციაცია',['spirit','secur']],
  '26-44':['დანებება (გადამცემი, გაყიდვები)',['trade','comm']],'27-50':['შენარჩუნება',['care','med']],'28-38':['ბრძოლა',['secur','sport']],'29-46':['აღმოჩენა',['travel','sport']],
  '30-41':['ცნობადობა (ოცნება, გრძნობა)',['art','travel']],'32-54':['ტრანსფორმაცია (ამბიცია)',['biz','fin']],'34-57':['ძალაუფლება',['secur','sport']],'35-36':['გარდამავლობა (გამოცდილება)',['travel','art']],
  '37-40':['კავშირი (საზოგადოება)',['care','biz']],'39-55':['ემოციურობა',['art','spirit']],'42-53':['ჩამოყალიბება (ციკლები)',['edu','care']],'47-64':['აბსტრაქცია',['sci','psy']]};
const TAGN={mgmt:'მენეჯმენტი და ლიდერობა',biz:'ბიზნესი და მეწარმეობა',fin:'ფინანსები და ინვესტიციები',it:'IT და ტექნოლოგიები',sci:'მეცნიერება და კვლევა',med:'მედიცინა და ჯანმრთელობა',
  psy:'ფსიქოლოგია და კონსულტირება',edu:'განათლება და სწავლება',law:'სამართალი და სახელმწიფო',comm:'კომუნიკაცია და მედია',trade:'ვაჭრობა და გაყიდვები',art:'ხელოვნება, მუსიკა, კინო',
  design:'დიზაინი და სილამაზე',build:'მშენებლობა და ინჟინერია',sport:'სპორტი და ფიზიკური საქმე',travel:'ტურიზმი და საერთაშორისო საქმე',food:'კვება, სახლი, მიწა',
  care:'ზრუნვა და სოციალური საქმე',spirit:'სულიერება და ეზოთერიკა',secur:'უსაფრთხოება და კრიზისი'};
const HDLIFE={TAGN,CH,CEN};
HDLIFE.analyze=function(x){
  const tags={},add=(ts,w,why)=>{for(const t of ts||[]){const e=tags[t]||(tags[t]=[0]);e[0]+=w;if(!e.includes(why))e.push(why);}};
  const items=[],T=TYPE[x.type];
  if(T){add(T[1],1.5,'ტიპი: '+T[0]);items.push(['ტიპი და სამუშაო — '+T[0],T[2]]);}
  const [l1,l2]=String(x.prof||'').split('/').map(Number);
  if(LINE[l1]&&LINE[l2]){add(LINE[l1][1],1,'პროფილი: '+l1+' ხაზი');add(LINE[l2][1],0.7,'პროფილი: '+l2+' ხაზი');
    items.push([`პროფილი ${l1}/${l2} — ${LINE[l1][0]} / ${LINE[l2][0]}`,`ცნობიერი (${l1}): ${LINE[l1][2]}. არაცნობიერი (${l2}): ${LINE[l2][2]}.`]);}
  const S=SENSE[x.sense];if(S){add(S[1],1.2,'ძლიერი გრძნობა: '+S[0]);items.push(['ყველაზე ძლიერი გრძნობა — '+S[0],S[2]]);}
  if(x.env!=null&&ENV[x.env>>1]){const e=ENV[x.env>>1];items.push(['გარემო — '+e[0],`${e[1]}; ${e[2+(x.env&1)]}. აქ აზროვნება ყველაზე ნათელია, ურთიერთობები — სწორი.`]);
    if((x.env>>1)===1)add(['trade','comm'],0.5,'გარემო: ბაზრები');if((x.env>>1)===5)add(['travel'],0.5,'გარემო: სანაპიროები');}
  if(x.mot!=null&&MOT[x.mot>>1])items.push(['მოტივაცია — '+MOT[x.mot>>1][0],MOT[x.mot>>1][1]+'.']);
  if(x.per!=null&&PER[x.per>>1])items.push(['პერსპექტივა (ხედვა) — '+PER[x.per>>1][0],PER[x.per>>1][1]+'.']);
  if(x.dig!=null&&DIG[x.dig>>1]){const d=DIG[x.dig>>1];items.push(['კვება (დიეტა) — '+d[0],d[1+(x.dig&1)]+'.']);}
  const chs=(x.chans||[]).filter(c=>CH[c]);
  for(const c of chs)add(CH[c][1],1,'არხი '+c+' '+CH[c][0]);
  if(chs.length)items.push(['არხები — შენი მუდმივი ნიჭები',chs.map(c=>`${c} ${CH[c][0]}`).join(' · ')]);
  for(const c of x.centers||[])if(CENJ[c])add(CENJ[c],0.4,'განსაზღვრული: '+CEN[c]);
  return {tags,items};
};
HDLIFE.top=function(tags,n){return Object.entries(tags).sort((a,b)=>b[1][0]-a[1][0]).slice(0,n||6);};
/* hd.html backend chart → analyze() input */
HDLIFE.fromBackend=function(c){
  const f=(arr,p)=>(arr||[]).find(a=>a.planet===p)||{};
  const ix=a=>a&&a.color?(a.color-1)*2+(a.tone<=3?0:1):null;
  const ps=f(c.personality,'Sun'),ds=f(c.design,'Sun'),pn=f(c.personality,'North Node'),dn=f(c.design,'North Node');
  return {type:c.type,prof:(String(c.profile||'').match(/\d\/\d/)||[''])[0],centers:c.defined_centers||[],
    chans:(c.defined_channels||[]).map(x=>{const a=Math.min(x.gate_a,x.gate_b),b=Math.max(x.gate_a,x.gate_b);return a+'-'+b;}),
    sense:ds.tone,dig:ix(ds),env:ix(dn),mot:ix(ps),per:ix(pn)};
};
/* hd.html: card under the summary after each natal chart */
HDLIFE.mountHD=function(){
  if(typeof window.renderNatal!=='function'||window.renderNatal._hl)return false;
  const css=document.createElement('style');css.textContent=`
#hd-life{margin:14px auto;max-width:900px;border:1px solid rgba(201,168,76,.25);border-radius:12px;padding:14px 16px;background:rgba(10,8,22,.5);text-align:left}
#hd-life h3{font-family:Cinzel,serif;font-weight:400;font-size:12.5px;letter-spacing:2.5px;color:#c9a84c;margin:0 0 10px}
#hd-life .hl-r{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(60px,1fr) auto;gap:5px 10px;align-items:center;font-size:13px}
#hd-life .hl-r .b{height:9px;background:rgba(255,255,255,.06);border-radius:2px;position:relative}#hd-life .hl-r .b i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#9a7028,#ecd59a);border-radius:2px}
#hd-life .hl-r small{display:block;color:rgba(200,180,140,.65);font-size:11px}#hd-life .hl-r .n{font-size:11px;color:rgba(200,180,140,.7)}
#hd-life ul{list-style:none;padding:0;margin:10px 0 0}#hd-life li{font-size:13px;line-height:1.6;padding:6px 0;border-bottom:1px dashed rgba(201,168,76,.15)}
#hd-life li b{color:#ecd59a;font-weight:500}#hd-life li:last-child{border-bottom:none}`;
  document.head.appendChild(css);
  const o=window.renderNatal;
  const w=function(ch){const r=o.apply(this,arguments);try{HDLIFE.renderHD(ch);}catch(e){console.warn('hd_life',e);}return r;};
  w._hl=true;window.renderNatal=w;
  if(typeof window.renderSynastry==='function'&&!window.renderSynastry._hl){const s=window.renderSynastry;const ws=function(){const el=document.getElementById('hd-life');if(el)el.remove();return s.apply(this,arguments);};ws._hl=true;window.renderSynastry=ws;}
  return true;
};
HDLIFE.renderHD=function(ch){
  if(!ch||!ch.type)return;
  const A=HDLIFE.analyze(HDLIFE.fromBackend(ch)),top=HDLIFE.top(A.tags,7),mx=top.length?top[0][1][0]:1;
  let el=document.getElementById('hd-life');
  if(!el){el=document.createElement('div');el.id='hd-life';const anchor=document.getElementById('summary-cards');if(!anchor)return;anchor.insertAdjacentElement('afterend',el);}
  el.innerHTML=`<h3>💼 პროფესიები და ცხოვრება</h3><div class="hl-r">${top.map(([t,v])=>`<span><b style="color:#ecd59a;font-weight:500">${TAGN[t]}</b><small>${v.slice(1).join(' · ')}</small></span><span class="b"><i style="width:${Math.max(5,100*v[0]/mx)}%"></i></span><span class="n">${v[0].toFixed(1)}</span>`).join('')}</div>
    <ul>${A.items.map(([t,x])=>`<li><b>${t}</b><br>${x}</li>`).join('')}</ul>
    <div style="font-size:11px;color:rgba(200,180,140,.6);margin-top:8px">პროფესიული სფეროები ჯამდება ტიპიდან, პროფილის ხაზებიდან, ძლიერი გრძნობიდან, არხებიდან და განსაზღვრული ცენტრებიდან. სრული სურათი ყველა სისტემით — „ცხოვრების რუქა“.</div>`;
};
window.HDLIFE=HDLIFE;
if(typeof document!=='undefined'&&document.getElementById&&document.getElementById('summary-cards')){
  let n=0;(function wait(){if(HDLIFE.mountHD()||++n>100)return;setTimeout(wait,100);})();}
})();
