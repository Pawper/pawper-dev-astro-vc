import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CXCard from "../CXCard";
import CXPill from "../CXPill";
import { PROJECTS, LOGS, ALL_EXPERIENCES } from "../../../data/content";
import type { Experience } from "../../../data/content";
import type { ModalState, ModalSibling } from "../../../types";
import MixedGrid from "../MixedGrid";
import ExperienceCardRow from "./ExperienceCardRow";
import Tap from "../../shared/Tap";
import { soundClick, soundHover } from "../../../context/SoundContext";

/** Year span an experience was active, from its dated start or its free-form
 *  `period` (e.g. "2019–2022" → [2019, 2022], "Feb 2026" → [2026, 2026]). */
function expYearRange(e: Experience): [number, number] | null {
  if (e.datetimeStart) {
    const y = parseInt(e.datetimeStart.slice(0, 4));
    return [y, y];
  }
  const yrs = (e.period ?? "").match(/\d{4}/g)?.map(Number);
  if (!yrs?.length) return null;
  return [Math.min(...yrs), Math.max(...yrs)];
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** A YYYY-MM-DD sort key for reverse-chronological ordering, mixing dated agenda
 *  events with free-form-period experiences. Agenda events use their start date;
 *  "Mon YYYY" periods resolve to that month; bare year ranges anchor to the end
 *  of their most recent year (a multi-year role's recency). */
function expSortKey(e: Experience): string {
  if (e.datetimeStart) return e.datetimeStart;
  const period = e.period ?? "";
  const monthMatch = period.match(/([A-Za-z]{3,})\s+(\d{4})\s*$/);
  if (monthMatch) {
    const mi = MONTHS.indexOf(monthMatch[1].slice(0, 3).toLowerCase());
    if (mi >= 0) return `${monthMatch[2]}-${String(mi + 1).padStart(2, "0")}-15`;
  }
  const year = period.match(/(\d{4})[^0-9]*$/)?.[1];
  return year ? `${year}-12-31` : "0000";
}

const WEEKS = 52;
const CELL = 9;
const GAP = 2;
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const SHOW_DAY = new Set([1, 3, 5]);

function cellBg(count: number, isFuture: boolean, maxCount: number): string {
  if (isFuture) return "rgba(255,255,255,0.025)";
  if (count === 0) return "rgba(255,255,255,0.07)";
  const opacity = 0.3 + (count / maxCount) * 0.7;
  return `rgba(var(--section-rgb), ${opacity.toFixed(2)})`;
}

interface DCActivityProps {
  openModal: (m: ModalState) => void;
}

export default function DCActivity({ openModal }: DCActivityProps) {
  const today = new Date();
  const toIso = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayIso = toIso(today);

  // Build date maps from all portfolio data
  const projDateCount = new Map<string, number>();
  for (const p of PROJECTS) {
    for (const iso of p.allCommitDates ?? []) {
      projDateCount.set(iso, (projDateCount.get(iso) ?? 0) + 1);
    }
  }
  const logDateCount = new Map<string, number>();
  for (const a of LOGS) {
    const iso = a.date.replace(/\./g, "-");
    logDateCount.set(iso, (logDateCount.get(iso) ?? 0) + 1);
  }

  // Years from actual commit + log dates
  const allYears = new Set<number>();
  for (const iso of projDateCount.keys()) allYears.add(parseInt(iso.slice(0, 4)));
  for (const iso of logDateCount.keys()) allYears.add(parseInt(iso.slice(0, 4)));
  const years = [...allYears].sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearHovered, setYearHovered] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expExpanded, setExpExpanded] = useState(false);
  const [cellTooltip, setCellTooltip] = useState<{
    x: number; y: number; iso: string; projCount: number; logCount: number; color: string;
  } | null>(null);

  useEffect(() => { setSelectedDate(null); setCellTooltip(null); setExpExpanded(false); }, [selectedYear]);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = heatmapScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollLeft = el.scrollWidth; });
  }, [selectedYear]);

  // Filtered card lists
  const filteredProjectItems = PROJECTS
    .filter(p => {
      const dates = p.allCommitDates ?? [];
      if (selectedDate) return dates.includes(selectedDate);
      if (selectedYear) return dates.some(iso => iso.startsWith(String(selectedYear)));
      return dates.length > 0;
    })
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));

  const filteredLogItems = LOGS
    .filter(a => {
      const iso = a.date.replace(/\./g, "-");
      if (selectedDate) return iso === selectedDate;
      if (selectedYear) return iso.startsWith(String(selectedYear));
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const filteredExperiences = ALL_EXPERIENCES
    .filter(e => {
      if (selectedDate) return e.datetimeStart === selectedDate;
      if (selectedYear) {
        const r = expYearRange(e);
        return r ? selectedYear >= r[0] && selectedYear <= r[1] : false;
      }
      return true;
    })
    .sort((a, b) => expSortKey(b).localeCompare(expSortKey(a)));

  const projectSiblings: ModalSibling[] = filteredProjectItems.map(p => ({ kind: "project", id: p.id }));
  const logSiblings: ModalSibling[] = filteredLogItems.map(a => ({ kind: "log", id: a.id }));

  // Header stats
  const filteredCommits = [...projDateCount.entries()].reduce((sum, [iso, count]) => {
    if (selectedYear && !iso.startsWith(String(selectedYear))) return sum;
    if (selectedDate && iso !== selectedDate) return sum;
    return sum + count;
  }, 0);

  // Heatmap anchor
  let firstWeekSun: Date;
  if (selectedYear) {
    const jan1 = new Date(selectedYear, 0, 1);
    firstWeekSun = new Date(jan1);
    firstWeekSun.setDate(jan1.getDate() - jan1.getDay());
  } else {
    const currentWeekSun = new Date(today);
    currentWeekSun.setDate(today.getDate() - today.getDay());
    firstWeekSun = new Date(currentWeekSun);
    firstWeekSun.setDate(currentWeekSun.getDate() - 51 * 7);
  }

  const grid: Array<Array<{ iso: string; count: number; logCount: number; projCount: number; isFuture: boolean }>> = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: Array<{ iso: string; count: number; logCount: number; projCount: number; isFuture: boolean }> = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(firstWeekSun);
      date.setDate(firstWeekSun.getDate() + w * 7 + d);
      const iso = toIso(date);
      const logCount = logDateCount.get(iso) ?? 0;
      const projCount = projDateCount.get(iso) ?? 0;
      week.push({ iso, count: logCount + projCount, logCount, projCount, isFuture: iso > todayIso });
    }
    grid.push(week);
  }

  const monthLabels = new Map<number, string>();
  let lastMonth = -1;
  let lastLabelWeek = -99;
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(grid[w][0].iso + "T12:00:00");
    const m = d.getMonth();
    if (m !== lastMonth) {
      if (w - lastLabelWeek >= 3) {
        monthLabels.set(w, d.toLocaleString("en", { month: "short" }));
        lastLabelWeek = w;
      }
      lastMonth = m;
    }
  }

  const maxCount = Math.max(1, ...grid.flat().map(c => c.count));
  const showYearTabs = years.length > 0;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Heatmap card */}
        <CXCard style={{ padding: 20, borderRadius: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Row 1: title + stats + year filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 600, flexShrink: 0 }}>Activity</div>
              <span className="pw-mono cx-skill-activity-meta" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {[
                  filteredProjectItems.length ? `${filteredProjectItems.length} PROJECT${filteredProjectItems.length !== 1 ? "S" : ""}` : "",
                  filteredLogItems.length     ? `${filteredLogItems.length} LOG${filteredLogItems.length !== 1 ? "S" : ""}` : "",
                  filteredExperiences.length  ? `${filteredExperiences.length} EXPERIENCE${filteredExperiences.length !== 1 ? "S" : ""}` : "",
                  filteredCommits             ? `${filteredCommits} COMMIT${filteredCommits !== 1 ? "S" : ""}` : "",
                ].filter(Boolean).join(" · ")}
              </span>

              {showYearTabs && (
                <div
                  style={{ position: "relative", flexShrink: 0 }}
                  onMouseEnter={() => setYearHovered(true)}
                  onMouseLeave={() => setYearHovered(false)}
                >
                  <Tap as="button" className="pw-mono cx-proj-btn" style={{
                    fontSize: 10, padding: "5px 10px", borderRadius: 2,
                    background: selectedYear !== null ? "var(--section-accent)" : yearHovered ? "rgba(var(--section-rgb), 0.42)" : "rgba(var(--section-rgb), 0.30)",
                    color: selectedYear !== null ? "rgba(0,0,0,0.82)" : "var(--ink)",
                    fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    border: "none", cursor: "pointer", transition: "background .15s, color .15s",
                  }}>
                    {selectedYear ?? "All"}
                    <span style={{ marginLeft: 5, opacity: 0.65 }}>{years.length}</span>
                  </Tap>

                  {yearHovered && (
                    <>
                      <div style={{ position: "absolute", top: "100%", left: -4, right: -4, height: 8 }} />
                      <div className="pw-glass cx-filter-panel" style={{
                        position: "absolute", top: "calc(100% + 5px)", right: 0, zIndex: 50,
                        borderRadius: 6, padding: "8px",
                        display: "flex", flexDirection: "column", gap: 4, minWidth: 90,
                      }}>
                        <Tap as="button"
                          onClick={() => { soundClick(); setSelectedYear(null); }}
                          className="pw-mono cx-proj-btn"
                          style={{
                            fontSize: 9, padding: "4px 8px", borderRadius: 2,
                            background: selectedYear === null ? "rgba(var(--section-rgb), 0.55)" : "rgba(var(--section-rgb), 0.22)",
                            color: selectedYear === null ? "rgba(0,0,0,0.82)" : "var(--ink-soft)",
                            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                            border: "none", cursor: "pointer", transition: "background .15s, color .15s",
                          }}
                        >All</Tap>
                        {years.map(y => (
                          <Tap key={y} as="button"
                            onClick={() => { soundClick(); setSelectedYear(y); }}
                            className="pw-mono cx-proj-btn"
                            style={{
                              fontSize: 9, padding: "4px 8px", borderRadius: 2,
                              background: selectedYear === y ? "rgba(var(--section-rgb), 0.55)" : "rgba(var(--section-rgb), 0.22)",
                              color: selectedYear === y ? "rgba(0,0,0,0.82)" : "var(--ink-soft)",
                              fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                              border: "none", cursor: "pointer", transition: "background .15s, color .15s",
                            }}
                          >{y}</Tap>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Row 2: selected date badge + clear (only when a date is active) */}
            {selectedDate && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="pw-mono" style={{
                  fontSize: 10, padding: "5px 10px", borderRadius: 2,
                  background: "rgba(var(--section-rgb), 0.55)", color: "rgba(0,0,0,0.82)",
                  fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap",
                }}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                </span>
                <Tap as="button"
                  onClick={() => { soundClick(); setSelectedDate(null); }}
                  className="pw-mono cx-proj-btn"
                  style={{
                    fontSize: 10, padding: "5px 10px", borderRadius: 2,
                    background: "rgba(255,255,255,0.08)", color: "var(--ink-mute)",
                    fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    border: "none", cursor: "pointer", transition: "background .15s, color .15s",
                  }}
                >clear ×</Tap>
              </div>
            )}
          </div>

          {/* Heatmap — centered */}
          <div ref={heatmapScrollRef} style={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: `20px repeat(${WEEKS}, ${CELL}px)`,
              gridTemplateRows: `14px repeat(7, ${CELL}px)`,
              columnGap: GAP,
              rowGap: GAP,
            }}>
              <div />
              {grid.map((_, w) => (
                <div key={`m${w}`} className="pw-mono" style={{
                  fontSize: 9, color: "var(--ink-mute)", letterSpacing: "0.05em",
                  lineHeight: "14px", overflow: "visible", whiteSpace: "nowrap",
                }}>
                  {monthLabels.has(w) ? monthLabels.get(w)!.toUpperCase() : ""}
                </div>
              ))}
              {[0, 1, 2, 3, 4, 5, 6].map(d => (
                <React.Fragment key={`d${d}`}>
                  <div className="pw-mono" style={{
                    fontSize: 9, color: "var(--ink-mute)", textAlign: "right",
                    lineHeight: `${CELL}px`, paddingRight: 4,
                  }}>
                    {SHOW_DAY.has(d) ? DAY_LABELS[d] : ""}
                  </div>
                  {grid.map((week, w) => {
                    const cell = week[d];
                    return (
                      <div
                        key={`${w}-${d}`}
                        onClick={cell.count ? () => { soundClick(); setSelectedDate(cell.iso === selectedDate ? null : cell.iso); } : undefined}
                        onMouseEnter={cell.count ? (e) => {
                          soundHover();
                          const color = getComputedStyle(e.currentTarget).getPropertyValue("--section-accent").trim() || "#e84455";
                          setCellTooltip({ x: e.clientX, y: e.clientY, iso: cell.iso, projCount: cell.projCount, logCount: cell.logCount, color });
                        } : undefined}
                        onMouseMove={cell.count ? (e) => setCellTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev) : undefined}
                        onMouseLeave={cell.count ? () => setCellTooltip(null) : undefined}
                        style={{
                          borderRadius: 2,
                          background: cellBg(cell.count, cell.isFuture, maxCount),
                          cursor: cell.count ? "pointer" : "default",
                          outline: cell.iso === selectedDate ? "1.5px solid var(--section-accent)" : "none",
                          outlineOffset: "1px",
                          filter: cell.iso === cellTooltip?.iso ? "brightness(1.4)" : "none",
                          transition: "filter 0.1s",
                        }}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CXCard>

        {filteredExperiences.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span className="pw-mono" style={{ fontSize: 11, color: "var(--section-deep)", letterSpacing: "0.16em" }}>
              {`${filteredExperiences.length} ${filteredExperiences.length === 1 ? "EXPERIENCE" : "EXPERIENCES"}`}
            </span>
            <div style={{
              display: "flex", flexDirection: "column", gap: 10,
              ...(filteredExperiences.length > 2 ? {
                maxHeight: expExpanded ? 9999 : 180,
                overflow: "hidden",
                transition: "max-height 0.6s cubic-bezier(.2,.7,.3,1)",
                WebkitMaskImage: expExpanded ? "none" : "linear-gradient(to bottom, black 40%, transparent 100%)",
                maskImage: expExpanded ? "none" : "linear-gradient(to bottom, black 40%, transparent 100%)",
              } : {}),
            }}>
              {filteredExperiences.map((exp) => (
                <ExperienceCardRow key={exp.id} exp={exp} openModal={openModal} />
              ))}
            </div>
            {/* bottom: 110 clears the reading panel's bottom scroll-fade so the
                pinned pill stays in the visible region — the modal's fade is
                smaller, hence its 60. */}
            {filteredExperiences.length > 2 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: expExpanded ? 0 : -14, ...(expExpanded ? { position: "sticky", bottom: 110 } : {}) }}>
                <CXPill size="md" onClick={() => { soundClick(); setExpExpanded(e => !e); }}>
                  {expExpanded ? "Show less" : `Show all ${filteredExperiences.length}`}
                </CXPill>
              </div>
            )}
          </div>
        )}

        <MixedGrid
          projects={filteredProjectItems}
          logs={filteredLogItems}
          onOpenProject={(id) => openModal({ kind: "project", id, siblings: projectSiblings })}
          onOpenLog={(id) => openModal({ kind: "log", id, siblings: logSiblings })}
          animated
          showLabel
        />

      </div>

      {cellTooltip && createPortal(
        <div className="pw-mono" style={{
          position: "fixed",
          left: cellTooltip.x <= window.innerWidth / 2 ? cellTooltip.x + 14 : undefined,
          right: cellTooltip.x > window.innerWidth / 2 ? window.innerWidth - cellTooltip.x + 14 : undefined,
          top: cellTooltip.y - 48,
          zIndex: 9999,
          pointerEvents: "none",
          background: "rgba(14,18,26,0.96)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 6,
          padding: "6px 10px",
          display: "flex", flexDirection: "column", gap: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.55)",
        }}>
          <span style={{ fontSize: 10, color: "rgba(160,175,200,0.8)", letterSpacing: "0.06em" }}>
            {new Date(cellTooltip.iso + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
          </span>
          <span style={{ fontSize: 11, color: cellTooltip.color, letterSpacing: "0.08em" }}>
            {[
              cellTooltip.projCount ? `${cellTooltip.projCount} COMMIT${cellTooltip.projCount !== 1 ? "S" : ""}` : "",
              cellTooltip.logCount  ? `${cellTooltip.logCount} LOG${cellTooltip.logCount !== 1 ? "S" : ""}` : "",
            ].filter(Boolean).join(" · ")}
          </span>
        </div>,
        document.body
      )}
    </>
  );
}
