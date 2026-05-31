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

const RECAPTCHA_SITE_KEY = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY as string | undefined;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

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

  // Load the reCAPTCHA v3 script once (no-op without a configured site key).
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    if (document.querySelector("script[data-recaptcha]")) return;
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true;
    s.defer = true;
    s.setAttribute("data-recaptcha", "true");
    document.head.appendChild(s);
  }, []);

  // Hide the reCAPTCHA badge when modals, popovers, menu, or expanded header are open.
  // Also hide when leaving the contact page (contact form is not in the DOM).
  // On desktop, position it under the contact form.
  useEffect(() => {
    const checkAndHideBadge = () => {
      const badge = document.querySelector(".grecaptcha-badge") as any;
      if (!badge) return;

      // If the contact form doesn't exist, we've left the contact page — hide the badge
      const form = document.querySelector("#contact-form") as HTMLElement;
      if (!form) {
        badge.style.visibility = "hidden";
        return;
      }

      // Check for main modal backdrop
      const hasModalBackdrop = !!document.querySelector(".cx-modal-backdrop");

      // Check for share popover (QR code image appears when share popover is open on any screen size)
      const hasSharePopover = !!document.querySelector("img[alt='QR code']");

      // Check for mobile menu: look for fixed-position overlay (z-index 199) that's a direct child of .pw-artboard
      let hasMobileMenu = false;
      const artboard = document.querySelector(".pw-artboard");
      if (artboard) {
        const fixedChildren = Array.from(artboard.children).filter(el => {
          const style = window.getComputedStyle(el as Element);
          return style.position === "fixed" && parseInt(style.zIndex || "0") === 199;
        });
        hasMobileMenu = fixedChildren.length > 0;
      }

      // Check for expanded header (adds cx-layout-brief-open class to main grid)
      const hasExpandedHeader = !!document.querySelector(".cx-layout-brief-open");

      if (hasModalBackdrop || hasSharePopover || hasMobileMenu || hasExpandedHeader) {
        badge.style.visibility = "hidden";
      } else {
        badge.style.visibility = "visible";
      }

      // On desktop, position badge under the contact form
      if (window.innerWidth >= 1200) {
        const form = document.querySelector("#contact-form") as HTMLElement;
        if (form) {
          const formRect = form.getBoundingClientRect();
          const formBottom = formRect.bottom + window.scrollY;

          // Find the first input/textarea field to align with its left edge
          const firstInput = form.querySelector("input[type='text'], textarea") as HTMLElement;
          let fieldLeft = formRect.left + window.scrollX;
          if (firstInput) {
            const inputRect = firstInput.getBoundingClientRect();
            fieldLeft = inputRect.left + window.scrollX - 63;
          }

          badge.style.position = "absolute";
          badge.style.top = formBottom - 41 + "px";
          badge.style.left = fieldLeft + "px";
          badge.style.right = "auto";
          badge.style.bottom = "auto";
        }
      } else {
        // Reset to fixed positioning on mobile
        badge.style.position = "fixed";
        badge.style.top = "auto";
        badge.style.left = "40px";
        badge.style.right = "auto";
        badge.style.bottom = "47px";
      }
    };

    // Check every 100ms
    const interval = setInterval(checkAndHideBadge, 100);

    // On unmount (e.g. navigating away from the contact page) the interval above
    // stops running, so the in-loop "form gone → hide" guard never fires. Hide the
    // badge here too, otherwise it lingers visible over whatever page we land on.
    return () => {
      clearInterval(interval);
      const badge = document.querySelector<HTMLElement>(".grecaptcha-badge");
      if (badge) badge.style.visibility = "hidden";
    };
  }, []);
  const theme = useTheme();
  const eyebrowColor = clampEyebrowColor(theme === "dark" ? "#a07e15" : "#6b5410", theme === "dark");

  // Reflect the site's current theme onto the reCAPTCHA badge so it blends with
  // light/dark. Re-runs whenever `theme` changes (useTheme is reactive), and waits
  // for Google's script to inject the badge before tagging it. The actual recolor
  // lives in global.css keyed off this attribute (`.grecaptcha-badge[data-theme]`)
  // so there's a single source of truth — no inline-vs-`!important` conflict.
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    const applyTheme = () => {
      const badge = document.querySelector<HTMLElement>(".grecaptcha-badge");
      if (!badge) return false;
      badge.setAttribute("data-theme", theme);
      return true;
    };

    if (applyTheme()) return;
    // Badge is injected asynchronously — watch the body until it appears.
    const obs = new MutationObserver(() => {
      if (applyTheme()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [theme]);

  async function getRecaptchaToken(): Promise<string | undefined> {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) return undefined;
    const grecaptcha = window.grecaptcha;
    await new Promise<void>((resolve) => grecaptcha.ready(() => resolve()));
    return grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    const data = new FormData(formRef.current!);
    try {
      const token = await getRecaptchaToken();
      const res = await fetch("/.netlify/functions/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    data.get("name")    as string,
          email:   data.get("email")   as string,
          subject: data.get("subject") as string,
          message: data.get("message") as string,
          "bot-field": (data.get("bot-field") as string) ?? "",
          token,
        }),
      });
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
        {/* Honeypot: hidden from real users, tempting to bots. Filled = spam. */}
        <p style={{ display: "none" }} aria-hidden="true">
          <label>
            Leave this field empty
            <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>
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
