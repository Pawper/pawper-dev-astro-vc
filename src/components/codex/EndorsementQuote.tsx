import { useState } from "react";
import type React from "react";

interface Props {
  quote: string;
  pullQuote?: string;
}

const MARK_STYLE: React.CSSProperties = {
  background: "color-mix(in srgb, var(--section-accent) 35%, transparent)",
  color: "inherit",
  borderRadius: 2,
  padding: "0 1px",
};

const MIN_WORDS = 3;

function normalize(s: string) {
  return s.toLowerCase().replace(/[""'']/g, '"').replace(/[—–]/g, "-");
}

function highlightWithin(full: string, pull: string): React.ReactNode {
  const normFull = normalize(full);
  // Isolate ellipsis so it's never part of a word token, then drop it
  const pullWords = normalize(pull)
    .replace(/…/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const ranges: [number, number][] = [];

  let i = 0;
  while (i < pullWords.length) {
    let matched = false;
    // Try longest window first, down to MIN_WORDS
    const maxLen = Math.min(pullWords.length - i, 20);
    for (let len = maxLen; len >= MIN_WORDS; len--) {
      // Strip trailing punctuation from phrase before searching
      const phrase = pullWords.slice(i, i + len).join(" ").replace(/[.,!?;:'"]+$/, "");
      const idx = normFull.indexOf(phrase);
      if (idx !== -1) {
        const covered = ranges.some(([s, e]) => idx >= s && idx + phrase.length <= e);
        if (!covered) ranges.push([idx, idx + phrase.length]);
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) i++;
  }

  if (!ranges.length) return <>{full}</>;

  // Sort and merge adjacent/overlapping ranges
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [s, e] of ranges) {
    if (merged.length && s <= merged[merged.length - 1][1] + 1) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
    } else {
      merged.push([s, e]);
    }
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) nodes.push(full.slice(cursor, s));
    nodes.push(<mark key={s} style={MARK_STYLE}>{full.slice(s, e)}</mark>);
    cursor = e;
  }
  if (cursor < full.length) nodes.push(full.slice(cursor));

  return <>{nodes}</>;
}

export default function EndorsementQuote({ quote, pullQuote }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = pullQuote && pullQuote !== quote;

  return (
    <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink)", margin: "0 0 8px", fontStyle: "italic" }}>
      &ldquo;{expanded && hasMore ? highlightWithin(quote, pullQuote!) : (pullQuote ?? quote)}&rdquo;
      {hasMore && (
        <span
          className="pw-mono"
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
          style={{ marginLeft: 7, fontSize: 10, color: "var(--section-deep)", cursor: "pointer", letterSpacing: "0.1em", fontStyle: "normal", userSelect: "none" }}
        >
          {expanded ? "LESS" : "MORE"}
        </span>
      )}
    </p>
  );
}
