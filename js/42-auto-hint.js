// ══════════════════════════════════════════════
// OTOMATİK İPUCU — 10 sn hamle yapılmazsa en iyi hamle gösterilir
// Sayaç: tahta boştayken artar · hamle/zincir sırasında sıfırlanır · pencere açıkken / oyun pasifken durur
// ══════════════════════════════════════════════
const HINT_IDLE_MS = 10000, HINT_STRONG_MS = 2000, HINT_TICK_MS = 250;
const AH = {idle:0, move:null, strongT:0, waveT:0, els:[]};
let hintTimer = 0;

// Duraklatılmış mı (sayaç olduğu yerde bekler)
function hintPaused(){
  return document.hidden || !G.gameActive || (typeof TS!=='undefined' && TS.active) || !!BOOST.aim
    || !!document.querySelector('.modal-overlay.open, .bst-modal.open, .lm-ov.open, #goalHelpPop.open, #dailyModal.open, #tutWelcome.open, #tutSpot.open, #civTransition.open');
}
// Tahta meşgul mü (hamle / zincirleme eşleşme / karışma → sayaç sıfırlanır)
function hintBusy(){
  return SW.busy || SW.on || BOOST.busy || HD.cascading || HD.shuffling;
}
function hintReset(){ AH.idle=0; }

function hintTick(){
  if(!document.getElementById('gameScreen')?.classList.contains('active')){ AH.idle=0; return; }
  if(hintPaused()) return;
  if(hintBusy()){ AH.idle=0; return; }
  AH.idle+=HINT_TICK_MS;
  if(AH.idle>=HINT_IDLE_MS){ AH.idle=0; showHint(); }   // gösterildikten sonra tekrar 10 sn bekle
}

// En iyi hamle: 5+ (⚡) > 4 / L-T (💥) > 3; eşitlikte hedefe en çok katkı, sonra en çok taş
function findBestHint(){
  const dark=(r,c)=>getCellEl(r,c)?.classList.contains('hd-dark');   // karanlıktaki taşı ele verme
  const ok=(r,c)=>{ const g=G.board[r][c]; return g && !isObstacle(g) && !hdFrozen(r,c) && !dark(r,c); };
  const need={};
  Object.entries(G.goals||{}).forEach(([k,t])=>{ const n=t-(G.goalProgress[k]||0); if(n>0 && GEMS[k]) need[k]=n; });
  let best=null;
  for(let r=0;r<BS;r++) for(let c=0;c<BS;c++){
    if(!ok(r,c)) continue;
    for(const [dr,dc] of [[0,1],[1,0]]){
      const r2=r+dr, c2=c+dc;
      if(r2>=BS || c2>=BS || !ok(r2,c2)) continue;
      const p1=getGemPower(G.board[r][c]), p2=getGemPower(G.board[r2][c2]);
      const merge=(p1==='bomb'||p1==='super') && (p2==='bomb'||p2==='super');   // iki güç taşı birleşimi
      swapGems(r,c,r2,c2);
      const {cells,powerGems}=findMatchesExtended();
      swapGems(r,c,r2,c2);
      if(!cells.length && !merge) continue;
      const tier = merge ? 4 : powerGems.some(p=>p.type==='super') ? 3 : powerGems.length ? 2 : 1;
      // Hedefe katkı: eşleşen taşlardan hâlâ eksik olan türler (takastan sonraki konumlara göre)
      const left={...need}; let goal=0;
      cells.forEach(({r:rr,c:cc})=>{
        const src = rr===r&&cc===c ? G.board[r2][c2] : rr===r2&&cc===c2 ? G.board[r][c] : G.board[rr][cc];
        const k=getGemBase(src);
        if(left[k]>0){ left[k]--; goal++; }
      });
      const score=tier*1e6 + goal*1e3 + cells.length;
      if(!best || score>best.score) best={r1:r,c1:c,r2,c2,score,tier,goal};
    }
  }
  return best;
}

function clearHint(){
  clearTimeout(AH.strongT); clearInterval(AH.waveT);
  AH.els.forEach(e=>e.remove()); AH.els=[];
  document.getElementById('board')?.classList.remove('ah-on');
  document.querySelectorAll('#board .ah-cell').forEach(el=>{
    el.classList.remove('ah-cell','ah-strong','ah-soft');
    el.querySelector('.ah-arrow')?.remove();
  });
  document.querySelectorAll('.goal-item.ah-goal').forEach(el=>el.classList.remove('ah-goal'));
  AH.move=null;
}

