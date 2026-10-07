// ══════════════════════════════════════════════
// ZORLUK: BÖLÜM MEKANİKLERİ (bomba yağmuru · karışan tahta · yükselen su · karanlık) + kısıtlar
// Hamle sonrası olaylar, zincirleme eşleşmeler bitip tahta durulunca (checkEndConditions) işlenir.
// ══════════════════════════════════════════════
function hdOnGame(){ return !!document.getElementById('gameScreen')?.classList.contains('active'); }
function hdIdle(){ return hdOnGame() && G.gameActive && !SW.busy && !SW.on && !BOOST.busy && !HD.cascading && !HD.shuffling; }
function hdStopBombs(){ HD.bombs.forEach(b=>clearInterval(b.t)); HD.bombs=[]; }

// Tahta çizildikten sonra: su, karanlık, bomba uyarısı (hücreleri yeniden kurmadan sınıf ekler)
function hdDecorate(){
  const L=HD.light, dark=!!HD.cfg.darkness;
  document.querySelectorAll('#board .cell').forEach(el=>{
    const r=+el.dataset.r, c=+el.dataset.c;
    const wet=hdFrozen(r,c);
    el.classList.toggle('hd-water', wet);
    el.classList.toggle('hd-water-top', wet && r===BS-HD.flood);
    let wl=el.querySelector('.hd-wl');
    if(wet && !wl){ wl=document.createElement('i'); wl.className='hd-wl'; el.appendChild(wl); }
    else if(!wet && wl) wl.remove();
    const d=dark ? Math.hypot(r-L.r, c-L.c) : 0;
    el.classList.toggle('hd-dark', dark && d>2.9);
    el.classList.toggle('hd-dim', dark && d>2.05 && d<=2.9);
    const b=HD.bombs.find(b=>b.r===r && b.c===c);
    el.classList.toggle('hd-bomb', !!b);
    let bw=el.querySelector('.hd-bw');
    if(b){ if(!bw){ bw=document.createElement('i'); bw.className='hd-bw'; el.appendChild(bw); } bw.textContent=b.n>0?b.n:'💥'; }
    else if(bw) bw.remove();
  });
}

function hdBanner(text){
  const bd=document.getElementById('board'); if(!bd) return;
  const rc=bd.getBoundingClientRect();
  const el=document.createElement('div');
  el.className='hd-banner'; el.textContent=text;
  el.style.left=(rc.left+rc.width/2)+'px'; el.style.top=(rc.top+rc.height/2)+'px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),1300);
}

function hdLose(msg){
  G.gameActive=false; hdStopBombs(); swLock(false);
  showToast(msg,'warning'); SFX.invalid();
  setTimeout(()=>showResult(false),500);
}

// ── Karanlık: ışık her hamlede 1-2 hücre kayar ──
function hdMoveLight(){
  const L=HD.light;
  for(let t=0;t<20;t++){
    const r=L.r+Math.floor(Math.random()*5)-2, c=L.c+Math.floor(Math.random()*5)-2;
    if(r>=1 && r<=BS-2 && c>=1 && c<=BS-2 && (r!==L.r || c!==L.c)){ HD.light={r,c}; return; }
  }
}

