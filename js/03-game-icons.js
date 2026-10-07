// ══════════════════════════════════════════════
// OYUN İKONLARI — yapı / medeniyet / özel taş çizimleri (emoji yerine, her cihazda aynı)
// 80×80 viewBox, zemin y=70. Renkler mağaza paletinden (.sa .q*); --ga = yapının/medeniyetin rengi (.qa/.qal/.qad)
// ══════════════════════════════════════════════
const _giStar = (cx, cy, n, R, r, rot=-90) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (rot + i * 180 / n) * Math.PI / 180, rr = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
  }
  return d + 'z';
};
const _giFlame = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path class="qfl o" d="M0-34c5 9 14 14 14 24A14 12 0 0 1-14-10c0-6 4-9 6-15 2 5 4 6 6 7 0-6 0-11 2-16z"/>
  <path class="qfy" d="M0-19c2.5 4 7 7 7 11a7 6 0 0 1-14 0c0-3 3-5 4-8 1 2 2 3 3 3z"/></g>`;
const _giArch = (x, y, w, h, cls='qdk') => `<path class="${cls}" d="M${x} ${y}v-${h - w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0v${h - w / 2}z"/>`;
const _giFinial = (x, y) => `<rect class="qg" x="${x - .7}" y="${y - 5}" width="1.4" height="5"/><path class="qg" d="M${x - 1} ${y - 9}a3 3 0 1 0 3 4 2.3 2.3 0 1 1-3-4z"/>`;

const GI_ART = {
// ── BABİL ──
tower:`<path class="qbd o" d="M12 70h56l-5-12H17z"/><path class="qb o" d="M18 58h44l-5-12H23z"/><path class="qbl o" d="M24 46h32l-4-11H28z"/>
  <path class="qb o" d="M29 35h22l-3-10H32z"/><path class="qg o" d="M34 25h12l-2-8h-8z"/><path class="qg o" d="M40 6l4 11h-8z"/>
  <path class="lnDk" d="M16 65l46-4M22 53l35-3M27 41l26-2M31 31l18-2"/><path class="qdk" d="M36 70v-6a4 4 0 0 1 8 0v6z"/>`,
gardens:`<rect class="qsd o" x="10" y="57" width="60" height="13"/><rect class="qs o" x="17" y="44" width="46" height="13"/><rect class="qsl o" x="24" y="32" width="32" height="12"/>
  ${_giArch(15,70,6,9)}${_giArch(59,70,6,9)}${_giArch(22,57,6,8)}${_giArch(52,57,6,8)}
  <rect class="qwa" x="37" y="32" width="6" height="38"/><rect class="qwl" x="38.5" y="32" width="1.6" height="38"/>
  <rect class="qw o" x="38" y="19" width="4" height="13"/><circle class="ql o" cx="40" cy="15" r="9"/><circle class="qll" cx="37" cy="12" r="3.2"/>
  <g class="ql o"><circle cx="14" cy="56" r="5.5"/><circle cx="66" cy="56" r="5.5"/><circle cx="21" cy="43" r="5.5"/><circle cx="59" cy="43" r="5.5"/><circle cx="28" cy="31" r="5"/><circle cx="52" cy="31" r="5"/></g>
  <g class="qpk"><circle cx="13" cy="54" r="1.6"/><circle cx="67" cy="54" r="1.6"/><circle cx="20" cy="41" r="1.6"/><circle cx="60" cy="41" r="1.6"/><circle cx="27" cy="29" r="1.5"/><circle cx="53" cy="29" r="1.5"/></g>`,
gate:`<rect class="qlp o" x="10" y="20" width="18" height="50"/><rect class="qlp o" x="52" y="20" width="18" height="50"/><rect class="qlpd o" x="26" y="30" width="28" height="40"/>
  <g class="qlp o"><rect x="10" y="14" width="5" height="6"/><rect x="16.5" y="14" width="5" height="6"/><rect x="23" y="14" width="5" height="6"/><rect x="52" y="14" width="5" height="6"/><rect x="58.5" y="14" width="5" height="6"/><rect x="65" y="14" width="5" height="6"/>
  <rect x="28" y="25" width="5" height="5"/><rect x="37.5" y="25" width="5" height="5"/><rect x="47" y="25" width="5" height="5"/></g>
  <path d="M30 70V48a10 10 0 0 1 20 0v22" fill="none" stroke="#f5c842" stroke-width="2.4"/><path class="qdk" d="M32 70V48a8 8 0 0 1 16 0v22z"/>
  <g class="qg"><rect x="13" y="30" width="12" height="3" rx="1.5"/><rect x="13" y="43" width="12" height="3" rx="1.5"/><rect x="13" y="56" width="12" height="3" rx="1.5"/>
  <rect x="55" y="30" width="12" height="3" rx="1.5"/><rect x="55" y="43" width="12" height="3" rx="1.5"/><rect x="55" y="56" width="12" height="3" rx="1.5"/></g>
  <g class="qwh"><circle cx="31" cy="35" r="1.6"/><circle cx="40" cy="35" r="1.6"/><circle cx="49" cy="35" r="1.6"/></g>`,
ziggurat:`<path class="qsnd o" d="M8 70h64V58H8z"/><path class="qsn o" d="M15 58h50V46H15z"/><path class="qsnd o" d="M22 46h36V35H22z"/><path class="qsn o" d="M29 35h22V25H29z"/>
  <rect class="qa o" x="33" y="15" width="14" height="10"/><path class="qg o" d="M31 15h18l-9-7z"/><rect class="qdk" x="38" y="19" width="4" height="6"/>
  <path class="qbd o" d="M35 70l2-45h6l2 45z"/><path class="lnDk" d="M36 65h8M36.3 60h7.4M36.6 55h6.8M36.8 50h6.4M37 45h6M37.3 40h5.4M37.5 35h5M37.8 30h4.4"/>`,
river:`<path class="qsn o" d="M4 70h72v-8H4z"/><path class="qwa o" d="M4 63c6-4 12-4 17 0s12 4 17 0 12-4 17 0 12 4 21 0V50c-9 4-15 4-21 0s-12-4-17 0-12 4-17 0-11-4-17 0z"/>
  <path d="M8 56c5-3 10-3 15 0M42 56c5-3 10-3 15 0M26 60c4-2 8-2 12 0" stroke="#9adcf8" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path class="qw o" d="M53 50c1-12 0-20-4-28l3-1c4 8 5 17 4 29z"/>
  <g class="ql o"><path d="M50 22c-9-3-16 0-20 7 6-4 13-5 20-4z"/><path d="M50 22c6-8 14-9 20-5-7 0-13 2-18 7z"/><path d="M50 22c-4-7-2-13 2-17 0 5 1 11 1 16z"/><path d="M51 22c9 0 14 5 15 12-4-5-10-8-15-10z"/></g>
  <g stroke="#2f7228" stroke-width="2" stroke-linecap="round"><path d="M13 51V36M18 51V32M23 51V38"/></g><g class="qwd"><rect x="11.8" y="34" width="2.6" height="7" rx="1.3"/><rect x="16.8" y="30" width="2.6" height="7" rx="1.3"/><rect x="21.8" y="36" width="2.6" height="7" rx="1.3"/></g>`,
market:`<rect class="qw o" x="14" y="34" width="4" height="36"/><rect class="qw o" x="62" y="34" width="4" height="36"/>
  <path class="qa o" d="M8 34l6-14h52l6 14z"/><path class="qwh" d="M22.5 20.7l-3 13.3h8l1.5-13.3zM37 20.7V34h7v-13.3zM52 20.7l2 13.3h8l-3.5-13.3z" opacity=".85"/>
  <path class="qa o" d="M8 34c0 5 9 5 9 0 0 5 9 5 9 0 0 5 9 5 9 0 0 5 10 5 10 0 0 5 9 5 9 0 0 5 9 5 9 0 0 5 9 5 9 0z"/>
  <rect class="qwd o" x="12" y="50" width="56" height="7"/><rect class="qw o" x="15" y="57" width="50" height="13"/>
  <g class="o"><circle class="qfl" cx="22" cy="45.5" r="4.5"/><circle class="qr" cx="31" cy="46.5" r="3.8"/><path class="qpu" d="M36 50l4-10 4 10z"/><circle class="qg" cx="49" cy="45.5" r="4.5"/><circle class="ql" cx="58" cy="46.5" r="3.8"/></g>`,
// ── PERS ──
ppalace:`<rect class="qsnd o" x="6" y="62" width="68" height="8"/><rect class="qsn o" x="10" y="26" width="60" height="8"/>
  <path class="qa o" d="M10 26v-4h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v-3h4v3h4v4z"/>
  <g class="qsl o"><rect x="14" y="34" width="6" height="28"/><rect x="26" y="34" width="6" height="28"/><rect x="48" y="34" width="6" height="28"/><rect x="60" y="34" width="6" height="28"/></g>
  <g class="qg o"><path d="M11 34h12l-2 4h-8z"/><path d="M23 34h12l-2 4h-8z"/><path d="M45 34h12l-2 4h-8z"/><path d="M57 34h12l-2 4h-8z"/></g>
  <path class="qdk o" d="M35 62V44h10v18z"/><path class="qg o" d="M27 30.5c4 0 8 1 13 1s9-1 13-1c-2 2.5-7 3.5-13 3.5s-11-1-13-3.5z"/><circle class="qg o" cx="40" cy="30" r="2.8"/>`,
firealtar:`<circle cx="40" cy="24" r="20" fill="url(#saGlow)" opacity=".75"/>
  <path class="qsd o" d="M20 70h40v-6H20z"/><path class="qs o" d="M25 64h30v-6H25z"/><rect class="qsl o" x="30" y="40" width="20" height="18"/><path class="qs o" d="M24 40h32v-6H24z"/>
  <rect class="qa o" x="34" y="45" width="12" height="8"/>${_giFlame(40, 34, 0.9)}`,
road:`<circle class="qg o" cx="40" cy="30" r="8"/><path class="ql o" d="M2 46c8-9 17-9 24-1 7-7 15-9 23-2 8-7 19-5 29 3v6H2z"/>
  <path class="qsn o" d="M2 70V50h76v20z"/><path class="qsnd o" d="M20 70l14-22h12l14 22z"/>
  <path d="M40 70v-6M40 61v-4.5M40 54v-3M40 49.5v-1.5" stroke="#f5c842" stroke-width="2.2"/>
  <path class="qs o" d="M9 66V55a4 4 0 0 1 8 0v11z"/><rect class="qb o" x="58" y="52" width="16" height="12"/><path class="qa o" d="M55 52l11-8 11 8z"/>${_giArch(64,64,4,6)}`,
chest:`<path class="qw o" d="M16 40l4-22h40l4 22z"/><path class="qwd" d="M22 36l3-15h30l3 15z"/>
  <path class="qg o" d="M15 44c4-9 10-11 14-9 4-7 13-7 17 0 4-2 11 0 15 9z"/>
  <path class="qa o" d="M28 36l3-4h5l3 4-5.5 5z"/><path class="qcr o" d="M46 33l3.5-4.5 3.5 4.5-3.5 4.5z"/><circle class="qr o" cx="40" cy="31" r="2.6"/>
  <rect class="qwd o" x="13" y="43" width="54" height="27" rx="2"/><rect class="qg o" x="13" y="49" width="54" height="4"/><rect class="qg o" x="13" y="63" width="54" height="3"/>
  <rect class="qg o" x="35.5" y="46" width="9" height="11" rx="1.5"/><rect class="qdk" x="39" y="50" width="2" height="4" rx="1"/>`,
apadana:`<path class="qsnd o" d="M6 70h68v-6H6z"/><path class="qsn o" d="M10 64h60v-5H10z"/>
  <g class="qsl o"><rect x="16" y="24" width="8" height="35"/><rect x="36" y="18" width="8" height="41"/><rect x="56" y="24" width="8" height="35"/></g>
  <path class="lnD" d="M20 27v30M40 21v36M60 27v30"/>
  <g class="qs o"><path d="M14 59h12l-2-4h-8z"/><path d="M34 59h12l-2-4h-8z"/><path d="M54 59h12l-2-4h-8z"/></g>
  <g class="qa o"><path d="M11 24c0-6 5-8 9-4 4-4 9-2 9 4z"/><path d="M31 18c0-6 5-8 9-4 4-4 9-2 9 4z"/><path d="M51 24c0-6 5-8 9-4 4-4 9-2 9 4z"/></g>
  <g class="qg"><circle cx="14" cy="21" r="1.4"/><circle cx="26" cy="21" r="1.4"/><circle cx="34" cy="15" r="1.4"/><circle cx="46" cy="15" r="1.4"/><circle cx="54" cy="21" r="1.4"/><circle cx="66" cy="21" r="1.4"/></g>`,
swords:`<g transform="rotate(-40 40 40)"><rect class="qsl o" x="37" y="4" width="6" height="46"/><path class="qsl o" d="M37 4l3-5 3 5z"/><rect class="qg o" x="29" y="50" width="22" height="4" rx="2"/><rect class="qw o" x="38" y="54" width="4" height="11"/><circle class="qg o" cx="40" cy="67" r="3"/></g>
  <g transform="rotate(40 40 40)"><rect class="qsl o" x="37" y="4" width="6" height="46"/><path class="qsl o" d="M37 4l3-5 3 5z"/><rect class="qg o" x="29" y="50" width="22" height="4" rx="2"/><rect class="qw o" x="38" y="54" width="4" height="11"/><circle class="qg o" cx="40" cy="67" r="3"/></g>
  <path class="qa o" d="M40 30l15 5v12c0 10-7 17-15 20-8-3-15-10-15-20V35z"/><path class="qg o" d="${_giStar(40, 47, 5, 8, 3.4)}"/>`,
// ── İSKENDER ──
gtemple:`<rect class="qsd o" x="8" y="64" width="64" height="6"/><rect class="qs o" x="11" y="59" width="58" height="5"/>
  <g class="qwh o"><rect x="14" y="33" width="6" height="26"/><rect x="25.5" y="33" width="6" height="26"/><rect x="37" y="33" width="6" height="26"/><rect x="48.5" y="33" width="6" height="26"/><rect x="60" y="33" width="6" height="26"/></g>
  <path class="ln" d="M17 35v22M28.5 35v22M40 35v22M51.5 35v22M63 35v22"/>
  <rect class="qsl o" x="10" y="27" width="60" height="6"/><path class="qa o" d="M8 27l32-16 32 16z"/><path class="qg o" d="${_giStar(40, 21, 8, 4.5, 1.8)}"/>`,
masks:`<path d="M9 26c-5 4-5 12 0 16M71 32c5 4 5 12 0 16" stroke="#d9442e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path class="qa o" d="M9 22c9-5 21-5 29 0 0 17-4 31-14 33C13 53 9 39 9 22z"/>
  <g class="qdk"><path d="M14 31c2-3 6-3 8 0l-4 2.5z"/><path d="M25 31c2-3 6-3 8 0l-4 2.5z"/><path d="M17 47c3-4 8-4 11 0-3-1.5-8-1.5-11 0z"/></g>
  <path class="qg o" d="M42 30c9-5 21-5 29 0 0 17-4 31-14 33-11-2-15-16-15-33z"/>
  <g class="qdk"><path d="M47 38c2 3 6 3 8 0l-4-1.5z"/><path d="M58 38c2 3 6 3 8 0l-4-1.5z"/><path d="M49 49c3 5 12 5 15 0z"/></g>`,
asclepius:`<circle cx="40" cy="40" r="30" class="qa" opacity=".25"/><rect class="qw o" x="37" y="8" width="6" height="62" rx="3"/>
  <path d="M33 62c13-4 13-10 1-14s-13-10 0-14 12-10 3-14" fill="none" stroke="#2a1608" stroke-width="8" stroke-linecap="round"/>
  <path d="M33 62c13-4 13-10 1-14s-13-10 0-14 12-10 3-14" fill="none" style="stroke:var(--ga)" stroke-width="5" stroke-linecap="round"/>
  <ellipse class="qad o" cx="36" cy="18" rx="5" ry="3.5"/><circle class="qwh" cx="35" cy="17" r="1"/>`,
flask:`<use href="#saSpark" class="qg" transform="translate(14 16) scale(1.3)"/><use href="#saSpark" class="qg" transform="translate(66 22)"/><use href="#saSpark" class="qg" transform="translate(62 8) scale(.8)"/>
  <path class="qwh o" d="M33 8h14v4h-2v15c10 4 16 12 16 22 0 12-10 21-21 21s-21-9-21-21c0-10 6-18 16-22V12h-2z" opacity=".92"/>
  <path class="qa o" d="M20 50c7-4 13 3 20 0s13-4 20 0c0 11-9 18-20 18s-20-7-20-18z"/>
  <g class="qwh"><circle cx="33" cy="57" r="2.2"/><circle cx="45" cy="61" r="1.6"/><circle cx="40" cy="42" r="1.6"/><circle cx="37" cy="34" r="1.2"/></g>`,
statue:`<rect class="qsd o" x="24" y="56" width="32" height="14"/><rect class="qs o" x="20" y="52" width="40" height="5"/><rect class="qa" x="30" y="60" width="20" height="5"/>
  <path class="qsl o" d="M22 52c0-10 8-14 18-14s18 4 18 14z"/><rect class="qsl o" x="35" y="31" width="10" height="9"/>
  <ellipse class="qsl o" cx="40" cy="23" rx="10" ry="12"/><path class="qs o" d="M30 22c0-10 6-14 12-13 6 0 10 5 9 12-2-4-5-6-8-6 0 2-3 4-6 3-2 1-4 2-7 4z"/>
  <path d="M29 25c2-4 4-6 7-7M51 25c-2-4-4-6-7-7" stroke="#f5c842" stroke-width="2.6" fill="none" stroke-linecap="round"/><path class="lnDk" d="M42 21v5l-2 1"/>`,
ship:`<path class="qa o" d="M42 13c11 6 15 18 13 33H42z"/><path class="qal o" d="M38 17c-9 6-13 16-11 29h11z"/><rect class="qwd o" x="38" y="8" width="4" height="46"/><path class="qg o" d="M42 8l9-3-9-3z"/>
  <path class="qw o" d="M10 50h60l-9 13H19z"/><g class="qdk"><circle cx="26" cy="55" r="1.8"/><circle cx="36" cy="55" r="1.8"/><circle cx="46" cy="55" r="1.8"/><circle cx="56" cy="55" r="1.8"/></g>
  <path class="qwa o" d="M4 62c6-3 12-3 18 0s12 3 18 0 12-3 18 0 12 3 18 0v8H4z"/><path d="M10 66c4-2 8-2 12 0M46 66c4-2 8-2 12 0" stroke="#9adcf8" stroke-width="1.6" fill="none"/>`,
// ── PART ──
fortress:`<rect class="qwd" x="17" y="6" width="2" height="18"/><path class="qa o" d="M19 7h13l-3 4.5 3 4.5H19z"/>
  <rect class="qs o" x="8" y="30" width="18" height="40"/><rect class="qs o" x="54" y="30" width="18" height="40"/><rect class="qsd o" x="24" y="40" width="32" height="30"/>
  <g class="qs o"><rect x="8" y="24" width="5" height="6"/><rect x="14.5" y="24" width="5" height="6"/><rect x="21" y="24" width="5" height="6"/><rect x="54" y="24" width="5" height="6"/><rect x="60.5" y="24" width="5" height="6"/><rect x="67" y="24" width="5" height="6"/></g>
  <g class="qsd o"><rect x="26" y="35" width="5" height="5"/><rect x="34" y="35" width="5" height="5"/><rect x="41" y="35" width="5" height="5"/><rect x="49" y="35" width="5" height="5"/></g>
  <path class="qdk o" d="M33 70V56a7 7 0 0 1 14 0v14z"/><path d="M33 60h14M33 64h14" stroke="#5c3516" stroke-width="1"/>
  <g class="qdk"><rect x="15" y="38" width="4" height="8" rx="2"/><rect x="61" y="38" width="4" height="8" rx="2"/><rect x="15" y="52" width="4" height="8" rx="2"/><rect x="61" y="52" width="4" height="8" rx="2"/></g>
  <path class="ln" d="M8 48h18M54 48h18M24 50h32M8 62h18M54 62h18"/>`,
horse:`<path class="qad o" d="M40 14c12 3 20 12 24 26 3 10 4 20 4 30h-8c0-12-1-22-4-30-3-10-8-17-16-21z"/>
  <path class="qa o" d="M30 70c0-12 2-18 4-22l-12 2c-6 1-10-2-10-7 0-5 3-8 6-10l14-15 4-10 5 7c10 3 17 12 19 26 2 10 2 20 1 29z"/>
  <path class="qad o" d="M36 8l-3-5 7 5z"/><circle class="qdk" cx="30" cy="27" r="2.6"/><circle class="qwh" cx="29.3" cy="26.2" r=".8"/><circle class="qdk" cx="16" cy="42" r="1.6"/>
  <path d="M19 36l14 6-3-13" stroke="#f5c842" stroke-width="2.2" fill="none" stroke-linejoin="round"/><circle class="qg o" cx="33" cy="42" r="2"/>`,
iwan:`<rect class="qsn o" x="6" y="30" width="68" height="40"/><rect class="qa o" x="6" y="26" width="68" height="5"/>
  <path class="qsnd o" d="M24 70V42c0-14 8-20 16-24 8 4 16 10 16 24v28z"/><path class="qdk" d="M29 70V43c0-10 5-16 11-19 6 3 11 9 11 19v27z"/>
  ${_giArch(9,50,5,7,'qsnd')}${_giArch(15.5,50,5,7,'qsnd')}${_giArch(59.5,50,5,7,'qsnd')}${_giArch(66,50,5,7,'qsnd')}
  ${_giArch(9,65,5,7,'qsnd')}${_giArch(15.5,65,5,7,'qsnd')}${_giArch(59.5,65,5,7,'qsnd')}${_giArch(66,65,5,7,'qsnd')}`,
firetemple:`<circle cx="40" cy="52" r="16" fill="url(#saGlow)" opacity=".7"/>
  <rect class="qsd o" x="10" y="64" width="60" height="6"/><rect class="qs o" x="14" y="34" width="52" height="30"/><path class="qs o" d="M16 34c0-14 11-22 24-22s24 8 24 22z"/>
  <rect class="qa o" x="14" y="32" width="52" height="4"/><path class="qdk o" d="M28 64V47c0-7 5-12 12-12s12 5 12 12v17z"/>
  ${_giArch(17,58,6,12,'qsd')}${_giArch(57,58,6,12,'qsd')}${_giFlame(40, 63, .62)}`,
amphora:`<path class="qfl o" d="M6 70c0-6 4-10 10-10s10 4 10 10z"/><circle class="qr" cx="13" cy="62" r="1.5"/><circle class="qfy" cx="18" cy="63" r="1.4"/>
  <path class="qw o" d="M54 70l2-10h16l2 10z"/><circle class="qr o" cx="60" cy="58" r="3.2"/><circle class="qg o" cx="67" cy="58" r="3.2"/>
  <path d="M32 22c-7 0-9 7-7 13M48 22c7 0 9 7 7 13" stroke="#2a1608" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  <path class="qa o" d="M33 10h14v5c0 3 7 5 9 13 3 13-2 27-8 36l-2 6H34l-2-6c-6-9-11-23-8-36 2-8 9-10 9-13z"/>
  <path class="qg o" d="M25 36h30v4H25z"/><path class="qad" d="M26 48h28v3H26zM30 56h20v2H30z"/><rect class="qw o" x="32" y="7" width="16" height="4" rx="1"/>`,
bridge:`<path class="qwa o" d="M4 56h72v14H4z"/><path d="M8 66c4-2 8-2 12 0M46 66c4-2 8-2 12 0" stroke="#9adcf8" stroke-width="1.6" fill="none"/>
  <rect class="qsl o" x="4" y="28" width="72" height="6"/><g class="qa o"><rect x="16" y="20" width="4" height="8"/><rect x="60" y="20" width="4" height="8"/></g><g class="qg o"><circle cx="18" cy="18" r="2.4"/><circle cx="62" cy="18" r="2.4"/></g>
  <path class="qs o" d="M4 34h72v36h-9v-8a7 7 0 0 0-14 0v8h-6v-8a7 7 0 0 0-14 0v8h-6v-8a7 7 0 0 0-14 0v8H4z"/>
  <path class="ln" d="M4 42h72M10 50h4M36 50h8M66 50h4"/>`,
// ── SASANİ ──
greatarch:`<rect class="qb o" x="4" y="34" width="72" height="36"/>
  <g class="qbd"><rect x="7" y="40" width="5" height="11" rx="2.5"/><rect x="7" y="55" width="5" height="11" rx="2.5"/><rect x="68" y="40" width="5" height="11" rx="2.5"/><rect x="68" y="55" width="5" height="11" rx="2.5"/></g>
  <path class="qbl o" d="M18 70V36C18 15 29 5 40 5s22 10 22 31v34z"/><path class="qdk o" d="M26 70V38c0-15 6-25 14-25s14 10 14 25v32z"/>
  <path d="M40 13v15" stroke="#f5c842" stroke-width="1"/><path class="qg o" d="M32 29l3 7h10l3-7-5 3-3-5-3 5z"/><rect class="qa o" x="33.5" y="36" width="13" height="3" rx="1"/>
  <path class="ln" d="M4 46h14M62 46h14M4 58h14M62 58h14"/>`,
books:`<rect class="qa o" x="10" y="58" width="46" height="11" rx="2"/><rect class="qwh" x="12" y="61" width="42" height="2"/>
  <rect class="qlp o" x="14" y="47" width="42" height="11" rx="2"/><rect class="qwh" x="16" y="50" width="38" height="2"/>
  <rect class="qr o" x="12" y="36" width="40" height="11" rx="2"/><rect class="qwh" x="14" y="39" width="36" height="2"/>
  <g class="qg"><rect x="20" y="58" width="3" height="11"/><rect x="46" y="47" width="3" height="11"/><rect x="20" y="36" width="3" height="11"/></g>
  <path class="qg o" d="M20 36c0-4 6-6 12-6s9 2 12 0c-2 4-6 6-12 6z"/><path class="qfl o" d="M44 29c2.5 2 3.5 4.5 1 7-2.5-1-3.5-4 -1-7z"/>
  <rect class="qwh o" x="60" y="30" width="10" height="39" rx="2"/><rect class="qw o" x="57.5" y="27" width="15" height="4.5" rx="2"/><rect class="qw o" x="57.5" y="67" width="15" height="4.5" rx="2"/><path class="ln" d="M63 36h4M63 42h4M63 48h4M63 54h4"/>`,
wheat:`<circle class="qg o" cx="64" cy="16" r="7"/>
  <g class="qg"><use href="#saWheat" transform="translate(14 54)"/><use href="#saWheat" transform="translate(24 52) scale(1.1)"/><use href="#saWheat" transform="translate(34 54)"/><use href="#saWheat" transform="translate(46 53) scale(1.05)"/><use href="#saWheat" transform="translate(56 54)"/><use href="#saWheat" transform="translate(66 53)"/></g>
  <path class="qsnd o" d="M4 70V52h72v18z"/><path class="qwa o" d="M4 58h72v6H4z"/><path d="M8 61h8M30 61h10M58 61h8" stroke="#9adcf8" stroke-width="1.4"/>
  <rect class="qw o" x="36" y="52" width="4" height="15"/><rect class="qw o" x="46" y="52" width="4" height="15"/><rect class="qa o" x="35" y="54" width="16" height="4"/>`,
helmet:`<path class="qa o" d="M40 4c6 0 8 4 6 8h-12c-2-4 0-8 6-8z"/><path class="qg o" d="M37.5 12h5l1 8h-7z"/>
  <path class="qsd o" d="M18 48h44v12c-6 7-14 9-22 9s-16-2-22-9z"/><path class="ln" d="M22 53h36M22 57h36M25 61h30M29 65h22" style="stroke:#cbc3b8"/>
  <path class="qsl o" d="M18 46c0-16 9-26 22-26s22 10 22 26z"/><path class="qs" d="M40 20c7 0 13 4 17 12l-6 3c-3-6-7-9-11-9z" opacity=".6"/>
  <path class="qg o" d="M18 44h44v5H18z"/><path class="qg o" d="M38 20h4v28h-4z"/><path class="qdk" d="M30 49h8v6h-8zM42 49h8v6h-8z"/><rect class="qg o" x="38.5" y="44" width="3" height="14"/>`,
throne:`<path class="qr o" d="M6 12h68v7c-8 5-16-2-16-2s-8 7-18 0c-10 7-18 0-18 0s-8 7-16 2z"/>
  <rect class="qsl o" x="8" y="19" width="6" height="45"/><rect class="qsl o" x="66" y="19" width="6" height="45"/>
  <rect class="qsd o" x="10" y="62" width="60" height="8"/><path class="qa o" d="M25 62V28c0-7 7-11 15-11s15 4 15 11v34z"/><path class="qad" d="M30 46V30c0-4 4-8 10-8s10 4 10 8v16z"/>
  <path class="qg o" d="M32 22l2-7 3 4 3-7 3 7 3-4 2 7z"/><rect class="qg o" x="21" y="45" width="38" height="8" rx="2"/><rect class="qgd o" x="23" y="53" width="5" height="9"/><rect class="qgd o" x="52" y="53" width="5" height="9"/>`,
firetower:`<circle cx="40" cy="16" r="18" fill="url(#saGlow)" opacity=".8"/>
  <path class="qs o" d="M27 70l3-44h20l3 44z"/><rect class="qsl o" x="24" y="22" width="32" height="6"/><g class="qsl o"><rect x="24" y="17" width="5" height="5"/><rect x="37.5" y="17" width="5" height="5"/><rect x="51" y="17" width="5" height="5"/></g>
  <rect class="qa" x="29.6" y="38" width="20.8" height="3"/><rect class="qa" x="28.6" y="53" width="22.8" height="3"/>${_giArch(37,70,6,9)}${_giArch(38,48,4,7)}${_giFlame(40, 22, .62)}`,
// ── İSLAM ──
mosque:`<rect class="qsn o" x="6" y="18" width="13" height="52"/><path class="qa o" d="M4 18l8.5-9 8.5 9z"/><rect class="qsnd o" x="4" y="31" width="17" height="3"/>${_giArch(10.5,28,4,6)}
  <rect class="qsn o" x="19" y="42" width="55" height="28"/><path class="qa o" d="M30 42c0-11 7-17 16-17s16 6 16 17z"/>${_giFinial(46,25)}
  <rect class="qsnd o" x="19" y="40" width="55" height="3"/>${_giArch(23,70,6,10)}${_giArch(33,70,6,10)}${_giArch(56,70,6,10)}${_giArch(66,70,6,10)}
  <path class="qdk o" d="M42 70V55a4 4 0 0 1 8 0v15z"/>`,
rahle:`<path class="qw o" d="M22 70l24-24h6L28 70z"/><path class="qw o" d="M58 70L34 46h-6l24 24z"/>
  <path class="qa o" d="M40 36c-8-6-19-8-31-6v21c12-2 23 0 31 6 8-6 19-8 31-6V30c-12-2-23 0-31 6z"/>
  <path class="qwh o" d="M40 34c-8-6-18-8-28-6v19c10-2 20 0 28 6z"/><path class="qwh o" d="M40 34c8-6 18-8 28-6v19c-10-2-20 0-28 6z"/>
  <path class="ln" d="M16 33c7-1 14 0 20 3M16 37c7-1 14 0 20 3M16 41c7-1 14 0 20 3M44 36c6-3 13-4 20-3M44 40c6-3 13-4 20-3M44 44c6-3 13-4 20-3"/>
  <path class="qg o" d="M40 34v22l-2-3-2 3V37z"/>`,
crescenttower:`<path class="qg o" d="M20 8a12 12 0 1 0 11 18 9.5 9.5 0 1 1-11-18z"/><path class="qg o" d="${_giStar(62, 16, 5, 5.5, 2.3)}"/>
  <rect class="qsn o" x="32" y="30" width="16" height="40"/><rect class="qsnd o" x="29" y="26" width="22" height="5"/><rect class="qsn o" x="35" y="16" width="10" height="10"/>
  <path class="qa o" d="M34 16l6-7 6 7z"/>${_giFinial(40,9)}<rect class="qa" x="32" y="42" width="16" height="3"/><rect class="qa" x="32" y="55" width="16" height="3"/>
  ${_giArch(38,40,4,8)}${_giArch(38,53,4,7)}${_giArch(37,70,6,9)}`,
bimaristan:`<rect class="qsn o" x="8" y="40" width="48" height="30"/><path class="qa o" d="M17 40c0-12 7-18 15-18s15 6 15 18z"/>${_giFinial(32,22)}
  <rect class="qsnd o" x="8" y="38" width="48" height="4"/><path class="qdk o" d="M27 70V56a5 5 0 0 1 10 0v14z"/>${_giArch(13,58,5,9)}${_giArch(46,58,5,9)}
  <path class="qal o" d="M62 70c-5-2-7-6-7-10s2-6 5-7v-4h10v4c3 1 5 3 5 7s-2 8-7 10z"/><rect class="qad o" x="59" y="45" width="12" height="4" rx="1"/>
  <path class="ql o" d="M65 64c-4-3-4-7 0-10 4 3 4 7 0 10z"/>`,
bazaar:`<rect class="qsn o" x="4" y="44" width="72" height="26"/>
  <g class="qa o"><path d="M6 44c0-8 5-12 10.5-12S27 36 27 44z"/><path d="M29.5 44c0-8 5-12 10.5-12s10.5 4 10.5 12z"/><path d="M53 44c0-8 5-12 10.5-12S74 36 74 44z"/></g>
  ${_giFinial(16.5,32)}${_giFinial(40,32)}${_giFinial(63.5,32)}<rect class="qsnd o" x="4" y="42" width="72" height="3"/>
  ${_giArch(8,70,9,16)}${_giArch(22,70,9,16)}${_giArch(35.5,70,9,16)}${_giArch(49,70,9,16)}${_giArch(63,70,9,16)}
  <g class="o"><path class="qr" d="M7 54h11l-2 4H9z"/><path class="qg" d="M21 54h11l-2 4h-7z"/><path class="ql" d="M34.5 54h11l-2 4h-7z"/><path class="qr" d="M48 54h11l-2 4h-7z"/><path class="qg" d="M62 54h11l-2 4h-7z"/></g>`,
garden:`<path class="ql o" d="M2 70V57h76v13z"/><path class="qsn o" d="M24 58V34h32v24z"/><path class="qa o" d="M22 34c0-8 8-13 18-13s18 5 18 13z"/>${_giFinial(40,21)}
  <path class="qdk" d="M34 58V44a6 6 0 0 1 12 0v14z"/>
  <ellipse class="qwa o" cx="40" cy="63" rx="19" ry="5"/><path d="M40 61c-2-6-6-9-10-9M40 61c2-6 6-9 10-9M40 61v-8" stroke="#9adcf8" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path class="qld o" d="M12 62c-5-9-5-32 0-44 5 12 5 35 0 44z"/><path class="qld o" d="M68 62c-5-9-5-32 0-44 5 12 5 35 0 44z"/>
  <g class="qpk"><circle cx="6" cy="62" r="1.8"/><circle cx="20" cy="66" r="1.8"/><circle cx="60" cy="66" r="1.8"/><circle cx="74" cy="62" r="1.8"/></g>`,
// ── ABBASİ ──
roundcity:`<ellipse class="qsnd o" cx="40" cy="55" rx="35" ry="15"/><ellipse class="qsn o" cx="40" cy="51" rx="35" ry="15"/><ellipse class="qsnd o" cx="40" cy="51" rx="27" ry="10"/>
  <ellipse class="qso" cx="40" cy="51" rx="20" ry="7"/><g class="qsn o"><rect x="22" y="47" width="6" height="5"/><rect x="52" y="47" width="6" height="5"/><rect x="30" y="54" width="6" height="4"/><rect x="45" y="54" width="6" height="4"/></g>
  <path class="qa o" d="M31 51c0-10 4-15 9-15s9 5 9 15z"/>${_giFinial(40,36)}<rect class="qsl o" x="30" y="49" width="20" height="4"/>
  <g class="qsnd o"><rect x="36" y="31" width="8" height="8"/><rect x="36" y="61" width="8" height="8"/><rect x="2" y="47" width="8" height="8"/><rect x="70" y="47" width="8" height="8"/></g>`,
observatory:`<use href="#saSpark" class="qg" transform="translate(10 12)"/><use href="#saSpark" class="qg" transform="translate(70 14) scale(1.2)"/>
  <path class="qw o" d="M28 70l7-9h10l7 9z"/><rect class="qwd o" x="38" y="56" width="4" height="6"/>
  <circle class="qg o" cx="40" cy="34" r="23"/><circle class="qa o" cx="40" cy="34" r="18"/><circle fill="none" stroke="#f5c842" stroke-width="1.6" cx="40" cy="34" r="12"/>
  <path d="M40 16v36M22 34h36" stroke="#f5c842" stroke-width="1.2"/><path class="qg o" d="M40 23l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><circle class="qg o" cx="40" cy="34" r="2.4"/>
  <path class="qg o" d="M36 11h8l-1-3h-6z"/>`,
palacebridge:`<rect class="qsn o" x="42" y="18" width="34" height="32"/><path class="qa o" d="M48 18c0-7 5-11 11-11s11 4 11 11z"/>${_giFinial(59,7)}${_giArch(55,50,8,12)}${_giArch(45,38,5,8)}${_giArch(68,38,5,8)}
  <path class="ql o" d="M8 50c-2-10 2-18 8-22 6 4 10 12 8 22z"/><rect class="qw" x="15" y="44" width="2" height="8"/>
  <path class="qwa o" d="M2 50h76v20H2z"/><rect class="qwd o" x="2" y="54" width="76" height="4"/>
  <g class="qw o"><path d="M4 58h15l-3 5h-9z"/><path d="M23 58h15l-3 5h-9z"/><path d="M42 58h15l-3 5h-9z"/><path d="M61 58h15l-3 5h-9z"/></g>
  <path d="M2 49c9 4 18 4 27 0s18-4 27 0 14 4 22 0" stroke="#f5c842" stroke-width="1.8" fill="none"/>`,
madrasa:`<path class="qa o" d="M28 28c0-10 5-16 12-16s12 6 12 16z"/>${_giFinial(40,12)}
  <rect class="qb o" x="6" y="28" width="68" height="42"/><rect class="qa o" x="6" y="28" width="68" height="5"/>
  <path class="qbd o" d="M25 70V42c0-9 6-15 15-18 9 3 15 9 15 18v28z"/><path class="qdk o" d="M30 70V44c0-6 4-11 10-14 6 3 10 8 10 14v26z"/>
  <path class="qal" d="M33 38l7-5 7 5-7 3z"/>${_giArch(10,64,10,16,'qbd')}${_giArch(60,64,10,16,'qbd')}
  <g class="qa"><rect x="10" y="38" width="10" height="3"/><rect x="60" y="38" width="10" height="3"/></g>`,
// ── MOĞOL ──
yurt:`<rect class="qwd o" x="68" y="10" width="2.6" height="60"/><path class="qg o" d="M69.3 3l2.8 7h-5.6z"/><path class="qdk o" d="M69.3 16c-4 4-6 10-4 17 2-3 3-3 4-2 1-1 2-1 4 2 2-7 0-13-4-17z"/>
  <path class="qwh o" d="M6 70V52c0-2 1-4 3-4h52c2 0 3 2 3 4v18z"/><path class="qwh o" d="M4 50c6-10 18-17 31-17s25 7 31 17z"/>
  <path class="qa" d="M6 55h58v4H6z"/><path class="qa" d="M4 50h62l-2-3H6z"/><ellipse class="qw o" cx="35" cy="33" rx="6" ry="2.2"/>
  <rect class="qa o" x="29" y="56" width="12" height="14"/><path class="qg" d="M31 58h8v2h-8zM31 63h8v2h-8z"/>
  <path d="M35 30c-2-5 3-7 1-12s2-6 1-9" stroke="#cbc3b8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`,
