// ══════════════════════════════════════════════
// ANLATICI SAHNESİ — her medeniyete girişte dönemin kıyafetli anlatıcısı konuşur
// showCivilizationIntro(civId) · karakterler inline SVG (200×300, bel üstü) · her medeniyet için 1 kez (kullanıcı kaydında)
// ══════════════════════════════════════════════
const NR_OL = '#2a1608';   // kontur
// Kalın konturlu kol: önce koyu geniş çizgi, üstüne kıyafet rengi
const _nrArm = (d, col, w=24) => `<path d="${d}" fill="none" stroke="${NR_OL}" stroke-width="${w+4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const NR_ARM = {   // kol yolu + el konumu (izleyicinin solu = R, sağı = L)
  Rin:  {d:'M64 178Q42 214 60 240L84 238', x:88,  y:238},
  Lin:  {d:'M136 178Q158 214 140 240L116 238', x:112, y:238},
  Rout: {d:'M62 178Q40 212 44 246', x:44,  y:252},
  Lout: {d:'M138 178Q160 212 156 246', x:156, y:252},
  Lup:  {d:'M138 178Q166 200 158 214', x:158, y:212},
};
const _nrHand = (a, skin) => `<circle cx="${a.x}" cy="${a.y}" r="9" fill="${skin}" stroke="${NR_OL}" stroke-width="2.4"/>`;
const NR_BEARD = {
  long:  (c)=>`<path d="M74 92Q72 146 100 160Q128 146 126 92Q116 106 100 106Q84 106 74 92Z" fill="${c}" stroke="${NR_OL}" stroke-width="2.4"/>
    <g fill="none" stroke="${NR_OL}" stroke-width="1.6" opacity=".55"><path d="M82 120q4 4 8 0t8 0 8 0 8 0M80 132q4 4 8 0t8 0 8 0 8 0 4 0M84 144q4 4 8 0t8 0 8 0 8 0"/></g>`,
  pointed:(c)=>`<path d="M75 92Q78 132 100 162Q122 132 125 92Q115 106 100 106Q85 106 75 92Z" fill="${c}" stroke="${NR_OL}" stroke-width="2.4"/>
    <path d="M90 120q10 20 10 38M110 120q-10 20-10 38" fill="none" stroke="${NR_OL}" stroke-width="1.5" opacity=".45"/>`,
  short: (c)=>`<path d="M75 94Q78 122 100 128Q122 122 125 94Q115 107 100 107Q85 107 75 94Z" fill="${c}" stroke="${NR_OL}" stroke-width="2.4"/>`,
  full:  (c)=>`<path d="M73 88Q70 138 100 146Q130 138 127 88Q116 106 100 106Q84 106 73 88Z" fill="${c}" stroke="${NR_OL}" stroke-width="2.4"/>
    <path d="M86 118q-2 10 2 18M100 120v18M114 118q2 10-2 18" fill="none" stroke="${NR_OL}" stroke-width="1.4" opacity=".45"/>`,
  mongol:(c)=>`<path d="M88 101Q80 106 80 126L85 127Q86 110 96 104Z" fill="${c}" stroke="${NR_OL}" stroke-width="1.8"/><path d="M112 101Q120 106 120 126L115 127Q114 110 104 104Z" fill="${c}" stroke="${NR_OL}" stroke-width="1.8"/>
    <path d="M96 114L100 130L104 114Z" fill="${c}" stroke="${NR_OL}" stroke-width="1.8"/>`,
  none:  ()=>'',
};
// Ortak figür: arka katman → gövde → kollar → boyun/baş → yüz → başlık → ön katman
function nrFigure(o){
  const R=NR_ARM['R'+(o.armR||'in')], L=NR_ARM['L'+(o.armL||'in')];
  const sleeve=o.sleeve||o.robe;
  const brows = o.stern
    ? `<path d="M80 74L96 80M120 74L104 80" stroke="${o.hair}" stroke-width="4.2" stroke-linecap="round"/>`
    : `<path d="M81 76Q88 71 96 75M104 75Q112 71 119 76" fill="none" stroke="${o.hair}" stroke-width="3.6" stroke-linecap="round"/>`;
  const stache = o.beard && o.beard!=='none' && o.beard!=='mongol'
    ? `<path d="M86 101Q100 94 114 101Q107 104 100 102Q93 104 86 101Z" fill="${o.hair}" stroke="${NR_OL}" stroke-width="1.6"/>` : '';
  return `<g class="nr-body">
  ${o.back||''}
  <path d="M34 300C34 212 50 170 100 158C150 170 166 212 166 300Z" fill="${o.robe}" stroke="${NR_OL}" stroke-width="2.6"/>
  ${o.torso||''}
  <rect x="89" y="112" width="22" height="50" rx="8" fill="${o.skin}" stroke="${NR_OL}" stroke-width="2.4"/>
  ${o.collar||''}
  <g transform="translate(0 16)">
  ${o.under||''}
  <ellipse cx="74" cy="88" rx="5" ry="8" fill="${o.skin}" stroke="${NR_OL}" stroke-width="2.2"/><ellipse cx="126" cy="88" rx="5" ry="8" fill="${o.skin}" stroke="${NR_OL}" stroke-width="2.2"/>
  <ellipse cx="100" cy="86" rx="26" ry="31" fill="${o.skin}" stroke="${NR_OL}" stroke-width="2.6"/>
  <ellipse cx="86" cy="97" rx="5" ry="3" fill="#e0806a" opacity=".35"/><ellipse cx="114" cy="97" rx="5" ry="3" fill="#e0806a" opacity=".35"/>
  ${brows}
  <g class="nr-eyes"><ellipse cx="89" cy="85" rx="5" ry="3.6" fill="#fff" stroke="${NR_OL}" stroke-width="1.4"/><ellipse cx="111" cy="85" rx="5" ry="3.6" fill="#fff" stroke="${NR_OL}" stroke-width="1.4"/>
    <circle cx="90" cy="85.4" r="2.5" fill="#2a1608"/><circle cx="112" cy="85.4" r="2.5" fill="#2a1608"/><circle cx="90.8" cy="84.4" r=".8" fill="#fff"/><circle cx="112.8" cy="84.4" r=".8" fill="#fff"/></g>
  <path d="M100 87Q96 96 98 99L104 99" fill="none" stroke="${NR_OL}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  ${NR_BEARD[o.beard||'none'](o.hair)}
  <ellipse class="nr-mouth" cx="100" cy="106" rx="5.5" ry="2.4" fill="#6a1a14" stroke="${NR_OL}" stroke-width="1.4"/>
  ${stache}
  ${o.head ? `<g transform="translate(0 ${o.headY||0})">${o.head}</g>` : ''}
  </g>
  ${_nrArm(R.d, sleeve)}${_nrArm(L.d, sleeve)}${o.cuffs||''}
  ${o.itemBehindHands||''}${_nrHand(R, o.skin)}${_nrHand(L, o.skin)}
  ${o.front||''}
  </g>`;
}

const NARRATORS = [
  { // 0 BABİL
    role:'Babilli Kâtip', en_role:'Babylonian Scribe', year:-600, bg:['tower','gate','ziggurat'], parts:'star',
    lines:["Ben Nebukadnezar'ın şehrinden geliyorum. Babil, dünyanın en büyük şehriydi. Fırat nehri şehrimizi ikiye bölerdi.",
      "Asma Bahçelerimiz dünyanın yedi harikasından biriydi. Sular yukarı çıkıyor, çiçekler açıyordu.",
      "Ama her şey değişmek zorundaydı... Uzaktan bir ordu yaklaşıyordu."],
    en:["I come from the city of Nebuchadnezzar. Babylon was the greatest city in the world. The Euphrates split our city in two.",
      "Our Hanging Gardens were one of the seven wonders of the world. Water flowed upward, and flowers bloomed.",
      "But everything had to change... An army was approaching from afar."],
    fig:()=>nrFigure({skin:'#d9a070', hair:'#1e1410', beard:'long', robe:'#24387e', armR:'in', armL:'in',
      back:`<path d="M70 70Q60 130 64 188L136 188Q140 130 130 70Z" fill="#1e1410" stroke="${NR_OL}" stroke-width="2.4"/>
        <g fill="#1e1410" stroke="${NR_OL}" stroke-width="1.6"><circle cx="66" cy="150" r="7"/><circle cx="66" cy="168" r="7"/><circle cx="134" cy="150" r="7"/><circle cx="134" cy="168" r="7"/></g>`,
      torso:`<path d="M52 196L150 262L150 274L50 208Z" fill="#f5c842" stroke="${NR_OL}" stroke-width="2"/><g fill="#f5c842"><circle cx="60" cy="210" r="2"/><circle cx="72" cy="218" r="2"/><circle cx="84" cy="226" r="2"/><circle cx="96" cy="234" r="2"/><circle cx="108" cy="242" r="2"/><circle cx="120" cy="250" r="2"/><circle cx="132" cy="258" r="2"/></g>
        <rect x="38" y="276" width="124" height="10" fill="#f5c842" stroke="${NR_OL}" stroke-width="2"/>`,
      collar:`<path d="M78 164Q100 180 122 164" fill="none" stroke="#f5c842" stroke-width="5"/><circle cx="100" cy="176" r="5" fill="#3a6ae0" stroke="#f5c842" stroke-width="2"/>`,
      head:`<path d="M74 66L78 30H122L126 66Z" fill="#24387e" stroke="${NR_OL}" stroke-width="2.6"/><rect x="75" y="56" width="50" height="7" fill="#f5c842" stroke="${NR_OL}" stroke-width="1.8"/>
        <rect x="78" y="34" width="44" height="4" fill="#f5c842"/><g fill="#f5c842"><circle cx="88" cy="46" r="3"/><circle cx="100" cy="46" r="3"/><circle cx="112" cy="46" r="3"/></g>`,
      cuffs:`<g fill="#f5c842"><circle cx="74" cy="240" r="4"/><circle cx="126" cy="240" r="4"/></g>`,
      itemBehindHands:`<rect x="78" y="214" width="44" height="34" rx="4" fill="#c9a060" stroke="${NR_OL}" stroke-width="2.4"/>
        <g stroke="#6a4a24" stroke-width="2" stroke-linecap="round"><path d="M84 222h5M92 222l3 2M99 222h6M84 229l3 2M91 229h8M102 229l3 2M86 236h6M96 236l3 2M103 236h7"/></g>`,
    })},
  { // 1 PERS
    role:'Pers Askeri', en_role:'Persian Soldier', year:-539, bg:['ppalace','apadana','firealtar'], parts:'ember',
    lines:["Ben Kyros'un ordusundanım. M.Ö. 539'da Babil kapılarını açtık. Kan dökülmeden şehre girdik.",
      "Persler Babil'i yıkmadı, aksine korudu. Biz medeniyet taşıdık, Kral Yolu'nu inşa ettik.",
      "İmparatorluğumuz Hindistan'dan Mısır'a uzanıyordu. Tarihte görülmemiş bir büyüklük."],
    en:["I serve in the army of Cyrus. In 539 BC we opened the gates of Babylon. We entered the city without bloodshed.",
      "The Persians did not destroy Babylon; they protected it. We carried civilisation and built the Royal Road.",
      "Our empire stretched from India to Egypt. A greatness never seen before in history."],
    fig:()=>nrFigure({skin:'#c98e5e', hair:'#1a1210', headY:-6, beard:'pointed', robe:'#c4702a', sleeve:'#b0602a', armR:'out', armL:'in',
      torso:`<path d="M96 160L96 300M104 160V300" stroke="#f5c842" stroke-width="4"/><path d="M40 238H160" stroke="#3a1a0a" stroke-width="9"/><rect x="92" y="232" width="16" height="12" rx="2" fill="#f5c842" stroke="${NR_OL}" stroke-width="2"/>
        <g fill="#f5c842" opacity=".7"><circle cx="66" cy="262" r="3"/><circle cx="80" cy="276" r="3"/><circle cx="120" cy="276" r="3"/><circle cx="134" cy="262" r="3"/></g>`,
      collar:`<path d="M80 160L100 186L120 160" fill="none" stroke="#f5c842" stroke-width="5"/>`,
      head:`<path d="M71 82Q70 50 90 34Q106 22 122 28Q114 36 124 48Q132 62 129 82Q116 70 100 70Q84 70 71 82Z" fill="#e0a040" stroke="${NR_OL}" stroke-width="2.6"/>
        <path d="M71 80Q66 104 76 116L82 112Q76 98 78 82Z" fill="#e0a040" stroke="${NR_OL}" stroke-width="2.2"/><path d="M129 80Q134 104 124 116L118 112Q124 98 122 82Z" fill="#e0a040" stroke="${NR_OL}" stroke-width="2.2"/>
        <path d="M72 76Q100 64 128 76" fill="none" stroke="#8a3a10" stroke-width="5"/>`,
      front:`<rect x="41" y="120" width="6" height="180" rx="3" fill="#8a5428" stroke="${NR_OL}" stroke-width="2"/><circle cx="44" cy="116" r="9" fill="#f5c842" stroke="${NR_OL}" stroke-width="2.4"/><path d="M38 108l6-10 6 10" fill="#f5c842" stroke="${NR_OL}" stroke-width="2"/>${_nrHand(NR_ARM.Rout,'#c98e5e')}`,
    })},
  { // 2 MAKEDON
    role:'Makedon Hoplit', en_role:'Macedonian Hoplite', year:-331, bg:['gtemple','statue','ship'], parts:'sparkle',
    lines:["Büyük İskender burada, Babil'de son nefesini verdi. Henüz 32 yaşındaydı ama dünyanın fatihi olmuştu.",
      "Yunan ve Doğu kültürü Mezopotamya'da birleşti. Buna Helenizm diyoruz.",
      "Bilim, sanat, felsefe... Babil bir kültür merkezi oldu. Bu miras asırlarca yaşadı."],
    en:["Alexander the Great breathed his last here in Babylon. He was only 32, yet he had conquered the world.",
      "Greek and Eastern culture merged in Mesopotamia. We call it Hellenism.",
      "Science, art, philosophy... Babylon became a centre of culture. This legacy lived on for centuries."],
    fig:()=>nrFigure({skin:'#e0b088', hair:'#5a3a1a', beard:'none', robe:'#c8ccd4', sleeve:'#e8e0c8', armR:'out', armL:'in',
      back:`<path d="M44 190Q30 250 36 300H164Q170 250 156 190Q130 170 100 170Q70 170 44 190Z" fill="#3a6aaa" stroke="${NR_OL}" stroke-width="2.4"/>`,
      torso:`<path d="M60 186Q100 176 140 186L138 270H62Z" fill="#c8ccd4" stroke="${NR_OL}" stroke-width="2.4"/><path d="M80 200Q90 212 100 200Q110 212 120 200M84 226Q100 236 116 226M100 204V256" fill="none" stroke="#8a8f99" stroke-width="2.4"/>
        <g fill="#c4922a" stroke="${NR_OL}" stroke-width="1.6"><rect x="60" y="270" width="12" height="30"/><rect x="74" y="270" width="12" height="30"/><rect x="88" y="270" width="12" height="30"/><rect x="102" y="270" width="12" height="30"/><rect x="116" y="270" width="12" height="30"/><rect x="130" y="270" width="12" height="30"/></g>`,
      collar:`<circle cx="136" cy="176" r="7" fill="#f5c842" stroke="${NR_OL}" stroke-width="2"/>`,
      head:`<path d="M72 58Q94 6 140 44L132 50Q104 26 82 64Z" fill="#c8142e" stroke="${NR_OL}" stroke-width="2.4"/>
        <path d="M72 94Q70 52 100 50Q130 52 128 94L124 118L114 118L114 94Q100 88 86 94L86 118L76 118Z" fill="#b8bec8" stroke="${NR_OL}" stroke-width="2.6"/>
        <path d="M86 94Q100 88 114 94" fill="none" stroke="#6a707a" stroke-width="2"/><path d="M100 52V88" stroke="#e8ecf2" stroke-width="3" opacity=".6"/>`,
      front:`<rect x="41" y="60" width="5" height="240" rx="2.5" fill="#8a5428" stroke="${NR_OL}" stroke-width="1.8"/><path d="M43.5 40l7 20h-14z" fill="#c8ccd4" stroke="${NR_OL}" stroke-width="2"/>${_nrHand(NR_ARM.Rout,'#e0b088')}
        <circle cx="132" cy="252" r="44" fill="#3a6aaa" stroke="${NR_OL}" stroke-width="3"/><circle cx="132" cy="252" r="37" fill="none" stroke="#f5c842" stroke-width="3.5"/>
        <path d="${_giStar(132, 252, 16, 24, 8)}" fill="#f5c842" stroke="${NR_OL}" stroke-width="1.4"/><circle cx="132" cy="252" r="5" fill="#f5c842" stroke="${NR_OL}" stroke-width="1.4"/>`,
    })},
  { // 3 PART
    role:'Part Süvarisi', en_role:'Parthian Horseman', year:-247, bg:['fortress','iwan','firetemple'], parts:'feather',
    lines:["Biz Partlar İran'ın doğusundan geldik. Roma'yı durduran güç bizim süvarilerimizdi.",
      "Carrhae savaşında Roma lejyonları ok yağmuruna tutuldu. Mezopotamya bizimdi.",
      "Yüzyıllar boyunca bu toprakları koruduk. Sonra içimizden yeni bir güç doğdu: Sasaniler."],
    en:["We Parthians came from eastern Iran. Our horsemen were the power that stopped Rome.",
      "At the battle of Carrhae the Roman legions were caught in a rain of arrows. Mesopotamia was ours.",
      "For centuries we guarded these lands. Then a new power rose from among us: the Sasanians."],
    fig:()=>nrFigure({skin:'#c98e5e', hair:'#2a1a10', headY:-6, beard:'short', robe:'#8a3a2a', sleeve:'#7a2e22', armR:'in', armL:'out',
      torso:`<path d="M60 180L100 230L140 180" fill="none" stroke="#e6c77f" stroke-width="5"/><path d="M40 244H160" stroke="#f5c842" stroke-width="7"/><circle cx="100" cy="244" r="7" fill="#f5c842" stroke="${NR_OL}" stroke-width="2"/>`,
      under:`<path d="M126 70Q146 80 150 104L142 106Q138 88 122 78Z" fill="#d9442e" stroke="${NR_OL}" stroke-width="2"/><path d="M120 74Q138 92 136 120L128 118Q128 96 116 80Z" fill="#d9442e" stroke="${NR_OL}" stroke-width="2"/>`,
      head:`<path d="M71 86Q70 46 100 42Q128 44 129 86Q118 70 100 70Q82 70 71 86Z" fill="#6a4424" stroke="${NR_OL}" stroke-width="2.6"/>
        <path d="M71 82Q66 106 76 118L84 114Q78 100 80 84Z" fill="#6a4424" stroke="${NR_OL}" stroke-width="2.2"/><path d="M129 82Q134 106 124 118L116 114Q122 100 120 84Z" fill="#6a4424" stroke="${NR_OL}" stroke-width="2.2"/>
        <path d="M72 74Q100 62 128 74" fill="none" stroke="#f5c842" stroke-width="4.5"/>`,
      front:`<path d="M162 196C176 220 176 270 162 294" fill="none" stroke="${NR_OL}" stroke-width="8" stroke-linecap="round"/><path d="M162 196C176 220 176 270 162 294" fill="none" stroke="#8a5428" stroke-width="5" stroke-linecap="round"/>
        <path d="M162 196V294" stroke="#fff6e0" stroke-width="1.4"/>${_nrHand(NR_ARM.Lout,'#c98e5e')}
        <path d="M-6 300C-6 268 2 250 14 240L2 236C-6 234-10 228-8 222L10 204L16 190L24 200C38 204 48 218 50 238C52 256 52 280 50 300Z" fill="#8a5428" stroke="${NR_OL}" stroke-width="2.6"/>
        <path d="M24 200C38 206 46 222 48 244L50 300H58C58 270 56 240 48 222C42 210 34 202 24 200Z" fill="#3a2410" stroke="${NR_OL}" stroke-width="2"/>
        <circle cx="12" cy="214" r="2.6" fill="#1a0e04"/><path d="M2 226L18 232L14 216" fill="none" stroke="#f5c842" stroke-width="2.4"/>`,
    })},
  { // 4 SASANİ
    role:'Sasani Soylusu', en_role:'Sasanian Noble', year:224, bg:['greatarch','firetower','throne'], parts:'flame',
    lines:["Biz Pers geleneğini yeniden canlandırdık. Ktesifon'daki sarayımız dünyanın harikasıydı.",
      "Cündişapur'da dünyanın ilk üniversitelerinden birini kurduk. Yunan, Hint ve İran bilimi orada buluştu.",
      "Dört asırlık imparatorluğumuz sona erdi. Arabistan'dan yeni bir güç geliyordu: İslam."],
    en:["We revived the Persian tradition. Our palace at Ctesiphon was a wonder of the world.",
      "At Gundeshapur we founded one of the world's first universities. Greek, Indian and Iranian science met there.",
      "Our four-century empire came to an end. A new power was coming from Arabia: Islam."],
    fig:()=>nrFigure({skin:'#d09a6a', hair:'#1a1020', beard:'pointed', robe:'#d8a830', sleeve:'#b8302a', armR:'in', armL:'up',
      back:`<path d="M40 190Q26 250 30 300H170Q174 250 160 190Q130 172 100 172Q70 172 40 190Z" fill="#b8302a" stroke="${NR_OL}" stroke-width="2.4"/>`,
      torso:`<path d="M60 186Q100 174 140 186L140 300H60Z" fill="#d8a830" stroke="${NR_OL}" stroke-width="2.4"/>
        <g fill="none" stroke="#8a6010" stroke-width="1.6" opacity=".8"><path d="M64 200q6 6 12 0t12 0 12 0 12 0 12 0 12 0M64 214q6 6 12 0t12 0 12 0 12 0 12 0 12 0M64 228q6 6 12 0t12 0 12 0 12 0 12 0 12 0M64 242q6 6 12 0t12 0 12 0 12 0 12 0 12 0M64 256q6 6 12 0t12 0 12 0 12 0 12 0 12 0"/></g>
        <path d="M60 270H140" stroke="#b8302a" stroke-width="8"/>`,
      collar:`<path d="M76 164Q100 186 124 164" fill="none" stroke="#fff6e0" stroke-width="6" stroke-dasharray="1 5" stroke-linecap="round"/>`,
      under:`<g fill="#1a1020" stroke="${NR_OL}" stroke-width="2"><circle cx="68" cy="104" r="15"/><circle cx="132" cy="104" r="15"/><circle cx="72" cy="126" r="11"/><circle cx="128" cy="126" r="11"/></g>`,
      head:`<circle cx="100" cy="26" r="15" fill="#3a2a70" stroke="${NR_OL}" stroke-width="2.4"/><path d="M84 38Q100 52 116 38Q108 44 100 44Q92 44 84 38Z" fill="#f5c842" stroke="${NR_OL}" stroke-width="1.8"/>
        <path d="M73 70V50L82 57L88 44L96 55L100 40L104 55L112 44L118 57L127 50V70Z" fill="#f5c842" stroke="${NR_OL}" stroke-width="2.6"/>
        <g fill="#ff8a1e" stroke="${NR_OL}" stroke-width="1.2"><path d="M88 44q-3-6 0-10 3 4 0 10z"/><path d="M100 40q-3-7 0-12 3 5 0 12z"/><path d="M112 44q-3-6 0-10 3 4 0 10z"/></g>
        <rect x="73" y="62" width="54" height="8" fill="#e8c060" stroke="${NR_OL}" stroke-width="1.8"/><g fill="#d9442e"><circle cx="86" cy="66" r="2"/><circle cx="100" cy="66" r="2.4"/><circle cx="114" cy="66" r="2"/></g>
        <path d="M127 64Q146 60 156 72Q146 70 138 74Q148 80 150 92Q140 82 128 78Z" fill="#fff6e0" stroke="${NR_OL}" stroke-width="1.8"/>`,
      front:`<circle cx="158" cy="196" r="20" fill="url(#saGlow)"/><path d="M158 168c4 8 11 12 11 20a11 9 0 0 1-22 0c0-5 3-7 5-12 2 4 3 5 5 6 0-5 0-9 1-14z" fill="#ff8a1e" stroke="${NR_OL}" stroke-width="2"/><path d="M158 184c2 3 5 5 5 8a5 4 0 0 1-10 0c0-2 2-3 3-5z" fill="#ffe066"/>${_nrHand(NR_ARM.Lup,'#d09a6a')}`,
    })},
  { // 5 İSLAM
    role:'Kufeli Âlim', en_role:'Scholar of Kufa', year:636, bg:['mosque','crescenttower','garden'], parts:'leaf',
    lines:["M.S. 636'da Hz. Ömer'in orduları Kadisiye'de galip geldi. Mezopotamya İslam'a açıldı.",
      "Biz şehirleri yıkmadık. Kufe ve Basra'yı kurduk. İlim ve adalet getirdik.",
      "Bu topraklar artık yeni bir medeniyetin beşiği olacaktı."],
    en:["In AD 636 the armies of Caliph Umar triumphed at Qadisiyyah. Mesopotamia opened to Islam.",
      "We did not destroy the cities. We founded Kufa and Basra. We brought learning and justice.",
      "These lands would now become the cradle of a new civilisation."],
    fig:()=>nrFigure({skin:'#c48a58', hair:'#1a1410', beard:'full', headY:-5, robe:'#f0ece0', sleeve:'#f0ece0', armR:'in', armL:'in',
      back:`<path d="M38 192Q28 250 30 300H70L76 190ZM162 192Q172 250 170 300H130L124 190Z" fill="#2a8a4a" stroke="${NR_OL}" stroke-width="2.4"/>`,
      torso:`<path d="M72 188L70 300M128 188L130 300" stroke="#f5c842" stroke-width="4"/><path d="M100 176V300" stroke="#d8d0c0" stroke-width="2"/>`,
      head:`<path d="M123 66Q142 86 138 136L128 134Q130 98 116 72Z" fill="#fff6e0" stroke="${NR_OL}" stroke-width="2.2"/>
        <ellipse cx="100" cy="50" rx="14" ry="6" fill="#2a8a4a" stroke="${NR_OL}" stroke-width="2"/>
        <path d="M71 78Q68 48 100 44Q132 48 129 78Q116 68 100 68Q84 68 71 78Z" fill="#fff6e0" stroke="${NR_OL}" stroke-width="2.6"/>
        <path d="M74 66Q100 52 126 66M76 58Q100 46 124 58" fill="none" stroke="#cbc3b8" stroke-width="2.2"/>`,
      itemBehindHands:`<path d="M100 226C90 218 78 216 70 218V250C78 248 90 250 100 258C110 250 122 248 130 250V218C122 216 110 218 100 226Z" fill="#2a8a4a" stroke="${NR_OL}" stroke-width="2.4"/>
        <path d="M100 228C92 222 82 220 74 222V246C82 245 92 247 100 252C108 247 118 245 126 246V222C118 220 108 222 100 228Z" fill="#fff6e0" stroke="${NR_OL}" stroke-width="1.6"/>
        <path d="M100 228V252" stroke="#f5c842" stroke-width="2"/><path d="M78 230h16M78 236h16M78 242h14M106 230h16M106 236h16M108 242h14" stroke="#8a7a5a" stroke-width="1.4"/>`,
    })},
  { // 6 ABBASİ
    role:'Abbasi Veziri', en_role:'Abbasid Vizier', year:762, bg:['roundcity','madrasa','observatory'], parts:'page',
    lines:["762 yılında Halife Mansur Bağdat'ı kurdu. Yuvarlak şehir, mükemmel bir tasarımdı.",
      "Beytülhikme'de Yunanca, Farsça ve Hintçe kitaplar Arapçaya çevrildi.",
      "El-Harezmi, el-Kindi, er-Razi... Bağdat'ta dünyayı değiştiren bilginler yetişti."],
    en:["In 762 Caliph al-Mansur founded Baghdad. The round city was a perfect design.",
      "In the House of Wisdom, Greek, Persian and Indian books were translated into Arabic.",
      "Al-Khwarizmi, al-Kindi, al-Razi... Scholars who changed the world flourished in Baghdad."],
    fig:()=>nrFigure({skin:'#c48a58', hair:'#1a1410', beard:'short', headY:-5, robe:'#1c1a24', sleeve:'#24222e', armR:'in', armL:'in',
      torso:`<path d="M76 172L100 300M124 172L100 300" stroke="#f5c842" stroke-width="3" opacity=".8"/><path d="M60 196H140" stroke="#f5c842" stroke-width="2" stroke-dasharray="4 4"/>`,
      cuffs:`<g fill="none" stroke="#f5c842" stroke-width="5"><path d="M52 214Q60 212 68 214"/><path d="M132 214Q140 212 148 214"/></g>`,
      head:`<path d="M84 62L88 16Q100 8 112 16L116 62Z" fill="#101016" stroke="${NR_OL}" stroke-width="2.6"/>
        <path d="M71 80Q68 56 100 52Q132 56 129 80Q116 70 100 70Q84 70 71 80Z" fill="#1c1a24" stroke="${NR_OL}" stroke-width="2.6"/>
        <path d="M73 70Q100 56 127 70" fill="none" stroke="#f5c842" stroke-width="3"/><path d="M76 62Q100 50 124 62" fill="none" stroke="#f5c842" stroke-width="1.6" stroke-dasharray="3 3"/>`,
      itemBehindHands:`<rect x="78" y="208" width="42" height="40" rx="3" fill="#f3e3b8" stroke="${NR_OL}" stroke-width="2.4"/><path d="M114 216h-28M114 223h-30M114 230h-24M114 237h-28" stroke="#6a4a24" stroke-width="1.6"/>
        <path d="M84 250L66 204" stroke="${NR_OL}" stroke-width="5" stroke-linecap="round"/><path d="M84 250L66 204" stroke="#c9a45a" stroke-width="2.6" stroke-linecap="round"/>`,
    })},
  { // 7 MOĞOL
    role:'Moğol Akıncısı', en_role:'Mongol Raider', year:1258, bg:['yurt','fortress','caravan'], parts:'spark',
    lines:["1258... Hülagu Han Bağdat'ı kuşattı. On üç gün sonra şehir düştü.",
      "Şehir yandı. Beytülhikme'nin kitapları Dicle'yi karaya boyadı.",
      "Ama insanlık direndi. Yavaş yavaş yeniden inşa başladı. Mezopotamya ölmedi."],
    en:["1258... Hulagu Khan besieged Baghdad. Thirteen days later the city fell.",
      "The city burned. The books of the House of Wisdom turned the Tigris black.",
      "But humanity endured. Slowly, rebuilding began. Mesopotamia did not die."],
    fig:()=>nrFigure({skin:'#c8945e', headY:-8, hair:'#1a1410', beard:'mongol', stern:true, robe:'#6a4a30', sleeve:'#5a3e28', armR:'out', armL:'in',
      back:`<path d="M152 150C176 190 176 250 150 290" fill="none" stroke="${NR_OL}" stroke-width="7" stroke-linecap="round"/><path d="M152 150C176 190 176 250 150 290" fill="none" stroke="#8a5428" stroke-width="4" stroke-linecap="round"/><path d="M152 150V290" stroke="#e6c77f" stroke-width="1.2"/>`,
      torso:`<g fill="#7a5a3a" stroke="${NR_OL}" stroke-width="1.2">${[0,1,2,3,4,5].map(r=>[0,1,2,3,4,5].map(c=>`<rect x="${62+c*13}" y="${190+r*16}" width="11" height="14" rx="2"/>`).join('')).join('')}</g>
        <path d="M40 188Q100 170 160 188" fill="none" stroke="#7a1a1a" stroke-width="10"/><path d="M52 286H148" stroke="#7a1a1a" stroke-width="8"/>`,
      collar:`<path d="M72 164Q100 184 128 164Q126 176 100 184Q74 176 72 164Z" fill="#9a7a5a" stroke="${NR_OL}" stroke-width="2"/>`,
      head:`<path d="M100 26Q94 4 84 0Q98 4 104 10Q110 2 118 4Q106 12 102 26Z" fill="#7a1a1a" stroke="${NR_OL}" stroke-width="1.8"/>
        <path d="M73 76Q76 44 100 26Q124 44 127 76Z" fill="#8a9098" stroke="${NR_OL}" stroke-width="2.6"/><path d="M100 28V72" stroke="#cbd0d8" stroke-width="3"/>
        <path d="M66 78Q100 64 134 78L132 86Q100 74 68 86Z" fill="#9a7a5a" stroke="${NR_OL}" stroke-width="2.2"/>
        <path d="M70 84Q62 106 72 122L80 118Q74 102 78 86Z" fill="#9a7a5a" stroke="${NR_OL}" stroke-width="2"/><path d="M130 84Q138 106 128 122L120 118Q126 102 122 86Z" fill="#9a7a5a" stroke="${NR_OL}" stroke-width="2"/>`,
      front:`<rect x="42" y="150" width="4" height="150" fill="#5c3516"/><path d="M44 130l6 22h-12z" fill="#8a9098" stroke="${NR_OL}" stroke-width="2"/>${_nrHand(NR_ARM.Rout,'#c8945e')}`,
    })},
  { // 8 OSMANLI
    role:'Osmanlı Paşası', en_role:'Ottoman Pasha', year:1534, bg:['omosque','opalace','bridge'], parts:'goldline',
    lines:["1534'te Kanuni Sultan Süleyman Bağdat'a girdi. Mezopotamya Osmanlı'ya katıldı.",
      "Yaklaşık dört asır boyunca bu topraklar Osmanlı idaresinde kaldı. Bağdat bir eyalet merkezi oldu.",
      "Binlerce yıllık medeniyet... Babil'den başlayan yolculuk burada son buluyor."],
    en:["In 1534 Suleiman the Magnificent entered Baghdad. Mesopotamia joined the Ottoman Empire.",
      "For nearly four centuries these lands stayed under Ottoman rule. Baghdad became a provincial capital.",
      "Thousands of years of civilisation... The journey that began in Babylon ends here."],
    fig:()=>nrFigure({skin:'#d8a878', headY:-7, hair:'#2a1a10', beard:'full', robe:'#a8202a', sleeve:'#96202a', armR:'in', armL:'in',
      torso:`<path d="M86 170L82 300H118L114 170Z" fill="#1f6a3a" stroke="${NR_OL}" stroke-width="2"/><g stroke="#f5c842" stroke-width="3" stroke-linecap="round"><path d="M72 194h14M114 194h14M72 210h14M114 210h14M72 226h14M114 226h14M72 242h14M114 242h14"/></g>
        <g fill="#f5c842" stroke="${NR_OL}" stroke-width="1"><circle cx="100" cy="190" r="3"/><circle cx="100" cy="206" r="3"/><circle cx="100" cy="222" r="3"/></g>
        <path d="M48 262H152" stroke="#fff6e0" stroke-width="10"/><path d="M48 262H152" stroke="#e8dcc0" stroke-width="2" stroke-dasharray="6 4"/>
        <path d="M128 262Q150 272 162 300" fill="none" stroke="${NR_OL}" stroke-width="9" stroke-linecap="round"/><path d="M128 262Q150 272 162 300" fill="none" stroke="#3a2410" stroke-width="6" stroke-linecap="round"/>
        <path d="M118 258L130 250L134 256L122 264Z" fill="#f5c842" stroke="${NR_OL}" stroke-width="1.6"/><circle cx="116" cy="262" r="4" fill="#f5c842" stroke="${NR_OL}" stroke-width="1.6"/>`,
      collar:`<path d="M80 162Q100 176 120 162" fill="none" stroke="#fff6e0" stroke-width="5"/>`,
      head:`<ellipse cx="100" cy="50" rx="36" ry="28" fill="#fff6e0" stroke="${NR_OL}" stroke-width="2.6"/>
        <path d="M68 44Q100 30 132 44M66 56Q100 42 134 56M70 66Q100 54 130 66" fill="none" stroke="#cbc3b8" stroke-width="2.2"/>
        <path d="M86 28Q100 10 114 28Q100 24 86 28Z" fill="#c8142e" stroke="${NR_OL}" stroke-width="2"/>
        <path d="M112 30Q126 6 116-4Q120 12 108 28Z" fill="#fff6e0" stroke="${NR_OL}" stroke-width="1.6"/><circle cx="110" cy="32" r="5" fill="#2a8a4a" stroke="#f5c842" stroke-width="2.4"/>`,
    })},
];

// ── Sahne ──
let _nr = null;
function nrLang(){ return (typeof currentLang!=='undefined' && currentLang==='en') ? 'en' : 'tr'; }
function civIntroSeen(c){ return !!(CURRENT_USER && CURRENT_USER.civIntroSeen && CURRENT_USER.civIntroSeen[c]); }
function nrParticles(type){
  const cfg = {star:['up',0], ember:['up',1], sparkle:['float',0], feather:['down',0], flame:['up',1], leaf:['down',0], page:['down',0], spark:['up',1], goldline:['float',0]}[type] || ['float',0];
  let h='';
  for(let i=0;i<22;i++){
    const x=(Math.random()*100).toFixed(1), d=(5+Math.random()*6).toFixed(2), dl=(-Math.random()*10).toFixed(2), s=(.6+Math.random()*.9).toFixed(2), dx=((Math.random()-.5)*80).toFixed(0);
    const top = cfg[0]==='float' ? `top:${(8+Math.random()*80).toFixed(1)}%;` : '';
    h+=`<i class="nr-p p-${type} nr-${cfg[0]}" style="left:${x}%;${top}--d:${d}s;--dl:${dl}s;--s:${s};--dx:${dx}px"></i>`;
  }
  return h;
}
function showCivilizationIntro(civId, opts={}){
  const N=NARRATORS[civId], civ=CIVILIZATIONS[civId];
  if(!N || !civ){ opts.onDone?.(); return; }
  if(_nr) nrFinish(true);
  if(CURRENT_USER){ CURRENT_USER.civIntroSeen={...(CURRENT_USER.civIntroSeen||{}), [civId]:1}; saveUserData(CURRENT_USER); }
  const el=document.getElementById('nrScene'), en=nrLang()==='en';
  el.style.setProperty('--nr-c', civ.color);
  el.dataset.civ=civId;
  document.getElementById('nrTitle').innerHTML=`${civIcon(civ)} ${en && civ.en ? civ.en.title : civ.title}`;
  document.getElementById('nrYear').textContent = en ? (N.year<0 ? `${-N.year} BC` : `AD ${N.year}`) : fmtYear(N.year);
  document.getElementById('nrRole').textContent = en ? N.en_role : N.role;
  document.getElementById('nrFig').innerHTML = `<svg viewBox="0 0 200 300" aria-hidden="true" focusable="false">${N.fig()}</svg>`;
  document.getElementById('nrSky').innerHTML = N.bg.map((k,i)=>`<span class="nr-sil s${i}">${giSVG(k, civ.color)}</span>`).join('');
  document.getElementById('nrParts').innerHTML = nrParticles(N.parts);
  document.getElementById('nrSkip').textContent = en ? 'Skip' : 'Atla';
  const lines = en ? N.en : N.lines;
  document.getElementById('nrDots').innerHTML = lines.map(()=>'<i></i>').join('');
  document.getElementById('nrText').textContent='';
  el.classList.remove('nr-out'); el.classList.add('open');
  _nr={c:civId, lines, i:-1, t:null, auto:null, typing:false, onDone:opts.onDone};
  _nr.auto=setTimeout(nrNext, 700);
}
function nrSay(i){
  const n=_nr, en=nrLang()==='en', txt=document.getElementById('nrText'), fig=document.getElementById('nrFig'), bub=document.getElementById('nrBubble');
  document.querySelectorAll('#nrDots i').forEach((d,k)=>{ d.classList.toggle('on', k===i); d.classList.toggle('done', k<i); });
  document.getElementById('nrNext').textContent = i===n.lines.length-1 ? (en?'Start ✦':'Başla ✦') : (en?'Next →':'Devam →');
  bub.classList.remove('pop'); void bub.offsetWidth; bub.classList.add('pop');
  const text=n.lines[i]; let pos=0;
  n.typing=true; fig.classList.add('talking'); txt.textContent='';
  const step=()=>{
    if(!_nr || _nr!==n) return;
    if(pos>=text.length){ n.typing=false; fig.classList.remove('talking'); n.auto=setTimeout(nrNext, 4000); return; }
    const ch=text[pos++]; txt.textContent=text.slice(0,pos);
    const endSentence=/[.!?…]/.test(ch) && (pos>=text.length || text[pos]===' ') && !/(M\.Ö|M\.S|Hz|BC|AD)\.$/.test(text.slice(0,pos));
    if(endSentence) fig.classList.remove('talking'); else if(!fig.classList.contains('talking')) fig.classList.add('talking');
    n.t=setTimeout(step, endSentence ? 500 : 30);
  };
  n.t=setTimeout(step, 160);
}
function nrNext(){
  const n=_nr; if(!n) return;
  clearTimeout(n.auto); clearTimeout(n.t);
  if(n.typing){   // yazıyor → cümleyi hemen tamamla
    n.typing=false; document.getElementById('nrText').textContent=n.lines[n.i];
    document.getElementById('nrFig').classList.remove('talking');
    n.auto=setTimeout(nrNext, 4000); return;
  }
  if(n.i+1>=n.lines.length){ nrFinish(); return; }
  n.i++;
  if(n.i>0){ const txt=document.getElementById('nrText'); txt.classList.add('fade'); setTimeout(()=>{ txt.classList.remove('fade'); if(_nr===n) nrSay(n.i); }, 220); }
  else nrSay(n.i);
}
function nrFinish(instant){
  const n=_nr; if(!n) return;
  _nr=null; clearTimeout(n.auto); clearTimeout(n.t);
  const el=document.getElementById('nrScene');
  const done=()=>{ el.classList.remove('open','nr-out'); document.getElementById('nrFig').classList.remove('talking'); n.onDone?.(); };
  if(instant){ done(); return; }
  el.classList.add('nr-out'); setTimeout(done, 520);
}
document.addEventListener('keydown', e=>{
  if(!_nr) return;
  if(e.key==='Escape'){ e.preventDefault(); nrFinish(); }
  else if(e.key==='Enter' || e.key===' ' || e.key==='ArrowRight'){ e.preventDefault(); nrNext(); }
});

// ── Harita ekranı: aktif medeniyet + ödül bekleyen geçiş ──
const _civOrigShowMapScreen = showMapScreen;
showMapScreen = function(){
  ensureProgress();
  const pend=pendingCivReward();
  if(pend>=0){ playCivTransition(pend); return; }
  if(G.mapCiv==null || !isCivUnlocked(G.mapCiv)) G.mapCiv=highestUnlockedCiv();
  applyMapCiv();
  const res=_civOrigShowMapScreen.apply(this,arguments);
  const hint=document.getElementById('mapEraHint');
  if(hint) hint.textContent='Sürükle · Şehre dokun · Kilidi aç';
  renderCivTabs(); updateEraBanner();
  // Yeni medeniyete ilk girişte anlatıcı sahnesi (her medeniyet için 1 kez); harita açılışı onun ardından
  const reveal=G._civRevealAnim, ic=highestUnlockedCiv();
  G._civRevealAnim=false;
  if(G.mapCiv===ic && !civIntroSeen(ic) && tutGet(TUT_KEY_WELCOME))
    showCivilizationIntro(ic, {onDone:()=>{ if(reveal) setTimeout(playCivReveal, 250); }});
  else if(reveal) setTimeout(playCivReveal, 350);
  return res;
};
