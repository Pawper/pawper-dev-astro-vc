import React, { useState, useEffect, useRef, useMemo } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import type { View, ModalState, Theme, Log } from "../../types";
import { BACKDROPS, CX_INDEX, PROJECTS, LOGS, EXPERIENCES, SKILLS, PROJECT_CATEGORIES, DEFAULT_PROJECT_CAT, getProjectsForCategory, LOG_CATEGORIES, DEFAULT_LOG_CAT, getLogsForCategory, initLogs } from "../../data/content";
import { SoundProvider, soundNav, soundOpen, soundClick, soundDive, useSound } from "../../context/SoundContext";
import Backdrop from "../shared/Backdrop";
import CXHeader from "./CXHeader";
import CXIndex from "./CXIndex";
import CXMain, { StatusBar } from "./CXMain";
import CXModal from "./CXModal";
import { extractHeadings } from "./detail/DCLog";
import { populateHeadingCache } from "../../utils/headingCache";

interface AppProps {
  logsHtml: Record<string, string>;
  logs: Log[];
}

function statePath(v: View, m: ModalState | null): string {
  if (m) {
    switch (m.kind) {
      case "log":        return `/l/${m.id}`;
      case "series":     return `/ls/${m.id}`;
      case "project":    return `/p/${m.id}`;
      case "experience": return `/xp/${m.id}`;
      case "skill": {
        const base = `/skill/${encodeURIComponent(m.id.replace(/\//g, "-"))}`;
        return m.filterType ? `${base}?ft=${m.filterType}` : base;
      }
      default:           return statePath(v, null);
    }
  }
  if (v.kind === "home" || !v.cat) return "/";
  switch (v.cat) {
    case "projects": return v.entry && v.entry !== DEFAULT_PROJECT_CAT ? `/projects/${v.entry}` : "/projects";
    case "logs":     return v.entry && v.entry !== DEFAULT_LOG_CAT     ? `/logs/${v.entry}`     : "/logs";
    case "personnel":return v.entry && v.entry !== "bio"               ? `/about/${v.entry}`    : "/about";
    case "services": return v.entry && v.entry !== "overview"          ? `/services/${v.entry}` : "/services";
    case "contact":  return "/contact";
    default:         return "/";
  }
}

