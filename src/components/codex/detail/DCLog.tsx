
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { LOGS, slugify } from "../../../data/content";
import Tap from "../../shared/Tap";
import CXPill from "../CXPill";
import { enhanceProse } from "./proseEnhance";
import { SidebarTagGroups, SidebarTOC } from "./DCDetailSidebar";
import { soundClick } from "../../../context/SoundContext";


interface DCLogProps {
  id: string;
  html: string;
  onOpenLog?: (id: string) => void;
  onOpenProject?: (id: string) => void;
  onOpenSeries?: (slug: string) => void;
  onOpenService?: (service: string) => void;
  onOpenMedia?: (src: string, alt: string) => void;
}

export function extractHeadings(html: string): Array<{ text: string; anchorId: string }> {
  const headings: Array<{ text: string; anchorId: string }> = [];
  const re = /<h([23])\s[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[3].replace(/<[^>]+>/g, "").trim();
    if (text) headings.push({ text, anchorId: m[2] });
  }
  return headings;
}

export default function DCLog({ id, html, onOpenLog, onOpenProject, onOpenSeries, onOpenService, onOpenMedia }: DCLogProps) {
  const a = LOGS.find((x) => x.id === id) ?? LOGS[0];
  const proseRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  const [tocExpanded, setTocExpanded] = useState(false);
  const headings = extractHeadings(html);
  const seriesLogs = a.series
    ? LOGS.filter(x => x.series?.name === a.series!.name).sort((x, y) => x.series!.part - y.series!.part)
    : [];
  const currentIdx = seriesLogs.findIndex(s => s.id === id);
  const visibleLogs = seriesLogs.filter((_, i) => i >= currentIdx - 1 && i <= currentIdx + 1);
  const seriesUnreleased = a.series ? Math.max(0, a.series.total - seriesLogs.length) : 0;

  useLayoutEffect(() => {
    const el = proseRef.current;
    if (!el) return;
    el.innerHTML = html || '<p>Content not found.</p>';
    return enhanceProse(el, { onOpenProject, onOpenLog, onOpenSeries, onOpenService, onOpenMedia });
  }, [html]);

  useEffect(() => {
    if (!tocExpanded) return;
    const toc = tocRef.current;
    if (!toc) return;
    let scroller: Element | null = toc.parentElement;
    while (scroller && !scroller.hasAttribute("data-overlayscrollbars-viewport")) {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;
    const onScroll = () => setTocExpanded(false);
    const timer = setTimeout(() => {
      scroller!.addEventListener("scroll", onScroll, { passive: true });
    }, 300);
    return () => {
      clearTimeout(timer);
      scroller!.removeEventListener("scroll", onScroll);
    };
  }, [tocExpanded]);

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {a.image && (
        <div style={{ maxHeight: "33vh", overflow: "hidden", borderRadius: 14, display: "flex", alignItems: "center" }}>
          <img src={a.image} alt="" style={{ width: "100%", display: "block" }} />
        </div>
      )}
      <div className="cx-log-meta-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="pw-eyebrow pw-eyebrow-green">{a.kicker}</div>
        {a.series && (
          <span className="pw-mono" style={{ fontSize: 10, color: "var(--section-deep)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            <span className="cx-log-meta-sep">· </span>{a.series.name} · Pt {a.series.part}/{a.series.total}
          </span>
        )}
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2, margin: 0 }}>{a.title}</h1>
      <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
        <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>{a.date}</span>
        <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
          · {a.words} words · ~{Math.round(a.words / 240)} min
        </span>
      </div>

      {a.series && seriesLogs.length > 0 && (
        <div className="cx-mobile-series pw-glass-dim" style={{ padding: "12px 16px", borderRadius: 14, flexDirection: "column", gap: 2 }}>
          <Tap
            onClick={() => a.series && onOpenSeries?.(slugify(a.series.name))}
            className="cx-toc-item"
            style={{ display: "flex", flexDirection: "column", gap: 3, margin: "-12px -16px 6px", padding: "12px 16px 8px", borderRadius: "14px 14px 0 0" }}
          >
            <div className="pw-eyebrow" style={{ color: "var(--section-deep)", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="10" viewBox="0 0 122.88 111.96" fill="var(--section-accent)">
                <path d="M61.15,0L0,26.52l61.41,24.96l61.47-24.88L61.15,0L61.15,0z M122.88,57.12L95.46,45.31L62.73,58.56c-0.88,0.36-1.83,0.33-2.65,0L27.27,45.22L0,57.05L61.41,82L122.88,57.12L122.88,57.12z M96.14,75.56L62.73,89.08c-0.88,0.36-1.83,0.33-2.65,0L26.59,75.47L0,87.01l61.41,24.96l61.47-24.88L96.14,75.56L96.14,75.56z"/>
              </svg>
              Series
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{a.series.name}</div>
          </Tap>
          {visibleLogs.map((s) => {
            const isCurrent = s.id === id;
            return (
              <Tap
                key={s.id}
                className="cx-toc-item"
                onClick={() => onOpenLog?.(s.id)}
                style={{ padding: "4px 8px", display: "flex", gap: 8, alignItems: "flex-start", background: isCurrent ? "rgba(var(--section-rgb), 0.15)" : undefined, borderRadius: 6 }}
              >
                <span style={{ fontFamily: "'Bebas Neue', var(--font-sans)", fontSize: 26, lineHeight: 1, color: "var(--section-accent)", transform: "scaleY(1.12)", transformOrigin: "top center", flexShrink: 0 }}>
                  {String(s.series!.part).padStart(2, "0")}
                </span>
                <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.3, fontWeight: isCurrent ? 600 : 400 }}>{s.title}</span>
                  <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>~{Math.round(s.words / 240)} min</span>
                </span>
              </Tap>
            );
          })}
          {seriesUnreleased > 0 && currentIdx === seriesLogs.length - 1 && (
            <div style={{ padding: "4px 8px", display: "flex", gap: 8, alignItems: "flex-start", opacity: 0.45 }}>
              <span style={{ fontFamily: "'Bebas Neue', var(--font-sans)", fontSize: 26, lineHeight: 1, color: "var(--section-accent)", transform: "scaleY(1.12)", transformOrigin: "top center", flexShrink: 0 }}>
                {String(seriesLogs[seriesLogs.length - 1].series!.part + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <span className="pw-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--section-deep)" }}>COMING SOON</span>
              </span>
            </div>
          )}
        </div>
      )}

      {headings.length > 0 && (
        <div ref={tocRef} className="cx-mobile-toc" style={{ position: "sticky", top: 0, zIndex: 5 }}>
          <div className="pw-glass-dim" style={{ borderRadius: 10, overflow: "hidden", background: "#262a31" }}>
            <Tap
              onClick={() => { soundClick(); setTocExpanded(e => !e); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer" }}
            >
              <span className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>In this entry</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>{headings.length}</span>
                <span style={{ fontSize: 10, color: "var(--ink-mute)", transition: "transform 0.2s", display: "inline-block", transform: tocExpanded ? "rotate(180deg)" : "none" }}>▾</span>
              </span>
            </Tap>
            <div style={{
              maxHeight: tocExpanded ? headings.length * 45 : 0,
              overflow: "hidden",
              transition: "max-height 0.35s cubic-bezier(.2,.7,.3,1)",
            }}>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
                {headings.map((h) => (
                  <Tap
                    key={h.anchorId}
                    onClick={() => {
                      let el: HTMLElement | null = proseRef.current?.querySelector(`[id="${h.anchorId}"]`) as HTMLElement | null;
                      if (!el && proseRef.current) {
                        for (const heading of proseRef.current.querySelectorAll("h2, h3")) {
                          if (heading.textContent?.trim() === h.text) { el = heading as HTMLElement; break; }
                        }
                      }
                      if (el && tocRef.current) {
                        let viewport: Element | null = tocRef.current.parentElement;
                        while (viewport && !viewport.hasAttribute("data-overlayscrollbars-viewport")) {
                          viewport = viewport.parentElement;
                        }
                        if (viewport) {
                          const tocHeight = tocRef.current?.offsetHeight ?? 0;
                          const offset = el.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop - tocHeight - 16;
                          viewport.scrollTo({ top: offset, behavior: "smooth" });
                        } else {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }
                      setTocExpanded(false);
                    }}
                    style={{ padding: "8px 14px", fontSize: 13, color: "var(--ink-soft)", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {h.text}
                  </Tap>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={proseRef} className="pw-article-body" />
    </article>
  );
}

interface DCLogSidebarProps {
  id: string;
  headings: Array<{ text: string; anchorId: string }>;
  onOpenSkill?: (tag: string) => void;
  onOpenLog?: (id: string) => void;
  onOpenSeries?: (slug: string) => void;
  onNavigateToCategory?: (catId: string) => void;
}

export function DCLogSidebar({ id, headings, onOpenSkill, onOpenLog, onOpenSeries, onNavigateToCategory }: DCLogSidebarProps) {
  const a = LOGS.find((x) => x.id === id) ?? LOGS[0];
  const seriesLogs = a.series
    ? LOGS.filter(x => x.series?.name === a.series!.name).sort((x, y) => x.series!.part - y.series!.part)
    : [];
  const seriesUnreleased = a.series ? Math.max(0, a.series.total - seriesLogs.length) : 0;
  const currentIdx = seriesLogs.findIndex(s => s.id === id);
  const visibleLogs = seriesLogs.filter((_, i) => i >= currentIdx - 1 && i <= currentIdx + 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 230 }}>
      {a.series && seriesLogs.length > 0 && (
        <div className="pw-glass-dim cx-sidebar-series" style={{ padding: "12px 16px", borderRadius: 14, display: "flex", flexDirection: "column", gap: 2 }}>
          <Tap
            onClick={() => a.series && onOpenSeries?.(slugify(a.series.name))}
            className="cx-toc-item"
            style={{ display: "flex", flexDirection: "column", gap: 3, margin: "-12px -16px 6px", padding: "12px 16px 8px", borderRadius: "14px 14px 0 0" }}
          >
            <div className="pw-eyebrow" style={{ color: "var(--section-deep)", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="10" viewBox="0 0 122.88 111.96" fill="var(--section-accent)">
                <path d="M61.15,0L0,26.52l61.41,24.96l61.47-24.88L61.15,0L61.15,0z M122.88,57.12L95.46,45.31L62.73,58.56c-0.88,0.36-1.83,0.33-2.65,0L27.27,45.22L0,57.05L61.41,82L122.88,57.12L122.88,57.12z M96.14,75.56L62.73,89.08c-0.88,0.36-1.83,0.33-2.65,0L26.59,75.47L0,87.01l61.41,24.96l61.47-24.88L96.14,75.56L96.14,75.56z"/>
              </svg>
              Series
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{a.series.name}</div>
          </Tap>
          {visibleLogs.map((s) => {
            const isCurrent = s.id === id;
            return (
              <Tap
                key={s.id}
                className="cx-toc-item"
                onClick={() => onOpenLog?.(s.id)}
                style={{ padding: "4px 8px", display: "flex", gap: 8, alignItems: "flex-start", background: isCurrent ? "rgba(var(--section-rgb), 0.15)" : undefined, borderRadius: 6 }}
              >
                <span style={{
                  fontFamily: "'Bebas Neue', var(--font-sans)",
                  fontSize: 26, lineHeight: 1,
                  color: "var(--section-accent)",
                  transform: "scaleY(1.12)", transformOrigin: "top center",
                  flexShrink: 0,
                }}>
                  {String(s.series!.part).padStart(2, "0")}
                </span>
                <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.3, fontWeight: isCurrent ? 600 : 400 }}>
                    {s.title}
                  </span>
                  <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>
                    ~{Math.round(s.words / 240)} min
                  </span>
                </span>
              </Tap>
            );
          })}
          {seriesUnreleased > 0 && currentIdx === seriesLogs.length - 1 && (
            <div style={{ padding: "4px 8px", display: "flex", gap: 8, alignItems: "flex-start", opacity: 0.45 }}>
              <span style={{
                fontFamily: "'Bebas Neue', var(--font-sans)",
                fontSize: 26, lineHeight: 1,
                color: "var(--section-accent)",
                transform: "scaleY(1.12)", transformOrigin: "top center",
                flexShrink: 0,
              }}>
                {String(seriesLogs[seriesLogs.length - 1].series!.part + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <span className="pw-mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--section-deep)" }}>COMING SOON</span>
              </span>
            </div>
          )}
        </div>
      )}
      <div className="pw-glass-dim" style={{ padding: "10px 16px", borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>Category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          <CXPill
            variant="secondary" active
            onClick={onNavigateToCategory ? () => onNavigateToCategory(slugify(a.kicker)) : undefined}
            style={onNavigateToCategory ? undefined : { cursor: "default" }}
          >
            {a.kicker}
          </CXPill>
        </div>
      </div>
      <SidebarTagGroups tags={a.tags ?? []} onOpen={onOpenSkill} />
      <SidebarTOC headings={headings} label="In this entry" />
    </div>
  );
}
