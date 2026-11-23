"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AcceptRegistro } from "@/app/admin/registros/accept-registro";
import { columnDef, type DataColumn, type DataRow } from "@/components/admin/data-columns";

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
  { key: "session_title", label: "Sesión", render: (row) => row.session_title || "Sin sesión" },
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

export function registrosTableColumns(): ColumnDef<DataRow>[] {
  return columns.map((column) => columnDef(column));
}
