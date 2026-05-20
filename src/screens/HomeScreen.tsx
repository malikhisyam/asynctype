import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { Theme } from "../lib/themes.js";

interface HomeScreenProps {
  theme: Theme;
  onPlayRandom: () => void;
  onPlayByFile: () => void;
  onMultiplayer: () => void;
  onThemes: () => void;
  onLeaderboard: () => void;
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

export function HomeScreen({
  theme,
  onPlayRandom,
  onPlayByFile,
  onMultiplayer,
  onThemes,
  onLeaderboard,
  onQuit,
}: HomeScreenProps) {
  const [selected, setSelected] = useState(0);

  useKeyboard((key) => {
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

      <box flexDirection="column" marginTop={2} alignItems="center">
        <text fg={theme.muted}>j/k to navigate · enter or l to select · q to quit</text>
      </box>
    </box>
  );
}
