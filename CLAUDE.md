# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Cave-themed Sokoban puzzle game built with React 19 + Vite. The spec is `02-prd.md` (Korean); `01-prd.txt` is the raw brief it was generated from. The app lives entirely in `sokoban/`. UI text is Korean.

## Commands

Run from `sokoban/`:

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build to dist/
npm run preview   # serve dist/
npm run lint      # oxlint (config: .oxlintrc.json) — there is no eslint config
```

There is no test suite.

## Architecture

State flows one way: `App` owns progress (cleared levels + current in-progress state, persisted to localStorage via `game/storage.js`) and screen routing (`main` → `select` → `game`). `Game` is remounted with a `key` on every level change or resume so the hook re-initialises cleanly.

- `src/game/levels.js` — 10 levels as ASCII maps (`#` wall, `.` goal, `$` box, `@` player, `*` box-on-goal, `+` player-on-goal). Rows may be ragged; the parser pads them. Levels 4–10 are adapted from Microban (public domain). If you add or edit a level, verify it is solvable — a naive BFS is enough for ≤4 boxes.
- `src/game/engine.js` — pure functions: `parseLevel` (also flood-fills from the player to decide which floor/wall tiles are visible), `tryMove`, `undo`, `isSolved`. State is immutable; `history` holds prior `{player, boxes}` snapshots for multi-level undo. Undo counts as a move.
- `src/hooks/useSokoban.js` — wraps the engine with an input queue: moves are applied one per `MOVE_MS` (160ms) so CSS transitions finish, and up to 3 queued inputs are kept so rapid key presses don't drop. Restores from a saved snapshot when `saved.level` matches.
- `src/components/Board.jsx` — every tile is an absolutely positioned div moved with `transform: translate()`. Boxes and player have a `transition` on transform, which is what produces the smooth animation; keep `MOVE_MS` and the CSS `--ms` variable in sync (Board passes it through).
- `src/App.css` — all styling. Cell size is a CSS variable `--cell` computed in `Game.jsx` from the board wrapper's size. Percentage padding/margins on `.cell` children resolve against the board, not the cell — use `calc(var(--cell) * n)` instead.

Input: keyboard (arrows/WASD, Z/Backspace undo, R restart) is bound at window level in `Game.jsx`; touch swipe is on the board wrapper; the on-screen D-pad uses `onPointerDown`.
