"use client";

import Link from "next/link";
import { BandejaRowActions } from "@/app/admin/bandeja/row-actions";
import { DataList } from "@/components/admin/data-list";

const filters = [
  { href: "/admin/bandeja", label: "Todos" },
  { href: "/admin/bandeja?kind=password", label: "Contraseña" },
  { href: "/admin/bandeja?kind=event_pass", label: "Pase" },
  { href: "/admin/bandeja?kind=open_innovation", label: "Innovación abierta" },
  { href: "/admin/bandeja?kind=welcome", label: "Bienvenida" },
  { href: "/admin/bandeja?kind=reminder", label: "Recordatorio" },
  { href: "/admin/bandeja?kind=thanks", label: "Gracias" },
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
      lead="Cada fila dice si el correo sigue pendiente o ya se envió."
      columns={[
        { key: "kind_label", label: "Tipo" },
        { key: "to_email", label: "Para" },
        { key: "subject", label: "Asunto" },
        { key: "estado", label: "Estado" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/bandeja"
      error={error}
      rowActions={(row) => <BandejaRowActions row={row} />}
    >
      <nav className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <Link key={filter.href} className="text-link" href={filter.href}>
            {filter.label}
          </Link>
        ))}
      </nav>
    </DataList>
  );
}
