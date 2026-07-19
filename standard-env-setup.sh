#!/usr/bin/env bash
# ============================================================
# CSSC2026 標準環境セットアップ (java51 で1度だけ実行)
#
# 何をするか:
#   1. Aizu ミラー (https://web-int.u-aizu.ac.jp/~nisidate/CSSC/) から
#      Demo/{shooting,rhythmGame,notesMaker}/ と schoolnote.pdf を取得し
#      $HOME/Demo/ に直接展開
#   2. $HOME/Project, $HOME/TeamProject を作成
#   3. パーミッションを整える
#   4. $HOME/final-setup.sh (受講者が当日叩くやつ) を配置
#
# 使い方 (java51 にログインして):
#
#   curl -fsSL https://raw.githubusercontent.com/shakenokirimi12/cssc-2026/main/standard-env-setup.sh | bash
#
# 冪等 (再実行しても壊しません)。中間ファイルは一切残しません。
# ============================================================

set -Eeuo pipefail

# ---- 設定 --------------------------------------------------------

MIRROR="${CSSC_MIRROR_URL:-https://web-int.u-aizu.ac.jp/~nisidate/CSSC}"
REPO_RAW="${CSSC_REPO_RAW:-https://raw.githubusercontent.com/shakenokirimi12/cssc-2026/main}"

# 一時作業ディレクトリ (終了時に自動削除)
WORK="$(mktemp -d -t cssc-XXXXXX)"
trap 'rm -rf "$WORK"' EXIT

# ---- ログ --------------------------------------------------------

C_INF='\033[1;36m'; C_WRN='\033[1;33m'; C_ERR='\033[1;31m'; C_END='\033[0m'
log()  { printf '%b[%s]%b %s\n' "$C_INF" "$(date +%H:%M:%S)" "$C_END" "$*"; }
warn() { printf '%b[WARN %s]%b %s\n' "$C_WRN" "$(date +%H:%M:%S)" "$C_END" "$*" >&2; }
die()  { printf '%b[FATAL %s]%b %s\n' "$C_ERR" "$(date +%H:%M:%S)" "$C_END" "$*" >&2; exit 1; }

# ---- 事前チェック ------------------------------------------------

for cmd in wget curl unzip; do
  command -v "$cmd" >/dev/null 2>&1 || die "$cmd が PATH に無い"
done

# ---- 1. Demo と schoolnote を $HOME/Demo/ に直接展開 ------------

DEMO_ZIPS=(shooting.zip rhythmGame.zip notesMaker.zip)
SCHOOLNOTE_REMOTE="text/2026_jsgame_schoolnote.pdf"

log "ホームディレクトリを整備 (Demo/Project/TeamProject)"
mkdir -p "$HOME/Demo" "$HOME/Project" "$HOME/TeamProject"

for zip in "${DEMO_ZIPS[@]}"; do
  subdir="${zip%.zip}"
  target="$HOME/Demo/$subdir"

  if [[ -d "$target" && -n "$(ls -A "$target" 2>/dev/null)" ]]; then
    log "既に配置済: Demo/$subdir/"
    continue
  fi

  local_zip="$WORK/$zip"
  log "取得: $MIRROR/demo/$zip"
  if ! wget -q --show-progress -O "$local_zip" "$MIRROR/demo/$zip"; then
    warn "$zip の取得に失敗、スキップ"
    rm -f "$local_zip"
    continue
  fi

  log "展開: ~/Demo/$subdir/"
  rm -rf "$target"
  mkdir -p "$target"
  top=$(unzip -l "$local_zip" | awk 'NR>3 && $NF!~/\/$/ {print $NF; exit}' || true)
  if [[ "$top" == "$subdir/"* ]]; then
    unzip -q -o "$local_zip" -d "$HOME/Demo/"
  else
    unzip -q -o "$local_zip" -d "$target"
  fi
done

[[ -d "$HOME/Demo/shooting" && -n "$(ls -A "$HOME/Demo/shooting" 2>/dev/null)" ]] \
  || die "Demo/shooting/ が用意できず。$MIRROR/demo/shooting.zip を手動確認してください"

# schoolnote.pdf は $HOME 直下に置く (受講生が最初に開くので目に付く位置)
if [[ ! -f "$HOME/schoolnote.pdf" ]]; then
  log "schoolnote.pdf を取得 -> ~/schoolnote.pdf"
  wget -q --show-progress -O "$HOME/schoolnote.pdf" "$MIRROR/$SCHOOLNOTE_REMOTE" \
    || { rm -f "$HOME/schoolnote.pdf"; warn "schoolnote.pdf 取得失敗 (必須ではない)"; }
fi

# ---- 2. パーミッション ------------------------------------------

log "権限: HOME=755, 作業ディレクトリは group+other 読み取り可 (write は無し)"
# 同時編集は StageZero 拡張が担うので、ファイルシステムに write 権限を
# 開けなくても大丈夫。回収 (read) と traverse だけを許可する。
chmod 755 "$HOME"
chmod -R go+rX "$HOME/Project" "$HOME/Demo" "$HOME/TeamProject"

# ---- 3. final-setup.sh を配置 -----------------------------------

log "$HOME/final-setup.sh (受講者が当日叩くやつ) を配置"
if ! curl -fsSL "$REPO_RAW/final-setup.sh" -o "$HOME/final-setup.sh"; then
  die "final-setup.sh の取得に失敗。$REPO_RAW にアクセス可能か確認してください"
fi
chmod +x "$HOME/final-setup.sh"

# ---- 完了 --------------------------------------------------------

log "標準環境の準備完了 (中間ファイルは削除済み)"
cat <<MSG

    次のステップ:
    1. $HOME/final-setup.sh を試しに実行して StageZero が入るか確認
    2. 問題なければ企画係に「$(whoami) の環境を java1-50 に展開してください」メール

    受講生は当日 $HOME/final-setup.sh をダブルクリックまたはターミナルで
      bash ~/final-setup.sh
    を実行するとインストールが走ります。
MSG
