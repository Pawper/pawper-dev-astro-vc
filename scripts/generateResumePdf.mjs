import puppeteer from "puppeteer";
import { readFileSync, copyFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const htmlPath    = resolve("dist/resume/index.html");
const pdfOut      = resolve("dist/resume.pdf");
const pdfPub      = resolve("public/resume.pdf");
const previewDist = resolve("dist/resume-preview.png");
const previewPub  = resolve("public/resume-preview.png");

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

// Also write to public/ so the dev server can serve it
mkdirSync(resolve("public"), { recursive: true });
copyFileSync(previewDist, previewPub);
console.log("✓ Resume preview generated: public/resume-preview.png");

await browser.close();
