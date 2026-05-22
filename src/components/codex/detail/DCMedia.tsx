import React, { useState, useRef, useEffect } from "react";
import Tap from "../../shared/Tap";

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

interface DCMediaProps {
  src: string;
  alt?: string;
}

export default function DCMedia({ src, alt }: DCMediaProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPanState] = useState<[number, number]>([0, 0]);
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef(zoom);
  const panRef  = useRef<[number, number]>([0, 0]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  function setPan(p: [number, number]) {
    panRef.current = p;
    setPanState(p);
  }

  function maxPan(z: number): [number, number] {
    const img = imgRef.current;
    const con = containerRef.current;
    if (!img || !con) return [0, 0];
    return [
      Math.max(0, (img.offsetWidth  * z - con.offsetWidth)  / 2),
      Math.max(0, (img.offsetHeight * z - con.offsetHeight) / 2),
    ];
  }

  function clamped(px: number, py: number, z: number): [number, number] {
    const [mx, my] = maxPan(z);
    return [Math.max(-mx, Math.min(mx, px)), Math.max(-my, Math.min(my, py))];
  }

  useEffect(() => {
    setPan(zoom <= ZOOM_MIN ? [0, 0] : clamped(panRef.current[0], panRef.current[1], zoom));
  }, [zoom]);

  function zoomIn()  { setZoom(z => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(2)))); }
  function zoomOut() { setZoom(z => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(2)))); }

  function onMouseDown(e: React.MouseEvent) {
    if (zoomRef.current <= ZOOM_MIN) return;
    e.preventDefault();
    const origin = { cx: e.clientX, cy: e.clientY, px: panRef.current[0], py: panRef.current[1] };
    setDragging(true);
    let didMove = false;
    function move(ev: MouseEvent) {
      didMove = true;
      setPan(clamped(origin.px + (ev.clientX - origin.cx), origin.py + (ev.clientY - origin.cy), zoomRef.current));
    }
    function up() {
      setDragging(false);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      if (didMove) {
        // The browser fires a click on the lowest common ancestor of mousedown/mouseup
        // targets — which can be the backdrop when dragging outside the modal.
        // Swallow that click before it reaches any onClick handler.
        window.addEventListener("click", (ev) => ev.stopPropagation(), { once: true, capture: true });
      }
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let panOrigin: { cx: number; cy: number; px: number; py: number } | null = null;
    let pinchStart: { dist: number; zoom: number } | null = null;

    function pinchDist(e: TouchEvent) {
      return Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY,
      );
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        panOrigin = null;
        pinchStart = { dist: pinchDist(e), zoom: zoomRef.current };
        setDragging(false);
      } else if (e.touches.length === 1 && zoomRef.current > ZOOM_MIN) {
        pinchStart = null;
        const t = e.touches[0];
        panOrigin = { cx: t.clientX, cy: t.clientY, px: panRef.current[0], py: panRef.current[1] };
        setDragging(true);
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinchStart) {
        e.preventDefault();
        const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN,
          parseFloat((pinchStart.zoom * pinchDist(e) / pinchStart.dist).toFixed(2)),
        ));
        zoomRef.current = newZoom;
        setZoom(newZoom);
        setPan(clamped(panRef.current[0], panRef.current[1], newZoom));
      } else if (e.touches.length === 1 && panOrigin) {
        e.preventDefault();
        const t = e.touches[0];
        setPan(clamped(panOrigin.px + (t.clientX - panOrigin.cx), panOrigin.py + (t.clientY - panOrigin.cy), zoomRef.current));
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length === 0) {
        panOrigin = null;
        pinchStart = null;
        setDragging(false);
      } else if (e.touches.length === 1) {
        // One finger lifted from a pinch — transition to pan
        pinchStart = null;
        if (zoomRef.current > ZOOM_MIN) {
          const t = e.touches[0];
          panOrigin = { cx: t.clientX, cy: t.clientY, px: panRef.current[0], py: panRef.current[1] };
          setDragging(true);
        }
      }
    }

    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchmove",  onTouchMove, { passive: false });
    el.addEventListener("touchend",   onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;
    const original = viewport.getAttribute("content");
    viewport.setAttribute("content", "width=device-width, initial-scale=1, user-scalable=no");
    return () => { if (original) viewport.setAttribute("content", original); };
  }, []);

  const filename = src.split("/").pop()?.split("?")[0] ?? "image";
  const canPan = zoom > ZOOM_MIN;

  const btnStyle: React.CSSProperties = {
    width: 44, height: 44, borderRadius: "50%",
    border: "1px solid",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, position: "relative", paddingRight: 20 }}>
      {/* clip-path: inset(0) is applied during GPU compositing and correctly clips
          CSS-scaled children even when they are on their own compositing layers —
          overflow: hidden alone does not clip cross-layer transforms in all browsers */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        className="cx-media-image-area"
        style={{
          flex: 1, minHeight: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          clipPath: "inset(0)",
          padding: 0,
          cursor: canPan ? (dragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ""}
          draggable={false}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            transform: "translate(" + pan[0] + "px, " + pan[1] + "px) scale(" + zoom + ")",
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.18s cubic-bezier(.2,.7,.3,1)",
            display: "block",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Controls overlaid on the image area */}
      <div style={{
        position: "absolute", bottom: 20, left: 0, right: 0,
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: 8, zIndex: 20,
      }}>
        <Tap
          onClick={zoomOut}
          title="Zoom out"
          className="cx-media-btn"
          style={{ ...btnStyle, opacity: zoom <= ZOOM_MIN ? 0.25 : 1, pointerEvents: zoom <= ZOOM_MIN ? "none" : "auto" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="8" x2="13" y2="8"/>
          </svg>
        </Tap>

        <span className="pw-mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", minWidth: 38, textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>

        <Tap
          onClick={zoomIn}
          title="Zoom in"
          className="cx-media-btn"
          style={{ ...btnStyle, opacity: zoom >= ZOOM_MAX ? 0.25 : 1, pointerEvents: zoom >= ZOOM_MAX ? "none" : "auto" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="3" x2="8" y2="13"/>
            <line x1="3" y1="8" x2="13" y2="8"/>
          </svg>
        </Tap>

        <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

        <Tap as="a" href={src} download={filename} title="Download" className="cx-media-btn" style={btnStyle}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="2" x2="8" y2="10"/>
            <polyline points="5 7 8 10 11 7"/>
            <line x1="3" y1="13" x2="13" y2="13"/>
          </svg>
        </Tap>

        <Tap as="a" href={src} target="_blank" rel="noopener noreferrer" title="Open in new tab" className="cx-media-btn" style={btnStyle}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2H2a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V8"/>
            <path d="M9 1h5v5"/>
            <line x1="14" y1="1" x2="7" y2="8"/>
          </svg>
        </Tap>
      </div>
    </div>
  );
}
