import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { THEMES, type Theme } from "../lib/themes.js";

interface ThemeScreenProps {
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  onBack: () => void;
}

export function ThemeScreen({ currentTheme, onSelectTheme, onBack }: ThemeScreenProps) {
  const [selected, setSelected] = useState(
    THEMES.findIndex((t) => t.name === currentTheme.name)
  );

  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "q" || key.name === "h") {
      onBack();
      return;
    }
    if (key.name === "j" || key.name === "down") {
      setSelected((s) => Math.min(THEMES.length - 1, s + 1));
      return;
    }
    if (key.name === "k" || key.name === "up") {
      setSelected((s) => Math.max(0, s - 1));
      return;
    }
    if (key.name === "enter" || key.name === "return" || key.name === "l") {
      const theme = THEMES[selected];
      if (theme) onSelectTheme(theme);
      return;
    }
  });

  return (
    <box flexDirection="column" paddingX={1} paddingY={1} alignItems="center">
      <text fg={currentTheme.accent}>
        <strong>Themes</strong>
      </text>

      <box flexDirection="column" gap={0} marginTop={1} alignItems="flex-start">
        {THEMES.map((theme, i) => {
          const isSelected = i === selected;
          const isCurrent = theme.name === currentTheme.name;

          return (
            <box
              key={theme.name}
              flexDirection="row"
              gap={1}
              paddingX={1}
              paddingY={0}
              backgroundColor={isSelected ? theme.selectedBg : undefined}
            >
              <text fg={isSelected ? currentTheme.accent : currentTheme.muted}>
                {isSelected ? ">" : " "}
              </text>
              <text fg={isSelected ? currentTheme.fg : currentTheme.muted}>
                {isSelected ? <strong>{theme.name}</strong> : theme.name}
              </text>
              {isCurrent && (
                <text fg={currentTheme.accent}> (active)</text>
              )}
            </box>
          );
        })}
      </box>

      <box flexDirection="column" marginTop={2} alignItems="center">
        <text fg={currentTheme.muted}>
          j/k to navigate · enter or l to select · h/esc/q to go back
        </text>
      </box>
    </box>
  );
}
