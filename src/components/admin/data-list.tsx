"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { columnDef, type DataColumn, type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";

export function DataList({
  title,
  lead,
  columns,
  rows,
  page,
  basePath,
  error,
  rowActions,
  children,
}: {
  title: string;
  lead: string;
  columns: DataColumn[];
  rows: DataRow[];
  page: number;
  basePath: string;
  error?: string;
  rowActions?: (row: DataRow) => React.ReactNode;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => columnDef(column)),
    {
      id: "acciones",
      header: "Acciones",
      meta: { className: "w-[1%] whitespace-nowrap" },
      cell: ({ row }) =>
        rowActions?.(row.original) ?? (
          <a className="text-link" href={`${basePath}/${row.original.id}`}>
            Abrir
          </a>
        ),
    },
  ];
  const totalPages = rows.length >= 10 ? page + 1 : page;

  return (
    <main className="px-8 py-8">
      <PanelHeader title={title} lead={lead} crumbs={listCrumbs(title, basePath)} actions={children} />
      {error ? <p className="mb-4 text-small text-mark">{error}</p> : null}
      <DataTable
        data={rows}
        columns={tableColumns}
        page={page}
        totalPages={totalPages}
        total={rows.length}
        limit={10}
        emptyMessage="Sin filas."
        onPageChange={(next) => router.push(`${basePath}?page=${next}`)}
      />
      <p className="sr-only" data-testid="pagina">
        {page}
      </p>
    </main>
  );
}
