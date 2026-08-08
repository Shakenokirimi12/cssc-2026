# 実践編：フルーツキャッチゲーム（01_fruit_catch）全ソースコード完全解説

本資料では、CreateJSを使用した「フルーツキャッチゲーム」の全構成ファイル（全7ファイル）のすべてのソースコードと、テキスト（`2026_jsgame_schoolnote.pdf`）と同様の行別・ブロック別詳細解説を掲載します。

---

## 1. ゲーム概要と実行画面

- **ゲーム内容**: 上空から落ちてくるアイテム（赤りんご・金の星・紫の毒アイテム）を、画面下部のカゴを操作してキャッチするゲームです。
- **操作方法**:
  - キーボード: `←` / `→` キー または `A` / `D` キーでカゴを左右移動。
  - マウス操作: マウスカーソルのX座標にカゴがリアルタイム追従。
  - スタート/再挑戦: `スペース` キー または クリック。
- **ルール**:
  - 赤りんご (+100点)、金の星 (+300点)、紫の毒アイテム (-200点)。
  - りんごや星を見逃して画面下に落とすとライフ（初期値3）が1減少。ライフが0になるとゲームオーバー。

![ゲーム実行画面](screenshot.png)

---

## 2. ファイル構成一覧

| ファイル名 | 役割・概要 |
| :--- | :--- |
| [index.html](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/01_fruit_catch/index.html) | HTML5 Canvasの配置とCreateJSライブラリ・JavaScriptの読み込み |
| [global.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/01_fruit_catch/global.js) | 定数（画面サイズ・速度等）とグローバル変数の定義 |
| [init.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/01_fruit_catch/init.js) | 初期化、タイトル画面の作成、ゲーム開始処理、カゴの生成 |
| [tick.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/01_fruit_catch/tick.js) | フレーム更新（handleTick）、アイテム生成・移動・当たり判定・スコアポップアップ |
| [key.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/01_fruit_catch/key.js) | キーボード入力の検出（keydown / keyup） |
| [mouse.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/01_fruit_catch/mouse.js) | マウス移動の検出（stagemousemove）とカゴのX座標同期 |
| [gameover.js](file:///c:/Users/akish/Documents/GitHub/CSSC2026/games/01_fruit_catch/gameover.js) | ゲームオーバー画面の表示とリスタート準備 |

---

## 3. ソースコード全文とファイル別詳細解説

### 3.1 `index.html` （メインHTML）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <title>キャッチ！フルーツフォール</title>
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
    <script src="mouse.js"></script>
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
- **1-2行目**: DOCTYPE宣言と言語属性 `lang="ja"` を定義。
- **6-33行目**: CSSスタイル指定。Flexbox を利用して画面中央にCanvasを配置し、`box-shadow` でドロップシャドウを適用しています。
- **35行目**: CreateJS 1.0.0 統合ライブラリを読み込んでいます。
- **37-42行目**: 分割されたJavaScriptファイル（`global.js` → `init.js` → `tick.js` → `key.js` → `mouse.js` → `gameover.js`）を読み込んでいます。定数定義ファイル `global.js` を真っ先に読み込むことが重要です。
- **46行目**: HTML5 Canvas 要素 (`width="960" height="540"`) を配置し、CreateJS からの描画ターゲットとして指定します。

---

### 3.2 `global.js` （グローバル変数・定数）

```javascript
// ------------------------------------------
// グローバル変数と定数の定義 (global.js)
// ------------------------------------------

// 画面サイズの定数宣言（横幅960px、高さ540px）
const STAGE_W = 960;
const STAGE_H = 540;

// 自機（カゴ）のパラメータ
const BASKET_SPEED = 8;     // 移動速度
const BASKET_WIDTH = 100;   // カゴの横幅

// ゲームバランスのパラメータ
const FALL_SPEED_BASE = 3.5; // 落下速度の初期値
const MAX_LIVES = 3;         // 最大ライフ（ミス許容回数）

// ステージと画面状態の変数
let stage;         // CreateJSのStageオブジェクト
let scene_id = 0;  // 画面状態（0:タイトル画面, 1:プレイ画面, 2:ゲームオーバー画面）
let score = 0;     // 現在のスコア
let lives = MAX_LIVES; // 残りライフ
let frame_cnt = 0; // 経過フレーム数のカウンター

// ゲーム要素の参照用変数
let basket;       // 自機（カゴ）の表示オブジェクト
let itemList = []; // 画面上の落下アイテムを保持する配列

// キー入力の状態フラグ（押されている間 true）
let isPressLeft = false;  // 左矢印キーまたはAキー
let isPressRight = false; // 右矢印キーまたはDキー

// UI表示テキスト
let scoreText; // スコア表示用のTextオブジェクト
let livesText; // ライフ表示用のTextオブジェクト
```

#### 行別詳細解説
- **6-7行目**: `STAGE_W = 960` と `STAGE_H = 540` でCanvasの描画サイズを定数宣言。
- **10-11行目**: カゴの移動速度 `BASKET_SPEED = 8` (8px/frame) および横幅 `BASKET_WIDTH = 100` (100px) を宣言。
- **14-15行目**: アイテム初期落下スピード `FALL_SPEED_BASE = 3.5` と初期ライフ数 `MAX_LIVES = 3` を指定。
- **18-22行目**: `stage` (CreateJS親舞台), `scene_id` (0:タイトル, 1:プレイ中, 2:ゲームオーバー), `score` (点数), `lives` (残機), `frame_cnt` (フレーム数) を宣言。
- **25-26行目**: `basket` (自機カゴのContainer), `itemList` (落ちている全アイテムの配列) を宣言。
- **29-30行目**: キー押下フラグ `isPressLeft`, `isPressRight` を宣言。
- **33-34行目**: スコアとライフを表示するための CreateJS `Text` オブジェクトを宣言。

---

### 3.3 `init.js` （初期化・タイトル・ゲーム開始）

```javascript
// ------------------------------------------
// 初期化処理と画面生成 (init.js)
// ------------------------------------------

// HTMLの読み込みが完了した時にinit関数を実行する
window.addEventListener("load", init);

// ゲーム全体の初期化関数
function init() {
    // <canvas id="myCanvas"> をCreateJSのStageとして紐付け
    stage = new createjs.Stage("myCanvas");

    // キーボードの入力イベントハンドラを登録
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // マウス移動操作の初期化関数を呼び出し
    initMouseControl();

    // タイトル画面を表示
    initTitle();

    // 毎フレームの描画更新処理（handleTick）をTickerに登録
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", handleTick);
}

// タイトル画面の表示関数
function initTitle() {
    scene_id = 0; // 画面状態を「タイトル」に設定
    stage.removeAllChildren(); // 画面上の描画要素をリセット

    // 白い背景描画
    let bg = new createjs.Shape();
    bg.graphics.beginFill("white").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    // タイトルロゴテキスト
    let titleText = new createjs.Text("フルーツキャッチゲーム", "40px bold sans-serif", "black");
    titleText.x = STAGE_W / 2 - titleText.getMeasuredWidth() / 2; // 中央揃え
    titleText.y = 150;
    stage.addChild(titleText);

    // 操作説明テキスト
    let guideText = new createjs.Text("← → キー または マウス操作 でカゴを動かそう！\n落ちてくる赤りんご（+100）と金アイテム（+300）を取ろう！\n紫の毒アイテム（-200）は避けてね！", "20px sans-serif", "#333333");
    guideText.textAlign = "center";
    guideText.x = STAGE_W / 2;
    guideText.y = 240;
    stage.addChild(guideText);

    // スタート案内テキスト
    let startText = new createjs.Text("スペースキー または クリック でスタート！", "24px bold sans-serif", "red");
    startText.x = STAGE_W / 2 - startText.getMeasuredWidth() / 2;
    startText.y = 360;
    stage.addChild(startText);

    // クリックまたはタップでゲーム開始
    stage.addEventListener("stagemousedown", startGame);
    stage.update();
}

// プレイ画面への切り替えとゲーム開始処理
function startGame() {
    if (scene_id !== 0) return; // タイトル画面以外からは呼び出さない

    scene_id = 1; // 画面状態を「プレイ中」に設定
    stage.removeAllChildren();
    stage.removeEventListener("stagemousedown", startGame);

    // 変数の初期化
    score = 0;
    lives = MAX_LIVES;
    frame_cnt = 0;
    itemList = [];

    // 背景描画
    let bg = new createjs.Shape();
    bg.graphics.beginFill("white").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    // 地面（緑色のライン）
    let ground = new createjs.Shape();
    ground.graphics.beginFill("green").drawRect(0, STAGE_H - 30, STAGE_W, 30);
    stage.addChild(ground);

    // 自機（カゴ）の生成
    createBasket();

    // スコア表示テキストの生成
    scoreText = new createjs.Text("スコア: 0", "26px bold sans-serif", "black");
    scoreText.x = 20;
    scoreText.y = 20;
    stage.addChild(scoreText);

    // ライフ表示テキストの生成
    livesText = new createjs.Text("ライフ: " + lives, "26px bold sans-serif", "red");
    livesText.x = STAGE_W - 160;
    livesText.y = 20;
    stage.addChild(livesText);
}

// 自機（カゴ）を表示オブジェクトとして作成する関数
function createBasket() {
    basket = new createjs.Container();

    // 茶色の長方形でカゴ本体を描画
    let body = new createjs.Shape();
    body.graphics.beginFill("brown").drawRect(-BASKET_WIDTH / 2, -15, BASKET_WIDTH, 30);
    basket.addChild(body);

    // 初期位置の設定（画面中央下部）
    basket.x = STAGE_W / 2;
    basket.y = STAGE_H - 45;
    stage.addChild(basket);
}
```

#### 行別詳細解説
- **6行目**: `window.addEventListener("load", init)` でHTML構造がすべて読み込まれたら `init` を実行します。
- **11行目**: `new createjs.Stage("myCanvas")` で Canvas を CreateJS の描画基盤にします。
- **14-15行目**: Window 全体に `keydown` と `keyup` イベントリスナーを紐付けます。
- **24-25行目**: `createjs.Ticker.timingMode = createjs.Ticker.RAF` により、60FPSのタイマーで `handleTick` を毎フレーム呼び出します。
- **30-60行目 (`initTitle`)**: シーンIDを0にし、白い背景・タイトル文字・操作案内テキストを描画し、画面クリック (`stagemousedown`) で `startGame` へ移るイベントを登録します。
- **63-100行目 (`startGame`)**: シーンIDを1に変更し、スコア・ライフ・フレーム数をリセット。背景・地面ライン・カゴ・UIテキストを表示します。
- **103-115行目 (`createBasket`)**: `createjs.Container` 内に `(-BASKET_WIDTH/2, -15)` で幅 100px、高さ 30px の茶色長方形を描画し、画面中央下 `(STAGE_W/2, STAGE_H-45)` に配置します。

---

### 3.4 `tick.js` （毎フレーム更新・アイテム出現・衝突判定）

```javascript
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

            // SE再生
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
```

#### 行別詳細解説
- **6-26行目 (`handleTick`)**: プレイ中のみ動作。左・右フラグで `basket.x` を移動させ、壁で反転移動制限。35フレームごとに `spawnItem()` を実行し、`stage.update()` で再描画。
- **32-38行目 (`playSE`)**: 効果音再生を `try...catch` で安全にラップ。
- **41-75行目 (`spawnItem`)**: `Math.random()` 判定（毒 20%, 金の星 15%, 赤りんご 65%）。スコアに応じて `item.speed` が速くなる難易度調整を適用。
- **78-120行目 (`updateItems`)**: 配列を逆順で走査。`dx = Math.abs(item.x - basket.x)` と `dy = Math.abs(item.y - basket.y)` でカゴの上部開口部に入ったかを矩形判定。成功時はスコア加算・SE再生・Tweenポップアップテキスト表示。画面最下部到達時はライフ消費。
- **130-141行目 (`showEffectText`)**: `createjs.Tween` で `+100` や `-200` などの文字が上に浮かびながら消える演出。

---

### 3.5 `key.js` （キーボード入力）

```javascript
// ------------------------------------------
// キーボード入力処理 (key.js)
// ------------------------------------------

// キーボードが押された時のイベントハンドラ
function handleKeyDown(event) {
    if (event.keyCode === 37 || event.keyCode === 65) isPressLeft = true;  // 左矢印 または Aキー
    if (event.keyCode === 39 || event.keyCode === 68) isPressRight = true; // 右矢印 または Dキー
    if (event.keyCode === 32) { // スペースキー
        if (scene_id === 0) startGame();   // タイトル画面ならゲーム開始
        if (scene_id === 2) initTitle();   // ゲームオーバー画面ならタイトルへ戻る
    }
}

// キーボードが離された時のイベントハンドラ
function handleKeyUp(event) {
    if (event.keyCode === 37 || event.keyCode === 65) isPressLeft = false;
    if (event.keyCode === 39 || event.keyCode === 68) isPressRight = false;
}
```

#### 行別詳細解説
- **6-13行目**: `keydown` で `keyCode` (37:左, 39:右, 65:A, 68:D, 32:Space) を検知し、移動フラグを `true` にします。スペースキーは画面遷移に使用します。
- **16-19行目**: `keyup` でキー離下を検出してフラグを `false` に戻します。

---

### 3.6 `mouse.js` （マウス入力）

```javascript
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
```

#### 行別詳細解説
- **6-16行目**: `stagemousemove` イベントでカーソルの `evt.stageX` 座標を取得し、カゴの座標 `basket.x` にリアルタイム同期します。

---

### 3.7 `gameover.js` （ゲームオーバー・リザルト）

```javascript
// ------------------------------------------
// ゲームオーバー・リザルト処理 (gameover.js)
// ------------------------------------------

// ゲームオーバー画面を表示する関数
function showGameOver() {
    scene_id = 2; // 画面状態を「ゲームオーバー」に設定

    // 画面に残っている全アイテムを消去
    for (let item of itemList) {
        stage.removeChild(item);
    }
    itemList = [];

    // ゲームオーバーのタイトル文字表示
    let gameOverText = new createjs.Text("GAME OVER", "44px bold sans-serif", "red");
    gameOverText.x = STAGE_W / 2 - gameOverText.getMeasuredWidth() / 2;
    gameOverText.y = 180;
    stage.addChild(gameOverText);

    // 最終スコア結果の表示
    let finalScoreText = new createjs.Text("獲得スコア: " + score + " 点", "28px sans-serif", "black");
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
- **7行目**: `scene_id = 2` (ゲームオーバー) に設定。
- **10-13行目**: 画面上に残存する全アイテムを `removeChild` でクリアし、配列 `itemList` をリセット。
- **34-36行目**: `setTimeout` で 500ms のディレイを入れ、ゲームオーバー直後の意図しない連打誤操作を防止。
