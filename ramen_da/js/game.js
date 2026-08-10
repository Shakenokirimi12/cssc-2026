

function startGame() {
    if (gameState !== 'ready' && gameState !== 'result') return;
    
    stage.off("stagemousedown", startGame);
    gameState = 'playing';
    
    
    score = 0;
    timeLeft = 60;
    ramenList = [];
    currentTarget = null;
    typedIndex = 0;
    sessionWordList = [...wordList]; 
    stage.removeAllChildren();

    
    Tone.Transport.start();
    new Tone.Loop(time => {
        bgm.triggerAttackRelease("C1", "8n", time);
    }, "4n").start(0);

    
    scoreText = new createjs.Text(`スコア: ${score}`, `${canvas.width * 0.035}px 'Mochiy Pop One'`, "#4d2c0b");
    scoreText.x = canvas.width * 0.05;
    scoreText.y = canvas.height * 0.05;

    timeText = new createjs.Text(`残り時間: ${timeLeft}`, `${canvas.width * 0.035}px 'Mochiy Pop One'`, "#4d2c0b");
    timeText.x = canvas.width * 0.95;
    timeText.y = canvas.height * 0.05;
    timeText.textAlign = "right";
    
    stage.addChild(scoreText, timeText);

    
    timerInterval = setInterval(() => {
        timeLeft--;
        timeText.text = `残り時間: ${timeLeft}`;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on("tick", handleTick);
}

function handleTick() {
    if (gameState !== 'playing') return;

    
    ramenList.forEach((ramen, index) => {
        ramen.x -= ramen.speed;
        if (ramen.x < -ramen.getBounds().width) {
            stage.removeChild(ramen);
            ramenList.splice(index, 1);
            if (currentTarget === ramen) {
                currentTarget = null;
                typedIndex = 0;
            }
        }
    });

    
    if (ramenList.length === 0) {
        spawnRamen();
    }
    
    stage.update();
}

function endGame(isResize = false) {
    if (!isResize) {
        gameState = 'result';
        clearInterval(timerInterval);
        createjs.Ticker.off("tick", handleTick);
        Tone.Transport.stop();
    }
    
    stage.removeAllChildren();
    resultContainer = new createjs.Container();
    
    const bg = new createjs.Shape();
    bg.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0, 0, canvas.width, canvas.height);
    
    const resultTitle = new createjs.Text("結果", `bold ${canvas.width * 0.1}px 'Mochiy Pop One'`, "#facc15");
    resultTitle.textAlign = "center";
    resultTitle.x = canvas.width / 2;
    resultTitle.y = canvas.height * 0.15;

    const finalScoreText = new createjs.Text(`スコア: ${score}`, `${canvas.width * 0.06}px 'Mochiy Pop One'`, "#ffffff");
    finalScoreText.textAlign = "center";
    finalScoreText.x = canvas.width / 2;
    finalScoreText.y = canvas.height * 0.5; 
    
    const retryText = new createjs.Text("もう一杯？ (クリック)", `${canvas.width * 0.04}px 'Mochiy Pop One'`, "#fde047");
    retryText.textAlign = "center";
    retryText.x = canvas.width / 2;
    retryText.y = canvas.height * 0.7; 
    
    resultContainer.addChild(bg, resultTitle, finalScoreText, retryText);
    stage.addChild(resultContainer);
    stage.update();
    
    if (!isResize) {
        setTimeout(() => {
            gameState = 'ready';
            stage.on("stagemousedown", startGame);
        }, 500);
    }
}
