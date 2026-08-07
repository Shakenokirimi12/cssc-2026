(function () {
  "use strict";

  const S = window.DEMO_SETTINGS;
  const canvas = document.getElementById("gameCanvas");
  const stage = new createjs.Stage(canvas);
  createjs.Touch.enable(stage);

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const keys = Object.create(null);
  const pressed = Object.create(null);

  const backgroundShape = new createjs.Shape();
  const worldShape = new createjs.Shape();
  const effectShape = new createjs.Shape();
  const hudShape = new createjs.Shape();
  const titleText = new createjs.Text(S.title, "bold 25px Yu Gothic", "#ffffff");
  const helpText = new createjs.Text("WASD / 矢印: 移動   SPACE: ジャンプ   SHIFT: ダッシュ   R: やり直し", "15px Yu Gothic", "#ffffff");
  const statusText = new createjs.Text("", "bold 18px Yu Gothic", "#ffffff");
  const dashText = new createjs.Text("DASH", "bold 14px Yu Gothic", "#ffffff");
  const centerText = new createjs.Text("", "bold 42px Yu Gothic", "#ffffff");
  const subText = new createjs.Text("", "20px Yu Gothic", "#ffffff");

  titleText.x = 22;
  titleText.y = 16;
  helpText.x = 22;
  helpText.y = 49;
  statusText.x = 22;
  statusText.y = 79;
  dashText.x = WIDTH - 210;
  dashText.y = 29;
  centerText.textAlign = "center";
  centerText.textBaseline = "middle";
  centerText.x = WIDTH / 2;
  centerText.y = HEIGHT / 2 - 20;
  subText.textAlign = "center";
  subText.textBaseline = "middle";
  subText.x = WIDTH / 2;
  subText.y = HEIGHT / 2 + 34;

  stage.addChild(backgroundShape, worldShape, effectShape, hudShape, titleText, helpText, statusText, dashText, centerText, subText);

  const state = {
    mode: "playing",
    score: 0,
    defeated: 0,
    totalEnemies: S.enemies.length,
    camera: {
      x: S.start.x - S.camera.distanceX,
      y: S.camera.height,
      z: S.camera.distanceZ,
      targetX: S.start.x + S.camera.lookAhead,
      targetY: 1.1,
      targetZ: 0
    },
    particles: [],
    dashTrails: [],
    flash: 0,
    messageTimer: 2.3
  };

  const player = {
    x: S.start.x,
    y: S.start.y,
    z: S.start.z,
    prevY: S.start.y,
    vx: 0,
    vy: 0,
    vz: 0,
    onGround: false,
    dashEnergy: 1,
    dashActive: false,
    facingX: 1
  };

  let enemies = [];

  function resetGame(showMessage) {
    player.x = S.start.x;
    player.y = S.start.y;
    player.z = S.start.z;
    player.prevY = S.start.y;
    player.vx = 0;
    player.vy = 0;
    player.vz = 0;
    player.onGround = false;
    player.dashEnergy = 1;
    player.dashActive = false;
    player.facingX = 1;

    enemies = S.enemies.map(function (enemy, index) {
      return {
        id: index,
        x: enemy.x,
        z: enemy.z,
        startX: enemy.x,
        patrol: enemy.patrol,
        speed: enemy.speed,
        direction: index % 2 === 0 ? 1 : -1,
        y: findSurfaceTop(enemy.x, enemy.z) + 0.62,
        width: 1.05,
        height: 1.24,
        depth: 1.05,
        alive: true,
        hitTimer: 0
      };
    });

    state.mode = "playing";
    state.score = 0;
    state.defeated = 0;
    state.particles.length = 0;
    state.dashTrails.length = 0;
    state.flash = 0;
    state.messageTimer = showMessage ? 1.4 : 2.3;
    centerText.text = showMessage ? "もう一度！" : "旗を目指そう！";
    subText.text = "敵は上から踏むと倒せます";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function length3(v) {
    return Math.hypot(v.x, v.y, v.z);
  }

  function normalize(v) {
    const len = length3(v) || 1;
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  }

  function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  function cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  function hexToRgb(hex) {
    const value = String(hex).replace("#", "");
    const full = value.length === 3
      ? value.split("").map(function (c) { return c + c; }).join("")
      : value;
    const number = parseInt(full, 16);
    return {
      r: (number >> 16) & 255,
      g: (number >> 8) & 255,
      b: number & 255
    };
  }

  function shade(hex, amount) {
    const rgb = hexToRgb(hex);
    const target = amount < 0 ? 0 : 255;
    const ratio = Math.abs(amount);
    const r = Math.round(rgb.r + (target - rgb.r) * ratio);
    const g = Math.round(rgb.g + (target - rgb.g) * ratio);
    const b = Math.round(rgb.b + (target - rgb.b) * ratio);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function cameraBasis() {
    const cam = state.camera;
    const forward = normalize({
      x: cam.targetX - cam.x,
      y: cam.targetY - cam.y,
      z: cam.targetZ - cam.z
    });
    const right = normalize(cross(forward, { x: 0, y: 1, z: 0 }));
    const up = normalize(cross(right, forward));
    return { forward: forward, right: right, up: up };
  }

  function project(point, basis) {
    const cam = state.camera;
    const rel = { x: point.x - cam.x, y: point.y - cam.y, z: point.z - cam.z };
    const cx = dot(rel, basis.right);
    const cy = dot(rel, basis.up);
    const cz = dot(rel, basis.forward);

    if (cz <= 0.2) return null;

    const scale = S.camera.focalLength / cz;
    return {
      x: WIDTH * 0.5 + cx * scale,
      y: HEIGHT * 0.56 - cy * scale,
      depth: cz,
      scale: scale
    };
  }

  function pointInsidePlatformXZ(x, z, platform, inset) {
    const margin = inset || 0;
    return x >= platform.x - platform.width / 2 + margin &&
           x <= platform.x + platform.width / 2 - margin &&
           z >= platform.z - platform.depth / 2 + margin &&
           z <= platform.z + platform.depth / 2 - margin;
  }

  function findSurfaceTop(x, z) {
    let top = -999;
    for (const platform of S.platforms) {
      if (pointInsidePlatformXZ(x, z, platform, 0.02)) {
        top = Math.max(top, platform.y + platform.height / 2);
      }
    }
    return top;
  }

  function getBoxFaces(box, baseColor, basis) {
    const x0 = box.x - box.width / 2;
    const x1 = box.x + box.width / 2;
    const y0 = box.y - box.height / 2;
    const y1 = box.y + box.height / 2;
    const z0 = box.z - box.depth / 2;
    const z1 = box.z + box.depth / 2;

    const vertices = {
      a: { x: x0, y: y0, z: z0 }, b: { x: x1, y: y0, z: z0 },
      c: { x: x1, y: y1, z: z0 }, d: { x: x0, y: y1, z: z0 },
      e: { x: x0, y: y0, z: z1 }, f: { x: x1, y: y0, z: z1 },
      g: { x: x1, y: y1, z: z1 }, h: { x: x0, y: y1, z: z1 }
    };

    const definitions = [
      { ids: ["d", "c", "g", "h"], normal: { x: 0, y: 1, z: 0 }, color: shade(baseColor, 0.14) },
      { ids: ["a", "e", "f", "b"], normal: { x: 0, y: -1, z: 0 }, color: shade(baseColor, -0.35) },
      { ids: ["a", "d", "h", "e"], normal: { x: -1, y: 0, z: 0 }, color: shade(baseColor, -0.20) },
      { ids: ["b", "f", "g", "c"], normal: { x: 1, y: 0, z: 0 }, color: shade(baseColor, -0.05) },
      { ids: ["e", "h", "g", "f"], normal: { x: 0, y: 0, z: 1 }, color: shade(baseColor, -0.12) },
      { ids: ["a", "b", "c", "d"], normal: { x: 0, y: 0, z: -1 }, color: shade(baseColor, -0.28) }
    ];

    const faces = [];
    for (const definition of definitions) {
      const points3 = definition.ids.map(function (id) { return vertices[id]; });
      const center = points3.reduce(function (acc, p) {
        acc.x += p.x / 4;
        acc.y += p.y / 4;
        acc.z += p.z / 4;
        return acc;
      }, { x: 0, y: 0, z: 0 });
      const toCamera = {
        x: state.camera.x - center.x,
        y: state.camera.y - center.y,
        z: state.camera.z - center.z
      };
      if (dot(definition.normal, toCamera) <= 0) continue;

      const projected = points3.map(function (p) { return project(p, basis); });
      if (projected.some(function (p) { return !p; })) continue;

      faces.push({
        type: "polygon",
        points: projected,
        depth: projected.reduce(function (sum, p) { return sum + p.depth; }, 0) / projected.length,
        color: definition.color,
        stroke: "rgba(0,0,0,0.18)"
      });
    }
    return faces;
  }

  function addBillboard(drawables, point, radius, color, basis, stroke) {
    const projected = project(point, basis);
    if (!projected) return;
    drawables.push({
      type: "circle",
      x: projected.x,
      y: projected.y,
      radius: Math.max(1.5, radius * projected.scale),
      depth: projected.depth,
      color: color,
      stroke: stroke || null
    });
  }

  function addLine(drawables, a, b, width, color, basis) {
    const pa = project(a, basis);
    const pb = project(b, basis);
    if (!pa || !pb) return;
    drawables.push({
      type: "line",
      a: pa,
      b: pb,
      width: Math.max(1, width * (pa.scale + pb.scale) * 0.5),
      depth: (pa.depth + pb.depth) * 0.5,
      color: color
    });
  }

  function addFlag(drawables, basis) {
    const goal = S.goal;
    const poleBottom = { x: goal.x, y: goal.y, z: goal.z };
    const poleTop = { x: goal.x, y: goal.y + goal.height, z: goal.z };
    addLine(drawables, poleBottom, poleTop, 0.055, S.colors.pole, basis);

    const p1 = project({ x: goal.x, y: goal.y + goal.height - 0.25, z: goal.z }, basis);
    const p2 = project({ x: goal.x + 2.0, y: goal.y + goal.height - 0.8, z: goal.z }, basis);
    const p3 = project({ x: goal.x, y: goal.y + goal.height - 1.55, z: goal.z }, basis);
    if (p1 && p2 && p3) {
      drawables.push({
        type: "polygon",
        points: [p1, p2, p3],
        depth: (p1.depth + p2.depth + p3.depth) / 3,
        color: S.colors.flag,
        stroke: "rgba(90,70,0,0.35)"
      });
    }
  }

  function drawSky() {
    const g = backgroundShape.graphics;
    g.clear();
    g.beginFill(S.colors.sky).drawRect(0, 0, WIDTH, HEIGHT * 0.72);
    g.beginFill(S.colors.skyBottom).drawRect(0, HEIGHT * 0.72, WIDTH, HEIGHT * 0.28);

    g.beginFill("rgba(255,255,255,0.76)").drawCircle(120, 105, 34);
    g.beginFill("rgba(255,255,255,0.76)").drawCircle(156, 98, 43);
    g.beginFill("rgba(255,255,255,0.76)").drawCircle(198, 111, 31);

    g.beginFill("rgba(255,255,255,0.48)").drawCircle(730, 86, 25);
    g.beginFill("rgba(255,255,255,0.48)").drawCircle(760, 79, 34);
    g.beginFill("rgba(255,255,255,0.48)").drawCircle(795, 91, 24);
  }

  function drawWorld() {
    const basis = cameraBasis();
    const drawables = [];

    for (const platform of S.platforms) {
      const color = platform.type === "block" ? S.colors.blockSide : S.colors.groundSide;
      const faces = getBoxFaces(platform, color, basis);
      for (const face of faces) {
        if (face.type === "polygon" && face.points.length === 4) {
          const averageY = face.points.reduce(function (sum, p) { return sum + p.y; }, 0) / 4;
          const isTop = averageY < HEIGHT * 0.62 && platform.type === "ground";
          if (isTop && face.color === shade(color, 0.14)) face.color = S.colors.groundTop;
          if (platform.type === "block" && face.color === shade(color, 0.14)) face.color = S.colors.blockTop;
        }
        drawables.push(face);
      }
    }

    addFlag(drawables, basis);

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const enemyBox = {
        x: enemy.x, y: enemy.y, z: enemy.z,
        width: enemy.width, height: enemy.height, depth: enemy.depth
      };
      drawables.push.apply(drawables, getBoxFaces(enemyBox, S.colors.enemy, basis));

      const eyeY = enemy.y + 0.18;
      addBillboard(drawables, { x: enemy.x + 0.18, y: eyeY, z: enemy.z + 0.53 }, 0.07, "#ffffff", basis);
      addBillboard(drawables, { x: enemy.x - 0.18, y: eyeY, z: enemy.z + 0.53 }, 0.07, "#ffffff", basis);
      addBillboard(drawables, { x: enemy.x + 0.18, y: eyeY, z: enemy.z + 0.55 }, 0.035, "#191919", basis);
      addBillboard(drawables, { x: enemy.x - 0.18, y: eyeY, z: enemy.z + 0.55 }, 0.035, "#191919", basis);
    }

    const bodyY = player.y - 0.13;
    const playerBody = {
      x: player.x, y: bodyY, z: player.z,
      width: S.player.width, height: 1.02, depth: S.player.depth
    };
    const playerHead = {
      x: player.x, y: player.y + 0.63, z: player.z,
      width: 0.68, height: 0.57, depth: 0.68
    };
    drawables.push.apply(drawables, getBoxFaces(playerBody, S.colors.player, basis));
    drawables.push.apply(drawables, getBoxFaces(playerHead, S.colors.playerHead, basis));

    addBillboard(drawables, { x: player.x + 0.15, y: player.y + 0.72, z: player.z + 0.35 }, 0.045, "#202020", basis);
    addBillboard(drawables, { x: player.x - 0.15, y: player.y + 0.72, z: player.z + 0.35 }, 0.045, "#202020", basis);

    for (const trail of state.dashTrails) {
      const projected = project({ x: trail.x, y: trail.y, z: trail.z }, basis);
      if (!projected) continue;
      drawables.push({
        type: "circle",
        x: projected.x,
        y: projected.y,
        radius: Math.max(2, trail.size * projected.scale),
        depth: projected.depth + 0.1,
        color: "rgba(36,120,255," + clamp(trail.life * 0.45, 0, 0.45) + ")"
      });
    }

    for (const particle of state.particles) {
      addBillboard(
        drawables,
        { x: particle.x, y: particle.y, z: particle.z },
        particle.size,
        "rgba(" + particle.r + "," + particle.g + "," + particle.b + "," + clamp(particle.life, 0, 1) + ")",
        basis
      );
    }

    drawables.sort(function (a, b) { return b.depth - a.depth; });

    const g = worldShape.graphics;
    g.clear();
    for (const item of drawables) {
      if (item.type === "polygon") {
        g.beginFill(item.color);
        if (item.stroke) g.beginStroke(item.stroke).setStrokeStyle(1);
        g.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          g.lineTo(item.points[i].x, item.points[i].y);
        }
        g.closePath();
        g.endFill();
        if (item.stroke) g.endStroke();
      } else if (item.type === "circle") {
        g.beginFill(item.color);
        if (item.stroke) g.beginStroke(item.stroke).setStrokeStyle(1);
        g.drawCircle(item.x, item.y, item.radius);
        g.endFill();
        if (item.stroke) g.endStroke();
      } else if (item.type === "line") {
        g.beginStroke(item.color).setStrokeStyle(item.width);
        g.moveTo(item.a.x, item.a.y).lineTo(item.b.x, item.b.y);
        g.endStroke();
      }
    }
  }

  function drawHud() {
    const g = hudShape.graphics;
    g.clear();

    g.beginFill("rgba(8,18,35,0.70)").drawRoundRect(12, 10, 585, 100, 12);
    g.beginFill("rgba(8,18,35,0.70)").drawRoundRect(WIDTH - 230, 14, 210, 70, 12);

    const barX = WIDTH - 210;
    const barY = 53;
    const barW = 165;
    g.beginFill("rgba(255,255,255,0.22)").drawRoundRect(barX, barY, barW, 14, 7);
    g.beginFill(player.dashActive ? "#fff27a" : "#67e8f9").drawRoundRect(barX, barY, barW * player.dashEnergy, 14, 7);

    if (state.flash > 0) {
      g.beginFill("rgba(255,255,255," + clamp(state.flash, 0, 0.55) + ")").drawRect(0, 0, WIDTH, HEIGHT);
    }

    statusText.text = "倒した敵  " + state.defeated + " / " + state.totalEnemies + "    SCORE  " + state.score;

    helpText.text = "WASD / 矢印: 移動   SPACE: ジャンプ   SHIFT: ダッシュ   R: やり直し";

    if (state.messageTimer > 0) {
      centerText.visible = true;
      subText.visible = true;
    } else if (state.mode === "clear") {
      centerText.visible = true;
      subText.visible = true;
      centerText.text = "GOAL!";
      subText.text = "授業で学ぶと、こんなゲームも作れます！  Rで再挑戦";
    } else {
      centerText.visible = false;
      subText.visible = false;
    }
  }

  function emitParticles(x, y, z, color, count) {
    const rgb = hexToRgb(color);
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x: x,
        y: y,
        z: z,
        vx: (Math.random() - 0.5) * 5.5,
        vy: 3.0 + Math.random() * 4.0,
        vz: (Math.random() - 0.5) * 5.5,
        size: 0.055 + Math.random() * 0.055,
        life: 0.7 + Math.random() * 0.45,
        r: rgb.r,
        g: rgb.g,
        b: rgb.b
      });
    }
  }

  function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.vy -= 11 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.life -= dt * 1.15;
      if (p.life <= 0) state.particles.splice(i, 1);
    }

    for (let i = state.dashTrails.length - 1; i >= 0; i--) {
      const trail = state.dashTrails[i];
      trail.life -= dt * 2.2;
      trail.size += dt * 0.22;
      if (trail.life <= 0) state.dashTrails.splice(i, 1);
    }
  }

  function updateEnemies(dt) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.x += enemy.direction * enemy.speed * dt;
      if (Math.abs(enemy.x - enemy.startX) > enemy.patrol) {
        enemy.x = enemy.startX + Math.sign(enemy.x - enemy.startX) * enemy.patrol;
        enemy.direction *= -1;
      }
      enemy.y = findSurfaceTop(enemy.x, enemy.z) + enemy.height / 2;
      enemy.hitTimer = Math.max(0, enemy.hitTimer - dt);
    }
  }

  function axis(positiveKeys, negativeKeys) {
    const positive = positiveKeys.some(function (key) { return keys[key]; }) ? 1 : 0;
    const negative = negativeKeys.some(function (key) { return keys[key]; }) ? 1 : 0;
    return positive - negative;
  }

  function updatePlayer(dt) {
    if (state.mode !== "playing") return;

    let moveX = axis(["KeyD", "ArrowRight"], ["KeyA", "ArrowLeft"]);
    let moveZ = axis(["KeyS", "ArrowDown"], ["KeyW", "ArrowUp"]);
    const moveLength = Math.hypot(moveX, moveZ) || 1;
    moveX /= moveLength;
    moveZ /= moveLength;

    const wantsDash = keys.ShiftLeft || keys.ShiftRight;
    player.dashActive = wantsDash && player.dashEnergy > 0.03 && (moveX !== 0 || moveZ !== 0);

    if (player.dashActive) {
      player.dashEnergy = Math.max(0, player.dashEnergy - dt * 0.72);
    } else {
      player.dashEnergy = Math.min(1, player.dashEnergy + dt * 0.34);
    }

    const speed = S.player.moveSpeed * (player.dashActive ? S.player.dashMultiplier : 1);
    const control = player.onGround ? 16 : 7;
    player.vx = lerp(player.vx, moveX * speed, clamp(control * dt, 0, 1));
    player.vz = lerp(player.vz, moveZ * speed, clamp(control * dt, 0, 1));

    if (moveX !== 0) player.facingX = Math.sign(moveX);

    if ((pressed.Space || pressed.KeyJ) && player.onGround) {
      player.vy = S.player.jumpPower;
      player.onGround = false;
      emitParticles(player.x, player.y - S.player.height / 2, player.z, "#ffffff", 8);
    }

    player.prevY = player.y;
    const previousBottom = player.prevY - S.player.height / 2;

    player.x += player.vx * dt;
    player.z += player.vz * dt;
    player.vy -= S.player.gravity * dt;
    player.y += player.vy * dt;

    player.z = clamp(player.z, -5.2, 5.2);

    const currentBottom = player.y - S.player.height / 2;
    player.onGround = false;

    if (player.vy <= 0) {
      let landingTop = -999;
      for (const platform of S.platforms) {
        const top = platform.y + platform.height / 2;
        if (!pointInsidePlatformXZ(player.x, player.z, platform, 0.10)) continue;
        if (previousBottom >= top - 0.12 && currentBottom <= top + 0.08) {
          landingTop = Math.max(landingTop, top);
        }
      }

      if (landingTop > -900) {
        player.y = landingTop + S.player.height / 2;
        player.vy = 0;
        player.onGround = true;
      }
    }

    if (player.dashActive) {
      state.dashTrails.push({
        x: player.x - player.vx * 0.055,
        y: player.y,
        z: player.z - player.vz * 0.055,
        size: 0.16,
        life: 0.8
      });
      if (state.dashTrails.length > 38) state.dashTrails.shift();
    }

    handleEnemyCollisions();

    if (player.y < -7) {
      failPlayer();
      return;
    }

    const goalDistance = Math.hypot(player.x - S.goal.x, player.z - S.goal.z);
    if (goalDistance < 1.0 && player.y < S.goal.height + 0.5) {
      clearGame();
    }
  }

  function handleEnemyCollisions() {
    const playerBottom = player.y - S.player.height / 2;
    const previousBottom = player.prevY - S.player.height / 2;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const overlapX = Math.abs(player.x - enemy.x) < (S.player.width + enemy.width) * 0.47;
      const overlapZ = Math.abs(player.z - enemy.z) < (S.player.depth + enemy.depth) * 0.47;
      const enemyTop = enemy.y + enemy.height / 2;
      const verticalOverlap = player.y + S.player.height / 2 > enemy.y - enemy.height / 2 &&
                              playerBottom < enemyTop;

      if (!overlapX || !overlapZ || !verticalOverlap) continue;

      const stomp = player.vy < 0 && previousBottom >= enemyTop - 0.25 && playerBottom <= enemyTop + 0.18;
      if (stomp) {
        enemy.alive = false;
        player.y = enemyTop + S.player.height / 2;
        player.vy = 8.7;
        player.onGround = false;
        state.defeated += 1;
        state.score += 200;
        state.flash = 0.22;
        emitParticles(enemy.x, enemyTop, enemy.z, S.colors.enemy, 20);
      } else {
        failPlayer();
        return;
      }
    }
  }

  function failPlayer() {
    state.flash = 0.48;
    emitParticles(player.x, player.y, player.z, "#ffffff", 18);
    const oldScore = state.score;
    const oldDefeated = state.defeated;
    resetGame(true);
    state.score = Math.max(0, oldScore - 100);
    state.defeated = 0;
    centerText.text = "MISS!";
    subText.text = oldDefeated > 0 ? "敵は横から触れず、上から踏もう" : "穴に落ちないようにジャンプ！";
  }

  function clearGame() {
    if (state.mode === "clear") return;
    state.mode = "clear";
    state.score += 1000;
    state.messageTimer = 0;
    state.flash = 0.52;
    emitParticles(S.goal.x, 3.2, S.goal.z, S.colors.flag, 50);
  }

  function updateCamera(dt) {
    const desiredX = player.x - S.camera.distanceX;
    const desiredY = S.camera.height + clamp(player.y * 0.16, 0, 1.2);
    const desiredZ = player.z + S.camera.distanceZ;
    const follow = 1 - Math.pow(0.001, dt);

    state.camera.x = lerp(state.camera.x, desiredX, follow);
    state.camera.y = lerp(state.camera.y, desiredY, follow);
    state.camera.z = lerp(state.camera.z, desiredZ, follow);
    state.camera.targetX = lerp(state.camera.targetX, player.x + S.camera.lookAhead, follow);
    state.camera.targetY = lerp(state.camera.targetY, player.y + 0.6, follow);
    state.camera.targetZ = lerp(state.camera.targetZ, player.z * 0.55, follow);
  }

  function update(dt) {
    if (pressed.KeyR) resetGame(false);

    if (state.messageTimer > 0) state.messageTimer = Math.max(0, state.messageTimer - dt);
    state.flash = Math.max(0, state.flash - dt * 1.8);

    updatePlayer(dt);
    updateEnemies(dt);
    updateParticles(dt);
    updateCamera(dt);
  }

  function tick(event) {
    const dt = Math.min(0.033, (event.delta || 16.67) / 1000);
    update(dt);
    drawSky();
    drawWorld();
    drawHud();
    stage.update(event);

    for (const code of Object.keys(pressed)) delete pressed[code];
  }

  window.addEventListener("keydown", function (event) {
    if (!keys[event.code]) pressed[event.code] = true;
    keys[event.code] = true;

    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", function (event) {
    keys[event.code] = false;
  });

  window.addEventListener("blur", function () {
    for (const code of Object.keys(keys)) keys[code] = false;
  });

  resetGame(false);
  drawSky();
  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED || createjs.Ticker.RAF;
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener("tick", tick);
})();
