// ══════════════════════════════════════════════
// MAĞAZA SVG SANATI — her ürün 80×80 viewBox, zemin çizgisi y=70
// Renkler CSS değişkenlerinden (.sa .q* sınıfları), ortak gradyan/desenler SA_DEFS'te
// ══════════════════════════════════════════════
const SA_DEFS = `<svg width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="saSkyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0520"/><stop offset=".7" stop-color="#241246"/><stop offset="1" stop-color="#3a1e52"/></linearGradient>
  <linearGradient id="saSkyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a50"/><stop offset=".55" stop-color="#9a4a5a"/><stop offset="1" stop-color="#f0a860"/></linearGradient>
  <linearGradient id="saWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a36"/><stop offset="1" stop-color="#241822"/></linearGradient>
  <radialGradient id="saGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".45" stop-color="#ff9a2e" stop-opacity=".45"/><stop offset="1" stop-color="#ff7a00" stop-opacity="0"/></radialGradient>
  <radialGradient id="saGlowC"><stop offset="0" stop-color="#d8fbff" stop-opacity=".95"/><stop offset=".45" stop-color="#7ae8ff" stop-opacity=".4"/><stop offset="1" stop-color="#9a5ae0" stop-opacity="0"/></radialGradient>
  <radialGradient id="saGlowR"><stop offset="0" stop-color="#ffb08a" stop-opacity=".9"/><stop offset=".5" stop-color="#ff4a2e" stop-opacity=".35"/><stop offset="1" stop-color="#ff2a00" stop-opacity="0"/></radialGradient>
  <linearGradient id="saBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#bff6ff" stop-opacity=".75"/><stop offset="1" stop-color="#bff6ff" stop-opacity="0"/></linearGradient>
  <linearGradient id="saGoldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a0"/><stop offset=".45" stop-color="#f5c842"/><stop offset="1" stop-color="#a8741e"/></linearGradient>
  <pattern id="saBrick" width="16" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill="#3a2a30"/><path d="M0 .5h16M0 5.5h16M8 .5v5M.5 5.5v5M15.5 5.5v5" stroke="#1e141a" stroke-width="1"/></pattern>
  <path id="saLeaf" d="M0 0q5-4.5 10 0q-5 4.5-10 0z"/>
  <g id="saFlower"><circle cx="0" cy="-3.2" r="2.6"/><circle cx="3" cy="-1" r="2.6"/><circle cx="1.9" cy="2.6" r="2.6"/><circle cx="-1.9" cy="2.6" r="2.6"/><circle cx="-3" cy="-1" r="2.6"/></g>
  <g id="saWheat"><path d="M0 0v-20" stroke="#b8862a" stroke-width="1.4" fill="none"/><ellipse cx="-1.6" cy="-22" rx="1.6" ry="2.6"/><ellipse cx="1.6" cy="-22" rx="1.6" ry="2.6"/><ellipse cx="-1.6" cy="-26" rx="1.5" ry="2.4"/><ellipse cx="1.6" cy="-26" rx="1.5" ry="2.4"/><ellipse cx="0" cy="-29.5" rx="1.4" ry="2.4"/></g>
  <path id="saLotus" d="M0 0q-9-1-10-8q7 0 10 8zM0 0q9-1 10-8q-7 0-10 8zM0 0q-5-6 0-13q5 7 0 13z"/>
  <path id="saCedar" d="M0-32l10 13h-5l9 11h-6l8 10h-32l8-10h-6l9-11h-5z"/>
  <path id="saSpark" d="M0-5l1.3 3.7 3.7 1.3-3.7 1.3-1.3 3.7-1.3-3.7-3.7-1.3 3.7-1.3z"/>
</defs></svg>`;

// Kart arka planları (kategoriye göre)
const SA_BG = {
  bina:`<rect x="-40" width="160" height="80" fill="url(#saSkyN)"/><path d="M66 8a7 7 0 1 0 5 12 6 6 0 1 1-5-12z" fill="#fff1bf"/>
    <g fill="#fff"><circle cx="12" cy="10" r=".9"/><circle cx="26" cy="6" r=".7"/><circle cx="50" cy="12" r=".8"/><circle cx="8" cy="28" r=".6"/><circle cx="74" cy="34" r=".7"/><circle cx="36" cy="18" r=".5"/><circle cx="-26" cy="14" r=".8"/><circle cx="-12" cy="36" r=".6"/><circle cx="94" cy="20" r=".8"/><circle cx="108" cy="44" r=".6"/><circle cx="-32" cy="50" r=".5"/></g>
    <rect x="-40" y="68" width="160" height="12" fill="#3a2412"/><path d="M-40 68.5h160" stroke="#7a5428" stroke-width="1.5"/><path d="M6 74h10M30 76h8M56 73h12" stroke="#5a3a1c" stroke-width="1"/>`,
  doga:`<rect x="-40" width="160" height="80" fill="url(#saSkyD)"/><circle cx="62" cy="52" r="9" fill="#ffd27a" opacity=".55"/>
    <path d="M-40 58q20-6 40 0t40 0 40 0 40-2V80H-40z" fill="#b9854a" opacity=".55"/>
    <path d="M-40 68q20-5 40 0t40 0 40 0V80H-40z" fill="#e6c77f"/><path d="M-40 72q20-4 40 0t40 0 40 0" stroke="#c9a45a" fill="none"/><g fill="#b09070"><ellipse cx="-24" cy="74" rx="3" ry="1.8"/><ellipse cx="100" cy="75" rx="3.4" ry="2"/></g>`,
  dekor:`<rect x="-40" width="160" height="80" fill="url(#saBrick)"/><rect x="-40" width="160" height="80" fill="url(#saWall)" opacity=".55"/>
    <path d="M-34 70V30h14v40zM100 70V30h14v40z" fill="#140c14" opacity=".35"/><path d="M16 70V26a24 24 0 0 1 48 0v44z" fill="#140c14" opacity=".55"/><path d="M16 70V26a24 24 0 0 1 48 0v44" fill="none" stroke="#b8862a" stroke-width="1.2" opacity=".6"/>
    <rect x="-40" y="68" width="160" height="12" fill="#2a1e1a"/><path d="M-40 68.5h160" stroke="#6a5448" stroke-width="1.5"/>`,
  isik:`<rect x="-40" width="160" height="80" fill="#0a0418"/><rect x="-40" width="160" height="80" fill="url(#saSkyN)" opacity=".6"/>
    <g fill="#fff"><circle cx="10" cy="12" r=".8"/><circle cx="70" cy="8" r=".7"/><circle cx="66" cy="30" r=".6"/><circle cx="14" cy="40" r=".6"/><circle cx="-22" cy="20" r=".8"/><circle cx="100" cy="16" r=".7"/><circle cx="112" cy="40" r=".6"/></g>
    <rect x="-40" y="68" width="160" height="12" fill="#1e1210"/><path d="M-40 68.5h160" stroke="#4a3424" stroke-width="1.5"/>`,
};

