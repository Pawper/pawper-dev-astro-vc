
import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import { LOGS, SERVICES, PROFILE, slugify } from "../../../data/content";
import Tap from "../../shared/Tap";
import CXPill from "../CXPill";
import CXCard from "../CXCard";
import { enhanceProse } from "./proseEnhance";
import { SidebarTagGroups, SidebarTOC, ProgressDot, ArticleProgressRing } from "./DCDetailSidebar";
import { soundClick, soundHover } from "../../../context/SoundContext";
import { getProgress, checkSection, uncheckSection } from "../../../utils/logProgress";
import { useTheme } from "../../../hooks/useTheme";
import { clampEyebrowColor } from "../../../utils/color";

function getMentorPurpleVars(isDark: boolean): React.CSSProperties {
  return {
    "--section-accent": "#9055e8",
    "--section-deep": clampEyebrowColor(isDark ? "#c49ef8" : "#9055e8", isDark),
    "--section-rgb": "144, 85, 232",
  } as React.CSSProperties;
}

const KOFI_URL = "https://ko-fi.com/pawper";

function MentorLink({
  children,
  onClick,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const theme = useTheme();
  const isDark = theme === "dark";
  const color = isDark ? "#b48bff" : "#5b2eb8";
  const style: React.CSSProperties = {
    color,
    border: "none",
    font: "inherit",
    fontSize: 13,
    fontWeight: 500,
  };
  if (href) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="cx-section-eyebrow-link"
        style={style}
        onMouseEnter={() => soundHover()}
        onClick={() => soundClick()}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      onMouseEnter={() => soundHover()}
      onClick={() => { soundClick(); onClick?.(); }}
      className="cx-section-eyebrow-link"
      style={style}
    >
      {children}
    </button>
  );
}

interface DCLogProps {
  id: string;
  html: string;
  anchor?: string;
  onOpenLog?: (id: string, anchor?: string) => void;
  onOpenProject?: (id: string) => void;
  onOpenSeries?: (slug: string) => void;
  onOpenService?: (service: string) => void;
  onOpenMedia?: (src: string, alt: string, siblings?: Array<{ kind: "media"; id: string; label?: string }>) => void;
}

export function extractHeadings(html: string): Array<{ text: string; anchorId: string }> {
  const headings: Array<{ text: string; anchorId: string }> = [];
  const re = /<h(2)\s[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[3].replace(/<[^>]+>/g, "").trim();
    if (text) headings.push({ text, anchorId: m[2] });
  }
  return headings;
}

