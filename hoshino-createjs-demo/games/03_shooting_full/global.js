// ==========================================
// 2Dシューティングゲーム (発展版) - グローバル変数管理
// ==========================================

// 画面サイズ (960x540)
const STAGE_W = 960;
const STAGE_H = 540;

// ステージとゲーム進行状態
let stage;
let scene_id = 0; // 0:タイトル画面, 1:ゲームプレイ中, 2:ゲームオーバー, 3:ステージクリア
let frame_cnt = 0; // フレームカウンター
let score = 0;     // プレイヤーのスコア
let lives = 3;     // 自機の初期残機数 (ライフ)

// ゲームオブジェクト用変数
let player;               // 自機オブジェクト
let playerSpeed = 6;      // 自機の移動速度
let bulletList = [];      // 自機が発射した弾の配列
let enemyList = [];       // 画面上の雑魚敵の配列
let enemyBulletList = []; // 敵が発射した弾の配列
let itemList = [];        // パワーアップアイテムの配列

// ボスオブジェクト関連
let boss = null;       // ボスオブジェクト
let bossHp = 0;        // ボスの現在のHP
let bossMaxHp = 30;    // ボスの最大HP
let bossVx = 1.8;      // ボスの横移動スピード

// ステージ進行フェーズ (0:雑魚ラッシュ, 1:ボス予告WARNING, 2:ボス戦)
let stagePhase = 0;
let phaseTimer = 0;

// UI表示テキスト・エレメント
let scoreBoard;     // スコア表示テキスト
let livesBoard;     // 残機表示テキスト
let titleText;      // タイトルロゴテキスト
let howToText;      // 操作説明テキスト
let pressSpaceText; // スタート促しテキスト
let warningText;    // ボス警告テキスト
let bossHpBg;       // ボスHPバー背景
let bossHpFill;     // ボスHPバーゲージ

// キー入力フラグ (キーボードの押下状態)
let isPressLeft = false;  // 左移動キー
let isPressRight = false; // 右移動キー
let isPressUp = false;    // 上移動キー
let isPressDown = false;  // 下移動キー
let isPressShoot = false; // ショット発射キー (Z / Space)

let shootCooldown = 0; // ショット連射用のクールダウンタイマー
let playerPower = 1;   // 自機のパワーレベル (1:単発, 2:2連射, 3:3WAY)
