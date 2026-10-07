// ══════════════════════════════════════════════
// ŞEHİR DİZAYN SİSTEMİ
// ══════════════════════════════════════════════
const CD_SIZE = 25; // 5x5
let _cdBIdx = 0;
let _cdGrid = [];
let _cdDragId = null;

function openCityDesign(bIdx){
  _cdBIdx  = bIdx >= 0 ? bIdx : 0;
  _cdGrid  = [...getCityGrid(_cdBIdx)];
  const b  = BUILDINGS[_cdBIdx];
  const titleEl = document.getElementById('cdTitle');
  if(titleEl) titleEl.textContent = `${b.icon} ${b.name} — Dizayn`;
  _renderCdGrid();
  _renderCdInventory();
  showScreen('cityDesignScreen');
}

function closeCityDesign(){
  saveCityGrid(_cdBIdx, _cdGrid);
  saveGame();
  showScreen('menuScreen');
}

function openCityDesignFromShop(){
  closeCityDesign();
}

function openMapPlaceFromShop(){
  showMapScreen();
  // Harita yüklendikten sonra yerleştirme modunu aç
  requestAnimationFrame(()=> setTimeout(openMapPlaceMode, 120));
}

function _renderCdGrid(){
  const canvas = document.getElementById('cdCanvas');
  if(!canvas) return;

  const wrap = canvas.parentElement;
  const W = wrap.clientWidth  || 360;
  const H = wrap.clientHeight || 300;
  const cellSize = Math.min(Math.floor((W-24)/5), Math.floor((H-24)/5), 72);
  const gap = 4;

  canvas.style.width  = `${5*cellSize + 4*gap + 20}px`;
  canvas.style.height = `${5*cellSize + 4*gap + 20}px`;
  canvas.style.gridTemplateColumns = `repeat(5,${cellSize}px)`;
  canvas.style.gridTemplateRows    = `repeat(5,${cellSize}px)`;
  canvas.style.gap = `${gap}px`;
  canvas.style.padding = '10px';
  canvas.innerHTML = '';

  for(let i = 0; i < CD_SIZE; i++){
    const itemId = _cdGrid[i];
    const item   = itemId ? SHOP_ITEMS.find(s=>s.id===itemId) : null;
    const cell   = document.createElement('div');
    cell.className = 'design-cell' + (itemId ? ' has-item' : '');
    cell.dataset.idx = i;
    cell.style.width = cell.style.height = cellSize + 'px';
    cell.style.fontSize = Math.floor(cellSize * 0.52) + 'px';

    if(item){
      cell.innerHTML = `${saArt(item,'mini')}<button class="cell-remove-btn" onclick="cdRemoveItem(${i})">✕</button>`;
    }

    cell.addEventListener('dragover',  e => { e.preventDefault(); cell.classList.add('drag-over'); });
    cell.addEventListener('dragleave', ()=> cell.classList.remove('drag-over'));
    cell.addEventListener('drop',      e => { e.preventDefault(); cell.classList.remove('drag-over'); cdDrop(i); });
    cell.addEventListener('touchend',  e => { e.preventDefault(); cdTouchDrop(e,i); }, {passive:false});
    canvas.appendChild(cell);
  }
}

function _renderCdInventory(){
  const wrap = document.getElementById('cdInventory');
  if(!wrap) return;
  const inv = getInv();
  const items = SHOP_ITEMS.filter(i => (inv[i.id]||0) > 0 && i.cat!=='booster');

  if(items.length === 0){
    wrap.innerHTML = `<div style="padding:14px;font-size:12px;color:var(--muted);text-align:center;font-family:'Cinzel',serif;">
      Envanterin boş.<br>Mağazadan öğe satın al!
    </div>`;
    return;
  }

  wrap.innerHTML = items.map(item => `
    <div class="design-inv-item"
      draggable="true"
      data-item="${item.id}"
      ondragstart="cdDragStart(event,'${item.id}')"
      ontouchstart="cdTouchStart(event,'${item.id}')"
      ontouchmove="cdTouchMove(event)"
      ontouchend="cdTouchEnd(event)">
      <span class="inv-icon">${saArt(item,'mini',34)}</span>
      <span class="inv-name">${item.name}</span>
      <span class="inv-qty">×${inv[item.id]}</span>
    </div>
  `).join('');
}

