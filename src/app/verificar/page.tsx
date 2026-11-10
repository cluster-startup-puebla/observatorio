import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendConfirmationForm } from "@/components/auth/resend-confirmation-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { redirectIfSession } from "@/lib/auth/redirect-if-session";
import { emailIsConfirmed } from "@/lib/auth/confirmed-email";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Revisa tu correo",
  description: "Revisa tu correo para confirmar tu cuenta del Observatorio.",
  path: "/verificar",
});

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ correo?: string }>;
}) {
  await redirectIfSession("/verificar");
  const params = await searchParams;
  const email = params.correo?.trim() ?? "";
  if (email && (await emailIsConfirmed(email))) redirect("/login?aviso=confirmado");
  return (
    <AuthShell
      kicker="Correo"
      title="Revisa tu correo"
      lead="Te enviamos un enlace para confirmar la cuenta. Ábrelo y luego entra. Si no llega, pide otro. Revisa la bandeja de correo no deseado."
      footer={
        <>
          <Link href="/login" className="text-link">
            Entrar
          </Link>
          <Link href="/register" className="text-link">
            Reservar mi lugar
          </Link>
        </>
      }
    >
      {email ? (
        <ResendConfirmationForm email={email} />
      ) : (
        <Alert>
          <AlertDescription>Entra con tu correo. Si falta confirmarlo, aquí puedes pedir otro enlace.</AlertDescription>
        </Alert>
      )}
    </AuthShell>
  );
}
