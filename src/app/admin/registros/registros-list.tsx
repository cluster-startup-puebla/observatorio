"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { AcceptRegistro } from "@/app/admin/registros/accept-registro";
import { columnDef, type DataColumn, type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";
import { pageCount, pageSize } from "@/lib/admin/page-query";

function detailLink(label: string, href: string) {
  if (!label || !href) return label;
  return (
    <Link className="text-link" href={href}>
      {label}
    </Link>
  );
}

const columns: DataColumn[] = [
  { key: "full_name", label: "Nombre", render: (row) => detailLink(row.full_name, row.profile_id ? `/admin/cuentas/${row.profile_id}` : "") },
  { key: "company_name", label: "Empresa", render: (row) => detailLink(row.company_name, row.company_id ? `/admin/empresas/${row.company_id}` : "") },
  { key: "email", label: "Correo" },
  { key: "sector_slug", label: "Sector" },
  { key: "referral_source", label: "Se enteró por" },
  { key: "estado", label: "Estado", render: (row) => (row.completed_at ? "Completo" : "A medias") },
  { key: "cuenta", label: "Cuenta", render: (row) => (row.poured_at ? "Ya tiene cuenta" : "") },
  {
    key: "aceptar",
    label: "",
    render: (row) => <AcceptRegistro id={row.id} completed={row.completed_at} poured={row.poured_at} />,
  },
];

export function RegistrosList({
  rows,
  page,
  total,
  notice,
  banner,
}: {
  rows: DataRow[];
  page: number;
  total: number;
  notice: string;
  banner?: ReactNode;
}) {
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
        lead="Registros completos listos para aceptar. Al aceptar se crea la cuenta y sale el pase."
        crumbs={listCrumbs("Registros públicos", "/admin/registros")}
      />
      {notice ? banner : null}
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
