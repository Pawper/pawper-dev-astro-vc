import React from "react";

interface DotProps {
  color?: string;
  pulse?: boolean;
}

export default function Dot({ color = "var(--acc-mint)", pulse = true }: DotProps) {
  return (
    <span
      className={`pw-dot${pulse ? " pw-pulse" : ""}`}
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}
