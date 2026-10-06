/* ============================================================
   matrix_boxes_addon.js — INTERPRETATION BOXES
   ------------------------------------------------------------
   Pairs with matrix_combos.js (MATRIX_DB + lookup()).
   Load order in matrix.html (combos FIRST):
       <script src="matrix_combos.js"></script>
       <script src="matrix_boxes_addon.js"></script>

   Called by calculate():  buildMatrixBoxes(vals, method)
   Called by circle click:  openBoxById(id)

   ── BOX FIELDS ───────────────────────────────────────────────
   id      : matches circle ids in draw() so a click opens the box
   title   : zone name shown in the header
   keys    : circle/value names. 1 name = single number, 3 = combo
   color   : accent dot
   m1only  : true → shown ONLY in method 1 (sexiness)
   display : 'combo' (default, shows n-n-n) | 'sum' (shows r22 of the
             three) | 'one' (shows first number only)
   todo    : true → keys not set yet (define the circles, see chat)

   Article text comes from MATRIX_DB[id] in matrix_combos.js,
   looked up by the actual numbers. Single numbers with no entry
   fall back to the ENERGIES tarot meaning.
   ============================================================ */

const BOXES = [
  /* ───── COMBOS (three numbers) ───── */
  { id:'persona',        title:'პერსონა',                          keys:['L3','L2','L1'],   color:'#a78bfa' },
  { id:'karmic_tail',    title:'კარმული კუდი',                     keys:['B3','B2','B1'],   color:'#8e44ad' },
  { id:'material_karma', title:'მატერიალური კარმა',                keys:['R3','R2','R1'],   color:'#d35400' },
  { id:'sex',            title:'სექსუალურობა',                     keys:['Cv','RC1','RC2'], color:'#d4a017', m1only:true },
  { id:'talent_zone',    title:'ტალანტების ზონა',                  keys:['T3','T2','T1'],   color:'#2471a3' },
  { id:'tl',             title:'ნიჭები კაცი წინაპრების ხაზით',     keys:['TL3','TL2','TL1'], color:'#d28aff' },
  { id:'tr',             title:'ნიჭები ქალი წინაპრების ხაზით',     keys:['TR3','TR2','TR1'], color:'#ff8c8c' },
  { id:'br',             title:'კაცი წინაპრების კარმა',            keys:['BR3','BR2','BR1'], color:'#b06bd0' },
  { id:'bl',             title:'ქალი წინაპრების კარმა',            keys:['BL3','BL2','BL1'], color:'#e06b6b' },
  { id:'love',           title:'პირადი ურთიერთობების ხაზი',       keys:['B1','W1','W2'],   color:'#ff6b8a', flag:true },
  { id:'money',          title:'ფულის ხაზი',                       keys:['R1','W3','S6'],   color:'#7ec850' },
  { id:'heart',          title:'როგორი პარტნიორი შეგვეფერება',     keys:['W1'],             color:'#ff6b8a' },
  { id:'gel',            title:'როგორი სამსახური შეგვეფერება',      keys:['W3'],             color:'#7ec850' },

  /* ───── SINGLE NUMBERS ───── */
  { id:'b3',      title:'მთავარი ცხოვრებისეული გაკვეთილი',             keys:['B3'], color:'#e24b4a' },
  { id:'r3',      title:'მთავარი ცხოვრებისეული მატერიალური გაკვეთილი', keys:['R3'], color:'#e24b4a' },
  { id:'b1',      title:'როგორ შევდივართ ურთიერთობებში',               keys:['B1'], color:'#ef9f27' },
  { id:'r1',      title:'რა თვისებები გვჭირდება სამუშაო პროცესში',      keys:['R1'], color:'#ef9f27' },
  { id:'comfort', title:'კომფორტის ზონა',                              keys:['Cv'], color:'#ffd700' },
  { id:'g1',      title:'ფიზიკური სურვილები',                          keys:['G1'], color:'#639922' },
  { id:'g2',      title:'სოციალური სურვილები',                         keys:['G2'], color:'#639922' },
  { id:'l1',      title:'მშობელი-შვილის ურთიერთობა',                   keys:['L1'], color:'#4a8cc8' },
  { id:'t1',      title:'ნიჭები, კომუნიკაცია',                         keys:['T1'], color:'#4a8cc8' },
  { id:'l2',      title:'ბავშვობის ტრამვები, ხედვა',                   keys:['L2'], color:'#2060a8' },
  { id:'t2',      title:'მენტალური უნარები',                           keys:['T2'], color:'#2060a8' },
  { id:'l3',      title:'სავიზიტო ბარათი, უმაღლესი მე',                keys:['L3'], color:'#7f77dd' },
  { id:'t3',      title:'შთაგონება',                                   keys:['T3'], color:'#7f77dd' },

  /* ───── CHAKRA EMOTIONS (ემოცია column) ───── */
  { id:'emo_crown',    title:'გვირგვინოვანი ჩაკრა — ემოცია', keys:['S1'], color:'#7e57c2' },
  { id:'emo_thirdeye', title:'მესამე თვალის ჩაკრა — ემოცია', keys:['S2'], color:'#5c9bd6' },
  { id:'emo_throat',   title:'ხორხის ჩაკრა — ემოცია',        keys:['S3'], color:'#b5d4f4' },
  { id:'emo_heart',    title:'გულის ჩაკრა — ემოცია',         keys:['S4'], color:'#66bb6a' },
  { id:'emo_solar',    title:'მზის წნულის ჩაკრა — ემოცია',   keys:['S5'], color:'#ffd700' },
  { id:'emo_sacral',   title:'საკრალური ჩაკრა — ემოცია',     keys:['S6'], color:'#ef9f27' },
  { id:'emo_root',     title:'ფუძის ჩაკრა — ემოცია',         keys:['S7'], color:'#dc4646' },

  /* ───── CHAKRA COMBOS: ენერგია-ფიზიკა-ემოცია (ცხრილის რიგი) ─────
     დალი / კოპალა მხოლოდ მეთოდ 3-ში არსებობს — სხვაგან ბოქსი არ ჩანს. */
  { id:'ch_sahasrara', title:'საჰასრარა — ჩაკრის კომბინაცია', keys:['CH_sahasrara_E','CH_sahasrara_P','CH_sahasrara_S'], color:'#7e57c2', chakra:true },
  { id:'ch_ajna', title:'აჯნა — ჩაკრის კომბინაცია', keys:['CH_ajna_E','CH_ajna_P','CH_ajna_S'], color:'#5c9bd6', chakra:true },
  { id:'ch_vishudha', title:'ვიშუდჰა — ჩაკრის კომბინაცია', keys:['CH_vishudha_E','CH_vishudha_P','CH_vishudha_S'], color:'#b5d4f4', chakra:true },
  { id:'ch_lelia', title:'დალი — ქალის ხაზი — ჩაკრის კომბინაცია', keys:['CH_lelia_E','CH_lelia_P','CH_lelia_S'], color:'#3A6EA5', chakra:true },
  { id:'ch_lada', title:'კოპალა — მამაკაცის ხაზი — ჩაკრის კომბინაცია', keys:['CH_lada_E','CH_lada_P','CH_lada_S'], color:'#1F6E5C', chakra:true },
  { id:'ch_anahata', title:'ანაჰატა — ჩაკრის კომბინაცია', keys:['CH_anahata_E','CH_anahata_P','CH_anahata_S'], color:'#66bb6a', chakra:true },
  { id:'ch_manipura', title:'მანიპურა — ჩაკრის კომბინაცია', keys:['CH_manipura_E','CH_manipura_P','CH_manipura_S'], color:'#ffd700', chakra:true },
  { id:'ch_svadhistana', title:'სვადჰისტანა — ჩაკრის კომბინაცია', keys:['CH_svadhistana_E','CH_svadhistana_P','CH_svadhistana_S'], color:'#ef9f27', chakra:true },
  { id:'ch_muladhara', title:'მულადჰარა — ჩაკრის კომბინაცია', keys:['CH_muladhara_E','CH_muladhara_P','CH_muladhara_S'], color:'#dc4646', chakra:true },
  { id:'ch_total', title:'ჩაკრების ჯამი — „სულ“ რიგის კომბინაცია', keys:['CH_total_E','CH_total_P','CH_total_S'], color:'#E3BE84', chakra:true },
];


