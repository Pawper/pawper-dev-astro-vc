import { useEffect, useRef, useState } from "react";
import Tap from "../../shared/Tap";
import CXPill from "../CXPill";
import { SKILLS } from "../../../data/content";
import { getProgress, checkSection, uncheckSection, completeAll, clearProgress } from "../../../utils/logProgress";
import type { LogProgressEntry } from "../../../utils/logProgress";
import { soundHover, soundClick } from "../../../context/SoundContext";

const _CIRC = 2 * Math.PI * 4;

export function ProgressDot({ anchorId, progress, accentColor, onToggle }: {
  anchorId: string;
  progress: LogProgressEntry;
  accentColor: string;
  onToggle?: () => void;
}) {
  const handle = onToggle ? (e: { stopPropagation: () => void }) => { e.stopPropagation(); onToggle(); } : undefined;
  const cursor = onToggle ? "pointer" : "default";
  if (progress.checked.includes(anchorId)) {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
        style={{ position: "absolute", bottom: 9, right: 6, cursor }} onClick={handle}>
        <polyline points="1.5 5 3.5 7.5 8.5 2.5"
          stroke="var(--section-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (progress.current === anchorId) {
    return (
      <svg width="8" height="10" viewBox="0 0 8 10" fill="none"
        style={{ position: "absolute", bottom: 8, right: 6, cursor }} onClick={handle}>
        <path d="M1 0.5h6v9L4 7 1 9.5V0.5z" fill={accentColor} />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ position: "absolute", bottom: 9, right: 6, cursor }} onClick={handle}>
      <circle cx="5" cy="5" r="4" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <circle cx="5" cy="5" r="4" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray={String(_CIRC)} strokeDashoffset={String(_CIRC)} transform="rotate(-90 5 5)" />
    </svg>
  );
}

