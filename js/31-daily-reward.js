// ══════════════════════════════════════════════
// GÜNLÜK ÖDÜL SİSTEMİ (7 günlük zincir)
// localStorage "babil_last_daily" = { kullanıcıAdı: {date:'YYYY-MM-DD', chain:N} }
// Aynı kayıt CURRENT_USER.daily içinde de tutulur.
// ══════════════════════════════════════════════
const DAILY_KEY = 'babil_last_daily';
const DAILY_REWARDS = [
  {day:1, icon:'🪙', short:'50',    label:'🪙 <b>50</b> Altın',                       coins:50},
  {day:2, icon:'⚡', short:'+2',    label:'⚡ <b>+2</b> Enerji',                      energy:2},
  {day:3, icon:'🪙', short:'100',   label:'🪙 <b>100</b> Altın',                      coins:100},
  {day:4, icon:'💎', short:'Öğe',   label:'💎 Rastgele <b>mağaza öğesi</b>',          item:'any'},
  {day:5, icon:'🪙', short:'150+⚡', label:'🪙 <b>150</b> Altın + ⚡ <b>+3</b> Enerji', coins:150, energy:3},
  {day:6, icon:'🎁', short:'Kutu',  label:'🎁 Özel Kutu: 🪙 <b>200</b> Altın',        coins:200},
  {day:7, icon:'👑', short:'500+',  label:'👑 BÜYÜK ÖDÜL: 🪙 <b>500</b> + 💎 öğe + ⚡ <b>5</b>', coins:500, energy:5, item:'rare'},
];
const DR = {pending:null, claimed:false, busy:false};

