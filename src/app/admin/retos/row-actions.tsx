"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { setChallengeModeration } from "@/lib/admin/retos/set-status";
import { isPortalVisible } from "@/lib/challenges/portal-filter";
import type { ChallengeStatus, ChallengeVisibility } from "@/lib/challenges/status";

export function RetoRowActions({ row }: { row: Record<string, string> }) {
  const [confirm, setConfirm] = useState<"oculto" | "publicado" | null>(null);
  const status = row.status as ChallengeStatus;
  const visibility = row.visibility as ChallengeVisibility;
  const portal = isPortalVisible({ status, visibility });

  async function apply(next: "oculto" | "publicado") {
    const error = await setChallengeModeration(row.id, next);
    if (error) toast.error(error);
    else toast.success(next === "oculto" ? "Reto oculto." : "Reto re-publicado.");
    setConfirm(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "publicado" ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirm("oculto")}>
          Ocultar
        </Button>
      ) : null}
      {status === "oculto" ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirm("publicado")}>
          Re-publicar
        </Button>
      ) : null}
      {portal ? (
        <Link className="text-small text-link" href={`/retos/${row.id}`}>
          Ver en portal
        </Link>
      ) : null}
      <AlertDialog open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "oculto" ? "Ocultar reto" : "Re-publicar reto"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "oculto"
                ? "El reto saldrá del portal. Ocultar no revierte lavas."
                : "El reto volverá a estado publicado."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirm && apply(confirm)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
