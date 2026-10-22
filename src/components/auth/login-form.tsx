"use client";

import { useState } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/auth/password-input";
import { controlClass, Field } from "@/components/landing/molecules/field";

type Errors = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};
    if (!emailPattern.test(email.trim())) nextErrors.email = "Escribe un correo válido.";
    if (password.length < 8) nextErrors.password = "La contraseña necesita al menos 8 caracteres.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSent(true);
  }

  if (sent) {
    return (
      <div className="grid gap-4">
        <p className="text-body text-ink-secondary">
          Listo. Cuando el acceso quede conectado, entrarás a tu cuenta.
        </p>
        <Link href="/" className="text-small text-link">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <Field id="correo" label="Correo" error={errors.email}>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "correo-error" : undefined}
        />
      </Field>
      <Field id="contrasena" label="Contraseña" error={errors.password}>
        <PasswordInput
          id="contrasena"
          name="contrasena"
          label="contraseña"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          ariaInvalid={Boolean(errors.password)}
          ariaDescribedBy={errors.password ? "contrasena-error" : undefined}
        />
      </Field>
      <button type="submit" className="btn btn-primary">
        Entrar
      </button>
    </form>
  );
}
