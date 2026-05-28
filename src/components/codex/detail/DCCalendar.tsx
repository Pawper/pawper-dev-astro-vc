import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CALENDAR_EVENTS } from "../../../data/content";
import type { CalendarEvent } from "../../../data/content";
import CXCard from "../CXCard";
import CXPill from "../CXPill";
import { soundClick, soundHover } from "../../../context/SoundContext";
import { isEventPast } from "../../../utils/date";
import { useNow } from "../../../hooks/useNow";

const TYPE_COLORS: Record<string, { accent: string; label: string }> = {
  available: { accent: "var(--section-accent)", label: "Available" },
  speaking:  { accent: "var(--section-accent)", label: "Speaking"  },
  workshop:  { accent: "var(--section-accent)", label: "Workshop"  },
  attending: { accent: "var(--section-accent)", label: "Attending" },
  bootcamp:  { accent: "var(--section-accent)", label: "Bootcamp"  },
};

function toIcsDate(iso: string): string {
  return iso.replace(/-/g, "");
}

function makeIcs(e: CalendarEvent): string {
  const start = toIcsDate(e.date);
  const end   = e.endDate ? toIcsDate(e.endDate) : start;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//pawper.dev//Calendar//EN",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${e.title}`,
    e.note     ? `DESCRIPTION:${e.note.replace(/\n/g, "\\n")}` : "",
    e.location ? `LOCATION:${e.location}` : "",
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

function makeGoogleUrl(e: CalendarEvent): string {
  const start = toIcsDate(e.date);
  const end   = e.endDate ? toIcsDate(e.endDate) : start;
  const p = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${start}/${end}`, details: e.note ?? "", location: e.location ?? "" });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function AddToCalendarDropdown({ event, accent }: { event: CalendarEvent; accent: string }) {
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

export default function DCCalendar() {
  const nextRef = useRef<HTMLDivElement>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const now = useNow();
  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  useLayoutEffect(() => {
    const el = nextRef.current;
    if (!el) return;
    // OverlayScrollbars initializes asynchronously — wait one frame after mount
    const raf = requestAnimationFrame(() => {
      const viewport = el.closest<HTMLElement>("[data-overlayscrollbars-viewport]");
      if (!viewport) return;
      const offset = el.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop - 143;
      viewport.scrollTop = offset;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const events = [...CALENDAR_EVENTS].sort((a, b) => a.date.localeCompare(b.date));

  if (events.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em" }}>
          NO EVENTS SCHEDULED
        </span>
      </div>
    );
  }

  const firstUpcomingId = events.find((e) => !isEventPast(e.date, e.endDate, e.time, now))?.id ?? null;

  const childrenByParent = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    if (e.parentId) {
      if (!childrenByParent.has(e.parentId)) childrenByParent.set(e.parentId, []);
      childrenByParent.get(e.parentId)!.push(e);
    }
  }

  const topLevel = events.filter((e) => !e.parentId);

  const grouped = new Map<string, CalendarEvent[]>();
  for (const e of topLevel) {
    const key = monthKey(e.date);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(e);
  }

  function renderCard(e: CalendarEvent, indent = false, parent?: CalendarEvent) {
    const actionSource = parent ?? e;
    const tc = TYPE_COLORS[e.type] ?? TYPE_COLORS.workshop;
    const past = isEventPast(e.date, e.endDate, e.time, now);
    const expanded = expandedIds.has(e.id);
    const hasLongNote = !!(e.note && e.note.length > HOOK_CLAMP_THRESHOLD);
    const dateStr = e.endDate && e.endDate !== e.date
      ? `${formatDate(e.date)} – ${formatDate(e.endDate)}`
      : formatDate(e.date);

    const hookNode = e.note ? (
      hasLongNote ? (
        <span>
          {expanded ? e.note : e.note.slice(0, HOOK_CLAMP_THRESHOLD).trimEnd() + "…"}
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
      ) : e.note
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
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: tc.accent }}>
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
        <span>{e.location}</span>
      </a>
    ) : null;

    return (
      <div key={e.id} ref={e.id === firstUpcomingId ? nextRef : undefined} style={{ opacity: past ? 0.45 : 1, ...(indent ? { paddingLeft: 16 } : {}) }}>
        <CXCard
          accentColor={tc.accent}
          eyebrow={[tc.label, dateStr, e.time].filter(Boolean).join(" · ")}
          eyebrowColor={tc.accent}
          headerRight={!past ? (
            actionSource.registerUrl
              ? (
                <a
                  href={actionSource.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundClick()}
                  onMouseEnter={soundHover}
                  style={{ textDecoration: "none" }}
                >
                  <CXPill size="lg" variant="primary" style={{ cursor: "pointer" }}>Register <span style={{ marginLeft: 2, display: "inline-block", transform: "scale(1.4)", transformOrigin: "center", position: "relative", top: -2 }}>↗</span></CXPill>
                </a>
              )
              : <AddToCalendarDropdown event={actionSource} accent={tc.accent} />
          ) : undefined}
          title={e.title}
          titleSize={15}
          hook={hookNode}
          hookLines={hasLongNote ? 99 : 2}
          footer={footer ?? undefined}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 24 }}>
      {[...grouped.entries()].map(([key, items]) => (
        <div key={key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>
            {monthLabel(key)}
          </div>
          {items.map((e) => (
            <div key={e.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {renderCard(e, false)}
              {childrenByParent.get(e.id)?.map((child) => renderCard(child, true, e))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
