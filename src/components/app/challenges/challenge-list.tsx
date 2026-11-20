"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MyChallenge } from "@/lib/app/challenges/load-mine";
import { areaLabel, isChallengeArea } from "@/lib/challenges/areas";
import { statusLabel, visibilityLabel } from "@/lib/challenges/status";
import type { ChallengeStatus, ChallengeVisibility } from "@/lib/challenges/status";
import { HideConfirm } from "./hide-confirm";

export function ChallengeList({ rows }: { rows: MyChallenge[] }) {
  const [hidingId, setHidingId] = useState<string | null>(null);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-h2 text-ink">Retos</h1>
          <p className="mt-1 text-body text-ink-secondary">
            Publica necesidades tecnológicas de tu operación.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/challenges/new">Nuevo reto</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-body text-ink-secondary">Aún no tienes retos.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{row.name}</p>
                <p className="text-small text-ink-secondary">
                  {isChallengeArea(row.area) ? areaLabel(row.area) : row.area}
                  {" · "}
                  {statusLabel[row.status as ChallengeStatus] ?? row.status}
                  {" · "}
                  {visibilityLabel[row.visibility as ChallengeVisibility] ??
                    row.visibility}
                </p>
              </div>
              <div className="flex gap-2">
                {row.status !== "oculto" ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/app/challenges/${row.id}/edit`}>Editar</Link>
                  </Button>
                ) : null}
                {row.status !== "oculto" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setHidingId(row.id)}
                  >
                    Ocultar
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {hidingId ? (
        <HideConfirm
          open
          onOpenChange={(open) => !open && setHidingId(null)}
          challengeId={hidingId}
        />
      ) : null}
    </div>
  );
}
