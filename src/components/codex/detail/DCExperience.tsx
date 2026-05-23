import { EXPERIENCES, PROJECTS, LOGS, canonicalizeSkill } from "../../../data/content";
import CollapsiblePills from "../CollapsiblePills";
import type { PillItem } from "../CollapsiblePills";
import type { Endorsement } from "../../../data/content";
import type { ModalState } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import CXCard from "../CXCard";
import { SidebarTagGroups } from "./DCDetailSidebar";
import EndorsementQuote from "../EndorsementQuote";
import { soundClick, soundHover } from "../../../context/SoundContext";

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
