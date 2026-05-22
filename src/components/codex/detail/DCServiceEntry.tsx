import React from "react";
import { SERVICES, PROJECTS, LOGS, EXPERIENCES } from "../../../data/content";
import type { Endorsement } from "../../../data/content";
import type { ModalState } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import CXCard from "../CXCard";
import CXPill from "../CXPill";
import Tap from "../../shared/Tap";
import { soundClick } from "../../../context/SoundContext";

interface Props {
  id: string;
  selectEntry: (catId: string, entryId: string) => void;
  openModal: (m: ModalState) => void;
}

const allEndorsements = endorsementsData as Endorsement[];

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

export default function DCServiceEntry({ id, openModal }: Props) {
  const svc = SERVICES.find((s) => s.id === id);
  if (!svc) return null;

  const endorsements = allEndorsements
    .filter((e) => e.service === id && e.panels !== false)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

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
            margin: 0, maxWidth: "66ch", textWrap: "pretty",
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

      {/* Endorsements */}
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
                display: "flex", flexDirection: "row",
                overflow: "hidden",
                position: "relative",
              }}>
                {/* Photo — 200px wide, full card height */}
                {e.photo && (
                  <img
                    src={e.photo}
                    alt={e.name}
                    className="cx-endorsement-photo"
                    style={{ width: 200, flexShrink: 0, alignSelf: "stretch", objectFit: "cover", objectPosition: "center top" }}
                  />
                )}

                {/* Content */}
                <div className="cx-endorsement-content" style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* Quote */}
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink)", margin: 0, fontStyle: "italic" }}>
                    "{e.pullQuote ?? e.quote}"
                  </p>

                  {/* Author — em dash prefix */}
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    <span style={{ marginRight: 5, color: "var(--ink-mute)" }}>—</span>
                    <span style={{ fontWeight: 600 }}>{e.name}</span>
                    {e.role && <span style={{ color: "var(--ink-mute)" }}> · {e.role}</span>}
                    {e.org  && <span style={{ color: "var(--ink-mute)" }}> · {e.org}</span>}
                  </div>

                  {/* Skills — pushed to bottom, one line */}
                  {(pillSkills.length > 0 || plainSkills.length > 0) && (
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: "auto" }}>
                      {pillSkills.map((skill) => {
                        const match = matchSkill(skill)!;
                        return (
                          <CXPill key={skill} size="md"
                            onClick={() => openModal(match.kind === "language"
                              ? { kind: "skill", id: skill, filterType: "language", color: match.color }
                              : { kind: "skill", id: skill, filterType: "topic" }
                            )}>
                            {skill}
                          </CXPill>
                        );
                      })}
                      {pillSkills.length > 0 && plainSkills.length > 0 && (
                        <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>
                      )}
                      {plainSkills.map((s, i) => (
                        <React.Fragment key={s}>
                          {i > 0 && <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>}
                          <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.04em" }}>{s}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                </div>
              </CXCard>
            );
          })
        )}
      </div>

      {/* Related experiences */}
      {(() => {
        const related = EXPERIENCES.filter((e) => e.featured && e.category === id);
        if (!related.length) return null;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>Experience</div>
            {related.map((exp) => (
              <Tap
                key={exp.id}
                className="pw-glass-dim cx-card cx-training-row"
                style={{
                  padding: "18px 22px", borderRadius: 16,
                  borderLeft: "4px solid var(--section-accent)",
                  display: "grid", gridTemplateColumns: "100px 1fr auto",
                  gap: 18, alignItems: "start",
                  cursor: "pointer",
                }}
                onClick={() => { soundClick(); openModal({ kind: "experience", id: exp.id }); }}
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
                              onClick={() => { openModal(match.kind === "language"
                                ? { kind: "skill", id: skill, filterType: "language", color: match.color }
                                : { kind: "skill", id: skill, filterType: "topic" }); }}>
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
        );
      })()}

    </div>
  );
}
