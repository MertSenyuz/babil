// ══════════════════════════════════════════════
// HEDEFE UÇAN TAŞLAR (goal bar'a uçuş) + HEDEF ÇUBUĞU EFEKTLERİ
// Oyun mantığı (G.goalProgress) anında güncellenir; ekrandaki sayı taşlar vardıkça artar.
// ══════════════════════════════════════════════
const GF = {shown:{}, pending:{}, flights:[], raf:0};
const gfReduce = ()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

// Bir öğeye tek seferlik WAAPI animasyonu uygula, bitince DOM'dan kaldır
function gfOnce(el, frames, opts){
  document.body.appendChild(el);
  let done=false;
  const kill=()=>{ if(!done){ done=true; el.remove(); } };
  try{ const a=el.animate(frames,opts); a.onfinish=kill; a.oncancel=kill; }catch(e){}
  setTimeout(kill,(opts.duration||500)+(opts.delay||0)+120);   // güvenlik: her durumda temizlenir
}

// Patlama parçacıkları — 0.5 sn, rastgele yönler
function gfBurst(x,y,color,count){
  if(gfReduce()) return;
  for(let i=0;i<count;i++){
    const p=document.createElement('div');
    const ang=Math.random()*Math.PI*2, dist=24+Math.random()*42, size=3+Math.random()*5;
    p.className='gf-part'+(Math.random()>.5?' sq':'');
    p.style.cssText=`left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:${-size/2}px 0 0 ${-size/2}px;background:${color};box-shadow:0 0 ${size*1.6}px ${color};`;
    gfOnce(p,[
      {transform:'translate(0,0) scale(1.4)',opacity:1},
      {transform:`translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist}px) scale(0)`,opacity:0}
    ],{duration:500,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'});
  }
}

function gfTargetPoint(k){
  const item=document.getElementById('goal_'+k);
  if(!item || !item.offsetParent) return null;
  const r=(item.querySelector('.goal-gem')||item).getBoundingClientRect();
  if(!r.width) return null;
  return {x:r.left+r.width/2, y:r.top+r.height/2};
}

// Uçuşları başlat — her taş için ayrı uçuş nesnesi, tek rAF döngüsü
function gfLaunch(list, combo){
  if(!list || !list.length || gfReduce()) return;
  const dur=Math.max(430, 760-Math.min(combo,3)*110);    // 2. eşleşmeden itibaren daha hızlı
  const trail=combo>=2;                                   // 3. eşleşmede iz bırakır
  const gap=combo?28:40;
  const now=performance.now();
  list.slice(0,30).forEach(({r,c,base},i)=>{
    const cell=getCellEl(r,c), end=gfTargetPoint(base), gd=GEMS[base];
    if(!cell || !end || !gd) return;
    const cr=cell.getBoundingClientRect();
    const sx=cr.left+cr.width/2, sy=cr.top+cr.height/2, ex=end.x, ey=end.y;
    // Hafif kavis: orta noktadan yola dik yönde kaydırılmış kontrol noktası
    const dx=ex-sx, dy=ey-sy, len=Math.hypot(dx,dy)||1;
    const bend=(Math.random()<.5?-1:1)*len*(0.18+Math.random()*0.12);
    const el=document.createElement('div');
    el.className='gf-fly';
    el.textContent=gd.symbol;
    el.style.color=gd.color;
    el.style.textShadow=`0 0 8px ${gd.color},0 0 14px ${gd.color}`;
    el.style.transform=`translate3d(${sx}px,${sy}px,0)`;
    document.body.appendChild(el);
    GF.pending[base]=(GF.pending[base]||0)+1;
    GF.flights.push({el,k:base,sx,sy,ex,ey,cx:(sx+ex)/2-dy/len*bend,cy:(sy+ey)/2+dx/len*bend,
      t0:now+i*gap+60,dur,trail,color:gd.color,lastTrail:0,rot:(Math.random()-.5)*240});
  });
  if(GF.flights.length && !GF.raf) GF.raf=requestAnimationFrame(gfTick);
}

function gfEase(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

function gfTick(now){
  GF.raf=0;
  for(let i=GF.flights.length-1;i>=0;i--){
    const f=GF.flights[i];
    const t=(now-f.t0)/f.dur;
    if(t<0) continue;
    if(t>=1){ f.el.remove(); GF.flights.splice(i,1); gfArrive(f.k); continue; }
    const e=gfEase(t), u=1-e;
    const x=u*u*f.sx+2*u*e*f.cx+e*e*f.ex;
    const y=u*u*f.sy+2*u*e*f.cy+e*e*f.ey;
    const sc=1-0.7*e;                                   // 1 → 0.3
    f.el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${f.rot*e}deg) scale(${sc})`;
    f.el.style.opacity=t<.08 ? t/.08 : t>.85 ? (1-t)/.15 : 1;
    if(f.trail && now-f.lastTrail>34){ f.lastTrail=now; gfTrailDot(x,y,f.color,sc); }
  }
  if(GF.flights.length) GF.raf=requestAnimationFrame(gfTick);
}

function gfTrailDot(x,y,color,sc){
  const d=document.createElement('div');
  d.className='gf-trail';
  d.style.cssText=`left:${x}px;top:${y}px;background:${color};box-shadow:0 0 6px ${color};`;
  gfOnce(d,[{transform:`scale(${sc*1.3})`,opacity:.75},{transform:'scale(.1)',opacity:0}],{duration:320,easing:'ease-out',fill:'forwards'});
}

// Taş hedefe vardı
function gfArrive(k){
  const target=G.goals && G.goals[k];
  if(target==null) return;
  GF.pending[k]=Math.max(0,(GF.pending[k]||0)-1);
  const real=Math.min(G.goalProgress[k]||0,target);
  const val=GF.pending[k]===0 ? real : Math.min((GF.shown[k]||0)+1, real);
  gfShow(k,val,true);
}

// Ekrandaki hedef sayısını güncelle (animasyonlu)
function gfShow(k,val,arrived){
  const item=document.getElementById('goal_'+k);
  const target=G.goals[k];
  if(!item) return;
  const changed=GF.shown[k]!==val;
  if(changed){ gfRoll(item,val,target); GF.shown[k]=val; }
  if(changed || arrived) gfBump(item);
  const done=val>=target;
  if(done && !item.classList.contains('done')){ item.classList.add('done'); gfCelebrate(item); }
  else if(!done) item.classList.remove('done');
}

// Eski sayı yukarı uçar, yeni sayı aşağıdan gelir
function gfRoll(item,val,target){
  const wrap=item.querySelector('.gi-num');
  if(!wrap){ const c=item.querySelector('.gi-count'); if(c) c.textContent=`${val}/${target}`; return; }
  while(wrap.children.length>1) wrap.firstElementChild.remove();   // önceki animasyondan kalan
  const old=wrap.firstElementChild;
  const nu=document.createElement('span');
  nu.textContent=val;
  wrap.appendChild(nu);
  if(gfReduce() || !old){ old?.remove(); return; }
  old.style.cssText='position:absolute;left:0;top:0;';
  const opts={duration:240,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'};
  try{
    const a=old.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(-100%)',opacity:0}],opts);
    a.onfinish=()=>old.remove();
    nu.animate([{transform:'translateY(100%)',opacity:0},{transform:'translateY(0)',opacity:1}],opts);
  }catch(e){ old.remove(); }
  setTimeout(()=>{ if(old.isConnected) old.remove(); },400);
}

function gfBump(item){
  if(gfReduce()) return;
  try{
    item._gfBump?.cancel();
    item._gfBump=item.animate([{transform:'scale(1.3)'},{transform:'scale(1)'}],{duration:260,easing:'cubic-bezier(.3,1.4,.5,1)'});
  }catch(e){}
}

// Hedef tamamlandı: yeşil parıltı + ✓ + konfeti + üstü çizili sayı
function gfCelebrate(item){
  item.classList.remove('gf-celebrate'); void item.offsetWidth; item.classList.add('gf-celebrate');
  setTimeout(()=>item.classList.remove('gf-celebrate'),1150);
  if(gfReduce()) return;
  const r=item.getBoundingClientRect();
  const x=r.left+r.width/2, y=r.top+r.height/2;
  const cols=['#44ff88','#f5c842','#ffffff','#7ad7ff','#ff7ab8'];
  for(let i=0;i<16;i++){
    const p=document.createElement('div');
    p.className='gf-conf';
    p.style.cssText=`left:${x}px;top:${y}px;background:${cols[i%cols.length]};`;
    const ang=-Math.PI/2+(Math.random()-.5)*Math.PI*1.4, sp=30+Math.random()*40;
    const dx=Math.cos(ang)*sp, dy=Math.sin(ang)*sp, rot=(Math.random()-.5)*720;
    gfOnce(p,[
      {transform:'translate(0,0) rotate(0) scale(1)',opacity:1},
      {transform:`translate(${dx}px,${dy}px) rotate(${rot/2}deg) scale(1)`,opacity:1,offset:.45},
      {transform:`translate(${dx*1.3}px,${dy+45}px) rotate(${rot}deg) scale(.6)`,opacity:0}
    ],{duration:800+Math.random()*200,easing:'cubic-bezier(.2,.7,.4,1)',fill:'forwards'});
  }
}

// Bölüm yeniden çizilince havadaki uçuşları temizle
function gfReset(){
  GF.flights.forEach(f=>f.el.remove());
  GF.flights=[]; GF.pending={}; GF.shown={};
  if(GF.raf){ cancelAnimationFrame(GF.raf); GF.raf=0; }
}

// Sonuç ekranını, son taşlar hedefe varana kadar kısaca beklet (en fazla ~1.6 sn)
const _gfOrigShowResult = showResult;
showResult = function(){
  const self=this, args=arguments;
  if(!GF.flights.length) return _gfOrigShowResult.apply(self,args);
  const t0=performance.now();
  (function wait(){
    if(!GF.flights.length || performance.now()-t0>1600) setTimeout(()=>_gfOrigShowResult.apply(self,args),350);
    else setTimeout(wait,60);
  })();
};
