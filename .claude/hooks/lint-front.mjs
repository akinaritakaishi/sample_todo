#!/usr/bin/env node
// PostToolUse hook (Edit|Write): run ESLint on the edited file when it is under front/.
// Exit code 2 sends stderr back to Claude so it can fix the lint errors right away.
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const LINT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.jsx', '.tsx', '.vue'])

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
const filePath = input.tool_input?.file_path
if (!filePath) process.exit(0)

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()
const frontDir = path.resolve(projectDir, 'front')
const target = path.resolve(input.cwd || projectDir, filePath)
const relative = path.relative(frontDir, target)

// Skip files outside front/, generated directories and non-lint targets.
if (relative.startsWith('..') || path.isAbsolute(relative)) process.exit(0)
if (/^(node_modules|\.nuxt|\.output|\.data)[\/]/.test(relative)) process.exit(0)
if (!LINT_EXTENSIONS.has(path.extname(target))) process.exit(0)

// eslint.config.mjs imports .nuxt/eslint.config.mjs, so both deps and nuxt prepare are required.
const eslintBin = path.join(frontDir, 'node_modules', 'eslint', 'bin', 'eslint.js')
if (!existsSync(eslintBin) || !existsSync(path.join(frontDir, '.nuxt', 'eslint.config.mjs'))) {
  process.exit(0)
}

const result = spawnSync(process.execPath, [eslintBin, relative], { cwd: frontDir, encoding: 'utf8' })
if (result.status === 0) process.exit(0)

// ESLint exits with 1 only for lint problems. A spawn error or exit 2 (config error, crash) is not
// something Claude can fix in the edited file, so report it without blocking (exit 1).
if (result.status !== 1) {
  process.stderr.write(
    `Skipped ESLint hook: ESLint could not run (${result.error?.message ?? `exit code ${result.status}`}).\n` +
      (result.stderr || ''),
  )
  process.exit(1)
}

process.stderr.write(
  `ESLint reported problems in front/${relative.split(path.sep).join('/')}. Fix them before continuing.\n` +
    (result.stdout || '') +
    (result.stderr || ''),
)
process.exit(2)
