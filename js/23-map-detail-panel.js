// ══════════════════════════════════════════════
// HARİTA DETAY PANELİ
// ══════════════════════════════════════════════
let _mdpActiveBuilding = -1;
let _mdpActiveTab = 'story';

let _pinPopupBIdx = -1;

function openMapDetail(bIdx){
  const bp = G.buildingProgress[bIdx];
  const b  = BUILDINGS[bIdx];
  G.totalStars = getTotalStarsReal();
  const locked = !isBuildingUnlocked(bIdx);

  // En son oynayabileceği bölümü bul
  let lvlIdx = 0;
  for(let i = 0; i < b.levels.length; i++){
    lvlIdx = i;
    if((bp.stars[i]||0) === 0) break;
  }
  const totalStarsEarned = bp.stars.reduce((a,s)=>a+s,0);
  const starsDisp = b.levels.map((_,i)=>(bp.stars[i]||0)>0?'⭐':'☆').join('');

  _pinPopupBIdx = bIdx;
  const popup = document.getElementById('mapPinPopup');
  popup.innerHTML = `
    <div class="mpp-row">
      <div class="mpp-icon">${bIcon(b)}</div>
      <div class="mpp-info">
        <div class="mpp-name">${b.name}</div>
        <div class="mpp-stars">${starsDisp}</div>
        <div class="mpp-lvl">Bölüm ${lvlIdx+1} · ${totalStarsEarned}/${b.levels.length} yıldız</div>
      </div>
    </div>
    ${locked
      ? `<div class="mpp-locked">${buildingLockMsg(bIdx)}</div>`
      : `<button class="mpp-play-btn" onclick="closePinPopupAndPlay()">▶ OYNA</button>`
    }
  `;
  popup.classList.add('open');
}

function closePinPopup(){
  document.getElementById('mapPinPopup').classList.remove('open');
  _pinPopupBIdx = -1;
}

function closePinPopupAndPlay(){
  const bIdx = _pinPopupBIdx;
  closePinPopup();
  if(bIdx < 0) return;
  const bp = G.buildingProgress[bIdx];
  const b  = BUILDINGS[bIdx];
  let lvlIdx = 0;
  for(let i = 0; i < b.levels.length; i++){
    lvlIdx = i;
    if((bp.stars[i]||0) === 0) break;
  }
  _openLevelAtIndex(bIdx, lvlIdx);
}

function _renderMdpLevels(bIdx){
  const b = BUILDINGS[bIdx];
  const bp = G.buildingProgress[bIdx];
  const container = document.getElementById('mdpLevels');
  container.innerHTML = '';

  b.levels.forEach((lvl, i)=>{
    const levelStars = bp.stars[i]||0;
    const prevDone = i===0 || (bp.stars[i-1]||0)>0;
    const isDone = levelStars > 0;
    const isAvail = prevDone;

    const btn = document.createElement('div');
    btn.className = 'mdp-lvl ' + (isDone?'done':isAvail?'avail':'locked-l');

    const goalStr = Object.entries(lvl.target).map(([k,v])=>`<span style="color:${GEMS[k].color};font-weight:700;">${GEMS[k].symbol}</span>×${v}`).join(' ');
    const starsDisp = [0,1,2].map(si=>levelStars>si?'⭐':'☆').join('');
    const statusIcon = isDone?'✓':isAvail?'▶':'🔒';

    btn.innerHTML = `
      <div class="mdp-lvl-num">${i+1}</div>
      <div class="mdp-lvl-info">
        <div class="mdp-lvl-title">Bölüm ${i+1} ${statusIcon}</div>
        <div class="mdp-lvl-detail">${goalStr} &nbsp;·&nbsp; ${lvl.moves} hamle</div>
      </div>
      <div class="mdp-lvl-stars">${starsDisp}</div>
      ${isAvail?`<div class="mdp-lvl-arr">›</div>`:''}
    `;

    if(isAvail){
      btn.onclick = ()=>{
        closeMapDetail();
        _openLevelAtIndex(bIdx, i);
      };
    }
    container.appendChild(btn);
  });
}

