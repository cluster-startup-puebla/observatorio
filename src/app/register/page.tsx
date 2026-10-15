import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/landing/sections/register-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Reserva tu lugar",
  description: "La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <AuthShell
      kicker="Levantamiento de necesidades"
      title="Reserva tu lugar"
      lead="La sesión de tu sector. Sin costo. Cupo de 15 a 30 empresas."
      links={
        <a href="/login" className="text-small text-link">
          ¿Ya tienes cuenta? Entra
        </a>
      }
    >
      <RegisterForm variant="page" />
    </AuthShell>
  );
}
