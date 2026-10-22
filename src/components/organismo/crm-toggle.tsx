const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "contactado", label: "Contactado" },
  { value: "confirmado", label: "Confirmado" },
] as const;

export function CrmToggle({
  vista,
  estado,
}: {
  vista: "tabla" | "tarjetas";
  estado?: string;
}) {
  const vistas = [
    { value: "tabla" as const, label: "Tabla" },
    { value: "tarjetas" as const, label: "Tarjetas" },
  ];
  return (
    <div className="flex flex-wrap gap-4">
      <nav className="flex flex-wrap gap-2" aria-label="Vista">
        {vistas.map((item) => (
          <a
            key={item.value}
            href={`?vista=${item.value}`}
            className="text-small font-semibold text-link"
            aria-current={vista === item.value ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <nav className="flex flex-wrap gap-2" aria-label="Estado">
        <a
          href={`?vista=${vista}`}
          className="text-small font-semibold text-link"
          aria-current={!estado ? "page" : undefined}
        >
          Todas
        </a>
        {ESTADOS.map((item) => (
          <a
            key={item.value}
            href={`?vista=${vista}&estado=${item.value}`}
            className="text-small font-semibold text-link"
            aria-current={estado === item.value ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
