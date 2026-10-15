"use client";

import { useState } from "react";
import { controlClass, Field } from "@/components/landing/molecules/field";

type Errors = {
  password?: string;
  confirm?: string;
};

export function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};
    if (password.length < 8) nextErrors.password = "La contraseña necesita al menos 8 caracteres.";
    if (confirm.length < 8) nextErrors.confirm = "La contraseña necesita al menos 8 caracteres.";
    else if (password !== confirm) nextErrors.confirm = "Las contraseñas no coinciden.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSent(true);
  }

  if (sent) {
    return <p className="text-body text-ink">Contraseña actualizada.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field id="contrasena" label="Nueva contraseña" error={errors.password}>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "contrasena-error" : undefined}
        />
      </Field>
      <Field id="confirmar" label="Confirmar contraseña" error={errors.confirm}>
        <input
          id="confirmar"
          name="confirmar"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.confirm)}
          aria-describedby={errors.confirm ? "confirmar-error" : undefined}
        />
      </Field>
      <button type="submit" className="btn btn-primary">
        Guardar contraseña
      </button>
    </form>
  );
}
