// ══════════════════════════════════════════════
// ZORLUK: YENİ ENGEL TAŞLARI
// Mevcut engellerle aynı biçimde metin olarak saklanır ('#' → isObstacle: eşleşmez, takas edilmez):
//   '#lock:gem3'      Kilitli taş     — yanında 1 patlama kilidi açar
//   '#cage:2:gem3'    Demir parmaklık — 2 vuruş (1. vuruşta çatlar)
//   '#honey:gem3'     Yapışkan bal    — oynatılamaz ama düşer; yanında 1 patlama eritir
//   '#pillar:3:gem3'  Taş sütun       — yalnızca ALTINDAKİ patlama (ya da bomba/süper ile doğrudan vuruş), 3 vuruş
//   '#carbon:0'       Karbon taş      — kırılmaz; yalnızca ⚡ süper bomba yok eder
// Açılan/kırılan engelin içindeki taş normal taş olarak kalır.
// ══════════════════════════════════════════════
const HD_OBST = {
  lock:  {name:'Kilitli Taş',     icon:'🔒', goal:'ob_lock',   verb:'kilit aç',  desc:'Yanında eşleşme yap, kilit açılır'},
  cage:  {name:'Demir Parmaklık', icon:'⛓️', goal:'ob_cage',   verb:'kafes kır', desc:'Yanında 2 patlamayla kırılır'},
  honey: {name:'Yapışkan Bal',    icon:'🍯', goal:'ob_honey',  verb:'bal erit',  desc:'Oynatılamaz; yanında eşleşme eritir'},
  pillar:{name:'Taş Sütun',       icon:'🏛️', goal:'ob_pillar', verb:'sütun yık', desc:'Yalnızca altındaki patlamalarla, 3 vuruşta yıkılır'},
  carbon:{name:'Karbon Taş',      icon:'⬛', goal:null,        verb:'',          desc:'Kırılmaz — yalnızca ⚡ süper bomba yok eder'},
};
const HD_GOAL_TYPE = {ob_lock:'lock', ob_cage:'cage', ob_honey:'honey', ob_pillar:'pillar'};
const HD_MECH = {
  bombRain:{icon:'💣', name:'Düşen Bomba',   desc:'Her 5 hamlede bir bomba düşer: 3 sn içinde o taşı patlat, yoksa 2 hamle kaybedersin'},
  shuffle: {icon:'🔀', name:'Karışan Tahta', desc:'Her 8 hamlede tahta kendiliğinden karışır'},
  flood:   {icon:'🌊', name:'Yükselen Su',   desc:'Her 3 hamlede su yükselir, sudaki taşlar oynatılamaz; 3. satıra ulaşırsa kaybedersin. 5 eşleşme suyu 1 satır geri çeker'},
  darkness:{icon:'🌑', name:'Karanlık',      desc:'Yalnızca ışıklı alan görünür; ışık her hamlede kayar'},
};
// Bölüm sırasında değişen durum (G'ye yazılmaz → kayda girmez)
const HD = {cfg:{}, placed:{}, start:0, turn:0, penalty:0, flood:0, matches:0, light:{r:3,c:3},
            bombs:[], comboFail:false, cascading:false, shuffling:false, bombCascade:false, wantBomb:false};

function hdParse(g){
  const {type,val,gem}=obstacleInfo(g);
  return (type==='cage'||type==='pillar') ? {type, hp:+val, gem} : {type, hp:1, gem:val};
}
function hdFalls(g){ return typeof g==='string' && g.startsWith('#honey:'); }
function hdFrozen(r,c){ return HD.flood>0 && r>=BS-HD.flood; }      // su altındaki satırlar

