"use client";

import { useRouter } from "next/navigation";
import { AppCard } from "@/components/app/app-card";
import { ActionButton } from "@/components/ui/action-button";

export function EvaluationBanner({ show, sector }: { show: boolean; sector: string }) {
  const router = useRouter();
  if (!show) return null;
  const name = sector.trim() || "Tu sector";

  return (
    <AppCard>
      <p className="text-body leading-snug text-ink">{name} tiene un nuevo formulario para ti</p>
      <ActionButton
        type="button"
        hold
        pendingLabel="Abriendo…"
        className="mt-6 w-full sm:w-fit"
        onClick={() => router.push("/metodologia")}
      >
        Realiza tu primera evaluación
      </ActionButton>
    </AppCard>
  );
}
