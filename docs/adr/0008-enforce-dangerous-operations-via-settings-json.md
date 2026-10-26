# ADR 0008: 危険な操作の禁止はプロジェクト共有の`.claude/settings.json`の権限設定で強制する

- ステータス: 承認
- 日付: 2026-10-26

## コンテキスト

秘密情報の混入防止は`commit-and-pr`スキルの`scripts/check_secrets.sh`によるコミット前チェックだけで、Claude Codeが`.env`を読み取る、`git push --force`や`rm -rf`を実行する、といった操作を仕組みとして止められていなかった。CLAUDE.md・`.claude/rules/`・スキルはAIの判断に依存する「お願い」であり、確実に守られる保証はない（Issue #32）。

## 決定

リポジトリに共有の`.claude/settings.json`を追加し、`permissions.deny`で以下を禁止する。

- `.env`・`.env.local`・`.env.*.local`・`.env.{development,production,staging,test}`の読み取り（`.env.example`は読めるよう、`.env.*`の一括指定はしない）
- `git push`の`--force`・`--force-with-lease`・`-f`・`+refspec`
- `rm -rf`とその表記ゆれ（`-fr`・`-r -f`・`--recursive --force`など）

また`permissions.allow`で`front/`の`npm run lint`を確認なしで実行できるようにする。「指示はCLAUDE.md・rules・スキル、強制したい制約はsettings.json」という役割分担をCLAUDE.mdに明記する。

## 検討した代替案

- `.claude/rules/`に「.envを読まないこと」と書く: AIの判断に依存し確実に守られないため不採用
- `Read(**/.env*)`のように一括でdenyする: denyはallowより優先されるため`.env.example`まで読めなくなり不採用

## 結果・影響

- 全メンバーのセッションで上記操作が権限により拒否される。正当に必要な場合は人間が手動で実行する
- Bashのdenyはコマンド文字列のパターン一致なので、`bash -c`経由や別表記などで回避されうる。完全な防御ではないため、`check_secrets.sh`による二重チェックは残す
- 新しい`.env`の命名を使う場合はdenyリストへの追加が必要
