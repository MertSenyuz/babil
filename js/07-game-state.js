// ══════════════════════════════════════════════
// OYUN DURUMU
// ══════════════════════════════════════════════
let G = {
  energy:5,maxEnergy:5,lastEnergyTime:Date.now(),
  coins:100,totalStars:0,
  buildingProgress:[],
  currentBuilding:0,currentLevel:0,
  score:0,moves:0,
  board:[],boardSize:7,
  selected:null,goals:{},goalProgress:{},
  gameActive:false,
};

function saveGame(){
  syncGameToUser();
}

function loadGame(){
  // Auth sistemi loadGameFromUser() ile yükler, bu fonksiyon boş kalır
}

function getBuildingStars(i){ const bp=G.buildingProgress[i]; return bp?bp.stars.reduce((a,b)=>a+b,0):0; }
function getTotalStarsReal(){ let t=0; G.buildingProgress.forEach(bp=>{ t+=bp.stars.reduce((a,b)=>a+b,0); }); return t; }
