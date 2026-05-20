import type { GameStats } from "../lib/game.js";
import type { Theme } from "../lib/themes.js";

interface EndScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onQuit: () => void;
  theme: Theme;
}

export function EndScreen({ stats, onRestart, onQuit, theme }: EndScreenProps) {
  return (
    <box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={1}
      paddingY={2}
    >
      <text fg={theme.accent}>
        <strong>Completed!</strong>
      </text>

      <box flexDirection="column" gap={1} marginTop={1} alignItems="flex-start">
        <box flexDirection="row" gap={2}>
          <text fg={theme.label}>WPM:</text>
          <text fg={theme.fg}>
            <strong>{stats.wpm}</strong>
          </text>
        </box>
        <box flexDirection="row" gap={2}>
          <text fg={theme.label}>Raw WPM:</text>
          <text fg={theme.fg}>
            <strong>{stats.rawWpm}</strong>
          </text>
        </box>
        <box flexDirection="row" gap={2}>
          <text fg={theme.label}>Accuracy:</text>
          <text fg={theme.fg}>
            <strong>{stats.accuracy}%</strong>
          </text>
        </box>
        <box flexDirection="row" gap={2}>
          <text fg={theme.label}>Correct:</text>
          <text fg={theme.fg}>
            <strong>{stats.correctChars}</strong>
          </text>
        </box>
        <box flexDirection="row" gap={2}>
          <text fg={theme.label}>Incorrect:</text>
          <text fg={theme.fg}>
            <strong>{stats.incorrectChars}</strong>
          </text>
        </box>
        <box flexDirection="row" gap={2}>
          <text fg={theme.label}>Total:</text>
          <text fg={theme.fg}>
            <strong>{stats.totalChars}</strong>
          </text>
        </box>
        <box flexDirection="row" gap={2}>
          <text fg={theme.label}>Time:</text>
          <text fg={theme.fg}>
            <strong>{stats.timeElapsed}s</strong>
          </text>
        </box>
      </box>

      <box flexDirection="row" gap={3} marginTop={2}>
        <text fg={theme.untyped}>
          Press <span fg={theme.accent}>Tab</span> or <span fg={theme.accent}>Enter</span> to restart
        </text>
      </box>
      <box flexDirection="row">
        <text fg={theme.untyped}>
          Press <span fg={theme.error}>ESC</span> or <span fg={theme.error}>q</span> to quit
        </text>
      </box>
    </box>
  );
}
