// ══════════════════════════════════════════════
// MEDENİYETLER — MEZOPOTAMYA TARİH YOLCULUĞU
// Babil (M.Ö. 600) → Pers → Büyük İskender → Part → Sasani → İslam'ın Yükselişi → Abbasi → Moğol → Osmanlı (M.S. 1918)
// Hepsi aynı Mezopotamya haritasında geçer; dönem değiştikçe yapılar, tema rengi ve dönem yazısı güncellenir.
// Bir medeniyetin tüm bölümleri bitince sıradaki açılır. Yapılar sırayla açılır: her yapı bir öncekinin tüm bölümleri bitince (isBuildingUnlocked).
// Zorluk: her medeniyette hamle azalır, hedefler çarpanla büyür (Babil bölümleri eski kayıtlar için aynen korunur).
// ══════════════════════════════════════════════
const CIVILIZATIONS = [
  {id:0, key:"babylon", name:"Babil", short:"Babil", title:"BABİL ŞEHRİ", mapTitle:"✦ BABİL HARİTASI ✦", icon:"🏛", color:"#f5c842",
   era:{from:-600, to:-550}, golden:"Babil'in Altın Çağı", unlockStars:0, mapSvg:"mapTerrainSvg",
   gemSet:["gem1","gem2","gem3","gem4","gem5","gem6"], special:null, specialP:0, obstacle:null, moves:25, targetMul:1.0,
   transitionNote:"Başlangıç — Babil'in altın çağı",
   badge:{icon:"🏛", name:"Babil Fatihi"},
   en:{name:"Babylon", short:"Babylon", title:"CITY OF BABYLON", golden:"The Golden Age of Babylon", note:"The beginning — the golden age of Babylon"}},
  {id:1, key:"persia", name:"Pers İmparatorluğu", short:"Pers", title:"PERS İMPARATORLUĞU", mapTitle:"✦ PERS DÖNEMİ ✦", icon:"🦁", color:"#c4702a",
   era:{from:-550, to:-330}, golden:"Pers'in Altın Çağı", unlockStars:30, mapSvg:"mapTerrainSvg",
   gemSet:["gem12","gem7","gem9","gem1","gem3","gem5"], special:"seal", specialP:0.04, obstacle:"sand", moves:24, targetMul:1.1,
   transitionNote:"M.Ö. 539 — Kral Kyros'un orduları Babil kapılarından içeri girdi. Şehir yıkılmadı; Babil, Pers İmparatorluğu'nun başkentlerinden biri oldu. Yeni bir çağ başlıyor...",
   badge:{icon:"🦁", name:"Kyros'un Mirasçısı"},
   en:{name:"Persian Empire", short:"Persia", title:"PERSIAN EMPIRE", golden:"The Golden Age of Persia", badge:"Heir of Cyrus",
       note:"539 BC — The armies of King Cyrus marched through the gates of Babylon. The city was spared and became one of the capitals of the Persian Empire. A new age begins..."}},
  {id:2, key:"alexander", name:"Büyük İskender", short:"İskender", title:"BÜYÜK İSKENDER", mapTitle:"✦ HELEN DÖNEMİ ✦", icon:"🛡", color:"#4a7aaa",
   era:{from:-330, to:-247}, golden:"Helenizm'in Altın Çağı", unlockStars:30, mapSvg:"mapTerrainSvg",
   gemSet:["gem10","gem15","gem7","gem11","gem3","gem5"], special:"phalanx", specialP:0.04, obstacle:"marble", moves:23, targetMul:1.2,
   transitionNote:"M.Ö. 331 — Gaugamela'da Pers ordusunu yenen Büyük İskender, Babil'e zaferle girdi. Doğu ile Batı ilk kez aynı taht altında buluşuyor...",
   badge:{icon:"🛡", name:"Makedon Fatihi"},
   en:{name:"Alexander the Great", short:"Alexander", title:"ALEXANDER THE GREAT", golden:"The Golden Age of Hellenism", badge:"Macedonian Conqueror",
       note:"331 BC — Having defeated the Persians at Gaugamela, Alexander the Great entered Babylon in triumph. East and West meet under one throne..."}},
  {id:3, key:"parthia", name:"Part İmparatorluğu", short:"Part", title:"PART İMPARATORLUĞU", mapTitle:"✦ PART DÖNEMİ ✦", icon:"🏹", color:"#8a4a2a",
   era:{from:-247, to:224}, golden:"Partların Altın Çağı", unlockStars:30, mapSvg:"mapTerrainSvg",
   gemSet:["gem11","gem8","gem12","gem2","gem3","gem5"], special:"arrow", specialP:0.035, obstacle:"sand", moves:22, targetMul:1.3,
   transitionNote:"M.Ö. 247 — İran'da Arsak hanedanı yükseldi. M.Ö. 141'de Part kralı I. Mithridates Mezopotamya'yı ele geçirdi; okçu süvariler Dicle kıyısına ulaştı...",
   badge:{icon:"🏹", name:"Part Okçusu"},
   en:{name:"Parthian Empire", short:"Parthia", title:"PARTHIAN EMPIRE", golden:"The Golden Age of Parthia", badge:"Parthian Archer",
       note:"247 BC — The Arsacid dynasty rose in Iran. In 141 BC the Parthian king Mithridates I seized Mesopotamia; mounted archers reached the Tigris..."}},
  {id:4, key:"sasanian", name:"Sasani İmparatorluğu", short:"Sasani", title:"SASANİ İMPARATORLUĞU", mapTitle:"✦ SASANİ DÖNEMİ ✦", icon:"🔥", color:"#c4922a",
   era:{from:224, to:637}, golden:"Sasanilerin Altın Çağı", unlockStars:30, mapSvg:"mapTerrainSvg",
   gemSet:["gem7","gem14","gem9","gem13","gem5","gem10"], special:"fire", specialP:0.04, obstacle:"marble", moves:21, targetMul:1.4,
   transitionNote:"M.S. 224 — I. Ardaşir son Part kralını yendi ve Sasani hanedanını kurdu. Pers geleneği yeniden doğuyor; Ktesifon imparatorluğun kalbi oluyor...",
   badge:{icon:"🔥", name:"Ateşin Bekçisi"},
   en:{name:"Sasanian Empire", short:"Sasanian", title:"SASANIAN EMPIRE", golden:"The Golden Age of the Sasanians", badge:"Keeper of the Flame",
       note:"AD 224 — Ardashir I defeated the last Parthian king and founded the Sasanian dynasty. The Persian tradition is reborn; Ctesiphon becomes the heart of the empire..."}},
  {id:5, key:"early_islam", name:"İslam'ın Yükselişi", short:"İslam", title:"İSLAM'IN YÜKSELİŞİ", mapTitle:"✦ ERKEN İSLAM DÖNEMİ ✦", icon:"🌙", color:"#2a8a4a",
   era:{from:637, to:750}, golden:"İslam'ın Yükseliş Çağı", unlockStars:30, mapSvg:"mapTerrainSvg",
   gemSet:["gem13","gem10","gem7","gem2","gem5","gem1"], special:"crescent", specialP:0.04, obstacle:"sand", moves:20, targetMul:1.5,
   transitionNote:"M.S. 636 — Hz. Ömer döneminde Müslüman ordusu Kadisiye'de Sasanileri yendi; ertesi yıl Ktesifon alındı. Mezopotamya İslam'a açılıyor...",
   badge:{icon:"🌙", name:"Hilalin Muhafızı"},
   en:{name:"Rise of Islam", short:"Islam", title:"RISE OF ISLAM", golden:"The Rise of Islam", badge:"Guardian of the Crescent",
       note:"AD 636 — Under Caliph Umar, the Muslim army defeated the Sasanians at Qadisiyyah; Ctesiphon fell the following year. Mesopotamia opens to Islam..."}},
  {id:6, key:"abbasid", name:"Abbasi Halifeliği", short:"Abbasi", title:"ABBASİ HALİFELİĞİ", mapTitle:"✦ ABBASİ DÖNEMİ ✦", icon:"📚", color:"#2a6aaa",
   era:{from:750, to:1258}, golden:"İslam'ın Altın Çağı", unlockStars:30, mapSvg:"mapTerrainSvg",
   gemSet:["gem9","gem4","gem13","gem14","gem5","gem10"], special:"astro", specialP:0.03, obstacle:"marble", moves:19, targetMul:1.6,
   transitionNote:"M.S. 762 — Abbasi Halifesi Mansur, Dicle kıyısında Bağdat'ı kurdu. Bilginin, çevirinin ve bilimin altın çağı başlıyor...",
   badge:{icon:"📚", name:"Bilgelik Evi Âlimi"},
   en:{name:"Abbasid Caliphate", short:"Abbasid", title:"ABBASID CALIPHATE", golden:"The Golden Age of Islam", badge:"Scholar of the House of Wisdom",
       note:"AD 762 — The Abbasid caliph al-Mansur founded Baghdad on the Tigris. A golden age of knowledge, translation and science begins..."}},
  {id:7, key:"mongol", name:"Moğol İstilası", short:"Moğol", title:"MOĞOL İSTİLASI", mapTitle:"✦ MOĞOL DÖNEMİ ✦", icon:"🐎", color:"#6a6a6a",
   era:{from:1258, to:1534}, golden:"Yeniden Doğuş Çağı", unlockStars:30, mapSvg:"mapTerrainSvg",
   gemSet:["gem11","gem12","gem10","gem2","gem13","gem5"], special:"horde", specialP:0.04, obstacle:"ice", moves:18, targetMul:1.8,
   transitionNote:"M.S. 1258 — Hülagu Han'ın orduları Bağdat'ı kuşatıp yaktı. Abbasi Halifeliği sona erdi; Mezopotamya karanlık bir döneme giriyor...",
   badge:{icon:"🐎", name:"Bozkırın Hâkimi"},
   en:{name:"Mongol Invasion", short:"Mongol", title:"MONGOL INVASION", golden:"The Age of Rebirth", badge:"Lord of the Steppe",
       note:"AD 1258 — Hulagu Khan's armies besieged and burned Baghdad. The Abbasid Caliphate fell; Mesopotamia enters a dark age..."}},
  {id:8, key:"ottoman", name:"Osmanlı Dönemi", short:"Osmanlı", title:"OSMANLI DÖNEMİ", mapTitle:"✦ OSMANLI DÖNEMİ ✦", icon:"🕌", color:"#8a2a2a",
   era:{from:1534, to:1918}, golden:"Osmanlı'nın Bağdat Çağı", unlockStars:30, mapSvg:"mapTerrainSvg",
   gemSet:["gem11","gem15","gem13","gem7","gem10","gem5"], special:"tugra", specialP:0.03, obstacle:"marble", moves:17, targetMul:2.0,
   transitionNote:"M.S. 1534 — Kanuni Sultan Süleyman Bağdat'a girdi. Mezopotamya dört yüzyıl sürecek Osmanlı dönemine başlıyor...",
   badge:{icon:"🕌", name:"Bağdat Beylerbeyi"},
   en:{name:"Ottoman Era", short:"Ottoman", title:"OTTOMAN ERA", golden:"The Ottoman Age of Baghdad", badge:"Governor of Baghdad",
       note:"AD 1534 — Suleiman the Magnificent entered Baghdad. Mesopotamia begins four centuries of Ottoman rule..."}},
];
// Tüm yolculuk bitince gösterilen kapanış notu
const CIV_FINALE_NOTE = "M.S. 1918 — Osmanlı'nın Mezopotamya'daki dört yüzyılı sona erdi. Babil'den bu yana 2500 yıllık yolculuk tamamlandı.";

