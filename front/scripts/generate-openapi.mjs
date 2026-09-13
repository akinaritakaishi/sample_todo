#!/usr/bin/env node
// front/server/api配下のdefineRouteMetaから、Nitroがビルド時にプリレンダーした
// .output/public/_openapi.json を読み取り、内部ルート（/_openapi.json自身や
// /_scalar、/_swagger、/__nuxt_island/*など）を取り除いた上でdocs/api/openapi.jsonに
// 書き出す。`npm run build`の後に実行する想定（package.jsonの
// generate:openapiスクリプトが両方まとめて実行する）。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sourcePath = path.resolve(__dirname, '../.output/public/_openapi.json')
const destDir = path.resolve(__dirname, '../../docs/api')
const destPath = path.join(destDir, 'openapi.json')

const raw = JSON.parse(readFileSync(sourcePath, 'utf-8'))

const paths = Object.fromEntries(
  Object.entries(raw.paths).filter(([route]) => route.startsWith('/api/')),
)

const output = {
  ...raw,
  servers: [
    { url: 'http://localhost:3000', description: 'ローカル開発/本番プレビューサーバー' },
  ],
  paths,
}

mkdirSync(destDir, { recursive: true })
writeFileSync(destPath, `${JSON.stringify(output, null, 2)}\n`, 'utf-8')
console.log(`Wrote ${destPath}`)
