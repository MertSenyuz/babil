// Medeniyet haritaları (20-map.js) ve yapıları (45-map-landmarks.js)
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

let g;
test.before(async()=>{ g = await loadGame({query:'?test'}); });
test.after(()=>g.close());

const build = c=>g.val(`terrBuild(${c}, TERR_MAPS[${c}])`);

test('8 dönem haritası tanımlı, Babil el yapımı haritada kalır', ()=>{
  assert.deepEqual(g.val('Object.keys(TERR_MAPS).map(Number)'), [1,2,3,4,5,6,7,8]);
  assert.equal(g.val('TERR_MAPS[0]'), undefined);
});

for(let c=1;c<=8;c++){
  test(`harita ${c}: geçerli SVG, sayısal değerler sağlam, aynı tohumla aynı çıktı`, ()=>{
    const svg = build(c);
    assert.ok(svg.length > 20000, 'harita çok boş');
    assert.doesNotMatch(svg, /NaN|undefined|Infinity|\[object /, 'bozuk değer');
    assert.equal(build(c), svg, 'harita her açılışta farklı (tohum)');
    const doc = new g.win.DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`, 'image/svg+xml');
    assert.equal(doc.querySelector('parsererror'), null, 'SVG ayrıştırılamadı');
  });
}

test('haritalardaki her <use href="#..."> ve url(#...) tanımlı bir öğeyi gösterir', ()=>{
  const svgRoot = g.doc.getElementById('mapTerrainSvg');
  g.run('terrPrep(document.getElementById("mapTerrainSvg"))');
  const defined = new Set([...svgRoot.querySelectorAll('[id]')].map(e=>e.id));
  for(let c=1;c<=8;c++){
    const svg = build(c);
    const local = new Set([...svg.matchAll(/\bid="([\w-]+)"/g)].map(m=>m[1]));
    const refs = new Set([...svg.matchAll(/href="#([\w-]+)"/g), ...svg.matchAll(/url\(#([\w-]+)\)/g)].map(m=>m[1]));
    const missing = [...refs].filter(r=>!defined.has(r) && !local.has(r));
    assert.deepEqual(missing, [], 'harita '+c);
  }
});

test('her dönemin 6 yapısı çizilir ve pinlerinin altına yerleşir', ()=>{
  for(let c=1;c<=8;c++){
    assert.equal(g.val(`TERR_LANDMARKS[${c}].length`), 6);
    const svg = build(c);
    const pos = [...svg.matchAll(/class="terr-lm" transform="translate\((\d+) (\d+)\)/g)].map(m=>[+m[1], +m[2]]);
    assert.equal(pos.length, 6, 'harita '+c);
    // çizim sırası y'ye göre (derinlik); konumlar pinlerin tam altında olmalı
    const want = g.val('PIN_POS').map(p=>[p.x, p.y+70]), key = a=>a.map(String).sort();
    assert.deepEqual(key(pos), key(want), 'harita '+c);
  }
});

test('dönem değişimi: yeni harita belirir, eskisi kaldırılır, Babil\'e dönülünce temel harita görünür', async()=>{
  const svg = g.doc.getElementById('mapTerrainSvg'), wait = ms=>new Promise(r=>setTimeout(r, ms));
  g.run('G.mapCiv=0; _terrCiv=null; renderMapTerrain()');
  assert.equal(svg.querySelectorAll('.terr-civ').length, 0);
  g.run('G.mapCiv=3; renderMapTerrain()');
  assert.equal(svg.querySelectorAll('.terr-civ.terr-in').length, 1);
  await wait(1200);
  assert.equal(svg.querySelectorAll('.terr-civ').length, 1);
  assert.equal(g.doc.getElementById('terrBase').style.display, 'none');
  g.run('G.mapCiv=6; renderMapTerrain()'); await wait(1200);
  assert.equal(svg.querySelectorAll('.terr-civ').length, 1, 'eski dönem haritası kaldırılmadı');
  g.run('G.mapCiv=0; renderMapTerrain()'); await wait(1200);
  assert.equal(svg.querySelectorAll('.terr-civ').length, 0);
  assert.equal(g.doc.getElementById('terrBase').style.display, '');
});

test('hızlı art arda dönem değişiminde Babil temel haritası yanlışlıkla gizlenmez', async()=>{
  const wait = ms=>new Promise(r=>setTimeout(r, ms));
  g.run('G.mapCiv=4; renderMapTerrain()');
  await wait(300);
  g.run('G.mapCiv=0; renderMapTerrain()');
  await wait(1400);
  assert.equal(g.doc.getElementById('terrBase').style.display, '', 'Babil\'e dönüldü ama temel harita gizli');
  assert.equal(g.doc.querySelectorAll('#mapTerrainSvg .terr-civ').length, 0);
});

test('yapı fonksiyonları her medeniyet için bozuk değer üretmez', ()=>{
  for(let c=1;c<=8;c++) for(let k=0;k<6;k++){
    const s = g.val(`TERR_LANDMARKS[${c}][${k}](TL_PAL[${c}], CIVILIZATIONS[${c}].color)`);
    assert.ok(s.length>200, `${c}/${k} boş`);
    assert.doesNotMatch(s, /NaN|undefined/, `${c}/${k}`);
  }
});
