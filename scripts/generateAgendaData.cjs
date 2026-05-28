"use strict";
/**
 * Fetches published calendar events from Airtable → writes src/data/agenda.json.
 * Events are shaped as Experience objects so they integrate with the full experience system.
 *
 * If a record has a LumaUrl field, the script tries to enrich it via the Luma API.
 * Events on your own Luma calendar are enriched automatically; third-party events
 * (where the API key has no access) fall back gracefully to whatever is in Airtable.
 * Airtable fields always override Luma — set any field in Airtable to force a value.
 *
 * Required Airtable table: "Calendar"
 * Fields:
 *   Title        (single line text — the record name field)
 *   Date         (datetime)
 *   EndDate      (date, optional)
 *   Category     (single select: speaking | mentoring | consulting | coaching | attending | education)
 *   Note         (long text, optional — maps to description; overrides Luma description)
 *   Location     (single line text, optional — overrides Luma location)
 *   Register     (URL, optional — maps to registerUrl; overrides Luma URL)
 *   Skills       (long text, comma-separated, optional)
 *   Parent       (link to another record in same table, optional)
 *   Published    (checkbox — visibility gate)
 *   LumaUrl      (URL, optional — enriches from Luma API when accessible)
 *   Organization  (single line text, optional — overrides Luma host name)
 *   Location Name (single line text, optional — display label shown in cards; Location field still used for Google Maps)
 *
 * Env vars:
 *   AIRTABLE_API_KEY  – personal access token
 *   AIRTABLE_BASE_ID  – base ID from the Airtable URL
 *   LUMA_API_KEY      – Luma calendar API key (Settings → Developer); optional
 */

const path = require("path");
const fs   = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const AIRTABLE_KEY     = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const LUMA_API_KEY     = process.env.LUMA_API_KEY;
const OUT_PATH         = path.join(__dirname, "../src/data/agenda.json");

// Map Airtable category values → ExperienceCategory. Defaults to "attending".
const CATEGORY_MAP = {
  speaking:    "speaking",
  mentoring:   "mentoring",
  workshop:    "mentoring",
  bootcamp:    "mentoring",
  consulting:  "consulting",
  coaching:    "coaching",
  education:   "education",
  employment:  "employment",
  contracting: "contracting",
  attending:    "attending",
  volunteering: "volunteering",
  available:    "consulting",
};

// ── Luma helpers ─────────────────────────────────────────────────────────────

