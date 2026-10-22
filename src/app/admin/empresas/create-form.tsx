import { BandSelect } from "@/app/admin/empresas/band-select";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function CreateEmpresaForm({
  open,
  sectors,
  profiles,
}: {
  open?: boolean;
  sectors: { id: string; name: string }[];
  profiles: { id: string; email: string }[];
}) {
  return (
    <FormSheet action="Crear" resource="empresa" label="Nueva empresa" open={open}>
      <form action="/api/admin/empresas" method="post" className="grid gap-3">
        <label className="grid gap-1 text-small">
          Perfil
          <select name="profile_id" required className="rounded-lg border border-line px-3 py-2">
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.email}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-small">
          Razón social
          <input name="legal_name" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small">
          Sector
          <select name="sector_id" required className="rounded-lg border border-line px-3 py-2">
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-small">
          Tamaño
          <BandSelect />
        </label>
        <label className="grid gap-1 text-small">
          Referencia
          <input name="referral_source" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Crear empresa</SheetSubmit>
      </form>
    </FormSheet>
  );
}
