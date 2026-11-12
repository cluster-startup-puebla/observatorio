import { FormSheet } from "@/components/admin/form-sheet";
import { FileDrop } from "@/components/file-drop";
import { SheetSubmit } from "@/components/admin/sheet-submit";
import { Button } from "@/components/ui/button";

export function OrganismoLogoTab({ id, logo }: { id: string; logo: { object_path: string } | null }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex size-28 items-center justify-center rounded-xl border border-line bg-elevated">
        {logo ? (
          <img
            src={`/api/admin/organismos/${id}/logo`}
            alt="Logo del organismo"
            className="size-full object-contain p-2"
          />
        ) : (
          <p className="text-small text-ink-muted">Sin logo</p>
        )}
      </div>
      <FormSheet
        action="Editar"
        resource="logo"
        trigger={
          <Button type="button" size="sm" variant="outline" className="w-fit">
            Cambiar logo
          </Button>
        }
      >
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
