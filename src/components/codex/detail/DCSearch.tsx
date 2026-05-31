import React, { useState, useRef, useEffect } from "react";
import { PROJECTS, LOGS, SKILLS, SKILL_ALIASES, ALL_EXPERIENCES } from "../../../data/content";
import type { Endorsement } from "../../../data/content";
import endorsementsData from "../../../data/endorsements.json";

const allEndorsements = endorsementsData as Endorsement[];
import type { ModalSibling } from "../../../types";
import MixedGrid from "../MixedGrid";
import CXCard from "../CXCard";
import CXPill from "../CXPill";
import ExperienceCardRow from "./ExperienceCardRow";
import { soundClick } from "../../../context/SoundContext";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

type MatchedSkill = {
  name: string;
  category: string;
  filterType: "language" | "topic";
  color?: string;
  matchCount: number;
  total: number;
};

interface DCSearchProps {
  onOpen: (kind: "project" | "log" | "experience", id: string, siblings: ModalSibling[]) => void;
  onOpenSkill: (id: string, filterType: "language" | "topic", color?: string) => void;
  logsHtml: Record<string, string>;
  query: string;
}

export default function DCSearch({ onOpen, onOpenSkill, logsHtml, query }: DCSearchProps) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [resultsHeight, setResultsHeight] = useState(0);
  const [expExpanded, setExpExpanded] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const shouldAnimate = useRef(!query);

  useEffect(() => { shouldAnimate.current = true; }, []);
  useEffect(() => { setExpExpanded(false); }, [debouncedQuery]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const el = resultsRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setResultsHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const q = debouncedQuery.trim().toLowerCase();

  const matchedProjects = q.length < 2 ? [] : PROJECTS.filter((p) => {
    const body = stripHtml(p.readme ?? "").toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.topics.some((t) => t.toLowerCase().includes(q)) ||
      Object.keys(p.languages).some((l) => l.toLowerCase().includes(q)) ||
      body.includes(q)
    );
  });

  const matchedLogs = q.length < 2 ? [] : LOGS.filter((a) => {
    const body = stripHtml(logsHtml[a.id] ?? "").toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.kicker.toLowerCase().includes(q) ||
      a.tags?.some((t) => t.toLowerCase().includes(q)) ||
      a.series?.name.toLowerCase().includes(q) ||
      body.includes(q)
    );
  });

  const matchedExperiences = q.length < 2 ? [] : ALL_EXPERIENCES.filter((e) => {
    const haystack = [
      e.title, e.organization, e.description, e.category, e.period,
      ...(e.longDescription ?? []),
      ...(e.skills ?? []),
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  }).sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const key = (e: typeof a) => e.datetimeStart ?? e.period?.match(/(\d{4})[^0-9]*$/)?.[1] ?? "0000";
    return key(b).localeCompare(key(a));
  });

  const total = PROJECTS.length + LOGS.length + ALL_EXPERIENCES.length + allEndorsements.length;

  const matchedSkills: MatchedSkill[] = q.length < 2 ? [] : SKILLS.flatMap((group) =>
    group.items
      .filter((item) => {
        const aliases = SKILL_ALIASES[item] ?? [];
        return item.toLowerCase().includes(q) || aliases.some((a) => a.toLowerCase().includes(q));
      })
      .flatMap((item): MatchedSkill[] => {
        const lc = item.toLowerCase();
        const logCount = LOGS.filter((a) => a.tags?.some((t) => t.toLowerCase() === lc)).length;
        const expCount = ALL_EXPERIENCES.filter((e) => e.skills?.some((s) => s.toLowerCase() === lc)).length;
        const endorseCount = allEndorsements.filter((e) => e.skills?.some((s) => s.toLowerCase() === lc)).length;
        const langEntry = PROJECTS.flatMap((p) => Object.entries(p.languages))
          .find(([l]) => l.toLowerCase() === lc);
        if (langEntry) {
          const projCount = PROJECTS.filter((p) => Object.keys(p.languages).some((l) => l.toLowerCase() === lc)).length;
          return [{ name: item, category: group.label, filterType: "language", color: langEntry[1].color, matchCount: projCount + logCount + expCount + endorseCount, total }];
        }
        const topicProjCount = PROJECTS.filter((p) => p.topics.some((t) => t.toLowerCase() === lc)).length;
        if (topicProjCount > 0 || logCount > 0 || expCount > 0 || endorseCount > 0) {
          return [{ name: item, category: group.label, filterType: "topic", matchCount: topicProjCount + logCount + expCount + endorseCount, total }];
        }
        return [];
      })
  );

  const projectSiblings: ModalSibling[] = matchedProjects.map((p) => ({ kind: "project", id: p.id }));
  const logSiblings: ModalSibling[] = matchedLogs.map((a) => ({ kind: "log", id: a.id }));
  const contentCount = matchedProjects.length + matchedLogs.length;
  const hasResults = matchedSkills.length > 0 || matchedExperiences.length > 0 || contentCount > 0;
  const hasQuery = q.length >= 2;

  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.16em",
    margin: 0, paddingBottom: 8,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", paddingTop: 74 }}>
      {hasQuery && !hasResults && (
        <p className="pw-mono" style={{ ...labelStyle, padding: "0 34px 8px 17px" }}>
          {`NO RESULTS FOR "${q.toUpperCase()}"`}
        </p>
      )}
      <div style={{
        padding: q ? "0 34px 80px 17px" : "0",
        transition: "padding 0.2s cubic-bezier(.2,.7,.3,1)",
      }}>
        <div style={shouldAnimate.current ? {
          height: hasQuery ? resultsHeight : 0,
          // `clip` (not `hidden`) clips the open/close height animation without
          // establishing a scroll container, so the sticky "Show less" pill binds
          // to the modal's scroll container (CXScrollable) like the skill modal.
          overflow: "clip",
          transition: "height 0.35s cubic-bezier(.2,.7,.3,1)",
        } : {}}>
          <div ref={resultsRef}>
            {matchedSkills.length > 0 && (
              <>
                <p className="pw-mono" style={labelStyle}>
                  {`${matchedSkills.length} ${matchedSkills.length === 1 ? "SKILL" : "SKILLS"}`}
                </p>
                <div className="cx-search-skills-grid" style={{
                  display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8,
                  marginBottom: (matchedExperiences.length > 0 || contentCount > 0) ? 16 : 0,
                }}>
                  {matchedSkills.map((skill) => {
                    const pct = skill.total > 0 ? (skill.matchCount / skill.total) * 100 : 0;
                    const barColor = skill.color ?? "#c8d4e4";
                    const bar = (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="pw-mono" style={{ fontSize: 9, color: "var(--ink-mute)", letterSpacing: "0.12em" }}>
                            {skill.matchCount} / {skill.total} ALL
                          </span>
                          <span className="pw-mono" style={{ fontSize: 9, color: "var(--ink-mute)", letterSpacing: "0.12em" }}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ height: 3, borderRadius: 999, background: "rgba(128,128,128,0.15)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 999 }} />
                        </div>
                      </div>
                    );
                    return (
                      <CXCard
                        key={skill.name}
                        onClick={() => onOpenSkill(skill.name, skill.filterType, skill.color)}
                        accentColor={barColor}
                        eyebrow={`${skill.category} Skill`}
                        eyebrowColor="var(--ink-mute)"
                        title={skill.name}
                        titleSize={16}
                        footer={bar}
                      />
                    );
                  })}
                </div>
              </>
            )}
            {matchedExperiences.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: contentCount > 0 ? 16 : 0 }}>
                <p className="pw-mono" style={labelStyle}>
                  {`${matchedExperiences.length} ${matchedExperiences.length === 1 ? "EXPERIENCE" : "EXPERIENCES"}`}
                </p>
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10,
                  ...(matchedExperiences.length > 2 ? {
                    maxHeight: expExpanded ? 9999 : 180,
                    overflow: "hidden",
                    transition: "max-height 0.6s cubic-bezier(.2,.7,.3,1)",
                    WebkitMaskImage: expExpanded ? "none" : "linear-gradient(to bottom, black 40%, transparent 100%)",
                    maskImage: expExpanded ? "none" : "linear-gradient(to bottom, black 40%, transparent 100%)",
                  } : {}),
                }}>
                  {matchedExperiences.map((exp) => (
                    <ExperienceCardRow
                      key={exp.id}
                      exp={exp}
                      openModal={(m) => {
                        if (m.kind === "skill") onOpenSkill(m.id, m.filterType!, m.color);
                        else if (m.kind === "experience") onOpen("experience", m.id, []);
                      }}
                      onCardClick={() => onOpen("experience", exp.id, [])}
                      onOpenSkill={onOpenSkill}
                    />
                  ))}
                </div>
                {matchedExperiences.length > 2 && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: expExpanded ? 0 : -14, ...(expExpanded ? { position: "sticky", bottom: 60 } : {}) }}>
                    <CXPill size="md" onClick={() => { soundClick(); setExpExpanded((e) => !e); }}>
                      {expExpanded ? "Show less" : `Show all ${matchedExperiences.length}`}
                    </CXPill>
                  </div>
                )}
              </div>
            )}
            {contentCount > 0 && (
              <MixedGrid
                projects={matchedProjects}
                logs={matchedLogs}
                onOpenProject={(id) => onOpen("project", id, projectSiblings)}
                onOpenLog={(id) => onOpen("log", id, logSiblings)}
                resetKey={debouncedQuery}
                showLabel
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