function parseUrl() {
  if (typeof window === "undefined") return null;

  const pathname = location.pathname;
  const p = new URLSearchParams(location.search);
  const parts = pathname.split("/").filter(Boolean);

  let view: View = { kind: "home" };
  const modalStack: ModalState[] = [];

  // Path-based routing
  if (parts.length > 0) {
    const seg0 = parts[0];
    const seg1 = parts[1];
    if (seg0 === "projects") {
      view = { kind: "entry", cat: "projects", entry: seg1 ?? DEFAULT_PROJECT_CAT };
    } else if (seg0 === "logs") {
      view = { kind: "entry", cat: "logs", entry: seg1 ?? DEFAULT_LOG_CAT };
    } else if (seg0 === "about") {
      view = { kind: "entry", cat: "personnel", entry: seg1 ?? "bio" };
    } else if (seg0 === "services") {
      view = { kind: "entry", cat: "services", entry: seg1 ?? "overview" };
    } else if (seg0 === "contact") {
      view = { kind: "entry", cat: "contact", entry: "all" };
    } else if (seg0 === "p" && seg1) {
      modalStack.push({ kind: "project", id: seg1, siblings: PROJECTS.map(proj => ({ kind: "project" as const, id: proj.id })) });
    } else if (seg0 === "l" && seg1) {
      const anchor = location.hash ? location.hash.slice(1) : undefined;
      modalStack.push({ kind: "log", id: seg1, siblings: LOGS.map(a => ({ kind: "log" as const, id: a.id })), anchor });
    } else if (seg0 === "ls" && seg1) {
      modalStack.push({ kind: "series", id: seg1 });
    } else if (seg0 === "skill" && seg1) {
      const slug = decodeURIComponent(seg1);
      // Reverse-map URL slug (slashes replaced with dashes) back to original skill label
      const id = SKILLS.flatMap(g => g.items).find(item => item.replace(/\//g, "-") === slug) ?? slug;
      const ft = p.get("ft") as ModalState["filterType"];
      const m: ModalState = { kind: "skill", id, filterType: ft ?? undefined };
      if (ft === "language") {
        const le = PROJECTS.flatMap(proj => Object.entries(proj.languages))
          .find(([l]) => l.toLowerCase() === id.toLowerCase());
        if (le) m.color = le[1].color;
      }
      modalStack.push(m);
    } else if (seg0 === "xp" && seg1) {
      modalStack.push({ kind: "experience", id: seg1 });
    }
  }

  // Query-param fallback (gateway redirects land here with ?v=entry&cat=... or ?modal=...)
  if (parts.length === 0) {
    const v = p.get("v");
    const cat = p.get("cat") ?? undefined;
    const entry = p.get("entry") ?? undefined;
    const mk = p.get("modal") as ModalState["kind"] | null;
    const id = p.get("id");
    const ft = p.get("ft") as ModalState["filterType"];

    if ((v === "grid" || v === "entry") && cat) {
      view = { kind: v, cat, entry };
    }
    if (mk && id) {
      const m: ModalState = { kind: mk, id, filterType: ft ?? undefined };
      if (mk === "skill" && ft === "language") {
        const le = PROJECTS.flatMap(proj => Object.entries(proj.languages))
          .find(([l]) => l.toLowerCase() === id.toLowerCase());
        if (le) m.color = le[1].color;
      }
      if (mk === "project") m.siblings = PROJECTS.map(proj => ({ kind: "project" as const, id: proj.id }));
      if (mk === "log") m.siblings = LOGS.map(a => ({ kind: "log" as const, id: a.id }));
      modalStack.push(m);
    }
  }

  const openCats: Record<string, boolean> = {
    personnel: !view.cat || view.cat === "personnel",
    services: view.cat === "services",
    projects: view.cat === "projects",
    logs: view.cat === "logs",
    contact: view.cat === "contact",
  };

  return { view, modalStack, openCats, headerExpanded: view.kind === "home" };
}

function AppInner({ logsHtml }: Pick<AppProps, "logsHtml">) {
  useMemo(() => {
    populateHeadingCache(
      Object.fromEntries(
        Object.entries(logsHtml).map(([id, html]) => [id, extractHeadings(html).map(h => h.anchorId)])
      )
    );
  }, [logsHtml]);

  const isMobile = useIsMobile();
  const [navOpen, setNavOpen] = useState(false);
  const { enabled: soundOn, toggle: soundToggle } = useSound();
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const saved = localStorage.getItem("pw-theme") as Theme | null;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }
    setTheme(mq.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      localStorage.setItem("pw-theme", next);
      return next;
    });
  }
  const init = useState(parseUrl)[0];
  const [view, setView] = useState<View>(init?.view ?? { kind: "home" });
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(
    init?.openCats ?? { personnel: true, services: false, projects: false, logs: false, contact: false }
  );
  const [headerExpanded, setHeaderExpanded] = useState(init?.headerExpanded ?? true);
  const [modalStack, setModalStack] = useState<ModalState[]>(init?.modalStack ?? []);
  const modal = modalStack.at(-1) ?? null;

  const readingPanelRef = useRef<HTMLDivElement>(null);
  const headerExpandedRef = useRef(headerExpanded);
  useEffect(() => { headerExpandedRef.current = headerExpanded; }, [headerExpanded]);
  const isMobileFirstRun = useRef(true);

  useEffect(() => {
    const el = readingPanelRef.current;
    if (!el || !isMobile) return;
    const SECTION_HEADER_H = 107;
    let startY: number | null = null;

    function onStart(e: TouchEvent) {
      if (headerExpandedRef.current) return;
      const rect = el!.getBoundingClientRect();
      const localY = e.touches[0].clientY - rect.top;
      if (localY > SECTION_HEADER_H) return;
      // check scroll is at top
      const viewport = el!.querySelector<HTMLElement>("[data-overlayscrollbars-viewport]");
      if (viewport && viewport.scrollTop > 2) return;
      startY = e.touches[0].clientY;
    }

    function onEnd(e: TouchEvent) {
      if (startY === null) return;
      const dy = e.changedTouches[0].clientY - startY;
      startY = null;
      if (dy > 40) { soundClick(); soundDive(); setHeaderExpanded(true); }
    }

    el.addEventListener("touchstart", onStart, { passive: true, capture: true });
    el.addEventListener("touchend", onEnd, { passive: true, capture: true });
    return () => {
      el.removeEventListener("touchstart", onStart, { capture: true });
      el.removeEventListener("touchend", onEnd, { capture: true });
    };
  }, [isMobile]);
  const skipNextPopState = useRef(false);
  const prevViewRef = useRef(view);
  const _suppressViewPush = useRef(false);
  const openModal = (m: ModalState) => {
    soundOpen();
    history.pushState({ _type: "modal", stack: [m] }, "");
    setModalStack([m]);
  };
  const navigateModal = (m: ModalState) => {
    soundOpen();
    history.pushState({ _type: "modal", stack: [...modalStack, m] }, "");
    setModalStack((s) => [...s, m]);
  };
  const replaceModal = (m: ModalState) => {
    soundOpen();
    history.replaceState({ _type: "modal", stack: [...modalStack.slice(0, -1), m] }, "");
    setModalStack((s) => [...s.slice(0, -1), m]);
  };
  // Close leaves history entries in place so the back button can reopen the modal.
  const closeModal = () => { soundClick(); setModalStack([]); };
  // Back button inside modal: update state synchronously and skip the resulting popstate.
  const backModal = () => {
    soundClick();
    skipNextPopState.current = true;
    history.back();
    setModalStack((s) => s.slice(0, -1));
  };
  const patchModal  = (patch: Partial<ModalState>) => setModalStack((s) => s.map((m, i) => i === s.length - 1 ? { ...m, ...patch } : m));

  const allCatsClosed = () => Object.fromEntries(CX_INDEX.map((c) => [c.id, false]));
  const onlyCatOpen = (catId: string) =>
    Object.fromEntries(CX_INDEX.map((c) => [c.id, c.id === catId]));
  const goHome = () => { setView({ kind: "home" }); setHeaderExpanded(true); setOpenCats({ ...allCatsClosed(), personnel: true }); soundNav(); };

  const selectCategory = (catId: string) => {
    const cat = CX_INDEX.find((c) => c.id === catId);
    setOpenCats(() => onlyCatOpen(catId));
    if (catId === "projects") {
      setView({ kind: "entry", cat: "projects", entry: DEFAULT_PROJECT_CAT });
      setHeaderExpanded(false);
      soundNav();
    } else if (catId === "logs") {
      setView({ kind: "entry", cat: "logs", entry: DEFAULT_LOG_CAT });
      setHeaderExpanded(false);
      soundNav();
    } else if (cat?.rootIsGrid) {
      setView({ kind: "grid", cat: catId });
      setHeaderExpanded(false);
      soundNav();
    } else if (cat?.rootIsCombo) {
      setView({ kind: "entry", cat: catId, entry: cat.entries[0].id });
      setHeaderExpanded(false);
      soundNav();
    } else if (cat) {
      const first = cat.entries[0];
      if (first) {
        setView({ kind: "entry", cat: catId, entry: first.id });
        setHeaderExpanded(false);
        soundNav();
      }
    }
  };

  const _projCatIds = PROJECT_CATEGORIES.map((c) => c.id);
  const _logCatIds  = LOG_CATEGORIES.map((c) => c.id);

  const selectEntry = (catId: string, entryId: string) => {
    setHeaderExpanded(false);
    if (catId === "projects") {
      if (entryId === "overview" || _projCatIds.includes(entryId)) {
        setView({ kind: "entry", cat: "projects", entry: entryId });
        setOpenCats(onlyCatOpen("projects"));
        soundNav();
      } else {
        const activeCat = view.cat === "projects" && view.kind === "entry" ? view.entry : undefined;
        const pool = activeCat ? getProjectsForCategory(activeCat) : PROJECTS;
        const siblings = pool.map((p) => ({ kind: "project" as const, id: p.id }));
        openModal({ kind: "project", id: entryId, siblings });
      }
    } else if (catId === "logs") {
      if (entryId === "overview" || _logCatIds.includes(entryId)) {
        setView({ kind: "entry", cat: "logs", entry: entryId });
        setOpenCats(onlyCatOpen("logs"));
        soundNav();
      } else {
        const activeCat = view.cat === "logs" && view.kind === "entry" ? view.entry : undefined;
        const pool = activeCat ? getLogsForCategory(activeCat) : LOGS;
        const siblings = pool.map((a) => ({ kind: "log" as const, id: a.id }));
        openModal({ kind: "log", id: entryId, siblings });
      }
    } else {
      setView({ kind: "entry", cat: catId, entry: entryId });
      setOpenCats(onlyCatOpen(catId));
      soundNav();
    }
  };

  // Push a view history entry when the section changes (not on initial render or popstate
  // restore), then update the URL of that entry. Push must come before replaceState so
  // the URL lands on the new entry, not the outgoing one.
  useEffect(() => {
    const viewChanged = prevViewRef.current !== view;
    prevViewRef.current = view;

    if (viewChanged && !_suppressViewPush.current) {
      history.pushState({ _type: "view" }, "");
    }
    if (viewChanged) _suppressViewPush.current = false;

    history.replaceState(history.state, "", statePath(view, modal));
  }, [view, modal]);

  useEffect(() => {
    function onPopState(e: PopStateEvent) {
      if (skipNextPopState.current) { skipNextPopState.current = false; return; }
      if (e.state?._type === "modal") {
        // Restore the full modal stack stored in this history entry
        const stack: ModalState[] = e.state.stack ?? [];
        soundClick();
        setModalStack(stack);
        return;
      }
      // View entry (or the initial entry) — restore full state from the URL the browser restored
      soundNav();
      const parsed = parseUrl();
      _suppressViewPush.current = true;
      setView(parsed?.view ?? { kind: "home" });
      setOpenCats(parsed?.openCats ?? { personnel: true, services: false, projects: false, logs: false, contact: false });
      setHeaderExpanded(parsed?.view.kind === "home");
      setModalStack([]);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const BASE = "Pawper.dev";
    let title = BASE;
    if (modal) {
      if (modal.kind === "project") {
        const p = PROJECTS.find((p) => p.id === modal.id);
        if (p) title = `${p.description} · Pawper.dev`;
      } else if (modal.kind === "log") {
        const a = LOGS.find((a) => a.id === modal.id);
        if (a) title = `${a.title} · Pawper.dev`;
      } else if (modal.kind === "skill") {
        title = `${modal.id} · Pawper.dev`;
      } else if (modal.kind === "experience") {
        const exp = EXPERIENCES.find((e) => e.id === modal.id);
        if (exp) title = `${exp.title} · Pawper.dev`;
      } else if (modal.kind === "search") {
        title = `Search · Pawper.dev`;
      }
    } else if (view.kind !== "home") {
      const cat = CX_INDEX.find((c) => c.id === view.cat);
      if (view.kind === "grid") {
        title = `${cat?.label ?? "Projects"} · Pawper.dev`;
      } else if (view.kind === "entry" && view.entry) {
        const entry = cat?.entries.find((e) => e.id === view.entry);
        const label = entry?.label ?? (view.entry.charAt(0).toUpperCase() + view.entry.slice(1));
        title = `${label} · Pawper.dev`;
      }
    }
    document.title = title;
  }, [view, modal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (navOpen) { setNavOpen(false); return; }
      if (modal) { closeModal(); } else { goHome(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, navOpen]);

  // Collapse header and close nav when switching to mobile (skip initial mount)
  useEffect(() => {
    if (isMobileFirstRun.current) { isMobileFirstRun.current = false; return; }
    if (isMobile) {
      setHeaderExpanded(false);
      setNavOpen(false);
    }
  }, [isMobile]);

  const sectionMeta = CX_INDEX.find((c) => c.id === view.cat) ?? {
    accent: "rgba(255,255,255,0.8)",
    accentDeep: "rgba(255,255,255,0.95)",
    accentRgb: "255, 255, 255",
    accentLight: undefined,
    accentDeepLight: undefined,
    accentRgbLight: undefined,
  };

  return (
    <div
      className="pw-artboard"
      data-theme={theme}
      style={{
        background: theme === "dark" ? "#04060c" : "#0a1320",
        "--section-accent": theme === "light" ? (sectionMeta.accentLight ?? sectionMeta.accent) : sectionMeta.accent,
        "--section-deep":   theme === "light" ? (sectionMeta.accentDeepLight ?? sectionMeta.accentDeep) : sectionMeta.accentDeep,
        "--section-rgb":    theme === "light" ? (sectionMeta.accentRgbLight ?? sectionMeta.accentRgb) : sectionMeta.accentRgb,
      } as React.CSSProperties}
    >
      <Backdrop url={BACKDROPS.alpine} />
      <div className="pw-scanlines" />

      {/* Main layout grid */}
      <div className={`cx-main-grid${isMobile && headerExpanded ? " cx-layout-brief-open" : ""}`} style={{
        position: "relative", zIndex: 1,
        display: "grid",
        gridTemplateRows: isMobile
          ? (headerExpanded ? "calc(100dvh - 158px) 140px" : "33px calc(100dvh - 51px)")
          : "auto 1fr",
        gridTemplateColumns: isMobile ? "1fr" : "320px 1fr",
        gap: isMobile ? 6 : 16,
        padding: isMobile ? 6 : "18px 24px 24px",
        height: "100%",
        boxSizing: "border-box",
      }}>
        {/* Header — spans all columns; on mobile tapping the collapsed bar expands it */}
        <div
          style={{ gridColumn: "1 / -1", cursor: isMobile && !headerExpanded ? "pointer" : "default", minHeight: 0, overflow: "hidden" }}
          onClick={() => { if (isMobile && !headerExpanded) { setHeaderExpanded(true); soundDive(); } }}
        >
          <CXHeader
            expanded={headerExpanded}
            onToggle={() => setHeaderExpanded((e) => !e)}
            view={view}
            onHome={goHome}
            onContact={() => { setView({ kind: "entry", cat: "contact", entry: "all" }); setHeaderExpanded(false); soundNav(); }}
            onResume={() => { setView({ kind: "entry", cat: "personnel", entry: "resume" }); setOpenCats(onlyCatOpen("personnel")); setHeaderExpanded(false); soundNav(); }}
            onService={(entryId) => { setView({ kind: "entry", cat: "services", entry: entryId }); setOpenCats(onlyCatOpen("services")); setHeaderExpanded(false); soundNav(); }}
            theme={theme}
            onThemeToggle={toggleTheme}
            openModal={openModal}
            onMenuOpen={isMobile ? () => setNavOpen(true) : undefined}
          />
        </div>

        {/* Index rail — desktop: grid child; mobile: fixed drawer */}
        {!isMobile && (
          <div className="pw-lcars" style={{
            "--lcars-radius": "2px 48px 0px 2px",
            "--lcars-bottom": "0px",
            "--lcars-t": "8px",
            "--lcars-r": "0px",
            "--lcars-color": `rgba(var(--section-rgb), 0.65)`,
            position: "relative",
            display: "flex", flexDirection: "column", minHeight: 0,
          } as React.CSSProperties}>
            <CXIndex
              view={view}
              openCats={openCats}
              onCategory={selectCategory}
              onEntry={selectEntry}
              onHome={goHome}
              openModal={openModal}
            />
          </div>
        )}

        {/* Reading panel */}
        <div className="pw-lcars cx-reading-panel" style={{
          "--lcars-bottom": "18px",
          "--lcars-bottom-soft": "18px",
          "--lcars-before-l": "17px",
          "--lcars-before-b": "29px",
          "--lcars-r-soft": "39px 4px 4px 39px / 27px 4px 4px 27px",
          "--lcars-color": `rgba(var(--section-rgb), 0.65)`,
          "--lcars-color-soft": `rgba(var(--section-rgb), 0.12)`,
          position: "relative",
          minHeight: 0,
        } as React.CSSProperties}>
          <div ref={readingPanelRef} className={`pw-glass${isMobile && headerExpanded ? " cx-panel-header-open" : ""}`} style={{
            borderRadius: isMobile ? "0px 8px 16px 56px" : "56px 8px 8px 56px",
            padding: 0, height: "100%",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <CXMain
              view={view}
              selectEntry={selectEntry}
              selectCategory={selectCategory}
              setView={setView}
              setHeaderExpanded={setHeaderExpanded}
              openModal={openModal}
            />
          </div>
          {/* On mobile: tap reading panel to collapse expanded header */}
          {isMobile && headerExpanded && (
            <div
              onClick={() => { soundDive(); setHeaderExpanded(false); }}
              style={{ position: "absolute", inset: 0, zIndex: 5, cursor: "pointer" }}
            />
          )}
        </div>
      </div>

      {/* Mobile nav backdrop + drawer */}
      {isMobile && navOpen && (
        <div onClick={() => { soundClick(); setNavOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.55)" }} />
      )}
      {isMobile && (
        <div className="pw-lcars-strip-r" style={{
          "--lcars-color": "rgba(var(--section-rgb), 0.65)",
          "--lcars-t": "8px", "--lcars-r": "8px",
          position: "fixed", top: 0, right: 0, bottom: 0, width: 300, zIndex: 200,
          transform: navOpen ? "translateX(0)" : "translateX(340px)",
          transition: "transform .3s cubic-bezier(.2,.7,.3,1)",
          display: "flex", flexDirection: "column",
        } as React.CSSProperties}>
          {/* Sound + theme controls on the right stripe */}
          <div style={{ position: "absolute", top: 8, right: 17, zIndex: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            {(["sound", "theme"] as const).map((kind) => {
              const active = kind === "sound" ? soundOn : theme === "light";
              const bg = `rgba(var(--section-rgb), ${active ? 0.80 : 0.45})`;
              return (
                <button key={kind} onClick={kind === "sound" ? soundToggle : toggleTheme}
                  style={{ width: 22, height: 22, borderRadius: "3px 0 0 3px", border: "none", cursor: "pointer", background: bg, color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, padding: 0, transition: "background .2s" }}>
                  {kind === "sound"
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4.5H4L7 2V10L4 7.5H2V4.5Z" fill="currentColor"/>
                        {soundOn && <>
                          <path d="M8.5 4C9.2 4.7 9.2 7.3 8.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          <path d="M10 2.5C11.5 4 11.5 8 10 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </>}
                      </svg>
                    : "◑"}
                </button>
              );
            })}
          </div>
          <CXIndex
            view={view}
            openCats={openCats}
            onCategory={(id) => {
              const cat = CX_INDEX.find((c) => c.id === id);
              if (cat && !cat.rootIsGrid && !cat.rootIsCombo) {
                setOpenCats((prev) => ({ ...allCatsClosed(), [id]: !prev[id] }));
              } else {
                selectCategory(id);
                setNavOpen(false);
              }
            }}
            onEntry={(cat, id) => { selectEntry(cat, id); setNavOpen(false); }}
            onHome={() => { goHome(); setNavOpen(false); }}
            openModal={openModal}
            onClose={() => setNavOpen(false)}
            side="right"
          />
        </div>
      )}

      {/* Status bar */}
      <StatusBar />

      {modal && <CXModal modal={modal} previousModal={modalStack.length > 1 ? modalStack[modalStack.length - 2] : undefined} onClose={closeModal} onBack={modalStack.length > 1 ? backModal : undefined} onNavigate={navigateModal} onSiblingNav={replaceModal} onPatchModal={patchModal} logsHtml={logsHtml} theme={theme} onNavigateToCategory={(catId) => { closeModal(); selectEntry("projects", catId); }}
        onNavigateToLogCategory={(catId) => { closeModal(); selectEntry("logs", catId); }}
        onNavigateToService={(serviceId) => { closeModal(); selectEntry("services", serviceId); }} />}
    </div>
  );
}

export default function App({ logsHtml, logs }: AppProps) {
  initLogs(logs);
  return (
    <SoundProvider>
      <AppInner logsHtml={logsHtml} />
    </SoundProvider>
  );
}
