import React from "react";
import { EXPERIENCES, PROJECTS, LOGS } from "../../../data/content";
import type { Endorsement } from "../../../data/content";
import type { ModalState } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import CXCard from "../CXCard";
import CXPill from "../CXPill";
import { SidebarTagGroups } from "./DCDetailSidebar";
import { soundClick, soundHover } from "../../../context/SoundContext";

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

interface Props {
  id: string;
  openModal: (m: ModalState) => void;
}

export default function DCExperience({ id, openModal }: Props) {
  const exp = EXPERIENCES.find((e) => e.id === id);
  if (!exp) return null;

  const endorsements = allEndorsements.filter((e) => exp.endorsementIds?.includes(e.slug));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <div className="pw-eyebrow cx-glass-label" style={{ marginBottom: 8 }}>
          {exp.period} · {exp.organization}
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, lineHeight: 1.2 }}>
          {exp.title}
        </h1>
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)" }}>
        {exp.description}
      </p>

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

      {/* Endorsements */}
      {endorsements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {endorsements.map((e) => {
            const pillSkills  = (e.skills ?? []).filter((s) => matchSkill(s) !== null);
            const plainSkills = (e.skills ?? []).filter((s) => matchSkill(s) === null);
            return (
              <CXCard key={e.id} className="cx-endorsement-card" style={{
                borderRadius: 14, display: "flex", flexDirection: "row",
                overflow: "hidden", position: "relative",
              }}>
                {e.photo && (
                  <img
                    src={e.photo} alt={e.name} className="cx-endorsement-photo"
                    style={{ width: 200, flexShrink: 0, alignSelf: "stretch", objectFit: "cover", objectPosition: "center top" }}
                  />
                )}
                <div className="cx-endorsement-content" style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--ink)", margin: 0, fontStyle: "italic" }}>
                    "{e.pullQuote ?? e.quote}"
                  </p>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    <span style={{ marginRight: 5, color: "var(--ink-mute)" }}>—</span>
                    <span style={{ fontWeight: 600 }}>{e.name}</span>
                    {e.role && <span style={{ color: "var(--ink-mute)" }}> · {e.role}</span>}
                    {e.org  && <span style={{ color: "var(--ink-mute)" }}> · {e.org}</span>}
                  </div>
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
          })}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  id: string;
  onOpen: (id: string, color?: string, filterType?: "topic" | "language") => void;
}

export function DCExperienceSidebar({ id, onOpen }: SidebarProps) {
  const exp = EXPERIENCES.find((e) => e.id === id);
  if (!exp?.skills?.length && !exp?.certificationImage) return null;

  const resolveTag = (tag: string) => {
    const lower = tag.toLowerCase();
    for (const p of PROJECTS) {
      const langEntry = Object.entries(p.languages).find(([l]) => l.toLowerCase() === lower);
      if (langEntry) { onOpen(langEntry[0], langEntry[1].color, "language"); return; }
    }
    onOpen(tag, undefined, "topic");
  };

  return (
    <div style={{ width: 230, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
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