// Babil yapıları: medeniyet, yıl ve 4-5. bölümler (1-3. bölümler aynen korunur → eski kayıtlar geçerli)
const BABIL_TIMELINE = [[-600, "Kentin kuruluşu"], [-590, "Bahçeler çiçekleniyor"], [-575, "Kutsal kapılar yükseliyor"], [-570, "Tapınak inşaatı tamamlandı"], [-560, "Nehir kanalları açıldı"], [-555, "Pazar yerleri kuruluyor"]];
const BABIL_EXTRA_LEVELS = [
  [{"moves": 23, "target": {"gem1": 18, "gem2": 15, "gem4": 12}, "score": 3400, "stars": [1900, 2600, 3400]}, {"moves": 21, "target": {"gem1": 21, "gem2": 17, "gem4": 15, "gem3": 12}, "score": 4900, "stars": [2750, 3750, 4900]}],
  [{"moves": 23, "target": {"gem3": 19, "gem4": 16, "gem2": 13}, "score": 3600, "stars": [2000, 2800, 3600]}, {"moves": 21, "target": {"gem3": 21, "gem4": 18, "gem2": 15, "gem5": 12}, "score": 4950, "stars": [2750, 3850, 4950]}],
  [{"moves": 23, "target": {"gem2": 20, "gem5": 16, "gem3": 13}, "score": 3700, "stars": [2050, 2850, 3700]}, {"moves": 21, "target": {"gem2": 22, "gem5": 19, "gem3": 16, "gem1": 12}, "score": 5200, "stars": [2900, 4000, 5200]}],
  [{"moves": 23, "target": {"gem4": 20, "gem6": 17, "gem5": 14}, "score": 3800, "stars": [2150, 2950, 3800]}, {"moves": 21, "target": {"gem4": 23, "gem6": 19, "gem5": 16, "gem1": 13}, "score": 5300, "stars": [3000, 4100, 5300]}],
  [{"moves": 23, "target": {"gem2": 21, "gem3": 17, "gem4": 14}, "score": 3900, "stars": [2200, 3000, 3900]}, {"moves": 21, "target": {"gem2": 23, "gem3": 20, "gem4": 17, "gem5": 13}, "score": 5500, "stars": [3050, 4250, 5500]}],
  [{"moves": 23, "target": {"gem1": 21, "gem4": 18, "gem6": 14}, "score": 4000, "stars": [2250, 3050, 4000]}, {"moves": 21, "target": {"gem1": 24, "gem4": 20, "gem6": 17, "gem2": 13}, "score": 5550, "stars": [3100, 4300, 5550]}],
];
// "📜 Tarihten Bir Sayfa" — [gerçek tarih, dönemin olayı, ilginç not]
const BABIL_HISTORY = [
  ["Babil'in büyük zigguratı Etemenanki ('Göğün ve Yerin Temel Evi'), II. Nebukadnezar döneminde yaklaşık 90 metre yüksekliğe ulaştı. Tanrı Marduk'a adanmıştı ve Esagila tapınağının hemen yanında yükseliyordu.",
   "M.Ö. 605 — II. Nebukadnezar tahta çıktı ve Babil'i dünyanın en görkemli şehirlerinden birine dönüştürmeye başladı.",
   "Tevrat'taki Babil Kulesi anlatısının bu zigguratten esinlendiği düşünülür. Kulenin tuğlalarına kralın adı damgalanmıştı."],
  ["Antik yazarlar Babil'in Asma Bahçeleri'ni Dünyanın Yedi Harikası arasında sayar. Rivayete göre Nebukadnezar bu bahçeleri, yeşil dağları özleyen eşi Amytis için yaptırdı.",
   "M.Ö. 600 civarı — Babil, Yeni Babil İmparatorluğu'nun başkenti olarak Yakın Doğu'nun en kalabalık şehirlerinden biriydi.",
   "Bahçelerin kalıntısı bugüne dek kesin olarak bulunamadı; bazı araştırmacılar bahçelerin aslında Ninova'da olabileceğini öne sürer."],
  ["Ishtar Kapısı M.Ö. 575 civarında Babil'in kuzey girişinde inşa edildi. Sırlı mavi tuğlalarla kaplıydı ve ejderha (mušhuššu) ile boğa kabartmalarıyla süslüydü.",
   "Her yılbaşı düzenlenen Akitu Bayramı'nda tanrı heykelleri bu kapıdan geçen Tören Yolu boyunca taşınırdı.",
   "Kapının yeniden kurulmuş hâli bugün Berlin'deki Pergamon Müzesi'nde sergileniyor."],
  ["Zigguratlar Mezopotamya'nın basamaklı tapınak kuleleriydi. Çekirdekleri kerpiçten örülür, dışları pişmiş tuğlayla kaplanırdı; tepede tanrıya ayrılmış küçük bir tapınak bulunurdu.",
   "Babil rahipleri yüzyıllar boyunca astronomik günlükler tutarak gökyüzü olaylarını kil tabletlere kaydetti.",
   "Babilliler 60 tabanlı sayı sistemi kullanırdı; bir saatin 60 dakika olması bu mirastan gelir."],
  ["Fırat nehri Babil'in tam ortasından geçer, şehri iki yakaya bölerdi. Mezopotamya tarımı, nehirlerden açılan sulama kanallarına dayanıyordu.",
   "Hammurabi Kanunları, sulama kanallarının bakımını ihmal edip komşusunun tarlasını su altında bırakanlara verilecek cezaları bile düzenlemişti.",
   "Mezopotamya adı Yunanca 'iki nehir arasındaki ülke' anlamına gelir: Dicle ve Fırat."],
  ["Babil, Mezopotamya'nın en önemli ticaret merkezlerinden biriydi. Tüccarlar gümüşü tartarak alışveriş yapar, sözleşmeleri kil tabletlere yazardı.",
   "M.Ö. 562 — II. Nebukadnezar öldü; ardından gelen karışık yıllar Pers fethinin yolunu açtı.",
   "Babilliler borç, faiz ve senet kayıtlarını çivi yazısıyla tutardı; binlerce ticari tablet günümüze ulaştı."],
];
const BABIL_ART = ['tower','gardens','gate','ziggurat','river','market'];
BUILDINGS.forEach((b,i)=>{ b.civ=0; b.art=BABIL_ART[i]; b.year=BABIL_TIMELINE[i][0]; b.eraSub=BABIL_TIMELINE[i][1]; b.levels.push(...BABIL_EXTRA_LEVELS[i]); b.history=BABIL_HISTORY[i]; });

