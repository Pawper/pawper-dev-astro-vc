"use strict";
/**
 * Pushes a local log file's content back to dev.to.
 * The file must have a devto: field in its frontmatter.
 *
 * Env vars:
 *   DEVTO_API_KEY  — from dev.to/settings/extensions
 *
 * Usage:
 *   node scripts/pushDevtoLog.cjs <path-or-filename>
 *
 * Examples:
 *   node scripts/pushDevtoLog.cjs faq-editors-ides-vs-code-3fp0.md
 *   node scripts/pushDevtoLog.cjs src/content/logs/faq-editors-ides-vs-code-3fp0.md
 */

const path  = require("path");
const fs    = require("fs");
const https = require("node:https");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API_KEY  = process.env.DEVTO_API_KEY;
const LOGS_DIR = path.join(__dirname, "../src/content/logs");

if (!API_KEY) {
  console.error("❌  DEVTO_API_KEY not set in .env — aborting.");
  process.exit(1);
}

const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/pushDevtoLog.cjs <path-or-filename>");
  process.exit(1);
}

// Resolve file path — accept filename only, relative path, or absolute path
let filePath;
if (path.isAbsolute(target)) {
  filePath = target;
} else if (fs.existsSync(target)) {
  filePath = path.resolve(target);
} else {
  filePath = path.join(LOGS_DIR, path.basename(target));
}

if (!fs.existsSync(filePath)) {
  console.error(`❌  File not found: ${filePath}`);
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// Parses the subset of YAML frontmatter our import script generates
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("No YAML frontmatter found in file.");
  const yaml = match[1];
  const body = match[2].trim();

  const getString = key => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"([^"]*)"`, "m"));
    return m ? m[1] : null;
  };

  // Parse inline tag array: tags: ["A", "B"]
  const tagsMatch = yaml.match(/^tags:\s*\[([^\]]*)\]/m);
  const tags = tagsMatch
    ? tagsMatch[1].split(",").map(t => t.trim().replace(/^"|"$/g, "").toLowerCase())
    : [];

  // Parse series block — grab name only (dev.to groups by series name string)
  const seriesMatch = yaml.match(/^series:\s*\n\s+name:\s*"([^"]*)"/m);
  const series = seriesMatch ? seriesMatch[1] : null;

  return { title: getString("title"), devto: getString("devto"), image: getString("image"), tags, series, body };
}

function slugFromUrl(url) {
  return url.split("/").pop();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { title, devto, image, tags, series, body } = parseFrontmatter(raw);

  if (!devto) {
    console.error("❌  No devto: URL in frontmatter — cannot determine which article to update.");
    process.exit(1);
  }

  const slug = slugFromUrl(devto);

  console.log(`📄  ${title}`);
  console.log(`🔗  ${devto}`);
  console.log(`🌐  Canonical: https://pawper.dev/l/${path.basename(filePath, ".md")}`);
  console.log(`🏷️   Tags: ${tags.join(", ") || "(none)"}`);
  if (series) console.log(`📚  Series: ${series}`);
  if (image) console.log(`🖼️   Hero: ${image}`);
  console.log("");

  // Resolve numeric article ID by listing the user's published articles
  console.log("🔍  Looking up article ID...");
  const lookup = await httpsRequest({
    hostname: "dev.to",
    path: `/api/articles/me/published?per_page=1000`,
    method: "GET",
    headers: {
      "api-key": API_KEY,
      "accept": "application/vnd.forem.api-v1+json",
      "user-agent": "pawper-dev-push/1.0",
    },
  });

  if (lookup.status !== 200) {
    console.error(`❌  Could not fetch article list from dev.to (HTTP ${lookup.status})`);
    console.error(JSON.stringify(lookup.body, null, 2));
    process.exit(1);
  }

  const match = lookup.body.find(a => a.slug === slug);
  if (!match) {
    console.error(`❌  No published article found with slug: ${slug}`);
    console.error("    Verify the devto: URL in frontmatter is correct and the article is published.");
    process.exit(1);
  }

  const articleId = match.id;
  console.log(`✅  Found article ID: ${articleId}`);

  // Build payload — strip trailing backslashes (CommonMark hard-break syntax) since dev.to renders newlines natively
  const devtoBody = body.replace(/\\\n/g, "<br>\n");
  const localSlug = path.basename(filePath, ".md");
  const canonicalUrl = `https://pawper.dev/l/${localSlug}`;
  const article = { title, body_markdown: devtoBody, tags, canonical_url: canonicalUrl };
  if (series) article.series = series;
  if (image) article.main_image = image;
  const payload = JSON.stringify({ article });

  // Push update
  console.log("📤  Pushing update to dev.to...");
  const update = await httpsRequest({
    hostname: "dev.to",
    path: `/api/articles/${articleId}`,
    method: "PUT",
    headers: {
      "api-key": API_KEY,
      "accept": "application/vnd.forem.api-v1+json",
      "user-agent": "pawper-dev-push/1.0",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  }, payload);

  if (update.status !== 200) {
    console.error(`❌  Update failed (HTTP ${update.status}):`);
    console.error(JSON.stringify(update.body, null, 2));
    process.exit(1);
  }

  console.log(`✅  Updated: ${update.body.url}`);
}

main().catch(err => {
  console.error("❌  Unexpected error:", err.message);
  process.exit(1);
});
