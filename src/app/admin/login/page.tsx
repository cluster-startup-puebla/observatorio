import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/auth/auth-split";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { controlClass, Field } from "@/components/landing/molecules/field";
import { loginSuperadminAction } from "@/lib/admin-actions";
import { homeForRole } from "@/lib/auth/home";
import { readSessionAccount } from "@/lib/auth/session-account";
import { getDirectory } from "@/lib/memory-directory";
import { pageMetadata } from "@/lib/metadata";
import { superadminExists, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Entrar al panel",
  description: "Entra con la cuenta de superadmin del Observatorio.",
  path: "/admin/login",
});

const messages: Record<string, string> = {
  correo: "Escribe un correo válido.",
  contrasena: "Usa al menos 8 caracteres.",
  credenciales: "Correo o contraseña incorrectos.",
  rol: "Esta entrada es solo del superadmin.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const open = usesSupabaseAuth()
    ? !(await superadminExists())
    : (await getDirectory().superadminCount()) === 0;
  if (open) redirect("/admin/signup");

  const account = await readSessionAccount();
  if (account?.role === "superadmin") redirect("/admin");
  if (account) redirect(homeForRole(account.role));

  const params = await searchParams;
  const error = params.error ? messages[params.error] : undefined;

  return (
    <AuthSplit
      title="Entra al panel."
      lead="Esta puerta es del superadmin. El alta pública no puede elegir este rol."
    >
      <h1 className="text-h2 text-ink">Entrar</h1>
      <form action={loginSuperadminAction} noValidate className="mt-8 grid gap-5" data-testid="login-superadmin">
        <Field id="correo" label="Correo">
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            className={controlClass}
            aria-invalid={params.error === "correo"}
            aria-describedby={error ? "admin-login-error" : undefined}
          />
        </Field>
        <Field id="contrasena" label="Contraseña">
          <PasswordInput
            id="contrasena"
            name="contrasena"
            label="contraseña"
            autoComplete="current-password"
            ariaInvalid={params.error === "contrasena"}
            ariaDescribedBy={error ? "admin-login-error" : undefined}
          />
        </Field>
        <div id="admin-login-error">
          <FormAlert message={error} />
        </div>
        <button type="submit" className="btn btn-primary">
          Entrar
        </button>
      </form>
    </AuthSplit>
  );
}
