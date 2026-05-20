import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { TimerMode } from "./game.js";

export interface ScoreEntry {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  mode: TimerMode;
  date: string; // ISO date string
}

export interface AppConfig {
  theme?: string;
  timerMode?: TimerMode;
  soundEnabled?: boolean;
  scores?: ScoreEntry[];
}

const CONFIG_DIR = join(homedir(), ".config", "asynctype");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function loadConfig(): AppConfig {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return {};
    }
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as AppConfig;
  } catch {
    return {};
  }
}

export function saveConfig(partial: Partial<AppConfig>): void {
  try {
    const current = loadConfig();
    const next: AppConfig = { ...current, ...partial };
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2));
  } catch {
    // silently fail so the app never crashes on config I/O issues
  }
}

const MAX_SCORES = 50;

export function saveScore(entry: ScoreEntry): void {
  try {
    const current = loadConfig();
    const scores: ScoreEntry[] = current.scores ?? [];
    scores.unshift(entry);
    if (scores.length > MAX_SCORES) {
      scores.pop();
    }
    saveConfig({ scores });
  } catch {
    // silently fail
  }
}