// Ürün çizimleri (yalnızca nesne; kartta arka plan, haritada gölge eklenir)
const SA_ART = {
// ── BİNALAR ──
b01:`<rect class="qbd o" x="12" y="56" width="56" height="14"/><rect class="qb o" x="20" y="42" width="40" height="14"/>
  <rect class="qbl o" x="28" y="28" width="24" height="14"/><rect class="qg o" x="34" y="19" width="12" height="9"/><path class="qg o" d="M40 9l4 10h-8z"/>
  <rect class="qlp" x="20.8" y="42.8" width="38.4" height="3"/><rect class="qlp" x="12.8" y="56.8" width="54.4" height="3"/>
  <path class="qdk" d="M35 70v-7a5 5 0 0 1 10 0v7z"/><rect class="qdk" x="25" y="47" width="5" height="6" rx="1"/><rect class="qdk" x="50" y="47" width="5" height="6" rx="1"/>
  <rect class="qdk" x="37.5" y="31" width="5" height="6" rx="2.5"/><path class="ln" d="M16 64h8M56 64h8M24 51h6M50 51h6"/>`,
b02:`<path class="qbd o" d="M29 70l3-44h16l3 44z"/><rect class="qb o" x="25" y="18" width="30" height="9"/>
  <path class="qb o" d="M25 18v-6h5v6M33 18v-6h5v6M42 18v-6h5v6M50 18v-6h5v6"/><rect class="qlp" x="25.8" y="24" width="28.4" height="2.4"/>
  <circle class="qg" cx="30" cy="25.2" r=".9"/><circle class="qg" cx="40" cy="25.2" r=".9"/><circle class="qg" cx="50" cy="25.2" r=".9"/>
  <rect class="qdk" x="38.5" y="33" width="3" height="9" rx="1.5"/><rect class="qdk" x="38.5" y="47" width="3" height="8" rx="1.5"/>
  <path class="qdk" d="M36 70v-6a4 4 0 0 1 8 0v6z"/><path class="ln" d="M32 40h5M43 52h5M33 60h5"/>`,
b03:`<rect class="qw o" x="14" y="28" width="4" height="42"/><rect class="qw o" x="62" y="28" width="4" height="42"/>
  <path class="qr o" d="M9 30l7-13h48l7 13z"/><path class="qwh" d="M26 17l-3.5 13h8L33 17zM47 17l2.5 13h8L54 17z" opacity=".9"/>
  <path class="qr o" d="M9 30q3 6 6.5 0q3 6 6.5 0q3 6 6.5 0q3 6 6.5 0q3 6 6.5 0q3 6 6.5 0q3 6 6.5 0q3 6 6.5 0z"/>
  <rect class="qwd o" x="13" y="50" width="54" height="7"/><rect class="qw o" x="15" y="57" width="50" height="13"/>
  <path class="qlp" d="M15 57h50v4l-5 3-5-3-5 3-5-3-5 3-5-3-5 3-5-3-5 3-5-3z"/>
  <circle class="qfl o" cx="23" cy="46" r="4"/><circle class="qfy o" cx="31" cy="46" r="4"/><circle class="ql o" cx="39" cy="46.5" r="3.5"/>
  <path class="qbl o" d="M48 50q-2-6 1-9h-1v-3h8v3h-1q3 3 1 9z"/><path class="qpu o" d="M58 50l2-7h4l2 7z"/>`,
b04:`<path class="qbd o" d="M12 70V53a19 19 0 0 1 38 0v17z"/><path class="ln" d="M14 57h34M13 64h36M22 44h18"/>
  <path class="qdk" d="M24 70v-8a7 7 0 0 1 14 0v8z"/><path class="qfl sa-flick" d="M26 70q2-9 5-5q2-5 5 5z"/>
  <rect class="qb o" x="35" y="24" width="7" height="12"/><circle class="sa-smoke" fill="#efe8e0" cx="41" cy="18" r="3.4" opacity=".6"/><circle class="sa-smoke d2" fill="#efe8e0" cx="45" cy="11" r="4.2" opacity=".4"/>
  <path class="qb o" d="M53 70q-5-8 0-15h-1v-3h9v3h-1q5 7 0 15z"/><rect class="qlp" x="52.5" y="61" width="10" height="2.2"/>
  <path class="qbl o" d="M65 70q-3-6 0-11h-1v-2h7v2h-1q3 5 0 11z"/>`,
b05:`<rect class="qb o" x="12" y="30" width="56" height="40"/>
  <path class="qb o" d="M12 30v-5h2.5v-3h6v3H23v5M26.5 30v-5H29v-3h6v3h2.5v5M42.5 30v-5H45v-3h6v3h2.5v5M57 30v-5h2.5v-3h6v3H68v5"/>
  <rect class="qlp o" x="12" y="35" width="56" height="6"/>
  <g class="qg"><circle cx="20" cy="38" r="1.6"/><circle cx="31" cy="38" r="1.6"/><circle cx="49" cy="38" r="1.6"/><circle cx="60" cy="38" r="1.6"/></g>
  <path class="qdk o" d="M32 70V57a8 8 0 0 1 16 0v13z"/><path class="lnG" d="M30 70V57a10 10 0 0 1 20 0v13"/>
  <rect class="qdk" x="19" y="47" width="3" height="9" rx="1.5"/><rect class="qdk" x="58" y="47" width="3" height="9" rx="1.5"/>
  <path class="ln" d="M12 50h7M61 50h7M12 62h16M52 62h16"/>`,
b06:`<rect class="qsd o" x="9" y="64" width="62" height="6"/><rect class="qs o" x="13" y="59" width="54" height="5"/>
  <g class="qsl o"><rect x="17" y="35" width="7" height="24"/><rect x="29" y="35" width="7" height="24"/><rect x="44" y="35" width="7" height="24"/><rect x="56" y="35" width="7" height="24"/></g>
  <g class="qs"><rect x="16" y="34" width="9" height="2.5"/><rect x="28" y="34" width="9" height="2.5"/><rect x="43" y="34" width="9" height="2.5"/><rect x="55" y="34" width="9" height="2.5"/></g>
  <rect class="qs o" x="12" y="29" width="56" height="5"/><rect class="qlp" x="12.8" y="30.5" width="54.4" height="2"/>
  <path class="qsl o" d="M10 29l30-16 30 16z"/><circle class="qg o" cx="40" cy="23" r="3.2"/><path class="lnD" d="M20.5 40v16M32.5 40v16M47.5 40v16M59.5 40v16"/>`,
b07:`<rect class="qbl o" x="18" y="40" width="44" height="30"/><rect class="qb o" x="6" y="27" width="15" height="43"/><rect class="qb o" x="59" y="27" width="15" height="43"/>
  <path class="qb o" d="M6 27v-4h4v4M11.5 27v-4h4v4M17 27v-4h4v4M59 27v-4h4v4M64.5 27v-4h4v4M70 27v-4h4v4"/>
  <rect class="qb o" x="31" y="27" width="18" height="13"/><path class="qg o" d="M29 27a11 11 0 0 1 22 0z"/><path class="qg o" d="M40 8l2 8h-4z"/>
  <path class="lnD" d="M13.5 23v-9"/><path class="qr" d="M13.5 14l7 2.5-7 2.5z"/>
  <rect class="qlp" x="18.8" y="43" width="42.4" height="3"/><g class="qg"><circle cx="24" cy="44.5" r="1"/><circle cx="56" cy="44.5" r="1"/></g>
  <path class="qdk o" d="M33 70V57a7 7 0 0 1 14 0v13z"/><path class="lnG" d="M31 70V57a9 9 0 0 1 18 0v13"/>
  <g class="qdk"><rect x="11" y="34" width="5" height="7" rx="2.5"/><rect x="64" y="34" width="5" height="7" rx="2.5"/><rect x="11" y="50" width="5" height="7" rx="2.5"/><rect x="64" y="50" width="5" height="7" rx="2.5"/><rect x="37.5" y="30" width="5" height="7" rx="2.5"/></g>`,
b08:`<rect class="qsd o" x="9" y="64" width="62" height="6"/><rect class="qbd o" x="22" y="32" width="36" height="32"/>
  <path class="lnD" d="M22 43h36M22 53h36"/><g class="qsn"><rect x="25" y="35" width="4" height="7"/><rect x="31" y="36" width="4" height="6"/><rect x="45" y="35" width="4" height="7"/><rect x="51" y="36" width="4" height="6"/><rect x="26" y="46" width="4" height="6"/><rect x="48" y="45" width="4" height="7"/></g>
  <g class="qsl o"><rect x="12" y="32" width="8" height="32"/><rect x="60" y="32" width="8" height="32"/></g>
  <rect class="qs o" x="10" y="26" width="60" height="6"/><rect class="qg" x="10.8" y="28" width="58.4" height="1.6"/><path class="qsl o" d="M8 26l32-12 32 12z"/>
  <rect class="qsn o" x="33" y="54" width="14" height="16" rx="2"/><path class="lnDk" d="M36 58l2.5 1.2M41 58l2.5 1.2M36 62l2.5 1.2M41 62l2.5 1.2M36 66l2.5 1.2"/>`,
b09:`<rect class="qb o" x="15" y="46" width="50" height="24"/><path class="qsl o" d="M17 46a23 23 0 0 1 46 0z"/>
  <path class="qs" d="M40 23a23 23 0 0 1 23 23H48a8 23 0 0 0-8-23z" opacity=".55"/><path class="qdk" d="M37 24h6v22h-6z"/>
  <g transform="rotate(-38 40 30)"><rect class="qg o" x="38" y="25" width="26" height="6.5" rx="2"/><rect class="qgd o" x="61" y="24" width="5" height="8.5" rx="1.5"/></g>
  <rect class="qlp" x="15.8" y="46.8" width="48.4" height="3"/><path class="qdk o" d="M35 70v-9a5 5 0 0 1 10 0v9z"/>
  <rect class="qdk" x="21" y="54" width="5" height="6" rx="2.5"/><rect class="qdk" x="54" y="54" width="5" height="6" rx="2.5"/>`,
// ── DOĞA ──
n01:`<ellipse class="qs o" cx="22" cy="68" rx="4.5" ry="2.6"/><ellipse class="qsl o" cx="60" cy="69" rx="3.4" ry="2"/><ellipse class="qsd o" cx="66" cy="68.5" rx="2.2" ry="1.6"/>
  <path class="qw o" d="M36 70q-3-22 8-45l5 2q-9 22-6 43z"/><path class="lnD" d="M37 63h6M37.5 55h6M39 47h6M41 39h5.5M43 32h5"/>
  <path class="qld o" d="M47 26q-19-7-29 6q14-5 29-6z"/><path class="ql o" d="M47 26q-10-16-27-13q16 3 27 13z"/><path class="qll o" d="M47 26q6-18 23-16q-14 5-23 16z"/>
  <path class="ql o" d="M47 26q19-3 27 9q-12-6-27-9z"/><path class="qld o" d="M47 26q3 9 13 15q-12-4-13-15z"/>
  <circle class="qr" cx="45" cy="30" r="2"/><circle class="qfl" cx="49" cy="31" r="2"/><circle class="qr" cx="47" cy="33.5" r="1.8"/>`,
n02:`<rect class="qbl o" x="16" y="20" width="48" height="50"/><path class="ln" d="M16 30h48M16 40h48M16 50h48M16 60h48M28 20v10M44 20v10M36 30v10M52 30v10M24 40v10M44 40v10M32 50v10M52 50v10M40 60v10"/>
  <path class="vine" d="M28 70C20 58 38 50 30 40C23 31 42 27 36 16"/><path class="vine" d="M50 70C57 60 43 52 51 43C59 35 47 30 55 21"/>
  <g class="ql o"><use href="#saLeaf" transform="translate(24 62) rotate(-30)"/><use href="#saLeaf" transform="translate(33 50) rotate(20)"/><use href="#saLeaf" transform="translate(25 41) rotate(-150)"/><use href="#saLeaf" transform="translate(37 31) rotate(-10)"/><use href="#saLeaf" transform="translate(32 22) rotate(-160)"/></g>
  <g class="qll o"><use href="#saLeaf" transform="translate(54 64) rotate(-20)"/><use href="#saLeaf" transform="translate(46 52) rotate(-170)"/><use href="#saLeaf" transform="translate(56 40) rotate(-30)"/><use href="#saLeaf" transform="translate(48 31) rotate(-150)"/><use href="#saLeaf" transform="translate(56 23) rotate(-40)"/></g>
  <g class="qpk"><circle cx="31" cy="36" r="1.8"/><circle cx="52" cy="47" r="1.8"/></g>`,
n03:`<path class="qso o" d="M7 70q2-13 33-13t33 13z"/><path class="qs" d="M9 68q3-9 31-9t31 9" fill="none" stroke-dasharray="3 2" stroke="#9a918a" stroke-width="2"/>
  <path class="vine" d="M18 64v-12M29 62v-17M40 62v-13M51 62v-17M62 64v-11"/>
  <g class="ql o"><use href="#saLeaf" transform="translate(18 58) rotate(-40) scale(.8)"/><use href="#saLeaf" transform="translate(29 55) rotate(-140) scale(.8)"/><use href="#saLeaf" transform="translate(51 55) rotate(-40) scale(.8)"/><use href="#saLeaf" transform="translate(62 59) rotate(-140) scale(.8)"/></g>
  <use href="#saFlower" class="qr o" x="18" y="50"/><use href="#saFlower" class="qpk o" x="29" y="43"/><use href="#saFlower" class="qfy o" x="40" y="47"/><use href="#saFlower" class="qpu o" x="51" y="43"/><use href="#saFlower" class="qr o" x="62" y="51"/>
  <g class="qwh"><circle cx="18" cy="50" r="1.4"/><circle cx="29" cy="43" r="1.4"/><circle cx="51" cy="43" r="1.4"/><circle cx="62" cy="51" r="1.4"/></g><circle class="qfl" cx="40" cy="47" r="1.4"/>`,
n04:`<path class="qsnd o" d="M5 70l11-18h48l11 18z"/><path class="lnD" d="M13 57h54M10 62h60M7 67h66"/>
  <g class="qg"><use href="#saWheat" x="14" y="66"/><use href="#saWheat" x="22" y="60"/><use href="#saWheat" x="30" y="66"/><use href="#saWheat" x="38" y="59"/><use href="#saWheat" x="46" y="66"/><use href="#saWheat" x="54" y="60"/><use href="#saWheat" x="62" y="66"/></g>`,
n05:`<ellipse class="qs o" cx="40" cy="58" rx="33" ry="13"/><ellipse class="qwa" cx="40" cy="57" rx="27" ry="9"/>
  <path class="rip sa-rip" d="M27 56q7-3 14 0M40 60q6-2 12 0"/><ellipse fill="#fff" opacity=".45" cx="50" cy="54" rx="6" ry="1.4"/>
  <g class="qsl o"><ellipse cx="12" cy="56" rx="4" ry="3"/><ellipse cx="22" cy="67" rx="4.5" ry="3"/><ellipse cx="58" cy="67.5" rx="4.5" ry="3"/><ellipse cx="68" cy="55" rx="4" ry="3"/></g>
  <path class="vine" d="M66 49q2-12-1-20M69 49q3-9 3-16M63 49q-1-8-4-13"/><g class="qwd"><ellipse cx="65" cy="29" rx="1.6" ry="4"/><ellipse cx="72" cy="33" rx="1.4" ry="3.4"/></g>`,
n06:`<path class="qw o" d="M33 70q3-12 1-24h12q-2 12 1 24z"/><path class="qw o" d="M33 70q-5 0-7 2h9zM47 70q5 0 7 2h-9z"/><path class="lnD" d="M38 52q2 6 0 12M43 50v8"/>
  <circle class="qld o" cx="24" cy="36" r="13"/><circle class="qld o" cx="56" cy="36" r="13"/><circle class="ql o" cx="40" cy="25" r="16"/>
  <circle class="ql o" cx="29" cy="43" r="10"/><circle class="ql o" cx="51" cy="43" r="10"/><circle class="qll" cx="35" cy="20" r="6"/><circle class="qll" cx="22" cy="31" r="4"/>
  <g class="qb"><ellipse cx="46" cy="36" rx="1.6" ry="2"/><ellipse cx="30" cy="30" rx="1.6" ry="2"/><ellipse cx="56" cy="44" rx="1.6" ry="2"/></g>`,
n07:`<ellipse class="qs o" cx="40" cy="57" rx="34" ry="14"/><ellipse class="qwa" cx="40" cy="56" rx="28" ry="10"/><path class="rip sa-rip" d="M20 58q6-2 12 0M46 61q6-2 12 0"/>
  <g class="ql o"><path d="M24 55a6 3 0 1 0 6-1l-3 1z"/><path d="M50 60a6 3 0 1 0 6-1l-3 1z"/><path d="M52 51a5 2.5 0 1 0 5-1l-2.5 1z"/></g>
  <use href="#saLotus" class="qpk o" x="30" y="55"/><use href="#saLotus" class="qpk o" transform="translate(52 51) scale(.8)"/><circle class="qfy" cx="30" cy="52" r="1.5"/>`,
n08:`<g class="qw o"><rect x="21.5" y="60" width="4" height="10"/><rect x="54.5" y="60" width="4" height="10"/><rect x="38" y="62" width="4.5" height="8"/></g>
  <use href="#saCedar" class="qld o" transform="translate(23.5 61) scale(.85)"/><use href="#saCedar" class="qld o" transform="translate(56.5 61) scale(.9)"/><use href="#saCedar" class="ql o" transform="translate(40 63) scale(1.12)"/>
  <path class="lnL" d="M33 44l7-6 7 6M31 54l9-6 9 6"/>`,
// ── DEKOR ──
d01:`<rect class="qsd o" x="23" y="60" width="34" height="10"/><rect class="qs o" x="20" y="56" width="40" height="5"/><rect class="qg" x="20.8" y="57.5" width="38.4" height="1.5"/>
  <path class="qsl o" d="M30 56l3-22h14l3 22z"/><path class="lnD" d="M36 38l-2 17M44 38l2 17"/><rect class="qg" x="33" y="44" width="14" height="2.2"/>
  <path class="qs o" d="M33 37q7 7 14 0v3q-7 7-14 0z"/><circle class="qsl o" cx="40" cy="28" r="6"/><g fill="#3a2410"><circle cx="37.8" cy="27.2" r=".9"/><circle cx="42.2" cy="27.2" r=".9"/></g><path class="qs o" d="M35.5 31.5q4.5 9 9 0q-4.5 2-9 0z"/><path class="lnDk" d="M38 35.5l.5 2M42 35.5l-.5 2"/>
  <path class="qg o" d="M34 24l1-10h10l1 10z"/><path class="lnDk" d="M35 18h10M35 21h10"/><rect class="qg o" x="51" y="22" width="2.6" height="34"/><circle class="qg o" cx="52.3" cy="19.5" r="3"/>`,
d02:`<path class="qs o" d="M29 70l3-6h16l3 6z"/><rect class="qw o" x="38" y="12" width="4" height="52"/><circle class="qg o" cx="40" cy="10.5" r="3"/>
  <path class="qr o sa-wave" d="M42 14l27 8-27 8z"/><path class="qlp sa-wave" d="M42 18l14 4-14 4z" opacity=".85"/><circle class="qg" cx="47" cy="22" r="1.8"/>`,
d03:`<rect class="qwd o" x="12" y="64" width="56" height="6"/><rect class="qw o" x="15" y="24" width="4" height="40"/><rect class="qw o" x="61" y="24" width="4" height="40"/><rect class="qw o" x="13" y="30" width="54" height="4"/>
  <path class="lnW" d="M26 64V16"/><path class="qsl o" d="M26 8l3 9h-6z"/><path class="qr" d="M24 18l4 0-2 4z"/>
  <path class="qsl o" d="M52 58V20l3-6 3 6v38z"/><rect class="qg o" x="48.5" y="55" width="13" height="3"/><rect class="qwd o" x="53.5" y="58" width="3" height="6"/><circle class="qg" cx="55" cy="65" r="1.6"/>
  <circle class="qr o" cx="38" cy="47" r="11"/><circle fill="none" class="lnG" cx="38" cy="47" r="8"/><circle class="qg o" cx="38" cy="47" r="3.6"/>`,
d04:`<path class="o" d="M29 70q-12-14-4-30q2-4 6-6v-6h18v6q4 2 6 6q8 16-4 30z" fill="url(#saGoldG)"/><rect class="qgd o" x="29" y="23" width="22" height="5" rx="2"/>
  <rect class="qlp" x="25" y="49" width="30" height="3.2"/><path class="lnGd" d="M24.5 45h31M25.5 57h29"/><path d="M31 39q-5 11 0 23q-2-12 3-21z" fill="#fff" opacity=".55"/>
  <use href="#saSpark" class="qwh sa-tw" x="58" y="30"/><g transform="translate(24 36) scale(.6)"><use href="#saSpark" class="qwh sa-tw d2"/></g>`,
d05:`<path class="qs o" d="M27 70l4-6h18l4 6z"/><ellipse class="qlpd o" cx="40" cy="40" rx="20" ry="24"/><ellipse class="qwh" cx="40" cy="40" rx="13" ry="16"/>
  <ellipse class="qwa" cx="40" cy="40" rx="8" ry="10"/><ellipse fill="#0e1a3a" cx="40" cy="40" rx="4" ry="5"/><circle fill="#fff" cx="37.5" cy="36.5" r="1.7"/><ellipse fill="none" class="lnG" cx="40" cy="40" rx="20" ry="24"/>`,
d06:`<rect class="qsd o" x="15" y="64" width="50" height="6"/><path class="qlp o" d="M19 64V22q0-8 8-8h26q8 0 8 8v42z"/><path fill="none" class="lnG" d="M22 61V23q0-6 6-6h24q6 0 6 6v38"/>
  <path class="qg" d="M30 44q-7 0-8-7q-1-6 3-10q2-2 1-5l3 1-1 3q-3 4-2 8q1 5 5 5h13q2-5 2-11q0-4 2-6l-1-5 3 3 1-4 2 4q4 0 6 2l2 1-3 1 3 2-4 1q-2 1-3 4q-1 7-4 13l3 10h-3l-3-8h-2l1 8h-3l-2-8h-9l-2 8h-3l1-8-3 8h-3l2-9z"/>
  <path d="M59 27l3-.5M59 27l3 1" stroke="#ff7a5a" stroke-width=".8" fill="none"/><path d="M25 21l-2-3 3 1z" class="qg"/>
  <g fill="#1d3c86"><circle cx="53.2" cy="25" r=".9"/><circle cx="34" cy="41.5" r=".7"/><circle cx="38" cy="41.5" r=".7"/><circle cx="42" cy="41.5" r=".7"/><circle cx="36" cy="44" r=".7"/><circle cx="40" cy="44" r=".7"/><circle cx="51" cy="34" r=".7"/><circle cx="50" cy="38" r=".7"/></g><g class="qg"><circle cx="26" cy="20" r="1.2"/><circle cx="54" cy="56" r="1.2"/></g>`,
d07:`<rect class="qsd o" x="13" y="62" width="54" height="8"/><rect class="qs o" x="11" y="58" width="58" height="5"/><rect class="qlp" x="11.8" y="59.3" width="56.4" height="2"/>
  <path class="qsl o" d="M20 44q0-10 12-10h14q6 0 8-4l6 2q4 2 2 8l-2 4q-2 4-6 4v10h-5v-8H35v8h-5v-10q-4 0-6-4z"/>
  <path class="lnS" d="M20 44q-5 4-3 10"/><path class="qg o" d="M57 31q2-9 9-8q-5 3-6 9z"/><circle fill="#2a1608" cx="59.5" cy="36.5" r="1.2"/><rect class="qg" x="50" y="39" width="3" height="9"/>`,
d08:`<rect class="qsd o" x="21" y="66" width="38" height="4"/><rect class="qs o" x="25" y="52" width="30" height="14"/><rect class="qsd o" x="21" y="48" width="38" height="5"/>
  <path class="lnD" d="M31 54v10M40 54v10M49 54v10"/>
  <path class="qsl o" d="M22 48l1-9q2-6 10-6h11l5 15h-4l-1-6H34l-1 6h-4l-1-6-1 6z"/><path class="lnS" d="M23 42q-6-2-6-9"/><circle class="qg" cx="17" cy="32" r="2"/>
  <circle class="qg o" cx="47" cy="31" r="9.5"/><circle class="qsl o" cx="50" cy="32.5" r="5.5"/><path class="qsl o" d="M53 33h4.5q1 3-2 4H53z"/><circle class="qg" cx="50.6" cy="30.6" r="1.3"/>`,
// ── IŞIK ──
l01:`<circle class="sa-glow" cx="40" cy="20" r="20" fill="url(#saGlow)"/><path class="qs o" d="M31 70l3-5h12l3 5z"/><path class="qw o" d="M37.5 65l1-39h3l1 39z"/>
  <path class="lnD" d="M38 32l4 2M38 38l4 2M38 44l4 2"/><path class="qgd o" d="M30 25h20l-4 7H34z"/>
  <g class="sa-flame"><path class="qfl" d="M40 3q11 10 8 19q-2 4-8 4t-8-4q-3-9 8-19z"/><path class="qfy" d="M40 10q6 6 4 12q-1 2-4 2t-4-2q-2-6 4-12z"/></g>`,
l02:`<circle class="sa-glow" cx="40" cy="44" r="22" fill="url(#saGlow)"/><rect class="qs o" x="30" y="62" width="20" height="8"/><path class="qgd o" d="M32 56h16l2 6H30z"/>
  <circle class="qfy" cx="40" cy="44" r="12" opacity=".85"/><g class="sa-flame"><path class="qfl" d="M40 36q6 6 4 11q-1 2-4 2t-4-2q-2-5 4-11z"/></g>
  <circle fill="none" class="lnGd" cx="40" cy="44" r="13"/><path class="lnGd" d="M40 31v26M28 40q12 8 24 0M28 48q12-8 24 0" fill="none"/>
  <path class="qgd o" d="M31 32h18l-3-6H34z"/><path fill="none" class="lnGd" d="M34 26q6-13 12 0"/>`,
l03:`<circle class="sa-glow" cx="48" cy="40" r="20" fill="url(#saGlowR)"/><rect class="qw o" x="16" y="10" width="4" height="60"/><rect class="qw o" x="16" y="10" width="36" height="4"/><path class="qs o" d="M12 70l3-4h6l3 4z"/>
  <g class="sa-sway"><path class="lnD" d="M48 14v9"/><rect class="qgd o" x="42" y="23" width="12" height="4" rx="1"/>
  <ellipse class="qr o" cx="48" cy="38" rx="11" ry="12"/><ellipse class="qfy" cx="48" cy="38" rx="5" ry="8" opacity=".45"/><path class="lnDr" d="M42 28q-3 10 0 20M54 28q3 10 0 20M48 26v24"/>
  <rect class="qgd o" x="42" y="49" width="12" height="4" rx="1"/><path class="lnG" d="M48 53v9"/><path class="qg" d="M46 60h4l-1 5h-2z"/></g>`,
l04:`<circle class="sa-glow" cx="40" cy="36" r="26" fill="url(#saGlowC)"/><path class="qsd o" d="M28 70l4-7h16l4 7z"/><path class="qpu o" d="M31 63l4-6h10l4 6z"/>
  <g class="sa-float"><path class="qcr o" d="M40 10l12 18-12 28-12-28z"/><path d="M40 10l-12 18h12z" fill="#fff" opacity=".5"/><path d="M40 10l12 18-12 28z" fill="#2a6aa0" opacity=".3"/><path class="lnW2" d="M28 28h24"/></g>
  <use href="#saSpark" class="qwh sa-tw" x="20" y="22"/><use href="#saSpark" class="qcr sa-tw d2" x="60" y="18"/><g transform="translate(58 46) scale(.7)"><use href="#saSpark" class="qwh sa-tw d3"/></g><g transform="translate(21 48) scale(.6)"><use href="#saSpark" class="qpu sa-tw"/></g>`,
l05:`<circle class="sa-glow" cx="40" cy="42" r="26" fill="url(#saGlowC)" opacity=".7"/><path class="qs o" d="M25 70l4-6h22l4 6z"/><circle class="qsl o" cx="40" cy="43" r="20"/>
  <path class="qs" d="M40 23a20 20 0 0 1 0 40a14 20 0 0 0 0-40z" opacity=".6"/><g class="qsd"><circle cx="30" cy="50" r="2.4"/><circle cx="47" cy="56" r="1.6"/><circle cx="33" cy="33" r="1.4"/></g>
  <path class="qcr sa-pulse o" d="M46 30a13 13 0 1 0 0 26a9 13 0 1 1 0-26z"/><g transform="translate(52 30) scale(.55)"><use href="#saSpark" class="qwh sa-tw"/></g>`,
l06:`<path class="sa-beam" d="M33 18L18 0h44L47 18z" fill="url(#saBeam)"/><path class="qs o" d="M24 70l3-11h26l3 11z"/><path class="qsd o" d="M28 59l2-4h20l2 4z"/>
  <path class="qcr o" d="M32 55V27l8-12 8 12v28z"/><path d="M32 27l8-12v40h-8z" fill="#fff" opacity=".45"/><path d="M48 27v28h-4V21z" fill="#2a6aa0" opacity=".3"/>
  <path class="qcr o" d="M24 56V44l4-6 4 6v12z"/><path class="qcr o" d="M48 56V41l4-6 4 6v15z"/><path class="lnW2" d="M32 35h16M32 45h16"/>
  <use href="#saSpark" class="qwh sa-tw" x="20" y="28"/><use href="#saSpark" class="qwh sa-tw d2" x="61" y="24"/>`,
};

