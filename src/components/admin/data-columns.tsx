import type { ReactNode } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { FallbackImage } from "@/components/admin/fallback-image";

export type DataColumn = {
  key: string;
  label: string;
  image?: boolean;
  imageAltKey?: string;
  color?: boolean;
  links?: boolean;
  className?: string;
  render?: (row: DataRow) => ReactNode;
};
export type DataRow = Record<string, string>;

function linkItems(value: string) {
  if (!value.startsWith("[")) return [];
  try {
    const parsed = JSON.parse(value) as { name?: string; href?: string }[];
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => (item?.name && item.href ? [{ name: item.name, href: item.href }] : []));
  } catch {
    return [];
  }
}

export function columnDef(column: DataColumn): ColumnDef<DataRow> {
  const meta = column.className ? { className: column.className } : undefined;
  if (column.render) {
    const render = column.render;
    return { id: column.key, header: column.label, meta, cell: ({ row }) => render(row.original) };
  }
  if (column.links) {
    return {
      id: column.key,
      header: column.label,
      cell: ({ row }) => {
        const items = linkItems(row.original[column.key] ?? "");
        if (items.length === 0) return "—";
        return items.map((item, index) => (
          <span key={item.href}>
            {index > 0 ? ", " : null}
            <Link className="text-link" href={item.href}>{item.name}</Link>
          </span>
        ));
      },
    };
  }
  if (column.image) {
    const altKey = column.imageAltKey;
    return {
      id: column.key,
      header: column.label,
      cell: ({ row }) => (
        <FallbackImage
          src={row.original[column.key] ?? ""}
          alt={altKey ? (row.original[altKey] ?? "") : ""}
          className="size-8 rounded-md border border-line object-contain"
        />
      ),
    };
  }
  if (column.color) {
    return {
      id: column.key,
      header: column.label,
      cell: ({ row }) => {
        const value = row.original[column.key];
        if (!value) return <span className="text-ink-secondary">—</span>;
        return (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 rounded-sm border border-line" style={{ backgroundColor: value }} />
            <span className="font-mono text-micro uppercase">{value}</span>
          </span>
        );
      },
    };
  }
  return { accessorKey: column.key, header: column.label };
}