// Yeni medeniyetlerin yapıları (her medeniyet 6 yapı × 5 bölüm)
// h: [gerçek tarih, dönemin olayı, ilginç not] · en: İngilizce ad/açıklama/hikâye/özellik
const MZ_BUILDINGS = {
  1: [
    {icon:"🏛", name:"Kyros Sarayı", year:-539, color:"#e0a040", dark:"#8a4a10",
     desc:"Fatihin Babil'deki konutu", eraSub:"Kyros Babil'e giriyor",
     story:"Kyros Büyük, Babil'e zaferle girdi. Halk onu kurtarıcı olarak karşıladı.",
     feature:"<strong>👑 Kral Mührü</strong> 3 kez toplanınca <strong>bonus patlama</strong> yaratır — Kyros'un fermanı taşlarda yankılanır.",
     h:["M.Ö. 539'da Opis Savaşı'nın ardından Pers ordusu Babil'i neredeyse savaşmadan ele geçirdi. Kyros şehri yıkmadı; Babil, Pers İmparatorluğu'nun başkentlerinden biri oldu.",
        "Kyros Silindiri — Kyros'un Babil'e girişini ve halkına tanıdığı hakları anlatan kil silindir bugün British Museum'da sergileniyor.",
        "Kyros sürgündeki toplulukların yurtlarına dönmesine izin verdi; Yahudilerin Kudüs'e dönüşü bu kararla başladı."],
     en:{name:"Palace of Cyrus", desc:"The conqueror's residence in Babylon", eraSub:"Cyrus enters Babylon",
         story:"Cyrus the Great entered Babylon in triumph. The people welcomed him as a liberator.",
         feature:"<strong>👑 Royal Seal</strong> collected 3 times makes a <strong>bonus blast</strong> — Cyrus's decree echoes through the stones."}},
    {icon:"🔥", name:"Ateş Tapınağı", year:-530, color:"#ff7a30", dark:"#a02a00",
     desc:"Sönmeyen kutsal alevin evi", eraSub:"Kutsal ateş yakılıyor",
     story:"Zerdüşt inancı Mezopotamya'ya yayıldı. Kutsal ateş hiç sönmedi.",
     feature:"<strong>Kerpiç Duvar</strong> engelleri <strong>2 vuruşta</strong> kırılır — yanlarında eşleşme yap, yolu aç.",
     h:["Zerdüştlük, Ahura Mazda'yı yüce tanrı kabul eden eski bir İran inancıdır. Ateş bu inançta saflığın ve ilahi ışığın simgesiydi; tapınaklarda kutsal ateş sürekli yanık tutulurdu.",
        "Ahameniş kralları yazıtlarında iktidarlarını Ahura Mazda'nın lütfuna bağladı.",
        "Zerdüşt geleneğinde ölüleri toprağa gömmek ya da yakmak yasaktı, çünkü toprak da ateş de kutsal sayılırdı."],
     en:{name:"Fire Temple", desc:"Home of the undying sacred flame", eraSub:"The sacred fire is lit",
         story:"The Zoroastrian faith spread to Mesopotamia. The sacred fire never went out.",
         feature:"<strong>Mud-Brick Wall</strong> blocks break in <strong>2 hits</strong> — match beside them to clear the way."}},
    {icon:"🛣️", name:"Kral Yolu", year:-520, color:"#d8b070", dark:"#7a5020",
     desc:"Susa'dan Sardes'e uzanan yol", eraSub:"Kral Yolu döşeniyor",
     story:"Darius'un inşa ettiği yol Susa'dan Sardes'e 2700 km uzanıyordu.",
     feature:"<strong>👑 Kral Mührü</strong> taşlarını topla: her <strong>3 mühürde bir</strong> elmas biçiminde büyük bir patlama olur.",
     h:["Kral Yolu, Pers başkenti Susa'yı Anadolu'daki Sardes'e bağlayan yaklaşık 2.700 km'lik bir yoldu. Yol boyunca konaklama istasyonları kurulmuş, taze atlar hazır bekletilirdi.",
        "Pers ulakları bu yolu bayrak yarışı gibi atlarını değiştirerek yaklaşık bir haftada aşabiliyordu; yaya bir yolcu için aynı yolculuk üç ay sürerdi.",
        "Heredot'un Pers ulakları için yazdığı 'Ne kar, ne yağmur, ne sıcak...' sözü bugün ABD Posta Teşkilatı'nın gayriresmî sloganıdır."],
     en:{name:"Royal Road", desc:"The road from Susa to Sardis", eraSub:"The Royal Road is paved",
         story:"The road built by Darius stretched 2,700 km from Susa to Sardis.",
         feature:"<strong>👑 Royal Seal</strong> stones — collect them: every <strong>3 seals</strong> make a big diamond-shaped blast."}},
    {icon:"💎", name:"Pers Hazinesi", year:-510, color:"#ffd23a", dark:"#a07010",
     desc:"İmparatorluğun altın kasası", eraSub:"Hazine dolup taşıyor",
     story:"Babil'in zenginlikleri Pers hazinesine aktarıldı.",
     feature:"<strong>Kerpiç</strong> engelleri bombalarla da kırılır — <strong>💥 bomba</strong> patlaması her duvara bir vuruş yapar.",
     h:["Ahameniş İmparatorluğu satraplıklara bölünmüştü ve her eyalet yıllık vergi öderdi. Heredot'a göre Babil eyaleti, imparatorluğun en çok vergi veren bölgelerinden biriydi.",
        "I. Darius altın 'darik' sikkesini bastırdı; imparatorluk genelinde ortak bir para dolaşıma girdi.",
        "İskender Pers hazinelerini ele geçirdiğinde, ganimeti taşımak için binlerce katır ve deve gerektiği anlatılır."],
     en:{name:"Persian Treasury", desc:"The golden vault of the empire", eraSub:"The treasury overflows",
         story:"The riches of Babylon flowed into the Persian treasury.",
         feature:"<strong>Mud-brick</strong> also breaks with bombs — a <strong>💥 bomb</strong> blast hits every wall once."}},
    {icon:"🦁", name:"Apadana Sarayı", year:-490, color:"#c4702a", dark:"#6a3010",
     desc:"Dev sütunlu kabul salonu", eraSub:"Apadana'nın sütunları yükseliyor",
     story:"Persepolis'in görkemli sarayı tüm imparatorluğu temsil ediyordu.",
     feature:"<strong>Tunç, altın ve lapis</strong> taşlar <strong>Pers hazinesinin</strong> incileridir — hedefleri kaçırma.",
     h:["Apadana, Persepolis'teki büyük kabul salonuydu; yaklaşık 20 metre yüksekliğindeki sütunlar dev bir sedir tavanı taşırdı. Kral, imparatorluğun dört bir yanından gelen elçileri burada kabul ederdi.",
        "Apadana merdivenlerindeki kabartmalarda 23 farklı halktan elçinin krala hediye getirişi tasvir edilir.",
        "Sarayın temellerine altın ve gümüş yazıt levhaları gömülmüştü; bu levhalar 1933'te kazılarda bulundu."],
     en:{name:"Apadana Palace", desc:"Audience hall of giant columns", eraSub:"The columns of the Apadana rise",
         story:"The magnificent palace of Persepolis represented the whole empire.",
         feature:"<strong>Bronze, gold and lapis</strong> gems are the <strong>pearls of the Persian treasury</strong> — don't miss the goals."}},
    {icon:"⚔️", name:"Pers Ordu Kışlası", year:-480, color:"#d05a3a", dark:"#6a1a10",
     desc:"Ölümsüzlerin karargâhı", eraSub:"Ölümsüzler sefere çıkıyor",
     story:"Pers ordusu dünyanın en büyük ordusuydu.",
     feature:"<strong>👑 Kral Mührü</strong> ve <strong>Kerpiç Duvar</strong> bir arada — Pers çağının son ve en zorlu sınavı.",
     h:["Pers ordusu imparatorluğun onlarca halkından toplanan askerlerden oluşurdu. Ordunun seçkin birliği, sayısı hep 10.000'de tutulan 'Ölümsüzler'di.",
        "M.Ö. 480 — Kserkses büyük bir orduyla Yunanistan'a sefer düzenledi; Termopylai ve Salamis savaşları yaşandı.",
        "Ölümsüzler adını, ölen ya da yaralanan her askerin yerine hemen yenisi konduğu için aldı."],
     en:{name:"Persian Army Barracks", desc:"Headquarters of the Immortals", eraSub:"The Immortals march out",
         story:"The Persian army was the largest army in the world.",
         feature:"<strong>👑 Royal Seal</strong> and <strong>Mud-Brick Wall</strong> together — the last and hardest test of the Persian age."}},
  ],
  2: [
    {icon:"🏛", name:"İskender Sarayı", year:-331, color:"#6a9ae8", dark:"#1a3a7a",
     desc:"Doğu ile Batı'nın buluştuğu saray", eraSub:"İskender Babil'e giriyor",
     story:"İskender Babil'i imparatorluğunun başkenti yapmayı planladı.",
     feature:"<strong>🛡 Falanks Taşı</strong> eşleşince <strong>komşu tüm taşları</strong> yok eder — mermer bloklar dahil.",
     h:["M.Ö. 331'de Gaugamela'da III. Darius'u yenen İskender, Babil'e törenle karşılanarak girdi. Babil'i imparatorluğunun doğudaki merkezi yapmayı planlıyordu.",
        "M.Ö. 323 — İskender, 32 yaşındayken Babil'deki II. Nebukadnezar sarayında hayatını kaybetti.",
        "İskender, yıkık Etemenanki zigguratını yeniden yaptırmak için enkazı kaldırtmaya başlamıştı; ölümüyle iş yarım kaldı."],
     en:{name:"Palace of Alexander", desc:"The palace where East met West", eraSub:"Alexander enters Babylon",
         story:"Alexander planned to make Babylon the capital of his empire.",
         feature:"<strong>🛡 Phalanx Stone</strong> when matched, <strong>all neighbouring gems</strong> are destroyed — marble blocks included."}},
    {icon:"🎭", name:"Yunan Tiyatrosu", year:-325, color:"#e8e0c8", dark:"#8a7a5a",
     desc:"Helen sahnesinin taş basamakları", eraSub:"Helenizm doğuyor",
     story:"Yunan kültürü Mezopotamya ile buluştu, Helenizm doğdu.",
     feature:"<strong>Mermer</strong> bloklar <strong>3 vuruşta</strong> kırılır — yanlarında sabırla eşleşme yap.",
     h:["İskender'in ardından Babil'de Yunan tarzı bir tiyatro inşa edildi; kalıntıları bugün hâlâ görülebilir. Yunan ve Doğu kültürlerinin bu kaynaşmasına Helenizm denir.",
        "İskender'in ölümünden sonra generalleri (diadokhlar) imparatorluğu paylaşmak için yıllarca savaştı.",
        "Babil tiyatrosu sonraki yüzyıllarda birkaç kez onarıldı; bu da kentte uzun süre Yunanca konuşan bir topluluğun yaşadığını gösterir."],
     en:{name:"Greek Theatre", desc:"Stone steps of the Hellenistic stage", eraSub:"Hellenism is born",
         story:"Greek culture met Mesopotamia, and Hellenism was born.",
         feature:"<strong>Marble</strong> blocks break in <strong>3 hits</strong> — match patiently beside them."}},
    {icon:"🏥", name:"Büyük Hastane", year:-320, color:"#7ad0e0", dark:"#1a6a7a",
     desc:"Şifacıların buluşma yeri", eraSub:"Şifacılar Babil'de toplanıyor",
     story:"İskender'in ölümünden sonra Babil tıp merkezi oldu.",
     feature:"<strong>🛡 Falanks</strong> taşı <strong>mermer bloğun yanında</strong> patlarsa blok tek seferde yıkılır.",
     h:["Babil hekimliği, teşhis ve tedavileri kil tabletlere kaydeden köklü bir geleneğe sahipti. Helenistik dönemde bu birikim Yunan tıbbıyla karşılaştı.",
        "M.Ö. 312 — İskender'in generali I. Seleukos Babil'i ele geçirdi; Seleukos hanedanı dönemi başladı.",
        "Babil'in 'Teşhis El Kitabı', hastalık belirtilerini baştan ayağa sıralayan yaklaşık 40 tabletten oluşur."],
     en:{name:"Great Hospital", desc:"Meeting place of the healers", eraSub:"Healers gather in Babylon",
         story:"After Alexander's death, Babylon became a centre of medicine.",
         feature:"<strong>🛡 Phalanx</strong> blasted <strong>next to a marble block</strong> knocks the block down at once."}},
    {icon:"⚗️", name:"Bilim Akademisi", year:-315, color:"#a080e0", dark:"#3a2a7a",
     desc:"Yıldızların hesaplandığı okul", eraSub:"Yunan ve Babil bilimi birleşiyor",
     story:"Yunan ve Babil bilimi birleşti, astronomi ilerledi.",
     feature:"<strong>Zincirleme</strong> eşleşmeler mermeri defalarca vurur — <strong>dalga gibi</strong> kombolar kur.",
     h:["Babil astronomları yüzyıllar boyunca Ay'ın ve gezegenlerin hareketlerini kaydetmişti. Helenistik dönemde bu veriler Yunan gökbilimcilerin elinde yeni hesaplamalara dönüştü.",
        "M.Ö. 290 civarı — Babilli rahip Berossos, Babil tarihini Yunanca yazarak Batı dünyasına tanıttı.",
        "Yunan gökbilimci Hipparkhos'un Ay hesaplarında Babil gözlem kayıtlarından yararlandığı bilinir."],
     en:{name:"Academy of Science", desc:"The school where stars were calculated", eraSub:"Greek and Babylonian science unite",
         story:"Greek and Babylonian science merged, and astronomy advanced.",
         feature:"<strong>Chain</strong> matches hit marble again and again — build combos <strong>like waves</strong>."}},
    {icon:"🗿", name:"İskender Anıtı", year:-310, color:"#d8d0b8", dark:"#6a6048",
     desc:"Fatihe adanmış taş anıt", eraSub:"İskender efsaneye dönüşüyor",
     story:"Halk İskender'i tanrı gibi görüyordu.",
     feature:"<strong>Fildişi, porselen ve altın</strong> taşlar <strong>Helen sanatının</strong> renkleridir.",
     h:["İskender'in ölümünden sonra adı Doğu'dan Batı'ya efsanelere karıştı. Ona adanan heykeller ve sikkeler onu tanrısal bir kahraman olarak gösterdi.",
        "İskender'in naaşı Babil'den yola çıkarıldı; generali Ptolemaios onu Mısır'a götürdü.",
        "Doğu edebiyatında İskender, İskendername destanlarıyla yüzyıllarca yaşadı; bazı yorumcular onu Zülkarneyn ile özdeşleştirdi."],
     en:{name:"Monument of Alexander", desc:"A stone monument to the conqueror", eraSub:"Alexander becomes a legend",
         story:"The people saw Alexander almost as a god.",
         feature:"<strong>Ivory, porcelain and gold</strong> gems are the <strong>colours of Hellenistic art</strong>."}},
    {icon:"🌊", name:"Fırat Limanı", year:-300, color:"#4ac0ff", dark:"#0a4a8a",
     desc:"Doğu ile Batı'nın ticaret kapısı", eraSub:"Gemiler Fırat'ta demirliyor",
     story:"Babil, doğu-batı ticaret merkezi oldu.",
     feature:"<strong>🛡 Falanks</strong> ve <strong>Mermer</strong> bir arada — Helen çağının son ve en zorlu sınavı.",
     h:["Fırat, Basra Körfezi ile Suriye arasındaki ticaretin ana yoluydu. Helenistik dönemde Babil ve yakınındaki Seleukeia, Doğu-Batı ticaretinin kavşağında yer aldı.",
        "M.Ö. 305 civarı — I. Seleukos Dicle kıyısında Seleukeia'yı kurdu; nüfus zamanla Babil'den yeni şehre kaydı.",
        "Antik kaynaklara göre Seleukeia, zirvesinde yüz binlerce kişinin yaşadığı bir dünya şehriydi."],
     en:{name:"Euphrates Harbour", desc:"Trade gate between East and West", eraSub:"Ships anchor on the Euphrates",
         story:"Babylon became a centre of East–West trade.",
         feature:"<strong>🛡 Phalanx</strong> and <strong>Marble</strong> together — the last and hardest test of the Hellenistic age."}},
  ],
  3: [
    {icon:"🏰", name:"Part Kalesi", year:-200, color:"#c86a3a", dark:"#5a2010",
     desc:"Sınırın taş bekçisi", eraSub:"Part surları yükseliyor",
     story:"Partlar Mezopotamya'yı Roma'ya karşı savundu.",
     feature:"<strong>🏹 Part Oku</strong> eşleşince <strong>aynı renkteki tüm taşları</strong> temizler.",
     h:["Partlar, kuzeydoğu İran'dan çıkan Parni boyunun kurduğu Arsak hanedanı tarafından yönetilen bir İran imparatorluğuydu. M.Ö. 141'de I. Mithridates Mezopotamya'yı Seleukoslardan aldı.",
        "M.Ö. 247 — Arsakes Part krallığını kurdu; hanedan yaklaşık 470 yıl hüküm sürdü.",
        "Part kralları sikkelerinde kendilerini 'Philhellen' yani 'Yunan dostu' olarak tanıtırdı."],
     en:{name:"Parthian Fortress", desc:"Stone guardian of the frontier", eraSub:"Parthian walls rise",
         story:"The Parthians defended Mesopotamia against Rome.",
         feature:"<strong>🏹 Parthian Arrow</strong> when matched, <strong>every gem of the same colour</strong> is cleared."}},
    {icon:"🐴", name:"Atlı Ordu Kışlası", year:-150, color:"#d8a060", dark:"#6a4010",
     desc:"Okçu süvarilerin ahırı", eraSub:"Süvariler talim yapıyor",
     story:"Part süvarileri Roma lejyonlarını Carrhae'de yendi.",
     feature:"<strong>Kerpiç Duvar</strong> engelleri <strong>2 vuruşta</strong> kırılır — süvarilere yol aç.",
     h:["Part ordusunun gücü atlı okçular ile ağır zırhlı katafrakt süvarilerinden gelirdi. Hafif atlılar düşmanı yıpratır, zırhlı süvari son darbeyi vururdu.",
        "M.Ö. 53 — Carrhae (Harran) Savaşı'nda Part komutanı Surena, Crassus'un Roma lejyonlarını ağır bir yenilgiye uğrattı.",
        "İngilizcedeki 'parting shot' deyiminin, geri çekilirken arkaya ok atan 'Part atışı'ndan geldiği düşünülür."],
     en:{name:"Cavalry Barracks", desc:"Stables of the horse archers", eraSub:"The cavalry drills",
         story:"Parthian cavalry defeated the Roman legions at Carrhae.",
         feature:"<strong>Mud-Brick Wall</strong> blocks break in <strong>2 hits</strong> — clear the way for the riders."}},
    {icon:"🕌", name:"Ktesifon Sarayı", year:-100, color:"#b85a48", dark:"#4a1a10",
     desc:"Dicle kıyısındaki başkent", eraSub:"Ktesifon başkent oluyor",
     story:"Ktesifon başkent oldu, Babil gölgede kaldı.",
     feature:"<strong>🏹 Part Oku</strong> taşını <strong>hedef renginde</strong> eşleştir — tek hamlede hedefin yarısı gidebilir.",
     h:["Ktesifon, Dicle'nin doğu kıyısında, Seleukeia'nın tam karşısında gelişti. Partlar burayı kış başkenti yaptı ve şehir zamanla imparatorluğun kalbi oldu.",
        "Babil bu dönemde yavaş yavaş boşaldı; M.S. 1. yüzyılda artık küçük bir yerleşime dönüşmüştü.",
        "Roma orduları Ktesifon'u birkaç kez ele geçirdi; M.S. 116'da İmparator Trajan şehre girdi."],
     en:{name:"Palace of Ctesiphon", desc:"The capital on the Tigris", eraSub:"Ctesiphon becomes the capital",
         story:"Ctesiphon became the capital, and Babylon faded into its shadow.",
         feature:"<strong>🏹 Parthian Arrow</strong> — match it <strong>in a goal colour</strong> and half the goal can vanish in one move."}},
    {icon:"🛕", name:"Ateş Tapınağı", year:-50, color:"#ff8a40", dark:"#8a2a00",
     desc:"Partların kutsal ocağı", eraSub:"Ateş tapınakları çoğalıyor",
     story:"Zerdüşt inancı güçlenmeye devam etti.",
     feature:"<strong>Kerpiç</strong> engelleri bombalarla da kırılır — <strong>💥 bomba</strong> patlaması her duvara bir vuruş yapar.",
     h:["Partlar farklı inançlara hoşgörüyle yaklaştı; Zerdüştlük, eski Babil tanrıları ve Yunan kültleri yan yana yaşadı. Kutsal ateş ocakları imparatorluğun dört bir yanında yanmaya devam etti.",
        "M.Ö. 20 — Roma ile Partlar arasında barış yapıldı; Carrhae'de kaybedilen Roma sancakları iade edildi.",
        "Zerdüştlüğün kutsal kitabı Avesta'nın derlenmesine Part döneminde başlandığına dair bir gelenek vardır."],
     en:{name:"Fire Temple", desc:"The sacred hearth of the Parthians", eraSub:"Fire temples multiply",
         story:"The Zoroastrian faith kept growing stronger.",
         feature:"<strong>Mud-brick</strong> also breaks with bombs — a <strong>💥 bomb</strong> blast hits every wall once."}},
    {icon:"🏺", name:"Çarşı Meydanı", year:50, color:"#e0c080", dark:"#7a5a20",
     desc:"İpek Yolu'nun durak yeri", eraSub:"İpek kervanları geliyor",
     story:"İpek Yolu ticareti Mezopotamya'yı zenginleştirdi.",
     feature:"<strong>Kızıl, kum ve tunç</strong> taşlar <strong>Part çarşısının</strong> hazineleridir.",
     h:["Partlar, Çin'den Akdeniz'e uzanan İpek Yolu'nun orta bölümünü kontrol ediyordu. Çin ipeği Roma'ya Part tüccarlarının elinden geçerek ulaşırdı.",
        "M.S. 97 — Çinli elçi Gan Ying Roma'ya ulaşmak için yola çıktı, ancak Körfez kıyısında yolculuğun çok uzun olduğu söylenerek geri döndürüldü.",
        "Romalılar ipeği o kadar çok sevdi ki Senato, erkeklerin ipek giymesini yasaklamaya çalıştı."],
     en:{name:"Bazaar Square", desc:"A stop on the Silk Road", eraSub:"Silk caravans arrive",
         story:"Silk Road trade made Mesopotamia rich.",
         feature:"<strong>Crimson, sand and bronze</strong> gems are the <strong>treasures of the Parthian bazaar</strong>."}},
    {icon:"🌉", name:"Dicle Köprüsü", year:150, color:"#7ab0c8", dark:"#2a4a5a",
     desc:"İkiz şehirleri bağlayan geçit", eraSub:"Dicle üzerine köprü kuruluyor",
     story:"Part mühendisleri büyük köprüler inşa etti.",
     feature:"<strong>🏹 Part Oku</strong> ve <strong>Kerpiç</strong> bir arada — Part çağının son ve en zorlu sınavı.",
     h:["Seleukeia ile Ktesifon, Dicle'nin iki yakasında karşılıklı duran ikiz şehirlerdi. Nehir, tekneler ve geçitlerle aşılır; iki şehir tek bir büyük kent gibi yaşardı.",
        "M.S. 165 — Roma komutanı Avidius Cassius Seleukeia'yı yaktı; Ktesifon da yağmalandı.",
        "Ktesifon yakınlarında bulunan 'Bağdat Pili' adlı kil kap, bazılarınca antik bir elektrik pili sanılır; ancak gerçek işlevi hâlâ tartışmalıdır."],
     en:{name:"Tigris Bridge", desc:"The crossing between twin cities", eraSub:"A bridge spans the Tigris",
         story:"Parthian engineers built great bridges.",
         feature:"<strong>🏹 Parthian Arrow</strong> and <strong>Mud-brick</strong> together — the last and hardest test of the Parthian age."}},
  ],
  4: [
    {icon:"👑", name:"Taq-ı Kisra", year:260, color:"#f0c040", dark:"#8a6010",
     desc:"Dünyanın en büyük tuğla kemeri", eraSub:"Büyük kemer yükseliyor",
     story:"Dünyanın en büyük tuğla kemeri Ktesifon'da inşa edildi.",
     feature:"<strong>🔥 Kutsal Ateş</strong> eşleşince <strong>komşu tüm taşları</strong> yakar — mermer bloklar dahil.",
     h:["Taq-ı Kisra, Ktesifon'daki Sasani sarayının dev eyvanıdır. Yaklaşık 37 metre yüksekliğindeki kemeri, kalıp kullanılmadan örülmüş en büyük tuğla tonozlardan biri kabul edilir.",
        "M.S. 224 — I. Ardaşir son Part kralı IV. Artabanus'u yendi ve Sasani hanedanını kurdu.",
        "Kemerin yapım tarihi tartışmalıdır: I. Şapur (3. yy) ya da I. Hüsrev (6. yy) dönemine tarihlenir. Kalıntısı bugün Irak'ta, Selman-ı Pak'ta hâlâ ayaktadır."],
     en:{name:"Taq Kasra", desc:"The world's largest brick arch", eraSub:"The great arch rises",
         story:"The largest brick arch in the world was built at Ctesiphon.",
         feature:"<strong>🔥 Sacred Fire</strong> when matched, <strong>all neighbouring gems</strong> burn away — marble blocks included."}},
    {icon:"📚", name:"Cündişapur Akademisi", year:300, color:"#a0c0ff", dark:"#2a4a8a",
     desc:"Bilginlerin buluşma yeri", eraSub:"Akademi kapılarını açıyor",
     story:"Dünyanın ilk üniversitelerinden biri burada kuruldu.",
     feature:"<strong>Mermer</strong> bloklar <strong>3 vuruşta</strong> kırılır — yanlarında sabırla eşleşme yap.",
     h:["Cündişapur (Gundeşapur), Sasani İmparatorluğu'nun güneybatısında önemli bir bilim ve tıp merkeziydi. Burada Yunan, Süryani, Hint ve Pers bilgisi bir araya geldi.",
        "M.S. 260 — I. Şapur, Edessa yakınlarında Roma İmparatoru Valerianus'u esir aldı.",
        "Atina'daki Platon Akademisi 529'da kapatılınca bazı Yunan filozoflar Sasani sarayına sığındı."],
     en:{name:"Academy of Gundeshapur", desc:"Meeting place of scholars", eraSub:"The academy opens its doors",
         story:"One of the world's first universities was founded here.",
         feature:"<strong>Marble</strong> blocks break in <strong>3 hits</strong> — match patiently beside them."}},
    {icon:"🌾", name:"Sulama Kanalları", year:350, color:"#8ad060", dark:"#2a6a10",
     desc:"Bereketi taşıyan su yolları", eraSub:"Kanallar ovayı yeşertiyor",
     story:"Sasaniler Mezopotamya'yı dünyanın tahıl ambarı yaptı.",
     feature:"<strong>🔥 Kutsal Ateş</strong> taşı <strong>mermer bloğun yanında</strong> patlarsa blok tek seferde erir.",
     h:["Sasaniler Mezopotamya'da geniş kanal ağları kazdı ve sulanan toprakları genişletti. Nahrevan gibi büyük kanallar, Dicle'nin doğusundaki ovaları bereketli tarlalara çevirdi.",
        "M.S. 363 — Roma İmparatoru Julianus, Ktesifon seferi sırasında öldü.",
        "Sasaniler Mezopotamya'ya 'İran'ın kalbi' (Dil-i Eranşehr) derdi; devlet gelirinin büyük kısmı bu topraklardan gelirdi."],
     en:{name:"Irrigation Canals", desc:"Waterways that carry plenty", eraSub:"Canals turn the plain green",
         story:"The Sasanians made Mesopotamia the granary of the world.",
         feature:"<strong>🔥 Sacred Fire</strong> blasted <strong>next to a marble block</strong> melts the block at once."}},
    {icon:"⚔️", name:"Demir Zırh Atölyesi", year:400, color:"#b0b8c8", dark:"#4a5060",
     desc:"Zırhlı süvarilerin demirhanesi", eraSub:"Demirciler zırh dövüyor",
     story:"Sasani zırhı dünyanın en iyi zırhıydı.",
     feature:"<strong>Zincirleme</strong> eşleşmeler mermeri defalarca vurur — <strong>ateş gibi</strong> yayılan kombolar kur.",
     h:["Sasani ordusunun belkemiği, atlarıyla birlikte baştan aşağı zırha bürünen ağır süvarilerdi. Romalılar bu savaşçılara 'clibanarii' derdi.",
        "M.S. 5. yüzyıl — Sasaniler ile Doğu Roma, sınırda uzun soluklu barış antlaşmaları imzaladı.",
        "'Clibanarii' adının, zırh içinde kavrulan askerlere yapılan esprili bir 'fırın adamları' benzetmesinden geldiği düşünülür."],
     en:{name:"Iron Armour Forge", desc:"Smithy of the armoured cavalry", eraSub:"Smiths hammer armour",
         story:"Sasanian armour was the finest in the world.",
         feature:"<strong>Chain</strong> matches hit marble again and again — build combos <strong>like fire</strong>."}},
    {icon:"🏛", name:"Meclis Salonu", year:450, color:"#e0a0ff", dark:"#6a2a8a",
     desc:"Şahların karar verdiği salon", eraSub:"Şah meclisi toplanıyor",
     story:"Şahlar burada büyük kararlar aldı.",
     feature:"<strong>Altın, zincifre ve lapis</strong> taşlar <strong>Sasani sarayının</strong> süsleridir.",
     h:["Sasani devletinde şahınşah, soylular, din adamları ve komutanlardan oluşan bir meclise danışırdı. Büyük kararlar Ktesifon'daki görkemli salonlarda alınırdı.",
        "M.S. 531 — I. Hüsrev Anuşirvan tahta çıktı; vergi ve yönetim reformlarıyla ünlendi.",
        "Hüsrev Anuşirvan adaletiyle öyle ün saldı ki Doğu edebiyatında 'Adil Nuşirevan' diye anıldı."],
     en:{name:"Council Hall", desc:"Hall where the shahs decided", eraSub:"The shah's council gathers",
         story:"The shahs made their great decisions here.",
         feature:"<strong>Gold, cinnabar and lapis</strong> gems are the <strong>ornaments of the Sasanian palace</strong>."}},
    {icon:"🔥", name:"Kutsal Ateş Kulesi", year:500, color:"#ff7030", dark:"#8a2000",
     desc:"Asırlık alevin kulesi", eraSub:"Kutsal ateş göğe yükseliyor",
     story:"Zerdüşt ateşi 1000 yıldır yanmaya devam ediyordu.",
     feature:"<strong>🔥 Kutsal Ateş</strong> ve <strong>Mermer</strong> bir arada — Sasani çağının son ve en zorlu sınavı.",
     h:["Sasaniler Zerdüştlüğü devletin resmî dini hâline getirdi. En kutsal ateşler, Adur Guşnasp gibi büyük tapınaklarda kesintisiz yanık tutulurdu.",
        "M.S. 628 — II. Hüsrev tahttan indirildi; imparatorluk iç karışıklıklarla sarsıldı.",
        "Satranç Hindistan'dan Sasani sarayına geldi; 'şah' ve 'mat' kelimeleri Farsçadan dünyaya yayıldı."],
     en:{name:"Tower of the Sacred Fire", desc:"Tower of the ancient flame", eraSub:"The sacred fire rises to the sky",
         story:"The Zoroastrian fire had been burning for 1000 years.",
         feature:"<strong>🔥 Sacred Fire</strong> and <strong>Marble</strong> together — the last and hardest test of the Sasanian age."}},
  ],
  5: [
    {icon:"🕌", name:"İlk Cami", year:638, color:"#3fbf7f", dark:"#0a5a2a",
     desc:"Kufe'nin ilk mescidi", eraSub:"Kufe kuruluyor",
     story:"Kufe şehri kuruldu, ilk camiler inşa edildi.",
     feature:"<strong>🌙 Hilal Taşı</strong> 3 kez toplanınca <strong>bonus patlama</strong> yaratır.",
     h:["Kadisiye zaferinin ardından Müslümanlar Fırat kıyısında Kufe ve Basra gibi ordugâh şehirleri kurdu. Kufe'nin merkezine, çevresi hendekle belirlenmiş sade bir cami inşa edildi.",
        "M.S. 636 — Kadisiye Savaşı'nda Sa'd bin Ebi Vakkas komutasındaki ordu Sasanileri yendi; ertesi yıl Ktesifon alındı.",
        "Rivayete göre Kufe camiinin sınırları, merkezden dört yöne atılan okların düştüğü yerlere göre çizildi."],
     en:{name:"First Mosque", desc:"The first mosque of Kufa", eraSub:"Kufa is founded",
         story:"The city of Kufa was founded and the first mosques were built.",
         feature:"<strong>🌙 Crescent Stone</strong> collected 3 times makes a <strong>bonus blast</strong>."}},
    {icon:"📖", name:"Kuran Okulu", year:650, color:"#e8d8a0", dark:"#7a6a30",
     desc:"İlmin ilk halkaları", eraSub:"İlim halkaları kuruluyor",
     story:"İslam ilmi Mezopotamya'da hızla yayıldı.",
     feature:"<strong>Kerpiç Duvar</strong> engelleri <strong>2 vuruşta</strong> kırılır.",
     h:["Kufe ve Basra kısa sürede İslam ilminin merkezleri oldu. Arap dilbilgisinin temelleri, Kuran'ın doğru okunması amacıyla bu şehirlerde atıldı.",
        "M.S. 650'ler — Hz. Osman döneminde Kuran nüshaları çoğaltılıp büyük şehirlere gönderildi.",
        "Arap yazısının köşeli türlerinden biri bu şehrin adıyla 'Kufi' yazı olarak anılır."],
     en:{name:"Quran School", desc:"The first circles of learning", eraSub:"Circles of learning form",
         story:"Islamic learning spread quickly across Mesopotamia.",
         feature:"<strong>Mud-Brick Wall</strong> blocks break in <strong>2 hits</strong>."}},
    {icon:"🌙", name:"Hilal Kulesi", year:660, color:"#d0e8ff", dark:"#2a4a7a",
     desc:"Ufukta yükselen hilal", eraSub:"Hilal semada parlıyor",
     story:"İslam medeniyetinin sembolü Mezopotamya semalarında yükseldi.",
     feature:"<strong>🌙 Hilal</strong> taşlarını topla: her <strong>3 hilalde bir</strong> elmas biçiminde büyük bir patlama olur.",
     h:["Bu dönemde İslam devleti Mezopotamya'dan İran'a ve Orta Asya sınırlarına kadar genişledi. Kufe, Hz. Ali'nin halifeliği sırasında (656-661) başkent oldu.",
        "M.S. 661 — Emevi hanedanı kuruldu ve başkent Şam'a taşındı.",
        "Hilalin İslam'ın simgesi olarak yaygınlaşması aslında çok daha sonra, özellikle Osmanlı döneminde gerçekleşti."],
     en:{name:"Crescent Tower", desc:"A crescent rising on the horizon", eraSub:"The crescent shines in the sky",
         story:"The symbol of Islamic civilisation rose in the skies of Mesopotamia.",
         feature:"<strong>🌙 Crescent</strong> stones — collect them: every <strong>3 crescents</strong> make a big diamond-shaped blast."}},
    {icon:"🏥", name:"İslam Hastanesi", year:700, color:"#7ae0c0", dark:"#0a6a5a",
     desc:"Şifa ve ilim yurdu", eraSub:"Hekimler şifa dağıtıyor",
     story:"İslam tıbbı antik bilgiyi yeni keşiflerle birleştirdi.",
     feature:"<strong>Kerpiç</strong> engelleri bombalarla da kırılır — <strong>💥 bomba</strong> patlaması her duvara bir vuruş yapar.",
     h:["Erken İslam döneminde tıp, Cündişapur'dan gelen hekimlerin birikimiyle gelişti. Yunan ve Pers tıp kitapları sonraki yüzyıllarda Arapçaya çevrilecekti.",
        "M.S. 707 — Emevi Halifesi I. Velid'in Şam'da hastalar için bir bakımevi kurduğu anlatılır.",
        "İslam dünyasında hastanelere 'bimaristan' denirdi; kelime Farsçada 'hastaların yeri' anlamına gelir."],
     en:{name:"Islamic Hospital", desc:"Home of healing and learning", eraSub:"Physicians bring healing",
         story:"Islamic medicine joined ancient knowledge with new discoveries.",
         feature:"<strong>Mud-brick</strong> also breaks with bombs — a <strong>💥 bomb</strong> blast hits every wall once."}},
    {icon:"🏪", name:"Büyük Çarşı", year:720, color:"#ffc040", dark:"#8a5a00",
     desc:"Kufe'nin kalabalık pazarı", eraSub:"Çarşı esnafla doluyor",
     story:"Bağdat kurulmadan önce Kufe ticaret merkezi oldu.",
     feature:"<strong>Yeşim, fildişi ve altın</strong> taşlar <strong>Kufe çarşısının</strong> hazineleridir.",
     h:["Kufe ve Basra, Körfez'den gelen mallarla dolup taşan canlı ticaret merkezleriydi. Çarşılarda baharat, kumaş, hurma ve atlar el değiştirirdi.",
        "M.S. 696 — Halife Abdülmelik ilk İslam altın dinarını bastırdı.",
        "Basralı denizcilerin uzak diyarlara yolculukları, sonradan Sinbad hikâyelerine ilham veren anlatıların kaynağı sayılır."],
     en:{name:"Grand Bazaar", desc:"The bustling market of Kufa", eraSub:"The bazaar fills with merchants",
         story:"Before Baghdad was founded, Kufa became the centre of trade.",
         feature:"<strong>Jade, ivory and gold</strong> gems are the <strong>treasures of the Kufa bazaar</strong>."}},
    {icon:"🌿", name:"Bahçe Şehri", year:740, color:"#6ad060", dark:"#1a6a1a",
     desc:"Suyla yeşeren bahçeler", eraSub:"Bahçeler çiçek açıyor",
     story:"Müslüman mimarlar yeşil bahçe şehirler kurdu.",
     feature:"<strong>🌙 Hilal</strong> ve <strong>Kerpiç</strong> bir arada — erken İslam çağının son ve en zorlu sınavı.",
     h:["Müslüman mimarlar avlulu evleri, havuzları ve meyve bahçeleriyle serin yaşam alanları kurdu. Su kanallarıyla dörde bölünen bahçeler cennet tasvirinden ilham alıyordu.",
        "M.S. 750 — Zab Savaşı'nda Abbasiler Emevileri yendi; yeni bir halifelik çağı başladı.",
        "Fars geleneğinden gelen dört bölümlü 'çaharbağ' bahçe planı, yüzyıllar sonra Tac Mahal'in bahçesinde de uygulandı."],
     en:{name:"Garden City", desc:"Gardens that bloom with water", eraSub:"The gardens are in bloom",
         story:"Muslim architects built green garden cities.",
         feature:"<strong>🌙 Crescent</strong> and <strong>Mud-brick</strong> together — the last and hardest test of early Islam."}},
  ],
  6: [
    {icon:"🏛", name:"Bağdat Yuvarlak Şehri", year:762, color:"#4a8ae0", dark:"#0a2a6a",
     desc:"Mansur'un Barış Şehri", eraSub:"Yuvarlak şehir kuruluyor",
     story:"Halife Mansur dünyanın en büyük şehrini kurdu.",
     feature:"<strong>🔭 Usturlap Taşı</strong> eşleşince <strong>aynı renkteki tüm taşları</strong> temizler.",
     h:["Halife Mansur, Bağdat'ı Dicle kıyısında kusursuz bir daire planıyla kurdu ve adını 'Medinetü's-Selam' (Barış Şehri) koydu. Çift surla çevrili şehrin dört kapısı dört ayrı yöne açılırdı.",
        "M.S. 762 — İnşaat başladı; kaynaklara göre on binlerce işçi ve usta şehrin yapımında çalıştı.",
        "Yuvarlak şehrin tam merkezinde yeşil kubbeli halife sarayı ile Büyük Cami yan yana dururdu."],
     en:{name:"Round City of Baghdad", desc:"Al-Mansur's City of Peace", eraSub:"The round city is founded",
         story:"Caliph al-Mansur founded the greatest city in the world.",
         feature:"<strong>🔭 Astrolabe Stone</strong> when matched, <strong>every gem of the same colour</strong> is cleared."}},
    {icon:"📚", name:"Beytülhikme", year:830, color:"#ffd060", dark:"#8a6000",
     desc:"Bilgelik Evi", eraSub:"Çevirmenler çalışıyor",
     story:"Bilgelik Evi'nde Yunanca, Farsça eserler Arapçaya çevrildi.",
     feature:"<strong>Mermer</strong> bloklar <strong>3 vuruşta</strong> kırılır — yanlarında sabırla eşleşme yap.",
     h:["Beytülhikme, Abbasi halifelerinin, özellikle Me'mun'un desteklediği bir kütüphane ve çeviri merkeziydi. Yunanca, Süryanice ve Farsça bilim eserleri burada Arapçaya kazandırıldı.",
        "M.S. 820 civarı — Harezmi, cebire adını veren 'el-Kitabü'l-Muhtasar fi Hisabi'l-Cebr ve'l-Mukabele' eserini yazdı.",
        "'Algoritma' kelimesi Harezmi'nin adının Latince okunuşundan gelir."],
     en:{name:"House of Wisdom", desc:"Bayt al-Hikma", eraSub:"The translators are at work",
         story:"In the House of Wisdom, Greek and Persian works were translated into Arabic.",
         feature:"<strong>Marble</strong> blocks break in <strong>3 hits</strong> — match patiently beside them."}},
    {icon:"🔭", name:"Rasathane", year:850, color:"#9a8aff", dark:"#2a1a7a",
     desc:"Yıldızların haritalandığı kule", eraSub:"Gökbilimciler gökyüzünü ölçüyor",
     story:"Abbasi astronomlar yıldızları haritaladı.",
     feature:"<strong>🔭 Usturlap</strong> taşını <strong>hedef renginde</strong> eşleştir — tek hamlede hedefin yarısı gidebilir.",
     h:["Halife Me'mun, Bağdat'ın Şemmasiyye semtinde bir rasathane kurdurdu. Burada gökbilimciler gezegen tablolarını düzeltti ve yıldız konumlarını ölçtü.",
        "M.S. 830'lar — Me'mun'un gökbilimcileri Dünya'nın çevresini hesaplamak için Sincar Ovası'nda ölçüm yaptı.",
        "Bugün kullanılan pek çok yıldız adı — Altair, Aldebaran, Betelgeuse — Arapçadan gelir."],
     en:{name:"Observatory", desc:"The tower where stars were mapped", eraSub:"Astronomers measure the sky",
         story:"Abbasid astronomers mapped the stars.",
         feature:"<strong>🔭 Astrolabe</strong> — match it <strong>in a goal colour</strong> and half the goal can vanish in one move."}},
    {icon:"🏥", name:"Büyük Bimarhane", year:900, color:"#6ae0d0", dark:"#0a5a5a",
     desc:"Bağdat'ın büyük hastanesi", eraSub:"Bimarhane hastalarını kabul ediyor",
     story:"Er-Razi'nin tıp anlayışı burada hayat buldu.",
     feature:"<strong>Zincirleme</strong> eşleşmeler mermeri defalarca vurur — <strong>Dicle gibi</strong> akan kombolar kur.",
     h:["Bağdat'taki bimarhaneler hastaları ücretsiz tedavi eden ve hekim yetiştiren kurumlardı. Ünlü hekim Ebu Bekir er-Razi, Bağdat'taki bir hastanenin başhekimliğini yaptı.",
        "M.S. 982 — Büveyhî hükümdarı Adudüddevle, Bağdat'ta dönemin en büyük hastanelerinden Adudi Bimarhanesi'ni kurdu.",
        "Rivayete göre Razi, hastanenin yerini seçmek için şehrin farklı yerlerine et parçaları astırdı ve etin en geç bozulduğu yeri seçti."],
     en:{name:"Great Bimaristan", desc:"The great hospital of Baghdad", eraSub:"The hospital welcomes patients",
         story:"The medicine of al-Razi came to life here.",
         feature:"<strong>Chain</strong> matches hit marble again and again — build combos <strong>like the Tigris</strong>."}},
    {icon:"🌉", name:"Dicle Saray Köprüsü", year:950, color:"#4ac0ff", dark:"#0a4a8a",
     desc:"İki yakayı bağlayan köprü", eraSub:"Saraylar iki yakaya yayılıyor",
     story:"Halifeler Dicle'nin her iki yakasında saraylar kurdu.",
     feature:"<strong>Lapis, amber ve yeşim</strong> taşlar <strong>Abbasi saraylarının</strong> süsleridir.",
     h:["Bağdat kısa sürede yuvarlak şehrin dışına taşarak Dicle'nin iki yakasına yayıldı. İki yakayı birbirine bağlayan duba köprüler şehrin en işlek geçitleriydi.",
        "M.S. 945 — Büveyhîler Bağdat'a girdi; halifeler siyasi gücünü yitirerek sembolik liderlere dönüştü.",
        "Dönemin kaynaklarına göre Bağdat, 10. yüzyılda dünyanın en kalabalık şehirlerinden biriydi."],
     en:{name:"Tigris Palace Bridge", desc:"The bridge joining both banks", eraSub:"Palaces spread along both banks",
         story:"The caliphs built palaces on both banks of the Tigris.",
         feature:"<strong>Lapis, amber and jade</strong> gems are the <strong>ornaments of the Abbasid palaces</strong>."}},
    {icon:"🕌", name:"Mustansıriyye Medresesi", year:1233, color:"#3fbf7f", dark:"#0a5a3a",
     desc:"Dört mezhebin medresesi", eraSub:"Mustansıriyye açılıyor",
     story:"Moğol istilasından önce kurulan son büyük eser.",
     feature:"<strong>🔭 Usturlap</strong> ve <strong>Mermer</strong> bir arada — Abbasi çağının son ve en zorlu sınavı.",
     h:["Mustansıriyye Medresesi, Halife Müstansır tarafından 1227-1234 yılları arasında inşa ettirildi. Dört Sünni mezhebin birlikte okutulduğu ilk büyük medreselerden biriydi.",
        "M.S. 1258 — Moğol kuşatmasıyla Bağdat düştü; Abbasi Halifeliği'nin Bağdat dönemi sona erdi.",
        "Medresenin girişinde saatleri gösteren ünlü bir su saati bulunduğu anlatılır; bina bugün hâlâ Bağdat'ta ayaktadır."],
     en:{name:"Mustansiriya Madrasa", desc:"The madrasa of the four schools", eraSub:"The Mustansiriya opens",
         story:"The last great work built before the Mongol invasion.",
         feature:"<strong>🔭 Astrolabe</strong> and <strong>Marble</strong> together — the last and hardest test of the Abbasid age."}},
  ],
  7: [
    {icon:"🏰", name:"Moğol Kalesi", year:1260, color:"#a0a0a0", dark:"#3a3a3a",
     desc:"Harabelerin üstündeki kale", eraSub:"Hülagu kalesini kuruyor",
     story:"Hülagu yıkılan şehrin üzerine kale kurdu.",
     feature:"<strong>🐎 Akıncı Taşı</strong> eşleşince <strong>komşu tüm taşları</strong> yok eder — buzlar dahil.",
     h:["Hülagu Han, 1258'de Bağdat'ı kuşatıp ele geçirdi; şehir yağmalandı ve son Abbasi halifesi Müsta'sım öldürüldü. Hülagu, İran ve Irak'ı yöneten İlhanlı Devleti'ni kurdu.",
        "M.S. 1260 — Ayn Calut Savaşı'nda Memlükler Moğolları yenerek batıya ilerleyişlerini durdurdu.",
        "Anlatılara göre Bağdat kütüphanelerinden Dicle'ye atılan kitapların mürekkebiyle nehrin rengi kararmıştı."],
     en:{name:"Mongol Fortress", desc:"A fortress upon the ruins", eraSub:"Hulagu builds his fortress",
         story:"Hulagu built a fortress over the ruined city.",
         feature:"<strong>🐎 Raider Stone</strong> when matched, <strong>all neighbouring gems</strong> are destroyed — ice included."}},
    {icon:"🐴", name:"Moğol Ordu Karargahı", year:1280, color:"#c08a50", dark:"#5a3a1a",
     desc:"Bozkır atlılarının obası", eraSub:"Atlılar ovaya yayılıyor",
     story:"Moğol atlıları Mezopotamya'ya hâkimdi.",
     feature:"<strong>Buz Taşı</strong> içindeki taşı hapseder — <strong>yanında eşleşme</strong> yapınca çözülür.",
     h:["Moğol ordusu onluk sisteme göre örgütlenmişti: onluk, yüzlük, binlik ve on binlik (tümen) birlikler. Her asker birkaç yedek atla sefere çıkar, olağanüstü hızla hareket ederdi.",
        "M.S. 1295 — Gazan Han İslam'ı kabul etti ve İlhanlı devletinde köklü reformlar başlattı.",
        "Moğolların 'yam' adlı posta sistemi, atlı ulakların günde yüzlerce kilometre yol almasını sağlıyordu."],
     en:{name:"Mongol Army Camp", desc:"Camp of the steppe riders", eraSub:"Riders spread across the plain",
         story:"Mongol horsemen ruled over Mesopotamia.",
         feature:"<strong>Ice Stone</strong> traps the gem inside — it thaws when you <strong>match beside it</strong>."}},
    {icon:"🔄", name:"Yeniden İnşaat", year:1300, color:"#d8c8a0", dark:"#6a5a3a",
     desc:"Küllerinden doğan şehir", eraSub:"Şehir yeniden kuruluyor",
     story:"Yavaş yavaş şehirler yeniden kurulmaya başladı.",
     feature:"<strong>🐎 Akıncı</strong> taşı <strong>buzlu taşların yanında</strong> patlarsa hepsi bir anda çözülür.",
     h:["Yıkımın ardından İlhanlı yönetimi vergi düzenini yenileyip şehirlerin onarımına başladı. Bağdat eski ihtişamına kavuşamasa da bölgenin önemli bir merkezi olmayı sürdürdü.",
        "M.S. 1300'ler — Vezir Reşidüddin, dünya tarihi niteliğindeki 'Camiü't-Tevarih'i yazdı.",
        "Camiü't-Tevarih, Çin'den Avrupa'ya pek çok halkın tarihini anlatan ilk 'dünya tarihi' kitaplarından biri sayılır."],
     en:{name:"Reconstruction", desc:"A city reborn from its ashes", eraSub:"The city is rebuilt",
         story:"Little by little, the cities began to be rebuilt.",
         feature:"<strong>🐎 Raider</strong> blasted <strong>next to frozen gems</strong> thaws them all at once."}},
    {icon:"🕌", name:"İlhanlı Camii", year:1320, color:"#5ab0e0", dark:"#1a4a6a",
     desc:"Çinilerle bezeli cami", eraSub:"Kubbeler yükseliyor",
     story:"Moğollar İslam'ı kabul etti, cami inşa ettiler.",
     feature:"<strong>Zincirleme</strong> eşleşmeler buzları tek tek çözer — <strong>bozkır rüzgârı</strong> gibi kombolar kur.",
     h:["Gazan Han'ın Müslüman olmasıyla İlhanlılar cami, medrese ve türbe inşaatına hız verdi. Parlak mavi çiniler ve dev kubbeler bu dönemin mimarisini simgeler.",
        "M.S. 1313 — Sultaniye'deki Olcaytu Türbesi tamamlandı; kubbesi dünyanın en büyük tuğla kubbelerinden biridir.",
        "İlhanlı çini ustaları, Çin'den gelen ejder ve anka motiflerini İslam sanatına taşıdı."],
     en:{name:"Ilkhanid Mosque", desc:"A mosque adorned with tiles", eraSub:"Domes rise",
         story:"The Mongols embraced Islam and built mosques.",
         feature:"<strong>Chain</strong> matches thaw the ice one by one — build combos <strong>like the steppe wind</strong>."}},
    {icon:"🌾", name:"Sulama Tamiri", year:1350, color:"#9ad070", dark:"#3a5a1a",
     desc:"Onarılan kanallar", eraSub:"Kanallar yeniden akıyor",
     story:"Yıkılan kanallar onarıldı, tarım yeniden başladı.",
     feature:"<strong>Kızıl, tunç ve fildişi</strong> taşlar <strong>bozkır ordusunun</strong> renkleridir.",
     h:["Savaşlar ve ihmal sonucu Mezopotamya'nın binlerce yıllık kanal ağı büyük zarar gördü. Onarım çalışmaları yapılsa da tarım eski verimine uzun süre ulaşamadı.",
        "M.S. 1335 — Son güçlü İlhanlı hükümdarı Ebu Said öldü; devlet parçalandı ve Bağdat Celayirlilerin eline geçti.",
        "Tarihçiler, kanal sisteminin çöküşünü Mezopotamya nüfusunun yüzyıllarca azalmasının başlıca nedenlerinden biri sayar."],
     en:{name:"Canal Repairs", desc:"The mended canals", eraSub:"The canals flow again",
         story:"The ruined canals were repaired and farming began again.",
         feature:"<strong>Crimson, bronze and ivory</strong> gems are the <strong>colours of the steppe army</strong>."}},
    {icon:"🏪", name:"Kervan Sarayı", year:1400, color:"#d0a060", dark:"#6a4a1a",
     desc:"Kervanların güvenli konağı", eraSub:"Kervanlar yeniden yolda",
     story:"İpek Yolu ticareti tekrar canlandı.",
     feature:"<strong>🐎 Akıncı</strong> ve <strong>Buz</strong> bir arada — Moğol çağının son ve en zorlu sınavı.",
     h:["Kervansaraylar, ticaret yolları üzerinde tüccarların ve hayvanlarının güvenle konakladığı avlulu yapılardı. Moğol barışı döneminde İpek Yolu yeniden canlandı.",
        "M.S. 1401 — Timur Bağdat'ı yağmaladı; ardından bölgede Karakoyunlu ve Akkoyunlu Türkmenleri hüküm sürdü.",
        "Bağdat'taki Han Mercan (1359), Celayirliler döneminden günümüze ulaşan etkileyici bir kervansaraydır."],
     en:{name:"Caravanserai", desc:"A safe inn for caravans", eraSub:"Caravans are on the road again",
         story:"Silk Road trade came back to life.",
         feature:"<strong>🐎 Raider</strong> and <strong>Ice</strong> together — the last and hardest test of the Mongol age."}},
  ],
  8: [
    {icon:"🕌", name:"Osmanlı Camii", year:1535, color:"#d04040", dark:"#6a0a0a",
     desc:"Kanuni'nin Bağdat camii", eraSub:"Kanuni Bağdat'a giriyor",
     story:"Kanuni Bağdat'a büyük bir cami yaptırdı.",
     feature:"<strong>🏵 Tuğra Taşı</strong> eşleşince <strong>aynı renkteki tüm taşları</strong> temizler.",
     h:["Kanuni Sultan Süleyman, Irakeyn Seferi sırasında 1534'te Bağdat'a girdi. Sultan, İmam-ı Azam Ebu Hanife'nin türbesini onarttı ve yanına bir cami ile külliye yaptırdı.",
        "M.S. 1534 — Bağdat Osmanlı topraklarına katıldı ve bir eyalet merkezi oldu.",
        "Bu seferde Kanuni'nin yanında bulunan Matrakçı Nasuh, yol boyundaki şehirlerin minyatürlerini çizdi."],
     en:{name:"Ottoman Mosque", desc:"Suleiman's mosque in Baghdad", eraSub:"Suleiman enters Baghdad",
         story:"Suleiman had a great mosque built in Baghdad.",
         feature:"<strong>🏵 Tughra Stone</strong> when matched, <strong>every gem of the same colour</strong> is cleared."}},
    {icon:"🏛", name:"Osmanlı Sarayı", year:1550, color:"#e8c060", dark:"#8a5a10",
     desc:"Paşaların yönetim konağı", eraSub:"Valiler şehri yönetiyor",
     story:"Osmanlı valileri görkemli saraylardan yönetti.",
     feature:"<strong>Mermer</strong> bloklar <strong>3 vuruşta</strong> kırılır — yanlarında sabırla eşleşme yap.",
     h:["Osmanlı Bağdat'ı, İstanbul'dan atanan beylerbeyleri ve paşalar tarafından yönetildi. Şehir, İran sınırında stratejik bir kale ve ticaret merkeziydi.",
        "M.S. 1623 — Safeviler Bağdat'ı ele geçirdi; şehir 15 yıl İran yönetiminde kaldı.",
        "18. yüzyılda Bağdat'ı Kölemen (Memlük) paşaları yönetti ve eyalet geniş bir özerklik kazandı."],
     en:{name:"Ottoman Palace", desc:"The governors' residence", eraSub:"Governors rule the city",
         story:"Ottoman governors ruled from magnificent palaces.",
         feature:"<strong>Marble</strong> blocks break in <strong>3 hits</strong> — match patiently beside them."}},
    {icon:"⚓", name:"Dicle Limanı", year:1580, color:"#4a9ad0", dark:"#0a3a6a",
     desc:"Nehir ticaretinin iskelesi", eraSub:"Gemiler Basra'ya iniyor",
     story:"Osmanlı ticareti Dicle üzerinden aktı.",
     feature:"<strong>🏵 Tuğra</strong> taşını <strong>hedef renginde</strong> eşleştir — tek hamlede hedefin yarısı gidebilir.",
     h:["Dicle ve Fırat, Bağdat'ı Basra'ya ve Hint Okyanusu ticaretine bağlayan su yollarıydı. Mallar keleklerle ve nehir gemileriyle taşınırdı.",
        "M.S. 1546 — Osmanlılar Basra'yı alarak Basra Körfezi'ne ulaştı.",
        "Kelek, şişirilmiş hayvan derileri üzerine kurulan sallardır; Asurlulardan beri Dicle'de kullanılıyordu."],
     en:{name:"Tigris Harbour", desc:"The quay of river trade", eraSub:"Ships sail down to Basra",
         story:"Ottoman trade flowed along the Tigris.",
         feature:"<strong>🏵 Tughra</strong> — match it <strong>in a goal colour</strong> and half the goal can vanish in one move."}},
    {icon:"🏪", name:"Kapalı Çarşı", year:1600, color:"#d08a40", dark:"#6a3a10",
     desc:"Kubbeli çarşının dükkânları", eraSub:"Çarşı kubbeleri örülüyor",
     story:"Bağdat çarşıları İstanbul'unkiler gibi kubbeli ve canlıydı.",
     feature:"<strong>Zincirleme</strong> eşleşmeler mermeri defalarca vurur — <strong>çarşı kalabalığı</strong> gibi kombolar kur.",
     h:["Osmanlı Bağdat'ında kubbeli bedestenler, hanlar ve çarşılar şehrin ticari kalbini oluşturuyordu. Hint kumaşları, İran ipeği ve Arap atları bu çarşılarda el değiştirirdi.",
        "M.S. 1638 — Sultan IV. Murad Bağdat'ı Safevilerden geri aldı.",
        "Topkapı Sarayı'ndaki Bağdat Köşkü, IV. Murad'ın Bağdat zaferinin anısına yaptırıldı."],
     en:{name:"Covered Bazaar", desc:"Shops of the domed bazaar", eraSub:"The bazaar domes are built",
         story:"The bazaars of Baghdad were domed and lively like those of Istanbul.",
         feature:"<strong>Chain</strong> matches hit marble again and again — build combos <strong>like a bazaar crowd</strong>."}},
    {icon:"🌉", name:"Osmanlı Köprüsü", year:1650, color:"#6ab0e0", dark:"#1a4a6a",
     desc:"Dicle'yi aşan köprü", eraSub:"Köprü iki yakayı birleştiriyor",
     story:"Dicle üzerine sağlam köprüler inşa edildi.",
     feature:"<strong>Kızıl, çini mavisi ve yeşim</strong> taşlar <strong>Osmanlı çinilerinin</strong> renkleridir.",
     h:["Osmanlı döneminde Bağdat'ın iki yakası, dubalar üzerine kurulan köprülerle birbirine bağlandı. Bu köprüler taşkın mevsiminde sökülüp yeniden kurulabilirdi.",
        "M.S. 1704 — Hasan Paşa Bağdat valisi oldu; ailesi ve kölemenleri eyaleti bir buçuk asır yönetti.",
        "Seyyah Evliya Çelebi 1650'lerde Bağdat'ı ziyaret ederek şehrin köprülerini ve çarşılarını Seyahatname'sinde anlattı."],
     en:{name:"Ottoman Bridge", desc:"The bridge across the Tigris", eraSub:"The bridge joins both banks",
         story:"Sturdy bridges were built across the Tigris.",
         feature:"<strong>Crimson, tile blue and jade</strong> gems are the <strong>colours of Ottoman tiles</strong>."}},
    {icon:"🏰", name:"Son Kale", year:1700, color:"#c83a3a", dark:"#5a0a0a",
     desc:"Osmanlı'nın son büyük eseri", eraSub:"Son kale yükseliyor",
     story:"Osmanlı'nın Mezopotamya'daki son büyük eseri.",
     feature:"<strong>🏵 Tuğra</strong> ve <strong>Mermer</strong> bir arada — 2500 yıllık yolculuğun son ve en zorlu sınavı.",
     h:["Osmanlılar Bağdat'ı surlar, kaleler ve kışlalarla güçlendirdi; Irak yaklaşık dört yüzyıl Osmanlı yönetiminde kaldı. Şehrin savunması özellikle İran sınırına karşı büyük önem taşıyordu.",
        "M.S. 1869 — Mithat Paşa Bağdat valisi oldu; şehre atlı tramvay, matbaa ve ilk gazete Zevra'yı getirdi.",
        "1917'de İngiliz ordusu Bağdat'a girdi; 1918 Mondros Mütarekesi'yle Osmanlı'nın Mezopotamya'daki dönemi sona erdi."],
     en:{name:"The Last Fortress", desc:"The last great Ottoman work", eraSub:"The last fortress rises",
         story:"The last great Ottoman work in Mesopotamia.",
         feature:"<strong>🏵 Tughra</strong> and <strong>Marble</strong> together — the last and hardest test of a 2,500-year journey."}},
  ],
};
const MZ_UNLOCK = [0, 8, 18, 30, 44, 60];
const MZ_ART = {
  1:['ppalace','firealtar','road','chest','apadana','swords'],
  2:['gtemple','masks','asclepius','flask','statue','ship'],
  3:['fortress','horse','iwan','firetemple','amphora','bridge'],
  4:['greatarch','books','wheat','helmet','throne','firetower'],
  5:['mosque','rahle','crescenttower','bimaristan','bazaar','garden'],
  6:['roundcity','books','observatory','bimaristan','palacebridge','madrasa'],
  7:['fortress','yurt','scaffold','bluedome','wheat','caravan'],
  8:['omosque','opalace','anchor','bazaar','bridge','fortress'],
};
const CIV_ART = ['ziggurat','lion','vergina','bow','flame','crescent','books','horse','omosque'];
CIVILIZATIONS.forEach((c,i)=>{ c.art=CIV_ART[i]; });   // medeniyet içi yıldız kilitleri (6 yapı × 5 bölüm × 3 yıldız = 90)
// Bölüm üretici — medeniyetin hamle sayısı ve hedef çarpanı uygulanır.
// Her yapı imza taşlarından farklı birini öne çıkarır; engel sayısı çağlar ilerledikçe artar.
function mzLevels(civ, k){
  const g=civ.gemSet, order=[g[k%3], g[(k+1)%3], g[(k+2)%3], g[3+(k%3)]];
  const T=[[8,6],[9,7],[9,7,5],[8,6,5],[8,6,5,4]], OB=[0,2,3,5,6], SC=[1400,1600,2000,2200,2600];
  const extraObs=Math.floor((civ.id-1)/2), bump=Math.floor(k/3), m=civ.targetMul;
  return T.map((t,l)=>{
    const target={};
    t.forEach((v,j)=>{ target[order[j]]=Math.round((v+(j===0?bump:0))*m); });
    const score=Math.round(SC[l]*m/50)*50;
    const lv={moves:civ.moves, target, score, stars:[.58,.78,1].map(f=>Math.round(score*f/50)*50)};
    if(OB[l]) lv.obstacles=OB[l]+extraObs;
    return lv;
  });
}
CIVILIZATIONS.forEach(civ=>{
  if(!civ.id) return;
  MZ_BUILDINGS[civ.id].forEach((d,k)=>{
    BUILDINGS.push({id:BUILDINGS.length, civ:civ.id, name:d.name, icon:d.icon, art:MZ_ART[civ.id][k], year:d.year, eraSub:d.eraSub,
      desc:d.desc, story:d.story, feature:d.feature, featIcon:'', featSp:civ.special, color:d.color,
      grad:`linear-gradient(135deg,${d.dark},${d.color})`, levels:mzLevels(civ,k), unlockStars:MZ_UNLOCK[k],
      history:d.h, en:d.en});
  });
});
// Sıralı açılma: her yapı bir öncekinin (medeniyetin ilk yapısı için önceki medeniyetin son yapısının) bitmesini bekler
BUILDINGS.forEach((b,i)=>{ b.unlockBuilding = i>0 ? i-1 : null; });