// Kategori sekme ikonları (24×24, currentColor)
const SA_CAT_ICON = {
  bina:'<path d="M2 21h20v-3H2zM4.5 18h15v-4h-15zM7.5 14h9v-4h-9zM10 10h4V5.5h-4zM11.3 5.5h1.4V2.5h-1.4z"/>',
  doga:'<path d="M20.5 3C9.5 3 4 9 4 16c0 1.8.4 3.4 1 5 1-5 4-9 9.5-11.5C10 12.5 8 16 7 21c9 .8 13.5-6 13.5-18z"/>',
  dekor:'<path d="M3.5 2.5h17v3h-17zM5.5 6h13v1.6h-13zM6.5 8.5h2.4V19H6.5zM10.8 8.5h2.4V19h-2.4zM15.1 8.5h2.4V19h-2.4zM4.5 19.5h15V21h-15z"/>',
  isik:'<path d="M12 1.5c4 5 7.5 8.2 7.5 13.3a7.5 7.5 0 0 1-15 0c0-3 1.8-5.3 3.2-7.2.2 2.8 1.2 4.3 2.3 5.2-.2-4.2 1-7.6 2-11.3z"/>',
  booster:'<path d="M13.5 1.5L4 14h7l-2 8.5L19 10h-7.2z"/>',
};

