// ══════════════════════════════════════════════
// TUTORIAL SİSTEMİ (3 aşama)
// Mevcut fonksiyonlar değiştirilmez; yalnızca sarmalanır.
// ══════════════════════════════════════════════
const TUT_KEY_WELCOME = 'babil_tutorial_done';       // Aşama 1: hoş geldin kartları
const TUT_KEY_SPOT    = 'babil_tutorial_spot_done';  // Aşama 2: ilk bölüm spotlight
const TUT_KEY_HELP    = 'babil_tutorial_help_seen';  // Aşama 3: "?" butonu ilk kez görüldü

// Öğretici durumu profil bazında tutulur: kullanıcı.tutorial = {babil_tutorial_done:true, ...}
// "tutorial" alanı olmayan (bu sistemden önce açılmış) profiller öğreticiyi tamamlamış sayılır.
let TUT_NEW_USER = null;   // kayıt olmuş ama henüz giriş yapmamış yeni profil
function tutProfile(){ return CURRENT_USER || (TUT_NEW_USER && getUserData(TUT_NEW_USER)) || null; }
function tutGet(k){
  const u=tutProfile();
  if(u) return !u.tutorial || !!u.tutorial[k];
  try{ return localStorage.getItem(k)==='1'; }catch(e){ return false; }
}
function tutSet(k){
  const u=tutProfile();
  if(u){ u.tutorial=u.tutorial||{}; u.tutorial[k]=true; saveUserData(u); }
  try{ localStorage.setItem(k,'1'); }catch(e){}
}
function tutDel(k){
  const u=tutProfile();
  if(u){ u.tutorial=u.tutorial||{}; u.tutorial[k]=false; saveUserData(u); }
  try{ localStorage.removeItem(k); }catch(e){}
}

// ── AŞAMA 1: HOŞ GELDİN KARTLARI ──
const TW = {idx:0, count:0, touchX:null, touchY:null};

function tutBuildDemoBoard(){
  const demo=document.getElementById('twDemo');
  if(!demo || demo.childElementCount) return;
  // 3x4 mini tahta: orta satırda ★ ile ♦ yer değiştirir → ♦♦♦
  const layout=[
    [['gem3','dim'],['gem5','dim'],['gem4','dim'],['gem6','dim']],
    [['gem1','sM'],['gem1','sM'],['gem2','sA'],['gem1','sB']],
    [['gem4','dim'],['gem2','dim'],['gem5','dim'],['gem3','dim']],
  ];
  layout.forEach(row=>row.forEach(([k,cls])=>{
    const g=document.createElement('div');
    g.className='tw-g '+cls;
    g.style.setProperty('--gc',GEMS[k].color);
    g.style.setProperty('--gb',GEMS[k].bg);
    g.textContent=GEMS[k].symbol;
    demo.appendChild(g);
  }));
  const hand=document.createElement('div'); hand.className='tw-hand'; hand.textContent='👆';
  const burst=document.createElement('div'); burst.className='tw-burst'; burst.textContent='+150';
  demo.appendChild(hand); demo.appendChild(burst);
}

function tutWelcomeOpen(){
  const wrap=document.getElementById('tutWelcome');
  if(!wrap) return;
  tutBuildDemoBoard();
  TW.count=wrap.querySelectorAll('.tw-slide').length;
  const dots=document.getElementById('twDots');
  dots.innerHTML='';
  for(let i=0;i<TW.count;i++){
    const d=document.createElement('button');
    d.className='tw-dot'; d.setAttribute('aria-label',`Adım ${i+1}`);
    d.onclick=()=>tutWelcomeGo(i);
    dots.appendChild(d);
  }
  wrap.classList.add('open');
  tutWelcomeGo(0);
  requestAnimationFrame(()=>requestAnimationFrame(()=>wrap.classList.add('show')));
}

