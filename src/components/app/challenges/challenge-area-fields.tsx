"use client";

import { CHALLENGE_AREAS, areaLabel } from "@/lib/challenges/areas";
import type { ChallengeFormState } from "./challenge-form-fields";

const field =
  "w-full rounded-lg border border-line bg-elevated px-4 py-3 text-body text-ink";

export function ChallengeAreaFields({
  value,
  onChange,
  disabled,
}: {
  value: ChallengeFormState;
  onChange: (next: ChallengeFormState) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <label className="grid gap-2 text-small">
        Área
        <select
          className={field}
          value={value.area}
          onChange={(e) => onChange({ ...value, area: e.target.value })}
          disabled={disabled}
        >
          {CHALLENGE_AREAS.map((area) => (
            <option key={area} value={area}>
              {areaLabel(area)}
            </option>
          ))}
        </select>
      </label>
      {value.area === "otro" ? (
        <label className="grid gap-2 text-small">
          Describe el área
          <input
            className={field}
            value={value.areaNote}
            onChange={(e) => onChange({ ...value, areaNote: e.target.value })}
            maxLength={160}
            placeholder="Ej. mantenimiento predictivo en horno"
            required
            disabled={disabled}
          />
        </label>
      ) : null}
    </>
  );
}
