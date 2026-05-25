/**
 * Scans log markdown and project README HTML for bare external URLs,
 * fetches OG metadata for each, and writes src/data/og-link-cache.json.
 *
 * A "bare URL" is a URL that appears alone on a paragraph line — markdown
 * renders these as <p><a href="url">url</a></p>, which proseEnhance.ts
 * upgrades to a rich link card.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const CACHE_PATH  = join(ROOT, 'src/data/og-link-cache.json');
const LOGS_DIR    = join(ROOT, 'src/content/logs');
const PROJECTS_PATH = join(ROOT, 'src/data/projects.json');

// ── Extraction helpers ────────────────────────────────────────────────────────

function stripFrontmatter(md) {
  if (!md.startsWith('---')) return md;
  const end = md.indexOf('\n---', 3);
  return end === -1 ? md : md.slice(end + 4);
}

function extractMarkdownUrls(markdown) {
  const body = stripFrontmatter(markdown);
  const urls = new Set();
  let inCode = false;
  for (const line of body.split('\n')) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) { inCode = !inCode; continue; }
    if (inCode) continue;
    let t = line.trim();
    // Strip leading blockquote markers (> or >> etc.)
    while (t.startsWith('>')) t = t.slice(1).trimStart();
    // Strip trailing hard-line-break marker (\)
    if (t.endsWith('\\')) t = t.slice(0, -1).trimEnd();
    if (/^https?:\/\/\S+$/.test(t)) urls.add(t);
  }
  return urls;
}

function extractHtmlUrls(html) {
  const urls = new Set();
  // GitHub-rendered bare URLs: <p><a href="url" ...>url</a></p>
  const re = /<p>\s*<a\s[^>]*href="(https?:\/\/[^"]+)"[^>]*>\s*https?:\/\/[^\s<]+\s*<\/a>\s*<\/p>/gi;
  let m;
  while ((m = re.exec(html)) !== null) urls.add(m[1]);
  return urls;
}

// ── OG fetch ─────────────────────────────────────────────────────────────────

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

async function fetchOg(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; pawper.dev link-card bot/1.0)' },
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('html')) return null;

    // Read only the first 64 KB — OG tags always appear in <head>
    const reader = res.body.getReader();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += new TextDecoder().decode(value);
      if (text.length > 65536) { reader.cancel().catch(() => {}); break; }
    }

    const get = (...patterns) => {
      for (const p of patterns) {
        const m = text.match(p);
        const v = m?.[1]?.trim();
        if (v) return decodeEntities(v);
      }
      return null;
    };

    const title = get(
      /<meta\s[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
      /<meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i
    );
    const description = get(
      /<meta\s[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
      /<meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i,
      /<meta\s[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
      /<meta\s[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i
    );
    const image = get(
      /<meta\s[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta\s[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
    );

    if (!title && !description) return null;

    const domain = new URL(url).hostname.replace(/^www\./, '');
    return { title, description, image, domain };
  } catch {
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  let cache = {};
  try { cache = JSON.parse(await readFile(CACHE_PATH, 'utf8')); } catch {}

  const urls = new Set();

  const logFiles = (await readdir(LOGS_DIR)).filter(f => f.endsWith('.md'));
  for (const file of logFiles) {
    const md = await readFile(join(LOGS_DIR, file), 'utf8');
    for (const u of extractMarkdownUrls(md)) urls.add(u);
  }

  const projects = JSON.parse(await readFile(PROJECTS_PATH, 'utf8'));
  for (const p of projects) {
    if (p.readme) for (const u of extractHtmlUrls(p.readme)) urls.add(u);
  }

  console.log(`[fetchLinkCards] ${urls.size} bare URL(s) found across logs + READMEs`);

  let fetched = 0, skipped = 0, failed = 0;
  for (const url of urls) {
    if (cache[url]) { skipped++; continue; }
    process.stdout.write(`[fetchLinkCards] ${url} ... `);
    const og = await fetchOg(url);
    if (og) {
      cache[url] = og;
      process.stdout.write(`✓ ${og.title ?? '(no title)'}\n`);
      fetched++;
    } else {
      process.stdout.write(`✗\n`);
      failed++;
    }
  }

  console.log(`[fetchLinkCards] fetched ${fetched} · skipped ${skipped} cached · failed ${failed}`);
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`[fetchLinkCards] wrote ${Object.keys(cache).length} entries → og-link-cache.json`);
}

main().catch(console.error);
