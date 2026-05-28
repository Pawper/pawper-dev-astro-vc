import React, { useState, useLayoutEffect, useRef } from "react";
import CXPill from "./CXPill";

export interface PillItem {
  key: string;
  label: string;
  color?: string;
  onClick?: () => void;
}

interface Props {
  pills: PillItem[];
  plain?: string[];
  size?: "sm" | "md";
  /** Optional content rendered as the first flex item, so it wraps and centers
   *  on the same row as the first line of pills. */
  lead?: React.ReactNode;
}

export default function CollapsiblePills({ pills, plain = [], size = "sm", lead }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [cutoff, setCutoff] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (expanded || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>("[data-p]"));
    if (!items.length) return;
    let rows = 0, prevTop = -Infinity;
    for (let i = 0; i < items.length; i++) {
      const top = Math.round(items[i].getBoundingClientRect().top);
      if (top > prevTop + 2) { rows++; prevTop = top; }
      if (rows > 2) { setCutoff(c => c === i ? c : i); return; }
    }
    setCutoff(c => c === null ? c : null);
  }, [pills.length]);

  const shown = expanded || cutoff === null ? pills : pills.slice(0, cutoff);
  const hiddenCount = pills.length - shown.length + (!expanded && cutoff !== null ? plain.length : 0);

  return (
    <div
      ref={ref}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5 }}
    >
      {lead}
      {shown.map((p) => (
        <span key={p.key} data-p>
          <CXPill size={size} color={p.color} onClick={p.onClick}>{p.label}</CXPill>
        </span>
      ))}
      {(expanded || cutoff === null) && plain.map((s, i) => (
        <React.Fragment key={s}>
          {(shown.length > 0 || i > 0) && (
            <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>
          )}
          <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.04em" }}>{s}</span>
        </React.Fragment>
      ))}
      {hiddenCount > 0 && !expanded && (
        <span
          className="pw-mono"
          onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          style={{ fontSize: 10, color: "var(--section-deep)", cursor: "pointer", letterSpacing: "0.04em", userSelect: "none" }}
        >
          +{hiddenCount} MORE
        </span>
      )}
      {expanded && cutoff !== null && (
        <>
          <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>
          <span
            className="pw-mono"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            style={{ fontSize: 10, color: "var(--section-deep)", cursor: "pointer", letterSpacing: "0.04em", userSelect: "none", textTransform: "uppercase" }}
          >
            less
          </span>
        </>
      )}
    </div>
  );
}