scaffold:`<path class="qb o" d="M8 70V40h14v-9h13v11h10v28z"/><path class="ln" d="M8 48h37M8 56h37M8 64h37M15 40v8M28 48v8M20 56v8M36 56v8M28 31v9"/>
  <rect class="qwd o" x="44" y="18" width="30" height="4"/><g class="qw o"><rect x="47" y="22" width="3" height="48"/><rect x="68" y="22" width="3" height="48"/><rect x="45" y="36" width="28" height="3"/><rect x="45" y="52" width="28" height="3"/></g>
  <path d="M50 39l18 13M50 52l18-13" stroke="#5c3516" stroke-width="2"/><path d="M60 22v14" stroke="#2a1608" stroke-width="1.2"/><path class="qs o" d="M56 30h8l-1 6h-6z"/>
  <g transform="rotate(-30 26 52)"><rect class="qw o" x="24" y="44" width="4.5" height="24" rx="1"/><rect class="qa o" x="16" y="37" width="20" height="9" rx="1.5"/></g>`,
bluedome:`<rect class="qsn o" x="6" y="22" width="8" height="48"/><rect class="qsn o" x="66" y="22" width="8" height="48"/><path class="qa o" d="M5 22l5-9 5 9zM65 22l5-9 5 9z"/>
  <g class="qa"><rect x="6" y="34" width="8" height="3"/><rect x="66" y="34" width="8" height="3"/><rect x="6" y="50" width="8" height="3"/><rect x="66" y="50" width="8" height="3"/></g>
  <rect class="qsn o" x="16" y="40" width="48" height="30"/><path class="qa o" d="M20 40c0-15 9-24 20-24s20 9 20 24z"/><path class="qal" d="M26 32c3-6 8-10 14-11v5c-5 1-9 4-11 8z"/>${_giFinial(40,16)}
  <rect class="qsnd o" x="18" y="38" width="44" height="4"/><path class="qa o" d="M31 70V54c0-5 4-9 9-10 5 1 9 5 9 10v16z"/><path class="qdk" d="M34.5 70V56c0-3 2.5-6 5.5-7 3 1 5.5 4 5.5 7v14z"/>
  ${_giArch(20,62,5,9)}${_giArch(55,62,5,9)}`,
