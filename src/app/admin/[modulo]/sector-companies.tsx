"use client";

import Link from "next/link";
import { DataList } from "@/components/admin/data-list";
import type { DataRow } from "@/components/admin/data-columns";

export function SectorCompanies({
  name,
  slug,
  rows,
  page,
  total,
}: {
  name: string;
  slug: string;
  rows: DataRow[];
  page: number;
  total: number;
}) {
  return (
    <DataList
      title={name}
      lead="Empresas de este sector."
      basePath={`/admin/${slug}`}
      rows={rows}
      page={page}
      total={total}
      columns={[
        { key: "logo", label: "Logo", image: true, imageAltKey: "legal_name" },
        {
          key: "legal_name",
          label: "Razón social",
          render: (row) => (
            <Link className="text-link" href={`/admin/empresas/${row.id}`}>
              {row.legal_name}
            </Link>
          ),
        },
        { key: "employee_band", label: "Tamaño" },
        { key: "convoco", label: "Convocó", links: true },
        { key: "llegada", label: "Llegada" },
        { key: "aprobacion", label: "Aprobación" },
      ]}
      rowActions={(row) => (
        <Link className="text-link" href={`/admin/empresas/${row.id}`}>
          Abrir
        </Link>
      )}
    />
  );
}
