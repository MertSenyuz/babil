// ══════════════════════════════════════════════
// MEDENİYET YAPILARI — her dönemin 6 yapısı haritada kendi pininin altında (Babil'deki el yapımı yapılar gibi)
// TERR_LANDMARKS[civ][k] → PIN_POS[k] konumuna çizilen SVG (taban ortası = 0,0; yukarı negatif).
// 20-map.js → terrBuild() bunları sprite listesine ekler (y'ye göre sıralanır, ağaçlarla doğru üst üste biner).
// Renkler: TL_PAL[civ] dönem paleti; a = CIVILIZATIONS[civ].color (aksan).
// ══════════════════════════════════════════════
const TL_PAL = {
  1:{w:'#c8a878', wd:'#9a7e52', r:'#6a4a2a', t:'#e0c890'},   // Pers: kerpiç-taş, sedir çatı
  2:{w:'#ece6da', wd:'#c8c0b0', r:'#b0564a', t:'#f8f2e6'},   // İskender: mermer, kiremit
  3:{w:'#c09060', wd:'#8a6640', r:'#7a4a2a', t:'#d8b080'},   // Part: kerpiç
  4:{w:'#d0b888', wd:'#a08a60', r:'#8a5a2a', t:'#e8d4a8'},   // Sasani: alçı-taş
  5:{w:'#e8dcc0', wd:'#c0b090', r:'#2a8a4a', t:'#f5f0e0'},   // Erken İslam: beyaz badana, yeşil
  6:{w:'#d8c498', wd:'#b0986a', r:'#2a6aaa', t:'#f0e0b8'},   // Abbasi: tuğla, mavi çini
  7:{w:'#b8a890', wd:'#8a7a64', r:'#5a4a3a', t:'#d8ccb4'},   // Moğol: ahşap-taş
  8:{w:'#eee6d2', wd:'#c8bca2', r:'#8a96a0', t:'#fff8e8'},   // Osmanlı: kesme taş, kurşun kubbe
};