// Ürün görseli: mode 'card' (80×80, arka planlı), 'mini' (arka plansız), 'map' (gölgeli, haritada)
function saArt(item, mode, size){
  if(!item) return '';
  const art = SA_ART[item.id];
  if(!art) return `<span class="sa-emo" style="font-size:${Math.round((size||40)*.6)}px">${item.icon}</span>`;
  const bg = mode==='card' ? (SA_BG[item.cat]||'') : '';
  const sh = mode==='map' ? '<ellipse cx="40" cy="71" rx="25" ry="5" fill="#1a0e04" opacity=".32"/>' : '';
  const sz = size ? ` width="${size}" height="${size}"` : '';
  const vb = mode==='card' ? '-40 0 160 80" preserveAspectRatio="xMidYMid slice' : '0 0 80 80';
  return `<svg class="sa sa-${mode||'mini'}" viewBox="${vb}"${sz} aria-hidden="true" focusable="false">${bg}${sh}${art}</svg>`;
}
function saCatIcon(id){
  return `<svg class="sc-svg" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${SA_CAT_ICON[id]||''}</svg>`;
}
// Paylaşılan tanımları bir kez sayfaya ekle
(function saInjectDefs(){
  if(document.getElementById('saDefs')) return;
  const w=document.createElement('div'); w.id='saDefs'; w.innerHTML=SA_DEFS;
  w.style.cssText='position:absolute;width:0;height:0;overflow:hidden;';
  document.body.prepend(w);
})();

