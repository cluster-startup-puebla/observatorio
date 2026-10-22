import type { ColumnDef } from "@tanstack/react-table";

export type DataColumn = { key: string; label: string; image?: boolean; color?: boolean };
export type DataRow = Record<string, string>;

export function columnDef(column: DataColumn): ColumnDef<DataRow> {
  if (column.image) {
    return {
      id: column.key,
      header: column.label,
      cell: ({ row }) =>
        row.original[column.key] ? (
          <img src={row.original[column.key]} alt="" className="size-8 rounded-md border border-line object-contain" />
        ) : (
          <span className="text-ink-secondary">—</span>
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
