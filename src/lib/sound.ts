import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const SOUNDS_DIR = join(homedir(), ".config", "asynctype", "sounds");

// Lazy-load play-sound so the app starts fast even if the module is unused.
let player: ReturnType<typeof import("play-sound")> | null = null;

function getPlayer() {
  if (!player) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    player = require("play-sound")();
  }
  return player!;
}

function playFile(path: string): void {
  try {
    getPlayer().play(path, (err: Error | null) => {
      if (err) {
        process.stdout.write("\x07");
      }
    });
  } catch {
    process.stdout.write("\x07");
  }
}

/**
 * Play a keystroke sound.
 *
 * Priority:
 * 1. Custom sound file at ~/.config/asynctype/sounds/keystroke.wav (or .mp3, .ogg)
 * 2. Terminal bell character (\x07)
 */
export function playKeystrokeSound(): void {
  const candidates = ["keystroke.wav", "keystroke.mp3", "keystroke.ogg"];
  for (const name of candidates) {
    const full = join(SOUNDS_DIR, name);
    if (existsSync(full)) {
      playFile(full);
      return;
    }
  }
  // Fallback: terminal bell
  process.stdout.write("\x07");
}
