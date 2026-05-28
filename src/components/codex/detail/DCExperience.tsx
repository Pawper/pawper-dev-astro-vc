import React from "react";
import { EXPERIENCES, AGENDA_EVENTS, PROJECTS, LOGS, canonicalizeSkill } from "../../../data/content";
import { derivePeriod } from "../../../utils/date";
import CollapsiblePills from "../CollapsiblePills";
import type { PillItem } from "../CollapsiblePills";
import type { Endorsement, Experience } from "../../../data/content";
import type { ModalState } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import ogLinkCacheRaw from "../../../data/og-link-cache.json";
import CXCard from "../CXCard";
import CXLogCard from "../CXLogCard";
import ExperienceCardRow from "./ExperienceCardRow";
import { SidebarTagGroups } from "./DCDetailSidebar";
import EndorsementQuote from "../EndorsementQuote";
import { soundClick, soundHover } from "../../../context/SoundContext";
import { isEventPast } from "../../../utils/date";
import { useNow } from "../../../hooks/useNow";

// ── Description renderer — splits plain text by line, renders bare URLs as
//    cards (CXLogCard for pawper.dev/l/ links, OG link card for everything else).

interface OgData { title?: string | null; description?: string | null; image?: string | null; domain?: string | null }
const ogCache = ogLinkCacheRaw as Record<string, OgData>;
const LONE_URL_RE = /^<?(https?:\/\/[^\s>]+)>?$/;

