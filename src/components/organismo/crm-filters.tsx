const estados = [
  { value: "", label: "Todas" },
  { value: "pendiente", label: "Pendiente" },
  { value: "contactado", label: "Contactado" },
  { value: "confirmado", label: "Confirmado" },
];

export function CrmFilters({ estado }: { estado?: string }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Estado">
      {estados.map((item) => {
        const active = (estado ?? "") === item.value;
        const href = item.value ? `?vista=tabla&estado=${item.value}` : "?vista=tabla";
        return (
          <a
            key={item.label}
            href={href}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "rounded-full bg-brand px-3 py-1 text-small font-semibold text-on-brand"
                : "rounded-full border border-line px-3 py-1 text-small font-semibold text-ink"
            }
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
