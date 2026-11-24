// Oyun verisi bütünlüğü: medeniyetler, yapılar, bölümler, taşlar, müzik
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {loadGame, ROOT} = require('./helpers/load-game');

let g;
test.before(async()=>{ g = await loadGame(); });
test.after(()=>g.close());

test('9 medeniyet, sıralı id, benzersiz anahtar, kronolojik dönem', ()=>{
  const civs = g.val('CIVILIZATIONS.map(c=>({id:c.id, key:c.key, from:c.era.from, to:c.era.to, color:c.color}))');
  assert.equal(civs.length, 9);
  civs.forEach((c,i)=>{
    assert.equal(c.id, i);
    assert.ok(c.from < c.to, c.key+' dönem aralığı');
    assert.match(c.color, /^#[0-9a-f]{6}$/i);
    if(i) assert.equal(c.from, civs[i-1].to, c.key+' önceki dönemin bittiği yılda başlamalı');
  });
  assert.equal(new Set(civs.map(c=>c.key)).size, 9);
});

test('her medeniyetin 6 taşlık seti var ve taşlar tanımlı', ()=>{
  const sets = g.val('CIVILIZATIONS.map(c=>c.gemSet)'), gems = g.val('Object.keys(GEMS)');
  sets.forEach((s,i)=>{
    assert.equal(s.length, 6, 'medeniyet '+i);
    assert.equal(new Set(s).size, 6, 'medeniyet '+i+' tekrar eden taş');
    s.forEach(k=>assert.ok(gems.includes(k), k+' GEMS içinde yok'));
  });
});

test('54 yapı: her birinin medeniyeti, adı, rengi ve en az 3 bölümü var', ()=>{
  const bs = g.val('BUILDINGS.map((b,i)=>({i, civ:civOf(i), name:b.name, color:b.color, n:b.levels.length}))');
  assert.equal(bs.length, 54);
  bs.forEach(b=>{
    assert.ok(b.name, 'yapı '+b.i+' adsız');
    assert.equal(b.civ, Math.floor(b.i/6), b.name+' yanlış medeniyette');
    assert.ok(b.n>=3, b.name+' bölüm sayısı');
  });
});

test('her bölüm oynanabilir: hamle > 0, artan yıldız eşikleri, hedefler medeniyetin taşları veya engelleri', ()=>{
  const levels = g.val(`BUILDINGS.flatMap((b,i)=>b.levels.map((l,k)=>({b:b.name, k, civ:civOf(i), moves:l.moves, stars:l.stars, target:l.target})))`);
  const sets = g.val('CIVILIZATIONS.map(c=>c.gemSet)'), obGoals = g.val('Object.keys(HD_GOAL_TYPE)');
  levels.forEach(l=>{
    const id = `${l.b} / bölüm ${l.k+1}`;
    assert.ok(Number.isInteger(l.moves) && l.moves>0, id+' hamle');
    assert.equal(l.stars.length, 3, id+' yıldız eşiği');
    assert.ok(l.stars[0]>0 && l.stars[0]<=l.stars[1] && l.stars[1]<=l.stars[2], id+' eşikler artmıyor: '+l.stars);
    const keys = Object.keys(l.target);
    assert.ok(keys.length>0, id+' hedefsiz');
    keys.forEach(k=>{
      assert.ok(sets[l.civ].includes(k) || obGoals.includes(k), `${id}: hedef "${k}" bu medeniyette düşmüyor`);
      assert.ok(l.target[k]>0, id+' hedef sayısı');
    });
  });
});

test('müzik: her parça bir medeniyete ait ve dosyası var; yedek parça tanımlı', ()=>{
  const tracks = g.val('MUSIC_TRACKS'), keys = g.val('CIVILIZATIONS.map(c=>c.key)');
  Object.entries(tracks).forEach(([k,f])=>{
    assert.ok(keys.includes(k), k+' medeniyet anahtarı değil');
    assert.ok(fs.existsSync(path.join(ROOT, f)), f+' yok');
  });
  assert.ok(tracks[g.val('MUS_FALLBACK')]);
  keys.forEach(k=>assert.ok(fs.existsSync(path.join(ROOT, g.val(`musTrack(${JSON.stringify(k)})`))), k));
});

test('harita: 6 pin konumu haritanın içinde ve birbirinden uzak', ()=>{
  const pins = g.val('PIN_POS');
  assert.equal(pins.length, 6);
  pins.forEach(p=>assert.ok(p.x>100 && p.x<1900 && p.y>100 && p.y<1900));
  for(let i=0;i<6;i++) for(let j=i+1;j<6;j++) assert.ok(Math.hypot(pins[i].x-pins[j].x, pins[i].y-pins[j].y) > 300);
});
