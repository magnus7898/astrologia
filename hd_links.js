/* hd_links.js — clicking a type, authority, profile, definition, cross, centre, channel or gate in
   hd.html opens the matching text from the article editor (system "hd") in a new tab.
   Works by watching the rendered DOM, so natal, synastry and every redraw are covered.            */
(function(){
'use strict';
const TYPE={'მანიფესტორი':'Manifestor','გენერატორი':'Generator','მანიფ. გენერატორი':'Manifesting_Generator','მანიფესტირებადი გენერატორი':'Manifesting_Generator','პროექტორი':'Projector','რეფლექტორი':'Reflector',
  'Manifestor':'Manifestor','Generator':'Generator','Manifesting Generator':'Manifesting_Generator','Projector':'Projector','Reflector':'Reflector'};
const CEN={'გვირგვინი':'Head','თავი':'Head','აჯნა':'Ajna','ყელი':'Throat','G ცენტრი':'G','გული':'Heart','მზის წნული':'Solar_Plexus','ელენთა':'Spleen','საკრალური':'Sacral','ფუძე':'Root','ფესვი':'Root'};
const auth=s=>/ემოც|Emot/i.test(s)?'emo':/საკრალ|Sacral/i.test(s)?'sac':/სპლენ|ელენთ|Splen/i.test(s)?'spl':/თვით|Self/i.test(s)?'self':/ეგო|გულ|Ego|Heart/i.test(s)?'ego':/მთვარ|ლუნ|Lunar|Moon/i.test(s)?'moon':/მენტ|გარემ|Mental|Environ|None|არ არის/i.test(s)?'ment':null;
const defn=s=>/სამ|Triple/i.test(s)?3:/ოთხ|Quad/i.test(s)?4:/გაყოფ|Split/i.test(s)?2:/ერთ|Single/i.test(s)?1:/არ |None|ნულ/i.test(s)?0:null;
const cross=s=>/იუქსტ|მიმდებარე|Juxta/i.test(s)?'jx':/მარცხ|Left/i.test(s)?'left':/მარჯვ|Right/i.test(s)?'right':null;
const SENSE=['ყნოსვა','გემო','გარეგანი ხედვა','შინაგანი ხედვა','გრძნობა','შეხება'];
const VT={env:[['მღვიმეები','შერჩევითი','შერწყმული'],['ბაზრები','შიდა','გარე'],['სამზარეულოები','ნესტიანი','მშრალი'],['მთები','აქტიური','პასიური'],['ველები','ვიწრო','ფართო'],['სანაპიროები','ბუნებრივი','ხელოვნური']],
  dig:[['მადა','თანმიმდევრული','მონაცვლეობითი'],['გემო','ღია','დახურული'],['წყურვილი','ცხელი','ცივი'],['შეხება','მშვიდი','ნერვული'],['ხმა','მაღალი','დაბალი'],['სინათლე','პირდაპირი','არაპირდაპირი']],
  mot:[['შიში','კომუნალისტი','სეპარატისტი'],['იმედი','თეისტი','ანტითეისტი'],['სურვილი','ლიდერი','მიმდევარი'],['მოთხოვნილება','ოსტატი','ახალბედა'],['დანაშაული','კონდიციონერი','კონდიციონირებული'],['უმანკოება','ობსერვატორი','დამკვირვებელი']],
  per:[['გადარჩენა'],['შესაძლებლობა'],['ძალა'],['სურვილი'],['ალბათობა'],['პირადული']]};
function VARK(vk,v){const [b,s]=v.split(/\s*—\s*/);const L=VT[vk];const i=L.findIndex(r=>r[0]===(b||'').trim());if(i<0)return null;const side=vk==='per'?(/ფოკუს/.test(s||'')?'l':/პერიფ/.test(s||'')?'r':null):(L[i][1]===(s||'').trim()?'l':L[i][2]===(s||'').trim()?'r':null);return side?`${vk}:${i+1}:${side}`:null;}
const PK={'მზე':'Sun','დედამ.':'Earth','დედამიწა':'Earth','მთვარე':'Moon','ჩ.კვ.':'North_Node','ს.კვ.':'South_Node','მერკ.':'Mercury','ვენ.':'Venus','მარს.':'Mars','იუპ.':'Jupiter','სატ.':'Saturn','ურ.':'Uranus','ნეპ.':'Neptune','პლ.':'Pluto','ქირონი':'Chiron','ლილიტი':'Lilith','ასცენდენტი':'Ascendant'};
function openArt(keys,heads,title){window.open(`article.html?s=hd&k=${encodeURIComponent(keys.join(','))}&h=${encodeURIComponent(heads.join('|'))}&t=${encodeURIComponent(title)}`,'_blank','noopener');}
function mk(el,fn){if(el.dataset.lk)return;el.dataset.lk='1';el.style.cursor='pointer';el.title='დააჭირე — აღწერა ახალ ჩანართში';el.classList.add('hd-art');el.addEventListener('click',e=>{e.stopPropagation();fn();});}
function scan(root){
  root.querySelectorAll('.prow').forEach(r=>{const g=r.querySelector('.gate'),l=r.querySelector('.line');if(!g||!l)return;const G=g.textContent.trim(),L=l.textContent.trim(),nm=(r.querySelector('.nm')||{}).textContent||'';
    if(!/^\d+$/.test(G))return;const pk=PK[nm.trim()],h3=(r.parentElement&&r.parentElement.querySelector('h3')||{}).textContent||'',sd=/დიზაინ|Design/i.test(h3)?'d':/პიროვნ|Personal/i.test(h3)?'p':'';
    const K=[`gate:${G}`,`line:${G}.${L}`],H=[`კარიბჭე ${G}`,`კარიბჭე ${G}, ხაზი ${L}`];if(pk){K.unshift(`pgate:${pk}:${G}.${L}${sd?':'+sd:''}`);H.unshift(`${nm.trim()} — კარიბჭე ${G}.${L}`);if(/Chiron|Lilith|Ascendant/.test(pk)){K.push('about:hd:extras');H.push('დამატებითი წერტილები');}}
    mk(r,()=>openArt(K,H,`კარიბჭე ${G}.${L}${nm?' · '+nm.trim():''}`));});
  root.querySelectorAll('.ch-item').forEach(r=>{const p=(r.querySelector('.pair')||{}).textContent||'',m=p.match(/(\d+)\D+(\d+)/);if(!m)return;const a=Math.min(+m[1],+m[2]),b=Math.max(+m[1],+m[2]),nm=((r.querySelector('.cname')||{}).textContent||'').trim();
    mk(r,()=>openArt([`channel:${a}-${b}`],[`არხი ${a}–${b}${nm?' · '+nm:''}`],`არხი ${a}–${b}${nm?' · '+nm:''}`));});
  root.querySelectorAll('.center-chip').forEach(r=>{const t=r.textContent.trim(),c=CEN[t];if(!c)return;const on=r.classList.contains('on');
    mk(r,()=>openArt([`center:${c}:${on?'def':'open'}`],[`${t} — ${on?'განსაზღვრული':'ღია'}`],`${t} ცენტრი — ${on?'განსაზღვრული':'ღია'}`));});
  root.querySelectorAll('#summary-cards .card, .summary .card').forEach(cd=>{const k=((cd.querySelector('.k')||{}).textContent||'').trim(),v=((cd.querySelector('.v')||{}).textContent||'').trim();if(!v||v==='—')return;
    let key=null;
    if(k==='ტიპი'&&TYPE[v])key=`type:${TYPE[v]}`;
    else if(k==='პროფილი'){const m=v.match(/(\d)\s*\/\s*(\d)/);if(m)key=`profile:${m[1]}-${m[2]}`;}
    else if(k==='ავტორიტეტი'){const a=auth(v);if(a)key=`auth:${a}`;}
    else if(k==='განსაზღვრება'){const d=defn(v);if(d!=null)key=`def:${d}`;}
    else if(k.startsWith('ინკარნ')){let x=cross(v);if(!x){const pc=[...cd.parentNode.querySelectorAll('.card')].find(c=>((c.querySelector('.k')||{}).textContent||'').trim()==='პროფილი'),pv=pc?pc.querySelector('.v').textContent:'';x=/^4\/1/.test(pv)?'jx':/^[56]\//.test(pv)?'left':pv?'right':null;}if(x)key=`cross:${x}`;}
    else if(k==='სტრატეგია'||/არარეალ/.test(k)||/^რეალ/.test(k)){const tc=[...cd.parentNode.querySelectorAll('.card')].find(c=>((c.querySelector('.k')||{}).textContent||'').trim()==='ტიპი'),tv=tc?tc.querySelector('.v').textContent.trim():'',ty=TYPE[tv];if(ty)key=(k==='სტრატეგია'?'strategy:':/არარეალ/.test(k)?'notself:':'signature:')+ty;}
    else if(k==='მთავარი ნიჭი'){const m=v.match(/^(\d+)/);if(m)key=`gift:${m[1]}:main`;}
    else if(k==='საკვები'||k==='გარემო'||k==='მოტივაცია'||k==='პერსპექტივა'){const vk=k==='საკვები'?'dig':k==='გარემო'?'env':k==='მოტივაცია'?'mot':'per',x=VARK(vk,v);if(x)key=x;}
    else if(k==='გრძნობა'){const i=SENSE.indexOf(v);if(i>=0)key=`sense:${i+1}`;}
    if(key)mk(cd,()=>openArt([key],[`${k}: ${v}`],`${k}: ${v}`));});
  root.querySelectorAll('#gifts-list .gift-item').forEach(gi=>{const t=gi.textContent.trim(),m=t.match(/^(\d+)/);if(!m)return;mk(gi,()=>openArt([`gift:${m[1]}`],[`ნიჭი: ${t}`],`ნიჭი: ${t}`));});
}
const st=document.createElement('style');st.textContent='.hd-art{transition:filter .15s}.hd-art:hover{filter:brightness(1.25);outline:1px solid rgba(201,168,76,.45);outline-offset:1px}';document.head.appendChild(st);
const obs=new MutationObserver(()=>scan(document));
const go=()=>{scan(document);obs.observe(document.body,{childList:true,subtree:true});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
