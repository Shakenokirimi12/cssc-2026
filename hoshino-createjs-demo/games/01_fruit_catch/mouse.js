// ------------------------------------------
// マウス・タッチ操作処理 (mouse.js)
// ------------------------------------------

// マウス移動イベントハンドラの初期化
function initMouseControl() {
    stage.addEventListener("stagemousemove", function(evt) {
        if (scene_id === 1 && basket) { // プレイ中の場合
            basket.x = evt.stageX; // マウスカーソルのX座標にカゴを追従させる

            // 画面左右端の範囲外制限
            if (basket.x < BASKET_WIDTH / 2) basket.x = BASKET_WIDTH / 2;
            if (basket.x > STAGE_W - BASKET_WIDTH / 2) basket.x = STAGE_W - BASKET_WIDTH / 2;
        }
    });
}
