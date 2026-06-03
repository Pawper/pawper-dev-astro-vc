import { soundHover, soundClick } from "../../../context/SoundContext";
import { PROJECTS, LOGS, slugify } from "../../../data/content";
import type { Endorsement } from "../../../data/content";
import type { Log, Project } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";
import ogLinkCacheRaw from "../../../data/og-link-cache.json";
import { getProgress, advanceBookmark, completeSection, checkSection, uncheckSection } from "../../../utils/logProgress";

const allEndorsements = endorsementsData as Endorsement[];

type Match = { kind: "language"; color: string } | { kind: "topic" } | null;

export interface ProseOptions {
  onOpenProject?: (id: string) => void;
  onOpenLog?: (id: string, anchor?: string) => void;
  onOpenSeries?: (slug: string) => void;
  onOpenService?: (service: string) => void;
  onOpenMedia?: (src: string, alt: string, siblings?: Array<{ kind: "media"; id: string; label?: string }>) => void;
  noThumb?: string[];
  slug?: string;
}

// ── Series card — matches CXSeriesPanel front card ──────────────────────────

function createSeriesCard(name: string, logs: Log[], total: number, onClick: () => void): HTMLElement {
  const unreleased = Math.max(0, total - logs.length);
  const accent = "#3fbf7a";

  const el = document.createElement("div");
  el.className = "pw-glass-dim cx-card pw-prose-ref";
  el.style.cssText = `
    border-radius: 16px; padding: 0; overflow: hidden;
    display: flex; flex-direction: column; min-height: 186px;
    border-left: 4px solid ${accent};
    cursor: pointer; box-sizing: border-box; margin: 12px;
  `;

  // Title list area
  const body = document.createElement("div");
  body.style.cssText = "flex: 1; padding: 20px 20px 14px; display: flex; flex-direction: column; gap: 10px; overflow: hidden;";

  logs.slice(0, 3).forEach((a, i) => {
    const row = document.createElement("div");
    row.style.cssText = `font-size: 13px; font-weight: ${i === 0 ? 500 : 400}; line-height: 1.35; letter-spacing: -0.1px; color: var(--ink); opacity: ${Math.max(0.08, 1 - i * 0.3)}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
    row.textContent = a.title;
    body.appendChild(row);
  });

  if (unreleased > 0) {
    const soon = document.createElement("div");
    soon.className = "pw-mono";
    soon.style.cssText = `font-size: 10px; letter-spacing: 0.16em; color: var(--section-deep); opacity: 0.55; margin-top: 2px;`;
    soon.textContent = `· ${unreleased} MORE COMING SOON`;
    body.appendChild(soon);
  }

  // Bottom stripe
  const stripe = document.createElement("div");
  stripe.style.cssText = `flex-shrink: 0; background: ${accent}; display: flex; flex-direction: row; align-items: center; padding: 10px 18px; gap: 12px;`;

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("width", "22"); icon.setAttribute("height", "20");
  icon.setAttribute("viewBox", "0 0 122.88 111.96");
  icon.style.cssText = "flex-shrink: 0;";
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "rgba(0,0,0,0.7)");
  path.setAttribute("d", "M61.15,0L0,26.52l61.41,24.96l61.47-24.88L61.15,0L61.15,0z M122.88,57.12L95.46,45.31L62.73,58.56c-0.88,0.36-1.83,0.33-2.65,0L27.27,45.22L0,57.05L61.41,82L122.88,57.12L122.88,57.12z M96.14,75.56L62.73,89.08c-0.88,0.36-1.83,0.33-2.65,0L26.59,75.47L0,87.01l61.41,24.96l61.47-24.88L96.14,75.56L96.14,75.56z");
  icon.appendChild(path);

  const info = document.createElement("div");
  info.style.cssText = "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;";

  const nameEl = document.createElement("span");
  nameEl.style.cssText = "font-size: 17px; font-weight: 500; letter-spacing: -0.3px; line-height: 1.2; color: rgba(0,0,0,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
  nameEl.textContent = name;

  const meta = document.createElement("span");
  meta.className = "pw-mono";
  meta.style.cssText = "font-size: 10px; font-weight: 700; color: rgba(0,0,0,0.72); letter-spacing: 0.12em; text-transform: uppercase;";
  const readMins = Math.round(logs.reduce((s, a) => s + a.words, 0) / 240);
  meta.textContent = unreleased > 0
    ? `${total} logs · ${logs.length} published · ~${readMins} min`
    : `${total} logs · ~${readMins} min`;

  info.appendChild(nameEl);
  info.appendChild(meta);
  stripe.appendChild(icon);
  stripe.appendChild(info);

  el.appendChild(body);
  el.appendChild(stripe);
  el.addEventListener("click", onClick);
  return el;
}

// ── Log card — matches CXNotesGrid card ──────────────────────────────────────

function createLogCard(a: Log, onClick: () => void): HTMLElement {
  const el = document.createElement("div");
  el.className = "pw-glass-dim cx-card pw-prose-ref";
  el.style.cssText = `
    border-radius: 16px; padding: 22px 26px;
    display: flex; flex-direction: column; gap: 12px; min-height: 170px;
    border-left: 4px solid #3fbf7a;
    cursor: pointer; box-sizing: border-box; margin: 12px;
  `;

  // Top row: kicker + date
  const top = document.createElement("div");
  top.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
  const kicker = document.createElement("span");
  kicker.className = "pw-eyebrow";
  kicker.style.color = "#1f8a5b";
  kicker.textContent = a.kicker;
  const date = document.createElement("span");
  date.className = "pw-mono";
  date.style.cssText = "font-size: 10px; color: var(--ink-mute);";
  date.textContent = a.date;
  top.appendChild(kicker);
  top.appendChild(date);

  // Title
  const title = document.createElement("div");
  title.style.cssText = "font-size: 20px; font-weight: 500; letter-spacing: -0.3px; line-height: 1.25; flex: 1; text-wrap: balance;";
  title.textContent = a.title;

  // Bottom row: words + read entry
  const bottom = document.createElement("div");
  bottom.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
  const meta = document.createElement("span");
  meta.className = "pw-mono";
  meta.style.cssText = "font-size: 11px; color: var(--ink-mute);";
  meta.textContent = `${a.words}w · ~${Math.round(a.words / 240)} min`;
  const cta = document.createElement("span");
  cta.className = "pw-mono";
  cta.style.cssText = "font-size: 11px; color: #3fbf7a; font-weight: 600;";
  cta.textContent = "Read entry ↗";
  bottom.appendChild(meta);
  bottom.appendChild(cta);

  el.appendChild(top);
  el.appendChild(title);
  el.appendChild(bottom);
  el.addEventListener("click", onClick);
  return el;
}

// ── Project card — matches CXProjectCard ────────────────────────────────────

function createProjectCard(p: Project, onClick: () => void): HTMLElement {
  const firstLang = Object.values(p.languages)[0];
  const swatch = firstLang?.color ?? "#2b8bff";

  const el = document.createElement("div");
  el.className = "pw-glass-dim cx-card cx-card-has-thumb pw-prose-ref";
  el.style.cssText = `
    border-radius: 16px; padding: 0; overflow: hidden;
    display: flex; min-height: 170px;
    border-left: 4px solid ${swatch};
    cursor: pointer; box-sizing: border-box; margin: 12px;
  `;

  // Thumbnail
  const thumb = document.createElement("div");
  thumb.className = "cx-card-thumb";
  thumb.style.cssText = `
    width: 42%; flex-shrink: 0; position: relative;
    background-image: ${p.image ? `url("${p.image}")` : "none"};
    background-size: cover; background-position: center;
    background-color: ${swatch};
  `;
  const overlay1 = document.createElement("div");
  overlay1.style.cssText = `
    position: absolute; inset: 0;
    background: linear-gradient(135deg, ${swatch}33 0%, transparent 55%, rgba(0,0,0,0.18) 100%);
    mix-blend-mode: multiply;
  `;
  const overlay2 = document.createElement("div");
  overlay2.style.cssText = `
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at top left, rgba(0,0,0,0.55) 0%, transparent 65%);
  `;
  const num = document.createElement("span");
  num.style.cssText = `
    position: absolute; top: 8px; left: 10px;
    font-family: 'Bebas Neue', var(--font-sans);
    font-size: 34px; line-height: 1; color: ${swatch};
    transform: scaleY(1.25); transform-origin: top left; z-index: 1;
    text-shadow: 0 0 12px ${swatch}88;
  `;
  num.textContent = "";
  thumb.appendChild(overlay1);
  thumb.appendChild(overlay2);
  thumb.appendChild(num);

  // Content
  const content = document.createElement("div");
  content.style.cssText = "flex: 1; min-width: 0; padding: 18px 22px 14px; display: flex; flex-direction: column; gap: 8px;";

  const topRow = document.createElement("div");
  topRow.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
  const topic = document.createElement("span");
  topic.className = "pw-mono";
  topic.style.cssText = "font-size: 10px; color: var(--ink-mute); letter-spacing: 0.18em;";
  topic.textContent = (p.topics[0] ?? "project").toUpperCase();
  const year = document.createElement("span");
  year.className = "pw-mono";
  year.style.cssText = "font-size: 10px; color: var(--ink-mute);";
  year.textContent = p.year;
  topRow.appendChild(topic);
  topRow.appendChild(year);

  const desc = document.createElement("div");
  desc.style.cssText = "font-size: 18px; font-weight: 500; letter-spacing: -0.3px; line-height: 1.2; text-wrap: balance;";
  desc.textContent = p.description;

  // Language dots
  const langs = document.createElement("div");
  langs.style.cssText = "display: flex; gap: 5px; flex-wrap: wrap; margin-top: auto;";
  Object.entries(p.languages).slice(0, 3).forEach(([lang, { color }]) => {
    const dot = document.createElement("span");
    dot.className = "pw-mono";
    dot.style.cssText = "font-size: 10px; display: inline-flex; align-items: center; gap: 4px; color: var(--ink-soft);";
    const circle = document.createElement("span");
    circle.style.cssText = `width: 8px; height: 8px; border-radius: 999px; background: ${color}; flex-shrink: 0;`;
    dot.appendChild(circle);
    dot.appendChild(document.createTextNode(lang));
    langs.appendChild(dot);
  });

  // Lang bar
  const bar = document.createElement("div");
  bar.style.cssText = "display: flex; height: 3px; border-radius: 999px; overflow: hidden; gap: 1px;";
  Object.entries(p.languages).forEach(([lang, { percent, color }]) => {
    const seg = document.createElement("div");
    seg.style.cssText = `width: ${percent}%; background: ${color}; min-width: 2px;`;
    bar.appendChild(seg);
  });

  content.appendChild(topRow);
  content.appendChild(desc);
  content.appendChild(langs);
  content.appendChild(bar);

  el.appendChild(thumb);
  el.appendChild(content);
  el.addEventListener("click", onClick);
  return el;
}

// ── Endorsement card ─────────────────────────────────────────────────────────

const SVC_ACCENT = "#9055e8";
const SVC_DEEP   = "#c49ef8";
const SVC_RGB    = "144, 85, 232";

function matchEndorsementSkill(name: string): Match {
  const lower = name.toLowerCase();
  for (const p of PROJECTS) {
    const entry = Object.entries(p.languages).find(([l]) => l.toLowerCase() === lower);
    if (entry) return { kind: "language", color: entry[1].color };
  }
  if (PROJECTS.some((p) => p.topics.some((t) => t.toLowerCase() === lower))) return { kind: "topic" };
  if (LOGS.some((a) => a.tags?.some((t) => t.toLowerCase() === lower))) return { kind: "topic" };
  return null;
}

function createSkillPill(text: string): HTMLElement {
  const pill = document.createElement("span");
  pill.className = "pw-mono";
  pill.style.cssText = `
    display: inline-flex; align-items: center;
    font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 4px 8px; border-radius: 99px;
    background: rgba(${SVC_RGB}, 0.22); color: ${SVC_DEEP};
    cursor: default;
  `;
  pill.textContent = text;
  return pill;
}

function createEndorsementCard(e: Endorsement, onClick?: () => void): HTMLElement {
  const cursor = onClick ? "cursor: pointer;" : "";
  const el = document.createElement("div");
  el.className = "pw-glass-dim cx-card cx-endorsement-card pw-prose-ref";
  el.style.cssText = `
    border-radius: 14px; padding: 0; overflow: hidden;
    display: flex; flex-direction: row; box-sizing: border-box;
    border-left: 3px solid ${SVC_ACCENT};
    margin: 12px; ${cursor}
  `;

  if (e.photo) {
    const img = document.createElement("img");
    img.src = e.photo;
    img.alt = e.name;
    img.className = "cx-endorsement-photo";
    img.style.cssText = "width: 200px; flex-shrink: 0; object-fit: cover; object-position: center top; align-self: stretch;";
    el.appendChild(img);
  }

  const content = document.createElement("div");
  content.className = "cx-endorsement-content";
  content.style.cssText = "flex: 1; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px;";

  const quote = document.createElement("p");
  quote.style.cssText = "font-size: 14px; line-height: 1.7; color: var(--ink); margin: 0; font-style: italic;";
  quote.textContent = '"' + (e.pullQuote ?? e.quote) + '"';
  content.appendChild(quote);

  const author = document.createElement("div");
  author.style.cssText = "font-size: 12px; color: var(--ink-soft);";
  const dash = document.createElement("span");
  dash.style.cssText = "margin-right: 5px; color: var(--ink-mute);";
  dash.textContent = "—";
  const nameEl = document.createElement("span");
  nameEl.style.cssText = "font-weight: 600;";
  nameEl.textContent = e.name;
  author.appendChild(dash);
  author.appendChild(nameEl);
  if (e.role) {
    const role = document.createElement("span");
    role.style.cssText = "color: var(--ink-mute);";
    role.textContent = ` · ${e.role}`;
    author.appendChild(role);
  }
  if (e.org) {
    const org = document.createElement("span");
    org.style.cssText = "color: var(--ink-mute);";
    org.textContent = ` · ${e.org}`;
    author.appendChild(org);
  }
  content.appendChild(author);

  if (e.skills && e.skills.length > 0) {
    const pillSkills  = e.skills.filter((s) => matchEndorsementSkill(s) !== null);
    const plainSkills = e.skills.filter((s) => matchEndorsementSkill(s) === null);

    const skillRow = document.createElement("div");
    skillRow.style.cssText = "display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: auto;";

    pillSkills.forEach((s) => skillRow.appendChild(createSkillPill(s)));

    if (pillSkills.length > 0 && plainSkills.length > 0) {
      const dot = document.createElement("span");
      dot.style.cssText = "color: var(--ink-mute); font-size: 11px; line-height: 1;";
      dot.textContent = "•";
      skillRow.appendChild(dot);
    }

    plainSkills.forEach((s, i) => {
      if (i > 0) {
        const sep = document.createElement("span");
        sep.style.cssText = "color: var(--ink-mute); font-size: 11px;";
        sep.textContent = "•";
        skillRow.appendChild(sep);
      }
      const span = document.createElement("span");
      span.className = "pw-mono";
      span.style.cssText = "font-size: 11px; color: var(--ink-soft); letter-spacing: 0.04em;";
      span.textContent = s;
      skillRow.appendChild(span);
    });

    content.appendChild(skillRow);
  }

  el.appendChild(content);
  if (onClick) el.addEventListener("click", onClick);
  return el;
}

// ── OG link cards ────────────────────────────────────────────────────────────

interface OgData {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
}

const ogLinkCache = ogLinkCacheRaw as Record<string, OgData>;

function makeExternalArrow(): HTMLSpanElement {
  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  arrow.className = "cx-btn-icon";
  arrow.style.cssText = "position: absolute; top: 10px; right: 12px; font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--section-deep); opacity: 0.5; pointer-events: none;";
  return arrow;
}

function createLinkCard(href: string, og: OgData | null): HTMLAnchorElement {
  let domain = og?.domain ?? "";
  if (!domain) { try { domain = new URL(href).hostname.replace(/^www\./, ""); } catch {} }

  // No OG title — card with just favicon + lowercase green URL, no eyebrow/title chrome
  if (!og?.title) {
    let displayUrl = href;
    try {
      const u = new URL(href);
      const path = u.pathname.replace(/\/$/, "");
      displayUrl = u.hostname.replace(/^www\./, "") + (path || "");
    } catch {}
    const link = document.createElement("a");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "pw-glass-dim cx-card pw-url-card pw-prose-ref";
    link.style.cssText = "position: relative; border-radius: 16px; border-left: 4px solid var(--section-accent); overflow: hidden; display: flex; align-items: center; gap: 6px; padding: 10px 14px; text-decoration: none; margin: 4px 0 12px;";
    const fav = document.createElement("img");
    fav.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16`;
    fav.alt = "";
    fav.style.cssText = "width: 12px; height: 12px; flex-shrink: 0; opacity: 0.7; display: inline; margin: 0; border-radius: 2px;";
    fav.addEventListener("error", () => { fav.style.display = "none"; });
    const txt = document.createElement("span");
    txt.style.cssText = "color: var(--section-deep); font-size: 13px; font-family: var(--font-mono, monospace);";
    txt.textContent = displayUrl;
    link.appendChild(fav);
    link.appendChild(txt);
    link.appendChild(makeExternalArrow());
    return link;
  }

  const hasThumb = !!og?.image;

  // Outer <a> — mirrors CXCard with thumbnail: pw-glass-dim cx-card cx-card-has-thumb
  const el = document.createElement("a");
  el.href = href;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
  el.className = `pw-glass-dim cx-card${hasThumb ? " cx-card-has-thumb" : ""} pw-url-card pw-prose-ref`;
  el.style.cssText = `
    position: relative;
    border-radius: 16px;
    border-left: 4px solid var(--section-accent);
    overflow: hidden;
    display: flex;
    text-decoration: none;
    color: inherit;
    margin: 4px 0 12px;
    ${hasThumb ? "min-height: 142px;" : ""}
  `;

  // Thumbnail — absolutely positioned so the content column drives card height,
  // not the image. Flex stretches the thumb div to match; img fills it via inset:0.
  if (og?.image) {
    const thumb = document.createElement("div");
    thumb.className = "cx-card-thumb";
    thumb.style.cssText = "width: 38%; flex-shrink: 0; position: relative; overflow: hidden;";
    const img = document.createElement("img");
    img.src = og.image;
    img.alt = "";
    img.style.cssText = "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; opacity: 0.9; border-radius: 0;";
    img.addEventListener("error", () => { thumb.remove(); el.classList.remove("cx-card-has-thumb"); });
    thumb.appendChild(img);
    el.appendChild(thumb);
  }

  // Content column — mirrors ContentColumn in CXCard
  const outer = document.createElement("div");
  outer.style.cssText = "flex: 1; min-width: 0; display: flex; flex-direction: column;";

  const col = document.createElement("div");
  col.style.cssText = "padding: 16px 20px 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0;";

  // Eyebrow row — domain + favicon, matches pw-eyebrow usage in CXCard
  const eyebrowRow = document.createElement("div");
  eyebrowRow.style.cssText = "display: flex; align-items: center; gap: 5px;";
  const favicon = document.createElement("img");
  favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16`;
  favicon.alt = "";
  favicon.style.cssText = "width: 11px; height: 11px; flex-shrink: 0; opacity: 0.7; display: inline; margin: 0; border-radius: 2px;";
  favicon.addEventListener("error", () => { favicon.style.display = "none"; });
  const domainSpan = document.createElement("span");
  domainSpan.className = "pw-eyebrow";
  domainSpan.style.color = "var(--section-deep)";
  domainSpan.textContent = domain;
  eyebrowRow.appendChild(favicon);
  eyebrowRow.appendChild(domainSpan);
  col.appendChild(eyebrowRow);

  // Title — matches ContentColumn title style in CXCard
  const titleEl = document.createElement("div");
  titleEl.style.cssText = `
    font-size: 17px; font-weight: 500; letter-spacing: -0.3px; line-height: 1.2;
    text-wrap: balance; overflow: hidden;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  `;
  titleEl.textContent = og.title!;
  col.appendChild(titleEl);

  // Hook/description — matches ContentColumn hook style in CXCard
  if (og?.description) {
    const descEl = document.createElement("div");
    descEl.style.cssText = `
      font-size: 12px; color: var(--ink-soft); line-height: 1.45;
      overflow: hidden; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    `;
    descEl.textContent = og.description;
    col.appendChild(descEl);
  }

  outer.appendChild(col);
  el.appendChild(outer);
  el.appendChild(makeExternalArrow());
  return el;
}

// ── Heading progress tracking ────────────────────────────────────────────────

const DWELL_MS = 5000;
const CIRC = 2 * Math.PI * 5;
const SVG_NS = "http://www.w3.org/2000/svg";

function makeRingSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  svg.setAttribute("width", "14"); svg.setAttribute("height", "14");
  svg.setAttribute("viewBox", "0 0 14 14");
  svg.style.flexShrink = "0";
  const track = document.createElementNS(SVG_NS, "circle") as SVGCircleElement;
  track.setAttribute("cx","7"); track.setAttribute("cy","7"); track.setAttribute("r","5");
  track.setAttribute("fill","none"); track.setAttribute("stroke","rgba(255,255,255,0.12)");
  track.setAttribute("stroke-width","2");
  const arc = document.createElementNS(SVG_NS, "circle") as SVGCircleElement;
  arc.setAttribute("cx","7"); arc.setAttribute("cy","7"); arc.setAttribute("r","5");
  arc.setAttribute("fill","none"); arc.setAttribute("stroke","var(--section-accent)");
  arc.setAttribute("stroke-width","2"); arc.setAttribute("stroke-linecap","round");
  arc.setAttribute("stroke-dasharray", String(CIRC));
  arc.setAttribute("stroke-dashoffset", String(CIRC));
  arc.setAttribute("transform","rotate(-90 7 7)");
  svg.appendChild(track); svg.appendChild(arc);
  return svg;
}

function makeBookmarkSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  svg.setAttribute("width", "10"); svg.setAttribute("height", "13");
  svg.setAttribute("viewBox", "0 0 10 13");
  svg.style.flexShrink = "0";
  const path = document.createElementNS(SVG_NS, "path") as SVGPathElement;
  path.setAttribute("d", "M1 0.5h8v12L5 9 1 12.5V0.5z");
  path.setAttribute("fill", "var(--section-accent)");
  svg.appendChild(path);
  return svg;
}

function makeCheckSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  svg.setAttribute("width", "14"); svg.setAttribute("height", "14");
  svg.setAttribute("viewBox", "0 0 14 14");
  svg.style.flexShrink = "0";
  const poly = document.createElementNS(SVG_NS, "polyline") as SVGPolylineElement;
  poly.setAttribute("points", "2.5 7 5.5 10 11.5 4");
  poly.setAttribute("fill", "none");
  poly.setAttribute("stroke", "var(--section-deep)");
  poly.setAttribute("stroke-width", "2");
  poly.setAttribute("stroke-linecap", "round");
  poly.setAttribute("stroke-linejoin", "round");
  svg.appendChild(poly);
  return svg;
}

function makeLinkIcon(h: HTMLHeadingElement): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.style.cssText = "display: flex; align-items: center; justify-content: center; background: none; border: none; padding: 0 2px; cursor: pointer; opacity: 0.15; transition: opacity 0.15s; flex-shrink: 0; color: currentColor;";
  btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
  btn.addEventListener("mouseenter", () => { btn.style.opacity = "0.6"; soundHover(); });
  btn.addEventListener("mouseleave", () => { btn.style.opacity = "0.15"; });
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    soundClick();
    const url = `${window.location.origin}${window.location.pathname}#${h.id}`;
    navigator.clipboard.writeText(url).then(() => {
      btn.style.opacity = "1";
      const svg = btn.querySelector("svg");
      if (svg) svg.style.stroke = "var(--section-accent)";
      setTimeout(() => {
        btn.style.opacity = "0.15";
        if (svg) svg.style.stroke = "currentColor";
      }, 1500);
    });
  });
  return btn;
}

