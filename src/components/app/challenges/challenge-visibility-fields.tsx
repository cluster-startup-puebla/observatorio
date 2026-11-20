"use client";

import type { ChallengeFormState } from "./challenge-form-fields";
import { FieldSelect } from "./field-select";

export function ChallengeVisibilityFields({
  value,
  onChange,
  disabled,
  companyName,
  logoUrl,
}: {
  value: ChallengeFormState;
  onChange: (next: ChallengeFormState) => void;
  disabled?: boolean;
  companyName?: string;
  logoUrl?: string | null;
}) {
  return (
    <div className="grid gap-5 px-1">
      <label className="grid gap-2 text-small">
        Urgencia
        <FieldSelect
          value={value.urgency}
          onChange={(urgency) =>
            onChange({
              ...value,
              urgency: urgency as ChallengeFormState["urgency"],
            })
          }
          disabled={disabled}
        >
          <option value="">Sin urgencia</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </FieldSelect>
      </label>
      <label className="grid gap-2 text-small">
        Visibilidad
        <FieldSelect
          value={value.visibility}
          onChange={(visibility) =>
            onChange({
              ...value,
              visibility: visibility as ChallengeFormState["visibility"],
            })
          }
          disabled={disabled}
        >
          <option value="red">Solo red</option>
          <option value="portal">Portal público</option>
        </FieldSelect>
      </label>
      <label className="flex items-center gap-2 px-1 text-small">
        <input
          type="checkbox"
          checked={value.showCompany}
          onChange={(e) => onChange({ ...value, showCompany: e.target.checked })}
          disabled={disabled}
        />
        Mostrar nombre de la empresa
      </label>
      {value.showCompany ? (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-elevated px-4 py-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="size-10 rounded-md object-contain"
            />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-md bg-surface-subtle text-small text-ink-secondary">
              —
            </span>
          )}
          <p className="text-body text-ink">{companyName || "Tu empresa"}</p>
        </div>
      ) : null}
    </div>
  );
}