function extractLumaSlug(url) {
  const m = String(url).match(/lu\.ma\/(?:event\/)?([^/?#]+)/i);
  return m ? m[1] : null;
}

async function fetchLumaEvent(slug) {
  if (!LUMA_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.lu.ma/public/v1/event/get?event_id=${encodeURIComponent(slug)}`,
      { headers: { "x-luma-api-key": LUMA_API_KEY, accept: "application/json" } }
    );
    if (!res.ok) return null; // 403 = not your calendar, 404 = not found
    const data = await res.json();
    return data.event ?? data ?? null;
  } catch {
    return null;
  }
}

// Convert a UTC ISO string to YYYY-MM-DD in the event's local timezone.
function lumaDateStr(utcIso, timezone) {
  if (!utcIso) return undefined;
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date(utcIso));
  } catch {
    return String(utcIso).slice(0, 10);
  }
}

// Convert a UTC ISO string to a time label ("5 PM", "10:30 AM") in the event's timezone.
function lumaTimeStr(utcIso, timezone) {
  if (!utcIso) return undefined;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(new Date(utcIso));
    const h  = parts.find(p => p.type === "hour")?.value;
    const m  = parts.find(p => p.type === "minute")?.value;
    const ap = parts.find(p => p.type === "dayPeriod")?.value?.toUpperCase();
    if (!h || !ap) return undefined;
    if (m === "00") return `${h} ${ap}`;
    return `${h}:${m} ${ap}`;
  } catch {
    return undefined;
  }
}

// Strip basic markdown to plain text for descriptions pulled from Luma.
function stripMd(text) {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Airtable date helpers ─────────────────────────────────────────────────────
// Airtable returns datetime fields as UTC ISO strings. Format them in Pacific
// time so builds on Netlify (UTC) match builds on a Pacific dev machine.
const AIRTABLE_TIMEZONE = "America/Los_Angeles";

const toDateStr = (v) => {
  if (!v) return undefined;
  const s = String(v);
  // Airtable date-only fields ("YYYY-MM-DD") have no timezone — pass through.
  if (!s.includes("T")) return s.slice(0, 10);
  const d = new Date(s);
  if (isNaN(d.getTime())) return undefined;
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: AIRTABLE_TIMEZONE }).format(d);
  } catch {
    return s.slice(0, 10);
  }
};

const toTimeStr = (v) => {
  if (!v) return undefined;
  const s = String(v);
  if (!s.includes("T")) return undefined; // date-only = no time
  const d = new Date(s);
  if (isNaN(d.getTime())) return undefined;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: AIRTABLE_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(d);
    const h  = parts.find(p => p.type === "hour")?.value;
    const m  = parts.find(p => p.type === "minute")?.value;
    const ap = parts.find(p => p.type === "dayPeriod")?.value?.toUpperCase();
    if (!h || !ap) return undefined;
    if (h === "12" && m === "00" && ap === "AM") return undefined; // PT midnight = no time set
    if (m === "00") return `${h} ${ap}`;
    return `${h}:${m} ${ap}`;
  } catch {
    return undefined;
  }
};

// ── Main ──────────────────────────────────────────────────────────────────────

if (!AIRTABLE_KEY || !AIRTABLE_BASE_ID) {
  console.log("⚠  AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set — skipping agenda fetch.");
  if (!fs.existsSync(OUT_PATH)) fs.writeFileSync(OUT_PATH, "[]");
  process.exit(0);
}

async function main() {
  const Airtable = require("airtable");
  const base = new Airtable({ apiKey: AIRTABLE_KEY }).base(AIRTABLE_BASE_ID);

  const records = await base("Calendar")
    .select({ filterByFormula: "{Published} = TRUE()", sort: [{ field: "Date", direction: "asc" }] })
    .all();

  console.log(`Fetched ${records.length} published event(s) from Airtable.`);

  const events = await Promise.all(records.map(async (r) => {
    const f = r.fields;

    // ── Luma enrichment ───────────────────────────────────────────────────────
    let luma = null;
    if (f.LumaUrl) {
      const slug = extractLumaSlug(String(f.LumaUrl));
      if (slug) {
        luma = await fetchLumaEvent(slug);
        if (luma) console.log(`  ✓ Luma enriched:  ${luma.name}`);
        else      console.log(`  · Luma fallback:   ${f.Title || slug} (no API access — using Airtable fields)`);
      }
    }

    const tz = luma?.timezone ?? "UTC";

    // ── Field resolution — Airtable wins, Luma fills gaps ────────────────────
    const rawCategory = String(f.Category || f.Type || "").toLowerCase().trim();
    const category    = CATEGORY_MAP[rawCategory] ?? "attending";

    const skills = f.Skills
      ? String(f.Skills).split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const title       = String(f.Title || luma?.name || "");
    const description = f.Note
      ? String(f.Note).trim()
      : stripMd(luma?.description_md ?? luma?.description ?? "");
    const organization = f.Organization
      ? String(f.Organization).trim()
      : (luma?.hosts?.[0]?.name ?? "");

    // Dates: Airtable Date/EndDate win; fall back to Luma start_at/end_at
    const datetimeStart = f.Date
      ? (toDateStr(f.Date) ?? "")
      : (lumaDateStr(luma?.start_at, tz) ?? "");
    const datetimeEnd = f.EndDate
      ? toDateStr(f.EndDate)
      : lumaDateStr(luma?.end_at, tz);

    // Time: use timezone-aware Luma helper when sourcing from Luma
    const time = f.Date
      ? toTimeStr(f.Date)
      : lumaTimeStr(luma?.start_at, tz);

    const location = f.Location
      ? String(f.Location).trim()
      : (luma?.geo_address_info?.full_address ?? luma?.geo_address_info?.address ?? undefined);

    const locationName = f["Location Name"]
      ? String(f["Location Name"]).trim()
      : undefined;

    // Register URL: explicit Airtable field wins; Luma URL itself is the fallback
    const registerUrl = f.Register
      ? String(f.Register).trim()
      : (luma ? String(f.LumaUrl).trim() : undefined);

    return {
      id:           r.id,
      title,
      organization,
      period:       "", // auto-derived from datetimeStart/datetimeEnd when empty
      category,
      description,
      featured:     false,
      skills:       skills || undefined,
      datetimeStart,
      datetimeEnd,
      time,
      location,
      locationName,
      registerUrl,
      parentId: Array.isArray(f.Parent) && f.Parent.length > 0 ? String(f.Parent[0]) : undefined,
    };
  }));

  fs.writeFileSync(OUT_PATH, JSON.stringify(events, null, 2));
  console.log(`✓ Wrote ${events.length} event(s) to src/data/agenda.json`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("generateAgendaData failed:", err);
    process.exit(1);
  });
