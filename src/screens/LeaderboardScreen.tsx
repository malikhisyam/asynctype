import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { Theme } from "../lib/themes.js";
import type { ScoreEntry } from "../lib/config.js";

interface LeaderboardScreenProps {
  scores: ScoreEntry[];
  theme: Theme;
  onBack: () => void;
}

export function LeaderboardScreen({ scores, theme, onBack }: LeaderboardScreenProps) {
  const [selected, setSelected] = useState(0);
  const sorted = [...scores].sort((a, b) => b.wpm - a.wpm);
  const hasScores = sorted.length > 0;

  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "q" || key.name === "h") {
      onBack();
      return;
    }
    if (key.name === "j" || key.name === "down") {
      setSelected((s) => Math.min(Math.max(0, sorted.length - 1), s + 1));
      return;
    }
    if (key.name === "k" || key.name === "up") {
      setSelected((s) => Math.max(0, s - 1));
      return;
    }
  });

  return (
    <box flexDirection="column" paddingX={1} paddingY={1} alignItems="center">
      <text fg={theme.accent}>
        <strong>Leaderboard</strong>
      </text>

      {!hasScores ? (
        <box flexDirection="column" marginTop={2} alignItems="center">
          <text fg={theme.muted}>No scores yet.</text>
          <text fg={theme.muted}>Play a few rounds to see your stats here.</text>
        </box>
      ) : (
        <box flexDirection="column" marginTop={1} alignItems="flex-start" gap={0}>
          {/* Header row */}
          <box flexDirection="row" gap={2} paddingX={1}>
            <text fg={theme.label} width={4}>
              <strong>#</strong>
            </text>
            <text fg={theme.label} width={6}>
              <strong>WPM</strong>
            </text>
            <text fg={theme.label} width={6}>
              <strong>Raw</strong>
            </text>
            <text fg={theme.label} width={5}>
              <strong>Acc</strong>
            </text>
            <text fg={theme.label} width={5}>
              <strong>Mode</strong>
            </text>
            <text fg={theme.label} width={10}>
              <strong>Date</strong>
            </text>
          </box>

          {sorted.map((entry, i) => {
            const isSelected = i === selected;
            const dateStr = entry.date.slice(0, 10);
            return (
              <box
                key={`${entry.date}-${i}`}
                flexDirection="row"
                gap={2}
                paddingX={1}
                paddingY={0}
                backgroundColor={isSelected ? theme.selectedBg : undefined}
              >
                <text fg={theme.fg} width={4}>
                  {i + 1}
                </text>
                <text fg={theme.accent} width={6}>
                  {isSelected ? <strong>{entry.wpm}</strong> : entry.wpm}
                </text>
                <text fg={theme.fg} width={6}>
                  {entry.rawWpm}
                </text>
                <text fg={theme.fg} width={5}>
                  {entry.accuracy}%
                </text>
                <text fg={theme.muted} width={5}>
                  {entry.mode}s
                </text>
                <text fg={theme.muted} width={10}>
                  {dateStr}
                </text>
              </box>
            );
          })}
        </box>
      )}

      <box flexDirection="column" marginTop={2} alignItems="center">
        <text fg={theme.muted}>
          j/k to navigate · h/esc/q to go back
        </text>
      </box>
    </box>
  );
}
