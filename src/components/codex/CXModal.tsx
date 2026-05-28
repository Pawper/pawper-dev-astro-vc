import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import { soundClick, soundHover } from "../../context/SoundContext";
import CXBtn, { RssIcon } from "./CXBtn";
import { PROJECTS, LOGS, EXPERIENCES, AGENDA_EVENTS, SERVICES, slugify, getPrimaryColor } from "../../data/content";
import type { Experience } from "../../data/content";
import { isServiceCategory } from "./detail/ExperienceCardRow";
import { isEventPast } from "../../utils/date";
import { useNow } from "../../hooks/useNow";
import { contrastText } from "./CXPill";
import { getProgress } from "../../utils/logProgress";
import devtoSeriesRaw from "../../data/devto-series.json";

const DEVTO_SERIES = devtoSeriesRaw as Record<string, number>;

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

export function SharePopover({ shareUrl, title, num, primaryHex, secondaryHex, isDark, hasPrimary }: {
  shareUrl: string; title: string; num: string;
  primaryHex: string; secondaryHex: string; isDark: boolean; hasPrimary: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [fixedPos, setFixedPos] = useState<{ bottom: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

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
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = () => {
    soundClick();
    if (!open && !mobile && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setFixedPos({ bottom: window.innerHeight - r.top + 10, right: window.innerWidth - r.right });
    }
    setOpen(o => !o);
  };

  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const xUrl  = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
  const rgb   = hexToRgb(primaryHex);

  const popoverContent = (isMobile: boolean) => (
    <>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shareUrl)}&bgcolor=${isDark ? "12141c" : "eef1f8"}&color=${primaryHex.replace("#", "")}&qzone=1&format=svg`}
        alt="QR code"
        style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }}
      />
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: isDark ? "rgba(255,255,255,0.07)" : `rgba(${rgb}, 0.06)`,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.13)" : `rgba(${rgb}, 0.14)`}`,
        borderRadius: 8, padding: "8px 10px",
      }}>
        <span className="pw-mono" style={{
          flex: 1, fontSize: 11,
          color: isDark ? "rgba(255,255,255,0.55)" : "var(--ink-mute)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          direction: "rtl", textAlign: "left",
        }}>
          {shareUrl}
        </span>
        <Tap onClick={copy}
          onMouseEnter={e => {
            soundHover();
            if (!copied) {
              const el = e.currentTarget as HTMLElement;
              el.style.background = `rgba(${rgb}, 0.18)`;
              el.style.color = isDark ? "rgba(255,255,255,0.9)" : "var(--ink)";
            }
          }}
          onMouseLeave={e => {
            if (!copied) {
              const el = e.currentTarget as HTMLElement;
              el.style.background = `rgba(${rgb}, 0.08)`;
              el.style.color = isDark ? "rgba(255,255,255,0.6)" : "var(--ink-soft)";
            }
          }}
          style={{
            fontSize: 10, letterSpacing: "0.08em", flexShrink: 0,
            padding: "3px 8px", borderRadius: 5, fontFamily: "var(--font-mono)",
            color: copied ? primaryHex : isDark ? "rgba(255,255,255,0.6)" : "var(--ink-soft)",
            background: copied ? `rgba(${rgb}, 0.15)` : `rgba(${rgb}, 0.08)`,
            transition: "color 0.2s, background 0.2s",
          }}>
          {copied ? "✓ COPIED" : "COPY"}
        </Tap>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[{ label: "LinkedIn", href: liUrl }, { label: "X / Twitter", href: xUrl }].map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            onClick={(e) => { e.stopPropagation(); soundClick(); setOpen(false); }}
            onMouseEnter={e => {
              soundHover();
              const el = e.currentTarget;
              el.style.background = `rgba(${rgb}, 0.18)`;
              el.style.color = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.background = `rgba(${rgb}, 0.08)`;
              el.style.color = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.65)";
            }}
            style={{
              flex: 1, textAlign: "center", textDecoration: "none",
              fontSize: 11, letterSpacing: "0.1em", fontFamily: "var(--font-mono)",
              padding: isMobile ? "10px" : "6px 10px", borderRadius: 8,
              cursor: "pointer", userSelect: "none",
              color: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.65)",
              background: `rgba(${rgb}, 0.08)`,
              border: `1px solid rgba(${rgb}, 0.14)`,
              transition: "background 0.15s, color 0.15s",
            }}
          >{label}</a>
        ))}
      </div>
    </>
  );

  // Desktop: portal to document.body so position:fixed escapes backdrop-filter containing block
  const desktopPortal = mounted && open && !mobile && fixedPos
    ? createPortal(
        <div ref={portalRef} style={{
          position: "fixed",
          bottom: fixedPos.bottom, right: fixedPos.right,
          padding: "14px 16px",
          background: isDark ? "rgba(18, 20, 28, 0.97)" : "rgba(238, 241, 248, 0.97)",
          border: `1px solid rgba(${rgb}, 0.22)`,
          borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
          display: "flex", flexDirection: "column", gap: 10,
          minWidth: 284, zIndex: 9999,
          backdropFilter: "blur(12px)",
        }}>
          {popoverContent(false)}
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Mobile sheet */}
      {open && mobile && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
      )}
      {open && mobile && (
        <div style={{
          position: "fixed", bottom: 64, left: 12, right: 12,
          padding: "16px",
          background: isDark ? "rgba(18, 20, 28, 0.98)" : "rgba(238, 241, 248, 0.98)",
          border: `1px solid rgba(${rgb}, 0.22)`,
          borderRadius: 16, boxShadow: "0 -4px 40px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column", gap: 12,
          zIndex: 200, backdropFilter: "blur(16px)",
        }}>
          {popoverContent(true)}
        </div>
      )}
      {desktopPortal}
      <CXBtn
        num={num} label="Share"
        primary={!hasPrimary}
        bgHex={hasPrimary ? secondaryHex : primaryHex}
        isDark={isDark} icon={<ShareIcon />}
        onClick={handleToggle}
      />
    </div>
  );
}

