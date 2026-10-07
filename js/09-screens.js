// ══════════════════════════════════════════════
// EKRAN GEÇİŞLERİ
// ══════════════════════════════════════════════
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showCityScreen(){
  renderBuildings(); updateEnergyUI(); updateCoinsUI();
  updateTopbarProfile();
  G.totalStars=getTotalStarsReal();
  document.getElementById('totalStarsVal').textContent=G.totalStars;
  showScreen('cityScreen');
}

function showHowto(){ document.getElementById('howtoModal').classList.add('open'); }
function closeHowto(){ document.getElementById('howtoModal').classList.remove('open'); }
function updateCoinsUI(){ document.getElementById('coinsVal').textContent=G.coins; }
