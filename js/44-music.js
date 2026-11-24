// ══════════════════════════════════════════════
// MÜZİK — medeniyete göre arka plan müziği
// applyMapCiv() (35-civilizations.js) her dönem değişiminde musPlay() çağırır.
// Kendi parçası olmayan dönemde Babil müziği çalmaya devam eder.
// 🔊 düğmesi (toggleSfx, 02-audio.js) müziği de açıp kapatır.
// Tarayıcılar ilk dokunuştan önce sesi engeller → müzik ilk dokunuşta başlar.
// ══════════════════════════════════════════════
const MUSIC_TRACKS = {
  babylon: 'music/babylon.mp3',
  persia: 'music/persia.mp3',
  alexander: 'music/alexander.mp3',
  parthia: 'music/parthia.mp3',
  sasanian: 'music/sasanian.mp3',
  early_islam: 'music/early_islam.mp3',
  mongol: 'music/mongol.mp3',
  ottoman: 'music/ottoman.mp3',
  // abbasid: parçası yok → Babil müziği çalar
};
const MUS_FALLBACK = 'babylon';
const MUS_FADE_MS  = 800;

const MUS = {audio:null, src:null, want:null, volume:0.35, unlocked:false};

function musTrack(civKey){ return MUSIC_TRACKS[civKey] || MUSIC_TRACKS[MUS_FALLBACK]; }

function musFade(a, target, cb){   // her parçanın kendi geçişi: yeni parça belirirken eskisi sönmeye devam eder
  cancelAnimationFrame(a._raf);
  const from = a.volume, t0 = performance.now();
  const step = now=>{
    const p = Math.min(1, (now-t0)/MUS_FADE_MS);
    a.volume = from + (target-from)*p;
    if(p<1) a._raf = requestAnimationFrame(step);
    else cb && cb();
  };
  a._raf = requestAnimationFrame(step);
}

// İstenen parçayı çal (aynısı çalıyorsa dokunma); ses kapalıysa veya henüz dokunulmadıysa sadece hatırla
function musPlay(civKey){
  MUS.want = musTrack(civKey);
  musSync();
}
function musSync(){
  const src = (typeof _sfxOn==='undefined' || _sfxOn) && MUS.unlocked ? MUS.want : null;
  if(src===MUS.src && (!MUS.audio || !MUS.audio.paused)) return;
  const old = MUS.audio;
  MUS.src = src; MUS.audio = null;
  const start = ()=>{
    if(!src || MUS.src!==src) return;
    const a = new Audio(src);
    a.loop = true; a.volume = 0;
    MUS.audio = a;
    a.play().then(()=>musFade(a, MUS.volume)).catch(()=>{ MUS.src = null; MUS.audio = null; });
  };
  if(old) musFade(old, 0, ()=>{ old.pause(); start(); });
  else start();
}

function musSetVolume(v){
  MUS.volume = Math.max(0, Math.min(1, v));
  if(MUS.audio) MUS.audio.volume = MUS.volume;
}

// İlk dokunuş/tuş: tarayıcının ses kilidini aç
function musUnlock(){
  if(MUS.unlocked) return;
  MUS.unlocked = true;
  ['pointerdown','keydown','touchend'].forEach(e=>removeEventListener(e, musUnlock, true));
  if(!MUS.want) MUS.want = musTrack(CIVILIZATIONS[G.mapCiv||0]?.key);
  musSync();
}
['pointerdown','keydown','touchend'].forEach(e=>addEventListener(e, musUnlock, true));

// Sekme arka plana geçince müziği duraklat, geri gelince devam et
document.addEventListener('visibilitychange', ()=>{
  if(!MUS.audio) return;
  if(document.hidden) MUS.audio.pause();
  else MUS.audio.play().catch(()=>{});
});
