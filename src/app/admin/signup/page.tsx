import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/auth/auth-split";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { createFirstSuperadminAction } from "@/lib/admin-actions";
import { getDirectory } from "@/lib/memory-directory";
import { pageMetadata } from "@/lib/metadata";
import { superadminExists, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Crear superadmin",
  description: "Crea el primer superadmin del Observatorio si el sistema todavía está vacío.",
  path: "/admin/signup",
});

const messages: Record<string, string> = {
  correo: "Escribe un correo válido.",
  contrasena: "Usa al menos 8 caracteres.",
  existe: "Ese correo ya está registrado o ya hay un superadmin.",
  confirmar: "No se pudo confirmar el correo. Revisa la bandeja o inténtalo de nuevo.",
  auth: "No se pudo crear la cuenta.",
};

export default async function AdminSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const open = usesSupabaseAuth()
    ? !(await superadminExists())
    : (await getDirectory().superadminCount()) === 0;
  if (!open) redirect("/admin/login");

  const params = await searchParams;
  const error = params.error ? messages[params.error] : undefined;

  return (
    <AuthSplit
      title="El sistema todavía no tiene dueño."
      lead="El primer superadmin se crea una sola vez en Supabase. Después esta puerta se cierra."
    >
      <h1 className="text-h2 text-ink">Crear el primer superadmin</h1>
      <form action={createFirstSuperadminAction} noValidate className="mt-8 grid gap-5" data-testid="alta-superadmin">
        <Field id="correo" label="Correo">
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            className={controlClass}
            aria-invalid={params.error === "correo"}
            aria-describedby={error ? "admin-signup-error" : undefined}
          />
        </Field>
        <Field id="contrasena" label="Contraseña">
          <PasswordInput
            id="contrasena"
            name="contrasena"
            label="contraseña"
            autoComplete="new-password"
            ariaInvalid={params.error === "contrasena"}
            ariaDescribedBy={error ? "admin-signup-error" : undefined}
          />
        </Field>
        <div id="admin-signup-error">
          <FormAlert message={error} />
        </div>
        <button type="submit" className="btn btn-primary">
          Crear superadmin
        </button>
      </form>
    </AuthSplit>
  );
}
