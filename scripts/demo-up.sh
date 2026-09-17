#!/usr/bin/env bash
# デモの一括セットアップ。front/・mcp-server/の依存インストール、
# チャット/タスクデータをシードへリセット、front/の開発サーバー起動、
# Claude Code CLIへのMCPサーバー登録までを1コマンドで行う。
#
# 使い方: ./scripts/demo-up.sh [PORT]
#   PORT: front/を起動するポート。省略時は3000。
#
# 終了後は ./scripts/demo-down.sh [PORT] でサーバーを停止できる。
set -euo pipefail

PORT="${1:-3000}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONT_DIR="$ROOT_DIR/front"
MCP_DIR="$ROOT_DIR/mcp-server"
DATA_DIR="$FRONT_DIR/.data"
LOG_FILE="$DATA_DIR/demo-front.log"
PORT_FILE="$DATA_DIR/demo-front.port"

echo "==> front/の依存関係を確認します"
[ -d "$FRONT_DIR/node_modules" ] || (cd "$FRONT_DIR" && npm install)

echo "==> mcp-server/の依存関係を確認します"
[ -d "$MCP_DIR/node_modules" ] || (cd "$MCP_DIR" && npm install)

mkdir -p "$DATA_DIR"

echo "==> デモ用データをシードにリセットします"
(cd "$FRONT_DIR" && npm run demo:reset)

if lsof -ti:"$PORT" > /dev/null 2>&1; then
  echo "ポート$PORTは既に使用中です。./scripts/demo-down.sh $PORT で停止してから実行してください。"
  exit 1
fi

echo "==> front/の開発サーバーを起動します (port=$PORT)"
(cd "$FRONT_DIR" && nohup npm run dev -- --port "$PORT" > "$LOG_FILE" 2>&1 < /dev/null &)
echo "$PORT" > "$PORT_FILE"

echo -n "起動待機中"
ready=0
for _ in $(seq 1 30); do
  if curl -sf "http://localhost:$PORT/api/tasks" > /dev/null 2>&1; then
    ready=1
    break
  fi
  echo -n "."
  sleep 1
done
echo ""

if [ "$ready" -ne 1 ]; then
  echo "front/サーバーの起動確認に失敗しました。$LOG_FILE を確認してください。"
  exit 1
fi
echo "front/サーバーが起動しました (http://localhost:$PORT)"

echo "==> MCPサーバーをClaude Code CLIに登録します"
if command -v claude > /dev/null 2>&1; then
  if claude mcp get sample-todo-chat > /dev/null 2>&1; then
    echo "sample-todo-chatは登録済みです（スキップ）"
  else
    claude mcp add sample-todo-chat --env "CHAT_API_BASE_URL=http://localhost:$PORT" -- node "$MCP_DIR/index.js"
    echo "sample-todo-chatとして登録しました"
  fi
else
  echo "claude コマンドが見つからないため、MCPサーバーの登録はスキップしました。"
  echo "手動で登録する場合はmcp-server/README.mdを参照してください。"
fi

cat <<EOM

準備ができました。
  - ToDo画面: http://localhost:$PORT/
  - Chat画面: http://localhost:$PORT/chat
  - 停止する場合: ./scripts/demo-down.sh $PORT
EOM
