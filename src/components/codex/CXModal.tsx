import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import CXScrollable from "../shared/CXScrollable";
import type { ModalState, Theme } from "../../types";
import { LOG_CAT } from "../../data/content";
import Tap from "../shared/Tap";
import DCProject, { DCProjectSidebar } from "./detail/DCProject";
import DCLog, { DCLogSidebar, extractHeadings } from "./detail/DCLog";
import DCSkillGrid from "./detail/DCSkillGrid";
import DCSeriesList from "./detail/DCSeriesList";
import DCSearch from "./detail/DCSearch";
import DCExperience, { DCExperienceSidebar } from "./detail/DCExperience";
import DCMedia from "./detail/DCMedia";
import { soundClick } from "../../context/SoundContext";
import CXBtn, { RssIcon } from "./CXBtn";
import { PROJECTS, LOGS, EXPERIENCES, slugify, getPrimaryColor } from "../../data/content";
import { contrastText } from "./CXPill";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function getLuminance(hex: string): number {
  const lin = (ch: string) => {
    const n = parseInt(ch, 16) / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(hex.slice(1, 3)) + 0.7152 * lin(hex.slice(3, 5)) + 0.0722 * lin(hex.slice(5, 7));
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const toHex = (n: number) => Math.round(hue2rgb(n) * 255).toString(16).padStart(2, "0");
  return `#${toHex(h / 360 + 1/3)}${toHex(h / 360)}${toHex(h / 360 - 1/3)}`;
}

function toAccessibleText(hex: string, isDark: boolean, minRatio = 4.5): string {
  const bgL = isDark ? 0.04 : 0.72;
  const lCap = isDark ? 0.95 : 0.05;
  let [h, s, l] = hexToHsl(hex);

  const passes = () => {
    const fgL = getLuminance(hslToHex(h, s, l));
    const ratio = bgL > fgL ? (bgL + 0.05) / (fgL + 0.05) : (fgL + 0.05) / (bgL + 0.05);
    return ratio >= minRatio;
  };

  // Phase 1: walk lightness, preserve saturation
  for (let i = 0; i < 60; i++) {
    if (passes()) return hslToHex(h, s, l);
    const next = isDark ? Math.min(lCap, l + 0.02) : Math.max(lCap, l - 0.02);
    if (next === l) break; // hit cap without passing — fall through to phase 2
    l = next;
  }

  // Phase 2: lightness at cap, walk saturation down
  for (let i = 0; i < 50; i++) {
    if (passes()) return hslToHex(h, s, l);
    if (s <= 0) break;
    s = Math.max(0, s - 0.02);
  }

  return hslToHex(h, s, l);
}


function ShareIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );
}

