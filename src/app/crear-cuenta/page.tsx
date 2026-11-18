import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AccountForm } from "@/components/onboarding/account-form";
import { RegisterForm } from "@/components/landing/sections/register-form";
import { diagnosticDownloadParam } from "@/content/diagnostico-tmec";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { registerError } from "@/lib/organismo/register-error";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Crear cuenta",
  description: "El registro ya cerró. Con tu cuenta entras al pase y al formulario.",
  path: "/crear-cuenta",
});

export const instant = false;

const loginLink = (
  <Link href="/login" className="text-small text-link">
    ¿Ya te registraste? Inicia sesión
  </Link>
);

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function CrearCuentaPage({ searchParams }: { searchParams: Search }) {
  await redirectIfSession("/crear-cuenta");
  return (
    <Suspense
      fallback={
        <AuthShell
          kicker="Levantamiento de necesidades tecnológicas"
          title="Crea tu cuenta"
          lead="El registro ya cerró. Con tu cuenta entras al pase y al formulario."
          links={loginLink}
        />
      }
    >
      <CrearCuentaScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function CrearCuentaScreen({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const requested = Array.isArray(params.descarga) ? params.descarga[0] : params.descarga;
  const withDiagnostic = requested === diagnosticDownloadParam;
  const sector = typeof params.sector === "string" ? params.sector : undefined;
  const invitacion = typeof params.invitacion === "string" ? params.invitacion : undefined;
  const cuenta = typeof params.cuenta === "string" ? params.cuenta : undefined;
  const organismo = cuenta === "organismo";
  const error = registerError(typeof params.error === "string" ? params.error : undefined);

  return (
    <AuthShell
      kicker="Levantamiento de necesidades tecnológicas"
      title={
        withDiagnostic
          ? "Regístrate y descarga el diagnóstico"
          : organismo
            ? "Crea la cuenta de tu organismo"
            : "Crea tu cuenta"
      }
      lead={
        withDiagnostic
          ? "Creas tu cuenta y, al terminar, se descarga el análisis integral de VIA Partners."
          : "El registro ya cerró. Con tu cuenta entras al pase y al formulario."
      }
      links={loginLink}
    >
      {withDiagnostic ? (
        <Suspense>
          <RegisterForm variant="page" />
        </Suspense>
      ) : (
        <AccountForm sector={sector} cuenta={cuenta} invitacion={invitacion} error={error} />
      )}
    </AuthShell>
  );
}
