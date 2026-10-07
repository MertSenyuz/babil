// ══════════════════════════════════════════════
// ÇEVRİMİÇİ — Supabase hesap, ilerleme senkronu, liderlik tablosu, arkadaşlar
// Yerel kayıt (localStorage) asıl kaynak olarak kalır; Supabase onun bulut kopyasıdır.
// İnternet yoksa ya da herhangi bir istek hata verirse oyun sessizce yerel kayıtla devam eder.
// Mevcut fonksiyonlar değiştirilmez; yalnızca sarmalanır.
// Tablo kurulumu ve önerilen ek sütunlar: supabase/setup.sql
// ══════════════════════════════════════════════
const SUPABASE_URL = 'https://kdddspuhzlwqjeyhrsmz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GSvknQAz0O6C5cRXkMGdqg_9MCWyOU9';
const OL_UID_KEY   = 'babil_sb_uid';        // oturum açıkken yalnızca Supabase user_id
const OL_LB_CACHE  = 'babil_lb_cache';      // çevrimdışı gösterim için son liderlik listesi
const OL_ONLINE_MS = 150000;                // son 2,5 dk içinde görülen arkadaş "çevrimiçi"
const OL_TIMEOUT   = 9000;

const OL = {
  client:null, clientP:null,
  cols:null,                 // {users:bool, lb:bool} — setup.sql'deki ek sütunlar var mı
  syncing:false, syncP:null, again:false, syncTimer:null, lastOk:0,
  hb:null, rel:null,         // nabız zamanlayıcısı, son arkadaşlık ilişkileri
  lbTab:'all', challenge:null,
};

// ── Çeviriler (37-language.js dizinine eklenir; Türkçe kaynak metinler DOM'da otomatik çevrilir) ──
(function olI18n(){
  const M = {
    ol_menu_lb:['🏆 LİDERLİK TABLOSU','🏆 LEADERBOARD'],
    ol_lb_title:['LİDERLİK TABLOSU','LEADERBOARD'],
    ol_lb_sub:["Babil'in en büyük mimarları","Babylon's greatest builders"],
    ol_lb_week:['Haftalık','Weekly'],
    ol_lb_all:['Tüm Zamanlar','All Time'],
    ol_lb_refresh:['Yenile','Refresh'],
    ol_menu:['← Menü','← Menu'],
    ol_pf_tab_me:['👤 Profil','👤 Profile'],
    ol_pf_tab_fr:['👥 Arkadaşlar','👥 Friends'],
    ol_fr_add_h:['➕ ARKADAŞ EKLE','➕ ADD FRIEND'],
    ol_fr_add_ph:['Kullanıcı adı...','Username...'],
    ol_fr_add_btn:['EKLE','ADD'],
    ol_fr_in_h:['📩 GELEN İSTEKLER','📩 INCOMING REQUESTS'],
    ol_fr_out_h:['📤 GİDEN İSTEKLER','📤 SENT REQUESTS'],
    ol_fr_list_h:['👥 ARKADAŞLARIM','👥 MY FRIENDS'],
    // dinamik metinler — t() ile etkin dilde üretilir
    ol_you:['Sen','You'],
    ol_levels:['{0} bölüm','{0} levels'],
    ol_pts:['{0} puan','{0} pts'],
    ol_rank_out:['İlk 50 dışında','Outside top 50'],
    ol_lb_empty:['Henüz kimse yok — ilk sen ol!','Nobody here yet — be the first!'],
    ol_lb_week_empty:['Bu hafta henüz yıldız kazanan yok.','No stars earned this week yet.'],
    ol_lb_week_na:['Haftalık sıralama henüz hazır değil.','Weekly ranking is not ready yet.'],
    ol_lb_offline:['📴 Çevrimdışısın — son kaydedilen liste gösteriliyor.','📴 You are offline — showing the last saved list.'],
    ol_lb_nodata:['📴 Liderlik tablosu için internet gerekli.','📴 The leaderboard needs an internet connection.'],
    ol_lb_local:['Hesabın henüz çevrimiçi değil — skorların bu cihazda saklanıyor.','Your account is not online yet — your scores are kept on this device.'],
    ol_loading:['Yükleniyor…','Loading…'],
    ol_st_on:['☁️ Bulut kaydı açık','☁️ Cloud save on'],
    ol_st_sync:['⟳ Eşitleniyor…','⟳ Syncing…'],
    ol_st_off:['📴 Çevrimdışı — cihazda kaydediliyor','📴 Offline — saving on this device'],
    ol_st_local:['💾 Sadece bu cihazda','💾 This device only'],
    ol_fr_need_online:['Arkadaş sistemi için internet ve çevrimiçi hesap gerekli.','Friends need an internet connection and an online account.'],
    ol_fr_none:['Henüz arkadaşın yok. Kullanıcı adıyla ekle!','No friends yet. Add someone by username!'],
    ol_fr_wait:['Bekliyor','Pending'],
    ol_fr_on:['Çevrimiçi','Online'],
    ol_fr_off:['Çevrimdışı','Offline'],
    ol_fr_beat:['Geç!','Beat!'],
    ol_fr_ahead:['{0} puan öndesin','You lead by {0}'],
    ol_fr_behind:['{0} puan geridesin','{0} behind'],
    ol_fr_tie:['Berabere','Tied'],
    ol_fr_sent:['✦ {0} kişisine istek gönderildi','✦ Request sent to {0}'],
    ol_fr_accepted:['✦ {0} artık arkadaşın!','✦ {0} is now your friend!'],
    ol_fr_notfound:['Bu kullanıcı adı bulunamadı.','No player with that username.'],
    ol_fr_self:['Kendini ekleyemezsin 🙂','You cannot add yourself 🙂'],
    ol_fr_exists:['Zaten arkadaşsınız ya da istek bekliyor.','Already friends or a request is pending.'],
    ol_fr_err:['İstek gönderilemedi, sonra tekrar dene.','Could not send the request, try again later.'],
    ol_fr_remove_q:['{0} arkadaş listenden çıkarılsın mı?','Remove {0} from your friends?'],
    ol_fr_new_req:['📩 {0} yeni arkadaşlık isteği!','📩 {0} new friend request(s)!'],
    ol_fr_got_acc:['🤝 {0} arkadaşlık isteğini kabul etti!','🤝 {0} accepted your friend request!'],
    ol_fr_beat_go:['🎯 Hedef: {0} — {1} puanı geç!','🎯 Target: beat {0}\'s {1} points!'],
    ol_fr_beat_none:['👑 {0} karşısında tüm skorlarda öndesin!','👑 You lead {0} on every level!'],
    ol_fr_beat_locked:['🔒 {0} daha ileride — önce yeni bölümleri aç!','🔒 {0} is further ahead — unlock more levels first!'],
    ol_fr_beaten:['🏆 {0} geçildi! Yeni skorun: {1}','🏆 You beat {0}! New score: {1}'],
    ol_name_taken:['Bu kullanıcı adı zaten alınmış!','This username is already taken!'],
    ol_conflict:['☁️ "{0}" adı çevrimiçi başka bir oyuncuya ait — ilerlemen yalnızca bu cihazda saklanacak.','☁️ "{0}" is taken online by another player — your progress stays on this device only.'],
    ol_restored:['☁️ Bulut kaydın yüklendi!','☁️ Cloud save restored!'],
    ol_mlb_title:['🏆 Liderlik','🏆 Leaders'],
    ol_mlb_aria:['Liderlik','Leaderboard'],
    ol_mlb_more:['Tümünü gör →','See all →'],
    ol_mlb_min:['Küçült','Minimise'],
  };
  const esc = s=>s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  Object.entries(M).forEach(([k,[tr,en]])=>{
    LANG.tr[k]=tr; LANG.en[k]=en;
    const v=_i18nNorm(tr);
    if(!/\{\d\}/.test(v)){ if(!_i18nExact.has(v)) _i18nExact.set(v,k); return; }
    const nums=[];
    const re='^'+v.split(/(\{\d\})/).map(p=>{ const m=p.match(/^\{(\d)\}$/); if(m){ nums.push(m[1]); return '(.+?)'; } return esc(p); }).join('')+'$';
    _i18nPats.push({key:k, re:new RegExp(re), nums, lit:v.replace(/\{\d\}/g,'').length});
  });
  _i18nPats.sort((a,b)=>b.lit-a.lit);
})();