function ExternalLinkCard({ href, og }: { href: string; og: OgData | null }) {
  let domain = og?.domain ?? "";
  if (!domain) { try { domain = new URL(href).hostname.replace(/^www\./, ""); } catch {} }
  const fav = <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16`} alt="" style={{ flexShrink: 0, opacity: 0.7, borderRadius: 2 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />;
  const arrow = <span style={{ position: "absolute", top: 10, right: 12, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--section-accent)", opacity: 0.5 }}>↗</span>;
  const baseStyle: React.CSSProperties = { position: "relative", borderRadius: 16, borderLeft: "4px solid var(--section-accent)", overflow: "hidden", textDecoration: "none", color: "inherit", display: "flex" };

  if (!og?.title) {
    let display = href;
    try { const u = new URL(href); display = u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, ""); } catch {}
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} onMouseEnter={soundHover}
        className="pw-glass-dim cx-card pw-url-card" style={{ ...baseStyle, alignItems: "center", gap: 6, padding: "10px 14px" }}>
        {React.cloneElement(fav, { style: { width: 12, height: 12, ...fav.props.style } })}
        <span style={{ color: "var(--section-accent)", fontSize: 13, fontFamily: "var(--font-mono, monospace)" }}>{display}</span>
        {arrow}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} onMouseEnter={soundHover}
      className={`pw-glass-dim cx-card${og.image ? " cx-card-has-thumb" : ""} pw-url-card`}
      style={{ ...baseStyle, ...(og.image ? { minHeight: 142 } : {}) }}>
      {og.image && (
        <div className="cx-card-thumb" style={{ width: "38%", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <img src={og.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.9 }}
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.remove(); }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, padding: "16px 20px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {React.cloneElement(fav, { style: { width: 11, height: 11, ...fav.props.style } })}
          <span className="pw-eyebrow" style={{ color: "var(--section-accent)" }}>{domain}</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
          {og.title}
        </div>
        {og.description && (
          <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.45, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
            {og.description}
          </div>
        )}
      </div>
      {arrow}
    </a>
  );
}

function DescriptionBlock({ text, openModal }: { text: string; openModal: (m: ModalState) => void }) {
  if (!text) return null;
  const nodes = text.split(/\n/).map((line, i) => {
    const m = line.trim().match(LONE_URL_RE);
    if (m) {
      const url = m[1];
      const logSlug = url.match(/pawper\.dev\/l\/([^/?#]+)/)?.[1];
      if (logSlug) {
        const log = LOGS.find((a) => a.id === logSlug);
        if (log) return <CXLogCard key={i} log={log} onClick={() => { soundClick(); openModal({ kind: "log", id: log.id }); }} seriesTotal={log.series?.total} />;
      }
      return <ExternalLinkCard key={i} href={url} og={ogCache[url] ?? null} />;
    }
    if (!line.trim()) return null;
    return <p key={i} style={{ margin: 0 }}>{line}</p>;
  }).filter(Boolean);
  return <>{nodes}</>;
}


function formatAgendaDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

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

interface Props {
  id: string;
  openModal: (m: ModalState) => void;
}

export default function DCExperience({ id, openModal }: Props) {
  const exp = [...EXPERIENCES, ...AGENDA_EVENTS].find((e) => e.id === id) as Experience | undefined;
  if (!exp) return null;

  const endorsements = allEndorsements.filter((e) => exp.endorsementIds?.includes(e.slug));
  const matchingEvents = AGENDA_EVENTS.filter((e) => e.title === exp.title && e.datetimeStart);
  const period = derivePeriod(exp.title, exp.period ?? "");
  const periodLabel = matchingEvents.length > 1 && period ? `Repeating · ${period}` : period;
  const eyebrowParts = [periodLabel, exp.organization].filter(Boolean);

  // Child events — agenda events whose parentId points to this event
  const childEvents = AGENDA_EVENTS
    .filter((e) => e.parentId === exp.id)
    .sort((a, b) => (a.datetimeStart ?? "").localeCompare(b.datetimeStart ?? ""));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        {eyebrowParts.length > 0 && (
          <div className="pw-eyebrow cx-glass-label" style={{ marginBottom: 8 }}>
            {eyebrowParts.join(" · ")}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, lineHeight: 1.2 }}>
          {exp.title}
        </h1>
      </div>

      {/* Description */}
      <div style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 10 }}>
        <DescriptionBlock text={exp.description} openModal={openModal} />
      </div>

      {/* Long description — modal-only */}
      {exp.longDescription && exp.longDescription.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {exp.longDescription.map((bullet, i) => (
            <li key={i} style={{ fontSize: 14, lineHeight: 1.65, color: "var(--ink-soft)" }}>
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {/* Child sessions */}
      {childEvents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>Agenda</div>
          {childEvents.map((child) => (
            <ExperienceCardRow key={child.id} exp={child} openModal={openModal} />
          ))}
        </div>
      )}

      {/* Endorsements */}
      {endorsements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {endorsements.map((e) => {
            const pillSkills  = (e.skills ?? []).filter((s) => matchSkill(s) !== null);
            const plainSkills = (e.skills ?? []).filter((s) => matchSkill(s) === null);
            return (
              <CXCard key={e.id} className="cx-endorsement-card" style={{
                borderRadius: 14, overflow: "hidden", position: "relative", paddingLeft: 20,
              }}>
                {e.photo && (
                  <img
                    src={e.photo} alt={e.name} className="cx-endorsement-photo"
                    style={{ float: "left", width: 144, height: 144, objectFit: "cover", objectPosition: "center top", borderRadius: "40px 8px 40px 8px", margin: "20px 18px 4px 0" }}
                  />
                )}
                <div className="cx-endorsement-content" style={{ padding: "18px 20px 18px 0" }}>
                  <EndorsementQuote quote={e.quote} pullQuote={e.pullQuote} />
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
                    <span style={{ marginRight: 5, color: "var(--ink-mute)" }}>—</span>
                    <span style={{ fontWeight: 600 }}>{e.name}</span>
                    {e.role && <span style={{ color: "var(--ink-mute)" }}> · {e.role}</span>}
                    {e.org  && <span style={{ color: "var(--ink-mute)" }}> · {e.org}</span>}
                  </div>
                  {(pillSkills.length > 0 || plainSkills.length > 0) && (
                    <CollapsiblePills
                      size="md"
                      pills={pillSkills.map((s): PillItem => { const canonical = canonicalizeSkill(s); const match = matchSkill(s)!; return { key: s, label: canonical, onClick: () => openModal(match.kind === "language" ? { kind: "skill", id: canonical, filterType: "language", color: match.color } : { kind: "skill", id: canonical, filterType: "topic" }) }; })}
                      plain={plainSkills}
                    />
                  )}
                </div>
                <div style={{ clear: "both" }} />
              </CXCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  id: string;
  onOpen: (id: string, color?: string, filterType?: "topic" | "language") => void;
  onNavigateToAgenda?: (eventId: string) => void;
  onOpenExperience?: (id: string) => void;
}

export function DCExperienceSidebar({ id, onOpen, onNavigateToAgenda, onOpenExperience }: SidebarProps) {
  const now = useNow();
  const allEvents = [...EXPERIENCES, ...AGENDA_EVENTS];
  const exp = allEvents.find((e) => e.id === id) as Experience | undefined;
  if (!exp) return null;

  const upcomingDates = AGENDA_EVENTS
    .filter((e) => e.title === exp.title && !isEventPast(e.datetimeStart ?? "", e.datetimeEnd, e.time, now))
    .sort((a, b) => (a.datetimeStart ?? "").localeCompare(b.datetimeStart ?? ""));

  // Collect unique parent events — from this event and any same-title instances
  const parentIds = [...new Set([
    ...(exp.parentId ? [exp.parentId] : []),
    ...AGENDA_EVENTS
      .filter((e) => e.title === exp.title && e.parentId && e.id !== id)
      .map((e) => e.parentId!),
  ])];
  const parentEvents = parentIds
    .map((pid) => allEvents.find((e) => e.id === pid))
    .filter((e): e is Experience => !!e);

  const resolveTag = (tag: string) => {
    const lower = tag.toLowerCase();
    for (const p of PROJECTS) {
      const langEntry = Object.entries(p.languages).find(([l]) => l.toLowerCase() === lower);
      if (langEntry) { onOpen(langEntry[0], langEntry[1].color, "language"); return; }
    }
    onOpen(tag, undefined, "topic");
  };

  const hasSidebar = !!(exp.certificationImage || exp.skills?.length || upcomingDates.length || parentEvents.length);
  if (!hasSidebar) return null;

  return (
    <div style={{ width: 230, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {parentEvents.length > 0 && onOpenExperience && (
        <div className="pw-glass-dim" style={{ borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="pw-eyebrow" style={{ color: "var(--section-deep)", marginBottom: 2 }}>Experienced at</div>
          {parentEvents.map((e) => (
            <div
              key={e.id}
              className="cx-toc-item"
              onClick={() => { soundClick(); onOpenExperience(e.id); }}
              onMouseEnter={soundHover}
              style={{ padding: "4px 6px", marginLeft: -6, borderRadius: 6, cursor: "pointer" }}
            >
              <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.3, fontWeight: 500 }}>{e.title}</div>
              {e.organization && (
                <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 1 }}>{e.organization}</div>
              )}
            </div>
          ))}
        </div>
      )}
      {upcomingDates.length > 0 && onNavigateToAgenda && (
        <div className="pw-glass-dim" style={{ borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="pw-eyebrow" style={{ color: "var(--section-deep)", marginBottom: 2 }}>Upcoming Dates</div>
          {upcomingDates.map((e) => {
            const dateStr = e.datetimeEnd && e.datetimeEnd !== e.datetimeStart
              ? `${formatAgendaDate(e.datetimeStart ?? "")} – ${formatAgendaDate(e.datetimeEnd)}`
              : formatAgendaDate(e.datetimeStart ?? "");
            return (
              <div
                key={e.id}
                className="cx-toc-item"
                onClick={() => { soundClick(); onNavigateToAgenda(e.id); }}
                onMouseEnter={soundHover}
                style={{ padding: "4px 6px", marginLeft: -6, borderRadius: 6, cursor: "pointer" }}
              >
                <div className="pw-mono" style={{ fontSize: 11, color: "var(--section-accent)", fontWeight: 600 }}>
                  {dateStr}
                </div>
                {e.time && (
                  <div className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", marginTop: 1 }}>{e.time}</div>
                )}
                {e.location && (
                  <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 1 }}>{e.location}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {exp.certificationImage && (
        <div className="pw-glass-dim" style={{ padding: 16, borderRadius: 14 }}>
          {exp.certificationUrl ? (
            <a href={exp.certificationUrl} target="_blank" rel="noopener noreferrer" className="cx-resume-preview" style={{ display: "block" }} onClick={soundClick} onMouseEnter={soundHover}>
              <img src={exp.certificationImage} alt="Certification" style={{ width: "100%", display: "block" }} />
            </a>
          ) : (
            <img src={exp.certificationImage} alt="Certification" style={{ width: "100%", display: "block" }} />
          )}
        </div>
      )}
      {exp.skills?.length ? <SidebarTagGroups tags={exp.skills} onOpen={resolveTag} /> : null}
    </div>
  );
}
