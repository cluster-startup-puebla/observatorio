"use client";

import { SearchCombobox } from "@/components/admin/search-combobox";

export function EmpresaPickers({
  sectors,
  profiles,
  sectorId = "",
}: {
  sectors: { id: string; name: string }[];
  profiles?: { id: string; email: string }[];
  sectorId?: string;
}) {
  return (
    <>
      {profiles ? (
        <label className="grid gap-1 text-small" htmlFor="profile_id">
          Empresario
          <SearchCombobox
            id="profile_id"
            name="profile_id"
            noneLabel="Elige un empresario"
            searchPlaceholder="Buscar empresario"
            listLabel="Empresario"
            items={profiles.map((profile) => ({ id: profile.id, label: profile.email }))}
          />
        </label>
      ) : null}
      <label className="grid gap-1 text-small" htmlFor="sector_id">
        Sector
        <SearchCombobox
          id="sector_id"
          name="sector_id"
          defaultValue={sectorId}
          noneLabel="Elige un sector"
          searchPlaceholder="Buscar sector"
          listLabel="Sector"
          items={sectors.map((sector) => ({ id: sector.id, label: sector.name }))}
        />
      </label>
    </>
  );
}
