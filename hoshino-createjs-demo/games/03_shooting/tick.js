let bgmAudio = null;

function playSE(path, volume = 0.15) {
    try {
        let audio = new Audio(path);
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(function(e){});
    } catch(e) {}
}

function playBGM(path, volume = 0.18) {
    try {
        if (!bgmAudio) {
            bgmAudio = new Audio(path);
            bgmAudio.loop = true;
        }
        bgmAudio.volume = volume;
        bgmAudio.play().catch(function(e){});
    } catch(e) {}
}

function stopBGM() {
    if (bgmAudio) bgmAudio.pause();
}

function handleTick() {
    if (scene_id === 1) {
        playBGM("../../Audio/maou_bgm_neorock82.mp3", 0.18);
    } else {
        stopBGM();
    }

    // 背景の星スクロール
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > STAGE_H) star.y = 0;
    }

    if (scene_id === 0) {
        stage.update();
    }
    else if (scene_id === 1) {
        frame_cnt++;

        // 1. 自機の移動（8方向移動）
        if (isPressRight) player.x += playerSpeed;
        if (isPressLeft) player.x -= playerSpeed;
        if (isPressDown) player.y += playerSpeed;
        if (isPressUp) player.y -= playerSpeed;

        if (player.x < 15) player.x = 15;
        if (player.x > STAGE_W - 15) player.x = STAGE_W - 15;
        if (player.y < 20) player.y = 20;
        if (player.y > STAGE_H - 20) player.y = STAGE_H - 20;

        // 2. 自機のショット
        if (shootCooldown > 0) shootCooldown--;
        if (isPressShoot && shootCooldown <= 0) {
            shootCooldown = 12; // 適切な連射間隔
            createPlayerBullet(player.x, player.y - 16, 0, -12);
        }

        // 3. 雑魚敵の定期出現
        if (frame_cnt % 35 === 0) {
            spawnEnemy();
        }

        // 4. 雑魚敵の移動
        for (let i = enemyList.length - 1; i >= 0; i--) {
            let enemy = enemyList[i];
            enemy.y += enemy.speedY;

            if (enemy.y > STAGE_H + 30) {
                stage.removeChild(enemy);
                enemyList.splice(i, 1);
            }
        }

        // 5. 自機弾の移動
        for (let i = bulletList.length - 1; i >= 0; i--) {
            let b = bulletList[i];
            b.y += b.vy;

            if (b.y < -30) {
                stage.removeChild(b);
                bulletList.splice(i, 1);
            }
        }

        // 6. 自機弾と雑魚敵の衝突判定
        for (let i = enemyList.length - 1; i >= 0; i--) {
            let enemy = enemyList[i];
            for (let j = bulletList.length - 1; j >= 0; j--) {
                let bullet = bulletList[j];
                let dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);

                if (dist < 22) {
                    createExplosion(enemy.x, enemy.y, "orange");
                    stage.removeChild(bullet);
                    bulletList.splice(j, 1);

                    enemy.hp--;
                    if (enemy.hp <= 0) {
                        score += enemy.pts;
                        stage.removeChild(enemy);
                        enemyList.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // 7. 自機と雑魚敵の衝突判定
        for (let i = enemyList.length - 1; i >= 0; i--) {
            let enemy = enemyList[i];
            let dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (dist < 22) {
                createExplosion(enemy.x, enemy.y, "red");
                stage.removeChild(enemy);
                enemyList.splice(i, 1);
                lives--;
                if (lives <= 0) {
                    showGameOver();
                    return;
                }
            }
        }

        // UI表示の更新
        scoreBoard.text = "スコア: " + score;
        livesBoard.text = "ライフ: " + lives;

        stage.update();
    }
}

function spawnEnemy() {
    let enemy = new createjs.Shape();
    let isHard = Math.random() < 0.3;

    if (isHard) {
        enemy.graphics.beginFill("red").drawPolyStar(0, 0, 14, 3, 0.5, 180);
        enemy.hp = 2;
        enemy.speedY = 4;
        enemy.pts = 200;
    } else {
        enemy.graphics.beginFill("green").drawCircle(0, 0, 14);
        enemy.hp = 1;
        enemy.speedY = 2.5;
        enemy.pts = 100;
    }

    enemy.x = Math.random() * (STAGE_W - 120) + 60;
    enemy.y = -30;

    stage.addChild(enemy);
    enemyList.push(enemy);
}

function createPlayerBullet(x, y, vx, vy) {
    playSE("../../Audio/ショット.mp3", 0.08); // 音量小さめ
    let bullet = new createjs.Shape();
    bullet.graphics.beginFill("white").drawCircle(0, 0, 3.5);
    bullet.x = x;
    bullet.y = y;
    bullet.vx = vx;
    bullet.vy = vy;
    stage.addChild(bullet);
    bulletList.push(bullet);
}

function createExplosion(x, y, color) {
    let exp = new createjs.Shape();
    exp.graphics.beginFill(color).drawCircle(0, 0, 12);
    exp.x = x;
    exp.y = y;
    stage.addChild(exp);

    createjs.Tween.get(exp)
        .to({ scaleX: 2.2, scaleY: 2.2, alpha: 0 }, 250)
        .call(function() {
            stage.removeChild(exp);
        });
}
