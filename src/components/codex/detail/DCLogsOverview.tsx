import React from "react";
import { LOG_CATEGORIES, SERIES_NAMES } from "../../../data/content";
import CXCard from "../CXCard";

interface Props {
  selectEntry: (catId: string, entryId: string) => void;
}

export default function DCLogsOverview({ selectEntry }: Props) {
  const categories = LOG_CATEGORIES.filter((c) => c.id !== "overview");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <p style={{
        fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)",
        margin: 0, maxWidth: "64ch", textWrap: "pretty",
      } as React.CSSProperties}>
        Writing, tutorials, and notes organized by category.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {categories.map((cat) => {
          const isSeries = cat.id === "series";
          const count = isSeries ? SERIES_NAMES.length : parseInt(cat.sub ?? "0");
          return (
            <CXCard key={cat.id} onClick={() => selectEntry("logs", cat.id)} style={{
              padding: "20px 22px", borderRadius: 14,
              display: "flex", flexDirection: "column", gap: 10,
              cursor: "pointer", height: "100%",
            }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{cat.label}</div>
              <p style={{
                fontSize: 13, lineHeight: 1.65, color: "var(--ink-soft)",
                margin: 0, flexGrow: 1,
              }}>
                {count} {isSeries ? "series" : `log${count !== 1 ? "s" : ""}`}
              </p>
              <div style={{ fontSize: 12, color: "var(--section-accent)", fontWeight: 500, marginTop: 4 }}>
                View →
              </div>
            </CXCard>
          );
        })}
      </div>
    </div>
  );
}
