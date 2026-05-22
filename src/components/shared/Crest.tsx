import React from "react";

interface CrestProps {
  size?: number;
  accent?: string;
}

export default function Crest({ size = 56, accent = "var(--acc-orange)" }: CrestProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="26" fill="url(#cg)" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
      <circle cx="28" cy="28" r="20" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="3 4" opacity="0.7" />
      <circle cx="28" cy="28" r="6" fill={accent} />
      <path d="M28 4 L34 14 L28 12 L22 14 Z" fill={accent} opacity="0.8" />
    </svg>
  );
}
