import React from "react";
import type { ReactNode } from "react";
import Tap from "../shared/Tap";

interface CXCardProps {
  onClick?: () => void;
  accentColor?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  thumbnail?: ReactNode;
  thumbnailWidth?: string;
  badge?: string;
  badgeSub?: string;
  badgeColor?: string;
  badgeSubColor?: string;
  badgeFontSize?: number;
  badgeScale?: number;
  badgeShadow?: string;
  // Content column props — when any are present, CXCard renders the standard content column
  eyebrow?: string;
  eyebrowColor?: string;  // defaults to accentColor
  date?: string;
  headerRight?: ReactNode; // arbitrary node in top-right of header row (overrides date)
  title?: string;
  titleSize?: number;     // defaults to 17
  hook?: ReactNode;
  hookLines?: number;     // defaults to 2; pass a large number to expand
  footer?: ReactNode;     // pinned to bottom via marginTop: auto
  footerEnd?: boolean;    // align footer to bottom-right instead of bottom-left
}

function BadgeBlock({
  badge, badgeSub, badgeColor, badgeSubColor, badgeFontSize, badgeScale, badgeShadow, overlay,
}: {
  badge: string; badgeSub?: string;
  badgeColor: string; badgeSubColor: string;
  badgeFontSize: number; badgeScale: number;
  badgeShadow?: string; overlay: boolean;
}) {
  return (
    <div style={overlay ? {
      position: "absolute", top: 16, left: 16, zIndex: 1,
      display: "flex", flexDirection: "column", alignItems: "flex-start",
    } : {
      display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, minWidth: 36,
    }}>
      <span style={{
        fontFamily: "'Bebas Neue', var(--font-sans)",
        fontSize: badgeFontSize, lineHeight: 1,
        color: badgeColor,
        transform: `scaleY(${badgeScale})`,
        transformOrigin: overlay ? "top left" : "top center",
        textShadow: badgeShadow,
      } as React.CSSProperties}>
        {badge}
      </span>
      {badgeSub && (
        <span className="pw-mono" style={{
          fontSize: 10.5, color: badgeSubColor,
          letterSpacing: "0.02em", lineHeight: 1.2, marginTop: 1, fontWeight: 600,
          ...(overlay ? { textShadow: "0 0 2px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.65)" } : {}),
        }}>
          {badgeSub}
        </span>
      )}
    </div>
  );
}

