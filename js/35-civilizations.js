// ══════════════════════════════════════════════
// MEDENİYETLER — özel taşlar, harita geçişi, dönem yazısı, geçiş sahnesi, tarih paneli
// ══════════════════════════════════════════════
// Her medeniyetin özel taşı üç mekanikten birini kullanır:
//   charge → 3 tane toplanınca elmas biçiminde patlama · blast → komşu 8 taşı yok eder · color → aynı renkteki tüm taşları temizler
const SPECIAL_STONES = {
  seal:     {art:'crown', badge:'👑', name:'Kral Mührü',    mech:'charge', color:'#e0a040', fx:'👑 KRAL FERMANI!',     desc:'3 tane topla → bonus patlama'},
  phalanx:  {art:'vergina', badge:'🛡', name:'Falanks Taşı',  mech:'blast',  color:'#6a9ae8', fx:'🛡 FALANKS HÜCUMU!',   desc:'Komşu tüm taşları yok eder'},
  arrow:    {art:'bow', badge:'🏹', name:'Part Oku',      mech:'color',  color:'#ff8a40', fx:'🏹 PART ATIŞI!',       desc:'Aynı renkteki tüm taşları temizler'},
  fire:     {art:'flame', badge:'🔥', name:'Kutsal Ateş',   mech:'blast',  color:'#ff7030', fx:'🔥 KUTSAL ALEV!',      desc:'Komşu tüm taşları yakar'},
  crescent: {art:'crescent', badge:'🌙', name:'Hilal Taşı',    mech:'charge', color:'#7ae0a0', fx:'🌙 HİLAL PATLAMASI!',  desc:'3 tane topla → bonus patlama'},
  astro:    {art:'astrolabe', badge:'🔭', name:'Usturlap Taşı', mech:'color',  color:'#9a8aff', fx:'🔭 YILDIZ YAĞMURU!',   desc:'Aynı renkteki tüm taşları temizler'},
  horde:    {art:'horse', badge:'🐎', name:'Akıncı Taşı',   mech:'blast',  color:'#c8c8c8', fx:'🐎 AKINCI BASKINI!',   desc:'Komşu tüm taşları yok eder'},
  tugra:    {art:'tugra', badge:'🏵', name:'Tuğra Taşı',    mech:'color',  color:'#ff5a5a', fx:'🏵 SULTAN FERMANI!',   desc:'Aynı renkteki tüm taşları temizler'},
};
const OBSTACLE_INFO = {
  sand:   {icon:'🧱', name:'Kerpiç Duvar', desc:'2 vuruşta kırılır'},
  marble: {icon:'🏛', name:'Mermer',       desc:'3 vuruşta kırılır'},
  ice:    {icon:'❄',  name:'Buz Taşı',     desc:'Yanında eşleşme yapınca çözülür'},
};
// Yeni medeniyet yapıları: özellik ikonu ve özellik metnindeki taş emojisi → çizim (çeviri parçaları etkilenmez)
BUILDINGS.forEach(b=>{
  if(!b.featSp) return;
  const ic=spIcon(b.featSp), em=SPECIAL_STONES[b.featSp].badge;
  b.featIcon=ic;
  b.feature=b.feature.split(em).join(ic);
  if(b.en) b.en.feature=b.en.feature.split(em).join(ic);
});
const LEVEL5_BONUS = 150;   // 5. bölüm ilk kez bitince özel ödül
const CIV_REWARD   = 500;   // medeniyet tamamlanınca büyük ödül
const CIV_TRANS_MS = 3200;  // geçiş sahnesi süresi (sonra ödül ekranı açılır)

