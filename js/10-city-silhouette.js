// ══════════════════════════════════════════════
// ŞEHİR SİLUETİ — tüm ekranlara eklenir
// ══════════════════════════════════════════════
const CITY_SVG = `<svg viewBox="0 0 430 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
  <rect x="160" y="5" width="110" height="75" rx="2" fill="#5a4020"/>
  <rect x="170" y="0" width="90" height="12" rx="1" fill="#6b5030"/>
  <rect x="180" y="-6" width="70" height="10" rx="1" fill="#7c6040"/>
  <rect x="192" y="-12" width="46" height="10" rx="1" fill="#9c8050"/>
  <rect x="202" y="-18" width="26" height="10" rx="1" fill="#b09060"/>
  <rect x="210" y="-23" width="10" height="9" rx="1" fill="#c8a870"/>
  <rect x="213" y="-30" width="4" height="10" rx="1" fill="#f5c842"/>
  <rect x="40" y="20" width="50" height="60" rx="2" fill="#3a2815"/>
  <rect x="48" y="13" width="34" height="12" rx="1" fill="#5a4030"/>
  <rect x="55" y="6" width="20" height="10" rx="1" fill="#7a6050"/>
  <rect x="10" y="35" width="32" height="45" rx="2" fill="#2e2010"/>
  <rect x="16" y="28" width="20" height="12" rx="1" fill="#4e3828"/>
  <rect x="320" y="18" width="55" height="62" rx="2" fill="#3a2815"/>
  <rect x="328" y="10" width="39" height="13" rx="1" fill="#5a4030"/>
  <rect x="336" y="3" width="23" height="10" rx="1" fill="#7a6050"/>
  <rect x="385" y="32" width="35" height="48" rx="2" fill="#2e2010"/>
  <rect x="390" y="25" width="25" height="11" rx="1" fill="#4e3828"/>
  <rect x="0" y="72" width="430" height="8" fill="#2d1b10"/>
  <rect x="44" y="15" width="4" height="20" fill="#1a0a08" opacity=".5"/>
  <ellipse cx="46" cy="13" rx="12" ry="8" fill="#163a18" opacity=".8"/>
  <rect x="302" y="22" width="4" height="18" fill="#1a0a08" opacity=".5"/>
  <ellipse cx="304" cy="20" rx="11" ry="7" fill="#163a18" opacity=".8"/>
</svg>`;

function injectCitySilhouettes(){
  ['citySilCity','citySilLevel','citySilGame','citySilResult'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.innerHTML=CITY_SVG;
  });
}
