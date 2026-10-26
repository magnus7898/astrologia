/* math_lab2.js — level „მონაცემები და მოდელები“ for math.html: function grapher, matrix lab, combinatorics,
   probability distributions, descriptive statistics, regression & econometrics, time series, and the
   function game. Formulas are typed visually (mathinput.js — exponents, indices, roots without ^).
   Registers through window.MATHLAB_EXT, so it must load BEFORE math_lab.js.                         */
(function(){
'use strict';
(window.MATHLAB_EXT=window.MATHLAB_EXT||[]).push(function({K}){
const {$,esc,clamp,TAU,COL,anim,canvas,sl,bindSl,btns,bindBtns,FX,card,mplot,niceStep,dot,arrow,txt,drag,r3,sup,fmtN}=K;
const VI='#a585ef',VL='#d6c6ff',PAL=['#ecd59a','#5fc8d8','#e8705a','#a585ef','#6fcf8a','#f0a0c8'];

/* ── styles for this level ── */
if(!document.getElementById('ml2css')){const s=document.createElement('style');s.id='ml2css';s.textContent=`
.actl .ml2-rows,.ml2-rows{display:grid!important;gap:8px;width:100%}.actl .ml2-sub,.ml2-sub{display:grid!important}.actl .ml2-flex{display:flex!important}.ml2-row{display:grid;grid-template-columns:18px minmax(0,1fr) auto;gap:8px;align-items:center}
.ml2-row .sw{width:14px;height:14px;border-radius:50%;cursor:pointer;border:2px solid transparent}.ml2-row .sw.off{opacity:.25}
.ml2-row select,.ml2-in,.ml2 select{background:#0b0816;color:#efe6d4;border:1px solid rgba(201,168,76,.3);border-radius:8px;padding:5px 7px;font:inherit;font-size:13px}
.ml2-row .x{background:none;border:0;color:#b3a68f;cursor:pointer;font-size:16px}
.ml2-sub{display:grid;gap:6px}.ml2-par{display:flex;align-items:center;gap:8px;font-size:13px}.ml2-par input[type=range]{flex:1;min-width:0}
.ml2-par button,.ml2-mini{background:transparent;border:1px solid rgba(201,168,76,.35);color:#ecd59a;border-radius:12px;padding:2px 9px;cursor:pointer;font-size:12px}
.ml2-mat{display:inline-grid;gap:3px;padding:6px 8px;border-left:2px solid #b3a68f;border-right:2px solid #b3a68f;border-radius:6px;margin:4px 0}
.ml2-mat input{width:56px;background:#0b0816;color:#efe6d4;border:1px solid rgba(165,133,239,.3);border-radius:5px;padding:4px;text-align:center;font:13px ui-monospace,Menlo,monospace}
.ml2-mo{display:inline-grid;gap:2px 14px;padding:4px 10px;border-left:2px solid #ecd59a;border-right:2px solid #ecd59a;border-radius:6px;font:13px ui-monospace,Menlo,monospace;color:#efe6d4;vertical-align:middle}
.ml2-mo span{text-align:right}
.ml2-tab{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}.ml2-tab th,.ml2-tab td{padding:4px 7px;border-bottom:1px solid rgba(201,168,76,.15);text-align:right}
.ml2-tab th:first-child,.ml2-tab td:first-child{text-align:left}.ml2-tab th{color:#c9a84c;font-weight:400;font-size:12px}
.ml2-steps{max-height:260px;overflow:auto;font-size:13px;display:grid;gap:8px}.ml2-steps .s{border-left:2px solid rgba(165,133,239,.4);padding-left:8px}
textarea.ml2-in{width:100%;min-height:90px;font:12px ui-monospace,Menlo,monospace;box-sizing:border-box}
.ml2-flex{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.ml2-pill{display:inline-block;padding:1px 8px;border-radius:10px;font-size:12px}
.ml2-pill.ok{background:rgba(111,207,138,.15);color:#6fcf8a}.ml2-pill.no{background:rgba(232,112,90,.15);color:#e8705a}
.ml2-big{display:block;text-align:center;padding:14px;border:1px solid rgba(236,213,154,.4);border-radius:14px;color:#ecd59a;text-decoration:none;font-size:16px;margin:8px 0}
.ml2-big:hover{background:rgba(236,213,154,.08)}`;document.head.appendChild(s);}

/* ═════════════ numeric helpers ═════════════ */
const rng=seed=>{let a=seed>>>0||1;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
const gauss=R=>{let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v);};
function lgamma(z){if(z<0.5)return Math.log(Math.PI/Math.abs(Math.sin(Math.PI*z)))-lgamma(1-z);z-=1;const c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
  let x=c[0];for(let i=1;i<9;i++)x+=c[i]/(z+i);const t=z+7.5;return 0.5*Math.log(TAU)+(z+0.5)*Math.log(t)-t+Math.log(x);}
const gammaF=z=>z<0.5?Math.PI/(Math.sin(Math.PI*z)*gammaF(1-z)):Math.exp(lgamma(z));
const lfact=n=>lgamma(n+1),lchoose=(n,k)=>lfact(n)-lfact(k)-lfact(n-k);
function choose(n,k){if(k<0||k>n)return 0;k=Math.min(k,n-k);let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r);}
const fact=n=>{let r=1;for(let i=2;i<=n;i++)r*=i;return r;};
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const normPdf=(x,m=0,s=1)=>Math.exp(-(((x-m)/s)**2)/2)/(s*Math.sqrt(TAU)),normCdf=(x,m=0,s=1)=>0.5*(1+erf((x-m)/(s*Math.SQRT2)));
function normInv(p){/* Acklam */if(p<=0)return -Infinity;if(p>=1)return Infinity;const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],
  b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];
  const q=Math.min(p,1-p);let x;if(q>0.02425){const u=q-0.5,r=u*u;x=(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*u/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
  else{const u=Math.sqrt(-2*Math.log(q));x=(((((c[0]*u+c[1])*u+c[2])*u+c[3])*u+c[4])*u+c[5])/((((d[0]*u+d[1])*u+d[2])*u+d[3])*u+1);}return p<0.5?x:-x;}
function betacf(a,b,x){let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<1e-30)d=1e-30;d=1/d;let h=d;
  for(let m=1;m<=200;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;h*=d*c;
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<3e-12)break;}return h;}
function ibeta(x,a,b){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(lgamma(a+b)-lgamma(a)-lgamma(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b;}
function igamma(a,x){/* regularized lower P(a,x) */if(x<=0)return 0;if(x<a+1){let s=1/a,t=s;for(let n=1;n<300;n++){t*=x/(a+n);s+=t;if(Math.abs(t)<Math.abs(s)*1e-14)break;}return s*Math.exp(-x+a*Math.log(x)-lgamma(a));}
  let b=x+1-a,c=1e30,d=1/b,h=d;for(let i=1;i<300;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-30)d=1e-30;c=b+an/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-14)break;}return 1-Math.exp(-x+a*Math.log(x)-lgamma(a))*h;}
const tCdf=(t,v)=>{const x=v/(v+t*t),p=0.5*ibeta(x,v/2,0.5);return t>0?1-p:p;};
const tPdf=(t,v)=>Math.exp(lgamma((v+1)/2)-lgamma(v/2))/Math.sqrt(v*Math.PI)*Math.pow(1+t*t/v,-(v+1)/2);
const tInv=(p,v)=>{let lo=-60,hi=60;for(let i=0;i<100;i++){const m=(lo+hi)/2;tCdf(m,v)<p?lo=m:hi=m;}return (lo+hi)/2;};
const chiCdf=(x,k)=>igamma(k/2,x/2),chiPdf=(x,k)=>x<=0?0:Math.exp((k/2-1)*Math.log(x)-x/2-(k/2)*Math.LN2-lgamma(k/2));
const fCdf=(x,d1,d2)=>x<=0?0:ibeta(d1*x/(d1*x+d2),d1/2,d2/2);
const pFmt=p=>p<1e-4?'< 0.0001':p.toFixed(4),stars=p=>p<0.001?'***':p<0.01?'**':p<0.05?'*':p<0.1?'·':'';
const nf=(x,d=4)=>!isFinite(x)?'—':Math.abs(x)>=1e6||(Math.abs(x)<1e-4&&x!==0)?x.toExponential(2):(+x.toFixed(d)).toString();
/* stats */
const sum=a=>a.reduce((s,x)=>s+x,0),mean=a=>sum(a)/a.length;
const varS=a=>{const m=mean(a);return sum(a.map(x=>(x-m)**2))/(a.length-1);};
const quant=(s,p)=>{const h=(s.length-1)*p,lo=Math.floor(h);return s[lo]+(h-lo)*((s[lo+1]??s[lo])-s[lo]);};
const parseNums=t=>String(t).replace(/,(?=\d)/g,'.').split(/[\s;,\t]+/).map(Number).filter(Number.isFinite);
/* rational display */
function frac(x,maxD=1000){if(!isFinite(x))return '—';if(Math.abs(x-Math.round(x))<1e-10)return String(Math.round(x));let a=Math.floor(x),h1=1,h0=0,k1=0,k0=1,r=x;
  for(let i=0;i<30;i++){a=Math.floor(r);const h2=a*h1+h0,k2=a*k1+k0;if(k2>maxD)break;h0=h1;h1=h2;k0=k1;k1=k2;if(Math.abs(x-h1/k1)<1e-10)return k1===1?String(h1):`${h1}/${k1}`;r=1/(r-a);if(!isFinite(r))break;}
  return nf(x,4);}

/* ═════════════ linear algebra ═════════════ */
const M0=(r,c,v=0)=>Array.from({length:r},()=>Array(c).fill(v)),Mcopy=A=>A.map(r=>r.slice()),Mid=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
const Mt=A=>A[0].map((_,j)=>A.map(r=>r[j])),Mmul=(A,B)=>A.map(r=>B[0].map((_,j)=>r.reduce((s,v,k)=>s+v*B[k][j],0)));
const Madd=(A,B,s=1)=>A.map((r,i)=>r.map((v,j)=>v+s*B[i][j]));
function rref(A,log){const M=Mcopy(A),R=M.length,C=M[0].length;let lead=0;const steps=[];const pm=()=>M.map(r=>r.slice());
  for(let r=0;r<R&&lead<C;r++){let i=r;while(Math.abs(M[i][lead])<1e-12){i++;if(i===R){i=r;lead++;if(lead===C)return {M,steps,rank:r};}}
    if(i!==r){[M[i],M[r]]=[M[r],M[i]];steps.push([`R${i+1} ↔ R${r+1}`,pm()]);}
    const lv=M[r][lead];if(Math.abs(lv-1)>1e-12){M[r]=M[r].map(v=>v/lv);steps.push([`R${r+1} ÷ ${frac(lv)}`,pm()]);}
    for(let k=0;k<R;k++){if(k===r)continue;const f=M[k][lead];if(Math.abs(f)>1e-12){M[k]=M[k].map((v,j)=>v-f*M[r][j]);steps.push([`R${k+1} − ${frac(f)}·R${r+1}`,pm()]);}}
    lead++;}
  for(const row of M)for(let j=0;j<C;j++)if(Math.abs(row[j])<1e-12)row[j]=0;
  const rank=M.filter(r=>r.some(v=>Math.abs(v)>1e-10)).length;return {M,steps,rank};}
function det(A){const n=A.length,M=Mcopy(A);let d=1;for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;if(Math.abs(M[p][c])<1e-14)return 0;
  if(p!==c){[M[p],M[c]]=[M[c],M[p]];d=-d;}d*=M[c][c];for(let r=c+1;r<n;r++){const f=M[r][c]/M[c][c];for(let k=c;k<n;k++)M[r][k]-=f*M[c][k];}}return d;}
function inv(A){const n=A.length,aug=A.map((r,i)=>[...r,...Mid(n)[i]]),{M,steps,rank}=rref(aug);if(rank<n||M.some((r,i)=>Math.abs(r[i]-1)>1e-9))return null;return {I:M.map(r=>r.slice(n)),steps};}
function eig(A){/* real Schur by shifted QR on a copy; returns [{re,im}] */const n=A.length;if(n===1)return [{re:A[0][0],im:0}];
  if(n===2){const [a,b]=A[0],[c,d]=A[1],tr=a+d,dt=a*d-b*c,D=tr*tr/4-dt;return D>=0?[{re:tr/2+Math.sqrt(D),im:0},{re:tr/2-Math.sqrt(D),im:0}]:[{re:tr/2,im:Math.sqrt(-D)},{re:tr/2,im:-Math.sqrt(-D)}];}
  let H=Mcopy(A);const out=[];let m=n;
  for(let it=0;it<3000&&m>0;it++){if(m===1){out.push({re:H[0][0],im:0});m=0;break;}
    if(Math.abs(H[m-1][m-2])<1e-10*(Math.abs(H[m-1][m-1])+Math.abs(H[m-2][m-2])+1e-30)){out.push({re:H[m-1][m-1],im:0});m--;H=H.slice(0,m).map(r=>r.slice(0,m));continue;}
    if(m===2||Math.abs(H[m-2][m-3]||0)<1e-10){const sub=[[H[m-2][m-2],H[m-2][m-1]],[H[m-1][m-2],H[m-1][m-1]]];if(it>60||m===2){out.push(...eig(sub));m-=2;H=H.slice(0,m).map(r=>r.slice(0,m));continue;}}
    const mu=H[m-1][m-1]+(it%11===10?Math.abs(H[m-1][m-2]):0);for(let i=0;i<m;i++)H[i][i]-=mu;
    /* QR (Gram–Schmidt) */const Q=M0(m,m),R=M0(m,m);for(let j=0;j<m;j++){let v=H.map(r=>r[j]);for(let k=0;k<j;k++){const qk=Q.map(r=>r[k]);R[k][j]=qk.reduce((s,x,i)=>s+x*H[i][j],0);v=v.map((x,i)=>x-R[k][j]*qk[i]);}
      R[j][j]=Math.hypot(...v)||1e-300;v.forEach((x,i)=>Q[i][j]=x/R[j][j]);}
    H=Mmul(R,Q);for(let i=0;i<m;i++)H[i][i]+=mu;}
  return out;}
function nullVec(A,lam){const n=A.length,B=A.map((r,i)=>r.map((v,j)=>v-(i===j?lam:0))),{M}=rref(B);const piv=[],free=[];let row=0;
  for(let j=0;j<n;j++){if(row<n&&Math.abs(M[row][j]-1)<1e-6&&M[row].slice(0,j).every(v=>Math.abs(v)<1e-6)){piv.push([row,j]);row++;}else free.push(j);}
  if(!free.length)return null;const v=Array(n).fill(0);v[free[0]]=1;for(const [r,j] of piv)v[j]=-M[r][free[0]];const L=Math.hypot(...v);return v.map(x=>x/L);}
