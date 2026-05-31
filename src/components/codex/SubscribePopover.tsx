import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Tap from "../shared/Tap";
import { soundClick, soundHover } from "../../context/SoundContext";
import CXBtn, { RssIcon } from "./CXBtn";

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function SubscribePopover({
  rssUrl,
  devtoUrl,
  title,
  num,
  primaryHex,
  secondaryHex,
  isDark,
  hasPrimary,
}: {
  rssUrl: string;
  devtoUrl: string;
  title: string;
  num: string;
  primaryHex: string;
  secondaryHex: string;
  isDark: boolean;
  hasPrimary: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [fixedPos, setFixedPos] = useState<{ bottom: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!open) return;
    // Close on click outside both the trigger and the portal
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !portalRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    // Recompute position on resize
    const updatePos = () => {
      if (!mobile && ref.current) {
        const r = ref.current.getBoundingClientRect();
        setFixedPos({ bottom: window.innerHeight - r.top + 10, right: window.innerWidth - r.right });
      }
    };
    window.addEventListener("resize", updatePos);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, mobile]);

  const copy = () => {
    navigator.clipboard.writeText(rssUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = () => {
    soundClick();
    if (!open && !mobile && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setFixedPos({ bottom: window.innerHeight - r.top + 10, right: window.innerWidth - r.right });
    }
    setOpen((o) => !o);
  };

  const rgb = hexToRgb(primaryHex);

  const popoverContent = (isMobile: boolean) => (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: isDark ? "rgba(255,255,255,0.07)" : `rgba(${rgb}, 0.06)`,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.13)" : `rgba(${rgb}, 0.14)`}`,
          borderRadius: 8,
          padding: "8px 10px",
        }}
      >
        <span
          className="pw-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            fontWeight: 700,
            textTransform: "uppercase",
            flexShrink: 0,
            color: isDark ? "rgba(255,255,255,0.6)" : "var(--ink-mute)",
          }}
        >
          RSS
        </span>
        <span
          className="pw-mono"
          style={{
            flex: 1,
            fontSize: 11,
            color: isDark ? "rgba(255,255,255,0.55)" : "var(--ink-mute)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            direction: "rtl",
            textAlign: "left",
          }}
        >
          {rssUrl}
        </span>
        <Tap
          onClick={copy}
          onMouseEnter={(e) => {
            soundHover();
            if (!copied) {
              const el = e.currentTarget as HTMLElement;
              el.style.background = `rgba(${rgb}, 0.18)`;
              el.style.color = isDark ? "rgba(255,255,255,0.9)" : "var(--ink)";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              const el = e.currentTarget as HTMLElement;
              el.style.background = `rgba(${rgb}, 0.08)`;
              el.style.color = isDark ? "rgba(255,255,255,0.6)" : "var(--ink-soft)";
            }
          }}
          style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            flexShrink: 0,
            padding: "3px 8px",
            borderRadius: 5,
            fontFamily: "var(--font-mono)",
            color: copied ? primaryHex : isDark ? "rgba(255,255,255,0.6)" : "var(--ink-soft)",
            background: copied ? `rgba(${rgb}, 0.15)` : `rgba(${rgb}, 0.08)`,
            transition: "color 0.2s, background 0.2s",
          }}
        >
          {copied ? "✓ COPIED" : "COPY"}
        </Tap>
      </div>

      <div style={{ display: "flex", gap: 8, flexDirection: isMobile ? "column" : "row" }}>
        {[
          { label: "Dev.to", href: devtoUrl },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              soundClick();
              setOpen(false);
            }}
            onMouseEnter={(e) => {
              soundHover();
              const el = e.currentTarget;
              el.style.background = `rgba(${rgb}, 0.18)`;
              el.style.color = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = `rgba(${rgb}, 0.08)`;
              el.style.color = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.65)";
            }}
            style={{
              flex: 1,
              textAlign: "center",
              textDecoration: "none",
              fontSize: 11,
              letterSpacing: "0.1em",
              fontFamily: "var(--font-mono)",
              padding: isMobile ? "10px" : "6px 10px",
              borderRadius: 8,
              cursor: "pointer",
              userSelect: "none",
              color: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.65)",
              background: `rgba(${rgb}, 0.08)`,
              border: `1px solid rgba(${rgb}, 0.14)`,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </>
  );

  // Desktop: portal to document.body so position:fixed escapes backdrop-filter containing block
  const desktopPortal =
    mounted && open && !mobile && fixedPos
      ? createPortal(
          <div
            ref={portalRef}
            style={{
              position: "fixed",
              bottom: fixedPos.bottom,
              right: fixedPos.right,
              padding: "14px 16px",
              background: isDark ? "rgba(18, 20, 28, 0.97)" : "rgba(238, 241, 248, 0.97)",
              border: `1px solid rgba(${rgb}, 0.22)`,
              borderRadius: 14,
              boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minWidth: 284,
              zIndex: 9999,
              backdropFilter: "blur(12px)",
            }}
          >
            {popoverContent(false)}
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Mobile sheet */}
      {open && mobile && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />}
      {open && mobile && (
        <div
          style={{
            position: "fixed",
            bottom: 64,
            left: 12,
            right: 12,
            padding: "16px",
            background: isDark ? "rgba(18, 20, 28, 0.98)" : "rgba(238, 241, 248, 0.98)",
            border: `1px solid rgba(${rgb}, 0.22)`,
            borderRadius: 16,
            boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            zIndex: 200,
            backdropFilter: "blur(16px)",
          }}
        >
          {popoverContent(true)}
        </div>
      )}
      {desktopPortal}
      <CXBtn
        num={num}
        label="Subscribe"
        primary={!hasPrimary}
        bgHex={hasPrimary ? secondaryHex : primaryHex}
        isDark={isDark}
        onClick={handleToggle}
        icon={<RssIcon />}
      />
    </div>
  );
}
