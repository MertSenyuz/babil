// Enerji: yenilenme (çevrimdışı ve oyun içi), harcama, satın alma
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

const MIN = 60*1000, REGEN = 3*MIN;
let g;
test.beforeEach(async()=>{ g = await loadGame(); g.run('G.maxEnergy = 10'); });
test.afterEach(()=>g.close());

// Kayıttan yükleme (çevrimdışı geçen süre)
function loadWith(energy, msAgo){
  g.win.__d = {energy, lastEnergyTime:Date.now()-msAgo, energyCap:10, coins:100, buildingProgress:[], civVersion:2};
  g.run('CURRENT_USER = {username:"t", stats:{}, achievements:[], gameData: window.__d}; loadGameFromUser();');
}

test('zamanlayıcı metni: dolu iken DOLU, değilse kalan süre', ()=>{
  g.run(`G.energy=10; G.lastEnergyTime=Date.now()`);
  assert.equal(g.val('getEnergyTimerStr()'), 'DOLU ✦');
  g.run(`G.energy=3; G.lastEnergyTime=Date.now()-${MIN}`);
  assert.equal(g.val('getEnergyTimerStr()'), '02:00');
});

test('çevrimdışı yenilenme: her 3 dakikaya +1, üst sınırı aşmaz', ()=>{
  loadWith(2, 9*MIN + 5000);
  assert.equal(g.val('G.energy'), 5);
  loadWith(2, 10*60*MIN);
  assert.equal(g.val('G.energy'), 10);
});

test('çevrimdışı yenilenme sonraki enerjinin ilerlemesini kaybetmez', ()=>{
  loadWith(2, 10*MIN);                       // 3 enerji + 1 dk ilerleme
  assert.equal(g.val('G.energy'), 5);
  const left = REGEN - (Date.now() - g.val('G.lastEnergyTime'));
  assert.ok(left <= 2*MIN + 1000, `sıradaki enerjiye ${Math.round(left/1000)} sn kaldı, ≤120 sn olmalı`);
});

test('oyun içi zamanlayıcı: uzun süre arka planda kalınca kaçırılan tüm enerjiler eklenir', async()=>{
  g.run(`G.energy=1; G.lastEnergyTime=Date.now()-${30*MIN}; startEnergyTimer();`);
  await new Promise(r=>setTimeout(r, 1300));
  g.run('clearInterval(energyTimerInterval)');
  assert.equal(g.val('G.energy'), 10, 'telefon uykudan uyanınca 30 dakikalık enerji (+9) gelmeli');
});

test('bölüme başlamak 1 enerji harcar, dolarken süren geri sayımı sıfırlamaz', ()=>{
  g.run(`G.energy=5; G.lastEnergyTime=Date.now()-${2*MIN}; selectedBuilding=0; selectedLevel=0; startLevel();`);
  assert.equal(g.val('G.energy'), 4);
  const elapsed = Date.now() - g.val('G.lastEnergyTime');
  assert.ok(elapsed >= 2*MIN - 1000, 'sıradaki enerjiye 1 dk kalmışken sayaç baştan (3 dk) başladı');
});

test('enerji doluyken harcanırsa geri sayım o an başlar', ()=>{
  g.run(`G.energy=10; G.lastEnergyTime=Date.now()-${60*MIN}; selectedBuilding=0; selectedLevel=0; startLevel();`);
  assert.equal(g.val('G.energy'), 9);
  assert.ok(Date.now() - g.val('G.lastEnergyTime') < 2000);
});

test('enerji yokken bölüm başlamaz', ()=>{
  g.run('G.energy=0; G.gameActive=false; selectedBuilding=0; selectedLevel=0; startLevel();');
  assert.equal(g.val('G.energy'), 0);
  assert.equal(g.val('G.gameActive'), false);
  assert.ok(g.doc.getElementById('energyModal').classList.contains('open'));
});

test('altınla enerji: 50 altın → +5 (sınırda kırpılır), altın yetmezse değişmez', ()=>{
  g.run('G.coins=40; G.energy=2; buyEnergy()');
  assert.deepEqual(g.val('[G.coins, G.energy]'), [40, 2]);
  g.run('G.coins=120; G.energy=7; buyEnergy()');
  assert.deepEqual(g.val('[G.coins, G.energy]'), [70, 10]);
});
