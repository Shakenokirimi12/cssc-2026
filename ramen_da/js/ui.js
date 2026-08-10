

function resizeCanvas() {
    const rect = canvasWrapper.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    if (stage) {
        
        if (gameState === 'ready') showStartScreen();
        if (gameState === 'result') endGame(true); 
        stage.update();
    }
}

function handleLoadComplete() {
    document.getElementById('loading-text').style.display = 'none';
    
    gameState = 'ready';
    showStartScreen();
}

function showStartScreen() {
    stage.removeAllChildren();
    
    const title = new createjs.Text("ラーメン打", `bold ${canvas.width * 0.1}px 'Mochiy Pop One'`, "#a16207");
    title.x = canvas.width / 2;
    title.y = canvas.height * 0.2;
    title.textAlign = "center";
    title.shadow = new createjs.Shadow("#000000", 5, 5, 10);

    startText = new createjs.Text("クリックして開始", `${canvas.width * 0.04}px 'Mochiy Pop One'`, "#facc15");
    startText.x = canvas.width / 2;
    startText.y = canvas.height * 0.6;
    startText.textAlign = "center";
    startText.shadow = new createjs.Shadow("#000000", 3, 3, 5);
    
    createjs.Tween.get(startText, { loop: true }).to({ alpha: 0.2 }, 800).to({ alpha: 1 }, 800);

    stage.addChild(title, startText);
    stage.on("stagemousedown", startGame);
    stage.update();
}

function updateRamenText() {
    if (!currentTarget) return;
    const romajiText = currentTarget.getChildByName("romajiText");
    const originalText = currentTarget.wordData.romaji;
    const typedPart = originalText.substring(0, typedIndex);
    const remainingPart = originalText.substring(typedIndex);
    
    createjs.Tween.get(currentTarget).to({scale: 1.05}, 50).to({scale: 1}, 50);
    romajiText.text = typedPart.toUpperCase() + remainingPart;
}

function showAILoading(show) {
    aiLoadingOverlay.style.display = show ? 'flex' : 'none';
}