ACHIEVEMENTS.push(
  {id:'age_master', icon:'🎖️', name:'Çağ Ustası', desc:'Bir yapının 5. bölümünü bitir'},
  ...CIVILIZATIONS.map(c=>({id:'civ_'+c.id, icon:civIcon(c), name:c.badge.name,
    desc: c.id ? `${c.name} medeniyetinin tüm bölümlerini bitir` : "Babil'in tüm bölümlerini bitir"})),
  {id:'history_all', icon:'⏳', name:'Zamanın Efendisi', desc:"Babil'den Osmanlı'ya tüm medeniyetleri tamamla"},
);
function checkCivAchievements(add){
  if(BUILDINGS.some((b,i)=>(G.buildingProgress[i]?.stars[b.levels.length-1]||0)>0)) add('age_master');
  CIVILIZATIONS.forEach(c=>{ if(isCivComplete(c.id)) add('civ_'+c.id); });
  if(CIVILIZATIONS.every(c=>isCivComplete(c.id))) add('history_all');
}

// ── Kayıt: aktif medeniyet + medeniyet ilerlemesi (syncGameToUser bunları gameData'ya yazar) ──
function updateCivState(){
  G.currentCivilization = highestUnlockedCiv();
  G.civilizationProgress = CIVILIZATIONS.map(c=>{
    const idxs=civBuildingIdx(c.id);
    return {id:c.id, stars:civStars(c.id), maxStars:idxs.reduce((a,i)=>a+buildingMaxStars(i),0),
            buildingsDone:idxs.filter(isBuildingComplete).length, complete:isCivComplete(c.id)};
  });
}
// ── Özel taş etkileri (eşleşmeye dahil olunca) ──
function activateSpecialStone(power, r, c, gem, extraSet){
  const sp=SPECIAL_STONES[power];
  const el=getCellEl(r,c), rc=el?el.getBoundingClientRect():null;
  const cx=rc?rc.left+rc.width/2:innerWidth/2, cy=rc?rc.top+rc.height/2:innerHeight/2;
  const add=(rr,cc)=>{ if(rr>=0&&cc>=0&&rr<BS&&cc<BS&&G.board[rr][cc]) extraSet.add(`${rr},${cc}`); };
  if(sp.mech==='blast'){
    G._killSet=G._killSet||new Set();
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      const rr=r+dr, cc=c+dc;
      if(rr>=0&&cc>=0&&rr<BS&&cc<BS){ add(rr,cc); G._killSet.add(rr*BS+cc); }
    }
    spawnBombWave(cx,cy,sp.color); showComboText(sp.fx, cx, cy-30, sp.color); SFX.bomb();
  } else if(sp.mech==='color'){
    const base=getGemBase(gem);
    for(let rr=0;rr<BS;rr++) for(let cc=0;cc<BS;cc++) if(getGemBase(G.board[rr][cc])===base) add(rr,cc);
    spawnSuperFlash(cx,cy); showComboText(sp.fx, cx, cy-30, sp.color); SFX.super();
  } else if(sp.mech==='charge'){
    G.hieroCharge=(G.hieroCharge||0)+1;
    if(G.hieroCharge>=3){
      G.hieroCharge-=3;
      for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++) if(Math.abs(dr)+Math.abs(dc)<=2) add(r+dr,c+dc);
      spawnBombWave(cx,cy,sp.color); setTimeout(()=>spawnBombWave(cx,cy,'#ffffff'),120);
      showComboText(sp.fx, cx, cy-30, sp.color); SFX.bomb();
    } else showComboText(`${G.hieroCharge}/3`, cx, cy-30, sp.color);
    updateHieroMeter();
  }
}
function updateHieroMeter(){
  const m=document.getElementById('hieroMeter');
  if(m) m.querySelector('.gi-count').textContent=`${G.hieroCharge||0}/3`;
}
// "3 topla" özel taşlı medeniyetlerde hedef çubuğuna sayaç
const _civOrigRenderGoalBar = renderGoalBar;
renderGoalBar = function(){
  const res=_civOrigRenderGoalBar.apply(this,arguments);
  const bar=document.getElementById('goalBar');
  const sp=G.civ && SPECIAL_STONES[G.civ.special];
  if(bar && sp && sp.mech==='charge' && !document.getElementById('hieroMeter')){
    const m=document.createElement('div');
    m.className='goal-item hiero-meter'; m.id='hieroMeter'; m.title=sp.desc;
    m.style.setProperty('--sp-color', sp.color);
    m.innerHTML=`<span class="goal-gem">${spIcon(G.civ.special)}</span><span class="gi-count">0/3</span>`;
    bar.insertBefore(m, bar.querySelector('.goal-help-btn'));
    updateHieroMeter();
  }
  return res;
};

