import { readdirSync, statSync, readFileSync } from "fs";
import { join, basename, dirname, extname } from "path";

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
}

export interface FuzzyMatch {
  entry: FileEntry;
  score: number;
  indices: number[];
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

export function scanDirectoryRecursive(dir: string, maxDepth = 2): FileEntry[] {
  const result: FileEntry[] = [];

  function scan(currentDir: string, depth: number) {
    if (depth > maxDepth) return;
    try {
      const entries = readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const fullPath = join(currentDir, entry.name);
        result.push({
          name: entry.name,
          path: fullPath,
          isDir: entry.isDirectory(),
        });
        if (entry.isDirectory()) {
          scan(fullPath, depth + 1);
        }
      }
    } catch {
      // ignore unreadable directories
    }
  }

  scan(dir, 0);
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

const FILE_ICONS: Record<string, string> = {
  ts: "ts",
  tsx: "tsx",
  js: "js",
  jsx: "jsx",
  json: "json",
  md: "md",
  css: "css",
  scss: "scss",
  html: "html",
  yaml: "yaml",
  yml: "yml",
  toml: "toml",
  py: "py",
  rs: "rs",
  go: "go",
  c: "c",
  cpp: "cpp",
  h: "h",
  java: "java",
  kt: "kt",
  rb: "rb",
  php: "php",
  sh: "sh",
  zsh: "zsh",
  bash: "bash",
  dockerfile: "docker",
  sql: "sql",
  graphql: "gql",
  gql: "gql",
  xml: "xml",
  svg: "svg",
  png: "img",
  jpg: "img",
  jpeg: "img",
  gif: "img",
  ico: "img",
  webp: "img",
  mp3: "audio",
  mp4: "video",
  wav: "audio",
  pdf: "pdf",
  zip: "zip",
  tar: "zip",
  gz: "zip",
  lock: "lock",
};

export function getFileIcon(entry: FileEntry): string {
  if (entry.isDir) return "dir";
  const ext = extname(entry.name).slice(1).toLowerCase();
  const base = basename(entry.name).toLowerCase();
  if (base === "dockerfile" || base.startsWith("dockerfile")) return "docker";
  if (base === "makefile" || base === "gemfile") return base;
  return FILE_ICONS[ext] ?? "file";
}

export interface PathFuzzyMatch {
  entry: FileEntry;
  score: number;
  nameIndices: number[];
  pathIndices: number[];
}

function fuzzyMatch(text: string, query: string): { matched: boolean; score: number; indices: number[] } {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const indices: number[] = [];
  let qi = 0;
  let score = 0;

  for (let ni = 0; ni < lowerText.length && qi < lowerQuery.length; ni++) {
    if (lowerText[ni] === lowerQuery[qi]) {
      indices.push(ni);
      score += 100 - ni;
      if (qi > 0 && ni === indices[qi - 1]! + 1) {
        score += 50;
      }
      qi++;
    }
  }

  if (qi === lowerQuery.length) {
    if (lowerText.includes(lowerQuery)) {
      score += 200;
    }
    return { matched: true, score, indices };
  }

  return { matched: false, score: 0, indices: [] };
}

export function fuzzySearch(entries: FileEntry[], query: string): FuzzyMatch[] {
  if (!query) {
    return entries.map((entry) => ({ entry, score: 0, indices: [] }));
  }

  const matches: FuzzyMatch[] = [];

  for (const entry of entries) {
    const nameResult = fuzzyMatch(entry.name, query);
    if (nameResult.matched) {
      matches.push({ entry, score: nameResult.score, indices: nameResult.indices });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
}

export function fuzzySearchWithPath(entries: FileEntry[], query: string, cwd: string): PathFuzzyMatch[] {
  if (!query) {
    return entries.map((entry) => ({ entry, score: 0, nameIndices: [], pathIndices: [] }));
  }

  const matches: PathFuzzyMatch[] = [];

  for (const entry of entries) {
    const relPath = entry.path.startsWith(cwd) ? entry.path.slice(cwd.length + 1) : entry.path;
    const nameResult = fuzzyMatch(entry.name, query);
    const pathResult = fuzzyMatch(relPath, query);

    if (nameResult.matched || pathResult.matched) {
      const nameScore = nameResult.matched ? nameResult.score : -1;
      const pathScore = pathResult.matched ? pathResult.score : -1;

      // Prefer name match unless path match is significantly better
      if (nameScore >= pathScore) {
        matches.push({ entry, score: nameScore, nameIndices: nameResult.indices, pathIndices: [] });
      } else {
        matches.push({ entry, score: pathScore, nameIndices: [], pathIndices: pathResult.indices });
      }
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
}
