#!/usr/bin/env bash
# ============================================================
# CSSC2026 当日インストーラ (受講者用)
#
# $HOME/final-setup.sh に配置されます。当日、講師の指示で:
#
#   bash ~/final-setup.sh
#
# 何をするか:
#   1. cssc-2026 リポジトリを $HOME/Demo/cssc-2026 に git clone
#      (既にあれば git pull で最新化)
#   2. StageZero の最新 .vsix を zero.shakenokiri.me からダウンロード
#   3. VS Code に StageZero をインストール
#   4. 動作確認のヒントを表示
#   5. このスクリプト自身とデスクトップのコピーを削除
# ============================================================

set -Eeuo pipefail

# ---- 設定 --------------------------------------------------------

REPO_URL="${CSSC_REPO_URL:-https://github.com/shakenokirimi12/cssc-2026.git}"
REPO_DIR="${CSSC_REPO_DIR:-$HOME/Demo}"
VSIX_URL="${STAGEZERO_VSIX_URL:-https://zero.shakenokiri.me/stagezero.vsix}"
VSIX_TMP="${VSIX_TMP:-/tmp/stagezero-$USER.vsix}"
CODE_BIN="${CODE_BIN:-code}"

# ---- ログ --------------------------------------------------------

C_INF='\033[1;36m'; C_WRN='\033[1;33m'; C_ERR='\033[1;31m'; C_END='\033[0m'
log()  { printf '%b[%s]%b %s\n' "$C_INF" "$(date +%H:%M:%S)" "$C_END" "$*"; }
warn() { printf '%b[WARN %s]%b %s\n' "$C_WRN" "$(date +%H:%M:%S)" "$C_END" "$*" >&2; }
die()  { printf '%b[FATAL %s]%b %s\n' "$C_ERR" "$(date +%H:%M:%S)" "$C_END" "$*" >&2; exit 1; }

# ---- 事前チェック ------------------------------------------------

for cmd in git curl "$CODE_BIN"; do
  command -v "$cmd" >/dev/null 2>&1 || die "$cmd が PATH に無い"
done

# ---- 1. cssc-2026 リポジトリを Demo/ 直下に取り込む -----------

# ~/Demo は既に shooting/, rhythmGame/, notesMaker/ が入っているので、
# git clone は使えず、init + fetch + checkout で被せる。既存の未管理
# ディレクトリは "untracked" として温存される。
mkdir -p "$REPO_DIR"

if [[ -d "$REPO_DIR/.git" ]]; then
  log "Demo/ 内のリポジトリを更新"
  (cd "$REPO_DIR" && git pull --ff-only) || warn "git pull 失敗 (既存の内容で続行)"
else
  log "cssc-2026 の中身を Demo/ に取り込み"
  (
    cd "$REPO_DIR"
    git init -q
    git remote remove origin 2>/dev/null || true
    git remote add origin "$REPO_URL"
    git fetch --depth 1 origin main -q
    git checkout -f -b main FETCH_HEAD
    git branch --set-upstream-to=origin/main main 2>/dev/null || true
  )
fi

# ---- 2. StageZero .vsix を DL -----------------------------------

log "StageZero 拡張を取得: $VSIX_URL"
curl -fsSL -o "$VSIX_TMP" "$VSIX_URL"

# 中身が zip (PK.. マジック) か軽く検証
head -c 2 "$VSIX_TMP" | grep -q '^PK' \
  || die "取得した .vsix が壊れています。ネットワークを確認して再実行してください"

# ---- 3. VS Code にインストール ----------------------------------

log "VS Code に StageZero をインストール"
"$CODE_BIN" --install-extension "$VSIX_TMP" --force

rm -f "$VSIX_TMP"

# ---- 4. インストーラ自身を削除 ----------------------------------

# 「もう二度目は無い」ので $HOME/final-setup.sh を消す。
# ここまで来たら成功しているので self-delete で片付ける。
log "セットアップ完了。final-setup.sh を削除します"
rm -f "$HOME/final-setup.sh"

# ---- 完了 --------------------------------------------------------

cat <<'MSG'

    確認手順:
    1. VS Code を起動 (画面下のアイコン)
    2. 左下のステータスバーに「StageZero: XXXXXX」と出るか
    3. 表示 → 出力 → ドロップダウンで「StageZero Pair」を選ぶと
       接続ログが見えます。トラブル時は TA に見せてください
    4. 左サイドバーで「班メンバー」欄にチームメイトが出るか

    リポジトリの場所 (授業中に参照する):
MSG
printf '      %s\n\n' "$REPO_DIR"
