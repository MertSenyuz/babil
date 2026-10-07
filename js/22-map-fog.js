// ══════════════════════════════════════════════
// FOG & PIN SİSTEMİ (geliştirilmiş)
// ══════════════════════════════════════════════
let _prevUnlockStates = [];

function updateFogZones(){
  G.totalStars = getTotalStarsReal();
  const c=G.mapCiv||0, idxs=civBuildingIdx(c), cs=civStars(c), civOpen=isCivUnlocked(c);
  const state=(_fogShown[c]=_fogShown[c]||[]);
  for(let i=1;i<=5;i++){
    const fz=document.getElementById('fz'+i), b=BUILDINGS[idxs[i]];
    if(!fz || !b) continue;
    const open=isBuildingUnlocked(idxs[i]);
    if(open){
      if(state[i]===false) spawnFogRevealEffect(fz);   // yalnızca bu oturumda yeni açıldıysa
      fz.classList.add('revealed');
    } else {
      fz.classList.remove('revealed');
      const reqEl=document.getElementById('fzReq'+i);
      if(reqEl) reqEl.textContent = buildingLockMsg(idxs[i]);
    }
    state[i]=open;
  }
}

function spawnFogRevealEffect(fogEl){
  // Sis dağılma partikülleri
  const rect = fogEl.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  for(let i=0;i<12;i++){
    const p = document.createElement('div');
    p.className = 'lock-particle';
    const angle = (i/12)*Math.PI*2;
    const dist = 60+Math.random()*80;
    p.style.cssText = `left:${cx}px;top:${cy}px;--ldx:${Math.cos(angle)*dist}px;--ldy:${Math.sin(angle)*dist}px;--lr:${Math.random()*360}deg;background:#9880b8;`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),800);
  }
  showToast('✦ Yeni bölge açıldı!');
}

function renderMapPins(){
  const container = document.getElementById('mapPins');
  container.innerHTML = '';
  const civ = G.mapCiv||0;
  BUILDINGS.forEach((b,idx)=>{
    if((b.civ||0)!==civ) return;
    const pos = PIN_POS[idx - civ*6];
    const bStars = buildingStars(idx);
    const isUnlocked = isBuildingUnlocked(idx);
    const isDone = bStars === buildingMaxStars(idx);
    const wasUnlocked = _prevUnlockStates[idx] ?? isUnlocked;
    const justUnlocked = isUnlocked && !wasUnlocked;

    const pin = document.createElement('div');
    pin.className = 'mpin ' + (isUnlocked ? 'unlocked' : 'locked');
    if(justUnlocked) pin.classList.add('just-unlocked');
    pin.style.left = pos.x + 'px';
    pin.style.top  = pos.y + 'px';
    pin.style.setProperty('--mc', b.color);
    pin.style.setProperty('--mc-glow', b.color+'66');
    pin.style.setProperty('--mc-bg', b.grad);
    const cardCls = isDone ? 'mpin-card gold' : isUnlocked ? 'mpin-card' : 'mpin-card locked-c';

    if(isUnlocked){
      const bp = G.buildingProgress[idx];
      const starsHtml = bp.stars.map(s=>s>0?'⭐':'☆').join('');
      const hasDesign = G.cityDesigns && G.cityDesigns[idx] && Object.values(G.cityDesigns[idx]).some(v=>v);
      pin.innerHTML = `
        <div class="${cardCls}" style="--mc:${b.color};">
          <div class="pi-icon-wrap" style="background:${b.grad};">${bIcon(b)}</div>
          <span class="pi-name" style="color:${b.color};">${b.name}</span>
          <span class="pi-stars">${starsHtml}</span>
          <div style="margin-top:5px;font-size:8px;font-family:'Cinzel',serif;
            color:${hasDesign?'#44ff88':'rgba(245,200,66,.6)'};letter-spacing:.3px;">
            ${hasDesign?'✦ Dizayn edildi':'🎨 Dizayn et'}
          </div>
        </div>
        <div class="mpin-pole"></div>
        <div class="mpin-dot" style="background:${b.color};box-shadow:0 0 10px ${b.color},0 0 20px ${b.color};"></div>
      `;
      bindMapPinTap(pin, ()=>openMapLevelSheet(idx));
      if(justUnlocked){
        setTimeout(()=>{
          const rect = pin.getBoundingClientRect();
          spawnUnlockParticles(rect.left+rect.width/2, rect.top+rect.height/2, b.color);
        }, 100);
      }
    } else {
      pin.innerHTML = `
        <div class="${cardCls}">
          <div class="pi-icon-wrap">${bIcon(b)}</div>
          <span class="pi-name">${b.name}</span>
          <div class="pi-lock-row">
            <span class="pi-lock">🔒</span>
            <span class="pi-req">${isCivUnlocked(civ) ? (lp=>lp?lp.done+'/'+lp.n:'')(buildingLockProgress(idx)) : civIcon(civ-1)}</span>
          </div>
        </div>
        <div class="mpin-pole"></div>
        <div class="mpin-dot"></div>
      `;
      bindMapPinTap(pin, ()=>showToast(buildingLockMsg(idx)));
    }
    container.appendChild(pin);
  });
  _prevUnlockStates = BUILDINGS.map((b,i)=>isBuildingUnlocked(i));
}

function spawnUnlockParticles(x, y, color){
  for(let i=0;i<16;i++){
    const p = document.createElement('div');
    p.className = 'lock-particle';
    const angle = (i/16)*Math.PI*2 + Math.random()*.3;
    const dist = 40 + Math.random()*70;
    p.style.cssText = `left:${x}px;top:${y}px;--ldx:${Math.cos(angle)*dist}px;--ldy:${Math.sin(angle)*dist}px;--lr:${Math.random()*720}deg;background:${color};width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 800);
  }
}
