"use client";

import { DescriptionEditor } from "@/components/challenges/description-editor";
import { ChallengeAreaFields } from "./challenge-area-fields";

const field =
  "w-full rounded-lg border border-line bg-elevated px-4 py-3 text-body text-ink";

export type ChallengeFormState = {
  name: string;
  area: string;
  areaNote: string;
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
    <div className="grid gap-5 px-1">
      <label className="grid gap-2 text-small">
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
      <ChallengeAreaFields value={value} onChange={onChange} disabled={disabled} />
      <div className="grid gap-2 text-small">
        <span>Descripción</span>
        <DescriptionEditor
          value={value.descriptionHtml}
          onChange={(descriptionHtml) => onChange({ ...value, descriptionHtml })}
          disabled={disabled}
        />
      </div>
      <label className="grid gap-2 text-small">
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
