import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CXCard from "../CXCard";
import CXPill from "../CXPill";
import { PROJECTS, LOGS, EXPERIENCES } from "../../../data/content";
import type { Endorsement } from "../../../data/content";
import endorsementsData from "../../../data/endorsements.json";

const allEndorsements = endorsementsData as Endorsement[];
import type { ModalSibling } from "../../../types";
import MixedGrid from "../MixedGrid";
import Tap from "../../shared/Tap";
import { soundClick, soundHover } from "../../../context/SoundContext";

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

function getLangDistPct(langName: string): string | null {
  if (!PROJECTS.length) return null;
  const lower = langName.toLowerCase();
  const n = PROJECTS.length;
  const scores: Record<string, number> = {};
  for (const p of PROJECTS) {
    for (const [lang, { percent }] of Object.entries(p.languages)) {
      const k = lang.toLowerCase();
      scores[k] = (scores[k] ?? 0) + parseFloat(percent) / n;
    }
  }
  for (const a of LOGS) {
    for (const tag of a.tags ?? []) {
      const k = tag.toLowerCase();
      if (k in scores) scores[k] += 2;
    }
  }
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  if (!total || !(lower in scores)) return null;
  return (scores[lower] / total * 100).toFixed(1);
}

type Match = { kind: "language"; color: string } | { kind: "topic" } | null;
function matchSkill(name: string): Match {
  const lower = name.toLowerCase();
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

interface DCSkillGridProps {
  tag: string;
  filterType?: "topic" | "language";
  onOpen: (kind: "project" | "log", id: string, siblings: ModalSibling[]) => void;
  onOpenExperience?: (id: string) => void;
  onOpenSkill?: (id: string, filterType: "language" | "topic", color?: string) => void;
  onNavigateToService?: (serviceId: string) => void;
}

export default function DCSkillGrid({ tag, filterType = "topic", onOpen, onOpenExperience, onOpenSkill, onNavigateToService }: DCSkillGridProps) {
  const lower = tag.toLowerCase();

  const projects = PROJECTS
    .filter((p) =>
      filterType === "language"
        ? Object.keys(p.languages).some((l) => l.toLowerCase() === lower)
        : p.topics.some((t) => t.toLowerCase() === lower)
    )
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));

  const logs = LOGS
    .filter((a) => a.tags?.some((t) => t.toLowerCase() === lower))
    .sort((a, b) => b.date.localeCompare(a.date));

  const projectSiblings: ModalSibling[] = projects.map(p => ({ kind: "project", id: p.id }));
  const logSiblings: ModalSibling[] = logs.map(a => ({ kind: "log", id: a.id }));
  const total = projects.length + logs.length;

  const experiences = EXPERIENCES.filter((e) => e.skills?.some((s) => s.toLowerCase() === lower));
  const endorsements = allEndorsements.filter((e) => e.skills?.some((s) => s.toLowerCase() === lower));

  // Derive years from actual skill-relevant commit/log dates, not pushedAt
  const allYears = new Set<number>();
  for (const a of logs) allYears.add(parseInt(a.date.slice(0, 4)));
  for (const p of projects) {
    const dates = filterType === "language"
      ? (Object.entries(p.commitsByLanguage).find(([l]) => l.toLowerCase() === lower)?.[1] ?? [])
      : p.allCommitDates;
    for (const iso of dates) allYears.add(parseInt(iso.slice(0, 4)));
  }
  const years = [...allYears].sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearHovered, setYearHovered] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [cellTooltip, setCellTooltip] = useState<{ x: number; y: number; iso: string; projCount: number; logCount: number; color: string } | null>(null);
  useEffect(() => { setSelectedYear(null); setYearHovered(false); setSelectedDate(null); setCellTooltip(null); }, [tag]);
  useEffect(() => { setSelectedDate(null); setCellTooltip(null); }, [selectedYear]);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = heatmapScrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => { el.scrollLeft = el.scrollWidth; });
    return () => cancelAnimationFrame(raf);
  }, [tag, selectedYear]);

  if (total === 0 && experiences.length === 0 && endorsements.length === 0) {
    return (
      <p style={{ fontSize: 14, color: "var(--ink-mute)", margin: 0 }}>
        No entries tagged with this skill.
      </p>
    );
  }

  // Year + date filtered subsets for cards and stats
  const filteredProjects = projects
    .filter((p) => {
      if (!selectedYear) return true;
      const dates = filterType === "language"
        ? (Object.entries(p.commitsByLanguage).find(([l]) => l.toLowerCase() === lower)?.[1] ?? [])
        : p.allCommitDates;
      return dates.some((iso) => iso.startsWith(String(selectedYear)));
    })
    .filter((p) => {
      if (!selectedDate) return true;
      const dates = filterType === "language"
        ? (Object.entries(p.commitsByLanguage).find(([l]) => l.toLowerCase() === lower)?.[1] ?? [])
        : p.allCommitDates;
      return dates.includes(selectedDate);
    });
  const filteredLogs = logs
    .filter((a) => !selectedYear || a.date.slice(0, 4) === String(selectedYear))
    .filter((a) => !selectedDate || a.date.replace(/\./g, "-") === selectedDate);

  const totalCommits = filteredProjects.reduce((sum, p) => {
    const dates = filterType === "language"
      ? (Object.entries(p.commitsByLanguage).find(([l]) => l.toLowerCase() === lower)?.[1] ?? [])
      : p.allCommitDates;
    return sum + dates.filter((iso) => {
      if (selectedYear && !iso.startsWith(String(selectedYear))) return false;
      if (selectedDate && iso !== selectedDate) return false;
      return true;
    }).length;
  }, 0);

  const allActiveProjects = PROJECTS.filter((p) => {
    if (selectedDate) return p.allCommitDates.includes(selectedDate);
    if (selectedYear) return p.allCommitDates.some((iso) => iso.startsWith(String(selectedYear)));
    return true;
  });
  const allActiveLogs = LOGS.filter((a) => {
    const iso = a.date.replace(/\./g, "-");
    if (selectedDate) return iso === selectedDate;
    if (selectedYear) return iso.startsWith(String(selectedYear));
    return true;
  });
  const plDenom = allActiveProjects.length + allActiveLogs.length;
  const plPct = plDenom > 0 ? ((filteredProjects.length + filteredLogs.length) / plDenom * 100) : 0;

  const totalAllCommits = PROJECTS.reduce((s, p) => {
    const dates = p.allCommitDates.filter((iso) => {
      if (selectedDate) return iso === selectedDate;
      if (selectedYear) return iso.startsWith(String(selectedYear));
      return true;
    });
    return s + dates.length;
  }, 0);
  const commitPct = totalAllCommits > 0 ? (totalCommits / totalAllCommits * 100) : 0;

  const totalAllLogs = allActiveLogs.length;
  const logPct = totalAllLogs > 0 ? (filteredLogs.length / totalAllLogs * 100) : 0;

  // Heatmap — 52 weeks × 7 days, weeks as columns, days as rows (Sun=0 … Sat=6)
  const today = new Date();
  const toIso = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayIso = toIso(today);

  // When a year is selected, anchor to the Sunday of the week containing Jan 1 of that year.
  // When "All", anchor to the current week.
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

  const logDateCount = new Map<string, number>();
  for (const a of logs) {
    const iso = a.date.replace(/\./g, "-");
    logDateCount.set(iso, (logDateCount.get(iso) ?? 0) + 1);
  }
  const projDateCount = new Map<string, number>();
  for (const p of projects) {
    const dates = filterType === "language"
      ? (Object.entries(p.commitsByLanguage).find(([l]) => l.toLowerCase() === lower)?.[1] ?? [])
      : p.allCommitDates;
    for (const iso of dates) {
      projDateCount.set(iso, (projDateCount.get(iso) ?? 0) + 1);
    }
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

  const maxCount = Math.max(1, ...grid.flat().map((c) => c.count));
  const langPct = filterType === "language" ? getLangDistPct(tag) : null;
  const showYearTabs = years.length > 0;

  return (
    <>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Stats + heatmap */}
      {total > 0 && <CXCard style={{ padding: 20, borderRadius: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div className="cx-skill-activity-meta" style={{ display: "flex", alignItems: "baseline", gap: 10, flexShrink: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 600, flexShrink: 0 }}>{tag} activity</div>
            <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {[
                filteredProjects.length ? `${filteredProjects.length} project${filteredProjects.length !== 1 ? "s" : ""}` : "",
                filteredLogs.length     ? `${filteredLogs.length} log${filteredLogs.length !== 1 ? "s" : ""}` : "",
                totalCommits            ? `${totalCommits} commit${totalCommits !== 1 ? "s" : ""}` : "",
              ].filter(Boolean).join(" · ")}
            </span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {selectedDate && (
              <>
                <span
                  className="pw-mono"
                  style={{
                    fontSize: 10, padding: "5px 10px", borderRadius: 2,
                    background: "rgba(var(--section-rgb), 0.55)",
                    color: "rgba(0,0,0,0.82)",
                    fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase()}
                </span>
                <Tap
                  as="button"
                  onClick={() => { soundClick(); setSelectedDate(null); }}
                  className="pw-mono cx-proj-btn"
                  style={{
                    fontSize: 10, padding: "5px 10px", borderRadius: 2,
                    background: "rgba(255,255,255,0.08)", color: "var(--ink-mute)",
                    fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    border: "none", cursor: "pointer",
                    transition: "background .15s, color .15s",
                  }}
                >
                  clear ×
                </Tap>
              </>
            )}

          {showYearTabs && (
            <div>
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setYearHovered(true)}
              onMouseLeave={() => setYearHovered(false)}
            >
              <Tap
                as="button"
                className="pw-mono cx-proj-btn"
                style={{
                  fontSize: 10, padding: "5px 10px", borderRadius: 2,
                  background: selectedYear !== null ? "var(--section-accent)" : yearHovered ? "rgba(var(--section-rgb), 0.42)" : "rgba(var(--section-rgb), 0.30)",
                  color: selectedYear !== null ? "rgba(0,0,0,0.82)" : "var(--ink)",
                  fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  border: "none", cursor: "pointer",
                  transition: "background .15s, color .15s",
                }}
              >
                {selectedYear ?? "All"}
                <span style={{ marginLeft: 5, opacity: 0.65 }}>{years.length}</span>
              </Tap>

              {yearHovered && (
                <>
                  <div style={{ position: "absolute", top: "100%", left: -4, right: -4, height: 8 }} />
                  <div
                    className="pw-glass cx-filter-panel"
                    style={{
                      position: "absolute", top: "calc(100% + 5px)", right: 0, zIndex: 50,
                      borderRadius: 6, padding: "8px",
                      display: "flex", flexDirection: "column", gap: 4, minWidth: 90,
                    }}
                  >
                    <Tap
                      as="button"
                      onClick={() => { soundClick(); setSelectedYear(null); }}
                      className="pw-mono cx-proj-btn"
                      style={{
                        fontSize: 9, padding: "4px 8px", borderRadius: 2,
                        background: selectedYear === null ? "rgba(var(--section-rgb), 0.55)" : "rgba(var(--section-rgb), 0.22)",
                        color: selectedYear === null ? "rgba(0,0,0,0.82)" : "var(--ink-soft)",
                        fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                        border: "none", cursor: "pointer",
                        transition: "background .15s, color .15s",
                      }}
                    >
                      All
                    </Tap>
                    {years.map((y) => (
                      <Tap
                        key={y}
                        as="button"
                        onClick={() => { soundClick(); setSelectedYear(y); }}
                        className="pw-mono cx-proj-btn"
                        style={{
                          fontSize: 9, padding: "4px 8px", borderRadius: 2,
                          background: selectedYear === y ? "rgba(var(--section-rgb), 0.55)" : "rgba(var(--section-rgb), 0.22)",
                          color: selectedYear === y ? "rgba(0,0,0,0.82)" : "var(--ink-soft)",
                          fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                          border: "none", cursor: "pointer",
                          transition: "background .15s, color .15s",
                        }}
                      >
                        {y}
                      </Tap>
                    ))}
                  </div>
                </>
              )}
            </div>
            </div>
          )}
          </div>
        </div>

        <div className="cx-skill-activity-body" style={{ display: "flex", gap: 20, alignItems: "center" }}>

          {/* Distribution bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {[
              { label: "ALL PROJECTS + LOGS", n: filteredProjects.length + filteredLogs.length, t: plDenom,         pct: plPct,    show: true },
              { label: "COMMITS",             n: totalCommits,                                  t: totalAllCommits, pct: commitPct, show: totalCommits > 0 },
              { label: "LOGS",                n: filteredLogs.length,                           t: totalAllLogs,    pct: logPct,    show: filteredLogs.length > 0 },
            ].filter(r => r.show).map(({ label, n, t, pct }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="pw-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink-mute)" }}>
                    {n} / {t} {label}
                  </span>
                  <span className="pw-mono" style={{ fontSize: 9, color: "var(--ink-mute)" }}>{pct.toFixed(1)}%</span>
                </div>
                <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: "var(--section-accent)", borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>

          <div ref={heatmapScrollRef} style={{ overflowX: "auto", display: "flex", justifyContent: "center" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `20px repeat(${WEEKS}, ${CELL}px)`,
            gridTemplateRows: `14px repeat(7, ${CELL}px)`,
            columnGap: GAP,
            rowGap: GAP,
          }}>
            <div /> {/* corner */}
            {grid.map((_, w) => (
              <div key={`m${w}`} className="pw-mono" style={{
                fontSize: 9, color: "var(--ink-mute)", letterSpacing: "0.05em",
                lineHeight: "14px", overflow: "visible", whiteSpace: "nowrap",
              }}>
                {monthLabels.has(w) ? monthLabels.get(w)!.toUpperCase() : ""}
              </div>
            ))}
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
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
                      onMouseEnter={cell.count ? (e) => { soundHover(); const color = getComputedStyle(e.currentTarget).getPropertyValue("--section-accent").trim() || "#c8d4e4"; setCellTooltip({ x: e.clientX, y: e.clientY, iso: cell.iso, projCount: cell.projCount, logCount: cell.logCount, color }); } : undefined}
                      onMouseMove={cell.count ? (e) => setCellTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : prev) : undefined}
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
        </div>
      </CXCard>}

      {/* Endorsements */}
      {endorsements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="cx-skill-2col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", columnGap: 12, rowGap: 10 }}>
            {endorsements.map((e) => (
              <CXCard key={e.id} className={e.service && onNavigateToService ? "cx-card" : undefined}
                style={{ borderRadius: 14, display: "block", overflow: "hidden", cursor: e.service && onNavigateToService ? "pointer" : "default" }}
                onClick={e.service && onNavigateToService ? () => { soundClick(); onNavigateToService(e.service!); } : undefined}
              >
                {e.photo && (
                  <img
                    src={e.photo} alt={e.name}
                    style={{ float: "left", width: 72, height: 72, margin: "16px 14px 2px 16px", borderRadius: "20px 4px 20px 4px", objectFit: "cover", objectPosition: "center top" }}
                  />
                )}
                <div style={{ display: "block", padding: "14px 16px 16px" }}>
                  <p style={{ fontSize: 12, lineHeight: 1.7, color: "var(--ink)", margin: 0, fontStyle: "italic" }}>
                    "{e.pullQuote ?? e.quote}"
                  </p>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 8 }}>
                    <span style={{ marginRight: 5, color: "var(--ink-mute)" }}>—</span>
                    <span style={{ fontWeight: 600 }}>{e.name}</span>
                    {e.role && <span style={{ color: "var(--ink-mute)" }}> · {e.role}</span>}
                    {e.org  && <span style={{ color: "var(--ink-mute)" }}> · {e.org}</span>}
                  </div>
                  {(e.skills?.length ?? 0) > 0 && (() => {
                    const pill = (e.skills ?? []).filter((s) => matchSkill(s) !== null);
                    const plain = (e.skills ?? []).filter((s) => matchSkill(s) === null);
                    return (
                      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: 8 }}>
                        {pill.map((skill) => {
                          const match = matchSkill(skill)!;
                          return (
                            <CXPill key={skill} size="sm"
                              onClick={() => { onOpenSkill?.(skill, match.kind === "language" ? "language" : "topic", match.kind === "language" ? match.color : undefined); }}>
                              {skill}
                            </CXPill>
                          );
                        })}
                        {pill.length > 0 && plain.length > 0 && <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>}
                        {plain.map((s, i) => (
                          <React.Fragment key={s}>
                            {i > 0 && <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>}
                            <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.04em" }}>{s}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </CXCard>
            ))}
          </div>
        </div>
      )}

      {/* Experiences */}
      {experiences.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <span className="pw-mono" style={{ fontSize: 11, color: "var(--section-deep)", letterSpacing: "0.16em" }}>
            {`${experiences.length} ${experiences.length === 1 ? "EXPERIENCE" : "EXPERIENCES"}`}
          </span>
          {experiences.map((exp) => (
            <Tap
              key={exp.id}
              className="pw-glass-dim cx-card cx-training-row"
              style={{
                padding: "18px 22px", borderRadius: 16,
                borderLeft: "4px solid var(--section-accent)",
                display: "grid", gridTemplateColumns: "100px 1fr auto",
                gap: 18, alignItems: "start", cursor: "pointer",
              }}
              onClick={() => { soundClick(); onOpenExperience?.(exp.id); }}
            >
              <span className="pw-mono" style={{ fontSize: 12, color: "var(--section-deep)", fontWeight: 600, letterSpacing: "0.08em", paddingTop: 2 }}>
                {exp.period}
              </span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{exp.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>{exp.description}</div>
                {(exp.skills?.length ?? 0) > 0 && (() => {
                  const pill = exp.skills!.filter((s) => matchSkill(s) !== null);
                  const plain = exp.skills!.filter((s) => matchSkill(s) === null);
                  return (
                    <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: 8 }}>
                      {pill.map((skill) => {
                        const match = matchSkill(skill)!;
                        return (
                          <CXPill key={skill} size="sm"
                            onClick={() => { onOpenSkill?.(skill, match.kind === "language" ? "language" : "topic", match.kind === "language" ? match.color : undefined); }}>
                            {skill}
                          </CXPill>
                        );
                      })}
                      {pill.length > 0 && plain.length > 0 && <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>}
                      {plain.map((s, i) => (
                        <React.Fragment key={s}>
                          {i > 0 && <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>}
                          <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.04em" }}>{s}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <span style={{ fontSize: 13, color: "var(--ink-mute)", alignSelf: "start", paddingTop: 2 }}>{exp.organization}</span>
            </Tap>
          ))}
        </div>
      )}

      {total > 0 && <div style={{ marginTop: 12 }}><MixedGrid
        projects={filteredProjects}
        logs={filteredLogs}
        onOpenProject={(id) => onOpen("project", id, projectSiblings)}
        onOpenLog={(id) => onOpen("log", id, logSiblings)}
        animated
        resetKey={tag}
        showLabel
        labelSuffix={`WITH ${tag.toUpperCase()}`}
      /></div>}
    </div>
    {cellTooltip && createPortal(
      <div className="pw-mono" style={{
        position: "fixed",
        left: cellTooltip.x + 14,
        top: cellTooltip.y - 48,
        zIndex: 9999,
        pointerEvents: "none",
        background: "rgba(14,18,26,0.96)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 6,
        padding: "6px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 3,
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
