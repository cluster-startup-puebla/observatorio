import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function RegistroAccountAlert() {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Ese correo ya tiene cuenta.{" "}
        <Link href="/login" className="font-medium underline underline-offset-2">
          Inicia sesión
        </Link>{" "}
        para apartar o ver tus sesiones.
      </AlertDescription>
    </Alert>
  );
}