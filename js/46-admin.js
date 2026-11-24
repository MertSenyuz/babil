// ══════════════════════════════════════════════
// YÖNETİCİ PANELİ — yalnızca G.role === 'admin' olan kullanıcıya görünür
// Haritada sağ üstte "⚙ Yönetici" butonu; tıklanınca kullanıcı listesi + banla/ban kaldır + liderlik sıfırla.
// Rol/ban bilgisi buluttan okunur (43-online.js → olLoadRole, users.role / users.banned sütunları).
//
// ⚠ GÜVENLİK: Bu panel yalnızca ARAYÜZ kapısıdır. Oyun 'anon' anahtarıyla bağlanır ve
// setup.sql varsayılan olarak anon'a tüm tablolarda yazma izni verir — yani bu sorgular
// teknik olarak herkesçe çalıştırılabilir. Gerçek koruma için Supabase'de RLS politikaları
// (örn. yalnızca belirli bir admin'in users.banned / leaderboard yazabilmesi) gerekir.
// Kod gizleme (obfuscation) bunu DEĞİŞTİRMEZ; sadece okumayı zorlaştırır.
// ══════════════════════════════════════════════
(function adminInit(){
  const host = document.getElementById('mapScreen');
  if(!host || document.getElementById('adminBtn')) return;

  document.head.insertAdjacentHTML('beforeend', `<style>
    #adminBtn{position:absolute;top:10px;right:10px;z-index:40;display:none;align-items:center;gap:5px;
      padding:7px 11px;border:1px solid #c0392b;border-radius:10px;background:rgba(40,12,10,.82);
      color:#ffcdc8;font:600 12px/1 'Cinzel',serif;cursor:pointer;backdrop-filter:blur(4px);}
    #adminBtn:hover{background:rgba(70,18,14,.92);}
    body.admin-on #adminBtn{display:flex;}
    .adm-ov{position:fixed;inset:0;z-index:300;display:none;align-items:center;justify-content:center;
      background:rgba(0,0,0,.6);padding:16px;}
    .adm-ov.open{display:flex;}
    .adm-box{width:min(560px,100%);max-height:88vh;display:flex;flex-direction:column;
      background:var(--panel,#1a1410);border:1px solid var(--border,#5a4a30);border-radius:16px;overflow:hidden;}
    .adm-head{display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid var(--border,#5a4a30);}
    .adm-head b{flex:1;font:700 15px 'Cinzel',serif;color:#ffd7a0;}
    .adm-x{border:0;background:none;color:#caa;font-size:18px;cursor:pointer;}
    .adm-tools{display:flex;gap:8px;padding:10px 16px;border-bottom:1px solid var(--border,#5a4a30);flex-wrap:wrap;}
    .adm-tools button{padding:8px 12px;border:1px solid #8a3a2a;border-radius:9px;background:#2a1410;color:#ffcdc8;
      font:600 12px 'Cinzel',serif;cursor:pointer;}
    .adm-tools button:hover{background:#3a1a14;}
    .adm-list{overflow:auto;padding:8px 12px;}
    .adm-row{display:flex;align-items:center;gap:10px;padding:9px 8px;border-bottom:1px solid rgba(255,255,255,.06);}
    .adm-row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#eee;}
    .adm-row .tag{font-size:10px;padding:2px 6px;border-radius:6px;background:#3a2a1a;color:#f5c842;}
    .adm-row .tag.ban{background:#5a1a14;color:#ff9c90;}
    .adm-row .tag.adm{background:#143a2a;color:#9cffc0;}
    .adm-row button{padding:5px 10px;border-radius:7px;border:1px solid #8a3a2a;background:#2a1410;color:#ffcdc8;
      font-size:11px;cursor:pointer;white-space:nowrap;}
    .adm-row button.un{border-color:#2a7a4a;color:#9cffc0;}
    .adm-empty{padding:24px;text-align:center;color:#caa;}
  </style>`);

  host.insertAdjacentHTML('beforeend', `
    <button id="adminBtn" onclick="adminOpen()">⚙ Yönetici</button>`);

  document.body.insertAdjacentHTML('beforeend', `
    <div class="adm-ov" id="adminOverlay" onclick="if(event.target===this)adminClose()">
      <div class="adm-box" role="dialog" aria-label="Yönetici paneli">
        <div class="adm-head"><b>⚙ Yönetici Paneli</b>
          <button class="adm-x" onclick="adminClose()" aria-label="Kapat">✕</button></div>
        <div class="adm-tools">
          <button onclick="adminLoadUsers()">🔄 Yenile</button>
          <button onclick="adminResetLeaderboard()">🧹 Liderliği Sıfırla</button>
        </div>
        <div class="adm-list" id="adminList"><div class="adm-empty">…</div></div>
      </div>
    </div>`);
})();

