// ══════════════════════════════════════════════
// YAPI DETAY MODAL
// ══════════════════════════════════════════════
function openBuildingDetail(bIdx){
  const b=BUILDINGS[bIdx];
  const bp=G.buildingProgress[bIdx];

  // Stil uygula
  const header=document.getElementById('bmHeader');
  header.style.background=b.grad;
  header.style.setProperty('--bm-color',b.color);
  document.getElementById('bmSheet').style.setProperty('--bm-grad',b.grad);
  document.getElementById('bmSheet').style.setProperty('--bm-color',b.color);

  document.getElementById('bmIcon').innerHTML=bIcon(b);
  document.getElementById('bmName').textContent=b.name;
  document.getElementById('bmName').style.color=b.color;
  document.getElementById('bmSub').textContent=b.desc;

  // Stars per level
  const starsRow=document.getElementById('bmStarsRow');
  starsRow.innerHTML=bp.stars.map((s,i)=>`
    <span class="bm-hstar" title="Bölüm ${i+1}">${s>0?'⭐':'☆'}</span>
  `).join('');

  // Story
  document.getElementById('bmStory').textContent=b.story;

  // Feature
  document.getElementById('bmFeatIcon').innerHTML=b.featIcon;
  document.getElementById('bmFeatDesc').innerHTML=b.feature;

  // Levels
  const lvlContainer=document.getElementById('bmLevels');
  lvlContainer.innerHTML='';
  b.levels.forEach((lvl,i)=>{
    const levelStars=bp.stars[i]||0;
    const prevDone=i===0||(bp.stars[i-1]||0)>0;
    const isAvail=prevDone;
    const isDoneLvl=levelStars>0;

    const btn=document.createElement('button');
    btn.className='bm-lvl-btn '+(isDoneLvl?'completed-lvl':isAvail?'available':'locked-lvl');

    const goalStr=Object.entries(lvl.target).map(([k,v])=>`${GEMS[k].symbol} ×${v}`).join(' · ');
    const starsDisplay=['☆','☆','☆'].map((_,si)=>levelStars>si?'⭐':'☆').join('');

    btn.innerHTML=`
      <div class="bm-lvl-num" style="color:${b.color};">${i+1}</div>
      <div class="bm-lvl-info">
        <div class="bm-lvl-title">Bölüm ${i+1} ${isDoneLvl?'✓':isAvail?'— Hazır':'🔒'}</div>
        <div class="bm-lvl-detail">${goalStr} · ${lvl.moves} hamle</div>
      </div>
      <div class="bm-lvl-stars">${starsDisplay}</div>
      ${isAvail?`<div class="bm-lvl-arrow">›</div>`:''}
    `;
    if(isAvail){
      btn.onclick=()=>{
        closeBuildingModal();
        selectedBuilding=bIdx;
        selectedLevel=i;
        // openLevelSelect'i doğrudan çağır ama bölüm numarasını sabitle
        _openLevelAtIndex(bIdx,i);
      };
    }
    lvlContainer.appendChild(btn);
  });

  document.getElementById('buildingModal').classList.add('open');
  document.body.style.overflow='hidden';
}

function _openLevelAtIndex(bIdx,lvlIdx){
  const b=BUILDINGS[bIdx];
  const bp=G.buildingProgress[bIdx];
  selectedBuilding=bIdx;
  selectedLevel=lvlIdx;

  document.getElementById('leIcon').innerHTML=bIcon(b);
  document.getElementById('leTitle').textContent=`${b.name} — Bölüm ${lvlIdx+1}`;
  document.getElementById('leDesc').textContent=b.story.slice(0,80)+'…';

  const lvl=b.levels[lvlIdx];
  const goalHTML=Object.entries(lvl.target).map(([k,v])=>`
    <div class="li-row">
      <span style="color:${GEMS[k].color};font-weight:900;font-size:16px;">${GEMS[k].symbol}</span>
      <span>${GEMS[k].name}</span><span>${v} adet</span>
    </div>
  `).join('');
  document.getElementById('levelInfo').innerHTML=`
    <div class="li-row"><span>Hamle Hakkı</span><span>${lvl.moves}</span></div>
    ${goalHTML}
    <div class="li-row"><span>Mevcut Yıldız</span><span>${starsStr(bp.stars)}</span></div>
  `;

  const hasEnergy=G.energy>=1;
  document.getElementById('energyWarnBox').style.display=hasEnergy?'none':'block';
  document.getElementById('playBtn').disabled=!hasEnergy;
  document.getElementById('playBtn').style.opacity=hasEnergy?'1':'0.5';
  updateEnergyUI();
  showScreen('levelScreen');
}

function closeBuildingModal(e){
  if(e && e.target!==document.getElementById('buildingModal')) return;
  document.getElementById('buildingModal').classList.remove('open');
  document.body.style.overflow='';
}
