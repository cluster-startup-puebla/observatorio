"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { CreateCrmForm } from "@/app/admin/crm/create-form";
import { CrmCards } from "@/app/admin/crm/crm-cards";
import { CrmPager } from "@/app/admin/crm/crm-pager";
import { CrmRowActions } from "@/app/admin/crm/row-actions";
import { CrmToolbar } from "@/app/admin/crm/crm-toolbar";
import { columnDef, type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";
import { crmHref, type CrmVista } from "@/lib/admin/crm/query";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "empresa", label: "Empresa" },
  { key: "email", label: "Correo" },
  { key: "source", label: "Origen" },
  { key: "status", label: "Estatus" },
];

export function CrmList({
  rows,
  page,
  error,
  orgs,
  vista,
  estado,
  origen,
}: {
  rows: DataRow[];
  page: number;
  error?: string;
  orgs: { id: string; name: string }[];
  vista: CrmVista;
  estado: string;
  origen: string;
}) {
  const router = useRouter();
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => columnDef(column)),
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => <CrmRowActions row={row.original} />,
    },
  ];

  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="CRM"
        lead="Contactos de todos los organismos. El estatus sale de los hechos."
        crumbs={listCrumbs("CRM", "/admin/crm")}
        actions={<CreateCrmForm open={Boolean(error)} orgs={orgs} />}
      />
      {error ? <p className="mb-4 text-small text-mark">{error}</p> : null}
      <CrmToolbar vista={vista} estado={estado} origen={origen} />
      {vista === "tarjetas" ? (
        <div className="grid gap-4">
          <CrmCards rows={rows} />
          <CrmPager page={page} hasMore={rows.length >= 10} vista={vista} estado={estado} origen={origen} />
        </div>
      ) : (
        <DataTable
          data={rows}
          columns={tableColumns}
          page={page}
          totalPages={rows.length >= 10 ? page + 1 : page}
          total={rows.length}
          limit={10}
          emptyMessage="No hay contactos con estos filtros."
          onPageChange={(next) => router.push(crmHref({ vista, estado, origen, page: next }))}
        />
      )}
    </main>
  );
}
