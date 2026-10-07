// ══════════════════════════════════════════════
// MAĞAZA — SATIN ALMA ANİMASYONU + HARİTADA İNŞAAT ANİMASYONU (yalnızca görsel katman)
// ══════════════════════════════════════════════
function saOnce(el, frames, opts){
  document.body.appendChild(el);
  let done=false; const kill=()=>{ if(!done){ done=true; el.remove(); } };
  try{ const a=el.animate(frames,opts); a.onfinish=kill; a.oncancel=kill; }catch(e){}
  setTimeout(kill,(opts.duration||600)+(opts.delay||0)+150);
}
const saReduce=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

function saBuyFx(id){
  const card=document.querySelector(`#shopGrid .shop-item[data-id="${id}"]`);
  if(!card) return;
  card.classList.remove('sa-bought'); void card.offsetWidth; card.classList.add('sa-bought');
  const lbl=document.createElement('div'); lbl.className='sa-bought-lbl'; lbl.textContent='✦ Satın Alındı!';
  card.appendChild(lbl);
  setTimeout(()=>{ lbl.remove(); card.classList.remove('sa-bought'); },1750);
  if(saReduce()) return;
  const r=card.querySelector('.si-preview').getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+r.height/2;
  // Yıldız + konfeti patlaması
  const cols=['#f5c842','#fff3c4','#ffb347','#44ff88','#7ae8ff'];
  for(let i=0;i<18;i++){
    const p=document.createElement('div');
    const star=i%3===0;
    p.className='sa-conf'+(star?' st':'');
    if(star) p.textContent='✦';
    p.style.cssText=`left:${cx}px;top:${cy}px;${star?'color:'+cols[i%2]:'background:'+cols[i%cols.length]};`;
    const ang=Math.random()*Math.PI*2, d=40+Math.random()*50, rot=(Math.random()-.5)*540;
    saOnce(p,[
      {transform:'translate(-50%,-50%) scale(.4)',opacity:1},
      {transform:`translate(calc(-50% + ${Math.cos(ang)*d}px),calc(-50% + ${Math.sin(ang)*d-18}px)) rotate(${rot/2}deg) scale(1)`,opacity:1,offset:.45},
      {transform:`translate(calc(-50% + ${Math.cos(ang)*d*1.25}px),calc(-50% + ${Math.sin(ang)*d+34}px)) rotate(${rot}deg) scale(.6)`,opacity:0}
    ],{duration:950+Math.random()*250,easing:'cubic-bezier(.2,.7,.4,1)',fill:'forwards'});
  }
  // Altın kese cüzdana uçar
  const wal=document.querySelector('#shopScreen .shop-wallet-item.w-coin');
  const wi=wal?.querySelector('.wi-icon');
  if(!wi) return;
  const w=wi.getBoundingClientRect(), tx=w.left+w.width/2, ty=w.top+w.height/2;
  const mx=(cx+tx)/2 + (tx<cx?-40:40), my=Math.min(cy,ty)-50;
  const f=document.createElement('div'); f.className='sa-fly-pouch'; f.innerHTML=SA_POUCH;
  saOnce(f,[
    {transform:`translate(${cx}px,${cy}px) scale(.5)`,opacity:0},
    {transform:`translate(${cx}px,${cy-26}px) scale(1.35)`,opacity:1,offset:.22},
    {transform:`translate(${mx}px,${my}px) scale(1.1) rotate(-12deg)`,opacity:1,offset:.6},
    {transform:`translate(${tx}px,${ty}px) scale(.55) rotate(0)`,opacity:.3}
  ],{duration:950,easing:'cubic-bezier(.4,.1,.3,1)',fill:'forwards'});
  setTimeout(()=>{ wal.classList.remove('sa-hit'); void wal.offsetWidth; wal.classList.add('sa-hit'); },900);
}

const _saOrigBuyItem = buyItem;
buyItem = function(itemId){
  const before=(getInv()[itemId]||0), coins=G.coins;
  const res=_saOrigBuyItem.apply(this,arguments);
  if((getInv()[itemId]||0)>before && G.coins<coins) saBuyFx(itemId);
  return res;
};

// Haritaya yeni yerleştirilen öğe aşağıdan yükselerek "inşa edilir"
const _saOrigPlaceItem = placeItemOnMap;
placeItemOnMap = function(){
  const n=getMapItems().length;
  const res=_saOrigPlaceItem.apply(this,arguments);
  if(getMapItems().length>n){
    const last=document.getElementById('mapItemsLayer')?.lastElementChild;
    if(last){ last.classList.add('mi-new'); setTimeout(()=>last.classList.remove('mi-new'),1000); }
  }
  return res;
};
