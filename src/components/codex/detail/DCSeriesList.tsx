import React, { useState, useEffect } from "react";
import { LOGS, slugify } from "../../../data/content";
import CXCard from "../CXCard";
import CXLogCard from "../CXLogCard";
import { soundClick } from "../../../context/SoundContext";
import type { ModalSibling } from "../../../types";
import { getProgress, completeAll, clearProgress } from "../../../utils/logProgress";
import { getLogHeadingIds } from "../../../utils/headingCache";
import { ArticleProgressRing } from "./DCDetailSidebar";

interface DCSeriesListProps {
  seriesSlug: string;
  onOpenLog: (id: string, siblings: ModalSibling[]) => void;
}

export default function DCSeriesList({ seriesSlug, onOpenLog }: DCSeriesListProps) {
  const seriesName = [...new Set(LOGS.filter((a) => a.series).map((a) => a.series!.name))].find((n) => slugify(n) === seriesSlug);

  const logs = seriesName
    ? LOGS.filter((a) => a.series?.name === seriesName).sort((a, b) => a.series!.part - b.series!.part)
    : [];

  const [, setTick] = useState(0);
  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener("pw-progress-update", handler);
    window.addEventListener("pw-progress-reset", handler);
    return () => {
      window.removeEventListener("pw-progress-update", handler);
      window.removeEventListener("pw-progress-reset", handler);
    };
  }, []);

  if (!seriesName) {
    return <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>Series not found.</span>;
  }

  const total = logs[0]?.series?.total ?? logs.length;
  const unreleased = Math.max(0, total - logs.length);
  const nextPart = logs.length + 1;

  const siblings: ModalSibling[] = logs.map((a) => ({ kind: "log", id: a.id }));

  const completedLogs = logs.filter(a => getProgress(a.id).completed);
  const allPublishedDone = logs.length > 0 && completedLogs.length === logs.length;
  const seriesCompleted = allPublishedDone && unreleased === 0;
  const seriesProgress = { current: null as string | null, checked: completedLogs.map(a => a.id), completed: seriesCompleted };

  const handleSeriesAction = () => {
    if (allPublishedDone) {
      logs.forEach(a => clearProgress(a.id));
    } else {
      logs.forEach(a => {
        const ids = getLogHeadingIds(a.id);
        if (ids.length > 0) completeAll(a.id, ids);
      });
    }
  };


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="16" viewBox="0 0 122.88 111.96" fill="var(--section-accent)" style={{ flexShrink: 0 }}>
              <path d="M61.15,0L0,26.52l61.41,24.96l61.47-24.88L61.15,0L61.15,0z M122.88,57.12L95.46,45.31L62.73,58.56c-0.88,0.36-1.83,0.33-2.65,0L27.27,45.22L0,57.05L61.41,82L122.88,57.12L122.88,57.12z M96.14,75.56L62.73,89.08c-0.88,0.36-1.83,0.33-2.65,0L26.59,75.47L0,87.01l61.41,24.96l61.47-24.88L96.14,75.56L96.14,75.56z"/>
            </svg>
            {seriesName}
          </h2>
          <p className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.16em", margin: 0 }}>
            {total} PARTS{unreleased > 0 ? ` · ${logs.length} PUBLISHED` : ""} · {logs.reduce((s, a) => s + a.words, 0).toLocaleString()} WORDS
          </p>
        </div>
        {logs.length > 0 && (
          <span style={{ flexShrink: 0, marginLeft: 12 }}>
            <ArticleProgressRing
              progress={seriesProgress}
              total={total}
              slug={`__series__${seriesSlug}`}
              allIds={[]}
              onAction={handleSeriesAction}
            />
          </span>
        )}
      </div>
      <div className="cx-series-list-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {logs.map((a) => (
          <CXLogCard
            key={a.id}
            log={a}
            onClick={() => { soundClick(); onOpenLog(a.id, siblings); }}
          />
        ))}

        {unreleased > 0 && (
          <CXCard
            style={{ minHeight: 120, opacity: 0.5 }}
            badge={unreleased === 1
              ? String(nextPart).padStart(2, "0")
              : `${String(nextPart).padStart(2, "0")}–${String(total).padStart(2, "0")}`}
            date="COMING SOON"
          />
        )}
      </div>

    </div>
  );
}