function attachHeadingProgress(el: HTMLElement, slug: string): () => void {
  const headings = Array.from(el.querySelectorAll<HTMLHeadingElement>("h2")).filter(h => h.id);
  if (!headings.length) return () => {};

  const allIds = headings.map(h => h.id);
  const progress = getProgress(slug);
  const indicators = new Map<HTMLHeadingElement, SVGSVGElement>();

  headings.forEach((h) => {
    const svg = progress.checked.includes(h.id) ? makeCheckSvg()
      : progress.current === h.id ? makeBookmarkSvg()
      : makeRingSvg();
    const wrapper = document.createElement("span");
    wrapper.style.cssText = "display: flex; align-items: flex-start; gap: 8px;";
    const textGroup = document.createElement("span");
    textGroup.style.cssText = "flex: 1; min-width: 0;";
    while (h.firstChild) textGroup.appendChild(h.firstChild);
    wrapper.appendChild(textGroup);

    const iconGroup = document.createElement("span");
    iconGroup.style.cssText = "margin-left: auto; margin-top: calc(0.5lh - 7px); display: flex; align-items: center; gap: 3px; flex-shrink: 0;";
    iconGroup.appendChild(makeLinkIcon(h));
    svg.style.cssText = "flex-shrink: 0; cursor: pointer; opacity: 0.4;";
    svg.addEventListener("mouseenter", () => soundHover());
    svg.addEventListener("click", (e) => { e.stopPropagation(); soundClick(); handleClick(h); });
    iconGroup.appendChild(svg);
    wrapper.appendChild(iconGroup);
    h.appendChild(wrapper);
    indicators.set(h, svg);
  });

  const sentinels: HTMLDivElement[] = headings.map((h, i) => {
    const s = document.createElement("div");
    s.style.cssText = "height: 1px; pointer-events: none;";
    const next = headings[i + 1];
    if (next) next.parentNode?.insertBefore(s, next);
    else el.appendChild(s);
    return s;
  });

  const rafIds = new Map<string, number>();
  const startTs = new Map<string, number>();

  function getArc(h: HTMLHeadingElement): SVGCircleElement | null {
    return (indicators.get(h) as SVGSVGElement | undefined)
      ?.querySelectorAll("circle")[1] as SVGCircleElement | null ?? null;
  }

  function replaceIndicator(h: HTMLHeadingElement, newSvg: SVGSVGElement) {
    newSvg.style.cssText = "flex-shrink: 0; cursor: pointer; opacity: 0.4;";
    newSvg.addEventListener("mouseenter", () => soundHover());
    newSvg.addEventListener("click", (e) => { e.stopPropagation(); soundClick(); handleClick(h); });
    const old = indicators.get(h);
    if (old?.parentNode) old.parentNode.replaceChild(newSvg, old);
    indicators.set(h, newSvg);
  }

  function cancelFill(key: string) {
    const id = rafIds.get(key);
    if (id !== undefined) cancelAnimationFrame(id);
    rafIds.delete(key); startTs.delete(key);
  }

  function startFill(key: string, arc: SVGCircleElement, onComplete: () => void) {
    cancelFill(key);
    const tick = (ts: number) => {
      if (!startTs.has(key)) startTs.set(key, ts);
      const pct = Math.min(1, (ts - startTs.get(key)!) / DWELL_MS);
      arc.setAttribute("stroke-dashoffset", String(CIRC * (1 - pct)));
      if (pct < 1) {
        rafIds.set(key, requestAnimationFrame(tick));
      } else {
        cancelFill(key);
        onComplete();
      }
    };
    rafIds.set(key, requestAnimationFrame(tick));
  }

  function startTimer(key: string, onComplete: () => void) {
    cancelFill(key);
    const tick = (ts: number) => {
      if (!startTs.has(key)) startTs.set(key, ts);
      if (ts - startTs.get(key)! < DWELL_MS) {
        rafIds.set(key, requestAnimationFrame(tick));
      } else {
        cancelFill(key);
        onComplete();
      }
    };
    rafIds.set(key, requestAnimationFrame(tick));
  }

  // headingObs/sentinelObs are let so createObservers can replace them once the
  // OverlayScrollbars root is available (it initializes after useLayoutEffect).
  let headingObs: IntersectionObserver;
  let sentinelObs: IntersectionObserver;

  function observeNextEligible() {
    const prog = getProgress(slug);
    if (prog.current) {
      const idx = allIds.indexOf(prog.current);
      if (idx < 0) return;
      if (idx === headings.length - 1) {
        sentinelObs.observe(sentinels[idx]);
      } else {
        const nextIdx = allIds.findIndex((id, i) => i > idx && !prog.checked.includes(id));
        if (nextIdx >= 0) headingObs.observe(headings[nextIdx]);
      }
      return;
    }
    const idx = allIds.findIndex(id => !prog.checked.includes(id));
    if (idx >= 0) headingObs.observe(headings[idx]);
  }

  function handleClick(h: HTMLHeadingElement) {
    cancelFill(h.id + "-h");
    cancelFill(h.id + "-s");
    const prog = getProgress(slug);
    if (prog.checked.includes(h.id)) uncheckSection(slug, h.id);
    else checkSection(slug, h.id, allIds);
  }

  function syncWithProgress() {
    const prog = getProgress(slug);
    headingObs.disconnect();
    sentinelObs.disconnect();
    rafIds.forEach(id => cancelAnimationFrame(id));
    rafIds.clear(); startTs.clear();
    headings.forEach(h => {
      const svg = indicators.get(h);
      const cur = !svg ? "ring"
        : svg.querySelector("polyline") ? "check"
        : svg.querySelector("path") ? "bookmark"
        : "ring";
      const want: "ring" | "bookmark" | "check" = prog.checked.includes(h.id) ? "check"
        : prog.current === h.id ? "bookmark"
        : "ring";
      if (cur !== want)
        replaceIndicator(h, want === "check" ? makeCheckSvg() : want === "bookmark" ? makeBookmarkSvg() : makeRingSvg());
    });
    observeNextEligible();
  }

  function createObservers(root: Element | null) {
    headingObs?.disconnect();
    sentinelObs?.disconnect();
    const obsOpts = { root, rootMargin: "0px 0px -200px 0px", threshold: 0 };

    // Phase 1: heading enters scroll root → ring fills → bookmark
    headingObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const h = entry.target as HTMLHeadingElement;
        const arc = getArc(h);
        if (!arc) return;
        if (entry.isIntersecting) {
          startFill(h.id + "-h", arc, () => {
            headingObs.unobserve(h);
            const prevBookmark = getProgress(slug).current;
            replaceIndicator(h, makeBookmarkSvg());
            advanceBookmark(slug, prevBookmark, h.id, allIds);
          });
        } else {
          cancelFill(h.id + "-h");
          arc.setAttribute("stroke-dashoffset", String(CIRC));
        }
      });
    }, obsOpts);

    // Phase 2: sentinel enters scroll root → timer → check off (last heading only)
    sentinelObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sentinel = entry.target as HTMLDivElement;
        const idx = sentinels.indexOf(sentinel);
        if (idx < 0) return;
        const h = headings[idx];
        if (entry.isIntersecting) {
          startTimer(h.id + "-s", () => {
            sentinelObs.unobserve(sentinel);
            replaceIndicator(h, makeCheckSvg());
            completeSection(slug, h.id, allIds);
            observeNextEligible();
          });
        } else {
          cancelFill(h.id + "-s");
        }
      });
    }, obsOpts);

    observeNextEligible();
  }

  const onProgressUpdate = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (!detail?.slug || detail.slug === slug) syncWithProgress();
  };
  window.addEventListener("pw-progress-update", onProgressUpdate);

  function findScrollRoot(): Element | null {
    let node: Element | null = el.parentElement;
    while (node && !node.hasAttribute("data-overlayscrollbars-viewport")) {
      node = node.parentElement;
    }
    return node;
  }

  // OverlayScrollbars initializes in useEffect, after our useLayoutEffect — so the
  // viewport attribute may not exist yet. Create observers immediately (root: null
  // = browser viewport as fallback), then recreate with the correct root once OS fires.
  createObservers(findScrollRoot());

  let mo: MutationObserver | null = null;
  if (!findScrollRoot()) {
    mo = new MutationObserver(() => {
      const root = findScrollRoot();
      if (root) { mo!.disconnect(); mo = null; createObservers(root); }
    });
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-overlayscrollbars-viewport"] });
  }

  return () => {
    headingObs.disconnect();
    sentinelObs.disconnect();
    mo?.disconnect();
    window.removeEventListener("pw-progress-update", onProgressUpdate);
    rafIds.forEach(id => cancelAnimationFrame(id));
    rafIds.clear(); startTs.clear();
    sentinels.forEach(s => s.remove());
  };
}

