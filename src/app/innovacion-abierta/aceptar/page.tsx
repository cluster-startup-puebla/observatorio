import { AcceptForm } from "@/app/innovacion-abierta/aceptar/accept-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const instant = false;

export default async function AcceptInnovationPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; listo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const done = params.listo === "1";
  const failed = params.error === "1";
  const token = params.t?.trim() ?? "";
  const title = done ? "Ya podemos contactarte" : "Acepta que te contactemos";
  const lead = done
    ? "Quedó registrado. El Observatorio puede escribirte sobre innovación abierta."
    : "Este permiso es solo para contactarte. No publica tu empresa ni abre tu pase.";
  return (
    <AuthShell kicker="Innovación abierta" title={title} lead={lead}>
      {failed || (!done && !token) ? (
        <Alert variant="destructive">
          <AlertDescription>Este enlace no sirve. Ábrelo desde el correo que te enviamos.</AlertDescription>
        </Alert>
      ) : null}
      {!done && !failed && token ? <AcceptForm token={token} /> : null}
    </AuthShell>
  );
}
