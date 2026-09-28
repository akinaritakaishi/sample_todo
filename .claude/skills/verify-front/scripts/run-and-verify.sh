#!/usr/bin/env bash
# front/(Nuxt開発サーバー)を起動し、Playwrightでスクリーンショットとconsoleログを採取してから
# 開発サーバーを確実に停止する。成功・失敗を問わずサーバープロセスをリークさせないことが目的。
#
# 使い方:
#   run-and-verify.sh [PORT] [PATH] [OUT_DIR]
#     PORT    : 開発サーバーの固定ポート (デフォルト: 5183)
#     PATH    : アクセスするパス (デフォルト: /)
#     OUT_DIR : スクリーンショット・ログの出力先ディレクトリ
#               (デフォルト: リポジトリ外の一時ディレクトリを自動作成)
#
# 例:
#   .claude/skills/verify-front/scripts/run-and-verify.sh 5183 / /tmp/verify-front-out

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
FRONT_DIR="$REPO_ROOT/front"

PORT="${1:-5183}"
URL_PATH="${2:-/}"
OUT_DIR="${3:-$(mktemp -d -t verify-front-XXXXXX)}"

if [ ! -f "$FRONT_DIR/package.json" ]; then
  echo "front/package.json が見つかりません: $FRONT_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Windows(Git Bash)ではsetsid・/opt/pw-browsersが無いため、起動・停止とブラウザの解決を切り替える。
IS_WINDOWS=0
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) IS_WINDOWS=1 ;;
esac

DEV_LOG="$OUT_DIR/dev-server.log"
DEV_PID=""
DEV_WINPID=""

cleanup() {
  if [ "$IS_WINDOWS" -eq 1 ]; then
    # Windowsではプロセスグループへのシグナル送信が効かないため、taskkill /T で
    # 起動したbashのWindowsプロセスから子孫（npm→nuxi→Nitro）までツリーごと停止する。
    # 念のため、それでも残ったPORTのLISTENプロセスも停止する。
    if [ -n "$DEV_WINPID" ]; then
      taskkill //PID "$DEV_WINPID" //T //F > /dev/null 2>&1 || true
    fi
    for pid in $(netstat -ano 2>/dev/null | awk -v p=":$PORT" '$2 ~ p"$" && $4 == "LISTENING" {print $5}' | sort -u); do
      taskkill //PID "$pid" //T //F > /dev/null 2>&1 || true
    done
    return
  fi
  # `npm run dev` は内部でNuxt/Nitro本体を子プロセス（forkモード）として起動するため、
  # DEV_PIDだけをkillしても本体プロセスが残ってしまう。setsidで新しいセッションを作って
  # 起動し、DEV_PID(セッションリーダー)に対して「-」付きで送ることでプロセスグループ
  # 全体に確実にシグナルを届ける。
  if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill -TERM -- "-$DEV_PID" 2>/dev/null || kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "==> devサーバーを起動します (port=$PORT)"
if [ "$IS_WINDOWS" -eq 1 ]; then
  bash -c "cd '$FRONT_DIR' && exec npm run dev -- --port '$PORT'" > "$DEV_LOG" 2>&1 &
  DEV_PID=$!
  DEV_WINPID="$(cat "/proc/$DEV_PID/winpid" 2>/dev/null || true)"
else
  setsid bash -c "cd '$FRONT_DIR' && exec npm run dev -- --port '$PORT'" > "$DEV_LOG" 2>&1 &
  DEV_PID=$!
fi

READY=0
for _ in $(seq 1 30); do
  if ! kill -0 "$DEV_PID" 2>/dev/null; then
    echo "devサーバーが起動直後に終了しました。ログ:" >&2
    cat "$DEV_LOG" >&2
    exit 1
  fi
  if curl -s -o /dev/null "http://localhost:$PORT"; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "devサーバーの起動待ちがタイムアウトしました。ログ:" >&2
  cat "$DEV_LOG" >&2
  exit 1
fi

echo "==> Playwrightのセットアップを確認します"
if [ -d "$FRONT_DIR/node_modules/playwright" ]; then
  PW_NODE_MODULES="$FRONT_DIR/node_modules"
else
  # front/ に playwright が入っていない場合、リポジトリ外のスクラッチ領域に
  # 軽量インストールする。ブラウザ本体は /opt/pw-browsers に既にあるため
  # PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 で再ダウンロードを避ける。
  SCRATCH_DIR="${VERIFY_FRONT_SCRATCH_DIR:-/tmp/verify-front-pw}"
  mkdir -p "$SCRATCH_DIR"
  if [ ! -d "$SCRATCH_DIR/node_modules/playwright" ]; then
    echo "    playwrightが見つからないため $SCRATCH_DIR に一時インストールします"
    (cd "$SCRATCH_DIR" && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install playwright --no-save --no-audit --no-fund --silent)
  fi
  PW_NODE_MODULES="$SCRATCH_DIR/node_modules"
fi

echo "==> スクリーンショットとconsoleログを採取します"
TARGET_URL="http://localhost:$PORT$URL_PATH"

PW_CHANNEL="${PLAYWRIGHT_CHANNEL:-}"
if [ "$IS_WINDOWS" -eq 1 ]; then
  # Windowsには/opt/pw-browsersが無いため、インストール済みのChrome（無ければEdge）を
  # Playwrightのchannel指定で使う。ブラウザ本体のダウンロードは不要。
  CHROMIUM_EXECUTABLE_PATH="${CHROMIUM_EXECUTABLE_PATH:-}"
  if [ -z "$CHROMIUM_EXECUTABLE_PATH" ] && [ -z "$PW_CHANNEL" ]; then
    if [ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ]; then
      PW_CHANNEL=chrome
    else
      PW_CHANNEL=msedge
    fi
  fi
  # nodeはネイティブのWindowsプログラムなので、NODE_PATHはWindows形式のパスで渡す。
  PW_NODE_MODULES="$(cygpath -w "$PW_NODE_MODULES")"
else
  # 一時インストールしたplaywrightのバージョンと /opt/pw-browsers にあるブラウザの
  # ビルド番号がずれていることがあるため、既存のchromium実行ファイルを明示的に渡す。
  # こうしないと新しいバージョン番号のディレクトリを探しに行って失敗する。
  CHROMIUM_EXECUTABLE_PATH="${CHROMIUM_EXECUTABLE_PATH:-$(find "${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}" -maxdepth 3 -type f -path '*/chromium-*/chrome-linux/chrome' 2>/dev/null | sort | tail -1)}"
  export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"
fi

NODE_PATH="$PW_NODE_MODULES" \
  CHROMIUM_EXECUTABLE_PATH="$CHROMIUM_EXECUTABLE_PATH" PLAYWRIGHT_CHANNEL="$PW_CHANNEL" \
  node "$SCRIPT_DIR/capture.cjs" "$TARGET_URL" "$OUT_DIR"

echo "==> 出力先: $OUT_DIR"
