---
name: pr-review
description: 既存のPull Requestの差分をAIでレビューし、指摘をmust/imo/nitsでラベル付けしてPRにインラインコメントし、must指摘がなければApprove・あればRequest changesとしてレビューを提出するスキル。コードの修正・コミット・pushは一切行わない（修正は`fix-and-verify`スキルの担当）。「PRをレビューして」「このPRを見てapproveして」「セルフレビューして」「レビューだけお願い」など、PRのレビュー・承認判断だけを依頼された際に使うこと。レビュー後の修正まで一括で頼まれた場合は`pr-review-loop`スキルを使う。
---

# PRレビュー・承認

## これは何のためのスキルか

Pull RequestのレビューをGitHub ActionsのCIで自動化するとコスト（実行時間・API利用料）がかかるため、その代わりにClaude Codeのセッション内で人が明示的に呼び出して使う手動版のレビューです。

このスキルの責務は **「レビューして、結果（指摘コメントと承認判断）をPRに残す」ことだけ** です。コードの修正・コミット・pushは行いません。指摘の修正は`fix-and-verify`スキルが、このスキルが投稿したレビューコメントを入力として担当します。レビュー→修正を繰り返すワークフローは`pr-review-loop`スキルが両者を呼び出して組み立てます。

## 入力

- 対象PR（番号またはURL）。明示されていなければ、現在のブランチに紐づくPRを`mcp__github__list_pull_requests`（`head`指定）で探し、見つかったPRで合っているかをユーザーに確認してから進める。PRが存在しない場合は、先に`commit-and-pr`スキルでPRを作るよう案内して終了する（このスキル自身はPRを作らない）。

## 手順

### 1. 過去の知見を読む

`references/learnings.md`を読み、「知見一覧」に書かれたチェック観点を意識しながら次のレビューを行う（過去に繰り返し指摘してきたパターンを見落とさないため）。

### 2. 差分をレビューする

`code-review`スキルで対象PRの差分全体をレビューする。effort levelは`medium`（ユーザーから別の指定があればそちらに従う）。`--comment`・`--fix`は使わず、指摘一覧（file・line・summary・failure_scenario・category・verdictなど）を受け取ることに専念する。

### 3. 指摘をmust/imo/nitsに分類する

[Conventional Comments](https://conventionalcomments.org/) を簡略化し、「著者がこれを読んだときにどう受け取ってほしいか」で判断してラベルを付ける。

- **`must:`** 修正必須。バグ・仕様違反・壊れる変更など、直さないとマージすべきでないもの。目安：correctness系で確度が高い（CONFIRMED相当）もの。
- **`imo:`** 提案・意見。目安：correctness系だが確度がやや低い（PLAUSIBLE相当）もの、簡略化・効率化など設計判断が絡むもの。
- **`nits:`** 些末な指摘。命名・空白・コメントの書き方など。

### 4. レビューを提出する（インラインコメント＋承認判断）

GitHub MCPのレビューAPIで、指摘と判断を**1つのレビュー**として提出する。

1. `pull_request_review_write`（`create`）で保留中レビューを作成
2. 指摘ごとに`add_comment_to_pending_review`で該当ファイル・行へインラインコメント。本文は`**must:** <指摘内容>`のようにラベルを太字で先頭に置き、修正担当（`fix-and-verify`）が読んで着手できるよう「何が問題か・どう直すとよいか」まで書く
3. `pull_request_review_write`（`submit_pending`）で、次の判断に従って提出

| 状況 | event | レビュー本文 |
| --- | --- | --- |
| 指摘0件 | `APPROVE` | 「セルフレビューを実施し、指摘はありませんでした。」 |
| must 0件（imo/nitsのみ） | `APPROVE` | 「must指摘はないためApproveします。imo/nitsは任意対応です。」＋件数 |
| must 1件以上 | `REQUEST_CHANGES` | 「must指摘があるため修正をお願いします。」＋must/imo/nits別の件数 |

PR作成者と同じアカウントで実行しているなどの理由でGitHubが`APPROVE`/`REQUEST_CHANGES`を拒否した場合は、`COMMENT`で提出し直し、本文冒頭に「判定: Approve相当」または「判定: Request changes相当」と明記する。

### 5. 知見を蓄積する

今回の指摘のうち、このPR固有ではなく他のPRのレビューでも通用するパターンがあれば、`references/learnings.md`の「知見一覧」末尾に、そのファイルの記入ルールに従って追記する。重複する既存の知見があれば新規追加せず統合する。一般化できるものがなければスキップしてよい。

### 6. 結果を報告する

呼び出し元（ユーザー、または`pr-review-loop`）に、次を簡潔に返す。

- 判定（Approve / Request changes、`COMMENT`で代替した場合はその旨）
- must/imo/nits別の件数と各指摘の要約
- 提出したレビューのURL

## やらないこと

- コードの修正・コミット・push（`fix-and-verify`の担当）
- 既存レビューコメントへの返信やスレッドのresolve（返信は修正側、resolveは人間のレビュアーが行う）
- PRのマージ

## 注意事項

- AIによる一次チェックであり、人間のレビューの代わりにはならない。このスキルのApproveはマージ可否の最終判断ではなく、最終的な承認・マージは人が行うものとして扱う。
- レビュー提出はリモートに影響する操作なので、対象PRが想定どおりかを会話から確認し、違う場合は止める。
