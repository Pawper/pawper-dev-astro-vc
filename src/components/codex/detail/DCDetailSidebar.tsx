import Tap from "../../shared/Tap";
import CXPill from "../CXPill";
import { SKILLS } from "../../../data/content";

interface SidebarTagGroupsProps {
  tags: string[];
  onOpen?: (tag: string) => void;
  accentColor?: string;
}

export function SidebarTagGroups({ tags, onOpen, accentColor = "var(--section-deep)" }: SidebarTagGroupsProps) {
  if (!tags.length) return null;

  const lower = tags.map(t => t.toLowerCase());
  const categorised = SKILLS
    .map(g => ({ label: g.label, matches: g.items.filter(s => lower.includes(s.toLowerCase())) }))
    .filter(g => g.matches.length > 0);
  const claimed = new Set(categorised.flatMap(g => g.matches.map(s => s.toLowerCase())));
  const unclaimed = tags.filter(t => !claimed.has(t.toLowerCase()));
  const sections = [...categorised, ...(unclaimed.length ? [{ label: "Other", matches: unclaimed }] : [])];

  if (!sections.length) return null;

  return (
    <div className="pw-glass-dim" style={{ padding: 16, borderRadius: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      {sections.map(({ label, matches }) => (
        <div key={label}>
          <div className="pw-eyebrow" style={{ color: accentColor, marginBottom: 6 }}>{label}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {matches.map((t) => (
              <CXPill
                key={t}
                variant="secondary" active
                onClick={onOpen ? () => onOpen(t) : undefined}
                style={onOpen ? undefined : { cursor: "default" }}
              >
                {t}
              </CXPill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface SidebarTOCProps {
  headings: Array<{ text: string; anchorId: string }>;
  label: string;
  accentColor?: string;
}

export function SidebarTOC({ headings, label, accentColor = "var(--section-deep)" }: SidebarTOCProps) {
  if (!headings.length) return null;

  return (
    <div className="pw-glass-dim cx-sidebar-toc" style={{ padding: 16, borderRadius: 14, display: "flex", flexDirection: "column", gap: 4 }}>
      <div className="pw-eyebrow" style={{ color: accentColor, marginBottom: 6 }}>{label}</div>
      {headings.map(({ text, anchorId }, i) => (
        <Tap
          key={i}
          className="cx-toc-item"
          onClick={() => {
            let el = document.getElementById(anchorId);
            if (!el) {
              const prose = document.querySelector(".pw-prose");
              if (prose) {
                for (const h of prose.querySelectorAll("h2, h3")) {
                  if (h.textContent?.trim() === text) { el = h as HTMLElement; break; }
                }
              }
            }
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          style={{ fontSize: 13, color: "var(--ink-soft)", padding: "5px 8px", display: "flex", gap: 8, alignItems: "baseline" }}
        >
          <span className="pw-mono" style={{ color: "var(--ink-mute)", fontSize: 11, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
          <span>{text}</span>
        </Tap>
      ))}
    </div>
  );
}
