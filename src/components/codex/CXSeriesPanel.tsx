import React, { useState } from "react";
import { LOGS, slugify } from "../../data/content";
import type { ModalState } from "../../types";
import Tap from "../shared/Tap";
import { soundClick, soundHover } from "../../context/SoundContext";

interface CXSeriesPanelProps {
  openModal: (m: ModalState) => void;
}

const CARD_H   = 186;
const STACK_DX = 7;
const OFFSETS  = [9, 5] as const;

export default function CXSeriesPanel({ openModal }: CXSeriesPanelProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const seriesNames = [...new Set(LOGS.filter((a) => a.series).map((a) => a.series!.name))];
  const groups = seriesNames.map((name) => {
    const logs = LOGS.filter((a) => a.series?.name === name).sort((a, b) => a.series!.part - b.series!.part);
    const total = logs[0]?.series?.total ?? logs.length;
    return { name, slug: slugify(name), logs, total, unreleased: Math.max(0, total - logs.length) };
  });

  return (
    <div className="cx-series-panel-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, alignItems: "end" }}>
      {groups.map(({ name, slug, logs, total, unreleased }) => {
        const n = Math.min(total, 3);
        const totalOffset = OFFSETS.slice(0, n - 1).reduce((s, v) => s + v, 0);
        const containerH  = CARD_H + totalOffset;
        const isHov = hovered === slug;

        return (
          <Tap
            key={slug}
            onClick={() => { soundClick(); openModal({ kind: "series", id: slug }); }}
            onMouseEnter={() => { soundHover(); setHovered(slug); }}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: "relative",
              height: containerH,
              cursor: "pointer",
              transform: isHov ? "translateY(-2px)" : "translateY(0)",
              transition: "transform .2s cubic-bezier(.2,.7,.3,1)",
            }}
          >
            {/* Back ghost */}
            {n >= 3 && (
              <div className="cx-series-card-back" style={{
                position: "absolute",
                top: 0, left: 0, right: 0, height: CARD_H,
                zIndex: 1, borderRadius: 16,
                borderLeft: "4px solid rgba(var(--section-rgb), 0.25)",
                transform: `translateX(${STACK_DX * 2}px)`,
              }} />
            )}

            {/* Mid ghost */}
            {n >= 2 && (
              <div className="cx-series-card-mid" style={{
                position: "absolute",
                top: n >= 3 ? OFFSETS[1] : 0,
                left: 0, right: 0, height: CARD_H,
                zIndex: 2, borderRadius: 16,
                borderLeft: "4px solid rgba(var(--section-rgb), 0.42)",
                transform: `translateX(${STACK_DX}px)`,
              }} />
            )}

            {/* Front card */}
            <div className="cx-series-card" style={{
              position: "absolute",
              top: totalOffset, left: 0, right: 0, height: CARD_H,
              zIndex: 3, borderRadius: 16,
              borderLeft: "4px solid var(--section-accent)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
              boxShadow: isHov
                ? "0 14px 36px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)"
                : "none",
              transition: "box-shadow .2s",
            }}>
              {/* Fading title list — max 3 visible, remainder collapsed */}
              <div style={{
                flex: 1,
                padding: "20px 20px 14px 20px",
                display: "flex", flexDirection: "column", gap: 10,
                overflow: "hidden",
              }}>
                {logs.slice(0, 3).map((a, i) => (
                  <div key={a.id} style={{
                    fontSize: 13, fontWeight: i === 0 ? 500 : 400,
                    lineHeight: 1.35, letterSpacing: -0.1,
                    color: "var(--ink)",
                    opacity: Math.max(0.08, 1 - i * 0.3),
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {a.title}
                  </div>
                ))}
                {(logs.length > 3 || unreleased > 0) && (
                  <div className="pw-mono" style={{
                    fontSize: 10, letterSpacing: "0.16em",
                    opacity: 0.55, marginTop: 2,
                    display: "flex", gap: 10,
                  }}>
                    {logs.length > 3 && (
                      <span style={{ color: "var(--ink-mute)" }}>+{logs.length - 3} MORE</span>
                    )}
                    {unreleased > 0 && (
                      <span style={{ color: "var(--section-accent)" }}>· {unreleased} COMING SOON</span>
                    )}
                  </div>
                )}
              </div>

              {/* Thick bottom stripe — clipped to card's border-radius by parent overflow:hidden */}
              <div style={{
                flexShrink: 0,
                background: "var(--section-accent)",
                display: "flex", flexDirection: "row", alignItems: "center",
                padding: "10px 18px", gap: 12,
              }}>
                <svg width="22" height="20" viewBox="0 0 122.88 111.96" fill="rgba(0,0,0,0.7)" style={{ flexShrink: 0 }}>
                  <path d="M61.15,0L0,26.52l61.41,24.96l61.47-24.88L61.15,0L61.15,0z M122.88,57.12L95.46,45.31L62.73,58.56c-0.88,0.36-1.83,0.33-2.65,0L27.27,45.22L0,57.05L61.41,82L122.88,57.12L122.88,57.12z M96.14,75.56L62.73,89.08c-0.88,0.36-1.83,0.33-2.65,0L26.59,75.47L0,87.01l61.41,24.96l61.47-24.88L96.14,75.56L96.14,75.56z"/>
                </svg>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{
                    fontSize: 17, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2,
                    color: "rgba(0,0,0,0.85)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {name}
                  </span>
                  <span className="pw-mono" style={{
                    fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.72)",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                  }}>
                    {total} logs{unreleased > 0 ? ` · ${logs.length} published` : ""} · ~{Math.round(logs.reduce((s, a) => s + a.words, 0) / 240)} min
                  </span>
                </div>
              </div>
            </div>
          </Tap>
        );
      })}
    </div>
  );
}
