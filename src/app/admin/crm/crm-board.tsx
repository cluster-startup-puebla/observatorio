"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { CrmCards } from "@/app/admin/crm/crm-cards";
import { CrmRowActions } from "@/app/admin/crm/row-actions";
import { CrmToolbar } from "@/app/admin/crm/crm-toolbar";
import { columnDef, type DataRow } from "@/components/admin/data-columns";
import { DataTable } from "@/components/ui/data-table";
import { type CrmLink, type CrmVista } from "@/lib/admin/crm/query";
import { pageCount, pageSize } from "@/lib/admin/page-query";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "empresa", label: "Empresa" },
  { key: "email", label: "Correo" },
  { key: "source", label: "Origen" },
  { key: "status", label: "Estatus" },
];

export function CrmBoard({
  rows,
  page,
  total,
  vista,
  estado,
  origen,
  hrefFor,
}: {
  rows: DataRow[];
  page: number;
  total: number;
  vista: CrmVista;
  estado: string;
  origen: string;
  hrefFor: (input: CrmLink) => string;
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
    if (page > pages) router.replace(hrefFor({ vista, estado, origen, page: pages }));
  }, [estado, hrefFor, origen, page, pages, router, vista]);

  return (
    <>
      <CrmToolbar vista={vista} estado={estado} origen={origen} hrefFor={hrefFor} />
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
          onPageChange={(next) => router.push(hrefFor({ vista, estado, origen, page: next }))}
        />
      )}
    </>
  );
}
