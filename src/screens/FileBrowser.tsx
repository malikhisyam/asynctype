import { useState, useEffect, useMemo } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import type { Theme } from "../lib/themes.js";
import {
  scanDirectory,
  getParentDir,
  readFileContent,
  getFileIcon,
  fuzzySearchWithPath,
  type FileEntry,
  type PathFuzzyMatch,
} from "../lib/files.js";

interface FileBrowserProps {
  theme: Theme;
  onSelectFile: (content: string) => void;
  onBack: () => void;
}

const ICON_SYMBOLS: Record<string, string> = {
  dir: "📁",
  ts: "ts",
  tsx: "tsx",
  js: "js",
  jsx: "jsx",
  json: "json",
  md: "md",
  css: "css",
  scss: "scss",
  html: "html",
  yaml: "yaml",
  yml: "yml",
  toml: "toml",
  py: "py",
  rs: "rs",
  go: "go",
  c: "c",
  cpp: "cpp",
  h: "h",
  java: "java",
  kt: "kt",
  rb: "rb",
  php: "php",
  sh: "sh",
  zsh: "sh",
  bash: "sh",
  docker: "docker",
  sql: "sql",
  gql: "gql",
  xml: "xml",
  svg: "svg",
  img: "img",
  audio: "audio",
  video: "video",
  pdf: "pdf",
  zip: "zip",
  lock: "lock",
  makefile: "make",
  gemfile: "gem",
  file: "📄",
};

function getIconSymbol(entry: FileEntry): string {
  const icon = getFileIcon(entry);
  return ICON_SYMBOLS[icon] ?? "📄";
}

function truncatePath(path: string, maxLen: number): string {
  if (path.length <= maxLen) return path;
  return "..." + path.slice(Math.max(path.length - maxLen + 3, 0));
}

