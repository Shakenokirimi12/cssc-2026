/*
============================================================
  2日目に編集するファイル

  settings.jsで置いたコイン、敵、エリア、アイテム、
  ボタンに触れたとき、「何を起こすか」をこのファイルで書きます。

  この完成版では、複数ステージでも同じstudent.jsを使います。
  game.stageNumberを調べると、現在のステージを判定できます。

  gameで使える主な命令
  game.showMessage("表示したい文");
  game.addScore(100);
  game.boostSpeed(1.5, 5);       // 1.5倍を5秒間
  game.openDoor("door1");
  game.closeDoor("door1");
  game.clear("クリア理由");

  gameから調べられる値
  game.stageNumber       現在のステージ番号
  game.stageName         現在のステージ名
  game.totalStages       全ステージ数
  game.totalCoins        ステージ内のコイン総数
  game.collectedCoins    取ったコイン数
  game.remainingCoins    残っているコイン数
  game.defeatedEnemies   倒した敵の数
  game.score             現在の得点
  game.timeLeft          残り時間
  game.lives             残機
============================================================
*/

// ----------------------------------------------------------
// 必要な変数は、この場所に作ります。
// letで作った変数は、イベントをまたいで値を覚えられます。
// ----------------------------------------------------------


// ==========================================================
// ゲーム開始時、または新しいステージ開始時に1回呼ばれます。
// ==========================================================
function studentOnGameStart(game) {
    // game.stageNameには、settings.jsで設定した名前が入っています。
    // 例: "STAGE 1"
    console.log(
        game.stageName + " を開始しました。" +
        " 全 " + game.totalStages + " ステージです。"
    );
}


// ==========================================================
// コインを1枚取るたびに呼ばれます。
// coinには、settings.jsのコイン1個分の情報が入ります。
// ==========================================================
function studentOnCoinCollected(game, coin) {
    // 最後のコインを取ったときだけメッセージを表示します。
    if (game.remainingCoins === 0) {
        game.showMessage("すべてのコインを集めた！", 2.5);
    }
}


// ==========================================================
// 敵を上から踏んで倒したときに呼ばれます。
// enemy.idを使うと、特定の敵だけ特別扱いできます。
// ==========================================================
function studentOnEnemyDefeated(game, enemy) {
    // 今回は標準の得点処理だけを使うため、追加処理はありません。
    // 例:
    // if (enemy.id === "boss") {
    //   game.addScore(1000);
    // }
}


// ==========================================================
// settings.jsのmessageZonesへ入った瞬間に呼ばれます。
// エリアから出て入り直すと、もう一度呼ばれます。
// ==========================================================
function studentOnEnterZone(game, zone) {
    // zone.textが設定されているエリアなら、その文章を表示します。
    if (zone.text) {
        game.showMessage(zone.text, 3);
    }
}


// ==========================================================
// settings.jsのitemsを取ったときに呼ばれます。
// この完成版では、type: "speed" のアイテムを実装しています。
// ==========================================================
function studentOnItemCollected(game, item) {
    if (item.type === "speed") {
        // settings.jsに値がない場合は、標準値を使います。
        const multiplier = item.multiplier || 1.5;
        const duration = item.duration || 5;

        game.boostSpeed(multiplier, duration);
    }
}


// ==========================================================
// settings.jsのbuttonsを踏んだときに呼ばれます。
// button.doorIdには、開ける扉のidが入っています。
// ==========================================================
function studentOnButtonPressed(game, button) {
    if (button.doorId) {
        game.openDoor(button.doorId);
    }
}


// ==========================================================
// プレイ中、毎フレーム呼ばれます。
// return true; にすると、その瞬間にステージクリアになります。
// ==========================================================
function studentCheckClear(game) {
    // 通常はsettings.jsの旗をゴールに使うため、falseを返します。
    // 例: スコア3000点でクリアする場合
    // return game.score >= 3000;

    return false;
}
