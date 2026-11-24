// Yönetici paneli: yalnızca rol 'admin' ise görünür, normal kullanıcı erişemez
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

let g;
test.before(async()=>{ g = await loadGame(); });
test.after(()=>g.close());

test('buton varsayılan gizli, rol admin değilken görünmez', ()=>{
  assert.ok(g.doc.getElementById('adminBtn'), 'yönetici butonu enjekte edilmedi');
  g.run('G.role=null; adminRefreshBtn()');
  assert.equal(g.doc.body.classList.contains('admin-on'), false);
  g.run('G.role="user"; adminRefreshBtn()');
  assert.equal(g.doc.body.classList.contains('admin-on'), false);
});

test('rol admin olunca buton görünür', ()=>{
  g.run('G.role="admin"; adminRefreshBtn()');
  assert.equal(g.doc.body.classList.contains('admin-on'), true);
});

test('admin olmayan adminOpen çağırsa panel açılmaz', ()=>{
  g.run('G.role="user"; adminClose(); adminOpen()');
  assert.equal(g.doc.getElementById('adminOverlay').classList.contains('open'), false);
});

test('admin paneli açar', ()=>{
  g.run('G.role="admin"; adminOpen()');
  assert.equal(g.doc.getElementById('adminOverlay').classList.contains('open'), true);
  g.run('adminClose()');
  assert.equal(g.doc.getElementById('adminOverlay').classList.contains('open'), false);
});

test('panel işleyicileri tanımlı', ()=>{
  ['adminOpen','adminClose','adminLoadUsers','adminSetBan','adminResetLeaderboard','adminRefreshBtn'].forEach(fn=>
    assert.equal(g.run(`typeof ${fn}`), 'function', fn));
});
