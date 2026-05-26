/**
 * Reads the last git commit date for every log file and writes
 * src/data/log-updated-dates.json  →  { "log-id": "2026.05.26", ... }
 *
 * Only entries where updated !== posted date are included.
 * Run as part of the build chain before astro build.
 */

import { execSync } from "child_process";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, basename, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR  = join(__dirname, "../src/content/logs");
const OUT_FILE  = join(__dirname, "../src/data/log-updated-dates.json");

function getLastCommitDate(filePath) {
  try {
    const result = execSync(`git log --format="%ad" --date=short -1 -- "${filePath}"`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    // Convert YYYY-MM-DD → YYYY.MM.DD to match frontmatter format
    return result ? result.replace(/-/g, ".") : null;
  } catch {
    return null;
  }
}

function getPostedDate(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const m = content.match(/^date:\s*"([^"]+)"/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

const files = readdirSync(LOGS_DIR).filter(f => f.endsWith(".md"));
const result = {};

for (const file of files) {
  const id = basename(file, ".md");
  const filePath = join(LOGS_DIR, file);
  const posted  = getPostedDate(filePath);
  const updated = getLastCommitDate(filePath);
  if (updated && posted && updated !== posted) {
    result[id] = updated;
  }
}

writeFileSync(OUT_FILE, JSON.stringify(result, null, 2) + "\n");
console.log(`[generateLogDates] wrote ${Object.keys(result).length} updated entries → log-updated-dates.json`);
