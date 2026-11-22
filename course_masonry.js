/* MAGNUS — course pages: modules packed into balanced columns (no empty gaps).
   Each module goes to the shortest column, in order, so numbering still reads left → right.
   A very long module (8+ lessons) runs full width underneath, its lessons in columns. */
(function(){
const root=document.querySelector('.page > .cols');if(!root)return;
const boxes=[...root.children];
const st=document.createElement('style');
st.textContent='.cols.mz{display:block!important}.mzr{display:flex;gap:18px;align-items:flex-start}.mzr>.mzc{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:18px}'+
 '.cols.mz>*+*{margin-top:18px}.box.wide .wl{column-gap:28px}.box.wide .wl .les{break-inside:avoid}.box.wide .wl .les:last-child{border-bottom:1px solid rgba(255,255,255,.07)}';
document.head.appendChild(st);
/* one lesson = one row: number · title · subtitle on a single line, full text on hover */
const s1=document.createElement('style');
s1.textContent='.les{padding:7px 4px!important;gap:10px!important;white-space:nowrap}.les .no{flex:0 0 26px!important;height:26px!important;font-size:13px}'+
 '.les>span:last-child{min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.les>span:last-child b{display:inline!important;font-size:14px}.les>span:last-child small{display:inline!important;margin:0 0 0 8px!important;font-size:12px}';
document.head.appendChild(s1);
document.querySelectorAll('.les').forEach(a=>{const b=a.querySelector('b'),m=a.querySelector('small');if(!a.title)a.title=(b?b.textContent:'')+(m?' — '+m.textContent:'');});
const many=b=>b.querySelectorAll('.les').length>=8;
let last=0;
function lay(force){const n=window.innerWidth<=760?1:window.innerWidth<=1100?2:3;
  if(n===last&&!force)return;last=n;
  root.classList.add('mz');root.innerHTML='';
  boxes.forEach(b=>{const wl=b.querySelector(':scope > .wl');if(wl){while(wl.firstChild)b.insertBefore(wl.firstChild,wl);wl.remove();}b.classList.remove('wide');});
  /* split into runs at each long module, keep the order: run → long module → run … */
  const segs=[];let cur=[];
  boxes.forEach(b=>{if(n>1&&many(b)){if(cur.length)segs.push(cur);segs.push(b);cur=[];}else cur.push(b);});
  if(cur.length)segs.push(cur);
  const wide=b=>{b.classList.add('wide');const wl=document.createElement('div');wl.className='wl';wl.style.columnCount=n;
    b.querySelectorAll(':scope > .les').forEach(l=>wl.appendChild(l));b.appendChild(wl);root.appendChild(b);};
  segs.forEach(sg=>{
    if(!Array.isArray(sg)){wide(sg);return;}
    if(n>1&&sg.length===1){wide(sg[0]);return;}           /* a lone module: full width too */
    const row=document.createElement('div');row.className='mzr';root.appendChild(row);
    const k0=Math.min(n,sg.length);
    const cols=[...Array(k0)].map(()=>{const c=document.createElement('div');c.className='mzc';row.appendChild(c);return c;});
    sg.forEach(b=>{let k=0;cols.forEach((c,i)=>{if(c.offsetHeight<cols[k].offsetHeight-4)k=i;});cols[k].appendChild(b);});
  });
}
lay();let t=null;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>lay(false),120);});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>lay(true));
})();
