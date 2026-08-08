// ==========================================
// 2Dシューティングゲーム (発展版) - ゲームオーバー / クリア表示
// ==========================================

/**
 * ゲーム終了画面（ゲームオーバー または ステージクリア）を表示する関数
 * @param {boolean} isClear クリアの場合true、ゲームオーバーの場合false
 */
function showGameOver(isClear = false) {
    scene_id = isClear ? 3 : 2; // 画面状態を設定 (2:ゲームオーバー, 3:クリア)

    // リザルト画面用のコンテナ作成
    let resultContainer = new createjs.Container();

    // 背景の半透明黒オーバーレイ
    let overlay = new createjs.Shape();
    overlay.graphics.beginFill("rgba(0, 0, 0, 0.75)").drawRect(0, 0, STAGE_W, STAGE_H);
    resultContainer.addChild(overlay);

    // メッセージテキストの設定
    let msgStr = isClear ? "🎉 STAGE CLEAR! 🎉" : "GAME OVER";
    let msgColor = isClear ? "yellow" : "red";
    let msgText = new createjs.Text(msgStr, "bold 44px sans-serif", msgColor);
    msgText.x = STAGE_W / 2 - msgText.getMeasuredWidth() / 2;
    msgText.y = 160;
    resultContainer.addChild(msgText);

    // 最終スコアテキスト
    let finalScoreText = new createjs.Text("最終スコア: " + score, "28px sans-serif", "white");
    finalScoreText.x = STAGE_W / 2 - finalScoreText.getMeasuredWidth() / 2;
    finalScoreText.y = 240;
    resultContainer.addChild(finalScoreText);

    // 再挑戦案内テキスト
    let retryText = new createjs.Text("クリック または Zキー でタイトルに戻る", "20px sans-serif", "cyan");
    retryText.x = STAGE_W / 2 - retryText.getMeasuredWidth() / 2;
    retryText.y = 330;
    resultContainer.addChild(retryText);

    stage.addChild(resultContainer);

    // クリックでタイトル画面に戻るイベント
    stage.addEventListener("stagemousedown", function backToTitle() {
        stage.removeEventListener("stagemousedown", backToTitle);
        initTitle();
    });

    stage.update();
}