// ── Main enhancer ────────────────────────────────────────────────────────────

const TAB_PREF_KEY = 'pw-tab-pref';

function loadTabPrefs(): string[] {
  try { return JSON.parse(localStorage.getItem(TAB_PREF_KEY) ?? '[]'); }
  catch { return []; }
}

function saveTabPref(label: string): void {
  try {
    const prefs = loadTabPrefs().filter(l => l !== label);
    prefs.unshift(label);
    localStorage.setItem(TAB_PREF_KEY, JSON.stringify(prefs.slice(0, 20)));
  } catch {}
}

function selectTabByLabel(el: HTMLElement, label: string, sourceWrapper?: HTMLElement) {
  el.querySelectorAll<HTMLElement>('.pw-tabs').forEach(wrapper => {
    if (wrapper === sourceWrapper) return;
    const btns = Array.from(wrapper.querySelectorAll<HTMLElement>(':scope > .pw-tabs-nav > .pw-tab-btn'));
    const idx = btns.findIndex(b => b.textContent?.trim() === label);
    if (idx === -1) return;
    btns.forEach(b => b.classList.remove('is-active'));
    wrapper.querySelectorAll(':scope > .pw-tab-panel').forEach(p => p.classList.remove('is-active'));
    btns[idx].classList.add('is-active');
    wrapper.querySelector(`:scope > [data-panel="${idx}"]`)?.classList.add('is-active');
  });
}

