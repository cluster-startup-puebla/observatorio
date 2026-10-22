import { FormSheet } from "@/components/admin/form-sheet";
import { FileDrop } from "@/components/file-drop";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function OrganismoLogoTab({ id, logo }: { id: string; logo: { object_path: string } | null }) {
  return (
    <div className="mt-4 grid gap-3">
      {logo ? (
        <img
          src={`/api/admin/organismos/${id}/logo`}
          alt="Logo del organismo"
          className="size-24 rounded-xl border border-line bg-elevated object-contain"
        />
      ) : (
        <p>Sin logo.</p>
      )}
      <FormSheet action="Editar" resource="logo">
        <form action={`/api/admin/organismos/${id}/logo`} method="post" encType="multipart/form-data" className="grid gap-3">
          <FileDrop
            id="org-logo-file"
            name="logo"
            label="Logo"
            accept="image/png,image/jpeg,image/webp"
            hint="PNG, JPG o WebP · hasta 2 MB"
            preview
          />
          <SheetSubmit>Subir logo</SheetSubmit>
        </form>
      </FormSheet>
    </div>
  );
}