function showHint(){
  clearHint();
  if(!G.gameActive) return;
  const m=findBestHint();
  if(!m) return;
  const a=getCellEl(m.r1,m.c1), b=getCellEl(m.r2,m.c2);
  if(!a || !b) return;
  AH.move=m;
  document.getElementById('board').classList.add('ah-on');
  // Ok yönü: her taş diğerine doğru bakar
  const dirA = m.r2>m.r1 ? 'down' : 'right', dirB = m.r2>m.r1 ? 'up' : 'left';
  [[a,dirA],[b,dirB]].forEach(([el,dir])=>{
    el.classList.add('ah-cell','ah-strong');
    const ar=document.createElement('i');
    ar.className='ah-arrow ah-'+dir;
    ar.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 12h12M11 6l6 6-6 6" fill="none" stroke="#f5c842" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    el.appendChild(ar);
  });
  AH.strongT=setTimeout(()=>{
    [a,b].forEach(el=>{ el.classList.remove('ah-strong'); el.classList.add('ah-soft'); });
    clearInterval(AH.waveT);
  }, HINT_STRONG_MS);
  // Altın parçacıklar: iki taştan çıkıp ortada buluşur (güçlü evre boyunca)
  hintParticles(a,b);
  AH.waveT=setInterval(()=>hintParticles(a,b), 650);
  // Hedef bağlantısı
  const bases=[getGemBase(G.board[m.r1][m.c1]), getGemBase(G.board[m.r2][m.c2])]
    .filter(k=>k && G.goals[k]!=null && (G.goalProgress[k]||0)<G.goals[k]);
  if(bases.length){
    bases.forEach(k=>document.getElementById('goal_'+k)?.classList.add('ah-goal'));
    const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
    const tip=document.createElement('div');
    tip.className='ah-tip'; tip.textContent='Bu taşı patlat!';
    tip.style.left=((ra.left+rb.right)/2)+'px';
    tip.style.top=Math.min(ra.top,rb.top)+'px';
    document.body.appendChild(tip); AH.els.push(tip);
    setTimeout(()=>{ tip.remove(); AH.els=AH.els.filter(e=>e!==tip); },1500);
  }
}

function hintParticles(a,b){
  if(gfReduce() || !a.isConnected || !b.isConnected) return;
  const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
  const ax=ra.left+ra.width/2, ay=ra.top+ra.height/2, bx=rb.left+rb.width/2, by=rb.top+rb.height/2;
  const mx=(ax+bx)/2, my=(ay+by)/2;
  [[ax,ay],[bx,by]].forEach(([x,y])=>{
    for(let i=0;i<4;i++){
      const p=document.createElement('div');
      const s=3+Math.random()*3, jx=(Math.random()-.5)*ra.width*.6, jy=(Math.random()-.5)*ra.height*.6;
      p.className='ah-spark';
      p.style.cssText=`left:${x+jx}px;top:${y+jy}px;width:${s}px;height:${s}px;`;
      gfOnce(p,[
        {transform:'translate(-50%,-50%) scale(.4)',opacity:0},
        {transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.25},
        {transform:`translate(calc(-50% + ${mx-x-jx}px),calc(-50% + ${my-y-jy}px)) scale(.6)`,opacity:0}
      ],{duration:620+Math.random()*180,delay:i*70,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});
    }
  });
}

// ── Bağlantılar ──
(function hintBind(){
  hintTimer=setInterval(hintTick, HINT_TICK_MS);
  const board=document.getElementById('board');
  // Tahtaya dokunmak (kaydırma başlangıcı) ipucunu kapatır ve sayacı sıfırlar
  const touch=()=>{ clearHint(); hintReset(); };
  board?.addEventListener('touchstart', touch, {passive:true, capture:true});
  board?.addEventListener('mousedown', touch, {capture:true});
})();
const _ahOrigCellClick = onCellClick;
onCellClick = function(){ clearHint(); hintReset(); return _ahOrigCellClick.apply(this,arguments); };
const _ahOrigStartLevel = startLevel;
startLevel = function(){ clearHint(); hintReset(); return _ahOrigStartLevel.apply(this,arguments); };
// Tahta yeniden çizilince (hamle, yenileme, karışma) eski ipucu geçersiz
const _ahOrigRenderBoard = renderBoard;
renderBoard = function(){ if(AH.move) clearHint(); hintReset(); return _ahOrigRenderBoard.apply(this,arguments); };
const _ahOrigShowResult = showResult;
showResult = function(){ clearHint(); return _ahOrigShowResult.apply(this,arguments); };
const _ahOrigExitGame = exitGame;
exitGame = function(){ clearHint(); return _ahOrigExitGame.apply(this,arguments); };

initLanguage();