// ── Düşen bomba: 3 sn geri sayım; o hücredeki taş patlatılırsa etkisiz ──
function hdSpawnBomb(){
  const cand=[];
  for(let r=0;r<BS;r++) for(let c=0;c<BS;c++){
    const g=G.board[r][c];
    if(!g || isObstacle(g) || hdFrozen(r,c) || HD.bombs.some(b=>b.r===r&&b.c===c)) continue;
    if(HD.cfg.darkness && Math.hypot(r-HD.light.r,c-HD.light.c)>2.9) continue;   // karanlıkta da görülebilsin
    cand.push([r,c]);
  }
  if(!cand.length) return;
  const [r,c]=cand[Math.floor(Math.random()*cand.length)];
  const b={r,c,n:3,t:0};
  HD.bombs.push(b);
  hdDecorate(); SFX.tick(3);
  const el=getCellEl(r,c);
  if(el){ const rc=el.getBoundingClientRect(); showComboText('💣 BOMBA!', rc.left+rc.width/2, rc.top-6, '#ff4d4d'); }
  b.t=setInterval(()=>{
    if(!hdOnGame()){ hdStopBombs(); return; }
    b.n--;
    if(b.n>0){ SFX.tick(b.n); hdDecorate(); return; }
    clearInterval(b.t); hdDecorate(); hdBombDue(b);
  },1000);
}
function hdBombDue(b){
  if(!HD.bombs.includes(b) || !hdOnGame()) return;          // etkisiz kaldı / oyun bitti
  if(!hdIdle()){ setTimeout(()=>hdBombDue(b),120); return; } // eşleşmeler bitince patlar
  hdBombExplode(b);
}
function hdCheckDefuse(cells){
  if(!HD.bombs.length) return;
  HD.bombs=HD.bombs.filter(b=>{
    if(!cells.some(({r,c})=>r===b.r && c===b.c)) return true;
    clearInterval(b.t);
    const el=getCellEl(b.r,b.c);
    if(el){ const rc=el.getBoundingClientRect(); showComboText('✓ Bomba etkisiz!', rc.left+rc.width/2, rc.top-6, '#44ff88'); }
    SFX.click();
    return false;
  });
}
function hdBombExplode(b){
  HD.bombs=HD.bombs.filter(x=>x!==b);
  HD.cascading=true; HD.bombCascade=true; swLock(true);
  const r0=Math.min(b.r,BS-2), c0=Math.min(b.c,BS-2);
  const cells=[{r:r0,c:c0},{r:r0,c:c0+1},{r:r0+1,c:c0},{r:r0+1,c:c0+1}];
  const el=getCellEl(b.r,b.c), rc=el?el.getBoundingClientRect():null;
  const x=rc?rc.left+rc.width:innerWidth/2, y=rc?rc.top+rc.height:innerHeight/2;
  spawnBombWave(x,y,'#ff3b1f'); spawnParticles(x,y,'#ff5a1f',22); spawnParticles(x,y,'#ffd000',12);
  showComboText('💥 −2 HAMLE', x, y-34, '#ff4d4d');
  SFX.boom();
  const bd=document.getElementById('board');
  bd.classList.remove('hd-quake'); void bd.offsetWidth; bd.classList.add('hd-quake');
  const lost=Math.min(2,G.moves);
  G.moves-=lost; HD.penalty+=lost;
  document.getElementById('movesVal').textContent=G.moves;
  cells.forEach(({r,c})=>{ if(!isObstacle(G.board[r][c])) getCellEl(r,c)?.classList.add('matched'); });
  setTimeout(()=>{
    if(!hdOnGame()) return;
    boardClearCells(cells);                       // hedefe sayılmaz; yandaki engeller vurulur
    dropGems(); fillBoard(); renderBoard();
    setTimeout(()=>{
      const {cells:m}=findMatchesExtended();
      if(m.length) processMatches(m); else checkEndConditions();
    },350);
  },350);
}

// ── Karışan tahta: taşların yeri değişir (güç taşları korunur), hamle garantili, eşleşmesiz ──
function hdPermute(){
  const pos=[];
  for(let r=0;r<BS;r++) for(let c=0;c<BS;c++){ const g=G.board[r][c]; if(g && !isObstacle(g)) pos.push([r,c]); }
  const gems=pos.map(([r,c])=>G.board[r][c]);
  for(let t=0;t<200;t++){
    for(let i=gems.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [gems[i],gems[j]]=[gems[j],gems[i]]; }
    pos.forEach(([r,c],i)=>{ G.board[r][c]=gems[i]; });
    if(!hasAnyMatch() && hasAnyPossibleMove()) return;
  }
  let t=0;
  do{ shuffleBoard(); }while((hasAnyMatch() || !hasAnyPossibleMove()) && ++t<100);
}
function hdShuffle(done){
  HD.shuffling=true; G.gameActive=false; swLock(true);
  const bd=document.getElementById('board');
  hdBanner('🔀 Tahta Karışıyor!'); SFX.super();
  bd.classList.add('hd-shuffling');
  setTimeout(()=>{ if(hdOnGame()){ hdPermute(); renderBoard(); } },500);
  setTimeout(()=>{
    bd.classList.remove('hd-shuffling'); HD.shuffling=false;
    if(!hdOnGame()) return;
    G.gameActive=true; done();
  },1000);
}

// ── Hedef çubuğu: kısıt rozetleri ──
function hdConsChips(){
  const bar=document.getElementById('goalBar'), cfg=HD.cfg||{};
  if(!bar) return;
  const help=bar.querySelector('.goal-help-btn');
  const chip=(id,html,cls)=>{ const d=document.createElement('div'); d.className='goal-item hd-cons '+(cls||''); d.id=id; d.innerHTML=html; bar.insertBefore(d,help); };
  if(cfg.finishIn) chip('hdConsMoves',`<span class="goal-gem">⏱</span><span class="gi-count">≤${cfg.finishIn}</span>`);
  if(cfg.noCombo) chip('hdConsCombo',`<span class="goal-gem">🚫</span><span class="gi-count">Kombo</span>`, HD.comboFail?'hd-fail':'');
}

// ── Mevcut akışa bağlantılar (sarmalama) ──
const _hdOrigStartLevel = startLevel;
startLevel = function(){
  hdStopBombs();
  Object.assign(HD,{cfg:hdCfg(selectedBuilding,selectedLevel), placed:{}, turn:0, penalty:0, flood:0, matches:0,
    light:{r:3,c:3}, comboFail:false, cascading:false, shuffling:false, bombCascade:false, wantBomb:false, goalDirty:false});
  document.getElementById('board')?.classList.remove('hd-shuffling','hd-quake');
  const res=_hdOrigStartLevel.apply(this,arguments);
  if(G.gameActive && hdOnGame()){
    const cfg=HD.cfg;
    if(cfg.finishIn && G.moves>cfg.finishIn){ G.moves=cfg.finishIn; document.getElementById('movesVal').textContent=G.moves; }
    HD.start=G.moves;
    const n=cfg.goal && HD.placed[cfg.goal];
    if(n){ const k=HD_OBST[cfg.goal].goal; G.goals[k]=n; G.goalProgress[k]=0; }
    renderGoalBar(); hdDecorate();
    const m=Object.keys(HD_MECH).filter(x=>cfg[x]).map(x=>HD_MECH[x].icon+' '+HD_MECH[x].name);
    if(cfg.finishIn) m.push(`⏱ ${cfg.finishIn} hamle`);
    if(cfg.noCombo) m.push('🚫 Kombosuz');
    if(m.length) setTimeout(()=>showToast('⚠️ '+m.join(' · '),'warning'),700);
  }
  return res;
};

