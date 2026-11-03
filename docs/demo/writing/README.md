# デモ: CLAUDE.md / rules で出力がどう変わるか

勉強会用の架空のデモ。スキル`writing-compare`（`.claude/skills/writing-compare/SKILL.md`）を使い、同じお題をサブエージェントに並列で書かせて結果を比べる。複数回（既定3回）繰り返して、回ごとの揺らぎも比べられる。

| ディレクトリ | 追加で効く指示 | 仕組み |
| --- | --- | --- |
| `plain/` | なし（ベースライン） | ルートのCLAUDE.mdのみ |
| `claude-md/` | `claude-md/CLAUDE.md` | サブディレクトリのCLAUDE.mdは、そのディレクトリのファイルを読んだときに読み込まれる |
| `rules/` | `.claude/rules/demo-writing.md` | `paths`付きのルールは、一致するファイルを開いたときだけ読み込まれる |

## 進め方

1. Claude Codeで「文章作成の比較デモをして」と頼む。
2. 各ディレクトリ×回数分のサブエージェントが`お題.md`を読み、`output-<n>.md`に書く（「5回回して」のように回数も指定できる）。
3. ディレクトリ間の比較表と、回ごとの揺らぎ（ルールを毎回守れたか）の表が返ってくる。
4. `claude-md/CLAUDE.md`や`.claude/rules/demo-writing.md`の中身を書き換えて再実行し、変化を見せる。

`output-*.md`はgitignore対象。お題を変える場合は3つの`お題.md`を同じ内容に揃えること。
