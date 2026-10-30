/* hd_articles_panel.js — the texts for every activation, shown right in hd.html under the natal chart
   (no click needed): each planet's gate.line for Personality and Design, plus Chiron / Lilith /
   Ascendant when their switch is on. Admin texts (articles.js) win over the built-in ones.
   Also hides the extra-activation options in the form until a chart has been calculated.          */
(function(){
'use strict';
const KA={Sun:'მზე',Earth:'დედამიწა',Moon:'მთვარე','North Node':'ჩრდ. კვანძი','South Node':'სამხ. კვანძი',Mercury:'მერკური',Venus:'ვენერა',Mars:'მარსი',Jupiter:'იუპიტერი',Saturn:'სატურნი',Uranus:'ურანი',Neptune:'ნეპტუნი',Pluto:'პლუტონი',Chiron:'ქირონი',Lilith:'ლილიტი',Ascendant:'ასცენდენტი'};
const GL={Sun:'☉',Earth:'⊕',Moon:'☽','North Node':'☊','South Node':'☋',Mercury:'☿',Venus:'♀',Mars:'♂',Jupiter:'♃',Saturn:'♄',Uranus:'♅',Neptune:'♆',Pluto:'♇',Chiron:'⚷',Lilith:'⚸',Ascendant:'AC'};
const XK={chiron:'Chiron',lilith:'Lilith',ascendant:'Ascendant'};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const st=document.createElement('style');st.textContent=`
body:not(.hd-has-chart) .extras-head,body:not(.hd-has-chart) .extras-grid,body:not(.hd-has-chart) .extras-foot{display:none!important}
#hd-texts{max-width:900px;margin:24px auto 8px;padding:0 4px}
#hd-texts h2{font-family:'Cinzel',serif;text-align:center;font-size:1rem;letter-spacing:.12em;color:#c9a84c;margin:0 0 6px}
#hd-texts .hint{text-align:center;font-size:.75rem;color:rgba(220,200,255,.55);margin-bottom:14px}
#hd-texts .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:720px){#hd-texts .cols{grid-template-columns:1fr}}
#hd-texts h3{font-family:'Cinzel',serif;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;margin:0 0 8px}
#hd-texts details{background:rgba(12,9,26,.75);border:1px solid rgba(196,149,80,.22);border-radius:10px;margin:0 0 7px;overflow:hidden}
#hd-texts details[open]{border-color:rgba(196,149,80,.5)}
#hd-texts summary{cursor:pointer;padding:9px 12px;font-size:.86rem;color:#ecd59a;list-style:none;display:flex;gap:8px;align-items:center}
#hd-texts summary::-webkit-details-marker{display:none}
#hd-texts summary .gx{width:22px;text-align:center;font-size:1rem}
#hd-texts summary .gt{margin-left:auto;font-family:monospace;color:#fff;opacity:.85}
#hd-texts .tx{padding:2px 14px 12px;font-size:.85rem;line-height:1.65;color:rgba(235,225,255,.88)}
#hd-texts .tx p{margin:.5em 0}#hd-texts .xt summary{color:#9fe0c6}`;
document.head.appendChild(st);
function txt(keys){const A=window.ART,F=window.HD_GATE_INTERP;for(const k of keys){const a=A&&A.get?A.get('hd',k):(F?F.forKey(k):null);if(a&&(a.h||a.t))return a;}return null;}
function item(a,side,extra){const nm=KA[a.planet]||a.planet,pk=String(a.planet).replace(/ /g,'_'),G=a.gate,L=a.line,
    t=txt([`pgate:${pk}:${G}.${L}:${side}`])||{t:'',h:''},g=txt([`gate:${G}`]),l=txt([`line:${G}.${L}`]),gn=window.HD_GATE_INTERP&&HD_GATE_INTERP.GN?HD_GATE_INTERP.GN[G]:'';
  return `<details class="${extra?'xt':''}"><summary><span class="gx">${GL[a.planet]||''}</span>${esc(nm)}${gn?` · <span style="opacity:.75">${esc(gn)}</span>`:''}<span class="gt">${G}.${L}</span></summary>
    <div class="tx">${t.h||''}${g&&g.h?`<p><strong>${esc(g.t||'კარიბჭე '+G)}</strong></p>${g.h}`:''}${l&&l.h?`<p><strong>${esc(l.t||'ხაზი '+L)}</strong></p>${l.h}`:''}</div></details>`;}
function draw(chart){const host=document.getElementById('results-natal');if(!host||!chart)return;let box=document.getElementById('hd-texts');
  if(!box){box=document.createElement('div');box.id='hd-texts';host.appendChild(box);}
  const keys=(typeof activeExtras==='function'?activeExtras():[]),col=(side,lab,color)=>{const L=(side==='p'?chart.personality:chart.design)||[];
    let h=`<div><h3 style="color:${color}">${lab}</h3>`+L.map(a=>item(a,side,false)).join('');
    keys.forEach(k=>{const x=chart[k];const a=x&&(side==='p'?x.personality:x.design);if(a)h+=item({...a,planet:XK[k]},side,true);});return h+'</div>';};
  box.innerHTML=`<h2>📖 განმარტებები</h2><div class="hint">დააჭირე აქტივაციას — გაიხსნება აღწერა: პლანეტა კარიბჭეში, კარიბჭე და ხაზი.${keys.length?' მწვანე — დამატებითი წერტილები (⚷ ⚸ AC).':''}</div>
    <div class="cols">${col('p','პიროვნება · ცნობიერი','#e8e0ff')}${col('d','დიზაინი · არაცნობიერი','#f0a0a0')}</div>
    ${keys.length?(()=>{const e=txt(['about:hd:extras']);return e?`<details class="xt" style="margin-top:10px"><summary><span class="gx">ⓘ</span>${esc(e.t)}</summary><div class="tx">${e.h}</div></details>`:'';})():''}`;}
function wrap(){const f=window.renderNatal;if(typeof f!=='function'||f.__txt)return;const w=function(raw){const r=f.apply(this,arguments);try{document.body.classList.add('hd-has-chart');draw(raw);}catch(e){console.warn(e);}return r;};w.__txt=1;window.renderNatal=w;
  const s=window.renderSynastry;if(typeof s==='function'&&!s.__txt){const w2=function(){const r=s.apply(this,arguments);document.body.classList.add('hd-has-chart');return r;};w2.__txt=1;window.renderSynastry=w2;}}
wrap();window.addEventListener('load',()=>setTimeout(wrap,0));
if(window.ART&&ART.load)ART.load('hd').then(()=>{if(typeof _lastNatal!=='undefined'&&_lastNatal)draw(_lastNatal);});
})();
