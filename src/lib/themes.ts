export interface Theme {
  name: string;
  bg: string;
  fg: string;
  accent: string;
  error: string;
  errorBg: string;
  label: string;
  muted: string;
  cursor: string;
  correct: string;
  untyped: string;
  selectedBg: string;
  border: string;
}

export const THEMES: Theme[] = [
  {
    name: "tokyo-night",
    bg: "#0d0d12",
    fg: "#c0caf5",
    accent: "#00d4aa",
    error: "#ff6b6b",
    errorBg: "#3a1f1f",
    label: "#7aa2f7",
    muted: "#4a4a5e",
    cursor: "#00d4aa",
    correct: "#c0caf5",
    untyped: "#565f89",
    selectedBg: "#1a1a2e",
    border: "#2a2a3e",
  },
  {
    name: "gruvbox-dark",
    bg: "#282828",
    fg: "#ebdbb2",
    accent: "#b8bb26",
    error: "#fb4934",
    errorBg: "#3c1f1a",
    label: "#83a598",
    muted: "#665c54",
    cursor: "#fabd2f",
    correct: "#ebdbb2",
    untyped: "#928374",
    selectedBg: "#3c3836",
    border: "#504945",
  },
  {
    name: "catppuccin-mocha",
    bg: "#1e1e2e",
    fg: "#cdd6f4",
    accent: "#a6e3a1",
    error: "#f38ba8",
    errorBg: "#3b1f2e",
    label: "#89b4fa",
    muted: "#6c7086",
    cursor: "#f5c2e7",
    correct: "#cdd6f4",
    untyped: "#585b70",
    selectedBg: "#313244",
    border: "#45475a",
  },
  {
    name: "monokai",
    bg: "#272822",
    fg: "#f8f8f2",
    accent: "#a6e22e",
    error: "#f92672",
    errorBg: "#3b1f2b",
    label: "#66d9ef",
    muted: "#75715e",
    cursor: "#fd971f",
    correct: "#f8f8f2",
    untyped: "#75715e",
    selectedBg: "#3e3d32",
    border: "#49483e",
  },
  {
    name: "solarized-dark",
    bg: "#002b36",
    fg: "#839496",
    accent: "#859900",
    error: "#dc322f",
    errorBg: "#361f1f",
    label: "#268bd2",
    muted: "#586e75",
    cursor: "#b58900",
    correct: "#93a1a1",
    untyped: "#586e75",
    selectedBg: "#073642",
    border: "#073642",
  },
  {
    name: "dracula",
    bg: "#282a36",
    fg: "#f8f8f2",
    accent: "#50fa7b",
    error: "#ff79c6",
    errorBg: "#3b1f2e",
    label: "#8be9fd",
    muted: "#6272a4",
    cursor: "#ffb86c",
    correct: "#f8f8f2",
    untyped: "#6272a4",
    selectedBg: "#44475a",
    border: "#44475a",
  },
  {
    name: "nord",
    bg: "#2e3440",
    fg: "#d8dee9",
    accent: "#a3be8c",
    error: "#bf616a",
    errorBg: "#3b1f2b",
    label: "#81a1c1",
    muted: "#4c566a",
    cursor: "#ebcb8b",
    correct: "#eceff4",
    untyped: "#4c566a",
    selectedBg: "#3b4252",
    border: "#434c5e",
  },
];

export const DEFAULT_THEME = THEMES[0]!;
