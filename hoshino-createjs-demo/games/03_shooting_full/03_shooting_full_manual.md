# 実践編：2Dシューティングゲーム 発展版（03_shooting_full）全ソースコード完全解説

本資料では、CreateJSを使用した「2Dシューティングゲーム (発展版・ボス戦・パワーアップ・フェーズ進行あり)」の全構成ファイル（全6ファイル）のすべてのソースコードと、テキスト（`2026_jsgame_schoolnote.pdf`）と同様の行別・ブロック別詳細解説を掲載します。

---

## 1. ゲーム概要と実行画面

- **ゲーム進行**:
  1. **雑魚敵ラッシュ (Phase 0)**: Pアイテム獲得でショットが3WAYに強化。
  2. **ボス登場予告 (Phase 1)**: WARNING! テキストの明滅演出。
  3. **ボス戦 (Phase 2)**: ボスHPバー表示、3WAY弾幕・8方向リング弾幕・回転螺旋弾幕、撃破でSTAGE CLEAR。

![ゲーム実行画面](screenshot.png)

---

## 2. ファイル構成一覧

| ファイル名 | 役割・概要 |
| :--- | :--- |
| [index.html](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting_full/index.html) | HTML5 Canvasの配置とCreateJSライブラリ・JavaScriptの読み込み |
| [global.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting_full/global.js) | フェーズ管理変数（`stagePhase`, `phaseTimer`）、ボス変数（`bossHp`, `bossMaxHp`）、パワーレベル（`playerPower`）の定義 |
| [init.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting_full/init.js) | 初期化、星空背景生成、UI（スコア・残機・ボスHPバー）の準備 |
| [tick.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting_full/tick.js) | フェーズ制御、パワーアップショット（1/2/3WAY）、敵弾発射、ボス生成・行動パターン AI、ボスHPバー更新 |
| [key.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting_full/key.js) | 8方向移動およびショット入力管理 |
| [gameover.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting_full/gameover.js) | ゲームオーバー / 🏆 STAGE CLEAR! 画面のオーバーレイ表示 |

---

## 3. ソースコード全文とファイル別詳細解説

### 3.1 `index.html` （メインHTML）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <title>2Dシューティングゲーム (発展版・ボス戦あり)</title>
    <style>
        body {
            margin: 0;
            padding: 20px 0;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            box-sizing: border-box;
            font-family: sans-serif;
        }
        canvas {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            background-color: #000;
        }
        a {
            margin-top: 16px;
            color: #0284c7;
            text-decoration: none;
            font-weight: bold;
        }
        a:hover {
            color: #38bdf8;
        }
    </style>
    <!-- CreateJSライブラリの読み込み -->
    <script src="https://code.createjs.com/1.0.0/createjs.min.js"></script>
    <!-- 分割された各プログラムの読み込み -->
    <script src="global.js"></script>
    <script src="init.js"></script>
    <script src="tick.js"></script>
    <script src="key.js"></script>
    <script src="gameover.js"></script>
</head>
<body>
    <canvas id="myCanvas" width="960" height="540"></canvas>
    <br>
    <a href="../../index.html">← サンプル一覧に戻る</a>
</body>
</html>
```

#### 行別詳細解説
- **35行目**: CreateJS 1.0.0 を読み込み。
- **37-41行目**: `global.js` → `init.js` → `tick.js` → `key.js` → `gameover.js` の順でJavaScriptファイルを読み込みます。

---

### 3.2 `global.js` （グローバル変数・定数）

```javascript
// ==========================================
// 2Dシューティングゲーム (発展版) - グローバル変数管理
// ==========================================

const STAGE_W = 960;
const STAGE_H = 540;

let stage;
let scene_id = 0; // 0:タイトル画面, 1:ゲームプレイ中, 2:ゲームオーバー, 3:ステージクリア
let frame_cnt = 0;
let score = 0;
let lives = 3;

let player;
let playerSpeed = 6;
let bulletList = [];
let enemyList = [];
let enemyBulletList = [];
let itemList = [];

let boss = null;
let bossHp = 0;
let bossMaxHp = 30;
let bossVx = 1.8;

let stagePhase = 0; // 0:雑魚ラッシュ, 1:ボス予告WARNING, 2:ボス戦
let phaseTimer = 0;

let scoreBoard;
let livesBoard;
let titleText;
let howToText;
let pressSpaceText;
let warningText;
let bossHpBg;
let bossHpFill;

let isPressLeft = false;
let isPressRight = false;
let isPressUp = false;
let isPressDown = false;
let isPressShoot = false;

