# cssc-2026

会津大学 CSSC2026「JavaScript ゲームプログラミングコース」の受講生環境セットアップ一式。
[StageZero](https://zero.shakenokiri.me/) VS Code 拡張と組み合わせて使う想定です。

## 2つのスクリプト

### `standard-env-setup.sh` — コースリーダーが事前に1度だけ実行

対象: 検証用アカウント (例: `java51`) の $HOME。実行後、その環境がそのまま
本番用アカウント (`java1-50`) にコピーされる。

やること:
1. 会津大学の講義ミラー ([`~nisidate/CSSC/`](https://web-int.u-aizu.ac.jp/~nisidate/CSSC/))
   から `demo/{shooting,rhythmGame,notesMaker}.zip` と `text/2026_jsgame_schoolnote.pdf` を DL
2. `~/Demo/`, `~/Project/`, `~/TeamProject/` を作成
   - パーミッションは `go+rX` (**読み取り + traverse のみ、write は与えない**)
   - 同時編集は StageZero 拡張が担うので filesystem 側は read だけで十分
   - インストラクターが撤収時に成果物を吸い出せるようにするための開放
3. `~/final-setup.sh` (受講者が当日叩く) + `~/Desktop/final-setup.sh` を配置

```bash
curl -fsSL https://raw.githubusercontent.com/shakenokirimi12/cssc-2026/main/standard-env-setup.sh | bash
```

### `final-setup.sh` — 受講者が本番当日、講師の指示で1度だけ実行

対象: 受講者本人の $HOME。標準環境コピー直後の初回セットアップ。

やること:
1. このリポジトリを `~/Demo/cssc-2026/` に `git clone` (次回以降は `git pull`)
2. 最新の StageZero .vsix を [zero.shakenokiri.me](https://zero.shakenokiri.me/stagezero.vsix) から DL
3. VS Code に StageZero をインストール
4. 完了したら `~/final-setup.sh` と `~/Desktop/final-setup.sh` を **自分自身で削除**

```bash
bash ~/final-setup.sh
# または、デスクトップのアイコンをダブルクリック
```

## 想定するホーム構造

`standard-env-setup.sh` 実行後 (＝ IT 展開後の受講者ホーム):

```
~/
├── Demo/
│   ├── shooting/
│   ├── rhythmGame/
│   ├── notesMaker/
│   └── schoolnote.pdf
├── Project/            # 空 (受講者が個人演習に使う)
├── TeamProject/        # 空 (グループワークに使う)
├── final-setup.sh      # 当日1度だけ叩く。実行後に自動削除
├── Desktop/
│   └── final-setup.sh  # 同上のショートカット
└── CSSC2026/downloads/ # standard-env-setup.sh の作業ディレクトリ (消してもOK)
```

`final-setup.sh` 実行後:

```
~/
├── Demo/
│   ├── shooting/
│   ├── rhythmGame/
│   ├── notesMaker/
│   ├── schoolnote.pdf
│   └── cssc-2026/      # このリポジトリの clone
├── Project/
└── TeamProject/
```

## トラブル時

- `final-setup.sh` を消してしまった場合:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/shakenokirimi12/cssc-2026/main/final-setup.sh -o ~/final-setup.sh
  bash ~/final-setup.sh
  ```
- 拡張のログを見たい場合: VS Code の「表示 → 出力 → StageZero Pair」

## ライセンス

MIT (受講者の環境構築素材なので自由に流用してください)。
