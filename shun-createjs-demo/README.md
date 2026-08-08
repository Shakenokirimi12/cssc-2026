# STAR & BOMB CATCH

高校生向けCreateJS体験会用の、落ち物キャッチゲームです。`index.html` をブラウザで開いてください（CreateJS本体はインターネット経由で読み込みます）。

生徒へ配る説明書は [`STUDENT_README.md`](STUDENT_README.md) です。自作画像・効果音を追加する場合は、[`material/README.md`](material/README.md) もあわせて使ってください。


## 遊び方

- `←` `→` または `A` `D`：プレイヤーを左右に動かす
- `SPACE` または画面クリック：開始・もう一度遊ぶ
- 星：`+10` 点。連続で取るとコンボ倍率で高得点
- 爆弾：当たるとゲームオーバー
- 残り10秒：アイテムが2倍の速さで落ちる

## ファイルの役割

| ファイル | 役割 |
| --- | --- |
| `global.js` | 変更しやすい数値、色、ゲーム全体の共有変数 |
| `init.js` | Stageの初期化、イベントリスナー登録、画面部品の作成 |
| `key.js` | キーボード入力の処理 |
| `tick.js` | 毎フレームの移動、出現、当たり判定、UI更新 |
| `mouse.js` | クリックでスタート／リスタートする処理 |
| `gameover.js` | 爆弾・時間切れ時の終了画面 |
| `student.js` | 生徒が小さな機能追加に挑戦する場所 |

## 最初に見せるカスタマイズ例

1. `global.js` の `playerMoveSpeed = 8` を `14` にして、バスケットを速くする。
2. `itemSpawnInterval = 700` を `450` にして、落ち物を増やす。
3. `starProbability = 0.78` を `0.9` にして、遊びやすくする。
4. `timeLimitSeconds = 30` を `45` にして、制限時間を伸ばす。
5. `starScore = 10` を `50` にして、点数の変化を分かりやすくする。
6. `hurryUpSpeedMultiplier = 2` を `3` にして、終盤をさらに難しくする。

## TA向けデモの流れ（3分）

1. まず遊んで、星・爆弾・30秒制限・終盤のHURRY UPを見せる。
2. `global.js` を開き、`playerMoveSpeed` を変えて保存・再読み込みする。
3. `itemSpawnInterval` と `starProbability` を変え、「数字で難易度を設計できる」と説明する。
4. `tick.js` の `catchStar` を開き、コンボ数から得点倍率を作っていることを紹介する。
5. 余裕があれば `student.js` のコメントを外し、100点メッセージなどを追加する。
