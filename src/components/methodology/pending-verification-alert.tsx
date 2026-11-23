import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PendingVerificationAlert() {
  return (
    <Alert className="max-w-xl">
      <AlertTitle>Cuenta pendiente de verificación</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>Tu cuenta está pendiente de verificación. Cuando el equipo la confirme podrás contestar el diagnóstico.</p>
        <p>
          <Link className="font-medium text-link underline-offset-4 hover:underline" href="/app/home">
            Volver al inicio
          </Link>
        </p>
      </AlertDescription>
    </Alert>
  );
}