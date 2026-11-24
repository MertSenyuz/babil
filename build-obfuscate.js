// ══════════════════════════════════════════════
// Yayın derlemesi: js/ dosyalarını obfuscate eder, dist/ altında dağıtılabilir bir kopya oluşturur.
//   npm run obfuscate   → dist/  (index.html + obfuscate edilmiş js/ + css/, music/ kopyası)
//
// ⚠ Obfuscation GÜVENLİK DEĞİLDİR: sadece kaynağı okumayı zorlaştırır, geri çözülebilir.
//   Supabase adresi/anon anahtarı yine görünür; asıl koruma RLS politikalarıdır (supabase/setup.sql).
//
// ÖNEMLİ: renameGlobals=false. Oyun dosyaları tek global kapsamı paylaşır ve birbirinin
//   fonksiyonlarını çağırır/yamalar; HTML onclick'leri de global ada bağlıdır. Global adlar
//   yeniden adlandırılırsa oyun tümden kırılır. Bu yüzden yalnızca yerel değişkenler gizlenir.
// ══════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const JsObf = require('javascript-obfuscator');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const kb = n => (n/1024).toFixed(0) + ' KB';

// Mobil oyun: hafif ve güvenli ayarlar. Ağır dönüşümler (controlFlowFlattening, deadCodeInjection)
// performansı düşürür ve kırılma riski taşır → kapalı.
const OPTIONS = {
  compact: true,
  renameGlobals: false,          // ZORUNLU: dosyalar arası ve HTML onclick çağrıları korunsun
  identifierNamesGenerator: 'mangled',
  // stringArray KAPALI: açıkken bu oyunda kayıt/yükleme ve enerji mantığı bozuluyor
  // (localStorage save/load + enerji yenileme deterministik olarak hatalı sonuç veriyor;
  //  tests/*.test.js dist üzerinde çalıştırıldığında yakalanır). Açmak istersen önce
  //  `BABIL_ROOT=dist npm test` ile doğrula — risk sende. Bu haliyle obfuscation hafiftir
  //  (yerel değişkenleri gizler, string'ler okunur kalır) ve GÜVENLİK SAĞLAMAZ.
  stringArray: false,
  stringArrayThreshold: 0.75,
  stringArrayEncoding: [],
  splitStrings: false,
  numbersToExpressions: false,
  simplify: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: false,          // yanlış ortamda sayfayı kilitleyebilir → kapalı
  debugProtection: false,
  disableConsoleOutput: false,
  target: 'browser',
};

function rmrf(p){ if(fs.existsSync(p)) fs.rmSync(p, {recursive: true, force: true}); }

function obfuscateJs(){
  const srcDir = path.join(ROOT, 'js'), outDir = path.join(DIST, 'js');
  fs.mkdirSync(outDir, {recursive: true});
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js')).sort();
  let rawTotal = 0, outTotal = 0;
  for(const f of files){
    const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
    // Dosyalar tek global kapsamı paylaşır → her dosyaya benzersiz önek ver, yoksa
    // obfuscator'ın ürettiği yardımcı adlar (a, b, i, r…) dosyalar arası çakışır.
    const prefix = '_o' + (f.match(/^\d+/) || ['x'])[0] + '_';
    const out = JsObf.obfuscate(code, Object.assign({}, OPTIONS, {identifiersPrefix: prefix})).getObfuscatedCode();
    fs.writeFileSync(path.join(outDir, f), out);
    rawTotal += Buffer.byteLength(code); outTotal += Buffer.byteLength(out);
    console.log(`  ${f.padEnd(26)} ${kb(Buffer.byteLength(code)).padStart(8)} → ${kb(Buffer.byteLength(out)).padStart(8)}`);
  }
  console.log(`  ${''.padEnd(26)} ${('='.repeat(6)).padStart(8)}`);
  console.log(`  ${`${files.length} dosya`.padEnd(26)} ${kb(rawTotal).padStart(8)} → ${kb(outTotal).padStart(8)}\n`);
}

function copyStatic(){
  // index.html script src'leri `js/XX.js?v=` (göreli) → dist/js içindeki obfuscate dosyaları açar; değişiklik gerekmez.
  fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST, 'index.html'));
  for(const dir of ['css', 'music']){
    const src = path.join(ROOT, dir);
    if(fs.existsSync(src)) fs.cpSync(src, path.join(DIST, dir), {recursive: true});
  }
  // GitHub Pages dosyaya dokunmasın (Jekyll'i atla)
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
}

console.log('⚙  Obfuscate ediliyor…\n');
rmrf(DIST);
fs.mkdirSync(DIST, {recursive: true});
obfuscateJs();
copyStatic();
console.log('✓ dist/ hazır. Dağıtmadan önce doğrula:  BABIL_ROOT=dist npm test');
console.log('  Yayın (gh-pages dalına):  npm run deploy:ghpages   (ayrıntı için README)');
