// ══════════════════════════════════════════════
// MAĞAZA & ŞEHİR DİZAYN SİSTEMİ
// ══════════════════════════════════════════════

const SHOP_ITEMS = [
  // Binalar
  {id:'b01',cat:'bina',icon:'⛩️',name:'Küçük Tapınak',    desc:'Tanrılara adanmış sunak',     price:80,  reqStars:0},
  {id:'b02',cat:'bina',icon:'🗼',name:'Gözcü Kulesi',     desc:'Şehri gözetleyen kule',        price:120, reqStars:0},
  {id:'b03',cat:'bina',icon:'🏪',name:'Pazar Tezgahı',    desc:'Tüccarların buluşma yeri',     price:100, reqStars:3},
  {id:'b04',cat:'bina',icon:'🏺',name:'Çömlek Atölyesi',  desc:'El sanatları merkezi',          price:90,  reqStars:3},
  {id:'b05',cat:'bina',icon:'🏯',name:'Kale Burcu',       desc:'Şehri koruyan kule',            price:200, reqStars:9},
  {id:'b06',cat:'bina',icon:'🏛',name:'Meclis Binası',    desc:'Bilgeler toplanır',             price:250, reqStars:9},
  {id:'b07',cat:'bina',icon:'🏰',name:'Saray',            desc:'Kral\'ın büyük ikametgahı',     price:400, reqStars:15},
  {id:'b08',cat:'bina',icon:'📚',name:'Kütüphane',        desc:'Çivi yazısı tabletleri',        price:320, reqStars:15},
  {id:'b09',cat:'bina',icon:'🔭',name:'Rasathane',        desc:'Yıldızları incele',             price:280, reqStars:21},
  // Doğa
  {id:'n01',cat:'doga',icon:'🌴',name:'Hurma Ağacı',      desc:'Çöl cenneti palmiyesi',         price:30,  reqStars:0},
  {id:'n02',cat:'doga',icon:'🌿',name:'Sarmaşık',         desc:'Duvarları kaplayan yeşil',      price:25,  reqStars:0},
  {id:'n03',cat:'doga',icon:'🌸',name:'Çiçek Tarhı',      desc:'Renkli bahar çiçekleri',        price:35,  reqStars:0},
  {id:'n04',cat:'doga',icon:'🌾',name:'Buğday Tarlası',   desc:'Bereketli toprak',              price:50,  reqStars:0},
  {id:'n05',cat:'doga',icon:'💧',name:'Küçük Havuz',      desc:'Serin su kaynağı',              price:70,  reqStars:6},
  {id:'n06',cat:'doga',icon:'🌳',name:'Meşe Ağacı',       desc:'Antik ormanın devi',            price:60,  reqStars:6},
  {id:'n07',cat:'doga',icon:'🪷',name:'Lotus Havuzu',     desc:'Kutsal nilüfer bitkisi',        price:90,  reqStars:9},
  {id:'n08',cat:'doga',icon:'🌲',name:'Sedir Ormanı',     desc:'Lübnan sediri',                 price:110, reqStars:12},
  // Dekorasyon
  {id:'d01',cat:'dekor',icon:'🗿',name:'Tanrı Heykeli',   desc:'Marduk\'un taş heykeli',        price:180, reqStars:0},
  {id:'d02',cat:'dekor',icon:'🚩',name:'Bayrak Direği',   desc:'Şehrin sembolü',                price:30,  reqStars:0},
  {id:'d03',cat:'dekor',icon:'⚔️',name:'Silah Standı',    desc:'Savaşçıların koleksiyonu',      price:110, reqStars:3},
  {id:'d04',cat:'dekor',icon:'🏺',name:'Altın Küp',       desc:'Değerli eserler',               price:130, reqStars:6},
  {id:'d05',cat:'dekor',icon:'🪬',name:'Nazar Taşı',      desc:'Kötülükleri uzaklaştırır',      price:75,  reqStars:6},
  {id:'d06',cat:'dekor',icon:'🐉',name:'Ejderha Taşı',    desc:'Efsanevi koruyucu',             price:350, reqStars:21},
  {id:'d07',cat:'dekor',icon:'🐂',name:'Boğa Heykeli',    desc:'Ishtar\'ın kutsal hayvanı',     price:200, reqStars:9},
  {id:'d08',cat:'dekor',icon:'🦁',name:'Aslan Heykeli',   desc:'Kral\'ın gücü',                 price:220, reqStars:12},
  // Işık
  {id:'l01',cat:'isik',icon:'🔥',name:'Meşale',           desc:'Geceyi aydınlatır',             price:35,  reqStars:0},
  {id:'l02',cat:'isik',icon:'🪔',name:'Yağ Feneri',       desc:'Sıcak amber ışık',              price:50,  reqStars:0},
  {id:'l03',cat:'isik',icon:'🏮',name:'Kırmızı Fener',    desc:'Kutsal tören feneri',           price:65,  reqStars:3},
  {id:'l04',cat:'isik',icon:'✨',name:'Büyülü Işık',      desc:'Kadim büyü parıltısı',          price:180, reqStars:9},
  {id:'l05',cat:'isik',icon:'🌙',name:'Ay Taşı',          desc:'Ay ışığını hapseder',           price:140, reqStars:12},
  {id:'l06',cat:'isik',icon:'💎',name:'Kristal Kulesi',   desc:'Güneş ışığını kırar',           price:300, reqStars:21},
  // Boosterlar — 3'lü paket (tekli fiyat × 3), haritaya yerleştirilemez
  {id:'boost_lightning',cat:'booster',icon:'⚡',name:'Şimşek',     desc:'3\'lü paket · Satır + sütunu temizler', price:90,  reqStars:0, pack:3},
  {id:'boost_bomb',     cat:'booster',icon:'💣',name:'Mega Bomba', desc:'3\'lü paket · 5×5 alanı patlatır',      price:150, reqStars:0, pack:3},
  {id:'boost_shuffle',  cat:'booster',icon:'🔀',name:'Karıştır',   desc:'3\'lü paket · Hamle harcamadan karıştır', price:60,  reqStars:0, pack:3},
  {id:'boost_moves',    cat:'booster',icon:'⏱️',name:'+5 Hamle',   desc:'3\'lü paket · Anında 5 hamle ekler',     price:120, reqStars:0, pack:3},
  {id:'boost_rainbow',  cat:'booster',icon:'🌈',name:'Gökkuşağı',  desc:'3\'lü paket · Bir rengin tümünü siler',  price:240, reqStars:0, pack:3},
  {id:'boost_shield',   cat:'booster',icon:'🛡️',name:'Kalkan',     desc:'3\'lü paket · Kaybedince 1 ücretsiz tekrar', price:180, reqStars:0, pack:3},
];
