#!/usr/bin/env bash
# ./scripts/demo-up.sh で起動したfront/の開発サーバーを停止する。
#
# 使い方: ./scripts/demo-down.sh [PORT]
#   PORT: 省略時はdemo-up.shが最後に記録したポート（無ければ3000）を使う。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT_FILE="$ROOT_DIR/front/.data/demo-front.port"

if [ "${1:-}" != "" ]; then
  PORT="$1"
elif [ -f "$PORT_FILE" ]; then
  PORT="$(cat "$PORT_FILE")"
else
  PORT=3000
fi

PIDS="$(lsof -ti:"$PORT" 2>/dev/null || true)"
if [ -z "$PIDS" ]; then
  echo "ポート$PORTを使用しているプロセスは見つかりませんでした（既に停止済みの可能性があります）"
else
  # shellcheck disable=SC2086
  kill $PIDS
  echo "front/サーバー（port=$PORT, pid=$PIDS）を停止しました"
fi

rm -f "$PORT_FILE"
