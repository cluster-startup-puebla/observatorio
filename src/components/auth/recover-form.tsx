"use client";

import { useState } from "react";
import { controlClass, Field } from "@/components/landing/molecules/field";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RecoverForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailPattern.test(email.trim())) {
      setError("Escribe un correo válido.");
      return;
    }
    setError("");
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-body text-ink-secondary">
        Si ese correo está registrado, enviaremos un enlace para restablecer la contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field id="correo" label="Correo" error={error}>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "correo-error" : undefined}
        />
      </Field>
      <button type="submit" className="btn btn-primary">
        Enviar enlace
      </button>
    </form>
  );
}
