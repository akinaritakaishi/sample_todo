import { promises as fs } from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve(process.cwd(), '.data')

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

export async function readJsonFile(fileName, fallback) {
  await ensureDataDir()
  try {
    const raw = await fs.readFile(path.join(dataDir, fileName), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export async function writeJsonFile(fileName, data) {
  await ensureDataDir()
  await fs.writeFile(path.join(dataDir, fileName), JSON.stringify(data, null, 2), 'utf-8')
}
