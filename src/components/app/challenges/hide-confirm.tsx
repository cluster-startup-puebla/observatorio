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
import { hideChallenge } from "@/lib/app/challenges/hide-challenge";

export function HideConfirm({
  open,
  onOpenChange,
  challengeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
}) {
  async function confirm() {
    const error = await hideChallenge(challengeId);
    if (error) toast.error(error);
    else toast.success("Reto oculto.");
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ocultar reto</AlertDialogTitle>
          <AlertDialogDescription>
            Soft delete: el reto se oculta del portal y de la red. No se borra
            de la base. ¿Continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Ocultar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
