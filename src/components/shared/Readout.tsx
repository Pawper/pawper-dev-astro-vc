import React, { type ReactNode } from "react";

interface ReadoutProps {
  label: string;
  value: ReactNode;
  accent?: string;
}

export default function Readout({ label, value, accent }: ReadoutProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div className="pw-eyebrow" style={accent ? { color: accent } : undefined}>
        {label}
      </div>
      <div className="pw-mono" style={{ fontSize: 13, color: "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}
