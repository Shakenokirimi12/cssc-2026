// ==========================================
// ★ キーボード入力ファイル (key.js) ★
// 「キーが押された / 離された」という事実だけを記録します。
// 実際にプレイヤーを動かす処理は tick.js に書きます。
// ==========================================

function handleKeyDown(e) {
  // 矢印キーでブラウザ画面がスクロールしないようにする
  if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.code === "Space") {
    e.preventDefault();
  }

  // タイトル・終了画面では、スペースキーでスタート（またはリスタート）
  if (e.code === "Space") {
    if (isGameTitle || isGameOver || isTimeUp) {
      startGame();
    }
    return;
  }

  // Rキーでも最初からやり直せます。デモ中の保険として便利です。
  if ((e.key === "r" || e.key === "R") && (isGameOver || isTimeUp)) {
    startGame();
    return;
  }

  // ゲーム中だけ、左右キーの状態をオンにする
  if (!isGameTitle && !isGameOver && !isTimeUp) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      isPressLeft = true;
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      isPressRight = true;
    }
  }
}

function handleKeyUp(e) {
  // キーを離したらフラグをオフにする。
  // これを書かないと、一度押しただけで動き続けてしまいます。
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    isPressLeft = false;
  }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    isPressRight = false;
  }
}
