import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AGENDA_EVENTS, EXPERIENCES, PROJECTS, LOGS, canonicalizeSkill } from "../../../data/content";
import type { Endorsement, Experience } from "../../../data/content";
import type { ModalState } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import CXPill from "../CXPill";
import CollapsiblePills from "../CollapsiblePills";
import type { PillItem } from "../CollapsiblePills";
import Tap from "../../shared/Tap";
import { summaryForDescription, categoryLabel, isServiceCategory } from "./ExperienceCardRow";
import { isEventPast, isEventInProgress } from "../../../utils/date";
import { useNow } from "../../../hooks/useNow";
import { PROFILE } from "../../../data/content";

const allEndorsements = endorsementsData as Endorsement[];
type Match = { kind: "language"; color: string } | { kind: "topic" } | null;
function matchSkill(name: string): Match {
  const lower = canonicalizeSkill(name).toLowerCase();
  for (const p of PROJECTS) {
    const langEntry = Object.entries(p.languages).find(([l]) => l.toLowerCase() === lower);
    if (langEntry) return { kind: "language", color: langEntry[1].color };
  }
  if (PROJECTS.some((p) => p.topics.some((t) => t.toLowerCase() === lower))) return { kind: "topic" };
  if (LOGS.some((a) => a.tags?.some((t) => t.toLowerCase() === lower))) return { kind: "topic" };
  if (EXPERIENCES.some((e) => e.skills?.some((s) => s.toLowerCase() === lower))) return { kind: "topic" };
  if (allEndorsements.some((e) => e.skills?.some((s) => s.toLowerCase() === lower))) return { kind: "topic" };
  return null;
}
import { soundClick, soundHover } from "../../../context/SoundContext";


function toIcsDate(iso: string): string {
  return iso.replace(/-/g, "");
}

function makeIcs(e: Experience): string {
  const start = toIcsDate(e.datetimeStart ?? "");
  const end   = e.datetimeEnd ? toIcsDate(e.datetimeEnd) : start;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//pawper.dev//Agenda//EN",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${e.title}`,
    e.description ? `DESCRIPTION:${e.description.replace(/\n/g, "\\n")}` : "",
    e.location    ? `LOCATION:${e.location}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines)}`;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function monthKey(iso: string): string {
  const [year, month] = iso.split("-");
  return `${year}-${month}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function mailtoEndorse(e: Experience): string {
  const subject = `Endorsement: ${e.title}`;
  const body = `Hi Phillip,\n\nI'd like to leave an endorsement for "${e.title}"${e.organization ? ` (${e.organization})` : ""}.\n\n`;
  return `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function makeGoogleUrl(e: Experience): string {
  const start = toIcsDate(e.datetimeStart ?? "");
  const end   = e.datetimeEnd ? toIcsDate(e.datetimeEnd) : start;
  const p = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${start}/${end}`, details: e.description ?? "", location: e.location ?? "" });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// Returns the canonical experience ID for an agenda event:
// if a hardcoded Experience exists with the same title, use its ID; otherwise use the event's own ID.
function canonicalExpId(e: Experience): string {
  return EXPERIENCES.find((x) => x.title === e.title)?.id ?? e.id;
}