// ── Medeniyet / ilerleme yardımcıları ──
function civOf(idx){ return (BUILDINGS[idx] && BUILDINGS[idx].civ) || 0; }
function civBuildingIdx(c){ return BUILDINGS.map((b,i)=>i).filter(i=>civOf(i)===c); }
function buildingMaxStars(idx){ return BUILDINGS[idx].levels.length*3; }
function buildingStars(idx){ const bp=G.buildingProgress[idx]; return bp ? bp.stars.reduce((a,s)=>a+(s||0),0) : 0; }
function civStars(c){ return civBuildingIdx(c).reduce((a,i)=>a+buildingStars(i),0); }
function isBuildingComplete(idx){ const bp=G.buildingProgress[idx]; return !!bp && BUILDINGS[idx].levels.every((_,l)=>(bp.stars[l]||0)>0); }
function isCivComplete(c){ return civBuildingIdx(c).every(isBuildingComplete); }
function isCivUnlocked(c){ return c<=0 || isCivComplete(c-1); }
// Bir yapı, unlockBuilding'deki yapının tüm bölümleri (en az 1 yıldızla) bitince açılır.
// Eski kayıtlar: yıldız sistemiyle açılıp oynanmaya başlanmış yapı açık kalır (ilerleme kaybolmasın).
function isBuildingUnlocked(idx){
  const b=BUILDINGS[idx];
  if(!b || !isCivUnlocked(b.civ||0)) return false;
  return b.unlockBuilding==null || isBuildingComplete(b.unlockBuilding) || buildingStars(idx)>0;
}
// Kilitli yapı için önceki yapının ilerlemesi: {prev, done, n}
function buildingLockProgress(idx){
  const p=BUILDINGS[idx] && BUILDINGS[idx].unlockBuilding;
  if(p==null) return null;
  const bp=G.buildingProgress[p], n=BUILDINGS[p].levels.length;
  return {prev:BUILDINGS[p], done:bp ? bp.stars.filter(s=>s>0).length : 0, n};
}
function highestUnlockedCiv(){ let c=0; while(c+1<CIVILIZATIONS.length && isCivUnlocked(c+1)) c++; return c; }
// Kilitli yapı için kullanıcıya gösterilecek neden
function buildingLockMsg(idx){
  const b=BUILDINGS[idx], c=b.civ||0;
  if(!isCivUnlocked(c)) return `🔒 Önce ${CIVILIZATIONS[c-1].name} medeniyetini tamamla`;
  const lp=buildingLockProgress(idx);
  return lp ? `🔒 Önce ${lp.prev.name} bitmeli (${lp.done}/${lp.n} bölüm)` : '🔒 Kilitli';
}
// Eski kayıtlar: yapı listesi ve bölüm dizileri yeni uzunluklara tamamlanır (yıldızlar korunur)
function ensureProgress(){
  if(!Array.isArray(G.buildingProgress)) G.buildingProgress=[];
  BUILDINGS.forEach((b,i)=>{
    const bp = G.buildingProgress[i] = G.buildingProgress[i] || {stars:[]};
    if(!Array.isArray(bp.stars)) bp.stars=[];
    while(bp.stars.length<b.levels.length) bp.stars.push(0);
  });
}
function fmtYear(y){ return y<0 ? `M.Ö. ${-y}` : `M.S. ${y}`; }

