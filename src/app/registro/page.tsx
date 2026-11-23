import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { pageMetadata } from "@/lib/metadata";
import { loadRegistroSessionId } from "@/lib/registro/resolve-session";
import { sessionIdBySlug } from "@/lib/registro/session-id-by-slug";
import { RegistroForm } from "./registro-form";

export const metadata: Metadata = pageMetadata({
  title: "Registro · DISRUPTORS 2026",
  description: "Regístrate con la invitación del Clúster. Sin cuenta previa.",
  path: "/registro",
});

export const instant = false;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function RegistroPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const sector = typeof params.sector === "string" ? params.sector : undefined;
  const invitacion = typeof params.invitacion === "string" ? params.invitacion : undefined;
  const querySesion = typeof params.sesion === "string" ? params.sesion : undefined;
  const sessionId = await loadRegistroSessionId({
    queryId: querySesion,
    lookup: sessionIdBySlug,
  });

  return (
    <AuthShell
      kicker="Invitación del Clúster de Startups e Innovación"
      title="Regístrate a DISRUPTORS 2026"
      lead="Acceso cortesía. Sin cuenta: completa el formulario y te llega el pase por correo."
      links={
        <Link href="/login" className="text-small text-link">
          ¿Ya te registraste? Inicia sesión
        </Link>
      }
    >
      {sessionId ? (
        <RegistroForm
          sector={sector}
          invitacion={invitacion}
          sessionId={sessionId}
          sourceFilter="cluster"
        />
      ) : (
        <p className="text-small text-mark">No encontramos la sesión de este registro.</p>
      )}
    </AuthShell>
  );
}
