import type { Project, Log, CXCategory } from "../types";
import projectsData from "./projects.json";
import agendaData from "./agenda.json";
import experiencesData from "./experiences.json";
import calendarData from "./calendar.json";

export interface Endorsement {
  id: string;
  slug: string;
  service: string;
  name: string;
  role: string;
  org?: string;
  quote: string;
  photo?: string | null;
  skills?: string[];
  featured?: boolean;
  panels?: boolean;
  pullQuote?: string;
  experienceName?: string;
}

export interface ServiceEntry {
  id: string;
  label: string;
  kicker: string;
  desc: string;
  body: string[];
  endorsements: Endorsement[];
  disclaimer?: string;
  status: "open" | "full";
}

export type ExperienceCategory =
  | "employment" | "contracting" | "consulting"
  | "coaching" | "speaking" | "mentoring" | "education" | "attending" | "volunteering";

export interface Experience {
  id: string;
  title: string;
  organization: string;
  period: string;
  category: ExperienceCategory;
  description: string;
  longDescription?: string[];
  featured: boolean;
  skills?: string[];
  endorsementIds?: string[];
  certificationImage?: string;
  certificationUrl?: string;
  // Agenda fields — present on events sourced from Airtable
  datetimeStart?: string;   // YYYY-MM-DD
  datetimeEnd?: string;     // YYYY-MM-DD
  time?: string;            // "5 PM", "2:30 PM" etc.
  location?: string;        // address used for Google Maps link
  locationName?: string;    // display name — shown instead of raw address when set
  registerUrl?: string;
  parentId?: string;
}

export const AGENDA_EVENTS: Experience[] = agendaData as Experience[];

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
  time?: string;       // "5 PM", "2:30 PM" etc.
  type: string;        // "available" | "speaking" | "workshop" | "attending" | "bootcamp" | etc.
  note?: string;
  location?: string;
  registerUrl?: string;
  parentId?: string;
}

export const CALENDAR_EVENTS: CalendarEvent[] = calendarData as CalendarEvent[];

export const PROFILE = {
  name: "Phillip Wessels",
  callsign: "PAWPER",
  role: "Web Producer · CMS Operations · Platform Architect",
  location: "San Francisco, CA",
  coords: "37.7749°N · 122.4194°W",
  stack: ["WordPress", "CMS Publishing", "Web QA", "REST APIs", "React", "TypeScript"],
  intro:
    "Twenty years on the web. Most recently a Web Producer and CMS operations specialist — twelve years across structured content, CMS architecture, and web QA, with a parallel track in platform architecture and agentic systems. I build where technical rigor and human experience meet. Based in San Francisco.",
  photo: "https://res.cloudinary.com/dr1sonbsi/image/upload/v1780253571/pawper.dev/profile_photo_uhjw6r.jpg",
  email: "hello@pawper.dev",
  resumeUrl: "#resume",
};

export const PROJECTS: Project[] = projectsData as Project[];

