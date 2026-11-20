export function ClusterMark({ className, light = false }: { className?: string; light?: boolean }) {
  const accent = light ? "currentColor" : "#a81870";
  const tone = light ? "text-white" : "text-ink";
  return (
    <svg viewBox="0 0 720 300" role="img" aria-label="Clúster de Startups e Innovación" className={`${tone} ${className ?? ""}`}>
      <text x="0" y="78" fill="currentColor" fontFamily="Archivo, sans-serif" fontSize="72" fontWeight="400">
        Clúster de
      </text>
      <text x="0" y="176" fill={accent} fontFamily="Archivo, sans-serif" fontSize="96" fontWeight="700">
        STARTUPS
      </text>
      <text x="0" y="268" fontFamily="Archivo, sans-serif" fontSize="72">
        <tspan fill="currentColor" fontWeight="400">
          e{" "}
        </tspan>
        <tspan fill={accent} fontWeight="500">
          INNOVACIÓN
        </tspan>
      </text>
    </svg>
  );
}
