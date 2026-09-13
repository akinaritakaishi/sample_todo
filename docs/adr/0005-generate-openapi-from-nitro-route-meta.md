# ADR 0005: OpenAPIドキュメントをNitroのdefineRouteMetaから自動生成する

- ステータス: 承認
- 日付: 2026-09-13

## コンテキスト

ADR 0004で`docs/api/openapi.yaml`を新設し、現行のAPIエンドポイントを手書きのOpenAPI 3.0ドキュメントとして記録した。その際「エンドポイント数が少なく手書きのコストが低い」ことを理由に自動生成の導入を見送っていたが、ユーザーから「自動生成にしたい」との要望があった。手書きのままだとコードとドキュメントの乖離が起きうる点は、ADR 0004の「結果・影響」でも懸念として明記していた。

調査の結果、Nuxtのサーバーエンジンである Nitro には、各APIルートファイルに`defineRouteMeta({ openAPI: {...} })`でメタ情報を書くと、そこからOpenAPIドキュメントを自動生成する標準機能（`nitro.experimental.openAPI` / `nitro.openAPI`設定、`production: 'prerender'`でビルド時に静的ファイル化）があることが分かった。仕様がルートの実装ファイルと同じ場所に書かれるため、実装との乖離が起きにくい。

## 決定

- `front/nuxt.config.ts`で`nitro.experimental.openAPI: true`と`nitro.openAPI.production: 'prerender'`を有効にする。
- `front/server/api/**/*.js`の各ルートファイルに`defineRouteMeta({ openAPI: {...} })`で仕様（summary、description、requestBody、responsesなど）を記述する。共通スキーマ（`Task`、`ChatMessage`など）は`server/api/tasks/index.get.js`の`openAPI.$global.components.schemas`にまとめて定義し、他のルートから`$ref`で参照する。
- `front/scripts/generate-openapi.mjs`を追加し、`npm run generate:openapi`（`nuxt build`→スクリプト実行）で、ビルド時にプリレンダーされる`.output/public/_openapi.json`から内部ルート（`/_openapi.json`自身、`/_scalar`、`/_swagger`など）を取り除いた上で`docs/api/openapi.json`に書き出す。
- `docs/api/openapi.yaml`（手書き）は削除し、`docs/api/openapi.json`（自動生成）に置き換える。`docs/api/README.md`に生成方法と「直接手編集しない」旨を明記する。
- ADR 0004の「検討した代替案」で見送った自動生成を採用することになったため、ADR 0004は本ADRへの参照を追記した上でそのまま残す（`docs/screens/`に関する決定は引き続き有効なため、ADR全体を「廃止」にはしない）。

## 検討した代替案

- **手書きのままにする**: 変更コストは増えないが、ユーザーの要望（自動生成にしたい）に応えられず、コードとドキュメントの乖離という当初からの懸念も解消されない。
- **OpenAPI仕様からコード（型やバリデーション）を生成する方向（Design-first）**: 逆方向のアプローチ。今回は既存の実装が先にあり、そこに仕様を後付けする状況だったため、コードからドキュメントを生成するCode-firstの方が自然だと判断した。
- **サードパーティのOpenAPI生成ツール（例: zod-to-openapiなど）を導入する**: Nitroに標準機能が既にあり、追加の依存を増やす理由がなかったため見送った。

## 結果・影響

- APIの仕様を変更する際は、`docs/api/openapi.json`を直接編集するのではなく、対応する`front/server/api/**/*.js`の`defineRouteMeta`を更新してから`npm run generate:openapi`を実行する運用になる（`.claude/rules/design-docs.md`に反映済み）。
- `npm run dev`実行中は`/_scalar`（Scalar UI）・`/_swagger`（Swagger UI）・`/_openapi.json`で仕様をブラウザから直接確認できるようになった（副次的なメリット）。
- 生成された`docs/api/openapi.json`はNitroの出力形式（OpenAPI 3.1、`servers`の自動値など）に従うため、スクリプト側で`servers`を上書きするなど、必要に応じて後処理を加えている。Nitroのバージョンアップで出力形式が変わった場合、`front/scripts/generate-openapi.mjs`の追随が必要になる。
