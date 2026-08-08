// ------------------------------------------
// ゲームオーバー・リザルト処理 (gameover.js)
// ------------------------------------------

// ゲームオーバー画面を表示する関数
function showGameOver() {
    scene_id = 2; // 画面状態を「ゲームオーバー」に設定

    // 画面に残っている全アイテムを消去
    for (let item of itemList) {
        stage.removeChild(item);
    }
    itemList = [];

    // ゲームオーバーのタイトル文字表示
    let gameOverText = new createjs.Text("GAME OVER", "44px bold sans-serif", "red");
    gameOverText.x = STAGE_W / 2 - gameOverText.getMeasuredWidth() / 2;
    gameOverText.y = 180;
    stage.addChild(gameOverText);

    // 最終スコア結果の表示
    let finalScoreText = new createjs.Text("獲得スコア: " + score + " 点", "28px sans-serif", "black");
    finalScoreText.x = STAGE_W / 2 - finalScoreText.getMeasuredWidth() / 2;
    finalScoreText.y = 260;
    stage.addChild(finalScoreText);

    // 再スタート案内の表示
    let restartText = new createjs.Text("スペースキー または クリック でタイトルに戻る", "20px sans-serif", "#555555");
    restartText.x = STAGE_W / 2 - restartText.getMeasuredWidth() / 2;
    restartText.y = 350;
    stage.addChild(restartText);

    // 0.5秒後にクリックでタイトルに戻るイベントを有効化
    setTimeout(function() {
        stage.addEventListener("stagemousedown", initTitle);
    }, 500);
}