// ── Yardımcılar ──
const olEsc = s=>String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const olNum = n=>Number(n||0).toLocaleString(currentLang==='en'?'en-US':'tr-TR');
const olOnline = ()=>navigator.onLine!==false;
function olTimeout(p, ms=OL_TIMEOUT){
  return Promise.race([p, new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')), ms))]);
}
// Supabase sorgusu → data; hata/zaman aşımı → istisna (çağıran sessizce yerel kayda döner)
async function olQ(builder){
  const {data, error, count} = await olTimeout(builder);
  if(error) throw error;
  return count!=null && data==null ? count : data;
}
function olWarn(where, e){ try{ console.warn('[Babil online]', where, e && (e.message||e)); }catch(_){} }

// ISO hafta anahtarı: "2026-W41"
function olWeekKey(d=new Date()){
  const t=new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day=t.getUTCDay()||7;
  t.setUTCDate(t.getUTCDate()+4-day);
  const y=t.getUTCFullYear();
  const w=Math.ceil(((t-Date.UTC(y,0,1))/86400000+1)/7);
  return y+'-W'+String(w).padStart(2,'0');
}

// ── Şifre: kullanıcı adıyla tuzlanmış SHA-256 (tek yönlü; btoa gibi geri çözülemez) ──
function olSha256Js(str){
  const rr=(v,n)=>(v>>>n)|(v<<(32-n));
  const H=[], K=[];
  for(let p=2, n=0; n<64; p++){
    let prime=true;
    for(let d=2; d*d<=p; d++) if(p%d===0){ prime=false; break; }
    if(!prime) continue;
    if(n<8) H[n]=(Math.pow(p,1/2)*4294967296)|0;
    K[n++]=(Math.pow(p,1/3)*4294967296)|0;
  }
  const b=Array.from(new TextEncoder().encode(str)), bits=b.length*8;
  b.push(0x80);
  while(b.length%64!==56) b.push(0);
  for(let i=7;i>=0;i--) b.push(i>=4 ? 0 : (bits>>>(i*8))&255);
  for(let o=0; o<b.length; o+=64){
    const w=[];
    for(let i=0;i<64;i++){
      if(i<16) w[i]=(b[o+i*4]<<24)|(b[o+i*4+1]<<16)|(b[o+i*4+2]<<8)|b[o+i*4+3];
      else {
        const x=w[i-15], y=w[i-2];
        w[i]=(w[i-16]+(rr(x,7)^rr(x,18)^(x>>>3))+w[i-7]+(rr(y,17)^rr(y,19)^(y>>>10)))|0;
      }
    }
    let [a,c1,c2,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){
      const t1=(h+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^(~e&g))+K[i]+w[i])|0;
      const t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&c1)^(a&c2)^(c1&c2)))|0;
      h=g; g=f; f=e; e=(d+t1)|0; d=c2; c2=c1; c1=a; a=(t1+t2)|0;
    }
    [a,c1,c2,d,e,f,g,h].forEach((v,i)=>{ H[i]=(H[i]+v)|0; });
  }
  return H.map(v=>(v>>>0).toString(16).padStart(8,'0')).join('');
}
async function olHash(username, pass){
  const s='babil-sehri|'+String(username).trim().toLowerCase()+'|'+pass;
  try{
    if(window.crypto && crypto.subtle){
      const buf=await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.from(new Uint8Array(buf)).map(x=>x.toString(16).padStart(2,'0')).join('');
    }
  }catch(e){}
  return olSha256Js(s);   // file:// gibi güvenli olmayan bağlamlarda
}

// ── İstemci: supabase-js index.html'de async yüklenir; gelmezse oyun yerel devam eder ──
function olClient(){
  if(OL.client) return Promise.resolve(OL.client);
  if(OL.clientP) return OL.clientP;
  OL.clientP = new Promise(resolve=>{
    const t0=Date.now();
    (function wait(){
      if(window.supabase && window.supabase.createClient){
        try{
          OL.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {auth:{persistSession:false, autoRefreshToken:false}});
        }catch(e){ olWarn('client', e); }
        return resolve(OL.client);
      }
      if(Date.now()-t0 > 15000){ OL.clientP=null; return resolve(null); }   // sonra tekrar denenir
      setTimeout(wait, 150);
    })();
  });
  return OL.clientP;
}

// setup.sql'deki ek sütunlar (last_seen, avatar, week_key, week_stars) var mı? Yoksa o özellikler sessizce kapanır.
async function olCols(sb){
  if(OL.cols) return OL.cols;
  const probe = async (tbl, cols)=>{
    try{ await olQ(sb.from(tbl).select(cols).limit(1)); return true; }
    catch(e){ return !(e && (e.code==='42703' || e.code==='PGRST204' || /column/i.test(e.message||''))) ? null : false; }
  };
  const users=await probe('users','last_seen,avatar'), lb=await probe('leaderboard','week_key,week_stars');
  if(users===null || lb===null) return {users:false, lb:false};   // ağ hatası: önbelleğe alma, sonra tekrar dene
  return OL.cols = {users, lb};
}

// ── Hesap ──
const OL_USER_COLS = 'id,username,password_hash,gold,gems,energy';
async function olFindUser(sb, name){
  const pat=String(name).trim().replace(/[\\%_]/g, m=>'\\'+m);   // ilike: büyük/küçük harf duyarsız tam eşleşme
  const cols=(await olCols(sb)).users ? OL_USER_COLS+',avatar,last_seen' : OL_USER_COLS;
  const rows=await olQ(sb.from('users').select(cols).ilike('username', pat).limit(1));
  return rows && rows[0] || null;
}

function olSetUid(id){
  try{ if(id==null) localStorage.removeItem(OL_UID_KEY); else localStorage.setItem(OL_UID_KEY, String(id)); }catch(e){}
}

