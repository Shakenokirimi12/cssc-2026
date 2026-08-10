// ==========================================
// ★ ゲーム初期化ファイル (init.js) ★
// ==========================================
if (gameText && stage && stage.contains(gameText)) {
  stage.removeChild(gameText);
}
gameText = null;


let manifest = [
    {src: "material/kinoko_red.png", id: "ball_red"},
    {src: "material/kinoko_blue.png", id: "ball_blue"},
    {src: "material/kinoko_green.png", id: "ball_green"},
    {src: "material/kinoko_pink.png", id: "ball_pink"},
    {src: "material/kinoko_purple.png", id: "ball_purple"},
    {src: "material/kinoko_yellow.png", id: "ball_yellow"},
    {src: "material/kinoko_monochrome.png", id: "ball_monochrome"},
    {src: "material/cat_chomo_mike.png", id: "block1"},
    {src: "material/cat_chomo_shirokurotobi.png", id: "block2"},
    {src: "material/manulneko.png", id: "block3"},
    {src: "material/okashi24-1280x720.png", id: "background"},
    {src: "material/Game.mp3", id: "bgm"},
    {src: "material/決定ボタンを押す52.mp3", id: "se_collision"},
    {src: "material/猫の鳴き声1.mp3", id: "se_cat1"},
    {src: "material/猫の鳴き声2.mp3", id: "se_cat2"},
    {src: "material/猫の威嚇.mp3", id: "se_cat3"}
  ];

  loader = new createjs.LoadQueue(true);
  loader.installPlugin(createjs.Sound);
  loader.addEventListener("complete", init);
  loader.loadManifest(manifest, true, "./");

function init() {
  // 1. Stage（舞台）の作成
  stage = new createjs.Stage("myCanvas");

  //データリセット
  ballList = [];
  blockList = [];

  //文字の初期化
  if (gameText && stage && stage.contains(gameText)) {
  stage.removeChild(gameText);
}
gameText = null;

  //背景
  let bg = new createjs.Shape();
  //bg.graphics.beginFill("black").drawRect(0,0,STAGE_W,STAGE_H); 黒い背景
  
  let bgImg = loader.getResult("background"); //　上とこの２行を選択
  bg.graphics.beginBitmapFill(bgImg).drawRect(0,0,STAGE_W,STAGE_H);

  stage.addChild(bg);   // 背景をステージに追加
  
  // ガード処理：global.jsの数値が壊れている場合の最低保証
  if (!ballCount || ballCount < 1) ballCount = 1;
  if (!paddleWidth || paddleWidth < 10) paddleWidth = 50;

  // 2. パドル（バー）の作成
  paddle = new createjs.Shape();
  paddle.graphics.beginFill(paddleColor).drawRect(0, 0, paddleWidth, paddleHeight);
  paddle.x = (STAGE_W - paddleWidth) / 2;
  paddle.y = STAGE_H - 50;
  paddle.noTouch = true;
  stage.addChild(paddle);

  // 3. ボールの作成（ballCount の数だけ作って配列に保存）
  for (let i = 0; i < ballCount; i++) {
    createSingleBall(i);
  }

  // 4. ブロックの作成（2次元配列 blockMap から生成）
  createBlocksFromMap();

  // 5. スコア表示の作成
  score = 0;
  scoreBoard = new createjs.Text("SCORE: 0", "20px Arial", "black");
  scoreBoard.x = 10;
  scoreBoard.y = 10;
  stage.addChild(scoreBoard);

  // 5. 経過時間表示の作成
  totalFrame = 0;
  timeBoard = new createjs.Text("Time: 0", "20px Arial", "black");
  timeBoard.x = STAGE_W - 150; // 右上に表示
  timeBoard.y = 10;
  stage.addChild(timeBoard);

  // 6. メインループ（Ticker）の設定
  createjs.Ticker.removeEventListener("tick", handleTick);    // 既存のイベントリスナーを削除してから追加することで、重複して呼ばれるのを防ぐ
  createjs.Ticker.timingMode = createjs.Ticker.RAF;   //ここでFPSを60に設定
  createjs.Ticker.addEventListener("tick", handleTick);   // 1秒に60回呼ばれる関数を登録
}

// ボールを1つ生成する補助関数
function createSingleBall(index) {                  //画像と切り替えるときはtick.jsの// ★改造用フック①'：パドルに当たったらボールの画像をランダムに変えるもコメントアウトを外してみよう
  //通常の円形のボール--------------------
  let ball = new createjs.Shape();
  ball.graphics.beginFill(ballColor).drawCircle(0, 0, ballRadius);
  //------------------------------------

  // 画像版のボール----------------------
  //let ball = new createjs.Container();

  //let ballBitmap = new createjs.Bitmap(loader.getResult("ball_red"));
  //ballBitmap.scaleX = 0.05;
  //ballBitmap.scaleY = 0.05;

  //ball.addChild(ballBitmap);
  //ball.bitmap = ballBitmap;
  //------------------------------------

  // 初期位置（パドルの中央の上に配置）
  ball.x = STAGE_W / 2 + (index * 15 - (ballCount * 7.5)); // 複数ある場合は少しずらす
  ball.y = STAGE_H - 70;
  
  // ボールごとの速度（方向を少しバラけさせる）
  ball.vx = ballSpeedX + (index * 0.5);
  ball.vy = ballSpeedY;
  
  stage.addChild(ball);
  ballList.push(ball);
}

// 2次元配列からブロックを一括生成する関数
function createBlocksFromMap() {
  if (!nowBlockMap || nowBlockMap.length === 0) return;

  let rows = nowBlockMap.length;
  let cols = nowBlockMap[0].length;
  
  // 画面幅に合わせてブロック1個の横幅を自動計算
  let blockW = (STAGE_W - 40) / cols - blockMargin;
  let blockH = 20;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let type = nowBlockMap[r][c];
      
      // 0（なし）の場合はスキップ
      if (type === 0) continue;

      // ここでブロックの色や画像を設定する
      //色
      //let block = new createjs.Shape();
      //let color = (type === 2) ? colorHard : colorNormal;
      //block.graphics.clear().beginFill(color).drawRect(0, 0, blockW, blockH);

      //画像
      let blockImgId;
      switch(type) {
        case 1:
          blockImgId = blockImgNormal;
          break;
        case 2:
          blockImgId = blockImgHard;
          break;
        default:
          blockImgId = blockImgBoss;
      }
      let blockImg = loader.getResult(blockImgId);
      let block = new createjs.Bitmap(blockImg);
      block.scaleX = blockW / blockImg.width;
      block.scaleY = blockH / blockImg.height;
      
      // ブロックの位置を計算して配置
      block.x = 20 + c * (blockW + blockMargin);
      block.y = 50 + r * (blockH + blockMargin);
      
      // ブロック固有のプロパティ（ステータス）を持たせる
      block.w = blockW;
      block.h = blockH;
      block.hp = type; // HP (1なら1回、2なら2回で破壊)

      stage.addChild(block);
      blockList.push(block);
    }
  }
}

function refreshBlockMapDisplay() {
  if (!stage) return;

  // 既存ブロックを消す
  for (let i = blockList.length - 1; i >= 0; i--) {
    let block = blockList[i];
    if (block && stage.contains(block)) {
      stage.removeChild(block);
    }
  }
  blockList = [];

  // 新しいマップを描画
  createBlocksFromMap();
  stage.update();
}