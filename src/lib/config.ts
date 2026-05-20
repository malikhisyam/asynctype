import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { TimerMode } from "./game.js";

export interface AppConfig {
  theme?: string;
  timerMode?: TimerMode;
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
