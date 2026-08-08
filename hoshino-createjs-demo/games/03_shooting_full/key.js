// ==========================================
// 2Dシューティングゲーム (発展版) - キー入力管理
// ==========================================

// キーボードの押し下げ/離下イベントリスナー登録
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

/**
 * キー押下時の処理 (KeyDown)
 */
function handleKeyDown(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 90: case 32: // Zキー (90) または スペースキー (32)
            isPressShoot = true;
            if (scene_id === 0) {
                startGame(); // タイトル画面ならゲームスタート
            }
            break;
        case 37: case 65: isPressLeft = true; break;  // 左矢印 または Aキー
        case 39: case 68: isPressRight = true; break; // 右矢印 または Dキー
        case 38: case 87: isPressUp = true; break;    // 上矢印 または Wキー
        case 40: case 83: isPressDown = true; break;  // 下矢印 または Sキー
    }
}

/**
 * キーを離した時の処理 (KeyUp)
 */
function handleKeyUp(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 90: case 32: isPressShoot = false; break;
        case 37: case 65: isPressLeft = false; break;
        case 39: case 68: isPressRight = false; break;
        case 38: case 87: isPressUp = false; break;
        case 40: case 83: isPressDown = false; break;
    }
}
