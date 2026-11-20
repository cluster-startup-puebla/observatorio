"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

type ActionValues = {
  code: string;
  label: string;
  base_value: string;
  once: boolean;
  eia_boost: boolean;
  condition_label: string;
  repeatable_label: string;
  active: boolean;
  sort_order: string;
};

export function ActionForm({
  row,
  open,
  error,
  trigger,
}: {
  row: ActionValues;
  open?: boolean;
  error?: string;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="acción" open={open} trigger={trigger}>
      <form action={`/api/admin/lavas/actions/${row.code}`} method="post" className="grid gap-3">
        {error ? <p className="text-small text-mark">{error}</p> : null}
        <input type="hidden" name="code" value={row.code} />
        <label className="grid gap-1 text-small">
          Nombre
          <input name="label" defaultValue={row.label} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Lavas base
          <input name="base_value" type="number" min={0} defaultValue={row.base_value} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Condición
          <input name="condition_label" defaultValue={row.condition_label} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Una vez / repetible
          <input name="repeatable_label" defaultValue={row.repeatable_label} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Orden
          <input name="sort_order" type="number" min={1} defaultValue={row.sort_order} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-small">
          <input name="once" type="checkbox" defaultChecked={row.once} /> Una vez
        </label>
        <label className="flex items-center gap-2 text-small">
          <input name="eia_boost" type="checkbox" defaultChecked={row.eia_boost} /> Boost EIA
        </label>
        <label className="flex items-center gap-2 text-small">
          <input name="active" type="checkbox" defaultChecked={row.active} /> Activa
        </label>
        <SheetSubmit>Guardar acción</SheetSubmit>
      </form>
    </FormSheet>
  );
}
