// ==========================================
// ★ メインループ (tick.js) ★
// handleTick は1秒に約60回呼ばれます。
// 「キーを読む → 動かす → 当たり判定 → 画面を更新」の順に進めます。
// ==========================================

function handleTick() {
  // タイトル・終了画面ではゲーム内の物体を動かさない
  if (isGameTitle || isGameOver || isTimeUp) {
    stage.update();
    return;
  }

  const now = Date.now();

  updatePlayer();
  updateTimer(now);

  // updateTimer の中で時間切れになったときは、ここで止める
  if (isTimeUp) {
    stage.update();
    return;
  }

  createItemWhenNeeded(now);
  updateItems(now);
  updateEffects();
  updateUserInterface();

  // 最後に画面を描き直す
  stage.update();
}

// 左右キーのフラグを見て、プレイヤーを動かす
function updatePlayer() {
  if (isPressLeft) {
    player.x -= playerMoveSpeed;
  }
  if (isPressRight) {
    player.x += playerMoveSpeed;
  }

  // 画面の外へ出ないようにする
  const halfWidth = playerWidth / 2;
  if (player.x < halfWidth) player.x = halfWidth;
  if (player.x > STAGE_W - halfWidth) player.x = STAGE_W - halfWidth;
}

// 残り時間を計算し、最後の10秒ならHURRY UP演出を始める
function updateTimer(now) {
  const elapsedSeconds = (now - gameStartTime) / 1000;
  timeLeft = Math.max(0, timeLimitSeconds - elapsedSeconds);

  if (!isHurryUp && timeLeft <= hurryUpSeconds) {
    isHurryUp = true;
    playSoundEffect("hurry");
    addFloatingText(STAGE_W / 2, 135, "HURRY UP! 落下速度2倍！", hurryUpColor, 28);
  }

  if (timeLeft <= 0) {
    gameOverByTime();
  }
}

// 出現間隔を過ぎたら、星か爆弾を1つ作る
function createItemWhenNeeded(now) {
  if (now - lastSpawnTime >= itemSpawnInterval) {
    createFallingItem();
    lastSpawnTime = now;
  }
}

// 星または爆弾を描いて、itemList に追加する
function createFallingItem() {
  const item = new createjs.Container();
  const isStar = Math.random() < starProbability;
  const radius = isStar ? starRadius : bombRadius;

  item.type = isStar ? "star" : "bomb";
  item.radius = radius;
  item.baseSpeed = itemFallSpeedMin + Math.random() * (itemFallSpeedMax - itemFallSpeedMin);
  item.x = radius + Math.random() * (STAGE_W - radius * 2);
  item.y = -radius - 5;
  item.rotationSpeed = (Math.random() - 0.5) * 4;

  if (isStar) {
    // material/star.png があれば画像、なければCreateJSの星形を使う。
    const starBitmap = createMaterialBitmap("star", radius * 2, radius * 2);
    if (starBitmap) {
      item.addChild(starBitmap);
    } else {
      const star = new createjs.Shape();
      star.graphics
        .beginFill("#ffd447")
        .beginStroke("#ffffff")
        .setStrokeStyle(2)
        .drawPolyStar(0, 0, radius, 5, 0.55, -90);
      item.addChild(star);
    }
  } else {
    // material/bomb.png があれば画像、なければCreateJSの爆弾形を使う。
    const bombBitmap = createMaterialBitmap("bomb", radius * 2, radius * 2);
    if (bombBitmap) {
      item.addChild(bombBitmap);
    } else {
      const bomb = new createjs.Shape();
      bomb.graphics
        .beginFill("#3b4051")
        .beginStroke("#ffffff")
        .setStrokeStyle(2)
        .drawCircle(0, 2, radius)
        .setStrokeStyle(3)
        .beginStroke("#ff8855")
        .moveTo(4, -radius + 1)
        .lineTo(11, -radius - 10);
      item.addChild(bomb);

      const spark = new createjs.Shape();
      spark.graphics.beginFill("#ffdc4e").drawCircle(13, -bombRadius - 12, 4);
      item.addChild(spark);
    }
  }

  itemLayer.addChild(item);
  itemList.push(item);
}

