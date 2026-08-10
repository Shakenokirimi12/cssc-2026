//やってみよう   tick.jsのstudent.jsの関数たちのコメントアウトを外して、handleTick()の中で呼び出してみよう

// ball.vxの進行方向を反転させる関数　　すでにkey.js20~24行目でスペースキーが押されたときにボールの数だけ呼び出されているので、ここに関数の中身を作るだけでOK
function BallReverse(ball) {
    if (!ball) return; 
    //ここにball.vxを反転させる処理を書こう         ball.vxは速さ　handleTick()は毎フレームよばれるからball.xという位置をball.vx分だけ移動させる
}

// 右上に経過時間を表示する関数    init.jsの74～79行目で右上に置かれるように物体がおかれたので、ここに経過時間を表示する処理を作るだけでOK
function updateElapsedFrame() {
   //ここにtotalFrameの処理を書こう　
   timeBoard.text = "Time: " + (totalFrame / 60).toFixed(2); // 小数点以下2桁まで表示は変数.toFixed(2)
}

// もし方向キーを離したらゲームオーバーにする関数
function checkGameOver() {
    if (!paddle.noTouch /* && 〇〇 && 〇〇*/) {   // もし左キーも右キーも押されていなかったらという条件式を○○の変数を変えて書こう global.jsの下のほうに変数があるよ
        createjs.Sound.play("se_cat3"); // ゲームオーバー時の効果音を再生
        isGameOver = true;
    }
}







// ------------------------------------------
// ★ 改造　例
// ------------------------------------------

// 【ギミック１用】ボールの色を変える関数
function changeBallColorRandom(ball) {
  let colors = ["yellow", "cyan", "magenta", "lime", "orange"];
  let randomColor = colors[Math.floor(Math.random() * colors.length)];
  ball.graphics.clear().beginFill(randomColor).drawCircle(0, 0, ballRadius);
}

//  【ギミック１’用】ボールの色を変える関数（画像版）
function changeBallImageRandom(ball) {
  let ballImages = ["ball_red", "ball_blue", "ball_green", "ball_purple", "ball_yellow", "ball_pink", "ball_monochrome"];
  let randomImageId = ballImages[Math.floor(Math.random() * ballImages.length)];
  let randomImage = loader.getResult(randomImageId);

  if(ball.bitmap) {
    ball.removeChild(ball.bitmap); // 既存のビットマップを削除
  }
  let bitmap = new createjs.Bitmap(randomImage);
  ball.scaleX = 0.05;
  ball.scaleY = 0.05;
  bitmap.x = -bitmap.image.width * bitmap.scaleX / 2;
  bitmap.y = -bitmap.image.height * bitmap.scaleY / 2;

  ball.addChild(bitmap);
  ball.bitmap = bitmap; // 新しいビットマップを参照として保持
}

// ブロックヒット時に星型エフェクトを飛び散らせる関数
function createHitEffect(x, y) {
  let star = new createjs.Shape();
  // CreateJS特有の drawPolyStar 関数で星を描く
  star.graphics.beginFill("yellow").drawPolyStar(0, 0, 12, 5, 0.6, -90);
  star.x = x;
  star.y = y;
  stage.addChild(star);

  //少し浮き上がって消える
  createjs.Ticker.addEventListener("tick", function fade() {
    star.y -= 2;
    star.alpha -= 0.1;
    if (star.alpha <= 0) {
      stage.removeChild(star);
      createjs.Ticker.removeEventListener("tick", fade);
    }
  });
}