// ── Bölüm ekranı: engel ve özel taş bilgisi ──
function appendCivLevelInfo(){
  const b=BUILDINGS[selectedBuilding], civ=CIVILIZATIONS[b.civ||0], lvl=b.levels[selectedLevel];
  const box=document.getElementById('levelInfo');
  if(!box || !civ.id) return;
  let html='';
  if(civ.obstacle && lvl.obstacles){
    const o=OBSTACLE_INFO[civ.obstacle];
    html+=`<div class="li-row li-civ"><span>${o.icon} ${o.name} ×${lvl.obstacles}</span><span>${o.desc}</span></div>`;
  }
  if(civ.special){
    const s=SPECIAL_STONES[civ.special];
    html+=`<div class="li-row li-civ"><span>${spIcon(civ.special)} ${s.name}</span><span>${s.desc}</span></div>`;
  }
  box.insertAdjacentHTML('beforeend', html);
}
const _civOrigOpenLevelAt = _openLevelAtIndex;
_openLevelAtIndex = function(){ const r=_civOrigOpenLevelAt.apply(this,arguments); appendCivLevelInfo(); return r; };
const _civOrigOpenLevelSelect = openLevelSelect;
openLevelSelect = function(bIdx){
  const r=_civOrigOpenLevelSelect.apply(this,arguments); appendCivLevelInfo();
  maybeShowHistoryPage(bIdx);
  return r;
};