// Yerel profile bağlı çevrimiçi hesabı bul ya da oluştur → user_id (yoksa null)
async function olEnsureAccount(sb, u){
  if(u.sbId!=null) return u.sbId;
  if(u.sbConflict || !u.sbHash) return null;   // sbHash: şifre girilen ilk girişte oluşur
  const r=await olFindUser(sb, u.username);
  if(r){
    if(r.password_hash!==u.sbHash){
      u.sbConflict=true; saveUserData(u);
      showToast(t('ol_conflict',[u.username]), 'warning');
      return null;
    }
    u.sbId=r.id;
  } else {
    const gd=u===CURRENT_USER ? {coins:G.coins, energy:G.energy} : (u.gameData||{});
    const row={username:u.username, password_hash:u.sbHash, gold:gd.coins??100, gems:0, energy:gd.energy??5};
    if((await olCols(sb)).users) row.avatar=u.avatar||null;
    const ins=await olQ(sb.from('users').insert(row).select('id').single());
    u.sbId=ins.id;
  }
  saveUserData(u);
  if(u===CURRENT_USER) olSetUid(u.sbId);
  return u.sbId;
}

// ── Senkron: çek → birleştir (en yüksek yıldız/skor kazanır) → farkları gönder ──
function olQueueSync(ms=1500){
  clearTimeout(OL.syncTimer);
  OL.syncTimer=setTimeout(olSync, ms);
}

// Aynı anda tek senkron; çalışırken gelen çağrı aynı söze bağlanır ve bitince bir tur daha planlanır
function olSync(){
  if(OL.syncP){ OL.again=true; return OL.syncP; }
  OL.syncP=olSyncRun().finally(()=>{ OL.syncP=null; });
  return OL.syncP;
}

async function olSyncRun(){
  const u=CURRENT_USER;
  if(!u) return;
  if(!olOnline()){ olStatus(); return; }
  OL.syncing=true; olStatus();
  try{
    const sb=await olClient();
    if(!sb) return;
    const id=await olEnsureAccount(sb, u);
    if(id==null) return;
    const live=()=>CURRENT_USER===u;
    const bp=live() ? G.buildingProgress : (u.gameData && u.gameData.buildingProgress) || [];
    const best=u.bestScores=u.bestScores||{};

    // 1) İlerleme: başka cihazdaki daha iyi sonuçları al
    const rows=await olQ(sb.from('game_progress').select('building_index,level_index,stars,best_score').eq('user_id', id));
    const remote=new Map();
    let pulled=false;
    (rows||[]).forEach(r=>{
      const k=r.building_index+'-'+r.level_index;
      remote.set(k, r);
      const p=bp[r.building_index];
      if(!p || !Array.isArray(p.stars) || r.level_index>=p.stars.length) return;   // bu sürümde olmayan bölüm
      const rs=Math.min(3, r.stars||0);
      if(rs>(p.stars[r.level_index]||0)){ p.stars[r.level_index]=rs; pulled=true; }
      if((r.best_score||0)>(best[k]||0)){ best[k]=r.best_score; pulled=true; }
    });
    if(pulled){
      if(live()){ G.totalStars=getTotalStarsReal(); saveGame(); olRefreshScreens(); }
      else saveUserData(u);
    }

    // 2) İlerleme: yerelde daha iyi olanları gönder
    const ins=[], upd=[];
    let totStars=0, totScore=0, done=0;
    bp.forEach((p,b)=>(p && p.stars || []).forEach((s,l)=>{
      const k=b+'-'+l, sc=best[k]||0;
      totStars+=s||0; totScore+=sc; if(s>0) done++;
      if(!s && !sc) return;
      const r=remote.get(k);
      if(!r) ins.push({user_id:id, building_index:b, level_index:l, stars:s||0, best_score:sc});
      else if((s||0)>(r.stars||0) || sc>(r.best_score||0)) upd.push({b, l, stars:s||0, best_score:sc});
    }));
    if(ins.length) await olQ(sb.from('game_progress').insert(ins));
    for(const x of upd)
      await olQ(sb.from('game_progress').update({stars:x.stars, best_score:x.best_score})
        .eq('user_id', id).eq('building_index', x.b).eq('level_index', x.l));

    // 3-5) Birbirinden bağımsız adımlar: biri başarısız olursa diğerleri yine denenir
    const step=async (name, fn)=>{ try{ await fn(); }catch(e){ olWarn('sync:'+name, e); } };
    const cols=await olCols(sb);

    // 3) Altın / enerji (bu cihazın değeri)
    await step('users', async ()=>{
    const gd=live() ? {coins:G.coins, energy:G.energy} : (u.gameData||{});
    const urow={gold:gd.coins??0, energy:gd.energy??0};
    if(cols.users){ urow.last_seen=new Date().toISOString(); urow.avatar=u.avatar||null; }
    await olQ(sb.from('users').update(urow).eq('id', id));
    });

    // 4) Envanter (güçlendiriciler)
    await step('inventory', async ()=>{    const inv=u.inventory||{};
    const rinv=await olQ(sb.from('inventory').select('item_id,quantity').eq('user_id', id));
    const rmap=new Map((rinv||[]).map(r=>[String(r.item_id), r.quantity||0]));
    const invIns=[];
    for(const [item, q] of Object.entries(inv)){
      if(!rmap.has(item)){ if(q>0) invIns.push({user_id:id, item_id:item, quantity:q}); }
      else if(rmap.get(item)!==q) await olQ(sb.from('inventory').update({quantity:q}).eq('user_id', id).eq('item_id', item));
      rmap.delete(item);
    }
    for(const [item, q] of rmap) if(q!==0) await olQ(sb.from('inventory').update({quantity:0}).eq('user_id', id).eq('item_id', item));
    if(invIns.length) await olQ(sb.from('inventory').insert(invIns));
    });

    // 5) Liderlik satırı
    await step('leaderboard', async ()=>{    const lb={username:u.username, total_stars:totStars, total_score:totScore, levels_completed:done};
    const lbr=await olQ(sb.from('leaderboard').select(cols.lb ? 'user_id,week_key,week_stars' : 'user_id').eq('user_id', id).limit(1));
    if(cols.lb){
      const wk=olWeekKey(), ws=u.weekStars && u.weekStars.wk===wk ? u.weekStars.n : 0;
      const r=lbr && lbr[0];
      lb.week_key=wk;
      lb.week_stars=r && r.week_key===wk ? Math.max(r.week_stars||0, ws) : ws;
    }
    if(lbr && lbr.length) await olQ(sb.from('leaderboard').update(lb).eq('user_id', id));
    else await olQ(sb.from('leaderboard').insert(Object.assign({user_id:id}, lb)));
    });

    OL.lastOk=Date.now();
  }catch(e){
    olWarn('sync', e);   // sessizce yerel kayda dön
  }finally{
    OL.syncing=false;
    olStatus();
    if(OL.again){ OL.again=false; olQueueSync(800); }
  }
}

// Başka cihazdan gelen ilerlemeyi açık ekrana yansıt
function olRefreshScreens(){
  const active=document.querySelector('.screen.active')?.id;
  const safe=fn=>{ try{ fn(); }catch(e){} };
  safe(()=>{ updateCoinsUI(); updateEnergyUI(); });
  if(active==='mapScreen') safe(()=>{ renderMapPins(); renderMapItems(); });
  if(active==='cityScreen') safe(()=>showCityScreen());
  if(active==='profileScreen' && !OL.frTab) safe(()=>showProfileScreen());   // sekme 'me' olarak kalır
}

