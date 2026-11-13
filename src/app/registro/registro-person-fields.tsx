import { controlClass, Field } from "@/components/landing/molecules/field";

type PersonValues = {
  fullName: string;
  jobTitle: string;
  email: string;
  whatsapp: string;
};

export function RegistroPersonFields({
  values,
  onChange,
}: {
  values: PersonValues;
  onChange: (patch: Partial<PersonValues>) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field id="fullName" label="Nombre">
        <input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          autoComplete="name"
          className={controlClass}
          value={values.fullName}
          onChange={(event) => onChange({ fullName: event.target.value })}
        />
      </Field>
      <Field id="jobTitle" label="Puesto">
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
      <Field id="email" label="Correo">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={controlClass}
          value={values.email}
          onChange={(event) => onChange({ email: event.target.value })}
        />
      </Field>
      <Field id="whatsapp" label="WhatsApp (opcional)">
        <input
          id="whatsapp"
          name="whatsapp"
          inputMode="numeric"
          autoComplete="tel"
          className={controlClass}
          placeholder="10 dígitos"
          value={values.whatsapp}
          onChange={(event) => onChange({ whatsapp: event.target.value })}
        />
      </Field>
    </div>
  );
}
