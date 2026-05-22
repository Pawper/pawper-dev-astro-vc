/**
 * generateProjects.cjs
 * Faithful port of the legacy GetPortfolioData.cjs + generateHtml.cjs pipeline.
 * Fetches repos tagged "portfolio-project" via Octokit, enriches with languages,
 * topics, README HTML, and Cloudinary screenshots, then writes src/data/projects.json.
 *
 * Env vars (same names as legacy site):
 *   GITHUB                – GitHub personal access token
 *   CLOUDINARY_CLOUD_NAME – Cloudinary cloud name  (optional; skips screenshots if absent)
 *   CLOUDINARY_KEY        – Cloudinary API key
 *   CLOUDINARY_SECRET     – Cloudinary API secret
 */

"use strict";

require("dotenv").config();

const path = require("path");
const fs = require("fs");
const { Readable } = require("stream");
const { Octokit } = require("@octokit/rest");

const OUTPUT_PATH = path.join(__dirname, "../src/data/projects.json");

if (!process.env.GITHUB) {
  console.warn("[generateProjects] No GITHUB env var set — skipping fetch, keeping existing projects.json.");
  process.exit(0);
}

const octokit = new Octokit({ auth: process.env.GITHUB });

// ── Cloudinary helpers ──────────────────────────────────────────────────────

const CLOUDINARY_ENABLED =
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME &&
   process.env.CLOUDINARY_KEY &&
   process.env.CLOUDINARY_SECRET);

let cloudinary;
if (CLOUDINARY_ENABLED) {
  cloudinary = require("cloudinary").v2;
  if (process.env.CLOUDINARY_URL) {
    // SDK auto-configures from CLOUDINARY_URL — just ensure secure uploads
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }
}

async function getOldImages() {
  if (!CLOUDINARY_ENABLED) return [];
  return new Promise((resolve, reject) => {
    cloudinary.search
      .expression("folder:pawper.dev")
      .execute()
      .then((result) => resolve(result.resources.map(({ public_id }) => public_id)))
      .catch(reject);
  });
}

async function deleteImages(ids) {
  if (!CLOUDINARY_ENABLED || !ids.length) return;
  return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(ids, (err, result) => (err ? reject(err) : resolve(result)));
  });
}

async function uploadStream(buffer) {
  return new Promise((resolve, reject) => {
    const writeStream = cloudinary.uploader.upload_stream(
      { folder: "pawper.dev", width: 500 },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    const readStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });
    readStream.pipe(writeStream);
  });
}

const LOCAL_IMAGES_DIR = path.join(__dirname, "../public/images");

const PUPPETEER_ARGS = ["--no-sandbox", "--disable-setuid-sandbox"];

