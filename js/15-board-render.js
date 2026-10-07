// ══════════════════════════════════════════════
// BOARD RENDER
// ══════════════════════════════════════════════
function renderBoard(){
  const boardEl=document.getElementById('board');
  const size=Math.min(
    Math.floor((window.innerHeight*0.42)/BS),
    Math.floor((window.innerWidth*0.9)/BS)
  );
  boardEl.style.gridTemplateColumns=`repeat(${BS},${size}px)`;
  boardEl.style.gridTemplateRows=`repeat(${BS},${size}px)`;
  boardEl.innerHTML='';

  for(let r=0;r<BS;r++){
    for(let c=0;c<BS;c++){
      const gem=G.board[r][c];
      const base=getGemBase(gem);
      const power=getGemPower(gem);
      const cell=document.createElement('div');
      cell.dataset.r=r; cell.dataset.c=c;
      cell.style.width=cell.style.height=size+'px';

      if(!gem){
        cell.className='cell empty';
      } else if(isObstacle(gem)){
        const {type,val}=obstacleInfo(gem);
        cell.style.fontSize=Math.floor(size*0.48)+'px';
        if(HD_OBST[type]){
          hdRenderObstCell(cell, gem);
        } else if(type==='ice'){
          const gd=GEMS[val]||GEMS.gem1;
          cell.style.setProperty('--gem-color',gd.color);
          cell.className='cell obst obst-ice';
          cell.innerHTML=`<span class="obst-gem">${gd.symbol}</span><span class="obst-hp">❄</span>`;
        } else {
          cell.className='cell obst obst-'+type+' hp'+val;
          cell.innerHTML=`<span class="obst-hp">${'●'.repeat(+val)}</span>`;
        }
        // cell.onclick=()=>onCellClick(r,c);   // pasif: taş takası artık kaydırma (swipe) ile
      } else {
        const gd=GEMS[base];
        cell.style.setProperty('--gem-color',gd.color);
        cell.style.setProperty('--gem-bg',gd.bg);
        cell.style.setProperty('--gem-glow',gd.glow);
        cell.style.fontSize=Math.floor(size*0.48)+'px';

        if(power==='bomb'){
          cell.className='cell gem-cell power-bomb';
          cell.innerHTML=`${gd.symbol}<span class="power-badge">💥</span>`;
        } else if(power==='super'){
          cell.className='cell gem-cell power-super';
          cell.innerHTML=`${gd.symbol}<span class="power-badge">⚡</span>`;
        } else if(SPECIAL_STONES[power]){
          cell.className='cell gem-cell power-special power-'+power;
          cell.innerHTML=`${gd.symbol}<span class="power-badge">${spIcon(power)}</span>`;
        } else {
          cell.className='cell gem-cell';
          cell.textContent=gd.symbol;
        }
        // cell.onclick=()=>onCellClick(r,c);   // pasif: taş takası artık kaydırma (swipe) ile
      }
      boardEl.appendChild(cell);
    }
  }
}

function getCellEl(r,c){ return document.querySelector(`#board .cell[data-r="${r}"][data-c="${c}"]`); }
