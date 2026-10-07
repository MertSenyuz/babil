// ══════════════════════════════════════════════
// SÜRÜKLENEBILIR HARİTA — FOG OF WAR
// ══════════════════════════════════════════════

// Building pin positions on 1400x1400 map
const PIN_POS = [
  {id:0, x:1000, y:920},  // Babil Kulesi — center
  {id:1, x:1485, y:455},  // Asma Bahçeler — NE
  {id:2, x:1000, y:1440}, // Ishtar Kapısı — S
  {id:3, x:430,  y:470},  // Ziggurat — NW
  {id:4, x:1615, y:955},  // Bereketli Nehir — E
  {id:5, x:360,  y:1270}, // Pazar Meydanı — SW
];

// Fog zone index → unlockStars mapping
const FOG_STARS = [6, 9, 15, 21, 27]; // fz1..fz5

const MAP_W = 2000, MAP_H = 2000;
let mapOX = 0, mapOY = 0;
let mapScale = 0.65;                                  // harita yakınlaştırma oranı
const MAP_ZSTART = 0.65, MAP_ZMIN = 0.35, MAP_ZMAX = 1.2, MAP_ZSTEP = 0.15;
let mapDrag = {on:false, sx:0, sy:0, sox:0, soy:0, vx:0, vy:0, lx:0, ly:0, lt:0, raf:null};

const mapView = {W:430, H:580};                       // son ölçülen tuval boyutu (rAF içinde layout okumamak için)
function clampMap(){
  const cvs = document.getElementById('mapCanvas');
  const W = cvs.offsetWidth || 430;
  const H = cvs.offsetHeight || 580;
  mapView.W = W; mapView.H = H;
  // Sınırlar ölçeğe göre: harita ekrandan küçükse ortala, büyükse kenarlardan en fazla 60px boşluk
  const mw = MAP_W*mapScale, mh = MAP_H*mapScale, pad = 60;
  mapOX = mw + pad*2 <= W ? (W - mw)/2 : Math.min(pad, Math.max(W - mw - pad, mapOX));
  if(mh + pad*2 <= H){
    const top = mapHudTop(H);                              // sığıyorsa üst HUD'un altındaki alana ortala
    mapOY = mh + top <= H ? top + (H - top - mh)/2 : (H - mh)/2;
  } else mapOY = Math.min(pad, Math.max(H - mh - pad, mapOY));
}
function mapHudTop(H){
  const hud = document.querySelector('#mapScreen .map-hud');
  return Math.min(H*0.3, hud ? hud.offsetHeight : 90);
}

// anim: ms cinsinden geçiş süresi (0/boş → sonraki karede, geçişsiz; sürükleme ve pinch için)
// Geçişsiz çağrılar requestAnimationFrame ile birleştirilir: bir karede kaç move olayı gelirse gelsin tek yazım (≤60fps)
let mapTrRaf = 0, mapTrTransition = '';
function applyMapTr(anim){
  if(anim){ applyMapTrNow(anim); return; }
  if(mapTrRaf) return;
  mapTrRaf = requestAnimationFrame(()=>{ mapTrRaf = 0; writeMapTr(); });
}
// Zaten rAF içindeyken (momentum, pinch) bir kare gecikmeden hemen yaz
function applyMapTrNow(anim){
  if(mapTrRaf){ cancelAnimationFrame(mapTrRaf); mapTrRaf = 0; }
  writeMapTr(anim);
}
function writeMapTr(anim){
  const inner = document.getElementById('mapInner');
  const tr = anim ? `transform ${anim/1000}s ease` : 'none';
  if(tr !== mapTrTransition){ inner.style.transition = tr; mapTrTransition = tr; }
  inner.style.transform = `translate3d(${mapOX}px,${mapOY}px,0) scale(${mapScale})`;
  // Animasyonlu geçişte önce yalnızca göster, gizlemeyi geçiş bitince yap (yolda görünen sis kaybolmasın)
  clearTimeout(mapFogT);
  mapCullFog(!!anim);
  if(anim) mapFogT = setTimeout(()=>mapCullFog(), anim + 30);
}