function tutWelcomeGo(i){
  TW.idx=Math.max(0,Math.min(TW.count-1,i));
  document.getElementById('twTrack').style.transform=`translateX(${-TW.idx*100}%)`;
  document.getElementById('twProgress').style.width=`${(TW.idx+1)/TW.count*100}%`;
  document.querySelectorAll('#tutWelcome .tw-slide').forEach((s,j)=>{
    s.classList.toggle('cur',j===TW.idx);
    s.scrollTop=0;
    // Demo animasyonları her girişte baştan başlasın
    if(j===TW.idx) s.querySelectorAll('.tw-g,.tw-hand,.tw-burst').forEach(el=>{
      el.style.animation='none'; void el.offsetWidth; el.style.animation='';
    });
  });
  document.querySelectorAll('#twDots .tw-dot').forEach((d,j)=>d.classList.toggle('on',j===TW.idx));
  const last=TW.idx===TW.count-1;
  document.getElementById('twNext').textContent=last?'BAŞLA! ✦':'Devam Et →';
  document.getElementById('twSkip').style.visibility=last?'hidden':'visible';
  if(typeof SFX!=='undefined' && TW.idx>0) SFX.select();
}

function tutWelcomeNext(){
  if(TW.idx>=TW.count-1) tutWelcomeClose();
  else tutWelcomeGo(TW.idx+1);
}

function tutWelcomeClose(){
  tutSet(TUT_KEY_WELCOME);
  const wrap=document.getElementById('tutWelcome');
  wrap.classList.remove('show');
  setTimeout(()=>wrap.classList.remove('open'),350);
}

function tutBindWelcomeSwipe(){
  const vp=document.getElementById('twViewport');
  if(!vp) return;
  vp.addEventListener('touchstart',e=>{ TW.touchX=e.touches[0].clientX; TW.touchY=e.touches[0].clientY; },{passive:true});
  vp.addEventListener('touchend',e=>{
    if(TW.touchX===null) return;
    const dx=e.changedTouches[0].clientX-TW.touchX, dy=e.changedTouches[0].clientY-TW.touchY;
    TW.touchX=null;
    if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.3) tutWelcomeGo(TW.idx+(dx<0?1:-1));
  },{passive:true});
  document.addEventListener('keydown',e=>{
    if(!document.getElementById('tutWelcome').classList.contains('open')) return;
    if(e.key==='ArrowRight') tutWelcomeGo(TW.idx+1);
    else if(e.key==='ArrowLeft') tutWelcomeGo(TW.idx-1);
    else if(e.key==='Escape') tutWelcomeClose();
  });
}

// ── AŞAMA 2: OYUN İÇİ SPOTLIGHT ──
const TS = {active:false, step:0, a:null, b:null, movesBefore:0, cheerTimer:null};

function tutFindMove(){
  for(let r=0;r<BS;r++) for(let c=0;c<BS;c++){
    const opts=[];
    if(c<BS-1) opts.push([r,c+1]);
    if(r<BS-1) opts.push([r+1,c]);
    for(const [r2,c2] of opts){
      swapGems(r,c,r2,c2);
      const ok=findMatches().length>0;
      swapGems(r,c,r2,c2);
      if(ok){
        // Eşleşmeyi oluşturan (hareket eden) taş "a" olsun: yer değiştirdikten sonra kendi rengi eşleşmeye giriyorsa
        swapGems(r,c,r2,c2);
        const m=findMatches();
        swapGems(r,c,r2,c2);
        const movedIntoMatch=m.some(p=>p.r===r2&&p.c===c2);
        return movedIntoMatch ? {a:{r,c},b:{r:r2,c:c2}} : {a:{r:r2,c:c2},b:{r,c}};
      }
    }
  }
  return null;
}

function tutSpotStart(){
  if(TS.active || tutGet(TUT_KEY_SPOT)) return;
  if(!G.gameActive || !document.getElementById('gameScreen').classList.contains('active')) return;
  let mv=tutFindMove();
  if(!mv){
    let tries=0;
    do{ shuffleBoard(); tries++; }while((hasAnyMatch()||!hasAnyPossibleMove()) && tries<200);
    renderBoard();
    mv=tutFindMove();
    if(!mv) return;
  }
  TS.active=true; TS.a=mv.a; TS.b=mv.b;
  document.getElementById('tutSpot').classList.add('open');
  // İlk konumlandırmada kayma animasyonu olmasın (köşeden uçmasın)
  const hole=document.getElementById('tsHole'), tip=document.getElementById('tsTip');
  hole.style.transition=tip.style.transition='none';
  tutSpotStep(1);
  void hole.offsetWidth;
  hole.style.transition=tip.style.transition='';
}

