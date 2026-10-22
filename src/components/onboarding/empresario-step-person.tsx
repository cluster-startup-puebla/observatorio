import { controlClass, Field } from "@/components/landing/molecules/field";

export function EmpresarioStepPerson({
  values,
  onChange,
}: {
  values: { fullName: string; jobTitle: string; whatsapp: string };
  onChange: (patch: Partial<typeof values>) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field id="fullName" label="¿Cómo te llamas?">
        <input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          className={controlClass}
          value={values.fullName}
          onChange={(event) => onChange({ fullName: event.target.value })}
        />
      </Field>
      <Field id="jobTitle" label="¿Qué puesto tienes?">
        <input
          id="jobTitle"
          name="jobTitle"
          required
          minLength={2}
          className={controlClass}
          value={values.jobTitle}
          onChange={(event) => onChange({ jobTitle: event.target.value })}
        />
      </Field>
      <Field id="whatsapp" label="WhatsApp (opcional)">
        <input
          id="whatsapp"
          name="whatsapp"
          inputMode="numeric"
          className={controlClass}
          placeholder="10 dígitos"
          value={values.whatsapp}
          onChange={(event) => onChange({ whatsapp: event.target.value })}
        />
      </Field>
    </div>
  );
}