/* OLS for the regression module: X includes the intercept column */
function ols(X,y,robust){const n=X.length,k=X[0].length,Xt=Mt(X),XtX=Mmul(Xt,X),I=inv(XtX);if(!I)return null;const XtXi=I.I;
  const b=Mmul(XtXi,Mmul(Xt,y.map(v=>[v]))).map(r=>r[0]),fit=X.map(r=>r.reduce((s,v,j)=>s+v*b[j],0)),e=y.map((v,i)=>v-fit[i]);
  const sse=sum(e.map(v=>v*v)),ym=mean(y),sst=sum(y.map(v=>(v-ym)**2)),df=n-k,s2=sse/df;
  let V=XtXi.map(r=>r.map(v=>v*s2));
  if(robust){const meat=M0(k,k);for(let i=0;i<n;i++)for(let a=0;a<k;a++)for(let c=0;c<k;c++)meat[a][c]+=X[i][a]*X[i][c]*e[i]*e[i];V=Mmul(Mmul(XtXi,meat),XtXi).map(r=>r.map(v=>v*n/df));}
  const se=b.map((_,j)=>Math.sqrt(V[j][j])),t=b.map((v,j)=>v/se[j]),p=t.map(v=>2*(1-tCdf(Math.abs(v),df))),R2=1-sse/sst,aR2=1-(1-R2)*(n-1)/df;
  const F=((sst-sse)/(k-1))/(sse/df),Fp=k>1?1-fCdf(F,k-1,df):NaN,ll=-n/2*(Math.log(TAU)+Math.log(sse/n)+1);
  return {b,se,t,p,fit,e,sse,sst,R2,aR2,F,Fp,df,n,k,s:Math.sqrt(s2),aic:-2*ll+2*k,bic:-2*ll+k*Math.log(n),XtXi};}

/* ═════════════ 1 · function grapher ═════════════ */
const grapher={id:'grapher',ico:'📈',t:'ფუნქციების გრაფიკები',s:'ნებისმიერი ფორმულა · პარამეტრები · ანიმაცია',
 build(root){
  const MI=window.MI;
  root.innerHTML=`<div id="grC"></div><div class="arow"><div class="acol"><div class="actl ml2">
    <div class="ml2-rows" id="grRows"></div>
    <div class="ml2-flex"><button class="ml2-mini" id="grAdd">+ დამატება</button>
      <select id="grType" title="ტიპი"><option value="f">y = f(x)</option><option value="p">პოლარული r(θ)</option><option value="xy">პარამეტრული x(t), y(t)</option></select>
      <select id="grEx"><option value="">მაგალითები…</option></select></div>
    <div class="ml2-sub" id="grPars"></div>
    <div class="ml2-flex" style="font-size:13px"><label><input type="checkbox" id="grD"> წარმოებული f′</label><label><input type="checkbox" id="grI"> ინტეგრალი</label>
      <label><input type="checkbox" id="grM" checked> ფესვები · ექსტრემუმები · გადაკვეთები</label></div>
    <div id="grIB" hidden>${sl('grA','a',-10,10,0.1,-1)}${sl('grB','b',-10,10,0.1,2)}</div>
    <div id="grTB">${sl('grTm','t / θ: 0 … ·π',1,24,1,2)}</div>
    <div class="ml2-flex"><button class="ml2-mini" id="grZi">＋ გადიდება</button><button class="ml2-mini" id="grZo">－</button><button class="ml2-mini" id="grZr">⟲ საწყისი</button>
      <a class="ml2-mini" href="vector.html" target="_blank" style="text-decoration:none">✎ ვექტორული რედაქტორი ↗</a></div>
    <div class="hint">ჩაწერე ფორმულა ისე, როგორც ქაღალდზე: ხარისხი — <b>↑</b> ან ღილაკი x<sup>□</sup>, ფესვი — <b>sqrt</b> ან √, წილადი — <b>/</b>, ინდექსი — <b>_</b>. ასოები a, b, k… ავტომატურად იქცევა სლაიდერად (▶ — ანიმაცია). გადაათრიე გრაფიკი, ბორბალი — გადიდება.</div>
  </div></div><div class="acol"><div id="grInfo" class="ainfo"></div></div></div>
  ${card('ფორმულები',FX([['f′(x) = lim<sub>h→0</sub> (f(x+h) − f(x)) / h','წარმოებული',{s:[['f′(x₀)','მხების დახრა წერტილში']],w:'ნიშანი გვიჩვენებს, იზრდება თუ კლებულობს ფუნქცია; ნული — ექსტრემუმის კანდიდატია.'}],
    ['∫<sub>a</sub><sup>b</sup> f(x) dx ≈ (h/3)·[f₀ + 4f₁ + 2f₂ + … + fₙ]','სიმპსონის წესი',{s:[],w:'ასე ითვლება ფართობი ეკრანზე — 400 ზოლით.'}],
    ['x = r·cos θ, &nbsp; y = r·sin θ','პოლარული → დეკარტული',{s:[['r(θ)','მანძილი სათავიდან']],w:'r = cos(kθ) ხატავს „ვარდს“: k კენტისას k ფურცელი, ლუწისას 2k.'}],
    ['f(x) = a·sin(b·x + c)','ტრანსფორმაციები',{s:[['a','ამპლიტუდა — ვერტიკალური გაჭიმვა'],['b','სიხშირე — ჰორიზონტალური შეკუმშვა'],['c','ფაზა — გადაწევა']],w:'ნებისმიერი f(x)-ისთვის: a·f(b(x − h)) + k.'}]]))}`;
  const c=canvas($('grC'),900,500),g=c.g,W=900,H=500;
  let V={x0:-10,x1:10,y0:-5.6,y1:5.6};const V0={...V};
  const rows=[],P={};let mouse=null,dragS=null,tMax=2;
  const EX=[['a·sin(bx+c)','f','a\\sin\\left(bx+c\\right)'],['x³ − 3x','f','x^3-3x'],['ზარი e^(−x²)','f','e^{-x^2}'],['ჰიპერბოლა','f','\\frac{1}{x}'],['ფესვი','f','\\sqrt{x}'],
    ['მოდული','f','\\left|x\\right|-2'],['ხარისხი xᵃ','f','x^{a}'],['ვარდი r = cos(kθ)','p','\\cos\\left(k\\theta\\right)'],['კარდიოიდი','p','1+\\cos\\theta'],['სპირალი','p','\\frac{\\theta}{\\pi}'],
    ['ლისაჟუ','xy','\\sin\\left(at\\right)','\\sin\\left(bt\\right)'],['გული','xy','16\\sin^3t','13\\cos t-5\\cos\\left(2t\\right)-2\\cos\\left(3t\\right)-\\cos\\left(4t\\right)'],['ტეილორი sin','f','x-\\frac{x^3}{6}+\\frac{x^5}{120}']];
  $('grEx').innerHTML+=EX.map((e,i)=>`<option value="${i}">${e[0]}</option>`).join('');
  const VARS={f:['x'],p:['theta','x'],xy:['t']},LAB={f:'y =',p:'r =',xy:'x, y ='};
  function addRow(type,tex,tex2){const r={type,vis:true,col:PAL[rows.length%PAL.length],c1:null,c2:null};rows.push(r);
    const d=document.createElement('div');d.className='ml2-row';d.innerHTML=`<span class="sw" style="background:${r.col}" title="ჩართვა / გამორთვა"></span><div class="ml2-sub"></div><button class="x" title="წაშლა">✕</button>`;
    $('grRows').appendChild(d);r.el=d;const box=d.querySelector('.ml2-sub');
    const recompile=()=>{r.c1=MI.compile(r.f1?r.f1.latex():'',{vars:VARS[type]});r.c2=type==='xy'?MI.compile(r.f2?r.f2.latex():'',{vars:['t']}):null;syncPars();};
    const lab=document.createElement('div');lab.style.cssText='font-size:12px;color:#b3a68f';lab.textContent=type==='f'?'y = f(x)':type==='p'?'r(θ) =':'x(t) =  ·  y(t) =';box.appendChild(lab);
    r.f1=MI.field(box,{value:tex,onInput:recompile,onReady:recompile});
    if(type==='xy')r.f2=MI.field(box,{value:tex2||'',onInput:recompile,onReady:recompile});
    d.querySelector('.sw').onclick=e=>{r.vis=!r.vis;e.target.classList.toggle('off',!r.vis);};
    d.querySelector('.x').onclick=()=>{rows.splice(rows.indexOf(r),1);d.remove();syncPars();};}
  function syncPars(){const need=new Set();rows.forEach(r=>[r.c1,r.c2].forEach(cc=>cc&&cc.params.forEach(p=>need.add(p))));
    for(const k of Object.keys(P))if(!need.has(k)){P[k].el.remove();delete P[k];}
    for(const k of need)if(!P[k]){const def={a:2,b:1,c:0,k:3,n:2}[k]??1,e=document.createElement('div');e.className='ml2-par';
      e.innerHTML=`<b style="min-width:42px">${esc(k.replace('_',''))}</b><input type="range" min="-10" max="10" step="0.05" value="${def}"><span style="min-width:44px;text-align:right">${def}</span><button type="button">▶</button>`;
      $('grPars').appendChild(e);const p=P[k]={v:def,play:false,ph:0,el:e},rg=e.querySelector('input'),sp=e.querySelector('span'),b=e.querySelector('button');
      rg.oninput=()=>{p.v=+rg.value;sp.textContent=r3(p.v);};b.onclick=()=>{p.play=!p.play;b.textContent=p.play?'❚❚':'▶';p.ph=Math.acos(clamp(1-2*(p.v+10)/20,-1,1));};p.rg=rg;p.sp=sp;}}
  $('grAdd').onclick=()=>{const t=$('grType').value;addRow(t,t==='f'?'x^2':t==='p'?'2\\sin\\left(3\\theta\\right)':'\\cos t',t==='xy'?'\\sin\\left(2t\\right)':'');};
  $('grEx').onchange=e=>{const x=EX[+e.target.value];if(x)addRow(x[1],x[2],x[3]);e.target.value='';};
  addRow('f','a\\sin\\left(bx+c\\right)');addRow('f','\\frac{x^2}{4}-1');
  bindSl('grA',()=>{});bindSl('grB',()=>{});bindSl('grTm',v=>tMax=v,v=>v+'π');
  $('grI').onchange=e=>{$('grIB').hidden=!e.target.checked;};
  const zoom=(f,cx,cy)=>{cx=cx??(V.x0+V.x1)/2;cy=cy??(V.y0+V.y1)/2;V={x0:cx+(V.x0-cx)*f,x1:cx+(V.x1-cx)*f,y0:cy+(V.y0-cy)*f,y1:cy+(V.y1-cy)*f};};
  $('grZi').onclick=()=>zoom(0.7);$('grZo').onclick=()=>zoom(1/0.7);$('grZr').onclick=()=>{V={...V0};};
  const ix=px=>V.x0+px/W*(V.x1-V.x0),iy=py=>V.y1-py/H*(V.y1-V.y0);
  c.style.touchAction='none';c.style.cursor='crosshair';
  c.addEventListener('pointerdown',e=>{dragS={p:c.pt(e),V:{...V}};c.setPointerCapture(e.pointerId);});
  c.addEventListener('pointermove',e=>{const p=c.pt(e);mouse=p;if(dragS){const dx=(p[0]-dragS.p[0])/W*(V.x1-V.x0),dy=(p[1]-dragS.p[1])/H*(V.y1-V.y0);
    V={x0:dragS.V.x0-dx,x1:dragS.V.x1-dx,y0:dragS.V.y0+dy,y1:dragS.V.y1+dy};}});
  c.addEventListener('pointerup',()=>dragS=null);c.addEventListener('pointerleave',()=>{mouse=null;});
  c.addEventListener('wheel',e=>{e.preventDefault();const p=c.pt(e);zoom(e.deltaY<0?0.88:1/0.88,ix(p[0]),iy(p[1]));},{passive:false});
  const scope=extra=>{const s={};for(const k in P)s[k]=P[k].v;return Object.assign(s,extra);};
  function fOf(r){const f=r.c1.f;return x=>f(scope({x}));}
  function roots(F,a,b,n=800){const out=[];let px=a,py=F(a);for(let i=1;i<=n;i++){const x=a+(b-a)*i/n,y=F(x);if(isFinite(py)&&isFinite(y)&&py*y<=0&&Math.abs(py-y)<(V.y1-V.y0)){let lo=px,hi=x,fl=py;
    for(let k=0;k<50;k++){const m=(lo+hi)/2,fm=F(m);if(fl*fm<=0)hi=m;else{lo=m;fl=fm;}}const r=(lo+hi)/2;if(!out.length||Math.abs(out[out.length-1]-r)>(b-a)/n)out.push(r);}px=x;py=y;}return out;}
  anim(dt=>{
    for(const k in P){const p=P[k];if(p.play){p.ph+=dt*0.9;p.v=-10+20*(1-Math.cos(p.ph))/2;p.v=Math.round(p.v*100)/100;p.rg.value=p.v;p.sp.textContent=r3(p.v);}}
    const M=mplot(g,{x:[V.x0,V.x1],y:[V.y0,V.y1],m:[0,0,0,0],bg:'#0b0816'});
    const info=[],fl=rows.filter(r=>r.vis&&r.type==='f'&&r.c1&&r.c1.ok);
    if($('grI').checked&&fl[0]){const F=fOf(fl[0]),a=+$('grA').value,b=+$('grB').value,n=400,h=(b-a)/n;let s=0;
      g.fillStyle='rgba(236,213,154,.16)';g.beginPath();g.moveTo(M.X(a),M.Y(0));for(let i=0;i<=n;i++){const x=a+h*i,y=F(x);g.lineTo(M.X(x),M.Y(isFinite(y)?y:0));s+=(i===0||i===n?1:i%2?4:2)*(isFinite(y)?y:0);}
      g.lineTo(M.X(b),M.Y(0));g.closePath();g.fill();s*=h/3;info.push(`<b>∫</b> ${r3(a)} … ${r3(b)} f₁ dx ≈ <b>${nf(s,5)}</b>`);}
    rows.forEach((r,ri)=>{if(!r.vis||!r.c1)return;if(!r.c1.ok||(r.type==='xy'&&!(r.c2&&r.c2.ok)))return;
      g.strokeStyle=r.col;g.lineWidth=2.2;g.beginPath();let pen=false,pyy=null;
      if(r.type==='f'){const F=fOf(r);for(let px=0;px<=W;px+=1){const x=ix(px),y=F(x);if(!isFinite(y)){pen=false;continue;}const Y=M.Y(y);if(pen&&Math.abs(Y-pyy)>H*1.5)pen=false;pen?g.lineTo(px,Y):g.moveTo(px,Y);pen=true;pyy=Y;}g.stroke();
        if($('grD').checked){const hh=(V.x1-V.x0)*1e-4;g.setLineDash([6,5]);g.lineWidth=1.4;g.beginPath();pen=false;for(let px=0;px<=W;px+=2){const x=ix(px),y=(F(x+hh)-F(x-hh))/(2*hh);if(!isFinite(y)){pen=false;continue;}const Y=M.Y(y);if(pen&&Math.abs(Y-pyy)>H)pen=false;pen?g.lineTo(px,Y):g.moveTo(px,Y);pen=true;pyy=Y;}g.stroke();g.setLineDash([]);}}
      else{const n=2400,T=tMax*Math.PI;for(let i=0;i<=n;i++){const t=T*i/n;let x,y;
          if(r.type==='p'){const rr=r.c1.f(scope({theta:t,x:t}));x=rr*Math.cos(t);y=rr*Math.sin(t);}else{x=r.c1.f(scope({t}));y=r.c2.f(scope({t}));}
          if(!isFinite(x)||!isFinite(y)){pen=false;continue;}const X=M.X(x),Y=M.Y(y);pen?g.lineTo(X,Y):g.moveTo(X,Y);pen=true;}g.stroke();}
      info.push(`<span style="color:${r.col}">●</span> <code style="font-size:12px">${esc(r.c1.expr)}${r.c2?' ; '+esc(r.c2.expr):''}</code>`);});
    rows.forEach(r=>{if(r.c1&&!r.c1.ok&&r.c1.error)info.push(`<span style="color:#e8705a">✗ ${esc(r.c1.error)}</span>`);});
    /* roots, extrema, intersections */
    if($('grM').checked){const pts=[];
      fl.forEach(r=>{const F=fOf(r);roots(F,V.x0,V.x1).forEach(x=>pts.push([x,0,r.col,'ფესვი']));
        const hh=(V.x1-V.x0)*1e-5,D=x=>(F(x+hh)-F(x-hh))/(2*hh);roots(D,V.x0,V.x1,500).forEach(x=>{const y=F(x);if(isFinite(y)&&y>V.y0&&y<V.y1)pts.push([x,y,r.col,D(x-hh*50)>0?'მაქსიმუმი':'მინიმუმი']);});});
      for(let i=0;i<fl.length;i++)for(let j=i+1;j<fl.length;j++){const A=fOf(fl[i]),B=fOf(fl[j]);roots(x=>A(x)-B(x),V.x0,V.x1).forEach(x=>pts.push([x,A(x),'#fff','გადაკვეთა']));}
      pts.slice(0,40).forEach(([x,y,col,lab])=>{dot(g,M.X(x),M.Y(y),4,col);g.strokeStyle='#0b0816';g.lineWidth=1;g.beginPath();g.arc(M.X(x),M.Y(y),4,0,TAU);g.stroke();});
      if(pts.length)info.push('<div style="font-size:12px;margin-top:4px">'+pts.slice(0,10).map(p=>`${p[3]}: (${r3(p[0])}; ${r3(p[1])})`).join('<br>')+(pts.length>10?'<br>…':'')+'</div>');}
    /* trace */
    if(mouse&&!dragS&&fl[0]){const x=ix(mouse[0]);let best=null;fl.forEach(r=>{const y=fOf(r)(x);if(isFinite(y)){const d=Math.abs(M.Y(y)-mouse[1]);if(!best||d<best.d)best={d,r,y};}});
      if(best&&best.d<60){const F=fOf(best.r),hh=(V.x1-V.x0)*1e-5,k=(F(x+hh)-F(x-hh))/(2*hh),X=M.X(x),Y=M.Y(best.y);
        g.strokeStyle='rgba(255,255,255,.25)';g.setLineDash([3,4]);g.beginPath();g.moveTo(X,0);g.lineTo(X,H);g.moveTo(0,Y);g.lineTo(W,Y);g.stroke();g.setLineDash([]);
        if(isFinite(k)){g.strokeStyle=best.r.col;g.globalAlpha=.55;g.lineWidth=1.2;g.beginPath();g.moveTo(M.X(V.x0),M.Y(best.y+k*(V.x0-x)));g.lineTo(M.X(V.x1),M.Y(best.y+k*(V.x1-x)));g.stroke();g.globalAlpha=1;}
        dot(g,X,Y,5,best.r.col);txt(g,`(${r3(x)}; ${r3(best.y)})  f′ = ${r3(k)}`,clamp(X+8,0,W-190),clamp(Y-10,14,H-6),'#efe6d4','12px sans-serif','left');}}
    $('grInfo').innerHTML=info.join('<br>')||'<div class="hint">ჩაწერე ფორმულა მარცხნივ.</div>';
  });
 }};

