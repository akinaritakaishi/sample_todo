---
paths:
  - "front/app/pages/**/*"
  - "front/server/api/**/*"
---

# 画面仕様書・API仕様の更新ルール

`front/app/pages/`配下の画面、または`front/server/api/`配下のAPIに変更を加えた場合は、対応するドキュメントを同じPRで更新すること。

- 画面のUI・挙動が変わった場合: `docs/screens/<画面名>.md`と、埋め込まれているスクリーンショット`docs/screens/<画面名>.png`を更新する（撮影方法は`.claude/skills/verify-front/`を参照）。新しい画面を追加した場合は`docs/screens/README.md`の一覧にも追記する。
- APIのエンドポイント・リクエスト/レスポンスの型が変わった場合: 変更したルートファイル（`front/server/api/**/*.js`）の`defineRouteMeta`を更新した上で、`cd front && npm run generate:openapi`を実行し`docs/api/openapi.json`を再生成してコミットに含める。`docs/api/openapi.json`を直接手編集しないこと（詳細は`docs/api/README.md`参照）。

UIに影響する変更を含むPRでは、更新した`docs/screens/<画面名>.png`をPR本文にも`<img>`タグ（`main`ブランチを指す絶対URL）で埋め込む（`.claude/skills/commit-and-pr/SKILL.md`5.1節、ADR 0006）。PRごとに別のスクリーンショットを保存するアーカイブは持たない。
