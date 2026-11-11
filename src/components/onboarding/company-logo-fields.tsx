"use client";

import { FileDrop } from "@/components/file-drop";

export function CompanyLogoFields({
  showLogo,
  onShow,
  onFile,
  deferrable = false,
}: {
  showLogo: boolean;
  onShow: (showLogo: boolean) => void;
  onFile: (hasLogo: boolean) => void;
  deferrable?: boolean;
}) {
  return (
    <div className="grid gap-3">
      <FileDrop
        id="company-logo"
        name="logo"
        label="Logo de la empresa"
        accept="image/png,image/jpeg,image/webp"
        hint="PNG, JPG o WEBP · hasta 2 MB."
        preview
        maxBytes={2097152}
        onChosen={(file) => onFile(Boolean(file))}
      />
      {deferrable ? (
        <p className="text-small text-ink-secondary">Opcional. Lo puedes subir después.</p>
      ) : null}
      <label className="flex items-start gap-2 text-small text-ink">
        <input
          type="checkbox"
          name="showLogo"
          value="1"
          checked={showLogo}
          onChange={(event) => onShow(event.target.checked)}
        />
        Mostrar mi logo el día del evento
      </label>
    </div>
  );
}
