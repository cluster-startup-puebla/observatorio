"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { columnDef, type DataColumn, type DataRow } from "@/components/admin/data-columns";
import { DataTable } from "@/components/ui/data-table";
import { EmpresaMobileCard } from "@/app/admin/tablero/empresa-mobile-card";

const columns: DataColumn[] = [
  { key: "logo", label: "Logo", image: true },
  { key: "legal_name", label: "Razón social" },
  { key: "employee_band", label: "Tamaño" },
  { key: "sector_name", label: "Sector" },
  { key: "convoco", label: "Convocó", links: true },
  { key: "llegada", label: "Llegada" },
  { key: "aprobacion", label: "Aprobación" },
];

export function EmpresaTable({ rows }: { rows: DataRow[] }) {
  const tableColumns: ColumnDef<DataRow>[] = [
    ...columns.map((column) => columnDef(column)),
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Link className="text-link" href={`/admin/empresas/${row.original.id}`}>
          Abrir
        </Link>
      ),
    },
  ];
  return (
    <DataTable
      data={rows}
      columns={tableColumns}
      enablePagination={false}
      emptyMessage="Sin filas."
      renderMobileCard={(row) => <EmpresaMobileCard row={row} />}
    />
  );
}