// Profil başlığındaki bulut durumu
function olStatus(){
  const el=document.getElementById('sbStatus');
  if(!el) return;
  const u=CURRENT_USER;
  let k='ol_st_on', cls='on';
  if(!u){ el.textContent=''; return; }
  if(u.sbConflict || (u.sbId==null && !u.sbHash)){ k='ol_st_local'; cls='local'; }
  else if(!olOnline() || (u.sbId==null && !OL.syncing)){ k='ol_st_off'; cls='off'; }
  else if(OL.syncing){ k='ol_st_sync'; cls='sync'; }
  el.textContent=t(k);
  el.className='sb-status '+cls;
}

// ── Giriş / kayıt / çıkış sarmalayıcıları ──
const _olOrigDoRegister = doRegister;
doRegister = async function(){
  const name=document.getElementById('regName').value.trim();
  const pass=document.getElementById('regPass').value;
  const errEl=document.getElementById('regErr');
  const btn=document.querySelector('#panelKayit .btn');
  // Ad yerelde boşsa çevrimiçi de alınmış mı? (kontrol başarısızsa yerel kayıtla devam)
  if(name.length>=2 && pass.length>=4 && pass===document.getElementById('regPass2').value && !getUserData(name) && olOnline()){
    if(btn) btn.disabled=true;
    try{
      const sb=await olTimeout(olClient(), 4000).catch(()=>null);
      if(sb && await olFindUser(sb, name)){
        errEl.textContent=t('ol_name_taken'); errEl.classList.add('show');
        return;
      }
    }catch(e){ olWarn('register-check', e); }
    finally{ if(btn) btn.disabled=false; }
  }
  const before=getAllUsers().length;
  const res=_olOrigDoRegister.apply(this, arguments);
  const u=getAllUsers().length>before ? getUserData(name) : null;
  if(u){
    u.sbHash=await olHash(name, pass);
    saveUserData(u);
    try{
      const sb=olOnline() && await olClient();
      if(sb) await olEnsureAccount(sb, u);
    }catch(e){ olWarn('register', e); }   // çevrimdışı: hesap ilk senkronda açılır
  }
  return res;
};

const _olOrigDoLogin = doLogin;
doLogin = async function(){
  const name=document.getElementById('loginName').value.trim();
  const pass=document.getElementById('loginPass').value;
  const local=getUserData(name);
  const args=arguments;
  const finish=()=>{
    const r=_olOrigDoLogin.apply(this, args);
    if(CURRENT_USER){ olSetUid(CURRENT_USER.sbId); olAfterLogin(); }
    return r;
  };
  const hash=await olHash(name, pass);

  // 1) Bu cihazda kayıtlı ve şifre doğru → hemen gir, bulut arkadan eşitlenir
  if(local && local.passwordHash===simpleHash(pass)){
    if(local.sbHash!==hash){ local.sbHash=hash; saveUserData(local); }
    return finish();
  }
  // 2) Bu cihazda yok (ya da şifre başka cihazda değişti) → buluttan dene
  if(!olOnline() || !name || !pass) return finish();
  const btn=document.querySelector('#panelGiris .btn');
  if(btn) btn.disabled=true;
  try{
    const sb=await olTimeout(olClient(), 5000).catch(()=>null);
    const r=sb && await olFindUser(sb, name);
    if(r && r.password_hash===hash && !(local && local.sbConflict)){
      const u=local || await olRestoreUser(sb, r);
      u.passwordHash=simpleHash(pass); u.sbHash=hash; u.sbId=r.id; delete u.sbConflict;
      saveUserData(u);
      document.getElementById('loginName').value=u.username;
      if(!local) setTimeout(()=>showToast(t('ol_restored'), 'success'), 900);
    }
  }catch(e){ olWarn('login', e); }
  finally{ if(btn) btn.disabled=false; }
  return finish();   // eşleşme yoksa mevcut "hatalı" mesajını gösterir
};

// Buluttaki hesaptan bu cihaz için yerel profil oluştur
async function olRestoreUser(sb, r){
  const [rows, inv]=await Promise.all([
    olQ(sb.from('game_progress').select('building_index,level_index,stars,best_score').eq('user_id', r.id)).catch(()=>[]),
    olQ(sb.from('inventory').select('item_id,quantity').eq('user_id', r.id)).catch(()=>[]),
  ]);
  const bp=BUILDINGS.map(b=>({stars:b.levels.map(()=>0)}));
  const best={};
  (rows||[]).forEach(x=>{
    const p=bp[x.building_index];
    if(p && x.level_index<p.stars.length) p.stars[x.level_index]=Math.min(3, x.stars||0);
    if(x.best_score) best[x.building_index+'-'+x.level_index]=x.best_score;
  });
  const stars=bp.reduce((a,p)=>a+p.stars.reduce((x,y)=>x+y,0),0);
  const inventory={};
  (inv||[]).forEach(x=>{ if(x.quantity>0) inventory[x.item_id]=x.quantity; });
  const u={
    username:r.username,
    avatar:r.avatar||AVATARS[0],
    createdAt:Date.now(),
    gameData:{energy:r.energy??5, lastEnergyTime:Date.now(), coins:r.gold??100, totalStars:stars,
              buildingProgress:bp, civVersion:2, mapCiv:null},
    stats:{gamesPlayed:0, wins:0, losses:0, totalStars:stars, totalCoins:r.gold??100, energyUsed:0, maxStarsInGame:0},
    achievements:[],
    bestScores:best,
    inventory,
  };
  if(!stars) u.tutorial={};   // hiç oynamamış hesap → öğretici açılsın
  return u;
}

function olAfterLogin(){
  OL.rel=null;
  olStatus();
  olQueueSync(300);
  olStartHeartbeat();
}

const _olOrigDoLogout = doLogout;
doLogout = function(){
  if(CURRENT_USER){ syncGameToUser(); olSync(); }   // son durumu buluta gönder (CURRENT_USER yakalanır)
  olSetUid(null);
  olStopHeartbeat();
  OL.rel=null; OL.challenge=null;
  olBadge(0);
  return _olOrigDoLogout.apply(this, arguments);
};

// ── Bölüm sonu: haftalık yıldız, arkadaş hedefi, senkron ──
const _olOrigShowResult = showResult;
showResult = function(win){
  const b=selectedBuilding, l=selectedLevel;
  const before=CURRENT_USER ? getTotalStarsReal() : 0;
  const res=_olOrigShowResult.apply(this, arguments);
  const u=CURRENT_USER;
  if(u){
    const gained=getTotalStarsReal()-before;
    if(gained>0){
      const wk=olWeekKey();
      if(!u.weekStars || u.weekStars.wk!==wk) u.weekStars={wk, n:0};
      u.weekStars.n+=gained;
      saveUserData(u);
    }
    const c=OL.challenge;
    if(c && c.b===b && c.l===l && G.score>c.score){
      OL.challenge=null;
      setTimeout(()=>showToast(t('ol_fr_beaten',[c.name, olNum(G.score)]), 'success'), 1300);
    }
    olQueueSync();
  }
  return res;
};

