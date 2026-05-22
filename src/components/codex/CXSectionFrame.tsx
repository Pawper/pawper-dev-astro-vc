import React, { type ReactNode } from "react";
import type { CXCategory } from "../../types";
import CXScrollable from "../shared/CXScrollable";
import Tap from "../shared/Tap";

interface CXSectionFrameProps {
  cat?: CXCategory;
  crumb?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerRight?: ReactNode;
  onOverview?: () => void;
}

// Approximate header height: 30px top padding + eyebrow + 8px margin + h1 + 16px bottom padding
const HEADER_H = 107;
const FADE_ZONE = 24;
const CONTENT_TOP = HEADER_H + FADE_ZONE;

export default function CXSectionFrame({ cat, crumb, children, footer, headerRight, onOverview }: CXSectionFrameProps) {
  return (
    <div
      key={(cat?.id ?? "") + (crumb ?? "")}
      className="pw-page"
      style={{ position: "relative", height: "100%" }}
    >
      {/* Scroll area fills the full panel. Viewport mask hides content in the header zone. */}
      <CXScrollable
        style={{
          position: "absolute", inset: 0,
          "--scroll-mask": `linear-gradient(to bottom, transparent ${HEADER_H}px, black ${CONTENT_TOP}px, black calc(100% - 160px), transparent calc(100% - 80px))`,
        } as React.CSSProperties}
      >
        <div className="cx-section-content" style={{ padding: `${CONTENT_TOP}px 46px 160px 40px` }}>
          {children}
        </div>
      </CXScrollable>

      {/* Header sits outside the viewport — unaffected by the viewport mask */}
      <div className="cx-section-header" style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "30px 40px 16px 40px",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        gap: 16, borderBottom: "1px solid rgba(255,255,255,0.3)",
        pointerEvents: "none",
      }}>
        <div>
          {onOverview ? (
            <Tap onClick={onOverview} className="pw-eyebrow cx-section-eyebrow-link" style={{ color: "var(--section-deep)", pointerEvents: "auto" }}>
              {cat?.code} · {cat?.label}
            </Tap>
          ) : (
            <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>{cat?.code} · {cat?.label}</div>
          )}
          <h1 className="cx-section-title" style={{
            fontSize: 32, fontWeight: 500, margin: "8px 0 0", letterSpacing: -0.5, lineHeight: 1.1,
            textWrap: "balance",
          } as React.CSSProperties}>
            {crumb}
          </h1>
        </div>
        {headerRight && <div style={{ flexShrink: 0 }}>{headerRight}</div>}
      </div>

      {footer && (
        <div className="cx-section-footer" style={{ position: "absolute", bottom: 48, right: 7 }}>
          {footer}
        </div>
      )}
    </div>
  );
}
