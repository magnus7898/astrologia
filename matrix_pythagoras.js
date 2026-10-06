/* ============================================================
   matrix_pythagoras.js — პითაგორას კვადრატი მატრიცაში
   ------------------------------------------------------------
   Three squares from the same birth date, side by side:
     კლასიკური      I=Σთარიღი, II=Σ(I), III=|I−2×დღის პირვ.ციფრი|, IV=Σ(III)
     კორექტირებული  19xx: II→−2, III=I−2 · 20xx: II→+19, III=I+19 · IV=Σ(III)
     კრიზისული      I'=|I−9|   (negative → modulus)
                    III'=|I'−2×დღის პირვ.ციფრი|  (again the modulus)
                    e.g. I=7 → 7−9=−2 → 2 ;  first digit 2 → 2−4=−2 → 2
   Also: clicking a chakra-table row opens its chakra-combo box.

   Self-injecting — matrix.html needs only, after the other add-ons:
       <script src="matrix_pythagoras.js"></script>
   ============================================================ */
(function(){
'use strict';
const $=id=>document.getElementById(id);

const LABELS={1:'პიროვნება',2:'ენერგია',3:'ინტერესი',4:'ჯანმრთელობა',5:'ლოგიკა',
              6:'შრომა',7:'იღბალი',8:'პასუხისმგებლობა',9:'მეხსიერება'};
const GRID_ORDER=[1,4,7,2,5,8,3,6,9];          /* columns 1-2-3 / 4-5-6 / 7-8-9 */
const LINES=[
  ['მიზანდასახულობა','1·4·7',[1,4,7]],['ოჯახი','2·5·8',[2,5,8]],['სტაბილურობა','3·6·9',[3,6,9]],
  ['ამბიცია','1·2·3',[1,2,3]],['ფული','4·5·6',[4,5,6]],['ნიჭი','7·8·9',[7,8,9]],
  ['სულიერება','1·5·9',[1,5,9]],['ტემპერამენტი','3·5·7',[3,5,7]]
];

const sumDigits=n=>String(Math.abs(n)).split('').reduce((a,b)=>a+ +b,0);
const digitsOf=n=>String(Math.abs(n)).split('').map(Number);

/* ── the three variants (same as pythagoras.html, crisis corrected) ── */
function computeSquares(day,month,year){
  const birthDigits=(day+month+year).split('').map(Number);
  const A=birthDigits.reduce((a,b)=>a+b,0);
  const fd=day[0]!=='0'?+day[0]:+day[1];

  const cB=sumDigits(A),cC=Math.abs(A-2*fd),cD=sumDigits(cC);
  const classic={key:'classic',title:'კლასიკური',
    work:[[A,'I'],[cB,'II'],[cC,'III'],[cD,'IV']],
    extra:[...digitsOf(A),...digitsOf(cB),...digitsOf(cC),...digitsOf(cD)],
    note:'III = |I − 2×'+fd+'|'};

  let corrected;
  if(+year>=2000){
    const C=A+19,D=sumDigits(C);
    corrected={key:'corrected',title:'კორექტირებული',
      work:[[A,'I'],['+19','კორ.'],[C,'III'],[D,'IV']],
      extra:[...digitsOf(A),1,9,...digitsOf(C),...digitsOf(D)],note:'XXI საუკუნე · +19'};
  }else{
    const C=A-2,D=sumDigits(C);
    corrected={key:'corrected',title:'კორექტირებული',
      work:[[A,'I'],['−2','კორ.'],[C,'III'],[D,'IV']],
      extra:[...digitsOf(A),2,...digitsOf(C),...digitsOf(D)],note:'XX საუკუნე · −2'};
  }

  /* crisis: every subtraction is taken as a modulus */
  const kA=Math.abs(A-9),kB=sumDigits(kA),kC=Math.abs(kA-2*fd),kD=sumDigits(kC);
  const crisis={key:'crisis',title:'კრიზისული',
    work:[[kA,'|I−9|'],[kB,'II'],[kC,'III'],[kD,'IV']],
    extra:[...digitsOf(kA),...digitsOf(kB),...digitsOf(kC),...digitsOf(kD)],
    note:'|'+A+'−9| = '+kA+' · |'+kA+'−'+(2*fd)+'| = '+kC};

  for(const sq of [classic,corrected,crisis]){
    const c={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    [...birthDigits,...sq.extra].forEach(d=>{if(c[d]!==undefined)c[d]++;});
    sq.count=c;
  }
  return [classic,corrected,crisis];
}

/* ── UI ─────────────────────────────────────────────────────── */
const CSS=`
#pyth-panel{display:none;width:100%;max-width:1100px}
#pyth-panel .py-head{font-family:'Marcellus SC',serif;font-size:11px;letter-spacing:.24em;color:var(--brass);
  text-align:center;text-transform:uppercase;margin-bottom:14px}
#pyth-panel .py-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
#pyth-panel .py-box{flex:1 1 300px;max-width:360px;background:var(--ink-2);border:1px solid var(--rule);
  padding:14px 14px 16px;position:relative}
#pyth-panel .py-box::before{content:'';position:absolute;top:0;left:0;width:14px;height:1px;background:var(--brass)}
#pyth-panel .py-box.crisis::before{background:#c0504a}
#pyth-panel .py-t{font-family:'Marcellus SC',serif;font-size:10.5px;letter-spacing:.2em;color:var(--brass-lt);
  text-align:center;text-transform:uppercase;margin-bottom:10px}
#pyth-panel .py-w{display:flex;justify-content:center;gap:6px;margin-bottom:6px}
#pyth-panel .py-wn{min-width:52px;text-align:center;border:1px solid var(--rule);padding:4px 4px 3px;background:var(--ink-3)}
#pyth-panel .py-wn b{display:block;font-family:'Cinzel',serif;font-size:16px;font-weight:400;color:var(--enamel)}
#pyth-panel .py-wn span{font-family:'JetBrains Mono',monospace;font-size:7.5px;letter-spacing:.08em;color:var(--dim)}
#pyth-panel .py-note{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--patina);text-align:center;margin-bottom:10px}
#pyth-panel .py-g{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--rule);border-left:1px solid var(--rule)}
#pyth-panel .py-c{border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:8px 4px 7px;
  text-align:center;min-height:62px;display:flex;flex-direction:column;justify-content:center;gap:3px}
#pyth-panel .py-c b{font-family:'Cinzel',serif;font-size:17px;font-weight:400;color:var(--brass-lt);letter-spacing:.04em;word-break:break-all}
#pyth-panel .py-c.empty b{color:var(--dim)}
#pyth-panel .py-c span{font-size:9px;color:var(--enamel-2);opacity:.75}
#pyth-panel .py-c.diff{background:rgba(78,143,130,.10)}
#pyth-panel .py-l{display:grid;grid-template-columns:1fr auto auto;gap:2px 10px;margin-top:10px;font-size:10.5px}
#pyth-panel .py-l .k{color:var(--enamel-2)}
#pyth-panel .py-l .d{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--dim);align-self:center}
#pyth-panel .py-l .v{font-family:'Cinzel',serif;color:var(--brass-lt);text-align:right}
#pyth-panel .py-foot{font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--dim);text-align:center;margin-top:10px;letter-spacing:.06em}
.chakra-table tbody tr[data-ch]{cursor:pointer}
`;

function inject(){
  if($('pyth-panel'))return;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const p=document.createElement('div');p.id='pyth-panel';
  const ep=$('extra-panels');
  if(ep&&ep.parentNode)ep.parentNode.insertBefore(p,ep.nextSibling);
  else{const ml=$('main-layout');if(ml)ml.appendChild(p);}
}

function render(day,month,year){
  const p=$('pyth-panel');if(!p)return;
  const S=computeSquares(day,month,year);
  const base=S[0].count;
  const box=sq=>{
    const cells=GRID_ORDER.map(n=>{
      const c=sq.count[n];
      const diff=sq.key!=='classic'&&c!==base[n];
      return `<div class="py-c${c?'':' empty'}${diff?' diff':''}"><b>${c?String(n).repeat(c):'—'}</b><span>${LABELS[n]}</span></div>`;
    }).join('');
    const lines=LINES.map(([nm,lbl,ks])=>
      `<span class="k">${nm}</span><span class="d">${lbl}</span><span class="v">${ks.reduce((a,k)=>a+sq.count[k],0)}</span>`).join('');
    return `<div class="py-box ${sq.key}">
      <div class="py-t">${sq.title}</div>
      <div class="py-w">${sq.work.map(([v,l])=>`<div class="py-wn"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
      <div class="py-note">${sq.note}</div>
      <div class="py-g">${cells}</div>
      <div class="py-l">${lines}</div>
    </div>`;
  };
  p.innerHTML=`<div class="py-head">✦ პითაგორას კვადრატი ✦</div>
    <div class="py-row">${S.map(box).join('')}</div>
    <div class="py-foot">${day}.${month}.${year} · მწვანე უჯრა = განსხვავდება კლასიკურისგან</div>`;
  p.style.display='block';
}

/* chakra-table row → its chakra-combo box */
const ROW_BOX={'row-sahasrara':'ch_sahasrara','row-ajna':'ch_ajna','row-vishudha':'ch_vishudha',
  'row-lelia':'ch_lelia','row-lada':'ch_lada','row-anahata':'ch_anahata','row-manipura':'ch_manipura',
  'row-svadhistana':'ch_svadhistana','row-muladhara':'ch_muladhara','row-total':'ch_total'};
function wireChakraRows(){
  const body=$('chakra-body');if(!body)return;
  body.querySelectorAll('tr').forEach(tr=>{
    const id=ROW_BOX[tr.className];
    if(!id||tr.dataset.ch)return;
    tr.dataset.ch=id;tr.title='კომბინაციის განმარტება';
    tr.addEventListener('click',()=>{if(typeof openBoxById==='function')openBoxById(id);});
  });
}

/* ── hooks ─────────────────────────────────────────────────── */
function hook(){
  if(typeof window.calculate==='function'&&!window.calculate._py){
    const orig=window.calculate;
    const w=function(){
      orig.apply(this,arguments);
      /* calculate() returns early on a bad date — draw only if it ran */
      const ran=($('extra-panels')||{}).style&&$('extra-panels').style.display==='block';
      if(!ran)return;
      const q=n=>(document.querySelector('[name='+n+']')||{}).value||'';
      const dd=String(parseInt(q('dd'),10)).padStart(2,'0');
      const mm=String(parseInt(q('mm'),10)).padStart(2,'0');
      const yy=String(parseInt(q('yyyy'),10));
      try{render(dd,mm,yy);}catch(e){console.warn('pythagoras',e);}
      wireChakraRows();
    };
    w._py=true;window.calculate=w;
  }
  const hide=()=>{const p=$('pyth-panel');if(p)p.style.display='none';};
  for(const fn of ['setMethod','calculateCompat']){
    if(typeof window[fn]==='function'&&!window[fn]._py){
      const o=window[fn];
      const w=function(){const r=o.apply(this,arguments);hide();return r;};
      w._py=true;window[fn]=w;
    }
  }
}

function init(){inject();hook();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
window.computePythagorasSquares=computeSquares;
})();
