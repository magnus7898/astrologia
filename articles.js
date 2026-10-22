/* articles.js — texts written in admin_articles.html, served by the backend (/api/articles).
   ART.load(system) → Promise<{key:{t,h,u}}>   ·   ART.get(system, key) → {t,h} | null (after load)
   Cached per browser (localStorage) so a page shows the last known texts instantly and
   refreshes them in the background.
   On matrix.html (MATRIX_DB present) the matrix texts are laid over matrix_combos.js:
     <zone>|c|<a-b-c> → MATRIX_DB[zone].combos[code]   ·   <zone>|s|<n> → MATRIX_DB[zone].singles[n]
   Load it right after matrix_combos.js.                                                     */
(function(){
'use strict';
const BACKEND='https://astrology-production-b165.up.railway.app';
const MEM={},WAIT={};
const ck=s=>'magnus_art_'+s;
function cached(s){try{const v=localStorage.getItem(ck(s));return v?JSON.parse(v):null;}catch(e){return null;}}
const ART={
  load(s){
    if(WAIT[s])return WAIT[s];
    const c=cached(s);if(c&&!MEM[s])MEM[s]=c;
    WAIT[s]=fetch(BACKEND+'/api/articles?system='+encodeURIComponent(s)).then(r=>r.ok?r.json():Promise.reject(r.status))
      .then(j=>{MEM[s]=j;try{localStorage.setItem(ck(s),JSON.stringify(j));}catch(e){}ART._apply(s);return j;})
      .catch(()=>MEM[s]||{});
    return WAIT[s];
  },
  get(s,k){const a=MEM[s]&&MEM[s][k];return a?{t:a.t,h:a.h}:null;},
  all(s){return MEM[s]||cached(s)||{};},
  _apply(s){
    if(s!=='matrix')return;
    const DB=(typeof MATRIX_DB!=='undefined')?MATRIX_DB:window.MATRIX_DB;if(!DB)return;
    for(const [k,a] of Object.entries(MEM.matrix||{})){
      const [zone,kind,code]=k.split('|');if(!zone||!code)continue;
      const z=DB[zone]||(DB[zone]={});
      const box=kind==='s'?(z.singles||(z.singles={})):(z.combos||(z.combos={}));
      box[code]={title:a.t||'',text:a.h||''};
    }
  }
};
window.ART=ART;
/* matrix page: lay the cached texts over the file now, then refresh */
if(typeof MATRIX_DB!=='undefined'||window.MATRIX_DB){const c=cached('matrix');if(c){MEM.matrix=c;ART._apply('matrix');}ART.load('matrix');}
})();
