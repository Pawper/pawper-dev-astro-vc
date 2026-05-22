import React, { useRef, useEffect, useState } from "react";
import { soundClick, soundHover } from "../../context/SoundContext";
import { contrastText, parseComputedColor } from "./CXPill";

export const RssIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" className="cx-btn-icon" style={{ flexShrink: 0 }}>
    <circle cx="3" cy="9" r="1.5" fill="currentColor"/>
    <path d="M3 6 A3 3 0 0 1 6 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 3 A6 6 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Composites rgba(hex, 0.55) over the approximate glass-hi panel bg so contrastText
// evaluates the actual visible color, not the raw full-opacity hex.
// Dark glass-hi ≈ rgb(22,22,26); light glass-hi ≈ rgb(250,250,250).
function compositeWithGlass(hex: string, alpha: number, isDark: boolean): string {
  const bg = isDark ? 22 : 250;
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * alpha + bg * (1 - alpha));
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * alpha + bg * (1 - alpha));
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * alpha + bg * (1 - alpha));
  return `#${[r, g, b].map(n => n.toString(16).padStart(2, "0")).join("")}`;
}

const NUM: React.CSSProperties = {
  fontFamily: "'Bebas Neue', var(--font-sans)",
  fontSize: 40, lineHeight: 1,
  minWidth: 28, display: "flex", alignItems: "center", justifyContent: "flex-end",
  transform: "translateY(3px) scaleY(1.25)", transformOrigin: "center",
};

const INNER: React.CSSProperties = {
  width: 200, borderRadius: 1, padding: "10px 14px",
  fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase",
  display: "flex", justifyContent: "space-between", alignItems: "center",
};

interface CXBtnProps {
  num: string;
  label: string;
  href?: string;
  onClick?: () => void;
  download?: boolean;
  primary?: boolean;
  bgHex?: string;
  isDark?: boolean;
  icon?: React.ReactNode;
}

export default function CXBtn({
  num, label, href, onClick, download, primary = false, bgHex, isDark,
  icon = <span className="cx-btn-icon">↗</span>,
}: CXBtnProps) {
  const numColor = primary
    ? "var(--section-accent)"
    : "rgba(var(--section-rgb-2, var(--section-rgb)), 0.6)";
  const bg = primary
    ? "var(--section-accent)"
    : "rgba(var(--section-rgb-2, var(--section-rgb)), 0.55)";

  const nodeRef = useRef<HTMLElement | null>(null);

  // For secondary buttons, composite against glass before contrasting — the semi-transparent
  // bg reads much darker than the raw hex, especially for mid-tone colors in dark mode.
  // White text on dark secondary bgs reads visually heavier than black text on primary bgs
  // at the same weight, so pull down the opacity to match the perceived weight.
  const resolveTextColor = (hex: string, dark: boolean) => {
    const color = contrastText(primary ? hex : compositeWithGlass(hex, 0.55, dark));
    if (!primary && color === "rgba(255,255,255,0.92)") return "rgba(255,255,255,0.62)";
    return color;
  };

  const [textColor, setTextColor] = useState<string>(() => {
    // Synchronous path when both bgHex and isDark are known (modal buttons).
    if (bgHex !== undefined && isDark !== undefined) return resolveTextColor(bgHex, isDark);
    // Best-guess fallback — corrected in useEffect after mount.
    if (bgHex !== undefined) return contrastText(bgHex);
    return "rgba(0,0,0,0.82)";
  });

  useEffect(() => {
    const dark = isDark ?? !!document.querySelector("[data-theme=\"dark\"]");
    if (bgHex !== undefined) {
      setTextColor(resolveTextColor(bgHex, dark));
      return;
    }
    const el = nodeRef.current;
    if (!el) return;
    const raw = getComputedStyle(el).getPropertyValue("--section-accent");
    const hex = parseComputedColor(raw);
    if (hex) setTextColor(resolveTextColor(hex, dark));
  }, [bgHex, primary, isDark]);

  const inner = (
    <>
      <span className="cx-btn-num" style={{ ...NUM, color: numColor }}>{num}</span>
      <div className={`cx-btn-inner${!primary ? " cx-btn-secondary" : ""}`} style={{ ...INNER, background: bg, color: textColor }}>
        <span>{label}</span>{icon}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        ref={(el) => { nodeRef.current = el; }}
        href={href}
        target={download ? undefined : "_blank"}
        rel={download ? undefined : "noopener noreferrer"}
        download={download || undefined}
        className="cx-proj-btn"
        style={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none" }}
        onClick={() => { soundClick(); onClick?.(); }}
        onMouseEnter={soundHover}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      ref={(el) => { nodeRef.current = el; }}
      className="cx-proj-btn"
      style={{ display: "flex", alignItems: "center", gap: 1, background: "none", border: "none", padding: 0, cursor: "pointer" }}
      onClick={() => { soundClick(); onClick?.(); }}
      onMouseEnter={soundHover}
    >
      {inner}
    </button>
  );
}
