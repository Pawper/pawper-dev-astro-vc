import React from "react";
import type { View, ModalState } from "../../types";
import { CX_INDEX, PROJECTS, LOGS, ALL_EXPERIENCES, SERVICES } from "../../data/content";
import Tap from "../shared/Tap";
import { soundClick, soundHover } from "../../context/SoundContext";

interface CXIndexProps {
  view: View;
  openCats: Record<string, boolean>;
  onCategory: (catId: string) => void;
  onEntry: (catId: string, entryId: string) => void;
  onHome: () => void;
  openModal: (m: ModalState) => void;
  onClose?: () => void;
  side?: "left" | "right";
}

export default function CXIndex({ view, openCats, onCategory, onEntry, onHome, openModal, onClose, side = "left" }: CXIndexProps) {
  const isHome = view.kind === "home";
  const isRight = side === "right";

  return (
    <div className="pw-glass" style={{
      padding: 0,
      borderRadius: isRight ? "56px 8px 8px 56px" : "8px 56px 56px 8px",
      flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "stretch",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        borderRadius: isRight ? "56px 8px 0 0" : "8px 56px 0 0",
      }}>
        <Tap
          onClick={onHome}
          className="cx-index-home"
          style={{
            flex: 1,
            padding: isRight ? "10px 22px 14px 16px" : "10px 16px 14px 22px",
            borderRadius: isRight ? "0 8px 0 0" : "8px 0 0 0",
            display: "flex", flexDirection: "column", gap: 2,
            background: "transparent", transition: "background .15s",
          }}
        >
          <div className="pw-eyebrow cx-glass-label" style={{ color: "white" }}>Codex</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4 }}>Index</div>
        </Tap>
        {onClose && (
          <Tap onClick={onClose} style={{
            padding: "10px 20px 14px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "rgba(255,255,255,0.55)", background: "transparent", transition: "color .15s",
            borderRadius: isRight ? "56px 0 0 0" : "0 56px 0 0", flexShrink: 0,
            order: isRight ? -1 : 0,
          }}>
            ✕
          </Tap>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "10px 0" }}>
        {CX_INDEX.map((cat) => {
          const open = openCats[cat.id];
          const isCurrent = view.cat === cat.id;
          const hasSubmenu = !cat.rootIsGrid && !cat.rootIsCombo;
          const rgb = cat.accentRgb;

          return (
            <div key={cat.id}>
              {hasSubmenu ? (
              <Tap
                onClick={() => onCategory(cat.id)}
                className={`cx-nav-item${isCurrent ? " cx-nav-item-active" : ""}`}
                style={{
                  padding: "10px 24px 10px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                  borderLeft: isCurrent ? `4px solid ${cat.accent}` : "4px solid transparent",
                  background: isCurrent ? `rgba(${rgb}, 0.12)` : "transparent",
                  transition: "background .15s, border-color .15s",
                  "--cx-acc-rgb": rgb,
                  "--cx-acc-deep": cat.accentDeep,
                } as React.CSSProperties}
              >
                <span className="pw-mono" style={{
                  width: 28, fontSize: 10, letterSpacing: "0.1em",
                  color: isCurrent ? "white" : "var(--ink-mute)",
                }}>{cat.code}</span>
                <span style={{
                  fontSize: 15, fontWeight: 600, flex: 1,
                  color: isCurrent ? "white" : "var(--ink)",
                }}>{cat.label}</span>
                <svg className="cx-nav-item-arrow" width="10" height="10" viewBox="0 0 10 10" fill="none"
                  style={{
                    transform: open ? "rotate(90deg)" : "rotate(0)",
                    transition: "transform .2s",
                    color: isCurrent ? "white" : "var(--ink-mute)",
                    order: isRight ? -1 : 0,
                    marginRight: isRight ? 4 : 0,
                  }}>
                  <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </Tap>
            ) : (
              <Tap
                onClick={() => onCategory(cat.id)}
                className={`cx-nav-item${isCurrent ? " cx-nav-item-active" : ""}`}
                style={{
                  padding: "10px 24px 10px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                  borderLeft: isCurrent ? `4px solid ${cat.accent}` : "4px solid transparent",
                  background: isCurrent ? `rgba(${rgb}, 0.12)` : "transparent",
                  transition: "background .15s, border-color .15s",
                  "--cx-acc-rgb": rgb,
                  "--cx-acc-deep": cat.accentDeep,
                } as React.CSSProperties}
              >
                <span className="pw-mono" style={{
                  width: 28, fontSize: 10, letterSpacing: "0.1em",
                  color: isCurrent ? "white" : "var(--ink-mute)",
                }}>{cat.code}</span>
                <span style={{
                  fontSize: 15, fontWeight: 600, flex: 1,
                  color: isCurrent ? "white" : "var(--ink)",
                }}>{cat.label}</span>
                <span className="cx-nav-item-arrow pw-mono" style={{
                  fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
                  color: isCurrent ? "white" : "var(--ink-mute)",
                  order: isRight ? -1 : 0,
                  marginRight: isRight ? 4 : 0,
                }}>{cat.rootIsCombo ? "" : `${cat.entries.length} · ›`}</span>
              </Tap>
            )}

              {hasSubmenu && open && (
                <div style={{ padding: "0 0 8px" }}>
                  {cat.entries.map((e, idx) => {
                    const isSel = view.kind === "entry" && view.cat === cat.id && view.entry === e.id;
                    const isFirstSeries = e.id === "series";
                    const isOverview = e.id === "overview";
                    const svcStatus = cat.id === "services" && e.id !== "overview"
                      ? SERVICES.find(s => s.id === e.id)?.status
                      : null;
                    return (
                      <React.Fragment key={e.id}>
                        {isFirstSeries && (
                          <div style={{ margin: "4px 24px 0 54px", borderTop: "1px solid rgba(255,255,255,0.3)" }} />
                        )}
                      <Tap
                        onClick={() => onEntry(cat.id, e.id)}
                        className={`cx-nav-sub${isSel ? " cx-nav-sub-active" : ""}`}
                        style={{
                          padding: "7px 24px 7px 54px",
                          display: "flex", alignItems: "center", gap: 10,
                          borderLeft: "4px solid transparent",
                          background: isSel ? `rgba(${rgb}, 0.18)` : "transparent",
                          transition: "background .15s",
                          "--cx-acc-rgb": rgb,
                          "--cx-acc-deep": cat.accentDeep,
                        } as React.CSSProperties}
                      >
                        <span className={isSel ? undefined : "cx-nav-dash"} style={{ width: 12, height: 1, background: isSel ? cat.accent : undefined }} />
                        <span style={{
                          fontSize: 13, flex: 1,
                          color: isSel ? "white" : "var(--ink-soft)",
                          fontWeight: isSel ? 600 : 400,
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          {e.label}
                          {e.id === "series" && (
                            <svg width="13" height="12" viewBox="0 0 122.88 111.96" fill={isSel ? cat.accent : "currentColor"} style={{ opacity: isSel ? 1 : 0.55, flexShrink: 0 }}>
                              <path d="M61.15,0L0,26.52l61.41,24.96l61.47-24.88L61.15,0L61.15,0z M122.88,57.12L95.46,45.31L62.73,58.56c-0.88,0.36-1.83,0.33-2.65,0L27.27,45.22L0,57.05L61.41,82L122.88,57.12L122.88,57.12z M96.14,75.56L62.73,89.08c-0.88,0.36-1.83,0.33-2.65,0L26.59,75.47L0,87.01l61.41,24.96l61.47-24.88L96.14,75.56L96.14,75.56z"/>
                            </svg>
                          )}
                        </span>
                        {svcStatus && (
                          <span style={{ width: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {svcStatus === "open"
                              ? <span style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 1, color: isSel ? "rgba(255,255,255,0.7)" : cat.accentDeep }}>◈</span>
                              : <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: isSel ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)" }} />
                            }
                          </span>
                        )}
                        {e.sub && (
                          <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>
                            {e.sub}
                          </span>
                        )}
                      </Tap>
                        {isOverview && (
                          <div style={{ margin: "0 24px 4px 54px", borderTop: "1px solid rgba(255,255,255,0.3)" }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Tap
        onClick={() => { soundClick(); onClose?.(); openModal({ kind: "search", id: "" }); }}
        onMouseEnter={soundHover}
        style={{ padding: "10px 24px 14px", borderTop: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }}
        className="cx-search-footer"
      >
        <div className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.18em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="11" height="11" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="7.5" cy="7.5" r="5.5"/><line x1="11.5" y1="11.5" x2="16" y2="16"/>
          </svg>
          Search {PROJECTS.length + LOGS.length + ALL_EXPERIENCES.length} entries
        </div>
      </Tap>
    </div>
  );
}