// Kese ikonu (başlık + satın alma uçuşu)
const SA_POUCH = `<svg class="sa-pouch" viewBox="0 0 32 32" aria-hidden="true"><path d="M11 9q-3-4 1-6q2 2 4 1q2 1 4-1q4 2 1 6z" fill="#c8923a" stroke="#5a3416" stroke-width="1.3"/>
  <path d="M10 10q-7 6-6 13q1 7 12 7t12-7q1-7-6-13z" fill="url(#saGoldG)" stroke="#5a3416" stroke-width="1.3"/><path d="M10 10.5h12" stroke="#7a1e14" stroke-width="2.2" stroke-linecap="round"/>
  <text x="16" y="24" text-anchor="middle" font-size="9" font-weight="900" fill="#7a4a10" font-family="Cinzel,serif">¤</text><path d="M9 17q-2 5 1 9" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5"/></svg>`;
const SA_STAR = `<svg class="sa-star" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.5l4 8.6 9.4 1.1-7 6.4 1.9 9.3L16 23.2l-8.3 4.7 1.9-9.3-7-6.4 9.4-1.1z" fill="url(#saGoldG)" stroke="#6a4410" stroke-width="1.3" stroke-linejoin="round"/><path d="M16 7l2.4 5.4" stroke="#fff" stroke-width="1.4" opacity=".6"/></svg>`;

