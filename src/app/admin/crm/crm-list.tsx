"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { CreateCrmForm } from "@/app/admin/crm/create-form";
import { CrmCards } from "@/app/admin/crm/crm-cards";
import { CrmRowActions } from "@/app/admin/crm/row-actions";
import { CrmToolbar } from "@/app/admin/crm/crm-toolbar";
import { columnDef, type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";
import { crmHref, type CrmVista } from "@/lib/admin/crm/query";
import { pageCount, pageSize } from "@/lib/admin/page-query";

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
  total,
  error,
  orgs,
  vista,
  estado,
  origen,
}: {
  rows: DataRow[];
  page: number;
  total: number;
  error?: string;
  orgs: { id: string; name: string }[];
  vista: CrmVista;
  estado: string;
  origen: string;
}) {
  const router = useRouter();
  const pages = pageCount(total);
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => columnDef(column)),
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => <CrmRowActions row={row.original} />,
    },
  ];

  useEffect(() => {
    if (page > pages) router.replace(crmHref({ vista, estado, origen, page: pages }));
  }, [estado, origen, page, pages, router, vista]);

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
        <CrmCards rows={rows} />
      ) : (
        <DataTable
          data={rows}
          columns={tableColumns}
          page={page}
          totalPages={pages}
          total={total}
          limit={pageSize}
          emptyMessage="No hay contactos con estos filtros."
          onPageChange={(next) => router.push(crmHref({ vista, estado, origen, page: next }))}
        />
      )}
    </main>
  );
}
