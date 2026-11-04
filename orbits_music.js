/* orbits_music.js — calm, mystic background music for the „ორბიტები“ tab.
   Generated live with the Web Audio API (no audio files): a low drone, a slowly changing
   pad in D Dorian, soft chimes from the D minor pentatonic, and a faint wind, all through
   a long reverb. Buttons: ♫ in the orbits toolbar and in the full-screen bar, plus volume.
   Pauses when you leave the tab or hide the page. Load after orbits.js.               */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const hz=m=>440*Math.pow(2,(m-69)/12);                 /* MIDI note → Hz */
/* D Dorian pad: Dm9 · Bbmaj7 · Fmaj9 · C6/9 · Gm9 · Dm(add9) */
const CHORDS=[[50,57,62,65,69,76],[46,53,57,62,65,69],[41,53,57,60,64,67],[48,55,60,62,64,69],[43,50,55,58,62,69],[50,57,62,64,65,72]];
const PENTA=[74,77,79,81,84,86,89,91,93];              /* D minor pentatonic, high */
let C=null,M=null,wet=null,timers=[],on=false,vol=0.55,step=0,droneNodes=[];

function impulse(sec,decay){const n=C.sampleRate*sec,b=C.createBuffer(2,n,C.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay);}return b;}
function build(){
  C=new (window.AudioContext||window.webkitAudioContext)();
  M=C.createGain();M.gain.value=0;
  const comp=C.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=3;
  M.connect(comp);comp.connect(C.destination);
  const rv=C.createConvolver();rv.buffer=impulse(6,2.6);
  wet=C.createGain();wet.gain.value=0.9;wet.connect(rv);rv.connect(M);
  /* drone: D2 + A2, slightly detuned, breathing low-pass */
  const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;lp.Q.value=4;
  const dg=C.createGain();dg.gain.value=0.11;lp.connect(dg);dg.connect(M);dg.connect(wet);
  const lfo=C.createOscillator(),lg=C.createGain();lfo.frequency.value=0.045;lg.gain.value=230;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
  droneNodes=[lfo];
  for(const [m,d,t] of [[38,-4,'sawtooth'],[38,5,'triangle'],[45,-3,'triangle'],[50,2,'sine']]){const o=C.createOscillator();o.type=t;o.frequency.value=hz(m);o.detune.value=d;o.connect(lp);o.start();droneNodes.push(o);}
  /* wind: filtered noise with a slowly sweeping band */
  const nb=C.createBuffer(1,C.sampleRate*4,C.sampleRate),nd=nb.getChannelData(0);let last=0;
  for(let i=0;i<nd.length;i++){last=(last+0.02*(Math.random()*2-1))/1.02;nd[i]=last*3.5;}
  const ns=C.createBufferSource();ns.buffer=nb;ns.loop=true;
  const bp=C.createBiquadFilter();bp.type='bandpass';bp.frequency.value=700;bp.Q.value=0.7;
  const wg=C.createGain();wg.gain.value=0.05;ns.connect(bp);bp.connect(wg);wg.connect(wet);
  const l2=C.createOscillator(),l2g=C.createGain();l2.frequency.value=0.03;l2g.gain.value=450;l2.connect(l2g);l2g.connect(bp.frequency);l2.start();ns.start();
  droneNodes.push(ns,l2);
}
/* one pad chord: soft detuned sines/triangles, 5 s swell, long release */
function pad(){if(!on)return;const t=C.currentTime,ch=CHORDS[step++%CHORDS.length],len=15;
  for(const m of ch){for(const [type,det,amp] of [['sine',-6,0.030],['triangle',7,0.016]]){
    const o=C.createOscillator(),g=C.createGain(),f=C.createBiquadFilter();o.type=type;o.frequency.value=hz(m);o.detune.value=det;
    f.type='lowpass';f.frequency.value=1500;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp,t+5);g.gain.setValueAtTime(amp,t+len-1);g.gain.linearRampToValueAtTime(0,t+len+6);
    o.connect(f);f.connect(g);g.connect(M);g.connect(wet);o.start(t);o.stop(t+len+6.5);}}
  timers.push(setTimeout(pad,len*1000));}
