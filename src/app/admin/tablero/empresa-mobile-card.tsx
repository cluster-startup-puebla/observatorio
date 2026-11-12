import Link from "next/link";
import type { DataRow } from "@/components/admin/data-columns";

export function EmpresaMobileCard({ row }: { row: DataRow }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-small font-medium text-ink">{row.legal_name}</span>
        <span className="shrink-0 text-small text-ink-muted">{row.aprobacion}</span>
      </div>
      <p className="break-words text-small text-ink-secondary">
        {row.sector_name} · {row.employee_band}
      </p>
      <p className="text-small text-ink-muted">{row.llegada}</p>
      <Convener value={row.convoco} />
      <div className="flex justify-end">
        <Link className="text-small text-link" href={`/admin/empresas/${row.id}`}>
          Abrir
        </Link>
      </div>
    </div>
  );
}

function Convener({ value }: { value: string }) {
  const names = convenerNames(value);
  if (names.length === 0) return null;
  return <p className="break-words text-small text-ink-muted">Convocó {names.join(", ")}</p>;
}

function convenerNames(value: string) {
  if (!value.startsWith("[")) return [];
  try {
    const parsed = JSON.parse(value) as { name?: string }[];
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => (item?.name ? [item.name] : []));
  } catch {
    return [];
  }
}