function tutSpotStep(step){
  TS.step=step;
  const tip=document.getElementById('tsTip');
  if(step===1){
    const d = TS.b.c>TS.a.c?'r' : TS.b.c<TS.a.c?'l' : TS.b.r>TS.a.r?'d' : 'u';
    const txt = {r:'Bu taşı sağa kaydır! 👉', l:'Bu taşı sola kaydır! 👈', u:'Bu taşı yukarı kaydır! 👆', d:'Bu taşı aşağı kaydır! 👇'}[d];
    tip.innerHTML=txt+'<small>Parmağını taşın üzerine koy ve yanındaki taşa doğru kaydır.</small>';
    tutSpotPlace(TS.a);
  } else {
    tip.innerHTML='Şimdi yanındakine dokun, eşleştir! ✨<small>Taşlar yer değiştirecek ve 3\'lü oluşacak.</small>';
    tutSpotPlace(TS.b);
  }
}

function tutSpotPlace(pos){
  const cell=getCellEl(pos.r,pos.c);
  if(!cell) return;
  const rc=cell.getBoundingClientRect();
  const pad=7;
  const x=rc.left-pad, y=rc.top-pad, w=rc.width+pad*2, h=rc.height+pad*2;
  const W=window.innerWidth, H=window.innerHeight;
  const set=(el,l,t,ww,hh)=>{ Object.assign(el.style,{left:l+'px',top:t+'px',width:Math.max(0,ww)+'px',height:Math.max(0,hh)+'px'}); };
  // Delik dışındaki her yeri 4 görünmez blok kaplar → yalnızca vurgulanan taş dokunulabilir
  set(document.getElementById('tsBT'),0,0,W,y);
  set(document.getElementById('tsBB'),0,y+h,W,H-(y+h));
  set(document.getElementById('tsBL'),0,y,x,h);
  set(document.getElementById('tsBR'),x+w,y,W-(x+w),h);
  const hole=document.getElementById('tsHole'), ring=document.getElementById('tsRing');
  hole.classList.remove('free');
  set(hole,x,y,w,h); set(ring,x,y,w,h);
  ring.style.display='';

  // Tooltip: yer varsa taşın üstünde, yoksa altında
  const tip=document.getElementById('tsTip');
  tip.style.opacity='1';
  const tw=Math.min(260,W-24);
  tip.style.width=tw+'px';
  const th=tip.offsetHeight||70;
  const cx=x+w/2;
  const left=Math.max(12,Math.min(W-tw-12,cx-tw/2));
  const above=y-th-16>12;
  tip.classList.toggle('above',above); tip.classList.toggle('below',!above);
  tip.style.left=left+'px';
  tip.style.top=(above? y-th-16 : y+h+16)+'px';
  tip.style.setProperty('--ax',Math.max(18,Math.min(tw-18,cx-left))+'px');
}

function tutSpotAfterClick(r,c){
  if(!TS.active) return;
  if(TS.step===1){
    if(G.selected && G.selected.r===TS.a.r && G.selected.c===TS.a.c) tutSpotStep(2);
    return;
  }
  // Adım 2: hamle yapıldıysa (hamle sayısı düştüyse) eşleşme gerçekleşti
  if(G.moves<TS.movesBefore){ tutSpotSuccess(); return; }
  if(!G.selected) tutSpotStep(1);
}