// ── Liderlik tablosu ──
function showLeaderboardScreen(){
  showScreen('leaderboardScreen');
  lbSetTab(OL.lbTab);
}

function lbSetTab(tab){
  OL.lbTab=tab;
  document.querySelectorAll('.lb-tab').forEach(b=>b.classList.toggle('active', b.dataset.lb===tab));
  lbRenderCached();
  lbLoad();
}

function lbCache(){ try{ return JSON.parse(localStorage.getItem(OL_LB_CACHE)||'{}')||{}; }catch(e){ return {}; } }

function lbRenderCached(){
  const c=lbCache()[OL.lbTab];
  if(c) lbRender(c.rows, c.me, '');
  else lbRender(null, null, t('ol_loading'));
}

async function lbRefresh(){
  const btn=document.getElementById('lbRefresh');
  btn.classList.add('spin');
  if(CURRENT_USER) await olSync();   // kendi satırın güncel olsun
  await lbLoad();
  setTimeout(()=>btn.classList.remove('spin'), 400);
}

async function lbLoad(){
  const tab=OL.lbTab;
  const cached=lbCache()[tab];
  const fail=key=>{ if(OL.lbTab===tab) lbRender(cached ? cached.rows : null, cached ? cached.me : null, t(cached ? 'ol_lb_offline' : key)); };
  if(!olOnline()) return fail('ol_lb_nodata');
  try{
    const sb=await olClient();
    if(!sb) return fail('ol_lb_nodata');
    if(OL.syncP) await OL.syncP;   // girişten hemen sonra açıldıysa kendi satırın yazılsın
    const cols=await olCols(sb);
    if(tab==='week' && !cols.lb){ lbRender([], null, t('ol_lb_week_na')); return; }
    const week=tab==='week', wk=olWeekKey();
    let q=sb.from('leaderboard').select('user_id,username,total_stars,total_score,levels_completed'+(week ? ',week_stars' : ''));
    q=week ? q.eq('week_key', wk).gt('week_stars', 0).order('week_stars', {ascending:false})
           : q.order('total_stars', {ascending:false});
    const rows=await olQ(q.order('total_score', {ascending:false}).limit(50));

    // Kendi sıran (ilk 50 dışındaysa sayımla bulunur)
    let me=null;
    const u=CURRENT_USER, id=u && u.sbId;
    if(id!=null){
      const i=rows.findIndex(r=>String(r.user_id)===String(id));
      if(i>=0) me={rank:i+1, row:rows[i]};
      else {
        const mine=await olQ(sb.from('leaderboard').select('user_id,username,total_stars,total_score,levels_completed'+(week ? ',week_key,week_stars' : '')).eq('user_id', id).limit(1));
        const r=mine && mine[0];
        if(r){
          const v=week ? (r.week_key===wk ? r.week_stars||0 : 0) : r.total_stars||0;
          let cq=sb.from('leaderboard').select('user_id', {count:'exact', head:true});
          cq=week ? cq.eq('week_key', wk).gt('week_stars', v) : cq.gt('total_stars', v);
          const above=await olQ(cq);
          me={rank:v>0 || !week ? (above||0)+1 : null, row:Object.assign({}, r, {week_stars:v})};
        }
      }
    }
    const all=lbCache(); all[tab]={rows, me, ts:Date.now()};
    try{ localStorage.setItem(OL_LB_CACHE, JSON.stringify(all)); }catch(e){}
    if(OL.lbTab===tab) lbRender(rows, me, rows.length ? '' : t(week ? 'ol_lb_week_empty' : 'ol_lb_empty'));
  }catch(e){
    olWarn('leaderboard', e);
    fail('ol_lb_nodata');
  }
}

function lbRender(rows, me, note){
  const week=OL.lbTab==='week';
  const myId=CURRENT_USER && CURRENT_USER.sbId;
  const isMe=r=>myId!=null && String(r.user_id)===String(myId);
  const val=r=>week ? r.week_stars||0 : r.total_stars||0;
  const pod=document.getElementById('lbPodium'), list=document.getElementById('lbList'), meEl=document.getElementById('lbMe');
  rows=rows||[];

  // İlk üç: ziggurat basamakları (2 · 1 · 3)
  const top=[rows[1], rows[0], rows[2]];
  pod.innerHTML=rows.length ? top.map((r,i)=>{
    const rank=[2,1,3][i];
    if(!r) return `<div class="lb-pod r${rank} empty"></div>`;
    return `<div class="lb-pod r${rank}${isMe(r) ? ' me' : ''}">
      <div class="lb-pod-medal">${['🥇','🥈','🥉'][rank-1]}</div>
      <div class="lb-pod-name" data-no-i18n>${olEsc(r.username)}</div>
      <div class="lb-pod-val" data-no-i18n>⭐ ${olNum(val(r))}</div>
      <div class="lb-pod-step"><span>${rank}</span></div>
    </div>`;
  }).join('') : '';
  pod.style.display=rows.length ? '' : 'none';

  list.innerHTML=(note ? `<div class="lb-note">${olEsc(note)}</div>` : '')+rows.slice(3).map((r,i)=>lbRow(r, i+4, isMe(r), week)).join('');

  const u=CURRENT_USER;
  if(!u){ meEl.innerHTML=''; return; }
  if(myId==null){ meEl.innerHTML=`<div class="lb-me-local">${olEsc(t('ol_lb_local'))}</div>`; return; }
  const mr=me && me.row || {username:u.username, total_stars:getTotalStarsReal(),
    total_score:Object.values(u.bestScores||{}).reduce((a,b)=>a+(b||0),0),
    levels_completed:G.buildingProgress.reduce((a,p)=>a+p.stars.filter(x=>x>0).length,0),
    week_stars:u.weekStars && u.weekStars.wk===olWeekKey() ? u.weekStars.n : 0};
  meEl.innerHTML=lbRow(mr, me && me.rank, true, week, true);
}

function lbRow(r, rank, me, week, pinned){
  const v=week ? r.week_stars||0 : r.total_stars||0;
  const sub=`🏛 ${t('ol_levels',[olNum(r.levels_completed)])} · ${t('ol_pts',[olNum(r.total_score)])}`;
  return `<div class="lb-row${me ? ' me' : ''}${pinned ? ' pinned' : ''}" data-no-i18n>
    <div class="lb-rank">${rank??'—'}</div>
    <div class="lb-info">
      <div class="lb-name">${olEsc(r.username)}${me ? ` <span class="lb-you">${olEsc(t('ol_you'))}</span>` : ''}</div>
      <div class="lb-sub">${olEsc(sub)}${pinned && rank>50 ? ' · '+olEsc(t('ol_rank_out')) : ''}</div>
    </div>
    <div class="lb-val">⭐ ${olNum(v)}</div>
  </div>`;
}

// ── Profil sekmeleri ──
function pfSetTab(tab){
  OL.frTab=tab==='friends';
  document.querySelectorAll('.pf-tab').forEach(b=>b.classList.toggle('active', b.dataset.pf===tab));
  document.querySelectorAll('#profileScreen .profile-body > .profile-section').forEach(s=>{ s.style.display=OL.frTab ? 'none' : ''; });
  document.getElementById('friendsPanel').style.display=OL.frTab ? '' : 'none';
  if(OL.frTab){ frRender(); frLoad(); }
}

