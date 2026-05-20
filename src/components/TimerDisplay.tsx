import type { Theme } from "../lib/themes.js";

interface TimerDisplayProps {
  timeRemaining: number;
  theme: Theme;
}

export function TimerDisplay({ timeRemaining, theme }: TimerDisplayProps) {
  const color = timeRemaining <= 5 ? theme.error : theme.fg;
  const display = `${timeRemaining}s`;

  return (
    <box flexDirection="row" justifyContent="center" paddingY={1}>
      <text fg={color}>
        <strong>{display}</strong>
      </text>
    </box>
  );
}
