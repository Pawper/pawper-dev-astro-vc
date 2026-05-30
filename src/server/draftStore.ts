// Shared draft-file operations for the dev-only editor. Used by both the Astro
// endpoint stub (src/pages/api/edit.ts) and the dev middleware (astro.config.mjs).
// Everything here is confined to src/content/logs-drafts/ and is path-traversal safe.
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const DRAFTS_DIR = path.resolve(process.cwd(), 'src/content/logs-drafts');

// Filenames must be a bare slug-ish name ending in .md — no slashes, no dot-dirs.
const FILENAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*\.md$/;

export class DraftError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Resolve a user filename to an absolute path inside DRAFTS_DIR, or throw DraftError. */
function resolveDraftPath(filename: unknown): string {
  if (typeof filename !== 'string' || !FILENAME_RE.test(filename)) {
    throw new DraftError('Invalid filename', 400);
  }
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    throw new DraftError('Invalid filename', 400);
  }
  const resolved = path.resolve(DRAFTS_DIR, filename);
  const rel = path.relative(DRAFTS_DIR, resolved);
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new DraftError('Invalid filename', 400);
  }
  return resolved;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DRAFTS_DIR, { recursive: true });
}

/** Pull a single top-level scalar field out of YAML frontmatter for list display. */
function frontmatterField(content: string, field: string): string | undefined {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return undefined;
  const m = fm[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  if (!m) return undefined;
  return m[1].trim().replace(/^["']|["']$/g, '');
}

export interface DraftSummary {
  filename: string;
  title: string;
  date?: string;
  kicker?: string;
  size: number;
  modified: number;
}

export async function listDrafts(): Promise<DraftSummary[]> {
  await ensureDir();
  const names = (await fs.readdir(DRAFTS_DIR)).filter((n) => n.endsWith('.md'));
  const files = await Promise.all(
    names.map(async (filename) => {
      const full = path.join(DRAFTS_DIR, filename);
      const [stat, content] = await Promise.all([fs.stat(full), fs.readFile(full, 'utf-8')]);
      return {
        filename,
        title: frontmatterField(content, 'title') ?? filename.replace(/\.md$/, ''),
        date: frontmatterField(content, 'date'),
        kicker: frontmatterField(content, 'kicker'),
        size: stat.size,
        modified: stat.mtimeMs,
      };
    }),
  );
  files.sort((a, b) => b.modified - a.modified);
  return files;
}

export async function readDraft(filename: unknown): Promise<{ filename: string; content: string }> {
  const target = resolveDraftPath(filename);
  try {
    const content = await fs.readFile(target, 'utf-8');
    return { filename: path.basename(target), content };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') throw new DraftError('File not found', 404);
    throw err;
  }
}

export async function saveDraft(filename: unknown, content: unknown): Promise<{ filename: string }> {
  const target = resolveDraftPath(filename);
  if (typeof content !== 'string') throw new DraftError('Missing content', 400);
  await ensureDir();
  await fs.writeFile(target, content, 'utf-8');
  return { filename: path.basename(target) };
}

export async function deleteDraft(filename: unknown): Promise<void> {
  const target = resolveDraftPath(filename);
  try {
    await fs.unlink(target);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') throw new DraftError('File not found', 404);
    throw err;
  }
}