let _shopActiveCat = 'bina';

// Envanter yardımcıları
function getInv(){
  if(!CURRENT_USER) return {};
  if(!CURRENT_USER.inventory) CURRENT_USER.inventory = {};
  return CURRENT_USER.inventory;
}
function addInv(id, qty=1){
  const inv = getInv();
  inv[id] = (inv[id]||0) + qty;
  saveUserData(CURRENT_USER);
}
function useInv(id, qty=1){
  const inv = getInv();
  if((inv[id]||0) < qty) return false;
  inv[id] -= qty;
  if(inv[id] <= 0) delete inv[id];
  saveUserData(CURRENT_USER);
  return true;
}

// Şehir grid yardımcıları
function getCityGrid(bIdx){
  if(!CURRENT_USER) return Array(25).fill(null);
  if(!CURRENT_USER.cityGrids) CURRENT_USER.cityGrids = {};
  if(!CURRENT_USER.cityGrids[bIdx]) CURRENT_USER.cityGrids[bIdx] = Array(25).fill(null);
  return CURRENT_USER.cityGrids[bIdx];
}
function saveCityGrid(bIdx, grid){
  if(!CURRENT_USER) return;
  if(!CURRENT_USER.cityGrids) CURRENT_USER.cityGrids = {};
  CURRENT_USER.cityGrids[bIdx] = grid;
  saveUserData(CURRENT_USER);
}

