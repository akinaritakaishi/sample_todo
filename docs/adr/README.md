# ADR（Architecture Decision Record）

このディレクトリには、このプロジェクトで行った設計・技術選定・運用ルールなどの意思決定を、
「なぜその決定に至ったか」という経緯つきで記録しています。

- ファイルは`NNNN-slug-in-english.md`という連番付きの名前です。番号が新しいほど新しい決定です
- 決定を覆した場合、古いADRは削除せず「廃止（後継: ADR NNNN）」というステータスに更新して残します。ここは「今の正解集」ではなく「決定の履歴」です
- 記録の作成は`.claude/skills/adr/SKILL.md`のスキルに従って行っています（Claude Codeに「ADRを書いて」と頼むか、設計判断があった際に提案されたら作成します）

## 一覧

- [0001: プロジェクト指示をCLAUDE.mdと`.claude/rules/`に分割する](./0001-split-claude-md-into-rules.md)
