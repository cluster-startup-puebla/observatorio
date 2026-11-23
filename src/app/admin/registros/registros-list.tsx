"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { registrosTableColumns } from "@/app/admin/registros/registros-columns";
import { SessionFilter } from "@/components/admin/session-filter";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { DataTable } from "@/components/ui/data-table";
import type { DataRow } from "@/components/admin/data-columns";
import { pageCount, pageSize } from "@/lib/admin/page-query";
import type { SessionChoice } from "@/lib/admin/tablero/session-choices";

export function RegistrosList({
  rows,
  page,
  total,
  notice,
  banner,
  choices,
  sessionId,
}: {
  rows: DataRow[];
  page: number;
  total: number;
  notice: string;
  banner?: ReactNode;
  choices: SessionChoice[];
  sessionId: string | null;
}) {
  const router = useRouter();
  const pages = pageCount(total);
  const query = sessionId ? `sesion=${sessionId}&` : "";

  useEffect(() => {
    if (page > pages) router.replace(`/admin/registros?${query}page=${pages}`);
  }, [page, pages, query, router]);

  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="Registros públicos"
        lead="Registros completos listos para aceptar. Al aceptar se crea la cuenta y sale el pase."
        crumbs={listCrumbs("Registros públicos", "/admin/registros")}
      />
      {notice ? banner : null}
      <div className="mb-6">
        <SessionFilter
          action="/admin/registros"
          choices={choices}
          selectedId={sessionId}
          allowAll
          submitLabel="Ver registros"
          testId="registros-sesion"
        />
      </div>
      <DataTable
        data={rows}
        columns={registrosTableColumns()}
        page={page}
        totalPages={pages}
        total={total}
        limit={pageSize}
        emptyMessage="Todavía no hay registros públicos."
        onPageChange={(next) => router.push(`/admin/registros?${query}page=${next}`)}
      />
    </main>
  );
}
