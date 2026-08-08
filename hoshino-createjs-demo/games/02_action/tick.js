// ------------------------------------------
// 毎フレーム更新処理 (tick.js)
// ------------------------------------------

// 毎フレーム実行されるメイン処理関数
function handleTick(event) {
    if (scene_id === 1) { // プレイ中の場合
        // 1. キー入力に応じた左右速度の設定
        playerVX = 0;
        if (isPressLeft) playerVX = -PLAYER_SPEED;
        if (isPressRight) playerVX = PLAYER_SPEED;

        // 2. ジャンプ入力と着地状態の判定（接地時のみジャンプ可能）
        if (isPressJump && isGrounded) {
            playerVY = JUMP_POWER;
            isGrounded = false;
        }

        // 3. 重力を縦方向速度に加算
        playerVY += GRAVITY;

        // 4. 座標の更新
        player.x += playerVX;
        player.y += playerVY;

        // 5. 画面左右端からの飛び出し制限
        if (player.x - PLAYER_SIZE/2 < 0) player.x = PLAYER_SIZE/2;
        if (player.x + PLAYER_SIZE/2 > STAGE_W) player.x = STAGE_W - PLAYER_SIZE/2;

        // 6. 足場との着地・当たり判定
        checkPlatformCollision();

        // 7. 落下死判定（画面下端より下に落ちた場合）
        if (player.y > STAGE_H + 50) {
            showGameOver(false);
            return;
        }

        // 8. 障害物（トゲ）との接触判定
        checkHazardCollision();

        // 9. コイン獲得判定
        checkCoinCollision();

        // 10. ゴール到達判定
        checkGoalCollision();
    }

    // 画面の再描画
    stage.update();
}

// 足場との着地判定関数
function checkPlatformCollision() {
    isGrounded = false; // 初期状態は非接地

    for (let p of platforms) {
        let pLeft = p.x;
        let pRight = p.x + p.w;
        let pTop = p.y;

        let feetY = player.y + PLAYER_SIZE / 2; // プレイヤーの足元Y座標
        let prevFeetY = feetY - playerVY;        // 1フレーム前の足元Y座標

        // X座標が足場の幅の中に収まっているかチェック
        if (player.x + PLAYER_SIZE/3 >= pLeft && player.x - PLAYER_SIZE/3 <= pRight) {
            // 上から下へ移動して足場の上面を跨いだ瞬間に着地させる
            if (prevFeetY <= pTop + 6 && feetY >= pTop && playerVY >= 0) {
                player.y = pTop - PLAYER_SIZE / 2; // 足場の上面に位置補正
                playerVY = 0; // 落下速度をリセット
                isGrounded = true; // 接地フラグを立てる
                break;
            }
        }
    }
}

// 障害物（トゲ）との衝突判定関数
function checkHazardCollision() {
    for (let h of hazards) {
        let dx = Math.abs(player.x - (h.x + 15));
        let dy = Math.abs(player.y - (h.y + 5));

        // 距離が一定以下ならダメージ（即ゲームオーバー）
        if (dx < 20 && dy < 20) {
            showGameOver(false);
            return;
        }
    }
}

// コイン獲得判定関数
function checkCoinCollision() {
    for (let i = coins.length - 1; i >= 0; i--) {
        let c = coins[i];
        let dist = Math.hypot(player.x - c.x, player.y - c.y); // 中心同士の距離

        // コインに触れた場合
        if (dist < PLAYER_SIZE / 2 + 10) {
            score += 150;
            scoreText.text = "スコア: " + score;

            stage.removeChild(c); // 画面からコインを削除
            coins.splice(i, 1);    // 配列から除外
        }
    }
}

// ゴール旗との接触判定関数
function checkGoalCollision() {
    let dist = Math.hypot(player.x - (goal.x + 10), player.y - (goal.y + 20));
    if (dist < 35) {
        score += 500;
        showGameOver(true); // ステージクリア画面へ
    }
}
