// ══════════════════════════════════════════════
// VERİ & YAPILAR
// ══════════════════════════════════════════════
const BUILDINGS = [
  {
    id:0,name:"Babil Kulesi",icon:"🗼",desc:"Şehrin sembolü, gökyüzüne uzanır",
    story:"Tanrıların gözüne girebilmek umuduyla yüzyıllarca inşa edilen bu kule, her katında farklı bir tanrıya adanmış odalar barındırırdı. En tepedeki altın odada rahipler geceleri yıldızların dilini çözmeye çalışırdı. Rivayete göre kulenin zirvesinden her sabah yükselen duman, Marduk'un cevabını gökyüzüne taşırdı.",
    feature:"Her 3'lü eşleşmede <strong>+25 bonus puan</strong> kazanırsın — kule ne kadar yükselirse ruhun o kadar özgürleşir.",
    featIcon:"✨",
    color:"#f5c842",grad:"linear-gradient(135deg,#c87820,#f5c842)",
    levels:[
      {moves:18,target:{gem1:8,gem2:6},score:1200,stars:[800,1000,1200]},
      {moves:20,target:{gem1:10,gem3:8},score:1500,stars:[900,1200,1500]},
      {moves:22,target:{gem1:12,gem2:10,gem4:6},score:2000,stars:[1200,1600,2000]},
    ],
    unlockStars:0,
  },
  {
    id:1,name:"Asma Bahçeler",icon:"🌿",desc:"Dünyanın 7. harikası, yeşilin cenneti",
    story:"Kral Nebukadnezar, dağlık yurdunu özleyen eşi Amytis için bu bahçeleri inşa ettirdi. Sulama mühendisleri Fırat'ın suyunu zincirleme pompalarla yedi kata taşıdı; her katta farklı bir ülkeden getirilen bitkiler yetişirdi. Bahçenin en üst katında bir ağacın altında uyumanın insana ebedi huzur verdiğine inanılırdı.",
    feature:"Yeşil taş <strong>(▲) eşleşmeleri %15 ekstra puan</strong> getirir — her yaprak bir kadim sırı fısıldar.",
    featIcon:"🍃",
    color:"#44ff88",grad:"linear-gradient(135deg,#14a840,#44ff88)",
    levels:[
      {moves:20,target:{gem3:10,gem4:8},score:1400,stars:[900,1100,1400]},
      {moves:22,target:{gem3:14,gem5:8},score:1800,stars:[1100,1400,1800]},
      {moves:25,target:{gem3:16,gem4:12,gem2:8},score:2400,stars:[1400,1900,2400]},
    ],
    unlockStars:6,
  },
  {
    id:2,name:"Ishtar Kapısı",icon:"🚪",desc:"Lapis lazuli ile süslü kutsal kapı",
    story:"Lapis lazuliyle kaplı bu devasa kapı yılda yalnızca bir kez, Yeni Yıl törenlerinde açılırdı. Her tuğlasına bir ejderha ya da boğa figürü kazınmıştı; tam 337 hayvan sayılmıştır. Kapıdan geçen her ruhun Ishtar'ın ebedi koruması altına girdiğine kesinlikle inanılırdı.",
    feature:"Mavi taş <strong>(★) 4'lü eşleşmesi çift bomba gücü</strong> üretir — Ishtar'ın gazabı düşmanlarını ikiye böler.",
    featIcon:"💠",
    color:"#44bbff",grad:"linear-gradient(135deg,#1144bb,#44bbff)",
    levels:[
      {moves:18,target:{gem2:10,gem5:8},score:1300,stars:[850,1050,1300]},
      {moves:20,target:{gem2:12,gem1:10},score:1700,stars:[1050,1350,1700]},
      {moves:24,target:{gem2:16,gem5:12,gem3:6},score:2200,stars:[1300,1750,2200]},
    ],
    unlockStars:9,
  },
  {
    id:3,name:"Ziggurat Tapınağı",icon:"⛩️",desc:"Tanrılara adanmış kadim tapınak",
    story:"Yedi kata inşa edilen bu tapınak, her katı farklı bir gezegeni temsil edecek şekilde boyandı: siyah, turuncu, kırmızı, altın, sarı, mavi ve gümüş. En tepedeki baş rahip gece yarısı Jüpiter'in hareketlerini çivi yazısıyla kaydeder ve kehanetleri krala iletirdi. Bu tablet arşivi, dünyanın bilinen ilk sistematik astronomi veritabanıdır.",
    feature:"Hamle bitiminde kalan <strong>her hamle +10 bonus puan</strong> verir — tanrılar hızı ödüllendirir.",
    featIcon:"🔮",
    color:"#ffaa22",grad:"linear-gradient(135deg,#cc5500,#ffaa22)",
    levels:[
      {moves:22,target:{gem4:12,gem6:8},score:1600,stars:[1000,1300,1600]},
      {moves:24,target:{gem4:14,gem1:12},score:2000,stars:[1200,1600,2000]},
      {moves:26,target:{gem4:18,gem6:14,gem5:8},score:2600,stars:[1500,2100,2600]},
    ],
    unlockStars:15,
  },
  {
    id:4,name:"Bereketli Nehir",icon:"🌊",desc:"Fırat'ın kutsadığı sulama kanalları",
    story:"Babilliler Fırat'ın taşmasını 17 farklı işaretten önceden anlayabilirdi. Nehir kenarına kazınan çizgiler su seviyesini günlük ölçüyor; kayıtlar 400 yıl aralıksız tutuluyordu. Bu veri sistemi dünyanın bilinen ilk meteoroloji arşivi olarak kabul edilmekte ve günümüz iklim biliminin atası sayılmaktadır.",
    feature:"Zincirleme eşleşmelerde <strong>her katman +5 ekstra puan</strong> ekler — nehrin akışı gibi hiç durma.",
    featIcon:"💧",
    color:"#00ddff",grad:"linear-gradient(135deg,#006688,#00ddff)",
    levels:[
      {moves:20,target:{gem2:14,gem3:10},score:1500,stars:[950,1200,1500]},
      {moves:22,target:{gem2:16,gem5:12},score:1900,stars:[1150,1500,1900]},
      {moves:25,target:{gem2:20,gem3:16,gem4:10},score:2500,stars:[1450,2000,2500]},
    ],
    unlockStars:21,
  },
  {
    id:5,name:"Pazar Meydanı",icon:"🏪",desc:"İpek Yolu'nun kalbi, zenginliğin merkezi",
    story:"İpek Yolu'nun kalbi sayılan bu meydan günde on binden fazla tüccarın uğrak noktasıydı. Her sabah güneş doğmadan yerlerini tutmak için kapı önünde beklenir, en değerli emtiayı ilk alan en iyi yerde satardı. Pazarın kendi yazılı ticaret kuralları, günümüz ticaret hukukunun ilk kaynağı sayılmaktadır.",
    feature:"Altın taş <strong>(✦) eşleşmeleri ekstra 🪙 altın</strong> kazandırır — ticaret bilgesi hiçbir fırsatı kaçırmaz.",
    featIcon:"🪙",
    color:"#ff7744",grad:"linear-gradient(135deg,#cc2200,#ff7744)",
    levels:[
      {moves:20,target:{gem1:12,gem4:10,gem6:8},score:1700,stars:[1050,1350,1700]},
      {moves:22,target:{gem1:14,gem6:12,gem3:10},score:2100,stars:[1300,1700,2100]},
      {moves:26,target:{gem1:18,gem4:16,gem6:12,gem2:8},score:2800,stars:[1600,2200,2800]},
    ],
    unlockStars:27,
  },
];