const _olOrigShowProfile = showProfileScreen;
showProfileScreen = function(){
  const res=_olOrigShowProfile.apply(this, arguments);
  if(document.getElementById('profileScreen').classList.contains('active')){
    pfSetTab(OL.pfWant||'me');
    OL.pfWant=null;
    olStatus();
  }
  return res;
};
function showFriendsTab(){ OL.pfWant='friends'; showProfileScreen(); }

// ── Arkadaşlar ──
// friends satırı: user_id → isteği gönderen, friend_id → alan; status 'pending' | 'accepted'
async function frFetch(sb, id){
  const rels=await olQ(sb.from('friends').select('user_id,friend_id,status').or(`user_id.eq.${id},friend_id.eq.${id}`));
  const other=r=>String(r.user_id)===String(id) ? r.friend_id : r.user_id;
  const ids=[...new Set((rels||[]).map(other))];
  const cols=await olCols(sb);
  const [users, lbs]=ids.length ? await Promise.all([
    olQ(sb.from('users').select(cols.users ? 'id,username,avatar,last_seen' : 'id,username').in('id', ids)),
    olQ(sb.from('leaderboard').select('user_id,total_stars,total_score,levels_completed').in('user_id', ids)),
  ]) : [[], []];
  const umap=new Map((users||[]).map(x=>[String(x.id), x]));
  const lmap=new Map((lbs||[]).map(x=>[String(x.user_id), x]));
  const out={incoming:[], outgoing:[], friends:[], hasSeen:cols.users};
  (rels||[]).forEach(r=>{
    const oid=other(r), us=umap.get(String(oid));
    if(!us) return;
    const lb=lmap.get(String(oid))||{};
    const p={id:oid, name:us.username, avatar:us.avatar||'👤', seen:us.last_seen ? Date.parse(us.last_seen) : 0,
             stars:lb.total_stars||0, score:lb.total_score||0, levels:lb.levels_completed||0};
    if(r.status==='accepted') out.friends.push(p);
    else if(String(r.friend_id)===String(id)) out.incoming.push(p);
    else out.outgoing.push(p);
  });
  out.friends.sort((a,b)=>b.stars-a.stars || b.score-a.score);
  return out;
}

async function frLoad(){
  const u=CURRENT_USER;
  if(!u || u.sbId==null || !olOnline()){ frRender(); return; }
  try{
    const sb=await olClient();
    if(!sb) return frRender();
    frApply(await frFetch(sb, u.sbId));
  }catch(e){ olWarn('friends', e); frRender(); }
}

// Yeni ilişkileri öncekiyle karşılaştır → bildirim + rozet
function frApply(rel){
  const prev=OL.rel;
  OL.rel=rel;
  if(prev){
    const newIn=rel.incoming.filter(p=>!prev.incoming.some(q=>String(q.id)===String(p.id)));
    if(newIn.length) showToast(t('ol_fr_new_req',[newIn.length]), 'info');
    rel.friends.forEach(p=>{
      if(prev.outgoing.some(q=>String(q.id)===String(p.id))) showToast(t('ol_fr_got_acc',[p.name]), 'success');
    });
  } else if(rel.incoming.length) showToast(t('ol_fr_new_req',[rel.incoming.length]), 'info');
  olBadge(rel.incoming.length);
  if(OL.frTab && document.getElementById('profileScreen').classList.contains('active')) frRender();
}

function olBadge(n){
  document.querySelectorAll('.pf-badge').forEach(el=>{ el.textContent=n>0 ? n : ''; el.classList.toggle('show', n>0); });
}

function frRender(){
  const u=CURRENT_USER, rel=OL.rel;
  const msg=document.getElementById('frMsg');
  const ok=u && u.sbId!=null && olOnline();
  document.getElementById('frAddRow').classList.toggle('disabled', !ok);
  if(!ok){ msg.textContent=t('ol_fr_need_online'); msg.className='fr-msg warn'; }
  else if(msg.classList.contains('warn')){ msg.textContent=''; msg.className='fr-msg'; }

  const inList=rel ? rel.incoming : [], outList=rel ? rel.outgoing : [], frs=rel ? rel.friends : [];
  document.getElementById('frInSec').style.display=inList.length ? '' : 'none';
  document.getElementById('frOutSec').style.display=outList.length ? '' : 'none';
  document.getElementById('frIn').innerHTML=inList.map(p=>`
    <div class="fr-row" data-no-i18n>
      <div class="fr-av">${olEsc(p.avatar)}</div>
      <div class="fr-info"><div class="fr-name">${olEsc(p.name)}</div><div class="fr-sub">⭐ ${olNum(p.stars)}</div></div>
      <button class="fr-btn ok" onclick="frRespond('${olEsc(p.id)}',true)" aria-label="✓">✓</button>
      <button class="fr-btn no" onclick="frRespond('${olEsc(p.id)}',false)" aria-label="✕">✕</button>
    </div>`).join('');
  document.getElementById('frOut').innerHTML=outList.map(p=>`
    <div class="fr-row" data-no-i18n>
      <div class="fr-av">${olEsc(p.avatar)}</div>
      <div class="fr-info"><div class="fr-name">${olEsc(p.name)}</div><div class="fr-sub">⏳ ${olEsc(t('ol_fr_wait'))}</div></div>
      <button class="fr-btn no" onclick="frRemove('${olEsc(p.id)}')" aria-label="✕">✕</button>
    </div>`).join('');

  const myScore=Object.values((u && u.bestScores)||{}).reduce((a,b)=>a+(b||0),0);
  const now=Date.now();
  document.getElementById('frCount').textContent=frs.length ? '('+frs.length+')' : '';
  document.getElementById('frList').innerHTML=frs.length ? frs.map(p=>{
    const on=rel.hasSeen && now-p.seen<OL_ONLINE_MS;
    const diff=myScore-p.score;
    const cmp=diff>0 ? `<span class="fr-cmp up">${olEsc(t('ol_fr_ahead',[olNum(diff)]))}</span>`
            : diff<0 ? `<span class="fr-cmp down">${olEsc(t('ol_fr_behind',[olNum(-diff)]))}</span>`
            : `<span class="fr-cmp">${olEsc(t('ol_fr_tie'))}</span>`;
    return `<div class="fr-row friend" data-no-i18n>
      <div class="fr-av">${olEsc(p.avatar)}${rel.hasSeen ? `<i class="fr-dot${on ? ' on' : ''}" title="${olEsc(t(on ? 'ol_fr_on' : 'ol_fr_off'))}"></i>` : ''}</div>
      <div class="fr-info">
        <div class="fr-name">${olEsc(p.name)}${rel.hasSeen ? ` <span class="fr-state${on ? ' on' : ''}">${olEsc(t(on ? 'ol_fr_on' : 'ol_fr_off'))}</span>` : ''}</div>
        <div class="fr-sub">⭐ ${olNum(p.stars)} · ${olEsc(t('ol_pts',[olNum(p.score)]))}</div>
        <div>${cmp}</div>
      </div>
      <button class="fr-beat" onclick="frBeat('${olEsc(p.id)}')">${olEsc(t('ol_fr_beat'))}</button>
      <button class="fr-btn no small" onclick="frRemove('${olEsc(p.id)}',true)" aria-label="✕">✕</button>
    </div>`;
  }).join('') : `<div class="fr-empty">${olEsc(t(ok ? 'ol_fr_none' : 'ol_fr_need_online'))}</div>`;
}