export const SERVICES: ServiceEntry[] = [
  {
    id: "employment",
    label: "Employment",
    kicker: "Full-time roles",
    desc: "Seeking web production and CMS operations roles — structured content, publishing workflows, web QA, documentation, and stakeholder enablement — at mission-aligned organizations building something exciting.",
    body: [
      "Seeking a web production / CMS operations role where the work rewards care: accurate publishing, clear intake, structured templates, QA before launch, documentation, and steady support for marketing and content partners. Twelve years of progressive technical ownership at Classic Vacations — from Product Ops QA and reporting infrastructure to sole architect of a WordPress content platform supporting thousands of templated pages and 6+ editors.",
      "Open to mission-aligned organizations building something exciting — with particular interest in agentic AI systems, platform architecture, and the question of how technology can be designed for human flourishing rather than against it. AI and automation are workflow multipliers, not a substitute for judgment or review.",
    ],
    endorsements: [],
    status: "open",
  },
  {
    id: "contracting",
    label: "Contracting",
    kicker: "Web development",
    desc: "Handcrafted web work for businesses of any size — from a small business that deserves a real website to a larger organization needing serious CMS architecture, API integration, or a custom build. Expert judgment and agentic workflows, not a template.",
    body: [
      "Handcrafted web work for businesses of any size. A small business that deserves a real website — not a Wix template or a vibe-coded blur — gets the same expert judgment as a larger organization needing serious CMS architecture, API integration, or a custom build.",
      "The approach: agentic workflows for efficiency, human expertise for quality and accountability. Every project ships with real craft behind it.",
    ],
    endorsements: [],
    status: "open",
  },
  {
    id: "consulting",
    label: "Consulting",
    kicker: "Strategy & vision",
    desc: "For founders and organizations who care about a positive future and want someone in the room asking the right questions. Bridges technical platform strategy with the flourishing lane.",
    body: [
      "For founders and organizations who care about a positive future and want someone in the room asking the right questions.",
      "This engagement bridges technical platform strategy with the flourishing lane — how do we build systems for developing people, distributing agency, and helping the masses flourish? If that question lives at the center of what you're building, let's talk.",
    ],
    endorsements: [],
    status: "open",
  },
  {
    id: "coaching",
    label: "Coaching",
    kicker: "Wellness & flourishing",
    desc: "One-on-one coaching grounded in positive psychology, virtue ethics, and the science of human flourishing. Focused on growth, agency, and getting people into virtuous cycles.",
    body: [
      "One-on-one coaching grounded in positive psychology (Seligman's PERMA model), virtue ethics (Aristotle's eudaimonia), and research on grit and character strengths.",
      "Focused on growth, agency, and getting people into virtuous cycles — including practical tools like agentic fluency for navigating an AI-shaped world. People thrive when they're in cycles of growth and agency. Getting you securely into those cycles is the work.",
    ],
    endorsements: [],
    disclaimer: "I'm currently in training — completing the University of Pennsylvania's Foundations of Positive Psychology Specialization (Seligman, Pawelski, Duckworth, Reivich, Robertson-Kraft) — and am not yet certified. I'm not a licensed therapist, and this coaching is not therapy. Our work together is for personal and professional development only, and does not substitute for medical, mental-health, legal, or financial care. If you're in crisis or need clinical support, please reach out to a licensed professional.",
    status: "full",
  },
  {
    id: "speaking",
    label: "Speaking",
    kicker: "Talks & workshops",
    desc: "Conference talks, panel appearances, and workshops on web development, AI systems, and the intersection of technology and human flourishing.",
    body: [
      "Available for conference talks, panels, and workshops covering web development, agentic AI systems, and the broader questions of how technology shapes human agency and flourishing.",
      "Comfortable with both technical and general audiences. Topics range from practical craft — tooling, architecture, agentic workflows — to the bigger picture questions that make those choices matter.",
    ],
    endorsements: [],
    status: "open",
  },
  {
    id: "mentoring",
    label: "Mentoring",
    kicker: "Skill transfer",
    desc: "Hands-on demos, pairing sessions, and workshops to transfer skills directly — from tooling and workflows to architectural thinking.",
    body: [
      "Hands-on skill transfer through live demos, pair programming, structured walkthroughs, and workshops — focused on building real competency, not just watching someone else do it.",
      "Covers tooling and workflows, architectural thinking, agentic development patterns, and whatever gaps are slowing you down. The goal is capability — not dependency.",
    ],
    endorsements: [],
    status: "open",
  },
];

export const EXPERIENCES: Experience[] = experiencesData as Experience[];

/** All experience-type entries: hardcoded historical EXPERIENCES plus the dated,
 *  Airtable-sourced AGENDA_EVENTS (including nested child sessions). Both open as
 *  `experience` modals and are independently navigable, so they count as entries
 *  for search, activity, skills, and feed integrations. */
export const ALL_EXPERIENCES: Experience[] = [...EXPERIENCES, ...AGENDA_EVENTS];

// ── Project category helpers ─────────────────────────────────────────────────

const _customCatIds = [
  ...new Set(
    PROJECTS.flatMap((p) => (p.categories ?? []))
      .filter((c) => c !== "featured")
  ),
];

