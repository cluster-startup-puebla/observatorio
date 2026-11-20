"use client";

import type { ChallengeFormState } from "./challenge-form-fields";

const field = "rounded-lg border border-line px-3 py-2";

export function ChallengeVisibilityFields({
  value,
  onChange,
  disabled,
}: {
  value: ChallengeFormState;
  onChange: (next: ChallengeFormState) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-1 text-small">
        Urgencia
        <select
          className={field}
          value={value.urgency}
          onChange={(e) =>
            onChange({
              ...value,
              urgency: e.target.value as ChallengeFormState["urgency"],
            })
          }
          disabled={disabled}
        >
          <option value="">Sin urgencia</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </label>
      <label className="grid gap-1 text-small">
        Visibilidad
        <select
          className={field}
          value={value.visibility}
          onChange={(e) =>
            onChange({
              ...value,
              visibility: e.target.value as ChallengeFormState["visibility"],
            })
          }
          disabled={disabled}
        >
          <option value="red">Solo red</option>
          <option value="portal">Portal público</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-small">
        <input
          type="checkbox"
          checked={value.showCompany}
          onChange={(e) => onChange({ ...value, showCompany: e.target.checked })}
          disabled={disabled}
        />
        Mostrar nombre de la empresa
      </label>
    </div>
  );
}
