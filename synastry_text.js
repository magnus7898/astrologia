/* synastry_text.js — „თავსებადობა“: textual compatibility from two full natal charts.
   Used by astro_tabs.js (couple group, shares the synastry form). window._synText.render(d1,d2,n1,n2,host)
     • scores: სიყვარული · ვნება · მეგობრობა · ქორწინება/სტაბილურობა · კომუნიკაცია
     • the big four by sign and element: ☉ ☽ ♀ ♂ and AC of both people
     • every cross-aspect (orb by body), strongest first, with text: a hand-written note
       for the classic synastry contacts, otherwise composed from what each body means
     • house overlays: the partner's ☉ ☽ ☿ ♀ ♂ ♃ ♄ in your houses — both directions
   Orbs: ☉☽ 8° · ☿♀♂ 6° · ♃♄ 5° · ♅♆♇ 4° · ☊ 3° · AC/MC 5°. Tropical, backend positions.    */
(function(){
'use strict';
const n360=x=>((x%360)+360)%360,angd=(a,b)=>{const d=Math.abs(n360(a-b));return d>180?360-d:d;};
const SG=['ვერძი','კურო','ტყუპები','კირჩხიბი','ლომი','ქალწული','სასწორი','მორიელი','მშვილდოსანი','თხის რქა','მერწყული','თევზები'];
const SGG=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(x=>x+'︎');
const ELN=['ცეცხლი','მიწა','ჰაერი','წყალი'],el=s=>s%4;
const ROM=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
/* bodies: key → [Georgian name in chart, glyph, short name, meaning in a relationship, orb, weight] */
const BD={
 Su:['მზე','☉','მზე','ვინაობა, ნება და სიცოცხლის ძალა',8,3],
 Mo:['მთვარე','☽','მთვარე','ემოციები, ზრუნვა და სახლის განცდა',8,3],
 Me:['მერკური','☿','მერკური','აზროვნება, საუბარი და ურთიერთგაგება',6,1.6],
 Ve:['ვენერა','♀','ვენერა','სიყვარული, სინაზე და გემოვნება',6,2.6],
 Ma:['მარსი','♂','მარსი','ვნება, სურვილი და მოქმედება',6,2.2],
 Ju:['იუპიტერი','♃','იუპიტერი','სიუხვე, მხარდაჭერა და ზრდა',5,1.4],
 Sa:['სატურნი','♄','სატურნი','პასუხისმგებლობა, ერთგულება და საზღვრები',5,1.8],
 Ur:['ურანი','♅','ურანი','თავისუფლება, სიახლე და მოულოდნელობა',4,1],
 Ne:['ნეპტუნი','♆','ნეპტუნი','ოცნება, იდეალიზაცია და სულიერი კავშირი',4,1],
 Pl:['პლუტონი','♇','პლუტონი','ძალაუფლება, სიღრმე და ტრანსფორმაცია',4,1.3],
 No:['ჩრდ. კვანძი','☊','ჩრდ. კვანძი','ბედისწერის გზა და ერთად გასავლელი გაკვეთილი',3,1.2],
 AC:['AC','AC','ასცენდენტი','გარეგნობა, პირველი შთაბეჭდილება და პიროვნების ფასადი',5,1.6],
 MC:['MC','MC','MC','მიზნები, კარიერა და საზოგადოებრივი სახე',5,0.8]};
const KEYS=Object.keys(BD);
/* aspects: angle, symbol, name, nature (+1 harmonious, -1 tense, 0 conjunction) */
const AS=[[0,'☌','შეერთება',0],[60,'⚹','სექსტილი',1],[90,'□','კვადრატი',-1],[120,'△','ტრინი',1],[180,'☍','ოპოზიცია',-1]];
const ASPTXT={0:'შერწყმა — ძლიერი, პირდაპირი კავშირი, რომელსაც ორივე მაშინვე გრძნობს',
  60:'მეგობრული შესაძლებლობა — მცირე ძალისხმევით ბევრი სასიკეთო მოდის',
  90:'დაძაბულობა, რომელიც ზრდას ითხოვს — ხახუნი, მაგრამ ასევე მოძრაობა',
  120:'ჰარმონია და ბუნებრივი ნაკადი — ეს სფერო ადვილად და თავისთავად მუშაობს',
  180:'მიზიდულობა და დაპირისპირება — ერთმანეთის სარკე, რომელიც ბალანსს ითხოვს'};
/* categories: love, passion, friendship, marriage, communication */
const CAT=['სიყვარული','ვნება','მეგობრობა','ქორწინება · სტაბილურობა','კომუნიკაცია'],CATC=['#f08cb8','#f07a4a','#e0d070','#c9a84c','#7fb2f0'];
/* which categories a pair feeds (weights) */
const PW={
 'Su-Mo':[3,1,2,3,1],'Ve-Ma':[2,4,0,1,0],'Mo-Ve':[3,1,2,2,0],'Su-Ve':[3,1,2,1,0],'Mo-Mo':[2,0,2,2,1],'Su-Su':[1,0,2,1,1],
 'Ve-Ve':[2,1,2,1,0],'Me-Me':[0,0,2,1,3],'Ma-Ma':[0,2,1,0,0],'Su-Ma':[1,2,1,0,0],'Mo-Ma':[1,2,0,0,0],'Me-Ve':[1,0,1,0,2],
 'Me-Mo':[1,0,1,0,2],'Su-Me':[0,0,2,0,2],'Ve-Sa':[1,0,0,3,0],'Mo-Sa':[1,0,0,3,0],'Su-Sa':[0,0,0,3,0],'Ma-Sa':[0,1,0,1,0],
 'Ve-Pl':[1,3,0,1,0],'Ma-Pl':[0,3,0,0,0],'Su-Pl':[0,2,0,1,0],'Mo-Pl':[1,2,0,1,0],'Ve-Ne':[2,1,1,0,0],'Mo-Ne':[2,0,1,0,0],
 'Su-Ne':[1,0,1,0,0],'Ve-Ur':[1,2,1,-1,0],'Mo-Ur':[0,1,1,-1,0],'Su-Ur':[0,1,1,0,0],'Ju-Su':[1,0,2,2,0],'Ju-Mo':[1,0,2,2,0],
 'Ju-Ve':[2,0,2,1,0],'No-Su':[1,0,1,2,0],'No-Mo':[1,0,1,2,0],'No-Ve':[2,0,1,2,0],'AC-Su':[2,1,1,1,0],'AC-Mo':[2,0,1,1,0],
 'AC-Ve':[2,2,1,0,0],'AC-Ma':[0,3,0,0,0],'AC-Me':[0,0,1,0,2],'AC-AC':[1,0,1,1,0],'Me-Sa':[0,0,0,1,1],'Me-Ju':[0,0,1,0,2]};
/* a pair's sign of effect for tense aspects / difficult conjunctions */
const HARD=new Set(['Sa','Ur','Ne','Pl']);
/* hand-written notes for the classic contacts: [harmonious/conj, tense] */
const NOTE={
 'Su-Mo':['მზე და მთვარე — ცოლქმრული ასპექტების მეფე. ერთის ნება და მეორის გრძნობა ერთმანეთს ავსებს: ერთი ანათებს, მეორე ასახავს და ათბობს. ეს ერთ-ერთი ყველაზე ძლიერი ნიშანია ხანგრძლივი კავშირისთვის.',
   'მზე და მთვარე დაძაბულ ასპექტში: მიზიდულობა ძლიერია, მაგრამ ერთის სურვილები და მეორის ემოციური მოთხოვნილებები ხშირად სხვადასხვა მხარეს მიდის. ერთმანეთის რიტმის პატივისცემა აუცილებელია.'],
 'Ve-Ma':['ვენერა და მარსი — კლასიკური რომანტიკული და სექსუალური მიზიდულობა. სინაზე და ვნება ერთმანეთს ეძებს; ფიზიკური ქიმია ძლიერია და დიდხანს ინარჩუნებს ცეცხლს.',
   'ვენერა და მარსი დაძაბულ ასპექტში: ვნება ძალიან ძლიერია, მაგრამ ხშირად ჩხუბით და შერიგებით ცოცხლობს. სიყვარულის ენები განსხვავდება — ერთს სინაზე უნდა, მეორეს — აქტიური სურვილი.'],
 'Mo-Ve':['მთვარე და ვენერა — სითბო, სინაზე და ემოციური კომფორტი. ერთად ყოფნა სასიამოვნო და მშვიდია; ორივე გრძნობს, რომ მეორე მას „უვლის“.',
   'მთვარე და ვენერა დაძაბულ ასპექტში: სიყვარული არის, მაგრამ ერთის ემოციური მოთხოვნილებები და მეორის გემოვნება ყოველთვის არ ემთხვევა; წვრილმანებზე წყენა ადვილად ჩნდება.'],
 'Su-Ve':['მზე და ვენერა — აღფრთოვანება და სიყვარული. ვენერას პატრონი მზის პატრონს აფასებს და ალამაზებს, მზე კი ვენერას ათბობს. ძალიან სასიამოვნო, ნაზი კავშირი.',
   'მზე და ვენერა დაძაბულ ასპექტში: მიზიდულობა არის, მაგრამ ფასეულობები და გემოვნება განსხვავდება; ზოგჯერ ერთი თავს ნაკლებად დაფასებულად გრძნობს.'],
 'Mo-Mo':['მთვარე და მთვარე — ემოციური ენა ერთნაირია. ერთმანეთს სიტყვების გარეშე გრძნობენ; ყოველდღიური ცხოვრება, სახლი და ჩვევები ბუნებრივად ეწყობა.',
   'მთვარეები დაძაბულ ასპექტში: განწყობები და ემოციური რეაქციები განსხვავდება — როცა ერთს სიმშვიდე სჭირდება, მეორეს — სხვა რამ. საჭიროა ერთმანეთის ემოციური ენის სწავლა.'],
 'Su-Su':['ორი მზე ჰარმონიაში — მსგავსი ცხოვრებისეული მიზნები და ხასიათი, ერთმანეთის თვითგამოხატვას მხარს უჭერენ.',
   'ორი მზე დაძაბულ ასპექტში — ორი ძლიერი ნება; კონკურენცია და ეგოს შეჯახება, თუ საერთო მიზანი არ არის.'],
 'Ve-Ve':['ორი ვენერა ჰარმონიაში — ერთნაირი გემოვნება, ერთნაირად ესმით სიყვარული, სილამაზე და სიამოვნება.',
   'ორი ვენერა დაძაბულ ასპექტში — სიყვარულის გამოხატვა და გემოვნება განსხვავდება; ფულსა და სიამოვნებაზე სხვადასხვა შეხედულება.'],
 'Me-Me':['ორი მერკური ჰარმონიაში — ერთმანეთს ნახევარი სიტყვიდან უგებენ; საუბარი ადვილი და საინტერესოა.',
   'ორი მერკური დაძაბულ ასპექტში — სხვადასხვაგვარად ფიქრობენ და საუბრობენ; კამათი ხშირია, გაუგებრობა — ადვილი.'],
 'Ma-Ma':['ორი მარსი ჰარმონიაში — ერთ ტემპში მოქმედებენ, ერთად საქმე და სპორტი კარგად გამოსდით.',
   'ორი მარსი დაძაბულ ასპექტში — ორი ცეცხლი: კონკურენცია, მოუთმენლობა და ჩხუბი; ენერგიას საერთო მიზანი სჭირდება.'],
 'Su-Ma':['მზე და მარსი — ენერგია და ერთმანეთის გააქტიურება; ერთად ბევრს აკეთებენ, მიზიდულობა ცოცხალია.',
   'მზე და მარსი დაძაბულ ასპექტში — ერთი მეორეს აღიზიანებს და აჩქარებს; ვნება და კონფლიქტი ერთად მოდის.'],
 'Mo-Ma':['მთვარე და მარსი — ვნება და დაცვის განცდა; მარსი ააქტიურებს, მთვარე ემოციურად პასუხობს.',
   'მთვარე და მარსი დაძაბულ ასპექტში — მარსის სიმკაცრე მთვარეს ადვილად აწყენინებს; ემოციები სწრაფად იფეთქებს.'],
 'Ve-Sa':['ვენერა და სატურნი — ერთგულება და სერიოზული განზრახვა. კავშირი ნელა იწყება, მაგრამ მყარია და დროს უძლებს.',
   'ვენერა და სატურნი დაძაბულ ასპექტში — სიყვარულში სიცივე, კრიტიკა ან შეზღუდვის განცდა; ვალდებულება არის, სითბო — ნაკლები.'],
 'Mo-Sa':['მთვარე და სატურნი — სტაბილურობა და ზრუნვა; სატურნი იცავს, მთვარე თავს უსაფრთხოდ გრძნობს.',
   'მთვარე და სატურნი დაძაბულ ასპექტში — მთვარის პატრონი თავს უარყოფილად ან შებოჭილად გრძნობს; სატურნი ემოციებს „აცივებს“.'],
 'Su-Sa':['მზე და სატურნი — პასუხისმგებლობა და ხანგრძლივობა; სატურნი მზეს სტრუქტურას აძლევს, მზე სატურნს — სითბოს.',
   'მზე და სატურნი დაძაბულ ასპექტში — სატურნი მზეს ზღუდავს და აკრიტიკებს; კავშირი გრძელია, მაგრამ მძიმე.'],
 'Ve-Pl':['ვენერა და პლუტონი — ღრმა, მაგნეტური, ბედისწერისეული მიზიდულობა; სიყვარული, რომელიც ცვლის.',
   'ვენერა და პლუტონი დაძაბულ ასპექტში — ვნებიანი მიჯაჭვულობა, ეჭვიანობა და ძალაუფლების თამაშები.'],
 'Ma-Pl':['მარსი და პლუტონი — ძლიერი სექსუალური და ენერგეტიკული კავშირი; ერთად დიდ ძალას ქმნიან.',
   'მარსი და პლუტონი დაძაბულ ასპექტში — ძალაუფლების ბრძოლა; ვნება და კონფლიქტი ძალიან ინტენსიურია.'],
 'Su-Pl':['მზე და პლუტონი — ტრანსფორმაცია; კავშირი ორივეს ღრმად ცვლის.','მზე და პლუტონი დაძაბულ ასპექტში — კონტროლის სურვილი; ერთი მეორეზე ზეწოლას ახდენს.'],
 'Mo-Pl':['მთვარე და პლუტონი — ემოციური სიღრმე და ინტიმურობა.','მთვარე და პლუტონი დაძაბულ ასპექტში — ემოციური ინტენსივობა, ეჭვიანობა და დამოკიდებულება.'],
 'Ve-Ne':['ვენერა და ნეპტუნი — რომანტიკა, პოეზია და სულიერი სიყვარული; „სულიერი მეწყვილის“ განცდა.',
   'ვენერა და ნეპტუნი დაძაბულ ასპექტში — იდეალიზაცია და ილუზიები; ვარდისფერი სათვალე, რომელიც ერთ დღეს იხსნება.'],
 'Mo-Ne':['მთვარე და ნეპტუნი — ემოციური თანაგრძნობა და ინტუიციური კავშირი.','მთვარე და ნეპტუნი დაძაბულ ასპექტში — გაუგებრობა, ბუნდოვანი მოლოდინები და ემოციური დაბნეულობა.'],
 'Ve-Ur':['ვენერა და ურანი — ელექტრული მიზიდულობა და სიახლე; ურთიერთობა არასოდეს მოსაწყენია.',
   'ვენერა და ურანი დაძაბულ ასპექტში — მოულოდნელი ცეცხლი და მოულოდნელი გაცივება; თავისუფლება სიახლოვეზე მნიშვნელოვანი ხდება.'],
 'Ju-Su':['იუპიტერი და მზე — მხარდაჭერა, ოპტიმიზმი და ერთმანეთის ზრდა.','იუპიტერი და მზე დაძაბულ ასპექტში — გადაჭარბებული მოლოდინები; კარგია, მაგრამ ზომიერება სჭირდება.'],
 'Ju-Mo':['იუპიტერი და მთვარე — სიუხვე და ემოციური გულუხვობა; ერთმანეთთან კარგად და დაცულად გრძნობენ თავს.','იუპიტერი და მთვარე დაძაბულ ასპექტში — ემოციური გადაჭარბება; ბევრი დაპირება, ცოტა საზღვარი.'],
 'Ju-Ve':['იუპიტერი და ვენერა — „ბედნიერი“ ასპექტი: სიხარული, საჩუქრები და გულუხვი სიყვარული.','იუპიტერი და ვენერა დაძაბულ ასპექტში — სიამოვნებასა და ფულში გადაჭარბება.'],
 'No-Su':['კვანძი და მზე — ბედისწერის შეხვედრის განცდა; ერთმანეთს ცხოვრების გზაზე ეხმარებიან.','კვანძი და მზე დაძაბულ ასპექტში — კარმული გაკვეთილი; კავშირი ორივეს ზრდას აიძულებს.'],
 'No-Mo':['კვანძი და მთვარე — „ნაცნობის“ განცდა თითქოს წარსულიდან; ძლიერი ემოციური მიჯაჭვულობა.','კვანძი და მთვარე დაძაბულ ასპექტში — ძველი ემოციური ნიმუშები მეორდება; მათი გაცნობიერებაა საჭირო.'],
 'No-Ve':['კვანძი და ვენერა — კარმული სიყვარული; ურთიერთობა ბედისწერისეულად იგრძნობა.','კვანძი და ვენერა დაძაბულ ასპექტში — სიყვარული, რომელიც გაკვეთილად იქცევა.'],
 'AC-Su':['მზე ასცენდენტზე — პირველივე შეხვედრიდან ძლიერი მიზიდულობა და „ცნობა“.','მზე ასცენდენტთან დაძაბულად — ერთის ხასიათი მეორის თვითგამოხატვას ეჯახება.'],
 'AC-Mo':['მთვარე ასცენდენტზე — ემოციური სიახლოვე და ბუნებრივი კომფორტი.','მთვარე ასცენდენტთან დაძაბულად — ემოციური რეაქციები ერთმანეთის ქცევაზე.'],
 'AC-Ve':['ვენერა ასცენდენტზე — ერთს მეორის გარეგნობა და მანერა ძალიან მოსწონს; ფიზიკური მიმზიდველობა.','ვენერა ასცენდენტთან დაძაბულად — მიზიდულობა არის, მაგრამ გემოვნებისა და სტილის განსხვავება ხშირია.'],
 'AC-Ma':['მარსი ასცენდენტზე — ძლიერი ფიზიკური მიზიდულობა და ენერგია.','მარსი ასცენდენტთან დაძაბულად — გაღიზიანება და კონკურენცია პირველივე კონტაქტიდან.']};
/* house meanings in a relationship */
const HM=['','პიროვნება, გარეგნობა და თვითშეგრძნება','ფული, ფასეულობები და მატერიალური უსაფრთხოება','საუბარი, აზროვნება და ყოველდღიური კონტაქტი','სახლი, ოჯახი და ემოციური ფესვები',
 'რომანტიკა, სიამოვნება, შემოქმედება და ბავშვები','ყოველდღიური ცხოვრება, საქმე და ჯანმრთელობა','პარტნიორობა და ქორწინება','ინტიმურობა, სიღრმე და საერთო რესურსები',
 'მსოფლმხედველობა, მოგზაურობა და სწავლა','კარიერა, სტატუსი და საზოგადოებრივი სახე','მეგობრობა, იმედები და საერთო მიზნები','ფარული სამყარო, საიდუმლოებები და სულიერი კავშირი'];
const OVL=['Su','Mo','Me','Ve','Ma','Ju','Sa'];
const EPAIR={'00':'ორივე ცეცხლი — ენთუზიაზმი, ვნება და ერთი ტემპი; ორი ლიდერი.','11':'ორივე მიწა — საიმედოობა, პრაქტიკულობა და სტაბილურობა.','22':'ორივე ჰაერი — გონებრივი კავშირი, საუბარი და თავისუფლება.','33':'ორივე წყალი — ემოციური სიღრმე და ინტუიციური გაგება.',
 '01':'ცეცხლი + მიწა — ერთი იწყებს, მეორე ასრულებს; ტემპი განსხვავდება.','02':'ცეცხლი + ჰაერი — ჰაერი ცეცხლს აღვივებს: იდეები და მოქმედება ერთად.','03':'ცეცხლი + წყალი — ორთქლი: ვნება და ემოცია, მაგრამ ერთი მეორეს ადვილად აქრობს.',
 '12':'მიწა + ჰაერი — პრაქტიკა და იდეები; ერთმანეთის ენის სწავლა სჭირდებათ.','13':'მიწა + წყალი — ნაყოფიერი ნიადაგი: ზრუნვა და სტაბილურობა.','23':'ჰაერი + წყალი — გონება და გრძნობა; ერთი ხსნის, მეორე გრძნობს.'};
const ESC={'00':2,'11':2,'22':2,'33':2,'02':2,'13':2,'01':0,'23':0,'03':-1,'12':-1};

function pos(d,k){
  if(k==='AC')return d.asc!=null&&!d._timeUnknown?n360(+d.asc):null;
  if(k==='MC')return d.mc!=null&&!d._timeUnknown?n360(+d.mc):null;
  const p=d.planets&&d.planets[BD[k][0]];return p&&isFinite(+p.degree)?n360(+p.degree):null;
}
function houseOf(l,c){for(let i=0;i<12;i++){const a=+c[i],b=+c[(i+1)%12],w=n360(b-a);if(n360(l-a)<w)return i+1;}return 1;}
const pairKey=(a,b)=>{const o=KEYS.indexOf(a)<=KEYS.indexOf(b)?[a,b]:[b,a];const k=o.join('-');return PW[k]||NOTE[k]?k:([o[1],o[0]].join('-'));};

function cross(d1,d2){
  const out=[];
  for(const a of KEYS)for(const b of KEYS){
    if((a==='MC'&&b==='MC')||(a==='No'&&b==='No'))continue;
    const x=pos(d1,a),y=pos(d2,b);if(x==null||y==null)continue;
    const orb=Math.min(BD[a][4],BD[b][4]),sep=angd(x,y);
    for(const [ang,sym,nm,nat] of AS){const o=Math.abs(sep-ang);if(o<=orb){
      const tight=1-o/orb*0.6,w=BD[a][5]*BD[b][5]*tight;
      out.push({a,b,ang,sym,nm,nat,orb:o,w,key:pairKey(a,b)});break;}}
  }
  return out.sort((p,q)=>q.w-p.w);
}
function score(asps,d1,d2){
  const s=[0,0,0,0,0];
  for(const x of asps){const P=PW[x.key];if(!P)continue;
    const hard=HARD.has(x.a)||HARD.has(x.b);
    let sign=x.nat>0?1:x.nat<0?-0.75:(hard?0.35:1);       /* hard conjunctions are mixed */
    if(x.key==='Ve-Ma'||x.key==='Ma-Pl'||x.key==='Ve-Pl'){P.forEach((v,i)=>{if(i===1)s[i]+=v*Math.abs(sign)*x.w*0.12;else s[i]+=v*sign*x.w*0.12;});continue;}
    P.forEach((v,i)=>s[i]+=v*sign*x.w*0.12);
  }
  /* elements of the lights */
  const e=k=>{const p=pos(k[0],k[1]);return p==null?null:el(Math.floor(p/30));};
  for(const [p,q] of [[[d1,'Su'],[d2,'Mo']],[[d1,'Mo'],[d2,'Su']],[[d1,'Ve'],[d2,'Ma']],[[d1,'Ma'],[d2,'Ve']],[[d1,'Mo'],[d2,'Mo']]]){
    const a=e(p),b=e(q);if(a==null||b==null)continue;const v=ESC[[a,b].sort().join('')]||0;s[0]+=v*0.8;s[3]+=v*0.6;s[1]+=v*0.4;}
  return s.map(v=>Math.max(15,Math.min(98,Math.round(52+v*2.2))));
}
const verdict=t=>t>=82?'✦ ძალიან ძლიერი კავშირი':t>=70?'კარგი თავსებადობა':t>=58?'საშუალო — ბევრი შრომით მიღწეული ჰარმონია':t>=46?'რთული, მაგრამ ზრდის მომტანი':'დიდი განსხვავებები';
function aspText(x,n1,n2){
  const A=BD[x.a],B=BD[x.b],nt=NOTE[x.key];
  const who=`<b>${gen(n1)} ${A[2]}</b> ${x.sym} <b>${gen(n2)} ${B[2]}</b>`;
  let body;
  if(nt)body=nt[x.nat<0?1:0];
  else body=`${gen(n1)} ${A[2]} (${A[3]}) და ${gen(n2)} ${B[2]} (${B[3]}) — ${ASPTXT[x.ang]}.`;
  if(nt&&x.nat===0&&(HARD.has(x.a)||HARD.has(x.b)))body+=' შეერთება აქ ორმაგია: ძლიერი, მაგრამ ერთდროულად სასიამოვნოც და რთულიც.';
  return {who,body};
}
/* Georgian genitive of a name: ანა → ანას, გიო → გიოს, გიორგი → გიორგის, ნიკ → ნიკის */
function gen(n){const t=n.trim(),c=t.slice(-1);if('აეოუი'.includes(c))return t+'ს';return t+'ის';}
function signArticle(d1,d2,ga,gb){
  const pa=pos(d1,'Su'),pb=pos(d2,'Su');if(pa==null||pb==null)return '';
  return signArticleBy(Math.floor(pa/30),ga,Math.floor(pb/30),gb,true);
}
/* the article for two signs (0 = ♈ … 11 = ♓) and genders 'm'/'f' — also used by the ნიშნების შეთავსება tab */
function signArticleBy(a,ga,b,gb,fromCharts){
  const C=window._compat;if(!C)return '';
  const R=C.compute(a,ga,b,gb),PA=C.GEN[ga].P[a],PB=C.GEN[gb].P[b],S=C.S;
  const lab=(i,g)=>`<span style="font-family:serif;color:${C.ELC[C.el(i)]}">${C.G(S[i].g)}</span> ${S[i].n} <span style="color:${g==='m'?'#9cc4f4':'#f4a8cc'}">${C.GEN[g].w}</span>`;
  const na=S[a].n+' '+C.GEN[ga].w,nb=S[b].n+' '+C.GEN[gb].w;
  return `<div class="sx-card"><div class="sx-h">☉ მზის ნიშნების თავსებადობა</div>
   <div class="sx-ttl">${lab(a,ga)} &nbsp;+&nbsp; ${lab(b,gb)} <span class="sx-orb">${R.tot}% · ${C.verdict(R.tot)}</span></div>
   <div class="sx-desc">
     <p>${R.pr[1]}</p>
     <p><b>${na}</b> — ${PA[0]} <b>${nb}</b> — ${PB[0]}</p>
     <p>${na} ამ ურთიერთობაში აძლევს ${PA[1]} და პარტნიორისგან ელის ${PA[2]}. ${nb} კი აძლევს ${PB[1]} და ელის ${PB[2]}.</p>
     <p>${R.A[1]} ${C.ELP[R.ek].replace(/^[^:]+:\s*/,'')} ${C.MOP[R.mk]}</p>
     <p>${R.pol}</p>
     <p>რას უნდა გაუფრთხილდნენ: ${S[a].n} ${C.GEN[ga].gen} მხრიდან — ${PA[3]}, ${S[b].n} ${C.GEN[gb].gen} მხრიდან — ${PB[3]}. ${R.A[2]}</p>
   </div>
   <div class="sx-tth">✦ წყვილის ტაროს ბარათი</div>${C.tarotBlock(a,ga,b,gb)}
   ${fromCharts?'<div class="sx-sub" style="margin-top:10px">მზის ნიშნების ტექსტი (ნიშნების შეთავსება). ქვემოთ — სრული რუკების სინასტრია.</div>':''}</div>`;
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(d1,d2,n1,n2,host,g1,g2){
  n1=esc(n1||'პირველი');n2=esc(n2||'მეორე');
  /* every body of the first chart against every body of the second: (a of 1, b of 2) and (b of 1, a of 2) are both in */
  const asps=cross(d1,d2).map(x=>({...x,dir:1}));
  const sc=score(asps,d1,d2),tot=Math.round((sc[0]*1.3+sc[1]+sc[2]+sc[3]*1.3+sc[4])/5.6);
  const harm=asps.filter(x=>x.nat>0).length,tense=asps.filter(x=>x.nat<0).length,conj=asps.filter(x=>x.nat===0).length;
  let h=`<div class="sx-card"><div class="sx-title">💞 თავსებადობა · ${n1} &amp; ${n2}</div>
  <div class="sx-top"><div class="sx-big">${tot}%</div><div><div class="sx-ver">${verdict(tot)}</div>
  <div class="sx-sub">ჯვარედინი ასპექტები: ${asps.length} · ჰარმონიული ${harm} · დაძაბული ${tense} · შეერთება ${conj}</div></div></div>
  <div class="sx-bars">${CAT.map((c,i)=>`<div class="sx-bar"><span>${c}</span><div><i style="width:${sc[i]}%;background:${CATC[i]}"></i></div><b style="color:${CATC[i]}">${sc[i]}%</b></div>`).join('')}</div></div>`;
  /* the sign-pair article (same texts as შეთავსება / compat.html) for the two Sun signs */
  h+=signArticle(d1,d2,g1||'m',g2||'f');
  /* big four by sign */
  const row=k=>{const a=pos(d1,k),b=pos(d2,k);if(a==null||b==null)return '';const sa=Math.floor(a/30),sb=Math.floor(b/30),ek=[el(sa),el(sb)].sort().join('');
    return `<tr><td>${BD[k][1]}︎ ${BD[k][2]}</td><td>${SGG[sa]} ${SG[sa]}</td><td>${SGG[sb]} ${SG[sb]}</td><td>${EPAIR[ek]}</td></tr>`;};
  h+=`<div class="sx-card"><div class="sx-h">ნიშნები და სტიქიები</div><div class="sx-tw"><table class="sx-t"><tr><th></th><th>${n1}</th><th>${n2}</th><th>რას ნიშნავს</th></tr>${['Su','Mo','Ve','Ma','Me','AC'].map(row).join('')}</table></div></div>`;
  /* aspects */
  const top=asps.slice(0,40);
  h+=`<div class="sx-card"><div class="sx-h">ასპექტები ერთმანეთის რუკებს შორის · ძლიერი პირველი</div>`+
    (top.length?top.map(x=>{const [p,q]=x.dir===1?[n1,n2]:[n2,n1];const t=aspText(x,p,q);const col=x.nat>0?'#7fcf8f':x.nat<0?'#e8907a':'#e8c95a';
      return `<div class="sx-a"><div class="sx-ah"><span style="color:${col}">${x.sym}</span> ${t.who} <span class="sx-orb">${x.nm} · ${x.orb.toFixed(1)}°</span></div><div class="sx-ab">${t.body}</div></div>`;}).join('')
     :'<div class="sx-sub">მნიშვნელოვანი ასპექტები ვერ მოიძებნა.</div>')+`</div>`;
  /* house overlays */
  const ovl=(dA,dB,nA,nB)=>{const c=(dB.houses||[]).map(Number);if(c.length!==12||dB._timeUnknown)return '';
    return OVL.map(k=>{const p=pos(dA,k);if(p==null)return '';const hh=houseOf(p,c);
      return `<div class="sx-o"><b>${gen(nA)} ${BD[k][1]}︎ ${BD[k][2]}</b> → ${gen(nB)} <b>${ROM[hh]}</b> სახლში: ${BD[k][3]} შემოდის ${gen(nB)} სფეროში — ${HM[hh]}.</div>`;}).join('');};
  h+=`<div class="sx-card"><div class="sx-h">სახლების გადაფარვა — ვის პლანეტა სად „სახლდება“</div><div class="sx-cols"><div>${ovl(d1,d2,n1,n2)}</div><div>${ovl(d2,d1,n2,n1)}</div></div>
    <div class="sx-sub" style="margin-top:8px">განსაკუთრებით მნიშვნელოვანია პარტნიორის ☉ ☽ ♀ ♂ თქვენს I, V, VII და VIII სახლში.</div></div>`;
  host.innerHTML=h;
}
const CSS=`
#cx-host{display:grid;gap:14px}
.sx-card{background:rgba(17,26,46,.55);border:1px solid rgba(184,137,74,.3);border-radius:3px;padding:16px 18px}
.sx-title{font-family:Cinzel,'Noto Serif Georgian',serif;letter-spacing:2px;color:#E3BE84;font-size:14px;margin-bottom:12px}
.sx-h{font-family:Cinzel,'Noto Serif Georgian',serif;letter-spacing:2px;color:rgba(227,190,132,.85);font-size:12px;margin-bottom:10px}
.sx-top{display:flex;gap:18px;align-items:center;margin-bottom:12px}
.sx-big{font-family:Cinzel,serif;font-size:42px;color:#F3DDA4;line-height:1}
.sx-ver{font-size:16px;color:#EDE6D8}.sx-sub{font-size:12px;color:rgba(188,192,202,.75);margin-top:4px;line-height:1.5}
.sx-bars{display:grid;gap:7px}
.sx-bar{display:grid;grid-template-columns:190px 1fr 48px;gap:10px;align-items:center;font-size:13px;color:#d8d2c4}
.sx-bar>div{height:8px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden}.sx-bar i{display:block;height:100%;border-radius:4px}
.sx-bar b{text-align:right;font-weight:500}
.sx-tw{overflow-x:auto}.sx-t{width:100%;border-collapse:collapse;font-size:13px}
.sx-t th{font-weight:400;color:rgba(227,190,132,.75);text-align:left;padding:6px 8px;border-bottom:1px solid rgba(184,137,74,.25)}
.sx-t td{padding:7px 8px;border-bottom:1px solid rgba(255,255,255,.05);color:#e2dccf;vertical-align:top}
.sx-a{padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.sx-ah{font-size:13.5px;color:#EDE6D8}.sx-ah b{font-weight:600;color:#F0E2BC}
.sx-orb{font-size:11px;color:rgba(188,192,202,.6);margin-left:6px}
.sx-ab{font-size:13px;color:rgba(226,220,207,.86);line-height:1.6;margin-top:3px}
.sx-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.sx-o{font-size:13px;color:rgba(226,220,207,.86);line-height:1.55;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.sx-o b{color:#F0E2BC;font-weight:600}
.sx-ttl{font-size:19px;line-height:1.5;margin-bottom:12px;color:#EDE6D8}
.sx-desc p{font-size:14.5px;line-height:1.9;color:#ddd6c6;margin-bottom:12px;text-indent:1.4em}
.sx-desc p:first-child{text-indent:0;color:#F0D48A;font-size:15.5px}
.sx-desc b{font-weight:600;color:#F0D48A}
.sx-tth{font-family:Cinzel,serif;font-size:10px;letter-spacing:3px;color:#C9A24C;text-align:center;margin:18px 0 12px;border-top:1px solid rgba(201,168,76,.15);padding-top:16px}
:is(#cx-host,#zc-res) .tarot{display:flex;gap:18px;align-items:flex-start}
:is(#cx-host,#zc-res) .tarot .tc{flex:0 0 120px}
:is(#cx-host,#zc-res) .tarot .tc img{width:120px;border-radius:8px;border:1px solid rgba(201,168,76,.35);box-shadow:0 6px 24px rgba(0,0,0,.5)}
:is(#cx-host,#zc-res) .tarot .tn{font-size:17px;color:#F0D48A}
:is(#cx-host,#zc-res) .tarot .tn span{font-size:13px;color:#f0a080}
:is(#cx-host,#zc-res) .tarot .tk{font-size:12px;color:#C9A24C;margin:4px 0 8px;opacity:.85}
:is(#cx-host,#zc-res) .tarot p{font-size:14px;line-height:1.85;color:#ddd6c6}
:is(#cx-host,#zc-res) .tarot .tw{font-size:11.5px;color:rgba(188,192,202,.7);margin-top:8px;line-height:1.7}
@media(max-width:560px){:is(#cx-host,#zc-res) .tarot{flex-direction:column;align-items:center;text-align:center}}
@media(max-width:700px){.sx-cols{grid-template-columns:1fr}.sx-bar{grid-template-columns:120px 1fr 42px;font-size:12px}}`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
window._synText={render,cross,score,signArticleBy};
})();
