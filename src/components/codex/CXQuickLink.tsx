import React from "react";
import CXCard from "./CXCard";

interface CXQuickLinkProps {
  code: string;
  title: string;
  desc: string;
  accent: string;
  icon: string;
  flipIcon?: boolean;
  count?: string;
  onClick: () => void;
}

export default function CXQuickLink({ code, title, desc, accent, icon, flipIcon, count, onClick }: CXQuickLinkProps) {
  return (
    <CXCard
      onClick={onClick}
      accentColor={accent}
      style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 8, minHeight: 120 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="pw-mono" style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: "0.18em" }}>
          {code}
        </span>
        <span style={{ fontSize: 18, color: accent, fontWeight: 600, ...(flipIcon && { display: "inline-block", transform: "scaleX(-1)" }) }}>{icon}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>{title}</div>
      <div style={{ fontSize: 14, color: "var(--ink-soft)", flex: 1 }}>{desc}</div>
      {count && (
        <div className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          {count}
        </div>
      )}
    </CXCard>
  );
}
