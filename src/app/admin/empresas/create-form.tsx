import { BandSelect } from "@/app/admin/empresas/band-select";
import { EmpresaPickers } from "@/app/admin/empresas/empresa-pickers";
import { SourceSelect } from "@/app/admin/empresas/source-select";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CreateEmpresaForm({
  open,
  sectors,
  profiles,
}: {
  open?: boolean;
  sectors: { id: string; name: string }[];
  profiles: { id: string; email: string }[];
}) {
  const ready = profiles.length > 0 && sectors.length > 0;
  return (
    <FormSheet action="Crear" resource="empresa" label="Nueva empresa" open={open}>
      <form action="/api/admin/empresas" method="post" className="grid gap-3">
        {profiles.length === 0 ? (
          <Alert>
            <AlertDescription>
              No hay empresarios sin empresa. Crea primero una cuenta con rol empresario.
            </AlertDescription>
          </Alert>
        ) : null}
        {sectors.length === 0 ? (
          <Alert>
            <AlertDescription>
              No hay sectores cargados. Agrégalos en Sectores antes de crear la empresa.
            </AlertDescription>
          </Alert>
        ) : null}
        <EmpresaPickers sectors={sectors} profiles={profiles} />
        <label className="grid gap-1 text-small">
          Razón social
          <input name="legal_name" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Tamaño
          <BandSelect />
        </label>
        <label className="grid gap-1 text-small">
          Cómo llegó el sector
          <SourceSelect />
        </label>
        <label className="grid gap-1 text-small">
          Referencia
          <input name="referral_source" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        {ready ? <SheetSubmit>Crear empresa</SheetSubmit> : null}
      </form>
    </FormSheet>
  );
}
