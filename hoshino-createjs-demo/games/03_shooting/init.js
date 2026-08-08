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