// ── Zorluk tablosu: yapının medeniyet içindeki sırası (k: 0-5) × bölüm (l: 0-4) ──
// Bölüm 1-2 engelsiz · 3: kilit · 4: kilit+kafes · 5: kilit+kafes+karbon sütun
// 2. yapı +bal · 3. yapı +sütun (+karışan tahta) · 4. yapı +karbon (+yükselen su) · 5. yapı +bomba · 6. yapı hepsi+karanlık
function hdCfg(bIdx, l){
  const b=BUILDINGS[bIdx];
  if(!b) return {};
  const civ=b.civ||0, k=civBuildingIdx(civ).indexOf(bIdx), lv=b.levels[l]||{};
  const cfg={};
  if(l===1){                                   // 2. bölümler: engel yok ama kısıt var
    if(k===1||k===2) cfg.finishIn=Math.max(10,(lv.moves||20)-4);
    else if(k>=3) cfg.noCombo=true;
  }
  if(l<2) return cfg;
  const o={lock:[0,0,5,7,7][l], cage:[0,0,0,2,5][l], honey:k>=1?3:0, pillar:k>=2?2:0, carbon:(l===4?2:0)+(k>=3?2:0)};
  // Medeniyet engelleriyle birlikte tahtanın en fazla ~%45'i kapansın: önce kilit, sonra kafes, sonra bal azalır
  const civObs=(CIVILIZATIONS[civ].obstacle && lv.obstacles)||0;
  let over=o.lock+o.cage+o.honey+o.pillar+o.carbon-Math.max(8,22-civObs);
  [['lock',2],['cage',1],['honey',1]].forEach(([t,min])=>{ const d=Math.max(0,Math.min(over,o[t]-min)); o[t]-=d; over-=d; });
  cfg.obst=o;
  // Bölümün engel hedefi: yapının yeni engeli; 4. yapıdan sonra bölüme göre kilit → kafes → sütun
  cfg.goal = k===1 ? 'honey' : k===2 ? 'pillar' : k>=3 ? ['lock','cage','pillar'][l-2] : (o.cage?'cage':'lock');
  if(!o[cfg.goal]) cfg.goal = o.cage?'cage':'lock';
  if(k>=4) cfg.bombRain=true;
  if(k===2 && l>=3) cfg.shuffle=true;
  if(k===3 && l>=3) cfg.flood=true;
  if(k===5) cfg.darkness=true;
  return cfg;
}

// generateBoard içinden: bölümün yeni engellerini yerleştir (üst satırlar açık kalır, taşlar akabilsin)
function hdPlaceObstacles(){
  HD.placed={};
  const o=hdCfg(selectedBuilding, selectedLevel).obst;
  if(!o) return;
  const rnd=n=>Math.floor(Math.random()*n);
  const free=(r,c)=>{ const g=G.board[r][c]; return g && !isObstacle(g) && getGemPower(g)==='normal'; };
  const add=(t,n)=>{ HD.placed[t]=(HD.placed[t]||0)+n; };
  // Karbon: dikey ikililer (karbon sütun)
  for(let n=0; n<o.carbon; n+=2){
    for(let t=0;t<120;t++){
      const r=3+rnd(3), c=rnd(BS);
      if(free(r,c) && free(r+1,c)){ G.board[r][c]=G.board[r+1][c]='#carbon:0'; add('carbon',2); break; }
    }
  }
  const put=(type,count,r0,r1,make)=>{
    for(let n=0;n<count;n++) for(let t=0;t<200;t++){
      const r=r0+rnd(r1-r0+1), c=rnd(BS);
      if(!free(r,c)) continue;
      G.board[r][c]=make(getGemBase(G.board[r][c])); add(type,1); break;
    }
  };
  put('pillar', o.pillar, 2, BS-2, g=>`#pillar:3:${g}`);   // altında bir satır olmalı
  put('cage',   o.cage,   2, BS-1, g=>`#cage:2:${g}`);
  put('honey',  o.honey,  1, BS-2, g=>`#honey:${g}`);
  put('lock',   o.lock,   2, BS-1, g=>`#lock:${g}`);
}

// obstacleHit içinden: yeni engel tipleri (true → işlendi)
function hdObstacleHit(r,c,full,h){
  const o=hdParse(G.board[r][c]);
  if(!HD_OBST[o.type]) return false;
  const i=r*BS+c;
  if(o.type==='carbon'){
    if(h.direct && (G._hdSuperAll || (G._hdSuper && G._hdSuper.has(i)))){ G.board[r][c]=null; hdBreakFx(r,c,'carbon',true); }
    return true;
  }
  if(o.type==='pillar' && !(full || h.direct || h.below)) return true;   // yandan gelen patlama sütuna işlemez
  const hp=full ? 0 : o.hp-1;
  if(hp>0){ G.board[r][c]=`#${o.type}:${hp}:${o.gem}`; hdBreakFx(r,c,o.type,false); return true; }
  G.board[r][c]=o.gem;
  hdBreakFx(r,c,o.type,true);
  const k=HD_OBST[o.type].goal;
  if(k && G.goals && G.goals[k]!=null){ G.goalProgress[k]=(G.goalProgress[k]||0)+1; HD.goalDirty=true; }
  return true;
}

