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
