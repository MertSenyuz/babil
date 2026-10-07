// ══════════════════════════════════════════════
// KAYDIRMA (SWIPE / DRAG) İLE TAŞ TAKASI
// Dokun-seç sisteminin yerini alır. onCellClick() pasif olarak duruyor.
// ══════════════════════════════════════════════
const SWIPE_MIN  = 20;    // px — daha kısa hareket kaydırma sayılmaz
const SWIPE_DIAG = 0.7;   // kısa eksen / uzun eksen bu oranı aşarsa çapraz sayılır → geçersiz
const SW = {on:false, id:null, r:-1, c:-1, x0:0, y0:0, el:null, size:0, busy:false, busyT:0, tgt:null};

// Takas + zincirleme eşleşmeler bitene kadar yeni kaydırmayı kilitle
function swLock(on){
  SW.busy=on; clearTimeout(SW.busyT);
  if(on) SW.busyT=setTimeout(()=>{ SW.busy=false; },9000);   // güvenlik: kilit takılı kalmasın
}

function swPt(e){
  if(!e.changedTouches) return SW.id==='mouse' ? e : null;
  for(const t of e.changedTouches) if(t.identifier===SW.id) return t;
  return null;
}

function swReset(el){
  if(!el) return;
  el.classList.remove('sw-drag','sw-slide');
  el.style.transform=''; el.style.transition='';
}

function swShake(el){
  if(!el) return;
  swReset(el);
  el.classList.remove('sw-shake'); void el.offsetWidth; el.classList.add('sw-shake');
  setTimeout(()=>el.classList.remove('sw-shake'),340);
}

function swSlide(el,x,y){
  if(!el) return;
  el.classList.remove('sw-drag');
  el.classList.add('sw-slide');
  el.style.transform=`translate(${x}px,${y}px)`;
}

function swStart(e){
  if(SW.on) return;
  if(!e.changedTouches && e.button!==0) return;
  const el=e.target?.closest?.('#board .cell');
  if(!el) return;
  if(e.cancelable) e.preventDefault();          // sayfa kaydırma / zoom / metin seçimi olmasın
  if(!G.gameActive || SW.busy || BOOST.busy) return;
  const r=+el.dataset.r, c=+el.dataset.c;
  const gem=G.board[r]?.[c];
  if(!gem) return;
  if(G.selected){ getCellEl(G.selected.r,G.selected.c)?.classList.remove('selected'); G.selected=null; }
  const pt=e.changedTouches ? e.changedTouches[0] : e;
  Object.assign(SW,{on:true, id:e.changedTouches?pt.identifier:'mouse', r, c, x0:pt.clientX, y0:pt.clientY, el, size:el.offsetWidth||40});

  // Dokunma olayları hep başladığı öğeye gelir → dinleyiciyi oraya bağla (öğe DOM'dan çıksa bile çalışır)
  if(e.changedTouches){
    SW.tgt=e.target;
    SW.tgt.addEventListener('touchmove',swMove,{passive:false});
    SW.tgt.addEventListener('touchend',swEnd,{passive:false});
    SW.tgt.addEventListener('touchcancel',swCancel,{passive:false});
  }

  if(BOOST.aim || isObstacle(gem)) return;      // booster/engel: sürükleme efekti yok
  el.classList.add('sw-drag');
  SFX.select();
}

function swMove(e){
  if(!SW.on) return;
  const pt=swPt(e); if(!pt) return;
  if(e.cancelable) e.preventDefault();
  const el=SW.el;
  if(!el || !el.classList.contains('sw-drag')) return;
  // Taş, parmağın baskın ekseni boyunca hafifçe hareket eder (en fazla hücrenin %35'i)
  const dx=pt.clientX-SW.x0, dy=pt.clientY-SW.y0, max=SW.size*0.35;
  const cl=v=>Math.max(-max,Math.min(max,v));
  const horiz=Math.abs(dx)>=Math.abs(dy);
  el.style.transform=`translate(${horiz?cl(dx):0}px,${horiz?0:cl(dy)}px) scale(1.08)`;
}

function swDetach(){
  if(!SW.tgt) return;
  SW.tgt.removeEventListener('touchmove',swMove);
  SW.tgt.removeEventListener('touchend',swEnd);
  SW.tgt.removeEventListener('touchcancel',swCancel);
  SW.tgt=null;
}

function swCancel(e){
  if(!SW.on || !swPt(e)) return;
  SW.on=false; swDetach(); swReset(SW.el);
}

