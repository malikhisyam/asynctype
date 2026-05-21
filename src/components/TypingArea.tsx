import type { Theme } from "../lib/themes.js";

interface TypingAreaProps {
  targetText: string;
  typedText: string;
  isFinished: boolean;
  theme: Theme;
  scrollOffset: number;
  visibleLineCount: number;
}

export function TypingArea({
  targetText,
  typedText,
  isFinished,
  theme,
  scrollOffset,
  visibleLineCount,
}: TypingAreaProps) {
  const lines = targetText.split("\n");

  // Calculate the global character index where the visible slice starts
  let startGlobalIndex = 0;
  for (let i = 0; i < scrollOffset && i < lines.length; i++) {
    startGlobalIndex += lines[i]!.length + 1; // +1 for newline
  }

  let globalIndex = startGlobalIndex;
  const endLine = Math.min(lines.length, scrollOffset + visibleLineCount);
  const renderedLines: React.ReactNode[] = [];

  for (let lineIdx = scrollOffset; lineIdx < endLine; lineIdx++) {
    const line = lines[lineIdx]!;
    const chars: React.ReactNode[] = [];

    for (let i = 0; i < line.length; i++) {
      const targetChar = line[i]!;
      const typedChar = typedText[globalIndex];

      let fg = theme.untyped;
      let bg: string | undefined = undefined;

      if (typedChar !== undefined) {
        if (typedChar === targetChar) {
          fg = theme.correct;
        } else {
          fg = theme.error;
          bg = theme.errorBg;
        }
      } else if (globalIndex === typedText.length && !isFinished) {
        fg = theme.cursor;
      }

      chars.push(
        <span key={globalIndex} fg={fg} bg={bg}>
          {targetChar}
        </span>
      );
      globalIndex++;
    }

    // Cursor at end of line when all chars on this line are typed
    const isEndOfLineCursor =
      !isFinished && globalIndex === typedText.length && line.length > 0;

    if (isEndOfLineCursor) {
      chars.push(
        <span key={`cursor-${lineIdx}`} fg={theme.cursor}>
          {" "}
        </span>
      );
    }

    renderedLines.push(<text key={lineIdx}>{chars}</text>);

    // Advance past the newline character in targetText
    globalIndex++;
  }

  return (
    <box
      paddingX={2}
      paddingY={1}
      flexDirection="column"
      alignItems="flex-start"
      gap={0}
    >
      {renderedLines}
    </box>
  );
}
