window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

function handleKeyDown(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 90: case 32: // Zキー (90) または スペースキー (32)
            isPressShoot = true;
            if (scene_id === 0) {
                scene_id = 1;
                stage.removeChild(titleText);
                stage.removeChild(howToText);
                stage.removeChild(pressSpaceText);
                stage.addChild(player);
            }
            break;
        case 37: case 65: isPressLeft = true; break;
        case 39: case 68: isPressRight = true; break;
        case 38: case 87: isPressUp = true; break;
        case 40: case 83: isPressDown = true; break;
    }
}

function handleKeyUp(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 90: case 32: isPressShoot = false; break;
        case 37: case 65: isPressLeft = false; break;
        case 39: case 68: isPressRight = false; break;
        case 38: case 87: isPressUp = false; break;
        case 40: case 83: isPressDown = false; break;
    }
}