export const PROJECT_CATEGORIES: Array<{ id: string; label: string; sub?: string }> = [
  { id: "featured", label: "Featured", sub: `${PROJECTS.filter((p) => p.categories?.includes("featured")).length} · ›` },
  { id: "latest",   label: "Latest",   sub: `${PROJECTS.length} · ›` },
  ..._customCatIds.map((id) => ({
    id,
    label: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    sub: `${PROJECTS.filter((p) => p.categories?.includes(id)).length} · ›`,
  })),
];

export const DEFAULT_PROJECT_CAT = "featured";

export function getStackLabel(p: Project): string {
  if (p.stack) return p.stack;

  const topics = p.topics.map((t) => t.toLowerCase());
  const langs = Object.keys(p.languages);
  const hasTopic = (t: string) => topics.includes(t);
  const hasLang = (l: string) => langs.some((x) => x.toLowerCase() === l.toLowerCase());

  if (hasTopic("react"))                            return "React";
  if (hasTopic("astro"))                            return "Astro";
  if (hasTopic("nextjs") || hasTopic("next-js"))   return "Next.js";
  if (hasTopic("sveltekit") || hasTopic("svelte")) return "SvelteKit";
  if (hasTopic("vue"))                              return "Vue";
  if (hasTopic("angular"))                          return "Angular";
  if (hasTopic("django"))                           return "Django";
  if (hasTopic("rails") || hasTopic("ruby-on-rails")) return "Rails";
  if (hasTopic("laravel"))                          return "Laravel";
  if (hasTopic("wordpress"))                        return "WordPress";
  if (hasTopic("fastapi"))                          return "FastAPI";
  if (hasTopic("flask"))                            return "Flask";
  if (hasTopic("express"))                          return "Express";
  if (hasTopic("cli"))                              return "CLI Tool";
  if (hasTopic("api") || hasTopic("rest-api"))      return "API";

  if (hasLang("Astro"))      return "Astro";
  if (hasLang("EJS"))        return "Node.js / EJS";
  if (hasLang("Python"))     return "Python";
  if (hasLang("Go"))         return "Go";
  if (hasLang("Rust"))       return "Rust";
  if (hasLang("Ruby"))       return "Ruby";
  if (hasLang("PHP"))        return "PHP";
  if (hasLang("Java"))       return "Java";
  if (hasLang("C#"))         return "C#";

  const htmlPct = parseFloat(p.languages["HTML"]?.percent ?? "0");
  if (htmlPct > 50)          return "HTML / CSS";

  if (hasLang("TypeScript")) return "TypeScript";
  if (hasLang("JavaScript")) return "JavaScript";

  return langs[0] ?? "Code";
}

const STACK_TO_LANG: Record<string, string> = {
  "React":      "JavaScript",
  "Next.js":    "TypeScript",
  "Astro":      "Astro",
  "SvelteKit":  "Svelte",
  "Vue":        "Vue",
  "Angular":    "TypeScript",
  "Django":     "Python",
  "Rails":      "Ruby",
  "Laravel":    "PHP",
  "WordPress":  "PHP",
  "FastAPI":    "Python",
  "Flask":      "Python",
  "Express":    "JavaScript",
  "Node.js":    "JavaScript",
  "Node.js / EJS": "EJS",
  "Python":     "Python",
  "Go":         "Go",
  "Rust":       "Rust",
  "Ruby":       "Ruby",
  "PHP":        "PHP",
  "Java":       "Java",
  "C#":         "C#",
  "TypeScript": "TypeScript",
  "JavaScript": "JavaScript",
  "HTML / CSS": "HTML",
};

export function getPrimaryColor(p: Project): string {
  const fallback = Object.values(p.languages)[0]?.color ?? "#2b8bff";

  if (p.stack) {
    const stackLower = p.stack.toLowerCase();
    for (const [lang, { color }] of Object.entries(p.languages)) {
      if (stackLower.includes(lang.toLowerCase())) return color;
    }
  }

  const preferredLang = STACK_TO_LANG[getStackLabel(p)];
  if (preferredLang && p.languages[preferredLang]) {
    return p.languages[preferredLang].color;
  }

  return fallback;
}