/* ═══════════ შეთავსების რეჟიმის ბოქსები (method 4) ═══════════
   იგივე წრეები, სხვა მნიშვნელობა — წყვილზეა და არა ერთ ადამიანზე. */
const COMPAT_BOXES = [
  { id:'cp_center',        title:'ვინ არიან ერთმანეთისთვის',            keys:['Cv'],           color:'#ffd700' },
  { id:'cp_persona',       title:'წყვილის საჯარო იმიჯი / როგორი მშობლები არიან', keys:['L3','L2','L1'], color:'#a78bfa' },
  { id:'cp_karmic_tail',   title:'წყვილის კარმული კუდი',               keys:['B3','B2','B1'], color:'#8e44ad' },
  { id:'cp_talent_zone',   title:'წყვილის უმაღლესი მისია',             keys:['T3','T2','T1'], color:'#2471a3' },
  { id:'cp_material_karma',title:'წყვილის მატერიალური კარმა',          keys:['R3','R2','R1'], color:'#d35400' },
  { id:'cp_tl3',           title:'როგორ იქცევა კაცი ამ ურთიერთობაში',  keys:['TL3'],          color:'#6B9B3F' },
  { id:'cp_tr3',           title:'როგორ იქცევა ქალი ამ ურთიერთობაში',  keys:['TR3'],          color:'#3A6EA5' },
  { id:'cp_br3',           title:'როგორ იქცეოდა კაცი წარსულ ცხოვრებაში', keys:['BR3'],        color:'#6B9B3F' },
  { id:'cp_bl3',           title:'როგორ იქცეოდა ქალი წარსულ ცხოვრებაში', keys:['BL3'],        color:'#3A6EA5' },
  { id:'cp_love',          title:'წყვილის სასიყვარულო თემა',           keys:['W1'],           color:'#ff6b8a' },
  { id:'cp_money',         title:'წყვილის ფულის თემა',                 keys:['W3'],           color:'#7ec850' },
];

