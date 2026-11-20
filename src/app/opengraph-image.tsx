import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#a71c6f",
        color: "white",
        padding: "72px",
      }}
    >
      <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1 }}>
        Puebla <span style={{ color: "#f4b6d8", margin: "0 18px" }}>x</span> Puebla
      </div>
      <div style={{ marginTop: 28, fontSize: 28 }}>Clúster de Startups e Innovación</div>
    </div>,
    { ...size },
  );
}