export function getProjectsForCategory(catId: string): Project[] {
  const byRecent = (a: Project, b: Project) => b.pushedAt.localeCompare(a.pushedAt);
  if (!catId || catId === "featured") return PROJECTS.filter((p) => p.categories?.includes("featured")).sort(byRecent);
  if (catId === "latest") return [...PROJECTS].sort(byRecent);
  return PROJECTS.filter((p) => p.categories?.includes(catId)).sort(byRecent);
}

export const LOGS: Log[] = [];
export const SERIES_NAMES: string[] = [];
export const LOG_CATEGORIES: Array<{ id: string; label: string; sub?: string; isSeries?: boolean }> = [];

export function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function initLogs(incoming: Log[]): void {
  LOGS.splice(0, LOGS.length, ...incoming);

  const seriesNames = [...new Set(incoming.filter((a) => a.series).map((a) => a.series!.name))];
  SERIES_NAMES.splice(0, SERIES_NAMES.length, ...seriesNames);

  const kickers = [...new Set(incoming.map((a) => a.kicker))];
  LOG_CATEGORIES.splice(0, LOG_CATEGORIES.length,
    { id: "latest", label: "Latest", sub: `${incoming.length} · ›` },
    ...kickers.map((k) => ({
      id: slugify(k),
      label: k,
      sub: `${incoming.filter((a) => a.kicker === k).length} · ›`,
    })),
    { id: "series", label: "Series", sub: `${seriesNames.length} · ›` },
  );
}

export const DEFAULT_LOG_CAT = "latest";

export function getLogsForCategory(catId: string): Log[] {
  if (!catId || catId === "latest") return [...LOGS].sort((a, b) => b.date.localeCompare(a.date));
  if (catId.startsWith("series-")) {
    const slug = catId.slice(7);
    const name = [...new Set(LOGS.filter((a) => a.series).map((a) => a.series!.name))].find((n) => slugify(n) === slug);
    if (name) return LOGS.filter((a) => a.series?.name === name).sort((a, b) => (a.series?.part ?? 0) - (b.series?.part ?? 0));
  }
  const kicker = [...new Set(LOGS.map((a) => a.kicker))].find((k) => slugify(k) === catId);
  if (kicker) return [...LOGS.filter((a) => a.kicker === kicker)].sort((a, b) => b.date.localeCompare(a.date));
  return LOGS;
}

export const SKILLS: Array<{ label: string; items: string[] }> = [
  { label: "AI",           items: ["OpenClaw", "Hermes", "Claude", "ChatGPT", "Gemini", "Antigravity", "OpenRouter", "Ollama", "ngrok", "Discord", "Telegram"] },
  { label: "Agents",       items: ["Agentic Systems", "MCP", "A2A", "WebMCP", "Agent Memory"] },
  { label: "Frontend",     items: ["HTML", "CSS", "SCSS", "JavaScript", "TypeScript", "React", "Astro", "Tailwind", "Bootstrap", "EJS"] },
  { label: "Backend",      items: ["Node", "Python", "SQL", "PHP", "REST APIs", "PowerShell", "Bash"] },
  { label: "Tooling",      items: ["Git", "Webpack", "Vite", "Netlify", "Puppeteer", "Octokit", "Cloudinary", "Docker", "VS Code", "Terminal", "WSL", "Containers", "Deployment", "Syncthing"] },
  { label: "Content/Data", items: ["WordPress", "CMS Publishing", "Structured Content", "Toolset", "Elementor", "Content QA", "Postman", "Excel/VBA", "Smartsheet", "Zoho Desk", "Obsidian"] },
  { label: "Practice",     items: ["Accessibility", "Performance", "Testing", "DX", "Type-safety", "Design", "AI-Augmented Dev", "Security"] },
  { label: "Flourishing",  items: ["Positive Psychology", "PERMA", "VIA Strengths", "Wellness Coaching", "Personal OS", "Second Brain"] },
  { label: "Adjacent",     items: ["Mentoring", "Writing", "Figma"] },
];

