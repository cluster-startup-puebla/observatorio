import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/auth/auth-split";
import { LoginForm } from "@/components/auth/login-form";
import { LoginNotice } from "@/components/auth/login-notice";
import { homeForRole } from "@/lib/auth/home";
import { readSessionAccount } from "@/lib/auth/session-account";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Entrar",
  description: "Entra a tu cuenta del Observatorio Tecnológico de Puebla.",
  path: "/login",
});

const messages: Record<string, string> = {
  correo: "Escribe un correo válido.",
  contrasena: "Usa al menos 8 caracteres.",
  credenciales: "Correo o contraseña incorrectos.",
  rol: "Esta cuenta no tiene un acceso reconocido.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; aviso?: string }>;
}) {
  const account = await readSessionAccount();
  if (account) redirect(homeForRole(account.role));

  const params = await searchParams;
  const error = params.error ? messages[params.error] : undefined;
  const notice = params.aviso === "sesion" ? "Sesión cerrada." : undefined;

  return (
    <AuthSplit
      title="La sesión de tu sector."
      lead="Entras con tu correo. Cada rol llega a su propia puerta."
    >
      <h1 className="text-h2 text-ink">Entrar</h1>
      <div className="mt-8">
        <LoginNotice notice={notice} />
        <LoginForm error={error} errorCode={params.error} />
      </div>
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-small">
        <a href="/recuperar" className="text-link">
          Olvidé mi contraseña
        </a>
        <a href="/register" className="text-link">
          ¿Aún no reservas? Reserva tu lugar
        </a>
      </div>
    </AuthSplit>
  );
}
