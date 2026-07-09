import React, { type HTMLAttributes } from "react";

type LyricLinesProps = HTMLAttributes<HTMLParagraphElement> & {
  fallback: string;
  showSecondary?: boolean;
  text: string;
};

const INLINE_TRANSLATION_PATTERN = /^(?<primary>.+?)[（(](?<secondary>[^（）()]+)[）)]$/;
const JAPANESE_KANA_PATTERN = /[\u3040-\u30ff]/;
const CJK_PATTERN = /[\u3400-\u9fff]/;
const LATIN_PATTERN = /[A-Za-z]/;

function looksLikeInlineTranslation(primary: string, secondary: string) {
  const primaryHasSourceScript = JAPANESE_KANA_PATTERN.test(primary) || LATIN_PATTERN.test(primary);
  const secondaryLooksChinese = CJK_PATTERN.test(secondary) && !JAPANESE_KANA_PATTERN.test(secondary);

  return primaryHasSourceScript && secondaryLooksChinese;
}

function splitLyricText(value: string, fallback: string) {
  const lines = (value || fallback).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (lines.length > 1) {
    return {
      primary: lines[0],
      secondary: lines.slice(1).join(" / "),
    };
  }

  const primary = lines[0] || fallback;
  const inlineMatch = primary.match(INLINE_TRANSLATION_PATTERN);
  const inlinePrimary = inlineMatch?.groups?.primary?.trim();
  const inlineSecondary = inlineMatch?.groups?.secondary?.trim();

  if (
    inlinePrimary &&
    inlineSecondary &&
    looksLikeInlineTranslation(inlinePrimary, inlineSecondary)
  ) {
    return {
      primary: inlinePrimary,
      secondary: inlineSecondary,
    };
  }

  return {
    primary,
    secondary: "",
  };
}

export default function LyricLines({ fallback, showSecondary = true, text, className, ...props }: LyricLinesProps) {
  const { primary, secondary } = splitLyricText(text, fallback);

  return (
    <p
      className={`${className ?? ""} lyric-line-group`.trim()}
      data-lyric-lines={showSecondary && secondary ? "double" : "single"}
      {...props}
    >
      <span className="lyric-line-primary">{primary || fallback}</span>
      {showSecondary && secondary ? <span className="lyric-line-secondary">{secondary}</span> : null}
    </p>
  );
}