async function getProjectImage(url, siteName) {
  if (!url) return "";

  const localPath = path.join(LOCAL_IMAGES_DIR, `${siteName}.webp`);
  const localUrl = `/images/${siteName}.webp`;

  if (CLOUDINARY_ENABLED) {
    let browser;
    try {
      const puppeteer = require("puppeteer");
      browser = await puppeteer.launch({ args: PUPPETEER_ARGS });
      const page = await browser.newPage();
      await page.setViewport({ width: 1620, height: 969 });
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 3500));
      const buffer = await page.screenshot({ type: "webp" });
      const { secure_url } = await uploadStream(buffer);
      console.log(`[generateProjects] Screenshot uploaded for ${siteName}: ${secure_url}`);
      return secure_url;
    } catch (e) {
      console.warn(`[generateProjects] Cloudinary screenshot failed for ${siteName}:`, e.message);
      return "";
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  // Local fallback — save to public/images/ for Astro to serve
  let browser;
  try {
    if (!fs.existsSync(LOCAL_IMAGES_DIR)) fs.mkdirSync(LOCAL_IMAGES_DIR, { recursive: true });
    const puppeteer = require("puppeteer");
    browser = await puppeteer.launch({ args: PUPPETEER_ARGS });
    const page = await browser.newPage();
    await page.setViewport({ width: 1620, height: 969 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 3500));
    await page.screenshot({ type: "webp", path: localPath });
    console.log(`[generateProjects] Screenshot saved locally for ${siteName}`);
    return localUrl;
  } catch (e) {
    console.warn(`[generateProjects] Local screenshot failed for ${siteName}:`, e.message);
    if (fs.existsSync(localPath)) {
      console.log(`[generateProjects] Using existing image for ${siteName}`);
      return localUrl;
    }
    return "";
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// ── Title helper ────────────────────────────────────────────────────────────

function toTitle(name) {
  return name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Frontmatter parsers ─────────────────────────────────────────────────────

function parseFrontmatterCategories(markdown) {
  const block = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return [];
  const fm = block[1];

  // categories: [featured, ai-assisted]
  const inline = fm.match(/^categories:\s*\[([^\]]*)\]/m);
  if (inline) {
    return inline[1].split(",").map((s) => s.trim().replace(/['"]/g, "")).filter(Boolean);
  }

  // categories:\n  - featured\n  - ai-assisted
  const list = fm.match(/^categories:\s*\n((?:[ \t]+-[ \t]+\S.*\n?)*)/m);
  if (list) {
    return (list[1].match(/- +(\S+)/g) || []).map((s) => s.replace(/^-\s+/, "").trim());
  }

  return [];
}

// stack: "Astro" (simple string value)
function parseFrontmatterStack(markdown) {
  const block = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return undefined;
  const m = block[1].match(/^stack:\s*["']?([^"'\n]+)["']?\s*$/m);
  return m ? m[1].trim() : undefined;
}

// ── File extension → language map ───────────────────────────────────────────

const EXT_TO_LANG = {
  ".ts": "TypeScript", ".tsx": "TypeScript",
  ".js": "JavaScript", ".jsx": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript",
  ".css": "CSS",
  ".scss": "SCSS", ".sass": "SCSS",
  ".html": "HTML", ".htm": "HTML",
  ".py": "Python",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".rb": "Ruby",
  ".php": "PHP",
  ".c": "C", ".h": "C",
  ".cpp": "C++", ".cc": "C++", ".cxx": "C++", ".hpp": "C++",
  ".cs": "C#",
  ".astro": "Astro",
  ".svelte": "Svelte",
  ".vue": "Vue",
  ".ejs": "EJS",
  ".sh": "Shell",
  ".sql": "SQL",
};

async function fetchCommitDates(owner, repo) {
  const allCommitDates = [];
  const commitsByLanguage = {};
  let page = 1;

  while (true) {
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      author: owner,
      per_page: 100,
      page,
    });

    if (!commits.length) break;

    for (const commit of commits) {
      const date = commit.commit.author.date.slice(0, 10);
      allCommitDates.push(date);

      try {
        const { data: detail } = await octokit.rest.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });
        const langsInCommit = new Set();
        for (const file of detail.files ?? []) {
          const ext = path.extname(file.filename).toLowerCase();
          const lang = EXT_TO_LANG[ext];
          if (lang) langsInCommit.add(lang);
        }
        for (const lang of langsInCommit) {
          if (!commitsByLanguage[lang]) commitsByLanguage[lang] = [];
          commitsByLanguage[lang].push(date);
        }
      } catch {
        // skip if individual commit detail fetch fails
      }
    }

    if (commits.length < 100) break;
    page++;
  }

  return { allCommitDates, commitsByLanguage };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("[generateProjects] Fetching portfolio projects from GitHub...");

  const results = await octokit.rest.search.repos({
    q: "user:pawper+topic:portfolio-project",
    per_page: 100,
  });

  let projects = results.data.items.map((repo) => ({
    id: slugify(repo.description || repo.name),
    name: repo.name,
    title: toTitle(repo.name),
    description: repo.description ?? "",
    githubURL: repo.html_url,
    webURL: repo.homepage ?? "",
    topics: repo.topics ?? [],
    languages: {},
    image: "",
    year: new Date(repo.pushed_at).getFullYear().toString(),
    pushedAt: repo.pushed_at,
    allCommitDates: [],
    commitsByLanguage: {},
    status: repo.archived ? "archived" : repo.homepage ? "live" : "ongoing",
    categories: [],
    stack: undefined,
  }));

  console.log(`[generateProjects] Found ${projects.length} repos. Fetching details...`);

  // Fetch github-colors once
  const { data: colorsRaw } = await octokit.rest.repos.getContent({
    mediaType: { format: "raw" },
    owner: "ozh",
    repo: "github-colors",
    path: "colors.json",
  });
  const languageColors = JSON.parse(colorsRaw);

  // Fetch old Cloudinary image IDs before we start uploading
  const oldImageIds = await getOldImages();

  // Process all projects in parallel (mirrors legacy Promise.all)
  await Promise.all(
    projects.map(async (project, index) => {
      // Languages + percentages
      const langResponse = await octokit.rest.repos.listLanguages({
        owner: "Pawper",
        repo: project.name,
      });
      const sumLines = Object.values(langResponse.data).reduce((a, b) => a + b, 0);
      const languages = {};
      for (const [lang, lines] of Object.entries(langResponse.data)) {
        languages[lang] = {
          percent: ((lines / sumLines) * 100).toFixed(2),
          color: languageColors[lang]?.color ?? "#888",
        };
      }
      project.languages = languages;

      // Topics (authoritative list, filtered)
      const topicsResponse = await octokit.rest.repos.getAllTopics({
        owner: "Pawper",
        repo: project.name,
      });
      project.topics = topicsResponse.data.names.filter((t) => t !== "portfolio-project");

      // README — raw for frontmatter, then render stripped markdown for display
      let readmeRaw = null;
      try {
        const { data: raw } = await octokit.rest.repos.getReadme({
          mediaType: { format: "raw" },
          owner: "pawper",
          repo: project.name,
        });
        readmeRaw = raw;
        project.categories = parseFrontmatterCategories(readmeRaw);
        project.stack = parseFrontmatterStack(readmeRaw);
      } catch {
        project.categories = [];
        project.stack = undefined;
      }
      try {
        if (readmeRaw) {
          const stripped = readmeRaw.replace(/^---[\s\S]*?---\r?\n?/, "");
          const { data: readmeHtml } = await octokit.rest.markdown.render({
            text: stripped,
            mode: "gfm",
            context: `Pawper/${project.name}`,
          });
          project.readme = readmeHtml;
        }
      } catch {
        project.readme = undefined;
      }

      // Screenshot via Cloudinary (if configured) or local fallback
      project.image = await getProjectImage(project.webURL, project.name);

      // Commit history — per-language dates for heatmap
      console.log(`[generateProjects] Fetching commit history for ${project.name}...`);
      const { allCommitDates, commitsByLanguage } = await fetchCommitDates("Pawper", project.name);
      project.allCommitDates = allCommitDates;
      project.commitsByLanguage = commitsByLanguage;
      console.log(`[generateProjects] ${project.name}: ${allCommitDates.length} commits indexed`);

      projects[index] = project;
    })
  );

  // Clean up old Cloudinary images (same as legacy)
  await deleteImages(oldImageIds);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(projects, null, 2));
  console.log(`[generateProjects] Wrote ${projects.length} projects to ${OUTPUT_PATH}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[generateProjects] Fatal error:", err);
    process.exit(1);
  });