export function FileBrowser({ theme, onSelectFile, onBack }: FileBrowserProps) {
  const { width: termWidth } = useTerminalDimensions();
  const [cwd, setCwd] = useState(process.cwd());
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [searchSelected, setSearchSelected] = useState(0);

  useEffect(() => {
    try {
      const scanned = scanDirectory(cwd);
      setEntries(scanned);
      setSelected(0);
      setScrollOffset(0);
      setIsSearching(false);
      setQuery("");
      setSearchSelected(0);
    } catch {
      setEntries([]);
    }
  }, [cwd]);

  const matches = useMemo(() => {
    if (!isSearching || !query) {
      return entries.map((entry) => ({
        entry,
        score: 0,
        nameIndices: [] as number[],
        pathIndices: [] as number[],
      }));
    }
    return fuzzySearchWithPath(entries, query, cwd);
  }, [entries, isSearching, query, cwd]);

  const visibleCount = isSearching ? 10 : 12;

  // Responsive overlay width
  const overlayWidth = Math.min(termWidth - 6, 74);
  const nameWidth = Math.floor(overlayWidth * 0.35);
  const pathMaxLen = Math.max(10, overlayWidth - nameWidth - 12);

  useKeyboard((key) => {
    // Search mode — consume all chars except navigation/escape/enter
    if (isSearching) {
      if (key.name === "escape") {
        setIsSearching(false);
        setQuery("");
        setSearchSelected(0);
        setSelected(0);
        return;
      }
      if (key.name === "backspace") {
        setQuery((q) => {
          const next = q.slice(0, -1);
          if (next === "") {
            setIsSearching(false);
            setSearchSelected(0);
            setSelected(0);
          } else {
            setSearchSelected(0);
          }
          return next;
        });
        return;
      }
      if (key.name === "enter" || key.name === "return") {
        const match = matches[searchSelected];
        if (match) {
          if (match.entry.isDir) {
            setCwd(match.entry.path);
            setIsSearching(false);
            setQuery("");
            setSearchSelected(0);
          } else {
            const content = readFileContent(match.entry.path);
            onSelectFile(content);
          }
        }
        return;
      }
      if (key.name === "down" || key.name === "j") {
        setSearchSelected((s) => Math.min(matches.length - 1, s + 1));
        return;
      }
      if (key.name === "up" || key.name === "k") {
        setSearchSelected((s) => Math.max(0, s - 1));
        return;
      }
      if (key.name === "space" || key.name === " ") {
        setQuery((q) => q + " ");
        setSearchSelected(0);
        return;
      }
      if (key.name && key.name.length === 1) {
        setQuery((q) => q + key.name);
        setSearchSelected(0);
        return;
      }
      return;
    }

    // Normal browse mode
    if (key.name === "escape" || key.name === "h") {
      if (cwd === "/" || cwd === getParentDir(cwd)) {
        onBack();
      } else {
        setCwd(getParentDir(cwd));
      }
      return;
    }
    if (key.name === "j" || key.name === "down") {
      setSelected((s) => {
        const next = Math.min(entries.length - 1, s + 1);
        if (next >= scrollOffset + visibleCount) {
          setScrollOffset(next - visibleCount + 1);
        }
        return next;
      });
      return;
    }
    if (key.name === "k" || key.name === "up") {
      setSelected((s) => {
        const next = Math.max(0, s - 1);
        if (next < scrollOffset) {
          setScrollOffset(next);
        }
        return next;
      });
      return;
    }
    if (key.name === "l" || key.name === "enter" || key.name === "return") {
      const entry = entries[selected];
      if (!entry) return;
      if (entry.isDir) {
        setCwd(entry.path);
      } else {
        const content = readFileContent(entry.path);
        onSelectFile(content);
      }
      return;
    }
    if (key.name === "q") {
      onBack();
      return;
    }
    // Typing any other character enters search mode
    if (key.name && key.name.length === 1) {
      setIsSearching(true);
      setQuery(key.name);
      setSearchSelected(0);
      return;
    }
  });

  const visibleMatches = isSearching
    ? matches.slice(0, visibleCount)
    : entries.slice(scrollOffset, scrollOffset + visibleCount).map((entry) => ({
        entry,
        score: 0,
        nameIndices: [] as number[],
        pathIndices: [] as number[],
      }));

  const activeSelected = isSearching ? searchSelected : selected - scrollOffset;

  return (
    <box flexDirection="column" paddingX={1} paddingY={1}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.accent}>
          <strong>File Browser</strong>
        </text>
        {!isSearching && <text fg={theme.muted}> — {cwd}</text>}
      </box>

      {isSearching && (
        <box flexDirection="row" gap={1} marginTop={1}>
          <text fg={theme.accent}>
            <strong>Search</strong>
          </text>
          <text fg={theme.fg}>{query}</text>
          <text fg={theme.cursor}>_</text>
          <text fg={theme.muted}> ({matches.length})</text>
        </box>
      )}

      <box flexDirection="column" gap={0} marginTop={1}>
        {visibleMatches.map((match, i) => {
          const isSelected = i === activeSelected;
          const entry = match.entry;
          const icon = getIconSymbol(entry);
          const nameColor = entry.isDir ? theme.label : theme.fg;
          const relPath = entry.path.startsWith(cwd)
            ? entry.path.slice(cwd.length + 1)
            : entry.path;
          const shortPath = truncatePath(relPath, pathMaxLen);

          return (
            <box
              key={entry.path}
              flexDirection="row"
              gap={1}
              paddingX={1}
              paddingY={0}
              backgroundColor={isSelected ? theme.selectedBg : undefined}
            >
              <text width={1} fg={isSelected ? theme.accent : theme.muted}>
                {isSelected ? ">" : " "}
              </text>
              <text width={4} fg={theme.muted}>
                {icon}
              </text>
              <text width={nameWidth} fg={nameColor}>
                {renderFuzzyName(entry.name, match.nameIndices, theme)}
              </text>
              <text fg={theme.muted}>
                {match.pathIndices.length > 0
                  ? renderFuzzyPath(shortPath, match.pathIndices, theme)
                  : shortPath}
              </text>
            </box>
          );
        })}
      </box>

      {(isSearching ? matches.length === 0 : entries.length === 0) && (
        <text fg={theme.muted} marginTop={1}>
          {isSearching ? "(no matches)" : "(empty directory)"}
        </text>
      )}

      <box flexDirection="row" marginTop={1}>
        <text fg={theme.muted}>
          {isSearching
            ? "type to filter · ↑↓ to navigate · enter to open · esc/backspace to cancel"
            : "j/k to navigate · l/enter to open · h/esc to go back · type to search · q to quit"}
        </text>
      </box>
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

function renderFuzzyPath(
  path: string,
  indices: number[],
  theme: Theme
): React.ReactNode {
  const chars: React.ReactNode[] = [];
  const indexSet = new Set(indices);

  for (let i = 0; i < path.length; i++) {
    const char = path[i]!;
    const isMatch = indexSet.has(i);

    chars.push(
      <span key={i} fg={isMatch ? theme.accent : theme.muted}>
        {isMatch ? <strong>{char}</strong> : char}
      </span>
    );
  }

  return <>{chars}</>;
}
