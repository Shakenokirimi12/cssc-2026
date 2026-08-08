// ==========================================
// 2Dシューティングゲーム (発展版) - 初期化処理
// ==========================================

// ページ読み込み完了時に初期化を実行
window.addEventListener("load", init);

/**
 * ゲーム全体の初期化
 */
function init() {
    // Stageオブジェクトの生成
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

    // 背景（黒スペース）
    let bg = new createjs.Shape();
    bg.graphics.beginFill("black").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    // 星空背景アニメーション用の星を生成
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

    // 自機（上向きの三角戦闘機）
    player = new createjs.Shape();
    player.graphics.beginFill("cyan")
        .moveTo(0, -16)
        .lineTo(12, 12)
        .lineTo(0, 6)
        .lineTo(-12, 12)
        .closePath();
    player.x = STAGE_W / 2;
    player.y = STAGE_H - 60;

    // UIテキスト（スコア・ライフ表示）
    scoreBoard = new createjs.Text("", "24px sans-serif", "white");
    scoreBoard.x = 15;
    scoreBoard.y = 15;
    stage.addChild(scoreBoard);

    livesBoard = new createjs.Text("", "24px sans-serif", "pink");
    livesBoard.x = STAGE_W - 180;
    livesBoard.y = 15;
    stage.addChild(livesBoard);

    // ボスHPバー（背景枠＆赤いHPゲージ）
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

    // タイトル画面を表示
    initTitle();

    // 毎フレーム描画更新用Tickerの設定
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", handleTick);
}

/**
 * タイトル画面の表示処理
 */
function initTitle() {
    scene_id = 0;
    stage.removeAllChildren();

    let bg = new createjs.Shape();
    bg.graphics.beginFill("black").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    for (let star of stars) stage.addChild(star);

    titleText = new createjs.Text("2Dシューティング (発展版)", "bold 40px sans-serif", "cyan");
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

    stage.addEventListener("stagemousedown", startGame);
    stage.update();
}

/**
 * ゲームスタート処理（変数の初期化と画面構築）
 */
function startGame() {
    if (scene_id !== 0) return;

    scene_id = 1;
    score = 0;
    lives = 3;
    playerPower = 1;
    frame_cnt = 0;
    shootCooldown = 0;
    stagePhase = 0;
    phaseTimer = 0;
    bossMaxHp = 30;

    bullets = [];
    enemyList = [];
    enemyBulletList = [];
    itemList = [];
    boss = null;

    stage.removeAllChildren();

    let bg = new createjs.Shape();
    bg.graphics.beginFill("black").drawRect(0, 0, STAGE_W, STAGE_H);
    stage.addChild(bg);

    for (let star of stars) stage.addChild(star);
    stage.addChild(player);
    player.x = STAGE_W / 2;
    player.y = STAGE_H - 60;

    stage.addChild(scoreBoard);
    stage.addChild(livesBoard);
    stage.addChild(bossHpBg);
    stage.addChild(bossHpFill);
}
