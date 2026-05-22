import React, { useState, useRef, useEffect } from "react";
import CXCard from "../CXCard";
import CXPill from "../CXPill";
import { PROJECTS, LOGS, SKILLS, EXPERIENCES } from "../../../data/content";
import type { Endorsement } from "../../../data/content";
import endorsementsData from "../../../data/endorsements.json";

const allEndorsements = endorsementsData as Endorsement[];
import type { ModalState } from "../../../types";
import Tap from "../../shared/Tap";

type FilterMode = "pl" | "commits" | "logs";

interface DCSkillsProps {
  openModal: (m: ModalState) => void;
}

type Match =
  | { kind: "language"; color: string }
  | { kind: "topic" }
  | null;

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

function aggregateLanguages(mode: FilterMode) {
  if (mode === "commits") {
    const totals: Record<string, { count: number; color: string }> = {};
    for (const p of PROJECTS) {
      for (const [lang, dates] of Object.entries(p.commitsByLanguage ?? {})) {
        const color = Object.entries(p.languages).find(([l]) => l.toLowerCase() === lang.toLowerCase())?.[1]?.color
          ?? PROJECTS.flatMap(proj => Object.entries(proj.languages)).find(([l]) => l.toLowerCase() === lang.toLowerCase())?.[1]?.color
          ?? "#888";
        if (!totals[lang]) totals[lang] = { count: 0, color };
        totals[lang].count += dates.length;
      }
    }
    const total = Object.values(totals).reduce((s, v) => s + v.count, 0) || 1;
    return Object.entries(totals)
      .map(([lang, { count, color }]) => ({ lang, color, percent: (count / total * 100).toFixed(1) }))
      .filter(r => parseFloat(r.percent) > 0)
      .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
  }

  if (mode === "logs") {
    const totals: Record<string, { count: number; color: string }> = {};
    for (const a of LOGS) {
      for (const tag of a.tags ?? []) {
        const langEntry = PROJECTS.flatMap(p => Object.entries(p.languages))
          .find(([l]) => l.toLowerCase() === tag.toLowerCase());
        if (!langEntry) continue;
        const [lang, { color }] = langEntry;
        if (!totals[lang]) totals[lang] = { count: 0, color };
        totals[lang].count++;
      }
    }
    const total = Object.values(totals).reduce((s, v) => s + v.count, 0) || 1;
    return Object.entries(totals)
      .map(([lang, { count, color }]) => ({ lang, color, percent: (count / total * 100).toFixed(1) }))
      .filter(r => parseFloat(r.percent) > 0)
      .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
  }

  // P+L (default)
  const totals: Record<string, { sum: number; color: string; articleCount: number }> = {};
  const n = PROJECTS.length;
  for (const p of PROJECTS) {
    for (const [lang, { percent, color }] of Object.entries(p.languages)) {
      if (!totals[lang]) totals[lang] = { sum: 0, color, articleCount: 0 };
      totals[lang].sum += parseFloat(percent);
    }
  }
  for (const a of LOGS) {
    for (const tag of a.tags ?? []) {
      const entry = Object.entries(totals).find(([l]) => l.toLowerCase() === tag.toLowerCase());
      if (entry) entry[1].articleCount += 1;
    }
  }
  const articleBoost = 2;
  const result = Object.entries(totals).map(([lang, { sum, color, articleCount }]) => ({
    lang, color, score: sum / n + articleCount * articleBoost,
  }));
  const total = result.reduce((acc, r) => acc + r.score, 0);
  return result
    .map(r => ({ lang: r.lang, color: r.color, percent: (r.score / total * 100).toFixed(1) }))
    .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
}

function aggregateTopics(mode: FilterMode) {
  const allSkillItems = new Set(SKILLS.flatMap(g => g.items.map(s => s.toLowerCase())));
  const counts: Record<string, { label: string; projects: number; articles: number; commits: number }> = {};

  for (const p of PROJECTS) {
    for (const t of p.topics) {
      if (!allSkillItems.has(t.toLowerCase())) continue;
      const isLang = Object.keys(p.languages).some(l => l.toLowerCase() === t.toLowerCase());
      if (isLang) continue;
      const key = t.toLowerCase();
      if (!counts[key]) counts[key] = { label: t, projects: 0, articles: 0, commits: 0 };
      counts[key].projects++;
      counts[key].commits += (p.allCommitDates ?? []).length;
    }
  }

  for (const a of LOGS) {
    for (const t of a.tags ?? []) {
      const key = t.toLowerCase();
      if (!allSkillItems.has(key)) continue;
      const isLang = PROJECTS.some(p => Object.keys(p.languages).some(l => l.toLowerCase() === key));
      if (isLang) continue;
      if (!counts[key]) counts[key] = { label: t, projects: 0, articles: 0, commits: 0 };
      counts[key].articles++;
    }
  }

  const getValue = (c: typeof counts[string]) =>
    mode === "commits" ? c.commits : mode === "logs" ? c.articles : c.projects + c.articles;

  return Object.values(counts)
    .filter(c => getValue(c) > 0)
    .sort((a, b) => getValue(b) - getValue(a))
    .map(c => ({ ...c, value: getValue(c) }));
}

const MODE_LABELS: Record<FilterMode, string> = { pl: "ALL", commits: "COMMITS", logs: "LOGS" };
const MODE_SUBTITLE: Record<FilterMode, string> = { pl: "All projects & logs", commits: "Weighted by commits", logs: "Logs only" };

