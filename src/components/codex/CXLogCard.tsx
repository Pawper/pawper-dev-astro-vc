import React from "react";
import type { Log } from "../../types";
import CXCard from "./CXCard";
import { LOG_CAT } from "../../data/content";

interface CXLogCardProps {
  log: Log;
  onClick: () => void;
  seriesTotal?: number; // omit in series modal; pass log.series.total elsewhere to show "OF XX"
}

export default function CXLogCard({ log, onClick, seriesTotal }: CXLogCardProps) {
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
    <CXCard
      onClick={onClick}
      accentColor={LOG_CAT.accent}
      style={{ minHeight: 120 }}
      thumbnail={thumbnail}
      badge={badge}
      badgeSub={badgeSub}
      badgeColor={LOG_CAT.accent}
      footerEnd
      eyebrow={log.kicker}
      date={log.date}
      title={log.title}
      titleSize={16}
      hook={log.hook}
      footer={
        <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
          {log.words}w · ~{Math.round(log.words / 240)} min
        </span>
      }
    />
  );
}
