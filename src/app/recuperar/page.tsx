import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RecoverForm } from "@/components/auth/recover-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Recuperar contraseña",
  description: "Pide un enlace para elegir una contraseña nueva.",
  path: "/recuperar",
});

export default function RecoverPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      footer={
        <>
          <a href="/login" className="text-link">
            Volver a entrar
          </a>
          <a href="/restablecer" className="text-link">
            Ver la pantalla de nueva contraseña
          </a>
        </>
      }
    >
      <RecoverForm />
    </AuthShell>
  );
}
