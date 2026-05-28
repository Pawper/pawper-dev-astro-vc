import { AGENDA_EVENTS } from "../data/content";

/** Formats an ISO date string (YYYY-MM-DD) as "Mon YYYY" (e.g. "Jun 2026"). */
export function fmtMonthYear(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", year: "numeric" });
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
