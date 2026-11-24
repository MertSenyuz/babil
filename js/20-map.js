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

// ══════════════════════════════════════════════
// MEDENİYET HARİTALARI — renderMapTerrain()
// Babil (0): index.html'deki el yapımı harita (#terrBase; ağaç kesme sistemi buna bağlı).
// Diğer dönemler: aynı 2000×2000 alanda tohumlu (her açılışta aynı) piksel-art harita.
// Pinler (PIN_POS), sis bölgeleri ve arazi katmanı her dönemde aynı yerde kalır; yapılar pinlerin üstüne gelmez.
// Geçiş: yeni harita eskisinin üstünde 1s'de belirir, sonra eskisi kaldırılır (05-map.css → terrIn/terrOut).
// ══════════════════════════════════════════════
const TR_T = 40, trSnap = v=>Math.round(v/TR_T)*TR_T;
let _terrCiv = null;
function terrRng(seed){
  return ()=>{ seed = seed+0x6D2B79F5|0; let t = Math.imul(seed^seed>>>15, 1|seed);
    t = t+Math.imul(t^t>>>7, 61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
}
// Basamaklı (piksel) leke: satır satır sol/sağ kenar, rastgele yürüyüşle dalgalanır
function terrBlob(r, cx, cy, rx, ry, wob=.15, pw=2){   // pw>2 → köşeleri dolgun, kareye yakın
  const rows = []; let nl = 0, nr = 0;
  for(let y=trSnap(cy-ry); y<cy+ry; y+=TR_T){
    const dy = (y+TR_T/2-cy)/ry; if(Math.abs(dy)>=1) continue;
    const w = rx*Math.pow(1-Math.pow(Math.abs(dy), pw), 1/pw);
    nl = Math.max(-wob, Math.min(wob, nl+(r()-.5)*wob)); nr = Math.max(-wob, Math.min(wob, nr+(r()-.5)*wob));
    const xl = trSnap(cx-w*(1+nl)), xr = trSnap(cx+w*(1+nr));
    if(xr-xl>=TR_T) rows.push({y, xl, xr});
  }
  let d = '';
  rows.forEach((o,i)=>{ d += (i?'L':'M')+o.xr+','+o.y+'L'+o.xr+','+(o.y+TR_T); });
  for(let i=rows.length-1; i>=0; i--){ const o = rows[i]; d += 'L'+o.xl+','+(o.y+TR_T)+'L'+o.xl+','+o.y; }
  return {d:d+'Z', rows, x0:cx-rx*1.3, x1:cx+rx*1.3, y0:cy-ry, y1:cy+ry,
    has:(x,y)=>rows.some(o=>y>=o.y && y<o.y+TR_T && x>=o.xl && x<=o.xr)};
}
// Çizgiyi ızgaraya oturtup yatay/dikey basamaklara çevirir (nehir, yol, kanal)
function terrStairs(pts){
  let d = '', px, py;
  for(let i=0; i<pts.length-1; i++){
    const [x0,y0] = pts[i], [x1,y1] = pts[i+1], n = Math.max(1, Math.ceil(Math.hypot(x1-x0, y1-y0)/TR_T));
    for(let k=i?1:0; k<=n; k++){
      const x = trSnap(x0+(x1-x0)*k/n), y = trSnap(y0+(y1-y0)*k/n);
      if(px===undefined) d = 'M'+x+','+y;
      else if(x!==px || y!==py) d += 'L'+x+','+py+'L'+x+','+y;
      px = x; py = y;
    }
  }
  return d;
}
// Çizgi boyunca eşit aralıklı noktalar (+ normal yönünde kaydırma)
function terrAlong(pts, step, off=0){
  const res = [];
  for(let i=0; i<pts.length-1; i++){
    const [x0,y0] = pts[i], [x1,y1] = pts[i+1], L = Math.hypot(x1-x0, y1-y0), nx = -(y1-y0)/L, ny = (x1-x0)/L;
    for(let s=0; s<L; s+=step){ const t = s/L; res.push([x0+(x1-x0)*t+nx*off, y0+(y1-y0)*t+ny*off]); }
  }
  return res;
}

// Dönemlere özgü küçük yapılar (taban ortası = 0,0; mevcut sMtn/sTree gibi kullanılır)
const TR_SPRITES = (()=>{
  const sh = (rx, ry=Math.round(rx/5))=>`<ellipse cx="2" cy="2" rx="${rx}" ry="${ry}" fill="#000" opacity=".25"/>`;
  const dome = (x0, x1, y, fill)=>`<path d="M${x0},${y} A${(x1-x0)/2},${(x1-x0)/2} 0 0 1 ${x1},${y}Z" fill="${fill}"/>`;
  return `
  <g id="ctCastle">${sh(42)}<rect x="-30" y="-34" width="60" height="34" fill="#9a8662"/><rect x="14" y="-34" width="16" height="34" fill="#7a6a4a"/>
    <rect x="-40" y="-56" width="18" height="56" fill="#a8946c"/><rect x="22" y="-56" width="18" height="56" fill="#8a7656"/>
    <rect x="-40" y="-62" width="6" height="6" fill="#a8946c"/><rect x="-28" y="-62" width="6" height="6" fill="#a8946c"/>
    <rect x="22" y="-62" width="6" height="6" fill="#8a7656"/><rect x="34" y="-62" width="6" height="6" fill="#8a7656"/>
    <rect x="-18" y="-40" width="6" height="6" fill="#9a8662"/><rect x="-6" y="-40" width="6" height="6" fill="#9a8662"/><rect x="6" y="-40" width="6" height="6" fill="#9a8662"/>
    <rect x="-7" y="-18" width="14" height="18" fill="#3a2a1a"/><rect x="-33" y="-46" width="4" height="8" fill="#3a2a1a"/><rect x="29" y="-46" width="4" height="8" fill="#2a1a10"/>
    <rect x="-32" y="-82" width="2" height="20" fill="#4a3828"/><rect x="-30" y="-82" width="12" height="7" fill="currentColor"/></g>
  <g id="ctTemple">${sh(46,7)}<rect x="-42" y="-8" width="84" height="8" fill="#c8c0b0"/><rect x="-38" y="-12" width="76" height="4" fill="#e0d8c8"/>
    ${[-32,-14,4,22].map(x=>`<rect x="${x}" y="-46" width="10" height="34" fill="#ece6da"/><rect x="${x+7}" y="-46" width="3" height="34" fill="#c8c0b0"/>`).join('')}
    <rect x="-38" y="-52" width="76" height="6" fill="#e0d8c8"/><rect x="-38" y="-50" width="76" height="2" fill="currentColor"/><polygon points="-40,-52 0,-70 40,-52" fill="#ece6da"/><polygon points="-28,-54 0,-65 28,-54" fill="#c8c0b0"/></g>
  <g id="ctCol"><ellipse cx="8" cy="1" rx="18" ry="4" fill="#000" opacity=".22"/><rect x="-8" y="-4" width="16" height="4" fill="#c8c0b0"/>
    <rect x="-5" y="-30" width="10" height="26" fill="#ece6da"/><rect x="2" y="-30" width="3" height="26" fill="#c8c0b0"/><rect x="-7" y="-34" width="14" height="4" fill="#e0d8c8"/>
    <rect x="8" y="-6" width="18" height="6" fill="#d8d0c0"/></g>
  <g id="ctShip"><rect x="-26" y="3" width="52" height="3" fill="#bfe0ff" opacity=".5"/><polygon points="-30,-10 30,-10 22,2 -22,2" fill="#6a4a18"/>
    <rect x="-30" y="-12" width="60" height="3" fill="#8a6a2a"/><rect x="-1" y="-52" width="3" height="42" fill="#4a3828"/>
    <polygon points="3,-50 22,-28 3,-22" fill="#f0ead8"/><rect x="3" y="-38" width="10" height="4" fill="currentColor"/><polygon points="-2,-46 -18,-24 -2,-20" fill="#d8d0b8"/></g>
  <g id="ctLight"><circle cy="-76" r="26" fill="url(#lavaGlow)" opacity=".6"/>${sh(18,4)}<rect x="-14" y="-24" width="28" height="24" fill="#d8d0c0"/>
    <rect x="-10" y="-52" width="20" height="28" fill="#e8e2d6"/><rect x="-7" y="-70" width="14" height="18" fill="#d8d0c0"/><rect x="5" y="-52" width="5" height="28" fill="#c8c0b0"/>
    <rect x="-5" y="-80" width="10" height="10" fill="#ff9a30"/><rect x="-2" y="-78" width="4" height="6" fill="#ffe070"/></g>
  <g id="ctDome">${sh(26,6)}<rect x="-20" y="-24" width="40" height="24" fill="#b89a6a"/><rect x="8" y="-24" width="12" height="24" fill="#9a7e52"/>
    ${dome(-16,16,-24,'#c8aa78')}<rect x="-20" y="-24" width="40" height="3" fill="currentColor"/><rect x="-1" y="-46" width="2" height="6" fill="#7a5a2a"/><rect x="-5" y="-12" width="8" height="12" fill="#3a2a1a"/></g>
  <g id="ctFire"><circle cy="-46" r="36" fill="url(#lavaGlow)" opacity=".7"/>${sh(28,6)}<rect x="-24" y="-30" width="48" height="30" fill="#b8a07a"/><rect x="10" y="-30" width="14" height="30" fill="#96805c"/>
    <path d="M-16,0 V-14 A6,6 0 0 1 -4,-14 V0Z" fill="#3a2a1a"/><path d="M4,0 V-14 A6,6 0 0 1 16,-14 V0Z" fill="#2a1a10"/>
    <path d="M-26,-30 A26,14 0 0 1 26,-30Z" fill="#c8b088"/><polygon points="-7,-43 0,-64 7,-43" fill="#ff9a30"/><polygon points="-3,-43 0,-54 3,-43" fill="#ffe070"/></g>
  <g id="ctArch">${sh(58,8)}<rect x="-54" y="-66" width="108" height="66" fill="#b8a07a"/><rect x="30" y="-66" width="24" height="66" fill="#9a845e"/>
    <path d="M-22,0 V-30 A22,26 0 0 1 22,-30 V0Z" fill="#3a2a1a"/>
    ${[-48,-38,32,42].map(x=>`<rect x="${x}" y="-56" width="6" height="12" fill="#3a2a1a"/><rect x="${x}" y="-32" width="6" height="12" fill="#3a2a1a"/>`).join('')}</g>
  <g id="ctCamel"><ellipse cy="1" rx="14" ry="3" fill="#000" opacity=".22"/>
    ${[-12,-5,4,9].map(x=>`<rect x="${x}" y="-10" width="3" height="10" fill="#8a6a3a"/>`).join('')}
    <rect x="-14" y="-18" width="26" height="9" fill="#b08850"/><rect x="-8" y="-24" width="10" height="6" fill="#b08850"/>
    <rect x="12" y="-28" width="4" height="14" fill="#b08850"/><rect x="12" y="-31" width="9" height="5" fill="#b08850"/><rect x="-11" y="-20" width="7" height="4" fill="currentColor"/></g>
  <g id="ctMinaret"><ellipse cy="1" rx="10" ry="3" fill="#000" opacity=".22"/><rect x="-6" y="-60" width="12" height="60" fill="#e0d4b8"/><rect x="2" y="-60" width="4" height="60" fill="#c0b090"/>
    <rect x="-9" y="-46" width="18" height="4" fill="#c0b090"/><polygon points="-6,-60 0,-76 6,-60" fill="currentColor"/><rect x="-1" y="-82" width="2" height="6" fill="#f5c842"/></g>
  <g id="ctMosqueS">${sh(32,6)}<rect x="-24" y="-22" width="40" height="22" fill="#e0d0a8"/><rect x="6" y="-22" width="10" height="22" fill="#c0ae86"/>
    ${dome(-18,10,-22,'currentColor')}<rect x="-5" y="-12" width="8" height="12" fill="#3a2a1a"/>
    <rect x="18" y="-50" width="8" height="50" fill="#e0d0a8"/><polygon points="18,-50 22,-60 26,-50" fill="currentColor"/></g>
  <g id="ctMosque">${sh(52,8)}<rect x="-36" y="-26" width="72" height="26" fill="#e6dcc6"/><rect x="18" y="-26" width="18" height="26" fill="#c8bca2"/>
    ${dome(-30,-10,-26,'#8a96a0')}${dome(10,30,-26,'#7a8690')}<rect x="-18" y="-34" width="36" height="8" fill="#e6dcc6"/>
    ${dome(-20,20,-34,'#9aa6b0')}<rect x="-1" y="-62" width="2" height="8" fill="#f5c842"/><rect x="-6" y="-14" width="12" height="14" fill="#3a2a1a"/>
    ${[-48,41].map(x=>`<rect x="${x}" y="-80" width="7" height="80" fill="#eee6d2"/><polygon points="${x},-80 ${x+3.5},-98 ${x+7},-80" fill="#8a96a0"/><rect x="${x-2}" y="-58" width="11" height="3" fill="#c8bca2"/>`).join('')}</g>
  <g id="ctBazaar">${sh(50,7)}<rect x="-46" y="-22" width="92" height="22" fill="#c8a878"/><rect x="-46" y="-6" width="92" height="6" fill="#a88858"/>
    ${[-36,-18,0,18,36].map(x=>dome(x-8,x+8,-22,'#8a96a0')+`<rect x="${x-4}" y="-16" width="8" height="12" fill="#3a2a1a"/>`).join('')}</g>
  <g id="ctStall"><ellipse cy="1" rx="16" ry="4" fill="#000" opacity=".22"/><rect x="-14" y="-24" width="2" height="24" fill="#4a3828"/><rect x="12" y="-24" width="2" height="24" fill="#4a3828"/>
    <rect x="-14" y="-10" width="28" height="6" fill="#8a6a2a"/><rect x="-10" y="-14" width="5" height="4" fill="#e05a3a"/><rect x="-3" y="-14" width="5" height="4" fill="#f5c842"/><rect x="4" y="-14" width="5" height="4" fill="#6a9a3a"/>
    ${[0,1,2,3].map(i=>`<rect x="${-16+i*8}" y="-30" width="8" height="8" fill="${i%2?'#f0ead8':'currentColor'}"/>`).join('')}</g>
  <g id="ctLibrary">${sh(48,7)}<rect x="-42" y="-30" width="84" height="30" fill="#d8c498"/><rect x="24" y="-30" width="18" height="30" fill="#b8a478"/>
    ${[-34,-20,-6,8].map(x=>`<path d="M${x},0 V-14 A5,5 0 0 1 ${x+10},-14 V0Z" fill="#3a2a1a"/>`).join('')}
    <rect x="-44" y="-34" width="88" height="4" fill="currentColor"/>${dome(-16,16,-34,'currentColor')}<rect x="-1" y="-56" width="2" height="6" fill="#f5c842"/>
    <rect x="-6" y="-26" width="12" height="8" fill="#f0ead8"/><rect x="-1" y="-26" width="2" height="8" fill="#8a6a2a"/></g>
  <g id="ctYurt"><ellipse cy="1" rx="22" ry="5" fill="#000" opacity=".25"/><rect x="-20" y="-16" width="40" height="16" fill="#e8e0cc"/><rect x="8" y="-16" width="12" height="16" fill="#c8bea8"/>
    <path d="M-22,-16 Q0,-38 22,-16Z" fill="#d8ceb8"/><rect x="-20" y="-12" width="40" height="3" fill="currentColor"/><rect x="-5" y="-12" width="10" height="12" fill="#a83a2a"/><rect x="-3" y="-30" width="6" height="4" fill="#6a5040"/></g>
  <g id="ctRuin"><ellipse cy="1" rx="24" ry="5" fill="#000" opacity=".22"/><rect x="-20" y="-18" width="10" height="18" fill="#8a7a62"/><rect x="-20" y="-24" width="6" height="6" fill="#8a7a62"/>
    <rect x="-10" y="-10" width="16" height="10" fill="#7a6a52"/><rect x="8" y="-14" width="10" height="14" fill="#8a7a62"/><rect x="-6" y="-4" width="10" height="4" fill="#2a2420"/></g>
  <g id="ctGrass"><rect x="-4" y="-8" width="2" height="8" fill="#6a7a28"/><rect x="0" y="-11" width="2" height="11" fill="#7a8a30"/><rect x="4" y="-7" width="2" height="7" fill="#5a6a20"/></g>
  <pattern id="trMarble" width="80" height="80" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="40" height="40" fill="#fff" opacity=".12"/><rect x="40" y="40" width="40" height="40" fill="#fff" opacity=".12"/>
    <rect x="0" y="39" width="80" height="2" fill="#8a8070" opacity=".18"/><rect x="39" y="0" width="2" height="80" fill="#8a8070" opacity=".18"/></pattern>
  <pattern id="trOasis" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#3a9ac8"/>
    <rect x="8" y="12" width="14" height="3" fill="#bfe8ff" opacity=".7"/><rect x="36" y="40" width="16" height="3" fill="#bfe8ff" opacity=".6"/><rect x="30" y="20" width="4" height="4" fill="#2a7aa8"/></pattern>
  <g id="ctWave"><path d="M-12,0 q6,-7 12,0 q6,-7 12,0" stroke="#d8f0ff" stroke-width="3" fill="none" opacity=".75"/></g>
  ${(()=>{ const L = '-52,0 -52,-8 -47,-8 -47,-17 -43,-17 -43,-25 -38,-25 -38,-33 -33,-33 -33,-42 -28,-42 -28,-50 -24,-50 -24,-59 -19,-59 -19,-67 -14,-67 -14,-75 -9,-75 -9,-84 -5,-84 -5,-92 0,-92',
      Rh = '0,0 0,-92 5,-92 5,-84 9,-84 9,-75 14,-75 14,-67 19,-67 19,-59 24,-59 24,-50 28,-50 28,-42 33,-42 33,-33 38,-33 38,-25 43,-25 43,-17 47,-17 47,-8 52,-8 52,0',
      full = L+' 5,-92 5,-84 9,-84 9,-75 14,-75 14,-67 19,-67 19,-59 24,-59 24,-50 28,-50 28,-42 33,-42 33,-33 38,-33 38,-25 43,-25 43,-17 47,-17 47,-8 52,-8 52,0';
    const mt = (id, lt, dk, ed, snow)=>`<g id="${id}"><ellipse cx="4" cy="2" rx="52" ry="9" fill="#000" opacity=".25"/><polygon points="${full}" fill="${lt}"/><polygon points="${Rh}" fill="${dk}"/>
      <polygon points="${full}" fill="none" stroke="${ed}" stroke-width="2"/><rect x="-22" y="-40" width="8" height="8" fill="${lt}" opacity=".6"/><rect x="-30" y="-22" width="8" height="8" fill="${dk}" opacity=".5"/>
      ${snow?`<polygon points="-14,-67 -14,-75 -9,-75 -9,-84 -5,-84 -5,-92 5,-92 5,-84 9,-84 9,-75 14,-75 14,-67 8,-64 0,-68 -8,-63" fill="#f0eae0"/><polygon points="0,-68 0,-92 5,-92 5,-84 9,-84 9,-75 14,-75 14,-67 8,-64" fill="#c8c0b4"/>`:''}</g>`;
    return mt('ctMtnR','#a8643a','#7a4428','#4a2818',false)+mt('ctMtnRS','#a8643a','#7a4428','#4a2818',true)+mt('ctMtnG','#8a8478','#64605a','#3a3834',true); })()}
  <g id="ctPCol"><ellipse cx="4" cy="1" rx="14" ry="4" fill="#000" opacity=".25"/><rect x="-8" y="-4" width="16" height="4" fill="#a8885a"/>
    <rect x="-4" y="-66" width="8" height="62" fill="#d8b880"/><rect x="1" y="-66" width="3" height="62" fill="#b0905a"/>
    <rect x="-12" y="-74" width="24" height="8" fill="#8a5a2a"/><rect x="-14" y="-78" width="5" height="5" fill="#8a5a2a"/><rect x="9" y="-78" width="5" height="5" fill="#8a5a2a"/><rect x="-3" y="-72" width="6" height="3" fill="#f5c842"/></g>
  <g id="ctPColB"><ellipse cx="4" cy="1" rx="14" ry="4" fill="#000" opacity=".25"/><rect x="-8" y="-4" width="16" height="4" fill="#a8885a"/>
    <rect x="-4" y="-30" width="8" height="26" fill="#d8b880"/><rect x="1" y="-30" width="3" height="26" fill="#b0905a"/><polygon points="-4,-30 0,-36 4,-30" fill="#d8b880"/><rect x="8" y="-6" width="18" height="6" fill="#c8a870"/></g>
  <g id="ctRider"><ellipse cx="0" cy="1" rx="18" ry="4" fill="#000" opacity=".25"/>
    <circle cx="-24" cy="-5" r="6" fill="#e0c890" opacity=".55"/><circle cx="-33" cy="-8" r="5" fill="#e0c890" opacity=".4"/><circle cx="-41" cy="-4" r="4" fill="#e0c890" opacity=".28"/>
    <polygon points="-11,-10 -20,-2 -17,0 -7,-9" fill="#5a3418"/><polygon points="7,-10 17,-3 19,-6 10,-12" fill="#5a3418"/>
    <rect x="-13" y="-19" width="24" height="10" fill="#7a4a2a"/><rect x="8" y="-26" width="6" height="11" fill="#7a4a2a"/><rect x="10" y="-29" width="11" height="5" fill="#7a4a2a"/>
    <rect x="7" y="-27" width="3" height="9" fill="#2a1a0a"/><polygon points="-13,-18 -22,-13 -14,-13" fill="#2a1a0a"/>
    <rect x="-4" y="-31" width="8" height="12" fill="currentColor"/><rect x="-3" y="-37" width="6" height="6" fill="#d8a878"/><rect x="-4" y="-39" width="8" height="3" fill="#3a2a1a"/>
    <path d="M6,-40 A10,12 0 0 1 6,-18" stroke="#4a3020" stroke-width="2" fill="none"/></g>
  <g id="ctHorse"><ellipse cx="0" cy="1" rx="14" ry="3" fill="#000" opacity=".22"/>${[-11,-6,4,8].map(x=>`<rect x="${x}" y="-8" width="3" height="8" fill="#6a4020"/>`).join('')}
    <rect x="-12" y="-17" width="24" height="9" fill="#8a5a30"/><rect x="10" y="-15" width="5" height="10" fill="#8a5a30"/><rect x="12" y="-7" width="6" height="5" fill="#8a5a30"/><polygon points="-12,-16 -17,-8 -12,-10" fill="#3a2a1a"/></g>
  <g id="ctDune"><ellipse cx="4" cy="2" rx="44" ry="6" fill="#000" opacity=".12"/><path d="M-44,0 Q-14,-30 34,-8 Q40,-4 44,0Z" fill="#e8c878"/><path d="M34,-8 Q40,-4 44,0 L-44,0 Q-6,-10 34,-8Z" fill="#b8904a"/>
    <path d="M-30,-6 Q-10,-20 20,-10" stroke="#f8e0a0" stroke-width="2" fill="none"/></g>
  <g id="ctDomeB"><ellipse cx="2" cy="2" rx="24" ry="5" fill="#000" opacity=".22"/><rect x="-18" y="-22" width="36" height="22" fill="#e0d0a8"/><rect x="8" y="-22" width="10" height="22" fill="#c0ae86"/>
    <path d="M-15,-22 A15,15 0 0 1 15,-22Z" fill="#2a6aaa"/><path d="M-11,-24 A11,11 0 0 1 -2,-34" stroke="#7ab0e0" stroke-width="2" fill="none"/><rect x="-1" y="-44" width="2" height="7" fill="#f5c842"/><rect x="-5" y="-12" width="8" height="12" fill="#3a2a1a"/></g>
  <g id="ctHoof"><path d="M-4,-4 L0,1 L4,-4" stroke="#3a3020" stroke-width="2.5" fill="none" opacity=".75"/></g>
  <g id="ctPalace">${sh(66,9)}<rect x="-64" y="-12" width="128" height="12" fill="#a89070"/><rect x="-64" y="-16" width="128" height="4" fill="#c8b090"/>
    ${[0,1,2].map(i=>`<rect x="${-18+i*4}" y="${-12+i*4}" width="${36-i*8}" height="4" fill="#8a7458"/>`).join('')}
    ${[-56,-44,-32,-20,-8,4,16,28,40,52].map(x=>`<rect x="${x-3}" y="-56" width="6" height="40" fill="#e0d0b0"/><rect x="${x+1}" y="-56" width="2" height="40" fill="#b8a888"/><rect x="${x-5}" y="-60" width="10" height="4" fill="#c8b090"/>`).join('')}
    <rect x="-62" y="-68" width="124" height="8" fill="#b89a70"/><rect x="-62" y="-72" width="124" height="4" fill="currentColor"/>
    <rect x="-1" y="-96" width="2" height="24" fill="#4a3828"/><rect x="1" y="-96" width="14" height="8" fill="currentColor"/></g>
  <g id="ctOlive"><ellipse cx="2" cy="1" rx="12" ry="4" fill="#000" opacity=".28"/><rect x="-2" y="-10" width="4" height="10" fill="#6a5a40"/><rect x="1" y="-14" width="3" height="5" fill="#6a5a40"/>
    <rect x="-14" y="-24" width="28" height="12" fill="#6a7a5a"/><rect x="-10" y="-30" width="20" height="8" fill="#8a9a78"/><rect x="-8" y="-27" width="8" height="4" fill="#b0bea0"/>
    <rect x="4" y="-21" width="6" height="4" fill="#b0bea0"/><rect x="-12" y="-16" width="4" height="3" fill="#4a5a3a"/></g>
  <g id="ctRose"><ellipse cx="1" cy="1" rx="9" ry="3" fill="#000" opacity=".25"/><rect x="-8" y="-12" width="16" height="12" fill="#2a5a18"/><rect x="-6" y="-15" width="12" height="4" fill="#3a7020"/>
    <rect x="-6" y="-12" width="4" height="4" fill="#d8304a"/><rect x="2" y="-14" width="4" height="4" fill="#f06a8a"/><rect x="-1" y="-7" width="4" height="4" fill="#d8304a"/><rect x="4" y="-6" width="3" height="3" fill="#f06a8a"/></g>
  <g id="ctFlag"><rect x="-1" y="-34" width="2" height="34" fill="#4a3828"/><rect x="1" y="-34" width="14" height="9" fill="currentColor"/><rect x="1" y="-27" width="14" height="2" fill="#000" opacity=".2"/></g>`;
})();

// Harita kurucu: zemin, lekeler, su, yol ve yapıları toplar; yapılar pinlerin/nehirlerin üstüne gelmez
function terrBuild(c, draw){
  const r = terrRng(9173+c*7919), out = [], spr = [], wet = [];
  const keep = PIN_POS.map(p=>({x:p.x, y:p.y, d:170}));   // pin çevresi: yapı (45-map-landmarks.js) için boş kalır
  const clip = `trClip${c}`;
  const rivers = [];
  const m = {r, out, clip, land:null, groundEnd:0, rivers,
    isLand:(x,y)=>m.land.has(x,y) && !wet.some(b=>b.has(x,y)),
    // Ada: Babil gibi haritayı dolduran, köşeleri dolgun kara (rx/ry istenen değerden bağımsız olarak geniş tutulur)
    island(cx, cy, rx, ry, ground, wob=.1){
      const b = m.land = terrBlob(r, 1000, 1000, 920, 910, Math.max(wob, .12), 4);
      out.push(`<rect width="2000" height="2000" fill="url(#oceanPat)"/>`,
        ...Array.from({length:70}, ()=>{ const x = Math.round(r()*1980), y = Math.round(r()*1980);
          return `<rect x="${x}" y="${y}" width="16" height="3" fill="#bfe0ff" opacity=".4"/><rect x="${x+6}" y="${y-3}" width="8" height="3" fill="#bfe0ff" opacity=".3"/>`; }),
        `<path d="${b.d}" fill="#000" opacity=".3" transform="translate(0 26)"/><path d="${b.d}" fill="url(#cliffPat)" transform="translate(0 14)"/>`,
        `<path d="${b.d}" fill="${ground}"/><clipPath id="${clip}"><path d="${b.d}"/></clipPath>`);
      m.groundEnd = out.length; return b;
    },
    patch(cx, cy, rx, ry, fill, wob=.25){
      const b = terrBlob(r, cx, cy, rx, ry, wob);
      out.push(`<path d="${b.d}" fill="${fill}" clip-path="url(#${clip})"/>`); m.groundEnd = out.length; return b;
    },
    field(x, y, w, h){ out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#fieldPat)" opacity=".85" clip-path="url(#${clip})"/>`); keep.push({x:x+w/2, y:y+h/2, d:Math.min(w,h)/2}); },
    water(cx, cy, rx, ry, rim='#d8c080', wob=.2, fill='url(#oceanPat)'){
      const b = terrBlob(r, cx, cy, rx, ry, wob); wet.push(b);
      out.push(`<path d="${b.d}" fill="${rim}" stroke="${rim}" stroke-width="28" stroke-linejoin="miter" clip-path="url(#${clip})"/><path d="${b.d}" fill="${fill}"/>`); return b;
    },
    // Boğaz / geniş su yolu: deniz desenli, kumsal kenarlı (köprüler için nehir sayılır)
    strait(pts, w){ rivers.push({pts, w}); m.line(pts, w+28, '#d8c080'); m.line(pts, w+8, '#123a64'); m.line(pts, w, 'url(#oceanPat)'); m.block(pts, w/2+30); },
    // Su üstüne dalga kıvrımları (kara ve göller dışı)
    waves(n, box=m.box(0,0,2000,2000)){
      for(let i=0, t=0; i<n && t<n*20; t++){ const x = box.x0+r()*(box.x1-box.x0), y = box.y0+r()*(box.y1-box.y0);
        if(m.land.has(x,y) && !wet.some(b=>b.has(x,y))) continue; m.flat('ctWave', x, y); i++; }
    },
    line(pts, w, col, extra=''){
      out.push(`<path d="${terrStairs(pts)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="square" clip-path="url(#${clip})" ${extra}/>`);
    },
    block(pts, d){ terrAlong(pts, 20).forEach(([x,y])=>keep.push({x, y, d})); },
    river(pts, w=56){ rivers.push({pts, w}); m.line(pts, w+16, '#d8c080'); m.line(pts, w, '#1a4a7a'); m.line(pts, w-14, '#2a6aaa');
      m.line(pts, 4, '#6aaae0', 'stroke-dasharray="14 26" opacity=".7"'); m.block(pts, w/2+30); },
    canal(pts){ m.line(pts, 22, '#c8b070'); m.line(pts, 12, '#2a6aaa'); m.block(pts, 32); },
    road(pts, w=18, col='#c8a868', edge='#8a6a38'){ m.line(pts, w+8, edge); m.line(pts, w, col); m.block(pts, w/2+26); m.bridges(pts, w); },
    // Yol nehri kestiği yerde tahta köprü
    bridges(pts, w){
      const hit = (a,b,c,d)=>{ const den = (b[0]-a[0])*(d[1]-c[1])-(b[1]-a[1])*(d[0]-c[0]); if(!den) return null;
        const t = ((c[0]-a[0])*(d[1]-c[1])-(c[1]-a[1])*(d[0]-c[0]))/den, u = ((c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0]))/den;
        return t>=0 && t<=1 && u>=0 && u<=1 ? [a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1])] : null; };
      rivers.forEach(rv=>{ for(let i=0; i<pts.length-1; i++) for(let j=0; j<rv.pts.length-1; j++){
        const p = hit(pts[i], pts[i+1], rv.pts[j], rv.pts[j+1]); if(!p) continue;
        const x = trSnap(p[0]), y = trSnap(p[1]), L = rv.w+64, H = w+14;
        out.push(`<rect x="${x-L/2}" y="${y-H/2+6}" width="${L}" height="${H}" fill="#000" opacity=".3"/><rect x="${x-L/2}" y="${y-H/2}" width="${L}" height="${H}" fill="#8a6a2a"/>`,
          `<rect x="${x-L/2}" y="${y-H/2}" width="${L}" height="4" fill="#5a4018"/><rect x="${x-L/2}" y="${y+H/2-4}" width="${L}" height="4" fill="#5a4018"/>`,
          ...Array.from({length:Math.floor(L/12)}, (_,k)=>`<rect x="${x-L/2+k*12+10}" y="${y-H/2+4}" width="2" height="${H-8}" fill="#6a4a18"/>`));
      } });
    },
    // Her yapı pinini merkeze (Pin 0) yolla bağla
    pinRoads(w=16, col='#c8a868', edge='#8a6a38'){
      const c = PIN_POS[0];
      // Önce merkezden dikey, sonra yatay: kuzey–güney akan nehirleri hep dik keser (köprü düzgün oturur)
      PIN_POS.slice(1).forEach(p=>{ const vx = c.x+(p.x<c.x ? -40 : 40);
        m.road([[vx, c.y+60],[vx, p.y+40],[p.x, p.y+40]], w, col, edge); });
    },
    // Pinlerin çevresinde halka şeklinde köy evleri
    villages(ids, n=6, r0=150, r1=300){
      PIN_POS.forEach(p=>m.scatter(ids, n, {x0:p.x-r1, y0:p.y-r1, x1:p.x+r1, y1:p.y+r1, has:(x,y)=>{ const d = Math.hypot(x-p.x, y-p.y); return d>r0 && d<r1; }}, 38));
    },
    // Rastgele yerlerde k adet koru (her biri n ağaç)
    groves(ids, k, n=12, rad=130, d=28){
      for(let i=0, t=0; i<k && t<k*30; t++){
        const x = 200+r()*1600, y = 200+r()*1600; if(!m.free(x, y, 60)) continue;
        m.scatter(ids, n, {x0:x-rad, y0:y-rad, x1:x+rad, y1:y+rad, has:(a,b)=>Math.hypot(a-x, b-y)<rad}, d); i++;
      }
    },
    wall(pts, w=22){ m.line(pts, w+6, '#5a4a30'); m.line(pts, w, '#b8986a'); m.line(pts, 8, '#d8c08a', 'stroke-dasharray="10 10"'); m.block(pts, w/2+28); },
    flat(id, x, y){ out.push(`<use href="#${id}" x="${Math.round(x)}" y="${Math.round(y)}"/>`); },
    free:(x, y, d)=>m.isLand(x,y) && keep.every(k=>Math.hypot(k.x-x, k.y-y) >= Math.max(k.d, d)),
    put(id, x, y, s=1, d=50){ spr.push({id, x:Math.round(x), y:Math.round(y), s}); keep.push({x, y, d}); },
    try(id, x, y, s=1, d=60){ if(m.free(x, y, d)){ m.put(id, x, y, s, d); return true; } return false; },
    scatter(id, n, a, d=46, s0=.85, s1=1.15){
      for(let t=0, k=0; k<n && t<n*40; t++){
        const x = a.x0+r()*(a.x1-a.x0), y = a.y0+r()*(a.y1-a.y0);
        if(a.has && !a.has(x,y)) continue;
        if(m.try(Array.isArray(id) ? id[Math.floor(r()*id.length)] : id, x, y, s0+r()*(s1-s0), d)) k++;
      }
    },
    // Aday noktalardan ilk n tanesine yerleştir (en az n tane garanti olsun diye)
    many(id, n, cands, s=1, d=90){ let k = 0; cands.forEach(([x,y])=>{ if(k<n && m.try(id, x, y, s, d)) k++; }); return k; },
    // Kare bahçe (çevre duvarlı, h=yarı genişlik); yer yoksa false
    garden(x, y, h, fill, edge='#b8986a'){
      if(!m.free(x, y, h*1.2)) return false;
      out.push(`<rect x="${x-h-6}" y="${y-h-6}" width="${2*h+12}" height="${2*h+12}" fill="${edge}"/><rect x="${x-h}" y="${y-h}" width="${2*h}" height="${2*h}" fill="${fill}"/>`);
      keep.push({x, y, d:h*1.3}); return true;
    },
    box:(x0, y0, x1, y1)=>({x0, y0, x1, y1}),
    near:(x, y, rad)=>({x0:x-rad, y0:y-rad, x1:x+rad, y1:y+rad}),
  };
  draw(m);
  // Babil'deki gibi 40px karo dokusu: zemin lekelerinin üstüne, su/yol/yapıların altına
  const tex = [];
  m.land.rows.forEach(o=>{ let run = null;
    const flush = ()=>{ if(run) tex.push(`<rect x="${run.x}" y="${o.y}" width="${run.w}" height="${TR_T}" fill="${run.f}" opacity="${run.o}"/>`); run = null; };
    for(let x=o.xl; x<o.xr; x+=TR_T){
      const v = r(), wetT = wet.some(w=>w.has(x+TR_T/2, o.y+TR_T/2));
      const f = wetT ? null : v<.2 ? '#fff' : v<.34 ? '#000' : null, op = f==='#fff' ? .08 : .09;   // göl/deniz karoları dokusuz
      if(!f){ flush(); continue; }
      if(run && run.f===f) run.w += TR_T; else { flush(); run = {x, w:TR_T, f, o:op}; }
    }
    flush();
  });
  out.splice(m.groundEnd, 0, `<g clip-path="url(#${clip})">${tex.join('')}</g>`);
  // Dönemin 6 yapısı pinlerin altına (taban pinin biraz altında, kart üstte kalır)
  const lms = typeof TERR_LANDMARKS!=='undefined' && TERR_LANDMARKS[c], pal = typeof TL_PAL!=='undefined' && TL_PAL[c];
  if(lms) lms.forEach((f,k)=>{ const p = PIN_POS[k]; if(p) spr.push({svg:f(pal, CIVILIZATIONS[c]?.color || '#f5c842'), x:p.x, y:p.y+70}); });
  spr.sort((a,b)=>a.y-b.y);
  return out.join('') + spr.map(o=>o.svg ? `<g class="terr-lm" transform="translate(${o.x} ${o.y}) scale(1.4)">${o.svg}</g>` : `<use href="#${o.id}" transform="translate(${o.x} ${o.y})${o.s!==1?` scale(${o.s.toFixed(2)})`:''}"/>`).join('');
}

