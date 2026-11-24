// Kayıt / giriş / çıkış ve yerel kullanıcı kaydı
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

let g;
test.beforeEach(async()=>{ g = await loadGame(); });
test.afterEach(()=>g.close());

const settle = ()=>new Promise(r=>setTimeout(r, 60));
// Kayıt başarılıysa çevrimiçi modül (43-online.js) otomatik, asenkron giriş yapar → bitmesini bekle
async function register(name, pass, pass2=pass){
  g.doc.getElementById('regName').value = name;
  g.doc.getElementById('regPass').value = pass;
  g.doc.getElementById('regPass2').value = pass2;
  g.run('doRegister()');
  await settle();
  const err = g.doc.getElementById('regErr');
  return err.classList.contains('show') ? err.textContent : null;
}
// doLogin asenkron (şifre özeti crypto.subtle ile)
async function login(name, pass){
  g.doc.getElementById('loginName').value = name;
  g.doc.getElementById('loginPass').value = pass;
  await g.run('doLogin()');
  return !g.doc.getElementById('authErr').classList.contains('show');
}
const activeScreen = ()=>g.doc.querySelector('.screen.active')?.id;

test('ilk açılışta giriş ekranı gösterilir', ()=>{
  assert.equal(activeScreen(), 'authScreen');
});

test('kayıt doğrulaması: boş, kısa ad, kısa şifre, uyuşmayan şifre', async()=>{
  assert.match(await register('', 'abcd'), /boş/);
  assert.match(await register('a', 'abcd'), /2 karakter/);
  assert.match(await register('ali', 'abc'), /4 karakter/);
  assert.match(await register('ali', 'abcd', 'abce'), /eşleşmiyor/);
  assert.deepEqual(g.val('getAllUsers()'), []);
});

test('aynı ad (büyük/küçük harf farkıyla) ikinci kez alınamaz', async()=>{
  assert.equal(await register('Mert', 'abcd'), null);
  assert.match(await register('mert', 'abcd'), /alınmış/);
  assert.equal(g.val('getAllUsers().length'), 1);
});

test('kayıt kullanıcıyı otomatik içeri alır: oyun verisi oluşur, menüye geçilir, oturum saklanır', async()=>{
  await register('Mert', 'gizli1');
  assert.equal(activeScreen(), 'menuScreen');
  assert.equal(g.val('CURRENT_USER.username'), 'Mert');
  assert.equal(g.val('G.buildingProgress.length'), 54);
  assert.equal(g.val('G.energy'), 10);
  assert.equal(g.val('G.coins'), 100);
  assert.equal(g.val('getActiveSession().username'), 'Mert');
  assert.equal(g.val('getUserData("Mert").gameData.buildingProgress.length'), 54);
});

test('giriş: doğru şifre kabul, yanlış şifre ve olmayan kullanıcı reddedilir', async()=>{
  await register('Mert', 'gizli1'); g.run('doLogout()');
  assert.equal(await login('Mert', 'yanlis'), false);
  assert.equal(await login('Yok', 'gizli1'), false);
  assert.equal(g.val('CURRENT_USER'), null);
  assert.equal(await login('Mert', 'gizli1'), true);
  assert.equal(activeScreen(), 'menuScreen');
});

test('çıkış: ilerleme kaydedilir, oturum silinir, giriş ekranına dönülür', async()=>{
  await register('Mert', 'gizli1');
  g.run('G.coins = 777; doLogout()');
  assert.equal(activeScreen(), 'authScreen');
  assert.equal(g.val('getActiveSession()'), null);
  assert.equal(g.val('getUserData("Mert").gameData.coins'), 777);
});

test('kayıtlı oturum varsa sayfa yeniden açılınca doğrudan menüye girilir', async()=>{
  await register('Mert', 'gizli1'); g.run('G.coins = 321; saveGame()');
  const users = g.win.localStorage.getItem('babil_users'), session = g.win.localStorage.getItem('babil_session');
  const g2 = await loadGame({storage:{babil_users:users, babil_session:session}});
  assert.deepEqual(g2.errors, []);
  assert.equal(g2.doc.querySelector('.screen.active')?.id, 'menuScreen');
  assert.equal(g2.val('G.coins'), 321);
  g2.close();
});

test('oturum silinmiş bir kullanıcıyı gösteriyorsa giriş ekranı açılır', async()=>{
  const g2 = await loadGame({storage:{babil_users:'[]', babil_session:{username:'hayalet', ts:1}}});
  assert.deepEqual(g2.errors, []);
  assert.equal(g2.doc.querySelector('.screen.active')?.id, 'authScreen');
  g2.close();
});

test('kullanıcı adındaki HTML/tırnak karakterleri listeyi bozmaz ve kod çalıştırmaz', async()=>{
  const evil = `O'Neil<img src=x onerror="window.__pwned=1">`;
  assert.equal(await register(evil, 'abcd'), null);
  g.run('renderSavedUsers()');
  const list = g.doc.getElementById('savedUsersList');
  assert.equal(list.querySelector('img'), null, 'kullanıcı adı HTML olarak yorumlandı');
  assert.equal(g.win.__pwned, undefined);
  const row = list.querySelector('.auth-user-row');
  assert.ok(row);
  row.click();   // hızlı giriş: ad alanına aynen yazılmalı
  assert.equal(g.doc.getElementById('loginName').value, evil);
});
