#!/usr/bin/env node
/**
 * Generates OG share images for log entries, series, and experiences — uploads to Cloudinary.
 *
 * Logs WITH a hero image  → Cloudinary transformation URL (no upload)
 * Logs WITHOUT a hero     → Puppeteer branded card, uploaded as pawper.dev/og/[slug]
 * Series                  → Puppeteer series card, uploaded as pawper.dev/og/series/[slug]
 * Experiences             → Puppeteer experience card, uploaded as pawper.dev/og/xp/[id]
 *
 * Skips entries that already have a cached URL in og-images.json.
 *
 * Writes: src/data/og-images.json  — { [slug]: url, "series/[slug]": url, "xp/[id]": url }
 *
 * Env vars: CLOUDINARY_URL  or  CLOUDINARY_CLOUD_NAME + CLOUDINARY_KEY + CLOUDINARY_SECRET
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const hasCloudinary =
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_KEY && process.env.CLOUDINARY_SECRET);

if (!hasCloudinary) {
  console.warn("⚠️   Cloudinary not configured — skipping OG image generation (set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_KEY + CLOUDINARY_SECRET)");
  process.exit(0);
}

if (process.env.CLOUDINARY_URL) {
  const m = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!m) { console.error("❌  Invalid CLOUDINARY_URL format"); process.exit(1); }
  cloudinary.config({ api_key: m[1], api_secret: m[2], cloud_name: m[3], secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure:     true,
  });
}

const LOGS_DIR          = path.join(__dirname, "../src/content/logs");
const OUT_FILE          = path.join(__dirname, "../src/data/og-images.json");
const EXPERIENCES_FILE  = path.join(__dirname, "../src/data/experiences.json");
const AGENDA_FILE       = path.join(__dirname, "../src/data/agenda.json");

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SERVICE_CATS = new Set(["employment", "contracting", "consulting", "coaching", "speaking", "mentoring"]);

function isPast(iso) {
  if (!iso) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return date < today;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const get = (key) => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"([^"]*)"`, "m"));
    return m ? m[1] : null;
  };
  const seriesName = yaml.match(/^series:\s*\n\s+name:\s*"([^"]*)"/m)?.[1] ?? null;
  const seriesPart = yaml.match(/^\s+part:\s*(\d+)/m)?.[1] ?? null;
  return {
    title: get("title"),
    kicker: get("kicker"),
    image: get("image"),
    series: seriesName ? { name: seriesName, part: parseInt(seriesPart ?? "1") } : null,
  };
}

function heroOgUrl(cloudinaryUrl) {
  return cloudinaryUrl.replace("/upload/", "/upload/w_1200,h_630,c_fill,g_auto,q_auto,f_auto/");
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function logCardHtml(title, kicker) {
  const fontSize = title.length > 60 ? "44px" : title.length > 40 ? "52px" : "60px";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #0e0e12;
    font-family: 'Courier New', Courier, monospace; display: flex; align-items: center; justify-content: center; }
  .card { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center;
    padding: 72px 100px; background: linear-gradient(135deg, #0e0e12 0%, #141420 60%, #0e0e12 100%); position: relative; }
  .card::before { content: ''; position: absolute; top: 0; left: 0; width: 8px; height: 100%; background: #4ecca3; }
  .card::after { content: ''; position: absolute; top: 0; right: 0; width: 100%; height: 100%;
    background: radial-gradient(ellipse at 90% 10%, rgba(78,204,163,0.07) 0%, transparent 60%); pointer-events: none; }
  .kicker { font-size: 20px; letter-spacing: 0.18em; text-transform: uppercase; color: #4ecca3; margin-bottom: 28px; font-weight: 700; }
  .title { font-size: ${fontSize}; line-height: 1.12; font-weight: 700; color: #f0f0f0; margin-bottom: 44px; max-width: 920px; }
  .brand { font-size: 19px; letter-spacing: 0.12em; text-transform: uppercase; color: #4a4a5a; }
  .brand .accent { color: #4ecca3; }
</style></head><body><div class="card">
  <div class="kicker">${esc(kicker || "Log")}</div>
  <div class="title">${esc(title)}</div>
  <div class="brand"><span class="accent">pawper</span>.dev &middot; codex</div>
</div></body></html>`;
}

function seriesCardHtml(name, kicker, parts) {
  const fontSize = name.length > 60 ? "44px" : name.length > 40 ? "50px" : "58px";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #0e0e12;
    font-family: 'Courier New', Courier, monospace; display: flex; align-items: center; justify-content: center; }
  .card { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center;
    padding: 72px 100px; background: linear-gradient(135deg, #0e0e12 0%, #141420 60%, #0e0e12 100%); position: relative; }
  .card::before { content: ''; position: absolute; top: 0; left: 0; width: 8px; height: 100%; background: #4ecca3; }
  .card::after { content: ''; position: absolute; top: 0; right: 0; width: 100%; height: 100%;
    background: radial-gradient(ellipse at 90% 10%, rgba(78,204,163,0.07) 0%, transparent 60%); pointer-events: none; }
  .series-label { font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase; color: #4ecca3;
    margin-bottom: 10px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
  .series-label::before { content: ''; display: inline-block; width: 22px; height: 2px; background: #4ecca3; }
  .kicker { font-size: 18px; letter-spacing: 0.14em; text-transform: uppercase; color: #3a8a6a; margin-bottom: 24px; }
  .title { font-size: ${fontSize}; line-height: 1.1; font-weight: 700; color: #f0f0f0; margin-bottom: 28px; max-width: 920px; }
  .parts { font-size: 16px; letter-spacing: 0.1em; text-transform: uppercase; color: #4a4a5a; margin-bottom: 32px; }
  .brand { font-size: 19px; letter-spacing: 0.12em; text-transform: uppercase; color: #4a4a5a; }
  .brand .accent { color: #4ecca3; }
</style></head><body><div class="card">
  <div class="series-label">Series</div>
  <div class="kicker">${esc(kicker || "Tutorial")}</div>
  <div class="title">${esc(name)}</div>
  <div class="parts">${parts}-part series</div>
  <div class="brand"><span class="accent">pawper</span>.dev &middot; codex</div>
</div></body></html>`;
}

/**
 * Experience OG card.
 * accent: purple for service categories, orange for upcoming agenda, red for past/default.
 */
