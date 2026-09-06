# CLAUDE.md

このファイルは、このリポジトリで作業する際にClaude Code (claude.ai/code) に向けたガイダンスを提供します。

## コマンド

アプリ関連のコマンドはすべてリポジトリ直下ではなく `front/` 配下で実行します。

```
cd front
npm install
npm run dev      # 開発サーバー起動 (Vite)
npm run build    # 本番ビルド、出力先は front/dist/
npm run preview  # 本番ビルドのプレビュー
npm run lint      # ESLintによる静的解析
```

`npm run lint` はPull Request作成時にGitHub Actions（`.github/workflows/lint.yml`）でも自動実行されます。テストランナーは整備されていないため、`npm test` が存在する前提で作業しないこと。

## アーキテクチャ

詳細な説明は `docs/Architecture.md` を参照。要点のみここに記す。

`front/` はルーティングなし・バックエンドなし・外部の状態管理ライブラリなしの、React 18 + Vite によるシングルページアプリです。ロジックは `src/` 配下の3ファイルに集約されています。

- `App.jsx` — 状態（`tasks`、フォーム入力）と全ての変更ロジック（追加・完了切替・削除・完了済み一括削除）を `useState` で保持する。`useEffect` により `tasks` の変更のたびに `localStorage` へ保存する。タスク状態を変更するのはここだけであり、`TaskItem` は表示専用で `onToggle`/`onDelete` の props 経由で呼び出す。
- `lib/tasks.js` — データ層。`STORAGE_KEY`、`loadTasks()`（localStorageの読み込み・検証を行い、値が無い/不正な場合はシードデータにフォールバック）、`createSeedTasks()`、`formatDue()` を提供する。タスクの型は `{ id, title, due, done }` で、`due` はISO形式の日付文字列（`YYYY-MM-DD`）または空文字。
- `components/TaskItem.jsx` — タスク1件分の表示のみを行う。propsのみに依存する。

サーバーは存在せず、永続化はすべてクライアント側の `localStorage`（キーは `STORAGE_KEY` の値）で行われる。

## ルール

コーディング規約・Git規約・ADR運用・`docs/demo/`の扱いなどの詳細は `.claude/rules/` 配下に分割してある（ファイルタイプ・ディレクトリごとに必要なときだけ読み込まれる）。このファイルには、どのセッションでも常に前提となる概要だけを書く。
