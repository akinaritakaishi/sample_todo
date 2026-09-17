# sample_todo チャットMCPサーバー

`front/`のチャットAPI（`/api/chat/messages`・`/api/chat/rooms`）を読み書きするMCPサーバー（stdio）。`front/`とは独立したNode.jsプロジェクトで、`list_chat_messages`（読み取り）・`send_chat_message`（書き込み）の2ツールを提供する。データストア（JSONファイル）には直接アクセスせず、必ず`front/`のHTTP API経由でやり取りする。詳細は`docs/Architecture.md`の「データフロー（チャット・MCP連携）」を参照。

## 前提

このMCPサーバーは`front/`のHTTP APIを叩くだけなので、**先に`front/`のサーバーを起動しておく必要がある**。

```
cd front
npm install
npm run dev      # または npm run build && npm run preview
```

既定では`http://localhost:3000`を見にいく。別のポート・ホストで動かす場合は後述の`CHAT_API_BASE_URL`環境変数で変更する。

## セットアップ

```
cd mcp-server
npm install
```

動作確認だけしたい場合は`npm start`でstdioサーバーが起動する（MCPクライアントから接続されるまでは何も出力せず待機する）。

## Claudeへの登録

### Claude Code CLI

```
claude mcp add sample-todo-chat -- node /絶対パス/sample_todo/mcp-server/index.js
```

`front/`が既定と異なるURLで動いている場合は環境変数を付与する。

```
claude mcp add sample-todo-chat --env CHAT_API_BASE_URL=http://localhost:3001 -- node /絶対パス/sample_todo/mcp-server/index.js
```

登録後、新しいセッションから`list_chat_messages`・`send_chat_message`ツールが使える。

### Claude Desktop

設定ファイル（`~/Library/Application Support/Claude/claude_desktop_config.json`など、OSにより異なる）の`mcpServers`に追記する。

```json
{
  "mcpServers": {
    "sample-todo-chat": {
      "command": "node",
      "args": ["/絶対パス/sample_todo/mcp-server/index.js"],
      "env": {
        "CHAT_API_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

保存後、Claude Desktopを再起動すると反映される。

## 環境変数

| 変数名 | 既定値 | 説明 |
|---|---|---|
| `CHAT_API_BASE_URL` | `http://localhost:3000` | `front/`のHTTP APIのベースURL |

## デモの進め方

チャンネルは`general`・`dev`（開発）・`project-alpha`（案件-アルファ社）の3つが固定で用意されている（`front/server/data/chat-rooms.json`）。`room`引数を省略すると`general`が対象になる。

デモ用のプロンプト例:

- 「`dev`チャンネルの直近のやり取りを見せて」→ `list_chat_messages`が`room: "dev"`で呼ばれる
- 「`general`チャンネルに『定例10時からです』と投稿して」→ `send_chat_message`が呼ばれ、`/chat`画面にも即座に反映される
- 投稿後にブラウザの`/chat`画面を開いて、MCP経由の投稿がSlack風のUIにそのまま表示されることを見せると連携が伝わりやすい

### デモ前にデータを初期状態に戻す

会話が溜まった後にもう一度きれいな状態からデモをやり直したい場合、`front/`側で永続化データを削除してシードデータ（`front/server/data/seed-chat-messages.json`・`seed-tasks.json`）から再生成させる。

```
cd front
npm run demo:reset
```

`task-store.js`・`chat-store.js`は読み込んだデータをメモリ上にもキャッシュするため、**このコマンドを実行した後は`front/`のサーバー（`npm run dev`/`npm run preview`）を再起動する**こと。起動したままだとメモリ上の古いデータが返り続け、リセットが反映されない。
