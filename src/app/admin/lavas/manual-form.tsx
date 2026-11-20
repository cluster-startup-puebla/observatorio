"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { SearchCombobox } from "@/components/admin/search-combobox";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function ManualForm({
  companies,
  error,
}: {
  companies: { id: string; label: string }[];
  error?: string;
}) {
  return (
    <FormSheet action="Registrar" resource="ajuste" label="Ajuste manual">
      <form action="/api/admin/lavas/manual" method="post" className="grid gap-3">
        {error ? <p className="text-small text-mark">{error}</p> : null}
        <label className="grid gap-1 text-small" htmlFor="company_id">
          Empresa
          <SearchCombobox
            id="company_id"
            name="company_id"
            noneLabel="Elige una empresa"
            searchPlaceholder="Buscar empresa"
            listLabel="Empresa"
            items={companies}
          />
        </label>
        <label className="grid gap-1 text-small">
          Monto (puede ser negativo)
          <input name="amount" type="number" step={1} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Nota
          <textarea name="note" required maxLength={280} rows={3} className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Registrar ajuste</SheetSubmit>
      </form>
    </FormSheet>
  );
}
