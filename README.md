# sample_todo
demo

## todo-app

React + Vite構成のタスク管理アプリです。

```
cd todo-app
npm install
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド（dist/ に出力）
```

- `src/App.jsx` — 画面全体のロジック（追加・完了切替・削除・完了済み一括削除）
- `src/TaskItem.jsx` — タスク1件分の表示
- `src/tasks.js` — localStorage保存・初期データ・日付フォーマット
- `src/style.css` — スタイル