function frSay(key, vars, warn){
  const msg=document.getElementById('frMsg');
  msg.textContent=t(key, vars); msg.className='fr-msg'+(warn ? ' warn' : ' good');
}

async function frAdd(){
  const inp=document.getElementById('frAddName');
  const name=inp.value.trim(), u=CURRENT_USER;
  if(!name || !u || u.sbId==null || !olOnline()) return frRender();
  if(name.toLowerCase()===u.username.toLowerCase()) return frSay('ol_fr_self', null, true);
  try{
    const sb=await olClient();
    if(!sb) return frSay('ol_fr_err', null, true);
    const r=await olFindUser(sb, name);
    if(!r) return frSay('ol_fr_notfound', null, true);
    const me=u.sbId, them=r.id;
    const ex=await olQ(sb.from('friends').select('user_id,friend_id,status')
      .or(`and(user_id.eq.${me},friend_id.eq.${them}),and(user_id.eq.${them},friend_id.eq.${me})`));
    const theirReq=(ex||[]).find(x=>String(x.user_id)===String(them) && x.status==='pending');
    if(theirReq){ await frRespond(them, true); inp.value=''; return; }   // o da bizi eklemiş → kabul et
    if(ex && ex.length) return frSay('ol_fr_exists', null, true);
    await olQ(sb.from('friends').insert({user_id:me, friend_id:them, status:'pending'}));
    inp.value='';
    frSay('ol_fr_sent', [r.username]);
    frLoad();
  }catch(e){ olWarn('friend-add', e); frSay('ol_fr_err', null, true); }
}

async function frRespond(fromId, accept){
  const u=CURRENT_USER;
  if(!u || u.sbId==null) return;
  try{
    const sb=await olClient();
    if(!sb) return;
    const q=sb.from('friends');
    if(accept) await olQ(q.update({status:'accepted'}).eq('user_id', fromId).eq('friend_id', u.sbId));
    else await olQ(q.delete().eq('user_id', fromId).eq('friend_id', u.sbId));
    if(accept){
      const p=OL.rel && OL.rel.incoming.find(x=>String(x.id)===String(fromId));
      if(p) frSay('ol_fr_accepted', [p.name]);
    }
    await frLoad();
  }catch(e){ olWarn('friend-respond', e); frSay('ol_fr_err', null, true); }
}

async function frRemove(otherId, ask){
  const u=CURRENT_USER;
  if(!u || u.sbId==null) return;
  const p=OL.rel && OL.rel.friends.find(x=>String(x.id)===String(otherId));
  if(ask && p && !confirm(t('ol_fr_remove_q',[p.name]))) return;
  try{
    const sb=await olClient();
    if(!sb) return;
    const me=u.sbId;
    await olQ(sb.from('friends').delete()
      .or(`and(user_id.eq.${me},friend_id.eq.${otherId}),and(user_id.eq.${otherId},friend_id.eq.${me})`));
    await frLoad();
  }catch(e){ olWarn('friend-remove', e); }
}

// "Geç!": arkadaşın senden yüksek skor yaptığı, senin de açabildiğin en yakın farkla bölümü aç
function olCanPlay(b, l){
  const B=BUILDINGS[b], bp=G.buildingProgress[b];
  if(!B || !bp || l>=B.levels.length) return false;
  try{ if(!isBuildingUnlocked(b)) return false; }catch(e){ return false; }
  return l===0 || (bp.stars[l-1]||0)>0;
}
async function frBeat(fid){
  const u=CURRENT_USER;
  const p=OL.rel && OL.rel.friends.find(x=>String(x.id)===String(fid));
  if(!u || !p) return;
  try{
    const sb=await olClient();
    if(!sb) return;
    const rows=await olQ(sb.from('game_progress').select('building_index,level_index,best_score').eq('user_id', fid));
    const best=u.bestScores||{};
    const ahead=(rows||[]).filter(r=>(r.best_score||0)>(best[r.building_index+'-'+r.level_index]||0));
    const cand=ahead.filter(r=>olCanPlay(r.building_index, r.level_index))
      .sort((a,b)=>(a.best_score-(best[a.building_index+'-'+a.level_index]||0))-(b.best_score-(best[b.building_index+'-'+b.level_index]||0)));
    if(!cand.length){ showToast(t(ahead.length ? 'ol_fr_beat_locked' : 'ol_fr_beat_none', [p.name]), ahead.length ? 'warning' : 'success'); return; }
    const c=cand[0];
    OL.challenge={b:c.building_index, l:c.level_index, score:c.best_score, name:p.name};
    _openLevelAtIndex(c.building_index, c.level_index);
    showToast(t('ol_fr_beat_go',[p.name, olNum(c.best_score)]), 'info');
  }catch(e){ olWarn('friend-beat', e); }
}

// ── Nabız: çevrimiçi durumu + arkadaşlık bildirimleri (dakikada bir, sekme görünürken) ──
async function olBeat(){
  const u=CURRENT_USER;
  if(!u || u.sbId==null || !olOnline() || document.visibilityState==='hidden') return;
  try{
    const sb=await olClient();
    if(!sb) return;
    if((await olCols(sb)).users) await olQ(sb.from('users').update({last_seen:new Date().toISOString()}).eq('id', u.sbId));
    if(CURRENT_USER===u) frApply(await frFetch(sb, u.sbId));
  }catch(e){ olWarn('heartbeat', e); }
}
function olStartHeartbeat(){
  olStopHeartbeat();
  setTimeout(olBeat, 2500);
  OL.hb=setInterval(olBeat, 60000);
}
function olStopHeartbeat(){ clearInterval(OL.hb); OL.hb=null; }

// ── İnternet gelince / uygulamaya dönünce otomatik senkron ──
window.addEventListener('online', ()=>{ olStatus(); if(CURRENT_USER){ olQueueSync(500); olBeat(); } });
window.addEventListener('offline', olStatus);
document.addEventListener('visibilitychange', ()=>{
  if(!CURRENT_USER) return;
  if(document.visibilityState==='hidden'){ syncGameToUser(); olSync(); }
  else { olQueueSync(500); olBeat(); }
});

// Dil değişince açık çevrimiçi ekranları yeniden çiz
const _olOrigSetLanguage = setLanguage;
setLanguage = function(){
  const wasFr=OL.frTab;
  if(wasFr) OL.pfWant='friends';   // profil yeniden çizilirken arkadaş sekmesi açık kalsın
  const res=_olOrigSetLanguage.apply(this, arguments);
  OL.pfWant=null;
  const active=document.querySelector('.screen.active')?.id;
  if(active==='leaderboardScreen') lbRenderCached();
  if(active==='profileScreen') olStatus();
  return res;
};

