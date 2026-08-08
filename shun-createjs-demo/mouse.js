// ==========================================
// ★ マウス・タッチ入力ファイル (mouse.js) ★
// キーが使えないときも、クリックでスタート／リスタートできます。
// ==========================================

function handleMouseDown(event) {
  // タイトルや結果画面なら、どこをクリックしても開始しやすくする
  if (isGameTitle || isGameOver || isTimeUp) {
    startGame();
    return;
  }

  // 将来ボタンを増やすときは、event.stageX / event.stageY を使えます。
  // 例：restartButtonArea の中かを調べて、特定のボタンだけ反応させる。
}
