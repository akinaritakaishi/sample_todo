#!/usr/bin/env node
// Stop hook: compare files changed in this session with docs/doc-map.md and, when a mapped source changed
// but its related docs did not change on the branch, ask the agent to review them before finishing.
// Only sources touched in this session (uncommitted, untracked, or committed since the session started)
// trigger a reminder, so review-only sessions are not asked to edit docs for earlier commits.
// Exit code 2 sends stderr back to the agent. Each (source pattern, doc) pair is reported at most once
// per session, so the agent can finish after judging that no update is needed.
import { spawnSync } from 'node:child_process'
import { closeSync, existsSync, openSync, readFileSync, readSync, statSync, writeFileSync } from 'node:fs'
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
  // Only the table under "## 対応表", up to the next "## " heading.
  const section = (markdown.split(/^## 対応表\s*$/m)[1] ?? '').split(/^## /m)[0]
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

// Session start time: the first timestamp in the transcript, or the transcript file's creation time.
function sessionStart() {
  const transcript = input.transcript_path
  if (!transcript || !existsSync(transcript)) return null
  try {
    const fd = openSync(transcript, 'r')
    const buffer = Buffer.alloc(64 * 1024)
    const bytes = readSync(fd, buffer, 0, buffer.length, 0)
    closeSync(fd)
    const match = buffer.toString('utf8', 0, bytes).match(/"timestamp":"([^"]+)"/)
    if (match) return match[1]
    return statSync(transcript).birthtime.toISOString()
  } catch {
    return null
  }
}

// Parse `git ... --name-status -z` output into the map. `structural` marks additions, deletions and renames.
function addNameStatus(changes, output) {
  const tokens = output.split('\0').filter(Boolean)
  for (let i = 0; i < tokens.length; ) {
    const status = tokens[i++]
    const paths = /^[RC]/.test(status) ? [tokens[i++], tokens[i++]] : [tokens[i++]]
    for (const file of paths) changes.set(file, { structural: status[0] !== 'M' && status[0] !== 'T' })
  }
}

// Changed files on the branch (committed since the merge base, plus uncommitted and untracked ones),
// and the subset touched in this session (uncommitted, untracked, or in commits since the session started).
function collectChanges() {
  const base = findBase()
  const diff = git(['diff', '--name-status', '-z', '--find-renames', base])
  const working = git(['diff', '--name-status', '-z', '--find-renames', 'HEAD'])
  const untracked = git(['ls-files', '--others', '--exclude-standard', '-z'])
  if (diff === null || working === null || untracked === null) return null

  const branch = new Map()
  addNameStatus(branch, diff)
  const session = new Map()
  addNameStatus(session, working)
  const since = sessionStart()
  if (since && base !== 'HEAD') {
    const log = git(['log', '--name-status', '-z', '--find-renames', '--format=', `--since=${since}`, `${base}..HEAD`])
    if (log) addNameStatus(session, log)
  }
  for (const file of untracked.split('\0').filter(Boolean)) {
    branch.set(file, { structural: true })
    session.set(file, { structural: true })
  }
  return { branch, session }
}

const collected = collectChanges()
if (!collected || collected.session.size === 0) process.exit(0)
const { branch: changes, session: sessionChanges } = collected

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
  const triggers = [...sessionChanges]
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
  return `- このセッションで ${shown} が変更されています → ${docs.join(', ')} を見直してください（${note}）`
})
process.stderr.write(
  `${MAP_FILE} の対応表で、変更に対応する記述がまだ更新されていない箇所があります。\n` +
    `${lines.join('\n')}\n` +
    '該当する記述を読んで古くなっていれば更新し、更新不要と判断したものはそのままで構いません（同じセッションでは再度通知しません）。' +
    '対応表にない記述が古くなっていると気づいた場合は、対応表にも行を追加してください。\n',
)
process.exit(2)
