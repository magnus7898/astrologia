/* famous.js — „ცნობილი ადამიანები“: famous natal charts for astro.html.
   Self-injecting: adds a picker to the natal form (#form-natal). Choosing a person fills
   name, date, time, place, coordinates and zone, and draws the chart with generate().
   Data: birth records as published in astrological data collections (Astro-Databank style)
   with their Rodden rating — AA birth certificate / record · A from the person or family ·
   B biography · C unverified · X date only (time unknown → the chart is drawn for noon,
   „დრო უცნობია“ is ticked).
   Each row: [Georgian name, Latin name, y, m, d, h, min, UTC offset (h, null = time unknown),
              lat, lon, place, rating, group]
   Offsets are the clock in force at the birth place: a whole-hour offset is sent as an
   Etc/GMT zone with the local time; a local-mean-time (LMT) birth is converted to UT.   */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const P=[
 /* ── საქართველო ── */
 ['ილია ჭავჭავაძე','Ilia Chavchavadze',1837,11,8,12,0,null,41.95,45.81,'ყვარელი','X','ge'],
 ['ვაჟა-ფშაველა','Vazha-Pshavela',1861,7,26,12,0,null,42.18,44.95,'ჩარგალი','X','ge'],
 ['გალაკტიონ ტაბიძე','Galaktion Tabidze',1891,11,17,12,0,null,42.08,42.58,'ჭყვიში','X','ge'],
 ['იოსებ სტალინი','Joseph Stalin',1878,12,18,12,0,null,41.98,44.11,'გორი','X','ge'],
 ['სერგო ფარაჯანოვი','Sergei Parajanov',1924,1,9,12,0,null,41.72,44.79,'თბილისი','X','ge'],
 ['ედუარდ შევარდნაძე','Eduard Shevardnadze',1928,1,25,12,0,null,42.07,42.03,'მამათი','X','ge'],
 ['მერაბ მამარდაშვილი','Merab Mamardashvili',1930,9,15,12,0,null,41.98,44.11,'გორი','X','ge'],
 ['ზურაბ წერეთელი','Zurab Tsereteli',1934,1,4,12,0,null,41.72,44.79,'თბილისი','X','ge'],
 ['ოთარ იოსელიანი','Otar Iosseliani',1934,2,2,12,0,null,41.72,44.79,'თბილისი','X','ge'],
 ['გია ყანჩელი','Giya Kancheli',1935,8,10,12,0,null,41.72,44.79,'თბილისი','X','ge'],
 ['კახა კალაძე','Kakha Kaladze',1978,2,27,12,0,null,42.16,42.34,'სამტრედია','X','ge'],
 ['ხვიჩა კვარაცხელია','Khvicha Kvaratskhelia',2001,2,12,12,0,null,41.72,44.79,'თბილისი','X','ge'],
 /* ── მეცნიერება, აზროვნება ── */
 ['ალბერტ აინშტაინი','Albert Einstein',1879,3,14,11,30,'L',48.40,9.99,'Ulm','AA','sci'],
 ['ნიკოლა ტესლა','Nikola Tesla',1856,7,10,0,0,'L',44.57,15.32,'Smiljan','A','sci'],
 ['მარი კიური','Marie Curie',1867,11,7,12,0,null,52.23,21.01,'Warsaw','X','sci'],
 ['ზიგმუნდ ფროიდი','Sigmund Freud',1856,5,6,18,30,'L',49.64,18.14,'Příbor','AA','sci'],
 ['კარლ გუსტავ იუნგი','Carl Gustav Jung',1875,7,26,19,32,'L',47.60,9.32,'Kesswil','C','sci'],
 ['კარლ მარქსი','Karl Marx',1818,5,5,2,0,'L',49.75,6.64,'Trier','AA','sci'],
 ['ფრიდრიხ ნიცშე','Friedrich Nietzsche',1844,10,15,10,0,'L',51.24,12.12,'Röcken','AA','sci'],
 ['ნილ არმსტრონგი','Neil Armstrong',1930,8,5,0,31,-5,40.57,-84.19,'Wapakoneta','A','sci'],
 ['იური გაგარინი','Yuri Gagarin',1934,3,9,12,0,null,55.88,34.97,'Klushino','X','sci'],
 ['სტივ ჯობსი','Steve Jobs',1955,2,24,19,15,-8,37.77,-122.42,'San Francisco','AA','sci'],
 ['ბილ გეითსი','Bill Gates',1955,10,28,22,0,-8,47.61,-122.33,'Seattle','A','sci'],
 ['ალისტერ კროული','Aleister Crowley',1875,10,12,23,42,'L',52.29,-1.53,'Leamington','A','sci'],
 /* ── ხელოვნება, ლიტერატურა ── */
 ['ვოლფგანგ ამადეუს მოცარტი','Wolfgang Amadeus Mozart',1756,1,27,20,0,'L',47.80,13.04,'Salzburg','AA','art'],
 ['იოჰან ვოლფგანგ გოეთე','Johann Wolfgang von Goethe',1749,8,28,12,0,'L',50.11,8.68,'Frankfurt','AA','art'],
 ['რიხარდ ვაგნერი','Richard Wagner',1813,5,22,4,0,'L',51.34,12.37,'Leipzig','AA','art'],
 ['ლორდ ბაირონი','Lord Byron',1788,1,22,14,0,'L',51.51,-0.19,'London','AA','art'],
 ['ჰანს ქრისტიან ანდერსენი','Hans Christian Andersen',1805,4,2,1,0,'L',55.40,10.39,'Odense','AA','art'],
 ['ჟიულ ვერნი','Jules Verne',1828,2,8,12,0,'L',47.22,-1.55,'Nantes','AA','art'],
 ['ოსკარ უაილდი','Oscar Wilde',1854,10,16,3,0,'L',53.35,-6.26,'Dublin','C','art'],
 ['ვინსენტ ვან გოგი','Vincent van Gogh',1853,3,30,11,0,'L',51.47,4.66,'Zundert','AA','art'],
 ['პაბლო პიკასო','Pablo Picasso',1881,10,25,23,15,'L',36.72,-4.42,'Málaga','AA','art'],
 ['სალვადორ დალი','Salvador Dalí',1904,5,11,8,45,0,42.27,2.96,'Figueres','AA','art'],
 ['ფრიდა კალო','Frida Kahlo',1907,7,6,8,30,'L',19.35,-99.16,'Coyoacán','A','art'],
 ['ერნესტ ჰემინგუეი','Ernest Hemingway',1899,7,21,8,0,-6,41.89,-87.78,'Oak Park','AA','art'],
 ['უოლტ დისნეი','Walt Disney',1901,12,5,0,35,-6,41.88,-87.63,'Chicago','AA','art'],
 /* ── კინო ── */
 ['ჩარლი ჩაპლინი','Charlie Chaplin',1889,4,16,20,0,0,51.50,-0.12,'London','A','film'],
 ['გრეტა გარბო','Greta Garbo',1905,9,18,19,30,1,59.33,18.07,'Stockholm','AA','film'],
 ['მარლონ ბრანდო','Marlon Brando',1924,4,3,23,0,-6,41.26,-95.94,'Omaha','AA','film'],
 ['მერილინ მონრო','Marilyn Monroe',1926,6,1,9,30,-8,34.05,-118.24,'Los Angeles','AA','film'],
 ['გრეის კელი','Grace Kelly',1929,11,12,5,31,-5,39.95,-75.17,'Philadelphia','AA','film'],
 ['კლინტ ისტვუდი','Clint Eastwood',1930,5,31,17,35,-8,37.77,-122.42,'San Francisco','AA','film'],
 ['ჯეიმს დინი','James Dean',1931,2,8,2,0,-6,40.56,-85.66,'Marion, Indiana','AA','film'],
 ['სოფი ლორენი','Sophia Loren',1934,9,20,14,10,1,41.90,12.50,'Rome','AA','film'],
 ['მერილ სტრიპი','Meryl Streep',1949,6,22,8,5,-4,40.72,-74.36,'Summit, NJ','AA','film'],
 ['რობინ უილიამსი','Robin Williams',1951,7,21,13,34,-5,41.88,-87.63,'Chicago','AA','film'],
 ['ტომ კრუზი','Tom Cruise',1962,7,3,15,6,-4,43.05,-76.15,'Syracuse','AA','film'],
 ['ბრედ პიტი','Brad Pitt',1963,12,18,6,31,-6,35.33,-96.93,'Shawnee','AA','film'],
 ['ლეონარდო დი კაპრიო','Leonardo DiCaprio',1974,11,11,2,47,-8,34.05,-118.24,'Los Angeles','AA','film'],
 ['ანჯელინა ჯოლი','Angelina Jolie',1975,6,4,9,9,-7,34.05,-118.24,'Los Angeles','AA','film'],
 /* ── მუსიკა ── */
 ['ედით პიაფი','Édith Piaf',1915,12,19,5,0,0,48.86,2.35,'Paris','A','music'],
 ['ელვის პრესლი','Elvis Presley',1935,1,8,4,35,-6,34.26,-88.70,'Tupelo','AA','music'],
 ['ჯონ ლენონი','John Lennon',1940,10,9,18,30,1,53.41,-2.98,'Liverpool','A','music'],
 ['ბობ დილანი','Bob Dylan',1941,5,24,21,5,-6,46.79,-92.10,'Duluth','AA','music'],
 ['ჯიმი ჰენდრიქსი','Jimi Hendrix',1942,11,27,10,15,-7,47.61,-122.33,'Seattle','AA','music'],
 ['ჯენის ჯოპლინი','Janis Joplin',1943,1,19,9,45,-5,29.90,-93.93,'Port Arthur','AA','music'],
 ['ჯიმ მორისონი','Jim Morrison',1943,12,8,11,55,-4,28.08,-80.61,'Melbourne, Florida','AA','music'],
 ['დევიდ ბოუი','David Bowie',1947,1,8,9,0,0,51.46,-0.11,'London (Brixton)','AA','music'],
 ['კურტ კობეინი','Kurt Cobain',1967,2,20,19,20,-8,46.98,-123.82,'Aberdeen, WA','AA','music'],
 ['მადონა','Madonna',1958,8,16,7,5,-5,43.59,-83.89,'Bay City','AA','music'],
 ['პრინსი','Prince',1958,6,7,18,17,-5,44.98,-93.27,'Minneapolis','AA','music'],
 ['მაიკლ ჯექსონი','Michael Jackson',1958,8,29,19,33,-5,41.59,-87.35,'Gary, Indiana','C','music'],
 ['უიტნი ჰიუსტონი','Whitney Houston',1963,8,9,20,55,-4,40.74,-74.17,'Newark','AA','music'],
 ['ბრიტნი სპირსი','Britney Spears',1981,12,2,1,30,-6,31.24,-90.45,'McComb','AA','music'],
 ['ბიონსე','Beyoncé',1981,9,4,10,0,-5,29.76,-95.37,'Houston','C','music'],
 ['ლედი გაგა','Lady Gaga',1986,3,28,9,53,-5,40.71,-74.01,'New York','A','music'],
 ['რიანა','Rihanna',1988,2,20,8,50,-4,13.10,-59.62,'Saint Michael, Barbados','C','music'],
 ['ტეილორ სვიფტი','Taylor Swift',1989,12,13,5,17,-5,40.33,-75.95,'West Reading','C','music'],
 /* ── პოლიტიკა, ისტორია ── */
 ['ნაპოლეონ ბონაპარტი','Napoleon Bonaparte',1769,8,15,11,30,'L',41.92,8.74,'Ajaccio','A','pol'],
 ['დედოფალი ვიქტორია','Queen Victoria',1819,5,24,4,15,'L',51.50,-0.19,'London','AA','pol'],
 ['უინსტონ ჩერჩილი','Winston Churchill',1874,11,30,1,30,'L',51.84,-1.36,'Woodstock','AA','pol'],
 ['მაჰათმა განდი','Mahatma Gandhi',1869,10,2,7,12,'L',21.64,69.60,'Porbandar','A','pol'],
 ['შარლ დე გოლი','Charles de Gaulle',1890,11,22,4,0,'L',50.63,3.06,'Lille','AA','pol'],
 ['ადოლფ ჰიტლერი','Adolf Hitler',1889,4,20,18,30,'L',48.26,13.04,'Braunau am Inn','AA','pol'],
 ['ჯონ კენედი','John F. Kennedy',1917,5,29,15,0,-5,42.33,-71.12,'Brookline','AA','pol'],
 ['რონალდ რეიგანი','Ronald Reagan',1911,2,6,4,16,-6,41.63,-89.79,'Tampico, Illinois','AA','pol'],
 ['რიჩარდ ნიქსონი','Richard Nixon',1913,1,9,21,35,-8,33.89,-117.81,'Yorba Linda','AA','pol'],
 ['დედოფალი ელისაბედ II','Queen Elizabeth II',1926,4,21,2,40,1,51.51,-0.15,'London','AA','pol'],
 ['ბილ კლინტონი','Bill Clinton',1946,8,19,8,51,-6,33.67,-93.59,'Hope, Arkansas','A','pol'],
 ['დონალდ ტრამპი','Donald Trump',1946,6,14,10,54,-4,40.70,-73.79,'New York (Queens)','AA','pol'],
 ['ჩარლზ III','King Charles III',1948,11,14,21,14,0,51.50,-0.14,'London','AA','pol'],
 ['პრინცესა დაიანა','Princess Diana',1961,7,1,19,45,1,52.83,0.51,'Sandringham','A','pol'],
 ['ბარაკ ობამა','Barack Obama',1961,8,4,19,24,-10,21.31,-157.86,'Honolulu','AA','pol'],
 ['ნელსონ მანდელა','Nelson Mandela',1918,7,18,12,0,null,-31.92,28.60,'Mvezo','X','pol'],
 ['ოპრა უინფრი','Oprah Winfrey',1954,1,29,4,30,-6,33.06,-89.59,'Kosciusko','A','pol'],
 /* ── სპორტი ── */
 ['მუჰამედ ალი','Muhammad Ali',1942,1,17,18,35,-6,38.25,-85.76,'Louisville','AA','sport'],
 ['მაიკლ ჯორდანი','Michael Jordan',1963,2,17,13,40,-5,40.65,-73.95,'New York (Brooklyn)','A','sport'],
 ['აირტონ სენა','Ayrton Senna',1960,3,21,2,35,-3,-23.55,-46.63,'São Paulo','A','sport'],
 ['კრიშტიანუ რონალდუ','Cristiano Ronaldo',1985,2,5,12,0,null,32.65,-16.91,'Funchal','X','sport'],
 ['ლიონელ მესი','Lionel Messi',1987,6,24,12,0,null,-32.95,-60.64,'Rosario','X','sport'],
];
const GRP={ge:'საქართველო',sci:'მეცნიერება და აზროვნება',art:'ხელოვნება და ლიტერატურა',film:'კინო',music:'მუსიკა',pol:'პოლიტიკა და ისტორია',sport:'სპორტი'};
const RAT={AA:'AA — დაბადების მოწმობა / ჩანაწერი',A:'A — თავად ადამიანის ან ოჯახის ცნობით',B:'B — ბიოგრაფიიდან',C:'C — გადაუმოწმებელი, სიფრთხილით',X:'X — მხოლოდ თარიღი, დრო უცნობია'};
const pad=n=>String(n).padStart(2,'0');
const CSS=`
#fm-box{border:1px solid rgba(201,162,76,.28);border-radius:10px;padding:10px 12px;margin:0 0 12px;background:rgba(201,162,76,.05)}
#fm-box .fm-row{display:flex;gap:8px;align-items:center}
#fm-box select{flex:1 1 auto;min-width:0}
#fm-box .fm-n{font-size:11px;color:rgba(200,180,140,.75);line-height:1.6;margin-top:6px}
#fm-box .fm-n b{color:#E8C97A;font-weight:500}
#fm-box label{font-size:10px;letter-spacing:1.5px;color:#C9A24C;margin-bottom:5px;display:block}`;
/* UT of a local-mean-time birth (lon/15 hours east of Greenwich) */
function toUT(r){
  const off=r[7]==='L'?r[9]/15:r[7];
  const ms=Date.UTC(r[2],r[3]-1,r[4],r[5],r[6])-off*3600e3;
  const d=new Date(ms);
  return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),h:d.getUTCHours(),mi:d.getUTCMinutes(),s:d.getUTCSeconds()};
}
function fill(r){
  const set=(id,v)=>{const e=$(id);if(e)e.value=v;};
  const unknown=r[7]===null;let t,tz,note;
  if(unknown){t={y:r[2],m:r[3],d:r[4],h:12,mi:0,s:0};tz='UTC';note='დრო უცნობია — რუქა შუადღისთვისაა (მთვარე ±7°, სახლები და ასცენდენტი არ ითვლება)';}
  else if(r[7]==='L'){t=toUT(r);tz='UTC';const o=r[9]/15,oh=Math.floor(Math.abs(o)),om=Math.round((Math.abs(o)-oh)*60);
    note=`ადგილობრივი დრო <b>${pad(r[5])}:${pad(r[6])}</b> (ადგილობრივი მზის დრო, UT${o>=0?'+':'−'}${oh}:${pad(om)}) → ფორმაში <b>UT ${pad(t.h)}:${pad(t.mi)}</b>`;}
  else{t={y:r[2],m:r[3],d:r[4],h:r[5],mi:r[6],s:0};tz=r[7]===0?'UTC':'Etc/GMT'+(r[7]>0?'-':'+')+Math.abs(r[7]);
    note=`ადგილობრივი დრო <b>${pad(r[5])}:${pad(r[6])}</b> (UTC${r[7]>=0?'+':'−'}${Math.abs(r[7])})`;}
  set('n-name',r[0]);set('n-day',t.d);set('n-month',t.m);set('n-year',t.y);set('n-hour',t.h);set('n-minute',t.mi);set('n-second',t.s||0);
  set('n-city',r[10]);set('n-lat',(+r[8]).toFixed(4));set('n-lon',(+r[9]).toFixed(4));set('n-tz',tz);
  const tzd=$('n-tz-display');if(tzd)tzd.textContent='🕐 '+tz+' · 📍 '+r[10];
  const hint=$('n-city-hint');if(hint)hint.textContent='📍 '+r[10]+` (${(+r[8]).toFixed(2)}°, ${(+r[9]).toFixed(2)}°)`;
  const tu=$('n-time-unknown');if(tu){tu.checked=unknown;if(typeof window.toggleTU==='function')window.toggleTU('n');}
  $('fm-note').innerHTML=`<b>${r[0]}</b> · ${r[1]} · ${r[4]}.${pad(r[3])}.${r[2]} · ${r[10]}<br>${note}<br>რეიტინგი (როდენი): <b>${RAT[r[11]]}</b>`;
}
function inject(){
  const sec=$('form-natal');if(!sec||$('fm-box'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const box=document.createElement('div');box.id='fm-box';
  const opts=Object.keys(GRP).map(g=>`<optgroup label="${GRP[g]}">`+P.map((r,i)=>[r,i]).filter(([r])=>r[12]===g)
    .sort((a,b)=>a[0][0].localeCompare(b[0][0],'ka')).map(([r,i])=>`<option value="${i}">${r[0]} · ${r[2]}${r[7]===null?' (დრო უცნობია)':''}</option>`).join('')+'</optgroup>').join('');
  box.innerHTML=`<label>⭐ ცნობილი ადამიანის რუქა</label><div class="fm-row"><select id="fm-sel"><option value="">— აირჩიე (${P.length}) —</option>${opts}</select></div>
    <div class="fm-n" id="fm-note">არჩევისას ფორმა შეივსება და რუქა აიგება. ნაჩვენებია დაბადების დროის წყაროს რეიტინგიც.</div>`;
  const first=sec.querySelector('.field')||sec.firstElementChild;
  const lbl=sec.querySelector('.person-label');
  (lbl||first).insertAdjacentElement(lbl?'afterend':'beforebegin',box);
  $('fm-sel').onchange=()=>{const i=$('fm-sel').value;if(i==='')return;fill(P[+i]);
    if(typeof window.setMode==='function'&&!sec.classList.contains('active'))window.setMode('natal');
    if(typeof window.generate==='function')window.generate();};
}
window.FAMOUS=P;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else setTimeout(inject,0);
})();
