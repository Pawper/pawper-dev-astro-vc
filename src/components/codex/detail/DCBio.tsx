import React from "react";
import { PROFILE, SERVICES } from "../../../data/content";
import Readout from "../../shared/Readout";
import ResponsiveCloudinaryPicture from "../../shared/ResponsiveCloudinaryPicture";
import CXBtn from "../CXBtn";
import CXPill from "../CXPill";

interface DCBioFooterProps {
  selectEntry: (catId: string, entryId: string) => void;
}

export function DCBioFooter({ selectEntry }: DCBioFooterProps) {
  return (
    <div className="cx-btn-row" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
      <CXBtn num="01" label="Contact" primary onClick={() => selectEntry("contact", "all")} icon={null} />
      <CXBtn num="02" label="Activity" onClick={() => selectEntry("personnel", "activity")} icon={null} />
      <CXBtn num="03" label="Resume" onClick={() => selectEntry("personnel", "resume")} icon={null} />
    </div>
  );
}

export default function DCBio({ onService }: { onService: (entryId: string) => void }) {
  return (
    <div className="cx-bio-grid" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 28, maxWidth: "calc(65ch + 28px + 280px)", marginInline: "auto", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--ink)", margin: 0, textWrap: "pretty" } as React.CSSProperties}>
          {PROFILE.intro}
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0, textWrap: "pretty" } as React.CSSProperties}>
          I made my own college major because no existing program connected what I was after —
          the unifying theory across art, media, and interactive experience. That creative
          literacy still shapes how I approach interfaces, systems, and communication.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0, textWrap: "pretty" } as React.CSSProperties}>
          Right now I'm going deep on AI and agentic workflows — not just AI-assisted work,
          but how agentic systems are designed, composed, and deployed. The design choices
          being made right now are shaping the future of human agency, and that's worth
          being serious about.
        </p>
      </div>

      <div className="cx-bio-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="pw-glass-dim" style={{
          padding: 18, borderRadius: 14,
          display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start",
        }}>
          {/* Art-directed profile photo:
              · mobile (≤768px) renders a large full-width square;
              · desktop renders the fixed 280px square.
              Pre-cropped in Cloudinary to exact framing; served with f_auto/q_auto
              for format and quality optimization across viewport sizes. */}
          <ResponsiveCloudinaryPicture
            src={PROFILE.photo}
            alt={PROFILE.name}
            loading="eager"
            transforms={{
              mobile: {
                media: "(max-width: 768px)",
                transform: "f_auto,q_auto,w_{w}",
                widths: [400, 560, 750, 900],
                sizes: "calc(100vw - 76px)",
              },
              desktop: {
                transform: "f_auto,q_auto,w_{w}",
                widths: [280, 420, 560],
                sizes: "280px",
              },
            }}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              objectPosition: "center 5%",
              borderRadius: "40px 8px 40px 8px",
              display: "block",
            }}
          />
          <div style={{ fontSize: 18, fontWeight: 600 }}>{PROFILE.name}</div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.4)", width: "100%" }} />
          <Readout label="Based" value={PROFILE.location} accent="var(--section-deep)" />
          <Readout label="Open to" accent="var(--section-deep)"
            value={
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                {SERVICES.filter((svc) => svc.status === "open").map((svc) => (
                  <CXPill key={svc.id} size="md" onClick={() => onService(svc.id)}>
                    {svc.label}
                  </CXPill>
                ))}
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
