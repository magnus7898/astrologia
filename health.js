/* MAGNUS · ჯანმრთელობა — shared helpers: sound, storage, reminders, daily checklist */
(function(){
const H={};
H.$=id=>document.getElementById(id);
H.pad=n=>String(n).padStart(2,'0');
H.dayKey=(d)=>{d=d||new Date();return d.getFullYear()+'-'+H.pad(d.getMonth()+1)+'-'+H.pad(d.getDate());};
H.hm=d=>H.pad(d.getHours())+':'+H.pad(d.getMinutes());
H.mmss=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;return(h?h+':'+H.pad(m):m)+':'+H.pad(r);};
H.dur=s=>{s=Math.max(0,Math.round(s/60));const h=Math.floor(s/60),m=s%60;return h?`${h} სთ${m?' '+m+' წთ':''}`:`${m} წთ`;};

/* storage — this device only; every access guarded */
H.get=(k,def)=>{try{const v=localStorage.getItem('h-'+k);return v===null?def:JSON.parse(v);}catch(e){return def;}};
H.set=(k,v)=>{try{localStorage.setItem('h-'+k,JSON.stringify(v));}catch(e){}};
/* daily checklist: H.mark('water') from any tool ticks today's item */
H.mark=(item,val)=>{const all=H.get('daily',{}),k=H.dayKey();all[k]=all[k]||{};all[k][item]=val===undefined?true:val;
  const ks=Object.keys(all).sort();while(ks.length>60)delete all[ks.shift()];H.set('daily',all);};
H.day=(k)=>(H.get('daily',{})[k||H.dayKey()]||{});

/* sound */
let AC=null;
H.ac=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC;};
H.muted=()=>{const m=document.getElementById('oSnd');return m&&!m.checked;};
H.tone=(f1,f2,dur,type,vol)=>{if(H.muted())return;const a=H.ac();if(!a)return;
  const t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type||'sine';
  o.frequency.setValueAtTime(f1,t);if(f2&&f2!==f1)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.16,t+Math.min(0.06,dur/4));
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+0.05);};
H.bell=(f,vol)=>{H.tone(f,f,1.5,'triangle',vol||0.15);H.tone(f*2.01,f*2.01,0.9,'sine',(vol||0.15)*0.35);};
/* singing bowl: inharmonic partials, long decay */
H.bowl=(base,vol,len)=>{if(H.muted())return;const a=H.ac();if(!a)return;base=base||196;vol=vol||0.22;len=len||9;
  const t=a.currentTime;[[1,1],[2.76,.45],[5.40,.22],[8.93,.1]].forEach(([r,v],i)=>{
    const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=base*r;
    const o2=a.createOscillator();o2.type='sine';o2.frequency.value=base*r*1.003;   /* slow beating */
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol*v,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+len/(1+i*.6));
    o.connect(g);o2.connect(g);g.connect(a.destination);o.start(t);o2.start(t);o.stop(t+len);o2.stop(t+len);});};
H.chime=()=>[523.3,659.3,784].forEach((f,i)=>setTimeout(()=>H.bell(f,0.14),i*260));
H.alarm=()=>[0,350,700].forEach(d=>setTimeout(()=>H.bell(880,0.16),d));
H.vib=p=>{const v=document.getElementById('oVib');if((!v||v.checked)&&navigator.vibrate)try{navigator.vibrate(p||200);}catch(e){}};

/* notifications (work while the tab is in the background) */
H.askNotify=()=>{try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();}catch(e){}};
H.notify=(title,body)=>{try{if('Notification' in window&&Notification.permission==='granted'&&document.hidden)new Notification(title,{body,icon:''});}catch(e){}};
/* keep the screen on during a session */
let wl=null;
H.wake=on=>{try{if(on&&navigator.wakeLock&&!wl)navigator.wakeLock.request('screen').then(w=>wl=w).catch(()=>{});
  if(!on&&wl){wl.release();wl=null;}}catch(e){}};

/* sound/vibration options remembered */
H.opts=()=>['oSnd','oVib','oNot'].forEach(id=>{const el=document.getElementById(id);if(!el)return;
  const v=H.get('opt-'+id,null);if(v!==null)el.checked=v;
  el.addEventListener('change',()=>{H.set('opt-'+id,el.checked);if(id==='oNot'&&el.checked)H.askNotify();});});

/* simple ring progress: ring(svgCircle, fraction) */
H.ring=(el,f)=>{const C=2*Math.PI*+el.getAttribute('r');el.style.strokeDasharray=C;el.style.strokeDashoffset=C*(1-Math.max(0,Math.min(1,f)));};
window.H=H;
})();
