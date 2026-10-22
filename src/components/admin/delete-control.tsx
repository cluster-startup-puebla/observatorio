"use client";

import { Trash2 } from "lucide-react";
import { SheetSubmit } from "@/components/admin/sheet-submit";
import { Button } from "@/components/ui/button";
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

export function DeleteControl({ action, label, icon }: { action: string; label: string; icon?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {icon ? (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Eliminar">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        ) : (
          <button type="button" className="text-small text-mark">
            Eliminar
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar</AlertDialogTitle>
          <AlertDialogDescription>¿Eliminar {label}?</AlertDialogDescription>
        </AlertDialogHeader>
        <form action={action} method="post">
          <input type="hidden" name="accion" value="eliminar" />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <SheetSubmit pendingLabel="Eliminando…">Sí, eliminar</SheetSubmit>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
