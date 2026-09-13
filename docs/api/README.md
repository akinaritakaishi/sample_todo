# API仕様（OpenAPI）

`openapi.json`は手書きではなく、`front/server/api/`配下の各ルートファイルに書かれた`defineRouteMeta({ openAPI: {...} })`から、Nitro（Nuxtのサーバーエンジン）のOpenAPI生成機能を使って自動生成したものである。仕様の一次情報はコード（各ルートファイル）側にあり、このファイルはその出力結果を確認・共有するためのスナップショットに過ぎない。

## 生成方法

```
cd front
npm run generate:openapi
```

内部的には`nuxt build`でプリレンダーされる`.output/public/_openapi.json`（Nitroの標準機能）を読み込み、内部ルート（`/_openapi.json`自身、`/_scalar`、`/_swagger`、`/__nuxt_island/*`など）を取り除いた上で`docs/api/openapi.json`に書き出す（`front/scripts/generate-openapi.mjs`）。

## APIの仕様を変更したら

1. 対象の`front/server/api/**/*.js`ファイルの`defineRouteMeta`を更新する（新しいスキーマが必要なら、いずれかのルートの`openAPI.$global.components.schemas`に追記する。現在は`server/api/tasks/index.get.js`にまとめて定義している）。
2. `npm run generate:openapi`を実行し、`docs/api/openapi.json`を再生成する。
3. 生成された差分をコミットに含める。

このファイルを直接手編集しないこと（次回生成時に上書きされる）。

## ブラウザで確認する（開発時）

`npm run dev`で開発サーバーを起動した状態で、以下にアクセスすると仕様をUIで閲覧できる（Nitroの標準機能）。

- `/_scalar` — Scalarによる仕様ビューア
- `/_swagger` — Swagger UI
- `/_openapi.json` — 生成されたOpenAPIドキュメント（このディレクトリの`openapi.json`と同じ内容。内部ルートを含む）
