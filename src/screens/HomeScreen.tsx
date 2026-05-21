import { useState, useMemo, useEffect } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import type { Theme } from "../lib/themes.js";
import {
  scanDirectoryRecursive,
  readFileContent,
  getFileIcon,
  fuzzySearch,
  type FileEntry,
} from "../lib/files.js";
import { basename, dirname } from "path";

interface HomeScreenProps {
  theme: Theme;
  onPlayRandom: () => void;
  onPlayByFile: () => void;
  onMultiplayer: () => void;
  onThemes: () => void;
  onLeaderboard: () => void;
  onSelectFile: (content: string) => void;
  onQuit: () => void;
}

const MENU_ITEMS = [
  { key: "random", label: "play random words", hint: "r" },
  { key: "file", label: "play by file", hint: "f" },
  { key: "leaderboard", label: "leaderboard", hint: "b" },
  { key: "multiplayer", label: "multiplayer", hint: "m" },
  { key: "themes", label: "themes", hint: "t" },
  { key: "quit", label: "quit", hint: "q" },
] as const;

function truncatePath(path: string, maxLen: number): string {
  if (path.length <= maxLen) return path;
  const start = path.length - maxLen + 3;
  return "..." + path.slice(Math.max(start, 0));
}

function formatPath(path: string): string {
  const cwd = process.cwd();
  if (path.startsWith(cwd)) {
    const rel = path.slice(cwd.length);
    return rel.startsWith("/") ? rel : "/" + rel;
  }
  return path;
}

