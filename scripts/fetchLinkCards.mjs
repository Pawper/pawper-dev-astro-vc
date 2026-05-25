/**
 * Scans log markdown and project README HTML for bare external URLs,
 * fetches OG metadata for each, and writes src/data/og-link-cache.json.
 *
 * A "bare URL" is a URL that appears alone on a paragraph line — markdown
 * renders these as <p><a href="url">url</a></p>, which proseEnhance.ts
 * upgrades to a rich link card.
 *
 * Two-pass fetch strategy:
 *   1. Plain fetch for most URLs (fast, lightweight)
 *   2. Puppeteer + stealth plugin for bot-protected sites (Cloudflare etc.)
 *      — only launched if pass 1 detects a challenge response
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const CACHE_PATH   = join(ROOT, 'src/data/og-link-cache.json');
const LOGS_DIR     = join(ROOT, 'src/content/logs');
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
    while (t.startsWith('>')) t = t.slice(1).trimStart();
    if (t.endsWith('\\')) t = t.slice(0, -1).trimEnd();
    if (/^https?:\/\/\S+$/.test(t)) urls.add(t);
  }
  return urls;
}

function extractHtmlUrls(html) {
  const urls = new Set();
  const re = /<p>\s*<a\s[^>]*href="(https?:\/\/[^"]+)"[^>]*>\s*https?:\/\/[^\s<]+\s*<\/a>\s*<\/p>/gi;
  let m;
  while ((m = re.exec(html)) !== null) urls.add(m[1]);
  return urls;
}

// ── OG parsing ────────────────────────────────────────────────────────────────

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function parseOgFromHtml(text, url) {
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
}

// ── Pass 1: plain fetch ───────────────────────────────────────────────────────

const BLOCKED_SENTINEL = Symbol('blocked');

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

    if (res.status === 403 || res.status === 429) {
      const body = await res.text().catch(() => '');
      // Cloudflare challenge or similar bot-wall — queue for browser pass
      if (
        res.headers.get('cf-ray') ||
        body.includes('Just a moment') ||
        body.includes('cf-browser-verification') ||
        body.includes('_cf_chl')
      ) {
        return BLOCKED_SENTINEL;
      }
      return null;
    }

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

    return parseOgFromHtml(text, url);
  } catch {
    return null;
  }
}

// ── Pass 2: stealth browser ───────────────────────────────────────────────────

async function fetchOgBrowser(urls) {
  let puppeteer, StealthPlugin;
  try {
    puppeteer = (await import('puppeteer-extra')).default;
    StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
  } catch {
    console.log('[fetchLinkCards] puppeteer-extra not installed — skipping browser pass');
    return {};
  }

  puppeteer.use(StealthPlugin());

  let browser;
  const results = {};
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    for (const url of urls) {
      process.stdout.write(`[fetchLinkCards] (stealth) ${url} ... `);
      try {
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
        // Brief pause to let any JS-injected meta tags settle
        await new Promise(r => setTimeout(r, 1200));
        const html = await page.content();
        await page.close();
        const og = parseOgFromHtml(html, url);
        results[url] = og;
        process.stdout.write(og ? `✓ ${og.title ?? '(no title)'}\n` : `✗\n`);
      } catch (err) {
        process.stdout.write(`✗ (${err.message})\n`);
        results[url] = null;
      }
    }
  } finally {
    await browser?.close();
  }
  return results;
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
  const blocked = [];

  for (const url of urls) {
    if (cache[url]) { skipped++; continue; }
    process.stdout.write(`[fetchLinkCards] ${url} ... `);
    const result = await fetchOg(url);
    if (result === BLOCKED_SENTINEL) {
      process.stdout.write(`⚠ bot-protected — queued for stealth browser\n`);
      blocked.push(url);
    } else if (result) {
      cache[url] = result;
      process.stdout.write(`✓ ${result.title ?? '(no title)'}\n`);
      fetched++;
    } else {
      process.stdout.write(`✗\n`);
      failed++;
    }
  }

  if (blocked.length > 0) {
    console.log(`[fetchLinkCards] launching stealth browser for ${blocked.length} blocked URL(s)...`);
    const browserResults = await fetchOgBrowser(blocked);
    for (const [url, og] of Object.entries(browserResults)) {
      if (og) {
        cache[url] = og;
        fetched++;
      } else {
        failed++;
      }
    }
  }

  console.log(`[fetchLinkCards] fetched ${fetched} · skipped ${skipped} cached · failed ${failed}`);
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`[fetchLinkCards] wrote ${Object.keys(cache).length} entries → og-link-cache.json`);
}

main().catch(console.error);
