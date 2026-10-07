// ══════════════════════════════════════════════
// HARİTA → BÖLÜM SEÇİM SHEET'İ
// Harita pinine dokununca açılır; bölüm seçilince _openLevelAtIndex() ile
// mevcut level ekranına (enerji kontrolü + OYNA) geçilir.
// ══════════════════════════════════════════════
let _mlsBIdx = -1;

// Pin dokunma/tıklama: haritayı sürüklerken tetiklenmez, sentetik click ile çift çalışmaz
function bindMapPinTap(pin, fn){
  let sx=0, sy=0, moved=false, lastTouch=0;
  pin.addEventListener('touchstart', e=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY; moved=false; }, {passive:true});
  pin.addEventListener('touchmove', e=>{ const t=e.touches[0]; if(Math.abs(t.clientX-sx)+Math.abs(t.clientY-sy)>10) moved=true; }, {passive:true});
  pin.addEventListener('touchend', e=>{
    if(moved || MZ.hadPinch) return;
    e.stopPropagation(); e.preventDefault();
    lastTouch=Date.now(); fn();
  });
  pin.addEventListener('mousedown', e=>{ e.stopPropagation(); });
  pin.addEventListener('click', e=>{
    e.stopPropagation();
    if(Date.now()-lastTouch<600) return;
    if(Math.abs(mapDrag.vx)<1&&Math.abs(mapDrag.vy)<1) fn();
  });
}

function openMapLevelSheet(bIdx){
  const b=BUILDINGS[bIdx];
  if(!b) return;
  if(!isBuildingUnlocked(bIdx)){ showToast(buildingLockMsg(bIdx)); return; }
  const bp=G.buildingProgress[bIdx]||{stars:b.levels.map(()=>0)};
  _mlsBIdx=bIdx;

  const icon=document.getElementById('mlsIcon');
  icon.innerHTML=bIcon(b);
  icon.style.background=b.grad||'var(--panel2)';
  icon.style.setProperty('--mc-glow',(b.color||'#f5c842')+'66');
  document.getElementById('mlsName').textContent=b.name;
  document.getElementById('mlsDesc').textContent=b.desc;
  const earned=bp.stars.reduce((a,s)=>a+(s||0),0), max=b.levels.length*3;
  document.getElementById('mlsProgTxt').textContent=`${earned}/${max} ⭐`;
  document.getElementById('mlsEnergy').textContent=`⚡ ${G.energy}/${G.maxEnergy}`;
  const fill=document.getElementById('mlsProgFill');
  fill.style.width='0%';

  // Mevcut bölüm: kilidi açık ve henüz yıldız alınmamış ilk bölüm
  let current=-1;
  b.levels.forEach((_,i)=>{
    if(current<0 && !((bp.stars[i]||0)>0) && (i===0||(bp.stars[i-1]||0)>0)) current=i;
  });

  const list=document.getElementById('mlsList');
  list.innerHTML='';
  b.levels.forEach((lvl,i)=>{
    const st=bp.stars[i]||0;
    const done=st>0, isCur=i===current;
    const row=document.createElement('div');
    row.className='mls-lvl '+(done?'done':isCur?'current':'locked');
    const goals=Object.entries(lvl.target).map(([k,v])=>
      `<span class="mls-gem" style="color:${GEMS[k].color};">${GEMS[k].symbol}${v}</span>`).join(' ');
    let sub, act;
    if(done){
      sub=`<span class="mls-stars">${[0,1,2].map(n=>n<st?'⭐':'<span class="off">⭐</span>').join('')}</span>`;
      act=`<button class="mls-act mls-replay" onclick="mlsPlay(${i})">TEKRAR ↻</button>`;
    } else if(isCur){
      sub=`${goals} <span>· ${lvl.moves} hamle</span>`;
      act=`<button class="mls-act mls-play" onclick="mlsPlay(${i})">OYNA ▶</button>`;
    } else {
      sub=`<span>Önceki bölümü tamamla</span>`;
      act=`<span class="mls-lock">🔒</span>`;
    }
    row.innerHTML=`
      <div class="mls-num">${done?'✓':isCur?i+1:'🔒'}</div>
      <div class="mls-body"><div class="mls-title">Bölüm ${i+1}</div><div class="mls-sub">${sub}</div></div>
      ${act}`;
    list.appendChild(row);
  });

  const el=document.getElementById('mapLvlSheet');
  document.getElementById('mlsSheet').style.transform='';
  el.classList.add('open');
  void el.offsetWidth;
  el.classList.add('show');
  setTimeout(()=>{ fill.style.width=(earned/max*100)+'%'; },30);
  SFX.select();
}

function closeMapLevelSheet(instant){
  const el=document.getElementById('mapLvlSheet');
  if(!el.classList.contains('open')) return;
  el.classList.remove('show');
  document.getElementById('mlsSheet').style.transform='';
  if(instant===true) el.classList.remove('open');
  else setTimeout(()=>{ if(!el.classList.contains('show')) el.classList.remove('open'); },420);
}

function mlsPlay(lvlIdx){
  const bIdx=_mlsBIdx;
  if(bIdx<0) return;
  closeMapLevelSheet(true);
  _openLevelAtIndex(bIdx, lvlIdx);   // mevcut level ekranı: hedefler, enerji kontrolü, OYNA
}

// Aşağı kaydırarak kapatma (tutamak ve başlık alanından)
(function(){
  const sheet=document.getElementById('mlsSheet');
  let y0=null, dy=0;
  const start=e=>{ y0=e.touches[0].clientY; dy=0; sheet.classList.add('dragging'); };
  const move=e=>{ if(y0===null) return; dy=Math.max(0,e.touches[0].clientY-y0); sheet.style.transform=`translate(-50%,${dy}px)`; };
  const end=()=>{
    if(y0===null) return;
    y0=null; sheet.classList.remove('dragging');
    if(dy>90) closeMapLevelSheet(); else sheet.style.transform='';
  };
  ['mlsGrip','mlsHead'].forEach(id=>{
    const h=document.getElementById(id);
    h.addEventListener('touchstart',start,{passive:true});
    h.addEventListener('touchmove',move,{passive:true});
    h.addEventListener('touchend',end);
    h.addEventListener('touchcancel',end);
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeMapLevelSheet(); });
})();

// Haritadan başka ekrana geçilirse sheet'i kapat
const _mlsOrigShowScreen = showScreen;
showScreen = function(id){
  if(id!=='mapScreen') closeMapLevelSheet(true);
  return _mlsOrigShowScreen.apply(this,arguments);
};
