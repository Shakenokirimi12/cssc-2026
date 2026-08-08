// ------------------------------------------
// 毎フレーム更新処理 (tick.js)
// ------------------------------------------

// 毎フレーム実行されるメイン処理関数
function handleTick() {
    if (scene_id === 1) { // プレイ中の場合
        frame_cnt++;

        // キーボード操作によるカゴの移動
        if (isPressLeft) basket.x -= BASKET_SPEED;
        if (isPressRight) basket.x += BASKET_SPEED;

        // カゴが画面外に出ないように座標を制限
        if (basket.x < BASKET_WIDTH / 2) basket.x = BASKET_WIDTH / 2;
        if (basket.x > STAGE_W - BASKET_WIDTH / 2) basket.x = STAGE_W - BASKET_WIDTH / 2;

        // 定期的にアイテムを出現（35フレームごと）
        if (frame_cnt % 35 === 0) {
            spawnItem();
        }

        // 落下アイテムの更新および衝突判定
        updateItems();
    }

    // 画面の再描画実行
    stage.update();
}

// 効果音再生用の安全な関数
function playSE(path) {
    try {
        let audio = new Audio(path);
        audio.currentTime = 0;
        audio.play().catch(function(e){});
    } catch(e) {}
}

// 落下アイテムをランダム生成する関数
function spawnItem() {
    let item = new createjs.Container();
    let rand = Math.random();
    let type = "apple";

    if (rand < 0.2) {
        type = "poison"; // 20%の確率で毒キノコ
    } else if (rand < 0.35) {
        type = "star";   // 15%の確率で金の星
    }

    let shape = new createjs.Shape();

    // 種類に応じた形状と得点の設定
    if (type === "apple") {
        shape.graphics.beginFill("red").drawCircle(0, 0, 16);
        item.pts = 100;
    } else if (type === "star") {
        shape.graphics.beginFill("gold").drawRect(-12, -12, 24, 24);
        shape.rotation = 45;
        item.pts = 300;
    } else if (type === "poison") {
        shape.graphics.beginFill("purple").drawCircle(0, 0, 16);
        item.pts = -200;
    }

    item.addChild(shape);
    item.type = type;
    item.x = Math.random() * (STAGE_W - 80) + 40;
    item.y = -30;
    item.speed = FALL_SPEED_BASE + Math.floor(score / 1000) * 0.5 + Math.random() * 1.5;

    stage.addChild(item);
    itemList.push(item);
}

// 落下アイテムの位置移動と衝突判定関数
function updateItems() {
    for (let i = itemList.length - 1; i >= 0; i--) {
        let item = itemList[i];
        item.y += item.speed;

        let dx = Math.abs(item.x - basket.x);
        let dy = Math.abs(item.y - basket.y);

        // カゴの範囲に入った場合（キャッチ成功）
        if (dx < BASKET_WIDTH / 2 + 10 && dy < 25) {
            score += item.pts;
            if (score < 0) score = 0;
            scoreText.text = "スコア: " + score;

            // ユーザー指定: 「決定はキャッチで取得」SE再生
            playSE("../../Audio/決定ボタンを押す22.mp3");

            let label = item.pts > 0 ? "+" + item.pts : item.pts;
            let color = item.pts > 0 ? "green" : "purple";
            showEffectText(item.x, item.y, label, color);

            stage.removeChild(item);
            itemList.splice(i, 1);
            continue;
        }

        // 画面下端を越えて見逃した場合
        if (item.y > STAGE_H + 30) {
            if (item.type !== "poison") {
                lives--;
                updateLivesDisplay();

                if (lives <= 0) {
                    showGameOver();
                    return;
                }
            }

            stage.removeChild(item);
            itemList.splice(i, 1);
        }
    }
}

// 残りライフ表示の更新関数
function updateLivesDisplay() {
    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "❤️";
    livesText.text = "ライフ: " + hearts;
}

// 得点表示のポップアップアニメーション関数
function showEffectText(x, y, textStr, color) {
    let txt = new createjs.Text(textStr, "bold 24px sans-serif", color);
    txt.x = x - 15;
    txt.y = y;
    stage.addChild(txt);

    createjs.Tween.get(txt)
        .to({ y: y - 30, alpha: 0 }, 500)
        .call(function() {
            stage.removeChild(txt);
        });
}
