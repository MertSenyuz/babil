// ══════════════════════════════════════════════
// KULLANICI & AUTH SİSTEMİ
// ══════════════════════════════════════════════
const AVATARS = ['👑','⚔️','🏹','🔮','🌙','☀️','🐉','🦅','🏺','🗡️','🌿','💎'];

const ACHIEVEMENTS = [
  {id:'first_win',   icon:'🏆', name:'İlk Zafer',      desc:'İlk bölümü kazan'},
  {id:'star3',       icon:'⭐', name:'3 Yıldız Ustası', desc:'Bir bölümü 3 yıldızla bitir'},
  {id:'combo5',      icon:'🔥', name:'Combo Ustası',    desc:'5 oyun oyna'},
  {id:'unlock2',     icon:'🔓', name:'Kaşif',           desc:'2. yapıyı aç'},
  {id:'gold500',     icon:'🪙', name:'Tüccar',          desc:'500 altın biriktir'},
  {id:'energy10',    icon:'⚡', name:'Dinmez Savaşçı',  desc:'10 enerji harca'},
  {id:'stars15',     icon:'🌟', name:'Yıldız Avcısı',   desc:'15 yıldız topla'},
  {id:'allbuildings',icon:'🏙️', name:'Babil Mimarı',    desc:'Tüm yapıları aç'},
  {id:'win20',       icon:'👑', name:'Efsane',          desc:'20 bölüm kazan'},
];

// Tüm kullanıcıları sakla
function getAllUsers(){
  let arr;
  try{ arr = JSON.parse(localStorage.getItem('babil_users')||'[]'); }catch(e){ return []; }
  if(!Array.isArray(arr)) return [];
  // Bozuk kayıtları (null, kullanıcı adı olmayan) ayıkla — giriş ekranı çökmesin
  return arr.filter(u=>u && typeof u==='object' && typeof u.username==='string' && u.username);
}
function saveAllUsers(arr){
  try{ localStorage.setItem('babil_users', JSON.stringify(arr)); }catch(e){}
}

// Aktif oturumu sakla
function getActiveSession(){
  try{ return JSON.parse(localStorage.getItem('babil_session')||'null'); }catch(e){ return null; }
}
function setActiveSession(username){
  try{ localStorage.setItem('babil_session', JSON.stringify({username, ts:Date.now()})); }catch(e){}
}
function clearActiveSession(){
  localStorage.removeItem('babil_session');
}

// Kullanıcı verisi
function getUserData(username){
  const users = getAllUsers();
  return users.find(u=>u.username===username)||null;
}
function saveUserData(userData){
  if(!userData || typeof userData.username!=='string' || !userData.username) return;   // geçersiz kayıt yazma
  const users = getAllUsers();
  const idx = users.findIndex(u=>u.username===userData.username);
  if(idx>=0) users[idx]=userData;
  else users.push(userData);
  saveAllUsers(users);
}

// Mevcut aktif kullanıcı
let CURRENT_USER = null;

function loadCurrentUser(){
  const session = getActiveSession();
  if(!session) return false;
  const user = getUserData(session.username);
  if(!user) return false;
  CURRENT_USER = user;
  return true;
}

function syncGameToUser(){
  if(!CURRENT_USER) return;
  updateCivState();
  CURRENT_USER.gameData = {
    energy: G.energy,
    lastEnergyTime: G.lastEnergyTime,
    coins: G.coins,
    totalStars: getTotalStarsReal(),
    buildingProgress: G.buildingProgress,
    civVersion: 2,
    mapCiv: G.mapCiv ?? null,
    currentCivilization: G.currentCivilization,
    civilizationProgress: G.civilizationProgress,
  };
  CURRENT_USER.stats.totalStars = getTotalStarsReal();
  CURRENT_USER.stats.totalCoins = G.coins;
  saveUserData(CURRENT_USER);
}