export default function DCLog({ id, html, anchor, onOpenLog, onOpenProject, onOpenSeries, onOpenService, onOpenMedia }: DCLogProps) {
  const a = LOGS.find((x) => x.id === id) ?? LOGS[0];
  const theme = useTheme();
  const isDark = theme === "dark";
  const mentorPurpleVars = getMentorPurpleVars(isDark);
  const proseRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  const [tocExpanded, setTocExpanded] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [progress, setProgress] = useState(() => getProgress(a.id));

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.slug || detail.slug === a.id) {
        setProgress(getProgress(a.id));
        if (e.type === "pw-progress-reset") setResetKey(k => k + 1);
      }
    };
    window.addEventListener("pw-progress-update", handler);
    window.addEventListener("pw-progress-reset", handler);
    return () => {
      window.removeEventListener("pw-progress-update", handler);
      window.removeEventListener("pw-progress-reset", handler);
    };
  }, [a.id]);
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
    return enhanceProse(el, { onOpenProject, onOpenLog, onOpenSeries, onOpenService, onOpenMedia, noThumb: a?.noThumb, slug: a.id });
  }, [html, resetKey]);

  // Scroll to anchor (from link) or saved reading position when a log opens
  useEffect(() => {
    const targetId = anchor ?? getProgress(id).current;
    if (!targetId || !proseRef.current) return;
    const target = proseRef.current.querySelector<HTMLElement>(`[id="${CSS.escape(targetId)}"]`);
    if (!target) return;
    let viewport: Element | null = proseRef.current.parentElement;
    while (viewport && !viewport.hasAttribute("data-overlayscrollbars-viewport")) {
      viewport = viewport.parentElement;
    }
    const timer = setTimeout(() => {
      if (viewport) {
        const offset = target.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop - 80;
        viewport.scrollTo({ top: offset, behavior: "smooth" });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [id, anchor]);

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
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {a.updated && (
          <>
            <span className="pw-mono" style={{ fontSize: 12, color: "var(--section-deep)" }}>
              <span style={{ fontSize: 9, letterSpacing: "0.12em", opacity: 0.7, marginRight: 4 }}>UPDATED</span>{a.updated}
            </span>
            <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>·</span>
            <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
              <span style={{ fontSize: 9, letterSpacing: "0.12em", opacity: 0.7, marginRight: 4 }}>POSTED</span>{a.date}
            </span>
          </>
        )}
        {!a.updated && (
          <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>{a.date}</span>
        )}
        <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
          · {a.words} words · ~{Math.round(a.words / 240)} min
        </span>
        {headings.length > 0 && (
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {progress.checked.length > 0 && !progress.completed && (() => {
              const remaining = Math.round(a.words * (1 - progress.checked.length / headings.length));
              return (
                <>
                  <span className="pw-mono" style={{ fontSize: 11, color: "var(--section-deep)" }}>
                    ~{remaining}w · ~{Math.round(remaining / 240)} min left
                  </span>
                  <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>·</span>
                </>
              );
            })()}
            <span><ArticleProgressRing progress={progress} total={headings.length} slug={a.id} allIds={headings.map(h => h.anchorId)} /></span>
          </span>
        )}
      </div>

      {a.series && seriesLogs.length > 0 && (
        <div className="cx-mobile-series pw-glass-dim" style={{ padding: "12px 16px", borderRadius: 14, flexDirection: "column", gap: 2 }}>
          <Tap
            onClick={() => a.series && onOpenSeries?.(slugify(a.series.name))}
            className="cx-toc-item"
            style={{ display: "flex", flexDirection: "column", gap: 3, margin: "-12px -16px 6px", padding: "12px 16px 8px", borderRadius: "14px 14px 0 0" }}
          >
            <div className="pw-eyebrow" style={{ color: "var(--section-deep)", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="11" height="10" viewBox="0 0 122.88 111.96" fill="var(--section-deep)">
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
                <span style={{ fontFamily: "'Bebas Neue', var(--font-sans)", fontSize: 26, lineHeight: 1, color: "var(--section-deep)", transform: "scaleY(1.12)", transformOrigin: "top center", flexShrink: 0 }}>
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
              <span style={{ fontFamily: "'Bebas Neue', var(--font-sans)", fontSize: 26, lineHeight: 1, color: "var(--section-deep)", transform: "scaleY(1.12)", transformOrigin: "top center", flexShrink: 0 }}>
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
                <ArticleProgressRing progress={progress} total={headings.length} slug={a.id} allIds={headings.map(h => h.anchorId)} />
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
                    style={{ padding: "8px 14px", fontSize: 13, color: "var(--ink-soft)", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative" }}
                  >
                    {h.text}
                    <ProgressDot anchorId={h.anchorId} progress={progress} accentColor="var(--section-accent)"
                      onToggle={() => {
                        const allIds = headings.map(x => x.anchorId);
                        if (progress.checked.includes(h.anchorId)) uncheckSection(a.id, h.anchorId);
                        else checkSection(a.id, h.anchorId, allIds);
                      }} />
                  </Tap>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {a.mentor && (() => {
        const svc = SERVICES.find((s) => s.id === "mentoring");
        if (!svc) return null;
        return (
          <div style={mentorPurpleVars}>
            <CXCard className="cx-endorsement-card" style={{
              borderRadius: 12,
              borderLeft: "3px solid #9055e8",
              display: "flex",
              gap: 18,
              paddingLeft: 20,
            }}>
              {PROFILE.photo && (
                <img
                  src={PROFILE.photo}
                  alt={PROFILE.name}
                  className="cx-endorsement-photo"
                  style={{ width: 144, height: 144, objectFit: "cover", objectPosition: "center 35%", borderRadius: "40px 8px 40px 8px", marginTop: "16px", marginBottom: "16px", flexShrink: 0 }}
                />
              )}
              <div className="cx-endorsement-content" style={{ padding: "16px 20px 16px 0", display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="pw-eyebrow" style={{ color: "var(--section-deep)", marginBottom: 10 }}>
                  About your mentor
                </div>
                <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2, marginBottom: 10 }}>
                  {PROFILE.name}
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink-soft)", margin: "0 0 12px" }}>
                  {PROFILE.intro}
                </p>
                <div style={{ flex: 1 }} />
                <div className="cx-mentor-card-footer" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, flexWrap: "wrap",
                }}>
                  <Tap
                    className="cx-section-eyebrow-link"
                    onClick={() => onOpenService?.("mentoring")}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--section-deep)",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 300 }}>◈</span>
                    <span>Mentoring · Open</span>
                  </Tap>
                  <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                    <MentorLink href="/contact/">Ask about mentoring</MentorLink>
                    <span style={{ color: "var(--ink-mute)", fontSize: 12 }}>·</span>
                    <MentorLink href={KOFI_URL}>Tip on Ko-fi</MentorLink>
                  </div>
                </div>
              </div>
            </CXCard>
          </div>
        );
      })()}

      <div ref={proseRef} className="pw-article-body" />

      {(() => {
        const svc = SERVICES.find((s) => s.id === "mentoring");
        if (!a.mentor || !svc) return null;
        return (
          <div style={mentorPurpleVars}>
            <CXCard style={{
              padding: "24px 26px", borderRadius: 14,
              borderLeft: "4px solid #9055e8",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="pw-eyebrow cx-glass-label">{svc.kicker}</div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 1,
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--section-deep)",
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 300, display: "inline-flex", alignItems: "center" }}>◈</span>
                  Open
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2 }}>
                Receive Mentoring
              </div>
              {svc.body.map((para, i) => (
                <p key={i} style={{
                  fontSize: i === 0 ? 15 : 14,
                  lineHeight: 1.65,
                  color: i === 0 ? "var(--ink)" : "var(--ink-soft)",
                  margin: 0, textWrap: "pretty",
                } as React.CSSProperties}>
                  {para}
                </p>
              ))}
              <div style={{ display: "flex", gap: 14, marginTop: 8, justifyContent: "flex-end", flexWrap: "wrap", alignItems: "center" }}>
                <MentorLink href="/contact/">Receive Mentoring</MentorLink>
                <span style={{ color: "var(--ink-mute)", fontSize: 12 }}>·</span>
                <MentorLink href={KOFI_URL}>Tip on Ko-fi</MentorLink>
              </div>
            </CXCard>
          </div>
        );
      })()}
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
              <svg width="11" height="10" viewBox="0 0 122.88 111.96" fill="var(--section-deep)">
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
                  color: "var(--section-deep)",
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
                color: "var(--section-deep)",
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
      <SidebarTOC headings={headings} label="In this entry" slug={id} />
    </div>
  );
}
