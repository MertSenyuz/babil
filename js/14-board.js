// ══════════════════════════════════════════════
// OYUN BOARD
// ══════════════════════════════════════════════
const BS=7;

function startLevel(){
  if(G.energy<1){ showToast('⚡ Enerjin bitti! Bekle veya doldur','warning'); showEnergyModal(); return; }
  G.energy--; G.lastEnergyTime=Date.now();
  if(CURRENT_USER){ CURRENT_USER.stats.energyUsed=(CURRENT_USER.stats.energyUsed||0)+1; }
  saveGame(); updateEnergyUI();
  SFX.energy();

  const b=BUILDINGS[selectedBuilding]; const lvl=b.levels[selectedLevel];
  G.civ=CIVILIZATIONS[b.civ||0]; G.gemSet=G.civ.gemSet; G.hieroCharge=0; G._killSet=null;
  G.score=0; G.moves=lvl.moves; G.selected=null; G.gameActive=true;
  G._reshuffleCount=0;
  G.goals={...lvl.target}; G.goalProgress={};
  Object.keys(G.goals).forEach(k=>G.goalProgress[k]=0);

  document.getElementById('scoreVal').textContent='0';
  document.getElementById('movesVal').textContent=lvl.moves;
  document.getElementById('levelLabel').textContent=`${b.name} — Bölüm ${selectedLevel+1}`;
  document.getElementById('buildingLabel').textContent=b.desc;

  renderGoalBar(); generateBoard(); renderBoard();
  showScreen('gameScreen');
}

function generateBoard(){
  G.board=[];
  for(let r=0;r<BS;r++){ G.board[r]=[]; for(let c=0;c<BS;c++) G.board[r][c]=randomGem(); }
  let tries=0;
  while(hasAnyMatch()&&tries<50){ shuffleBoard(); tries++; }
  placeLevelObstacles();
  hdPlaceObstacles();
  // Medeniyetin özel taşından 2 tane ile başla
  const sp=G.civ && G.civ.special;
  for(let k=0, t=0; sp && k<2 && t<40; t++){
    const r=Math.floor(Math.random()*BS), c=Math.floor(Math.random()*BS), g=G.board[r][c];
    if(g && !isObstacle(g) && getGemPower(g)==='normal'){ G.board[r][c]=g+'_'+sp; k++; }
  }
  // Engeller çoksa yapılabilecek hamle kalmayabilir → baştan üret
  if(!hasAnyPossibleMove() && (G._genTries=(G._genTries||0)+1)<25) return generateBoard();
  G._genTries=0;
}

function randomGem(){ const set=G.gemSet||GEM_KEYS; return set[Math.floor(Math.random()*set.length)]; }
function shuffleBoard(){ for(let r=0;r<BS;r++) for(let c=0;c<BS;c++) if(!isObstacle(G.board[r][c])) G.board[r][c]=randomGem(); }

function renderGoalBar(){
  const bar=document.getElementById('goalBar');
  bar.innerHTML='';
  gfReset();
  Object.entries(G.goals).forEach(([k,target])=>{
    const prog=G.goalProgress[k]||0;
    const done=prog>=target;
    const shown=Math.min(prog,target);
    GF.shown[k]=shown;
    const item=document.createElement('div');
    item.className='goal-item'+(done?' done':'');
    item.id='goal_'+k;
    item.innerHTML=`${goalIconHTML(k)}<span class="gi-count"><span class="gi-num"><span>${shown}</span></span>/${target}</span><span class="gi-check">✓</span>`;
    bar.appendChild(item);
  });
}

function updateGoalBar(){
  Object.entries(G.goals).forEach(([k,target])=>{
    if(!document.getElementById('goal_'+k)) return;
    if(GF.pending[k]>0) return;          // uçan taşlar hedefe vardıkça güncellenecek
    gfShow(k, Math.min(G.goalProgress[k]||0,target));
  });
}

function isGoalComplete(){
  return Object.entries(G.goals).every(([k,target])=>(G.goalProgress[k]||0)>=target);
}
