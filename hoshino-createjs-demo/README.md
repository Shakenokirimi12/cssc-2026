# CSSC 2026 CreateJS デモゲーム

CSSC 2026で使用するCreateJS教材・デモゲームです。
追加のインストールは不要で、各フォルダの `index.html` をブラウザで開くと起動できます。

## 起動方法と解説マニュアル

最初に、このフォルダ直下の `index.html` を開いてください。
そこから次の4つのゲームを選択・プレイできます。

- **フルーツキャッチ**：降ってくるフルーツをカゴで受け止めるシンプルなゲーム
- **2Dアクション**：障害物を避けながら進む横スクロールのアクションゲーム
- **2Dシューティング**：敵を撃ち落とすシンプルなシューティングゲーム
- **2Dシューティング（発展版）**：スコア表示やゲームオーバー演出等を追加した2Dシューティングの完成例

また、各ゲームのフォルダ内には **コード解説マニュアル（HTML/Markdown形式）(AIに作ってもらいました)** が同梱されています。ソースコードの役割や処ｓ理の流れを学ぶための補助資料として活用できます。

## フォルダ構成

```text
hoshino-createjs-demo/
├── index.html
├── README.md
├── Audio/
└── games/
    ├── 01_fruit_catch/
    │   ├── index.html
    │   ├── 01_fruit_catch_manual.html (コード解説マニュアル - HTML版)
    │   ├── 01_fruit_catch_manual.md   (コード解説マニュアル - Markdown版)
    │   ├── global.js
    │   ├── init.js
    │   ├── tick.js
    │   ├── key.js
    │   ├── mouse.js
    │   └── gameover.js
    ├── 02_action/
    │   ├── index.html
    │   ├── 02_action_manual.html (コード解説マニュアル - HTML版)
    │   ├── 02_action_manual.md   (コード解説マニュアル - Markdown版)
    │   ├── global.js
    │   ├── init.js
    │   ├── tick.js
    │   ├── key.js
    │   └── gameover.js
    ├── 03_shooting/
    │   ├── index.html
    │   ├── 03_shooting_manual.html (コード解説マニュアル - HTML版)
    │   ├── 03_shooting_manual.md   (コード解説マニュアル - Markdown版)
    │   ├── global.js
    │   ├── init.js
    │   ├── tick.js
    │   ├── key.js
    │   └── gameover.js
    └── 03_shooting_full/
        ├── index.html
        ├── 03_shooting_full_manual.html (コード解説マニュアル - HTML版)
        ├── 03_shooting_full_manual.md   (コード解説マニュアル - Markdown版)
        ├── global.js
        ├── init.js
        ├── tick.js
        ├── key.js
        └── gameover.js
```