// ── MAĞAZA AÇMA ──
function showShopScreen(){
  _shopActiveCat = 'bina';
  _updateShopWallet();
  _renderShopCats();
  _renderShopGrid();
  showScreen('shopScreen');
}

function _updateShopWallet(){
  const c = document.getElementById('shopCoins');
  const s = document.getElementById('shopStars');
  if(c) c.textContent = G.coins;
  if(s) s.textContent = getTotalStarsReal();
}

function _renderShopCats(){
  const el = document.getElementById('shopCats');
  if(!el) return;
  const inv = getInv();
  el.innerHTML = SHOP_CATS.map(c=>{
    const isActive = _shopActiveCat === c.id;
    const parts = c.label.split(' ');
    const icon = parts[0];
    const label = parts.slice(1).join(' ');
    const count = SHOP_ITEMS.filter(i=>i.cat===c.id).reduce((a,i)=>a+(inv[i.id]||0),0);
    const cntHtml = count > 0 ? `<span class="sc-cnt">${count}</span>` : '';
    return `<div class="shop-cat${isActive?' active':''}" onclick="shopFilter('${c.id}')">${cntHtml}<span class="sc-icon">${saCatIcon(c.id)}</span>${label}</div>`;
  }).join('');
}

function shopFilter(cat){
  _shopActiveCat = cat;
  _renderShopCats();
  _renderShopGrid();
}