// ── Görseller (SVG kaplama) ──
const HD_LOCK_SVG = `<path d="M9 19 V12 a11 11 0 0 1 22 0 V19" fill="none" stroke="#e1e5ee" stroke-width="5.5" stroke-linecap="round"/>
  <rect x="3" y="18" width="34" height="26" rx="5" fill="#9ca3b2" stroke="#555b69" stroke-width="3"/>
  <circle cx="20" cy="28" r="4" fill="#363b47"/><rect x="18" y="29" width="4" height="9" rx="2" fill="#363b47"/>`;
const HD_HONEY_SVG = (()=>{
  const hex=(cx,cy,R)=>[0,1,2,3,4,5].map(i=>{ const a=Math.PI/3*i+Math.PI/6; return (cx+R*Math.cos(a)).toFixed(1)+','+(cy+R*Math.sin(a)).toFixed(1); }).join(' ');
  const R=17, w=R*Math.sqrt(3), cells=[];
  for(let row=-1;row<=3;row++) for(let col=-1;col<=3;col++){
    const cx=col*w+(row%2?w/2:0)+4, cy=row*R*1.5+8;
    cells.push(`<polygon points="${hex(cx,cy,R-1.5)}"/>`);
  }
  return `<g fill="rgba(255,196,40,.42)" stroke="#c98a00" stroke-width="2.4">${cells.join('')}</g>
    <path d="M18 100 q0 -8 4 -12 q4 4 4 12z M62 100 q0 -11 5 -15 q5 4 5 15z" fill="#f2b21c" opacity=".9"/>`;
})();
const HD_SVG = {
  lock:()=>`<svg class="hd-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" fill="rgba(110,116,132,.42)"/></svg>
    <svg class="hd-svg hd-lock-ic" viewBox="0 0 40 46">${HD_LOCK_SVG}</svg>`,
  cage:hp=>`<svg class="hd-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <g stroke="#2e3239" stroke-width="7" stroke-linecap="round" ${hp<2?'stroke-dasharray="34 9"':''}>
      <line x1="-10" y1="30" x2="30" y2="-10"/><line x1="-10" y1="70" x2="70" y2="-10"/><line x1="10" y1="110" x2="110" y2="10"/><line x1="50" y1="110" x2="110" y2="50"/>
      <line x1="-10" y1="30" x2="70" y2="110"/><line x1="-10" y1="-10" x2="110" y2="110"/><line x1="30" y1="-10" x2="110" y2="70"/>
    </g>
    <g stroke="#8d939f" stroke-width="2" stroke-linecap="round" opacity=".8" ${hp<2?'stroke-dasharray="34 9"':''}>
      <line x1="-10" y1="70" x2="70" y2="-10"/><line x1="-10" y1="-10" x2="110" y2="110"/><line x1="10" y1="110" x2="110" y2="10"/>
    </g>
    <rect x="3" y="3" width="94" height="94" rx="10" fill="none" stroke="#3a3f47" stroke-width="6"/>
    ${hp<2?'<path d="M58 4 L48 30 L60 44 L44 70 L52 96" fill="none" stroke="#f4f4f4" stroke-width="3" stroke-linejoin="round" opacity=".85"/>':''}</svg>`,
  honey:()=>`<svg class="hd-svg" viewBox="0 0 100 100" preserveAspectRatio="none">${HD_HONEY_SVG}</svg>`,
  pillar:hp=>`<svg class="hd-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <rect x="22" y="58" width="56" height="34" fill="#b9ad94"/>
    <rect x="14" y="52" width="72" height="9" rx="2" fill="#d8ccb0" stroke="#7d7058" stroke-width="2"/>
    <rect x="12" y="91" width="76" height="8" rx="2" fill="#d8ccb0" stroke="#7d7058" stroke-width="2"/>
    <g stroke="#6e624c" stroke-width="3.5"><line x1="34" y1="61" x2="34" y2="91"/><line x1="66" y1="61" x2="66" y2="91"/></g>
    ${hp<3?'<path d="M46 61 L52 72 L45 80 L50 91" fill="none" stroke="#3e3527" stroke-width="2.5"/>':''}
    ${hp<2?'<path d="M24 66 L32 74 M70 84 L77 76 L74 70" fill="none" stroke="#3e3527" stroke-width="2.5"/>':''}</svg>`,
};
function hdRenderObstCell(cell, g){
  const o=hdParse(g);
  if(o.type==='carbon'){ cell.className='cell obst hd-carbon'; cell.innerHTML=''; return; }
  const gd=GEMS[o.gem]||GEMS.gem1;
  cell.style.setProperty('--gem-color',gd.color);
  cell.style.setProperty('--gem-bg',gd.bg);
  cell.style.setProperty('--gem-glow',gd.glow);
  cell.className=`cell gem-cell hd-ob hd-${o.type} hp${o.hp}`;
  cell.innerHTML=`<span class="hd-g">${gd.symbol}</span>${HD_SVG[o.type](o.hp)}`;
}

