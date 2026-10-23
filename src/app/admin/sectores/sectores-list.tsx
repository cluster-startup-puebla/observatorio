"use client";

import { CreateSectorForm } from "@/app/admin/sectores/create-form";
import { SectorRowActions } from "@/app/admin/sectores/row-actions";
import { DataList } from "@/components/admin/data-list";

export function SectoresList({
  rows,
  page,
  error,
  images,
}: {
  rows: Record<string, string>[];
  page: number;
  error?: string;
  images: { id: string }[];
}) {
  return (
    <DataList
      title="Sectores"
      lead="El catálogo y el mensaje de la landing, solo si ya está escrito."
      columns={[
        { key: "name", label: "Nombre" },
        { key: "slug", label: "Ruta" },
        { key: "position", label: "Orden" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/sectores"
      error={error}
      rowActions={(row) => <SectorRowActions row={row} images={images} />}
    >
      <CreateSectorForm open={Boolean(error)} />
    </DataList>
  );
}
