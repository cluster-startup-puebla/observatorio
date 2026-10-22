"use client";

import { CreateOrganismoForm } from "@/app/admin/organismos/create-form";
import { OrganismoRowActions } from "@/app/admin/organismos/row-actions";
import { DataList } from "@/components/admin/data-list";

type Row = Record<string, string>;

export function OrganismosList({
  rows,
  page,
  params,
}: {
  rows: Row[];
  page: number;
  params: { error?: string; name?: string; color?: string; edit?: string };
}) {
  return (
    <DataList
      title="Organismos"
      lead="Quien convoca: marca, miembros y enlaces."
      columns={[
        { key: "logo", label: "Logo", image: true },
        { key: "name", label: "Nombre" },
        { key: "brand_color", label: "Color", color: true },
        { key: "brand_completed_at", label: "Marca" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/organismos"
      rowActions={(row) => (
        <OrganismoRowActions
          id={row.id}
          name={params.edit === row.id && params.name ? params.name : row.name}
          color={params.edit === row.id && params.color ? params.color : row.brand_color}
          open={params.edit === row.id}
          error={params.edit === row.id ? params.error : undefined}
        />
      )}
    >
      <CreateOrganismoForm
        open={Boolean(params.error) && !params.edit}
        error={params.edit ? undefined : params.error}
        name={params.edit ? undefined : params.name}
        color={params.edit ? undefined : params.color}
      />
    </DataList>
  );
}
