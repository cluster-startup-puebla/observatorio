"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { columnDef, type DataRow } from "@/components/admin/data-columns";
import { DataTable } from "@/components/ui/data-table";
import { pageCount } from "@/lib/admin/page-query";

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "empresa", label: "Empresa" },
  { key: "email", label: "Correo" },
  { key: "source", label: "Origen" },
  { key: "status", label: "Estatus" },
];

export function OrganismoCrmTab({
  id,
  rows,
  page,
  total,
}: {
  id: string;
  rows: DataRow[];
  page: number;
  total: number;
}) {
  const router = useRouter();
  const pages = pageCount(total);
  const href = (next: number) => (next > 1 ? `/admin/organismos/${id}?tab=crm&page=${next}` : `/admin/organismos/${id}?tab=crm`);
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => columnDef(column)),
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Link className="text-link" href={`/admin/crm/${row.original.id}`}>
          Abrir
        </Link>
      ),
    },
  ];

  useEffect(() => {
    if (page > pages) router.replace(href(pages));
  }, [page, pages, router, id]);

  return (
    <DataTable
      data={rows}
      columns={tableColumns}
      page={page}
      totalPages={pages}
      total={total}
      emptyMessage="Este organismo no tiene contactos."
      onPageChange={(next) => router.push(href(next))}
    />
  );
}