// ── Harita: aynı Mezopotamya zemini, medeniyete göre yapılar + tema rengi ──
let _fogShown = {};
function applyMapCiv(){
  const c=G.mapCiv||0, idxs=civBuildingIdx(c), civ=CIVILIZATIONS[c];
  document.getElementById('mapInner').dataset.civ=c;
  document.documentElement.style.setProperty('--civ', civ.color);   // @property ile yumuşak geçiş
  for(let i=1;i<=5;i++){
    const fz=document.getElementById('fz'+i), b=BUILDINGS[idxs[i]];
    if(!fz || !b) continue;
    const ic=fz.querySelector('.fog-icon'), lb=fz.querySelector('.fog-label');
    if(ic) ic.innerHTML=bIcon(b);
    if(lb) lb.textContent=b.name;
  }
}
function renderCivTabs(){
  const box=document.getElementById('civTabs');
  if(!box) return;
  box.innerHTML=CIVILIZATIONS.map(c=>{
    const open=isCivUnlocked(c.id), on=c.id===(G.mapCiv||0), done=isCivComplete(c.id);
    const era = (c.era.from<0)===(c.era.to<0) ? `${fmtYear(c.era.from)}–${Math.abs(c.era.to)}` : `${fmtYear(c.era.from)}–${fmtYear(c.era.to)}`;
    return `<button class="civ-tab${on?' active':''}${open?'':' locked'}${done?' done':''}" style="--tab-c:${c.color}" onclick="setMapCiv(${c.id})" aria-pressed="${on}" title="${c.name} · ${fmtYear(c.era.from)} → ${fmtYear(c.era.to)}">
      <span class="ct-ic">${civIcon(c)}${open?'':'<span class="ct-lock">🔒</span>'}</span><span class="ct-txt"><span class="ct-nm">${c.short}</span><span class="ct-era">${era}</span></span></button>`;
  }).join('');
  bindCivTabsScroll(box);
  const act=box.querySelector('.civ-tab.active');
  if(act) box.scrollLeft = act.offsetLeft - (box.clientWidth-act.offsetWidth)/2;
  updateCivTabArrows();
}
// Sekme şeridi: parmakla (yerel kaydırma), fareyle sürükleyerek, tekerlekle ve ‹ › oklarıyla kayar
function updateCivTabArrows(){
  const box=document.getElementById('civTabs'), wrap=document.getElementById('civTabsWrap');
  if(!box || !wrap) return;
  wrap.classList.toggle('at-start', box.scrollLeft<=4);
  wrap.classList.toggle('at-end', box.scrollLeft+box.clientWidth>=box.scrollWidth-4);
}
function scrollCivTabs(dir){
  const box=document.getElementById('civTabs');
  if(box) box.scrollBy({left:dir*box.clientWidth*0.7, behavior:'smooth'});
}
function bindCivTabsScroll(box){
  if(box._bound) return;
  box._bound=true;
  box.addEventListener('scroll', updateCivTabArrows, {passive:true});
  addEventListener('resize', updateCivTabArrows);
  box.addEventListener('wheel', e=>{
    if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ box.scrollLeft+=e.deltaY; e.preventDefault(); }
  }, {passive:false});
  let d=null;
  box.addEventListener('pointerdown', e=>{
    if(e.pointerType==='touch') return;               // dokunmatikte tarayıcının kendi kaydırması
    d={x:e.clientX, sl:box.scrollLeft, id:e.pointerId, moved:false};
  });
  box.addEventListener('pointermove', e=>{
    if(!d || e.pointerId!==d.id) return;
    const dx=e.clientX-d.x;
    if(!d.moved && Math.abs(dx)>5){ d.moved=true; box.classList.add('drag'); box.setPointerCapture(d.id); }
    if(d.moved) box.scrollLeft=d.sl-dx;
  });
  const end=()=>{ if(!d) return; setTimeout(()=>box.classList.remove('drag'), 0); d=null; };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
}
function setMapCiv(c){
  if(!isCivUnlocked(c)){ const cv=CIVILIZATIONS[c]; showToast(`${cv.icon} ${cv.name} (${fmtYear(cv.era.from)} → ${fmtYear(cv.era.to)}) — 🔒 Önce ${CIVILIZATIONS[c-1].name} medeniyetini tamamla`, 'warning'); return; }
  if(c===(G.mapCiv||0)){ showCivilizationIntro(c); return; }   // açık sekmeye tekrar dokun → anlatıcıyı yeniden izle
  G.mapCiv=c;
  closePinPopup?.();
  applyMapCiv();
  updateFogZones(); renderMapPins(); renderMapItems(); renderLandLayer();
  renderCivTabs(); updateEraBanner();
  saveGame();
  requestAnimationFrame(()=>initMapPos());
}
// Dönem afişi (HUD) + harita SVG'sindeki dönem yazısı (mapEraText) — değişince yumuşak geçiş
function updateEraBanner(){
  const era=getEraText();
  const box=document.getElementById('mapEraBanner');
  const title=document.querySelector('#mapScreen .map-title');
  if(title) title.textContent=CIVILIZATIONS[G.mapCiv||0].mapTitle;
  document.querySelectorAll('.map-era-svg').forEach(el=>el.textContent=era.text);
  if(!box) return;
  const t=document.getElementById('mebText'), s=document.getElementById('mebSub');
  box.classList.toggle('golden', !!era.golden);
  if(t.textContent===tx(era.text) && s.textContent===tx('✦ '+era.sub+' ✦')) return;
  if(!t.textContent){ t.textContent=era.text; s.textContent='✦ '+era.sub+' ✦'; return; }
  box.classList.add('meb-out');
  setTimeout(()=>{ t.textContent=era.text; s.textContent='✦ '+era.sub+' ✦'; box.classList.remove('meb-out'); }, 380);
}
function playCivReveal(){
  const cvs=document.getElementById('mapCanvas');
  const svg=document.querySelector('#mapInner .civ-map.active');
  const color=CIVILIZATIONS[G.mapCiv||0].color;
  if(svg){ svg.classList.remove('civ-reveal'); void svg.getBoundingClientRect(); svg.classList.add('civ-reveal'); }
  const glow=document.createElement('div');
  glow.className='civ-reveal-glow';
  glow.style.setProperty('--glow', color);
  cvs.appendChild(glow);
  setTimeout(()=>glow.remove(), 2600);
  const r=cvs.getBoundingClientRect();
  spawnUnlockParticles(r.left+r.width/2, r.top+r.height/2, color);
  setTimeout(()=>showToast('✦ Yeni topraklar keşfedildi!','success'), 700);
}