// ── Harita liderliği: ilk 10, harita açıkken 30 sn'de bir yenilenir ──
// Geniş ekran: oyun alanının sağında 200px panel (#mapLbPanel).
// Dar ekran / mobil: haritanın içinde sağ üstte küçük kart (#mapMiniLb) — mini (ilk 3) / açık (ilk 10) / simge.
const MLB_CACHE = 'babil_mlb_cache';
const MLB_MODE  = 'babil_mlb_mode';
const MLB_EVERY = 30000;
const MLB = {rows:null, me:null, note:'', mode:'mini'};
try{ const m=localStorage.getItem(MLB_MODE); if(m==='mini' || m==='open' || m==='pill') MLB.mode=m; }catch(e){}
function mlbVisible(){ return document.body.classList.contains('map-on') && document.visibilityState!=='hidden'; }

// Harita içi kartı oluştur (bir kez)
(function mlbMiniInit(){
  const host=document.getElementById('mapScreen');
  if(!host || document.getElementById('mapMiniLb')) return;
  const el=document.createElement('div');
  el.id='mapMiniLb';
  el.className='map-mlb';
  el.innerHTML=`
    <button class="map-mlb-pill" onclick="mlbSetMode('mini')" aria-label="Liderlik"><span>🏆</span><b id="mapMiniRank" data-no-i18n></b></button>
    <div class="map-mlb-card">
      <div class="map-mlb-head">
        <button class="map-mlb-title" onclick="mlbSetMode(MLB.mode==='open'?'mini':'open')">🏆 Liderlik <i class="map-mlb-chev">▾</i></button>
        <button class="map-mlb-min" onclick="mlbSetMode('pill')" aria-label="Küçült">–</button>
      </div>
      <div class="map-mlb-list" id="mapMiniList"></div>
      <button class="map-mlb-more" onclick="showLeaderboardScreen()">Tümünü gör →</button>
    </div>`;
  host.appendChild(el);
})();

function mlbSetMode(m){
  MLB.mode=m;
  try{ localStorage.setItem(MLB_MODE, m); }catch(e){}
  mlbPaint();
}

// Üst bar (medeniyet sekmeleriyle) yüksekliği değişebilir → kartı hemen altına yerleştir
function mlbPlace(){
  const el=document.getElementById('mapMiniLb'), hud=document.querySelector('#mapScreen .map-hud');
  if(el && hud && hud.offsetHeight) el.style.top=(hud.offsetHeight+8)+'px';
}

function mlbRender(rows, me, note){
  MLB.rows=rows||[]; MLB.me=me||null; MLB.note=note||'';
  mlbPaint();
}

function mlbPaint(){
  const rows=MLB.rows||[], note=MLB.note;
  const myId=CURRENT_USER && CURRENT_USER.sbId;
  const isMe=r=>myId!=null && String(r.user_id)===String(myId);
  const row=(r, rank, cls)=>`<div class="${cls}-row${isMe(r) ? ' me' : ''}${rank<=3 ? ' top' : ''}" data-no-i18n>
    <span class="${cls}-rank">${rank<=3 ? ['🥇','🥈','🥉'][rank-1] : rank}</span>
    <span class="${cls}-name">${olEsc(r.username)}</span>
    <span class="${cls}-stars">⭐ ${olNum(r.total_stars)}</span>
  </div>`;
  const i=rows.findIndex(isMe);
  const mine=i>=0 ? {rank:i+1, row:rows[i]} : MLB.me;   // kendi sıran (ilk 10 içinde ya da dışında)
  const list=(n, cls)=>{
    const top=rows.slice(0, n);
    let html=top.map((r,k)=>row(r, k+1, cls)).join('');
    if(mine && mine.rank>top.length) html+=`<div class="${cls}-gap">⋮</div>`+row(mine.row, mine.rank, cls);
    return (note ? `<div class="${cls}-note">${olEsc(note)}</div>` : '')+html;
  };
  const side=document.getElementById('mapLbList');
  if(side) side.innerHTML=list(10, 'map-lb');
  const mini=document.getElementById('mapMiniLb');
  if(mini){
    mini.dataset.mode=MLB.mode;
    document.getElementById('mapMiniList').innerHTML=list(MLB.mode==='open' ? 10 : 3, 'map-mlb');
    document.getElementById('mapMiniRank').textContent=mine ? mine.rank+'.' : '';
    mlbPlace();
  }
}

async function mlbLoad(){
  if(!mlbVisible()) return;
  let cache=null;
  try{ cache=JSON.parse(localStorage.getItem(MLB_CACHE)||'null'); }catch(e){}
  const fallback=key=>mlbRender(cache && cache.rows, cache && cache.me, cache ? '' : t(key));
  if(!olOnline()) return fallback('ol_lb_nodata');
  try{
    const sb=await olClient();
    if(!sb) return fallback('ol_lb_nodata');
    const rows=await olQ(sb.from('leaderboard').select('user_id,username,total_stars,total_score')
      .order('total_stars', {ascending:false}).order('total_score', {ascending:false}).limit(10));
    let me=null;
    const id=CURRENT_USER && CURRENT_USER.sbId;
    if(id!=null && !rows.some(r=>String(r.user_id)===String(id))){
      const mine=await olQ(sb.from('leaderboard').select('user_id,username,total_stars,total_score').eq('user_id', id).limit(1));
      if(mine && mine[0]){
        const above=await olQ(sb.from('leaderboard').select('user_id', {count:'exact', head:true}).gt('total_stars', mine[0].total_stars||0));
        me={rank:(above||0)+1, row:mine[0]};
      }
    }
    try{ localStorage.setItem(MLB_CACHE, JSON.stringify({rows, me})); }catch(e){}
    if(mlbVisible()) mlbRender(rows, me, rows.length ? '' : t('ol_lb_empty'));
  }catch(e){
    olWarn('map-leaderboard', e);
    fallback('ol_lb_nodata');
  }
}

let _mlbTimer=null;
function mlbUpdate(){
  const on=mlbVisible();
  if(on && !_mlbTimer){ mlbLoad(); _mlbTimer=setInterval(mlbLoad, MLB_EVERY); }
  else if(!on && _mlbTimer){ clearInterval(_mlbTimer); _mlbTimer=null; }
}

const _mlbOrigShowScreen = showScreen;
showScreen = function(id){
  const res=_mlbOrigShowScreen.apply(this, arguments);
  document.body.classList.toggle('map-on', id==='mapScreen');
  mlbUpdate();
  return res;
};
window.addEventListener('resize', mlbPlace);
document.addEventListener('visibilitychange', mlbUpdate);
window.addEventListener('online', ()=>{ if(mlbVisible()) mlbLoad(); });
// Bölüm sonrası senkron bitince haritaya dönüldüğünde güncel sıra görünsün
const _mlbOrigSyncRun = olSyncRun;
olSyncRun = async function(){
  const res=await _mlbOrigSyncRun.apply(this, arguments);
  if(mlbVisible()) mlbLoad();
  return res;
};
document.body.classList.toggle('map-on', !!document.getElementById('mapScreen')?.classList.contains('active'));
mlbUpdate();

// initAuth() otomatik giriş yaptıysa (29-land.js) bu dosyadan önce çalışmıştır → burada başlat
if(CURRENT_USER){
  olSetUid(CURRENT_USER.sbId);
  olAfterLogin();
}
