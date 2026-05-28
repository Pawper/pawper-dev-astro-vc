"use strict";
/**
 * Fetches approved endorsements from Airtable → writes src/data/endorsements.json.
 * Photos are re-uploaded to Cloudinary for permanent URLs (Airtable attachment
 * URLs are short-lived signed URLs that expire between builds).
 *
 * Required Airtable table: "Endorsements"
 * Fields:
 *   Name        (single line text)
 *   Role        (single line text)
 *   Org         (single line text, optional)
 *   Quote       (long text)
 *   Photo       (attachment — one image)
 *   Skills      (long text — comma-separated list)
 *   Service     (single select: Employment | Contracting | Consulting | Coaching | Speaking | Mentoring)
 *   Approved    (checkbox — admin approval gate)
 *   Featured    (checkbox — sorted first within service panel)
 *   Hide from Panels  (checkbox — check to hide from services panels without un-approving)
 *   Pull Quote  (AI field — auto-generated highlight sentence for long quotes; blank for short ones)
 *   Experience  (link to Calendar record — optional; ties the endorsement to a specific event)
 *
 * Env vars:
 *   AIRTABLE_API_KEY  – personal access token from airtable.com → Account → Developer hub (starts with "pat…")
 *                      Note: Airtable no longer issues legacy API keys. PATs are the only option.
 *                      The Airtable JS SDK still accepts it via the `apiKey` constructor field.
 *   AIRTABLE_BASE_ID  – base ID from the Airtable URL (starts with "app…")
 *   CLOUDINARY_URL    – (optional, but strongly recommended) Cloudinary URL for permanent photo hosting
 */

const path = require("path");
const fs   = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const AIRTABLE_KEY     = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const OUT_PATH         = path.join(__dirname, "../src/data/endorsements.json");

if (!AIRTABLE_KEY || !AIRTABLE_BASE_ID) {
  console.log("⚠  AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set — skipping endorsements fetch.");
  if (!fs.existsSync(OUT_PATH)) fs.writeFileSync(OUT_PATH, "[]");
  process.exit(0);
}

// ── Cloudinary (optional — photos fall back to null if unavailable) ──────────

const CLOUDINARY_ENABLED =
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME &&
   process.env.CLOUDINARY_KEY &&
   process.env.CLOUDINARY_SECRET);

let cloudinary;

if (CLOUDINARY_ENABLED) {
  cloudinary = require("cloudinary").v2;
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }
}

async function uploadPhoto(url, recordId) {
  if (!cloudinary || !url) return null;
  const publicId = `pawper.dev/endorsements/${recordId}`;
  try {
    const result = await cloudinary.uploader.upload(url, {
      public_id:  publicId,
      overwrite:  true,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (err) {
    console.warn(`  ⚠ Photo upload failed for ${recordId}: ${err.message}`);
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const Airtable = require("airtable");
  const base = new Airtable({ apiKey: AIRTABLE_KEY }).base(AIRTABLE_BASE_ID);

  const records = await base("Endorsements")
    .select({ filterByFormula: "{Approved} = TRUE()" })
    .all();

  console.log(`Fetched ${records.length} approved endorsement(s) from Airtable.`);

  // Build a map of Calendar record id → Title so we can resolve the linked
  // Experience to a name. Matching endorsements to experiences by name lets a
  // single endorsement attach to every event sharing that title (e.g. recurring
  // ClawCamp sessions), instead of being pinned to one specific record id.
  const calendarRecords = await base("Calendar").select({ fields: ["Title"] }).all();
  const calendarTitleById = new Map(
    calendarRecords.map((r) => [r.id, String(r.fields.Title || "")])
  );

  const endorsements = await Promise.all(
    records.map(async (r) => {
      const f = r.fields;
      const photoAttachment = Array.isArray(f.Photo) ? f.Photo[0] : null;
      const photo = await uploadPhoto(photoAttachment?.url, r.id);

      const experienceRecordId = Array.isArray(f.Experience)
        ? (f.Experience[0] ? String(f.Experience[0]) : undefined)
        : (f.Experience ? String(f.Experience) : undefined);
      const experienceName = experienceRecordId
        ? (calendarTitleById.get(experienceRecordId) || undefined)
        : undefined;

      return {
        id:       r.id,
        slug:     String(f["Slug (auto-generated)"]?.value || ""),
        service:  String(f.Service || "").toLowerCase(),
        name:     String(f.Name  || ""),
        role:     String(f.Role  || ""),
        org:      String(f.Org   || "") || undefined,
        quote:    String(f.Quote || ""),
        photo:    photo ?? null,
        skills:   Array.isArray(f["Skills List"])
                    ? f["Skills List"].filter(Boolean)
                    : f["Skills List"]
                      ? String(f["Skills List"]).split(",").map((s) => s.trim()).filter(Boolean)
                      : [],
        featured:  Boolean(f.Featured),
        panels:    !Boolean(f["Hide from Panels"]),
        pullQuote: String(f["Pull Quote"]?.value ?? f["Pull Quote"] ?? "") || undefined,
        experienceName,
      };
    })
  );

  fs.writeFileSync(OUT_PATH, JSON.stringify(endorsements, null, 2));
  console.log(`✓ Wrote ${endorsements.length} endorsement(s) to src/data/endorsements.json`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("generateEndorsements failed:", err);
    process.exit(1);
  });
