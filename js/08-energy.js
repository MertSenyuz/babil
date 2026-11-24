// ══════════════════════════════════════════════
// ENERJİ
// ══════════════════════════════════════════════
let energyTimerInterval;
const ENERGY_REGEN_MS = 3*60*1000;   // 3 dakikada +1

// Geçen sürede biriken enerjiyi ekler. Sayaç "şimdi"ye değil kazanılan dilimler kadar ilerler:
// sıradaki enerjiye doğru biriken süre kaybolmaz; telefon uykudan uyanınca kaçırılan tüm enerjiler gelir.
function regenEnergy(){
  if(G.energy>=G.maxEnergy) return 0;
  const gained=Math.floor((Date.now()-G.lastEnergyTime)/ENERGY_REGEN_MS);
  if(gained<=0) return 0;
  const before=G.energy;
  G.energy=Math.min(G.maxEnergy,G.energy+gained);
  G.lastEnergyTime = G.energy>=G.maxEnergy ? Date.now() : G.lastEnergyTime+gained*ENERGY_REGEN_MS;
  return G.energy-before;
}

// Enerji harcama: doluyken harcanırsa geri sayım o an başlar; zaten doluyorsa süren geri sayım bozulmaz
function spendEnergy(n=1){
  if(G.energy>=G.maxEnergy) G.lastEnergyTime=Date.now();
  G.energy-=n;
}

function startEnergyTimer(){
  clearInterval(energyTimerInterval);
  energyTimerInterval=setInterval(()=>{
    if(G.energy>=G.maxEnergy){ updateEnergyUI(); return; }
    if(regenEnergy()>0){
      saveGame(); updateEnergyUI();
      nfEnergyCheck();   // enerji maksimuma ulaştıysa bildir
    }
    updateEnergyModal();
  },1000);
}

function getEnergyTimerStr(){
  if(G.energy>=G.maxEnergy) return "DOLU ✦";
  const remaining=Math.max(0,ENERGY_REGEN_MS-(Date.now()-G.lastEnergyTime));
  const m=Math.floor(remaining/60000),s=Math.floor((remaining%60000)/1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateEnergyUI(){
  const pct=(G.energy/G.maxEnergy)*100;
  document.querySelectorAll('.energy-fill').forEach(el=>el.style.width=pct+'%');
  document.querySelectorAll('#energyTxt,#energyTxt2').forEach(el=>el.textContent=`${G.energy}/${G.maxEnergy}`);
  const eb3=document.getElementById('energyBar3');
  if(eb3) eb3.style.width=pct+'%';
  const mev=document.getElementById('mapEnergyVal');
  if(mev) mev.textContent=G.energy;
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
