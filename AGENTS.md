# AGENTS.md — AsyncType

A vim-inspired terminal typing racer for developers, built with OpenTUI + React.

## Project Overview

AsyncType is a terminal UI typing game that feels like "Monkeytype for developers inside the terminal." Users race against the clock typing developer-oriented words or the contents of actual files on their filesystem.

## Tech Stack

- **Runtime**: Bun (required — OpenTUI uses Bun-only APIs)
- **Language**: TypeScript (strict mode)
- **Framework**: OpenTUI React reconciler (`@opentui/react`, `@opentui/core`)
- **Build target**: `bun`
- **Module system**: ESM (`"type": "module"`)

## Architecture

```
src/
├── index.tsx              # Entry point — renderer setup + root render
├── App.tsx                # Top-level screen router (home / random / filebrowser / filegame / multiplayer / themes)
├── lib/
│   ├── game.ts            # Word pool, game state factory, WPM/accuracy calculations
│   ├── themes.ts          # 7 color theme definitions + default
│   └── files.ts           # Directory scanner + file reader utilities
├── components/            # Pure presentational components (all theme-aware)
│   ├── Header.tsx         # Title + timer mode selector
│   ├── TimerDisplay.tsx   # Countdown with color shift at <= 5s
│   ├── StatsBar.tsx       # Live WPM / Raw / Acc / Chars
│   ├── TypingArea.tsx     # Character-level highlighting + cursor
│   └── EndScreen.tsx      # Post-game stats
└── screens/               # Full-screen views with their own keyboard handlers
    ├── HomeScreen.tsx     # Main menu with vim navigation (j/k/enter/l/q)
    ├── FileBrowser.tsx    # h/j/k/l file explorer
    ├── ThemeScreen.tsx    # j/k theme picker
    └── TypeRaceScreen.tsx # The typing game (extracted from original App)
```

## Coding Conventions

### Imports
- Use `.js` extensions on all relative imports (required by `"moduleResolution": "NodeNext"`)
- Example: `import { App } from "./App.js"`

### Types
- Prefer `interface` over `type` for object shapes
- Export types from `lib/` modules alongside runtime exports
- Use explicit parameter types in callbacks where inference is weak

### Components
- All components are **theme-aware** — they accept a `theme: Theme` prop
- No inline style objects; use direct props or theme-driven values
- Keep components pure; side effects (keyboard handling, intervals) belong in screens or hooks

### State
- Game state lives in `lib/game.ts` as plain objects (not classes)
- React `useState` is the primary state mechanism
- `useCallback` for handlers passed to `useKeyboard` to avoid stale closures

### Keyboard Handling
- Vim-first: `j`/`k` for vertical navigation, `h`/`l` for horizontal / confirm
- `escape` and `q` are universal "back / quit" keys
- `useKeyboard` is declared inside each screen component; the reconciler fires all active handlers
- **Never call `process.exit()`** — always use `renderer.destroy()`

## Theme System

Themes are defined in `src/lib/themes.ts`. Each theme is a `Theme` interface with fields:

- `bg` / `fg` — background and primary text
- `accent` — highlights, cursor, active selections
- `error` / `errorBg` — mistake feedback
- `label` — stat labels (e.g., "WPM:")
- `muted` — hints, footers, inactive items
- `cursor` — next character to type
- `correct` / `untyped` — typed vs. pending text
- `selectedBg` — highlighted menu row
- `border` — borders (rarely used; we prefer minimal spacing)

### Adding a new theme
1. Add a new object to the `THEMES` array in `src/lib/themes.ts`
2. It automatically appears in the Theme picker
3. All components read from the `theme` prop — no extra wiring needed

## Game Logic

### State shape (`GameState`)
- `targetText` — what the user must type
- `typedText` — what the user has typed so far
- `timerMode` — 15 | 30 | 60 seconds
- `timeRemaining` — live countdown
- `isRunning` / `isFinished` — lifecycle flags
- `startTime` — timestamp of first keystroke
- `totalKeystrokes`, `correctKeystrokes`, `errors` — accuracy math

### Stats (`GameStats`)
- **WPM**: `(correctChars / 5) / minutes_elapsed`
- **Raw WPM**: `(totalChars / 5) / minutes_elapsed`
- **Accuracy**: `correctKeystrokes / totalKeystrokes * 100`

### Word pool
`DEV_WORD_POOL` in `src/lib/game.ts` contains ~150 developer-oriented terms across categories: programming, terminal commands, AI/dev, git, Linux, async/concurrency, web, database.

### Custom text (file mode)
When `customText` is passed to `TypeRaceScreen`, the timer is still active but the target text is the file content (truncated to 2000 chars by `readFileContent`).

## Screen Router (`App.tsx`)

The `screen` state is a discriminated union of string literals:

| Screen | Description |
|---|---|
| `"home"` | Main menu |
| `"random"` | Typing race with random words |
| `"filebrowser"` | Browse filesystem |
| `"filegame"` | Typing race with selected file content |
| `"multiplayer"` | Placeholder — "Coming soon..." |
| `"themes"` | Theme picker |

Navigation is handled by `go*` callbacks that `setScreen(...)`. Each screen unmounts when leaving, which cleans up its `useKeyboard` handler automatically.

## OpenTUI Notes

### Critical rules
- **Use `bun run src/index.tsx`** — Node will not work
- **Never call `process.exit()`** — use `renderer.destroy()`
- **Text styling uses nested tags** — `<text><span fg="red">...</span></text>`, not props like `bold={true}`
- **Direct props > `style` prop** for layout to avoid extra re-renders

### Known limitations
- `<text>` does not support a `wrap` prop
- `<text>` does not support a `dim` prop (use nested styling instead)
- Percentage widths only work when the parent has an explicit size

## Build Commands

```bash
# Development
bun run src/index.tsx

# Watch mode
bun run dev

# Type-check
bunx tsc --noEmit

# Production build
bun run build        # outputs dist/index.js
```

## Future Work

- **Multiplayer mode** — placeholder screen exists at `"multiplayer"`; needs WebSocket or local IPC implementation
- **Leaderboard** — persist high scores to `~/.config/asynctype/`
- **Custom word pools** — user-defined dictionaries
- **Sound feedback** — optional beep / click on keystrokes
- **Config file** — `~/.config/asynctype/config.json` for default theme, timer mode, etc.

## How to Collaborate

When editing:
1. Run `bunx tsc --noEmit` after any type-level change
2. Run `bun run build` to verify bundling
3. Test keyboard navigation end-to-end (home → file browser → type → back)
4. Keep all components theme-aware — never hardcode colors
5. Maintain vim-first UX: `j/k` navigate, `h` back, `l/enter` confirm, `q/esc` quit