function activateTabs(el: HTMLElement) {
  // Process innermost tabs first so nested raws are activated before their
  // parent clones them into a panel via cloneNode(true).
  const allRaw = () => Array.from(el.querySelectorAll<HTMLElement>('.pw-tabs-raw'));
  let pass = allRaw();
  while (pass.length > 0) {
    const innermost = pass.filter(raw => !raw.parentElement?.closest('.pw-tabs-raw'));
    if (innermost.length === 0) break;
    innermost.forEach(raw => processRaw(raw, el));
    pass = allRaw();
  }
}

function processRaw(raw: HTMLElement, el: HTMLElement) {
    const seps = Array.from(raw.querySelectorAll<HTMLElement>('.pw-tab-sep'));
    if (seps.length === 0) return;

    const tabs: { label: string; nodes: ChildNode[] }[] = [];
    let current: { label: string; nodes: ChildNode[] } | null = null;

    Array.from(raw.childNodes).forEach(child => {
      if (child instanceof HTMLElement && child.classList.contains('pw-tab-sep')) {
        if (current) tabs.push(current);
        current = { label: child.dataset.label ?? '', nodes: [] };
      } else if (current) {
        current.nodes.push(child);
      }
    });
    if (current) tabs.push(current);
    if (tabs.length === 0) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'pw-tabs';

    const nav = document.createElement('div');
    nav.className = 'pw-tabs-nav';
    wrapper.appendChild(nav);

    tabs.forEach(({ label, nodes }, i) => {
      const btn = document.createElement('button');
      btn.className = 'pw-tab-btn' + (i === 0 ? ' is-active' : '');
      btn.textContent = label;
      btn.addEventListener('mouseenter', soundHover);
      btn.addEventListener('click', () => {
        soundClick();
        wrapper.querySelectorAll(':scope > .pw-tabs-nav > .pw-tab-btn').forEach(b => b.classList.remove('is-active'));
        wrapper.querySelectorAll(':scope > .pw-tab-panel').forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        wrapper.querySelector(`:scope > [data-panel="${i}"]`)?.classList.add('is-active');
        saveTabPref(label);
        selectTabByLabel(el, label, wrapper);
      });
      nav.appendChild(btn);

      const panel = document.createElement('div');
      panel.className = 'pw-tab-panel' + (i === 0 ? ' is-active' : '');
      panel.dataset.panel = String(i);
      nodes.forEach(n => panel.appendChild(n));
      wrapper.appendChild(panel);
    });

    // Apply saved preference: activate the tab whose label appears earliest in prefs
    const prefs = loadTabPrefs();
    let prefIdx = -1;
    let bestPriority = Infinity;
    tabs.forEach(({ label }, i) => {
      const priority = prefs.indexOf(label);
      if (priority !== -1 && priority < bestPriority) { bestPriority = priority; prefIdx = i; }
    });
    if (prefIdx > 0) {
      const allBtns = Array.from(nav.querySelectorAll<HTMLElement>(':scope > .pw-tab-btn'));
      const allPanels = Array.from(wrapper.querySelectorAll<HTMLElement>(':scope > .pw-tab-panel'));
      allBtns.forEach(b => b.classList.remove('is-active'));
      allPanels.forEach(p => p.classList.remove('is-active'));
      allBtns[prefIdx]?.classList.add('is-active');
      allPanels[prefIdx]?.classList.add('is-active');
    }

    raw.replaceWith(wrapper);
}