let shootCooldown = 0;
let playerPower = 1; // 1:単発, 2:2連射, 3:3WAY
```

#### 行別詳細解説
- **21行目**: `enemyBulletList` で敵が発射した弾丸オブジェクトを保持します。
- **25-28行目**: `boss` (ボス表示Container), `bossHp` / `bossMaxHp` (現在・最大HP), `bossVx` (左右移動スピード)。
- **30-31行目**: `stagePhase` (0:雑魚, 1:WARNING予告, 2:ボス戦) でゲーム展開をフェーズ管理します。
- **52行目**: `playerPower` (1:単発, 2:2連射, 3:3WAY) で自機ショットレベルを管理。

---

### 3.3 `init.js` （初期化・星空背景・ボスHPバー作成）

```javascript
window.addEventListener("load", init);

function init() {
    stage = new createjs.Stage("myCanvas");
    scene_id = 0;
    frame_cnt = 0;
    score = 0;
    lives = 3;

    bulletList = [];
    enemyList = [];
    enemyBulletList = [];
    itemList = [];
    boss = null;

    let bg = new createjs.Shape();
    bg.graphics.beginFill("black").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    stars = [];
    for (let i = 0; i < 45; i++) {
        let star = new createjs.Shape();
        let size = Math.random() * 2 + 1;
        star.graphics.beginFill("white").drawCircle(0, 0, size);
        star.x = Math.random() * STAGE_W;
        star.y = Math.random() * STAGE_H;
        star.speed = size * 1.5;
        stage.addChild(star);
        stars.push(star);
    }

    player = new createjs.Shape();
    player.graphics.beginFill("cyan")
        .moveTo(0, -16)
        .lineTo(12, 12)
        .lineTo(0, 6)
        .lineTo(-12, 12)
        .closePath();
    player.x = STAGE_W / 2;
    player.y = STAGE_H - 60;

    scoreBoard = new createjs.Text("", "24px sans-serif", "white");
    scoreBoard.x = 15;
    scoreBoard.y = 15;
    stage.addChild(scoreBoard);

    livesBoard = new createjs.Text("", "24px sans-serif", "pink");
    livesBoard.x = STAGE_W - 180;
    livesBoard.y = 15;
    stage.addChild(livesBoard);

    bossHpBg = new createjs.Shape();
    bossHpBg.graphics.beginFill("gray").drawRect(0, 0, 400, 10);
    bossHpBg.x = STAGE_W / 2 - 200;
    bossHpBg.y = 20;
    bossHpBg.visible = false;
    stage.addChild(bossHpBg);

    bossHpFill = new createjs.Shape();
    bossHpFill.graphics.beginFill("red").drawRect(0, 0, 400, 10);
    bossHpFill.x = STAGE_W / 2 - 200;
    bossHpFill.y = 20;
    bossHpFill.visible = false;
    stage.addChild(bossHpFill);

    initTitle();

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", handleTick);
}
```

---

### 3.4 `tick.js` （パワーアップ・フェーズ進行・弾幕AI・ボス撃破）

```javascript
let spiralAngle = 0;
let bgmAudio = null;