// Ekran dışında kalan sis bölgelerini gizle (bulanık, animasyonlu bulutları boşuna çizmemek için)
let mapFogBoxes = null, mapFogT = 0;
function mapCullFog(showOnly){
  if(!mapFogBoxes) mapFogBoxes = [...document.querySelectorAll('#mapInner .fog-zone')].map(el=>({
    el, x:parseFloat(el.style.left)||0, y:parseFloat(el.style.top)||0,
    w:parseFloat(el.style.width)||0, h:parseFloat(el.style.height)||0, off:false}));
  const m = 120, W = mapView.W, H = mapView.H;          // kenar payı: bulutlar bölgeden taşar
  for(const f of mapFogBoxes){
    const x0 = mapOX + f.x*mapScale, y0 = mapOY + f.y*mapScale;
    const off = x0 > W+m || y0 > H+m || x0 + f.w*mapScale < -m || y0 + f.h*mapScale < -m;
    if(off !== f.off && !(off && showOnly)){ f.off = off; f.el.classList.toggle('fz-off', off); }
  }
}

// Gerçek kaydırma sırasında pahalı efektleri dondur (CSS: #mapCanvas.map-moving)
function mapMoving(on){
  const cvs = document.getElementById('mapCanvas');
  if(cvs && cvs.classList.contains('map-moving') !== on) cvs.classList.toggle('map-moving', on);
}
const MAP_MOVE_PX = 6;                                // bundan az kayma = dokunma/tıklama
function mapDragMoved(x, y){ return Math.abs(x-mapDrag.sx) + Math.abs(y-mapDrag.sy) > MAP_MOVE_PX; }

function initMapPos(){
  const cvs = document.getElementById('mapCanvas');
  const W = cvs.offsetWidth || 430;
  const H = cvs.offsetHeight || 580;
  mapZoomStop();
  mapScale = Math.max(mapMinScale(), MAP_ZSTART);
  // Şehir merkezi (Babil Kulesi) ekranın ortasında
  const c = PIN_POS[0];
  mapOX = W/2 - c.x*mapScale;
  mapOY = H/2 - c.y*mapScale;
  clampMap();
  applyMapTr();
  mapZoomUI();
}

