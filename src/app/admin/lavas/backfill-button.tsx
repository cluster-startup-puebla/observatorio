"use client";

import { SheetSubmit } from "@/components/admin/sheet-submit";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function BackfillButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Barrido histórico
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Barrido de lavas</AlertDialogTitle>
          <AlertDialogDescription>
            Esto asignará lavas por hechos históricos sin duplicar. ¿Continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action="/api/admin/lavas/backfill" method="post">
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <SheetSubmit pendingLabel="Ejecutando…">Continuar</SheetSubmit>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
