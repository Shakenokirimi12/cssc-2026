# 実践編：2Dアクションゲーム（02_action）全ソースコード完全解説

本資料では、CreateJSを使用した「2Dジャンプ＆ラン アクションゲーム」の全構成ファイル（全6ファイル）のすべてのソースコードと、テキスト（`2026_jsgame_schoolnote.pdf`）と同様の行別・ブロック別詳細解説を掲載します。

---

## 1. ゲーム概要と実行画面

- **ゲーム内容**: 自機（青い四角形）を操作し、障害物（赤のトゲ）や落とし穴を避けながらコインを獲得し、右上のゴール旗を目指す2D物理アクションゲームです。
- **操作方法**: ← / → キー（左右移動）、↑ / W / スペース（ジャンプ）。
- **物理ルール**: 重力加速度 (`GRAVITY = 0.6`)、ジャンプ初速 (`JUMP_POWER = -12`)、接地判定。

![ゲーム実行画面](screenshot.png)

---

## 2. ファイル構成一覧

| ファイル名 | 役割・概要 |
| :--- | :--- |
| [index.html](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/02_action/index.html) | HTML5 Canvasの配置とCreateJSライブラリ・JavaScriptの読み込み |
| [global.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/02_action/global.js) | 重力・ジャンプ力などの物理定数と各種ゲームオブジェクト変数の宣言 |
| [init.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/02_action/init.js) | 初期化、タイトル画面、マップ（足場・トゲ・コイン・ゴール）のレイアウト生成 |
| [tick.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/02_action/tick.js) | 重力移動演算、足場着地判定、コイン・トゲ・ゴールの各種衝突判定 |
| [key.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/02_action/key.js) | 左右移動およびジャンプ入力の状態フラグ管理 |
| [gameover.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/02_action/gameover.js) | ゲームオーバー / STAGE CLEAR 画面の描画およびファンファーレSE再生 |

---

## 3. ソースコード全文とファイル別詳細解説

### 3.1 `index.html` （メインHTML）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <title>ジャンプ＆ラン！アクションゲーム</title>
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
    <!-- ゲーム画面を描画するキャンバス（960x540ピクセル） -->
    <canvas id="myCanvas" width="960" height="540"></canvas>
    <br>
    <!-- ポータル画面への戻りリンク -->
    <a href="../../index.html">← サンプル一覧に戻る</a>
</body>
</html>
```

#### 行別詳細解説
- **35行目**: CreateJS 1.0.0 を読み込んでいます。
- **37-41行目**: `global.js` → `init.js` → `tick.js` → `key.js` → `gameover.js` の順でJavaScriptファイルを読み込みます。
- **45行目**: ID `myCanvas` (960 × 540) の Canvas を設置します。

---

### 3.2 `global.js` （物理パラメーターと変数定義）

```javascript
// ------------------------------------------
// グローバル変数と定数の定義 (global.js)
// ------------------------------------------

// 画面サイズの定数宣言（横幅960px、高さ540px）
const STAGE_W = 960;
const STAGE_H = 540;

// 物理運動のパラメータ
const PLAYER_SPEED = 6;  // 左右移動速度
const JUMP_POWER = -12;  // 初速（負の値で上方向へ跳ぶ）
const GRAVITY = 0.6;     // 重力加速度（下方向の加減速）

const PLAYER_SIZE = 30; // プレイヤーの1辺のサイズ（四角形）

// ステージと画面状態の変数
let stage;         // CreateJSのStageオブジェクト
let scene_id = 0;  // 画面状態（0:タイトル, 1:プレイ, 2:ゲームオーバー, 3:ステージクリア）
let score = 0;     // 現在のスコア

// プレイヤーオブジェクトと速度ベクトル
let player;
let playerVX = 0; // 横方向速度
let playerVY = 0; // 縦方向速度
let isGrounded = false; // 足場に着地しているかどうかのフラグ

// ステージ上の各種表示オブジェクト群
let platforms = []; // 足場ブロックの配列
let coins = [];     // コインの配列
let hazards = [];   // 障害物（トゲ）の配列
let goal;           // ゴール旗オブジェクト

// キー入力の状態フラグ
let isPressLeft = false;  // 左移動キー
let isPressRight = false; // 右移動キー
let isPressJump = false;  // ジャンプキー

// UI表示テキスト
let scoreText; // スコア表示用のTextオブジェクト
```

#### 行別詳細解説
- **10-12行目**: `PLAYER_SPEED = 6` (左右速度), `JUMP_POWER = -12` (上向きジャンプ初速), `GRAVITY = 0.6` (毎フレーム加算される下向き重力)。
- **18行目**: `scene_id` (0:タイトル, 1:プレイ中, 2:ゲームオーバー, 3:ステージクリア)。
- **23-25行目**: `playerVX` / `playerVY` で速度ベクトル、`isGrounded` で接地判定フラグを管理。
- **28-31行目**: 配列 `platforms` (足場), `coins` (コイン), `hazards` (トゲ), `goal` (ゴール旗) を管理。

---

### 3.3 `init.js` （初期化・マップレイアウト構築）

```javascript
// ------------------------------------------
// 初期化処理と画面生成 (init.js)
// ------------------------------------------

