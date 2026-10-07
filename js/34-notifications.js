// ══════════════════════════════════════════════
// BİLDİRİM SİSTEMİ — Web Notification API (Service Worker yok)
// Sayfa açıkken çalışır. Sekme görünürken uygulama içi kart, arka plandayken sistem bildirimi.
// Desteklenmeyen ortamlarda (API yok, HTTPS yok, Android Chrome) sessizce atlanır.
// ══════════════════════════════════════════════
const NF_GRANTED_KEY  = 'babil_notif_granted';
const NF_SETTINGS_KEY = 'babil_notif_settings';
const NF_ASKED_KEY    = 'babil_notif_asked_at';   // "Şimdi Değil" / red zamanı → 3 gün sonra tekrar sor
const NF_STATE_KEY    = 'babil_notif_state';      // son bildirim zamanları
const NF_RETRY_MS     = 3*24*60*60*1000;
const NF_ENERGY_GAP   = 60*60*1000;
const NF_TICK_MS      = 30*1000;
const NF_TITLE        = 'Babil Şehri ✦';
const NF_TYPES = {
  energy: {icon:'⚡', setting:'energy'},
  daily:  {icon:'🎁', setting:'daily'},
  record: {icon:'🏆', setting:'game'},
  build:  {icon:'🌳', setting:'game'},
  gold:   {icon:'💰', setting:'game'},
  test:   {icon:'🔔', setting:null},
};
let _nfAskedThisSession = false;
let _nfEnergyWasLow = false;
let _nfTickTimer = null;

function nfLsGet(k, def){ try{ const v=localStorage.getItem(k); return v==null ? def : JSON.parse(v); }catch(e){ return def; } }
function nfLsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function nfSupported(){ try{ return typeof Notification !== 'undefined'; }catch(e){ return false; } }
function nfPermission(){ try{ return nfSupported() ? Notification.permission : 'unsupported'; }catch(e){ return 'unsupported'; } }
function nfSettings(){ return Object.assign({energy:true, daily:true, game:true}, nfLsGet(NF_SETTINGS_KEY, {})); }
function nfEnabled(type){ const s=NF_TYPES[type]?.setting; return !s || nfSettings()[s] !== false; }
function nfToday(){ return typeof dailyToday==='function' ? dailyToday() : new Date().toDateString(); }