function ContentColumn({
  eyebrow, eyebrowColor, date, headerRight, title, titleSize, hook, hookLines, footer, badgeMode, footerEnd,
}: {
  eyebrow?: string; eyebrowColor?: string;
  date?: string; headerRight?: ReactNode; title?: string; titleSize?: number;
  hook?: ReactNode; hookLines?: number; footer?: ReactNode;
  badgeMode?: boolean; footerEnd?: boolean;
}) {
  return (
    <div style={{
      padding: badgeMode ? "16px 20px 14px 0" : "16px 20px 14px",
      display: "flex", flexDirection: "column",
      gap: 8, flex: 1, minWidth: 0,
      ...(badgeMode ? { alignSelf: "stretch" } : {}),
    }}>
      {(eyebrow || date || headerRight) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          {eyebrow && (
            <span className="pw-eyebrow" style={{ color: eyebrowColor }}>{eyebrow}</span>
          )}
          {headerRight && <div style={{ marginLeft: "auto", flexShrink: 0 }}>{headerRight}</div>}
          {!headerRight && date && (
            <span className="pw-mono" style={{ fontSize: 10, color: "var(--ink-mute)", marginLeft: "auto" }}>
              {date}
            </span>
          )}
        </div>
      )}
      {title && (
        <div style={{
          fontSize: titleSize ?? 17, fontWeight: 500,
          letterSpacing: -0.3, lineHeight: 1.2,
          textWrap: "balance",
        } as React.CSSProperties}>
          {title}
        </div>
      )}
      {hook && (
        <div style={{
          fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.45,
          display: "-webkit-box", WebkitLineClamp: hookLines ?? 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        } as React.CSSProperties}>
          {hook}
        </div>
      )}
      {footer && (
        <div style={{ marginTop: "auto", ...(footerEnd ? { alignSelf: "flex-end" } : {}) }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export default function CXCard({
  onClick,
  accentColor = "var(--section-accent)",
  children,
  style,
  className,
  thumbnail,
  thumbnailWidth = "42%",
  badge,
  badgeSub,
  badgeColor,
  badgeSubColor,
  badgeFontSize = 42,
  badgeScale = 1.15,
  badgeShadow,
  eyebrow,
  eyebrowColor,
  date,
  headerRight,
  title,
  titleSize,
  hook,
  hookLines,
  footer,
  footerEnd,
}: CXCardProps) {
  const resolvedBadgeColor = badgeColor ?? accentColor;
  const resolvedBadgeSubColor = badgeSubColor ?? resolvedBadgeColor;
  const resolvedEyebrowColor = eyebrowColor ?? accentColor;
  const hasContent = !!(eyebrow || date || headerRight || title || hook || footer);

  let cardStyle: React.CSSProperties;
  let inner: ReactNode;

  if (thumbnail) {
    cardStyle = {
      borderRadius: 16,
      borderLeft: `4px solid ${accentColor}`,
      ...style,
      overflow: "hidden",
      display: "flex",
    };
    inner = (
      <>
        <div className="cx-card-thumb" style={{ width: thumbnailWidth, flexShrink: 0, position: "relative" }}>
          {thumbnail}
          {badge && (
            <BadgeBlock
              badge={badge} badgeSub={badgeSub}
              badgeColor={resolvedBadgeColor} badgeSubColor={resolvedBadgeSubColor}
              badgeFontSize={badgeFontSize} badgeScale={badgeScale}
              badgeShadow={badgeShadow} overlay
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {hasContent ? (
            <ContentColumn
              eyebrow={eyebrow} eyebrowColor={resolvedEyebrowColor}
              date={date} headerRight={headerRight} title={title} titleSize={titleSize}
              hook={hook} hookLines={hookLines} footer={footer} footerEnd={footerEnd}
            />
          ) : children}
        </div>
      </>
    );
  } else if (badge) {
    cardStyle = {
      borderRadius: 16,
      borderLeft: `4px solid ${accentColor}`,
      ...style,
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    };
    inner = (
      <>
        {hasContent ? (
          <div style={{ paddingTop: 16, paddingBottom: 14, paddingLeft: 16 }}>
            <BadgeBlock
              badge={badge} badgeSub={badgeSub}
              badgeColor={resolvedBadgeColor} badgeSubColor={resolvedBadgeSubColor}
              badgeFontSize={badgeFontSize} badgeScale={badgeScale}
              badgeShadow={badgeShadow} overlay={false}
            />
          </div>
        ) : (
          <BadgeBlock
            badge={badge} badgeSub={badgeSub}
            badgeColor={resolvedBadgeColor} badgeSubColor={resolvedBadgeSubColor}
            badgeFontSize={badgeFontSize} badgeScale={badgeScale}
            badgeShadow={badgeShadow} overlay={false}
          />
        )}
        {hasContent ? (
          <ContentColumn
            eyebrow={eyebrow} eyebrowColor={resolvedEyebrowColor}
            date={date} headerRight={headerRight} title={title} titleSize={titleSize}
            hook={hook} hookLines={hookLines} footer={footer} badgeMode footerEnd={footerEnd}
          />
        ) : children}
      </>
    );
  } else {
    cardStyle = {
      borderRadius: 16,
      borderLeft: `4px solid ${accentColor}`,
      ...style,
      ...(hasContent ? { display: "flex", flexDirection: "column" } : {}),
    };
    inner = hasContent ? (
      <ContentColumn
        eyebrow={eyebrow} eyebrowColor={resolvedEyebrowColor}
        date={date} headerRight={headerRight} title={title} titleSize={titleSize}
        hook={hook} hookLines={hookLines} footer={footer} footerEnd={footerEnd}
      />
    ) : children;
  }

  const thumbClass = thumbnail ? " cx-card-has-thumb" : "";
  const extraClass = className ? ` ${className}` : "";

  if (onClick) {
    return (
      <Tap onClick={onClick} className={`pw-glass-dim cx-card${thumbClass}${extraClass}`} style={cardStyle}>
        {inner}
      </Tap>
    );
  }

  return (
    <div className={`pw-glass-dim${thumbClass}${extraClass}`} style={cardStyle}>
      {inner}
    </div>
  );
}