function FilterDropdown({ mode, setMode, hovered, setHovered }: {
  mode: FilterMode; setMode: (m: FilterMode) => void;
  hovered: boolean; setHovered: (v: boolean) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hovered) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setHovered(false);
      }
    }
    document.addEventListener("click", onDoc, { capture: true });
    return () => document.removeEventListener("click", onDoc, { capture: true });
  }, [hovered]);

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); setHovered(!hovered); }}
    >
      <CXPill
        size="lg" variant="primary"
        active={mode !== "pl"} hovered={hovered}
        style={{ cursor: "pointer" }}
      >
        {MODE_LABELS[mode]}
      </CXPill>
      {hovered && (
        <>
          <div style={{ position: "absolute", top: "100%", left: -4, right: -4, height: 8 }} />
          <div className="pw-glass cx-filter-panel" style={{
            position: "absolute", top: "calc(100% + 5px)", right: 0, zIndex: 50,
            borderRadius: 6, padding: 8,
            display: "flex", flexDirection: "column", gap: 4, minWidth: 110,
          }}>
            {(["pl", "commits", "logs"] as const).map(m => (
              <CXPill
                key={m}
                size="sm" variant="secondary"
                active={mode === m}
                onClick={() => { setMode(m); setHovered(false); }}
              >
                {MODE_LABELS[m]}
              </CXPill>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DCSkills({ openModal }: DCSkillsProps) {
  const [langMode,    setLangMode]    = useState<FilterMode>("pl");
  const [langHovered, setLangHovered] = useState(false);
  const [topicMode,    setTopicMode]    = useState<FilterMode>("pl");
  const [topicHovered, setTopicHovered] = useState(false);

  const langs    = aggregateLanguages(langMode);
  const topics   = aggregateTopics(topicMode);
  const topicMax = topics[0]?.value ?? 1;

  return (
    <div className="cx-skills-top-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

      {/* Language Distribution — full width */}
      <CXCard style={{ gridColumn: "1 / -1", padding: 20, borderRadius: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>Language Distribution</div>
            <div className="pw-eyebrow" style={{ color: "var(--ink-mute)", marginTop: 3 }}>{MODE_SUBTITLE[langMode]}</div>
          </div>
          <FilterDropdown mode={langMode} setMode={setLangMode} hovered={langHovered} setHovered={setLangHovered} />
        </div>
        {langs.length > 0 ? (
          <>
            <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", gap: 1 }}>
              {langs.map(({ lang, color, percent }) => (
                <div key={lang} style={{ width: `${percent}%`, background: color, minWidth: 3 }} />
              ))}
            </div>
            <div className="cx-skills-lang-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "6px 16px" }}>
              {langs.map(({ lang, color, percent }) => (
                <Tap
                  key={lang}
                  className="cx-lang-item"
                  onClick={() => openModal({ kind: "skill", id: lang, filterType: "language", color })}
                  style={{ "--lang-color": color, display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", cursor: "pointer" } as React.CSSProperties}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1 }}>{lang}</span>
                  <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{percent}%</span>
                </Tap>
              ))}
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: 0 }}>No data for this filter.</p>
        )}
      </CXCard>

      {/* Skill Coverage — full width */}
      {topics.length > 0 && (
        <CXCard style={{ gridColumn: "1 / -1", padding: 20, borderRadius: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Skill Coverage</div>
              <div className="pw-eyebrow" style={{ color: "var(--ink-mute)", marginTop: 3 }}>{MODE_SUBTITLE[topicMode]}</div>
            </div>
            <FilterDropdown mode={topicMode} setMode={setTopicMode} hovered={topicHovered} setHovered={setTopicHovered} />
          </div>
          <div className="cx-skills-topic-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "6px 24px" }}>
            {topics.map(({ label, projects, articles, commits, value }) => {
              const pct = value / topicMax * 100;
              const countLabel = topicMode === "commits"
                ? `${commits}`
                : topicMode === "logs"
                  ? (articles > 0 ? `${articles}L` : "")
                  : `${projects > 0 ? `${projects}P` : ""}${projects > 0 && articles > 0 ? " · " : ""}${articles > 0 ? `${articles}L` : ""}`;
              return (
                <Tap
                  key={label}
                  className="cx-toc-item"
                  onClick={() => openModal({ kind: "skill", id: label, filterType: "topic" })}
                  style={{ display: "flex", flexDirection: "column", gap: 4, padding: "6px 8px", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="pw-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{label.toUpperCase()}</span>
                    <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>{countLabel}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--section-accent)", borderRadius: 999 }} />
                  </div>
                </Tap>
              );
            })}
          </div>
        </CXCard>
      )}

      {/* Skill category boxes */}
      {SKILLS.map((g) => {
        const matched = g.items.filter((s) => matchSkill(s) !== null);
        const unmatched = g.items.filter((s) => matchSkill(s) === null);
        return (
          <CXCard key={g.label} style={{ padding: 20, borderRadius: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{g.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {matched.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {matched.map((s) => {
                    const match = matchSkill(s)!;
                    const isLang = match.kind === "language";
                    return (
                      <CXPill
                        key={s}
                        color={isLang ? match.color : undefined}
                        variant={isLang ? "secondary" : "css"}
                        className={isLang ? undefined : "cx-skill-pill"}
                        onClick={() => openModal({
                          kind: "skill",
                          id: s,
                          filterType: isLang ? "language" : "topic",
                          color: isLang ? match.color : undefined,
                        })}
                      >
                        {s}
                      </CXPill>
                    );
                  })}
                </div>
              )}
              {matched.length > 0 && unmatched.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "2px 0" }} />
              )}
              {unmatched.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px" }}>
                  {unmatched.map((s, i) => (
                    <span key={s} className="pw-mono" style={{ fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.04em" }}>
                      {i > 0 && <span style={{ marginRight: 10, opacity: 0.55 }}>·</span>}{s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CXCard>
        );
      })}
    </div>
  );
}
