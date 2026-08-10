// ==========================================
// ★ キー入力検知ファイル (key.js) ★
// ==========================================

// キーが押されたとき
window.addEventListener("keydown", function(e) {
  if (e.key === "m" || e.key === "M") {
    toggleMute();
    return;
  }

  if (e.keyCode === 32) { // スペースキー
    if (isGameTitle) {
      // タイトル画面の処理
      isGameTitle = false;
      createjs.Sound.play("bgm" , {loop: -1, volume: 0.03});
      init();
    } else if (isGameOver || isGameClear) {
      isGameTitle = true;
      isGameOver = false;
      isGameClear = false;
      // ゲーム開始時の初期化
      //bgm
      createjs.Sound.stop(); 
      init(); 
    } else {
      isPressSpace = true;
      
        for(let i = 0; i < ballList.length; i++) {
          if (ballList[i]) {
            BallSpaceReverse(ballList[i]);
          }
        }
    }
  }
  if (e.keyCode === 37) { // 左矢印キー
    isPressLeft = true;
    paddle.noTouch = false; // 左右キーが押されたらパドルを操作可能にする
  }
  if (e.keyCode === 39) { // 右矢印キー
    isPressRight = true;
    paddle.noTouch = false; // 左右キーが押されたらパドルを操作可能にする
  }
});

// キーが離されたとき
window.addEventListener("keyup", function(e) {
  if (e.keyCode === 37) {
    isPressLeft = false;
  }
  if (e.keyCode === 39) {
    isPressRight = false;
  }
  if (e.keyCode === 32) {
    isPressSpace = false;
  }
});

//ステージ変更処理
window.addEventListener("keydown", function(e) {
  if(isGameTitle) {
    if (e.keyCode === 49) { // 1キー
      nowBlockMap = blockMaps[0];
      refreshBlockMapDisplay();
    }
    if (e.keyCode === 50) { // 2キー
      nowBlockMap = blockMaps[1];
      refreshBlockMapDisplay();
    }
    if (e.keyCode === 51) { // 3キー
      nowBlockMap = blockMaps[2];
      refreshBlockMapDisplay();
    }
    if (e.keyCode === 52) { // 4キー
      nowBlockMap = blockMaps[3];
      refreshBlockMapDisplay();
    }
    if (e.keyCode === 53) { // 5キー
      nowBlockMap = blockMaps[4];
      refreshBlockMapDisplay();
    }
  }
})