// ── Medeniyet geçiş sahnesi (≈3 sn) → ödül ekranı → harita güncellemesi ──
let _civTrans = null;
function pendingCivReward(){
  if(!CURRENT_USER) return -1;
  const got=CURRENT_USER.civRewards||{};
  return CIVILIZATIONS.findIndex(c=>isCivComplete(c.id) && !got[c.id]);
}
function renderCtTimeline(from, to){
  const n=CIVILIZATIONS.length, pct=i=>(i/(n-1)*100).toFixed(2)+'%';
  const tl=document.getElementById('ctTimeline');
  tl.style.setProperty('--from', pct(from));
  tl.style.setProperty('--to', pct(to));
  tl.innerHTML='<div class="ct-tl-track"></div><div class="ct-tl-fill"></div>'
    + CIVILIZATIONS.map((c,i)=>`<div class="ct-tl-dot${i<=from?' done':''}${i===to&&to!==from?' next':''}" style="left:${pct(i)};--dc:${c.color}"><span>${i<=to?civIcon(c):''}</span></div>`).join('')
    + '<div class="ct-tl-marker"></div>'
    + `<div class="ct-tl-lbl l">${fmtYear(CIVILIZATIONS[0].era.from)}</div><div class="ct-tl-lbl r">${fmtYear(CIVILIZATIONS[n-1].era.to)}</div>`;
}
function playCivTransition(c){
  const civ=CIVILIZATIONS[c], next=CIVILIZATIONS[c+1];
  _civTrans=c;
  const ov=document.getElementById('civTransition');
  ov.style.setProperty('--ct-old', civ.color);
  ov.style.setProperty('--ct-new', (next||civ).color);
  document.getElementById('ctOld').innerHTML=`${civIcon(civ)} ${civ.name}`;
  document.getElementById('ctOldEra').textContent=`${fmtYear(civ.era.from)} → ${fmtYear(civ.era.to)}`;
  document.getElementById('ctYear').textContent=next ? fmtYear(next.era.from) : fmtYear(civ.era.to);
  document.getElementById('ctNew').innerHTML=next ? `${civIcon(next)} ${next.name}` : '✦ Tarih Yolculuğu Tamamlandı ✦';
  document.getElementById('ctNote').textContent=next ? next.transitionNote : CIV_FINALE_NOTE;
  renderCtTimeline(c, next ? c+1 : c);
  ov.classList.remove('open'); void ov.offsetWidth; ov.classList.add('open');
  SFX.unlock?.();
  clearTimeout(ov._t);
  ov._t=setTimeout(()=>openCivModal(c), CIV_TRANS_MS);
}
function skipCivTransition(){
  const ov=document.getElementById('civTransition');
  if(_civTrans==null || document.getElementById('civModal').classList.contains('open')) return;
  clearTimeout(ov._t); openCivModal(_civTrans);
}
function openCivModal(c){
  const civ=CIVILIZATIONS[c], next=CIVILIZATIONS[c+1];
  const idxs=civBuildingIdx(c), max=idxs.reduce((a,i)=>a+buildingMaxStars(i),0);
  const box=document.querySelector('#civModal .cm-box');
  box.style.setProperty('--cm-c', civ.color);
  box.style.setProperty('--cm-next', (next||civ).color);
  document.getElementById('cmTitle').textContent='Medeniyet Tamamlandı!';
  document.getElementById('cmIcon').innerHTML=civIcon(civ);
  document.getElementById('cmName').textContent=civ.name;
  document.getElementById('cmEra').textContent=`${fmtYear(civ.era.from)} → ${fmtYear(civ.era.to)}`;
  document.getElementById('cmBadgeIc').innerHTML=civIcon(civ);
  document.getElementById('cmBadge').textContent=civ.badge.name;
  document.getElementById('cmReward').textContent=`+${CIV_REWARD}`;
  document.getElementById('cmStars').textContent=`${civStars(c)}/${max}`;
  document.getElementById('cmNextLbl').textContent=next ? 'Sıradaki Dönem' : 'Yolculuğun Sonu';
  document.getElementById('cmNextName').innerHTML=next ? `${civIcon(next)} ${next.name} · ${fmtYear(next.era.from)} → ${fmtYear(next.era.to)}` : '🏆 Babil\'den Osmanlı\'ya 2500 yıl';
  document.getElementById('cmNextNote').textContent=next ? next.transitionNote : CIV_FINALE_NOTE;
  document.getElementById('cmBtn').textContent=next ? 'SONRAKİ DÖNEM →' : 'EFSANE! ✦';
  document.getElementById('civModal').classList.add('open');
  SFX.win?.();
  const r=document.getElementById('cmIcon').getBoundingClientRect();
  setTimeout(()=>{ if(typeof dailyConfetti==='function') dailyConfetti(r.left+r.width/2, r.top+r.height/2, 110); }, 250);
}
function claimCivReward(){
  const c=_civTrans; _civTrans=null;
  document.getElementById('civModal').classList.remove('open');
  document.getElementById('civTransition').classList.remove('open');
  if(c==null) return;
  if(CURRENT_USER){
    CURRENT_USER.civRewards=CURRENT_USER.civRewards||{};
    if(!CURRENT_USER.civRewards[c]){
      CURRENT_USER.civRewards[c]=true;
      G.coins+=CIV_REWARD; updateCoinsUI();
      checkAchievements();
    }
  }
  const next=Math.min(c+1, CIVILIZATIONS.length-1);
  G._civRevealAnim = next!==c;
  G.mapCiv=next;
  saveGame();
  showMapScreen();
}

