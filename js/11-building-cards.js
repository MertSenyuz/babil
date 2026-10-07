// ══════════════════════════════════════════════
// YAPI KARTLARI
// ══════════════════════════════════════════════
function renderBuildings(){
  G.totalStars=getTotalStarsReal();
  ensureProgress();
  const list=document.getElementById('buildingsList');
  list.innerHTML='';
  CIVILIZATIONS.forEach(civ=>{
    const idxs=civBuildingIdx(civ.id), open=isCivUnlocked(civ.id), cs=civStars(civ.id);
    const max=idxs.reduce((a,i)=>a+buildingMaxStars(i),0);
    const head=document.createElement('div');
    head.className='civ-head'+(open?'':' locked')+(isCivComplete(civ.id)?' done':'');
    head.innerHTML=`<span class="ch-ic">${open?civIcon(civ):'🔒'}</span>
      <div class="ch-txt"><div class="ch-name">${civ.name}</div><div class="ch-era">${fmtYear(civ.era.from)} → ${fmtYear(civ.era.to)}</div></div>
      <div class="ch-stars">${cs}/${max} ⭐</div>`;
    list.appendChild(head);
    if(!open){
      const lock=document.createElement('div');
      lock.className='civ-locked-card';
      lock.innerHTML=`<div class="clc-icons">${idxs.map(i=>BUILDINGS[i].icon).join(' ')}</div>
        <div class="clc-txt">🔒 Önce ${CIVILIZATIONS[civ.id-1].name} medeniyetini tamamla</div>`;
      list.appendChild(lock);
      return;
    }
    idxs.forEach(idx=>list.appendChild(buildingCard(idx, cs)));
  });
}

function buildingCard(idx, cs){
  const b=BUILDINGS[idx];
  const unlocked=isBuildingUnlocked(idx);
  const bp=G.buildingProgress[idx];
  const max=buildingMaxStars(idx);
  const bStars=buildingStars(idx);
  const pct=(bStars/max)*100;
  const allDone=bStars===max;
  const completedSections=bp.stars.filter(s=>s>0).length;
  const card=document.createElement('div');
  if(!unlocked){
    const lp=buildingLockProgress(idx)||{prev:b,done:0,n:1};
    const lockPct=Math.min(100,(lp.done/lp.n)*100);
    card.className='bc-locked';
    card.innerHTML=`
      <div class="bc-locked-bg"></div>
      <div class="bc-fog"></div>
      <div class="bc-locked-inner">
        <div class="bc-locked-icon">${bIcon(b)}</div>
        <div class="bc-locked-info">
          <div class="bc-locked-name">${b.name}</div>
          <div class="bc-locked-req">
            <span class="bc-lock-icon">🔒</span>
            <div class="bc-locked-req-txt">
              <strong>Önce ${lp.prev.name} bitmeli</strong>
              Kilidi açmak için tüm bölümlerini en az 1 yıldızla bitir
            </div>
          </div>
          <div class="bc-locked-prog">
            <div class="bc-locked-prog-track">
              <div class="bc-locked-prog-fill" style="width:${lockPct}%"></div>
            </div>
            <div class="bc-locked-prog-lbl">${lp.done} / ${lp.n} bölüm</div>
          </div>
        </div>
      </div>
    `;
    return card;
  }
  const starsHTML=bp.stars.map(s=>`<span class="bc-star">${s>0?'⭐':'☆'}</span>`).join('');
  card.className='bc';
  card.style.setProperty('--bc-color',b.color);
  card.style.setProperty('--bc-grad',b.grad);
  card.innerHTML=`
    <div class="bc-bg" style="background:${b.grad}"></div>
    <div class="bc-inner">
      <div class="bc-head">
        <div class="bc-icon-wrap" style="background:${b.grad}">${bIcon(b)}</div>
        <div class="bc-title-block">
          <div class="bc-name">${b.name}</div>
          <div class="bc-sub">${b.desc}</div>
          <div class="bc-stars">${starsHTML}</div>
        </div>
      </div>
      <div class="bc-story">${b.story}</div>
      <div class="bc-feat">
        <span class="bc-feat-icon">${b.featIcon}</span>
        <div class="bc-feat-txt"><strong>Özel Güç:</strong> ${b.feature}</div>
      </div>
      <div class="bc-footer">
        <div class="bc-progress">
          <div class="bc-prog-track">
            <div class="bc-prog-fill" style="width:${pct}%"></div>
          </div>
          <div class="bc-prog-txt">${completedSections}/${b.levels.length} bölüm · ${bStars}/${max} ⭐</div>
        </div>
        ${allDone
          ?`<div class="bc-completed-badge">✦ TAMAMLANDI</div>`
          :`<button class="bc-play-btn" style="background:${b.grad}">OYNA →</button>`
        }
      </div>
      <button class="bc-shop-btn" onclick="event.stopPropagation();openDesign(${idx})">🎨 Şehri Dizayn Et</button>
    </div>
  `;
  card.onclick=()=>openBuildingDetail(idx);
  return card;
}

function starsStr(arr){ return arr.map(s=>s>0?'⭐':'☆').join(''); }