function tutSpotSuccess(){
  TS.active=false;
  tutSet(TUT_KEY_SPOT);
  // Karartmayı yumuşakça kaldır, oyuna geri dön
  const hole=document.getElementById('tsHole');
  hole.classList.add('free');
  document.getElementById('tsRing').style.display='none';
  document.getElementById('tsTip').style.opacity='0';
  setTimeout(()=>document.getElementById('tutSpot').classList.remove('open'),350);
  const cheer=document.getElementById('tsCheer');
  cheer.classList.add('show');
  clearTimeout(TS.cheerTimer);
  TS.cheerTimer=setTimeout(()=>{
    cheer.classList.remove('show');
    // İlk kez: hedef "?" butonunu kısaca parlat
    if(!tutGet(TUT_KEY_HELP)) document.querySelector('#goalBar .goal-help-btn')?.classList.add('pulse');
  },2000);
}

function tutSpotEnd(markDone){
  if(markDone) tutSet(TUT_KEY_SPOT);
  TS.active=false;
  document.getElementById('tutSpot').classList.remove('open');
}

// Oyun fonksiyonlarını sarmala (orijinal davranış aynen korunur)
const _tutOrigStartLevel = startLevel;
startLevel = function(){
  const res=_tutOrigStartLevel.apply(this,arguments);
  if(!tutGet(TUT_KEY_SPOT) && selectedBuilding===0 && selectedLevel===0 && G.gameActive
     && document.getElementById('gameScreen').classList.contains('active')){
    setTimeout(tutSpotStart,500);
  }
  return res;
};

const _tutOrigCellClick = onCellClick;
onCellClick = function(r,c){
  if(TS.active) TS.movesBefore=G.moves;
  const res=_tutOrigCellClick.apply(this,arguments);
  if(TS.active) tutSpotAfterClick(r,c);
  return res;
};

const _tutOrigShowScreen = showScreen;
showScreen = function(id){
  if(id!=='gameScreen'){
    if(TS.active) tutSpotEnd(false);   // oyundan çıkıldı → bir dahaki ilk bölümde tekrar göster
    closeGoalHelp();
  }
  return _tutOrigShowScreen.apply(this,arguments);
};

// ── AŞAMA 3: GÖREV İPUÇLARI ("?" butonu) ──
const GEM_TUT_INFO = {
  gem1:{emoji:'🔴', color:'kırmızı'},
  gem2:{emoji:'🔵', color:'mavi'},
  gem3:{emoji:'🟢', color:'yeşil'},
  gem4:{emoji:'🟡', color:'sarı'},
  gem5:{emoji:'🟣', color:'mor'},
  gem6:{emoji:'🟠', color:'turuncu'},
};

const _tutOrigRenderGoalBar = renderGoalBar;
renderGoalBar = function(){
  const res=_tutOrigRenderGoalBar.apply(this,arguments);
  const bar=document.getElementById('goalBar');
  if(bar && !bar.querySelector('.goal-help-btn')){
    const btn=document.createElement('button');
    btn.className='goal-help-btn'+(tutGet(TUT_KEY_HELP)||TS.active?'':' pulse');
    btn.textContent='?';
    btn.setAttribute('aria-label','Bölüm hedeflerini göster');
    btn.onclick=e=>{ e.stopPropagation(); openGoalHelp(btn); };
    bar.appendChild(btn);
  }
  return res;
};