// Butonu rol durumuna göre göster/gizle (olLoadRole bunu çağırır)
function adminRefreshBtn(){
  document.body.classList.toggle('admin-on', (typeof G!=='undefined') && G.role==='admin');
}

function adminClose(){ document.getElementById('adminOverlay')?.classList.remove('open'); }

function adminOpen(){
  if(G.role!=='admin'){ showToast('Yetkin yok.', 'warning'); return; }
  document.getElementById('adminOverlay').classList.add('open');
  adminLoadUsers();
}

// Supabase istemcisi hazır mı? (43-online.js globalleri)
async function adminSb(){
  if(typeof olClient!=='function'){ showToast('Çevrimiçi modül yüklenmedi.', 'warning'); return null; }
  if(!olOnline()){ showToast('Çevrimdışısın.', 'warning'); return null; }
  const sb = await olClient();
  if(!sb){ showToast('Sunucuya ulaşılamadı.', 'warning'); return null; }
  if(!(await olCols(sb)).role){ showToast('Veritabanında role/banned sütunları yok (setup.sql).', 'warning'); return null; }
  return sb;
}

async function adminLoadUsers(){
  const list = document.getElementById('adminList');
  list.innerHTML = '<div class="adm-empty">Yükleniyor…</div>';
  const sb = await adminSb(); if(!sb){ list.innerHTML = '<div class="adm-empty">Liste alınamadı.</div>'; return; }
  try{
    const rows = await olQ(sb.from('users').select('id,username,role,banned,gold').order('id', {ascending:true}).limit(500));
    if(!rows || !rows.length){ list.innerHTML = '<div class="adm-empty">Kullanıcı yok.</div>'; return; }
    list.innerHTML = rows.map(u=>{
      const nm = olEsc(u.username||'(adsız)');
      const isAdmin = u.role==='admin', banned = !!u.banned;
      const tags = (isAdmin ? '<span class="tag adm">admin</span>' : '')
                 + (banned ? '<span class="tag ban">banlı</span>' : '')
                 + `<span class="tag">🪙${u.gold??0}</span>`;
      const btn = isAdmin ? ''   // admin'i buradan banlama
        : `<button class="${banned?'un':''}" onclick="adminSetBan(${u.id}, ${banned?'false':'true'})">${banned?'Ban Kaldır':'Banla'}</button>`;
      return `<div class="adm-row" data-id="${u.id}"><span class="nm">${nm}</span>${tags}${btn}</div>`;
    }).join('');
  }catch(e){
    olWarn && olWarn('admin:users', e);
    list.innerHTML = '<div class="adm-empty">Hata: '+olEsc(e && (e.message||e))+'</div>';
  }
}

async function adminSetBan(id, banned){
  const sb = await adminSb(); if(!sb) return;
  try{
    await olQ(sb.from('users').update({banned}).eq('id', id));
    showToast(banned ? '⛔ Kullanıcı banlandı.' : '✅ Ban kaldırıldı.');
    adminLoadUsers();
  }catch(e){ showToast('İşlem başarısız: '+(e && (e.message||e)), 'warning'); }
}

async function adminResetLeaderboard(){
  if(!window.confirm('Liderlik tablosu sıfırlanacak — tüm oyuncuların puanları silinecek. Emin misin?')) return;
  const sb = await adminSb(); if(!sb) return;
  try{
    // Satırları silmek yerine puanları sıfırla (user_id bağlantısı korunur; oyuncular sonraki senkronda yeniden yazılır)
    await olQ(sb.from('leaderboard').update({total_stars:0, total_score:0, levels_completed:0, week_stars:0})
      .not('user_id', 'is', null));
    showToast('🧹 Liderlik tablosu sıfırlandı.');
  }catch(e){ showToast('Sıfırlama başarısız: '+(e && (e.message||e)), 'warning'); }
}
