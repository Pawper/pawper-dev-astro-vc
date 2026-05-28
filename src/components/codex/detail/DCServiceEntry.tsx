import React from "react";
import { SERVICES, PROJECTS, LOGS, EXPERIENCES, AGENDA_EVENTS, canonicalizeSkill } from "../../../data/content";
import CollapsiblePills from "../CollapsiblePills";
import type { Endorsement } from "../../../data/content";
import type { ModalState } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import CXCard from "../CXCard";
import EndorsementQuote from "../EndorsementQuote";
import ExperienceCardRow from "./ExperienceCardRow";

interface Props {
  id: string;
  selectEntry: (catId: string, entryId: string) => void;
  openModal: (m: ModalState) => void;
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

export default function DCServiceEntry({ id, openModal }: Props) {
  const svc = SERVICES.find((s) => s.id === id);
  if (!svc) return null;

  const endorsements = allEndorsements
    .filter((e) => e.service === id && e.panels !== false)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="cx-service-layout">

      {/* Left column: body + disclaimer */}
      <div className="cx-service-left">

        {/* Body copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="pw-eyebrow cx-glass-label">{svc.kicker}</div>
            <div style={{
              display: "flex", alignItems: "center", gap: svc.status === "open" ? 1 : 5,
              fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
              color: svc.status === "open" ? "var(--section-deep)" : "var(--ink-mute)",
            }}>
              {svc.status === "open"
                ? <span style={{ fontSize: 13.5, fontWeight: 300, display: "inline-flex", alignItems: "center" }}>◈</span>
                : <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
              }
              {svc.status === "open" ? "Open" : "Full"}
            </div>
          </div>
          {svc.body.map((para, i) => (
            <p key={i} style={{
              fontSize: i === 0 ? 17 : 15,
              lineHeight: 1.65,
              color: i === 0 ? "var(--ink)" : "var(--ink-soft)",
              margin: 0, textWrap: "pretty",
            } as React.CSSProperties}>
              {para}
            </p>
          ))}
        </div>

        {/* Disclaimer */}
        {svc.disclaimer && (
          <CXCard style={{
            padding: "16px 20px", borderRadius: 12,
            borderLeft: "3px solid var(--section-accent)",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--section-deep)" }}>
              Note
            </div>
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-soft)", margin: 0 }}>
              {svc.disclaimer}
            </p>
          </CXCard>
        )}

      </div>

      {/* Middle column: endorsements */}
      <div className="cx-service-mid">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>Endorsements</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {endorsements.length === 0 ? (
          <CXCard style={{
            padding: "18px 22px", borderRadius: 14,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--ink-mute)", fontStyle: "italic" }}>
              None yet — check back soon.
            </span>
          </CXCard>
        ) : (
          endorsements.map((e) => {
            const pillSkills  = (e.skills ?? []).filter((s) => matchSkill(s) !== null);
            const plainSkills = (e.skills ?? []).filter((s) => matchSkill(s) === null);
            return (
              <CXCard key={e.id} className="cx-endorsement-card" style={{
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                paddingLeft: 20,
              }}>
                {/* Photo — floats left, text wraps */}
                {e.photo && (
                  <img
                    src={e.photo}
                    alt={e.name}
                    className="cx-endorsement-photo"
                    style={{ float: "left", width: 144, height: 144, objectFit: "cover", objectPosition: "center top", borderRadius: "40px 8px 40px 8px", margin: "20px 18px 4px 0" }}
                  />
                )}

                {/* Content — display:block so inline content wraps around the float */}
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
                      pills={pillSkills.map((s) => { const canonical = canonicalizeSkill(s); const match = matchSkill(s)!; return { key: s, label: canonical, onClick: () => openModal(match.kind === "language" ? { kind: "skill", id: canonical, filterType: "language", color: match.color } : { kind: "skill", id: canonical, filterType: "topic" }) }; })}
                      plain={plainSkills}
                    />
                  )}
                </div>
                <div style={{ clear: "both" }} />
              </CXCard>
            );
          })
        )}
      </div>
      </div>
      </div>{/* /cx-service-mid */}

      {/* Right column: experience */}
      <div className="cx-service-right">
      {/* Related experiences — featured first, then the rest; latest first within each group */}
      {(() => {
        const sortKey = (e: { datetimeStart?: string; period?: string }): string => {
          if (e.datetimeStart) return e.datetimeStart; // ISO date — lexicographic desc works
          const m = (e.period ?? "").match(/\d{4}/g);
          return m ? m[m.length - 1] : "0";
        };
        const related = [...EXPERIENCES, ...AGENDA_EVENTS]
          .filter((e) => e.category === id)
          .sort((a, b) => {
            const fDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            return fDiff !== 0 ? fDiff : sortKey(b).localeCompare(sortKey(a));
          });
        if (!related.length) return null;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>Experience</div>
            {related.map((exp) => (
              <ExperienceCardRow key={exp.id} exp={exp} openModal={openModal} noDim />
            ))}
          </div>
        );
      })()}

      </div>

    </div>
  );
}
