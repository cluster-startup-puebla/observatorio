"use client";

import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { closeChallenge } from "@/lib/app/challenges/close-challenge";

export function CloseConfirm({
  open,
  onOpenChange,
  challengeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
}) {
  async function confirm() {
    const error = await closeChallenge(challengeId);
    if (error) toast.error(error);
    else toast.success("Reto cerrado.");
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cerrar reto</AlertDialogTitle>
          <AlertDialogDescription>
            El reto dejará de estar publicado. ¿Continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Cerrar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
