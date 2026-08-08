// ------------------------------------------
// キーボード入力処理 (key.js)
// ------------------------------------------

// キーボードが押された時のイベントハンドラ
function handleKeyDown(event) {
    if (event.keyCode === 37 || event.keyCode === 65) isPressLeft = true;  // 左矢印 または Aキー
    if (event.keyCode === 39 || event.keyCode === 68) isPressRight = true; // 右矢印 または Dキー
    if (event.keyCode === 38 || event.keyCode === 87 || event.keyCode === 32) { // 上矢印 または Wキー または スペース
        isPressJump = true;
        if (scene_id === 0) startGame(); // タイトル画面ならスタート
        if (scene_id >= 2) initTitle(); // 結果画面ならタイトルへ戻る
    }
}

// キーボードが離された時のイベントハンドラ
function handleKeyUp(event) {
    if (event.keyCode === 37 || event.keyCode === 65) isPressLeft = false;
    if (event.keyCode === 39 || event.keyCode === 68) isPressRight = false;
    if (event.keyCode === 38 || event.keyCode === 87 || event.keyCode === 32) isPressJump = false;
}
