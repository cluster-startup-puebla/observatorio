"use client";

import { BandejaRowActions } from "@/app/admin/bandeja/row-actions";
import { DataList } from "@/components/admin/data-list";

const filters = [
  { href: "/admin/bandeja", label: "Todos" },
  { href: "/admin/bandeja?kind=password", label: "Contraseña" },
  { href: "/admin/bandeja?kind=event_pass", label: "Pase" },
  { href: "/admin/bandeja?kind=open_innovation", label: "Innovación abierta" },
];

export function BandejaList({
  rows,
  page,
  error,
}: {
  rows: Record<string, string>[];
  page: number;
  error?: string;
}) {
  return (
    <DataList
      title="Bandeja"
      lead="Los tres correos: contraseña, pase e innovación abierta."
      columns={[
        { key: "kind_label", label: "Tipo" },
        { key: "to_email", label: "Para" },
        { key: "subject", label: "Asunto" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/bandeja"
      error={error}
      rowActions={(row) => <BandejaRowActions row={row} />}
    >
      <nav className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <a key={filter.href} className="text-link" href={filter.href}>
            {filter.label}
          </a>
        ))}
      </nav>
    </DataList>
  );
}
