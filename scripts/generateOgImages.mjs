#!/usr/bin/env node
/**
 * Generates OG share images for every log entry and uploads to Cloudinary.
 *
 * - Logs WITH a hero image:  derive a 1200×630 Cloudinary transformation URL (no upload needed)
 * - Logs WITHOUT a hero image: render a branded card via Puppeteer, upload to Cloudinary
 *
 * Writes: src/data/og-images.json  — { [slug]: url }
 *
 * Env vars (same pattern as other scripts):
 *   CLOUDINARY_URL   or   CLOUDINARY_CLOUD_NAME + CLOUDINARY_KEY + CLOUDINARY_SECRET
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure:     true,
  });
} else {
  console.error("❌  Cloudinary not configured — set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME in env");
  process.exit(1);
}

const LOGS_DIR = path.join(__dirname, "../src/content/logs");
const OUT_FILE = path.join(__dirname, "../src/data/og-images.json");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const get = (key) => {
    const m = yaml.match(new RegExp(`^${key}:\\s*"([^"]*)"`, "m"));
    return m ? m[1] : null;
  };
  return { title: get("title"), kicker: get("kicker"), image: get("image") };
}

function heroOgUrl(cloudinaryUrl) {
  return cloudinaryUrl.replace("/upload/", "/upload/w_1200,h_630,c_fill,g_auto,q_auto,f_auto/");
}

function cardHtml(title, kicker) {
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const fontSize = title.length > 60 ? "44px" : title.length > 40 ? "52px" : "60px";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #0e0e12;
    font-family: 'Courier New', Courier, monospace;
    display: flex; align-items: center; justify-content: center;
  }
  .card {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; justify-content: center;
    padding: 72px 100px;
    background: linear-gradient(135deg, #0e0e12 0%, #141420 60%, #0e0e12 100%);
    position: relative;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0;
    width: 8px; height: 100%; background: #4ecca3;
  }
  .card::after {
    content: ''; position: absolute; top: 0; right: 0;
    width: 100%; height: 100%;
    background: radial-gradient(ellipse at 90% 10%, rgba(78,204,163,0.07) 0%, transparent 60%);
    pointer-events: none;
  }
  .kicker {
    font-size: 20px; letter-spacing: 0.18em; text-transform: uppercase;
    color: #4ecca3; margin-bottom: 28px; font-weight: 700;
  }
  .title {
    font-size: ${fontSize}; line-height: 1.12; font-weight: 700;
    color: #f0f0f0; margin-bottom: 44px;
    max-width: 920px;
  }
  .brand {
    font-size: 19px; letter-spacing: 0.12em; text-transform: uppercase;
    color: #4a4a5a;
  }
  .brand .accent { color: #4ecca3; }
</style>
</head>
<body>
<div class="card">
  <div class="kicker">${esc(kicker || "Log")}</div>
  <div class="title">${esc(title)}</div>
  <div class="brand"><span class="accent">pawper</span>.dev &middot; codex</div>
</div>
</body>
</html>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const files = readdirSync(LOGS_DIR).filter((f) => f.endsWith(".md"));

  const existing = (() => {
    try { return JSON.parse(readFileSync(OUT_FILE, "utf-8")); }
    catch { return {}; }
  })();

  const needsScreenshot = files.some((f) => {
    const { image } = parseFrontmatter(readFileSync(path.join(LOGS_DIR, f), "utf-8"));
    return !image;
  });

  let browser = null;
  if (needsScreenshot) {
    console.log("🚀  Launching Puppeteer...");
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }

  const ogImages = { ...existing };

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(path.join(LOGS_DIR, file), "utf-8");
    const { title, kicker, image } = parseFrontmatter(raw);

    if (!title) {
      console.warn(`⚠️   ${file}: no title — skipping`);
      continue;
    }

    if (image) {
      ogImages[slug] = heroOgUrl(image);
      console.log(`🖼️   ${slug}: using hero image`);
      continue;
    }

    console.log(`🎨  ${slug}: generating card...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(cardHtml(title, kicker), { waitUntil: "networkidle0" });
    const buf = await page.screenshot({ type: "png" });
    await page.close();

    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${buf.toString("base64")}`,
      {
        public_id: `pawper.dev/og/${slug}`,
        resource_type: "image",
        overwrite: true,
        access_mode: "public",
      }
    );
    ogImages[slug] = result.secure_url;
    console.log(`✅  ${slug}: uploaded → ${result.secure_url}`);
  }

  if (browser) await browser.close();

  writeFileSync(OUT_FILE, JSON.stringify(ogImages, null, 2));
  console.log(`\n📄  Wrote og-images.json (${Object.keys(ogImages).length} entries)`);
}

main().catch((err) => {
  console.error("❌  Unexpected error:", err.message);
  process.exit(1);
});
