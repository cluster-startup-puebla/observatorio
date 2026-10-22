"use client";

import { SearchCombobox } from "@/components/admin/search-combobox";

export function OrgCombobox({
  id,
  name,
  orgs,
  defaultValue = "",
  noneLabel = "Ninguno",
}: {
  id: string;
  name: string;
  orgs: { id: string; name: string | null }[];
  defaultValue?: string;
  noneLabel?: string;
}) {
  return (
    <SearchCombobox
      id={id}
      name={name}
      defaultValue={defaultValue}
      noneLabel={noneLabel}
      searchPlaceholder="Buscar organismo"
      listLabel="Organismo"
      items={orgs.map((org) => ({ id: org.id, label: org.name ?? org.id }))}
    />
  );
}
