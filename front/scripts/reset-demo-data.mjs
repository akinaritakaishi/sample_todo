#!/usr/bin/env node
// front/.data配下の永続化ファイル（tasks.json・chat-messages.json）を削除する。
// 削除後は次回アクセス時にserver/data/seed-tasks.json・
// server/data/seed-chat-messages.jsonからシードデータが再生成される
// （server/utils/json-store.jsのフォールバック挙動）。
// デモ前に「初期状態に戻したい」ときに使う想定。
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve(process.cwd(), '.data')
const files = ['tasks.json', 'chat-messages.json']

for (const file of files) {
  const filePath = path.join(dataDir, file)
  if (existsSync(filePath)) {
    rmSync(filePath)
    console.log(`Removed ${filePath}`)
  } else {
    console.log(`(skip) ${filePath} は存在しません`)
  }
}

console.log(
  'デモ用データをリセットしました。task-store.js/chat-store.jsはメモリ上にもデータをキャッシュするため、' +
    'front/の開発/本番サーバーを再起動してからアクセスしてください（起動したままでは反映されません）。',
)
