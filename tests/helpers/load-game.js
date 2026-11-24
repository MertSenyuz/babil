// Oyunu jsdom içinde index.html + tüm js/ betikleriyle (gerçek sırayla) yükler.
// - Betikler diskten okunur; dış CDN (Supabase) yüklenmez → oyun çevrimdışı/yerel modda çalışır.
// - Sayfanın fırlattığı tüm hatalar `errors` dizisine toplanır (testler bunun boş olmasını bekler).
// - Tarayıcıda olup jsdom'da olmayan API'ler (Audio, canvas, matchMedia...) zararsız taklitlerle doldurulur.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole, requestInterceptor } = require('jsdom');

// Varsayılan: depo kökü. BABIL_ROOT ile başka bir derleme (ör. obfuscate edilmiş dist/) hedeflenebilir.
const ROOT = process.env.BABIL_ROOT ? path.resolve(process.env.BABIL_ROOT) : path.resolve(__dirname, '..', '..');

// localhost → diskten dosya; diğer her şey (CDN) → boş yanıt
const MIME = {'.js':'application/javascript', '.css':'text/css', '.html':'text/html', '.mp3':'audio/mpeg', '.json':'application/json'};
const localFiles = requestInterceptor(request=>{
  const u = new URL(request.url);
  if(u.hostname !== 'localhost') return new Response('', {headers:{'Content-Type':'application/javascript'}});
  const file = path.join(ROOT, decodeURIComponent(u.pathname));
  if(!fs.existsSync(file)) return new Response('', {status:404});
  return new Response(fs.readFileSync(file), {headers:{'Content-Type':MIME[path.extname(file)] || 'application/octet-stream'}});
});

function stubBrowserApis(win){
  const noop = ()=>{};
  win.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
  win.HTMLMediaElement.prototype.pause = noop;
  win.HTMLMediaElement.prototype.load = noop;
  win.matchMedia = win.matchMedia || (q=>({matches:false, media:q, addListener:noop, removeListener:noop, addEventListener:noop, removeEventListener:noop}));
  win.HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, {get:(t,k)=>k==='canvas'?this:(k==='measureText'?()=>({width:0}):noop)}); };
  win.scrollTo = noop;
  win.Element.prototype.scrollIntoView = noop;
  if(!win.AudioContext){
    const node = ()=>({connect:noop, disconnect:noop, start:noop, stop:noop, gain:{value:1, setValueAtTime:noop, linearRampToValueAtTime:noop, exponentialRampToValueAtTime:noop},
      frequency:{value:0, setValueAtTime:noop, linearRampToValueAtTime:noop, exponentialRampToValueAtTime:noop}, type:'sine', buffer:null});
    win.AudioContext = win.webkitAudioContext = function(){ return {currentTime:0, state:'running', resume:()=>Promise.resolve(), destination:{},
      createOscillator:node, createGain:node, createBiquadFilter:node, createBufferSource:node, createBuffer:()=>({getChannelData:()=>new Float32Array(1)}), sampleRate:44100}; };
  }
  win.navigator.vibrate = noop;
  Object.defineProperty(win.navigator, 'onLine', {get:()=>false, configurable:true});   // çevrimdışı mod: Supabase beklenmez (43-online.js olOnline)
}

/**
 * @param {object} [o]
 * @param {string} [o.query]  URL sorgusu (ör. '?test')
 * @param {object} [o.storage] önceden localStorage'a yazılacak anahtarlar
 * @param {boolean} [o.fast]   setTimeout/setInterval gecikmelerini kısalt (oynanış testleri)
 * @returns {Promise<{win:Window, doc:Document, errors:string[], run:(code:string)=>any, close:()=>void}>}
 */
async function loadGame(o={}){
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e=>{
    const msg = String(e && (e.detail?.stack || e.stack || e.message || e));
    if(/Could not parse CSS stylesheet|Not implemented: (navigation|HTMLMediaElement|window\.scrollTo)/.test(msg)) return;
    errors.push(msg);
  });
  vc.on('error', (...a)=>{ const m = a.map(String).join(' '); if(!/supabase|Failed to fetch|fetch is not defined/i.test(m)) errors.push('console.error: '+m); });

  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/' + (o.query || ''),
    runScripts: 'dangerously', resources: {interceptors:[localFiles]}, pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(win){
      stubBrowserApis(win);
      // fast: animasyon gecikmelerini kısalt (oyun mantığı aynı sırayla işler, testler saniyeler içinde biter)
      if(o.fast){
        const st = win.setTimeout.bind(win), si = win.setInterval.bind(win);
        win.setTimeout = (fn, ms, ...a)=>st(fn, Math.min(+ms||0, 2), ...a);
        win.setInterval = (fn, ms, ...a)=>si(fn, Math.max(5, (+ms||0)/50), ...a);
      }
      win.addEventListener('error', e=>errors.push('window.onerror: '+(e.error?.stack || e.message)));
      win.addEventListener('unhandledrejection', e=>errors.push('unhandledrejection: '+(e.reason?.stack || e.reason)));
      win.localStorage.setItem('babil_language', 'tr');   // jsdom dili en-US bildirir; testler Türkçe metinleri bekler
      Object.entries(o.storage || {}).forEach(([k,v])=>win.localStorage.setItem(k, typeof v==='string' ? v : JSON.stringify(v)));
    },
  });
  const win = dom.window;
  await new Promise(res=>{ if(win.document.readyState==='complete') res(); else win.addEventListener('load', ()=>res()); });
  await new Promise(r=>setTimeout(r, 50));
  // Sayfa kapsamındaki (let/const dahil) genel değişkenlere erişim: betik bağlamında çalıştır
  const run = code=>win.eval(code);
  // Sayfa içi değerin bu ortama JSON kopyası (deepEqual farklı realm'deki dizileri eşit saymaz)
  const val = code=>{ const s = win.eval(`JSON.stringify(${code})`); return s===undefined ? undefined : JSON.parse(s); };
  const g = {win, doc:win.document, errors, run, val, close:()=>{ open.delete(g); win.close(); }};
  open.add(g);
  return g;
}

// Açık kalan sayfaların zamanlayıcıları süreci asılı tutmasın: test bittiğinde hepsini kapat
const open = new Set();
try{ require('node:test').after(()=>[...open].forEach(g=>g.close())); }catch(e){}

module.exports = {loadGame, ROOT};
