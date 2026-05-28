import React, { useState, useEffect } from "react";
import type { Project } from "../../types";
import CXCard from "./CXCard";
import { getStackLabel, getPrimaryColor } from "../../data/content";
import { clampEyebrowColor } from "../../utils/color";

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
