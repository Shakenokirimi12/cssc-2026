// ------------------------------------------
// ゲームオーバー・リザルト処理 (gameover.js)
// ------------------------------------------

// 効果音再生関数
function playSE(path) {
    try {
        let audio = new Audio(path);
        audio.currentTime = 0;
        audio.play().catch(function(e){});
    } catch(e) {}
}

// ゲームオーバー/クリア画面を表示する関数
function showGameOver(isClear) {
    scene_id = isClear ? 3 : 2; // クリアかゲームオーバーかを設定

    // ユーザー指定: 「ファンファーレはアクションクリア」SE再生
    if (isClear) {
        playSE("../../Audio/ラッパのファンファーレ.mp3");
    }

    let msg = isClear ? "STAGE CLEAR!" : "GAME OVER";
    let color = isClear ? "green" : "red";

    // 結果タイトルのテキスト表示
    let resultText = new createjs.Text(msg, "44px bold sans-serif", color);
    resultText.x = STAGE_W / 2 - resultText.getMeasuredWidth() / 2;
    resultText.y = 180;
    stage.addChild(resultText);

    // 最終スコア結果の表示
    let finalScoreText = new createjs.Text("最終スコア: " + score + " 点", "28px sans-serif", "black");
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
