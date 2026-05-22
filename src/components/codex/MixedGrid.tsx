import React, { useState, useRef, useEffect } from "react";
import type { Project, Log } from "../../types";
import CXProjectCard from "./CXProjectCard";
import CXLogCard from "./CXLogCard";
import CXPill from "./CXPill";

type CombinedItem =
  | { type: "project"; sortKey: string; data: Project }
  | { type: "log"; sortKey: string; data: Log };

interface MixedGridProps {
  projects: Project[];
  logs: Log[];
  onOpenProject: (id: string) => void;
  onOpenLog: (id: string) => void;
  emptyMessage?: string;
  animated?: boolean;
  resetKey?: unknown;
  showLabel?: boolean;
  labelSuffix?: string;
}

export default function MixedGrid({
  projects,
  logs,
  onOpenProject,
  onOpenLog,
  emptyMessage = "No entries for this date.",
  animated = false,
  resetKey,
  showLabel,
  labelSuffix,
}: MixedGridProps) {
  const [gridFilter, setGridFilter] = useState<"pl" | "projects" | "logs">("pl");
  useEffect(() => { setGridFilter("pl"); }, [resetKey]);

  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    if (!animated) return;
    const el = innerRef.current;
    if (!el) return;
    setHeight(el.scrollHeight);
    const ro = new ResizeObserver(() => setHeight(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [animated]);

  const combined: CombinedItem[] = [
    ...projects.map(p => ({ type: "project" as const, sortKey: p.pushedAt, data: p })),
    ...logs.map(a => ({ type: "log" as const, sortKey: a.date.replace(/\./g, "-"), data: a })),
  ].sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  const showGridFilter = projects.length > 0 && logs.length > 0;
  const gridFiltered = !showGridFilter || gridFilter === "pl"
    ? combined
    : combined.filter(i => i.type === (gridFilter === "projects" ? "project" : "log"));

  const content = (
    <div
      ref={innerRef}
      style={{ paddingBottom: animated ? 40 : 0, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {(showLabel || showGridFilter) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
          {showLabel && (() => {
            const n = gridFilter === "projects" ? projects.length : gridFilter === "logs" ? logs.length : projects.length + logs.length;
            const word = gridFilter === "projects" ? "PROJECTS" : gridFilter === "logs" ? "LOGS" : "ENTRIES";
            return (
              <span className="pw-mono" style={{ fontSize: 11, color: "var(--section-deep)", letterSpacing: "0.16em" }}>
                {n} {word}{labelSuffix ? ` ${labelSuffix}` : ""}
              </span>
            );
          })()}
          {showGridFilter && (
            <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
              {(["pl", "projects", "logs"] as const).map(mode => (
                <CXPill
                  key={mode}
                  size="sm" variant="secondary"
                  active={gridFilter === mode}
                  onClick={() => setGridFilter(mode)}
                >
                  {mode === "pl" ? "ALL" : mode}
                </CXPill>
              ))}
            </div>
          )}
        </div>
      )}
      {gridFiltered.length > 0 ? (
        <div className="cx-grid-2col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {gridFiltered.map((item, i) =>
            item.type === "project" ? (
              <CXProjectCard
                key={item.data.id}
                p={item.data}
                index={i}
                mixed
                onClick={() => onOpenProject(item.data.id)}
              />
            ) : (
              <CXLogCard
                key={item.data.id}
                log={item.data}
                onClick={() => onOpenLog(item.data.id)}
                seriesTotal={item.data.series?.total}
              />
            )
          )}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: 0 }}>{emptyMessage}</p>
      )}
    </div>
  );

  if (!animated) return content;

  return (
    <div style={{
      height: height !== null ? height : "auto",
      transition: "height 0.35s cubic-bezier(0.2, 0.7, 0.3, 1)",
      overflow: "hidden",
    }}>
      {content}
    </div>
  );
}
