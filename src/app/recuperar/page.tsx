import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RecoverForm } from "@/components/auth/recover-form";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Recuperar contraseña",
  description: "Pide un enlace para elegir una contraseña nueva.",
  path: "/recuperar",
});

export default async function RecoverPage() {
  await redirectIfSession("/recuperar");
  return (
    <AuthShell
      title="Recuperar contraseña"
      footer={
        <>
          <Link href="/login" className="text-link">
            Volver a entrar
          </Link>
          <Link href="/restablecer" className="text-link">
            Ver la pantalla de nueva contraseña
          </Link>
        </>
      }
    >
      <RecoverForm />
    </AuthShell>
  );
}