export function enhanceProse(el: HTMLElement, opts: ProseOptions = {}): () => void {
  activateTabs(el);
  // Anchor links — scroll the OverlayScrollbars viewport instead of the window
  el.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href")?.slice(1);
      if (!hash) return;
      const target = document.getElementById(hash);
      if (!target) return;
      e.preventDefault();
      soundClick();
      let scrollRoot: Element | null = el.parentElement;
      while (scrollRoot && !scrollRoot.hasAttribute("data-overlayscrollbars-viewport")) {
        scrollRoot = scrollRoot.parentElement;
      }
      if (scrollRoot) {
        const rootRect = scrollRoot.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        scrollRoot.scrollTop += targetRect.top - rootRect.top - 80;
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // External links → new tab (pawper.dev /l/ links open the modal instead)
  el.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    try {
      const url = new URL(href);
      if (/pawper\.dev$/.test(url.hostname)) {
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts[0] === "l" && parts[1] && opts.onOpenLog) {
          const anchor = url.hash ? url.hash.slice(1) : undefined;
          a.addEventListener("click", (e) => { e.preventDefault(); soundClick(); opts.onOpenLog!(parts[1], anchor); });
          return;
        }
      }
    } catch {}
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });

  // Cross-reference paragraphs → inline cards
  el.querySelectorAll("p").forEach((p) => {
    const meaningful = Array.from(p.childNodes).filter(
      (n) => !(n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() === "")
    );
    if (meaningful.length !== 1 || (meaningful[0] as Element).tagName !== "A") return;
    const a = meaningful[0] as HTMLAnchorElement;
    const href = a.getAttribute("href") ?? "";

    // series:slug shorthand
    if (href.startsWith("series:")) {
      const slug = href.slice(7);
      const name = [...new Set(LOGS.filter(a => a.series).map(a => a.series!.name))].find(n => slugify(n) === slug);
      if (!name) return;
      const logList = LOGS.filter(a => a.series?.name === name).sort((a, b) => a.series!.part - b.series!.part);
      const total = logList[0]?.series?.total ?? logList.length;
      p.replaceWith(createSeriesCard(name, logList, total, () => opts.onOpenSeries?.(slug)));
      return;
    }

    // endorsement:slug shorthand
    if (href.startsWith("endorsement:")) {
      const slug = href.slice(12);
      const endorsement = allEndorsements.find((e) => e.slug === slug);
      if (!endorsement) {
        const link = document.createElement("span");
        link.style.cssText = "display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: " + SVC_ACCENT + "; font-weight: 500; cursor: pointer; text-decoration: underline; text-decoration-color: " + SVC_ACCENT + "66;";
        link.textContent = "View endorsements →";
        if (opts.onOpenService) link.addEventListener("click", () => opts.onOpenService!("overview"));
        p.replaceWith(link);
        return;
      }
      const onClick = opts.onOpenService ? () => opts.onOpenService!(endorsement.service) : undefined;
      p.replaceWith(createEndorsementCard(endorsement, onClick));
      return;
    }

    // project:id / log:id shorthand
    if (href.startsWith("project:")) {
      const id = href.slice(8);
      const project = PROJECTS.find((pr) => pr.id === id);
      if (!project) return;
      p.replaceWith(createProjectCard(project, () => opts.onOpenProject?.(id)));
      return;
    }
    if (href.startsWith("log:")) {
      const id = href.slice(4);
      const log = LOGS.find((ar) => ar.id === id);
      if (!log) return;
      p.replaceWith(createLogCard(log, () => opts.onOpenLog?.(id)));
      return;
    }

    // Raw pawper.dev URLs with modal params  /  external OG link cards
    if (href.startsWith("http")) {
      try {
        const url = new URL(href);
        const modal = url.searchParams.get("modal");
        const id = url.searchParams.get("id");
        if (modal && id) {
          if (modal === "project") {
            const project = PROJECTS.find((pr) => pr.id === id);
            if (!project) return;
            p.replaceWith(createProjectCard(project, () => opts.onOpenProject?.(id)));
          } else if (modal === "log" || modal === "article") {
            const log = LOGS.find((ar) => ar.id === id);
            if (!log) return;
            p.replaceWith(createLogCard(log, () => opts.onOpenLog?.(id)));
          } else if (modal === "series") {
            const name = [...new Set(LOGS.filter(a => a.series).map(a => a.series!.name))].find(n => slugify(n) === id);
            if (!name) return;
            const logList = LOGS.filter(a => a.series?.name === name).sort((a, b) => a.series!.part - b.series!.part);
            const total = logList[0]?.series?.total ?? logList.length;
            p.replaceWith(createSeriesCard(name, logList, total, () => opts.onOpenSeries?.(id)));
          }
          return;
        }
      } catch {}
    }
  });

  // OG link cards — runs after cross-ref pass so it only touches raw bare URLs.
  // Handles URLs in any parent context: standalone <p>, <blockquote>, <li>, etc.
  el.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((a) => {
    if (!a.isConnected) return; // already replaced by cross-ref pass above
    if (a.closest(".pw-url-card")) return;
    const href = a.getAttribute("href") ?? "";
    if (a.textContent?.trim() !== href) return; // not a bare URL (has descriptive text)
    const cached = ogLinkCache[href] ?? null;
    const og = cached && opts.noThumb?.includes(href) ? { ...cached, image: null } : cached;

    const card = createLinkCard(href, og);
    const parent = a.parentElement;

    // If the <a> is the sole meaningful child of its <p>, swap the whole <p>
    if (parent?.tagName === "P") {
      const meaningful = Array.from(parent.childNodes).filter(
        (n) => !(n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() === "")
      );
      if (meaningful.length === 1) { parent.replaceWith(card); return; }
    }

    // Otherwise replace just the <a> and remove any preceding <br>
    const prev = a.previousSibling;
    if (prev?.nodeName === "BR") prev.remove();
    a.replaceWith(card);
  });

  // Images — clickable to open media viewer
  if (opts.onOpenMedia) {
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"))
      .filter(img => !img.classList.contains("cx-endorsement-photo") && !img.closest(".pw-url-card"));
    const mediaSiblings: Array<{ kind: "media"; id: string; label?: string }> | undefined =
      imgs.length > 1 ? imgs.map(img => ({ kind: "media" as const, id: img.src, label: img.alt || undefined })) : undefined;
    imgs.forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => { opts.onOpenMedia!(img.src, img.alt, mediaSiblings); });
    });
  }

  // bash-prompt colors — matches classic terminal scheme
  const BP_COLORS = {
    user:   "#6699ff", // blue
    at:     "rgba(255,255,255,0.4)",
    host:   "#ffaa44", // orange
    colon:  "rgba(255,255,255,0.4)",
    dir:    "#55ff55", // green
    dollar: "#ff5555", // red
    hash:   "#ff5555", // red
  };

  function buildPromptWrap(): HTMLDivElement {
    const wrap = document.createElement("div");
    wrap.style.cssText = "background: #0d0d0d; border-radius: 10px; padding: 14px 18px; display: flex; flex-direction: column; gap: 8px; font-family: var(--pw-mono, monospace); font-size: 13px; line-height: 1.5; margin: 4px 0; border: 1px solid rgba(255,255,255,0.07);";
    return wrap;
  }

  function buildPromptRow(line: string, addCursor: boolean): HTMLDivElement {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; align-items: baseline; flex-wrap: wrap;";
    // Bash: user@host:dir[$#]
    const bash = line.match(/^([^@\s]+)(@)([^:\s]+)(:)(.+?)([#$])\s*$/);
    // Zsh:  user@host dir [%$#]  (space-separated, % suffix)
    const zsh  = !bash && line.match(/^([^@\s]+)(@)([^\s]+)(\s+)(\S+)\s+([%#$])\s*$/);
    const m = bash ?? zsh;
    if (m) {
      const [, user, , host, sep, dir, suffix] = m;
      const parts: [string, string][] = [
        [user,   BP_COLORS.user],
        ["@",    BP_COLORS.at],
        [host,   BP_COLORS.host],
        [sep,    BP_COLORS.colon],
        [dir,    BP_COLORS.dir],
        ...(zsh ? [[" ", "rgba(255,255,255,0.4)"] as [string, string]] : []),
        [suffix, suffix === "#" ? BP_COLORS.hash : BP_COLORS.dollar],
      ];
      parts.forEach(([text, color]) => {
        const s = document.createElement("span");
        s.textContent = text;
        s.style.color = color;
        row.appendChild(s);
      });
    } else {
      row.style.color = "rgba(255,255,255,0.7)";
      row.textContent = line;
    }
    if (addCursor) {
      const cursor = document.createElement("span");
      cursor.className = "pw-terminal-cursor";
      row.appendChild(cursor);
    }
    return row;
  }

  // bash-prompt — plain white text, no color parsing
  el.querySelectorAll<HTMLElement>("pre[data-language='bash-prompt']").forEach((pre) => {
    const code = pre.querySelector("code");
    const lines = (code?.textContent ?? "").split("\n").map(l => l.trimEnd()).filter(l => l.length > 0);
    const wrap = buildPromptWrap();
    lines.forEach((line, idx) => {
      const row = document.createElement("div");
      row.style.cssText = "display: flex; align-items: baseline; color: rgba(255,255,255,0.85);";
      row.textContent = line;
      if (idx === lines.length - 1) {
        const cursor = document.createElement("span");
        cursor.className = "pw-terminal-cursor";
        row.appendChild(cursor);
      }
      wrap.appendChild(row);
    });
    pre.replaceWith(wrap);
  });

  // bash-prompt-key — color-coded using BP_COLORS; falls back to anatomy legend if empty
  el.querySelectorAll<HTMLElement>("pre[data-language='bash-prompt-key']").forEach((pre) => {
    const code = pre.querySelector("code");
    const lines = (code?.textContent ?? "").split("\n").map(l => l.trimEnd()).filter(l => l.length > 0);
    const wrap = buildPromptWrap();
    if (lines.length > 0) {
      lines.forEach((line, idx) => wrap.appendChild(buildPromptRow(line, idx === lines.length - 1)));
    } else {
      // No content → render anatomy legend
      const keyParts: [string, string][] = [
        ["currentuser",      BP_COLORS.user],
        ["@",                BP_COLORS.at],
        ["hostname",         BP_COLORS.host],
        [":",                BP_COLORS.colon],
        ["workingdirectory", BP_COLORS.dir],
        ["UID",              BP_COLORS.dollar],
      ];
      const row = document.createElement("div");
      row.style.cssText = "display: flex; align-items: baseline; flex-wrap: wrap;";
      keyParts.forEach(([text, color]) => {
        const s = document.createElement("span");
        s.textContent = text;
        s.style.color = color;
        row.appendChild(s);
      });
      const cursor = document.createElement("span");
      cursor.className = "pw-terminal-cursor";
      row.appendChild(cursor);
      wrap.appendChild(row);
    }
    pre.replaceWith(wrap);
  });

  // Code blocks — copy button
  el.querySelectorAll<HTMLPreElement>("pre").forEach((pre) => {
    if (pre.querySelector(".pw-copy-btn")) return; // already enhanced

    const ICON_COPY = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M2 10V2h8"/></svg>`;
    const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2.5 7.5 5.5 10.5 11.5 4"/></svg>`;

    // Wrap pre in a positioned div so the button sits outside the scrolling
    // container and doesn't move when the code block scrolls horizontally.
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position: relative;";
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement("button");
    btn.className = "pw-copy-btn";
    btn.innerHTML = ICON_COPY;
    btn.title = "Copy";
    btn.style.cssText = `
      position: absolute; top: 8px; right: 8px;
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.4);
      border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer; transition: background 0.15s, color 0.15s, border-color 0.15s;
      padding: 0;
    `;

    btn.addEventListener("mouseenter", () => {
      if (btn.dataset.copied) return;
      soundHover();
      btn.style.background = "rgba(255,255,255,0.13)";
      btn.style.color = "rgba(255,255,255,0.7)";
    });
    btn.addEventListener("mouseleave", () => {
      if (btn.dataset.copied) return;
      btn.style.background = "rgba(255,255,255,0.07)";
      btn.style.color = "rgba(255,255,255,0.4)";
    });

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      soundClick();
      const code = pre.querySelector("code");
      if (!code) return;
      navigator.clipboard.writeText(code.textContent ?? "").then(() => {
        btn.dataset.copied = "1";
        btn.innerHTML = ICON_CHECK;
        btn.style.color = "rgba(63,191,122,0.9)";
        btn.style.background = "rgba(63,191,122,0.1)";
        btn.style.borderColor = "rgba(63,191,122,0.3)";
        setTimeout(() => {
          delete btn.dataset.copied;
          btn.innerHTML = ICON_COPY;
          btn.style.color = "rgba(255,255,255,0.4)";
          btn.style.background = "rgba(255,255,255,0.07)";
          btn.style.borderColor = "rgba(255,255,255,0.1)";
        }, 1800);
      });
    });

    wrapper.appendChild(btn);

    // Collapse tall code blocks (taller than half the viewport)
    const halfVH = window.innerHeight / 2;
    if (pre.scrollHeight > halfVH) {
      wrapper.style.maxHeight = `${halfVH}px`;
      wrapper.style.overflow = "hidden";

      const fade = document.createElement("div");
      fade.style.cssText = `
        position: absolute; bottom: 0; left: 0; right: 0; height: 90px;
        pointer-events: none;
        background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.82));
        border-radius: 0 0 8px 8px;
      `;
      wrapper.appendChild(fade);

      const pillRow = document.createElement("div");
      pillRow.style.cssText = "display: flex; justify-content: center; margin-top: 8px;";

      const expandBtn = document.createElement("button");
      expandBtn.className = "pw-mono cx-proj-btn";
      expandBtn.textContent = "show";
      expandBtn.style.cssText = `
        font-size: 10px; padding: 4px 8px; letter-spacing: 0.08em;
        border-radius: 2px; border: none;
        background: rgba(var(--section-rgb), 0.22); color: var(--ink-soft);
        font-weight: 700; text-transform: uppercase; white-space: nowrap;
        cursor: pointer; transition: background 0.15s, color 0.15s; opacity: 1;
      `;
      expandBtn.addEventListener("mouseenter", () => { soundHover(); });

      let codeExpanded = false;
      expandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        soundClick();
        codeExpanded = !codeExpanded;
        if (codeExpanded) {
          wrapper.style.maxHeight = "";
          wrapper.style.overflow = "visible";
          fade.style.display = "none";
          expandBtn.textContent = "hide";
        } else {
          wrapper.style.maxHeight = `${halfVH}px`;
          wrapper.style.overflow = "hidden";
          fade.style.display = "";
          expandBtn.textContent = "show";
          wrapper.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      pillRow.appendChild(expandBtn);
      wrapper.insertAdjacentElement("afterend", pillRow);
    }
  });

  // Hover sound — only when entering from outside the target
  const handler = (e: MouseEvent) => {
    const card = (e.target as Element).closest("a, .pw-prose-ref");
    if (!card || card.contains(e.relatedTarget as Node)) return;
    soundHover();
  };
  el.addEventListener("mouseover", handler);

  const progressCleanup = opts.slug ? attachHeadingProgress(el, opts.slug) : null;

  return () => {
    el.removeEventListener("mouseover", handler);
    progressCleanup?.();
  };
}
