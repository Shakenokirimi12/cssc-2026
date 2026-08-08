// ------------------------------------------
// グローバル変数と定数の定義 (global.js)
// ------------------------------------------

// 画面サイズの定数宣言（横幅960px、高さ540px）
const STAGE_W = 960;
const STAGE_H = 540;

// 物理運動のパラメータ
const PLAYER_SPEED = 6;  // 左右移動速度
const JUMP_POWER = -12;  // 初速（負の値で上方向へ跳ぶ）
const GRAVITY = 0.6;     // 重力加速度（下方向の加減速）

const PLAYER_SIZE = 30; // プレイヤーの1辺のサイズ（四角形）

// ステージと画面状態の変数
let stage;         // CreateJSのStageオブジェクト
let scene_id = 0;  // 画面状態（0:タイトル, 1:プレイ, 2:ゲームオーバー, 3:ステージクリア）
let score = 0;     // 現在のスコア

// プレイヤーオブジェクトと速度ベクトル
let player;
let playerVX = 0; // 横方向速度
let playerVY = 0; // 縦方向速度
let isGrounded = false; // 足場に着地しているかどうかのフラグ

// ステージ上の各種表示オブジェクト群
let platforms = []; // 足場ブロックの配列
let coins = [];     // コインの配列
let hazards = [];   // 障害物（トゲ）の配列
let goal;           // ゴール旗オブジェクト

// キー入力の状態フラグ
let isPressLeft = false;  // 左移動キー
let isPressRight = false; // 右移動キー
let isPressJump = false;  // ジャンプキー

// UI表示テキスト
let scoreText; // スコア表示用のTextオブジェクト
