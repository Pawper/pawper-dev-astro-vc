import React, { useRef, useEffect, useState } from "react";
import { soundClick, soundHover } from "../../context/SoundContext";

export function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (n: number) => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.179 ? "rgba(0,0,0,0.82)" : "rgba(255,255,255,0.92)";
}

// Parses a computed color value (#rrggbb, rgb(r,g,b), or rgba(r,g,b,a)) into a hex string.
export function parseComputedColor(value: string): string | null {
  const v = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return "#" + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, "0")).join("");
  return null;
}

// Sizes: "lg" = category bar/clear (5×10px, 0.1em tracking)
//        "md" = tag/skill pills (4×8px, 0.08em tracking)   [default]
//        "sm" = sub-dropdown items (4×8px, 9px font, 0.08em tracking)
const SIZE_MAP = {
  lg: { fontSize: 10, padding: "5px 10px", letterSpacing: "0.1em" },
  md: { fontSize: 10, padding: "4px 8px",  letterSpacing: "0.08em" },
  sm: { fontSize: 9,  padding: "4px 8px",  letterSpacing: "0.08em" },
};

interface CXPillProps {
  children: React.ReactNode;
  count?: number;
  onClick?: () => void;
  size?: "lg" | "md" | "sm";
  // "primary"   — active = section-accent bg; idle/hover = section-rgb at 0.30/0.42
  // "secondary" — active = section-rgb at 0.55; idle = section-rgb at 0.22  [default]
  // "muted"     — fixed dim bg (clear/reset buttons)
  // "css"       — no inline bg/color; className CSS owns all theming (e.g. cx-skill-pill)
  variant?: "primary" | "secondary" | "muted" | "css";
  active?: boolean;
  hovered?: boolean;    // parent-controlled hover (for pills that reveal a dropdown)
  color?: string;       // explicit hex bg — overrides variant (language pills)
  className?: string;
  style?: React.CSSProperties;
}

export default function CXPill({
  children,
  count,
  onClick,
  size = "md",
  variant = "secondary",
  active = false,
  hovered = false,
  color,
  className = "",
  style,
}: CXPillProps) {
  const { fontSize, padding, letterSpacing } = SIZE_MAP[size];
  const ref = useRef<HTMLElement>(null);

  // For active theme-variant pills, resolve --section-accent from the DOM to compute
  // text contrast. Falls back to dark text on first render (most accents are bright).
  const needsResolution = !color && active && (variant === "primary" || variant === "secondary");
  const [resolvedText, setResolvedText] = useState<string | null>(null);

  useEffect(() => {
    if (!needsResolution || !ref.current) { setResolvedText(null); return; }
    const accent = getComputedStyle(ref.current).getPropertyValue("--section-accent");
    const hex = parseComputedColor(accent);
    setResolvedText(hex ? contrastText(hex) : null);
  }, [needsResolution, variant, active]);

  let bg: string | undefined;
  let textColor: string | undefined;

  if (variant !== "css") {
    if (color) {
      bg = color;
      textColor = contrastText(color);
    } else if (variant === "primary") {
      if (active) {
        bg = "var(--section-accent)";
        textColor = resolvedText ?? "rgba(0,0,0,0.82)";
      } else if (hovered) {
        bg = "rgba(var(--section-rgb), 0.42)";
        textColor = "var(--ink)";
      } else {
        bg = "rgba(var(--section-rgb), 0.30)";
        textColor = "var(--ink)";
      }
    } else if (variant === "secondary") {
      if (active) {
        bg = "rgba(var(--section-rgb), 0.55)";
        textColor = resolvedText ?? "rgba(0,0,0,0.82)";
      } else {
        bg = "rgba(var(--section-rgb), 0.22)";
        textColor = "var(--ink-soft)";
      }
    } else {
      bg = "rgba(255,255,255,0.08)";
      textColor = "var(--ink-mute)";
    }
  }

  const pillStyle: React.CSSProperties = {
    fontSize, padding, letterSpacing,
    borderRadius: 2,
    background: bg,
    color: textColor,
    fontWeight: 700,
    textTransform: "uppercase",
    border: "none",
    cursor: onClick ? "pointer" : "default",
    transition: "background .15s, color .15s",
    whiteSpace: "nowrap",
    ...style,
  };

  const cls = `pw-mono cx-proj-btn${className ? ` ${className}` : ""}`;

  const content = (
    <>
      {children}
      {count !== undefined && (
        <span style={{ marginLeft: size === "lg" ? 5 : 4, opacity: 0.65 }}>{count}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cls}
        style={pillStyle}
        onClick={() => { soundClick(); onClick(); }}
        onMouseEnter={soundHover}
      >
        {content}
      </button>
    );
  }

  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} className={cls} style={pillStyle}>
      {content}
    </span>
  );
}