function bindMapEvents(){
  const cvs = document.getElementById('mapCanvas');
  // Touch
  cvs.addEventListener('touchstart', e=>{
    e.preventDefault();
    if(e.touches.length===1) MZ.hadPinch=false;        // yeni hareket başladı
    if(e.touches.length>=2){ mapPinchStart(e); return; }
    mapZoomStop();
    const t = e.touches[0];
    mapDrag.on=true; mapDrag.sx=t.clientX; mapDrag.sy=t.clientY;
    mapDrag.sox=mapOX; mapDrag.soy=mapOY;
    mapDrag.vx=0; mapDrag.vy=0;
    mapDrag.lx=t.clientX; mapDrag.ly=t.clientY; mapDrag.lt=Date.now();
    cancelAnimationFrame(mapDrag.raf); mapMoving(false);
    cvs.classList.add('dragging');
  },{passive:false});
  // touch-action:none + touchstart'taki preventDefault kaydırmayı zaten engeller → touchmove pasif (tarayıcı JS'i beklemez)
  cvs.addEventListener('touchmove', e=>{
    if(MZ.pinch){ mapPinchMove(e); return; }
    if(!mapDrag.on) return;
    const t = e.touches[0];
    if(mapDragMoved(t.clientX, t.clientY)) mapMoving(true);
    const now=Date.now(); const dt=Math.max(1,now-mapDrag.lt);
    mapDrag.vx=(t.clientX-mapDrag.lx)/dt*16;
    mapDrag.vy=(t.clientY-mapDrag.ly)/dt*16;
    mapDrag.lx=t.clientX; mapDrag.ly=t.clientY; mapDrag.lt=now;
    mapOX = mapDrag.sox+(t.clientX-mapDrag.sx);
    mapOY = mapDrag.soy+(t.clientY-mapDrag.sy);
    clampMap(); applyMapTr();
  },{passive:true});
  cvs.addEventListener('touchend', e=>{
    if(MZ.hadPinch){ mapPinchEnd(e); return; }         // pinch sonrası: yerleştirme/dokunma/momentum yok
    mapDrag.on=false; cvs.classList.remove('dragging');
    // Placement mode: if tap (no drag), place item
    const totalDrag = Math.abs(mapDrag.sx - (e.changedTouches[0]?.clientX||mapDrag.sx)) +
                      Math.abs(mapDrag.sy - (e.changedTouches[0]?.clientY||mapDrag.sy));
    if(_mapPlaceMode && totalDrag < 8 && e.changedTouches[0]){
      const t = e.changedTouches[0];
      const rect = cvs.getBoundingClientRect();
      const mapX = (t.clientX - rect.left - mapOX)/mapScale;
      const mapY = (t.clientY - rect.top  - mapOY)/mapScale;
      mapMoving(false);
      placeItemOnMap(mapX, mapY);
      return;
    }
    if(totalDrag < 8) closePinPopup();
    const momentum=()=>{
      mapDrag.vx*=0.90; mapDrag.vy*=0.90;
      if(Math.abs(mapDrag.vx)<0.25&&Math.abs(mapDrag.vy)<0.25){ mapMoving(false); return; }
      mapOX+=mapDrag.vx; mapOY+=mapDrag.vy;
      clampMap(); applyMapTrNow();
      mapDrag.raf=requestAnimationFrame(momentum);
    };
    mapDrag.raf=requestAnimationFrame(momentum);
  });
  // Mouse
  cvs.addEventListener('mousedown', e=>{
    mapZoomStop();
    mapDrag.on=true; mapDrag.sx=e.clientX; mapDrag.sy=e.clientY;
    mapDrag.sox=mapOX; mapDrag.soy=mapOY; mapDrag.vx=0; mapDrag.vy=0;
    mapDrag.lx=e.clientX; mapDrag.ly=e.clientY; mapDrag.lt=Date.now();
    cancelAnimationFrame(mapDrag.raf); mapMoving(false); cvs.classList.add('dragging');
  });
  window.addEventListener('mousemove', e=>{
    if(!mapDrag.on) return;
    if(mapDragMoved(e.clientX, e.clientY)) mapMoving(true);
    const now=Date.now(); const dt=Math.max(1,now-mapDrag.lt);
    mapDrag.vx=(e.clientX-mapDrag.lx)/dt*16;
    mapDrag.vy=(e.clientY-mapDrag.ly)/dt*16;
    mapDrag.lx=e.clientX; mapDrag.ly=e.clientY; mapDrag.lt=now;
    mapOX=mapDrag.sox+(e.clientX-mapDrag.sx);
    mapOY=mapDrag.soy+(e.clientY-mapDrag.sy);
    clampMap(); applyMapTr();
  });
  window.addEventListener('mouseup', e=>{
    if(!mapDrag.on) return;
    mapDrag.on=false; cvs.classList.remove('dragging');
    // Placement mode: if click (no drag), place item
    const totalDrag = Math.abs(mapDrag.sx - e.clientX) + Math.abs(mapDrag.sy - e.clientY);
    if(_mapPlaceMode && totalDrag < 6){
      const rect = cvs.getBoundingClientRect();
      const mapX = (e.clientX - rect.left - mapOX)/mapScale;
      const mapY = (e.clientY - rect.top  - mapOY)/mapScale;
      mapMoving(false);
      placeItemOnMap(mapX, mapY);
      return;
    }
    if(totalDrag < 6) closePinPopup();
    const momentum=()=>{
      mapDrag.vx*=0.88; mapDrag.vy*=0.88;
      if(Math.abs(mapDrag.vx)<0.2&&Math.abs(mapDrag.vy)<0.2){ mapMoving(false); return; }
      mapOX+=mapDrag.vx; mapOY+=mapDrag.vy;
      clampMap(); applyMapTrNow();
      mapDrag.raf=requestAnimationFrame(momentum);
    };
    mapDrag.raf=requestAnimationFrame(momentum);
  });
  // Fare tekerleği / trackpad (Ctrl+kaydırma dahil): imlecin altındaki nokta sabit kalır
  cvs.addEventListener('wheel', e=>{
    e.preventDefault();
    const rect = cvs.getBoundingClientRect();
    const dy = e.deltaY*(e.deltaMode===1 ? 16 : e.deltaMode===2 ? rect.height : 1);
    const k = e.ctrlKey ? 0.004 : 0.0016;              // trackpad sıkıştırması (Ctrl) küçük değerler yollar
    const base = MZ.raf ? MZ.target : mapScale;
    mapZoomSmooth(base*Math.exp(-Math.max(-120,Math.min(120,dy))*k), e.clientX-rect.left, e.clientY-rect.top);
  },{passive:false});
  window.addEventListener('resize', ()=>{
    if(!document.getElementById('mapScreen')?.classList.contains('active')) return;
    mapScale = Math.max(mapMinScale(), Math.min(MAP_ZMAX, mapScale));
    clampMap(); applyMapTr(); mapZoomUI();
  });
}