const _CAT_GRAD = {
  bina:  'linear-gradient(145deg,#2a1c0a,#3a2810)',
  doga:  'linear-gradient(145deg,#0a1e0a,#142814)',
  dekor: 'linear-gradient(145deg,#18082a,#281040)',
  isik:  'linear-gradient(145deg,#2a1400,#3a2000)',
  booster:'linear-gradient(145deg,#2a0a30,#40104a)',
};
const _CAT_COLOR = {
  bina:'#c8a858', doga:'#44cc66', dekor:'#bb66ff', isik:'#ffaa22', booster:'#ff66cc',
};

function _shopRarity(price){
  if(price >= 280) return {cls:'rarity-legendary', label:'⚜️ Efsanevi', color:'#f5c842'};
  if(price >= 150) return {cls:'rarity-epic',      label:'💠 Efsunlu',  color:'#bb66ff'};
  if(price >= 80)  return {cls:'rarity-rare',      label:'🔷 Nadir',    color:'#55aaff'};
  return                  {cls:'',                  label:'',            color:'#6a5090'};
}

function _renderShopGrid(){
  const el = document.getElementById('shopGrid');
  if(!el) return;
  const ts = getTotalStarsReal();
  const inv = getInv();
  const items = SHOP_ITEMS.filter(i => i.cat === _shopActiveCat);

  el.innerHTML = items.map(item => {
    const count    = inv[item.id] || 0;
    const locked   = ts < item.reqStars;
    const affordable = G.coins >= item.price;
    const rarity   = _shopRarity(item.price);
    const catGrad  = _CAT_GRAD[item.cat] || _CAT_GRAD.bina;
    const catColor = _CAT_COLOR[item.cat] || '#c8a858';

    let badge = '';
    if(locked)       badge = `<div class="si-badge locked-b">🔒 ${item.reqStars}⭐</div>`;
    else if(!affordable) badge = `<div class="si-badge poor">🪙 Yetersiz</div>`;
    else if(count===0)   badge = `<div class="si-badge new-b">✦ Satışta</div>`;

    const qtyBadge = count > 0 ? `<div class="si-qty-badge">×${count}</div>` : '';

    const btnTxt = count > 0 ? '+ Bir Daha' : 'Satın Al';
    const btnDis = locked || !affordable ? 'disabled' : '';
    const btnCls = count > 0 ? ' has-item' : '';
    const lockcls = locked ? ' locked-shop' : '';
    const owncls  = count > 0 ? ' owned' : '';

    const art = SA_ART[item.id] ? saArt(item,'card') : `<span class="si-icon">${item.icon}</span>`;
    const lockSvg = locked ? `<svg class="si-lock" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path class="si-chain-o" d="M-6 14L166 76M-6 76L166 14"/><path class="si-chain" d="M-6 14L166 76M-6 76L166 14"/>
        <g transform="translate(80 44)"><path d="M-7.5-3v-6a7.5 7.5 0 0 1 15 0v6" fill="none" stroke="#3a2410" stroke-width="5.5"/><path d="M-7.5-3v-6a7.5 7.5 0 0 1 15 0v6" fill="none" stroke="#c9c2b8" stroke-width="3"/>
        <rect x="-11" y="-4" width="22" height="18" rx="3.5" fill="url(#saGoldG)" stroke="#5a3416" stroke-width="1.5"/><circle cy="3" r="2.4" fill="#3a2410"/><path d="M0 4v5" stroke="#3a2410" stroke-width="2.2" stroke-linecap="round"/></g></svg>` : '';
    const stamp = count > 0 ? `<div class="si-stamp"><svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="rgba(20,90,50,.35)" stroke="#44ff88" stroke-width="2.4"/>
        <circle cx="30" cy="30" r="21.5" fill="none" stroke="#44ff88" stroke-width="1" stroke-dasharray="2 2.2"/><text x="30" y="28" text-anchor="middle" class="si-stamp-t">SAHİP</text>
        <path d="M22 35l5.5 5 10.5-10" fill="none" stroke="#44ff88" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : '';

    return `<div class="shop-item${owncls}${lockcls} ${rarity.cls}" data-id="${item.id}"
        style="--si-color:${rarity.color};--si-grad:${catGrad};">
      <div class="si-preview">
        ${art}${lockSvg}
        ${badge}${qtyBadge}${stamp}
        <div class="si-rarity-bar"></div>
      </div>
      <div class="si-info">
        <div class="si-name">${item.name}</div>
        <div class="si-desc">${item.desc}</div>
        <div class="si-footer">
          <span class="si-price"><span class="pc">🪙</span>${item.price}</span>
          <button class="si-btn${btnCls}" ${btnDis} onclick="buyItem('${item.id}')">${btnTxt}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function buyItem(itemId){
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if(!item){ return; }
  const ts = getTotalStarsReal();
  if(ts < item.reqStars){ showToast(`🔒 ${item.reqStars} yıldız gerekli!`); return; }
  if(G.coins < item.price){ showToast('🪙 Yeterli altın yok!','warning'); return; }

  G.coins -= item.price;
  addInv(item.id, item.pack||1);   // boosterlar 3'lü paket
  updateCoinsUI();
  _updateShopWallet();
  saveGame();
  _renderShopGrid();
  _renderShopCats();
  SFX.unlock?.();
  showToast(`✦ ${item.icon} ${item.name}${item.pack?' ×'+item.pack:''} satın alındı!`);
}
