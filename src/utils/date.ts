import { AGENDA_EVENTS } from "../data/content";

/** Default duration (minutes) assumed when an event has a parseable start `time`
 *  but no explicit end time. Used to compute "past" and "in-progress" status. */
export const EVENT_DEFAULT_DURATION_MIN = 120;

/** Formats an ISO date string (YYYY-MM-DD) as "Mon YYYY" (e.g. "Jun 2026"). */
export function fmtMonthYear(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Parses free-form event time strings like "6 PM", "4:30 PM", "9 AM", "13:00"
 *  into 24-hour { hour, minute }. Returns null when unparseable. */
export function parseEventTime(time?: string): { hour: number; minute: number } | null {
  if (!time) return null;
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const ampm = m[3]?.toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  else if (ampm === "AM" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/** Combines a YYYY-MM-DD date with an optional free-form time into a Date.
 *  Falls back to midnight when the time is missing or unparseable. */
export function eventStartDate(datetimeStart: string, time?: string): Date | null {
  if (!datetimeStart) return null;
  const [year, month, day] = datetimeStart.split("-").map(Number);
  const t = parseEventTime(time);
  return t
    ? new Date(year, month - 1, day, t.hour, t.minute)
    : new Date(year, month - 1, day);
}

/** Resolves the moment an event ends:
 *  - multi-day (datetimeEnd != datetimeStart) → end of day on datetimeEnd
 *  - single-day with parseable time → start + EVENT_DEFAULT_DURATION_MIN
 *  - all-day single-day → end of datetimeStart */
export function eventEndDate(datetimeStart: string, datetimeEnd: string | undefined, time?: string): Date | null {
  if (!datetimeStart) return null;
  if (datetimeEnd && datetimeEnd !== datetimeStart) {
    const [year, month, day] = datetimeEnd.split("-").map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }
  const t = parseEventTime(time);
  if (t) {
    const [year, month, day] = datetimeStart.split("-").map(Number);
    return new Date(year, month - 1, day, t.hour, t.minute + EVENT_DEFAULT_DURATION_MIN);
  }
  const [year, month, day] = datetimeStart.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

/** True when the event's end moment is before `now`. Time-aware when `time`
 *  is parseable; otherwise falls back to end-of-day comparison. */
export function isEventPast(datetimeStart: string, datetimeEnd: string | undefined, time: string | undefined, now: Date = new Date()): boolean {
  const end = eventEndDate(datetimeStart, datetimeEnd, time);
  return !!end && now > end;
}

/** True when `now` is between the event's start and end. Requires a parseable
 *  `time` — "in progress" isn't meaningful for all-day events. */
export function isEventInProgress(datetimeStart: string, datetimeEnd: string | undefined, time: string | undefined, now: Date = new Date()): boolean {
  if (!parseEventTime(time)) return false;
  const start = eventStartDate(datetimeStart, time);
  const end = eventEndDate(datetimeStart, datetimeEnd, time);
  if (!start || !end) return false;
  return now >= start && now <= end;
}

/**
 * Returns the display period for an experience.
 * If `period` is already set, returns it as-is.
 * Otherwise derives it from matching AGENDA_EVENTS by title:
 *   - single event / same month → "Jun 2026"
 *   - spanning range           → "Jun 2026 – Aug 2026"
 */
export function derivePeriod(title: string, period: string): string {
  if (period) return period;
  const matches = AGENDA_EVENTS
    .filter((e) => e.title === title && e.datetimeStart)
    .sort((a, b) => (a.datetimeStart ?? "").localeCompare(b.datetimeStart ?? ""));
  if (!matches.length) return "";
  const startStr = fmtMonthYear(matches[0].datetimeStart!);
  const endStr   = fmtMonthYear(matches[matches.length - 1].datetimeEnd ?? matches[matches.length - 1].datetimeStart!);
  return startStr === endStr ? startStr : `${startStr} – ${endStr}`;
}
