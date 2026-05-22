import React from "react";
import { CX_INDEX } from "../../../data/content";
import CXCard from "../CXCard";

const DESCRIPTIONS: Record<string, string> = {
  bio:      "Identity, background, and personal interests.",
  skills:   "Languages, frameworks, and technical coverage.",
  activity: "Commit history heatmap and work timeline.",
  training: "Education, certifications, and professional roles.",
  resume:   "Downloadable and browser-viewable resume.",
};

interface Props {
  selectEntry: (catId: string, entryId: string) => void;
}

export default function DCPersonnelOverview({ selectEntry }: Props) {
  const cat = CX_INDEX.find((c) => c.id === "personnel")!;
  const entries = cat.entries.filter((e) => e.id !== "overview");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <p style={{
        fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)",
        margin: 0, maxWidth: "64ch", textWrap: "pretty",
      } as React.CSSProperties}>
        Skills, background, and professional record.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {entries.map((e) => (
          <CXCard key={e.id} onClick={() => selectEntry("personnel", e.id)} style={{
            padding: "20px 22px", borderRadius: 14,
            display: "flex", flexDirection: "column", gap: 10,
            cursor: "pointer", height: "100%",
          }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{e.label}</div>
            <p style={{
              fontSize: 13, lineHeight: 1.65, color: "var(--ink-soft)",
              margin: 0, flexGrow: 1,
            }}>
              {DESCRIPTIONS[e.id] ?? ""}
            </p>
            <div style={{ fontSize: 12, color: "var(--section-accent)", fontWeight: 500, marginTop: 4 }}>
              View →
            </div>
          </CXCard>
        ))}
      </div>
    </div>
  );
}