// ── 📜 Tarihten Bir Sayfa — yapı ilk kez açıldığında bir kez gösterilir ──
function showHistoryPage(idx){
  const b=BUILDINGS[idx];
  if(!b || !b.history) return;
  const civ=CIVILIZATIONS[b.civ||0], [text, event, note]=b.history;
  const box=document.querySelector('#histModal .hm-box');
  box.style.setProperty('--hm-c', b.color || civ.color);
  document.getElementById('hmIcon').innerHTML=bIcon(b);
  document.getElementById('hmName').textContent=b.name;
  document.getElementById('hmYear').innerHTML=`${civIcon(civ)} ${civ.name} · ${fmtYear(b.year)}`;
  document.getElementById('hmText').textContent=text;
  document.getElementById('hmEvent').textContent=event;
  document.getElementById('hmNote').textContent=note;
  box.querySelector('.hm-body').scrollTop=0;
  document.getElementById('histModal').classList.add('open');
  SFX.select?.();
}
function maybeShowHistoryPage(idx){
  if(!CURRENT_USER || !isBuildingUnlocked(idx) || !BUILDINGS[idx]?.history) return;
  if(!tutGet(TUT_KEY_WELCOME) || (typeof TS!=='undefined' && TS.active)) return;   // öğreticinin önüne geçme
  const seen=CURRENT_USER.historySeen=CURRENT_USER.historySeen||{};
  if(seen[idx]) return;
  seen[idx]=1;
  saveUserData(CURRENT_USER);
  setTimeout(()=>showHistoryPage(idx), 380);
}
function closeHistoryPage(){ document.getElementById('histModal').classList.remove('open'); }
const _hpOrigOpenMapLevelSheet = openMapLevelSheet;
openMapLevelSheet = function(bIdx){
  const r=_hpOrigOpenMapLevelSheet.apply(this,arguments);
  maybeShowHistoryPage(bIdx);
  return r;
};
