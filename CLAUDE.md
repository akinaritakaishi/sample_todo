# CLAUDE.md

このファイルは、このリポジトリで作業する際にClaude Code (claude.ai/code) に向けたガイダンスを提供します。

## コマンド

アプリ本体のコマンドは `front/` 配下、MCPサーバーのコマンドは `mcp-server/` 配下で実行します。

```
cd front
npm install
npm run dev      # 開発サーバー起動 (Nuxt)
npm run build    # 本番ビルド、出力先は front/.output/
npm run preview  # 本番ビルドのプレビュー
npm run lint      # ESLintによる静的解析
```

```
cd mcp-server
npm install
npm start        # MCPサーバーをstdioで起動（先にfront/の開発/本番サーバーを起動しておくこと）
```

`npm run lint`（front/）はPull Request作成時にGitHub Actions（`.github/workflows/lint.yml`）でも自動実行されます。テストランナーは整備されていないため、`npm test` が存在する前提で作業しないこと。

## アーキテクチャ

詳細な説明は `docs/Architecture.md` を参照。画面ごとの仕様は `docs/screens/`、APIの仕様は `docs/api/openapi.yaml` を参照。要点のみここに記す。

`front/` は Nuxt 4 (Vue 3) 製のアプリで、ToDo画面（`/`）とチャットツール画面（`/chat`）の2ページを持つ。ロジックはクライアント側の `app/` とサーバー側の `server/` に分かれる。

- `app/pages/index.vue` — ToDo画面。`useFetch`/`$fetch` で `server/api/tasks` を呼び出し、追加・完了切替・削除・完了済み一括削除を行う。
- `app/pages/chat.vue` — チャット画面。`server/api/chat/messages` を呼び出し、メッセージの一覧取得と投稿を行う。
- `app/components/TaskItem.vue` — タスク1件分の表示のみを行う。propsのみに依存する。
- `app/utils/tasks.js` / `app/utils/chat.js` — 表示用のフォーマット関数（`formatDue`、`formatTime`）。Nuxtの自動importで各ページから参照される。
- `server/api/tasks/*` — タスクのCRUD API。`server/utils/task-store.js` を通じてサーバー側JSONファイルに永続化する。
- `server/api/chat/*` — チャットメッセージの取得・投稿API。`server/utils/chat-store.js` を通じてサーバー側JSONファイルに永続化する。
- `server/utils/json-store.js` — `front/.data/`配下のJSONファイルの読み書きを行う共通ユーティリティ（gitignore対象、初回はシードデータにフォールバック）。
- `server/data/seed-tasks.json` — タスクの初期データ（シードデータ）の定義。`{ title, offsetDays, done }` の配列で、`offsetDays` は今日からの相対日数。

`mcp-server/` は`front/`とは独立したNode.jsプロジェクトで、`@modelcontextprotocol/sdk`によるMCPサーバー（stdio）を提供する。`list_chat_messages`（読み取り）・`send_chat_message`（書き込み）の2ツールを持ち、いずれも`front/`が提供するHTTP API（既定値 `http://localhost:3000`、`CHAT_API_BASE_URL`環境変数で変更可）を叩くことでチャットデータを読み書きする。データストアに直接アクセスすることはない。

## ルール

コーディング規約・Git規約・ADR運用・`docs/demo/`の扱いなどの詳細は `.claude/rules/` 配下に分割してある。ファイルタイプ・ディレクトリに紐づくもの（コーディング規約など）は該当パスを開いたときだけ読み込まれ、Git規約・ADR運用のようにpathsを持たないものは常時読み込まれる。このファイルには、どのセッションでも常に前提となる概要だけを書く。
