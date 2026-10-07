// ══════════════════════════════════════════════
// HARİTA ÖĞESI YERLEŞTİRME SİSTEMİ
// ══════════════════════════════════════════════
let _mapPlaceMode = false;
let _mapSelectedItem = null;

function getMapItems(){
  if(!CURRENT_USER) return [];
  if(!CURRENT_USER.mapItems) CURRENT_USER.mapItems = [];
  return CURRENT_USER.mapItems;
}

function saveMapItemsData(){
  if(!CURRENT_USER) return;
  saveUserData(CURRENT_USER);
}

function renderMapItems(){
  const layer = document.getElementById('mapItemsLayer');
  if(!layer) return;
  layer.innerHTML = '';
  const items = getMapItems();
  items.forEach((mi, idx) => {
    const si = SHOP_ITEMS.find(s=>s.id===mi.itemId);
    if(!si || (mi.civ||0)!==(G.mapCiv||0)) return;
    const el = document.createElement('div');
    el.className = 'map-item-marker';
    el.innerHTML = saArt(si,'map',34);
    el.title = si.name;
    el.style.left = mi.x + 'px';
    el.style.top  = mi.y + 'px';
    const capturedIdx = idx;
    el.addEventListener('click', e=>{
      if(_mapPlaceMode){ return; }
      e.stopPropagation();
      removeMapItem(capturedIdx);
    });
    layer.appendChild(el);
  });
}

function removeMapItem(idx){
  const items = getMapItems();
  const mi = items[idx];
  if(!mi) return;
  addInv(mi.itemId, 1);
  items.splice(idx, 1);
  saveMapItemsData();
  renderMapItems();
  _renderMppInventory();
  showToast('✦ Envantere geri alındı');
}

function openMapPlaceMode(){
  if(!CURRENT_USER){ showToast('Önce giriş yap!'); return; }
  const inv = getInv();
  const hasItems = SHOP_ITEMS.some(s=>(inv[s.id]||0)>0 && s.cat!=='booster');
  if(!hasItems){
    showToast('🛒 Önce mağazadan öğe satın al!');
    return;
  }
  _mapPlaceMode = true;
  _mapSelectedItem = null;
  const panel = document.getElementById('mapPlacePanel');
  if(panel) panel.classList.add('open');
  const bar = document.getElementById('mapPlaceModeBar');
  if(bar) bar.classList.add('show');
  const cvs = document.getElementById('mapCanvas');
  if(cvs) cvs.classList.add('place-mode');
  const btn = document.getElementById('mapPlaceBtn');
  if(btn) btn.classList.add('active');
  _renderMppInventory();
}

function closeMapPlaceMode(){
  _mapPlaceMode = false;
  _mapSelectedItem = null;
  const panel = document.getElementById('mapPlacePanel');
  if(panel) panel.classList.remove('open');
  const bar = document.getElementById('mapPlaceModeBar');
  if(bar) bar.classList.remove('show');
  const cvs = document.getElementById('mapCanvas');
  if(cvs) cvs.classList.remove('place-mode');
  const btn = document.getElementById('mapPlaceBtn');
  if(btn) btn.classList.remove('active');
}

function _renderMppInventory(){
  const wrap = document.getElementById('mppInventory');
  if(!wrap) return;
  const inv = getInv();
  const items = SHOP_ITEMS.filter(s=>(inv[s.id]||0)>0 && s.cat!=='booster');
  if(items.length===0){
    wrap.innerHTML = `<div style="padding:12px;font-size:11px;color:var(--muted);font-family:'Cinzel',serif;">
      Envanterin boş. Mağazadan öğe satın al!</div>`;
    return;
  }
  wrap.innerHTML = items.map(item=>`
    <div class="mpp-inv-item ${_mapSelectedItem===item.id?'selected':''}" onclick="selectMppItem('${item.id}')">
      <div class="mpp-art">${saArt(item,'mini',36)}</div>
      <div style="font-size:8px;color:var(--muted);font-family:'Cinzel',serif;line-height:1.2;margin-top:2px;">${item.name}</div>
      <div style="position:absolute;top:2px;right:4px;font-size:9px;font-family:'Cinzel',serif;color:var(--gold);font-weight:700;">×${inv[item.id]}</div>
    </div>
  `).join('');
}

function selectMppItem(itemId){
  _mapSelectedItem = itemId;
  // Paneli kapat, harita görünsün ve kullanıcı dokunabilsin
  const panel = document.getElementById('mapPlacePanel');
  if(panel) panel.classList.remove('open');
  const bar = document.getElementById('mapPlaceModeBar');
  if(bar) bar.classList.add('show');
  const si = SHOP_ITEMS.find(s=>s.id===itemId);
  if(si) showToast(`${si.icon} Seçildi — haritaya dokun`);
}

function placeItemOnMap(mapX, mapY){
  if(!_mapSelectedItem){
    showToast('Önce bir öğe seç!');
    return;
  }
  const inv = getInv();
  if(!(inv[_mapSelectedItem]>0)){
    showToast('Bu öğeden kalmadı!');
    _mapSelectedItem = null;
    _renderMppInventory();
    return;
  }
  const si = SHOP_ITEMS.find(s=>s.id===_mapSelectedItem);
  useInv(_mapSelectedItem, 1);
  const items = getMapItems();
  items.push({itemId:_mapSelectedItem, x:Math.round(mapX), y:Math.round(mapY), civ:G.mapCiv||0});
  saveMapItemsData();
  renderMapItems();
  if(si) showToast(`${si.icon} Haritaya yerleştirildi!`);
  // Yerleştirme bitti — modu tamamen kapat
  closeMapPlaceMode();
}
