import React, { useState, useEffect, useRef } from "react";
import type { View, Theme, ModalState } from "../../types";
import { PROFILE, PROJECTS, SERVICES } from "../../data/content";
import CXPill from "./CXPill";
import CXBtn from "./CXBtn";
import Readout from "../shared/Readout";
import Tap from "../shared/Tap";
import CXScrollable from "../shared/CXScrollable";
import { useSound, soundClick, soundDive } from "../../context/SoundContext";

function usePacificTime() {
  const fmt = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short",
    }).formatToParts(new Date());
    const h  = parts.find(p => p.type === "hour")?.value ?? "00";
    const m  = parts.find(p => p.type === "minute")?.value ?? "00";
    const tz = parts.find(p => p.type === "timeZoneName")?.value ?? "PT";
    return `${h}:${m} ${tz}`;
  };
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 10000);
    return () => clearInterval(id);
  }, []);
  return time;
}

interface CXHeaderProps {
  expanded: boolean;
  onToggle: () => void;
  view: View;
  onHome: () => void;
  onContact: () => void;
  onResume: () => void;
  onService: (entryId: string) => void;
  theme: Theme;
  onThemeToggle: () => void;
  openModal: (m: ModalState) => void;
  onMenuOpen?: () => void;
}

export default function CXHeader({
  expanded,
  onToggle,
  onHome,
  onContact,
  onResume,
  onService,
  theme,
  onThemeToggle,
  openModal,
  onMenuOpen,
}: CXHeaderProps) {
  const time = usePacificTime();
  const { enabled: soundOn, toggle: soundToggle } = useSound();

  const briefScrollRef = useRef<HTMLElement | null>(null);
  const briefTouchY = useRef<number | null>(null);
  const briefWasAtBottom = useRef(true);

  function briefIsAtBottom(): boolean {
    const el = briefScrollRef.current;
    if (!el) return true;
    return el.scrollHeight <= el.clientHeight || el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
  }

  function onBriefTouchStart(e: React.TouchEvent) {
    if (!expanded) return;
    briefTouchY.current = e.touches[0].clientY;
    briefWasAtBottom.current = briefIsAtBottom();
  }

  function onBriefTouchEnd(e: React.TouchEvent) {
    if (!expanded || briefTouchY.current === null) return;
    const dy = e.changedTouches[0].clientY - briefTouchY.current;
    briefTouchY.current = null;
    if (dy < -30 && briefWasAtBottom.current) { soundClick(); soundDive(); onToggle(); }
  }

  const barBtn: React.CSSProperties = {
    width: 18, height: 18, borderRadius: "3px 3px 0 0", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, lineHeight: 1, padding: 0, background: "none",
    color: "black",
  };
  const barBg = (active: boolean) =>
    `rgba(var(--section-rgb), ${active ? 0.80 : 0.45})`;

  return (
    <div className="cx-header-outer">
      <div className="pw-glass-hi pw-lcars-tl cx-header-glass" style={{
        borderRadius: "56px 8px 8px 8px",
        overflow: "hidden",
        transition: "all .35s cubic-bezier(.2,.7,.3,1)",
        "--lcars-color": "rgba(var(--section-rgb), 0.65)",
        "--lcars-color-soft": "rgba(var(--section-rgb), 0.12)",
        "--lcars-r": "71px",
      } as React.CSSProperties}>
        {/* LCARS bar buttons — sit in the top bar zone, same pattern as modal close button */}
        <div className="cx-header-btns" style={{ position: "absolute", top: 8, right: 8, zIndex: 10, display: "flex", flexDirection: "row", gap: 3 }}>
          <Tap as="button" onClick={soundToggle} title={soundOn ? "Mute audio" : "Enable audio"}
            className="cx-header-btn cx-header-btn-sound"
            style={{ ...barBtn, background: barBg(soundOn), transition: "background .2s" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4.5H4L7 2V10L4 7.5H2V4.5Z" fill="currentColor"/>
              {soundOn && <>
                <path d="M8.5 4C9.2 4.7 9.2 7.3 8.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M10 2.5C11.5 4 11.5 8 10 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </>}
            </svg>
          </Tap>
          <Tap as="button" onClick={onThemeToggle} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="cx-header-btn cx-header-btn-theme"
            style={{ ...barBtn, background: barBg(theme === "light") }}>
            ◑
          </Tap>
          <Tap as="button" onClick={onToggle} title={expanded ? "Close brief" : "Open brief"}
            className="cx-header-btn cx-header-btn-expand"
            style={{ ...barBtn, background: barBg(expanded), fontWeight: 700, fontSize: 18, transition: "background .2s" }}>
            {expanded ? "▴" : "▾"}
          </Tap>
          {onMenuOpen && (
            <Tap as="button" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onMenuOpen(); }} title="Open menu"
              className="cx-header-btn"
              style={{ ...barBtn, background: barBg(false), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
              <span style={{ display: "block", width: 10, height: 1.5, background: "currentColor", borderRadius: 1 }} />
              <span style={{ display: "block", width: 10, height: 1.5, background: "currentColor", borderRadius: 1 }} />
              <span style={{ display: "block", width: 10, height: 1.5, background: "currentColor", borderRadius: 1 }} />
            </Tap>
          )}
        </div>
        {/* Labels sit on top of the LCARS bar — desktop layout */}
        <div className="cx-header-labels" style={{
          position: "absolute", top: 8, left: 60, right: 71, height: 18,
          display: "flex", alignItems: "center", gap: 10, zIndex: 10,
        }}>
          <Tap onClick={onHome} className="cx-header-name-tap" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}>
            <span className="pw-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "black" }}>
              {PROFILE.name}
            </span>
            <span className="cx-header-role pw-mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(0,0,0,0.7)" }}>
              {PROFILE.role} · {PROFILE.location.split(",")[0]}
            </span>
          </Tap>
          <div className="cx-header-spacer" style={{ flex: 1 }} />
          <div className="cx-header-status pw-mono" style={{
            fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "black",
            display: "flex", alignItems: "center", gap: 6, paddingRight: 4,
          }}>
            <span>OPEN TO WORK</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span>{time}</span>
          </div>
        </div>
        {/* Mobile marquee — sits on the soft LCARS bar below the name */}
        <div className="cx-header-marquee-wrap" style={{
          position: "absolute", top: 26, left: 0, right: 71, height: 16,
          overflow: "hidden", display: "none", alignItems: "center", zIndex: 10,
        }}>
          <div className="cx-header-marquee pw-mono">
            <span>{PROFILE.role}&nbsp;·&nbsp;{PROFILE.location.split(",")[0]}&nbsp;·&nbsp;Open to work&nbsp;·&nbsp;{time}&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span>{PROFILE.role}&nbsp;·&nbsp;{PROFILE.location.split(",")[0]}&nbsp;·&nbsp;Open to work&nbsp;·&nbsp;{time}&nbsp;&nbsp;&nbsp;&nbsp;</span>
          </div>
        </div>
        {/* Height spacer — keeps the container tall enough for the brief expand zone */}
        <div className="cx-header-bar-spacer" style={{ height: 44, flexShrink: 0 }} />

        {/* Brief action buttons — float at bottom of glass panel on mobile; overlay bar zone on desktop */}
        <div className="cx-btn-row cx-header-brief-btns" style={{
          position: "absolute", top: 41, right: 8,
          display: "flex", gap: 8,
          opacity: expanded ? 1 : 0,
          pointerEvents: expanded ? "auto" : "none",
          transform: expanded ? "translateY(0)" : "translateY(-10px)",
          transition: expanded ? "opacity .22s ease, transform .3s cubic-bezier(.2,.7,.3,1)" : "none",
          zIndex: 7,
        }}>
          <CXBtn num="01" label="Resume" primary onClick={onResume} icon={null} isDark={theme === "dark"} />
          <CXBtn num="02" label="Contact" onClick={onContact} icon={null} isDark={theme === "dark"} />
        </div>

        {/* Expanded brief content */}
        <div
          className="cx-header-brief-body"
          onTouchStart={onBriefTouchStart}
          onTouchEnd={onBriefTouchEnd}
          style={{
            maxHeight: expanded ? 400 : 0,
            opacity: expanded ? 1 : 0,
            transition: "max-height .35s cubic-bezier(.2,.7,.3,1), opacity .25s ease",
            overflow: "hidden",
          }}
        >
          <CXScrollable className="cx-brief-scroll-wrap" contentStyle={{ padding: "12px 12px 24px 33px" }}
            onInitialized={(el) => { briefScrollRef.current = el; }}>
              <div className="cx-brief-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "end" }}>
                <div>
                  <h1 style={{
                    margin: 0, fontSize: 44, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1.05,
                    textWrap: "balance", maxWidth: "22ch",
                  } as React.CSSProperties}>
                    <span style={{ color: theme === "light" ? "rgba(0,0,0,0.72)" : "white", fontSize: 22, fontWeight: 500, letterSpacing: 0, display: "block", marginBottom: 8 }}>
                      Hello — I'm
                    </span>
                    Phillip Wessels.
                  </h1>
                  <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.55, color: "var(--ink-soft)", maxWidth: "62ch" }}>
                    {PROFILE.intro}
                  </p>
                </div>
                <div className="cx-brief-right" style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 28, textAlign: "right", minWidth: 233 }}>
                  <Readout label="Stack" accent={theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)"}
                    value={
                      <div className="cx-brief-pills" style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2, justifyContent: "flex-end" }}>
                        {["React", "TypeScript", "Node"].map((skill) => {
                          const langEntry = PROJECTS.flatMap(p => Object.entries(p.languages))
                            .find(([l]) => l.toLowerCase() === skill.toLowerCase());
                          return (
                            <CXPill key={skill} size="md"
                              color={langEntry?.[1].color}
                              onClick={() => openModal(langEntry
                                ? { kind: "skill", id: langEntry[0], color: langEntry[1].color, filterType: "language" }
                                : { kind: "skill", id: skill, filterType: "topic" }
                              )}
                            >
                              {skill}
                            </CXPill>
                          );
                        })}
                      </div>
                    }
                  />
                  <Readout label="Open to" accent={theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)"}
                    value={
                      <div className="cx-brief-pills" style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2, justifyContent: "flex-end" }}>
                        {SERVICES.filter((svc) => svc.status === "open").map((svc) => (
                          <CXPill key={svc.id} size="md" onClick={() => onService(svc.id)}>
                            {svc.label}
                          </CXPill>
                        ))}
                      </div>
                    }
                  />
                </div>
              </div>
          </CXScrollable>
        </div>
      </div>
    </div>
  );
}
