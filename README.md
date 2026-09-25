# sample_todo

Nuxt (Vue 3) 製のシンプルなタスク管理アプリ＋簡易チャットツール（デモ用リポジトリ）。API通信・永続化はNuxtサーバー側で行い、チャットはMCPサーバー経由でも読み書きできます。

## デモをすぐ動かす

```
./scripts/demo-up.sh [PORT]   # front/・mcp-server/の依存インストール、データをシードへリセット、
                               # front/起動、MCPサーバーのClaude Code CLIへの登録までを一括実行（既定ポート3000）
./scripts/demo-down.sh [PORT] # 起動したfront/サーバーを停止
```

詳細は[`mcp-server/README.md`](./mcp-server/README.md)を参照してください。

## front

```
cd front
npm ci
npm run dev      # 開発サーバー起動 (Nuxt)
npm run build    # 本番ビルド（front/.output/ に出力）
npm run preview  # 本番ビルドのプレビュー
npm run lint      # ESLintによる静的解析
npm run generate:openapi  # docs/api/openapi.json を再生成
```

テストランナーは整備されていないため、`npm test`は存在しません。

- `app/pages/index.vue` — ToDo画面（追加・完了切替・削除・完了済み一括削除）
- `app/pages/chat.vue` — チャットツール画面
- `app/components/TaskItem.vue` — タスク1件分の表示専用コンポーネント
- `server/api/` — タスク・チャットメッセージのAPI
- `server/utils/` — サーバー側JSONファイル（`front/.data/`）への永続化ロジック

`npm run lint`はPull Request作成時に`.github/workflows/lint.yml`（GitHub Actions）でも自動実行されます。

## mcp-server

チャットツールのメッセージを読み書きするMCPサーバーです。先に`front/`のサーバー（`npm run dev`または`npm run preview`）を起動しておく必要があります。

```
cd mcp-server
npm ci
npm start
```

詳細なアーキテクチャは [`docs/Architecture.md`](./docs/Architecture.md) を参照してください。

## docs

- [`docs/Architecture.md`](./docs/Architecture.md) — アプリの構成・データフローの説明
- [`docs/screens/`](./docs/screens/) — 画面ごとの仕様書（UI要素・呼び出すAPI・スクリーンショット）
- [`docs/api/openapi.json`](./docs/api/openapi.json) — APIのOpenAPI仕様（`front/server/api/`の`defineRouteMeta`から自動生成、詳細は[`docs/api/README.md`](./docs/api/README.md)）
- [`docs/adr/`](./docs/adr/) — 設計・技術選定・運用ルールの意思決定を記録したADR（Architecture Decision Record）
- [`docs/demo/`](./docs/demo/) — 勉強会デモ用の架空資料（Slackスレッド）。実在の社内規程ではなく、アプリのビルドにも含まれません

## Claude Code向け設定

- [`CLAUDE.md`](./CLAUDE.md) — Claude Codeがこのリポジトリで作業する際の前提ガイダンス
- [`.claude/rules/`](./.claude/rules/) — コーディング規約・Git規約・ADR運用など、パスやトピックごとに分割した詳細ルール
- [`.claude/skills/`](./.claude/skills/) — コミット・PR作成、Issue起票、セルフレビューなど定型作業のスキル定義
