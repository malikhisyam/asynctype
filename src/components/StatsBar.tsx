import type { GameStats } from "../lib/game.js";
import type { Theme } from "../lib/themes.js";

interface StatsBarProps {
  stats: GameStats;
  theme: Theme;
}

export function StatsBar({ stats, theme }: StatsBarProps) {
  return (
    <box
      flexDirection="row"
      justifyContent="center"
      gap={6}
      paddingY={1}
    >
      <box flexDirection="row" gap={1}>
        <text fg={theme.label}>WPM:</text>
        <text fg={theme.fg}>
          <strong>{stats.wpm}</strong>
        </text>
      </box>
      <box flexDirection="row" gap={1}>
        <text fg={theme.label}>Raw:</text>
        <text fg={theme.fg}>
          <strong>{stats.rawWpm}</strong>
        </text>
      </box>
      <box flexDirection="row" gap={1}>
        <text fg={theme.label}>Acc:</text>
        <text fg={theme.fg}>
          <strong>{stats.accuracy}%</strong>
        </text>
      </box>
      <box flexDirection="row" gap={1}>
        <text fg={theme.label}>Chars:</text>
        <text fg={theme.fg}>
          <strong>
            {stats.correctChars}/{stats.totalChars}
          </strong>
        </text>
      </box>
    </box>
  );
}
