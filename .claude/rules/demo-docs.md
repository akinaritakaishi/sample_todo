---
paths:
  - "docs/demo/**"
---

# `docs/demo/` の扱い

`slack-thread.md` は**勉強会用の架空の資料**（ファイル冒頭にその旨明記あり）で、Claude Codeのデモ用シナリオとして使うためのもの。実在の社内規程ではなく、アプリのビルドにも含まれない。タスクの中でその内容を適用するよう明示的に指示された場合にのみ参照すること。

同じシナリオは`front/server/data/seed-chat-messages.json`の`dev`チャンネルにも入っている。どちらかを変更する場合はもう一方も揃えること。シナリオ中の「デザインのルール」は`docs/design-guidelines.md`を指す。

`README.md`はこのシナリオのデモ台本。シードデータ（チャット・タスク）やガイドラインを変更した場合は、台本の期待表示・進行も合わせて更新すること。

## `expense/`（デモ2: 経費精算チェック）

`expense/`配下も**勉強会用の架空の資料**（規程・申請書・領収書・人物・店舗・登録番号はすべて架空）。スキル`expense-check`（`.claude/skills/expense-check/SKILL.md`）から参照される。台本は`expense/README.md`。

- `経理用/10月申請分_経費台帳.xlsx`はデモ中にスキルが書き換える。コミットするのは見出し行のみの状態にし、`scripts/demo-up.sh`が`git restore`で戻す。
- `10月申請分/`の申請書・領収書、`経費精算ルール/`の申請書テンプレート、台帳は`expense/tools/generate.py`で生成している。内容を変える場合はスクリプトを直して再生成し、台本（`expense/README.md`）の期待結果も揃えること。
- 経費精算チャンネル（`expense`）の案内メッセージは`front/server/data/seed-chat-messages.json`に入っている。

