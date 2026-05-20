import type { Theme } from "../lib/themes.js";

interface TypingAreaProps {
  targetText: string;
  typedText: string;
  isFinished: boolean;
  theme: Theme;
}

export function TypingArea({ targetText, typedText, isFinished, theme }: TypingAreaProps) {
  const chars: React.ReactNode[] = [];

  for (let i = 0; i < targetText.length; i++) {
    const targetChar = targetText[i]!;
    const typedChar = typedText[i];

    let fg = theme.untyped;
    let bg: string | undefined = undefined;

    if (typedChar !== undefined) {
      if (typedChar === targetChar) {
        fg = theme.correct;
      } else {
        fg = theme.error;
        bg = theme.errorBg;
      }
    } else if (i === typedText.length && !isFinished) {
      fg = theme.cursor;
    }

    chars.push(
      <span key={i} fg={fg} bg={bg}>
        {targetChar}
      </span>
    );
  }

  return (
    <box
      paddingX={2}
      paddingY={1}
      flexDirection="column"
      alignItems="flex-start"
    >
      <text>{chars}</text>
    </box>
  );
}
