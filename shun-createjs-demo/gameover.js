// ==========================================
// ★ 終了画面ファイル (gameover.js) ★
// 爆弾に当たった時と時間切れの時の処理を、ここにまとめます。
// ==========================================

// 爆弾に当たったときに呼ぶ
function gameOverByBomb() {
  if (isGameOver || isTimeUp) return;

  isGameOver = true;
  isPressLeft = false;
  isPressRight = false;
  playSoundEffect("bomb");
  showResultScreen("BOMB! GAME OVER", "#ff6478");
}

// 残り時間が0になったときに呼ぶ
function gameOverByTime() {
  if (isGameOver || isTimeUp) return;

  isTimeUp = true;
  isPressLeft = false;
  isPressRight = false;
  playSoundEffect("timeup");
  // 最終フレームでは tick.js のUI更新前に止まるため、ここで0秒を表示する
  if (timeBoard) timeBoard.text = "TIME: 0";
  showResultScreen("TIME UP!", "#ffe36e");
}

// 中央に結果を表示する
function showResultScreen(title, color) {
  const panel = new createjs.Shape();
  panel.graphics.beginFill("rgba(0, 0, 0, 0.72)").drawRoundRect(70, 185, STAGE_W - 140, 235, 18);
  uiLayer.addChild(panel);

  const result = new createjs.Text(
    title + "\n\nFINAL SCORE: " + score + "\n\nSPACE / クリックで もう一度",
    "bold 29px Arial",
    color
  );
  result.textAlign = "center";
  result.textBaseline = "middle";
  result.lineHeight = 42;
  result.x = STAGE_W / 2;
  result.y = STAGE_H / 2;
  uiLayer.addChild(result);
  gameText = result;
}

// タイトル画面用の大きなメッセージ
function showCenterMessage(message, color) {
  const panel = new createjs.Shape();
  panel.graphics.beginFill("rgba(0, 0, 0, 0.65)").drawRoundRect(45, 160, STAGE_W - 90, 280, 18);
  uiLayer.addChild(panel);

  gameText = new createjs.Text(message, "bold 23px Arial", color);
  gameText.textAlign = "center";
  gameText.textBaseline = "middle";
  gameText.lineHeight = 34;
  gameText.x = STAGE_W / 2;
  gameText.y = STAGE_H / 2;
  uiLayer.addChild(gameText);
}
