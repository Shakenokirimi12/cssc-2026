// ==========================================
// 2Dシューティングゲーム (発展版) - メインゲームループ (tick)
// ==========================================

let spiralAngle = 0; // 渦巻き・螺旋弾幕用のアングル変数
let bgmAudio = null; // BGMオーディオオブジェクト

/**
 * 効果音(SE)再生用ヘルパー関数
 * @param {string} path 音声ファイルのパス
 * @param {number} volume 音量 (0.0〜1.0)
 */
function playSE(path, volume = 0.15) {
    try {
        let audio = new Audio(path);
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch(function(e){});
    } catch(e) {}
}

/**
 * BGMループ再生用ヘルパー関数
 * @param {string} path BGM音声ファイルのパス
 * @param {number} volume 音量
 */
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

/**
 * BGM停止処理
 */
function stopBGM() {
    if (bgmAudio) {
        bgmAudio.pause();
    }
}

/**
 * 毎フレーム呼ばれる更新・描画処理
 */
function handleTick() {
    // プレイ中(scene_id === 1)のみBGMを再生
    if (scene_id === 1) {
        playBGM("../../Audio/maou_bgm_neorock82.mp3", 0.18);
    } else {
        stopBGM();
    }

    // 1. 背景の星スクロール処理
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > STAGE_H) {
            star.y = 0;
            star.x = Math.random() * STAGE_W;
        }
    }

    if (scene_id === 0) {
        stage.update();
    }
    else if (scene_id === 1) {
        frame_cnt++;
        phaseTimer++;

        // 2. 自機の移動（上下左右8方向移動と画面端判定）
        if (isPressRight) player.x += playerSpeed;
        if (isPressLeft) player.x -= playerSpeed;
        if (isPressDown) player.y += playerSpeed;
        if (isPressUp) player.y -= playerSpeed;

        if (player.x < 15) player.x = 15;
        if (player.x > STAGE_W - 15) player.x = STAGE_W - 15;
        if (player.y < 20) player.y = 20;
        if (player.y > STAGE_H - 20) player.y = STAGE_H - 20;

        // 3. 自機のショット発射処理
        if (shootCooldown > 0) shootCooldown--;
        if (isPressShoot && shootCooldown <= 0) {
            shootCooldown = (playerPower >= 3) ? 6 : 8;

            if (playerPower === 1) {
                // パワー1: 直進単発ショット
                createPlayerBullet(player.x, player.y - 16, 0, -12);
            } else if (playerPower === 2) {
                // パワー2: 左右2平行連射
                createPlayerBullet(player.x - 8, player.y - 12, 0, -12);
                createPlayerBullet(player.x + 8, player.y - 12, 0, -12);
            } else {
                // パワー3: 扇状3WAYショット
                createPlayerBullet(player.x, player.y - 16, 0, -12);
                createPlayerBullet(player.x - 8, player.y - 10, -3.5, -11);
                createPlayerBullet(player.x + 8, player.y - 10, 3.5, -11);
            }
        }

        // 4. ステージ進行フェーズ管理 (0:雑魚ラッシュ ➔ 1:WARNING ➔ 2:ボス戦)
        if (stagePhase === 0) {
            // 35フレームごとに雑魚敵を出現
            if (frame_cnt % 35 === 0) {
                spawnEnemy();
            }

            // タイマーが750を超えたらボス出現予告へ移行
            if (phaseTimer > 750) {
                stagePhase = 1;
                phaseTimer = 0;
                warningText = new createjs.Text("⚠️ WARNING! BOSS APPROACHING! ⚠️", "bold 32px sans-serif", "red");
                warningText.x = STAGE_W / 2 - warningText.getMeasuredWidth() / 2;
                warningText.y = STAGE_H / 2 - 20;
                stage.addChild(warningText);

                // 点滅アニメーション
                createjs.Tween.get(warningText, { loop: true })
                    .to({ alpha: 0.2 }, 250)
                    .to({ alpha: 1.0 }, 250);
            }
        } else if (stagePhase === 1) {
            if (phaseTimer > 140) {
                if (warningText) stage.removeChild(warningText);
                stagePhase = 2;
                phaseTimer = 0;
                spawnBoss(); // ボス登場
            }
        } else if (stagePhase === 2) {
            // 5. ボス戦のAI行動・弾幕制御
            if (boss) {
                boss.x += bossVx;
                if (boss.x < 160 || boss.x > STAGE_W - 160) bossVx *= -1;

                // 弾幕A: 3WAYゆったり弾 (90フレームごと)
                if (frame_cnt % 90 === 0) {
                    for (let a = -1; a <= 1; a++) {
                        shootEnemyBullet(boss.x, boss.y + 20, a * 1.4, 2.5);
                    }
                }

                // 弾幕B: 8方向リング弾幕 (180フレームごと)
                if (frame_cnt % 180 === 0) {
                    let count = 8;
                    for (let i = 0; i < count; i++) {
                        let rad = (Math.PI * 2 / count) * i;
                        let speed = 2.2;
                        shootEnemyBullet(boss.x, boss.y + 10, Math.cos(rad) * speed, Math.sin(rad) * speed);
                    }
                }

                // 弾幕C: ゆるやかな回転螺旋弾 (24フレームごと)
                if (frame_cnt % 24 === 0) {
                    spiralAngle += 20;
                    let rad = (spiralAngle * Math.PI) / 180;
                    let speed = 2.5;
                    shootEnemyBullet(boss.x, boss.y + 10, Math.cos(rad) * speed, Math.sin(rad) * speed);
                }
            }
        }

        // 6. 雑魚敵の移動と射撃処理
        for (let i = enemyList.length - 1; i >= 0; i--) {
            let enemy = enemyList[i];
            enemy.y += enemy.speedY;
            enemy.x += enemy.speedX;

            if (enemy.canShoot) {
                enemy.shootTimer++;
                // 黄色中型敵: 3WAY弾を射撃 (80フレームごと)
                if (enemy.type === "yellow" && enemy.shootTimer % 80 === 0) {
                    for (let a = -1; a <= 1; a++) {
                        shootEnemyBullet(enemy.x, enemy.y + 10, a * 1.3, 2.8);
                    }
                }
                // 緑色小型敵: 自機狙い弾を射撃 (90フレームごと)
                else if (enemy.type === "green" && enemy.shootTimer % 90 === 0) {
                    let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                    shootEnemyBullet(enemy.x, enemy.y + 10, Math.cos(angle) * 2.6, Math.sin(angle) * 2.6);
                }
            }

            // 画面外に出て消滅
            if (enemy.y > STAGE_H + 30) {
                stage.removeChild(enemy);
                enemyList.splice(i, 1);
            }
        }

        // 7. 敵の弾の移動と自機とのヒット判定
        for (let i = enemyBulletList.length - 1; i >= 0; i--) {
            let eb = enemyBulletList[i];
            eb.x += eb.vx;
            eb.y += eb.vy;

            // 自機との距離判定
            let dist = Math.hypot(eb.x - player.x, eb.y - player.y);
            if (dist < 13) {
                createExplosion(eb.x, eb.y, "red");
                stage.removeChild(eb);
                enemyBulletList.splice(i, 1);

                lives--;
                if (lives <= 0) {
                    showGameOver(false); // 被弾ゲームオーバー
                    return;
                }
                continue;
            }

            // 画面外で弾消去
            if (eb.x < -30 || eb.x > STAGE_W + 30 || eb.y < -30 || eb.y > STAGE_H + 30) {
                stage.removeChild(eb);
                enemyBulletList.splice(i, 1);
            }
        }

        // 8. 自機弾の移動とボスとのヒット判定
        for (let i = bulletList.length - 1; i >= 0; i--) {
            let b = bulletList[i];
            b.x += b.vx;
            b.y += b.vy;

            if (boss && bossHp > 0) {
                let bDist = Math.hypot(b.x - boss.x, b.y - boss.y);
                if (bDist < 50) {
                    stage.removeChild(b);
                    bulletList.splice(i, 1);

                    bossHp--;
                    bossHpFill.scaleX = Math.max(0, bossHp / bossMaxHp);
                    createExplosion(b.x, b.y, "cyan");

                    if (bossHp <= 0) {
                        onBossDefeated(); // ボス撃破処理へ
                        return;
                    }
                    continue;
                }
            }

            if (b.y < -30 || b.x < -30 || b.x > STAGE_W + 30) {
                stage.removeChild(b);
                bulletList.splice(i, 1);
            }
        }

        // 9. 自機弾と雑魚敵のヒット判定
        for (let i = enemyList.length - 1; i >= 0; i--) {
            let enemy = enemyList[i];
            for (let j = bulletList.length - 1; j >= 0; j--) {
                let bullet = bulletList[j];
                let dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);

                if (dist < 22) {
                    stage.removeChild(bullet);
                    bulletList.splice(j, 1);

                    enemy.hp--;
                    if (enemy.hp <= 0) {
                        createExplosion(enemy.x, enemy.y, "orange");
                        score += enemy.pts;

                        // 10%の確率でパワーアップアイテムドロップ
                        if (Math.random() < 0.10) {
                            spawnItem(enemy.x, enemy.y);
                        }

                        stage.removeChild(enemy);
                        enemyList.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // 10. 自機と雑魚敵の接触ダメージ判定
        for (let i = enemyList.length - 1; i >= 0; i--) {
            let enemy = enemyList[i];
            let dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (dist < 22) {
                createExplosion(enemy.x, enemy.y, "red");
                stage.removeChild(enemy);
                enemyList.splice(i, 1);
                lives--;
                if (lives <= 0) {
                    showGameOver(false);
                    return;
                }
            }
        }

        // 11. アイテム移動と自機による取得処理
        for (let i = itemList.length - 1; i >= 0; i--) {
            let it = itemList[i];
            it.y += 2;

            let dist = Math.hypot(it.x - player.x, it.y - player.y);
            if (dist < 26) {
                if (playerPower < 3) playerPower++;
                stage.removeChild(it);
                itemList.splice(i, 1);
                score += 200;
                continue;
            }

            if (it.y > STAGE_H + 20) {
                stage.removeChild(it);
                itemList.splice(i, 1);
            }
        }

        // UI（スコア・ライフ表示）更新
        scoreBoard.text = "スコア: " + score;
        livesBoard.text = "ライフ: " + "❤️".repeat(Math.max(0, lives));

        stage.update();
    }
}

/**
 * 雑魚敵生成関数
 */
function spawnEnemy() {
    let enemy = new createjs.Container();
    let shape = new createjs.Shape();
    let rand = Math.random();

    if (rand < 0.35) {
        // 赤色：高速直進型
        shape.graphics.beginFill("red").drawPolyStar(0, 0, 14, 3, 0.5, 180);
        enemy.hp = 1;
        enemy.speedY = 3.0;
        enemy.speedX = 0;
        enemy.pts = 150;
        enemy.canShoot = false;
        enemy.type = "red";
    } else if (rand < 0.75) {
        // 緑色：ゆらゆら移動＆狙い射撃型
        shape.graphics.beginFill("green").drawCircle(0, 0, 14);
        enemy.hp = 1;
        enemy.speedY = 2.0;
        enemy.speedX = Math.sin(frame_cnt * 0.06) * 1.5;
        enemy.pts = 100;
        enemy.canShoot = true;
        enemy.type = "green";
    } else {
        // 黄色：耐久力高＆3WAY射撃中型敵
        shape.graphics.beginFill("yellow").drawRoundRect(-16, -12, 32, 24, 6);
        enemy.hp = 2;
        enemy.speedY = 1.4;
        enemy.speedX = 0;
        enemy.pts = 200;
        enemy.canShoot = true;
        enemy.type = "yellow";
    }

    enemy.addChild(shape);
    enemy.shootTimer = 0;
    enemy.x = Math.random() * (STAGE_W - 120) + 60;
    enemy.y = -30;

    stage.addChild(enemy);
    enemyList.push(enemy);
}

/**
 * ボス生成関数
 */
function spawnBoss() {
    boss = new createjs.Container();

    let body = new createjs.Shape();
    body.graphics.beginFill("magenta")
        .moveTo(0, 45)
        .lineTo(80, -35)
        .lineTo(40, -55)
        .lineTo(0, -35)
        .lineTo(-40, -55)
        .lineTo(-80, -35)
        .closePath();
    boss.addChild(body);

    let core = new createjs.Shape();
    core.graphics.beginFill("cyan").drawCircle(0, 0, 18);
    boss.addChild(core);

    boss.x = STAGE_W / 2;
    boss.y = -100;
    bossHp = bossMaxHp;
    bossVx = 1.8;

    stage.addChild(boss);

    bossHpBg.visible = true;
    bossHpFill.visible = true;
    bossHpFill.scaleX = 1;

    // Tweenアニメーションで登場
    createjs.Tween.get(boss)
        .to({ y: 110 }, 2000, createjs.Ease.cubicOut);
}

/**
 * 敵弾生成関数
 */
function shootEnemyBullet(x, y, vx, vy) {
    let eb = new createjs.Shape();
    eb.graphics.beginFill("orange").drawCircle(0, 0, 4.5);
    eb.x = x;
    eb.y = y;
    eb.vx = vx;
    eb.vy = vy;
    stage.addChild(eb);
    enemyBulletList.push(eb);
}

/**
 * 自機弾生成関数
 */
function createPlayerBullet(x, y, vx, vy) {
    playSE("../../Audio/ショット.mp3", 0.08);
    let bullet = new createjs.Shape();
    bullet.graphics.beginFill("white").drawCircle(0, 0, 3.5);
    bullet.x = x;
    bullet.y = y;
    bullet.vx = vx;
    bullet.vy = vy;
    stage.addChild(bullet);
    bulletList.push(bullet);
}

/**
 * パワーアップアイテム生成関数
 */
function spawnItem(x, y) {
    let item = new createjs.Shape();
    item.graphics.beginFill("cyan").drawCircle(0, 0, 9);
    item.x = x;
    item.y = y;
    stage.addChild(item);
    itemList.push(item);
}

/**
 * 爆発エフェクト生成関数
 */
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

/**
 * ボス撃破演出とクリア遷移関数
 */
function onBossDefeated() {
    playSE("../../Audio/爆発1.mp3", 0.25);
    score += 5000;
    for (let k = 0; k < 6; k++) {
        setTimeout(function() {
            if (boss) {
                let rx = boss.x + (Math.random() * 80 - 40);
                let ry = boss.y + (Math.random() * 60 - 30);
                createExplosion(rx, ry, "magenta");
            }
        }, k * 150);
    }

    setTimeout(function() {
        if (boss) {
            stage.removeChild(boss);
            boss = null;
        }
        bossHpBg.visible = false;
        bossHpFill.visible = false;
        showGameOver(true);
    }, 1200);
}
