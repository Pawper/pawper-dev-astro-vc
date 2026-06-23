import { soundHover, soundClick } from "../../../context/SoundContext";
import resumeAssets from "../../../data/resume-assets.json";

export default function DCResume() {
  return (
    <div className="pw-glass-dim cx-resume-card" style={{
      padding: "28px 28px 112px",  borderRadius: 14,
      position: "relative",
      overflow: "visible",
      paddingRight: 406,  // 350px image + 28px gap + 28px card padding
      maxWidth: 975,
      marginInline: "auto",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div className="pw-eyebrow" style={{ color: "var(--section-deep)" }}>Resume</div>
          <h2 style={{ fontSize: 26, fontWeight: 500, margin: "6px 0 0", letterSpacing: -0.5 }}>
            Single-page PDF, ATS-friendly.
          </h2>
        </div>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, margin: 0, maxWidth: "46ch" }}>
          Web producer and CMS operations specialist — twelve years across structured content,
          publishing workflows, QA, and documentation, with platform-architecture and API-integration depth behind it.
        </p>
      </div>

      {/* Resume preview — absolutely positioned so it doesn't affect card height */}
      <a href="/resume" target="_blank" rel="noopener noreferrer"
        className="cx-resume-preview"
        onClick={soundClick} onMouseEnter={soundHover}
        style={{
        position: "absolute", top: 20, right: 28,
        width: 350, display: "block", textDecoration: "none",
        boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
        WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 85%)",
        maskImage: "linear-gradient(to bottom, black 50%, transparent 85%)",
      }}>
        <img
          src={resumeAssets.previewUrl}
          alt="Resume preview"
          style={{ width: "100%", display: "block" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </a>
    </div>
  );
}
