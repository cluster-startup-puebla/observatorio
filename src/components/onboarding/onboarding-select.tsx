import { ChevronDown } from "lucide-react";
import { controlClass, Field } from "@/components/landing/molecules/field";

export function OnboardingSelect({
  id,
  label,
  name,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  name?: string | null;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={label}>
      <div className="relative min-w-0">
        <select
          id={id}
          name={name === null ? undefined : (name ?? id)}
          required
          disabled={disabled}
          className={`${controlClass} appearance-none pr-11`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Elige una opción</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
        />
      </div>
    </Field>
  );
}
