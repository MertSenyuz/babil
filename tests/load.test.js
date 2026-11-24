// Oyunun bütünü: hatasız yüklenme, betik/stil bütünlüğü, HTML olay işleyicileri
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {loadGame, ROOT} = require('./helpers/load-game');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const jsFiles = fs.readdirSync(path.join(ROOT, 'js')).filter(f=>f.endsWith('.js')).sort();

test('oyun hatasız yüklenir (normal mod)', async()=>{
  const g = await loadGame();
  assert.deepEqual(g.errors, []);
  assert.equal(g.run('BUILDINGS.length'), 54);
  g.close();
});

test('oyun hatasız yüklenir (?test modu) ve tüm medeniyetler açılır', async()=>{
  const g = await loadGame({query:'?test'});
  assert.deepEqual(g.errors, []);
  assert.equal(g.run('DEV_UNLOCK_ALL'), true);
  assert.equal(g.run('CIVILIZATIONS.every(c=>isCivUnlocked(c.id))'), true);
  g.close();
});

test('?test olmadan test modu kapalı: yalnızca Babil açık', async()=>{
  const g = await loadGame();
  assert.equal(g.run('DEV_UNLOCK_ALL'), false);
  assert.equal(g.run('isCivUnlocked(1)'), false);
  g.close();
});

test('bozuk localStorage oyunu çökertmez', async()=>{
  const g = await loadGame({storage:{babil_users:'{bozuk json', babil_session:'"yok"'}});
  assert.deepEqual(g.errors, []);
  assert.deepEqual(g.val('getAllUsers()'), []);
  g.close();
});

test('js/ klasöründeki her dosya index.html\'de numara sırasıyla yüklenir', ()=>{
  const srcs = [...html.matchAll(/<script[^>]+src="js\/([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual([...srcs].sort(), jsFiles, 'eksik ya da fazla <script>');
  assert.deepEqual(srcs, [...srcs].sort(), 'betikler numara sırasında değil');
});

test('index.html\'deki her stil dosyası mevcut ve css/ klasöründeki hepsi bağlı', ()=>{
  const hrefs = [...html.matchAll(/<link[^>]+href="(css\/[^"]+)"/g)].map(m=>m[1]);
  hrefs.forEach(h=>assert.ok(fs.existsSync(path.join(ROOT, h)), h+' yok'));
  const cssFiles = fs.readdirSync(path.join(ROOT, 'css')).map(f=>'css/'+f).sort();
  assert.deepEqual([...hrefs].sort(), cssFiles);
});

test('HTML ve JS şablonlarındaki her onclick/onchange işleyicisi tanımlı bir fonksiyon', async()=>{
  const g = await loadGame();
  const src = html + jsFiles.map(f=>fs.readFileSync(path.join(ROOT, 'js', f), 'utf8')).join('\n');
  const names = new Set([...src.matchAll(/on(?:click|change|input|submit|keydown|keyup|pointerdown)="([A-Za-z_$][\w$]*)\(/g)].map(m=>m[1]));
  ['if','return','event','this'].forEach(k=>names.delete(k));
  const missing = [...names].filter(n=>g.run(`typeof ${n}`)!=='function');
  assert.deepEqual(missing, []);
  g.close();
});

test('her JS dosyası tek başına sözdizimsel olarak geçerli', ()=>{
  const vm = require('vm');
  jsFiles.forEach(f=>assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), {filename:f}), f));
});
