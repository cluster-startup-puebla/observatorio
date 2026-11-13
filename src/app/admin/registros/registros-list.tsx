"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { columnDef, type DataColumn, type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";
import { pageCount, pageSize } from "@/lib/admin/page-query";

const columns: DataColumn[] = [
  { key: "full_name", label: "Nombre" },
  { key: "company_name", label: "Empresa" },
  { key: "email", label: "Correo" },
  { key: "sector_slug", label: "Sector" },
  { key: "estado", label: "Estado", render: (row) => (row.completed_at ? "Completo" : "A medias") },
  { key: "cuenta", label: "Cuenta", render: (row) => (row.poured_at ? "Ya tiene cuenta" : "") },
];

export function RegistrosList({ rows, page, total }: { rows: DataRow[]; page: number; total: number }) {
  const router = useRouter();
  const pages = pageCount(total);
  const tableColumns: ColumnDef<DataRow>[] = columns.map((column) => columnDef(column));

  useEffect(() => {
    if (page > pages) router.replace(`/admin/registros?page=${pages}`);
  }, [page, pages, router]);

  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="Registros públicos"
        lead="Quienes empezaron el registro público, antes de crear su cuenta."
        crumbs={listCrumbs("Registros públicos", "/admin/registros")}
      />
      <DataTable
        data={rows}
        columns={tableColumns}
        page={page}
        totalPages={pages}
        total={total}
        limit={pageSize}
        emptyMessage="Todavía no hay registros públicos."
        onPageChange={(next) => router.push(`/admin/registros?page=${next}`)}
      />
    </main>
  );
}
