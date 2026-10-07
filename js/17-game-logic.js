// ══════════════════════════════════════════════
// OYUN MANTIĞI
// ══════════════════════════════════════════════
function onCellClick(r,c){
  if(!G.gameActive) return;
  const gem=G.board[r][c];
  if(!gem) return;
  if(isObstacle(gem)){
    const el=getCellEl(r,c); el?.classList.remove('obst-shake'); void el?.offsetWidth; el?.classList.add('obst-shake');
    SFX.invalid(); return;
  }

  if(G.selected===null){
    G.selected={r,c};
    getCellEl(r,c)?.classList.add('selected');
    SFX.select();
    return;
  }

  const{r:sr,c:sc}=G.selected;
  getCellEl(sr,sc)?.classList.remove('selected');

  if(sr===r&&sc===c){ G.selected=null; return; }

  const isAdj=(Math.abs(sr-r)+Math.abs(sc-c))===1;
  if(!isAdj){ G.selected={r,c}; getCellEl(r,c)?.classList.add('selected'); SFX.select(); return; }

  swapGems(sr,sc,r,c);

  // ── GÜÇ TAŞI BİRLEŞİMİ KONTROLÜ ──
  const gem1 = G.board[sr][sc];
  const gem2 = G.board[r][c];
  const pow1 = getGemPower(gem1);
  const pow2 = getGemPower(gem2);
  const isPower1 = pow1==='bomb'||pow1==='super';
  const isPower2 = pow2==='bomb'||pow2==='super';

  if(isPower1 && isPower2){
    // İki güç taşı birleşti — büyük patlama
    G.selected=null;
    G.moves--;
    document.getElementById('movesVal').textContent=G.moves;
    triggerPowerMerge(sr,sc,r,c,pow1,pow2,gem1,gem2);
    return;
  }

  const {cells:matches}=findMatchesExtended();
  if(matches.length===0){
    SFX.invalid();
    setTimeout(()=>{ swapGems(sr,sc,r,c); renderBoard(); },300);
    G.selected=null; return;
  }

  G.selected=null;
  G.moves--;
  document.getElementById('movesVal').textContent=G.moves;
  processMatches(matches);
}

function swapGems(r1,c1,r2,c2){
  [G.board[r1][c1],G.board[r2][c2]]=[G.board[r2][c2],G.board[r1][c1]];
}

