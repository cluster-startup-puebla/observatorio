import Link from "next/link";
import { crmHref, type CrmVista } from "@/lib/admin/crm/query";

export function CrmPager({
  page,
  hasMore,
  vista,
  estado,
  origen,
}: {
  page: number;
  hasMore: boolean;
  vista: CrmVista;
  estado: string;
  origen: string;
}) {
  if (page === 1 && !hasMore) return null;
  return (
    <nav className="flex gap-3 text-small font-semibold" aria-label="Páginas">
      {page > 1 ? (
        <Link className="text-link" href={crmHref({ vista, estado, origen, page: page - 1 })}>
          Anterior
        </Link>
      ) : null}
      {hasMore ? (
        <Link className="text-link" href={crmHref({ vista, estado, origen, page: page + 1 })}>
          Siguiente
        </Link>
      ) : null}
    </nav>
  );
}
