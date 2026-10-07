// ══════════════════════════════════════════════
// ARAZİ YÖNETİMİ — ağaç kesme, boş arazi, yapı yerleştirme
// Ağaçlar: #mapTerrainSvg içindeki <use class="map-tree" id="tree_N" data-city="i">
// ══════════════════════════════════════════════
const LM_CUT_KEY  = 'babil_cut_trees';      // [treeId, ...]
const LM_BLD_KEY  = 'babil_map_buildings';  // [{treeId, itemId, x, y}]
const LM_CUT_COST = 30;
let _lmTreeId = null;   // kesme onayı bekleyen ağaç
let _lmPlotId = null;   // envanteri açılan boş arazi (ağaç id'si)
let _lmMenuId = null;   // uzun basılan yapının arazisi

function lmLoad(key){
  try{ const v = JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(v) ? v : []; }
  catch(e){ return []; }
}
function lmSave(key, v){ try{ localStorage.setItem(key, JSON.stringify(v)); }catch(e){} }
function lmCityOpen(c){ return isBuildingUnlocked(c); }
function lmTreePos(el){ return {x:+el.getAttribute('x'), y:+el.getAttribute('y')}; }
function lmEndMapDrag(){
  mapDrag.on = false; mapDrag.vx = 0; mapDrag.vy = 0;
  document.getElementById('mapCanvas')?.classList.remove('dragging'); mapMoving(false);
}

