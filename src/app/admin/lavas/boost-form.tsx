"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function BoostForm({
  multiplier,
  flatBonus,
  error,
}: {
  multiplier: number;
  flatBonus: number;
  error?: string;
}) {
  return (
    <FormSheet action="Editar" resource="boost EIA" label="Boost EIA">
      <form action="/api/admin/lavas/boost" method="post" className="grid gap-3">
        {error ? <p className="text-small text-mark">{error}</p> : null}
        <p className="text-small text-ink-secondary">
          Si la empresa ya aceptó innovación abierta, el monto es redondeo(base × multiplicador) + bono.
        </p>
        <label className="grid gap-1 text-small">
          Multiplicador
          <input
            name="multiplier"
            type="number"
            min={0}
            step={0.01}
            defaultValue={multiplier}
            required
            className="rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-small">
          Bono fijo
          <input
            name="flat_bonus"
            type="number"
            min={0}
            step={1}
            defaultValue={flatBonus}
            required
            className="rounded-lg border border-line px-3 py-2"
          />
        </label>
        <SheetSubmit>Guardar boost</SheetSubmit>
      </form>
    </FormSheet>
  );
}
