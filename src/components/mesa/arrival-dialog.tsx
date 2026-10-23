"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const reasons: Record<string, string> = {
  "sin qr": "Ese código no tiene pase.",
  "transición inválida": "Esta persona ya registró su llegada.",
  "ya llegó": "Esta persona ya registró su llegada.",
  "Escribe el código del QR.": "No se leyó ningún pase.",
};

export function MesaArrivalDialog({
  open,
  name,
  error,
  onClose,
}: {
  open: boolean;
  name?: string;
  error?: string;
  onClose: () => void;
}) {
  const arrived = Boolean(name);
  const detail = error ? (reasons[error] ?? error) : "La asistencia quedó registrada.";

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="place-items-center text-center sm:place-items-center sm:text-center">
          {arrived ? (
            <AlertDialogTitle className="font-display text-h2 text-ink" data-testid="bienvenida">
              Bienvenida, {name}
            </AlertDialogTitle>
          ) : (
            <AlertDialogTitle className="font-display text-h2 text-ink">No se registró</AlertDialogTitle>
          )}
          {arrived ? (
            <p data-testid="estatus" className="text-body font-semibold text-ink">
              Llegó
            </p>
          ) : null}
          <AlertDialogDescription className="text-body text-ink-secondary">{detail}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction className="w-full">Seguir escaneando</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
