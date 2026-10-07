// ══════════════════════════════════════════════
// SONUÇ
// ══════════════════════════════════════════════
function showResult(win){
  _lastResultWin=!!win;
  const b=BUILDINGS[selectedBuilding]; const lvl=b.levels[selectedLevel];
  const bp=G.buildingProgress[selectedBuilding];
  const prevStars=bp.stars[selectedLevel]||0;
  let stars=0;
  if(win){
    if(G.score>=lvl.stars[2]) stars=3;
    else if(G.score>=lvl.stars[1]) stars=2;
    else stars=1;
  }
  if(stars>(bp.stars[selectedLevel]||0)){
    bp.stars[selectedLevel]=stars;
    G.totalStars=getTotalStarsReal();
  }
  const goldEarned=win?(stars*25+G.moves*5):0;
  G.coins+=goldEarned;
  // 5. (ustaca) bölüm ilk kez bitince özel ödül — "Çağ Ustası" rozeti checkAchievements'ta verilir
  const masterBonus=(win && selectedLevel===b.levels.length-1 && prevStars===0) ? LEVEL5_BONUS : 0;
  G.coins+=masterBonus;

  // Kullanıcı istatistiklerini güncelle
  if(CURRENT_USER){
    CURRENT_USER.stats.gamesPlayed=(CURRENT_USER.stats.gamesPlayed||0)+1;
    if(win) CURRENT_USER.stats.wins=(CURRENT_USER.stats.wins||0)+1;
    else CURRENT_USER.stats.losses=(CURRENT_USER.stats.losses||0)+1;
    CURRENT_USER.stats.totalCoins=(CURRENT_USER.stats.totalCoins||0)+goldEarned;
    if(stars>=(CURRENT_USER.stats.maxStarsInGame||0)) CURRENT_USER.stats.maxStarsInGame=stars;
    checkAchievements();
  }

  // Bölüm rekoru → uygulama içi toast + (sekme arka plandaysa) sistem bildirimi
  nfCheckRecord(selectedBuilding, selectedLevel, G.score);

  saveGame();

  // ── SES ──
  setTimeout(()=>{ win ? SFX.win() : SFX.lose(); }, 200);

  const box=document.getElementById('resultBox');
  box.className='result-box '+(win?'win':'lose');
  document.getElementById('resIcon').textContent=win?'🏆':'💀';
  document.getElementById('resTitle').textContent=win?'ZAFER!':'YENİLDİN';
  document.getElementById('resDesc').textContent=masterBonus?`🎖️ Ustaca! Özel ödül: +${masterBonus} 🪙`:win?`${b.name} için yeni bir bölüm açıldı!`:'Bir dahaki sefere daha dikkatli ol!';
  document.getElementById('resStars').textContent=win?'⭐'.repeat(stars)+'☆'.repeat(3-stars):'☆☆☆';
  document.getElementById('resPuan').textContent=G.score;
  document.getElementById('resHamle').textContent=G.moves;
  document.getElementById('resAltin').textContent='+'+(goldEarned+masterBonus);
  document.getElementById('resBtn').textContent=win?'DEVAM ET ✦':'TEKRAR DENE';
  updateCoinsUI();
  showScreen('resultScreen');
}

// Sonuç ekranındaki ana buton — haritaya uğramadan:
//   ZAFER → sıradaki bölüm (yapının son bölümüyse aynı medeniyetteki sıradaki yapı)
//   YENİLGİ → aynı bölüm tekrar
// Medeniyet bittiyse harita açılır; showMapScreen "Medeniyet Tamamlandı" sahnesini oynatır.
let _lastResultWin=false;
function nextLevelTarget(){
  const b=BUILDINGS[selectedBuilding];
  if(selectedLevel+1 < b.levels.length) return {b:selectedBuilding, l:selectedLevel+1};
  const nb=selectedBuilding+1, n=BUILDINGS[nb];
  if(!n || (n.civ||0)!==(b.civ||0)) return null;               // medeniyetin son yapısı
  if(!isBuildingUnlocked(nb)) return {locked:nb};              // önceki bölümler eksik
  const bp=G.buildingProgress[nb];
  return {b:nb, l:Math.max(0, n.levels.findIndex((_,i)=>!(bp && bp.stars[i]>0)))};   // ilk oynanmamış bölüm
}
function afterResult(){
  if(!_lastResultWin){ startLevel(); return; }                 // TEKRAR DENE (enerji kontrolü startLevel'da)
  if(pendingCivReward()>=0){ showMapScreen(); return; }
  const nx=nextLevelTarget();
  if(!nx){ showMapScreen(); return; }
  if(nx.locked!=null){ showToast(buildingLockMsg(nx.locked),'warning'); showMapScreen(); return; }
  // Enerji yoksa seçimi değiştirme: modal kapanınca DEVAM ET yine aynı bölümü hedefler
  if(G.energy<1){ showToast('⚡ Enerjin bitti! Bekle veya doldur','warning'); showEnergyModal(); return; }
  selectedBuilding=nx.b; selectedLevel=nx.l;
  startLevel();
}
function exitGame(){ G.gameActive=false; showMapScreen(); }
