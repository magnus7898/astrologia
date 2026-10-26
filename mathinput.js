/* mathinput.js — visual math input shared by the math lab, funcgame.html and vector.html.
   Exponents, indices, fractions and roots are typed the way they look (no ^ needed): MathLive field
   with its own on-screen keyboard. The LaTeX it produces is translated to a math.js expression and
   compiled. If the libraries cannot load, a plain text field is used (then x^2, sqrt(x) work).

   MI.ready                     → Promise<{mathlive, mathjs}>
   MI.field(host, {value, placeholder, onInput(f), onEnter(f), size}) → {el, latex(), set(latex), focus()}
   MI.compile(latexOrText, {vars:['x']}) → {ok, f(scope), expr, params:[names], error}
   MI.texToExpr(latex)          → math.js expression text                                         */
(function(){
'use strict';
if(window.MI)return;
const ML='https://cdn.jsdelivr.net/npm/mathlive@0.109.2/mathlive.min.js';
const MJ='https://cdn.jsdelivr.net/npm/mathjs@15.2.0/lib/browser/math.js';
const load=src=>new Promise(ok=>{const s=document.createElement('script');s.src=src;s.onload=()=>ok(true);s.onerror=()=>ok(false);document.head.appendChild(s);});
const ready=Promise.all([load(MJ),load(ML)]).then(()=>{
  const r={mathjs:!!window.math,mathlive:!!window.MathfieldElement};
  if(r.mathlive){try{MathfieldElement.fontsDirectory=ML.replace(/[^/]+$/,'fonts');MathfieldElement.soundsDirectory=null;}catch(e){}}
  return r;});

const st=document.createElement('style');
st.textContent=`math-field.mi-f,input.mi-f{display:block;width:100%;min-height:42px;background:#0b0816;color:#efe6d4;border:1px solid rgba(201,168,76,.35);border-radius:10px;padding:6px 10px;font-size:20px;
  --caret-color:#ecd59a;--selection-background-color:rgba(165,133,239,.35);--contains-highlight-background-color:rgba(165,133,239,.12);--primary-color:#c9a84c;--smart-fence-color:#b3a68f;box-sizing:border-box;outline:none}
math-field.mi-f:focus-within,input.mi-f:focus{border-color:#ecd59a;box-shadow:0 0 0 2px rgba(236,213,154,.18)}
input.mi-f{font:16px ui-monospace,Menlo,monospace}
math-field.mi-f::part(menu-toggle){color:#b3a68f}math-field.mi-f::part(virtual-keyboard-toggle){color:#ecd59a}`;
document.head.appendChild(st);

/* ── LaTeX (as MathLive writes it) → math.js text ── */
const FN={sin:'sin',cos:'cos',tan:'tan',cot:'cot',sec:'sec',csc:'csc',arcsin:'asin',arccos:'acos',arctan:'atan',arccot:'acot',
  sinh:'sinh',cosh:'cosh',tanh:'tanh',coth:'coth',exp:'exp',ln:'log',lg:'log10',log:'log',abs:'abs',sgn:'sign',sign:'sign',floor:'floor',ceil:'ceil',
  max:'max',min:'min',arg:'arg',det:'det',round:'round',mod:'mod',gcd:'gcd',lcm:'lcm'};
const GREEK=new Set(['alpha','beta','gamma','delta','epsilon','varepsilon','zeta','eta','theta','vartheta','iota','kappa','lambda','mu','nu','xi','rho','sigma','tau','upsilon','phi','varphi','chi','psi','omega']);
function texToExpr(s){
  s=String(s||'').replace(/\\left\\\{|\\right\\\}/g,m=>m.includes('left')?'(':')').replace(/\\!|\\,|\\;|\\:|\\quad|\\qquad|~/g,' ')
    .replace(/\\displaystyle|\\textstyle/g,'').replace(/\\placeholder\{[^}]*\}/g,'');
  let i=0,abs=0;
  const peek=()=>s[i];
  const skip=()=>{while(i<s.length&&s[i]===' ')i++;};
  function name(){let n='';i++;if(/[A-Za-z]/.test(s[i])){while(i<s.length&&/[A-Za-z]/.test(s[i]))n+=s[i++];}else n=s[i++]||'';return n;}
  function group(){skip();if(s[i]==='{'){i++;const r=seq('}');i++;return r;}if(s[i]==='\\'){const save=i,n=name();if(GREEK.has(n)||n==='pi')return ' '+n+' ';i=save;return item();}return item();}
  function rawGroup(){skip();if(s[i]==='{'){let d=0,o='';i++;while(i<s.length){if(s[i]==='{')d++;else if(s[i]==='}'){if(!d)break;d--;}o+=s[i++];}i++;return o;}return s[i++]||'';}
  function seq(end){let o='';while(i<s.length&&s[i]!==end)o+=item();return o;}
  /* argument of a function written without parentheses: \sin x, \sin 2x, \sin x^2 */
  /* a whole bracketed group: ( … ) or \left( … \right) with nesting */
  function paren(){let o='',d=0;
    if(s[i]==='('){i++;o='(';while(i<s.length){if(s[i]==='('){d++;i++;o+='(';continue;}if(s[i]===')'){i++;if(!d){o+=')';break;}d--;o+=')';continue;}o+=item();}return o;}
    o=item();/* \left… */while(i<s.length){if(s.startsWith('\\left',i)){d++;o+=item();continue;}if(s.startsWith('\\right',i)){const r=item();o+=r;if(!d)break;d--;continue;}o+=item();}return o;}
  function fnArg(){skip();if(s[i]==='('||s.startsWith('\\left',i)){return paren();}
    let o='';const st0=i;
    while(i<s.length){skip();const c=s[i];if(c===undefined)break;
      if(/[0-9.]/.test(c)||/[A-Za-z]/.test(c)){o+=item();continue;}
      if(c==='^'||c==='_'){o+=item();continue;}
      if(c==='\\'){const sv=i,n=name();i=sv;if(GREEK.has(n)||n==='pi'||n==='frac'||n==='sqrt'){o+=item();continue;}}
      if(c==='{'){o+=item();continue;}
      break;}
    return i===st0?'':o;}
  function item(){
    const c=s[i];
    if(c==='\\'){
      const n=name();
      if(n==='frac'||n==='dfrac'||n==='tfrac'){const a=group(),b=group();return `((${a})/(${b}))`;}
      if(n==='sqrt'){skip();let k='';if(s[i]==='['){i++;let d=0;while(i<s.length&&!(s[i]===']'&&!d)){if(s[i]==='[')d++;if(s[i]===']')d--;k+=s[i++];}i++;}
        const a=group();return k?`nthRoot((${a}),(${texToExpr(k)}))`:`sqrt(${a})`;}
      if(n==='left'){skip();const d=s[i]==='\\'?name():s[i++];if(d==='|'||d==='vert'||d==='lvert'){abs++;return ' abs(';}return '(';}
      if(n==='right'){skip();const d=s[i]==='\\'?name():s[i++];if(d==='|'||d==='vert'||d==='rvert'){abs=Math.max(0,abs-1);return ') ';}return ')';}
      if(n==='cdot'||n==='times'||n==='ast')return '*';
      if(n==='div')return '/';
      if(n==='pi')return ' pi ';
      if(n==='infty')return ' Infinity ';
      if(n==='exponentialE')return ' e ';
      if(n==='mathrm'||n==='text'||n==='mathit'||n==='operatorname'||n==='mathbf'){const g=rawGroup().trim();
        if(FN[g])return ' '+FN[g]+'('+fnArg()+')';return ' '+g.replace(/[^A-Za-z0-9_]/g,'')+' ';}
      if(n==='log'){skip();if(s[i]==='_'){i++;const b=group();const a=fnArg();return ` log((${a}),(${b}))`;}return ' log('+fnArg()+')';}
      if(FN[n]){skip();let p='';if(s[i]==='^'){i++;p=group();}const a=fnArg();return p?` (${FN[n]}(${a}))^(${p})`:` ${FN[n]}(${a})`;}
      if(GREEK.has(n)){let id=n;if(s[i]==='_'){i++;id+='_'+rawGroup().replace(/[^A-Za-z0-9]/g,'');}return ' '+id+' ';}
      if(n==='lbrace'||n==='{')return '(';if(n==='rbrace'||n==='}')return ')';
      if(n==='vert'||n==='|'){abs?(abs--):abs++;return abs?' abs(':') ';}
      if(n==='le'||n==='leq')return '<=';if(n==='ge'||n==='geq')return '>=';
      if(n==='degree')return ' deg ';
      return ' ';}
    if(c==='^'){i++;return '^('+group()+')';}
    if(c==='_'){i++;return '_'+rawGroup().replace(/[^A-Za-z0-9]/g,'');}
    if(c==='{'){i++;const r=seq('}');i++;return '('+r+')';}
    if(c==='}'){i++;return '';}
    if(c==='|'){i++;if(abs){abs--;return ') ';}abs++;return ' abs(';}
    if(/[A-Za-z]/.test(c)){i++;let id=c;if(s[i]==='_'){i++;id+='_'+rawGroup().replace(/[^A-Za-z0-9]/g,'');}return ' '+id+' ';}
    if(/[0-9.]/.test(c)){let n='';while(i<s.length&&/[0-9.]/.test(s[i]))n+=s[i++];return ' '+n+' ';}
    i++;return c;
  }
  let out='';while(i<s.length)out+=item();
  return out.replace(/\s+/g,' ').trim();
}
const looksTex=s=>/\\[A-Za-z]|[{}|]/.test(s);
const RESERVED=new Set(['pi','e','Infinity','i','deg','true','false','PI','E']);

function compile(src,o){
  o=o||{};const vars=o.vars||['x'];
  if(!window.math)return {ok:false,error:'math.js ვერ ჩაიტვირთა',f:()=>NaN,params:[]};
  let expr=looksTex(src)?texToExpr(src):String(src||'');
  expr=expr.replace(/(\d),(\d)/g,'$1.$2');
  if(!expr.trim())return {ok:false,error:'',f:()=>NaN,params:[],expr};
  try{
    const node=math.parse(expr);
    const fnNames=new Set();node.traverse(n=>{if(n.isFunctionNode&&n.fn&&n.fn.name)fnNames.add(n.fn.name);});
    const params=[];node.traverse(n=>{if(n.isSymbolNode&&!fnNames.has(n.name)&&!vars.includes(n.name)&&!RESERVED.has(n.name)&&!params.includes(n.name))params.push(n.name);});
    const code=node.compile();
    const f=scope=>{try{const v=code.evaluate(Object.assign({},scope));return typeof v==='number'?v:(v&&typeof v.re==='number'&&Math.abs(v.im)<1e-12?v.re:(typeof v==='boolean'?+v:NaN));}catch(e){return NaN;}};
    return {ok:true,f,expr,params,node};
  }catch(e){return {ok:false,error:e.message,f:()=>NaN,params:[],expr};}
}

function field(host,o){
  o=o||{};let el;
  const api={latex:()=>'',set:()=>{},focus:()=>{}};
  const mount=r=>{
    if(r.mathlive){
      el=document.createElement('math-field');el.className='mi-f';
      if(o.size)el.style.fontSize=o.size+'px';
      el.setAttribute('math-virtual-keyboard-policy','auto');
      if(o.placeholder)el.setAttribute('placeholder','\\text{'+o.placeholder.replace(/[{}\\]/g,'')+'}');
      host.appendChild(el);el.value=o.value||'';
      el.addEventListener('input',()=>o.onInput&&o.onInput(api));
      el.addEventListener('keydown',e=>{if(e.key==='Enter'&&o.onEnter){e.preventDefault();o.onEnter(api);}});
      api.latex=()=>el.value;api.set=v=>{el.value=v;o.onInput&&o.onInput(api);};api.focus=()=>el.focus();
    }else{
      el=document.createElement('input');el.className='mi-f';el.placeholder=(o.placeholder||'')+' — მაგ. x^2 + sqrt(x)';el.spellcheck=false;
      el.value=o.value&&looksTex(o.value)?texToExpr(o.value):(o.value||'');host.appendChild(el);
      el.addEventListener('input',()=>o.onInput&&o.onInput(api));
      el.addEventListener('keydown',e=>{if(e.key==='Enter'&&o.onEnter){e.preventDefault();o.onEnter(api);}});
      api.latex=()=>el.value;api.set=v=>{el.value=looksTex(v)?texToExpr(v):v;o.onInput&&o.onInput(api);};api.focus=()=>el.focus();
    }
    api.el=el;if(o.onReady)o.onReady(api);
  };
  ready.then(mount);
  return api;
}

window.MI={ready,field,compile,texToExpr};
})();
