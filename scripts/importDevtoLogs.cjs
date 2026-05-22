"use strict";
/**
 * Imports published and unpublished articles from Dev.to into src/content/logs/.
 *
 * - Published articles get a devto: URL field (links out from the log modal).
 * - Unpublished drafts get hidden: true (hidden from the site until you remove that field).
 * - Existing files are skipped — delete a file to re-import it.
 * - Dev.to liquid tags are converted or stripped.
 * - Kicker is derived from the first tag; edit frontmatter after import to adjust.
 *
 * Env vars:
 *   DEVTO_API_KEY  — from dev.to/settings/extensions
 *
 * Usage:
 *   node scripts/importDevtoLogs.cjs
 */

const path = require("path");
const fs   = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API_KEY       = process.env.DEVTO_API_KEY;
const LOGS_DIR      = path.join(__dirname, "../src/content/logs");
const DRAFTS_DIR    = path.join(__dirname, "../src/content/logs-drafts");

if (!API_KEY) {
  console.error("❌  DEVTO_API_KEY not set in .env — aborting.");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isoToLogDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

const TAG_TO_KICKER = {
  javascript: "JavaScript", typescript: "TypeScript",
  react: "React", reactjs: "React", vue: "Vue", svelte: "Svelte",
  css: "CSS", html: "HTML", design: "Design", ux: "Design",
  node: "Node.js", nodejs: "Node.js", express: "Node.js",
  php: "PHP", python: "Python", rust: "Rust", go: "Go",
  devops: "DevOps", docker: "DevOps", kubernetes: "DevOps",
  aws: "Cloud", cloud: "Cloud", azure: "Cloud",
  webdev: "Writing", beginners: "Writing", discuss: "Writing",
  productivity: "Writing", career: "Writing", general: "Writing",
  tutorial: "Tutorial", howto: "Tutorial",
};

function kickerFromTags(tagList) {
  if (!tagList?.length) return "Writing";
  for (const tag of tagList) {
    const mapped = TAG_TO_KICKER[tag.toLowerCase()];
    if (mapped) return mapped;
  }
  const first = tagList[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function cleanDevtoMarkdown(md) {
  return md
    // {% link URL %} → bare URL
    .replace(/\{%\s*link\s+(https?:\/\/\S+)\s*%\}/g, "$1")
    // {% embed URL %} → bare URL
    .replace(/\{%\s*embed\s+(https?:\/\/\S+)\s*%\}/g, "$1")
    // {% youtube ID %} → YouTube URL
    .replace(/\{%\s*youtube\s+(\S+)\s*%\}/g, "https://www.youtube.com/watch?v=$1")
    // {% gist USER/ID %} or {% gist ID %} → gist URL
    .replace(/\{%\s*gist\s+(\S+)\s*%\}/g, "https://gist.github.com/$1")
    // {% twitter ID %} → strip (no good markdown equivalent)
    .replace(/\{%\s*twitter\s+\S+\s*%\}/g, "")
    // any remaining liquid tags → strip
    .replace(/\{%[^%]*%\}/g, "")
    .trim();
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g,  "&")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'");
}

function buildFrontmatter(article, isDraft) {
  const date = isoToLogDate(isDraft ? article.created_at : article.published_at)
    ?? isoToLogDate(article.created_at)
    ?? new Date().toISOString().slice(0, 10).replace(/-/g, ".");

  const kicker = kickerFromTags(article.tag_list);
  const tags   = article.tag_list ?? [];

  const lines = [
    "---",
    `title: ${JSON.stringify(article.title)}`,
    `date: ${JSON.stringify(date)}`,
    `kicker: ${JSON.stringify(kicker)}`,
  ];

  if (tags.length)            lines.push(`tags: [${tags.map(t => JSON.stringify(t)).join(", ")}]`);
  if (article.cover_image)    lines.push(`image: ${JSON.stringify(article.cover_image)}`);
  if (article.description)    lines.push(`hook: ${JSON.stringify(decodeHtmlEntities(article.description))}`);
  if (!isDraft && article.url) lines.push(`devto: ${JSON.stringify(article.url)}`);
  lines.push("---");
  return lines.join("\n");
}

// ── API ───────────────────────────────────────────────────────────────────────

async function devtoGet(endpoint) {
  const res = await fetch(`https://dev.to/api/${endpoint}`, {
    headers: {
      "api-key": API_KEY,
      "accept": "application/vnd.forem.api-v1+json",
      "user-agent": "pawper-dev-push/1.0",
    },
  });
  if (!res.ok) throw new Error(`Dev.to ${endpoint} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchArticleBody(id) {
  try {
    const data = await devtoGet(`articles/${id}`);
    return data.body_markdown ?? "";
  } catch (e) {
    if (e.message.includes("404")) return null; // some drafts aren't individually fetchable
    throw e;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("📡  Fetching articles from Dev.to…");

  const [published, drafts] = await Promise.all([
    devtoGet("articles/me/published?per_page=1000"),
    devtoGet("articles/me/unpublished?per_page=1000"),
  ]);

  console.log(`   ${published.length} published, ${drafts.length} unpublished`);

  const all = [
    ...published.map(a => ({ ...a, _isDraft: false })),
    ...drafts.map(a =>   ({ ...a, _isDraft: true  })),
  ];

  if (!all.length) {
    console.log("   Nothing to import.");
    return;
  }

  let written = 0, skipped = 0;

  for (const article of all) {
    const slug     = article.slug ?? `devto-${article.id}`;
    const filename = `${slug}.md`;
    const dir      = article._isDraft ? DRAFTS_DIR : LOGS_DIR;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const outPath  = path.join(dir, filename);

    if (fs.existsSync(outPath)) {
      console.log(`   ⏭  ${filename} — already exists, skipping`);
      skipped++;
      continue;
    }

    const label = article._isDraft ? ` (draft)` : "";
    console.log(`   ⬇  ${filename}${label}`);

    const rawBody = await fetchArticleBody(article.id) ?? article.body_markdown ?? "";
    if (!rawBody && !article.description) {
      console.log(`   ⚠  ${filename} — no body content accessible, skipping`);
      skipped++;
      continue;
    }
    const cleaned = cleanDevtoMarkdown(rawBody || `*${article.description ?? ""}*`);
    const fm      = buildFrontmatter(article, article._isDraft);

    fs.writeFileSync(outPath, `${fm}\n\n${cleaned}\n`, "utf8");
    written++;

    await new Promise(r => setTimeout(r, 350)); // ~3 req/sec
  }

  console.log(`\n✅  Done — ${written} imported, ${skipped} skipped.`);
  if (written) console.log(`   Remove "hidden: true" from any draft file when it's ready to publish.`);
}

main().catch(e => { console.error(e); process.exit(1); });
