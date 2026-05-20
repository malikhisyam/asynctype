import { useState, useEffect, useCallback, useRef } from "react";
import { useKeyboard, useRenderer } from "@opentui/react";
import {
  type TimerMode,
  type GameState,
  type GameStats,
  createInitialState,
  calculateStats,
} from "../lib/game.js";
import { saveConfig, saveScore } from "../lib/config.js";
import type { Theme } from "../lib/themes.js";
import { Header } from "../components/Header.js";
import { TimerDisplay } from "../components/TimerDisplay.js";
import { StatsBar } from "../components/StatsBar.js";
import { TypingArea } from "../components/TypingArea.js";
import { EndScreen } from "../components/EndScreen.js";

const MODES: TimerMode[] = [15, 30, 60];

const SHAKE_FRAMES = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 0, y: 0 },
];

interface TypeRaceScreenProps {
  theme: Theme;
  customText?: string;
  defaultTimerMode?: TimerMode;
  onBack: () => void;
}

export function TypeRaceScreen({
  theme,
  customText,
  defaultTimerMode,
  onBack,
}: TypeRaceScreenProps) {
  const renderer = useRenderer();
  const initialMode = defaultTimerMode ?? 30;
  const [mode, setMode] = useState<TimerMode>(initialMode);
  const [gameState, setGameState] = useState<GameState>(() => {
    const s = createInitialState(initialMode);
    if (customText) {
      return { ...s, targetText: customText };
    }
    return s;
  });

  useEffect(() => {
    saveConfig({ timerMode: mode });
  }, [mode]);
  const [stats, setStats] = useState<GameStats>(calculateStats(gameState));

  const [shakeFrame, setShakeFrame] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const prevErrorsRef = useRef(gameState.errors);

  const restartGame = useCallback(
    (newMode?: TimerMode) => {
      const m = newMode ?? mode;
      const fresh = createInitialState(m);
      if (customText) {
        fresh.targetText = customText;
      }
      setMode(m);
      setGameState(fresh);
      setStats(calculateStats(fresh));
      setIsShaking(false);
      setShakeFrame(0);
      savedRef.current = false;
    },
    [mode, customText]
  );

  useEffect(() => {
    if (!gameState.isRunning || gameState.isFinished) return;

    const interval = setInterval(() => {
      setGameState((prev: GameState) => {
        const now = Date.now();
        const elapsed = prev.startTime ? (now - prev.startTime) / 1000 : 0;
        const remaining = Math.max(0, Math.ceil(prev.timerMode - elapsed));

        if (remaining <= 0) {
          return {
            ...prev,
            timeRemaining: 0,
            isRunning: false,
            isFinished: true,
          };
        }

        return { ...prev, timeRemaining: remaining };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.isRunning, gameState.isFinished]);

  useEffect(() => {
    setStats(calculateStats(gameState));
  }, [gameState]);

  const savedRef = useRef(false);

  useEffect(() => {
    if (gameState.isFinished && !savedRef.current && gameState.totalKeystrokes > 0) {
      savedRef.current = true;
      saveScore({
        wpm: stats.wpm,
        rawWpm: stats.rawWpm,
        accuracy: stats.accuracy,
        mode,
        date: new Date().toISOString(),
      });
    }
  }, [gameState.isFinished, gameState.totalKeystrokes, stats, mode]);

  useEffect(() => {
    if (gameState.errors > prevErrorsRef.current) {
      setIsShaking(true);
      setShakeFrame(0);
    }
    prevErrorsRef.current = gameState.errors;
  }, [gameState.errors]);

  useEffect(() => {
    if (!isShaking) return;
    if (shakeFrame >= SHAKE_FRAMES.length) {
      setIsShaking(false);
      return;
    }
    const timer = setTimeout(() => setShakeFrame((f) => f + 1), 35);
    return () => clearTimeout(timer);
  }, [isShaking, shakeFrame]);

  useKeyboard(
    useCallback(
      (key) => {
        if (key.name === "escape" || (!gameState.isRunning && key.name === "q")) {
          onBack();
          return;
        }

        if (gameState.isFinished) {
          if (
            key.name === "tab" ||
            key.name === "return" ||
            key.name === "enter"
          ) {
            restartGame();
          }
          return;
        }

        if (!gameState.isRunning) {
          if (key.name === "left" || key.name === "h") {
            const idx = MODES.indexOf(mode);
            if (idx > 0) restartGame(MODES[idx - 1]);
            return;
          }
          if (key.name === "right" || key.name === "l") {
            const idx = MODES.indexOf(mode);
            if (idx < MODES.length - 1) restartGame(MODES[idx + 1]);
            return;
          }
        }

        if (key.name === "tab") {
          restartGame();
          return;
        }

        if (key.ctrl || key.meta) {
          return;
        }

        const target = gameState.targetText;
        let typed = gameState.typedText;

        if (key.name === "backspace") {
          if (typed.length > 0) {
            typed = typed.slice(0, -1);
          }
        } else if (key.name === "space" || key.name === " ") {
          if (typed.length < target.length) {
            typed += " ";
          }
        } else if (key.name && key.name.length === 1) {
          if (typed.length < target.length) {
            let char = key.name;
            if (
              (key.shift || (key as unknown as { capsLock?: boolean }).capsLock) &&
              char >= "a" &&
              char <= "z"
            ) {
              char = char.toUpperCase();
            }
            typed += char;
          }
        }

        const isFirstChar = !gameState.isRunning && typed.length > 0;
        const now = Date.now();

        let newState = { ...gameState, typedText: typed };

        if (isFirstChar) {
          newState.isRunning = true;
          newState.startTime = now;
        }

        if (typed.length > gameState.typedText.length) {
          const newChar = typed[typed.length - 1];
          const targetChar = target[typed.length - 1];
          newState.totalKeystrokes += 1;
          if (newChar.toLowerCase() === targetChar.toLowerCase()) {
            newState.correctKeystrokes += 1;
          } else {
            newState.errors += 1;
          }
        }

        if (typed.length >= target.length && !gameState.isFinished) {
          newState.isRunning = false;
          newState.isFinished = true;
        }

        setGameState(newState);
      },
      [gameState, restartGame, onBack, mode]
    )
  );

  const handleModeChange = useCallback(
    (newMode: TimerMode) => {
      restartGame(newMode);
    },
    [restartGame]
  );

  const shake = isShaking ? (SHAKE_FRAMES[shakeFrame] ?? { x: 0, y: 0 }) : { x: 0, y: 0 };

  return (
    <box
      flexDirection="column"
      gap={0}
      marginLeft={shake.x}
      marginTop={shake.y}
    >
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        theme={theme}
      />
      <TimerDisplay timeRemaining={gameState.timeRemaining} theme={theme} />
      <StatsBar stats={stats} theme={theme} />

      {gameState.isFinished ? (
        <EndScreen
          stats={stats}
          onRestart={restartGame}
          onQuit={onBack}
          theme={theme}
        />
      ) : (
        <TypingArea
          targetText={gameState.targetText}
          typedText={gameState.typedText}
          isFinished={gameState.isFinished}
          theme={theme}
        />
      )}

      {!gameState.isFinished && (
        <box flexDirection="row" justifyContent="center" marginTop={1}>
          <text fg={theme.muted}>
            {!gameState.isRunning
              ? "h/l to change mode · tab to restart · esc or q to quit"
              : "tab to restart · esc to quit"}
          </text>
        </box>
      )}
    </box>
  );
}
