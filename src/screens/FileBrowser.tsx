import { useState, useEffect } from "react";
import { useKeyboard } from "@opentui/react";
import type { Theme } from "../lib/themes.js";
import { scanDirectory, getParentDir, readFileContent, type FileEntry } from "../lib/files.js";

interface FileBrowserProps {
  theme: Theme;
  onSelectFile: (content: string) => void;
  onBack: () => void;
}

export function FileBrowser({ theme, onSelectFile, onBack }: FileBrowserProps) {
  const [cwd, setCwd] = useState(process.cwd());
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    try {
      const scanned = scanDirectory(cwd);
      setEntries(scanned);
      setSelected(0);
      setScrollOffset(0);
    } catch {
      setEntries([]);
    }
  }, [cwd]);

  const visibleCount = 12;

  useKeyboard((key) => {
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
  });

  const visible = entries.slice(scrollOffset, scrollOffset + visibleCount);

  return (
    <box flexDirection="column" paddingX={1} paddingY={1}>
      <box flexDirection="row" gap={1}>
        <text fg={theme.accent}>
          <strong>File Browser</strong>
        </text>
        <text fg={theme.muted}> — {cwd}</text>
      </box>

      <box flexDirection="column" gap={0} marginTop={1}>
        {visible.map((entry, i) => {
          const globalIdx = scrollOffset + i;
          const isSelected = globalIdx === selected;
          const icon = entry.isDir ? "/" : "";
          const nameColor = entry.isDir ? theme.label : theme.fg;

          return (
            <box
              key={entry.path}
              flexDirection="row"
              gap={1}
              paddingX={1}
              paddingY={0}
              backgroundColor={isSelected ? theme.selectedBg : undefined}
            >
              <text fg={isSelected ? theme.accent : theme.muted}>
                {isSelected ? ">" : " "}
              </text>
              <text fg={nameColor}>
                {isSelected ? <strong>{icon}{entry.name}</strong> : `${icon}${entry.name}`}
              </text>
            </box>
          );
        })}
      </box>

      {entries.length === 0 && (
        <text fg={theme.muted} marginTop={1}>
          (empty directory)
        </text>
      )}

      <box flexDirection="row" marginTop={1}>
        <text fg={theme.muted}>
          j/k to navigate · l/enter to open · h/esc to go back · q to quit
        </text>
      </box>
    </box>
  );
}
