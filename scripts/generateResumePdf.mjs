import puppeteer from "puppeteer";
import { readFileSync, copyFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const htmlPath    = resolve("dist/resume/index.html");
const pdfOut      = resolve("dist/resume.pdf");
const pdfPub      = resolve("public/resume.pdf");
const previewDist = resolve("dist/resume-preview.png");
const previewPub  = resolve("public/resume-preview.png");
const assetsOut   = resolve("src/data/resume-assets.json");

const html = readFileSync(htmlPath, "utf-8");

const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
const page    = await browser.newPage();

await page.setViewport({ width: 820, height: 1100, deviceScaleFactor: 2 });
await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
await page.setContent(html, { waitUntil: "networkidle2" });

// PDF — @page CSS controls margins/size
await page.pdf({
  path: pdfOut,
  format: "Letter",
  preferCSSPageSize: true,
  printBackground: false,
});
copyFileSync(pdfOut, pdfPub);
console.log("✓ Resume PDF generated: dist/resume.pdf + public/resume.pdf");

// Preview screenshot — white card only, transparent background so it floats on the panel
await page.setViewport({ width: 820, height: 1060, deviceScaleFactor: 2 });
await page.evaluate(() => {
  document.documentElement.style.background = "transparent";
  document.body.style.background = "transparent";
  document.body.style.padding = "0";
});
const pageEl = await page.$(".page");
const box    = await pageEl.boundingBox();
await page.screenshot({
  path: previewDist,
  omitBackground: true,
  clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 1060) },
});

mkdirSync(resolve("public"), { recursive: true });
copyFileSync(previewDist, previewPub);
console.log("✓ Resume preview generated: public/resume-preview.png");

await browser.close();

// Upload to Cloudinary if configured
const hasCloudinary = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME;

if (hasCloudinary) {
  const cloudinary = require("cloudinary").v2;
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
      secure:     true,
    });
  }

  const [pdfResult, previewResult] = await Promise.all([
    cloudinary.uploader.upload(pdfOut, {
      public_id:     "pawper.dev/resume",
      resource_type: "raw",
      overwrite:     true,
    }),
    cloudinary.uploader.upload(previewDist, {
      public_id:     "pawper.dev/resume-preview",
      resource_type: "image",
      overwrite:     true,
    }),
  ]);

  console.log("✓ Uploaded PDF to Cloudinary:", pdfResult.secure_url);
  console.log("✓ Uploaded preview to Cloudinary:", previewResult.secure_url);

  writeFileSync(assetsOut, JSON.stringify({
    pdfUrl:     pdfResult.secure_url,
    previewUrl: previewResult.secure_url,
  }, null, 2));
  console.log("✓ Wrote src/data/resume-assets.json");
} else {
  // Fallback for local dev without Cloudinary — use public/ paths
  writeFileSync(assetsOut, JSON.stringify({
    pdfUrl:     "/resume.pdf",
    previewUrl: "/resume-preview.png",
  }, null, 2));
  console.log("⚠ No Cloudinary config — resume-assets.json uses local paths");
}
