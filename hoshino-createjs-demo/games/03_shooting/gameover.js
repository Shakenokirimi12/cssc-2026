function showGameOver() {
    scene_id = 2;

    for (let e of enemyList) stage.removeChild(e);
    for (let b of bulletList) stage.removeChild(b);

    enemyList = [];
    bulletList = [];

    let go = new createjs.Text("Game Over!", "bold 44px sans-serif", "red");
    go.x = STAGE_W / 2 - go.getMeasuredWidth() / 2;
    go.y = STAGE_H / 2 - 40;
    stage.addChild(go);

    let sc = new createjs.Text("あなたのスコアは " + score + " でした。", "20px sans-serif", "white");
    sc.x = STAGE_W / 2 - sc.getMeasuredWidth() / 2;
    sc.y = STAGE_H / 2 + 20;
    stage.addChild(sc);

    stage.update();

    createjs.Ticker.removeAllEventListeners();
    stage.removeAllEventListeners();
}
