const KEY = "pw-log-progress";

export interface LogProgressEntry {
  current: string | null;
  checked: string[];
  completed: boolean;
}

function load(): Record<string, LogProgressEntry> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); }
  catch { return {}; }
}

function save(store: Record<string, LogProgressEntry>): void {
  try { localStorage.setItem(KEY, JSON.stringify(store)); }
  catch {}
}

function notifyUpdate(slug: string): void {
  try { window.dispatchEvent(new CustomEvent("pw-progress-update", { detail: { slug } })); }
  catch {}
}

export function getProgress(slug: string): LogProgressEntry {
  return load()[slug] ?? { current: null, checked: [], completed: false };
}

// Phase 1: heading ring filled → bookmark
export function bookmarkHeading(slug: string, headingId: string): void {
  const store = load();
  const entry: LogProgressEntry = store[slug] ?? { current: null, checked: [], completed: false };
  entry.current = headingId;
  store[slug] = entry;
  save(store);
  notifyUpdate(slug);
}

// Click shortcut: mark section complete and advance bookmark to next unchecked section
export function checkSection(slug: string, headingId: string, allIds: string[]): void {
  const store = load();
  const entry: LogProgressEntry = store[slug] ?? { current: null, checked: [], completed: false };
  if (!entry.checked.includes(headingId)) entry.checked = [...entry.checked, headingId];
  if (entry.checked.length === allIds.length) {
    entry.completed = true;
    entry.current = null;
  } else {
    const idx = allIds.indexOf(headingId);
    entry.current = allIds.find((id, i) => i > idx && !entry.checked.includes(id))
      ?? allIds.find(id => !entry.checked.includes(id))
      ?? null;
  }
  store[slug] = entry;
  save(store);
  notifyUpdate(slug);
}

// Atomically check off prevId (if any) and bookmark newId in one write
export function advanceBookmark(slug: string, prevId: string | null, newId: string, allIds: string[]): void {
  const store = load();
  const entry: LogProgressEntry = store[slug] ?? { current: null, checked: [], completed: false };
  if (prevId && !entry.checked.includes(prevId)) entry.checked = [...entry.checked, prevId];
  entry.current = newId;
  if (entry.checked.length === allIds.length) entry.completed = true;
  store[slug] = entry;
  save(store);
  notifyUpdate(slug);
}

// Phase 2: sentinel dwell → check off the bookmarked section
export function completeSection(slug: string, headingId: string, allIds: string[]): void {
  const store = load();
  const entry: LogProgressEntry = store[slug] ?? { current: null, checked: [], completed: false };
  if (!entry.checked.includes(headingId)) entry.checked = [...entry.checked, headingId];
  entry.current = null;
  if (allIds[allIds.length - 1] === headingId) entry.completed = true;
  store[slug] = entry;
  save(store);
  notifyUpdate(slug);
}

export function completeAll(slug: string, allIds: string[]): void {
  const store = load();
  const entry: LogProgressEntry = store[slug] ?? { current: null, checked: [], completed: false };
  entry.checked = [...allIds];
  entry.current = null;
  entry.completed = true;
  store[slug] = entry;
  save(store);
  notifyUpdate(slug);
}

export function isCompleted(slug: string): boolean {
  return load()[slug]?.completed === true;
}

export function uncheckSection(slug: string, headingId: string): void {
  const store = load();
  const entry = store[slug] ?? { current: null, checked: [], completed: false };
  entry.checked = entry.checked.filter(id => id !== headingId);
  entry.completed = false;
  if (entry.current === headingId) entry.current = null;
  store[slug] = entry;
  save(store);
  notifyUpdate(slug);
}

export function clearProgress(slug: string): void {
  const store = load();
  delete store[slug];
  save(store);
  window.dispatchEvent(new CustomEvent("pw-progress-reset", { detail: { slug } }));
}
