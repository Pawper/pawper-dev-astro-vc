import React, { useState, useEffect } from "react";
import type { Project } from "../../types";
import CXCard from "./CXCard";
import { getStackLabel, getPrimaryColor } from "../../data/content";

// Clamps HSL lightness so the swatch reads as text on glass-dim cards.
// Dark-mode cards are near-black (~9% L) — text needs L ≥ 62%.
// Light-mode cards are near-white (~96% L) — text needs L ≤ 38%.
// Colors already in that band pass through unchanged.
function clampEyebrowColor(hex: string, isDark: boolean): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const targetL = isDark ? Math.max(l, 0.62) : Math.min(l, 0.38);
  if (targetL === l) return hex;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 0.5) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q2 = targetL < 0.5 ? targetL * (1 + s) : targetL + s - targetL * s;
  const p2 = 2 * targetL - q2;
  const toHex = (c: number) => Math.round(Math.min(1, Math.max(0, hue2rgb(p2, q2, c))) * 255).toString(16).padStart(2, "0");
  return `#${toHex(h + 1 / 3)}${toHex(h)}${toHex(h - 1 / 3)}`;
}

interface CXProjectCardProps {
  p: Project;
  index: number;
  onClick: () => void;
  mixed?: boolean;
}

function readmeSnippet(readme: string | undefined): string | null {
  if (!readme) return null;
  const m = readme.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (!m) return null;
  return m[1]
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim();
}

function LangBar({ languages }: { languages: Project["languages"] }) {
  const entries = Object.entries(languages);
  if (!entries.length) return null;
  return (
    <div style={{ display: "flex", height: 3, borderRadius: 999, overflow: "hidden", gap: 1 }}>
      {entries.map(([lang, { percent, color }]) => (
        <div key={lang} style={{ width: `${percent}%`, background: color, minWidth: 2 }} />
      ))}
    </div>
  );
}

export default function CXProjectCard({ p, index, onClick, mixed = false }: CXProjectCardProps) {
  const swatch = getPrimaryColor(p);
  const snippet = readmeSnippet(p.readme);

  const [eyebrowColor, setEyebrowColor] = useState(() => {
    if (typeof document === "undefined") return swatch;
    return clampEyebrowColor(swatch, !!document.querySelector('[data-theme="dark"]'));
  });

  useEffect(() => {
    setEyebrowColor(clampEyebrowColor(swatch, !!document.querySelector('[data-theme="dark"]')));
  }, [swatch]);

  const thumbnail = (
    <>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: p.image ? `url("${p.image}")` : "none",
        backgroundSize: "cover", backgroundPosition: "center",
        backgroundColor: swatch,
      }} />
      {!mixed && (
        <>
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${swatch}33 0%, transparent 55%, rgba(0,0,0,0.18) 100%)`,
            mixBlendMode: "multiply",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at top left, rgba(0,0,0,0.55) 0%, transparent 65%)",
          }} />
        </>
      )}
    </>
  );

  const langFooter = (
    <>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {Object.entries(p.languages).slice(0, 3).map(([lang, { color }]) => (
          <span key={lang} className="pw-mono" style={{
            fontSize: 10, display: "inline-flex", alignItems: "center", gap: 4,
            color: "var(--ink-soft)",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }} />
            {lang}
          </span>
        ))}
      </div>
      <LangBar languages={p.languages} />
    </>
  );

  return (
    <CXCard
      onClick={onClick}
      accentColor={swatch}
      style={{ minHeight: 170 }}
      thumbnail={thumbnail}
      badge={!mixed ? String(index + 1).padStart(2, "0") : undefined}
      badgeColor={swatch}
      badgeFontSize={34}
      badgeScale={1.25}
      eyebrow={getStackLabel(p)}
      eyebrowColor={eyebrowColor}
      date={p.pushedAt.slice(0, 10).replace(/-/g, ".")}
      title={p.description}
      titleSize={18}
      hook={snippet ?? undefined}
      footer={langFooter}
    />
  );
}
