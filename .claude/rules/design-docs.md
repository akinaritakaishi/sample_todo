---
paths:
  - "front/app/pages/**/*"
  - "front/server/api/**/*"
---

# 画面仕様書・API仕様の更新ルール

`front/app/pages/`配下の画面、または`front/server/api/`配下のAPIに変更を加えた場合は、対応するドキュメントを同じPRで更新すること。

- 画面のUI・挙動が変わった場合: `docs/screens/<画面名>.md`と、埋め込まれているスクリーンショット`docs/screens/<画面名>.png`を更新する（撮影方法は`.claude/skills/verify-front/`を参照）。新しい画面を追加した場合は`docs/screens/README.md`の一覧にも追記する。
- APIのエンドポイント・リクエスト/レスポンスの型が変わった場合: `docs/api/openapi.yaml`を更新する。新しいエンドポイントを追加した場合は`paths`と`components.schemas`の両方を追記する。

`docs/pr-screenshots/`はPRごとの動作確認の証跡（履歴）であり、`docs/screens/`とは別物（`docs/screens/README.md`参照）。両者を混同しないこと。
