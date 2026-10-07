// ══════════════════════════════════════════════
// GÖRSEL EFEKTLER
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// GÜÇ TAŞI BİRLEŞİM SİSTEMİ
// ══════════════════════════════════════════════
function triggerPowerMerge(r1,c1,r2,c2,pow1,pow2,gem1,gem2){
  const color1 = GEMS[getGemBase(gem1)]?.color||'#ffff00';
  const color2 = GEMS[getGemBase(gem2)]?.color||'#ff8800';
  const el1 = getCellEl(r1,c1);
  const el2 = getCellEl(r2,c2);
  const cx = el1 ? (()=>{ const r=el1.getBoundingClientRect(); return r.left+r.width/2; })() : window.innerWidth/2;
  const cy = el1 ? (()=>{ const r=el1.getBoundingClientRect(); return r.top+r.height/2; })() : window.innerHeight/2;

  // Birleşim türüne göre efekt
  if(pow1==='bomb' && pow2==='bomb'){
    // Bomba + Bomba → 5x5 patlama
    mergeBombBomb(r1,c1,r2,c2,cx,cy,color1,color2);
  } else if(pow1==='super' && pow2==='super'){
    // Süper + Süper → TÜM TAHTA
    mergeSuperSuper(r1,c1,r2,c2,cx,cy);
  } else {
    // Bomba + Süper → 3 satır + 3 sütun
    const bombR = pow1==='bomb'?r1:r2;
    const bombC = pow1==='bomb'?c1:c2;
    const superR = pow1==='super'?r1:r2;
    const superC = pow1==='super'?c1:c2;
    mergeBombSuper(bombR,bombC,superR,superC,cx,cy,color1,color2);
  }
}

function mergeBombBomb(r1,c1,r2,c2,cx,cy,col1,col2){
  // 5x5 alan temizle (her iki bomb merkezli)
  const cleared = new Set();
  [[r1,c1],[r2,c2]].forEach(([br,bc])=>{
    for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
      const nr=br+dr,nc=bc+dc;
      if(nr>=0&&nr<BS&&nc>=0&&nc<BS) cleared.add(`${nr},${nc}`);
    }
  });

  // Görsel — iki dalga, büyük parçacıklar
  spawnMergeFlash(cx,cy,'#ff6600','#ffaa00','💥+💥 MEGA BOMBA!');
  spawnBombWave(cx,cy,col1);
  setTimeout(()=>spawnBombWave(cx+20,cy-10,col2),120);
  spawnParticles(cx,cy,col1,28);
  spawnParticles(cx,cy,col2,20);
  spawnParticles(cx,cy,'#ffffff',12);
  SFX.bomb(); setTimeout(()=>SFX.bomb(),150);

  applyMergeCleared(cleared, 200, cx, cy);
}

function mergeSuperSuper(r1,c1,r2,c2,cx,cy){
  // Tüm tahtayı temizle
  const cleared = new Set();
  for(let r=0;r<BS;r++) for(let c=0;c<BS;c++) cleared.add(`${r},${c}`);

  spawnMergeFlash(cx,cy,'#ffff00','#ffffff','⚡+⚡ TANRI GÜCÜ!');
  spawnSuperFlash(cx,cy);
  spawnParticles(cx,cy,'#ffff00',40);
  spawnParticles(cx,cy,'#ffffff',30);
  spawnParticles(cx,cy,'#ff8800',20);
  // Ekranı sars
  const app=document.getElementById('app');
  app.style.transition='transform .05s';
  let sh=0;
  const shakeAnim=setInterval(()=>{
    sh++;
    app.style.transform=`translateX(${sh%2===0?-4:4}px)`;
    if(sh>=8){ clearInterval(shakeAnim); app.style.transform=''; }
  },50);
  SFX.super(); setTimeout(()=>SFX.super(),200);

  applyMergeCleared(cleared, 300, cx, cy);
}

function mergeBombSuper(bombR,bombC,superR,superC,cx,cy,col1,col2){
  // Bomba çevresindeki 3 satır + 3 sütun
  const cleared = new Set();
  for(let dr=-1;dr<=1;dr++){
    const row=bombR+dr;
    if(row>=0&&row<BS) for(let c=0;c<BS;c++) cleared.add(`${row},${c}`);
  }
  for(let dc=-1;dc<=1;dc++){
    const col=bombC+dc;
    if(col>=0&&col<BS) for(let r=0;r<BS;r++) cleared.add(`${r},${col}`);
  }

  spawnMergeFlash(cx,cy,'#ff4400','#ffcc00','💥+⚡ KRİTİK PATLAMA!');
  spawnBombWave(cx,cy,col1);
  spawnSuperFlash(cx,cy);
  spawnParticles(cx,cy,col1,24);
  spawnParticles(cx,cy,'#ffff00',18);
  spawnParticles(cx,cy,'#ffffff',10);
  SFX.bomb(); setTimeout(()=>SFX.super(),100);

  applyMergeCleared(cleared, 250, cx, cy);
}

function applyMergeCleared(clearedSet, pts, cx, cy){
  G.gameActive=false;
  const cells=[...clearedSet].map(s=>{const[r,c]=s.split(',');return{r:+r,c:+c};});

  // Hedef güncelle
  cells.forEach(({r,c})=>{
    const base=getGemBase(G.board[r][c]);
    if(base&&G.goalProgress[base]!==undefined) G.goalProgress[base]++;
  });

  // Puan — birleşim bonusu x5
  const earned = cells.length * 50 * 5;
  G.score += earned;
  document.getElementById('scoreVal').textContent=G.score;
  showScorePop(`+${earned}`,cx,cy-30);
  updateGoalBar();

  // Animasyon
  cells.forEach(({r,c})=>{ getCellEl(r,c)?.classList.add('matched'); });

  setTimeout(()=>{
    boardClearCells(cells);
    dropGems(); fillBoard(); renderBoard();
    G.gameActive=true;
    setTimeout(()=>{
      const {cells:newM}=findMatchesExtended();
      if(newM.length>0) processMatches(newM,true);
      else checkEndConditions();
    },350);
  },400);
}