// Eski kayıtlar (Babil → Mısır → Roma → Çin sürümü): Babil ilerlemesi korunur, sonraki medeniyetler sıfırdan başlar
// Not: initAuth() (29-land.js) 35-civilizations.js yüklenmeden çalışır → bu fonksiyon burada durmalı.
function migrateCivSave(d){
  if(!d || d.civVersion===2) return;
  if(Array.isArray(d.buildingProgress) && d.buildingProgress.length>6) d.buildingProgress = d.buildingProgress.slice(0,6);
  delete d.mapCiv; delete d.currentCivilization; delete d.civilizationProgress;
  if(CURRENT_USER){
    const r=CURRENT_USER.civRewards;
    if(r) Object.keys(r).forEach(k=>{ if(+k>0) delete r[k]; });
    if(Array.isArray(CURRENT_USER.achievements))
      CURRENT_USER.achievements = CURRENT_USER.achievements.filter(a=>!/^civ_[1-9]$/.test(a));
    if(CURRENT_USER.historySeen) Object.keys(CURRENT_USER.historySeen).forEach(k=>{ if(+k>5) delete CURRENT_USER.historySeen[k]; });
  }
  d.civVersion = 2;
}

function loadGameFromUser(){
  if(!CURRENT_USER||!CURRENT_USER.gameData) return;
  const d = CURRENT_USER.gameData;
  migrateCivSave(d);   // eski Mısır/Roma/Çin kayıtları → Mezopotamya yolculuğu (Babil korunur)
  G.energy = d.energy??5;
  G.lastEnergyTime = d.lastEnergyTime??Date.now();
  G.coins = d.coins??100;
  G.totalStars = d.totalStars??0;
  G.buildingProgress = d.buildingProgress??[];
  ensureProgress();   // eski kayıtlar: yeni yapılar ve 4-5. bölümler sıfır yıldızla eklenir
  G.mapCiv = d.mapCiv ?? d.currentCivilization ?? null;   // showMapScreen kilitliyse en yüksek açık medeniyete düzeltir
  // Enerji yenileme
  const gained = Math.floor((Date.now()-G.lastEnergyTime)/(3*60*1000));
  if(gained>0&&G.energy<G.maxEnergy){
    G.energy=Math.min(G.maxEnergy,G.energy+gained);
    G.lastEnergyTime=Date.now();
  }
}

// ── BAŞARIM KONTROL ──
function checkAchievements(){
  if(!CURRENT_USER) return;
  const s = CURRENT_USER.stats;
  const earned = CURRENT_USER.achievements;
  const add = (id)=>{ if(!earned.includes(id)){ earned.push(id); showToast('🏆 Başarım: '+ACHIEVEMENTS.find(a=>a.id===id)?.name); } };

  if(s.wins>=1)      add('first_win');
  if(s.maxStarsInGame>=3) add('star3');
  if(s.gamesPlayed>=5)    add('combo5');
  if(getTotalStarsReal()>=6) add('unlock2');
  if(G.coins>=500)         add('gold500');
  if(s.energyUsed>=10)     add('energy10');
  if(getTotalStarsReal()>=15) add('stars15');
  if(civBuildingIdx(0).every(isBuildingUnlocked)) add('allbuildings');
  checkCivAchievements(add);
  if(s.wins>=20)           add('win20');

  saveUserData(CURRENT_USER);
}

// ── AUTH UI ──
function switchAuthTab(tab){
  document.getElementById('tabGiris').classList.toggle('active', tab==='giris');
  document.getElementById('tabKayit').classList.toggle('active', tab==='kayit');
  document.getElementById('panelGiris').style.display = tab==='giris'?'block':'none';
  document.getElementById('panelKayit').style.display = tab==='kayit'?'block':'none';
  document.getElementById('authErr').classList.remove('show');
  document.getElementById('regErr').classList.remove('show');
  if(tab==='giris') renderSavedUsers();
  if(tab==='kayit') renderAvatarGrid();
}

function renderSavedUsers(){
  const list = document.getElementById('savedUsersList');
  const users = getAllUsers();
  if(users.length===0){ list.innerHTML=''; return; }
  list.innerHTML = users.slice(-3).reverse().map(u=>`
    <div class="auth-user-row" onclick="quickLogin('${u.username}')">
      <div class="auth-user-av">${u.avatar||'👤'}</div>
      <div>
        <div class="auth-user-name" data-no-i18n>${u.username}</div>
        <div class="auth-user-info">⭐ ${u.stats?.totalStars||0} · 🪙 ${u.stats?.totalCoins||0}</div>
      </div>
      <div class="auth-user-arrow">›</div>
    </div>
  `).join('');
}