// ── Kırılma efektleri + küçük puan balonu + ses ──
function hdBreakFx(r,c,type,destroyed){
  const pts=destroyed?40:15;
  G.score+=pts;
  const sv=document.getElementById('scoreVal'); if(sv) sv.textContent=G.score;
  ({lock:SFX.click, cage:SFX.crack, honey:SFX.squelch, pillar:destroyed?SFX.crumble:SFX.thud, carbon:SFX.crack})[type]?.();
  const el=getCellEl(r,c);
  if(!el) return;
  const rc=el.getBoundingClientRect(), x=rc.left+rc.width/2, y=rc.top+rc.height/2, s=rc.width||40;
  showScorePop('+'+pts, x, rc.top);
  if(gfReduce()) return;
  const piece=(css,frames,dur,html)=>{
    const d=document.createElement('div');
    d.className='hd-fx'; d.style.cssText=`left:${x}px;top:${y}px;`+css;
    if(html) d.innerHTML=html;
    gfOnce(d,frames,{duration:dur,easing:'cubic-bezier(.3,.6,.5,1)',fill:'forwards'});
  };
  const fly=(n,color,w,h,grav,spread)=>{
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, d=spread*(.5+Math.random()*.6), rot=(Math.random()-.5)*720;
      const dx=Math.cos(a)*d, dy=Math.sin(a)*d*.6;
      piece(`width:${w}px;height:${h}px;background:${color};border-radius:2px;`,[
        {transform:'translate(-50%,-50%) rotate(0)',opacity:1},
        {transform:`translate(calc(-50% + ${dx*.6}px),calc(-50% + ${dy-10}px)) rotate(${rot/2}deg)`,opacity:1,offset:.4},
        {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy+grav}px)) rotate(${rot}deg)`,opacity:0}],600+Math.random()*250);
    }
  };
  if(type==='lock'){
    piece(`width:${s*.5}px;height:${s*.58}px;`,[
      {transform:'translate(-50%,-50%) rotate(0) scale(1)',opacity:1},
      {transform:'translate(-50%,-95%) rotate(360deg) scale(.15)',opacity:0}],600,
      `<svg viewBox="0 0 40 46" style="width:100%;height:100%;display:block">${HD_LOCK_SVG}</svg>`);
  } else if(type==='cage'){
    fly(destroyed?9:3,'#3a3f47',s*.36,4,destroyed?40:20,s*(destroyed?.9:.5));
  } else if(type==='honey'){
    for(let i=0;i<6;i++){
      const dx=(Math.random()-.5)*s*.8, len=30+Math.random()*35, w=5+Math.random()*4;
      piece(`width:${w}px;height:${w*1.3}px;background:radial-gradient(circle at 35% 30%,#ffe27a,#e9a10e);border-radius:50% 50% 50% 50%/60% 60% 40% 40%;`,[
        {transform:`translate(calc(-50% + ${dx}px),-20%) scaleY(1)`,opacity:1},
        {transform:`translate(calc(-50% + ${dx}px),calc(-20% + ${len}px)) scaleY(1.8)`,opacity:0}],650+i*60);
    }
  } else if(type==='pillar'){
    fly(destroyed?8:3,'#a99c80',destroyed?9:6,destroyed?8:6,70,s*(destroyed?.6:.35));
  } else if(type==='carbon'){
    fly(9,'#111114',8,8,45,s*.9);
  }
}

