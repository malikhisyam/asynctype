export type TimerMode = 15 | 30 | 60;

export interface GameState {
  targetText: string;
  typedText: string;
  timerMode: TimerMode;
  timeRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
  startTime: number | null;
  totalKeystrokes: number;
  correctKeystrokes: number;
  errors: number;
  wordsTyped: number;
}

export interface GameStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number;
}

export const DEV_WORD_POOL = [
  // Programming terms
  "async", "await", "promise", "callback", "closure", "prototype",
  "recursion", "inheritance", "polymorphism", "encapsulation",
  "algorithm", "hashmap", "hashtable", "queue", "stack", "heap",
  "binary", "tree", "graph", "matrix", "vector", "tuple",
  "destructuring", "spread", "rest", "optional", "nullable",
  "interface", "generic", "abstract", "virtual", "override",
  "constructor", "destructor", "singleton", "factory", "builder",
  "observer", "iterator", "decorator", "adapter", "facade",

  // Terminal commands
  "grep", "awk", "sed", "curl", "wget", "tar", "gzip", "chmod",
  "chown", "find", "locate", "ps", "top", "htop", "kill", "pkill",
  "ssh", "scp", "rsync", "git", "npm", "yarn", "pnpm", "cargo",
  "docker", "kubectl", "helm", "terraform", "ansible", "make",
  "cmake", "ninja", "meson", "rustc", "clang", "gcc", "gdb",
  "valgrind", "strace", "lsof", "netstat", "ss", "tcpdump",
  "nmap", "ping", "traceroute", "dig", "whois", "jq", "fzf",

  // AI / dev terms
  "neural", "tensor", "embedding", "vectorize", "tokenize",
  "fine-tune", "inference", "training", "dataset", "pipeline",
  "transformer", "attention", "diffusion", "llm", "agent",
  "checkpoint", "epoch", "batch", "gradient", "optimizer",
  "backprop", "dropout", "regularization", "overfitting",
  "prompt", "context", "completion", "hallucination",
  "rag", "retrieval", "augmented", "generation", "synthetic",

  // Git commands
  "commit", "branch", "merge", "rebase", "cherry-pick", "stash",
  "checkout", "reset", "revert", "blame", "bisect", "diff",
  "status", "log", "remote", "fetch", "pull", "push", "clone",
  "init", "tag", "reflog", "worktree", "submodule", "hooks",

  // Linux vocabulary
  "kernel", "syscall", "daemon", "fork", "exec", "pipe", "fifo",
  "socket", "inode", "filesystem", "mount", "umount", "fstab",
  "systemd", "cron", "journal", "syslog", "dmesg", "sysctl",
  "module", "driver", "firmware", "bootloader", "initramfs",
  "namespace", "cgroup", "selinux", "apparmor", "iptables",

  // Async / concurrency
  "thread", "process", "mutex", "semaphore", "lock", "atomic",
  "race", "deadlock", "livelock", "starvation", "context",
  "coroutine", "fiber", "greenlet", "worker", "pool", "queue",
  "channel", "select", "eventloop", "epoll", "kqueue", "io_uring",
  "future", "deferred", "signal", "slot", "emit", "subscribe",
  "pubsub", "bus", "stream", "pipeline", "backpressure",

  // Web / networking
  "websocket", "graphql", "rest", "grpc", "protobuf", "json",
  "yaml", "toml", "xml", "html", "css", "dom", "shadow",
  "component", "route", "middleware", "handler", "listener",
  "request", "response", "header", "cookie", "session", "jwt",
  "oauth", "ssl", "tls", "certificate", "handshake", "cipher",

  // Database
  "schema", "migration", "index", "query", "transaction",
  "isolation", "acid", "sharding", "replication", "backup",
  "nosql", "relational", "join", "aggregate", "cursor",
  "ORM", "ODM", "pooling", "connection", "listener",
];

export function generateTargetText(mode: TimerMode): string {
  const wordCount = mode === 15 ? 30 : mode === 30 ? 60 : 120;
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = Math.floor(Math.random() * DEV_WORD_POOL.length);
    words.push(DEV_WORD_POOL[idx]!);
  }
  return words.join(" ");
}

export function createInitialState(mode: TimerMode): GameState {
  return {
    targetText: generateTargetText(mode),
    typedText: "",
    timerMode: mode,
    timeRemaining: mode,
    isRunning: false,
    isFinished: false,
    startTime: null,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    errors: 0,
    wordsTyped: 0,
  };
}

export function calculateStats(state: GameState): GameStats {
  const timeElapsed = state.startTime
    ? (Date.now() - state.startTime) / 1000
    : 0;
  const minutes = timeElapsed / 60;

  const totalChars = state.typedText.length;
  const correctChars = state.correctKeystrokes;
  const incorrectChars = state.totalKeystrokes - state.correctKeystrokes;

  let wpm = 0;
  let rawWpm = 0;

  if (minutes > 0) {
    const standardWords = totalChars / 5;
    const correctWords = correctChars / 5;
    rawWpm = Math.round(standardWords / minutes);
    wpm = Math.round(correctWords / minutes);
  }

  const accuracy =
    state.totalKeystrokes > 0
      ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
      : 100;

  return {
    wpm,
    rawWpm,
    accuracy,
    correctChars,
    incorrectChars,
    totalChars,
    timeElapsed: Math.round(timeElapsed),
  };
}
