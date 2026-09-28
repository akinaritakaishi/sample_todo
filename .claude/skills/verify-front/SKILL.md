---
name: verify-front
description: front/(Nuxt製アプリ)を実際に起動し、Playwrightでスクリーンショットとブラウザconsoleのerror/warningを採取して動作確認するための、このリポジトリ専用のスキル。UIに影響する修正の確認、レイアウト崩れやconsoleエラーの有無のチェック、「動かして見せて」「スクショで確認して」といった依頼で使う。このコンテナにはPlaywrightが常設されていないため、都度手作業でインストール手順を組み立てるのではなく、必ずこのスキルの`scripts/run-and-verify.sh`を使うこと。汎用の`run`スキルよりも、このリポジトリでの動作確認では優先して使う。
---

# front/ の起動とPlaywright動作確認

`front/`はテストランナーが整備されていないアプリ（`CLAUDE.md`参照）なので、UIに関わる変更の正しさは実際に画面を開いて確認するしかありません。このスキルは、その確認作業を毎回手作業で組み立てずに済むよう、起動からPlaywrightでのスクリーンショット・consoleログ採取、後片付け（devサーバー停止）までを1本のスクリプトにまとめたものです。

## なぜスクリプト化したか

このコンテナには通常Playwrightがインストールされておらず、ブラウザ本体（Chromium）だけが `/opt/pw-browsers/chromium` に用意されています（Windowsのローカル環境での違いは後述の「Windows（Git Bash）で使う場合」を参照）。そのため動作確認のたびに「ポートが競合しないdevサーバーの起動方法」「`/tmp`へのPlaywright即席インストール」「終了時のプロセス後始末」を都度考えると、手順がぶれたりdevサーバーが停止し忘れでプロセスがリークしたりします。`scripts/run-and-verify.sh` はこれらを毎回同じ手順で確実に行うためのものです。

## 使い方

```bash
.claude/skills/verify-front/scripts/run-and-verify.sh [PORT] [PATH] [OUT_DIR]
```

- `PORT`: 固定ポート番号。省略時は `5183`。他のプロセスと衝突する場合だけ変更すればよい。
- `PATH`: アクセスするパス。省略時は `/`（ToDo画面）。チャット画面を確認する場合は `/chat` を指定する。
- `OUT_DIR`: スクリーンショット・ログの出力先。省略時は一時ディレクトリを自動作成する。作業用の出力なので、可能であればセッションのスクラッチディレクトリを指定するとよい。

実行すると内部で以下を行う。

1. `front/`で `npm run dev -- --port <PORT>` をバックグラウンド起動し、ポートが応答するまで待つ
2. `front/node_modules/playwright` があればそれを使い、無ければリポジトリ外のスクラッチ領域（既定 `/tmp/verify-front-pw`、`VERIFY_FRONT_SCRATCH_DIR`環境変数で変更可）に `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` を付けて軽量インストールする（ブラウザ本体の再ダウンロードを避け、既存の `/opt/pw-browsers` を使う）
3. `scripts/capture.cjs` で対象URLを開き、`OUT_DIR/screenshot.png`（フルページ）と `OUT_DIR/console.json`（`error`/`warning`/`pageerror`のみ）を出力する
4. 成功・失敗にかかわらず`trap`でdevサーバープロセスを停止する

スクリーンショットは`docs/screens/`の仕様書にもそのまま使えるよう、撮影前にNuxt DevToolsのバッジを非表示にしている。

## Windows（Git Bash）で使う場合

スクリプトは`uname -s`でWindows（MINGW/MSYS/Cygwin）を判定し、次のように動作を切り替える。呼び出し方はLinuxと同じで、Git Bash（ClaudeのBashツール）から実行する。

- devサーバー: `setsid`が無いため普通にバックグラウンド起動し、終了時は`taskkill /T /F`でプロセスツリーごと停止する。それでも`PORT`でLISTENしているプロセスが残っていれば、それも停止する。
- ブラウザ: `/opt/pw-browsers`が無いため、インストール済みのChrome（無ければEdge）をPlaywrightの`channel`指定で使う。ブラウザ本体のダウンロードは不要。`PLAYWRIGHT_CHANNEL`（`chrome`/`msedge`）や`CHROMIUM_EXECUTABLE_PATH`環境変数で上書きできる。
- Playwrightの一時インストール先: 既定の`/tmp/verify-front-pw`（Git BashではユーザーのTempフォルダ）で動くが、セッションのスクラッチディレクトリがあれば`VERIFY_FRONT_SCRATCH_DIR`で指定するとよい。

### 既に別のfront/のdevサーバーが動いている場合

デモ用などで`front/`のdevサーバー（例: `./scripts/demo-up.sh`で起動したport 3000）が動いていると、Nuxtのロックにより「Another Nuxt dev server is already running」で起動に失敗する（`OUT_DIR/dev-server.log`で確認できる）。同じ`front/`で2つ目のdevサーバーを動かすと`.nuxt/`と`.data/`を共有して既存サーバーを壊しうるため、`NUXT_IGNORE_LOCK=1`をそのまま付けて回避しないこと。次のどちらかで対応する。

- ユーザーに確認の上、既存のサーバーを停止してから実行する（`./scripts/demo-down.sh [PORT]`）。
- 既存サーバーを止めたくない場合は、スクラッチディレクトリに`git worktree add`で作業ツリーを複製し（未コミットの変更は`git diff | git apply`で持ち込む）、そこで`front/`の`npm ci`を行ってから、`NUXT_IGNORE_LOCK=1`を付けて複製側のスクリプトを実行する。`.nuxt/`・`.data/`が別になるので既存サーバーに影響しない。使い終わった作業ツリーは`git -c core.longpaths=true worktree remove --force <path>`で削除する（Windowsでは`node_modules`のパスが長く、`core.longpaths`無しだと削除に失敗する）。

## 実行後にやること

1. `OUT_DIR/screenshot.png` を`Read`ツールで開いてユーザーに見せる、または`SendUserFile`で送る
2. `OUT_DIR/console.json` の中身を確認し、空でなければどんなエラー/警告が出ているかを報告する（今回の修正と無関係な既存の警告か、今回の変更で新たに出たものかを区別する）
3. スクリプトが非ゼロ終了した場合は `OUT_DIR/dev-server.log` を確認し、devサーバー起動失敗の原因（ポート競合・依存未インストールなど）を特定する

## 他スキルとの関係

- `fix-and-verify`スキルのステップ3（動作確認）から、UIに影響する変更の確認としてこのスキルが呼ばれる想定。
- 汎用の`run`スキルは「プロジェクト固有の起動スキルがあればそれを優先する」方針なので、このリポジトリで単に「アプリを起動して」と言われた場合もこのスキルが使われる。
- スクリーンショットの一括採取だけで console のエラー確認が不要な軽い確認であっても、プロセスの後始末まで面倒を見てくれるため、素朴に`npm run dev`を直接叩くよりこのスキルを使うほうが安全。
