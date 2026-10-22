import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthBack } from "@/components/auth/auth-back";
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
    <div className="flex min-h-dvh flex-col px-4 py-4 sm:px-6 sm:py-6">
      <AuthBack />
      <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-2">
        <section className="band-ink flex min-h-72 flex-col justify-between rounded-3xl p-8 lg:min-h-full lg:p-12">
          <p className="font-display text-h3">Observatorio</p>
          <div>
            <p className="text-h2 text-balance">El sistema todavía no tiene dueño.</p>
            <p className="band-ink-muted mt-4 max-w-sm text-body">
              El primer superadmin se crea una sola vez en Supabase. Después esta puerta se cierra.
            </p>
          </div>
        </section>
        <section className="flex flex-col justify-center rounded-3xl border border-line bg-elevated p-8 shadow-[var(--card-shadow)] lg:p-12">
          <h1 className="text-h2 text-ink">Crear el primer superadmin</h1>
          <form action={createFirstSuperadminAction} noValidate className="mt-8 grid gap-5" data-testid="alta-superadmin">
            <Field id="correo" label="Correo" error={params.error === "correo" ? error : undefined}>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                className={controlClass}
                aria-invalid={params.error === "correo"}
              />
            </Field>
            <Field
              id="contrasena"
              label="Contraseña"
              error={params.error === "contrasena" ? error : undefined}
            >
              <PasswordInput
                id="contrasena"
                name="contrasena"
                label="contraseña"
                autoComplete="new-password"
                ariaInvalid={params.error === "contrasena"}
                ariaDescribedBy={params.error === "contrasena" ? "contrasena-error" : undefined}
              />
            </Field>
            {error && params.error !== "correo" && params.error !== "contrasena" ? (
              <p className="text-small text-mark">{error}</p>
            ) : null}
            <button type="submit" className="btn btn-primary">
              Crear superadmin
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
