import React, { createContext, useContext, useState, useEffect } from "react";

// ── Audio engine ──────────────────────────────────────────────
// Ported directly from the design handoff's sounds.js

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _humOsc: OscillatorNode | null = null;
let _humGain: GainNode | null = null;
let _enabled = false;

// Only creates the context — never call outside a user gesture.
function ensureCtx(): AudioContext | null {
  if (_ctx) return _ctx;
  try {
    _ctx = new AudioContext();
    _master = _ctx.createGain();
    _master.gain.value = 0.22;
    _master.connect(_ctx.destination);
    // Context born inside a user gesture → already running; start hum immediately.
    if (_enabled) startHum();
  } catch {
    return null;
  }
  return _ctx;
}

function blip({ freq = 880, dur = 0.06, type = "sine" as OscillatorType, vol = 0.4, decay = 0.05, lazy = false }) {
  if (!_enabled) return;
  // lazy=true (hover): use existing context only — mouseenter isn't a trusted
  // user activation so creating one here would land it in suspended state.
  // lazy=false (click/touch): create context if needed — always inside a gesture.
  const ctx = lazy ? _ctx : ensureCtx();
  if (!ctx || !_master) return;

  const schedule = () => {
    if (!_master) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(_master);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur + decay);
    o.start(t);
    o.stop(t + dur + decay + 0.02);
  };

  if (ctx.state !== "running") {
    ctx.resume().then(schedule).catch(() => {});
  } else {
    schedule();
  }
}

// Two-tone Trek-ish chirp
export function soundClick() {
  blip({ freq: 1320, dur: 0.04, vol: 0.32, decay: 0.08 });
  setTimeout(() => blip({ freq: 1760, dur: 0.03, vol: 0.18, decay: 0.06 }), 22);
}

export function soundHover() {
  blip({ freq: 2000, dur: 0.02, vol: 0.12, decay: 0.04, type: "triangle", lazy: true });
}

export function soundOpen() {
  blip({ freq: 620, dur: 0.06, vol: 0.3, decay: 0.1 });
  setTimeout(() => blip({ freq: 880, dur: 0.06, vol: 0.22, decay: 0.1 }), 40);
}

export function soundNav() {
  blip({ freq: 740, dur: 0.05, vol: 0.28, decay: 0.08 });
  setTimeout(() => blip({ freq: 1100, dur: 0.04, vol: 0.18, decay: 0.06 }), 35);
}

export function soundAlert() {
  blip({ freq: 540, dur: 0.1, vol: 0.3, decay: 0.18, type: "triangle" });
}

// Descending cascade — "diving into the database"
export function soundDive() {
  blip({ freq: 2400, dur: 0.02, vol: 0.18, decay: 0.03, type: "triangle" });
  setTimeout(() => blip({ freq: 1500, dur: 0.025, vol: 0.24, decay: 0.05 }), 32);
  setTimeout(() => blip({ freq: 900, dur: 0.04, vol: 0.28, decay: 0.09 }), 66);
  setTimeout(() => blip({ freq: 540, dur: 0.1, vol: 0.3, decay: 0.2 }), 104);
}

// Short upward close — "surfacing"
export function soundSurface() {
  blip({ freq: 600, dur: 0.04, vol: 0.22, decay: 0.07 });
  setTimeout(() => blip({ freq: 960, dur: 0.03, vol: 0.16, decay: 0.05 }), 30);
}

function startHum() {
  if (_humOsc || !_enabled) return;
  // Use existing context only — never create one here (would be outside a user gesture).
  const ctx = _ctx;
  if (!ctx || !_master || ctx.state !== "running") return;
  _humOsc = ctx.createOscillator();
  _humGain = ctx.createGain();
  _humOsc.type = "sine";
  _humOsc.frequency.value = 80;
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 220;
  _humOsc.connect(filt);
  filt.connect(_humGain);
  _humGain.connect(_master);
  _humGain.gain.value = 0;
  _humGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.2);
  _humOsc.start();
}

function stopHum() {
  if (!_humOsc || !_humGain || !_ctx) return;
  try {
    _humGain.gain.linearRampToValueAtTime(0, _ctx.currentTime + 0.4);
    const o = _humOsc;
    setTimeout(() => o.stop(), 500);
  } catch { /* ignore */ }
  _humOsc = null;
  _humGain = null;
}

export function setAudioEnabled(on: boolean) {
  _enabled = on;
  if (on) startHum(); else stopHum();
}

// ── React context (for toggle state only) ────────────────────

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
}

const SoundContext = createContext<SoundContextValue>({
  enabled: false,
  toggle: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  // Read localStorage synchronously so the initial value is correct — avoids
  // a false→true effect cycle that would call setAudioEnabled(false) first.
  const [enabled, setEnabled] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("pw-sound") === "1"
  );

  useEffect(() => {
    setAudioEnabled(enabled);
  }, [enabled]);

  const toggle = () => setEnabled((prev) => {
    const next = !prev;
    localStorage.setItem("pw-sound", next ? "1" : "0");
    return next;
  });

  return (
    <SoundContext.Provider value={{ enabled, toggle }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
