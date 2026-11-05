/* tarot_course.js — shared data for the Tarot lessons (MAGNUS). Card texts come from tarot_text.js (TAROT_TEXTS), images from tarot/.
   Numbering here follows the deck used on tarot.html (Rider–Waite: 8 = Strength, 11 = Justice). */
(function(){
'use strict';
const MAJ=[['სულელი','🜁 ჰაერი'],['მაგი','☿ მერკური'],['მღვდელქალი','☽ მთვარე'],['იმპერატრიცა','♀ ვენერა'],['იმპერატორი','♈ ვერძი'],['იეროფანტი','♉ კურო'],['შეყვარებულები','♊ ტყუპები'],['ეტლი','♋ კირჩხიბი'],['ძალა','♌ ლომი'],['განდეგილი','♍ ქალწული'],['ბედის ბორბალი','♃ იუპიტერი'],['სამართლიანობა','♎ სასწორი'],['ჩამოკიდებული','🜄 წყალი'],['სიკვდილი','♏ მორიელი'],['ზომიერება','♐ მშვილდოსანი'],['ეშმაკი','♑ თხის რქა'],['კოშკი','♂ მარსი'],['ვარსკვლავი','♒ მერწყული'],['მთვარე','♓ თევზები'],['მზე','☉ მზე'],['განსჯა','🜂 ცეცხლი'],['სამყარო','♄ სატურნი']];
const ROM=['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
const SUITS={wands:{ka:'კვერთხები',gen:'კვერთხების',el:'ცეცხლი',c:'#e8875a',sign:'ვერძი · ლომი · მშვილდოსანი',
   about:'ცეცხლის სტიქია — ნება, ენერგია, ვნება, შემოქმედება, კარიერული ამბიცია. კვერთხები მოგვითხრობს იმაზე, რისკენ მივისწრაფვით და როგორ ვმოქმედებთ.'},
 cups:{ka:'თასები',gen:'თასების',el:'წყალი',c:'#5aa8e8',sign:'კირჩხიბი · მორიელი · თევზები',
   about:'წყლის სტიქია — გრძნობები, სიყვარული, ურთიერთობები, ინტუიცია, ოცნებები. თასები გვიჩვენებს, რას ვგრძნობთ და როგორ გვიყვარს.'},
 swords:{ka:'მახვილები',gen:'მახვილების',el:'ჰაერი',c:'#b8c4d8',sign:'ტყუპები · სასწორი · მერწყული',
   about:'ჰაერის სტიქია — აზროვნება, სიტყვა, გადაწყვეტილებები, კონფლიქტები, სიმართლე. მახვილები ორპირია: გონება ჭრის ილუზიებსაც და გულსაც.'},
 pentacles:{ka:'პენტაკლები',gen:'პენტაკლების',el:'მიწა',c:'#8fc46a',sign:'კურო · ქალწული · თხის რქა',
   about:'მიწის სტიქია — ფული, სამსახური, სხეული, სახლი, მატერიალური სამყარო. პენტაკლები გვიჩვენებს, რას ვაშენებთ ხელშესახებად.'}};
const RANK=['','ტუზი','ორიანი','სამიანი','ოთხიანი','ხუთიანი','ექვსიანი','შვიდიანი','რვიანი','ცხრიანი','ათიანი','მხლებელი','რაინდი','დედოფალი','მეფე'];
/* numerology of the minor numbers — the same numbers 1–9 as in the Pythagorean square and the matrix */
const NUM={1:['დასაწყისი','სტიქიის სუფთა ძალა, თესლი, შესაძლებლობა. ტუზი — საჩუქარი, რომელიც ჯერ კიდევ უნდა გამოიყენო.'],
 2:['არჩევანი, წყვილი','ორი ძალის შეხვედრა: ბალანსი, პარტნიორობა, ან გადაწყვეტილების მოლოდინი.'],
 3:['ზრდა, პირველი შედეგი','ენერგია იწყებს გამოვლენას: შემოქმედება, გაფართოება, თანამშრომლობა.'],
 4:['სტაბილურობა','ფორმა და საფუძველი: უსაფრთხოება, შენარჩუნება, ზოგჯერ — გაყინულობა.'],
 5:['კრიზისი, გამოწვევა','სტაბილურობის რღვევა: კონფლიქტი, დანაკარგი, შეჯიბრი — ზრდის აუცილებელი ეტაპი.'],
 6:['ჰარმონია, აღდგენა','კრიზისის შემდეგ — ბალანსი: დახმარება, გაცვლა, გამარჯვება, წარსულთან შერიგება.'],
 7:['გამოცდა, შეფასება','შინაგანი გამოცდა: არჩევანი, სტრატეგია, მოთმინება, ილუზიების გარჩევა.'],
 8:['მოძრაობა, ოსტატობა','ძალა მოქმედებაში: სიჩქარე, შრომა, ცვლილება ან — შეზღუდვისგან გათავისუფლება.'],
 9:['კულმინაცია','სტიქია თითქმის სრულად გამოვლინდა: შედეგი, სიმარტოვე, დაღლილობა ან კმაყოფილება.'],
 10:['დასრულება, ახალი ციკლი','ციკლის ბოლო და მისი ნაყოფი — ან ტვირთი. 10 = 1 + 0: დასასრული უკვე ახალ დასაწყისს ატარებს.']};
const COURT={11:['მხლებელი','შეტყობინება, სწავლა, ცნობისმოყვარეობა — სტიქიის ახალგაზრდა, მოსწავლე ენერგია. ხშირად — ახალი ამბავი ან ახალგაზრდა ადამიანი.'],
 12:['რაინდი','მოძრაობა, ქმედება, ძიება — სტიქია მიზნისკენ მიმავალ მოძრაობაში. ზოგჯერ — უკიდურესობა.'],
 13:['დედოფალი','შინაგანი ოსტატობა, ზრუნვა, სიღრმე — სტიქიის მიმღები, მომწიფებული ფორმა.'],
 14:['მეფე','გარეგანი ავტორიტეტი, მართვა, პასუხისმგებლობა — სტიქიის აქტიური, სრულყოფილი ფორმა.']};
const img=(id)=>'tarot/'+encodeURIComponent(id)+'.jpg';
const majImg=n=>img(String(n)),minImg=(s,r)=>img(s+' '+r);
const T=()=>{try{return TAROT_TEXTS;}catch(e){return window.TAROT_TEXTS||{};}};
/* the matrix / birth-card numbering (Marseille): 8 = Justice, 11 = Strength, 22 = Fool */
const toMatrix=n=>n===0?22:n===8?11:n===11?8:n;
const fromMatrix=n=>n===22?0:n===8?11:n===11?8:n;
const CSS=`.tc{border:1px solid rgba(184,137,74,.35);border-radius:12px;padding:6px;background:none;cursor:pointer;text-align:center;color:inherit;font-family:inherit;transition:transform .15s,border-color .15s}
.tc:hover{transform:translateY(-2px);border-color:#E3BE84}.tc.on{border-color:#FFD36A;box-shadow:0 0 0 2px rgba(255,211,106,.35)}
.tc img{width:100%;aspect-ratio:7/12;object-fit:cover;border-radius:8px;display:block;background:#141a2c}
.tc .nm{font-size:12px;margin-top:5px;line-height:1.3;color:#EDE6D8}.tc .ro{font:600 11px Cinzel,serif;color:#B8894A}
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;margin-top:12px}
.tdet{margin-top:16px;border:1px solid rgba(184,137,74,.45);border-radius:16px;padding:18px;display:grid;grid-template-columns:180px 1fr;gap:18px;scroll-margin-top:12px}
@media(max-width:640px){.tdet{grid-template-columns:1fr}.tdet>img{max-width:200px;margin:0 auto}}
.tdet>img{width:100%;border-radius:12px;display:block}
.tdet h2{font-family:'Marcellus SC','Noto Serif Georgian',serif;font-weight:400;font-size:22px;color:#E3BE84}
.tdet .kw{font-size:13px;color:#aab2c4;margin-top:4px}
.tdet h3{font-weight:600;font-size:13px;color:#B8894A;margin:12px 0 3px;letter-spacing:.04em}
.tdet p{font-size:14px;line-height:1.8;color:#e2e5ec}.tdet a{color:#E3BE84}
.tdet .up{color:#8fd19a}.tdet .rv{color:#ff9a8a}`;
window.TC={MAJ,ROM,SUITS,RANK,NUM,COURT,majImg,minImg,T,toMatrix,fromMatrix,CSS};
})();