/* a chime: bell-like partials, quick strike, long decay, mostly reverb */
function chime(){if(!on)return;const t=C.currentTime,m=PENTA[Math.floor(Math.random()*PENTA.length)],a=0.05+Math.random()*0.04;
  const pan=C.createStereoPanner?C.createStereoPanner():null;if(pan)pan.pan.value=Math.random()*1.4-0.7;
  for(const [r,k,dec] of [[1,1,5],[2.76,0.35,2.4],[5.4,0.12,1.2]]){const o=C.createOscillator(),g=C.createGain();o.type='sine';o.frequency.value=hz(m)*r;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(a*k,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dec);
    o.connect(g);if(pan){g.connect(pan);}else{g.connect(M);g.connect(wet);}o.start(t);o.stop(t+dec+0.1);}
  if(pan){const dry=C.createGain();dry.gain.value=0.35;pan.connect(dry);dry.connect(M);pan.connect(wet);}
  timers.push(setTimeout(chime,2200+Math.random()*5200));}

function start(){if(!C)build();if(C.state==='suspended')C.resume();if(on)return;on=true;
  M.gain.cancelScheduledValues(C.currentTime);M.gain.setValueAtTime(M.gain.value,C.currentTime);M.gain.linearRampToValueAtTime(vol,C.currentTime+3);
  pad();timers.push(setTimeout(chime,1800));sync();}
function stop(){if(!on)return;on=false;timers.forEach(clearTimeout);timers=[];
  if(C){M.gain.cancelScheduledValues(C.currentTime);M.gain.setValueAtTime(M.gain.value,C.currentTime);M.gain.linearRampToValueAtTime(0,C.currentTime+1.5);
    setTimeout(()=>{if(!on&&C)C.suspend();},1700);}
  sync();}
const toggle=()=>on?stop():start();
function setVol(v){vol=v;if(C&&on){M.gain.cancelScheduledValues(C.currentTime);M.gain.setTargetAtTime(vol,C.currentTime,0.2);}
  document.querySelectorAll('.obm-vol').forEach(r=>{if(+r.value!==v)r.value=v;});}
function sync(){document.querySelectorAll('.obm-btn').forEach(b=>{b.classList.toggle('on',on);b.textContent=on?'♫ მუსიკა: ჩართ.':'♫ მუსიკა';});}

function inject(){
  const sec=$('form-orbits'),bar=sec&&sec.querySelector('.ob-bar'),fs=$('ob-fsbar');if(!bar||!fs)return false;if(sec.querySelector('.obm-btn'))return true;
  const st=document.createElement('style');st.textContent=`.obm-vol{width:90px;accent-color:#C9A24C;vertical-align:middle}
#ob-fsbar .obm-vol{width:80px;align-self:center}`;document.head.appendChild(st);
  const mk=(cls)=>{const b=document.createElement('button');b.type='button';b.className=cls+' obm-btn';b.title='მშვიდი, მისტიკური მუსიკა';b.textContent='♫ მუსიკა';b.onclick=e=>{e.stopPropagation();toggle();};return b;};
  const rng=()=>{const r=document.createElement('input');r.type='range';r.min=0;r.max=1;r.step=0.01;r.value=vol;r.className='obm-vol';r.title='ხმა';r.oninput=e=>{e.stopPropagation();setVol(+r.value);};r.onclick=e=>e.stopPropagation();return r;};
  bar.appendChild(mk('ob-btn'));bar.appendChild(rng());fs.appendChild(mk(''));fs.appendChild(rng());
  return true;
}
function watch(){const sec=$('form-orbits');if(on&&sec&&!sec.classList.contains('active'))stop();}
function boot(){if(!inject()){let n=0;const t=setInterval(()=>{if(inject()||++n>80)clearInterval(t);},250);}
  setInterval(watch,800);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&on)stop();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window._obMusic={start,stop,toggle,setVol,get on(){return on;}};
})();