function processMatches(matchedCells, isChain){
  // Güç taşlarını kontrol et ve genişlet
  const extraFromPower=activatePowerGemsInMatch(matchedCells);
  const allMatchedSet=new Set(matchedCells.map(({r,c})=>`${r},${c}`));
  extraFromPower.forEach(({r,c})=>allMatchedSet.add(`${r},${c}`));
  const allMatched=[...allMatchedSet].map(s=>{ const[r,c]=s.split(','); return{r:+r,c:+c}; });

  // Yeni oluşacak güç taşları
  const{powerGems}=findMatchesExtended();

  // Puan & hedef
  let pts=0;
  const gfList=[];
  allMatched.forEach(({r,c})=>{
    const gem=G.board[r][c];
    if(!gem || isObstacle(gem)) return;
    pts+=50;
    const base=getGemBase(gem);
    if(G.goalProgress[base]!==undefined){
      if(G.goalProgress[base]<G.goals[base]) gfList.push({r,c,base});   // hedefe sayılan taş → uçacak
      G.goalProgress[base]++;
    }
  });

  const matchLen=allMatched.length;
  const multiplier=matchLen>=10?4:matchLen>=7?3:matchLen>=5?2:1;
  G.score+=pts*multiplier;
  document.getElementById('scoreVal').textContent=G.score;

  // ── SES ──
  const chainIdx = isChain ? (G._chainCount||0) : 0;
  if(!isChain) G._chainCount=0;
  G._chainBombCount = G._chainBombCount||0;
  // Güç taşı varsa özel ses, yoksa normal eşleşme sesi
  const hasBomb = allMatched.some(({r,c})=>getGemPower(G.board[r][c])==='bomb');
  const hasSuper = allMatched.some(({r,c})=>getGemPower(G.board[r][c])==='super');
  const hasChainBomb = (G._chainBombCount||0) > 1;
  if(hasSuper) SFX.super();
  else if(hasChainBomb) SFX.chainBomb();
  else if(hasBomb) SFX.bomb();
  else SFX.match(Math.min(matchLen,6), chainIdx);
  if(isChain){ G._chainCount=(G._chainCount||0)+1; if(G._chainCount>=2){ SFX.combo(G._chainCount); nfFirstCombo(); } }
  const comboLvl = isChain ? (G._chainCount||1) : 0;   // 0: ilk eşleşme, 1: 2. eşleşme, 2: 3. eşleşme…

  // Animasyon & efektler
  allMatched.forEach(({r,c})=>{ if(!isObstacle(G.board[r][c])) getCellEl(r,c)?.classList.add('matched'); });

  // Patlama partikülleri (taşın renginde; kombo arttıkça daha çok)
  const gfPer=Math.max(3, Math.min(6+Math.min(comboLvl*2,8), Math.floor(180/Math.max(1,allMatched.length))));
  allMatched.forEach(({r,c})=>{
    const el=getCellEl(r,c);
    if(el){
      const rect=el.getBoundingClientRect();
      const base=getGemBase(G.board[r][c]);
      if(base) gfBurst(rect.left+rect.width/2,rect.top+rect.height/2,GEMS[base].color,gfPer+Math.floor(Math.random()*3));
    }
  });

  // Hedefe doğru uçan minyatür taşlar
  gfLaunch(gfList, comboLvl);

  // Combo metin — yalnızca gerçekten güç taşı oluşuyorsa
  const newPow=powerGems.find(p=>p.type==='super')||powerGems[0];
  if(newPow){
    const el=getCellEl(newPow.r,newPow.c);
    if(el){
      const rect=el.getBoundingClientRect();
      const sup=newPow.type==='super';
      showComboText(sup?'⚡ SÜPER!':'💥 BOMBA!',rect.left+rect.width/2,rect.top,sup?'#ffff00':'#ff8800');
    }
  }

  // Puan popup
  if(pts>0){
    const el=getCellEl(allMatched[0].r,allMatched[0].c);
    if(el){
      const rect=el.getBoundingClientRect();
      showScorePop(`+${pts*multiplier}`,rect.left+rect.width/2,rect.top);
    }
  }

  updateGoalBar();

  setTimeout(()=>{
    // Kaldır (engeller vurulur)
    boardClearCells(allMatched, G._killSet); G._killSet=null;

    // Güç taşları yerleştir (eğer yerleşeceği hücre boşsa)
    powerGems.forEach(({r,c,type,gemBase})=>{
      if(!G.board[r][c]) G.board[r][c]=`${gemBase}_${type}`;
    });

    dropGems(); fillBoard(); renderBoard();

    setTimeout(()=>{
      const{cells:newMatches}=findMatchesExtended();
      if(newMatches.length>0) processMatches(newMatches,true);
      else checkEndConditions();
    },350);
  },350);
}

function dropGems(){
  // Her sütun engellerle bölümlere ayrılır; taşlar kendi bölümünde aşağı iner
  for(let c=0;c<BS;c++){
    let write=BS-1;
    for(let r=BS-1;r>=0;r--){
      const g=G.board[r][c];
      if(isObstacle(g) && !hdFalls(g)){ write=r-1; continue; }   // bal taşı diğer taşlar gibi düşer
      if(g){
        if(write!==r){ G.board[write][c]=g; G.board[r][c]=null; }
        write--;
      }
    }
  }
}

function fillBoard(){
  for(let r=0;r<BS;r++)
    for(let c=0;c<BS;c++)
      if(!G.board[r][c]) G.board[r][c]=spawnGem();
}

function checkEndConditions(){
  if(isGoalComplete()){ G.gameActive=false; setTimeout(()=>showResult(true),400); return; }
  if(G.moves<=0){ G.gameActive=false; setTimeout(()=>showResult(false),400); return; }
  if(!hasAnyPossibleMove()){
    // Otomatik karıştırmak yerine kullanıcıya sor
    G.gameActive=false;
    setTimeout(()=>showReshuffleModal(), 400);
  }
}