const _hdOrigRenderBoard = renderBoard;
renderBoard = function(){ const r=_hdOrigRenderBoard.apply(this,arguments); hdDecorate(); return r; };

const _hdOrigRenderGoalBar = renderGoalBar;
renderGoalBar = function(){ const r=_hdOrigRenderGoalBar.apply(this,arguments); hdConsChips(); return r; };

const _hdOrigClear = boardClearCells;
boardClearCells = function(cells){
  hdCheckDefuse(cells);
  HD.goalDirty=false;
  const r=_hdOrigClear.apply(this,arguments);
  if(HD.goalDirty) updateGoalBar();
  return r;
};

const _hdOrigProcessMatches = processMatches;
processMatches = function(){
  HD.cascading=true;
  const res=_hdOrigProcessMatches.apply(this,arguments);
  if(hdOnGame()){
    HD.matches++;
    if(HD.cfg.flood && HD.flood>0 && HD.matches%5===0){
      HD.flood--; hdBanner('🌊 Su çekildi'); SFX.water();
      setTimeout(hdDecorate,0);
    }
    if(HD.cfg.noCombo && !HD.comboFail && !HD.bombCascade && (G._chainCount||0)>=2){
      HD.comboFail=true;
      document.getElementById('hdConsCombo')?.classList.add('hd-fail');
    }
  }
  return res;
};

// Süper bombalı birleşimler (⚡+⚡, 💥+⚡) karbonu da kırar
const _hdOrigMergeSS = mergeSuperSuper;
mergeSuperSuper = function(){ G._hdSuperAll=true; return _hdOrigMergeSS.apply(this,arguments); };
const _hdOrigMergeBS = mergeBombSuper;
mergeBombSuper = function(){ G._hdSuperAll=true; return _hdOrigMergeBS.apply(this,arguments); };

// Tahta durulunca: kısıt kontrolü + hamle başına olaylar
const _hdOrigCheckEnd = checkEndConditions;
checkEndConditions = function(){
  const self=this, args=arguments, go=()=>_hdOrigCheckEnd.apply(self,args);
  HD.cascading=false; HD.bombCascade=false;
  if(!hdOnGame()) return go();
  if(isGoalComplete()){ hdStopBombs(); return go(); }
  if(HD.comboFail) return hdLose('🚫 Kombo yapıldı — bu bölüm kombosuz bitmeliydi!');
  const cfg=HD.cfg, used=HD.start-G.moves-HD.penalty;
  let shuffle=false, rose=false;
  while(HD.turn<used){
    HD.turn++;
    if(cfg.darkness) hdMoveLight();
    if(cfg.flood && HD.turn%3===0){ HD.flood++; rose=true; }
    if(cfg.bombRain && HD.turn%5===0) HD.wantBomb=true;
    if(cfg.shuffle && HD.turn%8===0) shuffle=true;
  }
  if(HD.flood>=3){ hdDecorate(); return hdLose('🌊 Su 3. satıra ulaştı!'); }
  if(rose){ hdBanner('🌊 Su yükseliyor!'); SFX.water(); }
  if(G.moves<=0){ hdStopBombs(); return go(); }
  const after=()=>{
    hdDecorate();
    if(HD.wantBomb){ HD.wantBomb=false; hdSpawnBomb(); }
    return go();
  };
  if(shuffle){ hdShuffle(after); return; }
  return after();
};

const _hdOrigShowResult = showResult;
showResult = function(){ hdStopBombs(); return _hdOrigShowResult.apply(this,arguments); };
const _hdOrigExitGame = exitGame;
exitGame = function(){ hdStopBombs(); return _hdOrigExitGame.apply(this,arguments); };

// Bölüm giriş ekranı: yeni engel/mekanik bilgisi
const _hdOrigOpenLevelAt = _openLevelAtIndex;
_openLevelAtIndex = function(){
  const r=_hdOrigOpenLevelAt.apply(this,arguments);
  document.getElementById('levelInfo')?.insertAdjacentHTML('beforeend', hdLevelInfoHTML(selectedBuilding,selectedLevel));
  return r;
};
const _hdOrigOpenLevelSelect = openLevelSelect;
openLevelSelect = function(){
  const r=_hdOrigOpenLevelSelect.apply(this,arguments);
  document.getElementById('levelInfo')?.insertAdjacentHTML('beforeend', hdLevelInfoHTML(selectedBuilding,selectedLevel));
  return r;
};
