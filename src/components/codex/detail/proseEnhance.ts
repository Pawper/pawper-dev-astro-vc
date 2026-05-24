import { soundHover } from "../../../context/SoundContext";
import { PROJECTS, LOGS, slugify } from "../../../data/content";
import type { Endorsement } from "../../../data/content";
import type { Log, Project } from "../../../types";
import endorsementsData from "../../../data/endorsements.json";

const allEndorsements = endorsementsData as Endorsement[];

type Match = { kind: "language"; color: string } | { kind: "topic" } | null;

export interface ProseOptions {
  onOpenProject?: (id: string) => void;
  onOpenLog?: (id: string) => void;
  onOpenSeries?: (slug: string) => void;
  onOpenService?: (service: string) => void;
  onOpenMedia?: (src: string, alt: string, siblings?: Array<{ kind: "media"; id: string; label?: string }>) => void;
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
    soon.style.cssText = `font-size: 10px; letter-spacing: 0.16em; color: ${accent}; opacity: 0.55; margin-top: 2px;`;
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

// ── Main enhancer ────────────────────────────────────────────────────────────

export function enhanceProse(el: HTMLElement, opts: ProseOptions = {}): () => void {
  // External links → new tab
  el.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((a) => {
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

    // Raw pawper.dev URLs with modal params
    if (href.startsWith("http")) {
      try {
        const url = new URL(href);
        const modal = url.searchParams.get("modal");
        const id = url.searchParams.get("id");
        if (!modal || !id) return;
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
      } catch {}
    }
  });

  // Images — clickable to open media viewer
  if (opts.onOpenMedia) {
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img"))
      .filter(img => !img.classList.contains("cx-endorsement-photo"));
    const mediaSiblings: Array<{ kind: "media"; id: string; label?: string }> | undefined =
      imgs.length > 1 ? imgs.map(img => ({ kind: "media" as const, id: img.src, label: img.alt || undefined })) : undefined;
    imgs.forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => { opts.onOpenMedia!(img.src, img.alt, mediaSiblings); });
    });
  }

  // Code blocks — copy button
  el.querySelectorAll<HTMLPreElement>("pre").forEach((pre) => {
    if (pre.querySelector(".pw-copy-btn")) return; // already enhanced
    pre.style.position = "relative";

    const ICON_COPY = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M2 10V2h8"/></svg>`;
    const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2.5 7.5 5.5 10.5 11.5 4"/></svg>`;

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

    pre.appendChild(btn);
  });

  // Hover sound — only when entering from outside the target
  const handler = (e: MouseEvent) => {
    const card = (e.target as Element).closest("a, .pw-prose-ref");
    if (!card || card.contains(e.relatedTarget as Node)) return;
    soundHover();
  };
  el.addEventListener("mouseover", handler);
  return () => el.removeEventListener("mouseover", handler);
}