caravan:`<rect class="qsnd o" x="4" y="28" width="56" height="42"/><rect class="qa o" x="4" y="24" width="56" height="5"/>
  <path class="qsn o" d="M18 70V44c0-7 5-12 12-12s12 5 12 12v26z"/><path class="qdk" d="M22 70V46c0-5 3-9 8-9s8 4 8 9v24z"/>${_giArch(7,44,6,10,'qsn')}${_giArch(47,44,6,10,'qsn')}
  <g class="qw o"><rect x="50" y="56" width="3.2" height="14"/><rect x="56" y="56" width="3.2" height="14"/><rect x="66" y="56" width="3.2" height="14"/><rect x="71" y="56" width="3.2" height="14"/>
  <path d="M47 60c0-7 4-11 10-11 2-6 9-7 11-1 5 0 8 5 8 12z"/><path d="M50 56c-3-2-6-9-7-15l-2-2c-3 0-6 0-7-2 0-3 3-4 7-4 3 0 6 2 7 5 1 5 3 10 5 13z"/></g>
  <path class="qa o" d="M56 49h11l1 8H55z"/><circle class="qdk" cx="39" cy="35.5" r="1.1"/>`,
// ── OSMANLI ──
omosque:`<rect class="qwh o" x="4" y="22" width="7" height="48"/><path class="qs o" d="M3.5 22L7.5 5l4 17z"/><rect class="qwh o" x="69" y="22" width="7" height="48"/><path class="qs o" d="M68.5 22L72.5 5l4 17z"/>
  <g class="qsd"><rect x="3" y="34" width="9" height="2.4"/><rect x="68" y="34" width="9" height="2.4"/><rect x="3" y="48" width="9" height="2.4"/><rect x="68" y="48" width="9" height="2.4"/></g>
  <rect class="qsl o" x="13" y="50" width="54" height="20"/><path class="qs o" d="M15 50c0-8 6-12 12-12h26c6 0 12 4 12 12z"/>
  <path class="qs o" d="M22 42c0-14 8-22 18-22s18 8 18 22z"/><path class="qsl" d="M27 34c3-6 7-9 13-10v5c-4 1-8 3-10 7z"/>${_giFinial(40,20)}
  <rect class="qsd o" x="20" y="40" width="40" height="3"/><path class="qa o" d="M33 70V58c0-4 3-7 7-7s7 3 7 7v12z"/><path class="qdk" d="M36 70V59c0-2 2-4 4-4s4 2 4 4v11z"/>
  ${_giArch(19,64,5,8)}${_giArch(26,64,5,8)}${_giArch(49,64,5,8)}${_giArch(56,64,5,8)}`,
