/*
============================================================
  1日目に編集するファイル

  このファイルでは、ゲーム全体の数字・色と、
  各ステージに置く床、敵、コインなどを設定します。

  学生向けのポイント
  ・JavaScriptでは [ ] が「複数のデータを並べる配列」です。
  ・{ } は「1つのステージや1つの物の情報」をまとめます。
  ・項目と項目の間にはカンマ , が必要です。
  ・変更したら Ctrl + S で保存し、ブラウザを再読み込みします。
============================================================
*/

window.GAME_SETTINGS = {
    // ========================================================
    // ゲーム全体で共通して使う設定
    // ========================================================

    title: "SKY ADVENTURE",
    backgroundColor: "#7dd3fc",
    groundColor: "#7c4f2c",
    platformColor: "#4f8f46",
    playerColor: "#ffb703",
    enemyColor: "#e63946",

    // 数字を変更すると、プレイヤーの操作感が変わります。
    playerMoveSpeed: 5,    // 3: ゆっくり / 8: かなり速い
    playerJumpPower: 15,   // 10: 低い / 20: とても高い
    gravity: 0.85,         // 0.5: ふわふわ / 1.2: すぐ落ちる

    // 各ステージに個別の値がなければ、下の値が使われます。
    timeLimit: 90,
    startLives: 3,

    coinScore: 100,
    enemyScore: 200,
    goalScore: 1000,

    // 同じフォルダにPNG画像を置くと、画像も使用できます。
    // 例: playerImage: "my_player.png"
    playerImage: "",
    enemyImage: "",

    // ブラウザでは、最初のキー入力後から音が鳴ります。
    soundEnabled: true,
    bgmEnabled: true,
    bgmTempo: 132,

    // trueにすると、全コインを取るまでゴールできません。
    // ステージ側に同じ設定を書くと、ステージごとに変更できます。
    requireAllCoinsForGoal: false,

    // ステージ側にworldWidthがない場合の標準の横幅です。
    worldWidth: 4200
};


/*
============================================================
  複数ステージの設定

  window.STAGES = [ ステージ1, ステージ2, ステージ3 ];
  という形で、複数のステージを配列に入れています。

  ステージを増やす方法
  1. 最後のステージの { ... } をコピーする
  2. 直前の } の後にカンマを付ける
  3. コピーした内容のnameや配置を変更する

  座標の考え方
  x      : 左からどれくらい右か
  y      : 上からどれくらい下か
  width  : 横の長さ
  height : 縦の長さ

  画面左上が x=0, y=0 です。
  地面の上は、およそ y=460 です。
============================================================
*/

