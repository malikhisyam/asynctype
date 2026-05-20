import { readdirSync, statSync, readFileSync } from "fs";
import { join, basename } from "path";

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
    // Normalize: collapse excessive whitespace, strip non-printable chars
    return content
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, "  ")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2000);
  } catch {
    return "Could not read file contents.";
  }
}

export function getParentDir(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
}
