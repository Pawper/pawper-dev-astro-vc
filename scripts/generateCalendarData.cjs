"use strict";
/**
 * Fetches published calendar events from Airtable → writes src/data/calendar.json.
 *
 * Required Airtable table: "Calendar"
 * Fields:
 *   Title      (single line text — the record name field)
 *   Date       (date)
 *   EndDate    (date, optional)
 *   Type       (single select: available | busy | milestone | event)
 *   Note       (long text, optional)
 *   Published  (checkbox — visibility gate)
 *
 * Env vars:
 *   AIRTABLE_API_KEY  – personal access token from airtable.com → Account → Developer hub
 *   AIRTABLE_BASE_ID  – base ID from the Airtable URL (app5WObcR6LNZ9bQv)
 */

const path = require("path");
const fs   = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const AIRTABLE_KEY     = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const OUT_PATH         = path.join(__dirname, "../src/data/calendar.json");

if (!AIRTABLE_KEY || !AIRTABLE_BASE_ID) {
  console.log("⚠  AIRTABLE_API_KEY or AIRTABLE_BASE_ID not set — skipping calendar fetch.");
  if (!fs.existsSync(OUT_PATH)) fs.writeFileSync(OUT_PATH, "[]");
  process.exit(0);
}

async function main() {
  const Airtable = require("airtable");
  const base = new Airtable({ apiKey: AIRTABLE_KEY }).base(AIRTABLE_BASE_ID);

  const records = await base("Calendar")
    .select({ filterByFormula: "{Published} = TRUE()", sort: [{ field: "Date", direction: "asc" }] })
    .all();

  console.log(`Fetched ${records.length} published calendar event(s) from Airtable.`);

  const events = records.map((r) => {
    const f = r.fields;
    const toDateStr = (v) => v ? String(v).slice(0, 10) : undefined;
    const toTimeStr = (v) => {
      if (!v) return undefined;
      const d = new Date(String(v));
      if (isNaN(d.getTime())) return undefined;
      const h = d.getHours(), m = d.getMinutes();
      if (h === 0 && m === 0) return undefined; // local midnight = no time set
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
    };
    return {
      id:      r.id,
      title:   String(f.Title   || ""),
      date:    toDateStr(f.Date) ?? "",
      endDate: toDateStr(f.EndDate),
      time:    toTimeStr(f.Date),
      type:     String(f.Type     || "event").toLowerCase(),
      note:        f.Note        ? String(f.Note).trim()        : undefined,
      location:    f.Location    ? String(f.Location).trim()    : undefined,
      registerUrl: f.Register ? String(f.Register).trim() : undefined,
      parentId:    Array.isArray(f.Parent) && f.Parent.length > 0 ? String(f.Parent[0]) : undefined,
    };
  });

  fs.writeFileSync(OUT_PATH, JSON.stringify(events, null, 2));
  console.log(`✓ Wrote ${events.length} event(s) to src/data/calendar.json`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("generateCalendarData failed:", err);
    process.exit(1);
  });