function cdRemoveItem(idx){
  const itemId = _cdGrid[idx];
  if(!itemId) return;
  addInv(itemId, 1);
  _cdGrid[idx] = null;
  saveCityGrid(_cdBIdx, _cdGrid);
  _renderCdGrid();
  _renderCdInventory();
  showToast('✦ Envantere geri alındı');
}

// Mouse sürükle
function cdDragStart(e, itemId){
  _cdDragId = itemId;
  e.dataTransfer.effectAllowed = 'move';
  // Ghost
  const item = SHOP_ITEMS.find(i=>i.id===itemId);
  const ghost = document.getElementById('cdGhost');
  if(ghost){ ghost.innerHTML = item ? saArt(item,'mini',52) : '🏛'; ghost.style.display='block'; }
}

function cdDrop(cellIdx){
  if(!_cdDragId) return;
  const inv = getInv();
  if((inv[_cdDragId]||0) <= 0){ showToast('Envanterde yok!'); _cdDragId=null; return; }

  // Hücrede başka şey varsa onu envantera geri koy
  if(_cdGrid[cellIdx]){ addInv(_cdGrid[cellIdx], 1); }

  // Yerleştir
  _cdGrid[cellIdx] = _cdDragId;
  useInv(_cdDragId, 1);
  _cdDragId = null;
  saveCityGrid(_cdBIdx, _cdGrid);
  _renderCdGrid();
  _renderCdInventory();
  SFX.select?.();
}

document.addEventListener('dragend', ()=>{
  _cdDragId = null;
  const g = document.getElementById('cdGhost');
  if(g) g.style.display = 'none';
});
document.addEventListener('mousemove', e=>{
  const g = document.getElementById('cdGhost');
  if(g && g.style.display !== 'none'){ g.style.left=e.clientX+'px'; g.style.top=e.clientY+'px'; }
});

// Touch sürükle
let _cdTouchId = null;
let _cdTouchGhost = null;

function cdTouchStart(e, itemId){
  _cdTouchId = itemId;
  _cdDragId  = itemId;
  const item = SHOP_ITEMS.find(i=>i.id===itemId);
  const g = document.getElementById('cdGhost');
  if(g){ g.innerHTML = item ? saArt(item,'mini',52) : '🏛'; g.style.display='block'; }
  const t = e.touches[0];
  if(g){ g.style.left=t.clientX+'px'; g.style.top=t.clientY+'px'; }
}

function cdTouchMove(e){
  if(!_cdTouchId) return;
  e.preventDefault();
  const t = e.touches[0];
  const g = document.getElementById('cdGhost');
  if(g){ g.style.left=t.clientX+'px'; g.style.top=t.clientY+'px'; }
  document.querySelectorAll('.design-cell').forEach(c=>c.classList.remove('drag-over'));
  const el = document.elementFromPoint(t.clientX, t.clientY);
  el?.closest('.design-cell')?.classList.add('drag-over');
}

function cdTouchDrop(e, cellIdx){
  document.querySelectorAll('.design-cell').forEach(c=>c.classList.remove('drag-over'));
  cdDrop(cellIdx);
  _cdTouchId = null;
  const g = document.getElementById('cdGhost');
  if(g) g.style.display='none';
}

function cdTouchEnd(e){
  if(_cdTouchId){
    const t = e.changedTouches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const cell = el?.closest('.design-cell');
    document.querySelectorAll('.design-cell').forEach(c=>c.classList.remove('drag-over'));
    if(cell && cell.dataset.idx !== undefined){
      cdDrop(parseInt(cell.dataset.idx));
    }
    _cdTouchId = null;
    _cdDragId  = null;
    const g = document.getElementById('cdGhost');
    if(g) g.style.display = 'none';
  }
}