// Hedef çubuğu: taş olmayan hedefler için simge
function goalIconHTML(k){
  const gd=GEMS[k];
  if(gd) return `<span class="goal-gem" style="color:${gd.color};text-shadow:0 0 6px ${gd.color};">${gd.symbol}</span>`;
  const t=HD_GOAL_TYPE[k];
  return `<span class="goal-gem hd-goal-ic">${t?HD_OBST[t].icon:'🎯'}</span>`;
}
// Hedef yardım penceresi satırları
function hdGoalHelpRow(k,target){
  const t=HD_GOAL_TYPE[k], o=t&&HD_OBST[t];
  const prog=Math.min(G.goalProgress[k]||0,target), done=prog>=target;
  return `<div class="ghp-row">
      <div class="ghp-gem hd-ghp-ic">${o?o.icon:'🎯'}</div>
      <div class="ghp-txt"><b>${target} ${o?o.verb:''}</b> — ${o?o.desc:''}</div>
      <div class="ghp-prog${done?' done':''}">${done?'✓':prog+'/'+target}</div>
    </div>`;
}
function hdGoalHelpExtra(){
  const cfg=HD.cfg||{}, rows=[];
  if(cfg.finishIn) rows.push(['⏱',`<b>${cfg.finishIn} hamle ile bitir</b> — bu bölümde hamle hakkı kısıtlı`]);
  if(cfg.noCombo) rows.push(['🚫',`<b>Kombosuz bitir</b> — art arda 3+ zincir eşleşme olursa bölüm kaybedilir`+(HD.comboFail?' <b style="color:#ff6b6b">(bozuldu)</b>':'')]);
  Object.keys(HD_MECH).forEach(m=>{ if(cfg[m]) rows.push([HD_MECH[m].icon,`<b>${HD_MECH[m].name}</b> — ${HD_MECH[m].desc}`]); });
  return rows.map(([ic,tx])=>`<div class="ghp-row"><div class="ghp-gem hd-ghp-ic">${ic}</div><div class="ghp-txt">${tx}</div></div>`).join('');
}
// Bölüm ekranı (bölüm giriş) bilgi satırları
function hdLevelInfoHTML(bIdx,l){
  const cfg=hdCfg(bIdx,l), rows=[];
  if(cfg.obst) Object.entries(cfg.obst).forEach(([t,n])=>{ if(n>0) rows.push([`${HD_OBST[t].icon} ${HD_OBST[t].name} ×${n}`, HD_OBST[t].desc]); });
  if(cfg.goal) rows.push([`🎯 Engel hedefi`, {lock:'Tüm kilitleri aç', cage:'Tüm kafesleri kır', honey:'Tüm balı erit', pillar:'Tüm sütunları yık'}[cfg.goal]]);
  if(cfg.finishIn) rows.push([`⏱ ${cfg.finishIn} hamle ile bitir`,'Hamle hakkı kısıtlı']);
  if(cfg.noCombo) rows.push(['🚫 Kombosuz bitir','3+ zincir eşleşme yasak']);
  Object.keys(HD_MECH).forEach(m=>{ if(cfg[m]) rows.push([`${HD_MECH[m].icon} ${HD_MECH[m].name}`, HD_MECH[m].desc]); });
  return rows.map(([a,b])=>`<div class="li-row li-civ hd-li"><span>${a}</span><span>${b}</span></div>`).join('');
}

Object.assign(SFX, {
  click:  ()=>_sfxOn&&(playTone(1900,.035,.12,'square'), playTone(1250,.05,.10,'square',.05)),
  crack:  ()=>_sfxOn&&(playTone(420,.05,.16,'sawtooth'), playTone(160,.12,.16,'square',.02), playTone(1100,.03,.07,'square',.01)),
  squelch:()=>_sfxOn&&(playTone(260,.08,.13,'sine'), playTone(190,.10,.12,'triangle',.06), playTone(130,.14,.10,'sine',.13)),
  thud:   ()=>_sfxOn&&(playTone(95,.14,.2,'triangle'), playTone(62,.18,.14,'sine',.02)),
  crumble:()=>_sfxOn&&(playTone(110,.18,.2,'sawtooth'), playTone(75,.25,.18,'triangle',.05), playTone(140,.1,.12,'square',.12)),
  tick:   n=>_sfxOn&&(playTone(n%2?1500:1050,.05,.12,'square')),
  boom:   ()=>_sfxOn&&sfxChainBomb(),
  water:  ()=>_sfxOn&&(playTone(330,.12,.08,'sine'), playTone(250,.16,.08,'sine',.08)),
});
