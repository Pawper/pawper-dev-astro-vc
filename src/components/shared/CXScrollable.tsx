import React, { type ReactNode } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

interface CXScrollableProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  onScroll?: (scrollTop: number) => void;
  onInitialized?: (scrollEl: HTMLElement) => void;
}

export default function CXScrollable({ children, className, style, contentStyle, onScroll, onInitialized }: CXScrollableProps) {
  return (
    <OverlayScrollbarsComponent
      className={`pw-scrollable${className ? ` ${className}` : ""}`}
      style={style}
      options={{ scrollbars: { autoHide: "never" }, overflow: { x: "hidden" } }}
      events={{
        initialized: onInitialized
          ? (instance) => onInitialized(instance.elements().scrollOffsetElement)
          : undefined,
        scroll: onScroll
          ? (instance) => onScroll(instance.elements().scrollOffsetElement.scrollTop)
          : undefined,
      }}
    >
      {contentStyle ? <div style={contentStyle}>{children}</div> : children}
    </OverlayScrollbarsComponent>
  );
}