/* rows of the chakra table: [key, energy, physics]. Mirrors renderChakra()
   in matrix.html. Method 3's second heart value (m3Cv2) is the sum of the
   four (name-overridden) diagonal corners, exactly as calculate() makes it. */
function chakraRows(v,method,R){
  if(method===4) return [];
  if(method===3){
    const m3Cv2=R(v.TL3+v.TR3+v.BR3+v.BL3);
    return [['sahasrara',v.T3,v.L3],['ajna',v.T2,v.L2],['vishudha',v.T1,v.L1],
            ['lelia',v.TR3,v.BL3],['lada',v.TL3,v.BR3],['anahata',v.Cv,m3Cv2],
            ['manipura',v.B1,v.R1],['svadhistana',v.B2,v.R2],['muladhara',v.B3,v.R3]]
           .map(([k,e,p])=>[k,e||0,p||0]);
  }
  return [['sahasrara',v.T3,v.L3],['ajna',v.T2,v.L2],['vishudha',v.T1,v.L1],
          ['anahata',v.G2,v.G1],['manipura',v.Cv,v.Cv],['svadhistana',v.B1,v.R1],
          ['muladhara',v.B3,v.R3]].map(([k,e,p])=>[k,e||0,p||0]);
}

function buildMatrixBoxes(v, method){
  const panel=document.getElementById('matrix-boxes');
  if(!panel) return;
  const R=(typeof r22==='function')?r22:(n=>n);

  /* chakra rows — the SAME rows the table renders (renderChakra), so the
     emotion singles and the chakra combos always match what is on screen,
     in methods 1-2 (7 rows) and method 3 (9 rows) alike */
  const CH=chakraRows(v,method,R);
  const VAL=Object.assign({},v);
  const EMO={sahasrara:'S1',ajna:'S2',vishudha:'S3',anahata:'S4',manipura:'S5',svadhistana:'S6',muladhara:'S7'};
  let se=0,sp=0,ss=0;
  for(const [k,e,ph] of CH){
    const sm=R(e+ph);
    VAL['CH_'+k+'_E']=e; VAL['CH_'+k+'_P']=ph; VAL['CH_'+k+'_S']=sm;
    if(EMO[k]) VAL[EMO[k]]=sm;
    se+=e; sp+=ph; ss+=sm;
  }
  if(CH.length){ VAL.CH_total_E=R(se); VAL.CH_total_P=R(sp); VAL.CH_total_S=R(ss); }

  panel.innerHTML='';
  panel.style.display='flex';

  const LIST=(method===4)?COMPAT_BOXES:BOXES;

  for(const box of LIST){
    if(box.m1only && method!==1) continue;                 // sexiness: method 1 only

    /* შეთავსების რეჟიმში ზოგი წრე არ ითვლება — ასეთ ბოქსს საერთოდ ვტოვებთ */
    const raw=(box.keys||[]).map(k=>VAL[k]);
    if(raw.length && raw.some(n=>n===undefined)) continue;
    const nums=raw.filter(n=>n!==undefined);
    const hasNums=nums.length>0;

    // header number(s)
    let headNums='—';
    if(hasNums){
      if(box.display==='sum')      headNums=String(R(nums.reduce((a,b)=>a+b,0)));
      else if(box.display==='one') headNums=String(nums[0]);
      else                         headNums=nums.join('-');
    }

    // article: MATRIX_DB first, then ENERGIES fallback for singles
    let art=null;
    if(hasNums && typeof lookup==='function') art=lookup(box.id,nums);
    if(!art && box.chakra && nums.length===3 && typeof autoCombo==='function'){
      const t=autoCombo(box.id,nums); if(t) art={title:'',text:t,auto:true};
    }
    if(!art && nums.length===1 && typeof getE==='function'){
      const e=getE(nums[0]); art={title:e.name, text:e.desc};
    }
    const subtitle=art&&art.title?art.title:'';
    const body=art&&art.text?art.text
              :(box.todo?'⚠ ამ ბოქსს წრეები ჯერ არ აქვს მითითებული (keys)':'სტატია ჯერ არ არის დამატებული');

    const wrap=document.createElement('div');
    wrap.className='mx-box'; wrap.id='mxbox-'+box.id;

    const head=document.createElement('div'); head.className='mx-box-head';
    head.innerHTML='<span><span class="mx-dot" style="background:'+box.color+'"></span>'+box.title+'</span>'+
                   '<span class="mx-key">'+headNums+'<span class="mx-arrow">▼</span></span>';

    const bod=document.createElement('div'); bod.className='mx-box-body'; bod.style.display='none';
    bod.innerHTML=(subtitle?'<div style="font-weight:600;color:#e8dcff;margin-bottom:6px">'+subtitle+'</div>':'')+body;

    head.addEventListener('click',()=>{ bod.style.display=(bod.style.display==='block')?'none':'block'; });

    wrap.appendChild(head); wrap.appendChild(bod);
    panel.appendChild(wrap);
  }
}

function openBoxById(id){
  const el=document.getElementById('mxbox-'+id);
  if(!el) return;
  const bod=el.querySelector('.mx-box-body');
  if(bod) bod.style.display='block';
  el.scrollIntoView({behavior:'smooth',block:'center'});
}

window.buildMatrixBoxes=buildMatrixBoxes;
window.openBoxById=openBoxById;
window.chakraRows=chakraRows;
