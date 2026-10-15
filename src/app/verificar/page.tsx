import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Revisa tu correo",
  description: "Revisa tu correo para confirmar tu cuenta del Observatorio.",
  path: "/verificar",
});

export default function VerifyPage() {
  return (
    <AuthShell
      kicker="Correo"
      title="Revisa tu correo"
      lead="Cuando el acceso quede conectado, te escribimos para confirmar la cuenta."
      footer={
        <>
          <a href="/login" className="text-link">
            Entrar
          </a>
          <a href="/register" className="text-link">
            Reservar mi lugar
          </a>
        </>
      }
    />
  );
}
