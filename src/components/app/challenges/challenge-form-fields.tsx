"use client";

import { DescriptionEditor } from "@/components/challenges/description-editor";
import { CHALLENGE_AREAS, areaLabel } from "@/lib/challenges/areas";

const field = "rounded-lg border border-line px-3 py-2";

export type ChallengeFormState = {
  name: string;
  area: string;
  descriptionHtml: string;
  successMetric: string;
  urgency: "" | "baja" | "media" | "alta";
  visibility: "portal" | "red";
  showCompany: boolean;
};

export function ChallengeFormFields({
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
        Nombre
        <input
          className={field}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          maxLength={80}
          required
          disabled={disabled}
        />
      </label>
      <label className="grid gap-1 text-small">
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
      <div className="grid gap-1 text-small">
        <span>Descripción</span>
        <DescriptionEditor
          value={value.descriptionHtml}
          onChange={(descriptionHtml) => onChange({ ...value, descriptionHtml })}
          disabled={disabled}
        />
      </div>
      <label className="grid gap-1 text-small">
        Meta de éxito
        <textarea
          className={field}
          value={value.successMetric}
          onChange={(e) => onChange({ ...value, successMetric: e.target.value })}
          maxLength={500}
          rows={3}
          required
          disabled={disabled}
        />
      </label>
    </div>
  );
}