function handleTick() {
    if (scene_id === 1) {
        playBGM("../../Audio/maou_bgm_neorock82.mp3", 0.18);
    } else {
        stopBGM();
    }

    for (let star of stars) {
        star.y += star.speed;
        if (star.y > STAGE_H) {
            star.y = 0;
            star.x = Math.random() * STAGE_W;
        }
    }

    if (scene_id === 1) {
        frame_cnt++;
        phaseTimer++;

        if (isPressRight) player.x += playerSpeed;
        if (isPressLeft) player.x -= playerSpeed;
        if (isPressDown) player.y += playerSpeed;
        if (isPressUp) player.y -= playerSpeed;

        if (shootCooldown > 0) shootCooldown--;
        if (isPressShoot && shootCooldown <= 0) {
            shootCooldown = (playerPower >= 3) ? 6 : 8;

            if (playerPower === 1) {
                createPlayerBullet(player.x, player.y - 16, 0, -12);
            } else if (playerPower === 2) {
                createPlayerBullet(player.x - 8, player.y - 12, 0, -12);
                createPlayerBullet(player.x + 8, player.y - 12, 0, -12);
            } else {
                createPlayerBullet(player.x, player.y - 16, 0, -12);
                createPlayerBullet(player.x - 8, player.y - 10, -3.5, -11);
                createPlayerBullet(player.x + 8, player.y - 10, 3.5, -11);
            }
        }

        // フェーズ進行管理
        if (stagePhase === 0) {
            if (frame_cnt % 35 === 0) spawnEnemy();
            if (phaseTimer > 750) {
                stagePhase = 1;
                phaseTimer = 0;
                warningText = new createjs.Text("⚠️ WARNING! BOSS APPROACHING! ⚠️", "bold 32px sans-serif", "red");
                warningText.x = STAGE_W / 2 - warningText.getMeasuredWidth() / 2;
                warningText.y = STAGE_H / 2 - 20;
                stage.addChild(warningText);

                createjs.Tween.get(warningText, { loop: true })
                    .to({ alpha: 0.2 }, 250)
                    .to({ alpha: 1.0 }, 250);
            }
        } else if (stagePhase === 1) {
            if (phaseTimer > 140) {
                if (warningText) stage.removeChild(warningText);
                stagePhase = 2;
                phaseTimer = 0;
                spawnBoss();
            }
        } else if (stagePhase === 2) {
            if (boss) {
                boss.x += bossVx;
                if (boss.x < 160 || boss.x > STAGE_W - 160) bossVx *= -1;

                if (frame_cnt % 90 === 0) {
                    for (let a = -1; a <= 1; a++) {
                        shootEnemyBullet(boss.x, boss.y + 20, a * 1.4, 2.5);
                    }
                }
                if (frame_cnt % 180 === 0) {
                    let count = 8;
                    for (let i = 0; i < count; i++) {
                        let rad = (Math.PI * 2 / count) * i;
                        shootEnemyBullet(boss.x, boss.y + 10, Math.cos(rad) * 2.2, Math.sin(rad) * 2.2);
                    }
                }
                if (frame_cnt % 24 === 0) {
                    spiralAngle += 20;
                    let rad = (spiralAngle * Math.PI) / 180;
                    shootEnemyBullet(boss.x, boss.y + 10, Math.cos(rad) * 2.5, Math.sin(rad) * 2.5);
                }
            }
        }

        // 敵の弾の移動と自機とのヒット判定
        for (let i = enemyBulletList.length - 1; i >= 0; i--) {
            let eb = enemyBulletList[i];
            eb.x += eb.vx;
            eb.y += eb.vy;

            let dist = Math.hypot(eb.x - player.x, eb.y - player.y);
            if (dist < 13) {
                createExplosion(eb.x, eb.y, "red");
                stage.removeChild(eb);
                enemyBulletList.splice(i, 1);

                lives--;
                if (lives <= 0) {
                    showGameOver(false);
                    return;
                }
            }
        }

        // ボス被弾判定とHPバー更新
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
                        onBossDefeated();
                        return;
                    }
                    continue;
                }
            }
        }

        scoreBoard.text = "スコア: " + score;
        livesBoard.text = "ライフ: " + "❤️".repeat(Math.max(0, lives));

        stage.update();
    }
}

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
```

#### 行別詳細解説
- **90-102行目**: `playerPower` (1, 2, 3) で単発、2平行連射、3WAY拡散ショットを発射。
- **113-125行目**: `phaseTimer > 750` でボス予告フェーズへ移行し、`WARNING` 赤文字を点滅アニメーション。
- **140-164行目**: ボスの行動AI。3WAY弾、三角関数 `Math.cos` / `Math.sin` による8方向全方位リング弾幕、旋回螺旋弾幕を発射。
- **235行目**: `bossHpFill.scaleX = Math.max(0, bossHp / bossMaxHp)` でボスのHP倍率でゲージ長さを可変描画。
- **469-491行目 (`onBossDefeated`)**: ボス撃破時に `setTimeout` で連鎖爆発エフェクトを発生させ、1.2秒後にステージクリア画面 (`showGameOver(true)`) へ遷移。

---

### 3.5 `key.js` （キー入力管理）

```javascript
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

function handleKeyDown(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 90: case 32:
            isPressShoot = true;
            if (scene_id === 0) startGame();
            if (scene_id >= 2) initTitle();
            break;
        case 37: case 65: isPressLeft = true; break;
        case 39: case 68: isPressRight = true; break;
        case 38: case 87: isPressUp = true; break;
        case 40: case 83: isPressDown = true; break;
    }
}

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
```

---

### 3.6 `gameover.js` （ゲームオーバー・クリア表示）

```javascript
function showGameOver(isClear = false) {
    scene_id = isClear ? 3 : 2;

    let resultContainer = new createjs.Container();

    let overlay = new createjs.Shape();
    overlay.graphics.beginFill("rgba(0, 0, 0, 0.75)").drawRect(0, 0, STAGE_W, STAGE_H);
    resultContainer.addChild(overlay);

    let msgStr = isClear ? "🎉 STAGE CLEAR! 🎉" : "GAME OVER";
    let msgColor = isClear ? "yellow" : "red";
    let msgText = new createjs.Text(msgStr, "bold 44px sans-serif", msgColor);
    msgText.x = STAGE_W / 2 - msgText.getMeasuredWidth() / 2;
    msgText.y = 160;
    resultContainer.addChild(msgText);

    let finalScoreText = new createjs.Text("最終スコア: " + score, "28px sans-serif", "white");
    finalScoreText.x = STAGE_W / 2 - finalScoreText.getMeasuredWidth() / 2;
    finalScoreText.y = 240;
    resultContainer.addChild(finalScoreText);

    stage.addChild(resultContainer);

    stage.addEventListener("stagemousedown", function backToTitle() {
        stage.removeEventListener("stagemousedown", backToTitle);
        initTitle();
    });

    stage.update();
}
```