function quickLogin(username){
  document.getElementById('loginName').value = username;
  document.getElementById('loginPass').focus();
}

function renderAvatarGrid(){
  const grid = document.getElementById('avatarGrid');
  let sel = AVATARS[0];
  grid.innerHTML = AVATARS.map((av,i)=>`
    <div class="av-opt${i===0?' selected':''}" onclick="selectAvatar(this,'${av}')">${av}</div>
  `).join('');
}

let selectedAvatar = AVATARS[0];
function selectAvatar(el, av){
  document.querySelectorAll('.av-opt').forEach(e=>e.classList.remove('selected'));
  el.classList.add('selected');
  selectedAvatar = av;
}

function togglePw(id, btn){
  const inp = document.getElementById(id);
  if(inp.type==='password'){ inp.type='text'; btn.textContent='🙈'; }
  else { inp.type='password'; btn.textContent='👁'; }
}

// Basit hash (gerçek uygulama için değil, demo amaçlı)
function simpleHash(str){
  let h=0;
  for(let i=0;i<str.length;i++){ h=((h<<5)-h)+str.charCodeAt(i); h|=0; }
  return h.toString(36);
}

function doRegister(){
  const name = document.getElementById('regName').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const errEl = document.getElementById('regErr');

  errEl.classList.remove('show');
  if(!name){ errEl.textContent='Kullanıcı adı boş olamaz!'; errEl.classList.add('show'); return; }
  if(name.length<2){ errEl.textContent='En az 2 karakter!'; errEl.classList.add('show'); return; }
  if(pass.length<4){ errEl.textContent='Şifre en az 4 karakter olmalı!'; errEl.classList.add('show'); return; }
  if(pass!==pass2){ errEl.textContent='Şifreler eşleşmiyor!'; errEl.classList.add('show'); return; }

  const users = getAllUsers();
  if(users.find(u=>u.username.toLowerCase()===name.toLowerCase())){
    errEl.textContent='Bu kullanıcı adı zaten alınmış!'; errEl.classList.add('show'); return;
  }

  const newUser = {
    username: name,
    avatar: selectedAvatar,
    passwordHash: simpleHash(pass),
    createdAt: Date.now(),
    gameData: null,
    stats: { gamesPlayed:0, wins:0, losses:0, totalStars:0, totalCoins:100, energyUsed:0, maxStarsInGame:0 },
    achievements: [],
  };
  saveUserData(newUser);

  // Kayıt başarılı → Giriş sekmesine geç, bilgileri doldur
  switchAuthTab('giris');
  document.getElementById('loginName').value = name;
  document.getElementById('loginPass').value = pass;
  showToast('✦ Hesap oluşturuldu! Şimdi giriş yap.');

  // Alanları temizle
  document.getElementById('regName').value='';
  document.getElementById('regPass').value='';
  document.getElementById('regPass2').value='';
}

function doLogin(){
  const name = document.getElementById('loginName').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('authErr');
  errEl.classList.remove('show');

  const user = getUserData(name);
  if(!user || user.passwordHash !== simpleHash(pass)){
    errEl.classList.add('show'); return;
  }

  CURRENT_USER = user;
  setActiveSession(name);

  // Yeni kullanıcıysa oyun verisini ilk kez oluştur
  if(!user.gameData){
    G.energy=5; G.lastEnergyTime=Date.now(); G.coins=100;
    G.buildingProgress = BUILDINGS.map(b=>({stars:b.levels.map(()=>0)}));
    syncGameToUser();
  } else {
    loadGameFromUser();
  }

  document.getElementById('loginPass').value='';
  showToast('✦ Hoş geldin, '+name+'!');
  enterGame(); // Ana menüye gönder
}

function doLogout(){
  syncGameToUser();
  clearActiveSession();
  CURRENT_USER = null;
  // Giriş ekranına dön, önceki kullanıcıları listele
  renderSavedUsers();
  switchAuthTab('giris');
  document.getElementById('loginPass').value='';
  showScreen('authScreen');
  showToast('Çıkış yapıldı.');
}