// ── Engel taşları: "#sand:2", "#marble:3", "#ice:gemX" — sabit durur, eşleşmez, yer değiştirmez ──
function isObstacle(g){ return typeof g==='string' && g.charCodeAt(0)===35; }
function obstacleInfo(g){ const [type,val,gem]=g.slice(1).split(':'); return {type, val, gem}; }
// h: {direct, below, side} — vuruşun nereden geldiği (yeni engeller için; eskiler her vuruşu sayar)
function obstacleHit(r,c,full,h){
  const g=G.board[r][c];
  if(!isObstacle(g)) return;
  if(hdObstacleHit(r,c,full,h||{direct:true})) return;    // kilit/kafes/bal/sütun/karbon
  const {type,val}=obstacleInfo(g);
  if(type==='ice'){ G.board[r][c]=val; return; }          // buz çözülür, içindeki taş kalır
  const hp=full ? 0 : (+val-1);
  G.board[r][c] = hp>0 ? `#${type}:${hp}` : null;
}
// Temizlenecek hücreler: taşlar silinir, engeller vurulur; silinen taşın 4 komşusundaki engeller de 1 vuruş alır
function boardClearCells(cells, killSet){
  const hits=new Map();   // hücre → {direct, below, side}; bir temizlemede her engel en fazla 1 vuruş alır
  const hit=(i,k)=>{ const h=hits.get(i)||{}; h[k]=true; hits.set(i,h); };
  cells.forEach(({r,c})=>{
    const g=G.board[r] && G.board[r][c];
    if(isObstacle(g)){ hit(r*BS+c,'direct'); return; }
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
      const rr=r+dr, cc=c+dc;   // dr=-1 → engel bu hücrenin üstünde, yani patlama engelin ALTINDA
      if(rr>=0&&cc>=0&&rr<BS&&cc<BS&&isObstacle(G.board[rr][cc])) hit(rr*BS+cc, dr===-1?'below':'side');
    });
  });
  cells.forEach(({r,c})=>{ if(G.board[r] && !isObstacle(G.board[r][c])) G.board[r][c]=null; });
  hits.forEach((h,i)=>obstacleHit((i/BS)|0, i%BS, killSet && killSet.has(i), h));
  G._hdSuper=null; G._hdSuperAll=false;
  if(hits.size) SFX.select?.();
}
// Bölümün engellerini yerleştir (üst iki satır boş bırakılır)
function placeLevelObstacles(){
  const lvl=BUILDINGS[selectedBuilding].levels[selectedLevel];
  const type=G.civ && G.civ.obstacle, n=(lvl && lvl.obstacles)||0;
  if(!type || !n) return;
  let placed=0, tries=0;
  while(placed<n && tries++<300){
    const r=2+Math.floor(Math.random()*(BS-2)), c=Math.floor(Math.random()*BS);
    const g=G.board[r][c];
    if(isObstacle(g)) continue;
    G.board[r][c] = type==='ice' ? '#ice:'+getGemBase(g) : type==='sand' ? '#sand:2' : '#marble:3';
    placed++;
  }
}
// Yeni düşen taş: medeniyetin özel taşı küçük bir olasılıkla gelir
function spawnGem(){
  const g=randomGem(), sp=G.civ && G.civ.special;
  return (sp && G.gameActive!==undefined && Math.random()<(G.civ.specialP||0)) ? g+'_'+sp : g;
}
