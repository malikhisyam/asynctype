import { readdirSync, statSync, readFileSync } from "fs";
import { join, basename, dirname } from "path";

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
}

export function scanDirectory(dir: string): FileEntry[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const result: FileEntry[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    result.push({
      name: entry.name,
      path: join(dir, entry.name),
      isDir: entry.isDirectory(),
    });
  }

  result.sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}

export function readFileContent(path: string): string {
  try {
    const content = readFileSync(path, "utf-8");
    // Normalize line endings
    const normalized = content.replace(/\r\n/g, "\n");
    // Convert tabs to 2 spaces, trim trailing whitespace per line
    const lines = normalized
      .split("\n")
      .map((line) => line.replace(/\t/g, "  ").replace(/\s+$/, ""));
    // Take first 80 lines, join with actual newlines preserved
    const limited = lines.slice(0, 80);
    const joined = limited.join("\n");
    // Hard cap at 5000 characters
    return joined.slice(0, 5000);
  } catch {
    return "Could not read file contents.";
  }
}

export function getParentDir(path: string): string {
  const parent = dirname(path);
  return parent === path ? "/" : parent;
}