opalace:`<path class="qs o" d="M34 28c0-5 3-8 6-8s6 3 6 8z"/>${_giFinial(40,20)}
  <rect class="qsl o" x="12" y="40" width="56" height="30"/><path class="qa o" d="M4 41l12-13h48l12 13z"/><rect class="qw o" x="4" y="40" width="72" height="3"/>
  <g class="qlp o"><rect x="17" y="46" width="6" height="7" rx="3"/><rect x="28" y="46" width="6" height="7" rx="3"/><rect x="46" y="46" width="6" height="7" rx="3"/><rect x="57" y="46" width="6" height="7" rx="3"/></g>
  <g class="qwh o"><rect x="17" y="57" width="3" height="13"/><rect x="27" y="57" width="3" height="13"/><rect x="50" y="57" width="3" height="13"/><rect x="60" y="57" width="3" height="13"/></g>
  <path class="qdk o" d="M35 70V54a5 5 0 0 1 10 0v16z"/><rect class="qw o" x="12" y="55" width="56" height="2.4"/>`,
anchor:`<path class="qwa o" d="M4 60c6-3 12-3 18 0s12 3 18 0 12-3 18 0 12 3 18 0v10H4z"/>
  <path class="qg o" fill-rule="evenodd" d="M40 3a7 7 0 1 1 0 14 7 7 0 1 1 0-14zm0 4a3 3 0 1 0 0 6 3 3 0 1 0 0-6z"/>
  <rect class="qg o" x="37" y="16" width="6" height="44"/><rect class="qg o" x="25" y="21" width="30" height="5" rx="2.5"/>
  <path class="qg o" d="M14 43c2 13 12 19 26 19s24-6 26-19l-7 3c-2 7-9 10-19 10s-17-3-19-10z"/><path class="qg o" d="M10 41l9 2-4 6zM70 41l-9 2 4 6z"/>
  <path d="M33 30c10 3 3 9 12 13" style="stroke:var(--ga)" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
// ── MEDENİYET / ÖZEL TAŞ SİMGELERİ ──
lion:`<path class="qad o" d="${_giStar(40, 40, 14, 34, 25)}"/><path class="qa o" d="${_giStar(40, 40, 14, 27, 21, -80)}"/>
  <circle class="qg o" cx="26" cy="25" r="5.5"/><circle class="qg o" cx="54" cy="25" r="5.5"/><circle class="qad" cx="26" cy="25" r="2.4"/><circle class="qad" cx="54" cy="25" r="2.4"/>
  <ellipse class="qg o" cx="40" cy="42" rx="16" ry="17"/><ellipse class="qdk" cx="33" cy="38" rx="2.3" ry="3"/><ellipse class="qdk" cx="47" cy="38" rx="2.3" ry="3"/>
  <ellipse class="qwh o" cx="40" cy="51" rx="9" ry="6.5"/><path class="qdk" d="M35.5 45h9l-4.5 4.5z"/><path class="lnDk" d="M40 49.5v3M35.5 54c2.5 2.2 6.5 2.2 9 0"/>`,
vergina:`<circle class="qa o" cx="40" cy="40" r="30"/><circle fill="none" stroke="#f5c842" stroke-width="3" cx="40" cy="40" r="25"/><circle class="qad" cx="40" cy="40" r="22"/>
  <path class="qg o" d="${_giStar(40, 40, 16, 19, 6)}"/><circle class="qg o" cx="40" cy="40" r="4"/>`,
bow:`<path d="M24 8c14 7 22 19 22 32S38 65 24 72" fill="none" stroke="#2a1608" stroke-width="8" stroke-linecap="round"/>
  <path d="M24 8c14 7 22 19 22 32S38 65 24 72" fill="none" style="stroke:var(--ga)" stroke-width="5" stroke-linecap="round"/>
  <path d="M24 8V72" stroke="#fff6e0" stroke-width="1.6"/><rect class="qg o" x="41" y="36" width="6" height="8" rx="1.5"/>
  <path d="M12 40h54" stroke="#2a1608" stroke-width="4.4"/><path d="M12 40h54" stroke="#e6c77f" stroke-width="2"/>
  <path class="qsl o" d="M76 40l-11-6v12z"/><path class="qr o" d="M8 40l-6-6h7l5 6-5 6H2z"/>`,
flame:`<circle cx="40" cy="44" r="30" fill="url(#saGlow)" opacity=".9"/>${_giFlame(40, 70, 1.75)}`,
crescent:`<path class="qg o" d="M43.5 10.2A30 30 0 1 0 68.5 49.5A24 24 0 1 1 43.5 10.2z"/><path class="qg o" d="${_giStar(57, 32, 5, 9, 3.8)}"/>`,
crown:`<path class="qg o" d="M12 58l-3-30 14 12 17-24 17 24 14-12-3 30z"/><rect class="qgd o" x="11" y="57" width="58" height="9" rx="2"/>
  <g class="o"><circle class="qr" cx="40" cy="47" r="4.5"/><circle class="qlp" cx="25" cy="50" r="3.2"/><circle class="qlp" cx="55" cy="50" r="3.2"/></g>
  <g class="qg o"><circle cx="9" cy="26" r="3.2"/><circle cx="40" cy="14" r="4"/><circle cx="71" cy="26" r="3.2"/></g><g class="qwh"><circle cx="20" cy="61.5" r="1.4"/><circle cx="40" cy="61.5" r="1.4"/><circle cx="60" cy="61.5" r="1.4"/></g>`,
astrolabe:`<circle class="qg o" cx="40" cy="42" r="27"/><circle class="qa o" cx="40" cy="42" r="21"/><circle fill="none" stroke="#f5c842" stroke-width="1.8" cx="40" cy="42" r="14"/>
  <path d="M40 21v42M19 42h42" stroke="#f5c842" stroke-width="1.4"/><path class="qg o" d="M40 29l3.5 9.5 9.5 3.5-9.5 3.5-3.5 9.5-3.5-9.5-9.5-3.5 9.5-3.5z"/><circle class="qg o" cx="40" cy="42" r="2.6"/>
  <path class="qg o" d="M35 16h10l-1.5-4h-7z"/><circle fill="none" stroke="#2a1608" stroke-width="5" cx="40" cy="7.5" r="4"/><circle fill="none" stroke="#f5c842" stroke-width="2.6" cx="40" cy="7.5" r="4"/>`,
tugra:`<circle class="qa o" cx="40" cy="40" r="32"/><circle fill="none" stroke="#f5c842" stroke-width="2" cx="40" cy="40" r="27"/>
  <g fill="none" stroke="#f5c842" stroke-width="3.4" stroke-linecap="round"><path d="M34 58V16M41 58V12M48 58V18"/><path d="M52 50c-10-8-30-10-34 0-3 8 10 10 18 4"/><path d="M50 56c-12 4-28 2-34-6"/><path d="M52 50c6-4 10-1 10 4"/></g>`,
};
GI_ART.books2 = GI_ART.books;

// Tek bir ikonu SVG olarak üretir. Boyut CSS'ten gelir (1em ≈ yazı boyu); --ga ikonun ana rengidir.
function giSVG(key, color, cls){
  const art = GI_ART[key];
  if(!art) return '';
  return `<svg class="sa gi${cls?' '+cls:''}" viewBox="0 0 80 80" style="--ga:${color||'#c4702a'}" aria-hidden="true" focusable="false">${art}</svg>`;
}

// Kısa yollar: yapı / medeniyet / özel taş ikonu (çizim yoksa emojiye düşer)
function bIcon(b){ b = typeof b==='number' ? BUILDINGS[b] : b; return !b ? '' : (b.art ? giSVG(b.art, b.color) : b.icon); }
function civIcon(c){ c = typeof c==='number' ? CIVILIZATIONS[c] : c; return !c ? '' : (c.art ? giSVG(c.art, c.color) : c.icon); }
function spIcon(key){ const s=SPECIAL_STONES[key]; return !s ? '' : (s.art ? giSVG(s.art, s.color) : s.badge); }
