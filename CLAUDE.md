# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All app commands run from `todo-app/` (not the repo root):

```
cd todo-app
npm install
npm run dev      # Vite dev server
npm run build    # production build, output to todo-app/dist/
npm run preview  # preview the production build
```

There is no lint or test tooling configured in this project (no test runner, no ESLint config). Do not assume `npm test` or `npm run lint` exist.

## Architecture

`todo-app/` is a single-page React 18 + Vite app with no routing, no backend, and no external state library. Everything lives in three files under `src/`:

- `App.jsx` — owns all state (`tasks`, form inputs) and all mutation logic (add/toggle/delete/clear-done) via `useState`. Persists `tasks` to `localStorage` on every change through a `useEffect`. This is the only place task state is mutated; `TaskItem` is presentational and calls back up via `onToggle`/`onDelete` props.
- `tasks.js` — the data layer: `STORAGE_KEY`, `loadTasks()` (reads + validates localStorage, falling back to seed data on missing/invalid JSON), `createSeedTasks()`, and `formatDue()`. A task is `{ id, title, due, done }`, where `due` is an ISO date string (`YYYY-MM-DD`) or `''`.
- `TaskItem.jsx` — renders a single task row; purely props-driven.

There is no server; all persistence is client-side `localStorage` under the key in `STORAGE_KEY`.

## `demo-data/`

`design-guideline.md` and `slack-thread.md` are **fictional workshop material** (each file says so explicitly at the top) used to demo Claude Code on a realistic "read a style guide + a Slack feedback thread, then implement the UI change" exercise. They are not real company policy and not part of the app's build — only read them when a task explicitly references applying that guideline or thread (e.g. implementing due-date color coding).

## Conventions

- UI copy is Japanese; identifiers, code, and commit messages are English (follow the existing style in `src/`).
- Commit subjects are short, imperative English sentences (e.g. "Migrate todo-app to a React + Vite build setup") — match this style rather than Conventional Commits prefixes.
- Styling is plain CSS via custom properties in `style.css` (see `:root`), not a CSS-in-JS or utility framework — extend the existing variables rather than introducing a new styling approach.
- Components are function declarations with hooks, no class components, no PropTypes/TypeScript.
