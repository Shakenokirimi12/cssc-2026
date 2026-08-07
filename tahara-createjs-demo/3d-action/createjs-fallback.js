/*
  CreateJS 1.0.0 が読み込めない場合だけ動く、教材用の最小互換版です。
  ゲーム本体はCreateJSのStage / Container / Shape / Text / Bitmap / Ticker APIで記述されています。
*/
(function () {
  "use strict";

  if (window.createjs) return;

  const createjs = {};

  class DisplayObject {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.scaleX = 1;
      this.scaleY = 1;
      this.rotation = 0;
      this.alpha = 1;
      this.visible = true;
      this.regX = 0;
      this.regY = 0;
      this.parent = null;
      this.name = "";
    }

    _applyTransform(ctx) {
      ctx.translate(this.x, this.y);
      if (this.rotation) ctx.rotate(this.rotation * Math.PI / 180);
      ctx.scale(this.scaleX, this.scaleY);
      ctx.translate(-this.regX, -this.regY);
      ctx.globalAlpha *= this.alpha;
    }

    _render() {}
  }

  class Container extends DisplayObject {
    constructor() {
      super();
      this.children = [];
    }

    addChild(...objects) {
      for (const object of objects) {
        if (!object) continue;
        if (object.parent) object.parent.removeChild(object);
        object.parent = this;
        this.children.push(object);
      }
      return objects[objects.length - 1];
    }

    addChildAt(object, index) {
      if (!object) return object;
      if (object.parent) object.parent.removeChild(object);
      object.parent = this;
      const safeIndex = Math.max(0, Math.min(index, this.children.length));
      this.children.splice(safeIndex, 0, object);
      return object;
    }

    removeChild(object) {
      const index = this.children.indexOf(object);
      if (index >= 0) {
        this.children.splice(index, 1);
        object.parent = null;
        return true;
      }
      return false;
    }

    removeAllChildren() {
      for (const child of this.children) child.parent = null;
      this.children.length = 0;
    }

    setChildIndex(object, index) {
      const current = this.children.indexOf(object);
      if (current < 0) return;
      this.children.splice(current, 1);
      this.children.splice(Math.max(0, Math.min(index, this.children.length)), 0, object);
    }

    _render(ctx) {
      for (const child of this.children) renderDisplayObject(ctx, child);
    }
  }

  class Graphics {
    constructor() {
      this.commands = [];
      this.fillStyle = null;
      this.strokeStyle = null;
      this.strokeWidth = 1;
      this.path = [];
    }

    clear() {
      this.commands.length = 0;
      this.path.length = 0;
      return this;
    }

    beginFill(color) {
      this.fillStyle = color;
      return this;
    }

    endFill() {
      this.fillStyle = null;
      return this;
    }

    beginStroke(color) {
      this.strokeStyle = color;
      return this;
    }

    endStroke() {
      this.strokeStyle = null;
      return this;
    }

    setStrokeStyle(width) {
      this.strokeWidth = width;
      return this;
    }

    drawRect(x, y, width, height) {
      this.commands.push({
        type: "rect", x, y, width, height,
        fill: this.fillStyle,
        stroke: this.strokeStyle,
        strokeWidth: this.strokeWidth
      });
      return this;
    }

    drawRoundRect(x, y, width, height, radius) {
      this.commands.push({
        type: "roundRect", x, y, width, height, radius,
        fill: this.fillStyle,
        stroke: this.strokeStyle,
        strokeWidth: this.strokeWidth
      });
      return this;
    }

    drawCircle(x, y, radius) {
      this.commands.push({
        type: "circle", x, y, radius,
        fill: this.fillStyle,
        stroke: this.strokeStyle,
        strokeWidth: this.strokeWidth
      });
      return this;
    }

    moveTo(x, y) {
      this.path.push({ type: "moveTo", x, y });
      return this;
    }

    lineTo(x, y) {
      this.path.push({ type: "lineTo", x, y });
      return this;
    }

    closePath() {
      this.path.push({ type: "closePath" });
      this.commands.push({
        type: "path",
        path: this.path.slice(),
        fill: this.fillStyle,
        stroke: this.strokeStyle,
        strokeWidth: this.strokeWidth
      });
      this.path.length = 0;
      return this;
    }

    _render(ctx) {
      for (const command of this.commands) {
        ctx.beginPath();

        if (command.type === "rect") {
          ctx.rect(command.x, command.y, command.width, command.height);
        } else if (command.type === "roundRect") {
          const r = Math.max(0, Math.min(command.radius, command.width / 2, command.height / 2));
          const x = command.x;
          const y = command.y;
          const w = command.width;
          const h = command.height;
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
        } else if (command.type === "circle") {
          ctx.arc(command.x, command.y, command.radius, 0, Math.PI * 2);
        } else if (command.type === "path") {
          for (const p of command.path) {
            if (p.type === "moveTo") ctx.moveTo(p.x, p.y);
            if (p.type === "lineTo") ctx.lineTo(p.x, p.y);
            if (p.type === "closePath") ctx.closePath();
          }
        }

        if (command.fill) {
          ctx.fillStyle = command.fill;
          ctx.fill();
        }
        if (command.stroke) {
          ctx.strokeStyle = command.stroke;
          ctx.lineWidth = command.strokeWidth || 1;
          ctx.stroke();
        }
      }
    }
  }

  class Shape extends DisplayObject {
    constructor(graphics) {
      super();
      this.graphics = graphics || new Graphics();
    }

    _render(ctx) {
      this.graphics._render(ctx);
    }
  }

  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");

  class Text extends DisplayObject {
    constructor(text, font, color) {
      super();
      this.text = text || "";
      this.font = font || "10px sans-serif";
      this.color = color || "#000";
      this.textAlign = "left";
      this.textBaseline = "top";
      this.lineHeight = 0;
      this.maxWidth = null;
      this.outline = 0;
    }

    getMeasuredWidth() {
      measureContext.font = this.font;
      const lines = String(this.text).split("\n");
      return Math.max(0, ...lines.map(line => measureContext.measureText(line).width));
    }

    getMeasuredHeight() {
      const fontSize = parseInt(this.font, 10) || 10;
      const lineHeight = this.lineHeight || fontSize * 1.2;
      return String(this.text).split("\n").length * lineHeight;
    }

    _render(ctx) {
      ctx.font = this.font;
      ctx.fillStyle = this.color;
      ctx.textAlign = this.textAlign || "left";
      ctx.textBaseline = this.textBaseline || "top";
      const fontSize = parseInt(this.font, 10) || 10;
      const lineHeight = this.lineHeight || fontSize * 1.2;
      const lines = String(this.text).split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (this.outline > 0) {
          ctx.lineWidth = this.outline * 2;
          ctx.strokeStyle = this.color;
          ctx.strokeText(lines[i], 0, i * lineHeight, this.maxWidth || undefined);
        } else {
          ctx.fillText(lines[i], 0, i * lineHeight, this.maxWidth || undefined);
        }
      }
    }
  }

  class Bitmap extends DisplayObject {
    constructor(source) {
      super();
      this.image = typeof source === "string" ? new Image() : source;
      if (typeof source === "string") this.image.src = source;
    }

    _render(ctx) {
      if (this.image && this.image.complete && this.image.naturalWidth > 0) {
        ctx.drawImage(this.image, 0, 0);
      }
    }
  }

  class Stage extends Container {
    constructor(canvasOrId) {
      super();
      this.canvas = typeof canvasOrId === "string"
        ? document.getElementById(canvasOrId)
        : canvasOrId;
      if (!this.canvas) throw new Error("canvasが見つかりません。");
      this.ctx = this.canvas.getContext("2d");
      this.autoClear = true;
    }

    update() {
      const ctx = this.ctx;
      if (this.autoClear) ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.save();
      this._render(ctx);
      ctx.restore();
    }
  }

  function renderDisplayObject(ctx, object) {
    if (!object || !object.visible || object.alpha <= 0) return;
    ctx.save();
    object._applyTransform(ctx);
    object._render(ctx);
    ctx.restore();
  }

  const tickerListeners = [];
  let tickerStarted = false;
  let lastTime = performance.now();

  function startTicker() {
    if (tickerStarted) return;
    tickerStarted = true;

    function frame(now) {
      const delta = Math.min(100, now - lastTime || 16.67);
      lastTime = now;
      const event = { type: "tick", delta, time: now, paused: false };
      for (const listener of tickerListeners.slice()) {
        if (typeof listener === "function") listener(event);
        else if (listener && typeof listener.handleEvent === "function") listener.handleEvent(event);
      }
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  createjs.Ticker = {
    RAF: "raf",
    RAF_SYNCHED: "raf_synched",
    timingMode: "raf",
    framerate: 60,
    addEventListener(type, listener) {
      if (type !== "tick" || tickerListeners.includes(listener)) return listener;
      tickerListeners.push(listener);
      startTicker();
      return listener;
    },
    removeEventListener(type, listener) {
      if (type !== "tick") return;
      const index = tickerListeners.indexOf(listener);
      if (index >= 0) tickerListeners.splice(index, 1);
    },
    removeAllEventListeners(type) {
      if (!type || type === "tick") tickerListeners.length = 0;
    }
  };

  createjs.DisplayObject = DisplayObject;
  createjs.Container = Container;
  createjs.Graphics = Graphics;
  createjs.Shape = Shape;
  createjs.Text = Text;
  createjs.Bitmap = Bitmap;
  createjs.Stage = Stage;
  createjs.Touch = { enable() {} };

  window.createjs = createjs;
  console.warn("公式CreateJSを読み込めなかったため、教材用の簡易互換版で実行しています。");
})();
