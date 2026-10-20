/* ============================================================
   nonogram_engine.js — generator + line solver for nonogram.html
   ------------------------------------------------------------
   A puzzle is accepted only if the pure LINE SOLVER finishes it:
   every row/column is solved by "which cells are filled (or empty)
   in EVERY placement of its clues". Such a puzzle has exactly one
   picture and never needs a guess.
   Pictures: random seed noise → smoothed (cellular automaton) →
   mirrored left/right (sometimes also top/bottom) so they look like
   shapes, not static. If the line solver gets stuck, a cell it could
   not decide is fixed to its picture value and solving continues —
   the picture changes slightly but stays a picture.
   Works in the browser (window.NonoEngine) and in node.
   ============================================================ */
(function(root){
'use strict';
const clueOf=line=>{const c=[];let r=0;for(const v of line){if(v===1)r++;else if(r){c.push(r);r=0;}}if(r)c.push(r);return c.length?c:[0];};

/* one line: cells -1 unknown / 0 empty / 1 filled → new array or null (contradiction) */
function solveLine(cells,clue){
  const n=cells.length,k=clue[0]===0?0:clue.length,cl=k?clue:[];
  /* f[i][j]: first i cells can hold first j blocks (cell i-1 is not the middle of a block) */
  const f=Array.from({length:n+2},()=>new Uint8Array(k+1));f[0][0]=1;
  const canEmpty=i=>cells[i]!==1,canFill=(a,b)=>{for(let x=a;x<b;x++)if(cells[x]===0)return false;return true;};
  for(let i=0;i<=n;i++)for(let j=0;j<=k;j++){if(!f[i][j])continue;
    if(i<n&&canEmpty(i))f[i+1][j]=1;
    if(j<k){const L=cl[j],e=i+L;if(e<=n&&canFill(i,e)){if(e===n){f[e][j+1]=1;}else if(canEmpty(e))f[e+1][j+1]=1;}}}
  if(!f[n][k])return null;
  const g=Array.from({length:n+2},()=>new Uint8Array(k+1));g[n][k]=1;
  for(let i=n;i>=0;i--)for(let j=k;j>=0;j--){
    if(i===n&&j===k)continue;
    let ok=0;
    if(i<n&&canEmpty(i)&&g[i+1][j])ok=1;
    if(!ok&&j<k){const L=cl[j],e=i+L;if(e<=n&&canFill(i,e)){if(e===n){if(g[e][j+1])ok=1;}else if(canEmpty(e)&&g[e+1][j+1])ok=1;}}
    g[i][j]=ok;}
  const fill=new Uint8Array(n),emp=new Uint8Array(n);
  for(let i=0;i<=n;i++)for(let j=0;j<=k;j++){if(!f[i][j])continue;
    if(i<n&&canEmpty(i)&&g[i+1][j])emp[i]=1;
    if(j<k){const L=cl[j],e=i+L;if(e<=n&&canFill(i,e)){
      if(e===n){if(g[e][j+1])for(let x=i;x<e;x++)fill[x]=1;}
      else if(canEmpty(e)&&g[e+1][j+1]){for(let x=i;x<e;x++)fill[x]=1;emp[e]=1;}}}}
  const out=cells.slice();
  for(let i=0;i<n;i++){if(fill[i]&&!emp[i])out[i]=1;else if(emp[i]&&!fill[i])out[i]=0;else if(!fill[i]&&!emp[i])return null;}
  return out;
}

/* full line solver: returns {grid, solved} (grid -1/0/1) */
function lineSolve(W,H,rows,cols,start){
  const G=start?start.slice():new Array(W*H).fill(-1);
  const dr=new Uint8Array(H).fill(1),dc=new Uint8Array(W).fill(1);
  let changed=true,guard=0;
  while(changed&&guard++<500){changed=false;
    for(let r=0;r<H;r++){if(!dr[r])continue;dr[r]=0;const line=G.slice(r*W,r*W+W),o=solveLine(line,rows[r]);if(!o)return{grid:G,solved:false,bad:true};
      for(let c=0;c<W;c++)if(o[c]!==line[c]){G[r*W+c]=o[c];dc[c]=1;changed=true;}}
    for(let c=0;c<W;c++){if(!dc[c])continue;dc[c]=0;const line=[];for(let r=0;r<H;r++)line.push(G[r*W+c]);const o=solveLine(line,cols[c]);if(!o)return{grid:G,solved:false,bad:true};
      for(let r=0;r<H;r++)if(o[r]!==line[r]){G[r*W+c]=o[r];dr[r]=1;changed=true;}}
  }
  return{grid:G,solved:G.every(x=>x!==-1)};
}

function rnd(seed){let s=seed>>>0||7;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function picture(W,H,R,density){
  let g=new Array(W*H).fill(0).map(()=>R()<density?1:0);
  const at=(x,y)=>x<0||y<0||x>=W||y>=H?0:g[y*W+x];
  const steps=W<=6?1:2;
  for(let s=0;s<steps;s++){const n=g.slice();
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){let k=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)k+=at(x+dx,y+dy);
      n[y*W+x]=k>=5?1:k<=2?0:g[y*W+x];}
    g=n;}
  const mx=R()<0.8,my=R()<0.3;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(mx&&x>=W/2)g[y*W+x]=g[y*W+(W-1-x)];}
  if(my)for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(y>=H/2)g[y*W+x]=g[(H-1-y)*W+x];}
  return g;
}
function clues(W,H,g){
  const rows=[],cols=[];
  for(let r=0;r<H;r++)rows.push(clueOf(g.slice(r*W,r*W+W)));
  for(let c=0;c<W;c++){const l=[];for(let r=0;r<H;r++)l.push(g[r*W+c]);cols.push(clueOf(l));}
  return{rows,cols};
}
/* levels: size and how full */
const LEVELS={1:{W:5,H:5,d:.55},2:{W:8,H:8,d:.52},3:{W:10,H:10,d:.5},4:{W:15,H:15,d:.5},5:{W:20,H:20,d:.5}};
function generate(lv,seed){
  const L=LEVELS[lv]||LEVELS[2],R=rnd(seed||((Math.random()*2**32)>>>0)),t0=Date.now();
  for(let tries=0;tries<400;tries++){
    let g=picture(L.W,L.H,R,L.d+(R()-.5)*.08);
    const fill=g.filter(x=>x).length/g.length;if(fill<.3||fill>.75)continue;
    /* repair: where the line solver stalls, flip the undecided cell to make that cell given by its row */
    for(let fix=0;fix<L.W*L.H;fix++){
      const {rows,cols}=clues(L.W,L.H,g),s=lineSolve(L.W,L.H,rows,cols);
      if(s.solved)return{W:L.W,H:L.H,solution:g,rows,cols,lv,tries:tries+1,fixes:fix,ms:Date.now()-t0};
      const un=s.grid.map((v,i)=>v===-1?i:-1).filter(i=>i>=0);
      if(!un.length)break;
      const i=un[(R()*un.length)|0];g[i]=g[i]?0:1;
      const f=g.filter(x=>x).length/g.length;if(f<.25||f>.8)break;
    }
  }
  return null;
}
const API={generate,lineSolve,solveLine,clues,clueOf,LEVELS};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.NonoEngine=API;
})(typeof window!=='undefined'?window:this);
