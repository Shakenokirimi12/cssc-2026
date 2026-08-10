// ==========================================
// ★ メインループ＆当たり判定 (tick.js) ★ 1秒に60回呼ばれる関数
// ==========================================

function handleTick() {
  if (!isGameTitle && !isGameOver && !isGameClear && gameText) {
    gameText.visible = false;
  }
  //タイトル画面やゲームオーバー、クリアのときは処理を止めるためにここのif文でreturnをしてこれ以降の処理をさせないようにしてる
  if (isGameTitle || isGameOver || isGameClear) {
    checkGame();
    stage.update();
    return;
  }

  //============================
  //student.jsの関数たち
  //updateElapsedFrame();
  //checkGameOver();
  //============================


  // 1. パドルの移動処理
  if (isPressLeft && paddle.x > 0) {
    paddle.x -= paddleSpeed;
  }
  if (isPressRight && paddle.x < STAGE_W - paddleWidth) {
    paddle.x += paddleSpeed;
  }



  // 2. すべてのボールの移動＆当たり判定
  for (let i = ballList.length - 1; i >= 0; i--) {  // ballList.lengthを使ってすべてのボール　　　　　　後ろからループすることで削除時のインデックスずれを防ぐ
    let ball = ballList[i];
    if (!ball) continue;

    let prevX = ball.x;
    let prevY = ball.y;

    // 位置の更新　毎フレームhandleTick()が呼ばれるので、ボールの位置をvx,vy分だけ移動させる
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 壁との反射（左右・上）
    if (ball.x - ballRadius < 0) {
      ball.vx = Math.abs(ball.vx); // 左壁に当たったら右向きに反射
    }

    if (ball.x + ballRadius > STAGE_W) {
      ball.vx = -Math.abs(ball.vx); // 右壁に当たったら左向きに反射
    }

    if (ball.y - ballRadius < 0) {
      ball.vy *= -1;
    }

    // 落下（画面下へ抜けた場合）
    if (ball.y + ballRadius > STAGE_H) {
      stage.removeChild(ball);
      ballList.splice(i, 1);
      createjs.Sound.play("se_cat3"); // ネコ落下時の効果音を再生
      continue; // このボールの処理は終了
    }

    // --- パドルとの当たり判定 ---
    if (
      ball.y + ballRadius >= paddle.y &&
      ball.y - ballRadius <= paddle.y + paddleHeight &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddleWidth
    ) {
      ball.vy = -Math.abs(ball.vy); // 必ず上向きに反射
      createjs.Sound.play("se_collision"); // ネコヒット時の効果音を再生

                                                              // ★改造用フック①：パドルに当たったらボールの色をランダムに変える
      // 下の行の先頭の「//」を消してみよう！
       changeBallColorRandom(ball);
                                                              // ★改造用フック①'：パドルに当たったらボールの画像をランダムに変える
      // 下の行の先頭の「//」を消してみよう！
      // changeBallImageRandom(ball);
    }

    // --- ブロックとの当たり判定 ---
    for (let j = blockList.length - 1; j >= 0; j--) {  // 後ろからループすることで削除時のインデックスずれを防ぐ
      let block = blockList[j];
      if (!block) continue;

      // 簡易的な矩形と円の当たり判定
      if (
        ball.x + ballRadius > block.x &&
        ball.x - ballRadius < block.x + block.w &&
        ball.y + ballRadius > block.y &&
        ball.y - ballRadius < block.y + block.h
      ) {
        const hitFromLeft = prevX + ballRadius <= block.x && ball.x + ballRadius > block.x;
        const hitFromRight = prevX - ballRadius >= block.x + block.w && ball.x - ballRadius < block.x + block.w;
        const hitFromTop = prevY + ballRadius <= block.y && ball.y + ballRadius > block.y;
        const hitFromBottom = prevY - ballRadius >= block.y + block.h && ball.y - ballRadius < block.y + block.h;

        if (hitFromLeft || hitFromRight) ball.vx *= -1; // 左右からの衝突
        if (hitFromTop || hitFromBottom) ball.vy *= -1; // 上下からの衝突

        // 斜め衝突なら両方反転
        if ((hitFromLeft || hitFromRight) && (hitFromTop || hitFromBottom)) {
          ball.vx *= -1;
          ball.vy *= -1;
        }
        
        //if(ball.y > block.y && ball.y < block.y + block.h) ball.vx *= -1; // 左右の反射
        //if(ball.x > block.x && ball.x < block.x + block.w) ball.vy *= -1; // 上下の反射

        ball.x = prevX; // 衝突前の位置に戻すことで、ブロックに埋まるのを防ぐ
        ball.y = prevY; // 衝突前の位置に戻すことで、ブロックに埋まるのを防ぐ

        // ブロックの耐久力を減らす
        block.hp--;

                                                              // ★改造用フック②：ブロックヒット時に派手な星エフェクトを出す
        // 下の行の先頭の「//」を消してみよう！
        createHitEffect(block.x + block.w / 2, block.y + block.h / 2);

        if (block.hp <= 0) {
          // 耐久力が0になったら削除
          createjs.Sound.play("se_cat2"); // ネコ破壊時の効果音を再生
          stage.removeChild(block);
          blockList.splice(j, 1);
          score += 100;
        } else if (block.hp === 1) {
          // まだ壊れない場合（耐久2のブロック）は色（または画像）を変えて打撃感を出す  init.jsのcreateBlocksFromMap()で画像を使った場合はこっちの画像もコメントアウトを外そう
          createjs.Sound.play("se_cat1"); // ネコヒット時の効果音を再生
          //block.graphics.clear().beginFill(colorNormal).drawRect(0, 0, block.w, block.h); // 色版の場合
          block.image = loader.getResult(blockImgNormal); // 画像版の場合は画像を差し替える
          score += 50;
        } else {
          createjs.Sound.play("se_cat3");
          score += 50;
        }

        scoreBoard.text = "SCORE: " + score;
        break; // 1フレームで複数のブロックに当たらないよう抜ける
      }
    }
  }





  // 3. 勝敗判定
  if (ballList.length === 0) {
    isGameOver = true; 
  } else if (blockList.length === 0) {
    isGameClear = true;   
  }

  // 画面の更新
  stage.update();
}

// メッセージ表示用補助関数
function showGameText(msg, colorStr) {
  if (!gameText) {
    gameText = new createjs.Text(msg, "50px Arial", colorStr);
    gameText.textAlign = "center";
    gameText.textBaseline = "middle";
    gameText.x = STAGE_W / 2;
    gameText.y = STAGE_H / 2;
    stage.addChild(gameText);
  }

  gameText.text = msg;
  gameText.color = colorStr;
  gameText.visible = true;
}

//勝敗関数
function checkGame() {
  if(isGameTitle) {
    showGameText("PRESS SPACE KEY", "white");
  } else if(isGameOver) {
    showGameText("GAME OVER", "red");
  } else if(isGameClear) {
    showGameText("CLEAR!!", "gold");
  }
}