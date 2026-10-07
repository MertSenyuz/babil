// ══════════════════════════════════════════════
// ENERJİ
// ══════════════════════════════════════════════
let energyTimerInterval;
function startEnergyTimer(){
  clearInterval(energyTimerInterval);
  energyTimerInterval=setInterval(()=>{
    if(G.energy>=G.maxEnergy){ updateEnergyUI(); return; }
    const elapsed=Date.now()-G.lastEnergyTime;
    if(elapsed>=3*60*1000){
      G.energy=Math.min(G.maxEnergy,G.energy+1);
      G.lastEnergyTime=Date.now();
      saveGame(); updateEnergyUI();
      nfEnergyCheck();   // enerji maksimuma ulaştıysa bildir
    }
    updateEnergyModal();
  },1000);
}

function getEnergyTimerStr(){
  if(G.energy>=G.maxEnergy) return "DOLU ✦";
  const remaining=Math.max(0,3*60*1000-(Date.now()-G.lastEnergyTime));
  const m=Math.floor(remaining/60000),s=Math.floor((remaining%60000)/1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateEnergyUI(){
  const pct=(G.energy/G.maxEnergy)*100;
  document.querySelectorAll('.energy-fill').forEach(el=>el.style.width=pct+'%');
  document.querySelectorAll('#energyTxt,#energyTxt2').forEach(el=>el.textContent=`${G.energy}/${G.maxEnergy}`);
  const eb3=document.getElementById('energyBar3');
  if(eb3) eb3.style.width=pct+'%';
}

function updateEnergyModal(){ const el=document.getElementById('energyTimer'); if(el) el.textContent=getEnergyTimerStr(); }
function showEnergyModal(){ updateEnergyModal(); document.getElementById('energyModal').classList.add('open'); }
function closeEnergyModal(){ document.getElementById('energyModal').classList.remove('open'); }

function watchAd(){
  showToast("📺 Reklam izleniyor...");
  setTimeout(()=>{
    G.energy=Math.min(G.maxEnergy,G.energy+3);
    G.lastEnergyTime=Date.now();
    saveGame(); updateEnergyUI(); closeEnergyModal();
    showToast("⚡ +3 Enerji kazandın!");
  },1500);
}

function buyEnergy(){
  if(G.coins<50){ showToast('🪙 Yeterli altın yok!','warning'); return; }
  G.coins-=50; G.energy=Math.min(G.maxEnergy,G.energy+5);
  G.lastEnergyTime=Date.now();
  saveGame(); updateEnergyUI(); updateCoinsUI(); closeEnergyModal();
  showToast("⚡ +5 Enerji! 🪙 -50 Altın");
}
