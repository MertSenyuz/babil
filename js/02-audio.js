// ══════════════════════════════════════════════
// SES SİSTEMİ — Web Audio API (dosya gerektirmez)
// ══════════════════════════════════════════════
let _audioCtx = null;

function getAudioCtx(){
  if(!_audioCtx){
    try{ _audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){}
  }
  if(_audioCtx && _audioCtx.state==='suspended') _audioCtx.resume();
  return _audioCtx;
}

// Temel ses üretici — sinüs dalgası, reverb ile
function playTone(freq, duration, volume=0.18, type='sine', delay=0){
  const ctx = getAudioCtx();
  if(!ctx) return;
  try{
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 2400;
    filter.Q.value = 1.2;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    // Hafif pitch düşüşü — kristal efekti
    osc.frequency.exponentialRampToValueAtTime(freq * 0.92, ctx.currentTime + delay + duration);

    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  }catch(e){}
}

// Taş seçme — hafif tık
function sfxSelect(){
  playTone(880, 0.08, 0.10, 'sine');
}

// Taş eşleşme — kristal ping, taş sayısına göre farklı nota
const MATCH_NOTES = [523, 587, 659, 698, 784, 880, 988]; // Do-Re-Mi-Fa-Sol-La-Si
function sfxMatch(count, chainIndex=0){
  const base = MATCH_NOTES[Math.min(chainIndex, MATCH_NOTES.length-1)];
  // Her taş için hafif artan nota
  for(let i=0; i<Math.min(count,6); i++){
    const freq = base * Math.pow(1.059, i); // yarım ton yukarı her taş
    playTone(freq, 0.22, 0.14, 'sine', i * 0.04);
  }
  // Hafif arka plan uyum sesi
  playTone(base * 0.5, 0.35, 0.06, 'triangle', 0);
}

// Kombo — daha parlak, yüksek
function sfxCombo(comboCount){
  const freqs = [523, 659, 784, 1047, 1319];
  const f = freqs[Math.min(comboCount-1, freqs.length-1)];
  playTone(f, 0.3, 0.18, 'sine');
  playTone(f * 1.5, 0.25, 0.10, 'sine', 0.06);
  playTone(f * 2, 0.2, 0.07, 'sine', 0.12);
}

// Bomba patlaması — düşük gümbürtü
function sfxBomb(){
  playTone(80,  0.25, 0.22, 'sawtooth');
  playTone(120, 0.20, 0.16, 'square', 0.03);
  playTone(60,  0.35, 0.18, 'sine', 0.01);
}

// Zincir patlaması — derin gümbürtü + arka arkaya dalgalar
function sfxChainBomb(){
  playTone(55,  0.45, 0.30, 'sawtooth');
  playTone(80,  0.35, 0.25, 'square',  0.04);
  playTone(100, 0.30, 0.22, 'sawtooth',0.08);
  playTone(160, 0.25, 0.18, 'sine',    0.14);
  playTone(40,  0.50, 0.35, 'sine',    0.02);
  setTimeout(()=>{ playTone(70,0.30,0.20,'sawtooth'); playTone(110,0.20,0.14,'square',0.05); }, 180);
  setTimeout(()=>{ playTone(55,0.25,0.18,'sawtooth'); playTone(90, 0.18,0.12,'sine',  0.04); }, 350);
}

// Süper bomba — epik
function sfxSuper(){
  playTone(110, 0.4, 0.20, 'sawtooth');
  playTone(220, 0.3, 0.15, 'square', 0.05);
  playTone(440, 0.25, 0.12, 'sine', 0.1);
  playTone(880, 0.2,  0.08, 'sine', 0.15);
}

// Hamle geçersiz — yumuşak hata
function sfxInvalid(){
  playTone(220, 0.15, 0.10, 'sine');
  playTone(196, 0.15, 0.10, 'sine', 0.08);
}

// Zafer — mutlu melodi
function sfxWin(){
  const melody = [523,659,784,1047,784,1047,1319];
  melody.forEach((f,i)=> playTone(f, 0.18, 0.15, 'sine', i*0.12));
}

// Yenilgi — hüzünlü iniş
function sfxLose(){
  const melody = [392,349,330,294];
  melody.forEach((f,i)=> playTone(f, 0.25, 0.13, 'sine', i*0.15));
}

// Enerji harcama — küçük uçuş sesi
function sfxEnergy(){
  playTone(660, 0.12, 0.10, 'sine');
  playTone(880, 0.10, 0.08, 'sine', 0.08);
}

// Kilit açılma — ödül sesi
function sfxUnlock(){
  [523,659,784,1047].forEach((f,i)=> playTone(f, 0.2, 0.14, 'sine', i*0.08));
}

