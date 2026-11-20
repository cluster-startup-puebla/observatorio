"use client";

import { useState } from "react";

export function LogoFileField() {
  const [fileName, setFileName] = useState("");

  return (
    <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-line bg-surface-subtle px-4 py-8 text-center focus-within:border-brand">
      <span className="text-small font-semibold text-ink">Elige el logo</span>
      <span className="mt-1 text-small text-ink-secondary">{fileName || "PNG, JPG o WEBP · hasta 2 MB"}</span>
      <input
        id="profile-logo"
        name="logo"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        required
        onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name ?? "")}
      />
    </label>
  );
}
