"use client";

import Link from "next/link";
import { DataList } from "@/components/admin/data-list";

export function InnovacionList({ rows, page, total }: { rows: Record<string, string>[]; page: number; total: number }) {
  return (
    <DataList
      title="Innovación abierta"
      lead="Empresas que aceptaron que el Observatorio las contacte."
      columns={[
        { key: "empresa", label: "Empresa" },
        { key: "nombre", label: "Nombre" },
        { key: "correo", label: "Correo" },
        { key: "acepto", label: "Aceptó" },
      ]}
      rows={rows}
      page={page}
      total={total}
      basePath="/admin/innovacion"
      rowActions={(row) =>
        row.empresa_id ? (
          <Link className="text-link" href={`/admin/empresas/${row.empresa_id}`}>
            Ver empresa
          </Link>
        ) : (
          <span className="text-small text-ink-secondary">Sin empresa</span>
        )
      }
    />
  );
}
