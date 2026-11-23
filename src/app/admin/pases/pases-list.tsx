"use client";

import type { ReactNode } from "react";
import { PasesToolbar } from "@/app/admin/pases/pases-toolbar";
import { RowActions } from "@/components/admin/row-actions";
import { DataList } from "@/components/admin/data-list";
import type { PassListRow } from "@/lib/admin/pases/pass-list-row";

export function PasesList({
  rows,
  page,
  total,
  q,
  sector,
  sectors,
  notice,
  children,
}: {
  rows: PassListRow[];
  page: number;
  total: number;
  q?: string;
  sector?: string;
  sectors: { id: string; name: string }[];
  notice?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      {notice ? <div className="px-8 pt-8">{notice}</div> : null}
      <DataList
        title="Pases y llegadas"
        lead="Pases emitidos (cuenta o RSVP) y hora de llegada a mesa."
        columns={[
          { key: "name", label: "Nombre" },
          { key: "email", label: "Correo" },
          { key: "company", label: "Empresa" },
          { key: "sector", label: "Sector" },
          { key: "session", label: "Sesión" },
          { key: "cuenta", label: "Cuenta" },
          { key: "issued_label", label: "Emitido" },
          { key: "llegada", label: "Llegada" },
        ]}
        rows={rows}
        page={page}
        total={total}
        basePath="/admin/pases"
        q={q}
        extras={{ sector }}
        toolbar={<PasesToolbar q={q} sector={sector} sectors={sectors} />}
        rowActions={(row) =>
          row.profile_id ? (
            <RowActions
              href={`/admin/cuentas/${row.profile_id}`}
              deleteAction={row.kind === "legacy" ? `/api/admin/pases/${row.profile_id}` : undefined}
              deleteLabel="este pase"
            />
          ) : (
            <span className="text-small text-ink-secondary">Sin ficha</span>
          )
        }
      >
        {children}
      </DataList>
    </>
  );
}