// Dokunma/tıklama + isteğe bağlı uzun basma. Harita sürüklenirken tetiklenmez.
// onTap false dönerse olay haritaya bırakılır (ör. mevcut yerleştirme modu).
function lmBindTap(root, selector, onTap, onLong){
  let el = null, sx = 0, sy = 0, moved = false, longFired = false, timer = null, lastTouch = 0;
  const start = (t, x, y)=>{
    el = t; sx = x; sy = y; moved = false; longFired = false; clearTimeout(timer);
    if(onLong) timer = setTimeout(()=>{
      if(!el || moved || MZ.hadPinch) return;
      longFired = true; el.classList.remove('lm-press'); lmEndMapDrag();
      navigator.vibrate?.(30); onLong(el);
    }, 550);
    if(onLong) t.classList.add('lm-press');
  };
  const move = (x, y)=>{
    if(el && !moved && Math.abs(x-sx)+Math.abs(y-sy) > 10){ moved = true; clearTimeout(timer); el.classList.remove('lm-press'); }
  };
  const end = e=>{
    clearTimeout(timer);
    const t = el; el = null;
    if(!t) return;
    t.classList.remove('lm-press');
    if(longFired){ e.stopPropagation(); if(e.cancelable) e.preventDefault(); lmEndMapDrag(); return; }
    if(moved || (e.type==='touchend' && MZ.hadPinch)) return;
    if(onTap(t) === false) return;
    e.stopPropagation(); if(e.cancelable) e.preventDefault();
    lmEndMapDrag();
  };
  root.addEventListener('touchstart', e=>{
    const t = e.target.closest?.(selector);
    if(!t){ el = null; return; }
    start(t, e.touches[0].clientX, e.touches[0].clientY);
  }, {passive:true});
  root.addEventListener('touchmove', e=>{ move(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
  root.addEventListener('touchend', e=>{ lastTouch = Date.now(); end(e); });
  root.addEventListener('touchcancel', ()=>{ clearTimeout(timer); el?.classList.remove('lm-press'); el = null; });
  root.addEventListener('mousedown', e=>{
    if(Date.now()-lastTouch < 700 || e.button !== 0) return;
    const t = e.target.closest?.(selector);
    if(!t){ el = null; return; }
    start(t, e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', e=>move(e.clientX, e.clientY));
  root.addEventListener('mouseup', e=>{ if(Date.now()-lastTouch < 700) return; end(e); });
  root.addEventListener('contextmenu', e=>{ if(onLong && e.target.closest?.(selector)) e.preventDefault(); });
}

// ── Katmanı çiz: kesilen ağaçları gizle, boş arazi / yapıları yerleştir ──
function renderLandLayer(animId){
  const layer = document.getElementById('landLayer');
  if(!layer) return;
  const cut  = lmLoad(LM_CUT_KEY);
  const blds = lmLoad(LM_BLD_KEY);
  document.querySelectorAll('#mapTerrainSvg .map-tree.lm-cut').forEach(t=>{
    if(!cut.includes(t.id)) t.classList.remove('lm-cut');
  });
  const spots = cut.map(id=>document.getElementById(id)).filter(Boolean)
                   .filter(t=>t.closest('svg')?.classList.contains('active'))
                   .map(t=>({id:t.id, t, ...lmTreePos(t)}))
                   .sort((a,b)=>a.y-b.y);
  layer.innerHTML = '';
  spots.forEach(s=>{
    s.t.classList.add('lm-cut');
    const b  = blds.find(m=>m.treeId===s.id);
    const si = b && SHOP_ITEMS.find(i=>i.id===b.itemId);
    const el = document.createElement('div');
    if(si){
      el.className = 'lm-bld' + (animId===s.id ? ' lm-new' : '');
      el.dataset.tree = s.id;
      el.title = si.name;
      el.style.left = b.x + 'px';
      el.style.top  = (b.y + 6) + 'px';
      el.innerHTML = `<svg class="lm-bld-in" width="64" height="70" viewBox="0 0 64 70" aria-hidden="true">
          <ellipse cx="32" cy="55" rx="18" ry="4" fill="#000" opacity=".25"/>
          ${SA_ART[si.id] ? `<svg class="sa" x="7" y="5" width="50" height="50" viewBox="0 0 80 80">${SA_ART[si.id]}</svg>` : `<text x="32" y="52" text-anchor="middle" font-size="40">${si.icon}</text>`}
        </svg>`;
    } else {
      el.className = 'lm-plot' + (animId===s.id ? ' lm-new' : '');
      el.dataset.tree = s.id;
      el.style.left = s.x + 'px';
      el.style.top  = s.y + 'px';
      el.innerHTML = `<div class="lm-plot-disc"></div><div class="lm-plot-plus">+</div><div class="lm-plot-lbl">Yapı Ekle</div>`;
    }
    layer.appendChild(el);
  });
}

// ── Ağaç kesme ──
function onTreeTap(el){
  if(_mapPlaceMode) return false;
  if(!lmCityOpen(+el.dataset.city)){ showToast('🔒 Önce şehri aç!'); return; }
  openTreeCutModal(el);
}

function openTreeCutModal(el){
  _lmTreeId = el.id;
  document.getElementById('lmTreeIconUse')?.setAttribute('href', el.getAttribute('href') || '#sTree');
  const enough = G.coins >= LM_CUT_COST;
  const coinsEl = document.getElementById('lmTreeCoins');
  coinsEl.textContent = enough ? `Altının: 🪙 ${G.coins}` : `Yetersiz altın — 🪙 ${G.coins} / ${LM_CUT_COST}`;
  coinsEl.classList.toggle('lm-low', !enough);
  document.getElementById('lmTreeOk').disabled = !enough;
  document.getElementById('lmTreeModal').classList.add('open');
}
function closeTreeCutModal(){
  document.getElementById('lmTreeModal').classList.remove('open');
  _lmTreeId = null;
}

function confirmTreeCut(){
  const el = _lmTreeId && document.getElementById(_lmTreeId);
  closeTreeCutModal();
  if(!el) return;
  if(G.coins < LM_CUT_COST){ showToast('🪙 Yeterli altın yok!','warning'); return; }
  G.coins -= LM_CUT_COST;
  updateCoinsUI();
  saveGame();
  const cut = lmLoad(LM_CUT_KEY);
  if(!cut.includes(el.id)){ cut.push(el.id); lmSave(LM_CUT_KEY, cut); }
  SFX.select?.();
  el.classList.add('lm-falling');
  setTimeout(()=>{
    el.classList.remove('lm-falling');
    renderLandLayer(el.id);
    showToast(`🪓 Ağaç kesildi! −🪙${LM_CUT_COST}`);
  }, 700);
}

// ── Boş arazi → envanter sheet'i ──
function onPlotTap(el){
  const treeId = el.dataset.tree;
  if(_mapPlaceMode){
    // Mevcut "haritaya yerleştir" modunda öğe seçiliyse doğrudan bu araziye koy
    if(!_mapSelectedItem) return false;
    _lmPlotId = treeId;
    const itemId = _mapSelectedItem;
    closeMapPlaceMode();
    placeLandBuilding(itemId);
    return;
  }
  openLandSheet(treeId);
}

function lmPlaceableItems(){
  const inv = getInv();
  return SHOP_ITEMS.filter(s=>(inv[s.id]||0) > 0 && s.cat !== 'booster');
}

function openLandSheet(treeId){
  _lmPlotId = treeId;
  renderLandSheet();
  document.getElementById('lmSheet').classList.add('open');
}
function closeLandSheet(){
  document.getElementById('lmSheet').classList.remove('open');
  _lmPlotId = null;
}
function renderLandSheet(){
  const grid = document.getElementById('lmSheetGrid');
  const inv = getInv();
  const items = lmPlaceableItems();
  if(!items.length){
    grid.innerHTML = `<div class="lm-empty">🛒 Önce mağazadan satın al!<br>
      <button class="lm-btn lm-btn-gold" onclick="closeLandSheet();showShopScreen();">Mağazaya Git</button></div>`;
    return;
  }
  grid.innerHTML = items.map(it=>`
    <div class="lm-card">
      <span class="lm-card-q">×${inv[it.id]}</span>
      <div class="lm-card-ic">${saArt(it,'mini',48)}</div>
      <div class="lm-card-nm">${it.name}</div>
      <button class="lm-btn lm-btn-gold" onclick="placeLandBuilding('${it.id}')">Yerleştir</button>
    </div>`).join('');
}

function placeLandBuilding(itemId){
  const treeId = _lmPlotId;
  const t = treeId && document.getElementById(treeId);
  const si = SHOP_ITEMS.find(s=>s.id===itemId);
  if(!t || !si){ closeLandSheet(); return; }
  const blds = lmLoad(LM_BLD_KEY);
  if(blds.some(b=>b.treeId===treeId)){ closeLandSheet(); showToast('Bu arazi zaten dolu!'); return; }
  if(!useInv(itemId, 1)){ showToast('Bu öğeden kalmadı!'); renderLandSheet(); return; }
  const {x, y} = lmTreePos(t);
  blds.push({treeId, itemId, x, y});
  lmSave(LM_BLD_KEY, blds);
  saveGame();
  closeLandSheet();
  renderLandLayer(treeId);
  SFX.unlock?.();
  showToast(`✦ ${si.icon} ${si.name} yerleştirildi!`);
}

// ── Yerleştirilen yapı: dokun → ipucu, uzun bas → kaldır menüsü ──
function onLandBuildingTap(el){
  if(_mapPlaceMode) return false;
  const b  = lmLoad(LM_BLD_KEY).find(m=>m.treeId===el.dataset.tree);
  const si = b && SHOP_ITEMS.find(s=>s.id===b.itemId);
  if(si) showToast(`${si.icon} ${si.name} — kaldırmak için basılı tut`);
}
function openLandMenu(el){
  if(_mapPlaceMode) return;
  const b  = lmLoad(LM_BLD_KEY).find(m=>m.treeId===el.dataset.tree);
  const si = b && SHOP_ITEMS.find(s=>s.id===b.itemId);
  if(!si) return;
  _lmMenuId = b.treeId;
  document.getElementById('lmMenuTitle').textContent = `${si.icon} ${si.name}`;
  document.getElementById('lmMenu').classList.add('open');
}
function closeLandMenu(){
  document.getElementById('lmMenu').classList.remove('open');
  _lmMenuId = null;
}
function removeLandBuilding(){
  const treeId = _lmMenuId;
  closeLandMenu();
  const blds = lmLoad(LM_BLD_KEY);
  const b = blds.find(m=>m.treeId===treeId);
  if(!b) return;
  addInv(b.itemId, 1);
  lmSave(LM_BLD_KEY, blds.filter(m=>m!==b));
  saveGame();
  renderLandLayer();
  showToast('✦ Envantere geri alındı');
}

function bindLandEvents(){
  const svg = document.getElementById('mapTerrainSvg');
  const layer = document.getElementById('landLayer');
  if(svg) lmBindTap(svg, '.map-tree', onTreeTap);
  if(layer){
    lmBindTap(layer, '.lm-plot', onPlotTap);
    lmBindTap(layer, '.lm-bld', onLandBuildingTap, openLandMenu);
  }
}

makeStars();
injectCitySilhouettes();
loadSfxPref();
// loadCityGrids kaldırıldı — veriler CURRENT_USER içinde saklanıyor
startEnergyTimer();
bindMapEvents();
bindLandEvents();
renderLandLayer();
initAuth(); // Giriş ekranını veya oyunu açar
