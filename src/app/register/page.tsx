import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/landing/sections/register-form";
import { diagnosticDownloadParam } from "@/content/diagnostico-tmec";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Reserva tu lugar",
  description: "La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas.",
  path: "/register",
});

const loginLink = (
  <a href="/login" className="text-small text-link">
    ¿Ya tienes cuenta? Entra
  </a>
);

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <Suspense
      fallback={
        <AuthShell
          kicker="Levantamiento de necesidades"
          title="Reserva tu lugar"
          lead="La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas."
          links={loginLink}
        />
      }
    >
      <RegisterScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function RegisterScreen({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const params = await searchParams;
  const requested = Array.isArray(params.descarga) ? params.descarga[0] : params.descarga;
  const withDiagnostic = requested === diagnosticDownloadParam;

  return (
    <AuthShell
      kicker="Levantamiento de necesidades"
      title={withDiagnostic ? "Regístrate y descarga el diagnóstico" : "Reserva tu lugar"}
      lead={
        withDiagnostic
          ? "Reservas tu lugar en la sesión y, al terminar, se descarga el análisis integral de VIA Partners."
          : "La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas."
      }
      links={loginLink}
    >
      <Suspense>
        <RegisterForm variant="page" />
      </Suspense>
    </AuthShell>
  );
}
