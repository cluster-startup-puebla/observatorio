import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { pageMetadata } from "@/lib/metadata";
import { RegistroForm } from "./registro-form";

export const metadata: Metadata = pageMetadata({
  title: "Regístrate a la sesión",
  description: "Regístrate a la sesión de tu sector. Sin cuenta.",
  path: "/registro",
});

export const instant = false;

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function RegistroPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const sector = typeof params.sector === "string" ? params.sector : undefined;
  const invitacion = typeof params.invitacion === "string" ? params.invitacion : undefined;

  return (
    <AuthShell
      kicker="Levantamiento de necesidades tecnológicas"
      title="Regístrate a la sesión"
      lead="La sesión de tu sector. Sin cuenta."
    >
      <RegistroForm sector={sector} invitacion={invitacion} />
    </AuthShell>
  );
}
