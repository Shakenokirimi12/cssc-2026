# 実践編：2Dシューティングゲーム シンプル版（03_shooting）全ソースコード完全解説

本資料では、CreateJSを使用した「縦スクロール 2Dシューティングゲーム (シンプル版)」の全構成ファイル（全6ファイル）のすべてのソースコードと、テキスト（`2026_jsgame_schoolnote.pdf`）と同様の行別・ブロック別詳細解説を掲載します。

---

## 1. ゲーム概要と実行画面

- **ゲーム内容**: 宇宙空間を舞台に、自機（シアン色の戦闘機）を操作し、上空から飛来する雑魚敵をショットで撃破する王道縦スクロールシューティングです。
- **操作方法**: ← ↑ ↓ → キー（8方向移動）、Zキー / スペース（ショット）。
- **ルール**: 緑敵 (HP 1, +100点)、赤敵 (HP 2, +200点)。敵接触で残機減少。

![ゲーム実行画面](screenshot.png)

---

## 2. ファイル構成一覧

| ファイル名 | 役割・概要 |
| :--- | :--- |
| [index.html](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting/index.html) | HTML5 Canvasの配置とCreateJSライブラリ・JavaScriptの読み込み |
| [global.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting/global.js) | 自機速度、弾・敵リスト配列、UI要素、入力フラグの宣言 |
| [init.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting/init.js) | 初期化、星空背景の構築、自機（ベクター描画）とUI表示の生成 |
| [tick.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting/tick.js) | BGM再生制御、星スクロール、自機移動、弾発射、敵出現、円交差衝突判定（Math.hypot） |
| [key.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting/key.js) | 8方向キーおよびショットキー入力の検知と連射管理 |
| [gameover.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/03_shooting/gameover.js) | ゲームオーバー画面表示とオブジェクトの解放 |

---

## 3. ソースコード全文とファイル別詳細解説

### 3.1 `index.html` （メインHTML）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <title>2Dシューティングゲーム (シンプル版)</title>
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
- **35行目**: CreateJS 1.0.0 のライブラリを読み込み。
- **37-41行目**: `global.js` → `init.js` → `tick.js` → `key.js` → `gameover.js` の順でJavaScriptファイルを読み込みます。
- **44行目**: ゲーム描画を行う ID `myCanvas` (960 × 540) の Canvas 要素を配置しています。

---

### 3.2 `global.js` （グローバル変数・定数）

```javascript
// 画面サイズ (960x540)
const STAGE_W = 960;
const STAGE_H = 540;

let stage;
let scene_id = 0; // 0:タイトル, 1:プレイ, 2:ゲームオーバー
let frame_cnt = 0;
let score = 0;
let lives = 3;

// パラメータ
let player;
let playerSpeed = 6;
let bulletList = [];
let enemyList = [];
let stars = [];

// UI要素
let scoreBoard;
let livesBoard;
let titleText;
let howToText;
let pressSpaceText;

// キー入力フラグ
let isPressLeft = false;
let isPressRight = false;
let isPressUp = false;
let isPressDown = false;
let isPressShoot = false;
let shootCooldown = 0;
```

#### 行別詳細解説
- **2-3行目**: 画面サイズ `STAGE_W = 960`, `STAGE_H = 540` 定数。
- **6行目**: `scene_id` で画面状態（0:タイトル, 1:プレイ, 2:ゲームオーバー）を制御。
- **12-16行目**: `player` (自機), `playerSpeed = 6` (移動スピード), `bulletList` (自機弾配列), `enemyList` (敵配列), `stars` (背景の星配列)。
- **26-31行目**: 8方向移動およびショット用の入力フラグ群 (`isPressLeft`, `isPressRight`, `isPressUp`, `isPressDown`, `isPressShoot`) とショットインターバルを管理する `shootCooldown` 変数。

---

### 3.3 `init.js` （初期化・自機描画・UI生成）

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

    let bg = new createjs.Shape();
    bg.graphics.beginFill("black").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    // 自機（上向きの戦闘機 - 完成版と同じ描画）
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
    livesBoard.x = STAGE_W - 160;
    livesBoard.y = 15;
    stage.addChild(livesBoard);

    initTitle();

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", handleTick);
}

