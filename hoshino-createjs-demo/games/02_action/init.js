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