function swEnd(e){
  if(!SW.on) return;
  const pt=swPt(e); if(!pt) return;             // başka parmak kalktı
  if(e.cancelable) e.preventDefault();
  SW.on=false; swDetach();
  const {r,c,el}=SW;
  const dx=pt.clientX-SW.x0, dy=pt.clientY-SW.y0;
  const ax=Math.abs(dx), ay=Math.abs(dy), dist=Math.max(ax,ay);
  const gem=G.board[r]?.[c];
  if(!G.gameActive || SW.busy || !gem){ swReset(el); return; }

  // Aktif booster: yön önemli değil, kaydırmanın başladığı taşa uygulanır (dokunmak da yeter)
  if(BOOST.aim){ swReset(el); if(!BOOST.busy) boostApplyAt(r,c); return; }

  if(isObstacle(gem) || hdFrozen(r,c)){
    swReset(el); el.classList.remove('obst-shake'); void el.offsetWidth; el.classList.add('obst-shake');
    SFX.invalid(); return;
  }
  if(dist<SWIPE_MIN){ swReset(el); return; }                          // yanlışlıkla dokunma
  if(Math.min(ax,ay)/dist>SWIPE_DIAG){ swShake(el); SFX.invalid(); return; }   // çapraz → geçersiz

  let tr=r, tc=c;
  if(ax>ay) tc+=dx>0?1:-1; else tr+=dy>0?1:-1;
  const tgem=(tr>=0&&tr<BS&&tc>=0&&tc<BS) ? G.board[tr][tc] : null;
  if(!tgem || isObstacle(tgem) || hdFrozen(tr,tc)){
    swShake(el); SFX.invalid();
    if(tgem){ const te=getCellEl(tr,tc); te?.classList.remove('obst-shake'); void te?.offsetWidth; te?.classList.add('obst-shake'); }
    return;
  }
  swTrySwap(r,c,tr,tc);
}

// Mevcut takas/eşleşme mantığıyla (swapGems, findMatchesExtended, processMatches, triggerPowerMerge) hamle yap
function swTrySwap(r1,c1,r2,c2){
  const a=getCellEl(r1,c1), b=getCellEl(r2,c2);
  const step=(a?.offsetWidth||SW.size)+4;       // hücre + grid boşluğu
  const dx=(c2-c1)*step, dy=(r2-r1)*step;
  const movesBefore=G.moves;
  swLock(true);
  swSlide(a,dx,dy); swSlide(b,-dx,-dy);

  setTimeout(()=>{
    if(!G.gameActive){ swReset(a); swReset(b); swLock(false); return; }
    swapGems(r1,c1,r2,c2);
    const gem1=G.board[r1][c1], gem2=G.board[r2][c2];
    const pow1=getGemPower(gem1), pow2=getGemPower(gem2);
    const isP1=pow1==='bomb'||pow1==='super', isP2=pow2==='bomb'||pow2==='super';

    // İki güç taşı birbirine kaydırıldı → birleşim
    if(isP1 && isP2){
      G.moves--; document.getElementById('movesVal').textContent=G.moves;
      renderBoard();
      triggerPowerMerge(r1,c1,r2,c2,pow1,pow2,gem1,gem2);
      swTutCheck(movesBefore);
      return;
    }

    const {cells:matches}=findMatchesExtended();
    if(matches.length===0){
      // Eşleşme yok → geri kay ve titre
      swapGems(r1,c1,r2,c2);
      SFX.invalid();
      swSlide(a,0,0); swSlide(b,0,0);
      setTimeout(()=>{ swReset(b); swShake(a); swLock(false); },160);
      return;
    }

    G.moves--; document.getElementById('movesVal').textContent=G.moves;
    renderBoard();
    G._swapCells={r1,c1,r2,c2};          // yalnızca bu hamlenin ilk eşleşmesi için (zincirlerde yok)
    try{ processMatches(matches); } finally { G._swapCells=null; }
    swTutCheck(movesBefore);
  },160);
}

// İlk bölüm öğreticisi: hamle yapıldıysa başarı
function swTutCheck(movesBefore){
  if(typeof TS!=='undefined' && TS.active && G.moves<movesBefore) tutSpotSuccess();
}

// Zincirleme eşleşmeler bitince kilidi aç
const _swOrigCheckEnd = checkEndConditions;
checkEndConditions = function(){
  swLock(false);
  return _swOrigCheckEnd.apply(this,arguments);
};

// Yeni bölüm başlarken yarım kalan kaydırmayı temizle
const _swOrigStartLevel = startLevel;
startLevel = function(){
  SW.on=false; swDetach(); swLock(false);
  return _swOrigStartLevel.apply(this,arguments);
};

(function swBind(){
  const board=document.getElementById('board');
  if(!board) return;
  board.addEventListener('touchstart',swStart,{passive:false});
  board.addEventListener('mousedown',swStart);
  window.addEventListener('mousemove',swMove);
  window.addEventListener('mouseup',swEnd);
  board.addEventListener('contextmenu',e=>e.preventDefault());   // uzun basınca menü açılmasın
})();
