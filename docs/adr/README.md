# ADR（Architecture Decision Record）

このディレクトリには、このプロジェクトで行った設計・技術選定・運用ルールなどの意思決定を、
「なぜその決定に至ったか」という経緯つきで記録しています。

- ファイルは`NNNN-slug-in-english.md`という連番付きの名前です。番号が新しいほど新しい決定です
- 決定を覆した場合、古いADRは削除せず「廃止（後継: ADR NNNN）」というステータスに更新して残します。ここは「今の正解集」ではなく「決定の履歴」です
- 記録の作成は`.claude/skills/adr/SKILL.md`のスキルに従って行っています（Claude Codeに「ADRを書いて」と頼むか、設計判断があった際に提案されたら作成します）

## 一覧

- [0001: プロジェクト指示をCLAUDE.mdと`.claude/rules/`に分割する](./0001-split-claude-md-into-rules.md)
- [0002: front/をNuxt(Vue)へ移行し、チャットツールとMCPサーバーを追加する](./0002-migrate-to-nuxt-and-add-chat-mcp.md)
- [0003: UIに影響する変更ではPR本文へのスクリーンショット埋め込みを必須にする](./0003-require-pr-screenshots-for-ui-changes.md)（廃止。画像の保存場所・参照先はADR 0006で変更）
- [0004: 画面仕様書(docs/screens)とAPI仕様(OpenAPI)を整備し、変更時の更新を必須にする](./0004-add-screen-specs-and-openapi-docs.md)（OpenAPIの作成方式はADR 0005で変更）
- [0005: OpenAPIドキュメントをNitroのdefineRouteMetaから自動生成する](./0005-generate-openapi-from-nitro-route-meta.md)
- [0006: PR本文のスクリーンショットはdocs/screens/を参照する方式にする（PRごとのアーカイブは廃止）](./0006-reference-docs-screens-in-pr-body-instead-of-archiving.md)
