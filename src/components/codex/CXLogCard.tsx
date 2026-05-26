import React, { useState, useEffect } from "react";
import type { Log } from "../../types";
import CXCard from "./CXCard";
import { LOG_CAT } from "../../data/content";
import { getProgress } from "../../utils/logProgress";
import type { LogProgressEntry } from "../../utils/logProgress";
import { ArticleProgressRing } from "./detail/DCDetailSidebar";
import { getLogHeadingIds } from "../../utils/headingCache";

interface CXLogCardProps {
  log: Log;
  onClick: () => void;
  seriesTotal?: number; // omit in series modal; pass log.series.total elsewhere to show "OF XX"
}

export default function CXLogCard({ log, onClick, seriesTotal }: CXLogCardProps) {
  const [progress, setProgress] = useState<LogProgressEntry>(() => getProgress(log.id));

  useEffect(() => {
    setProgress(getProgress(log.id));
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.slug || detail.slug === log.id) setProgress(getProgress(log.id));
    };
    window.addEventListener("pw-progress-update", handler);
    window.addEventListener("pw-progress-reset", handler);
    return () => {
      window.removeEventListener("pw-progress-update", handler);
      window.removeEventListener("pw-progress-reset", handler);
    };
  }, [log.id]);

  const headingIds = getLogHeadingIds(log.id);
  const started = headingIds.length > 0 && (progress.checked.length > 0 || progress.current !== null);

  const badge = log.series ? String(log.series.part).padStart(2, "0") : undefined;
  const badgeSub = log.series && seriesTotal !== undefined
    ? `OF ${String(seriesTotal).padStart(2, "0")}`
    : undefined;

  const thumbnail = log.image ? (
    <>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url("${log.image}")`,
        backgroundSize: "cover", backgroundPosition: "center",
      }} />
      {log.series && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at top left, rgba(0,0,0,0.55) 0%, transparent 65%)",
        }} />
      )}
    </>
  ) : undefined;

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <CXCard
        onClick={onClick}
        accentColor={LOG_CAT.accent}
        style={{ minHeight: 120, height: "100%" }}
        thumbnail={thumbnail}
        badge={badge}
        badgeSub={badgeSub}
        badgeColor={LOG_CAT.accent}
        eyebrow={log.kicker}
        date={log.updated ?? log.date}
        title={log.title}
        titleSize={16}
        hook={log.hook}
        footer={
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            {(() => {
              const inProgress = progress.checked.length > 0 && !progress.completed && headingIds.length > 0;
              const remaining = inProgress ? Math.round(log.words * (1 - progress.checked.length / headingIds.length)) : log.words;
              return (
                <span className="pw-mono" style={{ fontSize: 11, color: inProgress ? "var(--section-accent)" : "var(--ink-mute)" }}>
                  {inProgress ? `~${remaining}w · ~${Math.round(remaining / 240)} min left` : `${log.words}w · ~${Math.round(log.words / 240)} min`}
                </span>
              );
            })()}
            {started && (
              <span style={{ marginLeft: "auto", marginRight: -6, marginTop: -3, marginBottom: -3 }}>
                <ArticleProgressRing
                  progress={progress}
                  total={headingIds.length}
                  slug={log.id}
                  allIds={headingIds}
                />
              </span>
            )}
          </div>
        }
      />
    </div>
  );
}
