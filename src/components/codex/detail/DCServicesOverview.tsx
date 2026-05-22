import React from "react";
import { SERVICES } from "../../../data/content";
import CXCard from "../CXCard";

interface Props {
  selectEntry: (catId: string, entryId: string) => void;
}

export default function DCServicesOverview({ selectEntry }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <p style={{
        fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)",
        margin: 0, maxWidth: "64ch", textWrap: "pretty",
      } as React.CSSProperties}>
        Available for technical engagements, strategic consulting, and wellness coaching.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {SERVICES.map((svc) => (
          <CXCard key={svc.id} onClick={() => selectEntry("services", svc.id)} style={{
            padding: "20px 22px", borderRadius: 14,
            display: "flex", flexDirection: "column", gap: 10,
            cursor: "pointer", height: "100%",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div className="pw-eyebrow cx-glass-label">{svc.kicker}</div>
                <div style={{
                  display: "flex", alignItems: "center", gap: svc.status === "open" ? 1 : 5,
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: svc.status === "open" ? "var(--section-deep)" : "var(--ink-mute)",
                }}>
                  {svc.status === "open"
                    ? <span style={{ fontSize: 13.5, fontWeight: 300, display: "inline-flex", alignItems: "center" }}>◈</span>
                    : <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                  }
                  {svc.status === "open" ? "Open" : "Full"}
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{svc.label}</div>
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.65, color: "var(--ink-soft)",
              margin: 0, flexGrow: 1,
            }}>
              {svc.desc}
            </p>
            <div style={{
              fontSize: 12, color: "var(--section-accent)",
              fontWeight: 500, marginTop: 4,
            }}>
              View →
            </div>
          </CXCard>
        ))}
      </div>
    </div>
  );
}
