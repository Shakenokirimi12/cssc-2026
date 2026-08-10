function init() {
    
    canvasWrapper = document.getElementById('canvas-wrapper');
    canvas = document.getElementById('gameCanvas');

    resizeCanvas();
    stage = new createjs.Stage("gameCanvas");
    createjs.Touch.enable(stage);
    setupSounds();

    handleLoadComplete();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener("keydown", handleKeyDown);
}


window.onload = init;