const TERR_MAPS = {
  // Pers: kurak İran platosu (turuncu/kızıl/altın), kızıl Zagros dağları, Kral Yolu, Persepolis sütun terası
  1: m=>{
    m.island(1000, 1000, 900, 880, '#b08446');
    m.patch(500, 700, 320, 210, '#a86e3a'); m.patch(1400, 1300, 360, 250, '#c89a52'); m.patch(900, 1650, 260, 150, '#9a643a');
    m.patch(1500, 500, 260, 180, '#b8783e'); m.patch(300, 1500, 200, 160, '#c8a058');
    m.river([[260,80],[300,420],[220,760],[300,1100],[200,1500],[280,1950]], 44);
    m.road([[120,1120],[520,1060],[760,1160],[1000,1180],[1260,1060],[1500,760],[1760,620],[1900,600]], 22, '#c8b078', '#7a6038');
    m.pinRoads(14, '#b8a070', '#7a6038');
    m.field(380, 1180, 200, 160); m.field(1080, 1500, 240, 140); m.field(1300, 1220, 160, 160);
    m.scatter('ctMtnRS', 8, m.box(220,160,1780,300), 90, 1.1, 1.5);
    m.scatter('ctMtnR', 14, m.box(200,180,1800,420), 78, .9, 1.4);
    m.scatter(['ctMtnR','ctMtnRS'], 10, m.box(1720,320,1880,1500), 68, .9, 1.3);
    m.scatter('ctMtnR', 6, m.box(300,1300,1600,1800), 80, .7, .9);
    // Persepolis terası: basamaklı kaide üstünde sütun ızgarası (bazıları yıkık)
    [[700,1350],[1300,1320],[1330,700],[640,700]].some(([x,y])=>{ if(!m.free(x, y, 150)) return false;
      m.out.push(`<rect x="${x-140}" y="${y-86}" width="280" height="170" fill="#7a5a30"/><rect x="${x-134}" y="${y-94}" width="268" height="170" fill="#d8b880"/>`,
        `<rect x="${x-134}" y="${y-94}" width="268" height="4" fill="#f0d8a0"/><rect x="${x-30}" y="${y+76}" width="60" height="10" fill="#b8985a"/><rect x="${x-20}" y="${y+86}" width="40" height="8" fill="#a8884a"/>`);
      m.block([[x-140,y-60],[x+140,y-60],[x+140,y+60],[x-140,y+60]], 60);
      for(let i=0; i<5; i++) for(let j=0; j<3; j++) m.put(m.r()<.3 ? 'ctPColB' : 'ctPCol', x-104+i*52, y-40+j*52, 1, 0);
      return true; });
    m.many('ctFire', 3, [[1250,880],[560,760],[1300,1560],[700,1620],[1720,1200],[260,820]], 1, 90);
    [[1760,500],[260,1000],[1250,1700],[760,330]].forEach(([x,y])=>m.try('ctCastle', x, y, 1, 90));
    m.scatter('ctCastle', 2, m.box(200,450,1700,1750), 140);
    terrAlong([[120,1120],[520,1060],[760,1160],[1000,1180],[1260,1060],[1500,760],[1760,620]], 200, -52).forEach(([x,y])=>m.try('ctFlag', x, y, 1, 30));
    m.scatter('sRock', 22, m.box(150,150,1850,1850), 30);
    m.villages(['sHouse','sHouse','sHouse2'], 7);
    m.groves(['sPine','sTree2','sPalm'], 7, 12, 130);
    m.scatter(['sTree2','sPalm','sPine','sRock'], 100, m.box(120,400,1880,1880), 34);
    m.scatter('sHill', 6, m.box(200,450,1800,1800), 70);
    m.waves(50);
  },
  // Büyük İskender: deniz kıyısı, liman, Yunan sütunları
  2: m=>{
    m.island(1060, 1000, 880, 900, '#8ab04a');
    m.patch(800, 1300, 300, 220, '#7aa040'); m.patch(1400, 700, 280, 200, '#9ac05a'); m.patch(1550, 1500, 220, 180, '#a0c464');
    m.water(-40, 1000, 300, 1000, '#e8dcb0', .12); m.water(1520, 1900, 300, 170, '#e8dcb0');   // Akdeniz kıyısı (batı) + güney koyu
    m.out.push(`<rect x="300" y="806" width="130" height="14" fill="#8a6a2a"/><rect x="300" y="820" width="130" height="4" fill="#5a4018"/>`,
      `<rect x="300" y="946" width="110" height="14" fill="#8a6a2a"/><rect x="300" y="960" width="110" height="4" fill="#5a4018"/>`);
    m.put('ctShip', 220, 790, 1.1, 0); m.put('ctShip', 200, 930, 1, 0); m.put('ctShip', 100, 1060, .9, 0);
    m.put('ctShip', 1900, 140, 1, 0); m.put('ctShip', 1500, 1900, 1.1, 0); m.put('ctShip', 110, 1880, .9, 0);
    m.try('ctLight', 410, 1130, 1, 60);
    m.road([[430,880],[700,900],[880,960]], 16, '#e0d8c8', '#a89a80');
    m.pinRoads(16, '#e0d8c8', '#a89a80');
    m.field(1500, 980, 240, 160); m.field(900, 1300, 200, 140); m.field(400, 1500, 220, 140);
    let marble = '';
    [[700,700,200,150],[1250,1200,180,140],[1350,720,150,120],[700,1560,170,120],[1650,1350,140,120],[1000,920,260,200]]
      .forEach(([x,y,rx,ry])=>{ m.patch(x, y, rx+16, ry+16, '#b8b0a0', .1); marble += m.patch(x, y, rx, ry, '#e6e0d2', .1).d; });
    // Döşeme deseni yalnızca mermer meydanlarda (kıyı denizine taşmasın)
    m.out.push(`<clipPath id="trMarbleClip"><path d="${marble}"/></clipPath><rect width="2000" height="2000" fill="url(#trMarble)" clip-path="url(#trMarbleClip)" opacity=".5"/>`);
    [[700,700],[1250,1200],[1350,720],[700,1560],[1650,1350]].forEach(([x,y])=>m.try('ctTemple', x, y, 1, 90));
    m.scatter('ctCol', 12, m.box(250,250,1800,1800), 50, 1.4, 1.7);
    m.scatter('sMtn', 5, m.box(1300,160,1820,320), 80, .9, 1.2);
    m.villages(['sHouse','sHouse2'], 6);
    m.groves('ctOlive', 10, 14, 130);
    m.scatter(['ctOlive','ctOlive','sPine','sTree2'], 120, m.box(120,120,1880,1880), 34);
    m.scatter('sPine', 16, m.box(250,250,1850,1800), 36);
    m.waves(80); m.waves(40, m.box(0,100,300,1900));
    m.put('ctShip', 150, 300, 1, 0); m.put('ctShip', 140, 1500, 1.1, 0);
  },
  // Part: bozkır, atlı yollar, kubbe çatılı yapılar
  3: m=>{
    m.island(1000, 1000, 900, 900, '#c0a850');
    m.patch(500, 600, 300, 200, '#a8b058'); m.patch(700, 1500, 320, 220, '#9aa850'); m.patch(1600, 1400, 220, 260, '#a8b058');
    m.patch(1000, 300, 260, 140, '#9a7a40'); m.patch(300, 1100, 160, 200, '#b0985a');
    m.river([[1300,80],[1340,400],[1260,700],[1350,1100],[1300,1500],[1380,1950]], 48);
    // İpek Yolu: doğu–batı geniş kervan yolu, deve kervanları ve atlı muhafızlar
    const silk = [[80,1120],[480,1080],[760,1160],[1100,1130],[1500,1190],[1920,1110]];
    m.road(silk, 26, '#e0b868', '#8a6430');
    terrAlong(silk, 36, -30).filter((_,i)=>(i>=4&&i<9)||(i>=30&&i<35)||(i>=44&&i<48)).forEach(([x,y])=>m.put('ctCamel', x, y, 1.1, 20));
    terrAlong(silk, 50, 34).filter((_,i)=>i===12||i===13||i===26||i===27).forEach(([x,y])=>m.put('ctRider', x, y, 1.1, 20));
    m.pinRoads(12, '#8a7038', '#6a5428');
    m.field(1420, 300, 260, 160); m.field(1440, 1000, 240, 160); m.field(1000, 1500, 200, 140);
    // Atlı yollar: ince, kesik izler (ana yollardan ayrı)
    [[[100,600],[500,700],[800,800],[1260,820]], [[200,1500],[600,1400],[900,1250],[1280,1300]], [[700,150],[760,500],[650,900],[700,1300],[600,1850]]]
      .forEach(t=>m.line(t, 6, '#6a5428', 'stroke-dasharray="14 10" opacity=".8"'));
    [[600,1060],[1120,600],[1600,1300],[860,1680]].forEach(([x,y])=>{ m.scatter('ctDome', 4, m.near(x,y,130), 50); m.scatter('sHouse', 3, m.near(x,y,150), 40); });
    m.scatter('sHill', 10, m.box(200,200,1800,1800), 70);
    [[600,1060],[1120,600],[1600,1300],[860,1680]].forEach(([x,y])=>m.scatter('ctFlag', 1, m.near(x,y,110), 40));
    m.villages(['sHouse','ctDome'], 5);
    m.scatter('sPalm', 40, m.box(1180,80,1480,1900), 36);
    m.groves(['sTree2','sTree'], 4, 8, 100);
    m.scatter(['sRock','sRock','sTree2'], 40, m.box(150,150,1850,1850), 40);
    // Bozkırda dörtnala koşan atlı grupları + otlayan sürüler
    [[500,420],[1600,700],[400,1650],[1600,1700],[800,700]].forEach(([x,y])=>{ m.scatter('ctRider', 3, m.near(x,y,90), 34, 1, 1.2); m.scatter('ctHorse', 4, m.near(x,y,160), 30); });
    m.scatter('ctGrass', 260, m.box(120,120,1880,1880), 22, .9, 1.3);
    m.waves(50);
  },
  // Sasani: ateş tapınakları, kanal sistemi, Taq Kasra
  4: m=>{
    m.island(1000, 1000, 900, 900, '#9a6a3a');
    m.patch(1600, 1000, 260, 700, '#8a5430'); m.patch(500, 1500, 300, 200, '#a8743a'); m.patch(900, 500, 260, 200, '#b0803e');
    [[240,340,330,240],[620,340,420,240],[240,700,330,360],[240,1160,330,380],[620,1160,420,380],[1260,820,380,420],[260,1640,330,220]]
      .forEach(([x,y,w,h])=>{ if(m.r()<.8) m.field(x, y, w, h); });
    m.river([[1150,60],[1200,420],[1120,760],[1220,1160],[1150,1600],[1220,1950]], 56);
    [300,640,1120,1600].forEach(y=>m.canal([[1160,y],[180,y]]));
    [760,1300].forEach(y=>m.canal([[1200,y],[1820,y]]));
    m.canal([[600,300],[600,1600]]); m.canal([[1720,760],[1720,1300]]);
    [[740,500],[820,1300],[1500,620],[1500,1480],[360,900]].forEach(([x,y])=>m.try('ctFire', x, y, 1, 80));
    m.pinRoads(14, '#c8b078', '#8a6a38');
    m.try('ctArch', 760, 880, 1, 100);
    [[1520,1050],[440,1420],[1560,300],[860,1520],[420,500]].filter(([x,y])=>m.garden(x, y, 70, '#4a7a28')).slice(0,3)
      .forEach(([x,y])=>{ for(let i=-1; i<=1; i++) for(let j=-1; j<=1; j++) if(i||j) m.put('ctRose', x+i*42, y+j*42+8, 1, 0);
        m.put('ctFire', x, y+10, .6, 0); });
    m.scatter(['ctMtnR','ctMtnRS'], 16, m.box(1700,160,1890,1860), 70, .9, 1.3);   // Zagros (doğu)
    m.scatter('ctMtnR', 8, m.box(200,150,1600,260), 80, .9, 1.2);
    m.scatter('sPalm', 70, m.box(1000,100,1400,1900), 32);
    m.villages(['sHouse','sHouse2','sHouse'], 7);
    m.groves(['sTree','sTree2','sPalm'], 8, 12, 120);
    m.scatter(['sTree2','sPalm','sPalm','sRock'], 100, m.box(120,120,1700,1880), 34);
    m.waves(50);
  },
  // İslam'ın Yükselişi: çöl, kervan yolu, vaha, minareler
  5: m=>{
    m.island(1000, 1000, 900, 900, '#d8b060');
    for(let i=0; i<18; i++){
      const cx = 220+m.r()*1560, cy = 220+m.r()*1560, rx = 140+m.r()*120, ry = 30+m.r()*20;
      m.patch(cx+10, cy+22, rx*.9, ry*.7, '#c09848', .3); m.patch(cx, cy, rx, ry, '#ecc878', .3);
    }
    const oases = [[600,1000,110,80],[1460,1540,120,90],[1500,300,90,70],[260,500,90,70],[1700,860,80,60]];
    oases.forEach(([x,y,rx,ry])=>{ m.patch(x, y, rx+110, ry+90, '#a8a048', .3); m.water(x, y, rx, ry, '#5a8a2a', .2, 'url(#trOasis)'); });
    oases.forEach(([x,y,rx])=>m.scatter('sPalm', 18, m.near(x, y, rx+150), 28));
    m.pinRoads(12, '#e0c890', '#a88850');
    const cv = [[100,1650],[500,1500],[900,1250],[1250,1150],[1600,1250],[1900,1100]];
    m.road(cv, 14, '#e0c890', '#a88850');
    terrAlong(cv, 34, -26).filter((_,i)=>(i>=8&&i<13)||(i>=26&&i<31)).forEach(([x,y])=>m.put('ctCamel', x, y, 1, 20));
    [[700,640],[1250,700],[1560,1640],[420,1500]].forEach(([x,y])=>{
      m.try('ctMosqueS', x, y, 1, 70); m.scatter('ctMinaret', 1, m.near(x,y,120), 50); m.scatter('sHouse2', 4, m.near(x,y,150), 44); });
    // Kumda taşlarla yapılmış büyük hilal ve yıldız
    [[1000,1700],[300,1000],[1700,1300],[1150,420]].some(([x,y])=>{ if(!m.free(x, y, 120)) return false;
      m.out.push(`<mask id="trCres"><circle cx="${x}" cy="${y}" r="74" fill="#fff"/><circle cx="${x+28}" cy="${y-12}" r="60" fill="#000"/></mask>`,
        `<circle cx="${x+4}" cy="${y+6}" r="74" fill="#8a6a30" opacity=".5" mask="url(#trCres)"/><circle cx="${x}" cy="${y}" r="74" fill="#f8ecc0" mask="url(#trCres)"/>`,
        `<polygon points="${[...Array(10)].map((_,i)=>{ const a=-Math.PI/2+i*Math.PI/5, q=i%2?12:30; return (x+56+q*Math.cos(a)).toFixed(0)+','+(y-16+q*Math.sin(a)).toFixed(0); }).join(' ')}" fill="#f5c842" stroke="#8a6a30" stroke-width="3"/>`);
      m.block([[x-70,y],[x+70,y]], 90); return true; });
    m.villages(['sHouse2','sHouse2','sHouse'], 6);
    m.scatter('ctDune', 70, m.box(150,150,1850,1850), 60, .8, 1.4);
    m.scatter(['sPalm','sPalm','sRock'], 50, m.box(150,150,1850,1850), 40);
    m.scatter('sRock', 40, m.box(150,150,1850,1850), 30);
    m.waves(60);
  },
  // Abbasi: yuvarlak Bağdat surları, Dicle, pazar, Bilgelik Evi
  6: m=>{
    m.island(1000, 1000, 900, 900, '#6a8a30');
    m.field(220, 1300, 300, 260); m.field(260, 320, 340, 260);
    m.river([[1250,60],[1240,450],[1300,640],[1410,900],[1400,1200],[1330,1600],[1360,1950]], 104);   // geniş Dicle
    m.canal([[180,1150],[600,1110],[1340,1150]]);
    m.field(1500, 1100, 260, 200); m.field(1500, 300, 260, 180); m.field(700, 1650, 300, 160);
    m.road([[1000,1240],[1000,1440],[1615,1440],[1615,955]], 16); m.road([[1000,600],[1000,455],[1485,455]], 16);
    m.road([[690,920],[430,920],[430,470]], 16); m.road([[690,1000],[360,1000],[360,1270]], 16);
    const city = terrBlob(m.r, 1000, 920, 300, 300, 0), moat = terrBlob(m.r, 1000, 920, 350, 350, 0);
    m.out.push(`<path d="${city.d}" fill="#8a9a50"/><path d="${moat.d}" fill="none" stroke="#2a6aaa" stroke-width="12"/>`,
      `<path d="${city.d}" fill="none" stroke="#5a4a30" stroke-width="28"/><path d="${city.d}" fill="none" stroke="#b8986a" stroke-width="22"/>`,
      `<path d="${city.d}" fill="none" stroke="#d8c08a" stroke-width="8" stroke-dasharray="10 10"/>`);
    [[1000,620],[1000,1220],[700,920],[1300,920]].forEach(([x,y])=>m.out.push(`<rect x="${x-22}" y="${y-22}" width="44" height="44" fill="#a8885a"/><rect x="${x-22}" y="${y-22}" width="44" height="6" fill="#f5c842"/><rect x="${x-8}" y="${y-8}" width="16" height="16" fill="#3a2a1a"/>`));
    // Yuvarlak şehrin iç halkası ve dört ana cadde (Bağdat planı)
    m.out.push(`<circle cx="1000" cy="920" r="170" fill="none" stroke="#c8a878" stroke-width="14"/><circle cx="1000" cy="920" r="170" fill="none" stroke="#2a6aaa" stroke-width="4" stroke-dasharray="12 10"/>`,
      `<rect x="992" y="640" width="16" height="560" fill="#c8a878"/><rect x="720" y="912" width="560" height="16" fill="#c8a878"/>`);
    m.block(Array.from({length:73}, (_,i)=>[1000+310*Math.cos(i*Math.PI/36), 920+310*Math.sin(i*Math.PI/36)]), 40);
    const inCity = {x0:720, y0:640, x1:1280, y1:1200, has:(x,y)=>Math.hypot(x-1000, y-920)<250};
    m.scatter('ctDomeB', 8, inCity, 50); m.scatter('sHouse', 16, inCity, 38); m.scatter('sHouse2', 10, inCity, 38);
    m.scatter('ctStall', 10, m.near(640,1500,140), 36);
    m.try('ctLibrary', 1150, 1350, 1.1, 90) || m.try('ctLibrary', 560, 700, 1.1, 90);
    [[620,700],[640,1520],[1650,1300],[1650,700]].some(([x,y])=>{   // geometrik çarbağ bahçesi
      if(!m.garden(x, y, 110, '#4a7a28', '#c8a878')) return false;
      m.out.push(`<rect x="${x-110}" y="${y-8}" width="220" height="16" fill="#2a6aaa"/><rect x="${x-8}" y="${y-110}" width="16" height="220" fill="#2a6aaa"/>`,
        `<rect x="${x-18}" y="${y-18}" width="36" height="36" fill="#c8a878"/><rect x="${x-10}" y="${y-10}" width="20" height="20" fill="#6aaae0"/>`,
        ...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([i,j])=>`<rect x="${x+i*58-30}" y="${y+j*58-30}" width="60" height="60" fill="#5a8a30"/><rect x="${x+i*58-14}" y="${y+j*58-14}" width="28" height="28" fill="#6a9a3a"/>`));
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([i,j])=>m.put('sPine', x+i*96, y+j*96+12, .8, 0));
      return true;
    });
    m.scatter('sPalm', 70, m.box(1180,80,1520,1900), 30);
    m.villages(['sHouse','sHouse2'], 6, 160, 280);
    m.groves(['sPalm','sTree2','sTree'], 8, 12, 120);
    m.scatter(['sTree','sTree2','sPalm'], 110, m.box(120,120,1880,1880), 34);
    m.scatter('ctDomeB', 6, m.box(200,200,1800,1800), 80);
    m.waves(50);
  },
  // Moğol: bozkır, yurt çadırları, at izleri, harabeler
  7: m=>{
    m.island(1000, 1000, 900, 900, '#8a8058');
    m.patch(500, 500, 300, 220, '#7a7a5a'); m.patch(1500, 1500, 260, 220, '#9a8a60'); m.patch(700, 1600, 300, 180, '#8a7a50');
    m.patch(900, 1100, 160, 120, '#4a4838', .35); m.patch(1500, 700, 140, 100, '#4a4838', .35);
    m.river([[1250,60],[1300,500],[1220,900],[1300,1300],[1240,1950]], 52);
    [[[150,500],[500,600],[700,900],[650,1200],[900,1600],[1100,1850]], [[200,1700],[600,1500],[1000,1150],[1100,700],[1400,300]]]
      .forEach(p=>terrAlong(p, 26).forEach(([x,y],i)=>{ if(m.isLand(x,y)) m.flat('ctHoof', x+(i%2?5:-5), y); }));
    [[600,800],[820,1340],[1640,1500],[1580,260],[400,1560]].forEach(([x,y])=>m.scatter('ctYurt', 5, m.near(x,y,150), 52));
    m.scatter('ctMtnG', 14, m.box(200,140,1800,300), 80, 1, 1.5);   // uzakta karlı dağ sırası
    m.scatter(['ctMtnG','sMtn'], 10, m.box(200,240,1800,400), 75, .8, 1.1);
    m.pinRoads(10, '#9a8a58', '#6a5a38');
    m.scatter('ctRuin', 8, m.box(200,400,1800,1800), 60);
    m.scatter('sHill', 14, m.box(200,400,1800,1800), 70);
    m.groves(['sPine','sPine','sTree2'], 7, 14, 130);
    m.scatter('sPine', 40, m.box(150,300,1850,560), 30);
    m.scatter(['sRock','sRock','sTree2'], 50, m.box(150,150,1850,1850), 36);
    [[900,600],[1500,1100],[500,1250],[1100,1650]].forEach(([x,y])=>{ m.scatter('ctHorse', 7, m.near(x,y,150), 28); m.scatter('ctRider', 2, m.near(x,y,180), 40); });
    m.scatter('ctGrass', 240, m.box(120,120,1880,1880), 22);
    m.waves(50);
  },
  // Osmanlı: surlar, cami kubbeleri, çarşı, servi ağaçları
  8: m=>{
    m.island(1000, 1000, 900, 900, '#5a8a34');
    m.patch(1600, 1500, 240, 220, '#6a9a3c'); m.patch(400, 500, 260, 220, '#4a7a2c');
    const bosphorus = [[1300,40],[1290,450],[1330,800],[1310,1250],[1340,1960]];
    m.strait(bosphorus, 110);   // İstanbul Boğazı
    terrAlong(bosphorus, 300).slice(1).forEach(([x,y],i)=>m.put('ctShip', x+(i%2?-18:18), y, 1.1, 0));
    m.field(240, 1500, 260, 180); m.field(1500, 300, 260, 180); m.field(1500, 900, 200, 160);
    m.out.push(`<rect x="560" y="560" width="640" height="740" fill="#8a9058"/>`);
    m.road([[880,1300],[880,1600],[1450,1600],[1450,1500]], 16); m.road([[1200,920],[1615,955]], 16);
    m.road([[880,560],[880,400],[1485,400],[1485,455]], 16); m.road([[560,820],[430,820],[430,470]], 16); m.road([[560,1200],[360,1200],[360,1270]], 16);
    m.wall([[560,560],[1200,560],[1200,1300],[560,1300],[560,560]]);
    [[560,560],[1200,560],[560,1300],[1200,1300],[880,560],[560,920],[1200,920],[880,1300]].forEach(([x,y])=>m.put('sTowerH', x, y+10, 1.2, 40));
    m.many('ctMosque', 3, [[760,760],[1060,1180],[1450,1500],[760,1100],[1500,1200],[300,900]], 1, 90);
    [[720,560],[1040,560],[560,1100],[1200,1100]].forEach(([x,y])=>m.put('ctFlag', x, y-14, 1, 0));
    [[720,1120],[1060,700],[1600,1250]].forEach(([x,y])=>m.try('ctBazaar', x, y, 1, 70));
    m.scatter('sHouse', 24, m.box(600,600,1180,1280), 40);
    m.villages(['sHouse','sHouse2'], 6, 160, 300);
    m.groves(['sPine','sTree','sTree2'], 9, 14, 130);
    m.scatter(['sPine','sPine','sTree','sTree2'], 130, m.box(120,120,1880,1880), 32);
    m.scatter('sPalm', 30, m.box(1400,80,1600,1900), 32);
    m.waves(70); m.flat('ctWave', 1300, 300); m.flat('ctWave', 1320, 1100); m.flat('ctWave', 1330, 1500);
  },
};