function SharePopover({ shareUrl, title, num, primaryHex, secondaryHex, isDark, hasPrimary }: {
  shareUrl: string; title: string; num: string;
  primaryHex: string; secondaryHex: string; isDark: boolean; hasPrimary: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const copy = () => {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const xUrl  = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
  const rgb   = hexToRgb(primaryHex);

  const popoverStyle: React.CSSProperties = mobile ? {
    position: "fixed", bottom: 64, left: 12, right: 12,
    padding: "16px",
    background: isDark ? "rgba(18, 20, 28, 0.98)" : "rgba(238, 241, 248, 0.98)",
    border: `1px solid rgba(${rgb}, 0.22)`,
    borderRadius: 16,
    boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
    display: "flex", flexDirection: "column", gap: 12,
    zIndex: 200,
    backdropFilter: "blur(16px)",
  } : {
    position: "absolute", bottom: "calc(100% + 10px)", right: 0,
    padding: "14px 16px",
    background: isDark ? "rgba(18, 20, 28, 0.97)" : "rgba(238, 241, 248, 0.97)",
    border: `1px solid rgba(${rgb}, 0.22)`,
    borderRadius: 14,
    boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
    display: "flex", flexDirection: "column", gap: 10,
    minWidth: 284, zIndex: 30,
    backdropFilter: "blur(12px)",
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {open && mobile && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 199 }}
        />
      )}
      {open && (
        <div style={popoverStyle}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: `rgba(${rgb}, 0.06)`,
            border: `1px solid rgba(${rgb}, 0.14)`,
            borderRadius: 8, padding: "8px 10px",
          }}>
            <span className="pw-mono" style={{
              flex: 1, fontSize: 11, color: "var(--ink-mute)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              direction: "rtl", textAlign: "left",
            }}>
              {shareUrl}
            </span>
            <Tap onClick={copy} style={{
              fontSize: 10, letterSpacing: "0.08em", flexShrink: 0,
              padding: "3px 8px", borderRadius: 5,
              fontFamily: "var(--font-mono)",
              color: copied ? primaryHex : "var(--ink-soft)",
              background: copied ? `rgba(${rgb}, 0.15)` : `rgba(${rgb}, 0.08)`,
              transition: "color 0.2s, background 0.2s",
            }}>
              {copied ? "✓ COPIED" : "COPY"}
            </Tap>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ label: "LinkedIn", href: liUrl }, { label: "X / Twitter", href: xUrl }].map(({ label, href }) => (
              <a
                key={label} href={href} target="_blank" rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                style={{
                  flex: 1, textAlign: "center", textDecoration: "none",
                  fontSize: 11, letterSpacing: "0.1em", fontFamily: "var(--font-mono)",
                  padding: mobile ? "10px" : "6px 10px", borderRadius: 8,
                  color: "var(--ink-soft)",
                  background: `rgba(${rgb}, 0.08)`,
                  border: `1px solid rgba(${rgb}, 0.14)`,
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
      <CXBtn
        num={num}
        label="Share"
        primary={!hasPrimary}
        bgHex={hasPrimary ? secondaryHex : primaryHex}
        isDark={isDark}
        icon={<ShareIcon />}
        onClick={() => { soundClick(); setOpen(o => !o); }}
      />
    </div>
  );
}

function ModalFooterButtons({ modal, proj, primaryHex, secondaryHex, isDark, onNavigateToService }: {
  modal: ModalState; proj?: ReturnType<typeof PROJECTS.find>;
  primaryHex: string; secondaryHex: string; isDark: boolean;
  onNavigateToService?: (serviceId: string) => void;
}) {
  if (modal.kind === "search" || modal.kind === "media") return null;

  if (modal.kind === "log") {
    const log = LOGS.find(l => l.id === modal.id);
    const shareUrl = `https://pawper.dev/l/${modal.id}`;
    return (
      <div className="cx-btn-row" style={{ position: "absolute", bottom: 7, right: 24, display: "flex", gap: 8, zIndex: 20, alignItems: "flex-end" }}>
        <SharePopover
          shareUrl={shareUrl}
          title={log?.title ?? ""}
          num="01"
          primaryHex={primaryHex}
          secondaryHex={secondaryHex}
          isDark={isDark}
          hasPrimary={false}
        />
        {log?.devto && <CXBtn num="02" label="Read on Dev.to" href={log.devto} bgHex={secondaryHex} isDark={isDark} />}
      </div>
    );
  }

  if (modal.kind === "experience") {
    return (
      <div className="cx-btn-row" style={{ position: "absolute", bottom: 7, right: 24, display: "flex", gap: 8, zIndex: 20 }}>
        <CXBtn num="01" label="Open to work" primary bgHex={primaryHex} isDark={isDark} icon={null}
          onClick={() => onNavigateToService?.("overview")} />
        <CXBtn num="02" label="Resume" href="/resume" bgHex={secondaryHex} isDark={isDark} />
      </div>
    );
  }

  const rssHref = modal.kind === "series"
    ? `/feed/series/${modal.id}.xml`
    : `/feed/skills/${modal.id.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.xml`;

  const ghHref = modal.filterType === "language"
    ? `https://github.com/search?q=user%3APawper++language%3A${encodeURIComponent(modal.id)}&type=code`
    : `https://github.com/search?q=user%3APawper++topic%3A${encodeURIComponent(modal.id.toLowerCase())}&type=repositories`;

  const skillHasContent = modal.kind === "skill" && (
    PROJECTS.some(p => modal.filterType === "language"
      ? Object.keys(p.languages).some(l => l.toLowerCase() === modal.id.toLowerCase())
      : p.topics.some(t => t.toLowerCase() === modal.id.toLowerCase())
    ) || LOGS.some(a => a.tags?.some(t => t.toLowerCase() === modal.id.toLowerCase()))
  );

  const seriesHasDevto = modal.kind === "series" &&
    LOGS.some(l => l.series && slugify(l.series.name) === modal.id && !!l.devto);
  const seriesName = modal.kind === "series"
    ? ([...new Set(LOGS.filter(a => a.series).map(a => a.series!.name))]
        .find(n => slugify(n) === modal.id) ?? modal.id)
    : "";

  return (
    <div className="cx-btn-row" style={{ position: "absolute", bottom: 7, right: 24, display: "flex", gap: 8, zIndex: 20, alignItems: "flex-end" }}>
      {modal.kind === "project" && proj && (
        <>
          {proj.webURL
            ? <CXBtn num="01" label="Open project" href={proj.webURL} primary bgHex={primaryHex} isDark={isDark} />
            : <CXBtn num="01" label="View source"  href={proj.githubURL} primary bgHex={primaryHex} isDark={isDark} />}
          {proj.webURL && <CXBtn num="02" label="View source" href={proj.githubURL} bgHex={secondaryHex} isDark={isDark} />}
        </>
      )}
      {(modal.kind === "series" || skillHasContent) && (
        <CXBtn num="01" label="RSS feed" href={rssHref} primary bgHex={primaryHex} isDark={isDark} icon={<RssIcon />} />
      )}
      {skillHasContent && (
        <CXBtn num="02" label="Full GH activity" href={ghHref} bgHex={secondaryHex} isDark={isDark} />
      )}
      {modal.kind === "series" && seriesHasDevto && (
        <CXBtn num="02" label="Series on dev.to" href={`https://dev.to/pawper/series/${modal.id}`} bgHex={secondaryHex} isDark={isDark} />
      )}
      {modal.kind === "series" && (
        <SharePopover
          shareUrl={`https://pawper.dev/ls/${modal.id}`}
          title={seriesName}
          num={seriesHasDevto ? "03" : "02"}
          primaryHex={primaryHex}
          secondaryHex={secondaryHex}
          isDark={isDark}
          hasPrimary={true}
        />
      )}
    </div>
  );
}

function ContentModalLayout({ body, sidebar }: { body: React.ReactNode; sidebar: React.ReactNode }) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(0);

  useLayoutEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const check = () => {
      let scroller: Element | null = el.parentElement;
      while (scroller && !scroller.hasAttribute("data-overlayscrollbars-viewport")) {
        scroller = scroller.parentElement;
      }
      const containerH = scroller ? scroller.clientHeight : window.innerHeight;
      // Negative top lets the sidebar scroll up by the overflow amount before sticking,
      // ensuring the TOC at the bottom lands at the viewport's bottom edge when stuck.
      setStickyTop(-Math.max(0, el.scrollHeight - containerH + 14));
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => { ro.disconnect(); window.removeEventListener("resize", check); };
  }, []);

  return (
    <div className="cx-modal-body" style={{ display: "flex", paddingLeft: 17, paddingRight: 30, gap: 12 }}>
      <div className="cx-modal-content" style={{ flex: 1, minWidth: 0, padding: "14px 0 100px" }}>
        {body}
      </div>
      <div
        ref={sidebarRef}
        className="cx-modal-sidebar"
        style={{ width: 230, flexShrink: 0, padding: "14px 0 58px", display: "flex", alignSelf: "flex-start", position: "sticky", top: stickyTop }}
      >
        {sidebar}
      </div>
    </div>
  );
}

