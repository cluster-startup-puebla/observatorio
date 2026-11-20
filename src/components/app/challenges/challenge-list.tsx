"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { MyChallenge } from "@/lib/app/challenges/load-mine";
import { areaLabel, isChallengeArea } from "@/lib/challenges/areas";
import { statusLabel, visibilityLabel } from "@/lib/challenges/status";
import type { ChallengeStatus, ChallengeVisibility } from "@/lib/challenges/status";
import { ChallengeForm } from "./challenge-form";
import { emptyChallengeForm, formFromRow } from "./challenge-defaults";
import { CloseConfirm } from "./close-confirm";

export function ChallengeList({ rows }: { rows: MyChallenge[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<MyChallenge | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-h2 text-ink">Retos</h1>
          <p className="mt-1 text-body text-ink-secondary">
            Publica necesidades tecnológicas de tu operación.
          </p>
        </div>
        <Button type="button" onClick={() => setCreating(true)}>
          Nuevo reto
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-body text-ink-secondary">Aún no tienes retos.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium text-ink">{row.name}</p>
                <p className="text-small text-ink-secondary">
                  {isChallengeArea(row.area) ? areaLabel(row.area) : row.area}
                  {" · "}
                  {statusLabel[row.status as ChallengeStatus] ?? row.status}
                  {" · "}
                  {visibilityLabel[row.visibility as ChallengeVisibility] ?? row.visibility}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing(row)}>
                  Editar
                </Button>
                {row.status === "publicado" ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => setClosingId(row.id)}>
                    Cerrar
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      {creating ? (
        <ChallengeForm
          open
          onOpenChange={setCreating}
          initial={emptyChallengeForm()}
        />
      ) : null}
      {editing ? (
        <ChallengeForm
          key={editing.id}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          initial={formFromRow(editing)}
          challengeId={editing.id}
          status={editing.status}
        />
      ) : null}
      {closingId ? (
        <CloseConfirm open onOpenChange={(open) => !open && setClosingId(null)} challengeId={closingId} />
      ) : null}
    </div>
  );
}