export function HomeScreen({
  theme,
  onPlayRandom,
  onPlayByFile,
  onMultiplayer,
  onThemes,
  onLeaderboard,
  onSelectFile,
  onQuit,
}: HomeScreenProps) {
  const { width: termWidth } = useTerminalDimensions();
  const [selected, setSelected] = useState(0);
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [quickSelected, setQuickSelected] = useState(0);
  const [allFiles, setAllFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    if (isQuickOpen) {
      const files = scanDirectoryRecursive(process.cwd(), 2).filter(
        (f) => !f.isDir
      );
      setAllFiles(files);
      setQuery("");
      setQuickSelected(0);
    }
  }, [isQuickOpen]);

  const matches = useMemo(() => {
    if (!query) return allFiles.slice(0, 10).map((entry) => ({ entry, score: 0, indices: [] as number[] }));
    return fuzzySearch(allFiles, query);
  }, [allFiles, query]);

  const visibleCount = 10;

  // Responsive overlay width
  const overlayWidth = Math.min(termWidth - 6, 74);
  const nameWidth = Math.floor(overlayWidth * 0.35);
  const pathMaxLen = Math.max(10, overlayWidth - nameWidth - 12);

  useKeyboard((key) => {
    // Quick Open mode
    if (isQuickOpen) {
      if (key.name === "escape") {
        setIsQuickOpen(false);
        setQuery("");
        setQuickSelected(0);
        return;
      }
      if (key.name === "backspace") {
        setQuery((q) => q.slice(0, -1));
        setQuickSelected(0);
        return;
      }
      if (key.name === "enter" || key.name === "return") {
        const match = matches[quickSelected];
        if (match) {
          const content = readFileContent(match.entry.path);
          onSelectFile(content);
        }
        return;
      }
      if (key.name === "down" || key.name === "j") {
        setQuickSelected((s) => Math.min(matches.length - 1, s + 1));
        return;
      }
      if (key.name === "up" || key.name === "k") {
        setQuickSelected((s) => Math.max(0, s - 1));
        return;
      }
      if (key.name === "space" || key.name === " ") {
        setQuery((q) => q + " ");
        setQuickSelected(0);
        return;
      }
      if (key.name && key.name.length === 1) {
        setQuery((q) => q + key.name);
        setQuickSelected(0);
        return;
      }
      return;
    }

    // Normal home menu shortcuts
    // Ctrl+P / Cmd+P / Option+P / o
    if (
      (key.ctrl && key.name === "p") ||
      (key.meta && key.name === "p") ||
      (key.option && key.name === "p") ||
      key.name === "o"
    ) {
      setIsQuickOpen(true);
      return;
    }

    if (key.name === "q") {
      onQuit();
      return;
    }
    if (key.name === "j" || key.name === "down") {
      setSelected((s) => Math.min(MENU_ITEMS.length - 1, s + 1));
      return;
    }
    if (key.name === "k" || key.name === "up") {
      setSelected((s) => Math.max(0, s - 1));
      return;
    }
    if (key.name === "enter" || key.name === "return" || key.name === "l") {
      const item = MENU_ITEMS[selected];
      if (item) {
        switch (item.key) {
          case "random":
            onPlayRandom();
            break;
          case "file":
            onPlayByFile();
            break;
          case "multiplayer":
            onMultiplayer();
            break;
          case "themes":
            onThemes();
            break;
          case "leaderboard":
            onLeaderboard();
            break;
          case "quit":
            onQuit();
            break;
        }
      }
      return;
    }
    // Direct key shortcuts
    if (key.name === "r") {
      onPlayRandom();
      return;
    }
    if (key.name === "f") {
      onPlayByFile();
      return;
    }
    if (key.name === "m") {
      onMultiplayer();
      return;
    }
    if (key.name === "t") {
      onThemes();
      return;
    }
    if (key.name === "b") {
      onLeaderboard();
      return;
    }
  });

  return (
    <box flexDirection="column" alignItems="center" gap={1} paddingY={2}>
      <text fg={theme.accent}>
        <strong>AsyncType</strong>
      </text>
      <text fg={theme.muted}>a vim-inspired terminal typing racer</text>

      {!isQuickOpen && (
        <>
          <box flexDirection="column" gap={0} marginTop={2} alignItems="flex-start">
            {MENU_ITEMS.map((item, i) => {
              const isSelected = i === selected;
              return (
                <box
                  key={item.key}
                  flexDirection="row"
                  gap={1}
                  paddingX={1}
                  paddingY={0}
                  backgroundColor={isSelected ? theme.selectedBg : undefined}
                >
                  <text fg={isSelected ? theme.accent : theme.muted}>
                    {isSelected ? ">" : " "}
                  </text>
                  <text fg={isSelected ? theme.fg : theme.muted}>
                    {isSelected ? <strong>{item.label}</strong> : item.label}
                  </text>
                  <text fg={theme.muted}> [{item.hint}]</text>
                </box>
              );
            })}
          </box>

          <box flexDirection="column" marginTop={2} alignItems="center" gap={0}>
            <text fg={theme.muted}>j/k to navigate · enter or l to select · q to quit</text>
            <text fg={theme.muted}>ctrl/cmd+p or o to quick open</text>
          </box>
        </>
      )}

      {/* Quick Open Overlay */}
      {isQuickOpen && (
        <box
          flexDirection="column"
          marginTop={2}
          paddingX={2}
          paddingY={1}
          backgroundColor={theme.selectedBg}
          width={overlayWidth}
        >
          <box flexDirection="row" gap={1}>
            <text fg={theme.accent}>
              <strong>Quick Open</strong>
            </text>
            <text fg={theme.muted}> — {query}</text>
            <text fg={theme.cursor}>_</text>
          </box>

          <box flexDirection="column" gap={0} marginTop={1}>
            {matches.slice(0, visibleCount).map((match, i) => {
              const isSelected = i === quickSelected;
              const entry = match.entry;
              const icon = getFileIcon(entry);
              const relPath = formatPath(entry.path);
              const shortPath = truncatePath(relPath, pathMaxLen);

              return (
                <box
                  key={entry.path}
                  flexDirection="row"
                  gap={1}
                  paddingX={1}
                  paddingY={0}
                  backgroundColor={isSelected ? theme.bg : undefined}
                >
                  <text width={1} fg={isSelected ? theme.accent : theme.muted}>
                    {isSelected ? ">" : " "}
                  </text>
                  <text width={4} fg={theme.muted}>
                    {icon}
                  </text>
                  <text width={nameWidth} fg={isSelected ? theme.fg : theme.fg}>
                    {renderFuzzyName(entry.name, match.indices, theme)}
                  </text>
                  <text fg={theme.muted}>{shortPath}</text>
                </box>
              );
            })}
          </box>

          {matches.length === 0 && (
            <text fg={theme.muted} marginTop={1}>
              (no matches)
            </text>
          )}

          <box flexDirection="row" marginTop={1}>
            <text fg={theme.muted}>
              type to filter · ↑↓ to navigate · enter to open · esc to cancel
            </text>
          </box>
        </box>
      )}
    </box>
  );
}

function renderFuzzyName(
  name: string,
  indices: number[],
  theme: Theme
): React.ReactNode {
  const chars: React.ReactNode[] = [];
  const indexSet = new Set(indices);

  for (let i = 0; i < name.length; i++) {
    const char = name[i]!;
    const isMatch = indexSet.has(i);

    chars.push(
      <span key={i} fg={isMatch ? theme.accent : theme.fg}>
        {isMatch ? <strong>{char}</strong> : char}
      </span>
    );
  }

  return <>{chars}</>;
}
