/**
 * ExperienceCardRow — shared experience card used in skill modal, experience modal,
 * and (optionally) the agenda panel.
 *
 * • Upcoming agenda events (datetimeStart present, not past) → agenda layout with
 *   date, time, location, register link.
 * • Everything else → training-row layout with period + organization.
 */

import { EXPERIENCES, AGENDA_EVENTS, PROJECTS, LOGS, PROFILE, canonicalizeSkill } from "../../../data/content";
import type { Endorsement, Experience, ExperienceCategory } from "../../../data/content";
import type { ModalState } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import CollapsiblePills from "../CollapsiblePills";
import type { PillItem } from "../CollapsiblePills";
import CXPill from "../CXPill";
import Tap from "../../shared/Tap";
import { soundClick, soundHover } from "../../../context/SoundContext";
import { derivePeriod, isEventPast, isEventInProgress } from "../../../utils/date";
import { useNow } from "../../../hooks/useNow";
import { useTheme } from "../../../hooks/useTheme";
import { clampEyebrowColor } from "../../../utils/color";

const allEndorsements = endorsementsData as Endorsement[];

/** Categories that correspond to Phillip's offered services (→ purple theming). */
const SERVICE_CATEGORY_IDS = new Set<ExperienceCategory>([
  "employment", "contracting", "consulting", "coaching", "speaking", "mentoring",
]);
export function isServiceCategory(cat: ExperienceCategory | undefined): boolean {
  return !!cat && SERVICE_CATEGORY_IDS.has(cat);
}

type Match = { kind: "language"; color: string } | { kind: "topic" } | null;
function matchSkill(name: string): Match {
  const lower = canonicalizeSkill(name).toLowerCase();
  for (const p of PROJECTS) {
    const e = Object.entries(p.languages).find(([l]) => l.toLowerCase() === lower);
    if (e) return { kind: "language", color: e[1].color };
  }
  if (PROJECTS.some((p) => p.topics.some((t) => t.toLowerCase() === lower))) return { kind: "topic" };
  if (LOGS.some((a) => a.tags?.some((t) => t.toLowerCase() === lower))) return { kind: "topic" };
  if (EXPERIENCES.some((e) => e.skills?.some((s) => s.toLowerCase() === lower))) return { kind: "topic" };
  if (allEndorsements.some((e) => e.skills?.some((s) => s.toLowerCase() === lower))) return { kind: "topic" };
  return null;
}

const LONE_URL_RE = /^<?(https?:\/\/[^\s>]+)>?$/;

/** For compact card descriptions: resolves a bare pawper.dev/l/{id} URL to the
 *  log title, any other bare URL to its domain, and passes plain text through. */