function hasAnyPossibleMove(){
  for(let r=0;r<BS;r++){
    for(let c=0;c<BS;c++){
      if(isObstacle(G.board[r][c]) || hdFrozen(r,c)) continue;
      if(c<BS-1 && !isObstacle(G.board[r][c+1]) && !hdFrozen(r,c+1)){ swapGems(r,c,r,c+1); if(findMatches().length>0){swapGems(r,c,r,c+1);return true;} swapGems(r,c,r,c+1); }
      if(r<BS-1 && !isObstacle(G.board[r+1][c]) && !hdFrozen(r+1,c)){ swapGems(r,c,r+1,c); if(findMatches().length>0){swapGems(r,c,r+1,c);return true;} swapGems(r,c,r+1,c); }
    }
  }
  return false;
}

// ── YENİLEME SİSTEMİ ──
G._reshuffleCount = 0;

function showReshuffleModal(){
  document.getElementById('reshuffleCount').textContent =
    `Bu oyunda yenilemeler: ${G._reshuffleCount||0}`;
  document.getElementById('reshuffleModal').classList.add('open');
}

function closeReshuffleModal(){
  document.getElementById('reshuffleModal').classList.remove('open');
}

function doReshuffle(){
  closeReshuffleModal();
  G._reshuffleCount = (G._reshuffleCount||0) + 1;

  // Tahtayı karıştır, eşleşme çıkana dek dene
  let tries = 0;
  do { shuffleBoard(); tries++; } while(!hasAnyPossibleMove() && tries < 100);

  // Kısa animasyon
  const boardEl = document.getElementById('board');
  boardEl.style.transition = 'opacity .2s';
  boardEl.style.opacity = '0';
  setTimeout(()=>{
    renderBoard();
    boardEl.style.opacity = '1';
    G.gameActive = true;
    showToast('🔀 Tahta yenilendi!');
    SFX.select();
  }, 220);
}

function doReshuffleWithHint(){
  if(G.coins < 10){
    showToast('🪙 Yeterli altın yok! (10 Altın gerek)','warning');
    return;
  }
  G.coins -= 10;
  updateCoinsUI();
  closeReshuffleModal();
  G._reshuffleCount = (G._reshuffleCount||0) + 1;

  let tries = 0;
  do { shuffleBoard(); tries++; } while(!hasAnyPossibleMove() && tries < 100);

  const boardEl = document.getElementById('board');
  boardEl.style.transition = 'opacity .2s';
  boardEl.style.opacity = '0';
  setTimeout(()=>{
    renderBoard();
    boardEl.style.opacity = '1';
    G.gameActive = true;
    showToast('🔀 Tahta yenilendi! 💡 İpucu aktif...');
    SFX.select();
    // İpucu: ilk geçerli hamleyi göster
    setTimeout(()=>showHintOnBoard(), 400);
  }, 220);
}

function showHintOnBoard(){
  // İlk geçerli hamleyi bul ve hücreleri parlat
  for(let r=0;r<BS;r++){
    for(let c=0;c<BS;c++){
      if(isObstacle(G.board[r][c]) || hdFrozen(r,c)) continue;
      if(c<BS-1 && !isObstacle(G.board[r][c+1]) && !hdFrozen(r,c+1)){
        swapGems(r,c,r,c+1);
        if(findMatches().length>0){
          swapGems(r,c,r,c+1);
          // İki hücreyi hint ile göster
          getCellEl(r,c)?.classList.add('hint');
          getCellEl(r,c+1)?.classList.add('hint');
          setTimeout(()=>{
            getCellEl(r,c)?.classList.remove('hint');
            getCellEl(r,c+1)?.classList.remove('hint');
          },2000);
          return;
        }
        swapGems(r,c,r,c+1);
      }
      if(r<BS-1 && !isObstacle(G.board[r+1][c]) && !hdFrozen(r+1,c)){
        swapGems(r,c,r+1,c);
        if(findMatches().length>0){
          swapGems(r,c,r+1,c);
          getCellEl(r,c)?.classList.add('hint');
          getCellEl(r+1,c)?.classList.add('hint');
          setTimeout(()=>{
            getCellEl(r,c)?.classList.remove('hint');
            getCellEl(r+1,c)?.classList.remove('hint');
          },2000);
          return;
        }
        swapGems(r,c,r+1,c);
      }
    }
  }
}
