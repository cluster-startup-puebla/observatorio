"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { columnDef, type DataColumn, type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";
import { pageCount, pageSize } from "@/lib/admin/page-query";

export function DataList({
  title,
  lead,
  columns,
  rows,
  page,
  total,
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
  total: number;
  basePath: string;
  error?: string;
  rowActions?: (row: DataRow) => React.ReactNode;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pages = pageCount(total);
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => columnDef(column)),
    {
      id: "acciones",
      header: "Acciones",
      meta: { className: "w-[1%] whitespace-nowrap" },
      cell: ({ row }) =>
        rowActions?.(row.original) ?? (
          <Link className="text-link" href={`${basePath}/${row.original.id}`}>
            Abrir
          </Link>
        ),
    },
  ];

  useEffect(() => {
    if (page > pages) router.replace(`${basePath}?page=${pages}`);
  }, [basePath, page, pages, router]);

  return (
    <main className="px-8 py-8">
      <PanelHeader title={title} lead={lead} crumbs={listCrumbs(title, basePath)} actions={children} />
      {error ? <p className="mb-4 text-small text-mark">{error}</p> : null}
      <DataTable
        data={rows}
        columns={tableColumns}
        page={page}
        totalPages={pages}
        total={total}
        limit={pageSize}
        emptyMessage="Sin filas."
        onPageChange={(next) => router.push(`${basePath}?page=${next}`)}
      />
      <p className="sr-only" data-testid="pagina">
        {page}
      </p>
    </main>
  );
}
