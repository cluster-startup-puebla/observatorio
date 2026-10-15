import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function createOgImage(title: string, description: string) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#16284f",
        color: "#f5f6f8",
      }}
    >
      <div style={{ width: 16, height: "100%", background: "#e8186a" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 28, color: "#ff4d93" }}>Levantamiento de necesidades</div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 30, lineHeight: 1.35, color: "#b8c0ce", maxWidth: 860 }}>
          {description}
        </div>
      </div>
    </div>,
    ogSize,
  );
}
