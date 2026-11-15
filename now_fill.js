/* ?now=1 — fill the page's form with this moment (Tbilisi) and calculate automatically.
   Used by the home-page "now" widgets (now_widgets.js). */
(function(){
if(!/[?&]now=1/.test(location.search))return;
const P=location.pathname.split('/').pop()||'',t=new Date(),pad=n=>String(n).padStart(2,'0');
const TZ=(Intl.DateTimeFormat().resolvedOptions().timeZone)||'Asia/Tbilisi';
const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;e.dispatchEvent(new Event('change'));}};
function place(p){set(p+'-city','თბილისი');set(p+'-lat','41.7151');set(p+'-lon','44.8271');set(p+'-tz',TZ);
  const d=document.getElementById(p+'-tz-display');if(d)d.textContent='🌐 '+TZ;
  const r=document.getElementById(p+'-tz-row');if(r)r.style.display='';}
function moment(p){set(p+'-day',t.getDate());set(p+'-month',t.getMonth()+1);set(p+'-year',t.getFullYear());
  set(p+'-hour',t.getHours());set(p+'-minute',t.getMinutes());set(p+'-second',t.getSeconds());
  const u=document.getElementById(p+'-time-unknown');if(u&&u.checked){u.checked=false;u.dispatchEvent(new Event('change'));}}
function go(){try{
  if(P.startsWith('astro')){set('n-name','ცა ახლა');moment('n');place('n');window.generate&&generate();}
  else if(P.startsWith('hd')){moment('n');place('n');window.generate&&generate();}
  else if(P.startsWith('moon')){['day','month','year','hour','minute','second'].forEach((k,i)=>set(k,[t.getDate(),t.getMonth()+1,t.getFullYear(),t.getHours(),t.getMinutes(),t.getSeconds()][i]));
    set('city','თბილისი');set('lat','41.7151');set('lon','44.8271');set('tz_name',TZ);window.calculate&&calculate();}
  else if(P.startsWith('matrix')){const q=n=>document.querySelector('[name='+n+']');q('dd').value=pad(t.getDate());q('mm').value=pad(t.getMonth()+1);q('yyyy').value=t.getFullYear();window.calculate&&calculate();}
  else if(P.startsWith('pythagoras')){set('birth',pad(t.getDate())+'/'+pad(t.getMonth()+1)+'/'+t.getFullYear());window.calculate&&calculate();}
}catch(e){console.warn('now_fill',e);}}
if(document.readyState==='complete')setTimeout(go,300);else addEventListener('load',()=>setTimeout(go,300));
})();
