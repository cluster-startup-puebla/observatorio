import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PendingVerificationAlert() {
  return (
    <Alert className="max-w-xl">
      <AlertTitle>Empresa pendiente de aceptación</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          El equipo del Observatorio aún no aceptó tu empresa. Cuando la acepten podrás contestar el
          diagnóstico. Esto no es la confirmación de tu correo.
        </p>
        <p>
          <Link className="font-medium text-link underline-offset-4 hover:underline" href="/app/home">
            Volver al inicio
          </Link>
        </p>
      </AlertDescription>
    </Alert>
  );
}