/* ═════════════ 2 · matrix lab ═════════════ */
const matx={id:'matx',ico:'▦',t:'მატრიცების ლაბორატორია',s:'მოქმედებები ნაბიჯებით · საკუთრივი ვექტორები · გარდაქმნა',
 build(root){
  const sizeSel=(id,v)=>`<select id="${id}">${[1,2,3,4,5].map(n=>`<option${n===v?' selected':''}>${n}</option>`).join('')}</select>`;
  root.innerHTML=`<div class="arow"><div class="acol"><div class="actl ml2">
     <div class="ml2-flex"><b>A</b> ${sizeSel('mxAr',3)} × ${sizeSel('mxAc',3)} &nbsp; <b>B</b> ${sizeSel('mxBr',3)} × ${sizeSel('mxBc',1)}
       <label style="font-size:13px"><input type="checkbox" id="mxFr" checked> წილადებით</label></div>
     <div class="ml2-flex" style="align-items:flex-start;gap:16px"><div><div class="hint">A</div><div id="mxA"></div></div><div><div class="hint">B</div><div id="mxB"></div></div></div>
     <div class="abt" id="mxOps">${[['add','A + B'],['sub','A − B'],['mul','A · B'],['k','k · A'],['T','Aᵀ'],['det','det A'],['inv','A⁻¹'],['rank','რანგი'],['rref','RREF'],['eig','საკუთრივი'],['solve','A·x = B'],['pow','Aⁿ'],['tr','კვალი']].map(([k,l])=>`<button data-k="${k}">${l}</button>`).join('')}</div>
     <div class="ml2-flex" style="font-size:13px">k = <input class="ml2-in" id="mxK" value="2" style="width:60px"> &nbsp; n = <input class="ml2-in" id="mxN" value="3" style="width:60px">
       <button class="ml2-mini" id="mxRnd">🎲 შემთხვევითი</button><button class="ml2-mini" id="mxSw">A ↔ B</button></div>
   </div></div><div class="acol"><div id="mxOut" class="ainfo" style="min-height:120px"></div><div id="mxSteps" class="ml2-steps"></div></div></div>
   <div class="arow"><div class="acol"><div id="mxC"></div></div><div class="acol"><div class="actl">
     <div class="hint">სიბრტყის გარდაქმნა 2×2 მატრიცით T (A-ს ზედა მარცხენა 2×2 ნაწილი). ბადე, ერთეულოვანი კვადრატი და „F“ ფიგურა იღუნება I-დან T-მდე.</div>
     ${sl('mxT','t',0,1,0.01,1)}<div class="abt"><button id="mxPl">▶ ანიმაცია</button></div><div id="mxTi"></div></div></div></div>
   ${card('ფორმულები',FX([['det[a b; c d] = ad − bc','დეტერმინანტი 2×2',{s:[],w:'გარდაქმნის შემდეგ ფართობის მასშტაბი; ნიშანი — ორიენტაცია (არეკვლა).'}],
     ['A⁻¹ = adj(A) / det A','შებრუნებული',{s:[],w:'არსებობს მხოლოდ det ≠ 0-ზე. აქ გაუსი–ჟორდანით: [A | I] → [I | A⁻¹].'}],
     ['A·v = λ·v &nbsp;⇔&nbsp; det(A − λI) = 0','საკუთრივი მნიშვნელობები',{s:[['v','საკუთრივი ვექტორი — მიმართულება არ იცვლება'],['λ','გაჭიმვის კოეფიციენტი']],w:'Google-ის PageRank, ვიბრაციის რეჟიმები, PCA — ყველა საკუთრივ ვექტორებზეა.'}],
     ['rank A = n − dim ker A','რანგი',{s:[],w:'დამოუკიდებელი სტრიქონების რაოდენობა. A·x = b ამოხსნადია ⇔ rank A = rank[A|b].'}]]))}`;
  const mk=(id,r,cc,vals)=>{const h=$(id);h.innerHTML=`<div class="ml2-mat" style="grid-template-columns:repeat(${cc},auto)">${Array.from({length:r*cc},(_,i)=>`<input value="${vals&&vals[i]!=null?vals[i]:0}">`).join('')}</div>`;};
  const read=id=>{const h=$(id).querySelector('.ml2-mat'),cols=h.style.gridTemplateColumns.match(/repeat\((\d+)/)[1]|0,v=[...h.querySelectorAll('input')].map(i=>{try{return window.math?math.evaluate(i.value.replace(',','.')):+i.value;}catch(e){return NaN;}});
    const out=[];for(let i=0;i<v.length;i+=cols)out.push(v.slice(i,i+cols));return out;};
  const cur=id=>{try{return read(id).flat();}catch(e){return null;}};
  const resize=(id,r,cc)=>{const old=$(id).querySelector('.ml2-mat')?read(id):[];const vals=[];for(let i=0;i<r;i++)for(let j=0;j<cc;j++)vals.push(old[i]&&old[i][j]!=null&&isFinite(old[i][j])?old[i][j]:(i===j?1:0));mk(id,r,cc,vals);};
  mk('mxA',3,3,[2,1,0,1,3,1,0,1,4]);mk('mxB',3,1,[1,2,3]);
  ['mxAr','mxAc'].forEach(id=>$(id).onchange=()=>resize('mxA',+$('mxAr').value,+$('mxAc').value));
  ['mxBr','mxBc'].forEach(id=>$(id).onchange=()=>resize('mxB',+$('mxBr').value,+$('mxBc').value));
  const F=x=>$('mxFr').checked?frac(x):nf(x,4);
  const show=A=>`<div class="ml2-mo" style="grid-template-columns:repeat(${A[0].length},auto)">${A.flat().map(v=>`<span>${F(v)}</span>`).join('')}</div>`;
  const stepsHtml=st=>st.length?st.map(([t,Mx],i)=>`<div class="s"><b>${i+1}.</b> ${t}<br>${show(Mx)}</div>`).join(''):'';
  const out=(h,st)=>{$('mxOut').innerHTML=h;$('mxSteps').innerHTML=st?stepsHtml(st):'';};
  const err=m=>out(`<span class="ml2-pill no">${m}</span>`);
  function op(k){const A=read('mxA'),B=read('mxB'),n=A.length,sq=n===A[0].length;if(A.flat().some(v=>!isFinite(v))||B.flat().some(v=>!isFinite(v)))return err('უჯრაში რიცხვი არ წერია');
    if(k==='add'||k==='sub'){if(n!==B.length||A[0].length!==B[0].length)return err('ზომები უნდა ემთხვეოდეს');return out(`A ${k==='add'?'+':'−'} B = ${show(Madd(A,B,k==='add'?1:-1))}`);}
    if(k==='mul'){if(A[0].length!==B.length)return err(`A-ს სვეტები (${A[0].length}) ≠ B-ს სტრიქონებს (${B.length})`);return out(`A · B = ${show(Mmul(A,B))}<div class="hint">(i, j) უჯრა = A-ს i-ური სტრიქონი · B-ს j-ური სვეტი</div>`);}
    if(k==='k'){const kk=+$('mxK').value.replace(',','.');return out(`${F(kk)} · A = ${show(A.map(r=>r.map(v=>v*kk)))}`);}
    if(k==='T')return out(`Aᵀ = ${show(Mt(A))}`);
    if(k==='rank'){const r=rref(A);return out(`rank A = <b>${r.rank}</b><br>${show(r.M)}`,r.steps);}
    if(k==='rref'){const r=rref(A);return out(`RREF(A) = ${show(r.M)}`,r.steps);}
    if(!sq&&k!=='solve')return err('საჭიროა კვადრატული მატრიცა');
    if(k==='tr')return out(`tr A = ${A.map((r,i)=>F(r[i])).join(' + ')} = <b>${F(A.reduce((s,r,i)=>s+r[i],0))}</b>`);
    if(k==='det'){const d=det(A);let how='';if(n===2)how=`= ${F(A[0][0])}·${F(A[1][1])} − ${F(A[0][1])}·${F(A[1][0])}`;
      if(n===3){const [a,b,c2]=A[0],[d2,e,f]=A[1],[gg,h,i]=A[2];how=`= ${F(a)}(${F(e)}·${F(i)} − ${F(f)}·${F(h)}) − ${F(b)}(${F(d2)}·${F(i)} − ${F(f)}·${F(gg)}) + ${F(c2)}(${F(d2)}·${F(h)} − ${F(e)}·${F(gg)})`;}
      return out(`det A ${how} = <b>${F(d)}</b>${Math.abs(d)<1e-12?' <span class="ml2-pill no">გადაგვარებული — შებრუნებული არ არსებობს</span>':''}`);}
    if(k==='inv'){const r=inv(A);if(!r)return err('det A = 0 — შებრუნებული არ არსებობს');return out(`A⁻¹ = ${show(r.I)}<div class="hint">[A | I] → [I | A⁻¹] — ნაბიჯები ქვემოთ</div>`,r.steps);}
    if(k==='pow'){let nn=parseInt($('mxN').value,10);if(!isFinite(nn)||Math.abs(nn)>50)return err('n: −50 … 50');let base=A;if(nn<0){const r=inv(A);if(!r)return err('det A = 0');base=r.I;nn=-nn;}let R=Mid(n);for(let i=0;i<nn;i++)R=Mmul(R,base);return out(`A<sup>${$('mxN').value}</sup> = ${show(R)}`);}
    if(k==='eig'){const ev=eig(A);let poly='';const tr=A.reduce((s,r,i)=>s+r[i],0);
      if(n===2)poly=`λ² − ${F(tr)}λ + ${F(det(A))} = 0`;if(n===3){const m2=det([[A[0][0],A[0][1]],[A[1][0],A[1][1]]])+det([[A[0][0],A[0][2]],[A[2][0],A[2][2]]])+det([[A[1][1],A[1][2]],[A[2][1],A[2][2]]]);poly=`λ³ − ${F(tr)}λ² + ${F(m2)}λ − ${F(det(A))} = 0`;}
      const rowsH=ev.map((e,i)=>{const lam=Math.abs(e.im)<1e-9?`${nf(e.re,5)}`:`${nf(e.re,4)} ${e.im<0?'−':'+'} ${nf(Math.abs(e.im),4)}i`;const v=Math.abs(e.im)<1e-9?nullVec(A,e.re):null;
        return `<tr><td>λ<sub>${i+1}</sub></td><td>${lam}</td><td>${v?'('+v.map(x=>nf(x,3)).join('; ')+')':'—'}</td></tr>`;}).join('');
      return out(`${poly?`დამახასიათებელი: ${poly}<br>`:''}<table class="ml2-tab"><tr><th></th><th>λ</th><th>v (ნორმირებული)</th></tr>${rowsH}</table>`);}
    if(k==='solve'){if(B.length!==n||B[0].length!==1)return err('B უნდა იყოს '+n+'×1 სვეტი');const aug=A.map((r,i)=>[...r,B[i][0]]),r=rref(aug),rA=rref(A).rank,cols=A[0].length;
      let msg;if(r.rank>rA)msg='<span class="ml2-pill no">ამონახსნი არ არსებობს</span> (rank A < rank [A|B])';
      else if(rA<cols)msg=`<span class="ml2-pill ok">უსასრულოდ ბევრი ამონახსნი</span> — ${cols-rA} თავისუფალი ცვლადი`;
      else msg='<span class="ml2-pill ok">ერთადერთი ამონახსნი</span><br>'+r.M.slice(0,cols).map((row,i)=>`x<sub>${i+1}</sub> = <b>${F(row[cols])}</b>`).join(' &nbsp; ');
      return out(`[A | B] → ${show(r.M)}<br>${msg}`,r.steps);}}
  $('mxOps').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('mxOps').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));op(b.dataset.k);});
  $('mxRnd').onclick=()=>{const r=+$('mxAr').value,cc=+$('mxAc').value;mk('mxA',r,cc,Array.from({length:r*cc},()=>Math.floor(Math.random()*11)-5));};
  $('mxSw').onclick=()=>{const a=read('mxA'),b=read('mxB');$('mxAr').value=b.length;$('mxAc').value=b[0].length;$('mxBr').value=a.length;$('mxBc').value=a[0].length;mk('mxA',b.length,b[0].length,b.flat());mk('mxB',a.length,a[0].length,a.flat());};
  op('eig');
  /* 2-D transformation */
  const cv=canvas($('mxC'),520,420),g=cv.g;let t=1,play=false;bindSl('mxT',v=>t=v);
  $('mxPl').onclick=e=>{play=!play;e.target.textContent=play?'❚❚ პაუზა':'▶ ანიმაცია';if(play)t=0;};
  const Fsh=[[0,0],[0,2],[1.2,2],[1.2,1.7],[0.35,1.7],[0.35,1.15],[1,1.15],[1,0.85],[0.35,0.85],[0.35,0]];
  anim(dt=>{if(play){t+=dt*0.4;if(t>1.25)t=0;$('mxT').value=Math.min(1,t);$('mxT_v').textContent=Math.min(1,t).toFixed(2);}
    const tt=Math.min(1,Math.max(0,t)),e=tt<1?tt*tt*(3-2*tt):1;let A;try{A=read('mxA');}catch(_){return;}
    const T=[[A[0]?.[0]??1,A[0]?.[1]??0],[A[1]?.[0]??0,A[1]?.[1]??1]].map(r=>r.map(v=>isFinite(v)?v:0));
    const Mt2=[[1+(T[0][0]-1)*e,T[0][1]*e],[T[1][0]*e,1+(T[1][1]-1)*e]],ap=([x,y])=>[Mt2[0][0]*x+Mt2[0][1]*y,Mt2[1][0]*x+Mt2[1][1]*y];
    const S=34,cx=260,cy=210,P=([x,y])=>[cx+x*S,cy-y*S];g.fillStyle='#0b0816';g.fillRect(0,0,520,420);
    g.strokeStyle='rgba(255,255,255,.05)';for(let i=-12;i<=12;i++){g.beginPath();g.moveTo(...P([i,-12]));g.lineTo(...P([i,12]));g.stroke();g.beginPath();g.moveTo(...P([-12,i]));g.lineTo(...P([12,i]));g.stroke();}
    g.strokeStyle='rgba(165,133,239,.35)';for(let i=-10;i<=10;i++){g.beginPath();g.moveTo(...P(ap([i,-10])));g.lineTo(...P(ap([i,10])));g.stroke();g.beginPath();g.moveTo(...P(ap([-10,i])));g.lineTo(...P(ap([10,i])));g.stroke();}
    const sq=[[0,0],[1,0],[1,1],[0,1]].map(ap).map(P);g.fillStyle='rgba(236,213,154,.22)';g.beginPath();sq.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();
    g.fillStyle='rgba(95,200,216,.35)';g.strokeStyle='#5fc8d8';g.beginPath();Fsh.map(ap).map(P).forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();g.stroke();
    arrow(g,...P([0,0]),...P(ap([1,0])),'#e8705a',2.5);arrow(g,...P([0,0]),...P(ap([0,1])),'#6fcf8a',2.5);
    const ev=eig(T);ev.filter(x=>Math.abs(x.im)<1e-9).forEach(x=>{const v=nullVec(T,x.re);if(!v)return;g.strokeStyle='rgba(236,213,154,.6)';g.setLineDash([5,5]);g.beginPath();g.moveTo(...P([-v[0]*12,-v[1]*12]));g.lineTo(...P([v[0]*12,v[1]*12]));g.stroke();g.setLineDash([]);});
    const d=det(Mt2);$('mxTi').innerHTML=`<div class="kv2"><b>T</b><span>[${T.map(r=>r.map(v=>r3(v)).join(' ')).join('; ')}]</span><b>det (ახლა)</b><span>${r3(d)} — ფართობი ×${r3(Math.abs(d))}${d<0?', არეკლილია':''}</span><b>საკუთრივი</b><span>${ev.map(x=>Math.abs(x.im)<1e-9?r3(x.re):`${r3(x.re)}±${r3(Math.abs(x.im))}i`).join(', ')}</span></div>`;});
 }};

