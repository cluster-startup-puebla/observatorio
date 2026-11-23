import Link from "next/link";
import { crmHref } from "@/lib/organismo/crm-query";

export function CrmToggle({
  vista,
  estado,
  sesion,
}: {
  vista: "tabla" | "tarjetas";
  estado?: string;
  sesion?: string;
}) {
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
            href={crmHref({
              vista: item.value,
              estado: item.value === "tabla" ? estado : undefined,
              sesion,
            })}
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
