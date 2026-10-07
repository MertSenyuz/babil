// ══════════════════════════════════════════════
// HARİTA ZOOM SİSTEMİ
// ══════════════════════════════════════════════
const MZ = {pinch:null, hadPinch:false, praf:0, raf:0, target:MAP_ZSTART, cx:0, cy:0, idleT:0};

function mapCanvasSize(){
  const cvs = document.getElementById('mapCanvas');
  return {W:cvs.offsetWidth||430, H:cvs.offsetHeight||580};
}

// Tüm şehirleri (pinleri) ekrana sığdıran görünüm
function mapFitView(){
  const {W,H} = mapCanvasSize();
  const top = mapHudTop(H);
  const xs = PIN_POS.map(p=>p.x), ys = PIN_POS.map(p=>p.y), pad = 170;
  const x0 = Math.min(...xs)-pad, x1 = Math.max(...xs)+pad;
  const y0 = Math.min(...ys)-pad-40, y1 = Math.max(...ys)+pad;
  const sc = Math.min(W/(x1-x0), (H-top-24)/(y1-y0));
  return {s:Math.max(0.1, Math.min(MAP_ZMAX, sc)), cx:(x0+x1)/2, cy:(y0+y1)/2, top};
}
// En küçük zoom: %35, ama küçük ekranda "Tümünü Göster" görünümüne inebilsin
function mapMinScale(){ return Math.min(MAP_ZMIN, mapFitView().s); }
const mapClampScale = s => Math.max(mapMinScale(), Math.min(MAP_ZMAX, s));

// (cx,cy) = mapCanvas içindeki nokta; o noktanın altındaki harita yeri sabit kalır
function mapZoomAt(s, cx, cy, anim){
  s = mapClampScale(s);
  const mx = (cx - mapOX)/mapScale, my = (cy - mapOY)/mapScale;
  mapScale = s;
  mapOX = cx - mx*s; mapOY = cy - my*s;
  clampMap(); applyMapTr(anim); mapZoomUI();
  mapZoomIdle();
}

// Butonlar: ekran merkezine göre %15 adım
function mapZoomStep(dir){
  mapZoomStop();
  cancelAnimationFrame(mapDrag.raf);
  const {W,H} = mapCanvasSize();
  const cur = Math.round(mapScale*100)/100;
  mapZoomAt(Math.round((cur + dir*MAP_ZSTEP)*100)/100, W/2, H/2, 200);
}

// 🗺️ Tümünü göster
function mapZoomAll(){
  mapZoomStop();
  cancelAnimationFrame(mapDrag.raf);
  const {W,H} = mapCanvasSize();
  const v = mapFitView();
  mapScale = v.s;
  mapOX = W/2 - v.cx*v.s;
  mapOY = v.top + (H - v.top)/2 - v.cy*v.s;
  clampMap(); applyMapTr(400); mapZoomUI();
  mapZoomIdle();
}

// Tekerlek: hedef ölçeğe requestAnimationFrame ile yumuşak geçiş
function mapZoomSmooth(target, cx, cy){
  cancelAnimationFrame(mapDrag.raf);
  MZ.target = mapClampScale(target); MZ.cx = cx; MZ.cy = cy;
  if(MZ.raf) return;
  const step = ()=>{
    const d = MZ.target - mapScale;
    if(Math.abs(d) < 0.002){ mapZoomAt(MZ.target, MZ.cx, MZ.cy); MZ.raf = 0; return; }
    mapZoomAt(mapScale + d*0.3, MZ.cx, MZ.cy);
    MZ.raf = requestAnimationFrame(step);
  };
  MZ.raf = requestAnimationFrame(step);
}
function mapZoomStop(){
  if(MZ.raf){ cancelAnimationFrame(MZ.raf); MZ.raf = 0; }
}

// ── Pinch (iki parmak) ──
function mapPinchPts(e){
  const rect = document.getElementById('mapCanvas').getBoundingClientRect();
  const [a,b] = e.touches;
  return {d:Math.max(10, Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY)),
          mx:(a.clientX+b.clientX)/2 - rect.left, my:(a.clientY+b.clientY)/2 - rect.top};
}
function mapPinchStart(e){
  MZ.hadPinch = true;
  mapDrag.on = false; mapDrag.vx = 0; mapDrag.vy = 0;
  cancelAnimationFrame(mapDrag.raf); mapZoomStop();
  document.getElementById('mapCanvas').classList.add('dragging');
  mapMoving(true);
  const p = mapPinchPts(e);
  MZ.pinch = {d0:p.d, s0:mapScale, px:(p.mx-mapOX)/mapScale, py:(p.my-mapOY)/mapScale, cur:p};
}
function mapPinchMove(e){
  if(e.touches.length < 2) return;
  MZ.pinch.cur = mapPinchPts(e);
  if(MZ.praf) return;
  MZ.praf = requestAnimationFrame(()=>{
    MZ.praf = 0;
    const p = MZ.pinch; if(!p) return;
    // Parmakların ortasındaki harita noktası parmakların altında kalır (zoom + kaydırma birlikte)
    mapScale = mapClampScale(p.s0*p.cur.d/p.d0);
    mapOX = p.cur.mx - p.px*mapScale;
    mapOY = p.cur.my - p.py*mapScale;
    clampMap(); applyMapTrNow(); mapZoomUI();
  });
}
function mapPinchEnd(e){
  const cvs = document.getElementById('mapCanvas');
  if(e.touches.length >= 2){ MZ.pinch = null; mapPinchStart(e); return; }   // 3. parmak kalktı
  MZ.pinch = null;
  if(e.touches.length === 1){
    // Kalan parmakla sürüklemeye kesintisiz devam
    const t = e.touches[0];
    Object.assign(mapDrag, {on:true, sx:t.clientX, sy:t.clientY, sox:mapOX, soy:mapOY, vx:0, vy:0, lx:t.clientX, ly:t.clientY, lt:Date.now()});
    return;
  }
  mapDrag.on = false; mapDrag.vx = 0; mapDrag.vy = 0;
  cvs.classList.remove('dragging'); mapMoving(false);
  mapZoomIdle();
}

// Zoom durulunca haritayı yeni ölçekte keskin yeniden çizdir
function mapZoomIdle(){
  clearTimeout(MZ.idleT);
  MZ.idleT = setTimeout(()=>{
    const inner = document.getElementById('mapInner');
    inner.style.willChange = 'auto';
    requestAnimationFrame(()=>{ inner.style.willChange = ''; });
  }, 450);
}

function mapZoomUI(){
  const lvl = document.getElementById('mzLvl');
  if(!lvl) return;
  lvl.textContent = '%' + Math.round(mapScale*100);
  document.getElementById('mzIn').disabled = mapScale >= MAP_ZMAX - 0.001;
  document.getElementById('mzOut').disabled = mapScale <= mapMinScale() + 0.001;
}
