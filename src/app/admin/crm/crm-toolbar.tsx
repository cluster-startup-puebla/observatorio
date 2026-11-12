import Link from "next/link";
import { CrmChips } from "@/app/admin/crm/crm-chips";
import { crmEstados, crmHref, crmOrigenes, type CrmLink, type CrmVista } from "@/lib/admin/crm/query";
import { crmLabel } from "@/lib/crm-label";

const vistas: { value: CrmVista; label: string }[] = [
  { value: "tabla", label: "Tabla" },
  { value: "tarjetas", label: "Tarjetas" },
];

const origenLabel: Record<string, string> = {
  excel: "Excel",
  manual: "Manual",
  enlace: "Enlace",
};

export function CrmToolbar({
  vista,
  estado,
  origen,
  hrefFor = crmHref,
}: {
  vista: CrmVista;
  estado: string;
  origen: string;
  hrefFor?: (input: CrmLink) => string;
}) {
  return (
    <div className="mb-6 grid gap-4">
      <nav className="flex w-fit rounded-full border border-line p-1" aria-label="Vista">
        {vistas.map((item) => {
          const active = vista === item.value;
          return (
            <Link
              key={item.value}
              href={hrefFor({ vista: item.value, estado, origen })}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-full bg-brand px-4 py-2 text-small font-semibold text-on-brand"
                  : "rounded-full px-4 py-2 text-small font-semibold text-ink"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <section className="grid gap-4 rounded-2xl border border-line bg-elevated p-4" aria-label="Filtros">
        <CrmChips
          label="Estatus"
          current={estado}
          options={crmEstados.map((value) => ({ value, label: crmLabel(value) }))}
          hrefFor={(value) => hrefFor({ vista, estado: value, origen })}
        />
        <CrmChips
          label="Origen"
          current={origen}
          options={crmOrigenes.map((value) => ({ value, label: origenLabel[value] }))}
          hrefFor={(value) => hrefFor({ vista, estado, origen: value })}
        />
      </section>
    </div>
  );
}
