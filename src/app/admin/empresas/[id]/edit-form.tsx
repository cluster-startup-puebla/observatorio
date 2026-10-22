"use client";

import { BandSelect } from "@/app/admin/empresas/band-select";
import { EmpresaPickers } from "@/app/admin/empresas/empresa-pickers";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function EditEmpresaForm({
  id,
  legalName,
  band,
  sectorId,
  referral,
  sectors,
  open,
  trigger,
}: {
  id: string;
  legalName: string;
  band: string;
  sectorId: string;
  referral: string;
  sectors: { id: string; name: string }[];
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="empresa" open={open} trigger={trigger}>
      <form action={`/api/admin/empresas/${id}`} method="post" className="grid gap-3">
        <input type="hidden" name="accion" value="guardar" />
        <label className="grid gap-1 text-small">
          Razón social
          <input name="legal_name" defaultValue={legalName} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <EmpresaPickers sectors={sectors} sectorId={sectorId} />
        <label className="grid gap-1 text-small">
          Tamaño
          <BandSelect value={band} />
        </label>
        <label className="grid gap-1 text-small">
          Referencia
          <input name="referral_source" defaultValue={referral} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Guardar empresa</SheetSubmit>
      </form>
    </FormSheet>
  );
}