export const SKILL_ALIASES: Record<string, string[]> = {
  "JavaScript":    ["js"],
  "TypeScript":    ["ts"],
  "SCSS":          ["sass"],
  "Node":          ["nodejs", "node.js"],
  "Postgres":      ["postgresql", "pg", "psql"],
  "Tailwind":      ["tailwindcss"],
  "CSS Grid":      ["grid"],
  "Accessibility": ["a11y"],
  "Type-safety":   ["types"],
  "React":         ["react.js"],
  "CSS":           ["cascading style sheets", "cascading style sheets (css)"],
  "REST APIs":     ["apis", "api"],
  "Writing":       ["copy editing", "copyediting", "copy-editing"],
  "Design":        ["web design", "ux", "user experience", "user experience (ux)"],
  "Testing":       ["quality assurance", "qa"],
  "VS Code":       ["vscode"],
  "Discord":       ["discord bots", "discord bot"],
  "Agentic Systems": ["agentic ai", "ai agents", "agentic systems design"],
  "Agent Memory":  ["memory"],
  "MCP":           ["model context protocol"],
  "A2A":           ["agent-to-agent", "agent to agent"],
  "WebMCP":        ["web mcp"],
};

export function canonicalizeSkill(name: string): string {
  const lower = name.toLowerCase();
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === lower)) return canonical;
  }
  return name;
}

export const BACKDROPS: Record<string, string> = {
  alpine: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2400&q=80",
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=2400&q=80",
  ocean:  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&q=80",
  golden: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2400&q=80",
  misty:  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2400&q=80",
  space:  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2400&q=80",
};

export const CX_INDEX: CXCategory[] = [
  {
    id: "personnel",
    label: "Personnel File",
    code: "001",
    accent: "#e84455",
    accentDeep: "#e84455",
    accentRgb: "232, 68, 85",
    accentLight: "#a51e2b",
    accentDeepLight: "#a51e2b",
    accentRgbLight: "165, 30, 43",
    entries: [
      { id: "bio",      label: "Biographical record" },
      { id: "skills",   label: "Skills & competencies" },
      { id: "activity", label: "Activity" },
      { id: "training", label: "Training & background" },
      { id: "resume",   label: "Resume" },
    ],
  },
  {
    id: "services",
    label: "Services",
    code: "002",
    accent: "#9055e8",
    accentDeep: "#c49ef8",
    accentRgb: "144, 85, 232",
    accentLight: "#6633bb",
    accentDeepLight: "#4d2299",
    accentRgbLight: "102, 51, 187",
    entries: [
      { id: "overview",    label: "Overview" },
      { id: "employment",  label: "Employment" },
      { id: "contracting", label: "Contracting" },
      { id: "consulting",  label: "Consulting" },
      { id: "coaching",    label: "Coaching" },
      { id: "speaking",    label: "Speaking" },
      { id: "mentoring",   label: "Mentoring" },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    code: "003",
    accent: "#2b8bff",
    accentDeep: "#1968d6",
    accentRgb: "43, 139, 255",
    entries: PROJECT_CATEGORIES,
  },
  {
    id: "logs",
    label: "Logs",
    code: "004",
    accent: "#3fbf7a",
    accentDeep: "#1f8a5b",
    accentRgb: "63, 191, 122",
    accentLight: "#1a7a4d",
    accentDeepLight: "#0d5236",
    accentRgbLight: "26, 122, 77",
    entries: LOG_CATEGORIES,
  },
  {
    id: "contact",
    label: "Contact",
    code: "005",
    accent: "#f5c130",
    accentDeep: "#a07e15",
    accentRgb: "245, 193, 48",
    accentDeepLight: "#6b5410",
    rootIsCombo: true,
    entries: [{ id: "all", label: "Open channel" }],
  },
  {
    id: "calendar",
    label: "Agenda",
    code: "006",
    accent: "#f55a28",
    accentDeep: "#c4421a",
    accentRgb: "245, 90, 40",
    accentLight: "#c4421a",
    accentDeepLight: "#9e3010",
    accentRgbLight: "196, 66, 26",
    rootIsCombo: true,
    entries: [{ id: "all", label: "Schedule" }],
  },
];

export const LOG_CAT = CX_INDEX.find(c => c.id === "logs")!;
