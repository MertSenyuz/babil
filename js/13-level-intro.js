// ══════════════════════════════════════════════
// BÖLÜM GİRİŞ
// ══════════════════════════════════════════════
let selectedBuilding=0,selectedLevel=0;

function openLevelSelect(bIdx){
  const b=BUILDINGS[bIdx]; const bp=G.buildingProgress[bIdx];
  selectedBuilding=bIdx;
  let nextLevel=0;
  for(let i=0;i<b.levels.length;i++){ if(bp.stars[i]>0) nextLevel=i+1; }
  selectedLevel=Math.min(b.levels.length-1,nextLevel);

  document.getElementById('leIcon').innerHTML=bIcon(b);
  document.getElementById('leTitle').textContent=`${b.name} — Bölüm ${selectedLevel+1}`;
  document.getElementById('leDesc').textContent=b.desc;

  const lvl=b.levels[selectedLevel];
  const goalHTML=Object.entries(lvl.target).map(([k,v])=>`
    <div class="li-row">
      <span style="color:${GEMS[k].color};font-weight:900;">${GEMS[k].symbol}</span>
      <span>${GEMS[k].name}</span>
      <span>${v} adet</span>
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
