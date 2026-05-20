# AsyncType

> A vim-inspired terminal typing racer for developers waiting on async jobs, AI agents, builds, and long-running tasks.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fbf0df)
![OpenTUI](https://img.shields.io/badge/OpenTUI-React-61dafb?logo=react&logoColor=white)

AsyncType is a terminal UI typing game built with [OpenTUI](https://github.com/anomalyco/opentui) + React that feels like "Monkeytype for developers inside the terminal." Race against the clock typing developer-oriented words or the contents of actual files on your filesystem.

<p align="center">
  <img src="https://raw.githubusercontent.com/malikhisyam/asynctype/main/assets/demo.gif" alt="AsyncType Demo" width="700">
</p>

## Features

- **Typing race gameplay** — Real-time character-level feedback with correct/incorrect coloring
- **Developer word pool** — 150+ terms from programming, git, Linux, AI, async/concurrency, web, and database domains
- **Play by file** — Browse your filesystem and race against actual source code, configs, or documentation
- **Timer modes** — 15s / 30s / 60s countdowns
- **Live stats** — WPM, Raw WPM, Accuracy, and character counts updated in real-time
- **Screen shake on mistake** — Tactile visual feedback when you mistype
- **7 color themes** — Tokyo Night, Gruvbox Dark, Catppuccin Mocha, Monokai, Solarized Dark, Dracula, Nord
- **Vim-first navigation** — `j/k` navigate, `h` back, `l/enter` confirm, `q/esc` quit
- **Zero mouse usage** — Fully keyboard-driven terminal experience
- **Leaderboard** — Track and view your top 50 scores across sessions
- **Config persistence** — Theme and timer mode preferences saved to `~/.config/asynctype/`
- **Sound feedback** — Optional terminal bell on every keystroke, toggleable from home menu
- **End screen** — Detailed post-game statistics with restart option

## Installation

Requires [Bun](https://bun.com) (Node.js will not work — OpenTUI uses Bun-only APIs).

```bash
# Clone the repository
git clone https://github.com/malikhisyam/asynctype.git
cd asynctype

# Install dependencies
bun install

# Run the game
bun run src/index.tsx
```

## Controls

### Home Menu

| Key | Action |
|---|---|
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `enter` / `l` | Select |
| `r` | Play random words (shortcut) |
| `f` | Play by file (shortcut) |
| `b` | Leaderboard (shortcut) |
| `m` | Multiplayer (placeholder) |
| `t` | Themes (shortcut) |
| `s` | Toggle sound on/off (shortcut) |
| `q` | Quit |

### Typing Game

| Key | Action |
|---|---|
| Any letter/space | Type character |
| `backspace` | Delete last character |
| `h` / `←` | Change timer mode (before starting) |
| `l` / `→` | Change timer mode (before starting) |
| `tab` | Restart game |
| `esc` / `q` | Back to home |

### File Browser

| Key | Action |
|---|---|
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `l` / `enter` | Open file or directory |
| `h` / `esc` | Parent directory |
| `q` | Back to home |

### Theme Picker

| Key | Action |
|---|---|
| `j` / `↓` | Move down |
| `k` / `↑` | Move up |
| `enter` / `l` | Select theme |
| `h` / `esc` / `q` | Back to home |

## Themes

AsyncType ships with 7 popular developer color schemes:

| Theme | Palette |
|---|---|
| **Tokyo Night** (default) | `#0d0d12` bg, `#00d4aa` accent, `#ff6b6b` error |
| **Gruvbox Dark** | `#282828` bg, `#b8bb26` accent, `#fb4934` error |
| **Catppuccin Mocha** | `#1e1e2e` bg, `#a6e3a1` accent, `#f38ba8` error |
| **Monokai** | `#272822` bg, `#a6e22e` accent, `#f92672` error |
| **Solarized Dark** | `#002b36` bg, `#859900` accent, `#dc322f` error |
| **Dracula** | `#282a36` bg, `#50fa7b` accent, `#ff79c6` error |
| **Nord** | `#2e3440` bg, `#a3be8c` accent, `#bf616a` error |

Switch themes from the **Themes** menu on the home screen.

## Game Modes

### Random Words
Race against a randomly generated sequence of developer-oriented terms. Perfect for quick practice while waiting for CI/CD pipelines.

### Play by File
Browse your filesystem (starting from the current working directory), pick any file, and race against its actual contents. Great for:
- Learning a new codebase by typing it
- Practicing with your own code
- Reviewing documentation
- Typing out configuration files

## Architecture

```
src/
├── index.tsx              # Entry point — renderer setup + root render
├── App.tsx                # Top-level screen router
├── lib/
│   ├── game.ts            # Word pool, game state, WPM/accuracy calculations
│   ├── themes.ts          # 7 theme definitions + default
│   └── files.ts           # Directory scanner + file reader utilities
├── components/            # Pure presentational components (all theme-aware)
│   ├── Header.tsx         # Title + timer mode selector
│   ├── TimerDisplay.tsx   # Countdown with color shift at <= 5s
│   ├── StatsBar.tsx       # Live WPM / Raw / Acc / Chars
│   ├── TypingArea.tsx     # Character-level highlighting + cursor
│   └── EndScreen.tsx      # Post-game stats
└── screens/               # Full-screen views with keyboard handlers
    ├── HomeScreen.tsx     # Main menu with vim navigation
    ├── FileBrowser.tsx    # h/j/k/l file explorer
    ├── ThemeScreen.tsx    # j/k theme picker
    └── TypeRaceScreen.tsx # The typing game
```

## Development

```bash
# Type-check
bunx tsc --noEmit

# Build for distribution
bun run build        # outputs dist/index.js

# Watch mode
bun run dev
```

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript (strict mode)
- **Framework**: OpenTUI React reconciler (`@opentui/react`)
- **Build target**: `bun`
- **Module system**: ESM

## Future Roadmap

- [x] **Config file** — `~/.config/asynctype/config.json` for theme & timer mode defaults
- [x] **Leaderboard** — Persist high scores to `~/.config/asynctype/`
- [x] **Sound feedback** — Optional terminal bell on keystrokes, toggleable from home menu
- [ ] **Multiplayer mode** — WebSocket or local IPC implementation
- [ ] **Custom word pools** — User-defined dictionaries

## Contributing

Contributions welcome! Please:
1. Run `bunx tsc --noEmit` after any type-level change
2. Run `bun run build` to verify bundling
3. Test keyboard navigation end-to-end (home → file browser → type → back)
4. Keep all components theme-aware — never hardcode colors
5. Maintain vim-first UX: `j/k` navigate, `h` back, `l/enter` confirm, `q/esc` quit

## License

MIT © Malik Hisyam

---

<p align="center">
  <i>Built for developers who type while waiting for builds.</i>
</p>
