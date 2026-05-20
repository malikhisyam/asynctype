import { useState, useCallback, useEffect } from "react";
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/react";
import { Theme, DEFAULT_THEME, THEMES } from "./lib/themes.js";
import { loadConfig, saveConfig } from "./lib/config.js";
import { HomeScreen } from "./screens/HomeScreen.js";
import { FileBrowser } from "./screens/FileBrowser.js";
import { ThemeScreen } from "./screens/ThemeScreen.js";
import { TypeRaceScreen } from "./screens/TypeRaceScreen.js";
import { LeaderboardScreen } from "./screens/LeaderboardScreen.js";

type Screen =
  | "home"
  | "random"
  | "filebrowser"
  | "filegame"
  | "multiplayer"
  | "themes"
  | "leaderboard";

function MultiplayerPlaceholder({
  theme,
  onBack,
}: {
  theme: Theme;
  onBack: () => void;
}) {
  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "q" || key.name === "h") {
      onBack();
    }
  });

  return (
    <box flexDirection="column" alignItems="center" paddingY={3} gap={1}>
      <text fg={theme.accent}>
        <strong>Multiplayer</strong>
      </text>
      <text fg={theme.fg}>Coming soon...</text>
      <text fg={theme.muted} marginTop={1}>
        Press esc, q, or h to go back
      </text>
    </box>
  );
}

function App() {
  const renderer = useRenderer();
  const { width, height } = useTerminalDimensions();
  const config = loadConfig();
  const initialTheme =
    THEMES.find((t) => t.name === config.theme) ?? DEFAULT_THEME;
  const [screen, setScreen] = useState<Screen>("home");
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    config.soundEnabled ?? false
  );
  const [fileContent, setFileContent] = useState<string | undefined>(undefined);

  useEffect(() => {
    saveConfig({ theme: theme.name });
  }, [theme]);

  useEffect(() => {
    saveConfig({ soundEnabled });
  }, [soundEnabled]);

  const goHome = useCallback(() => {
    setScreen("home");
    setFileContent(undefined);
  }, []);

  const goRandom = useCallback(() => {
    setFileContent(undefined);
    setScreen("random");
  }, []);

  const goFileBrowser = useCallback(() => {
    setScreen("filebrowser");
  }, []);

  const goMultiplayer = useCallback(() => {
    setScreen("multiplayer");
  }, []);

  const goThemes = useCallback(() => {
    setScreen("themes");
  }, []);

  const goLeaderboard = useCallback(() => {
    setScreen("leaderboard");
  }, []);

  const handleSelectFile = useCallback((content: string) => {
    setFileContent(content);
    setScreen("filegame");
  }, []);

  const handleSelectTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    setScreen("home");
  }, []);

  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") {
      renderer.destroy();
      return;
    }
  });

  return (
    <box
      flexDirection="column"
      width={width}
      height={height}
      backgroundColor={theme.bg}
      alignItems="center"
      justifyContent="center"
    >
      <box flexDirection="column" width={Math.min(80, width)} gap={0}>
        {screen === "home" && (
          <HomeScreen
            theme={theme}
            soundEnabled={soundEnabled}
            onPlayRandom={goRandom}
            onPlayByFile={goFileBrowser}
            onMultiplayer={goMultiplayer}
            onThemes={goThemes}
            onLeaderboard={goLeaderboard}
            onToggleSound={() => setSoundEnabled((s) => !s)}
            onQuit={() => renderer.destroy()}
          />
        )}

        {screen === "random" && (
          <TypeRaceScreen
            theme={theme}
            defaultTimerMode={config.timerMode}
            soundEnabled={soundEnabled}
            onBack={goHome}
          />
        )}

        {screen === "filebrowser" && (
          <FileBrowser
            theme={theme}
            onSelectFile={handleSelectFile}
            onBack={goHome}
          />
        )}

        {screen === "filegame" && (
          <TypeRaceScreen
            theme={theme}
            customText={fileContent}
            defaultTimerMode={config.timerMode}
            soundEnabled={soundEnabled}
            onBack={goHome}
          />
        )}

        {screen === "multiplayer" && (
          <MultiplayerPlaceholder theme={theme} onBack={goHome} />
        )}

        {screen === "themes" && (
          <ThemeScreen
            currentTheme={theme}
            onSelectTheme={handleSelectTheme}
            onBack={goHome}
          />
        )}

        {screen === "leaderboard" && (
          <LeaderboardScreen
            scores={config.scores ?? []}
            theme={theme}
            onBack={goHome}
          />
        )}
      </box>
    </box>
  );
}

export { App };
