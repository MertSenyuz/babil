// Eşleşme tespiti, güç taşları, düşme/doldurma, olası hamle kontrolü
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

let g;
test.before(async()=>{ g = await loadGame(); g.run('selectedLevel=0; G.gemSet=null; G.civ=null; G._swapCells=null;'); });
test.after(()=>g.close());

const L = {A:'gem1', B:'gem2', C:'gem3', D:'gem4', E:'gem5', F:'gem6', '#':'#marble:3', '.':null};
// 6×6 tahta (bölüm 1 → BS=6). Harf: taş, '#': engel, '.': boş
function setBoard(rows){
  g.win.__rows = rows.map(r=>[...r].map(ch=>{ assert.ok(ch in L, 'bilinmeyen hücre '+ch); return L[ch]; }));
  g.run('G.board = window.__rows.map(r=>r.slice()); G._swapCells = null;');
}
const board = ()=>g.run('JSON.stringify(G.board)');
const cells = ()=>g.val('findMatchesExtended().cells.map(p=>p.r+","+p.c).sort()');
const powers = ()=>g.run('JSON.stringify(findMatchesExtended().powerGems)');
const FILL = ['ABCDEF','CDEFAB','EFABCD','BCDEFA','DEFABC','FABCDE'];   // hiç eşleşme yok

test('tahta boyutu bölüme göre: 6/7/8', ()=>{
  assert.equal(g.run('selectedLevel=0; BS'), 6);
  assert.equal(g.run('selectedLevel=2; BS'), 7);
  assert.equal(g.run('selectedLevel=4; BS'), 8);
  g.run('selectedLevel=0');
});

test('eşleşmesiz tahtada eşleşme yok', ()=>{
  setBoard(FILL);
  assert.deepEqual(cells(), []);
  assert.equal(g.run('hasAnyMatch()'), false);
});

test('yatay 3\'lü: 3 hücre, güç taşı yok', ()=>{
  setBoard(['AAADEF', ...FILL.slice(1)]);
  assert.deepEqual(cells(), ['0,0','0,1','0,2']);
  assert.equal(powers(), '[]');
});

test('dikey 3\'lü', ()=>{
  setBoard(['ABCDEF','ADEFAB','AFBCDE','BCDEFA','DEFABC','FABCDE']);
  assert.deepEqual(cells(), ['0,0','1,0','2,0']);
});

test('4\'lü → bomba, 5\'li → süper', ()=>{
  setBoard(['AAAAEF', ...FILL.slice(1)]);
  assert.deepEqual(JSON.parse(powers()).map(p=>p.type), ['bomb']);
  setBoard(['AAAAAF', ...FILL.slice(1)]);
  assert.deepEqual(JSON.parse(powers()).map(p=>p.type), ['super']);
});

test('L şekli tek bomba üretir, köşede', ()=>{
  setBoard(['ABCDEF','ADEFAB','AAACDE','BCDEFA','DEFABC','FABCDE']);
  const p = JSON.parse(powers());
  assert.equal(p.length, 1);
  assert.deepEqual([p[0].r, p[0].c, p[0].type], [2, 0, 'bomb']);
  assert.equal(cells().length, 5);
});

test('güç taşı oyuncunun kaydırdığı hücrede oluşur', ()=>{
  setBoard(['AAAAEF', ...FILL.slice(1)]);
  g.run('G._swapCells={r1:1,c1:3,r2:0,c2:3}');
  const p = JSON.parse(powers());
  assert.deepEqual([p[0].r, p[0].c], [0, 3]);
  g.run('G._swapCells=null');
});

test('güç taşı eklentili taşlar aynı renk sayılır (gem1_bomb + gem1 + gem1)', ()=>{
  setBoard(FILL);
  g.run('G.board[0][0]="gem1_bomb"; G.board[0][1]="gem1"; G.board[0][2]="gem1";');
  assert.deepEqual(cells(), ['0,0','0,1','0,2']);
});

test('engeller eşleşmeyi böler', ()=>{
  setBoard(['AA#AAF', ...FILL.slice(1)]);
  assert.deepEqual(cells(), []);
});

test('dropGems: taşlar boşluğa düşer, engel sütunu böler', ()=>{
  setBoard(['A.....','......','#.....','......','B.....','.C....']);
  g.run('dropGems()');
  const b = JSON.parse(board());
  assert.equal(b[1][0], 'gem1', 'engelin üstündeki taş engelin üstüne iner');
  assert.equal(b[2][0], '#marble:3', 'engel yerinde kalır');
  assert.equal(b[5][0], 'gem2', 'alttaki taş en alta iner');
  assert.equal(b[5][1], 'gem3');
  assert.equal(b[0][0], null);
});

test('fillBoard boşlukları taş setinden doldurur', ()=>{
  setBoard(['......','......','......','......','......','......']);
  g.run('fillBoard()');
  const b = JSON.parse(board());
  const keys = g.val('GEM_KEYS');
  b.flat().forEach(x=>assert.ok(keys.includes(x), String(x)));
});

