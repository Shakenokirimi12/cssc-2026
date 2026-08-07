# CSSC 2026 CreateJS デモゲーム

CSSC 2026で使用するCreateJS教材・デモゲームです。
追加のインストールは不要で、各フォルダの `index.html` をブラウザで開くと起動できます。

## 起動方法

最初に、このフォルダ直下の `index.html` を開いてください。
そこから次の2つを選択できます。

- **横スクロールゲーム教材**：高校生が `settings.js` と `student.js` を編集して改造する教材
- **3Dアクションデモ**：CreateJS上で簡易的な3D座標・遠近投影を実装した完成例

## フォルダ構成

```text
tahara-createjs-demo/
├── index.html
├── README.md
├── .gitignore
├── side-scroller/
│   ├── index.html
│   ├── settings.js
│   ├── student.js
│   ├── game.js
│   ├── createjs-fallback.js
│   ├── preview.png
│   └── 各種説明資料
└── 3d-action/
    ├── index.html
    ├── settings.js
    ├── game.js
    ├── createjs-fallback.js
    ├── preview.png
    └── 各種説明資料
```

## ネット接続について

通常は公式CreateJS 1.0.0を読み込みます。ネット接続が使えない場合は、同梱の `createjs-fallback.js` を自動的に読み込むため、オフラインでも起動できます。

## GitHubへの追加

この `tahara-createjs-demo` フォルダを、`cssc-2026` リポジトリの直下へ配置してください。
Visual Studioの `.vs`、PDF資料、重複したZIPファイルなど、ゲームの実行に不要なファイルは除外しています。
