import React from "react";
import { EXPERIENCES, PROJECTS, LOGS } from "../../../data/content";
import type { Endorsement, Experience } from "../../../data/content";
import type { ModalState } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import CXPill from "../CXPill";
import Tap from "../../shared/Tap";
import { soundClick } from "../../../context/SoundContext";

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

function ExperienceSkills({ skills, openModal }: { skills: string[]; openModal: (m: ModalState) => void }) {
  if (!skills.length) return null;
  const pill = skills.filter((s) => matchSkill(s) !== null);
  const plain = skills.filter((s) => matchSkill(s) === null);
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
      {pill.length > 0 && plain.length > 0 && (
        <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>
      )}
      {plain.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <span style={{ color: "var(--ink-mute)", fontSize: 11, lineHeight: 1 }}>•</span>}
          <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.04em" }}>{s}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

interface Props {
  openModal: (m: ModalState) => void;
}

export default function DCTraining({ openModal }: Props) {
  const items = EXPERIENCES.filter((e) => e.featured);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 975, marginInline: "auto", width: "100%" }}>
      {items.map((item) => (
        <Tap
          key={item.id}
          className="pw-glass-dim cx-card cx-training-row"
          style={{
            padding: "18px 22px", borderRadius: 16,
            borderLeft: "4px solid var(--section-accent)",
            display: "grid", gridTemplateColumns: "100px 1fr auto",
            gap: 18, alignItems: "start",
            cursor: "pointer",
          }}
          onClick={() => { soundClick(); openModal({ kind: "experience", id: item.id }); }}
        >
          <span className="pw-mono" style={{ fontSize: 12, color: "var(--section-deep)", fontWeight: 600, letterSpacing: "0.08em", paddingTop: 2 }}>
            {item.period}
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>{item.description}</div>
            {item.skills?.length ? <ExperienceSkills skills={item.skills} openModal={openModal} /> : null}
          </div>
          <span style={{ fontSize: 13, color: "var(--ink-mute)", paddingTop: 2 }}>{item.organization}</span>
        </Tap>
      ))}
    </div>
  );
}
