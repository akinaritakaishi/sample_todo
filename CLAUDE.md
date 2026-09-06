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

## `docs/demo/`

`design-guideline.md` と `slack-thread.md` は**勉強会用の架空の資料**（各ファイル冒頭にその旨明記あり）で、「デザインガイドライン＋Slackでのフィードバックスレッドを読んで、UI変更を実装する」というClaude Codeのデモ用シナリオとして使うためのもの。実在の社内規程ではなく、アプリのビルドにも含まれない。タスクの中でそのガイドラインやスレッドの内容を適用するよう明示的に指示された場合（例：期限に応じた色分け表示の実装）にのみ参照すること。

`scenario.md` は上記2ファイルを使った勉強会当日の進行台本（人間向けの準備ドキュメント）。デモの流れ・時間配分・話し言葉台本を記載しているのみで、実装やアプリの挙動に影響するものではない。`.github/workflows/deploy-demo.yml` も同様にこのデモ専用で、ビルドとログ出力のみ行い実際のデプロイは行わない。

## 規約

- UI上の文言は日本語、識別子・コード・コミットメッセージは英語（`src/` の既存スタイルに合わせる）。
- コミットの件名は簡潔な英語の命令形（例: "Migrate todo-app to a React + Vite build setup"）。Conventional Commits形式のプレフィックスは使わない。
- スタイリングは `style.css` のカスタムプロパティ（`:root` を参照）によるプレーンCSSで行い、CSS-in-JSやユーティリティフレームワークは使わない。新しいスタイリング手法を持ち込むのではなく、既存の変数を拡張すること。
- コンポーネントは関数宣言＋hooksで書き、クラスコンポーネントやPropTypes/TypeScriptは使わない。
