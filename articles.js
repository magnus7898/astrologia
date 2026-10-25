/* articles.js — texts written in admin_articles.html, served by the backend (/api/articles).
   ART.load(system) → Promise<{key:{t,h,u}}>   ·   ART.get(system, key) → {t,h} | null (after load)
   Cached per browser (localStorage) so a page shows the last known texts instantly and
   refreshes them in the background.
   On matrix.html (MATRIX_DB present) the matrix texts are laid over matrix_combos.js:
     <zone>|c|<a-b-c> → MATRIX_DB[zone].combos[code]   ·   <zone>|s|<n> → MATRIX_DB[zone].singles[n]
     common|c|<a-b-c> → every combo zone whose own text for that code is empty (admin ★ base)
   Load it right after matrix_combos.js.                                                     */
(function(){
'use strict';
const BACKEND='https://astrology-production-b165.up.railway.app';
const MEM={},WAIT={};
const ck=s=>'magnus_art_'+s;
function cached(s){try{const v=localStorage.getItem(ck(s));return v?JSON.parse(v):null;}catch(e){return null;}}
function cachedBak(s){try{const v=localStorage.getItem(ck(s)+'_bak');return v?JSON.parse(v):null;}catch(e){return null;}}
const ART={
  load(s){
    if(WAIT[s])return WAIT[s];
    const c=cached(s);if(c&&!MEM[s])MEM[s]=c;
    WAIT[s]=fetch(BACKEND+'/api/articles?system='+encodeURIComponent(s)).then(r=>r.ok?r.json():Promise.reject(r.status))
      .then(j=>{
        /* never let an empty or much smaller answer wipe the texts this browser already has:
           keep the larger set as a backup (magnus_art_<s>_bak) for recover.html */
        const old=cached(s)||{},nOld=Object.keys(old).length,nNew=Object.keys(j||{}).length;
        if(nOld>nNew){const bk=cachedBak(s),nBk=bk?Object.keys(bk).length:0;if(nOld>nBk)try{localStorage.setItem(ck(s)+'_bak',JSON.stringify(old));}catch(e){}}
        if(!nNew&&nOld){MEM[s]=old;return old;}
        MEM[s]=j;try{localStorage.setItem(ck(s),JSON.stringify(j));}catch(e){}ART._apply(s);return j;})
      .catch(()=>MEM[s]||{});
    return WAIT[s];
  },
  get(s,k){const a=MEM[s]&&MEM[s][k];return a?{t:a.t,h:a.h}:null;},
  all(s){return MEM[s]||cached(s)||{};},
  _apply(s){
    if(s!=='matrix')return;
    const DB=(typeof MATRIX_DB!=='undefined')?MATRIX_DB:window.MATRIX_DB;if(!DB)return;
    /* undo earlier common fills, so a re-apply sees the file state again */
    for(const z of Object.values(DB))if(z&&z.combos)for(const k in z.combos){const e=z.combos[k];if(e&&e._c){if(e._f)z.combos[k]={title:e._ft||'',text:''};else delete z.combos[k];}}
    const common=[];
    for(const [k,a] of Object.entries(MEM.matrix||{})){
      const [zone,kind,code]=k.split('|');if(!zone||!code)continue;
      if(zone==='common'){if(kind==='c'&&(a.h||a.t))common.push([code,a]);continue;}
      const z=DB[zone]||(DB[zone]={});
      const box=kind==='s'?(z.singles||(z.singles={})):(z.combos||(z.combos={}));
      box[code]={title:a.t||'',text:a.h||''};
    }
    /* common base (admin ★): fills every combo zone where that code has no text of its own */
    const EXZ=(typeof EXACT_ORDER_ZONES!=='undefined')?EXACT_ORDER_ZONES:new Set(['karmic_tail','cp_karmic_tail']);
    const empty=e=>!e||!String(e.text||'').replace(/<[^>]+>|&nbsp;|\s/g,'');
    const CN=DB.ch_names&&DB.ch_names.combos;
    for(const [zone,z] of Object.entries(DB)){
      if(!z||!z.combos||zone==='ch_names')continue;
      for(const [code,a] of common){
        const r=code.split('-').reverse().join('-');
        const key=(!EXZ.has(zone)&&!z.combos[code]&&z.combos[r])?r:code,e=z.combos[key];
        if(!empty(e)&&!(e._c&&code===key&&e._s!==code))continue;   /* an exact-order common text beats a reversed one */
        /* chakra boxes: your chakra list (ch_names) wins over the general common text */
        if(/^ch_/.test(zone)&&CN&&(!empty(CN[key])||!empty(CN[key.split('-').reverse().join('-')])))continue;
        z.combos[key]={title:(e&&!e._c&&e.title)||(e&&e._c&&e._ft)||a.t||'',text:a.h||'',_c:1,_s:code,_f:e?(e._c?e._f:true):false,_ft:e?(e._c?e._ft:e.title||''):''};
      }
    }
  }
};
window.ART=ART;
/* matrix page: lay the cached texts over the file now, then refresh */
if(typeof MATRIX_DB!=='undefined'||window.MATRIX_DB){const c=cached('matrix');if(c){MEM.matrix=c;ART._apply('matrix');}ART.load('matrix');}
})();