/* ═════════════ 3 · combinatorics ═════════════ */
const comb={id:'comb',ico:'🎲',t:'კომბინატორიკა',s:'გადანაცვლება · წყობა · ჯუფთება · პასკალი',
 build(root){
  root.innerHTML=`<div class="arow"><div class="acol"><div class="actl ml2">${sl('cbN','n',0,20,1,5)}${sl('cbK','k',0,20,1,3)}
     <label class="hint">სიტყვა (გადანაცვლება გამეორებით): <input class="ml2-in" id="cbW" value="MISSISSIPPI" style="width:150px"></label></div>
     <div id="cbTab"></div></div>
   <div class="acol"><div class="ainfo"><div class="hint">ჩამონათვალი (n ≤ 6): ასოები A, B, C …</div>${btns('cbM',[['A','წყობა'],['C','ჯუფთება'],['P','გადანაცვლება']],'C')}<div id="cbL" style="font:13px ui-monospace,Menlo,monospace;max-height:220px;overflow:auto;margin-top:6px"></div></div></div></div>
   <div class="arow"><div class="acol"><div id="cbP"></div><div class="ml2-flex"><label class="hint"><input type="checkbox" id="cbMod"> კენტი რიცხვები (სერპინსკი)</label></div></div>
     <div class="acol"><div id="cbB"></div>${sl('cbG','ჯგუფში ადამიანი',2,80,1,23)}<div id="cbBi" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['Pₙ = n!','გადანაცვლება',{s:[],w:'n სხვადასხვა საგნის რიგში დალაგების ხერხები.'}],['Aₙᵏ = n! / (n − k)!','წყობა (რიგი მნიშვნელოვანია)',{s:[],w:'მედლები: ოქრო, ვერცხლი, ბრინჯაო n მონაწილეს შორის.'}],
     ['Cₙᵏ = n! / (k!·(n − k)!)','ჯუფთება (რიგი არ არის მნიშვნელოვანი)',{s:[],w:'ლატარია, გუნდის შერჩევა. Cₙᵏ = Cₙⁿ⁻ᵏ.'}],['Āₙᵏ = nᵏ, &nbsp; C̄ₙᵏ = Cₙ₊ₖ₋₁ᵏ','გამეორებით',{s:[],w:'პაროლები; „ვარსკვლავები და ჯოხები“.'}],
     ['n! / (n₁!·n₂!·…)','მულტისიმრავლე',{s:[],w:'MISSISSIPPI: 11!/(1!·4!·4!·2!) = 34 650.'}],['P(დამთხვევა) = 1 − 365!/((365 − k)!·365ᵏ)','დაბადების დღის პარადოქსი',{s:[],w:'23 ადამიანში დამთხვევის შანსი უკვე 50%-ზე მეტია.'}]]))}`;
  let n=5,k=3,mode='C';
  const big=x=>x>=1e15?x.toExponential(4):Math.round(x).toLocaleString('en');
  const P1=canvas($('cbP'),440,300),gp=P1.g,B1=canvas($('cbB'),440,240),gb=B1.g;
  function list(){const L='ABCDEFGHIJ'.slice(0,n).split(''),out=[];if(n>6){$('cbL').innerHTML='<span class="hint">n ≤ 6-ისთვის</span>';return;}
    const rec=(cur,used,start)=>{if(out.length>720)return;const need=mode==='P'?n:k;if(cur.length===need){out.push(cur.join(''));return;}
      for(let i=mode==='C'?start:0;i<n;i++){if(used[i])continue;used[i]=1;cur.push(L[i]);rec(cur,used,i+1);cur.pop();used[i]=0;}};
    if(mode!=='P'&&k>n){$('cbL').innerHTML='—';return;}rec([],[],0);$('cbL').innerHTML=`<b>${out.length}</b> ვარიანტი:<br>`+out.join('  ');}
  function draw(){k=Math.min(k,20);const w=$('cbW').value.toUpperCase().replace(/[^A-ZА-ЯႠ-ჿ]/g,''),cnt={};for(const ch of w)cnt[ch]=(cnt[ch]||0)+1;
    const multi=w.length?Math.exp(lfact(w.length)-sum(Object.values(cnt).map(lfact))):0;
    const rows=[['გადანაცვლება Pₙ = n!',`${n}!`,fact(n)],['წყობა Aₙᵏ',`${n}!/(${n}−${k})!`,k<=n?fact(n)/fact(n-k):0],['ჯუფთება Cₙᵏ',`C(${n}, ${k})`,choose(n,k)],
      ['წყობა გამეორებით nᵏ',`${n}^${k}`,n**k],['ჯუფთება გამეორებით',`C(${n+k-1}, ${k})`,choose(n+k-1,k)],[`„${w}“ გადანაცვლებები`,`${w.length}!/(${Object.values(cnt).map(v=>v+'!').join('·')})`,multi]];
    $('cbTab').innerHTML=`<table class="ml2-tab"><tr><th>რა</th><th>ფორმულა</th><th>რაოდენობა</th></tr>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${big(r[2])}</b></td></tr>`).join('')}</table>`;list();
    /* Pascal */const R=16,od=$('cbMod').checked;gp.fillStyle='#0b0816';gp.fillRect(0,0,440,300);const cw=440/(R+1),ch=300/(R+0.5);
    for(let r=0;r<R;r++)for(let j=0;j<=r;j++){const x=220+(j-r/2)*cw,y=12+r*ch,v=choose(r,j),hl=r===n&&j===k;
      gp.fillStyle=hl?'#ecd59a':od?(v%2?'rgba(165,133,239,.75)':'rgba(255,255,255,.04)'):`rgba(165,133,239,${0.12+0.5*Math.min(1,Math.log10(v+1)/4)})`;gp.beginPath();gp.arc(x,y+6,cw*0.46,0,TAU);gp.fill();
      if(r<13)txt(gp,String(v),x,y+9,hl?'#0b0816':'#efe6d4',`${r>10?8:10}px sans-serif`);}
    /* birthday */const G=+$('cbG').value,pb=m=>{let q=1;for(let i=0;i<m;i++)q*=(365-i)/365;return 1-q;};const M=mplot(gb,{x:[0,80],y:[0,1],m:[10,10,20,30],step:10,stepY:0.25});
    gb.strokeStyle='#ecd59a';gb.lineWidth=2;gb.beginPath();for(let m=1;m<=80;m++){const X=M.X(m),Y=M.Y(pb(m));m===1?gb.moveTo(X,Y):gb.lineTo(X,Y);}gb.stroke();
    gb.strokeStyle='rgba(232,112,90,.6)';gb.setLineDash([4,4]);gb.beginPath();gb.moveTo(M.X(0),M.Y(0.5));gb.lineTo(M.X(80),M.Y(0.5));gb.stroke();gb.setLineDash([]);dot(gb,M.X(G),M.Y(pb(G)),5,'#5fc8d8');
    $('cbBi').innerHTML=`${G} ადამიანში ერთი დაბადების დღის შანსი: <b>${(pb(G)*100).toFixed(1)}%</b><br><span class="hint">ლატარია 6 / 49: ${big(choose(49,6))}-დან 1 — ${(100/choose(49,6)).toExponential(2)}%</span>`;}
  bindSl('cbN',v=>{n=v;draw();});bindSl('cbK',v=>{k=v;draw();});bindSl('cbG',()=>draw());$('cbW').oninput=draw;$('cbMod').onchange=draw;bindBtns(root,'cbM',m=>{mode=m;list();});draw();
 }};

/* ═════════════ 4 · probability distributions ═════════════ */
const DISTS={
 binom:{n:'ბინომიალური B(n, p)',d:1,p:[['n','n',1,60,1,20],['p','p',0.01,0.99,0.01,0.3]],pmf:(x,{n,p})=>x<0||x>n?0:Math.exp(lchoose(n,x)+x*Math.log(p)+(n-x)*Math.log(1-p)),rng:o=>[0,o.n],m:o=>o.n*o.p,v:o=>o.n*o.p*(1-o.p),
   s:(o,R)=>{let c=0;for(let i=0;i<o.n;i++)c+=R()<o.p;return c;},w:'n დამოუკიდებელი ცდა, თითოეულში წარმატების ალბათობა p.'},
 pois:{n:'პუასონი Pois(λ)',d:1,p:[['l','λ',0.2,30,0.1,4]],pmf:(x,{l})=>x<0?0:Math.exp(x*Math.log(l)-l-lfact(x)),rng:o=>[0,Math.ceil(o.l+5*Math.sqrt(o.l)+5)],m:o=>o.l,v:o=>o.l,
   s:(o,R)=>{let L=Math.exp(-o.l),k=0,p=1;do{k++;p*=R();}while(p>L);return k-1;},w:'იშვიათი მოვლენების რაოდენობა ინტერვალში (ზარები, ავარიები).'},
 geom:{n:'გეომეტრიული Geom(p)',d:1,p:[['p','p',0.02,0.95,0.01,0.25]],pmf:(x,{p})=>x<1?0:Math.pow(1-p,x-1)*p,rng:o=>[1,Math.ceil(Math.log(0.002)/Math.log(1-o.p))+1],m:o=>1/o.p,v:o=>(1-o.p)/o.p**2,
   s:(o,R)=>Math.ceil(Math.log(1-R())/Math.log(1-o.p)),w:'რამდენი ცდა სჭირდება პირველ წარმატებას.'},
 hyper:{n:'ჰიპერგეომეტრიული',d:1,p:[['N','N (სულ)',5,100,1,50],['K','K (წარმატება)',1,100,1,15],['m','n (ამოღება)',1,100,1,10]],
   pmf:(x,{N,K,m})=>{K=Math.min(K,N);m=Math.min(m,N);if(x<Math.max(0,m+K-N)||x>Math.min(m,K))return 0;return Math.exp(lchoose(K,x)+lchoose(N-K,m-x)-lchoose(N,m));},rng:o=>[0,Math.min(o.m,o.K)],
   m:o=>Math.min(o.m,o.N)*Math.min(o.K,o.N)/o.N,v:o=>{const N=o.N,K=Math.min(o.K,N),m=Math.min(o.m,N);return m*K/N*(1-K/N)*(N-m)/(N-1||1);},
   s:(o,R)=>{let N=o.N,K=Math.min(o.K,N),c=0;for(let i=0;i<Math.min(o.m,o.N);i++){if(R()<K/N){c++;K--;}N--;}return c;},w:'ამოღება დაბრუნების გარეშე (ბანქო, ხარისხის კონტროლი).'},
 norm:{n:'ნორმალური N(μ, σ)',d:0,p:[['mu','μ',-5,5,0.1,0],['s','σ',0.2,4,0.05,1]],pdf:(x,{mu,s})=>normPdf(x,mu,s),cdf:(x,{mu,s})=>normCdf(x,mu,s),rng:o=>[o.mu-4.5*o.s,o.mu+4.5*o.s],m:o=>o.mu,v:o=>o.s*o.s,
   s:(o,R)=>o.mu+o.s*gauss(R),w:'ბევრი მცირე დამოუკიდებელი გავლენის ჯამი (სიმაღლე, გაზომვის ცდომილება).'},
 expo:{n:'ექსპონენციალური Exp(λ)',d:0,p:[['l','λ',0.1,5,0.05,1]],pdf:(x,{l})=>x<0?0:l*Math.exp(-l*x),cdf:(x,{l})=>x<0?0:1-Math.exp(-l*x),rng:o=>[0,6/o.l],m:o=>1/o.l,v:o=>1/o.l**2,
   s:(o,R)=>-Math.log(1-R())/o.l,w:'ლოდინის დრო შემდეგ მოვლენამდე; „მეხსიერება არ აქვს“.'},
 unif:{n:'თანაბარი U(a, b)',d:0,p:[['a','a',-5,5,0.1,0],['b','b',-5,10,0.1,3]],pdf:(x,{a,b})=>b<=a?0:(x>=a&&x<=b?1/(b-a):0),cdf:(x,{a,b})=>b<=a?0:clamp((x-a)/(b-a),0,1),rng:o=>[o.a-1,Math.max(o.a,o.b)+1],m:o=>(o.a+o.b)/2,v:o=>(o.b-o.a)**2/12,
   s:(o,R)=>o.a+(o.b-o.a)*R(),w:'ყველა მნიშვნელობა ერთნაირად სავარაუდოა.'},
 t:{n:'სტიუდენტის t(ν)',d:0,p:[['v','ν',1,60,1,5]],pdf:(x,{v})=>tPdf(x,v),cdf:(x,{v})=>tCdf(x,v),rng:()=>[-6,6],m:o=>o.v>1?0:NaN,v:o=>o.v>2?o.v/(o.v-2):Infinity,
   s:(o,R)=>{const z=gauss(R);let c=0;for(let i=0;i<o.v;i++)c+=gauss(R)**2;return z/Math.sqrt(c/o.v);},w:'პატარა შერჩევის საშუალოს სტანდარტიზება; ν → ∞ ⇒ N(0,1).'},
 chi:{n:'ხი-კვადრატი χ²(k)',d:0,p:[['k','k',1,30,1,4]],pdf:(x,{k})=>chiPdf(x,k),cdf:(x,{k})=>chiCdf(x,k),rng:o=>[0,o.k+5*Math.sqrt(2*o.k)+2],m:o=>o.k,v:o=>2*o.k,
   s:(o,R)=>{let c=0;for(let i=0;i<o.k;i++)c+=gauss(R)**2;return c;},w:'k სტანდარტული ნორმალურის კვადრატების ჯამი; ტესტები და ინტერვალები.'}};
const dist={id:'dist',ico:'🔔',t:'ალბათობის განაწილებები',s:'ბინომიალურიდან χ²-მდე · სიმულაცია · ცენტრალური ზღვარი',
 build(root){
  root.innerHTML=`<div>${btns('dsD',Object.entries(DISTS).map(([k,v])=>[k,v.n.split(' ')[0]]),'binom')}</div><div id="dsC"></div>
   <div class="arow"><div class="acol"><div class="actl" id="dsP"></div><div class="actl">${sl('dsA','a',-10,60,0.1,4)}${sl('dsB','b',-10,60,0.1,8)}
     <div class="ml2-flex" style="font-size:13px"><label><input type="checkbox" id="dsCdf"> F(x) — განაწილების ფუნქცია</label></div>
     <div class="abt"><button id="dsSim">▶ სიმულაცია</button><button id="dsClt">Σ ცენტრალური ზღვრითი თეორემა</button><button id="dsRs">⟲</button></div>${sl('dsN','CLT: საშუალო n მნიშვნელობიდან',1,50,1,5)}</div></div>
     <div class="acol"><div id="dsI" class="ainfo"></div></div></div>
   ${card('ფორმულები',FX([['P(a ≤ X ≤ b) = Σ p(x) &nbsp; ან &nbsp; ∫ₐᵇ f(x)dx','ალბათობა ინტერვალში',{s:[],w:'დისკრეტულზე — სვეტების ჯამი, უწყვეტზე — ფართობი.'}],
     ['E[X] = Σ x·p(x), &nbsp; Var X = E[X²] − (E[X])²','მოლოდინი და დისპერსია',{s:[],w:'σ = √Var — გაბნევის „ტიპური“ ზომა.'}],
     ['X̄ₙ → μ (დიდ რიცხვთა კანონი)','LLN',{s:[],w:'სიმულაციაში შერჩევის საშუალო თეორიულ μ-ს უახლოვდება.'}],
     ['(X̄ₙ − μ)·√n / σ → N(0, 1)','ცენტრალური ზღვრითი თეორემა',{s:[],w:'ნებისმიერი (სასრული დისპერსიის) განაწილების საშუალოები ნორმალურისკენ მიდის.'}]]))}`;
  const c=canvas($('dsC'),900,330),g=c.g;let D='binom',O={},sim=null,clt=null,R=rng(7);
  function params(){const d=DISTS[D];$('dsP').innerHTML=d.p.map(([k,l,a,b,s,v])=>sl('dsp_'+k,l,a,b,s,O[D+k]??v)).join('');
    d.p.forEach(([k])=>bindSl('dsp_'+k,v=>{O[D+k]=v;sim=null;clt=null;}));}
  const cur=()=>{const o={};DISTS[D].p.forEach(([k,,,,,v])=>o[k]=O[D+k]??v);return o;};
  bindBtns(root,'dsD',k=>{D=k;sim=null;clt=null;params();const r=DISTS[k].rng(cur());$('dsA').value=r[0]+(r[1]-r[0])*0.3;$('dsB').value=r[0]+(r[1]-r[0])*0.6;});params();
  bindSl('dsA',()=>{},v=>r3(v));bindSl('dsB',()=>{},v=>r3(v));bindSl('dsN',()=>{clt=null;});
  $('dsSim').onclick=()=>{clt=null;sim={h:{},n:0,s:0};};$('dsClt').onclick=()=>{sim=null;clt={h:[],n:0};};$('dsRs').onclick=()=>{sim=null;clt=null;};
  anim(()=>{const d=DISTS[D],o=cur(),[lo,hi]=d.rng(o),a=+$('dsA').value,b=+$('dsB').value,cdf=$('dsCdf').checked;
    if(sim)for(let i=0;i<20&&sim.n<4000;i++){const x=d.s(o,R);sim.n++;sim.s+=x;const key=d.d?x:Math.floor((x-lo)/((hi-lo)/60));sim.h[key]=(sim.h[key]||0)+1;}
    let ymax=0,P=0;const pts=[];
    if(d.d){for(let x=Math.ceil(lo);x<=hi;x++){const p=d.pmf(x,o);pts.push([x,cdf?0:p]);ymax=Math.max(ymax,p);if(x>=a&&x<=b)P+=p;}
      if(cdf){let s=0;for(const p of pts){s+=d.pmf(p[0],o);p[1]=s;}ymax=1;}}
    else{for(let i=0;i<=400;i++){const x=lo+(hi-lo)*i/400,y=cdf?d.cdf(x,o):d.pdf(x,o);pts.push([x,y]);if(isFinite(y))ymax=Math.max(ymax,y);}P=d.cdf(Math.min(b,hi),o)-d.cdf(Math.max(a,lo),o);if(b<a)P=0;}
    if(clt){const nn=+$('dsN').value;for(let i=0;i<15&&clt.n<3000;i++){let s=0;for(let j=0;j<nn;j++)s+=d.s(o,R);clt.h.push(s/nn);clt.n++;}}
    ymax=Math.min(ymax,cdf?1:50)*1.15||1;const xr=clt?[d.m(o)-4*Math.sqrt(d.v(o)/(+$('dsN').value)),d.m(o)+4*Math.sqrt(d.v(o)/(+$('dsN').value))]:[lo-(d.d?0.8:0),hi+(d.d?0.8:0)];
    const M=mplot(g,{x:xr,y:[0,clt?1:ymax],m:[12,14,24,40],labels:true});
    if(clt){const nn=+$('dsN').value,mu=d.m(o),sd=Math.sqrt(d.v(o)/nn),bins=50,bw=(xr[1]-xr[0])/bins,cnt=Array(bins).fill(0);clt.h.forEach(v=>{const k=Math.floor((v-xr[0])/bw);if(k>=0&&k<bins)cnt[k]++;});
      const peak=normPdf(mu,mu,sd),sc=1/(peak*1.15);g.fillStyle='rgba(165,133,239,.5)';cnt.forEach((cn,k)=>{const h=cn/(clt.n*bw)*sc;g.fillRect(M.X(xr[0]+k*bw)+1,M.Y(h),M.X(xr[0]+bw)-M.X(xr[0])-2,M.Y(0)-M.Y(h));});
      g.strokeStyle='#ecd59a';g.lineWidth=2;g.beginPath();for(let i=0;i<=300;i++){const x=xr[0]+(xr[1]-xr[0])*i/300,y=normPdf(x,mu,sd)*sc;i?g.lineTo(M.X(x),M.Y(y)):g.moveTo(M.X(x),M.Y(y));}g.stroke();
      $('dsI').innerHTML=`<b>ცენტრალური ზღვრითი თეორემა</b><br>${clt.n} საშუალო, თითოეული ${nn} მნიშვნელობიდან (${d.n}).<br>ოქროსფერი — N(μ, σ²/n) = N(${r3(mu)}, ${r3(sd)}²).<br><span class="hint">გაზარდე n — ჰისტოგრამა ზარად იქცევა ნებისმიერი საწყისი განაწილებისთვის.</span>`;return;}
    if(d.d){const bw=Math.max(2,(M.X(1)-M.X(0))*0.7);pts.forEach(([x,y])=>{const inI=x>=a&&x<=b;g.fillStyle=inI?'rgba(236,213,154,.85)':'rgba(165,133,239,.55)';g.fillRect(M.X(x)-bw/2,M.Y(y),bw,M.Y(0)-M.Y(y));});}
    else{g.fillStyle='rgba(236,213,154,.25)';g.beginPath();g.moveTo(M.X(Math.max(a,lo)),M.Y(0));pts.forEach(([x,y])=>{if(x>=a&&x<=b&&isFinite(y))g.lineTo(M.X(x),M.Y(Math.min(y,ymax)));});g.lineTo(M.X(Math.min(b,hi)),M.Y(0));g.closePath();if(!cdf)g.fill();
      g.strokeStyle='#a585ef';g.lineWidth=2.4;g.beginPath();pts.forEach(([x,y],i)=>{const Y=M.Y(Math.min(isFinite(y)?y:ymax,ymax));i?g.lineTo(M.X(x),Y):g.moveTo(M.X(x),Y);});g.stroke();}
    if(sim&&sim.n){const sc=d.d?1:1/((hi-lo)/60);g.strokeStyle='#5fc8d8';g.fillStyle='rgba(95,200,216,.25)';
      for(const [k,cn] of Object.entries(sim.h)){const fr=cn/sim.n*sc,x=d.d?+k:lo+(+k+0.5)*(hi-lo)/60,w=d.d?Math.max(2,(M.X(1)-M.X(0))*0.35):M.X(lo+(hi-lo)/60)-M.X(lo);if(cdf)continue;g.fillRect(M.X(x)-w/2,M.Y(fr),w,M.Y(0)-M.Y(fr));g.strokeRect(M.X(x)-w/2,M.Y(fr),w,M.Y(0)-M.Y(fr));}}
    g.strokeStyle='rgba(236,213,154,.7)';g.setLineDash([4,4]);[a,b].forEach(v=>{g.beginPath();g.moveTo(M.X(v),M.y0);g.lineTo(M.X(v),M.y0+M.h);g.stroke();});g.setLineDash([]);
    const m=d.m(o),v=d.v(o);
    $('dsI').innerHTML=`<b>${d.n}</b><br><span class="hint">${d.w}</span><div class="kv2" style="margin-top:6px"><b>P(${r3(a)} ≤ X ≤ ${r3(b)})</b><span><b>${nf(P,5)}</b></span><b>E[X]</b><span>${nf(m)}</span><b>Var X</b><span>${nf(v)}</span><b>σ</b><span>${nf(Math.sqrt(v))}</span>
      ${sim?`<b>სიმულაცია</b><span>${sim.n} ცდა · საშუალო ${nf(sim.s/sim.n)} (θ: ${nf(m)})</span>`:''}</div>`;});
 }};

/* ═════════════ 5 · descriptive statistics ═════════════ */
const desc={id:'desc',ico:'📊',t:'აღწერითი სტატისტიკა',s:'საშუალო · მედიანა · კვარტილები · ტესტები',
 build(root){
  const R=rng(11),sample=()=>Array.from({length:40},()=>Math.round((172+8*gauss(R))*10)/10).join(' ');
  root.innerHTML=`<div class="arow"><div class="acol"><div class="actl ml2"><div class="hint">მონაცემები (გამოყავი ჰარით, მძიმით ან ახალ ხაზზე):</div>
     <textarea class="ml2-in" id="deT">${sample()}</textarea>
     <div class="ml2-flex"><button class="ml2-mini" data-g="n">ნორმალური</button><button class="ml2-mini" data-g="s">ასიმეტრიული</button><button class="ml2-mini" data-g="u">თანაბარი</button><button class="ml2-mini" data-g="o">+ გამოვარდნილი</button></div>
     ${sl('deBn','ჰისტოგრამის სვეტები',3,40,1,10)}${sl('deMu','t-ტესტი: H₀ μ₀ =',0,300,0.5,170)}</div><div id="deTab"></div></div>
     <div class="acol"><div id="deC"></div><div id="deQ"></div></div></div>
   ${card('ფორმულები',FX([['x̄ = Σxᵢ / n, &nbsp; s² = Σ(xᵢ − x̄)² / (n − 1)','საშუალო და შერჩევითი დისპერსია',{s:[['n − 1','ბესელის შესწორება']],w:'n − 1 იმიტომ, რომ x̄ თავად მონაცემებიდან არის გამოთვლილი.'}],
     ['IQR = Q₃ − Q₁; გამოვარდნილი: x < Q₁ − 1.5·IQR ან x > Q₃ + 1.5·IQR','კვარტილები',{s:[],w:'მედიანა და IQR მდგრადია გამოვარდნილების მიმართ, საშუალო და σ — არა.'}],
     ['x̄ ± t<sub>0.975, n−1</sub> · s/√n','95%-იანი ნდობის ინტერვალი',{s:[],w:'თუ ექსპერიმენტს ბევრჯერ გავიმეორებთ, ასეთი ინტერვალების 95% μ-ს მოიცავს.'}],
     ['t = (x̄ − μ₀) / (s/√n)','ერთშერჩევიანი t-ტესტი',{s:[['p','ალბათობა ასეთი ან უფრო უკიდურესი t-სი, თუ H₀ სწორია']],w:'p < 0.05 — H₀-ს უარვყოფთ 5%-იან დონეზე.'}]]))}`;
  const c=canvas($('deC'),440,300),g=c.g,q=canvas($('deQ'),440,200),gq=q.g;
  root.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const t=b.dataset.g,Rr=rng(Date.now()%1e6);let a;
    if(t==='n')a=Array.from({length:50},()=>+(50+10*gauss(Rr)).toFixed(1));if(t==='s')a=Array.from({length:50},()=>+(20*(-Math.log(1-Rr()))).toFixed(1));
    if(t==='u')a=Array.from({length:50},()=>+(Rr()*100).toFixed(1));if(t==='o'){a=parseNums($('deT').value);a.push(+(Math.max(...a)*2.2).toFixed(1));}
    $('deT').value=a.join(' ');if(t!=='o'){const m=mean(a);$('deMu').value=Math.round(m);}draw();});
  function draw(){const a=parseNums($('deT').value);if(a.length<3){$('deTab').innerHTML='<span class="hint">საჭიროა მინიმუმ 3 რიცხვი</span>';return;}
    const s=a.slice().sort((x,y)=>x-y),n=a.length,m=mean(a),v=varS(a),sd=Math.sqrt(v),q1=quant(s,0.25),md=quant(s,0.5),q3=quant(s,0.75),iqr=q3-q1;
    const sk=sum(a.map(x=>((x-m)/sd)**3))*n/((n-1)*(n-2)),ku=sum(a.map(x=>((x-m)/sd)**4))/n-3,cnt={};a.forEach(x=>cnt[x]=(cnt[x]||0)+1);const mx=Math.max(...Object.values(cnt));
    const mode=mx>1?Object.keys(cnt).filter(k=>cnt[k]===mx).slice(0,4).join(', '):'არ არის',out=a.filter(x=>x<q1-1.5*iqr||x>q3+1.5*iqr);
    const se=sd/Math.sqrt(n),tc=tInv(0.975,n-1),mu0=+$('deMu').value,tt=(m-mu0)/se,p=2*(1-tCdf(Math.abs(tt),n-1));
    $('deTab').innerHTML=`<table class="ml2-tab">${[['n',n],['საშუალო x̄',nf(m)],['მედიანა',nf(md)],['მოდა',mode],['მინ / მაქს',`${nf(s[0])} / ${nf(s[n-1])}`],['გაბნევა (range)',nf(s[n-1]-s[0])],
      ['დისპერსია s²',nf(v)],['სტანდ. გადახრა s',nf(sd)],['სტანდ. შეცდომა s/√n',nf(se)],['Q₁ / Q₃',`${nf(q1)} / ${nf(q3)}`],['IQR',nf(iqr)],['ვარიაციის კოეფ.',(sd/m*100).toFixed(1)+'%'],
      ['ასიმეტრია',nf(sk,3)],['ექსცესი',nf(ku,3)],['გამოვარდნილები',out.length?out.join(', '):'არ არის'],['95% ნდობის ინტ. μ',`[${nf(m-tc*se)}; ${nf(m+tc*se)}]`],
      [`t-ტესტი μ₀ = ${mu0}`,`t = ${nf(tt,3)}, p = ${pFmt(p)} ${p<0.05?'<span class="ml2-pill no">H₀ უარყოფილია</span>':'<span class="ml2-pill ok">H₀ არ უარიყოფა</span>'}`]].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`;
    /* histogram + box plot */const bn=+$('deBn').value,lo=s[0],hi=s[n-1]+1e-9,bw=(hi-lo)/bn,h=Array(bn).fill(0);a.forEach(x=>h[Math.min(bn-1,Math.floor((x-lo)/bw))]++);
    const hm=Math.max(...h,normPdf(m,m,sd)*n*bw)*1.15,pad=(hi-lo)*0.08,M=mplot(g,{x:[lo-pad,hi+pad],y:[-hm*0.32,hm],m:[10,10,20,30],labels:true});
    g.fillStyle='rgba(165,133,239,.55)';h.forEach((cn,k)=>g.fillRect(M.X(lo+k*bw)+1,M.Y(cn),M.X(lo+bw)-M.X(lo)-2,M.Y(0)-M.Y(cn)));
    g.strokeStyle='#ecd59a';g.lineWidth=2;g.beginPath();for(let i=0;i<=200;i++){const x=lo-pad+(hi-lo+2*pad)*i/200,y=normPdf(x,m,sd)*n*bw;i?g.lineTo(M.X(x),M.Y(y)):g.moveTo(M.X(x),M.Y(y));}g.stroke();
    const by=M.Y(-hm*0.16),bh=18;g.strokeStyle='#5fc8d8';g.lineWidth=1.5;const wl=Math.max(s[0],q1-1.5*iqr),wh=Math.min(s[n-1],q3+1.5*iqr);
    g.strokeRect(M.X(q1),by-bh/2,M.X(q3)-M.X(q1),bh);g.beginPath();g.moveTo(M.X(md),by-bh/2);g.lineTo(M.X(md),by+bh/2);g.moveTo(M.X(wl),by);g.lineTo(M.X(q1),by);g.moveTo(M.X(q3),by);g.lineTo(M.X(wh),by);g.stroke();
    out.forEach(x=>dot(g,M.X(x),by,3,'#e8705a'));dot(g,M.X(m),by,3,'#ecd59a');
    /* QQ */const z=s.map((x,i)=>[normInv((i+0.5)/n),x]),Mq=mplot(gq,{x:[-3,3],y:[s[0]-pad,s[n-1]+pad],m:[10,10,20,34]});
    gq.strokeStyle='rgba(236,213,154,.6)';gq.beginPath();gq.moveTo(Mq.X(-3),Mq.Y(m-3*sd));gq.lineTo(Mq.X(3),Mq.Y(m+3*sd));gq.stroke();z.forEach(([u,x])=>dot(gq,Mq.X(u),Mq.Y(x),2.6,'#a585ef'));
    txt(gq,'Q–Q: წერტილები წრფეზე ⇒ ნორმალურთან ახლოსაა',220,14,'#b3a68f','11px sans-serif');}
  $('deT').oninput=draw;bindSl('deBn',draw);bindSl('deMu',draw);draw();
 }};

/* ═════════════ 6 · regression & econometrics ═════════════ */
function wageData(){const R=rng(2026),rows=['wage,educ,exper,female,urban'];for(let i=0;i<150;i++){const educ=8+Math.floor(R()*13),exper=Math.floor(R()*40),female=R()<0.45?1:0,urban=R()<0.6?1:0;
  const lw=0.55+0.085*educ+0.032*exper-0.0005*exper*exper-0.21*female+0.12*urban+gauss(R)*0.28*(0.6+0.05*educ);rows.push([Math.exp(lw).toFixed(2),educ,exper,female,urban].join(','));}return rows.join('\n');}
const regr={id:'regr',ico:'📉',t:'რეგრესია და ეკონომეტრიკა',s:'უმცირესი კვადრატები · t, p, R² · ტესტები',
 build(root){
  root.innerHTML=`<div>${btns('rgM',[['i','✋ ინტერაქტიული'],['e','🏛 ეკონომეტრიკა (ცხრილი)']],'i')}</div>
   <div id="rgI"><div id="rgC"></div><div class="arow"><div class="acol"><div class="actl">${btns('rgF',[['lin','წრფივი'],['poly','მრავალწევრი'],['exp','ექსპონენც.'],['log','ლოგარითმ.'],['pow','ხარისხოვანი']],'lin')}
     ${sl('rgD','მრავალწევრის ხარისხი',2,7,1,3)}<div class="hint">დააწკაპუნე — ახალი წერტილი, გადაათრიე — გადაადგილება, ორჯერ — წაშლა.</div><div class="abt"><button id="rgR">🎲 ახალი მონაცემები</button><button id="rgX">✕ გასუფთავება</button></div></div></div>
     <div class="acol"><div id="rgIi" class="ainfo"></div></div></div></div>
   <div id="rgE" hidden><div class="arow"><div class="acol"><div class="actl ml2"><div class="hint">CSV, პირველი ხაზი — სვეტების სახელები (მაგალითი: ხელფასები, n = 150):</div>
     <textarea class="ml2-in" id="rgT" style="min-height:120px">${wageData()}</textarea>
     <div class="ml2-flex" style="font-size:13px">y: <select id="rgY"></select><label><input type="checkbox" id="rgL" checked> log(y)</label><label><input type="checkbox" id="rgQ"> + კვადრატები</label><label><input type="checkbox" id="rgH"> მდგრადი SE (HC1)</label></div>
     <div class="ml2-flex" id="rgXs" style="font-size:13px"></div></div></div>
     <div class="acol"><div id="rgOut" class="ainfo" style="overflow-x:auto"></div></div></div><div id="rgEC"></div></div>
   ${card('ფორმულები',FX([['β̂ = (XᵀX)⁻¹ Xᵀy','უმცირესი კვადრატების მეთოდი (OLS)',{s:[['X','რეგრესორების მატრიცა (პირველი სვეტი — 1-ები)']],w:'β̂ ამცირებს ნარჩენების კვადრატების ჯამს Σ(yᵢ − ŷᵢ)².'}],
     ['R² = 1 − SSE/SST, &nbsp; R̄² = 1 − (1 − R²)(n − 1)/(n − k)','დეტერმინაციის კოეფიციენტი',{s:[],w:'რა წილს ხსნის მოდელი y-ის ვარიაციიდან. R̄² სჯის ზედმეტ რეგრესორებს.'}],
     ['t = β̂ⱼ / SE(β̂ⱼ), &nbsp; SE = √(s²·[(XᵀX)⁻¹]ⱼⱼ)','მნიშვნელოვნება',{s:[],w:'p < 0.05 ⇒ კოეფიციენტი სტატისტიკურად განსხვავდება ნულისგან.'}],
     ['DW = Σ(eₜ − eₜ₋₁)² / Σeₜ² &nbsp;·&nbsp; BP = n·R²(e² ~ X) &nbsp;·&nbsp; JB = n/6·(S² + K²/4)','დიაგნოსტიკა',{s:[['DW ≈ 2','ავტოკორელაცია არ არის'],['BP','ჰეტეროსკედასტიკურობა'],['JB','ნარჩენების ნორმალურობა']],w:'ჰეტეროსკედასტიკურობისას t-ები მცდარია — ჩართე მდგრადი (HC1) სტანდარტული შეცდომები.'}],
     ['log(wage) = β₀ + β₁·educ + …','ლოგ-წრფივი მოდელი',{s:[],w:'β₁·100 ≈ ხელფასის % ცვლილება ერთი წლით მეტი განათლებისას.'}]]))}`;
  /* interactive */
  const c=canvas($('rgC'),900,420),g=c.g;let pts=[],F='lin',deg=3,dragI=-1;const DX=[0,10],DY=[0,10],m=[14,14,90,36];
  const newData=()=>{const R=rng(Math.floor(Math.random()*1e6)),a=R()*3+1,b=R()*0.8+0.2,cu=R()<0.5;pts=Array.from({length:14},(_,i)=>{const x=0.5+i*0.68;return [x,clamp(a+b*x+(cu?0.06*(x-5)**2:0)+gauss(R)*0.7,0.2,9.8)];});};newData();
  const fitIt=()=>{const ok=pts.filter(([x,y])=>(F==='exp'||F==='pow'?y>0:true)&&(F==='log'||F==='pow'?x>0:true));if(ok.length<2)return null;
    let X,y,tr=v=>v;if(F==='lin'||F==='poly'){const d=F==='lin'?1:deg;if(ok.length<=d)return null;X=ok.map(([x])=>Array.from({length:d+1},(_,j)=>x**j));y=ok.map(p=>p[1]);}
    if(F==='exp'){X=ok.map(([x])=>[1,x]);y=ok.map(p=>Math.log(p[1]));}if(F==='log'){X=ok.map(([x])=>[1,Math.log(x)]);y=ok.map(p=>p[1]);}if(F==='pow'){X=ok.map(([x])=>[1,Math.log(x)]);y=ok.map(p=>Math.log(p[1]));}
    const r=ols(X,y);if(!r)return null;const b=r.b;
    const f=F==='exp'?x=>Math.exp(b[0])*Math.exp(b[1]*x):F==='log'?x=>b[0]+b[1]*Math.log(x):F==='pow'?x=>Math.exp(b[0])*x**b[1]:x=>b.reduce((s,v,j)=>s+v*x**j,0);
    const yy=ok.map(p=>p[1]),fit=ok.map(([x])=>f(x)),ym=mean(yy),sse=sum(yy.map((v,i)=>(v-fit[i])**2)),R2=1-sse/sum(yy.map(v=>(v-ym)**2));
    const eq=F==='exp'?`y = ${nf(Math.exp(b[0]),3)}·e<sup>${nf(b[1],3)}x</sup>`:F==='log'?`y = ${nf(b[0],3)} + ${nf(b[1],3)}·ln x`:F==='pow'?`y = ${nf(Math.exp(b[0]),3)}·x<sup>${nf(b[1],3)}</sup>`:
      'y = '+b.map((v,j)=>`${j&&v>=0?'+ ':''}${nf(v,3)}${j?'x'+(j>1?'<sup>'+j+'</sup>':''):''}`).reverse().join(' ').replace(/^\+ /,'');
    return {f,R2,rmse:Math.sqrt(sse/ok.length),eq,r};};
  const M=()=>mplot(g,{x:DX,y:DY,m,step:1,stepY:1});
  c.style.touchAction='none';
  c.addEventListener('pointerdown',e=>{const Mm=M(),p=c.pt(e);if(p[1]>420-m[2])return;const i=pts.findIndex(([x,y])=>Math.hypot(Mm.X(x)-p[0],Mm.Y(y)-p[1])<10);
    if(i>=0)dragI=i;else{pts.push([clamp(Mm.ix(p[0]),0,10),clamp(Mm.iy(p[1]),0,10)]);dragI=pts.length-1;}c.setPointerCapture(e.pointerId);});
  c.addEventListener('pointermove',e=>{if(dragI<0)return;const Mm=M(),p=c.pt(e);pts[dragI]=[clamp(Mm.ix(p[0]),0,10),clamp(Mm.iy(p[1]),0,10)];});
  c.addEventListener('pointerup',()=>dragI=-1);
  c.addEventListener('dblclick',e=>{const Mm=M(),p=c.pt(e);const i=pts.findIndex(([x,y])=>Math.hypot(Mm.X(x)-p[0],Mm.Y(y)-p[1])<12);if(i>=0)pts.splice(i,1);});
  bindBtns(root,'rgF',k=>F=k);bindSl('rgD',v=>deg=v);$('rgR').onclick=newData;$('rgX').onclick=()=>{pts=[];};
  anim(()=>{if($('rgI').hidden)return;const Mm=M(),fit=fitIt();
    if(fit){g.strokeStyle='rgba(232,112,90,.55)';pts.forEach(([x,y])=>{const fy=fit.f(x);if(isFinite(fy)){g.beginPath();g.moveTo(Mm.X(x),Mm.Y(y));g.lineTo(Mm.X(x),Mm.Y(fy));g.stroke();}});
      g.strokeStyle='#ecd59a';g.lineWidth=2.4;g.beginPath();let pen=false;for(let i=0;i<=300;i++){const x=10*i/300,y=fit.f(x);if(!isFinite(y)||y<-5||y>15){pen=false;continue;}pen?g.lineTo(Mm.X(x),Mm.Y(y)):g.moveTo(Mm.X(x),Mm.Y(y));pen=true;}g.stroke();g.lineWidth=1;}
    pts.forEach(([x,y],i)=>{dot(g,Mm.X(x),Mm.Y(y),6,i===dragI?'#fff':'#a585ef');});
    /* residual strip */const y0=420-m[2]+22,hh=58;g.fillStyle='#0f0b1e';g.fillRect(m[3],y0,900-m[1]-m[3],hh);g.strokeStyle='rgba(255,255,255,.2)';g.beginPath();g.moveTo(m[3],y0+hh/2);g.lineTo(900-m[1],y0+hh/2);g.stroke();
    txt(g,'ნარჩენები eᵢ = yᵢ − ŷᵢ',m[3]+4,y0-6,'#b3a68f','11px sans-serif','left');
    if(fit){const es=pts.map(([x,y])=>y-fit.f(x)).filter(isFinite),em=Math.max(1,...es.map(Math.abs));pts.forEach(([x,y])=>{const e=y-fit.f(x);if(isFinite(e))dot(g,Mm.X(x),y0+hh/2-e/em*(hh/2-4),3.5,'#e8705a');});
      $('rgIi').innerHTML=`<div style="font-size:16px;margin-bottom:6px">${fit.eq}</div><div class="kv2"><b>R²</b><span>${nf(fit.R2,4)}</span><b>RMSE</b><span>${nf(fit.rmse,4)}</span><b>n</b><span>${pts.length}</span></div>
        <div class="hint">ნარჩენებში ნიმუში (რკალი) ⇒ მოდელის ფორმა არასწორია. სცადე მრავალწევრი — და ნახე, როგორ „ზედმეტად მოერგება“ მაღალ ხარისხზე.</div>`;}
    else $('rgIi').innerHTML='<span class="hint">საჭიროა მეტი წერტილი (exp/ხარისხოვანს — y > 0, log-ს — x > 0)</span>';});
  /* econometrics */
  const ec=canvas($('rgEC'),900,260),ge=ec.g;let data=null;
  function parse(){const L=$('rgT').value.trim().split(/\r?\n/).filter(Boolean);if(L.length<3)return null;const sep=L[0].includes(';')?';':L[0].includes('\t')?'\t':',';
    const H=L[0].split(sep).map(s=>s.trim()),rows=L.slice(1).map(l=>l.split(sep).map(v=>+v.trim().replace(',','.'))).filter(r=>r.length===H.length&&r.every(Number.isFinite));return {H,rows};}
  function setup(){data=parse();if(!data){$('rgOut').innerHTML='<span class="ml2-pill no">CSV ვერ წავიკითხე</span>';return;}const yv=$('rgY').value;
    $('rgY').innerHTML=data.H.map(h=>`<option${h===yv?' selected':''}>${esc(h)}</option>`).join('');const y=$('rgY').value,prev=new Set([...$('rgXs').querySelectorAll('input:checked')].map(i=>i.value));
    $('rgXs').innerHTML='X: '+data.H.filter(h=>h!==y).map(h=>`<label><input type="checkbox" value="${esc(h)}"${!prev.size||prev.has(h)?' checked':''}> ${esc(h)}</label>`).join('');
    $('rgXs').querySelectorAll('input').forEach(i=>i.onchange=est);est();}
  function est(){if(!data)return;const yi=data.H.indexOf($('rgY').value),xs=[...$('rgXs').querySelectorAll('input:checked')].map(i=>i.value),logy=$('rgL').checked,sq=$('rgQ').checked;
    let rows=data.rows;if(logy)rows=rows.filter(r=>r[yi]>0);const names=['const'],cols=[];
    xs.forEach(h=>{const j=data.H.indexOf(h);names.push(h);cols.push(r=>r[j]);const bin=rows.every(r=>r[j]===0||r[j]===1);if(sq&&!bin){names.push(h+'²');cols.push(r=>r[j]*r[j]);}});
    const X=rows.map(r=>[1,...cols.map(f=>f(r))]),y=rows.map(r=>logy?Math.log(r[yi]):r[yi]),o=ols(X,y,$('rgH').checked);
    if(!o){$('rgOut').innerHTML='<span class="ml2-pill no">XᵀX გადაგვარებულია — რეგრესორები წრფივად დამოკიდებულია</span>';return;}
    const tc=tInv(0.975,o.df),dw=sum(o.e.slice(1).map((v,i)=>(v-o.e[i])**2))/o.sse,e2=o.e.map(v=>v*v),bp=ols(X,e2),LM=bp?o.n*bp.R2:NaN,bpp=1-chiCdf(LM,o.k-1);
    const em=mean(o.e),es=Math.sqrt(sum(o.e.map(v=>(v-em)**2))/o.n),S=sum(o.e.map(v=>((v-em)/es)**3))/o.n,Kk=sum(o.e.map(v=>((v-em)/es)**4))/o.n-3,JB=o.n/6*(S*S+Kk*Kk/4),jbp=1-chiCdf(JB,2);
    const vif=names.map((_,j)=>{if(!j||names.length<3)return '';const Xo=X.map(r=>r.filter((_,q)=>q!==j)),aux=ols(Xo,X.map(r=>r[j]));return aux?nf(1/(1-aux.R2),2):'';});
    $('rgOut').innerHTML=`<b>${logy?'log('+esc($('rgY').value)+')':esc($('rgY').value)}</b> — OLS${$('rgH').checked?' (HC1 მდგრადი SE)':''}, n = ${o.n}
      <table class="ml2-tab"><tr><th></th><th>β̂</th><th>SE</th><th>t</th><th>p</th><th>95% CI</th><th>VIF</th></tr>${names.map((nm,j)=>`<tr><td>${esc(nm)}</td><td>${nf(o.b[j],4)}<sup>${stars(o.p[j])}</sup></td><td>${nf(o.se[j],4)}</td><td>${nf(o.t[j],2)}</td><td>${pFmt(o.p[j])}</td><td>[${nf(o.b[j]-tc*o.se[j],3)}; ${nf(o.b[j]+tc*o.se[j],3)}]</td><td>${vif[j]}</td></tr>`).join('')}</table>
      <div class="kv2" style="margin-top:6px"><b>R² / R̄²</b><span>${nf(o.R2,4)} / ${nf(o.aR2,4)}</span><b>F(${o.k-1}, ${o.df})</b><span>${nf(o.F,2)}, p = ${pFmt(o.Fp)}</span><b>SER</b><span>${nf(o.s,4)}</span><b>AIC / BIC</b><span>${nf(o.aic,1)} / ${nf(o.bic,1)}</span>
        <b>დარბინ–უოტსონი</b><span>${nf(dw,3)}</span><b>ბროიშ–პაგანი</b><span>LM = ${nf(LM,2)}, p = ${pFmt(bpp)} ${bpp<0.05?'<span class="ml2-pill no">ჰეტეროსკედ.</span>':'<span class="ml2-pill ok">ჰომოსკედ.</span>'}</span>
        <b>ჟარკ–ბერა</b><span>${nf(JB,2)}, p = ${pFmt(jbp)}</span></div><div class="hint">*** p<0.001 · ** p<0.01 · * p<0.05 · · p<0.1${logy?' · log-მოდელში β·100 ≈ % ცვლილება':''}</div>`;
    /* residual plots */const fmin=Math.min(...o.fit),fmax=Math.max(...o.fit),emx=Math.max(...o.e.map(Math.abs));ge.fillStyle='#0b0816';ge.fillRect(0,0,900,260);
    const L1=mplot(ge,{x:[fmin,fmax],y:[-emx*1.1,emx*1.1],m:[18,470,22,40]});o.e.forEach((e,i)=>dot(ge,L1.X(o.fit[i]),L1.Y(e),2.5,'#a585ef'));txt(ge,'ნარჩენები ~ პროგნოზი',230,12,'#b3a68f','11px sans-serif');
    const bins=24,bw=2*emx/bins,h=Array(bins).fill(0);o.e.forEach(e=>h[Math.min(bins-1,Math.floor((e+emx)/bw))]++);const hm=Math.max(...h)*1.15;
    const L2=mplot(ge,{x:[-emx,emx],y:[0,hm],m:[18,14,22,490],bg:'rgba(0,0,0,0)'});ge.fillStyle='rgba(95,200,216,.5)';h.forEach((cn,k)=>ge.fillRect(L2.X(-emx+k*bw)+1,L2.Y(cn),L2.X(-emx+bw)-L2.X(-emx)-2,L2.Y(0)-L2.Y(cn)));
    ge.strokeStyle='#ecd59a';ge.lineWidth=2;ge.beginPath();for(let i=0;i<=200;i++){const x=-emx+2*emx*i/200,yv=normPdf(x,0,es)*o.n*bw;i?ge.lineTo(L2.X(x),L2.Y(yv)):ge.moveTo(L2.X(x),L2.Y(yv));}ge.stroke();txt(ge,'ნარჩენების ჰისტოგრამა',690,12,'#b3a68f','11px sans-serif');}
  $('rgT').oninput=setup;['rgL','rgQ','rgH'].forEach(id=>$(id).onchange=est);$('rgY').onchange=setup;
  bindBtns(root,'rgM',k=>{$('rgI').hidden=k!=='i';$('rgE').hidden=k!=='e';if(k==='e')setup();});
 }};

/* ═════════════ 7 · time series ═════════════ */
const tser={id:'tser',ico:'〰',t:'დროითი მწკრივები',s:'AR · MA · სეზონურობა · ACF · პროგნოზი',
 build(root){
  root.innerHTML=`<div>${btns('tsK',[['rw','შემთხვევითი ხეტიალი'],['ar','AR(1)'],['ma','MA(1)'],['arma','ARMA(1,1)'],['ts','ტრენდი + სეზონი'],['own','საკუთარი']],'ts')}</div><div id="tsC"></div>
   <div class="arow"><div class="acol"><div class="actl ml2">${sl('tsN','n',40,400,10,144)}${sl('tsPh','φ',-0.98,0.98,0.02,0.7)}${sl('tsTh','θ',-0.95,0.95,0.05,0.4)}${sl('tsS','σ',0.1,5,0.1,1)}
     ${sl('tsP','სეზონის პერიოდი s',2,24,1,12)}${sl('tsTr','ტრენდი',-0.3,0.3,0.01,0.08)}${sl('tsAm','სეზონის ამპლიტუდა',0,10,0.5,4)}
     <textarea class="ml2-in" id="tsT" hidden placeholder="ჩასვი რიცხვები"></textarea><div class="abt"><button id="tsG">🎲 ახალი</button></div></div></div>
    <div class="acol"><div class="actl ml2"><div class="ml2-flex" style="font-size:13px"><label><input type="checkbox" id="tsMA"> მოძრავი საშუალო</label><label><input type="checkbox" id="tsSE"> ექსპ. გლუვება</label><label><input type="checkbox" id="tsHW" checked> ჰოლტ–უინტერსი</label></div>
     ${sl('tsW','MA ფანჯარა k',2,30,1,12)}${sl('tsAl','α',0.02,1,0.02,0.3)}${sl('tsBe','β',0,1,0.02,0.1)}${sl('tsGa','γ',0,1,0.02,0.3)}
     <div class="ml2-flex" style="font-size:13px">დიფერენცირება: ${btns('tsD',[['0','არა'],['1','Δ'],['s','Δₛ']],'0')}</div>${sl('tsH','პროგნოზი h',0,48,1,24)}${sl('tsAr','AR(p) რიგი',1,8,1,2)}</div>
     <div id="tsI" class="ainfo"></div></div></div>
   <div id="tsA"></div><div id="tsDc"></div>
   ${card('ფორმულები',FX([['yₜ = φ·yₜ₋₁ + εₜ','AR(1)',{s:[['|φ| < 1','სტაციონარული'],['φ = 1','შემთხვევითი ხეტიალი (ერთეულოვანი ფესვი)']],w:'შოკი ქრება გეომეტრიულად φᵏ-ით.'}],['yₜ = εₜ + θ·εₜ₋₁','MA(1)',{s:[],w:'ACF წყდება 1-ელი ლაგის შემდეგ, PACF — ნელა ქრება.'}],
     ['ρₖ = γₖ / γ₀','ავტოკორელაცია (ACF)',{s:[['±1.96/√n','მნიშვნელოვნების საზღვრები']],w:'AR(p): PACF წყდება p-ზე; MA(q): ACF წყდება q-ზე — ასე ირჩევა მოდელი (ბოქს–ჯენკინსი).'}],
     ['ℓₜ = α(yₜ − sₜ₋ₛ) + (1 − α)(ℓₜ₋₁ + bₜ₋₁)','ჰოლტ–უინტერსი (ადიტიური)',{s:[['bₜ','ტრენდი'],['sₜ','სეზონი']],w:'სამი გლუვება: დონე, დახრა და სეზონური ფაქტორები.'}],
     ['Δyₜ = yₜ − yₜ₋₁ &nbsp;·&nbsp; Δₛyₜ = yₜ − yₜ₋ₛ','დიფერენცირება',{s:[],w:'ტრენდი და სეზონი ქრება — მწკრივი სტაციონარული ხდება (ARIMA-ს „I“).'}],
     ['Q = n(n + 2)·Σ ρₖ²/(n − k)','ლიუნგ–ბოქსი',{s:[],w:'ამოწმებს, არის თუ არა მწკრივი „თეთრი ხმაური“.'}]]))}`;
  const c=canvas($('tsC'),900,300),g=c.g,ca=canvas($('tsA'),900,190),ga=ca.g,cd=canvas($('tsDc'),900,230),gd=cd.g;let K2='ts',seed=5,y=[],shown=0;
  const vals=()=>({n:+$('tsN').value,ph:+$('tsPh').value,th:+$('tsTh').value,s:+$('tsS').value,p:+$('tsP').value,tr:+$('tsTr').value,am:+$('tsAm').value});
  function gen(){const o=vals(),R=rng(seed);if(K2==='own'){y=parseNums($('tsT').value);shown=y.length;return;}y=[];let prev=0,pe=0;
    for(let t=0;t<o.n;t++){const e=gauss(R)*o.s;let v;if(K2==='rw')v=prev+e;else if(K2==='ar')v=o.ph*prev+e;else if(K2==='ma')v=e+o.th*pe;else if(K2==='arma')v=o.ph*prev+e+o.th*pe;else v=10+o.tr*t+o.am*Math.sin(TAU*t/o.p)+e;y.push(v);prev=v;pe=e;}shown=Math.min(shown,y.length);}
  bindBtns(root,'tsK',k=>{K2=k;$('tsT').hidden=k!=='own';shown=0;gen();});['tsN','tsPh','tsTh','tsS','tsP','tsTr','tsAm'].forEach(id=>bindSl(id,()=>gen()));
  ['tsW','tsAl','tsBe','tsGa','tsH','tsAr'].forEach(id=>bindSl(id,()=>{}));let D='0';bindBtns(root,'tsD',k=>D=k);$('tsG').onclick=()=>{seed=Math.floor(Math.random()*1e6);shown=0;gen();};$('tsT').oninput=gen;
  const acf=(z,L)=>{const n=z.length,m=mean(z),g0=sum(z.map(v=>(v-m)**2))/n;return Array.from({length:L+1},(_,k)=>{let s=0;for(let t=k;t<n;t++)s+=(z[t]-m)*(z[t-k]-m);return s/n/g0;});};
  function dl(r,p){/* Durbin–Levinson: AR coefs + PACF */let phi=[],pac=[r[0]?1:0],v=1;for(let k=1;k<=p;k++){let num=r[k]-phi.reduce((s,f,j)=>s+f*r[k-1-j],0),a=num/v;const nw=phi.map((f,j)=>f-a*phi[k-2-j]);nw.push(a);phi=nw;v*=(1-a*a);pac.push(a);}return {phi,pac,v};}
  gen();
  anim(()=>{if(!y.length)return;if(shown<y.length)shown=Math.min(y.length,shown+Math.max(2,Math.ceil(y.length/90)));const Y=y.slice(0,shown),n=Y.length,o=vals(),s=o.p,H=shown===y.length?+$('tsH').value:0;
    let z=Y,d0=D==='1'?1:D==='s'?s:0;if(d0&&n>d0+5)z=Y.slice(d0).map((v,i)=>v-Y[i]);
    /* forecast with AR(p) on z */let fc=[],band=[];const p=Math.min(+$('tsAr').value,Math.floor(z.length/4));
    if(H&&z.length>10){const r=acf(z,p),{phi,v}=dl(r,p),mz=mean(z),s2=v*sum(z.map(t=>(t-mz)**2))/z.length,zz=z.slice(),zf=[];
      for(let h=0;h<H;h++){let val=mz;for(let i=0;i<p;i++)val+=phi[i]*((zz[zz.length-1-i])-mz);zz.push(val);zf.push(val);}
      const psi=[1];for(let j=1;j<H;j++){let s3=0;for(let i=1;i<=p;i++)if(j-i>=0)s3+=phi[i-1]*psi[j-i];psi.push(s3);}
      let psiY=psi;if(d0){psiY=psi.map((_,j)=>{let s4=0;for(let m2=0;j-m2*d0>=0;m2++)s4+=psi[j-m2*d0];return s4;});}
      const yy=Y.slice();zf.forEach((zv,h)=>{const v2=d0?yy[yy.length-d0]+zv:zv;yy.push(v2);fc.push(v2);});let cum=0;fc.forEach((_,h)=>{cum+=psiY[h]**2;band.push(1.96*Math.sqrt(s2*cum));});}
    const all=[...Y,...fc.map((v,i)=>v+band[i]),...fc.map((v,i)=>v-band[i])],lo=Math.min(...all),hi=Math.max(...all),pad=(hi-lo)*0.08||1;
    const M=mplot(g,{x:[0,(y.length-1)+H],y:[lo-pad,hi+pad],m:[12,14,22,40]});
    if(fc.length){g.fillStyle='rgba(236,213,154,.14)';g.beginPath();fc.forEach((v,i)=>{const X=M.X(n+i),Yp=M.Y(v+band[i]);i?g.lineTo(X,Yp):g.moveTo(X,Yp);});for(let i=fc.length-1;i>=0;i--)g.lineTo(M.X(n+i),M.Y(fc[i]-band[i]));g.closePath();g.fill();}
    const line=(arr,col,w,off=0,dash)=>{g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash||[]);g.beginPath();let pen=false;arr.forEach((v,i)=>{if(v==null||!isFinite(v)){pen=false;return;}const X=M.X(i+off),Yv=M.Y(v);pen?g.lineTo(X,Yv):g.moveTo(X,Yv);pen=true;});g.stroke();g.setLineDash([]);g.lineWidth=1;};
    line(Y,'#a585ef',1.6);
    if($('tsMA').checked){const k=+$('tsW').value,ma=Y.map((_,i)=>i>=k-1?mean(Y.slice(i-k+1,i+1)):null);line(ma,'#5fc8d8',2);}
    let sse=0,ses=null;if($('tsSE').checked){const a=+$('tsAl').value;ses=[Y[0]];for(let i=1;i<n;i++)ses.push(a*Y[i]+(1-a)*ses[i-1]);line(ses,'#6fcf8a',2);}
    let hwInfo='';if($('tsHW').checked&&n>=2*s){const a=+$('tsAl').value,b=+$('tsBe').value,gm=+$('tsGa').value,L0=mean(Y.slice(0,s)),B0=(mean(Y.slice(s,2*s))-L0)/s,S=Y.slice(0,s).map(v=>v-L0);
      let L=L0,B=B0;const fit=Array(s).fill(null);for(let t=s;t<n;t++){const f=L+B+S[t%s];fit.push(f);sse+=(Y[t]-f)**2;const Ln=a*(Y[t]-S[t%s])+(1-a)*(L+B);B=b*(Ln-L)+(1-b)*B;S[t%s]=gm*(Y[t]-Ln)+(1-gm)*S[t%s];L=Ln;}
      line(fit,'#ecd59a',1.6,0,[5,4]);if(H){const f2=[];for(let h=1;h<=H;h++)f2.push(L+h*B+S[(n+h-1)%s]);line([Y[n-1],...f2],'#ecd59a',2.2,n-1);}hwInfo=`<b>ჰ–უ RMSE</b><span>${nf(Math.sqrt(sse/Math.max(1,n-s)),3)}</span>`;}
    if(fc.length)line([Y[n-1],...fc],'#e8705a',2.2,n-1);
    txt(g,`AR(${p}) პროგნოზი 95%-ით — წითელი${$('tsHW').checked?' · ჰოლტ–უინტერსი — ოქროსფერი':''}`,M.x0+6,M.y0+12,'#b3a68f','11px sans-serif','left');
    /* ACF / PACF of z */const L=Math.min(30,Math.floor(z.length/3)),r=acf(z,L),pac=dl(r,L).pac,bd=1.96/Math.sqrt(z.length);ga.fillStyle='#0b0816';ga.fillRect(0,0,900,190);
    [[r,'ACF',0],[pac,'PACF',455]].forEach(([arr,lab,x0])=>{const Mm=mplot(ga,{x:[-0.5,L+0.5],y:[-1,1],m:[18,900-x0-445,20,x0+34],bg:'rgba(0,0,0,0)',labels:true,step:5,stepY:0.5});
      ga.fillStyle='rgba(95,200,216,.1)';ga.fillRect(Mm.x0,Mm.Y(bd),Mm.w,Mm.Y(-bd)-Mm.Y(bd));arr.forEach((v,k)=>{if(!k)return;ga.strokeStyle=Math.abs(v)>bd?'#ecd59a':'#a585ef';ga.lineWidth=3;ga.beginPath();ga.moveTo(Mm.X(k),Mm.Y(0));ga.lineTo(Mm.X(k),Mm.Y(v));ga.stroke();});ga.lineWidth=1;
      txt(ga,lab+(d0?` (Δ${d0>1?'ₛ':''}y)`:''),x0+60,12,'#b3a68f','11px sans-serif','left');});
    /* decomposition */gd.fillStyle='#0b0816';gd.fillRect(0,0,900,230);if(n>=2*s+2){const half=Math.floor(s/2),tr=Y.map((_,i)=>{if(i<half||i>=n-half)return null;if(s%2)return mean(Y.slice(i-half,i+half+1));
        let a=0;for(let j=-half;j<=half;j++)a+=Y[i+j]*(Math.abs(j)===half?0.5:1);return a/s;});const sea=Array(s).fill(0),cn=Array(s).fill(0);Y.forEach((v,i)=>{if(tr[i]!=null){sea[i%s]+=v-tr[i];cn[i%s]++;}});
      const si=sea.map((v,i)=>cn[i]?v/cn[i]:0),sm=mean(si),S2=si.map(v=>v-sm),seas=Y.map((_,i)=>S2[i%s]),rem=Y.map((v,i)=>tr[i]!=null?v-tr[i]-seas[i]:null);
      [[tr,'ტრენდი','#5fc8d8'],[seas,'სეზონი','#ecd59a'],[rem,'ნაშთი','#e8705a']].forEach(([arr,lab,col],k)=>{const vv=arr.filter(v=>v!=null),a1=Math.min(...vv),a2=Math.max(...vv),y0=6+k*75,hh=66;
        gd.strokeStyle='rgba(255,255,255,.08)';gd.strokeRect(40,y0,846,hh);gd.strokeStyle=col;gd.lineWidth=1.5;gd.beginPath();let pen=false;arr.forEach((v,i)=>{if(v==null){pen=false;return;}const X=40+846*i/(y.length-1||1),Yv=y0+hh-(v-a1)/((a2-a1)||1)*hh;pen?gd.lineTo(X,Yv):gd.moveTo(X,Yv);pen=true;});gd.stroke();
        txt(gd,lab,44,y0+12,col,'11px sans-serif','left');});}else txt(gd,'კლასიკური დეკომპოზიციისთვის საჭიროა n ≥ 2s',450,115,'#6d6253','12px sans-serif');
    /* stats */const lb=(()=>{const m=Math.min(10,L);let Q=0;for(let k=1;k<=m;k++)Q+=r[k]**2/(z.length-k);Q*=z.length*(z.length+2);return [Q,1-chiCdf(Q,m)];})();
    const dy=Y.slice(1).map((v,i)=>v-Y[i]),df=ols(Y.slice(0,-1).map(v=>[1,v]),dy),adf=df?df.t[1]:NaN;
    $('tsI').innerHTML=`<div class="kv2"><b>n</b><span>${n}</span><b>საშუალო / σ</b><span>${nf(mean(Y),3)} / ${nf(Math.sqrt(varS(Y)),3)}</span><b>დიკი–ფულერი t</b><span>${nf(adf,2)} ${adf<-2.86?'<span class="ml2-pill ok">სტაციონარული (5%)</span>':'<span class="ml2-pill no">ერთეულოვანი ფესვი?</span>'}</span>
      <b>ლიუნგ–ბოქსი Q(10)</b><span>${nf(lb[0],2)}, p = ${pFmt(lb[1])}</span>${hwInfo}</div><div class="hint">კრიტიკული მნიშვნელობა (მუდმივით, 5%): −2.86.</div>`;});
 }};

/* ═════════════ 8 · function game (own page) ═════════════ */
const fgame={id:'fgame',ico:'🏆',t:'ფუნქციების თამაში',s:'ოქროს წერტილები · შენი წერტილი მრუდზე მისრიალებს',
 build(root){root.innerHTML=`<div class="ainfo" style="font-size:15px;line-height:1.7">შენი წერტილი დგას დაფაზე. ჩაწერე ფუნქცია — წერტილი მის მრუდზე „გასრიალდება“ მარცხნიდან მარჯვნივ. შეეხე ყველა <b style="color:#ecd59a">ოქროს წერტილს</b> რაც შეიძლება ცოტა ფორმულით.
   <ul><li>ფორმულა იწერება ისე, როგორც ქაღალდზე: ხარისხი, ინდექსი, ფესვი, წილადი — <b>^</b> ნიშნის გარეშე.</li><li>დონეები, სირთულე და ორმოთამაშიანი რეჟიმი: ერთი სვამს ოქროს წერტილებს, მეორე წერს ფორმულებს.</li></ul></div>
   <a class="ml2-big" href="funcgame.html" target="_blank">▶ თამაშის გახსნა</a><a class="ml2-big" href="vector.html" target="_blank" style="border-color:rgba(165,133,239,.5);color:#d6c6ff">✎ ვექტორული რედაქტორი — ფიგურები და ფორმულები</a>`;}};

return {at:4,level:{t:'მონაცემები და მოდელები',n:'გრაფიკები, მატრიცები, შემთხვევა',d:'ფუნქციების გრაფიკები, მატრიცები ნაბიჯებით, კომბინატორიკა, განაწილებები, სტატისტიკა, ეკონომეტრიკა და დროითი მწკრივები.',ids:['grapher','matx','comb','dist','desc','regr','tser','fgame']},
 mods:[grapher,matx,comb,dist,desc,regr,tser,fgame],
 intro:{grapher:'ჩაწერე ნებისმიერი ფორმულა ისე, როგორც რვეულში — ხარისხი, ფესვი, წილადი, ინდექსი. ასოები სლაიდერებად იქცევა, ▶ ანიმაციას რთავს. პოლარული და პარამეტრული მრუდები, წარმოებული, ინტეგრალი, ფესვები და გადაკვეთები.',
  matx:'ნებისმიერი ზომის მატრიცები: შეკრება, გამრავლება, დეტერმინანტი, შებრუნებული, რანგი და RREF — ყველა ნაბიჯით. საკუთრივი მნიშვნელობები და ვექტორები, განტოლებათა სისტემები და სიბრტყის გარდაქმნის ანიმაცია.',
  comb:'რამდენი ხერხით? გადანაცვლება, წყობა, ჯუფთება, გამეორებით და მის გარეშე — ფორმულა, რიცხვი და სრული ჩამონათვალი. პასკალის სამკუთხედი და დაბადების დღის პარადოქსი.',
  dist:'ცხრა მთავარი განაწილება სლაიდერებით: ალბათობა ინტერვალში, მოლოდინი, დისპერსია. სიმულაცია აჩვენებს დიდ რიცხვთა კანონს, ცენტრალური ზღვრითი თეორემა — როგორ იბადება ზარი.',
  desc:'ჩასვი მონაცემები — მიიღე ყველაფერი: საშუალო, მედიანა, კვარტილები, გამოვარდნილები, ჰისტოგრამა, ყუთის დიაგრამა, Q–Q, ნდობის ინტერვალი და t-ტესტი.',
  regr:'გადაათრიე წერტილები და ნახე, როგორ იცვლება წრფე, მრავალწევრი თუ ექსპონენტა. ეკონომეტრიკის რეჟიმი — ნამდვილი რეგრესიის ცხრილი: β, SE, t, p, R², F, VIF და დიაგნოსტიკური ტესტები.',
  tser:'მწკრივები, რომლებიც დროში ვითარდება: AR, MA, ტრენდი და სეზონი. მოძრავი საშუალო, ჰოლტ–უინტერსი, ACF/PACF, დეკომპოზიცია და პროგნოზი ნდობის ზოლით.',
  fgame:'თამაში, სადაც მათემატიკა იარაღია: ფორმულის მრუდზე მოსრიალე წერტილით შეაგროვე ოქროს წერტილები.'},
 quiz:{grapher:[['y = f(x − 2) + 3 გრაფიკი f-თან შედარებით:',['2-ით მარჯვნივ, 3-ით ზევით','2-ით მარცხნივ, 3-ით ზევით','2-ით მარჯვნივ, 3-ით ქვევით','არ იცვლება'],0,''],['f′(x₀) = 0 და f″(x₀) > 0 ⇒',['მინიმუმი','მაქსიმუმი','ფესვი','გადაღუნვა'],0,''],['r = cos(3θ) — რამდენფურცლიანი ვარდია?',['3','6','1','9'],0,'კენტი k ⇒ k ფურცელი.']],
  matx:[['A (2×3) · B (3×4) =',['2×4','3×3','4×2','არ მრავლდება'],0,''],['det(A·B) = ?',['det A · det B','det A + det B','det A / det B','0'],0,''],['A⁻¹ არსებობს ⇔',['det A ≠ 0','A სიმეტრიულია','A-ს ყველა ელემენტი ≠ 0','tr A ≠ 0'],0,'']],
  comb:[['C(10, 3) = ?',['120','720','30','1000'],0,'10·9·8 / 6.'],['5 წიგნი თაროზე — რამდენი წყობა?',['120','25','60','5'],0,'5!'],['C(n, k) = C(n, ?)',['n − k','k − n','k','n + k'],0,'']],
  dist:[['B(n, p)-ის მოლოდინი:',['np','n/p','p/n','np(1 − p)'],0,''],['ნორმალურში μ ± 2σ დაახლოებით მოიცავს:',['95%','68%','99.7%','50%'],0,''],['ცენტრალური ზღვრითი თეორემა ამბობს:',['საშუალოები ნორმალურისკენ მიდის','ყველა განაწილება ნორმალურია','დისპერსია იზრდება','საშუალო = მედიანა'],0,'']],
  desc:[['რომელია მდგრადი გამოვარდნილების მიმართ?',['მედიანა','საშუალო','სტანდ. გადახრა','გაბნევა'],0,''],['s²-ში n − 1 იმიტომ, რომ:',['x̄ მონაცემებიდანაა შეფასებული','n უცნობია','ასე უფრო დიდია','ტრადიციაა'],0,''],['p = 0.03, α = 0.05 ⇒',['H₀ უარიყოფა','H₀ მიიღება ზუსტად','H₁ დამტკიცდა 97%-ით','არაფერი'],0,'']],
  regr:[['R² = 0.8 ნიშნავს:',['მოდელი y-ის ვარიაციის 80%-ს ხსნის','80% წერტილი წრფეზეა','კორელაცია 0.8-ია','შეცდომა 20%-ია'],0,''],['ბროიშ–პაგანის ტესტი ამოწმებს:',['ჰეტეროსკედასტიკურობას','ავტოკორელაციას','ნორმალურობას','მულტიკოლინეარობას'],0,''],['log(y) = … + 0.08·educ ⇒ +1 წელი განათლება:',['≈ +8% y','+0.08 y','+80% y','+8 y'],0,'']],
  tser:[['AR(1)-ში φ = 1 —',['შემთხვევითი ხეტიალი','თეთრი ხმაური','სეზონი','MA(1)'],0,''],['MA(1)-ის ACF:',['წყდება 1 ლაგის შემდეგ','ნელა ქრება','ყველგან ნულია','პერიოდულია'],0,''],['Δₛ (სეზონური სხვაობა) აქრობს:',['სეზონურობას','ხმაურს','საშუალოს','დისპერსიას'],0,'']]}};
});
})();
