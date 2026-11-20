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
    else toast.success("Reto cerrado.");
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cerrar reto</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Seguro que deseas cerrar este reto?
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