function _renderMdpStats(bIdx){
  const b = BUILDINGS[bIdx];
  const bp = G.buildingProgress[bIdx];
  const bStars = bp.stars.reduce((a,c)=>a+c,0);
  const completedLevels = bp.stars.filter(s=>s>0).length;
  const maxStars = bp.stars.reduce((a,c)=>Math.max(a,c), 0);

  const grid = document.getElementById('mdpStatGrid');
  grid.style.setProperty('--mdp-color', b.color);
  grid.innerHTML = `
    <div class="mdp-stat-card">
      <div class="mdp-stat-icon">⭐</div>
      <div class="mdp-stat-val" style="color:${b.color};">${bStars}/${b.levels.length*3}</div>
      <div class="mdp-stat-lbl">Toplam Yıldız</div>
    </div>
    <div class="mdp-stat-card">
      <div class="mdp-stat-icon">🎯</div>
      <div class="mdp-stat-val" style="color:${b.color};">${completedLevels}/${b.levels.length}</div>
      <div class="mdp-stat-lbl">Bölüm</div>
    </div>
    <div class="mdp-stat-card">
      <div class="mdp-stat-icon">${b.featIcon}</div>
      <div class="mdp-stat-val" style="color:${b.color};font-size:12px;">AKTİF</div>
      <div class="mdp-stat-lbl">Özel Güç</div>
    </div>
    <div class="mdp-stat-card">
      <div class="mdp-stat-icon">🏆</div>
      <div class="mdp-stat-val" style="color:${b.color};">${maxStars}★</div>
      <div class="mdp-stat-lbl">En İyi</div>
    </div>
  `;
}

function switchMdpTab(tab){
  _mdpActiveTab = tab;
  ['story','levels','stats'].forEach(t=>{
    document.getElementById('tab-'+t).classList.toggle('active', t===tab);
    document.getElementById('mdpTab'+t.charAt(0).toUpperCase()+t.slice(1)).style.display = t===tab?'block':'none';
  });
}

function closeMapDetail(e){
  if(e && e.target !== document.getElementById('mapDetailPanel')) return;
  document.getElementById('mapDetailPanel').classList.remove('open');
  _mdpActiveBuilding = -1;
}

function getEraText(civIdx){
  // Dönem, görüntülenen medeniyette açılmış en son yapının yılına göre ilerler;
  // medeniyetin tüm bölümleri bitince "altın çağ" yazısı gelir.
  const c=CIVILIZATIONS[civIdx ?? G.mapCiv ?? 0] || CIVILIZATIONS[0];
  if(isCivComplete(c.id)) return {text:`${c.title} — ${fmtYear(c.era.to)}`, sub:c.golden, golden:true};
  const idxs=civBuildingIdx(c.id), open=idxs.filter(isBuildingUnlocked);
  const b=BUILDINGS[open.length ? open[open.length-1] : idxs[0]];
  return {text:`${c.title} — ${fmtYear(b.year)}`, sub:b.eraSub};
}

function showMapScreen(){
  G.totalStars = getTotalStarsReal();
  document.getElementById('mapStarsVal').textContent = G.totalStars;
  const mev = document.getElementById('mapEnergyVal');
  if(mev) mev.textContent = G.energy;

  // Dönem yazısını güncelle — değiştiyse animasyon
  const era = getEraText();
  const eraEl = document.getElementById('mapEraText');
  if(eraEl && eraEl.textContent !== tx(era.text)){
    eraEl.style.transition='opacity .4s';
    eraEl.style.opacity='0';
    setTimeout(()=>{
      eraEl.textContent = era.text;
      eraEl.style.opacity='1';
    }, 400);
  } else if(eraEl){
    eraEl.textContent = era.text;
  }
  const hintEl = document.getElementById('mapEraHint');
  if(hintEl) hintEl.textContent = '✦ ' + era.sub + ' ✦';

  updateFogZones();
  renderMapPins();
  renderMapItems();
  renderLandLayer();
  showScreen('mapScreen');
  requestAnimationFrame(()=>{ initMapPos(); });
}

// ══════════════════════════════════════════════
