import Link from "next/link";
import { crmHref } from "@/lib/organismo/crm-query";

const estados = [
  { value: "", label: "Todas" },
  { value: "pendiente", label: "Pendiente" },
  { value: "contactado", label: "Contactado" },
  { value: "confirmado", label: "Confirmado" },
];

export function CrmFilters({ estado, sesion }: { estado?: string; sesion?: string }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Estado">
      {estados.map((item) => {
        const active = (estado ?? "") === item.value;
        return (
          <Link
            key={item.label}
            href={crmHref({ vista: "tabla", estado: item.value || undefined, sesion })}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "rounded-full bg-brand px-3 py-1 text-small font-semibold text-on-brand"
                : "rounded-full border border-line px-3 py-1 text-small font-semibold text-ink"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
