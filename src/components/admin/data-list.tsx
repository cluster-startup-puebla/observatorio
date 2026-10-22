"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";

type DataColumn = { key: string; label: string };
type DataRow = Record<string, string>;

export function DataList({
  title,
  lead,
  columns,
  rows,
  page,
  basePath,
  error,
  children,
}: {
  title: string;
  lead: string;
  columns: DataColumn[];
  rows: DataRow[];
  page: number;
  basePath: string;
  error?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => ({ accessorKey: column.key, header: column.label })),
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
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
