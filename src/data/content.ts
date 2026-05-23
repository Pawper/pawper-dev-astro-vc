import type { Project, Log, CXCategory } from "../types";
import projectsData from "./projects.json";

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
  | "coaching" | "speaking" | "mentoring" | "education";

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
}

export const PROFILE = {
  name: "Phillip Wessels",
  callsign: "PAWPER",
  role: "Platform Architect",
  location: "San Francisco, CA",
  coords: "37.7749°N · 122.4194°W",
  stack: ["React", "TypeScript", "Node", "Python", "Postgres", "Tailwind"],
  intro:
    "Twenty years on the web — from data engineering and CMS architecture to agentic systems design. I build platforms where technical rigor and human experience meet. Based in San Francisco.",
  email: "hello@pawper.dev",
  resumeUrl: "#resume",
};

export const PROJECTS: Project[] = projectsData as Project[];

export const SERVICES: ServiceEntry[] = [
  {
    id: "employment",
    label: "Employment",
    kicker: "Full-time roles",
    desc: "Seeking a role at the intersection of web platforms, AI systems, and human-centered design. Open to mission-aligned organizations building something exciting.",
    body: [
      "Seeking a role at the intersection of web platforms, AI systems, and human-centered design. Twelve years of progressive technical ownership at Classic Vacations — from reporting infrastructure to sole architect of a full content platform — now looking for the next challenge.",
      "Open to mission-aligned organizations building something exciting. Particular interest in roles involving agentic AI systems, platform architecture, or the question of how technology can be designed for human flourishing rather than against it.",
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
    status: "full",
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
    status: "full",
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

export const EXPERIENCES: Experience[] = [
  {
    id: "upenn-coursera-2026",
    title: "Positive Psychology: Martin E. P. Seligman's Visionary Science",
    organization: "UPenn · Coursera",
    period: "Feb 2026",
    category: "education",
    description: "PERMA framework, VIA Strengths Inventory, Positive Interventions. Credential ID: PTEV8VSOB4IV.",
    featured: true,
    skills: ["Positive Psychology", "PERMA", "VIA Strengths", "Wellness Coaching"],
    certificationImage: "https://res.cloudinary.com/dr1sonbsi/image/upload/c_crop,h_924,w_1194/v1779398667/pawper.dev/Certifications/CERTIFICATE_LANDING_PAGE_PTEV8VSOB4IV_ti3klv.jpg",
    certificationUrl: "https://www.coursera.org/account/accomplishments/verify/PTEV8VSOB4IV",
  },
  {
    id: "classic-vacations-architect-2022",
    title: "Web Producer",
    organization: "Classic Vacations",
    period: "2022–2026",
    category: "employment",
    description: "Sole architect of the WordPress CMS; custom post types, REST API, external API integration, design system.",
    longDescription: [
      "Architected and implemented a custom WordPress CMS from the ground up — custom post types, taxonomies, relational content models (Toolset), JetMenu megamenu, and Elementor page templates — serving thousands of destination, hotel, and itinerary pages used daily by 6+ editors across Marketing and Solutions.",
      "Built a REST API endpoint delivering destination images to client travel statements: hierarchical lookup with parent fallback, custom image sizing, Toolset custom fields for external location IDs, and a coverage-reporting view coordinated with Marketing for gap resolution.",
      "Engineered a TBO API integration layer on hotel property pages — custom import UI with live JSON store, per-field content-source toggles between internal and third-party data, and a photo gallery — enabling real-time content switching without developer intervention.",
      "Owned all templated product and taxonomy pages; designed full content architecture for destination, hotel, and itinerary content types site-wide.",
      "Reduced Marketing dependency on developers for content publishing through structured CMS design, enabling self-service page creation for 6+ non-technical editors.",
      "Leveraged AI coding assistance (ChatGPT, Copilot, Claude) as a core development practice; explicitly recognized by management for incorporating AI into workflow.",
    ],
    featured: true,
    skills: ["WordPress", "PHP", "JavaScript", "TypeScript", "REST APIs"],
    endorsementIds: ["lauren-brown"],
  },
  {
    id: "classic-vacations-qa-2019",
    title: "Product Operations Admin — QA & Training",
    organization: "Classic Vacations",
    period: "2019–2022",
    category: "employment",
    description: "Rebuilt automated reporting infrastructure: PowerShell, SQL pipelines, Excel VBA, modular query architecture.",
    longDescription: [
      "Designed and deployed a centralized reporting automation platform — consolidating hundreds of individual scheduled tasks into a maintainable PowerShell + SQL + Windows Task Scheduler system generating recurring QA, booking, and operational reports for two teams and cross-departmental stakeholders.",
      "Took over and corrected production-critical SQL queries (originally broken by another team) powering QA and booking-travel reports; documented and maintained the query library.",
      "Built a custom Excel VBA add-in that turned a neglected CSV report (source of recurring financial loss) into a one-click pivot table dashboard, driving consistent adoption.",
      "Engineered PowerShell scripts replacing a multi-step error-prone manual process with a single automated workflow; successfully advocated for the software update required to enable it.",
      "Led team adoption of GitHub for version control, replacing email-based code sharing and manual backups; trained new hires and authored process and workflow documentation.",
    ],
    featured: true,
    skills: ["PowerShell", "SQL", "Excel/VBA"],
  },
  {
    id: "classic-vacations-admin-2013",
    title: "Product Operations Admin",
    organization: "Classic Vacations",
    period: "2013–2019",
    category: "employment",
    description: "QA review, data entry, copy editing, and Excel-based reporting. Contracted via Volt Workforce Solutions, Oct 2013 – Jul 2014.",
    longDescription: [
      "Supported product contracting operations through QA review, data entry, copy editing, and Excel-based reporting.",
    ],
    featured: true,
    skills: ["Excel/VBA", "SQL"],
  },
  {
    id: "csu-fresno-ba-2008",
    title: "B.A., Special Major — Interactive Intermedia",
    organization: "CSU Fresno",
    period: "2008–2013",
    category: "education",
    description: "Self-designed program unifying art, media, and interactive experience.",
    featured: true,
    skills: ["Design"],
  },
];

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
  { label: "Frontend",     items: ["HTML", "CSS", "SCSS", "JavaScript", "TypeScript", "React", "Astro", "Tailwind", "Bootstrap", "EJS"] },
  { label: "Backend",     items: ["Node", "Python", "SQL", "PHP", "REST APIs", "PowerShell", "Bash"] },
  { label: "Tooling",     items: ["Git", "Webpack", "Vite", "Netlify", "Puppeteer", "Octokit", "Cloudinary", "Docker"] },
  { label: "Content/Data", items: ["WordPress", "Toolset", "Elementor", "Postman", "Excel/VBA", "Smartsheet", "Zoho Desk"] },
  { label: "Practice",    items: ["Accessibility", "Performance", "Testing", "DX", "Type-safety", "Design", "AI-Augmented Dev"] },
  { label: "Flourishing", items: ["Positive Psychology", "PERMA", "VIA Strengths", "Wellness Coaching"] },
  { label: "Adjacent",    items: ["Mentoring", "Writing", "Figma"] },
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
    entries: LOG_CATEGORIES,
  },
  {
    id: "contact",
    label: "Contact",
    code: "005",
    accent: "#f5c130",
    accentDeep: "#a07e15",
    accentRgb: "245, 193, 48",
    rootIsCombo: true,
    entries: [{ id: "all", label: "Open channel" }],
  },
];

export const LOG_CAT = CX_INDEX.find(c => c.id === "logs")!;
