import type { CSSProperties } from "react";

export function OrgBrandSheet({ style }: { style?: CSSProperties }) {
  if (!style) return null;
  const body = Object.entries(style)
    .flatMap(([key, value]) => (typeof value === "string" ? [`${key}:${value}`] : []))
    .join(";");
  if (!body) return null;
  return <style>{`[data-mobile="true"][data-sidebar="sidebar"]{${body}}`}</style>;
}
