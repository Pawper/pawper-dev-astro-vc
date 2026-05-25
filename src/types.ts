export interface Project {
  id: string;
  name: string;
  title: string;       // title-cased from repo name
  description: string; // repo.description
  githubURL: string;
  webURL: string;
  topics: string[];
  languages: Record<string, { percent: string; color: string }>;
  readme?: string;
  image: string;
  year: string;
  pushedAt: string;
  allCommitDates: string[];
  commitsByLanguage: Record<string, string[]>;
  status: "live" | "archived" | "ongoing";
  categories: string[]; // from README frontmatter — e.g. ["featured", "ai-assisted"]
  stack?: string;       // from README frontmatter — e.g. "Astro", "React"; falls back to detection
}

export interface Log {
  id: string;
  title: string;
  date: string;
  words: number;
  kicker: string;
  tags?: string[];
  image?: string;
  hook?: string;
  devto?: string;
  series?: { name: string; part: number; total: number };
  noThumb?: string[];
}

export type ViewKind = "home" | "entry" | "grid";

export interface View {
  kind: ViewKind;
  cat?: string;
  entry?: string;
}

export type ModalSibling = { kind: "project" | "log" | "media"; id: string; label?: string };

export interface ModalState {
  kind: "project" | "log" | "skill" | "series" | "search" | "experience" | "media";
  id: string;
  color?: string;
  filterType?: "topic" | "language";
  siblings?: ModalSibling[];
  query?: string;
  label?: string;
}

export interface CXEntry {
  id: string;
  label: string;
  sub?: string;
  isSeries?: boolean;
}

export interface CXCategory {
  id: string;
  label: string;
  code: string;
  accent: string;
  accentDeep: string;
  accentRgb: string;
  accentLight?: string;
  accentDeepLight?: string;
  accentRgbLight?: string;
  rootIsGrid?: boolean;
  rootIsCombo?: boolean;
  entries: CXEntry[];
}

export type Theme = "light" | "dark";
