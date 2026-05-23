import { useRef, useEffect, useState } from "react";
import { PROJECTS, getStackLabel, getPrimaryColor } from "../../../data/content";
import Tap from "../../shared/Tap";
import { enhanceProse } from "./proseEnhance";
import { SidebarTagGroups, SidebarTOC } from "./DCDetailSidebar";
import CXPill from "../CXPill";
import { soundClick, soundHover } from "../../../context/SoundContext";


interface DCProjectProps {
  id: string;
}

function LangBar({ languages }: { languages: Record<string, { percent: string; color: string }> }) {
  const entries = Object.entries(languages);
  return (
    <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", gap: 1 }}>
      {entries.map(([lang, { percent, color }]) => (
        <div key={lang} style={{ width: `${percent}%`, background: color, minWidth: 3 }} />
      ))}
    </div>
  );
}

function LangLegend({ languages, onOpen }: {
  languages: Record<string, { percent: string; color: string }>;
  onOpen?: (lang: string, color: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {Object.entries(languages).map(([lang, { percent, color }]) => (
        <Tap
          key={lang}
          onClick={() => onOpen?.(lang, color)}
          className="cx-lang-item"
          style={{ "--lang-color": color, display: "flex", alignItems: "center", gap: 8, cursor: onOpen ? "pointer" : "default", padding: "4px 8px" } as React.CSSProperties}
        >
          <span style={{ width: 10, height: 10, borderRadius: 999, background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, flex: 1 }}>{lang}</span>
          <span className="pw-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{percent}%</span>
        </Tap>
      ))}
    </div>
  );
}

function extractHeadings(html: string): Array<{ text: string; anchorId: string }> {
  const headings: Array<{ text: string; anchorId: string }> = [];
  const clean = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

  // New GitHub API format: markdown-heading wrapper + user-content- anchor id
  const newRe = /class="markdown-heading"[^>]*><h(2)[^>]*>([\s\S]*?)<\/h\1>[\s\S]*?id="(user-content-[^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = newRe.exec(html)) !== null) {
    const text = clean(m[2]);
    if (text) headings.push({ text, anchorId: m[3] });
  }
  if (headings.length) return headings;

  // Old GitHub API format: plain <h2 dir="auto"> with no anchor ids
  const oldRe = /<h(2)[^>]*>([\s\S]*?)<\/h\1>/g;
  while ((m = oldRe.exec(html)) !== null) {
    const text = clean(m[2]);
    if (text) headings.push({ text, anchorId: text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") });
  }
  return headings;
}

export default function DCProject({ id }: DCProjectProps) {
  const p = PROJECTS.find((x) => x.id === id) ?? PROJECTS[0];
  const proseRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = proseRef.current;
    if (!el) return;
    return enhanceProse(el);
  }, []);
  const swatch = getPrimaryColor(p);
  const dateStr = p.pushedAt.slice(0, 10).replace(/-/g, ".");
  const readmeWords = p.readme
    ? p.readme.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length
    : 0;
  const [heroHovered, setHeroHovered] = useState(false);
  const [readmeExpanded, setReadmeExpanded] = useState(false);
  const [expandInstant, setExpandInstant] = useState(false);
  const [proseHeight, setProseHeight] = useState(0);
  const [tocExpanded, setTocExpanded] = useState(false);
  const headings = p.readme ? extractHeadings(p.readme) : [];

  useEffect(() => {
    const el = proseRef.current;
    if (!el) return;
    requestAnimationFrame(() => setProseHeight(el.scrollHeight));
  }, [p.readme]);

  useEffect(() => {
    if (!tocExpanded) return;
    function onDoc(e: MouseEvent) {
      if (tocRef.current && !tocRef.current.contains(e.target as Node)) {
        setTocExpanded(false);
      }
    }
    function onScroll() { setTocExpanded(false); }
    document.addEventListener("click", onDoc, { capture: true });
    document.addEventListener("touchmove", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("click", onDoc, { capture: true });
      document.removeEventListener("touchmove", onScroll, { capture: true });
    };
  }, [tocExpanded]);

  const heroContent = (
    <div style={{
      borderRadius: 14, overflow: "hidden", maxHeight: "33vh", position: "relative",
      backgroundColor: swatch,
      ...(!p.image ? { aspectRatio: "16/5", background: `linear-gradient(135deg, ${swatch}, ${swatch}cc 50%, rgba(0,0,0,0.4))` } : {}),
    }}>
      {p.image && <img src={p.image} alt="" style={{ width: "100%", display: "block" }} />}
      {p.webURL && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at bottom right, rgba(0,0,0,0.72) 0%, transparent 65%)",
          opacity: heroHovered ? 1 : 0,
          transition: "opacity 0.18s",
          display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
          padding: "0 20px 16px 0",
        }}>
          <span style={{ color: "white", fontSize: 17, fontWeight: 600, letterSpacing: "0.04em" }}>Open project ↗</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Hero image */}
      {p.webURL ? (
        <a
          href={p.webURL} target="_blank" rel="noopener noreferrer"
          style={{ display: "block", textDecoration: "none", cursor: "pointer" }}
          onMouseEnter={() => { setHeroHovered(true); soundHover(); }}
          onMouseLeave={() => setHeroHovered(false)}
          onClick={soundClick}
        >
          {heroContent}
        </a>
      ) : heroContent}

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>{getStackLabel(p)}</div>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.2, margin: 0 }}>{p.description}</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>{dateStr}</span>
          {readmeWords > 0 && (
            <span className="pw-mono" style={{ fontSize: 12, color: "var(--ink-mute)" }}>
              · {readmeWords} words · ~{Math.round(readmeWords / 240)} min
            </span>
          )}
        </div>
      </div>

      {headings.length > 0 && (
        <div ref={tocRef} className="cx-mobile-toc" style={{ position: "sticky", top: 0, zIndex: 5 }}>
          <div className="pw-glass-dim" style={{ borderRadius: 10, overflow: "hidden" }}>
            <Tap
              onClick={() => { soundClick(); setTocExpanded(e => !e); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer" }}
            >
              <span className="pw-eyebrow" style={{ color: "var(--acc-blue-deep)" }}>In this readme</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>{headings.length}</span>
                <span style={{ fontSize: 10, color: "var(--ink-mute)", transition: "transform 0.2s", display: "inline-block", transform: tocExpanded ? "rotate(180deg)" : "none" }}>▾</span>
              </span>
            </Tap>
            {tocExpanded && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
                {headings.map((h) => (
                  <Tap
                    key={h.anchorId}
                    onClick={() => {
                      soundClick();
                      setTocExpanded(false);
                      const doScroll = () => {
                        let el: HTMLElement | null = null;
                        const anchor = document.getElementById(h.anchorId);
                        if (anchor) {
                          el = (anchor.closest(".markdown-heading") as HTMLElement)
                            ?? (anchor.closest("h2,h3") as HTMLElement)
                            ?? anchor;
                        }
                        if (!el) {
                          const prose = document.querySelector(".pw-prose");
                          if (prose) {
                            for (const heading of prose.querySelectorAll("h2, h3")) {
                              if (heading.textContent?.trim() === h.text) { el = heading as HTMLElement; break; }
                            }
                          }
                        }
                        if (el) {
                          const tocHeight = tocRef.current?.offsetHeight ?? 44;
                          el.style.scrollMarginTop = `${tocHeight + 8}px`;
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      };
                      if (!readmeExpanded) {
                        setExpandInstant(true);
                        setReadmeExpanded(true);
                        requestAnimationFrame(() => {
                          setExpandInstant(false);
                          const tocHeight = tocRef.current?.offsetHeight ?? 44;
                          if (proseRef.current) proseRef.current.style.scrollMarginTop = `${tocHeight}px`;
                          proseRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
                          doScroll();
                        });
                      } else {
                        doScroll();
                      }
                    }}
                    style={{ padding: "8px 14px", fontSize: 13, color: "var(--ink-soft)", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {h.text}
                  </Tap>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {p.readme && (
        <div style={{ position: "relative" }}>
          <div
            ref={proseRef}
            className="pw-prose cx-readme-prose"
            dangerouslySetInnerHTML={{ __html: p.readme }}
            style={{
              fontSize: 14, lineHeight: 1.65, color: "var(--ink-soft)",
              maxHeight: readmeExpanded ? (proseHeight || 6000) : 260,
              overflow: "hidden",
              transition: expandInstant ? "none" : "max-height 1.4s cubic-bezier(.2,.7,.3,1)",
              WebkitMaskImage: readmeExpanded ? "none" : "linear-gradient(to bottom, black 45%, transparent 100%)",
              maskImage: readmeExpanded ? "none" : "linear-gradient(to bottom, black 45%, transparent 100%)",
            }}
          />
          <div className="cx-readme-toggle" style={{ marginTop: readmeExpanded ? 16 : -14 }}>
            <CXPill size="md" onClick={() => { soundClick(); setReadmeExpanded(e => !e); }}>
              {readmeExpanded ? "Collapse" : "Read more"}
            </CXPill>
          </div>
        </div>
      )}
    </div>
  );
}

interface DCProjectSidebarProps extends DCProjectProps {
  onOpenSkill?: (tag: string) => void;
  onOpenLanguage?: (lang: string, color: string) => void;
  onNavigateToCategory?: (catId: string) => void;
}

export function DCProjectSidebar({ id, onOpenSkill, onOpenLanguage, onNavigateToCategory }: DCProjectSidebarProps) {
  const p = PROJECTS.find((x) => x.id === id) ?? PROJECTS[0];
  const headings = p.readme ? extractHeadings(p.readme) : [];

  return (
    <div style={{ width: 230, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Languages box */}
      <div className="pw-glass-dim" style={{ padding: 18, borderRadius: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <LangBar languages={p.languages} />
        <LangLegend languages={p.languages} onOpen={onOpenLanguage} />
      </div>

      {/* Topics grouped by skill category */}
      <SidebarTagGroups tags={p.topics} onOpen={onOpenSkill} accentColor="var(--acc-blue-deep)" />

      {/* Metadata box */}
      {p.categories && p.categories.length > 0 && (
        <div className="pw-glass-dim" style={{ padding: "10px 16px", borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="pw-eyebrow" style={{ color: "var(--acc-blue-deep)" }}>Category</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {p.categories.map((catId) => (
            <CXPill
              key={catId}
              variant="secondary" active
              onClick={onNavigateToCategory ? () => onNavigateToCategory(catId) : undefined}
              style={onNavigateToCategory ? undefined : { cursor: "default" }}
            >
              {catId.replace(/-/g, " ")}
            </CXPill>
          ))}
          </div>
        </div>
      )}

      <SidebarTOC headings={headings} label="In this readme" accentColor="var(--acc-blue-deep)" />
    </div>
  );
}
