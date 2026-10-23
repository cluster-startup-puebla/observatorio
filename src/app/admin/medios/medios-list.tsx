"use client";

import { MedioRowActions } from "@/app/admin/medios/row-actions";
import { DataList } from "@/components/admin/data-list";

export function MediosList({
  rows,
  page,
  error,
}: {
  rows: Record<string, string>[];
  page: number;
  error?: string;
}) {
  return (
    <DataList
      title="Medios"
      lead="Logos, imágenes de contenido y pases. Los bytes están en Storage."
      columns={[
        { key: "preview", label: "Preview", image: true, imageAltKey: "purpose_label" },
        { key: "purpose_label", label: "Uso" },
        { key: "bucket_id", label: "Bucket" },
        { key: "object_path", label: "Ruta" },
        { key: "byte_size", label: "Bytes" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/medios"
      error={error}
      rowActions={(row) => <MedioRowActions row={row} />}
    />
  );
}
