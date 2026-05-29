import React, { useEffect, useRef, useState } from "react";
import { SERVICES } from "../../data/content";
import FormField from "../shared/FormField";
import Readout from "../shared/Readout";
import Tap from "../shared/Tap";
import CXCard from "./CXCard";
import CXPill from "./CXPill";
import { useTheme } from "../../hooks/useTheme";
import { soundClick, soundHover } from "../../context/SoundContext";
import { clampEyebrowColor } from "../../utils/color";

const directory = [
  { l: "Email",    v: "hello@pawper.dev",          href: "mailto:hello@pawper.dev" },
  { l: "GitHub",   v: "github.com/Pawper",          href: "https://github.com/Pawper" },
  { l: "LinkedIn", v: "linkedin.com/in/pawper",     href: "https://linkedin.com/in/pawper" },
  { l: "dev.to",   v: "dev.to/pawper",              href: "https://dev.to/pawper" },
  { l: "Ko-fi",    v: "ko-fi.com/pawper",           href: "https://ko-fi.com/pawper" },
  { l: "RSS",      v: "pawper.dev/feed.xml",        href: "https://pawper.dev/feed.xml" },
];

interface CXContactComboProps {
  onSent: () => void;
  onService: (entryId: string) => void;
  onMessageChange: (hasMessage: boolean) => void;
}

export function CXContactFooter({ sent, hasMessage }: { sent: boolean; hasMessage: boolean }) {
  if (!hasMessage && !sent) return null;
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

export default function CXContactCombo({ onSent, onService, onMessageChange }: CXContactComboProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);
  const [prefill, setPrefill] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const vals: Record<string, string> = {};
    for (const key of ["name", "email", "subject", "message"]) {
      const v = p.get(key);
      if (v) vals[key] = v;
    }
    if (Object.keys(vals).length) setPrefill(vals);
  }, []);
  const theme = useTheme();
  const eyebrowColor = clampEyebrowColor(theme === "dark" ? "#a07e15" : "#6b5410", theme === "dark");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    const data = new FormData(formRef.current!);
    const body = new URLSearchParams({
      "form-name": "contact",
      name:    data.get("name")    as string,
      email:   data.get("email")   as string,
      subject: data.get("subject") as string,
      message: data.get("message") as string,
    });
    try {
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
      if (res.ok) { formRef.current?.reset(); setSent(true); onSent(); } else { setError(true); }
    } catch { setError(true); }
  }

  return (
    <div className="cx-contact-main-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 28 }}>
      <form
        ref={formRef}
        id="contact-form"
        name="contact"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input type="hidden" name="form-name" value="contact" />
        <FormField name="name"    label="Identifier"    placeholder="Your name"              defaultValue={prefill.name} />
        <FormField name="email"   label="Return address" placeholder="you@somewhere.dev"      defaultValue={prefill.email} />
        <FormField name="subject" label="Subject"        placeholder="What's on your mind?"   defaultValue={prefill.subject} />
        <FormField name="message" label="Transmission"   placeholder="A few sentences is plenty…" multiline defaultValue={prefill.message} onChange={(v) => onMessageChange(v.trim().length > 0)} />
        {sent && <span className="pw-mono" style={{ fontSize: 11, color: "#4caf82", letterSpacing: "0.1em" }}>MESSAGE TRANSMITTED · THANK YOU</span>}
        {error && <span className="pw-mono" style={{ fontSize: 11, color: "var(--color-error, #e05c5c)", letterSpacing: "0.1em" }}>TRANSMISSION FAILED · TRY AGAIN</span>}
        <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.16em", marginTop: 4 }}>
          SENT SECURELY · HTTPS
        </span>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="pw-glass-dim" style={{ padding: 18, borderRadius: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <Readout label="Timezone" value="UTC−07 · PDT"  accent={eyebrowColor} />
          <Readout label="Response" value="< 48 hours"    accent={eyebrowColor} />
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
            accent={eyebrowColor}
          />
        </div>
        <div className="pw-eyebrow" style={{ marginTop: 6, color: eyebrowColor }}>Directory</div>
        <div className="cx-contact-dir-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {directory.map((item) => (
            <a key={item.l} href={item.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }} onClick={soundClick} onMouseEnter={soundHover}>
              <CXCard
                className="cx-card"
                style={{ padding: "12px 14px", borderRadius: 10, display: "flex", flexDirection: "column", gap: 2, cursor: "pointer", height: "100%" }}
              >
                <span className="pw-eyebrow" style={{ color: eyebrowColor }}>{item.l}</span>
                <span className="pw-mono" style={{ fontSize: 13, color: "var(--ink)" }}>{item.v}</span>
              </CXCard>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
