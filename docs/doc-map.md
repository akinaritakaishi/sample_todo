# ドキュメント対応表

「このファイルを変えたら、どの記述が古くなりうるか」の対応表です。コードやドキュメントを変更したら、該当する行の「見直す記述」を確認し、必要なら同じPRで更新してください。

人とAIエージェントの両方が読むほか、`.claude/hooks/doc-sync-reminder.mjs`（Stop hook）がこの表を読み、そのセッションで変更したファイル（未コミットの変更・未追跡のファイル・セッション開始後のコミット）のうち「変更したパス」に当たるものがあるのに、対応する「見直す記述」がブランチ上（mainとのmerge-baseからの差分＋未コミットの変更＋未追跡のファイル）で変わっていなければ、エージェントに見直しを促します。更新不要と判断した場合はそのままで構いません（同じセッションでは同じ組み合わせを繰り返し促しません）。経緯はADR 0011を参照。

## 書き方

- 1行に1つの対応を書く。「変更したパス」「見直す記述」のセルには、パスをバッククォートで囲んで書く（複数可）。`*`は`/`を含まない任意の文字列、`**`は任意の階層に当たる。
- 「きっかけ」が`変更`ならファイルの追加・変更・削除のすべて、`追加・削除`ならファイルの追加・削除・リネームのときだけ対象にする（構成の説明のように、中身の変更では古くならない記述向け）。
- 見直す記述にglob（`docs/screens/**`など）を書いた場合は、当たるファイルのどれかが変わっていれば更新済みとみなす。
- 作業中に「この変更で、表にない記述が古くなった」と気づいたら、この表に行を追加する。

## 対応表

| 変更したパス | きっかけ | 見直す記述 | 確認すること |
| --- | --- | --- | --- |
| `front/app/pages/**` | 変更 | `docs/screens/**` | 画面のUI・挙動が変わったなら仕様書とスクリーンショット（`design-docs`ルール） |
| `front/app/components/**` `front/app/utils/**` `front/app/assets/**` | 変更 | `docs/screens/**` | 画面の見た目・挙動が変わったなら仕様書とスクリーンショット |
| `front/app/components/**` `front/app/utils/tasks.js` `front/app/assets/**` | 変更 | `docs/design-guidelines.md` | 配色・強調表示（期限の区分など）のルールと実装が一致しているか |
| `front/server/api/**` | 変更 | `docs/api/openapi.json` | `defineRouteMeta`を更新し`npm run generate:openapi`で再生成したか（手編集しない） |
| `front/server/api/chat/**` | 変更 | `mcp-server/index.js` `mcp-server/README.md` | MCPサーバーが叩くAPIのパス・パラメータ・レスポンス形状と合っているか |
| `front/server/data/seed-tasks.json` | 変更 | `docs/screens/tasks.md` `docs/demo/README.md` | 初期表示の説明、デモ台本の期待表示 |
| `front/server/data/seed-chat-messages.json` | 変更 | `docs/screens/chat.md` `docs/demo/README.md` `docs/demo/slack-thread.md` `docs/demo/expense/README.md` | 初期表示の説明、`dev`チャンネルのシナリオ、`expense`チャンネルの案内、デモ台本（`demo-docs`ルール） |
| `front/server/data/chat-rooms.json` | 変更 | `docs/screens/chat.md` `mcp-server/README.md` | チャンネル一覧の説明、MCPツールで指定できる`room` |
| `docs/demo/slack-thread.md` | 変更 | `front/server/data/seed-chat-messages.json` | `dev`チャンネルのシナリオと揃っているか |
| `docs/design-guidelines.md` | 変更 | `docs/demo/README.md` | デモ台本の期待表示・進行 |
| `docs/demo/expense/tools/generate.py` | 変更 | `docs/demo/expense/README.md` | 再生成した申請・台帳とデモ台本の期待結果 |
| `mcp-server/index.js` | 変更 | `mcp-server/README.md` `AGENTS.md` `docs/Architecture.md` | ツール名・引数・既定値・環境変数の説明 |
| `front/package.json` `mcp-server/package.json` | 変更 | `AGENTS.md` `README.md` | 「コマンド」の一覧（npmスクリプトの追加・削除・意味の変更） |
| `scripts/**` | 変更 | `AGENTS.md` `README.md` `mcp-server/README.md` | デモの起動・停止手順の説明 |
| `.mcp.json` | 変更 | `AGENTS.md` `README.md` `mcp-server/README.md` | MCPサーバーの名前・登録方法 |
| `front/app/**` `front/server/**` | 追加・削除 | `AGENTS.md` `docs/Architecture.md` `README.md` | ディレクトリ構成・ファイルの役割の説明 |
| `.claude/skills/**` `.claude/agents/**` `.claude/hooks/**` | 追加・削除 | `AGENTS.md` `README.md` | 「エージェント向けの指示・設定の構成」の一覧（`agent-config`ルール） |
| `docs/*.md` `docs/*/README.md` | 追加・削除 | `README.md` `AGENTS.md` | 「docs」「アーキテクチャ」節のドキュメント一覧 |
| `docs/doc-map.md` | 変更 | `.claude/hooks/doc-sync-reminder.mjs` | 見出し・列構成・globの書き方を変えた場合、hookがまだ解析できるか（解析できないと通知が黙って止まる） |
| `.claude/hooks/doc-sync-reminder.mjs` | 変更 | `docs/doc-map.md` | 冒頭の説明（対象にする変更の範囲）と「書き方」節が、hookの挙動と合っているか |
