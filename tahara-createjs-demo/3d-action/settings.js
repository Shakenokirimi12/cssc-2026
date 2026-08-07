/*
============================================================
  授業で見せるときに変更しやすい設定

  CreateJSは2D Canvas用のライブラリですが、このデモでは
  x・y・z の3D座標を2D画面へ投影して、立体的に描画しています。
============================================================
*/

window.DEMO_SETTINGS = {
  title: "CREATEJS 3D DASH",

  colors: {
    sky: "#78cfff",
    skyBottom: "#dff4ff",
    groundTop: "#5bc06b",
    groundSide: "#2f7f46",
    blockTop: "#ffd166",
    blockSide: "#c98b2f",
    player: "#2478ff",
    playerHead: "#ffd7a8",
    enemy: "#ef476f",
    enemyDark: "#9b2441",
    flag: "#ffe45e",
    pole: "#f5f5f5"
  },

  player: {
    moveSpeed: 6.0,
    dashMultiplier: 2.15,
    jumpPower: 11.5,
    gravity: 25.0,
    width: 0.85,
    height: 1.65,
    depth: 0.85
  },

  camera: {
    distanceX: 10.5,
    height: 7.2,
    distanceZ: 12.5,
    lookAhead: 5.8,
    focalLength: 660
  },

  start: { x: -5.2, y: 0.83, z: 0 },

  platforms: [
    { x: -1.0,  y: -0.5, z: 0, width: 12.0, height: 1.0, depth: 8.0, type: "ground" },
    { x: 8.5,   y: -0.5, z: 0, width: 5.0,  height: 1.0, depth: 8.0, type: "ground" },
    { x: 15.0,  y: -0.5, z: 0, width: 6.0,  height: 1.0, depth: 8.0, type: "ground" },
    { x: 23.0,  y: -0.5, z: 0, width: 7.5,  height: 1.0, depth: 8.0, type: "ground" },
    { x: 32.8,  y: -0.5, z: 0, width: 12.0, height: 1.0, depth: 8.0, type: "ground" },

    { x: 14.7,  y: 0.35, z: -2.35, width: 2.3, height: 0.7, depth: 2.2, type: "block" },
    { x: 22.6,  y: 0.55, z: 2.15,  width: 2.8, height: 1.1, depth: 2.4, type: "block" },
    { x: 29.5,  y: 0.35, z: -2.1,  width: 2.4, height: 0.7, depth: 2.4, type: "block" }
  ],

  enemies: [
    { x: 3.3,  z: 0.2,  patrol: 2.0, speed: 1.45 },
    { x: 14.0, z: 1.55, patrol: 1.6, speed: 1.65 },
    { x: 23.4, z: -1.4, patrol: 1.9, speed: 1.8 },
    { x: 31.8, z: 0.6,  patrol: 2.2, speed: 2.0 }
  ],

  goal: { x: 37.0, y: 0, z: 0, height: 4.8 }
};
