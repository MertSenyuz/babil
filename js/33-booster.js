// ══════════════════════════════════════════════
// BOOSTER SİSTEMİ
// Envanter: getInv() → boost_* id'leri. Seçim level ekranında yapılır,
// booster KULLANILINCA envanterden düşer (seçip kullanmazsan kaybolmaz).
// ══════════════════════════════════════════════
const BOOSTERS = [
  {id:'boost_lightning', icon:'⚡', name:'Şimşek',     price:30, rgb:'90,180,255',  target:true,
   desc:'Seçtiğin taşın tüm satırını ve sütununu temizler.', hint:'⚡ Bir taşa dokun: satırı + sütunu temizlenir'},
  {id:'boost_bomb',      icon:'💣', name:'Mega Bomba', price:50, rgb:'255,130,40',  target:true,
   desc:'Seçtiğin taşın çevresindeki 5×5 alanı patlatır.', hint:'💣 Bir taşa dokun: 5×5 alan patlar'},
  {id:'boost_shuffle',   icon:'🔀', name:'Karıştır',   price:20, rgb:'180,110,255',
   desc:'Tahtayı hamle harcamadan anında karıştırır.'},
  {id:'boost_moves',     icon:'⏱️', name:'+5 Hamle',   price:40, rgb:'68,230,130',
   desc:'Kalan hamle sayına anında 5 hamle ekler.'},
  {id:'boost_rainbow',   icon:'🌈', name:'Gökkuşağı',  price:80, rgb:'255,90,200',  target:true,
   desc:'Seçtiğin renkteki TÜM taşları tahtadan siler.', hint:'🌈 Bir taşa dokun: o renkteki tüm taşlar silinir'},
  {id:'boost_shield',    icon:'🛡️', name:'Kalkan',     price:60, rgb:'110,190,255', passive:true,
   desc:'Bölümü kaybedersen 1 kez enerji harcamadan tekrar oynarsın.'},
];
const BOOST_MAX = 3;
const BOOST = {picked:[], aim:null, busy:false, replay:false};
G.activeBoost = [];
G.shieldActive = false;

function boostDef(id){ return BOOSTERS.find(b=>b.id===id); }
function boostOwned(id){ return getInv()[id]||0; }

// ── OYUN ÖNCESİ SEÇİM (level ekranı) ──
function buildBoostPick(){
  const grid=document.getElementById('boostPickGrid');
  if(!grid) return;
  grid.innerHTML=BOOSTERS.map((b,i)=>`
    <div class="bp-card" data-id="${b.id}" style="--bc:${b.rgb};--i:${i}" role="button" tabindex="0" onclick="toggleBoostPick('${b.id}')">
      <span class="bp-qty"></span><span class="bp-ic">${b.icon}</span>
      <span class="bp-nm">${b.name}</span><span class="bp-pr">🪙${b.price}</span>
    </div>`).join('');
  updateBoostPick();
}

function updateBoostPick(){
  const full=BOOST.picked.length>=BOOST_MAX;
  document.querySelectorAll('#boostPickGrid .bp-card').forEach(card=>{
    const id=card.dataset.id, own=boostOwned(id), sel=BOOST.picked.includes(id);
    card.classList.toggle('sel',sel);
    card.classList.toggle('none',own===0);
    card.classList.toggle('dim',!sel&&full);
    card.setAttribute('aria-pressed',sel);
    card.querySelector('.bp-qty').textContent='×'+(sel?own-1:own);   // seçilen booster envanterden ayrılmış görünür
  });
  const cnt=document.getElementById('boostPickCnt');
  cnt.textContent=`${BOOST.picked.length}/${BOOST_MAX}`;
  cnt.classList.toggle('full',full);
}

