#!/usr/bin/env node
/**
 * Maps local series slugs → dev.to numeric collection IDs.
 *
 * Strategy:
 *   1. Parse local log frontmatter to find logs that are in a series AND have a devto URL.
 *   2. Fetch all published articles from the dev.to API (includes slug + collection_id).
 *   3. Match: local devto URL slug → API article slug → collection_id.
 *   4. Output: { [seriesSlug]: collectionId } → src/data/devto-series.json
 *
 * Env vars: DEVTO_USERNAME (default: "pawper"), DEVTO_API_KEY (optional)
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const username = process.env.DEVTO_USERNAME ?? "pawper";
const LOGS_DIR = path.join(__dirname, "../src/content/logs");
const OUT_FILE = path.join(__dirname, "../src/data/devto-series.json");

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const get = (key) => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"([^"]*)"`, "m"));
    return m ? m[1] : null;
  };
  const seriesName = yaml.match(/^series:\s*\n\s+name:\s*"([^"]*)"/m)?.[1] ?? null;
  return {
    devto: get("devto"),
    series: seriesName,
  };
}

async function fetchAllArticles() {
  const headers = { "User-Agent": "pawper.dev-build/1.0" };
  if (process.env.DEVTO_API_KEY) headers["api-key"] = process.env.DEVTO_API_KEY;

  const articles = [];
  let page = 1;
  while (true) {
    const url = `https://dev.to/api/articles?username=${username}&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`dev.to API error ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    if (!batch.length) break;
    articles.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return articles;
}

async function main() {
  // Step 1: build map of devto-article-slug → local series slug
  const devtoSlugToSeriesSlug = new Map();
  const files = readdirSync(LOGS_DIR).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const { devto, series } = parseFrontmatter(readFileSync(path.join(LOGS_DIR, file), "utf-8"));
    if (!devto || !series) continue;
    // e.g. "https://dev.to/pawper/installing-terminal-wsl-windows-subsystem-for-linux-1e0k"
    const articleSlug = devto.split("/").pop();
    devtoSlugToSeriesSlug.set(articleSlug, slugify(series));
  }

  if (!devtoSlugToSeriesSlug.size) {
    console.log("ℹ️   No local logs with both series + devto URL — nothing to map.");
    writeFileSync(OUT_FILE, JSON.stringify({}, null, 2));
    return;
  }

  // Step 2: fetch articles from dev.to API
  console.log(`📡  Fetching articles for @${username} from dev.to...`);
  const articles = await fetchAllArticles();
  console.log(`    Found ${articles.length} article(s).`);

  // Step 3: cross-reference slug → collection_id
  const seriesMap = {};
  for (const article of articles) {
    if (!article.collection_id) continue;
    const seriesSlug = devtoSlugToSeriesSlug.get(article.slug);
    if (seriesSlug && !seriesMap[seriesSlug]) {
      seriesMap[seriesSlug] = article.collection_id;
      console.log(`    ${seriesSlug} → collection_id ${article.collection_id}`);
    }
  }

  writeFileSync(OUT_FILE, JSON.stringify(seriesMap, null, 2));
  console.log(`\n📄  Wrote devto-series.json (${Object.keys(seriesMap).length} series)`);
}

main().catch((err) => {
  console.error("❌  generateDevtoData failed:", err.message);
  writeFileSync(OUT_FILE, JSON.stringify({}));
  console.warn("    Wrote empty devto-series.json — series dev.to links will be hidden.");
});
