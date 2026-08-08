// ==========================================
// ★ 設定・共有データ (global.js) ★
// このファイルの数字を変えると、ゲームの遊び心地が変わります。
// まずは「★カスタマイズポイント」と書かれた場所を1つだけ変えて、
// 保存 → ブラウザ再読み込みで変化を確かめてみましょう。
// ==========================================

// ---------- 画面の大きさ ----------
const STAGE_W = 600;
const STAGE_H = 600;

// ---------- ★1. プレイヤーの設定 ----------
const PLAYER_Y = 535;          // プレイヤーの縦位置（大きくすると下へ移動）
let playerMoveSpeed = 8;       // ★左右の移動速度：4 ゆっくり / 12 かなり速い
let playerWidth = 90;          // ★プレイヤーの横幅
let playerHeight = 24;         // ★プレイヤーの縦幅
let playerColor = "#35c2ff";  // ★プレイヤーの色

// ---------- ★2. 星と爆弾の設定 ----------
let itemSpawnInterval = 700;   // ★アイテムが出る間隔（ミリ秒）。小さいほどたくさん出る
let starProbability = 0.78;    // ★星の出る確率（0〜1）。0.9なら爆弾は少なめ
let starScore = 10;            // ★星を1個取ったときの基本点
let itemFallSpeedMin = 2.2;    // ★落下速度の最小値
let itemFallSpeedMax = 4.0;    // ★落下速度の最大値
let starRadius = 17;           // ★星の大きさ
let bombRadius = 18;           // ★爆弾の大きさ

// ---------- ★3. 制限時間と終盤演出 ----------
let timeLimitSeconds = 30;     // ★制限時間（秒）
let hurryUpSeconds = 10;       // ★残り何秒で「HURRY UP!」にするか
let hurryUpSpeedMultiplier = 2;// ★終盤の落下速度倍率。2なら2倍

// ---------- ★4. コンボの設定 ----------
// 連続で星を取るとコンボ数が増えます。
// 3個ごとに得点倍率が 1 → 2 → 3 ... と上がります。
let comboContinueMilliseconds = 1800; // ★次の星を取るまでの猶予時間
let comboStarsPerLevel = 3;            // ★何個ごとに倍率を1上げるか
let maxComboMultiplier = 5;            // ★倍率の上限

// ---------- ★5. 見た目の色 ----------
let skyColor = "#10264f";
let groundColor = "#19233d";
let uiColor = "#ffffff";
let hurryUpColor = "#ff5c70";

// ---------- ★6. 自分の画像・効果音を使う設定 ----------
// 画像や音を使わない間は false のままでOKです。
// true にしてから material フォルダへ同じ名前のファイルを入れると、
// 図形の代わりに自分の素材を使えます。詳しくは STUDENT_README.md を見よう。
let useMaterialImages = false; // ★自分の画像を使うなら true
let useSoundEffects = false;   // ★自分の効果音を使うなら true
let soundEffectVolume = 0.35;  // ★効果音の音量（0〜1）

// ★画像のファイル名。PNG、JPG、WebPなどが使えます。
// ファイル名を変えたときは、右側の文字も同じ名前に直します。
let playerImageFile = "material/player.png";
let starImageFile = "material/star.png";
let bombImageFile = "material/bomb.png";

// ★効果音のファイル名。まずはMP3かWAVがおすすめです。
let soundStartFile = "material/start.mp3";
let soundStarFile = "material/star.mp3";
let soundBombFile = "material/bomb.mp3";
let soundHurryFile = "material/hurry.mp3";
let soundTimeUpFile = "material/timeup.mp3";

// ==========================================
// ここから下はゲーム本体が使う変数です。
// 基本的には変更しなくて大丈夫です。
// ==========================================
let stage;
let player;
let itemLayer;
let effectLayer;
let uiLayer;

let itemList = [];       // 今画面にある星・爆弾を入れておく配列
let effectList = [];     // 「+10」など、消えていく文字を入れておく配列

let score = 0;
let timeLeft = timeLimitSeconds;
let comboCount = 0;
let comboMultiplier = 1;
let lastStarCatchTime = 0;
let gameStartTime = 0;
let lastSpawnTime = 0;
let isHurryUp = false;

let isGameTitle = true;
let isGameOver = false;
let isTimeUp = false;

// キーが押されているかを記録するフラグ
let isPressLeft = false;
let isPressRight = false;

// 画面右上・左上などの文字部品
let scoreBoard;
let timeBoard;
let comboBoard;
let hurryUpBoard;
let gameText;
let restartButton;

// マウスでクリックできる範囲
let restartButtonArea = null;

// 読み込みに成功した画像・効果音を入れておく場所
let materialImages = {};
let soundTemplates = {};
