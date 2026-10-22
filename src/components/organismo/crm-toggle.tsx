import Link from "next/link";

export function CrmToggle({ vista, estado }: { vista: "tabla" | "tarjetas"; estado?: string }) {
  const vistas = [
    { value: "tabla" as const, label: "Tabla" },
    { value: "tarjetas" as const, label: "Tarjetas" },
  ];
  return (
    <nav className="flex rounded-full border border-line bg-surface-subtle p-1" aria-label="Vista">
      {vistas.map((item) => {
        const active = vista === item.value;
        return (
          <Link
            key={item.value}
            href={
              item.value === "tabla" && estado
                ? `?vista=tabla&estado=${estado}`
                : `?vista=${item.value}`
            }
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-full bg-brand px-4 py-1.5 text-small font-semibold text-on-brand"
                : "rounded-full px-4 py-1.5 text-small font-semibold text-ink"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