// Birleşim flaşı — büyük metin + renk patlaması
function spawnMergeFlash(x,y,col1,col2,text){
  // Arka plan flaş
  const flash=document.createElement('div');
  flash.style.cssText=`position:fixed;inset:0;pointer-events:none;z-index:9996;
    background:radial-gradient(circle at ${x}px ${y}px,${col1}55 0%,${col2}22 40%,transparent 70%);
    animation:superFlash .7s ease-out forwards;`;
  document.body.appendChild(flash);
  setTimeout(()=>flash.remove(),750);

  // Büyük metin
  showComboText(text, x, y-20, col1);
}

function spawnParticles(x,y,color,count){
  for(let i=0;i<count;i++){
    const p=document.createElement('div');
    const angle=(i/count)*Math.PI*2+Math.random()*.8;
    const dist=25+Math.random()*55;
    const size=3+Math.random()*5;
    p.className='particle'+(Math.random()>.5?' square':'');
    p.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};box-shadow:0 0 ${size*2}px ${color};--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;transform:translate(-50%,-50%);`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),750);
  }
}

function spawnBombWave(x,y,color){
  const w=document.createElement('div');
  w.className='bomb-wave';
  w.style.cssText=`left:${x}px;top:${y}px;--wc:${color};`;
  document.body.appendChild(w);
  spawnParticles(x,y,color,16);
  setTimeout(()=>w.remove(),550);
  showToast('💥 BOMBA PATLADI! x2 PUAN!');
}

function spawnSuperFlash(x,y){
  const f=document.createElement('div');
  f.className='super-flash';
  f.style.setProperty('--fx',x+'px');
  f.style.setProperty('--fy',y+'px');
  document.getElementById('app').appendChild(f);
  spawnParticles(x,y,'#ffff00',24);
  spawnParticles(x,y,'#ffffff',12);
  setTimeout(()=>f.remove(),650);
  showToast('⚡ SÜPER PATLAMA! x3 PUAN!');
}

function showComboText(text,x,y,color){
  const el=document.createElement('div');
  el.className='combo-text';
  el.style.cssText=`left:${x}px;top:${y}px;color:${color};font-size:22px;`;
  el.textContent=text;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),950);
}

function showScorePop(text,x,y){
  const el=document.createElement('div');
  el.className='score-pop';
  el.style.left=x+'px'; el.style.top=y+'px';
  el.textContent=text;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),800);
}

// Uygulama içi bildirim kartları — sağ üstten kayar, en fazla 3 tane, 3 sn sonra kapanır
// type: 'info' (mavi) | 'success' (yeşil) | 'warning' (turuncu); verilmezse mesajdan tahmin edilir
const TOAST_MAX = 3, TOAST_MS = 3000;
function toastGuessType(msg){
  if(/🔒|🪙|yok|kalmadı|gerekli|gerek\)|Önce|Yetersiz|bitti|engel|dolu!/i.test(msg)) return 'warning';
  if(/^✦|✓|🎉|kazan|satın alındı|yerleştirildi|kesildi|açıldı|alındı|doldu|rekor/i.test(msg)) return 'success';
  return 'info';
}
function toastClose(card){
  if(!card || card.classList.contains('tn-out')) return;
  clearTimeout(card._t);
  card.classList.add('tn-out');
  setTimeout(()=>card.remove(), 260);
}
function showToast(msg, type){
  type = ['info','success','warning'].includes(type) ? type : toastGuessType(String(msg));
  let stack = document.getElementById('toastStack');
  if(!stack){
    stack = document.createElement('div');
    stack.id = 'toastStack';
    stack.setAttribute('aria-live','polite');
    document.body.appendChild(stack);
  }
  // Aynı mesaj zaten ekrandaysa kopyalamak yerine süresini yenile
  const same = [...stack.children].find(c=>!c.classList.contains('tn-out') && c._msg===msg);
  if(same){
    clearTimeout(same._t); same._t = setTimeout(()=>toastClose(same), TOAST_MS);
    const bar = same.querySelector('.tn-bar'); bar.style.animation='none'; void bar.offsetWidth; bar.style.animation='';
    return;
  }
  const card = document.createElement('div');
  card.className = 'tn-card tn-' + type;
  card.setAttribute('role', type==='warning' ? 'alert' : 'status');
  card._msg = msg;
  card.innerHTML = '<div class="tn-msg"></div><button class="tn-x" aria-label="Kapat">×</button><div class="tn-bar"></div>';
  card.querySelector('.tn-msg').textContent = msg;
  card.querySelector('.tn-x').addEventListener('click', e=>{ e.stopPropagation(); toastClose(card); });
  stack.prepend(card);
  const live = [...stack.children].filter(c=>!c.classList.contains('tn-out'));
  live.slice(TOAST_MAX).forEach(toastClose);
  card._t = setTimeout(()=>toastClose(card), TOAST_MS);
}

// Yıldız arkaplanı
function makeStars(){
  const c=document.getElementById('stars');
  for(let i=0;i<65;i++){
    const s=document.createElement('div');
    s.className='star';
    const sz=Math.random()*2.2+.8;
    s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${(Math.random()*2+1.5).toFixed(1)}s;--delay:-${(Math.random()*3).toFixed(1)}s;`;
    c.appendChild(s);
  }
}
