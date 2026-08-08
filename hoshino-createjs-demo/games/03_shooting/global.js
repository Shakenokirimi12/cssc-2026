// 画面サイズ (960x540)
const STAGE_W = 960;
const STAGE_H = 540;

let stage;
let scene_id = 0; // 0:タイトル, 1:プレイ, 2:ゲームオーバー
let frame_cnt = 0;
let score = 0;
let lives = 3;

// パラメータ
let player;
let playerSpeed = 6;
let bulletList = [];
let enemyList = [];
let stars = [];

// UI要素
let scoreBoard;
let livesBoard;
let titleText;
let howToText;
let pressSpaceText;

// キー入力フラグ
let isPressLeft = false;
let isPressRight = false;
let isPressUp = false;
let isPressDown = false;
let isPressShoot = false;
let shootCooldown = 0;
