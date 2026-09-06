# sample_todo
demo

## front

React + Vite構成のタスク管理アプリです。

```
cd front
npm install
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド（dist/ に出力）
```

- `src/App.jsx` — 画面全体のロジック（追加・完了切替・削除・完了済み一括削除）
- `src/components/TaskItem.jsx` — タスク1件分の表示
- `src/lib/tasks.js` — localStorage保存・初期データ・日付フォーマット
- `src/style.css` — スタイル

詳細なアーキテクチャは `docs/Architecture.md` を参照してください。

## docs

- `docs/Architecture.md` — アプリの構成・データフローの説明
- `docs/demo/` — 勉強会デモ用の架空資料（デザインガイドライン・Slackスレッド）
