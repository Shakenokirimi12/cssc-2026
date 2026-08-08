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