window.STAGES = [
    // ========================================================
    // ステージ1：基本操作を覚えるステージ
    // 配列では最初の要素が番号0ですが、画面上ではSTAGE 1です。
    // ========================================================
    {
        name: "STAGE 1",
        introMessage: "STAGE 1　旗のあるゴールまで進もう！",
        worldWidth: 4200,
        timeLimit: 90,
        startLives: 3,
        requireAllCoinsForGoal: false,

        start: { x: 80, y: 390 },

        // 地面です。地面と地面の間を空けると穴になります。
        floors: [
            { x: 0, y: 460, width: 900, height: 80 },
            { x: 1020, y: 460, width: 900, height: 80 },
            { x: 2050, y: 460, width: 700, height: 80 },
            { x: 2870, y: 460, width: 1330, height: 80 }
        ],

        // 空中に置く足場です。
        platforms: [
            { x: 340, y: 375, width: 170, height: 24 },
            { x: 620, y: 305, width: 150, height: 24 },
            { x: 1080, y: 390, width: 180, height: 24 },
            { x: 1360, y: 325, width: 170, height: 24 },
            { x: 1660, y: 260, width: 160, height: 24 },
            { x: 2130, y: 370, width: 180, height: 24 },
            { x: 2440, y: 300, width: 170, height: 24 },
            { x: 2920, y: 390, width: 180, height: 24 },
            { x: 3250, y: 320, width: 180, height: 24 },
            { x: 3560, y: 250, width: 180, height: 24 }
        ],

        // トゲです。触れると残機が1減ります。
        hazards: [
            { x: 760, y: 430, width: 90, height: 30 },
            { x: 1500, y: 430, width: 90, height: 30 },
            { x: 2310, y: 430, width: 100, height: 30 },
            { x: 3110, y: 430, width: 90, height: 30 }
        ],

        enemies: [
            { id: "s1_enemy1", x: 520, y: 420, speed: 1.7, range: 110 },
            { id: "s1_enemy2", x: 1180, y: 420, speed: 2.0, range: 120 },
            { id: "s1_enemy3", x: 2200, y: 330, speed: 1.5, range: 80 },
            { id: "s1_enemy4", x: 3010, y: 420, speed: 2.2, range: 120 }
        ],

        coins: [
            { x: 390, y: 330 },
            { x: 475, y: 330 },
            { x: 665, y: 260 },
            { x: 1120, y: 345 },
            { x: 1430, y: 280 },
            { x: 1715, y: 215 },
            { x: 2180, y: 325 },
            { x: 2500, y: 255 },
            { x: 2970, y: 345 },
            { x: 3310, y: 275 },
            { x: 3620, y: 205 },
            { x: 3850, y: 400 }
        ],

        messageZones: [],
        items: [],
        buttons: [],
        doors: [],

        goal: { x: 4040, y: 350, width: 70, height: 110 }
    },

    // ========================================================
    // ステージ2：ボタンで扉を開くステージ
    // student.jsのstudentOnButtonPressedが使われます。
    // ========================================================
    {
        name: "STAGE 2",
        introMessage: "STAGE 2　赤いボタンを探して扉を開けよう！",
        worldWidth: 3400,
        timeLimit: 100,
        startLives: 3,
        requireAllCoinsForGoal: false,

        start: { x: 80, y: 390 },

        floors: [
            { x: 0, y: 460, width: 700, height: 80 },
            { x: 820, y: 460, width: 850, height: 80 },
            { x: 1790, y: 460, width: 1610, height: 80 }
        ],

        platforms: [
            { x: 420, y: 370, width: 170, height: 24 },
            { x: 870, y: 350, width: 180, height: 24 },
            { x: 1180, y: 285, width: 170, height: 24 },
            { x: 1500, y: 220, width: 150, height: 24 },
            { x: 1960, y: 360, width: 180, height: 24 },
            { x: 2280, y: 295, width: 180, height: 24 },
            { x: 2720, y: 350, width: 180, height: 24 }
        ],

        hazards: [
            { x: 610, y: 430, width: 90, height: 30 },
            { x: 1050, y: 430, width: 110, height: 30 },
            { x: 2390, y: 430, width: 110, height: 30 }
        ],

        enemies: [
            { id: "s2_enemy1", x: 940, y: 420, speed: 2.1, range: 80 },
            { id: "s2_enemy2", x: 1880, y: 420, speed: 2.4, range: 100 },
            { id: "s2_enemy3", x: 2790, y: 310, speed: 1.8, range: 70 }
        ],

        coins: [
            { x: 465, y: 325 },
            { x: 910, y: 305 },
            { x: 1230, y: 240 },
            { x: 1545, y: 175 },
            { x: 2010, y: 315 },
            { x: 2330, y: 250 },
            { x: 2770, y: 305 },
            { x: 3110, y: 400 }
        ],

        // 透明なエリアです。入るとstudentOnEnterZoneが呼ばれます。
        messageZones: [
            {
                id: "s2_door_hint",
                x: 2050,
                y: 280,
                width: 240,
                height: 180,
                text: "扉が閉まっている。どこかにボタンがありそうだ。"
            }
        ],

        // typeがspeedのアイテムを取るとstudent.jsで速度が変わります。
        items: [
            {
                id: "s2_speed_item",
                type: "speed",
                x: 1515,
                y: 175,
                multiplier: 1.6,
                duration: 5
            }
        ],

        // doorIdには、開けたい扉のidを書きます。
        buttons: [
            {
                id: "s2_button",
                x: 1320,
                y: 440,
                width: 46,
                height: 20,
                doorId: "s2_door"
            }
        ],

        doors: [
            {
                id: "s2_door",
                x: 2200,
                y: 320,
                width: 50,
                height: 140,
                color: "#5a189a"
            }
        ],

        goal: { x: 3240, y: 350, width: 70, height: 110 }
    },

    // ========================================================
    // ステージ3：すべてのコインを集めてからゴールするステージ
    // requireAllCoinsForGoalをtrueにしています。
    // ========================================================
    {
        name: "STAGE 3",
        introMessage: "FINAL STAGE　すべてのコインを集めよう！",
        worldWidth: 3800,
        timeLimit: 110,
        startLives: 3,
        requireAllCoinsForGoal: true,

        start: { x: 80, y: 390 },

        floors: [
            { x: 0, y: 460, width: 560, height: 80 },
            { x: 700, y: 460, width: 650, height: 80 },
            { x: 1490, y: 460, width: 700, height: 80 },
            { x: 2320, y: 460, width: 1480, height: 80 }
        ],

        platforms: [
            { x: 300, y: 365, width: 160, height: 24 },
            { x: 620, y: 300, width: 150, height: 24 },
            { x: 910, y: 235, width: 160, height: 24 },
            { x: 1240, y: 340, width: 150, height: 24 },
            { x: 1580, y: 285, width: 170, height: 24 },
            { x: 1920, y: 220, width: 170, height: 24 },
            { x: 2380, y: 350, width: 180, height: 24 },
            { x: 2710, y: 285, width: 170, height: 24 },
            { x: 3060, y: 220, width: 170, height: 24 },
            { x: 3400, y: 330, width: 170, height: 24 }
        ],

        hazards: [
            { x: 520, y: 430, width: 40, height: 30 },
            { x: 1120, y: 430, width: 110, height: 30 },
            { x: 1750, y: 430, width: 120, height: 30 },
            { x: 2590, y: 430, width: 110, height: 30 },
            { x: 3230, y: 430, width: 100, height: 30 }
        ],

        enemies: [
            { id: "s3_enemy1", x: 790, y: 420, speed: 2.4, range: 80 },
            { id: "s3_enemy2", x: 1550, y: 420, speed: 2.6, range: 100 },
            { id: "s3_enemy3", x: 2440, y: 310, speed: 2.0, range: 80 },
            { id: "s3_enemy4", x: 3450, y: 290, speed: 2.3, range: 65 }
        ],

        coins: [
            { x: 350, y: 320 },
            { x: 665, y: 255 },
            { x: 955, y: 190 },
            { x: 1285, y: 295 },
            { x: 1635, y: 240 },
            { x: 1975, y: 175 },
            { x: 2435, y: 305 },
            { x: 2765, y: 240 },
            { x: 3115, y: 175 },
            { x: 3455, y: 285 }
        ],

        messageZones: [
            {
                id: "s3_goal_hint",
                x: 3500,
                y: 280,
                width: 220,
                height: 180,
                text: "ゴールするには全コインが必要だ！"
            }
        ],

        items: [],
        buttons: [],
        doors: [],

        goal: { x: 3660, y: 350, width: 70, height: 110 }
    }
];
