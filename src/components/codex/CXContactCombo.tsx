import React from "react";
import { SERVICES } from "../../data/content";
import FormField from "../shared/FormField";
import Readout from "../shared/Readout";
import Tap from "../shared/Tap";
import CXCard from "./CXCard";
import CXPill from "./CXPill";

const directory = [
  { l: "Email",    v: "hello@pawper.dev" },
  { l: "GitHub",   v: "github.com/Pawper" },
  { l: "LinkedIn", v: "linkedin.com/in/pawper" },
  { l: "RSS",      v: "pawper.dev/feed.xml" },
];

interface CXContactComboProps {
  onSent: () => void;
  onService: (entryId: string) => void;
}

export function CXContactFooter({ sent }: { sent: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Tap as="button" type="submit" form="contact-form" className="cx-proj-btn"
        style={{ display: "flex", alignItems: "center", gap: 1, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
        <span className="cx-btn-num" style={{
          fontFamily: "'Bebas Neue', var(--font-sans)", fontSize: 40, lineHeight: 1,
          color: "#f5c130", minWidth: 28,
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          transform: "translateY(3px) scaleY(1.25)", transformOrigin: "center",
        } as React.CSSProperties}>01</span>
        <div className="cx-btn-inner" style={{
          width: 200, borderRadius: 1, padding: "10px 14px", color: "rgba(0,0,0,0.8)",
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", background: "#f5c130",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {sent ? <><span>Transmitted</span><span>✓</span></> : <><span>Transmit message</span><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="cx-btn-icon" style={{ flexShrink: 0 }}><path d="M6 1L10 5H7.5V9H4.5V5H2L6 1Z" /><rect x="1" y="10" width="10" height="1.5" rx="0.5" /></svg></>}
        </div>
      </Tap>
    </div>
  );
}

export default function CXContactCombo({ onSent, onService }: CXContactComboProps) {
  return (
    <div className="cx-contact-main-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28 }}>
      <form
        id="contact-form"
        onSubmit={(e) => { e.preventDefault(); onSent(); }}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink-soft)", margin: 0, textWrap: "pretty" } as React.CSSProperties}>
          The fastest way to reach me is email — read within 48 hours,
          replied to within 72. I can take on one freelance client at a time,
          and currently have one slot open.
        </p>
        <FormField label="Identifier"    placeholder="Your name" />
        <FormField label="Return address" placeholder="you@somewhere.dev" />
        <FormField label="Subject"       placeholder="What's on your mind?" />
        <FormField label="Transmission"  placeholder="A few sentences is plenty…" multiline />
        <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.16em", marginTop: 4 }}>
          ENCRYPTED · END-TO-END
        </span>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="pw-glass-dim" style={{ padding: 18, borderRadius: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <Readout label="Timezone" value="UTC−07 · PDT"  accent="#a07e15" />
          <Readout label="Response" value="< 48 hours"    accent="#a07e15" />
          <Readout
            label="Open to"
            value={
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                {SERVICES.filter((svc) => svc.status === "open").map((svc) => (
                  <CXPill key={svc.id} size="md" onClick={() => onService(svc.id)}>
                    {svc.label}
                  </CXPill>
                ))}
              </div>
            }
            accent="#a07e15"
          />
        </div>
        <div className="pw-eyebrow" style={{ marginTop: 6, color: "#a07e15" }}>Directory</div>
        <div className="cx-contact-dir-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {directory.map((item) => (
            <CXCard
              key={item.l}
              style={{ padding: "12px 14px", borderRadius: 10, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <span className="pw-eyebrow" style={{ color: "#a07e15" }}>{item.l}</span>
              <span className="pw-mono" style={{ fontSize: 13, color: "var(--ink)" }}>{item.v}</span>
            </CXCard>
          ))}
        </div>
      </div>
    </div>
  );
}