function initTitle() {
    titleText = new createjs.Text("縦スクロール 2Dシューティング", "bold 40px sans-serif", "cyan");
    titleText.x = STAGE_W / 2 - titleText.getMeasuredWidth() / 2;
    titleText.y = 120;
    stage.addChild(titleText);

    howToText = new createjs.Text("操作方法: 自機を動かす(←↑↓→キー)、弾を撃つ(Zキー)", "20px sans-serif", "white");
    howToText.x = STAGE_W / 2 - howToText.getMeasuredWidth() / 2;
    howToText.y = 220;
    stage.addChild(howToText);

    pressSpaceText = new createjs.Text("Press Z key to start", "bold 24px sans-serif", "yellow");
    pressSpaceText.x = STAGE_W / 2 - pressSpaceText.getMeasuredWidth() / 2;
    pressSpaceText.y = 340;
    stage.addChild(pressSpaceText);
}
```

#### 行別詳細解説
- **13-15行目**: 黒色の長方形 `drawRect(0, 0, STAGE_W, STAGE_H)` で宇宙空間の背景を描画します。
- **18-24行目**: `moveTo(0, -16)` で先端から開始し、`lineTo(12, 12)` (右翼) → `lineTo(0, 6)` (後部くぼみ) → `lineTo(-12, 12)` (左翼) でかっこいいシアン色の戦闘機ベクター描画を作成しています。
- **25-26行目**: 自機の初期位置を画面下中央 `(STAGE_W/2, STAGE_H-60)` に設定します。
- **28-36行目**: 左上のスコア表示 (`scoreBoard`) および右上の残機表示 (`livesBoard`) を設置します。
- **44-59行目 (`initTitle`)**: タイトル画面のテキストオブジェクト（タイトルロゴ・操作説明・スタート促し）を表示し、画面中央揃えにします。

---

### 3.4 `tick.js` （ゲームループ・星スクロール・弾幕・衝突判定）

```javascript
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
```

#### 行別詳細解説
- **35-38行目**: 背景の星配列 `stars` の要素を下方向に移動させ、`STAGE_H` を越えたら `star.y = 0` で画面上部に戻し、無限スクロールを作ります。
- **47-55行目**: `isPressLeft`, `isPressRight`, `isPressUp`, `isPressDown` のフラグにより、自機を上下左右に斜め移動可能な8方向操作にします。画面端制限 (15px/20px) を適用。
- **58-62行目**: `shootCooldown` タイマーで12フレーム（0.2秒）間隔の弾発射制限。
- **96行目**: `Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y)` により自機弾と敵の中心距離を算出し、22px未満で判定成功。
- **142-152行目 (`spawnEnemy`)**: 30%の確率で赤色強敵 (HP 2, スピード 4, 得点 200点)、70%の確率で緑色一般敵 (HP 1, スピード 2.5, 得点 100点) を出現させます。
- **173-185行目 (`createExplosion`)**: 橙色・赤色の円を生成し、`createjs.Tween` で2.2倍に拡大しながら透明化 (`alpha: 0`) させて消去する爆発演出。

---

### 3.5 `key.js` （キーボード入力管理）

```javascript
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

function handleKeyDown(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 90: case 32: // Zキー (90) または スペースキー (32)
            isPressShoot = true;
            if (scene_id === 0) {
                scene_id = 1;
                stage.removeChild(titleText);
                stage.removeChild(howToText);
                stage.removeChild(pressSpaceText);
                stage.addChild(player);
            }
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

#### 行別詳細解説
- **4-22行目 (`handleKeyDown`)**: `keyCode` 90 (Zキー) / 32 (Space) で `isPressShoot = true` にし、タイトル画面中であれば `scene_id = 1` に変更してゲームを開始します。`keyCode` 37/65 (左), 39/68 (右), 38/87 (上), 40/83 (下) で移動フラグを管理します。
- **24-33行目 (`handleKeyUp`)**: キー離下時にフラグを `false` に戻します。

---

### 3.6 `gameover.js` （ゲームオーバー処理）

```javascript
function showGameOver() {
    scene_id = 2;

    for (let e of enemyList) stage.removeChild(e);
    for (let b of bulletList) stage.removeChild(b);

    enemyList = [];
    bulletList = [];

    let go = new createjs.Text("Game Over!", "bold 44px sans-serif", "red");
    go.x = STAGE_W / 2 - go.getMeasuredWidth() / 2;
    go.y = STAGE_H / 2 - 40;
    stage.addChild(go);

    let sc = new createjs.Text("あなたのスコアは " + score + " でした。", "20px sans-serif", "white");
    sc.x = STAGE_W / 2 - sc.getMeasuredWidth() / 2;
    sc.y = STAGE_H / 2 + 20;
    stage.addChild(sc);

    stage.update();

    createjs.Ticker.removeAllEventListeners();
    stage.removeAllEventListeners();
}
```

#### 行別詳細解説
- **4-8行目**: 画面上に残った全敵機と全弾丸を `removeChild` し、配列をリセットして解放。
- **10-18行目**: 「Game Over!」(赤文字) と最終スコアを画面中央に描画します。
- **22-23行目**: `Ticker` および `stage` のすべてのイベントリスナーを解除してループを停止します。