// ── SES AÇMA/KAPATMA ──
let _sfxOn = true;
function toggleSfx(){
  _sfxOn = !_sfxOn;
  localStorage.setItem('babil_sfx', _sfxOn?'1':'0');
  showToast(_sfxOn ? '🔊 Ses açık' : '🔇 Ses kapalı');
  updateSfxBtn();
}
function loadSfxPref(){
  _sfxOn = localStorage.getItem('babil_sfx') !== '0';
}
function updateSfxBtn(){
  document.querySelectorAll('.sfx-toggle-btn').forEach(b=>{ b.textContent = _sfxOn?'🔊':'🔇'; });
}

// Sarmalayıcı — ses kapalıysa çalma
const SFX = {
  select:  ()=>_sfxOn&&sfxSelect(),
  match:   (n,c)=>_sfxOn&&sfxMatch(n,c),
  combo:   (n)=>_sfxOn&&sfxCombo(n),
  bomb:    ()=>_sfxOn&&sfxBomb(),
  chainBomb:()=>_sfxOn&&sfxChainBomb(),
  super:   ()=>_sfxOn&&sfxSuper(),
  invalid: ()=>_sfxOn&&sfxInvalid(),
  win:     ()=>_sfxOn&&sfxWin(),
  lose:    ()=>_sfxOn&&sfxLose(),
  energy:  ()=>_sfxOn&&sfxEnergy(),
  unlock:  ()=>_sfxOn&&sfxUnlock(),
};
const GEMS = {
  gem1:{symbol:"♦", color:"#ff1144", bg:"rgba(255,17,68,0.18)",  glow:"rgba(255,17,68,0.4)",  name:"Yakut"},
  gem2:{symbol:"★", color:"#00aaff", bg:"rgba(0,170,255,0.18)",  glow:"rgba(0,170,255,0.4)",  name:"Safir"},
  gem3:{symbol:"▲", color:"#00ee55", bg:"rgba(0,238,85,0.18)",   glow:"rgba(0,238,85,0.4)",   name:"Zümrüt"},
  gem4:{symbol:"✦", color:"#ffcc00", bg:"rgba(255,204,0,0.18)",  glow:"rgba(255,204,0,0.4)",  name:"Amber"},
  gem5:{symbol:"♥", color:"#cc00ff", bg:"rgba(204,0,255,0.18)",  glow:"rgba(204,0,255,0.4)",  name:"Ametist"},
  gem6:{symbol:"⬡", color:"#ff7700", bg:"rgba(255,119,0,0.18)", glow:"rgba(255,119,0,0.4)",  name:"Kehribar"},
};
const GEM_KEYS = Object.keys(GEMS);

// ── Yeni medeniyetlerin taşları (GEM_KEYS ilk 6 taşla sınırlı kalır; her medeniyet kendi 6'lı setini kullanır) ──
Object.assign(GEMS, {
  gem7:{symbol:"■", color:"#ffd23a", bg:"rgba(255,210,58,0.18)", glow:"rgba(255,210,58,0.4)", name:"Güneş Altını"},
  gem8:{symbol:"▼", color:"#e2c38a", bg:"rgba(226,195,138,0.18)", glow:"rgba(226,195,138,0.4)", name:"Çöl Kumu"},
  gem9:{symbol:"●", color:"#3a6ae0", bg:"rgba(58,106,224,0.18)", glow:"rgba(58,106,224,0.4)", name:"Lapis"},
  gem10:{symbol:"✚", color:"#efeadc", bg:"rgba(239,234,220,0.18)", glow:"rgba(239,234,220,0.4)", name:"Fildişi"},
  gem11:{symbol:"♠", color:"#c8142e", bg:"rgba(200,20,46,0.18)", glow:"rgba(200,20,46,0.4)", name:"Kızıl Kan"},
  gem12:{symbol:"⬢", color:"#cd7f32", bg:"rgba(205,127,50,0.18)", glow:"rgba(205,127,50,0.4)", name:"Tunç"},
  gem13:{symbol:"♣", color:"#3fbf7f", bg:"rgba(63,191,127,0.18)", glow:"rgba(63,191,127,0.4)", name:"Yeşim"},
  gem14:{symbol:"✿", color:"#ff5a3a", bg:"rgba(255,90,58,0.18)", glow:"rgba(255,90,58,0.4)", name:"Zincifre"},
  gem15:{symbol:"❖", color:"#6a9ae8", bg:"rgba(106,154,232,0.18)", glow:"rgba(106,154,232,0.4)", name:"Porselen"},
});

function getGemBase(g){ return (g && g.charCodeAt(0)!==35) ? g.split('_')[0] : null; }   // '#…' = engel taşı
function getGemPower(g){ const p=g?g.split('_')[1]:null; return p||'normal'; }
