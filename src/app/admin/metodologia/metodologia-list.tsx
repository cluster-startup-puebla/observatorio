"use client";

import Link from "next/link";
import { MetodologiaRowActions } from "@/app/admin/metodologia/row-actions";
import { DataList } from "@/components/admin/data-list";
import { Button } from "@/components/ui/button";

export function MetodologiaList({
  rows,
  page,
  total,
  error,
}: {
  rows: Record<string, string>[];
  page: number;
  total: number;
  error?: string;
}) {
  return (
    <DataList
      title="Metodología"
      lead="Secciones, bandas, preguntas, opciones y condiciones."
      columns={[
        { key: "name", label: "Sección" },
        { key: "position", label: "Orden" },
        { key: "range_label", label: "Rango" },
      ]}
      rows={rows}
      page={page}
      total={total}
      basePath="/admin/metodologia"
      error={error}
      rowActions={(row) => <MetodologiaRowActions row={row} />}
    >
      <Button type="button" size="sm" variant="outline" asChild>
        <Link href="/admin/metodologia/integral">Bandas integrales</Link>
      </Button>
    </DataList>
  );
}