/** Short uppercase date label for the JOIN button: "MAY 27" or "MAY 27 – JUN 3" */
function expJoinDateLabel(exp: Experience): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d)
      .toLocaleDateString("en-US", { month: "short", day: "numeric" })
      .toUpperCase();
  };
  if (exp.datetimeEnd && exp.datetimeEnd !== exp.datetimeStart) {
    return `${fmt(exp.datetimeStart!)} – ${fmt(exp.datetimeEnd)}`;
  }
  return fmt(exp.datetimeStart!);
}

/**
 * Airtable endorsement form URL with prefilled fields.
 * Field names must match the exact field names in the Airtable form.
 * TODO: verify field names once the form is finalized.
 *   prefill_Service   → the category id (e.g. "speaking", "coaching")
 *   prefill_Skills    → comma-joined skills array
 *   prefill_Experience → experience id (hidden)
 */
function endorseUrl(exp: Experience): string {
  const base = import.meta.env.PUBLIC_ENDORSE_FORM_URL ?? "";
  const parts: string[] = [];
  if (exp.category) parts.push(`prefill_Service=${encodeURIComponent(exp.category)}`);
  if (exp.skills?.length) parts.push(`prefill_Skills%20List=${encodeURIComponent(exp.skills.join(", "))}`);
  parts.push(`prefill_Experience=${encodeURIComponent(exp.id)}`);
  parts.push("hide_Experience=true");
  return `${base}?${parts.join("&")}`;
}

