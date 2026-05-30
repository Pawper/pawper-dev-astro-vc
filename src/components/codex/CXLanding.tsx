import React from "react";
import { PROJECTS, LOGS } from "../../data/content";
import CXQuickLink from "./CXQuickLink";
import CXBtn, { RssIcon } from "./CXBtn";
import CXScrollable from "../shared/CXScrollable";

interface CXLandingProps {
  onCategory: (catId: string) => void;
  onEntry: (catId: string, entryId: string) => void;
}

export default function CXLanding({ onCategory, onEntry }: CXLandingProps) {
  return (
    <div className="pw-page" style={{ position: "relative", height: "100%" }}>
      <CXScrollable
        className="cx-landing-scroll"
        style={{
          position: "absolute", inset: 0,
          "--scroll-mask": "linear-gradient(to bottom, black calc(100% - 160px), transparent calc(100% - 80px))",
        } as React.CSSProperties}
      >
        <div style={{ padding: "30px 40px 160px 40px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
            <div className="pw-eyebrow cx-glass-label" style={{ color: "white" }}>Welcome</div>
            <h2 className="cx-section-title" style={{ fontSize: 26, fontWeight: 500, margin: "6px 0 0", letterSpacing: -0.4 }}>
              Browse the database — pick a category.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            <CXQuickLink
              code="001" title="Personnel" icon="◉" accent="#e35b6d"
              desc="Bio, skills, training, résumé."
              onClick={() => onCategory("personnel")}
            />
            <CXQuickLink
              code="002" title="Services" icon="◈" accent="#9055e8"
              desc="Employment, contracting, consulting, coaching."
              onClick={() => onCategory("services")}
            />
            <CXQuickLink
              code="003" title="Projects" icon="◧" accent="#2b8bff"
              desc="Recent case-files & experiments."
              count={`${PROJECTS.length} files`}
              onClick={() => onCategory("projects")}
            />
            <CXQuickLink
              code="004" title="Logs" icon="✎" flipIcon accent="#3fbf7a"
              desc="Short writings on craft & process."
              count={`${LOGS.length} entries`}
              onClick={() => onCategory("logs")}
            />
            <CXQuickLink
              code="005" title="Contact" icon="↗" accent="#f5c130"
              desc="Open an encrypted channel."
              onClick={() => onCategory("contact")}
            />
            <CXQuickLink
              code="006" title="Agenda" icon="▦" accent="#f55a28"
              desc="Schedule, events & speaking."
              onClick={() => onCategory("calendar")}
            />
          </div>
        </div>
      </CXScrollable>

      <div className="cx-btn-row" style={{ position: "absolute", bottom: 48, right: 7, display: "flex", gap: 8 }}>
        <CXBtn num="01" label="Resume" onClick={() => onEntry("personnel", "resume")} primary icon={null} />
        <CXBtn num="02" label="Contact" onClick={() => onEntry("contact", "all")} icon={null} />
        <CXBtn num="03" label="RSS feed" href="/feed.xml" icon={<RssIcon />} />
      </div>
    </div>
  );
}
