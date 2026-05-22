import React, { useState, useEffect } from "react";
import { SKILLS } from "../../data/content";
import CXPill from "./CXPill";

interface CategoryGridProps<T extends { id: string }> {
  items: T[];
  getMatchTags: (item: T) => string[];
  renderCard: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  resetKey?: unknown;
}

function matchesCat(tags: string[], skillItems: string[]): boolean {
  const lower = tags.map(t => t.toLowerCase());
  return skillItems.some(s => lower.includes(s.toLowerCase()));
}

function hasTag(tags: string[], tag: string): boolean {
  return tags.some(t => t.toLowerCase() === tag.toLowerCase());
}

export default function CategoryGrid<T extends { id: string }>({
  items,
  getMatchTags,
  renderCard,
  emptyMessage = "No items match all selected filters",
  resetKey,
}: CategoryGridProps<T>) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set());

  useEffect(() => { setHoveredCategory(null); setActiveSkills(new Set()); }, [resetKey]);

  const availableFilters = SKILLS.filter(sg =>
    items.some(item => matchesCat(getMatchTags(item), sg.items))
  );

  const filtered = activeSkills.size > 0
    ? items.filter(item => [...activeSkills].every(skill => hasTag(getMatchTags(item), skill)))
    : items;

  function toggleSkill(skill: string) {
    setActiveSkills(prev => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {availableFilters.length > 1 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
          {availableFilters.map(sg => {
            const hasActive = sg.items.some(item => activeSkills.has(item));
            const isHovered = hoveredCategory === sg.label;
            const skills = sg.items.filter(skill => items.some(item => hasTag(getMatchTags(item), skill)));
            const count = items.filter(item => matchesCat(getMatchTags(item), sg.items)).length;
            return (
              <div
                key={sg.label}
                style={{ position: "relative" }}
                onMouseEnter={() => setHoveredCategory(sg.label)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <CXPill
                  size="lg" variant="primary"
                  active={hasActive} hovered={isHovered}
                  count={count}
                  style={{ cursor: "pointer" }}
                >
                  {sg.label}
                </CXPill>

                {isHovered && skills.length > 0 && (
                  <>
                    <div style={{ position: "absolute", top: "100%", left: -4, right: -4, height: 8 }} />
                    <div
                      className="pw-glass cx-filter-panel"
                      style={{
                        position: "absolute", top: "calc(100% + 5px)", left: 0, zIndex: 50,
                        borderRadius: 6, padding: "8px",
                        display: "flex", flexWrap: "wrap", gap: 4, minWidth: 140,
                      }}
                    >
                      {skills.map(skill => {
                        const isActive = activeSkills.has(skill);
                        const skillCount = items.filter(item => hasTag(getMatchTags(item), skill)).length;
                        return (
                          <CXPill
                            key={skill}
                            size="sm" variant="secondary"
                            active={isActive}
                            count={skillCount}
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                          </CXPill>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {activeSkills.size > 0 && (
            <>
              <CXPill
                size="lg" variant="muted"
                onClick={() => setActiveSkills(new Set())}
                style={{ marginLeft: 6 }}
              >
                clear ×
              </CXPill>
              <span
                className="pw-mono"
                style={{
                  marginLeft: "auto", fontSize: 10, color: "var(--ink-soft)",
                  letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap",
                }}
              >
                {[...activeSkills].join(" · ")}
              </span>
            </>
          )}
        </div>
      )}

      <div className="cx-grid-2col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}>
        {filtered.length > 0
          ? filtered.map((item, i) => renderCard(item, i))
          : (
            <div style={{ gridColumn: "1 / -1", padding: "32px 0", textAlign: "center" }}>
              <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                {emptyMessage}
              </span>
            </div>
          )
        }
      </div>
    </div>
  );
}