function initGameForUser(){
  // Yeni kullanıcı için oyun başlat
  G.energy=5; G.lastEnergyTime=Date.now(); G.coins=100;
  G.buildingProgress = BUILDINGS.map(b=>({stars:b.levels.map(()=>0)}));
  G.mapCiv = 0;
  syncGameToUser();
  enterGame();
}

function enterGame(){
  updateEnergyUI(); updateCoinsUI();
  updateTopbarProfile();
  showScreen('menuScreen');
}

function updateTopbarProfile(){
  if(!CURRENT_USER) return;
  const av = CURRENT_USER.avatar||'👤';
  document.querySelectorAll('.topbar-profile').forEach(el=>el.textContent=av);
}

// ── PROFİL EKRANI ──
function showProfileScreen(){
  if(!CURRENT_USER){ showScreen('authScreen'); return; }
  syncGameToUser();

  const u = CURRENT_USER;
  document.getElementById('profileAvatar').textContent = u.avatar||'👤';
  document.getElementById('profileName').textContent = u.username;
  document.getElementById('profileSince').textContent = 'Katılım: '+new Date(u.createdAt).toLocaleDateString('tr-TR');

  // Seviye hesapla
  const ts = getTotalStarsReal();
  const lvl = ts<3?1:ts<9?2:ts<18?3:ts<27?4:5;
  const lvlNames = ['','Köylü','Tüccar','Savaşçı','Komutan','Babil Hükümdarı'];
  document.getElementById('profileLevelBadge').textContent = `✦ Seviye ${lvl} — ${lvlNames[lvl]}`;

  // İstatistikler
  const s = u.stats;
  document.getElementById('pStatOyun').textContent = s.gamesPlayed||0;
  document.getElementById('pStatKazan').textContent = s.wins||0;
  document.getElementById('pStatYildiz').textContent = ts;
  document.getElementById('pStatAltin').textContent = G.coins;
  document.getElementById('pStatEnerji').textContent = s.energyUsed||0;
  const oran = s.gamesPlayed>0?Math.round((s.wins/s.gamesPlayed)*100):0;
  document.getElementById('pStatOran').textContent = oran+'%';

  // Başarımlar
  const badgeGrid = document.getElementById('badgeGrid');
  badgeGrid.innerHTML = ACHIEVEMENTS.map(a=>{
    const earned = (u.achievements||[]).includes(a.id);
    return `<div class="badge-item ${earned?'earned':'locked-b'}" title="${a.desc}">
      <span class="badge-icon">${a.icon}</span>
      <div class="badge-name">${a.name}</div>
    </div>`;
  }).join('');

  // Yapı ilerlemesi
  const bpList = document.getElementById('buildingProgList');
  bpList.innerHTML = BUILDINGS.map((b,i)=>{
    const bp = G.buildingProgress[i];
    const bStars = bp.stars.reduce((a,c)=>a+c,0);
    const pct = (bStars/buildingMaxStars(i))*100;
    const unlocked = isBuildingUnlocked(i);
    if(!isCivUnlocked(b.civ||0)) return '';
    const civ = CIVILIZATIONS[b.civ||0];
    const head = civBuildingIdx(civ.id)[0]===i ? `<div class="bp-civ-head">${civIcon(civ)} ${civ.name}</div>` : '';
    return head+`<div class="bp-row">
      <div class="bp-icon">${unlocked?bIcon(b):'🔒'}</div>
      <div class="bp-info">
        <div class="bp-name">${b.name}</div>
        <div class="bp-track"><div class="bp-fill" style="width:${unlocked?pct:0}%;background:${b.color};"></div></div>
      </div>
      <div class="bp-stars">${bp.stars.map(s=>s>0?'⭐':'☆').join('')}</div>
    </div>`;
  }).join('');

  showScreen('profileScreen');
}

// ── BAŞLANGIÇ KONTROL ──
function initAuth(){
  renderAvatarGrid();
  renderSavedUsers();
  if(loadCurrentUser()){
    loadGameFromUser();
    enterGame();
  } else {
    showScreen('authScreen');
  }
}