interface CXModalProps {
  modal: ModalState;
  previousModal?: ModalState;
  onClose: () => void;
  onBack?: () => void;
  onNavigate: (m: ModalState) => void;
  onSiblingNav: (m: ModalState) => void;
  onPatchModal?: (patch: Partial<ModalState>) => void;
  logsHtml: Record<string, string>;
  theme: Theme;
  onNavigateToCategory?: (catId: string) => void;
  onNavigateToLogCategory?: (catId: string) => void;
  onNavigateToService?: (serviceId: string) => void;
}

export default function CXModal({ modal, previousModal, onClose, onBack, onNavigate, onSiblingNav, onPatchModal, logsHtml, theme, onNavigateToCategory, onNavigateToLogCategory, onNavigateToService }: CXModalProps) {
  function handleBackdropClick() { soundClick(); onBack ? onBack() : onClose(); }

  const skillHasContent = modal.kind === "skill" && (
    PROJECTS.some(p => modal.filterType === "language"
      ? Object.keys(p.languages).some(l => l.toLowerCase() === modal.id.toLowerCase())
      : p.topics.some(t => t.toLowerCase() === modal.id.toLowerCase())
    ) || LOGS.some(a => a.tags?.some(t => t.toLowerCase() === modal.id.toLowerCase()))
  );

  const siblings = modal.siblings ?? [];
  const sibIdx = siblings.findIndex(s => s.kind === modal.kind && s.id === modal.id);
  const prevSib = sibIdx > 0 ? siblings[sibIdx - 1] : null;
  const nextSib = sibIdx >= 0 && sibIdx < siblings.length - 1 ? siblings[sibIdx + 1] : null;

  const slideDir = useRef<"left" | "right" | null>(null);
  const scrollPositions = useRef(new Map<string, number>());
  const currentKey = modal.kind + modal.id;
  const prevKeyRef = useRef(currentKey);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);
  const scrollElRef = useRef<HTMLElement | null>(null);
  const scrollRoRef = useRef<ResizeObserver | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setIsScrollable(false);
  }, [modal.kind, modal.id]);

  useEffect(() => {
    if (modal.kind === "search") searchInputRef.current?.focus();
  }, [modal.kind]);

  function goSibling(sib: typeof siblings[number], dir: "left" | "right") {
    slideDir.current = dir;
    soundClick();
    onSiblingNav({ kind: sib.kind, id: sib.id, label: sib.label, siblings });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft"  && prevSib) { e.preventDefault(); goSibling(prevSib, "left"); }
      if (e.key === "ArrowRight" && nextSib) { e.preventDefault(); goSibling(nextSib, "right"); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevSib, nextSib]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx > 0 && prevSib) goSibling(prevSib, "left");
    if (dx < 0 && nextSib) goSibling(nextSib, "right");
  }

  const _proj = modal.kind === "project" ? PROJECTS.find(p => p.id === modal.id) : undefined;
  const _langs = _proj ? Object.values(_proj.languages) : [];
  const _topLangColor = _langs[0]?.color ?? "#2b8bff";
  const primaryColor   = modal.kind === "project"    ? (_proj ? getPrimaryColor(_proj) : "#2b8bff")
                       : modal.kind === "skill"      ? (modal.filterType === "language" && modal.color ? modal.color : "#c8d4e4")
                       : modal.kind === "search"     ? "#c8d4e4"
                       : modal.kind === "experience" ? "#e84455"
                       : modal.kind === "media"      ? LOG_CAT.accent
                       : LOG_CAT.accent;
  const secondaryColor = modal.kind === "project"
    ? (primaryColor !== _topLangColor ? _topLangColor : (_langs[1]?.color ?? primaryColor))
    : primaryColor;

  return (
    <div
      onClick={handleBackdropClick}
      className="cx-modal-backdrop"
      style={{
        position: "absolute", inset: 0, zIndex: 100, padding: 40,
        background: "rgba(8, 16, 28, 0.55)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 980, maxHeight: "100%", height: modal.kind === "media" ? "100%" : undefined, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}
      >
        {/* Lightbox prev/next arrows — just outside the modal edges */}
        {prevSib && (
          <Tap
            onClick={() => goSibling(prevSib, "left")}
            className="cx-nav-arrow"
            style={{
              position: "absolute", left: -56, top: "50%", transform: "translateY(-50%)",
              width: 44, height: 44, borderRadius: "50%", zIndex: 110,
              border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polyline points="11,4 6,9 11,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Tap>
        )}
        {nextSib && (
          <Tap
            onClick={() => goSibling(nextSib, "right")}
            className="cx-nav-arrow"
            style={{
              position: "absolute", right: -56, top: "50%", transform: "translateY(-50%)",
              width: 44, height: 44, borderRadius: "50%", zIndex: 110,
              border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <polyline points="7,4 12,9 7,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Tap>
        )}
      <div
        key={modal.kind + modal.id}
        className="pw-glass-hi pw-lcars-tr"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%", flex: 1, minHeight: 0,
          borderRadius: "8px 56px 8px 56px",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: `${slideDir.current === "right" ? "pw-slide-from-right" : slideDir.current === "left" ? "pw-slide-from-left" : "pw-page-in"} .25s cubic-bezier(.2,.7,.3,1) both`,
          position: "relative",
          "--lcars-color": hexToRgba(primaryColor, 0.75),
          "--lcars-color-soft": hexToRgba(secondaryColor, 0.55),
          "--acc-blue-deep": toAccessibleText(primaryColor, theme === "dark"),
          "--section-deep": toAccessibleText(primaryColor, theme === "dark"),
          "--section-accent": primaryColor,
          "--section-rgb": hexToRgb(primaryColor),
          "--section-accent-2": secondaryColor,
          "--section-rgb-2": hexToRgb(secondaryColor),
          "--lcars-l": "31px",
        } as React.CSSProperties}
      >
        {/* Close / back button at left end of LCARS bar */}
        <Tap
          onClick={onBack ?? onClose}
          className="cx-modal-close"
          style={{
            position: "absolute", top: 8, left: 8,
            width: 20, height: 18, borderRadius: "4px 4px 0 0",
            background: hexToRgba(primaryColor, 0.75),
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: onBack ? 8 : 15, lineHeight: 1, color: contrastText(primaryColor), fontWeight: 700,
            zIndex: 10, flexShrink: 0,
          }}
        >
          {onBack ? "◀" : "×"}
        </Tap>
        {/* Labels sit on top of the hard LCARS bar */}
        <div style={{
          position: "absolute", top: 8, left: 40, right: 36, height: 18,
          display: "flex", alignItems: "center", gap: 10, zIndex: 10,
          pointerEvents: "none", overflow: "hidden",
        }}>
          <span className="pw-mono cx-modal-kind-label" style={{ fontSize: 10, letterSpacing: "0.22em", fontWeight: 700, color: contrastText(primaryColor), flexShrink: 0 }}>
            {modal.kind === "project" ? "CASE-FILE" : modal.kind === "skill" ? "SKILL INDEX" : modal.kind === "series" ? "SERIES LOG" : modal.kind === "search" ? "SEARCH" : modal.kind === "experience" ? "EXPERIENCE" : modal.kind === "media" ? "MEDIA" : "LOG ENTRY"}
          </span>
          <span className="pw-mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: contrastText(primaryColor), opacity: 0.6, textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", minWidth: 0 }}>
            <span className="cx-modal-kind-label">· </span>{modal.kind === "skill"   ? modal.id
              : modal.kind === "project" ? (PROJECTS.find(p => p.id === modal.id)?.description ?? modal.id)
              : modal.kind === "series"  ? ([...new Set(LOGS.filter(a => a.series).map(a => a.series!.name))].find(n => slugify(n) === modal.id) ?? modal.id)
              : modal.kind === "search"     ? `${PROJECTS.length + LOGS.length + EXPERIENCES.length} entries indexed`
              : modal.kind === "experience" ? (EXPERIENCES.find(e => e.id === modal.id)?.organization ?? modal.id)
              : modal.kind === "media"      ? (modal.label || "image")
              : (LOGS.find(a => a.id === modal.id)?.title ?? modal.id)}
          </span>
        </div>
        {/* Spacer pushes content below both LCARS arcs (soft arc bottom = top:29 + border:10 = 39px) */}
        <div style={{ height: 40, flexShrink: 0 }} />
        <ModalFooterButtons modal={modal} proj={_proj} primaryHex={primaryColor} secondaryHex={secondaryColor} isDark={theme === "dark"} onNavigateToService={onNavigateToService} />
        <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>
          {modal.kind === "media" && <DCMedia src={modal.id} alt={modal.label} />}
          {modal.kind === "search" && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 34px 12px 17px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(var(--section-rgb), 0.08)",
                border: "1.5px solid rgba(var(--section-rgb), 0.3)",
                borderRadius: 10, padding: "10px 16px",
              }}>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="var(--section-accent)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <circle cx="7.5" cy="7.5" r="5.5"/><line x1="11.5" y1="11.5" x2="16" y2="16"/>
                </svg>
                <input
                  ref={searchInputRef}
                  value={modal.query ?? ""}
                  onChange={(e) => onPatchModal?.({ query: e.target.value })}
                  placeholder="Search projects and logs…"
                  className="cx-search-input"
                  style={{
                    flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
                    appearance: "none", WebkitAppearance: "none",
                    fontSize: 15, fontWeight: 400, letterSpacing: -0.2,
                    color: "var(--ink)", fontFamily: "var(--font-sans)",
                  }}
                />
                {modal.query && (
                  <span
                    onClick={() => onPatchModal?.({ query: "" })}
                    style={{ fontSize: 16, color: "var(--ink-mute)", lineHeight: 1, cursor: "pointer" }}
                  >×</span>
                )}
              </div>
            </div>
          )}
          {modal.kind !== "media" && (() => {
            const noFade = modal.kind === "skill" && !skillHasContent && !isScrollable;
            const skillPadBottom = noFade ? "24px" : "100px";
            const scrollMask = modal.kind === "search"
              ? (modal.query?.trim()
                ? "linear-gradient(to bottom, transparent 60px, black 80px, black calc(100% - 120px), transparent calc(100% - 20px))"
                : "linear-gradient(to bottom, transparent 60px, black 80px)")
              : noFade
                ? "black"
                : "linear-gradient(to bottom, black 0%, black calc(100% - 120px), transparent calc(100% - 20px))";
            return (
          <CXScrollable
            style={{ flex: 1, "--scroll-mask": scrollMask } as React.CSSProperties}
            onScroll={(scrollTop) => { scrollPositions.current.set(prevKeyRef.current, scrollTop); }}
            onInitialized={(el) => {
              prevKeyRef.current = currentKey;
              const pos = scrollPositions.current.get(currentKey) ?? 0;
              if (pos > 0) setTimeout(() => { el.scrollTop = pos; }, 0);
              scrollElRef.current = el;
              scrollRoRef.current?.disconnect();
              const ro = new ResizeObserver(() => setIsScrollable(el.scrollHeight > el.clientHeight));
              ro.observe(el);
              scrollRoRef.current = ro;
              setIsScrollable(el.scrollHeight > el.clientHeight);
            }}
          >
          {modal.kind === "project" && (
            <ContentModalLayout
              body={<DCProject id={modal.id} />}
              sidebar={
                <DCProjectSidebar
                  id={modal.id}
                  onOpenSkill={(tag) => onNavigate({ kind: "skill", id: tag, filterType: "topic" })}
                  onOpenLanguage={(lang, color) => onNavigate({ kind: "skill", id: lang, color, filterType: "language" })}
                  onNavigateToCategory={onNavigateToCategory}
                />
              }
            />
          )}
          {modal.kind === "log" && (
            <ContentModalLayout
              body={
                <DCLog id={modal.id} html={logsHtml[modal.id] ?? ''} onOpenMedia={(src, alt, siblings) => onNavigate({ kind: "media", id: src, label: alt, siblings })} onOpenLog={(targetId) => {
                    const target = LOGS.find(a => a.id === targetId);
                    const sibs = target?.series
                      ? LOGS.filter(a => a.series?.name === target.series?.name)
                          .sort((a, b) => a.series!.part - b.series!.part)
                          .map(a => ({ kind: "log" as const, id: a.id }))
                      : [];
                    onNavigate({ kind: "log", id: targetId, siblings: sibs });
                  }} onOpenProject={(projectId) => {
                    onNavigate({ kind: "project", id: projectId });
                  }} onOpenSeries={(slug) => {
                    onNavigate({ kind: "series", id: slug });
                  }} onOpenService={onNavigateToService} />
              }
              sidebar={
                <DCLogSidebar
                  id={modal.id}
                  headings={extractHeadings(logsHtml[modal.id] ?? '')}
                  onNavigateToCategory={onNavigateToLogCategory}
                  onOpenSkill={(tag) => {
                    const langEntry = PROJECTS.flatMap(p => Object.entries(p.languages)).find(([l]) => l.toLowerCase() === tag.toLowerCase());
                    onNavigate(langEntry
                      ? { kind: "skill", id: langEntry[0], color: langEntry[1].color, filterType: "language" }
                      : { kind: "skill", id: tag, filterType: "topic" });
                  }}
                  onOpenLog={(targetId) => {
                    const target = LOGS.find(a => a.id === targetId);
                    const currentPart = LOGS.find(a => a.id === modal.id)?.series?.part ?? 0;
                    slideDir.current = (target?.series?.part ?? 0) > currentPart ? "right" : "left";
                    const sibs = target?.series
                      ? LOGS.filter(a => a.series?.name === target.series?.name)
                          .sort((a, b) => a.series!.part - b.series!.part)
                          .map(a => ({ kind: "log" as const, id: a.id }))
                      : [];
                    onSiblingNav({ kind: "log", id: targetId, siblings: sibs });
                  }}
                  onOpenSeries={(slug) => {
                    if (onBack && previousModal?.kind === "series" && previousModal.id === slug) {
                      onBack();
                    } else {
                      onNavigate({ kind: "series", id: slug });
                    }
                  }}
                />
              }
            />
          )}
          {modal.kind === "experience" && (
            <ContentModalLayout
              body={<DCExperience id={modal.id} openModal={onNavigate} />}
              sidebar={
                <DCExperienceSidebar
                  id={modal.id}
                  onOpen={(id, color, filterType) => onNavigate({ kind: "skill", id, color, filterType })}
                />
              }
            />
          )}
          {(modal.kind === "skill" || modal.kind === "series" || modal.kind === "search") && (
            <div className="cx-modal-body" style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: modal.kind === "search" ? 0 : modal.kind === "skill" ? `14px 34px ${skillPadBottom} 17px` : "14px 34px 100px 17px" }}>
                {modal.kind === "skill"  && <DCSkillGrid tag={modal.id} filterType={modal.filterType} onOpen={(kind, id, sibs) => onNavigate({ kind, id, siblings: sibs })} onOpenExperience={(id) => onNavigate({ kind: "experience", id })} onOpenSkill={(id, filterType, color) => onNavigate({ kind: "skill", id, filterType, color })} onNavigateToService={onNavigateToService} />}
                {modal.kind === "series" && <DCSeriesList seriesSlug={modal.id} onOpenLog={(id, sibs) => onNavigate({ kind: "log", id, siblings: sibs })} />}
                {modal.kind === "search" && <DCSearch query={modal.query ?? ""} logsHtml={logsHtml} onOpen={(kind, id, sibs) => onNavigate({ kind, id, siblings: sibs })} onOpenSkill={(id, filterType, color) => onNavigate({ kind: "skill", id, filterType, color })} />}
              </div>
            </div>
          )}
          </CXScrollable>
          );
          })()}
        </div>
      </div>
      <span
        className="pw-mono cx-esc-hint"
        style={{ alignSelf: "flex-end", fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)" }}
      >
        ESC TO CLOSE PANELS
      </span>
      </div>
    </div>
  );
}
