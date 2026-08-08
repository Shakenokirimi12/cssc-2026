# STAR & BOMB CATCH：学生向けガイド

## まず遊ぼう

1. `index.html` をブラウザで開く。
2. `SPACE` またはゲーム画面をクリックして始める。
3. `←` `→` または `A` `D` でバスケットを動かす。
4. 星を取ると得点、爆弾に当たるとゲームオーバー。30秒後に結果が出る。

## 最初の改造：数字を1つ変える

`global.js` を開き、次のどれかを1つだけ変えて保存します。ブラウザを再読み込みして、変わったか確かめましょう。

| 変数 | 何が変わる？ | ためしてみる値 |
| --- | --- | --- |
| `playerMoveSpeed` | バスケットの速さ | `14` |
| `itemSpawnInterval` | 星・爆弾の出る間隔 | `450` |
| `starProbability` | 星の出やすさ | `0.9` |
| `starScore` | 星1個の基本点 | `50` |
| `timeLimitSeconds` | 制限時間 | `45` |
| `hurryUpSpeedMultiplier` | 残り10秒の速さ | `3` |

## 自分の画像を使おう

1. `material` フォルダに、次の名前で画像を入れます。

   - `player.png`：バスケットの代わりに使う画像
   - `star.png`：星の代わりに使う画像
   - `bomb.png`：爆弾の代わりに使う画像

2. `global.js` の `useMaterialImages` を `true` にします。
3. 保存してブラウザを再読み込みします。

画像のおすすめは、背景が透明なPNGです。大きさは多少違っても構いません。ゲーム側で表示サイズを自動調整します。

ファイル名を変えたいときは、`global.js` の `playerImageFile`、`starImageFile`、`bombImageFile` も同じ名前に変えます。

## 効果音を入れよう

1. `material` フォルダに、次の名前でMP3またはWAVを入れます。

   - `start.mp3`：ゲーム開始
   - `star.mp3`：星を取ったとき
   - `bomb.mp3`：爆弾に当たったとき
   - `hurry.mp3`：残り10秒になったとき
   - `timeup.mp3`：時間切れ

2. `global.js` の `useSoundEffects` を `true` にします。
3. 音が大きい・小さいときは、`soundEffectVolume` を `0`〜`1` の間で変えます。例：`0.15`。

WAVを使う場合は、たとえば `start.mp3` を `start.wav` にし、`global.js` の `soundStartFile` も `"material/start.wav"` に変えます。

## 自分のアイデアを追加しよう

`student.js` は、ゲームの大事な処理を壊しにくい練習場所です。星を取ったときのメッセージや、100点を超えたときの演出などを追加してみましょう。

うまく動かなくなったら、直前に変えた1行を元に戻してから、少しずつ試しましょう。
