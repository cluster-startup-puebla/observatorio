"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { columnDef, type DataColumn, type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";
import { listHref } from "@/lib/admin/list-query";
import { pageCount, pageSize } from "@/lib/admin/page-query";

export function DataList({
  title,
  lead,
  columns,
  rows,
  page,
  total,
  basePath,
  q,
  error,
  rowActions,
  toolbar,
  children,
}: {
  title: string;
  lead: string;
  columns: DataColumn[];
  rows: DataRow[];
  page: number;
  total: number;
  basePath: string;
  q?: string;
  error?: string;
  rowActions?: (row: DataRow) => React.ReactNode;
  toolbar?: ReactNode;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const pages = pageCount(total);
  const href = (next: number) => listHref({ basePath, page: next, q });
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
    if (page > pages) router.replace(href(pages));
  }, [basePath, page, pages, q, router]);

  return (
    <main className="px-8 py-8">
      <PanelHeader title={title} lead={lead} crumbs={listCrumbs(title, basePath)} actions={children} />
      {error ? <p className="mb-4 text-small text-mark">{error}</p> : null}
      {toolbar ? <div className="mb-4">{toolbar}</div> : null}
      <DataTable
        data={rows}
        columns={tableColumns}
        page={page}
        totalPages={pages}
        total={total}
        limit={pageSize}
        emptyMessage="Sin filas."
        onPageChange={(next) => router.push(href(next))}
      />
      <p className="sr-only" data-testid="pagina">
        {page}
      </p>
    </main>
  );
}
