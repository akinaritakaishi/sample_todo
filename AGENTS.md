# AGENTS.md

このファイルは、このリポジトリで作業するAIエージェント向けのガイダンスです。Claude Codeは`CLAUDE.md`からこのファイルを読み込みます（ADR 0010）。

## コマンド

アプリ本体のコマンドは `front/` 配下、MCPサーバーのコマンドは `mcp-server/` 配下で実行します。

```
cd front
npm ci
npm run dev      # 開発サーバー起動 (Nuxt)
npm run build    # 本番ビルド、出力先は front/.output/
npm run preview  # 本番ビルドのプレビュー
npm run lint      # ESLintによる静的解析（エージェントがfront/配下のファイルを編集した際は、そのファイルだけhookでも自動実行される）
npm run generate:openapi  # docs/api/openapi.json を再生成
npm run demo:reset        # front/.data配下を削除し、次回アクセス時にシードデータへ戻す（デモの再実行前などに使用）
```

```
cd mcp-server
npm ci
npm start        # MCPサーバーをstdioで起動（先にfront/の開発/本番サーバーを起動しておくこと）
```

MCPクライアントへのMCPサーバー登録手順（Claude Code CLI / Claude Desktopの例）やデモの進め方は`mcp-server/README.md`を参照。`./scripts/demo-up.sh [PORT]`（リポジトリルートで実行）で、依存インストール・データのシードへのリセット・front/起動・MCPサーバー登録までを一括実行できる。停止は`./scripts/demo-down.sh [PORT]`。

`npm run lint`（front/）はPull Request作成時にGitHub Actions（`.github/workflows/lint.yml`）でも自動実行されます。テストランナーは整備されていないため、`npm test` が存在する前提で作業しないこと。

## アーキテクチャ

詳細な説明は `docs/Architecture.md` を参照。画面ごとの仕様は `docs/screens/`、UIの配色・強調表示のルールは `docs/design-guidelines.md`、APIの仕様は `docs/api/openapi.json`（`front/server/api/**/*.js`の`defineRouteMeta`から`npm run generate:openapi`で自動生成、詳細は`docs/api/README.md`）を参照。あるファイルを変えたときに見直すべき記述の対応表は`docs/doc-map.md`にある。要点のみここに記す。

`front/` は Nuxt 4 (Vue 3) 製のアプリで、ToDo画面（`/`）とチャットツール画面（`/chat`）の2ページを持つ。ロジックはクライアント側の `app/` とサーバー側の `server/` に分かれる。

- `app/pages/index.vue` — ToDo画面。`useFetch`/`$fetch` で `server/api/tasks` を呼び出し、追加・完了切替・削除・完了済み一括削除を行う。
- `app/pages/chat.vue` — チャット画面。Slack風にチャンネル（部屋）一覧をサイドバーに表示し、`server/api/chat/rooms`・`server/api/chat/messages`（チャンネルID`room`をクエリ指定）を呼び出して、選択中チャンネルのメッセージ一覧取得と投稿を行う。
- `app/components/TaskItem.vue` — タスク1件分の表示のみを行う。propsと現在日時に依存する（期限の強調表示は`getDueStatus()`でマウント後のブラウザのローカル日付から判定するため、同じpropsでも日付が変われば表示が変わる。SSR時は強調しない）。
- `app/utils/tasks.js` / `app/utils/chat.js` — 表示用のフォーマット関数・判定関数（`formatDue`、期限区分を判定する`getDueStatus`とそのラベル`DUE_STATUS_LABELS`、`formatTime`、アバター表示用の`getAvatarInitial`/`getAvatarColor`）。Nuxtの自動importで各ページから参照される。
- `server/api/tasks/*` — タスクのCRUD API。`server/utils/task-store.js` を通じてサーバー側JSONファイルに永続化する。
- `server/api/chat/*` — チャンネル一覧取得・チャットメッセージの取得・投稿API。`server/utils/chat-store.js` を通じてサーバー側JSONファイルに永続化する（チャンネル一覧は`server/data/chat-rooms.json`の固定データ）。
- `server/utils/json-store.js` — `front/.data/`配下のJSONファイルの読み書きを行う共通ユーティリティ（gitignore対象、初回はシードデータにフォールバック）。
- `server/data/seed-tasks.json` — タスクの初期データ（シードデータ）の定義。`{ title, offsetDays, done }` の配列で、`offsetDays` は今日からの相対日数。
- `server/data/seed-chat-messages.json` — チャットの初期データ（シードデータ）の定義。`{ room, author, text, offsetMinutes }` の配列で、`offsetMinutes` は現在時刻からの相対分数。

`mcp-server/` は`front/`とは独立したNode.jsプロジェクトで、`@modelcontextprotocol/sdk`によるMCPサーバー（stdio）を提供する。`list_chat_messages`（読み取り）・`send_chat_message`（書き込み）の2ツールを持ち、いずれも任意の`room`引数（省略時は`"general"`）でチャンネルを指定でき、`front/`が提供するHTTP API（既定値 `http://localhost:3000`、`CHAT_API_BASE_URL`環境変数で変更可）を叩くことでチャットデータを読み書きする。データストアに直接アクセスすることはない。

## ルール

コーディング規約・Git規約・ADR運用・`docs/demo/`の扱いなどの詳細は `.claude/rules/` 配下に分割してある。ファイルタイプ・ディレクトリに紐づくもの（コーディング規約など）は該当パスを開いたときだけ読み込まれ、Git規約・ADR運用のようにpathsを持たないものは常時読み込まれる。このファイルには、どのセッションでも常に前提となる概要だけを書く。`.claude/rules/`を自動で読み込むのはClaude Codeだけなので、ほかのエージェントは該当するパスを編集する前に、そのルールを自分で読むこと。

## エージェント向けの指示・設定の構成

いずれも、今使っているClaude Codeの形式（`.claude/`配下）で置いている。

- `.claude/rules/` — 規約・運用ルール（上記）。`.claude/`配下やこのファイルを編集するときの約束は`agent-config.md`。
- `.claude/skills/` — 定型ワークフロー。`fix-and-verify`（修正→`verify-front`で動作確認→`commit-and-pr`でPR化→監視）、`pr-review`（材料を用意して`reviewer`サブエージェントにレビューさせ、結果をPRに提出）、`issue-create`、`adr`のほか、勉強会デモ用の`expense-check`・`writing-compare`がある。
- `.claude/agents/reviewer.md` — `pr-review`から呼ばれる読み取り専用のレビュー担当（ADR 0009）。
- `.claude/hooks/lint-front.mjs` — `front/`配下をEdit/Writeした直後にそのファイルだけESLintを実行するPostToolUse hook。
- `.claude/hooks/doc-sync-reminder.mjs` — ターンの終わりにブランチの変更を`docs/doc-map.md`と突き合わせ、対応する記述が未更新なら見直しを促すStop hook（同じセッションで同じ組み合わせは1回だけ）。
- `.claude/settings.json` — 権限（deny/allow）とhookの登録。
- `.mcp.json` — プロジェクトのMCPサーバー（`sample-todo-chat`）。GitHubの操作はGitHub MCPツール（`mcp__github__*`）が無い環境では`gh` CLIで行う。

このファイル・`.claude/rules/`・スキルは「AIに守ってもらう指示（お願い）」、絶対に守らせたい制約（`.env`系の読み取り禁止、force push・`rm -rf`の禁止など）は `.claude/settings.json` の `permissions` で「強制」する、という役割分担にしている（ADR 0008）。個人用の設定は `.claude/settings.local.json`（ルートの`.gitignore`で除外）に置く。
