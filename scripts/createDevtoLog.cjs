"use strict";
/**
 * Creates a NEW article on dev.to from a local log file.
 * Writes the returned URL back into the file's frontmatter as devto: "..."
 * and moves the file from logs-drafts/ to logs/ unless --no-move is passed.
 *
 * Env vars:
 *   DEVTO_API_KEY  — from dev.to/settings/extensions
 *
 * Usage:
 *   node scripts/createDevtoLog.cjs <path-or-filename> [--draft] [--no-move]
 *
 * Examples:
 *   node scripts/createDevtoLog.cjs installing-wsl-windows-subsystem-linux.md
 *   node scripts/createDevtoLog.cjs installing-wsl-windows-subsystem-linux.md --draft
 *
 * Flags:
 *   --draft    Create as unpublished draft on dev.to (default: published)
 *   --no-move  Don't move from logs-drafts/ to logs/ after creation
 */

const path  = require("path");
const fs    = require("fs");
const https = require("node:https");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API_KEY   = process.env.DEVTO_API_KEY;
const LOGS_DIR  = path.join(__dirname, "../src/content/logs");
const DRAFTS_DIR = path.join(__dirname, "../src/content/logs-drafts");

if (!API_KEY) {
  console.error("❌  DEVTO_API_KEY not set in .env — aborting.");
  process.exit(1);
}

const args    = process.argv.slice(2);
const target  = args.find(a => !a.startsWith("--"));
const isDraft = args.includes("--draft");
const noMove  = args.includes("--no-move");

if (!target) {
  console.error("Usage: node scripts/createDevtoLog.cjs <path-or-filename> [--draft] [--no-move]");
  process.exit(1);
}

// Resolve path — check drafts first, then logs, then as given
let filePath;
if (path.isAbsolute(target)) {
  filePath = target;
} else if (fs.existsSync(target)) {
  filePath = path.resolve(target);
} else {
  const inDrafts = path.join(DRAFTS_DIR, path.basename(target));
  const inLogs   = path.join(LOGS_DIR,   path.basename(target));
  if      (fs.existsSync(inDrafts)) filePath = inDrafts;
  else if (fs.existsSync(inLogs))   filePath = inLogs;
  else { console.error(`❌  File not found: ${target}`); process.exit(1); }
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

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("No YAML frontmatter found.");
  const yaml = match[1];
  const body = match[2].trim();

  const getString = key => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"([^"]*)"`, "m"));
    return m ? m[1] : null;
  };

  const tagsMatch = yaml.match(/^tags:\s*\[([^\]]*)\]/m);
  const tags = tagsMatch
    ? tagsMatch[1].split(",").map(t => t.trim().replace(/^"|"$/g, "").toLowerCase())
    : [];

  const seriesMatch = yaml.match(/^series:\s*\n\s+name:\s*"([^"]*)"/m);
  const series = seriesMatch ? seriesMatch[1] : null;

  return { title: getString("title"), devto: getString("devto"), tags, series, body };
}

function injectDevtoUrl(raw, url) {
  // Replace existing devto: line if present, otherwise insert after title:
  if (/^devto:/m.test(raw)) return raw.replace(/^devto:.*$/m, `devto: "${url}"`);
  return raw.replace(/(^title:\s*"[^"]*")/m, `$1\ndevto: "${url}"`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { title, devto, tags, series, body } = parseFrontmatter(raw);

  if (devto) {
    console.error(`❌  Already has a devto: URL → ${devto}`);
    console.error("    Use pushDevtoLog.cjs to update an existing article.");
    process.exit(1);
  }
  if (!title) {
    console.error("❌  No title: found in frontmatter.");
    process.exit(1);
  }

  console.log(`📄  ${title}`);
  console.log(`🏷️   Tags: ${tags.slice(0, 4).join(", ") || "(none)"}${tags.length > 4 ? "  (truncated to 4 for dev.to)" : ""}`);
  if (series) console.log(`📚  Series: ${series}`);
  console.log(`📡  Mode: ${isDraft ? "draft" : "published"}`);
  console.log("");

  const article = { title, body_markdown: body, published: !isDraft, tags: tags.slice(0, 4) };
  if (series) article.series = series;
  const payload = JSON.stringify({ article });

  console.log("📤  Creating article on dev.to...");
  const result = await httpsRequest({
    hostname: "dev.to",
    path: "/api/articles",
    method: "POST",
    headers: {
      "api-key": API_KEY,
      "accept": "application/vnd.forem.api-v1+json",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      "user-agent": "pawper-dev-push/1.0",
    },
  }, payload);

  if (result.status !== 201) {
    console.error(`❌  Creation failed (HTTP ${result.status}):`);
    console.error(JSON.stringify(result.body, null, 2));
    process.exit(1);
  }

  const articleUrl = result.body.url;
  console.log(`✅  Created: ${articleUrl}`);

  // Write devto: URL back into frontmatter
  fs.writeFileSync(filePath, injectDevtoUrl(raw, articleUrl), "utf-8");
  console.log(`✏️   Wrote devto: "${articleUrl}" to frontmatter`);

  // Move from logs-drafts/ to logs/ if the file lives in drafts
  const isInDrafts = path.resolve(filePath).startsWith(path.resolve(DRAFTS_DIR));
  if (isInDrafts && !noMove) {
    const dest = path.join(LOGS_DIR, path.basename(filePath));
    fs.renameSync(filePath, dest);
    console.log(`📁  Moved → logs/${path.basename(filePath)}`);
  }
}

main().catch(err => {
  console.error("❌  Unexpected error:", err.message);
  process.exit(1);
});
