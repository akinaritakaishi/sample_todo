#!/usr/bin/env node
// Stop hook: compare the branch's changes with docs/doc-map.md and, when a mapped source changed but
// its related docs did not, ask the agent to review them before finishing.
// Exit code 2 sends stderr back to the agent. Each (source pattern, doc) pair is reported at most once
// per session, so the agent can finish after judging that no update is needed.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const MAP_FILE = 'docs/doc-map.md'
const STATE_FILE = 'claude-doc-sync-reminded.json'
const MAX_SESSIONS = 20

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
if (input.stop_hook_active) process.exit(0)

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()
const mapPath = path.join(projectDir, MAP_FILE)
if (!existsSync(mapPath)) process.exit(0)

function git(args) {
  const result = spawnSync('git', ['-c', 'core.quotepath=false', ...args], { cwd: projectDir, encoding: 'utf8' })
  return result.status === 0 ? result.stdout : null
}

// Glob to RegExp: `**` matches across directories, `*` stays within one path segment.
function globToRegExp(glob) {
  let source = ''
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i]
    if (char === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') {
        source += '(?:.*/)?'
        i += 2
      } else {
        source += '.*'
        i += 1
      }
    } else if (char === '*') {
      source += '[^/]*'
    } else {
      source += char.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    }
  }
  return new RegExp(`^${source}$`)
}

function parseMap(markdown) {
  const section = markdown.split(/^## 対応表\s*$/m)[1] ?? ''
  const rules = []
  for (const line of section.split(/\r?\n/)) {
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
    if (cells.length < 4) continue
    const sources = [...cells[0].matchAll(/`([^`]+)`/g)].map(match => match[1])
    const docs = [...cells[2].matchAll(/`([^`]+)`/g)].map(match => match[1])
    if (sources.length === 0 || docs.length === 0) continue
    rules.push({ sources, addDeleteOnly: cells[1].includes('追加・削除'), docs, note: cells[3] })
  }
  return rules
}

function findBase() {
  for (const ref of ['origin/HEAD', 'origin/main', 'main']) {
    const base = git(['merge-base', 'HEAD', ref])?.trim()
    if (base) return base
  }
  return 'HEAD'
}

// Changed files on the branch (committed since the merge base, plus uncommitted and untracked ones).
// `structural` marks additions, deletions and renames.
function collectChanges() {
  const diff = git(['diff', '--name-status', '-z', '--find-renames', findBase()])
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z'])
  if (diff === null || untracked === null) return null

  const changes = new Map()
  const tokens = diff.split('\0').filter(Boolean)
  for (let i = 0; i < tokens.length; ) {
    const status = tokens[i++]
    const paths = /^[RC]/.test(status) ? [tokens[i++], tokens[i++]] : [tokens[i++]]
    for (const file of paths) changes.set(file, { structural: status[0] !== 'M' && status[0] !== 'T' })
  }
  for (const file of untracked.split('\0').filter(Boolean)) changes.set(file, { structural: true })
  return changes
}

const changes = collectChanges()
if (!changes || changes.size === 0) process.exit(0)

const statePath = git(['rev-parse', '--git-path', STATE_FILE])?.trim()
const resolvedStatePath = statePath ? path.resolve(projectDir, statePath) : null
let state = {}
try {
  if (resolvedStatePath && existsSync(resolvedStatePath)) state = JSON.parse(readFileSync(resolvedStatePath, 'utf8'))
} catch {
  state = {}
}
const sessionId = input.session_id || 'unknown'
const reminded = new Set(state[sessionId] ?? [])

const findings = []
for (const rule of parseMap(readFileSync(mapPath, 'utf8'))) {
  const sourceMatchers = rule.sources.map(globToRegExp)
  const triggers = [...changes]
    .filter(([file, change]) => (!rule.addDeleteOnly || change.structural) && sourceMatchers.some(re => re.test(file)))
    .map(([file]) => file)
  if (triggers.length === 0) continue

  const pendingDocs = rule.docs.filter(doc => {
    const docMatcher = globToRegExp(doc)
    if ([...changes.keys()].some(file => docMatcher.test(file))) return false
    return !reminded.has(`${rule.sources.join(' ')} -> ${doc}`)
  })
  if (pendingDocs.length === 0) continue

  for (const doc of pendingDocs) reminded.add(`${rule.sources.join(' ')} -> ${doc}`)
  findings.push({ triggers, docs: pendingDocs, note: rule.note })
}

if (findings.length === 0) process.exit(0)

if (resolvedStatePath) {
  state[sessionId] = [...reminded]
  const sessions = Object.keys(state)
  for (const old of sessions.slice(0, Math.max(0, sessions.length - MAX_SESSIONS))) delete state[old]
  try {
    writeFileSync(resolvedStatePath, JSON.stringify(state, null, 2))
  } catch {
    // Without the state file the reminder may repeat, but stop_hook_active still prevents a loop.
  }
}

const lines = findings.map(({ triggers, docs, note }) => {
  const shown = triggers.slice(0, 3).join(', ') + (triggers.length > 3 ? ` ほか${triggers.length - 3}件` : '')
  return `- ${shown} が変更されています → ${docs.join(', ')} を見直してください（${note}）`
})
process.stderr.write(
  `${MAP_FILE} の対応表で、変更に対応する記述がまだ更新されていない箇所があります。\n` +
    `${lines.join('\n')}\n` +
    '該当する記述を読んで古くなっていれば更新し、更新不要と判断したものはそのままで構いません（同じセッションでは再度通知しません）。' +
    '対応表にない記述が古くなっていると気づいた場合は、対応表にも行を追加してください。\n',
)
process.exit(2)
