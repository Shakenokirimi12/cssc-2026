(function () {
    "use strict";

    const SCREEN_W = 960;
    const SCREEN_H = 540;

    const DEFAULT_SETTINGS = {
        title: "SKY ADVENTURE",
        backgroundColor: "#7dd3fc",
        groundColor: "#7c4f2c",
        platformColor: "#4f8f46",
        playerColor: "#ffb703",
        enemyColor: "#e63946",
        playerMoveSpeed: 5,
        playerJumpPower: 15,
        gravity: 0.85,
        timeLimit: 90,
        startLives: 3,
        coinScore: 100,
        enemyScore: 200,
        goalScore: 1000,
        playerImage: "",
        enemyImage: "",
        soundEnabled: true,
        bgmEnabled: true,
        bgmTempo: 132,
        requireAllCoinsForGoal: false,
        worldWidth: 4200
    };

    const DEFAULT_STAGE = {
        start: { x: 80, y: 390 },
        floors: [{ x: 0, y: 460, width: 4200, height: 80 }],
        platforms: [],
        hazards: [],
        enemies: [],
        coins: [],
        messageZones: [],
        items: [],
        buttons: [],
        doors: [],
        goal: { x: 4000, y: 350, width: 70, height: 110 }
    };

    const settings = Object.assign({}, DEFAULT_SETTINGS, window.GAME_SETTINGS || {});

    /*
    ============================================================
      複数ステージを準備する処理
  
      settings.jsにwindow.STAGESがある場合は、その配列を使います。
      古い教材のwindow.STAGE_DATAしかない場合も動くように、
      1ステージだけの配列へ自動変換しています。
  
      配列番号は0から始まります。
      currentStageIndex = 0 は、画面上のSTAGE 1を表します。
    ============================================================
    */
    const stageList = normalizeStageList(window.STAGES, window.STAGE_DATA);
    let currentStageIndex = 0;
    let stageData = cloneStageData(stageList[currentStageIndex]);

    let stage;
    let world;
    let backgroundLayer;
    let terrainLayer;
    let objectLayer;
    let actorLayer;
    let uiLayer;

    let player;
    let staticSolids = [];
    let enemies = [];
    let coins = [];
    let hazards = [];
    let zones = [];
    let items = [];
    let buttons = [];
    let doors = [];
    let goal = null;

    let scoreText;
    let coinText;
    let timeText;
    let lifeText;
    let soundText;
    let titleText;
    let messageBox;
    let messageText;
    let resultLayer;

    let cameraX = 0;
    let jumpRequested = false;
    let studentApi = null;
    let state = null;

    const keys = Object.create(null);
    const audio = {
        context: null,
        enabled: Boolean(settings.soundEnabled),
        bgmEnabled: Boolean(settings.bgmEnabled),
        timer: null,
        noteIndex: 0
    };

    if (document.readyState === "complete") init();
    else window.addEventListener("load", init);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);

    function init() {
        try {
            if (!window.createjs) {
                throw new Error("CreateJSを読み込めませんでした。インターネット接続を確認してください。");
            }

            stage = new createjs.Stage("gameCanvas");
            if (createjs.Touch && typeof createjs.Touch.enable === "function") {
                createjs.Touch.enable(stage);
            }

            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            createjs.Ticker.framerate = 60;
            createjs.Ticker.addEventListener("tick", update);

            // 最初は配列番号0、つまりSTAGE 1を読み込みます。
            loadStage(0);
        } catch (error) {
            showError(error);
        }
    }

    /*
    ============================================================
      指定した番号のステージを読み込む関数
  
      stageIndexは画面に表示する番号ではなく、配列番号です。
      例: loadStage(0) -> STAGE 1
          loadStage(1) -> STAGE 2
  
      元のsettings.jsを書き換えないようにcloneStageDataでコピーし、
      その後startGame()で画面を作り直します。
    ============================================================
    */
    function loadStage(stageIndex) {
        if (stageIndex < 0 || stageIndex >= stageList.length) {
            return;
        }

        currentStageIndex = stageIndex;
        stageData = cloneStageData(stageList[currentStageIndex]);
        startGame();
    }

    function startGame() {
        stopBgm();
        stage.removeAllChildren();

        staticSolids = [];
        enemies = [];
        coins = [];
        hazards = [];
        zones = [];
        items = [];
        buttons = [];
        doors = [];
        goal = null;
        cameraX = 0;
        jumpRequested = false;

        state = {
            mode: "playing",
            score: 0,
            // ステージ側に値があれば優先し、なければGAME_SETTINGSを使います。
            lives: positiveInteger(stageData.startLives, positiveInteger(settings.startLives, 3)),
            timeLeft: positiveNumber(stageData.timeLimit, positiveNumber(settings.timeLimit, 90)),
            totalCoins: safeArray(stageData.coins).length,
            collectedCoins: 0,
            defeatedEnemies: 0,
            messageTimer: 0,
            goalMessageCooldown: 0,
            speedMultiplier: 1,
            speedBoostTimer: 0,
            invincibleTimer: 0,
            frame: 0
        };

        buildLayers();
        buildBackground();
        buildStage();
        buildPlayer();
        buildUI();
        createStudentApi();
        // ステージごとの説明文を表示します。
        showMessage(stageData.introMessage || "旗のあるゴールまで進もう！", 3.5);

        // student.jsへ「新しいステージが始まった」と知らせます。
        callStudentHook("studentOnGameStart", studentApi);
        updateUI();
        stage.update();
    }

    function buildLayers() {
        backgroundLayer = new createjs.Container();
        world = new createjs.Container();
        terrainLayer = new createjs.Container();
        objectLayer = new createjs.Container();
        actorLayer = new createjs.Container();
        uiLayer = new createjs.Container();

        world.addChild(terrainLayer, objectLayer, actorLayer);
        stage.addChild(backgroundLayer, world, uiLayer);
    }

    function buildBackground() {
        const sky = new createjs.Shape();
        sky.graphics.beginFill(settings.backgroundColor || DEFAULT_SETTINGS.backgroundColor)
            .drawRect(0, 0, SCREEN_W, SCREEN_H);
        backgroundLayer.addChild(sky);

        const sun = new createjs.Shape();
        sun.graphics.beginFill("#ffe66d").drawCircle(820, 95, 48);
        sun.alpha = 0.9;
        backgroundLayer.addChild(sun);

        const farMountains = new createjs.Shape();
        const g = farMountains.graphics;
        g.beginFill("#92c7a3")
            .moveTo(0, 420)
            .lineTo(130, 260)
            .lineTo(270, 420)
            .lineTo(420, 235)
            .lineTo(590, 420)
            .lineTo(760, 275)
            .lineTo(960, 420)
            .lineTo(960, 540)
            .lineTo(0, 540)
            .closePath();
        farMountains.alpha = 0.5;
        backgroundLayer.addChild(farMountains);

        for (let x = 120; x < getWorldWidth(); x += 560) {
            const cloud = createCloud();
            cloud.x = x;
            cloud.y = 80 + ((x / 7) % 130);
            objectLayer.addChild(cloud);
        }
    }

    function createCloud() {
        const cloud = new createjs.Container();
        const shape = new createjs.Shape();
        shape.graphics.beginFill("#ffffff")
            .drawCircle(0, 18, 24)
            .drawCircle(28, 0, 30)
            .drawCircle(60, 18, 26)
            .drawRoundRect(-18, 15, 100, 34, 17);
        shape.alpha = 0.75;
        cloud.addChild(shape);
        return cloud;
    }

    function buildStage() {
        for (const floor of safeArray(stageData.floors)) {
            addSolid(floor, settings.groundColor, true);
        }

        for (const platform of safeArray(stageData.platforms)) {
            addSolid(platform, settings.platformColor, false);
        }

        for (const hazardData of safeArray(stageData.hazards)) {
            addHazard(hazardData);
        }

        for (const coinData of safeArray(stageData.coins)) {
            addCoin(coinData);
        }

        for (const enemyData of safeArray(stageData.enemies)) {
            addEnemy(enemyData);
        }

        for (const zoneData of safeArray(stageData.messageZones)) {
            addMessageZone(zoneData);
        }

        for (const itemData of safeArray(stageData.items)) {
            addItem(itemData);
        }

        for (const doorData of safeArray(stageData.doors)) {
            addDoor(doorData);
        }

        for (const buttonData of safeArray(stageData.buttons)) {
            addButton(buttonData);
        }

        addGoal(stageData.goal || DEFAULT_STAGE.goal);
    }

    function addSolid(data, color, isGround) {
        const rect = normalizeRect(data, { x: 0, y: 460, width: 100, height: 80 });
        const shape = new createjs.Shape();
        shape.graphics.beginFill(color || "#6b4f35")
            .drawRect(0, 0, rect.width, rect.height);

        const top = new createjs.Shape();
        top.graphics.beginFill(isGround ? "#5cad48" : "#86c96f")
            .drawRect(0, 0, rect.width, Math.min(10, rect.height));

        const container = new createjs.Container();
        container.x = rect.x;
        container.y = rect.y;
        container.addChild(shape, top);
        terrainLayer.addChild(container);

        staticSolids.push(rect);
    }

    function addHazard(data) {
        const rect = normalizeRect(data, { x: 0, y: 430, width: 90, height: 30 });
        const shape = new createjs.Shape();
        const spikeWidth = 22;

        for (let x = 0; x < rect.width; x += spikeWidth) {
            shape.graphics.beginFill("#3d405b")
                .moveTo(x, rect.height)
                .lineTo(Math.min(x + spikeWidth / 2, rect.width), 0)
                .lineTo(Math.min(x + spikeWidth, rect.width), rect.height)
                .closePath();
        }

        shape.x = rect.x;
        shape.y = rect.y;
        objectLayer.addChild(shape);
        hazards.push({ rect, display: shape });
    }

    function addCoin(data) {
        const coin = {
            x: numberOr(data.x, 0),
            y: numberOr(data.y, 0),
            width: 24,
            height: 24,
            collected: false,
            data: Object.assign({}, data),
            display: new createjs.Container()
        };

        const outer = new createjs.Shape();
        outer.graphics.beginFill("#ffd166").beginStroke("#f59f00").setStrokeStyle(3)
            .drawCircle(12, 12, 10);
        const shine = new createjs.Shape();
        shine.graphics.beginFill("#fff4b8").drawRoundRect(8, 4, 5, 12, 2);
        coin.display.addChild(outer, shine);
        coin.display.x = coin.x;
        coin.display.y = coin.y;
        objectLayer.addChild(coin.display);
        coins.push(coin);
    }

    function addEnemy(data) {
        const enemy = {
            id: data.id || "enemy" + (enemies.length + 1),
            x: numberOr(data.x, 500),
            y: numberOr(data.y, 420),
            width: positiveNumber(data.width, 44),
            height: positiveNumber(data.height, 40),
            speed: positiveNumber(data.speed, 1.8),
            range: Math.max(0, numberOr(data.range, 100)),
            startX: numberOr(data.x, 500),
            direction: data.direction === -1 ? -1 : 1,
            defeated: false,
            data: Object.assign({}, data),
            display: createCharacterDisplay(
                positiveNumber(data.width, 44),
                positiveNumber(data.height, 40),
                data.color || settings.enemyColor,
                data.image || settings.enemyImage,
                "enemy"
            )
        };

        enemy.display.x = enemy.x;
        enemy.display.y = enemy.y;
        actorLayer.addChild(enemy.display);
        enemies.push(enemy);
    }

    function addMessageZone(data) {
        const rect = normalizeRect(data, { x: 0, y: 300, width: 180, height: 160 });
        const display = new createjs.Shape();
        display.graphics.beginFill("#ffffff").drawRect(0, 0, rect.width, rect.height);
        display.alpha = 0.06;
        display.x = rect.x;
        display.y = rect.y;
        objectLayer.addChild(display);

        zones.push({
            id: data.id || "zone" + (zones.length + 1),
            rect,
            entered: false,
            data: Object.assign({}, data),
            display
        });
    }

    function addItem(data) {
        const item = {
            id: data.id || "item" + (items.length + 1),
            type: data.type || "speed",
            x: numberOr(data.x, 0),
            y: numberOr(data.y, 0),
            width: 30,
            height: 30,
            collected: false,
            data: Object.assign({}, data),
            display: new createjs.Container()
        };

        const star = new createjs.Shape();
        const g = star.graphics.beginFill("#b5179e").beginStroke("#ffffff").setStrokeStyle(2);
        const cx = 15;
        const cy = 15;
        const outer = 14;
        const inner = 6;
        for (let i = 0; i < 10; i++) {
            const angle = -Math.PI / 2 + i * Math.PI / 5;
            const radius = i % 2 === 0 ? outer : inner;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath();

        item.display.addChild(star);
        item.display.x = item.x;
        item.display.y = item.y;
        objectLayer.addChild(item.display);
        items.push(item);
    }

    function addDoor(data) {
        const rect = normalizeRect(data, { x: 1000, y: 320, width: 50, height: 140 });
        const display = new createjs.Container();
        const body = new createjs.Shape();
        body.graphics.beginFill(data.color || "#5a189a")
            .beginStroke("#240046").setStrokeStyle(4)
            .drawRoundRect(0, 0, rect.width, rect.height, 8);
        const bars = new createjs.Shape();
        for (let x = 10; x < rect.width; x += 14) {
            bars.graphics.beginFill("#c77dff").drawRect(x, 8, 5, rect.height - 16);
        }
        display.addChild(body, bars);
        display.x = rect.x;
        display.y = rect.y;
        objectLayer.addChild(display);

        doors.push({
            id: data.id || "door" + (doors.length + 1),
            rect,
            open: Boolean(data.open),
            data: Object.assign({}, data),
            display
        });
    }

    function addButton(data) {
        const rect = normalizeRect(data, { x: 900, y: 440, width: 46, height: 20 });
        const display = new createjs.Container();
        const base = new createjs.Shape();
        base.graphics.beginFill("#495057").drawRoundRect(0, 8, rect.width, rect.height - 8, 4);
        const top = new createjs.Shape();
        top.graphics.beginFill("#ff4d6d").drawRoundRect(5, 0, rect.width - 10, 12, 6);
        display.addChild(base, top);
        display.x = rect.x;
        display.y = rect.y;
        objectLayer.addChild(display);

        buttons.push({
            id: data.id || "button" + (buttons.length + 1),
            rect,
            pressed: false,
            doorId: data.doorId || "",
            data: Object.assign({}, data),
            display,
            top
        });
    }

    function addGoal(data) {
        const rect = normalizeRect(data, DEFAULT_STAGE.goal);
        const display = new createjs.Container();

        const pole = new createjs.Shape();
        pole.graphics.beginFill("#495057").drawRect(8, 0, 8, rect.height);
        const flag = new createjs.Shape();
        flag.graphics.beginFill("#06d6a0")
            .moveTo(16, 8)
            .lineTo(rect.width, 28)
            .lineTo(16, 50)
            .closePath();
        const base = new createjs.Shape();
        base.graphics.beginFill("#495057").drawRoundRect(0, rect.height - 10, 34, 10, 4);
        display.addChild(pole, flag, base);
        display.x = rect.x;
        display.y = rect.y;
        objectLayer.addChild(display);

        goal = { rect, display };
    }

    function buildPlayer() {
        const start = stageData.start || DEFAULT_STAGE.start;
        player = {
            x: numberOr(start.x, 80),
            y: numberOr(start.y, 390),
            previousX: numberOr(start.x, 80),
            previousY: numberOr(start.y, 390),
            width: 42,
            height: 54,
            vx: 0,
            vy: 0,
            onGround: false,
            display: createCharacterDisplay(42, 54, settings.playerColor, settings.playerImage, "player")
        };

        player.display.x = player.x;
        player.display.y = player.y;
        actorLayer.addChild(player.display);
    }

    function createCharacterDisplay(width, height, color, imagePath, kind) {
        const container = new createjs.Container();
        const fallback = new createjs.Container();

        const body = new createjs.Shape();
        body.graphics.beginFill(color || "#ffb703")
            .beginStroke("#ffffff").setStrokeStyle(2)
            .drawRoundRect(0, 0, width, height, 9);
        fallback.addChild(body);

        const eyeColor = kind === "enemy" ? "#ffffff" : "#1d3557";
        const eye1 = new createjs.Shape();
        eye1.graphics.beginFill(eyeColor).drawCircle(width * 0.65, height * 0.28, 4);
        fallback.addChild(eye1);

        if (kind === "enemy") {
            const eye2 = new createjs.Shape();
            eye2.graphics.beginFill(eyeColor).drawCircle(width * 0.35, height * 0.28, 4);
            fallback.addChild(eye2);

            const mouth = new createjs.Shape();
            mouth.graphics.beginFill("#6a040f").drawRect(width * 0.25, height * 0.65, width * 0.5, 5);
            fallback.addChild(mouth);
        } else {
            const shoe = new createjs.Shape();
            shoe.graphics.beginFill("#023047").drawRoundRect(3, height - 8, width - 6, 8, 3);
            fallback.addChild(shoe);
        }

        container.addChild(fallback);

        if (typeof imagePath === "string" && imagePath.trim() !== "") {
            const bitmap = new createjs.Bitmap(imagePath.trim());
            bitmap.visible = false;
            container.addChild(bitmap);

            const image = bitmap.image;
            const onLoad = function () {
                if (!image.width || !image.height) return;
                bitmap.scaleX = width / image.width;
                bitmap.scaleY = height / image.height;
                bitmap.visible = true;
                fallback.visible = false;
            };

            if (image.complete && image.width) onLoad();
            else if (typeof image.addEventListener === "function") image.addEventListener("load", onLoad);
        }

        return container;
    }

    function buildUI() {
        const bar = new createjs.Shape();
        bar.graphics.beginFill("#102a43").drawRect(0, 0, SCREEN_W, 58);
        bar.alpha = 0.88;
        uiLayer.addChild(bar);

        // ゲーム名の後ろに、現在のステージ名も表示します。
        titleText = makeText(
            settings.title + " - " + getStageName(),
            "bold 22px sans-serif",
            "#ffffff",
            18,
            16
        );
        scoreText = makeText("", "bold 20px sans-serif", "#ffffff", 330, 17);
        coinText = makeText("", "bold 20px sans-serif", "#ffe66d", 500, 17);
        timeText = makeText("", "bold 20px sans-serif", "#ffffff", 650, 17);
        lifeText = makeText("", "bold 20px sans-serif", "#ffcad4", 780, 17);
        soundText = makeText("", "16px sans-serif", "#d9e7ff", 886, 19);
        uiLayer.addChild(titleText, scoreText, coinText, timeText, lifeText, soundText);

        messageBox = new createjs.Shape();
        messageBox.graphics.beginFill("#102a43").drawRoundRect(0, 0, 650, 56, 12);
        messageBox.x = 155;
        messageBox.y = 465;
        messageBox.alpha = 0;

        messageText = makeText("", "bold 22px sans-serif", "#ffffff", SCREEN_W / 2, 480);
        messageText.textAlign = "center";
        messageText.alpha = 0;
        uiLayer.addChild(messageBox, messageText);

        resultLayer = new createjs.Container();
        resultLayer.visible = false;
        uiLayer.addChild(resultLayer);
    }

    function makeText(text, font, color, x, y) {
        const object = new createjs.Text(text, font, color);
        object.x = x;
        object.y = y;
        object.textBaseline = "top";
        return object;
    }

    function update(event) {
        if (!stage || !state) return;

        const dt = Math.min(2.2, Math.max(0.25, (event.delta || 16.67) / 16.67));

        try {
            state.frame += 1;
            updateMessage(event.delta || 16.67);

            if (state.mode === "playing") {
                updatePlaying(dt, event.delta || 16.67);
            }

            updateCamera(dt);
            updateDisplayPositions();
            updateUI();
            stage.update(event);
        } catch (error) {
            showError(error);
            state.mode = "error";
        }
    }

    function updatePlaying(dt, deltaMs) {
        state.timeLeft -= deltaMs / 1000;
        state.goalMessageCooldown = Math.max(0, state.goalMessageCooldown - deltaMs / 1000);
        state.invincibleTimer = Math.max(0, state.invincibleTimer - dt);

        if (state.speedBoostTimer > 0) {
            state.speedBoostTimer -= deltaMs / 1000;
            if (state.speedBoostTimer <= 0) {
                state.speedMultiplier = 1;
                showMessage("スピードが元に戻った", 1.5);
            }
        }

        if (state.timeLeft <= 0) {
            state.timeLeft = 0;
            showGameOver("時間切れ！");
            return;
        }

        movePlayer(dt);
        updateEnemies(dt);
        updateCoins(dt);
        updateItems(dt);
        updateButtons();
        updateZones();
        checkHazards();
        checkGoal();

        const customClear = callStudentHook("studentCheckClear", studentApi);
        if (customClear === true && state.mode === "playing") {
            clearGame("オリジナルのクリア条件を達成！");
        }
    }

    function movePlayer(dt) {
        let inputX = 0;
        if (isDown("ArrowLeft", "KeyA")) inputX -= 1;
        if (isDown("ArrowRight", "KeyD")) inputX += 1;

        player.previousX = player.x;
        player.previousY = player.y;

        const moveSpeed = positiveNumber(settings.playerMoveSpeed, 5) * state.speedMultiplier;
        player.vx = inputX * moveSpeed;

        if (jumpRequested && player.onGround) {
            player.vy = -positiveNumber(settings.playerJumpPower, 15);
            player.onGround = false;
            playSound("jump");
        }
        jumpRequested = false;

        player.x += player.vx * dt;
        resolveHorizontalCollisions();

        player.vy += positiveNumber(settings.gravity, 0.85) * dt;
        player.vy = Math.min(player.vy, 22);
        player.y += player.vy * dt;
        player.onGround = false;
        resolveVerticalCollisions();

        player.x = clamp(player.x, 0, getWorldWidth() - player.width);

        if (player.y > SCREEN_H + 180) {
            loseLife("穴に落ちた！");
        }
    }

    function resolveHorizontalCollisions() {
        const playerRect = getPlayerRect();

        for (const solid of getActiveSolids()) {
            if (!overlaps(playerRect, solid)) continue;

            if (player.vx > 0) {
                player.x = solid.x - player.width;
            } else if (player.vx < 0) {
                player.x = solid.x + solid.width;
            }

            player.vx = 0;
            playerRect.x = player.x;
        }
    }

    function resolveVerticalCollisions() {
        const playerRect = getPlayerRect();
        const previousBottom = player.previousY + player.height;
        const previousTop = player.previousY;

        for (const solid of getActiveSolids()) {
            if (!overlaps(playerRect, solid)) continue;

            if (player.vy >= 0 && previousBottom <= solid.y + 10) {
                player.y = solid.y - player.height;
                player.vy = 0;
                player.onGround = true;
            } else if (player.vy < 0 && previousTop >= solid.y + solid.height - 10) {
                player.y = solid.y + solid.height;
                player.vy = 0;
            } else {
                const pushUp = (player.y + player.height) - solid.y;
                const pushDown = (solid.y + solid.height) - player.y;
                if (pushUp < pushDown) {
                    player.y -= pushUp;
                    player.vy = 0;
                    player.onGround = true;
                } else {
                    player.y += pushDown;
                    player.vy = 0;
                }
            }

            playerRect.y = player.y;
        }
    }

    function updateEnemies(dt) {
        for (const enemy of enemies) {
            if (enemy.defeated) continue;

            enemy.x += enemy.speed * enemy.direction * dt;
            if (enemy.x > enemy.startX + enemy.range) {
                enemy.x = enemy.startX + enemy.range;
                enemy.direction = -1;
            }
            if (enemy.x < enemy.startX - enemy.range) {
                enemy.x = enemy.startX - enemy.range;
                enemy.direction = 1;
            }

            const enemyRect = getEntityRect(enemy);
            if (!overlaps(getPlayerRect(), enemyRect)) continue;
            if (state.invincibleTimer > 0) continue;

            const previousBottom = player.previousY + player.height;
            const stomped = player.vy > 0 && previousBottom <= enemy.y + 14;

            if (stomped) {
                enemy.defeated = true;
                enemy.display.visible = false;
                player.y = enemy.y - player.height;
                player.vy = -positiveNumber(settings.playerJumpPower, 15) * 0.55;
                state.score += numberOr(settings.enemyScore, 200);
                state.defeatedEnemies += 1;
                playSound("stomp");
                showMessage("敵を踏んだ！ +" + numberOr(settings.enemyScore, 200), 1.2);
                callStudentHook("studentOnEnemyDefeated", studentApi, Object.assign({}, enemy.data, {
                    id: enemy.id,
                    speed: enemy.speed,
                    x: enemy.x,
                    y: enemy.y
                }));
            } else {
                loseLife("敵にぶつかった！");
                return;
            }
        }
    }

    function updateCoins(dt) {
        for (const coin of coins) {
            if (coin.collected) continue;
            coin.display.rotation += 3 * dt;

            if (!overlaps(getPlayerRect(), getEntityRect(coin))) continue;

            coin.collected = true;
            coin.display.visible = false;
            state.collectedCoins += 1;
            state.score += numberOr(settings.coinScore, 100);
            playSound("coin");
            callStudentHook("studentOnCoinCollected", studentApi, Object.assign({}, coin.data));
        }
    }

    function updateItems(dt) {
        for (const item of items) {
            if (item.collected) continue;
            item.display.rotation += 2 * dt;

            if (!overlaps(getPlayerRect(), getEntityRect(item))) continue;

            item.collected = true;
            item.display.visible = false;
            playSound("item");
            callStudentHook("studentOnItemCollected", studentApi, Object.assign({}, item.data, {
                id: item.id,
                type: item.type
            }));
        }
    }

    function updateButtons() {
        for (const button of buttons) {
            if (button.pressed) continue;
            if (!overlaps(getPlayerRect(), button.rect)) continue;

            button.pressed = true;
            button.top.y = 7;
            playSound("button");
            showMessage("ボタンを押した！", 1.2);
            callStudentHook("studentOnButtonPressed", studentApi, Object.assign({}, button.data, {
                id: button.id,
                doorId: button.doorId
            }));
        }
    }

    function updateZones() {
        for (const zone of zones) {
            const inside = overlaps(getPlayerRect(), zone.rect);
            if (inside && !zone.entered) {
                zone.entered = true;
                callStudentHook("studentOnEnterZone", studentApi, Object.assign({}, zone.data, {
                    id: zone.id
                }));
            }
            if (!inside) zone.entered = false;
        }
    }

    function checkHazards() {
        if (state.invincibleTimer > 0) return;

        for (const hazard of hazards) {
            if (overlaps(getPlayerRect(), hazard.rect)) {
                loseLife("トゲに当たった！");
                return;
            }
        }
    }

    function checkGoal() {
        if (!goal || !overlaps(getPlayerRect(), goal.rect)) return;

        const remaining = state.totalCoins - state.collectedCoins;

        // ステージ側にtrue/falseが書かれていれば、その設定を優先します。
        // これにより「STAGE 3だけ全コイン必須」のようにできます。
        const requireAllCoins = typeof stageData.requireAllCoinsForGoal === "boolean"
            ? stageData.requireAllCoinsForGoal
            : Boolean(settings.requireAllCoinsForGoal);

        if (requireAllCoins && remaining > 0) {
            if (state.goalMessageCooldown <= 0) {
                showMessage("コインがあと " + remaining + " 枚必要！", 2);
                state.goalMessageCooldown = 2;
            }
            return;
        }

        // ステージ側にgoalScoreを書けば、ステージ別の得点にもできます。
        state.score += numberOr(stageData.goalScore, numberOr(settings.goalScore, 1000));
        clearGame("ゴールに到着！");
    }

    function loseLife(reason) {
        if (state.mode !== "playing" || state.invincibleTimer > 0) return;

        state.lives -= 1;
        playSound("hurt");

        if (state.lives <= 0) {
            showGameOver(reason);
            return;
        }

        const start = stageData.start || DEFAULT_STAGE.start;
        player.x = numberOr(start.x, 80);
        player.y = numberOr(start.y, 390);
        player.previousX = player.x;
        player.previousY = player.y;
        player.vx = 0;
        player.vy = 0;
        state.invincibleTimer = 90;
        cameraX = 0;
        showMessage(reason + "　残り " + state.lives + "", 2);
    }

    function clearGame(reason) {
        if (state.mode !== "playing") return;

        playSound("clear");
        stopBgm();

        // currentStageIndexの次に、まだステージデータがあるか確認します。
        const hasNextStage = currentStageIndex + 1 < stageList.length;

        if (hasNextStage) {
            // 最終ステージではないため、ゲーム全体ではなくステージクリアです。
            state.mode = "stageclear";
            showResult("STAGE CLEAR!", reason, "#06d6a0");
        } else {
            // 配列の最後までクリアした場合だけ、GAME CLEARにします。
            state.mode = "clear";
            showResult("GAME CLEAR!", "すべてのステージをクリア！", "#06d6a0");
        }
    }

    function showGameOver(reason) {
        if (state.mode !== "playing") return;
        state.mode = "gameover";
        stopBgm();
        showResult("GAME OVER", reason, "#ff4d6d");
    }

    function showResult(heading, reason, accentColor) {
        resultLayer.removeAllChildren();
        resultLayer.visible = true;

        const shade = new createjs.Shape();
        shade.graphics.beginFill("#07111f").drawRect(0, 0, SCREEN_W, SCREEN_H);
        shade.alpha = 0.82;

        const panel = new createjs.Shape();
        panel.graphics.beginFill("#102a43").beginStroke(accentColor).setStrokeStyle(5)
            .drawRoundRect(210, 120, 540, 300, 22);

        const title = makeText(heading, "bold 54px sans-serif", accentColor, SCREEN_W / 2, 160);
        title.textAlign = "center";

        const detail = makeText(reason, "bold 24px sans-serif", "#ffffff", SCREEN_W / 2, 245);
        detail.textAlign = "center";

        const score = makeText("SCORE  " + state.score, "bold 30px sans-serif", "#ffe66d", SCREEN_W / 2, 300);
        score.textAlign = "center";

        // 途中のステージならNキー、ゲームオーバーや最終クリアならRキーを案内します。
        const operationText = state.mode === "stageclear"
            ? "Nキーで、次のステージへ"
            : "Rキーで、このステージをもう一度プレイ";

        const retry = makeText(operationText, "22px sans-serif", "#d9e7ff", SCREEN_W / 2, 360);
        retry.textAlign = "center";

        resultLayer.addChild(shade, panel, title, detail, score, retry);
    }

    function updateCamera(dt) {
        if (!player || !world) return;
        const maxCameraX = Math.max(0, getWorldWidth() - SCREEN_W);
        const target = clamp(player.x - SCREEN_W * 0.35, 0, maxCameraX);
        cameraX += (target - cameraX) * Math.min(1, 0.12 * dt);
        world.x = -Math.round(cameraX);
    }

    function updateDisplayPositions() {
        if (!player) return;
        player.display.x = player.x;
        player.display.y = player.y;
        player.display.alpha = state.invincibleTimer > 0 && Math.floor(state.frame / 5) % 2 === 0 ? 0.35 : 1;

        for (const enemy of enemies) {
            enemy.display.x = enemy.x;
            enemy.display.y = enemy.y;
        }

        for (const door of doors) {
            door.display.alpha = door.open ? 0.18 : 1;
        }
    }

    function updateUI() {
        if (!scoreText) return;
        scoreText.text = "SCORE " + state.score;
        coinText.text = "COIN " + state.collectedCoins + "/" + state.totalCoins;
        timeText.text = "TIME " + Math.max(0, Math.ceil(state.timeLeft));
        lifeText.text = "LIFE " + state.lives;
        soundText.text = audio.enabled ? "音 ON" : "音 OFF";
    }

    function showMessage(text, seconds) {
        if (!messageText || !messageBox) return;
        messageText.text = String(text);
        messageText.alpha = 1;
        messageBox.alpha = 0.9;
        state.messageTimer = positiveNumber(seconds, 2.2);
    }

    function updateMessage(deltaMs) {
        if (!state || state.messageTimer <= 0) return;
        state.messageTimer -= deltaMs / 1000;
        if (state.messageTimer <= 0) {
            messageText.alpha = 0;
            messageBox.alpha = 0;
        }
    }

    function createStudentApi() {
        studentApi = {
            showMessage(text, seconds) {
                showMessage(text, seconds);
            },
            addScore(points) {
                state.score += numberOr(points, 0);
                playSound("coin");
            },
            boostSpeed(multiplier, seconds) {
                state.speedMultiplier = Math.max(0.2, numberOr(multiplier, 1));
                state.speedBoostTimer = positiveNumber(seconds, 5);
                showMessage("移動速度が " + state.speedMultiplier + " 倍！", 2);
                playSound("item");
            },
            openDoor(id) {
                const door = doors.find(item => item.id === id);
                if (!door) {
                    showMessage("ドア " + id + " が見つかりません", 2.5);
                    return;
                }
                door.open = true;
                showMessage("ドアが開いた！", 2);
                playSound("door");
            },
            closeDoor(id) {
                const door = doors.find(item => item.id === id);
                if (door) door.open = false;
            },
            clear(reason) {
                clearGame(reason || "条件を達成！");
            }
        };

        Object.defineProperties(studentApi, {
            totalCoins: { get: () => state.totalCoins },
            collectedCoins: { get: () => state.collectedCoins },
            remainingCoins: { get: () => state.totalCoins - state.collectedCoins },
            defeatedEnemies: { get: () => state.defeatedEnemies },
            score: { get: () => state.score },
            timeLeft: { get: () => state.timeLeft },
            lives: { get: () => state.lives },

            // student.jsから現在のステージ情報を読めるようにします。
            stageNumber: { get: () => currentStageIndex + 1 },
            stageName: { get: () => getStageName() },
            totalStages: { get: () => stageList.length },
            hasNextStage: { get: () => currentStageIndex + 1 < stageList.length }
        });
    }

    function callStudentHook(name, ...args) {
        const hook = window[name];
        if (typeof hook !== "function") return undefined;

        try {
            return hook(...args);
        } catch (error) {
            showError(new Error(name + " の中でエラーが起きました。\n" + error.message));
            showMessage("student.js のエラーを確認しよう", 4);
            return undefined;
        }
    }

    function onKeyDown(event) {
        keys[event.code] = true;
        keys[event.key] = true;

        if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) {
            event.preventDefault();
        }

        ensureAudio();

        if (!event.repeat && ["ArrowUp", "KeyW", "Space"].includes(event.code)) {
            jumpRequested = true;
        }

        if (!event.repeat && event.code === "KeyR") {
            // 現在のステージを最初から作り直します。
            startGame();
        }

        if (
            !event.repeat &&
            event.code === "KeyN" &&
            state &&
            state.mode === "stageclear"
        ) {
            // STAGE CLEAR画面でだけ、次の配列要素へ進めます。
            loadStage(currentStageIndex + 1);
        }

        if (!event.repeat && event.code === "KeyM") {
            audio.enabled = !audio.enabled;
            if (audio.enabled) {
                ensureAudio();
                startBgm();
                playSound("button");
            } else {
                stopBgm();
            }
        }
    }

    function onKeyUp(event) {
        keys[event.code] = false;
        keys[event.key] = false;
    }

    function clearKeys() {
        for (const key of Object.keys(keys)) keys[key] = false;
    }

    function isDown(...codes) {
        return codes.some(code => Boolean(keys[code]));
    }

    function ensureAudio() {
        if (!audio.enabled) return;

        try {
            if (!audio.context) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                audio.context = new AudioContext();
            }

            if (audio.context.state === "suspended") {
                audio.context.resume();
            }

            startBgm();
        } catch (_) {
            // 音が使えない環境でもゲーム本体は続けます。
        }
    }

    function startBgm() {
        if (!audio.enabled || !audio.bgmEnabled || audio.timer || !audio.context) return;

        const tempo = clamp(positiveNumber(settings.bgmTempo, 132), 50, 240);
        const interval = 60000 / tempo;
        const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 392.0];

        audio.timer = window.setInterval(function () {
            if (!audio.enabled || !audio.context || state.mode !== "playing") return;
            playTone(notes[audio.noteIndex % notes.length], 0.11, "triangle", 0.035);
            if (audio.noteIndex % 2 === 0) playTone(notes[audio.noteIndex % notes.length] / 2, 0.08, "sine", 0.02);
            audio.noteIndex += 1;
        }, interval);
    }

    function stopBgm() {
        if (audio.timer) {
            clearInterval(audio.timer);
            audio.timer = null;
        }
    }

    function playSound(type) {
        if (!audio.enabled) return;
        ensureAudio();
        if (!audio.context) return;

        if (type === "jump") playTone(440, 0.09, "square", 0.05, 660);
        if (type === "coin") playTone(880, 0.08, "sine", 0.06, 1175);
        if (type === "stomp") playTone(180, 0.12, "square", 0.06, 120);
        if (type === "hurt") playTone(160, 0.25, "sawtooth", 0.06, 80);
        if (type === "item") playTone(660, 0.12, "triangle", 0.06, 990);
        if (type === "button") playTone(300, 0.09, "square", 0.05, 220);
        if (type === "door") playTone(220, 0.2, "triangle", 0.05, 440);
        if (type === "clear") {
            playTone(523.25, 0.16, "triangle", 0.06);
            window.setTimeout(() => playTone(659.25, 0.16, "triangle", 0.06), 140);
            window.setTimeout(() => playTone(783.99, 0.3, "triangle", 0.07), 280);
        }
    }

    function playTone(frequency, duration, wave, volume, endFrequency) {
        if (!audio.context || !audio.enabled) return;

        const now = audio.context.currentTime;
        const oscillator = audio.context.createOscillator();
        const gain = audio.context.createGain();
        oscillator.type = wave || "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume || 0.04), now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.connect(gain);
        gain.connect(audio.context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.03);
    }

    function getActiveSolids() {
        const solids = staticSolids.slice();
        for (const door of doors) {
            if (!door.open) solids.push(door.rect);
        }
        return solids;
    }

    function getPlayerRect() {
        return { x: player.x, y: player.y, width: player.width, height: player.height };
    }

    function getEntityRect(entity) {
        return { x: entity.x, y: entity.y, width: entity.width, height: entity.height };
    }

    function overlaps(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    function getWorldWidth() {
        // ステージごとに横幅を変えられるように、stageDataを先に確認します。
        return Math.max(
            SCREEN_W,
            positiveNumber(stageData.worldWidth, positiveNumber(settings.worldWidth, 4200))
        );
    }

    function getStageName() {
        // nameが省略された場合も、STAGE 1のような名前を自動生成します。
        return stageData.name || "STAGE " + (currentStageIndex + 1);
    }

    function normalizeRect(data, fallback) {
        const source = data || {};
        return {
            x: numberOr(source.x, fallback.x),
            y: numberOr(source.y, fallback.y),
            width: positiveNumber(source.width, fallback.width),
            height: positiveNumber(source.height, fallback.height)
        };
    }

    function numberOr(value, fallback) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    function positiveNumber(value, fallback) {
        const number = Number(value);
        return Number.isFinite(number) && number > 0 ? number : fallback;
    }

    function positiveInteger(value, fallback) {
        return Math.max(1, Math.floor(positiveNumber(value, fallback)));
    }

    function safeArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function normalizeStageList(stages, oldStageData) {
        // 新形式window.STAGESが正しく用意されていれば、そのまま使います。
        if (Array.isArray(stages) && stages.length > 0) {
            return stages;
        }

        // 古い形式window.STAGE_DATAも、1ステージとして引き続き使えます。
        if (oldStageData && typeof oldStageData === "object") {
            return [oldStageData];
        }

        // どちらもない場合は、安全のため標準ステージを1つ使います。
        return [DEFAULT_STAGE];
    }

    function cloneStageData(data) {
        try {
            return JSON.parse(JSON.stringify(data));
        } catch (_) {
            return JSON.parse(JSON.stringify(DEFAULT_STAGE));
        }
    }

    function showError(error) {
        console.error(error);
        if (typeof window.__showLessonError === "function") {
            window.__showLessonError(error && error.stack ? error.stack : String(error));
        }
    }
})();
