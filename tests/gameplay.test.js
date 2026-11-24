// Uçtan uca oynanış: bir bot gerçek tıklama akışıyla (onCellClick) bölümleri sonuna kadar oynar.
// Her medeniyetten bölümler; zorluk mekanikleri (engeller, düşen bomba, su, karanlık, karışma) dahil.
// Beklenen: hiç sayfa hatası yok, bölüm kazanılır ya da kaybedilir ve sonuç ekranı açılır.
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

const wait = ms=>new Promise(r=>setTimeout(r, ms));

async function newPlayer(){
  const g = await loadGame({query:'?test', fast:true});
  g.run(`CURRENT_USER = {username:"bot", stats:{gamesPlayed:0,wins:0,losses:0,totalCoins:0,energyUsed:0,maxStarsInGame:0}, achievements:[], tutorial:{done:true}};
         G.buildingProgress = []; ensureProgress(); G.coins = 1000; G.energy = 10;`);
  return g;
}

// Tahtada geçerli bir takas bul (oyunun kendi kuralları: engel/donmuş hücre takas edilmez)
const FIND_MOVE = `(()=>{
  for(let r=0;r<BS;r++) for(let c=0;c<BS;c++){
    if(isObstacle(G.board[r][c]) || hdFrozen(r,c)) continue;
    for(const [dr,dc] of [[0,1],[1,0]]){
      const rr=r+dr, cc=c+dc;
      if(rr>=BS||cc>=BS||isObstacle(G.board[rr][cc])||hdFrozen(rr,cc)) continue;
      swapGems(r,c,rr,cc); const ok=findMatches().length>0; swapGems(r,c,rr,cc);
      if(ok) return [r,c,rr,cc];
    }
  }
  return null;
})()`;

async function playLevel(g, b, l){
  g.run(`G.energy=10; selectedBuilding=${b}; selectedLevel=${l}; startLevel();`);
  await wait(20);
  const screen = ()=>g.doc.querySelector('.screen.active')?.id;
  assert.equal(screen(), 'gameScreen', `bölüm ${b}/${l} açılmadı`);
  for(let step=0; step<1000; step++){   // obfuscate derleme daha yavaş: bütçe geniş
    if(screen()==='resultScreen') return g.val('_lastResultWin');
    if(g.doc.getElementById('reshuffleModal')?.classList.contains('open')){ g.run('doReshuffle()'); await wait(15); continue; }
    if(g.doc.querySelector('.boost-modal.open, #boostModal.open')){ g.run('typeof boostShieldDecline==="function" && boostShieldDecline()'); await wait(15); continue; }
    const idle = g.val('G.gameActive && !SW.busy && !BOOST.busy && !HD.cascading && !HD.shuffling');
    if(!idle){ await wait(8); continue; }
    const mv = g.val(FIND_MOVE);
    if(!mv){ await wait(8); continue; }
    g.run(`G.selected=null; onCellClick(${mv[0]},${mv[1]}); onCellClick(${mv[2]},${mv[3]});`);
    await wait(8);
  }
  assert.fail(`bölüm ${b}/${l} bütçe doldu, bitmedi (ekran: ${screen()}, hamle: ${g.val('G.moves')})`);
}

for(let c=0;c<9;c++){
  test(`medeniyet ${c}: ilk ve son yapının ilk ve son bölümleri hatasız oynanır`, {timeout:180000}, async()=>{
    const g = await newPlayer();
    const idxs = g.val(`civBuildingIdx(${c})`);
    for(const b of [idxs[0], idxs[5]]){
      const n = g.val(`BUILDINGS[${b}].levels.length`);
      for(const l of [0, n-1]){
        const win = await playLevel(g, b, l);
        assert.equal(typeof win, 'boolean');
        assert.deepEqual(g.errors, [], `bölüm ${b}/${l}`);
        const res = g.val(`({stars:G.buildingProgress[${b}].stars[${l}], score:G.score})`);
        if(win) assert.ok(res.stars>=1, 'kazanıldı ama yıldız yok');
        assert.ok(res.score>0, `bölüm ${b}/${l}: bot hiç eşleşme yapamadı`);
        console.log(`  civ ${c} bölüm ${b}/${l}: ${win?'ZAFER':'yenilgi'} puan=${res.score} yıldız=${res.stars}`);
        g.run('hdStopBombs && hdStopBombs()');
      }
    }
    assert.ok(g.val('CURRENT_USER.stats.gamesPlayed')>=4);
    g.close();
  });
}