function toggleBoostPick(id){
  const i=BOOST.picked.indexOf(id);
  if(i>=0){ BOOST.picked.splice(i,1); updateBoostPick(); SFX.select(); return; }
  if(BOOST.picked.length>=BOOST_MAX){ showToast(`En fazla ${BOOST_MAX} booster seçebilirsin`); SFX.invalid(); return; }
  if(boostOwned(id)<1){ openBoostBuy(id); return; }
  BOOST.picked.push(id);
  updateBoostPick();
  const card=document.querySelector(`#boostPickGrid .bp-card[data-id="${id}"]`);
  if(card){ card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
  SFX.select();
}

// ── Satın alma onayı ──
function boostModalOpen(html, closable){
  const m=document.getElementById('boostModal');
  document.getElementById('boostModalBox').innerHTML=html;
  m.onclick = closable ? (e=>{ if(e.target===m) boostModalClose(); }) : null;
  m.classList.add('open'); void m.offsetWidth; m.classList.add('show');
}
function boostModalClose(){
  const m=document.getElementById('boostModal');
  m.classList.remove('show');
  setTimeout(()=>{ if(!m.classList.contains('show')) m.classList.remove('open'); },260);
}

function openBoostBuy(id){
  const b=boostDef(id), can=G.coins>=b.price;
  boostModalOpen(`
    <div class="bst-big">${b.icon}</div>
    <h3>${b.name}</h3>
    <p>${b.desc}</p>
    <div class="bst-price">🪙 ${b.price} Altın<small>Altının: ${G.coins} · Mağazada 3'lü paket: 🪙 ${b.price*3}</small></div>
    <div class="bst-btns">
      <button class="btn" ${can?'':'disabled style="opacity:.5"'} onclick="boostBuyConfirm('${id}')">${can?'SATIN AL VE SEÇ ✦':'🪙 Yetersiz altın'}</button>
      <button class="btn secondary" onclick="boostModalClose()">Vazgeç</button>
    </div>`, true);
}

function boostBuyConfirm(id){
  const b=boostDef(id);
  if(G.coins<b.price){ showToast('🪙 Yeterli altın yok!','warning'); return; }
  G.coins-=b.price;
  addInv(id,1);
  saveGame(); updateCoinsUI();
  if(BOOST.picked.length<BOOST_MAX && !BOOST.picked.includes(id)) BOOST.picked.push(id);
  boostModalClose();
  updateBoostPick();
  SFX.unlock();
  showToast(`${b.icon} ${b.name} alındı! 🪙 -${b.price}`);
}

// ── OYUN İÇİ BAR ──
function renderBoostBar(){
  const wrap=document.getElementById('boostBarWrap'), bar=document.getElementById('boostBar');
  if(!wrap) return;
  wrap.hidden=!G.activeBoost.length;
  bar.innerHTML=G.activeBoost.map((id,i)=>{
    const b=boostDef(id);
    return `<button class="bb-btn${b.passive?' passive':''}${BOOST.aim===id?' active':''}" data-id="${id}"
      style="--bc:${b.rgb};--i:${i}" onclick="onBoostBarTap('${id}')" aria-label="${b.name}">${b.icon}<span>${b.passive?'Hazır':b.name}</span></button>`;
  }).join('');
  boostSyncAim();
}

function boostSyncAim(){
  const hint=document.getElementById('boostHint');
  const def=BOOST.aim && boostDef(BOOST.aim);
  hint.textContent=def ? def.hint : '';
  hint.classList.toggle('on',!!def);
  document.getElementById('board').classList.toggle('boost-aim',!!def);
  document.querySelectorAll('#boostBar .bb-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.id===BOOST.aim));
}

function onBoostBarTap(id){
  if(!G.gameActive || BOOST.busy) return;
  if(typeof TS!=='undefined' && TS.active) return;   // tutorial spotlight sırasında kullanma
  const b=boostDef(id);
  if(b.passive){ showToast('🛡️ Kalkan hazır: kaybedersen 1 kez ücretsiz tekrar oynarsın'); return; }
  if(G.selected){ getCellEl(G.selected.r,G.selected.c)?.classList.remove('selected'); G.selected=null; }
  if(b.target){
    BOOST.aim = BOOST.aim===id ? null : id;   // tekrar dokununca iptal
    boostSyncAim(); SFX.select();
    return;
  }
  BOOST.aim=null; boostSyncAim();
  if(id==='boost_shuffle') boostShuffle();
  else if(id==='boost_moves') boostMoves();
}

// Kullanılan boosterı envanterden düş ve bardan kaldır
function boostConsume(id){
  useInv(id,1);
  const i=G.activeBoost.indexOf(id);
  if(i>=0) G.activeBoost.splice(i,1);
  saveGame();
  const btn=document.querySelector(`#boostBar .bb-btn[data-id="${id}"]`);
  if(btn){ btn.classList.add('used'); setTimeout(renderBoostBar,430); }
  else renderBoostBar();
}

// ── Hedefli boosterlar ──
function boostApplyAt(r,c){
  const id=BOOST.aim;
  if(!G.board[r][c]) return;
  if(id==='boost_rainbow' && isObstacle(G.board[r][c])){ showToast('🌈 Renkli bir taşa dokun','warning'); return; }
  BOOST.aim=null; boostSyncAim();
  const set=new Set();
  if(id==='boost_lightning'){
    for(let i=0;i<BS;i++){ set.add(`${r},${i}`); set.add(`${i},${c}`); }
    fxLightning(r,c); SFX.super();
  } else if(id==='boost_bomb'){
    for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
      const rr=r+dr, cc=c+dc;
      if(rr>=0&&rr<BS&&cc>=0&&cc<BS) set.add(`${rr},${cc}`);
    }
    fxBomb(r,c); SFX.bomb();
  } else if(id==='boost_rainbow'){
    const base=getGemBase(G.board[r][c]);
    for(let rr=0;rr<BS;rr++) for(let cc=0;cc<BS;cc++) if(getGemBase(G.board[rr][cc])===base) set.add(`${rr},${cc}`);
    fxRainbow(r,c,set); SFX.super();
  } else return;
  boostConsume(id);
  boostClear(set, r, c, 260);
}

// Hücreleri temizle → hedef/puan → düşür/doldur → zincir kontrolü (mevcut akış)
function boostClear(set, r0, c0, delay){
  G.gameActive=false; BOOST.busy=true;
  const cells=[...set].map(s=>{ const[r,c]=s.split(','); return {r:+r,c:+c}; }).filter(({r,c})=>G.board[r][c]);
  setTimeout(()=>{
    cells.forEach(({r,c})=>{
      const base=getGemBase(G.board[r][c]);
      if(base&&G.goalProgress[base]!==undefined) G.goalProgress[base]++;
      const el=getCellEl(r,c);
      if(el){
        el.classList.add('matched');
        if(cells.length<=20 || Math.random()<.5){
          const rc=el.getBoundingClientRect();
          spawnParticles(rc.left+rc.width/2, rc.top+rc.height/2, GEMS[base]?.color||'#f5c842', 5);
        }
      }
    });
    const pts=cells.length*60;
    G.score+=pts;
    document.getElementById('scoreVal').textContent=G.score;
    const ref=getCellEl(r0,c0);
    if(ref){ const rc=ref.getBoundingClientRect(); showScorePop(`+${pts}`, rc.left+rc.width/2, rc.top); }
    updateGoalBar();
    setTimeout(()=>{
      boardClearCells(cells);
      dropGems(); fillBoard(); renderBoard();
      G.gameActive=true;
      setTimeout(()=>{
        BOOST.busy=false;
        const {cells:newM}=findMatchesExtended();
        if(newM.length>0) processMatches(newM,true);
        else checkEndConditions();
      },350);
    },380);
  }, delay||0);
}

// ── Anında uygulanan boosterlar ──
function boostShuffle(){
  G.gameActive=false; BOOST.busy=true;
  const flat=[], slots=[];
  for(let r=0;r<BS;r++) for(let c=0;c<BS;c++) if(!isObstacle(G.board[r][c])){ flat.push(G.board[r][c]); slots.push([r,c]); }
  let tries=0, ok=false;
  do{
    for(let i=flat.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [flat[i],flat[j]]=[flat[j],flat[i]]; }
    slots.forEach(([r,c],i)=>{ G.board[r][c]=flat[i]; });
    ok=!hasAnyMatch() && hasAnyPossibleMove();
  } while(!ok && ++tries<150);
  if(!ok){ tries=0; do{ shuffleBoard(); }while((hasAnyMatch()||!hasAnyPossibleMove()) && ++tries<150); }
  boostConsume('boost_shuffle');
  const board=document.getElementById('board');
  board.classList.remove('bst-spin'); void board.offsetWidth; board.classList.add('bst-spin');
  SFX.select();
  setTimeout(()=>{ renderBoard(); }, 270);
  setTimeout(()=>{ board.classList.remove('bst-spin'); G.gameActive=true; BOOST.busy=false; showToast('🔀 Tahta karıştırıldı!'); }, 620);
}

function boostMoves(){
  G.moves+=5;
  const mv=document.getElementById('movesVal');
  mv.textContent=G.moves;
  mv.classList.remove('bst-plus'); void mv.offsetWidth; mv.classList.add('bst-plus');
  const rc=mv.getBoundingClientRect();
  const f=document.createElement('div');
  f.className='bst-float'; f.textContent='+5';
  f.style.left=(rc.left+rc.width/2)+'px'; f.style.top=(rc.top+rc.height/2)+'px';
  document.body.appendChild(f); setTimeout(()=>f.remove(),1000);
  spawnParticles(rc.left+rc.width/2, rc.top+rc.height/2, '#44ff88', 14);
  boostConsume('boost_moves');
  SFX.energy();
  showToast('⏱️ +5 Hamle eklendi!');
}

// ── Efektler ──
function fxEl(cls, css){ const e=document.createElement('div'); e.className=cls; Object.assign(e.style,css); document.body.appendChild(e); return e; }

function fxLightning(r,c){
  const br=document.getElementById('board').getBoundingClientRect();
  const cr=getCellEl(r,c).getBoundingClientRect();
  const cx=cr.left+cr.width/2, cy=cr.top+cr.height/2, t=18;
  const h=fxEl('bst-beam h',{left:br.left+'px',top:(cy-t/2)+'px',width:br.width+'px',height:t+'px'});
  h.style.setProperty('--bd','180deg'); h.style.setProperty('--ox',(cx-br.left)+'px'); h.style.setProperty('--s0x','0'); h.style.setProperty('--s0y','1');
  const v=fxEl('bst-beam v',{left:(cx-t/2)+'px',top:br.top+'px',width:t+'px',height:br.height+'px'});
  v.style.setProperty('--bd','90deg'); v.style.setProperty('--oy',(cy-br.top)+'px'); v.style.setProperty('--s0x','1'); v.style.setProperty('--s0y','0');
  const fl=fxEl('bst-flash',{}); fl.style.setProperty('--fx',cx+'px'); fl.style.setProperty('--fy',cy+'px');
  spawnParticles(cx,cy,'#bfe8ff',18);
  setTimeout(()=>{ h.remove(); v.remove(); fl.remove(); },600);
}

function fxBomb(r,c){
  const a=getCellEl(Math.max(0,r-2),Math.max(0,c-2)).getBoundingClientRect();
  const z=getCellEl(Math.min(BS-1,r+2),Math.min(BS-1,c+2)).getBoundingClientRect();
  const cr=getCellEl(r,c).getBoundingClientRect();
  const cx=cr.left+cr.width/2, cy=cr.top+cr.height/2;
  const area=fxEl('bst-area',{left:(a.left-4)+'px',top:(a.top-4)+'px',width:(z.right-a.left+8)+'px',height:(z.bottom-a.top+8)+'px'});
  const sh=fxEl('bst-shock',{left:cx+'px',top:cy+'px'});
  const fl=fxEl('bst-flash',{}); fl.style.setProperty('--fx',cx+'px'); fl.style.setProperty('--fy',cy+'px');
  const board=document.getElementById('board');
  board.classList.remove('bst-shake'); void board.offsetWidth; board.classList.add('bst-shake');
  spawnParticles(cx,cy,'#ff9a30',22); spawnParticles(cx,cy,'#ffe070',12);
  showComboText('💣 MEGA BOMBA!',cx,cr.top-10,'#ffb040');
  setTimeout(()=>{ area.remove(); sh.remove(); fl.remove(); board.classList.remove('bst-shake'); },700);
}

function fxRainbow(r,c,set){
  const cr=getCellEl(r,c).getBoundingClientRect();
  const cx=cr.left+cr.width/2, cy=cr.top+cr.height/2;
  const w=fxEl('bst-rainbow-wave',{left:cx+'px',top:cy+'px'});
  const rings=[];
  set.forEach(s=>{
    const [rr,cc]=s.split(',').map(Number);
    const el=getCellEl(rr,cc); if(!el) return;
    const rc=el.getBoundingClientRect();
    const d=Math.hypot(rr-r,cc-c);
    const ring=fxEl('bst-ring',{left:(rc.left-4)+'px',top:(rc.top-4)+'px',width:(rc.width+8)+'px',height:(rc.height+8)+'px',animationDelay:(d*35)+'ms'});
    rings.push(ring);
  });
  showComboText('🌈 GÖKKUŞAĞI!',cx,cr.top-10,'#ff8ad8');
  setTimeout(()=>{ w.remove(); rings.forEach(x=>x.remove()); },1000);
}

// ── KALKAN ──
function openShieldPrompt(){
  SFX.unlock();
  boostModalOpen(`
    <div class="bst-big">🛡️</div>
    <h3>KALKAN DEVREDE!</h3>
    <p>Bölümü kaybettin ama kalkanın seni korudu. Bu bölümü <b style="color:var(--gold)">enerji harcamadan</b> 1 kez tekrar oyna!</p>
    <div class="bst-btns" style="margin-top:16px;">
      <button class="btn" onclick="boostShieldReplay()">🛡️ ÜCRETSİZ TEKRAR OYNA</button>
      <button class="btn secondary" onclick="boostShieldDecline()">Vazgeç</button>
    </div>`, false);
}

function boostShieldReplay(){
  boostModalClose();
  useInv('boost_shield',1);
  const i=G.activeBoost.indexOf('boost_shield'); if(i>=0) G.activeBoost.splice(i,1);
  G.shieldActive=false;
  // Ücretsiz: startLevel'in harcayacağı enerjiyi önceden geri ver
  const keepTime=G.lastEnergyTime;
  G.energy+=1;
  BOOST.replay=true;
  startLevel();
  G.lastEnergyTime=keepTime;
  if(CURRENT_USER && CURRENT_USER.stats.energyUsed>0) CURRENT_USER.stats.energyUsed--;
  saveGame(); updateEnergyUI();
  showToast('🛡️ Kalkan kullanıldı — tekrar dene!');
}

function boostShieldDecline(){
  boostModalClose();
  G.shieldActive=false;          // kalkan harcanmaz, envanterde kalır
  showResult(false);
}

function boostEndGame(){
  BOOST.aim=null; BOOST.busy=false;
  G.activeBoost=[]; G.shieldActive=false;
  renderBoostBar();
}

// ── Mevcut fonksiyonlara bağlantılar (sarmalama) ──
// Aktif booster varken taşa dokunma → booster efekti
const _boostOrigCellClick = onCellClick;
onCellClick = function(r,c){
  if(BOOST.aim){
    if(G.gameActive && !BOOST.busy) boostApplyAt(r,c);
    return;
  }
  return _boostOrigCellClick.apply(this,arguments);
};

// Kaybedince kalkan kontrolü
const _boostOrigShowResult = showResult;
showResult = function(win){
  if(!win && G.shieldActive && boostOwned('boost_shield')>0){ openShieldPrompt(); return; }
  boostEndGame();
  return _boostOrigShowResult.apply(this,arguments);
};

// Oyun başlarken seçilen boosterları G.activeBoost'a aktar
const _boostOrigStartLevel = startLevel;
startLevel = function(){
  const replay=BOOST.replay; BOOST.replay=false;
  const picks=(replay ? G.activeBoost : BOOST.picked).slice();
  const res=_boostOrigStartLevel.apply(this,arguments);
  if(G.gameActive && document.getElementById('gameScreen').classList.contains('active')){
    G.activeBoost=picks.filter(id=>boostOwned(id)>0);
    G.shieldActive=G.activeBoost.includes('boost_shield');
    BOOST.aim=null; BOOST.busy=false;
    if(!replay) BOOST.picked=[];
    renderBoostBar();
  }
  return res;
};

const _boostOrigExitGame = exitGame;
exitGame = function(){
  boostEndGame();
  return _boostOrigExitGame.apply(this,arguments);
};

// Level ekranı her açıldığında booster seçimini sıfırla ve çiz
const _boostOrigShowScreen = showScreen;
showScreen = function(id){
  const res=_boostOrigShowScreen.apply(this,arguments);
  if(id==='levelScreen'){ BOOST.picked=[]; buildBoostPick(); }
  return res;
};
