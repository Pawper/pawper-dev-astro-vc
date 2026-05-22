import React from "react";
import Dot from "./Dot";
import { useSound } from "../../context/SoundContext";

interface SoundToggleProps {
  style?: React.CSSProperties;
}

export default function SoundToggle({ style }: SoundToggleProps) {
  const { enabled: on, toggle } = useSound();

  return (
    <button
      onClick={toggle}
      className="pw-glass pw-pill"
      style={{
        border: "1px solid var(--glass-border)",
        padding: "6px 12px",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.18em",
        color: "var(--ink)",
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: on ? "rgba(255, 255, 255, 0.18)" : "var(--glass-bg)",
        ...style,
      }}
    >
      <Dot color={on ? "rgba(255,255,255,0.9)" : "var(--ink-mute)"} pulse={false} />
      {on ? "Audio · ON" : "Audio · Muted"}
    </button>
  );
}
