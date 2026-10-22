import { Alert, AlertDescription } from "@/components/ui/alert";

const notices: Record<string, string> = {
  invitacion: "Escribe nombre, empresa y un correo válido.",
  correos: "Ningún correo válido.",
  repetido: "Ese correo ya está en el CRM.",
  guardar: "No se pudo guardar la invitación.",
};

export function InviteNotice({ error }: { error?: string }) {
  const notice = error ? notices[error] : "";
  if (!notice) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{notice}</AlertDescription>
    </Alert>
  );
}