export function summaryForDescription(desc: string): string | null {
  if (!desc) return null;
  const firstLine = desc.split("\n")[0].trim();
  const m = firstLine.match(LONE_URL_RE);
  if (m) {
    const url = m[1];
    const logSlug = url.match(/pawper\.dev\/l\/([^/?#]+)/)?.[1];
    if (logSlug) {
      const log = LOGS.find((a) => a.id === logSlug);
      if (log) return log.title;
    }
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch {}
    return null;
  }
  return desc;
}

/** @deprecated Day-level only. Prefer `isEventPast` from utils/date which is
 *  time-aware and uses the event's `time` field. */
export function isPastDate(iso: string): boolean {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function mailtoEndorse(exp: Experience): string {
  const subject = `Endorsement: ${exp.title}`;
  const body = `Hi Phillip,\n\nI'd like to leave an endorsement for "${exp.title}"${exp.organization ? ` (${exp.organization})` : ""}.\n\n`;
  return `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function categoryLabel(category: ExperienceCategory | undefined, past: boolean): string | null {
  switch (category) {
    case "attending":    return past ? "Phillip attended"    : "Phillip is attending";
    case "speaking":     return past ? "Phillip spoke"       : "Phillip is speaking";
    case "mentoring":    return past ? "Phillip mentored"    : "Phillip is mentoring";
    case "volunteering": return past ? "Phillip volunteered" : "Phillip is volunteering";
    case "coaching":     return past ? "Phillip coached"     : "Phillip is coaching";
    case "consulting":   return past ? "Phillip consulted"   : "Phillip is consulting";
    case "contracting":  return past ? "Phillip contracted"  : "Phillip is contracting";
    case "education":    return past ? "Phillip completed"   : "Phillip is enrolled";
    default:             return null;
  }
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  exp: Experience;
  /** Opens any modal — used for card click (experience) and skill pill clicks. */
  openModal: (m: ModalState) => void;
  /** Override the card click target (e.g. skill modal uses onOpenExperience). */
  onCardClick?: () => void;
  /** Override skill pill open target (e.g. skill modal uses onOpenSkill). */
  onOpenSkill?: (id: string, filterType: "language" | "topic", color?: string) => void;
  /** Suppress past-event dimming (e.g. service panel wants full brightness always). */
  noDim?: boolean;
}

export default function ExperienceCardRow({ exp, openModal, onCardClick, onOpenSkill, noDim }: Props) {
  const now = useNow();
  const theme = useTheme();
  const isDark = theme === "dark";
  const isAgenda = !!exp.datetimeStart;
  const past = isAgenda ? isEventPast(exp.datetimeStart!, exp.datetimeEnd, exp.time, now) : false;
  const inProgress = isAgenda ? isEventInProgress(exp.datetimeStart!, exp.datetimeEnd, exp.time, now) : false;
  const upcoming = isAgenda && !past;
  // Child events inherit the parent's register URL when they don't have one
  // of their own — prefer parent (broader event) over child (specific session).
  const parent = exp.parentId
    ? [...EXPERIENCES, ...AGENDA_EVENTS].find((e) => e.id === exp.parentId)
    : undefined;
  const actionSource = parent ?? exp;
  const descSummary = summaryForDescription(exp.description ?? "");
  const roleLabel = categoryLabel(exp.category, past);

  const handleCardClick = onCardClick ?? (() => openModal({ kind: "experience", id: exp.id }));

  // Color theming priority: service category → purple, agenda past → red, agenda upcoming → orange
  const cardVars: React.CSSProperties = isServiceCategory(exp.category)
    ? {
        "--section-accent": "#9055e8",
        "--section-deep":   clampEyebrowColor(isDark ? "#c49ef8" : "#9055e8", isDark),
        "--section-rgb":    "144, 85, 232",
      } as React.CSSProperties
    : isAgenda
    ? {
        "--section-accent": past ? "#e84455" : "#f55a28",
        "--section-deep":   clampEyebrowColor(past ? "#e84455" : "#f55a28", isDark),
        "--section-rgb":    past ? "232, 68, 85" : "245, 90, 40",
      } as React.CSSProperties
    : {};

  // ── Skills + role row ────────────────────────────────────────────────────────
  const hasPills = (exp.skills?.length ?? 0) > 0;
  const skillsNode = (hasPills || !!roleLabel)
    ? (() => {
        const pills: PillItem[] = hasPills
          ? exp.skills!
              .filter((s) => matchSkill(s) !== null)
              .map((s) => {
                const canonical = canonicalizeSkill(s);
                const match = matchSkill(s)!;
                const onClick = onOpenSkill
                  ? () => onOpenSkill(canonical, match.kind === "language" ? "language" : "topic", match.kind === "language" ? match.color : undefined)
                  : () => openModal(match.kind === "language"
                      ? { kind: "skill", id: canonical, filterType: "language", color: match.color }
                      : { kind: "skill", id: canonical, filterType: "topic" });
                return { key: s, label: canonical, onClick };
              })
          : [];
        const plain = hasPills ? exp.skills!.filter((s) => matchSkill(s) === null) : [];
        return (
          <div style={{ marginTop: 8, display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
            {roleLabel && (
              <span style={{ fontSize: 11, color: "var(--section-deep)", fontWeight: 700, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>
                {roleLabel}
              </span>
            )}
            {roleLabel && hasPills && (
              <span style={{ fontSize: 11, color: "var(--ink-mute)", flexShrink: 0 }}>•</span>
            )}
            {hasPills && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <CollapsiblePills pills={pills} plain={plain} size="sm" />
              </div>
            )}
          </div>
        );
      })()
    : null;

  // ── Agenda-style card (upcoming event) ───────────────────────────────────────
  if (upcoming) {
    const dateStr = exp.datetimeEnd && exp.datetimeEnd !== exp.datetimeStart
      ? `${formatDate(exp.datetimeStart!)} – ${formatDate(exp.datetimeEnd)}`
      : formatDate(exp.datetimeStart!);

    const location = exp.location ? (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(exp.location)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => { e.stopPropagation(); soundClick(); }}
        onMouseEnter={soundHover}
        className="cx-toc-item"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-soft)", textDecoration: "none", padding: "3px 6px", marginLeft: -6 }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--section-accent)" }}>
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
        <span>{exp.locationName ?? exp.location}</span>
      </a>
    ) : null;

    const action = inProgress ? (
      <a
        href={mailtoEndorse(exp)}
        onClick={(e) => { e.stopPropagation(); soundClick(); }}
        onMouseEnter={soundHover}
        style={{ textDecoration: "none", flexShrink: 0 }}
      >
        <CXPill size="lg" variant="primary" style={{ cursor: "pointer" }}>
          Endorse <span style={{ marginLeft: 2, display: "inline-block", transform: "scale(1.4)", transformOrigin: "center", position: "relative", top: -2 }}>✦</span>
        </CXPill>
      </a>
    ) : actionSource.registerUrl ? (
      <a
        href={actionSource.registerUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => { e.stopPropagation(); soundClick(); }}
        onMouseEnter={soundHover}
        style={{ textDecoration: "none", flexShrink: 0 }}
      >
        <CXPill size="lg" variant="primary" style={{ cursor: "pointer" }}>
          Register <span style={{ marginLeft: 2, display: "inline-block", transform: "scale(1.4)", transformOrigin: "center", position: "relative", top: -2 }}>↗</span>
        </CXPill>
      </a>
    ) : null;

    return (
      <Tap
        className="pw-glass-dim cx-card cx-training-row"
        style={{
          ...cardVars,
          padding: "16px 20px", borderRadius: 16,
          borderLeft: "4px solid var(--section-accent)",
          display: "grid", gridTemplateColumns: "90px 1fr auto",
          gap: 16, alignItems: "start", cursor: "pointer",
        }}
        onClick={() => { soundClick(); handleCardClick(); }}
      >
        {/* Date + time */}
        <div style={{ paddingTop: 2 }}>
          <div className="pw-mono" style={{ fontSize: 12, color: "var(--section-deep)", fontWeight: 600, letterSpacing: "0.06em", lineHeight: 1.3 }}>
            {dateStr}
          </div>
          {exp.time && (
            <div className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2, letterSpacing: "0.04em" }}>
              {exp.time}
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.2 }}>{exp.title}</div>
          {descSummary && (
            <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.45, marginTop: 6 }}>{descSummary}</div>
          )}
          {location && <div style={{ marginTop: 6 }}>{location}</div>}
          {skillsNode}
        </div>

        {/* Org + Action */}
        <div style={{ paddingTop: 2, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {exp.organization && (
            <span style={{ fontSize: 12, color: "var(--ink-mute)", whiteSpace: "nowrap" }}>{exp.organization}</span>
          )}
          {exp.organization && action && (
            <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>•</span>
          )}
          {action}
        </div>
      </Tap>
    );
  }

  // ── Training-row style (past or non-agenda) ──────────────────────────────────
  return (
    <Tap
      className={`pw-glass-dim cx-card cx-training-row${past && !noDim ? " cx-past" : ""}`}
      style={{
        ...cardVars,
        padding: "18px 22px", borderRadius: 16,
        borderLeft: "4px solid var(--section-accent)",
        display: "grid", gridTemplateColumns: "100px 1fr",
        gap: 18, alignItems: "start", cursor: "pointer",
      }}
      onClick={() => { soundClick(); handleCardClick(); }}
    >
      <span className="pw-mono" style={{ fontSize: 12, color: "var(--section-deep)", fontWeight: 600, letterSpacing: "0.08em", paddingTop: 2 }}>
        {exp.datetimeStart ? formatDate(exp.datetimeStart) : derivePeriod(exp.title, exp.period ?? "")}
      </span>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{exp.title}</div>
          {exp.organization && (
            <span style={{ fontSize: 12, color: "var(--ink-mute)", flexShrink: 0 }}>{exp.organization}</span>
          )}
        </div>
        {descSummary && (
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>{descSummary}</div>
        )}
        {skillsNode}
      </div>
    </Tap>
  );
}
