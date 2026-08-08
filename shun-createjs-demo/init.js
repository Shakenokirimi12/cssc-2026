// ==========================================
// ★ 初期化ファイル (init.js) ★
// Stageを作り、キー・マウス・Tickerのイベントを登録します。
// 画面を作る処理はここに集めます。
// ==========================================

window.addEventListener("load", init);

function init() {
  // 1. CreateJSのStage（ゲームを描く舞台）を作る
  stage = new createjs.Stage("myCanvas");

  // 2. すでに登録されているイベントがあれば消して、重複を防ぐ
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  stage.removeEventListener("stagemousedown", handleMouseDown);
  stage.addEventListener("stagemousedown", handleMouseDown);

  createjs.Ticker.removeEventListener("tick", handleTick);
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener("tick", handleTick);

  // 3. material フォルダに画像・音があれば、先に準備する。
  // 素材を使わない場合は、すぐにタイトル画面を出します。
  prepareMaterials(showTitleScreen);
}

// ==========================================
// 素材の読み込み
// ==========================================

// 画像を使う設定のときだけ、画像を読み込みます。
// 読み込みに失敗した画像は図形で代用するので、ゲームは止まりません。
function prepareMaterials(onReady) {
  materialImages = {};
  soundTemplates = {};

  prepareSoundEffects();

  if (!useMaterialImages) {
    onReady();
    return;
  }

  const imageFiles = {
    player: playerImageFile,
    star: starImageFile,
    bomb: bombImageFile
  };
  const keys = Object.keys(imageFiles);
  let finishedCount = 0;

  function finishOne() {
    finishedCount++;
    if (finishedCount === keys.length) onReady();
  }

  keys.forEach(function(key) {
    const image = new Image();
    image.onload = function() {
      materialImages[key] = image;
      finishOne();
    };
    image.onerror = function() {
      // 画像がないときは、元の図形を使う。途中で失敗しても遊べるようにする。
      console.warn("素材を読み込めませんでした: " + imageFiles[key]);
      finishOne();
    };
    image.src = imageFiles[key];
  });
}

// 効果音は、最初に「ひな形」を用意するだけです。
// 鳴らすときは cloneNode() で複製するため、連続で星を取っても音が重なります。
function prepareSoundEffects() {
  if (!useSoundEffects) return;

  const soundFiles = {
    start: soundStartFile,
    star: soundStarFile,
    bomb: soundBombFile,
    hurry: soundHurryFile,
    timeup: soundTimeUpFile
  };

  Object.keys(soundFiles).forEach(function(key) {
    const audio = new Audio(soundFiles[key]);
    audio.preload = "auto";
    soundTemplates[key] = audio;
  });
}

// 指定した効果音を再生する関数。音がない場合は何もしません。
function playSoundEffect(name) {
  if (!useSoundEffects || !soundTemplates[name]) return;

  const sound = soundTemplates[name].cloneNode();
  sound.volume = soundEffectVolume;
  sound.play().catch(function() {
    // ブラウザの自動再生制限や、ファイルがない場合でもゲームは続けます。
  });
}

// 読み込み済みの画像を、中心が(0, 0)になるようにBitmap化する補助関数。
// 画像の縦横比を保ったまま、指定された大きさの中へ収めます。
function createMaterialBitmap(name, targetWidth, targetHeight) {
  const image = materialImages[name];
  if (!image) return null;

  const bitmap = new createjs.Bitmap(image);
  const scale = Math.min(targetWidth / image.width, targetHeight / image.height);
  bitmap.scaleX = scale;
  bitmap.scaleY = scale;
  bitmap.x = -image.width * scale / 2;
  bitmap.y = -image.height * scale / 2;
  return bitmap;
}

// タイトル画面を作る
function showTitleScreen() {
  resetGameData();
  createGameScene();

  isGameTitle = true;
  isGameOver = false;
  isTimeUp = false;

  showCenterMessage(
    "STAR & BOMB CATCH\n\n←  → キーで動こう\n星を取ると +10点、爆弾に当たるとゲームオーバー\n\nSPACE キー または 画面クリックでスタート",
    "#ffffff"
  );
  stage.update();
}

// 新しいゲームを始める
function startGame() {
  resetGameData();
  createGameScene();

  isGameTitle = false;
  isGameOver = false;
  isTimeUp = false;
  gameStartTime = Date.now();
  lastSpawnTime = gameStartTime;

  playSoundEffect("start");
  addFloatingText(STAGE_W / 2, 180, "星を連続で取るとコンボ！", "#ffe36e", 24);
  stage.update();
}