// ページ読み込み完了時にinit関数を実行
window.addEventListener("load", init);

// ゲーム全体の初期化関数
function init() {
    // <canvas id="myCanvas"> をCreateJSのStageと接続
    stage = new createjs.Stage("myCanvas");

    // キーボードの入力イベントハンドラを登録
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // タイトル画面の表示
    initTitle();

    // 毎フレーム更新関数（handleTick）をTickerに登録
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", handleTick);
}

// タイトル画面の表示関数
function initTitle() {
    scene_id = 0; // タイトル画面に設定
    stage.removeAllChildren();

    // 水色の背景描画
    let bg = new createjs.Shape();
    bg.graphics.beginFill("#e6f7ff").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    // タイトルロゴテキスト
    let titleText = new createjs.Text("アクションゲーム", "40px bold sans-serif", "blue");
    titleText.x = STAGE_W / 2 - titleText.getMeasuredWidth() / 2;
    titleText.y = 150;
    stage.addChild(titleText);

    // ルール・操作説明テキスト
    let descText = new createjs.Text("← → キー で左右移動！ ↑ または スペース でジャンプ！\n赤いトゲを避けて、黄色のコインを取りながら緑のゴールを目指そう！", "20px sans-serif", "#333333");
    descText.textAlign = "center";
    descText.x = STAGE_W / 2;
    descText.y = 240;
    stage.addChild(descText);

    // スタート案内テキスト
    let startText = new createjs.Text("スペースキー または クリック でスタート！", "24px bold sans-serif", "red");
    startText.x = STAGE_W / 2 - startText.getMeasuredWidth() / 2;
    startText.y = 360;
    stage.addChild(startText);

    // クリックでゲーム開始
    stage.addEventListener("stagemousedown", startGame);
    stage.update();
}

// プレイ画面への遷移とゲーム開始関数
function startGame() {
    if (scene_id !== 0) return;

    scene_id = 1; // プレイ画面に設定
    stage.removeAllChildren();
    stage.removeEventListener("stagemousedown", startGame);

    // 変数と配列のリセット
    score = 0;
    platforms = [];
    coins = [];
    hazards = [];

    // 背景描画
    let bg = new createjs.Shape();
    bg.graphics.beginFill("#e6f7ff").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    // ステージレイアウト（足場・トゲ・コイン・ゴール）の生成
    createStageLayout();

    // プレイヤーの生成
    createPlayer();

    // スコア表示テキストの生成
    scoreText = new createjs.Text("スコア: 0", "26px bold sans-serif", "black");
    scoreText.x = 20;
    scoreText.y = 20;
    stage.addChild(scoreText);
}

// プレイヤー（青い四角形）を生成する関数
function createPlayer() {
    player = new createjs.Shape();
    player.graphics.beginFill("blue").drawRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);

    // 初期出現位置と速度の初期化
    player.x = 60;
    player.y = 400;
    playerVX = 0;
    playerVY = 0;
    isGrounded = false;

    stage.addChild(player);
}