// Harita SVG'sini hazırla (bir kez): el yapımı Babil içeriği #terrBase'e taşınır; pusula/ölçek/dönem yazısı en üstte kalır
function terrTop(svg){
  return svg.querySelector(':scope > g[transform="translate(1880,1880)"]') || document.getElementById('mapEraText')?.previousElementSibling || null;
}
function terrPrep(svg){
  if(svg.querySelector('#terrBase')) return;
  const ns = 'http://www.w3.org/2000/svg', top = terrTop(svg);
  const base = document.createElementNS(ns, 'g'); base.id = 'terrBase';
  let n = svg.firstElementChild;
  while(n && n!==top){ const nx = n.nextElementSibling; if(n.tagName.toLowerCase()!=='defs') base.appendChild(n); n = nx; }
  svg.insertBefore(base, top);
  const defs = document.createElementNS(ns, 'defs'); defs.id = 'terrDefs'; defs.innerHTML = TR_SPRITES;
  svg.insertBefore(defs, base);
}

function renderMapTerrain(){
  const svg = document.getElementById('mapTerrainSvg');
  if(!svg) return;
  const c = G.mapCiv||0;
  if(c===_terrCiv) return;
  const first = _terrCiv===null;
  _terrCiv = c;
  terrPrep(svg);
  const base = svg.querySelector('#terrBase'), olds = [...svg.querySelectorAll('.terr-civ')];
  if(!TERR_MAPS[c]){   // Babil: el yapımı harita, üstteki dönem haritası solarak kalkar
    base.style.display = '';
    olds.forEach(g=>{ if(first) return g.remove(); g.classList.add('terr-out'); setTimeout(()=>g.remove(), 1050); });
    return;
  }
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'terr-civ'+(first ? '' : ' terr-in'));
  g.style.color = CIVILIZATIONS[c]?.color || '#f5c842';   // sprite'lardaki currentColor aksanları (bayrak, şerit, kubbe)
  g.innerHTML = terrBuild(c, TERR_MAPS[c]);
  svg.insertBefore(g, terrTop(svg));
  const done = ()=>{
    olds.forEach(o=>o.remove());
    if(_terrCiv===c) base.style.display = 'none';   // bu arada Babil'e dönüldüyse temel haritayı gizleme
    g.classList.remove('terr-in');
  };
  first ? done() : setTimeout(done, 1050);
}
