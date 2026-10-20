/* ============================================================
   sudoku_engine.js — generator + logical grader for sudoku.html
   ------------------------------------------------------------
   Every puzzle:
     1. a random complete grid (backtracking, shuffled digits)
     2. clues removed one by one, symmetric pairs, keeping a clue
        whenever its removal would allow a SECOND solution →
        exactly one solution, always
     3. graded by a human-style solver (no guessing). A puzzle is
        accepted for a level only if that solver finishes it with
        the techniques of that level — so it is solvable by logic.
   Levels (hardest technique needed):
     1 მარტივი      naked + hidden singles, many clues
     2 საშუალო      singles, fewer clues
     3 რთული        + pointing / box-line, naked & hidden pairs
     4 ექსპერტი     + naked/hidden triples, X-wing
     5 ოსტატი       + Swordfish, XY-wing (still pure logic)
   Works in a Worker (self.onmessage) and in node (module.exports).
   ============================================================ */
(function(root){
'use strict';
const ROW=[],COL=[],BOX=[],PEERS=[],UNITS=[];
for(let i=0;i<81;i++){ROW[i]=(i/9)|0;COL[i]=i%9;BOX[i]=((ROW[i]/3)|0)*3+((COL[i]/3)|0);}
for(let u=0;u<9;u++){const r=[],c=[],b=[];for(let i=0;i<81;i++){if(ROW[i]===u)r.push(i);if(COL[i]===u)c.push(i);if(BOX[i]===u)b.push(i);}UNITS.push(r,c,b);}
for(let i=0;i<81;i++){const s=new Set();for(let j=0;j<81;j++)if(j!==i&&(ROW[j]===ROW[i]||COL[j]===COL[i]||BOX[j]===BOX[i]))s.add(j);PEERS[i]=[...s];}
const BIT=d=>1<<(d-1),ALL=0x1ff;
const pc=m=>{let c=0;while(m){m&=m-1;c++;}return c;};
const digitsOf=m=>{const a=[];for(let d=1;d<=9;d++)if(m&BIT(d))a.push(d);return a;};
const one=m=>{for(let d=1;d<=9;d++)if(m===BIT(d))return d;return 0;};

/* ── counting solutions (stops at `limit`) — bitmask backtracking, MRV ── */
function countSolutions(g,limit){
  const a=g.slice(),rm=new Array(9).fill(0),cm=new Array(9).fill(0),bm=new Array(9).fill(0);
  for(let i=0;i<81;i++)if(a[i]){const b=BIT(a[i]);if(rm[ROW[i]]&b||cm[COL[i]]&b||bm[BOX[i]]&b)return 0;rm[ROW[i]]|=b;cm[COL[i]]|=b;bm[BOX[i]]|=b;}
  let n=0;
  (function rec(){
    if(n>=limit)return;
    let best=-1,bc=10,bmask=0;
    for(let i=0;i<81;i++)if(!a[i]){const m=ALL&~(rm[ROW[i]]|cm[COL[i]]|bm[BOX[i]]),c=pc(m);if(c<bc){bc=c;best=i;bmask=m;if(c<=1)break;}}
    if(best<0){n++;return;}
    if(!bc)return;
    for(let d=1;d<=9;d++)if(bmask&BIT(d)){const b=BIT(d);
      a[best]=d;rm[ROW[best]]|=b;cm[COL[best]]|=b;bm[BOX[best]]|=b;rec();
      a[best]=0;rm[ROW[best]]&=~b;cm[COL[best]]&=~b;bm[BOX[best]]&=~b;if(n>=limit)return;}
  })();
  return n;
}
function solve(g){
  const a=g.slice();let out=null;
  const rm=new Array(9).fill(0),cm=new Array(9).fill(0),bm=new Array(9).fill(0);
  for(let i=0;i<81;i++)if(a[i]){const b=BIT(a[i]);rm[ROW[i]]|=b;cm[COL[i]]|=b;bm[BOX[i]]|=b;}
  (function rec(){
    if(out)return;
    let best=-1,bc=10,bmask=0;
    for(let i=0;i<81;i++)if(!a[i]){const m=ALL&~(rm[ROW[i]]|cm[COL[i]]|bm[BOX[i]]),c=pc(m);if(c<bc){bc=c;best=i;bmask=m;if(c<=1)break;}}
    if(best<0){out=a.slice();return;}
    for(let d=1;d<=9;d++)if(bmask&BIT(d)){const b=BIT(d);
      a[best]=d;rm[ROW[best]]|=b;cm[COL[best]]|=b;bm[BOX[best]]|=b;rec();
      a[best]=0;rm[ROW[best]]&=~b;cm[COL[best]]&=~b;bm[BOX[best]]&=~b;if(out)return;}
  })();
  return out;
}

/* ── random complete grid ── */
function rnd(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function shuffle(a,R){for(let i=a.length-1;i>0;i--){const j=(R()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
function fullGrid(R){
  const a=new Array(81).fill(0),rm=new Array(9).fill(0),cm=new Array(9).fill(0),bm=new Array(9).fill(0);
  (function rec(i){
    if(i===81)return true;
    const m=ALL&~(rm[ROW[i]]|cm[COL[i]]|bm[BOX[i]]);
    for(const d of shuffle(digitsOf(m),R)){const b=BIT(d);
      a[i]=d;rm[ROW[i]]|=b;cm[COL[i]]|=b;bm[BOX[i]]|=b;
      if(rec(i+1))return true;
      a[i]=0;rm[ROW[i]]&=~b;cm[COL[i]]&=~b;bm[BOX[i]]&=~b;}
    return false;
  })(0);
  return a;
}

/* ── human-style solver: returns {solved, level, steps} ── */
function grade(g,maxLevel){
  const v=g.slice(),cand=new Array(81).fill(0);
  for(let i=0;i<81;i++)if(!v[i]){let m=ALL;for(const p of PEERS[i])if(v[p])m&=~BIT(v[p]);cand[i]=m;}
  let level=1;const used={};
  const place=(i,d)=>{v[i]=d;cand[i]=0;const b=BIT(d);for(const p of PEERS[i])cand[p]&=~b;};
  const note=(t,l)=>{used[t]=(used[t]||0)+1;if(l>level)level=l;};
  function singles(){
    for(let i=0;i<81;i++)if(!v[i]&&pc(cand[i])===1){place(i,one(cand[i]));note('naked single',1);return true;}
    for(const U of UNITS)for(let d=1;d<=9;d++){const b=BIT(d);let at=-1,k=0;
      for(const i of U){if(v[i]===d){k=-9;break;}if(!v[i]&&cand[i]&b){k++;at=i;}}
      if(k===1){place(at,d);note('hidden single',1);return true;}}
    return false;
  }
  function pointing(){ /* box→line and line→box */
    let ch=false;
    for(let bx=0;bx<9;bx++){const B=UNITS[bx*3+2];
      for(let d=1;d<=9;d++){const b=BIT(d),cs=B.filter(i=>!v[i]&&cand[i]&b);if(cs.length<2)continue;
        for(const key of [ROW,COL]){const k=key[cs[0]];if(cs.every(i=>key[i]===k)){
          for(let j=0;j<81;j++)if(key[j]===k&&BOX[j]!==bx&&!v[j]&&cand[j]&b){cand[j]&=~b;ch=true;}}}}}
    if(ch){note('pointing',3);return true;}
    for(let u=0;u<18;u++){const U=UNITS[(u%9)*3+(u<9?0:1)];
      for(let d=1;d<=9;d++){const b=BIT(d),cs=U.filter(i=>!v[i]&&cand[i]&b);if(cs.length<2)continue;
        const bx=BOX[cs[0]];if(cs.every(i=>BOX[i]===bx)){for(const j of UNITS[bx*3+2])if(!U.includes(j)&&!v[j]&&cand[j]&b){cand[j]&=~b;ch=true;}}}}
    if(ch){note('box-line',3);return true;}
    return false;
  }
  function subsets(n,lvl){ /* naked & hidden subsets of size n */
    for(const U of UNITS){
      const E=U.filter(i=>!v[i]);if(E.length<=n)continue;
      /* naked */
      const pool=E.filter(i=>pc(cand[i])<=n);
      const combo=(arr,k,start,acc,f)=>{if(acc.length===k){f(acc);return;}for(let x=start;x<arr.length;x++){acc.push(arr[x]);combo(arr,k,x+1,acc,f);acc.pop();}};
      let hit=false;
      combo(pool,n,0,[],cs=>{if(hit)return;let m=0;for(const i of cs)m|=cand[i];if(pc(m)!==n)return;
        for(const j of E)if(!cs.includes(j)&&cand[j]&m){cand[j]&=~m;hit=true;}});
      if(hit){note(n===2?'naked pair':'naked triple',lvl);return true;}
      /* hidden */
      const ds=[];for(let d=1;d<=9;d++){const b=BIT(d),k=E.filter(i=>cand[i]&b).length;if(k>=1&&k<=n)ds.push(d);}
      combo(ds,n,0,[],dd=>{if(hit)return;let m=0;for(const d of dd)m|=BIT(d);const cells=E.filter(i=>cand[i]&m);
        if(cells.length!==n)return;for(const i of cells)if(cand[i]&~m){cand[i]&=m;hit=true;}});
      if(hit){note(n===2?'hidden pair':'hidden triple',lvl);return true;}
    }
    return false;
  }
  function fish(n,lvl,name){ /* X-wing (2) / Swordfish (3) on rows and columns */
    for(const [A,B] of [[ROW,COL],[COL,ROW]])for(let d=1;d<=9;d++){const b=BIT(d);
      const lines=[];for(let l=0;l<9;l++){const cs=[];for(let i=0;i<81;i++)if(A[i]===l&&!v[i]&&cand[i]&b)cs.push(B[i]);if(cs.length>=2&&cs.length<=n)lines.push([l,cs]);}
      const combo=(k,start,acc)=>{if(acc.length===k){const cover=new Set();acc.forEach(x=>x[1].forEach(c=>cover.add(c)));if(cover.size!==n)return false;
          const ls=new Set(acc.map(x=>x[0]));let ch=false;for(let i=0;i<81;i++)if(cover.has(B[i])&&!ls.has(A[i])&&!v[i]&&cand[i]&b){cand[i]&=~b;ch=true;}return ch;}
        for(let x=start;x<lines.length;x++){acc.push(lines[x]);if(combo(k,x+1,acc))return true;acc.pop();}return false;};
      if(combo(n,0,[])){note(name,lvl);return true;}}
    return false;
  }
  function xywing(){
    const bi=[];for(let i=0;i<81;i++)if(!v[i]&&pc(cand[i])===2)bi.push(i);
    for(const p of bi){const P=cand[p];
      const wings=PEERS[p].filter(q=>!v[q]&&pc(cand[q])===2&&pc(cand[q]&P)===1);
      for(let x=0;x<wings.length;x++)for(let y=x+1;y<wings.length;y++){const a=wings[x],c=wings[y],A=cand[a],C=cand[c];
        if((A&P)===(C&P))continue;const z=A&C&~P;if(pc(z)!==1)continue;if((A|C|P)!==(P|z))continue;
        let ch=false;for(const j of PEERS[a])if(j!==c&&j!==p&&PEERS[c].includes(j)&&!v[j]&&cand[j]&z){cand[j]&=~z;ch=true;}
        if(ch){note('XY-wing',5);return true;}}}
    return false;
  }
  const steps=[[singles,1],[pointing,3],[()=>subsets(2,3),3],[()=>subsets(3,4),4],[()=>fish(2,4,'X-wing'),4],
    [()=>fish(3,5,'Swordfish'),5],[xywing,5]];
  for(let guard=0;guard<2000;guard++){
    if(v.every(x=>x))return{solved:true,level,used};
    for(let i=0;i<81;i++)if(!v[i]&&!cand[i])return{solved:false,level:99,used};
    let moved=false;
    for(const [f,l] of steps){if(l>maxLevel)break;if(f()){moved=true;break;}}
    if(!moved)return{solved:false,level:99,used};
  }
  return{solved:false,level:99,used};
}

/* ── puzzle for a level ── */
const TARGET={1:{min:36,max:42,need:1,top:1},2:{min:28,max:34,need:1,top:1},3:{min:24,max:32,need:3,top:3},4:{min:22,max:30,need:4,top:4},5:{min:20,max:28,need:5,top:5}};
function dig(sol,R,floor){
  const g=sol.slice(),order=shuffle([...Array(41).keys()],R);  /* cell i and its mirror 80-i */
  let clues=81;
  for(const i of order){
    if(clues<=floor)break;
    const j=80-i,a=g[i],b=g[j];
    g[i]=0;g[j]=0;
    if(countSolutions(g,2)!==1){g[i]=a;g[j]=b;}else clues-=(i===j?1:2);
  }
  return g;
}
function generate(lv,seed,budgetMs){
  const T=TARGET[lv]||TARGET[2],R=rnd(seed||((Math.random()*2**32)>>>0)),t0=Date.now();
  let best=null;
  for(let tries=0;;tries++){
    const sol=fullGrid(R);
    let g=dig(sol,R,T.min);
    let clues=g.filter(x=>x).length;
    /* easy levels: put clues back (keeps uniqueness) until in range */
    if(clues<T.min||lv<=2){const empty=shuffle(g.map((x,i)=>x?-1:i).filter(i=>i>=0),R);
      const want=lv===1?T.min+((R()*(T.max-T.min+1))|0):lv===2?T.min+((R()*(T.max-T.min+1))|0):T.min;
      while(clues<want&&empty.length){const i=empty.pop();g[i]=sol[i];clues++;}}
    const r=grade(g,T.top);
    if(r.solved&&r.level>=T.need&&clues<=T.max+(lv>=4?2:0)){
      return{puzzle:g,solution:sol,level:lv,clues,used:r.used,tries:tries+1,ms:Date.now()-t0};}
    if(r.solved&&(!best||r.level>best.level))best={puzzle:g,solution:sol,level:lv,clues,used:r.used,tries:tries+1,graded:r.level};
    if(Date.now()-t0>(budgetMs||6000)&&best){best.ms=Date.now()-t0;return best;}
    if(tries>4000)break;
  }
  return best;
}

const API={generate,grade,countSolutions,solve,PEERS,ROW,COL,BOX};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
else root.SudokuEngine=API;
if(typeof self!=='undefined'&&typeof window==='undefined'&&typeof self.postMessage==='function'&&typeof module==='undefined'){
  self.onmessage=e=>{const {lv,seed,id}=e.data;self.postMessage({id,...generate(lv,seed,7000)});};
}
})(typeof window!=='undefined'?window:(typeof self!=='undefined'?self:this));