// 前のゲームのデータを初期値に戻す
function resetGameData() {
  itemList = [];
  effectList = [];
  score = 0;
  timeLeft = timeLimitSeconds;
  comboCount = 0;
  comboMultiplier = 1;
  lastStarCatchTime = 0;
  isHurryUp = false;
  isPressLeft = false;
  isPressRight = false;
  restartButtonArea = null;
}

// 背景・プレイヤー・UIをまとめて作る
function createGameScene() {
  stage.removeAllChildren();

  createBackground();
  itemLayer = new createjs.Container();
  effectLayer = new createjs.Container();
  uiLayer = new createjs.Container();
  stage.addChild(itemLayer, effectLayer, uiLayer);

  createPlayer();
  createUserInterface();
}

// 夜空と地面を描く
function createBackground() {
  const sky = new createjs.Shape();
  sky.graphics.beginFill(skyColor).drawRect(0, 0, STAGE_W, STAGE_H);
  stage.addChild(sky);

  // 背景の小さな星。ここは飾りなので、当たり判定には使いません。
  // 1つのShapeに複数の円をつなげて描くと線が結ばれてしまうため、
  // 小さな星は1個ずつ別のShapeとして描いています。
  for (let i = 0; i < 55; i++) {
    const x = (i * 83 + 31) % STAGE_W;
    const y = (i * 47 + 19) % 410;
    const size = (i % 3) + 1;
    const backgroundStar = new createjs.Shape();
    backgroundStar.graphics.beginFill("#dbeeff").drawCircle(x, y, size);
    stage.addChild(backgroundStar);
  }

  const ground = new createjs.Shape();
  ground.graphics.beginFill(groundColor).drawRect(0, PLAYER_Y + 28, STAGE_W, STAGE_H - PLAYER_Y);
  ground.graphics.beginFill("#6273a6").drawRect(0, PLAYER_Y + 28, STAGE_W, 4);
  stage.addChild(ground);
}

// 左右に動かすプレイヤーを描く
function createPlayer() {
  player = new createjs.Container();

  // material/player.png があるときは、バスケットの図形の代わりに表示する。
  const playerBitmap = createMaterialBitmap("player", playerWidth, playerHeight * 2);
  if (playerBitmap) {
    player.addChild(playerBitmap);
  } else {
    // バスケット本体
    const basket = new createjs.Shape();
    basket.graphics
      .beginFill(playerColor)
      .drawRoundRect(-playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight, 8)
      .beginStroke("#ffffff")
      .setStrokeStyle(2)
      .drawRoundRect(-playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight, 8);
    player.addChild(basket);

    // バスケットの取っ手。「ここも描き変えると自機の見た目を変えられる」と説明できます。
    const handle = new createjs.Shape();
    handle.graphics.setStrokeStyle(5).beginStroke("#9ee8ff").arc(0, -playerHeight / 2 + 7, 22, Math.PI, 0);
    player.addChild(handle);
  }

  player.x = STAGE_W / 2;
  player.y = PLAYER_Y;
  stage.addChild(player);
}

// スコア・残り時間・コンボを表示する
function createUserInterface() {
  scoreBoard = new createjs.Text("SCORE: 0", "bold 24px Arial", uiColor);
  scoreBoard.x = 18;
  scoreBoard.y = 15;
  uiLayer.addChild(scoreBoard);

  timeBoard = new createjs.Text("TIME: " + timeLimitSeconds, "bold 24px Arial", uiColor);
  timeBoard.textAlign = "right";
  timeBoard.x = STAGE_W - 18;
  timeBoard.y = 15;
  uiLayer.addChild(timeBoard);

  comboBoard = new createjs.Text("", "bold 22px Arial", "#ffe36e");
  comboBoard.textAlign = "center";
  comboBoard.x = STAGE_W / 2;
  comboBoard.y = 16;
  uiLayer.addChild(comboBoard);

  hurryUpBoard = new createjs.Text("", "bold 32px Arial", hurryUpColor);
  hurryUpBoard.textAlign = "center";
  hurryUpBoard.x = STAGE_W / 2;
  hurryUpBoard.y = 52;
  uiLayer.addChild(hurryUpBoard);
}
