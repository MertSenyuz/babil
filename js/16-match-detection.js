// ══════════════════════════════════════════════
// EŞLEŞME TESPİTİ (güçlü versiyonu)
// ══════════════════════════════════════════════
function findMatchesExtended(){
  const matchedSet=new Set();
  const powerGems=[];
  const runs=[];   // {dir:'h'|'v', keys:[...], base}

  // Yatay
  for(let r=0;r<BS;r++){
    let runStart=0,run=1;
    for(let c=1;c<=BS;c++){
      const prev=getGemBase(G.board[r][c-1]);
      const cur=c<BS?getGemBase(G.board[r][c]):null;
      if(cur&&cur===prev){ run++; }
      else{
        if(run>=3){
          const keys=[]; for(let k=runStart;k<runStart+run;k++) keys.push(`${r},${k}`);
          runs.push({dir:'h',keys,base:getGemBase(G.board[r][runStart])});
        }
        runStart=c; run=1;
      }
    }
  }

  // Dikey
  for(let c=0;c<BS;c++){
    let runStart=0,run=1;
    for(let r=1;r<=BS;r++){
      const prev=getGemBase(G.board[r-1][c]);
      const cur=r<BS?getGemBase(G.board[r][c]):null;
      if(cur&&cur===prev){ run++; }
      else{
        if(run>=3){
          const keys=[]; for(let k=runStart;k<runStart+run;k++) keys.push(`${k},${c}`);
          runs.push({dir:'v',keys,base:getGemBase(G.board[runStart][c])});
        }
        runStart=r; run=1;
      }
    }
  }

  // Ortak hücresi olan diziler tek şekildir (L, T, +): birleştir
  const parent=runs.map((_,i)=>i);
  const find=i=>{ while(parent[i]!==i){ parent[i]=parent[parent[i]]; i=parent[i]; } return i; };
  const owner=new Map();   // hücre → ilk dizi
  runs.forEach((run,i)=>run.keys.forEach(k=>{
    matchedSet.add(k);
    if(owner.has(k)) parent[find(i)]=find(owner.get(k)); else owner.set(k,i);
  }));
  const groups=new Map();
  runs.forEach((run,i)=>{ const g=find(i); if(!groups.has(g)) groups.set(g,[]); groups.get(g).push(run); });

  // Her şekil en fazla BİR güç taşı üretir
  const swap=G._swapCells;
  groups.forEach(gr=>{
    const maxLen=Math.max(...gr.map(x=>x.keys.length));
    const hasH=gr.some(x=>x.dir==='h'), hasV=gr.some(x=>x.dir==='v');
    const type = maxLen>=5 ? 'super' : (maxLen>=4 || (hasH&&hasV)) ? 'bomb' : null;
    if(!type) return;
    const cells=new Set(gr.flatMap(x=>x.keys));
    // Konum: oyuncunun kaydırdığı taş > L/T köşesi (kesişim) > en uzun dizinin ortası
    let key=null;
    if(swap){
      if(cells.has(`${swap.r2},${swap.c2}`)) key=`${swap.r2},${swap.c2}`;
      else if(cells.has(`${swap.r1},${swap.c1}`)) key=`${swap.r1},${swap.c1}`;
    }
    if(!key && hasH && hasV){
      const h=new Set(gr.filter(x=>x.dir==='h').flatMap(x=>x.keys));
      key=gr.filter(x=>x.dir==='v').flatMap(x=>x.keys).find(k=>h.has(k))||null;
    }
    if(!key){ const lg=gr.find(x=>x.keys.length===maxLen); key=lg.keys[Math.floor(lg.keys.length/2)]; }
    const [r,c]=key.split(',').map(Number);
    powerGems.push({r,c,type,gemBase:gr[0].base});
  });

  const cells=[...matchedSet].map(s=>{ const[r,c]=s.split(','); return{r:+r,c:+c}; });
  return{cells,powerGems};
}

function findMatches(){
  return findMatchesExtended().cells;
}

function hasAnyMatch(){ return findMatches().length>0; }

// Güç taşı aktivasyonu — zincir bomba BFS dahil
function activatePowerGemsInMatch(matchedCells){
  const extraSet = new Set();
  const explodedBombs = new Set();
  const bombsToExplode = []; // {r, c, radius}

  // Önce süper taşları ve ilk bombaları topla
  matchedCells.forEach(({r,c})=>{
    const gem = G.board[r][c];
    if(!gem) return;
    const power = getGemPower(gem);
    if(power === 'super'){
      G._hdSuper=G._hdSuper||new Set();                 // karbon taşı yalnızca süper bombayla kırılır
      for(let k=0;k<BS;k++){
        if(G.board[r][k]) extraSet.add(`${r},${k}`);
        if(G.board[k][c]) extraSet.add(`${k},${c}`);
        G._hdSuper.add(r*BS+k); G._hdSuper.add(k*BS+c);
      }
      const el=getCellEl(r,c);
      if(el){ const rect=el.getBoundingClientRect(); spawnSuperFlash(rect.left+rect.width/2,rect.top+rect.height/2); }
    } else if(power === 'bomb'){
      const key=`${r},${c}`;
      if(!explodedBombs.has(key)){ explodedBombs.add(key); bombsToExplode.push({r,c,radius:1}); }
    } else if(SPECIAL_STONES[power]){
      activateSpecialStone(power, r, c, gem, extraSet);
    }
  });

  // BFS: bomba patlarsa, alanındaki diğer bombalar da tetiklenir (zincir)
  let qi = 0;
  while(qi < bombsToExplode.length){
    const {r, c, radius} = bombsToExplode[qi++];
    for(let dr=-radius;dr<=radius;dr++) for(let dc=-radius;dc<=radius;dc++){
      const nr=r+dr, nc=c+dc;
      if(nr>=0&&nr<BS&&nc>=0&&nc<BS&&G.board[nr][nc]){
        extraSet.add(`${nr},${nc}`);
        // Komşu bomba → zincire ekle (5x5 radius ile patlar)
        const nkey=`${nr},${nc}`;
        if(!explodedBombs.has(nkey) && getGemPower(G.board[nr][nc])==='bomb'){
          explodedBombs.add(nkey);
          bombsToExplode.push({r:nr, c:nc, radius:2});
        }
      }
    }
  }

  // Görsel efektler — zincir varsa daha dramatik
  const isChain = bombsToExplode.length > 1;
  G._chainBombCount = bombsToExplode.length;
  bombsToExplode.forEach(({r,c,radius},idx)=>{
    const gem = G.board[r][c];
    const color = gem ? (GEMS[getGemBase(gem)]?.color||'#ff8800') : '#ff8800';
    const el = getCellEl(r,c);
    if(!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left+rect.width/2, cy = rect.top+rect.height/2;
    setTimeout(()=>{
      spawnBombWave(cx, cy, color);
      if(isChain){
        setTimeout(()=>spawnBombWave(cx+18, cy-12, '#ff3300'), 70);
        setTimeout(()=>spawnBombWave(cx-14, cy+10, '#ffaa00'), 140);
        if(idx===0) showComboText(`💥 ZİNCİR x${bombsToExplode.length}!`, cx, cy-30, '#ff4400');
      }
    }, idx * 110);
  });

  return [...extraSet].map(s=>{ const[r,c]=s.split(','); return{r:+r,c:+c}; });
}
