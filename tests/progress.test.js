// İlerleme: yapı/medeniyet kilitleri, yıldız ve altın ödülü, sıradaki bölüm, eski kayıt göçü
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

let g;
test.beforeEach(async()=>{
  g = await loadGame();
  g.run(`CURRENT_USER = {username:"t", stats:{gamesPlayed:0,wins:0,losses:0,totalCoins:0,energyUsed:0,maxStarsInGame:0}, achievements:[]};
         G.buildingProgress = []; ensureProgress(); G.coins = 100;`);
});
test.afterEach(()=>g.close());

const complete = idxs=>g.run(`[${idxs}].forEach(i=>G.buildingProgress[i].stars=G.buildingProgress[i].stars.map(()=>1))`);

test('başlangıçta yalnızca Babil ve ilk yapısı açık', ()=>{
  assert.equal(g.val('isCivUnlocked(0)'), true);
  assert.equal(g.val('isCivUnlocked(1)'), false);
  assert.equal(g.val('isBuildingUnlocked(0)'), true);
  assert.equal(g.val('isBuildingUnlocked(1)'), false);
});

test('bir yapının tüm bölümleri bitince sıradaki açılır', ()=>{
  g.run('G.buildingProgress[0].stars[0]=3');
  assert.equal(g.val('isBuildingUnlocked(1)'), false, 'tek bölüm yetmemeli');
  complete([0]);
  assert.equal(g.val('isBuildingUnlocked(1)'), true);
});

test('medeniyetin tüm yapıları bitince sıradaki medeniyet ve ilk yapısı açılır', ()=>{
  complete(g.val('civBuildingIdx(0)'));
  assert.equal(g.val('isCivComplete(0)'), true);
  assert.equal(g.val('isCivUnlocked(1)'), true);
  assert.equal(g.val('isBuildingUnlocked(civBuildingIdx(1)[0])'), true);
  assert.equal(g.val('highestUnlockedCiv()'), 1);
});

test('her medeniyetin 6 yapısı ardışık ve harita pinleriyle eşleşir', ()=>{
  for(let c=0;c<9;c++) assert.deepEqual(g.val(`civBuildingIdx(${c})`), [0,1,2,3,4,5].map(k=>c*6+k));
});

function result(win, score, moves, b=0, l=0){
  g.run(`selectedBuilding=${b}; selectedLevel=${l}; G.score=${score}; G.moves=${moves}; showResult(${win});`);
}

test('zafer: puan eşiklerine göre 1/2/3 yıldız ve altın', ()=>{
  const st = g.val('BUILDINGS[0].levels[0].stars');
  result(true, st[0], 0);  assert.equal(g.val('G.buildingProgress[0].stars[0]'), 1);
  result(true, st[1], 0);  assert.equal(g.val('G.buildingProgress[0].stars[0]'), 2);
  g.run('G.coins=0'); result(true, st[2], 4);
  assert.equal(g.val('G.buildingProgress[0].stars[0]'), 3);
  assert.equal(g.val('G.coins'), 3*25 + 4*5);
});

test('tekrar oynayıp daha az yıldız almak rekoru düşürmez', ()=>{
  const st = g.val('BUILDINGS[0].levels[0].stars');
  result(true, st[2], 0); result(true, 0, 0);
  assert.equal(g.val('G.buildingProgress[0].stars[0]'), 3);
});

test('yenilgi: yıldız ve altın yok, istatistik sayılır', ()=>{
  g.run('G.coins=50'); result(false, 99999, 3);
  assert.equal(g.val('G.buildingProgress[0].stars[0]'), 0);
  assert.equal(g.val('G.coins'), 50);
  assert.deepEqual(g.val('[CURRENT_USER.stats.gamesPlayed, CURRENT_USER.stats.losses, CURRENT_USER.stats.wins]'), [1,1,0]);
});

test('son (ustaca) bölümün özel ödülü yalnızca ilk zaferde verilir', ()=>{
  const last = g.val('BUILDINGS[0].levels.length-1'), bonus = g.val('LEVEL5_BONUS');
  g.run('G.coins=0'); result(true, 0, 0, 0, last);
  assert.equal(g.val('G.coins'), 25 + bonus);
  g.run('G.coins=0'); result(true, 0, 0, 0, last);
  assert.equal(g.val('G.coins'), 25);
});

test('sıradaki bölüm: aynı yapının sonraki bölümü, sonra sıradaki yapının ilk oynanmamış bölümü', ()=>{
  g.run('selectedBuilding=0; selectedLevel=0');
  assert.deepEqual(g.val('nextLevelTarget()'), {b:0, l:1});
  const last = g.val('BUILDINGS[0].levels.length-1');
  g.run(`selectedLevel=${last}`);
  assert.deepEqual(g.val('nextLevelTarget()'), {locked:1});
  complete([0]); g.run('G.buildingProgress[1].stars[0]=2');
  assert.deepEqual(g.val('nextLevelTarget()'), {b:1, l:1});
  g.run('selectedBuilding=5; selectedLevel=BUILDINGS[5].levels.length-1');
  assert.equal(g.val('nextLevelTarget()'), null, 'medeniyetin son yapısından sonra harita');
});

test('ensureProgress eski/bozuk kayıtları tamamlar', ()=>{
  g.run('G.buildingProgress=[{stars:[3]}, null, {stars:"x"}]; ensureProgress()');
  assert.equal(g.val('G.buildingProgress.length'), 54);
  assert.equal(g.val('G.buildingProgress[0].stars[0]'), 3);
  assert.equal(g.val('G.buildingProgress.every((bp,i)=>Array.isArray(bp.stars) && bp.stars.length===BUILDINGS[i].levels.length)'), true);
});

test('eski sürüm kaydı göçü: Babil korunur, sonraki medeniyetler sıfırlanır', ()=>{
  g.win.__d = {buildingProgress: Array.from({length:12}, ()=>({stars:[3,3,3]})), mapCiv:3};
  g.run('migrateCivSave(window.__d)');
  assert.equal(g.val('window.__d.buildingProgress.length'), 6);
  assert.equal(g.val('window.__d.civVersion'), 2);
  assert.equal(g.val('window.__d.mapCiv'), undefined);
});

test('kaydet → yükle turu ilerlemeyi korur', ()=>{
  complete([0,1]); g.run('G.coins=432; G.mapCiv=0; syncGameToUser();');
  g.run('G.buildingProgress=[]; G.coins=0; loadGameFromUser();');
  assert.equal(g.val('G.coins'), 432);
  assert.equal(g.val('isBuildingComplete(1)'), true);
});
