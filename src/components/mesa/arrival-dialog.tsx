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

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p className="text-body text-ink">
      <span className="font-semibold">{label}. </span>
      {value}
    </p>
  );
}

export function MesaArrivalDialog({
  open,
  name,
  company,
  sector,
  invitedBy,
  error,
  onClose,
}: {
  open: boolean;
  name?: string;
  company?: string;
  sector?: string;
  invitedBy?: string;
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
              Hola, {name}
            </AlertDialogTitle>
          ) : (
            <AlertDialogTitle className="font-display text-h2 text-ink">No se registró</AlertDialogTitle>
          )}
          {arrived ? (
            <p data-testid="estatus" className="text-body font-semibold text-ink">
              Llegó
            </p>
          ) : null}
          {arrived ? (
            <div className="grid gap-1">
              <Fact label="Empresa" value={company} />
              <Fact label="Sector" value={sector} />
              <Fact label="Invitó" value={invitedBy} />
            </div>
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