/** Build a data-URI .ics download for a calendar event. */
function makeExpIcs(exp: Experience): string {
  const toD = (iso: string) => iso.replace(/-/g, "");
  // DTEND for all-day = day after last day (RFC 5545 §3.6.1)
  const endBase = exp.datetimeEnd ?? exp.datetimeStart!;
  const [ey, em, ed] = endBase.split("-").map(Number);
  const next = new Date(ey, em - 1, ed + 1);
  const endD = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, "0")}${String(next.getDate()).padStart(2, "0")}`;
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//pawper.dev//calendar//EN",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${toD(exp.datetimeStart!)}`,
    `DTEND;VALUE=DATE:${endD}`,
    `SUMMARY:${esc(exp.title)}`,
  ];
  if (exp.description) lines.push(`DESCRIPTION:${esc(exp.description)}`);
  const loc = exp.locationName ?? exp.location;
  if (loc) lines.push(`LOCATION:${esc(loc)}`);
  if (exp.registerUrl) lines.push(`URL:${exp.registerUrl}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

function ModalFooterButtons({ modal, proj, primaryHex, secondaryHex, isDark, onNavigateToService, onNavigate }: {
  modal: ModalState; proj?: ReturnType<typeof PROJECTS.find>;
  primaryHex: string; secondaryHex: string; isDark: boolean;
  onNavigateToService?: (serviceId: string) => void;
  onNavigate?: (m: ModalState) => void;
}) {
  const now = useNow();
  const [, setTick] = useState(0);
  useEffect(() => {
    if (modal.kind !== "series") return;
    const handler = () => setTick(t => t + 1);
    window.addEventListener("pw-progress-update", handler);
    window.addEventListener("pw-progress-reset", handler);
    return () => {
      window.removeEventListener("pw-progress-update", handler);
      window.removeEventListener("pw-progress-reset", handler);
    };
  }, [modal.kind]);

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
    const _expData = [...EXPERIENCES, ...AGENDA_EVENTS].find(e => e.id === modal.id);
    const expIsAgenda = !!_expData?.datetimeStart;
    const expPast = expIsAgenda && isEventPast(_expData?.datetimeStart ?? "", _expData?.datetimeEnd, _expData?.time, now);
    const expUpcoming = expIsAgenda && !expPast;

    // Show endorse for: non-agenda experiences (always historical) OR agenda events that have started
    const showEndorse = !!_expData && (!expIsAgenda || !expUpcoming);

    // When endorse is shown it takes the primary slot; action button becomes secondary
    const actionNum  = showEndorse ? "02" : "01";
    const actionPrimary = !showEndorse;
    const actionColor   = showEndorse ? secondaryHex : primaryHex;

    let btnAction: React.ReactNode;
    if (expUpcoming && _expData) {
      const dateLabel = expJoinDateLabel(_expData);
      if (_expData.registerUrl) {
        btnAction = (
          <CXBtn num={actionNum} label={`Join ${dateLabel}`} primary={actionPrimary} bgHex={actionColor} isDark={isDark}
            href={_expData.registerUrl} />
        );
      } else {
        btnAction = (
          <CXBtn num={actionNum} label={`Join ${dateLabel}`} primary={actionPrimary} bgHex={actionColor} isDark={isDark}
            icon={<span className="cx-btn-icon" style={{ fontWeight: 300, fontSize: 15 }}>+</span>}
            href={makeExpIcs(_expData)} download />
        );
      }
    } else if (_expData && isServiceCategory(_expData.category)) {
      const svc = SERVICES.find(s => s.id === _expData.category);
      btnAction = (
        <CXBtn num={actionNum} label={`Explore ${svc?.label ?? _expData.category}`} primary={actionPrimary} bgHex={actionColor} isDark={isDark}
          icon={null} onClick={() => onNavigateToService?.(_expData.category)} />
      );
    } else {
      btnAction = (
        <CXBtn num={actionNum} label="Open to work" primary={actionPrimary} bgHex={actionColor} isDark={isDark}
          icon={null} onClick={() => onNavigateToService?.("overview")} />
      );
    }

    return (
      <div className="cx-btn-row" style={{ position: "absolute", bottom: 7, right: 24, display: "flex", gap: 8, zIndex: 20 }}>
        {showEndorse && _expData && (
          <CXBtn num="01" label="Endorse Phillip" primary bgHex={primaryHex} isDark={isDark}
            href={endorseUrl(_expData)} />
        )}
        {btnAction}
        <SharePopover
          shareUrl={`https://pawper.dev/xp/${modal.id}`}
          title={_expData?.title ?? modal.id}
          num={showEndorse ? "03" : "02"}
          primaryHex={primaryHex}
          secondaryHex={secondaryHex}
          isDark={isDark}
          hasPrimary={true}
        />
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

  const seriesDevtoId = modal.kind === "series" ? (DEVTO_SERIES[modal.id] ?? null) : null;
  const seriesHasDevto = modal.kind === "series" &&
    (seriesDevtoId !== null || LOGS.some(l => l.series && slugify(l.series.name) === modal.id && !!l.devto));
  const seriesName = modal.kind === "series"
    ? ([...new Set(LOGS.filter(a => a.series).map(a => a.series!.name))]
        .find(n => slugify(n) === modal.id) ?? modal.id)
    : "";

  const seriesLogs = modal.kind === "series"
    ? LOGS.filter(a => a.series && slugify(a.series.name) === modal.id).sort((a, b) => a.series!.part - b.series!.part)
    : [];
  const allPublishedDone = seriesLogs.length > 0 && seriesLogs.every(a => getProgress(a.id).completed);
  const seriesStarted = seriesLogs.some(a => { const p = getProgress(a.id); return p.checked.length > 0 || p.current !== null; });
  const continueLog = !allPublishedDone && seriesLogs.length > 0
    ? (seriesLogs.find(a => { const p = getProgress(a.id); return !p.completed && p.current !== null; })
       ?? seriesLogs.find(a => !getProgress(a.id).completed)
       ?? null)
    : null;
  const seriesSiblings = seriesLogs.map(a => ({ kind: "log" as const, id: a.id }));

  return (
    <div className={`cx-btn-row${modal.kind === "series" && continueLog ? " cx-btn-row-fluid" : ""}`} style={{ position: "absolute", bottom: 7, left: modal.kind === "series" && continueLog ? 24 : undefined, right: 24, display: "flex", gap: 8, zIndex: 20, alignItems: "flex-end" }}>
      {modal.kind === "project" && proj && (
        <>
          {proj.webURL
            ? <CXBtn num="01" label="Open project" href={proj.webURL} primary bgHex={primaryHex} isDark={isDark} />
            : <CXBtn num="01" label="View source"  href={proj.githubURL} primary bgHex={primaryHex} isDark={isDark} />}
          {proj.webURL && <CXBtn num="02" label="View source" href={proj.githubURL} bgHex={secondaryHex} isDark={isDark} />}
        </>
      )}
      {modal.kind === "series" && continueLog && (
        <CXBtn num="01" label={seriesStarted ? "Continue" : "Start"} primary bgHex={primaryHex} isDark={isDark} icon={<span className="cx-btn-icon">›</span>}
          onClick={() => onNavigate?.({ kind: "log", id: continueLog.id, siblings: seriesSiblings })} />
      )}
      {(modal.kind === "series" || skillHasContent) && (
        <CXBtn num={modal.kind === "series" ? (continueLog ? "02" : "01") : "01"} label="RSS feed" href={rssHref}
          primary={modal.kind !== "series" || !continueLog} bgHex={continueLog ? secondaryHex : primaryHex} isDark={isDark} icon={<RssIcon />} />
      )}
      {skillHasContent && (
        <CXBtn num="02" label="Full GH activity" href={ghHref} bgHex={secondaryHex} isDark={isDark} />
      )}
      {modal.kind === "series" && seriesHasDevto && (
        <CXBtn num={continueLog ? "03" : "02"} label="Series on dev.to" href={seriesDevtoId ? `https://dev.to/pawper/series/${seriesDevtoId}` : `https://dev.to/pawper`} bgHex={secondaryHex} isDark={isDark} />
      )}
      {modal.kind === "series" && (
        <SharePopover
          shareUrl={`https://pawper.dev/ls/${modal.id}`}
          title={seriesName}
          num={continueLog ? (seriesHasDevto ? "04" : "03") : (seriesHasDevto ? "03" : "02")}
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
  const baseTopRef = useRef(0);
  const currentTopRef = useRef(0);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const applyTop = (v: number) => { el.style.top = `${v}px`; };
    let scrollerEl: Element | null = null;
    let scrollCleanup: (() => void) | null = null;

    function findScroller(): Element | null {
      let node: Element | null = el!.parentElement;
      while (node && !node.hasAttribute("data-overlayscrollbars-viewport")) {
        node = node.parentElement;
      }
      return node;
    }

    function updateBase() {
      const containerH = scrollerEl ? scrollerEl.clientHeight : window.innerHeight;
      const newBase = -Math.max(0, el!.scrollHeight - containerH + 14);
      baseTopRef.current = newBase;
      currentTopRef.current = Math.max(newBase, Math.min(0, currentTopRef.current));
      applyTop(currentTopRef.current);
    }

    function bindScroller(scroller: Element) {
      scrollerEl = scroller;
      updateBase();
      let last = scroller.scrollTop;
      const onScroll = () => {
        const cur = scroller.scrollTop;
        const delta = cur - last;
        currentTopRef.current = Math.max(baseTopRef.current, Math.min(0, currentTopRef.current - delta));
        applyTop(currentTopRef.current);
        last = cur;
      };
      scroller.addEventListener("scroll", onScroll, { passive: true });
      scrollCleanup = () => scroller.removeEventListener("scroll", onScroll);
    }

    const ro = new ResizeObserver(updateBase);
    ro.observe(el);
    window.addEventListener("resize", updateBase);

    const found = findScroller();
    if (found) {
      bindScroller(found);
      return () => { ro.disconnect(); window.removeEventListener("resize", updateBase); scrollCleanup?.(); };
    }

    // OverlayScrollbars may not have set the attribute yet — wait for it
    const mo = new MutationObserver(() => {
      const scroller = findScroller();
      if (scroller) { mo.disconnect(); bindScroller(scroller); }
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-overlayscrollbars-viewport"] });
    return () => { mo.disconnect(); ro.disconnect(); window.removeEventListener("resize", updateBase); scrollCleanup?.(); };
  }, []);

  return (
    <div className="cx-modal-body" style={{ display: "flex", paddingLeft: 17, paddingRight: 30, gap: 12 }}>
      <div className="cx-modal-content" style={{ flex: 1, minWidth: 0, padding: "14px 0 100px" }}>
        {body}
      </div>
      <div
        ref={sidebarRef}
        className="cx-modal-sidebar"
        style={{ width: 230, flexShrink: 0, padding: "14px 0 98px", display: "flex", alignSelf: "flex-start", position: "sticky", top: 0 }}
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
  onNavigateToAgenda?: (eventId: string) => void;
}

export default function CXModal({ modal, previousModal, onClose, onBack, onNavigate, onSiblingNav, onPatchModal, logsHtml, theme, onNavigateToCategory, onNavigateToLogCategory, onNavigateToService, onNavigateToAgenda }: CXModalProps) {
  const now = useNow();
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
    const mediaArea = (e.target as Element).closest(".cx-media-image-area");
    if (mediaArea?.getAttribute("data-zoomed") === "true") return;
    let node: Element | null = e.target as Element;
    while (node && !node.classList.contains("pw-glass-hi")) {
      const ox = window.getComputedStyle(node).overflowX;
      if ((ox === "auto" || ox === "scroll") && node.scrollWidth > node.clientWidth) return;
      node = node.parentElement;
    }
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
                       : modal.kind === "experience" ? (() => {
                           const _exp = [...EXPERIENCES, ...AGENDA_EVENTS].find(e => e.id === modal.id);
                           if (isServiceCategory(_exp?.category)) return "#9055e8";
                           if (_exp?.datetimeStart) return isEventPast(_exp.datetimeStart, _exp.datetimeEnd, _exp.time, now) ? "#e84455" : "#f55a28";
                           return "#e84455";
                         })()
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
        <ModalFooterButtons modal={modal} proj={_proj} primaryHex={primaryColor} secondaryHex={secondaryColor} isDark={theme === "dark"} onNavigateToService={onNavigateToService} onNavigate={onNavigate} />
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
                <DCLog id={modal.id} html={logsHtml[modal.id] ?? ''} anchor={modal.anchor} onOpenMedia={(src, alt, siblings) => onNavigate({ kind: "media", id: src, label: alt, siblings })} onOpenLog={(targetId, targetAnchor) => {
                    const target = LOGS.find(a => a.id === targetId);
                    const sibs = target?.series
                      ? LOGS.filter(a => a.series?.name === target.series?.name)
                          .sort((a, b) => a.series!.part - b.series!.part)
                          .map(a => ({ kind: "log" as const, id: a.id }))
                      : [];
                    onNavigate({ kind: "log", id: targetId, anchor: targetAnchor, siblings: sibs });
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
                  onNavigateToAgenda={onNavigateToAgenda}
                  onOpenExperience={(expId) => onNavigate({ kind: "experience", id: expId })}
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