function dailyYmd(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function dailyToday(){ return dailyYmd(new Date()); }
function dailyYesterday(){ const n=new Date(); return dailyYmd(new Date(n.getFullYear(),n.getMonth(),n.getDate()-1)); }

function dailyReadAll(){ try{ return JSON.parse(localStorage.getItem(DAILY_KEY)||'{}')||{}; }catch(e){ return {}; } }
function dailyGetRec(){
  if(!CURRENT_USER) return null;
  if(CURRENT_USER.daily && CURRENT_USER.daily.date) return CURRENT_USER.daily;
  return dailyReadAll()[CURRENT_USER.username] || {date:null, chain:0};
}
function dailySaveRec(rec){
  if(!CURRENT_USER) return;
  CURRENT_USER.daily = rec;
  const all=dailyReadAll(); all[CURRENT_USER.username]=rec;
  try{ localStorage.setItem(DAILY_KEY, JSON.stringify(all)); }catch(e){}
}

// Bugün alınacak ödül var mı? Varsa {chain, day, broken} döner
function dailyPending(){
  const rec=dailyGetRec();
  if(!rec) return null;
  const today=dailyToday();
  if(rec.date===today) return null;                     // bugün zaten alındı
  const continues = rec.date===dailyYesterday();
  const chain = continues ? (rec.chain||0)+1 : 1;       // zincir kırıldıysa sıfırla
  return {chain, day:((chain-1)%7)+1, broken:!!rec.date && !continues && (rec.chain||0)>0};
}

function dailyCheck(){
  if(!CURRENT_USER || DR.busy) return;
  if(document.getElementById('dailyModal').classList.contains('open')) return;
  if(G.gameActive) return;
  const p=dailyPending();
  if(p) dailyOpen(p);
}

function dailyOpen(p){
  DR.pending=p; DR.claimed=false; DR.busy=false;
  const rw=DAILY_REWARDS[p.day-1];
  document.getElementById('drChainTxt').textContent=`${p.chain} Günlük Zincir!`;
  document.getElementById('drBroken').hidden=!p.broken;
  const days=document.getElementById('drDays');
  days.innerHTML='';
  DAILY_REWARDS.forEach(r=>{
    const el=document.createElement('div');
    const st = r.day<p.day ? 'past' : r.day===p.day ? 'today' : 'future';
    el.className=`dr-day ${st}${r.day===7?' d7':''}`;
    el.innerHTML=`<span class="dd-n">${r.day===p.day?'BUGÜN':'GÜN '+r.day}</span><span class="dd-i">${r.icon}</span><span class="dd-a">${r.short}</span>`;
    days.appendChild(el);
  });
  const stage=document.getElementById('drStage');
  stage.classList.remove('open','shake');
  document.getElementById('drChest').classList.toggle('royal',p.day>=6);
  document.getElementById('drCrown').hidden=p.day!==7;
  document.getElementById('drReveal').innerHTML='';
  document.getElementById('drTodayLbl').textContent=p.day===7?'✦ YEDİNCİ GÜN ✦':'BUGÜNÜN ÖDÜLÜ';
  document.getElementById('drTodayVal').innerHTML=rw.label;
  const btn=document.getElementById('drBtn');
  btn.textContent='ÖDÜLÜ AL ✦'; btn.disabled=false;
  const m=document.getElementById('dailyModal');
  m.classList.add('open'); m.scrollTop=0;
  void m.offsetWidth;
  m.classList.add('show');
}

function dailyPickItem(kind){
  if(typeof SHOP_ITEMS==='undefined' || !SHOP_ITEMS.length) return null;
  const stars=getTotalStarsReal();
  let pool=SHOP_ITEMS.filter(s=>(s.reqStars||0)<=stars && s.cat!=='booster');
  if(kind==='rare'){ const rare=pool.filter(s=>s.price>=150); if(rare.length) pool=rare; }
  if(!pool.length) pool=SHOP_ITEMS.filter(s=>s.cat!=='booster');
  return pool[Math.floor(Math.random()*pool.length)];
}

function dailyClaim(){
  // Ödül alındıysa buton "Devam Et" olarak modalı kapatır
  if(DR.claimed){ dailyClose(); return; }
  if(DR.busy || !DR.pending || !CURRENT_USER) return;
  DR.busy=true;
  const p=DR.pending, rw=DAILY_REWARDS[p.day-1];
  const btn=document.getElementById('drBtn');
  btn.disabled=true;

  // ── Ödülü G objesine işle ──
  const prizes=[];
  if(rw.coins){ G.coins+=rw.coins; prizes.push({i:'🪙', t:`+${rw.coins}`}); }
  if(rw.energy){ G.energy+=rw.energy; prizes.push({i:'⚡', t:`+${rw.energy}`}); } // bonus enerji üst sınırı aşabilir
  let item=null;
  if(rw.item){ item=dailyPickItem(rw.item); if(item){ addInv(item.id,1); prizes.push({i:item.icon, t:item.name}); } }
  if(rw.day===6) prizes.unshift({i:'🎁', t:'Özel Kutu'});
  if(CURRENT_USER.stats) CURRENT_USER.stats.dailyClaims=(CURRENT_USER.stats.dailyClaims||0)+1;
  dailySaveRec({date:dailyToday(), chain:p.chain});
  saveGame();   // → syncGameToUser() → saveUserData(CURRENT_USER): CURRENT_USER.daily de kaydedilir
  updateCoinsUI(); updateEnergyUI();
  const mev=document.getElementById('mapEnergyVal'); if(mev) mev.textContent=G.energy;

  // ── Sandık animasyonu ──
  const stage=document.getElementById('drStage');
  document.getElementById('drReveal').innerHTML=prizes.map((z,k)=>`<div class="dr-prize" style="--i:${k}"><i>${z.i}</i><b>${z.t}</b></div>`).join('');
  stage.classList.add('shake');
  SFX.select();
  setTimeout(()=>{
    stage.classList.remove('shake'); stage.classList.add('open');
    SFX.win();
    const r=document.getElementById('drChest').getBoundingClientRect();
    dailyConfetti(r.left+r.width/2, r.top+r.height*0.35, p.day===7?140:90);
    const todayEl=document.querySelector('#drDays .dr-day.today');
    if(todayEl){ todayEl.classList.remove('today'); todayEl.classList.add('claimed'); }
    document.getElementById('drTodayLbl').textContent='KAZANDIN!';
    document.getElementById('drTodayVal').innerHTML=prizes.map(z=>`${z.i} <b>${z.t}</b>`).join(' &nbsp;·&nbsp; ');
    const next=DAILY_REWARDS[p.day%7];
    btn.textContent= p.day===7 ? 'EFSANE! DEVAM ET ✦' : 'DEVAM ET ✦';
    btn.disabled=false;
    DR.claimed=true; DR.busy=false;
    showToast(p.day===7 ? '👑 Büyük ödül kazandın!' : `✦ Yarın: ${next.icon} ${next.short}`);
  },600);
}

function dailyClose(){
  const m=document.getElementById('dailyModal');
  m.classList.remove('show');
  setTimeout(()=>m.classList.remove('open'),350);
  DR.pending=null;
}

function dailyConfetti(x,y,count){
  const colors=['#f5c842','#e8a020','#fff3b0','#b070ff','#7a3cc8','#ff6a3c','#44ff88','#00aaff'];
  const reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) count=Math.round(count/4);
  for(let i=0;i<count;i++){
    const el=document.createElement('div');
    el.className='dr-confetti';
    const w=5+Math.random()*7, h=Math.random()<.5?w:w*0.45;
    el.style.width=w+'px'; el.style.height=h+'px';
    el.style.background=colors[i%colors.length];
    if(Math.random()<.3) el.style.borderRadius='50%';
    document.body.appendChild(el);
    const ang=Math.random()*Math.PI*2, pow=120+Math.random()*220;
    const dx=Math.cos(ang)*pow, dy=Math.sin(ang)*pow*0.8-160;
    const rot=(Math.random()*2-1)*720, dur=1400+Math.random()*1200;
    const anim=el.animate([
      {transform:`translate(${x}px,${y}px) rotate(0deg)`, opacity:1},
      {transform:`translate(${x+dx*0.7}px,${y+dy}px) rotate(${rot/2}deg)`, opacity:1, offset:.35},
      {transform:`translate(${x+dx}px,${y+dy+window.innerHeight*0.6}px) rotate(${rot}deg)`, opacity:0},
    ],{duration:dur, easing:'cubic-bezier(.15,.7,.35,1)', fill:'forwards'});
    anim.onfinish=()=>el.remove();
    setTimeout(()=>el.remove(), dur+200);
  }
}

// enterGame'i sarmala: giriş yapıldıktan hemen sonra kontrol et
const _dailyOrigEnterGame = enterGame;
enterGame = function(){
  const res=_dailyOrigEnterGame.apply(this,arguments);
  setTimeout(dailyCheck,450);
  return res;
};

// Oyun açıkken gün değişirse (gece yarısı) uygulamaya dönüldüğünde tekrar kontrol et
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') dailyCheck(); });

// initAuth() otomatik giriş yaptıysa enterGame sarmalanmadan önce çalışmıştır → burada kontrol et
if(CURRENT_USER) setTimeout(dailyCheck,450);