// すべての星・爆弾を下へ動かし、当たり判定を行う
function updateItems(now) {
  for (let i = itemList.length - 1; i >= 0; i--) {
    const item = itemList[i];
    const speedMultiplier = isHurryUp ? hurryUpSpeedMultiplier : 1;

    item.y += item.baseSpeed * speedMultiplier;
    item.rotation += item.rotationSpeed;

    if (isHitPlayer(item)) {
      if (item.type === "star") {
        catchStar(item, now);
      } else {
        removeItem(i);
        gameOverByBomb();
        return; // ゲーム終了後は他のアイテムを処理しない
      }
      continue;
    }

    // 画面の下まで落ちた星は取り逃し。コンボを切る演出にします。
    if (item.y - item.radius > STAGE_H) {
      if (item.type === "star" && comboCount > 0) {
        resetCombo();
      }
      removeItem(i);
    }
  }
}

// 円（アイテム）と長方形（プレイヤー）の簡単な当たり判定
function isHitPlayer(item) {
  const left = player.x - playerWidth / 2;
  const right = player.x + playerWidth / 2;
  const top = player.y - playerHeight / 2;
  const bottom = player.y + playerHeight / 2;

  // 円の中心に最も近い、長方形上の点を求める
  const nearestX = Math.max(left, Math.min(item.x, right));
  const nearestY = Math.max(top, Math.min(item.y, bottom));
  const dx = item.x - nearestX;
  const dy = item.y - nearestY;
  return dx * dx + dy * dy < item.radius * item.radius;
}

// 星を取ったときの処理
function catchStar(item, now) {
  // 前の星から時間が空きすぎたら、1コンボ目に戻す
  if (now - lastStarCatchTime > comboContinueMilliseconds) {
    comboCount = 0;
  }

  comboCount++;
  lastStarCatchTime = now;
  comboMultiplier = Math.min(
    1 + Math.floor((comboCount - 1) / comboStarsPerLevel),
    maxComboMultiplier
  );

  const gainedScore = starScore * comboMultiplier;
  score += gainedScore;
  playSoundEffect("star");
  addFloatingText(item.x, item.y, "+" + gainedScore, "#ffe36e", 22);

  // student.js は追加チャレンジ用。中身を変えて遊べます。
  studentOnCatchStar(item, gainedScore);

  const index = itemList.indexOf(item);
  if (index >= 0) removeItem(index);
}

// 星を逃したらコンボをリセット
function resetCombo() {
  if (comboCount >= comboStarsPerLevel) {
    addFloatingText(STAGE_W / 2, 105, "COMBO BREAK...", "#b9c9e9", 20);
  }
  comboCount = 0;
  comboMultiplier = 1;
  lastStarCatchTime = 0;
  studentOnMissStar();
}

// 配列と画面の両方からアイテムを消す
function removeItem(index) {
  const item = itemList[index];
  if (item) itemLayer.removeChild(item);
  itemList.splice(index, 1);
}

// ふわっと上に動きながら消える文字を作る
function addFloatingText(x, y, text, color, size) {
  const message = new createjs.Text(text, "bold " + size + "px Arial", color);
  message.textAlign = "center";
  message.x = x;
  message.y = y;
  message.life = 42; // 約0.7秒で消える
  effectLayer.addChild(message);
  effectList.push(message);
}

function updateEffects() {
  for (let i = effectList.length - 1; i >= 0; i--) {
    const effect = effectList[i];
    effect.y -= 1;
    effect.alpha = effect.life / 42;
    effect.life--;
    if (effect.life <= 0) {
      effectLayer.removeChild(effect);
      effectList.splice(i, 1);
    }
  }
}

// 表示用文字を、現在のゲームデータに合わせる
function updateUserInterface() {
  scoreBoard.text = "SCORE: " + score;
  timeBoard.text = "TIME: " + Math.ceil(timeLeft);

  if (comboCount >= 2) {
    comboBoard.text = comboCount + " COMBO  x" + comboMultiplier;
  } else {
    comboBoard.text = "";
  }

  if (isHurryUp) {
    hurryUpBoard.text = "HURRY UP!  SPEED x" + hurryUpSpeedMultiplier;
    // 点滅するように、透明度を少し変える
    hurryUpBoard.alpha = 0.55 + Math.abs(Math.sin(Date.now() / 120)) * 0.45;
  }
}
