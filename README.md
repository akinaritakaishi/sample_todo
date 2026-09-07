# sample_todo

React + Vite製のシンプルなタスク管理アプリ（デモ用リポジトリ）。バックエンドを持たず、永続化はブラウザの`localStorage`のみで行います。

## front

```
cd front
npm install
npm run dev      # 開発サーバー起動 (Vite)
npm run build    # 本番ビルド（front/dist/ に出力）
npm run preview  # 本番ビルドのプレビュー
npm run lint      # ESLintによる静的解析
```

テストランナーは整備されていないため、`npm test`は存在しません。

- `src/App.jsx` — 画面全体の状態とロジック（追加・完了切替・削除・完了済み一括削除）
- `src/components/TaskItem.jsx` — タスク1件分の表示専用コンポーネント
- `src/lib/tasks.js` — データ層（localStorage保存・読み込み・初期シードデータ・日付フォーマット）
- `src/style.css` — スタイル

`npm run lint`はPull Request作成時に`.github/workflows/lint.yml`（GitHub Actions）でも自動実行されます。

詳細なアーキテクチャは [`docs/Architecture.md`](./docs/Architecture.md) を参照してください。

## docs

- [`docs/Architecture.md`](./docs/Architecture.md) — アプリの構成・データフローの説明
- [`docs/adr/`](./docs/adr/) — 設計・技術選定・運用ルールの意思決定を記録したADR（Architecture Decision Record）
- [`docs/slides/`](./docs/slides/) — 社内勉強会用スライドのMarkdownソースと生成スクリプト
- [`docs/demo/`](./docs/demo/) — 勉強会デモ用の架空資料（Slackスレッド）。実在の社内規程ではなく、アプリのビルドにも含まれません

## Claude Code向け設定

- [`CLAUDE.md`](./CLAUDE.md) — Claude Codeがこのリポジトリで作業する際の前提ガイダンス
- [`.claude/rules/`](./.claude/rules/) — コーディング規約・Git規約・ADR運用など、パスやトピックごとに分割した詳細ルール
- [`.claude/skills/`](./.claude/skills/) — コミット・PR作成、Issue起票、セルフレビューなど定型作業のスキル定義