// Emoji → bildirim ikonu (PNG data URL), bir kez çizilip önbelleğe alınır
const _nfIconCache = {};
function nfIcon(emoji, size=128){
  const key = emoji + size;
  if(_nfIconCache[key]) return _nfIconCache[key];
  try{
    const c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'), r = size/2;
    const g = x.createRadialGradient(r, r*.8, r*.1, r, r, r);
    g.addColorStop(0, '#3a2270'); g.addColorStop(1, '#140a2a');
    x.fillStyle = g; x.beginPath(); x.arc(r, r, r-2, 0, Math.PI*2); x.fill();
    x.lineWidth = size*.05; x.strokeStyle = '#f5c842'; x.stroke();
    x.font = `${Math.round(size*.56)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(emoji, r, r*1.06);
    return (_nfIconCache[key] = c.toDataURL('image/png'));
  }catch(e){ return undefined; }
}

// Sistem bildirimi göster; başarılıysa true
function nfShowSystem(type, body){
  if(nfPermission() !== 'granted') return false;
  try{
    const n = new Notification(tx(NF_TITLE), {
      body: tx(body),
      icon:  nfIcon(NF_TYPES[type]?.icon || '🔔'),
      badge: nfIcon('🏛', 96),
      tag:   'babil-' + type,
    });
    n.onclick = ()=>{ try{ window.focus(); }catch(e){} n.close(); };
    return true;
  }catch(e){ return false; }   // ör. Android Chrome: SW olmadan "Illegal constructor"
}

// Bildirim gönder: sekme görünürse uygulama içi kart (inApp verilmişse), değilse sistem bildirimi
function nfSend(type, body, inApp, toastType='success'){
  if(!nfEnabled(type)) return;
  if(document.visibilityState === 'visible'){ if(inApp) showToast(inApp, toastType); return; }
  if(!nfShowSystem(type, body) && inApp) showToast(inApp, toastType);
}

// ── Tetikleyiciler ──
function nfEnergyCheck(){
  if(!CURRENT_USER) return;
  if(G.energy < G.maxEnergy){ _nfEnergyWasLow = true; return; }
  if(!_nfEnergyWasLow) return;          // zaten doluydu → yeni bir dolma yok
  _nfEnergyWasLow = false;
  const st = nfLsGet(NF_STATE_KEY, {});
  if(Date.now() - (st.energyAt||0) < NF_ENERGY_GAP) return;
  st.energyAt = Date.now(); nfLsSet(NF_STATE_KEY, st);
  nfSend('energy', '⚡ Enerjin doldu! Hadi oyna ve şehri büyüt!', '⚡ Enerjin doldu! Hadi oyna!');
}

function nfDailyCheck(){
  if(!CURRENT_USER || typeof dailyPending !== 'function' || !dailyPending()) return;
  const st = nfLsGet(NF_STATE_KEY, {}), today = nfToday();
  if(st.dailyDate === today) return;    // bugün zaten haber verildi
  st.dailyDate = today; nfLsSet(NF_STATE_KEY, st);
  if(!nfEnabled('daily')) return;
  if(document.visibilityState === 'visible'){
    if(G.gameActive) showToast('🎁 Günlük ödülün hazır!', 'success');
    else dailyCheck();                  // gece yarısı geçtiyse ödül penceresini aç
    return;
  }
  nfShowSystem('daily', '🎁 Günlük ödülün hazır! Bugün ne kazanacaksın?');
}

function nfGoldOfferCheck(){
  // Günde 1 kez, oyuncu başka sekmedeyken hatırlat
  if(!CURRENT_USER || document.visibilityState === 'visible' || !nfEnabled('gold')) return;
  const st = nfLsGet(NF_STATE_KEY, {}), today = nfToday();
  if(st.goldDate === today) return;
  if(nfShowSystem('gold', '💰 50 altın kazanmak için oyna!')){ st.goldDate = today; nfLsSet(NF_STATE_KEY, st); }
}

function nfCheckRecord(bIdx, lvlIdx, score){
  if(!CURRENT_USER || !(score > 0)) return;
  const best = CURRENT_USER.bestScores = CURRENT_USER.bestScores || {};
  const key = bIdx + '-' + lvlIdx, prev = best[key] || 0;
  if(score <= prev) return;
  best[key] = score;                    // saveGame() → saveUserData ile kaydedilir
  if(prev > 0){                         // ilk oynayış rekor sayılmaz
    setTimeout(()=>showToast(`⭐ Yeni rekor! ${score} puan`, 'success'), 700);
    nfSend('record', `🏆 Yeni rekor! ${score} puanla tarihe geçtin!`);
  }
}

function nfFirstCombo(){
  const u = CURRENT_USER;
  if(u ? u.firstComboDone : nfLsGet('babil_first_combo', false)) return;
  if(u){ u.firstComboDone = true; saveUserData(u); } else nfLsSet('babil_first_combo', true);
  showToast('🔥 İlk Kombonuz!', 'success');
}

// İleride: inşaat süresi olan yapılar tamamlanınca çağrılacak
function nfBuildDone(name){
  nfSend('build', `🌳 İnşaat tamamlandı: ${name}!`, `🌳 ${name} tamamlandı!`);
}

function nfTick(){
  nfEnergyCheck();
  nfDailyCheck();
  nfGoldOfferCheck();
}
function nfStartScheduler(){
  clearInterval(_nfTickTimer);
  _nfEnergyWasLow = G.energy < G.maxEnergy;
  _nfTickTimer = setInterval(nfTick, NF_TICK_MS);
}

// ── İzin akışı (tutorial bittikten sonra özel modal) ──
function nfModalBusy(){
  const open = id=>document.getElementById(id)?.classList.contains('open');
  return G.gameActive || (typeof TS!=='undefined' && TS.active) || open('dailyModal') || open('tutWelcome')
      || !!document.querySelector('.lm-ov.open') || !['menuScreen','mapScreen'].includes(document.querySelector('.screen.active')?.id);
}
function nfMaybeAsk(){
  if(_nfAskedThisSession || !CURRENT_USER || !nfSupported()) return;
  if(!tutGet(TUT_KEY_WELCOME) || !tutGet(TUT_KEY_SPOT)) return;
  const perm = nfPermission();
  if(perm === 'granted'){ nfLsSet(NF_GRANTED_KEY, true); return; }
  if(perm === 'denied') return;         // tarayıcı engelledi → tekrar soramayız
  const last = nfLsGet(NF_ASKED_KEY, 0);
  if(last && Date.now() - last < NF_RETRY_MS) return;
  if(nfModalBusy()){ setTimeout(nfMaybeAsk, 4000); return; }
  _nfAskedThisSession = true;
  document.getElementById('nfAsk').classList.add('open');
}
function nfCloseAsk(){ document.getElementById('nfAsk').classList.remove('open'); }
function nfAskLater(){
  nfLsSet(NF_ASKED_KEY, Date.now());
  nfCloseAsk();
}
function nfRequest(){
  return new Promise(resolve=>{
    if(!nfSupported()){ resolve('unsupported'); return; }
    try{
      const p = Notification.requestPermission(resolve);   // eski Safari: callback
      if(p && p.then) p.then(resolve, ()=>resolve(nfPermission()));
    }catch(e){ resolve(nfPermission()); }
  }).then(perm=>{
    if(perm === 'granted'){ nfLsSet(NF_GRANTED_KEY, true); try{ localStorage.removeItem(NF_ASKED_KEY); }catch(e){} }
    else { try{ localStorage.removeItem(NF_GRANTED_KEY); }catch(e){} nfLsSet(NF_ASKED_KEY, Date.now()); }
    nfRenderSettings();
    return perm;
  });
}
function nfAskAllow(){
  nfCloseAsk();
  nfRequest().then(perm=>{
    if(perm === 'granted') showToast('🔔 Bildirimler açıldı!', 'success');
  });
}

// ── Profil → Bildirimler ayarları ──
function nfRenderSettings(){
  const s = nfSettings();
  document.querySelectorAll('.nf-switch').forEach(el=>{ el.checked = s[el.dataset.nf] !== false; });
  const st = document.getElementById('nfStatus');
  if(!st) return;
  const perm = nfPermission();
  st.classList.toggle('ok', perm === 'granted');
  st.innerHTML =
      perm === 'granted' ? '✓ Sistem bildirimlerine izin verildi'
    : perm === 'denied'  ? '🔕 Tarayıcı ayarlarından engellenmiş — oyun içi bildirimler açık'
    : perm === 'default' ? '<span>Sistem bildirimleri kapalı</span><button class="lm-btn lm-btn-gold" onclick="nfRequest()">İzin Ver</button>'
    : 'Bu tarayıcı sistem bildirimlerini desteklemiyor — oyun içi bildirimler açık';
}
function nfToggle(el){
  const s = nfSettings();
  s[el.dataset.nf] = el.checked;
  nfLsSet(NF_SETTINGS_KEY, s);
  showToast(el.checked ? '🔔 Bildirim açıldı' : '🔕 Bildirim kapatıldı', 'info');
}
function nfTest(){
  const run = ()=>{
    if(nfShowSystem('test', '🔔 Test bildirimi — her şey yolunda!')) showToast('✓ Test bildirimi gönderildi', 'success');
    else showToast('🔔 Test: oyun içi bildirimler çalışıyor', 'info');
  };
  if(nfPermission() === 'default') nfRequest().then(run); else run();
}

// ── Mevcut akışlara bağlan ──
const _nfOrigEnterGame = enterGame;
enterGame = function(){
  const res = _nfOrigEnterGame.apply(this, arguments);
  nfStartScheduler();
  setTimeout(nfMaybeAsk, 2500);
  return res;
};
const _nfOrigAfterResult = afterResult;
afterResult = function(){
  const res = _nfOrigAfterResult.apply(this, arguments);
  setTimeout(nfMaybeAsk, 1200);        // ilk bölümden (tutorial) sonra haritaya dönünce
  return res;
};
const _nfOrigShowProfile = showProfileScreen;
showProfileScreen = function(){
  const res = _nfOrigShowProfile.apply(this, arguments);
  nfRenderSettings();
  return res;
};
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState === 'hidden') nfGoldOfferCheck(); });
// initAuth() otomatik giriş yaptıysa enterGame sarmalanmadan önce çalışmıştır
if(CURRENT_USER){ nfStartScheduler(); setTimeout(nfMaybeAsk, 2500); }
