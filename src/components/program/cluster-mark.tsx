export function ClusterMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 720 300" role="img" aria-label="Clúster de Startups e Innovación" className={`text-ink ${className ?? ""}`}>
      <text x="0" y="78" fill="currentColor" fontFamily="Roboto, sans-serif" fontSize="72" fontWeight="400">
        Clúster de
      </text>
      <text x="0" y="176" fill="#a81870" fontFamily="Roboto, sans-serif" fontSize="96" fontWeight="700">
        STARTUPS
      </text>
      <text x="0" y="268" fontFamily="Roboto, sans-serif" fontSize="72">
        <tspan fill="currentColor" fontWeight="400">
          e{" "}
        </tspan>
        <tspan fill="#a81870" fontWeight="500">
          INNOVACIÓN
        </tspan>
      </text>
    </svg>
  );
}