const TERR_LANDMARKS = (()=>{
  // ── Parça seti (hepsi tam sayı piksel, crispEdges) ──
  const R = (x,y,w,h,f,o)=>`<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(w)}" height="${Math.round(h)}" fill="${f}"${o!=null?` opacity="${o}"`:''}/>`;
  const shadow = (w, h=16)=>`<ellipse cx="8" cy="4" rx="${w/2+14}" ry="${h}" fill="#000" opacity=".3"/>`;
  const box = (x,y,w,h,P,f=P.w,d=P.wd)=>{ const s = Math.max(4, Math.round(w*.2)); return R(x,y,w,h,f)+R(x+w-s,y,s,h,d); };
  const plinth = (w,h,P,n=2)=>{ let s=''; for(let i=0;i<n;i++){ const ww=w-i*18; s+=box(-ww/2,-(i+1)*h,ww,h,P,P.t,P.wd)+R(-ww/2,-(i+1)*h,ww,2,'#fff',.25); } return s; };
  const cols = (x0,x1,y,h,n,P,f=P.t)=>{ let s=''; const st=(x1-x0)/(n-1);
    for(let i=0;i<n;i++){ const x=x0+i*st; s+=R(x-4,y-h,8,h,f)+R(x+1,y-h,3,h,P.wd)+R(x-6,y-h-4,12,4,P.w)+R(x-6,y-3,12,3,P.wd); } return s; };
  const ped = (x,w,y,f,f2)=>{ const h=Math.round(w*.2);
    return `<polygon points="${x},${y} ${x+w/2},${y-h} ${x+w},${y}" fill="${f}"/><polygon points="${x+14},${y-3} ${x+w/2},${y-h+8} ${x+w-14},${y-3}" fill="${f2}"/>`; };
  const dome = (cx,y,w,f,fin='#f5c842')=>{ const r=w/2;
    return `<path d="M${cx-r},${y} A${r},${r} 0 0 1 ${cx+r},${y}Z" fill="${f}"/><path d="M${cx+r*.15},${y-r+3} A${r-3},${r-3} 0 0 1 ${cx+r-3},${y}L${cx+r*.4},${y}Z" fill="#000" opacity=".15"/>`
      +`<path d="M${cx-r+5},${y-2} A${r-5},${r-5} 0 0 1 ${cx-r*.2},${y-r+5}" fill="none" stroke="#fff" stroke-width="3" opacity=".35"/>`+R(cx-1,y-r-10,2,10,fin)+R(cx-3,y-r-14,6,4,fin); };
  const cren = (x,y,w,f,step=12)=>{ let s=''; for(let i=0;i+6<=w;i+=step) s+=R(x+i,y-7,6,7,f); return s; };
  const tower = (x,y,w,h,P,f=P.w)=>box(x,y-h,w,h,P,f)+cren(x,y-h,w,f,Math.max(8,Math.round(w/3)))+R(x+w/2-3,y-h+14,6,9,'#2a1a10');
  const door = (cx,y,w,h,f='#2a1a10')=>`<path d="M${cx-w/2},${y} V${y-h+w/2} A${w/2},${w/2} 0 0 1 ${cx+w/2},${y-h+w/2} V${y}Z" fill="${f}"/>`;
  const arches = (x0,x1,y,n,w,h,f='#2a1a10')=>{ let s=''; const st=n>1?(x1-x0)/(n-1):0; for(let i=0;i<n;i++) s+=door(x0+i*st,y,w,h,f); return s; };
  const wins = (x0,x1,y,n,f='#2a1a10',w=6,h=10)=>{ let s=''; const st=n>1?(x1-x0)/(n-1):0; for(let i=0;i<n;i++) s+=R(x0+i*st-w/2,y,w,h,f); return s; };
  const minaret = (cx,y,h,P,cap)=>R(cx-6,y-h,12,h,P.t)+R(cx+2,y-h,4,h,P.wd)+R(cx-9,y-Math.round(h*.65),18,4,P.wd)+R(cx-9,y-h+12,18,4,P.wd)
    +`<polygon points="${cx-7},${y-h} ${cx},${y-h-24} ${cx+7},${y-h}" fill="${cap}"/>`+R(cx-1,y-h-30,2,6,'#f5c842');
  const flag = (x,y,col,h=44)=>R(x,y-h,2,h,'#4a3828')+`<g class="an-fg">${R(x+2,y-h,18,11,col)+R(x+2,y-h+8,18,3,'#000',.2)}</g>`;
  const flame = (cx,y,s=1)=>`<circle class="an-glow" cx="${cx}" cy="${y-14*s}" r="${30*s}" fill="url(#lavaGlow)" opacity=".75"/>`
    +`<g class="an-fl"><polygon points="${cx-9*s},${y} ${cx-3*s},${y-22*s} ${cx},${y-32*s} ${cx+4*s},${y-20*s} ${cx+9*s},${y}" fill="#ff6a10"/><polygon points="${cx-5*s},${y} ${cx},${y-19*s} ${cx+5*s},${y}" fill="#ffe070"/></g>`;
  const tent = (cx,y,w,col)=>`<polygon points="${cx-w/2},${y} ${cx},${y-w*.7} ${cx+w/2},${y}" fill="${col}"/><polygon points="${cx},${y-w*.7} ${cx+w/2},${y} ${cx},${y}" fill="#000" opacity=".2"/>`
    +`<polygon points="${cx-6},${y} ${cx},${y-16} ${cx+6},${y}" fill="#2a1a10"/>`+R(cx-1,y-w*.7-10,2,10,'#4a3828');
  const water = (x,y,w,h)=>R(x-6,y-6,w+12,h+12,'#c8b070')+R(x,y,w,h,'#1a4a7a')+R(x+4,y+4,w-8,h-8,'#2a6aaa')+R(x+10,y+8,w*.35,3,'#6aaae0',.7)+R(x+w*.5,y+h-10,w*.3,3,'#6aaae0',.6);
  const use = (id,x,y,s=1)=>`<use href="#${id}" transform="translate(${x} ${y})${s!==1?` scale(${s})`:''}"/>`;
  const horse = (x,y,col='#8a5a2a',rider)=>R(x-12,y-8,3,8,col)+R(x-6,y-8,3,8,col)+R(x+4,y-8,3,8,col)+R(x+9,y-8,3,8,col)+R(x-13,y-18,26,10,col)
    +R(x+10,y-27,6,12,col)+R(x+12,y-30,10,6,col)+R(x-16,y-18,4,9,'#3a2a1a')+R(x+10,y-29,3,8,'#3a2a1a')
    +(rider?R(x-4,y-30,8,12,rider)+R(x-3,y-36,6,6,'#d8a878')+R(x-4,y-38,8,3,'#3a2a1a'):'');
  const pave = (w,h,f)=>R(-w/2,-h/2,w,h,'#000',.18)+R(-w/2,-h/2-4,w,h,f)+R(-w/2,-h/2-4,w,3,'#fff',.2);
  const smoke = (x,y)=>`<g><circle class="an-smk" cx="${x}" cy="${y-8}" r="7" fill="#9a9a9a" opacity=".55"/><circle class="an-smk" cx="${x+6}" cy="${y-22}" r="9" fill="#aaa" opacity=".45"/><circle class="an-smk" cx="${x+2}" cy="${y-38}" r="11" fill="#bbb" opacity=".35"/></g>`;
  const crescent = (cx,cy,r,f='#f5c842',bg)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/><circle cx="${cx+r*.45}" cy="${cy-r*.2}" r="${r*.8}" fill="${bg}"/>`;

  // ── Yapılar: [civ][pin sırası] = (P, a) => svg ──
  return {
  // ═════ PERS ═════
  1: [
    // Kyros Sarayı: geniş sütunlu salon, ortada burçlu giriş kulesi
    (P,a)=>shadow(200)+pave(230,36,P.wd)+plinth(210,10,P)+box(-95,-90,190,70,P)+cols(-86,86,-20,62,9,P)
      +R(-100,-96,200,8,P.r)+R(-100,-100,200,4,a)+tower(-26,-90,52,46,P)+door(0,-20,22,40)+flag(-98,-100,a)+flag(96,-100,a),
    // Ateş Tapınağı: dört kemerli çahartak + kubbe, önünde ateş sunağı, yanlarda ateş direkleri
    (P,a)=>shadow(150)+pave(170,30,P.wd)+box(-46,-60,92,60,P)+arches(-24,24,0,2,18,36)+R(-50,-66,100,6,a)+dome(0,-66,80,P.wd)
      +R(-70,-48,14,48,P.t)+flame(-63,-48,.6)+R(56,-48,14,48,P.t)+flame(63,-48,.6)+R(-12,-14,24,14,P.t)+flame(0,-14,.8),
    // Kral Yolu: posta istasyonu, iki yanında sancaklı kule, önünden geçen altın yol
    (P,a)=>shadow(210)+R(-130,-4,260,18,'#7a6038')+R(-130,-2,260,12,'#e0c070')+box(-70,-52,140,48,P)+cren(-70,-52,140,P.w)
      +door(0,-4,30,40)+tower(-104,-4,26,86,P)+tower(78,-4,26,86,P)+R(-98,-70,14,20,a)+R(84,-70,14,20,a)+horse(-40,10,'#7a4a2a',a),
    // Pers Hazinesi: kalın duvarlı hazine, çivili kapı, altın yığınları ve sandıklar
    (P,a)=>shadow(160)+pave(180,30,P.wd)+box(-64,-70,128,70,P,P.wd,P.r)+cren(-64,-70,128,P.wd)+R(-18,-44,36,44,'#6a4a18')
      +wins(-12,12,-38,4,'#f5c842',3,3)+wins(-12,12,-14,4,'#f5c842',3,3)+R(-64,-74,128,4,a)
      +`<polygon points="-96,0 -82,-18 -68,0" fill="#f5c842"/><polygon points="-86,0 -80,-10 -74,0" fill="#ffe070"/><polygon points="70,0 84,-20 98,0" fill="#f5c842"/>`
      +R(-110,-14,20,14,'#8a5a2a')+R(-110,-16,20,4,'#f5c842')+R(92,-12,18,12,'#8a5a2a')+R(92,-14,18,4,'#f5c842'),
    // Apadana: yüksek kaide, uzun sütunlar, çift başlı boğa başlıkları
    (P,a)=>shadow(230)+plinth(240,12,P)+wins(-60,60,-20,7,P.wd,10,4)+cols(-104,104,-24,92,9,P)
      +[-104,-78,-52,-26,0,26,52,78,104].map(x=>R(x-10,-124,20,6,P.r)+R(x-12,-128,4,4,P.r)+R(x+8,-128,4,4,P.r)).join('')
      +R(-112,-136,224,10,P.wd)+R(-112,-140,224,4,a)+flag(-110,-140,a)+flag(108,-140,a),
    // Ordu Kışlası: alçak sur, arkada çadırlar, mızrak sırası, sancaklar
    (P,a)=>shadow(200)+tent(-60,-24,52,P.t)+tent(0,-24,60,a)+tent(60,-24,52,P.t)+box(-96,-26,192,26,P)+cren(-96,-26,192,P.w)
      +door(0,0,22,24)+[-84,-76,-68,64,72,80].map(x=>R(x,-62,2,36,'#4a3828')+`<polygon points="${x-2},-62 ${x+1},-70 ${x+4},-62" fill="#c8c8c8"/>`).join('')
      +flag(-100,-26,a)+flag(98,-26,a),
  ],
  // ═════ BÜYÜK İSKENDER ═════
  2: [
    // İskender Sarayı: Makedon sarayı — geniş sütunlu cephe, aksan frizli alınlık
    (P,a)=>shadow(220)+pave(250,36,P.wd)+plinth(232,10,P,3)+box(-104,-96,208,66,P)+cols(-96,96,-30,62,11,P)
      +R(-110,-104,220,8,P.t)+R(-110,-98,220,3,a)+ped(-110,220,-104,P.t,P.wd)+door(0,-30,26,44,'#3a2a1a')
      +`<circle cx="0" cy="-128" r="7" fill="${a}"/><circle cx="0" cy="-128" r="3" fill="#f5c842"/>`+flag(-108,-150,a)+flag(106,-150,a),
    // Yunan Tiyatrosu: yarım daire oturma basamakları, orkestra, önde sahne binası
    (P,a)=>shadow(210,20)+[0,1,2,3,4,5].map(i=>`<path d="M${-104+i*13},-14 A${104-i*13},${78-i*11} 0 0 1 ${104-i*13},-14" fill="none" stroke="${i%2?P.wd:P.w}" stroke-width="13"/>`).join('')
      +`<ellipse cx="0" cy="-16" rx="34" ry="12" fill="${P.t}"/><ellipse cx="0" cy="-16" rx="10" ry="4" fill="${a}"/>`
      +box(-80,-12,160,22,P)+cols(-70,70,10,20,8,P)+R(-84,-14,168,4,a),
    // Büyük Hastane: Asklepion — tapınak cephesi, yılanlı asa amblemi, şifa havuzu
    (P,a)=>shadow(190)+pave(210,34,P.wd)+plinth(170,8,P)+box(-74,-80,148,64,P)+cols(-66,66,-16,58,7,P)+R(-80,-86,160,6,P.t)
      +ped(-80,160,-86,P.t,P.wd)+R(-2,-112,4,22,'#6a4a18')+`<path d="M-6,-94 Q6,-98 -2,-104 Q-8,-108 4,-112" fill="none" stroke="#2a8a4a" stroke-width="3"/>`
      +water(70,-8,46,22)+use('ctOlive',-96,0),
    // Bilim Akademisi: Musaion — kubbeli okuma salonu, armiller küre, parşömen rafları
    (P,a)=>shadow(200)+pave(220,34,P.wd)+box(-90,-60,180,60,P)+arches(-70,70,0,6,14,34)+R(-94,-66,188,6,a)+dome(0,-66,70,P.wd)
      +R(-90,-66,180,2,'#fff',.3)+R(70,-6,4,30,'#6a4a18')
      +`<g transform="translate(-112 -44)"><rect x="-2" y="6" width="4" height="38" fill="#6a4a18"/><circle r="18" fill="none" stroke="#c8a040" stroke-width="3"/><ellipse rx="18" ry="6" fill="none" stroke="#c8a040" stroke-width="2"/><ellipse rx="6" ry="18" fill="none" stroke="#c8a040" stroke-width="2"/><circle r="4" fill="${a}"/></g>`,
    // İskender Anıtı: basamaklı kaide üstünde şaha kalkmış bronz atlı heykel
    (P,a)=>shadow(130)+pave(150,32,P.wd)+plinth(110,10,P,3)+box(-28,-90,56,60,P)+R(-28,-62,56,4,a)
      +`<g transform="translate(0 -90) scale(2.2)">${horse(0,0,'#5a7a6a',a).replace(/#d8a878/g,'#6a8a7a').replace(/#3a2a1a/g,'#3a5a4a')}</g>`
      +use('ctOlive',-70,0)+use('ctOlive',72,0),
    // Fırat Limanı: rıhtım, ambar, vinç, gemi
    (P,a)=>shadow(210,10)+water(-120,6,240,46)+R(-120,-6,240,12,P.wd)+R(-120,-6,240,3,P.t)+box(-104,-62,90,56,P)+R(-108,-70,98,8,P.r)
      +arches(-90,-40,-6,3,14,26)+R(20,-90,6,84,'#6a4a18')+R(20,-90,60,5,'#6a4a18')+R(72,-86,2,40,'#4a3828')+R(66,-48,14,10,'#8a6a2a')
      +use('ctShip',40,36,1.3)+use('ctShip',-60,40,1),
  ],
  // ═════ PART ═════
  3: [
    // Part Kalesi: kerpiç sur, yuvarlak köşe kuleleri, aksan sancak
    (P,a)=>shadow(210)+box(-92,-56,184,56,P)+cren(-92,-56,184,P.w)+door(0,0,30,40)
      +[-108,80].map(x=>box(x,-90,28,90,P)+`<path d="M${x},-90 A14,10 0 0 1 ${x+28},-90Z" fill="${P.r}"/>`+R(x+11,-70,6,10,'#2a1a10')).join('')
      +box(-26,-90,52,34,P)+cren(-26,-90,52,P.w)+flag(-2,-90,a,52),
    // Atlı Ordu Kışlası: uzun ahır, kemerli bölmeler, çit, atlar
    (P,a)=>shadow(210)+box(-96,-40,192,40,P)+R(-100,-48,200,8,P.r)+R(-100,-50,200,3,a)+arches(-80,80,0,6,16,28)
      +R(-110,10,220,3,'#6a4a18')+R(-110,20,220,3,'#6a4a18')+[-110,-60,-10,40,90,108].map(x=>R(x,6,4,20,'#5a3a18')).join('')
      +horse(-50,30,'#7a4a2a',a)+horse(30,32,'#3a2a1a')+horse(80,30,'#9a6a3a'),
    // Ktesifon Sarayı (Part): eyvan cephesi, yan kuleler, kemer dizileri
    (P,a)=>shadow(210)+pave(230,34,P.wd)+box(-96,-86,192,86,P)+arches(-80,-40,-46,3,10,18)+arches(40,80,-46,3,10,18)
      +arches(-80,-40,-10,3,10,18)+arches(40,80,-10,3,10,18)+door(0,0,56,74,'#3a2a1a')+R(-30,-80,60,4,a)
      +tower(-112,0,22,100,P)+tower(90,0,22,100,P)+flag(-104,-100,a)+flag(98,-100,a),
    // Ateş Tapınağı (Part): taş kule, kör pencereler, tepede ateş, merdiven
    (P,a)=>shadow(110)+pave(130,30,P.wd)+box(-30,-104,60,104,P)+wins(-16,16,-90,3,P.r,8,14)+wins(-16,16,-56,3,P.r,8,14)
      +R(-34,-108,68,6,a)+flame(0,-108,1)+[0,1,2,3].map(i=>R(-12+i*4,-i*6-6,24-i*8,6,P.t)).join('')+door(0,-24,14,20),
    // Çarşı Meydanı: tenteli tezgahlar, ortada kuyu, küçük kubbeli dükkanlar
    (P,a)=>shadow(210)+pave(230,40,P.t)+box(-104,-46,60,40,P)+dome(-74,-46,40,P.wd)+box(44,-46,60,40,P)+dome(74,-46,40,P.wd)
      +use('ctStall',-40,6,1.2)+use('ctStall',0,8,1.2)+use('ctStall',40,6,1.2)+R(-10,-30,20,12,P.wd)+R(-8,-30,16,4,'#2a6aaa')+R(-12,-46,2,16,'#4a3828')+R(10,-46,2,16,'#4a3828')+R(-12,-48,24,3,'#4a3828'),
    // Dicle Köprüsü: taş kemerli köprü, altından akan su
    (P,a)=>shadow(240,10)+water(-130,-30,260,50)+box(-130,-56,260,22,P)+arches(-84,84,-14,5,26,36,'#2a6aaa')
      +R(-130,-62,260,6,P.t)+cren(-130,-62,260,P.t,16)+tower(-140,-30,24,60,P)+tower(116,-30,24,60,P)+flag(-130,-90,a),
  ],
  // ═════ SASANİ ═════
  4: [
    // Taq-ı Kisra: dev parabolik kemer, kör kemer sıraları
    (P,a)=>shadow(230)+pave(250,36,P.wd)+box(-112,-130,224,130,P)+[-104,-60].map(y=>arches(-96,-56,y,4,10,22)+arches(56,96,y,4,10,22)).join('')
      +arches(-96,-56,-20,4,10,22)+arches(56,96,-20,4,10,22)
      +`<path d="M-42,0 V-60 Q-42,-124 0,-124 Q42,-124 42,-60 V0Z" fill="#3a2a1a"/><path d="M-34,0 V-58 Q-34,-112 0,-112 Q34,-112 34,-58 V0Z" fill="#2a1a10"/>`
      +R(-112,-136,224,6,a)+flag(-110,-136,a)+flag(108,-136,a),
    // Cündişapur Akademisi: avlulu okul, eyvan, kitap sancağı, bahçe ağaçları
    (P,a)=>shadow(200)+pave(220,36,P.wd)+box(-96,-50,192,50,P)+arches(-80,80,0,7,12,26)+box(-34,-86,68,86,P)+door(0,0,36,64,'#3a2a1a')
      +R(-34,-90,68,4,a)+R(-14,-80,28,18,'#f0ead8')+R(-1,-80,2,18,'#8a6a2a')+use('sPalm',-110,8)+use('sPalm',112,8)+use('sTree',-70,14)+use('sTree',76,14),
    // Sulama Kanalları: dolap (su çarkı), kemerli su yolu, havuz
    (P,a)=>shadow(220,10)+water(-120,-10,240,30)+box(-120,-60,150,14,P)+arches(-104,14,-46,5,18,26,'#2a6aaa')+R(-120,-64,150,4,'#2a6aaa')
      +`<g transform="translate(70 -30)"><circle r="40" fill="none" stroke="#6a4a18" stroke-width="6"/>${[0,30,60,90,120,150].map(d=>`<rect x="-2" y="-40" width="4" height="80" fill="#8a6a2a" transform="rotate(${d})"/>`).join('')}<circle r="8" fill="#4a3828"/><circle cy="-40" r="5" fill="#6aaae0"/><circle cx="40" r="5" fill="#6aaae0"/></g>`
      +R(26,-76,8,46,'#5a3a18'),
    // Demir Zırh Atölyesi: ocaklı demirhane, baca dumanı, örs, zırh askısı
    (P,a)=>shadow(180)+pave(200,32,P.wd)+box(-80,-56,140,56,P)+R(-84,-62,148,6,P.r)+door(-40,0,30,38,'#1a0a00')
      +`<path d="M-55,0 V-23 A15,15 0 0 1 -25,-23 V0Z" fill="#ff7a20" opacity=".6"/>`+R(30,-96,18,40,P.wd)+smoke(39,-96)
      +R(10,-12,26,8,'#4a4a4a')+R(16,-4,12,6,'#3a3a3a')+R(80,-46,3,46,'#4a3828')+R(70,-44,24,22,'#8a8a8a')+R(74,-40,16,4,a)+R(78,-52,8,8,'#9a9a9a'),
    // Meclis Salonu: sütunlu salon, ortada kubbe, yanlarda sancaklar
    (P,a)=>shadow(220)+plinth(220,10,P)+box(-100,-80,200,60,P)+cols(-92,92,-20,56,10,P)+R(-104,-86,208,6,P.r)+R(-104,-90,208,4,a)
      +box(-34,-110,68,24,P)+dome(0,-110,64,P.wd)+flag(-102,-90,a)+flag(100,-90,a),
    // Kutsal Ateş Kulesi: yüksek kule, tepede büyük ateş, merdivenli kaide
    (P,a)=>shadow(120)+pave(140,30,P.wd)+plinth(100,10,P,3)+box(-24,-150,48,120,P)+wins(-8,8,-130,2,'#2a1a10',6,12)+wins(-8,8,-90,2,'#2a1a10',6,12)
      +R(-32,-156,64,8,P.t)+R(-32,-150,64,3,a)+flame(0,-156,1.4)+door(0,-30,16,24),
  ],
  // ═════ İSLAM'IN YÜKSELİŞİ ═════
  5: [
    // İlk Cami: alçak avlu duvarı, hurma gövdesi sütunlar, düz çatı, yeşil sancak
    (P,a)=>shadow(220)+pave(240,36,P.t)+box(-100,-46,200,46,P)+R(-104,-50,208,6,P.r)+cols(-84,84,0,40,8,P,'#8a6a3a')
      +use('sPalm',-60,-46)+use('sPalm',40,-46)+door(0,0,26,36)+R(-30,-62,60,12,P.w)+R(-30,-62,60,3,a)+flag(96,-50,a),
    // Kuran Okulu: kubbeli küçük medrese, açık kitap rahlesi
    (P,a)=>shadow(160)+pave(180,32,P.t)+box(-64,-54,128,54,P)+arches(-44,44,0,4,14,30)+dome(0,-54,74,P.r)
      +R(-100,-20,30,4,'#6a4a18')+R(-96,-16,4,16,'#6a4a18')+R(-80,-16,4,16,'#6a4a18')+`<polygon points="-102,-20 -85,-28 -68,-20" fill="#f5f0e0"/><rect x="-86" y="-28" width="2" height="8" fill="${a}"/>`,
    // Hilal Kulesi: ince yüksek kule, tepesinde altın hilal
    (P,a)=>shadow(100)+pave(120,30,P.t)+plinth(90,10,P,2)+box(-18,-170,36,150,P)+R(-26,-120,52,6,P.wd)+R(-26,-160,52,6,P.wd)
      +wins(0,0,-150,1,'#2a1a10',8,14)+wins(0,0,-100,1,'#2a1a10',8,14)+`<polygon points="-20,-170 0,-196 20,-170" fill="${P.r}"/>`
      +`<path d="M6,-222 A13,13 0 1 0 6,-198 A10,10 0 1 1 6,-222Z" fill="#f5c842"/>`,
    // İslam Hastanesi: avlulu bina, şifalı havuz, şifa otları bahçesi, kubbe
    (P,a)=>shadow(210)+pave(230,40,P.t)+box(-100,-60,200,60,P)+arches(-84,84,0,8,12,28)+dome(-50,-60,50,P.r)+dome(50,-60,50,P.r)
      +R(-100,-64,200,4,a)+water(-30,6,60,18)+[-90,-70,70,90].map(x=>R(x-6,4,12,10,'#3a7020')+R(x-2,2,4,4,'#d8304a')).join(''),
    // Büyük Çarşı: uzun kubbeli çarşı, kemerli dükkanlar, önde tezgahlar
    (P,a)=>shadow(230)+box(-110,-50,220,50,P)+[-88,-44,0,44,88].map(x=>dome(x,-50,36,P.wd,'#c8a040')).join('')+arches(-96,96,0,9,12,26)
      +door(0,0,26,40)+R(-110,-54,220,4,a)+use('ctStall',-70,30)+use('ctStall',70,30)+use('ctCamel',-110,34),
    // Bahçe Şehri: köşk, havuzlu fıskiye, su kanalları, servi ve hurmalar
    (P,a)=>shadow(220,20)+R(-116,-30,232,60,'#5a8a30')+R(-116,-2,232,8,'#2a6aaa')+R(-4,-30,8,60,'#2a6aaa')
      +water(-20,-14,40,26)+`<circle cx="0" cy="-12" r="3" fill="#bfe0ff"/><rect x="-1" y="-24" width="2" height="12" fill="#bfe0ff"/>`
      +box(-34,-80,68,46,P)+arches(-20,20,-34,3,10,22)+dome(0,-80,48,P.r)+R(-38,-84,76,4,a)
      +use('sPine',-96,-24)+use('sPine',96,-24)+use('sPalm',-70,30)+use('sPalm',72,30),
  ],
  // ═════ ABBASİ ═════
  6: [
    // Bağdat Yuvarlak Şehri: merkezdeki Yeşil Kubbe sarayı + Ulu Cami
    (P,a)=>shadow(220)+pave(240,36,P.wd)+box(-100,-60,140,60,P)+arches(-84,24,0,5,14,30)+box(-60,-100,60,40,P)
      +dome(-30,-100,70,'#2a8a4a')+horse(-30,-142,'#f5c842').replace(/#3a2a1a/g,'#c8a040')
      +box(50,-50,60,50,P)+dome(80,-50,40,a)+minaret(104,0,110,P,a)+R(-100,-64,210,4,a),
    // Beytülhikme: kitap rafı cepheli büyük kütüphane, mavi kubbe, okuyan âlimler için rahle
    (P,a)=>shadow(220)+pave(240,36,P.wd)+box(-100,-70,200,70,P)+[-80,-56,-32,32,56,80].map(x=>R(x-8,-56,16,40,'#3a2a1a')
      +[0,1,2,3].map(i=>R(x-6,-54+i*10,12,7,['#c83a2a','#2a6aaa','#f5c842','#2a8a4a'][(i+x/8)&3])).join('')).join('')
      +door(0,0,30,52)+R(-104,-76,208,6,a)+dome(0,-76,80,a)+R(-104,-80,208,4,P.t),
    // Rasathane: yuvarlak gözlem kulesi, yarık kubbe, dev kadran yayı
    (P,a)=>shadow(190)+pave(210,34,P.wd)+box(-40,-100,80,100,P)+wins(-20,20,-80,3,'#2a1a10',6,12)+dome(0,-100,80,'#d8d0c0')
      +R(-3,-140,6,40,'#2a1a10')+`<path d="M60,0 V-90 A90,90 0 0 1 150,0Z" fill="${P.t}" transform="translate(-50 0)"/><path d="M14,-4 V-84 A80,80 0 0 1 94,-4" fill="none" stroke="${a}" stroke-width="3"/>`
      +[0,1,2,3,4,5].map(i=>{ const t=i*Math.PI/12; return R(10+84*Math.sin(t),-4-84*Math.cos(t),4,4,'#3a2a1a'); }).join('')+door(0,0,18,30),
    // Büyük Bimarhane: iki kubbeli hastane, avluda fıskiye
    (P,a)=>shadow(210)+pave(230,40,P.wd)+box(-104,-64,90,64,P)+dome(-59,-64,60,a)+box(14,-64,90,64,P)+dome(59,-64,60,a)
      +arches(-90,-30,0,3,12,30)+arches(30,90,0,3,12,30)+R(-14,-40,28,40,P.t)+door(0,0,20,34)+water(-24,10,48,16)+R(-1,0,2,14,'#bfe0ff'),
    // Dicle Saray Köprüsü: kayıklardan kurulu köprü (Bağdat'ın yüzen köprüleri)
    (P,a)=>shadow(250,10)+water(-130,-26,260,52)+[-104,-62,-20,22,64,106].map(x=>`<polygon points="${x-18},-6 ${x+18},-6 ${x+12},6 ${x-12},6" fill="#6a4a18"/>`).join('')
      +R(-130,-14,260,10,'#a88858')+R(-130,-14,260,3,'#c8a878')+[-130,-80,-30,20,70,120].map(x=>R(x,-30,3,16,'#4a3828')).join('')+R(-130,-30,260,3,'#4a3828')
      +box(-150,-60,30,50,P)+dome(-135,-60,30,a)+box(120,-60,30,50,P)+dome(135,-60,30,a),
    // Mustansıriyye Medresesi: yüksek taçkapı, iki katlı revaklar, su saati
    (P,a)=>shadow(230)+pave(250,36,P.wd)+box(-110,-70,220,70,P)+arches(-96,-40,-38,4,10,22)+arches(40,96,-38,4,10,22)
      +arches(-96,-40,0,4,10,24)+arches(40,96,0,4,10,24)+box(-30,-112,60,112,P,P.t)+door(0,0,36,80,'#3a2a1a')
      +[0,1,2].map(i=>R(-14+i*4,-82-i*6,28-i*8,6,a)).join('')+R(-30,-116,60,4,a)+`<circle cx="0" cy="-98" r="8" fill="#f0e0b8" stroke="#6a4a18" stroke-width="2"/>`,
  ],
  // ═════ MOĞOL ═════
  7: [
    // Moğol Kalesi: ahşap kazık çit, gözetleme kulesi, at kuyruklu tuğ sancakları
    (P,a)=>shadow(220)+[...Array(23)].map((_,i)=>{ const x=-110+i*10; return R(x,-50-(i%3)*4,8,50+(i%3)*4,i%2?'#6a4a18':'#8a6a2a')+`<polygon points="${x},${-50-(i%3)*4} ${x+4},${-58-(i%3)*4} ${x+8},${-50-(i%3)*4}" fill="#8a6a2a"/>`; }).join('')
      +R(-16,-40,32,40,'#2a1a10')+R(60,-120,40,10,'#6a4a18')+R(62,-110,4,60,'#5a3a18')+R(94,-110,4,60,'#5a3a18')+`<polygon points="56,-120 80,-140 104,-120" fill="#5a4a3a"/>`
      +[-90,-50].map(x=>R(x,-110,2,60,'#4a3828')+`<path d="M${x+1},-104 q-6,12 -2,26 M${x+1},-104 q6,12 2,26" stroke="#2a1a10" stroke-width="4" fill="none"/>`+`<circle cx="${x+1}" cy="-112" r="4" fill="${a}"/>`).join(''),
    // Ordu Karargahı: altın tepeli büyük han çadırı, çevresinde yurtlar ve tuğlar
    (P,a)=>shadow(220,20)+use('ctYurt',-90,-10)+use('ctYurt',90,-10)+use('ctYurt',0,4,2.6)
      +R(-4,-104,8,10,'#f5c842')+use('ctYurt',-60,26,1)+use('ctYurt',64,26,1)+[-120,116].map(x=>R(x,-70,2,70,'#4a3828')+`<path d="M${x+1},-64 q-6,12 -2,26 M${x+1},-64 q6,12 2,26" stroke="#e8e0cc" stroke-width="4" fill="none"/>`+`<circle cx="${x+1}" cy="-72" r="4" fill="#f5c842"/>`).join('')+horse(-20,40,'#6a4a2a',a)+horse(30,42,'#e8e0cc'),
    // Yeniden İnşaat: yarım kalmış duvar, ahşap iskele, vinç, tuğla yığını
    (P,a)=>shadow(200)+pave(220,34,P.wd)+box(-90,-60,150,60,P)+R(-90,-80,60,20,P.w)+R(-20,-70,40,10,P.w)+door(-20,0,24,36)
      +[-96,-60,-24,12,48].map(x=>R(x,-110,4,110,'#8a6a2a')).join('')+[-90,-50].map(y=>R(-98,y,154,4,'#8a6a2a')).join('')
      +R(80,-140,6,140,'#6a4a18')+R(40,-140,70,5,'#6a4a18')+R(46,-136,2,50,'#4a3828')+R(42,-86,10,8,'#a8885a')
      +[0,1,2].map(i=>R(84+i*8,-8-i*0,8,8,'#a8604a')+R(88+i*6,-16,8,8,'#b8705a')).join('')+flag(-110,0,a),
    // İlhanlı Camii: sekizgen gövde, turkuaz dev kubbe, çifte minareli taçkapı (Sultaniye tarzı)
    (P,a)=>shadow(220)+pave(240,36,P.wd)+box(-70,-90,140,90,P)+arches(-50,50,-50,3,14,30)+R(-74,-96,148,6,'#3a9ab0')
      +dome(0,-96,124,'#3aaac0')+R(-74,-100,148,4,a)+box(-104,-60,34,60,P)+box(70,-60,34,60,P)+door(0,0,34,56,'#2a1a10')
      +minaret(-86,-60,90,P,'#3aaac0')+minaret(86,-60,90,P,'#3aaac0'),
    // Sulama Tamiri: bent kapağı ve onarılan su değirmeni, kanal
    (P,a)=>shadow(220,10)+water(-130,-6,260,30)+box(-30,-70,60,64,P)+R(-24,-50,48,44,'#6a4a18')+R(-24,-50,48,4,'#8a6a2a')+R(-24,-34,48,4,'#8a6a2a')
      +R(-36,-76,72,6,P.r)+`<g transform="translate(-86 -30)"><circle r="34" fill="none" stroke="#6a4a18" stroke-width="5"/>${[0,45,90,135].map(d=>`<rect x="-2" y="-34" width="4" height="68" fill="#8a6a2a" transform="rotate(${d})"/>`).join('')}<circle r="6" fill="#4a3828"/></g>`
      +box(60,-40,50,40,P)+R(56,-44,58,4,P.r)+R(84,-24,8,24,'#2a1a10')+flag(110,-44,a),
    // Kervan Sarayı: kare kale gibi han, büyük taçkapı, önünde develer
    (P,a)=>shadow(230)+box(-110,-60,220,60,P)+cren(-110,-60,220,P.w)+box(-34,-96,68,96,P)+door(0,0,40,70,'#2a1a10')
      +R(-34,-100,68,4,a)+tower(-124,0,22,76,P)+tower(102,0,22,76,P)+use('ctCamel',-70,30,1.3)+use('ctCamel',-40,34,1.3)+use('ctCamel',60,32,1.3),
  ],
  // ═════ OSMANLI ═════
  8: [
    // Osmanlı Camii: merkezi kubbe + yarım kubbeler, dört kalem minare
    (P,a)=>shadow(230)+pave(260,40,P.wd)+box(-90,-60,180,60,P)+arches(-70,70,0,6,14,32)+dome(-60,-60,40,P.r,'#c8a040')+dome(60,-60,40,P.r,'#c8a040')
      +box(-54,-84,108,24,P)+dome(-40,-84,34,P.r,'#c8a040')+dome(40,-84,34,P.r,'#c8a040')+dome(0,-84,96,P.r,'#f5c842')
      +minaret(-116,0,170,P,P.r)+minaret(116,0,170,P,P.r)+minaret(-100,-60,110,P,P.r)+minaret(100,-60,110,P,P.r)+R(-90,-64,180,4,a),
    // Osmanlı Sarayı: konik kuleli Bab-üs Selam kapısı, geniş saçaklı köşk
    (P,a)=>shadow(230)+pave(250,36,P.wd)+box(-60,-60,120,60,P)+door(0,0,34,50)+R(-64,-64,128,4,a)
      +[-80,52].map(x=>box(x,-110,28,110,P)+`<polygon points="${x-4},-110 ${x+14},-150 ${x+32},-110" fill="${P.r}"/>`+R(x+13,-160,2,10,'#f5c842')+wins(x+14,x+14,-90,1,'#2a1a10',6,12)).join('')
      +box(64,-50,56,50,P)+`<polygon points="56,-50 92,-70 128,-50" fill="${P.r}"/>`+R(56,-52,72,4,P.wd)+cols(70,114,0,46,4,P)+flag(-2,-64,a),
    // Dicle Limanı: rıhtım, gümrük binası, kalyon ve kayıklar
    (P,a)=>shadow(220,10)+water(-130,6,260,46)+R(-130,-6,260,12,P.wd)+R(-130,-6,260,3,P.t)+box(-110,-60,100,54,P)+R(-114,-66,108,6,P.r)
      +arches(-96,-30,-6,3,14,26)+dome(-60,-66,30,P.r)+R(30,-80,6,74,'#6a4a18')+R(30,-80,50,4,'#6a4a18')+R(74,-76,2,30,'#4a3828')+R(68,-46,14,10,'#8a6a2a')
      +use('ctShip',50,38,1.5)+use('ctShip',-70,42,.9)+flag(-12,-66,a),
    // Kapalı Çarşı: uzun kemerli yapı, sıra sıra kurşun kubbeler, taçkapı
    (P,a)=>shadow(240)+box(-116,-50,232,50,P)+[-96,-72,-48,48,72,96].map(x=>dome(x,-50,22,P.r,'#c8a040')).join('')
      +arches(-104,104,0,12,10,22)+box(-30,-80,60,80,P,P.t)+door(0,0,32,58)+R(-30,-84,60,4,a)+dome(0,-84,40,P.r),
    // Osmanlı Köprüsü: çok kemerli taş köprü, ortada kambur ve köşk
    (P,a)=>shadow(260,10)+water(-140,-30,280,50)+`<path d="M-140,-40 L-60,-46 L0,-58 L60,-46 L140,-40 V-24 H-140Z" fill="${P.w}"/>`
      +`<path d="M-140,-44 L-60,-50 L0,-62 L60,-50 L140,-44 V-40 L60,-46 L0,-58 L-60,-46 L-140,-40Z" fill="${P.t}"/>`
      +door(-90,-8,30,26,'#2a6aaa')+door(-44,-8,30,32,'#2a6aaa')+door(0,-8,36,40,'#2a6aaa')+door(44,-8,30,32,'#2a6aaa')+door(90,-8,30,26,'#2a6aaa')
      +box(-14,-88,28,26,P)+`<polygon points="-20,-88 0,-102 20,-88" fill="${P.r}"/>`+flag(-2,-102,a),
    // Son Kale: yıldız tabya, toplar, büyük Osmanlı sancağı
    (P,a)=>shadow(240)+`<polygon points="-120,0 -100,-60 -50,-70 0,-90 50,-70 100,-60 120,0" fill="${P.wd}"/><polygon points="-110,0 -92,-54 -46,-62 0,-80 46,-62 92,-54 110,0" fill="${P.w}"/>`
      +cren(-46,-62,92,P.w)+box(-30,-110,60,40,P)+cren(-30,-110,60,P.w)+door(0,0,24,36)
      +[-80,-40,40,80].map(x=>R(x-8,-50,16,6,'#2a2a2a')+`<circle cx="${x-8}" cy="-47" r="4" fill="#1a1a1a"/>`).join('')
      +R(-1,-170,3,60,'#4a3828')+R(2,-170,36,24,a)+crescent(16,-158,6,'#f8f2e6',a)+`<polygon points="26,-162 28,-158 32,-158 29,-156 30,-152 26,-154 22,-152 23,-156 20,-158 24,-158" fill="#f8f2e6" transform="translate(2 0) scale(.9)"/>`,
  ],
  };
})();