function AddToCalendarDropdown({ event }: { event: Experience }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ position: "relative" }}
      onMouseEnter={() => { setOpen(true); soundHover(); }}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); soundClick(); setOpen(o => !o); }}
    >
      <CXPill size="lg" variant="primary" hovered={open} style={{ cursor: "pointer" }}>
        + Calendar
      </CXPill>
      {open && (
        <>
          <div style={{ position: "absolute", top: "100%", left: -4, right: -4, height: 8 }} />
          <div className="pw-glass cx-filter-panel" style={{
            position: "absolute", top: "calc(100% + 5px)", right: 0, zIndex: 50,
            borderRadius: 6, padding: 8,
            display: "flex", flexDirection: "column", gap: 4, minWidth: 130,
          }}>
            <a
              href={makeGoogleUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { soundClick(); setOpen(false); }}
              onMouseEnter={soundHover}
              style={{ textDecoration: "none" }}
            >
              <CXPill size="sm" variant="secondary" style={{ display: "block", textAlign: "center", cursor: "pointer" }}>Google Calendar</CXPill>
            </a>
            <a
              href={makeIcs(event)}
              download={`${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`}
              onClick={() => { soundClick(); setOpen(false); }}
              onMouseEnter={soundHover}
              style={{ textDecoration: "none" }}
            >
              <CXPill size="sm" variant="secondary" style={{ display: "block", textAlign: "center", cursor: "pointer" }}>.ics / Apple / Outlook</CXPill>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

const HOOK_CLAMP_THRESHOLD = 140;

interface Props {
  scrollToId?: string;
  onScrolled?: () => void;
  openModal: (m: ModalState) => void;
}

export default function DCAgenda({ scrollToId, onScrolled, openModal }: Props) {
  const scrollRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [bottomPad, setBottomPad] = useState(600);
  const now = useNow();

  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Keep bottom padding = viewport height so any event can be scrolled to the top
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const viewport = el.closest<HTMLElement>("[data-overlayscrollbars-viewport]");
    if (!viewport) return;
    const update = () => setBottomPad(viewport.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      const viewport = el.closest<HTMLElement>("[data-overlayscrollbars-viewport]");
      if (!viewport) return;
      const offset = el.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop - 143;
      viewport.scrollTop = offset;
      onScrolled?.();
    });
    return () => cancelAnimationFrame(raf);
  }, [scrollToId]);

  const events = [...AGENDA_EVENTS].sort((a, b) =>
    (a.datetimeStart ?? "").localeCompare(b.datetimeStart ?? "")
  );

  if (events.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em" }}>
          NO EVENTS SCHEDULED
        </span>
      </div>
    );
  }

  const firstUpcomingId = events.find((e) => !isEventPast(e.datetimeStart ?? "", e.datetimeEnd, e.time, now))?.id ?? null;
  const scrollTargetId = scrollToId ?? firstUpcomingId;

  const childrenByParent = new Map<string, Experience[]>();
  for (const e of events) {
    if (e.parentId) {
      if (!childrenByParent.has(e.parentId)) childrenByParent.set(e.parentId, []);
      childrenByParent.get(e.parentId)!.push(e);
    }
  }

  const topLevel = events.filter((e) => !e.parentId);

  const grouped = new Map<string, Experience[]>();
  for (const e of topLevel) {
    const key = monthKey(e.datetimeStart ?? "");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(e);
  }

  // Divider: only show if there are both past and upcoming top-level events
  const firstUpcomingTopLevelId = topLevel.find((e) => !isEventPast(e.datetimeStart ?? "", e.datetimeEnd, e.time, now))?.id;
  const hasPastTopLevel = topLevel.some((e) => isEventPast(e.datetimeStart ?? "", e.datetimeEnd, e.time, now));
  const showDivider = !!firstUpcomingTopLevelId && hasPastTopLevel;

  function renderCard(e: Experience, indent = false) {
    const past = isEventPast(e.datetimeStart ?? "", e.datetimeEnd, e.time, now);
    const inProgress = isEventInProgress(e.datetimeStart ?? "", e.datetimeEnd, e.time, now);
    const roleLabel = categoryLabel(e.category, past);
    const cardVars: React.CSSProperties = isServiceCategory(e.category)
      ? { "--section-accent": "#9055e8", "--section-deep": "#c49ef8", "--section-rgb": "144, 85, 232" } as React.CSSProperties
      : { "--section-accent": past ? "#e84455" : "#f55a28", "--section-deep": past ? "#e84455" : "#f55a28", "--section-rgb": past ? "232, 68, 85" : "245, 90, 40" } as React.CSSProperties;
    const expanded = expandedIds.has(e.id);
    const descText = summaryForDescription(e.description ?? "") ?? "";
    const hasLongNote = descText.length > HOOK_CLAMP_THRESHOLD;
    const dateStr = e.datetimeEnd && e.datetimeEnd !== e.datetimeStart
      ? `${formatDate(e.datetimeStart ?? "")} – ${formatDate(e.datetimeEnd)}`
      : formatDate(e.datetimeStart ?? "");
    const hookNode = descText ? (
      hasLongNote ? (
        <span>
          {expanded ? descText : descText.slice(0, HOOK_CLAMP_THRESHOLD).trimEnd() + "…"}
          {" "}
          <span
            className="pw-mono"
            onClick={(ev) => { ev.stopPropagation(); toggleExpanded(e.id); soundClick(); }}
            onMouseEnter={soundHover}
            style={{ fontSize: 10, color: "var(--section-deep)", cursor: "pointer", letterSpacing: "0.1em", userSelect: "none" }}
          >
            {expanded ? "LESS" : "MORE"}
          </span>
        </span>
      ) : descText
    ) : undefined;

    const footer = e.location ? (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(ev) => { ev.stopPropagation(); soundClick(); }}
        onMouseEnter={soundHover}
        className="cx-toc-item"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ink-soft)", textDecoration: "none", padding: "3px 6px", marginLeft: -6 }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: "var(--section-accent)" }}>
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
        <span>{e.locationName ?? e.location}</span>
      </a>
    ) : null;

    const isScrollTarget = e.id === scrollTargetId;

    const action = inProgress ? (
      <a
        href={mailtoEndorse(e)}
        onClick={(ev) => { ev.stopPropagation(); soundClick(); }}
        onMouseEnter={soundHover}
        style={{ textDecoration: "none", flexShrink: 0 }}
      >
        <CXPill size="lg" variant="primary" style={{ cursor: "pointer" }}>
          Endorse <span style={{ marginLeft: 2, display: "inline-block", transform: "scale(1.4)", transformOrigin: "center", position: "relative", top: -2 }}>✦</span>
        </CXPill>
      </a>
    ) : !past ? (
      e.registerUrl
        ? (
          <a
            href={e.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(ev) => { ev.stopPropagation(); soundClick(); }}
            onMouseEnter={soundHover}
            style={{ textDecoration: "none", flexShrink: 0 }}
          >
            <CXPill size="lg" variant="primary" style={{ cursor: "pointer" }}>
              Register <span style={{ marginLeft: 2, display: "inline-block", transform: "scale(1.4)", transformOrigin: "center", position: "relative", top: -2 }}>↗</span>
            </CXPill>
          </a>
        )
        : <AddToCalendarDropdown event={e} />
    ) : null;

    return (
      <div
        key={e.id}
        ref={isScrollTarget ? scrollRef : undefined}
        className={past ? "cx-past" : undefined}
        style={indent ? { paddingLeft: 16 } : undefined}
      >
        <Tap
          className="pw-glass-dim cx-card cx-training-row"
          style={{
            ...cardVars,
            padding: "16px 20px",
            borderRadius: 16,
            borderLeft: "4px solid var(--section-accent)",
            display: "grid",
            gridTemplateColumns: "90px 1fr auto",
            gap: 16,
            alignItems: "start",
            cursor: "pointer",
          }}
          onClick={() => { soundClick(); openModal({ kind: "experience", id: canonicalExpId(e) }); }}
        >
          {/* Date column */}
          <div style={{ paddingTop: 2 }}>
            <div className="pw-mono" style={{ fontSize: 12, color: "var(--section-deep)", fontWeight: 600, letterSpacing: "0.06em", lineHeight: 1.3 }}>
              {dateStr}
            </div>
            {e.time && (
              <div className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2, letterSpacing: "0.04em" }}>
                {e.time}
              </div>
            )}
          </div>

          {/* Content column */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.2 }}>{e.title}</div>
            {hookNode && (
              <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.45, marginTop: 6 }}>{hookNode}</div>
            )}
            {footer && <div style={{ marginTop: 6 }}>{footer}</div>}
            {(roleLabel || (e.skills?.length ?? 0) > 0) && (() => {
              const hasPills = (e.skills?.length ?? 0) > 0;
              const pills: PillItem[] = hasPills
                ? e.skills!
                    .filter((s) => matchSkill(s) !== null)
                    .map((s) => {
                      const canonical = canonicalizeSkill(s);
                      const match = matchSkill(s)!;
                      return { key: s, label: canonical, onClick: () => openModal(match.kind === "language" ? { kind: "skill", id: canonical, filterType: "language", color: match.color } : { kind: "skill", id: canonical, filterType: "topic" }) };
                    })
                : [];
              const plain = hasPills ? e.skills!.filter((s) => matchSkill(s) === null) : [];
              return (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
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
            })()}
          </div>

          {/* Org + Action column */}
          <div style={{ paddingTop: 2, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {e.organization && (
              <span style={{ fontSize: 12, color: "var(--ink-mute)", whiteSpace: "nowrap" }}>{e.organization}</span>
            )}
            {e.organization && action && (
              <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>•</span>
            )}
            {action}
          </div>
        </Tap>
      </div>
    );
  }

  const pastDivider = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
      <span className="pw-mono" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-mute)", textTransform: "uppercase" }}>
        <span style={{ opacity: 0.6 }}>↑</span>
        Past Experiences
        <span style={{ opacity: 0.6 }}>↑</span>
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
    </div>
  );

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: bottomPad }}>
      {[...grouped.entries()].map(([key, items]) => {
        const firstItemIsBreakpoint = items[0]?.id === firstUpcomingTopLevelId;
        return (
          <React.Fragment key={key}>
            {showDivider && firstItemIsBreakpoint && pastDivider}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>
                {monthLabel(key)}
              </div>
              {items.map((e) => (
                <React.Fragment key={e.id}>
                  {showDivider && !firstItemIsBreakpoint && e.id === firstUpcomingTopLevelId && (
                    <>
                      {pastDivider}
                      <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>{monthLabel(key)}</div>
                    </>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {renderCard(e, false)}
                    {childrenByParent.get(e.id)?.map((child) => renderCard(child, true))}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