test('bomba 3×3 alanı, süper satır+sütunu temizler', ()=>{
  setBoard(FILL);
  g.run('G.board[2][2]="gem1_bomb"');
  const bomb = g.val('activatePowerGemsInMatch([{r:2,c:2}]).map(p=>p.r+","+p.c).sort()');
  assert.equal(bomb.length, 9);
  setBoard(FILL);
  g.run('G.board[2][2]="gem1_super"');
  const sup = g.run('activatePowerGemsInMatch([{r:2,c:2}]).length');
  assert.equal(sup, 6+6-1);
});

test('zincir: bombanın alanındaki bomba 5×5 patlar', ()=>{
  setBoard(FILL);
  g.run('G.board[2][2]="gem1_bomb"; G.board[3][3]="gem2_bomb"');
  const n = g.run('activatePowerGemsInMatch([{r:2,c:2}]).length');
  assert.equal(n, 25 - 0, '3,3 merkezli 5×5 = 1..5 satır/sütun → 25 hücre');
  assert.equal(g.run('G._chainBombCount'), 2);
});

// Kaba kuvvet kâhin: her komşu takas için yalın 3'lü tara
function oracleHasMove(b){
  const n = b.length, base = x=>x && x[0]!=='#' ? x.split('_')[0] : null;
  const has = bb=>{
    for(let r=0;r<n;r++) for(let c=0;c<n;c++){
      const v = base(bb[r][c]); if(!v) continue;
      if(c+2<n && base(bb[r][c+1])===v && base(bb[r][c+2])===v) return true;
      if(r+2<n && base(bb[r+1][c])===v && base(bb[r+2][c])===v) return true;
    }
    return false;
  };
  for(let r=0;r<n;r++) for(let c=0;c<n;c++){
    if(!b[r][c] || b[r][c][0]==='#') continue;
    for(const [dr,dc] of [[0,1],[1,0]]){
      const rr=r+dr, cc=c+dc; if(rr>=n||cc>=n||!b[rr][cc]||b[rr][cc][0]==='#') continue;
      const bb = b.map(x=>x.slice()); [bb[r][c],bb[rr][cc]]=[bb[rr][cc],bb[r][c]];
      if(has(bb)) return true;
    }
  }
  return false;
}

test('hasAnyPossibleMove kâhinle uyuşur ve tahtayı değiştirmez (300 rastgele tahta)', ()=>{
  g.run('HD.flood=0');
  for(let i=0;i<300;i++){
    g.run('G.board=[]; for(let r=0;r<BS;r++){ G.board[r]=[]; for(let c=0;c<BS;c++) G.board[r][c]=GEM_KEYS[Math.floor(Math.random()*4)]; }'
      + (i%3===0 ? 'G.board[3][3]="#marble:3"; G.board[1][4]="#sand:2";' : ''));
    const before = board(), b = JSON.parse(before);
    assert.equal(g.run('hasAnyPossibleMove()'), oracleHasMove(b), before);
    assert.equal(board(), before, 'tahta değişti');
  }
});

test('findMatchesExtended hücreleri yalın tarayıcıyla uyuşur (300 rastgele tahta)', ()=>{
  for(let i=0;i<300;i++){
    g.run('G.board=[]; for(let r=0;r<BS;r++){ G.board[r]=[]; for(let c=0;c<BS;c++) G.board[r][c]=GEM_KEYS[Math.floor(Math.random()*3)]; }');
    const b = JSON.parse(board()), n = b.length, want = new Set();
    for(let r=0;r<n;r++) for(let c=0;c<n;c++){
      if(c+2<n && b[r][c]===b[r][c+1] && b[r][c]===b[r][c+2]) [0,1,2].forEach(k=>want.add(r+','+(c+k)));
      if(r+2<n && b[r][c]===b[r+1][c] && b[r][c]===b[r+2][c]) [0,1,2].forEach(k=>want.add((r+k)+','+c));
    }
    assert.deepEqual(cells(), [...want].sort());
  }
});

test('generateBoard: başta eşleşme yok, en az bir hamle var (her bölüm boyutu, 300 deneme)', ()=>{
  g.run('selectedBuilding=0; G.civ=CIVILIZATIONS[0]; G.gemSet=G.civ.gemSet;');
  for(const lvl of [0,2,4]){
    g.run(`selectedLevel=${lvl}`);
    for(let i=0;i<300;i++){
      g.run('generateBoard()');
      assert.equal(g.run('G.board.length'), g.run('BS'));
      assert.equal(g.run('hasAnyMatch()'), false, 'başlangıçta hazır eşleşme var');
      assert.equal(g.run('hasAnyPossibleMove()'), true, 'hamle yok');
    }
  }
  g.run('selectedLevel=0; G.civ=null; G.gemSet=null;');
});

test('shuffleBoard: engeller yerinde kalır, tahta hazır eşleşmesiz karışır (8×8, 300 deneme)', ()=>{
  g.run('selectedLevel=4; G.civ=CIVILIZATIONS[0]; G.gemSet=G.civ.gemSet;');
  for(let i=0;i<300;i++){
    g.run('G.board=Array.from({length:BS},()=>Array(BS).fill("gem1")); G.board[3][3]="#marble:3"; G.board[5][1]="#ice:gem2"; shuffleBoard();');
    assert.equal(g.val('hasAnyMatch()'), false);
    assert.deepEqual(g.val('[G.board[3][3], G.board[5][1]]'), ['#marble:3', '#ice:gem2']);
  }
  g.run('selectedLevel=0; G.civ=null; G.gemSet=null;');
});