// ステージのマップ要素を配置・生成する関数
function createStageLayout() {
    // 1. 足場（緑色の長方形）のデータ定義
    let platformData = [
        { x: 0, y: 460, w: 960, h: 80 },    // 地面
        { x: 160, y: 370, w: 140, h: 20 },  // 足場1
        { x: 370, y: 290, w: 160, h: 20 },  // 足場2
        { x: 600, y: 210, w: 150, h: 20 },  // 足場3
        { x: 800, y: 150, w: 130, h: 20 }   // ゴール台
    ];

    for (let data of platformData) {
        let p = new createjs.Shape();
        p.graphics.beginFill("green").drawRect(0, 0, data.w, data.h);
        p.x = data.x;
        p.y = data.y;
        p.w = data.w;
        p.h = data.h;
        stage.addChild(p);
        platforms.push(p);
    }

    // 2. 障害物（赤色の三角形トゲ）のデータ定義
    let hazardData = [
        { x: 310, y: 440 },
        { x: 570, y: 440 }
    ];

    for (let data of hazardData) {
        let h = new createjs.Shape();
        h.graphics.beginFill("red")
            .moveTo(0, 20)
            .lineTo(15, -10)
            .lineTo(30, 20)
            .closePath();
        h.x = data.x;
        h.y = data.y;
        stage.addChild(h);
        hazards.push(h);
    }

    // 3. コイン（黄色の丸）のデータ定義
    let coinData = [
        { x: 220, y: 330 },
        { x: 440, y: 250 },
        { x: 670, y: 170 },
        { x: 480, y: 410 }
    ];

    for (let data of coinData) {
        let c = new createjs.Shape();
        c.graphics.beginFill("gold").drawCircle(0, 0, 12);
        c.x = data.x;
        c.y = data.y;
        stage.addChild(c);
        coins.push(c);
    }

    // 4. ゴール（ポールと緑の旗）の生成
    goal = new createjs.Container();
    let pole = new createjs.Shape();
    pole.graphics.beginFill("black").drawRect(0, 0, 4, 40);
    let flag = new createjs.Shape();
    flag.graphics.beginFill("green").moveTo(4, 0).lineTo(30, 10).lineTo(4, 20).closePath();
    goal.addChild(pole);
    goal.addChild(flag);
    goal.x = 860;
    goal.y = 110;
    stage.addChild(goal);
}
```

#### 行別詳細解説
- **92-104行目 (`createPlayer`)**: 青い 30x30px の四角形を自機として生成し、初期位置 `(60, 400)` に配置。
- **107-175行目 (`createStageLayout`)**:
  - `platformData`: 地面および空中足場の座標・サイズの配列データ。
  - `hazardData`: 赤い三角形トゲ障害物の配置座標データ。`moveTo` / `lineTo` で三角形を描画します。
  - `coinData`: 黄色の丸型コインの配置座標データ。
  - `goal`: 黒いポール (4x40px) と緑の旗 (三角形) を描画したゴールオブジェクト。

---

### 3.4 `tick.js` （毎フレーム物理更新・着地判定・当たり判定）

```javascript
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
```

#### 行別詳細解説
- **14-17行目**: 接地中 (`isGrounded === true`) のみ `JUMP_POWER` (-12) をセットしてジャンプ。空中ジャンプを抑止します。
- **20行目**: `playerVY += GRAVITY` (0.6) で下向きに加速させ放物線を描かせます。
- **54-76行目 (`checkPlatformCollision`)**: 前フレームの足元 `prevFeetY` と現在の足元 `feetY` を比較し、上面 `pTop` を上から下へと跨いだ瞬間だけ `player.y = pTop - PLAYER_SIZE/2` に位置補正して着地させます。
- **79-90行目 (`checkHazardCollision`)**: トゲとの矩形距離差 `dx < 20` かつ `dy < 20` で即死処理 (`showGameOver(false)`).
- **93-107行目 (`checkCoinCollision`)**: `Math.hypot` で中心間距離を測定し、コイン獲得 (+150点)。
- **110-116行目 (`checkGoalCollision`)**: ゴール判定距離 35px 未満でクリア (+500点, `showGameOver(true)`).

---

### 3.5 `key.js` （キー入力管理）

```javascript
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
```

#### 行別詳細解説
- **6-14行目**: `keyCode` 37/65 で左フラグ、39/68 で右フラグ、38/87/32 でジャンプフラグを ON にし、タイトル時・ゲームオーバー時のリスタート遷移を行います。
- **17-21行目**: `keyup` でフラグを OFF に戻します。

---

### 3.6 `gameover.js` （ゲームオーバー・クリア表示）

```javascript
// ------------------------------------------
// ゲームオーバー・リザルト処理 (gameover.js)
// ------------------------------------------

// 効果音再生関数
function playSE(path) {
    try {
        let audio = new Audio(path);
        audio.currentTime = 0;
        audio.play().catch(function(e){});
    } catch(e) {}
}

// ゲームオーバー/クリア画面を表示する関数
function showGameOver(isClear) {
    scene_id = isClear ? 3 : 2; // クリアかゲームオーバーかを設定

    // ユーザー指定: 「ファンファーレはアクションクリア」SE再生
    if (isClear) {
        playSE("../../Audio/ラッパのファンファーレ.mp3");
    }

    let msg = isClear ? "STAGE CLEAR!" : "GAME OVER";
    let color = isClear ? "green" : "red";

    // 結果タイトルのテキスト表示
    let resultText = new createjs.Text(msg, "44px bold sans-serif", color);
    resultText.x = STAGE_W / 2 - resultText.getMeasuredWidth() / 2;
    resultText.y = 180;
    stage.addChild(resultText);

    // 最終スコア結果の表示
    let finalScoreText = new createjs.Text("最終スコア: " + score + " 点", "28px sans-serif", "black");
    finalScoreText.x = STAGE_W / 2 - finalScoreText.getMeasuredWidth() / 2;
    finalScoreText.y = 260;
    stage.addChild(finalScoreText);

    // 再スタート案内の表示
    let restartText = new createjs.Text("スペースキー または クリック でタイトルに戻る", "20px sans-serif", "#555555");
    restartText.x = STAGE_W / 2 - restartText.getMeasuredWidth() / 2;
    restartText.y = 350;
    stage.addChild(restartText);

    // 0.5秒後にクリックでタイトルに戻るイベントを有効化
    setTimeout(function() {
        stage.addEventListener("stagemousedown", initTitle);
    }, 500);
}
```

#### 行別詳細解説
- **15-21行目**: `isClear === true` の場合、`scene_id = 3` (クリア) に設定し `ラッパのファンファーレ.mp3` を再生。
- **23-30行目**: クリア時は「STAGE CLEAR!」(緑文字)、失敗時は「GAME OVER」(赤文字) でリザルトテキストを表示。