function experienceCardHtml(title, organization, category, datetimeStart, datetimeEnd) {
  const isService = SERVICE_CATS.has(category);
  const isAgenda  = !!datetimeStart;
  const past      = isAgenda && isPast(datetimeEnd ?? datetimeStart);
  const accent = isService ? "#9055e8"
    : (isAgenda && !past) ? "#f55a28"
    : "#e84455";
  const accentRgb = isService ? "144, 85, 232"
    : (isAgenda && !past) ? "245, 90, 40"
    : "232, 68, 85";

  const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
  let eyebrow = catLabel;
  if (isAgenda && datetimeStart) {
    const [y, m, d] = datetimeStart.split("-").map(Number);
    const dateStr = new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    eyebrow = `${catLabel} · ${dateStr}`;
  }

  const titleSize = title.length > 60 ? "40px" : title.length > 40 ? "50px" : "58px";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #0e0e12;
    font-family: 'Courier New', Courier, monospace; display: flex; align-items: center; justify-content: center; }
  .card { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center;
    padding: 72px 100px; background: linear-gradient(135deg, #0e0e12 0%, #141420 60%, #0e0e12 100%); position: relative; }
  .card::before { content: ''; position: absolute; top: 0; left: 0; width: 8px; height: 100%; background: ${accent}; }
  .card::after { content: ''; position: absolute; top: 0; right: 0; width: 100%; height: 100%;
    background: radial-gradient(ellipse at 90% 10%, rgba(${accentRgb}, 0.09) 0%, transparent 60%); pointer-events: none; }
  .eyebrow { font-size: 18px; letter-spacing: 0.18em; text-transform: uppercase; color: ${accent}; margin-bottom: 24px; font-weight: 700; }
  .title { font-size: ${titleSize}; line-height: 1.12; font-weight: 700; color: #f0f0f0; margin-bottom: 22px; max-width: 920px; }
  .org { font-size: 22px; color: #5a5a6a; margin-bottom: 40px; letter-spacing: 0.02em; }
  .brand { font-size: 19px; letter-spacing: 0.12em; text-transform: uppercase; color: #4a4a5a; }
  .brand .accent { color: #4ecca3; }
</style></head><body><div class="card">
  <div class="eyebrow">${esc(eyebrow)}</div>
  <div class="title">${esc(title)}</div>
  ${organization ? `<div class="org">${esc(organization)}</div>` : ""}
  <div class="brand"><span class="accent">pawper</span>.dev &middot; codex</div>
</div></body></html>`;
}

async function screenshot(browser, html) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  const buf = await page.screenshot({ type: "png" });
  await page.close();
  return buf;
}

async function uploadCard(buf, publicId) {
  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${buf.toString("base64")}`,
    { public_id: publicId, resource_type: "image", overwrite: true, access_mode: "public" }
  );
  return result.secure_url;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const files = readdirSync(LOGS_DIR).filter((f) => f.endsWith(".md"));

  const existing = (() => {
    try { return JSON.parse(readFileSync(OUT_FILE, "utf-8")); }
    catch { return {}; }
  })();

  // Collect series from all log frontmatter
  const seriesMap = new Map(); // slug → { name, parts, kicker }
  for (const file of files) {
    const { kicker, series } = parseFrontmatter(readFileSync(path.join(LOGS_DIR, file), "utf-8"));
    if (!series) continue;
    const slug = slugify(series.name);
    const ex = seriesMap.get(slug);
    seriesMap.set(slug, {
      name: series.name,
      parts: Math.max(ex?.parts ?? 0, series.part),
      kicker: ex?.kicker ?? kicker ?? "Tutorial",
    });
  }

  let browser = null;
  async function ensureBrowser() {
    if (!browser) {
      console.log("🚀  Launching Puppeteer...");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      });
    }
    return browser;
  }

  const ogImages = { ...existing };

  // ── Logs ──
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(path.join(LOGS_DIR, file), "utf-8");
    const { title, kicker, image } = parseFrontmatter(raw);

    if (!title) { console.warn(`⚠️   ${file}: no title — skipping`); continue; }

    if (image) {
      ogImages[slug] = heroOgUrl(image);
      console.log(`🖼️   ${slug}: hero image`);
      continue;
    }

    if (existing[slug]) {
      ogImages[slug] = existing[slug];
      console.log(`⏭️   ${slug}: cached`);
      continue;
    }

    console.log(`🎨  ${slug}: generating card...`);
    const buf = await screenshot(await ensureBrowser(), logCardHtml(title, kicker));
    ogImages[slug] = await uploadCard(buf, `pawper.dev/og/${slug}`);
    console.log(`✅  ${slug}: uploaded → ${ogImages[slug]}`);
  }

  // ── Series ──
  for (const [slug, { name, parts, kicker }] of seriesMap) {
    const key = `series/${slug}`;

    if (existing[key]) {
      ogImages[key] = existing[key];
      console.log(`⏭️   series/${slug}: cached`);
      continue;
    }

    console.log(`🎨  series/${slug}: generating card...`);
    const buf = await screenshot(await ensureBrowser(), seriesCardHtml(name, kicker, parts));
    ogImages[key] = await uploadCard(buf, `pawper.dev/og/series/${slug}`);
    console.log(`✅  series/${slug}: uploaded → ${ogImages[key]}`);
  }

  // ── Experiences (inline + agenda) ──
  const experiencesRaw = JSON.parse(readFileSync(EXPERIENCES_FILE, "utf-8"));
  const agendaRaw      = JSON.parse(readFileSync(AGENDA_FILE, "utf-8"));
  const allExperiences = [
    ...experiencesRaw,
    ...agendaRaw.filter((e) => !experiencesRaw.some((x) => x.id === e.id)),
  ];

  for (const exp of allExperiences) {
    const key = `xp/${exp.id}`;
    if (existing[key]) {
      ogImages[key] = existing[key];
      console.log(`⏭️   ${key}: cached`);
      continue;
    }
    console.log(`🎨  ${key}: generating card...`);
    const html = experienceCardHtml(
      exp.title ?? exp.id,
      exp.organization ?? "",
      exp.category ?? "",
      exp.datetimeStart,
      exp.datetimeEnd,
    );
    const buf = await screenshot(await ensureBrowser(), html);
    ogImages[key] = await uploadCard(buf, `pawper.dev/og/xp/${exp.id}`);
    console.log(`✅  ${key}: uploaded → ${ogImages[key]}`);
  }

  if (browser) await browser.close();

  writeFileSync(OUT_FILE, JSON.stringify(ogImages, null, 2));
  console.log(`\n📄  Wrote og-images.json (${Object.keys(ogImages).length} entries)`);
}

main().catch((err) => {
  console.error("❌  Unexpected error:", err.message);
  process.exit(1);
});