function openGoalHelp(btn){
  if(TS.active) return;
  tutSet(TUT_KEY_HELP);
  btn.classList.remove('pulse');
  const pop=document.getElementById('goalHelpPop');
  const b=BUILDINGS[selectedBuilding], lvl=b&&b.levels[selectedLevel];
  const rows=Object.entries(G.goals).map(([k,target])=>{
    if(!GEMS[k]) return hdGoalHelpRow(k,target);
    const gd=GEMS[k], info=GEM_TUT_INFO[k]||{emoji:'💎',color:''};
    const prog=Math.min(G.goalProgress[k]||0,target), done=prog>=target;
    return `<div class="ghp-row">
      <div class="ghp-gem" style="color:${gd.color};background:${gd.bg};text-shadow:0 0 6px ${gd.color};">${gd.symbol}</div>
      <div class="ghp-txt"><b>${target} adet</b> ${info.emoji} ${info.color} <b>${gd.name}</b> taşı topla</div>
      <div class="ghp-prog${done?' done':''}">${done?'✓':prog+'/'+target}</div>
    </div>`;
  }).join('');
  pop.innerHTML=`
    <div class="ghp-title"><span>🎯 BÖLÜM HEDEFLERİ</span><button class="ghp-close" onclick="closeGoalHelp()" aria-label="Kapat">✕</button></div>
    ${rows}${hdGoalHelpExtra()}
    <div class="ghp-note">⏳ Hepsini <b>${lvl?lvl.moves:G.moves} hamle</b> içinde tamamla (kalan: <b>${G.moves}</b>).<br>
    💡 Hedef renkteki taşları eşleştir. 4'lü eşleşme 💥 bomba, 5'li ⚡ süper bomba yaratır — bunlar hedefe de sayılır!</div>`;
  pop.classList.add('open');
  document.getElementById('goalHelpBack').classList.add('open');
  placeGoalHelp();
  void pop.offsetWidth;
  pop.classList.add('show');
  if(typeof SFX!=='undefined') SFX.select();
}

function placeGoalHelp(){
  const pop=document.getElementById('goalHelpPop');
  const btn=document.querySelector('#goalBar .goal-help-btn');
  if(!btn || !pop.classList.contains('open')) return;
  const rc=btn.getBoundingClientRect();
  const pw=pop.offsetWidth, W=window.innerWidth;
  const left=Math.max(16,Math.min(W-pw-16,rc.right-pw+6));
  pop.style.left=left+'px';
  pop.style.top=(rc.bottom+12)+'px';
  pop.style.setProperty('--ax',Math.max(10,(left+pw)-(rc.left+rc.width/2)-7)+'px');
}

function closeGoalHelp(){
  const pop=document.getElementById('goalHelpPop');
  if(!pop || !pop.classList.contains('open')) return;
  pop.classList.remove('show');
  document.getElementById('goalHelpBack').classList.remove('open');
  setTimeout(()=>{ if(!pop.classList.contains('show')) pop.classList.remove('open'); },220);
}

// ── Öğreticiyi yeniden oynat (Nasıl Oynanır penceresinden) ──
function tutReplay(){
  tutDel(TUT_KEY_WELCOME); tutDel(TUT_KEY_SPOT); tutDel(TUT_KEY_HELP);
  if(typeof closeHowto==='function') closeHowto();
  tutWelcomeOpen();
}

// ── Başlat ──
function tutInit(){
  tutBindWelcomeSwipe();
  window.addEventListener('resize',()=>{
    if(TS.active) tutSpotPlace(TS.step===1?TS.a:TS.b);
    placeGoalHelp();
  });
  // initAuth() otomatik giriş yaptıysa ve profil öğreticiyi bitirmediyse göster
  if(CURRENT_USER && !tutGet(TUT_KEY_WELCOME)) setTimeout(tutWelcomeOpen,400);
}

// Yeni profil oluşturulunca öğretici hemen açılsın
const _tutOrigDoRegister = doRegister;
doRegister = function(){
  const name=document.getElementById('regName').value.trim();
  const before=getAllUsers().length;
  const res=_tutOrigDoRegister.apply(this,arguments);
  const u = getAllUsers().length>before ? getUserData(name) : null;
  if(u){
    u.tutorial={};                 // yeni profil → tüm öğretici adımları bekliyor
    saveUserData(u);
    TUT_NEW_USER=u.username;       // öğretici, kayıttan hemen sonraki otomatik girişte (enterGame) açılır
  }
  return res;
};

// Giriş sonrası: öğreticiyi yarıda bırakmış yeni profile tekrar göster
const _tutOrigEnterGame = enterGame;
enterGame = function(){
  const res=_tutOrigEnterGame.apply(this,arguments);
  TUT_NEW_USER=null;
  if(CURRENT_USER && !tutGet(TUT_KEY_WELCOME) && !document.getElementById('tutWelcome').classList.contains('open'))
    setTimeout(tutWelcomeOpen,400);
  return res;
};
tutInit();
