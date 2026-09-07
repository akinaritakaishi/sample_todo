---
name: verify-front
description: front/(Vite製React SPA)を実際に起動し、Playwrightでスクリーンショットとブラウザconsoleのerror/warningを採取して動作確認するための、このリポジトリ専用のスキル。UIに影響する修正の確認、レイアウト崩れやconsoleエラーの有無のチェック、「動かして見せて」「スクショで確認して」といった依頼で使う。このコンテナにはPlaywrightが常設されていないため、都度手作業でインストール手順を組み立てるのではなく、必ずこのスキルの`scripts/run-and-verify.sh`を使うこと。汎用の`run`スキルよりも、このリポジトリでの動作確認では優先して使う。
---

# front/ の起動とPlaywright動作確認

`front/`はテストランナーが整備されていないSPA（`CLAUDE.md`参照）なので、UIに関わる変更の正しさは実際に画面を開いて確認するしかありません。このスキルは、その確認作業を毎回手作業で組み立てずに済むよう、起動からPlaywrightでのスクリーンショット・consoleログ採取、後片付け（devサーバー停止）までを1本のスクリプトにまとめたものです。

## なぜスクリプト化したか

このコンテナには通常Playwrightがインストールされておらず、ブラウザ本体（Chromium）だけが `/opt/pw-browsers/chromium` に用意されています。そのため動作確認のたびに「ポートが競合しないdevサーバーの起動方法」「`/tmp`へのPlaywright即席インストール」「終了時のプロセス後始末」を都度考えると、手順がぶれたりdevサーバーが停止し忘れでプロセスがリークしたりします。`scripts/run-and-verify.sh` はこれらを毎回同じ手順で確実に行うためのものです。

## 使い方

```bash
.claude/skills/verify-front/scripts/run-and-verify.sh [PORT] [PATH] [OUT_DIR]
```

- `PORT`: 固定ポート番号。省略時は `5183`。他のプロセスと衝突する場合だけ変更すればよい（`--strictPort`を使っているため、衝突時はポートを奪わずエラーで終了する）。
- `PATH`: アクセスするパス。省略時は `/`（このアプリはルーティングを持たないSPAなので通常は変更不要）。
- `OUT_DIR`: スクリーンショット・ログの出力先。省略時は一時ディレクトリを自動作成する。作業用の出力なので、可能であればセッションのスクラッチディレクトリを指定するとよい。

実行すると内部で以下を行う。

1. `front/`で `npm run dev -- --port <PORT> --strictPort` をバックグラウンド起動し、ポートが応答するまで待つ
2. `front/node_modules/playwright` があればそれを使い、無ければリポジトリ外のスクラッチ領域（既定 `/tmp/verify-front-pw`、`VERIFY_FRONT_SCRATCH_DIR`環境変数で変更可）に `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` を付けて軽量インストールする（ブラウザ本体の再ダウンロードを避け、既存の `/opt/pw-browsers` を使う）
3. `scripts/capture.cjs` で対象URLを開き、`OUT_DIR/screenshot.png`（フルページ）と `OUT_DIR/console.json`（`error`/`warning`/`pageerror`のみ）を出力する
4. 成功・失敗にかかわらず`trap`でdevサーバープロセスを停止する

## 実行後にやること

1. `OUT_DIR/screenshot.png` を`Read`ツールで開いてユーザーに見せる、または`SendUserFile`で送る
2. `OUT_DIR/console.json` の中身を確認し、空でなければどんなエラー/警告が出ているかを報告する（今回の修正と無関係な既存の警告か、今回の変更で新たに出たものかを区別する）。なお`index.html`にfaviconの`<link>`が無いため、`/favicon.ico`の404エラーは常に出る既知の無害なものであり、これ自体は修正対象ではない
3. スクリプトが非ゼロ終了した場合は `OUT_DIR/dev-server.log` を確認し、devサーバー起動失敗の原因（ポート競合・依存未インストールなど）を特定する

## 他スキルとの関係

- `fix-and-verify`スキルのステップ3（動作確認）から、UIに影響する変更の確認としてこのスキルが呼ばれる想定。
- 汎用の`run`スキルは「プロジェクト固有の起動スキルがあればそれを優先する」方針なので、このリポジトリで単に「アプリを起動して」と言われた場合もこのスキルが使われる。
- スクリーンショットの一括採取だけで console のエラー確認が不要な軽い確認であっても、プロセスの後始末まで面倒を見てくれるため、素朴に`npm run dev`を直接叩くよりこのスキルを使うほうが安全。
