export function OgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        background: "#a71c6f",
        color: "white",
        padding: "68px 72px",
        fontFamily: "Raleway",
      }}
    >
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div style={{ fontSize: 22, letterSpacing: 2.4, fontWeight: 500 }}>
          LEVANTAMIENTO DE NECESIDADES TECNOLÓGICAS
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 22,
            fontFamily: "Archivo",
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 0.92,
          }}
        >
          <div>Puebla</div>
          <div style={{ display: "flex" }}>
            <span style={{ color: "#f4b6d8", marginRight: 16 }}>x</span>
            Puebla
          </div>
        </div>
        <div style={{ marginTop: 28, maxWidth: 680, fontSize: 28, lineHeight: 1.35 }}>
          Dinos qué le falta a tu empresa en tecnología. Startups y equipos de desarrollo de Puebla construyen la solución, validada contigo.
        </div>
      </div>
      <svg width="340" height="340" viewBox="0 0 100 100">
        <path d="M12 2 L88 98 M88 2 L12 98" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="22" />
      </svg>
    </div>
  );
}
