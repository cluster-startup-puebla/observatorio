import type { Metadata } from "next";
import { AuthBack } from "@/components/auth/auth-back";
import { LoginForm } from "@/components/auth/login-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Entrar",
  description: "Entra a tu cuenta del Observatorio Tecnológico de Puebla.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col px-4 py-4 sm:px-6 sm:py-6">
      <AuthBack />
      <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-2">
        <section className="band-ink flex min-h-72 flex-col justify-between rounded-3xl p-8 lg:min-h-full lg:p-12">
          <p className="font-display text-h3">Observatorio</p>
          <div>
            <p className="text-h2 text-balance">La sesión de tu sector.</p>
            <p className="band-ink-muted mt-4 max-w-sm text-body">
              Sin costo. Entras a tu cuenta cuando el acceso quede conectado.
            </p>
          </div>
        </section>
        <section className="flex flex-col justify-center rounded-3xl border border-line bg-elevated p-8 shadow-[var(--card-shadow)] lg:p-12">
          <h1 className="text-h2 text-ink">Entrar</h1>
          <div className="mt-8">
            <LoginForm />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-small">
            <a href="/recuperar" className="text-link">
              Olvidé mi contraseña
            </a>
            <a href="/register" className="text-link">
              ¿Aún no reservas? Reserva tu lugar
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
