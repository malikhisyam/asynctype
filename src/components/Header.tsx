import type { TimerMode } from "../lib/game.js";
import type { Theme } from "../lib/themes.js";

interface HeaderProps {
  mode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  theme: Theme;
}

const MODES: TimerMode[] = [15, 30, 60];

export function Header({ mode, onModeChange, theme }: HeaderProps) {
  return (
    <box
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      paddingY={1}
    >
      <text fg={theme.accent}>
        <strong>AsyncType</strong>
      </text>
      <box flexDirection="row" gap={3} marginLeft={4}>
        {MODES.map((m) => (
          <box key={m} paddingX={1} paddingY={0}>
            <text fg={m === mode ? theme.accent : theme.muted}>
              {m === mode ? <strong>{m}s</strong> : `${m}s`}
            </text>
          </box>
        ))}
      </box>
    </box>
  );
}