export function ArticleProgressRing({ progress, total, slug, allIds, onAction }: { progress: LogProgressEntry; total: number; slug: string; allIds: string[]; onAction?: () => void }) {
  if (total === 0) return null;
  const [hovered, setHovered] = useState(false);
  const checked = progress.checked.length;
  const R = 8;
  const CIRC = 2 * Math.PI * R;
  const handleClick = (e: { stopPropagation: () => void }) => { e.stopPropagation(); soundClick(); onAction ? onAction() : (progress.completed ? clearProgress(slug) : completeAll(slug, allIds)); };
  const svgProps = { onClick: handleClick, onMouseEnter: () => { setHovered(true); soundHover(); }, onMouseLeave: () => setHovered(false), style: { cursor: "pointer", flexShrink: 0 } };

  if (progress.completed) {
    return (
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
        <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{checked}/{total}</span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...svgProps}>
          <circle cx="9" cy="9" r={R} stroke="var(--section-accent)" strokeWidth="1.5" />
          {hovered ? (
            <g transform="translate(4.5 4.5) scale(0.75)" stroke="rgba(255,255,255,0.45)" fill="none" strokeWidth="2.13" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 6A4.5 4.5 0 1 0 3 2.5L1.5 1" />
              <polyline points="1.5 1 1.5 4 4.5 4" />
            </g>
          ) : (
            <polyline points="5 9.5 7.5 12 13 6" stroke="var(--section-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </span>
    );
  }

  const offset = CIRC * (1 - checked / total);
  return (
    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
      <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{checked}/{total}</span>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...svgProps}>
        <circle cx="9" cy="9" r={R} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        {checked > 0 && (
          <circle cx="9" cy="9" r={R} stroke="var(--section-accent)" strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray={String(CIRC)} strokeDashoffset={String(offset)} transform="rotate(-90 9 9)" />
        )}
        {hovered && (
          <polyline points="5.5 9.5 7.5 11.5 12.5 6.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  );
}

interface SidebarTagGroupsProps {
  tags: string[];
  onOpen?: (tag: string) => void;
  accentColor?: string;
}

export function SidebarTagGroups({ tags, onOpen, accentColor = "var(--section-deep)" }: SidebarTagGroupsProps) {
  if (!tags.length) return null;

  const lower = tags.map(t => t.toLowerCase());
  const categorised = SKILLS
    .map(g => ({ label: g.label, matches: g.items.filter(s => lower.includes(s.toLowerCase())) }))
    .filter(g => g.matches.length > 0);
  const claimed = new Set(categorised.flatMap(g => g.matches.map(s => s.toLowerCase())));
  const unclaimed = tags.filter(t => !claimed.has(t.toLowerCase()));
  const sections = [...categorised, ...(unclaimed.length ? [{ label: "Other", matches: unclaimed }] : [])];

  if (!sections.length) return null;

  return (
    <div className="pw-glass-dim" style={{ padding: 16, borderRadius: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      {sections.map(({ label, matches }) => (
        <div key={label}>
          <div className="pw-eyebrow" style={{ color: accentColor, marginBottom: 6 }}>{label}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {matches.map((t) => (
              <CXPill
                key={t}
                variant="secondary" active
                onClick={onOpen ? () => onOpen(t) : undefined}
                style={onOpen ? undefined : { cursor: "default" }}
              >
                {t}
              </CXPill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface SidebarTOCProps {
  headings: Array<{ text: string; anchorId: string }>;
  label: string;
  accentColor?: string;
  slug?: string;
}

export function SidebarTOC({ headings, label, accentColor = "var(--section-deep)", slug }: SidebarTOCProps) {
  if (!headings.length) return null;

  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<LogProgressEntry>(() =>
    slug ? getProgress(slug) : { current: null, checked: [], completed: false }
  );

  useEffect(() => {
    if (!slug) return;
    const refresh = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.slug || detail.slug === slug) setProgress(getProgress(slug));
    };
    window.addEventListener("pw-progress-update", refresh);
    window.addEventListener("pw-progress-reset", refresh);
    return () => {
      window.removeEventListener("pw-progress-update", refresh);
      window.removeEventListener("pw-progress-reset", refresh);
    };
  }, [slug]);

  useEffect(() => {
    let scroller: Element | null = containerRef.current?.parentElement ?? null;
    while (scroller && !scroller.hasAttribute("data-overlayscrollbars-viewport")) {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;
    const scrollerEl = scroller;
    const onScroll = () => {
      const scrollerTop = scrollerEl.getBoundingClientRect().top;
      let next = 0;
      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].anchorId);
        if (el && el.getBoundingClientRect().top - scrollerTop <= 80) next = i;
      }
      setActiveIdx(next);
    };
    scrollerEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollerEl.removeEventListener("scroll", onScroll);
  }, [headings]);

  return (
    <div ref={containerRef} className="pw-glass-dim cx-sidebar-toc" style={{ padding: 16, borderRadius: 14, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, marginRight: -6 }}>
        <div className="pw-eyebrow" style={{ color: accentColor }}>{label}</div>
        {slug && <ArticleProgressRing progress={progress} total={headings.length} slug={slug} allIds={headings.map(h => h.anchorId)} />}
      </div>
      {headings.map(({ text, anchorId }, i) => (
        <Tap
          key={i}
          className="cx-toc-item"
          onClick={() => {
            let el = document.getElementById(anchorId);
            if (!el) {
              const prose = document.querySelector(".pw-prose");
              if (prose) {
                for (const h of prose.querySelectorAll("h2, h3")) {
                  if (h.textContent?.trim() === text) { el = h as HTMLElement; break; }
                }
              }
            }
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          style={{ fontSize: 13, color: i === activeIdx ? accentColor : "var(--ink-soft)", padding: "5px 8px", margin: "0 -8px", display: "flex", gap: 8, alignItems: "baseline", transition: "color 0.15s", position: "relative" }}
        >
          <span className="pw-mono" style={{ color: i === activeIdx ? accentColor : "var(--ink-mute)", fontSize: 11, flexShrink: 0, transition: "color 0.15s" }}>{String(i + 1).padStart(2, "0")}</span>
          <span>{text}</span>
          {slug && <ProgressDot anchorId={anchorId} progress={progress} accentColor={accentColor}
            onToggle={() => {
              const allIds = headings.map(h => h.anchorId);
              if (progress.checked.includes(anchorId)) uncheckSection(slug, anchorId);
              else checkSection(slug, anchorId, allIds);
            }} />}
        </Tap>
      ))}
    </div>
  );
}
